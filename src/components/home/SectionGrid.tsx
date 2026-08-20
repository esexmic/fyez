/**
 * ============================================================
 * SECTION GRID — REJILLA DE SECCIONES (DISEÑO FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Muestra las 12 secciones del universo en una rejilla
 *   responsiva con animación de entrada escalonada.
 *
 * ¿Cómo funciona?
 *   - Lee SECTIONS (data/sections.ts) y genera SectionCard.
 *   - Cada tarjeta entra con fade + blur + desplazamiento
 *     cuando aparece en pantalla (whileInView).
 *   - Rejilla: 1 columna (móvil) → 2 (tablet) → 3 (PC).
 *
 * ¿Dónde modificarlo?
 *   - Columnas: clases del grid.
 *   - Retraso de entrada: staggerChildren.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/home/SectionCard.tsx
 *   - src/data/sections.ts
 *   - motion/react (animaciones)
 */

"use client";

import { motion, type Variants } from "motion/react";

import { SectionCard } from "@/components/home/SectionCard";
import { SECTIONS } from "@/data/sections";

/** Animación escalonada de entrada de las tarjetas. */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function SectionGrid() {
  return (
    <section
      id="nuestros-lugares"
      className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6"
      aria-label="Secciones del universo"
    >
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12 flex flex-col items-center gap-4 text-center"
      >
        <span className="glass rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200">
          Bienvenido a casa
        </span>
        <h2 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
          Nuestros recuerdos
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-starlight/80 sm:text-base">
          Cada página nació en memoria de nuestro amor. En todas puedes
          modificar, agregar y quitar lo que quieras: esto es para ti.
        </p>
      </motion.div>

      {/* Rejilla de puertas */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {SECTIONS.map((section, index) => (
          <motion.div key={section.id} variants={cardVariants}>
            <SectionCard section={section} index={index} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
