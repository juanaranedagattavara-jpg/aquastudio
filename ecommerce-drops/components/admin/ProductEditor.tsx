'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ProductImage } from '@/components/ProductImage'
import { categoryById, conditions, sizes } from '@/lib/config'
import { clp } from '@/lib/format'
import { compressImage, saveImage } from '@/lib/images'
import {
  deleteProduct,
  hasMeasurements,
  missingFields,
  moveImage,
  productState,
  splitImage,
  updateProduct,
} from '@/lib/store'
import type { Condition, Product } from '@/lib/types'

interface Props {
  product: Product
  /** Prenda anterior en la lista, para corregir fotos mal agrupadas. */
  prev?: Product
  suggestedPrices: number[]
  now: number
}

const toNumber = (v: string) => {
  const n = Number(v.replace(/[^\d]/g, ''))
  return n > 0 ? n : undefined
}

/**
 * Edición rápida de una prenda. Los campos guardan al salir (blur) para no
 * escribir en cada tecla; el `key` con el valor actual los resincroniza si
 * cambian desde afuera (ej. "aplicar precio a todas").
 */
export function ProductEditor({ product: p, prev, suggestedPrices, now }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showNotes, setShowNotes] = useState(Boolean(p.notes))
  const cat = categoryById(p.category)
  const missing = missingFields(p)
  const state = productState(p, now)
  const sizeOptions = p.size && !sizes.includes(p.size) ? [...sizes, p.size] : sizes

  const addPhotos = async (files: FileList | null) => {
    const refs: string[] = []
    for (const f of Array.from(files ?? [])) {
      try {
        refs.push(await saveImage(await compressImage(f)))
      } catch {
        /* se ignora la foto ilegible */
      }
    }
    if (refs.length) updateProduct(p.id, { images: [...p.images, ...refs] })
  }

  const imageAction = (action: 'cover' | 'prev' | 'split' | 'delete') => {
    if (selected == null) return
    if (action === 'cover') {
      const images = [...p.images]
      const [img] = images.splice(selected, 1)
      updateProduct(p.id, { images: [img, ...images] })
    }
    if (action === 'prev' && prev) moveImage(p.id, selected, prev.id)
    if (action === 'split') splitImage(p.id, selected)
    if (action === 'delete') updateProduct(p.id, { images: p.images.filter((_, i) => i !== selected) })
    setSelected(null)
  }

  return (
    <article
      id={`prod-${p.id}`}
      className={`card min-w-0 scroll-mt-24 p-3 sm:p-4 ${missing.length ? 'border-alert/40' : ''} ${p.hidden ? 'opacity-60' : ''}`}
    >
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {p.images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => setSelected(selected === i ? null : i)}
            className={`relative w-[72px] shrink-0 overflow-hidden rounded-lg ring-offset-2 ${selected === i ? 'ring-2 ring-ink' : ''}`}
            aria-label={`Foto ${i + 1}${i === 0 ? ' (portada)' : ''}`}
            aria-pressed={selected === i}
          >
            <ProductImage src={img} alt="" className="aspect-[4/5] w-full" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-ink px-1 text-[9px] font-bold uppercase text-paper">Portada</span>
            )}
          </button>
        ))}
        <label className="flex aspect-[4/5] w-[72px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink/20 text-xs font-semibold text-muted hover:border-ink">
          <span className="text-xl leading-none">+</span>
          foto
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
        </label>
      </div>

      {selected != null && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl bg-paper p-2">
          {selected > 0 && (
            <button type="button" className="chip" onClick={() => imageAction('cover')}>
              Usar de portada
            </button>
          )}
          {prev && (
            <button type="button" className="chip" onClick={() => imageAction('prev')}>
              ← Pasar a la prenda anterior
            </button>
          )}
          {p.images.length > 1 && (
            <button type="button" className="chip" onClick={() => imageAction('split')}>
              Separar como prenda nueva
            </button>
          )}
          <button type="button" className="chip text-alert" onClick={() => imageAction('delete')}>
            Eliminar foto
          </button>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[140px_1fr_160px]">
        <div>
          <label className="label" htmlFor={`b-${p.id}`}>
            Marca
          </label>
          <input
            key={`b-${p.brand}`}
            id={`b-${p.id}`}
            className="input"
            list="brand-options"
            placeholder="Levi's…"
            autoCapitalize="words"
            defaultValue={p.brand}
            onBlur={(e) => e.target.value.trim() !== p.brand && updateProduct(p.id, { brand: e.target.value.trim() })}
          />
        </div>
        <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
          <label className="label" htmlFor={`t-${p.id}`}>
            Nombre
          </label>
          <input
            key={`t-${p.title}`}
            id={`t-${p.id}`}
            className="input font-semibold"
            defaultValue={p.title}
            onBlur={(e) => e.target.value !== p.title && updateProduct(p.id, { title: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor={`pr-${p.id}`}>
            Precio
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              key={`pr-${p.price}`}
              id={`pr-${p.id}`}
              className={`input pl-7 ${missing.includes('precio') ? 'border-alert' : ''}`}
              inputMode="numeric"
              placeholder="24990"
              defaultValue={p.price ?? ''}
              onBlur={(e) => {
                const price = toNumber(e.target.value) ?? null
                if (price !== p.price) updateProduct(p.id, { price })
              }}
            />
          </div>
          {!p.price && suggestedPrices.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {suggestedPrices.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  className="rounded-full bg-bone px-2 py-1 text-[11px] font-semibold hover:bg-ink hover:text-paper"
                  onClick={() => updateProduct(p.id, { price: sp })}
                >
                  {clp(sp)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <span className={`label ${missing.includes('talla') ? 'text-alert' : ''}`}>Talla</span>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {sizeOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateProduct(p.id, { size: s })}
              className={`chip min-h-[40px] min-w-[44px] justify-center ${p.size === s ? 'chip-active' : ''}`}
              aria-pressed={p.size === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(['ancho', 'largo'] as const).map((k) => (
          <div key={k}>
            <label className="label" htmlFor={`${k}-${p.id}`}>
              {cat.measures[k]} cm
            </label>
            <input
              key={`${k}-${p.measurements[k]}`}
              id={`${k}-${p.id}`}
              className="input"
              inputMode="numeric"
              defaultValue={p.measurements[k] ?? ''}
              onBlur={(e) => {
                const value = toNumber(e.target.value)
                if (value !== p.measurements[k]) updateProduct(p.id, { measurements: { ...p.measurements, [k]: value } })
              }}
            />
          </div>
        ))}
        <div className="col-span-2 sm:col-span-1">
          <label className="label" htmlFor={`c-${p.id}`}>
            Estado
          </label>
          <select
            id={`c-${p.id}`}
            className="input px-2"
            value={p.condition}
            onChange={(e) => updateProduct(p.id, { condition: e.target.value as Condition })}
          >
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showNotes ? (
        <div className="mt-3">
          <label className="label" htmlFor={`n-${p.id}`}>
            Notas (detalles, defectos, historia)
          </label>
          <textarea
            key={`n-${p.notes}`}
            id={`n-${p.id}`}
            rows={2}
            className="input py-2"
            defaultValue={p.notes}
            onBlur={(e) => e.target.value !== p.notes && updateProduct(p.id, { notes: e.target.value })}
          />
        </div>
      ) : (
        <button type="button" onClick={() => setShowNotes(true)} className="mt-2 min-h-[36px] text-xs font-semibold text-muted hover:text-ink">
          + Agregar notas
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3 text-xs">
        {state === 'sold' ? (
          <span className="font-semibold">Vendida</span>
        ) : missing.length ? (
          <span className="font-semibold text-alert">Falta: {missing.join(', ')}</span>
        ) : (
          <span className="font-semibold text-ok">
            ✓ Lista{!hasMeasurements(p) && <span className="font-normal text-muted"> · sin medidas (recomendado)</span>}
          </span>
        )}
        <div className="ml-auto flex gap-1">
          <Link href={`/p/${p.id}?preview=1`} target="_blank" className="btn-ghost btn-sm">
            Ver
          </Link>
          <button type="button" className="btn-ghost btn-sm" onClick={() => updateProduct(p.id, { hidden: !p.hidden })}>
            {p.hidden ? 'Mostrar' : 'Ocultar'}
          </button>
          {state !== 'sold' && (
            <button
              type="button"
              className="btn-ghost btn-sm text-alert"
              onClick={() => confirm(`¿Eliminar "${p.title}"?`) && deleteProduct(p.id)}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
