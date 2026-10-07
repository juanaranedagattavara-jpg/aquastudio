'use client'

/**
 * Capa de datos del prototipo.
 *
 * Todo vive en localStorage (y las fotos en IndexedDB, ver images.ts) para poder
 * probar el flujo completo sin backend. Las funciones de este archivo son la
 * "API" de la tienda: en producción cada una pasa a ser una llamada al servidor
 * (Supabase / Postgres) y la reserva se hace con un UPDATE atómico, no aquí.
 */

import { useEffect, useState, useSyncExternalStore } from 'react'
import { categories, categoryById, config } from './config'
import { discounted, nextWeekday } from './format'
import { createSeed } from './seed'
import type {
  CategoryId,
  DbState,
  Drop,
  DropStatus,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductState,
  ReleaseStatus,
} from './types'

const KEY = 'drops-proto:v2'
const VERSION = 2
const BUYER_KEY = 'drops-proto:buyer'
const MIN = 60_000

let cache: DbState | null = null
const listeners = new Set<() => void>()
let storageBound = false

function parse(raw: string | null): DbState | null {
  if (!raw) return null
  try {
    const db = JSON.parse(raw) as DbState
    return db.version === VERSION ? db : null
  } catch {
    return null
  }
}

function persist(next: DbState) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch (err) {
    console.warn('No se pudo guardar en localStorage', err)
  }
  listeners.forEach((l) => l())
}

function readFresh(): DbState {
  const stored = parse(localStorage.getItem(KEY))
  if (stored) return stored
  const seed = createSeed()
  persist(seed)
  return seed
}

function getSnapshot(): DbState {
  if (!cache) cache = readFresh()
  return cache
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!storageBound) {
    storageBound = true
    // Otra pestaña (otro "comprador") cambió algo: refrescamos al tiro.
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY) return
      cache = parse(e.newValue) ?? readFresh()
      listeners.forEach((l) => l())
    })
  }
  return () => {
    listeners.delete(listener)
  }
}

/** null durante el render en servidor; el estado real llega al hidratar. */
export function useDb(): DbState | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

