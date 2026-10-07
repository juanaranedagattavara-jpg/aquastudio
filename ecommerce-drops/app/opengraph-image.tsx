import { ImageResponse } from 'next/og'
import { config } from '@/lib/config'
import { loadDisplayFont } from '@/lib/og-font'

export const alt = `${config.brand.name} — Ropa americana por drops`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const fonts = await loadDisplayFont()
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F4F2EE',
          color: '#0B0B0B',
          fontFamily: fonts.length ? 'Archivo Black' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '56px 64px 0', fontSize: 26, letterSpacing: 4 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: '#E5484D' }} />
          DROPS MENSUALES · PRENDAS ÚNICAS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 64px' }}>
          <div style={{ fontSize: 200, lineHeight: 0.9, letterSpacing: -8 }}>{config.brand.name}</div>
          <div style={{ fontSize: 44, marginTop: 18, color: '#6B6862' }}>Ropa americana seleccionada</div>
        </div>
        <div
          style={{
            display: 'flex',
            background: '#D7FF3A',
            padding: '26px 64px',
            fontSize: 30,
            letterSpacing: 3,
          }}
        >
          {`CADA NOCHE ${config.releaseHour}:00 · UNA DE CADA UNA · DESPACHOS LOS MARTES`}
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
