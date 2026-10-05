import {
  BufferAttribute, Color, Mesh, MeshLambertMaterial, PlaneGeometry, Texture,
} from 'three';
import { clamp, smoothstep } from '../core/math';
import type { Noise2D } from '../core/noise';
import { WORLD_HALF } from '../config';

/**
 * Terreno: colinas suaves de selva baja cruzadas por un río serpenteante
 * (un afluente del Amazonas) y montañas en el borde que cierran el mapa.
 */
export class Terrain {
  readonly size = WORLD_HALF * 2 + 40;
  mesh!: Mesh;

  constructor(private noise: Noise2D) {}

  riverCenterZ(x: number): number {
    return 55 * Math.sin(x * 0.011 + 0.6) + 18 * Math.sin(x * 0.029 + 2.1);
  }

  private riverSlope(x: number): number {
    return 55 * 0.011 * Math.cos(x * 0.011 + 0.6) + 18 * 0.029 * Math.cos(x * 0.029 + 2.1);
  }

  riverHalfWidth(x: number): number {
    return 12 + 3 * Math.sin(x * 0.017 + 1) + 2 * Math.sin(x * 0.051);
  }

  /** Distancia aproximada (perpendicular) al eje del río. */
  riverDistance(x: number, z: number): number {
    const dz = z - this.riverCenterZ(x);
    const s = this.riverSlope(x);
    return Math.abs(dz) / Math.sqrt(1 + s * s);
  }

  /** Distancia al agua (≈0 en la orilla, negativa dentro). */
  distanceToWater(x: number, z: number): number {
    return this.riverDistance(x, z) - this.riverHalfWidth(x);
  }

  heightAt(x: number, z: number): number {
    const n = this.noise;
    const base = 5 + n.fbm(x * 0.006, z * 0.006, 4) * 5 + n.fbm(x * 0.025 + 100, z * 0.025 - 50, 3) * 1.2;
    const d = this.riverDistance(x, z);
    const hw = this.riverHalfWidth(x);
    const bed = -3.2 + 2.6 * Math.min(1, (d / hw) * (d / hw));
    const bankT = smoothstep(hw * 0.7, hw + 18, d);
    let h = bed + (base - bed) * bankT;
    const e = Math.max(Math.abs(x), Math.abs(z));
    h += smoothstep(205, 262, e) * (24 + n.noise(x * 0.02, z * 0.02) * 6);
    return h;
  }

  /** Normal aproximada por diferencias finitas (para pendientes y colores). */
  slopeAt(x: number, z: number): number {
    const e = 1;
    const dx = this.heightAt(x + e, z) - this.heightAt(x - e, z);
    const dz = this.heightAt(x, z + e) - this.heightAt(x, z - e);
    return Math.hypot(dx, dz) / (2 * e);
  }

  build(detail: Texture): Mesh {
    const seg = 216;
    const geo = new PlaneGeometry(this.size, this.size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new Color();
    const litter = new Color('#5a4630');
    const soil = new Color('#3a2e1e');
    const moss = new Color('#41592a');
    const mud = new Color('#5e4c33');
    const sand = new Color('#8f7a52');
    const wet = new Color('#3b3326');
    const hill = new Color('#3d5a2a');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = this.heightAt(x, z);
      pos.setY(i, h);
      const v = this.noise.noise(x * 0.05, z * 0.05) * 0.5 + 0.5;
      const v2 = this.noise.noise(x * 0.013 + 30, z * 0.013) * 0.5 + 0.5;
      c.copy(litter).lerp(soil, v * 0.7).lerp(moss, clamp(v2 - 0.35, 0, 1) * 0.9);
      if (h < 1.4) c.lerp(mud, smoothstep(1.4, 0.6, h));
      if (h < 0.7 && h > -0.25) c.lerp(sand, 0.45 * smoothstep(-0.25, 0.3, h) * smoothstep(0.7, 0.3, h));
      if (h < -0.25) c.copy(wet);
      const e = Math.max(Math.abs(x), Math.abs(z));
      c.lerp(hill, smoothstep(215, 250, e) * 0.6);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    detail.repeat.set(70, 70);
    const mat = new MeshLambertMaterial({ vertexColors: true, map: detail });
    this.mesh = new Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    return this.mesh;
  }
}
