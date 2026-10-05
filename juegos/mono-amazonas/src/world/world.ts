import { Scene, Vector3 } from 'three';
import { SEED, WATER_LEVEL } from '../config';
import { clamp, segmentCircleXZ, segmentSphereHit } from '../core/math';
import { Noise2D } from '../core/noise';
import { Rng } from '../core/random';
import { SpatialHash } from '../core/spatial';
import { buildCamps, chooseCamps, type CampMeshes } from './camps';
import { buildForestMeshes, generateForest, type ForestData } from './forest';
import { Atmosphere } from './sky';
import { Terrain } from './terrain';
import {
  barkTexture, beamTexture, broadLeafTexture, glowTexture, groundDetailTexture, thatchTexture, waterNormalTexture,
} from './textures';
import type { Branch, Camp, Crown, Platform, SupportHit, Trunk } from './types';
import { buildVegetation } from './vegetation';
import { VineSystem } from './vines';
import { Water } from './water';

export interface RayHit {
  dist: number;
  point: Vector3;
  kind: 'terrain' | 'trunk' | 'none';
}

/**
 * Mundo: genera la selva y responde consultas físicas (suelo, troncos,
 * superficies, línea de visión, raycasts) usando rejillas espaciales.
 */
export class World {
  readonly noise: Noise2D;
  readonly terrain: Terrain;
  readonly forest: ForestData;
  readonly camps: Camp[];
  readonly campMeshes: CampMeshes;
  readonly vines: VineSystem;
  readonly water: Water;
  readonly atmosphere: Atmosphere;
  readonly start: Vector3;
  readonly ancestralPos: Vector3;
  readonly glow = glowTexture();
  readonly beam = beamTexture();
  readonly leafTex = broadLeafTexture();

  readonly trunkHash = new SpatialHash<Trunk>(12);
  readonly branchHash = new SpatialHash<Branch>(12);
  readonly platformHash = new SpatialHash<Platform>(12);
  readonly crownHash = new SpatialHash<Crown>(16);
  readonly trunks: Trunk[];
  readonly platforms: Platform[];

  private tTrunks: Trunk[] = [];
  private tBranches: Branch[] = [];
  private tPlatforms: Platform[] = [];
  private tCrowns: Crown[] = [];
  private v = new Vector3();

  constructor(readonly scene: Scene) {
    const rng = new Rng(SEED);
    this.noise = new Noise2D(rng);
    this.terrain = new Terrain(this.noise);
    const t = this.terrain;

    // Punto de inicio: al suroeste, en la orilla sur del río.
    const sx = -178;
    const sz = t.riverCenterZ(sx) - 42;
    this.start = new Vector3(sx, t.heightAt(sx, sz), sz);
    const ax = 8;
    const az = t.riverCenterZ(ax) - 52;
    this.ancestralPos = new Vector3(ax, t.heightAt(ax, az), az);

    this.camps = chooseCamps(t, this.start, this.ancestralPos);
    this.forest = generateForest(rng, t, this.camps, this.start, this.ancestralPos);
    this.campMeshes = buildCamps(this.camps, t, thatchTexture(), this.glow);

    this.trunks = [...this.forest.trunks, ...this.campMeshes.colliders];
    this.platforms = [...this.forest.platforms, ...this.campMeshes.platforms];
    for (const tr of this.trunks) {
      const r = tr.r + tr.buttress + 0.5;
      this.trunkHash.insertPoint(tr, tr.x, tr.z, r);
    }
    for (const b of [...this.forest.branches, ...this.forest.logs]) {
      this.branchHash.insert(
        b, Math.min(b.a.x, b.b.x) - b.r - 0.5, Math.min(b.a.z, b.b.z) - b.r - 0.5,
        Math.max(b.a.x, b.b.x) + b.r + 0.5, Math.max(b.a.z, b.b.z) + b.r + 0.5,
      );
    }
    for (const p of this.platforms) this.platformHash.insertPoint(p, p.x, p.z, p.R);
    for (const c of this.forest.crowns) this.crownHash.insertPoint(c, c.x, c.z, c.r);

    // Mallas
    scene.add(t.build(groundDetailTexture()));
    const fm = buildForestMeshes(this.forest, this.noise, barkTexture());
    scene.add(fm.group);
    scene.add(buildVegetation(t, this.noise, this.trunkHash, this.camps, this.leafTex));
    scene.add(this.campMeshes.group);
    this.vines = new VineSystem(this.forest.vines, this.leafTex);
    scene.add(this.vines.group);
    this.water = new Water(t.size, waterNormalTexture());
    scene.add(this.water.mesh);
    this.atmosphere = new Atmosphere(scene, t, this.glow, this.beam);
  }

