# Aqua Studio — 03_ESTANDAR_CALIDAD.md (V1 Elite)
> Estándares exigentes para una web **premium**, **rápida**, **accesible**, **SEO-first** y **mantenible**, alineada con el MVP (V4) y la arquitectura (V4 Elite).

---

## 0) Alcance y Principios
- **Páginas cubiertas**: Home (9 secciones MVP) + rutas técnicas (`/robots.txt`, `/sitemap.xml`) + API leads.
- **Principios**: Mobile-first · Semántica estricta · A11y AA · Performance Budget · SEO técnico · Código limpio y tipado.
- **Paleta** (tokens Tailwind):  
  `brand.deep #0D2A3A` · `brand.aqua #1F4F64` · `brand.waves #3B6F84` · `brand.pearl #F7F9FC` · `brand.bright #00C2FF`.

---

## 1) Métricas Objetivo (medibles)
- **Performance** (Lighthouse Desktop):
  - **Performance ≥ 90**, **Best Practices ≥ 95**, **SEO ≥ 95**, **A11y ≥ 95**.
  - **FCP ≤ 1.5s**, **TTFB ≤ 0.5s**, **LCP ≤ 2.5s**, **CLS ≤ 0.02**, **INP ≤ 200ms**.
- **Peso Home**: JS < **130KB** (gz), CSS < **50KB** (gz), imagen **Hero ≤ 350KB**.
- **Accesibilidad**: 0 errores críticos en AXE/Deque; foco visible en todos los CTAs; navegación por teclado full.
- **SEO**: Índice de cobertura sin errores; Rich Results válidos; `sitemap.xml` y `robots.txt` correctos.

---

## 2) Accesibilidad (A11y AA)
**Estructura y semántica**
- `h1` **único** en Hero; jerarquía correcta `h2`/`h3` por secciones.
- `header`/`main[role="main"]`/`section[aria-labelledby]`/`footer` utilizados correctamente.
- **Listas** con `role="list"` si se customizan bullets.

**Colores y contraste**
- Texto sobre imagen/fondo oscuro: `brand.pearl` con **contraste ≥ 4.5:1**.
- Overlays en Hero: **obligatorio** `bg-brand-aqua/35` + gradiente para legibilidad.

**Teclado y foco**
- Todos los controles alcanzables con **Tab**; **orden lógico**.
- Estados de foco: `focus-visible:ring-2` (color coherente con tokens).
- **Tamaño objetivo** mínimo 44x44 px en CTAs y enlaces de acción.

**Multimedia e imágenes**
- `alt` descriptivo y conciso; decorativas con `alt=""`.
- `next/image` con `priority` solo en Hero; resto lazy por defecto.

**Movimiento**
- Respetar `prefers-reduced-motion`. Evitar animaciones intrusivas.

**Mensajes y formularios**
- Inputs con `label` o `aria-label`.
- Errores y success con texto visible y anuncio para lectores (ej. `role="status"`).

---

## 3) Performance (Budget & técnicas)
**Carga crítica**
- Solo dependencias core de Next + Tailwind (V1 **sin** libs extra).
- Evitar componentes pesados en Above-the-fold.

**Imágenes**
- Hero: `next/image` `fill`, `priority`, `sizes="100vw"`, **≤ 350KB** (mozjpeg/oxipng).
- Mantener **1x** imagen hero; no usar videos en V1.

**CSS/JS**
- Tailwind purge activo (`content` bien configurado).
- Evitar utilidades duplicadas; extraer patrones comunes a componentes.
- **Sin** `any` en TS (strict) y sin polyfills innecesarios.

**Web Vitals**
- Auditar LCP (Hero H1/imagen); minimizar reflow (evitar layout shifts).
- **CLS**: reservar espacio de imágenes; fuentes via `next/font` para evitar FOIT.

---

## 4) SEO técnico (On-page y metadatos)
**Metadatos**
- `metadata` Next con: `title`, `description`, `openGraph`, `twitter`, `robots`, `alternates.canonical`.
- `viewport`: `width=device-width, initialScale=1, themeColor=#0D2A3A`.

**Estructurados (JSON-LD)**
- `Organization` + `WebSite` (SearchAction opcional).
- Validar con Rich Results; **sin duplicaciones** de tipos.

**Rutas técnicas**
- `/robots.txt` con `Allow: /` y `Sitemap: https://dominio/sitemap.xml`.
- `/sitemap.xml` actualizado (Home V1; ampliar a blog/portfolio en V2).

