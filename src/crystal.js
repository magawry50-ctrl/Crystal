import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { getSharedStoneTextures, createSeededRandom, voronoi3D } from './stoneTextures.js';
import gsap from 'gsap';

// Interpolate radius along rings
function interpolateRingRadius(rings, y) {
  if (!rings || !rings.length) return 1.0;
  if (y <= rings[0].y) return rings[0].r;
  for (let i = 1; i < rings.length; i++) {
    if (y <= rings[i].y) {
      const prev = rings[i - 1], next = rings[i];
      const t = (y - prev.y) / (next.y - prev.y);
      return prev.r + (next.r - prev.r) * t;
    }
  }
  return rings[rings.length - 1].r;
}

export class IceCrystal {
  constructor(gemConfig) {
    this.group = new THREE.Group();
    this.group.name = "NaturalGemGroup";

    // Inner group holding stone geometry & veils
    this.stoneGroup = new THREE.Group();
    this.stoneGroup.name = "StoneMeshes";
    this.group.add(this.stoneGroup);

    this.isExploded = false;
    this.glassLeft = 100;
    this.shards = [];
    this.chippedShards = [];
    this.anchors = {
      top: new THREE.Vector3(0, 2.4, 0),
      right: new THREE.Vector3(1.3, 0, 0),
      bottom: new THREE.Vector3(0, -2.3, 0)
    };

    this.textures = getSharedStoneTextures();
    this.tessellator = new TessellateModifier(0.09, 8);

    this.currentConfig = gemConfig;
    this.rebuildStone(gemConfig);
  }

