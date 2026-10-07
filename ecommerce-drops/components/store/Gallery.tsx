'use client'

import { useEffect, useRef, useState } from 'react'
import { ProductImage } from '@/components/ProductImage'

/**
 * Swipe en móvil (como Instagram), fotos apiladas en escritorio.
 * Tocar una foto la abre en pantalla completa: en ropa usada, ver el detalle vende.
 */
export function Gallery({ images, alt, dim = false }: { images: string[]; alt: string; dim?: boolean }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState<number | null>(null)

  return (
    <div>
      <div
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible"
      >
        {images.map((src, i) => (
          <button
            type="button"
            key={src + i}
            onClick={() => setZoom(i)}
            className={`relative aspect-[4/5] w-full shrink-0 cursor-zoom-in snap-center bg-bone md:overflow-hidden md:rounded-2xl ${
              i === 0 ? 'md:col-span-2' : ''
            }`}
            aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
          >
            <ProductImage
              src={src}
              alt={`${alt} — foto ${i + 1} de ${images.length}`}
              priority={i === 0}
              className={`h-full w-full ${dim ? 'opacity-40 grayscale' : ''}`}
            />
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-ink' : 'w-1.5 bg-ink/25'}`} />
          ))}
        </div>
      )}
      {zoom != null && <Lightbox images={images} start={zoom} alt={alt} onClose={() => setZoom(null)} />}
    </div>
  )
}

function Lightbox({ images, start, alt, onClose }: { images: string[]; start: number; alt: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(start)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = start * el.clientWidth
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && el) el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
      if (e.key === 'ArrowLeft' && el) el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [start, onClose])

  return (
    <div className="fixed inset-0 z-50 animate-fade-in bg-ink" role="dialog" aria-modal="true" aria-label="Fotos ampliadas">
      <div
        ref={ref}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((src, i) => (
          <div key={src + i} className="flex h-full w-full shrink-0 snap-center items-center justify-center p-2">
            <ProductImage src={src} alt={`${alt} — foto ${i + 1}`} className="h-full w-full !object-contain" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 text-paper">
        <span className="font-mono text-sm">
          {index + 1}/{images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Cerrar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
