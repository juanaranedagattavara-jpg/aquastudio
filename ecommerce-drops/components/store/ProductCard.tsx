'use client'

import Link from 'next/link'
import { ProductImage } from '@/components/ProductImage'
import { clp, discounted, mmss } from '@/lib/format'
import { hasMeasurements, productState } from '@/lib/store'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  now: number
  buyerId: string | null
  discountPct?: number
  /** Las primeras tarjetas cargan sin lazy-loading para que la portada aparezca al tiro. */
  priority?: boolean
}

export function ProductCard({ product: p, now, buyerId, discountPct, priority }: Props) {
  const state = productState(p, now)
  const mine = state === 'reserved' && p.reservation?.buyerId === buyerId
  const price = discounted(p.price ?? 0, discountPct)

  return (
    <Link href={`/p/${p.id}`} className="group block rounded-xl">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bone">
        <ProductImage
          src={p.images[0]}
          alt={`${p.brand} ${p.title}`.trim()}
          priority={priority}
          className={`h-full w-full transition duration-500 group-hover:scale-[1.04] ${state === 'sold' ? 'opacity-35 grayscale' : ''}`}
        />
        {p.images[1] && state !== 'sold' && (
          <ProductImage
            src={p.images[1]}
            alt=""
            className="absolute inset-0 h-full w-full opacity-0 transition duration-500 group-hover:opacity-100 [@media(hover:none)]:hidden"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {state === 'sold' && <Badge className="bg-ink text-paper">Vendida</Badge>}
          {state === 'reserved' && mine && <Badge className="bg-accent text-ink">En tu carrito</Badge>}
          {state === 'reserved' && !mine && (
            <Badge className="bg-white/90 text-ink">
              {p.reservation?.orderId ? 'Reservada' : `En un carrito · ${mmss(p.reservation!.until - now)}`}
            </Badge>
          )}
          {discountPct && state !== 'sold' ? <Badge className="bg-alert text-white">−{discountPct}%</Badge> : null}
        </div>
      </div>
      <div className="mt-2.5 space-y-0.5">
        {p.brand && <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{p.brand}</p>}
        <p className="truncate text-sm font-semibold leading-tight">{p.title}</p>
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs text-muted">
            Talla {p.size}
            {hasMeasurements(p) && <span className="hidden sm:inline"> · {p.measurements.ancho}×{p.measurements.largo} cm</span>}
          </p>
          <p className={`shrink-0 text-sm font-bold ${state === 'sold' ? 'text-muted line-through' : ''}`}>
            {discountPct && state !== 'sold' && <span className="mr-1.5 text-xs font-normal text-muted line-through">{clp(p.price)}</span>}
            {clp(price)}
          </p>
        </div>
      </div>
    </Link>
  )
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}>{children}</span>
  )
}
