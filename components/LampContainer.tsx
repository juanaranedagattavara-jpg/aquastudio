"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black w-full z-0",
        className
      )}
    >
      {/* Fondo con gradiente sutil para que se vea el efecto */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-black to-brand-deep"></div>
      
      {/* Círculo de energía acuática principal - diseño premium espacioso */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] xl:w-[1000px] xl:h-[1000px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.2 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 2.5,
            ease: "easeOut",
          }}
          className="relative w-full h-full"
        >
          {/* Círculo de energía principal - más visible */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-brand-bright/60 via-brand-aqua/40 to-transparent blur-2xl animate-pulse"></div>
          
          {/* Capa interna de energía - más visible */}
          <div className="absolute inset-12 rounded-full bg-gradient-radial from-brand-bright/50 via-brand-aqua/30 to-transparent blur-xl animate-pulse delay-1000"></div>
          
          {/* Núcleo central brillante - más prominente */}
          <div className="absolute inset-24 rounded-full bg-gradient-radial from-brand-bright/40 via-brand-aqua/20 to-transparent blur-lg animate-pulse delay-2000"></div>
          
          {/* Anillo exterior de energía - más visible */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-bright/40 animate-pulse delay-3000"></div>
        </motion.div>
      </div>

      {/* Ondas de energía concéntricas - más espaciadas y elegantes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.6,
          duration: 3,
          ease: "easeOut",
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] md:w-[1200px] md:h-[1200px] lg:w-[1400px] lg:h-[1400px] rounded-full border border-brand-bright/20 animate-spin"
        style={{animationDuration: '25s'}}
      ></motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.9,
          duration: 3.5,
          ease: "easeOut",
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] md:w-[1500px] md:h-[1500px] lg:w-[1800px] lg:h-[1800px] rounded-full border border-brand-aqua/15 animate-spin"
        style={{animationDuration: '35s', animationDirection: 'reverse'}}
      ></motion.div>

      {/* Efectos de partículas de energía */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: 2,
          ease: "easeOut",
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px]"
      >
        {/* Partículas flotantes - más visibles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-brand-bright/80 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-brand-aqua/70 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-brand-bright/60 rounded-full animate-ping delay-3000"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-brand-aqua/50 rounded-full animate-ping delay-4000"></div>
      </motion.div>

      {/* Contenedor del texto centrado como en la referencia */}
      <div className="relative z-50 flex flex-col items-center justify-center min-h-screen px-6 w-full">
        {children}
      </div>
    </div>
  );
};
