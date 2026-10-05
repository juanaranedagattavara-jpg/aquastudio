import {
  CapsuleGeometry, CircleGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D,
  Quaternion, SphereGeometry, Vector3,
} from 'three';
import { clamp, damp, dampAngle, TAU, wrapAngle } from '../core/math';
import { PartBuilder } from '../core/parts';

export type MonkeyAnimState = 'ground' | 'air' | 'swing' | 'climb' | 'swim' | 'down';
export type MonkeyAttack = 'none' | 'punchL' | 'punchR' | 'spin' | 'kick' | 'pound' | 'throw';

export interface MonkeyPose {
  state: MonkeyAnimState;
  speed: number;
  vel: Vector3;
  yaw: number;
  ropeDir: Vector3;
  climbPhase: number;
  climbSpread: number;
  ropeClimbing: number; // -1 baja, 0 quieto, 1 sube
  pumping: number; // -1..1 impulso a lo largo de la velocidad
  attack: MonkeyAttack;
  attackT: number;
  hurt: number;
  dodge: number;
  dodgeSide: number;
  idleTime: number;
  time: number;
}

const HIP_H = 0.48;
/** Escala visual del mono (un capuchino algo exagerado para que se lea bien en pantalla). */
export const MODEL_SCALE = 1.15;
const UP = new Vector3(0, 1, 0);

interface Joint {
  o: Object3D;
  x: number;
  y: number;
  z: number;
}

/** Mono capuchino procedural: esqueleto jerárquico animado por código. */
export class MonkeyModel {
  readonly root = new Group();
  readonly shadow: Mesh;
  private body = new Group();
  private chest = new Group();
  private head = new Group();
  private shoulderL = new Group();
  private shoulderR = new Group();
  private elbowL = new Group();
  private elbowR = new Group();
  private hipL = new Group();
  private hipR = new Group();
  private kneeL = new Group();
  private kneeR = new Group();
  private tail: Group[] = [];
  private joints: Joint[] = [];
  private J = new Map<Object3D, Joint>();
  private materials: MeshStandardMaterial[] = [];
  private bodyY = HIP_H;
  private q = new Quaternion();
  private qTarget = new Quaternion();
  private m = new Matrix4();
  private fwd = new Vector3();
  private right = new Vector3();
  private up = new Vector3();
  private gallop = 0;
  private flip = 0;
  readonly handR = new Group();
  readonly visualOffset = new Vector3();

