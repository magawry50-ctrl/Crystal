import { hexOf, intOf, gemPresets, gemById, THUNDERSTONE_DEFAULTS } from './metalforgeEngine.js';
import { LIQUID_SHAPES, LIQUID_DEFAULTS } from './liquidGlassEngine.js';


export const SYMBOL_ICONS = {
  bolt: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  `,
  flame: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-.6 3-2.5 5-4.5 7.5C5.8 11.6 5 13.7 5 16a7 7 0 0 0 14 0c0-3.3-1.8-6.1-4-8-1-1-2-2.7-3-6zm0 17a3 3 0 0 1-3-3c0-1.1.5-2.1 1.4-2.8.5.8 1.4 1.3 2.4 1.3 1.1 0 2-.9 2-2 0-.2 0-.4-.1-.6 1.4.9 2.3 2.4 2.3 4.1a3 3 0 0 1-3 3z"/>
    </svg>
  `,
  snowflake: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <line x1="3.34" y1="7" x2="20.66" y2="17"></line>
      <line x1="3.34" y1="17" x2="20.66" y2="7"></line>
      <polyline points="10 4 12 2 14 4"></polyline>
      <polyline points="10 20 12 22 14 20"></polyline>
      <polyline points="4.5 9 3.34 7 5.5 5.5"></polyline>
      <polyline points="19.5 15 20.66 17 18.5 18.5"></polyline>
      <polyline points="5.5 18.5 3.34 17 4.5 15"></polyline>
      <polyline points="18.5 5.5 20.66 7 19.5 9"></polyline>
    </svg>
  `,
  crescent: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `,
  drop: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  `,
  heart: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
    </svg>
  `,
  clover: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 11c-1.3-2.6-3.8-3.8-5.6-3.8-2.3 0-3.9 1.4-3.9 3.6 0 1.9 1.4 3.9 4 5.2 2.6-1.3 4-3.3 5.5-5zm0 0c2.6-1.3 3.8-3.8 3.8-5.6 0-2.3-1.4-3.9-3.6-3.9-1.9 0-3.9 1.4-5.2 4 1.3 2.6 3.3 4 5 5.5zm0 2c1.3 2.6 3.8 3.8 5.6 3.8 2.3 0 3.9-1.4 3.9-3.6 0-1.9-1.4-3.9-4-5.2-2.6 1.3-4 3.3-5.5 5zm0 0c-2.6 1.3-3.8 3.8-3.8 5.6 0 2.3 1.4 3.9 3.6 3.9 1.9 0 3.9-1.4 5.2-4-1.3-2.6-3.3-4-5-5.5z"/>
      <path d="M11 13c-.5 3-1.5 6-3 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  leaf: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
  `,
  '404': `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      <path d="M6 9v3h3v-3"></path>
      <path d="M9 12v3"></path>
      <path d="M15 9v3h3v-3"></path>
      <path d="M18 12v3"></path>
    </svg>
  `,
  text: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"></polyline>
      <line x1="9" y1="20" x2="15" y2="20"></line>
      <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
  `,
  authentic: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  `,
  none: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4"></line>
    </svg>
  `
};

export const COLOR_PALETTES = [
  {
    id: 'pudgy',
    name: 'Pudgy Polar',
    colors: {
      stoneColor: '#E0E8EF',
      depthColor: '#B4D2EA',
      wallColor: '#1A3048',
      veilColor: '#EBF4FC',
      glowColor: '#5CA9E6',
      symbolColor: '#83A1C5',
      lightColor: '#D6E8FA'
    }
  },
  {
    id: 'overpass',
    name: 'Overpass Caustic',
    colors: {
      stoneColor: '#EDF4FA',
      depthColor: '#8DBFE2',
      wallColor: '#14293D',
      veilColor: '#DBECF8',
      glowColor: '#38A3E8',
      symbolColor: '#4A90E2',
      lightColor: '#C2E0F9'
    }
  },
  {
    id: 'frost',
    name: 'Frost Ice',
    colors: {
      stoneColor: '#EEF7FF',
      depthColor: '#B4D8F5',
      wallColor: '#2A4560',
      veilColor: '#E6F3FF',
      glowColor: '#40B3FF',
      symbolColor: '#6FD3FF',
      lightColor: '#BFE9FF'
    }
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    colors: {
      stoneColor: '#FFE6EE',
      depthColor: '#E890AA',
      wallColor: '#6A1A36',
      veilColor: '#FFD0DE',
      glowColor: '#FF2B55',
      symbolColor: '#BE123C',
      lightColor: '#FF3355'
    }
  },
  {
    id: 'ember',
    name: 'Ruby Ember',
    colors: {
      stoneColor: '#FFD8D0',
      depthColor: '#D83A36',
      wallColor: '#6E070C',
      veilColor: '#FFB3A8',
      glowColor: '#FF6010',
      symbolColor: '#F59E0B',
      lightColor: '#FFB050'
    }
  },
  {
    id: 'moon',
    name: 'Amethyst',
    colors: {
      stoneColor: '#EEE4FF',
      depthColor: '#9C70E0',
      wallColor: '#2E0C5C',
      veilColor: '#D9C4FF',
      glowColor: '#FFBF60',
      symbolColor: '#E8D8A8',
      lightColor: '#FFE2A8'
    }
  },
  {
    id: 'tide',
    name: 'Cobalt Tide',
    colors: {
      stoneColor: '#DDE6FF',
      depthColor: '#5A78E0',
      wallColor: '#0A1F66',
      veilColor: '#A8C4FF',
      glowColor: '#24FFFF',
      symbolColor: '#14B8A6',
      lightColor: '#7FF5E6'
    }
  },
  {
    id: 'thunder',
    name: 'Emerald Bolt',
    colors: {
      stoneColor: '#B8F7DC',
      depthColor: '#5FCF9F',
      wallColor: '#065C3C',
      veilColor: '#9FD9C0',
      glowColor: '#FFCC26',
      symbolColor: '#C07A10',
      lightColor: '#FFE6A8'
    }
  },
  {
    id: 'luck',
    name: 'Citrine',
    colors: {
      stoneColor: '#FFF2D0',
      depthColor: '#F0B020',
      wallColor: '#8A5200',
      veilColor: '#FFE3A0',
      glowColor: '#80FF33',
      symbolColor: '#2F7A14',
      lightColor: '#B8FF8A'
    }
  },
  {
    id: 'obsidian',
    name: 'Obsidian Fire',
    colors: {
      stoneColor: '#E2E8F0',
      depthColor: '#475569',
      wallColor: '#0F172A',
      veilColor: '#94A3B8',
      glowColor: '#F59E0B',
      symbolColor: '#F97316',
      lightColor: '#FDE047'
    }
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    colors: {
      stoneColor: '#F3E8FF',
      depthColor: '#A855F7',
      wallColor: '#3B0764',
      veilColor: '#D8B4FE',
      glowColor: '#06B6D4',
      symbolColor: '#22D3EE',
      lightColor: '#A5F3FC'
    }
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    colors: {
      stoneColor: '#FEF3C7',
      depthColor: '#F59E0B',
      wallColor: '#78350F',
      veilColor: '#FDE68A',
      glowColor: '#EF4444',
      symbolColor: '#DC2626',
      lightColor: '#FCA5A5'
    }
  }
];

