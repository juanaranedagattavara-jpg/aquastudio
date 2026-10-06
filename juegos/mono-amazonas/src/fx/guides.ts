import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Mesh, MeshBasicMaterial, Points, PointsMaterial, RingGeometry,
  Scene, Sprite, SpriteMaterial, SRGBColorSpace, Texture, Vector3,
} from 'three';
import { NUT_GRAVITY } from '../config';

const ARC_POINTS = 36;

/**
 * Guías visuales de jugabilidad:
 *  - arco punteado de la trayectoria al apuntar una castaña y anillo donde caerá;
 *  - marcador sobre el cazador fijado como objetivo;
 *  - marcador en la liana que el mono agarrará si mantiene el botón.
 */
export class Guides {
  private arc: Points;
  private arcPos: Float32Array;
  private landing: Mesh;
  private lock: Sprite;
  private vineMark: Sprite;
  private tmp = new Vector3();
  private v = new Vector3();

  constructor(scene: Scene, glow: Texture) {
    this.arcPos = new Float32Array(ARC_POINTS * 3);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(this.arcPos, 3));
    this.arc = new Points(g, new PointsMaterial({
      map: glow, color: '#fff1b0', size: 0.22, transparent: true, opacity: 0.95, depthWrite: false,
      blending: AdditiveBlending,
    }));
    this.arc.frustumCulled = false;
    this.arc.visible = false;
    this.arc.renderOrder = 5;

    const rg = new RingGeometry(0.35, 0.5, 28);
    rg.rotateX(-Math.PI / 2);
    this.landing = new Mesh(rg, new MeshBasicMaterial({
      color: '#ffd23a', transparent: true, opacity: 0.85, depthWrite: false, blending: AdditiveBlending,
    }));
    this.landing.visible = false;

    this.lock = new Sprite(new SpriteMaterial({
      map: lockTexture(), color: '#ff5a3a', transparent: true, depthTest: false, depthWrite: false,
    }));
    this.lock.scale.setScalar(1.2);
    this.lock.renderOrder = 11;
    this.lock.visible = false;

    this.vineMark = new Sprite(new SpriteMaterial({
      map: glow, color: '#b6ff7a', transparent: true, depthWrite: false, blending: AdditiveBlending,
    }));
    this.vineMark.scale.setScalar(0.9);
    this.vineMark.renderOrder = 6;
    this.vineMark.visible = false;

    scene.add(this.arc, this.landing, this.lock, this.vineMark);
  }

  /** Dibuja la trayectoria de una castaña lanzada desde `from` con velocidad `vel`. */
  showArc(from: Vector3, vel: Vector3, groundAt: (x: number, z: number) => number): void {
    const p = this.tmp.copy(from);
    const v = this.v.copy(vel);
    const dt = 0.045;
    let n = 0;
    for (; n < ARC_POINTS; n++) {
      this.arcPos[n * 3] = p.x;
      this.arcPos[n * 3 + 1] = p.y;
      this.arcPos[n * 3 + 2] = p.z;
      v.y -= NUT_GRAVITY * dt;
      p.addScaledVector(v, dt);
      if (p.y < groundAt(p.x, p.z)) {
        n++;
        break;
      }
    }
    this.arc.geometry.setDrawRange(0, n);
    this.arc.geometry.attributes.position.needsUpdate = true;
    this.arc.visible = true;
    this.landing.position.set(p.x, groundAt(p.x, p.z) + 0.06, p.z);
    this.landing.visible = true;
  }

  hideArc(): void {
    this.arc.visible = false;
    this.landing.visible = false;
  }

  /** Marcador del cazador fijado (null lo oculta). */
  setLock(target: Vector3 | null, time: number): void {
    if (!target) {
      this.lock.visible = false;
      return;
    }
    this.lock.visible = true;
    this.lock.position.copy(target);
    const s = 1.05 + Math.sin(time * 9) * 0.08;
    this.lock.scale.setScalar(s);
    this.lock.material.rotation = time * 1.5;
  }

  /** Marcador del punto de la liana que se va a agarrar (null lo oculta). */
  setVineTarget(p: Vector3 | null, time: number): void {
    if (!p) {
      this.vineMark.visible = false;
      return;
    }
    this.vineMark.visible = true;
    this.vineMark.position.copy(p);
    this.vineMark.scale.setScalar(0.8 + Math.sin(time * 10) * 0.12);
  }
}

/** Retícula de fijado: cuatro esquinas, dibujada en canvas. */
function lockTexture(): Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.strokeStyle = '#ffffff';
  g.lineWidth = 10;
  g.lineCap = 'round';
  const a = 20, b = 108, l = 30;
  for (const [x, y, dx, dy] of [[a, a, 1, 1], [b, a, -1, 1], [a, b, 1, -1], [b, b, -1, -1]] as const) {
    g.beginPath();
    g.moveTo(x, y + dy * l);
    g.lineTo(x, y);
    g.lineTo(x + dx * l, y);
    g.stroke();
  }
  g.beginPath();
  g.arc(64, 64, 6, 0, Math.PI * 2);
  g.fillStyle = '#ffffff';
  g.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
