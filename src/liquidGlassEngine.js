import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ----------------------------------------------------------------------------
// MetalForge Liquid Glass 3D Engine
// 100% Exact High-Fidelity Verbatim Port from metalforge.xyz/liquid/torus
// ----------------------------------------------------------------------------

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const DEG_TO_RAD = Math.PI / 180;

const num = (v, fallback) => (typeof v === 'number' && isFinite(v) ? v : fallback);
const str = (v, fallback) => (typeof v === 'string' && v ? v : fallback);

// ----------------------------------------------------------------------------
// Custom 3D Internal Specimen Builders for Business Strategy, Innovation, Systems
// ----------------------------------------------------------------------------

function createStrategySpecimen() {
  const group = new THREE.Group();
  group.name = 'specimen_strategy';

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.88,
    roughness: 0.22,
    fog: false
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.2,
    metalness: 0.9,
    roughness: 0.15,
    fog: false
  });
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.9,
    metalness: 0.85,
    roughness: 0.18,
    fog: false
  });
  const orbitMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x334155,
    emissiveIntensity: 0.35,
    metalness: 0.92,
    roughness: 0.15,
    fog: false
  });
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.4,
    metalness: 0.4,
    roughness: 0.1,
    fog: false
  });

  // 1. 4 Architectural Ascending Pillars (Business Model & Revenue Strategy)
  const pillarPositions = [
    { x: -0.15, z: -0.15, h: 0.42 },
    { x: 0.15, z: -0.15, h: 0.62 },
    { x: 0.15, z: 0.15, h: 0.82 },
    { x: -0.15, z: 0.15, h: 1.02 }
  ];

  const pillarGroup = new THREE.Group();
  pillarPositions.forEach(p => {
    const shaftGeo = new THREE.CylinderGeometry(0.042, 0.048, p.h, 8);
    const shaft = new THREE.Mesh(shaftGeo, pillarMat);
    shaft.position.set(p.x, -0.38 + p.h / 2, p.z);
    pillarGroup.add(shaft);

    const capGeo = new THREE.BoxGeometry(0.10, 0.032, 0.10);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(p.x, -0.38 + p.h + 0.016, p.z);
    pillarGroup.add(cap);

    const baseGeo = new THREE.BoxGeometry(0.11, 0.028, 0.11);
    const base = new THREE.Mesh(baseGeo, pillarMat);
    base.position.set(p.x, -0.38 - 0.014, p.z);
    pillarGroup.add(base);
  });
  group.add(pillarGroup);

  // 2. Ascending Helical Spiral Ribbon (Go-to-Market & Market Expansion)
  const curvePoints = [];
  const turns = 2.4;
  const numSteps = 72;
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const angle = t * Math.PI * 2 * turns;
    const r = 0.26 + t * 0.05;
    const y = -0.35 + t * 1.05;
    curvePoints.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
  }
  const spiralCurve = new THREE.CatmullRomCurve3(curvePoints);
  const ribbonGeo = new THREE.TubeGeometry(spiralCurve, 64, 0.015, 8, false);
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  group.add(ribbon);

  // 3. Dual Interlocking Orbit Base with 6 Partnership Nodes (Strategic Partnerships & Ecosystem Development)
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(0, -0.40, 0);

  const orbit1Geo = new THREE.TorusGeometry(0.36, 0.011, 12, 48);
  const orbit1 = new THREE.Mesh(orbit1Geo, orbitMat);
  orbit1.rotation.x = Math.PI / 2 + 0.22;
  orbit1.rotation.y = 0.15;
  orbitGroup.add(orbit1);

  const orbit2Geo = new THREE.TorusGeometry(0.34, 0.011, 12, 48);
  const orbit2 = new THREE.Mesh(orbit2Geo, orbitMat);
  orbit2.rotation.x = Math.PI / 2 - 0.22;
  orbit2.rotation.y = -0.15;
  orbitGroup.add(orbit2);

  const nodeGeo = new THREE.SphereGeometry(0.03, 16, 16);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const orbitChoice = (i % 2 === 0);
    const r = orbitChoice ? 0.36 : 0.34;
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    const basePos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    if (orbitChoice) {
      basePos.applyEuler(new THREE.Euler(Math.PI / 2 + 0.22, 0.15, 0));
    } else {
      basePos.applyEuler(new THREE.Euler(Math.PI / 2 - 0.22, -0.15, 0));
    }
    node.position.copy(basePos);
    orbitGroup.add(node);
  }
  group.add(orbitGroup);

  return {
    group,
    animate: (time) => {
      ribbon.rotation.y = time * 0.22;
      orbitGroup.rotation.y = time * 0.12;
      const pulse = Math.sin(time * 3.0) * 0.3 + 0.9;
      nodeMat.emissiveIntensity = 1.1 * pulse;
      ribbonMat.emissiveIntensity = 0.8 * pulse;
      capMat.emissiveIntensity = 1.0 * pulse;
    }
  };
}

