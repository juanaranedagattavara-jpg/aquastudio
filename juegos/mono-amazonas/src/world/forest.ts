import {
  BufferAttribute, BufferGeometry, Color, CylinderGeometry, DoubleSide, ExtrudeGeometry, Float32BufferAttribute,
  Group, IcosahedronGeometry, Matrix4, MeshLambertMaterial, Quaternion, Shape, Texture, Vector3,
} from 'three';
import { TAU } from '../core/math';
import type { Noise2D } from '../core/noise';
import { Rng } from '../core/random';
import { SpatialHash } from '../core/spatial';
import { WATER_LEVEL } from '../config';
import { InstanceBatch } from './instancing';
import type { Terrain } from './terrain';
import type { Branch, Camp, Crown, Platform, Trunk, VineSpec } from './types';
import { addNearFade } from './nearFade';
import { frondTexture } from './textures';

export interface Blob {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  rot: number;
  color: Color;
}

export interface ForestData {
  trunks: Trunk[];
  branches: Branch[];
  logs: Branch[];
  platforms: Platform[];
  crowns: Crown[];
  vines: VineSpec[];
  blobs: Blob[];
  palms: Trunk[];
  giants: Trunk[];
  ancestral: Trunk;
}

const FOLIAGE = ['#2e5e1f', '#356b22', '#3f7526', '#2a5420', '#4b7f2a', '#58892d', '#36622a', '#28501c'];

/** Muestreo de Poisson (Bridson) en un cuadrado: árboles bien repartidos y con espacio para balancearse. */
function poisson(rng: Rng, half: number, r: number, k = 20): [number, number][] {
  const cell = r / Math.SQRT2;
  const n = Math.ceil((half * 2) / cell);
  const grid = new Int32Array(n * n).fill(-1);
  const pts: [number, number][] = [];
  const active: number[] = [];
  const gi = (x: number, z: number): [number, number] => [
    Math.floor((x + half) / cell), Math.floor((z + half) / cell),
  ];
  const add = (x: number, z: number): void => {
    const [ix, iz] = gi(x, z);
    grid[iz * n + ix] = pts.length;
    active.push(pts.length);
    pts.push([x, z]);
  };
  add(rng.range(-half * 0.5, half * 0.5), rng.range(-half * 0.5, half * 0.5));
  while (active.length) {
    const ai = Math.floor(rng.next() * active.length);
    const [px, pz] = pts[active[ai]];
    let found = false;
    for (let t = 0; t < k; t++) {
      const a = rng.next() * TAU;
      const d = r * (1 + rng.next());
      const x = px + Math.cos(a) * d, z = pz + Math.sin(a) * d;
      if (x < -half || x >= half || z < -half || z >= half) continue;
      const [ix, iz] = gi(x, z);
      let ok = true;
      for (let jz = Math.max(0, iz - 2); jz <= Math.min(n - 1, iz + 2) && ok; jz++) {
        for (let jx = Math.max(0, ix - 2); jx <= Math.min(n - 1, ix + 2); jx++) {
          const q = grid[jz * n + jx];
          if (q >= 0) {
            const dx = pts[q][0] - x, dz = pts[q][1] - z;
            if (dx * dx + dz * dz < r * r) {
              ok = false;
              break;
            }
          }
        }
      }
      if (ok) {
        add(x, z);
        found = true;
        break;
      }
    }
    if (!found) active.splice(ai, 1);
  }
  return pts;
}

