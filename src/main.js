import * as THREE from 'three';
import {
  createThunderstone,
  GEMS,
  gemById,
  gemPresets,
  hexOf,
  intOf,
  THUNDERSTONE_DEFAULTS,
  THUNDERSTONE_PARAMS
} from './metalforgeEngine.js';
import { HUDController } from './hud.js';
import { SoundController } from './sound.js';
import { ParametersDrawer } from './parametersDrawer.js';
import { IglooExperience } from './iglooExperience.js';
import { IGLOO_STONES_DATA } from './iglooStones.js';
import { LiquidGlassEngine, LIQUID_SHAPES, LIQUID_DEFAULTS } from './liquidGlassEngine.js';
import { EnvironmentSky } from './environmentSky.js';
import { FftOcean } from './fftOcean.js';

// Gem telemetry metadata for cryogenic HUD
const GEM_METADATA = {
  pudgy: {
    name: 'Pudgy Penguins',
    code: 'PORTFOLIO_CO_01',
    teleLabel: 'TEMP',
    teleValue: 33.90,
    teleDelta: '+01.06',
    date: '01/02/2020',
    blurb: 'Cryogenic Antarctic ice boulder holding the authentic Pudgy Penguin specimen core.'
  },
  overpass: {
    name: 'Overpass',
    code: 'PORTFOLIO_CO_02',
    teleLabel: 'TEMP',
    teleValue: 30.20,
    teleDelta: '-01.00',
    date: '06/01/2023',
    blurb: 'Glacial gouged ice tablet encasing the extruded Overpass IP monogram block.'
  },
  froststone: {
    name: 'Froststone',
    code: 'GEM_FROSTSTONE',
    teleLabel: 'TEMP',
    teleValue: -42.80,
    teleDelta: '+02.80',
    date: '14.01.2024',
    blurb: 'A six-sided ice prism grown around an eternal snowflake.'
  },
  emberstone: {
    name: 'Emberstone',
    code: 'GEM_EMBERSTONE',
    teleLabel: 'TEMP',
    teleValue: 1420.50,
    teleDelta: '+12.40',
    date: '03.05.2024',
    blurb: 'A garnet cushion with a living flame that never goes out.'
  },
  moonstone: {
    name: 'Moonstone',
    code: 'GEM_MOONSTONE',
    teleLabel: 'TEMP',
    teleValue: -180.20,
    teleDelta: '-04.10',
    date: '19.07.2024',
    blurb: 'Amethyst, its base snapped off, holding a golden crescent.'
  },
  tidestone: {
    name: 'Tidestone',
    code: 'GEM_TIDESTONE',
    teleLabel: 'DEPTH',
    teleValue: 4200.00,
    teleDelta: '+50.00',
    date: '22.08.2024',
    blurb: 'A cobalt tablet with a drop of the deep sea sealed in it.'
  },
  heartstone: {
    name: 'Heartstone',
    code: 'GEM_HEARTSTONE',
    teleLabel: 'PULSE',
    teleValue: 72.00,
    teleDelta: '+02.00',
    date: '11.02.2024',
    blurb: 'Rose quartz, and a radiant ruby heart at the center.'
  },
  luckstone: {
    name: 'Luckstone',
    code: 'GEM_LUCKSTONE',
    teleLabel: 'FREQ',
    teleValue: 777.00,
    teleDelta: '+07.00',
    date: '17.03.2024',
    blurb: 'Citrine, broken off at the top, with a four-leaf clover inside.'
  },
  thunderstone: {
    name: 'Thunderstone',
    code: 'GEM_THUNDERSTONE',
    teleLabel: 'CHARGE',
    teleValue: 1.21,
    teleDelta: '+0.15',
    date: '09.09.2024',
    blurb: 'Green quartz, struck through with an electric amber bolt.'
  },
  orb: {
    name: 'Liquid Orb',
    code: 'LIQUID_ORB',
    teleLabel: 'FLOW',
    teleValue: 108.40,
    teleDelta: '+04.20',
    date: '13.09.2026',
    blurb: "The design's hero: a ball of glass that breathes. Dispersion · reflection · caustics."
  },
  strategy: {
    name: 'Strategy & Growth',
    code: 'VENTURE_STRATEGY',
    teleLabel: 'GTM_INDEX',
    teleValue: 98.40,
    teleDelta: '+14.20',
    date: '2026.Q4',
    blurb: '4 Ascending Architectural Pillars (Business Model & Revenue Strategy) · Helical GTM Spiral (Market Expansion) · Dual Interlocking Orbit with 6 Strategic Partnership Beacon Nodes.'
  },
  innovation: {
    name: 'Innovation & Products',
    code: 'VENTURE_INNOVATION',
    teleLabel: '0_TO_1_SEED',
    teleValue: 100.00,
    teleDelta: '+08.75',
    date: '2026.Q4',
    blurb: 'Luminous Central 0-to-1 Seed Core (Venture Design) · 8-Cube Modular Matrix (Product Strategy & Market Validation) · Tilted Expansion Orbits with Satellite Lunar Pods.'
  },
  systems: {
    name: 'Systems & Intelligence',
    code: 'VENTURE_SYSTEMS',
    teleLabel: 'AI_SCALE',
    teleValue: 99.98,
    teleDelta: '+03.14',
    date: '2026.Q4',
    blurb: '3 Stacked Operating Slabs (Operating Model Design) · Octahedral AI Core with Data Stream Columns · Interlocking Gyroscopic Gimbal Rings.'
  }
};

function parseUrlHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const result = {};

  for (const [key, val] of params.entries()) {
    if (key === 'dynamic' || key === 'motionDynamic') {
      result.motionDynamic = val;
    } else if (key === 'scroll' || key === 'scrollEnabled') {
      result.scrollEnabled = val === 'true' || val === '1';
    } else if (key === 'motion') {
      result.motionMode = val;
      if (val === 'revolve') result.motionDynamic = 'revolve';
      else if (val === 'scroll') {
        result.motionDynamic = 'float';
        result.scrollEnabled = true;
      }
    } else if (key === 'surfaceHover') {
      result.surfaceHover = val === 'true' || val === '1';
    } else if (key === 'sky' || key === 'skyEnabled') {
      result.skyEnabled = val === 'true' || val === '1';
    } else if (key === 'skyPreset') {
      result.skyPreset = val;
    } else if (key === 'ocean' || key === 'oceanEnabled') {
      result.oceanEnabled = val === 'true' || val === '1';
    } else if (key === 'shape') {
      result.shape = val;
      if (!result.gem) result.gem = 'orb';
    } else if (['depth', 'thickness', 'roughness', 'frostAmount', 'glow', 'symbolSize', 'symbolTurn', 'symbolSpin', 'pieces', 'chipSize', 'chipDepth', 'chipMax', 'gravity', 'charge', 'burst', 'dust', 'spin', 'bob', 'tilt', 'bloom', 'exposure', 'zoom', 'size', 'width', 'height', 'twist', 'dispersion', 'ior', 'iridescence', 'clearcoat', 'noise', 'speed', 'textSize', 'blur'].includes(key)) {
      result[key] = parseFloat(val);
    } else if (key.endsWith('Color') || key === 'bgColor' || ['tint', 'textColor', 'sky', 'haze', 'ground', 'warm'].includes(key)) {
      result[key] = val.startsWith('#') ? val : '#' + val;
    } else if (key === 'breakable' || key === 'orbit' || key === 'centre') {
      result[key] = val === 'true' || val === '1';
    } else {
      result[key] = val;
    }
  }
  return result;
}

