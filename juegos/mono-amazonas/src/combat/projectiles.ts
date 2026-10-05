import {
  BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, Mesh, MeshStandardMaterial, PlaneGeometry,
  Quaternion, SphereGeometry, Vector3, DoubleSide,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ARROW_GRAVITY, NUT_GRAVITY, POWERS, WATER_LEVEL } from '../config';
import { distToSegmentSq, segmentCircleXZ, segmentSphereHit } from '../core/math';
import type { GameContext } from '../game/context';
import type { Trunk } from '../world/types';

const FWD = new Vector3(0, 0, 1);

interface Arrow {
  mesh: Mesh;
  pos: Vector3;
  vel: Vector3;
  state: 'fly' | 'stuck' | 'bounce' | 'off';
  age: number;
  whizzed: boolean;
}

interface Nut {
  mesh: Mesh;
  pos: Vector3;
  vel: Vector3;
  state: 'fly' | 'off';
  age: number;
  bounces: number;
}

function paint(g: BufferGeometry, c: string): BufferGeometry {
  const col = new Color(c);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([col.r, col.g, col.b], i * 3);
  g.setAttribute('color', new BufferAttribute(arr, 3));
  return g;
}

function arrowGeometry(): BufferGeometry {
  const shaft = new CylinderGeometry(0.011, 0.011, 0.86, 5).rotateX(Math.PI / 2);
  const head = new ConeGeometry(0.026, 0.11, 5).rotateX(Math.PI / 2).translate(0, 0, 0.48);
  const f1 = new PlaneGeometry(0.06, 0.16).rotateX(Math.PI / 2).translate(0, 0, -0.36);
  const f2 = new PlaneGeometry(0.06, 0.16).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, 0, -0.36);
  const parts = [paint(shaft.toNonIndexed(), '#c9a978'), paint(head.toNonIndexed(), '#3a3a3a'),
    paint(f1.toNonIndexed(), '#d0281c'), paint(f2.toNonIndexed(), '#f2c018')];
  return mergeGeometries(parts)!;
}

/** Flechas de los cazadores y castañas que lanza el mono. */
export class Projectiles {
  private arrows: Arrow[] = [];
  private nuts: Nut[] = [];
  private q = new Quaternion();
  private p0 = new Vector3();
  private dir = new Vector3();
  private tmp = new Vector3();
  private trunks: Trunk[] = [];

