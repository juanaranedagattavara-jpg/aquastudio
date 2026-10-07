'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Gallery } from '@/components/store/Gallery'
import { NotifyForm } from '@/components/store/NotifyForm'
import { ProductCard } from '@/components/store/ProductCard'
import { categoryById, conditions, config } from '@/lib/config'
import { clp, countdown, longDate, mmss, nextWeekday, waLink, whenLabel } from '@/lib/format'
import {
  finalPrice,
  isPublic,
  productState,
  publicDropProducts,
  releaseProduct,
  releaseStatus,
  reserveProduct,
  useBuyerId,
  useDb,
  useNow,
} from '@/lib/store'

interface Props {
  params: { id: string }
  searchParams: { preview?: string }
}

export default function ProductPage({ params, searchParams }: Props) {
  const db = useDb()
  const now = useNow()
  const buyerId = useBuyerId()
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!db) return <div className="mx-auto mt-8 aspect-[4/5] max-w-md animate-pulse rounded-2xl bg-bone" />

  const p = db.products.find((x) => x.id === params.id)
  const drop = p && db.drops.find((d) => d.id === p.dropId)
  const preview = searchParams.preview === '1'

  if (!p || !drop || (!preview && !isPublic(db, p, now))) {
    const at = p && drop && releaseStatus(drop, p.category, now) === 'scheduled' ? drop.releases[p.category] : undefined
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        {at ? (
          <>
            <p className="eyebrow">
              Drop {drop!.number} · {categoryById(p!.category).label}
            </p>
            <p className="display mt-3 text-5xl">Sale {whenLabel(at, now)}</p>
            <p className="mt-3 font-mono text-4xl">{countdown(at - now)}</p>
            <div className="mt-8 flex justify-center">
              <NotifyForm dropId={drop!.id} />
            </div>
          </>
        ) : (
          <p className="display text-5xl">Esta prenda ya no está disponible</p>
        )}
        <Link href="/" className="btn-primary mt-8">
          Ver el drop
        </Link>
      </div>
    )
  }

  const cat = categoryById(p.category)
  const state = productState(p, now)
  const mine = state === 'reserved' && p.reservation?.buyerId === buyerId
  const condition = conditions.find((c) => c.id === p.condition)
  const price = finalPrice(db, p)
  const dispatch = longDate(nextWeekday(config.dispatchWeekday, now))
  const related = publicDropProducts(db, drop.id, now)
    .filter((x) => x.id !== p.id && x.category === p.category && productState(x, now) === 'available')
    .slice(0, 4)

  const reserve = () => {
    if (!buyerId) return
    setError(null)
    const res = reserveProduct(p.id, buyerId)
    if (res.ok) {
      setToast(true)
      setTimeout(() => setToast(false), 4000)
      return
    }
    setError(
      res.reason === 'sold'
        ? 'Te ganaron: se acaba de vender.'
        : res.reason === 'reserved'
          ? 'Alguien la agregó a su carrito segundos antes que tú.'
          : 'Esta prenda no está disponible.'
    )
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.replace(/\?.*$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* el portapapeles puede estar bloqueado en el navegador de Instagram */
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-0">
      {preview && (
        <p className="mb-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold">
          Vista previa · así se verá cuando la categoría esté publicada.
        </p>
      )}
      <Link href="/" className="mb-2 inline-flex min-h-[44px] items-center text-xs font-bold uppercase tracking-wider text-muted hover:text-ink">
        ← Drop {drop.number} · {cat.label}
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:gap-12">
        <Gallery images={p.images} alt={`${p.brand} ${p.title}`.trim()} dim={state === 'sold'} />

        <div className="md:sticky md:top-20 md:self-start">
          {p.brand && <p className="eyebrow text-ink">{p.brand}</p>}
          <h1 className="display mt-2 text-5xl sm:text-6xl">{p.title}</h1>
          <p className="mt-4 flex items-baseline gap-3">
            <span className={`text-3xl font-bold ${state === 'sold' ? 'text-muted line-through' : ''}`}>{clp(price)}</span>
            {drop.discountPct && state !== 'sold' && (
              <>
                <span className="text-muted line-through">{clp(p.price)}</span>
                <span className="rounded-full bg-alert px-2 py-0.5 text-xs font-bold text-white">−{drop.discountPct}%</span>
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip border-ink bg-ink text-paper">Prenda única</span>
            {condition && <span className="chip">{condition.label}</span>}
            <span className="chip">Talla {p.size}</span>
          </div>

          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            <Row label="Talla etiqueta" value={p.size} />
            {p.measurements.ancho && (
              <Row
                label={`${cat.measures.ancho}${p.category === 'pantalones' ? '' : ' (axila a axila)'}`}
                value={`${p.measurements.ancho} cm`}
              />
            )}
            {p.measurements.largo && <Row label={cat.measures.largo} value={`${p.measurements.largo} cm`} />}
            {condition && <Row label="Estado" value={condition.hint} />}
          </dl>
          <p className="mt-2 text-xs text-muted">
            Medidas con la prenda en plano. Tip: mide una prenda tuya que te quede bien y compara.
          </p>
          {p.notes && <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-relaxed">{p.notes}</p>}

          <div className="mt-6 hidden md:block">
            <Action state={state} mine={mine} now={now} until={p.reservation?.until} orderHold={Boolean(p.reservation?.orderId)} onReserve={reserve} onRelease={() => buyerId && releaseProduct(p.id, buyerId)} disabled={!buyerId} />
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
              {error}
            </p>
          )}

          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex gap-3">
              <TruckIcon />
              <span>
                Si la compras hoy, sale el <strong>{dispatch}</strong>. Envíos a todo Chile o retiro.
              </span>
            </li>
            <li className="flex gap-3">
              <ClockIcon />
              <span>Al agregarla queda reservada para ti por {config.reservationMinutes} minutos.</span>
            </li>
          </ul>

          <div className="mt-6 flex gap-2">
            <a
              href={waLink(config.brand.whatsapp, `Hola! Consulta por "${p.brand} ${p.title}" (talla ${p.size}) del drop ${drop.number}.`)}
              className="btn-ghost btn-sm flex-1"
              target="_blank"
              rel="noreferrer"
            >
              Preguntar por WhatsApp
            </a>
            <button type="button" onClick={share} className="btn-ghost btn-sm flex-1">
              {copied ? 'Link copiado' : 'Copiar link'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display text-4xl">Más {cat.label.toLowerCase()}</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4">
            {related.map((x) => (
              <ProductCard key={x.id} product={x} now={now} buyerId={buyerId} discountPct={drop.discountPct} />
            ))}
          </div>
        </section>
      )}

      {/* Botón fijo en móvil: la foto ocupa toda la pantalla y el CTA quedaba abajo. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-4 pb-safe pt-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted">{p.title}</p>
            <p className="font-bold">{clp(price)}</p>
          </div>
          <div className="flex-1">
            <Action compact state={state} mine={mine} now={now} until={p.reservation?.until} orderHold={Boolean(p.reservation?.orderId)} onReserve={reserve} onRelease={() => buyerId && releaseProduct(p.id, buyerId)} disabled={!buyerId} />
          </div>
        </div>
      </div>

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm animate-toast-in items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-paper shadow-xl md:bottom-8">
          <span>
            Agregada · reservada <span className="font-mono text-accent">{mmss((p.reservation?.until ?? now) - now)}</span>
          </span>
          <Link href="/carrito" className="font-bold text-accent">
            Ver carrito →
          </Link>
        </div>
      )}
    </div>
  )
}

interface ActionProps {
  state: ReturnType<typeof productState>
  mine: boolean
  now: number
  until?: number
  orderHold: boolean
  onReserve: () => void
  onRelease: () => void
  disabled: boolean
  compact?: boolean
}

function Action({ state, mine, now, until, orderHold, onReserve, onRelease, disabled, compact }: ActionProps) {
  if (state === 'available') {
    return (
      <button type="button" onClick={onReserve} disabled={disabled} className="btn-primary w-full text-[13px]">
        {compact ? 'Agregar al carrito' : 'Reservar y agregar al carrito'}
      </button>
    )
  }
  if (mine) {
    return compact ? (
      <Link href="/carrito" className="btn-accent w-full text-[13px]">
        Pagar · <span className="font-mono">{mmss((until ?? now) - now)}</span>
      </Link>
    ) : (
      <div className="rounded-2xl bg-accent p-4">
        <p className="text-sm font-semibold">
          Reservada para ti · <span className="font-mono">{mmss((until ?? now) - now)}</span>
        </p>
        <Link href="/carrito" className="btn-primary mt-3 w-full">
          Ir a pagar
        </Link>
        <button
          type="button"
          onClick={onRelease}
          className="mt-1 min-h-[44px] w-full text-xs font-semibold uppercase tracking-wide underline-offset-2 hover:underline"
        >
          Quitar del carrito
        </button>
      </div>
    )
  }
  if (state === 'reserved') {
    const text = orderHold ? 'Reservada · esperando pago' : `En un carrito · se libera en ${mmss((until ?? now) - now)}`
    return compact ? (
      <p className="flex min-h-[44px] items-center justify-center rounded-full border border-ink/15 px-3 text-center text-xs font-semibold">{text}</p>
    ) : (
      <div className="rounded-2xl border border-ink/15 p-4 text-sm">
        <p className="font-semibold">{orderHold ? 'Reservada: esperando confirmación de pago.' : 'Alguien la tiene en su carrito.'}</p>
        {!orderHold && (
          <p className="mt-1 text-muted">
            Si no la paga, se libera en <span className="font-mono text-ink">{mmss((until ?? now) - now)}</span>. Quédate atento.
          </p>
        )}
      </div>
    )
  }
  return compact ? (
    <p className="flex min-h-[44px] items-center justify-center rounded-full bg-ink text-xs font-bold uppercase tracking-wider text-paper">Vendida</p>
  ) : (
    <div className="rounded-2xl bg-ink p-4 text-paper">
      <p className="font-semibold">Vendida. Era la única.</p>
      <Link href="/" className="mt-2 inline-block text-sm text-accent underline-offset-2 hover:underline">
        Ver lo que queda del drop →
      </Link>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}

function TruckIcon() {
  return (
    <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" />
    </svg>
  )
}
