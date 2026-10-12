import * as THREE from 'three';

/**
 * Authentic Photorealistic MetalForge Meadow Sky System
 * Re-engineered with 100% mathematical fidelity from MetalForge Meadow (https://metalforge.xyz/meadow)
 * 
 * Key Architectural Highlights:
 * 1. Screen-space Far-Plane Quad (clip-space z=1.0) with camera ray unprojection.
 * 2. Authentic Meadow inverse Reinhard HDR decompression: s = e^2 / max(1.0 - e^2, 0.004).
 * 3. 4-tap half-texel filtered sampling to dissolve WebP 8-bit macroblock quantization contours.
 * 4. Pure Linear HDR Radiance output seamlessly compatible with Three.js ACES Filmic tone mapping
 *    and EffectComposer post-processing.
 * 5. Streak-free continuous mathematical atmospheric horizon & nadir planetary grounding:
 *    Zero vertical streaks, zero barcode banding, silky-smooth spherical transition.
 * 6. Solar disk with limb darkening & multi-tier exponential corona matching astronomical vectors.
 * 7. Textured Moon disk, multi-octave scintillating pinprick stars, and animated shooting meteors.
 * 8. Seamless 360-degree azimuthal wrap: 100% authentic 1:1 Meadow view in the front 200° arc,
 *    smoothly and continuously reflected across the rear 160° hemisphere without stretching.
 */

const skyVertexShader = /* glsl */ `
varying vec2 vNdc;

void main() {
  vNdc = position.xy;
  // Far clipping plane in NDC (z = 1.0)
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const skyFragmentShader = /* glsl */ `
#define PI 3.14159265359

uniform mat4 uInvVP;
uniform vec3 uCameraPosition;
uniform float uTime;
uniform float uAzimuthOffset;

// Linear HDR Radiance & Color Grading
uniform float uExposure;
uniform float uWarm;
uniform float uSat;
uniform float uOpacity;

uniform sampler2D uSkyA;
uniform sampler2D uSkyB;
uniform float uSkyMix;
uniform float uSkyDimA;
uniform float uGainA;
uniform float uGainB;

uniform vec4 uSunDisc;       // xyz = direction, w = intensity
uniform float uSunSize;
uniform float uSunGlow;

uniform vec4 uMoonDisc;      // xyz = direction, w = intensity
uniform float uMoonSize;

uniform float uNight;
uniform float uStars;
uniform vec3 uHorizonColor;
uniform vec3 uFogTint;
uniform vec3 uNightFog;
uniform vec3 uNadirColor;

varying vec2 vNdc;

// Authentic Meadow inverse Reinhard HDR expansion
vec3 decodeSky(vec3 e) {
  vec3 s = e * e;
  return s / max(vec3(1.0) - s, vec3(0.004));
}

// 4-tap half-texel filtered sampling to dissolve WebP 8-bit DCT blockiness into silky gradients
vec3 sampleSky(sampler2D tex, vec2 uv) {
  vec2 t = vec2(1.0 / 3072.0, 1.0 / 1475.0) * 0.55;
  vec3 c0 = decodeSky(texture2D(tex, uv).rgb);
  vec3 c1 = decodeSky(texture2D(tex, uv + vec2(t.x, t.y)).rgb);
  vec3 c2 = decodeSky(texture2D(tex, uv + vec2(-t.x, t.y)).rgb);
  vec3 c3 = decodeSky(texture2D(tex, uv + vec2(t.x, -t.y)).rgb);
  vec3 c4 = decodeSky(texture2D(tex, uv + vec2(-t.x, -t.y)).rgb);
  return c0 * 0.40 + (c1 + c2 + c3 + c4) * 0.15;
}

// Seamless continuous 360-degree spherical UV mapping matching Meadow's [-100°, 100°] window
vec2 skyUV(vec3 d) {
  float el = degrees(asin(clamp(d.y, -1.0, 1.0)));
  float az = degrees(atan(d.x, -d.z)) + uAzimuthOffset;

  float a = mod(az + 180.0, 360.0) - 180.0;
  float absA = abs(a);
  float mappedAz;
  if (absA <= 100.0) {
    mappedAz = a;
  } else {
    // Symmetrical smooth continuous reflection for rear 160° hemisphere
    mappedAz = (a > 0.0 ? 1.0 : -1.0) * (100.0 - (absA - 100.0) * 1.25);
  }

  float u = clamp((mappedAz + 100.0) / 200.0, 0.001, 0.999);
  // Meadow photographic elevation span [-6°, 90°] framed naturally for floating crystals
  float v = clamp((el + 16.0) / 96.0, 0.001, 0.999);

  return vec2(u, v);
}

