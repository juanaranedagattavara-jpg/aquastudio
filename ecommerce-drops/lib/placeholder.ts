import type { CategoryId } from './types'

/**
 * Ilustraciones SVG tipo "flat lay" para los datos de demo.
 * En producción se reemplazan por las fotos reales que sube la marca.
 */

type View = 'front' | 'back' | 'detail'

interface Shape {
  /** Silueta principal: recibe sombra, textura y volumen. */
  body: string
  /** Se dibuja detrás del cuerpo (ej. capucha). */
  under?: string
  front: string
  back: string
  /** Zoom para la foto de detalle (x, y, ancho); el alto sale de la proporción 4:5. */
  detail: [number, number, number]
  texture: 'twill' | 'fleece' | 'jersey'
}

const shapes: Record<Exclude<CategoryId, 'otros'>, Shape> = {
  pantalones: {
    body: 'M134 68 L266 68 L286 444 L214 444 L200 178 L186 444 L114 444 Z',
    front: `
      <path d="M134 68 L266 68 L267 96 L133 96 Z" fill="D"/>
      <path d="M152 70v28M196 70v28M204 70v28M248 70v28" stroke="DD" stroke-width="5"/>
      <path d="M148 100 Q160 142 194 142 M252 100 Q240 142 206 142" fill="none" stroke="L" stroke-width="2.5"/>
      <path d="M228 108 h18 v14 h-18z" fill="none" stroke="L" stroke-width="2"/>
      <path d="M200 96 L200 176" stroke="L" stroke-width="2.5"/>
      <circle cx="200" cy="82" r="5" fill="L"/>
      <path d="M122 300 L132 444 M278 300 L268 444" stroke="L" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"/>
      <path d="M116 426 L184 426 M216 426 L284 426" stroke="DD" stroke-width="2" opacity=".6"/>`,
    back: `
      <path d="M134 68 L266 68 L267 96 L133 96 Z" fill="D"/>
      <path d="M152 70v28M200 70v28M248 70v28" stroke="DD" stroke-width="5"/>
      <path d="M146 122 L190 122 L188 172 L168 182 L148 172 Z M210 122 L254 122 L252 172 L232 182 L212 172 Z" fill="none" stroke="L" stroke-width="2.5"/>
      <rect x="222" y="100" width="26" height="12" rx="1" fill="#C9A66B"/>
      <path d="M200 96 L200 178" stroke="L" stroke-width="2.5"/>`,
    detail: [120, 56, 160],
    texture: 'twill',
  },
  polerones: {
    under: '<path d="M164 108 Q156 46 200 42 Q244 46 236 108 Q200 130 164 108 Z" fill="D"/>',
    body: 'M134 122 L166 106 L234 106 L266 122 L332 164 L348 384 L310 390 L296 216 L282 206 L282 424 L118 424 L118 206 L104 216 L90 390 L52 384 L68 164 Z',
    front: `
      <path d="M170 108 Q200 132 230 108" fill="none" stroke="DD" stroke-width="3"/>
      <path d="M150 318 L250 318 L266 388 L134 388 Z" fill="none" stroke="L" stroke-width="2.5"/>
      <path d="M188 118 L184 196 M212 118 L216 196" stroke="L" stroke-width="3" stroke-linecap="round"/>
      <rect x="118" y="404" width="164" height="20" fill="D"/>
      <rect x="52" y="372" width="40" height="18" fill="D" transform="rotate(4 72 380)"/>
      <rect x="308" y="372" width="40" height="18" fill="D" transform="rotate(-4 328 380)"/>
      <rect x="193" y="112" width="14" height="9" rx="1" fill="#EDE7DA"/>`,
    back: `
      <path d="M160 110 Q156 64 200 60 Q244 64 240 110 L240 152 Q200 170 160 152 Z" fill="D"/>
      <rect x="118" y="404" width="164" height="20" fill="D"/>
      <rect x="52" y="372" width="40" height="18" fill="D" transform="rotate(4 72 380)"/>
      <rect x="308" y="372" width="40" height="18" fill="D" transform="rotate(-4 328 380)"/>`,
    detail: [128, 40, 144],
    texture: 'fleece',
  },
  poleras: {
    body: 'M140 92 L172 78 Q200 104 228 78 L260 92 L334 132 L308 196 L272 180 L272 414 L128 414 L128 180 L92 196 L66 132 Z',
    front: `
      <path d="M172 78 Q200 110 228 78" fill="none" stroke="D" stroke-width="9"/>
      <rect x="193" y="88" width="14" height="8" rx="1" fill="#EDE7DA"/>
      <path d="M128 404 L272 404" stroke="DD" stroke-width="2" opacity=".6"/>`,
    back: `
      <path d="M172 78 Q200 92 228 78" fill="none" stroke="D" stroke-width="9"/>
      <path d="M128 404 L272 404" stroke="DD" stroke-width="2" opacity=".6"/>`,
    detail: [136, 64, 128],
    texture: 'jersey',
  },
}

