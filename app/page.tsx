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
            Diseñamos webs que fluyen y convierten
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

      {/* Comparación: Dolores vs Soluciones */}
      <Section id="comparacion" className="bg-brand-deep text-brand-pearl py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Título compacto */}
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Antes vs Después
              </h2>
              <p className="text-base opacity-90">
                La transformación que tu negocio necesita
              </p>
            </div>

            {/* Comparación simétrica y compacta */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Lado izquierdo - Problemas */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 mb-3">
                    <span className="text-red-400 text-xl font-bold">✗</span>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Tu Situación Actual</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold text-red-300 text-sm mb-1">Web que no convierte</h4>
                    <p className="text-xs opacity-80">Solo una tarjeta de presentación</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold text-red-300 text-sm mb-1">Invisible en Google</h4>
                    <p className="text-xs opacity-80">Nadie te encuentra online</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold text-red-300 text-sm mb-1">Diseño amateur</h4>
                    <p className="text-xs opacity-80">No inspira confianza</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold text-red-300 text-sm mb-1">Procesos manuales</h4>
                    <p className="text-xs opacity-80">Pierdes tiempo valioso</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold text-red-300 text-sm mb-1">Sin estrategia</h4>
                    <p className="text-xs opacity-80">No sabes qué funciona</p>
                  </div>
                </div>
              </div>

              {/* Lado derecho - Soluciones */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-bright/20 border border-brand-bright/40 mb-3">
                    <span className="text-brand-bright text-xl font-bold">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-bright mb-2">Con Aqua Studio</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-brand-bright/10 border border-brand-bright/20">
                    <h4 className="font-semibold text-brand-bright text-sm mb-1">Web que vende 24/7</h4>
                    <p className="text-xs opacity-80">Sistema de conversión automático</p>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-bright/10 border border-brand-bright/20">
                    <h4 className="font-semibold text-brand-bright text-sm mb-1">Primero en Google</h4>
                    <p className="text-xs opacity-80">SEO estratégico que funciona</p>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-bright/10 border border-brand-bright/20">
                    <h4 className="font-semibold text-brand-bright text-sm mb-1">Diseño premium</h4>
                    <p className="text-xs opacity-80">Estética que inspira confianza</p>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-bright/10 border border-brand-bright/20">
                    <h4 className="font-semibold text-brand-bright text-sm mb-1">Automatización inteligente</h4>
                    <p className="text-xs opacity-80">Trabaja por ti mientras duermes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-bright/10 border border-brand-bright/20">
                    <h4 className="font-semibold text-brand-bright text-sm mb-1">Estrategia clara</h4>
                    <p className="text-xs opacity-80">Roadmap con ROI medible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA compacto */}
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-brand-bright/10 to-brand-aqua/10 rounded-xl p-6 border border-brand-bright/20">
                <h3 className="text-lg font-bold mb-2">¿Listo para el cambio?</h3>
                <Button variant="primary" className="px-8 py-3 text-base font-semibold">
                  Quiero mi transformación
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Beneficios / Por qué elegirnos */}
      <Section id="beneficios" className="bg-brand-aqua text-brand-pearl">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Más que diseño, creamos sistemas digitales vivos
            </h2>
            <p className="text-lg md:text-xl opacity-90 whitespace-nowrap">
              Cada detalle de tu web debe trabajar a tu favor: atraer, convencer y vender
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
                    Interfaces que no solo cautivan, sino que guían a tus usuarios hacia la conversión. Cada píxel tiene un propósito estratégico.
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
                    Aparece donde te buscan. Optimización técnica y de contenido que posiciona tu marca en los primeros resultados.
                  </p>
                </div>

                {/* Paso 4: Automatización */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">4</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Automatización
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Sistemas que Trabajan 24/7
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Funnels automatizados, chatbots inteligentes y workflows que convierten mientras duermes. Tu negocio nunca para.
                  </p>
                </div>

                {/* Paso 5: Conversión */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">5</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Conversión
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Optimización de Conversiones
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    A/B testing, análisis de comportamiento y mejoras continuas que transforman visitantes en clientes fieles.
                  </p>
                </div>

                {/* Paso 6: Escalabilidad */}
                <div className="group">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-bright/20 border border-brand-bright/40 flex items-center justify-center mr-4">
                      <span className="text-brand-bright text-sm font-bold">6</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium">
                      Escalabilidad
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    Crecimiento Sostenible
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    Arquitectura escalable que crece contigo. Desde startup hasta empresa consolidada, tu sistema digital evoluciona.
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
            Soluciones digitales diseñadas para crecer contigo
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
            <p className="text-lg opacity-90 mb-6">
              ¿Ninguno de los planes se adapta a tu necesidad?
            </p>
            <Button variant="ghost" className="px-10 py-5 text-lg">
              Solicita tu propuesta personalizada
            </Button>
          </div>
        </div>
      </Section>

      {/* Logos de Clientes */}

      {/* Testimonios */}
      <Section id="testimonios" className="bg-brand-aqua text-brand-pearl">
        <div className="container">
          <h2 className="mb-12 text-4xl font-bold text-center md:text-5xl">
            Lo que nuestros clientes dicen
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

          {/* Marcas que confían en Aqua Studio */}
          <div className="mt-16">
            <h2 className="mb-8 text-2xl font-bold text-center">
              Marcas que confían en Aqua Studio
            </h2>

            {/* Barra horizontal de logos */}
            <div className="flex justify-center items-center space-x-8 md:space-x-12 py-4">
              {/* Logo 1 */}
              <div className="group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-brand-bright/20 to-brand-aqua/30 border-2 border-brand-waves/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-brand-bright/60">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-deep/80 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                </div>
                <p className="text-xs text-center mt-1 opacity-70 group-hover:opacity-100 transition-opacity">TechCorp</p>
              </div>

              {/* Logo 2 */}
              <div className="group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-brand-bright/20 to-brand-aqua/30 border-2 border-brand-waves/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-brand-bright/60">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-deep/80 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">B</span>
                  </div>
                </div>
                <p className="text-xs text-center mt-1 opacity-70 group-hover:opacity-100 transition-opacity">StartupX</p>
              </div>

              {/* Logo 3 */}
              <div className="group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-brand-bright/20 to-brand-aqua/30 border-2 border-brand-waves/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-brand-bright/60">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-deep/80 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">C</span>
                  </div>
                </div>
                <p className="text-xs text-center mt-1 opacity-70 group-hover:opacity-100 transition-opacity">EcoFlow</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Blog / Recursos */}
      <Section id="blog" className="bg-brand-aqua/20 text-brand-pearl">
        <div className="container">
          <h2 className="mb-12 text-4xl font-bold text-center md:text-5xl">
            Insights que te hacen fluir
          </h2>
          <p className="mb-16 text-lg text-center max-w-3xl mx-auto opacity-90">
            Mantente al día con las últimas tendencias en diseño web, estrategia digital y automatización
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* 4 artículos del blog */}
            {[
              { 
                title: "Cómo crear una web que realmente convierta", 
                category: "Diseño",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center"
              },
              { 
                title: "SEO 2024: Estrategias que funcionan", 
                category: "Estrategia",
                image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=200&fit=crop&crop=center"
              },
              { 
                title: "Automatiza tu negocio sin perder el toque humano", 
                category: "Automatización",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center"
              },
              { 
                title: "Psicología del color en diseño web", 
                category: "UX/UI",
                image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=200&fit=crop&crop=center"
              },
            ].map((item, index) => (
              <article key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-brand-deep/40 backdrop-blur-sm border border-brand-waves/30 hover:border-brand-bright/40 transition-all duration-500 group-hover:bg-brand-deep/60 h-40">
                  {/* Imagen de fondo real */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  
                  {/* Overlay para legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand-deep/50 to-transparent"></div>
                  
                  {/* Contenido */}
                  <div className="relative p-4 h-full flex flex-col justify-end">
                    <div className="mb-2">
                      <span className="px-3 py-1 text-xs font-medium text-brand-bright bg-brand-bright/20 backdrop-blur-sm rounded-full border border-brand-bright/30">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-white/90 transition-colors duration-300 leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Efecto hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
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
            Nuestra filosofía: Diseño con propósito
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

