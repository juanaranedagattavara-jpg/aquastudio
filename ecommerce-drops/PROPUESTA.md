# Propuesta — E-commerce por drops

## 1. Cómo trabaja el cliente (respuestas del 7 de octubre)

| Pregunta | Respuesta | Qué cambió en el prototipo |
| --- | --- | --- |
| ¿Prendas únicas? | Sí, ropa americana de fardos | Stock 1 por prenda, sin variantes |
| ¿Qué ropa? | De marca, vintage y usada | Campo **marca** (con sugerencias), estado y medidas en plano; filtro por marca |
| ¿Volumen? | 50–100 prendas por drop, mensual; siempre sobran | Drops mensuales; los sobrantes pasan a **"Últimas piezas"** con descuento (−20/30/40/50 %) |
| ¿Cómo publica? | A las 20:00, **por categoría** | Cada categoría se programa por separado ("hoy 20:00", "mañana 20:00"…). La tienda muestra el **calendario del drop** y la cuenta regresiva de la próxima categoría |
| ¿Cobro y envío? | Los martes | **Despacho todos los martes**: se muestra la fecha en la ficha, el carrito y el pedido; en el panel los pedidos se agrupan por martes con "copiar todo para etiquetas" y "marcar todos enviados" |

Subir y publicar siguen separados: sube por partes cuando tiene tiempo (todo queda en borrador) y publica cada
categoría a las 20:00. Publicar por categoría tiene una ventaja que conviene aprovechar: **son 3–4 "eventos"
por drop en vez de uno**, cada uno con su historia en Instagram y su aviso por WhatsApp.

## 2. Qué resuelve el prototipo

| Problema | Solución en el prototipo |
| --- | --- |
| Dos personas compran la misma prenda única | Al agregar al carrito, la prenda queda **reservada 10 min** para esa persona. Los demás ven "en un carrito · 06:12" |
| Subir 30 prendas toma una tarde | **Carga por lotes**: elige categoría, N fotos por prenda y precio del lote → selecciona todas las fotos de una vez. Solo falta tocar la talla |
| Fotos de 4 MB con datos móviles | Las fotos se **comprimen en el teléfono** (~150 KB) antes de subir |
| Fotos mal agrupadas | Tocar una foto → "pasar a la prenda anterior" o "separar como prenda nueva" |
| Saber qué falta | Cada categoría muestra cuántas prendas hay y cuántas están incompletas. Las incompletas no se publican |
| Muchos compradores pagan por transferencia | Transferencia con **2 h de reserva**; él confirma el pago desde el panel |
| La hora de publicación | **Programar cada categoría** a las 20:00: cuenta regresiva en la tienda y formulario "Avísame" |
| Lo que no se vende | Liquidación con descuento en "Últimas piezas" hasta el drop siguiente |
| El martes de despacho | Pedidos agrupados por martes, copiar todas las direcciones de una vez |
| Las DMs "¿qué medidas tiene?" | Medidas en plano (ancho/largo) en cada ficha + botón de WhatsApp con la prenda ya escrita |
| Comprar rápido en el segundo drop | Se recuerdan los datos del comprador |
| Prueba social | Las vendidas siguen visibles con "Vendida" y barra de progreso del drop |

## 3. Crítica constructiva al planteamiento

**3.1 "En un servidor, no en WordPress" está bien, pero falta la comparación que importa: contra Shopify o Jumpseller.**
WordPress + WooCommerce sería la peor opción para drops (lento, plugins, maneja mal el stock simultáneo).
Pero una tienda en Shopify o Jumpseller con un tema bien hecho sale en un fin de semana y no la tienes que
mantener tú. Desarrollo a medida se justifica si se cumplen las dos condiciones:

1. La experiencia de drop (reserva con temporizador, lanzamiento programado, carga por lotes desde el
   teléfono) es lo que diferencia la tienda, **y**
2. Lo conviertes en un **producto de Aqua Studio** que puedas vender a otras marcas de Instagram (hay muchas en
   Chile). Por eso todo lo que cambia por marca está aislado en `lib/config.ts`.

Si es solo un favor puntual, con desarrollo propio te conviertes en soporte gratis de un sistema que cobra
dinero. Conviene decidirlo antes de seguir.

