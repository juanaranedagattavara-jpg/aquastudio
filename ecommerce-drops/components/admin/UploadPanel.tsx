'use client'

import { useEffect, useRef, useState } from 'react'
import { categoryById } from '@/lib/config'
import { compressImage, saveImage } from '@/lib/images'
import { addProducts } from '@/lib/store'
import type { CategoryId } from '@/lib/types'

const PREFS_KEY = 'drops-proto:upload-prefs'

interface Props {
  dropId: string
  category: CategoryId
  onUploaded: (count: number) => void
}

/**
 * Carga por lotes, pensada para cómo trabaja la marca: un día sube todos los
 * pantalones, otro día los polerones. Elige la categoría, selecciona todas las
 * fotos de una vez y se crea una prenda por cada N fotos (en el orden elegido).
 */
export function UploadPanel({ dropId, category, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [perProduct, setPerProduct] = useState(2)
  const [price, setPrice] = useState('')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [failed, setFailed] = useState(0)
  const cat = categoryById(category)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
      if (saved.perProduct) setPerProduct(saved.perProduct)
    } catch {
      /* sin preferencias */
    }
  }, [])

  const choosePerProduct = (n: number) => {
    setPerProduct(n)
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ perProduct: n }))
    } catch {
      /* no crítico */
    }
  }

  const handleFiles = async (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (!files.length) return
    setFailed(0)
    setProgress({ done: 0, total: files.length })
    const refs: string[] = []
    let errors = 0
    // De a una para no reventar la memoria del teléfono con 40 fotos.
    for (const file of files) {
      try {
        refs.push(await saveImage(await compressImage(file)))
      } catch {
        errors++
      }
      setProgress({ done: refs.length + errors, total: files.length })
    }
    const groups: string[][] = []
    for (let i = 0; i < refs.length; i += perProduct) groups.push(refs.slice(i, i + perProduct))
    const parsedPrice = Number(price.replace(/\D/g, '')) || null
    if (groups.length) addProducts(dropId, category, groups, parsedPrice)
    setFailed(errors)
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
    onUploaded(groups.length)
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-black uppercase tracking-tight">Subir {cat.label.toLowerCase()}</h3>
        <p className="text-xs text-muted">Se crean como borrador. Nada es público hasta que lances el drop.</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Fotos por prenda</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Fotos por prenda">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={perProduct === n}
                onClick={() => choosePerProduct(n)}
                className={`chip min-h-[44px] w-12 justify-center text-sm ${perProduct === n ? 'chip-active' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Ej: si sacas frente y espalda, elige 2. Selecciónalas en ese orden.
          </p>
        </div>
        <div>
          <label htmlFor="base-price" className="label">
            Precio para todo el lote (opcional)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              id="base-price"
              className="input pl-7"
              inputMode="numeric"
              placeholder="24990"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">Después puedes cambiar el de cada una.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        id="upload-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <label
        htmlFor="upload-input"
        className={`mt-5 flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 bg-paper px-4 text-center transition hover:border-ink ${
          progress ? 'pointer-events-none opacity-70' : ''
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        {progress ? (
          <>
            <span className="font-semibold">
              Optimizando fotos {progress.done}/{progress.total}…
            </span>
            <span className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-ink/10">
              <span className="block h-full bg-ink transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </span>
          </>
        ) : (
          <>
            <span className="text-base font-black uppercase tracking-tight">Seleccionar fotos</span>
            <span className="mt-1 text-xs text-muted">Desde la galería del teléfono o arrastrándolas aquí</span>
          </>
        )}
      </label>
      {failed > 0 && (
        <p role="alert" className="mt-2 text-xs font-semibold text-alert">
          {failed} foto(s) no se pudieron leer (¿formato HEIC/RAW?). Prueba exportarlas como JPG.
        </p>
      )}
    </div>
  )
}
