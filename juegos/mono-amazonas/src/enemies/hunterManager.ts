import { Texture, Vector3 } from 'three';
import { rand } from '../core/random';
import type { GameContext } from '../game/context';
import { bodyPaintTexture } from '../world/textures';
import { Hunter } from './hunter';

/** Gestiona cazadores: aparición por oleadas, turnos de disparo, golpes y alertas compartidas. */
export class HunterManager {
  readonly hunters: Hunter[] = [];
  private drawers = new Set<Hunter>();
  private paint: Texture = bodyPaintTexture();
  private spawnTimer = 0;
  private tmp = new Vector3();
  firstSpotted = false;

  constructor(private ctx: GameContext) {}

  reset(): void {
    for (const h of this.hunters) h.dispose();
    this.hunters.length = 0;
    this.drawers.clear();
    this.firstSpotted = false;
    this.spawnInitial();
  }

  private spawnInitial(): void {
    const ctx = this.ctx;
    const w = ctx.world;
    const start = w.start;
    // dos por campamento
    for (const c of w.camps) {
      for (let i = 0; i < 2; i++) {
        const a = rand(0, Math.PI * 2);
        this.spawn(this.tmp.set(c.x + Math.cos(a) * 6, 0, c.z + Math.sin(a) * 6));
      }
    }
    // el resto repartidos por la selva, lejos del inicio
    let tries = 0;
    while (this.activeCount() < ctx.diff.baseHunters + 2 && tries++ < 400) {
      const x = rand(-215, 215), z = rand(-215, 215);
      if (Math.hypot(x - start.x, z - start.z) < 75) continue;
      if (w.groundHeight(x, z) < 0.6) continue;
      this.spawn(this.tmp.set(x, 0, z));
    }
  }

  spawn(at: Vector3): Hunter {
    const h = new Hunter(this.ctx, at, this.paint);
    this.hunters.push(h);
    return h;
  }

  activeCount(): number {
    let n = 0;
    for (const h of this.hunters) if (h.active) n++;
    return n;
  }

  update(dt: number): void {
    const ctx = this.ctx;
    for (const h of this.hunters) h.update(dt);
    for (let i = this.hunters.length - 1; i >= 0; i--) {
      if (this.hunters[i].removed) {
        this.hunters[i].dispose();
        this.hunters.splice(i, 1);
      }
    }
    // refuerzos según el progreso
    const target = Math.min(ctx.diff.maxHunters, Math.round(ctx.diff.baseHunters + 2 + ctx.stats.golden * ctx.diff.perGolden));
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.activeCount() < target && !ctx.player.dead) {
      this.spawnTimer = 9;
      this.spawnReinforcement();
    }
  }

  private spawnReinforcement(): void {
    const ctx = this.ctx;
    const p = ctx.player.pos;
    for (let i = 0; i < 30; i++) {
      const a = rand(0, Math.PI * 2), r = rand(70, 120);
      const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
      if (Math.abs(x) > 225 || Math.abs(z) > 225) continue;
      if (ctx.world.groundHeight(x, z) < 0.6) continue;
      const h = this.spawn(this.tmp.set(x, 0, z));
      // llegan rastreando la zona aproximada del mono
      h.hearNoise(this.tmp.set(p.x + rand(-25, 25), p.y, p.z + rand(-25, 25)), 9999);
      h.alert = 0.4;
      return;
    }
  }

  requestToken(h: Hunter): boolean {
    if (this.drawers.has(h)) return true;
    if (this.drawers.size >= this.ctx.diff.maxDrawers) return false;
    this.drawers.add(h);
    return true;
  }

  releaseToken(h: Hunter): void {
    this.drawers.delete(h);
  }

  onSpotted(h: Hunter): void {
    const ctx = this.ctx;
    for (const o of this.hunters) {
      if (o !== h && o.pos.distanceTo(h.pos) < 45) o.callout(ctx.player.pos);
    }
    if (!this.firstSpotted) {
      this.firstSpotted = true;
      ctx.hud.hint('¡Te han visto! Escóndete en las copas, rompe la línea de visión o pelea (clic).', 6);
    }
  }

  onKO(h: Hunter): void {
    this.releaseToken(h);
    if (Math.random() < 0.6) this.ctx.pickups.spawnDrop(h.pos);
  }

  hearNoise(at: Vector3, radius: number): void {
    for (const h of this.hunters) h.hearNoise(at, radius);
  }

  nearestInCone(pos: Vector3, dir: Vector3, range: number, cosMin: number): Hunter | null {
    let best: Hunter | null = null;
    let bestD = range;
    for (const h of this.hunters) {
      if (!h.active) continue;
      const dx = h.pos.x - pos.x, dz = h.pos.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d > bestD || Math.abs(h.pos.y - pos.y) > 2.5) continue;
      if (d > 0.5 && (dx * dir.x + dz * dir.z) / d < cosMin) continue;
      best = h;
      bestD = d;
    }
    return best;
  }

  /** Golpe esférico: devuelve cuántos cazadores alcanzó. */
  meleeHit(center: Vector3, radius: number, dmg: number, force: number, source: Vector3, stun: number, kind: string): number {
    let n = 0;
    for (const h of this.hunters) {
      if (!h.active) continue;
      const cy = h.pos.y + 1.0;
      const dx = h.pos.x - center.x, dz = h.pos.z - center.z;
      const dy = Math.max(0, Math.abs(cy - center.y) - 0.7);
      if (dx * dx + dz * dz + dy * dy > (radius + 0.35) * (radius + 0.35)) continue;
      h.hit(dmg, source, force, stun, kind);
      n++;
    }
    return n;
  }

  areaHit(center: Vector3, radius: number, dmg: number, force: number, stun: number): number {
    let n = 0;
    for (const h of this.hunters) {
      if (!h.active) continue;
      const d = Math.hypot(h.pos.x - center.x, h.pos.z - center.z);
      if (d > radius || Math.abs(h.pos.y - center.y) > 2.5) continue;
      const k = 1 - d / radius;
      h.hit(d < radius * 0.6 ? dmg : Math.max(1, dmg - 1), center, force * (0.5 + k), stun, 'golpe');
      n++;
    }
    return n;
  }

  /** 0..1: intensidad del combate para la música. */
  combatLevel(): number {
    let n = 0;
    for (const h of this.hunters) if (h.state === 'combat') n++;
    return Math.min(1, n / 2);
  }
}
