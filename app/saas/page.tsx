import Image from "next/image";
import Link from "next/link";
import Section from "@/components/Section";
import Button from "@/components/Button";

export default function SaasPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-center text-brand-pearl">
        {/* Fondo fluido negro con grises */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-brand-aqua/30 to-black">
          {/* Ondas sutiles en gris */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/10 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-1/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-aqua/5 to-transparent transform skew-y-1"></div>
            <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/8 to-transparent transform -skew-y-2"></div>
            <div className="absolute top-3/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-aqua/3 to-transparent transform skew-y-1"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
        </div>

        <div className="relative z-10 max-w-6xl px-4">
          <h1 className="mb-8 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Soluciones SaaS que fluyen
          </h1>
          <p className="mb-12 text-xl md:text-2xl lg:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
            Automatizamos procesos complejos con herramientas elegantes y poderosas. 
            Diseñadas para crecer contigo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button variant="primary" className="px-10 py-5 text-lg md:text-xl">
              Ver todas las soluciones
            </Button>
            <Button variant="ghost" className="px-10 py-5 text-lg md:text-xl">
              Solicitar demo personalizada
            </Button>
          </div>
        </div>
      </Section>

      {/* Soluciones Disponibles */}
      <Section className="relative text-brand-pearl py-20 overflow-hidden">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-aqua via-brand-waves/40 to-brand-aqua">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-deep/8 to-transparent transform skew-y-2"></div>
            <div className="absolute top-1/3 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-bright/5 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-2/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/6 to-transparent transform skew-y-3"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-aqua/90 via-brand-aqua/70 to-brand-aqua/80"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Nuestras soluciones SaaS
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Herramientas especializadas para diferentes industrias, diseñadas con la misma filosofía de fluidez y elegancia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Restaurante SaaS */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-sm border border-brand-waves/30 hover:border-brand-bright/40 transition-all duration-500 group-hover:bg-black/60 h-80">
                {/* Placeholder elegante */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-aqua/20 via-brand-waves/10 to-brand-bright/20"></div>
                
                {/* Icono de restaurante */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-brand-bright/20 backdrop-blur-sm border border-brand-bright/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                
                {/* Contenido */}
                <div className="relative p-8 h-full flex flex-col justify-end">
                  <div className="mb-4">
                    <span className="px-4 py-2 text-sm font-medium text-brand-bright bg-brand-bright/20 backdrop-blur-sm rounded-full border border-brand-bright/30">
                      Restaurantes
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-300 leading-tight mb-3">
                    Restaurante SaaS
                  </h3>
                  <p className="text-brand-pearl/80 group-hover:text-brand-pearl transition-colors duration-300 leading-relaxed mb-6">
                    Digitaliza tu restaurante. Gestiona menús, reservas y reportes automáticos en minutos.
                  </p>
                  <div className="flex items-center text-brand-bright text-sm font-medium group-hover:text-brand-bright/80 transition-colors duration-300">
                    <span>Explorar solución</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* E-commerce SaaS - Placeholder */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-sm border border-brand-waves/30 hover:border-brand-bright/40 transition-all duration-500 group-hover:bg-black/60 h-80">
                {/* Placeholder elegante */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-waves/20 via-brand-aqua/10 to-brand-bright/20"></div>
                
                {/* Icono de e-commerce */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-brand-waves/20 backdrop-blur-sm border border-brand-waves/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-waves" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                
                {/* Contenido */}
                <div className="relative p-8 h-full flex flex-col justify-end">
                  <div className="mb-4">
                    <span className="px-4 py-2 text-sm font-medium text-brand-waves bg-brand-waves/20 backdrop-blur-sm rounded-full border border-brand-waves/30">
                      E-commerce
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-300 leading-tight mb-3">
                    E-commerce SaaS
                  </h3>
                  <p className="text-brand-pearl/80 group-hover:text-brand-pearl transition-colors duration-300 leading-relaxed mb-6">
                    Plataforma completa para vender online. Gestión de inventario, pagos y envíos automatizados.
                  </p>
                  <div className="flex items-center text-brand-waves text-sm font-medium group-hover:text-brand-waves/80 transition-colors duration-300">
                    <span>Próximamente</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Servicios Profesionales SaaS - Placeholder */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-sm border border-brand-waves/30 hover:border-brand-bright/40 transition-all duration-500 group-hover:bg-black/60 h-80">
                {/* Placeholder elegante */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-bright/20 via-brand-aqua/10 to-brand-waves/20"></div>
                
                {/* Icono de servicios */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-brand-aqua/20 backdrop-blur-sm border border-brand-aqua/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                
                {/* Contenido */}
                <div className="relative p-8 h-full flex flex-col justify-end">
                  <div className="mb-4">
                    <span className="px-4 py-2 text-sm font-medium text-brand-aqua bg-brand-aqua/20 backdrop-blur-sm rounded-full border border-brand-aqua/30">
                      Servicios
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-300 leading-tight mb-3">
                    Servicios Profesionales
                  </h3>
                  <p className="text-brand-pearl/80 group-hover:text-brand-pearl transition-colors duration-300 leading-relaxed mb-6">
                    Gestión completa para consultores y freelancers. Clientes, proyectos y facturación automatizada.
                  </p>
                  <div className="flex items-center text-brand-aqua text-sm font-medium group-hover:text-brand-aqua/80 transition-colors duration-300">
                    <span>Próximamente</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-brand-bright/10 to-brand-aqua/10 rounded-2xl p-8 border border-brand-bright/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">¿No encuentras tu solución?</h3>
              <p className="text-lg opacity-90 mb-6">
                Desarrollamos soluciones SaaS personalizadas para tu industria específica
              </p>
              <Button variant="primary" className="px-8 py-4 text-base font-semibold">
                Solicitar desarrollo personalizado
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative py-16 text-brand-pearl overflow-hidden">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-aqua via-brand-waves/30 to-brand-aqua">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-deep/4 to-transparent transform skew-y-2"></div>
            <div className="absolute top-1/3 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-bright/3 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-2/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/2 to-transparent transform skew-y-3"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-aqua/85 via-brand-aqua/70 to-brand-aqua/80"></div>
        </div>
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {/* Columna 1: Logo y Descripción */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Aqua Studio</h3>
            <p className="text-sm opacity-80">
              Soluciones SaaS premium para automatizar y hacer fluir tu negocio.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">Soluciones</h3>
            <ul className="space-y-3">
              <li><Link href="/saas/restaurante" className="text-sm hover:text-brand-bright transition">Restaurante SaaS</Link></li>
              <li><a href="#" className="text-sm hover:text-brand-bright transition">E-commerce SaaS</a></li>
              <li><a href="#" className="text-sm hover:text-brand-bright transition">Servicios Profesionales</a></li>
              <li><a href="#" className="text-sm hover:text-brand-bright transition">Desarrollo Personalizado</a></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">Contacto</h3>
            <p className="text-sm mb-4 opacity-80">
              ¿Listo para automatizar tu negocio?
            </p>
            <Button variant="primary" className="w-full">
              Agendar consulta gratuita
            </Button>
            <p className="text-xs mt-6 opacity-60">
              © {new Date().getFullYear()} Aqua Studio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
