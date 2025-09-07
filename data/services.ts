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
    title: "Aqua App",
    price: "$1999",
    period: "único",
    description: "Aplicación web completa con funcionalidades avanzadas, panel de administración y experiencia de usuario premium.",
    bullets: [
      "Aplicación web completa",
      "Panel de administración", 
      "Autenticación de usuarios",
      "Base de datos integrada",
      "API personalizada"
    ] as string[],
    cta: { 
      label: "Solicitar propuesta", 
      href: "#contacto" 
    },
  },
  {
    key: "custom",
    title: "Aqua Commerce",
    price: "A medida",
    period: "",
    description: "E-commerce completo con carrito de compras, pasarelas de pago, gestión de inventario y analytics avanzados.",
    bullets: [
      "Tienda online completa",
      "Pasarelas de pago integradas", 
      "Gestión de inventario",
      "Sistema de pedidos",
      "Analytics de ventas"
    ] as string[],
    cta: { 
      label: "Solicitar consultoría", 
      href: "#contacto" 
    },
  },
] as const;
