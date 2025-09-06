# Aqua Studio — ARQUITECTURA (V4 • Elite, lista para pegar)

> Máxima claridad + escalabilidad con el MVP dado. Copia-pega tal cual en tu repo; incluye estructura, patrones, snippets clave y criterios de calidad.

---

## 🛠️ Stack & Principios
- **Next.js 14 (App Router)** + **TypeScript** + **Tailwind CSS**
- **next/image** (optimización hero), **next/script** (JSON-LD)
- **Sin librerías extra en V1** (rápido y mantenible)
- **Principios**: mobile-first, semántica estricta, performance budget, A11y AA, SEO técnico sólido, DX simple para iterar.

---

## 📂 Estructura de Proyecto (V1)

```
aqua-studio/
├─ app/
│  ├─ layout.tsx                # HTML base, metadatos, fuentes, <main role="main">
│  ├─ page.tsx                  # Home con 9 secciones (MVP)
│  ├─ api/
│  │  └─ leads/route.ts         # Endpoint server actions (captura de lead)
│  ├─ robots.txt/route.ts       # Robots dinámico
│  ├─ sitemap.xml/route.ts      # Sitemap básico (Home por ahora)
│  └─ globals.css               # Tailwind + resets y utilidades globales
├─ components/
│  ├─ Button.tsx                # Botón (primary/ghost/link)
│  ├─ Section.tsx               # Wrapper semántico + spacing + anchors
│  ├─ PlanCard.tsx              # Card de servicios/planes
│  ├─ Testimonial.tsx           # Figure/blockquote/figcaption
│  └─ MetricsChip.tsx           # Chip para métricas (+312% leads)
├─ data/
│  ├─ services.ts               # Aqua Growth/Scale/Custom (title, desc, bullets, cta)
│  └─ case-studies.ts           # Cases (title, metric, summary, href?)
├─ lib/
│  ├─ seo.ts                    # Helpers SEO/JSON-LD
│  └─ validations.ts            # Zod-like simple (sin dependencia) para inputs
├─ public/
│  ├─ hero-water.jpg            # Imagen optimizada Hero (≤350KB)
│  └─ logo.png
├─ tailwind.config.ts           # Tokens de marca + container
├─ tsconfig.json
└─ package.json
```

---

## 🎨 Tokens & Theme (Tailwind)

**`tailwind.config.ts` (trozo clave)**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { xl: "1280px", "2xl": "1440px" } },
    extend: {
      colors: {
        brand: {
          deep:   "#0D2A3A", // 🌊 fondo hero / secciones oscuras
          aqua:   "#1F4F64", // 💧 overlay / gradientes
          waves:  "#3B6F84", // 🔹 hovers / bordes / detalles
          pearl:  "#F7F9FC", // ⚪ tipografía sobre oscuro
          bright: "#00C2FF", // 🟦 CTAs / enlaces
        },
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem", full: "9999px" },
      boxShadow: { soft: "0 6px 24px -6px rgba(0,0,0,.35)" },
    },
  },
  plugins: [],
} satisfies Config;
```

> **Tipografía**: usa `next/font` (serif para títulos, sans para texto) en `layout.tsx`.

---

## 🧱 Layout base (metadatos + fuentes + semántica)

**`app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Spectral, Inter } from "next/font/google";

