// Parámetros de juego centralizados. Todo lo que afecta al "feel" está aquí
// para poder ajustarlo sin tocar la lógica.

export const SEED = 20251005;

export const GRAVITY = 20; // m/s² para el mono (algo más que la real para que el control sea ágil)
export const ARROW_GRAVITY = 9.81;
export const NUT_GRAVITY = 14;
export const WORLD_HALF = 250; // el mapa jugable va de -WORLD_HALF a +WORLD_HALF
export const PLAY_RADIUS = 232; // límite blando para el jugador
export const WATER_LEVEL = 0;
export const GOLDEN_COUNT = 8;

export const PLAYER = {
  radius: 0.35,
  height: 1.1,
  runSpeed: 7.2,
  sprintSpeed: 11,
  groundAccel: 42,
  groundDecel: 30,
  airAccel: 11,
  airMaxSpeed: 7.5,
  jumpVel: 8.4,
  sprintJumpBonus: 0.8,
  coyoteTime: 0.13,
  jumpBuffer: 0.15,
  maxFall: 44,
  gripReach: 1.66, // de los pies a la mano cuando cuelga de una liana (modelo a escala 1.15)
  handHeight: 1.4, // altura de la mano al intentar agarrar en el aire
  grabRadius: 1.2,
  pumpAccel: 8.5,
  swingMaxSpeed: 27,
  swingDamping: 0.07,
  ropeClimbSpeed: 3.8,
  releaseUp: 4.4,
  releaseForward: 2.0,
  climbSpeed: 4.4,
  climbAround: 3.4,
  trunkJumpOut: 7.8,
  trunkJumpUp: 7.4,
  swimSpeed: 2.9,
  fallDamageSpeed: 25,
  maxHp: 100,
  regenDelay: 7,
  regenRate: 3,
  dodgeSpeed: 12.5,
  dodgeTime: 0.3,
  dodgeCooldown: 0.8,
  poundSpeed: 30,
  maxNuts: 8,
  startNuts: 3,
  nutSpeed: 30,
};

export interface Difficulty {
  key: 'facil' | 'normal' | 'dificil';
  label: string;
  arrowDamage: number;
  meleeDamage: number;
  spreadDeg: number; // dispersión de puntería
  drawTime: number; // segundos tensando el arco (telegrafía el disparo)
  maxDrawers: number; // cuántos cazadores pueden apuntar a la vez
  baseHunters: number;
  perGolden: number;
  maxHunters: number;
  detectMul: number;
  cooldown: [number, number];
  leadFactor: number; // cuánto anticipan el movimiento del mono
  arrowSpeed: number;
}

export const DIFFICULTIES: Record<Difficulty['key'], Difficulty> = {
  facil: {
    key: 'facil', label: 'Fácil', arrowDamage: 11, meleeDamage: 8, spreadDeg: 3.4, drawTime: 1.25,
    maxDrawers: 1, baseHunters: 5, perGolden: 0.6, maxHunters: 9, detectMul: 0.7,
    cooldown: [2.8, 4.0], leadFactor: 0.6, arrowSpeed: 36,
  },
  normal: {
    key: 'normal', label: 'Normal', arrowDamage: 17, meleeDamage: 12, spreadDeg: 2.3, drawTime: 0.95,
    maxDrawers: 2, baseHunters: 7, perGolden: 1, maxHunters: 13, detectMul: 1,
    cooldown: [2.0, 3.1], leadFactor: 0.85, arrowSpeed: 40,
  },
  dificil: {
    key: 'dificil', label: 'Difícil', arrowDamage: 24, meleeDamage: 16, spreadDeg: 1.5, drawTime: 0.75,
    maxDrawers: 3, baseHunters: 9, perGolden: 1.3, maxHunters: 16, detectMul: 1.35,
    cooldown: [1.5, 2.4], leadFactor: 1, arrowSpeed: 44,
  },
};

export type PowerKind = 'acai' | 'guarana' | 'cupuacu' | 'maracuja' | 'camu' | 'jabuticaba';

export interface PowerDef {
  kind: PowerKind;
  fruit: string;
  name: string;
  desc: string;
  duration: number;
  color: number;
  css: string;
}

export const POWERS: Record<PowerKind, PowerDef> = {
  acai: {
    kind: 'acai', fruit: 'Açaí', name: 'Fuerza', desc: 'Golpes que noquean de un impacto',
    duration: 18, color: 0x8a3fd1, css: '#a35cf0',
  },
  guarana: {
    kind: 'guarana', fruit: 'Guaraná', name: 'Energía', desc: 'Más velocidad, salto y balanceo',
    duration: 20, color: 0xff4a2a, css: '#ff5a3a',
  },
  cupuacu: {
    kind: 'cupuacu', fruit: 'Cupuaçu', name: 'Escudo', desc: 'Las flechas rebotan en ti',
    duration: 15, color: 0xe0a24a, css: '#f0b45a',
  },
  maracuja: {
    kind: 'maracuja', fruit: 'Maracujá', name: 'Camuflaje', desc: 'Los cazadores no te ven',
    duration: 16, color: 0xf2d43a, css: '#f7dc4a',
  },
  camu: {
    kind: 'camu', fruit: 'Camu-camu', name: 'Vitalidad', desc: '+40 de vida y regeneración',
    duration: 10, color: 0xff2f62, css: '#ff4b78',
  },
  jabuticaba: {
    kind: 'jabuticaba', fruit: 'Jabuticaba', name: 'Instinto', desc: 'El tiempo se ralentiza a tu alrededor',
    duration: 9, color: 0x6a5cff, css: '#8b80ff',
  },
};

export const POWER_ORDER: PowerKind[] = ['acai', 'guarana', 'cupuacu', 'maracuja', 'camu', 'jabuticaba'];

export const SCORE = {
  golden: 1000,
  power: 150,
  banana: 40,
  nut: 10,
  ko: 250,
  kickBonus: 150,
  vineBase: 30,
};
