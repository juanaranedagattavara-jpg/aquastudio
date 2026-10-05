import { Vector3, type PerspectiveCamera } from 'three';
import { GOLDEN_COUNT, PLAYER, POWERS, type PowerKind } from '../config';
import { vibrate } from '../core/device';
import type { Hunter } from '../enemies/hunter';
import type { Monkey } from '../player/monkey';

interface Popup {
  el: HTMLElement;
  pos: Vector3;
  t: number;
}

export interface HudFrame {
  camera: PerspectiveCamera;
  camYaw: number;
  player: Monkey;
  hunters: Hunter[];
  goldens: Vector3[];
  ancestral: Vector3;
  objectiveDone: boolean;
  score: number;
}

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document): T => root.querySelector(sel) as T;

/** Interfaz superpuesta (DOM): vida, poderes, brújula, avisos de amenaza, mensajes. */
export class HUD {
  private root = $('#hud');
  private hpFill = $('.hp-fill');
  private hpGhost = $('.hp-ghost');
  private powersEl = $('.powers');
  private goldN = $('.gold-n');
  private goldEl = $('.gold');
  private nutsN = $('.nuts-n');
  private scoreEl = $('.score');
  private compass = $('.compass-track');
  private threats = $('#threats');
  private comboEl = $('#combo');
  private toasts = $('#toasts');
  private hintEl = $('#hint');
  private popupsEl = $('#popups');
  private objective = $('#objective');
  private vignette = $('#vignette');
  private slowmo = $('#slowmo');
  private popups: Popup[] = [];
  private threatEls: HTMLElement[] = [];
  private compassEls: HTMLElement[] = [];
  private lastHp = -1;
  private lastScore = -1;
  private powerKey = '';
  private powerBars = new Map<PowerKind, HTMLElement>();
  private comboTimer = 0;
  private hintTimer = 0;
  private hurt = 0;
  private v = new Vector3();

  constructor() {
    $('.gold-of').textContent = `/${GOLDEN_COUNT}`;
  }

  show(on: boolean): void {
    this.root.classList.toggle('hidden', !on);
  }

  reset(): void {
    this.toasts.innerHTML = '';
    this.popupsEl.innerHTML = '';
    this.popups.length = 0;
    this.hintEl.classList.remove('on');
    this.comboEl.classList.remove('on');
    this.lastHp = -1;
    this.lastScore = -1;
    this.powerKey = '-';
    this.powersEl.innerHTML = '';
    this.powerBars.clear();
    this.hurt = 0;
    this.golden(0, true);
  }

  setNuts(n: number): void {
    this.nutsN.textContent = String(n);
  }

  golden(n: number, silent = false): void {
    this.goldN.textContent = String(n);
    if (silent) return;
    vibrate([25, 50, 25]);
    this.goldEl.classList.remove('bump');
    void this.goldEl.offsetWidth;
    this.goldEl.classList.add('bump');
    if (n >= GOLDEN_COUNT) {
      this.toast('¡Todos los frutos dorados! Sube a la copa del Gran Sumaúma', '#ffcf40', 6, true);
    } else {
      this.toast(`Fruto dorado ${n}/${GOLDEN_COUNT}`, '#ffcf40', 2.5, true);
    }
  }

  toast(text: string, color = '#eef3e2', dur = 2, big = false): void {
    const el = document.createElement('div');
    el.className = 'toast' + (big ? ' big' : '');
    el.style.color = color;
    el.textContent = text;
    this.toasts.appendChild(el);
    while (this.toasts.children.length > 4) this.toasts.firstElementChild?.remove();
    window.setTimeout(() => {
      el.style.opacity = '0';
      window.setTimeout(() => el.remove(), 450);
    }, dur * 1000);
  }

  hint(text: string, dur = 5): void {
    this.hintEl.textContent = text;
    this.hintEl.classList.add('on');
    this.hintTimer = dur;
  }