  constructor() {
    const fur = '#7a5232';
    const dark = '#34231a';
    const cream = '#e8cba0';
    const face = '#dcb48c';
    const white = '#f6f2e8';
    const black = '#120c08';
    const vc = new MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0 });
    this.materials.push(vc);

    const B = new PartBuilder();
    const sph = new SphereGeometry(1, 14, 10);
    const add = (parent: Object3D, c: string, sx: number, sy: number, sz: number, x: number, y: number, z: number): void =>
      B.addTRS(parent, sph, c, [x, y, z], [sx, sy, sz]);
    const limb = (parent: Object3D, c: string, r: number, len: number): void =>
      B.addTRS(parent, new CapsuleGeometry(r, len, 4, 8), c, [0, -(len / 2 + r * 0.5), 0]);

    this.root.scale.setScalar(MODEL_SCALE);
    this.root.add(this.body);
    this.body.position.y = HIP_H;
    add(this.body, fur, 0.16, 0.15, 0.14, 0, 0.04, 0);
    add(this.body, fur, 0.165, 0.25, 0.15, 0, 0.22, 0);
    add(this.body, cream, 0.11, 0.17, 0.08, 0, 0.21, 0.085);

    this.body.add(this.chest);
    this.chest.position.set(0, 0.38, 0);
    add(this.chest, cream, 0.12, 0.08, 0.1, 0, -0.02, 0.05);

    this.chest.add(this.head);
    this.head.position.set(0, 0.1, 0.03);
    add(this.head, fur, 0.135, 0.13, 0.13, 0, 0.09, 0);
    add(this.head, dark, 0.125, 0.07, 0.12, 0, 0.165, -0.01);
    add(this.head, face, 0.1, 0.1, 0.06, 0, 0.075, 0.095);
    add(this.head, cream, 0.065, 0.045, 0.05, 0, 0.03, 0.13);
    add(this.head, black, 0.012, 0.008, 0.008, -0.012, 0.045, 0.176);
    add(this.head, black, 0.012, 0.008, 0.008, 0.012, 0.045, 0.176);
    for (const s of [-1, 1]) {
      add(this.head, white, 0.027, 0.027, 0.016, s * 0.043, 0.1, 0.14);
      add(this.head, black, 0.015, 0.016, 0.01, s * 0.043, 0.1, 0.154);
      add(this.head, cream, 0.035, 0.045, 0.02, s * 0.128, 0.09, 0);
    }
    add(this.head, dark, 0.085, 0.015, 0.03, 0, 0.128, 0.128);

    const arm = (sh: Group, el: Group, side: number, hand?: Group): void => {
      this.chest.add(sh);
      sh.position.set(side * 0.155, 0, 0);
      limb(sh, fur, 0.045, 0.2);
      sh.add(el);
      el.position.y = -0.27;
      limb(el, fur, 0.04, 0.19);
      const h = hand ?? new Group();
      el.add(h);
      h.position.y = -0.27;
      add(h, dark, 0.05, 0.055, 0.035, 0, -0.01, 0);
    };
    arm(this.shoulderL, this.elbowL, 1);
    arm(this.shoulderR, this.elbowR, -1, this.handR);

    const leg = (hip: Group, knee: Group, side: number): void => {
      this.body.add(hip);
      hip.position.set(side * 0.085, 0, 0);
      limb(hip, fur, 0.055, 0.14);
      hip.add(knee);
      knee.position.y = -0.24;
      limb(knee, fur, 0.045, 0.13);
      const foot = new Group();
      knee.add(foot);
      foot.position.y = -0.22;
      add(foot, dark, 0.05, 0.03, 0.1, 0, -0.01, 0.045);
    };
    leg(this.hipL, this.kneeL, 1);
    leg(this.hipR, this.kneeR, -1);

    let parent: Object3D = this.body;
    for (let i = 0; i < 11; i++) {
      const seg = new Group();
      seg.position.set(0, i === 0 ? 0.0 : -0.085, i === 0 ? -0.12 : 0);
      parent.add(seg);
      const r = 0.034 - i * 0.0022;
      B.addTRS(seg, new CapsuleGeometry(r, 0.06, 3, 6), i > 8 ? dark : fur, [0, -0.045, 0]);
      this.tail.push(seg);
      parent = seg;
    }
    B.build(vc);

    for (const o of [
      this.body, this.chest, this.head, this.shoulderL, this.shoulderR, this.elbowL, this.elbowR,
      this.hipL, this.hipR, this.kneeL, this.kneeR, ...this.tail,
    ]) {
      const j = { o, x: 0, y: 0, z: 0 };
      this.joints.push(j);
      this.J.set(o, j);
    }

    // Sombra de contacto (ayuda mucho a calcular saltos en 3D)
    const sg = new CircleGeometry(0.45, 20);
    sg.rotateX(-Math.PI / 2);
    this.shadow = new Mesh(sg, new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    this.shadow.renderOrder = 2;
  }

  setOpacity(a: number): void {
    for (const m of this.materials) {
      m.transparent = a < 0.99;
      m.opacity = a;
      m.depthWrite = a > 0.6;
    }
  }

  setEmissive(hex: number, k: number): void {
    for (const m of this.materials) {
      m.emissive.setHex(hex);
      m.emissiveIntensity = k;
    }
  }

  private set(o: Object3D, x: number, y = 0, z = 0): void {
    const j = this.J.get(o)!;
    j.x = x;
    j.y = y;
    j.z = z;
  }

  update(dt: number, pos: Vector3, p: MonkeyPose): void {
    const t = p.time;
    const spd = p.speed;
    this.visualOffset.multiplyScalar(Math.exp(-12 * dt));

    // --------- orientación de la raíz
    if (p.state === 'swing') {
      this.up.copy(p.ropeDir);
      this.fwd.set(Math.sin(p.yaw), 0, Math.cos(p.yaw));
      this.fwd.addScaledVector(this.up, -this.fwd.dot(this.up)).normalize();
      this.right.crossVectors(this.up, this.fwd).normalize();
      this.fwd.crossVectors(this.right, this.up);
      this.m.makeBasis(this.right, this.up, this.fwd);
      this.qTarget.setFromRotationMatrix(this.m);
    } else {
      this.qTarget.setFromAxisAngle(UP, p.yaw);
    }
    this.q.slerp(this.qTarget, 1 - Math.exp(-(p.state === 'swing' ? 18 : 14) * dt));
    this.root.quaternion.copy(this.q);
    this.root.position.copy(pos).add(this.visualOffset);

    // --------- pose objetivo por estado
    let pitch = 1.15;
    let bodyY = HIP_H;
    let bodyRoll = 0;
    let bodyYaw = 0;
    let lambda = 14;
    const tailBase = { x: 2.0, curl: 0.1, wave: 0.12 };

    switch (p.state) {
      case 'ground': {
        if (spd > 0.4) {
          const k = clamp(spd / 11, 0, 1);
          this.gallop += dt * (1.1 + spd * 0.36);
          const ph = this.gallop * TAU;
          pitch = 1.25 + k * 0.2 + Math.sin(ph * 2) * 0.06 * k;
          bodyY = HIP_H - 0.05 + Math.abs(Math.sin(ph)) * 0.07 * (0.4 + k);
          const A = 0.55 + k * 0.45;
          const hind = Math.sin(ph) * A;
          const front = Math.sin(ph + Math.PI * 0.85) * A;
          const off = 0.35 * (1 - k * 0.6);
          this.set(this.hipL, -pitch - hind, 0, 0.05);
          this.set(this.hipR, -pitch - Math.sin(ph + off) * A, 0, -0.05);
          this.set(this.kneeL, Math.max(0, Math.cos(ph)) * 1.3 + 0.2);
          this.set(this.kneeR, Math.max(0, Math.cos(ph + off)) * 1.3 + 0.2);
          this.set(this.shoulderL, -pitch - front, 0, -0.08);
          this.set(this.shoulderR, -pitch - Math.sin(ph + Math.PI * 0.85 + off) * A, 0, 0.08);
          this.set(this.elbowL, Math.max(0, Math.cos(ph + Math.PI * 0.85)) * 1.1);
          this.set(this.elbowR, Math.max(0, Math.cos(ph + Math.PI * 0.85 + off)) * 1.1);
          this.set(this.head, -(pitch - 0.15) * 0.9, 0, 0);
          tailBase.x = 2.1 + k * 0.4;
          tailBase.wave = 0.18;
          lambda = 20;
        } else if (p.idleTime > 0.8) {
          // sentado, mirando alrededor
          pitch = 0.22 + Math.sin(t * 1.3) * 0.02;
          bodyY = 0.27;
          this.set(this.hipL, -1.45, 0, 0.25);
          this.set(this.hipR, -1.45, 0, -0.25);
          this.set(this.kneeL, 1.95);
          this.set(this.kneeR, 1.95);
          this.set(this.shoulderL, -0.75, 0, -0.1);
          this.set(this.elbowL, -0.9);
          const scratch = Math.sin(t * 0.37) > 0.75 ? Math.sin(t * 18) * 0.25 : 0;
          this.set(this.shoulderR, -0.3 - (scratch ? 2.3 : 0), 0, scratch ? 0.5 : 0.1);
          this.set(this.elbowR, scratch ? -2.0 + scratch : -0.5);
          this.set(this.head, -0.1 + Math.sin(t * 0.7) * 0.1, Math.sin(t * 0.45) * 0.6, Math.sin(t * 0.9) * 0.08);
          tailBase.x = 1.6;
          tailBase.curl = 0.16;
          tailBase.wave = 0.05;
          lambda = 6;
        } else {
          pitch = 1.1 + Math.sin(t * 2) * 0.02;
          bodyY = HIP_H - 0.06;
          this.set(this.hipL, -pitch - 0.1, 0, 0.1);
          this.set(this.hipR, -pitch - 0.1, 0, -0.1);
          this.set(this.kneeL, 0.35);
          this.set(this.kneeR, 0.35);
          this.set(this.shoulderL, -pitch + 0.15, 0, -0.1);
          this.set(this.shoulderR, -pitch + 0.15, 0, 0.1);
          this.set(this.elbowL, 0.15);
          this.set(this.elbowR, 0.15);
          this.set(this.head, -(pitch - 0.2), Math.sin(t * 0.8) * 0.3, 0);
        }
        break;
      }
      case 'air': {
        const rising = p.vel.y > 1;
        pitch = rising ? 0.55 : 0.25;
        this.set(this.shoulderL, rising ? -2.5 : -2.0, 0, rising ? -0.2 : -0.9);
        this.set(this.shoulderR, rising ? -2.5 : -2.0, 0, rising ? 0.2 : 0.9);
        this.set(this.elbowL, -0.35);
        this.set(this.elbowR, -0.35);
        this.set(this.hipL, rising ? -1.0 : -0.5, 0, 0.2);
        this.set(this.hipR, rising ? -1.0 : -0.4, 0, -0.2);
        this.set(this.kneeL, rising ? 1.5 : 0.6);
        this.set(this.kneeR, rising ? 1.5 : 0.8);
        this.set(this.head, -0.3);
        tailBase.x = rising ? 2.4 : 2.7;
        tailBase.curl = -0.12;
        lambda = 10;
        break;
      }
      case 'swing': {
        const vf = p.vel.x * Math.sin(p.yaw) + p.vel.z * Math.cos(p.yaw);
        pitch = clamp(-vf * 0.035, -0.45, 0.45);
        bodyY = HIP_H;
        const climb = p.ropeClimbing;
        const cp = t * 9;
        if (climb !== 0) {
          this.set(this.shoulderR, -Math.PI + Math.sin(cp) * 0.35, 0, 0.1);
          this.set(this.shoulderL, -Math.PI - Math.sin(cp) * 0.35, 0, -0.1);
          this.set(this.elbowR, -Math.max(0, Math.cos(cp)) * 0.9);
          this.set(this.elbowL, -Math.max(0, -Math.cos(cp)) * 0.9);
        } else {
          this.set(this.shoulderR, -Math.PI + 0.05 - pitch, 0, 0.12);
          this.set(this.shoulderL, -2.0 - pitch, 0, -0.5);
          this.set(this.elbowR, 0);
          this.set(this.elbowL, -0.6);
        }
        const pump = p.pumping;
        this.set(this.hipL, -0.35 - pump * 0.8 - pitch, 0, 0.15);
        this.set(this.hipR, -0.25 - pump * 0.8 - pitch, 0, -0.15);
        this.set(this.kneeL, 0.6 - pump * 0.5);
        this.set(this.kneeR, 0.8 - pump * 0.5);
        this.set(this.head, -0.2 - pitch * 0.5);
        tailBase.x = 2.9;
        tailBase.curl = -0.28;
        tailBase.wave = 0.06;
        lambda = 16;
        break;
      }
      case 'climb': {
        const cp = p.climbPhase;
        const sp = p.climbSpread;
        pitch = 0.12;
        bodyY = HIP_H;
        this.set(this.shoulderL, -2.6 + Math.sin(cp) * 0.45, 0, -0.35 - sp);
        this.set(this.shoulderR, -2.6 - Math.sin(cp) * 0.45, 0, 0.35 + sp);
        this.set(this.elbowL, -0.5 - Math.max(0, Math.cos(cp)) * 0.6);
        this.set(this.elbowR, -0.5 - Math.max(0, -Math.cos(cp)) * 0.6);
        this.set(this.hipL, -1.2 - Math.sin(cp) * 0.4, 0, 0.4 + sp * 0.6);
        this.set(this.hipR, -1.2 + Math.sin(cp) * 0.4, 0, -0.4 - sp * 0.6);
        this.set(this.kneeL, 1.7);
        this.set(this.kneeR, 1.7);
        this.set(this.head, -0.35, Math.sin(t * 0.6) * 0.2);
        tailBase.x = 0.5;
        tailBase.curl = 0.05;
        lambda = 16;
        break;
      }
      case 'swim': {
        pitch = 1.35;
        bodyY = 0.3;
        const sw = t * 6;
        this.set(this.shoulderL, -pitch - 1.2 - Math.sin(sw) * 0.9, 0, -0.3);
        this.set(this.shoulderR, -pitch - 1.2 + Math.sin(sw) * 0.9, 0, 0.3);
        this.set(this.elbowL, -0.4);
        this.set(this.elbowR, -0.4);
        this.set(this.hipL, -pitch + 0.6 + Math.sin(sw * 1.3) * 0.4, 0, 0.1);
        this.set(this.hipR, -pitch + 0.6 - Math.sin(sw * 1.3) * 0.4, 0, -0.1);
        this.set(this.kneeL, 0.4);
        this.set(this.kneeR, 0.4);
        this.set(this.head, -1.15);
        tailBase.x = 1.6;
        break;
      }
      case 'down': {
        pitch = 0.1;
        bodyY = 0.18;
        bodyRoll = 1.45;
        this.set(this.shoulderL, -0.6, 0, -1.2);
        this.set(this.shoulderR, -1.2, 0, 1.0);
        this.set(this.elbowL, -0.5);
        this.set(this.elbowR, -0.3);
        this.set(this.hipL, -0.6, 0, 0.3);
        this.set(this.hipR, -0.2, 0, -0.2);
        this.set(this.kneeL, 0.8);
        this.set(this.kneeR, 0.4);
        this.set(this.head, 0.2, 0.4);
        tailBase.x = 1.6;
        tailBase.wave = 0;
        lambda = 7;
        break;
      }
    }

    // --------- capas de ataque / daño / esquiva
    const a = p.attackT;
    switch (p.attack) {
      case 'punchL':
      case 'punchR': {
        const sh = p.attack === 'punchR' ? this.shoulderR : this.shoulderL;
        const el = p.attack === 'punchR' ? this.elbowR : this.elbowL;
        const side = p.attack === 'punchR' ? -1 : 1;
        const strike = a < 0.3 ? -0.5 + a : a < 0.6 ? 1 : 1 - (a - 0.6) / 0.4;
        pitch = Math.min(pitch, 0.6);
        bodyY = Math.max(bodyY, HIP_H - 0.04);
        this.set(sh, -pitch - 0.2 - strike * 1.5, 0, side * -0.25);
        this.set(el, a < 0.3 ? -1.4 : -0.1);
        bodyYaw = side * 0.45 * strike;
        lambda = 30;
        break;
      }
      case 'spin': {
        bodyYaw = a * TAU;
        pitch = 0.5;
        this.set(this.shoulderL, -1.5, 0, -1.3);
        this.set(this.shoulderR, -1.5, 0, 1.3);
        this.set(this.elbowL, 0);
        this.set(this.elbowR, 0);
        tailBase.x = 1.57;
        tailBase.curl = 0;
        lambda = 40;
        break;
      }
      case 'kick': {
        pitch = -0.45;
        this.set(this.hipL, 0.45 - 1.55, 0, 0.1);
        this.set(this.hipR, 0.45 - 1.2, 0, -0.1);
        this.set(this.kneeL, 0.05);
        this.set(this.kneeR, 0.4);
        this.set(this.shoulderL, 0.7, 0, -0.6);
        this.set(this.shoulderR, 0.7, 0, 0.6);
        lambda = 26;
        break;
      }
      case 'pound': {
        this.flip += dt * 16;
        pitch = 1.2 + this.flip;
        this.set(this.shoulderL, -1.2, 0, 0.3);
        this.set(this.shoulderR, -1.2, 0, -0.3);
        this.set(this.elbowL, -2.1);
        this.set(this.elbowR, -2.1);
        this.set(this.hipL, -1.7);
        this.set(this.hipR, -1.7);
        this.set(this.kneeL, 2.3);
        this.set(this.kneeR, 2.3);
        lambda = 40;
        break;
      }
      case 'throw': {
        const arc = a < 0.4 ? a / 0.4 : 1 - (a - 0.4) / 0.6;
        const fwdPhase = a > 0.4;
        this.set(this.shoulderR, fwdPhase ? -pitch - 1.4 : -pitch - 2.9 * arc - 0.3, 0, 0.2);
        this.set(this.elbowR, fwdPhase ? -0.1 : -1.4);
        bodyYaw = fwdPhase ? -0.3 : 0.4;
        lambda = 28;
        break;
      }
      default:
        break;
    }
    if (p.attack !== 'pound') this.flip = 0;

    if (p.hurt > 0) {
      pitch -= p.hurt * 0.6;
      this.J.get(this.head)!.x -= p.hurt * 0.6;
    }
    if (p.dodge > 0) {
      bodyRoll += p.dodgeSide * Math.sin(p.dodge * Math.PI) * 1.2;
      this.set(this.hipL, -1.6, 0, 0.2);
      this.set(this.hipR, -1.6, 0, -0.2);
      this.set(this.kneeL, 2.2);
      this.set(this.kneeR, 2.2);
      lambda = 30;
    }

    this.set(this.body, pitch, bodyYaw, bodyRoll);
    // cola
    for (let i = 0; i < this.tail.length; i++) {
      const base = i === 0 ? tailBase.x : tailBase.curl;
      const wx = Math.sin(t * 3.2 - i * 0.55) * tailBase.wave;
      const wz = Math.sin(t * 2.1 - i * 0.4) * tailBase.wave * 1.2;
      this.set(this.tail[i], base + wx, 0, wz);
    }

    // --------- aplicar con amortiguación
    this.bodyY = damp(this.bodyY, bodyY, lambda, dt);
    this.body.position.y = this.bodyY;
    for (const j of this.joints) {
      if (j.o === this.body) {
        // el cuerpo puede dar vueltas completas (voltereta, giro): ángulos envueltos
        const b = j.o.rotation;
        b.x = wrapAngle(p.attack === 'pound' ? j.x : dampAngle(b.x, j.x, lambda, dt));
        b.y = wrapAngle(p.attack === 'spin' ? j.y : dampAngle(b.y, j.y, lambda, dt));
        b.z = damp(b.z, j.z, lambda, dt);
        continue;
      }
      j.o.rotation.x = damp(j.o.rotation.x, j.x, lambda, dt);
      j.o.rotation.y = damp(j.o.rotation.y, j.y, lambda, dt);
      j.o.rotation.z = damp(j.o.rotation.z, j.z, lambda, dt);
    }
  }

  updateShadow(groundY: number, feetY: number, x: number, z: number): void {
    const h = Math.max(0, feetY - groundY);
    this.shadow.position.set(x, groundY + 0.04, z);
    const s = 1 + h * 0.06;
    this.shadow.scale.set(s, 1, s);
    (this.shadow.material as MeshBasicMaterial).opacity = Math.max(0.08, 0.42 - h * 0.012);
    this.shadow.visible = h < 40;
  }
}
