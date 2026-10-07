'use client'

import Link from 'next/link'
import { ProductImage } from '@/components/ProductImage'
import { clp, mmss } from '@/lib/format'
import { hasMeasurements, productState } from '@/lib/store'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  now: number
  buyerId: string | null
}

export function ProductCard({ product: p, now, buyerId }: Props) {
  const state = productState(p, now)
  const mine = state === 'reserved' && p.reservation?.buyerId === buyerId

  return (
    <Link href={`/p/${p.id}`} className="group block rounded-xl">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bone">
        <ProductImage
          src={p.images[0]}
          alt={p.title}
          className={`h-full w-full transition duration-300 group-hover:scale-[1.03] ${
            state === 'sold' ? 'opacity-35 grayscale' : ''
          }`}
        />
        {state === 'sold' && <Badge className="bg-ink text-paper">Vendida</Badge>}
        {state === 'reserved' && mine && <Badge className="bg-accent text-ink">En tu carrito</Badge>}
        {state === 'reserved' && !mine && (
          <Badge className="bg-white/90 text-ink">
            {p.reservation?.orderId ? 'Reservada' : `En un carrito · ${mmss(p.reservation!.until - now)}`}
          </Badge>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-semibold leading-tight">{p.title}</p>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <p className="truncate text-xs text-muted">
          Talla {p.size}
          {hasMeasurements(p) && ` · ${p.measurements.ancho}×${p.measurements.largo} cm`}
        </p>
        <p className={`shrink-0 text-sm font-semibold ${state === 'sold' ? 'text-muted line-through' : ''}`}>
          {clp(p.price)}
        </p>
      </div>
    </Link>
  )
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  )
}
