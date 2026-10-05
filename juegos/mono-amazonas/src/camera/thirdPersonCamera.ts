import { PerspectiveCamera, Vector3 } from 'three';
import { clamp, damp, segmentSphereHit } from '../core/math';
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
    this.camera = new PerspectiveCamera(70, aspect, 0.1, 290);
  }

  shake(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  handleInput(input: Input, dt: number): void {
    const s = this.sensitivity;
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

    const fovTarget = 70 + clamp((speed - 7) * 1.3, 0, 17);
    this.fov = damp(this.fov, fovTarget, 4, dt);
    if (Math.abs(this.camera.fov - this.fov) > 0.05) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  /** Punto al que apunta la mira (centro de pantalla): mundo o cazadores. */
  computeAim(world: World, hunters: HunterManager): void {
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
    if (!found) this.aimPoint.copy(end);
  }
}