  combo(n: number): void {
    this.comboEl.textContent = `Lianas x${n}`;
    this.comboEl.classList.remove('on');
    void this.comboEl.offsetWidth;
    this.comboEl.classList.add('on');
    this.comboTimer = 1.6;
  }

  popup(text: string, at: Vector3): void {
    const el = document.createElement('div');
    el.className = 'popup';
    el.textContent = text;
    this.popupsEl.appendChild(el);
    this.popups.push({ el, pos: at.clone().setY(at.y + 1.6), t: 0 });
    if (this.popups.length > 8) {
      const p = this.popups.shift()!;
      p.el.remove();
    }
  }

  damage(_from: Vector3 | null, _playerPos: Vector3, _camYaw: number): void {
    this.hurt = 1;
    vibrate(40);
  }

  update(dt: number, f: HudFrame): void {
    const p = f.player;
    // vida
    const hp = Math.max(0, Math.round(p.hp));
    if (hp !== this.lastHp) {
      const pct = (hp / PLAYER.maxHp) * 100;
      this.hpFill.style.width = `${pct}%`;
      this.hpGhost.style.width = `${pct}%`;
      this.hpFill.classList.toggle('low', pct < 30);
      this.lastHp = hp;
    }
    if (f.score !== this.lastScore) {
      this.scoreEl.textContent = f.score.toLocaleString('es');
      this.lastScore = f.score;
    }
    this.hurt = Math.max(0, this.hurt - dt * 1.6);
    const low = p.hp < 30 ? 0.35 + Math.sin(performance.now() * 0.006) * 0.1 : 0;
    this.vignette.style.opacity = String(Math.max(this.hurt, low));
    this.slowmo.classList.toggle('on', p.powers.has('jabuticaba'));

    // poderes
    const active = p.powers.active();
    const key = active.join(',');
    if (key !== this.powerKey) {
      this.powerKey = key;
      this.powersEl.innerHTML = '';
      this.powerBars.clear();
      for (const k of active) {
        const d = POWERS[k];
        const row = document.createElement('div');
        row.className = 'power';
        row.style.color = d.css;
        row.innerHTML = `<span class="pdot" style="background:${d.css}"></span><span>${d.name}</span><span class="pbar"><i></i></span>`;
        this.powersEl.appendChild(row);
        this.powerBars.set(k, row.querySelector('i') as HTMLElement);
      }
    }
    for (const [k, el] of this.powerBars) el.style.width = `${(p.powers.remaining(k) / POWERS[k].duration) * 100}%`;

    // temporizadores
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.comboEl.classList.remove('on');
    this.hintTimer -= dt;
    if (this.hintTimer <= 0) this.hintEl.classList.remove('on');

    this.updateCompass(f);
    this.updateThreats(f);
    this.updatePopups(dt, f.camera);

    const left = GOLDEN_COUNT - f.goldens.length;
    this.objective.textContent = f.objectiveDone
      ? 'Objetivo: sube a la copa del Gran Sumaúma (marcador verde)'
      : `Objetivo: frutos dorados ${left}/${GOLDEN_COUNT}. Busca las columnas de luz dorada.`;
  }

  private bearing(f: HudFrame, x: number, z: number): number {
    const p = f.player.pos;
    const dx = x - p.x, dz = z - p.z;
    const fx = -Math.sin(f.camYaw), fz = -Math.cos(f.camYaw);
    const rx = Math.cos(f.camYaw), rz = -Math.sin(f.camYaw);
    return Math.atan2(dx * rx + dz * rz, dx * fx + dz * fz);
  }

  private compassEl(i: number): HTMLElement {
    let el = this.compassEls[i];
    if (!el) {
      el = document.createElement('div');
      this.compass.appendChild(el);
      this.compassEls[i] = el;
    }
    el.style.display = '';
    return el;
  }

