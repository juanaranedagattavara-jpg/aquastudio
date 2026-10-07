'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { config, delivery } from '@/lib/config'
import { clp, countdown, longDate, nextWeekday, waLink } from '@/lib/format'
import { dispatchDate, orderStatus, useDb, useNow } from '@/lib/store'

export default function OrderPage({ params }: { params: { id: string } }) {
  const db = useDb()
  const now = useNow()
  const [copied, setCopied] = useState<string | null>(null)

  if (!db) return <div className="mx-auto mt-8 h-64 max-w-xl animate-pulse rounded-2xl bg-bone" />

  const order = db.orders.find((o) => o.id === params.id)
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="display text-5xl">Pedido no encontrado</p>
        <Link href="/" className="btn-primary mt-8">
          Volver a la tienda
        </Link>
      </div>
    )
  }

  const status = orderStatus(order, now)
  const method = delivery.find((d) => d.id === order.delivery.method)
  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* portapapeles bloqueado */
    }
  }

  const bankRows: [string, string][] = [
    ['Banco', config.bank.banco],
    ['Tipo', config.bank.tipo],
    ['Número', config.bank.numero],
    ['RUT', config.bank.rut],
    ['Titular', config.bank.titular],
    ['Email', config.bank.email],
    ['Monto', String(order.total)],
  ]

  return (
    <div className="mx-auto max-w-xl px-4 pt-8">
      <p className="eyebrow">Pedido #{order.code}</p>

      {(status === 'paid' || status === 'shipped') && (
        <>
          <h1 className="display mt-2 text-7xl">Es tuya.</h1>
          <p className="mt-3 text-muted">
            Pago confirmado. {order.delivery.method === 'retiro' ? 'La entregamos' : 'Sale'} el{' '}
            <strong className="text-ink">{longDate(dispatchDate(order))}</strong>. Te escribimos por WhatsApp al{' '}
            {order.customer.phone} para coordinar.
          </p>
        </>
      )}

      {status === 'pending' && (
        <>
          <h1 className="display mt-2 text-7xl">Te la guardamos.</h1>
          <p className="mt-3 text-muted">
            Transfiere <strong className="text-ink">{clp(order.total)}</strong> y envíanos el comprobante. Si no recibimos el
            pago en <span className="font-mono text-ink">{countdown((order.expiresAt ?? now) - now)}</span>, la prenda vuelve
            al drop. Si pagas hoy, sale el {longDate(nextWeekday(config.dispatchWeekday, now))}.
          </p>
          <div className="card mt-6 divide-y divide-ink/10 overflow-hidden text-sm">
            {bankRows.map(([label, value]) => (
              <button
                key={label}
                type="button"
                onClick={() => copy(label, value)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-paper"
              >
                <span className="text-muted">{label}</span>
                <span className="font-semibold">
                  {label === 'Monto' ? clp(order.total) : value}{' '}
                  <span className="ml-2 text-xs font-normal text-muted">{copied === label ? 'copiado' : 'copiar'}</span>
                </span>
              </button>
            ))}
          </div>
          <a
            href={waLink(config.brand.whatsapp, `Hola! Envío el comprobante del pedido #${order.code} por ${clp(order.total)}.`)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-4 w-full"
          >
            Enviar comprobante por WhatsApp
          </a>
        </>
      )}

      {(status === 'expired' || status === 'cancelled') && (
        <>
          <h1 className="display mt-2 text-6xl">{status === 'expired' ? 'La reserva expiró' : 'Pedido cancelado'}</h1>
          <p className="mt-3 text-muted">Si ya pagaste, escríbenos por WhatsApp con el número de pedido.</p>
        </>
      )}

      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {order.items.map((i) => (
          <li key={i.productId} className="flex items-center gap-3 py-3">
            <ProductImage src={i.image} alt={i.title} className="aspect-[4/5] w-14 rounded-md" />
            <div className="min-w-0 flex-1">
              {i.brand && <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{i.brand}</p>}
              <p className="truncate text-sm font-semibold">{i.title}</p>
              <p className="text-xs text-muted">Talla {i.size}</p>
            </div>
            <p className="text-sm font-semibold">{clp(i.price)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">{method?.label}</dt>
          <dd>{order.delivery.cost ? clp(order.delivery.cost) : 'Gratis'}</dd>
        </div>
        {order.delivery.address && (
          <p className="text-xs text-muted">
            {order.delivery.address}, {order.delivery.comuna}, {order.delivery.region}
          </p>
        )}
        <div className="flex justify-between pt-2 text-base font-black">
          <dt>Total</dt>
          <dd>{clp(order.total)}</dd>
        </div>
      </dl>
      {order.tracking && (
        <p className="mt-4 rounded-xl bg-white p-4 text-sm">
          Seguimiento: <strong className="font-mono">{order.tracking}</strong>
        </p>
      )}

      <Link href="/" className="btn-ghost mt-10 w-full">
        Seguir viendo el drop
      </Link>
    </div>
  )
}
