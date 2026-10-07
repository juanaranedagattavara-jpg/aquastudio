import { config } from './config'
import { nextAt, nextWeekday } from './format'
import { garmentImage } from './placeholder'
import type { CategoryId, Condition, DbState, Drop, Order, Product, Subscriber } from './types'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

type Row = [
  title: string,
  brand: string,
  color: string,
  size: string,
  ancho: number | undefined,
  largo: number | undefined,
  condition: Condition,
  price: number | null,
  notes?: string,
  print?: string,
]

const PREFIX: Record<CategoryId, string> = { pantalones: 'pa', polerones: 'pn', poleras: 'pl', otros: 'ot' }

const BG = ['#E6E1D8', '#DCD6CB', '#E9E5DE', '#D9D2C5', '#E2DDD3']

function makeProducts(dropId: string, category: CategoryId, rows: Row[], createdAt: number): Product[] {
  return rows.map(([title, brand, color, size, ancho, largo, condition, price, notes, print], i) => {
    const isLight = parseInt(color.slice(1, 3), 16) > 0xd0
    const bg = isLight ? '#BDB4A5' : BG[(i + title.length) % BG.length]
    const tilt = ((i * 7 + title.length) % 9) - 4
    return {
      id: `${dropId}-${PREFIX[category]}${String(i + 1).padStart(2, '0')}`,
      dropId,
      category,
      title,
      brand,
      price,
      size,
      measurements: { ancho, largo },
      condition,
      notes: notes ?? '',
      images: [
        garmentImage(category, color, bg, { tilt, print }),
        garmentImage(category, color, bg, { tilt: -tilt, view: 'back' }),
        garmentImage(category, color, bg, { tilt, print, view: 'detail' }),
      ],
      hidden: false,
      sold: false,
      createdAt: createdAt + i * MIN,
    }
  })
}

