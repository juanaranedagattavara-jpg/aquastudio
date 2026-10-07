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
