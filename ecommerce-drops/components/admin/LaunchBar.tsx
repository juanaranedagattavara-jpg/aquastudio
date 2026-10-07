'use client'

import { useState } from 'react'
import { categoryById, config } from '@/lib/config'
import { countdown, nextAt, toLocalInput, whenLabel } from '@/lib/format'
import { isReady, missingFields, productState, releaseStatus, setRelease } from '@/lib/store'
import type { CategoryId, Drop, Product } from '@/lib/types'

interface Props {
  drop: Drop
  category: CategoryId
  /** Prendas de esa categoría en este drop. */
  products: Product[]
  now: number
}

/**
 * Barra fija abajo. Él publica por categoría a las 20:00, así que la acción
 * siempre es sobre la categoría que está mirando.
 */
export function LaunchBar({ drop, category, products, now }: Props) {
  const [scheduling, setScheduling] = useState(false)
  const tonight = nextAt(config.releaseHour, now)
  const [when, setWhen] = useState(() => toLocalInput(drop.releases[category] ?? tonight))
  const cat = categoryById(category)
  const status = releaseStatus(drop, category, now)
  const at = drop.releases[category]
  const ready = products.filter(isReady).length
  const incomplete = products.filter((p) => missingFields(p).length > 0).length
  const sold = products.filter((p) => productState(p, now) === 'sold').length

  const warn = (verb: string) =>
    !incomplete || confirm(`${incomplete} prenda(s) de ${cat.label.toLowerCase()} están incompletas y no se van a mostrar.\n\n¿${verb} igual?`)

  const schedule = (ts: number) => {
    if (!ts || ts <= Date.now()) return alert('Elige una fecha y hora futura.')
    if (!warn('Programar')) return
    setRelease(drop.id, category, ts)
    setScheduling(false)
  }

  if (drop.closedAt) {
    return (
      <Bar>
        <p className="text-sm text-paper/60">Drop cerrado: no se ve en la tienda.</p>
      </Bar>
    )
  }

  if (scheduling) {
    const quick: [string, number][] = [
      [whenLabel(tonight, now), tonight],
      [whenLabel(tonight + 86_400_000, now), tonight + 86_400_000],
      [whenLabel(tonight + 2 * 86_400_000, now), tonight + 2 * 86_400_000],
    ]
    return (
      <Bar>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-paper/60">¿Cuándo salen los {cat.label.toLowerCase()}?</p>
        <div className="flex flex-wrap items-center gap-2">
          {quick.map(([label, ts]) => (
            <button key={ts} type="button" className="btn-accent btn-sm" onClick={() => schedule(ts)}>
              {label}
            </button>
          ))}
          <input
            aria-label="Otra fecha y hora"
            type="datetime-local"
            className="input min-h-[36px] w-auto flex-1 border-white/20 bg-white/10 text-paper [color-scheme:dark]"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <button type="button" className="btn-ghost btn-sm border-white/20 bg-transparent text-paper" onClick={() => schedule(new Date(when).getTime())}>
            Usar esa
          </button>
          <button type="button" className="btn btn-sm text-paper/60" onClick={() => setScheduling(false)}>
            Cancelar
          </button>
        </div>
      </Bar>
    )
  }

  return (
    <Bar>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-paper/50">{cat.label}</p>
          {status === 'draft' && (
            <p>
              <strong>{ready} listas</strong>
              {incomplete > 0 && <span className="text-paper/60"> · {incomplete} incompletas</span>}
            </p>
          )}
          {status === 'scheduled' && at && (
            <p>
              Sale {whenLabel(at, now)} · <span className="font-mono text-accent">{countdown(at - now)}</span>
            </p>
          )}
          {status === 'live' && (
            <p>
              <strong>Publicada</strong> · {sold}/{ready} vendidas
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {status !== 'live' && (
            <>
              <button
                type="button"
                className="btn-ghost btn-sm border-white/20 bg-transparent text-paper"
                onClick={() => setScheduling(true)}
                disabled={!ready}
              >
                {status === 'scheduled' ? 'Cambiar hora' : `Programar ${config.releaseHour}:00`}
              </button>
              <button
                type="button"
                className="btn-accent btn-sm"
                disabled={!ready}
                onClick={() => warn('Publicar') && setRelease(drop.id, category, Date.now())}
              >
                Publicar ahora
              </button>
            </>
          )}
          {status === 'scheduled' && (
            <button type="button" className="btn btn-sm text-paper/60" onClick={() => setRelease(drop.id, category, null)}>
              Cancelar
            </button>
          )}
          {status === 'live' && (
            <button
              type="button"
              className="btn-ghost btn-sm border-white/20 bg-transparent text-paper"
              onClick={() =>
                confirm(`¿Despublicar ${cat.label.toLowerCase()}? Dejan de verse en la tienda.`) && setRelease(drop.id, category, null)
              }
            >
              Despublicar
            </button>
          )}
        </div>
      </div>
    </Bar>
  )
}

function Bar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-4 pb-safe pt-3">{children}</div>
    </div>
  )
}
