import * as THREE from 'three';

// Authentic Frost Advection & Wave Propagation Simulation Shader (JL from igloo.inc)
const frostSimulationShader = {
  uniforms: {
    tBuffer: { value: null },
    tAdvect: { value: null },
    uSplatCoords: { value: new THREE.Vector2(-999, -999) },
    uSplatPrevCoords: { value: new THREE.Vector2(-999, -999) },
    uSplatRadius: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tBuffer;
    uniform sampler2D tAdvect;
    uniform vec2 uSplatCoords;
    uniform vec2 uSplatPrevCoords;
    uniform float uSplatRadius;

    float line(vec2 uv, vec2 point1, vec2 point2) {
      vec2 pa = uv - point1, ba = point2 - point1;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
      return length(pa - ba * h);
    }

    float cubicIn(float t) {
      return t * t * t;
    }

    void main() {
      vec2 uv = vUv;
      float resolution = 512.0;
      vec2 invResolution = 1.0 / vec2(resolution);

      // 1. Advection by turbulent noise texture
      vec2 advect = (texture2D(tAdvect, vUv * 3.0).xy * 2.0 - 1.0) * 1.0;
      uv += advect * invResolution;

      // 2. Wave propagation outward across surface
      float wavespeed = 1.0;
      vec2 offset = invResolution * wavespeed;
      float l = texture2D(tBuffer, uv - vec2(offset.x, 0.0)).r;
      float r = texture2D(tBuffer, uv + vec2(offset.x, 0.0)).r;
      float t = texture2D(tBuffer, uv + vec2(0.0, offset.y)).r;
      float b = texture2D(tBuffer, uv - vec2(0.0, offset.y)).r;
      float nextVal = max(max(max(l, r), t), b);

      // 3. Mouse touch stroke splat
      float radius = 0.065 * smoothstep(0.05, 1.0, uSplatRadius);
      float distToStroke = line(vUv, uSplatPrevCoords.xy, uSplatCoords.xy);
      float splat = cubicIn(clamp(1.0 - distToStroke / max(radius, 0.001), 0.0, 1.0));
      nextVal += splat;

      // 4. Natural frost dissipation and decay
      nextVal *= 0.985;
      nextVal = min(nextVal, 1.0);

      // 5. Frost rim calculation for luminous glow
      float rim = max(0.0, nextVal - texture2D(tBuffer, uv).r);

      gl_FragColor = vec4(nextVal, rim, 0.0, 1.0);
    }
  `
};

export class MouseFrost {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.width = options.width || 512;
    this.height = options.height || 512;

    const rtParams = {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false
    };

    this.rts = [
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams),
      new THREE.WebGLRenderTarget(this.width, this.height, rtParams)
    ];
    this.finalRT = this.rts[0];

    // Orthographic quad for full-texture simulation pass
    this.quadScene = new THREE.Scene();
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(frostSimulationShader.uniforms),
      vertexShader: frostSimulationShader.vertexShader,
      fragmentShader: frostSimulationShader.fragmentShader,
      depthTest: false,
      depthWrite: false
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.quadMesh = new THREE.Mesh(quadGeo, this.material);
    this.quadScene.add(this.quadMesh);

    this.splatPosition = new THREE.Vector2(-999, -999);
    this.splatLastPosition = new THREE.Vector2(-999, -999);
    this.splatLastMoveTime = 0;
    this.splatLastRenderTime = 0;
    this.splatTargetVelocity = 0;
    this.splatVelocity = 0;
    this.splatHovered = false;
    this.soundVelocity = 0;

    // Load advection noise map
    const texLoader = new THREE.TextureLoader();
    texLoader.load('/assets/cubes/advect.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.material.uniforms.tAdvect.value = tex;
    });
  }

  onPointerMove(uv) {
    if (!uv) return;
    this.splatPosition.copy(uv);
  }

  onPointerHover() {
    this.splatHovered = true;
  }

  update(time) {
    if (time - this.splatLastRenderTime < 0.015) return;
    this.splatLastRenderTime = time;

    let dist = this.splatPosition.distanceTo(this.splatLastPosition);
    const dt = time - this.splatLastMoveTime;

    if (dist > 0) {
      this.splatLastMoveTime = time;
    }

    if (dt > 0.15 || this.splatHovered || dist > 0.3) {
      this.splatLastPosition.copy(this.splatPosition);
      this.splatTargetVelocity = 0;
      this.soundVelocity = 0;
      dist = 0;
    }

    this.splatHovered = false;
    this.splatTargetVelocity += dist * 6.0;
    this.splatTargetVelocity *= 0.88;
    this.splatTargetVelocity = THREE.MathUtils.clamp(this.splatTargetVelocity, 0, 1);

    this.splatVelocity = THREE.MathUtils.lerp(this.splatVelocity, this.splatTargetVelocity, 0.15);
    this.soundVelocity += dist * 4.0;
    this.soundVelocity *= 0.98;
    this.soundVelocity = THREE.MathUtils.clamp(this.soundVelocity, 0, 1);

    this.material.uniforms.uSplatCoords.value.copy(this.splatPosition);
    this.material.uniforms.uSplatPrevCoords.value.copy(this.splatLastPosition);
    this.material.uniforms.uSplatRadius.value = this.splatVelocity;
    this.splatLastPosition.copy(this.splatPosition);

    // Ping-pong render
    const currentTarget = this.renderer.getRenderTarget();
    this.material.uniforms.tBuffer.value = this.finalRT.texture;

    this.finalRT = this.finalRT === this.rts[0] ? this.rts[1] : this.rts[0];
    this.renderer.setRenderTarget(this.finalRT);
    this.renderer.render(this.quadScene, this.quadCamera);
    this.renderer.setRenderTarget(currentTarget);
  }

  dispose() {
    this.rts.forEach(rt => rt.dispose());
    this.quadMesh.geometry.dispose();
    this.material.dispose();
  }
}
