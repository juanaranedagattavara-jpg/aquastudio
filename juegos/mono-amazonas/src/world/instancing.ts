import {
  BufferGeometry, Color, Group, InstancedMesh, Material, Matrix4,
} from 'three';

/**
 * Acumula transformaciones y crea InstancedMesh troceados por zonas del mapa
 * para que el frustum culling descarte lo que no se ve.
 */
export class InstanceBatch {
  private items: { m: Matrix4; c: Color | null }[] = [];

  add(m: Matrix4, c: Color | null = null): void {
    this.items.push({ m: m.clone(), c: c ? c.clone() : null });
  }

  get count(): number {
    return this.items.length;
  }

  build(
    geo: BufferGeometry,
    mat: Material,
    opts: { chunk?: number; cast?: boolean; receive?: boolean; name?: string } = {},
  ): Group {
    const chunk = opts.chunk ?? 90;
    const groups = new Map<string, { m: Matrix4; c: Color | null }[]>();
    for (const it of this.items) {
      const k = `${Math.floor(it.m.elements[12] / chunk)},${Math.floor(it.m.elements[14] / chunk)}`;
      let g = groups.get(k);
      if (!g) {
        g = [];
        groups.set(k, g);
      }
      g.push(it);
    }
    const root = new Group();
    root.name = opts.name ?? 'batch';
    const hasColor = this.items.some((i) => i.c);
    for (const list of groups.values()) {
      const mesh = new InstancedMesh(geo, mat, list.length);
      list.forEach((it, i) => {
        mesh.setMatrixAt(i, it.m);
        if (hasColor) mesh.setColorAt(i, it.c ?? new Color(1, 1, 1));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.castShadow = !!opts.cast;
      mesh.receiveShadow = !!opts.receive;
      root.add(mesh);
    }
    return root;
  }
}
