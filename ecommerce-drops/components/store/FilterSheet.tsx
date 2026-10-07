'use client'

import { Sheet } from '@/components/Sheet'
import { sizes as sizeOrder } from '@/lib/config'
import { productState } from '@/lib/store'
import type { Product } from '@/lib/types'

export type Sort = 'nuevo' | 'precio-asc' | 'precio-desc'

export interface Filters {
  sizes: string[]
  brands: string[]
  sort: Sort
  hideSold: boolean
}

export const defaultFilters: Filters = { sizes: [], brands: [], sort: 'nuevo', hideSold: false }

export function activeFilterCount(f: Filters): number {
  return f.sizes.length + f.brands.length + (f.hideSold ? 1 : 0) + (f.sort !== 'nuevo' ? 1 : 0)
}

/** "Recién publicadas": la categoría que salió anoche arriba y las vendidas al final. */
export function applyFilters(list: Product[], f: Filters, now: number, releasedAt: (p: Product) => number): Product[] {
  const out = list.filter(
    (p) =>
      (!f.sizes.length || f.sizes.includes(p.size)) &&
      (!f.brands.length || f.brands.includes(p.brand)) &&
      (!f.hideSold || productState(p, now) !== 'sold')
  )
  const price = (p: Product) => p.price ?? 0
  if (f.sort === 'precio-asc') return out.sort((a, b) => price(a) - price(b))
  if (f.sort === 'precio-desc') return out.sort((a, b) => price(b) - price(a))
  const soldLast = (p: Product) => (productState(p, now) === 'sold' ? 1 : 0)
  return out.sort((a, b) => soldLast(a) - soldLast(b) || releasedAt(b) - releasedAt(a) || a.createdAt - b.createdAt)
}

const order = (s: string) => (sizeOrder.includes(s) ? sizeOrder.indexOf(s) : sizeOrder.length)

interface Props {
  open: boolean
  onClose: () => void
  products: Product[]
  filters: Filters
  onChange: (f: Filters) => void
  resultCount: number
}

export function FilterSheet({ open, onClose, products, filters, onChange, resultCount }: Props) {
  const sizes = Array.from(new Set(products.map((p) => p.size))).sort((a, b) => order(a) - order(b))
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort()
  const toggle = (key: 'sizes' | 'brands', value: string) =>
    onChange({
      ...filters,
      [key]: filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value],
    })

  const sorts: [Sort, string][] = [
    ['nuevo', 'Recién publicadas'],
    ['precio-asc', 'Menor precio'],
    ['precio-desc', 'Mayor precio'],
  ]

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtrar"
      footer={
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={() => onChange(defaultFilters)}>
            Limpiar
          </button>
          <button type="button" className="btn-primary flex-[2]" onClick={onClose}>
            Ver {resultCount} prendas
          </button>
        </div>
      }
    >
      <div className="space-y-7">
        <Group title="Ordenar">
          {sorts.map(([id, label]) => (
            <Option key={id} active={filters.sort === id} onClick={() => onChange({ ...filters, sort: id })}>
              {label}
            </Option>
          ))}
        </Group>
        <Group title="Talla">
          {sizes.map((s) => (
            <Option key={s} active={filters.sizes.includes(s)} onClick={() => toggle('sizes', s)}>
              {s}
            </Option>
          ))}
        </Group>
        {brands.length > 0 && (
          <Group title="Marca">
            {brands.map((b) => (
              <Option key={b} active={filters.brands.includes(b)} onClick={() => toggle('brands', b)}>
                {b}
              </Option>
            ))}
          </Group>
        )}
        <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white px-4 text-sm font-semibold">
          Ocultar vendidas
          <input
            type="checkbox"
            className="h-5 w-5 accent-ink"
            checked={filters.hideSold}
            onChange={(e) => onChange({ ...filters, hideSold: e.target.checked })}
          />
        </label>
      </div>
    </Sheet>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="label mb-2">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`chip min-h-[40px] ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  )
}
