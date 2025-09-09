import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { 
      center: true, 
      padding: "1.5rem", // Aumentado el padding para más "espacio en blanco"
      screens: { 
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px", 
        "2xl": "1440px" 
      } 
    },
    extend: {
        colors: {
          brand: {
            deep:   "#000000", // 🖤 negro profundo - fondo principal
            aqua:   "#1F2937", // 🔘 gris oscuro - secciones intermedias
            waves:  "#374151", // 🔹 gris medio - hovers y detalles
            pearl:  "#F9FAFB", // ⚪ tipografía sobre oscuro
            bright: "#3B82F6", // 🟦 azul brillante premium - CTAs
            accent: "#1D4ED8", // 🌊 azul medio para detalles
            dark:   "#111827", // 🖤 gris muy oscuro - fondos alternativos
          },
        },
      borderRadius: { 
        xl: "1rem", 
        "2xl": "1.25rem", 
        "3xl": "1.5rem",
        full: "9999px" 
      },
      boxShadow: { 
        soft: "0 6px 24px -6px rgba(0,0,0,.35)",
        "soft-lg": "0 10px 40px -10px rgba(0,0,0,.4)",
        "2xl": "0 25px 50px -12px rgba(0,0,0,.25)",
        "3xl": "0 35px 60px -12px rgba(0,0,0,.3)"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'aquatic-flow': {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '0.8' },
          '25%': { transform: 'scale(1.1) rotate(90deg)', opacity: '0.6' },
          '50%': { transform: 'scale(0.9) rotate(180deg)', opacity: '0.9' },
          '75%': { transform: 'scale(1.05) rotate(270deg)', opacity: '0.7' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '0.8' },
        },
        'gentle-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        'water-ripple': {
          '0%': { transform: 'scale(0.8)', opacity: '0.4' },
          '50%': { transform: 'scale(1.2)', opacity: '0.1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'floating': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-10px) translateX(5px)' },
          '50%': { transform: 'translateY(-5px) translateX(-5px)' },
          '75%': { transform: 'translateY(-15px) translateX(3px)' },
        },
      },
      animation: {
        'aquatic-flow': 'aquatic-flow 20s ease-in-out infinite',
        'gentle-pulse': 'gentle-pulse 8s ease-in-out infinite',
        'water-ripple': 'water-ripple 12s ease-out infinite',
        'floating': 'floating 15s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
