'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DropStatusPill } from '@/components/admin/StatusPill'
import { categories, config } from '@/lib/config'
import { clp, nextWeekday, shortDay, whenLabel } from '@/lib/format'
import {
  createDrop,
  dropProducts,
  dropStatus,
  liveDrops,
  missingFields,
  orderStatus,
  productState,
  releaseStatus,
  resetDemo,
  upcomingReleases,
  useDb,
  useNow,
} from '@/lib/store'

export default function AdminHome() {
  const db = useDb()
  const now = useNow()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  if (!db) return <div className="h-64 animate-pulse rounded-2xl bg-bone" />

  const current = liveDrops(db, now)[0]
  const currentProducts = current ? dropProducts(db, current.id).filter((p) => releaseStatus(current, p.category, now) === 'live') : []
  const soldNow = currentProducts.filter((p) => productState(p, now) === 'sold')
  const revenue = db.orders
    .filter((o) => current && o.dropId === current.id && (o.status === 'paid' || o.status === 'shipped'))
    .reduce((s, o) => s + o.subtotal, 0)
  const toConfirm = db.orders.filter((o) => orderStatus(o, now) === 'pending').length
  const toShip = db.orders.filter((o) => o.status === 'paid').length
  const next = upcomingReleases(db, now)[0]
  const drops = [...db.drops].sort((a, b) => b.number - a.number)
  const waiting = db.subscribers

  return (
    <div className="space-y-10">
      <section>
        <h1 className="display text-5xl">Resumen</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={current ? `Ventas · ${current.name}` : 'Ventas'} value={clp(revenue)} />
          <Stat label="Vendidas" value={`${soldNow.length}/${currentProducts.length}`} />
          <Stat label="Pagos por confirmar" value={String(toConfirm)} href="/admin/pedidos" highlight={toConfirm > 0} />
          <Stat
            label={`Despacho ${shortDay(nextWeekday(config.dispatchWeekday, now))}`}
            value={`${toShip} pedidos`}
            href="/admin/pedidos?tab=paid"
            highlight={toShip > 0}
          />
        </div>
        {next && (
          <Link
            href={`/admin/drop/${next.drop.id}`}
            className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-paper"
          >
            <span>
              Próxima publicación: <strong>{categories.find((c) => c.id === next.category)?.label}</strong> · {whenLabel(next.at, now)}
            </span>
            <span className="text-accent">Ver →</span>
          </Link>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="display text-5xl">Drops</h2>
          <button type="button" className="btn-primary btn-sm" onClick={() => router.push(`/admin/drop/${createDrop()}`)}>
            + Nuevo drop
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {drops.map((d) => {
            const products = dropProducts(db, d.id)
            const incomplete = products.filter((p) => missingFields(p).length > 0).length
            const sold = products.filter((p) => productState(p, now) === 'sold').length
            const status = dropStatus(d, now)
            const cats = categories.filter((c) => products.some((p) => p.category === c.id))
            return (
              <li key={d.id}>
                <Link href={`/admin/drop/${d.id}`} className="card flex items-start gap-4 p-4 transition hover:border-ink/30">
                  <span className="display text-5xl text-ink/15">{String(d.number).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-lg font-bold">{d.name || 'Sin nombre'}</p>
                      <DropStatusPill status={status} />
                      {d.discountPct ? <span className="rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold text-white">−{d.discountPct}%</span> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {products.length} prendas · {sold} vendidas
                      {incomplete > 0 && <span className="text-alert"> · {incomplete} incompletas</span>}
                    </p>
                    {cats.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cats.map((c) => {
                          const r = releaseStatus(d, c.id, now)
                          const at = d.releases[c.id]
                          return (
                            <span
                              key={c.id}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                r === 'live' ? 'bg-ok/15 text-ok' : r === 'scheduled' ? 'bg-accent text-ink' : 'bg-bone text-muted'
                              }`}
                            >
                              {c.label} · {r === 'live' ? 'publicada' : r === 'scheduled' && at ? whenLabel(at, now) : 'borrador'}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <span className="hidden text-xs font-semibold uppercase tracking-wide sm:block">
                    {status === 'draft' ? 'Seguir subiendo →' : 'Abrir →'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-black uppercase tracking-tight">Lista de aviso · {waiting.length} personas</h2>
            <p className="text-xs text-muted">
              Dejaron su WhatsApp o email en la tienda. Cópialos a tu lista de difusión antes de cada publicación de las {config.releaseHour}:00.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(waiting.map((s) => s.contact).join('\n'))
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              } catch {
                /* portapapeles bloqueado */
              }
            }}
          >
            {copied ? 'Copiados' : 'Copiar contactos'}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-ink/20 p-4 text-sm">
        <p className="font-semibold">Herramientas de demo</p>
        <p className="mt-1 text-xs text-muted">
          Los datos viven solo en este navegador. Para probar la competencia por una prenda, abre la tienda en dos pestañas:
          cada pestaña es un comprador distinto.
        </p>
        <button
          type="button"
          className="btn-ghost btn-sm mt-3"
          onClick={() => {
            if (confirm('¿Volver a los datos de ejemplo? Se pierde lo que hayas cargado.')) resetDemo()
          }}
        >
          Reiniciar datos de demo
        </button>
      </section>
    </div>
  )
}

function Stat({ label, value, href, highlight }: { label: string; value: string; href?: string; highlight?: boolean }) {
  const body = (
    <div className={`card h-full p-4 ${highlight ? 'border-ink bg-accent' : ''}`}>
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}
