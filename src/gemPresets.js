/**
 * EXACT MetalForge Thunderstone Mathematical Specifications
 * Fully reverse-engineered from MetalForge (metalforge.xyz)
 */

// Ellipsoid ring generator function from MetalForge:
// e.map(e => ({ y: e, r: t * Math.sqrt(1 - (e / l)**2) }))
export const genEllipsoidRings = (ys, scaleR, maxH) =>
  ys.map(y => ({
    y: y,
    r: scaleR * Math.sqrt(Math.max(0, 1 - Math.pow(y / maxH, 2)))
  }));

export const METALFORGE_GEMS = {
  froststone: {
    id: "froststone",
    name: "Froststone",
    sub: "ice quartz · snowflake",
    blurb: "A six-sided ice prism grown around a snowflake.",
    seed: 77,
    noise: 23,
    tilt: -0.12,
    thumbAngle: 0.35,
    shape: {
      sides: 6,
      aj: 0.03,
      rj: [0.96, 1.04],
      yj: 0.03,
      z: 1.0,
      align: true,
      spin: Math.PI / 2 - Math.PI / 6,
      rings: [
        { y: -1.5, r: 1.0 },
        { y: -0.75, r: 1.0 },
        { y: 0.0, r: 1.0 },
        { y: 0.75, r: 1.0 },
        { y: 1.5, r: 1.0 }
      ],
      top: { y: 2.45, x: 0.05, z: 0.05 },
      bot: { y: -2.35, x: 0.05, z: 0.05 },
      chips: { n: 6, y: [-1.4, 1.4], rel: [0.98, 1.03] },
      crown: { n: 0 }
    },
    hammer: {
      window: true,
      bigS: 0.9,
      bigT: 0.76,
      bigD: 0.16,
      midS: 3.0,
      midT: 0.9,
      midD: 0.04,
      bites: { n: 3, y: [-1.4, 1.6], rad: [0.3, 0.5] }
    },
    veils: { n: 10, x: 0.35, y: [-1.2, 1.2], z: 0.35, len: [0.3, 0.9] },
    glass: {
      color: "#EEF7FF",
      atten: "#B4D8F5",
      attDist: 2.6,
      thickness: 0.2,
      wall: "#2A4560",
      wallEm: "#050D18",
      edge: [0.004, 0.012, 0.025],
      core: [0.05, 0.14, 0.2],
      frost: [0.04, 0.045, 0.055],
      veil: "#E6F3FF",
      veilEm: "#1C2A3A",
      veilDark: "#162230",
      roughness: 0.08
    },
    symbol: {
      kind: "snowflake",
      body: "#6FD3FF",
      edge: [0.25, 0.9, 1.6],
      core: [1.8, 2.8, 3.4],
      light: "#BFE9FF",
      lightI: 1.2,
      scale: 1.0
    },
    telemetry: { label: "TEMP", value: -42.80, unit: "°C" }
  },

  emberstone: {
    id: "emberstone",
    name: "Emberstone",
    sub: "garnet · living flame",
    blurb: "A garnet cushion with a flame that never goes out.",
    seed: 2024,
    noise: 11,
    tilt: 0.12,
    thumbAngle: 0.3,
    shape: {
      sides: 11,
      aj: 0.2,
      rj: [0.88, 1.12],
      yj: 0.1,
      z: 0.7,
      rings: genEllipsoidRings([-1.15, -0.8, -0.4, 0, 0.4, 0.8, 1.15], 1.3, 1.45),
      top: { y: 1.45, x: 0.2, z: 0.15 },
      bot: { y: -1.4, x: 0.2, z: 0.15 },
      chips: { n: 22, y: [-1.2, 1.2], rel: [1.0, 1.14] },
      crown: { n: 10, y: [0.9, 1.35], r: [0.3, 0.75] }
    },
    hammer: {
      window: true,
      bigS: 1.1,
      bigT: 0.64,
      bigD: 0.2,
      midS: 3.4,
      midT: 0.84,
      midD: 0.05,
      bites: { n: 6, y: [-1.0, 1.1], rad: [0.35, 0.6] }
    },
    veils: { n: 12, x: 0.7, y: [-0.8, 0.8], z: 0.4, len: [0.25, 0.8] },
    glass: {
      color: "#FFD8D0",
      atten: "#D83A36",
      attDist: 1.1,
      thickness: 0.3,
      wall: "#6E070C",
      wallEm: "#1A0103",
      edge: [0.02, 0.002, 0.002],
      core: [0.16, 0.06, 0.01],
      frost: [0.04, 0.02, 0.02],
      veil: "#FFB3A8",
      veilEm: "#3A0C10",
      veilDark: "#2A060A",
      roughness: 0.12
    },
    symbol: {
      kind: "flame",
      body: "#F59E0B",
      edge: [1.3, 0.4, 0.03],
      core: [1.9, 1.2, 0.3],
      light: "#FFB050",
      lightI: 1.2,
      scale: 1.05
    },
    telemetry: { label: "THERMAL", value: 842.10, unit: "°C" }
  },

  moonstone: {
    id: "moonstone",
    name: "Moonstone",
    sub: "amethyst · golden crescent",
    blurb: "Amethyst, its base snapped off, holding a golden crescent.",
    seed: 909,
    noise: 31,
    tilt: 0.06,
    thumbAngle: 0.2,
    shape: {
      sides: 6,
      aj: 0.1,
      rj: [0.9, 1.1],
      yj: 0.06,
      z: 0.92,
      align: true,
      spin: Math.PI / 2 - Math.PI / 6,
      rings: [
        { y: -2.0, r: 1.05 },
        { y: -1.2, r: 1.08 },
        { y: -0.4, r: 1.1 },
        { y: 0.4, r: 1.06 },
        { y: 1.0, r: 1.0 }
      ],
      top: { y: 2.55, x: 0.1, z: 0.08 },
      bot: { y: -2.2, x: 0.2, z: 0.2 },
      chips: { n: 14, y: [-1.8, 0.9], rel: [0.98, 1.1] },
      crown: { n: 6, y: [1.2, 2.2], r: [0.2, 0.55] },
      cuts: [{ n: [0.35, -1.0, 0.2], d: 1.75 }]
    },
    hammer: {
      window: true,
      bigS: 1.1,
      bigT: 0.62,
      bigD: 0.22,
      midS: 3.2,
      midT: 0.84,
      midD: 0.05,
      bites: { n: 5, y: [-1.8, 1.6], rad: [0.4, 0.65] }
    },
    veils: { n: 12, x: 0.55, y: [-1.4, 1.4], z: 0.4, len: [0.3, 1.0] },
    glass: {
      color: "#EEE4FF",
      atten: "#9C70E0",
      attDist: 1.2,
      thickness: 0.3,
      wall: "#2E0C5C",
      wallEm: "#0A0114",
      edge: [0.012, 0.004, 0.025],
      core: [0.08, 0.06, 0.03],
      frost: [0.035, 0.03, 0.045],
      veil: "#D9C4FF",
      veilEm: "#241038",
      veilDark: "#1A0A28",
      roughness: 0.1
    },
    symbol: {
      kind: "crescent",
      body: "#E8D8A8",
      edge: [0.7, 0.5, 0.18],
      core: [1.8, 1.45, 0.75],
      light: "#FFE2A8",
      lightI: 1.2,
      scale: 1.0
    },
    telemetry: { label: "GRAV", value: 0.166, unit: "G" }
  },

  tidestone: {
    id: "tidestone",
    name: "Tidestone",
    sub: "cobalt sapphire · sea drop",
    blurb: "A cobalt tablet with a drop of the sea sealed in it.",
    seed: 4242,
    noise: 43,
    tilt: 0.32,
    thumbAngle: 0.1,
    shape: {
      sides: 12,
      aj: 0.15,
      rj: [0.93, 1.07],
      yj: 0.08,
      z: 0.42,
      rings: genEllipsoidRings([-1.55, -1.1, -0.55, 0, 0.55, 1.1, 1.55], 1.3, 1.85),
      top: { y: 1.85, x: 0.1, z: 0.05 },
      bot: { y: -1.8, x: 0.1, z: 0.05 },
      chips: { n: 20, y: [-1.4, 1.4], rel: [1.0, 1.08] },
      crown: { n: 0 }
    },
    hammer: {
      window: true,
      bigS: 1.2,
      bigT: 0.7,
      bigD: 0.14,
      midS: 3.6,
      midT: 0.88,
      midD: 0.035,
      bites: { n: 4, y: [-1.2, 1.3], rad: [0.35, 0.55] }
    },
    veils: { n: 10, x: 0.6, y: [-1.0, 1.0], z: 0.1, len: [0.3, 0.8] },
    glass: {
      color: "#DDE6FF",
      atten: "#5A78E0",
      attDist: 1.2,
      thickness: 0.3,
      wall: "#0A1F66",
      wallEm: "#02071A",
      edge: [0.002, 0.006, 0.03],
      core: [0.02, 0.14, 0.14],
      frost: [0.025, 0.03, 0.045],
      veil: "#A8C4FF",
      veilEm: "#0C1B42",
      veilDark: "#040D24",
      roughness: 0.1
    },
    symbol: {
      kind: "drop",
      body: "#14B8A6",
      edge: [0.03, 0.55, 0.5],
      core: [0.7, 1.6, 1.5],
      light: "#7FF5E6",
      lightI: 1.3,
      scale: 1.05
    },
    telemetry: { label: "PRESSURE", value: 104.2, unit: "BAR" }
  },

  heartstone: {
    id: "heartstone",
    name: "Heartstone",
    sub: "rose quartz · ruby heart",
    blurb: "Rose quartz, and a ruby heart at the middle of it.",
    seed: 1402,
    noise: 57,
    tilt: -0.16,
    thumbAngle: 0.25,
    shape: {
      sides: 8,
      aj: 0.06,
      rj: [0.94, 1.06],
      yj: 0.06,
      z: 0.82,
      align: true,
      spin: Math.PI / 2 - Math.PI / 8,
      rings: [
        { y: -1.35, r: 0.72 },
        { y: -0.85, r: 1.08 },
        { y: -0.3, r: 1.2 },
        { y: 0.3, r: 1.2 },
        { y: 0.85, r: 1.08 },
        { y: 1.35, r: 0.72 }
      ],
      top: { y: 2.15, x: 0.08, z: 0.06 },
      bot: { y: -2.1, x: 0.08, z: 0.06 },
      chips: { n: 18, y: [-1.2, 1.2], rel: [0.98, 1.1] },
      crown: { n: 6, y: [1.45, 2.0], r: [0.15, 0.4] }
    },
    hammer: {
      window: true,
      bigS: 1.1,
      bigT: 0.64,
      bigD: 0.2,
      midS: 3.0,
      midT: 0.85,
      midD: 0.05,
      bites: { n: 4, y: [-1.4, 1.4], rad: [0.35, 0.6] }
    },
    veils: { n: 12, x: 0.55, y: [-1.0, 1.0], z: 0.35, len: [0.3, 0.9] },
    glass: {
      color: "#FFE6EE",
      atten: "#E890AA",
      attDist: 1.3,
      thickness: 0.3,
      wall: "#6A1A36",
      wallEm: "#17030B",
      edge: [0.02, 0.006, 0.012],
      core: [0.12, 0.02, 0.04],
      frost: [0.045, 0.035, 0.04],
      veil: "#FFD0DE",
      veilEm: "#3A0D1E",
      veilDark: "#260612",
      roughness: 0.12
    },
    symbol: {
      kind: "heart",
      body: "#BE123C",
      edge: [0.9, 0.03, 0.08],
      core: [1.9, 0.3, 0.35],
      light: "#FF3355",
      lightI: 1.2,
      scale: 1.0
    },
    telemetry: { label: "PULSE", value: 72.0, unit: "BPM" }
  },

  luckstone: {
    id: "luckstone",
    name: "Luckstone",
    sub: "citrine · four-leaf clover",
    blurb: "Citrine, broken off at the top, with a four-leaf clover inside.",
    seed: 5150,
    noise: 71,
    tilt: 0.08,
    thumbAngle: 0.2,
    shape: {
      sides: 7,
      aj: 0.2,
      rj: [0.82, 1.18],
      yj: 0.12,
      z: 0.72,
      rings: [
        { y: -1.8, r: 0.7 },
        { y: -1.2, r: 1.0 },
        { y: -0.5, r: 1.12 },
        { y: 0.2, r: 1.12 },
        { y: 0.9, r: 1.02 },
        { y: 1.5, r: 0.85 }
      ],
      top: { y: 2.2, x: 0.1, z: 0.1 },
      bot: { y: -2.2, x: 0.1, z: 0.1 },
      chips: { n: 18, y: [-1.6, 1.5], rel: [0.98, 1.12] },
      crown: { n: 8, y: [1.3, 1.9], r: [0.3, 0.75] },
      skew: 0.22,
      cuts: [{ n: [-0.45, 1.0, 0.15], d: 1.55 }]
    },
    hammer: {
      window: true,
      bigS: 1.05,
      bigT: 0.62,
      bigD: 0.24,
      midS: 3.1,
      midT: 0.85,
      midD: 0.05,
      bites: { n: 5, y: [-1.6, 1.4], rad: [0.4, 0.7] }
    },
    veils: { n: 12, x: 0.55, y: [-1.2, 1.2], z: 0.3, len: [0.3, 1.0] },
    glass: {
      color: "#FFF2D0",
      atten: "#F0B020",
      attDist: 1.1,
      thickness: 0.3,
      wall: "#8A5200",
      wallEm: "#1C1000",
      edge: [0.025, 0.014, 0.002],
      core: [0.05, 0.1, 0.02],
      frost: [0.045, 0.04, 0.025],
      veil: "#FFE3A0",
      veilEm: "#3A2804",
      veilDark: "#261A02",
      roughness: 0.14
    },
    symbol: {
      kind: "clover",
      body: "#2F7A14",
      edge: [0.1, 0.45, 0.02],
      core: [0.7, 1.4, 0.25],
      light: "#B8FF8A",
      lightI: 1.2,
      scale: 1.0
    },
    telemetry: { label: "LUCK_IDX", value: 99.7, unit: "%" }
  },

  thunderstone: {
    id: "thunderstone",
    name: "Thunderstone",
    sub: "green quartz · amber bolt",
    blurb: "Green quartz, struck through with an amber bolt.",
    seed: 1337,
    noise: 0,
    tilt: 0.22,
    thumbAngle: 0.15,
    shape: {
      sides: 9,
      aj: 0.22,
      rj: [0.78, 1.2],
      yj: 0.16,
      z: 0.8,
      spin: 0.1,
      rings: [
        { y: -1.7, r: 0.72 },
        { y: -1.25, r: 1.06 },
        { y: -0.7, r: 1.22 },
        { y: -0.15, r: 1.26 },
        { y: 0.4, r: 1.22 },
        { y: 0.9, r: 1.1 },
        { y: 1.35, r: 0.9 },
        { y: 1.75, r: 0.53 }
      ],
      top: { y: 2.3, x: 0.12, z: 0.1 },
      bot: { y: -2.1, x: 0.15, z: 0.1 },
      chips: { n: 26, y: [-1.6, 1.7], abs: { rx: [0.98, 1.3], rz: [0.7, 0.98] } },
      crown: { n: 14, y: [1.25, 2.05], r: [0.3, 0.8] }
    },
    hammer: {
      bigS: 1.0,
      bigT: 0.66,
      bigD: 0.24,
      midS: 3.0,
      midT: 0.86,
      midD: 0.05,
      bites: { n: 5, y: [-1.5, 1.8], rad: [0.45, 0.75], abs: [1.22, 0.98] }
    },
    veils: { n: 14, x: 0.6, y: [-1.3, 1.4], z: 0.35, len: [0.3, 1.1] },
    glass: {
      color: "#B8F7DC",
      atten: "#5FD07F",
      attDist: 1.4,
      thickness: 0.35,
      wall: "#065C3C",
      wallEm: "#011A10",
      edge: [0.002, 0.02, 0.012],
      core: [0.2, 0.16, 0.03],
      frost: [0.05, 0.07, 0.06],
      veil: "#9FD9C0",
      veilEm: "#122A1E",
      veilDark: "#0A1C12",
      roughness: 0.1
    },
    symbol: {
      kind: "bolt",
      body: "#C07A10",
      edge: [1.4, 0.7, 0.08],
      core: [3.0, 2.3, 1.0],
      light: "#FFE6A8",
      lightI: 1.2,
      scale: 1.1
    },
    telemetry: { label: "CHARGE", value: 1.21, unit: "GW" }
  },

  pudgy: {
    id: "pudgy",
    name: "Igloo Pudgy Core",
    sub: "glacial ice · pudgy penguin #001",
    blurb: "Perpetual glacial ice encasing Pudgy Penguin #001.",
    seed: 777,
    noise: 15,
    tilt: -0.08,
    thumbAngle: 0.3,
    shape: {
      sides: 6,
      aj: 0.04,
      rj: [0.95, 1.05],
      yj: 0.04,
      z: 0.96,
      spin: Math.PI / 6,
      rings: [
        { y: -1.6, r: 1.05 },
        { y: -0.8, r: 1.08 },
        { y: 0.0, r: 1.06 },
        { y: 0.8, r: 1.02 },
        { y: 1.6, r: 0.98 }
      ],
      top: { y: 2.5, x: 0.05, z: 0.05 },
      bot: { y: -2.3, x: 0.05, z: 0.05 },
      chips: { n: 8, y: [-1.4, 1.4], rel: [0.98, 1.04] },
      crown: { n: 0 }
    },
    hammer: {
      window: true,
      bigS: 0.9,
      bigT: 0.76,
      bigD: 0.16,
      midS: 3.0,
      midT: 0.9,
      midD: 0.04,
      bites: { n: 3, y: [-1.4, 1.6], rad: [0.3, 0.5] }
    },
    veils: { n: 10, x: 0.4, y: [-1.2, 1.2], z: 0.35, len: [0.3, 0.9] },
    glass: {
      color: "#EEF7FF",
      atten: "#B4D8F5",
      attDist: 2.6,
      thickness: 0.2,
      wall: "#2A4560",
      wallEm: "#050D18",
      edge: [0.004, 0.012, 0.025],
      core: [0.05, 0.14, 0.2],
      frost: [0.04, 0.045, 0.055],
      veil: "#E6F3FF",
      veilEm: "#1C2A3A",
      veilDark: "#162230",
      roughness: 0.08
    },
    symbol: {
      kind: "penguin",
      body: "#40B3FF",
      edge: [0.25, 0.9, 1.6],
      core: [1.8, 2.8, 3.4],
      light: "#FFFFFF",
      lightI: 1.2,
      scale: 0.9
    },
    telemetry: { label: "TEMP", value: 35.68, unit: "K" }
  }
};

