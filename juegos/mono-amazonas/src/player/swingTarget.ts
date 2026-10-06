import { Vector3 } from 'three';
import { distToSegmentSq, segmentCircleXZ, segmentT } from '../core/math';
import type { Trunk } from '../world/types';
import { VINE_SEGMENTS, type Vine } from '../world/vines';
import type { World } from '../world/world';

export interface SwingTarget {
  vine: Vine;
  /** Punto de la liana que agarrará la mano. */
  point: Vector3;
  /** Longitud de cuerda desde el anclaje hasta ese punto. */
  along: number;
  /** Distancia del estirón (mano → punto). */
  reach: number;
}

/**
 * Selección asistida de liana, estilo web-swing de Spider-Man: no hay que
 * apuntar; se elige la mejor liana por encima y por delante de la dirección
 * en la que se quiere ir, con un arco de balanceo útil y sin troncos en medio.
 */
export class SwingTargeter {
  private tmp: Vine[] = [];
  private trunks: Trunk[] = [];
  private a = new Vector3();
  private b = new Vector3();
  private c = new Vector3();
  /** Punto candidato de la liana evaluada (no pisar el del mejor resultado). */
  private cand = new Vector3();
  private best: SwingTarget = { vine: null as unknown as Vine, point: new Vector3(), along: 0, reach: 0 };

  constructor(private world: World) {}

  /**
   * @param hand posición de la mano
   * @param dir dirección horizontal deseada (unitaria)
   * @param speed velocidad horizontal actual (mira más lejos cuanto más rápido)
   * @param maxReach distancia máxima del estirón hasta la liana
   */
  find(hand: Vector3, dir: Vector3, speed: number, maxReach: number, exclude: Vine | null): SwingTarget | null {
    const lookAhead = 5 + Math.min(speed, 22) * 0.35;
    const cx = hand.x + dir.x * lookAhead, cz = hand.z + dir.z * lookAhead;
    this.world.vines.hash.query(cx, cz, 18, this.tmp);
    let bestScore = Infinity;
    let found = false;
    for (const v of this.tmp) {
      if (v === exclude) continue;
      const A = v.anchor;
      const rise = A.y - hand.y;
      if (rise < 3) continue;
      const dx = A.x - hand.x, dz = A.z - hand.z;
      const hd = Math.hypot(dx, dz);
      const fwd = dx * dir.x + dz * dir.z;
      if (hd > 17 || fwd < -2.5) continue;
      const lat = Math.abs(-dx * dir.z + dz * dir.x);

      // punto de la liana más cercano a la mano (sin contar el tramo junto al anclaje)
      let reach2 = Infinity;
      let along = 0;
      for (let i = 0; i < VINE_SEGMENTS; i++) {
        v.point(i, this.a);
        v.point(i + 1, this.b);
        const d2 = distToSegmentSq(hand, this.a, this.b, this.c);
        if (d2 < reach2) {
          const al = (i + segmentT(hand, this.a, this.b)) * v.segLen;
          if (al < 3) continue;
          reach2 = d2;
          along = al;
          this.cand.copy(this.c);
        }
      }
      if (reach2 === Infinity) continue;
      const reach = Math.sqrt(reach2);
      if (reach > maxReach) continue;
      const grab = this.cand;

      // ángulo del arco al agarrar: ni colgado en vertical (sin impulso) ni casi horizontal
      const gh = Math.hypot(grab.x - A.x, grab.z - A.z);
      const theta = Math.atan2(gh, Math.max(0.1, A.y - grab.y));
      const arcPenalty = theta < 0.25 ? (0.25 - theta) * 6 : theta > 1.15 ? (theta - 1.15) * 8 : 0;

      const ideal = lookAhead;
      const score = reach * 0.9 + lat * 0.45 + Math.abs(fwd - ideal) * 0.18 + Math.max(0, -fwd) * 2 + arcPenalty;
      if (score >= bestScore) continue;
      if (this.blocked(hand, grab)) continue;
      if (this.arcBlocked(A, dir, along)) continue;
      bestScore = score;
      found = true;
      const t = this.best;
      t.vine = v;
      t.along = along;
      t.reach = reach;
      t.point.copy(grab);
    }
    return found ? this.best : null;
  }

  /** ¿Hay un tronco entre la mano y la liana? */
  private blocked(from: Vector3, to: Vector3): boolean {
    const w = this.world;
    w.trunkHash.query((from.x + to.x) / 2, (from.z + to.z) / 2, 10, this.trunks);
    for (const t of this.trunks) {
      const th = segmentCircleXZ(from.x, from.z, to.x, to.z, t.x, t.z, w.trunkRadiusAt(t, from.y) + 0.2);
      if (th < 0 || th > 0.95) continue;
      const y = from.y + (to.y - from.y) * th;
      if (y > t.y0 && y < t.y1) return true;
    }
    return false;
  }

  /** ¿El arco de balanceo hacia delante choca de lleno con un tronco? */
  private arcBlocked(A: Vector3, dir: Vector3, L: number): boolean {
    const w = this.world;
    w.trunkHash.query(A.x + dir.x * L * 0.4, A.z + dir.z * L * 0.4, L + 4, this.trunks);
    if (!this.trunks.length) return false;
    for (let k = -2; k <= 4; k++) {
      const phi = k * 0.22;
      const px = A.x + dir.x * Math.sin(phi) * L, pz = A.z + dir.z * Math.sin(phi) * L;
      const py = A.y - Math.cos(phi) * L;
      for (const t of this.trunks) {
        if (py < t.y0 || py > t.y1) continue;
        if (Math.hypot(px - t.x, pz - t.z) < w.trunkRadiusAt(t, py) + 0.45) return true;
      }
    }
    return false;
  }
}