/** Lee lo último guardado (otra pestaña pudo cambiarlo), aplica el cambio y guarda. */
function mutate<T>(fn: (db: DbState, now: number) => T): T {
  const db = readFresh()
  const result = fn(db, Date.now())
  persist(db)
  return result
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

function randomId(len = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

/**
 * Un comprador por pestaña (sessionStorage) para poder simular a dos personas
 * peleando la misma prenda: abre la tienda en dos pestañas.
 */
export function useBuyerId(): string | null {
  const [id, setId] = useState<string | null>(null)
  useEffect(() => {
    let value = sessionStorage.getItem(BUYER_KEY)
    if (!value) {
      value = `b-${randomId(10)}`
      sessionStorage.setItem(BUYER_KEY, value)
    }
    setId(value)
  }, [])
  return id
}

// ───────────────────────── Selectores ─────────────────────────

export function releaseStatus(drop: Drop, category: CategoryId, now: number): ReleaseStatus {
  const at = drop.releases[category]
  if (!at) return 'draft'
  return at <= now ? 'live' : 'scheduled'
}

export function dropStatus(drop: Drop, now: number): DropStatus {
  if (drop.closedAt) return 'closed'
  const times = Object.values(drop.releases).filter((t): t is number => Boolean(t))
  if (times.some((t) => t <= now)) return 'live'
  return times.length ? 'scheduled' : 'draft'
}

/** Drops con al menos una categoría publicada, el más nuevo primero. */
export function liveDrops(db: DbState, now: number): Drop[] {
  return db.drops.filter((d) => dropStatus(d, now) === 'live').sort((a, b) => b.number - a.number)
}

export interface UpcomingRelease {
  drop: Drop
  category: CategoryId
  at: number
}

/** Próximas categorías programadas (las que la tienda anuncia con cuenta regresiva). */
export function upcomingReleases(db: DbState, now: number): UpcomingRelease[] {
  return db.drops
    .filter((d) => !d.closedAt)
    .flatMap((drop) =>
      categories
        .filter((c) => releaseStatus(drop, c.id, now) === 'scheduled')
        .map((c) => ({ drop, category: c.id, at: drop.releases[c.id]! }))
    )
    .sort((a, b) => a.at - b.at)
}

export function productState(p: Product, now: number): ProductState {
  if (p.sold) return 'sold'
  if (p.reservation && p.reservation.until > now) return 'reserved'
  return 'available'
}

/** Lo que le falta a una prenda para poder publicarse. */
export function missingFields(p: Product): string[] {
  const missing: string[] = []
  if (!p.images.length) missing.push('foto')
  if (!p.title.trim()) missing.push('nombre')
  if (!p.price || p.price <= 0) missing.push('precio')
  if (!p.size.trim()) missing.push('talla')
  return missing
}

export function hasMeasurements(p: Product): boolean {
  return Boolean(p.measurements.ancho && p.measurements.largo)
}

export function isReady(p: Product): boolean {
  return !p.hidden && missingFields(p).length === 0
}

export function dropOf(db: DbState, p: Product): Drop | undefined {
  return db.drops.find((d) => d.id === p.dropId)
}

/** Visible en la tienda: lista, no oculta y con su categoría ya publicada. */
export function isPublic(db: DbState, p: Product, now: number): boolean {
  const drop = dropOf(db, p)
  return Boolean(drop && !drop.closedAt && isReady(p) && releaseStatus(drop, p.category, now) === 'live')
}

export function dropProducts(db: DbState, dropId: string): Product[] {
  return db.products.filter((p) => p.dropId === dropId).sort((a, b) => a.createdAt - b.createdAt)
}

export function publicDropProducts(db: DbState, dropId: string, now: number): Product[] {
  return dropProducts(db, dropId).filter((p) => isPublic(db, p, now))
}

/** Precio que paga el cliente (con la liquidación del drop, si tiene). */
export function finalPrice(db: DbState, p: Product): number {
  return discounted(p.price ?? 0, dropOf(db, p)?.discountPct)
}

/** Martes en que sale un pedido pagado. */
export function dispatchDate(o: Order): number {
  return nextWeekday(config.dispatchWeekday, o.paidAt ?? o.createdAt)
}

/** El carrito ES el conjunto de reservas vigentes de este comprador. */
export function cartItems(db: DbState, buyerId: string | null, now: number): Product[] {
  if (!buyerId) return []
  return db.products.filter(
    (p) => !p.sold && p.reservation?.buyerId === buyerId && !p.reservation.orderId && p.reservation.until > now
  )
}

export type OrderView = OrderStatus | 'expired'

export function orderStatus(o: Order, now: number): OrderView {
  if (o.status === 'pending' && o.expiresAt && o.expiresAt <= now) return 'expired'
  return o.status
}

// ───────────────────────── Compra ─────────────────────────

export type ReserveResult =
  | { ok: true; until: number }
  | { ok: false; reason: 'sold' | 'reserved' | 'unavailable'; until?: number }

export function reserveProduct(productId: string, buyerId: string): ReserveResult {
  return mutate((db, now) => {
    const p = db.products.find((x) => x.id === productId)
    if (!p || !isPublic(db, p, now)) return { ok: false, reason: 'unavailable' }
    const state = productState(p, now)
    if (state === 'sold') return { ok: false, reason: 'sold' }
    if (state === 'reserved' && p.reservation!.buyerId !== buyerId) {
      return { ok: false, reason: 'reserved', until: p.reservation!.until }
    }
    const until = now + config.reservationMinutes * MIN
    p.reservation = { buyerId, until }
    return { ok: true, until }
  })
}

export function releaseProduct(productId: string, buyerId: string) {
  mutate((db) => {
    const p = db.products.find((x) => x.id === productId)
    if (p?.reservation?.buyerId === buyerId && !p.reservation.orderId) delete p.reservation
  })
}

export interface CheckoutInput {
  buyerId: string
  customer: Order['customer']
  delivery: Order['delivery']
  payment: PaymentMethod
}

export type CheckoutResult = { ok: true; order: Order } | { ok: false; error: string }

export function placeOrder(input: CheckoutInput): CheckoutResult {
  return mutate((db, now): CheckoutResult => {
    const items = cartItems(db, input.buyerId, now)
    if (!items.length) {
      return { ok: false, error: 'Tu reserva expiró. Vuelve a agregar las prendas al carrito.' }
    }
    const lines = items.map((p) => ({
      productId: p.id,
      title: p.title,
      brand: p.brand,
      size: p.size,
      price: finalPrice(db, p),
      image: p.images[0],
    }))
    const subtotal = lines.reduce((s, l) => s + l.price, 0)
    const order: Order = {
      id: `o-${randomId(10)}`,
      code: randomId(4),
      buyerId: input.buyerId,
      dropId: items[0].dropId,
      items: lines,
      customer: input.customer,
      delivery: input.delivery,
      payment: input.payment,
      subtotal,
      total: subtotal + input.delivery.cost,
      status: 'pending',
      createdAt: now,
    }

    if (input.payment === 'tarjeta') {
      // Prototipo: el pago se aprueba al instante. En producción esto lo hace
      // el webhook de Mercado Pago / Flow, nunca el navegador.
      order.status = 'paid'
      order.paidAt = now
      for (const p of items) {
        p.sold = true
        p.soldOrderId = order.id
        delete p.reservation
      }
    } else {
      order.expiresAt = now + config.transferHoldHours * 60 * MIN
      for (const p of items) {
        p.reservation = { buyerId: input.buyerId, until: order.expiresAt, orderId: order.id }
      }
    }

    db.orders.unshift(order)
    return { ok: true, order }
  })
}

// ───────────────────────── Pedidos (admin) ─────────────────────────

export function confirmPayment(orderId: string): { ok: boolean; error?: string } {
  return mutate((db, now) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) return { ok: false, error: 'Pedido no encontrado' }
    const products = order.items.map((i) => db.products.find((p) => p.id === i.productId))
    const taken = products.filter((p) => p && p.sold && p.soldOrderId !== order.id)
    if (taken.length) {
      return { ok: false, error: `La reserva expiró y ${taken.map((p) => p!.title).join(', ')} ya se vendió a otra persona.` }
    }
    order.status = 'paid'
    order.paidAt = now
    for (const p of products) {
      if (!p) continue
      p.sold = true
      p.soldOrderId = order.id
      delete p.reservation
    }
    return { ok: true }
  })
}

