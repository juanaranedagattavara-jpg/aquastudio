const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function clp(value: number | null | undefined): string {
  if (value == null) return '—'
  return clpFormatter.format(value)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 09:41 — para reservas cortas. */
export function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

/** "2d 04h 12m" o "04:12:09" cuando falta menos de un día. */
export function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function relativeTime(ts: number, now: number): string {
  const diff = Math.round((now - ts) / 60000)
  if (diff < 1) return 'recién'
  if (diff < 60) return `hace ${diff} min`
  const h = Math.round(diff / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} d`
}

export function dateTime(ts: number): string {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(ts)
}

/** Valor para <input type="datetime-local"> en hora local. */
export function toLocalInput(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** "hoy 20:00", "mañana 20:00", "jue 9 oct 20:00". */
export function whenLabel(ts: number, now: number): string {
  const d = new Date(ts)
  const today = new Date(now)
  const tomorrow = new Date(now + 86_400_000)
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (sameDay(d, today)) return `hoy ${time}`
  if (sameDay(d, tomorrow)) return `mañana ${time}`
  const day = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
  return `${day.replace(/[.,]/g, '')} ${time}`
}

/** "martes 14 de octubre". */
export function longDate(ts: number): string {
  return new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(ts).replace(',', '')
}

/** "martes 13". */
export function shortDay(ts: number): string {
  return new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric' }).format(ts).replace(',', '')
}

/** La próxima vez que el reloj marque `hour`:00 (hoy si aún no pasa, si no mañana). */
export function nextAt(hour: number, now: number): number {
  const d = new Date(now)
  d.setHours(hour, 0, 0, 0)
  if (d.getTime() <= now) d.setDate(d.getDate() + 1)
  return d.getTime()
}

/** Próximo día de despacho. Un pedido del mismo martes sale el martes siguiente. */
export function nextWeekday(weekday: number, now: number): number {
  const d = new Date(now)
  const add = (weekday - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + add)
  d.setHours(12, 0, 0, 0)
  return d.getTime()
}

/** Precio con descuento, redondeado a la decena. */
export function discounted(price: number, pct: number | undefined): number {
  if (!pct) return price
  return Math.round((price * (100 - pct)) / 1000) * 10
}