function buildUrlHash(values) {
  const params = new URLSearchParams();
  if (values.gem) params.set('gem', values.gem);
  if (values.shape) params.set('shape', values.shape);
  if (values.motionDynamic) params.set('dynamic', values.motionDynamic);
  if (values.scrollEnabled !== undefined) params.set('scroll', values.scrollEnabled);
  if (values.surfaceHover !== undefined) params.set('surfaceHover', values.surfaceHover);
  if (values.skyEnabled !== undefined) params.set('sky', values.skyEnabled);
  if (values.skyPreset) params.set('skyPreset', values.skyPreset);
  if (values.oceanEnabled !== undefined) params.set('ocean', values.oceanEnabled);
  if (values.stoneColor) params.set('stoneColor', values.stoneColor.replace('#', ''));
  if (values.depthColor) params.set('depthColor', values.depthColor.replace('#', ''));
  if (values.wallColor) params.set('wallColor', values.wallColor.replace('#', ''));
  if (values.veilColor) params.set('veilColor', values.veilColor.replace('#', ''));
  if (values.glowColor) params.set('glowColor', values.glowColor.replace('#', ''));
  if (values.tint) params.set('tint', values.tint.replace('#', ''));
  if (values.depth !== undefined) params.set('depth', Number(values.depth).toFixed(2));
  if (values.thickness !== undefined) params.set('thickness', Number(values.thickness).toFixed(2));
  if (values.roughness !== undefined) params.set('roughness', Number(values.roughness).toFixed(2));
  if (values.frostAmount !== undefined) params.set('frostAmount', Number(values.frostAmount).toFixed(2));
  if (values.dispersion !== undefined) params.set('dispersion', Number(values.dispersion).toFixed(2));
  if (values.ior !== undefined) params.set('ior', Number(values.ior).toFixed(2));
  if (values.iridescence !== undefined) params.set('iridescence', Number(values.iridescence).toFixed(2));
  if (values.clearcoat !== undefined) params.set('clearcoat', Number(values.clearcoat).toFixed(2));
  if (values.noise !== undefined) params.set('noise', Number(values.noise).toFixed(2));
  if (values.speed !== undefined) params.set('speed', Number(values.speed).toFixed(2));
  if (values.size !== undefined) params.set('size', Number(values.size).toFixed(2));
  if (values.twist !== undefined) params.set('twist', Number(values.twist).toFixed(2));
  if (values.symbol) params.set('symbol', values.symbol);
  if (values.text) params.set('text', values.text);
  if (values.textColor) params.set('textColor', values.textColor.replace('#', ''));
  if (values.symbolColor) params.set('symbolColor', values.symbolColor.replace('#', ''));
  if (values.lightColor) params.set('lightColor', values.lightColor.replace('#', ''));
  if (values.glow !== undefined) params.set('glow', Number(values.glow).toFixed(2));
  if (values.symbolSize !== undefined) params.set('symbolSize', Number(values.symbolSize).toFixed(2));
  if (values.symbolTurn !== undefined) params.set('symbolTurn', Math.round(values.symbolTurn));
  if (values.symbolSpin !== undefined) params.set('symbolSpin', Number(values.symbolSpin).toFixed(2));
  if (values.breakable !== undefined) params.set('breakable', values.breakable);
  if (values.pieces !== undefined) params.set('pieces', Math.round(values.pieces));
  if (values.chipSize !== undefined) params.set('chipSize', Number(values.chipSize).toFixed(2));
  if (values.chipDepth !== undefined) params.set('chipDepth', Number(values.chipDepth).toFixed(2));
  if (values.chipMax !== undefined) params.set('chipMax', Math.round(values.chipMax));
  if (values.gravity !== undefined) params.set('gravity', Number(values.gravity).toFixed(1));
  if (values.charge !== undefined) params.set('charge', Number(values.charge).toFixed(2));
  if (values.burst !== undefined) params.set('burst', Number(values.burst).toFixed(1));
  if (values.dust !== undefined) params.set('dust', Number(values.dust).toFixed(2));
  if (values.spin !== undefined) params.set('spin', Number(values.spin).toFixed(2));
  if (values.bob !== undefined) params.set('bob', Number(values.bob).toFixed(2));
  if (values.tilt !== undefined) params.set('tilt', Math.round(values.tilt));
  if (values.background) params.set('background', values.background);
  if (values.bgColor) params.set('bgColor', values.bgColor.replace('#', ''));
  if (values.bloom !== undefined) params.set('bloom', Number(values.bloom).toFixed(2));
  if (values.exposure !== undefined) params.set('exposure', Number(values.exposure).toFixed(2));
  if (values.zoom !== undefined) params.set('zoom', Number(values.zoom).toFixed(2));
  if (values.orbit !== undefined) params.set('orbit', values.orbit);
  return '#' + params.toString();
}

export const DEFAULT_APP_SETTINGS = {
  depth: 1.50,
  thickness: 0.16,
  roughness: 0.50,
  frostAmount: 1.65,
  glow: 0.75,
  symbolSize: 0.64,
  symbolTurn: -55,
  symbolSpin: 0.70,
  spin: 0.25,
  bob: 0.90,
  tilt: -8,
  scrollEnabled: true,
  surfaceHover: true,
  orbit: true,
  skyEnabled: true,
  skyPreset: 'day',
  oceanEnabled: false,
  bloom: 0.10,
  exposure: 0.77,
  zoom: 0.96,
  symbolVisible: true,
  symbol: 'snowflake'
};

export const DEFAULT_LIQUID_SETTINGS = {
  gem: 'orb',
  shape: 'strategy',
  size: 1.0,
  tube: 0.12,
  dispersion: 1.25,
  ior: 1.62,
  thickness: 2.80,
  roughness: 0.08,
  iridescence: 0.11,
  clearcoat: 0.60,
  tint: '#e6f4ff',
  noise: 0.28,
  speed: 0.85,
  twist: 0.00,
  text: 'STRATEGY & GROWTH',
  textSize: 1.0,
  textColor: '#4a5157',
  motionDynamic: 'revolve',
  motionMode: 'revolve',
  spin: 0.35,
  bob: 0.15,
  tilt: -6,
  scrollEnabled: false,
  surfaceHover: true,
  orbit: false,
  skyEnabled: false,
  skyPreset: 'day',
  oceanEnabled: false,
  background: 'transparent',
  bloom: 0.32,
  exposure: 0.65,
  zoom: 1.15
};

