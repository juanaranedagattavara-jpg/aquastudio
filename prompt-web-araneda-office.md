# PROMPT PARA CLAUDE DESIGN — Web Araneda Office

## Instrucción principal

Crea una landing page / sitio web completo de una sola página (SPA con scroll) para **Araneda Office**, un servicio de crecimiento digital especializado en firmas profesionales B2B en Chile. El sitio debe ser dark mode, premium, minimalista y orientado a conversión. Tecnología: React con JSX, CSS moderno, responsive.

---

## CONTEXTO DE MARCA

**Nombre:** Araneda Office
**Modelo:** Empresa con fundador visible (Juan Araneda como cara, Araneda Office como entidad)
**Nicho:** Firmas profesionales B2B en Chile (consultoras, estudios de mercado, firmas de abogados, contadores, ingenieros consultores)
**Propuesta de valor:** "Ayudamos a consultoras y firmas profesionales en Chile a dejar de depender solo de referidos. Combinamos estrategia digital, diseño web y automatización con IA para que tu firma atraiga clientes de forma predecible."
**Tono:** Premium, confiable, directo, cercano pero profesional. Sin exageraciones. Sin lenguaje de agencia grande ("nuestro equipo de expertos" NO). Hablar en primera persona cuando sea Juan, en tercera cuando sea Araneda Office.
**Diferenciador:** "Trabajo directamente contigo — sin intermediarios, sin burocracia de agencia. Combino estrategia de marketing con automatización con IA."
**Metodología propia:** "Método FLUJO" — Fundación → Landing → Unificación → Jet (IA) → Optimización. Es el framework que diferencia a Araneda Office de freelancers genéricos.
**Dato de mercado clave:** El 77% de las firmas profesionales en Chile no tiene presencia digital (CCS). Hay ~64,000 firmas sin web.

---

## IDENTIDAD VISUAL

