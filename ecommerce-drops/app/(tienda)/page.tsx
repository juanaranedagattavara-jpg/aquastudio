'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { FilterSheet, applyFilters, defaultFilters, activeFilterCount, type Filters } from '@/components/store/FilterSheet'
import { LiveDot } from '@/components/store/LiveDot'
import { NotifyForm } from '@/components/store/NotifyForm'
import { ProductCard } from '@/components/store/ProductCard'
import { categories, categoryById, config } from '@/lib/config'
import { countdown, longDate, nextWeekday, whenLabel } from '@/lib/format'
import {
  dropProducts,
  isReady,
  liveDrops,
  productState,
  publicDropProducts,
  releaseStatus,
  upcomingReleases,
  useBuyerId,
  useDb,
  useNow,
  type UpcomingRelease,
} from '@/lib/store'
import type { CategoryId, DbState, Drop, Product } from '@/lib/types'

export default function StorePage() {
  const db = useDb()
  const now = useNow()
  const buyerId = useBuyerId()

  if (!db) return <GridSkeleton />

  const lives = liveDrops(db, now)
  const current = lives[0]
  const next = upcomingReleases(db, now)[0]

  if (!current) return <NoLiveDrop db={db} next={next} now={now} />

  const products = publicDropProducts(db, current.id, now)
  const leftovers = lives.slice(1).flatMap((d) =>
    publicDropProducts(db, d.id, now)
      .filter((p) => productState(p, now) !== 'sold')
      .map((p) => ({ p, drop: d }))
  )

  return (
    <>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-8 pt-8 md:grid-cols-[1.4fr_1fr] md:items-end md:pt-14">
        <DropHero drop={current} products={products} now={now} />
        <ReleaseSchedule db={db} drop={current} now={now} />
      </section>

      <DropGrid drop={current} products={products} now={now} buyerId={buyerId} />

      {next && <NextRelease db={db} release={next} now={now} />}

      {leftovers.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Liquidación</p>
              <h2 className="display mt-1 text-5xl">Últimas piezas</h2>
            </div>
            <p className="max-w-xs text-sm text-muted">Lo que quedó de drops anteriores, con descuento. Cuando se acaban, se acaban.</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {leftovers.map(({ p, drop }) => (
              <ProductCard key={p.id} product={p} now={now} buyerId={buyerId} discountPct={drop.discountPct} />
            ))}
          </div>
        </section>
      )}

      <HowItWorks now={now} />

      {!next && (
        <section id="avisame" className="mx-auto mt-16 max-w-6xl scroll-mt-20 px-4">
          <div className="rounded-3xl bg-ink p-6 text-paper sm:p-10">
            <p className="eyebrow text-paper/50">Próximo drop</p>
            <h2 className="display mt-2 text-5xl">Que no te lo cuenten</h2>
            <p className="mb-6 mt-3 max-w-md text-sm text-paper/70">
              Te avisamos por WhatsApp antes de cada publicación. Las prendas son únicas: llegar primero importa.
            </p>
            <NotifyForm dark />
          </div>
        </section>
      )}
    </>
  )
}

/** Titular lo más grande posible sin desbordar (cada letra de Archivo condensada mide ~0,6 em). */
function heroSize(text: string): React.CSSProperties {
  const em = Math.max(5, text.length) * 0.6
  return { fontSize: `min(calc((100vw - 2rem) / ${em.toFixed(2)}), ${Math.floor(660 / em)}px)` }
}

