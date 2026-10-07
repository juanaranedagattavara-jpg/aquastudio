export type CategoryId = 'pantalones' | 'polerones' | 'poleras' | 'otros'

export type Condition = 'nuevo' | 'como-nuevo' | 'muy-bueno' | 'con-detalles'

export type DropStatus = 'draft' | 'scheduled' | 'live' | 'closed'

/** Estado de una categoría dentro de un drop: él publica por categoría, a las 20:00. */
export type ReleaseStatus = 'draft' | 'scheduled' | 'live'

/** Estado que ve el público. Se calcula, no se guarda. */
export type ProductState = 'available' | 'reserved' | 'sold'

export interface Measurements {
  /** Ancho axila a axila (tops) o cintura (pantalones), en cm con la prenda en plano. */
  ancho?: number
  largo?: number
}

export interface Reservation {
  buyerId: string
  until: number
  /** Si existe, la prenda está retenida por un pedido pendiente de pago (transferencia). */
  orderId?: string
}

export interface Product {
  id: string
  dropId: string
  category: CategoryId
  title: string
  brand: string
  price: number | null
  size: string
  measurements: Measurements
  condition: Condition
  notes: string
  /** Referencias de imagen: data URL / URL o "idb:<key>" para fotos subidas desde el panel. */
  images: string[]
  hidden: boolean
  sold: boolean
  soldOrderId?: string
  reservation?: Reservation
  createdAt: number
}

export interface Drop {
  id: string
  number: number
  name: string
  description: string
  /** Hora de publicación de cada categoría (ms). Sin valor = borrador. */
  releases: Partial<Record<CategoryId, number>>
  closedAt?: number
  /** Descuento para liquidar lo que sobró (0–90). */
  discountPct?: number
  createdAt: number
}

export type DeliveryMethod = 'retiro' | 'envio-rm' | 'envio-regiones'
export type PaymentMethod = 'tarjeta' | 'transferencia'
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export interface OrderItem {
  productId: string
  title: string
  brand: string
  size: string
  price: number
  image?: string
}

export interface Order {
  id: string
  code: string
  buyerId: string
  dropId: string
  items: OrderItem[]
  customer: { name: string; phone: string; email: string }
  delivery: {
    method: DeliveryMethod
    cost: number
    region?: string
    comuna?: string
    address?: string
  }
  payment: PaymentMethod
  subtotal: number
  total: number
  status: OrderStatus
  createdAt: number
  /** Para transferencias: si no se confirma el pago antes, las prendas se liberan. */
  expiresAt?: number
  paidAt?: number
  shippedAt?: number
  tracking?: string
}

export interface Subscriber {
  id: string
  contact: string
  dropId?: string
  createdAt: number
}

export interface DbState {
  version: number
  drops: Drop[]
  products: Product[]
  orders: Order[]
  subscribers: Subscriber[]
}
