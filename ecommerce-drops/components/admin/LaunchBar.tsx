'use client'

import { useState } from 'react'
import { countdown, dateTime, toLocalInput } from '@/lib/format'
import { dropStatus, isPublic, missingFields, productState, setDropStatus } from '@/lib/store'
import type { Drop, Product } from '@/lib/types'

interface Props {
  drop: Drop
  products: Product[]
  now: number
  otherLive?: Drop
}

function defaultLaunch(now: number): number {
  const d = new Date(now + 24 * 3600_000)
  d.setHours(20, 0, 0, 0)
  return d.getTime()
}

/** Barra fija abajo: el estado del drop y la acción que corresponde. */
export function LaunchBar({ drop, products, now, otherLive }: Props) {
  const [scheduling, setScheduling] = useState(false)
  const [when, setWhen] = useState(() => toLocalInput(drop.launchAt ?? defaultLaunch(now)))
  const status = dropStatus(drop, now)
  const ready = products.filter(isPublic).length
  const incomplete = products.filter((p) => missingFields(p).length > 0).length
  const sold = products.filter((p) => productState(p, now) === 'sold').length

  const confirmPublish = (verb: string) => {
    const notes = [
      incomplete > 0 && `${incomplete} prenda(s) incompletas no se van a mostrar.`,
      otherLive && `El Drop ${otherLive.number} sigue en vivo: lo que no se vendió quedará en "Últimas piezas".`,
    ].filter(Boolean)
    return !notes.length || confirm(`${notes.join('\n')}\n\n¿${verb} igual?`)
  }

  const schedule = () => {
    const ts = new Date(when).getTime()
    if (!ts || ts <= Date.now()) return alert('Elige una fecha y hora futura.')
    if (!confirmPublish('Programar')) return
    setDropStatus(drop.id, 'scheduled', ts)
    setScheduling(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-4 pb-safe pt-3">
        {scheduling ? (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="launch-at" className="label text-paper/60">
                Fecha y hora de lanzamiento
              </label>
              <input
                id="launch-at"
                type="datetime-local"
                className="input border-white/20 bg-white/10 text-paper [color-scheme:dark]"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <button type="button" className="btn-accent" onClick={schedule}>
              Confirmar
            </button>
            <button type="button" className="btn text-paper/70" onClick={() => setScheduling(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1 text-sm">
              {status === 'draft' && (
                <p>
                  <strong>{ready} listas</strong>
                  {incomplete > 0 && <span className="text-paper/60"> · {incomplete} incompletas</span>}
                </p>
              )}
              {status === 'scheduled' && drop.launchAt && (
                <p>
                  Sale {dateTime(drop.launchAt)} · <span className="font-mono text-accent">{countdown(drop.launchAt - now)}</span>
                </p>
              )}
              {status === 'live' && (
                <p>
                  <strong>En vivo</strong> · {sold}/{ready} vendidas
                </p>
              )}
              {status === 'closed' && <p className="text-paper/60">Drop cerrado · {sold} vendidas</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {(status === 'draft' || status === 'scheduled') && (
                <>
                  <button type="button" className="btn-ghost btn-sm border-white/20 bg-transparent text-paper" onClick={() => setScheduling(true)} disabled={!ready}>
                    {status === 'scheduled' ? 'Cambiar hora' : 'Programar'}
                  </button>
                  <button
                    type="button"
                    className="btn-accent btn-sm"
                    disabled={!ready}
                    onClick={() => confirmPublish('Publicar') && setDropStatus(drop.id, 'live')}
                  >
                    Publicar ahora
                  </button>
                </>
              )}
              {status === 'scheduled' && (
                <button type="button" className="btn btn-sm text-paper/60" onClick={() => setDropStatus(drop.id, 'draft')}>
                  Volver a borrador
                </button>
              )}
              {status === 'live' && (
                <button
                  type="button"
                  className="btn-ghost btn-sm border-white/20 bg-transparent text-paper"
                  onClick={() => confirm('¿Cerrar el drop? Las prendas sin vender dejan de verse en la tienda.') && setDropStatus(drop.id, 'closed')}
                >
                  Cerrar drop
                </button>
              )}
              {status === 'closed' && (
                <button type="button" className="btn-ghost btn-sm border-white/20 bg-transparent text-paper" onClick={() => setDropStatus(drop.id, 'live')}>
                  Reabrir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