class IglooSimulation {
  constructor() {
    this.metalforgeContainer = document.getElementById('canvas-container');
    this.iglooContainer = document.getElementById('igloo-container');
    this.liquidContainer = document.getElementById('liquid-container');
    this.sound = new SoundController();
    this.liquidEngine = null;

    const savedCustomDefaults = (() => {
      try {
        const s = localStorage.getItem('gem_custom_defaults');
        return s ? JSON.parse(s) : null;
      } catch (e) { return null; }
    })();

    const appDefaults = {
      ...DEFAULT_APP_SETTINGS,
      ...(savedCustomDefaults || {})
    };

    const savedLiquidDefaults = (() => {
      try {
        const s = localStorage.getItem('liquid_custom_defaults');
        return s ? JSON.parse(s) : null;
      } catch (e) { return null; }
    })();

    const liquidDefaults = {
      ...DEFAULT_LIQUID_SETTINGS,
      ...(savedLiquidDefaults || {})
    };

    const parsed = parseUrlHash() || {};
    const initialGemId = parsed.gem || (parsed.shape ? 'orb' : 'pudgy');
    this.activeMode = ['pudgy', 'overpass'].includes(initialGemId)
      ? 'igloo'
      : (initialGemId === 'orb' || !!LIQUID_SHAPES[initialGemId] ? 'liquid' : 'metalforge');

    const activeDefaults = (this.activeMode === 'liquid') ? liquidDefaults : appDefaults;

    this.currentThemeMode = localStorage.getItem('gem_theme_mode') || 'light';
    this.motionDynamic = parsed.motionDynamic || (this.activeMode === 'liquid' ? liquidDefaults.motionDynamic : (['pudgy', 'overpass'].includes(initialGemId) ? 'float' : 'revolve'));
    this.scrollEnabled = parsed.scrollEnabled !== undefined ? parsed.scrollEnabled : activeDefaults.scrollEnabled;
    this.surfaceHoverEnabled = parsed.surfaceHover !== undefined ? parsed.surfaceHover : activeDefaults.surfaceHover;
    this.isSkyEnabled = parsed.skyEnabled !== undefined ? parsed.skyEnabled : activeDefaults.skyEnabled;
    this.skyPreset = parsed.skyPreset || activeDefaults.skyPreset || 'day';
    this.isOceanEnabled = parsed.oceanEnabled !== undefined ? parsed.oceanEnabled : activeDefaults.oceanEnabled;
    this.currentMotionMode = this.motionDynamic === 'revolve' ? 'revolve' : 'scroll';

    // External procedural environments (Photorealistic Meadow Sky & FFT Ocean)
    this.sky = new EnvironmentSky();
    this.sky.setPreset(this.skyPreset);
    this.ocean = new FftOcean();

    // 1. Initialize 100% Authentic Igloo Glacial Engine (Pudgy Penguins & Overpass)
    this.igloo = new IglooExperience({
      container: this.iglooContainer,
      sound: this.sound,
      onStoneChange: (stoneData) => {
        this.handleIglooStoneChange(stoneData);
      },
      onOverscrollDown: () => {
        if (this.scrollEnabled) {
          this.applyGem('froststone');
        }
      },
      onOpenModal: (stoneData) => {
        this.openDossierModal(stoneData);
      },
      onCloseModal: () => {
        document.getElementById('explore-modal')?.classList.remove('active');
      }
    });
    this.igloo.setMotionDynamic(this.motionDynamic);
    this.igloo.setScrollEnabled(this.scrollEnabled);
    this.igloo.setSurfaceHover(this.surfaceHoverEnabled);

    // 2. Initialize authentic MetalForge crystal engine
    const basePreset = gemPresets(gemById(initialGemId === 'pudgy' || initialGemId === 'overpass' ? 'froststone' : initialGemId)) || {};
    this.lastRockId = ['pudgy', 'overpass'].includes(initialGemId) ? initialGemId : 'pudgy';
    this.lastCrystalId = ['froststone', 'emberstone', 'moonstone', 'tidestone', 'heartstone', 'luckstone', 'thunderstone'].includes(initialGemId) ? initialGemId : 'froststone';
    this.lastLiquidShape = (initialGemId === 'orb' || !!LIQUID_SHAPES[initialGemId]) ? initialGemId : 'orb';
    this.lastGemstoneId = (initialGemId && initialGemId !== 'orb') ? initialGemId : 'pudgy';
    this.currentValues = {
      gem: initialGemId === 'pudgy' || initialGemId === 'overpass' ? 'froststone' : initialGemId,
      ...basePreset,
      ...appDefaults,
      ...parsed,
      motionDynamic: this.motionDynamic,
      scrollEnabled: this.scrollEnabled,
      motionMode: this.currentMotionMode,
      surfaceHover: this.surfaceHoverEnabled,
      skyEnabled: this.isSkyEnabled,
      skyPreset: this.skyPreset,
      oceanEnabled: this.isOceanEnabled,
      background: 'transparent',
      orbit: parsed.orbit !== undefined ? parsed.orbit : appDefaults.orbit
    };
    this.engine = createThunderstone(this.metalforgeContainer, this.currentValues);
    this.engine.setSurfaceHover?.(this.surfaceHoverEnabled);
    this._lastSetHash = window.location.hash;

    // 3. Initialize dynamic 3D-tracked HUD overlay
    const self = this;
    const adapter = {
      get group() {
        return self._getActiveStoneGroup();
      },
      get anchors() {
        if (self.activeMode === 'igloo') {
          const stone = self.igloo?.stones[self.igloo.currentStoneIndex];
          if (stone && stone.anchors) return stone.anchors;
        }
        if (self.activeMode === 'liquid') {
          return {
            top: new THREE.Vector3(0, 1.8, 0),
            right: new THREE.Vector3(1.3, 0.1, 0),
            bottom: new THREE.Vector3(0, -1.8, 0)
          };
        }
        return {
          top: new THREE.Vector3(0, 2.1, 0),
          right: new THREE.Vector3(1.2, 0.2, 0),
          bottom: new THREE.Vector3(0, -2.0, 0)
        };
      }
    };
    this._getActiveStoneGroup = () => {
      if (this.activeMode === 'igloo') {
        const stone = this.igloo?.stones[this.igloo.currentStoneIndex];
        return stone ? stone.crystalMesh : null;
      }
      if (this.activeMode === 'liquid') {
        return this.liquidEngine?.meshGroup || null;
      }
      return this.engine?.getGem?.()?.stone || null;
    };

    const activeCamera = this.activeMode === 'igloo' 
      ? this.igloo.camera 
      : (this.activeMode === 'liquid' ? this.liquidEngine?.camera : this.engine.camera);
    this.hud = new HUDController(adapter, activeCamera, document.body);

    // 4. Setup UI Controls, Buttons, Sliders, and Events
    this.initUI();
    this.initEvents();

    // 5. Apply theme mode (Dark/Light)
    this.applyThemeMode(this.currentThemeMode);

    // 6. Apply initial gemstone & external environments
    this.applyGem(initialGemId, false);
    this.setSkyEnabled(this.isSkyEnabled, false);
    this.setSkyPreset(this.skyPreset, false);
    this.setOceanEnabled(this.isOceanEnabled, false);

    // 7. Start main animation loop
    this.lastGlassPercent = 100;
    this.animate();
  }

  applyThemeMode(mode) {
    this.currentThemeMode = mode;
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('gem_theme_mode', mode);

    const themeText = document.getElementById('theme-text');
    if (themeText) {
      themeText.textContent = mode === 'dark' ? 'LIGHT' : 'DARK';
    }

    // Apply to engines
    if (this.igloo) {
      this.igloo.applyTheme(mode);
    }

    if (this.liquidEngine) {
      this.liquidEngine.setValues({
        sky: mode === 'light' ? '#9bb2cc' : '#b9c6d0',
        haze: mode === 'light' ? '#c0d2e5' : '#e9ebec',
        ground: mode === 'light' ? '#5a6878' : '#45484c',
        warm: '#e6cfa8',
        exposure: mode === 'light' ? 0.88 : 1.05
      });
    }

    if (this.engine) {
      this.engine.setValues({
        bloom: this.currentValues.bloom !== undefined ? this.currentValues.bloom : 0.10,
        exposure: this.currentValues.exposure !== undefined ? this.currentValues.exposure : 0.77,
        bgColor: mode === 'light' ? '#dce5f0' : '#090a0f'
      });
    }
  }

