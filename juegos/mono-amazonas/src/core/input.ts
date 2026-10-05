// Entrada unificada: teclado + ratón (pointer lock o arrastre) + controles táctiles.

import { toStage } from './layout';

export type Action = 'jump' | 'sprint' | 'crouch' | 'grab' | 'attack' | 'throw' | 'dodge' | 'pause';

const KEYMAP: Record<string, Action> = {
  Space: 'jump',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
  KeyC: 'crouch',
  KeyE: 'grab',
  KeyF: 'grab',
  KeyJ: 'attack',
  KeyK: 'throw',
  KeyQ: 'dodge',
  Escape: 'pause',
  KeyP: 'pause',
};

const BLOCK_DEFAULT = new Set([
  'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'ShiftLeft', 'ShiftRight',
]);

export class Input {
  private down = new Set<Action>();
  private pressed = new Set<Action>();
  private released = new Set<Action>();
  private keys = new Set<string>();

  mouseDX = 0;
  mouseDY = 0;
  wheel = 0;
  pointerLocked = false;
  /** 'lock' usa pointer lock; 'drag' (fallback/iframes) gira la cámara arrastrando con el botón derecho. */
  lookMode: 'lock' | 'drag' = 'lock';
  enabled = false;
  onPointerLockLost: (() => void) | null = null;
  /** Se llama al pasar a modo arrastre (iframes o navegadores sin pointer lock). */
  onDragMode: (() => void) | null = null;
  private lockErrors = 0;

  // Táctil
  touchActive = false;
  private joyX = 0;
  private joyY = 0;
  /** Joystick empujado al fondo: correr por el suelo (no sube por la liana). */
  joyFull = false;

