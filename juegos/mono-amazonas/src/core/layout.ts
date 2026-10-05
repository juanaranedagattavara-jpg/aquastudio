import { IS_TOUCH_DEVICE } from './device';

/**
 * En táctiles el juego es SIEMPRE horizontal. Si la pantalla está en vertical
 * (giro bloqueado, o una app que no rota), todo el escenario se dibuja girado
 * 90° a tamaño completo para jugar con el teléfono de lado. Si el sistema sí
 * rota la pantalla a horizontal, se muestra sin girar.
 *
 * Giro elegido: el teléfono se tumba con la parte de arriba hacia la izquierda.
 */
export const layout = {
  rotated: false,
  /** Ancho y alto del escenario (siempre horizontal en táctiles). */
  w: typeof window !== 'undefined' ? window.innerWidth : 1280,
  h: typeof window !== 'undefined' ? window.innerHeight : 720,
};

export function updateLayout(): void {
  const vw = window.innerWidth, vh = window.innerHeight;
  layout.rotated = IS_TOUCH_DEVICE && vh > vw;
  layout.w = layout.rotated ? vh : vw;
  layout.h = layout.rotated ? vw : vh;
  const stage = document.getElementById('stage');
  if (stage) {
    if (layout.rotated) {
      stage.style.width = `${vh}px`;
      stage.style.height = `${vw}px`;
      stage.style.transform = `translate(${vw}px, 0) rotate(90deg)`;
    } else {
      stage.style.width = '';
      stage.style.height = '';
      stage.style.transform = '';
    }
  }
  document.body.classList.toggle('rotated', layout.rotated);
  document.body.classList.toggle('narrow', layout.w < 760);
  const root = document.documentElement.style;
  root.setProperty('--sw', `${layout.w}px`);
  root.setProperty('--sh', `${layout.h}px`);
}

/** Coordenadas de pantalla (clientX/Y de un toque) → coordenadas del escenario. */
export function toStage(x: number, y: number): [number, number] {
  return layout.rotated ? [y, window.innerWidth - x] : [x, y];
}

/**
 * Desplazamiento táctil propio para las pantallas de menú cuando el escenario
 * está girado: el gesto nativo no sigue el eje girado de forma fiable.
 */
export function enableRotatedScroll(): void {
  document.querySelectorAll<HTMLElement>('.screen').forEach((el) => {
    let id = -1;
    let lastY = 0;
    let moved = 0;
    el.addEventListener('touchstart', (e) => {
      if (!layout.rotated || id !== -1) return;
      const t = e.changedTouches[0];
      id = t.identifier;
      lastY = toStage(t.clientX, t.clientY)[1];
      moved = 0;
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      if (!layout.rotated) return;
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== id) continue;
        const y = toStage(t.clientX, t.clientY)[1];
        el.scrollTop -= y - lastY;
        moved += Math.abs(y - lastY);
        lastY = y;
        if (e.cancelable && moved > 4) e.preventDefault();
      }
    }, { passive: false });
    const end = (e: TouchEvent): void => {
      for (const t of Array.from(e.changedTouches)) if (t.identifier === id) id = -1;
    };
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
  });
}
