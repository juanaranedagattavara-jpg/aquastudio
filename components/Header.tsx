'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className="relative bg-gradient-to-b from-brand-deep/95 via-brand-deep/75 to-brand-deep/60 backdrop-blur-md border-b border-white/10">
        {/* Degradado adicional para mayor elegancia */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
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

        {/* Mobile Menu Button - Solo visible en móvil */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden absolute top-6 right-6 text-white hover:text-white/80 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/20 bg-brand-deep/98 backdrop-blur-md">
            <nav className="flex flex-col items-center space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-white hover:text-white/80 transition-colors duration-300 group py-2 text-lg font-medium tracking-wide uppercase"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
