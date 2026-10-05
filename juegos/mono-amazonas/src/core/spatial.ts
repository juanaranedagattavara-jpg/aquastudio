/** Objetos indexables en la rejilla espacial (marca para evitar duplicados). */
export interface Spatial {
  __q?: number;
}

let queryStamp = 1;

/** Rejilla hash en XZ: consultas por radio rápidas para colisiones e IA. */
export class SpatialHash<T extends Spatial> {
  private cells = new Map<number, T[]>();

  constructor(readonly cellSize: number) {}

  private key(ix: number, iz: number): number {
    return (ix + 2048) * 4096 + (iz + 2048);
  }

  insert(item: T, minX: number, minZ: number, maxX: number, maxZ: number): void {
    const cs = this.cellSize;
    const x0 = Math.floor(minX / cs), x1 = Math.floor(maxX / cs);
    const z0 = Math.floor(minZ / cs), z1 = Math.floor(maxZ / cs);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const k = this.key(ix, iz);
        let cell = this.cells.get(k);
        if (!cell) {
          cell = [];
          this.cells.set(k, cell);
        }
        cell.push(item);
      }
    }
  }

  insertPoint(item: T, x: number, z: number, r: number): void {
    this.insert(item, x - r, z - r, x + r, z + r);
  }

  query(x: number, z: number, r: number, out: T[]): T[] {
    out.length = 0;
    const stamp = ++queryStamp;
    const cs = this.cellSize;
    const x0 = Math.floor((x - r) / cs), x1 = Math.floor((x + r) / cs);
    const z0 = Math.floor((z - r) / cs), z1 = Math.floor((z + r) / cs);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const cell = this.cells.get(this.key(ix, iz));
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          const it = cell[i];
          if (it.__q === stamp) continue;
          it.__q = stamp;
          out.push(it);
        }
      }
    }
    return out;
  }
}