export function markShipped(orderId: string, tracking: string) {
  mutate((db, now) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) return
    order.status = 'shipped'
    order.shippedAt = now
    order.tracking = tracking.trim() || undefined
  })
}

export function markShippedMany(orderIds: string[]) {
  mutate((db, now) => {
    for (const order of db.orders) {
      if (!orderIds.includes(order.id) || order.status !== 'paid') continue
      order.status = 'shipped'
      order.shippedAt = now
    }
  })
}

export function cancelOrder(orderId: string) {
  mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) return
    order.status = 'cancelled'
    for (const p of db.products) {
      if (p.reservation?.orderId === orderId) delete p.reservation
      if (p.soldOrderId === orderId) {
        p.sold = false
        delete p.soldOrderId
      }
    }
  })
}

// ───────────────────────── Drops (admin) ─────────────────────────

export function createDrop(): string {
  return mutate((db, now) => {
    const number = Math.max(0, ...db.drops.map((d) => d.number)) + 1
    const drop: Drop = { id: `d-${randomId(8)}`, number, name: '', description: '', releases: {}, createdAt: now }
    db.drops.push(drop)
    return drop.id
  })
}

export function updateDrop(id: string, patch: Partial<Pick<Drop, 'name' | 'description'>>) {
  mutate((db) => {
    const d = db.drops.find((x) => x.id === id)
    if (d) Object.assign(d, patch)
  })
}

