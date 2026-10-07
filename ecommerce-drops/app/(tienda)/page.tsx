'use client'

import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { LiveDot } from '@/components/store/LiveDot'
import { NotifyForm } from '@/components/store/NotifyForm'
import { ProductCard } from '@/components/store/ProductCard'
import { categories, config, sizes } from '@/lib/config'
import { countdown } from '@/lib/format'
import {
  liveDrops,
  nextDrop,
  productState,
  publicDropProducts,
  useBuyerId,
  useDb,
  useNow,
} from '@/lib/store'
import type { CategoryId, DbState, Drop, Product } from '@/lib/types'

const pad2 = (n: number) => String(n).padStart(2, '0')

export default function StorePage() {
  const db = useDb()
  const now = useNow()
  const buyerId = useBuyerId()

  if (!db) return <GridSkeleton />

  const [current, ...older] = liveDrops(db, now)
  const upcoming = nextDrop(db, now)

  if (!current) return <NoLiveDrop db={db} upcoming={upcoming} now={now} />

  const leftovers = older
    .flatMap((d) => publicDropProducts(db, d.id))
    .filter((p) => productState(p, now) !== 'sold')

  return (
    <>
      <DropHero db={db} drop={current} now={now} />
      {upcoming && <UpcomingStrip drop={upcoming} now={now} />}
      <DropGrid products={publicDropProducts(db, current.id)} now={now} buyerId={buyerId} />

      {leftovers.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4">
          <h2 className="text-2xl font-black uppercase tracking-tightest">Últimas piezas</h2>
          <p className="mt-1 text-sm text-muted">Lo que quedó de drops anteriores.</p>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {leftovers.map((p) => (
              <ProductCard key={p.id} product={p} now={now} buyerId={buyerId} />
            ))}
          </div>
        </section>
      )}

      <HowItWorks />

      <section id={upcoming ? 'avisame-upcoming' : 'avisame'} className="mx-auto mt-16 max-w-6xl scroll-mt-20 px-4">
        <div className="rounded-3xl bg-ink p-6 text-paper sm:p-10">
          <p className="eyebrow text-paper/60">
            Próximo drop{upcoming && ` · ${pad2(upcoming.number)} ${upcoming.name}`}
          </p>
          {upcoming ? (
            <p className="mt-2 font-mono text-4xl text-accent">{countdown((upcoming.launchAt ?? now) - now)}</p>
          ) : (
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tightest">Que no te lo cuenten</h2>
          )}
          <p className="mb-5 mt-2 max-w-md text-sm text-paper/70">
            Te escribimos antes de que salga. Las prendas son únicas: llegar primero importa.
          </p>
          <NotifyForm dropId={upcoming?.id} dark />
        </div>
      </section>
    </>
  )
}