function createInnovationSpecimen() {
  const group = new THREE.Group();
  group.name = 'specimen_innovation';

  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 1.5,
    metalness: 0.3,
    roughness: 0.1,
    fog: false
  });
  const cubeMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    emissive: 0x312e81,
    emissiveIntensity: 0.4,
    metalness: 0.88,
    roughness: 0.18,
    fog: false
  });
  const cubeEdgeMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e
  });
  const orbitMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.45,
    metalness: 0.92,
    roughness: 0.15,
    fog: false
  });
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xfbcfe8,
    emissive: 0xf472b6,
    emissiveIntensity: 1.3,
    metalness: 0.4,
    roughness: 0.1,
    fog: false
  });

  // 1. Luminous Central 0-to-1 Seed Core (Venture Design & 0-to-1 Product Development)
  const seedGeo = new THREE.IcosahedronGeometry(0.13, 2);
  const seedCore = new THREE.Mesh(seedGeo, seedMat);
  group.add(seedCore);

  // 2. Modular Cube Matrix: 8 geometric cubes around the core (Product Strategy, UX & Market Validation)
  const cubeMatrixGroup = new THREE.Group();
  const cubeGeo = new THREE.BoxGeometry(0.13, 0.13, 0.13);
  const d = 0.175;

  for (let x of [-1, 1]) {
    for (let y of [-1, 1]) {
      for (let z of [-1, 1]) {
        const cMesh = new THREE.Mesh(cubeGeo, cubeMat);
        cMesh.position.set(x * d, y * d, z * d);

        const edges = new THREE.EdgesGeometry(cubeGeo);
        const line = new THREE.LineSegments(edges, cubeEdgeMat);
        cMesh.add(line);

        cubeMatrixGroup.add(cMesh);
      }
    }
  }
  group.add(cubeMatrixGroup);

  // 3. Tilted Expansion Orbits and Lunar Orbital Modules (Product-Market Fit & Scaling Roadmaps)
  const orbit1Group = new THREE.Group();
  orbit1Group.rotation.set(0.65, 0.35, 0.2);
  const orbitTrack1Geo = new THREE.TorusGeometry(0.44, 0.009, 12, 64);
  const orbitTrack1 = new THREE.Mesh(orbitTrack1Geo, orbitMat);
  orbit1Group.add(orbitTrack1);
  group.add(orbit1Group);

  const orbit2Group = new THREE.Group();
  orbit2Group.rotation.set(-0.55, 0.75, -0.3);
  const orbitTrack2Geo = new THREE.TorusGeometry(0.48, 0.009, 12, 64);
  const orbitTrack2 = new THREE.Mesh(orbitTrack2Geo, orbitMat);
  orbit2Group.add(orbitTrack2);
  group.add(orbit2Group);

  const moonGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const moon1 = new THREE.Mesh(moonGeo, moonMat);
  group.add(moon1);
  const moon2 = new THREE.Mesh(moonGeo, moonMat);
  group.add(moon2);

  return {
    group,
    animate: (time) => {
      const pulse = Math.sin(time * 3.5) * 0.2 + 1.05;
      seedCore.scale.setScalar(pulse);
      seedMat.emissiveIntensity = 1.3 * pulse;

      const breathe = Math.sin(time * 1.8) * 0.025 + 1.0;
      cubeMatrixGroup.scale.setScalar(breathe);
      cubeMatrixGroup.rotation.y = time * 0.12;

      const a1 = time * 0.7;
      const v1 = new THREE.Vector3(Math.cos(a1) * 0.44, 0, Math.sin(a1) * 0.44);
      v1.applyEuler(new THREE.Euler(0.65, 0.35, 0.2));
      moon1.position.copy(v1);

      const a2 = -time * 0.85 + Math.PI;
      const v2 = new THREE.Vector3(Math.cos(a2) * 0.48, 0, Math.sin(a2) * 0.48);
      v2.applyEuler(new THREE.Euler(-0.55, 0.75, -0.3));
      moon2.position.copy(v2);
    }
  };
}

