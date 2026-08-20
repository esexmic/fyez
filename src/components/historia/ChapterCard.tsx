/**
 * ============================================================
 * CHAPTER CARD — UN CAPÍTULO DEL LIBRO (FASE 3)
 * ============================================================
 *
 * ¿Qué hace?
 *   Nodo de la línea de tiempo: numeral romano, fecha, título,
 *   primeras palabras, la franja de su cielo y la invitación
 *   a abrirlo.
 *
 * ¿Cómo funciona?
 *   - Es un botón: al pulsarlo, HistoriaTimeline abre el lector.
 *   - La franja superior muestra el cielo del capítulo.
 *
 * ¿Dónde modificarlo?
 *   - Estilo: clases de este componente.
 *   - Contenido: src/data/history/chapters.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (StoryChapter)
 *   - src/data/atmospheres.ts (cielo del capítulo)
 *   - lucide-react (BookOpen)
 */

"use client";

import { BookOpen, Pencil, Trash2 } from "lucide-react";

import { getAtmosphere } from "@/data/atmospheres";
import type { AtmosphereId } from "@/data/atmospheres";
import type { StoryChapter } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

/** Convierte un número a numeral romano (hasta 39). */
function toRoman(num: number): string {
  const values: Array<[number, string]> = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let rest = num;
  for (const [value, symbol] of values) {
    while (rest >= value) {
      result += symbol;
      rest -= value;
    }
  }
  return result;
}

/** Da formato a la fecha (ej: "25 de diciembre de 2025"). */
function formatDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface ChapterCardProps {
  chapter: StoryChapter;
  /** Posición en la línea de tiempo (para el numeral). */
  index: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Tarjeta de capítulo de la línea de tiempo.
 * @example <ChapterCard chapter={chapter} index={0} onOpen={...} />
 */
export function ChapterCard({ chapter, index, onOpen, onEdit, onDelete }: ChapterCardProps) {
  const atmosphere = getAtmosphere((chapter.atmosphere as AtmosphereId) ?? "noche-tranquila");
  const excerpt = chapter.content.slice(0, 110);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Abrir capítulo ${toRoman(index + 1)}: ${chapter.title}`}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-4 overflow-hidden rounded-3xl p-6 text-left",
        "glass transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-purple-glow/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-glow/70",
      )}
    >
      {/* Editar y borrar */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          aria-label={`Editar capítulo: ${chapter.title}`}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-night-950/60 text-starlight/70 opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-purple-glow/50 hover:text-primary group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label={`Borrar capítulo: ${chapter.title}`}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-night-950/60 text-starlight/70 opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-red-400/50 hover:text-red-300 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Cielo del capítulo (ventana) */}
      <div
        aria-hidden
        className="relative h-20 overflow-hidden rounded-2xl border border-white/10"
        style={{ background: atmosphere.sky }}
      >
        <span className="absolute bottom-1.5 left-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/85 drop-shadow-[0_1px_3px_rgba(10,14,30,0.7)]">
          {atmosphere.name}
        </span>
        <span className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[10px] text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <BookOpen className="size-3" />
          Abrir capítulo
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-glow/30 to-pink-glow/10 font-display text-lg text-purple-200 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110">
          {toRoman(index + 1)}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-glow/90">
            {formatDate(chapter.date)}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-primary">
            {chapter.title}
          </h3>
          {chapter.author && (
            <p className="mt-1 text-[11px] text-starlight/50">
              Escrito por {chapter.author}
            </p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-starlight/80">
            {excerpt}…
          </p>
        </div>
      </div>
    </div>
  );
}
