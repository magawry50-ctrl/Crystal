import * as THREE from 'three';
import gsap from 'gsap';
import { IglooBackground } from './iglooBackground.js';
import { IglooStone, IGLOO_STONES_DATA } from './iglooStones.js';
import { initLoaders, loadEXREnvMap, loadDracoGeometry, loadKTX2Texture } from './iglooLoader.js';
import { IglooPostProcessing } from './iglooPostProcessing.js';

export class IglooExperience {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('canvas-container');
    this.sound = options.sound;
    this.onStoneChange = options.onStoneChange || (() => {});
    this.onOverscrollDown = options.onOverscrollDown || null;
    this.onOpenModal = options.onOpenModal || (() => {});
    this.onCloseModal = options.onCloseModal || (() => {});
    this.externalCarousel = options.externalCarousel ?? true;

    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.zoom = 0.96;
    this.cameraInitialZ = 5.5;
    this.cameraZoomOffset = 0;
    this.camera.position.set(0, 0, this.cameraInitialZ);
    this.camera.updateProjectionMatrix();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.77;
    this.container.appendChild(this.renderer.domElement);

    // 2. Lighting - Natural polar daylight ambient (no blinding directional blowouts)
    this.setupLighting();

    // 3. Authentic Igloo Stones
    this.stoneSpacing = 6.5;
    this.stones = [];
    this.currentStoneIndex = 0;
    this.createStones();

    // 4. Loaders, Environment Map & Background Depth Elements
    initLoaders(this.renderer);
    this.setupEnvMap();
    this.createBlurryText();
    this.createBackgroundShapes();

    // 5. Atmospheric Background (k3 polar haze from igloo.inc)
    this.bg = new IglooBackground(this.scene, this.renderer);

    // 6. Post-Processing Pipeline (Tetrahedral 3D LUT)
    this.postProcessing = new IglooPostProcessing(this.renderer, this.width, this.height);

    // 7. Dynamic Motion, Scroll & Carousel Physics
    this.motionDynamic = 'float'; // 'revolve' (الدوران المستمر) | 'float' (وضع الطفو الساكن)
    this.scrollEnabled = true; // boolean (تشغيل / إيقاف السكرول الرأسي)
    this.surfaceHoverEnabled = true; // boolean (أثر الهافر وتموج الجليد السطحي)
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.scrollVelocity = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.revolveVelocity = new THREE.Vector2(0, 0);
    this.lastScrollTime = 0;
    this.isUserScrolling = false;
    this.lastUserScrollTime = 0;

    // 8. Raycasting & Hover Tracking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.isOpen = false;

    // 9. Event Listeners
    this.bindEvents();

    // 10. Audio Cache
    this.audioClips = {
      click: new Audio('/assets/click-project.ogg'),
      enter: new Audio('/assets/enter-project.ogg'),
      leave: new Audio('/assets/leave-project.ogg'),
      shard: new Audio('/assets/shard.ogg')
    };

