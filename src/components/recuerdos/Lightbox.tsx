/**
 * ============================================================
 * LIGHTBOX — VER UN RECUERDO A PANTALLA COMPLETA (FASE 4)
 * ============================================================
 *
 * ¿Qué hace?
 *   Vista ampliada de un recuerdo: foto/video/nota en grande,
 *   con título, fecha, descripción y flechas para navegar.
 *
 * ¿Cómo funciona?
 *   - Flechas (← →) cambian de recuerdo; Escape cierra.
 *   - Clic fuera del marco cierra el lightbox.
 *   - Carrillón suave al abrir.
 *   - El scroll del fondo se bloquea mientras está abierto.
 *
 * ¿Dónde modificarlo?
 *   - Estilo: clases de este componente.
 *   - Sonido: src/lib/audio/chime.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (Memory)
 *   - src/lib/audio/chime.ts
 *   - next/image (fotos)
 *   - lucide-react (X, ChevronLeft, ChevronRight, Play)
 */

"use client";

import { ChevronLeft, ChevronRight, Pencil, Play, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

import type { Memory } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { cn } from "@/lib/utils/cn";

/** Da formato a la fecha (ej: "25 de diciembre de 2025"). */
function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface LightboxProps {
  memories: Memory[];
  /** Índice del recuerdo visible. */
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  /** Borra el recuerdo actual (quita el visor en la galería). */
  onDelete?: (id: string) => void;
  /** Abre el editor con el recuerdo actual. */
  onEdit?: (memory: Memory) => void;
}

/** Visor a pantalla completa de la galería. */
export function Lightbox({ memories, index, onClose, onNavigate, onDelete, onEdit }: LightboxProps) {
  const memory = memories[index];

  // Carrillón suave al abrir + bloqueo de scroll + pausa del fondo.
  useEffect(() => {
    playChime(true);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("fyez:background-off"));
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("fyez:background-on"));
    };
  }, []);

  // Navegación con el teclado.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate((index - 1 + memories.length) % memories.length);
      if (event.key === "ArrowRight") onNavigate((index + 1) % memories.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, memories.length, onClose, onNavigate]);

  if (!memory) return null;

  const isVideo = memory.kind === "video";
  const isNote = memory.kind === "note";
  const hasPrevious = memories.length > 1;
  const hasNext = memories.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recuerdo: ${memory.title}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/95 p-4"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar recuerdo"
        className={cn(
          "absolute right-4 top-4 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full",
          "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
        )}
      >
        <X className="size-5" />
      </button>

      {/* Anterior */}
      {hasPrevious && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index - 1 + memories.length) % memories.length);
          }}
          aria-label="Recuerdo anterior"
          className={cn(
            "absolute left-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full sm:left-6",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-purple-glow/40 hover:text-primary active:scale-95",
          )}
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      {/* Siguiente */}
      {hasNext && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index + 1) % memories.length);
          }}
          aria-label="Recuerdo siguiente"
          className={cn(
            "absolute right-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full sm:right-6",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-purple-glow/40 hover:text-primary active:scale-95",
          )}
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      {/* Marco del recuerdo */}
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-night-900/95"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Contenido */}
        <div className="relative flex max-h-[62vh] items-center justify-center overflow-hidden">
          {memory.url ? (
            isVideo ? (
              <video
                className="max-h-[62vh] w-full object-contain"
                src={memory.url}
                controls
                autoPlay
                playsInline
                preload="auto"
              />
            ) : (
              <Image
                src={memory.url}
                alt={memory.title}
                width={1280}
                height={960}
                className="max-h-[62vh] w-full object-contain"
              />
            )
          ) : isNote ? (
            <div
              aria-hidden
              className="flex min-h-[260px] w-full flex-col items-center justify-center gap-4 px-8 py-10 text-center"
              style={{ background: memory.tint ?? "linear-gradient(160deg, #1a2348, #3b2f63)" }}
            >
              <span className="text-5xl drop-shadow-[0_6px_18px_rgba(10,14,30,0.5)]">
                {memory.emoji ?? "✦"}
              </span>
              <p className="max-w-md font-display text-xl italic leading-relaxed text-primary/95">
                {memory.description}
              </p>
            </div>
          ) : (
            <div
              aria-hidden
              className="flex min-h-[260px] w-full flex-col items-center justify-center gap-4"
              style={{ background: memory.tint ?? "linear-gradient(160deg, #1a2348, #3b2f63)" }}
            >
              <span className="text-6xl drop-shadow-[0_6px_18px_rgba(10,14,30,0.5)]">
                {memory.emoji ?? "✦"}
              </span>
              <span className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-night-950/50 backdrop-blur-sm">
                <Play className="ml-0.5 size-5 fill-primary/80 text-primary/80" />
              </span>
            </div>
          )}
        </div>

        {/* Pie del recuerdo */}
        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
              {formatLongDate(memory.date)}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-starlight/60">
              {memory.author ? `Subió ${memory.author} · ` : ""}
              {index + 1} / {memories.length}
            </p>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {memory.title}
          </h2>
          {memory.description && (
            <p className="mt-2 text-sm leading-relaxed text-starlight/85">
              {memory.description}
            </p>
          )}
        </div>

        {/* Editar y Borrar */}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(memory)}
            aria-label={`Editar recuerdo: ${memory.title}`}
            className="mx-auto mb-2 flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs text-starlight/40 transition-all duration-300 hover:text-primary active:scale-95"
          >
            <Pencil className="size-3.5" />
            Editar este recuerdo
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(memory.id)}
            aria-label={`Quitar recuerdo: ${memory.title}`}
            className="mx-auto mb-5 flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs text-starlight/40 transition-all duration-300 hover:text-red-300 active:scale-95"
          >
            <Trash2 className="size-3.5" />
            Quitar este recuerdo
          </button>
        )}
      </div>
    </div>
  );
}