function createSystemsSpecimen() {
  const group = new THREE.Group();
  group.name = 'specimen_systems';

  const slabMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x1e293b,
    emissiveIntensity: 0.35,
    metalness: 0.92,
    roughness: 0.18,
    fog: false
  });
  const slabEdgeMat = new THREE.LineBasicMaterial({
    color: 0x10b981
  });
  const aiMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    emissive: 0x10b981,
    emissiveIntensity: 1.5,
    metalness: 0.35,
    roughness: 0.1,
    fog: false
  });
  const beamMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.0,
    metalness: 0.5,
    roughness: 0.2,
    fog: false
  });
  const gimbalMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x047857,
    emissiveIntensity: 0.55,
    metalness: 0.95,
    roughness: 0.12,
    fog: false
  });

  // 1. 3 Stacked Stepped Operating Slabs (Business Process & Operating Model Design)
  const slabLevels = [
    { y: -0.32, r: 0.36, h: 0.045 },
    { y: 0.0,   r: 0.28, h: 0.040 },
    { y: 0.32,  r: 0.20, h: 0.035 }
  ];

  const slabGroup = new THREE.Group();
  slabLevels.forEach(s => {
    const slabGeo = new THREE.CylinderGeometry(s.r, s.r * 1.06, s.h, 6);
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = s.y;

    const edges = new THREE.EdgesGeometry(slabGeo);
    const line = new THREE.LineSegments(edges, slabEdgeMat);
    slab.add(line);

    slabGroup.add(slab);
  });
  group.add(slabGroup);

  // 2. Octahedral AI Core with Data Stream Columns (AI-Enabled Workflows & Automation)
  const aiGeo = new THREE.OctahedronGeometry(0.12, 0);
  const aiCore = new THREE.Mesh(aiGeo, aiMat);
  group.add(aiCore);

  const beamGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const r = 0.15;
    const beamGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.70, 8);
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    beamGroup.add(beam);
  }
  group.add(beamGroup);

  // 3. Interlocking Gyroscopic Gimbal Rings (Systems Integration & Operational Scalability)
  const gimbal1Geo = new THREE.TorusGeometry(0.42, 0.009, 12, 64);
  const gimbal1 = new THREE.Mesh(gimbal1Geo, gimbalMat);
  group.add(gimbal1);

  const gimbal2Geo = new THREE.TorusGeometry(0.46, 0.009, 12, 64);
  const gimbal2 = new THREE.Mesh(gimbal2Geo, gimbalMat);
  group.add(gimbal2);

  const gimbal3Geo = new THREE.TorusGeometry(0.50, 0.009, 12, 64);
  const gimbal3 = new THREE.Mesh(gimbal3Geo, gimbalMat);
  group.add(gimbal3);

  return {
    group,
    animate: (time) => {
      aiCore.rotation.y = time * 0.9;
      aiCore.rotation.x = time * 0.45;
      const pulse = Math.sin(time * 4.0) * 0.3 + 1.1;
      aiMat.emissiveIntensity = 1.3 * pulse;

      gimbal1.rotation.x = time * 0.42;
      gimbal1.rotation.y = time * 0.22;

      gimbal2.rotation.y = time * 0.38;
      gimbal2.rotation.z = time * 0.28;

      gimbal3.rotation.z = time * 0.32;
      gimbal3.rotation.x = time * 0.18;

      slabGroup.rotation.y = -time * 0.07;
    }
  };
}