    // Start Animation Loop
    this.clock = new THREE.Clock();
    this.active = true;
    this.animate();
  }

  setupLighting() {
    // Exact soft polar daylight illumination matching igloo.inc
    this.ambientLight = new THREE.AmbientLight(0xdbe6f5, 0.75);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.65);
    this.sunLight.position.set(2, 6, 4);
    this.scene.add(this.sunLight);

    this.backRim = new THREE.DirectionalLight(0x9cc2ea, 0.45);
    this.backRim.position.set(-2, 3, -4);
    this.scene.add(this.backRim);
  }

  async setupEnvMap() {
    try {
      const envMap = await loadEXREnvMap('/assets/cubes_env.exr', this.renderer);
      if (envMap) {
        this.scene.environment = envMap;
        if (this.stones && this.stones.length) {
          this.stones.forEach(stone => {
            if (stone.iceMaterial) {
              stone.iceMaterial.envMap = envMap;
              stone.iceMaterial.needsUpdate = true;
            }
          });
        }
      }
    } catch (e) {
      console.warn('[IglooExperience] Using procedural envmap fallback:', e);
    }
  }

  async createBlurryText() {
    try {
      const geo = await loadDracoGeometry('/assets/blurrytext.drc');
      const tex = await loadKTX2Texture('/assets/cubes/blurrytext_atlas.ktx2', this.renderer);
      if (geo && tex) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uAspect: { value: this.width / this.height },
            tMap: { value: tex }
          },
          vertexShader: `
            varying vec2 vUv;
            varying float vAlpha;
            uniform float uProgress;
            uniform float uTime;
            uniform float uAspect;

            void main() {
              vec3 localpos = position;
              localpos.x /= uAspect;
              localpos *= 2.4;
              localpos.y += uProgress * 2.2;
              localpos.y = mod(localpos.y + 4.0, 8.0) - 4.0;
              localpos.z = -3.2;

              vUv = uv;
              vAlpha = smoothstep(0.1, 0.6, sin(position.x * 2.5 + uTime * 0.1) * 0.5 + 0.5);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(localpos, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            varying float vAlpha;
            uniform sampler2D tMap;

            void main() {
              float alpha = texture2D(tMap, vUv).r * vAlpha * 0.35;
              gl_FragColor = vec4(vec3(1.0), alpha);
            }
          `,
          depthTest: false,
          depthWrite: false,
          transparent: true
        });
        this.blurryTextMesh = new THREE.Mesh(geo, mat);
        this.blurryTextMesh.renderOrder = -40;
        this.scene.add(this.blurryTextMesh);
      }
    } catch (e) {}
  }

  async createBackgroundShapes() {
    try {
      const geo = await loadDracoGeometry('/assets/background_shapes.drc');
      const tex = await loadKTX2Texture('/assets/shapes_blurred.ktx2', this.renderer);
      if (geo && tex) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            tMap: { value: tex },
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uAspect: { value: this.width / this.height }
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vPos;
            uniform float uProgress;
            uniform float uTime;
            uniform float uAspect;

            void main() {
              vUv = uv;
              vPos = position;
              vec3 customPos = position;
              customPos.x /= uAspect;
              customPos *= 1.8;
              customPos.y += uProgress * 2.0;
              customPos.z = -3.5;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(customPos, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            varying vec3 vPos;
            uniform sampler2D tMap;
            uniform float uTime;

            void main() {
              float alpha = texture2D(tMap, vUv).r;
              float idle = sin((vPos.x + vPos.y) * 4.0 + uTime * 2.0) * 0.5 + 0.5;
              alpha *= (idle * 0.7 + 0.3) * 0.25;
              gl_FragColor = vec4(vec3(1.0), alpha);
            }
          `,
          transparent: true,
          depthTest: false,
          depthWrite: false
        });
        this.bgShapesMesh = new THREE.Mesh(geo, mat);
        this.bgShapesMesh.renderOrder = -35;
        this.scene.add(this.bgShapesMesh);
      }
    } catch (e) {}
  }

  createStones() {
    IGLOO_STONES_DATA.forEach((data) => {
      const stone = new IglooStone(data, this.renderer, this.scene.environment);
      stone.group.position.y = -data.index * this.stoneSpacing;
      this.scene.add(stone.group);
      this.stones.push(stone);
    });
  }

  playAudio(key) {
    try {
      const sound = this.audioClips[key];
      if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.65;
        sound.play().catch(() => {});
      }
    } catch (e) {}
  }

  bindEvents() {
    this.onResize = () => {
      this.width = this.container.clientWidth || window.innerWidth;
      this.height = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.bg.resize(this.width, this.height);
      if (this.postProcessing) {
        this.postProcessing.resize(this.width, this.height);
      }
    };
    window.addEventListener('resize', this.onResize);

    // Scroll wheel for smooth vertical translation between stones (or zoom when scroll is disabled)
    this.onWheel = (e) => {
      if (this.isOpen || this.externalCarousel) return;
      // Do NOT intercept wheel when scrolling inside parameters drawer or UI overlays
      if (e.target && e.target.closest && e.target.closest('.parameters-drawer, #parameters-drawer, .mf-scroll-body, .modal, .site-header, .gem-selector-bar')) {
        return;
      }
      if (!this.scrollEnabled) {
        const zoomDelta = e.deltaY * 0.003;
        this.cameraZoomOffset = THREE.MathUtils.clamp(this.cameraZoomOffset + zoomDelta, -2.5, 3.5);
        return;
      }
      this.isUserScrolling = true;
      this.lastUserScrollTime = performance.now();
      this.stones.forEach(s => { s.group.visible = true; });

      const delta = e.deltaY * 0.0035;
      const maxScroll = (this.stones.length - 1) * this.stoneSpacing;
      this.targetScrollY = THREE.MathUtils.clamp(
        this.targetScrollY + delta,
        0,
        maxScroll
      );
      this.lastScrollTime = performance.now();
    };
    window.addEventListener('wheel', this.onWheel, { passive: true });

    // Pointer move / raycast - Real-time responsive stroke tracking & Revolve drag
    this.onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : window.innerWidth;
      const h = rect.height > 0 ? rect.height : window.innerHeight;
      const rawX = ((e.clientX - rect.left) / (w || 1)) * 2 - 1;
      const rawY = -((e.clientY - rect.top) / (h || 1)) * 2 + 1;
      const x = Number.isFinite(rawX) ? THREE.MathUtils.clamp(rawX, -1, 1) : 0;
      const y = Number.isFinite(rawY) ? THREE.MathUtils.clamp(rawY, -1, 1) : 0;
      this.mouse.set(x, y);

      const activeStone = this.stones[this.currentStoneIndex];

      // Handle 360 Revolve drag rotation
      if (this.isDragging && this.motionDynamic === 'revolve' && activeStone?.revolveRotation) {
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;

        activeStone.revolveRotation.y += dx * 0.012;
        activeStone.revolveRotation.x = THREE.MathUtils.clamp(
          activeStone.revolveRotation.x + dy * 0.009,
          -Math.PI * 0.45,
          Math.PI * 0.45
        );
        this.revolveVelocity.set(dx * 0.012, dy * 0.009);
      }

      if (activeStone) {
        activeStone.setHoverCoords(x, y);

        // If hover ripple is disabled, clear hover state and bypass fluid simulation
        if (!this.surfaceHoverEnabled) {
          if (activeStone.isHovered) {
            activeStone.setHover(false);
            document.body.style.cursor = 'default';
          }
          return;
        }

        // Immediate responsive raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(activeStone.crystalMesh, true);
        const isHit = intersects.length > 0;

        if (isHit !== activeStone.isHovered) {
          activeStone.setHover(isHit);
          document.body.style.cursor = isHit ? 'pointer' : 'default';
          if (isHit) {
            activeStone.mouseFrost?.onPointerHover(); // Trigger once on entry
            this.playAudio('shard');
          }
        }

        if (isHit && intersects[0]?.uv && activeStone.mouseFrost) {
          activeStone.mouseFrost.onPointerMove(intersects[0].uv);
          if (this.audioClips.shard && activeStone.mouseFrost.soundVelocity > 0.04) {
            this.audioClips.shard.volume = Math.min(0.85, activeStone.mouseFrost.soundVelocity * 0.75);
            if (this.audioClips.shard.paused) {
              this.audioClips.shard.play().catch(() => {});
            }
          }
        }
      }
    };
    window.addEventListener('pointermove', this.onPointerMove);

    // Pointer down / drag
    this.onPointerDown = (e) => {
      if (e.target.closest('button, nav, header, aside, footer, .parameters-drawer, .mf-drawer')) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    };
    window.addEventListener('pointerdown', this.onPointerDown);

    this.onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const dragDist = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY);

      if (dragDist < 8) {
        this.handlePointerClick();
      }
    };
    window.addEventListener('pointerup', this.onPointerUp);
  }

  handlePointerClick() {
    const curStone = this.stones[this.currentStoneIndex];
    if (!curStone) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(curStone.crystalMesh, true);

    if (intersects.length > 0) {
      if (!this.isOpen) {
        this.openCurrentStone();
      }
    }
  }

  setStone(index, immediate = true) {
    if (index < 0 || index >= this.stones.length) return;
    this.currentStoneIndex = index;
    gsap.killTweensOf(this);
    this.isProgrammaticScroll = false;
    this.isUserScrolling = false;
    this.lastScrollTime = performance.now();

    const targetY = index * this.stoneSpacing;
    this.targetScrollY = targetY;

    if (immediate) {
      this.scrollY = targetY;
      this.camera.position.y = -this.scrollY + 0.35;
      this.camera.lookAt(0, -this.scrollY + 0.1, 0);
    }

    this.stones.forEach((s, idx) => {
      s.group.visible = (idx === index);
      if (s.revolveRotation) {
        s.revolveRotation.set(0, 0);
      }
    });
  }

  scrollToStone(index) {
    this.setStone(index, true);
  }

  openCurrentStone() {
    if (this.isOpen) return;
    this.isOpen = true;
    const curStone = this.stones[this.currentStoneIndex];
    if (!curStone) return;

    this.playAudio('click');
    setTimeout(() => this.playAudio('enter'), 350);

    gsap.to(this, {
      cameraZoomOffset: -3.5,
      duration: 1.25,
      ease: 'power3.inOut'
    });

    curStone.open();
    this.onOpenModal(curStone.data);
  }

  closeCurrentStone() {
    if (!this.isOpen) return;
    this.isOpen = false;
    const curStone = this.stones[this.currentStoneIndex];
    if (!curStone) return;

    this.playAudio('leave');

    gsap.to(this, {
      cameraZoomOffset: 0,
      duration: 1.45,
      ease: 'power3.out'
    });

    curStone.close();
    this.onCloseModal();
  }

  applyTheme(theme) {
    this.theme = theme;
    if (this.bg) {
      this.bg.applyTheme(theme);
    }
    const targetExposure = this.currentExposure !== undefined ? this.currentExposure : 0.77;
    this.renderer.toneMappingExposure = targetExposure;
    if (theme === 'light') {
      if (this.ambientLight) this.ambientLight.intensity = 0.45;
      if (this.sunLight) this.sunLight.intensity = 0.40;
      if (this.backRim) this.backRim.intensity = 0.22;
    } else {
      if (this.ambientLight) this.ambientLight.intensity = 0.75;
      if (this.sunLight) this.sunLight.intensity = 0.65;
      if (this.backRim) this.backRim.intensity = 0.45;
    }
  }

  updatePhysics(delta, time) {
    if (this.motionDynamic === 'revolve') {
      const curStone = this.stones[this.currentStoneIndex];
      if (curStone && curStone.revolveRotation) {
        if (!this.isDragging) {
          // Gentle auto-spin when idle + inertia damping
          curStone.revolveRotation.y += (this.revolveVelocity.x + 0.28 * delta);
          curStone.revolveRotation.x += this.revolveVelocity.y;
          this.revolveVelocity.multiplyScalar(0.92);
        }
      }
    } else {
      // Floating mode: zero continuous spin, restore facing forward
      const curStone = this.stones[this.currentStoneIndex];
      if (curStone && curStone.revolveRotation) {
        curStone.revolveRotation.y = THREE.MathUtils.lerp(curStone.revolveRotation.y, 0, 0.08);
        curStone.revolveRotation.x = THREE.MathUtils.lerp(curStone.revolveRotation.x, 0, 0.08);
        this.revolveVelocity.set(0, 0);
      }
    }

    if (this.scrollEnabled && this.isUserScrolling) {
      // 1. Smooth scroll inertia during active user scrolling
      this.scrollY = THREE.MathUtils.lerp(this.scrollY, this.targetScrollY, 0.12);

      // Snap to nearest stone when user stops scrolling
      if (!this.isOpen && performance.now() - this.lastUserScrollTime > 350) {
        this.isUserScrolling = false;
        const nearestIdx = Math.round(this.scrollY / this.stoneSpacing);
        const clampedIdx = THREE.MathUtils.clamp(nearestIdx, 0, this.stones.length - 1);
        this.targetScrollY = clampedIdx * this.stoneSpacing;
        if (clampedIdx !== this.currentStoneIndex) {
          this.currentStoneIndex = clampedIdx;
          this.stones.forEach((s, idx) => {
            s.group.visible = (idx === clampedIdx);
          });
          this.onStoneChange(this.stones[clampedIdx].data);
        }
      }
    } else {
      // Locked or resting on active stone: firmly clamp scrollY to current stone without triggering changes
      const targetPos = this.currentStoneIndex * this.stoneSpacing;
      this.targetScrollY = targetPos;
      this.scrollY = THREE.MathUtils.lerp(this.scrollY, targetPos, 0.2);
    }

    // 2. Camera position Y follows vertical scroll with centered framing
    this.camera.position.y = -this.scrollY;
    this.camera.position.z = this.cameraInitialZ + this.cameraZoomOffset;
    this.camera.lookAt(0, -this.scrollY, 0);

    // 3. Background drift
    const scrollProgress = this.scrollY / this.stoneSpacing;
    this.bg.update(time, scrollProgress);
    if (this.blurryTextMesh) {
      this.blurryTextMesh.material.uniforms.uProgress.value = scrollProgress;
      this.blurryTextMesh.material.uniforms.uTime.value = time;
    }
    if (this.bgShapesMesh) {
      this.bgShapesMesh.material.uniforms.uProgress.value = scrollProgress;
      this.bgShapesMesh.material.uniforms.uTime.value = time;
    }

    // 4. Update stones idle floating, rotation physics, and advection simulations
    this.stones.forEach((stone, idx) => {
      const stoneProgress = scrollProgress - idx;
      stone.update(time, stoneProgress, this.motionDynamic === 'revolve');
    });
  }

  setMotionDynamic(dyn) {
    this.motionDynamic = (dyn === 'revolve') ? 'revolve' : 'float';
  }

  setScrollEnabled(enabled) {
    this.scrollEnabled = Boolean(enabled);
    if (!this.scrollEnabled) {
      this.targetScrollY = this.currentStoneIndex * this.stoneSpacing;
      this.scrollY = this.targetScrollY;
    }
  }

  setMotionMode(mode) {
    if (mode === 'revolve' || mode === 'float') {
      this.setMotionDynamic(mode);
    } else if (mode === 'scroll') {
      this.setScrollEnabled(true);
      this.setMotionDynamic('float');
    }
  }

  setSurfaceHover(enabled) {
    this.surfaceHoverEnabled = Boolean(enabled);
    this.stones.forEach(stone => {
      if (stone && typeof stone.setValues === 'function') {
        stone.setValues({ surfaceHover: this.surfaceHoverEnabled });
      }
    });
  }

  setStoneValues(values) {
    if (!values) return;
    if (values.zoom !== undefined) {
      this.camera.zoom = Number(values.zoom);
      this.camera.updateProjectionMatrix();
    }
    if (values.exposure !== undefined) {
      this.currentExposure = Number(values.exposure);
      this.renderer.toneMappingExposure = this.currentExposure;
    }
    if (values.spin !== undefined) {
      this.spinSpeed = Number(values.spin);
    }
    this.stones.forEach(stone => {
      if (stone && typeof stone.setValues === 'function') {
        stone.setValues(values);
      }
    });
  }

  animate() {
    if (!this.active) return;
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.updatePhysics(delta, time);
    if (this.postProcessing) {
      this.postProcessing.render(this.scene, this.camera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    this.active = false;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    if (this.postProcessing) {
      this.postProcessing.dispose();
    }
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
