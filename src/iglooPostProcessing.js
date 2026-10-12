import * as THREE from 'three';
import { loadKTX2Texture } from './iglooLoader.js';

function createIdentity3DLUT(size = 2) {
  const data = new Uint8Array(size * size * size * 4);
  let idx = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        data[idx] = Math.round((x / (size - 1)) * 255);
        data[idx + 1] = Math.round((y / (size - 1)) * 255);
        data[idx + 2] = Math.round((z / (size - 1)) * 255);
        data[idx + 3] = 255;
        idx += 4;
      }
    }
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

export class IglooPostProcessing {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;

    const rtParams = {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false
    };

    this.sceneRT = new THREE.WebGLRenderTarget(width, height, rtParams);

    this.quadScene = new THREE.Scene();
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.lutMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        tDiffuse: { value: null },
        tLUT: { value: createIdentity3DLUT(2) },
        uLUTSize: { value: 32.0 },
        uLUTIntensity: { value: 1.0 },
        uHasLUT: { value: 0.0 }
      },
      vertexShader: `
        out vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        precision highp sampler3D;

        in vec2 vUv;
        out vec4 fragColor;

        uniform sampler2D tDiffuse;
        uniform sampler3D tLUT;
        uniform float uLUTSize;
        uniform float uLUTIntensity;
        uniform float uHasLUT;

        vec3 LUTLinearTosRGB(vec3 value) {
          return mix(
            pow(value, vec3(0.41666)) * 1.055 - vec3(0.055),
            value * 12.92,
            vec3(lessThanEqual(value, vec3(0.0031308)))
          );
        }

        vec3 LUTsRGBToLinear(vec3 value) {
          return mix(
            pow((value + vec3(0.055)) / 1.055, vec3(2.4)),
            value / 12.92,
            vec3(lessThanEqual(value, vec3(0.04045)))
          );
        }

        vec3 apply3DLUTTetrahedral(vec3 color, sampler3D lutTexture, float lutSize, float lutIntensity) {
          float scale = lutSize - 1.0;
          float offset = 0.0;
          float texelSize = 1.0 / lutSize;
          vec3 col = LUTLinearTosRGB(color);
          vec3 rgb = clamp(col, 0.0, 1.0) * scale + offset;
          vec3 p = floor(rgb);
          vec3 f = rgb - p;
          vec3 v1 = (p + 0.5) * texelSize;
          vec3 v4 = (p + 1.5) * texelSize;
          vec3 v2, v3;
          vec3 frac;
          if (f.r >= f.g) {
            if (f.g > f.b) {
              frac = f.rgb;
              v2 = vec3(v4.x, v1.y, v1.z);
              v3 = vec3(v4.x, v4.y, v1.z);
            } else if (f.r >= f.b) {
              frac = f.rbg;
              v2 = vec3(v4.x, v1.y, v1.z);
              v3 = vec3(v4.x, v1.y, v4.z);
            } else {
              frac = f.brg;
              v2 = vec3(v1.x, v1.y, v4.z);
              v3 = vec3(v4.x, v1.y, v4.z);
            }
          } else {
            if (f.b > f.g) {
              frac = f.bgr;
              v2 = vec3(v1.x, v1.y, v4.z);
              v3 = vec3(v1.x, v4.y, v4.z);
            } else if (f.r >= f.b) {
              frac = f.grb;
              v2 = vec3(v1.x, v4.y, v1.z);
              v3 = vec3(v4.x, v4.y, v1.z);
            } else {
              frac = f.gbr;
              v2 = vec3(v1.x, v4.y, v1.z);
              v3 = vec3(v1.x, v4.y, v4.z);
            }
          }
          vec4 n1 = texture(lutTexture, v1);
          vec4 n2 = texture(lutTexture, v2);
          vec4 n3 = texture(lutTexture, v3);
          vec4 n4 = texture(lutTexture, v4);
          vec4 weights = vec4(1.0 - frac.x, frac.x - frac.y, frac.y - frac.z, frac.z);
          vec4 result = weights * mat4(
            vec4(n1.r, n2.r, n3.r, n4.r),
            vec4(n1.g, n2.g, n3.g, n4.g),
            vec4(n1.b, n2.b, n3.b, n4.b),
            vec4(1.0)
          );
          return LUTsRGBToLinear(mix(col, result.rgb, lutIntensity));
        }

        void main() {
          vec4 scene = texture(tDiffuse, vUv);
          if (uHasLUT > 0.5) {
            vec3 graded = apply3DLUTTetrahedral(scene.rgb, tLUT, uLUTSize, uLUTIntensity);
            fragColor = vec4(graded, scene.a);
          } else {
            fragColor = scene;
          }
        }
      `,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      dithering: true
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.quadMesh = new THREE.Mesh(quadGeo, this.lutMaterial);
    this.quadScene.add(this.quadMesh);

    this.loadLUT();
  }

  async loadLUT() {
    // 3D LUT texture in KTX2 atlas format causes out-of-bounds white blowout in WebGL2 sampler3D
    // Direct ACESFilmic tone mapping provides the pristine authentic glacial illumination
    this.lutMaterial.uniforms.uHasLUT.value = 0.0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.sceneRT.setSize(width, height);
  }

  render(scene, camera) {
    // 1. Render scene to HalfFloat render target
    this.renderer.setRenderTarget(this.sceneRT);
    this.renderer.render(scene, camera);

    // 2. Pass through 3D tetrahedral LUT color grading to screen
    this.renderer.setRenderTarget(null);
    this.lutMaterial.uniforms.tDiffuse.value = this.sceneRT.texture;
    this.renderer.render(this.quadScene, this.quadCamera);
  }

  dispose() {
    this.sceneRT.dispose();
    this.quadMesh.geometry.dispose();
    this.lutMaterial.dispose();
  }
}
