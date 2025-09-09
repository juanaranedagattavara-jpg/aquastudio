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
      {/* Fondo negro puro - sin efectos */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Contenedor del texto centrado como en la referencia */}
      <div className="relative z-50 flex flex-col items-center justify-center min-h-screen px-6 w-full">
        {children}
      </div>
    </div>
  );
};
