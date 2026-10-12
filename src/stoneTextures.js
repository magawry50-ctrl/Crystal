import * as THREE from 'three';

/**
 * Seeded PRNG and Procedural Noise Functions
 * 1:1 Matching MetalForge Thunderstone
 */
export function createSeededRandom(seed) {
  let s = (seed || 1337) | 0;
  return function() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

export function hash3D(x, y, z, seed) {
  let s = (Math.imul(x, 0x165667b1) + Math.imul(y, 0x27d4eb2f) + Math.imul(z, 0x41c64e6d) + Math.imul(seed, 0x3c6ef35f)) | 0;
  s = Math.imul(s ^ (s >>> 13), 0x4bf19f61);
  return ((s ^= s >>> 16) >>> 0) / 0x100000000;
}

export function voronoi3D(x, y, z, scale, seed) {
  x *= scale; y *= scale; z *= scale;
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let minD = 1e9, cellId = 0;
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      for (let oz = -1; oz <= 1; oz++) {
        const cx = ix + ox, cy = iy + oy, cz = iz + oz;
        const d2 = Math.pow(cx + hash3D(cx, cy, cz, seed) - x, 2)
                 + Math.pow(cy + hash3D(cx, cy, cz, seed + 1) - y, 2)
                 + Math.pow(cz + hash3D(cx, cy, cz, seed + 2) - z, 2);
        if (d2 < minD) {
          minD = d2;
          cellId = hash3D(cx, cy, cz, seed + 3);
        }
      }
    }
  }
  return { d: Math.sqrt(minD), id: cellId };
}

/**
 * MetalForge Procedural Crystal Texture Generator (i0)
 * Generates high-frequency crystalline striations, frost grain, and micro-fractures.
 */
export function generateStoneTexture(size = 1024, seed = 42, baseFill = "#7a7a7a", blurVal = 1, alphaScale = 1) {
  const prng = createSeededRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext("2d");

  ctx.fillStyle = baseFill;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "overlay";

  // Multi-octave Perlin-style noise overlays
  const octaves = [
    [8, 8, 0.8],
    [24, 3, 0.6],
    [80, 1, 0.45]
  ];

  for (const [gridSize, blurPx, weight] of octaves) {
    const imgData = tempCtx.createImageData(size, size);
    const cellW = size / gridSize;
    const vals = [];
    const count = (gridSize + 1) * (gridSize + 1);
    for (let i = 0; i < count; i++) {
      vals.push(255 * prng());
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const gx = Math.floor(x / cellW);
        const gy = Math.floor(y / cellW);
        const val = vals[gy * (gridSize + 1) + gx];
        const idx = (y * size + x) * 4;
        imgData.data[idx] = imgData.data[idx + 1] = imgData.data[idx + 2] = val;
        imgData.data[idx + 3] = 255;
      }
    }

    tempCtx.putImageData(imgData, 0, 0);
    ctx.filter = blurPx ? `blur(${blurPx}px)` : "none";
    ctx.globalAlpha = weight * alphaScale;
    ctx.drawImage(tempCanvas, 0, 0);
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.lineCap = "round";

  // 900 fine crystalline striation scratches
  for (let i = 0; i < 900; i++) {
    const x = prng() * size;
    const y = prng() * size;
    const rPick = prng();
    const ang = rPick < 0.35 ? -0.5 + 0.5 * prng() : (rPick < 0.65 ? 0.9 + 0.5 * prng() : prng() * Math.PI);
    const len = 12 + Math.pow(prng(), 2) * 260;
    const dx = Math.cos(ang) * len;
    const dy = Math.sin(ang) * len;

    ctx.strokeStyle = prng() > 0.3 ? `rgba(255, 255, 255, ${(0.3 + 0.6 * prng()) * blurVal})` : `rgba(0, 0, 0, ${(0.2 + 0.4 * prng()) * blurVal})`;
    ctx.lineWidth = 0.6 + Math.pow(prng(), 2) * 2.4;

    for (const [ox, oy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
      ctx.beginPath();
      ctx.moveTo(x + ox, y + oy);
      ctx.lineTo(x + ox + dx, y + oy + dy);
      ctx.stroke();
    }
  }

  // 50 deep fracture lines
  for (let i = 0; i < 50; i++) {
    const x = prng() * size;
    const y = prng() * size;
    const ang = prng() * Math.PI;
    const len = 30 + 140 * prng();

    ctx.strokeStyle = `rgba(255, 255, 255, ${(0.6 + 0.4 * prng()) * blurVal})`;
    ctx.lineWidth = 2 + 3.5 * prng();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }

  // 260 micro-frost specks
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.4 + 0.6 * prng()) * blurVal})`;
    ctx.beginPath();
    ctx.arc(prng() * size, prng() * size, 0.8 + Math.pow(prng(), 2) * 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 8;
  return texture;
}

// Global cached textures matching MetalForge
let cachedBumpTexture = null;
let cachedWallTexture = null;

export function getSharedStoneTextures() {
  if (!cachedBumpTexture) {
    cachedBumpTexture = generateStoneTexture(1024, 43, "#3a3a3a", 0.45, 1);
  }
  if (!cachedWallTexture) {
    cachedWallTexture = generateStoneTexture(1024, 42, "#7a7a7a", 1, 1);
    cachedWallTexture.repeat.set(0.35, 0.35);
  }
  return {
    bumpMap: cachedBumpTexture,
    wallMap: cachedWallTexture
  };
}
