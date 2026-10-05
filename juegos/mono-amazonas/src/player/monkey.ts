import { Vector3 } from 'three';
import { GRAVITY, NUT_GRAVITY, PLAYER, POWERS, SCORE, WATER_LEVEL, WORLD_HALF } from '../config';
import type { Input } from '../core/input';
import { clamp, damp, dampAngle, moveTowardsXZ, solveBallistic } from '../core/math';
import type { GameContext } from '../game/context';
import type { SupportHit, Trunk } from '../world/types';
import type { GrabResult, Vine } from '../world/vines';
import { MonkeyModel, type MonkeyAnimState, type MonkeyAttack, type MonkeyPose } from './monkeyModel';
import { Powers } from './powers';

export type MState = MonkeyAnimState;

const SUBSTEP = 1 / 120;
const BOUND = WORLD_HALF - 12;

/**
 * Controlador del mono. Máquina de estados con física propia:
 *  - suelo/ramas/copas (aceleración, inercia, salto variable, coyote time)
 *  - aire (control aéreo limitado, agarre automático de lianas y troncos)
 *  - liana (péndulo con restricción de cuerda, impulso, subir/bajar por la cuerda)
 *  - tronco (trepar alrededor, saltar desde él, subir a la copa)
 *  - agua (nado lento)
 */
export class Monkey {
  readonly model = new MonkeyModel();
  readonly pos = new Vector3();
  readonly vel = new Vector3();
  readonly center = new Vector3();
  readonly powers = new Powers();
  yaw = 0;
  state: MState = 'ground';
  stateTime = 0;
  hp: number = PLAYER.maxHp;
  nuts: number = PLAYER.startNuts;
  dead = false;
  deadTime = 0;

  // entrada del frame
  private moveDir = new Vector3();
  private moveMag = 0;
  private moveX = 0;
  private moveY = 0;
  private camFwd = new Vector3();
  private camRight = new Vector3();
  private jumpBuffer = 0;
  private jumpHeld = false;
  private sprint = false;
  private crouch = false;
  private crouchPressed = false;
  private grabPressed = false;
  private grabHeld = false;
  private attackPressed = false;
  private throwPressed = false;
  private dodgePressed = false;
  private coyote = 0;
  private jumpCut = false;

  // liana
  vine: Vine | null = null;
  ropeLen = 0;
  readonly grip = new Vector3();
  readonly ropeDir = new Vector3(0, 1, 0);
  private lastVine: Vine | null = null;
  private lastVineTimer = 0;
  private ropeClimbing = 0;
  private pumping = 0;

  // tronco
  trunk: Trunk | null = null;
  private climbAngle = 0;
  private climbPhase = 0;
  private lastTrunk: Trunk | null = null;
  private clingCooldown = 0;

  // combate
  private attack: MonkeyAttack = 'none';
  private attackT = 0;
  private attackDur = 0.3;
  private attackHitDone = false;
  private comboStep = 0;
  private comboTimer = 0;
  private attackCd = 0;
  private kickTimer = 0;
  pounding = false;
  private throwCd = 0;
  invuln = 0;
  private hurtT = 0;
  private lastDamage = -100;
  private dodgeTimer = 0;
  private dodgeCd = 0;
  private dodgeSide = 1;
  private airDodgeUsed = false;

  // otros
  readonly support: SupportHit = { y: 0, kind: 'terrain', platform: null };
  private shadowSup: SupportHit = { y: 0, kind: 'terrain', platform: null };
  vineCombo = 0;
  private idleTime = 0;
  private noiseTimer = 0;
  private splashTimer = 0;
  private auraTimer = 0;
  airTime = 0;
  private n = new Vector3();
  private tmp = new Vector3();
  private tmp2 = new Vector3();
  private pose: MonkeyPose;

  constructor(private ctx: GameContext) {
    ctx.scene.add(this.model.root, this.model.shadow);
    this.pose = {
      state: 'ground', speed: 0, vel: this.vel, yaw: 0, ropeDir: this.ropeDir, climbPhase: 0, climbSpread: 0,
      ropeClimbing: 0, pumping: 0, attack: 'none', attackT: 0, hurt: 0, dodge: 0, dodgeSide: 1, idleTime: 0, time: 0,
    };
  }

  reset(at: Vector3, yaw: number): void {
    this.pos.copy(at);
    this.vel.set(0, 0, 0);
    this.yaw = yaw;
    this.state = 'ground';
    this.hp = PLAYER.maxHp;
    this.nuts = PLAYER.startNuts;
    this.dead = false;
    this.deadTime = 0;
    this.vine?.release();
    this.vine = null;
    this.trunk = null;
    this.lastVine = null;
    this.lastTrunk = null;
    this.attack = 'none';
    this.pounding = false;
    this.kickTimer = 0;
    this.invuln = 0;
    this.hurtT = 0;
    this.lastDamage = -100;
    this.vineCombo = 0;
    this.powers.reset();
    this.model.visualOffset.set(0, 0, 0);
    this.model.setOpacity(1);
    this.model.setEmissive(0, 0);
  }

