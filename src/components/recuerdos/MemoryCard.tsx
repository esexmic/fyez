/**
 * ============================================================
 * MEMORY CARD — UN RECUERDO EN LA GALERÍA (FASE 4)
 * ============================================================
 *
 * ¿Qué hace?
 *   Tarjeta de la galería: si hay foto/video la muestra; si no,
 *   un "cielo de recuerdo" con emoji y gradiente. Al pasar el
 *   mouse, el contenido se acerca y aparece la descripción.
 *
 * ¿Cómo funciona?
 *   - kind "photo": imagen con lazy loading (next/image).
 *   - kind "video": marco con botón de reproducir.
 *   - kind "note": la nota se lee dentro del marco.
 *   - Al pulsar, la galería abre el lightbox.
 *
 * ¿Dónde modificarlo?
 *   - Estilo: clases de este componente.
 *   - Contenido: src/data/memories.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (Memory)
 *   - next/image (fotos)
 *   - lucide-react (Play, ImageOff)
 */

"use client";

import { ImageOff, Play } from "lucide-react";
import Image from "next/image";

import type { Memory } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

/** Da formato a la fecha (ej: "25 dic 2025"). */
function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface MemoryCardProps {
  memory: Memory;
  onOpen: (memory: Memory) => void;
}

/** Tarjeta de un recuerdo. */
export function MemoryCard({ memory, onOpen }: MemoryCardProps) {
  const isVideo = memory.kind === "video";
  const isNote = memory.kind === "note";

  return (
    <button
      type="button"
      onClick={() => onOpen(memory)}
      aria-label={`Abrir recuerdo: ${memory.title}`}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-3xl text-left",
        "glass transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-pink-glow/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-glow/70",
      )}
    >
      {/* Marco del recuerdo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {memory.url ? (
          isVideo ? (
            <>
              <video
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={memory.url}
                muted
                playsInline
                preload="metadata"
                aria-label={memory.title}
              />
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-night-950/30"
              >
                <span className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-night-950/60 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                  <Play className="ml-0.5 size-5 fill-primary/80 text-primary/80" />
                </span>
              </span>
            </>
          ) : (
            <Image
              src={memory.url}
              alt={memory.title}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )
        ) : (
          /* Cielo de recuerdo (sin foto todavía) */
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-105"
            style={{ background: memory.tint ?? "linear-gradient(160deg, #1a2348, #3b2f63)" }}
          >
            <span className="text-5xl drop-shadow-[0_6px_18px_rgba(10,14,30,0.5)]">
              {memory.emoji ?? "✦"}
            </span>
          </div>
        )}

        {/* Degradado inferior */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-night-950/85 via-night-950/20 to-transparent"
        />

        {/* Tipo de recuerdo */}
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-night-950/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-primary/85 backdrop-blur-sm">
          {isVideo ? "Video" : isNote ? "Nota" : "Foto"}
        </span>

        {/* Título y fecha */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-lg font-semibold text-primary drop-shadow-[0_2px_6px_rgba(10,14,30,0.8)]">
            {memory.title}
          </h3>
          <p className="mt-0.5 text-xs text-starlight/85">
            {formatShortDate(memory.date)}
            {memory.author && (
              <span className="text-starlight/55"> · subió {memory.author}</span>
            )}
          </p>
        </div>

        {/* Descripción al hover */}
        {memory.description && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-night-950/95 to-night-950/60 p-4 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-sm leading-relaxed text-primary/90">
              {memory.description}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

/** Icono para recuerdos sin contenido cargado. */
export function MemoryEmptyIcon() {
  return <ImageOff className="size-8 text-starlight/40" />;
}