  constructor(private ctx: GameContext) {
    const ag = arrowGeometry();
    const am = new MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: DoubleSide });
    for (let i = 0; i < 44; i++) {
      const mesh = new Mesh(ag, am);
      mesh.visible = false;
      mesh.castShadow = true;
      ctx.scene.add(mesh);
      this.arrows.push({ mesh, pos: new Vector3(), vel: new Vector3(), state: 'off', age: 0, whizzed: false });
    }
    const ng = new SphereGeometry(0.13, 10, 8);
    const nm = new MeshStandardMaterial({ color: '#6a4222', roughness: 0.6 });
    for (let i = 0; i < 12; i++) {
      const mesh = new Mesh(ng, nm);
      mesh.scale.set(1, 0.9, 1.1);
      mesh.visible = false;
      mesh.castShadow = true;
      ctx.scene.add(mesh);
      this.nuts.push({ mesh, pos: new Vector3(), vel: new Vector3(), state: 'off', age: 0, bounces: 0 });
    }
  }

  reset(): void {
    for (const a of this.arrows) {
      a.state = 'off';
      a.mesh.visible = false;
    }
    for (const n of this.nuts) {
      n.state = 'off';
      n.mesh.visible = false;
    }
  }

  fireArrow(from: Vector3, vel: Vector3): void {
    let a = this.arrows.find((x) => x.state === 'off');
    if (!a) a = this.arrows.reduce((o, x) => (x.state === 'stuck' && x.age > o.age ? x : o), this.arrows[0]);
    a.pos.copy(from);
    a.vel.copy(vel);
    a.state = 'fly';
    a.age = 0;
    a.whizzed = false;
    a.mesh.visible = true;
    (a.mesh.material as MeshStandardMaterial).opacity = 1;
    this.orient(a);
  }

  throwNut(from: Vector3, vel: Vector3): void {
    const n = this.nuts.find((x) => x.state === 'off') ?? this.nuts[0];
    n.pos.copy(from);
    n.vel.copy(vel);
    n.state = 'fly';
    n.age = 0;
    n.bounces = 0;
    n.mesh.visible = true;
  }

  private orient(a: Arrow): void {
    this.dir.copy(a.vel).normalize();
    this.q.setFromUnitVectors(FWD, this.dir);
    a.mesh.quaternion.copy(this.q);
    a.mesh.position.copy(a.pos);
  }

  update(enemyDt: number, dt: number): void {
    for (const a of this.arrows) if (a.state !== 'off') this.updateArrow(a, enemyDt);
    for (const n of this.nuts) if (n.state !== 'off') this.updateNut(n, dt);
  }

  private updateArrow(a: Arrow, dt: number): void {
    const ctx = this.ctx;
    const w = ctx.world;
    a.age += dt;
    if (a.state === 'stuck') {
      if (a.age > 12) {
        a.state = 'off';
        a.mesh.visible = false;
      }
      return;
    }
    if (a.state === 'bounce') {
      a.vel.y -= ARROW_GRAVITY * dt;
      a.pos.addScaledVector(a.vel, dt);
      a.mesh.position.copy(a.pos);
      a.mesh.rotation.x += dt * 14;
      a.mesh.rotation.y += dt * 9;
      if (a.age > 1.6 || a.pos.y < w.groundHeight(a.pos.x, a.pos.z)) {
        a.state = 'off';
        a.mesh.visible = false;
      }
      return;
    }

    this.p0.copy(a.pos);
    a.vel.y -= ARROW_GRAVITY * dt;
    a.pos.addScaledVector(a.vel, dt);

    // jugador
    const p = ctx.player;
    if (!p.dead) {
      const t = segmentSphereHit(this.p0, a.pos, p.center, 0.48);
      if (t >= 0) {
        const r = p.takeDamage(ctx.diff.arrowDamage, this.p0, 'arrow');
        if (r === 'blocked') {
          a.pos.lerpVectors(this.p0, a.pos, t);
          a.vel.multiplyScalar(-0.22).add(this.tmp.set(Math.random() - 0.5, 3, Math.random() - 0.5));
          a.state = 'bounce';
          a.age = 0;
          ctx.audio.play('tink', { at: a.pos });
          ctx.fx.sparks(a.pos, POWERS.cupuacu.css, 12);
          return;
        }
        if (r === 'hit') {
          a.state = 'off';
          a.mesh.visible = false;
          ctx.fx.sparks(p.center, '#ff6040', 8);
          return;
        }
      } else if (!a.whizzed && a.age > 0.05) {
        const d2 = distToSegmentSq(p.center, this.p0, a.pos);
        if (d2 < 2.6 * 2.6) {
          a.whizzed = true;
          ctx.audio.play('whiz', { at: p.center, vol: 0.8 });
        }
      }
    }

    // troncos
    const mx = (this.p0.x + a.pos.x) / 2, mz = (this.p0.z + a.pos.z) / 2;
    w.trunkHash.query(mx, mz, 4, this.trunks);
    for (const tr of this.trunks) {
      const r = w.trunkRadiusAt(tr, a.pos.y);
      const th = segmentCircleXZ(this.p0.x, this.p0.z, a.pos.x, a.pos.z, tr.x, tr.z, r);
      if (th < 0) continue;
      const y = this.p0.y + (a.pos.y - this.p0.y) * th;
      if (y < tr.y0 || y > tr.y1) continue;
      a.pos.lerpVectors(this.p0, a.pos, th);
      this.dir.copy(a.vel).normalize();
      a.pos.addScaledVector(this.dir, 0.2);
      this.stick(a, true);
      return;
    }
    // suelo y agua
    const g = w.groundHeight(a.pos.x, a.pos.z);
    if (a.pos.y < g) {
      if (g < WATER_LEVEL) {
        a.state = 'off';
        a.mesh.visible = false;
        ctx.fx.splash(this.tmp.copy(a.pos).setY(WATER_LEVEL), 6);
        return;
      }
      a.pos.y = g + 0.05;
      this.stick(a, false);
      return;
    }
    if (a.pos.y < WATER_LEVEL && w.isDeepWater(a.pos.x, a.pos.z)) {
      a.state = 'off';
      a.mesh.visible = false;
      ctx.fx.splash(this.tmp.copy(a.pos).setY(WATER_LEVEL), 6);
      return;
    }
    if (a.age > 6) {
      a.state = 'off';
      a.mesh.visible = false;
      return;
    }
    this.orient(a);
  }

  private stick(a: Arrow, wood: boolean): void {
    a.state = 'stuck';
    a.age = 0;
    this.orient(a);
    const d = a.pos.distanceTo(this.ctx.player.pos);
    if (d < 40) this.ctx.audio.play('thunk', { at: a.pos, vol: wood ? 0.8 : 0.4 });
  }

  private updateNut(n: Nut, dt: number): void {
    const ctx = this.ctx;
    const w = ctx.world;
    n.age += dt;
    this.p0.copy(n.pos);
    n.vel.y -= NUT_GRAVITY * dt;
    n.pos.addScaledVector(n.vel, dt);
    n.mesh.rotation.x += dt * 12;
    n.mesh.rotation.z += dt * 7;

    // cazadores
    for (const h of ctx.hunters.hunters) {
      if (!h.active) continue;
      this.tmp.copy(h.pos);
      this.tmp.y += 1.15;
      if (segmentSphereHit(this.p0, n.pos, this.tmp, 0.6) >= 0) {
        h.hit(1, this.p0, 4, 1.5, 'castaña');
        ctx.audio.play('punch', { at: n.pos });
        ctx.fx.sparks(n.pos, '#ffd27a', 10);
        n.state = 'off';
        n.mesh.visible = false;
        return;
      }
    }
    // troncos: rebote
    w.trunkHash.query(n.pos.x, n.pos.z, 3, this.trunks);
    for (const tr of this.trunks) {
      if (n.pos.y < tr.y0 || n.pos.y > tr.y1) continue;
      const r = w.trunkRadiusAt(tr, n.pos.y) + 0.13;
      const dx = n.pos.x - tr.x, dz = n.pos.z - tr.z;
      const d = Math.hypot(dx, dz);
      if (d < r) {
        const nx = dx / (d || 1), nz = dz / (d || 1);
        n.pos.x = tr.x + nx * r;
        n.pos.z = tr.z + nz * r;
        const vn = n.vel.x * nx + n.vel.z * nz;
        if (vn < 0) {
          n.vel.x -= 1.6 * vn * nx;
          n.vel.z -= 1.6 * vn * nz;
        }
        this.impact(n);
      }
    }
    // suelo
    const g = w.groundHeight(n.pos.x, n.pos.z);
    if (n.pos.y < g + 0.12) {
      if (g < WATER_LEVEL - 0.2) {
        ctx.fx.splash(this.tmp.copy(n.pos).setY(WATER_LEVEL), 8);
        ctx.audio.play('splash', { at: n.pos, vol: 0.3 });
        ctx.noise(n.pos, 12);
        n.state = 'off';
        n.mesh.visible = false;
        return;
      }
      n.pos.y = g + 0.12;
      n.vel.y = Math.abs(n.vel.y) * 0.35;
      n.vel.x *= 0.55;
      n.vel.z *= 0.55;
      this.impact(n);
    }
    if (n.age > 5 || n.bounces > 4) {
      n.state = 'off';
      n.mesh.visible = false;
      return;
    }
    n.mesh.position.copy(n.pos);
  }

  private impact(n: Nut): void {
    n.bounces++;
    if (n.bounces === 1) {
      // el golpe hace ruido: sirve para distraer a los cazadores
      this.ctx.noise(n.pos, 16);
      this.ctx.audio.play('thunk', { at: n.pos, vol: 0.6 });
      this.ctx.fx.dust(n.pos, 5, 0.5);
    }
  }
}
