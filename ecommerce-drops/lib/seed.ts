import { config } from './config'
import { garmentImage } from './placeholder'
import type { CategoryId, Condition, DbState, Drop, Order, Product, Subscriber } from './types'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

type Row = [
  title: string,
  category: CategoryId,
  color: string,
  size: string,
  ancho: number | undefined,
  largo: number | undefined,
  condition: Condition,
  price: number | null,
  notes?: string,
]

const BG = ['#E9E6E0', '#DEDAD2', '#ECE9E3', '#E3E0DA']

function makeProducts(dropId: string, rows: Row[], createdAt: number): Product[] {
  return rows.map(([title, category, color, size, ancho, largo, condition, price, notes], i) => {
    const isLightGarment = parseInt(color.slice(1, 3), 16) > 0xd0
    const bg = isLightGarment ? '#D3CEC4' : BG[i % BG.length]
    return {
      id: `${dropId}-p${String(i + 1).padStart(2, '0')}`,
      dropId,
      category,
      title,
      price,
      size,
      measurements: { ancho, largo },
      condition,
      notes: notes ?? '',
      images: [garmentImage(category, color, bg, 'front'), garmentImage(category, color, bg, 'back')],
      hidden: false,
      sold: false,
      createdAt: createdAt + i * MIN,
    }
  })
}

