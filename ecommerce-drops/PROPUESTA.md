# Propuesta — E-commerce por drops

## 1. Lo que aprendimos del proceso del cliente

> "Primero saco las fotos y las subo por partes: a veces los pantalones, después los polerones y después las
> poleras. Normalmente lo separo por días, dependiendo de si tengo tiempo."

Esto define el diseño más que cualquier pantalla: **subir y lanzar tienen que ser dos cosas separadas.**

- **Subir** pasa en varios días, por categoría, desde el teléfono, en ratos libres → todo queda como borrador.
- **Lanzar** pasa una vez, a una hora anunciada → todo se publica junto y se genera el "evento" del drop.

Si se publica a medida que se sube, se pierde el efecto drop: el tráfico de Instagram llega disperso y no hay
momento que anunciar.

## 2. Qué resuelve el prototipo

| Problema | Solución en el prototipo |
| --- | --- |
| Dos personas compran la misma prenda única | Al agregar al carrito, la prenda queda **reservada 10 min** para esa persona. Los demás ven "en un carrito · 06:12" |
| Subir 30 prendas toma una tarde | **Carga por lotes**: elige categoría, N fotos por prenda y precio del lote → selecciona todas las fotos de una vez. Solo falta tocar la talla |
| Fotos de 4 MB con datos móviles | Las fotos se **comprimen en el teléfono** (~150 KB) antes de subir |
| Fotos mal agrupadas | Tocar una foto → "pasar a la prenda anterior" o "separar como prenda nueva" |
| Saber qué falta | Cada categoría muestra cuántas prendas hay y cuántas están incompletas. Las incompletas no se publican |
| Muchos compradores pagan por transferencia | Transferencia con **2 h de reserva**; él confirma el pago desde el panel |
| La hora del lanzamiento | **Programar** el drop: cuenta regresiva en la tienda y formulario "Avísame" |
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

**3.4 Faltan decisiones de negocio que pesan más que la UI**: medio de pago, envíos, boleta, cambios. Ver
preguntas abajo.

**3.5 Define cómo vas a medir si funcionó**, antes de construir:
- Tiempo para cargar un drop de 20 prendas (meta: < 30 min desde el teléfono).
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

## 6. Preguntas para él (por orden de impacto)

1. **¿Todas las prendas son únicas (stock 1) o a veces repite un modelo en varias tallas?** El prototipo asume
   únicas; si repite, hay que agregar variantes.
2. **¿Es ropa vintage/segunda mano o diseño propio?** Cambia los campos (estado, medidas) y el tono.
3. **¿Cuántas prendas por drop, cada cuánto y en cuánto tiempo se agotan hoy?** Define si hace falta una fila
   virtual en el lanzamiento.
4. **¿Lanza todo junto a una hora o prefiere ir publicando cada categoría cuando la termina?** Recomiendo todo
   junto; si no, se agrega "publicar esta categoría".
5. **¿Cuántas fotos saca por prenda, en qué orden y las edita antes?** Define el agrupado automático.
6. **¿Cómo cobra hoy?** ¿Transferencia, Mercado Pago? ¿Tiene inicio de actividades y emite boleta? Si emite,
   hay que integrar boleta electrónica.
7. **¿Cómo envía?** Courier, retiro, ¿precio fijo o por pagar?
8. **¿Acepta cambios o devoluciones?** En compras online en Chile rige el derecho a retracto salvo que se
   excluya expresamente; hay que definirlo y mostrarlo antes de pagar.
9. **¿Administra solo él, desde el celular?**
10. **Nombre, logo, colores, dominio y usuario de Instagram.** El prototipo usa "ARCHIVO" como placeholder.