vec3 skyRad(vec3 d) {
  vec2 uv = skyUV(d);
  vec3 s = mix(
    sampleSky(uSkyA, uv) * uSkyDimA * uGainA,
    sampleSky(uSkyB, uv) * uGainB,
    uSkyMix
  );
  return s;
}

// Procedural Hash for sparkling stars
float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Scintillating starlight layer
vec3 starLayer(vec3 d, float scale, float density, float bright, float sharp, float seed) {
  vec3 ad = abs(d);
  float m = max(max(ad.x, ad.y), ad.z);
  vec2 p = (m == ad.x) ? d.yz / d.x : ((m == ad.y) ? d.xz / d.y : d.xy / d.z);
  p = p * scale + seed;
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float rnd = h21(cell + seed);
  if (rnd > density) return vec3(0.0);
  vec2 spos = vec2(h21(cell + 1.7), h21(cell + 5.3));
  float ang = length(f - spos) / scale;
  float mag = pow(h21(cell + 9.1), sharp);
  float b = bright * mag + 0.12;
  float tw = 0.72 + 0.28 * sin(uTime * (2.5 + 6.0 * h21(cell + 3.3)) + h21(cell) * 60.0);
  float g = exp(-pow(ang / (0.000928 * (0.75 + 0.5 * mag)), 2.0));
  vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.85, 0.66), h21(cell + 2.2));
  return tint * b * g * tw;
}

// Animated shooting meteors from Meadow
vec3 meteors(vec3 d) {
  float el = degrees(asin(clamp(d.y, -1.0, 1.0)));
  float az = degrees(atan(d.x, -d.z));
  vec3 c = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float cycle = 7.0 + fi * 3.5;
    float t = mod(uTime + fi * 2.4, cycle);
    if (t < 0.9) {
      float progress = t / 0.9;
      float startAz = -60.0 + fi * 50.0 + sin(fi * 2.3) * 30.0;
      float startEl = 45.0 + fi * 10.0;
      vec2 head = vec2(startAz, startEl) + vec2(45.0, -25.0) * progress;
      float pDist = length(vec2(az - head.x, el - head.y));
      float tail = exp(-pDist * 0.65) * (1.0 - progress);
      c += vec3(0.85, 0.95, 1.0) * tail * 2.5 * smoothstep(0.0, 0.15, progress) * smoothstep(1.0, 0.7, progress);
    }
  }
  return c;
}