  rebuildStone(gemConfig) {
    if (!gemConfig) return;
    this.currentConfig = gemConfig;
    this.isExploded = false;
    this.glassLeft = 100;
    this.shards = [];
    this.chippedShards = [];

    // Clear previous stone meshes from stoneGroup
    while (this.stoneGroup.children.length > 0) {
      const c = this.stoneGroup.children[0];
      if (c.geometry) c.geometry.dispose();
      this.stoneGroup.remove(c);
    }

    const prng = createSeededRandom(gemConfig.seed || 1337);
    const rng = (min, max) => min + prng() * (max - min);

    const shape = gemConfig.shape || {};
    const sides = shape.sides || 6;
    const rings = shape.rings || [{ y: -1.5, r: 1 }, { y: 1.5, r: 1 }];
    const aspectZ = shape.z !== undefined ? shape.z : 1.0;
    const spin = shape.spin !== undefined ? shape.spin : (Math.PI / 2 - Math.PI / sides);
    const align = shape.align || false;

    // 1. Gather point cloud for ConvexGeometry
    const points = [];
    let alignedAngle = spin;

    for (const r of rings) {
      const baseAngle = align ? alignedAngle : rng(0, Math.PI * 2);
      for (let s = 0; s < sides; s++) {
        const theta = baseAngle + (s / sides) * Math.PI * 2 + rng(-(shape.aj || 0.04), (shape.aj || 0.04));
        const rMin = shape.rj?.[0] !== undefined ? shape.rj[0] : 0.96;
        const rMax = shape.rj?.[1] !== undefined ? shape.rj[1] : 1.04;
        const radius = r.r * rng(rMin, rMax);
        const yJitter = rng(-(shape.yj || 0.03), (shape.yj || 0.03));

        points.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          r.y + yJitter,
          Math.sin(theta) * radius * aspectZ
        ));
      }
    }

    // Top and Bottom Apexes
    const top = shape.top || { y: 2.45, x: 0.05, z: 0.05 };
    const bot = shape.bot || { y: -2.35, x: 0.05, z: 0.05 };
    points.push(new THREE.Vector3(rng(-top.x, top.x), top.y, rng(-top.z, top.z)));
    points.push(new THREE.Vector3(rng(-bot.x, bot.x), bot.y, rng(-bot.z, bot.z)));

    // Procedural chip points
    if (shape.chips && shape.chips.n > 0) {
      for (let i = 0; i < shape.chips.n; i++) {
        const theta = rng(0, Math.PI * 2);
        const y = rng(shape.chips.y[0], shape.chips.y[1]);
        if (shape.chips.abs) {
          const rx = rng(shape.chips.abs.rx[0], shape.chips.abs.rx[1]);
          const rz = rng(shape.chips.abs.rz[0], shape.chips.abs.rz[1]);
          points.push(new THREE.Vector3(Math.cos(theta) * rx, y, Math.sin(theta) * rz));
        } else {
          const rel = shape.chips.rel || [0.98, 1.05];
          const r = interpolateRingRadius(rings, y) * rng(rel[0], rel[1]);
          points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r * aspectZ));
        }
      }
    }

    // Procedural crown points
    if (shape.crown && shape.crown.n > 0) {
      for (let i = 0; i < shape.crown.n; i++) {
        const theta = rng(0, Math.PI * 2);
        const y = rng(shape.crown.y[0], shape.crown.y[1]);
        const r = rng(shape.crown.r[0], shape.crown.r[1]);
        points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r * aspectZ));
      }
    }

    // Skew (e.g. Luckstone)
    if (shape.skew) {
      for (const p of points) {
        p.x += shape.skew * p.y;
      }
    }

    // Cut Planes (e.g. Moonstone snapped base, Luckstone snapped top)
    const cuts = shape.cuts || [];
    for (const cut of cuts) {
      const cutNormal = new THREE.Vector3(...cut.n).normalize();
      const cutDist = cut.d;
      for (const p of points) {
        const d = p.dot(cutNormal) - cutDist;
        if (d > 0) {
          p.addScaledVector(cutNormal, -d);
        }
      }
    }

    // 2. Generate Base Convex Geometry
    const baseHull = new ConvexGeometry(points);

    // 3. Tessellate large planar faces (MetalForge TessellateModifier)
    let geometry = this.tessellator.modify(baseHull);

    // 4. Voronoi Conchoidal Hammer Carving (MetalForge iJ Hammer)
    const hammer = gemConfig.hammer || {};
    const posAttr = geometry.attributes.position;
    const vertexCount = posAttr.count;
    const chipAttr = new Float32Array(vertexCount);
    const pVec = new THREE.Vector3();

    // Calculate vertical metrics for window and bite masking
    geometry.computeBoundingBox();
    const bb0 = geometry.boundingBox;
    const totalHeight = top.y - bot.y;
    const midTopY = top.y - 0.318 * totalHeight;
    const nearTopY = top.y - 0.068 * totalHeight;
    const centerX = (bb0.min.x + bb0.max.x) / 2;
    const centerY = (bb0.min.y + bb0.max.y) / 2;
    const halfWidthX = 0.3 * (bb0.max.x - bb0.min.x);
    const halfHeightY = 0.26 * (bb0.max.y - bb0.min.y);
    const maxZ = Math.max(-bb0.min.z, bb0.max.z);

    // Window mask helper
    const getWindowMask = (p) => {
      if (!hammer.window) return 0;
      const t = Math.hypot((p.x - centerX) / (halfWidthX || 1), (p.y - centerY) / (halfHeightY || 1));
      return (1.0 - THREE.MathUtils.smoothstep(t, 0.6, 1.0)) * THREE.MathUtils.smoothstep(Math.abs(p.z) / (maxZ || 1), 0.2, 0.5);
    };

    // Precalculate hammer bite spheres
    const bites = [];
    if (hammer.bites && hammer.bites.n > 0) {
      for (let b = 0; b < hammer.bites.n; b++) {
        let bAng = rng(0, Math.PI * 2);
        const bY = rng(hammer.bites.y[0], hammer.bites.y[1]);
        if (hammer.window && Math.abs(Math.sin(bAng)) > 0.55 && Math.abs(bY - centerY) < 1.1 * halfHeightY) {
          bAng = (Math.cos(bAng) >= 0 ? 0 : Math.PI) + (Math.sin(bAng) > 0 ? 0.5 : -0.5) * (Math.cos(bAng) >= 0 ? 1 : -1);
        }
        const bRad = rng(hammer.bites.rad[0], hammer.bites.rad[1]);
        const rVal = hammer.bites.abs ? hammer.bites.abs[0] : interpolateRingRadius(rings, bY);
        const rValZ = hammer.bites.abs ? hammer.bites.abs[1] : interpolateRingRadius(rings, bY) * aspectZ;
        const bCenter = new THREE.Vector3(Math.cos(bAng) * rVal + (shape.skew || 0) * bY, bY, Math.sin(bAng) * rValZ);
        const bNorm = new THREE.Vector3(Math.cos(bAng) * rVal, 0, Math.sin(bAng) * rValZ).normalize();
        bites.push({
          c: bCenter.clone().addScaledVector(bNorm, 0.72 * bRad),
          r: bRad
        });
      }
    }

    const bigScale = hammer.bigS || 1.0;
    const bigThresh = hammer.bigT || 0.68;
    const bigDepth = hammer.bigD || 0.2;
    const midScale = hammer.midS || 3.0;
    const midThresh = hammer.midT || 0.85;
    const midDepth = hammer.midD || 0.05;

    for (let i = 0; i < vertexCount; i++) {
      pVec.fromBufferAttribute(posAttr, i);

      const vBig = voronoi3D(pVec.x, pVec.y, pVec.z, bigScale, (gemConfig.seed || 1337) + 7);
      const vMid = voronoi3D(pVec.x, pVec.y, pVec.z, midScale, (gemConfig.seed || 1337) + 19);

      const apexSmooth = THREE.MathUtils.smoothstep(pVec.y, midTopY, nearTopY);
      const windowShield = 1.0 - 0.85 * getWindowMask(pVec);

      let pull = 0;
      let chipVal = 0;

      const dynamicBigThresh = bigThresh - 0.3 * apexSmooth;
      if (vBig.id > dynamicBigThresh) {
        const t = (vBig.id - dynamicBigThresh) / (1.0 - dynamicBigThresh);
        pull -= (bigDepth * t + 0.07 * Math.max(0, 0.6 - vBig.d)) * windowShield;
        chipVal = Math.max(chipVal, (0.15 + 0.6 * t) * windowShield);
      }

      const dynamicMidThresh = midThresh - 0.35 * apexSmooth;
      if (vMid.id > dynamicMidThresh) {
        pull -= midDepth * ((vMid.id - dynamicMidThresh) / (1.0 - dynamicMidThresh)) * windowShield;
        chipVal = Math.max(chipVal, 0.4 * windowShield);
      }

      chipVal = Math.max(chipVal, 0.4 * apexSmooth * apexSmooth);

      for (const cut of cuts) {
        const cutNormal = new THREE.Vector3(...cut.n).normalize();
        if (Math.abs(pVec.dot(cutNormal) - cut.d) < 0.05) {
          chipVal = Math.max(chipVal, 0.75);
        }
      }

      // Displace along surface outward normal
      const normalDir = new THREE.Vector3(pVec.x - (shape.skew || 0) * pVec.y, 0.45 * pVec.y, pVec.z).normalize();
      pVec.addScaledVector(normalDir, pull);

      // Apply bite carving
      for (const bite of bites) {
        if (pVec.distanceTo(bite.c) < bite.r) {
          pVec.sub(bite.c).setLength(bite.r).add(bite.c);
          chipVal = Math.max(chipVal, 0.6);
        }
      }

      posAttr.setXYZ(i, pVec.x, pVec.y, pVec.z);
      chipAttr[i] = chipVal;
    }

    geometry.setAttribute('chip', new THREE.BufferAttribute(chipAttr, 1));
    geometry.computeVertexNormals();

    // 5. Generate Planar Projected UVs from Normal Orientation
    const normals = geometry.attributes.normal;
    const uvs = new Float32Array(vertexCount * 2);
    for (let i = 0; i < vertexCount; i += 3) {
      const nx = Math.abs(normals.getX(i));
      const ny = Math.abs(normals.getY(i));
      const nz = Math.abs(normals.getZ(i));

      for (let s = 0; s < 3; s++) {
        const vi = i + s;
        const px = posAttr.getX(vi);
        const py = posAttr.getY(vi);
        const pz = posAttr.getZ(vi);
        let u, v;

        if (nx >= ny && nx >= nz) {
          u = pz; v = py;
        } else if (ny >= nz) {
          u = px; v = pz;
        } else {
          u = px; v = py;
        }
        uvs[vi * 2] = 0.55 * u;
        uvs[vi * 2 + 1] = 0.55 * v;
      }
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // Bounding Dimensions and Telephoto Scale
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const h = bb.max.y - bb.min.y;
    const w = bb.max.x - bb.min.x;
    const d = bb.max.z - bb.min.z;
    const fitScale = gemConfig.scale ?? Math.min(4.5 / h, 3.0 / Math.max(w, d));

    // Natural Tilt
    this.stoneGroup.rotation.z = (gemConfig.tilt || 0);
    this.stoneGroup.rotation.x = 0.06;
    this.stoneGroup.scale.setScalar(fitScale);

    // Track anchor points for HUD
    this.anchors = {
      top: new THREE.Vector3(0, bb.max.y * fitScale, 0),
      right: new THREE.Vector3(bb.max.x * fitScale, 0, 0),
      bottom: new THREE.Vector3(0, bb.min.y * fitScale, 0)
    };

    // 6. Outer Physical Transmission Glass Material
    const g = gemConfig.glass || {};
    const sym = gemConfig.symbol || {};
    const edgeArr = sym.edge || g.edge || [0.25, 0.9, 1.6];
    const coreArr = sym.core || [1.8, 2.8, 3.4];
    const frostArr = g.frost || [0.04, 0.045, 0.055];

    this.uniforms = {
      uGlow: { value: 1.0 },
      uCore: { value: new THREE.Vector3(...coreArr) },
      uEdge: { value: new THREE.Vector3(...edgeArr) },
      uFrost: { value: new THREE.Vector3(...frostArr) },
      uCenter: { value: new THREE.Vector3(0, 0, 0) }
    };

    this.gemMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(g.color || "#EEF7FF"),
      metalness: 0.0,
      roughness: g.roughness !== undefined ? g.roughness : 0.08,
      roughnessMap: this.textures.bumpMap,
      bumpMap: this.textures.bumpMap,
      bumpScale: 0.45,
      transmission: 1.0,
      thickness: g.thickness !== undefined ? g.thickness : 0.2,
      ior: 1.5,
      dispersion: 0.12,
      attenuationColor: new THREE.Color(g.atten || "#B4D8F5"),
      attenuationDistance: g.attDist !== undefined ? g.attDist : 2.6,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      specularIntensity: 1.0,
      envMapIntensity: 0.6,
      flatShading: true,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide
    });

    this.gemMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);

      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;\nattribute float chip;\nvarying float vChip;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;\nvChip = chip;');

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;\nvarying float vChip;\nuniform float uGlow;\nuniform vec3 uEdge, uCore, uFrost, uCenter;')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = min(1.0, roughnessFactor + 0.45 * vChip);')
        .replace('#include <transmission_fragment>', `
          material.transmission = transmission * ( 1.0 - 0.12 * vChip );
          #include <transmission_fragment>
        `)
        .replace('#include <emissivemap_fragment>', `
          #include <emissivemap_fragment>
          {
            vec3 d = (vObjPos - uCenter) * vec3(1.0, 0.5, 1.3);
            float f = 1.0 / (1.0 + 10.0 * dot(d, d));
            float m = 0.7 + 0.6 * texture2D(bumpMap, vBumpMapUv).r;
            totalEmissiveRadiance += mix(uEdge, uCore, f) * m * uGlow;
            totalEmissiveRadiance += uFrost * vChip;
          }
        `);
    };

    this.mainMesh = new THREE.Mesh(geometry, this.gemMaterial);
    this.mainMesh.castShadow = true;
    this.mainMesh.receiveShadow = true;
    this.mainMesh.renderOrder = 4;
    this.stoneGroup.add(this.mainMesh);

    // 7. Inner Absorption Dark Wall Mesh (BackSide)
    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(g.wall || "#2A4560"),
      map: this.textures.wallMap,
      emissive: new THREE.Color(g.wallEm || "#050D18"),
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.BackSide,
      flatShading: true,
      depthWrite: true
    });
    this.wallMesh = new THREE.Mesh(geometry, this.wallMaterial);
    this.wallMesh.renderOrder = 1;
    this.stoneGroup.add(this.wallMesh);

    // 8. Facet Creases Lines
    const edges = new THREE.EdgesGeometry(geometry, 14);
    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      linewidth: 1
    });
    this.creasesMesh = new THREE.LineSegments(edges, this.wireframeMaterial);
    this.creasesMesh.renderOrder = 5;
    this.stoneGroup.add(this.creasesMesh);

    // 9. Internal Veils (Quartz Phantom Inclusions)
    this.buildInternalVeils(gemConfig);

    // 10. Cleavage Shards for Shattering
    this.buildCleavageShards(baseHull);
  }

  buildInternalVeils(gemConfig) {
    this.veilGroup = new THREE.Group();
    this.veilGroup.name = "VeilGroup";

    const vSpec = gemConfig.veils || { n: 10, x: 0.4, y: [-1.2, 1.2], z: 0.35, len: [0.3, 0.9] };
    const g = gemConfig.glass || {};

    const veilMat1 = new THREE.MeshStandardMaterial({
      color: new THREE.Color(g.veil || "#E6F3FF"),
      emissive: new THREE.Color(g.veilEm || "#1C2A3A"),
      roughness: 0.45,
      metalness: 0.0,
      side: THREE.DoubleSide,
      flatShading: true,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });

    const veilMat2 = new THREE.MeshStandardMaterial({
      color: new THREE.Color(g.veilDark || "#162230"),
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });

    const prng = createSeededRandom((gemConfig.seed || 1337) + 99);
    const rng = (min, max) => min + prng() * (max - min);

    for (let i = 0; i < (vSpec.n || 10); i++) {
      const len = rng(vSpec.len[0], vSpec.len[1]);
      const width = rng(0.04, 0.14);
      const geo = new THREE.PlaneGeometry(len, width, 4, 1);

      const pos = geo.attributes.position;
      for (let p = 0; p < pos.count; p++) {
        pos.setZ(p, rng(-0.02, 0.02));
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, i % 3 === 2 ? veilMat2 : veilMat1);
      mesh.position.set(
        rng(-vSpec.x, vSpec.x),
        rng(vSpec.y[0], vSpec.y[1]),
        rng(-vSpec.z, vSpec.z)
      );
      mesh.rotation.set(
        rng(-0.6, 0.6),
        rng(-0.6, 0.6),
        rng(-1.2, 1.2)
      );

      this.veilGroup.add(mesh);
    }

    this.veilGroup.renderOrder = 3;
    this.stoneGroup.add(this.veilGroup);
  }

  buildCleavageShards(parentGeometry) {
    const shardGroup = new THREE.Group();
    shardGroup.name = "CleavageShards";

    const pos = parentGeometry.attributes.position;
    const count = Math.floor(pos.count / 3);
    const prng = createSeededRandom(42);

    for (let f = 0; f < count; f += Math.max(1, Math.floor(count / 28))) {
      const v1 = new THREE.Vector3().fromBufferAttribute(pos, f * 3);
      const v2 = new THREE.Vector3().fromBufferAttribute(pos, f * 3 + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(pos, f * 3 + 2);

      const center = v1.clone().add(v2).add(v3).divideScalar(3);
      const normal = v2.clone().sub(v1).cross(v3.clone().sub(v1)).normalize();
      const apex = center.clone().sub(normal.clone().multiplyScalar(0.25 + prng() * 0.3));

      const shardPts = [v1, v2, v3, apex];
      const shardGeo = new ConvexGeometry(shardPts);
      const shardMesh = new THREE.Mesh(shardGeo, this.gemMaterial);

      shardMesh.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        origRot: new THREE.Vector3(0, 0, 0),
        center: center.clone(),
        dir: normal.clone(),
        spinSpeed: new THREE.Vector3(
          (prng() - 0.5) * 0.08,
          (prng() - 0.5) * 0.08,
          (prng() - 0.5) * 0.08
        ),
        isChipped: false
      };

      shardMesh.visible = false;
      this.shards.push(shardMesh);
      shardGroup.add(shardMesh);
    }

    this.stoneGroup.add(shardGroup);
  }

  chipPiece() {
    if (this.isExploded) return { glassLeft: 0 };

    const unchipped = this.shards.filter(s => !s.userData.isChipped);
    if (unchipped.length === 0) {
      return this.shatterAll();
    }

    const idx = Math.floor(Math.random() * unchipped.length);
    const shard = unchipped[idx];
    shard.userData.isChipped = true;
    shard.visible = true;
    this.chippedShards.push(shard);

    // Impulsive blast
    const blast = shard.userData.dir.clone().multiplyScalar(1.2 + Math.random() * 1.5);
    blast.y += 0.4 + Math.random() * 0.5;

    gsap.to(shard.position, {
      x: shard.userData.origPos.x + blast.x,
      y: -2.0 + (Math.random() - 0.5) * 0.5,
      z: shard.userData.origPos.z + blast.z,
      duration: 1.1,
      ease: 'power3.out'
    });

    gsap.to(shard.rotation, {
      x: shard.rotation.x + (Math.random() - 0.5) * Math.PI * 4,
      y: shard.rotation.y + (Math.random() - 0.5) * Math.PI * 4,
      z: shard.rotation.z + (Math.random() - 0.5) * Math.PI * 4,
      duration: 1.2,
      ease: 'power2.out'
    });

    // Shake remaining stone
    gsap.to(this.stoneGroup.position, {
      x: (Math.random() - 0.5) * 0.08,
      y: (Math.random() - 0.5) * 0.08,
      duration: 0.06,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.stoneGroup.position.set(0, 0, 0);
      }
    });

    this.glassLeft = Math.max(0, Math.round(((this.shards.length - this.chippedShards.length) / this.shards.length) * 100));
    return { glassLeft: this.glassLeft, shard };
  }

  shatterAll() {
    this.isExploded = true;
    this.glassLeft = 0;

    gsap.to(this.mainMesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.35, ease: 'power3.in' });
    if (this.wallMesh) {
      gsap.to(this.wallMesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.35, ease: 'power3.in' });
    }
    if (this.creasesMesh) {
      gsap.to(this.creasesMesh.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.6, ease: 'power2.out' });
      gsap.to(this.wireframeMaterial, { opacity: 0.02, duration: 0.4 });
    }
    if (this.veilGroup) {
      gsap.to(this.veilGroup.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.5 });
    }

    this.shards.forEach((shard, idx) => {
      shard.visible = true;
      shard.userData.isChipped = true;

      const blast = shard.userData.dir.clone().multiplyScalar(2.2 + Math.random() * 2.8);
      const floorY = -1.9 + (Math.random() - 0.5) * 0.8;

      gsap.to(shard.position, {
        x: shard.userData.origPos.x + blast.x,
        y: floorY,
        z: shard.userData.origPos.z + blast.z,
        duration: 1.2 + (idx / this.shards.length) * 0.4,
        ease: 'power3.out'
      });

      gsap.to(shard.rotation, {
        x: shard.rotation.x + Math.PI * (2 + Math.random() * 5),
        y: shard.rotation.y + Math.PI * (2 + Math.random() * 5),
        z: shard.rotation.z + Math.PI * (2 + Math.random() * 5),
        duration: 1.4,
        ease: 'power2.out'
      });
    });

    return { glassLeft: 0 };
  }

  putItBack() {
    this.isExploded = false;
    this.glassLeft = 100;
    this.chippedShards = [];

    this.mainMesh.visible = true;
    gsap.to(this.mainMesh.scale, {
      x: 1.0, y: 1.0, z: 1.0,
      duration: 0.9,
      ease: 'elastic.out(1.1, 0.65)'
    });

    if (this.wallMesh) {
      this.wallMesh.visible = true;
      gsap.to(this.wallMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.8, ease: 'power2.out' });
    }

    if (this.creasesMesh) {
      gsap.to(this.creasesMesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.7, ease: 'power2.inOut' });
      gsap.to(this.wireframeMaterial, { opacity: 0.18, duration: 0.6 });
    }

    if (this.veilGroup) {
      gsap.to(this.veilGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.7 });
    }

    this.shards.forEach((shard) => {
      shard.userData.isChipped = false;
      gsap.to(shard.position, {
        x: shard.userData.origPos.x,
        y: shard.userData.origPos.y,
        z: shard.userData.origPos.z,
        duration: 0.85 + Math.random() * 0.25,
        ease: 'power3.inOut',
        onComplete: () => {
          if (!this.isExploded && !shard.userData.isChipped) {
            shard.visible = false;
          }
        }
      });

      gsap.to(shard.rotation, {
        x: shard.userData.origRot.x,
        y: shard.userData.origRot.y,
        z: shard.userData.origRot.z,
        duration: 0.85,
        ease: 'power2.inOut'
      });
    });

    return { glassLeft: 100 };
  }

  applyGemTheme(theme) {
    if (!theme || !theme.glass) return;
    const g = theme.glass;
    const sym = theme.symbol || {};

    if (g.color) this.gemMaterial.color.set(g.color);
    if (g.atten) this.gemMaterial.attenuationColor.set(g.atten);
    if (g.attDist !== undefined) this.gemMaterial.attenuationDistance = Math.max(0.6, g.attDist);
    if (g.thickness !== undefined) this.gemMaterial.thickness = Math.max(0.05, g.thickness);
    if (g.roughness !== undefined) this.gemMaterial.roughness = g.roughness;

    if (g.wall && this.wallMaterial) this.wallMaterial.color.set(g.wall);
    if (g.wallEm && this.wallMaterial) this.wallMaterial.emissive.set(g.wallEm);

    if (this.uniforms) {
      if (sym.core) {
        this.uniforms.uCore.value.set(...sym.core);
      }
      if (sym.edge) {
        this.uniforms.uEdge.value.set(...sym.edge);
      }
    }

    this.gemMaterial.needsUpdate = true;
    if (this.wallMaterial) this.wallMaterial.needsUpdate = true;
  }

  setVisualMode(mode) {
    switch (mode) {
      case 'glacial':
        this.gemMaterial.roughness = 0.08;
        this.gemMaterial.transmission = 1.0;
        this.gemMaterial.dispersion = 0.12;
        this.gemMaterial.wireframe = false;
        if (this.wallMesh) this.wallMesh.visible = true;
        this.creasesMesh.visible = true;
        if (this.veilGroup) this.veilGroup.visible = true;
        break;
      case 'prismatic':
        this.gemMaterial.roughness = 0.02;
        this.gemMaterial.transmission = 1.0;
        this.gemMaterial.dispersion = 0.32;
        this.gemMaterial.wireframe = false;
        if (this.wallMesh) this.wallMesh.visible = true;
        this.creasesMesh.visible = true;
        if (this.veilGroup) this.veilGroup.visible = true;
        break;
      case 'wireframe':
        this.gemMaterial.wireframe = true;
        this.gemMaterial.transmission = 0.0;
        if (this.wallMesh) this.wallMesh.visible = false;
        this.creasesMesh.visible = true;
        if (this.veilGroup) this.veilGroup.visible = false;
        break;
      case 'xray':
        this.gemMaterial.roughness = 0.25;
        this.gemMaterial.transmission = 0.85;
        this.gemMaterial.dispersion = 0.0;
        this.gemMaterial.wireframe = false;
        if (this.wallMesh) this.wallMesh.visible = false;
        this.creasesMesh.visible = true;
        if (this.veilGroup) this.veilGroup.visible = true;
        break;
    }
  }

  update(time) {
    if (this.isExploded) {
      this.shards.forEach((shard) => {
        if (shard.visible) {
          shard.rotation.x += shard.userData.spinSpeed.x;
          shard.rotation.y += shard.userData.spinSpeed.y;
          shard.rotation.z += shard.userData.spinSpeed.z;
        }
      });
    }
  }
}
