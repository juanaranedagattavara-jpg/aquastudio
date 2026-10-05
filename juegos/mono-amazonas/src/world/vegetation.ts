import {
  BufferGeometry, Color, ConeGeometry, CylinderGeometry, DodecahedronGeometry, DoubleSide, Float32BufferAttribute,
  Group, Matrix4, MeshLambertMaterial, Quaternion, Texture, Vector3, BufferAttribute,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TAU } from '../core/math';
import type { Noise2D } from '../core/noise';
import { Rng } from '../core/random';
import type { SpatialHash } from '../core/spatial';
import { InstanceBatch } from './instancing';
import type { Terrain } from './terrain';
import type { Camp, Trunk } from './types';
import { addNearFade } from './nearFade';
import { frondTexture } from './textures';

const UP = new Vector3(0, 1, 0);

/** Planta de hojas arqueadas (helecho / hoja ancha) como tiras con textura alfa. */
function arcPlant(count: number, length: number, width: number, lift: number, droop: number, segs = 4): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let f = 0; f < count; f++) {
    const a = (f / count) * TAU + (f % 2) * 0.35;
    const dx = Math.cos(a), dz = Math.sin(a);
    const sx = -dz, sz = dx;
    const L = length * (0.8 + ((f * 37) % 10) / 25);
    const base = positions.length / 3;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const r = t * L * 0.75;
      const y = Math.sin(t * Math.PI * 0.5) * lift * L - t * t * droop * L;
      const w = width * 0.5;
      positions.push(dx * r - sx * w, y, dz * r - sz * w, dx * r + sx * w, y, dz * r + sz * w);
      uvs.push(0, t, 1, t);
      if (i < segs) {
        const k = base + i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // normales hacia arriba: iluminación más suave y uniforme en hojas finas
  const n = g.attributes.normal as BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * 0.3, 1, n.getZ(i) * 0.3);
  return g;
}

function colorize(g: BufferGeometry, c: Color): BufferGeometry {
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new BufferAttribute(arr, 3));
  return g;
}

function heliconiaGeometry(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const stem = new CylinderGeometry(0.03, 0.045, 1.6, 5);
  stem.translate(0, 0.8, 0);
  parts.push(colorize(stem.toNonIndexed(), new Color('#3d6b2a')));
  for (let i = 0; i < 6; i++) {
    const cone = new ConeGeometry(0.07, 0.32, 5);
    cone.rotateZ((i % 2 ? 1 : -1) * 1.1);
    cone.translate((i % 2 ? -1 : 1) * 0.1, 0.9 + i * 0.12, 0);
    parts.push(colorize(cone.toNonIndexed(), new Color(i === 5 ? '#f0c020' : '#d8242a')));
  }
  for (let i = 0; i < 3; i++) {
    const leaf = new ConeGeometry(0.12, 1.2, 4);
    leaf.scale(1, 1, 0.2);
    leaf.rotateZ(0.5 + i * 0.1);
    leaf.rotateY(i * 2.1);
    leaf.translate(0, 0.7, 0);
    parts.push(colorize(leaf.toNonIndexed(), new Color('#2f6a24')));
  }
  return mergeGeometries(parts)!;
}

