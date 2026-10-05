import type { Vector3 } from 'three';
import { clamp } from './math';

// Audio 100% procedural con WebAudio: sin archivos externos.

export type Sfx =
  | 'jump' | 'land' | 'landHeavy' | 'grab' | 'release' | 'whoosh' | 'twang' | 'thunk' | 'whiz'
  | 'hurt' | 'punch' | 'kick' | 'pound' | 'ko' | 'pickup' | 'golden' | 'power' | 'shout' | 'draw'
  | 'splash' | 'tink' | 'throw' | 'hoot' | 'win' | 'lose' | 'click' | 'leaves' | 'hunterHurt'
  | 'swing' | 'dodge' | 'alarm';

export interface PlayOpts {
  at?: Vector3;
  vol?: number;
  rate?: number;
}

export interface AmbientParams {
  riverDist: number;
  height: number; // altura de la cámara sobre el suelo
  combat: number; // 0..1
  slowmo: boolean;
  swingSpeed: number;
  underCanopy: boolean;
}

export class AudioSys {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private masterFilter!: BiquadFilterNode;
  private sfx!: GainNode;
  private amb!: GainNode;
  private music!: GainNode;
  private noiseBuf!: AudioBuffer;
  private riverGain!: GainNode;
  private windGain!: GainNode;
  private swingGain!: GainNode;
  private swingFilter!: BiquadFilterNode;
  private lx = 0;
  private lz = 0;
  private lyaw = 0;
  private birdTimer = 1;
  private howlTimer = 12;
  private nextBeat = 0;
  private beat = 0;
  private lastPlay = new Map<string, number>();
  muted = false;

  init(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.masterFilter = ctx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.value = 20000;
    this.master.connect(this.masterFilter).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.85;
    this.sfx.connect(this.master);
    this.amb = ctx.createGain();
    this.amb.gain.value = 0.55;
    this.amb.connect(this.master);
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.master);

    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this.startAmbient();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  setListener(pos: Vector3, yaw: number): void {
    this.lx = pos.x;
    this.lz = pos.z;
    this.lyaw = yaw;
  }