export const LIQUID_SHAPES = {
  strategy: {
    id: 'strategy',
    label: 'Strategy & Growth',
    name: 'Strategy & Growth',
    note: '4 Ascending Pillars · Helical GTM Ribbon · Dual Partnership Orbit',
    geo: () => new THREE.CapsuleGeometry(0.48, 0.62, 24, 48),
    specimen: createStrategySpecimen,
    baseY: 1.2,
    amp: 0.04,
    camR: 6.2,
    presets: {
      text: 'STRATEGY & GROWTH',
      size: 1.0,
      spin: 0.35,
      bob: 0.15,
      tilt: -6,
      roughness: 0.08,
      dispersion: 1.25,
      ior: 1.62,
      thickness: 2.8,
      tint: '#e6f4ff',
      clearcoat: 0.6,
      noise: 0.28,
      speed: 0.85
    }
  },
  innovation: {
    id: 'innovation',
    label: 'Innovation & Products',
    name: 'Innovation & Products',
    note: '0-to-1 Seed Core · 8-Cube Modular Matrix · Scaling Expansion Orbits',
    geo: () => new THREE.IcosahedronGeometry(0.70, 5),
    specimen: createInnovationSpecimen,
    baseY: 1.2,
    amp: 0.05,
    camR: 6.2,
    presets: {
      text: 'INNOVATION & PRODUCTS',
      size: 1.0,
      spin: 0.30,
      bob: 0.18,
      tilt: -4,
      roughness: 0.07,
      dispersion: 1.35,
      ior: 1.64,
      thickness: 2.7,
      tint: '#fae8ff',
      clearcoat: 0.55,
      noise: 0.32,
      speed: 0.90
    }
  },
  systems: {
    id: 'systems',
    label: 'Systems & Intelligence',
    name: 'Systems & Intelligence',
    note: '3 Stacked Operating Slabs · Octahedral AI Core · Gyroscopic Rings',
    geo: () => new THREE.CylinderGeometry(0.58, 0.64, 1.15, 6, 32),
    specimen: createSystemsSpecimen,
    baseY: 1.2,
    amp: 0.035,
    camR: 6.2,
    presets: {
      text: 'SYSTEMS & INTELLIGENCE',
      size: 1.0,
      spin: 0.28,
      bob: 0.16,
      tilt: -5,
      roughness: 0.09,
      dispersion: 1.20,
      ior: 1.60,
      thickness: 2.9,
      tint: '#ecfdf5',
      clearcoat: 0.65,
      noise: 0.26,
      speed: 0.80
    }
  },
  orb: {
    id: 'orb',
    label: 'Liquid Orb',
    name: 'Liquid Orb',
    note: "The design's hero: a ball of glass that breathes.",
    geo: () => new THREE.IcosahedronGeometry(1.05, 64),
    baseY: 1.16,
    amp: 1.0,
    camR: 6.4,
    presets: { text: 'LIQUID ORB', size: 0.5, spin: 0.12, sway: 0, bob: 0.055, roll: 0.08, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  dispersion: {
    id: 'dispersion',
    label: 'Dispersion',
    name: 'Dispersion',
    note: 'The same ball, framed for the rainbow inside it.',
    geo: () => new THREE.SphereGeometry(1, 96, 64),
    baseY: 1.14,
    amp: 0.05,
    camR: 6.0,
    presets: { text: 'DISPERSION', size: 0.5, spin: 0.12, sway: 0, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  torus: {
    id: 'torus',
    label: 'Torus',
    name: 'Torus',
    note: 'A ring, thick enough to see the room through twice.',
    geo: (c) => new THREE.TorusGeometry(0.42, num(c?.tube, 0.12), 32, 72),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: {
      text: 'TORUS',
      size: 0.90,
      tube: 0.12,
      spin: 0.40,
      sway: 0.22,
      bob: 0.20,
      tilt: -4,
      roll: 0,
      roughness: 0.13,
      iridescence: 0.11,
      dispersion: 1.05,
      ior: 1.63,
      thickness: 2.60,
      clearcoat: 0.45,
      noise: 0.34,
      speed: 0.95,
      twist: 0.00
    }
  },
  icosa: {
    id: 'icosa',
    label: 'Icosa',
    name: 'Icosa',
    note: 'Twenty flat faces, each refracting its own slice.',
    geo: () => new THREE.IcosahedronGeometry(0.52, 0),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'ICOSA', size: 1.0, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  sphere: {
    id: 'sphere',
    label: 'Sphere',
    name: 'Sphere',
    note: 'A plain ball, and the truest read of the material.',
    geo: () => new THREE.SphereGeometry(0.45, 48, 32),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'SPHERE', size: 1.15, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  octa: {
    id: 'octa',
    label: 'Octa',
    name: 'Octa',
    note: 'Eight faces and two sharp poles.',
    geo: () => new THREE.OctahedronGeometry(0.55, 0),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'OCTA', size: 0.975, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  capsule: {
    id: 'capsule',
    label: 'Capsule',
    name: 'Capsule',
    note: 'A pill: two domes and a straight run between them.',
    geo: () => new THREE.CapsuleGeometry(0.28, 0.55, 12, 32),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'CAPSULE', size: 0.85, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  cube: {
    id: 'cube',
    label: 'Cube',
    name: 'Cube',
    note: 'Six flats. The hardest thing to make look like glass.',
    geo: () => new THREE.BoxGeometry(0.72, 0.72, 0.72, 8, 8, 8),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'CUBE', size: 0.95, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  triangle: {
    id: 'triangle',
    label: 'Triangle',
    name: 'Triangle',
    note: 'A tetrahedron — four faces, four points.',
    geo: () => {
      const geo = new THREE.TetrahedronGeometry(0.66, 0);
      geo.rotateY(-Math.PI / 4);
      geo.rotateX(-Math.atan2(Math.SQRT2, 1));
      return geo;
    },
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'TRIANGLE', size: 1.0, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  },
  knot: {
    id: 'knot',
    label: 'Knot',
    name: 'Knot',
    note: 'A torus tied through itself, twice.',
    geo: (c) => new THREE.TorusKnotGeometry(
      0.32,
      num(c?.tube, 0.12),
      128,
      24,
      Math.round(num(c?.twists, 2)),
      Math.round(num(c?.loops, 3))
    ),
    baseY: 1.2,
    amp: 0.03,
    camR: 6.2,
    presets: { text: 'KNOT', size: 1.1, tube: 0.12, spin: 0.32, sway: 0.22, bob: 0.05, roll: 0, roughness: 0.05, iridescence: 0.05, noise: 0.22, speed: 0.7 }
  }
};

const getShape = (id) => LIQUID_SHAPES[String(id)] || LIQUID_SHAPES.strategy || LIQUID_SHAPES.orb;

export const LIQUID_DEFAULTS = {
  shape: 'strategy',
  twists: 2,
  loops: 3,
  tube: 0.12,
  size: 1.0,
  width: 1.0,
  height: 1.0,
  twist: 0.0,
  dispersion: 1.25,
  ior: 1.62,
  roughness: 0.08,
  thickness: 2.80,
  iridescence: 0.11,
  clearcoat: 0.60,
  tint: '#e6f4ff',
  noise: 0.28,
  speed: 0.85,
  spinDir: 'forward',
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  spinX: 0,
  spin: 0.35,
  spinZ: 0,
  sway: 0.22,
  yaw: 0,
  roll: 0,
  bob: 0.15,
  tilt: -6,
  sky: '#b9c6d0',
  haze: '#e9ebec',
  ground: '#45484c',
  warm: '#e6cfa8',
  blur: 0.35,
  centre: true,
  zoom: 1.15,
  exposure: 0.65,
  bloom: 0.32,
  text: 'STRATEGY & GROWTH',
  textSize: 1.0,
  textColor: '#4a5157',
  orbit: false,
  surfaceHover: true,
  scrollEnabled: false,
  skyEnabled: false,
  oceanEnabled: false,
  motionDynamic: 'revolve'
};

// Shaders for Simplex 3D Noise Vertex Fluid Displacement & Normal Reconstruction
const VERTEX_SHADER_HEADER = `
#include <common>
uniform float uT2;
uniform float uAmp;
uniform float uFreq;
uniform float uTwist;

vec3 m289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 m289v(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 prm(vec4 x) { return m289v(((x * 34.0) + 1.0) * x); }
vec4 tsq(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snz(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = m289(i);
  vec4 p = prm(prm(prm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 nr = tsq(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= nr.x; p1 *= nr.y; p2 *= nr.z; p3 *= nr.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float blobH(vec3 d) {
  vec3 q = d * uFreq + vec3(0.0, uT2 * 0.3, uT2 * 0.22);
  float f = 0.74 * snz(q) + 0.10 * snz(q * 2.0 + 7.3);
  float rg = 1.0 - abs(snz(q * 0.85 - 3.1));
  f += 0.4 * rg * rg - 0.2;
  return f;
}
`;

const VERTEX_SHADER_NORMAL = `
vec3 bDir = normalize(position);
float bEps = 0.05;
vec3 bT1 = normalize(cross(bDir, abs(bDir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
vec3 bT2 = normalize(cross(bDir, bT1));
float bR = length(position);
vec3 dA = normalize(bDir + bT1 * bEps);
vec3 dB = normalize(bDir + bT2 * bEps);
vec3 bPC = bDir * (bR + uAmp * blobH(bDir));
vec3 bPA = dA * (bR + uAmp * blobH(dA));
vec3 bPB = dB * (bR + uAmp * blobH(dB));
vec3 objectNormal = normalize(cross(bPA - bPC, bPB - bPC));
if (dot(objectNormal, bDir) < 0.0) objectNormal = -objectNormal;
if (uAmp < 0.001) objectNormal = normalize(normal);
float twA = uTwist * bPC.y;
float twC = cos(twA);
float twS = sin(twA);
bPC = vec3(bPC.x * twC - bPC.z * twS, bPC.y, bPC.x * twS + bPC.z * twC);
objectNormal = vec3(objectNormal.x * twC - objectNormal.z * twS, objectNormal.y, objectNormal.x * twS + objectNormal.z * twC);
`;

const VERTEX_SHADER_TRANSFORM = `
vec3 transformed = bPC;
`;

export class LiquidGlassEngine {
  constructor(container, initialValues = {}) {
    this.container = container;
    this.c = { ...LIQUID_DEFAULTS, ...initialValues };
    this.backend = 'WebGL 2';
    this.isDisposed = false;
    this.isPaused = false;
    this.needsRender = true;

    // Time counters
    this.simTime = 0;
    this.flowTime = 0;
    this.lastFrameTime = 0;

    // Hover ripple interaction
    this.surfaceHoverEnabled = initialValues.surfaceHover !== false;
    this.mousePointer = new THREE.Vector2(0, 0);
    this.hoverIntensity = 0;
    this.targetHoverIntensity = 0;

    this.initCanvas();
    this.initScene();
    this.initLighting();
    this.initMaterial();
    this.initEnvironment();
    this.initMesh();
    this.initTextPlane();
    this.initControls();
    this.initEvents();

    this.applyAllValues();
    this.startLoop();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'metalforge-liquid-canvas';
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;top:0;left:0;';
    this.container.appendChild(this.canvas);

    const w = this.container.clientWidth || window.innerWidth || 800;
    const h = this.container.clientHeight || window.innerHeight || 600;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = num(this.c.exposure, 0.65);

    this.pmremGen = new THREE.PMREMGenerator(this.renderer);
    this.pmremGen.compileEquirectangularShader();
  }

  initScene() {
    this.scene = new THREE.Scene();
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(33, w / h, 0.1, 220);
    this.targetLookAt = new THREE.Vector3(0, 1, 0);
    this.updateCameraFraming();

    // Group hierarchy: root group for motion/bobbing, child group for rotation/scale
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    this.meshGroup = new THREE.Group();
    this.rootGroup.add(this.meshGroup);
  }

  updateCameraFraming() {
    const shape = getShape(this.c.shape);
    const targetY = (!this.c.centre && this.c.centre !== undefined) ? 1.0 : shape.baseY;
    this.targetLookAt.set(0, targetY, 0);
    this.camera.position.setFromSphericalCoords(shape.camR, 1.42, 0).add(this.targetLookAt);
    this.camera.lookAt(this.targetLookAt);
    this.camera.zoom = num(this.c.zoom, 1.15);
    this.camera.updateProjectionMatrix();
  }

  initLighting() {
    const mainDir = new THREE.DirectionalLight(0xffffff, 0.45);
    mainDir.position.set(4, 9, 5);
    this.scene.add(mainDir);

    const addRim = (x, y, z, intensity) => {
      const l = new THREE.DirectionalLight(0xffffff, intensity);
      l.position.set(x, y, z);
      this.scene.add(l);
    };

    addRim(-9, 4, 2, 0.24);
    addRim(9, 3, -3, 0.21);
    addRim(0, 3.5, -11, 0.26);
    addRim(0, 4, 11, 0.16);
    addRim(0, -7, 0, 0.11);

    const hemi = new THREE.HemisphereLight(0xdfe7ee, 0x6c7276, 0.28);
    this.scene.add(hemi);

    this.scene.fog = new THREE.Fog(0xc6cbce, 18, 62);
  }

  initMaterial() {
    this.uT2 = { value: 0 };
    this.uAmp = { value: 0 };
    this.uFreq = { value: 0.9 };
    this.uTwist = { value: 0 };

    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: num(this.c.roughness, 0.05),
      transmission: 1,
      thickness: num(this.c.thickness, 2.6),
      ior: num(this.c.ior, 1.44),
      dispersion: num(this.c.dispersion, 1.2),
      iridescence: num(this.c.iridescence, 0.05),
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [100, 400],
      clearcoat: num(this.c.clearcoat, 0.45),
      clearcoatRoughness: 0.12,
      attenuationColor: new THREE.Color(str(this.c.tint, '#eef6fb')),
      attenuationDistance: 4,
      specularIntensity: 0.9,
      envMapIntensity: 1.0
    });

    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uT2 = this.uT2;
      shader.uniforms.uAmp = this.uAmp;
      shader.uniforms.uFreq = this.uFreq;
      shader.uniforms.uTwist = this.uTwist;

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', VERTEX_SHADER_HEADER)
        .replace('#include <beginnormal_vertex>', VERTEX_SHADER_NORMAL)
        .replace('#include <begin_vertex>', VERTEX_SHADER_TRANSFORM);
    };

    this.material.customProgramCacheKey = () => 'liquid-glass-1';
  }

  initEnvironment() {
    this.rebuildEnvironment();
  }

  rebuildEnvironment() {
    const envScene = new THREE.Scene();

    // Sky Dome with subtle spherical color gradient
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        ca: { value: new THREE.Color(str(this.c.sky, '#b9c6d0')) },
        cb: { value: new THREE.Color(str(this.c.haze, '#e9ebec')) },
        cc: { value: new THREE.Color(str(this.c.ground, '#45484c')) },
        cw: { value: new THREE.Color(str(this.c.warm, '#e6cfa8')) }
      },
      vertexShader: `
        varying vec3 vP;
        void main() {
          vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vP;
        uniform vec3 ca, cb, cc, cw;
        void main() {
          vec3 d = normalize(vP);
          float h = d.y;
          vec3 col = h > 0.0 ? mix(cb, ca, pow(h, 0.75)) : mix(cb, cc, pow(-h, 0.35));
          float wa = max(0.0, dot(d, normalize(vec3(-0.6, -0.25, 0.55))));
          col = mix(col, cw, pow(wa, 3.0) * 0.3);
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const skyDome = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 20), skyMat);
    envScene.add(skyDome);

    // 8 Strategic Softbox Reflector Planes for Glass Highlights & Caustics
    const addReflector = (w, h, px, py, pz, colorScalar) => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setScalar(colorScalar),
          side: THREE.DoubleSide
        })
      );
      plane.position.set(px, py, pz);
      plane.lookAt(0, 1, 0);
      envScene.add(plane);
    };

    addReflector(10, 5, 0, 15, 3, 4.5);
    addReflector(3, 12, -15, 4, -4, 3.6);
    addReflector(3, 10, 15, 4, -2, 2.8);
    addReflector(26, 1.2, 0, 1.5, -19, 5.0);
    addReflector(22, 3, 0, 3, 20, 2.0);
    addReflector(9, 9, -13, 6, 12, 2.4);
    addReflector(9, 9, 13, 6, 12, 2.4);
    addReflector(30, 30, 0, -8, 0, 1.0);

    if (this.envTextureTarget) {
      this.envTextureTarget.dispose();
    }
    this.envTextureTarget = this.pmremGen.fromScene(envScene, 0.02);
    const texture = this.envTextureTarget.texture;

    this.scene.environment = texture;
    this.scene.background = texture;
    this.scene.backgroundBlurriness = num(this.c.blur, 0.35);
    this.scene.backgroundIntensity = 1.0;
    if (this.scene.fog) {
      this.scene.fog.color.set(0xc6cbce);
    }

    envScene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }

  initMesh() {
    this.currentMesh = null;
    this.currentSpecimenObj = null;
    this.rebuildMeshGeometry();
  }

  rebuildMeshGeometry() {
    if (this.currentSpecimenObj) {
      if (this.currentSpecimenObj.group) {
        this.meshGroup.remove(this.currentSpecimenObj.group);
      }
      this.currentSpecimenObj = null;
    }

    if (this.currentMesh) {
      this.meshGroup.remove(this.currentMesh);
      this.currentMesh.geometry.dispose();
      this.currentMesh = null;
    }

    const shape = getShape(this.c.shape);
    const geometry = shape.geo(this.c);
    this.currentMesh = new THREE.Mesh(geometry, this.material);
    this.meshGroup.add(this.currentMesh);

    // If this shape has an internal 3D dynamic specimen, instantiate and attach it
    if (typeof shape.specimen === 'function') {
      this.currentSpecimenObj = shape.specimen();
      if (this.currentSpecimenObj && this.currentSpecimenObj.group) {
        this.meshGroup.add(this.currentSpecimenObj.group);
      }
    }

    this.updateCameraFraming();
    this.updateMeshTransform();
  }

  updateMeshTransform() {
    const s = num(this.c.size, 1.1);
    const w = num(this.c.width, 1.0);
    const h = num(this.c.height, 1.0);
    this.meshGroup.scale.set(s * w, s * h, s);
  }

  initTextPlane() {
    this.textCanvas = document.createElement('canvas');
    this.textCanvas.width = 4096;
    this.textCanvas.height = 1024;
    this.textCtx = this.textCanvas.getContext('2d');

    this.textTexture = new THREE.CanvasTexture(this.textCanvas);
    if (THREE.SRGBColorSpace) this.textTexture.colorSpace = THREE.SRGBColorSpace;
    this.textTexture.generateMipmaps = true;
    this.textTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.textTexture.magFilter = THREE.LinearFilter;
    this.textTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // transparent: false and alphaTest: 0.5 allows the text to be included in Three.js transmission pass!
    this.textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 1.6),
      new THREE.MeshBasicMaterial({
        map: this.textTexture,
        transparent: false,
        alphaTest: 0.5,
        alphaToCoverage: true,
        depthWrite: true,
        fog: false
      })
    );
    this.scene.add(this.textPlane);

    this.renderTextToCanvas();
  }

  renderTextToCanvas() {
    const text = String(this.c.text ?? '').trim();
    const ctx = this.textCtx;
    ctx.clearRect(0, 0, 4096, 1024);

    if (!text) {
      this.textPlane.visible = false;
      this.textTexture.needsUpdate = true;
      return;
    }

    this.textPlane.visible = true;
    let fontSize = 640;
    ctx.font = `400 ${fontSize}px ${FONT_STACK}`;

    while (ctx.measureText(text).width > 3850.24 && fontSize > 160) {
      fontSize -= 24;
      ctx.font = `400 ${fontSize}px ${FONT_STACK}`;
    }

    ctx.fillStyle = str(this.c.textColor, '#4a5157');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 2048, 512 + 0.03 * fontSize);
    this.textTexture.needsUpdate = true;
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 14.0;
    this.controls.target.copy(this.targetLookAt);
    this.controls.enabled = !!this.c.orbit;
  }

  initEvents() {
    this.onResize = () => {
      if (this.isDisposed) return;
      const w = this.container.clientWidth || window.innerWidth || 800;
      const h = this.container.clientHeight || window.innerHeight || 600;
      if (w && h) {
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.needsRender = true;
      }
    };
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.container);

    this.onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.mousePointer.set(x, y);

      if (this.surfaceHoverEnabled) {
        const distFromCenter = Math.sqrt(x * x + y * y);
        if (distFromCenter < 0.6) {
          this.targetHoverIntensity = 1.0 - (distFromCenter / 0.6);
        } else {
          this.targetHoverIntensity = 0;
        }
      }
    };
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });

    this.onPointerLeave = () => {
      this.targetHoverIntensity = 0;
    };
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
  }

  applyAllValues() {
    const shape = getShape(this.c.shape);

    this.material.dispersion = num(this.c.dispersion, 1.05);
    this.material.ior = num(this.c.ior, 1.63);
    this.material.roughness = num(this.c.roughness, 0.13);
    this.material.thickness = num(this.c.thickness, 2.60);
    this.material.iridescence = num(this.c.iridescence, 0.11);
    this.material.clearcoat = num(this.c.clearcoat, 0.45);
    this.material.attenuationColor.set(str(this.c.tint, '#eef6fb'));

    this.renderer.toneMappingExposure = num(this.c.exposure, 0.65);
    this.scene.backgroundBlurriness = num(this.c.blur, 0.35);

    this.updateMeshTransform();
    this.updateCameraFraming();

    // Noise amplitude = base noise * shape amp + hover ripple boost
    this.baseNoiseAmp = num(this.c.noise, 0.34) * shape.amp;
    this.uAmp.value = this.baseNoiseAmp;
    this.uTwist.value = num(this.c.twist, 0);

    this.textPlane.scale.setScalar(num(this.c.textSize, 1.0));

    this.meshGroup.rotation.set(
      num(this.c.rotX, 0) * DEG_TO_RAD,
      num(this.c.rotY, 0) * DEG_TO_RAD,
      num(this.c.rotZ, 0) * DEG_TO_RAD
    );

    if (this.controls) {
      this.controls.enabled = !!this.c.orbit;
      this.controls.target.copy(this.targetLookAt);
    }
  }

  setValues(newVals = {}) {
    const shapeChanged = ['shape', 'twists', 'loops', 'tube'].some(k => newVals[k] !== undefined && newVals[k] !== this.c[k]);
    const skyChanged = ['sky', 'haze', 'ground', 'warm'].some(k => newVals[k] !== undefined && newVals[k] !== this.c[k]);
    const textChanged = ['text', 'textColor'].some(k => newVals[k] !== undefined && newVals[k] !== this.c[k]);

    Object.assign(this.c, newVals);

    if (newVals.surfaceHover !== undefined) {
      this.surfaceHoverEnabled = !!newVals.surfaceHover;
    }

    if (shapeChanged) {
      this.rebuildMeshGeometry();
    }
    if (skyChanged) {
      this.rebuildEnvironment();
    }
    if (textChanged) {
      this.renderTextToCanvas();
    }

    this.applyAllValues();
    this.needsRender = true;
  }

  setSurfaceHover(enabled) {
    this.surfaceHoverEnabled = !!enabled;
    if (!enabled) {
      this.targetHoverIntensity = 0;
      this.hoverIntensity = 0;
    }
  }

  setPaused(paused) {
    this.isPaused = !!paused;
    this.lastFrameTime = 0;
    this.needsRender = true;
  }

  reset() {
    this.simTime = 0;
    this.flowTime = 0;
    this.needsRender = true;
  }

  startLoop() {
    const forwardVector = new THREE.Vector3();

    const renderFrame = (now) => {
      if (this.isDisposed) return;
      this.animId = requestAnimationFrame(renderFrame);

      const dt = this.lastFrameTime ? Math.min((now - this.lastFrameTime) / 1000, 0.05) : 0;
      this.lastFrameTime = now;

      if (this.controls && this.controls.enabled) {
        this.controls.update();
      }

      if (this.isPaused && !this.needsRender) return;

      if (!this.isPaused) {
        this.simTime += dt;
        this.flowTime += dt * num(this.c.speed, 0.7);

        // Smoothly interpolate hover ripple
        this.hoverIntensity += (this.targetHoverIntensity - this.hoverIntensity) * 0.12;

        if (this.currentSpecimenObj && typeof this.currentSpecimenObj.animate === 'function') {
          this.currentSpecimenObj.animate(this.simTime);
        }
      }
      this.needsRender = false;

      // Update shader uniforms
      this.uT2.value = this.flowTime;
      const rippleBoost = this.surfaceHoverEnabled ? (this.hoverIntensity * 0.18) : 0;
      this.uAmp.value = this.baseNoiseAmp + rippleBoost;

      const t = this.simTime;
      const shape = getShape(this.c.shape);

      // Natural harmonic bobbing
      this.rootGroup.position.y = shape.baseY + Math.sin(0.8 * t) * num(this.c.bob, 0.20);

      // Rotation & gentle tumbling
      const dirSign = this.c.spinDir === 'reverse' ? -1 : 1;
      this.rootGroup.rotation.x = t * num(this.c.spinX, 0) * dirSign + Math.sin(0.35 * t) * num(this.c.sway, 0);
      this.rootGroup.rotation.y = t * num(this.c.spin, 0.40) * dirSign + Math.sin(0.29 * t) * num(this.c.yaw, 0);
      this.rootGroup.rotation.z = t * num(this.c.spinZ, 0) * dirSign + Math.sin(0.23 * t) * num(this.c.roll, 0) + num(this.c.tilt, -4) * DEG_TO_RAD;

      // Position 3D text plane 2.2 units behind the subject along camera view direction
      if (this.textPlane.visible) {
        forwardVector.subVectors(this.targetLookAt, this.camera.position);
        forwardVector.y = 0;
        if (forwardVector.lengthSq() > 1e-4) forwardVector.normalize();

        this.textPlane.position.copy(this.targetLookAt).addScaledVector(forwardVector, 2.2);
        this.textPlane.position.y = 1.02;
        this.textPlane.lookAt(this.camera.position.x, this.textPlane.position.y, this.camera.position.z);
      }

      this.renderer.render(this.scene, this.camera);
    };

    this.animId = requestAnimationFrame(renderFrame);
  }

  dispose() {
    this.isDisposed = true;
    if (this.animId) cancelAnimationFrame(this.animId);

    if (this.currentSpecimenObj && this.currentSpecimenObj.group) {
      this.meshGroup.remove(this.currentSpecimenObj.group);
      this.currentSpecimenObj = null;
    }

    window.removeEventListener('pointermove', this.onPointerMove);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.controls) {
      this.controls.dispose();
    }

    if (this.currentMesh) {
      this.currentMesh.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.textPlane) {
      this.textPlane.geometry.dispose();
      this.textPlane.material.dispose();
    }
    if (this.textTexture) {
      this.textTexture.dispose();
    }
    if (this.envTextureTarget) {
      this.envTextureTarget.dispose();
    }
    if (this.pmremGen) {
      this.pmremGen.dispose();
    }

    this.renderer.dispose();
    this.renderer.forceContextLoss();
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.remove();
    }
  }
}
