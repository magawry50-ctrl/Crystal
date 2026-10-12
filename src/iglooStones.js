import * as THREE from 'three';
import gsap from 'gsap';
import { IglooPlexus } from './iglooPlexus.js';
import { loadDracoGeometry, loadKTX2Texture } from './iglooLoader.js';
import { MouseFrost } from './iglooFrost.js';
import { createSymbol } from './symbols.js';

export const IGLOO_STONES_DATA = [
  {
    index: 0,
    id: 'pudgy',
    gemId: 'pudgy',
    obj: 'cube3',
    innerobject: 'pudgy',
    title: 'PORTFOLIO_CO_01 Pudgy Penguins',
    shortName: 'PUDGY PENGUINS',
    code: 'PORTFOLIO_CO_01',
    date: '01/02/2020',
    tempNum: 33.90,
    tempDelta: '+01.06',
    scale: 1.0,
    innerScale: 1.1,
    rand: 0.42857,
    defaultSymbol: 'authentic',
    stoneColor: '#E0E8EF',
    depthColor: '#B4D2EA',
    wallColor: '#1A3048',
    veilColor: '#EBF4FC',
    glowColor: '#5CA9E6',
    symbolColor: '#83A1C5',
    lightColor: '#D6E8FA',
    summary: `Pudgy Penguins, a creative venture founded in 2021, quickly gained attention for its unique IP and engaging community. In 2022, the company was acquired by Igloo Inc., a strategic move aimed at expanding its reach and capabilities. The acquisition by Igloo Inc. was part of a broader vision to transform and reposition Pudgy Penguins as a next-generation entertainment company and the face of Web3 worldwide.

We believe in a future where intellectual property, digital collectibles, and communities are born and thrive on the blockchain. Since our acquisition, Pudgy Penguins has leveraged its onchain origins to create a new model for consumer brands, shifting from a brand-and-consumer approach to a brand-and-participant model. Our business strategy focuses on expanding a vast range of content mediums, products, and experiences, driving people onchain into the new era of the internet. By harnessing the power of our vibrant community and the rich and whimsical universe of Pudgy Penguins, we're revolutionizing the way IP is created and experienced.`,
    discover: [
      { name: 'X', url: 'https://x.com/pudgypenguins' },
      { name: 'IG', url: 'https://instagram.com/pudgypenguins' },
      { name: 'LI', url: 'https://www.linkedin.com/company/pudgy-penguins' },
      { name: 'TK', url: 'https://www.tiktok.com/@pudgypenguins' }
    ],
    website: 'https://www.pudgypenguins.com'
  },
  {
    index: 1,
    id: 'overpass',
    gemId: 'overpass',
    obj: 'cube1',
    innerobject: 'overpass_logo',
    title: 'PORTFOLIO_CO_02 Overpass',
    shortName: 'OVERPASS',
    code: 'PORTFOLIO_CO_02',
    date: '06/01/2023',
    tempNum: 30.20,
    tempDelta: '-01.00',
    scale: 0.95,
    innerScale: 1.2,
    rand: 0.81234,
    defaultSymbol: 'authentic',
    stoneColor: '#EDF4FA',
    depthColor: '#8DBFE2',
    wallColor: '#14293D',
    veilColor: '#DBECF8',
    glowColor: '#38A3E8',
    symbolColor: '#4A90E2',
    lightColor: '#C2E0F9',
    summary: `OverpassIP was established as a solution to a significant licensing challenge faced by Pudgy Penguins, marking its inception with a crucial breakthrough in NFT licensing. The company empowers NFT holders by allowing them to submit their digital assets for potential licensing opportunities, offering a platform where collections can significantly amplify their growth and engagement. By participating in OverpassIP, collections open up a realm of possibilities for their brands, bringing their holders along for the ride through expansive licensing avenues.

Moreover, brands seeking to enhance their initiatives can access a curated pool of NFTs on OverpassIP, selecting the intellectual property that best aligns with their strategic goals. This innovative approach not only facilitates dynamic partnerships between NFT creators and brands but also pioneers new frontiers in the utilization of digital assets within the broader market.`,
    discover: [
      { name: 'X', url: 'https://twitter.com/OverpassIP' }
    ],
    website: 'https://www.overpassip.com'
  }
];

