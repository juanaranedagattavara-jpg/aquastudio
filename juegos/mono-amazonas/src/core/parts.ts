import {
  BufferAttribute, BufferGeometry, Color, Material, Matrix4, Mesh, Object3D,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Acumula piezas (geometría + color) por hueso y al final las fusiona en una
 * sola malla por hueso: personajes con muchas piezas pero pocos draw calls.
 */
export class PartBuilder {
  private parts = new Map<Object3D, BufferGeometry[]>();
  private m = new Matrix4();
  private dummy = new Object3D();

  add(bone: Object3D, geo: BufferGeometry, color: string | Color, matrix?: Matrix4): BufferGeometry {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (matrix) g.applyMatrix4(matrix);
    g.deleteAttribute('uv');
    if (!g.attributes.normal) g.computeVertexNormals();
    const c = color instanceof Color ? color : new Color(color);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new BufferAttribute(arr, 3));
    let list = this.parts.get(bone);
    if (!list) {
      list = [];
      this.parts.set(bone, list);
    }
    list.push(g);
    return g;
  }

  /** Atajo: aplica posición/escala/rotación con un Object3D temporal. */
  addTRS(
    bone: Object3D, geo: BufferGeometry, color: string | Color,
    pos: [number, number, number], scale: [number, number, number] = [1, 1, 1], rot: [number, number, number] = [0, 0, 0],
  ): void {
    this.dummy.position.set(...pos);
    this.dummy.scale.set(...scale);
    this.dummy.rotation.set(...rot);
    this.dummy.updateMatrix();
    this.add(bone, geo, color, this.m.copy(this.dummy.matrix));
  }

  build(material: Material, castShadow = true): Mesh[] {
    const out: Mesh[] = [];
    for (const [bone, list] of this.parts) {
      const merged = mergeGeometries(list);
      if (!merged) continue;
      const mesh = new Mesh(merged, material);
      mesh.castShadow = castShadow;
      bone.add(mesh);
      out.push(mesh);
      list.forEach((g) => g.dispose());
    }
    this.parts.clear();
    return out;
  }
}
