import {
  BufferAttribute, BufferGeometry, CanvasTexture, CapsuleGeometry, Color, ConeGeometry, CylinderGeometry, Group,
  Line, LineBasicMaterial, Mesh, MeshStandardMaterial, Object3D, QuadraticBezierCurve3, Quaternion, SphereGeometry,
  Sprite, SpriteMaterial, SRGBColorSpace, Texture, TorusGeometry, TubeGeometry, Vector3,
} from 'three';
import { damp } from '../core/math';
import { PartBuilder } from '../core/parts';
import { Rng } from '../core/random';

export type HunterMode = 'idle' | 'walk' | 'run' | 'draw' | 'stunned' | 'ko' | 'melee' | 'alert';

export interface HunterPose {
  mode: HunterMode;
  speed: number;
  drawT: number;
  aimPitch: number;
  meleeT: number;
  hit: number;
  look: number;
  time: number;
}

const UP = new Vector3(0, 1, 0);
let indicatorTex: Record<string, Texture> | null = null;

function makeIndicator(text: string, color: string): Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.font = 'bold 54px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 8;
  g.strokeStyle = 'rgba(0,0,0,0.75)';
  g.strokeText(text, 32, 34);
  g.fillStyle = color;
  g.fillText(text, 32, 34);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function indicators(): Record<string, Texture> {
  if (!indicatorTex) {
    indicatorTex = {
      '?': makeIndicator('?', '#ffd23a'),
      '!': makeIndicator('!', '#ff3a2a'),
      z: makeIndicator('z', '#cfe6ff'),
    };
  }
  return indicatorTex;
}

interface Joint {
  o: Object3D;
  x: number;
  y: number;
  z: number;
}

/**
 * Cazador indígena con arco. Pintura corporal de urucum (rojo) y jenipapo (negro),
 * cocar de plumas, collar de semillas y brazaletes de fibra.
 */
export class HunterModel {
  readonly root = new Group();
  private hips = new Group();
  private spine = new Group();
  private chest = new Group();
  private head = new Group();
  private shL = new Group();
  private shR = new Group();
  private elL = new Group();
  private elR = new Group();
  private handL = new Group();
  private handR = new Group();
  private hipL = new Group();
  private hipR = new Group();
  private knL = new Group();
  private knR = new Group();
  private bow = new Group();
  private string: Line;
  private stringPos: BufferAttribute;
  private nocked: Mesh;
  private indicator: Sprite;
  private joints: Joint[] = [];
  private J = new Map<Object3D, Joint>();
  private mats: MeshStandardMaterial[] = [];
  private hipsY = 0.95;
  private phase = 0;
  private v = new Vector3();
  private v2 = new Vector3();
  private q = new Quaternion();
  private indicatorKind = '';