export const ALL_STONES = [
  {
    id: 'pudgy',
    name: 'Pudgy Penguins (CO_01)',
    shortName: 'Pudgy',
    badge: 'CO_01',
    isIgloo: true,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a5 5 0 0 0-5 5c0 3 .5 6-1 8 0 0 2 1 6 1s6-1 6-1c-1.5-2-1-5-1-8a5 5 0 0 0-5-5z"/>
      <circle cx="10" cy="8" r="0.8" fill="currentColor"/>
      <circle cx="14" cy="8" r="0.8" fill="currentColor"/>
      <path d="M12 10.5l-.8.8h1.6z" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'overpass',
    name: 'Overpass IP (CO_02)',
    shortName: 'Overpass',
    badge: 'CO_02',
    isIgloo: true,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <line x1="3.5" y1="9" x2="20.5" y2="9"/>
      <line x1="3.5" y1="15" x2="20.5" y2="15"/>
      <path d="M11.5 3a16.5 16.5 0 0 0 0 18"/>
      <path d="M12.5 3a16.5 16.5 0 0 1 0 18"/>
    </svg>`
  },
  {
    id: 'froststone',
    name: 'Froststone (Ice Prism)',
    shortName: 'Froststone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="3.5" y1="7" x2="20.5" y2="17"/>
      <line x1="3.5" y1="17" x2="20.5" y2="7"/>
    </svg>`
  },
  {
    id: 'emberstone',
    name: 'Emberstone (Flame)',
    shortName: 'Emberstone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.5c-.3 2.5-2.2 4.4-2.5 6.8-.4 2.8 1.1 5.3 3.5 6.2-2.5-.2-4-2.2-3.8-4.5-1.8 1.4-2.7 3.6-2.2 5.9.8 3.5 4.2 5.6 7.7 4.8 3.3-.8 5.6-3.8 5.3-7.2-.3-3.6-3.2-6.5-5.5-9.3-.8-1-1.7-2-2.5-2.7z"/>
    </svg>`
  },
  {
    id: 'moonstone',
    name: 'Moonstone (Crescent)',
    shortName: 'Moonstone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.35 15.4A9 9 0 0 1 8.6 3.65 9.005 9.005 0 0 0 12 21a9.005 9.005 0 0 0 8.35-5.6z"/>
    </svg>`
  },
  {
    id: 'tidestone',
    name: 'Tidestone (Drop)',
    shortName: 'Tidestone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>`
  },
  {
    id: 'heartstone',
    name: 'Heartstone (Heart)',
    shortName: 'Heartstone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`
  },
  {
    id: 'luckstone',
    name: 'Luckstone (Clover)',
    shortName: 'Luckstone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.5 3.5a3.5 3.5 0 0 0-3.5 3.5c0 1.25.66 2.34 1.65 2.94A3.486 3.486 0 0 0 3.5 13.5 3.5 3.5 0 0 0 7 17c1.25 0 2.34-.66 2.94-1.65A3.486 3.486 0 0 0 13.5 18a3.5 3.5 0 0 0 3.5-3.5c0-1.25-.66-2.34-1.65-2.94A3.486 3.486 0 0 0 19 8.5 3.5 3.5 0 0 0 15.5 5c-1.25 0-2.34.66-2.94 1.65A3.486 3.486 0 0 0 8.5 3.5zm2.5 10.5v6a1 1 0 0 0 2 0v-6h-2z"/>
    </svg>`
  },
  {
    id: 'thunderstone',
    name: 'Thunderstone (Bolt)',
    shortName: 'Thunderstone',
    badge: '',
    isIgloo: false,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`
  },
  {
    id: 'orb',
    name: 'Liquid Orb (Dispersion · Reflection · Caustics)',
    shortName: 'Liquid Orb',
    badge: 'LIQUID',
    isIgloo: false,
    isLiquid: true,
    iconSvg: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="12" r="9"/>
      <path d="M7 12c1.5-2 3.5-2 5 0s3.5 2 5 0"/>
    </svg>`
  }
];

/**
 * MetalForge Authentic Parameters Drawer Component
 * 100% Reverse-Engineered matching metalforge.xyz/thunderstone
 */
export class ParametersDrawer {
  constructor(options) {
    this.container = options.container;
    this.initialValues = { ...options.values };
    this.currentValues = { ...options.values };
    this.defaultValues = { ...options.defaultValues };
    this.onParamChange = options.onParamChange || (() => {});
    this.onReset = options.onReset || (() => {});
    this.onSetDefault = options.onSetDefault || (() => {});
    this.onClose = options.onClose || (() => {});
    this.activeTab = options.activeTab || 'stone';

    this.groupStates = {
      stone: true,
      inside: true,
      breaking: false,
      motion: true,
      scene: false
    };

    if (this.container) {
      this.container.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    this.render();
    this.bindEvents();
    this.updateActivePaletteIndicator();
    this.updateChangedCount();
  }

  getStoneDisplayName(gemId) {
    const s = ALL_STONES.find(st => st.id === gemId);
    return s ? (s.badge ? `${s.shortName} (${s.badge})` : s.shortName) : 'Pudgy (CO_01)';
  }

  calculateChangedCount() {
    let count = 0;
    const ignoreKeys = ['gem'];
    for (const [key, val] of Object.entries(this.currentValues)) {
      if (ignoreKeys.includes(key)) continue;
      const defVal = this.defaultValues[key];
      if (defVal === undefined) continue;

      if (typeof val === 'number') {
        if (Math.abs(val - defVal) > 0.001) count++;
      } else if (typeof val === 'string') {
        if (val.toLowerCase() !== String(defVal).toLowerCase()) count++;
      } else if (typeof val === 'boolean') {
        if (val !== defVal) count++;
      }
    }
    return count;
  }

  updateChangedCount() {
    const el = document.getElementById('mf-changed-count');
    if (el) {
      el.textContent = this.calculateChangedCount();
    }
  }

  renderColorRow(label, key, val, defaultVal, disabled = false) {
    const currentHex = (val || defaultVal || '#FFFFFF').toUpperCase();
    const rawHex = currentHex.replace('#', '');
    return `
      <div class="mf-row-color ${disabled ? 'mf-deactivated' : ''}">
        <div class="mf-row-color-meta">
          <div class="mf-row-title">${label}</div>
          <div class="mf-hex-input-wrap">
            <span class="mf-hex-hash">#</span>
            <input type="text" 
                   id="hex-${key}" 
                   class="mf-hex-input mono" 
                   data-key="${key}" 
                   value="${rawHex}" 
                   maxlength="6" 
                   spellcheck="false" 
                   placeholder="${rawHex}"
                   title="Enter 6-digit hex code or click swatch"
                   ${disabled ? 'disabled' : ''}>
          </div>
        </div>
        <label class="color-swatch-box checker btn-press ${disabled ? 'opacity-40 pointer-events-none' : ''}" title="Click to open color picker">
          <span id="preview-${key}" class="color-swatch-preview" style="background: ${currentHex};"></span>
          <input type="color" data-key="${key}" value="${currentHex}" ${disabled ? 'disabled' : ''}>
        </label>
      </div>
    `;
  }

  render() {
    const v = this.currentValues;
    const isLiquid = (v.gem === 'orb' || !!LIQUID_SHAPES[v.gem]);
    const isIgloo = (v.gem === 'pudgy' || v.gem === 'overpass');

    this.container.innerHTML = `
      <div class="px-5 pt-4 pb-3 flex items-center justify-between hairline-b mf-header-bar">
        <div class="mf-title-eyebrow">PARAMETERS</div>
        <div class="flex items-center gap-1.5">
          <button id="btn-mf-set-default" class="mf-icon-btn btn-press" title="Set Default (حفظ كافتراضي)" aria-label="Set Default">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>
          <button id="btn-mf-reset" class="mf-icon-btn btn-press" title="Reset to preset defaults" aria-label="Reset all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7"></path>
              <path d="M3 4v5h5"></path>
            </svg>
          </button>
          <button id="btn-mf-close" class="mf-icon-btn btn-press" title="Close drawer" aria-label="Close drawer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Sticky Tabs Navigation Bar -->
      <div class="mf-tabs-bar">
        <button type="button" class="mf-tab-btn btn-press" data-tab="stone" data-active="${this.activeTab === 'stone'}">
          <span class="mf-tab-icon">${isLiquid ? '🌊' : '💎'}</span>
          <span class="mf-tab-label">${isLiquid ? 'Liquid Glass' : 'Stone Shape'}</span>
        </button>
        <button type="button" class="mf-tab-btn btn-press" data-tab="inside" data-active="${this.activeTab === 'inside'}">
          <span class="mf-tab-icon">⚡</span>
          <span class="mf-tab-label">Inside</span>
        </button>
        <button type="button" class="mf-tab-btn btn-press" data-tab="dynamics" data-active="${this.activeTab === 'dynamics'}">
          <span class="mf-tab-icon">🎬</span>
          <span class="mf-tab-label">Dynamics</span>
        </button>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto nice-scroll px-5 py-2 mf-scroll-body">
        
        <!-- TAB 1: STONE SHAPE / LIQUID GLASS -->
        <div class="mf-tab-content" data-tab="stone" data-active="${this.activeTab === 'stone'}">
          ${isLiquid ? `
            <!-- 10 Liquid Geometries Selection (Liquid Mode Only) -->
            <div class="mf-stone-shape-section">
              <div class="mf-stone-shape-header">
                <span class="mf-row-title text-[11px] font-semibold text-muted uppercase tracking-wider">Liquid Geometry (10)</span>
                <span id="mf-active-liquid-shape" class="mono text-[10px] text-accent font-bold">${LIQUID_SHAPES[v.shape || 'torus']?.label || 'Torus'}</span>
              </div>
              <div class="mf-liquid-shapes-grid">
                ${Object.values(LIQUID_SHAPES).map(ls => `
                  <button type="button" 
                          class="mf-liquid-shape-pill btn-press" 
                          data-liquid-shape="${ls.id}" 
                          data-active="${(v.shape || 'torus') === ls.id}" 
                          title="${ls.note}">
                    <span>${ls.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Glass Tint Color -->
            ${this.renderColorRow('Glass Tint', 'tint', v.tint, '#eef6fb')}

            <!-- Dispersion slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Dispersion (Abbe)</label>
                <span id="val-dispersion" class="mf-row-val mono">${Number(v.dispersion ?? 1.05).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="dispersion" min="0.0" max="3.0" step="0.05" value="${v.dispersion ?? 1.05}">
            </div>

            <!-- IOR slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Index of Refraction (IOR)</label>
                <span id="val-ior" class="mf-row-val mono">${Number(v.ior ?? 1.63).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="ior" min="1.0" max="2.4" step="0.01" value="${v.ior ?? 1.63}">
            </div>

            <!-- Thickness slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Glass Thickness</label>
                <span id="val-thickness" class="mf-row-val mono">${Number(v.thickness ?? 2.60).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="thickness" min="0.0" max="6.0" step="0.1" value="${v.thickness ?? 2.60}">
            </div>

            <!-- Roughness slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Roughness</label>
                <span id="val-roughness" class="mf-row-val mono">${Number(v.roughness ?? 0.13).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="roughness" min="0.0" max="1.0" step="0.01" value="${v.roughness ?? 0.13}">
            </div>

            <!-- Iridescence slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Iridescence</label>
                <span id="val-iridescence" class="mf-row-val mono">${Number(v.iridescence ?? 0.11).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="iridescence" min="0.0" max="1.0" step="0.01" value="${v.iridescence ?? 0.11}">
            </div>

            <!-- Clearcoat slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Clearcoat</label>
                <span id="val-clearcoat" class="mf-row-val mono">${Number(v.clearcoat ?? 0.45).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="clearcoat" min="0.0" max="1.0" step="0.01" value="${v.clearcoat ?? 0.45}">
            </div>

            <!-- Ripple Noise slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Wave Ripple Noise</label>
                <span id="val-noise" class="mf-row-val mono">${Number(v.noise ?? 0.34).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="noise" min="0.0" max="1.5" step="0.02" value="${v.noise ?? 0.34}">
            </div>

            <!-- Flow Speed slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Flow Speed</label>
                <span id="val-speed" class="mf-row-val mono">${Number(v.speed ?? 0.95).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="speed" min="0.0" max="3.0" step="0.05" value="${v.speed ?? 0.95}">
            </div>

            <!-- Shape Size slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Shape Size</label>
                <span id="val-size" class="mf-row-val mono">${Number(v.size ?? 0.90).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="size" min="0.2" max="2.0" step="0.05" value="${v.size ?? 0.90}">
            </div>

            <!-- Twist slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Twist</label>
                <span id="val-twist" class="mf-row-val mono">${Number(v.twist ?? 0.0).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="twist" min="-3.0" max="3.0" step="0.1" value="${v.twist ?? 0.0}">
            </div>

            <!-- Tube Radius slider -->
            <div class="mf-row-slider" id="mf-row-tube" style="${['torus', 'knot'].includes(v.shape || 'torus') ? '' : 'display:none;'}">
              <div class="mf-row-header">
                <label class="mf-row-title">Tube Radius</label>
                <span id="val-tube" class="mf-row-val mono">${Number(v.tube ?? 0.12).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="tube" min="0.05" max="0.35" step="0.01" value="${v.tube ?? 0.12}">
            </div>
          ` : `
            <!-- 1- Rock & 2- Crystals Stone Archetype Selection -->
            <div class="mf-stone-shape-section">
              <div class="mf-stone-shape-header">
                <span class="mf-row-title text-[11px] font-semibold text-muted uppercase tracking-wider">1- Rock (Igloo Inc)</span>
                <span id="mf-active-stone-name" class="mono text-[10px] text-accent font-bold">${this.getStoneDisplayName(v.gem || 'pudgy')}</span>
              </div>
              <div class="mf-stone-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 12px;">
                ${ALL_STONES.filter(s => s.isIgloo).map(s => `
                  <button type="button" 
                          class="mf-stone-pill btn-press pill-igloo" 
                          data-stone="${s.id}" 
                          data-active="${(v.gem || 'pudgy') === s.id}" 
                          title="${s.name}">
                    <span class="mf-stone-icon">${s.iconSvg}</span>
                    <span class="mf-stone-title">${s.shortName}</span>
                    ${s.badge ? `<span class="mf-stone-badge">${s.badge}</span>` : ''}
                  </button>
                `).join('')}
              </div>

              <div class="mf-stone-shape-header">
                <span class="mf-row-title text-[11px] font-semibold text-muted uppercase tracking-wider">2- Crystals (MetalForge)</span>
                <span class="mono text-[9px] text-muted">7 Presets</span>
              </div>
              <div class="mf-stone-grid">
                ${ALL_STONES.filter(s => !s.isIgloo && !s.isLiquid).map(s => `
                  <button type="button" 
                          class="mf-stone-pill btn-press" 
                          data-stone="${s.id}" 
                          data-active="${(v.gem || 'pudgy') === s.id}" 
                          title="${s.name}">
                    <span class="mf-stone-icon">${s.iconSvg}</span>
                    <span class="mf-stone-title">${s.shortName}</span>
                    ${s.badge ? `<span class="mf-stone-badge">${s.badge}</span>` : ''}
                  </button>
                `).join('')}
              </div>
            </div>

            ${isIgloo ? `
              <div class="mf-igloo-deactivated-badge">
                <div class="mf-deact-title">
                  <span>🔒</span>
                  <span>Properties Deactivated (الخصائص معطلة)</span>
                </div>
                <div class="mf-deact-desc">
                  حجر <b>${this.getStoneDisplayName(v.gem)}</b> محمي بخصائص Igloo Inc الأصلية. تم تعطيل تخصيص الألوان والطبقات وسماكة الجليد للحفاظ على هويته الأصلية دون تشويه.
                </div>
              </div>
            ` : ''}

            <div class="${isIgloo ? 'mf-deactivated' : ''}">
              <!-- Palette Presets Quick Switch -->
              <div class="mf-palette-section">
                <div class="mf-palette-header">
                  <span class="mf-row-title text-[11px] font-semibold text-muted uppercase tracking-wider">Palette Presets ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</span>
                  <span id="mf-active-palette-name" class="mono text-[10px] text-muted">Custom</span>
                </div>
                <div class="mf-palette-grid">
                  ${COLOR_PALETTES.map(p => `
                    <button type="button" class="mf-palette-chip btn-press" data-palette="${p.id}" title="${p.name}" ${isIgloo ? 'disabled' : ''}>
                      <div class="mf-palette-bars">
                        <span style="background: ${p.colors.stoneColor}"></span>
                        <span style="background: ${p.colors.depthColor}"></span>
                        <span style="background: ${p.colors.wallColor}"></span>
                        <span style="background: ${p.colors.veilColor}"></span>
                        <span style="background: ${p.colors.glowColor}"></span>
                      </div>
                      <span class="mf-palette-name">${p.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Glass Color -->
              ${this.renderColorRow('Glass' + (isIgloo ? ' <span class="mf-deact-tag">Deactivated</span>' : ''), 'stoneColor', v.stoneColor, '#EEF7FF', isIgloo)}

              <!-- Depth Color -->
              ${this.renderColorRow('Depth' + (isIgloo ? ' <span class="mf-deact-tag">Deactivated</span>' : ''), 'depthColor', v.depthColor, '#B4D8F5', isIgloo)}

              <!-- Far Wall Color -->
              ${this.renderColorRow('Far wall' + (isIgloo ? ' <span class="mf-deact-tag">Deactivated</span>' : ''), 'wallColor', v.wallColor, '#9E9E9E', isIgloo)}

              <!-- Veils Color -->
              ${this.renderColorRow('Veils' + (isIgloo ? ' <span class="mf-deact-tag">Deactivated</span>' : ''), 'veilColor', v.veilColor, '#E6F3FF', isIgloo)}

              <!-- Inner Glow Color -->
              ${this.renderColorRow('Inner glow' + (isIgloo ? ' <span class="mf-deact-tag">Deactivated</span>' : ''), 'glowColor', v.glowColor, '#40B3FF', isIgloo)}

              <!-- Depth of colour slider -->
              <div class="mf-row-slider">
                <div class="mf-row-header">
                  <label class="mf-row-title">Depth of colour ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</label>
                  <span id="val-depth" class="mf-row-val mono">${Number(v.depth ?? 1.50).toFixed(2)}</span>
                </div>
                <input class="ios" type="range" data-key="depth" min="0.3" max="5.0" step="0.05" value="${v.depth ?? 1.50}" ${isIgloo ? 'disabled' : ''}>
              </div>

              <!-- Thickness slider -->
              <div class="mf-row-slider">
                <div class="mf-row-header">
                  <label class="mf-row-title">Thickness ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</label>
                  <span id="val-thickness" class="mf-row-val mono">${Number(v.thickness ?? 0.16).toFixed(2)}</span>
                </div>
                <input class="ios" type="range" data-key="thickness" min="0.0" max="1.2" step="0.01" value="${v.thickness ?? 0.16}" ${isIgloo ? 'disabled' : ''}>
              </div>

              <!-- Roughness slider -->
              <div class="mf-row-slider">
                <div class="mf-row-header">
                  <label class="mf-row-title">Roughness ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</label>
                  <span id="val-roughness" class="mf-row-val mono">${Number(v.roughness ?? 0.50).toFixed(2)}</span>
                </div>
                <input class="ios" type="range" data-key="roughness" min="0.0" max="1.0" step="0.01" value="${v.roughness ?? 0.50}" ${isIgloo ? 'disabled' : ''}>
              </div>

              <!-- Frost slider -->
              <div class="mf-row-slider">
                <div class="mf-row-header">
                  <label class="mf-row-title">Frost ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</label>
                  <span id="val-frostAmount" class="mf-row-val mono">${Number(v.frostAmount ?? 1.65).toFixed(2)}</span>
                </div>
                <input class="ios" type="range" data-key="frostAmount" min="0.0" max="3.0" step="0.05" value="${v.frostAmount ?? 1.65}" ${isIgloo ? 'disabled' : ''}>
              </div>
            </div>
          `}
        </div>

        <!-- TAB 2: INSIDE SPECIMEN -->
        <div class="mf-tab-content" data-tab="inside" data-active="${this.activeTab === 'inside'}">
          ${isLiquid ? `
            <div class="mf-static-label">REFRACTED 3D TEXT</div>
            <div class="mf-row-header mb-2">
              <span class="mf-row-title">Refracted Text</span>
              <span class="mono text-[11px] text-muted">Behind glass plane</span>
            </div>
            
            <div class="mb-3">
              <input type="text" id="mf-liquid-text-input" class="mf-text-input" placeholder="TORUS" value="${v.text || 'TORUS'}">
            </div>

            <!-- Text Color -->
            ${this.renderColorRow('Text Color', 'textColor', v.textColor, '#4a5157')}

            <!-- Text Size slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Text Size</label>
                <span id="val-textSize" class="mf-row-val mono">${Number(v.textSize ?? 1.0).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="textSize" min="0.4" max="2.5" step="0.05" value="${v.textSize ?? 1.0}">
            </div>
          ` : `
            <div class="mf-static-label">INSIDE SPECIMEN</div>

            <!-- Toggle Inside Specimen Switch -->
            <div class="mf-row-switch mb-3">
              <div>
                <div class="mf-row-title">Inside Specimen</div>
                <div class="mf-row-desc">Show/hide 3D body inside the stone</div>
              </div>
              <button type="button" role="switch" class="mf-switch" id="mf-switch-symbol-visible" data-key="symbolVisible" aria-checked="${v.symbolVisible !== false && v.symbol !== 'none'}">
                <span class="mf-switch-knob"></span>
              </button>
            </div>

            <div class="mf-row-header mb-2">
              <span class="mf-row-title">3D Glyph Shape</span>
              <span id="mf-active-symbol-label" class="mono text-[11px] text-muted">${(v.symbol === 'none' || v.symbolVisible === false) ? 'None (بدون جسم)' : (v.symbol === 'authentic' ? 'Authentic (أصلي)' : ((v.symbol || 'snowflake').charAt(0).toUpperCase() + (v.symbol || 'snowflake').slice(1)))}</span>
            </div>
            
            <!-- 3-Column Pill Grid for Symbols -->
            <div class="mf-symbol-grid mb-3">
              ${[
                { id: 'authentic', label: 'Authentic (أصلي)' },
                { id: 'none', label: 'None (بدون)' },
                { id: 'bolt', label: 'Bolt' },
                { id: 'flame', label: 'Flame' },
                { id: 'snowflake', label: 'Snowflake' },
                { id: 'crescent', label: 'Crescent' },
                { id: 'drop', label: 'Drop' },
                { id: 'heart', label: 'Heart' },
                { id: 'clover', label: 'Clover' },
                { id: 'leaf', label: 'Leaf' },
                { id: '404', label: '404' },
                { id: 'text', label: 'Your word' }
              ].map(sym => `
                <button type="button" class="mf-symbol-pill btn-press" data-symbol="${sym.id}" data-active="${(v.symbol === 'none' || v.symbolVisible === false) ? sym.id === 'none' : (v.symbol || 'snowflake') === sym.id}" title="${sym.label}">
                  <span class="mf-symbol-icon">${SYMBOL_ICONS[sym.id] || ''}</span>
                  <span class="mf-symbol-label">${sym.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- Custom word input when 'Your word' is chosen -->
            <div id="mf-word-input-container" class="mf-row-word ${v.symbol === 'text' ? '' : 'hidden'} mb-3">
              <div class="mf-row-header">
                <label class="mf-row-title">Custom Word</label>
              </div>
              <input type="text" id="mf-custom-text-input" class="mf-text-input" placeholder="Enter word..." value="${v.text || ''}">
            </div>

            <div class="mf-section-divider"></div>
            <div class="mf-static-label">SPECIMEN APPEARANCE</div>

            <!-- Symbol Color -->
            ${this.renderColorRow('Symbol', 'symbolColor', v.symbolColor, '#6FD3FF')}

            <!-- Its Light Color -->
            ${this.renderColorRow('Its light', 'lightColor', v.lightColor, '#BFE9FF')}

            <!-- Glow slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Glow</label>
                <span id="val-glow" class="mf-row-val mono">${Number(v.glow ?? 0.75).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="glow" min="0.0" max="3.0" step="0.05" value="${v.glow ?? 0.75}">
            </div>

            <!-- Size slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Size</label>
                <span id="val-symbolSize" class="mf-row-val mono">${Number(v.symbolSize ?? 0.64).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="symbolSize" min="0.3" max="2.0" step="0.01" value="${v.symbolSize ?? 0.64}">
            </div>

            <!-- Turn slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Turn</label>
                <span id="val-symbolTurn" class="mf-row-val mono">${Math.round(v.symbolTurn ?? -55)} °</span>
              </div>
              <input class="ios" type="range" data-key="symbolTurn" min="-180" max="180" step="1" value="${v.symbolTurn ?? -55}">
            </div>

            <!-- Spin when bare slider (Static default 0.70) -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Spin when bare</label>
                <span id="val-symbolSpin" class="mf-row-val mono">${Number(v.symbolSpin ?? 0.70).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="symbolSpin" min="0.0" max="3.0" step="0.05" value="${v.symbolSpin ?? 0.70}">
            </div>
          `}
        </div>

        <!-- TAB 3: DYNAMICS & SCENE -->
        <div class="mf-tab-content" data-tab="dynamics" data-active="${this.activeTab === 'dynamics'}">
          <div class="mf-static-label">MOTION & FLOATING</div>

          <!-- Spin slider -->
          <div class="mf-row-slider">
            <div class="mf-row-header">
              <label class="mf-row-title">Spin</label>
              <span id="val-spin" class="mf-row-val mono">${Number(v.spin ?? (isLiquid ? 0.40 : 0.25)).toFixed(2)}</span>
            </div>
            <input class="ios" type="range" data-key="spin" min="-2.5" max="2.5" step="0.05" value="${v.spin ?? (isLiquid ? 0.40 : 0.25)}">
          </div>

          <!-- Bob slider -->
          <div class="mf-row-slider">
            <div class="mf-row-header">
              <label class="mf-row-title">Bob</label>
              <span id="val-bob" class="mf-row-val mono">${Number(v.bob ?? (isLiquid ? 0.20 : 0.90)).toFixed(2)}</span>
            </div>
            <input class="ios" type="range" data-key="bob" min="0.0" max="3.0" step="0.05" value="${v.bob ?? (isLiquid ? 0.20 : 0.90)}">
          </div>

          <!-- Extra tilt slider (unit: °) -->
          <div class="mf-row-slider">
            <div class="mf-row-header">
              <label class="mf-row-title">Extra tilt</label>
              <span id="val-tilt" class="mf-row-val mono">${Math.round(v.tilt ?? (isLiquid ? -4 : -8))} °</span>
            </div>
            <input class="ios" type="range" data-key="tilt" min="-45" max="45" step="1" value="${v.tilt ?? (isLiquid ? -4 : -8)}">
          </div>

          <!-- Drag to turn Switch -->
          <div class="mf-row-switch">
            <div>
              <div class="mf-row-title">Drag to turn</div>
              <div class="mf-row-desc">Off: the stone is a picture you can still break</div>
            </div>
            <button type="button" role="switch" class="mf-switch" data-key="orbit" aria-checked="${v.orbit !== undefined ? v.orbit : (isLiquid ? false : true)}">
              <span class="mf-switch-knob"></span>
            </button>
          </div>

          <!-- Breaking / Shatter Section -->
          ${isLiquid ? `
            <div class="mf-section-divider"></div>
            <div class="text-[12px] text-muted py-2 leading-relaxed">
              Continuous simplex 3D fluid simulation active. The glass body ripples, twists, and breathes dynamically with real-time normal recomputation instead of rigid solid fractures.
            </div>
          ` : `
            <div class="mf-section-divider"></div>
            ${isIgloo ? `
              <div class="mf-igloo-deactivated-badge">
                <div class="mf-deact-title">
                  <span>🔒</span>
                  <span>Breaking Dynamics Deactivated (التهشيم معطل)</span>
                </div>
                <div class="mf-deact-desc">
                  التكسير والتهشيم معطل لـ <b>${this.getStoneDisplayName(v.gem)}</b> (حجر جليدي مصمت غير مخصص للكسر الفيزيائي).
                </div>
              </div>
            ` : ''}
            <div class="${isIgloo ? 'mf-deactivated' : ''}">
              <button type="button" class="mf-disc" data-group="breaking" data-open="${this.groupStates.breaking}" ${isIgloo ? 'disabled' : ''}>
                <span class="mf-disc-chev">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="m9 6 6 6-6 6"></path>
                  </svg>
                </span>
                <span class="mf-disc-label">BREAKING DYNAMICS ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</span>
                <span class="mf-disc-count mono">9</span>
              </button>
              <div id="mf-body-breaking" class="mf-disc-body ${this.groupStates.breaking ? '' : 'collapsed'}">
                <!-- Breakable Switch -->
                <div class="mf-row-switch">
                  <div>
                    <div class="mf-row-title">Breakable</div>
                    <div class="mf-row-desc">Click to chip · double-click to shatter</div>
                  </div>
                  <button type="button" role="switch" class="mf-switch" data-key="breakable" aria-checked="${v.breakable !== false}" ${isIgloo ? 'disabled' : ''}>
                    <span class="mf-switch-knob"></span>
                  </button>
                </div>

                <!-- Pieces Stepper -->
                <div class="mf-row-stepper">
                  <div class="mf-row-title">Pieces</div>
                  <div class="mf-stepper">
                    <button type="button" class="mf-stepper-btn btn-press" data-stepper="pieces" data-dir="-1" aria-label="Decrease Pieces" ${isIgloo ? 'disabled' : ''}>−</button>
                    <span id="val-pieces" class="mf-stepper-val mono">${Math.round(v.pieces ?? 84)}</span>
                    <button type="button" class="mf-stepper-btn btn-press" data-stepper="pieces" data-dir="1" aria-label="Increase Pieces" ${isIgloo ? 'disabled' : ''}>+</button>
                  </div>
                </div>

                <!-- Chip size slider -->
                <div class="mf-row-slider">
                  <div class="mf-row-header">
                    <label class="mf-row-title">Chip size</label>
                    <span id="val-chipSize" class="mf-row-val mono">${Number(v.chipSize ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input class="ios" type="range" data-key="chipSize" min="0.25" max="2.5" step="0.05" value="${v.chipSize ?? 1.0}" ${isIgloo ? 'disabled' : ''}>
                </div>

                <!-- Chip depth slider -->
                <div class="mf-row-slider">
                  <div class="mf-row-header">
                    <label class="mf-row-title">Chip depth</label>
                    <span id="val-chipDepth" class="mf-row-val mono">${Number(v.chipDepth ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input class="ios" type="range" data-key="chipDepth" min="0.25" max="3.0" step="0.05" value="${v.chipDepth ?? 1.0}" ${isIgloo ? 'disabled' : ''}>
                </div>

                <!-- Chip pieces Stepper -->
                <div class="mf-row-stepper">
                  <div class="mf-row-title">Chip pieces</div>
                  <div class="mf-stepper">
                    <button type="button" class="mf-stepper-btn btn-press" data-stepper="chipMax" data-dir="-1" aria-label="Decrease Chip Pieces" ${isIgloo ? 'disabled' : ''}>−</button>
                    <span id="val-chipMax" class="mf-stepper-val mono">${Math.round(v.chipMax ?? 14)}</span>
                    <button type="button" class="mf-stepper-btn btn-press" data-stepper="chipMax" data-dir="1" aria-label="Increase Chip Pieces" ${isIgloo ? 'disabled' : ''}>+</button>
                  </div>
                </div>

                <!-- Gravity slider -->
                <div class="mf-row-slider">
                  <div class="mf-row-header">
                    <label class="mf-row-title">Gravity</label>
                    <span id="val-gravity" class="mf-row-val mono">${Number(v.gravity ?? 26.0).toFixed(1)}</span>
                  </div>
                  <input class="ios" type="range" data-key="gravity" min="2.0" max="70.0" step="0.5" value="${v.gravity ?? 26.0}" ${isIgloo ? 'disabled' : ''}>
                </div>

                <!-- Charge slider (unit: s) -->
                <div class="mf-row-slider">
                  <div class="mf-row-header">
                    <label class="mf-row-title">Charge</label>
                    <span id="val-charge" class="mf-row-val mono">${Number(v.charge ?? 1.4).toFixed(2)} s</span>
                  </div>
                  <input class="ios" type="range" data-key="charge" min="0.2" max="5.0" step="0.05" value="${v.charge ?? 1.4}" ${isIgloo ? 'disabled' : ''}>
                </div>

                <!-- Flare slider -->
                <div class="mf-row-slider">
                  <div class="mf-row-header">
                    <label class="mf-row-title">Flare</label>
                    <span id="val-burst" class="mf-row-val mono">${Number(v.burst ?? 5.5).toFixed(1)}</span>
                  </div>
                  <input class="ios" type="range" data-key="burst" min="1.0" max="14.0" step="0.1" value="${v.burst ?? 5.5}" ${isIgloo ? 'disabled' : ''}>
                </div>

                <!-- Dust slider -->
                <div class="mf-row-slider">
                  <div class="mf-row-header">
                    <label class="mf-row-title">Dust</label>
                    <span id="val-dust" class="mf-row-val mono">${Number(v.dust ?? 1.0).toFixed(2)}</span>
                  </div>
                  <input class="ios" type="range" data-key="dust" min="0.0" max="2.5" step="0.05" value="${v.dust ?? 1.0}" ${isIgloo ? 'disabled' : ''}>
                </div>
              </div>
            </div>
          `}

          <!-- Scene Settings Section -->
          <div class="mf-section-divider"></div>
          <button type="button" class="mf-disc" data-group="scene" data-open="${this.groupStates.scene}">
            <span class="mf-disc-chev">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </span>
            <span class="mf-disc-label">SCENE & CAMERA</span>
            <span class="mf-disc-count mono">4</span>
          </button>
          <div id="mf-body-scene" class="mf-disc-body ${this.groupStates.scene ? '' : 'collapsed'}">
            <div class="mf-row-header mb-1.5">
              <span class="mf-row-title">Background</span>
              <span id="mf-active-bg-label" class="mono text-[11px] text-muted">${v.background === 'color' ? 'Colour' : 'Transparent'}</span>
            </div>

            <!-- Segmented Control for Background -->
            <div class="mf-seg mb-3">
              <button type="button" class="mf-seg-btn btn-press" data-bg="color" data-active="${v.background === 'color'}">Colour</button>
              <button type="button" class="mf-seg-btn btn-press" data-bg="transparent" data-active="${v.background !== 'color'}">Transparent</button>
            </div>

            <!-- Background Colour (visible when background === 'color') -->
            <div id="mf-row-bg-color" class="${v.background === 'color' ? '' : 'hidden'}">
              ${this.renderColorRow('Colour', 'bgColor', v.bgColor, '#000000')}
            </div>

            <!-- Bloom slider -->
            <div class="mf-row-slider ${isIgloo ? 'mf-deactivated' : ''}">
              <div class="mf-row-header">
                <label class="mf-row-title">Bloom ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</label>
                <span id="val-bloom" class="mf-row-val mono">${Number(v.bloom ?? (isLiquid ? 0.32 : 0.10)).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="bloom" min="0.0" max="1.5" step="0.01" value="${v.bloom ?? (isLiquid ? 0.32 : 0.10)}" ${isIgloo ? 'disabled' : ''}>
            </div>

            <!-- Exposure slider -->
            <div class="mf-row-slider ${isIgloo ? 'mf-deactivated' : ''}">
              <div class="mf-row-header">
                <label class="mf-row-title">Exposure ${isIgloo ? '<span class="mf-deact-tag">Deactivated</span>' : ''}</label>
                <span id="val-exposure" class="mf-row-val mono">${Number(v.exposure ?? (isLiquid ? 0.65 : 0.77)).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="exposure" min="0.2" max="2.5" step="0.01" value="${v.exposure ?? (isLiquid ? 0.65 : 0.77)}" ${isIgloo ? 'disabled' : ''}>
            </div>

            <!-- Zoom slider -->
            <div class="mf-row-slider">
              <div class="mf-row-header">
                <label class="mf-row-title">Zoom</label>
                <span id="val-zoom" class="mf-row-val mono">${Number(v.zoom ?? (isLiquid ? 1.15 : 0.96)).toFixed(2)}</span>
              </div>
              <input class="ios" type="range" data-key="zoom" min="0.5" max="2.0" step="0.01" value="${v.zoom ?? (isLiquid ? 1.15 : 0.96)}">
            </div>
          </div>
        </div>

      </div>

      <!-- FOOTER -->
      <div class="hairline-t px-5 py-3 flex items-center justify-between mf-footer-bar">
        <button id="btn-mf-share-link" class="btn-press flex items-center gap-1.5 text-[12px] h-8 px-2.5 rounded-lg text-muted mf-link-btn" title="Copy URL parameters to clipboard">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 14a4 4 0 0 1 0-5.6l2.8-2.8a4 4 0 1 1 5.6 5.6L17 12.6"></path>
            <path d="M14 10a4 4 0 0 1 0 5.6l-2.8 2.8a4 4 0 0 1-5.6-5.6L7 11.4"></path>
          </svg>
          <span id="mf-copy-btn-text">Copy share link</span>
        </button>
        <span class="mono text-[11px] text-muted"><span id="mf-changed-count">0</span> changed</span>
      </div>
    `;

    // Initialize progress indicators for all sliders
    this.container.querySelectorAll('input.ios[type="range"]').forEach(input => {
      this.updateSliderTrack(input);
    });
  }

  updateSliderTrack(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value) || 0;
    const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    input.style.setProperty('--p', `${pct}%`);
  }

  formatSliderValue(key, val) {
    if (key === 'charge') return `${val.toFixed(2)} s`;
    if (key === 'burst') return val.toFixed(1);
    if (key === 'gravity') return val.toFixed(1);
    if (key === 'symbolTurn' || key === 'tilt') return `${Math.round(val)} °`;
    if (key === 'pieces' || key === 'chipMax') return `${Math.round(val)}`;
    return val.toFixed(2);
  }

  bindEvents() {
    // 0. Tabs Switching
    this.container.querySelectorAll('.mf-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (!tab || tab === this.activeTab) return;
        this.activeTab = tab;
        this.container.querySelectorAll('.mf-tab-btn').forEach(b => {
          b.setAttribute('data-active', String(b.dataset.tab === tab));
        });
        this.container.querySelectorAll('.mf-tab-content').forEach(c => {
          c.setAttribute('data-active', String(c.dataset.tab === tab));
        });
      });
    });

    // 1. Group Collapse / Expand toggles
    this.container.querySelectorAll('.mf-disc').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const group = btn.dataset.group;
        if (!group) return;
        const isIgloo = (this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass');
        if (isIgloo && group === 'breaking') return;
        const isOpen = btn.getAttribute('data-open') === 'true';
        const nextState = !isOpen;
        btn.setAttribute('data-open', String(nextState));
        this.groupStates[group] = nextState;

        const body = document.getElementById(`mf-body-${group}`);
        if (body) {
          if (nextState) body.classList.remove('collapsed');
          else body.classList.add('collapsed');
        }
      });
    });

    // 2. Collapse / Expand all groups
    const btnCollapseAll = this.container.querySelector('#btn-mf-collapse-all');
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener('click', () => {
        const anyOpen = Object.values(this.groupStates).some(s => s);
        const newState = !anyOpen;
        for (const grp of Object.keys(this.groupStates)) {
          this.groupStates[grp] = newState;
          const b = this.container.querySelector(`.mf-disc[data-group="${grp}"]`);
          if (b) b.setAttribute('data-open', String(newState));
          const body = document.getElementById(`mf-body-${grp}`);
          if (body) {
            if (newState) body.classList.remove('collapsed');
            else body.classList.add('collapsed');
          }
        }
      });
    }

    // 3a. Set Default button
    const btnSetDefault = this.container.querySelector('#btn-mf-set-default');
    if (btnSetDefault) {
      btnSetDefault.addEventListener('click', () => {
        if (typeof this.onSetDefault === 'function') {
          this.onSetDefault(this.currentValues);
        }
        btnSetDefault.classList.add('text-sky-400');
        btnSetDefault.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        setTimeout(() => {
          btnSetDefault.classList.remove('text-sky-400');
          btnSetDefault.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          `;
        }, 1500);
      });
    }

    // 3. Reset All button
    const btnReset = this.container.querySelector('#btn-mf-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.onReset();
      });
    }

    // 4. Close Drawer button
    const btnClose = this.container.querySelector('#btn-mf-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.onClose();
      });
    }

    // 4b. Stone Shape Selection
    this.container.querySelectorAll('.mf-stone-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const stoneId = pill.dataset.stone;
        const wasIgloo = (this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass');
        const isNowIgloo = (stoneId === 'pudgy' || stoneId === 'overpass');
        this.currentValues.gem = stoneId;

        this.container.querySelectorAll('.mf-stone-pill').forEach(p => {
          p.setAttribute('data-active', String(p.dataset.stone === stoneId));
        });

        const activeLbl = document.getElementById('mf-active-stone-name');
        if (activeLbl) {
          activeLbl.textContent = this.getStoneDisplayName(stoneId);
        }

        this.onParamChange('gem', stoneId);
        this.updateChangedCount();

        if (wasIgloo !== isNowIgloo) {
          this.render();
          this.bindEvents();
          this.updateActivePaletteIndicator();
        }
      });
    });

    // 4c. Liquid Shape Selection (10 Liquid Geometries)
    this.container.querySelectorAll('.mf-liquid-shape-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const shapeId = pill.dataset.liquidShape;
        const shapeObj = LIQUID_SHAPES[shapeId];
        if (!shapeObj) return;

        this.currentValues.shape = shapeId;
        if (shapeObj.presets?.text && !this.currentValues.text_userEdited) {
          this.currentValues.text = shapeObj.presets.text;
          const textInput = document.getElementById('mf-liquid-text-input');
          if (textInput) textInput.value = shapeObj.presets.text;
        }
        if (shapeObj.presets?.size) {
          this.currentValues.size = shapeObj.presets.size;
          const sizeSlider = this.container.querySelector('input[data-key="size"]');
          if (sizeSlider) {
            sizeSlider.value = shapeObj.presets.size;
            this.updateSliderTrack(sizeSlider);
          }
          const sizeVal = document.getElementById('val-size');
          if (sizeVal) sizeVal.textContent = shapeObj.presets.size.toFixed(2);
        }

        this.container.querySelectorAll('.mf-liquid-shape-pill').forEach(p => {
          p.setAttribute('data-active', String(p.dataset.liquidShape === shapeId));
        });

        const activeLbl = document.getElementById('mf-active-liquid-shape');
        if (activeLbl) {
          activeLbl.textContent = shapeObj.label;
        }

        const tubeRow = document.getElementById('mf-row-tube');
        if (tubeRow) {
          tubeRow.style.display = ['torus', 'knot'].includes(shapeId) ? '' : 'none';
        }

        this.onParamChange({
          shape: shapeId,
          ...(shapeObj.presets || {}),
          ...(shapeObj.look || {})
        });
        this.updateChangedCount();
      });
    });

    // 4d. Liquid Refracted 3D Text Input
    const liquidTextInput = document.getElementById('mf-liquid-text-input');
    if (liquidTextInput) {
      liquidTextInput.addEventListener('input', (e) => {
        const txt = e.target.value;
        this.currentValues.text = txt;
        this.currentValues.text_userEdited = true;
        this.onParamChange('text', txt);
        this.updateChangedCount();
      });
    }


    // 5. Palette Presets Quick Switch
    this.container.querySelectorAll('.mf-palette-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') return;
        const palId = chip.dataset.palette;
        const palette = COLOR_PALETTES.find(p => p.id === palId);
        if (!palette) return;
        this.applyPalette(palette);
      });
    });

    // 5b. Color Picker Swatches
    this.container.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        if ((this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') &&
            ['stoneColor', 'depthColor', 'wallColor', 'veilColor', 'glowColor'].includes(key)) {
          return;
        }
        const val = e.target.value.toUpperCase();
        this.currentValues[key] = val;

        // Update preview swatch and hex input
        const preview = document.getElementById(`preview-${key}`);
        if (preview) preview.style.background = val;
        const hexInput = document.getElementById(`hex-${key}`);
        if (hexInput && hexInput.value !== val.replace('#', '')) {
          hexInput.value = val.replace('#', '');
        }
        const sub = document.getElementById(`sub-${key}`);
        if (sub) sub.textContent = val;

        this.onParamChange(key, val);
        this.updateActivePaletteIndicator();
        this.updateChangedCount();
      });
    });

    // 5c. Manual Hex Code Inputs
    this.container.querySelectorAll('.mf-hex-input').forEach(input => {
      const key = input.dataset.key;

      const applyHex = (rawVal) => {
        if ((this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') &&
            ['stoneColor', 'depthColor', 'wallColor', 'veilColor', 'glowColor'].includes(key)) {
          return false;
        }
        let clean = rawVal.trim().replace(/^#/, '').toUpperCase();
        if (clean.length === 3) {
          clean = clean.split('').map(c => c + c).join('');
        }
        if (/^[0-9A-F]{6}$/i.test(clean)) {
          const fullHex = `#${clean}`;
          this.currentValues[key] = fullHex;

          const preview = document.getElementById(`preview-${key}`);
          if (preview) preview.style.background = fullHex;

          const colorPicker = this.container.querySelector(`input[type="color"][data-key="${key}"]`);
          if (colorPicker) colorPicker.value = fullHex;

          const sub = document.getElementById(`sub-${key}`);
          if (sub) sub.textContent = fullHex;

          this.onParamChange(key, fullHex);
          this.updateActivePaletteIndicator();
          this.updateChangedCount();
          return true;
        }
        return false;
      };

      input.addEventListener('input', (e) => {
        applyHex(e.target.value);
      });

      input.addEventListener('blur', (e) => {
        const current = (this.currentValues[key] || '#FFFFFF').replace('#', '').toUpperCase();
        e.target.value = current;
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      });
    });

    // 6. Range Sliders
    this.container.querySelectorAll('input.ios[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        if ((this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') &&
            ['depth', 'thickness', 'roughness', 'frostAmount', 'chipSize', 'chipDepth', 'gravity', 'charge', 'burst', 'dust', 'bloom', 'exposure'].includes(key)) {
          return;
        }
        const val = parseFloat(e.target.value);
        this.currentValues[key] = val;

        this.updateSliderTrack(input);
        const valEl = document.getElementById(`val-${key}`);
        if (valEl) valEl.textContent = this.formatSliderValue(key, val);

        this.onParamChange(key, val);
        this.updateChangedCount();
      });
    });

    // 7. Steppers (Pieces & Chip pieces)
    this.container.querySelectorAll('.mf-stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.stepper;
        if ((this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') &&
            ['pieces', 'chipMax'].includes(key)) {
          return;
        }
        const dir = parseInt(btn.dataset.dir, 10) || 0;
        let current = Math.round(this.currentValues[key] ?? (key === 'pieces' ? 84 : 14));
        const min = key === 'pieces' ? 16 : 1;
        const max = key === 'pieces' ? 160 : 40;
        const next = Math.max(min, Math.min(max, current + dir));

        this.currentValues[key] = next;
        const valEl = document.getElementById(`val-${key}`);
        if (valEl) valEl.textContent = `${next}`;

        this.onParamChange(key, next);
        this.updateChangedCount();
      });
    });

    // 8. Toggle Switches (Breakable, Drag to turn, Inside Specimen)
    this.container.querySelectorAll('.mf-switch').forEach(sw => {
      sw.addEventListener('click', () => {
        const key = sw.dataset.key;
        if ((this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') &&
            key === 'breakable') {
          return;
        }
        const current = sw.getAttribute('aria-checked') === 'true';
        const next = !current;
        sw.setAttribute('aria-checked', String(next));
        this.currentValues[key] = next;

        if (key === 'symbolVisible') {
          if (!next) {
            this.currentValues.symbol = 'none';
          } else {
            this.currentValues.symbol = (this.lastActiveSymbol && this.lastActiveSymbol !== 'none') ? this.lastActiveSymbol : 'bolt';
          }
          const sym = this.currentValues.symbol;
          this.container.querySelectorAll('.mf-symbol-pill').forEach(p => {
            p.setAttribute('data-active', String(p.dataset.symbol === sym));
          });
          const activeLbl = document.getElementById('mf-active-symbol-label');
          if (activeLbl) {
            activeLbl.textContent = sym === 'none' ? 'None (بدون جسم)' : (sym === 'text' ? 'Your word' : sym.charAt(0).toUpperCase() + sym.slice(1));
          }
          const wordInputContainer = document.getElementById('mf-word-input-container');
          if (wordInputContainer) {
            if (sym === 'text') wordInputContainer.classList.remove('hidden');
            else wordInputContainer.classList.add('hidden');
          }
          this.onParamChange({ symbol: sym, symbolVisible: next });
          this.updateChangedCount();
          return;
        }

        this.onParamChange(key, next);
        this.updateChangedCount();
      });
    });

    // 9. Symbols Grid Selection
    this.container.querySelectorAll('.mf-symbol-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const sym = pill.dataset.symbol;
        if (sym === 'none') {
          this.currentValues.symbol = 'none';
          this.currentValues.symbolVisible = false;
        } else {
          this.lastActiveSymbol = sym;
          this.currentValues.symbol = sym;
          this.currentValues.symbolVisible = true;
        }

        const sw = document.getElementById('mf-switch-symbol-visible');
        if (sw) sw.setAttribute('aria-checked', String(this.currentValues.symbolVisible !== false));

        this.container.querySelectorAll('.mf-symbol-pill').forEach(p => {
          p.setAttribute('data-active', String(p.dataset.symbol === this.currentValues.symbol));
        });

        const activeLbl = document.getElementById('mf-active-symbol-label');
        if (activeLbl) {
          activeLbl.textContent = this.currentValues.symbol === 'none'
            ? 'None (بدون جسم)'
            : (sym === 'text' ? 'Your word' : sym.charAt(0).toUpperCase() + sym.slice(1));
        }

        const wordInputContainer = document.getElementById('mf-word-input-container');
        if (wordInputContainer) {
          if (sym === 'text') wordInputContainer.classList.remove('hidden');
          else wordInputContainer.classList.add('hidden');
        }

        this.onParamChange({ symbol: this.currentValues.symbol, symbolVisible: this.currentValues.symbolVisible });
        this.updateChangedCount();
      });
    });

    // 10. Custom Word Text Input
    const wordInput = document.getElementById('mf-custom-text-input');
    if (wordInput) {
      wordInput.addEventListener('input', (e) => {
        const txt = e.target.value;
        this.currentValues.text = txt;
        this.onParamChange('text', txt);
        this.updateChangedCount();
      });
    }

    // 11. Background Segmented Toggle (Colour / Transparent)
    this.container.querySelectorAll('.mf-seg-btn[data-bg]').forEach(seg => {
      seg.addEventListener('click', () => {
        const mode = seg.dataset.bg;
        this.currentValues.background = mode;

        this.container.querySelectorAll('.mf-seg-btn[data-bg]').forEach(s => {
          s.setAttribute('data-active', String(s.dataset.bg === mode));
        });

        const bgLbl = document.getElementById('mf-active-bg-label');
        if (bgLbl) bgLbl.textContent = mode === 'color' ? 'Colour' : 'Transparent';

        const rowBgColor = document.getElementById('mf-row-bg-color');
        if (rowBgColor) {
          if (mode === 'color') rowBgColor.classList.remove('hidden');
          else rowBgColor.classList.add('hidden');
        }

        this.onParamChange('background', mode);
        this.updateChangedCount();
      });
    });

    // 12. Copy Share Link
    const btnShare = document.getElementById('btn-mf-share-link');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        const textSpan = document.getElementById('mf-copy-btn-text');
        navigator.clipboard.writeText(window.location.href).then(() => {
          if (textSpan) {
            const original = textSpan.textContent;
            textSpan.textContent = 'Copied!';
            setTimeout(() => { textSpan.textContent = original; }, 2000);
          }
        }).catch(() => {
          alert('Copied link: ' + window.location.href);
        });
      });
    }
  }

  applyPalette(palette) {
    if (this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass') return;
    Object.assign(this.currentValues, palette.colors);

    for (const [key, val] of Object.entries(palette.colors)) {
      const hex = val.toUpperCase();
      const preview = document.getElementById(`preview-${key}`);
      if (preview) preview.style.background = hex;

      const colorPicker = this.container.querySelector(`input[type="color"][data-key="${key}"]`);
      if (colorPicker) colorPicker.value = hex;

      const hexInput = document.getElementById(`hex-${key}`);
      if (hexInput) hexInput.value = hex.replace('#', '');

      const sub = document.getElementById(`sub-${key}`);
      if (sub) sub.textContent = hex;
    }

    this.updateActivePaletteIndicator(palette.id);
    this.onParamChange(palette.colors);
    this.updateChangedCount();
  }

  updateActivePaletteIndicator(forcedId = null) {
    let matchedId = forcedId;
    if (!matchedId) {
      const cur = this.currentValues;
      const match = COLOR_PALETTES.find(p => {
        return (
          p.colors.stoneColor.toLowerCase() === (cur.stoneColor || '').toLowerCase() &&
          p.colors.depthColor.toLowerCase() === (cur.depthColor || '').toLowerCase() &&
          p.colors.wallColor.toLowerCase() === (cur.wallColor || '').toLowerCase() &&
          p.colors.veilColor.toLowerCase() === (cur.veilColor || '').toLowerCase() &&
          p.colors.glowColor.toLowerCase() === (cur.glowColor || '').toLowerCase()
        );
      });
      matchedId = match ? match.id : null;
    }

    this.container.querySelectorAll('.mf-palette-chip').forEach(chip => {
      chip.setAttribute('data-active', String(chip.dataset.palette === matchedId));
    });

    const activeLbl = document.getElementById('mf-active-palette-name');
    if (activeLbl) {
      const pal = COLOR_PALETTES.find(p => p.id === matchedId);
      activeLbl.textContent = pal ? pal.name : 'Custom';
    }
  }

  /**
   * Synchronize all controls with a new set of values (e.g. when gemstone archetype switches)
   */
  setValues(newValues, newDefaults) {
    const wasLiquid = (this.currentValues.gem === 'orb');
    const isNowLiquid = (newValues.gem === 'orb') || (newValues.gem === undefined && wasLiquid);
    const wasIgloo = (this.currentValues.gem === 'pudgy' || this.currentValues.gem === 'overpass');
    const isNowIgloo = (newValues.gem === 'pudgy' || newValues.gem === 'overpass') || (newValues.gem === undefined && wasIgloo);

    this.currentValues = { ...this.currentValues, ...newValues };
    if (newDefaults) {
      this.defaultValues = { ...this.defaultValues, ...newDefaults };
    }

    if (wasLiquid !== isNowLiquid || wasIgloo !== isNowIgloo) {
      this.render();
      this.bindEvents();
      this.updateActivePaletteIndicator();
      this.updateChangedCount();
      return;
    }

    // Update color swatches and hex inputs
    for (const key of ['stoneColor', 'depthColor', 'wallColor', 'veilColor', 'glowColor', 'symbolColor', 'lightColor', 'bgColor', 'tint', 'textColor']) {
      if (newValues[key] !== undefined) {
        const hex = String(newValues[key]).toUpperCase();
        const input = this.container.querySelector(`input[type="color"][data-key="${key}"]`);
        if (input) input.value = hex;
        const preview = document.getElementById(`preview-${key}`);
        if (preview) preview.style.background = hex;
        const hexInput = document.getElementById(`hex-${key}`);
        if (hexInput && hexInput.value !== hex.replace('#', '')) {
          hexInput.value = hex.replace('#', '');
        }
        const sub = document.getElementById(`sub-${key}`);
        if (sub) sub.textContent = hex;
      }
    }
    this.updateActivePaletteIndicator();

    // Update sliders (both gemstone and liquid glass)
    for (const key of ['depth', 'thickness', 'roughness', 'frostAmount', 'glow', 'symbolSize', 'symbolTurn', 'symbolSpin', 'chipSize', 'chipDepth', 'gravity', 'charge', 'burst', 'dust', 'spin', 'bob', 'tilt', 'bloom', 'exposure', 'zoom', 'dispersion', 'ior', 'noise', 'speed', 'size', 'twist', 'tube', 'textSize', 'clearcoat', 'iridescence']) {
      if (newValues[key] !== undefined) {
        const input = this.container.querySelector(`input[data-key="${key}"]`);
        if (input) {
          input.value = newValues[key];
          this.updateSliderTrack(input);
        }
        const valEl = document.getElementById(`val-${key}`);
        if (valEl) valEl.textContent = this.formatSliderValue(key, Number(newValues[key]));
      }
    }

    // Update liquid shape pills
    if (newValues.shape) {
      this.container.querySelectorAll('.mf-liquid-shape-pill').forEach(p => {
        p.setAttribute('data-active', String(p.dataset.liquidShape === newValues.shape));
      });
      const activeLiquidLbl = document.getElementById('mf-active-liquid-shape');
      if (activeLiquidLbl) {
        activeLiquidLbl.textContent = LIQUID_SHAPES[newValues.shape]?.label || newValues.shape;
      }
      const tubeRow = document.getElementById('mf-row-tube');
      if (tubeRow) {
        tubeRow.style.display = ['torus', 'knot'].includes(newValues.shape) ? '' : 'none';
      }
    }

    // Update liquid text input
    if (newValues.text !== undefined) {
      const liquidTextInput = document.getElementById('mf-liquid-text-input');
      if (liquidTextInput && liquidTextInput.value !== newValues.text) {
        liquidTextInput.value = newValues.text;
      }
    }

    // Update steppers
    for (const key of ['pieces', 'chipMax']) {
      if (newValues[key] !== undefined) {
        const valEl = document.getElementById(`val-${key}`);
        if (valEl) valEl.textContent = `${Math.round(newValues[key])}`;
      }
    }

    // Update switches
    for (const key of ['breakable', 'orbit', 'symbolVisible']) {
      if (newValues[key] !== undefined) {
        const sw = this.container.querySelector(`.mf-switch[data-key="${key}"]`);
        if (sw) sw.setAttribute('aria-checked', String(newValues[key]));
      }
    }

    // Update symbol grid & visibility
    if (newValues.symbol !== undefined || newValues.symbolVisible !== undefined) {
      const isVisible = (newValues.symbolVisible !== false) && (newValues.symbol !== 'none');
      const sym = isVisible ? (newValues.symbol || this.currentValues.symbol || 'bolt') : 'none';
      this.currentValues.symbol = sym;
      this.currentValues.symbolVisible = isVisible;

      const sw = document.getElementById('mf-switch-symbol-visible');
      if (sw) sw.setAttribute('aria-checked', String(isVisible));

      this.container.querySelectorAll('.mf-symbol-pill').forEach(p => {
        p.setAttribute('data-active', String(p.dataset.symbol === sym));
      });
      const activeLbl = document.getElementById('mf-active-symbol-label');
      if (activeLbl) {
        activeLbl.textContent = sym === 'none' ? 'None (بدون جسم)' : (sym === 'text' ? 'Your word' : sym.charAt(0).toUpperCase() + sym.slice(1));
      }
      const wordInputContainer = document.getElementById('mf-word-input-container');
      if (wordInputContainer) {
        if (sym === 'text') wordInputContainer.classList.remove('hidden');
        else wordInputContainer.classList.add('hidden');
      }
    }

    if (newValues.text !== undefined) {
      const textInput = document.getElementById('mf-custom-text-input');
      if (textInput && textInput.value !== newValues.text) {
        textInput.value = newValues.text;
      }
    }

    // Update background segmented
    if (newValues.background) {
      this.container.querySelectorAll('.mf-seg-btn').forEach(s => {
        s.setAttribute('data-active', String(s.dataset.bg === newValues.background));
      });
      const bgLbl = document.getElementById('mf-active-bg-label');
      if (bgLbl) bgLbl.textContent = newValues.background === 'color' ? 'Colour' : 'Transparent';
      const rowBgColor = document.getElementById('mf-row-bg-color');
      if (rowBgColor) {
        if (newValues.background === 'color') rowBgColor.classList.remove('hidden');
        else rowBgColor.classList.add('hidden');
      }
    }

    // Update stone shape pills
    if (newValues.gem) {
      this.currentValues.gem = newValues.gem;
      this.container.querySelectorAll('.mf-stone-pill').forEach(p => {
        p.setAttribute('data-active', String(p.dataset.stone === newValues.gem));
      });
      const activeLbl = document.getElementById('mf-active-stone-name');
      if (activeLbl) {
        activeLbl.textContent = this.getStoneDisplayName(newValues.gem);
      }
    }

    this.updateChangedCount();
  }
}
