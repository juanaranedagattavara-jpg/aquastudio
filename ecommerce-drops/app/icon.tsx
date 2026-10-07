import { ImageResponse } from 'next/og'
import { config } from '@/lib/config'
import { loadDisplayFont } from '@/lib/og-font'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icon() {
  const fonts = await loadDisplayFont()
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0B',
          color: '#D7FF3A',
          fontSize: 44,
          borderRadius: 14,
          fontFamily: fonts.length ? 'Archivo Black' : 'sans-serif',
        }}
      >
        {config.brand.name.charAt(0)}
      </div>
    ),
    { ...size, fonts }
  )
}
