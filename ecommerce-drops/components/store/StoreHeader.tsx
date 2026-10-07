'use client'

import Link from 'next/link'
import { config } from '@/lib/config'
import { mmss } from '@/lib/format'
import { cartItems, useBuyerId, useDb, useNow } from '@/lib/store'

export function StoreHeader() {
  const db = useDb()
  const buyerId = useBuyerId()
  const now = useNow()
  const items = db ? cartItems(db, buyerId, now) : []
  const until = items.length ? Math.min(...items.map((p) => p.reservation!.until)) : null

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[11px] text-paper/80">
        Prototipo · los datos viven en este navegador ·{' '}
        <Link href="/admin" className="font-semibold text-accent underline-offset-2 hover:underline">
          Panel de la marca →
        </Link>
      </div>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-black uppercase tracking-tightest">
            {config.brand.name}
          </Link>
          <Link
            href="/carrito"
            className="flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wide"
            aria-label={`Carrito, ${items.length} prendas`}
          >
            Carrito
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs text-paper">
              {items.length}
            </span>
            {until && (
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-xs" aria-label="Tiempo de reserva">
                {mmss(until - now)}
              </span>
            )}
          </Link>
        </div>
      </header>
    </>
  )
}
