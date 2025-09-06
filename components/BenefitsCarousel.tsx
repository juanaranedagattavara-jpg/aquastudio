'use client';

import { useState, useEffect } from 'react';

const benefitsData = [
  { 
    title: "Diseño UX/UI Premium", 
    desc: "Belleza con propósito. Cada elemento está pensado para guiar a tus usuarios hacia la conversión.",
    highlight: "Conversión"
  },
  { 
    title: "Automatización 24/7", 
    desc: "Tu web trabajando mientras duermes. Sistemas inteligentes que capturan y nutren leads automáticamente.",
    highlight: "Eficiencia"
  },
  { 
    title: "Estrategia Escalable", 
    desc: "Crece con sistemas que se adaptan. Arquitectura pensada para el crecimiento sostenible de tu negocio.",
    highlight: "Crecimiento"
  },
  { 
    title: "SEO Optimizado", 
    desc: "Aparécete donde tus clientes te buscan. Visibilidad orgánica que genera tráfico de calidad.",
    highlight: "Visibilidad"
  },
  { 
    title: "Acompañamiento Estratégico", 
    desc: "Un socio digital, no solo un proveedor. Te acompañamos en cada paso de tu transformación digital.",
    highlight: "Partnership"
  },
];

export default function BenefitsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % benefitsData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {benefitsData.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="group p-6 rounded-xl bg-brand-deep/25 backdrop-blur-sm border border-brand-waves/15 transition-all duration-300 hover:bg-brand-deep/40 hover:border-brand-waves/30 hover:shadow-soft hover:-translate-y-1">
                <div className="mb-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand-bright/15 border border-brand-bright/25 text-brand-bright text-xs font-medium mb-3">
                    {item.highlight}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-bright transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm opacity-85 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores del carrusel */}
      <div className="flex justify-center mt-8 space-x-2">
        {benefitsData.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 hover:bg-brand-bright/60 ${
              index === currentIndex 
                ? 'bg-brand-bright/60' 
                : 'bg-brand-waves/40'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