export function createSeed(now: number = Date.now()): DbState {
  const tonight = nextAt(config.releaseHour, now)
  // La última vez que fueron las 20:00 (hoy o ayer).
  const lastRelease = tonight - DAY

  const drops: Drop[] = [
    {
      id: 'd09',
      number: 9,
      name: 'Septiembre',
      description: 'Lo que quedó del drop de septiembre, con descuento.',
      releases: { pantalones: lastRelease - 36 * DAY, polerones: lastRelease - 35 * DAY, poleras: lastRelease - 34 * DAY },
      discountPct: 30,
      createdAt: now - 45 * DAY,
    },
    {
      id: 'd10',
      number: 10,
      name: 'Octubre',
      description: 'Ropa americana seleccionada a mano: denim, polerones y poleras de los 90. Una de cada una.',
      releases: { pantalones: lastRelease - DAY, polerones: lastRelease, poleras: tonight },
      createdAt: now - 6 * DAY,
    },
    {
      id: 'd11',
      number: 11,
      name: 'Noviembre',
      description: '',
      releases: {},
      createdAt: now - DAY,
    },
  ]

  const d09 = [
    ...makeProducts('d09', 'pantalones', [
      ['Jeans bootcut', 'Wrangler', '#4D6E96', '30', 39, 105, 'muy-bueno', 19990],
      ['Cargo café', 'Sin marca', '#6B5A43', '34', 44, 104, 'muy-bueno', 15990],
    ], now - 45 * DAY),
    ...makeProducts('d09', 'polerones', [['Polerón gris', 'Russell', '#8F8F94', 'L', 60, 69, 'muy-bueno', 17990]], now - 45 * DAY),
    ...makeProducts('d09', 'poleras', [
      ['Polera rock negra', 'Sin marca', '#262628', 'XL', 61, 75, 'con-detalles', 9990, 'Estampado gastado por uso.', 'ROCK'],
      ['Polera azul', 'Gap', '#3D5A80', 'M', 52, 69, 'como-nuevo', 8990],
      ['Polera surf 90s', 'Sin marca', '#7FA7C4', 'M', 52, 70, 'como-nuevo', 9990, '', 'SURF CLUB'],
      ['Polera Hard Rock', 'Sin marca', '#2B2B2E', 'L', 55, 71, 'muy-bueno', 12990, '', 'ROCK'],
    ], now - 45 * DAY),
  ]

  const d10 = [
    ...makeProducts('d10', 'pantalones', [
      ['Jeans 501 recto', "Levi's", '#3E5C83', '32', 41, 104, 'muy-bueno', 24990],
      ['Cargo militar', 'Sin marca', '#5B6146', '34', 44, 106, 'muy-bueno', 17990],
      ['Double knee', 'Carhartt', '#8A6A3F', '32', 42, 102, 'con-detalles', 34990, 'Desgaste natural en rodillas, le da carácter. Sin roturas.'],
      ['874 work pant', 'Dickies', '#2A2A2C', '30', 39, 100, 'como-nuevo', 19990],
      ['Jeans baggy lavado claro', "Levi's", '#9DB7D5', '34', 45, 105, 'muy-bueno', 22990],
      ['Pantalón de tela gris', 'Ralph Lauren', '#8C8C8C', '32', 41, 101, 'como-nuevo', 18990],
      ['Carpintero', 'Wrangler', '#5C7BA3', '33', 43, 104, 'muy-bueno', 19990],
      ['Jeans negro deslavado', 'Lee', '#3A3A3E', '31', 40, 102, 'muy-bueno', 16990],
      ['Chino beige', 'Gap', '#C8B48E', '32', 41, 100, 'como-nuevo', 14990],
      ['Cargo ripstop negro', 'Sin marca', '#262628', '30', 39, 101, 'como-nuevo', 15990],
      ['Jeans 550 relaxed', "Levi's", '#46648C', '36', 47, 103, 'muy-bueno', 21990],
      ['Pantalón de buzo', 'Nike', '#3B3F46', 'L', 40, 104, 'muy-bueno', 16990],
    ], now - 5 * DAY),
    ...makeProducts('d10', 'polerones', [
      ['Reverse Weave gris', 'Champion', '#9A9A9E', 'L', 62, 70, 'muy-bueno', 27990],
      ['Polerón 90s negro', 'Nike', '#232325', 'XL', 64, 72, 'muy-bueno', 24990],
      ['Hoodie universitario', 'Russell', '#6A1F2B', 'M', 58, 68, 'como-nuevo', 22990, '', 'COLLEGE'],
      ['Polerón crema', 'Carhartt', '#E3D8C3', 'L', 61, 70, 'nuevo', 32990],
      ['Polerón zip oliva', 'Columbia', '#4F5A3C', 'M', 57, 67, 'muy-bueno', 19990],
      ['Hoodie azul marino', 'Tommy Hilfiger', '#22304A', 'XL', 63, 73, 'con-detalles', 14990, 'Pequeña mancha en la manga izquierda (ver foto 2). Precio rebajado por eso.'],
      ['Polerón gris oscuro', 'Adidas', '#4A4C52', 'L', 60, 69, 'muy-bueno', 18990],
      ['Hoodie verde bosque', 'The North Face', '#2E4636', 'M', 57, 68, 'como-nuevo', 29990],
      ['Polerón fleece café', 'Patagonia', '#6B4A34', 'L', 61, 68, 'muy-bueno', 34990],
      ['Hoodie rojo', 'Champion', '#A8322D', 'S', 54, 65, 'muy-bueno', 19990, '', 'ATHLETIC'],
      ['Polerón celeste', 'Gap', '#8FB1CF', 'M', 56, 67, 'como-nuevo', 15990, '', 'VARSITY'],
      ['Hoodie negro estampado', 'Harley-Davidson', '#1F1F21', 'XL', 65, 74, 'con-detalles', 26990, 'Estampado craquelado por uso, típico de la época.', 'RIDE FREE'],
    ], now - 4 * DAY),
    ...makeProducts('d10', 'poleras', [
      ['Polera tour 1998', 'Harley-Davidson', '#1E1E1E', 'L', 56, 72, 'muy-bueno', 19990, 'Single stitch, estampado con craquelado natural.', "TOUR '98"],
      ['Polera banda single stitch', 'Sin marca', '#2F2F33', 'M', 52, 70, 'con-detalles', 14990, 'Pequeño hoyo en el ruedo.', 'WORLD TOUR'],
      ['Polera boxy heavyweight', 'Carhartt', '#EFEDE8', 'L', 58, 70, 'nuevo', 12990],
      ['Polera teñida azul', 'Sin marca', '#7A8FB0', 'M', 53, 71, 'muy-bueno', 8990, '', 'SURF CLUB'],
      ['Polera swoosh gris', 'Nike', '#A5A5A8', 'S', 49, 68, 'como-nuevo', 11990],
      ['Polera ringer crema', 'Sin marca', '#E6DCC7', 'M', 51, 69, 'muy-bueno', 9990],
      ['Polera outdoor', 'Columbia', '#5F6F52', 'L', 55, 71, 'muy-bueno', 12990, '', 'OUTDOOR'],
      ['Polera piqué azul', 'Ralph Lauren', '#2B3F66', 'M', 52, 70, 'como-nuevo', 14990],
      ['Polera roja athletic', 'Champion', '#B23A33', 'L', 56, 72, 'muy-bueno', 10990, '', 'ATHLETIC'],
      ['Polera blanca', 'Adidas', '#F2F1EC', 'XL', 60, 74, 'como-nuevo', 9990],
      ['Polera mostaza', 'Sin marca', '#C99A3A', 'M', 52, 69, 'muy-bueno', 7990, '', 'ROUTE 66'],
      ['Polera verde', 'Patagonia', '#3F6B5A', 'L', 55, 71, 'muy-bueno', 13990, '', 'OUTDOOR'],
    ], now - 3 * DAY),
  ]

  // Noviembre a medio cargar: así trabaja él (un día pantalones, otro polerones, poleras pendientes).
  const d11 = [
    ...makeProducts('d11', 'pantalones', [
      ['Jeans 505', "Levi's", '#46648C', '32', 42, 103, 'muy-bueno', 22990],
      ['Carpintero azul', 'Wrangler', '#5C7BA3', '32', 42, 104, 'muy-bueno', 19990],
      ['Cargo negro', 'Sin marca', '#262628', '30', 40, 101, 'como-nuevo', 15990],
      ['Jeans negro', 'Lee', '#3A3A3E', '34', undefined, undefined, 'muy-bueno', 16990],
    ], now - DAY),
    ...makeProducts('d11', 'polerones', [
      ['Polerón gris', 'Russell', '#8F8F94', 'L', 60, 69, 'muy-bueno', 18990],
      ['Polerón fleece', 'Columbia', '#6B4A34', 'M', 56, 66, 'como-nuevo', 24990],
      ['Polerón 03', '', '#2E4636', '', undefined, undefined, 'muy-bueno', null],
    ], now - DAY / 2),
  ]

  const all = [...d09, ...d10, ...d11]
  const get = (id: string) => all.find((p) => p.id === id)!

  const orders: Order[] = []
  const order = (o: Omit<Order, 'subtotal' | 'total' | 'items'>, ids: string[], discountPct = 0): Order => {
    const items = ids.map((id) => {
      const p = get(id)
      const price = Math.round(((p.price ?? 0) * (100 - discountPct)) / 1000) * 10
      return { productId: p.id, title: p.title, brand: p.brand, size: p.size, price, image: p.images[0] }
    })
    const subtotal = items.reduce((s, i) => s + i.price, 0)
    const full: Order = { ...o, items, subtotal, total: subtotal + o.delivery.cost }
    // Si su martes ya pasó, ese pedido ya se despachó.
    const dispatch = full.paidAt && nextWeekday(config.dispatchWeekday, full.paidAt)
    if (full.status === 'paid' && dispatch && dispatch < now) {
      full.status = 'shipped'
      full.shippedAt = dispatch
    }
    orders.push(full)
    if (o.status === 'paid' || o.status === 'shipped') {
      ids.forEach((id) => {
        get(id).sold = true
        get(id).soldOrderId = o.id
      })
    }
    return full
  }

  order(
    {
      id: 'o1', code: 'K7Q2', buyerId: 'seed-a', dropId: 'd09',
      customer: { name: 'Camila Rojas', phone: '+56 9 8123 4567', email: 'camila@example.com' },
      delivery: { method: 'envio-regiones', cost: 5990, region: 'Valparaíso', comuna: 'Viña del Mar', address: 'Av. Libertad 1234, depto 52' },
      payment: 'tarjeta', status: 'shipped', createdAt: now - 36 * DAY, paidAt: now - 36 * DAY, shippedAt: now - 34 * DAY, tracking: 'STK-99812734',
    },
    ['d09-pl03', 'd09-pl04']
  )
  order(
    {
      id: 'o2', code: 'M3XA', buyerId: 'seed-b', dropId: 'd10',
      customer: { name: 'Diego Fuentes', phone: '+56 9 7654 3210', email: 'diego@example.com' },
      delivery: { method: 'envio-rm', cost: 3990, region: 'Metropolitana', comuna: 'Ñuñoa', address: 'Irarrázaval 3456' },
      payment: 'tarjeta', status: 'paid', createdAt: lastRelease - DAY + 4 * MIN, paidAt: lastRelease - DAY + 5 * MIN,
    },
    ['d10-pa01', 'd10-pa05']
  )
  order(
    {
      id: 'o3', code: 'T9LP', buyerId: 'seed-c', dropId: 'd10',
      customer: { name: 'Vale Muñoz', phone: '+56 9 6111 2233', email: 'vale@example.com' },
      delivery: { method: 'retiro', cost: 0 },
      payment: 'tarjeta', status: 'paid', createdAt: lastRelease + 2 * MIN, paidAt: lastRelease + 3 * MIN,
    },
    ['d10-pn01', 'd10-pn04']
  )
  order(
    {
      id: 'o5', code: 'R4ZN', buyerId: 'seed-f', dropId: 'd10',
      customer: { name: 'Nico Pérez', phone: '+56 9 4455 6677', email: 'nico@example.com' },
      delivery: { method: 'envio-regiones', cost: 5990, region: 'Biobío', comuna: 'Concepción', address: "O'Higgins 880" },
      payment: 'transferencia', status: 'paid', createdAt: lastRelease + 9 * MIN, paidAt: lastRelease + 40 * MIN,
    },
    ['d10-pa09', 'd10-pn08']
  )

  // Transferencia pendiente: la prenda queda retenida hasta que se confirme el pago.
  const pendingAt = now - 25 * MIN
  const o4 = order(
    {
      id: 'o4', code: 'B2RW', buyerId: 'seed-d', dropId: 'd10',
      customer: { name: 'Seba Contreras', phone: '+56 9 5222 8899', email: 'seba@example.com' },
      delivery: { method: 'envio-rm', cost: 3990, region: 'Metropolitana', comuna: 'Maipú', address: 'Pajaritos 2020' },
      payment: 'transferencia', status: 'pending', createdAt: pendingAt, expiresAt: pendingAt + config.transferHoldHours * HOUR,
    },
    ['d10-pn03']
  )
  get('d10-pn03').reservation = { buyerId: o4.buyerId, until: o4.expiresAt!, orderId: o4.id }

  // Alguien más tiene esta prenda en su carrito ahora mismo.
  get('d10-pa03').reservation = { buyerId: 'seed-e', until: now + 7 * MIN }

  const phone = (i: number) => `+56 9 ${String(5000 + i * 137).slice(0, 4)} ${String(1000 + i * 373).slice(0, 4)}`
  const subscribers: Subscriber[] = Array.from({ length: 31 }, (_, i) => ({
    id: `s${i + 1}`,
    contact: i % 4 === 0 ? `cliente${i + 1}@example.com` : phone(i),
    dropId: i < 19 ? 'd10' : 'd11',
    createdAt: now - (i + 1) * 2 * HOUR,
  }))

  return { version: 2, drops, products: all, orders, subscribers }
}