// Fallback procedural faceted glacial iceberg
function createFacetedBoulderGeometry() {
  const geo = new THREE.IcosahedronGeometry(1.5, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const noise = Math.sin(v.x * 3.5) * Math.cos(v.y * 3.2) * Math.sin(v.z * 3.8);
    v.multiplyScalar(1.0 + noise * 0.16);
    pos.setXYZ(i, v.x, v.y * 1.15, v.z);
  }
  geo.computeVertexNormals();
  const nonIndexed = geo.toNonIndexed();
  if (nonIndexed.attributes.uv) {
    nonIndexed.setAttribute('uv1', nonIndexed.attributes.uv.clone());
  }
  return nonIndexed;
}

// Fallback procedural faceted glacial tablet
function createFacetedTabletGeometry() {
  const geo = new THREE.BoxGeometry(2.1, 2.7, 1.2, 8, 12, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const gouge = Math.sin(v.y * 4.0) * Math.cos(v.x * 3.0) * 0.12;
    v.x += gouge;
    v.z += (Math.random() - 0.5) * 0.08;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const nonIndexed = geo.toNonIndexed();
  if (nonIndexed.attributes.uv) {
    nonIndexed.setAttribute('uv1', nonIndexed.attributes.uv.clone());
  }
  return nonIndexed;
}

// Fallback stylized penguin specimen
function createStylizedPenguin() {
  const group = new THREE.Group();
  
  const bodyGeo = new THREE.SphereGeometry(0.7, 24, 24);
  bodyGeo.scale(0.85, 1.1, 0.8);
  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x181a24 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const bellyGeo = new THREE.SphereGeometry(0.55, 20, 20);
  bellyGeo.scale(0.75, 0.95, 0.3);
  const bellyMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0, -0.05, 0.46);
  group.add(belly);

  const beakGeo = new THREE.ConeGeometry(0.12, 0.35, 12);
  beakGeo.rotateX(Math.PI / 2);
  const beakMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.22, 0.65);
  group.add(beak);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeMat);
  eyeL.position.set(-0.22, 0.35, 0.58);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeMat);
  eyeR.position.set(0.22, 0.35, 0.58);
  group.add(eyeL, eyeR);

  return group;
}

// Fallback stylized overpass IP monogram logo
function createStylizedOverpassLogo() {
  const group = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(0.7, 0.16, 16, 48);
  const oMat = new THREE.MeshBasicMaterial({ color: 0x228be6 });
  const ring = new THREE.Mesh(ringGeo, oMat);
  group.add(ring);

  const barGeo = new THREE.BoxGeometry(0.3, 1.25, 0.25);
  const pMat = new THREE.MeshBasicMaterial({ color: 0x69db7c });
  const bar = new THREE.Mesh(barGeo, pMat);
  bar.position.set(0.3, -0.2, 0.05);
  group.add(bar);

  return group;
}