  applyGem(gemId, updateHash = true, customOverrides = null) {
    const isIglooStone = ['pudgy', 'overpass'].includes(gemId);
    const isLiquid = (gemId === 'orb' || !!LIQUID_SHAPES[gemId]);

    const gemCarouselIdx = ['pudgy', 'overpass', 'froststone', 'emberstone', 'moonstone', 'tidestone', 'heartstone', 'luckstone', 'thunderstone'].indexOf(gemId);
    if (gemCarouselIdx >= 0) {
      this.carouselScrollY = gemCarouselIdx * 6.5;
      this.targetCarouselScrollY = this.carouselScrollY;
    }

    if (isIglooStone) {
      if (this.liquidEngine) this.liquidEngine.setPaused(true);
      this.activeMode = 'igloo';
      document.body.classList.add('mode-igloo');
      document.body.classList.remove('mode-metalforge', 'mode-liquid');
      this.iglooContainer.classList.add('active');
      this.metalforgeContainer.classList.remove('active');
      this.liquidContainer?.classList.remove('active');

      if (this.scrollEnabled) {
        document.getElementById('carousel-indicator')?.classList.remove('hidden');
      } else {
        document.getElementById('carousel-indicator')?.classList.add('hidden');
      }
      document.getElementById('metalforge-actions-bar')?.style.setProperty('display', 'none');

      const stoneIndex = gemId === 'overpass' ? 1 : 0;
      this.currentValues.gem = gemId;
      this.lastGemstoneId = gemId;
      this.lastRockId = gemId;
      this.igloo.setStone(stoneIndex, true);
      this.hud.camera = this.igloo.camera;

      const data = IGLOO_STONES_DATA[stoneIndex];
      const meta = GEM_METADATA[gemId] || {
        name: data.shortName,
        code: data.code,
        teleLabel: 'TEMP',
        teleValue: data.tempNum,
        teleDelta: data.tempDelta,
        date: data.date
      };
      this.updateHudMetadata(
        meta.code,
        meta.name,
        meta.teleLabel || 'TEMP',
        meta.teleValue || data.tempNum,
        meta.teleDelta || data.tempDelta,
        meta.date || data.date
      );
      this.updateCarouselIndicatorPosition(gemId);

      // Force authentic original values for Pudgy & Overpass (no artificial additions or procedural symbols)
      this.currentValues.symbol = 'authentic';
      this.currentValues.stoneColor = data.stoneColor || (gemId === 'overpass' ? '#EDF4FA' : '#E0E8EF');
      this.currentValues.depthColor = data.depthColor || '#B4D2EA';
      this.currentValues.wallColor = data.wallColor || '#1A3048';
      this.currentValues.veilColor = data.veilColor || '#EBF4FC';
      this.currentValues.glowColor = '#83A1C5';
      this.currentValues.roughness = 0.65;
      this.currentValues.clearcoat = 0.0;
      this.currentValues.clearcoatRoughness = 0.0;
      this.currentValues.transmission = 0.0;
      this.currentValues.thickness = 0.0;
      this.currentValues.ior = 1.18;
      this.currentValues.reflectivity = 0.3;
      if (customOverrides) {
        Object.assign(this.currentValues, customOverrides);
      }
      this.igloo.stones[stoneIndex].setSymbol('authentic');
      this.igloo.setStoneValues(this.currentValues);

      if (this.drawer) {
        this.drawer.setValues({
          ...this.currentValues,
          gem: gemId,
          motionDynamic: this.motionDynamic,
          scrollEnabled: this.scrollEnabled,
          surfaceHover: this.surfaceHoverEnabled
        });
      }

      if (updateHash) {
        const h = buildUrlHash({ ...this.currentValues, gem: gemId, motionDynamic: this.motionDynamic, scrollEnabled: this.scrollEnabled, surfaceHover: this.surfaceHoverEnabled });
        this._lastSetHash = h;
        window.location.hash = h;
      }
    } else if (isLiquid) {
      if (this.igloo?.stones) {
        this.igloo.stones.forEach(s => {
          s.group.visible = false;
        });
      }

      this.activeMode = 'liquid';
      document.body.classList.add('mode-liquid');
      document.body.classList.remove('mode-metalforge', 'mode-igloo');
      this.liquidContainer?.classList.add('active');
      this.metalforgeContainer?.classList.remove('active');
      this.iglooContainer?.classList.remove('active');

      if (this.scrollEnabled) {
        document.getElementById('carousel-indicator')?.classList.remove('hidden');
      } else {
        document.getElementById('carousel-indicator')?.classList.add('hidden');
      }
      document.getElementById('metalforge-actions-bar')?.style.setProperty('display', 'none');

      const savedLiquidDefaults = (() => {
        try {
          const s = localStorage.getItem('liquid_custom_defaults');
          return s ? JSON.parse(s) : null;
        } catch (e) { return null; }
      })();

      const liquidDefaults = {
        ...DEFAULT_LIQUID_SETTINGS,
        ...(savedLiquidDefaults || {})
      };

      const targetShape = (gemId === 'orb' ? (customOverrides?.shape || liquidDefaults.shape || 'strategy') : gemId);
      const shapeObj = LIQUID_SHAPES[targetShape] || LIQUID_SHAPES.strategy || LIQUID_SHAPES.orb;

      const mergedLiquidVals = {
        ...DEFAULT_LIQUID_SETTINGS,
        ...liquidDefaults,
        shape: targetShape,
        ...shapeObj.presets,
        ...shapeObj.look,
        ...(customOverrides || {})
      };

      if (!this.liquidEngine) {
        this.liquidEngine = new LiquidGlassEngine(this.liquidContainer, mergedLiquidVals);
      } else {
        this.liquidEngine.setPaused(false);
        this.liquidEngine.setValues(mergedLiquidVals);
      }

      this.motionDynamic = mergedLiquidVals.motionDynamic || 'revolve';
      this.scrollEnabled = mergedLiquidVals.scrollEnabled !== undefined ? mergedLiquidVals.scrollEnabled : false;
      this.surfaceHoverEnabled = mergedLiquidVals.surfaceHover !== undefined ? mergedLiquidVals.surfaceHover : true;
      this.isSkyEnabled = mergedLiquidVals.skyEnabled !== undefined ? mergedLiquidVals.skyEnabled : false;
      this.skyPreset = mergedLiquidVals.skyPreset || 'day';
      this.isOceanEnabled = mergedLiquidVals.oceanEnabled !== undefined ? mergedLiquidVals.oceanEnabled : false;

      this.setMotionDynamic(this.motionDynamic);
      this.setScrollEnabled(this.scrollEnabled);
      this.setSurfaceHover(this.surfaceHoverEnabled);
      this.setSkyEnabled(this.isSkyEnabled, false);
      this.setSkyPreset(this.skyPreset, false);
      this.setOceanEnabled(this.isOceanEnabled, false);

      this.hud.camera = this.liquidEngine.camera;

      this.currentValues = {
        ...this.currentValues,
        ...mergedLiquidVals,
        gem: 'orb',
        shape: targetShape
      };

      if (updateHash) {
        const h = buildUrlHash({ ...this.currentValues, gem: 'orb', shape: targetShape });
        this._lastSetHash = h;
        window.location.hash = h;
      }

      // Update HUD metadata
      const meta = GEM_METADATA[targetShape] || GEM_METADATA.orb;
      this.updateHudMetadata(meta.code, meta.name, meta.teleLabel, meta.teleValue, meta.teleDelta, meta.date);

      // Update parameters drawer
      if (this.drawer) {
        this.drawer.setValues(this.currentValues, DEFAULT_LIQUID_SETTINGS);
      }
    } else {
      if (this.liquidEngine) this.liquidEngine.setPaused(true);
      this.liquidContainer?.classList.remove('active');
      this.activeMode = 'metalforge';
      document.body.classList.add('mode-metalforge');
      document.body.classList.remove('mode-igloo', 'mode-liquid');
      this.iglooContainer.classList.remove('active');
      this.metalforgeContainer.classList.add('active');

      if (this.igloo?.stones) {
        this.igloo.stones.forEach(s => {
          s.group.visible = false;
        });
      }

      if (this.scrollEnabled) {
        document.getElementById('carousel-indicator')?.classList.remove('hidden');
      } else {
        document.getElementById('carousel-indicator')?.classList.add('hidden');
      }
      document.getElementById('metalforge-actions-bar')?.style.removeProperty('display');

      this.hud.camera = this.engine.camera;

      const isNewGem = this.currentValues.gem !== gemId;
      const preset = gemPresets(gemById(gemId)) || {};

      if (isNewGem) {
        this.currentValues = {
          ...this.currentValues,
          gem: gemId,
          ...preset,
          ...(customOverrides || {})
        };
      } else if (customOverrides) {
        this.currentValues = {
          ...this.currentValues,
          ...customOverrides
        };
      }

      this.currentValues.motionDynamic = this.motionDynamic;
      this.currentValues.scrollEnabled = this.scrollEnabled;
      this.currentValues.surfaceHover = this.surfaceHoverEnabled;
      this.currentValues.orbit = (this.motionDynamic === 'revolve');
      this.currentValues.spin = (this.motionDynamic === 'revolve' ? 1.0 : 0.0);

      this.engine.setValues(this.currentValues);

      if (updateHash) {
        const h = buildUrlHash({ ...this.currentValues, gem: gemId });
        this._lastSetHash = h;
        window.location.hash = h;
      }

      // Update HUD metadata
      const meta = GEM_METADATA[gemId] || GEM_METADATA.froststone;
      this.updateHudMetadata(meta.code, meta.name, meta.teleLabel, meta.teleValue, meta.teleDelta, meta.date);

      // Update parameters drawer
      if (this.drawer) {
        this.drawer.setValues(this.currentValues, preset);
      }
    }

    if (isIglooStone) {
      this.lastRockId = gemId;
      this.lastGemstoneId = gemId;
    } else if (!isLiquid) {
      this.lastCrystalId = gemId;
      this.lastGemstoneId = gemId;
    } else {
      this.lastLiquidShape = (gemId === 'orb' ? (customOverrides?.shape || this.lastLiquidShape || 'strategy') : gemId);
    }

    // Update active mode in top selector bar (1- Rock | 2- Crystals | 3- Liquid Glass)
    document.querySelectorAll('.mode-pill').forEach(btn => {
      const mode = btn.getAttribute('data-mode');
      if (mode === 'rock') {
        btn.classList.toggle('active', isIglooStone);
      } else if (mode === 'crystals') {
        btn.classList.toggle('active', !isIglooStone && !isLiquid);
      } else if (mode === 'liquid') {
        btn.classList.toggle('active', isLiquid);
      }
    });

    // Update Sub-Stones Groups visibility and active button in outside top bar
    const currentMode = isIglooStone ? 'rock' : (isLiquid ? 'liquid' : 'crystals');
    document.querySelectorAll('.sub-stones-group').forEach(grp => {
      grp.style.display = (grp.getAttribute('data-mode') === currentMode) ? 'flex' : 'none';
    });

    document.querySelectorAll('.gem-sub-btn').forEach(btn => {
      if (btn.hasAttribute('data-stone')) {
        btn.classList.toggle('active', btn.getAttribute('data-stone') === gemId);
      } else if (btn.hasAttribute('data-liquid-shape')) {
        const shape = (gemId === 'orb' ? (this.currentValues.shape || 'torus') : gemId);
        btn.classList.toggle('active', btn.getAttribute('data-liquid-shape') === shape);
      }
    });

    this.syncEnvironmentToActiveScene();
    this.updateCarouselIndicatorPosition(gemId);
  }

