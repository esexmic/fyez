/**
 * ============================================================
 * CARTAS INTRO — ENTRADA DE LA SECCIÓN DE CARTAS (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Encabezado de la sección: insignia, título y la frase que
 *   invita a abrir los sobres.
 *
 * ¿Cómo funciona?
 *   Componente estático que se compone en la página de cartas.
 *
 * ¿Dónde modificarlo?
 *   - Textos: este componente.
 *
 * ¿Qué archivos utiliza?
 *   - lucide-react (MailHeart)
 */

import { MailOpen } from "lucide-react";

export function CartasIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-pink-200">
        <MailOpen className="size-3.5 text-pink-glow" />
        Cartas
      </span>

      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Palabras que{" "}
        <span className="text-gradient">no se enfrían</span>
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Cada sobre guarda lo que a veces no se dice en voz alta.
        Ábrelos despacio: fueron escritos para ti.
      </p>
    </section>
  );
}