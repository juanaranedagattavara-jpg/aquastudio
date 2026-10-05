import { Texture, Vector3 } from 'three';
import { ARROW_GRAVITY, SCORE, WATER_LEVEL } from '../config';
import { clamp, dampAngle, solveBallistic, wrapAngle } from '../core/math';
import { gaussRand, rand } from '../core/random';
import type { GameContext } from '../game/context';
import type { Trunk } from '../world/types';
import { HunterModel, type HunterPose } from './hunterModel';

export type HState = 'patrol' | 'investigate' | 'combat' | 'search' | 'stunned' | 'ko';

const PERCEIVE_EVERY = 0.15;
const VIEW_RANGE = 52;

let seedCounter = 1;

/**
 * Cazador con IA de sigilo/combate:
 *  patrulla → investiga (ruido o vistazo) → combate (dispara con anticipación balística)
 *  → busca en la última posición conocida → vuelve a patrullar.
 */
export class Hunter {
  readonly model: HunterModel;
  readonly pos = new Vector3();
  readonly vel = new Vector3();
  readonly knock = new Vector3();
  readonly home = new Vector3();
  readonly target = new Vector3();
  readonly lastKnown = new Vector3();
  readonly eye = new Vector3();
  yaw = 0;
  hp = 3;
  state: HState = 'patrol';
  stateTime = 0;
  alert = 0;
  seesPlayer = false;
  visibility = 0;
  lastSeen = -100;
  drawing = false;
  drawT = 0;
  removed = false;
  private hasTarget = false;
  private wait = 0;
  private perceiveTimer = Math.random() * PERCEIVE_EVERY;
  private shootCd = rand(1, 2.5);
  private meleeT = -1;
  private meleeCd = 0;
  private stunT = 0;
  private koT = 0;
  private hitT = 0;
  private strafe = 1;
  private strafeTimer = 0;
  private look = 0;
  private lookTarget = 0;
  private lookTimer = 0;
  private alertPose = 0;
  private starsTimer = 0;
  private notSeenDraw = 0;
  private stuckTimer = 0;
  private pose: HunterPose = { mode: 'idle', speed: 0, drawT: 0, aimPitch: 0, meleeT: 0, hit: 0, look: 0, time: 0 };
  private tmp = new Vector3();
  private tmp2 = new Vector3();
  private trunks: Trunk[] = [];

  constructor(private ctx: GameContext, at: Vector3, paint: Texture) {
    this.model = new HunterModel(seedCounter++, paint);
    this.pos.copy(at);
    this.pos.y = ctx.world.groundHeight(at.x, at.z);
    this.home.copy(this.pos);
    this.yaw = rand(0, Math.PI * 2);
    ctx.scene.add(this.model.root);
  }

  dispose(): void {
    this.ctx.scene.remove(this.model.root);
    this.ctx.hunters.releaseToken(this);
  }

  get active(): boolean {
    return this.state !== 'ko';
  }

