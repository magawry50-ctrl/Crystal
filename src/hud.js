import * as THREE from 'three';

/**
 * Manages the real-time 3D-to-2D projected HUD annotations and dynamic SVG leader lines
 * that track the rotating ice crystal, exactly matching igloo.inc.
 */
export class HUDController {
  constructor(crystal, camera, container) {
    this.crystal = crystal;
    this.camera = camera;
    this.container = container;

    this.svg = document.getElementById('hud-svg');
    this.cardTop = document.getElementById('card-top');
    this.cardRight = document.getElementById('card-right');
    this.cardBottom = document.getElementById('card-bottom');

    this.tempValueEl = document.getElementById('temp-val');
    this.tempDeltaEl = document.getElementById('temp-delta');

    this.lineTop = document.getElementById('line-top');
    this.lineRight = document.getElementById('line-right');
    this.lineBottom = document.getElementById('line-bottom');

    this.dotTop = document.getElementById('dot-top');
    this.dotRight = document.getElementById('dot-right');
    this.dotBottom = document.getElementById('dot-bottom');

    this.tempBase = 35.68;
    this.tempTimer = 0;

    this.worldPos = new THREE.Vector3();
    this.screenPos = new THREE.Vector3();
  }

  projectPoint(localPoint) {
    if (!localPoint || !this.crystal || !this.crystal.group || !this.camera) return { x: 0, y: 0, isVisible: false };
    this.worldPos.copy(localPoint);
    this.crystal.group.localToWorld(this.worldPos);

    this.screenPos.copy(this.worldPos);
    this.screenPos.project(this.camera);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const x = (this.screenPos.x * 0.5 + 0.5) * width;
    const y = (-this.screenPos.y * 0.5 + 0.5) * height;
    const isVisible = Number.isFinite(x) && Number.isFinite(y) && this.screenPos.z < 1.0 && this.screenPos.z > -1.0;

    return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0, isVisible, z: this.screenPos.z };
  }

  update(delta) {
    // 1. Dynamic telemetry readout (fluctuating decimals like cryogenic sensor)
    this.tempTimer += delta;
    if (this.tempTimer > 0.08) {
      this.tempTimer = 0;
      const noise = (Math.random() - 0.49) * 0.12;
      const currentTemp = (this.tempBase + noise).toFixed(2);
      const deltaTemp = (Math.sin(Date.now() * 0.0018) * 1.5 + 2.8).toFixed(2);
      if (this.tempValueEl) this.tempValueEl.textContent = currentTemp;
      if (this.tempDeltaEl) this.tempDeltaEl.textContent = `+${deltaTemp}`;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    let pTop, pRight, pBottom;
    if (this.crystal && this.crystal.anchors && this.crystal.anchors.top) {
      pTop = this.projectPoint(this.crystal.anchors.top);
      pRight = this.projectPoint(this.crystal.anchors.right);
      pBottom = this.projectPoint(this.crystal.anchors.bottom);
    } else {
      pTop = { x: width * 0.5 - 60, y: height * 0.32, isVisible: true };
      pRight = { x: width * 0.5 + 130, y: height * 0.48, isVisible: true };
      pBottom = { x: width * 0.5 + 70, y: height * 0.68, isVisible: true };
    }

    // 2. Project Top Anchor (PORTFOLIO_CO_01 / PUDGY PENGUINS)
    if (pTop.isVisible) {
      this.dotTop.setAttribute('cx', pTop.x);
      this.dotTop.setAttribute('cy', pTop.y);
      this.dotTop.style.opacity = '0.9';

      // Diagonal up-left, then horizontal line left
      const elbowX = pTop.x - 65;
      const elbowY = Math.max(85, pTop.y - 65);
      const lineEndX = elbowX - 130;

      this.lineTop.setAttribute('d', `M ${pTop.x} ${pTop.y} L ${elbowX} ${elbowY} L ${lineEndX} ${elbowY}`);
      this.lineTop.style.opacity = '0.85';

      // Text sits directly above the horizontal line
      this.cardTop.style.transform = `translate(${lineEndX}px, ${elbowY - 34}px)`;
      this.cardTop.style.opacity = '1';
    } else {
      this.cardTop.style.opacity = '0.2';
      this.lineTop.style.opacity = '0.1';
    }

    // 3. Project Right Anchor (TEMP 33.90 / +01.06)
    if (!pRight && this.crystal?.anchors?.right) pRight = this.projectPoint(this.crystal.anchors.right);
    if (pRight && pRight.isVisible) {
      this.dotRight.setAttribute('cx', pRight.x);
      this.dotRight.setAttribute('cy', pRight.y);
      this.dotRight.style.opacity = '0.9';

      const elbowX = pRight.x + 40;
      const elbowY = pRight.y - 12;
      const lineEndX = elbowX + 110;

      this.lineRight.setAttribute('d', `M ${pRight.x} ${pRight.y} L ${elbowX} ${elbowY} L ${lineEndX} ${elbowY}`);
      this.lineRight.style.opacity = '0.85';

      this.cardRight.style.transform = `translate(${elbowX + 10}px, ${elbowY - 30}px)`;
      this.cardRight.style.opacity = '1';
    } else {
      this.cardRight.style.opacity = '0.2';
      this.lineRight.style.opacity = '0.1';
    }

    // 4. Project Bottom Anchor (D 01.02.2020 / CLICK TO EXPLORE)
    if (!pBottom && this.crystal?.anchors?.bottom) pBottom = this.projectPoint(this.crystal.anchors.bottom);
    if (pBottom && pBottom.isVisible) {
      this.dotBottom.setAttribute('cx', pBottom.x);
      this.dotBottom.setAttribute('cy', pBottom.y);
      this.dotBottom.style.opacity = '0.9';

      const elbowX = pBottom.x + 25;
      const elbowY = pBottom.y + 10;
      const lineEndX = elbowX + 140;

      this.lineBottom.setAttribute('d', `M ${pBottom.x} ${pBottom.y} L ${elbowX} ${elbowY} L ${lineEndX} ${elbowY}`);
      this.lineBottom.style.opacity = '0.85';

      this.cardBottom.style.transform = `translate(${elbowX + 5}px, ${elbowY - 26}px)`;
      this.cardBottom.style.opacity = '1';
    } else {
      this.cardBottom.style.opacity = '0.2';
      this.lineBottom.style.opacity = '0.1';
    }
  }
}
