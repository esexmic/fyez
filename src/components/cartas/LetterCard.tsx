/**
 * ============================================================
 * LETTER CARD — UN SOBRE EN LA LISTA (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Tarjeta de la lista de cartas. Si no está leída muestra un
 *   sobre cerrado con sello dorado; si ya se leyó, una vista
 *   de papel abierto con las primeras líneas.
 *
 * ¿Cómo funciona?
 *   - read: define si el sobre aparece cerrado o abierto.
 *   - Al pulsar, la galería abre el lector (LetterReader).
 *
 * ¿Dónde modificarlo?
 *   - Estilo: clases de este componente.
 *   - Contenido: src/data/letters.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (Letter)
 *   - lucide-react (Heart, Lock, Check)
 */

"use client";

import { Check, Heart, Lock } from "lucide-react";

import type { Letter } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

/** Da formato a la fecha (ej: "25 dic 2025"). */
function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface LetterCardProps {
  letter: Letter;
  read: boolean;
  onOpen: (letter: Letter) => void;
}

/** Tarjeta de una carta (sobre cerrado o abierto). */
export function LetterCard({ letter, read, onOpen }: LetterCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(letter)}
      aria-label={`${read ? "Releer" : "Abrir"} carta: ${letter.title}`}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center overflow-hidden rounded-3xl text-left",
        "glass transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-pink-glow/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-glow/70",
      )}
    >
      <div className="flex w-full flex-col items-center px-6 pb-6 pt-8">
        {/* Sobre */}
        <div
          className={cn(
            "relative flex h-44 w-full max-w-72 flex-col items-center justify-center rounded-xl",
            "border transition-colors duration-500",
            read
              ? "border-white/10 bg-gradient-to-br from-night-800/80 to-night-700/60"
              : "border-purple-glow/25 bg-gradient-to-br from-night-800 to-night-700 shadow-[0_10px_30px_-12px_rgba(141,130,214,0.35)]",
          )}
        >
          {/* Solapa del sobre */}
          <span
            aria-hidden
            className={cn(
              "absolute -top-px left-1/2 h-0 w-0 -translate-x-1/2 border-l-[72px] border-r-[72px] border-t-[52px] border-l-transparent border-r-transparent",
              read
                ? "border-t-night-700/80"
                : "border-t-night-700 transition-transform duration-500 group-hover:-translate-y-0.5",
            )}
          />
          {/* Sello */}
          {read ? (
            <span className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-night-700/80 text-starlight/70">
              <Check className="size-5" strokeWidth={2.2} />
            </span>
          ) : (
            <span className="flex size-11 items-center justify-center rounded-full border border-gold-glow/50 bg-gradient-to-br from-gold-glow/25 to-pink-glow/15 text-gold-glow shadow-[0_0_18px_-4px_rgba(216,189,143,0.5)]">
              <Heart className="size-5 fill-gold-glow/80" strokeWidth={1.6} />
            </span>
          )}
          {/* Estado */}
          <span
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
              read
                ? "border border-white/10 bg-white/[0.04] text-starlight/60"
                : "border border-gold-glow/30 bg-night-950/50 text-gold-glow",
            )}
          >
            {read ? (
              <>
                <Check className="size-3" /> Leída
              </>
            ) : (
              <>
                <Lock className="size-3" /> Sin abrir
              </>
            )}
          </span>
        </div>

        {/* Título y fecha */}
        <h3 className="mt-5 text-center font-display text-lg font-semibold text-primary">
          {letter.title}
        </h3>
        <p className="mt-1 text-xs text-starlight/70">
          {formatShortDate(letter.createdAt)}
          {letter.author && (
            <span className="text-starlight/55"> · de {letter.author}</span>
          )}
        </p>
      </div>
    </button>
  );
}