export function generateForest(
  rng: Rng, terrain: Terrain, camps: Camp[], start: { x: number; z: number }, ancestralPos: { x: number; z: number },
): ForestData {
  const trunks: Trunk[] = [];
  const branches: Branch[] = [];
  const logs: Branch[] = [];
  const platforms: Platform[] = [];
  const crowns: Crown[] = [];
  const vines: VineSpec[] = [];
  const blobs: Blob[] = [];
  const palms: Trunk[] = [];
  const giants: Trunk[] = [];
  const hash = new SpatialHash<Trunk>(12);
  const tmp: Trunk[] = [];

  const groundOrWater = (x: number, z: number): number => Math.max(terrain.heightAt(x, z), WATER_LEVEL);

  const addVine = (anchor: Vector3, minClear: number, maxClear: number, maxLen = 24): void => {
    const length = anchor.y - groundOrWater(anchor.x, anchor.z) - rng.range(minClear, maxClear);
    if (length >= 5) vines.push({ anchor: anchor.clone(), length: Math.min(length, maxLen) });
  };

  const addBlob = (x: number, y: number, z: number, sx: number, sy: number, sz: number, color: Color, block = true): void => {
    blobs.push({ x, y, z, sx, sy, sz, rot: rng.range(0, TAU), color });
    if (block) crowns.push({ x, y, z, r: Math.max(sx, sz) * 0.8 });
  };

  const foliageColor = (): Color => {
    const roll = rng.next();
    if (roll < 0.025) return new Color('#c4588c'); // ipê-roxo en flor
    if (roll < 0.045) return new Color('#d9b52c'); // ipê-amarelo en flor
    return new Color(rng.pick(FOLIAGE)).offsetHSL(rng.range(-0.02, 0.02), 0, rng.range(-0.04, 0.04));
  };

  const addBranch = (
    x: number, z: number, r: number, y: number, ang: number, len: number, rise: number, br: number, list = branches,
  ): Branch => {
    const a = new Vector3(x + Math.cos(ang) * r * 0.6, y, z + Math.sin(ang) * r * 0.6);
    const b = new Vector3(x + Math.cos(ang) * (r + len), y + rise, z + Math.sin(ang) * (r + len));
    const branch: Branch = { a, b, r: br };
    list.push(branch);
    return branch;
  };

  // ---------------------------------------------------------- Gran Sumaúma (árbol ancestral)
  const ax = ancestralPos.x, az = ancestralPos.z;
  const ay0 = terrain.heightAt(ax, az) - 1;
  const aH = 68;
  const aTop = ay0 + 1 + aH;
  const aR = 24;
  const ancPlatform: Platform = { x: ax, z: az, y: aTop + 2 + aR * 0.22 * 0.92, R: aR * 0.92, sag: 3, kind: 'ancestral' };
  const ancestral: Trunk = {
    x: ax, z: az, r: 3.6, y0: ay0, y1: aTop, kind: 'ancestral', climbable: true, buttress: 3.2, taper: 0.6,
    platform: ancPlatform,
  };
  trunks.push(ancestral);
  platforms.push(ancPlatform);
  hash.insertPoint(ancestral, ax, az, 8);
  addBlob(ax, aTop + 2, az, aR * 0.55, aR * 0.24, aR * 0.55, new Color('#3b7426'));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + rng.range(-0.2, 0.2);
    const s = rng.range(6.5, 8.5);
    addBlob(ax + Math.cos(a) * aR * 0.68, aTop + rng.range(-1, 2), az + Math.sin(a) * aR * 0.68, s, s * 0.5, s, foliageColor());
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.4;
    const s = rng.range(6, 7.5);
    addBlob(ax + Math.cos(a) * aR * 0.34, aTop + 3.5, az + Math.sin(a) * aR * 0.34, s, s * 0.55, s, foliageColor());
  }
  for (let i = 0; i < 11; i++) {
    const ang = i * 2.39996;
    const y = ay0 + 13 + i * 5.1;
    const b = addBranch(ax, az, 3.6 * (1 - (y - ay0) / aH * 0.4), y, ang, rng.range(9, 13), rng.range(1, 2.2), 0.62);
    addBlob(b.b.x, b.b.y + 1.2, b.b.z, 3.2, 1.8, 3.2, foliageColor());
    addVine(new Vector3(b.b.x, b.b.y - 0.5, b.b.z), 1.8, 4);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2;
    addVine(new Vector3(ax + Math.cos(a) * aR * 0.8, aTop - 1, az + Math.sin(a) * aR * 0.8), 2, 4.5, 30);
  }

  // ---------------------------------------------------------- Sumaúmas gigantes
  for (let tries = 0; tries < 400 && giants.length < 13; tries++) {
    const x = rng.range(-215, 215), z = rng.range(-215, 215);
    if (terrain.distanceToWater(x, z) < 9) continue;
    if (Math.hypot(x - ax, z - az) < 55) continue;
    if (Math.hypot(x - start.x, z - start.z) < 30) continue;
    if (camps.some((c) => Math.hypot(x - c.x, z - c.z) < 32)) continue;
    if (giants.some((g) => Math.hypot(x - g.x, z - g.z) < 58)) continue;
    const y0 = terrain.heightAt(x, z) - 0.5;
    const H = rng.range(42, 54);
    const r = rng.range(1.7, 2.4);
    const top = y0 + 0.5 + H;
    const R = rng.range(13, 16);
    const plat: Platform = { x, z, y: top + 1.5 + R * 0.25 * 0.9, R: R * 0.85, sag: 2.2, kind: 'giant' };
    const t: Trunk = { x, z, r, y0, y1: top, kind: 'giant', climbable: true, buttress: 1.7, taper: 0.62, platform: plat };
    trunks.push(t);
    giants.push(t);
    platforms.push(plat);
    hash.insertPoint(t, x, z, 6);
    addBlob(x, top + 1.5, z, R * 0.55, R * 0.25, R * 0.55, foliageColor());
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + rng.range(-0.25, 0.25);
      const s = rng.range(4.5, 6.5);
      addBlob(x + Math.cos(a) * R * 0.62, top + rng.range(-0.5, 1.5), z + Math.sin(a) * R * 0.62, s, s * 0.5, s, foliageColor());
    }
    const nb = rng.int(4, 6);
    for (let i = 0; i < nb; i++) {
      const ang = (i / nb) * TAU + rng.range(-0.4, 0.4);
      const b = addBranch(x, z, r, y0 + H * rng.range(0.5, 0.86), ang, rng.range(7, 11), rng.range(1, 3), 0.45);
      addBlob(b.b.x, b.b.y + 1, b.b.z, 2.6, 1.5, 2.6, foliageColor());
      addVine(new Vector3(b.b.x, b.b.y - 0.4, b.b.z), 1.8, 4.2);
      if (rng.chance(0.6)) addVine(new Vector3().lerpVectors(b.a, b.b, 0.55).setY(b.a.y + (b.b.y - b.a.y) * 0.55 - 0.4), 2, 4.5);
    }
    for (let i = 0; i < 4; i++) {
      const a = rng.range(0, TAU);
      addVine(new Vector3(x + Math.cos(a) * R * 0.7, top - 1, z + Math.sin(a) * R * 0.7), 2, 4.5, 28);
    }
  }

  // ---------------------------------------------------------- Árboles del dosel
  const pts = poisson(rng, 240, 11.5);
  for (const [x, z] of pts) {
    if (Math.abs(x) > 238 || Math.abs(z) > 238) continue;
    const h = terrain.heightAt(x, z);
    if (h < 0.7 || terrain.distanceToWater(x, z) < 1.5) continue;
    if (Math.hypot(x - ax, z - az) < 13) continue;
    if (Math.hypot(x - start.x, z - start.z) < 5) continue;
    if (camps.some((c) => Math.hypot(x - c.x, z - c.z) < 17)) continue;
    if (giants.some((g) => Math.hypot(x - g.x, z - g.z) < g.r + 7)) continue;
    const y0 = h - 0.3;
    const edge = Math.max(Math.abs(x), Math.abs(z)) > 205;
    const H = rng.range(17, 30) * (edge ? 0.85 : 1);
    const k = (H - 17) / 13;
    const r = 0.32 + k * 0.32 + rng.range(0, 0.12);
    const top = y0 + 0.3 + H;
    const cR = rng.range(4, 6.2) * (0.85 + k * 0.3);
    const plat: Platform = { x, z, y: top + cR * 0.15 + cR * 0.62 * 0.88, R: cR * 0.72, sag: cR * 0.25, kind: 'crown' };
    const t: Trunk = { x, z, r, y0, y1: top, kind: 'canopy', climbable: true, buttress: 0, taper: 0.72, platform: plat };
    trunks.push(t);
    platforms.push(plat);
    hash.insertPoint(t, x, z, 1);
    const col = foliageColor();
    addBlob(x, top + cR * 0.15, z, cR, cR * 0.62, cR, col);
    const extra = rng.int(1, 3);
    for (let i = 0; i < extra; i++) {
      const a = rng.range(0, TAU);
      const s = cR * rng.range(0.55, 0.75);
      addBlob(
        x + Math.cos(a) * cR * 0.6, top - cR * 0.1 + rng.range(0, 0.6), z + Math.sin(a) * cR * 0.6,
        s, s * 0.65, s, col.clone().offsetHSL(0, 0, rng.range(-0.05, 0.05)),
      );
    }
    const nb = rng.int(1, 3);
    for (let i = 0; i < nb; i++) {
      const ang = rng.range(0, TAU);
      const b = addBranch(x, z, r, y0 + H * rng.range(0.42, 0.8), ang, rng.range(3, 6), rng.range(0.4, 1.4), rng.range(0.16, 0.24));
      if (rng.chance(0.7)) addBlob(b.b.x, b.b.y + 0.6, b.b.z, 1.6, 1.0, 1.6, col, false);
      if (rng.chance(0.45)) addVine(new Vector3(b.b.x, b.b.y - b.r, b.b.z).lerp(b.a, 0.08), 1.6, 4.5);
    }
    if (rng.chance(0.6)) {
      const a = rng.range(0, TAU);
      addVine(new Vector3(x + Math.cos(a) * cR * 0.62, top - 0.4, z + Math.sin(a) * cR * 0.62), 1.6, 4.5);
    }
  }

  // ---------------------------------------------------------- Palmeras de açaí (en matas, sobre todo cerca del río)
  for (let c = 0; c < 190; c++) {
    const x = rng.range(-232, 232), z = rng.range(-232, 232);
    const dw = terrain.distanceToWater(x, z);
    if (dw < 1) continue;
    if (!rng.chance(dw < 40 ? 0.95 : 0.35)) continue;
    if (camps.some((cp) => Math.hypot(x - cp.x, z - cp.z) < 14)) continue;
    const n = rng.int(1, 4);
    for (let i = 0; i < n; i++) {
      const px = x + rng.range(-3, 3), pz = z + rng.range(-3, 3);
      const h = terrain.heightAt(px, pz);
      if (h < 0.5) continue;
      hash.query(px, pz, 4, tmp);
      if (tmp.some((t) => Math.hypot(t.x - px, t.z - pz) < t.r + t.buttress + 1.3)) continue;
      if (Math.hypot(px - start.x, pz - start.z) < 3) continue;
      const y0 = h - 0.2;
      const H = rng.range(9, 17);
      const top = y0 + 0.2 + H;
      const plat: Platform = { x: px, z: pz, y: top + 0.3, R: 1.35, sag: 0.1, kind: 'palm' };
      const t: Trunk = { x: px, z: pz, r: 0.14, y0, y1: top, kind: 'palm', climbable: true, buttress: 0, taper: 0.8, platform: plat };
      trunks.push(t);
      palms.push(t);
      platforms.push(plat);
      hash.insertPoint(t, px, pz, 1);
      crowns.push({ x: px, y: top + 0.3, z: pz, r: 2.2 });
    }
  }

  // ---------------------------------------------------------- Troncos caídos (transitables)
  for (let i = 0; i < 70; i++) {
    const x = rng.range(-225, 225), z = rng.range(-225, 225);
    if (terrain.distanceToWater(x, z) < 3) continue;
    const ang = rng.range(0, TAU);
    const len = rng.range(5, 10);
    const ex = x + Math.cos(ang) * len, ez = z + Math.sin(ang) * len;
    hash.query((x + ex) / 2, (z + ez) / 2, len, tmp);
    if (tmp.some((t) => Math.hypot(t.x - x, t.z - z) < t.r + 2 || Math.hypot(t.x - ex, t.z - ez) < t.r + 2)) continue;
    const r = rng.range(0.35, 0.6);
    const a = new Vector3(x, terrain.heightAt(x, z) + r * 0.6, z);
    const b = new Vector3(ex, terrain.heightAt(ex, ez) + r * 0.6, ez);
    logs.push({ a, b, r });
  }

  return { trunks, branches, logs, platforms, crowns, vines, blobs, palms, giants, ancestral };
}

