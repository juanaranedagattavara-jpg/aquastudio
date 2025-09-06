export const services = [
  {
    key: "growth",
    title: "Aqua Growth",
    price: "$999",
    period: "único",
    description: "Web multipágina con SEO optimizado e integraciones inteligentes. Base sólida, lista para escalar.",
    bullets: [
      "Arquitectura SEO optimizada",
      "Integraciones esenciales", 
      "Performance AA",
      "Diseño responsive premium",
      "Automatización básica"
    ] as string[],
    cta: { 
      label: "Solicitar propuesta", 
      href: "#contacto" 
    },
  },
  {
    key: "scale",
    title: "Aqua Scale",
    price: "$1999",
    period: "único",
    description: "Web + e-commerce + funnels automatizados + dashboard de métricas. Crecimiento en serio.",
    bullets: [
      "E-commerce completo",
      "Funnels automatizados", 
      "Dashboard de KPIs",
      "Integraciones avanzadas",
      "Acompañamiento estratégico"
    ] as string[],
    cta: { 
      label: "Solicitar propuesta", 
      href: "#contacto" 
    },
  },
  {
    key: "custom",
    title: "Aqua Custom",
    price: "A medida",
    period: "",
    description: "Proyectos a medida para exclusividad digital absoluta.",
    bullets: [
      "Diseño completamente a medida",
      "Integraciones personalizadas", 
      "Acompañamiento estratégico completo",
      "Soporte premium 24/7",
      "Escalabilidad ilimitada"
    ] as string[],
    cta: { 
      label: "Solicitar consultoría", 
      href: "#contacto" 
    },
  },
] as const;