  get facing(): Vector3 {
    return this.tmp2.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  get speedH(): number {
    return Math.hypot(this.vel.x, this.vel.z);
  }

  /** Se llama una vez por frame antes de update. */
  readInput(input: Input, camYaw: number): void {
    this.camFwd.set(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    this.camRight.set(Math.cos(camYaw), 0, -Math.sin(camYaw));
    this.moveX = input.moveX();
    this.moveY = input.moveY();
    this.moveDir.set(0, 0, 0).addScaledVector(this.camFwd, this.moveY).addScaledVector(this.camRight, this.moveX);
    this.moveMag = Math.min(1, this.moveDir.length());
    if (this.moveMag > 1e-4) this.moveDir.divideScalar(this.moveDir.length());
    if (input.wasPressed('jump')) this.jumpBuffer = PLAYER.jumpBuffer;
    this.jumpHeld = input.isDown('jump');
    this.sprint = input.isDown('sprint');
    this.crouch = input.isDown('crouch');
    this.crouchPressed = input.wasPressed('crouch');
    this.grabPressed = input.wasPressed('grab');
    this.grabHeld = input.isDown('grab');
    this.attackPressed = input.wasPressed('attack');
    this.throwPressed = input.wasPressed('throw');
    this.dodgePressed = input.wasPressed('dodge');
  }

  private get mul(): number {
    return this.powers.has('guarana') ? 1.4 : 1;
  }

  // ======================================================================== bucle
  update(dt: number): void {
    const ctx = this.ctx;
    this.stateTime += dt;
    this.jumpBuffer -= dt;
    this.coyote -= dt;
    this.lastVineTimer -= dt;
    this.clingCooldown -= dt;
    this.invuln -= dt;
    this.hurtT = Math.max(0, this.hurtT - dt * 2.5);
    this.dodgeTimer -= dt;
    this.dodgeCd -= dt;
    this.attackCd -= dt;
    this.throwCd -= dt;
    this.comboTimer -= dt;
    this.kickTimer -= dt;

    for (const k of this.powers.update(dt)) ctx.hud.toast(`${POWERS[k].fruit}: efecto terminado`, POWERS[k].css, 1.6);

    if (this.dead) {
      this.deadTime += dt;
      this.vel.y -= GRAVITY * dt;
      this.pos.y += this.vel.y * dt;
      const g = ctx.world.supportHeight(this.pos.x, this.pos.z, this.pos.y + 0.3, this.support).y;
      if (this.pos.y < g) {
        this.pos.y = g;
        this.vel.set(0, 0, 0);
      }
      this.animate(dt);
      return;
    }

    // regeneración
    if (ctx.time - this.lastDamage > PLAYER.regenDelay) this.heal(PLAYER.regenRate * dt);
    if (this.powers.has('camu')) this.heal(4 * dt);

    this.handleActions();

    const steps = Math.max(1, Math.ceil(dt / SUBSTEP));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      this.step(h);
      // las pulsaciones sólo se consumen en el primer subpaso
      this.grabPressed = false;
      this.crouchPressed = false;
    }

    // límites del mapa
    if (Math.abs(this.pos.x) > BOUND) {
      this.pos.x = Math.sign(this.pos.x) * BOUND;
      this.vel.x = 0;
      if (this.state === 'swing') this.releaseVine(false);
    }
    if (Math.abs(this.pos.z) > BOUND) {
      this.pos.z = Math.sign(this.pos.z) * BOUND;
      this.vel.z = 0;
      if (this.state === 'swing') this.releaseVine(false);
    }

    if (this.attack !== 'none') {
      this.attackT += dt / this.attackDur;
      if (!this.attackHitDone && this.attackT > 0.38 && (this.attack === 'punchL' || this.attack === 'punchR' || this.attack === 'spin')) {
        this.attackHitDone = true;
        this.meleeHit();
      }
      if (this.attackT >= 1 && this.attack !== 'pound' && this.attack !== 'kick') this.attack = 'none';
      if (this.attack === 'kick' && this.kickTimer <= 0) this.attack = 'none';
    }

    if (this.state === 'ground' && this.speedH < 0.3 && this.attack === 'none') this.idleTime += dt;
    else this.idleTime = 0;
    if (this.state === 'air' || this.state === 'swing') this.airTime += dt;

    // ruido al correr por el suelo
    this.noiseTimer -= dt;
    if (this.state === 'ground' && this.support.kind === 'terrain' && this.speedH > 7.5 && this.noiseTimer <= 0) {
      this.noiseTimer = 0.4;
      ctx.noise(this.pos, this.sprint ? 13 : 9);
    }

    this.updateCenter();
    this.animate(dt);
    this.effects(dt);
  }

  private step(h: number): void {
    switch (this.state) {
      case 'ground': this.stepGround(h); break;
      case 'air': this.stepAir(h); break;
      case 'swing': this.stepSwing(h); break;
      case 'climb': this.stepClimb(h); break;
      case 'swim': this.stepSwim(h); break;
      case 'down': break;
    }
  }

  private setState(s: MState): void {
    if (this.state === s) return;
    this.state = s;
    this.stateTime = 0;
    if (s === 'ground' || s === 'swim') {
      this.airTime = 0;
      this.airDodgeUsed = false;
    }
  }

  // ======================================================================== suelo
  private stepGround(h: number): void {
    const w = this.ctx.world;
    const maxSpd = (this.sprint ? PLAYER.sprintSpeed : PLAYER.runSpeed) * this.mul;
    let tx = this.moveDir.x * maxSpd * this.moveMag;
    let tz = this.moveDir.z * maxSpd * this.moveMag;
    if (this.attack === 'punchL' || this.attack === 'punchR' || this.attack === 'spin') {
      tx *= 0.25;
      tz *= 0.25;
    }
    if (this.dodgeTimer <= 0) {
      const accel = this.moveMag > 0.05 ? PLAYER.groundAccel : PLAYER.groundDecel;
      moveTowardsXZ(this.vel, tx, tz, accel * h);
    }
    this.pos.x += this.vel.x * h;
    this.pos.z += this.vel.z * h;
    this.collide(h);

    w.supportHeight(this.pos.x, this.pos.z, this.pos.y + 0.5, this.support);
    if (this.support.y < this.pos.y - 0.4) {
      this.setState('air');
      this.coyote = PLAYER.coyoteTime;
      this.jumpCut = true;
      this.vel.y = 0;
    } else {
      this.pos.y = this.support.y;
      this.vel.y = 0;
    }

    if (this.support.kind === 'terrain' && w.isDeepWater(this.pos.x, this.pos.z) && this.pos.y < WATER_LEVEL - 0.4) {
      this.enterSwim();
      return;
    }
    if (this.state === 'ground') {
      if (this.vineCombo > 0 && this.stateTime > 0.25) this.endCombo();
      if (this.jumpBuffer > 0) this.jump();
      else if (this.grabPressed) {
        const t = w.nearestTrunk(this.pos, 1.0);
        if (t) this.enterClimb(t);
      }
    }
    if (this.speedH > 0.6 && this.attack === 'none') {
      this.yaw = dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 14, h);
    }
  }

