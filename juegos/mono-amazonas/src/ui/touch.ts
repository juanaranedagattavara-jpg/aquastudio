import type { Action, Input } from '../core/input';
import type { Monkey } from '../player/monkey';
import type { World } from '../world/world';

interface BtnState {
  el: HTMLElement;
  visible: boolean;
  label: string;
  off: boolean;
}

/**
 * Botones táctiles contextuales: sólo aparece lo que sirve en cada momento
 * (Trepar junto a un tronco, ▲▼ colgado de una liana, Caída en el aire…).
 */
export class TouchUI {
  private btns = new Map<Action, BtnState>();
  private timer = 0;

  constructor(private input: Input) {
    document.querySelectorAll<HTMLElement>('#touch [data-act]').forEach((el) => {
      this.btns.set(el.dataset.act as Action, { el, visible: true, label: el.textContent ?? '', off: false });
    });
  }

  private set(a: Action, visible: boolean, label?: string, off = false): void {
    const b = this.btns.get(a);
    if (!b) return;
    if (b.visible !== visible) {
      b.visible = visible;
      b.el.hidden = !visible;
      // si desaparece con el dedo encima, que no quede "pulsado"
      if (!visible) {
        this.input.releaseAction(a);
        b.el.classList.remove('on');
      }
    }
    if (label !== undefined && label !== b.label) {
      b.label = label;
      b.el.textContent = label;
      b.el.classList.toggle('small', label.length > 2 && (a === 'crouch' || a === 'sprint'));
    }
    if (off !== b.off) {
      b.off = off;
      b.el.classList.toggle('off', off);
    }
  }

  update(dt: number, p: Monkey, world: World): void {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = 0.08;
    const s = p.state;
    const airborne = s === 'air' || s === 'swing';
    this.set('attack', true, airborne ? 'Patada' : 'Golpe');
    this.set('throw', true, `Lanzar ${p.nuts}`, p.nuts <= 0);
    const nearTrunk = s === 'ground' && !!world.nearestTrunk(p.pos, 1.3);
    this.set('grab', s === 'climb' || s === 'swing' || nearTrunk, s === 'ground' ? 'Trepar' : 'Soltar');
    this.set('sprint', s === 'swing', '▲');
    const high = s === 'air' && !p.pounding && p.heightAboveGround() > 2.2;
    this.set('crouch', s === 'swing' || high, s === 'swing' ? '▼' : 'Caída');
    this.set('dodge', s === 'ground' || s === 'air');
  }
}
