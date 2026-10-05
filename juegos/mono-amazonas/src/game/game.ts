import {
  ACESFilmicToneMapping, AdditiveBlending, CylinderGeometry, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PCFShadowMap, Scene, SRGBColorSpace, TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { DIFFICULTIES, GOLDEN_COUNT, type Difficulty } from '../config';
import { AudioSys } from '../core/audio';
import { IS_TOUCH_DEVICE, LITE } from '../core/device';
import { layout, updateLayout } from '../core/layout';
import { Input } from '../core/input';
import { ThirdPersonCamera } from '../camera/thirdPersonCamera';
import { Projectiles } from '../combat/projectiles';
import { HunterManager } from '../enemies/hunterManager';
import { Particles } from '../fx/particles';
import { Pickups } from '../items/pickups';
import { Monkey } from '../player/monkey';
import { HUD } from '../ui/hud';
import { Menus, type Quality } from '../ui/menus';
import { TouchUI } from '../ui/touch';
import { World } from '../world/world';
import type { Platform } from '../world/types';
import { newStats, type GameContext, type Stats } from './context';

type Mode = 'loading' | 'menu' | 'playing' | 'paused' | 'over';

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

export class Game implements GameContext {
  readonly scene = new Scene();
  readonly renderer: WebGLRenderer;
  readonly audio = new AudioSys();
  readonly hud = new HUD();
  readonly cam: ThirdPersonCamera;
  readonly input: Input;
  readonly menus: Menus;
  world!: World;
  fx!: Particles;
  player!: Monkey;
  hunters!: HunterManager;
  projectiles!: Projectiles;
  pickups!: Pickups;
  stats: Stats = newStats();
  diff: Difficulty = DIFFICULTIES.normal;
  time = 0;
  enemyScale = 1;
  mode: Mode = 'loading';

  private last = 0;
  private hitStopT = 0;
  private won = false;
  private overT = 0;
  private hints = new Set<string>();
  private hintCd = 0;
  private smokeT = 0;
  private quality: Quality = 'alta';
  private ancestralPlatform!: Platform;
  private shrineRing!: Mesh;
  private shrineBeam!: Mesh;
  private objectiveDone = false;
  private reachedTopWithoutAll = 0;
  private tmp = new Vector3();
  private touchUI: TouchUI | null = null;
  // resolución dinámica: baja la resolución interna si los FPS caen y la recupera si sobran
  private prCap = 1;
  private resScale = 1;
  private frameEma = 1 / 60;
  private resTimer = 0;
  private goodChecks = 0;

  constructor(canvas: HTMLCanvasElement) {
    // en móvil sin antialias: es lo que más cuesta en GPUs de teléfono
    this.renderer = new WebGLRenderer({ canvas, antialias: !LITE, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    updateLayout();
    this.cam = new ThirdPersonCamera(layout.w / layout.h);
    this.input = new Input(canvas);
    this.input.onPointerLockLost = () => {
      if (this.mode === 'playing') this.pause();
    };
    this.input.onDragMode = () => {
      if (!this.input.touchActive) this.hud.hint('Cámara: mantén el clic derecho y arrastra (o usa las flechas). Clic izquierdo golpea, K lanza.', 7);
    };
    this.menus = new Menus({
      onPlay: (d, q) => this.start(d, q),
      onResume: () => this.resume(),
      onRestart: () => this.start(this.diff.key, this.quality),
      onMenu: () => this.toMenu(),
      onSettings: (s) => this.applySettings(s),
    });
    this.touchUI = IS_TOUCH_DEVICE || 'ontouchstart' in window ? new TouchUI(this.input) : null;
    this.menus.pauseRequested = () => {
      if (this.mode === 'playing') this.pause();
    };
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.mode === 'playing') this.pause();
    });
    (window as unknown as { __game: Game }).__game = this;
  }

  // ======================================================================== carga
  async load(): Promise<void> {
    this.menus.show('loading');
    this.menus.setLoading(0.1, 'Modelando el terreno y el río…');
    await nextFrame();
    this.world = new World(this.scene);
    this.menus.setLoading(0.7, 'Despertando a los animales…');
    await nextFrame();
    this.fx = new Particles(this.scene);
    this.player = new Monkey(this);
    this.hunters = new HunterManager(this);
    this.projectiles = new Projectiles(this);
    this.pickups = new Pickups(this);
    this.buildShrine();
    this.player.reset(this.world.start, 0);
    this.applySettings(this.menus.settings);
    this.applyQuality(this.menus.quality);
    this.resize();
    this.menus.setLoading(0.95, 'Preparando sombras…');
    await nextFrame();
    // primera compilación de shaders durante la carga
    this.renderer.compile(this.scene, this.cam.camera);
    this.menus.setLoading(1);
    this.toMenu();
    this.last = performance.now();
    this.renderer.setAnimationLoop((t) => this.loop(t));
  }

  private buildShrine(): void {
    const p = this.world.forest.ancestral.platform!;
    this.ancestralPlatform = p;
    const ring = new Mesh(
      new TorusGeometry(2.4, 0.18, 10, 40),
      new MeshStandardMaterial({ color: '#c8b070', emissive: '#7a6a30', emissiveIntensity: 0.6, roughness: 0.4 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(p.x, p.y + 0.25, p.z);
    this.scene.add(ring);
    this.shrineRing = ring;
    const beam = new Mesh(
      new CylinderGeometry(2.2, 2.6, 160, 20, 1, true).translate(0, 80, 0),
      new MeshBasicMaterial({
        map: this.world.beam, color: '#9dff6a', transparent: true, opacity: 0, blending: AdditiveBlending,
        depthWrite: false, fog: false,
      }),
    );
    beam.position.copy(ring.position);
    this.scene.add(beam);
    this.shrineBeam = beam;
  }

  // ======================================================================== estados
  private toMenu(): void {
    this.mode = 'menu';
    this.input.enabled = false;
    this.input.exitLock();
    this.hud.show(false);
    document.getElementById('touch')?.classList.add('hidden');
    document.getElementById('lockhint')?.classList.add('hidden');
    this.menus.show('menu');
    this.player.model.root.visible = false;
    this.player.model.shadow.visible = false;
  }

  start(diff: Difficulty['key'], quality: Quality): void {
    this.diff = DIFFICULTIES[diff];
    this.applyQuality(quality);
    this.audio.init();
    this.audio.setMuted(this.menus.settings.mute);
    this.stats = newStats();
    this.time = 0;
    this.won = false;
    this.overT = 0;
    this.objectiveDone = false;
    this.reachedTopWithoutAll = 0;
    this.hints.clear();
    this.hintCd = 0;
    const w = this.world;
    const toTree = this.tmp.subVectors(w.ancestralPos, w.start);
    const camYaw = Math.atan2(-toTree.x, -toTree.z);
    this.player.reset(w.start, Math.atan2(toTree.x, toTree.z));
    this.player.model.root.visible = true;
    this.cam.yaw = camYaw;
    this.cam.pitch = 0.22;
    this.cam.snap();
    this.projectiles.reset();
    this.pickups.populate(w);
    this.hunters.reset();
    this.hud.reset();
    this.hud.setNuts(this.player.nuts);
    (this.shrineBeam.material as MeshBasicMaterial).opacity = 0;
    this.menus.show('none');
    this.hud.show(true);
    this.mode = 'playing';
    this.input.enabled = true;
    this.input.requestLock();
    if (this.input.touchActive || IS_TOUCH_DEVICE) this.startTouch();
    this.audio.play('click');
    this.last = performance.now();
  }

  /** Modo táctil: controles en pantalla, pantalla completa y horizontal si el navegador lo permite. */
  private startTouch(): void {
    this.input.enableTouch();
    document.getElementById('touch')?.classList.remove('hidden');
    const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    try {
      if (!document.fullscreenElement && root.requestFullscreen) {
        root.requestFullscreen({ navigationUI: 'hide' })
          .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape'))
          .catch(() => { /* no permitido (iOS, iframes): se sigue sin pantalla completa */ });
      }
    } catch {
      /* sin pantalla completa */
    }
  }

  private pause(): void {
    if (this.mode !== 'playing') return;
    this.mode = 'paused';
    this.input.exitLock();
    this.menus.show('pause');
    document.getElementById('lockhint')?.classList.add('hidden');
    void this.audio.ctx?.suspend();
  }

  private resume(): void {
    if (this.mode !== 'paused') return;
    this.mode = 'playing';
    this.menus.show('none');
    this.input.requestLock();
    void this.audio.ctx?.resume();
    this.last = performance.now();
  }

  private gameOver(won: boolean): void {
    this.mode = 'over';
    this.input.enabled = false;
    this.input.exitLock();
    if (won) {
      const bonus = Math.max(0, Math.round((900 - this.stats.time) * 4));
      this.stats.score += bonus;
    }
    this.audio.play(won ? 'win' : 'lose');
    this.menus.showOver(won, this.stats, this.diff.label);
  }

  private applySettings(s: { sens: number; invert: boolean; mute: boolean }): void {
    this.cam.sensitivity = s.sens;
    this.cam.invertY = s.invert;
    this.audio.setMuted(s.mute);
  }

  private applyQuality(q: Quality): void {
    const changed = q !== this.quality;
    this.quality = q;
    const dpr = window.devicePixelRatio || 1;
    if (LITE) this.prCap = q === 'alta' ? Math.min(dpr, 1.6) : q === 'media' ? Math.min(dpr, 1.25) : Math.min(dpr, 1);
    else this.prCap = q === 'alta' ? Math.min(dpr, 2) : q === 'media' ? Math.min(dpr, 1.25) : Math.min(dpr, 1) * 0.8;
    this.resScale = 1;
    this.renderer.setPixelRatio(this.prCap);
    const sun = this.world.atmosphere.sun;
    const shadows = q !== 'baja';
    const size = q === 'alta' ? 2048 : 1024;
    if (sun.shadow.mapSize.x !== size) {
      sun.shadow.map?.dispose();
      (sun.shadow as unknown as { map: null }).map = null;
      sun.shadow.mapSize.set(size, size);
    }
    if (this.renderer.shadowMap.enabled !== shadows || changed) {
      this.renderer.shadowMap.enabled = shadows;
      sun.castShadow = shadows;
      this.scene.traverse((o) => {
        const m = (o as Mesh).material as Material | Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => (x.needsUpdate = true));
        else if (m) m.needsUpdate = true;
      });
    }
    this.resize();
  }

  private resize(): void {
    updateLayout();
    const w = layout.w, h = layout.h;
    this.renderer.setSize(w, h, false);
    // ventana estrecha (sólo escritorio: en táctil el escenario es siempre horizontal): FOV más abierto
    const aspect = w / h;
    this.cam.baseFov = aspect < 1 ? Math.min(95, 70 + (1 / aspect - 1) * 18) : 70;
    this.cam.camera.aspect = w / h;
    this.cam.camera.updateProjectionMatrix();
    this.fx?.setViewportHeight(h * this.renderer.getPixelRatio(), this.cam.camera.fov);
  }

  /** Ajusta la resolución interna según el tiempo de frame medido. */
  private adaptResolution(dt: number): void {
    this.frameEma += (dt - this.frameEma) * 0.05;
    this.resTimer += dt;
    if (this.resTimer < 1) return;
    this.resTimer = 0;
    let next = this.resScale;
    if (this.frameEma > 0.026) {
      next = Math.max(0.55, this.resScale * 0.85);
      this.goodChecks = 0;
    } else if (this.frameEma < 0.0185 && this.resScale < 1) {
      if (++this.goodChecks >= 3) {
        next = Math.min(1, this.resScale * 1.1);
        this.goodChecks = 0;
      }
    }
    if (Math.abs(next - this.resScale) > 0.01) {
      this.resScale = next;
      this.renderer.setPixelRatio(this.prCap * this.resScale);
      this.resize();
    }
  }

  // ======================================================================== contexto
  noise(pos: Vector3, radius: number): void {
    this.hunters.hearNoise(pos, radius);
  }

  addScore(points: number, at?: Vector3, label?: string): void {
    this.stats.score += points;
    if (at) this.hud.popup(label ? `${label} +${points}` : `+${points}`, at);
  }

  hitStop(seconds: number): void {
    this.hitStopT = Math.max(this.hitStopT, seconds);
  }

  // ======================================================================== bucle
  private loop(now: number): void {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (this.mode === 'playing') this.frame(dt);
    else this.idleFrame(dt);
    this.input.endFrame();
  }

  /** Menú / pausa: cámara cinemática alrededor del Gran Sumaúma. */
  private idleFrame(dt: number): void {
    if (this.mode === 'menu' || this.mode === 'loading') {
      const t = performance.now() * 0.001;
      const a = this.world.ancestralPos;
      const ang = t * 0.045;
      const cam = this.cam.camera;
      cam.position.set(a.x + Math.cos(ang) * 78, a.y + 46 + Math.sin(t * 0.2) * 4, a.z + Math.sin(ang) * 78);
      cam.lookAt(a.x, a.y + 38, a.z);
      if (cam.fov !== 60) {
        cam.fov = 60;
        cam.updateProjectionMatrix();
      }
      this.time += dt;
      this.world.update(dt, this.time, cam.position);
      this.world.atmosphere.update(dt, this.time, cam, cam.position, this.world.groundHeight(cam.position.x, cam.position.z));
      this.renderer.render(this.scene, cam);
      return;
    }
    if (this.mode === 'over') {
      // seguir animando el mundo de fondo
      this.time += dt;
      this.player.update(dt);
      this.hunters.update(dt);
      this.fx.update(dt);
      this.world.update(dt, this.time, this.player.pos);
      this.cam.update(dt, this.player, this.world);
      this.world.atmosphere.update(dt, this.time, this.cam.camera, this.player.pos, this.player.pos.y);
    }
    this.renderer.render(this.scene, this.cam.camera);
  }

  private frame(dt: number): void {
    const p = this.player;
    if (this.input.wasPressed('pause')) {
      this.pause();
      return;
    }
    const lockHint = document.getElementById('lockhint');
    lockHint?.classList.toggle('hidden', this.input.pointerLocked || this.input.lookMode !== 'lock' || this.input.touchActive);

    this.cam.handleInput(this.input, dt);
    p.readInput(this.input, this.cam.yaw);

    let gdt = dt;
    if (this.hitStopT > 0) {
      this.hitStopT -= dt;
      gdt = dt * 0.06;
    }
    this.time += gdt;
    this.stats.time += gdt;
    this.enemyScale = p.powers.has('jabuticaba') ? 0.35 : 1;

    p.update(gdt);
    this.hunters.update(gdt * this.enemyScale);
    this.projectiles.update(gdt * this.enemyScale, gdt);
    this.pickups.update(gdt, this.time);
    this.world.update(gdt, this.time, p.pos);
    this.fx.update(gdt);
    this.cam.update(dt, p, this.world);
    this.cam.computeAim(this.world, this.hunters, this.input.touchActive ? 0.42 : 0.05);
    this.cam.autoFollow = this.input.touchActive;
    if (this.input.touchActive) this.touchUI?.update(dt, p, this.world);
    this.adaptResolution(dt);
    const ground = this.world.groundHeight(this.cam.camera.position.x, this.cam.camera.position.z);
    this.world.atmosphere.update(dt, this.time, this.cam.camera, p.pos, ground);

    // humo de las hogueras
    this.smokeT -= dt;
    if (this.smokeT <= 0) {
      this.smokeT = 0.12;
      for (const f of this.world.campMeshes.fires) {
        if (f.distanceToSquared(p.pos) < 90 * 90) this.fx.smoke(this.tmp.set(f.x + Math.random() * 0.3, f.y + 0.4, f.z + Math.random() * 0.3));
      }
    }

    this.audio.setListener(this.cam.camera.position, this.cam.yaw);
    this.audio.update(dt, {
      riverDist: Math.max(0, this.world.terrain.distanceToWater(p.pos.x, p.pos.z)),
      height: this.cam.camera.position.y - ground,
      combat: this.hunters.combatLevel(),
      slowmo: p.powers.has('jabuticaba'),
      swingSpeed: p.state === 'swing' ? p.vel.length() : 0,
      underCanopy: p.pos.y - ground < 18,
    });

    this.updateObjective(dt);
    const goldens = this.pickups.goldenRemaining();
    this.hud.update(dt, {
      camera: this.cam.camera, camYaw: this.cam.yaw, player: p, hunters: this.hunters.hunters, goldens,
      ancestral: this.world.ancestralPos, objectiveDone: this.objectiveDone, score: this.stats.score,
    });
    this.tutorial(dt);

    if (p.dead) {
      this.overT += dt;
      if (this.overT > 2.4) this.gameOver(false);
    }
    this.renderer.render(this.scene, this.cam.camera);
  }

  private updateObjective(dt: number): void {
    const p = this.player;
    const done = this.stats.golden >= GOLDEN_COUNT;
    if (done && !this.objectiveDone) {
      this.objectiveDone = true;
      (this.shrineRing.material as MeshStandardMaterial).emissive.set('#9dff6a');
      this.showHint('ancestral', 'Sube a la copa del Gran Sumaúma (columna verde). Trepa su tronco o usa sus ramas en espiral.', 8);
    }
    const beamMat = this.shrineBeam.material as MeshBasicMaterial;
    beamMat.opacity = this.objectiveDone ? 0.35 + Math.sin(this.time * 2) * 0.08 : 0;
    this.shrineRing.rotation.z += dt * 0.4;

    const onTop = p.state === 'ground' && p.support.platform === this.ancestralPlatform;
    if (onTop) {
      if (this.objectiveDone && !this.won) {
        this.won = true;
        this.addScore(3000, p.pos, '¡Libre!');
        this.fx.burst(p.center, '#9dff6a', 80);
        this.gameOver(true);
      } else if (!this.objectiveDone) {
        this.reachedTopWithoutAll -= dt;
        if (this.reachedTopWithoutAll <= 0) {
          this.reachedTopWithoutAll = 8;
          this.hud.toast(`Necesitas los ${GOLDEN_COUNT} frutos dorados (tienes ${this.stats.golden}).`, '#ffcf40', 3);
        }
      }
    }
  }

  // ======================================================================== tutorial
  private showHint(id: string, text: string, dur = 6): boolean {
    if (this.hints.has(id) || this.hintCd > 0) return false;
    this.hints.add(id);
    this.hud.hint(text, dur);
    this.hintCd = dur * 0.8;
    return true;
  }

  private tutorial(dt: number): void {
    this.hintCd -= dt;
    const p = this.player;
    const t = this.stats.time;
    const touch = this.input.touchActive;
    if (t > 0.5) {
      this.showHint('move', touch
        ? 'Joystick para moverte (al máximo corres) · arrastra a la derecha para mirar · Saltar para saltar'
        : 'WASD para moverte · ratón para mirar · Espacio para saltar · Shift para correr', 6);
    }
    if (t > 7) this.showHint('goal', `Objetivo: reúne los ${GOLDEN_COUNT} frutos dorados (columnas de luz) y sube a la copa del Gran Sumaúma.`, 7);
    if (t > 14 && this.stats.vines === 0 && this.world.vines.nearestBottomDistance(p.pos, 8) < 6) {
      this.showHint('vine', 'Salta hacia una liana para agarrarla al vuelo.', 5);
    }
    if (p.state === 'swing') {
      this.showHint('swing', touch
        ? 'Inclina el joystick para impulsarte · ▲/▼ sube o baja por la liana · Saltar para soltarte con impulso'
        : 'W/A/S/D para impulsarte · Shift sube por la liana · C baja · Espacio te suelta con impulso', 7);
    }
    if (p.state === 'climb') {
      this.showHint('climb', touch
        ? 'Joystick arriba/abajo para subir y bajar, a los lados para rodear el tronco · arriba del todo subes a la copa · Saltar te lanza desde el tronco'
        : 'W/S sube y baja · A/D rodea el tronco · arriba del todo subes a la copa · Espacio salta desde el tronco', 7);
    } else if (t > 20 && this.world.nearestTrunk(p.pos, 1.2) && p.state === 'ground') {
      this.showHint('trunk', touch ? 'Pulsa Trepar junto a un tronco para subir.' : 'Pulsa E junto a un tronco (o salta contra él) para trepar.', 5);
    }
    if (p.state === 'air' && p.heightAboveGround() > 5 && this.stats.vines > 1) {
      this.showHint('air', touch
        ? 'En el aire: Golpe = patada voladora · Bajar = golpe al suelo · Esquivar para apartarte'
        : 'En el aire: clic = patada voladora · C = golpe al suelo · Q = esquivar', 6);
    }
    if (t > 45 && p.nuts > 0) {
      this.showHint('nuts', touch ? 'Lanzar arroja una castaña donde mira la cámara: aturde o distrae a los cazadores.' : 'Clic derecho lanza una castaña al punto de mira: aturde o distrae a los cazadores.', 6);
    }
  }
}
