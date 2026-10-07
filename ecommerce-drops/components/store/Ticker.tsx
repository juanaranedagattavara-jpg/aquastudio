'use client'

import { categoryById, config } from '@/lib/config'
import { whenLabel } from '@/lib/format'
import { liveDrops, upcomingReleases, useDb, useNow } from '@/lib/store'

/** Cinta animada con lo que está pasando: drop en vivo, próxima categoría, despachos. */
export function Ticker() {
  const db = useDb()
  const now = useNow(30_000)
  const current = db ? liveDrops(db, now)[0] : undefined
  const next = db ? upcomingReleases(db, now)[0] : undefined

  const items = [
    current ? `Drop ${current.number} · ${current.name} en vivo` : 'Próximo drop muy pronto',
    next ? `${categoryById(next.category).label} ${whenLabel(next.at, now)}` : null,
    'Prendas únicas, una de cada una',
    'Despachos todos los martes',
    'Ropa americana seleccionada',
    `Instagram @${config.brand.instagram}`,
  ].filter(Boolean) as string[]

  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((t) => (
        <span key={t} className="flex items-center gap-6 pr-6">
          <span>{t}</span>
          <span className="text-ink/40">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="overflow-hidden border-b border-ink/10 bg-accent py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row()}
        {row(true)}
      </div>
    </div>
  )
}
