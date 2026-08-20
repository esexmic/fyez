/**
 * ============================================================
 * BACKGROUND — EL CIELO VIVO DE LA APP (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Compone el fondo completo: cielo de la atmósfera activa +
 *   partículas, con un fundido suave cada vez que el cielo
 *   cambia de lugar (sección o capítulo).
 *
 * ¿Cómo funciona?
 *   - Se suscribe al store de atmósfera (useSyncExternalStore).
 *   - AnimatePresence funde el cielo anterior con el nuevo.
 *   - El contenido vive en z-10 para quedar siempre legible.
 *
 * ¿Dónde modificarlo?
 *   - Cielos y partículas: src/data/atmospheres.ts.
 *   - Suavidad del fundido: duration (abajo).
 *
 * ¿Qué archivos utiliza?
 *   - ./AtmosphereSky.tsx
 *   - ./ParticleCanvas.tsx
 *   - src/lib/atmosphere.ts
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";

import { AtmosphereSky } from "@/components/background/AtmosphereSky";
import { ParticleCanvas } from "@/components/background/ParticleCanvas";
import { getAtmosphere, subscribeAtmosphere } from "@/lib/atmosphere";
import { cn } from "@/lib/utils/cn";

export interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/** Capa de fondo con el cielo activo. */
export function Background({ children, className }: BackgroundProps) {
  const atmosphereId = useSyncExternalStore(
    subscribeAtmosphere,
    getAtmosphere,
    getAtmosphere,
  );

  return (
    <div className={cn("relative flex min-h-screen w-full flex-col", className)}>
      {/* Cielo + partículas (se funden al cambiar de atmósfera) */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={atmosphereId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <AtmosphereSky id={atmosphereId} />
            <ParticleCanvas id={atmosphereId} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
