import type { Scene, Vector3 } from 'three';
import type { Difficulty } from '../config';
import type { AudioSys } from '../core/audio';
import type { Particles } from '../fx/particles';
import type { World } from '../world/world';
import type { Monkey } from '../player/monkey';
import type { HunterManager } from '../enemies/hunterManager';
import type { Projectiles } from '../combat/projectiles';
import type { Pickups } from '../items/pickups';
import type { HUD } from '../ui/hud';
import type { ThirdPersonCamera } from '../camera/thirdPersonCamera';

export interface Stats {
  score: number;
  golden: number;
  kos: number;
  vines: number;
  maxCombo: number;
  fruits: number;
  damageTaken: number;
  time: number;
}

export const newStats = (): Stats => ({
  score: 0, golden: 0, kos: 0, vines: 0, maxCombo: 0, fruits: 0, damageTaken: 0, time: 0,
});

/** Referencias compartidas entre sistemas (evita dependencias circulares en tiempo de ejecución). */
export interface GameContext {
  scene: Scene;
  world: World;
  audio: AudioSys;
  fx: Particles;
  player: Monkey;
  hunters: HunterManager;
  projectiles: Projectiles;
  pickups: Pickups;
  hud: HUD;
  cam: ThirdPersonCamera;
  stats: Stats;
  diff: Difficulty;
  time: number;
  /** Escala de tiempo para enemigos y flechas (Jabuticaba la reduce). */
  enemyScale: number;
  /** Ruido audible por los cazadores. */
  noise(pos: Vector3, radius: number): void;
  addScore(points: number, at?: Vector3, label?: string): void;
  /** Congela la acción unos milisegundos para dar peso a los golpes. */
  hitStop(seconds: number): void;
}
