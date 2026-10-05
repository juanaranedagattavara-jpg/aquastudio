import {
  BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, IcosahedronGeometry, QuadraticBezierCurve3,
  SphereGeometry, TubeGeometry, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { PowerKind } from '../config';
import { Rng } from '../core/random';

export type FruitKind = PowerKind | 'golden' | 'banana' | 'castanha';

function col(g: BufferGeometry, c: string): BufferGeometry {
  const ng = g.index ? g.toNonIndexed() : g;
  const color = new Color(c);
  const n = ng.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([color.r, color.g, color.b], i * 3);
  ng.setAttribute('color', new BufferAttribute(arr, 3));
  ng.deleteAttribute('uv');
  return ng;
}

const sphere = (r: number, x: number, y: number, z: number, c: string, sx = 1, sy = 1, sz = 1): BufferGeometry =>
  col(new SphereGeometry(r, 10, 8).scale(sx, sy, sz).translate(x, y, z), c);

const stem = (h: number, y: number, c = '#4a5a22'): BufferGeometry =>
  col(new CylinderGeometry(0.012, 0.016, h, 5).translate(0, y, 0), c);

const leaf = (x: number, y: number, z: number, rot: number): BufferGeometry =>
  col(new ConeGeometry(0.06, 0.22, 4).scale(1, 1, 0.25).rotateZ(rot).translate(x, y, z), '#3f8a2a');

const cache = new Map<FruitKind, BufferGeometry>();

/** Geometría (con colores por vértice) de cada fruta, fusionada en una sola malla. */
export function fruitGeometry(kind: FruitKind): BufferGeometry {
  const hit = cache.get(kind);
  if (hit) return hit;
  const rng = new Rng(kind.length * 31 + kind.charCodeAt(0));
  const parts: BufferGeometry[] = [];
  switch (kind) {
    case 'golden': {
      parts.push(col(new IcosahedronGeometry(0.3, 1).scale(1, 1.15, 1), '#ffd23a'));
      parts.push(stem(0.16, 0.36));
      parts.push(leaf(0.1, 0.4, 0, -1.0), leaf(-0.1, 0.42, 0, 1.0));
      break;
    }
    case 'acai': {
      // racimo de bayas moradas colgando de un raquis
      parts.push(stem(0.5, 0.05));
      for (let i = 0; i < 22; i++) {
        const t = rng.next();
        const a = rng.range(0, Math.PI * 2);
        const r = 0.05 + (1 - t) * 0.1;
        parts.push(sphere(0.045, Math.cos(a) * r, -0.15 + t * 0.35, Math.sin(a) * r, i % 4 ? '#3c1452' : '#5a2070'));
      }
      break;
    }
    case 'guarana': {
      // frutos rojos abiertos que parecen ojos
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const x = Math.cos(a) * 0.12, z = Math.sin(a) * 0.12, y = (i % 2) * 0.08;
        parts.push(sphere(0.095, x, y, z, '#d4261a'));
        const ox = Math.cos(a) * 0.06, oz = Math.sin(a) * 0.06;
        parts.push(sphere(0.06, x + ox, y + 0.02, z + oz, '#f6f1e6'));
        parts.push(sphere(0.038, x + ox * 1.55, y + 0.025, z + oz * 1.55, '#111111'));
      }
      parts.push(stem(0.3, 0.2));
      break;
    }
    case 'cupuacu': {
      parts.push(sphere(0.17, 0, 0, 0, '#7b5230', 1, 1.45, 1));
      parts.push(sphere(0.12, 0, 0.05, 0.07, '#8e6038', 1, 1.2, 1));
      parts.push(stem(0.12, 0.28));
      break;
    }
    case 'maracuja': {
      parts.push(sphere(0.14, 0, 0, 0, '#e9c53a', 1, 1.08, 1));
      for (let i = 0; i < 8; i++) {
        const a = rng.range(0, Math.PI * 2), b = rng.range(-1, 1);
        parts.push(sphere(0.012, Math.cos(a) * 0.13 * Math.sqrt(1 - b * b), b * 0.14, Math.sin(a) * 0.13 * Math.sqrt(1 - b * b), '#f6e9b0'));
      }
      parts.push(stem(0.1, 0.18), leaf(0.07, 0.2, 0, -1.2));
      break;
    }
    case 'camu': {
      parts.push(stem(0.3, 0.12));
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        parts.push(sphere(0.065, Math.cos(a) * 0.1, (i % 3) * 0.05 - 0.03, Math.sin(a) * 0.1, i % 2 ? '#b0103a' : '#7a0e3a'));
      }
      break;
    }
    case 'jabuticaba': {
      // crecen pegadas al tronco
      parts.push(col(new CylinderGeometry(0.07, 0.08, 0.5, 7), '#7a6a58'));
      for (let i = 0; i < 12; i++) {
        const a = rng.range(0, Math.PI * 2);
        parts.push(sphere(0.05, Math.cos(a) * 0.11, rng.range(-0.2, 0.2), Math.sin(a) * 0.11, '#1d0f24'));
      }
      break;
    }
    case 'banana': {
      parts.push(stem(0.3, 0.18, '#5a6a28'));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const d = new Vector3(Math.cos(a), 0, Math.sin(a));
        const c = new QuadraticBezierCurve3(
          new Vector3(0, 0.05, 0), d.clone().multiplyScalar(0.16).setY(-0.02), d.clone().multiplyScalar(0.2).setY(0.2),
        );
        parts.push(col(new TubeGeometry(c, 6, 0.035, 5), '#f2d040'));
      }
      break;
    }
    case 'castanha': {
      parts.push(sphere(0.14, 0, 0, 0, '#5a3a1e', 1, 0.92, 1));
      parts.push(col(new CylinderGeometry(0.06, 0.06, 0.03, 8).translate(0, 0.125, 0), '#3a2412'));
      break;
    }
  }
  const g = mergeGeometries(parts)!;
  g.computeVertexNormals();
  cache.set(kind, g);
  return g;
}
