import Image from "next/image";
import Script from "next/script";
import Section from "@/components/Section";
import Button from "@/components/Button";
import PlanCard from "@/components/PlanCard";
import Testimonial from "@/components/Testimonial";
import MetricsChip from "@/components/MetricsChip";
import { services } from "@/data/services";
import { caseStudies } from "@/data/case-studies";

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
          "logo": "https://aqua.studio/logo.png",
          "description": "Estudio boutique premium: diseño web, estrategia digital y automatización",
          "sameAs": [
            "https://instagram.com/aquastudio",
            "https://linkedin.com/company/aquastudio"
          ]
        })}
      </Script>

      {/* Hero Section */}
      <Section id="inicio" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-deep text-center text-brand-pearl">
        <Image
          src="/hero-water.jpg"
          alt="Superficie de agua con ondas suaves y elegantes"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay para mejorar la legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-brand-aqua/40 to-transparent" />

        <div className="relative z-10 max-w-5xl px-4">
          <h1 className="mb-8 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Más que diseño, creamos sistemas digitales vivos
          </h1>
          <p className="mb-12 text-xl md:text-2xl lg:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
            En Aqua Studio creamos experiencias digitales premium: diseño elegante, funnels automatizados y estrategia inteligente que transforman clics en clientes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button variant="primary" className="px-10 py-5 text-lg md:text-xl">
              Agenda tu diagnóstico gratuito
            </Button>
            <Button variant="ghost" className="px-10 py-5 text-lg md:text-xl">
              Ver proyectos en acción
            </Button>
          </div>
        </div>
      </Section>

      {/* Beneficios / Por qué elegirnos */}
      <Section id="beneficios" className="bg-brand-aqua text-brand-pearl">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Más que diseño, creamos sistemas digitales vivos.
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Cada detalle de tu web debe trabajar a tu favor. No solo lucir bien, sino atraer, convencer y vender.
            </p>
          </div>

          {/* Storytelling de Transformación Digital */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-brand-deep/30 backdrop-blur-sm border border-brand-waves/20 rounded-3xl p-12 shadow-soft">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Paso 1: Fundación */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">1</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Fundación
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Estrategia Digital Integral
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Análisis profundo de tu mercado y competencia. Desarrollamos una hoja de ruta personalizada que maximiza tu potencial de crecimiento.
                  </p>
                </div>

                {/* Paso 2: Experiencia */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">2</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Experiencia
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Diseño UX/UI Premium
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Belleza con propósito. Cada elemento está pensado para guiar a tus usuarios hacia la conversión de manera natural y elegante.
                  </p>
                </div>

                {/* Paso 3: Visibilidad */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">3</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Visibilidad
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    SEO & Visibilidad Orgánica
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Aparécete donde tus clientes te buscan. Posicionamiento estratégico que genera tráfico de calidad y autoridad de marca.
                  </p>
                </div>

                {/* Paso 4: Eficiencia */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">4</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Eficiencia
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Automatización Inteligente
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Tu web trabajando 24/7. Sistemas avanzados que capturan, nutren y convierten leads automáticamente mientras duermes.
                  </p>
                </div>

                {/* Paso 5: Futuro */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">5</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Futuro
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Escalabilidad & Crecimiento
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Arquitectura pensada para el futuro. Sistemas que crecen contigo, adaptándose a las necesidades de tu negocio en expansión.
                  </p>
                </div>

                {/* Paso 6: Partnership */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">6</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Partnership
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Acompañamiento Estratégico
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Un socio digital de confianza. Te acompañamos en cada paso de tu transformación digital con soporte premium y consultoría especializada.
                  </p>
                </div>
              </div>

              {/* Línea conectora visual */}
              <div className="mt-8 pt-8 border-t border-brand-waves/20">
                <div className="text-center">
                  <p className="text-lg font-semibold text-brand-bright mb-2">
                    Tu Transformación Digital Completa
                  </p>
                  <p className="text-sm opacity-80 max-w-2xl mx-auto">
                    Desde la estrategia inicial hasta el crecimiento sostenible, te acompañamos en cada paso de tu evolución digital con soluciones premium diseñadas específicamente para tu negocio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="mb-6">
              <p className="text-lg opacity-90 mb-4">
                En Aqua Studio fusionamos <span className="text-brand-bright font-semibold">estética premium</span>, <span className="text-brand-bright font-semibold">estrategia digital</span> y <span className="text-brand-bright font-semibold">automatización inteligente</span>
              </p>
              <p className="text-base opacity-80">
                para que tu negocio fluya hacia el crecimiento.
              </p>
            </div>
            <Button variant="primary" className="px-10 py-4 text-base font-semibold">
              Descubre cómo escalamos marcas
            </Button>
          </div>
        </div>
      </Section>

      {/* Servicios Estrella (Paquetes Aqua) */}
      <Section id="servicios" className="bg-brand-deep text-brand-pearl">
        <div className="container">
          <h2 className="mb-12 text-4xl font-bold text-center md:text-5xl">
            Soluciones digitales diseñadas para crecer contigo.
          </h2>
          <p className="mb-16 text-lg text-center max-w-3xl mx-auto opacity-90">
            Cada proyecto es único, pero nuestros servicios estrella están pensados para cubrir las etapas clave de tu crecimiento digital.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service) => (
              <PlanCard
                key={service.key}
                title={service.title}
                price={service.price}
                period={service.period}
                bullets={service.bullets}
                ctaLabel={service.cta.label}
                href={service.cta.href}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Button variant="ghost" className="px-10 py-5 text-lg">
              Solicita tu propuesta personalizada
            </Button>
          </div>
        </div>
      </Section>

      {/* Casos de Éxito / Portfolio */}
      <Section id="portfolio" className="bg-brand-pearl text-brand-deep">
        <div className="container">
          <h2 className="mb-12 text-4xl font-bold text-center md:text-5xl">
            Historias reales de marcas que fluyen con Aqua.
          </h2>
          <p className="mb-16 text-lg text-center max-w-3xl mx-auto opacity-80">
            Cada cliente que confía en Aqua Studio se convierte en una historia de éxito. Aquí te mostramos algunos resultados tangibles que hemos logrado.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {caseStudies.map((study, index) => (
              <article key={index} className="rounded-3xl border border-brand-waves/30 bg-white p-8 shadow-soft transition-all duration-300 hover:shadow-xl">
                <h3 className="mb-4 text-2xl font-semibold text-brand-deep">{study.title}</h3>
                <div className="mb-6">
                  <MetricsChip>{study.metric}</MetricsChip>
                </div>
                <p className="text-lg text-zinc-700 mb-6">{study.summary}</p>
                {study.href && (
                  <Button variant="link" href={study.href} className="text-brand-bright">
                    Ver caso completo →
                  </Button>
                )}
              </article>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button variant="primary" className="px-10 py-5 text-lg">
              Explora nuestro portfolio completo
            </Button>
          </div>
        </div>
      </Section>

      {/* Testimonios */}
      <Section id="testimonios" className="bg-brand-aqua text-brand-pearl">
        <div className="container">
          <h2 className="mb-12 text-4xl font-bold text-center md:text-5xl">
            Lo que nuestros clientes dicen.
          </h2>
          <p className="mb-16 text-lg text-center max-w-3xl mx-auto opacity-90">
            La confianza de nuestros clientes es nuestro mayor activo. Sus palabras reflejan el impacto real de nuestro trabajo.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Testimonial
              quote="Aqua Studio transformó nuestra presencia online. El diseño es impecable y las conversiones se dispararon."
              author="Ana G."
              role="CEO de TechSolutions"
            />
            <Testimonial
              quote="Profesionalismo y resultados. Nuestra web ahora no solo luce increíble, sino que realmente vende."
              author="Carlos M."
              role="Fundador de InnovaLabs"
            />
            <Testimonial
              quote="Un equipo que realmente entiende lo que necesitas. La fluidez y la estrategia son su sello."
              author="Sofía P."
              role="Directora de Marketing, GlobalCorp"
            />
          </div>
        </div>
      </Section>

      {/* Blog / Recursos */}
      <Section id="blog" className="bg-brand-deep text-brand-pearl">
        <div className="container">
          <h2 className="mb-12 text-4xl font-bold text-center md:text-5xl">
            Insights que te hacen fluir.
          </h2>
          <p className="mb-16 text-lg text-center max-w-3xl mx-auto opacity-90">
            Mantente al día con las últimas tendencias en diseño web, estrategia digital y automatización.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Placeholder para artículos del blog */}
            {[1, 2, 3].map((item) => (
              <article key={item} className="rounded-3xl bg-brand-aqua/50 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="h-48 w-full rounded-2xl bg-brand-waves/30 mb-6 flex items-center justify-center text-2xl font-semibold">
                  Imagen del Blog {item}
                </div>
                <h3 className="mb-4 text-2xl font-semibold">Título del Artículo {item}</h3>
                <p className="text-lg opacity-80 mb-6">Breve descripción del contenido del artículo para captar la atención.</p>
                <Button variant="link" href="/blog" className="text-brand-bright">
                  Leer más →
                </Button>
              </article>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button variant="ghost" href="/blog" className="px-10 py-5 text-lg">
              Ver todos los artículos
            </Button>
          </div>
        </div>
      </Section>

      {/* CTA Intermedio */}
      <Section className="bg-brand-bright text-brand-deep py-20 md:py-28">
        <div className="container text-center">
          <h2 className="mb-8 text-4xl font-bold md:text-5xl">
            ¿Listo para hacer fluir tu negocio?
          </h2>
          <p className="mb-10 text-xl md:text-2xl max-w-3xl mx-auto">
            Transforma tu visión en una realidad digital que convierte.
          </p>
          <Button variant="primary" className="bg-brand-deep text-brand-bright hover:bg-brand-deep/90 px-10 py-5 text-lg md:text-xl">
            Empieza tu transformación digital
          </Button>
        </div>
      </Section>

      {/* Sobre Nosotros */}
      <Section id="nosotros" className="bg-brand-deep text-brand-pearl">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="mb-12 text-4xl font-bold md:text-5xl">
            Nuestra filosofía: Diseño con propósito.
          </h2>
          <p className="mb-8 text-lg opacity-90">
            En Aqua Studio, creemos que una web es más que una tarjeta de presentación; es una herramienta estratégica. Fusionamos la estética más refinada con la funcionalidad más avanzada para crear experiencias digitales que no solo cautivan, sino que impulsan resultados tangibles.
          </p>
          <p className="text-lg opacity-90">
            Somos un equipo apasionado por la innovación, la calidad y el acompañamiento cercano. Tu éxito es nuestra corriente.
          </p>
          <Button variant="ghost" className="mt-12 px-10 py-5 text-lg">
            Conoce más sobre Aqua Studio
          </Button>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-brand-aqua py-16 text-brand-pearl">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Columna 1: Logo y Descripción */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Aqua Studio</h3>
            <p className="text-sm opacity-80">
              Diseño web premium, estrategia digital y automatización para marcas que buscan fluir y convertir.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">Navegación</h3>
            <ul className="space-y-3">
              <li><a href="#beneficios" className="text-sm hover:text-brand-bright transition">Beneficios</a></li>
              <li><a href="#servicios" className="text-sm hover:text-brand-bright transition">Servicios</a></li>
              <li><a href="#portfolio" className="text-sm hover:text-brand-bright transition">Portfolio</a></li>
              <li><a href="#testimonios" className="text-sm hover:text-brand-bright transition">Testimonios</a></li>
              <li><a href="/blog" className="text-sm hover:text-brand-bright transition">Blog</a></li>
              <li><a href="#nosotros" className="text-sm hover:text-brand-bright transition">Sobre Nosotros</a></li>
            </ul>
          </div>

          {/* Columna 3: Newsletter y Contacto */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">Mantente al día</h3>
            <p className="text-sm mb-4 opacity-80">
              Suscríbete a nuestra newsletter para recibir insights exclusivos.
            </p>
            <form className="flex flex-col gap-4" action="/api/leads" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Tu email"
                className="w-full p-3 rounded-xl bg-brand-deep border border-brand-waves text-brand-pearl placeholder-brand-pearl/70 focus:outline-none focus:ring-2 focus:ring-brand-bright"
              />
              <Button type="submit" variant="primary" className="w-full">
                Suscribirme
              </Button>
            </form>
            <p className="text-xs mt-6 opacity-60">
              © {new Date().getFullYear()} Aqua Studio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Anchor contacto */}
      <div id="contacto" className="sr-only" aria-hidden />
    </>
  );
}
