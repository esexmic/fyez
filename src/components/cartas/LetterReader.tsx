/**
 * ============================================================
 * LETTER READER — ABRIR UNA CARTA (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Lector a pantalla completa: el sobre se abre con animación
 *   (solapa + papel que sube), suena un carrillón suave y la
 *   carta queda marcada como leída.
 *
 * ¿Cómo funciona?
 *   - Al abrir: solapa gira, el papel se eleva y el sello se
 *     apaga; luego se muestra la carta completa.
 *   - Escape o el botón cierran; el scroll del fondo se bloquea.
 *   - La primera apertura marca la carta como leída.
 *
 * ¿Dónde modificarlo?
 *   - Duración de la animación: constantes OPEN_STEPS.
 *   - Contenido de las cartas: src/data/letters.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (Letter)
 *   - src/lib/data/index.ts (data.markLetterAsRead)
 *   - src/lib/audio/chime.ts
 *   - motion/react, lucide-react (X, Heart)
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Letter } from "@/lib/data/types";
import { data } from "@/lib/data";
import { playChime } from "@/lib/audio/chime";
import { cn } from "@/lib/utils/cn";

/** Tiempos de la animación de apertura (ms). */
const OPEN_STEPS = {
  flap: 700,
  /** Momento en que el papel empieza a subir. */
  paperDelay: 420,
  paper: 550,
  /** Momento en que se muestra el texto completo. */
  show: 1500,
} as const;

/** Da formato a la fecha (ej: "25 de diciembre de 2025"). */
function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface LetterReaderProps {
  letter: Letter;
  onClose: () => void;
  /** Se llama al marcar la carta como leída (actualiza la lista). */
  onRead?: (id: string) => void;
}

/** Lector a pantalla completa de una carta. */
export function LetterReader({ letter, onClose, onRead }: LetterReaderProps) {
  const [opened, setOpened] = useState(false);
  const marked = useRef(false);

  // Carrillón + apertura del sobre + bloqueo de scroll + pausa del fondo.
  useEffect(() => {
    playChime(false);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("fyez:background-off"));

    const flapTimer = window.setTimeout(() => {
      setOpened(true);
      if (!marked.current) {
        marked.current = true;
        void data.markLetterAsRead(letter.id);
        onRead?.(letter.id);
      }
    }, OPEN_STEPS.show);

    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("fyez:background-on"));
      window.clearTimeout(flapTimer);
    };
  }, [letter.id, onRead]);

  // Cerrar con Escape.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Carta: ${letter.title}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/95 p-4"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar carta"
        className={cn(
          "absolute right-4 top-4 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full",
          "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
        )}
      >
        <X className="size-5" />
      </button>

      {/* Carta */}
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-night-900/95"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Sobre que se abre */}
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex h-[420px] w-full items-center justify-center"
            >
              <div className="relative h-64 w-[26rem] max-w-full">
                {/* Cuerpo del sobre */}
                <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-night-700 to-night-800 shadow-[0_20px_50px_-20px_rgba(10,14,30,0.9)]">
                  {/* Papel que sube */}
                  <motion.div
                    initial={{ y: 48 }}
                    animate={{ y: -96 }}
                    transition={{
                      delay: OPEN_STEPS.paperDelay / 1000,
                      duration: OPEN_STEPS.paper / 1000,
                      ease: "easeOut",
                    }}
                    className="absolute inset-x-4 bottom-0 top-4 rounded-lg bg-gradient-to-br from-[#e9dcc4] to-[#d9c9ae]"
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                      <span className="text-3xl">💌</span>
                      <p className="font-display text-lg font-semibold text-night-900/90">
                        {letter.title}
                      </p>
                      <p className="text-xs text-night-900/60">
                        {formatLongDate(letter.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Solapa del sobre */}
                <motion.div
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: 180 }}
                  transition={{
                    delay: 0.15,
                    duration: OPEN_STEPS.flap / 1000,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "top", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                  className="absolute inset-x-0 top-0 z-10 h-[52px]"
                  aria-hidden
                >
                  <div
                    className="h-0 w-full border-l-[13rem] border-r-[13rem] border-t-[52px] border-l-transparent border-r-transparent border-t-night-700"
                  />
                </motion.div>

                {/* Sello que se apaga al abrir */}
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-28 z-20 flex justify-center"
                  aria-hidden
                >
                  <span className="flex size-12 items-center justify-center rounded-full border border-gold-glow/50 bg-gradient-to-br from-gold-glow/25 to-pink-glow/15 text-gold-glow shadow-[0_0_24px_-6px_rgba(216,189,143,0.6)]">
                    <Heart className="size-5 fill-gold-glow/80" strokeWidth={1.6} />
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="paper"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex max-h-[80vh] flex-col overflow-y-auto px-7 py-9 sm:px-10"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
                {formatLongDate(letter.createdAt)}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-primary sm:text-3xl">
                {letter.title}
              </h2>
              {letter.author && (
                <p className="mt-1 text-xs text-starlight/60">De {letter.author}</p>
              )}

              <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-purple-glow/40 to-transparent" />

              <div className="space-y-5">
                {letter.content.split(/\n\s*\n/).map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm leading-relaxed text-starlight/90 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-gold-glow/80">
                <span className="h-px w-10 bg-gold-glow/30" />
                <Heart className="size-4 fill-gold-glow/50" strokeWidth={1.5} />
                <span className="h-px w-10 bg-gold-glow/30" />
              </div>

              <p className="mt-3 text-center font-display text-lg italic text-primary/85">
                Con todo mi amor.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow px-8 text-sm font-medium text-primary transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                >
                  Guardar esta carta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}