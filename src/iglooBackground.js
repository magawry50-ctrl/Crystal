import * as THREE from 'three';
import { loadKTX2Texture } from './iglooLoader.js';

const bgVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Photorealistic Polar Atmosphere: Soft Atmospheric Horizon, Ground Ice Shelf, Rolling Volumetric Fog Banks & Depth
const bgFragmentShader = `
varying vec2 vUv;

uniform float uProgress;
uniform float uTime;
uniform float uAspect;
uniform float uHorizonY;
uniform vec3 uSkyColor;
uniform vec3 uHorizonColor;
uniform vec3 uGroundColor;
uniform vec3 uMistColor;
uniform vec3 uSunColor;
uniform float uFogDensity;
uniform float uSunIntensity;
uniform sampler2D tPerlin;
uniform sampler2D tDotPattern;
uniform float uHasPerlin;
uniform float uHasDotTex;

float hash12(vec2 p) {
  vec3 p3  = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  float aspect = max(uAspect, 0.001);
  vec2 screenCoord = vec2(uv.x * aspect, uv.y);

  // Time & drifting arctic wind
  float t = uTime * 0.055;
  float scrollY = uProgress * 0.12;

  // 1. Precise Horizon & Atmospheric Perspective (الأفق وامتداد المنظور)
  float horizon = uHorizonY + scrollY * 0.15;
  float distToHorizon = uv.y - horizon;

  vec3 baseAtmosphere;
  if (distToHorizon >= 0.0) {
    // Sky Dome: Gradient from the luminous horizon up into the deep zenith
    float skyT = clamp(distToHorizon / max(0.001, 1.0 - horizon), 0.0, 1.0);
    skyT = pow(skyT, 0.72);
    baseAtmosphere = mix(uHorizonColor, uSkyColor, skyT);

    // Atmospheric Rayleigh/Mie scattering above horizon
    float skyScatter = exp(-distToHorizon * 5.2);
    baseAtmosphere = mix(baseAtmosphere, uHorizonColor * 1.05, skyScatter * 0.35);
  } else {
    // Ground Ice Shelf: Receding polar ice plains
    float groundT = clamp(-distToHorizon / max(0.001, horizon), 0.0, 1.0);
    groundT = pow(groundT, 0.8);
    baseAtmosphere = mix(uHorizonColor, uGroundColor, groundT);

    // Perspective depth compression on the ground
    float pDepth = 1.0 / max(0.015, -distToHorizon * 3.8);
    float iceTexture = 0.5 + 0.5 * sin(pDepth * 1.8 + screenCoord.x * pDepth * 0.35);
    baseAtmosphere += (uHorizonColor - uGroundColor) * (iceTexture - 0.5) * 0.08 * exp(distToHorizon * 6.0);

    // Distant horizon ice-haze blending ground into sky seamlessly
    float groundHaze = exp(distToHorizon * 6.0);
    baseAtmosphere = mix(baseAtmosphere, uHorizonColor, groundHaze * 0.55);
  }

  // Luminous Arctic Horizon Band (شريط الأفق المضيء)
  float horizonBand = exp(-abs(distToHorizon) * 8.5);
  float horizonBloom = exp(-abs(distToHorizon) * 2.8);
  baseAtmosphere += uHorizonColor * (horizonBand * 0.25 + horizonBloom * 0.15) * uSunIntensity;

  // 2. Rolling Volumetric Fog & Polar Mist Banks (الضباب السطحي المتدحرج والغيوم القطبية)
  float mist = 0.5;
  if (uHasPerlin > 0.5) {
    // Low-altitude heavy rolling fog bank
    vec2 mistUv1 = screenCoord * 0.35 + vec2(-t * 0.6, t * 0.08 - scrollY * 0.25);
    float m1 = texture2D(tPerlin, mistUv1).r;

    // Mid-altitude turbulent curling vapour
    vec2 mistUv2 = screenCoord * 0.72 + vec2(t * 0.38, -t * 0.24 + scrollY * 0.12);
    float m2 = texture2D(tPerlin, mistUv2).r;

    // Slow ambient distant mountain haze
    vec2 mistUv3 = screenCoord * 0.16 + vec2(-t * 0.15, t * 0.04);
    float m3 = texture2D(tPerlin, mistUv3).r;

    mist = m1 * 0.48 + m2 * 0.34 + m3 * 0.18;
  }

  // Dense polar inversion fog hugging the horizon and lower ground
  float fogHaze = smoothstep(-0.25, 0.0, distToHorizon) * smoothstep(0.40, 0.0, distToHorizon);
  float rollingClouds = smoothstep(0.3, 0.75, mist) * fogHaze;
  float totalFog = (fogHaze * 0.5 + rollingClouds * 0.5) * uFogDensity;

  // Composite volumetric mist into the atmosphere
  vec3 finalColor = mix(baseAtmosphere, uMistColor, totalFog * 0.45);

  // 3. Volumetric Sun Shaft / Backlight behind Crystal (العمق، هالة الشمس، والعمق الحجمي)
  vec2 sunCenter = vec2(0.5 * aspect, 0.47);
  float distToSun = length(screenCoord - sunCenter);

  // Broad ambient halo
  float sunHalo = exp(-distToSun * 1.5);
  // Soft brilliant core bloom
  float sunCore = exp(-distToSun * 4.0);
  // Subtle atmospheric sunbeams radiating through mist
  float sunAngle = atan(screenCoord.y - sunCenter.y, screenCoord.x - sunCenter.x);
  float sunBeams = 0.7 + 0.3 * cos(sunAngle * 10.0 + t * 0.4);

  vec3 sunLight = uSunColor * (sunHalo * 0.35 + sunCore * 0.45) * sunBeams * uSunIntensity;
  finalColor += sunLight * (0.6 + totalFog * 0.25);

  // Polar Vignette: Corners fall off gracefully into deep arctic twilight
  float vignette = smoothstep(1.4 * aspect * 0.68, 0.3, distToSun);
  finalColor *= mix(0.76, 1.0, vignette);

  // 4. Diamond Dust & Polar Twinkling Grid (بلورات الجليد المتلألئة المعلقة)
  vec2 dotUv = screenCoord * 26.0;
  dotUv += vec2(0.0, -uProgress * 6.0);
  float dots = 0.0;
  if (uHasDotTex > 0.5) {
    dots = texture2D(tDotPattern, dotUv).r;
  } else {
    vec2 localCell = fract(dotUv) - 0.5;
    dots = smoothstep(0.04, 0.01, length(localCell));
  }

  float dotId = hash12(floor(dotUv));
  float twinkle = 1.0 - abs(fract(dotId + uTime * 0.12) - 0.5) * 2.0;
  twinkle = pow(twinkle, 2.2);
  float diamondDust = dots * twinkle * 0.5 * (0.25 + sunHalo * 0.5) * uSunIntensity;
  finalColor += diamondDust * uSunColor * 0.8;

  // 5. Film Dither
  float dither = (hash21(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.008;
  finalColor += vec3(dither);
  finalColor = clamp(finalColor, vec3(0.0), vec3(0.96));

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export class IglooBackground {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.progress = 0;
    this.themeMode = 'dark';

    // Full screen triangle geometry
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -1, -1, 0,
       3, -1, 0,
      -1,  3, 0
    ]);
    const uvs = new Float32Array([
      0, 0,
      2, 0,
      0, 2
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    this.uniforms = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uHorizonY: { value: 0.40 },
      uSkyColor: { value: new THREE.Color('#0a1120') },
      uHorizonColor: { value: new THREE.Color('#243b5e') },
      uGroundColor: { value: new THREE.Color('#0e1828') },
      uMistColor: { value: new THREE.Color('#385c88') },
      uSunColor: { value: new THREE.Color('#4d7bad') },
      uFogDensity: { value: 1.0 },
      uSunIntensity: { value: 1.0 },
      tPerlin: { value: null },
      uHasPerlin: { value: 0.0 },
      tDotPattern: { value: null },
      uHasDotTex: { value: 0.0 }
    };

    // Load authentic textures
    const texLoader = new THREE.TextureLoader();
    texLoader.load('/assets/perlin-datatexture.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      this.uniforms.tPerlin.value = tex;
      this.uniforms.uHasPerlin.value = 1.0;
    });

    if (this.renderer) {
      loadKTX2Texture('/assets/cubes/dot_pattern.ktx2', this.renderer).then(tex => {
        if (tex) {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          this.uniforms.tDotPattern.value = tex;
          this.uniforms.uHasDotTex.value = 1.0;
        }
      }).catch(() => {});
    }

    this.material = new THREE.ShaderMaterial({
      vertexShader: bgVertexShader,
      fragmentShader: bgFragmentShader,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -100;
    this.scene.add(this.mesh);

    this.applyTheme(this.themeMode);
  }

  applyTheme(theme) {
    this.themeMode = theme;
    if (theme === 'light') {
      // Daylight Arctic Vista: Calm, clear polar sky, soft horizon, zero glare blowout
      this.uniforms.uSkyColor.value.setStyle('#9bb2cc');
      this.uniforms.uHorizonColor.value.setStyle('#c0d2e5');
      this.uniforms.uGroundColor.value.setStyle('#829bb8');
      this.uniforms.uMistColor.value.setStyle('#d0e0f0');
      this.uniforms.uSunColor.value.setStyle('#d8e6f5');
      this.uniforms.uFogDensity.value = 0.35;
      this.uniforms.uSunIntensity.value = 0.0;
    } else {
      // Polar Arctic Night: Rich deep navy sky, vibrant twilight horizon mist, dark frozen ice shelf, cyan mist
      this.uniforms.uSkyColor.value.setStyle('#0c182c');
      this.uniforms.uHorizonColor.value.setStyle('#264874');
      this.uniforms.uGroundColor.value.setStyle('#101f36');
      this.uniforms.uMistColor.value.setStyle('#3a689d');
      this.uniforms.uSunColor.value.setStyle('#4c80bc');
      this.uniforms.uFogDensity.value = 1.35;
      this.uniforms.uSunIntensity.value = 1.0;
    }
  }

  resize(width, height) {
    this.uniforms.uAspect.value = width / height;
  }

  update(time, progress = 0) {
    this.progress = progress;
    this.uniforms.uTime.value = time;
    this.uniforms.uProgress.value = progress;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
