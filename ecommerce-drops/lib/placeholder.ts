import type { CategoryId } from './types'

/**
 * Ilustraciones SVG de prendas para los datos de demo.
 * En producción se reemplazan por las fotos reales que sube la marca.
 */

const shapes: Record<Exclude<CategoryId, 'otros'>, { front: string; back: string }> = {
  pantalones: {
    front: `
      <path d="M135 70 L265 70 L284 440 L214 440 L200 175 L186 440 L116 440 Z" fill="C"/>
      <path d="M135 70 L265 70 L266 96 L134 96 Z" fill="D"/>
      <path d="M150 100 Q160 140 196 140 M250 100 Q240 140 204 140" fill="none" stroke="L" stroke-width="3"/>
      <path d="M200 96 L200 172" stroke="L" stroke-width="3"/>
      <rect x="195" y="78" width="10" height="12" rx="2" fill="L"/>`,
    back: `
      <path d="M135 70 L265 70 L284 440 L214 440 L200 175 L186 440 L116 440 Z" fill="C"/>
      <path d="M135 70 L265 70 L266 96 L134 96 Z" fill="D"/>
      <path d="M148 120 L190 120 L188 168 L168 176 L150 168 Z M210 120 L252 120 L250 168 L232 176 L212 168 Z" fill="none" stroke="L" stroke-width="3"/>
      <rect x="220" y="100" width="22" height="9" fill="L"/>`,
  },
  polerones: {
    front: `
      <path d="M135 122 L165 106 L235 106 L265 122 L330 162 L346 382 L310 388 L295 214 L281 204 L281 422 L119 422 L119 204 L105 214 L90 388 L54 382 L70 162 Z" fill="C"/>
      <path d="M165 106 Q158 48 200 44 Q242 48 235 106 Q200 128 165 106 Z" fill="D"/>
      <path d="M150 318 L250 318 L266 386 L134 386 Z" fill="none" stroke="L" stroke-width="3"/>
      <path d="M188 118 L184 190 M212 118 L216 190" stroke="L" stroke-width="3" stroke-linecap="round"/>
      <rect x="119" y="404" width="162" height="18" fill="D"/>`,
    back: `
      <path d="M135 122 L165 106 L235 106 L265 122 L330 162 L346 382 L310 388 L295 214 L281 204 L281 422 L119 422 L119 204 L105 214 L90 388 L54 382 L70 162 Z" fill="C"/>
      <path d="M160 108 Q156 62 200 58 Q244 62 240 108 L240 150 Q200 168 160 150 Z" fill="D"/>
      <rect x="119" y="404" width="162" height="18" fill="D"/>`,
  },
  poleras: {
    front: `
      <path d="M140 92 L172 78 Q200 104 228 78 L260 92 L332 132 L306 194 L272 178 L272 412 L128 412 L128 178 L94 194 L68 132 Z" fill="C"/>
      <path d="M172 78 Q200 110 228 78" fill="none" stroke="D" stroke-width="8"/>
      <rect x="164" y="190" width="72" height="56" rx="4" fill="none" stroke="L" stroke-width="3"/>`,
    back: `
      <path d="M140 92 L172 78 Q200 92 228 78 L260 92 L332 132 L306 194 L272 178 L272 412 L128 412 L128 178 L94 194 L68 132 Z" fill="C"/>
      <path d="M172 78 Q200 92 228 78" fill="none" stroke="D" stroke-width="8"/>`,
  },
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const r = clamp((n >> 16) + amount)
  const g = clamp(((n >> 8) & 0xff) + amount)
  const b = clamp((n & 0xff) + amount)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

export function garmentImage(
  category: CategoryId,
  color: string,
  background: string,
  side: 'front' | 'back' = 'front'
): string {
  const key = category === 'otros' ? 'poleras' : category
  const body = shapes[key][side]
    .replace(/fill="C"/g, `fill="${color}"`)
    .replace(/fill="D"/g, `fill="${shade(color, -22)}"`)
    .replace(/stroke="D"/g, `stroke="${shade(color, -22)}"`)
    .replace(/stroke="L"/g, `stroke="${shade(color, 28)}"`)
    .replace(/fill="L"/g, `fill="${shade(color, 28)}"`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="${background}"/><ellipse cx="200" cy="470" rx="130" ry="10" fill="${shade(background, -18)}"/>${body}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`
}
