/**
 * ============================================================
 * HISTORIA INTRO — ENTRADA DEL LIBRO (FASE 3)
 * ============================================================
 *
 * ¿Qué hace?
 *   Encabezado del libro: insignia, título, la frase que invita
 *   a entrar y un contador de capítulos.
 *
 * ¿Cómo funciona?
 *   Componente estático que se compone en la página de historia.
 *
 * ¿Dónde modificarlo?
 *   - Textos: este componente.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/history/chapters.ts (número de capítulos)
 *   - lucide-react (BookHeart, Feather)
 */

import { BookHeart, Feather } from "lucide-react";

export function HistoriaIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200">
        <BookHeart className="size-3.5 text-purple-glow" />
        Nuestra Historia
      </span>

      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        El libro de{" "}
        <span className="text-gradient">nosotros</span>
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Cada capítulo es una puerta: ábrela y vuelve a vivir ese día,
        siempre bajo este cielo quieto y oscuro, hecho para la lectura.
      </p>

      <p
        data-chapter-start
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-starlight/80"
      >
        <Feather className="size-4 text-gold-glow" />
        Un libro que seguimos escribiendo juntos
      </p>
    </section>
  );
}