const textures: Record<Shape['texture'], string> = {
  twill:
    '<pattern id="tx" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="5" height="5" fill="none"/><line x1="0" y1="0" x2="0" y2="5" stroke="#fff" stroke-opacity=".09" stroke-width="2"/></pattern>',
  fleece:
    '<pattern id="tx" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".9" fill="#fff" fill-opacity=".06"/><circle cx="4.5" cy="4.5" r=".9" fill="#000" fill-opacity=".06"/></pattern>',
  jersey:
    '<pattern id="tx" width="4" height="4" patternUnits="userSpaceOnUse"><line x1="0" y1="2" x2="4" y2="2" stroke="#fff" stroke-opacity=".05" stroke-width="1"/></pattern>',
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const r = clamp((n >> 16) + amount)
  const g = clamp(((n >> 8) & 0xff) + amount)
  const b = clamp((n & 0xff) + amount)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function printMarkup(text: string, color: string): string {
  const safe = text.replace(/[<>&"]/g, '')
  return `<g fill="${color}" font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle">
    <circle cx="200" cy="214" r="44" fill="none" stroke="${color}" stroke-width="4"/>
    <text x="200" y="208" font-size="${safe.length > 8 ? 12 : 15}" letter-spacing="1">${safe}</text>
    <text x="200" y="230" font-size="11" letter-spacing="3">EST. USA</text>
  </g>`
}

export interface GarmentOptions {
  view?: View
  /** Gira levemente la prenda para que no se vean todas iguales. */
  tilt?: number
  /** Estampado en el pecho (solo poleras / polerones). */
  print?: string
}

export function garmentImage(category: CategoryId, color: string, background: string, opts: GarmentOptions = {}): string {
  const { view = 'front', tilt = 0, print } = opts
  const shape = shapes[category === 'otros' ? 'poleras' : category]
  const isBack = view === 'back'
  const light = shade(color, 30)
  const paint = (markup: string) =>
    markup
      .replace(/fill="C"/g, `fill="${color}"`)
      .replace(/fill="DD"/g, `fill="${shade(color, -38)}"`)
      .replace(/stroke="DD"/g, `stroke="${shade(color, -38)}"`)
      .replace(/fill="D"/g, `fill="${shade(color, -20)}"`)
      .replace(/stroke="D"/g, `stroke="${shade(color, -20)}"`)
      .replace(/stroke="L"/g, `stroke="${light}"`)
      .replace(/fill="L"/g, `fill="${light}"`)

  const [dx, dy, dw] = view === 'detail' ? shape.detail : [0, 0, 400]
  const printColor = parseInt(color.slice(1, 3), 16) > 0xa0 ? shade(color, -70) : shade(color, 70)
  const chest = !isBack && print && category !== 'pantalones' ? printMarkup(print, printColor) : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${dx} ${dy} ${dw} ${dw * 1.25}">
  <defs>
    <radialGradient id="bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="${shade(background, 10)}"/><stop offset="1" stop-color="${shade(background, -8)}"/></radialGradient>
    <linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
    ${textures[shape.texture]}
  </defs>
  <rect x="-50" y="-50" width="500" height="600" fill="url(#bg)"/>
  <g transform="rotate(${tilt} 200 250)">
    <path d="${shape.body}" fill="#000" opacity=".22" filter="url(#blur)" transform="translate(7 12)"/>
    ${paint(shape.under ?? '')}
    <path d="${shape.body}" fill="${color}"/>
    ${paint(isBack ? shape.back : shape.front)}
    ${chest}
    <path d="${shape.body}" fill="url(#tx)"/>
    <path d="${shape.body}" fill="url(#sh)"/>
  </g>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`
}