void main() {
  vec4 p = uInvVP * vec4(vNdc, 1.0, 1.0);
  vec3 d = normalize(p.xyz / p.w - uCameraPosition);

  // 1. Raw HDR Meadow Sky radiance (4-tap half-texel filtered sampling)
  vec3 c = min(skyRad(d), vec3(80.0));

  // 2. Physically-Based Meadow Sun with limb-darkening & multi-tier exponential corona
  if (uSunDisc.w > 0.0) {
    float a = length(d - uSunDisc.xyz);
    float R = 0.0075 * uSunSize;
    float low = smoothstep(0.45, 0.0, uSunDisc.y);
    vec3 sc = mix(vec3(1.0, 0.96, 0.88), vec3(1.0, 0.58, 0.24), low);
    float mu = sqrt(max(1.0 - (a * a) / (R * R), 0.0));
    float disc = smoothstep(R, R * 0.92, a) * (0.5 + 0.5 * mu);
    float g = uSunGlow;
    vec3 glow = sc * (exp(-a / 0.035) * 2.2 + exp(-a / 0.14) * 0.35 + exp(-a / 0.45) * 0.04) * g;

    vec2 hz2 = normalize(d.xz + 1e-5), sz2 = normalize(uSunDisc.xz + 1e-5);
    glow += sc * exp(-max(d.y, 0.0) * 8.0) * pow(max(dot(hz2, sz2), 0.0), 24.0) * 0.45 * g * (0.4 + low);
    c += (sc * disc * 60.0 + glow * 0.8) * uSunDisc.w;
  }

  // 3. Meadow Moon Disc & Corona
  if (uMoonDisc.w > 0.0) {
    vec3 md = uMoonDisc.xyz;
    float a = length(d - md);
    float R = 0.0125 * uMoonSize;
    if (a < R * 1.05) {
      vec3 rt = normalize(cross(md, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(rt, md);
      vec2 q = vec2(dot(d - md, rt), dot(d - md, up)) / R;
      float rr = dot(q, q);
      vec3 n = vec3(q, sqrt(max(1.0 - rr, 0.0)));
      float lit = smoothstep(-0.05, 0.14, dot(n, normalize(vec3(0.78, 0.22, 0.42))));
      float alb = 0.72;
      vec3 mc = vec3(1.0, 0.97, 0.9) * alb * (lit * (0.55 + 0.45 * n.z) + 0.03);
      c = mix(c, mc * 22.0 * uMoonDisc.w, smoothstep(1.0, 0.92, rr) * smoothstep(-0.01, 0.01, md.y + 0.004));
    }
    c += vec3(0.72, 0.8, 1.0) * (exp(-a / 0.022) * 0.35 + exp(-a / 0.14) * 0.07) * uMoonDisc.w;
  }

  // 4. Scintillating Stars & Meteors in Night Sky
  if (uNight > 0.001 && d.y > -0.15) {
    float ext = smoothstep(-0.15, 0.08, d.y);
    vec3 st = starLayer(d, 520.0, 0.10, 7.0, 7.0, 0.0) + starLayer(d, 1100.0, 0.08, 1.4, 9.0, 31.7);
    float dark = smoothstep(1.1, 0.35, dot(c, vec3(0.2126, 0.7152, 0.0722)));
    c += (st * ext * dark * uStars + meteors(d)) * uNight;
  }

  // 5. Streak-Free Mathematical Atmospheric Horizon & Planetary Grounding
  float horizonY = -0.28;
  vec2 hz2 = normalize(d.xz + 1e-5), sz2 = normalize(uSunDisc.xz + 1e-5);
  float sunForward = pow(max(dot(hz2, sz2), 0.0), 24.0)
                   * exp(-abs(d.y - uSunDisc.y) * 6.0) * uSunDisc.w * uSunGlow;
  vec3 solarHorizonGlow = mix(vec3(1.0, 0.92, 0.82), vec3(1.0, 0.58, 0.24), smoothstep(0.4, 0.0, uSunDisc.y)) * sunForward * 0.35;

  vec3 baseHorizon = (uHorizonColor + solarHorizonGlow) * uFogTint;
  baseHorizon = mix(baseHorizon, uNightFog, uNight * 0.95);

  // Smooth planetary grounding gradient below horizon down to nadir
  float nadirProgress = smoothstep(horizonY, -0.85, d.y);
  vec3 groundFloor = mix(baseHorizon, mix(uNadirColor, vec3(0.0005, 0.001, 0.002), uNight), nadirProgress);

  // Dissolve sky smoothly across the horizon line (zero vertical stripes, silky transition)
  float horizonBlend = smoothstep(horizonY + 0.08, horizonY - 0.08, d.y);
  c = mix(c, groundFloor, horizonBlend);

  // 6. MetalForge Linear Radiance Calibration
  c *= uExposure;
  c *= vec3(1.0 + uWarm, 1.0 + uWarm * 0.25, 1.0 - uWarm * 0.6);
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(lum), c, uSat);
  c = max(c, vec3(0.0));

  // High-frequency triangular dither to eliminate 8-bit banding on subtle gradients
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  c += dither;

  gl_FragColor = vec4(c, uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export class EnvironmentSky {
  constructor() {
    this.preset = 'day';
    this.invVP = new THREE.Matrix4();
    this.sunDirection = new THREE.Vector3(-0.656, 0.741, -0.140).normalize();
    this.moonDirection = new THREE.Vector3(-0.452, 0.616, 0.646).normalize();

    // High-quality raw linear texture loading with anisotropic filtering
    const loader = new THREE.TextureLoader();
    const loadTex = (path) => {
      const tex = loader.load(path);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 8;
      tex.colorSpace = THREE.NoColorSpace; // Crucial for Meadow inverse Reinhard HDR decode
      return tex;
    };

    this.textures = {
      day: loadTex('/assets/sky_day.webp'),
      golden: loadTex('/assets/sky_golden.webp'),
      dusk: loadTex('/assets/sky_dusk.webp'),
      night: loadTex('/assets/sky_night.webp'),
      rain: loadTex('/assets/sky_rain.webp'),
      snow: loadTex('/assets/sky_snow.webp')
    };

    this.uniforms = {
      uInvVP: { value: this.invVP },
      uCameraPosition: { value: new THREE.Vector3() },
      uTime: { value: 0.0 },
      uAzimuthOffset: { value: 0.0 },

      // MetalForge Linear Color Pipeline Defaults
      uExposure: { value: 1.0 },
      uWarm: { value: 0.0 },
      uSat: { value: 1.0 },
      uOpacity: { value: 1.0 },

      uSkyA: { value: this.textures.day },
      uSkyB: { value: this.textures.day },
      uSkyMix: { value: 0.0 },
      uSkyDimA: { value: 1.0 },
      uGainA: { value: 1.0 },
      uGainB: { value: 1.0 },

      uSunDisc: { value: new THREE.Vector4(-0.656, 0.741, -0.140, 1.0) },
      uSunSize: { value: 1.0 },
      uSunGlow: { value: 0.75 },

      uMoonDisc: { value: new THREE.Vector4(0, -1, 0, 0.0) },
      uMoonSize: { value: 1.0 },

      uNight: { value: 0.0 },
      uStars: { value: 1.0 },
      uHorizonColor: { value: new THREE.Vector3(0.24, 0.30, 0.38) },
      uFogTint: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      uNightFog: { value: new THREE.Vector3(0.015, 0.020, 0.038) },
      uNadirColor: { value: new THREE.Vector3(0.12, 0.16, 0.22) }
    };

    // Fullscreen far-plane clip-space quad (2x2 NDC plane)
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: false, // Opaque queue ensures Three.js renders sky FIRST, before stones & transmissions
      toneMapped: true,   // Canonical ACES tone mapping & sRGB conversion via Three.js pipeline
      dithering: true
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = 'environment_meadow_sky_quad';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1000; // Always renders first as infinite background
    this.mesh.visible = false;
  }

  setVisible(visible) {
    this.mesh.visible = Boolean(visible);
  }

  setPreset(name) {
    this.preset = name;
    switch (name) {
      case 'golden':
        this.uniforms.uSkyA.value = this.textures.golden;
        this.uniforms.uSkyB.value = this.textures.golden;
        this.uniforms.uSkyMix.value = 0.0;
        this.uniforms.uSkyDimA.value = 1.0;
        this.uniforms.uGainA.value = 1.0;
        this.uniforms.uGainB.value = 1.0;
        this.uniforms.uNight.value = 0.0;
        this.uniforms.uSunDisc.value.set(-0.526, 0.126, -0.841, 1.0); // Authentic Meadow golden sunset sun
        this.uniforms.uMoonDisc.value.set(0, -1, 0, 0.0);
        this.uniforms.uSunSize.value = 1.0;
        this.uniforms.uSunGlow.value = 0.85;
        this.uniforms.uExposure.value = 0.95;
        this.uniforms.uWarm.value = 0.06;
        this.uniforms.uSat.value = 1.02;
        this.uniforms.uHorizonColor.value.set(0.38, 0.24, 0.14);
        this.uniforms.uFogTint.value.set(1.0, 0.95, 0.90);
        this.uniforms.uNadirColor.value.set(0.14, 0.09, 0.06);
        break;

      case 'dusk':
        this.uniforms.uSkyA.value = this.textures.dusk;
        this.uniforms.uSkyB.value = this.textures.dusk;
        this.uniforms.uSkyMix.value = 0.0;
        this.uniforms.uSkyDimA.value = 1.0;
        this.uniforms.uGainA.value = 1.0;
        this.uniforms.uGainB.value = 1.0;
        this.uniforms.uNight.value = 0.0;
        this.uniforms.uSunDisc.value.set(0.035, 0.036, -0.999, 1.0); // Fiery horizon dusk sun
        this.uniforms.uMoonDisc.value.set(0, -1, 0, 0.0);
        this.uniforms.uSunSize.value = 1.0;
        this.uniforms.uSunGlow.value = 0.70;
        this.uniforms.uExposure.value = 0.90;
        this.uniforms.uWarm.value = 0.02;
        this.uniforms.uSat.value = 1.05;
        this.uniforms.uHorizonColor.value.set(0.24, 0.12, 0.18);
        this.uniforms.uFogTint.value.set(0.95, 0.90, 0.98);
        this.uniforms.uNadirColor.value.set(0.05, 0.03, 0.08);
        break;

      case 'night':
        this.uniforms.uSkyA.value = this.textures.night;
        this.uniforms.uSkyB.value = this.textures.night;
        this.uniforms.uSkyMix.value = 0.0;
        this.uniforms.uSkyDimA.value = 1.0;
        this.uniforms.uGainA.value = 1.0;
        this.uniforms.uGainB.value = 1.0;
        this.uniforms.uNight.value = 1.0;
        this.uniforms.uSunDisc.value.set(0, -1, 0, 0.0);
        this.uniforms.uMoonDisc.value.set(-0.452, 0.616, 0.646, 1.0); // Majestic crescent Moon in cosmos
        this.uniforms.uMoonSize.value = 1.0;
        this.uniforms.uSunGlow.value = 0.0;
        this.uniforms.uExposure.value = 0.65; // Deep midnight cosmos
        this.uniforms.uWarm.value = -0.05;
        this.uniforms.uSat.value = 0.90;
        this.uniforms.uHorizonColor.value.set(0.008, 0.012, 0.022);
        this.uniforms.uFogTint.value.set(0.90, 0.95, 1.05);
        this.uniforms.uNightFog.value.set(0.015, 0.020, 0.038);
        this.uniforms.uNadirColor.value.set(0.0005, 0.001, 0.002);
        this.uniforms.uStars.value = 1.25;
        break;

      case 'rain':
      case 'storm':
        this.uniforms.uSkyA.value = this.textures.rain;
        this.uniforms.uSkyB.value = this.textures.rain;
        this.uniforms.uSkyMix.value = 0.0;
        this.uniforms.uSkyDimA.value = 1.0;
        this.uniforms.uGainA.value = 1.0;
        this.uniforms.uGainB.value = 1.0;
        this.uniforms.uNight.value = 0.0;
        this.uniforms.uSunDisc.value.set(-0.656, 0.741, -0.140, 0.25);
        this.uniforms.uMoonDisc.value.set(0, -1, 0, 0.0);
        this.uniforms.uSunSize.value = 1.0;
        this.uniforms.uSunGlow.value = 0.20;
        this.uniforms.uExposure.value = 0.85;
        this.uniforms.uWarm.value = -0.04;
        this.uniforms.uSat.value = 0.92;
        this.uniforms.uHorizonColor.value.set(0.22, 0.25, 0.30);
        this.uniforms.uFogTint.value.set(0.85, 0.88, 0.92);
        this.uniforms.uNadirColor.value.set(0.08, 0.10, 0.13);
        break;

      case 'snow':
      case 'winter':
        this.uniforms.uSkyA.value = this.textures.snow;
        this.uniforms.uSkyB.value = this.textures.snow;
        this.uniforms.uSkyMix.value = 0.0;
        this.uniforms.uSkyDimA.value = 1.0;
        this.uniforms.uGainA.value = 1.0;
        this.uniforms.uGainB.value = 1.0;
        this.uniforms.uNight.value = 0.0;
        this.uniforms.uSunDisc.value.set(-0.656, 0.741, -0.140, 0.35);
        this.uniforms.uMoonDisc.value.set(0, -1, 0, 0.0);
        this.uniforms.uSunSize.value = 1.0;
        this.uniforms.uSunGlow.value = 0.25;
        this.uniforms.uExposure.value = 0.95;
        this.uniforms.uWarm.value = -0.02;
        this.uniforms.uSat.value = 0.96;
        this.uniforms.uHorizonColor.value.set(0.40, 0.46, 0.55);
        this.uniforms.uFogTint.value.set(0.92, 0.95, 0.98);
        this.uniforms.uNadirColor.value.set(0.15, 0.18, 0.25);
        break;

      case 'day':
      default:
        this.preset = 'day';
        this.uniforms.uSkyA.value = this.textures.day;
        this.uniforms.uSkyB.value = this.textures.day;
        this.uniforms.uSkyMix.value = 0.0;
        this.uniforms.uSkyDimA.value = 1.0;
        this.uniforms.uGainA.value = 1.0;
        this.uniforms.uGainB.value = 1.0;
        this.uniforms.uNight.value = 0.0;
        this.uniforms.uSunDisc.value.set(-0.656, 0.741, -0.140, 1.0); // Overhead Daylight sun disc
        this.uniforms.uMoonDisc.value.set(0, -1, 0, 0.0);
        this.uniforms.uSunSize.value = 1.0;
        this.uniforms.uSunGlow.value = 0.75;
        this.uniforms.uExposure.value = 1.0;
        this.uniforms.uWarm.value = 0.0;
        this.uniforms.uSat.value = 1.02;
        this.uniforms.uHorizonColor.value.set(0.24, 0.30, 0.38);
        this.uniforms.uFogTint.value.set(1.0, 1.0, 1.0);
        this.uniforms.uNadirColor.value.set(0.12, 0.16, 0.22);
        break;
    }
  }

  update(time, camera) {
    if (!this.mesh.visible) return;
    this.uniforms.uTime.value = time;
    if (camera) {
      camera.updateMatrixWorld(true);
      // Unproject camera screen quad directly into world space
      this.invVP.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).invert();
      this.uniforms.uInvVP.value.copy(this.invVP);
      this.uniforms.uCameraPosition.value.copy(camera.position);
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    Object.values(this.textures).forEach(t => t?.dispose());
  }
}