  groundHeight(x: number, z: number): number {
    return this.terrain.heightAt(x, z);
  }

  isDeepWater(x: number, z: number): boolean {
    return this.terrain.heightAt(x, z) < WATER_LEVEL - 0.45;
  }

  /** Superficie más alta bajo (x,z) cuya altura no supera maxY. */
  supportHeight(x: number, z: number, maxY: number, out: SupportHit): SupportHit {
    out.y = this.terrain.heightAt(x, z);
    out.kind = 'terrain';
    out.platform = null;

    this.branchHash.query(x, z, 1, this.tBranches);
    for (const b of this.tBranches) {
      const abx = b.b.x - b.a.x, abz = b.b.z - b.a.z;
      const l2 = abx * abx + abz * abz;
      let t = l2 > 1e-6 ? ((x - b.a.x) * abx + (z - b.a.z) * abz) / l2 : 0;
      t = clamp(t, 0, 1);
      const cx = b.a.x + abx * t, cz = b.a.z + abz * t;
      const cy = b.a.y + (b.b.y - b.a.y) * t;
      const d = Math.hypot(x - cx, z - cz);
      const rr = b.r + 0.3;
      if (d > rr) continue;
      const y = cy + b.r * (0.55 + 0.45 * Math.sqrt(Math.max(0, 1 - (d / rr) * (d / rr))));
      if (y <= maxY && y > out.y) {
        out.y = y;
        out.kind = 'branch';
        out.platform = null;
      }
    }

    this.platformHash.query(x, z, 0.5, this.tPlatforms);
    for (const p of this.tPlatforms) {
      const d = Math.hypot(x - p.x, z - p.z);
      if (d > p.R) continue;
      const k = d / p.R;
      const y = p.y - p.sag * (p.cone ? k : k * k);
      if (y <= maxY && y > out.y) {
        out.y = y;
        out.kind = 'platform';
        out.platform = p;
      }
    }
    return out;
  }

  /**
   * Empuja una cápsula vertical (pies en pos) fuera de los troncos.
   * Devuelve el último tronco tocado (o null) y escribe la normal en outNormal.
   */
  collideTrunks(pos: Vector3, radius: number, height: number, outNormal?: Vector3): Trunk | null {
    this.trunkHash.query(pos.x, pos.z, radius + 4, this.tTrunks);
    let hit: Trunk | null = null;
    for (const t of this.tTrunks) {
      if (pos.y > t.y1 || pos.y + height < t.y0) continue;
      const tr = this.trunkRadiusAt(t, pos.y);
      const dx = pos.x - t.x, dz = pos.z - t.z;
      const d = Math.hypot(dx, dz);
      const min = tr + radius;
      if (d < min) {
        const nx = d > 1e-5 ? dx / d : 1, nz = d > 1e-5 ? dz / d : 0;
        pos.x = t.x + nx * min;
        pos.z = t.z + nz * min;
        if (outNormal) outNormal.set(nx, 0, nz);
        hit = t;
      }
    }
    return hit;
  }

  /** Radio efectivo del tronco a una altura (estrechamiento + raíces tabulares). */
  trunkRadiusAt(t: Trunk, y: number): number {
    const h = clamp((y - t.y0) / Math.max(0.1, t.y1 - t.y0), 0, 1);
    let r = t.r * (1 + (t.taper - 1) * h);
    if (t.buttress > 0) {
      const above = y - t.y0;
      if (above < 3.5) r += t.buttress * (1 - above / 3.5);
    }
    return r;
  }