export function createSeed(now: number = Date.now()): DbState {
  const drops: Drop[] = [
    {
      id: 'd02',
      number: 2,
      name: 'Archivo verano',
      description: 'Poleras y shorts para el calor.',
      status: 'closed',
      launchAt: now - 40 * DAY,
      createdAt: now - 45 * DAY,
    },
    {
      id: 'd03',
      number: 3,
      name: 'Invierno archivo',
      description: 'Denim, fleece y poleras pesadas. Una de cada una.',
      status: 'live',
      launchAt: now - 2 * DAY,
      createdAt: now - 6 * DAY,
    },
    {
      id: 'd04',
      number: 4,
      name: 'Denim & fleece',
      description: '',
      status: 'draft',
      createdAt: now - 2 * DAY,
    },
  ]

  const d02 = makeProducts(
    'd02',
    [
      ['Polera Hard Rock Café', 'poleras', '#2B2B2E', 'L', 55, 71, 'muy-bueno', 19990],
      ['Polera surf 90s', 'poleras', '#7FA7C4', 'M', 52, 70, 'como-nuevo', 17990],
    ],
    now - 45 * DAY
  )

  const d03 = makeProducts(
    'd03',
    [
      ["Levi's 501 vintage", 'pantalones', '#3E5C83', '32', 41, 104, 'muy-bueno', 32990],
      ['Cargo militar oliva', 'pantalones', '#5B6146', '34', 44, 106, 'muy-bueno', 27990],
      ['Carhartt double knee', 'pantalones', '#8A6A3F', '32', 42, 102, 'con-detalles', 44990, 'Desgaste natural en rodillas, le da carácter. Sin roturas.'],
      ['Dickies 874 negro', 'pantalones', '#2A2A2C', '30', 39, 100, 'como-nuevo', 21990],
      ['Jeans baggy lavado claro', 'pantalones', '#9DB7D5', '34', 45, 105, 'muy-bueno', 24990],
      ['Pantalón de tela gris', 'pantalones', '#8C8C8C', '32', 41, 101, 'como-nuevo', 19990],
      ['Champion Reverse Weave', 'polerones', '#9A9A9E', 'L', 62, 70, 'muy-bueno', 34990],
      ['Polerón Nike 90s', 'polerones', '#232325', 'XL', 64, 72, 'muy-bueno', 29990],
      ['Hoodie universitario burdeo', 'polerones', '#6A1F2B', 'M', 58, 68, 'como-nuevo', 27990],
      ['Polerón Carhartt crema', 'polerones', '#E3D8C3', 'L', 61, 70, 'nuevo', 39990],
      ['Polerón zip oliva', 'polerones', '#4F5A3C', 'M', 57, 67, 'muy-bueno', 25990],
      ['Hoodie azul marino', 'polerones', '#22304A', 'XL', 63, 73, 'con-detalles', 18990, 'Pequeña mancha en manga izquierda (ver foto 2). Precio rebajado por eso.'],
      ['Polera Harley 1998', 'poleras', '#1E1E1E', 'L', 56, 72, 'muy-bueno', 29990, 'Single stitch, estampado con craquelado natural.'],
      ['Polera banda single stitch', 'poleras', '#2F2F33', 'M', 52, 70, 'con-detalles', 24990, 'Pequeño hoyo en el ruedo.'],
      ['Polera boxy heavyweight', 'poleras', '#EFEDE8', 'L', 58, 70, 'nuevo', 14990],
      ['Polera teñida azul', 'poleras', '#7A8FB0', 'M', 53, 71, 'muy-bueno', 16990],
      ['Polera Nike swoosh', 'poleras', '#A5A5A8', 'S', 49, 68, 'como-nuevo', 15990],
      ['Polera ringer crema', 'poleras', '#E6DCC7', 'M', 51, 69, 'muy-bueno', 17990],
    ],
    now - 5 * DAY
  )

  // Drop 04 a medio cargar: así trabaja él (lunes pantalones, martes polerones, poleras pendientes).
  const d04 = makeProducts(
    'd04',
    [
      ['Levi\'s 550 relaxed', 'pantalones', '#46648C', '33', 43, 103, 'muy-bueno', 29990],
      ['Wrangler carpintero', 'pantalones', '#5C7BA3', '32', 42, 104, 'muy-bueno', 26990],
      ['Cargo negro ripstop', 'pantalones', '#262628', '30', 40, 101, 'como-nuevo', 24990],
      ['Jeans negro deslavado', 'pantalones', '#3A3A3E', '34', undefined, undefined, 'muy-bueno', 22990],
      ['Polerón Russell gris', 'polerones', '#8F8F94', 'L', 60, 69, 'muy-bueno', 27990],
      ['Polerón fleece café', 'polerones', '#6B4A34', 'M', 56, 66, 'como-nuevo', 31990],
      ['Polerón 03', 'polerones', '#2E4636', '', undefined, undefined, 'muy-bueno', null],
    ],
    now - 2 * DAY
  )

  const byId = (list: Product[], n: number) => list[n - 1]

  const orders: Order[] = []
  const order = (o: Omit<Order, 'subtotal' | 'total'>): Order => {
    const subtotal = o.items.reduce((s, i) => s + i.price, 0)
    const full: Order = { ...o, subtotal, total: subtotal + o.delivery.cost }
    orders.push(full)
    return full
  }
  const itemOf = (p: Product) => ({
    productId: p.id,
    title: p.title,
    size: p.size,
    price: p.price ?? 0,
    image: p.images[0],
  })
  const markSold = (orderId: string, ...ps: Product[]) =>
    ps.forEach((p) => {
      p.sold = true
      p.soldOrderId = orderId
    })

  const o1 = order({
    id: 'o1',
    code: 'K7Q2',
    buyerId: 'seed-a',
    dropId: 'd02',
    items: [itemOf(byId(d02, 1)), itemOf(byId(d02, 2))],
    customer: { name: 'Camila Rojas', phone: '+56 9 8123 4567', email: 'camila@example.com' },
    delivery: { method: 'envio-regiones', cost: 5990, region: 'Valparaíso', comuna: 'Viña del Mar', address: 'Av. Libertad 1234, depto 52' },
    payment: 'tarjeta',
    status: 'shipped',
    createdAt: now - 39 * DAY,
    paidAt: now - 39 * DAY,
    shippedAt: now - 38 * DAY,
    tracking: 'STK-99812734',
  })
  markSold(o1.id, byId(d02, 1), byId(d02, 2))

  const o2 = order({
    id: 'o2',
    code: 'M3XA',
    buyerId: 'seed-b',
    dropId: 'd03',
    items: [itemOf(byId(d03, 1)), itemOf(byId(d03, 7))],
    customer: { name: 'Diego Fuentes', phone: '+56 9 7654 3210', email: 'diego@example.com' },
    delivery: { method: 'envio-rm', cost: 3990, region: 'Metropolitana', comuna: 'Ñuñoa', address: 'Irarrázaval 3456' },
    payment: 'tarjeta',
    status: 'paid',
    createdAt: now - 2 * DAY + 4 * MIN,
    paidAt: now - 2 * DAY + 5 * MIN,
  })
  markSold(o2.id, byId(d03, 1), byId(d03, 7))

  const o3 = order({
    id: 'o3',
    code: 'T9LP',
    buyerId: 'seed-c',
    dropId: 'd03',
    items: [itemOf(byId(d03, 5)), itemOf(byId(d03, 13))],
    customer: { name: 'Vale Muñoz', phone: '+56 9 6111 2233', email: 'vale@example.com' },
    delivery: { method: 'retiro', cost: 0 },
    payment: 'tarjeta',
    status: 'paid',
    createdAt: now - 2 * DAY + 11 * MIN,
    paidAt: now - 2 * DAY + 12 * MIN,
  })
  markSold(o3.id, byId(d03, 5), byId(d03, 13))

  // Transferencia pendiente: la prenda queda retenida hasta que se confirme el pago.
  const pendingAt = now - 25 * MIN
  const o4 = order({
    id: 'o4',
    code: 'B2RW',
    buyerId: 'seed-d',
    dropId: 'd03',
    items: [itemOf(byId(d03, 9))],
    customer: { name: 'Seba Contreras', phone: '+56 9 5222 8899', email: 'seba@example.com' },
    delivery: { method: 'envio-rm', cost: 3990, region: 'Metropolitana', comuna: 'Maipú', address: 'Pajaritos 2020' },
    payment: 'transferencia',
    status: 'pending',
    createdAt: pendingAt,
    expiresAt: pendingAt + config.transferHoldHours * HOUR,
  })
  byId(d03, 9).reservation = { buyerId: o4.buyerId, until: o4.expiresAt!, orderId: o4.id }

  // Alguien más tiene esta prenda en su carrito ahora mismo.
  byId(d03, 3).reservation = { buyerId: 'seed-e', until: now + 7 * MIN }

  const subscribers: Subscriber[] = Array.from({ length: 23 }, (_, i) => ({
    id: `s${i + 1}`,
    contact: i % 3 === 0 ? `cliente${i + 1}@example.com` : `+56 9 ${String(50000000 + i * 137731).slice(0, 4)} ${String(1000 + i * 373).slice(0, 4)}`,
    dropId: 'd04',
    createdAt: now - (i + 1) * 3 * HOUR,
  }))

  return {
    version: 1,
    drops,
    products: [...d02, ...d03, ...d04],
    orders,
    subscribers,
  }
}