// ======================================================================== mallas

const UP = new Vector3(0, 1, 0);

function crownGeometry(noise: Noise2D): BufferGeometry {
  const geo = new IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position as BufferAttribute;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const d = 0.82 + 0.3 * (noise.noise(v.x * 1.7 + v.y * 0.6, v.z * 1.7 - v.y) * 0.5 + 0.5);
    v.multiplyScalar(d);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  const colors = new Float32Array(pos.count * 3);
  for (let f = 0; f < pos.count; f += 3) {
    const y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;
    const shade = (0.55 + (y + 1) * 0.28) * (0.88 + ((f * 7919) % 13) / 13 * 0.24);
    for (let k = 0; k < 3; k++) colors.set([shade, shade, shade], (f + k) * 3);
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function trunkGeometry(noise: Noise2D, top: number, flare: number, radial: number, rows: number): BufferGeometry {
  const geo = new CylinderGeometry(top, 1, 1, radial, rows, true);
  geo.translate(0, 0.5, 0);
  const pos = geo.attributes.position as BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const a = Math.atan2(z, x);
    let k = 1 + noise.noise(Math.cos(a) * 1.3 + y * 2, Math.sin(a) * 1.3) * 0.09;
    k *= 1 + flare * Math.pow(1 - y, 8);
    pos.setXYZ(i, x * k, y, z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function buttressGeometry(): BufferGeometry {
  const s = new Shape();
  s.moveTo(0, 0);
  s.lineTo(1, 0);
  s.quadraticCurveTo(0.12, 0.12, 0, 1);
  s.lineTo(0, 0);
  const geo = new ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 6 });
  geo.translate(0, 0, -0.5);
  geo.computeVertexNormals();
  return geo;
}

function palmCrownGeometry(): BufferGeometry {
  const fronds = 9;
  const segs = 7;
  const positions: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let f = 0; f < fronds; f++) {
    const a = (f / fronds) * TAU + (f % 2) * 0.2;
    const dx = Math.cos(a), dz = Math.sin(a);
    const sx = -dz, sz = dx;
    const L = 4.2 + (f % 3) * 0.4;
    const lift = 1.1 + (f % 2) * 0.4;
    const base = positions.length / 3;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const px = dx * t * L, pz = dz * t * L;
      const py = Math.sin(t * Math.PI * 0.6) * lift - t * t * 2.4;
      const w = 0.95 * Math.sin(Math.PI * (0.08 + t * 0.9));
      positions.push(px - sx * w, py - w * 0.25, pz - sz * w);
      positions.push(px + sx * w, py - w * 0.25, pz + sz * w);
      uvs.push(0, t, 1, t);
      if (i < segs) {
        const k = base + i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export interface ForestMeshes {
  group: Group;
  foliageMaterial: MeshLambertMaterial;
  crownGeometry: BufferGeometry;
}

export function buildForestMeshes(data: ForestData, noise: Noise2D, bark: Texture): ForestMeshes {
  const group = new Group();
  group.name = 'forest';
  const m = new Matrix4();
  const q = new Quaternion();
  const s = new Vector3();
  const p = new Vector3();
  const rng = new Rng(4242);

  const barkMat = new MeshLambertMaterial({ map: bark, color: '#b8a48c' });
  bark.repeat.set(2, 5);
  const foliageMat = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
  addNearFade(foliageMat, 1.5, 4.5);

  // Troncos
  const canopyTrunks = new InstanceBatch();
  const giantTrunks = new InstanceBatch();
  const palmTrunks = new InstanceBatch();
  const buttress = new InstanceBatch();
  const trunkTint = new Color();
  for (const t of data.trunks) {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    p.set(t.x, t.y0, t.z);
    s.set(t.r, t.y1 - t.y0 + 0.6, t.r);
    m.compose(p, q, s);
    trunkTint.setHSL(0.08 + rng.range(-0.02, 0.02), rng.range(0.15, 0.3), rng.range(0.42, 0.6));
    if (t.kind === 'canopy') canopyTrunks.add(m, trunkTint);
    else if (t.kind === 'palm') palmTrunks.add(m, trunkTint.setHSL(0.1, 0.12, rng.range(0.5, 0.62)));
    else if (t.kind === 'giant' || t.kind === 'ancestral') {
      giantTrunks.add(m, trunkTint.setHSL(0.09, 0.12, rng.range(0.6, 0.7)));
      const planks = t.kind === 'ancestral' ? 9 : 6;
      for (let i = 0; i < planks; i++) {
        const a = (i / planks) * TAU + rng.range(-0.2, 0.2);
        q.setFromAxisAngle(UP, -a);
        p.set(t.x + Math.cos(a) * t.r * 0.5, t.y0 + 0.3, t.z + Math.sin(a) * t.r * 0.5);
        s.set(t.r * 0.5 + t.buttress + rng.range(0.8, 1.6), t.buttress * 2.4 + rng.range(1, 2.5), 0.35 + t.r * 0.08);
        m.compose(p, q, s);
        buttress.add(m, trunkTint);
      }
    }
  }
  group.add(canopyTrunks.build(trunkGeometry(noise, 0.72, 0.35, 9, 4), barkMat, { cast: true, receive: true, name: 'trunks' }));
  group.add(giantTrunks.build(trunkGeometry(noise, 0.6, 0.9, 16, 10), barkMat, { cast: true, receive: true, name: 'giants' }));
  group.add(palmTrunks.build(trunkGeometry(noise, 0.8, 0.5, 6, 3), barkMat, { cast: true, receive: true, name: 'palms' }));
  group.add(buttress.build(buttressGeometry(), barkMat, { cast: true, receive: true, name: 'buttress' }));

  // Ramas y troncos caídos
  const branchGeo = new CylinderGeometry(0.55, 1, 1, 7, 1, false);
  branchGeo.translate(0, 0.5, 0);
  const br = new InstanceBatch();
  const dir = new Vector3();
  for (const b of [...data.branches, ...data.logs]) {
    dir.subVectors(b.b, b.a);
    const len = dir.length();
    dir.divideScalar(len);
    q.setFromUnitVectors(UP, dir);
    s.set(b.r * 1.15, len + 0.3, b.r * 1.15);
    m.compose(b.a, q, s);
    br.add(m, trunkTint.setHSL(0.08, 0.2, rng.range(0.4, 0.55)));
  }
  group.add(br.build(branchGeo, barkMat, { cast: true, receive: true, name: 'branches' }));

  // Copas
  const cg = crownGeometry(noise);
  const crowns = new InstanceBatch();
  for (const bl of data.blobs) {
    q.setFromAxisAngle(UP, bl.rot);
    p.set(bl.x, bl.y, bl.z);
    s.set(bl.sx, bl.sy, bl.sz);
    m.compose(p, q, s);
    crowns.add(m, bl.color);
  }
  group.add(crowns.build(cg, foliageMat, { cast: true, receive: false, name: 'crowns' }));

  // Hojas de palmera
  const frondTex = frondTexture(30, '#3d8a2a');
  const frondMat = new MeshLambertMaterial({ map: frondTex, alphaTest: 0.45, side: DoubleSide });
  addNearFade(frondMat, 1.5, 4);
  const fronds = new InstanceBatch();
  for (const t of data.palms) {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    p.set(t.x, t.y1 + 0.2, t.z);
    const k = rng.range(0.8, 1.15);
    s.set(k, k, k);
    m.compose(p, q, s);
    fronds.add(m, trunkTint.setHSL(0.27 + rng.range(-0.03, 0.03), 0.5, rng.range(0.55, 0.75)));
  }
  group.add(fronds.build(palmCrownGeometry(), frondMat, { cast: true, receive: false, name: 'fronds' }));

  return { group, foliageMaterial: foliageMat, crownGeometry: cg };
}
