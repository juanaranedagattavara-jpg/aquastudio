"use client";
import { motion } from "framer-motion";

export default function AnimatedHero() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Contenedor rectangular premium - sin líneas, solo difuminación natural */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
        className="bg-black/20 backdrop-blur-lg rounded-3xl p-12 md:p-16 lg:p-20 shadow-2xl"
      >
        {/* Título principal con más espaciado */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          className="mb-8 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl xl:text-7xl tracking-tight"
        >
          Negocios que fluyen
          <br />
          resultados que crecen
        </motion.h1>
        
        {/* Subtítulo con más espacio y elegancia */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          className="text-lg md:text-xl lg:text-2xl xl:text-3xl opacity-90 leading-relaxed font-light max-w-4xl mx-auto"
        >
          Webs premium y automatización que atraen clientes y te devuelven tiempo
        </motion.p>

        {/* Línea decorativa acuática - difuminación natural */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
          className="mt-8 w-32 h-1 bg-gradient-to-r from-transparent via-brand-aqua/40 to-transparent mx-auto rounded-full blur-sm"
        ></motion.div>
      </motion.div>
    </div>
  );
}
