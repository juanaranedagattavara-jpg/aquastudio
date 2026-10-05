import { PerspectiveCamera, Vector3 } from 'three';
import { VIEW_FAR } from '../core/device';
import { clamp, damp, dampAngle, segmentSphereHit, wrapAngle } from '../core/math';
import type { Input } from '../core/input';
import type { HunterManager } from '../enemies/hunterManager';
import type { Monkey } from '../player/monkey';
import type { RayHit, World } from '../world/world';

/**
 * Cámara orbital en tercera persona: suavizado por ejes, colisión con
 * troncos/terreno, FOV que se abre con la velocidad y temblor por "trauma".
 */
export class ThirdPersonCamera {
  readonly camera: PerspectiveCamera;
  yaw = 0;
  pitch = 0.28;
  distance = 5.6;
  sensitivity = 0.0024;
  invertY = false;
  /** FOV base (más abierto con el móvil en vertical). */
  baseFov = 70;
  /** En táctil la cámara se coloca sola detrás del movimiento. */
  autoFollow = false;
  /** Segundos desde el último giro manual de cámara. */
  lookIdle = 0;
  readonly target = new Vector3();
  readonly aimPoint = new Vector3();
  private curDist = 5.6;
  private trauma = 0;
  private fov = 70;
  private initialized = false;
  private dir = new Vector3();
  private back = new Vector3();
  private want = new Vector3();
  private hit: RayHit = { dist: 0, point: new Vector3(), kind: 'none' };
  private tmp = new Vector3();
  private aimEnd = new Vector3();
  private hunterC = new Vector3();

  constructor(aspect: number) {
    this.camera = new PerspectiveCamera(70, aspect, 0.1, VIEW_FAR);
  }

