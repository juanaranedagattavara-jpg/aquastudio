import {
  AdditiveBlending, CatmullRomCurve3, Color, ConeGeometry, CylinderGeometry, DodecahedronGeometry, Group, Mesh,
  MeshBasicMaterial, MeshLambertMaterial, SphereGeometry, Sprite, SpriteMaterial, Texture, TubeGeometry, Vector3,
} from 'three';
import { TAU } from '../core/math';
import { Rng } from '../core/random';
import type { Terrain } from './terrain';
import type { Camp, Platform, Trunk } from './types';

/** Elige posiciones de campamento bien repartidas, lejos del inicio y del agua. */
export function chooseCamps(
  terrain: Terrain, start: { x: number; z: number }, ancestral: { x: number; z: number },
): Camp[] {
  const rng = new Rng(808);
  const camps: Camp[] = [];
  for (let i = 0; i < 2000 && camps.length < 4; i++) {
    const x = rng.range(-195, 195), z = rng.range(-195, 195);
    if (terrain.distanceToWater(x, z) < 22) continue;
    if (Math.hypot(x - start.x, z - start.z) < 95) continue;
    if (Math.hypot(x - ancestral.x, z - ancestral.z) < 60) continue;
    if (camps.some((c) => Math.hypot(c.x - x, c.z - z) < 115)) continue;
    camps.push({ x, z, y: terrain.heightAt(x, z) });
  }
  return camps;
}

export interface CampMeshes {
  group: Group;
  colliders: Trunk[];
  platforms: Platform[];
  fires: Vector3[];
  update(time: number): void;
}