- **Modo:** Dark (fondo #0a0a0a o similar negro profundo)
- **Color primario/acento:** Azul (#3B82F6) con degradados sutiles hacia púrpura (#8B5CF6)
- **Tipografía headings:** Plus Jakarta Sans o Inter (font-weight 700-800)
- **Tipografía body:** DM Sans o Inter (font-weight 400-500)
- **Bordes:** Sutiles (#2a2a2a), cards con background ligeramente elevado (#1a1a1a)
- **Espaciado:** Generoso, mucho aire, secciones con padding 80-120px vertical
- **Estilo general:** Inspirado en landing pages de SaaS premium (Linear, Vercel, Stripe). Limpio, sin ornamentos innecesarios. Glass morphism sutil en navbar.

---

## ESTRUCTURA DE SECCIONES (en orden de scroll)

### 1. NAVBAR (fija)
- Logo: "Araneda" + "Office" (Office en color acento)
- Links: Inicio | Servicios | Caso de estudio | Sobre mí
- CTA button derecha: "Diagnóstico gratuito" (azul)
- Al hacer scroll: fondo con backdrop-filter blur + borde inferior sutil
- Mobile: hamburguesa con overlay fullscreen

### 2. HERO
- Eyebrow badge: "Growth partner para firmas profesionales en Chile"
- Título H1 (grande, bold): "Tu firma merece más que vivir de referidos"
- Subtítulo: "Diseño web, estrategia digital y automatización con IA para que tu consultora atraiga clientes de forma predecible — sin depender del boca a boca."
- CTA primario: "Agenda tu diagnóstico gratuito" (botón azul)
- CTA secundario: "Conoce el Método FLUJO" (botón outline/ghost, scrollea a sección de proceso)
- **Dato real como social proof** (pequeño, debajo de los CTAs, en texto muted): "El 77% de las firmas profesionales en Chile no tiene presencia digital. — Cámara de Comercio de Santiago" (esto es un dato REAL verificable, no una métrica inventada)
- NO poner métricas inventadas, NO poner logos de clientes falsos, NO poner números que no sean reales

### 3. PROBLEMA vs SOLUCIÓN
- Layout: 2 columnas (izquierda problemas, derecha soluciones)
- Título de sección: "¿Te suena familiar?"
- **Columna izquierda — "Tu situación actual"** (items con icono rojo/warning):
  1. "Dependes de referidos" — Tu crecimiento depende de que alguien te recomiende. Si no llegan referidos, no llegan clientes.
  2. "Tu web no genera consultas" — Tienes un sitio web, pero funciona como tarjeta de presentación, no como herramienta de ventas.
  3. "No tienes presencia digital real" — Cuando un potencial cliente te busca en Google, no te encuentra o lo que encuentra no inspira confianza.
  4. "Pierdes tiempo en tareas repetitivas" — Seguimiento de leads, cotizaciones, respuestas a consultas... todo manual, todo consume tu tiempo.

- **Columna derecha — "Con Araneda Office"** (items con icono verde/check):
  1. "Atraes clientes sin depender de otros" — Tu web y tu presencia digital trabajan para ti las 24 horas.
  2. "Tu web convierte visitantes en consultas" — Diseñada estratégicamente para que cada visita se convierta en una oportunidad real.
  3. "Apareces donde tus clientes buscan" — SEO, LinkedIn, contenido. Presencia digital que genera confianza y autoridad.
  4. "La IA trabaja mientras tú atiendes clientes" — Automatizaciones inteligentes que eliminan tareas manuales y aceleran tu proceso comercial.

### 4. OFERTA PRINCIPAL — "Método FLUJO"
- Card grande, destacada, con borde degradado superior (azul → púrpura)
- Badge: "Método FLUJO — Sistema integral"
- Título: "Sistema Digital para Firmas Profesionales"
- Descripción: "Un paquete completo que transforma tu presencia digital y automatiza tu captación de clientes. No es solo una web — es un sistema de crecimiento."
- Subtítulo explicativo del método: "5 fases: Fundación (diagnóstico) → Landing (web) → Unificación (estrategia) → Jet (automatización IA) → Optimización (crecimiento continuo)"
- **3 componentes en grid** (cada uno una card):

  **Componente 1 — Web Profesional**
  - Icono: 🌐
  - Título: "Sitio web que convierte"
  - Descripción: "Landing page o sitio de 3-5 páginas, diseñado para convertir visitantes en consultas. Optimizado para SEO y velocidad."
  - Bullets: Diseño premium responsive | SEO on-page | Optimizado para conversión | Analytics integrado

  **Componente 2 — Estrategia Digital**
  - Icono: 📈
  - Título: "Estrategia de posicionamiento"
  - Descripción: "Análisis de tu mercado, competencia y oportunidades. Roadmap de contenido y posicionamiento para 90 días."
  - Bullets: Análisis competitivo | Estrategia de contenido LinkedIn | Posicionamiento de marca | Roadmap 90 días

  **Componente 3 — Automatización con IA**
  - Icono: ⚡
  - Título: "Automatización inteligente"
  - Descripción: "1-2 flujos automatizados con IA que eliminan tareas manuales y aceleran tu proceso comercial."
  - Bullets: Formularios inteligentes | Seguimiento automático de leads | Respuestas con IA | Integración con tus herramientas

- **Fila de precio (PUBLICAR — transparencia genera confianza):**
  | Servicio | Precio |
  |----------|--------|
  | Diagnóstico Digital | Gratuito (30 min) |
  | Sistema Digital — Método FLUJO | Desde $500.000 CLP |
  | Retainer mensual (growth continuo) | Desde $250.000 CLP/mes |
- CTA: "Quiero mi diagnóstico gratuito"

### 5. PROCESO — Método FLUJO en 5 fases
- Título: "Método FLUJO: de diagnóstico a resultados en 4 semanas"
- Subtítulo: "Un sistema probado en 5 fases para transformar la presencia digital de tu firma."
- 5 pasos en grid (pueden ser horizontal en desktop, vertical en mobile), cada uno con la letra del acrónimo destacada en color acento:

  **F — Fundación**
  - "Diagnóstico digital completo. Analizamos tu presencia actual, competencia y oportunidades. Detectamos las 3 palancas de mayor impacto. Gratis, 30 minutos."

  **L — Landing**
  - "Diseñamos y construimos tu web profesional. Optimizada para convertir visitantes en consultas, con SEO y analytics integrados."

  **U — Unificación**
  - "Creamos tu estrategia de posicionamiento: roadmap de contenido, estrategia LinkedIn, y plan de visibilidad para 90 días. Todo conectado."

  **J — Jet (IA)**
  - "Implementamos automatizaciones con IA que aceleran tu proceso comercial: formularios inteligentes, seguimiento automático de leads, respuestas con IA."

  **O — Optimización**
  - "Medimos resultados, ajustamos lo necesario, y tu sistema digital crece contigo. Dashboard con métricas claras de lo que funciona."

### 6. CASO DE ESTUDIO (placeholder para llenarse con caso real)
- Card grande con fondo elevado
- Empresa: "[Nombre de la empresa]" — Estudio de inteligencia de mercado
- Título: "De depender 100% de referidos a recibir consultas digitales cada semana"
- **3 métricas** en grid:
  - "Primera consulta digital" — Semana 2
  - "Horas ahorradas/mes" — +15 horas
  - "Tiempo de implementación" — 3 semanas
- Testimonio (quote con borde izquierdo azul): "[Testimonio del cliente aquí — se llenará con caso real]" — [Nombre], [Cargo]
- Nota sutil: "Caso de estudio en desarrollo — resultados preliminares"

### 7. SOBRE MÍ (Juan Araneda)
- Layout: 2 columnas (texto izquierda, valores/diferenciadores derecha)
- Título: "¿Quién está detrás de Araneda Office?"
- Copy: "Soy Juan Araneda. Me especializo en crecimiento digital con IA para firmas profesionales. No soy una agencia con 50 empleados — trabajo directamente contigo, sin intermediarios ni burocracia."
- Segundo párrafo: "Combino estrategia de marketing con automatización inteligente para crear sistemas digitales que atraen clientes de forma predecible. Mi enfoque es simple: entender tu negocio, implementar lo que funciona, y medir todo."
- **Valores/diferenciadores** (lista con iconos):
  1. "Trato directo" — "Trabajas conmigo, no con un ejecutivo de cuentas. Conozco tu negocio de primera mano."
  2. "IA aplicada" — "No uso IA como buzzword. La implemento para automatizar procesos reales que te ahorran tiempo."
  3. "Resultados medibles" — "Todo lo que hacemos se mide. Si no genera resultados, lo ajustamos."
  4. "Especializado en firmas profesionales" — "Entiendo los desafíos específicos de consultoras y servicios profesionales B2B."

### 8. FAQ
- Título: "Preguntas frecuentes"
- Accordion con estas preguntas:

  1. **"¿Para quién es este servicio?"**
  → "Para consultoras, estudios de mercado, firmas de abogados, contadores y servicios profesionales B2B en Chile que quieren atraer clientes de forma digital, sin depender exclusivamente de referidos."

  2. **"¿Cuánto tiempo toma ver resultados?"**
  → "La implementación completa toma 3-4 semanas. Los primeros resultados (consultas digitales) suelen aparecer dentro del primer mes. El sistema mejora con el tiempo a medida que optimizamos."

  3. **"¿Qué incluye el diagnóstico gratuito?"**
  → "Una videollamada de 30 minutos donde analizo tu presencia digital actual (web, Google, LinkedIn), identifico 3 oportunidades concretas y te doy recomendaciones accionables. Sin costo, sin compromiso."

  4. **"¿Es solo diseño web?"**
  → "No. Es un sistema completo: web diseñada para convertir + estrategia de posicionamiento + automatizaciones con IA. La web es el centro, pero sin estrategia y automatización es solo una tarjeta de presentación bonita."

  5. **"¿Cuál es la inversión?"**
  → "El Método FLUJO parte desde $500.000 CLP. El precio final depende del alcance de tu proyecto. En el diagnóstico gratuito te entrego una propuesta personalizada con precio cerrado."

  6. **"¿Qué pasa después de la entrega?"**
  → "Te entrego todo funcionando + documentación + capacitación. Si necesitas soporte continuo, tenemos planes de retainer mensual desde $250.000 CLP/mes. Pero el sistema está diseñado para que funcione de forma autónoma."

  7. **"¿Qué es el Método FLUJO?"**
  → "Es nuestro framework de implementación en 5 fases: Fundación (diagnóstico), Landing (web), Unificación (estrategia), Jet (automatización IA) y Optimización (crecimiento continuo). Cada fase tiene entregables concretos y medibles."

### 9. COMPARATIVA DE MERCADO (sección nueva — genera confianza por transparencia)
- Título: "¿Cuánto cuesta digitalizar una firma profesional en Chile?"
- Subtítulo: "Somos transparentes con nuestros precios. Así te comparamos con las alternativas:"
- Tabla comparativa:
  | | Agencia B2B premium (ej: Loup) | Freelancer web | Araneda Office (Método FLUJO) |
  |---|---|---|---|
  | Web profesional | No incluida | Sí | Sí |
  | Estrategia digital | Sí | No | Sí |
  | Automatización IA | No | No | Sí |
  | Trato directo con quien ejecuta | No (junior asignado) | Sí | Sí |
  | Inversión | Desde $2.8M CLP/mes | $300K-800K CLP (solo web) | Desde $500K CLP (sistema completo) |
- Nota: Los datos de competencia son estimaciones basadas en información pública disponible.

### 10. CTA FINAL
- Banner con fondo degradado sutil
- Título: "¿Listo para que tu firma deje de depender de referidos?"
- Subtítulo: "Agenda tu diagnóstico gratuito. 30 minutos, sin costo, sin compromiso."
- CTA: "Agendar diagnóstico gratuito"

### 11. FOOTER
- Logo Araneda Office
- Descripción corta
- Links de navegación
- Links de contacto: Email (juanaranedagattavara@gmail.com) | LinkedIn | Instagram
- Copyright
- Diseño limpio, 2-3 columnas

---

## REGLAS IMPORTANTES

1. **NO inventar testimonios.** El caso de estudio tiene placeholders marcados claramente para llenar con datos reales.
2. **NO inventar métricas.** No poner "500+ clientes" ni "10 años de experiencia" ni nada falso.
3. **NO usar lenguaje de agencia.** Nada de "nuestro equipo de expertos", "somos líderes", etc. Juan es una persona, y eso es su ventaja.
4. **Hablar en singular** cuando es Juan (sobre mí), y como "Araneda Office" cuando es la entidad (servicios, oferta).
5. **Todo el copy está en español** (Chile). Usar "tú" no "usted".
6. **Mobile-first.** Debe verse impecable en celular.
7. **El CTA principal siempre es "Diagnóstico gratuito"** — es la puerta de entrada al funnel de ventas.
8. **Colores:** Dark mode (#0a0a0a fondo), azul (#3B82F6) acento, texto claro (#f5f5f5 y #a0a0a0).
9. **Animaciones sutiles:** Hover en cards y botones, nada exagerado. No usar animaciones de scroll complejas.
10. **Performance:** Código limpio, sin librerías innecesarias. React vía CDN o componente standalone está bien.
