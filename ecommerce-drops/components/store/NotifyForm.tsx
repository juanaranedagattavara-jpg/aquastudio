'use client'

import { useState } from 'react'
import { addSubscriber } from '@/lib/store'

interface Props {
  dropId?: string
  dark?: boolean
}

export function NotifyForm({ dropId, dark = false }: Props) {
  const [value, setValue] = useState('')
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <p role="status" className={`text-sm font-semibold ${dark ? 'text-accent' : 'text-ok'}`}>
        Listo. Te avisamos 15 minutos antes de que salga.
      </p>
    )
  }

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        addSubscriber(value, dropId)
        setDone(true)
      }}
    >
      <label htmlFor="notify" className="sr-only">
        WhatsApp o email
      </label>
      <input
        id="notify"
        className={`input flex-1 rounded-full px-4 ${dark ? 'border-white/20 bg-white/10 text-paper placeholder:text-paper/40' : ''}`}
        placeholder="WhatsApp o email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="email"
      />
      <button type="submit" className={dark ? 'btn-accent' : 'btn-primary'}>
        Avísame
      </button>
    </form>
  )
}