  get facing(): Vector3 {
    return this.tmp2.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  setState(s: HState): void {
    if (s === this.state) return;
    if (this.drawing) this.cancelDraw();
    this.state = s;
    this.stateTime = 0;
    this.hasTarget = false;
    this.wait = 0;
  }

  // ======================================================================== percepción
  private perceive(): void {
    const ctx = this.ctx;
    const p = ctx.player;
    this.eye.copy(this.pos);
    this.eye.y += 1.6;
    this.seesPlayer = false;
    this.visibility = 0;
    if (p.dead || this.state === 'ko' || this.state === 'stunned') return;
    if (p.camouflaged) return;
    const target = p.center;
    const dx = target.x - this.eye.x, dy = target.y - this.eye.y, dz = target.z - this.eye.z;
    const d = Math.hypot(dx, dy, dz);
    if (d > VIEW_RANGE) return;
    const f = this.facing;
    const cosAng = (dx * f.x + dz * f.z) / Math.max(0.01, Math.hypot(dx, dz));
    const elev = Math.atan2(dy, Math.hypot(dx, dz));
    const fov = this.state === 'combat' ? -1 : this.state === 'search' || this.state === 'investigate' ? Math.cos(1.2) : Math.cos(0.95);
    if (d > 4 && (cosAng < fov || (this.state !== 'combat' && elev > 0.9))) return;
    let vis = ctx.world.lineOfSight(this.eye, target);
    if (vis <= 0) return;
    if (p.state === 'ground' && p.support.kind === 'platform' && p.support.platform?.kind !== 'roof') vis *= 0.45;
    if (p.heightAboveGround() > 12) vis *= 0.8;
    this.visibility = vis;
    this.seesPlayer = vis > 0.18;
    if (!this.seesPlayer) return;
    this.lastKnown.copy(p.pos);
    this.lastSeen = ctx.time;
    const moving = p.speedH > 6 || p.state === 'swing' ? 1.35 : 1;
    const rate = (0.28 + 1.65 * (1 - d / VIEW_RANGE)) * vis * ctx.diff.detectMul * moving;
    this.alert = Math.min(1.2, this.alert + rate * PERCEIVE_EVERY);
  }

  hearNoise(at: Vector3, radius: number): void {
    if (this.state === 'ko' || this.state === 'stunned') return;
    const d = this.pos.distanceTo(at);
    if (d > radius) return;
    const k = 1 - d / radius;
    this.lastKnown.set(at.x + rand(-3, 3) * (1 - k), at.y, at.z + rand(-3, 3) * (1 - k));
    if (this.state === 'combat') return;
    this.alert = Math.max(this.alert, 0.45 + k * 0.4);
    if (this.state === 'patrol' || this.state === 'search') this.setState('investigate');
    this.hasTarget = false;
  }

  /** Aviso de un compañero que ha visto al mono. */
  callout(at: Vector3): void {
    if (this.state === 'ko' || this.state === 'stunned' || this.state === 'combat') return;
    this.lastKnown.copy(at);
    this.alert = Math.max(this.alert, 0.8);
    this.setState('search');
  }

  // ======================================================================== bucle
  update(dt: number): void {
    const ctx = this.ctx;
    this.stateTime += dt;
    this.shootCd -= dt;
    this.meleeCd -= dt;
    this.hitT = Math.max(0, this.hitT - dt * 3);

    this.perceiveTimer -= dt;
    if (this.perceiveTimer <= 0) {
      this.perceiveTimer = PERCEIVE_EVERY;
      this.perceive();
      if (!this.seesPlayer && this.state !== 'combat' && this.state !== 'ko') {
        this.alert = Math.max(0, this.alert - (this.state === 'search' ? 0.06 : 0.1) * PERCEIVE_EVERY);
      }
    }

    // retroceso por golpes
    if (this.knock.lengthSq() > 0.01) {
      this.pos.addScaledVector(this.knock, dt);
      this.knock.multiplyScalar(Math.exp(-5 * dt));
      ctx.world.collideTrunks(this.pos, 0.35, 1.7);
    }

    let speed = 0;
    let mode: HunterPose['mode'] = 'idle';
    switch (this.state) {
      case 'patrol': {
        if (this.alert >= 1) this.enterCombat();
        else if (this.alert >= 0.35) this.setState('investigate');
        else if (!this.hasTarget) {
          this.wait -= dt;
          if (this.wait <= 0) this.pickWaypoint(36);
        } else {
          speed = this.moveTo(this.target, 1.6, dt);
          if (speed < 0) {
            this.hasTarget = false;
            this.wait = rand(1.5, 4);
            speed = 0;
          }
        }
        mode = speed > 0.1 ? 'walk' : 'idle';
        break;
      }
      case 'investigate': {
        if (this.alert >= 1) {
          this.enterCombat();
          break;
        }
        if (this.stateTime < 0.6) {
          this.faceTowards(this.lastKnown, dt, 6);
          mode = 'idle';
          break;
        }
        const s = this.moveTo(this.lastKnown, 2.7, dt, 2.5);
        if (s < 0) {
          this.lookAround(dt);
          if (this.stateTime > 9 || this.alert < 0.15) this.setState('patrol');
        } else speed = s;
        mode = speed > 2 ? 'run' : speed > 0.1 ? 'walk' : 'idle';
        break;
      }
      case 'combat': {
        ({ speed, mode } = this.combat(dt));
        break;
      }
      case 'search': {
        if (this.alert >= 1 && this.seesPlayer) {
          this.enterCombat();
          break;
        }
        const s = this.moveTo(this.lastKnown, 4.0, dt, 3);
        if (s < 0) {
          this.lookAround(dt);
          if (this.stateTime > 12) this.setState('patrol');
        } else speed = s;
        if (this.stateTime > 18) this.setState('patrol');
        mode = speed > 2 ? 'run' : speed > 0.1 ? 'walk' : 'idle';
        break;
      }
      case 'stunned': {
        this.stunT -= dt;
        mode = 'stunned';
        this.starsTimer -= dt;
        if (this.starsTimer <= 0) {
          this.starsTimer = 0.12;
          ctx.fx.stars(this.tmp.copy(this.pos).setY(this.pos.y + 1.95));
        }
        if (this.stunT <= 0) {
          this.alert = 1.1;
          this.lastKnown.copy(ctx.player.pos);
          this.lastSeen = ctx.time;
          this.state = 'combat';
          this.stateTime = 0;
        }
        break;
      }
      case 'ko': {
        this.koT += dt;
        mode = 'ko';
        if (this.koT < 6) {
          this.starsTimer -= dt;
          if (this.starsTimer <= 0) {
            this.starsTimer = 0.15;
            ctx.fx.stars(this.tmp.copy(this.pos).setY(this.pos.y + 0.5));
          }
        }
        if (this.koT > 18) {
          const a = clamp(1 - (this.koT - 18) / 2, 0, 1);
          this.model.setOpacity(a);
          if (a <= 0) this.removed = true;
        }
        break;
      }
    }

    // indicador sobre la cabeza
    if (this.state === 'ko') this.model.setIndicator(this.koT < 14 ? 'z' : '', 0);
    else if (this.state === 'combat' || this.state === 'stunned') this.model.setIndicator(this.state === 'combat' ? '!' : '', 0);
    else if (this.alert > 0.12) this.model.setIndicator('?', this.alert);
    else this.model.setIndicator('');

    this.pos.y = Math.max(ctx.world.groundHeight(this.pos.x, this.pos.z), WATER_LEVEL - 0.6);
    this.model.root.position.copy(this.pos);
    this.model.root.rotation.y = this.yaw;
    const pose = this.pose;
    pose.mode = this.alertPose > 0 ? 'alert' : mode;
    this.alertPose -= dt;
    pose.speed = speed;
    pose.drawT = this.drawT;
    pose.meleeT = this.meleeT >= 0 ? clamp(this.meleeT / 0.75, 0, 1) : 0;
    if (this.meleeT >= 0) pose.mode = 'melee';
    pose.hit = this.hitT;
    pose.look = this.look;
    pose.time = ctx.time;
    if (this.drawing) {
      const p = ctx.player.center;
      const dh = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
      pose.aimPitch = clamp(Math.atan2(p.y - (this.pos.y + 1.5), dh), -0.6, 1.1);
    }
    this.model.update(dt, pose);
  }

  private enterCombat(): void {
    const ctx = this.ctx;
    const wasCombat = this.state === 'combat';
    this.setState('combat');
    this.alert = 1.1;
    if (!wasCombat) {
      this.alertPose = 0.7;
      this.shootCd = Math.max(this.shootCd, 0.8);
      ctx.audio.play('shout', { at: this.pos, vol: 1 });
      ctx.hunters.onSpotted(this);
    }
  }

  // ======================================================================== combate
  private combat(dt: number): { speed: number; mode: HunterPose['mode'] } {
    const ctx = this.ctx;
    const p = ctx.player;
    if (p.dead) {
      this.setState('patrol');
      this.alert = 0.3;
      return { speed: 0, mode: 'idle' };
    }
    const since = ctx.time - this.lastSeen;
    if (since > 3.5 && !this.drawing) {
      this.setState('search');
      this.alert = 0.85;
      return { speed: 0, mode: 'idle' };
    }

    const dx = p.pos.x - this.pos.x, dz = p.pos.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    const dy = p.pos.y - this.pos.y;

    // cuerpo a cuerpo si el mono está encima
    if (this.meleeT >= 0) {
      this.meleeT += dt;
      this.faceTowards(p.pos, dt, 10);
      if (this.meleeT >= 0.42 && this.meleeT - dt < 0.42) {
        if (d < 2.4 && Math.abs(dy) < 1.7) {
          const r = p.takeDamage(ctx.diff.meleeDamage, this.pos, 'melee');
          if (r === 'hit') ctx.audio.play('punch', { at: p.pos });
          else if (r === 'blocked') ctx.audio.play('tink', { at: p.pos });
        }
      }
      if (this.meleeT > 0.75) {
        this.meleeT = -1;
        this.meleeCd = 1.4;
      }
      return { speed: 0, mode: 'melee' };
    }
    if (d < 2.2 && Math.abs(dy) < 1.5 && this.meleeCd <= 0) {
      if (this.drawing) this.cancelDraw();
      this.meleeT = 0;
      ctx.audio.play('whoosh', { at: this.pos, vol: 0.5 });
      return { speed: 0, mode: 'melee' };
    }

    // disparo
    if (this.drawing) {
      this.faceTowards(p.pos, dt, 10);
      this.drawT += dt / ctx.diff.drawTime;
      if (!this.seesPlayer) this.notSeenDraw += dt;
      else this.notSeenDraw = 0;
      if (this.notSeenDraw > 0.6) {
        this.cancelDraw();
        this.shootCd = 0.6;
      } else if (this.drawT >= 1) {
        this.fire();
      }
      return { speed: 0, mode: 'draw' };
    }
    if (this.shootCd <= 0 && this.seesPlayer && this.visibility > 0.28 && d < 58 && ctx.hunters.requestToken(this)) {
      this.drawing = true;
      this.drawT = 0;
      this.notSeenDraw = 0;
      ctx.audio.play('draw', { at: this.pos, vol: 0.9 });
      return { speed: 0, mode: 'draw' };
    }

    // posicionamiento: mantener distancia de tiro y moverse lateralmente
    this.strafeTimer -= dt;
    if (this.strafeTimer <= 0) {
      this.strafeTimer = rand(1.5, 3);
      this.strafe = Math.random() < 0.5 ? -1 : 1;
    }
    let goal: Vector3;
    let spd: number;
    const nx = dx / (d || 1), nz = dz / (d || 1);
    if (!this.seesPlayer) {
      goal = this.lastKnown;
      spd = 4.3;
    } else if (d < 9) {
      goal = this.tmp.set(this.pos.x - nx * 4, 0, this.pos.z - nz * 4);
      spd = 3.6;
    } else if (d > 30) {
      goal = this.tmp.set(p.pos.x - nx * 20, 0, p.pos.z - nz * 20);
      spd = 4.3;
    } else {
      goal = this.tmp.set(this.pos.x - nz * this.strafe * 3, 0, this.pos.z + nx * this.strafe * 3);
      spd = 1.8;
    }
    const s = this.moveTo(goal, spd, dt, 0.8, this.seesPlayer);
    if (this.seesPlayer) this.faceTowards(p.pos, dt, 8);
    const speed = Math.max(0, s);
    return { speed, mode: speed > 2.5 ? 'run' : speed > 0.1 ? 'walk' : 'idle' };
  }

  private fire(): void {
    const ctx = this.ctx;
    const p = ctx.player;
    this.drawing = false;
    this.drawT = 0;
    this.shootCd = rand(ctx.diff.cooldown[0], ctx.diff.cooldown[1]);
    ctx.hunters.releaseToken(this);

    const from = this.model.bowWorld(this.tmp);
    from.y = Math.max(from.y, this.pos.y + 1.3);
    const speed = ctx.diff.arrowSpeed;
    const aim = this.tmp2.copy(p.center);
    // anticipación iterativa del movimiento del mono
    for (let i = 0; i < 3; i++) {
      const t = from.distanceTo(aim) / speed;
      aim.copy(p.center).addScaledVector(p.vel, t * ctx.diff.leadFactor);
      if (p.state !== 'swing' && p.state !== 'air') aim.y = p.center.y;
    }
    const v = new Vector3();
    if (!solveBallistic(from, aim, speed, ARROW_GRAVITY, v)) {
      v.subVectors(aim, from).normalize();
      v.y = Math.max(v.y, 0.7);
      v.normalize().multiplyScalar(speed);
    }
    // dispersión
    // un blanco quieto es más fácil: moverse es la mejor defensa
    const sigma = ((ctx.diff.spreadDeg * Math.PI) / 180) * (0.55 + clamp(p.vel.length() / 12, 0, 0.7));
    const yawErr = gaussRand() * sigma;
    const pitchErr = gaussRand() * sigma * 0.8;
    const hs = Math.hypot(v.x, v.z);
    const ang = Math.atan2(v.z, v.x) + yawErr;
    const el = Math.atan2(v.y, hs) + pitchErr;
    v.set(Math.cos(ang) * Math.cos(el) * speed, Math.sin(el) * speed, Math.sin(ang) * Math.cos(el) * speed);
    ctx.projectiles.fireArrow(from, v);
    ctx.audio.play('twang', { at: this.pos });
  }

  private cancelDraw(): void {
    this.drawing = false;
    this.drawT = 0;
    this.ctx.hunters.releaseToken(this);
  }

  /** Recibe un golpe. Devuelve true si queda noqueado. */
  hit(dmg: number, from: Vector3, force: number, stun: number, kind: string): boolean {
    const ctx = this.ctx;
    if (this.state === 'ko') return false;
    this.hp -= dmg;
    this.hitT = 1;
    if (this.drawing) this.cancelDraw();
    this.meleeT = -1;
    const dx = this.pos.x - from.x, dz = this.pos.z - from.z;
    const d = Math.hypot(dx, dz) || 1;
    this.knock.set((dx / d) * force, 0, (dz / d) * force);
    ctx.audio.play('hunterHurt', { at: this.pos });
    this.yaw = Math.atan2(-dx, -dz);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.stateTime = 0;
      this.koT = 0;
      this.knock.multiplyScalar(1.4);
      ctx.stats.kos++;
      const bonus = kind === 'patada' ? SCORE.kickBonus : 0;
      ctx.addScore(SCORE.ko + bonus, this.pos, kind === 'patada' ? '¡Patada voladora!' : '¡Noqueado!');
      ctx.audio.play('ko', { at: this.pos });
      ctx.hunters.onKO(this);
      return true;
    }
    this.state = 'stunned';
    this.stateTime = 0;
    this.stunT = stun;
    this.alert = 1.1;
    this.lastKnown.copy(ctx.player.pos);
    return false;
  }