  shake(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  handleInput(input: Input, dt: number): void {
    const s = this.sensitivity;
    if (input.mouseDX || input.mouseDY || input.lookKeysX() || input.lookKeysY()) this.lookIdle = 0;
    else this.lookIdle += dt;
    this.yaw -= input.mouseDX * s;
    this.pitch += input.mouseDY * s * (this.invertY ? -1 : 1);
    this.yaw -= input.lookKeysX() * 2.4 * dt;
    this.pitch += input.lookKeysY() * 1.6 * dt;
    this.pitch = clamp(this.pitch, -0.65, 1.3);
    if (input.wheel) this.distance = clamp(this.distance + input.wheel * 0.7, 3, 14);
  }

  snap(): void {
    this.initialized = false;
  }

  update(dt: number, player: Monkey, world: World): void {
    // punto de interés
    this.want.copy(player.pos).add(player.model.visualOffset);
    if (player.state === 'swing') this.want.addScaledVector(player.ropeDir, 0.9);
    else this.want.y += player.state === 'down' ? 0.5 : 1.15;

    if (!this.initialized) {
      this.target.copy(this.want);
      this.curDist = this.distance;
      this.initialized = true;
    } else {
      this.target.x = damp(this.target.x, this.want.x, 14, dt);
      this.target.z = damp(this.target.z, this.want.z, 14, dt);
      this.target.y = damp(this.target.y, this.want.y, player.state === 'swing' ? 10 : 7, dt);
    }

    const speed = player.vel.length();
    this.follow(dt, player);
    let extra = 0;
    if (player.state === 'swing') extra = 1.0;
    else if (player.state === 'climb') extra = 0.8;
    extra += clamp((speed - 8) * 0.06, 0, 1.1);
    const wantDist = this.distance + extra;

    const cp = Math.cos(this.pitch);
    this.dir.set(-Math.sin(this.yaw) * cp, -Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
    this.back.copy(this.dir).negate();
    world.raycast(this.target, this.back, wantDist + 0.4, this.hit);
    const free = this.hit.kind === 'none' ? wantDist : Math.max(1.1, this.hit.dist - 0.4);
    if (free < this.curDist) this.curDist = damp(this.curDist, free, 25, dt);
    else this.curDist = damp(this.curDist, free, 3, dt);

    const cam = this.camera.position;
    cam.copy(this.target).addScaledVector(this.back, this.curDist);
    const g = world.groundHeight(cam.x, cam.z) + 0.45;
    if (cam.y < g) cam.y = g;
    this.camera.lookAt(this.target);

    // temblor
    this.trauma = Math.max(0, this.trauma - dt * 1.7);
    const sh = this.trauma * this.trauma;
    if (sh > 0.001) {
      const t = performance.now() * 0.001;
      this.camera.rotateX(Math.sin(t * 47) * 0.04 * sh);
      this.camera.rotateY(Math.sin(t * 39 + 1) * 0.04 * sh);
      this.camera.rotateZ(Math.sin(t * 31 + 2) * 0.05 * sh);
    }

    const fovTarget = this.baseFov + clamp((speed - 7) * 1.3, 0, 17);
    this.fov = damp(this.fov, fovTarget, 4, dt);
    if (Math.abs(this.camera.fov - this.fov) > 0.05) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Seguimiento automático (táctil): gira suavemente para quedar detrás del
   * movimiento. Se usa sin(Δ) para que al andar hacia la cámara no dé media vuelta.
   */
  private follow(dt: number, player: Monkey): void {
    if (!this.autoFollow) return;
    // trepando: colocarse en el lado exterior del tronco para que no tape al mono
    if (player.state === 'climb' && player.trunk) {
      if (this.lookIdle < 0.6) return;
      const t = player.trunk;
      this.yaw = dampAngle(this.yaw, Math.atan2(player.pos.x - t.x, player.pos.z - t.z), 2.2, dt);
      return;
    }
    if (this.lookIdle < 1.2 || player.state === 'down') return;
    const vx = player.vel.x, vz = player.vel.z;
    const sp = Math.hypot(vx, vz);
    if (sp < 1.5) return;
    const delta = wrapAngle(Math.atan2(-vx, -vz) - this.yaw);
    const k = Math.min(1, sp / 8) * (player.state === 'swing' ? 1.1 : 0.6);
    this.yaw += Math.sin(delta) * k * dt;
    this.pitch = damp(this.pitch, player.state === 'swing' ? 0.16 : 0.26, 0.5, dt);
  }

  /**
   * Punto al que apunta la mira (centro de pantalla): mundo o cazadores.
   * `assist` (radianes) amplía el cono para elegir al cazador más centrado (táctil).
   */
  computeAim(world: World, hunters: HunterManager, assist = 0): void {
    const origin = this.target;
    const dir = this.camera.getWorldDirection(this.tmp);
    world.raycast(origin, dir, 70, this.hit);
    const maxD = this.hit.dist;
    const end = this.aimEnd.copy(origin).addScaledVector(dir, maxD);
    let best = maxD;
    let found = false;
    for (const h of hunters.hunters) {
      if (!h.active) continue;
      this.hunterC.copy(h.pos);
      this.hunterC.y += 1.1;
      const t = segmentSphereHit(origin, end, this.hunterC, 0.8);
      if (t >= 0 && t * maxD < best) {
        best = t * maxD;
        this.aimPoint.copy(this.hunterC);
        found = true;
      }
    }
    if (!found && assist > 0) {
      // ángulo horizontal: "el cazador que tengo delante", aunque la cámara mire hacia abajo
      const fl = Math.hypot(dir.x, dir.z) || 1;
      let best = Infinity;
      for (const h of hunters.hunters) {
        if (!h.active) continue;
        this.hunterC.copy(h.pos);
        this.hunterC.y += 1.1;
        const dx = this.hunterC.x - origin.x, dz = this.hunterC.z - origin.z;
        const d = Math.hypot(dx, dz);
        if (d > 42 || d < 1) continue;
        const ang = Math.acos(clamp((dx * dir.x + dz * dir.z) / (d * fl), -1, 1));
        const score = ang + d * 0.004;
        if (ang < assist && score < best && world.lineOfSight(origin, this.hunterC) > 0.15) {
          best = score;
          // anticipa dónde estará cuando llegue la castaña (~28 m/s)
          this.aimPoint.copy(this.hunterC).addScaledVector(h.vel, d / 28);
          found = true;
        }
      }
    }
    if (!found) this.aimPoint.copy(origin).addScaledVector(dir, maxD);
  }
}
