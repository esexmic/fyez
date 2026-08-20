/** Encabezado de la sección de regalos. */
import { Gift } from "lucide-react";

export function RegalosIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-blush-200">
        <Gift className="size-3.5 text-blush-glow" />
        Regalos
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Tesoros que{" "}
        <span className="text-gradient">nos hemos dado</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        No importa el tamaño: cada regalo guarda un pedacito de nosotros.
      </p>
    </section>
  );
}