  private dragging = false;
  private dragMoved = 0;
  private lastX = 0;
  private lastY = 0;

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => this.clearAll());

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('wheel', (e) => {
      this.wheel += Math.sign(e.deltaY);
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === this.canvas;
      const was = this.pointerLocked;
      this.pointerLocked = locked;
      if (locked) this.lockErrors = 0;
      if (was && !locked && this.onPointerLockLost) this.onPointerLockLost();
    });
    document.addEventListener('pointerlockerror', () => this.lockFailed());

    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    if (coarse || 'ontouchstart' in window) this.setupTouch();
  }

  requestLock(): void {
    if (this.lookMode !== 'lock' || this.touchActive) return;
    const el = this.canvas as HTMLCanvasElement & { requestPointerLock?: () => unknown };
    if (!el.requestPointerLock) {
      this.setDragMode();
      return;
    }
    try {
      const r = el.requestPointerLock() as Promise<void> | undefined;
      if (r && typeof r.catch === 'function') r.catch(() => this.lockFailed());
    } catch {
      this.lockFailed();
    }
  }

  /** Un fallo aislado (p. ej. reintentar justo tras pulsar Esc) no cambia el modo; varios seguidos sí. */
  private lockFailed(): void {
    this.lockErrors++;
    if (this.lockErrors >= 2) this.setDragMode();
  }

  private setDragMode(): void {
    if (this.lookMode === 'drag') return;
    this.lookMode = 'drag';
    this.onDragMode?.();
  }

  exitLock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  private onKey(e: KeyboardEvent, isDown: boolean): void {
    if (BLOCK_DEFAULT.has(e.code) && this.enabled) e.preventDefault();
    if (isDown) this.keys.add(e.code);
    else this.keys.delete(e.code);
    const a = KEYMAP[e.code];
    if (!a) return;
    if (isDown) {
      if (!e.repeat && !this.down.has(a)) this.pressed.add(a);
      this.down.add(a);
    } else {
      // Puede haber dos teclas para la misma acción: solo se suelta si ninguna sigue pulsada.
      const still = Object.entries(KEYMAP).some(([code, act]) => act === a && this.keys.has(code));
      if (!still) {
        this.down.delete(a);
        this.released.add(a);
      }
    }
  }

  private press(a: Action): void {
    if (!this.down.has(a)) this.pressed.add(a);
    this.down.add(a);
  }

  private release(a: Action): void {
    if (this.down.has(a)) this.released.add(a);
    this.down.delete(a);
  }

  private onMouseDown(e: MouseEvent): void {
    if (!this.enabled) return;
    if (this.lookMode === 'lock' && !this.pointerLocked) {
      this.requestLock();
      return;
    }
    if (e.button === 0) this.press('attack');
    if (e.button === 2) {
      if (this.lookMode === 'drag') {
        this.dragging = true;
        this.dragMoved = 0;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      } else {
        this.press('throw');
      }
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (e.button === 0) this.release('attack');
    if (e.button === 2) {
      if (this.dragging) {
        this.dragging = false;
        if (this.dragMoved < 6) {
          this.pressed.add('throw');
          this.released.add('throw');
        }
      } else {
        this.release('throw');
      }
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.enabled) return;
    if (this.pointerLocked) {
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    } else if (this.dragging) {
      const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      this.mouseDX += dx;
      this.mouseDY += dy;
    }
  }

  private clearAll(): void {
    for (const a of this.down) this.released.add(a);
    this.down.clear();
    this.keys.clear();
    this.dragging = false;
  }

  isDown(a: Action): boolean {
    return this.down.has(a);
  }

  /** Suelta una acción (p. ej. cuando un botón táctil desaparece mientras se pulsa). */
  releaseAction(a: Action): void {
    this.release(a);
  }
  wasPressed(a: Action): boolean {
    return this.pressed.has(a);
  }
  wasReleased(a: Action): boolean {
    return this.released.has(a);
  }

  /** Eje lateral (-1 izquierda, +1 derecha). */
  moveX(): number {
    let x = 0;
    if (this.keys.has('KeyD')) x += 1;
    if (this.keys.has('KeyA')) x -= 1;
    return Math.max(-1, Math.min(1, x + this.joyX));
  }
  /** Eje adelante (+1) / atrás (-1). */
  moveY(): number {
    let y = 0;
    if (this.keys.has('KeyW')) y += 1;
    if (this.keys.has('KeyS')) y -= 1;
    return Math.max(-1, Math.min(1, y + this.joyY));
  }
  /** Giro de cámara con flechas (rad/s normalizado). */
  lookKeysX(): number {
    return (this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('ArrowLeft') ? 1 : 0);
  }
  lookKeysY(): number {
    return (this.keys.has('ArrowDown') ? 1 : 0) - (this.keys.has('ArrowUp') ? 1 : 0);
  }

  endFrame(): void {
    this.pressed.clear();
    this.released.clear();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
  }

  // ---------------------------------------------------------------- táctil
  /** Activa el esquema táctil (joystick + botones, arrastrar para mirar). */
  enableTouch(): void {
    if (this.touchActive) return;
    this.touchActive = true;
    this.lookMode = 'drag';
    document.body.classList.add('touch-mode');
  }

  private setupTouch(): void {
    const root = document.getElementById('touch');
    if (!root) return;
    const joy = root.querySelector<HTMLElement>('.joy')!;
    const knob = root.querySelector<HTMLElement>('.joy-knob')!;
    let joyId = -1;
    let lookId = -1;
    let cx = 0, cy = 0;
    const R = 56;

    // El joystick aparece donde se apoya el pulgar en la mitad izquierda.
    const startJoy = (t: Touch): void => {
      joyId = t.identifier;
      [cx, cy] = toStage(t.clientX, t.clientY);
      joy.style.left = `${cx - 70}px`;
      joy.style.top = `${cy - 70}px`;
      joy.style.bottom = 'auto';
      joy.classList.add('active');
    };
    const endJoy = (): void => {
      joyId = -1;
      this.joyX = this.joyY = 0;
      this.joyFull = false;
      knob.style.transform = '';
      joy.style.left = '';
      joy.style.top = '';
      joy.style.bottom = '';
      joy.classList.remove('active');
    };

    this.canvas.addEventListener('touchstart', (e) => {
      this.enableTouch();
      for (const t of Array.from(e.changedTouches)) {
        // coordenadas del escenario: el juego puede estar girado 90° (siempre horizontal)
        const [x, y] = toStage(t.clientX, t.clientY);
        const stageW = this.canvas.clientWidth || window.innerWidth;
        if (joyId === -1 && x < stageW * 0.42) startJoy(t);
        else if (lookId === -1) {
          lookId = t.identifier;
          this.lastX = x;
          this.lastY = y;
        }
      }
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) {
        const [x, y] = toStage(t.clientX, t.clientY);
        if (t.identifier === joyId) {
          let dx = x - cx, dy = y - cy;
          const d = Math.hypot(dx, dy);
          if (d > R) {
            dx *= R / d;
            dy *= R / d;
          }
          knob.style.transform = `translate(${dx}px, ${dy}px)`;
          // zona muerta pequeña para que el mono no se arrastre solo
          const k = d < 6 ? 0 : 1;
          this.joyX = (dx / R) * k;
          this.joyY = (-dy / R) * k;
          this.joyFull = d > R * 0.9;
        } else if (t.identifier === lookId) {
          this.mouseDX += (x - this.lastX) * 1.5;
          this.mouseDY += (y - this.lastY) * 1.5;
          this.lastX = x;
          this.lastY = y;
        }
      }
    }, { passive: true });

    const end = (e: TouchEvent): void => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyId) endJoy();
        if (t.identifier === lookId) lookId = -1;
      }
    };
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);

    root.querySelectorAll<HTMLElement>('[data-act]').forEach((btn) => {
      const act = btn.dataset.act as Action;
      btn.addEventListener('touchstart', (e) => {
        this.enableTouch();
        this.press(act);
        btn.classList.add('on');
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      const up = (e: TouchEvent): void => {
        this.release(act);
        btn.classList.remove('on');
        if (e.cancelable) e.preventDefault();
      };
      btn.addEventListener('touchend', up, { passive: false });
      btn.addEventListener('touchcancel', up, { passive: false });
    });
  }
}
