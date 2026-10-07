import Link from 'next/link'
import { StoreHeader } from '@/components/store/StoreHeader'
import { config } from '@/lib/config'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main>{children}</main>
      <footer className="mt-20 border-t border-ink/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xl font-black uppercase tracking-tightest">{config.brand.name}</p>
            <p className="mt-1 text-muted">{config.brand.tagline}</p>
          </div>
          <div className="space-y-1">
            <p className="eyebrow mb-2">Contacto</p>
            <a className="block hover:underline" href={`https://instagram.com/${config.brand.instagram}`}>
              Instagram @{config.brand.instagram}
            </a>
            <a className="block hover:underline" href={`https://wa.me/${config.brand.whatsapp}`}>
              WhatsApp
            </a>
          </div>
          <div className="space-y-1">
            <p className="eyebrow mb-2">Compras</p>
            <p className="text-muted">Envíos a todo Chile · Retiro en persona</p>
            <p className="text-muted">Pago con tarjeta o transferencia</p>
            <Link className="block hover:underline" href="/admin">
              Panel de la marca
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