function DropHero({ db, drop, now }: { db: DbState; drop: Drop; now: number }) {
  const products = publicDropProducts(db, drop.id)
  const sold = products.filter((p) => productState(p, now) === 'sold').length
  const total = products.length

  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-8">
      <div className="flex items-center gap-2">
        <LiveDot />
        <span className="eyebrow text-ink">En vivo · Drop {pad2(drop.number)}</span>
      </div>
      <h1 className="mt-3 text-[13vw] font-black uppercase leading-[0.85] tracking-tightest sm:text-7xl">
        {drop.name || `Drop ${pad2(drop.number)}`}
      </h1>
      {drop.description && <p className="mt-4 max-w-md text-muted">{drop.description}</p>}
      <div className="mt-6 max-w-md">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wide">
          <span>{total - sold} disponibles</span>
          <span className="text-muted">
            {sold} de {total} vendidas
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(sold / Math.max(1, total)) * 100}%` }} />
        </div>
      </div>
    </section>
  )
}

function UpcomingStrip({ drop, now }: { drop: Drop; now: number }) {
  return (
    <a href="#avisame-upcoming" className="block bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
        <span>
          Drop {pad2(drop.number)} {drop.name && `· ${drop.name}`}
        </span>
        <span className="font-mono text-accent">{countdown((drop.launchAt ?? now) - now)}</span>
      </div>
    </a>
  )
}

function DropGrid({ products, now, buyerId }: { products: Product[]; now: number; buyerId: string | null }) {
  const [category, setCategory] = useState<CategoryId | 'todo'>('todo')
  const [size, setSize] = useState<string | null>(null)
  const [hideSold, setHideSold] = useState(false)

  const sorted = [...products].sort((a, b) => a.createdAt - b.createdAt)
  const inCategory = sorted.filter((p) => category === 'todo' || p.category === category)
  const sizeOrder = (s: string) => (sizes.includes(s) ? sizes.indexOf(s) : sizes.length)
  const sizesHere = Array.from(new Set(inCategory.map((p) => p.size))).sort((a, b) => sizeOrder(a) - sizeOrder(b))
  const visible = inCategory.filter(
    (p) => (!size || p.size === size) && (!hideSold || productState(p, now) !== 'sold')
  )
  const cats = categories.filter((c) => products.some((p) => p.category === c.id))

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="sticky top-14 z-20 -mx-4 space-y-2 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <FilterChip active={category === 'todo'} onClick={() => (setCategory('todo'), setSize(null))}>
            Todo <span className="opacity-50">{products.length}</span>
          </FilterChip>
          {cats.map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => (setCategory(c.id), setSize(null))}>
              {c.label} <span className="opacity-50">{products.filter((p) => p.category === c.id).length}</span>
            </FilterChip>
          ))}
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <span className="eyebrow shrink-0">Talla</span>
          {sizesHere.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(size === s ? null : s)}
              className={`chip min-h-[32px] px-3 ${size === s ? 'chip-active' : ''}`}
              aria-pressed={size === s}
            >
              {s}
            </button>
          ))}
          <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 pl-2 text-xs font-semibold">
            <input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} className="h-4 w-4 accent-ink" />
            Ocultar vendidas
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No hay prendas con ese filtro.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} now={now} buyerId={buyerId} />
          ))}
        </div>
      )}
    </section>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`} aria-pressed={active}>
      {children}
    </button>
  )
}

function NoLiveDrop({ db, upcoming, now }: { db: DbState; upcoming?: Drop; now: number }) {
  if (!upcoming) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow">Sin drop activo</p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-tightest sm:text-7xl">
          Lo próximo viene pronto
        </h1>
        <p className="mb-6 mt-4 max-w-md text-muted">
          Síguenos en Instagram @{config.brand.instagram} o déjanos tu contacto y te avisamos antes que a nadie.
        </p>
        <NotifyForm />
      </section>
    )
  }

  const teaser = publicDropProducts(db, upcoming.id).slice(0, 4)
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow text-paper/60">Próximo · Drop {pad2(upcoming.number)}</p>
        <h1 className="mt-3 text-[13vw] font-black uppercase leading-[0.85] tracking-tightest sm:text-7xl">
          {upcoming.name || `Drop ${pad2(upcoming.number)}`}
        </h1>
        <p className="mt-6 font-mono text-4xl text-accent sm:text-6xl" aria-live="off">
          {countdown((upcoming.launchAt ?? now) - now)}
        </p>
        <div id="avisame-upcoming" className="mt-8">
          <NotifyForm dropId={upcoming.id} dark />
        </div>
        {teaser.length > 0 && (
          <div className="mt-12 grid grid-cols-4 gap-2" aria-label="Adelanto del drop">
            {teaser.map((p) => (
              <div key={p.id} className="aspect-[4/5] overflow-hidden rounded-lg">
                <ProductImage src={p.images[0]} alt="" className="h-full w-full scale-110 blur-md" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    ['Reserva', `Al agregar una prenda queda apartada para ti por ${config.reservationMinutes} minutos.`],
    ['Paga', `Tarjeta al instante, o transferencia con ${config.transferHoldHours} horas para pagar.`],
    ['Recibe', 'Envío a todo Chile o retiro en persona.'],
  ]
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
        {steps.map(([title, text], i) => (
          <div key={title} className="bg-paper p-5">
            <p className="font-mono text-xs text-muted">0{i + 1}</p>
            <p className="mt-1 font-black uppercase tracking-tight">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function GridSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 pt-8">
      <div className="h-4 w-32 rounded bg-bone" />
      <div className="mt-4 h-16 w-3/4 rounded bg-bone" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-xl bg-bone" />
        ))}
      </div>
    </div>
  )
}