export const GEM_PRESETS = METALFORGE_GEMS;

function rgbToHex(arr) {
  if (!arr) return "#40B3FF";
  const max = Math.max(arr[0], arr[1], arr[2]) || 1;
  const toHex = v => Math.round(Math.min(255, Math.max(0, (v / max) * 255))).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(arr[0])}${toHex(arr[1])}${toHex(arr[2])}`;
}

export function parseHashParams() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const gemId = params.get('gem') || 'froststone';
  const base = METALFORGE_GEMS[gemId] || METALFORGE_GEMS.froststone;

  // Deep clone
  const result = JSON.parse(JSON.stringify(base));

  if (params.has('stoneColor')) result.glass.color = '#' + params.get('stoneColor').replace('#', '');
  if (params.has('depthColor')) result.glass.atten = '#' + params.get('depthColor').replace('#', '');
  if (params.has('wallColor')) result.glass.wall = '#' + params.get('wallColor').replace('#', '');
  if (params.has('veilColor')) result.glass.veil = '#' + params.get('veilColor').replace('#', '');
  if (params.has('glowColor')) {
    const gc = '#' + params.get('glowColor').replace('#', '');
    result.glass.glowHex = gc;
  }
  if (params.has('lightColor')) result.symbol.light = '#' + params.get('lightColor').replace('#', '');
  if (params.has('symbolColor')) result.symbol.body = '#' + params.get('symbolColor').replace('#', '');
  if (params.has('symbol')) result.symbol.kind = params.get('symbol');
  if (params.has('depth')) result.glass.attDist = parseFloat(params.get('depth'));
  if (params.has('thickness')) result.glass.thickness = parseFloat(params.get('thickness'));

  return result;
}

export function buildHashParams(config) {
  const params = new URLSearchParams();
  params.set('gem', config.id);
  params.set('stoneColor', config.glass.color.replace('#', ''));
  params.set('depthColor', config.glass.atten.replace('#', ''));
  params.set('wallColor', config.glass.wall.replace('#', ''));
  params.set('veilColor', config.glass.veil.replace('#', ''));
  const glow = config.glass.glowHex || rgbToHex(config.glass.core);
  params.set('glowColor', glow.replace('#', ''));
  params.set('depth', config.glass.attDist);
  params.set('thickness', config.glass.thickness);
  params.set('symbol', config.symbol.kind);
  params.set('symbolColor', config.symbol.body.replace('#', ''));
  params.set('lightColor', config.symbol.light.replace('#', ''));
  return '#' + params.toString();
}
