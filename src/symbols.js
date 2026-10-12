import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const EXTRUDE_SETTINGS = {
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.035,
  bevelSegments: 3,
  curveSegments: 24
};

function polyToShape(pts) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], pts[i][1]);
  }
  shape.closePath();
  return shape;
}

function makeBarShape(x, y, ang, len, width) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const ax = -s * width / 2, ay = c * width / 2;
  const p = new THREE.Shape();
  p.moveTo(x + ax, y + ay);
  p.lineTo(x + c * len + ax, y + s * len + ay);
  p.lineTo(x + c * len - ax, y + s * len - ay);
  p.lineTo(x - ax, y - ay);
  p.closePath();
  return p;
}

function getHeartShape() {
  const e = new THREE.Shape();
  e.moveTo(0, -1);
  e.bezierCurveTo(-0.55, -0.55, -1.05, -0.1, -1, 0.38);
  e.bezierCurveTo(-0.95, 0.85, -0.45, 1.05, -0.12, 0.82);
  e.bezierCurveTo(-0.06, 0.78, -0.02, 0.72, 0, 0.66);
  e.bezierCurveTo(0.02, 0.72, 0.06, 0.78, 0.12, 0.82);
  e.bezierCurveTo(0.45, 1.05, 0.95, 0.85, 1, 0.38);
  e.bezierCurveTo(1.05, -0.1, 0.55, -0.55, 0, -1);
  return e;
}

