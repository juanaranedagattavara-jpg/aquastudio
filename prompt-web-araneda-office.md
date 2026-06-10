# PROMPT PARA CLAUDE DESIGN — Web Araneda Office (v4)

## Instrucción principal

Crea un sitio web multi-página para **Araneda Office**. Dark mode, premium, minimalista. React con JSX + routing por hash (#), CSS moderno, responsive. El diseño debe sentirse como Linear, Vercel o Stripe — limpio, con mucho aire, sin ornamentos innecesarios. NO debe verse como "otra landing de agencia de IA" genérica.

---

## CONTEXTO DE MARCA

**Nombre:** Araneda Office
**Fundador:** Juan Araneda — trabaja directo contigo, sin intermediarios.
**Qué es:** Un growth partner digital. No una agencia. No un freelancer. Un socio que se involucra en tu negocio.
**Propuesta central:** "Entendemos tu negocio, implementamos lo que funciona, medimos todo."
**Tono:** Directo, cercano, sin humo. Habla como una persona inteligente que te explica las cosas sin jerga. Nada de "potenciado por inteligencia artificial" ni "soluciones disruptivas". Habla de problemas reales y soluciones concretas.
**Diferenciador en copy:** En vez de decir qué herramientas usamos, decimos qué problemas resolvemos. En vez de prometer, mostramos.
**Modelo de negocio:** Implementación (setup único) + mantención mensual de los servicios (automatizaciones, web, marketing). No es "asesoría", es mantención activa de lo implementado.

---

## IDENTIDAD VISUAL

- **Modo:** Dark (fondo #0a0a0a o similar negro profundo)
- **Color primario/acento:** Azul (#3B82F6) con degradados sutiles hacia púrpura (#8B5CF6)
- **Tipografía headings:** Plus Jakarta Sans o Inter (font-weight 700-800)
- **Tipografía body:** DM Sans o Inter (font-weight 400-500)
- **Bordes:** Sutiles (#2a2a2a), cards con background ligeramente elevado (#1a1a1a)
- **Espaciado:** Generoso, mucho aire, secciones con padding 80-120px vertical
- **Estilo:** Inspirado en Linear, Vercel o Stripe. Limpio, sin ornamentos. Glass morphism sutil en navbar.

---

## ARQUITECTURA DEL SITIO

```
HOME (general)          → /
SERVICIOS               → /#servicios (scroll en home)
MÉTODO FLUJO            → /#metodo (scroll en home)
CASO REAL               → /#caso (scroll en home)
INDUSTRIAS              → /#industrias (scroll en home, cards clickeables)
SOBRE MÍ                → /#sobre-mi (scroll en home)

PÁGINA NICHO 1:
FIRMAS PROFESIONALES    → /#firmas-profesionales (página completa separada)

(Futuras páginas de nicho se agregan con la misma estructura)
```

---

## PÁGINA 1: HOME

### 1. NAVBAR (fija, presente en todas las páginas)
- Logo: "Araneda" + "Office" (Office en color acento)
- Links: Inicio | Servicios | Industrias | Sobre mí
- CTA button derecha: "Agenda tu diagnóstico" (azul)
- Al hacer scroll: fondo con backdrop-filter blur + borde inferior sutil
- Mobile: hamburguesa con overlay fullscreen

### 2. HERO
- Eyebrow badge: "Growth partner digital"
- Título H1 (grande, bold): "Tu negocio tiene potencial. Nosotros lo hacemos visible."
- Subtítulo: "Marketing digital, consultoría estratégica, automatizaciones y diseño web. Todo lo que necesitas para crecer, en un solo lugar — y con alguien que realmente entiende tu negocio."
- CTA primario: "Agenda tu diagnóstico gratuito" (botón azul)
- CTA secundario: "Conoce cómo trabajamos" (botón outline/ghost, scrollea a Método FLUJO)
- NO poner métricas inventadas, NO poner logos de clientes falsos

### 3. SERVICIOS — Qué hacemos
- Título de sección: "Lo que hacemos"
- Subtítulo: "No vendemos humo. Resolvemos problemas concretos."
- **4 servicios en grid** (cada uno una card con icono, título, descripción breve). En este orden exacto:

  **Servicio 1 — Marketing Digital** 📈
  - "Que te encuentren los clientes que te están buscando. Posicionamiento, contenido y estrategia de visibilidad — para que no dependas solo del boca a boca."

  **Servicio 2 — Consultoría** 🎯
  - "Antes de hacer, hay que entender. Analizamos tu negocio, tu mercado y tu competencia para armar un plan que tenga sentido — no un PowerPoint bonito."

  **Servicio 3 — Automatizaciones** ⚡
  - "Las tareas repetitivas matan tu tiempo. Creamos flujos automáticos que responden, organizan y hacen seguimiento — para que tú te enfoques en lo que importa."

  **Servicio 4 — Página Web** 🌐
  - "Tu sitio web debería trabajar para ti, no solo existir. Diseñamos webs que convierten visitantes en clientes reales."

- CTA debajo: "¿No sabes por dónde empezar? Parte con un diagnóstico gratuito de 15 minutos."

### 4. MÉTODO FLUJO
- Título: "Cómo trabajamos"
- Subtítulo: "Un sistema en 5 fases. Sin importar tu industria, el camino es el mismo."
- 5 pasos, cada uno con la letra del acrónimo destacada en color acento:

  **F — Fundación**
  - "Escuchamos. Analizamos dónde estás, qué hace tu competencia y dónde están las oportunidades reales."

  **L — Landing**
  - "Construimos tu presencia digital. Una web que se ve bien y que, más importante, funciona."

  **U — Unificación**
  - "Conectamos todo: tu marca, tu contenido, tus canales. Que tu negocio cuente una sola historia, coherente."

  **J — Jet**
  - "Aceleramos con automatización. Lo que antes tomaba horas, ahora pasa solo."

  **O — Optimización**
  - "Medimos, ajustamos, repetimos. Si algo no funciona, lo cambiamos. Cero ego, puro dato."

### 5. CASO REAL — Resultados, no promesas
- Título: "Esto es lo que pasa cuando implementamos"
- Subtítulo: "Resultados reales de un cliente real. Sin anuncios pagados, solo trabajo orgánico."
- **Card de caso de estudio** (fondo elevado, borde degradado sutil):

  **Cliente:** Marcela Sallato Store (marcelasallatostore.com)
  **Contexto:** PyME que no tenía página web ni presencia en Google. Partió de cero.
  **Qué hicimos:** Diseño web + optimización de presencia en Google (perfil de negocio).
  **Resultado:** Todo orgánico, sin un peso en publicidad.

  **Métricas reales** (mostrar en cards/badges destacados):
  - **775** personas vieron el perfil de negocio en Google
  - **240** interacciones en el perfil (ene-jun 2026)
  - **60** sesiones en la web en los últimos 30 días
  - **52** visitantes únicos
  - **55%** del tráfico viene de Google Maps móvil
  - **0** pesos en publicidad

  **Frase destacada (no es testimonio, es dato):** "De no existir en internet a 775 personas encontrándola en Google. En menos de 6 meses. Sin anuncios."

- NO poner testimonio inventado. Las métricas hablan solas.

### 6. INDUSTRIAS — Para quién trabajamos
- Título: "Trabajamos con industrias que conocemos"
- Subtítulo: "Cada sector tiene sus propios desafíos. No damos soluciones genéricas — nos especializamos."
- **3 cards de industria en grid:**

  **Card 1 — Firmas Profesionales** (activa, clickeable)
  - Icono: ⚖️
  - Título: "Firmas profesionales y consultoras"
  - Descripción: "Abogados, consultores, contadores, ingenieros. Si tu negocio vive de la confianza y los referidos, te ayudamos a que también te encuentren online."
  - Badge: "Ver solución →"
  - Link: /#firmas-profesionales

  **Card 2 — Negocios con Agendas** (coming soon)
  - Icono: 📅
  - Título: "Salones, clínicas y servicios con agenda"
  - Descripción: "Si tu negocio depende de citas y reservas, estamos preparando algo para ti."
  - Badge: "Próximamente"

  **Card 3 — PyMEs** (coming soon)
  - Icono: 🏪
  - Título: "Pequeñas y medianas empresas"
  - Descripción: "Soluciones adaptadas al presupuesto y los desafíos reales de las PyMEs chilenas."
  - Badge: "Próximamente"

- Nota debajo: "¿Tu industria no aparece? No importa — agenda una llamada y conversamos."

### 7. SOBRE MÍ (Juan Araneda)
- Título: "La persona detrás de Araneda Office"
- Layout: 2 columnas (texto izquierda, valores derecha)
- Copy: "Soy Juan Araneda. Creé Araneda Office porque me frustraba ver negocios buenos que nadie conocía — no por falta de calidad, sino porque nadie les mostraba cómo hacerse visibles. Trabajo directamente contigo. Sin intermediarios, sin ejecutivos de cuentas, sin burocracia."
- Segundo párrafo: "Mi enfoque es simple: entender tu negocio, implementar lo que funciona, y medir todo. Si algo no da resultados, lo cambiamos."
- **3 valores** (lista con iconos):
  1. "Trato directo" — "Trabajas conmigo. Punto."
  2. "Resultados medibles" — "Todo se mide. Si no funciona, se ajusta."
  3. "Sin humo" — "No prometo lo que no puedo cumplir. Prefiero sorprenderte."

### 8. CTA FINAL
- Banner con fondo degradado sutil
- Título: "¿Conversamos?"
- Subtítulo: "15 minutos. Sin costo. Sin compromiso. Solo para entender si podemos ayudarte."
- CTA: "Agendar diagnóstico gratuito"

### 9. FOOTER
- Logo Araneda Office
- Descripción breve: "Growth partner digital. Marketing, consultoría, automatizaciones y web."
- Links: Inicio | Servicios | Industrias | Firmas Profesionales | Sobre mí
- Contacto: Email (juanaranedagattavara@gmail.com) | LinkedIn | Instagram
- Copyright
- Diseño limpio, 2-3 columnas

---

## PÁGINA 2: FIRMAS PROFESIONALES (página de nicho)

Se accede desde la card de "Industrias" en el Home. Es una página completa y dedicada.

### 1. HERO (específico del nicho)
- Eyebrow badge: "Para firmas profesionales"
- Título H1: "Tu firma es excelente en lo que hace. El problema es que nadie lo sabe."
- Subtítulo: "La mayoría de las firmas profesionales en Chile dependen 100% de referidos. Nosotros te ayudamos a que los clientes correctos te encuentren — sin esperar a que alguien te recomiende."
- CTA primario: "Agenda tu diagnóstico gratuito"
- Dato real (texto muted, pequeño): "El 77% de las firmas profesionales en Chile no tiene presencia digital. — Cámara de Comercio de Santiago"

### 2. PROBLEMA vs SOLUCIÓN
- Título: "¿Te suena familiar?"
- 2 columnas:
- **"Hoy"** (rojo/warning):
  1. "Dependes de referidos" — Si nadie te recomienda, no llegan clientes nuevos.
  2. "Tu web es una tarjeta de presentación" — Existe, pero no genera ni una consulta.
  3. "No apareces en Google" — Cuando alguien busca lo que haces, encuentra a otros.
  4. "Todo es manual" — Seguimiento, cotizaciones, respuestas... todo a mano.

- **"Con Araneda Office"** (verde/check):
  1. "Los clientes te encuentran solos" — Tu presencia digital trabaja 24/7 por ti.
  2. "Tu web convierte" — Cada visita es una oportunidad real de negocio.
  3. "Apareces donde importa" — Google, LinkedIn, los canales donde buscan tus clientes.
  4. "Lo repetitivo se automatiza" — Más tiempo para tus clientes, menos para tareas administrativas.

### 3. OFERTA PARA FIRMAS — Método FLUJO adaptado
- Card grande con borde degradado superior
- Badge: "Método FLUJO para firmas profesionales"
- Título: "Sistema Digital para Firmas Profesionales"
- Descripción: "Todo lo que tu firma necesita para atraer clientes de forma predecible. Un paquete, un precio, un responsable."
- **3 componentes en grid:**

  **Marketing y Estrategia** 📈
  - "Análisis de mercado, competencia y oportunidades. Estrategia de contenido y posicionamiento para 90 días."
  - Bullets: Análisis competitivo | Estrategia LinkedIn | Posicionamiento | Roadmap 90 días

  **Página Web** 🌐
  - "Sitio de 3-5 páginas diseñado para que cada visita se convierta en una consulta."
  - Bullets: Diseño premium responsive | SEO on-page | Optimizado para conversión | Analytics

  **Automatización** ⚡
  - "Flujos automáticos que hacen seguimiento, responden consultas y organizan tus leads."
  - Bullets: Formularios inteligentes | Seguimiento automático | Respuestas rápidas | Integraciones

- **Precios:**
  | Servicio | Inversión |
  |----------|----------|
  | Diagnóstico Digital | Gratuito (15 min) |
  | Implementación — Método FLUJO | Desde $500.000 CLP |
  | Mantención mensual | Desde $250.000 CLP/mes |
- Nota pequeña bajo precios: "La mantención incluye actualizaciones, soporte y operación continua de automatizaciones y marketing. No es solo asesoría — mantenemos todo funcionando."
- CTA: "Quiero mi diagnóstico gratuito"

### 4. COMPARATIVA DE MERCADO
- Título: "¿Cómo se compara?"
- Tabla:
  | | Agencia premium | Freelancer | Araneda Office |
  |---|---|---|---|
  | Página web | No incluida | Sí | ✅ Sí |
  | Estrategia digital | Sí | No | ✅ Sí |
  | Automatización | No | No | ✅ Sí |
  | Trato directo | No (te asignan un junior) | Sí | ✅ Sí |
  | Inversión | Desde $2.8M CLP/mes | $300K-800K CLP | ✅ Desde $500K CLP |

### 5. FAQ
- Accordion:
  1. **"¿Para quién es esto?"** → "Consultoras, estudios de abogados, contadores, ingenieros y cualquier firma de servicios profesionales B2B en Chile."
  2. **"¿Cuánto toma?"** → "3-4 semanas la implementación completa. Los primeros resultados se ven dentro del primer mes."
  3. **"¿Qué incluye el diagnóstico gratuito?"** → "Una videollamada de 15 minutos donde analizamos tu presencia digital y te mostramos oportunidades concretas para atraer más clientes."
  4. **"¿Es solo diseño web?"** → "No. Es web + estrategia + automatización. Un sistema completo."
  5. **"¿Cuál es la inversión?"** → "Desde $500.000 CLP por la implementación completa. Te entregamos una propuesta personalizada en el diagnóstico."
  6. **"¿Qué es la mantención mensual?"** → "No es asesoría. Es la operación continua de todo lo que implementamos: actualización de contenido, monitoreo de automatizaciones, ajustes de estrategia, soporte técnico. Mantenemos tu sistema digital funcionando y creciendo."

### 6. CTA FINAL
- Título: "Tu firma merece ser encontrada."
- Subtítulo: "Agenda tu diagnóstico gratuito. 15 minutos, sin costo, sin compromiso."
- CTA: "Agendar diagnóstico gratuito"

---

## REGLAS IMPORTANTES

1. **NO inventar testimonios.** Solo usar datos reales verificables.
2. **NO inventar métricas.** Solo las métricas reales de Marcela Sallato Store en la sección de caso real.
3. **NO usar jerga técnica.** Nunca mencionar herramientas específicas (nada de n8n, Make, Claude, ChatGPT, Zapier). Hablar de lo que se resuelve, no de cómo.
4. **NO sonar como "agencia de IA genérica".** Nada de "potenciado por inteligencia artificial", "soluciones disruptivas", "tecnología de punta". Hablar como persona, no como landing page.
5. **NO usar lenguaje de agencia grande.** Nada de "nuestro equipo de expertos". Juan es una persona y eso es su ventaja.
6. **Hablar como "Araneda Office"** en el Home. Como "yo/Juan" en Sobre mí.
7. **Todo en español** (Chile). Usar "tú" no "usted".
8. **Mobile-first.**
9. **CTA principal en toda la web:** "Agenda tu diagnóstico gratuito". La duración es 15 minutos (no 30).
10. **Colores:** Dark mode (#0a0a0a), azul (#3B82F6), texto (#f5f5f5 y #a0a0a0).
11. **Animaciones sutiles.** Hover en cards y botones. Nada exagerado.
12. **Navegación entre páginas** con hash routing (#). Home = / o /#, Firmas = /#firmas-profesionales. Transición suave.
13. **Las páginas de nicho futuras** seguirán la misma estructura de "Firmas Profesionales".
14. **Cards de "Próximamente"** en Industrias deben verse deshabilitadas (opacity reducida, sin link, badge "Próximamente").
15. **El copy debe sentirse conversacional.** Como si Juan te estuviera explicando en una videollamada, no como si estuvieras leyendo un folleto corporativo.
16. **El caso de estudio usa datos 100% reales** de Marcela Sallato Store. No exagerar ni redondear las métricas.
17. **"Mantención mensual"** (no "acompañamiento mensual") — dejar claro que es operación activa de los servicios, no solo asesoría o coaching.