/** Publica (o programa) una categoría del drop. `null` la vuelve a borrador. */
export function setRelease(dropId: string, category: CategoryId, at: number | null) {
  mutate((db) => {
    const d = db.drops.find((x) => x.id === dropId)
    if (!d) return
    if (at === null) delete d.releases[category]
    else d.releases[category] = at
  })
}

export function setDropClosed(dropId: string, closed: boolean) {
  mutate((db, now) => {
    const d = db.drops.find((x) => x.id === dropId)
    if (!d) return
    if (closed) d.closedAt = now
    else delete d.closedAt
  })
}

export function setDiscount(dropId: string, pct: number) {
  mutate((db) => {
    const d = db.drops.find((x) => x.id === dropId)
    if (!d) return
    if (pct > 0) d.discountPct = pct
    else delete d.discountPct
  })
}

// ───────────────────────── Prendas (admin) ─────────────────────────

/** Crea una prenda por cada grupo de fotos, numeradas a continuación de las existentes. */
export function addProducts(
  dropId: string,
  category: CategoryId,
  groups: string[][],
  basePrice: number | null
): string[] {
  return mutate((db, now) => {
    const cat = categoryById(category)
    const existing = db.products.filter((p) => p.dropId === dropId && p.category === category).length
    const created = groups.map((images, i): Product => ({
      id: `p-${randomId(10)}`,
      dropId,
      category,
      title: `${cat.singular} ${String(existing + i + 1).padStart(2, '0')}`,
      brand: '',
      price: basePrice,
      size: '',
      measurements: {},
      condition: 'muy-bueno',
      notes: '',
      images,
      hidden: false,
      sold: false,
      createdAt: now + i,
    }))
    db.products.push(...created)
    return created.map((p) => p.id)
  })
}

export function updateProduct(id: string, patch: Partial<Omit<Product, 'id' | 'dropId'>>) {
  mutate((db) => {
    const p = db.products.find((x) => x.id === id)
    if (p) Object.assign(p, patch)
  })
}

export function deleteProduct(id: string) {
  mutate((db) => {
    db.products = db.products.filter((p) => p.id !== id)
  })
}

export function applyPrice(dropId: string, category: CategoryId, price: number, onlyEmpty: boolean): number {
  return mutate((db) => {
    let count = 0
    for (const p of db.products) {
      if (p.dropId !== dropId || p.category !== category || p.sold) continue
      if (onlyEmpty && p.price) continue
      p.price = price
      count++
    }
    return count
  })
}

/** Corrige agrupaciones: pasa una foto a la prenda anterior de la lista. */
export function moveImage(fromId: string, index: number, toId: string) {
  mutate((db) => {
    const from = db.products.find((p) => p.id === fromId)
    const to = db.products.find((p) => p.id === toId)
    if (!from || !to) return
    const [img] = from.images.splice(index, 1)
    if (img) to.images.push(img)
  })
}

/** Corrige agrupaciones: saca una foto y crea una prenda nueva con ella. */
export function splitImage(productId: string, index: number) {
  const source = getSnapshot().products.find((p) => p.id === productId)
  if (!source) return
  const img = source.images[index]
  if (!img) return
  mutate((db) => {
    const p = db.products.find((x) => x.id === productId)
    if (p) p.images.splice(index, 1)
  })
  addProducts(source.dropId, source.category, [[img]], source.price)
}

export function addSubscriber(contact: string, dropId?: string) {
  mutate((db, now) => {
    const normalized = contact.trim()
    if (db.subscribers.some((s) => s.contact === normalized && s.dropId === dropId)) return
    db.subscribers.push({ id: `s-${randomId(8)}`, contact: normalized, dropId, createdAt: now })
  })
}

export function resetDemo() {
  persist(createSeed())
}
