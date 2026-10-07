'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Gallery } from '@/components/store/Gallery'
import { ProductCard } from '@/components/store/ProductCard'
import { categoryById, conditions, config } from '@/lib/config'
import { clp, countdown, mmss, waLink } from '@/lib/format'
import {
  dropStatus,
  isPublic,
  productState,
  publicDropProducts,
  releaseProduct,
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
  const [copied, setCopied] = useState(false)

  if (!db) return <div className="mx-auto mt-8 aspect-[4/5] max-w-md animate-pulse rounded-2xl bg-bone" />

  const p = db.products.find((x) => x.id === params.id)
  const drop = p && db.drops.find((d) => d.id === p.dropId)
  const preview = searchParams.preview === '1'
  const status = drop ? dropStatus(drop, now) : undefined

  if (!p || !drop || (!preview && (!isPublic(p) || status !== 'live'))) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        {drop && status === 'scheduled' ? (
          <>
            <p className="eyebrow">Drop {String(drop.number).padStart(2, '0')}</p>
            <p className="mt-2 text-2xl font-black uppercase">Esta prenda sale en</p>
            <p className="mt-2 font-mono text-4xl">{countdown((drop.launchAt ?? now) - now)}</p>
          </>
        ) : (
          <p className="text-2xl font-black uppercase">Esta prenda ya no está disponible</p>
        )}
        <Link href="/" className="btn-primary mt-8">
          Ver el drop actual
        </Link>
      </div>
    )
  }

  const cat = categoryById(p.category)
  const state = productState(p, now)
  const mine = state === 'reserved' && p.reservation?.buyerId === buyerId
  const condition = conditions.find((c) => c.id === p.condition)
  const related = publicDropProducts(db, drop.id)
    .filter((x) => x.id !== p.id && x.category === p.category && productState(x, now) === 'available')
    .slice(0, 4)

  const reserve = () => {
    if (!buyerId) return
    setError(null)
    const res = reserveProduct(p.id, buyerId)
    if (!res.ok) {
      setError(
        res.reason === 'sold'
          ? 'Te ganaron: se acaba de vender.'
          : res.reason === 'reserved'
            ? 'Alguien la agregó a su carrito segundos antes que tú.'
            : 'Esta prenda no está disponible.'
      )
    }
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
    <div className="mx-auto max-w-6xl px-4 pt-4">
      {preview && (
        <p className="mb-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold">
          Vista previa · así se verá cuando el drop esté en vivo.
        </p>
      )}
      <Link href="/" className="mb-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-muted hover:text-ink">
        ← Volver al drop
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
        <Gallery images={p.images} alt={p.title} dim={state === 'sold'} />

        <div className="md:sticky md:top-20 md:self-start">
          <p className="eyebrow">
            Drop {String(drop.number).padStart(2, '0')} · {cat.label}
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase leading-none tracking-tightest sm:text-4xl">{p.title}</h1>
          <p className={`mt-3 text-2xl font-semibold ${state === 'sold' ? 'text-muted line-through' : ''}`}>
            {clp(p.price)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip border-ink bg-ink text-paper">Prenda única</span>
            {condition && <span className="chip">{condition.label}</span>}
          </div>

          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            <Row label="Talla etiqueta" value={p.size} />
            {p.measurements.ancho && (
              <Row label={`${cat.measures.ancho}${p.category === 'pantalones' ? '' : ' (axila a axila)'}`} value={`${p.measurements.ancho} cm`} />
            )}
            {p.measurements.largo && <Row label={cat.measures.largo} value={`${p.measurements.largo} cm`} />}
            {condition && <Row label="Estado" value={condition.hint} />}
          </dl>
          <p className="mt-2 text-xs text-muted">
            Medidas con la prenda en plano. Tip: mide una prenda tuya que te quede bien y compara.
          </p>
          {p.notes && <p className="mt-4 text-sm leading-relaxed">{p.notes}</p>}

          <div className="mt-6">
            {state === 'available' && (
              <>
                <button type="button" onClick={reserve} disabled={!buyerId} className="btn-primary w-full text-base">
                  Reservar y agregar al carrito
                </button>
                <p className="mt-2 text-center text-xs text-muted">
                  Es la única. Al agregarla queda apartada para ti por {config.reservationMinutes} minutos.
                </p>
              </>
            )}
            {mine && (
              <div className="rounded-2xl bg-accent p-4">
                <p className="text-sm font-semibold">
                  Reservada para ti · <span className="font-mono">{mmss(p.reservation!.until - now)}</span>
                </p>
                <Link href="/carrito" className="btn-primary mt-3 w-full">
                  Ir a pagar
                </Link>
                <button
                  type="button"
                  onClick={() => buyerId && releaseProduct(p.id, buyerId)}
                  className="mt-2 min-h-[44px] w-full text-xs font-semibold uppercase tracking-wide underline-offset-2 hover:underline"
                >
                  Quitar del carrito
                </button>
              </div>
            )}
            {state === 'reserved' && !mine && (
              <div className="rounded-2xl border border-ink/15 p-4 text-sm">
                {p.reservation?.orderId ? (
                  <p className="font-semibold">Reservada: esperando confirmación de pago.</p>
                ) : (
                  <>
                    <p className="font-semibold">Alguien la tiene en su carrito.</p>
                    <p className="mt-1 text-muted">
                      Si no la paga, se libera en <span className="font-mono text-ink">{mmss(p.reservation!.until - now)}</span>. Quédate atento.
                    </p>
                  </>
                )}
              </div>
            )}
            {state === 'sold' && (
              <div className="rounded-2xl bg-ink p-4 text-paper">
                <p className="font-semibold">Vendida. Era la única.</p>
                <Link href="/" className="mt-2 inline-block text-sm text-accent underline-offset-2 hover:underline">
                  Ver lo que queda del drop →
                </Link>
              </div>
            )}
            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <a
              href={waLink(config.brand.whatsapp, `Hola! Tengo una consulta por "${p.title}" (talla ${p.size}) del drop ${drop.number}.`)}
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
        <section className="mt-16">
          <h2 className="text-xl font-black uppercase tracking-tightest">Más {cat.label.toLowerCase()} del drop</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
            {related.map((x) => (
              <ProductCard key={x.id} product={x} now={now} buyerId={buyerId} />
            ))}
          </div>
        </section>
      )}
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
