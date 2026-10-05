import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, NormalBlending, Points, Scene, ShaderMaterial, Vector3,
  type Blending,
} from 'three';
import { rand } from '../core/random';

interface EmitOpts {
  count: number;
  color: Color | string | number;
  color2?: Color | string | number;
  speed?: [number, number];
  up?: number; // impulso vertical adicional
  spread?: number; // radio de aparición
  size?: [number, number];
  life?: [number, number];
  gravity?: number;
  drag?: number;
  grow?: number;
  dir?: Vector3; // dirección preferente
  cone?: number; // 0 = sólo dir, 1 = esférico
  alpha?: number;
}

/** Sistema de partículas en GPU (Points) con simulación simple en CPU. */
class ParticlePool {
  readonly points: Points;
  private n: number;
  private pos: Float32Array;
  private vel: Float32Array;
  private col: Float32Array;
  private alpha: Float32Array;
  private size: Float32Array;
  private baseAlpha: Float32Array;
  private life: Float32Array;
  private maxLife: Float32Array;
  private grav: Float32Array;
  private drag: Float32Array;
  private grow: Float32Array;
  private cursor = 0;
  private c1 = new Color();
  private c2 = new Color();
  readonly material: ShaderMaterial;

  constructor(n: number, blending: Blending, soft: number) {
    this.n = n;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.alpha = new Float32Array(n);
    this.size = new Float32Array(n);
    this.baseAlpha = new Float32Array(n);
    this.life = new Float32Array(n);
    this.maxLife = new Float32Array(n);
    this.grav = new Float32Array(n);
    this.drag = new Float32Array(n);
    this.grow = new Float32Array(n);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(this.pos, 3));
    g.setAttribute('pcolor', new BufferAttribute(this.col, 3));
    g.setAttribute('palpha', new BufferAttribute(this.alpha, 1));
    g.setAttribute('psize', new BufferAttribute(this.size, 1));
    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending,
      uniforms: { uScale: { value: 600 }, uSoft: { value: soft } },
      vertexShader: /* glsl */ `
        attribute vec3 pcolor; attribute float palpha; attribute float psize;
        uniform float uScale;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vColor = pcolor; vAlpha = palpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * uScale / max(0.1, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uSoft;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = 1.0 - smoothstep(uSoft, 1.0, d);
          if (a * vAlpha < 0.01) discard;
          gl_FragColor = vec4(vColor, a * vAlpha);
        }`,
    });
    this.points = new Points(g, this.material);
    this.points.frustumCulled = false;
  }

  emit(at: Vector3, o: EmitOpts): void {
    this.c1.set(o.color);
    this.c2.set(o.color2 ?? o.color);
    const sp = o.speed ?? [1, 3];
    const sz = o.size ?? [0.15, 0.3];
    const lf = o.life ?? [0.5, 1];
    const spread = o.spread ?? 0.2;
    const cone = o.cone ?? 1;
    for (let k = 0; k < o.count; k++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.n;
      const i3 = i * 3;
      this.pos[i3] = at.x + rand(-spread, spread);
      this.pos[i3 + 1] = at.y + rand(-spread, spread);
      this.pos[i3 + 2] = at.z + rand(-spread, spread);
      // dirección aleatoria mezclada con la preferente
      let dx = rand(-1, 1), dy = rand(-1, 1), dz = rand(-1, 1);
      const l = Math.hypot(dx, dy, dz) || 1;
      dx /= l;
      dy /= l;
      dz /= l;
      if (o.dir) {
        dx = o.dir.x * (1 - cone) + dx * cone;
        dy = o.dir.y * (1 - cone) + dy * cone;
        dz = o.dir.z * (1 - cone) + dz * cone;
      }
      const s = rand(sp[0], sp[1]);
      this.vel[i3] = dx * s;
      this.vel[i3 + 1] = dy * s + (o.up ?? 0);
      this.vel[i3 + 2] = dz * s;
      const t = Math.random();
      this.col[i3] = this.c1.r + (this.c2.r - this.c1.r) * t;
      this.col[i3 + 1] = this.c1.g + (this.c2.g - this.c1.g) * t;
      this.col[i3 + 2] = this.c1.b + (this.c2.b - this.c1.b) * t;
      this.size[i] = rand(sz[0], sz[1]);
      this.maxLife[i] = this.life[i] = rand(lf[0], lf[1]);
      this.baseAlpha[i] = o.alpha ?? 1;
      this.alpha[i] = this.baseAlpha[i];
      this.grav[i] = o.gravity ?? 0;
      this.drag[i] = o.drag ?? 1;
      this.grow[i] = o.grow ?? 0;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) {
        this.alpha[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      const i3 = i * 3;
      const dr = Math.exp(-this.drag[i] * dt);
      this.vel[i3] *= dr;
      this.vel[i3 + 1] = this.vel[i3 + 1] * dr - this.grav[i] * dt;
      this.vel[i3 + 2] *= dr;
      this.pos[i3] += this.vel[i3] * dt;
      this.pos[i3 + 1] += this.vel[i3 + 1] * dt;
      this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
      this.size[i] += this.grow[i] * dt;
      const t = this.life[i] / this.maxLife[i];
      this.alpha[i] = this.baseAlpha[i] * Math.min(1, t * 2.5);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.pcolor.needsUpdate = true;
    g.attributes.palpha.needsUpdate = true;
    g.attributes.psize.needsUpdate = true;
  }
}

export class Particles {
  private glow: ParticlePool;
  private soft: ParticlePool;
  private dir = new Vector3();

  constructor(scene: Scene) {
    this.glow = new ParticlePool(1600, AdditiveBlending, 0.0);
    this.soft = new ParticlePool(1600, NormalBlending, 0.45);
    scene.add(this.glow.points, this.soft.points);
  }

  setViewportHeight(h: number, fovDeg: number): void {
    const s = h / (2 * Math.tan((fovDeg * Math.PI) / 360));
    this.glow.material.uniforms.uScale.value = s;
    this.soft.material.uniforms.uScale.value = s;
  }

  update(dt: number): void {
    this.glow.update(dt);
    this.soft.update(dt);
  }

  dust(at: Vector3, count = 12, strength = 1): void {
    this.soft.emit(at, {
      count, color: '#8a7454', color2: '#5e4c36', speed: [1 * strength, 3 * strength], up: 0.6,
      size: [0.25, 0.6], life: [0.5, 1.1], gravity: 1.5, drag: 2.5, grow: 0.8, alpha: 0.55,
    });
  }

  leaves(at: Vector3, count = 10): void {
    this.soft.emit(at, {
      count, color: '#4f8a2a', color2: '#9ab845', speed: [0.5, 2.2], spread: 1.2, size: [0.12, 0.22],
      life: [1.6, 3], gravity: 1.2, drag: 1.6, alpha: 0.95,
    });
  }

  splash(at: Vector3, count = 18): void {
    this.dir.set(0, 1, 0);
    this.soft.emit(at, {
      count, color: '#d8e4d8', color2: '#8fa898', speed: [2, 5], dir: this.dir, cone: 0.45,
      size: [0.12, 0.3], life: [0.4, 0.9], gravity: 12, drag: 0.5, alpha: 0.8,
    });
  }

  sparks(at: Vector3, color: string | number = '#ffd27a', count = 14): void {
    this.glow.emit(at, {
      count, color, color2: '#ffffff', speed: [2, 6], size: [0.08, 0.18], life: [0.2, 0.5], gravity: 6, drag: 2,
    });
  }

  burst(at: Vector3, color: string | number, count = 30): void {
    this.glow.emit(at, {
      count, color, color2: '#ffffff', speed: [1.5, 5], size: [0.12, 0.3], life: [0.5, 1.2], gravity: -0.5, drag: 2.5,
    });
  }

  aura(at: Vector3, color: string | number): void {
    this.glow.emit(at, {
      count: 1, color, speed: [0.1, 0.5], up: 0.8, spread: 0.35, size: [0.1, 0.22], life: [0.4, 0.8], drag: 1,
    });
  }

  stars(at: Vector3): void {
    this.glow.emit(at, {
      count: 1, color: '#fff27a', speed: [0.3, 0.8], up: 0.4, spread: 0.3, size: [0.12, 0.2], life: [0.5, 0.8], drag: 1,
    });
  }

  smoke(at: Vector3): void {
    this.soft.emit(at, {
      count: 1, color: '#9a968c', color2: '#6a665e', speed: [0.1, 0.4], up: 1.2, spread: 0.25,
      size: [0.4, 0.7], life: [2.5, 4], drag: 0.4, grow: 0.9, alpha: 0.35,
    });
  }

  shockwave(at: Vector3, radius: number, color: string | number = '#c9b48a'): void {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      this.dir.set(Math.cos(a), 0.1, Math.sin(a));
      this.soft.emit(at, {
        count: 1, color, speed: [radius * 2, radius * 2.6], dir: this.dir, cone: 0.05, size: [0.4, 0.8],
        life: [0.4, 0.6], drag: 4, grow: 1.5, alpha: 0.6,
      });
    }
  }
}