  private updateCompass(f: HudFrame): void {
    const range = Math.PI / 2;
    let i = 0;
    const place = (ang: number, cls: string, html: string, clampEdge = false): void => {
      if (Math.abs(ang) > range) {
        if (!clampEdge) return;
        ang = Math.sign(ang) * range * 0.97;
      }
      const el = this.compassEl(i++);
      if (el.className !== `cm ${cls}`) el.className = `cm ${cls}`;
      if (el.innerHTML !== html) el.innerHTML = html;
      el.style.left = `${Math.max(6, Math.min(94, 50 + (ang / range) * 50))}%`;
    };
    const p = f.player.pos;
    const cards: [string, number, number][] = [['N', 0, -1], ['E', 1, 0], ['S', 0, 1], ['O', -1, 0]];
    for (const [l, x, z] of cards) place(this.bearing(f, p.x + x * 100, p.z + z * 100), 'card', l);
    // frutos dorados (el más cercano siempre visible)
    let nearest = -1;
    let nd = Infinity;
    f.goldens.forEach((g, k) => {
      const d = Math.hypot(g.x - p.x, g.z - p.z);
      if (d < nd) {
        nd = d;
        nearest = k;
      }
    });
    f.goldens.forEach((g, k) => {
      const d = Math.hypot(g.x - p.x, g.z - p.z);
      place(this.bearing(f, g.x, g.z), 'goldm', `<span class="gm"></span>${k === nearest ? `${Math.round(d)}m` : ''}`, k === nearest);
    });
    const a = f.ancestral;
    place(this.bearing(f, a.x, a.z), 'tree', `<span class="gm"></span>${f.objectiveDone ? `${Math.round(Math.hypot(a.x - p.x, a.z - p.z))}m` : ''}`, f.objectiveDone);
    for (const h of f.hunters) {
      if (h.state === 'combat' && h.active) place(this.bearing(f, h.pos.x, h.pos.z), 'enemy', '');
    }
    for (let k = i; k < this.compassEls.length; k++) this.compassEls[k].style.display = 'none';
  }

  private updateThreats(f: HudFrame): void {
    let i = 0;
    const R = Math.min(window.innerWidth, window.innerHeight) * 0.2 + 40;
    for (const h of f.hunters) {
      if (!h.active) continue;
      const drawing = h.drawing;
      const watching = !drawing && h.state !== 'combat' && h.alert > 0.15 && h.alert < 1;
      if (!drawing && !watching) continue;
      let el = this.threatEls[i];
      if (!el) {
        el = document.createElement('div');
        el.innerHTML = '<i></i>';
        this.threats.appendChild(el);
        this.threatEls[i] = el;
      }
      i++;
      el.style.display = '';
      el.className = drawing ? 'threat' : 'threat watch';
      const ang = this.bearing(f, h.pos.x, h.pos.z);
      const x = Math.sin(ang) * R, y = -Math.cos(ang) * R;
      const s = drawing ? 0.7 + h.drawT * 0.6 : 0.6 + h.alert * 0.6;
      el.style.transform = `translate(${x}px, ${y}px) rotate(${ang}rad) scale(${s})`;
      el.style.opacity = String(drawing ? 0.5 + h.drawT * 0.5 : 0.35 + h.alert * 0.6);
    }
    for (let k = i; k < this.threatEls.length; k++) this.threatEls[k].style.display = 'none';
  }

  private updatePopups(dt: number, cam: PerspectiveCamera): void {
    const w = window.innerWidth, h = window.innerHeight;
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.t += dt;
      if (p.t > 1.3) {
        p.el.remove();
        this.popups.splice(i, 1);
        continue;
      }
      this.v.copy(p.pos);
      this.v.y += p.t * 1.2;
      this.v.project(cam);
      if (this.v.z > 1) {
        p.el.style.display = 'none';
        continue;
      }
      p.el.style.display = '';
      p.el.style.left = `${(this.v.x * 0.5 + 0.5) * w}px`;
      p.el.style.top = `${(-this.v.y * 0.5 + 0.5) * h}px`;
      p.el.style.opacity = String(Math.min(1, (1.3 - p.t) * 2));
    }
  }
}
