# E-commerce por drops — prototipo

Prototipo navegable de una tienda para una marca de Instagram que vende **prendas únicas por drops**.
Separado del sitio de Aqua Studio: tiene su propio `package.json` y no comparte código con la raíz.

> Es un prototipo: **no tiene backend**. Los datos viven en el navegador (localStorage + IndexedDB para las
> fotos). Sirve para validar el flujo con el cliente antes de construir la versión real. Ver `PROPUESTA.md`.

## Correrlo

```bash
cd ecommerce-drops
npm install
npm run dev        # http://localhost:3100
```

- Tienda: `/`
- Panel de la marca: `/admin`

## Publicar en Vercel

El proyecto vive en la carpeta `ecommerce-drops/` del repo `aquastudio`.

1. Vercel → **Add New… → Project** → importar `aquastudio`.
2. **Root Directory:** `ecommerce-drops` (framework Next.js se detecta solo). Nombre sugerido: `ecommerce-drops`.
3. Vercel despliega la rama de producción (`master`). Mientras el código esté solo en la rama
   `feat/ecommerce-drops-prototipo`, hay que fusionarla a `master` o, en **Settings → Git → Production Branch**,
   elegir esa rama y volver a desplegar.

No necesita variables de entorno: no hay backend.

## Guion de demo (10 minutos con el cliente)

1. **El problema de la prenda única.** Abre la tienda en dos pestañas (cada pestaña es un comprador distinto).
   En la pestaña A reserva una prenda; en la B aparece "En un carrito · se libera en 09:41".
   Nadie puede comprar algo que ya se vendió.
2. **Checkout.** En A paga con transferencia: la prenda queda retenida 2 h. En `/admin/pedidos` confirma el
   pago → en la pestaña B la prenda pasa a "Vendida" sin recargar.
3. **Su proceso real.** `/admin` → Noviembre (a medio cargar, como él trabaja: pantalones un día, polerones
   otro). Está seleccionada la categoría que falta (Poleras). Elige "2 fotos por prenda", pon un precio para el
   lote y sube fotos desde el teléfono: se crea una prenda por cada par de fotos. Solo falta tocar la talla.
4. **Publicación por categoría.** Barra de abajo → "Programar 20:00" → "hoy 20:00". En Octubre, las poleras están
   programadas: la tienda muestra el calendario del drop y la cuenta regresiva. "Publicar ahora" las saca al tiro.
5. **Martes de despacho.** `/admin/pedidos` → "Por enviar": pedidos agrupados por martes, con "copiar todo para
   etiquetas" y "marcar todos enviados".
6. **Sobrantes.** Septiembre está con −30 % y aparece en "Últimas piezas". Se cambia en el editor del drop.

"Reiniciar datos de demo" en `/admin` vuelve todo al estado inicial.

## Qué está simulado

| En el prototipo | En producción |
| --- | --- |
| localStorage / IndexedDB | Supabase (Postgres + Storage) |
| Reserva con lectura-escritura en el navegador | `UPDATE … WHERE` atómico en Postgres |
| Pago con tarjeta aprobado al instante | Mercado Pago / Flow con confirmación por webhook |
| Sincronización entre pestañas (evento `storage`) | Supabase Realtime |
| Panel sin login | Login por magic link solo para la marca |

## Estructura

```
app/(tienda)/        portada del drop, ficha /p/[id], carrito, /pedido/[id], /ayuda
app/admin/           drops, editor de drop (carga por lotes + lanzamiento), pedidos
components/          UI de tienda y panel
lib/config.ts        marca, hora de publicación, día de despacho, categorías, tallas, envíos, banco ← lo que cambia por cliente
lib/store.ts         "API" de datos: reservas, pedidos, drops (se reemplaza por llamadas al servidor)
lib/images.ts        compresión de fotos en el teléfono + almacenamiento local
lib/seed.ts          datos de ejemplo
```
