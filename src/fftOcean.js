import * as THREE from 'three';

/**
 * Ocean Surface simulation ported from E:\fft-ocean-surface\fft-ocean-surface
 * Features:
 * - Multi-wave directional Gerstner displacement driven by wind speed & angle
 * - Analytical wave derivatives, surface normals & crest foam Jacobian
 * - Subsurface scattering (SSS) on wave crests
 * - Fresnel sky reflection & specular sun glints
 * - Horizon fog falloff
 */

const oceanVertexShader = `
uniform float uTime;
uniform float uHeightScale;
uniform float uChoppyScale;
uniform vec2 uWindDir;
uniform float uWindSpeed;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vFoam;

struct WaveParams {
  vec2 dir;
  float amplitude;
  float wavelength;
  float speed;
  float steepness;
};

void main() {
  vUv = uv;
  vec3 pos = position;

  // 6 Directional wave components spanning the spectrum from fft-ocean-surface
  WaveParams waves[6];
  waves[0] = WaveParams(normalize(uWindDir), 0.38 * uHeightScale, 18.0, 1.4, 0.85);
  waves[1] = WaveParams(normalize(vec2(uWindDir.x + 0.35, uWindDir.y - 0.25)), 0.24 * uHeightScale, 10.5, 1.9, 0.80);
  waves[2] = WaveParams(normalize(vec2(uWindDir.x - 0.28, uWindDir.y + 0.32)), 0.18 * uHeightScale, 6.2, 2.5, 0.75);
  waves[3] = WaveParams(normalize(vec2(uWindDir.y, -uWindDir.x)), 0.10 * uHeightScale, 3.8, 3.1, 0.70);
  waves[4] = WaveParams(normalize(vec2(-uWindDir.x + 0.2, uWindDir.y + 0.4)), 0.06 * uHeightScale, 2.1, 4.0, 0.65);
  waves[5] = WaveParams(normalize(vec2(uWindDir.x - 0.5, -uWindDir.y + 0.2)), 0.04 * uHeightScale, 1.3, 4.8, 0.60);

  vec3 displaced = pos;
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);
  float jacobian = 1.0;

  for (int i = 0; i < 6; i++) {
    float k = 6.2831853 / waves[i].wavelength;
    float c = sqrt(9.8 / k) * waves[i].speed * (uWindSpeed * 0.05);
    vec2 d = waves[i].dir;
    float phase = k * dot(d, pos.xz) - c * uTime;
    float a = waves[i].amplitude;
    float q = waves[i].steepness / (k * a * 6.0 + 0.001);

    displaced.x -= d.x * (q * a * sin(phase)) * uChoppyScale;
    displaced.y += a * cos(phase);
    displaced.z -= d.y * (q * a * sin(phase)) * uChoppyScale;

    float cosP = cos(phase);
    float sinP = sin(phase);

    tangent.x -= q * d.x * d.x * a * k * cosP;
    tangent.y += d.x * a * k * sinP;
    tangent.z -= q * d.x * d.y * a * k * cosP;

    binormal.x -= q * d.x * d.y * a * k * cosP;
    binormal.y += d.y * a * k * sinP;
    binormal.z -= q * d.y * d.y * a * k * cosP;

    jacobian -= (q * a * k * cosP) * 0.4;
  }

  vec3 norm = normalize(cross(binormal, tangent));
  vNormal = norm;
  vFoam = clamp((1.0 - jacobian) * 1.8, 0.0, 1.0);

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const oceanFragmentShader = `
uniform vec3 uCameraPosition;
uniform vec3 uSunDirection;
uniform float uFoamScale;
uniform float uWorldSize;
uniform float uOpacity;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vFoam;

