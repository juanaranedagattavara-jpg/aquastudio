import {
  CylinderGeometry, DoubleSide, DynamicDrawUsage, InstancedMesh, Matrix4, MeshLambertMaterial, PlaneGeometry,
  Quaternion, Texture, Vector3,
} from 'three';
import { distToSegmentSq, segmentT } from '../core/math';
import { Rng } from '../core/random';
import { SpatialHash, type Spatial } from '../core/spatial';
import { addNearFade } from './nearFade';
import type { VineSpec } from './types';

export const VINE_SEGMENTS = 9;
const LEAVES_PER_VINE = 4;
const SIM_RADIUS = 65;
const UP = new Vector3(0, 1, 0);

/**
 * Liana simulada con Verlet: cuelga, se mece con el viento, y cuando el mono
 * la agarra el punto de agarre queda fijado a su mano. Al soltarla sigue
 * oscilando con la inercia que le dejó el mono.
 */
export class Vine implements Spatial {
  __q?: number;
  readonly pts: Float32Array;
  readonly prev: Float32Array;
  readonly segLen: number;
  awake = false;
  dirty = true;
  held = false;
  holdLen = 0;
  readonly holdPos = new Vector3();
  readonly phase: number;
  readonly leafSeeds: number[];

  constructor(readonly anchor: Vector3, readonly length: number, readonly index: number, rng: Rng) {
    const n = VINE_SEGMENTS + 1;
    this.pts = new Float32Array(n * 3);
    this.prev = new Float32Array(n * 3);
    this.segLen = length / VINE_SEGMENTS;
    this.phase = rng.range(0, 100);
    const bend = rng.range(-0.3, 0.3);
    for (let i = 0; i < n; i++) {
      const t = i / VINE_SEGMENTS;
      this.pts[i * 3] = anchor.x + Math.sin(t * Math.PI) * bend;
      this.pts[i * 3 + 1] = anchor.y - t * length;
      this.pts[i * 3 + 2] = anchor.z + Math.sin(t * Math.PI) * bend * 0.5;
    }
    this.prev.set(this.pts);
    this.leafSeeds = Array.from({ length: LEAVES_PER_VINE }, () => rng.range(0, Math.PI * 2));
  }

  point(i: number, out: Vector3): Vector3 {
    return out.set(this.pts[i * 3], this.pts[i * 3 + 1], this.pts[i * 3 + 2]);
  }

  bottom(out: Vector3): Vector3 {
    return this.point(VINE_SEGMENTS, out);
  }

  hold(pos: Vector3, len: number): void {
    this.held = true;
    this.holdLen = len;
    this.holdPos.copy(pos);
    this.awake = true;
  }

  release(): void {
    this.held = false;
  }

  simulate(dt: number, time: number): void {
    const n = VINE_SEGMENTS + 1;
    const p = this.pts, o = this.prev;
    const g = -9.8 * dt * dt;
    const wx = (Math.sin(time * 0.7 + this.phase) * 0.7 + Math.sin(time * 1.9 + this.phase * 2) * 0.3) * 1.1 * dt * dt;
    const wz = (Math.cos(time * 0.55 + this.phase * 1.3) * 0.6 + Math.sin(time * 1.4 + this.phase) * 0.3) * 1.1 * dt * dt;
    const damping = 0.985;
    for (let i = 1; i < n; i++) {
      const k = i * 3;
      const t = i / VINE_SEGMENTS;
      const vx = (p[k] - o[k]) * damping, vy = (p[k + 1] - o[k + 1]) * damping, vz = (p[k + 2] - o[k + 2]) * damping;
      o[k] = p[k];
      o[k + 1] = p[k + 1];
      o[k + 2] = p[k + 2];
      p[k] += vx + wx * t;
      p[k + 1] += vy + g;
      p[k + 2] += vz + wz * t;
    }
    // ancla
    p[0] = this.anchor.x;
    p[1] = this.anchor.y;
    p[2] = this.anchor.z;
    let hi = -1;
    let holdRest = this.segLen;
    if (this.held) {
      hi = Math.min(VINE_SEGMENTS, Math.max(1, Math.ceil(this.holdLen / this.segLen - 1e-3)));
      holdRest = Math.max(0.05, this.holdLen - (hi - 1) * this.segLen);
    }
    for (let it = 0; it < 6; it++) {
      if (hi > 0) {
        const k = hi * 3;
        p[k] = this.holdPos.x;
        p[k + 1] = this.holdPos.y;
        p[k + 2] = this.holdPos.z;
      }
      for (let i = 0; i < VINE_SEGMENTS; i++) {
        const a = i * 3, b = a + 3;
        const dx = p[b] - p[a], dy = p[b + 1] - p[a + 1], dz = p[b + 2] - p[a + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const rest = i + 1 === hi ? holdRest : this.segLen;
        if (d <= rest) continue; // cuerda: sólo resiste el estiramiento
        const diff = (d - rest) / d;
        const aPinned = i === 0 || i === hi;
        const bPinned = i + 1 === hi;
        if (aPinned && bPinned) continue;
        const wa = aPinned ? 0 : bPinned ? 1 : 0.5;
        const wb = bPinned ? 0 : aPinned ? 1 : 0.5;
        p[a] += dx * diff * wa;
        p[a + 1] += dy * diff * wa;
        p[a + 2] += dz * diff * wa;
        p[b] -= dx * diff * wb;
        p[b + 1] -= dy * diff * wb;
        p[b + 2] -= dz * diff * wb;
      }
    }
    this.dirty = true;
  }
}

export interface GrabResult {
  vine: Vine;
  point: Vector3;
  along: number;
}

export class VineSystem {
  readonly vines: Vine[] = [];
  readonly hash = new SpatialHash<Vine>(12);
  readonly mesh: InstancedMesh;
  readonly leaves: InstancedMesh;
  private tmp: Vine[] = [];
  private a = new Vector3();
  private b = new Vector3();
  private c = new Vector3();
  private m = new Matrix4();
  private q = new Quaternion();
  private q2 = new Quaternion();
  private s = new Vector3();
  private grab: GrabResult = { vine: null as unknown as Vine, point: new Vector3(), along: 0 };