  private jump(): void {
    const sprintBonus = this.sprint && this.speedH > 8 ? PLAYER.sprintJumpBonus : 0;
    this.vel.y = PLAYER.jumpVel * (this.powers.has('guarana') ? 1.25 : 1) + sprintBonus;
    this.setState('air');
    this.jumpBuffer = 0;
    this.coyote = 0;
    this.jumpCut = false;
    this.ctx.audio.play('jump', { vol: 0.6 });
    if (Math.random() < 0.12) this.ctx.audio.play('hoot', { vol: 0.5 });
    if (this.support.kind === 'terrain') this.ctx.noise(this.pos, 7);
  }

  // ======================================================================== aire
  private stepAir(h: number): void {
    const w = this.ctx.world;
    if (this.pounding) {
      this.vel.y = -PLAYER.poundSpeed;
    } else {
      this.vel.y -= GRAVITY * h;
      // salto variable: soltar pronto corta el salto, pero un toque siempre da un brinco útil
      if (!this.jumpHeld && this.vel.y > 0 && !this.jumpCut && this.stateTime > 0.07) {
        this.vel.y *= 0.55;
        this.jumpCut = true;
      }
      if (this.moveMag > 0.05 && this.dodgeTimer <= 0) {
        const airMax = PLAYER.airMaxSpeed * this.mul * this.moveMag;
        const along = this.vel.x * this.moveDir.x + this.vel.z * this.moveDir.z;
        if (along < airMax) {
          const add = Math.min(PLAYER.airAccel * h, airMax - along);
          this.vel.x += this.moveDir.x * add;
          this.vel.z += this.moveDir.z * add;
        }
      }
      const drag = Math.exp(-0.1 * h);
      this.vel.x *= drag;
      this.vel.z *= drag;
    }
    if (this.vel.y < -PLAYER.maxFall) this.vel.y = -PLAYER.maxFall;
    const prevY = this.pos.y;
    this.pos.addScaledVector(this.vel, h);

    // troncos: chocar y agarrarse
    const t = w.collideTrunks(this.pos, PLAYER.radius, PLAYER.height, this.n);
    if (t) {
      const into = -(this.vel.x * this.n.x + this.vel.z * this.n.z);
      if (into > 0) {
        this.vel.x += this.n.x * into;
        this.vel.z += this.n.z * into;
      }
      const inputInto = -(this.moveDir.x * this.n.x + this.moveDir.z * this.n.z) * this.moveMag;
      const canCling = t.climbable && !this.pounding && (t !== this.lastTrunk || this.clingCooldown <= 0) && this.pos.y < t.y1 - 0.8;
      if (canCling && (into > 1.2 || inputInto > 0.3 || this.grabHeld)) {
        this.enterClimb(t);
        return;
      }
    }

    // lianas
    if (!this.pounding) {
      const hand = this.tmp.copy(this.pos);
      hand.y += PLAYER.handHeight;
      const g = w.vines.findGrab(hand, PLAYER.grabRadius * (this.powers.has('guarana') ? 1.25 : 1),
        this.lastVineTimer > 0 ? this.lastVine : null);
      if (g) {
        this.enterSwing(g);
        return;
      }
    }

    // aterrizaje
    if (this.vel.y <= 0) {
      w.supportHeight(this.pos.x, this.pos.z, prevY + 0.05, this.support);
      if (this.pos.y <= this.support.y) {
        this.land();
        return;
      }
    } else {
      const th = w.groundHeight(this.pos.x, this.pos.z);
      if (this.pos.y < th) {
        this.pos.y = th;
        w.supportHeight(this.pos.x, this.pos.z, th + 0.05, this.support);
        this.land();
        return;
      }
    }

    if (this.pos.y < WATER_LEVEL - 0.25 && w.isDeepWater(this.pos.x, this.pos.z)) {
      this.enterSwim();
      return;
    }

    if (this.kickTimer > 0) this.checkKick();
    if (this.coyote > 0 && this.jumpBuffer > 0) this.jump();

    const sp = this.speedH;
    if (sp > 1 && this.attack !== 'kick') this.yaw = dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 6, h);
  }

  private land(): void {
    const ctx = this.ctx;
    const impact = -this.vel.y;
    this.pos.y = this.support.y;
    this.vel.y = 0;
    this.setState('ground');
    if (this.pounding) {
      this.poundImpact();
    } else if (impact > PLAYER.fallDamageSpeed) {
      ctx.audio.play('landHeavy');
      ctx.fx.dust(this.pos, 18, 1.5);
      this.takeDamage(Math.round((impact - PLAYER.fallDamageSpeed) * 3), null, 'fall');
      this.vel.x *= 0.4;
      this.vel.z *= 0.4;
    } else if (impact > 5) {
      ctx.audio.play(impact > 14 ? 'landHeavy' : 'land', { vol: clamp(impact / 16, 0.2, 0.9) });
      if (this.support.kind === 'terrain') ctx.fx.dust(this.pos, Math.round(impact), impact / 12);
      if (impact > 15) {
        this.vel.x *= 0.65;
        this.vel.z *= 0.65;
      }
    }
    if (this.support.kind === 'platform' && impact > 4) {
      ctx.fx.leaves(this.tmp.copy(this.pos).setY(this.pos.y + 0.2), 8);
      ctx.audio.play('leaves', { vol: 0.5 });
    }
    if (impact > 9 && this.support.kind === 'terrain') ctx.noise(this.pos, 12);
    if (this.attack === 'kick') this.attack = 'none';
    this.kickTimer = 0;
  }

  // ======================================================================== liana
  private enterSwing(g: GrabResult): void {
    const ctx = this.ctx;
    const old = this.tmp.copy(this.pos);
    this.vine = g.vine;
    this.grip.copy(g.point);
    this.ropeLen = clamp(g.along, 1.8, g.vine.length - 0.15);
    if (this.vel.y < -14) this.vel.y = -14 + (this.vel.y + 14) * 0.5;
    this.setState('swing');
    this.pounding = false;
    this.kickTimer = 0;
    if (this.attack === 'kick' || this.attack === 'pound') this.attack = 'none';
    this.ropeDir.subVectors(g.vine.anchor, this.grip).normalize();
    this.pos.copy(this.grip).addScaledVector(this.ropeDir, -PLAYER.gripReach);
    this.model.visualOffset.add(old.sub(this.pos));
    g.vine.hold(this.grip, this.ropeLen);

    this.vineCombo++;
    ctx.stats.vines++;
    ctx.stats.maxCombo = Math.max(ctx.stats.maxCombo, this.vineCombo);
    if (this.vineCombo >= 2) {
      ctx.hud.combo(this.vineCombo);
      ctx.addScore(SCORE.vineBase * this.vineCombo);
    }
    ctx.audio.play('grab', { vol: 0.7, rate: 0.9 + Math.random() * 0.3 });
    ctx.fx.leaves(g.vine.anchor, 5);
    ctx.noise(this.pos, 7);
  }

  private stepSwing(h: number): void {
    const w = this.ctx.world;
    const vine = this.vine!;
    const A = vine.anchor;

    this.ropeClimbing = 0;
    if (this.sprint) {
      this.ropeLen = Math.max(1.8, this.ropeLen - PLAYER.ropeClimbSpeed * this.mul * h);
      this.ropeClimbing = 1;
    } else if (this.crouch) {
      this.ropeLen = Math.min(vine.length - 0.15, this.ropeLen + PLAYER.ropeClimbSpeed * 1.4 * h);
      this.ropeClimbing = -1;
    }

    this.vel.y -= GRAVITY * h;
    const u = this.n.subVectors(A, this.grip);
    const dist = u.length();
    u.divideScalar(dist || 1);
    this.pumping = 0;
    if (this.moveMag > 0.05) {
      const dot = this.moveDir.dot(u);
      const fx = this.moveDir.x - u.x * dot, fy = -u.y * dot, fz = this.moveDir.z - u.z * dot;
      const k = PLAYER.pumpAccel * this.mul * this.moveMag * h;
      this.vel.x += fx * k;
      this.vel.y += fy * k;
      this.vel.z += fz * k;
      const sp = this.vel.length();
      if (sp > 0.5) this.pumping = (fx * this.vel.x + fy * this.vel.y + fz * this.vel.z) / sp;
    }
    const damping = Math.exp(-PLAYER.swingDamping * h);
    this.vel.multiplyScalar(damping);
    this.grip.addScaledVector(this.vel, h);

    // restricción de cuerda (sólo tensa: si se acorta, cae libre)
    this.tmp.subVectors(this.grip, A);
    const d = this.tmp.length();
    if (d > this.ropeLen) {
      this.tmp.divideScalar(d);
      this.grip.copy(A).addScaledVector(this.tmp, this.ropeLen);
      const radial = this.vel.dot(this.tmp);
      if (radial > 0) this.vel.addScaledVector(this.tmp, -radial);
    }
    const maxV = PLAYER.swingMaxSpeed * this.mul;
    const v = this.vel.length();
    if (v > maxV) this.vel.multiplyScalar(maxV / v);

    this.ropeDir.subVectors(A, this.grip);
    const rl = this.ropeDir.length();
    if (rl > 0.05) this.ropeDir.divideScalar(rl);
    else this.ropeDir.set(0, 1, 0);
    this.pos.copy(this.grip).addScaledVector(this.ropeDir, -PLAYER.gripReach);

    // el cuerpo choca con troncos
    const body = this.tmp.copy(this.pos).addScaledVector(this.ropeDir, 0.6);
    const bx = body.x, bz = body.z;
    if (w.collideTrunks(body, 0.32, 0.4, this.n)) {
      const dx = body.x - bx, dz = body.z - bz;
      this.grip.x += dx;
      this.grip.z += dz;
      this.pos.x += dx;
      this.pos.z += dz;
      const into = -(this.vel.x * this.n.x + this.vel.z * this.n.z);
      if (into > 0) {
        this.vel.x += this.n.x * into * 1.2;
        this.vel.z += this.n.z * into * 1.2;
      }
    }

    // tocar el suelo o el agua
    w.supportHeight(this.pos.x, this.pos.z, this.pos.y + 0.3, this.support);
    if (this.pos.y < this.support.y) {
      this.releaseVine(false);
      this.pos.y = this.support.y;
      this.vel.y = 0;
      this.setState('ground');
      return;
    }
    if (this.pos.y < WATER_LEVEL - 0.3 && w.isDeepWater(this.pos.x, this.pos.z)) {
      this.releaseVine(false);
      this.enterSwim();
      return;
    }

    if (this.jumpBuffer > 0) {
      this.releaseVine(true);
      return;
    }
    if (this.grabPressed) {
      this.releaseVine(false);
      return;
    }
    vine.hold(this.grip, this.ropeLen);

    const sp = this.speedH;
    if (sp > 1.5) this.yaw = dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 7, h);
    else if (this.moveMag > 0.1) this.yaw = dampAngle(this.yaw, Math.atan2(this.moveDir.x, this.moveDir.z), 5, h);
  }

  private releaseVine(jump: boolean): void {
    if (!this.vine) return;
    if (jump) {
      this.vel.y += PLAYER.releaseUp * (this.powers.has('guarana') ? 1.2 : 1);
      const sp = this.speedH;
      if (sp > 1) {
        this.vel.x += (this.vel.x / sp) * PLAYER.releaseForward;
        this.vel.z += (this.vel.z / sp) * PLAYER.releaseForward;
      } else if (this.moveMag > 0.1) {
        this.vel.x += this.moveDir.x * PLAYER.releaseForward * 1.5;
        this.vel.z += this.moveDir.z * PLAYER.releaseForward * 1.5;
      }
      this.ctx.audio.play('release', { vol: clamp(this.vel.length() / 20, 0.25, 0.8) });
    }
    this.lastVine = this.vine;
    this.lastVineTimer = 0.5;
    this.vine.release();
    this.vine = null;
    this.setState('air');
    this.jumpCut = true;
    this.jumpBuffer = 0;
    this.ropeClimbing = 0;
  }

  // ======================================================================== tronco
  private enterClimb(t: Trunk): void {
    const old = this.tmp.copy(this.pos);
    this.trunk = t;
    this.climbAngle = Math.atan2(this.pos.z - t.z, this.pos.x - t.x);
    this.setState('climb');
    this.vel.set(0, 0, 0);
    this.pounding = false;
    this.kickTimer = 0;
    if (this.attack === 'kick' || this.attack === 'pound') this.attack = 'none';
    this.lastTrunk = t;
    const ground = this.ctx.world.groundHeight(this.pos.x, this.pos.z);
    this.pos.y = clamp(this.pos.y, Math.max(ground, t.y0), t.y1 - 0.5);
    this.placeOnTrunk();
    this.model.visualOffset.add(old.sub(this.pos));
    this.ctx.audio.play('grab', { vol: 0.45, rate: 0.6 });
  }

  private placeOnTrunk(): void {
    const t = this.trunk!;
    const r = this.ctx.world.trunkRadiusAt(t, this.pos.y + 0.5) + 0.3;
    this.pos.x = t.x + Math.cos(this.climbAngle) * r;
    this.pos.z = t.z + Math.sin(this.climbAngle) * r;
    this.yaw = Math.atan2(t.x - this.pos.x, t.z - this.pos.z);
  }

  private stepClimb(h: number): void {
    const w = this.ctx.world;
    const t = this.trunk!;
    const mul = this.mul;
    const upIn = this.moveY;
    const side = this.moveX;
    const r = w.trunkRadiusAt(t, this.pos.y + 0.5);
    this.pos.y += upIn * PLAYER.climbSpeed * mul * h;
    const tx = -Math.sin(this.climbAngle), tz = Math.cos(this.climbAngle);
    const sgn = tx * this.camRight.x + tz * this.camRight.z >= 0 ? 1 : -1;
    this.climbAngle += (side * sgn * PLAYER.climbAround * mul * h) / (r + 0.35);
    this.climbPhase += (Math.abs(upIn) + Math.abs(side)) * h * 8 * mul;

    const ground = w.groundHeight(this.pos.x, this.pos.z);
    if (this.pos.y <= ground) {
      this.pos.y = ground;
      if (upIn < -0.2) {
        this.trunk = null;
        this.setState('ground');
        this.vel.set(0, 0, 0);
        return;
      }
    }
    const top = t.y1 - 0.5;
    if (this.pos.y >= top) {
      this.pos.y = top;
      if (upIn > 0.2 && t.platform) {
        this.mountTop(t);
        return;
      }
    }
    this.placeOnTrunk();
    this.vel.set(0, upIn * PLAYER.climbSpeed * mul, 0);

    if (this.jumpBuffer > 0) {
      this.jumpOffTrunk();
      return;
    }
    if (this.crouchPressed || this.grabPressed) {
      const nx = Math.cos(this.climbAngle), nz = Math.sin(this.climbAngle);
      this.vel.set(nx * 2.5, 0, nz * 2.5);
      this.trunk = null;
      this.clingCooldown = 0.5;
      this.setState('air');
      this.jumpCut = true;
    }
  }

  private mountTop(t: Trunk): void {
    const p = t.platform!;
    const old = this.tmp.copy(this.pos);
    const nx = Math.cos(this.climbAngle), nz = Math.sin(this.climbAngle);
    const rr = Math.min(p.R * 0.45, t.r + 1.4);
    this.pos.set(p.x + nx * rr, 0, p.z + nz * rr);
    const k = rr / p.R;
    this.pos.y = p.y - p.sag * (p.cone ? k : k * k);
    this.model.visualOffset.add(old.sub(this.pos));
    this.trunk = null;
    this.vel.set(nx * 1.5, 0, nz * 1.5);
    this.setState('ground');
    this.support.kind = 'platform';
    this.support.platform = p;
    this.support.y = this.pos.y;
    this.ctx.audio.play('leaves', { vol: 0.6 });
    this.ctx.fx.leaves(this.pos, 10);
  }

  private jumpOffTrunk(): void {
    const t = this.trunk!;
    const nx = Math.cos(this.climbAngle), nz = Math.sin(this.climbAngle);
    const dir = this.tmp;
    if (this.moveMag > 0.1 && Math.abs(this.moveY) < 0.9) dir.copy(this.moveDir);
    else dir.copy(this.camFwd);
    const dn = dir.x * nx + dir.z * nz;
    if (dn < 0.3) {
      dir.x += nx * (0.7 - dn);
      dir.z += nz * (0.7 - dn);
    }
    dir.y = 0;
    dir.normalize();
    const mul = this.mul;
    this.vel.set(dir.x * PLAYER.trunkJumpOut * mul, PLAYER.trunkJumpUp * (this.powers.has('guarana') ? 1.2 : 1), dir.z * PLAYER.trunkJumpOut * mul);
    this.pos.x += nx * 0.2;
    this.pos.z += nz * 0.2;
    this.trunk = null;
    this.lastTrunk = t;
    this.clingCooldown = 0.35;
    this.jumpBuffer = 0;
    this.setState('air');
    this.jumpCut = true;
    this.yaw = Math.atan2(dir.x, dir.z);
    this.ctx.audio.play('jump', { vol: 0.6 });
  }

  // ======================================================================== agua
  private enterSwim(): void {
    this.setState('swim');
    this.pounding = false;
    if (this.attack === 'pound' || this.attack === 'kick') this.attack = 'none';
    this.ctx.audio.play('splash', { vol: clamp(-this.vel.y / 12, 0.3, 1) });
    this.ctx.fx.splash(this.tmp.copy(this.pos).setY(WATER_LEVEL), 24);
    this.vel.y = 0;
    this.endCombo();
  }

  private stepSwim(h: number): void {
    const w = this.ctx.world;
    const sp = PLAYER.swimSpeed * this.mul;
    moveTowardsXZ(this.vel, this.moveDir.x * sp * this.moveMag, this.moveDir.z * sp * this.moveMag, 8 * h);
    this.pos.x += this.vel.x * h;
    this.pos.z += this.vel.z * h;
    this.collide(h);
    this.pos.y = damp(this.pos.y, WATER_LEVEL - 0.42, 8, h);
    this.vel.y = 0;
    const th = w.groundHeight(this.pos.x, this.pos.z);
    if (th > WATER_LEVEL - 0.42) {
      this.pos.y = th;
      this.setState('ground');
      return;
    }
    if (this.jumpBuffer > 0) {
      this.vel.y = 6.4;
      this.jumpBuffer = 0;
      this.jumpCut = false;
      this.setState('air');
      this.ctx.audio.play('splash', { vol: 0.4 });
    }
    if (this.speedH > 0.5) this.yaw = dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 6, h);
  }

  // ======================================================================== colisiones
  private collide(_h: number): void {
    const t = this.ctx.world.collideTrunks(this.pos, PLAYER.radius, PLAYER.height, this.n);
    if (t) {
      const into = -(this.vel.x * this.n.x + this.vel.z * this.n.z);
      if (into > 0) {
        this.vel.x += this.n.x * into;
        this.vel.z += this.n.z * into;
      }
    }
  }

  // ======================================================================== combate
  private handleActions(): void {
    const ctx = this.ctx;
    if (this.attackPressed) {
      if (this.state === 'ground' && this.attackCd <= 0) this.startPunch();
      else if (this.state === 'air' && this.kickTimer <= 0 && !this.pounding) this.startKick();
      else if (this.state === 'swing') {
        this.releaseVine(false);
        this.startKick();
      }
    }
    if (this.throwPressed && this.throwCd <= 0) {
      if (this.nuts > 0 && this.state !== 'climb' && this.state !== 'down') this.throwNut();
      else if (this.nuts <= 0) ctx.hud.toast('Sin castañas: búscalas al pie de los árboles', '#e0c090', 1.4);
    }
    if (this.dodgePressed && this.dodgeCd <= 0 && (this.state === 'ground' || (this.state === 'air' && !this.airDodgeUsed))) {
      this.dodge();
    }
    if (this.crouchPressed && this.state === 'air' && !this.pounding) {
      const g = ctx.world.supportHeight(this.pos.x, this.pos.z, this.pos.y, this.shadowSup).y;
      if (this.pos.y - g > 2.2) this.startPound();
    }
    this.attackPressed = false;
    this.throwPressed = false;
    this.dodgePressed = false;
  }

  private autoAim(range: number): void {
    const target = this.ctx.hunters.nearestInCone(this.pos, this.facing, range, Math.cos(1.3));
    if (target) this.yaw = Math.atan2(target.pos.x - this.pos.x, target.pos.z - this.pos.z);
  }

  private startPunch(): void {
    this.comboStep = this.comboTimer > 0 ? (this.comboStep + 1) % 3 : 0;
    this.attack = this.comboStep === 0 ? 'punchR' : this.comboStep === 1 ? 'punchL' : 'spin';
    this.attackDur = this.comboStep === 2 ? 0.42 : 0.28;
    this.attackT = 0;
    this.attackHitDone = false;
    this.attackCd = this.comboStep === 2 ? 0.48 : 0.24;
    this.comboTimer = 0.8;
    this.autoAim(3.8);
    const f = this.facing;
    const lunge = this.comboStep === 2 ? 2 : 3.6;
    this.vel.x += f.x * lunge;
    this.vel.z += f.z * lunge;
    this.ctx.audio.play('whoosh', { vol: 0.35, rate: 1.6 });
  }

  private meleeHit(): void {
    const ctx = this.ctx;
    const spin = this.attack === 'spin';
    const acai = this.powers.has('acai');
    const f = this.facing;
    const c = this.tmp.copy(this.pos);
    c.y += 0.55;
    if (!spin) c.addScaledVector(f, 0.8);
    const dmg = acai ? 3 : spin ? 2 : 1;
    const force = acai ? 15 : spin ? 8 : 5;
    const hits = ctx.hunters.meleeHit(c, spin ? 2.0 : 1.35, dmg, force, this.pos, acai ? 2.2 : 0.9, 'golpe');
    if (hits > 0) {
      ctx.audio.play('punch');
      ctx.fx.sparks(c, acai ? POWERS.acai.css : '#ffe08a', 16);
      ctx.cam.shake(acai ? 0.6 : 0.3);
      ctx.hitStop(0.06);
      if (acai) ctx.fx.shockwave(this.pos, 2.5, '#b080ff');
    }
    ctx.noise(this.pos, 16);
  }

  private startKick(): void {
    this.attack = 'kick';
    this.attackT = 0;
    this.attackDur = 0.55;
    this.kickTimer = 0.55;
    this.autoAim(8);
    const f = this.facing;
    const sp = this.speedH;
    const boost = Math.max(0, Math.min(5, 15 - sp));
    this.vel.x += f.x * boost;
    this.vel.z += f.z * boost;
    this.vel.y = Math.max(this.vel.y, 1.2);
    this.ctx.audio.play('whoosh', { vol: 0.5, rate: 1.2 });
  }

  private checkKick(): void {
    const ctx = this.ctx;
    const c = this.tmp.copy(this.pos);
    c.y += 0.5;
    const sp = this.vel.length();
    const acai = this.powers.has('acai');
    const dmg = acai || sp > 9 ? 3 : 2;
    const hits = ctx.hunters.meleeHit(c, 1.3, dmg, 6 + sp * 0.5, this.pos, 1.6, 'patada');
    if (hits > 0) {
      const f = this.facing;
      this.vel.set(-f.x * 3, 7.5, -f.z * 3);
      this.kickTimer = 0;
      this.attack = 'none';
      this.jumpCut = true;
      ctx.audio.play('kick');
      ctx.fx.sparks(c, '#ffd27a', 22);
      ctx.cam.shake(0.55);
      ctx.hitStop(0.08);
      ctx.noise(this.pos, 18);
    }
  }

  private startPound(): void {
    this.pounding = true;
    this.attack = 'pound';
    this.attackT = 0;
    this.attackDur = 1;
    this.vel.x *= 0.15;
    this.vel.z *= 0.15;
    this.vel.y = -PLAYER.poundSpeed;
    this.ctx.audio.play('whoosh', { vol: 0.6, rate: 0.6 });
  }

  private poundImpact(): void {
    const ctx = this.ctx;
    this.pounding = false;
    this.attack = 'none';
    const acai = this.powers.has('acai');
    const radius = acai ? 7.5 : 4.2;
    ctx.hunters.areaHit(this.pos, radius, acai ? 3 : 2, acai ? 14 : 9, acai ? 2.4 : 1.6);
    ctx.audio.play('pound');
    ctx.fx.shockwave(this.pos, radius, acai ? '#b080ff' : '#c9b48a');
    ctx.fx.dust(this.pos, 24, 2);
    if (this.support.kind === 'platform') ctx.fx.leaves(this.pos, 20);
    ctx.cam.shake(0.8);
    ctx.hitStop(0.05);
    ctx.noise(this.pos, 26);
  }

  private throwNut(): void {
    const ctx = this.ctx;
    this.nuts--;
    this.throwCd = 0.45;
    this.attack = 'throw';
    this.attackT = 0;
    this.attackDur = 0.38;
    const target = ctx.cam.aimPoint;
    const from = this.tmp.copy(this.state === 'swing' ? this.grip : this.pos);
    if (this.state === 'swing') from.addScaledVector(this.ropeDir, -0.3);
    else from.y += 1.0;
    const v = new Vector3();
    if (!solveBallistic(from, target, PLAYER.nutSpeed, NUT_GRAVITY, v)) {
      v.subVectors(target, from).normalize();
      v.y += 0.35;
      v.normalize().multiplyScalar(PLAYER.nutSpeed);
    }
    v.addScaledVector(this.vel, 0.5);
    if (this.state !== 'swing') this.yaw = Math.atan2(target.x - this.pos.x, target.z - this.pos.z);
    ctx.projectiles.throwNut(from, v);
    ctx.audio.play('throw', { vol: 0.6 });
    ctx.hud.setNuts(this.nuts);
  }

  private dodge(): void {
    const f = this.facing;
    const dir = this.n;
    if (this.moveMag > 0.1) dir.copy(this.moveDir);
    else dir.set(-f.x, 0, -f.z);
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    this.dodgeSide = dir.x * rx + dir.z * rz >= 0 ? -1 : 1;
    const s = PLAYER.dodgeSpeed * (this.powers.has('guarana') ? 1.2 : 1);
    this.vel.x = dir.x * s;
    this.vel.z = dir.z * s;
    if (this.state === 'ground') {
      this.vel.y = 3.6;
      this.setState('air');
      this.jumpCut = true;
    } else {
      this.vel.y = Math.max(this.vel.y, 1.5);
      this.airDodgeUsed = true;
    }
    this.dodgeTimer = PLAYER.dodgeTime;
    this.invuln = Math.max(this.invuln, PLAYER.dodgeTime);
    this.dodgeCd = PLAYER.dodgeCooldown;
    this.ctx.audio.play('dodge', { vol: 0.5 });
  }

  /** Aplica daño. Devuelve 'blocked' si el escudo lo paró. */
  takeDamage(amount: number, from: Vector3 | null, kind: 'arrow' | 'melee' | 'fall'): 'hit' | 'blocked' | 'ignored' {
    const ctx = this.ctx;
    if (this.dead) return 'ignored';
    if (kind !== 'fall') {
      if (this.invuln > 0) return 'ignored';
      if (this.powers.has('cupuacu')) return 'blocked';
    }
    this.hp -= amount;
    ctx.stats.damageTaken += amount;
    this.lastDamage = ctx.time;
    this.invuln = kind === 'fall' ? 0.2 : 0.55;
    this.hurtT = 1;
    ctx.audio.play('hurt', { vol: 0.8 });
    ctx.hud.damage(from, this.pos, ctx.cam.yaw);
    ctx.cam.shake(kind === 'fall' ? 0.5 : 0.4);
    if (from && (this.state === 'ground' || this.state === 'air')) {
      const dx = this.pos.x - from.x, dz = this.pos.z - from.z;
      const d = Math.hypot(dx, dz) || 1;
      this.vel.x += (dx / d) * 4;
      this.vel.z += (dz / d) * 4;
      if (this.state === 'ground') {
        this.vel.y = 3.5;
        this.setState('air');
        this.jumpCut = true;
      }
    }
    if (this.hp <= 0) this.die();
    return 'hit';
  }

  heal(amount: number): void {
    if (this.dead) return;
    this.hp = Math.min(PLAYER.maxHp, this.hp + amount);
  }

  private die(): void {
    this.hp = 0;
    this.dead = true;
    this.deadTime = 0;
    this.vine?.release();
    this.vine = null;
    this.trunk = null;
    this.pounding = false;
    this.attack = 'none';
    this.vel.set(0, Math.min(0, this.vel.y), 0);
    this.state = 'down';
  }

  private endCombo(): void {
    if (this.vineCombo >= 3) {
      const pts = this.vineCombo * 60;
      this.ctx.addScore(pts, this.pos, `¡Cadena de ${this.vineCombo} lianas!`);
    }
    this.vineCombo = 0;
  }

  // ======================================================================== visual
  private updateCenter(): void {
    this.center.copy(this.pos);
    if (this.state === 'swing') this.center.addScaledVector(this.ropeDir, 0.85);
    else if (this.state === 'down') this.center.y += 0.2;
    else this.center.y += 0.55;
  }

  private animate(dt: number): void {
    const p = this.pose;
    p.state = this.state;
    p.speed = this.speedH;
    p.yaw = this.yaw;
    p.climbPhase = this.climbPhase;
    p.climbSpread = this.trunk ? clamp((this.trunk.r - 0.3) * 0.5, 0, 0.6) : 0;
    p.ropeClimbing = this.ropeClimbing;
    p.pumping = this.pumping;
    p.attack = this.attack;
    p.attackT = clamp(this.attackT, 0, 1);
    p.hurt = this.hurtT;
    p.dodge = this.dodgeTimer > 0 ? 1 - this.dodgeTimer / PLAYER.dodgeTime : 0;
    p.dodgeSide = this.dodgeSide;
    p.idleTime = this.idleTime;
    p.time = this.ctx.time;
    this.model.update(dt, this.pos, p);
    const sup = this.ctx.world.supportHeight(this.pos.x, this.pos.z, this.pos.y + 0.05, this.shadowSup);
    const gy = sup.kind === 'terrain' ? Math.max(sup.y, WATER_LEVEL) : sup.y;
    this.model.updateShadow(gy, this.pos.y, this.pos.x, this.pos.z);
    if (this.state === 'swim' || this.dead) this.model.shadow.visible = false;
  }

  private effects(dt: number): void {
    const ctx = this.ctx;
    const pw = this.powers;
    // camuflaje
    if (pw.has('maracuja')) this.model.setOpacity(0.28 + Math.sin(ctx.time * 8) * 0.06);
    else if (this.invuln > 0 && this.hurtT > 0) this.model.setOpacity(Math.sin(ctx.time * 40) > 0 ? 1 : 0.5);
    else this.model.setOpacity(1);
    // brillo
    if (this.hurtT > 0) this.model.setEmissive(0xff2020, this.hurtT * 0.7);
    else if (pw.has('acai')) this.model.setEmissive(POWERS.acai.color, 0.25 + Math.sin(ctx.time * 6) * 0.1);
    else if (pw.has('cupuacu')) this.model.setEmissive(POWERS.cupuacu.color, 0.2);
    else this.model.setEmissive(0, 0);
    // aura de partículas
    this.auraTimer -= dt;
    const act = pw.active();
    if (act.length && this.auraTimer <= 0) {
      this.auraTimer = 0.05;
      const k = act[Math.floor(Math.random() * act.length)];
      ctx.fx.aura(this.center, POWERS[k].css);
    }
    // estela de velocidad
    if (pw.has('guarana') && this.vel.length() > 9 && Math.random() < 0.5) ctx.fx.aura(this.center, '#ffb060');
    // agua
    if (this.state === 'swim') {
      this.splashTimer -= dt;
      if (this.splashTimer <= 0 && this.speedH > 0.5) {
        this.splashTimer = 0.35;
        ctx.fx.splash(this.tmp.copy(this.pos).setY(WATER_LEVEL), 5);
      }
    }
    if (this.dead && Math.random() < 0.3) ctx.fx.stars(this.tmp.copy(this.pos).setY(this.pos.y + 0.7));
  }

  /** Distancia vertical a la superficie de abajo (para HUD/cámara). */
  heightAboveGround(): number {
    const g = this.ctx.world.groundHeight(this.pos.x, this.pos.z);
    return this.pos.y - Math.max(g, WATER_LEVEL);
  }

  /** Para la IA: ¿está escondido entre el follaje o camuflado? */
  get camouflaged(): boolean {
    return this.powers.has('maracuja');
  }

  get isGrounded(): boolean {
    return this.state === 'ground';
  }
}
