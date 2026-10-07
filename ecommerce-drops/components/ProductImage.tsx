'use client'

import { useImageSrc } from '@/lib/images'

interface Props {
  src?: string
  alt: string
  className?: string
  priority?: boolean
}

/** Resuelve fotos guardadas en el dispositivo (idb:) o URLs normales. */
export function ProductImage({ src, alt, className = '', priority = false }: Props) {
  const resolved = useImageSrc(src)
  if (!resolved) return <div className={`bg-bone ${className}`} aria-hidden />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={`object-cover ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  )
}