  constructor(specs: VineSpec[], leafTex: Texture) {
    const rng = new Rng(99);
    specs.forEach((sp, i) => {
      const v = new Vine(sp.anchor, sp.length, i, rng);
      this.vines.push(v);
      this.hash.insertPoint(v, sp.anchor.x, sp.anchor.z, 3);
    });
    const geo = new CylinderGeometry(1, 1, 1, 4, 1, true);
    geo.translate(0, 0.5, 0);
    const mat = new MeshLambertMaterial({ color: '#6b6230' });
    this.mesh = new InstancedMesh(geo, mat, this.vines.length * VINE_SEGMENTS);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    const lg = new PlaneGeometry(0.34, 0.6);
    lg.translate(0.17, 0, 0);
    const lm = new MeshLambertMaterial({ map: leafTex, alphaTest: 0.4, side: DoubleSide, color: '#9cc070' });
    addNearFade(lm, 0.8, 2);
    this.leaves = new InstancedMesh(lg, lm, this.vines.length * LEAVES_PER_VINE);
    this.leaves.instanceMatrix.setUsage(DynamicDrawUsage);
    this.leaves.frustumCulled = false;

    for (const v of this.vines) this.writeInstances(v);
    this.mesh.instanceMatrix.needsUpdate = true;
    this.leaves.instanceMatrix.needsUpdate = true;
  }

  private writeInstances(v: Vine): void {
    const base = v.index * VINE_SEGMENTS;
    for (let i = 0; i < VINE_SEGMENTS; i++) {
      v.point(i, this.a);
      v.point(i + 1, this.b);
      this.c.subVectors(this.b, this.a);
      const len = this.c.length() || 0.001;
      this.c.divideScalar(len);
      this.q.setFromUnitVectors(UP, this.c);
      const r = 0.075 - (i / VINE_SEGMENTS) * 0.03;
      this.s.set(r, len + 0.02, r);
      this.m.compose(this.a, this.q, this.s);
      this.mesh.setMatrixAt(base + i, this.m);
    }
    const lb = v.index * LEAVES_PER_VINE;
    for (let j = 0; j < LEAVES_PER_VINE; j++) {
      const seg = 1 + j * 2;
      v.point(seg, this.a);
      v.point(seg + 1, this.b);
      this.c.subVectors(this.b, this.a).normalize();
      this.q.setFromUnitVectors(UP, this.c);
      this.q2.setFromAxisAngle(UP, v.leafSeeds[j]);
      this.q.multiply(this.q2);
      this.a.lerp(this.b, 0.4);
      this.s.set(1, 1, 1);
      this.m.compose(this.a, this.q, this.s);
      this.leaves.setMatrixAt(lb + j, this.m);
    }
    v.dirty = false;
  }

  update(dt: number, center: Vector3, time: number): void {
    let changed = false;
    this.hash.query(center.x, center.z, SIM_RADIUS, this.tmp);
    const r2 = SIM_RADIUS * SIM_RADIUS;
    for (const v of this.tmp) {
      const dx = v.anchor.x - center.x, dz = v.anchor.z - center.z;
      if (dx * dx + dz * dz > r2 && !v.held) continue;
      v.awake = true;
      v.simulate(dt, time);
      this.writeInstances(v);
      changed = true;
    }
    if (changed) {
      this.mesh.instanceMatrix.needsUpdate = true;
      this.leaves.instanceMatrix.needsUpdate = true;
    }
  }

  /** Busca el punto de liana más cercano a la mano dentro del radio. */
  findGrab(hand: Vector3, radius: number, exclude: Vine | null): GrabResult | null {
    this.hash.query(hand.x, hand.z, radius + 12, this.tmp);
    let best = radius * radius;
    let found = false;
    for (const v of this.tmp) {
      if (v === exclude) continue;
      if (hand.y > v.anchor.y - 1.2 || hand.y < v.anchor.y - v.length - radius - 0.5) continue;
      for (let i = 0; i < VINE_SEGMENTS; i++) {
        v.point(i, this.a);
        v.point(i + 1, this.b);
        const d2 = distToSegmentSq(hand, this.a, this.b, this.c);
        if (d2 < best) {
          const t = segmentT(hand, this.a, this.b);
          const along = (i + t) * v.segLen;
          if (along < 1.6) continue;
          best = d2;
          found = true;
          this.grab.vine = v;
          this.grab.point.copy(this.c);
          this.grab.along = along;
        }
      }
    }
    return found ? this.grab : null;
  }

  nearestBottomDistance(pos: Vector3, maxR: number): number {
    this.hash.query(pos.x, pos.z, maxR + 4, this.tmp);
    let best = Infinity;
    for (const v of this.tmp) {
      v.bottom(this.a);
      const d = this.a.distanceTo(pos);
      if (d < best) best = d;
    }
    return best;
  }
}
