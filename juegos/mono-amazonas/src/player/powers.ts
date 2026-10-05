import { POWERS, POWER_ORDER, type PowerKind } from '../config';

/** Temporizadores de los poderes de las frutas (pueden acumularse). */
export class Powers {
  private timers = new Map<PowerKind, number>();

  reset(): void {
    this.timers.clear();
  }

  grant(k: PowerKind): void {
    this.timers.set(k, POWERS[k].duration);
  }

  has(k: PowerKind): boolean {
    return (this.timers.get(k) ?? 0) > 0;
  }

  remaining(k: PowerKind): number {
    return this.timers.get(k) ?? 0;
  }

  update(dt: number): PowerKind[] {
    const ended: PowerKind[] = [];
    for (const [k, t] of this.timers) {
      const nt = t - dt;
      if (nt <= 0) {
        this.timers.delete(k);
        ended.push(k);
      } else {
        this.timers.set(k, nt);
      }
    }
    return ended;
  }

  active(): PowerKind[] {
    return POWER_ORDER.filter((k) => this.has(k));
  }
}
