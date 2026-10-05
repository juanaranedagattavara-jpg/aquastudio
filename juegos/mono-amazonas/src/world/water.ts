import { Color, Mesh, MeshPhongMaterial, PlaneGeometry, Texture, Vector2 } from 'three';
import { WATER_LEVEL } from '../config';

/** Río de aguas turbias amazónicas con reflejos del sol animados. */
export class Water {
  readonly mesh: Mesh;
  private normal: Texture;

  constructor(size: number, normal: Texture) {
    this.normal = normal;
    normal.repeat.set(size / 14, size / 14);
    const mat = new MeshPhongMaterial({
      color: new Color('#4e5638'),
      specular: new Color('#a9b49a'),
      shininess: 90,
      normalMap: normal,
      normalScale: new Vector2(0.55, 0.55),
      transparent: true,
      opacity: 0.9,
    });
    const geo = new PlaneGeometry(size, size, 1, 1);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new Mesh(geo, mat);
    this.mesh.position.y = WATER_LEVEL;
    this.mesh.receiveShadow = true;
  }

  update(time: number): void {
    this.normal.offset.set(time * 0.012, time * 0.02);
  }
}
