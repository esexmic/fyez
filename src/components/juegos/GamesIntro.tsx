/**
 * ============================================================
 * GAMES INTRO — ENTRADA DE MINIJUEGOS (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Encabezado de la página de minijuegos: insignia, título
 *   y la invitación a jugar.
 *
 * ¿Dónde modificarlo?
 *   - Textos: este componente.
 *
 * ¿Qué archivos utiliza?
 *   - lucide-react (Gamepad2)
 */

import { Gamepad2 } from "lucide-react";

export function GamesIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200">
        <Gamepad2 className="size-3.5 text-purple-glow" />
        Minijuegos
      </span>

      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Jugar es otra forma de{" "}
        <span className="text-gradient">querernos</span>
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Juegos que solo existen en nuestro universo, bajo el cielo del
        día cálido. Los récords se quedan guardados en este dispositivo.
      </p>
    </section>
  );
}
