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
          deep:   "#0D2A3A", // 🌊 fondo hero / secciones oscuras
          aqua:   "#1F4F64", // 💧 overlay / gradientes / secciones intermedias
          waves:  "#3B6F84", // 🔹 hovers / bordes / detalles
          pearl:  "#F7F9FC", // ⚪ tipografía sobre oscuro / fondos claros (no blanco puro)
          bright: "#00C2FF", // 🟦 CTAs / enlaces
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
        "soft-lg": "0 10px 40px -10px rgba(0,0,0,.4)"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
    },
  },
  plugins: [],
} satisfies Config;
