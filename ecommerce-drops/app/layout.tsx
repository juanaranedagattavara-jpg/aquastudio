import type { Metadata, Viewport } from 'next'
import { config } from '@/lib/config'
import './globals.css'

export const metadata: Metadata = {
  title: { default: `${config.brand.name} — ${config.brand.tagline}`, template: `%s · ${config.brand.name}` },
  description: 'Drops de prendas únicas. Cuando se vende, se fue.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