**3.2 "Servidor" no debería significar un VPS que administres tú.** Si el servidor se cae a las 20:00 del día del
drop, el que contesta eres tú. Recomiendo serverless administrado (Vercel + Supabase, que ya tienes
conectados): sin parches, con respaldos y escalado automático para el pico del lanzamiento.

**3.3 El riesgo técnico más grande no es el diseño, es la concurrencia.** Con 50 personas entrando al mismo
tiempo a la misma prenda, la regla "solo uno la puede reservar" tiene que vivir en la base de datos, no en el
navegador. El prototipo modela la regla; en producción es esto:

```sql
update products
set reserved_by = $1, reserved_until = now() + interval '10 minutes'
where id = $2
  and sold = false
  and (reserved_until is null or reserved_until < now() or reserved_by = $1)
returning id;   -- 0 filas = otra persona la reservó primero
```

**3.4 "Cobro los martes" no debería seguir así con la web.** Si hoy apartas por DM y cobras el martes, con
prendas únicas eso significa tener la prenda bloqueada varios días sin saber si te van a pagar; si no paga,
perdiste la venta y el momento del drop. En la web se cobra al comprar (tarjeta al tiro, o transferencia con 2 h
de plazo) y **el martes queda solo para despachar**. Es el cambio de proceso más importante.

**3.5 Faltan decisiones de negocio que pesan más que la UI**: medio de pago, envíos, boleta, cambios. Ver
preguntas abajo.

**3.6 Define cómo vas a medir si funcionó**, antes de construir:
- Tiempo para cargar una categoría de 25 prendas (meta: < 30 min desde el teléfono).
- % de sobrantes por drop (hoy "siempre sobran": medirlo permite ajustar cuánto comprar en fardos).
- % del drop vendido en las primeras 24 h.
- Conversión visitas desde Instagram → compra.
- Menos DMs repitiendo "¿precio?", "¿medidas?", "¿aún está?".

## 4. Arquitectura propuesta (producción)

- **Next.js** (el mismo stack de Aqua Studio) en **Vercel**.
- **Supabase**: Postgres (drops, prendas, pedidos), Storage (fotos), Auth (magic link solo para la marca),
  Realtime (que "Vendida" aparezca al instante a todos durante el drop).
- **Pagos**: Mercado Pago Checkout Pro o Flow (Webpay + otros). El pago se confirma por **webhook** del
  proveedor, nunca porque el navegador lo diga.
- **Automatizaciones con n8n** (ya lo usas):
  - Pedido nuevo → aviso por WhatsApp/Telegram a la marca.
  - Pago confirmado → WhatsApp/email al comprador con el resumen.
  - 15 min antes del drop → aviso a la lista de "Avísame".
- **Panel como PWA**: se instala en la pantalla de inicio del teléfono como una app.

Costos a validar antes de cotizar: plan comercial de Vercel (el plan gratuito no permite uso comercial), plan
de Supabase y comisión por venta de la pasarela. Compáralo con la mensualidad de Shopify o Jumpseller para
presentarle números honestos al cliente.

## 5. Fases

| Fase | Qué | Resultado |
| --- | --- | --- |
| 0 · Ahora | Este prototipo | Validar con él: que cargue un drop real con sus fotos en su teléfono y cronometrarlo |
| 1 · MVP (2–3 semanas) | Supabase, login, pagos con webhook, emails, realtime, dominio | Primer drop real |
| 2 · Automatización | n8n (avisos, notificaciones), historias de Instagram generadas por prenda, IA que sugiere nombre/categoría desde la foto | Menos trabajo manual por drop |
| 3 · Producto | Multi-marca: una instalación, varias tiendas | Producto vendible de Aqua Studio |

## 6. Preguntas que siguen abiertas

1. **Nombre, logo, colores, dominio y usuario de Instagram.** El demo usa "ARCHIVO" como placeholder.
2. **Fotos reales**: 15–20 fotos de un drop anterior para reemplazar las ilustraciones del demo.
3. **¿Tiene inicio de actividades y emite boleta?** Si emite, hay que integrar boleta electrónica.
4. **Courier y precios de envío reales** (el demo usa $3.990 Santiago / $5.990 regiones).
5. **Cambios y devoluciones**: el texto de `/ayuda` es una propuesta. En compras online en Chile rige el derecho
   a retracto salvo que se excluya expresamente; hay que decidirlo y mostrarlo antes de pagar.
6. **¿Medio de pago?** Mercado Pago o Flow (tarjeta) + transferencia.
