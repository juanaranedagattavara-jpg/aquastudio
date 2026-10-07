'use client'

import { useRef, useState } from 'react'
import { ProductImage } from '@/components/ProductImage'

/** Swipe en móvil (como Instagram), fotos apiladas en escritorio. */
export function Gallery({ images, alt, dim = false }: { images: string[]; alt: string; dim?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  return (
    <div>
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto md:mx-0 md:grid md:gap-3 md:overflow-visible"
      >
        {images.map((src, i) => (
          <div key={src + i} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-bone md:overflow-hidden md:rounded-2xl">
            <ProductImage
              src={src}
              alt={`${alt} — foto ${i + 1} de ${images.length}`}
              className={`h-full w-full ${dim ? 'opacity-40 grayscale' : ''}`}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-ink' : 'w-1.5 bg-ink/25'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
