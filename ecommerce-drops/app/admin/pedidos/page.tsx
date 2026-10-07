'use client'

import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { OrderStatusPill } from '@/components/admin/StatusPill'
import { config, delivery } from '@/lib/config'
import { clp, countdown, longDate, relativeTime, waLink } from '@/lib/format'
import {
  cancelOrder,
  confirmPayment,
  dispatchDate,
  markShipped,
  markShippedMany,
  orderStatus,
  useDb,
  useNow,
  type OrderView,
} from '@/lib/store'
import type { Order } from '@/lib/types'

type Tab = 'pending' | 'paid' | 'shipped' | 'all'

const tabs: { id: Tab; label: string; match: (s: OrderView) => boolean }[] = [
  { id: 'pending', label: 'Por confirmar', match: (s) => s === 'pending' || s === 'expired' },
  { id: 'paid', label: 'Por enviar', match: (s) => s === 'paid' },
  { id: 'shipped', label: 'Enviados', match: (s) => s === 'shipped' },
  { id: 'all', label: 'Todos', match: () => true },
]

export default function OrdersPage({ searchParams }: { searchParams: { tab?: Tab } }) {
  const db = useDb()
  const now = useNow()
  const [tab, setTab] = useState<Tab>(tabs.some((t) => t.id === searchParams.tab) ? searchParams.tab! : 'pending')

  if (!db) return <div className="h-64 animate-pulse rounded-2xl bg-bone" />

  const current = tabs.find((t) => t.id === tab)!
  const orders = db.orders.filter((o) => current.match(orderStatus(o, now))).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div>
      <h1 className="display text-5xl">Pedidos</h1>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto" role="tablist">
        {tabs.map((t) => {
          const count = db.orders.filter((o) => t.match(orderStatus(o, now))).length
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`chip ${tab === t.id ? 'chip-active' : ''}`}
            >
              {t.label} <span className="opacity-50">{count}</span>
            </button>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No hay pedidos aquí.</p>
      ) : tab === 'paid' ? (
        groupByDispatch(orders).map(([day, group]) => <DispatchGroup key={day} day={day} orders={group} now={now} />)
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} now={now} />
          ))}
        </ul>
      )}
    </div>
  )
}

function groupByDispatch(orders: Order[]): [number, Order[]][] {
  const groups = new Map<number, Order[]>()
  for (const o of orders) {
    const day = dispatchDate(o)
    groups.set(day, [...(groups.get(day) ?? []), o])
  }
  return Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
}

const shippingText = (o: Order) =>
  [
    `#${o.code} · ${o.customer.name} · ${o.customer.phone}`,
    o.delivery.address ? `${o.delivery.address}, ${o.delivery.comuna}, ${o.delivery.region}` : 'Retiro en persona',
    o.items.map((i) => `${i.brand} ${i.title} (${i.size})`.trim()).join(' + '),
  ].join('\n')

/** Los martes despacha todo junto: un bloque por día con acciones en lote. */
function DispatchGroup({ day, orders, now }: { day: number; orders: Order[]; now: number }) {
  const [copied, setCopied] = useState(false)
  const late = day < now - 12 * 3600_000
  const items = orders.reduce((n, o) => n + o.items.length, 0)

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink p-4 text-paper">
        <div className="mr-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-paper/50">{late ? 'Atrasado' : 'Despacho'}</p>
          <p className="display text-3xl first-letter:uppercase">{longDate(day)}</p>
          <p className="text-xs text-paper/60">
            {orders.length} pedidos · {items} prendas
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost btn-sm border-white/20 bg-transparent text-paper"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(orders.map(shippingText).join('\n\n'))
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            } catch {
              /* portapapeles bloqueado */
            }
          }}
        >
          {copied ? 'Copiado' : 'Copiar todo para etiquetas'}
        </button>
        <button
          type="button"
          className="btn-accent btn-sm"
          onClick={() => confirm(`¿Marcar los ${orders.length} pedidos como enviados?`) && markShippedMany(orders.map((o) => o.id))}
        >
          Marcar todos enviados
        </button>
      </div>
      <ul className="mt-3 space-y-3">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} now={now} />
        ))}
      </ul>
    </section>
  )
}

function OrderCard({ order: o, now }: { order: Order; now: number }) {
  const [tracking, setTracking] = useState('')
  const [shipping, setShipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const status = orderStatus(o, now)
  const method = delivery.find((d) => d.id === o.delivery.method)

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-bold">#{o.code}</span>
        <OrderStatusPill status={status} />
        <span className="text-xs text-muted">
          {relativeTime(o.createdAt, now)} · {o.payment === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}
        </span>
        <span className="ml-auto text-lg font-black">{clp(o.total)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold">{o.customer.name}</span>
        <a
          className="text-xs font-semibold text-ok underline-offset-2 hover:underline"
          href={waLink(o.customer.phone, `Hola ${o.customer.name.split(' ')[0]}! Te escribo de ${config.brand.name} por tu pedido #${o.code}.`)}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp {o.customer.phone}
        </a>
        <span className="text-xs text-muted">{o.customer.email}</span>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {o.items.map((i) => (
          <div key={i.productId} className="w-24 shrink-0">
            <ProductImage src={i.image} alt={i.title} className="aspect-[4/5] w-full rounded-lg" />
            <p className="mt-1 truncate text-[11px] font-semibold">{i.title}</p>
            <p className="text-[11px] text-muted">
              {i.brand ? `${i.brand} · ` : ''}
              {i.size} · {clp(i.price)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-paper p-3 text-xs">
        <p className="font-semibold">
          {method?.label} {o.delivery.cost ? `· ${clp(o.delivery.cost)}` : ''}
        </p>
        {o.delivery.address && (
          <p className="text-muted">
            {o.delivery.address}, {o.delivery.comuna}, {o.delivery.region}
          </p>
        )}
        {o.tracking && <p className="mt-1">Seguimiento: <span className="font-mono">{o.tracking}</span></p>}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-alert/10 px-3 py-2 text-xs font-semibold text-alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status === 'pending' && (
          <span className="mr-auto text-xs text-muted">
            Se libera en <span className="font-mono text-ink">{countdown((o.expiresAt ?? now) - now)}</span>
          </span>
        )}
        {status === 'expired' && <span className="mr-auto text-xs text-alert">Las prendas volvieron a la tienda.</span>}

        {(status === 'pending' || status === 'expired') && (
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => confirm('¿Cancelar el pedido y liberar las prendas?') && cancelOrder(o.id)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                const res = confirmPayment(o.id)
                setError(res.ok ? null : res.error ?? 'No se pudo confirmar')
              }}
            >
              Confirmar pago recibido
            </button>
          </>
        )}

        {status === 'paid' &&
          (shipping ? (
            <form
              className="flex w-full flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                markShipped(o.id, tracking)
              }}
            >
              <input
                className="input min-h-[36px] flex-1"
                placeholder={o.delivery.method === 'retiro' ? 'Nota (opcional)' : 'N° de seguimiento (opcional)'}
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                aria-label="Número de seguimiento"
              />
              <button type="submit" className="btn-primary btn-sm">
                {o.delivery.method === 'retiro' ? 'Marcar entregado' : 'Marcar enviado'}
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shippingText(o))
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {
                    /* portapapeles bloqueado */
                  }
                }}
              >
                {copied ? 'Copiado' : 'Copiar datos de envío'}
              </button>
              <button type="button" className="btn-primary btn-sm" onClick={() => setShipping(true)}>
                {o.delivery.method === 'retiro' ? 'Entregar' : 'Enviar'}
              </button>
            </>
          ))}
      </div>
    </li>
  )
}