export function buildCamps(camps: Camp[], terrain: Terrain, thatch: Texture, glow: Texture): CampMeshes {
  const group = new Group();
  group.name = 'camps';
  const colliders: Trunk[] = [];
  const platforms: Platform[] = [];
  const fires: Vector3[] = [];
  const flames: Mesh[] = [];
  const glows: Sprite[] = [];
  const rng = new Rng(4040);

  const thatchMat = new MeshLambertMaterial({ map: thatch });
  const wallMat = new MeshLambertMaterial({ map: thatch, color: '#9a8466' });
  const woodMat = new MeshLambertMaterial({ color: '#5a3d24' });
  const stoneMat = new MeshLambertMaterial({ color: '#6d665c', flatShading: true });
  const potMat = new MeshLambertMaterial({ color: '#8a4a2a' });
  const hammockMat = new MeshLambertMaterial({ color: '#b5532a' });
  const flameMat = new MeshBasicMaterial({ color: '#ffb33a', transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false });
  const flameMat2 = new MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.85, blending: AdditiveBlending, depthWrite: false });

  for (const c of camps) {
    const camp = new Group();
    camp.position.set(c.x, c.y, c.z);
    group.add(camp);

    // Maloca (casa comunal) de paja
    const ha = rng.range(0, TAU);
    const hx = Math.cos(ha) * 7, hz = Math.sin(ha) * 7;
    const hy = terrain.heightAt(c.x + hx, c.z + hz) - c.y;
    const walls = new Mesh(new CylinderGeometry(3.3, 3.4, 1.8, 18, 1, true), wallMat);
    walls.position.set(hx, hy + 0.9, hz);
    const roof = new Mesh(new ConeGeometry(4.2, 4.4, 18, 1, true), thatchMat);
    roof.position.set(hx, hy + 1.7 + 2.2, hz);
    const door = new Mesh(new CylinderGeometry(3.42, 3.42, 1.5, 18, 1, true, -0.25, 0.5), new MeshLambertMaterial({ color: '#1a120b' }));
    door.position.set(hx, hy + 0.75, hz);
    door.rotation.y = -ha + Math.PI / 2;
    for (const mm of [walls, roof]) {
      mm.castShadow = true;
      mm.receiveShadow = true;
    }
    camp.add(walls, roof, door);
    const gy = c.y + hy;
    colliders.push({
      x: c.x + hx, z: c.z + hz, r: 3.4, y0: gy - 0.5, y1: gy + 1.9, kind: 'hut', climbable: false,
      buttress: 0, taper: 1, platform: null,
    });
    platforms.push({ x: c.x + hx, z: c.z + hz, y: gy + 6.0, R: 4.2, sag: 4.3, kind: 'roof', cone: true });

    // Hoguera
    const fy = 0;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU;
      const st = new Mesh(new DodecahedronGeometry(0.22, 0), stoneMat);
      st.position.set(Math.cos(a) * 0.75, fy + 0.08, Math.sin(a) * 0.75);
      camp.add(st);
    }
    for (let i = 0; i < 4; i++) {
      const log = new Mesh(new CylinderGeometry(0.08, 0.1, 1.2, 6), woodMat);
      log.rotation.z = 1.2;
      log.rotation.y = (i / 4) * TAU;
      log.position.y = 0.25;
      camp.add(log);
    }
    const f1 = new Mesh(new ConeGeometry(0.35, 1.0, 7), flameMat2);
    f1.position.y = 0.55;
    const f2 = new Mesh(new ConeGeometry(0.2, 0.7, 7), flameMat);
    f2.position.y = 0.5;
    camp.add(f1, f2);
    flames.push(f1, f2);
    const sp = new Sprite(new SpriteMaterial({ map: glow, color: '#ff8a30', transparent: true, opacity: 0.6, blending: AdditiveBlending, depthWrite: false }));
    sp.scale.setScalar(4);
    sp.position.y = 0.8;
    camp.add(sp);
    glows.push(sp);
    fires.push(new Vector3(c.x, c.y + 0.9, c.z));

    // Bancos de troncos
    for (let i = 0; i < 2; i++) {
      const a = ha + Math.PI * 0.5 + i * Math.PI;
      const seat = new Mesh(new CylinderGeometry(0.25, 0.25, 2.2, 8), woodMat);
      seat.rotation.z = Math.PI / 2;
      seat.rotation.y = a;
      seat.position.set(Math.cos(a) * 2.4, 0.25, Math.sin(a) * 2.4);
      seat.castShadow = true;
      camp.add(seat);
    }

    // Hamaca entre dos postes
    const ra = ha + Math.PI + rng.range(-0.4, 0.4);
    const rx = Math.cos(ra) * 6, rz = Math.sin(ra) * 6;
    const px = -Math.sin(ra) * 1.6, pz = Math.cos(ra) * 1.6;
    for (const s of [-1, 1]) {
      const post = new Mesh(new CylinderGeometry(0.1, 0.12, 2.2, 6), woodMat);
      post.position.set(rx + px * s, 1.1, rz + pz * s);
      post.castShadow = true;
      camp.add(post);
    }
    const curve = new CatmullRomCurve3([
      new Vector3(rx - px, 1.8, rz - pz),
      new Vector3(rx - px * 0.4, 1.05, rz - pz * 0.4),
      new Vector3(rx + px * 0.4, 1.05, rz + pz * 0.4),
      new Vector3(rx + px, 1.8, rz + pz),
    ]);
    const ham = new Mesh(new TubeGeometry(curve, 16, 0.22, 6), hammockMat);
    ham.castShadow = true;
    camp.add(ham);

    // Vasijas de barro
    for (let i = 0; i < 3; i++) {
      const a = ha - 0.6 + i * 0.35;
      const pot = new Mesh(new SphereGeometry(0.3, 10, 8), potMat);
      pot.scale.set(1, 0.8 + i * 0.1, 1);
      pot.position.set(hx + Math.cos(a) * 4.2, hy + 0.25, hz + Math.sin(a) * 4.2);
      camp.add(pot);
    }
  }

  const tint = new Color();
  return {
    group, colliders, platforms, fires,
    update(time: number): void {
      flames.forEach((f, i) => {
        const k = 0.85 + Math.sin(time * 13 + i * 1.7) * 0.1 + Math.sin(time * 23 + i) * 0.06;
        f.scale.set(1, k * (1 + (i % 2) * 0.15), 1);
      });
      glows.forEach((g, i) => {
        g.material.opacity = 0.5 + Math.sin(time * 9 + i * 3) * 0.08;
        g.material.color.copy(tint.setHSL(0.07 + Math.sin(time * 5 + i) * 0.01, 1, 0.55));
      });
    },
  };
}