  constructor(seed: number, paint: Texture) {
    const rng = new Rng(seed);
    const skinC = new Color('#8d5a3b').offsetHSL(rng.range(-0.01, 0.01), rng.range(-0.05, 0.05), rng.range(-0.05, 0.04));
    const skin = skinC.getStyle();
    const vc = new MeshStandardMaterial({ vertexColors: true, roughness: 0.82 });
    const painted = new MeshStandardMaterial({ map: paint, color: skinC.clone().multiplyScalar(1.15), roughness: 0.8 });
    this.mats.push(vc, painted);
    const hair = '#100c0a';
    const red = '#b8321e';
    const black = '#15100c';
    const straw = '#d2a94a';
    const cloth = '#5e3f24';
    const wood = '#3a2414';
    const white = '#efe6d4';
    const featherCols = [['#d8261c', '#f2c018', '#1f6fd1'], ['#e8541c', '#1a9a4a', '#f2c018'], ['#c81e3a', '#ffffff', '#2a2a2a']][seed % 3];

    const B = new PartBuilder();
    const sph = new SphereGeometry(1, 12, 9);
    const ball = (p: Object3D, c: string, sx: number, sy: number, sz: number, x: number, y: number, z: number): void =>
      B.addTRS(p, sph, c, [x, y, z], [sx, sy, sz]);
    const limb = (p: Object3D, c: string, r: number, len: number): void =>
      B.addTRS(p, new CapsuleGeometry(r, len, 4, 8), c, [0, -(len / 2 + r * 0.6), 0]);
    const band = (p: Object3D, c: string, r: number, y: number, h = 0.04): void =>
      B.addTRS(p, new CylinderGeometry(r, r, h, 10), c, [0, y, 0]);

    const scale = rng.range(0.95, 1.05);
    this.root.scale.setScalar(scale);
    this.root.add(this.hips);
    this.hips.position.y = 0.95;

    // cintura: cinturón de fibra roja y taparrabo
    B.addTRS(this.hips, new CylinderGeometry(0.16, 0.17, 0.16, 12), cloth, [0, 0, 0]);
    B.addTRS(this.hips, new TorusGeometry(0.165, 0.018, 6, 16), red, [0, 0.07, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    B.addTRS(this.hips, new CylinderGeometry(0.09, 0.12, 0.26, 4, 1, false), cloth, [0, -0.15, 0.08], [1, 1, 0.4]);

    const leg = (hp: Group, kn: Group, side: number): void => {
      this.hips.add(hp);
      hp.position.set(side * 0.095, -0.04, 0);
      limb(hp, skin, 0.07, 0.32);
      hp.add(kn);
      kn.position.y = -0.45;
      band(kn, red, 0.06, 0.02);
      limb(kn, skin, 0.055, 0.33);
      B.addTRS(kn, new CapsuleGeometry(0.045, 0.12, 3, 6), skin, [0, -0.45, 0.05], [1, 1, 1], [Math.PI / 2, 0, 0]);
      band(kn, black, 0.05, -0.36, 0.06);
    };
    leg(this.hipL, this.knL, 1);
    leg(this.hipR, this.knR, -1);

    this.hips.add(this.spine);
    this.spine.position.y = 0.06;
    const torso = new Mesh(new CylinderGeometry(0.2, 0.15, 0.52, 14), painted);
    torso.position.y = 0.27;
    torso.castShadow = true;
    this.spine.add(torso);
    this.spine.add(this.chest);
    this.chest.position.y = 0.5;
    ball(this.chest, skin, 0.21, 0.08, 0.13, 0, 0.0, 0);
    // collar de semillas
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      ball(this.chest, i % 2 ? red : white, 0.022, 0.022, 0.022, Math.cos(a) * 0.12, -0.02 - Math.max(0, Math.sin(a)) * 0.06, Math.sin(a) * 0.1 + 0.02);
    }

    this.chest.add(this.head);
    this.head.position.y = 0.08;
    ball(this.head, skin, 0.05, 0.08, 0.05, 0, 0.0, 0);
    ball(this.head, skin, 0.115, 0.13, 0.12, 0, 0.14, 0.01);
    // pelo con corte en cuenco
    ball(this.head, hair, 0.124, 0.09, 0.128, 0, 0.19, -0.005);
    ball(this.head, hair, 0.12, 0.11, 0.06, 0, 0.14, -0.07);
    // pintura facial de urucum y ojos
    B.addTRS(this.head, new CylinderGeometry(0.118, 0.118, 0.045, 14, 1, true, -1.1, 2.2), red, [0, 0.15, 0.012]);
    ball(this.head, black, 0.014, 0.01, 0.01, -0.04, 0.155, 0.112);
    ball(this.head, black, 0.014, 0.01, 0.01, 0.04, 0.155, 0.112);
    ball(this.head, skin, 0.02, 0.025, 0.02, 0, 0.125, 0.122);
    // cocar de plumas
    B.addTRS(this.head, new TorusGeometry(0.125, 0.018, 6, 18), straw, [0, 0.2, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    const featherGeo = new ConeGeometry(0.025, 0.24, 4);
    featherGeo.translate(0, 0.12, 0);
    const dummy = new Object3D();
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (0.15 + (i / 10) * 0.7) + Math.PI;
      dummy.position.set(Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12);
      dummy.scale.set(1, 1, 0.35);
      dummy.lookAt(this.v.set(Math.cos(a) * 2, 1.4, Math.sin(a) * 2));
      dummy.rotateX(Math.PI / 2);
      dummy.updateMatrix();
      B.add(this.head, featherGeo, featherCols[i % 3], dummy.matrix);
    }

    const arm = (sh: Group, el: Group, hand: Group, side: number): void => {
      this.chest.add(sh);
      sh.position.set(side * 0.23, -0.02, 0);
      ball(sh, skin, 0.07, 0.07, 0.07, 0, 0, 0);
      limb(sh, skin, 0.055, 0.24);
      band(sh, straw, 0.062, -0.08, 0.05);
      sh.add(el);
      el.position.y = -0.31;
      limb(el, skin, 0.047, 0.22);
      band(el, red, 0.05, -0.22, 0.03);
      el.add(hand);
      hand.position.y = -0.3;
      ball(hand, skin, 0.05, 0.06, 0.045, 0, 0, 0);
    };
    arm(this.shL, this.elL, this.handL, 1);
    arm(this.shR, this.elR, this.handR, -1);

    // aljaba con flechas
    B.addTRS(this.spine, new CylinderGeometry(0.06, 0.05, 0.6, 8), '#6a4a2a', [0.08, 0.22, -0.18], [1, 1, 1], [0, 0, -0.35]);
    for (let i = 0; i < 4; i++) {
      B.addTRS(this.spine, new ConeGeometry(0.02, 0.1, 3), featherCols[i % 3], [0.18 + i * 0.012 - 0.02, 0.56, -0.18 + (i % 2) * 0.02], [1, 1, 1], [0, 0, -0.35]);
    }

    // arco: el eje largo va en Z local de la mano izquierda (vertical al apuntar)
    this.handL.add(this.bow);
    const curve = new QuadraticBezierCurve3(new Vector3(0, 0.1, -0.78), new Vector3(0, -0.18, 0), new Vector3(0, 0.1, 0.78));
    B.add(this.bow, new TubeGeometry(curve, 16, 0.018, 5), wood);
    ball(this.bow, red, 0.03, 0.03, 0.07, 0, -0.04, 0);
    B.build(vc);

    const sg = new BufferGeometry();
    this.stringPos = new BufferAttribute(new Float32Array([0, 0.1, -0.78, 0, 0.08, 0, 0, 0.1, 0.78]), 3);
    sg.setAttribute('position', this.stringPos);
    this.string = new Line(sg, new LineBasicMaterial({ color: '#e8dcc0' }));
    this.bow.add(this.string);
    const arrowGeo = new CylinderGeometry(0.008, 0.008, 1, 4);
    arrowGeo.translate(0, 0.5, 0);
    this.nocked = new Mesh(arrowGeo, new MeshStandardMaterial({ color: '#c8a878' }));
    this.bow.add(this.nocked);
    this.nocked.visible = false;

    this.indicator = new Sprite(new SpriteMaterial({ transparent: true, depthTest: false }));
    this.indicator.scale.setScalar(0.55);
    this.indicator.position.y = 2.25;
    this.indicator.visible = false;
    this.indicator.renderOrder = 10;
    this.root.add(this.indicator);

    for (const o of [this.hips, this.spine, this.chest, this.head, this.shL, this.shR, this.elL, this.elR, this.hipL, this.hipR, this.knL, this.knR]) {
      const j = { o, x: 0, y: 0, z: 0 };
      this.joints.push(j);
      this.J.set(o, j);
    }
  }

  private set(o: Object3D, x: number, y = 0, z = 0): void {
    const j = this.J.get(o)!;
    j.x = x;
    j.y = y;
    j.z = z;
  }

  setIndicator(kind: '' | '?' | '!' | 'z', pulse = 0): void {
    if (kind !== this.indicatorKind) {
      this.indicatorKind = kind;
      this.indicator.visible = kind !== '';
      if (kind) {
        this.indicator.material.map = indicators()[kind];
        this.indicator.material.needsUpdate = true;
      }
    }
    if (kind) this.indicator.scale.setScalar(0.5 + pulse * 0.2);
  }

  setOpacity(a: number): void {
    for (const m of this.mats) {
      m.transparent = a < 0.99;
      m.opacity = a;
    }
  }

  flash(k: number): void {
    for (const m of this.mats) {
      m.emissive.setRGB(k, k * 0.25, k * 0.1);
    }
  }

  update(dt: number, p: HunterPose): void {
    const t = p.time;
    let hipsY = 0.95;
    let lambda = 12;
    let hipsX = 0;
    let bowVisible = true;
    this.nocked.visible = false;

    switch (p.mode) {
      case 'walk':
      case 'run': {
        const run = p.mode === 'run';
        this.phase += dt * (run ? 2.3 : 1.5) * (0.6 + p.speed * 0.25);
        const ph = this.phase * Math.PI * 2;
        const A = run ? 0.75 : 0.45;
        this.set(this.hipL, -Math.sin(ph) * A);
        this.set(this.hipR, Math.sin(ph) * A);
        this.set(this.knL, Math.max(0, -Math.cos(ph)) * (run ? 1.4 : 0.8) + 0.1);
        this.set(this.knR, Math.max(0, Math.cos(ph)) * (run ? 1.4 : 0.8) + 0.1);
        this.set(this.shL, Math.sin(ph) * A * 0.6 - 0.15, 0, -0.08);
        this.set(this.shR, -Math.sin(ph) * A * 0.8, 0, 0.1);
        this.set(this.elL, -0.5);
        this.set(this.elR, run ? -1.1 : -0.3);
        this.set(this.spine, run ? 0.22 : 0.06, Math.sin(ph) * 0.08, 0);
        this.set(this.head, run ? -0.15 : 0, p.look * 0.5, 0);
        hipsY = 0.95 - Math.abs(Math.cos(ph)) * (run ? 0.06 : 0.03);
        lambda = 16;
        break;
      }
      case 'idle':
      case 'alert': {
        this.set(this.hipL, 0.02, 0, 0.04);
        this.set(this.hipR, 0.02, 0, -0.04);
        this.set(this.knL, 0.06);
        this.set(this.knR, 0.06);
        this.set(this.shL, -0.15, 0, -0.1);
        this.set(this.elL, -0.5);
        if (p.mode === 'alert') {
          this.set(this.shR, -2.7, 0, 0.2);
          this.set(this.elR, -0.2);
          this.set(this.head, -0.25);
        } else {
          this.set(this.shR, 0.05, 0, 0.12);
          this.set(this.elR, -0.15);
          this.set(this.head, Math.sin(t * 0.7) * 0.08, p.look * 0.9, 0);
        }
        this.set(this.spine, Math.sin(t * 1.6) * 0.015, 0, 0);
        break;
      }
      case 'draw': {
        const d = p.drawT;
        const pitch = p.aimPitch;
        this.set(this.hipL, -0.25, 0, 0.12);
        this.set(this.hipR, 0.25, 0, -0.12);
        this.set(this.knL, 0.3);
        this.set(this.knR, 0.15);
        this.set(this.spine, 0.04, -0.15, 0);
        this.set(this.shL, -Math.PI / 2 - pitch, 0, -0.05);
        this.set(this.elL, 0);
        this.set(this.shR, -Math.PI / 2 - pitch - 0.05, 0, 0.3);
        this.set(this.elR, -0.35 - d * 2.35);
        this.set(this.head, -pitch * 0.6, 0.12, 0);
        this.nocked.visible = true;
        lambda = 18;
        break;
      }
      case 'melee': {
        const m = p.meleeT;
        const raise = m < 0.5 ? m / 0.5 : 1 - (m - 0.5) / 0.5;
        this.set(this.shL, -0.5 - raise * 2.2, 0, -0.2);
        this.set(this.elL, -0.3);
        this.set(this.shR, -0.4, 0, 0.2);
        this.set(this.elR, -0.6);
        this.set(this.spine, 0.1 + (m > 0.5 ? 0.3 : -0.1), m > 0.5 ? 0.4 : -0.3, 0);
        this.set(this.hipL, -0.4);
        this.set(this.hipR, 0.3);
        this.set(this.knL, 0.3);
        this.set(this.knR, 0.2);
        lambda = 22;
        break;
      }
      case 'stunned': {
        this.set(this.spine, 0.25, 0, Math.sin(t * 6) * 0.2);
        this.set(this.head, 0.35, Math.sin(t * 4) * 0.3, 0);
        this.set(this.shL, 0.2, 0, -0.3);
        this.set(this.shR, 0.3, 0, 0.3);
        this.set(this.elL, -0.3);
        this.set(this.elR, -0.3);
        this.set(this.hipL, -0.2);
        this.set(this.hipR, 0.1);
        this.set(this.knL, 0.5);
        this.set(this.knR, 0.4);
        hipsY = 0.88;
        lambda = 8;
        break;
      }
      case 'ko': {
        hipsY = 0.16;
        hipsX = -Math.PI / 2;
        this.set(this.spine, 0, 0, 0);
        this.set(this.head, 0.2, 0.5, 0);
        this.set(this.shL, -0.3, 0, -1.3);
        this.set(this.shR, -0.6, 0, 1.1);
        this.set(this.elL, -0.5);
        this.set(this.elR, -0.2);
        this.set(this.hipL, -0.15, 0, 0.25);
        this.set(this.hipR, 0.1, 0, -0.15);
        this.set(this.knL, 0.6);
        this.set(this.knR, 0.1);
        bowVisible = false;
        lambda = 7;
        break;
      }
    }
    if (p.hit > 0) {
      this.J.get(this.spine)!.x -= p.hit * 0.5;
      this.J.get(this.head)!.x -= p.hit * 0.4;
    }
    this.set(this.hips, hipsX);

    this.hipsY = damp(this.hipsY, hipsY, lambda, dt);
    this.hips.position.y = this.hipsY;
    for (const j of this.joints) {
      j.o.rotation.x = damp(j.o.rotation.x, j.x, lambda, dt);
      j.o.rotation.y = damp(j.o.rotation.y, j.y, lambda, dt);
      j.o.rotation.z = damp(j.o.rotation.z, j.z, lambda, dt);
    }
    this.bow.visible = bowVisible;
    this.flash(p.hit * 0.6);

    // cuerda del arco: el punto de anclaje sigue a la mano derecha al tensar
    this.root.updateMatrixWorld(true);
    const arr = this.stringPos.array as Float32Array;
    if (p.mode === 'draw') {
      this.handR.getWorldPosition(this.v);
      this.bow.worldToLocal(this.v);
      arr[3] = this.v.x;
      arr[4] = Math.max(0.08, this.v.y);
      arr[5] = this.v.z;
      // flecha desde la cuerda hacia delante
      this.v2.set(0, -0.2, 0).sub(this.v);
      const len = this.v2.length();
      this.v2.divideScalar(len);
      this.nocked.position.copy(this.v);
      this.q.setFromUnitVectors(UP, this.v2);
      this.nocked.quaternion.copy(this.q);
      this.nocked.scale.set(1, len + 0.1, 1);
    } else {
      arr[3] = 0;
      arr[4] = 0.1;
      arr[5] = 0;
    }
    this.stringPos.needsUpdate = true;
  }

  /** Posición mundial del arco (origen de las flechas). */
  bowWorld(out: Vector3): Vector3 {
    return this.handL.getWorldPosition(out);
  }
}
