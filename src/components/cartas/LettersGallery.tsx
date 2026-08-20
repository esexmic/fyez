/**
 * ============================================================
 * LETTERS GALLERY — LA LISTA DE CARTAS (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   La lista completa de cartas: filtro (todas / sin abrir),
 *   rejilla de sobres, botón para escribir una carta y el
 *   lector a pantalla completa.
 *
 * ¿Cómo funciona?
 *   - Las cartas se leen del proveedor de datos (hoy el
 *     navegador; cuando haya base de datos, la nube).
 *   - Se ordenan de la más antigua a la más reciente.
 *   - Al abrir un sobre se marca como leída; al escribir una
 *     carta nueva se agrega al final de la lista.
 *
 * ¿Dónde modificarlo?
 *   - Contenido inicial: src/data/letters.ts.
 *   - Guardado: src/lib/data/ (proveedores).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/letters.ts (cartas iniciales)
 *   - src/lib/data/index.ts (data.getLetters, markLetterAsRead)
 *   - ./LetterCard.tsx
 *   - ./LetterReader.tsx
 *   - ./LetterComposer.tsx
 */

"use client";

import { motion, type Variants } from "motion/react";
import { Cloud, HardDrive, PenLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Letter } from "@/lib/data/types";
import { data } from "@/lib/data";
import { cn } from "@/lib/utils/cn";

import { LetterCard } from "./LetterCard";
import { LetterComposer } from "./LetterComposer";
import { LetterReader } from "./LetterReader";

type LetterFilter = "all" | "unread";

const FILTERS: Array<{ id: LetterFilter; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "Sin abrir" },
];

/** Entrada escalonada de la rejilla. */
const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function LettersGallery() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LetterFilter>("all");
  const [openLetter, setOpenLetter] = useState<Letter | null>(null);
  const [composing, setComposing] = useState(false);

  // Carga de cartas: de la más antigua a la más reciente.
  useEffect(() => {
    let active = true;
    data
      .getLetters()
      .then((items) => {
        if (!active) return;
        const sorted = [...items].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        setLetters(sorted);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return letters;
    return letters.filter((letter) => !letter.read);
  }, [filter, letters]);

  const unreadCount = useMemo(
    () => letters.filter((letter) => !letter.read).length,
    [letters],
  );

  const handleOpen = useCallback((letter: Letter) => {
    setOpenLetter(letter);
  }, []);

  const handleClose = useCallback(() => {
    setOpenLetter(null);
  }, []);

  const handleRead = useCallback((id: string) => {
    void data.markLetterAsRead(id);
    setLetters((previous) =>
      previous.map((letter) =>
        letter.id === id ? { ...letter, read: true } : letter,
      ),
    );
  }, []);

  const handleCreated = useCallback((letter: Letter) => {
    setComposing(false);
    setLetters((previous) => [...previous, letter].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    ));
  }, []);

  return (
    <section
      data-letters-gallery
      aria-label="Cartas"
      className="relative mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6"
    >
      {/* Filtros + escribir carta */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
{FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center justify-center rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]",
              filter === option.id
                ? "border-pink-glow/50 bg-gradient-to-r from-violet-glow/30 to-pink-glow/20 text-primary"
                : "glass text-starlight/85 hover:border-white/25 hover:text-primary",
            )}
          >
            {option.label}
          </button>
        ))}

        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-starlight/70">
          {loading
            ? "Cargando cartas…"
            : unreadCount > 0
              ? (
                  <>
                    <span className="size-1.5 animate-pulse rounded-full bg-gold-glow" />
                    {unreadCount} {unreadCount === 1 ? "carta sin abrir" : "cartas sin abrir"}
                  </>
                )
              : "Todas las cartas están leídas"}
        </span>

        <span
          className={cn(
            "ml-2 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs",
            data.name === "supabase"
              ? "border-green-glow/25 bg-white/[0.03] text-green-glow/90"
              : "border-white/10 bg-white/[0.03] text-starlight/70",
          )}
        >
          {data.name === "supabase" ? (
            <>
              <Cloud className="size-3.5" />
              Nube conectada
            </>
          ) : (
            <>
              <HardDrive className="size-3.5" />
              Este dispositivo
            </>
          )}
        </span>

        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium",
            "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
            "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
          )}
        >
          <PenLine className="size-4" />
          Escribir una carta
        </button>
      </div>

      {/* Rejilla de sobres */}
      {loading ? (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Abriendo el buzón…
        </p>
      ) : visible.length > 0 ? (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {visible.map((letter) => (
            <motion.div key={letter.id} variants={itemVariants}>
              <LetterCard
                letter={letter}
                read={letter.read}
                onOpen={handleOpen}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          No hay cartas por aquí todavía.
        </p>
      )}

      {/* Lector a pantalla completa */}
      {openLetter && (
        <LetterReader letter={openLetter} onClose={handleClose} onRead={handleRead} />
      )}

      {/* Compositor */}
      {composing && (
        <LetterComposer onClose={() => setComposing(false)} onCreated={handleCreated} />
      )}
    </section>
  );
}