export class IglooStone {
  constructor(data, renderer, envMap) {
    this.data = data;
    this.renderer = renderer;
    this.envMap = envMap;

    this.group = new THREE.Group();
    this.group.name = `igloo_stone_${data.id}`;

    this.additionalRotationAmount = 1.0;
    this.hoverTilt = new THREE.Vector2(0, 0);
    this.targetHoverTilt = new THREE.Vector2(0, 0);
    this.revolveRotation = new THREE.Vector2(0, 0);
    this.isHovered = false;
    this.isOpen = false;
    this.enableSurfaceHover = true;

    // 0. Interactive Frost Melting Fluid Simulation (JL from igloo.inc)
    this.mouseFrost = new MouseFrost(this.renderer);

    // Authentic Glacial Ice Physical Material matching class WL from igloo.inc with 25% crystalline translucency
    this.iceMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(data.stoneColor || (data.id === 'overpass' ? '#edf4fa' : '#e0e8ef')),
      roughness: 0.65,
      metalness: 0.0,
      ior: 1.18,
      reflectivity: 0.3,
      transmission: 0.0, // Eliminates secondary screen-space ghost reflections on angled facets
      thickness: 0.0,
      envMap: this.envMap,
      envMapIntensity: 0.91,
      transparent: true,
      opacity: 0.90, // Calibrated 25% subtle translucency via true 3D alpha blending
      depthWrite: true,
      side: THREE.FrontSide,
      clearcoat: 0.0,
      clearcoatRoughness: 0.0
    });

    // Custom Shader Injection for Surface Frost Melting, Crystallite Triangles & Glowing Wave Rims
    this.iceMaterial.uniforms = {
      tMouseFrost: { value: this.mouseFrost.finalRT.texture },
      uColorFrost: { value: new THREE.Color('#83a1c5') },
      tTriangles: { value: null },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    this.iceMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.tMouseFrost = this.iceMaterial.uniforms.tMouseFrost;
      shader.uniforms.uColorFrost = this.iceMaterial.uniforms.uColorFrost;
      shader.uniforms.tTriangles = this.iceMaterial.uniforms.tTriangles;
      shader.uniforms.uResolution = this.iceMaterial.uniforms.uResolution;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_pars_vertex>',
        `attribute vec2 uv1;
         varying vec2 vUv1;
         #include <uv_pars_vertex>`
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_vertex>',
        `vUv1 = uv1;
         #include <uv_vertex>`
      );

      shader.fragmentShader = `
        varying vec2 vUv1;
        uniform sampler2D tMouseFrost;
        uniform sampler2D tTriangles;
        uniform vec3 uColorFrost;
        uniform vec2 uResolution;
        ${shader.fragmentShader}
      `;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        `vec2 mousefrostdata = texture2D(tMouseFrost, vUv1).rg;
         float mousefrost = mousefrostdata.r;
         float mousefrostrim = mousefrostdata.g;
         #include <clipping_planes_fragment>`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `float roughnessFactor = roughness;
         roughnessFactor *= (1.0 - mousefrost);
         #ifdef USE_ROUGHNESSMAP
           vec4 texelRoughness = texture2D(roughnessMap, vRoughnessMapUv);
           roughnessFactor *= texelRoughness.g;
         #endif`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <normal_fragment_maps>',
        `#ifdef USE_NORMALMAP_OBJECTSPACE
           normal = texture2D(normalMap, vNormalMapUv).xyz * 2.0 - 1.0;
           normal = normalize(normalMatrix * normal);
         #elif defined(USE_NORMALMAP_TANGENTSPACE)
           vec3 mapN = texture2D(normalMap, vNormalMapUv).xyz * 2.0 - 1.0;
           mapN.xy *= normalScale;
           mapN.xy *= (1.0 - mousefrost);
           normal = normalize(tbn * mapN);
         #elif defined(USE_BUMPMAP)
           normal = perturbNormalArb(-vViewPosition, normal, dHdxy_fwd(), faceDirection);
         #endif`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
        `totalEmissiveRadiance += mousefrostrim * uColorFrost;
         float triangles = texture2D(tTriangles, vUv1 * (9.0 * min(1.0, uResolution.y / 1300.0))).r;
         totalEmissiveRadiance += triangles * mousefrostrim * 10.0;
         totalEmissiveRadiance += triangles * pow(mousefrost, 2.0);
         vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
         outgoingLight = clamp(outgoingLight, vec3(0.0), vec3(1.0));`
      );
    };

    // 1. Crystal Mesh
    const initialGeo = data.obj === 'cube3' ? createFacetedBoulderGeometry() : createFacetedTabletGeometry();
    this.crystalMesh = new THREE.Mesh(initialGeo, this.iceMaterial);
    this.crystalMesh.castShadow = false;
    this.crystalMesh.receiveShadow = false;
    this.crystalMesh.renderOrder = 5;
    this.group.add(this.crystalMesh);

    // 2. Inner Specimen Mesh (Symbol: Bolt, Flame, Snowflake, Crescent, Drop, Heart, Clover, Leaf, 404, Your word)
    this.specimenContainer = new THREE.Group();
    this.specimenContainer.name = 'specimen_container';
    this.specimenContainer.scale.setScalar(data.innerScale || 1.1);
    this.group.add(this.specimenContainer);
    this.symbolKind = data.defaultSymbol || (data.id === 'overpass' ? 'bolt' : 'snowflake');
    this.symbolColor = data.symbolColor || (data.id === 'overpass' ? '#4A90E2' : '#83A1C5');
    this.lightColor = data.lightColor || (data.id === 'overpass' ? '#C2E0F9' : '#D6E8FA');
    this.symbolSize = 0.64;
    this.symbolTurn = -55;
    this.symbolSpin = 0.70;
    this.glow = 0.75;
    this.bobAmount = 0.90;
    this.extraTilt = THREE.MathUtils.degToRad(-8);
    this.customText = '';
    this.enableSymbol = true;

    this.specimenContainer.scale.setScalar((data.innerScale || 1.1) * this.symbolSize);
    this.setSymbol(this.symbolKind);

    // 3. Localized Glacial Mist Billboard Plane (mesh2 from igloo.inc)
    const mistGeo = new THREE.PlaneGeometry(2.5, 3.5);
    this.mistMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tWind: { value: null },
        uTime: { value: 0 },
        uProgress: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tWind;
        uniform float uTime;
        uniform float uProgress;

        void main() {
          vec2 uv = vUv;
          vec2 st = uv;
          st.y *= 0.75;
          st *= 1.5;
          float t = uTime * 0.075;
          vec2 offset = vec2(0.0, t);
          float noise = texture2D(tWind, st + offset).r;
          noise *= texture2D(tWind, st * 0.5 + offset).r;
          float grad = 1.0 - clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
          noise *= grad;
          noise *= length(vUv - 0.5);
          noise = noise * 6.5;

          float scrollDist = clamp(1.0 - abs(uProgress) * 20.0, 0.0, 1.0);
          noise *= scrollDist;

          vec3 color = vec3(1.0);
          float alpha = clamp(noise * 0.7, 0.0, 0.85);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.mistMesh = new THREE.Mesh(mistGeo, this.mistMaterial);
    this.mistMesh.position.set(0, -0.35, -0.2);
    this.mistMesh.renderOrder = 2;
    this.group.add(this.mistMesh);

    // 4. Interactive Wireframe Plexus Constellation
    this.plexus = new IglooPlexus(this.group, {
      count: data.obj === 'cube3' ? 24 : 18,
      spread: 2.1,
      wireColor: 0x6e7888
    });

    // 5. Asynchronously Load High-Precision Draco Geometries & KTX2 Textures
    this.loadAssets();
  }

  async loadAssets() {
    // Load wind noise for localized mist plane
    try {
      const windTex = await loadKTX2Texture('/assets/wind_noise.ktx2', this.renderer);
      if (windTex) {
        windTex.wrapS = THREE.RepeatWrapping;
        windTex.wrapT = THREE.RepeatWrapping;
        this.mistMaterial.uniforms.tWind.value = windTex;
        this.mistMaterial.needsUpdate = true;
      }
    } catch (e) {}

    // Load authentic ice stone Draco geometry
    try {
      const crystalGeo = await loadDracoGeometry(`/assets/cubes/${this.data.obj}.drc`);
      if (crystalGeo) {
        if (crystalGeo.attributes.uv && !crystalGeo.attributes.uv1) {
          crystalGeo.setAttribute('uv1', crystalGeo.attributes.uv.clone());
        }
        crystalGeo.computeBoundingBox();
        crystalGeo.computeBoundingSphere();
        this.crystalMesh.geometry.dispose();
        this.crystalMesh.geometry = crystalGeo;
      }
    } catch (e) {
      console.warn(`[IglooStone] Using procedural fallback for ${this.data.obj}:`, e);
    }

    // Load authentic Draco specimen (Pudgy Penguin / Overpass Logo) if authentic or penguin
    if (this.symbolKind === 'authentic' || this.symbolKind === 'penguin' || this.symbolKind === 'logo') {
      await this.loadAuthenticSpecimen();
    }

    // Normal map
    try {
      const normalTex = await loadKTX2Texture(`/assets/cubes/${this.data.obj}_normal.ktx2`, this.renderer);
      if (normalTex) {
        this.iceMaterial.normalMap = normalTex;
        this.iceMaterial.normalScale.set(1, 1);
        this.iceMaterial.needsUpdate = true;
      }
    } catch (e) {}

    // Roughness map
    try {
      const roughTex = await loadKTX2Texture(`/assets/cubes/${this.data.obj}_roughness.ktx2`, this.renderer);
      if (roughTex) {
        this.iceMaterial.roughnessMap = roughTex;
        this.iceMaterial.needsUpdate = true;
      }
    } catch (e) {}

    // Triangles tiling texture for sparkling facet sparks along touch wave rim
    try {
      let triTex = await loadKTX2Texture('/assets/igloo/triangles_tiling.ktx2', this.renderer);
      if (!triTex) {
        triTex = await loadKTX2Texture('/assets/cubes/triangles_tiling.ktx2', this.renderer);
      }
      if (triTex) {
        triTex.wrapS = THREE.RepeatWrapping;
        triTex.wrapT = THREE.RepeatWrapping;
        this.iceMaterial.uniforms.tTriangles.value = triTex;
        this.iceMaterial.needsUpdate = true;
      }
    } catch (e) {}
  }

  setHover(hovered) {
    this.isHovered = hovered;
    this.plexus.setHover(hovered);
    if (hovered && !this.isOpen) {
      gsap.to(this.iceMaterial, {
        roughness: 0.45,
        duration: 0.35,
        ease: 'power2.out'
      });
    } else if (!this.isOpen) {
      gsap.to(this.iceMaterial, {
        roughness: 0.65,
        duration: 0.45,
        ease: 'power2.out'
      });
    }
  }

  setHoverCoords(normX, normY) {
    if (Number.isFinite(normX) && Number.isFinite(normY)) {
      this.targetHoverTilt.set(
        THREE.MathUtils.clamp(normY * 0.35, -0.4, 0.4),
        THREE.MathUtils.clamp(normX * 0.45, -0.5, 0.5)
      );
    }
  }

  open() {
    this.isOpen = true;
    this.plexus.flare();

    // Ice dissolves / clears into pure crystal clarity
    gsap.to(this.iceMaterial, {
      opacity: 0.15,
      roughness: 0.08,
      duration: 1.25,
      ease: 'power3.inOut'
    });

    gsap.to(this, {
      additionalRotationAmount: 0.05,
      duration: 1.0,
      ease: 'power2.out'
    });
  }

  close() {
    this.isOpen = false;

    // Re-freeze crystal
    gsap.to(this.iceMaterial, {
      opacity: 0.90,
      roughness: 0.65,
      duration: 1.45,
      ease: 'power3.out'
    });

    gsap.to(this, {
      additionalRotationAmount: 1.0,
      duration: 1.45,
      ease: 'power2.out'
    });
  }

  async loadAuthenticSpecimen() {
    while (this.specimenContainer.children.length > 0) {
      const child = this.specimenContainer.children[0];
      this.specimenContainer.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    try {
      const geoPath = this.data.innerobject === 'pudgy' ? '/assets/pudgy.drc' : '/assets/overpass_logo.drc';
      const texPath = this.data.innerobject === 'pudgy' ? '/assets/cubes/pudgy_color.ktx2' : '/assets/cubes/overpass_logo_color.ktx2';

      const specimenGeo = await loadDracoGeometry(geoPath);
      if (specimenGeo) {
        const specimenMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        });

        try {
          const tex = await loadKTX2Texture(texPath, this.renderer);
          if (tex) {
            tex.colorSpace = THREE.SRGBColorSpace;
            specimenMat.map = tex;
            specimenMat.needsUpdate = true;
          }
        } catch (texErr) {
          console.warn('[IglooStone] KTX2 texture load error:', texErr);
        }

        const specimenMesh = new THREE.Mesh(specimenGeo, specimenMat);
        specimenMesh.renderOrder = 10;
        this.specimenContainer.scale.setScalar((this.data.innerScale || 1.1) * (this.symbolSize || 1.0));
        this.specimenContainer.add(specimenMesh);
        this.specimenContainer.visible = true;
      }
    } catch (e) {
      console.warn(`[IglooStone] Failed to load authentic specimen ${this.data.innerobject}:`, e);
    }
  }

  setSymbol(symbolName) {
    this.symbolKind = symbolName;

    while (this.specimenContainer.children.length > 0) {
      const child = this.specimenContainer.children[0];
      this.specimenContainer.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    if (!this.symbolKind || this.symbolKind === 'none' || this.symbolKind === 'off' || this.symbolKind === 'empty' || this.enableSymbol === false) {
      this.specimenContainer.visible = false;
      return;
    }

    if (this.symbolKind === 'authentic' || this.symbolKind === 'penguin' || this.symbolKind === 'logo') {
      this.loadAuthenticSpecimen();
      return;
    }

    this.specimenContainer.visible = true;
    this.specimenContainer.scale.setScalar((this.data.innerScale || 1.1) * (this.symbolSize || 1.0));
    const symbolGroup = createSymbol(this.symbolKind, {
      symbolColor: this.symbolColor,
      lightColor: this.lightColor,
      glow: this.glow,
      text: this.customText || 'WORD'
    });

    this.specimenContainer.add(symbolGroup);
  }

  setValues(values) {
    if (!values) return;
    let needsSymbolRebuild = false;

    if (values.symbolVisible !== undefined) {
      const nextVisible = Boolean(values.symbolVisible) && values.symbol !== 'none';
      if (this.enableSymbol !== nextVisible) {
        this.enableSymbol = nextVisible;
        needsSymbolRebuild = true;
      }
    }

    if (values.symbol !== undefined && values.symbol !== this.symbolKind) {
      this.symbolKind = values.symbol;
      if (this.symbolKind === 'none' || this.symbolKind === 'off') {
        this.enableSymbol = false;
      } else if (values.symbolVisible !== false) {
        this.enableSymbol = true;
      }
      needsSymbolRebuild = true;
    }
    if (values.text !== undefined && values.text !== this.customText) {
      this.customText = values.text;
      if (this.symbolKind === 'text') needsSymbolRebuild = true;
    }
    if (values.symbolColor !== undefined && values.symbolColor !== this.symbolColor) {
      this.symbolColor = values.symbolColor;
      needsSymbolRebuild = true;
    }
    if (values.lightColor !== undefined && values.lightColor !== this.lightColor) {
      this.lightColor = values.lightColor;
      needsSymbolRebuild = true;
    }
    if (values.glow !== undefined && Number(values.glow) !== this.glow) {
      this.glow = Number(values.glow);
      needsSymbolRebuild = true;
      if (this.iceMaterial.uniforms?.uColorFrost) {
        const baseCol = new THREE.Color(values.glowColor || (this.data.id === 'overpass' ? '#38A3E8' : '#83a1c5'));
        this.iceMaterial.uniforms.uColorFrost.value.copy(baseCol).multiplyScalar(this.glow);
      }
      this.specimenContainer.traverse(c => {
        if (c.isMesh && c.material && c.material.color) {
          if (this.symbolKind === 'authentic' || this.symbolKind === 'penguin' || this.symbolKind === 'logo') {
            c.material.color.setHex(0xffffff);
          } else {
            c.material.color.setScalar(this.glow);
          }
        }
      });
    }
    if (values.symbolSize !== undefined) {
      this.symbolSize = Number(values.symbolSize);
      this.specimenContainer.scale.setScalar((this.data.innerScale || 1.1) * this.symbolSize);
    }
    if (values.symbolTurn !== undefined) {
      this.symbolTurn = Number(values.symbolTurn);
      this.specimenContainer.rotation.z = THREE.MathUtils.degToRad(this.symbolTurn || 0);
    }
    if (values.symbolSpin !== undefined) {
      this.symbolSpin = Number(values.symbolSpin);
    }

    if (needsSymbolRebuild) {
      this.setSymbol(this.symbolKind);
    }

    // Deactivated material customization for Pudgy & Overpass: preserve authentic original look
    this.iceMaterial.color.set(this.data.stoneColor || (this.data.id === 'overpass' ? '#edf4fa' : '#e0e8ef'));
    if (this.iceMaterial.uniforms?.uColorFrost) {
      this.iceMaterial.uniforms.uColorFrost.value.set('#83a1c5');
    }
    this.iceMaterial.roughness = 0.65;
    this.iceMaterial.ior = 1.18;
    this.iceMaterial.reflectivity = 0.3;
    this.iceMaterial.clearcoat = 0.0;
    this.iceMaterial.transmission = 0.0;
    this.iceMaterial.thickness = 0.0;
    if (values.surfaceHover !== undefined) {
      this.enableSurfaceHover = Boolean(values.surfaceHover);
      if (!this.enableSurfaceHover) {
        this.isHovered = false;
      }
    }
    this.iceMaterial.needsUpdate = true;
  }

  update(time, scrollProgress = 0, isRevolve = false) {
    // 1. Advance fluid advection simulation & sync to shader
    if (this.mouseFrost) {
      this.mouseFrost.update(time);
      if (this.iceMaterial.uniforms?.tMouseFrost) {
        this.iceMaterial.uniforms.tMouseFrost.value = this.mouseFrost.finalRT.texture;
      }
      if (this.iceMaterial.uniforms?.uResolution) {
        this.iceMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    }

    this.hoverTilt.lerp(this.isHovered ? this.targetHoverTilt : new THREE.Vector2(0, 0), 0.08);

    const rand = this.data.rand;
    const l = 1;
    const c = -1;
    const h = 1;
    const d = 0.15;
    const u = 0.2;
    const f = 0.18;
    const p = 11 * l * (1 - d);
    const A = 14 * c * (1 - u);
    const m = 6 * h * (1 - f);

    const g = 0.3;
    const x = 0.12 * this.additionalRotationAmount;
    const v = Math.sin(time * g + rand * 12.423) * x * Math.sign(rand - 0.5);
    const y = Math.sin(time * g + rand * 42.987) * x * Math.sign(rand - 0.5);
    const S = Math.sin(time * g + rand * 2.53) * x * Math.sign(rand - 0.5);

    // Multi-frequency idle floating levitation
    const bob = Math.sin(time * 0.9 + rand * 3.14) * 0.08 + Math.sin(time * 1.7) * 0.03;

    if (isRevolve) {
      this.group.rotation.y = this.revolveRotation.y + this.hoverTilt.y;
      this.group.rotation.x = this.revolveRotation.x + this.hoverTilt.x;
      this.group.rotation.z = Math.sin(time * 0.4) * 0.04 + (this.extraTilt || 0);
    } else {
      this.group.rotation.y = p * scrollProgress + v + this.hoverTilt.y;
      this.group.rotation.x = A * scrollProgress + y + this.hoverTilt.x;
      this.group.rotation.z = m * scrollProgress + S + (this.extraTilt || 0);
    }

    const bobScaled = bob * (this.bobAmount !== undefined ? this.bobAmount : 0.90);
    this.crystalMesh.position.y = bobScaled;
    this.specimenContainer.position.y = bobScaled;
    const spinRate = Number(this.symbolSpin) || 0;
    this.specimenContainer.rotation.y = (spinRate > 0 ? time * 0.85 * spinRate : 0);
    this.specimenContainer.rotation.z = THREE.MathUtils.degToRad(this.symbolTurn || 0);

    if (this.mistMaterial) {
      this.mistMaterial.uniforms.uTime.value = time;
      this.mistMaterial.uniforms.uProgress.value = scrollProgress;
    }
    if (this.mistMesh) {
      this.mistMesh.position.y = bob - 0.2;
    }

    this.plexus.update(time);
  }

  get anchors() {
    if (this.data.obj === 'cube3') {
      return {
        top: new THREE.Vector3(-0.55, 1.15, 0.45),
        right: new THREE.Vector3(1.2, 0.3, 0.2),
        bottom: new THREE.Vector3(0.7, -1.15, 0.35)
      };
    } else {
      return {
        top: new THREE.Vector3(-0.55, 1.3, 0.45),
        right: new THREE.Vector3(1.15, 0.3, 0.2),
        bottom: new THREE.Vector3(0.65, -1.25, 0.35)
      };
    }
  }
}