**Contenido y headings**
- Un solo `h1` por página; secciones con `h2` descriptivos y escaneables.
- Enlaces internos: densidad natural, anchor text descriptivo.

---

## 5) Responsividad & Layout
- Breakpoints: `sm`/`md`/`lg`/`xl`/`2xl`; **sin scroll horizontal** en 320–1440px.
- Grids: beneficios/servicios en 1-col (mobile), 2/3-col (md+).
- Container Tailwind centrado; paddings `px-4 md:px-6`.
- Spacing consistente **8/16/24**.

---

## 6) UX/UI & Branding
**Hero**
- Fondo **brand.deep** + overlay **brand.aqua/35** + gradiente; tipografía en **brand.pearl**.
- H1 serif premium (via `next/font`); subtítulo legible (pearl/90).
- CTAs pill:
  - Primario: `bg-brand-bright` + `text-brand-deep` + `shadow-soft`.
  - Secundario: borde **white/60** + hover `bg-white/10`.

**Componentes**
- Cards con `rounded-2xl` + `border-zinc-200` + `shadow-sm`.
- Chips de métricas (portfolio) con `brand.waves`.

**Microcopy**
- Enlaces y CTAs con verbos de acción, micro-beneficio y contexto.

---

## 7) Código & Arquitectura (calidad)
- **TypeScript estricto**: sin `any`, tipos para props y datos (`services`, `caseStudies`).
- Componentes puros, sin side-effects; props mínimas y coherentes.
- Semántica: `figure/blockquote/figcaption` en testimonios; `ul/li` para listas.
- **Sin** warnings de build; ESLint/TS limpio.
- `app/api/leads/route.ts`: validar inputs y manejar errores; no loggear datos sensibles.

---

## 8) Seguridad & Privacidad
- Variables en `.env.local` (ej. `N8N_WEBHOOK_URL`) — **no** subir a git.
- Formularios: sanitizar campos en server route; limitar tamaño del body.
- Links externos con `rel="noopener noreferrer"` cuando `target="_blank"`.
- Cookies/analytics: modo **consent-aware** (V2); no PII en logs.

---

## 9) Analítica & Observabilidad (V2 sugerido)
- Web Vitals (Next/Vercel) + dashboard de métricas de conversión.
- Eventos: clic en CTAs hero/servicios/CTA intermedio; envío lead.
- UTM tracking en enlaces de campaña.

---

## 10) QA Manual (pasos)
- **Responsive**: iPhone SE, Pixel 5, iPad, 1440px (sin overflow).
- **Teclado**: Tab ↔ Shift+Tab por toda la página; foco siempre visible.
- **Contraste**: verificar hero y botones con contrast checker.
- **Lighthouse** (Desktop): ≥ objetivos; revisar oportunidades.
- **Links**: sin rotos (hero → planes/portfolio/contacto).
- **Form**: envío OK y mensaje de éxito/fracaso accesible.

---

## 11) QA Automatizable (para Prompt de verificación)
Aplicar diffs hasta cumplir todos los checks.

**Accesibilidad**
- [ ] `role="main"` presente en `layout.tsx`.
- [ ] `h1` **único** en `page.tsx`.
- [ ] CTAs con `focus-visible:ring-2`.
- [ ] Listas con `role="list"` (si reemplazan bullets).
- [ ] Imágenes con `alt` (no vacío salvo decorativas).

**Performance**
- [ ] `next/image` en Hero con `priority` y `sizes="100vw"`.
- [ ] `hero-water.jpg ≤ 350KB`.
- [ ] Sin dependencias extra (package.json).

**SEO**
- [ ] `metadata` completo y canonical configurado.
- [ ] JSON-LD `Organization`/`WebSite` válido.
- [ ] `/robots.txt` y `/sitemap.xml` responden 200.

**UX/UI**
- [ ] Spacing 8/16/24 coherente.
- [ ] Tokens de marca en uso (sin `#hex` sueltos).
- [ ] CTAs pill con estilos alineados a paleta.

**Código**
- [ ] TS estricto, sin `any`.
- [ ] 0 warnings build/console.
- [ ] Componentes puros y tipados.

---

## 12) Diffs de referencia (formato unified)
> Ejemplo de corrección de foco en CTAs del Hero

```diff
- <a href="#contacto" className="rounded-full border border-white/60 px-6 py-3 text-white hover:bg-white/10">
+ <a href="#contacto" className="rounded-full border border-white/60 px-6 py-3 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
    Ver proyectos en acción
  </a>
