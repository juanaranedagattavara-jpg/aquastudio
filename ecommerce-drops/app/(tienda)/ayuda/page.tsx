import type { Metadata } from 'next'
import Link from 'next/link'
import { config, delivery } from '@/lib/config'
import { clp } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Cómo comprar',
  description: 'Drops, reservas, pagos, despachos los martes y medidas.',
}

const faqs: [string, React.ReactNode][] = [
  [
    '¿Cómo funcionan los drops?',
    <>
      Cada mes sale un drop nuevo y se publica por partes: una categoría por noche a las {config.releaseHour}:00 (por ejemplo
      pantalones el lunes, polerones el miércoles, poleras el viernes). El calendario está en la portada. Si nos dejas tu
      WhatsApp te avisamos antes de cada publicación.
    </>,
  ],
  [
    '¿Por qué la prenda queda reservada 10 minutos?',
    <>
      Cada prenda es única. Cuando la agregas al carrito queda apartada solo para ti por {config.reservationMinutes} minutos
      para que nadie te la quite mientras pagas. Si no completas la compra, vuelve al drop.
    </>,
  ],
  [
    '¿Cómo pago?',
    <>
      Con tarjeta de débito o crédito (se confirma al instante) o por transferencia. Con transferencia la prenda queda guardada{' '}
      {config.transferHoldHours} horas mientras nos envías el comprobante.
    </>,
  ],
  [
    '¿Cuándo despachan?',
    <>
      Todos los martes. Lo que se paga hasta el lunes sale ese martes.
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {delivery.map((d) => (
          <li key={d.id}>
            {d.label}: {d.detail} ({d.cost ? clp(d.cost) : 'gratis'}).
          </li>
        ))}
      </ul>
    </>,
  ],
  [
    '¿La ropa es nueva?',
    <>
      Es ropa americana seleccionada: prendas de marca, vintage y usadas, revisadas una por una. Cada ficha dice el estado y,
      si tiene algún detalle, lo contamos en las notas y se ve en las fotos.
    </>,
  ],
  [
    '¿Cómo sé si me queda?',
    <>
      Más que la talla de la etiqueta, mira las medidas: las tomamos con la prenda estirada en plano. En poleras y polerones,
      el ancho es de axila a axila; en pantalones, la cintura de lado a lado. Mide una prenda tuya que te quede bien y compara.
    </>,
  ],
  [
    '¿Tienen cambios?',
    <>
      Por ser prendas únicas y usadas no hacemos cambios por talla, por eso publicamos las medidas. Si la prenda llega con un
      detalle que no informamos, escríbenos dentro de 10 días y lo solucionamos.
    </>,
  ],
  [
    '¿Qué pasa con lo que no se vende?',
    <>Queda en &ldquo;Últimas piezas&rdquo; con descuento hasta que llega el drop siguiente.</>,
  ],
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <p className="eyebrow">Ayuda</p>
      <h1 className="display mt-2 text-7xl">Cómo comprar</h1>
      <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {faqs.map(([q, a], i) => (
          <details key={q} className="group py-1" open={i === 0}>
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
              {q}
              <span className="text-xl leading-none transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <div className="pb-5 text-[15px] leading-relaxed text-muted">{a}</div>
          </details>
        ))}
      </div>
      <div className="mt-10 rounded-3xl bg-ink p-6 text-paper">
        <p className="display text-3xl">¿Otra duda?</p>
        <p className="mt-2 text-sm text-paper/70">Escríbenos por WhatsApp o Instagram @{config.brand.instagram}.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`https://wa.me/${config.brand.whatsapp}`} className="btn-accent">
            WhatsApp
          </a>
          <Link href="/" className="btn text-paper/80 hover:text-paper">
            Volver al drop
          </Link>
        </div>
      </div>
    </div>
  )
}