  handleIglooStoneChange(data) {
    const gemId = data.gemId || data.id || (data.index === 0 ? 'pudgy' : 'overpass');
    if (this.currentValues.gem === gemId) return;
    this.currentValues.gem = gemId;
    this.lastGemstoneId = gemId;
    this.lastRockId = gemId;

    // Update active mode in top selector bar (1- Rock)
    document.querySelectorAll('.mode-pill').forEach(btn => {
      const mode = btn.getAttribute('data-mode');
      btn.classList.toggle('active', mode === 'rock');
    });

    document.querySelectorAll('.sub-stones-group').forEach(grp => {
      grp.style.display = (grp.getAttribute('data-mode') === 'rock') ? 'flex' : 'none';
    });

    document.querySelectorAll('.gem-sub-btn[data-stone]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-stone') === gemId);
    });

    this.igloo.setStoneValues(this.currentValues);
    if (this.drawer) {
      this.drawer.setValues({ ...this.currentValues, gem: gemId });
    }

    // Update HUD cards
    const meta = GEM_METADATA[gemId] || {
      code: data.code || 'CO_0' + (data.index + 1),
      name: data.shortName,
      teleLabel: 'TEMP',
      teleValue: data.tempNum || 30.0,
      teleDelta: data.tempDelta || '+01.00',
      date: data.date || '01/01/2024'
    };
    this.updateHudMetadata(
      meta.code,
      meta.name,
      meta.teleLabel || 'TEMP',
      meta.teleValue || data.tempNum,
      meta.teleDelta || data.tempDelta,
      meta.date || data.date
    );

    // Update carousel vertical indicator bar
    this.updateCarouselIndicatorPosition(gemId);

    // Update URL hash
    const h = buildUrlHash({ ...this.currentValues, gem: gemId, motionDynamic: this.motionDynamic, scrollEnabled: this.scrollEnabled, surfaceHover: this.surfaceHoverEnabled });
    this._lastSetHash = h;
    window.location.hash = h;
  }

  updateCarouselIndicatorPosition(gemId) {
    const ALL_GEMS = ['pudgy', 'overpass', 'froststone', 'emberstone', 'moonstone', 'tidestone', 'heartstone', 'luckstone', 'thunderstone', 'orb'];
    const idx = ALL_GEMS.indexOf(gemId);
    const bar = document.getElementById('indicator-bar');
    if (bar && idx >= 0) {
      bar.style.top = `${(idx / (ALL_GEMS.length - 1)) * 100}%`;
    }
  }

  setMotionDynamic(mode) {
    this.motionDynamic = (mode === 'revolve') ? 'revolve' : 'float';
    this.currentValues.motionDynamic = this.motionDynamic;
    this.currentValues.motionMode = this.motionDynamic === 'revolve' ? 'revolve' : 'scroll';
    this.currentValues.orbit = (this.motionDynamic === 'revolve');
    const isLiquid = (this.activeMode === 'liquid' || this.currentValues.gem === 'orb' || !!LIQUID_SHAPES[this.currentValues.gem]);
    const defaultSpin = isLiquid ? 0.40 : 1.0;
    this.currentValues.spin = (this.motionDynamic === 'revolve' ? defaultSpin : 0.0);

    const btnRevolve = document.getElementById('btn-dynamic-revolve');
    const btnFloat = document.getElementById('btn-dynamic-float');
    if (btnRevolve) btnRevolve.classList.toggle('active', this.motionDynamic === 'revolve');
    if (btnFloat) btnFloat.classList.toggle('active', this.motionDynamic === 'float');

    const btnTopScroll = document.getElementById('btn-motion-scroll');
    const btnTopRevolve = document.getElementById('btn-motion-revolve');
    if (btnTopScroll) btnTopScroll.classList.toggle('active', this.motionDynamic === 'float');
    if (btnTopRevolve) btnTopRevolve.classList.toggle('active', this.motionDynamic === 'revolve');

    if (this.igloo) {
      this.igloo.setMotionDynamic(this.motionDynamic);
    }
    if (this.liquidEngine) {
      this.liquidEngine.setValues({
        spin: this.motionDynamic === 'revolve' ? 0.40 : 0.0,
        orbit: this.motionDynamic === 'revolve'
      });
    }
    if (this.engine) {
      this.engine.setValues({
        spin: this.motionDynamic === 'revolve' ? 1.0 : 0.0,
        orbit: this.motionDynamic === 'revolve'
      });
    }
    if (this.drawer) {
      this.drawer.setValues({
        motionDynamic: this.motionDynamic,
        spin: this.motionDynamic === 'revolve' ? defaultSpin : 0.0
      });
    }

    const curGem = this.activeMode === 'igloo' 
      ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
      : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
    const h = buildUrlHash({ ...this.currentValues, gem: curGem, motionDynamic: this.motionDynamic });
    this._lastSetHash = h;
    window.location.hash = h;
  }

  setScrollEnabled(enabled) {
    this.scrollEnabled = Boolean(enabled);
    this.currentValues.scrollEnabled = this.scrollEnabled;

    const btnScroll = document.getElementById('btn-scroll-toggle');
    const scrollText = document.getElementById('scroll-toggle-text');
    if (btnScroll) btnScroll.classList.toggle('active', this.scrollEnabled);
    if (scrollText) scrollText.textContent = this.scrollEnabled ? 'SCROLL: ON' : 'SCROLL: OFF';

    const carouselInd = document.getElementById('carousel-indicator');
    if (carouselInd) {
      if (this.scrollEnabled) carouselInd.classList.remove('hidden');
      else carouselInd.classList.add('hidden');
    }

    if (this.igloo) {
      this.igloo.setScrollEnabled(this.scrollEnabled);
    }
    if (this.drawer) {
      this.drawer.setValues({ scrollEnabled: this.scrollEnabled });
    }

    const curGem = this.activeMode === 'igloo' 
      ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
      : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
    const h = buildUrlHash({ ...this.currentValues, gem: curGem, scrollEnabled: this.scrollEnabled });
    this._lastSetHash = h;
    window.location.hash = h;
  }

  setSurfaceHover(enabled) {
    this.surfaceHoverEnabled = Boolean(enabled);
    this.currentValues.surfaceHover = this.surfaceHoverEnabled;

    const btnHover = document.getElementById('btn-surface-hover-toggle');
    const hoverText = document.getElementById('hover-toggle-text');
    if (btnHover) btnHover.classList.toggle('active', this.surfaceHoverEnabled);
    if (hoverText) hoverText.textContent = this.surfaceHoverEnabled ? 'HOVER RIPPLE: ON' : 'HOVER RIPPLE: OFF';

    if (this.igloo) {
      this.igloo.setSurfaceHover(this.surfaceHoverEnabled);
    }
    if (this.liquidEngine) {
      this.liquidEngine.setSurfaceHover(this.surfaceHoverEnabled);
    }
    if (this.engine) {
      this.engine.setSurfaceHover?.(this.surfaceHoverEnabled);
      this.engine.setValues?.({ surfaceHover: this.surfaceHoverEnabled });
    }
    if (this.drawer) {
      this.drawer.setValues({ surfaceHover: this.surfaceHoverEnabled });
    }

    const curGem = this.activeMode === 'igloo' 
      ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
      : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
    const h = buildUrlHash({ ...this.currentValues, gem: curGem, surfaceHover: this.surfaceHoverEnabled });
    this._lastSetHash = h;
    window.location.hash = h;
  }

  getActiveScene() {
    if (this.activeMode === 'igloo') return this.igloo?.scene;
    if (this.activeMode === 'liquid') return this.liquidEngine?.scene;
    return this.engine?.scene;
  }

  getActiveCamera() {
    if (this.activeMode === 'igloo') return this.igloo?.camera;
    if (this.activeMode === 'liquid') return this.liquidEngine?.camera;
    return this.engine?.camera;
  }

  syncEnvironmentToActiveScene() {
    const activeScene = this.getActiveScene();
    if (!activeScene) return;

    if (this.sky?.mesh) {
      if (this.sky.mesh.parent && this.sky.mesh.parent !== activeScene) {
        this.sky.mesh.parent.remove(this.sky.mesh);
      }
      if (!this.sky.mesh.parent) {
        activeScene.add(this.sky.mesh);
      }
    }

    if (this.ocean?.mesh) {
      if (this.ocean.mesh.parent && this.ocean.mesh.parent !== activeScene) {
        this.ocean.mesh.parent.remove(this.ocean.mesh);
      }
      if (!this.ocean.mesh.parent) {
        activeScene.add(this.ocean.mesh);
      }
    }

    const activeCam = this.getActiveCamera();
    if (activeCam) {
      if (this.isSkyEnabled || this.isOceanEnabled) {
        if (activeCam.far < 1500) {
          activeCam.far = 1500;
          activeCam.updateProjectionMatrix();
        }
      }
    }

    // In igloo mode, hide 2D polar haze & blurred shapes when sky is enabled so 360 sky dome is seen cleanly
    if (this.igloo) {
      const showPolarHaze = (this.activeMode === 'igloo') ? !this.isSkyEnabled : true;
      if (this.igloo.bg?.mesh) this.igloo.bg.mesh.visible = showPolarHaze;
      if (this.igloo.blurryTextMesh) this.igloo.blurryTextMesh.visible = showPolarHaze;
      if (this.igloo.bgShapesMesh) this.igloo.bgShapesMesh.visible = showPolarHaze;
    }
  }

  setSkyEnabled(enabled, updateHash = true) {
    this.isSkyEnabled = Boolean(enabled);
    this.currentValues.skyEnabled = this.isSkyEnabled;
    this.sky.setVisible(this.isSkyEnabled);

    const btnSky = document.getElementById('btn-sky-toggle');
    const skyText = document.getElementById('sky-toggle-text');
    if (btnSky) btnSky.classList.toggle('active', this.isSkyEnabled);
    if (skyText) skyText.textContent = this.isSkyEnabled ? 'SKY: ON' : 'SKY: OFF';

    const drawerSky = document.getElementById('mf-switch-sky');
    if (drawerSky) {
      drawerSky.setAttribute('aria-checked', String(this.isSkyEnabled));
    }

    this.syncEnvironmentToActiveScene();

    if (this.drawer) {
      this.drawer.setValues({ skyEnabled: this.isSkyEnabled });
    }

    if (updateHash) {
      const curGem = this.activeMode === 'igloo' 
        ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
        : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
      const h = buildUrlHash({ ...this.currentValues, gem: curGem });
      this._lastSetHash = h;
      window.location.hash = h;
    }
  }

  setSkyPreset(preset, updateHash = true) {
    if (!preset) return;
    this.skyPreset = preset;
    this.currentValues.skyPreset = preset;
    if (this.sky) {
      this.sky.setPreset(preset);
    }

    if (this.drawer) {
      this.drawer.setValues({ skyPreset: preset });
    }

    if (updateHash) {
      const curGem = this.activeMode === 'igloo' 
        ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
        : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
      const h = buildUrlHash({ ...this.currentValues, gem: curGem });
      this._lastSetHash = h;
      window.location.hash = h;
    }
  }

  setOceanEnabled(enabled, updateHash = true) {
    this.isOceanEnabled = Boolean(enabled);
    this.currentValues.oceanEnabled = this.isOceanEnabled;
    this.ocean.setVisible(this.isOceanEnabled);

    const btnOcean = document.getElementById('btn-ocean-toggle');
    const oceanText = document.getElementById('ocean-toggle-text');
    if (btnOcean) btnOcean.classList.toggle('active', this.isOceanEnabled);
    if (oceanText) oceanText.textContent = this.isOceanEnabled ? 'OCEAN: ON' : 'OCEAN: OFF';

    const drawerOcean = document.getElementById('mf-switch-ocean');
    if (drawerOcean) {
      drawerOcean.setAttribute('aria-checked', String(this.isOceanEnabled));
    }

    this.syncEnvironmentToActiveScene();

    if (this.drawer) {
      this.drawer.setValues({ oceanEnabled: this.isOceanEnabled });
    }

    if (updateHash) {
      const curGem = this.activeMode === 'igloo' 
        ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
        : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
      const h = buildUrlHash({ ...this.currentValues, gem: curGem });
      this._lastSetHash = h;
      window.location.hash = h;
    }
  }

  setMotionMode(mode) {
    if (mode === 'revolve') {
      this.setMotionDynamic('revolve');
    } else {
      this.setMotionDynamic('float');
      this.setScrollEnabled(true);
    }
  }

  updateHudMetadata(code, name, teleLabel, teleValue, teleDelta, date) {
    const labelProject = document.getElementById('project-name');
    const labelCode = document.getElementById('project-code');
    const labelTemp = document.querySelector('.temp-label');
    const tempVal = document.getElementById('temp-val');
    const tempDeltaEl = document.getElementById('temp-delta');
    const dateTag = document.getElementById('project-date');

    if (labelProject) labelProject.textContent = name.toUpperCase();
    if (labelCode) labelCode.textContent = code;
    if (labelTemp) labelTemp.textContent = teleLabel;
    if (tempVal) {
      this.hud.tempBase = teleValue;
      tempVal.textContent = teleValue.toFixed(2);
    }
    if (tempDeltaEl) tempDeltaEl.textContent = teleDelta || '+01.00';
    if (dateTag) dateTag.textContent = `D ${date}`;
  }

  openDossierModal(data) {
    const exploreModal = document.getElementById('explore-modal');
    if (!exploreModal) return;

    const modalTitle = document.getElementById('modal-title');
    const modalSub = document.getElementById('modal-sub');
    const modalDesc = document.getElementById('modal-desc');
    const modalSocials = document.getElementById('modal-socials');
    const modalVisitLink = document.getElementById('modal-visit-link');
    const stat1lbl = document.getElementById('stat-1-lbl');
    const stat1val = document.getElementById('stat-1-val');
    const stat2lbl = document.getElementById('stat-2-lbl');
    const stat2val = document.getElementById('stat-2-val');
    const stat3lbl = document.getElementById('stat-3-lbl');
    const stat3val = document.getElementById('stat-3-val');

    if (modalTitle) modalTitle.textContent = data.title.toUpperCase();
    if (modalSub) modalSub.textContent = `SPECIMEN CORE IDENTIFIER #${data.index === 0 ? '001' : '002'} · D ${data.date}`;
    if (modalDesc) modalDesc.textContent = data.summary;

    if (modalSocials) {
      modalSocials.innerHTML = '';
      (data.discover || []).forEach(s => {
        const a = document.createElement('a');
        a.className = 'social-link-pill';
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = s.name;
        modalSocials.appendChild(a);
      });
    }

    if (modalVisitLink) {
      modalVisitLink.href = data.website || '#';
    }

    if (stat1lbl) stat1lbl.textContent = 'TEMPERATURE';
    if (stat1val) stat1val.textContent = `${data.tempNum.toFixed(2)} K`;
    if (stat2lbl) stat2lbl.textContent = 'ROUGHNESS / REFRACTION';
    if (stat2val) stat2val.textContent = '0.65 -> 0.12 [CLEAR]';
    if (stat3lbl) stat3lbl.textContent = 'PLEXUS NETWORK';
    if (stat3val) stat3val.textContent = '18 ACTIVE NODES';

    exploreModal.classList.add('active');
  }

  initUI() {
    // Dark / Light Theme Toggle Button
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', () => {
        this.sound.playClick();
        const nextMode = this.currentThemeMode === 'dark' ? 'light' : 'dark';
        this.applyThemeMode(nextMode);
      });
    }

    // Mode Switcher Pills in Top Bar (1- Rock | 2- Crystals | 3- Liquid Glass)
    document.querySelectorAll('.mode-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.sound.playClick();
        if (mode === 'rock') {
          const targetRock = this.lastRockId || 'pudgy';
          this.applyGem(targetRock);
        } else if (mode === 'crystals') {
          const targetCrystal = this.lastCrystalId || 'froststone';
          this.applyGem(targetCrystal);
        } else if (mode === 'liquid') {
          const targetLiquid = this.lastLiquidShape || 'strategy';
          this.applyGem(targetLiquid);
        }
      });
    });

    // Outside Sub-Stone Selection Buttons (Top Bar)
    document.querySelectorAll('.gem-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        if (btn.hasAttribute('data-stone')) {
          const stoneId = btn.getAttribute('data-stone');
          this.applyGem(stoneId);
        } else if (btn.hasAttribute('data-liquid-shape')) {
          const shapeId = btn.getAttribute('data-liquid-shape');
          if (this.activeMode !== 'liquid') {
            this.applyGem('orb', true, { shape: shapeId });
          } else {
            this.applyGem(shapeId);
          }
        }
      });
    });

    // Action Controls: Chip, Shatter, Put it back
    const btnChip = document.getElementById('btn-chip');
    if (btnChip) {
      btnChip.addEventListener('click', () => {
        this.sound.playChip();
        this.engine.chip();
      });
    }

    const btnShatter = document.getElementById('btn-shatter');
    if (btnShatter) {
      btnShatter.addEventListener('click', () => {
        this.sound.playShatter();
        this.engine.shatter();
      });
    }

    const btnPutBack = document.getElementById('btn-put-back');
    if (btnPutBack) {
      btnPutBack.addEventListener('click', () => {
        this.sound.playPutItBack();
        this.engine.restore();
      });
    }

    // Motion Dynamic Segmented Buttons (360° Revolve vs Floating)
    const btnDynamicRevolve = document.getElementById('btn-dynamic-revolve');
    if (btnDynamicRevolve) {
      btnDynamicRevolve.addEventListener('click', () => {
        this.sound.playClick();
        this.setMotionDynamic('revolve');
      });
    }

    const btnDynamicFloat = document.getElementById('btn-dynamic-float');
    if (btnDynamicFloat) {
      btnDynamicFloat.addEventListener('click', () => {
        this.sound.playClick();
        this.setMotionDynamic('float');
      });
    }

    // Vertical Scroll Navigation Toggle Button
    const btnScrollToggle = document.getElementById('btn-scroll-toggle');
    if (btnScrollToggle) {
      btnScrollToggle.addEventListener('click', () => {
        this.sound.playClick();
        this.setScrollEnabled(!this.scrollEnabled);
      });
    }

    // Surface Hover Ripple Toggle Button
    const btnSurfaceHover = document.getElementById('btn-surface-hover-toggle');
    if (btnSurfaceHover) {
      btnSurfaceHover.addEventListener('click', () => {
        this.sound.playClick();
        this.setSurfaceHover(!this.surfaceHoverEnabled);
      });
    }

    // Environment Sky Dome Toggle Button (E:\environment-map)
    const btnSkyToggle = document.getElementById('btn-sky-toggle');
    if (btnSkyToggle) {
      btnSkyToggle.addEventListener('click', () => {
        this.sound.playClick();
        this.setSkyEnabled(!this.isSkyEnabled);
      });
    }

    // FFT Ocean Surface Toggle Button (E:\fft-ocean-surface)
    const btnOceanToggle = document.getElementById('btn-ocean-toggle');
    if (btnOceanToggle) {
      btnOceanToggle.addEventListener('click', () => {
        this.sound.playClick();
        this.setOceanEnabled(!this.isOceanEnabled);
      });
    }

    // Legacy Top Header Buttons
    const btnMotionScroll = document.getElementById('btn-motion-scroll');
    if (btnMotionScroll) {
      btnMotionScroll.addEventListener('click', () => {
        this.sound.playClick();
        this.setMotionMode('scroll');
      });
    }

    const btnMotionRevolve = document.getElementById('btn-motion-revolve');
    if (btnMotionRevolve) {
      btnMotionRevolve.addEventListener('click', () => {
        this.sound.playClick();
        this.setMotionMode('revolve');
      });
    }

    // Initialize Authentic MetalForge Parameters Drawer
    const drawerContainer = document.getElementById('parameters-drawer');
    const initialGemId = this.currentValues.gem || 'froststone';
    const basePreset = gemPresets(gemById(initialGemId)) || {};

    if (drawerContainer) {
      this.drawer = new ParametersDrawer({
        container: drawerContainer,
        values: this.currentValues,
        defaultValues: basePreset,
        onParamChange: (key, val) => {
          let changeObj = (typeof key === 'object' && key !== null) ? key : { [key]: val };

          if (changeObj.gem !== undefined && changeObj.gem !== this.currentValues.gem) {
            this.sound.playClick();
            this.applyGem(changeObj.gem);
            return;
          }

          Object.assign(this.currentValues, changeObj);

          if (this.activeMode === 'igloo') {
            this.igloo.setStoneValues(changeObj);
          } else if (this.activeMode === 'liquid') {
            this.liquidEngine?.setValues(changeObj);
          } else {
            this.engine.setValues(changeObj);
          }

          if (changeObj.motionDynamic !== undefined) {
            this.setMotionDynamic(changeObj.motionDynamic);
          }
          if (changeObj.scrollEnabled !== undefined) {
            this.setScrollEnabled(changeObj.scrollEnabled);
          }
          if (changeObj.motionMode !== undefined) {
            this.setMotionMode(changeObj.motionMode);
          }
          if (changeObj.surfaceHover !== undefined) {
            this.setSurfaceHover(changeObj.surfaceHover);
          }
          if (changeObj.skyEnabled !== undefined) {
            this.setSkyEnabled(changeObj.skyEnabled);
          }
          if (changeObj.skyPreset !== undefined) {
            this.setSkyPreset(changeObj.skyPreset);
          }
          if (changeObj.oceanEnabled !== undefined) {
            this.setOceanEnabled(changeObj.oceanEnabled);
          }

          const curGem = this.activeMode === 'igloo' 
            ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
            : (this.activeMode === 'liquid' ? 'orb' : (this.currentValues.gem || 'froststone'));
          const h = buildUrlHash({ ...this.currentValues, gem: curGem });
          this._lastSetHash = h;
          window.location.hash = h;
        },
        onSetDefault: (vals) => {
          try {
            const toSave = { ...vals };
            const isLiquid = this.activeMode === 'liquid' || this.currentValues.gem === 'orb' || !!LIQUID_SHAPES[this.currentValues.gem];
            if (isLiquid) {
              localStorage.setItem('liquid_custom_defaults', JSON.stringify(toSave));
            } else {
              localStorage.setItem('gem_custom_defaults', JSON.stringify(toSave));
            }
            this.sound.playClick();
          } catch (e) {}
        },
        onReset: () => {
          const curGemId = this.currentValues.gem || 'froststone';
          const isLiquid = this.activeMode === 'liquid' || curGemId === 'orb' || !!LIQUID_SHAPES[curGemId];
          if (isLiquid) {
            const savedLiquidDefaults = (() => {
              try {
                const s = localStorage.getItem('liquid_custom_defaults');
                return s ? JSON.parse(s) : null;
              } catch (e) { return null; }
            })();
            const defaults = {
              ...DEFAULT_LIQUID_SETTINGS,
              ...(savedLiquidDefaults || {})
            };
            this.currentValues = {
              ...this.currentValues,
              ...defaults,
              gem: 'orb',
              shape: defaults.shape || 'torus'
            };
            this.liquidEngine?.setValues(this.currentValues);
            if (this.drawer) this.drawer.setValues(this.currentValues, DEFAULT_LIQUID_SETTINGS);
            if (defaults.motionDynamic !== undefined) this.setMotionDynamic(defaults.motionDynamic);
            if (defaults.scrollEnabled !== undefined) this.setScrollEnabled(defaults.scrollEnabled);
            if (defaults.surfaceHover !== undefined) this.setSurfaceHover(defaults.surfaceHover);
            if (defaults.skyEnabled !== undefined) this.setSkyEnabled(defaults.skyEnabled, false);
            if (defaults.skyPreset !== undefined) this.setSkyPreset(defaults.skyPreset, false);
            if (defaults.oceanEnabled !== undefined) this.setOceanEnabled(defaults.oceanEnabled, false);
            const h = buildUrlHash({ ...this.currentValues, gem: 'orb', shape: this.currentValues.shape });
            this._lastSetHash = h;
            window.location.hash = h;
            return;
          }

          const savedDefaults = (() => {
            try {
              const s = localStorage.getItem('gem_custom_defaults');
              return s ? JSON.parse(s) : null;
            } catch (e) { return null; }
          })();

          const curGem = gemById(curGemId);
          const gemSpecific = gemPresets(curGem) || {};
          const defaults = {
            ...DEFAULT_APP_SETTINGS,
            ...gemSpecific,
            ...(savedDefaults || {})
          };

          this.currentValues = {
            ...this.currentValues,
            ...defaults,
            gem: curGemId,
            motionMode: this.currentMotionMode,
            surfaceHover: defaults.surfaceHover !== undefined ? defaults.surfaceHover : this.surfaceHoverEnabled,
            text: '',
            background: 'transparent',
            orbit: (this.currentMotionMode === 'revolve')
          };

          if (this.activeMode === 'igloo') {
            this.igloo.setStoneValues(this.currentValues);
          } else {
            this.engine.setValues(this.currentValues);
          }

          if (defaults.skyEnabled !== undefined) {
            this.setSkyEnabled(defaults.skyEnabled);
          }
          if (defaults.skyPreset !== undefined) {
            this.setSkyPreset(defaults.skyPreset);
          }
          if (defaults.oceanEnabled !== undefined) {
            this.setOceanEnabled(defaults.oceanEnabled);
          }

          this.drawer.setValues(this.currentValues, defaults);
          const curGemName = this.activeMode === 'igloo' 
            ? (this.igloo?.stones[this.igloo.currentStoneIndex]?.data?.id || this.currentValues.gem || 'pudgy')
            : (this.currentValues.gem || 'froststone');
          const h = buildUrlHash({ ...this.currentValues, gem: curGemName });
          this._lastSetHash = h;
          window.location.hash = h;
        },
        onClose: () => {
          drawerContainer.classList.remove('active');
          document.getElementById('btn-toggle-tuning')?.classList.remove('active');
        }
      });
    }

    // Toggle Parameters Drawer Button (Works on ALL 9 Gems)
    const btnToggleTuning = document.getElementById('btn-toggle-tuning');
    if (btnToggleTuning && drawerContainer) {
      btnToggleTuning.addEventListener('click', () => {
        drawerContainer.classList.toggle('active');
        btnToggleTuning.classList.toggle('active');
      });
    }

    // Explore Button (Dossier Modal)
    const btnExplore = document.getElementById('btn-explore');
    const exploreModal = document.getElementById('explore-modal');
    if (btnExplore && exploreModal) {
      btnExplore.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.activeMode === 'igloo') {
          this.igloo.openCurrentStone();
        } else if (this.activeMode === 'liquid') {
          const curShape = this.currentValues.shape || 'strategy';
          const meta = GEM_METADATA[curShape] || GEM_METADATA.orb;
          const data = {
            title: meta.name,
            date: meta.date,
            summary: meta.blurb,
            tempNum: meta.teleValue,
            index: 0,
            discover: [
              { name: 'Dynamic Water Aura', url: '#' },
              { name: 'Simplex 3D Wave Ripple', url: '#' }
            ],
            website: '#'
          };
          this.openDossierModal(data);
        } else {
          const curGem = this.currentValues.gem || 'froststone';
          const meta = GEM_METADATA[curGem] || GEM_METADATA.froststone;
          const data = {
            title: meta.name,
            date: meta.date,
            summary: meta.blurb,
            tempNum: meta.teleValue,
            index: 0,
            discover: [],
            website: '#'
          };
          this.openDossierModal(data);
        }
      });
    }

    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal && exploreModal) {
      btnCloseModal.addEventListener('click', () => {
        if (this.activeMode === 'igloo') {
          this.igloo.closeCurrentStone();
        } else {
          exploreModal.classList.remove('active');
        }
      });
    }

    // Sound Toggle Button
    const soundBtn = document.getElementById('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isSoundOn = this.sound.toggle();
        const soundText = document.getElementById('sound-text');
        const soundIcon = document.getElementById('sound-icon');
        if (soundText) soundText.textContent = isSoundOn ? 'Sound: On' : 'Sound: Off';
        if (soundIcon) soundIcon.style.opacity = isSoundOn ? '1' : '0.5';
        if (isSoundOn) soundBtn.classList.add('active');
        else soundBtn.classList.remove('active');
      });
    }

    // Reset View Button
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.sound.playClick();
        if (this.activeMode === 'igloo') {
          this.igloo.scrollToStone(0);
        } else if (this.activeMode === 'liquid') {
          this.liquidEngine?.reset();
        } else {
          this.engine.reset();
        }
      });
    }
  }

  initEvents() {
    window.addEventListener('hashchange', () => {
      if (window.location.hash === this._lastSetHash) return;
      this._lastSetHash = window.location.hash;
      const parsed = parseUrlHash();
      if (!parsed || !parsed.gem) return;

      if (parsed.motionDynamic) {
        this.setMotionDynamic(parsed.motionDynamic);
      } else if (parsed.motionMode) {
        this.setMotionMode(parsed.motionMode);
      }
      if (parsed.scrollEnabled !== undefined) {
        this.setScrollEnabled(parsed.scrollEnabled);
      }
      if (parsed.surfaceHover !== undefined) {
        this.setSurfaceHover(parsed.surfaceHover);
      }
      if (parsed.skyEnabled !== undefined && parsed.skyEnabled !== this.isSkyEnabled) {
        this.setSkyEnabled(parsed.skyEnabled, false);
      }
      if (parsed.skyPreset !== undefined && parsed.skyPreset !== this.skyPreset) {
        this.setSkyPreset(parsed.skyPreset, false);
      }
      if (parsed.oceanEnabled !== undefined && parsed.oceanEnabled !== this.isOceanEnabled) {
        this.setOceanEnabled(parsed.oceanEnabled, false);
      }

      const isIgloo = ['pudgy', 'overpass'].includes(parsed.gem);
      const isLiquid = (parsed.gem === 'orb' || !!LIQUID_SHAPES[parsed.gem]);

      if (isIgloo) {
        this.applyGem(parsed.gem, false);
      } else if (isLiquid) {
        if (this.activeMode !== 'liquid' || (parsed.shape && parsed.shape !== this.currentValues.shape)) {
          this.applyGem('orb', false, parsed);
        } else {
          this.currentValues = { ...this.currentValues, ...parsed };
          this.liquidEngine?.setValues(this.currentValues);
          if (this.drawer) {
            this.drawer.setValues(this.currentValues, DEFAULT_LIQUID_SETTINGS);
          }
        }
      } else {
        if (parsed.gem !== this.currentValues.gem) {
          this.applyGem(parsed.gem, false, parsed);
        } else {
          this.currentValues = { ...this.currentValues, ...parsed };
          this.engine.setValues(this.currentValues);
          if (this.drawer) {
            const basePreset = gemPresets(gemById(parsed.gem)) || {};
            this.drawer.setValues(this.currentValues, basePreset);
          }
        }
      }
    });

    // Listen for canvas clicks to play sound effects when chipped/shattered
    const canvas = this.engine.canvas;
    if (canvas) {
      canvas.addEventListener('click', () => {
        setTimeout(() => {
          const currentPct = Math.round((this.engine.progress ? this.engine.progress() : 1.0) * 100);
          if (currentPct < this.lastGlassPercent) {
            this.sound.playChip();
            this.lastGlassPercent = currentPct;
          }
        }, 300);
      });
      canvas.addEventListener('dblclick', () => {
        setTimeout(() => {
          this.sound.playShatter();
          this.lastGlassPercent = Math.round((this.engine.progress ? this.engine.progress() : 1.0) * 100);
        }, 100);
      });
    }

    // Unified wheel carousel navigation across all 9 stones
    const ALL_GEMS_ORDER = [
      'pudgy',
      'overpass',
      'froststone',
      'emberstone',
      'moonstone',
      'tidestone',
      'heartstone',
      'luckstone',
      'thunderstone'
    ];

    window.addEventListener('wheel', (e) => {
      if (!this.scrollEnabled) return;
      if (this.activeMode === 'liquid') return;
      if (e.target && e.target.closest && e.target.closest('.parameters-drawer, #parameters-drawer, .mf-scroll-body, .modal, .site-header, .gem-selector-bar')) {
        return;
      }
      const curIdx = ALL_GEMS_ORDER.indexOf(this.currentValues.gem);
      if (curIdx < 0) return;

      this.isCarouselScrolling = true;
      this.lastCarouselScrollTime = performance.now();

      const delta = e.deltaY * 0.0035;
      const maxScroll = (ALL_GEMS_ORDER.length - 1) * 6.5;
      this.targetCarouselScrollY = THREE.MathUtils.clamp(
        (this.targetCarouselScrollY ?? (curIdx * 6.5)) + delta,
        0,
        maxScroll
      );
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const ALL_GEMS_ORDER = [
      'pudgy',
      'overpass',
      'froststone',
      'emberstone',
      'moonstone',
      'tidestone',
      'heartstone',
      'luckstone',
      'thunderstone'
    ];

    if (this.scrollEnabled && this.isCarouselScrolling && this.activeMode !== 'liquid') {
      this.carouselScrollY = THREE.MathUtils.lerp(
        this.carouselScrollY ?? 0,
        this.targetCarouselScrollY ?? 0,
        0.12
      );
      const continuousIdx = (this.carouselScrollY ?? 0) / 6.5;
      const nearestIdx = Math.round(continuousIdx);
      const clampedNearest = THREE.MathUtils.clamp(nearestIdx, 0, ALL_GEMS_ORDER.length - 1);
      const currentGemIdx = ALL_GEMS_ORDER.indexOf(this.currentValues.gem);
      const distFromActive = continuousIdx - (currentGemIdx >= 0 ? currentGemIdx : clampedNearest);

      if (this.activeMode === 'metalforge') {
        this.engine?.setScrollTumble?.(distFromActive, -distFromActive * 2.8, true);
      } else if (this.activeMode === 'igloo' && this.igloo) {
        this.igloo.scrollY = this.carouselScrollY;
        this.igloo.targetScrollY = this.carouselScrollY;
        this.igloo.isUserScrolling = true;
        this.igloo.lastUserScrollTime = performance.now();
      }

      // Update carousel indicator bar in real-time
      const bar = document.getElementById('indicator-bar');
      if (bar) {
        const pct = (continuousIdx / (ALL_GEMS_ORDER.length - 1)) * 100;
        bar.style.top = `${THREE.MathUtils.clamp(pct, 0, 100)}%`;
      }

      // Snap when user stops scrolling
      if (performance.now() - this.lastCarouselScrollTime > 350) {
        this.isCarouselScrolling = false;
        this.targetCarouselScrollY = clampedNearest * 6.5;
        if (this.activeMode === 'metalforge') {
          this.engine?.setScrollTumble?.(0, 0, false);
        }
        const targetGem = ALL_GEMS_ORDER[clampedNearest];
        if (targetGem && targetGem !== this.currentValues.gem) {
          this.applyGem(targetGem);
        }
      }
    }

    // Real-time update for external procedural environment (Sky Dome & FFT Ocean)
    const activeCam = this.getActiveCamera();
    const elapsedTime = performance.now() * 0.001;
    if (this.sky && this.isSkyEnabled && activeCam) {
      this.sky.update(elapsedTime, activeCam);
    }
    if (this.ocean && this.isOceanEnabled && activeCam) {
      this.ocean.update(elapsedTime, activeCam);
    }

    // Update real-time 3D projected HUD annotations
    this.hud.update(0.016);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__sim = new IglooSimulation();
});
