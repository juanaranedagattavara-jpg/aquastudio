import type { Vector3 } from 'three';
import type { Spatial } from '../core/spatial';

export type TreeKind = 'canopy' | 'giant' | 'palm' | 'ancestral' | 'hut';

/** Superficie transitable con forma de cúpula (copa de árbol, cima de palmera). */
export interface Platform extends Spatial {
  x: number;
  z: number;
  y: number; // altura en el centro
  R: number;
  sag: number; // cuánto baja en el borde
  kind: 'crown' | 'palm' | 'giant' | 'ancestral' | 'roof';
  cone?: boolean; // perfil lineal (tejado) en vez de cúpula
}

/** Tronco vertical: colisión cilíndrica y superficie trepable. */
export interface Trunk extends Spatial {
  x: number;
  z: number;
  r: number;
  y0: number;
  y1: number;
  kind: TreeKind;
  climbable: boolean;
  buttress: number; // radio extra de las raíces tabulares cerca del suelo
  taper: number; // radio en la cima relativo a la base
  platform: Platform | null;
}

/** Rama o tronco caído: cilindro transitable. */
export interface Branch extends Spatial {
  a: Vector3;
  b: Vector3;
  r: number;
}

/** Volumen de follaje que bloquea parcialmente la visión de los cazadores. */
export interface Crown extends Spatial {
  x: number;
  y: number;
  z: number;
  r: number;
}

export interface VineSpec {
  anchor: Vector3;
  length: number;
}

export interface Camp {
  x: number;
  z: number;
  y: number;
}

export interface SupportHit {
  y: number;
  kind: 'terrain' | 'branch' | 'platform';
  platform: Platform | null;
}
