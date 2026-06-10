# PROMPT PARA CLAUDE DESIGN — Web Araneda Office (v2 Multi-nicho)

## Instrucción principal

Crea un sitio web multi-página para **Araneda Office**, un growth partner con IA que ofrece soluciones digitales para distintas industrias en Chile. El sitio tiene un **Home general** (la empresa y sus servicios) + **páginas por nicho** (empezando con firmas profesionales). Dark mode, premium, minimalista, orientado a conversión. Tecnología: React con JSX + routing por hash (#), CSS moderno, responsive.

---

## CONTEXTO DE MARCA

**Nombre:** Araneda Office
**Modelo:** Growth partner con IA. Empresa con fundador visible (Juan Araneda como cara).
**Qué ofrece:** Soluciones de crecimiento digital potenciadas por IA — automatizaciones, páginas web, marketing digital y consultoría estratégica.
**Para quién:** Empresas y negocios que necesitan crecer digitalmente. Múltiples nichos, empezando por firmas profesionales B2B.
**Propuesta de valor general:** "Hacemos crecer tu negocio con IA. Automatizaciones, web y marketing digital — todo en un solo lugar."
**Tono:** Premium, confiable, directo, cercano. Sin lenguaje de agencia grande. Juan es una persona, y eso es su ventaja.
**Diferenciador:** "Growth partner, no agencia. Trabajo directo contigo. IA aplicada a resultados reales, no buzzwords."
**Metodología:** "Método FLUJO" — Fundación → Landing → Unificación → Jet (IA) → Optimización.

---

## IDENTIDAD VISUAL

- **Modo:** Dark (fondo #0a0a0a o similar negro profundo)
- **Color primario/acento:** Azul (#3B82F6) con degradados sutiles hacia púrpura (#8B5CF6)
- **Tipografía headings:** Plus Jakarta Sans o Inter (font-weight 700-800)
- **Tipografía body:** DM Sans o Inter (font-weight 400-500)
- **Bordes:** Sutiles (#2a2a2a), cards con background ligeramente elevado (#1a1a1a)
- **Espaciado:** Generoso, mucho aire, secciones con padding 80-120px vertical
- **Estilo:** Inspirado en Linear, Vercel, Stripe. Limpio, sin ornamentos. Glass morphism sutil en navbar.

---

## ARQUITECTURA DEL SITIO

```
HOME (general)          → /
SERVICIOS (general)     → /#servicios (scroll en home)
MÉTODO FLUJO            → /#metodo (scroll en home)
NICHOS                  → /#industrias (scroll en home, con cards que linkan a páginas)
SOBRE MÍ                → /#sobre-mi (scroll en home)

PÁGINA NICHO 1:
FIRMAS PROFESIONALES    → /#firmas-profesionales (página completa separada)

(Futuras páginas de nicho se agregan con la misma estructura)
```

---

## PÁGINA 1: HOME (general)

### 1. NAVBAR (fija, presente en todas las páginas)
- Logo: "Araneda" + "Office" (Office en color acento)
- Links: Inicio | Servicios | Industrias | Sobre mí
- CTA button derecha: "Agenda una llamada" (azul)
- Al hacer scroll: fondo con backdrop-filter blur + borde inferior sutil
- Mobile: hamburguesa con overlay fullscreen

### 2. HERO
- Eyebrow badge: "Growth partner con IA"
- Título H1 (grande, bold): "Hacemos crecer tu negocio con IA"
- Subtítulo: "Automatizaciones inteligentes, páginas web que convierten y marketing digital — todo potenciado por inteligencia artificial. Tu growth partner en Chile."
- CTA primario: "Agenda tu diagnóstico gratuito" (botón azul)
- CTA secundario: "Conoce nuestros servicios" (botón outline/ghost)
- NO poner métricas inventadas, NO poner logos de clientes falsos

### 3. SERVICIOS — Qué hacemos
- Título de sección: "Soluciones digitales con IA para tu negocio"
- Subtítulo: "Combinamos estrategia, tecnología e inteligencia artificial para que tu negocio crezca de forma predecible."
- **4 servicios en grid** (cada uno una card con icono, título, descripción breve):

  **Servicio 1 — Automatizaciones con IA**
  - Icono: ⚡
  - "Eliminamos tareas manuales con flujos inteligentes. Seguimiento de leads, respuestas automáticas, reportes, y más — tu negocio trabaja mientras tú duermes."
  - Tecnologías: n8n, Make, Claude, ChatGPT

  **Servicio 2 — Diseño y desarrollo web**
  - Icono: 🌐
  - "Sitios web profesionales diseñados para convertir visitantes en clientes. SEO, velocidad y diseño premium incluidos."

  **Servicio 3 — Marketing digital**
  - Icono: 📈
  - "Estrategia de posicionamiento, contenido y visibilidad digital. Que tus clientes te encuentren donde buscan."

  **Servicio 4 — Consultoría de growth**
  - Icono: 🎯
  - "Diagnóstico digital, roadmap personalizado y acompañamiento estratégico para escalar tu negocio con datos y tecnología."

- CTA debajo: "¿No sabes por dónde empezar? Agenda un diagnóstico gratuito."

### 4. MÉTODO FLUJO
- Título: "Método FLUJO: nuestro framework de crecimiento"
- Subtítulo: "Un sistema en 5 fases para transformar tu presencia digital — sin importar tu industria."
- 5 pasos, cada uno con la letra del acrónimo destacada en color acento:

  **F — Fundación**
  - "Diagnóstico digital completo. Analizamos tu situación actual, competencia y oportunidades."

  **L — Landing**
  - "Diseñamos y construimos tu presencia web. Optimizada para convertir y posicionar."

  **U — Unificación**
  - "Conectamos tu estrategia: contenido, canales, posicionamiento. Todo alineado."

  **J — Jet (IA)**
  - "Automatizamos procesos con IA: formularios inteligentes, seguimiento de leads, respuestas automáticas."

  **O — Optimización**
  - "Medimos resultados, ajustamos y crecemos. Dashboard con métricas claras."

### 5. INDUSTRIAS — Para quién trabajamos
- Título: "Soluciones especializadas por industria"
- Subtítulo: "Cada industria tiene desafíos únicos. Adaptamos nuestro Método FLUJO a tu sector."
- **Cards de industria en grid** (cada una es clickeable y lleva a la página del nicho):

  **Card 1 — Firmas Profesionales** (activa, con link)
  - Icono/ilustración: ⚖️
  - Título: "Firmas profesionales y consultoras"
  - Descripción: "Consultoras, abogados, contadores, ingenieros. Ayudamos a firmas B2B a dejar de depender de referidos y atraer clientes de forma digital."
  - Badge: "Ver solución →"
  - Link: va a la página /#firmas-profesionales

  **Card 2 — Próximamente** (estilo deshabilitado/coming soon)
  - Icono: 🏪
  - Título: "Comercio y retail"
  - Descripción: "Próximamente — estamos preparando soluciones específicas para este sector."
  - Badge: "Próximamente"

  **Card 3 — Próximamente** (estilo deshabilitado/coming soon)
  - Icono: 🏥
  - Título: "Salud y bienestar"
  - Descripción: "Próximamente"
  - Badge: "Próximamente"

- Nota debajo: "¿Tu industria no aparece? No importa — nuestro Método FLUJO se adapta. Agenda una llamada y conversamos."

### 6. SOBRE MÍ (Juan Araneda)
- Título: "¿Quién está detrás de Araneda Office?"
- Layout: 2 columnas (texto izquierda, valores derecha)
- Copy: "Soy Juan Araneda. Fundé Araneda Office porque creo que toda empresa merece acceso a herramientas de crecimiento con IA — sin necesitar presupuestos de agencia. Trabajo directamente contigo, sin intermediarios ni burocracia."
- Segundo párrafo: "Combino estrategia de marketing con automatización inteligente. Mi enfoque: entender tu negocio, implementar lo que funciona, y medir todo."
- **Valores** (lista con iconos):
  1. "Trato directo" — "Trabajas conmigo, no con un ejecutivo de cuentas."
  2. "IA aplicada" — "Implemento IA para automatizar procesos reales, no como buzzword."
  3. "Resultados medibles" — "Todo se mide. Si no genera resultados, lo ajustamos."
  4. "Multi-industria" — "Adapto el Método FLUJO a los desafíos específicos de tu sector."

### 7. CTA FINAL
- Banner con fondo degradado sutil
- Título: "¿Listo para crecer con IA?"
- Subtítulo: "Agenda tu diagnóstico gratuito. 30 minutos, sin costo, sin compromiso."
- CTA: "Agendar diagnóstico gratuito"

### 8. FOOTER
- Logo Araneda Office
- Descripción: "Growth partner con IA. Automatizaciones, web y marketing digital para empresas que quieren crecer."
- Links: Inicio | Servicios | Industrias | Firmas Profesionales | Sobre mí
- Contacto: Email (juanaranedagattavara@gmail.com) | LinkedIn | Instagram
- Copyright
- Diseño limpio, 2-3 columnas

---

## PÁGINA 2: FIRMAS PROFESIONALES (página de nicho)

Esta es una página completa dedicada al nicho de firmas profesionales B2B. Se accede desde la card de "Industrias" en el Home o desde el navbar (submenú de Industrias).

### 1. HERO (específico del nicho)
- Eyebrow badge: "Solución para firmas profesionales"
- Título H1: "Tu firma merece más que vivir de referidos"
- Subtítulo: "Diseño web, estrategia digital y automatización con IA para que tu consultora atraiga clientes de forma predecible — sin depender del boca a boca."
- CTA primario: "Agenda tu diagnóstico gratuito"
- CTA secundario: "Ver caso de estudio"
- Dato real (texto muted): "El 77% de las firmas profesionales en Chile no tiene presencia digital. — Cámara de Comercio de Santiago"

### 2. PROBLEMA vs SOLUCIÓN
- Título: "¿Te suena familiar?"
- 2 columnas:
- **"Tu situación actual"** (rojo/warning):
  1. "Dependes de referidos" — Tu crecimiento depende de que alguien te recomiende.
  2. "Tu web no genera consultas" — Funciona como tarjeta de presentación, no como herramienta de ventas.
  3. "No tienes presencia digital real" — Cuando te buscan en Google, no te encuentran.
  4. "Pierdes tiempo en tareas repetitivas" — Seguimiento, cotizaciones, respuestas... todo manual.

- **"Con Araneda Office"** (verde/check):
  1. "Atraes clientes sin depender de otros" — Tu web y presencia digital trabajan 24/7.
  2. "Tu web convierte visitantes en consultas" — Diseñada para que cada visita sea una oportunidad.
  3. "Apareces donde tus clientes buscan" — SEO, LinkedIn, contenido que genera autoridad.
  4. "La IA trabaja mientras tú atiendes clientes" — Automatizaciones que eliminan lo manual.

### 3. OFERTA PARA FIRMAS — Método FLUJO adaptado
- Card grande con borde degradado superior
- Badge: "Método FLUJO para firmas profesionales"
- Título: "Sistema Digital para Firmas Profesionales"
- Descripción: "Un paquete completo que transforma tu presencia digital y automatiza tu captación de clientes."
- **3 componentes en grid:**

  **Web Profesional** 🌐
  - "Sitio de 3-5 páginas diseñado para convertir visitantes en consultas."
  - Bullets: Diseño premium responsive | SEO on-page | Optimizado para conversión | Analytics

  **Estrategia Digital** 📈
  - "Análisis de mercado, competencia y oportunidades. Roadmap de contenido 90 días."
  - Bullets: Análisis competitivo | Estrategia LinkedIn | Posicionamiento | Roadmap

  **Automatización con IA** ⚡
  - "Flujos automatizados con IA que eliminan tareas manuales."
  - Bullets: Formularios inteligentes | Seguimiento de leads | Respuestas con IA | Integraciones

- **Precios:**
  | Servicio | Precio |
  |----------|--------|
  | Diagnóstico Digital | Gratuito (30 min) |
  | Sistema Digital — Método FLUJO | Desde $500.000 CLP |
  | Retainer mensual | Desde $250.000 CLP/mes |
- CTA: "Quiero mi diagnóstico gratuito"

### 4. CASO DE ESTUDIO (placeholder)
- Card grande con fondo elevado
- Empresa: "[Nombre]" — Estudio de inteligencia de mercado
- Título: "De depender 100% de referidos a recibir consultas digitales cada semana"
- 3 métricas: "Primera consulta digital" → Semana 2 | "Horas ahorradas/mes" → +15 | "Implementación" → 3 semanas
- Testimonio placeholder: "[Se llenará con caso real]"
- Nota: "Caso de estudio en desarrollo — resultados preliminares"

### 5. COMPARATIVA DE MERCADO
- Título: "¿Cuánto cuesta digitalizar una firma profesional en Chile?"
- Tabla comparativa:
  | | Agencia premium | Freelancer web | Araneda Office |
  |---|---|---|---|
  | Web profesional | No incluida | Sí | Sí |
  | Estrategia digital | Sí | No | Sí |
  | Automatización IA | No | No | Sí |
  | Trato directo | No (junior) | Sí | Sí |
  | Inversión | Desde $2.8M CLP/mes | $300K-800K CLP | Desde $500K CLP |

### 6. FAQ (específico del nicho)
- Accordion:
  1. **"¿Para quién es?"** → "Consultoras, abogados, contadores, ingenieros y servicios profesionales B2B en Chile."
  2. **"¿Cuánto toma?"** → "3-4 semanas implementación. Primeros resultados dentro del primer mes."
  3. **"¿Qué incluye el diagnóstico?"** → "Videollamada de 30 min: análisis de tu web, Google, LinkedIn + 3 oportunidades concretas."
  4. **"¿Es solo diseño web?"** → "No. Web + estrategia + automatización IA. Un sistema completo."
  5. **"¿Cuál es la inversión?"** → "Desde $500.000 CLP. Propuesta personalizada en el diagnóstico."
  6. **"¿Qué pasa después?"** → "Todo funcionando + documentación + capacitación. Retainer opcional desde $250.000/mes."
  7. **"¿Qué es el Método FLUJO?"** → "Framework de 5 fases: Fundación, Landing, Unificación, Jet (IA), Optimización."

### 7. CTA FINAL
- Título: "¿Listo para que tu firma deje de depender de referidos?"
- Subtítulo: "Agenda tu diagnóstico gratuito. 30 minutos, sin costo, sin compromiso."
- CTA: "Agendar diagnóstico gratuito"

---

## REGLAS IMPORTANTES

1. **NO inventar testimonios.** Placeholders marcados claramente.
2. **NO inventar métricas.** No poner "500+ clientes" ni nada falso.
3. **NO usar lenguaje de agencia.** Nada de "nuestro equipo de expertos". Juan es una persona.
4. **Hablar como "Araneda Office"** en el Home (tercera persona). Como "yo/Juan" en Sobre mí.
5. **Todo en español** (Chile). Usar "tú" no "usted".
6. **Mobile-first.**
7. **CTA principal:** "Diagnóstico gratuito" o "Agenda una llamada".
8. **Colores:** Dark mode (#0a0a0a), azul (#3B82F6), texto (#f5f5f5 y #a0a0a0).
9. **Animaciones sutiles.** Hover en cards y botones. Nada exagerado.
10. **Navegación entre páginas** con hash routing (#). Home = / o /#, Firmas = /#firmas-profesionales. Transición suave.
11. **Las páginas de nicho futuras** seguirán la misma estructura que "Firmas Profesionales" (hero específico → problema/solución → oferta adaptada → caso de estudio → FAQ → CTA).
12. **Cards de "Próximamente"** en la sección Industrias deben verse deshabilitadas (opacity reducida, sin link, badge "Próximamente").
