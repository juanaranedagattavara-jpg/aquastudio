import Link from "next/link";
import Section from "@/components/Section";
import Button from "@/components/Button";

export default function RestauranteSaasPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-deep text-center text-brand-pearl">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-aqua/30 to-brand-deep">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/10 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-1/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-aqua/5 to-transparent transform skew-y-1"></div>
            <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/8 to-transparent transform -skew-y-2"></div>
            <div className="absolute top-3/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-aqua/3 to-transparent transform skew-y-1"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-brand-deep/40 to-brand-deep/60"></div>
        </div>

        <div className="relative z-10 max-w-6xl px-4">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-brand-bright/20 backdrop-blur-sm border border-brand-bright/30 rounded-full text-brand-bright text-sm font-medium mb-6">
              🍽️ SaaS para Restaurantes
            </span>
          </div>
          <h1 className="mb-8 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Recupera tu tiempo. Digitaliza tu restaurante.
          </h1>
          <p className="mb-12 text-xl md:text-2xl lg:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
            Publica tu menú, gestiona reservas y recibe reportes automáticos en minutos.
            <br />
            Todo desde una sola app, sin esfuerzo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button variant="primary" className="px-10 py-5 text-lg md:text-xl">
              Agendar Demo Gratis
            </Button>
            <Button variant="ghost" className="px-10 py-5 text-lg md:text-xl">
              Probar Plan Básico
            </Button>
          </div>
        </div>
      </Section>

      {/* Sección de Características Principales */}
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-6 text-4xl font-bold md:text-5xl text-brand-bright">
                Automatizamos tu restaurante. Te devolvemos horas.
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                Una solución completa que transforma la gestión de tu restaurante
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* Menú digital */}
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-brand-bright/20 backdrop-blur-sm border border-brand-bright/40 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                  <svg className="w-12 h-12 text-brand-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-bright">Menú Digital</h3>
                <p className="text-sm opacity-80 mb-4">Actualiza precios y platos en 30 segundos</p>
                <ul className="text-xs opacity-70 space-y-1">
                  <li>• Sincronización automática</li>
                  <li>• Fotos profesionales</li>
                  <li>• Categorías organizadas</li>
                </ul>
              </div>

              {/* Reservas online */}
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-brand-aqua/20 backdrop-blur-sm border border-brand-aqua/40 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                  <svg className="w-12 h-12 text-brand-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-aqua">Reservas Online</h3>
                <p className="text-sm opacity-80 mb-4">Confirmaciones automáticas por email/WhatsApp</p>
                <ul className="text-xs opacity-70 space-y-1">
                  <li>• Calendario integrado</li>
                  <li>• Notificaciones automáticas</li>
                  <li>• Gestión de mesas</li>
                </ul>
              </div>

              {/* Dashboard */}
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-brand-waves/20 backdrop-blur-sm border border-brand-waves/40 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                  <svg className="w-12 h-12 text-brand-waves" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-waves">Dashboard Inteligente</h3>
                <p className="text-sm opacity-80 mb-4">Ventas, ticket promedio y platos más vendidos</p>
                <ul className="text-xs opacity-70 space-y-1">
                  <li>• Reportes en tiempo real</li>
                  <li>• Análisis de tendencias</li>
                  <li>• Métricas clave</li>
                </ul>
              </div>

              {/* Automatizaciones */}
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-brand-bright/20 backdrop-blur-sm border border-brand-bright/40 flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                  <svg className="w-12 h-12 text-brand-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-bright">Automatizaciones</h3>
                <p className="text-sm opacity-80 mb-4">Reportes, recordatorios y publicaciones automáticas</p>
                <ul className="text-xs opacity-70 space-y-1">
                  <li>• Workflows inteligentes</li>
                  <li>• Integración n8n</li>
                  <li>• Tareas programadas</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-brand-bright/10 to-brand-aqua/10 rounded-3xl p-8 border border-brand-bright/20 max-w-4xl mx-auto">
                <p className="text-2xl font-semibold text-brand-bright mb-4">
                  "Mientras la app trabaja, tú te concentras en atender, vender y crecer."
                </p>
                <p className="text-lg opacity-90">
                  Libera tu tiempo para lo que realmente importa: crear experiencias memorables para tus clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Sección de Problemas y Soluciones */}
      <Section className="relative text-brand-pearl py-20 overflow-hidden">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-waves/20 to-brand-deep">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-aqua/6 to-transparent transform -skew-y-3"></div>
            <div className="absolute top-1/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-bright/4 to-transparent transform skew-y-2"></div>
            <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/5 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-3/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-aqua/3 to-transparent transform skew-y-4"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/50 to-brand-deep/70"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                El problema no es que sea difícil… es que no tienes tiempo.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Problemas */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-red-300 mb-8 text-center">Tu Situación Actual</h3>
                
                <div className="space-y-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-red-400 text-lg">✗</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-300 mb-2">Horas perdidas en tareas repetitivas</h4>
                        <p className="text-sm opacity-80">Cada día se te van horas entre publicar el menú, contestar reservas y ordenar ventas.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-red-400 text-lg">✗</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-300 mb-2">Falta de claridad en el negocio</h4>
                        <p className="text-sm opacity-80">Tu equipo trabaja más, pero tú sigues sin claridad sobre qué funciona y qué no.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-red-400 text-lg">✗</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-300 mb-2">Oportunidades perdidas</h4>
                        <p className="text-sm opacity-80">Lo que pierdes no son tareas… son oportunidades de crecimiento.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soluciones */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-brand-bright mb-8 text-center">Con Aqua Studio</h3>
                
                <div className="space-y-6">
                  <div className="bg-brand-bright/10 border border-brand-bright/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-brand-bright/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-brand-bright text-lg">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-bright mb-2">Automatización completa</h4>
                        <p className="text-sm opacity-80">Todas las tareas repetitivas se ejecutan automáticamente mientras duermes.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-bright/10 border border-brand-bright/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-brand-bright/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-brand-bright text-lg">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-bright mb-2">Visibilidad total del negocio</h4>
                        <p className="text-sm opacity-80">Dashboard con métricas clave que te muestran exactamente qué funciona.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-bright/10 border border-brand-bright/20 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-brand-bright/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-brand-bright text-lg">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-bright mb-2">Crecimiento acelerado</h4>
                        <p className="text-sm opacity-80">Libera tiempo para enfocarte en estrategia, marketing y experiencia del cliente.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Sección de ROI Detallado */}
      <Section className="relative text-brand-pearl py-20 overflow-hidden">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-aqua via-brand-bright/20 to-brand-aqua">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-deep/6 to-transparent transform skew-y-1"></div>
            <div className="absolute top-1/3 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-waves/4 to-transparent transform -skew-y-2"></div>
            <div className="absolute top-2/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-aqua/3 to-transparent transform skew-y-3"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-aqua/80 via-brand-aqua/60 to-brand-aqua/70"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-6 text-4xl font-bold md:text-5xl text-brand-bright">
                El impacto real (ROI)
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                Tu inversión se paga sola desde el primer mes
              </p>
            </div>

            {/* Tabla de ROI Mejorada */}
            <div className="bg-brand-deep/40 backdrop-blur-sm border border-brand-waves/30 rounded-3xl p-8 mb-12">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-waves/20">
                      <th className="text-left py-4 px-6 text-brand-bright font-semibold">Plan</th>
                      <th className="text-left py-4 px-6 text-brand-bright font-semibold">Horas ahorradas/mes</th>
                      <th className="text-left py-4 px-6 text-brand-bright font-semibold">Valor del tiempo ahorrado</th>
                      <th className="text-left py-4 px-6 text-brand-bright font-semibold">Precio plan</th>
                      <th className="text-left py-4 px-6 text-brand-bright font-semibold">ROI mensual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-waves/10">
                    <tr className="hover:bg-brand-deep/20 transition-colors">
                      <td className="py-4 px-6 font-medium">Básico</td>
                      <td className="py-4 px-6">~26h</td>
                      <td className="py-4 px-6">≈ CLP 73.800</td>
                      <td className="py-4 px-6">CLP 20.000 (~€25)</td>
                      <td className="py-4 px-6 text-brand-bright font-bold">3.7×</td>
                    </tr>
                    <tr className="bg-brand-bright/5 hover:bg-brand-bright/10 transition-colors">
                      <td className="py-4 px-6 font-medium">Pro ⭐</td>
                      <td className="py-4 px-6">~65h</td>
                      <td className="py-4 px-6">≈ CLP 184.600</td>
                      <td className="py-4 px-6">CLP 50.000 (~€60)</td>
                      <td className="py-4 px-6 text-brand-bright font-bold">3.6×</td>
                    </tr>
                    <tr className="hover:bg-brand-deep/20 transition-colors">
                      <td className="py-4 px-6 font-medium">Premium 🥇</td>
                      <td className="py-4 px-6">~108h</td>
                      <td className="py-4 px-6">≈ CLP 306.700</td>
                      <td className="py-4 px-6">CLP 100.000 (~€120)</td>
                      <td className="py-4 px-6 text-brand-bright font-bold">3.0×</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cálculo de ROI */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center bg-brand-bright/10 rounded-2xl p-6 border border-brand-bright/20">
                <div className="text-3xl font-bold text-brand-bright mb-2">3.7×</div>
                <div className="text-sm opacity-80">ROI promedio</div>
              </div>
              <div className="text-center bg-brand-aqua/10 rounded-2xl p-6 border border-brand-aqua/20">
                <div className="text-3xl font-bold text-brand-aqua mb-2">65h</div>
                <div className="text-sm opacity-80">Horas liberadas/mes</div>
              </div>
              <div className="text-center bg-brand-waves/10 rounded-2xl p-6 border border-brand-waves/20">
                <div className="text-3xl font-bold text-brand-waves mb-2">CLP 184K</div>
                <div className="text-sm opacity-80">Valor ahorrado/mes</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-brand-bright/10 to-brand-aqua/10 rounded-3xl p-8 border border-brand-bright/20 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-brand-bright">Tu inversión se paga sola</h3>
                <p className="text-lg opacity-90 mb-6">
                  Por menos de CLP 20.000, ahorras CLP 73.800 en tiempo cada mes.
                  <br />
                  Si eliges el plan Pro, recuperas CLP 184.000 en horas liberadas.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button variant="primary" className="px-8 py-4 text-base font-semibold">
                    Calcular mi ROI personalizado
                  </Button>
                  <Button variant="ghost" className="px-8 py-4 text-base font-semibold">
                    Ver casos de éxito
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Sección de Testimonios */}
      <Section className="relative text-brand-pearl py-20 overflow-hidden">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-aqua/25 to-brand-deep">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-waves/5 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-1/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-bright/3 to-transparent transform skew-y-2"></div>
            <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-aqua/4 to-transparent transform -skew-y-3"></div>
            <div className="absolute top-3/4 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-waves/2 to-transparent transform skew-y-1"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand-deep/60 to-brand-deep/75"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-6 text-4xl font-bold md:text-5xl text-brand-bright">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                Restaurantes que ya transformaron su gestión digital
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-brand-aqua/20 backdrop-blur-sm border border-brand-waves/30 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-bright/20 flex items-center justify-center mr-4">
                    <span className="text-brand-bright font-bold text-lg">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-brand-bright">María González</div>
                    <div className="text-sm opacity-70">Restaurante "El Buen Sabor"</div>
                  </div>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  "En 2 semanas ahorré 20 horas semanales. Ahora puedo enfocarme en crear nuevos platos y atender mejor a mis clientes."
                </p>
                <div className="flex text-brand-bright mt-4">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-sm">{star}</span>
                  ))}
                </div>
              </div>

              <div className="bg-brand-aqua/20 backdrop-blur-sm border border-brand-waves/30 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-bright/20 flex items-center justify-center mr-4">
                    <span className="text-brand-bright font-bold text-lg">C</span>
                  </div>
                  <div>
                    <div className="font-semibold text-brand-bright">Carlos Mendoza</div>
                    <div className="text-sm opacity-70">Café "Aroma & Sabor"</div>
                  </div>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  "Las reservas automáticas cambiaron todo. Ya no pierdo clientes por no contestar el teléfono a tiempo."
                </p>
                <div className="flex text-brand-bright mt-4">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-sm">{star}</span>
                  ))}
                </div>
              </div>

              <div className="bg-brand-aqua/20 backdrop-blur-sm border border-brand-waves/30 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-bright/20 flex items-center justify-center mr-4">
                    <span className="text-brand-bright font-bold text-lg">A</span>
                  </div>
                  <div>
                    <div className="font-semibold text-brand-bright">Ana Rodríguez</div>
                    <div className="text-sm opacity-70">Pizzería "Bella Vista"</div>
                  </div>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  "El dashboard me muestra exactamente qué platos venden más. Tomo decisiones basadas en datos reales."
                </p>
                <div className="flex text-brand-bright mt-4">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-sm">{star}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Final */}
      <Section className="relative text-brand-pearl py-20 overflow-hidden">
        {/* Fondo fluido del mar */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-bright via-brand-aqua/30 to-brand-bright">
          {/* Ondas de agua sutiles */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-deep/3 to-transparent transform skew-y-3"></div>
            <div className="absolute top-1/3 left-0 w-full h-full bg-gradient-to-l from-transparent via-brand-waves/2 to-transparent transform -skew-y-1"></div>
            <div className="absolute top-2/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-brand-aqua/2 to-transparent transform skew-y-2"></div>
          </div>
          {/* Efecto de profundidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bright/95 via-brand-bright/85 to-brand-bright/90"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-8 text-4xl font-bold md:text-5xl text-brand-deep">
              Menos tareas. Más control. Más clientes.
            </h2>
            <p className="mb-12 text-xl md:text-2xl text-brand-deep/80 leading-relaxed">
              Digitaliza tu restaurante hoy, libera tiempo y crece con una solución hecha para ti.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button variant="primary" className="px-12 py-6 text-xl font-semibold bg-brand-deep text-brand-bright hover:bg-brand-deep/90">
                Agendar Demo Gratis
              </Button>
              <Button variant="ghost" className="px-12 py-6 text-xl font-semibold text-brand-deep border-brand-deep hover:bg-brand-deep/10">
                Descargar Brochure
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
              Restaurante SaaS - Digitaliza tu restaurante y recupera tu tiempo.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">Navegación</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm hover:text-brand-bright transition">Inicio</Link></li>
              <li><Link href="/saas" className="text-sm hover:text-brand-bright transition">SaaS</Link></li>
              <li><a href="#" className="text-sm hover:text-brand-bright transition">Blog</a></li>
              <li><a href="#" className="text-sm hover:text-brand-bright transition">Contacto</a></li>
            </ul>
          </div>

          {/* Columna 3: CTA */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">¿Listo para empezar?</h3>
            <p className="text-sm mb-4 opacity-80">
              Agenda tu demo gratuita y descubre cómo digitalizar tu restaurante.
            </p>
            <Button variant="primary" className="w-full">
              Agendar Demo Gratis
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