function rockGeometry(noise: Noise2D): BufferGeometry {
  const g = new DodecahedronGeometry(1, 1);
  const pos = g.attributes.position as BufferAttribute;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 0.75 + 0.4 * (noise.noise(v.x * 2.1 + 9, v.z * 2.1 + v.y) * 0.5 + 0.5);
    pos.setXYZ(i, v.x * k, v.y * k * 0.7, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

export function buildVegetation(
  terrain: Terrain, noise: Noise2D, trunks: SpatialHash<Trunk>, camps: Camp[], leafTex: Texture,
): Group {
  const rng = new Rng(31337);
  const group = new Group();
  group.name = 'vegetation';
  const m = new Matrix4();
  const q = new Quaternion();
  const s = new Vector3();
  const p = new Vector3();
  const col = new Color();
  const tmp: Trunk[] = [];

  const ferns = new InstanceBatch();
  const broad = new InstanceBatch();
  const bushes = new InstanceBatch();
  const helis = new InstanceBatch();
  const rocks = new InstanceBatch();

  const free = (x: number, z: number, pad: number): boolean => {
    trunks.query(x, z, 5, tmp);
    for (const t of tmp) if (Math.hypot(t.x - x, t.z - z) < t.r + t.buttress * 0.6 + pad) return false;
    for (const c of camps) if (Math.hypot(c.x - x, c.z - z) < 8) return false;
    return true;
  };

  const place = (n: number, minH: number, nearWater: number, cb: (x: number, z: number, y: number) => void): void => {
    let placed = 0;
    for (let tries = 0; tries < n * 6 && placed < n; tries++) {
      const x = rng.range(-245, 245), z = rng.range(-245, 245);
      const y = terrain.heightAt(x, z);
      if (y < minH) continue;
      const clump = noise.noise(x * 0.04 + 7, z * 0.04 - 3) * 0.5 + 0.5;
      const w = terrain.distanceToWater(x, z);
      const bias = w < 25 ? nearWater : 0;
      if (rng.next() > clump * 0.85 + 0.15 + bias) continue;
      if (!free(x, z, 0.4)) continue;
      cb(x, z, y);
      placed++;
    }
  };

  place(2600, 0.2, 0.3, (x, z, y) => {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    const k = rng.range(0.7, 1.6);
    m.compose(p.set(x, y - 0.05, z), q, s.set(k, k * rng.range(0.8, 1.2), k));
    ferns.add(m, col.setHSL(0.27 + rng.range(-0.04, 0.03), rng.range(0.45, 0.65), rng.range(0.42, 0.62)));
  });
  place(950, 0.3, 0.4, (x, z, y) => {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    const k = rng.range(0.8, 1.9);
    m.compose(p.set(x, y - 0.05, z), q, s.set(k, k, k));
    broad.add(m, col.setHSL(0.28 + rng.range(-0.03, 0.03), rng.range(0.4, 0.6), rng.range(0.5, 0.7)));
  });
  place(650, 0.4, 0, (x, z, y) => {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    const k = rng.range(0.6, 1.4);
    m.compose(p.set(x, y - 0.05, z), q, s.set(k * 1.1, k * 1.15, k * 1.1));
    bushes.add(m, col.setHSL(0.27 + rng.range(-0.04, 0.04), rng.range(0.45, 0.6), rng.range(0.32, 0.45)));
  });
  place(300, 0.3, 0.5, (x, z, y) => {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    const k = rng.range(0.8, 1.4);
    m.compose(p.set(x, y - 0.05, z), q, s.set(k, k, k));
    helis.add(m);
  });
  place(260, -1.5, 0.6, (x, z, y) => {
    q.setFromAxisAngle(UP, rng.range(0, TAU));
    const k = rng.range(0.3, 1.4);
    m.compose(p.set(x, y + k * 0.1, z), q, s.set(k * rng.range(0.9, 1.6), k, k));
    rocks.add(m, col.setHSL(0.08, rng.range(0.05, 0.15), rng.range(0.32, 0.45)));
  });

  const fernMat = new MeshLambertMaterial({ map: frondTexture(18, '#4a9a35'), alphaTest: 0.45, side: DoubleSide });
  const broadMat = new MeshLambertMaterial({ map: leafTex, alphaTest: 0.45, side: DoubleSide });
  const heliMat = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const rockMat = new MeshLambertMaterial({ color: '#c8c0b0', flatShading: true });
  for (const mm of [fernMat, broadMat, heliMat]) addNearFade(mm, 1.2, 3.4);
  const shrubGeo = mergeGeometries([arcPlant(8, 1.15, 0.7, 1.7, 0.2, 3), arcPlant(6, 0.8, 0.6, 2.4, 0.05, 2)])!;

  group.add(ferns.build(arcPlant(7, 1.4, 0.55, 0.9, 0.6, 3), fernMat, { receive: true, name: 'ferns' }));
  group.add(broad.build(arcPlant(5, 1.5, 0.75, 1.0, 0.5, 3), broadMat, { receive: true, name: 'broadleaf' }));
  group.add(bushes.build(shrubGeo, broadMat, { receive: true, name: 'bushes' }));
  group.add(helis.build(heliconiaGeometry(), heliMat, { name: 'heliconia' }));
  group.add(rocks.build(rockGeometry(noise), rockMat, { receive: true, cast: true, name: 'rocks' }));
  return group;
}
