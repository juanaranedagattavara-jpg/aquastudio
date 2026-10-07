import type { CategoryId, Condition, DeliveryMethod } from './types'

/**
 * Todo lo que cambia de una marca a otra vive aquí.
 * Los valores son placeholders: confirmar con el cliente antes de producción.
 */
export const config = {
  brand: {
    name: 'ARCHIVO',
    tagline: 'Ropa americana seleccionada. Una de cada una.',
    instagram: 'tumarca',
    whatsapp: '56900000000',
  },
  /** Hora a la que se publica cada categoría (así lo hace hoy en Instagram). */
  releaseHour: 20,
  /** Día de despacho: 0 domingo … 2 martes. Los pedidos pagados hasta el lunes salen ese martes. */
  dispatchWeekday: 2,
  /** Minutos que una prenda queda apartada al agregarla al carrito. */
  reservationMinutes: 10,
  /** Horas para pagar por transferencia antes de liberar las prendas. */
  transferHoldHours: 2,
  bank: {
    banco: 'Banco Estado',
    tipo: 'Cuenta RUT',
    numero: '12345678',
    rut: '12.345.678-9',
    titular: 'Nombre Apellido',
    email: 'pagos@tumarca.cl',
  },
}

export interface CategoryConfig {
  id: CategoryId
  label: string
  singular: string
  measures: { ancho: string; largo: string }
}

export const categories: CategoryConfig[] = [
  { id: 'pantalones', label: 'Pantalones', singular: 'Pantalón', measures: { ancho: 'Cintura', largo: 'Largo' } },
  { id: 'polerones', label: 'Polerones', singular: 'Polerón', measures: { ancho: 'Ancho', largo: 'Largo' } },
  { id: 'poleras', label: 'Poleras', singular: 'Polera', measures: { ancho: 'Ancho', largo: 'Largo' } },
  { id: 'otros', label: 'Otros', singular: 'Prenda', measures: { ancho: 'Ancho', largo: 'Largo' } },
]

export function categoryById(id: CategoryId): CategoryConfig {
  return categories.find((c) => c.id === id) ?? categories[categories.length - 1]
}

export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', 'Única']

export const conditions: { id: Condition; label: string; hint: string }[] = [
  { id: 'nuevo', label: 'Nuevo', hint: 'Con etiqueta o sin uso' },
  { id: 'como-nuevo', label: 'Como nuevo', hint: '10/10, sin detalles' },
  { id: 'muy-bueno', label: 'Muy bueno', hint: '9/10, desgaste mínimo' },
  { id: 'con-detalles', label: 'Con detalles', hint: 'Ver notas y fotos' },
]

export const delivery: { id: DeliveryMethod; label: string; detail: string; cost: number }[] = [
  { id: 'envio-rm', label: 'Envío Santiago', detail: 'Sale el martes, llega en 24–48 h', cost: 3990 },
  { id: 'envio-regiones', label: 'Envío a regiones', detail: 'Sale el martes por Starken, 2–5 días', cost: 5990 },
  { id: 'retiro', label: 'Retiro en persona', detail: 'El martes, coordinamos por WhatsApp', cost: 0 },
]

/** Sugerencias para el campo marca: lo que más llega en los fardos. */
export const brands = [
  "Levi's",
  'Carhartt',
  'Dickies',
  'Wrangler',
  'Lee',
  'Nike',
  'Adidas',
  'Champion',
  'Russell',
  'Ralph Lauren',
  'Tommy Hilfiger',
  'The North Face',
  'Columbia',
  'Patagonia',
  'Harley-Davidson',
  'Gap',
  'Sin marca',
]

export const regions = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
]
