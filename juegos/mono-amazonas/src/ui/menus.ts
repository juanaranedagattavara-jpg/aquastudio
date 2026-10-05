import { POWER_ORDER, POWERS, type Difficulty } from '../config';
import type { Stats } from '../game/context';

export type Quality = 'alta' | 'media' | 'baja';

export interface MenuCallbacks {
  onPlay(diff: Difficulty['key'], quality: Quality): void;
  onResume(): void;
  onRestart(): void;
  onMenu(): void;
  onSettings(s: { sens: number; invert: boolean; mute: boolean }): void;
}

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

function store<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, v: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

/** Pantallas: carga, menú principal, pausa y fin de partida. */
export class Menus {
  diff: Difficulty['key'] = store('macaco-diff', 'normal');
  quality: Quality = store<Quality>('macaco-quality', matchMedia('(pointer: coarse)').matches ? 'baja' : 'alta');
  settings = store('macaco-settings', { sens: 0.0024, invert: false, mute: false });
  best = store('macaco-best', 0);

  constructor(cb: MenuCallbacks) {
    const fruits = $('.fruits');
    fruits.innerHTML = POWER_ORDER.map((k) => {
      const d = POWERS[k];
      return `<li><span class="dot" style="background:${d.css};color:${d.css}"></span><b>${d.fruit}</b><span>${d.name}: ${d.desc} (${d.duration}s)</span></li>`;
    }).join('');

    document.querySelectorAll<HTMLElement>('.seg').forEach((seg) => {
      const opt = seg.dataset.opt!;
      const current = opt === 'diff' ? this.diff : this.quality;
      seg.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
        b.classList.toggle('on', b.dataset.v === current);
        b.addEventListener('click', () => {
          seg.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
          if (opt === 'diff') {
            this.diff = b.dataset.v as Difficulty['key'];
            save('macaco-diff', this.diff);
          } else {
            this.quality = b.dataset.v as Quality;
            save('macaco-quality', this.quality);
          }
        });
      });
    });

    $('.play').addEventListener('click', () => cb.onPlay(this.diff, this.quality));
    $('#pause .resume').addEventListener('click', () => cb.onResume());
    $('#pause .restart').addEventListener('click', () => cb.onRestart());
    document.querySelectorAll('.tomenu').forEach((b) => b.addEventListener('click', () => cb.onMenu()));
    $('#over .again').addEventListener('click', () => cb.onRestart());
    document.querySelector('[data-pause]')?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.pauseRequested?.();
    });

    const sens = $<HTMLInputElement>('#pause .sens');
    const inv = $<HTMLInputElement>('#pause .invert');
    const mute = $<HTMLInputElement>('#pause .mute');
    sens.value = String(this.settings.sens);
    inv.checked = this.settings.invert;
    mute.checked = this.settings.mute;
    const push = (): void => {
      this.settings = { sens: Number(sens.value), invert: inv.checked, mute: mute.checked };
      save('macaco-settings', this.settings);
      cb.onSettings(this.settings);
    };
    sens.addEventListener('input', push);
    inv.addEventListener('change', push);
    mute.addEventListener('change', push);
    this.renderBest();
  }

  pauseRequested: (() => void) | null = null;

  private renderBest(): void {
    $('.best-n').textContent = this.best.toLocaleString('es');
  }

  setLoading(p: number, text?: string): void {
    $('.loading-fill').style.width = `${Math.round(p * 100)}%`;
    if (text) $('.loading-text').textContent = text;
  }

  show(which: 'loading' | 'menu' | 'pause' | 'over' | 'none'): void {
    for (const id of ['loading', 'menu', 'pause', 'over']) $(`#${id}`).classList.toggle('hidden', id !== which);
  }

  showOver(won: boolean, stats: Stats, diffLabel: string): void {
    const newBest = stats.score > this.best;
    if (newBest) {
      this.best = stats.score;
      save('macaco-best', this.best);
      this.renderBest();
    }
    $('.over-title').textContent = won ? '¡Libre!' : '¡Te atraparon!';
    $('.over-sub').textContent = won
      ? 'Llegaste a la copa del Gran Sumaúma con todos los frutos dorados. La selva es tuya.'
      : 'Los cazadores te alcanzaron. Usa las copas para esconderte y las lianas para escapar.';
    const mm = Math.floor(stats.time / 60), ss = Math.floor(stats.time % 60);
    const rows: [string, string][] = [
      ['Puntuación', `${stats.score.toLocaleString('es')}${newBest ? '  (¡récord!)' : ''}`],
      ['Frutos dorados', `${stats.golden}`],
      ['Cazadores noqueados', `${stats.kos}`],
      ['Lianas agarradas', `${stats.vines}`],
      ['Mejor cadena de lianas', `x${stats.maxCombo}`],
      ['Tiempo', `${mm}:${String(ss).padStart(2, '0')}`],
      ['Dificultad', diffLabel],
    ];
    $('#over .stats').innerHTML = rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('');
    this.show('over');
  }
}
