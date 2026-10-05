import { Vector3 } from 'three';

export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number): number => clamp((v - a) / (b - a), 0, 1);

/** Interpolación exponencial independiente del framerate. */
export const damp = (a: number, b: number, lambda: number, dt: number): number =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function wrapAngle(a: number): number {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}

export const dampAngle = (a: number, b: number, lambda: number, dt: number): number =>
  a + wrapAngle(b - a) * (1 - Math.exp(-lambda * dt));

export function dampVec3(v: Vector3, target: Vector3, lambda: number, dt: number): Vector3 {
  const t = 1 - Math.exp(-lambda * dt);
  v.x += (target.x - v.x) * t;
  v.y += (target.y - v.y) * t;
  v.z += (target.z - v.z) * t;
  return v;
}

/** Parámetro t∈[0,1] del punto de AB más cercano a P. */
export function segmentT(p: Vector3, a: Vector3, b: Vector3): number {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const len2 = abx * abx + aby * aby + abz * abz;
  if (len2 < 1e-9) return 0;
  return clamp(((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / len2, 0, 1);
}

/** Distancia² de P al segmento AB; escribe el punto más cercano en out si se pasa. */
export function distToSegmentSq(p: Vector3, a: Vector3, b: Vector3, out?: Vector3): number {
  const t = segmentT(p, a, b);
  const cx = a.x + (b.x - a.x) * t, cy = a.y + (b.y - a.y) * t, cz = a.z + (b.z - a.z) * t;
  if (out) out.set(cx, cy, cz);
  const dx = p.x - cx, dy = p.y - cy, dz = p.z - cz;
  return dx * dx + dy * dy + dz * dz;
}

/** t∈[0,1] del primer contacto del segmento P0P1 con la esfera (c, r), o -1. */
export function segmentSphereHit(p0: Vector3, p1: Vector3, c: Vector3, r: number): number {
  const dx = p1.x - p0.x, dy = p1.y - p0.y, dz = p1.z - p0.z;
  const fx = p0.x - c.x, fy = p0.y - c.y, fz = p0.z - c.z;
  const a = dx * dx + dy * dy + dz * dz;
  if (a < 1e-12) return fx * fx + fy * fy + fz * fz <= r * r ? 0 : -1;
  const b = 2 * (fx * dx + fy * dy + fz * dz);
  const cc = fx * fx + fy * fy + fz * fz - r * r;
  if (cc <= 0) return 0;
  const disc = b * b - 4 * a * cc;
  if (disc < 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

/**
 * Intersección 2D (plano XZ) de un segmento con un círculo (tronco).
 * Devuelve t∈[0,1] de entrada o -1.
 */
export function segmentCircleXZ(
  x0: number, z0: number, x1: number, z1: number, cx: number, cz: number, r: number,
): number {
  const dx = x1 - x0, dz = z1 - z0;
  const fx = x0 - cx, fz = z0 - cz;
  const a = dx * dx + dz * dz;
  const c = fx * fx + fz * fz - r * r;
  if (c <= 0) return 0;
  if (a < 1e-12) return -1;
  const b = 2 * (fx * dx + fz * dz);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

/** Mueve el vector horizontal (vx,vz) hacia (tx,tz) como máximo maxDelta. */
export function moveTowardsXZ(v: Vector3, tx: number, tz: number, maxDelta: number): void {
  const dx = tx - v.x, dz = tz - v.z;
  const d = Math.hypot(dx, dz);
  if (d <= maxDelta || d < 1e-9) {
    v.x = tx;
    v.z = tz;
  } else {
    v.x += (dx / d) * maxDelta;
    v.z += (dz / d) * maxDelta;
  }
}

/**
 * Velocidad inicial para alcanzar `to` desde `from` con rapidez `speed` y gravedad `g`
 * (trayectoria baja). Devuelve false si está fuera de alcance.
 */
export function solveBallistic(from: Vector3, to: Vector3, speed: number, g: number, out: Vector3): boolean {
  const dx = to.x - from.x, dz = to.z - from.z;
  const D = Math.hypot(dx, dz);
  const H = to.y - from.y;
  if (D < 0.01) {
    out.set(0, Math.sign(H || 1) * speed, 0);
    return true;
  }
  const v2 = speed * speed;
  const disc = v2 * v2 - g * (g * D * D + 2 * H * v2);
  if (disc < 0) return false;
  const theta = Math.atan2(v2 - Math.sqrt(disc), g * D);
  const c = Math.cos(theta) * speed;
  out.set((dx / D) * c, Math.sin(theta) * speed, (dz / D) * c);
  return true;
}
