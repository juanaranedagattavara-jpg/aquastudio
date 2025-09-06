'use client';

import { useState, useEffect } from 'react';

const benefitsData = [
  { 
    title: "Estrategia Digital Integral", 
    desc: "Análisis profundo de tu mercado y competencia. Desarrollamos una hoja de ruta personalizada que maximiza tu potencial de crecimiento.",
    highlight: "Fundación"
  },
  { 
    title: "Diseño UX/UI Premium", 
    desc: "Belleza con propósito. Cada elemento está pensado para guiar a tus usuarios hacia la conversión de manera natural y elegante.",
    highlight: "Experiencia"
  },
  { 
    title: "SEO & Visibilidad Orgánica", 
    desc: "Aparécete donde tus clientes te buscan. Posicionamiento estratégico que genera tráfico de calidad y autoridad de marca.",
    highlight: "Visibilidad"
  },
  { 
    title: "Automatización Inteligente", 
    desc: "Tu web trabajando 24/7. Sistemas avanzados que capturan, nutren y convierten leads automáticamente mientras duermes.",
    highlight: "Eficiencia"
  },
  { 
    title: "Escalabilidad & Crecimiento", 
    desc: "Arquitectura pensada para el futuro. Sistemas que crecen contigo, adaptándose a las necesidades de tu negocio en expansión.",
    highlight: "Futuro"
  },
  { 
    title: "Acompañamiento Estratégico", 
    desc: "Un socio digital de confianza. Te acompañamos en cada paso de tu transformación digital con soporte premium y consultoría especializada.",
    highlight: "Partnership"
  },
];

export default function BenefitsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Duplicar los datos para crear un loop infinito
  const duplicatedData = [...benefitsData, ...benefitsData];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 3;
        // Si llegamos al final de la primera copia, saltar al inicio sin transición
        if (nextIndex >= benefitsData.length) {
          setTimeout(() => {
            setCurrentIndex(0);
            setIsTransitioning(false);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 500);
          return nextIndex;
        }
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="overflow-hidden">
        <div 
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
        >
          {duplicatedData.map((item, index) => (
            <div key={index} className="w-1/3 flex-shrink-0 px-4">
              <div className="group p-6 rounded-xl bg-brand-deep/25 backdrop-blur-sm border border-brand-waves/15 transition-all duration-300 hover:bg-brand-deep/40 hover:border-brand-waves/30 hover:shadow-soft hover:-translate-y-1 h-full flex flex-col">
                <div className="mb-4 flex-shrink-0">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium mb-3">
                    {item.highlight}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm opacity-85 leading-relaxed flex-grow">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores del carrusel */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.ceil(benefitsData.length / 3) }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 hover:bg-brand-bright/60 ${
              index === Math.floor(currentIndex % benefitsData.length / 3)
                ? 'bg-brand-bright/60' 
                : 'bg-brand-waves/40'
            }`}
            onClick={() => goToSlide(index * 3)}
          />
        ))}
      </div>
    </div>
  );
}
