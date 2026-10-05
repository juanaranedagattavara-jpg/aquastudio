import {
  AdditiveBlending, BackSide, BufferGeometry, Color, CylinderGeometry, DirectionalLight, Float32BufferAttribute,
  FogExp2, HemisphereLight, Mesh, MeshBasicMaterial, Points, PointsMaterial, Scene, ShaderMaterial,
  SphereGeometry, Texture, Vector3, type Camera,
} from 'three';
import { clamp, smoothstep } from '../core/math';
import { Rng } from '../core/random';
import type { Terrain } from './terrain';

const FOG_LOW = new Color('#5f7d58');
const FOG_HIGH = new Color('#b4c8ad');

/** Cielo, niebla húmeda, sol con sombras, haces de luz y polen flotando. */
export class Atmosphere {
  readonly sun: DirectionalLight;
  readonly hemi: HemisphereLight;
  readonly fog: FogExp2;
  readonly sunDir = new Vector3(0.42, 0.82, 0.38).normalize();
  private dome: Mesh;
  private domeMat: ShaderMaterial;
  private shafts: { mesh: Mesh; mat: MeshBasicMaterial; base: number }[] = [];
  private pollen: Points;
  private pollenVel: Float32Array;
  private fogColor = new Color();

  constructor(private scene: Scene, terrain: Terrain, glow: Texture, beam: Texture) {
    this.fog = new FogExp2(FOG_LOW.getHex(), 0.011);
    scene.fog = this.fog;
    scene.background = this.fogColor.copy(FOG_LOW);

    this.hemi = new HemisphereLight('#d6ecff', '#5a4a30', 1.6);
    scene.add(this.hemi);

    this.sun = new DirectionalLight('#fff0d0', 2.5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -42;
    sc.right = 42;
    sc.top = 42;
    sc.bottom = -42;
    sc.near = 1;
    sc.far = 260;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.05;
    scene.add(this.sun, this.sun.target);

    this.domeMat = new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new Color('#6f9fc4') },
        horizon: { value: FOG_LOW.clone() },
        sunDir: { value: this.sunDir },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y, 0.0, 1.0);
          vec3 c = mix(horizon, top, pow(h, 0.6));
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          c += vec3(1.0, 0.92, 0.7) * (pow(s, 600.0) * 2.0 + pow(s, 12.0) * 0.25);
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    this.dome = new Mesh(new SphereGeometry(280, 24, 12), this.domeMat);
    this.dome.renderOrder = -10;
    this.dome.frustumCulled = false;
    scene.add(this.dome);

    // Haces de luz que atraviesan el dosel
    const rng = new Rng(555);
    const shaftGeo = new CylinderGeometry(1.4, 3.2, 42, 12, 1, true);
    shaftGeo.translate(0, -21, 0);
    const tilt = new Vector3(0, 1, 0);
    for (let i = 0; i < 46; i++) {
      const x = rng.range(-220, 220), z = rng.range(-220, 220);
      if (terrain.distanceToWater(x, z) < 6) continue;
      const mat = new MeshBasicMaterial({
        map: beam, color: '#fff3c8', transparent: true, opacity: 0, blending: AdditiveBlending,
        depthWrite: false, fog: false, side: BackSide,
      });
      const mesh = new Mesh(shaftGeo, mat);
      const y = terrain.heightAt(x, z) + 40;
      mesh.position.set(x, y, z);
      mesh.quaternion.setFromUnitVectors(tilt, this.sunDir);
      mesh.scale.setScalar(rng.range(0.7, 1.4));
      scene.add(mesh);
      this.shafts.push({ mesh, mat, base: rng.range(0.05, 0.11) });
    }

    // Polen e insectos
    const N = 700;
    const pos = new Float32Array(N * 3);
    this.pollenVel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = rng.range(-30, 30);
      pos[i * 3 + 1] = rng.range(-8, 20);
      pos[i * 3 + 2] = rng.range(-30, 30);
      this.pollenVel[i * 3] = rng.range(-0.25, 0.25);
      this.pollenVel[i * 3 + 1] = rng.range(-0.08, 0.12);
      this.pollenVel[i * 3 + 2] = rng.range(-0.25, 0.25);
    }
    const pg = new BufferGeometry();
    pg.setAttribute('position', new Float32BufferAttribute(pos, 3));
    this.pollen = new Points(pg, new PointsMaterial({
      map: glow, color: '#fff1b8', size: 0.16, transparent: true, opacity: 0.75,
      blending: AdditiveBlending, depthWrite: false,
    }));
    this.pollen.frustumCulled = false;
    scene.add(this.pollen);
  }

  update(dt: number, time: number, camera: Camera, focus: Vector3, groundY: number): void {
    const camPos = camera.position;
    this.dome.position.copy(camPos);
    const height = camPos.y - groundY;
    const k = smoothstep(14, 46, height);
    this.fogColor.copy(FOG_LOW).lerp(FOG_HIGH, k);
    this.fog.color.copy(this.fogColor);
    this.fog.density = 0.0115 - k * 0.0052;
    (this.domeMat.uniforms.horizon.value as Color).copy(this.fogColor);
    this.hemi.intensity = 1.55 + k * 0.25;

    // Sombra centrada en el jugador, ajustada a la rejilla de texels para que no tiemble.
    const texel = 84 / 2048;
    const fx = Math.round(focus.x / texel) * texel;
    const fz = Math.round(focus.z / texel) * texel;
    this.sun.target.position.set(fx, focus.y, fz);
    this.sun.position.set(fx + this.sunDir.x * 120, focus.y + this.sunDir.y * 120, fz + this.sunDir.z * 120);

    for (const s of this.shafts) {
      const d = s.mesh.position.distanceTo(camPos);
      const flick = 0.85 + Math.sin(time * 0.6 + s.mesh.position.x) * 0.15;
      s.mat.opacity = s.base * flick * clamp(1 - d / 110, 0, 1) * clamp((d - 6) / 10, 0, 1) * (1 - k * 0.6);
      s.mesh.visible = s.mat.opacity > 0.003;
    }

    const attr = this.pollen.geometry.attributes.position as Float32BufferAttribute;
    const arr = attr.array as Float32Array;
    const v = this.pollenVel;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] += (v[i] + Math.sin(time * 0.9 + i) * 0.15) * dt;
      arr[i + 1] += (v[i + 1] + Math.cos(time * 0.7 + i) * 0.05) * dt;
      arr[i + 2] += (v[i + 2] + Math.cos(time * 0.8 + i * 0.5) * 0.15) * dt;
      // mantener la nube alrededor de la cámara
      let dx = arr[i] - camPos.x;
      if (dx > 30) arr[i] -= 60; else if (dx < -30) arr[i] += 60;
      dx = arr[i + 2] - camPos.z;
      if (dx > 30) arr[i + 2] -= 60; else if (dx < -30) arr[i + 2] += 60;
      const dy = arr[i + 1] - camPos.y;
      if (dy > 18) arr[i + 1] -= 30; else if (dy < -12) arr[i + 1] += 30;
    }
    attr.needsUpdate = true;
    this.scene.background = this.fogColor;
  }
}
