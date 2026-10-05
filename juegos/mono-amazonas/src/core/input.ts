// Entrada unificada: teclado + ratón (pointer lock o arrastre) + controles táctiles.

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
  private touchSprint = false;

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
    if (a === 'sprint' && this.touchSprint) return true;
    return this.down.has(a);
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
    const R = 55;

    const activate = (): void => this.enableTouch();

    joy.addEventListener('touchstart', (e) => {
      activate();
      const t = e.changedTouches[0];
      joyId = t.identifier;
      const r = joy.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      e.preventDefault();
    }, { passive: false });

    const area = this.canvas;
    area.addEventListener('touchstart', (e) => {
      activate();
      for (const t of Array.from(e.changedTouches)) {
        if (lookId === -1 && t.clientX > window.innerWidth * 0.35) {
          lookId = t.identifier;
          this.lastX = t.clientX;
          this.lastY = t.clientY;
        }
      }
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyId) {
          let dx = t.clientX - cx, dy = t.clientY - cy;
          const d = Math.hypot(dx, dy);
          if (d > R) {
            dx *= R / d;
            dy *= R / d;
          }
          knob.style.transform = `translate(${dx}px, ${dy}px)`;
          this.joyX = dx / R;
          this.joyY = -dy / R;
          this.touchSprint = d > R * 0.92;
        } else if (t.identifier === lookId) {
          this.mouseDX += (t.clientX - this.lastX) * 1.6;
          this.mouseDY += (t.clientY - this.lastY) * 1.6;
          this.lastX = t.clientX;
          this.lastY = t.clientY;
        }
      }
    }, { passive: true });

    const end = (e: TouchEvent): void => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyId) {
          joyId = -1;
          this.joyX = this.joyY = 0;
          this.touchSprint = false;
          knob.style.transform = '';
        }
        if (t.identifier === lookId) lookId = -1;
      }
    };
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);

    root.querySelectorAll<HTMLElement>('[data-act]').forEach((btn) => {
      const act = btn.dataset.act as Action;
      btn.addEventListener('touchstart', (e) => {
        activate();
        this.press(act);
        btn.classList.add('on');
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
      const up = (e: TouchEvent): void => {
        this.release(act);
        btn.classList.remove('on');
        e.preventDefault();
      };
      btn.addEventListener('touchend', up, { passive: false });
      btn.addEventListener('touchcancel', up, { passive: false });
    });
  }
}