  nearestTrunk(pos: Vector3, maxGap: number): Trunk | null {
    this.trunkHash.query(pos.x, pos.z, maxGap + 4, this.tTrunks);
    let best: Trunk | null = null;
    let bestGap = maxGap;
    for (const t of this.tTrunks) {
      if (!t.climbable || pos.y > t.y1 - 0.5 || pos.y + 1 < t.y0) continue;
      const gap = Math.hypot(pos.x - t.x, pos.z - t.z) - this.trunkRadiusAt(t, pos.y);
      if (gap < bestGap) {
        bestGap = gap;
        best = t;
      }
    }
    return best;
  }

  /** Visibilidad 0..1 entre dos puntos: troncos y terreno bloquean, el follaje atenúa. */
  lineOfSight(a: Vector3, b: Vector3): number {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const len = Math.hypot(dx, dy, dz);
    const steps = Math.max(2, Math.ceil(len / 6));
    // terreno
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.terrain.heightAt(a.x + dx * t, a.z + dz * t) > a.y + dy * t + 0.1) return 0;
    }
    // troncos
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    const half = Math.hypot(dx, dz) / 2 + 3;
    this.trunkHash.query(mx, mz, half, this.tTrunks);
    for (const t of this.tTrunks) {
      const th = segmentCircleXZ(a.x, a.z, b.x, b.z, t.x, t.z, t.r * 0.9);
      if (th > 0 && th < 1) {
        const y = a.y + dy * th;
        if (y > t.y0 && y < t.y1) return 0;
      }
    }
    // follaje
    let vis = 1;
    this.crownHash.query(mx, mz, half + 4, this.tCrowns);
    for (const c of this.tCrowns) {
      this.v.set(c.x, c.y, c.z);
      if (segmentSphereHit(a, b, this.v, c.r) >= 0 && segmentSphereHit(b, a, this.v, c.r) >= 0) {
        vis *= 0.32;
        if (vis < 0.05) return 0;
      }
    }
    return vis;
  }

  /** Raycast contra terreno y troncos (cámara, puntería). */
  raycast(origin: Vector3, dir: Vector3, maxDist: number, out: RayHit): RayHit {
    out.dist = maxDist;
    out.kind = 'none';
    // troncos: muestreamos celdas a lo largo del rayo
    const stepLen = 8;
    for (let s = 0; s <= maxDist; s += stepLen) {
      const cx = origin.x + dir.x * (s + stepLen / 2), cz = origin.z + dir.z * (s + stepLen / 2);
      this.trunkHash.query(cx, cz, stepLen, this.tTrunks);
      for (const t of this.tTrunks) {
        const ex = origin.x + dir.x * maxDist, ez = origin.z + dir.z * maxDist;
        const th = segmentCircleXZ(origin.x, origin.z, ex, ez, t.x, t.z, t.r);
        if (th < 0) continue;
        const d = th * maxDist;
        const y = origin.y + dir.y * d;
        if (y < t.y0 || y > t.y1) continue;
        if (d < out.dist) {
          out.dist = d;
          out.kind = 'trunk';
        }
      }
      if (out.kind !== 'none' && out.dist < s) break;
    }
    // terreno: marcha + bisección
    let prev = 0;
    for (let d = 0.5; d <= out.dist; d += 1) {
      const y = origin.y + dir.y * d;
      if (y < this.terrain.heightAt(origin.x + dir.x * d, origin.z + dir.z * d)) {
        let lo = prev, hi = d;
        for (let i = 0; i < 6; i++) {
          const mid = (lo + hi) / 2;
          const my = origin.y + dir.y * mid;
          if (my < this.terrain.heightAt(origin.x + dir.x * mid, origin.z + dir.z * mid)) hi = mid;
          else lo = mid;
        }
        out.dist = lo;
        out.kind = 'terrain';
        break;
      }
      prev = d;
    }
    out.point.copy(origin).addScaledVector(dir, out.dist);
    return out;
  }

  update(dt: number, time: number, playerPos: Vector3): void {
    this.vines.update(dt, playerPos, time);
    this.water.update(time);
    this.campMeshes.update(time);
  }
}
