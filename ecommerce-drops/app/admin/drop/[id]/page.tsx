'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LaunchBar } from '@/components/admin/LaunchBar'
import { ProductEditor } from '@/components/admin/ProductEditor'
import { DropStatusPill } from '@/components/admin/StatusPill'
import { UploadPanel } from '@/components/admin/UploadPanel'
import { categories } from '@/lib/config'
import {
  applyPrice,
  dropProducts,
  dropStatus,
  liveDrops,
  missingFields,
  updateDrop,
  useDb,
  useNow,
} from '@/lib/store'
import type { CategoryId, Product } from '@/lib/types'

function topPrices(products: Product[]): number[] {
  const counts = new Map<number, number>()
  for (const p of products) if (p.price) counts.set(p.price, (counts.get(p.price) ?? 0) + 1)
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([price]) => price)
    .sort((a, b) => a - b)
}

/** Lo que toca hoy: la primera categoría sin prendas; si no, una con prendas por completar. */
function suggestCategory(products: Product[]): CategoryId {
  return (
    categories.find((c) => c.id !== 'otros' && !products.some((p) => p.category === c.id))?.id ??
    categories.find((c) => products.some((p) => p.category === c.id && missingFields(p).length > 0))?.id ??
    'pantalones'
  )
}

export default function DropEditorPage({ params }: { params: { id: string } }) {
  const db = useDb()
  const now = useNow()
  const [picked, setPicked] = useState<CategoryId | null>(null)
  const [onlyIncomplete, setOnlyIncomplete] = useState(false)
  const [bulkPrice, setBulkPrice] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // Se sugiere una sola vez al entrar; después no se mueve aunque cambien las prendas.
  const suggested = db ? suggestCategory(dropProducts(db, params.id)) : null
  useEffect(() => {
    if (!picked && suggested) setPicked(suggested)
  }, [picked, suggested])

  if (!db) return <div className="h-64 animate-pulse rounded-2xl bg-bone" />

  const drop = db.drops.find((d) => d.id === params.id)
  if (!drop) {
    return (
      <p>
        Drop no encontrado. <Link href="/admin" className="underline">Volver</Link>
      </p>
    )
  }

  const products = dropProducts(db, drop.id).sort((a, b) => a.createdAt - b.createdAt)
  const category = picked ?? suggested ?? 'pantalones'
  const inCategory = products.filter((p) => p.category === category)
  const visible = onlyIncomplete ? inCategory.filter((p) => missingFields(p).length > 0) : inCategory
  const priceHints = topPrices(products.filter((p) => p.category === category))
  const status = dropStatus(drop, now)
  const otherLive = liveDrops(db, now).find((d) => d.id !== drop.id)
  const waiting = db.subscribers.filter((s) => s.dropId === drop.id).length

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-muted hover:text-ink">
          ← Drops
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-4xl font-black text-ink/20">{String(drop.number).padStart(2, '0')}</span>
          <input
            key={`name-${drop.name}`}
            aria-label="Nombre del drop"
            className="min-w-0 flex-1 bg-transparent text-2xl font-black sm:text-3xl uppercase tracking-tightest placeholder:text-ink/20 focus:outline-none"
            placeholder="Nombre del drop"
            defaultValue={drop.name}
            onBlur={(e) => e.target.value !== drop.name && updateDrop(drop.id, { name: e.target.value })}
          />
          <DropStatusPill status={status} />
        </div>
        <textarea
          key={`desc-${drop.description}`}
          aria-label="Descripción del drop"
          rows={1}
          className="mt-1 w-full resize-none bg-transparent text-sm text-muted placeholder:text-ink/25 focus:outline-none"
          placeholder="Descripción corta (aparece en la portada)…"
          defaultValue={drop.description}
          onBlur={(e) => e.target.value !== drop.description && updateDrop(drop.id, { description: e.target.value })}
        />
        {waiting > 0 && status !== 'live' && (
          <p className="mt-2 text-xs font-semibold">{waiting} personas pidieron aviso para este drop.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Categorías">
        {categories.map((c) => {
          const list = products.filter((p) => p.category === c.id)
          const pending = list.filter((p) => missingFields(p).length > 0).length
          const active = c.id === category
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPicked(c.id)}
              className={`rounded-2xl border p-3 text-left transition ${
                active ? 'border-ink bg-ink text-paper' : 'border-ink/10 bg-white hover:border-ink/30'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{c.label}</p>
              <p className="mt-1 text-2xl font-black">{list.length}</p>
              <p className={`text-[11px] font-semibold ${pending ? (active ? 'text-accent' : 'text-alert') : 'opacity-60'}`}>
                {list.length === 0 ? 'Pendiente' : pending ? `${pending} por completar` : 'Todo listo ✓'}
              </p>
            </button>
          )
        })}
      </div>

      <UploadPanel
        dropId={drop.id}
        category={category}
        onUploaded={(count) => {
          flash(count ? `Se crearon ${count} prendas. Complétalas abajo.` : 'No se pudo leer ninguna foto.')
          setOnlyIncomplete(false)
        }}
      />

      <section>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-black uppercase tracking-tightest">
            {categories.find((c) => c.id === category)?.label} · {inCategory.length}
          </h2>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input type="checkbox" className="h-4 w-4 accent-ink" checked={onlyIncomplete} onChange={(e) => setOnlyIncomplete(e.target.checked)} />
            Solo incompletas
          </label>
          {inCategory.length > 1 && (
            <form
              className="ml-auto flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const price = Number(bulkPrice)
                if (!price) return
                const n = applyPrice(drop.id, category, price, true)
                flash(n ? `Precio aplicado a ${n} prendas sin precio.` : 'Todas ya tenían precio.')
                setBulkPrice('')
              }}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                <input
                  aria-label="Precio para las prendas sin precio"
                  className="input min-h-[36px] w-28 rounded-full pl-6"
                  inputMode="numeric"
                  placeholder="Precio"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <button type="submit" className="btn-ghost btn-sm" disabled={!bulkPrice}>
                A las sin precio
              </button>
            </form>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-muted">
            {inCategory.length ? 'Todas las prendas de esta categoría están completas.' : 'Todavía no subes prendas en esta categoría.'}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {visible.map((p) => {
              const idx = inCategory.indexOf(p)
              return <ProductEditor key={p.id} product={p} prev={inCategory[idx - 1]} suggestedPrices={priceHints} now={now} />
            })}
          </div>
        )}
      </section>

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-sm rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}

      <LaunchBar drop={drop} products={products} now={now} otherLive={otherLive} />
    </div>
  )
}
