'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { config } from '@/lib/config'
import { mmss } from '@/lib/format'
import { cartItems, useBuyerId, useDb, useNow } from '@/lib/store'
import { Ticker } from './Ticker'

export function StoreHeader() {
  const db = useDb()
  const buyerId = useBuyerId()
  const now = useNow()
  const pathname = usePathname()
  const items = db ? cartItems(db, buyerId, now) : []
  const until = items.length ? Math.min(...items.map((p) => p.reservation!.until)) : null

  return (
    <>
      <div className="bg-ink px-4 py-1.5 text-center text-[11px] text-paper/70">
        Demo · los datos viven en tu navegador ·{' '}
        <Link href="/admin" className="font-semibold text-accent underline-offset-2 hover:underline">
          Ver panel de la marca →
        </Link>
      </div>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4">
          <Link href="/" className="display text-[28px]" aria-label={`${config.brand.name}, inicio`}>
            {config.brand.name}
          </Link>
          <nav className="hidden items-center gap-5 text-xs font-semibold uppercase tracking-wider sm:flex">
            <Link href="/" className={pathname === '/' ? 'text-ink' : 'text-muted hover:text-ink'}>
              Drop
            </Link>
            <Link href="/ayuda" className={pathname === '/ayuda' ? 'text-ink' : 'text-muted hover:text-ink'}>
              Cómo comprar
            </Link>
          </nav>
          <Link
            href="/carrito"
            className="ml-auto flex min-h-[44px] items-center gap-2 text-xs font-bold uppercase tracking-wider"
            aria-label={`Carrito, ${items.length} prendas`}
          >
            <span className="hidden sm:inline">Carrito</span>
            <BagIcon />
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] text-paper">
              {items.length}
            </span>
            {until && (
              <span className="rounded-full bg-accent px-2 py-1 font-mono text-[11px]" aria-label="Tiempo de reserva">
                {mmss(until - now)}
              </span>
            )}
          </Link>
        </div>
      </header>
      <Ticker />
    </>
  )
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="sm:hidden">
      <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
