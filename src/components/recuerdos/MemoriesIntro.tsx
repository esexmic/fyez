/**
 * ============================================================
 * MEMORIES INTRO — ENTRADA DE LA GALERÍA (FASE 4)
 * ============================================================
 *
 * ¿Qué hace?
 *   Encabezado de la galería: insignia, título y la frase que
 *   invita a recorrer los momentos.
 *
 * ¿Cómo funciona?
 *   Componente estático que se compone en la página de recuerdos.
 *
 * ¿Dónde modificarlo?
 *   - Textos: este componente.
 *
 * ¿Qué archivos utiliza?
 *   - lucide-react (Camera)
 */

import { Camera } from "lucide-react";

export function MemoriesIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200">
        <Camera className="size-3.5 text-purple-glow" />
        Recuerdos
      </span>

      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Momentos que{" "}
        <span className="text-gradient">no se olvidan</span>
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Cada foto, video y carta es un recuerdo que nos persigue por nuestra eternidad.
      </p>
    </section>
  );
}
