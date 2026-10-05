// Detección de dispositivo: en móviles y tablets el juego usa controles
// táctiles y un modo gráfico ligero (menos geometría y menos distancia de dibujado).

const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const iPadOS = typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

export const IS_TOUCH_DEVICE = coarse || iPadOS || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

function liteOverride(): boolean | null {
  try {
    const v = new URLSearchParams(location.search).get('lite');
    return v === null ? null : v !== '0';
  } catch {
    return null;
  }
}

/** Modo ligero: activado en táctiles (forzable con ?lite=1 / ?lite=0). */
export const LITE = liteOverride() ?? IS_TOUCH_DEVICE;

/** Tamaño de los trozos de instancing (equilibrio entre descartar lo invisible y nº de draw calls). */
export const CHUNK = 90;

/** Distancia a la que se dejan de dibujar personajes y objetos pequeños (la niebla ya los oculta). */
export const DETAIL_FAR = LITE ? 75 : 125;

/** Distancia máxima de dibujado. */
export const VIEW_FAR = LITE ? 190 : 290;

/** Vibración corta (Android); se ignora donde no exista o esté bloqueada. */
export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* sin vibración */
  }
}
