import {
  AdditiveBlending, CylinderGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Sprite, SpriteMaterial, Vector3,
} from 'three';
import { GOLDEN_COUNT, PLAYER, POWER_ORDER, POWERS, SCORE, WATER_LEVEL, type PowerKind } from '../config';
import { TAU } from '../core/math';
import { Rng } from '../core/random';
import type { GameContext } from '../game/context';
import type { World } from '../world/world';
import { fruitGeometry, type FruitKind } from './fruitModels';

interface Pickup {
  kind: FruitKind;
  base: Vector3;
  mesh: Mesh;
  glow: Sprite | null;
  beam: Mesh | null;
  active: boolean;
  respawn: number;
  timer: number;
  phase: number;
  temporary: boolean;
  life: number;
}

const RESPAWN: Record<string, number> = { power: 70, banana: 50, castanha: 35 };

/** Frutas y objetos recogibles: colocación inteligente por el mapa y sus efectos. */
export class Pickups {
  readonly items: Pickup[] = [];
  private fruitMat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.45 });
  private goldenMat = new MeshStandardMaterial({
    vertexColors: true, roughness: 0.25, metalness: 0.4, emissive: '#ffae00', emissiveIntensity: 0.9,
  });
  private beamGeo = new CylinderGeometry(0.5, 0.9, 110, 12, 1, true).translate(0, 55, 0);
  private tmp = new Vector3();

  constructor(private ctx: GameContext) {}

  private create(kind: FruitKind, at: Vector3, temporary = false): Pickup {
    const ctx = this.ctx;
    const mesh = new Mesh(fruitGeometry(kind), kind === 'golden' ? this.goldenMat : this.fruitMat);
    mesh.position.copy(at);
    mesh.castShadow = true;
    ctx.scene.add(mesh);
    let glow: Sprite | null = null;
    let beam: Mesh | null = null;
    const isPower = (POWER_ORDER as string[]).includes(kind);
    if (isPower || kind === 'golden') {
      const c = kind === 'golden' ? '#ffcf40' : POWERS[kind as PowerKind].css;
      glow = new Sprite(new SpriteMaterial({
        map: ctx.world.glow, color: c, transparent: true, opacity: 0.8, blending: AdditiveBlending, depthWrite: false,
      }));
      glow.scale.setScalar(kind === 'golden' ? 2.2 : 1.3);
      glow.position.copy(at);
      ctx.scene.add(glow);
    }
    if (kind === 'golden') {
      beam = new Mesh(this.beamGeo, new MeshBasicMaterial({
        map: ctx.world.beam, color: '#ffd24a', transparent: true, opacity: 0.35, blending: AdditiveBlending,
        depthWrite: false, fog: false,
      }));
      beam.position.copy(at);
      ctx.scene.add(beam);
    }
    const p: Pickup = {
      kind, base: at.clone(), mesh, glow, beam, active: true, timer: 0, phase: Math.random() * TAU, temporary, life: 30,
      respawn: kind === 'golden' ? -1 : isPower ? RESPAWN.power : RESPAWN[kind] ?? 40,
    };
    this.items.push(p);
    return p;
  }

  clear(): void {
    for (const p of this.items) {
      this.ctx.scene.remove(p.mesh);
      if (p.glow) this.ctx.scene.remove(p.glow);
      if (p.beam) {
        this.ctx.scene.remove(p.beam);
        (p.beam.material as MeshBasicMaterial).dispose();
      }
      if (p.glow) p.glow.material.dispose();
    }
    this.items.length = 0;
  }

  /** Reparte las frutas por la selva usando la estructura del bosque. */
  populate(world: World): void {
    this.clear();
    const rng = new Rng(2024);
    const start = world.start;
    const f = world.forest;
    const taken: Vector3[] = [];
    const farFrom = (p: Vector3, d: number): boolean => taken.every((q) => q.distanceTo(p) >= d);
    const okPos = (p: Vector3): boolean => Math.abs(p.x) < 228 && Math.abs(p.z) < 228;

    // ------------------------------------------------ candidatos
    const branchSpots: Vector3[] = f.branches.map((b) => new Vector3().lerpVectors(b.a, b.b, 0.7).setY(b.a.y + (b.b.y - b.a.y) * 0.7 + b.r + 0.5));
    const crownSpots: Vector3[] = f.platforms.filter((p) => p.kind === 'crown').map((p) => new Vector3(p.x, p.y + 0.55, p.z));
    const palmSpots: Vector3[] = f.palms.filter((t) => t.y1 - t.y0 > 13).map((t) => new Vector3(t.x, t.platform!.y + 0.55, t.z));
    const swingSpots: Vector3[] = [];
    for (const v of world.vines.vines) {
      if (v.length < 9) continue;
      const a = rng.range(0, TAU);
      const ang = 0.7;
      const L = v.length * 0.85;
      const p = new Vector3(v.anchor.x + Math.cos(a) * Math.sin(ang) * L, v.anchor.y - Math.cos(ang) * L, v.anchor.z + Math.sin(a) * Math.sin(ang) * L);
      const g = Math.max(world.groundHeight(p.x, p.z), WATER_LEVEL);
      if (p.y - g < 3) continue;
      if (world.nearestTrunk(p, 1.5)) continue;
      swingSpots.push(p);
    }
    const groundSpots: Vector3[] = [];
    for (let i = 0; i < 900; i++) {
      const x = rng.range(-220, 220), z = rng.range(-220, 220);
      const y = world.groundHeight(x, z);
      if (y < 0.6) continue;
      const p = new Vector3(x, y + 0.45, z);
      if (world.nearestTrunk(p, 0.8)) continue;
      groundSpots.push(p);
    }
    const shuffle = <T>(a: T[]): T[] => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    shuffle(branchSpots);
    shuffle(crownSpots);
    shuffle(palmSpots);
    shuffle(swingSpots);
    shuffle(groundSpots);

    // ------------------------------------------------ frutos dorados (objetivo)
    const golden: Vector3[] = [];
    const tryGold = (list: Vector3[], n: number, pred: (p: Vector3) => boolean = () => true): void => {
      let k = 0;
      for (const p of list) {
        if (k >= n || golden.length >= GOLDEN_COUNT) break;
        if (!okPos(p) || !pred(p) || p.distanceTo(start) < 45 || !golden.every((q) => q.distanceTo(p) > 60)) continue;
        golden.push(p);
        k++;
      }
    };
    const giantTops = f.giants.map((t) => new Vector3(t.x, t.platform!.y + 0.6, t.z));
    tryGold(shuffle(giantTops), 3);
    tryGold(swingSpots, 2, (p) => world.terrain.distanceToWater(p.x, p.z) < 2);
    tryGold(world.campMeshes.platforms.map((p) => new Vector3(p.x, p.y + 0.5, p.z)), 2);
    tryGold(palmSpots, 1);
    tryGold(branchSpots, GOLDEN_COUNT, (p) => p.y - world.groundHeight(p.x, p.z) > 12);
    tryGold(crownSpots, GOLDEN_COUNT);
    for (const p of golden) {
      this.create('golden', p);
      taken.push(p);
    }

    // ------------------------------------------------ frutas de poder
    let pi = 0;
    const powerLists = [branchSpots, swingSpots, crownSpots, groundSpots, palmSpots];
    for (let round = 0; round < 6 && pi < 30; round++) {
      for (const list of powerLists) {
        for (const p of list) {
          if (pi >= 30) break;
          if (!okPos(p) || !farFrom(p, 26) || p.distanceTo(start) < 14) continue;
          this.create(POWER_ORDER[pi % POWER_ORDER.length], p);
          taken.push(p);
          pi++;
          break;
        }
      }
    }
    // una fruta de poder visible cerca del inicio para aprender
    const tutorial = new Vector3(start.x + 6, world.groundHeight(start.x + 6, start.z + 4) + 0.45, start.z + 4);
    this.create('guarana', tutorial);

    // ------------------------------------------------ plátanos (curan) y castañas (munición)
    let nb = 0;
    for (const p of [...branchSpots.slice(0, 200), ...groundSpots]) {
      if (nb >= 46) break;
      if (!okPos(p) || !farFrom(p, 14)) continue;
      this.create('banana', p);
      taken.push(p);
      nb++;
    }
    let nc = 0;
    for (const p of groundSpots) {
      if (nc >= 26) break;
      if (!okPos(p) || !farFrom(p, 12)) continue;
      this.create('castanha', p.clone().setY(p.y - 0.25));
      taken.push(p);
      nc++;
    }
    const startNut = new Vector3(start.x - 4, world.groundHeight(start.x - 4, start.z + 3) + 0.2, start.z + 3);
    this.create('castanha', startNut);
  }

  spawnDrop(at: Vector3): void {
    const p = this.create('castanha', this.tmp.copy(at).setY(this.ctx.world.groundHeight(at.x, at.z) + 0.2), true);
    p.respawn = -1;
  }

  goldenRemaining(): Vector3[] {
    return this.items.filter((p) => p.kind === 'golden' && p.active).map((p) => p.base);
  }

  update(dt: number, time: number): void {
    const ctx = this.ctx;
    const pl = ctx.player;
    const cam = ctx.cam.camera.position;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      if (!p.active) {
        if (p.respawn > 0) {
          p.timer -= dt;
          if (p.timer <= 0) this.setActive(p, true);
        }
        continue;
      }
      if (p.temporary) {
        p.life -= dt;
        if (p.life <= 0) {
          this.remove(i);
          continue;
        }
      }
      const far = p.base.distanceToSquared(cam) > 110 * 110;
      p.mesh.visible = !far;
      if (p.glow) p.glow.visible = !far;
      if (!far) {
        const bob = Math.sin(time * 2.2 + p.phase) * 0.12;
        p.mesh.position.set(p.base.x, p.base.y + bob, p.base.z);
        p.mesh.rotation.y = time * 1.2 + p.phase;
        if (p.glow) {
          p.glow.position.copy(p.mesh.position);
          p.glow.material.opacity = 0.55 + Math.sin(time * 4 + p.phase) * 0.2;
        }
      }
      if (p.beam) (p.beam.material as MeshBasicMaterial).opacity = 0.25 + Math.sin(time * 2 + p.phase) * 0.08;

      if (pl.dead) continue;
      const r = p.kind === 'golden' ? 1.7 : 1.35;
      if (p.mesh.position.distanceToSquared(pl.center) < r * r) {
        this.collect(p);
        if (p.temporary) this.remove(i);
      }
    }
  }

  private remove(i: number): void {
    const p = this.items[i];
    this.ctx.scene.remove(p.mesh);
    if (p.glow) {
      this.ctx.scene.remove(p.glow);
      p.glow.material.dispose();
    }
    this.items.splice(i, 1);
  }

  private setActive(p: Pickup, on: boolean): void {
    p.active = on;
    p.mesh.visible = on;
    if (p.glow) p.glow.visible = on;
    if (p.beam) p.beam.visible = on;
    if (!on) p.timer = p.respawn;
  }

  private collect(p: Pickup): void {
    const ctx = this.ctx;
    const pl = ctx.player;
    const at = p.mesh.position;
    this.setActive(p, false);
    ctx.stats.fruits++;
    switch (p.kind) {
      case 'golden': {
        ctx.stats.golden++;
        ctx.addScore(SCORE.golden, at, '¡Fruto dorado!');
        ctx.audio.play('golden');
        ctx.fx.burst(at, '#ffd24a', 60);
        ctx.hud.golden(ctx.stats.golden);
        ctx.cam.shake(0.3);
        break;
      }
      case 'banana': {
        pl.heal(14);
        ctx.addScore(SCORE.banana);
        ctx.audio.play('pickup', { vol: 0.6 });
        ctx.fx.burst(at, '#f2d040', 12);
        ctx.hud.toast('Plátano  +14 vida', '#f2d040', 1.2);
        break;
      }
      case 'castanha': {
        const before = pl.nuts;
        pl.nuts = Math.min(PLAYER.maxNuts, pl.nuts + 2);
        ctx.addScore(SCORE.nut);
        ctx.audio.play('pickup', { vol: 0.5, rate: 0.75 });
        ctx.hud.setNuts(pl.nuts);
        ctx.hud.toast(pl.nuts > before ? `Castañas: ${pl.nuts}  (clic derecho para lanzar)` : 'Castañas al máximo', '#e0b080', 1.4);
        break;
      }
      default: {
        const k = p.kind as PowerKind;
        const def = POWERS[k];
        pl.powers.grant(k);
        if (k === 'camu') pl.heal(40);
        ctx.addScore(SCORE.power);
        ctx.audio.play('power');
        ctx.fx.burst(at, def.css, 40);
        ctx.hud.toast(`${def.fruit} — ${def.name}: ${def.desc}`, def.css, 2.6);
        break;
      }
    }
  }
}
