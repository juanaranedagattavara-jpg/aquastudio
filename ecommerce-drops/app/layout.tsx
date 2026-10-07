import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import { config } from '@/lib/config'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const description = `${config.brand.tagline} Drops mensuales: una categoría nueva cada noche a las ${config.releaseHour}:00. Despachos todos los martes.`

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3100'),
  title: { default: `${config.brand.name} — Ropa americana por drops`, template: `%s · ${config.brand.name}` },
  description,
  openGraph: { title: `${config.brand.name} — Ropa americana por drops`, description, locale: 'es_CL', type: 'website' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={archivo.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