  // ======================================================================== movimiento
  private pickWaypoint(radius: number): void {
    const w = this.ctx.world;
    for (let i = 0; i < 12; i++) {
      const a = rand(0, Math.PI * 2), r = rand(6, radius);
      const x = this.home.x + Math.cos(a) * r, z = this.home.z + Math.sin(a) * r;
      if (w.groundHeight(x, z) < 0.4 || Math.abs(x) > 228 || Math.abs(z) > 228) continue;
      this.target.set(x, 0, z);
      this.hasTarget = true;
      return;
    }
    this.wait = 1;
  }

  /**
   * Camina hacia `goal` esquivando troncos y agua. Devuelve la velocidad
   * actual, o -1 al llegar (dentro de `arrive`).
   */
  private moveTo(goal: Vector3, speed: number, dt: number, arrive = 0.8, keepFacing = false): number {
    const w = this.ctx.world;
    let dx = goal.x - this.pos.x, dz = goal.z - this.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < arrive) {
      this.vel.set(0, 0, 0);
      return -1;
    }
    dx /= dist;
    dz /= dist;
    // evitar troncos de delante
    w.trunkHash.query(this.pos.x, this.pos.z, 5, this.trunks);
    let ax = 0, az = 0;
    for (const t of this.trunks) {
      const tx = t.x - this.pos.x, tz = t.z - this.pos.z;
      const along = tx * dx + tz * dz;
      if (along < 0 || along > 4.5) continue;
      const lat = -tx * dz + tz * dx;
      const rr = t.r + t.buttress * 0.7 + 0.9;
      if (Math.abs(lat) < rr) {
        const s = lat >= 0 ? -1 : 1;
        const k = (1 - Math.abs(lat) / rr) * (1 - along / 4.5) * 2.2;
        ax += -dz * s * k;
        az += dx * s * k;
      }
    }
    let mx = dx + ax, mz = dz + az;
    const ml = Math.hypot(mx, mz) || 1;
    mx /= ml;
    mz /= ml;
    // evitar el río
    const px = this.pos.x + mx * 2.5, pz = this.pos.z + mz * 2.5;
    if (w.groundHeight(px, pz) < -0.3) {
      let ok = false;
      for (const rot of [0.8, -0.8, 1.6, -1.6]) {
        const c = Math.cos(rot), s = Math.sin(rot);
        const rx = mx * c - mz * s, rz = mx * s + mz * c;
        if (w.groundHeight(this.pos.x + rx * 2.5, this.pos.z + rz * 2.5) >= -0.3) {
          mx = rx;
          mz = rz;
          ok = true;
          break;
        }
      }
      if (!ok) {
        this.vel.set(0, 0, 0);
        return -1;
      }
    }
    const k = 1 - Math.exp(-8 * dt);
    this.vel.x += (mx * speed - this.vel.x) * k;
    this.vel.z += (mz * speed - this.vel.z) * k;
    const ox = this.pos.x, oz = this.pos.z;
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    w.collideTrunks(this.pos, 0.35, 1.7);
    const moved = Math.hypot(this.pos.x - ox, this.pos.z - oz) / Math.max(dt, 1e-4);
    // atasco: reintentar por otro lado
    if (moved < speed * 0.25) {
      this.stuckTimer += dt;
      if (this.stuckTimer > 1.2) {
        this.stuckTimer = 0;
        this.hasTarget = false;
        return -1;
      }
    } else this.stuckTimer = 0;
    if (!keepFacing && moved > 0.2) this.yaw = dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 7, dt);
    return moved;
  }

  private faceTowards(p: Vector3, dt: number, rate: number): void {
    this.yaw = dampAngle(this.yaw, Math.atan2(p.x - this.pos.x, p.z - this.pos.z), rate, dt);
  }

  private lookAround(dt: number): void {
    this.lookTimer -= dt;
    if (this.lookTimer <= 0) {
      this.lookTimer = rand(0.8, 1.8);
      this.lookTarget = wrapAngle(this.yaw + rand(-1.6, 1.6));
    }
    this.yaw = dampAngle(this.yaw, this.lookTarget, 3, dt);
    this.look = Math.sin(this.ctx.time * 1.3) * 0.6;
  }
}
