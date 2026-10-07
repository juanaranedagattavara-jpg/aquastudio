'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { config, delivery, regions } from '@/lib/config'
import { clp, longDate, mmss, nextWeekday } from '@/lib/format'
import { cartItems, finalPrice, placeOrder, releaseProduct, useBuyerId, useDb, useNow } from '@/lib/store'
import type { DeliveryMethod, PaymentMethod } from '@/lib/types'

const CUSTOMER_KEY = 'drops-proto:customer'

interface Form {
  name: string
  phone: string
  email: string
  method: DeliveryMethod
  region: string
  comuna: string
  address: string
  payment: PaymentMethod
}

const emptyForm: Form = {
  name: '',
  phone: '',
  email: '',
  method: 'envio-rm',
  region: 'Metropolitana',
  comuna: '',
  address: '',
  payment: 'tarjeta',
}

export default function CartPage() {
  const db = useDb()
  const now = useNow()
  const buyerId = useBuyerId()
  const router = useRouter()
  const [form, setForm] = useState<Form>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // En un drop gana el más rápido: recordamos los datos del comprador para la próxima.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_KEY)
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved) }))
    } catch {
      /* sin datos guardados */
    }
  }, [])

  if (!db) return <div className="mx-auto mt-8 h-64 max-w-2xl animate-pulse rounded-2xl bg-bone" />

  const items = cartItems(db, buyerId, now)
  const until = items.length ? Math.min(...items.map((p) => p.reservation!.until)) : 0
  const remaining = until - now
  const subtotal = items.reduce((s, p) => s + finalPrice(db, p), 0)
  const dispatch = longDate(nextWeekday(config.dispatchWeekday, now))
  const shipping = delivery.find((d) => d.id === form.method)!
  const total = subtotal + shipping.cost
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))

  if (!items.length && !processing) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="display text-6xl">Tu carrito está vacío</h1>
        <p className="mt-3 text-sm text-muted">
          Las prendas quedan reservadas {config.reservationMinutes} minutos. Si agregaste algo y no aparece, la reserva
          expiró y volvió al drop.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Ver el drop
        </Link>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerId) return
    setError(null)
    const needsAddress = form.method !== 'retiro'
    if (!form.name.trim() || !form.phone.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      return setError('Completa nombre, WhatsApp y un email válido.')
    }
    if (needsAddress && (!form.comuna.trim() || !form.address.trim())) {
      return setError('Completa la dirección de envío.')
    }

    setProcessing(true)
    if (form.payment === 'tarjeta') await new Promise((r) => setTimeout(r, 1200))
    const res = placeOrder({
      buyerId,
      customer: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() },
      delivery: {
        method: form.method,
        cost: shipping.cost,
        ...(needsAddress && { region: form.region, comuna: form.comuna.trim(), address: form.address.trim() }),
      },
      payment: form.payment,
    })
    if (!res.ok) {
      setProcessing(false)
      return setError(res.error)
    }
    try {
      const { payment: _p, ...toSave } = form
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(toSave))
    } catch {
      /* no crítico */
    }
    router.push(`/pedido/${res.order.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <h1 className="display text-6xl">Tu carrito</h1>

      {items.length > 0 && (
        <div className={`mt-4 rounded-2xl p-4 ${remaining < 2 * 60_000 ? 'bg-alert text-white' : 'bg-accent'}`}>
          <p className="text-sm font-semibold">
            Tus prendas están reservadas por <span className="font-mono text-base">{mmss(remaining)}</span>
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/15">
            <div
              className="h-full bg-ink transition-all"
              style={{ width: `${Math.max(0, Math.min(100, (remaining / (config.reservationMinutes * 60_000)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      <ul className="mt-4 divide-y divide-ink/10">
        {items.map((p) => (
          <li key={p.id} className="flex gap-3 py-3">
            <Link href={`/p/${p.id}`} className="w-20 shrink-0">
              <ProductImage src={p.images[0]} alt={p.title} className="aspect-[4/5] w-full rounded-lg" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              {p.brand && <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{p.brand}</p>}
              <p className="truncate font-semibold">{p.title}</p>
              <p className="text-xs text-muted">Talla {p.size}</p>
              <p className="mt-auto font-semibold">
                {finalPrice(db, p) !== p.price && <span className="mr-2 text-xs font-normal text-muted line-through">{clp(p.price)}</span>}
                {clp(finalPrice(db, p))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => buyerId && releaseProduct(p.id, buyerId)}
              className="self-start text-xs font-semibold uppercase tracking-wide text-muted hover:text-ink"
              aria-label={`Quitar ${p.title}`}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 space-y-8" noValidate>
        <fieldset className="space-y-3">
          <legend className="display mb-3 text-3xl">1 · Tus datos</legend>
          <Field label="Nombre" id="name">
            <input id="name" className="input" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="WhatsApp" id="phone">
              <input
                id="phone"
                className="input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+56 9 1234 5678"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </Field>
            <Field label="Email" id="email">
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="display mb-1 text-3xl">2 · Entrega</legend>
          <p className="mb-3 text-sm text-muted">
            Despachamos los martes. Tu pedido sale el <strong className="text-ink">{dispatch}</strong>.
          </p>
          {delivery.map((d) => (
            <Option key={d.id} name="delivery" checked={form.method === d.id} onChange={() => set('method', d.id)}>
              <span className="font-semibold">{d.label}</span>
              <span className="text-xs text-muted">{d.detail}</span>
              <span className="ml-auto font-semibold">{d.cost ? clp(d.cost) : 'Gratis'}</span>
            </Option>
          ))}
          {form.method !== 'retiro' && (
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <Field label="Región" id="region">
                <select id="region" className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Comuna" id="comuna">
                <input id="comuna" className="input" value={form.comuna} onChange={(e) => set('comuna', e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Dirección" id="address">
                  <input
                    id="address"
                    className="input"
                    autoComplete="street-address"
                    placeholder="Calle, número, depto"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="display mb-3 text-3xl">3 · Pago</legend>
          <Option name="payment" checked={form.payment === 'tarjeta'} onChange={() => set('payment', 'tarjeta')}>
            <span className="font-semibold">Tarjeta débito / crédito</span>
            <span className="text-xs text-muted">Mercado Pago o Webpay · se confirma al instante</span>
          </Option>
          <Option name="payment" checked={form.payment === 'transferencia'} onChange={() => set('payment', 'transferencia')}>
            <span className="font-semibold">Transferencia</span>
            <span className="text-xs text-muted">Tienes {config.transferHoldHours} h para pagar; la prenda queda guardada</span>
          </Option>
        </fieldset>

        <div className="card space-y-2 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal ({items.length})</span>
            <span>{clp(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Envío</span>
            <span>{shipping.cost ? clp(shipping.cost) : 'Gratis'}</span>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-black">
            <span>Total</span>
            <span>{clp(total)}</span>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">
            {error}
          </p>
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-ink/10 bg-paper/95 px-4 pb-safe pt-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <button type="submit" disabled={processing} className="btn-primary w-full text-base">
            {processing
              ? form.payment === 'tarjeta'
                ? 'Procesando pago (simulado)…'
                : 'Reservando…'
              : form.payment === 'tarjeta'
                ? `Pagar ${clp(total)}`
                : `Confirmar pedido · ${clp(total)}`}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
    </div>
  )
}

function Option({
  name,
  checked,
  onChange,
  children,
}: {
  name: string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex min-h-[56px] cursor-pointer flex-wrap items-center gap-x-3 gap-y-0.5 rounded-xl border bg-white px-4 py-3 text-sm transition ${
        checked ? 'border-ink ring-1 ring-ink' : 'border-ink/15 hover:border-ink/40'
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-ink" />
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5">{children}</span>
    </label>
  )
}
