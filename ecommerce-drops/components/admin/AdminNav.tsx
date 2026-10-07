'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { config } from '@/lib/config'
import { orderStatus, useDb, useNow } from '@/lib/store'

export function AdminNav() {
  const pathname = usePathname()
  const db = useDb()
  const now = useNow(5000)
  const toConfirm = db?.orders.filter((o) => orderStatus(o, now) === 'pending').length ?? 0
  const toShip = db?.orders.filter((o) => o.status === 'paid').length ?? 0

  const links = [
    { href: '/admin', label: 'Drops', active: pathname === '/admin' || pathname.startsWith('/admin/drop') },
    { href: '/admin/pedidos', label: 'Pedidos', active: pathname.startsWith('/admin/pedidos'), badge: toConfirm + toShip },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink text-paper">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
        <span className="mr-3 text-sm font-black uppercase tracking-tightest">
          {config.brand.name} <span className="font-normal text-paper/50">panel</span>
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold uppercase tracking-wide ${
              l.active ? 'bg-paper text-ink' : 'text-paper/70 hover:text-paper'
            }`}
          >
            {l.label}
            {!!l.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-ink">
                {l.badge}
              </span>
            )}
          </Link>
        ))}
        <Link href="/" className="ml-auto text-xs font-semibold uppercase tracking-wide text-accent hover:underline">
          Ver tienda ↗
        </Link>
      </div>
    </header>
  )
}