  // ------------------------------------------------------------------ helpers
  private noise(t0: number, dur: number): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    s.start(t0, Math.random() * 1.5);
    s.stop(t0 + dur + 0.05);
    return s;
  }

  private osc(type: OscillatorType, f: number, t0: number, dur: number): OscillatorNode {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    return o;
  }

  private filter(type: BiquadFilterType, f: number, q = 1): BiquadFilterNode {
    const b = this.ctx!.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    return b;
  }

  private env(t0: number, a: number, hold: number, r: number, peak: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.setValueAtTime(peak, t0 + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + r);
    return g;
  }

  private out(vol: number, pan: number, bus: AudioNode = this.sfx): AudioNode {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = vol;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = clamp(pan, -1, 1);
      g.connect(p).connect(bus);
    } else {
      g.connect(bus);
    }
    return g;
  }

  private spatial(at: Vector3 | undefined): { vol: number; pan: number } {
    if (!at) return { vol: 1, pan: 0 };
    const dx = at.x - this.lx, dz = at.z - this.lz;
    const d = Math.hypot(dx, dz);
    const vol = 1 / (1 + Math.pow(d / 14, 1.6));
    if (d < 0.01) return { vol, pan: 0 };
    const rx = Math.cos(this.lyaw), rz = -Math.sin(this.lyaw);
    return { vol, pan: ((dx * rx + dz * rz) / d) * 0.8 };
  }

  // ------------------------------------------------------------------ SFX
  play(name: Sfx, opts: PlayOpts = {}): void {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const key = name;
    const last = this.lastPlay.get(key) ?? -1;
    if (now - last < 0.025) return;
    this.lastPlay.set(key, now);

    const sp = this.spatial(opts.at);
    const vol = (opts.vol ?? 1) * sp.vol;
    if (vol < 0.01) return;
    const rate = opts.rate ?? 1;
    const t = now + 0.005;
    const o = this.out(vol, sp.pan);

    switch (name) {
      case 'jump': {
        const n = this.noise(t, 0.18);
        const f = this.filter('bandpass', 900, 1.2);
        f.frequency.setValueAtTime(600, t);
        f.frequency.exponentialRampToValueAtTime(2400, t + 0.15);
        n.connect(f).connect(this.env(t, 0.01, 0.03, 0.13, 0.25)).connect(o);
        break;
      }
      case 'land':
      case 'landHeavy': {
        const heavy = name === 'landHeavy';
        const s = this.osc('sine', heavy ? 120 : 160, t, 0.3);
        s.frequency.exponentialRampToValueAtTime(40, t + 0.2);
        s.connect(this.env(t, 0.005, 0.02, heavy ? 0.35 : 0.15, heavy ? 0.9 : 0.4)).connect(o);
        const n = this.noise(t, 0.2);
        n.connect(this.filter('lowpass', heavy ? 700 : 1400)).connect(this.env(t, 0.003, 0.01, 0.12, heavy ? 0.5 : 0.25)).connect(o);
        break;
      }
      case 'grab': {
        // crujido de liana + hojas
        const s = this.osc('sawtooth', 70 * rate, t, 0.3);
        for (let i = 0; i < 6; i++) s.frequency.setValueAtTime((60 + Math.random() * 50) * rate, t + i * 0.04);
        s.connect(this.filter('bandpass', 420, 3)).connect(this.env(t, 0.01, 0.12, 0.12, 0.35)).connect(o);
        this.leaves(t, o, 0.35);
        break;
      }
      case 'leaves':
        this.leaves(t, o, 0.5);
        break;
      case 'release':
      case 'whoosh':
      case 'dodge': {
        const dur = name === 'dodge' ? 0.22 : 0.35;
        const n = this.noise(t, dur);
        const f = this.filter('bandpass', 500, 0.8);
        f.frequency.setValueAtTime(350 * rate, t);
        f.frequency.exponentialRampToValueAtTime(1800 * rate, t + dur * 0.5);
        f.frequency.exponentialRampToValueAtTime(400 * rate, t + dur);
        n.connect(f).connect(this.env(t, dur * 0.4, 0, dur * 0.6, 0.45)).connect(o);
        break;
      }
      case 'twang': {
        const s = this.osc('triangle', 210, t, 0.4);
        s.frequency.exponentialRampToValueAtTime(140, t + 0.3);
        s.connect(this.env(t, 0.002, 0.02, 0.3, 0.5)).connect(o);
        const n = this.noise(t, 0.1);
        n.connect(this.filter('highpass', 2500)).connect(this.env(t, 0.002, 0.01, 0.06, 0.25)).connect(o);
        break;
      }
      case 'draw': {
        const s = this.osc('sawtooth', 55, t, 0.6);
        s.frequency.linearRampToValueAtTime(95, t + 0.55);
        s.connect(this.filter('bandpass', 600, 6)).connect(this.env(t, 0.1, 0.35, 0.12, 0.18)).connect(o);
        break;
      }
      case 'thunk': {
        const s = this.osc('sine', 260, t, 0.15);
        s.frequency.exponentialRampToValueAtTime(90, t + 0.1);
        s.connect(this.env(t, 0.002, 0.01, 0.1, 0.5)).connect(o);
        const n = this.noise(t, 0.08);
        n.connect(this.filter('bandpass', 1600, 1.5)).connect(this.env(t, 0.001, 0.005, 0.06, 0.35)).connect(o);
        break;
      }
      case 'whiz': {
        const n = this.noise(t, 0.3);
        const f = this.filter('bandpass', 3000, 4);
        f.frequency.setValueAtTime(4200, t);
        f.frequency.exponentialRampToValueAtTime(1400, t + 0.28);
        n.connect(f).connect(this.env(t, 0.08, 0.04, 0.16, 0.6)).connect(o);
        break;
      }
      case 'tink': {
        const s = this.osc('triangle', 2400, t, 0.3);
        s.connect(this.env(t, 0.001, 0.01, 0.25, 0.35)).connect(o);
        const s2 = this.osc('sine', 3600, t, 0.2);
        s2.connect(this.env(t, 0.001, 0.01, 0.15, 0.2)).connect(o);
        break;
      }
      case 'hurt': {
        // chillido de mono
        const s = this.osc('sawtooth', 1000, t, 0.4);
        s.frequency.linearRampToValueAtTime(1650, t + 0.08);
        s.frequency.linearRampToValueAtTime(820, t + 0.35);
        const vib = this.osc('sine', 32, t, 0.4);
        const vg = this.ctx!.createGain();
        vg.gain.value = 60;
        vib.connect(vg).connect(s.frequency);
        s.connect(this.filter('bandpass', 1800, 3)).connect(this.env(t, 0.01, 0.15, 0.2, 0.55)).connect(o);
        break;
      }
      case 'hoot': {
        const s = this.osc('sine', 480, t, 0.45);
        s.frequency.linearRampToValueAtTime(900, t + 0.15);
        s.frequency.linearRampToValueAtTime(620, t + 0.4);
        s.connect(this.env(t, 0.02, 0.15, 0.25, 0.22)).connect(o);
        break;
      }
      case 'punch':
      case 'kick': {
        const s = this.osc('sine', name === 'kick' ? 110 : 150, t, 0.2);
        s.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        s.connect(this.env(t, 0.002, 0.02, 0.15, 0.8)).connect(o);
        const n = this.noise(t, 0.1);
        n.connect(this.filter('lowpass', 2200)).connect(this.env(t, 0.001, 0.01, 0.07, 0.6)).connect(o);
        break;
      }
      case 'pound': {
        const s = this.osc('sine', 90, t, 0.6);
        s.frequency.exponentialRampToValueAtTime(28, t + 0.5);
        s.connect(this.env(t, 0.003, 0.05, 0.5, 1)).connect(o);
        const n = this.noise(t, 0.5);
        n.connect(this.filter('lowpass', 500)).connect(this.env(t, 0.003, 0.05, 0.4, 0.8)).connect(o);
        this.leaves(t + 0.05, o, 0.5);
        break;
      }
      case 'hunterHurt': {
        const s = this.osc('sawtooth', 190, t, 0.3);
        s.frequency.linearRampToValueAtTime(120, t + 0.25);
        const f1 = this.filter('bandpass', 650, 5);
        const f2 = this.filter('bandpass', 1100, 6);
        const e = this.env(t, 0.01, 0.08, 0.15, 0.5);
        s.connect(f1).connect(e);
        s.connect(f2).connect(e);
        e.connect(o);
        break;
      }
      case 'ko': {
        [1320, 1760, 2200].forEach((f, i) => {
          const s = this.osc('sine', f, t + i * 0.07, 0.5);
          s.connect(this.env(t + i * 0.07, 0.005, 0.02, 0.4, 0.25)).connect(o);
        });
        break;
      }
      case 'pickup': {
        [660, 880, 1320].forEach((f, i) => {
          const s = this.osc('triangle', f * rate, t + i * 0.055, 0.2);
          s.connect(this.env(t + i * 0.055, 0.005, 0.03, 0.15, 0.3)).connect(o);
        });
        break;
      }
      case 'power': {
        [440, 554, 659, 880].forEach((f, i) => {
          const s = this.osc('sawtooth', f, t + i * 0.04, 0.9);
          s.connect(this.filter('lowpass', 2400)).connect(this.env(t + i * 0.04, 0.05, 0.25, 0.6, 0.12)).connect(o);
        });
        const n = this.noise(t, 0.6);
        const f = this.filter('bandpass', 1000, 2);
        f.frequency.exponentialRampToValueAtTime(6000, t + 0.6);
        n.connect(f).connect(this.env(t, 0.2, 0.1, 0.3, 0.12)).connect(o);
        break;
      }
      case 'golden': {
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
          const s = this.osc('triangle', f, t + i * 0.09, 1.2);
          s.connect(this.env(t + i * 0.09, 0.01, 0.2, 0.9, 0.3)).connect(o);
          const s2 = this.osc('sine', f * 2, t + i * 0.09, 0.8);
          s2.connect(this.env(t + i * 0.09, 0.01, 0.1, 0.6, 0.1)).connect(o);
        });
        break;
      }
      case 'shout': {
        // Grito de alerta del cazador ("Ê-ô!"): fuente con dos formantes.
        const f0 = 150 + Math.random() * 40;
        const s = this.osc('sawtooth', f0, t, 0.6);
        s.frequency.linearRampToValueAtTime(f0 * 1.15, t + 0.12);
        s.frequency.linearRampToValueAtTime(f0 * 0.85, t + 0.5);
        const f1 = this.filter('bandpass', 560, 6);
        const f2 = this.filter('bandpass', 1850, 8);
        f1.frequency.linearRampToValueAtTime(450, t + 0.5);
        f2.frequency.linearRampToValueAtTime(900, t + 0.5);
        const e = this.env(t, 0.03, 0.3, 0.2, 0.6);
        s.connect(f1).connect(e);
        s.connect(f2).connect(e);
        e.connect(o);
        break;
      }
      case 'alarm': {
        const s = this.osc('square', 880, t, 0.25);
        s.frequency.setValueAtTime(660, t + 0.12);
        s.connect(this.filter('lowpass', 2000)).connect(this.env(t, 0.005, 0.2, 0.05, 0.12)).connect(o);
        break;
      }
      case 'splash': {
        const n = this.noise(t, 0.6);
        const f = this.filter('lowpass', 3000);
        f.frequency.setValueAtTime(3000, t);
        f.frequency.exponentialRampToValueAtTime(300, t + 0.5);
        n.connect(f).connect(this.env(t, 0.01, 0.05, 0.45, 0.6)).connect(o);
        break;
      }
      case 'throw': {
        const n = this.noise(t, 0.18);
        const f = this.filter('bandpass', 1200, 1.5);
        f.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
        n.connect(f).connect(this.env(t, 0.02, 0.02, 0.12, 0.35)).connect(o);
        break;
      }
      case 'swing':
        break;
      case 'win': {
        [392, 523, 659, 784, 1047].forEach((f, i) => {
          const s = this.osc('triangle', f, t + i * 0.14, 1.4);
          s.connect(this.env(t + i * 0.14, 0.02, 0.4, 0.9, 0.25)).connect(o);
        });
        break;
      }
      case 'lose': {
        [392, 330, 262, 196].forEach((f, i) => {
          const s = this.osc('triangle', f, t + i * 0.22, 0.6);
          s.connect(this.env(t + i * 0.22, 0.02, 0.2, 0.35, 0.25)).connect(o);
        });
        break;
      }
      case 'click': {
        const s = this.osc('square', 1200, t, 0.05);
        s.connect(this.filter('lowpass', 3000)).connect(this.env(t, 0.001, 0.01, 0.03, 0.1)).connect(o);
        break;
      }
    }
  }

  private leaves(t: number, o: AudioNode, vol: number): void {
    const n = this.noise(t, 0.4);
    const f = this.filter('highpass', 2500);
    const g = this.env(t, 0.02, 0.1, 0.25, vol);
    // crepitar: modulación rápida
    const lfo = this.osc('square', 23, t, 0.4);
    const lg = this.ctx!.createGain();
    lg.gain.value = vol * 0.5;
    lfo.connect(lg).connect(g.gain);
    n.connect(f).connect(g).connect(o);
  }

  // ------------------------------------------------------------------ ambiente
  private startAmbient(): void {
    const ctx = this.ctx!;
    const loopNoise = (): AudioBufferSourceNode => {
      const s = ctx.createBufferSource();
      s.buffer = this.noiseBuf;
      s.loop = true;
      s.start();
      return s;
    };
    // Insectos/cigarras: ruido filtrado con trémolo.
    const makeInsects = (freq: number, q: number, trem: number, vol: number, slow: number): void => {
      const src = loopNoise();
      const bp = this.filter('bandpass', freq, q);
      const g = ctx.createGain();
      g.gain.value = vol;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = trem;
      const lg = ctx.createGain();
      lg.gain.value = vol * 0.8;
      lfo.connect(lg).connect(g.gain);
      lfo.start();
      const slowLfo = ctx.createOscillator();
      slowLfo.frequency.value = slow;
      const sg = ctx.createGain();
      sg.gain.value = vol * 0.6;
      slowLfo.connect(sg).connect(g.gain);
      slowLfo.start();
      src.connect(bp).connect(g).connect(this.amb);
    };
    makeInsects(5200, 7, 14, 0.05, 0.05);
    makeInsects(3700, 9, 9, 0.035, 0.11);
    makeInsects(7400, 12, 21, 0.02, 0.031);

    // Viento en las hojas
    const wind = loopNoise();
    const wf = this.filter('lowpass', 900, 0.5);
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.05;
    const wl = ctx.createOscillator();
    wl.frequency.value = 0.08;
    const wlg = ctx.createGain();
    wlg.gain.value = 0.035;
    wl.connect(wlg).connect(this.windGain.gain);
    wl.start();
    wind.connect(wf).connect(this.windGain).connect(this.amb);

    // Río
    const river = loopNoise();
    const rf = this.filter('lowpass', 520, 0.7);
    this.riverGain = ctx.createGain();
    this.riverGain.gain.value = 0;
    river.connect(rf).connect(this.riverGain).connect(this.amb);

    // Viento del balanceo (depende de la velocidad)
    const sw = loopNoise();
    this.swingFilter = this.filter('bandpass', 600, 0.9);
    this.swingGain = ctx.createGain();
    this.swingGain.gain.value = 0;
    sw.connect(this.swingFilter).connect(this.swingGain).connect(this.sfx);
  }

  private bird(): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.02;
    const pan = Math.random() * 2 - 1;
    const vol = 0.04 + Math.random() * 0.08;
    const o = this.out(vol, pan, this.amb);
    const kind = Math.floor(Math.random() * 6);
    if (kind === 0) {
      // silbido ascendente repetido
      const base = 1800 + Math.random() * 900;
      const reps = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < reps; i++) {
        const s = this.osc('sine', base, t + i * 0.16, 0.14);
        s.frequency.exponentialRampToValueAtTime(base * 1.6, t + i * 0.16 + 0.12);
        s.connect(this.env(t + i * 0.16, 0.01, 0.06, 0.06, 0.6)).connect(o);
      }
    } else if (kind === 1) {
      // trino
      const s = this.osc('sine', 3000 + Math.random() * 800, t, 0.5);
      const fm = this.osc('sine', 28, t, 0.5);
      const fg = ctx.createGain();
      fg.gain.value = 350;
      fm.connect(fg).connect(s.frequency);
      s.connect(this.env(t, 0.03, 0.3, 0.15, 0.4)).connect(o);
    } else if (kind === 2) {
      // tucán: croar grave
      for (let i = 0; i < 3; i++) {
        const s = this.osc('square', 380 + Math.random() * 60, t + i * 0.22, 0.12);
        s.connect(this.filter('bandpass', 900, 3)).connect(this.env(t + i * 0.22, 0.01, 0.05, 0.06, 0.5)).connect(o);
      }
    } else if (kind === 3) {
      // guacamayo: graznido
      const s = this.osc('sawtooth', 800, t, 0.35);
      s.frequency.linearRampToValueAtTime(520, t + 0.3);
      s.connect(this.filter('bandpass', 1500, 2.5)).connect(this.env(t, 0.02, 0.15, 0.15, 0.35)).connect(o);
    } else if (kind === 4) {
      // inambú: silbido descendente melancólico
      const s = this.osc('sine', 1500, t, 0.8);
      s.frequency.exponentialRampToValueAtTime(950, t + 0.7);
      s.connect(this.env(t, 0.08, 0.35, 0.35, 0.35)).connect(o);
    } else {
      // gorjeo rápido
      for (let i = 0; i < 5; i++) {
        const f = 2500 + Math.random() * 1500;
        const s = this.osc('sine', f, t + i * 0.07, 0.06);
        s.frequency.exponentialRampToValueAtTime(f * 0.7, t + i * 0.07 + 0.05);
        s.connect(this.env(t + i * 0.07, 0.005, 0.02, 0.03, 0.4)).connect(o);
      }
    }
  }

  private howler(): void {
    // Monos aulladores a lo lejos.
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.05;
    const dur = 3 + Math.random() * 2;
    const o = this.out(0.09, Math.random() * 2 - 1, this.amb);
    const s = this.osc('sawtooth', 75, t, dur);
    const n = this.noise(t, dur);
    const f = this.filter('bandpass', 420, 2);
    const e = this.env(t, 0.6, dur - 1.4, 0.8, 0.9);
    const lfo = this.osc('sine', 3.5, t, dur);
    const lg = ctx.createGain();
    lg.gain.value = 0.35;
    lfo.connect(lg).connect(e.gain);
    s.connect(f);
    n.connect(f);
    f.connect(this.filter('lowpass', 700)).connect(e).connect(o);
  }

  private drum(t: number, accent: boolean): void {
    const o = this.out(accent ? 0.5 : 0.3, 0, this.music);
    const s = this.osc('sine', accent ? 120 : 160, t, 0.3);
    s.frequency.exponentialRampToValueAtTime(55, t + 0.22);
    s.connect(this.env(t, 0.003, 0.02, 0.25, 0.9)).connect(o);
    const n = this.noise(t, 0.05);
    n.connect(this.filter('bandpass', 1800, 1)).connect(this.env(t, 0.001, 0.005, 0.04, 0.3)).connect(o);
  }

  private shaker(t: number): void {
    const o = this.out(0.12, 0.3, this.music);
    const n = this.noise(t, 0.08);
    n.connect(this.filter('highpass', 6000)).connect(this.env(t, 0.01, 0.01, 0.05, 0.6)).connect(o);
  }

  update(dt: number, p: AmbientParams): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    this.riverGain.gain.setTargetAtTime(0.28 * clamp(1 - p.riverDist / 45, 0, 1), now, 0.3);
    const windTarget = 0.04 + clamp(p.height / 50, 0, 1) * 0.12;
    this.windGain.gain.setTargetAtTime(windTarget, now, 0.5);
    this.swingGain.gain.setTargetAtTime(clamp((p.swingSpeed - 6) / 18, 0, 1) * 0.35, now, 0.08);
    this.swingFilter.frequency.setTargetAtTime(400 + p.swingSpeed * 60, now, 0.08);
    this.masterFilter.frequency.setTargetAtTime(p.slowmo ? 1100 : 20000, now, 0.15);
    this.music.gain.setTargetAtTime(p.combat * 0.55, now, 0.6);

    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.birdTimer = (p.underCanopy ? 0.6 : 1.2) + Math.random() * 2.4;
      this.bird();
    }
    this.howlTimer -= dt;
    if (this.howlTimer <= 0) {
      this.howlTimer = 35 + Math.random() * 40;
      this.howler();
    }

    // Percusión de combate con planificación anticipada.
    if (p.combat > 0.02) {
      const step = 60 / 116 / 2;
      if (this.nextBeat < now) this.nextBeat = now + 0.05;
      while (this.nextBeat < now + 0.25) {
        const i = this.beat % 16;
        const pattern = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0];
        if (pattern[i]) this.drum(this.nextBeat, i === 0 || i === 8);
        if (i % 2 === 1) this.shaker(this.nextBeat);
        this.nextBeat += step;
        this.beat++;
      }
    }
  }
}
