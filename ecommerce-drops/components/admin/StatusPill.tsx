import type { DropStatus } from '@/lib/types'
import type { OrderView } from '@/lib/store'

const dropStyles: Record<DropStatus, [string, string]> = {
  draft: ['Borrador', 'bg-bone text-ink'],
  scheduled: ['Programado', 'bg-accent text-ink'],
  live: ['En vivo', 'bg-alert text-white'],
  closed: ['Cerrado', 'bg-ink/10 text-muted'],
}

const orderStyles: Record<OrderView, [string, string]> = {
  pending: ['Por confirmar pago', 'bg-accent text-ink'],
  expired: ['Reserva expirada', 'bg-alert/15 text-alert'],
  paid: ['Pagado · por enviar', 'bg-ink text-paper'],
  shipped: ['Enviado', 'bg-ok/15 text-ok'],
  cancelled: ['Cancelado', 'bg-ink/10 text-muted'],
}

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  )
}

export function DropStatusPill({ status }: { status: DropStatus }) {
  const [label, className] = dropStyles[status]
  return <Pill label={label} className={className} />
}

export function OrderStatusPill({ status }: { status: OrderView }) {
  const [label, className] = orderStyles[status]
  return <Pill label={label} className={className} />
}
