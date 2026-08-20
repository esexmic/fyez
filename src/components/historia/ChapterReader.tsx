/**
 * ============================================================
 * CHAPTER READER — ABRIR UN RECUERDO (FASE 3)
 * ============================================================
 *
 * ¿Qué hace?
 *   Lector a pantalla completa: al abrir un capítulo, la
 *   ventana crece con una transición cinematográfica y suena un
 *   carrillón suave. El fondo se mantiene oscuro: la página
 *   no cambia de cielo al abrir el libro.
 *
 * ¿Cómo funciona?
 *   - AnimatePresence + motion: fade, escala y blur de entrada.
 *   - Al abrir: playChime(). Al cerrar: carrillón tenue.
 *   - Escape cierra; el scroll del fondo se bloquea mientras.
 *
 * ¿Dónde modificarlo?
 *   - Cielos por capítulo: src/data/history/chapters.ts.
 *   - Sonido: src/lib/audio/chime.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/audio/chime.ts
 *   - src/lib/data/types.ts (StoryChapter)
 *   - lucide-react (X, Feather)
 */

"use client";

import { Feather, Pencil, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

import { getAtmosphere } from "@/data/atmospheres";
import type { AtmosphereId } from "@/data/atmospheres";
import type { StoryChapter } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { cn } from "@/lib/utils/cn";

/** Da formato a la fecha (ej: "25 de diciembre de 2025"). */
function formatDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface ChapterReaderProps {
  chapter: StoryChapter | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Lector a pantalla completa de un capítulo. */
export function ChapterReader({ chapter, onClose, onEdit, onDelete }: ChapterReaderProps) {
  const open = chapter !== null;
  const atmosphere = chapter
    ? getAtmosphere((chapter.atmosphere as AtmosphereId) ?? "noche-tranquila")
    : null;

  // Sonido y bloqueo de scroll al abrir/cerrar.
  useEffect(() => {
    if (open) {
      playChime(false);
      document.body.style.overflow = "hidden";
    } else {
      playChime(true);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!chapter || !atmosphere) return null;

  const paragraphs = chapter.content.split("\n\n");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Capítulo: ${chapter.title}`}
      className="fixed inset-0 z-[60] overflow-y-auto bg-night-950/95"
    >
      <motion.article
        initial={{ opacity: 0, scale: 0.96, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.97, filter: "blur(14px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass mx-auto my-10 w-[min(92vw,640px)] overflow-hidden rounded-3xl"
      >
        {/* El cielo del capítulo */}
        <div
          aria-hidden
          className="relative h-32 w-full sm:h-40"
          style={{ background: atmosphere.sky }}
        >
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-night-950/70 to-transparent" />
          <p className="absolute bottom-3 left-5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/85">
            Bajo el cielo de {atmosphere.name}
          </p>
        </div>

        {/* Cuerpo del capítulo */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-glow/90">
              {formatDate(chapter.date)}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar capítulo"
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-full",
                "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
              )}
            >
              <X className="size-4.5" />
            </button>
          </div>

          <h2 className="mt-4 font-display text-3xl font-semibold text-primary sm:text-4xl">
            {chapter.title}
          </h2>

          <div className="mt-6 space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] leading-[1.85] text-primary/90 sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {chapter.quote && (
            <blockquote className="mt-8 flex items-start gap-3 border-l-2 border-purple-glow/40 pl-4">
              <Feather className="mt-1 size-4 shrink-0 text-gold-glow" />
              <p className="font-display text-lg italic leading-relaxed text-purple-200">
                {chapter.quote}
              </p>
            </blockquote>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="text-xs text-starlight/50">
              {chapter.author ? (
                <>
                  Escrito por <span className="text-starlight/80">{chapter.author}</span>
                </>
              ) : (
                "El libro sigue escribiéndose."
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Editar capítulo: ${chapter.title}`}
                className="glass inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-medium text-primary transition-all duration-300 hover:border-purple-glow/50 hover:text-purple-200 active:scale-[0.97]"
              >
                <Pencil className="size-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Borrar capítulo: ${chapter.title}`}
                className="glass inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-medium text-starlight/70 transition-all duration-300 hover:border-red-400/40 hover:text-red-300 active:scale-[0.97]"
              >
                <Trash2 className="size-3.5" />
                Borrar
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="glass inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium text-primary transition-all duration-300 hover:border-white/25 hover:bg-white/10 active:scale-[0.97]"
            >
              Volver al libro
            </button>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
