import * as THREE from 'three';
import gsap from 'gsap';

export class IglooPlexus {
  constructor(parentGroup, radius = 1.6) {
    this.parentGroup = parentGroup;
    this.radius = radius;
    this.group = new THREE.Group();
    this.group.name = 'igloo_plexus';
    this.parentGroup.add(this.group);

    this.totalPoints = 18;
    this.maxConnectionsPerPoint = 3;
    this.maxDistance = 2.4;
    this.treadmillHeight = 3.2;

    this.hoverAmount = 0;
    this.pointsData = [];

    // Initialize 18 dynamic points
    for (let i = 0; i < this.totalPoints; i++) {
      const angle = (i / this.totalPoints) * Math.PI * 2 + Math.random() * 0.5;
      const r = this.radius * (0.85 + Math.random() * 0.4);
      const y = (Math.random() - 0.5) * this.treadmillHeight;
      this.pointsData.push({
        angle,
        radius: r,
        baseY: y,
        speedY: 0.15 + Math.random() * 0.2,
        rand: Math.random(),
        pos: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r)
      });
    }

    // Points particle mesh
    const ptGeo = new THREE.BufferGeometry();
    const ptPositions = new Float32Array(this.totalPoints * 3);
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3));

    this.pointMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uHover: { value: 0.0 },
        uSize: { value: 11.0 }
      },
      vertexShader: `
        uniform float uSize;
        uniform float uHover;
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float dist = length(mvPosition.xyz);
          gl_PointSize = (uSize * (1.0 + uHover * 0.4)) / max(0.5, dist);
          vAlpha = mix(0.35, 0.85, uHover);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float ring = smoothstep(0.48, 0.15, dist);
          float core = smoothstep(0.2, 0.0, dist);
          float alpha = (ring * 0.4 + core * 0.6) * vAlpha;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.pointsMesh = new THREE.Points(ptGeo, this.pointMaterial);
    this.pointsMesh.renderOrder = 20;
    this.group.add(this.pointsMesh);

    // Dynamic line segments mesh (max points * max connections)
    const maxLines = this.totalPoints * this.maxConnectionsPerPoint;
    const lineGeo = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(maxLines * 2 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));

    this.lineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uHover: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uHover;
        varying vec3 vPos;
        void main() {
          float alpha = mix(0.12, 0.45, uHover);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.linesMesh = new THREE.LineSegments(lineGeo, this.lineMaterial);
    this.linesMesh.renderOrder = 19;
    this.group.add(this.linesMesh);
  }

  setHover(hovered) {
    gsap.to(this, {
      hoverAmount: hovered ? 1 : 0,
      duration: 0.45,
      ease: 'power2.out',
      onUpdate: () => {
        this.pointMaterial.uniforms.uHover.value = this.hoverAmount;
        this.lineMaterial.uniforms.uHover.value = this.hoverAmount;
      }
    });
  }

  flare() {
    gsap.fromTo(this, { hoverAmount: 1.8 }, {
      hoverAmount: 0.3,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        this.pointMaterial.uniforms.uHover.value = this.hoverAmount;
        this.lineMaterial.uniforms.uHover.value = this.hoverAmount;
      }
    });
  }

  update(time) {
    const ptAttr = this.pointsMesh.geometry.attributes.position;
    const halfH = this.treadmillHeight * 0.5;

    // Update point positions
    for (let i = 0; i < this.totalPoints; i++) {
      const p = this.pointsData[i];
      const curAngle = p.angle + (p.rand - 0.5) * 0.35 * time;
      const wobbleX = 0.08 * Math.sin(time * 0.6 + p.rand * 6.28);
      const wobbleZ = 0.08 * Math.cos(time * 0.6 + p.rand * 4.12);

      // Treadmill vertical motion
      let curY = p.baseY + p.speedY * (time * 0.3);
      curY = ((curY + halfH) % this.treadmillHeight) - halfH;

      p.pos.set(
        Math.cos(curAngle) * p.radius + wobbleX,
        curY,
        Math.sin(curAngle) * p.radius + wobbleZ
      );

      ptAttr.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
    }
    ptAttr.needsUpdate = true;

    // Build proximity line connections
    let lineIdx = 0;
    const maxLineVerts = this.linePositions.length;

    for (let i = 0; i < this.totalPoints; i++) {
      let connectionsForP = 0;
      const p1 = this.pointsData[i];

      for (let j = i + 1; j < this.totalPoints; j++) {
        if (connectionsForP >= this.maxConnectionsPerPoint) break;
        const p2 = this.pointsData[j];
        const dist = p1.pos.distanceTo(p2.pos);

        if (dist < this.maxDistance && lineIdx + 6 <= maxLineVerts) {
          this.linePositions[lineIdx++] = p1.pos.x;
          this.linePositions[lineIdx++] = p1.pos.y;
          this.linePositions[lineIdx++] = p1.pos.z;

          this.linePositions[lineIdx++] = p2.pos.x;
          this.linePositions[lineIdx++] = p2.pos.y;
          this.linePositions[lineIdx++] = p2.pos.z;

          connectionsForP++;
        }
      }
    }

    // Clear unused line positions
    for (let k = lineIdx; k < maxLineVerts; k++) {
      this.linePositions[k] = 0;
    }

    this.linesMesh.geometry.setDrawRange(0, lineIdx / 3);
    this.linesMesh.geometry.attributes.position.needsUpdate = true;
  }
}
