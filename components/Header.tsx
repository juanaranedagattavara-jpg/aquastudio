'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { 
      name: 'SaaS', 
      href: '/saas',
      submenu: [
        { name: 'Restaurante SaaS', href: '/saas/restaurante' }
      ]
    },
    { name: 'Blog', href: '/blog' },
  ];

  // Controlar la visibilidad del header basado en el scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si está en la parte superior, siempre mostrar
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling hacia abajo - ocultar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling hacia arriba - mostrar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      {/* Línea horizontal delgada que cubre toda la pantalla */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-aqua/40 to-transparent"></div>
      
      <div className="relative bg-black backdrop-blur-md border-b border-brand-aqua/20">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo a la izquierda */}
            <Link 
              href="/" 
              className="text-3xl font-bold text-white hover:text-white/90 transition-all duration-300 tracking-wide font-serif"
            >
              Aqua Studio
            </Link>
            
            {/* Navegación centrada */}
            <nav className="hidden md:flex items-center space-x-12">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="relative text-white/90 hover:text-white transition-all duration-300 group text-sm font-medium tracking-wide uppercase"
                  >
                    {item.name}
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  
                  {/* Submenú */}
                  {item.submenu && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-brand-deep/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-3 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
            
            {/* Espacio para balancear el layout */}
            <div className="hidden md:block w-32"></div>
          </div>
        </div>

      </div>
    </header>
  );
}
