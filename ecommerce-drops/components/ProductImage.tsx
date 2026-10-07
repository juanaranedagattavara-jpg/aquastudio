'use client'

import { useImageSrc } from '@/lib/images'

interface Props {
  src?: string
  alt: string
  className?: string
}

/** Resuelve fotos guardadas en el dispositivo (idb:) o URLs normales. */
export function ProductImage({ src, alt, className = '' }: Props) {
  const resolved = useImageSrc(src)
  if (!resolved) return <div className={`bg-bone ${className}`} aria-hidden />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolved} alt={alt} className={`object-cover ${className}`} loading="lazy" decoding="async" />
}
