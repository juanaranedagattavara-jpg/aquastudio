import Link from 'next/link';

// Datos de ejemplo para el blog - en producción vendrían de un CMS
const blogPosts = [
  {
    id: 1,
    title: "El Futuro del Diseño Web: Tendencias 2024",
    excerpt: "Exploramos las tendencias más impactantes que están definiendo el diseño web moderno y cómo implementarlas en tu proyecto.",
    date: "15 Marzo 2024",
    readTime: "8 min",
    category: "Diseño",
    featured: true,
    image: "/hero-water.jpg"
  },
  {
    id: 2,
    title: "Estrategias de Conversión que Funcionan",
    excerpt: "Descubre las técnicas probadas para aumentar las conversiones en tu sitio web y maximizar el ROI de tu inversión digital.",
    date: "12 Marzo 2024",
    readTime: "6 min",
    category: "Estrategia",
    featured: false,
    image: "/hero-water.jpg"
  },
  {
    id: 3,
    title: "Automatización Inteligente para Empresas",
    excerpt: "Cómo implementar sistemas de automatización que trabajen 24/7 para tu negocio, liberando tiempo para lo que realmente importa.",
    date: "8 Marzo 2024",
    readTime: "10 min",
    category: "Automatización",
    featured: false,
    image: "/hero-water.jpg"
  },
  {
    id: 4,
    title: "UX/UI: La Diferencia entre Éxito y Fracaso",
    excerpt: "Análisis profundo de cómo una experiencia de usuario excepcional puede transformar completamente los resultados de tu negocio.",
    date: "5 Marzo 2024",
    readTime: "7 min",
    category: "UX/UI",
    featured: false,
    image: "/hero-water.jpg"
  },
  {
    id: 5,
    title: "Branding Digital: Construyendo Identidad",
    excerpt: "Los elementos clave para crear una identidad de marca digital sólida que conecte con tu audiencia y genere confianza.",
    date: "1 Marzo 2024",
    readTime: "9 min",
    category: "Branding",
    featured: false,
    image: "/hero-water.jpg"
  },
  {
    id: 6,
    title: "Performance Web: Optimización Avanzada",
    excerpt: "Técnicas avanzadas para optimizar la velocidad y rendimiento de tu sitio web, mejorando la experiencia del usuario.",
    date: "28 Febrero 2024",
    readTime: "12 min",
    category: "Performance",
    featured: false,
    image: "/hero-water.jpg"
  }
];

const categories = ["Todos", "Diseño", "Estrategia", "Automatización", "UX/UI", "Branding", "Performance"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-brand-deep">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif tracking-tight">
              Blog
            </h1>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Insights, estrategias y tendencias del mundo digital. 
              Donde el conocimiento se encuentra con la acción.
            </p>
          </div>
        </div>
      </section>

      {/* Filtros de Categorías */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 hover:bg-white/5"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={post.id}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 group-hover:bg-white/10 h-full flex flex-col">
                  {/* Imagen */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Categoría */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white/90 transition-colors duration-300 font-serif">
                      {post.title}
                    </h3>
                    
                    <p className="text-white/70 mb-6 leading-relaxed flex-grow">
                      {post.excerpt}
                    </p>

                    {/* Meta información */}
                    <div className="flex items-center justify-between text-sm text-white/50">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Efecto hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6 font-serif">
            Mantente Actualizado
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Recibe los últimos insights y estrategias directamente en tu inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors duration-300"
            />
            <button className="px-8 py-4 bg-white text-brand-deep font-semibold rounded-full hover:bg-white/90 transition-colors duration-300">
              Suscribirse
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
