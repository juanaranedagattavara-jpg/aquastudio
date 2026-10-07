'use client'

/**
 * Fotos subidas desde el panel.
 *
 * 1. Se comprimen en el teléfono antes de subir (una foto de 4 MB queda en ~150 KB):
 *    la carga es rápida aunque esté con datos móviles.
 * 2. En el prototipo se guardan en IndexedDB del navegador. En producción este
 *    mismo blob se sube a Supabase Storage / Cloudinary y se guarda la URL.
 */

import { useEffect, useState } from 'react'

const DB_NAME = 'drops-proto-images'
const STORE = 'images'
const PREFIX = 'idb:'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function compressImage(file: File, maxSide = 1400, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo comprimir'))), 'image/jpeg', quality)
  )
}

/** Guarda la foto y devuelve la referencia que se guarda en la prenda. */
export async function saveImage(blob: Blob): Promise<string> {
  const key = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  await tx('readwrite', (s) => s.put(blob, key))
  return PREFIX + key
}

const urlCache = new Map<string, string>()

async function resolveRef(ref: string): Promise<string | null> {
  if (!ref.startsWith(PREFIX)) return ref
  const cached = urlCache.get(ref)
  if (cached) return cached
  const blob = await tx<Blob | undefined>('readonly', (s) => s.get(ref.slice(PREFIX.length)))
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(ref, url)
  return url
}

export function useImageSrc(ref: string | undefined): string | null {
  const immediate = ref && !ref.startsWith(PREFIX) ? ref : (ref && urlCache.get(ref)) || null
  const [src, setSrc] = useState<string | null>(immediate)
  useEffect(() => {
    if (!ref) return setSrc(null)
    let alive = true
    resolveRef(ref)
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null))
    return () => {
      alive = false
    }
  }, [ref])
  return src
}