function generateTextContours(textStr, options = {}) {
  const str = (textStr ?? '').trim();
  if (!str || typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const font = `${options.weight ?? 700} 128px "SF Pro Display", -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(str);
  const width = Math.min(4096, Math.ceil(metrics.width) + 24);
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || 102.4);
  const height = ascent + Math.ceil(metrics.actualBoundingBoxDescent || 32) + 24;
  if (width < 4 || height < 4) return null;

  canvas.width = width;
  canvas.height = height;
  const drawCtx = canvas.getContext('2d', { willReadFrequently: true });
  if (!drawCtx) return null;
  drawCtx.font = font;
  drawCtx.textBaseline = 'alphabetic';
  drawCtx.fillStyle = '#fff';
  drawCtx.fillText(str, 12, 12 + ascent);

  const imgData = drawCtx.getImageData(0, 0, width, height).data;
  const dw = width + 2;
  const dh = height + 2;
  const grid = new Float32Array(dw * dh);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[(y + 1) * dw + (x + 1)] = imgData[(y * width + x) * 4 + 3] / 255;
    }
  }

  const getVal = (gx, gy) => grid[gy * dw + gx];
  const segments = [];
  const interp = (v1, v2) => (0.5 - v1) / (v2 - v1);

  for (let y = 0; y < dh - 1; y++) {
    for (let x = 0; x < dw - 1; x++) {
      const v0 = getVal(x, y);
      const v1 = getVal(x + 1, y);
      const v2 = getVal(x + 1, y + 1);
      const v3 = getVal(x, y + 1);
      const cell = (v0 > 0.5 ? 8 : 0) | (v1 > 0.5 ? 4 : 0) | (v2 > 0.5 ? 2 : 0) | (v3 > 0.5 ? 1 : 0);
      if (cell === 0 || cell === 15) continue;

      const pTop = [x + interp(v0, v1), y];
      const pRight = [x + 1, y + interp(v1, v2)];
      const pBottom = [x + interp(v3, v2), y + 1];
      const pLeft = [x, y + interp(v0, v3)];

      let midCell = cell;
      if ((cell === 5 || cell === 10) && (v0 + v1 + v2 + v3) / 4 > 0.5) {
        midCell = (cell === 5) ? 10 : 5;
      }

      const addSeg = (pA, pB) => segments.push([pA[0], pA[1], pB[0], pB[1]]);
      switch (midCell) {
        case 1: addSeg(pLeft, pBottom); break;
        case 2: addSeg(pBottom, pRight); break;
        case 3: addSeg(pLeft, pRight); break;
        case 4: addSeg(pRight, pTop); break;
        case 5: addSeg(pLeft, pTop); addSeg(pBottom, pRight); break;
        case 6: addSeg(pBottom, pTop); break;
        case 7: addSeg(pLeft, pTop); break;
        case 8: addSeg(pTop, pLeft); break;
        case 9: addSeg(pTop, pBottom); break;
        case 10: addSeg(pTop, pRight); addSeg(pBottom, pLeft); break;
        case 11: addSeg(pTop, pRight); break;
        case 12: addSeg(pRight, pLeft); break;
        case 13: addSeg(pRight, pBottom); break;
        case 14: addSeg(pBottom, pLeft); break;
      }
    }
  }

  const keyFn = (x, y) => `${Math.round(4096 * x)},${Math.round(4096 * y)}`;
  const map = new Map();
  segments.forEach((seg, idx) => {
    const k = keyFn(seg[0], seg[1]);
    const list = map.get(k);
    if (list) list.push(idx); else map.set(k, [idx]);
  });

  const visited = new Uint8Array(segments.length);
  const loops = [];
  for (let sIdx = 0; sIdx < segments.length; sIdx++) {
    if (visited[sIdx]) continue;
    const loop = [];
    let cur = sIdx;
    for (let step = 0; step < segments.length + 2; step++) {
      visited[cur] = 1;
      const seg = segments[cur];
      loop.push([seg[0], seg[1]]);
      const candidates = map.get(keyFn(seg[2], seg[3])) ?? [];
      const nextIdx = candidates.find(ci => !visited[ci]);
      if (nextIdx === undefined) break;
      cur = nextIdx;
    }
    if (loop.length >= 3) loops.push(loop);
  }
  if (!loops.length) return null;

  const simplified = loops.map(loop => {
    if (loop.length < 4) return loop;
    const keep = new Uint8Array(loop.length);
    keep[0] = 1;
    keep[loop.length - 1] = 1;
    const stack = [[0, loop.length - 1]];
    const epsilonSq = 0.34 * 0.34;
    while (stack.length) {
      const [start, end] = stack.pop();
      if (end - start < 2) continue;
      const [ax, ay] = loop[start];
      const [bx, by] = loop[end];
      const dx = bx - ax, dy = by - ay;
      const dSq = dx * dx + dy * dy;
      let maxDist = -1, maxIdx = -1;
      for (let i = start + 1; i < end; i++) {
        let dist;
        const [px, py] = loop[i];
        if (dSq < 1e-12) {
          dist = (px - ax) ** 2 + (py - ay) ** 2;
        } else {
          const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / dSq));
          dist = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2;
        }
        if (dist > maxDist) {
          maxDist = dist;
          maxIdx = i;
        }
      }
      if (maxDist > epsilonSq && maxIdx > 0) {
        keep[maxIdx] = 1;
        stack.push([start, maxIdx], [maxIdx, end]);
      }
    }
    const res = [];
    for (let i = 0; i < loop.length; i++) if (keep[i]) res.push(loop[i]);
    return res.length >= 3 ? res : loop;
  }).filter(loop => loop.length >= 3 && Math.abs(polygonArea(loop)) > 1.5);

  if (!simplified.length) return null;

  const classified = simplified.map((loop, i) => {
    let parentCount = 0;
    for (let j = 0; j < simplified.length; j++) {
      if (j !== i && isPointInPoly(loop[0], simplified[j])) parentCount++;
    }
    return { pts: loop, hole: parentCount % 2 === 1 };
  });

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const item of classified) {
    if (!item.hole) {
      for (const [px, py] of item.pts) {
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
  }
  const scale = 2 / Math.max(Math.max(1e-6, maxX - minX), Math.max(1e-6, maxY - minY));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  for (const item of classified) {
    for (const pt of item.pts) {
      pt[0] = (pt[0] - cx) * scale;
      pt[1] = -(pt[1] - cy) * scale;
    }
    item.pts.reverse();
  }

  const outers = classified.filter(c => !c.hole);
  const holes = classified.filter(c => c.hole);
  const shapesList = outers.map(outer => {
    const s = polyToShape(outer.pts);
    for (const hole of holes) {
      if (!isPointInPoly(hole.pts[0], outer.pts)) continue;
      const hPath = new THREE.Path();
      hPath.moveTo(hole.pts[0][0], hole.pts[0][1]);
      for (let i = 1; i < hole.pts.length; i++) hPath.lineTo(hole.pts[i][0], hole.pts[i][1]);
      hPath.closePath();
      s.holes.push(hPath);
    }
    return s;
  });

  return shapesList;
}

function polygonArea(pts) {
  let area = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function isPointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Creates 3D Geometry for all 10 MetalForge symbols:
 * bolt, flame, snowflake, crescent, drop, heart, clover, leaf, 404, text
 */
export function getSymbolGeometry(symbolName, textStr = '') {
  let geo = null;

  switch (symbolName) {
    case 'bolt': {
      const shape = polyToShape([
        [0.3, 1],
        [-0.36, 0.06],
        [-0.03, 0.06],
        [-0.3, -1],
        [0.36, -0.06],
        [0.03, -0.06]
      ]);
      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      break;
    }

    case 'flame': {
      const shape = new THREE.Shape();
      shape.moveTo(0.02, -1);
      shape.bezierCurveTo(0.5, -1, 0.72, -0.62, 0.64, -0.2);
      shape.bezierCurveTo(0.58, 0.1, 0.44, 0.24, 0.46, 0.52);
      shape.bezierCurveTo(0.34, 0.36, 0.24, 0.3, 0.16, 0.34);
      shape.bezierCurveTo(0.22, 0.62, 0.1, 0.86, -0.12, 1);
      shape.bezierCurveTo(-0.1, 0.78, -0.2, 0.6, -0.42, 0.42);
      shape.bezierCurveTo(-0.6, 0.28, -0.72, 0, -0.66, -0.3);
      shape.bezierCurveTo(-0.6, -0.72, -0.36, -1, 0.02, -1);

      const hole = new THREE.Path();
      hole.moveTo(0.02, -0.1);
      hole.bezierCurveTo(0.12, -0.3, 0.28, -0.45, 0.24, -0.62);
      hole.bezierCurveTo(0.2, -0.78, 0.1, -0.84, 0.02, -0.84);
      hole.bezierCurveTo(-0.1, -0.84, -0.22, -0.76, -0.22, -0.6);
      hole.bezierCurveTo(-0.22, -0.42, -0.06, -0.28, 0.02, -0.1);
      shape.holes.push(hole);

      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      geo.scale(0.85, 1, 1);
      break;
    }

    case 'snowflake': {
      const shapes = [];
      for (let i = 0; i < 6; i++) {
        const ang = Math.PI / 2 + i * Math.PI / 3;
        const c = Math.cos(ang), s = Math.sin(ang);
        shapes.push(makeBarShape(0, 0, ang, 1, 0.13));
        for (const [dist, len] of [[0.42, 0.34], [0.7, 0.22]]) {
          for (const side of [-1, 1]) {
            shapes.push(makeBarShape(c * dist, s * dist, ang + 0.95 * side, len, 0.09));
          }
        }
      }
      const hexPts = [];
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + Math.PI / 6;
        hexPts.push(new THREE.Vector2(0.24 * Math.cos(a), 0.24 * Math.sin(a)));
      }
      shapes.push(new THREE.Shape(hexPts));
      const geos = shapes.map(sh => new THREE.ExtrudeGeometry(sh, { ...EXTRUDE_SETTINGS, bevelThickness: 0.03, bevelSize: 0.02 }));
      geo = BufferGeometryUtils.mergeGeometries(geos);
      break;
    }

    case 'crescent': {
      const TWO_PI = Math.PI * 2;
      const tMax = Math.sqrt(Math.max(0, 1 - Math.pow((1.25 - 0.85 * 0.85) / 1, 2)));
      const t1 = Math.atan2(tMax, (1.25 - 0.85 * 0.85) / 1);
      const t2 = Math.atan2(tMax, (1.25 - 0.85 * 0.85) / 1 - 0.5);
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const ang = t1 + (TWO_PI - 2 * t1) * i / 48;
        pts.push([Math.cos(ang), Math.sin(ang)]);
      }
      for (let i = 1; i < 48; i++) {
        const ang = TWO_PI - t2 - (TWO_PI - 2 * t2) * i / 48;
        pts.push([0.5 + 0.85 * Math.cos(ang), 0.85 * Math.sin(ang)]);
      }
      const shape = polyToShape(pts);
      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      break;
    }

    case 'drop': {
      const shape = new THREE.Shape();
      shape.moveTo(0, 1);
      shape.bezierCurveTo(0.22, 0.62, 0.7, 0.18, 0.7, -0.3);
      shape.bezierCurveTo(0.7, -0.74, 0.36, -1, 0, -1);
      shape.bezierCurveTo(-0.36, -1, -0.7, -0.74, -0.7, -0.3);
      shape.bezierCurveTo(-0.7, 0.18, -0.22, 0.62, 0, 1);
      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      break;
    }

    case 'heart': {
      const shape = getHeartShape();
      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      break;
    }

    case 'clover': {
      const heartShape = getHeartShape();
      const heartPts = heartShape.getPoints(20);
      const shapes = [];
      for (let i = 0; i < 4; i++) {
        const ang = Math.PI / 4 + i * Math.PI / 2 - Math.PI / 2;
        const c = Math.cos(ang), s = Math.sin(ang);
        const rotPts = heartPts.map(p => {
          const x = 0.46 * p.x;
          const y = (p.y + 1) * 0.46 + 0.02;
          return [x * c - y * s, x * s + y * c];
        });
        shapes.push(polyToShape(rotPts));
      }
      // Stem
      const stemShape = new THREE.Shape();
      stemShape.moveTo(-0.04, 0.02);
      stemShape.quadraticCurveTo(0.02, -0.55, 0.3, -1);
      stemShape.lineTo(0.38, -0.96);
      stemShape.quadraticCurveTo(0.12, -0.55, 0.06, 0.02);
      stemShape.closePath();
      shapes.push(stemShape);
      const geos = shapes.map(sh => new THREE.ExtrudeGeometry(sh, { ...EXTRUDE_SETTINGS, bevelThickness: 0.03, bevelSize: 0.025 }));
      geo = BufferGeometryUtils.mergeGeometries(geos);
      break;
    }

    case 'leaf': {
      const shape = new THREE.Shape();
      shape.moveTo(0, 1);
      shape.bezierCurveTo(0.5, 0.62, 0.62, -0.1, 0.34, -0.55);
      shape.bezierCurveTo(0.22, -0.75, 0.1, -0.82, 0.04, -0.84);
      shape.lineTo(0.05, -1);
      shape.lineTo(-0.03, -1);
      shape.lineTo(-0.04, -0.84);
      shape.bezierCurveTo(-0.1, -0.82, -0.22, -0.75, -0.34, -0.55);
      shape.bezierCurveTo(-0.62, -0.1, -0.5, 0.62, 0, 1);

      // Center vein
      const centerVein = new THREE.Path();
      centerVein.moveTo(0, -0.68);
      centerVein.quadraticCurveTo(0.035, 0, 0, 0.7);
      centerVein.quadraticCurveTo(-0.035, 0, 0, -0.68);
      shape.holes.push(centerVein);

      // Side veins
      const veinConfigs = [
        [-0.42, 1], [-0.42, -1],
        [-0.05, 1], [-0.05, -1],
        [0.3, 1],   [0.3, -1]
      ];
      for (const [yBase, side] of veinConfigs) {
        const sideVein = new THREE.Path();
        const startX = 0.07 * side;
        const endX = (0.36 - 0.12 * (yBase + 0.42)) * side;
        const endY = yBase + 0.26;
        sideVein.moveTo(startX, yBase);
        sideVein.quadraticCurveTo((startX + endX) / 2 + 0.02 * side, (yBase + endY) / 2 - 0.035, endX, endY);
        sideVein.quadraticCurveTo((startX + endX) / 2 - 0.02 * side, (yBase + endY) / 2 + 0.035, startX, yBase);
        shape.holes.push(sideVein);
      }
      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      break;
    }

    case '404': {
      const makeFour = (offsetX) => [
        makeBarShape(offsetX + 0.14, -0.5, Math.PI / 2, 1.0, 0.17),
        makeBarShape(offsetX + 0.14, 0.5, Math.PI + 0.98, 0.72, 0.17),
        makeBarShape(offsetX - 0.34, -0.06, 0, 0.62, 0.16)
      ];
      const zeroShape = new THREE.Shape();
      zeroShape.absellipse(0, 0, 0.3, 0.5, 0, Math.PI * 2, false, 0);
      const zeroHole = new THREE.Path();
      zeroHole.absellipse(0, 0, 0.15, 0.3, 0, Math.PI * 2, true, 0);
      zeroShape.holes.push(zeroHole);

      const shapes = [
        ...makeFour(-0.78),
        zeroShape,
        ...makeFour(0.78)
      ];
      const geos = shapes.map(sh => new THREE.ExtrudeGeometry(sh, { ...EXTRUDE_SETTINGS, bevelThickness: 0.03, bevelSize: 0.025, curveSegments: 24 }));
      geo = BufferGeometryUtils.mergeGeometries(geos);
      break;
    }

    case 'text': {
      const shapes = generateTextContours(textStr || 'WORD');
      if (shapes && shapes.length) {
        const geos = shapes.map(sh => new THREE.ExtrudeGeometry(sh, { ...EXTRUDE_SETTINGS, bevelThickness: 0.03, bevelSize: 0.022, curveSegments: 4 }));
        geo = geos.length === 1 ? geos[0] : BufferGeometryUtils.mergeGeometries(geos);
      }
      if (!geo) {
        // Fallback to bolt if text is empty or failed
        const shape = polyToShape([
          [0.3, 1],
          [-0.36, 0.06],
          [-0.03, 0.06],
          [-0.3, -1],
          [0.36, -0.06],
          [0.03, -0.06]
        ]);
        geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      }
      break;
    }

    default: {
      // Default to bolt
      const shape = polyToShape([
        [0.3, 1],
        [-0.36, 0.06],
        [-0.03, 0.06],
        [-0.3, -1],
        [0.36, -0.06],
        [0.03, -0.06]
      ]);
      geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      break;
    }
  }

  // Recenter geometry to origin
  if (geo) {
    geo.computeBoundingBox();
    const center = geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-center.x, -center.y, -center.z);
    geo.computeBoundingBox();
  }

  return geo;
}

/**
 * Creates 3D glowing internal symbol group
 */
export function createSymbol(symbolName, options = {}) {
  const group = new THREE.Group();
  group.name = `Symbol_${symbolName}`;

  if (!symbolName || symbolName === 'none' || symbolName === 'off' || symbolName === 'empty') {
    group.visible = false;
    return group;
  }
  const colorHex = options.symbolColor || options.color || 0x6fd3ff;
  const glowHex = options.lightColor || options.glowColor || 0x40b3ff;
  const glow = (options.glow !== undefined) ? Number(options.glow) : 1.0;
  const textStr = options.text || 'WORD';

  const colorObj = new THREE.Color(colorHex);
  const glowObj = new THREE.Color(glowHex);

  const geo = getSymbolGeometry(symbolName, textStr);

  const emissiveMat = new THREE.MeshStandardMaterial({
    color: colorObj,
    emissive: glowObj,
    emissiveIntensity: 0.9 * glow,
    roughness: 0.3,
    metalness: 0.15,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geo, emissiveMat);
  mesh.name = 'SymbolMesh';
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = 4;
  group.add(mesh);

  // Add internal optical bloom sprite
  const glowSpriteMat = createGlowSprite(glowObj);
  if (glowSpriteMat) {
    const sprite = new THREE.Sprite(glowSpriteMat);
    sprite.scale.set(1.9 * glow, 1.9 * glow, 1.0);
    sprite.renderOrder = 3;
    group.add(sprite);
  }

  // Internal glowing light source radiating through crystal facets
  const innerLight = new THREE.PointLight(glowObj, 1.4 * glow, 4.5, 1.2);
  innerLight.name = 'InnerGlowLight';
  group.add(innerLight);

  return group;
}

function createGlowSprite(colorObj) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const r = Math.floor(colorObj.r * 255);
  const g = Math.floor(colorObj.g * 255);
  const b = Math.floor(colorObj.b * 255);

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0.0, `rgba(${r}, ${g}, ${b}, 0.85)`);
  grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.45)`);
  grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.12)`);
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