// Sky color reflection matching E:\\fft-ocean-surface\\fft-ocean-surface\\sky.wgsl
vec3 skyColor(vec3 dir, vec3 sunDir) {
  vec3 d = normalize(dir);
  vec3 sun = normalize(sunDir);

  float up = clamp(d.y, 0.0, 1.0);
  vec3 horizon = vec3(0.55, 0.68, 0.85);
  vec3 zenith = vec3(0.08, 0.18, 0.38);
  vec3 col = mix(horizon, zenith, pow(up, 0.6));

  float band = exp(-abs(d.y) * 7.0);
  col += vec3(0.25, 0.18, 0.12) * band;
  float below = clamp(-d.y, 0.0, 1.0);
  col = mix(col, vec3(0.08, 0.12, 0.18), below * 0.75);

  float m = max(dot(d, sun), 0.0);
  col += vec3(1.35, 0.82, 0.44) * pow(m, 12.0) * 0.35;
  col += vec3(1.5, 0.95, 0.62) * pow(m, 170.0) * 1.2;
  float disk = smoothstep(0.9993, 0.9997, m);
  col += vec3(1.7, 1.25, 0.8) * disk * 3.5;

  return col;
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(uCameraPosition - vWorldPosition);
  vec3 sun = normalize(uSunDirection);
  float dist = length(uCameraPosition - vWorldPosition);

  // Fresnel reflection
  vec3 r = reflect(-v, n);
  vec3 refl = skyColor(r, uSunDirection);
  float f0 = 0.02;
  float fres = f0 + (1.0 - f0) * pow(1.0 - max(dot(n, v), 0.0), 5.0);

  // Water body colors
  float facing = max(dot(n, v), 0.0);
  vec3 deep = vec3(0.003, 0.026, 0.058);
  vec3 shallow = vec3(0.035, 0.165, 0.22);
  vec3 water = mix(deep, shallow, pow(facing, 0.5));

  // Subsurface scattering on wave crests
  float crest = clamp(vWorldPosition.y * 0.25 + 0.45, 0.0, 1.0);
  float sss = pow(max(dot(v, -sun), 0.0), 3.0) * crest;
  water += vec3(0.85, 0.42, 0.18) * sss * 0.75;

  float fresW = mix(0.04, 0.94, fres);
  vec3 col = mix(water, refl, fresW);

  // Specular sun highlight
  vec3 h = normalize(sun + v);
  float spec = pow(max(dot(n, h), 0.0), 450.0);
  col += vec3(1.8, 1.35, 0.82) * spec * 3.8;

  // Wave foam on crests
  float foamFactor = smoothstep(uFoamScale, uFoamScale * 0.35, 1.0 - vFoam);
  vec3 foamCol = vec3(0.96, 0.93, 0.89);
  col = mix(col, foamCol, foamFactor * 0.85);

  // Horizon distance fog
  vec3 dir = normalize(vWorldPosition - uCameraPosition);
  vec3 horizonCol = skyColor(normalize(vec3(dir.x, 0.04, dir.z)), uSunDirection);
  float fog = smoothstep(uWorldSize * 0.32, uWorldSize * 0.58, dist);
  col = mix(col, horizonCol, fog);

  gl_FragColor = vec4(col, uOpacity);
}
`;

export class FftOcean {
  constructor() {
    this.worldSize = 380.0;
    this.windAngle = 18.0; // deg
    this.windSpeed = 24.0;

    const rad = (this.windAngle * Math.PI) / 180.0;
    this.windDir = new THREE.Vector2(Math.cos(rad), Math.sin(rad));
    this.sunDirection = new THREE.Vector3(-0.724, 0.22, -0.684).normalize();

    this.uniforms = {
      uCameraPosition: { value: new THREE.Vector3() },
      uSunDirection: { value: this.sunDirection },
      uTime: { value: 0.0 },
      uHeightScale: { value: 0.38 },
      uChoppyScale: { value: 0.65 },
      uFoamScale: { value: 0.45 },
      uWindDir: { value: this.windDir },
      uWindSpeed: { value: this.windSpeed },
      uWorldSize: { value: this.worldSize },
      uOpacity: { value: 1.0 }
    };

    // Dense grid for fluid wave tessellation
    const geometry = new THREE.PlaneGeometry(this.worldSize, this.worldSize, 220, 220);
    geometry.rotateX(-Math.PI / 2);

    this.material = new THREE.ShaderMaterial({
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'fft_ocean_surface';
    this.mesh.position.y = -2.25; // Directly below crystal
    this.mesh.renderOrder = -10;
    this.mesh.visible = false;
  }

  setVisible(visible) {
    this.mesh.visible = Boolean(visible);
  }

  update(time, camera) {
    if (!this.mesh.visible) return;
    this.uniforms.uTime.value = time * 0.85;
    if (camera) {
      this.uniforms.uCameraPosition.value.copy(camera.position);
      // Keep ocean centered horizontally under camera
      this.mesh.position.x = camera.position.x;
      this.mesh.position.z = camera.position.z;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