function DropHero({ drop, products, now }: { drop: Drop; products: Product[]; now: number }) {
  const sold = products.filter((p) => productState(p, now) === 'sold').length
  const total = products.length

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <LiveDot />
        <span className="eyebrow text-ink">En vivo · Drop {drop.number}</span>
      </div>
      <h1 className="display mt-3 break-words" style={heroSize(drop.name || `Drop ${drop.number}`)}>
        {drop.name || `Drop ${drop.number}`}
      </h1>
      {drop.description && <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{drop.description}</p>}
      <div className="mt-6 max-w-md">
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
          <span>{total - sold} disponibles</span>
          <span className="text-muted">
            {sold} de {total} vendidas
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${(sold / Math.max(1, total)) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

/** El drop sale por partes: una categoría por noche, a las 20:00. */
function ReleaseSchedule({ db, drop, now }: { db: DbState; drop: Drop; now: number }) {
  const all = dropProducts(db, drop.id)
  const rows = categories.filter((c) => drop.releases[c.id] || all.some((p) => p.category === c.id && isReady(p)))

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/70 p-2">
      <p className="eyebrow px-3 pb-1 pt-2">Calendario del drop</p>
      <ul>
        {rows.map((c) => {
          const status = releaseStatus(drop, c.id, now)
          const at = drop.releases[c.id]
          const list = all.filter((p) => p.category === c.id && isReady(p))
          const left = list.filter((p) => productState(p, now) !== 'sold').length
          return (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 odd:bg-paper/70">
              <span className="display text-2xl">{c.label}</span>
              {status === 'live' && (
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-ok" aria-hidden />
                  {left} de {list.length} disponibles
                </span>
              )}
              {status === 'scheduled' && at && (
                <a href="#avisame" className="flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">
                  {whenLabel(at, now)}
                  <span className="font-mono text-accent">{countdown(at - now)}</span>
                </a>
              )}
              {status === 'draft' && <span className="text-xs font-semibold text-muted">Pronto</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DropGrid({ drop, products, now, buyerId }: { drop: Drop; products: Product[]; now: number; buyerId: string | null }) {
  const [category, setCategory] = useState<CategoryId | 'todo'>('todo')
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sheet, setSheet] = useState(false)

  const releasedAt = (p: Product) => drop.releases[p.category] ?? 0
  const inCategory = products.filter((p) => category === 'todo' || p.category === category)
  const visible = applyFilters(inCategory, filters, now, releasedAt)
  const cats = categories.filter((c) => products.some((p) => p.category === c.id))
  const active = activeFilterCount(filters)

  return (
    <section className="mx-auto max-w-6xl px-4" aria-label="Prendas del drop">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-2 border-y border-ink/10 bg-paper/95 px-4 py-2.5 backdrop-blur-md">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          <Chip active={category === 'todo'} onClick={() => setCategory('todo')}>
            Todo <span className="opacity-50">{products.length}</span>
          </Chip>
          {cats.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label} <span className="opacity-50">{products.filter((p) => p.category === c.id).length}</span>
            </Chip>
          ))}
        </div>
        <button type="button" onClick={() => setSheet(true)} className={`chip shrink-0 ${active ? 'chip-active' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filtrar{active > 0 && ` · ${active}`}
        </button>
      </div>

      <p className="mt-4 text-xs text-muted">
        {visible.length} prendas · {visible.filter((p) => productState(p, now) === 'available').length} disponibles
      </p>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted">No hay prendas con esos filtros.</p>
          <button type="button" className="btn-ghost btn-sm mt-4" onClick={() => setFilters(defaultFilters)}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} now={now} buyerId={buyerId} discountPct={drop.discountPct} priority={i < 4} />
          ))}
        </div>
      )}

      <FilterSheet
        open={sheet}
        onClose={() => setSheet(false)}
        products={inCategory}
        filters={filters}
        onChange={setFilters}
        resultCount={visible.length}
      />
    </section>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`} aria-pressed={active}>
      {children}
    </button>
  )
}

function NextRelease({ db, release, now }: { db: DbState; release: UpcomingRelease; now: number }) {
  const cat = categoryById(release.category)
  const teaser = dropProducts(db, release.drop.id)
    .filter((p) => p.category === release.category && isReady(p))
    .slice(0, 4)
  const count = dropProducts(db, release.drop.id).filter((p) => p.category === release.category && isReady(p)).length

  return (
    <section id="avisame" className="mx-auto mt-20 max-w-6xl scroll-mt-20 px-4">
      <div className="overflow-hidden rounded-3xl bg-ink text-paper">
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-paper/50">
              Se viene · Drop {release.drop.number} {release.drop.name}
            </p>
            <h2 className="display mt-2 text-7xl sm:text-8xl">{cat.label}</h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-paper/70">
              {whenLabel(release.at, now)} · {count} prendas únicas
            </p>
            <p className="mt-4 font-mono text-5xl text-accent sm:text-6xl" aria-live="off">
              {countdown(release.at - now)}
            </p>
            <p className="mb-6 mt-4 max-w-sm text-sm text-paper/60">
              Sale a las {config.releaseHour}:00 en punto. Déjanos tu WhatsApp y te avisamos 15 minutos antes.
            </p>
            <NotifyForm dropId={release.drop.id} dark />
          </div>
          {teaser.length > 0 && (
            <div className="grid grid-cols-2 gap-2" aria-label="Adelanto">
              {teaser.map((p) => (
                <div key={p.id} className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <ProductImage src={p.images[0]} alt="" className="h-full w-full scale-110 blur-[10px]" />
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-paper/80">
                    {whenLabel(release.at, now)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function NoLiveDrop({ db, next, now }: { db: DbState; next?: UpcomingRelease; now: number }) {
  if (!next) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow">Sin drop activo</p>
        <h1 className="display mt-3 text-7xl sm:text-9xl">Lo próximo viene pronto</h1>
        <p className="mb-6 mt-4 max-w-md text-muted">
          Síguenos en Instagram @{config.brand.instagram} o déjanos tu contacto y te avisamos antes que a nadie.
        </p>
        <NotifyForm />
      </section>
    )
  }
  return (
    <div className="pt-6">
      <NextRelease db={db} release={next} now={now} />
      <HowItWorks now={now} />
    </div>
  )
}

function HowItWorks({ now }: { now: number }) {
  const steps = [
    [`${config.releaseHour}:00`, 'Cada noche se publica una categoría nueva del drop. Una prenda de cada una.'],
    ['Reserva', `Al agregarla al carrito queda apartada para ti por ${config.reservationMinutes} minutos.`],
    ['Paga', `Tarjeta al instante o transferencia con ${config.transferHoldHours} horas para pagar.`],
    ['Martes', `Despachamos todos los martes. El próximo: ${longDate(nextWeekday(config.dispatchWeekday, now))}.`],
  ]
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="display text-5xl">Cómo funciona</h2>
        <Link href="/ayuda" className="text-xs font-bold uppercase tracking-wider underline-offset-4 hover:underline">
          Preguntas frecuentes →
        </Link>
      </div>
      <div className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([title, text], i) => (
          <div key={title} className="bg-paper p-6">
            <p className="font-mono text-xs text-muted">0{i + 1}</p>
            <p className="display mt-2 text-3xl">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function GridSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 pt-10">
      <div className="h-4 w-32 rounded bg-bone" />
      <div className="mt-4 h-28 w-2/3 rounded bg-bone" />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-xl bg-bone" />
        ))}
      </div>
    </div>
  )
}