const serif = Spectral({ subsets: ["latin"], weight: ["600","700"], variable: "--font-serif" });
const sans  = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aqua Studio — Donde el diseño fluye y la estrategia convierte",
  description: "Estudio boutique premium: diseño web, estrategia digital y automatización.",
  metadataBase: new URL("https://aqua.studio"), // ajustar al publicar
  openGraph: {
    title: "Aqua Studio — Diseño que fluye y convierte",
    description: "Diseño premium, funnels y estrategia inteligente.",
    url: "https://aqua.studio",
    siteName: "Aqua Studio",
    type: "website",
    locale: "es_CL",
  },
  twitter: { card: "summary_large_image", title: "Aqua Studio", description: "Premium web + automation" },
  alternates: { canonical: "https://aqua.studio" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D2A3A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${sans.variable} min-h-dvh bg-white text-zinc-900 antialiased`}>
        <main className="container mx-auto px-4 md:px-6" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
```

**`app/globals.css` (arriba del todo añade):**

```css
:root { --font-serif: ui-serif, Georgia, "Times New Roman", serif; --font-sans: ui-sans-serif, system-ui, -apple-system; }
html:focus-within { scroll-behavior: smooth; }
```

---

## 🧩 Patrones de UI (componentes)

**`components/Button.tsx`**

```tsx
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "link";
};

export default function Button({ variant="primary", className="", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2";
  const variants = {
    primary: "bg-brand-bright text-brand-deep shadow-soft hover:bg-brand-bright/90 focus-visible:ring-brand-bright",
    ghost:   "border border-white/60 text-white hover:bg-white/10 focus-visible:ring-white/50",
    link:    "underline underline-offset-4 text-brand-bright hover:opacity-90 focus-visible:ring-brand-bright/40",
  } as const;
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
```

**`components/Section.tsx`**

```tsx
export default function Section(props: React.ComponentProps<"section">) {
  const { className = "", ...rest } = props;
  return <section className={`py-16 md:py-24 ${className}`} {...rest} />;
}
```

**`components/PlanCard.tsx`**

```tsx
type PlanCardProps = {
  title: string; price: string; period?: string; bullets: string[]; ctaLabel: string; href?: string;
};
export default function PlanCard({ title, price, period="/mes", bullets, ctaLabel, href="#contacto" }: PlanCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <header className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-3xl font-semibold">{price} <span className="text-base font-normal text-zinc-500">{period}</span></p>
      </header>
      <ul role="list" className="mt-4 space-y-2 text-sm text-zinc-700">
        {bullets.map((b,i)=>(
          <li key={i} className="flex items-start gap-2">
            <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-bright" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <a href={href} aria-label={`${ctaLabel} para el plan ${title}`}
           className="inline-flex w-full items-center justify-center rounded-xl bg-brand-deep px-4 py-3 text-brand-pearl shadow-sm hover:bg-brand-deep/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-waves">
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}
```

**`components/Testimonial.tsx`**

```tsx
type TProps = { quote: string; author: string; role?: string; };
export default function Testimonial({ quote, author, role }: TProps) {
  return (
    <figure className="rounded-2xl border border-zinc-200 bg-white p-6">
      <blockquote className="text-zinc-800">"{quote}"</blockquote>
      <figcaption className="mt-4 text-sm text-zinc-600">— {author}{role ? `, ${role}` : ""}</figcaption>
    </figure>
  );
}
```

**`components/MetricsChip.tsx`**

```tsx
export default function MetricsChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-brand-waves/40 bg-brand-waves/10 px-3 py-1 text-xs text-brand-waves">{children}</span>;
}
```

---

## 📑 Modelo de contenido (data)

**`data/services.ts`**

```ts
export const services = [
  {
    key: "growth",
    title: "Aqua Growth",
    description: "Web multipágina con SEO optimizado e integraciones inteligentes. Base sólida, lista para escalar.",
    bullets: ["Arquitectura SEO", "Integraciones esenciales", "Performance AA"],
    cta: { label: "Solicitar propuesta", href: "#contacto" },
  },
  {
    key: "scale",
    title: "Aqua Scale",
    description: "Web + e-commerce + funnels automatizados + dashboard de métricas. Crecimiento en serio.",
    bullets: ["E-commerce", "Funnels nativos", "Dashboard KPIs"],
    cta: { label: "Solicitar propuesta", href: "#contacto" },
  },
  {
    key: "custom",
    title: "Aqua Custom",
    description: "Proyectos a medida para exclusividad digital absoluta.",
    bullets: ["Diseño a medida", "Integraciones avanzadas", "Acompañamiento estratégico"],
    cta: { label: "Solicitar propuesta", href: "#contacto" },
  },
] as const;
```

**`data/case-studies.ts`**

```ts
export const caseStudies = [
  { title: "Marca X", metric: "+312% leads / 90 días", summary: "Web optimizada + funnel automatizado.", href: "#" },
];
```

---

## 🧠 Home (estructura de secciones)

**`app/page.tsx`** (esqueleto listo para implementar MVP)

```tsx
import Image from "next/image";
import Script from "next/script";
import Section from "@/components/Section";
import Button from "@/components/Button";
import PlanCard from "@/components/PlanCard";
import Testimonial from "@/components/Testimonial";
import MetricsChip from "@/components/MetricsChip";
import { services } from "@/data/services";

export default function HomePage() {
  return (
    <>
      {/* JSON-LD */}
      <Script id="jsonld-org" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Aqua Studio",
          "url": "https://aqua.studio",
          "logo": "https://aqua.studio/logo.png"
        })}
      </Script>

      {/* 1) HERO */}
      <section className="relative isolate overflow-hidden bg-brand-deep" aria-labelledby="hero-title">
        <div className="absolute inset-0 -z-10">
          <Image src="/hero-water.jpg" alt="Superficie de agua con ondas" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-brand-aqua/35" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" aria-hidden />
        </div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto flex min-h-[68vh] max-w-4xl flex-col items-center justify-center py-20 text-center sm:py-28">
            <h1 id="hero-title" className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-brand-pearl md:text-6xl">
              Diseñamos webs que fluyen y convierten.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-brand-pearl/90 md:text-lg">
              En Aqua Studio creamos experiencias digitales premium: diseño elegante, funnels automatizados y estrategia inteligente que transforman clics en clientes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="primary" aria-label="Agenda tu diagnóstico gratuito">Agenda tu diagnóstico gratuito</Button>
              <a href="#portfolio" className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                Ver proyectos en acción
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2) BENEFICIOS */}
      <Section aria-labelledby="beneficios-title">
        <h2 id="beneficios-title" className="text-2xl font-semibold tracking-tight md:text-3xl">Más que diseño, creamos sistemas digitales vivos.</h2>
        <p className="mt-4 max-w-2xl text-zinc-600">
          Cada detalle de tu web debe trabajar a tu favor: atraer, convencer y vender. Combinamos estética premium, estrategia y automatización inteligente para que tu negocio fluya hacia el crecimiento.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { t: "Diseño UX/UI premium", d: "Belleza con propósito." },
            { t: "Automatización 24/7", d: "Tu web trabajando mientras duermes." },
            { t: "Estrategia escalable", d: "Sistemas que crecen contigo." },
            { t: "SEO optimizado", d: "Aparécete donde te buscan." },
            { t: "Acompañamiento estratégico", d: "Socio digital, no proveedor." },
          ].map((b)=>(
            <div key={b.t} className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="text-lg font-semibold">{b.t}</h3>
              <p className="mt-2 text-zinc-600">{b.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a href="#servicios" className="text-brand-bright underline underline-offset-4">Descubre cómo escalamos marcas</a>
        </div>
      </Section>

      {/* 3) SERVICIOS ESTRELLA */}
      <Section id="servicios" aria-labelledby="servicios-title">
        <h2 id="servicios-title" className="text-2xl font-semibold tracking-tight md:text-3xl">Soluciones digitales diseñadas para crecer contigo.</h2>
        <p className="mt-4 max-w-2xl text-zinc-600">Servicios pensados para cubrir etapas clave del crecimiento.</p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {services.map(s=>(
            <div key={s.key} className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-zinc-600">{s.description}</p>
              <ul role="list" className="mt-4 space-y-2 text-sm text-zinc-700">
                {s.bullets.map((b,i)=>(
                  <li key={i} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-waves" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <a href={s.cta.href} className="inline-flex items-center justify-center rounded-xl bg-brand-deep px-4 py-3 text-brand-pearl hover:bg-brand-deep/90">{s.cta.label}</a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4) CASOS DE ÉXITO / PORTFOLIO (placeholder V1) */}
      <Section id="portfolio" aria-labelledby="portfolio-title">
        <h2 id="portfolio-title" className="text-2xl font-semibold tracking-tight md:text-3xl">Historias reales de marcas que fluyen con Aqua.</h2>
        <p className="mt-4 max-w-2xl text-zinc-600">Más que webs, ecosistemas digitales que convierten.</p>
        <div className="mt-6"><MetricsChip>+312% de leads en 90 días</MetricsChip></div>
        <div className="mt-8">
          <a href="#" className="text-brand-bright underline underline-offset-4">Explora proyectos transformadores</a>
        </div>
      </Section>

      {/* 5) TESTIMONIOS */}
      <Section aria-labelledby="testimonios-title">
        <h2 id="testimonios-title" className="text-2xl font-semibold tracking-tight md:text-3xl">Lo dicen ellos, no nosotros.</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Testimonial quote="Antes teníamos una web bonita pero inservible. Con Aqua Studio ahora generamos clientes de manera constante y nuestra marca se ve como siempre soñamos." author="Mariana G." role="CEO" />
          {/* Agregar más testimonios */}
        </div>
        <div className="mt-8">
          <a href="#contacto" className="text-brand-bright underline underline-offset-4">Agenda tu diagnóstico hoy mismo</a>
        </div>
      </Section>

      {/* 6) BLOG / RECURSOS (placeholder V1) */}
      <Section aria-labelledby="blog-title">
        <h2 id="blog-title" className="text-2xl font-semibold tracking-tight md:text-3xl">Aprende, inspira y crece con nosotros.</h2>
        <p className="mt-4 max-w-2xl text-zinc-600">Tendencias, tips y estrategias reales de diseño, automatización y marketing digital.</p>
        <div className="mt-8">
          <a href="#" className="text-brand-bright underline underline-offset-4">Leer artículos y guías</a>
        </div>
      </Section>

      {/* 7) CTA INTERMEDIO */}
      <Section aria-labelledby="cta-title" className="bg-brand-deep rounded-2xl text-brand-pearl">
        <div className="px-6 md:px-10 py-10 md:py-14">
          <h2 id="cta-title" className="text-2xl font-semibold tracking-tight md:text-3xl">¿Listo para transformar tu web en un sistema que vende?</h2>
          <p className="mt-4 max-w-2xl text-brand-pearl/90">Cada día sin un ecosistema digital sólido es una oportunidad perdida. Empieza hoy.</p>
          <div className="mt-6">
            <Button variant="primary" aria-label="Agenda tu diagnóstico gratuito ahora">Agenda tu diagnóstico gratuito ahora</Button>
          </div>
        </div>
      </Section>

      {/* 8) SOBRE NOSOTROS */}
      <Section aria-labelledby="about-title">
        <h2 id="about-title" className="text-2xl font-semibold tracking-tight md:text-3xl">Inspirados en la fluidez, movidos por el crecimiento.</h2>
        <p className="mt-4 max-w-2xl text-zinc-600">Creamos experiencias digitales que combinan belleza, estrategia y resultados. Como el agua: fluyen, se adaptan y no se detienen.</p>
        <div className="mt-8">
          <a href="#" className="text-brand-bright underline underline-offset-4">Conoce nuestra filosofía</a>
        </div>
      </Section>

      {/* 9) FOOTER PREMIUM */}
      <footer className="py-12 border-t border-zinc-200">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-zinc-600">Aqua Studio – Donde el diseño fluye y la estrategia convierte.</p>
          </div>
          <nav className="text-sm">
            <ul role="list" className="flex flex-wrap gap-4 text-zinc-700">
              <li><a href="#servicios" className="hover:underline">Servicios</a></li>
              <li><a href="#portfolio" className="hover:underline">Portfolio</a></li>
              <li><a href="#blog" className="hover:underline">Blog</a></li>
              <li><a href="#contacto" className="hover:underline">Contacto</a></li>
            </ul>
          </nav>
          <div>
            <form className="flex items-center gap-2">
              <input type="email" required placeholder="Tu email"
                     className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-waves" />
              <button className="rounded-xl bg-brand-deep px-3 py-2 text-sm text-brand-pearl hover:bg-brand-deep/90">Unirme</button>
            </form>
            <p className="mt-2 text-xs text-zinc-500">Únete a nuestra comunidad premium y recibe estrategias exclusivas en tu inbox.</p>
          </div>
        </div>
      </footer>

      {/* Anchor contacto */}
      <div id="contacto" className="sr-only" aria-hidden />
    </>
  );
}
```

---

## 🔐 API de Leads (server route mínima)

**`app/api/leads/route.ts`** *(placeholder sin libs; ajusta a tu N8n/CRM)*

```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email) return NextResponse.json({ ok: false, error: "Email requerido" }, { status: 400 });

  // TODO: Enlazar con N8n/CRM (fetch POST a tu webhook)
  // await fetch(process.env.N8N_WEBHOOK_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  return NextResponse.json({ ok: true });
}
```

> Variables seguras: `N8N_WEBHOOK_URL` en `.env.local` (no subir a git).

---

## 🔎 SEO Técnico extra (rutas dinámicas)

**`app/robots.txt/route.ts`**

```ts
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: https://aqua.studio/sitemap.xml`, { headers: { "Content-Type": "text/plain" } });
}
```

**`app/sitemap.xml/route.ts`** *(Home por ahora)*

```ts
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://aqua.studio/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  </urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
```

---

## ♿ Accesibilidad (A11y) — Reglas que cumplimos

* H1 único, jerarquía correcta H2/H3
* Contraste AA en hero: `overlay + text-brand-pearl`
* `focus-visible:ring-2` en CTAs
* Área clicable ≥44px
* Listas con `role="list"`, imágenes con `alt` claro
* Navegación por teclado sin trampas de foco

---

## ⚡ Performance Budget (Home)

* **FCP objetivo** ≤ 1.5s (4G)
* **Imagen hero** ≤ 350KB, `priority`, `sizes="100vw"`
* Sin dependencias extra en V1
* Lighthouse Desktop **≥ 90** (Performance/SEO/Best/A11y)

---

## ✅ Definition of Done (DoD)

* Sin overflow horizontal (320–1440px)
* Focus navegable por teclado
* 0 errores TS, 0 warnings en build
* Metadatos OG/Twitter/canonical OK
* JSON-LD válido (Organization)
* Form de footer funcionando contra `/api/leads` o N8n
* Deploy en Vercel + dominio conectado

---

## 🚀 Deploy (Vercel)

1. Importar repo → Framework: **Next.js** → Build por defecto
2. Validar preview: hero, focus, Lighthouse
3. Conectar dominio `aqua.studio` y canonical
4. Añadir `N8N_WEBHOOK_URL` en Variables del proyecto (si aplica)

---
