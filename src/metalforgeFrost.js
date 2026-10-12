import * as THREE from 'three';

// Advanced MetalForge Frost & Laser Advection Simulation Shader
const frostSimulationShader = {
  uniforms: {
    tBuffer: { value: null },
    tAdvect: { value: null },
    uSplatCoords: { value: new THREE.Vector2(-999, -999) },
    uSplatPrevCoords: { value: new THREE.Vector2(-999, -999) },
    uSplatRadius: { value: 0 },
    uWaveSpeed: { value: 2.3 },
    uDecay: { value: 0.988 },
    uAdvectStrength: { value: 1.3 }
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
    uniform float uWaveSpeed;
    uniform float uDecay;
    uniform float uAdvectStrength;

    float line(vec2 uv, vec2 point1, vec2 point2) {
      vec2 pa = uv - point1, ba = point2 - point1;
      float denom = dot(ba, ba);
      if (denom < 1e-6) return length(pa);
      float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
      return length(pa - ba * h);
    }

    void main() {
      vec2 uv = vUv;
      float resolution = 512.0;
      vec2 invResolution = 1.0 / vec2(resolution);

      // 1. Turbulent advection by vector noise field (advect.png)
      // Creates curling, organic crystalline tendrils instead of sterile circles
      vec2 advect = (texture2D(tAdvect, vUv * 3.0).xy * 2.0 - 1.0) * uAdvectStrength;
      uv += advect * invResolution;

      // 2. Wave propagation outward across crystalline surface (8-tap isotropic dilation)
      vec2 offset = invResolution * uWaveSpeed;
      float l = texture2D(tBuffer, uv - vec2(offset.x, 0.0)).r;
      float r = texture2D(tBuffer, uv + vec2(offset.x, 0.0)).r;
      float t = texture2D(tBuffer, uv + vec2(0.0, offset.y)).r;
      float b = texture2D(tBuffer, uv - vec2(0.0, offset.y)).r;
      float d1 = texture2D(tBuffer, uv + vec2(offset.x, offset.y) * 0.707).r;
      float d2 = texture2D(tBuffer, uv + vec2(-offset.x, offset.y) * 0.707).r;
      float d3 = texture2D(tBuffer, uv + vec2(offset.x, -offset.y) * 0.707).r;
      float d4 = texture2D(tBuffer, uv + vec2(-offset.x, -offset.y) * 0.707).r;
      float prevVal = texture2D(tBuffer, uv).r;
      float nextVal = max(max(max(max(l, r), max(t, b)), max(max(d1, d2), max(d3, d4))), prevVal);

      // 3. Continuous linear stroke injection (only when mouse is actively moving)
      float splat = 0.0;
      if (uSplatCoords.x >= 0.0 && uSplatCoords.y >= 0.0 && uSplatPrevCoords.x >= 0.0) {
        float radius = mix(0.065, 0.12, smoothstep(0.02, 0.6, uSplatRadius));
        vec2 p1 = uSplatPrevCoords;
        vec2 p2 = uSplatCoords;
        float dX = p2.x - p1.x;
        if (dX > 0.5) p1.x += 1.0;
        else if (dX < -0.5) p2.x += 1.0;

        float distToStroke = min(
          line(vUv, p1, p2),
          min(line(vUv + vec2(1.0, 0.0), p1, p2), line(vUv - vec2(1.0, 0.0), p1, p2))
        );
        float s = clamp(1.0 - distToStroke / max(radius, 0.001), 0.0, 1.0);
        splat = s * s * (3.0 - 2.0 * s); // Smooth Hermite profile for solid, vivid pulse
      }
      nextVal += splat * 1.35;

      // 4. Natural exponential frost decay (exponential heat diffusion)
      nextVal *= uDecay;
      nextVal = min(nextVal, 1.0);

      // 5. Advancing wavefront crest rim calculation (scaled to full [0, 1] range)
      float rawDiff = max(0.0, nextVal - prevVal);
      float rim = clamp(rawDiff * 3.8, 0.0, 1.0);

      gl_FragColor = vec4(nextVal, rim, 0.0, 1.0);
    }
  `
};

export class MetalForgeMouseFrost {
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

    // Orthographic quad for ping-pong advection simulation
    this.quadScene = new THREE.Scene();
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Neutral default 1x1 advection texture
    const neutralTex = new THREE.DataTexture(new Uint8Array([128, 128, 0, 255]), 1, 1, THREE.RGBAFormat);
    neutralTex.needsUpdate = true;

    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(frostSimulationShader.uniforms),
      vertexShader: frostSimulationShader.vertexShader,
      fragmentShader: frostSimulationShader.fragmentShader,
      depthTest: false,
      depthWrite: false
    });
    this.material.uniforms.tAdvect.value = neutralTex;
    if (options.waveSpeed !== undefined) this.material.uniforms.uWaveSpeed.value = options.waveSpeed;
    if (options.decay !== undefined) this.material.uniforms.uDecay.value = options.decay;
    if (options.advectStrength !== undefined) this.material.uniforms.uAdvectStrength.value = options.advectStrength;

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
    this.splatActive = false;
    this.splatHasNewMove = false;
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
    this.splatActive = true;
    this.splatHasNewMove = true;
    this.splatLastMoveTime = performance.now() * 0.001;
  }

  onPointerHover() {
    this.splatHovered = true;
    this.splatActive = true;
  }

  onPointerLeave() {
    this.splatActive = false;
    this.splatPosition.set(-999, -999);
    this.splatLastPosition.set(-999, -999);
    this.splatTargetVelocity = 0;
    this.splatVelocity = 0;
    this.splatHasNewMove = false;
  }

  update(time = performance.now() * 0.001) {
    if (time - this.splatLastRenderTime < 0.015) return;
    this.splatLastRenderTime = time;

    if (this.splatActive && this.splatPosition.x >= 0 && this.splatPosition.y >= 0) {
      if (this.splatLastPosition.x < 0 || this.splatHovered) {
        this.splatLastPosition.copy(this.splatPosition);
        this.splatHovered = false;
        this.splatTargetVelocity = 0.4;
        this.soundVelocity = 0.45;
        this.splatLastMoveTime = time;
      }

      let dist = this.splatPosition.distanceTo(this.splatLastPosition);
      const dt = time - this.splatLastMoveTime;

      if (dist > 0.0008) {
        this.splatLastMoveTime = time;
        if (dist > 0.4) {
          this.splatLastPosition.copy(this.splatPosition);
          dist = 0;
        } else {
          this.splatTargetVelocity += dist * 16.0;
          this.soundVelocity += dist * 8.0;
        }
      }

      this.splatTargetVelocity *= 0.88;
      this.splatTargetVelocity = THREE.MathUtils.clamp(this.splatTargetVelocity, 0, 1);
      this.splatVelocity = THREE.MathUtils.lerp(this.splatVelocity, this.splatTargetVelocity, 0.35);

      this.soundVelocity *= 0.95;
      this.soundVelocity = THREE.MathUtils.clamp(this.soundVelocity, 0, 1);

      // Active linear stroke ribbon if moved recently and has displacement
      if (dt < 0.075 && (dist > 0.0004 || this.splatHasNewMove)) {
        this.material.uniforms.uSplatCoords.value.copy(this.splatPosition);
        this.material.uniforms.uSplatPrevCoords.value.copy(this.splatLastPosition);
        this.material.uniforms.uSplatRadius.value = Math.max(0.28, this.splatVelocity);
        this.splatLastPosition.copy(this.splatPosition);
        this.splatHasNewMove = false;
      } else {
        // Idle/stationary hover: stop injecting ink so the wave naturally propagates & fades without hot-spotting
        this.material.uniforms.uSplatCoords.value.set(-999, -999);
        this.material.uniforms.uSplatPrevCoords.value.set(-999, -999);
        this.material.uniforms.uSplatRadius.value = 0;
        this.splatLastPosition.copy(this.splatPosition);
      }
    } else {
      this.splatTargetVelocity = 0;
      this.splatVelocity = THREE.MathUtils.lerp(this.splatVelocity, 0, 0.1);
      this.soundVelocity = 0;
      this.material.uniforms.uSplatCoords.value.set(-999, -999);
      this.material.uniforms.uSplatPrevCoords.value.set(-999, -999);
      this.material.uniforms.uSplatRadius.value = 0;
    }

    // Ping-pong render simulation pass
    const currentTarget = this.renderer.getRenderTarget();
    this.material.uniforms.tBuffer.value = this.finalRT.texture;

    this.finalRT = this.finalRT === this.rts[0] ? this.rts[1] : this.rts[0];
    this.renderer.setRenderTarget(this.finalRT);
    this.renderer.render(this.quadScene, this.quadCamera);
    this.renderer.setRenderTarget(currentTarget);
  }

  clear() {
    this.splatActive = false;
    this.splatHasNewMove = false;
    this.splatPosition.set(-999, -999);
    this.splatLastPosition.set(-999, -999);
    this.splatVelocity = 0;
    this.splatTargetVelocity = 0;
    this.soundVelocity = 0;
    const currentTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.rts[0]);
    this.renderer.clear(true, true, true);
    this.renderer.setRenderTarget(this.rts[1]);
    this.renderer.clear(true, true, true);
    this.renderer.setRenderTarget(currentTarget);
  }

  dispose() {
    this.rts.forEach(rt => rt.dispose());
    this.quadMesh.geometry.dispose();
    this.material.dispose();
  }
}

export { MetalForgeMouseFrost as MouseFrost };
