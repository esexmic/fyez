/**
 * ============================================================
 * HISTORY TIMELINE — LÍNEA DE TIEMPO DEL LIBRO (FASE 3)
 * ============================================================
 *
 * ¿Qué hace?
 *   La línea de tiempo de los capítulos: una línea luminosa
 *   que los conecta, con animación de entrada escalonada.
 *   Gestiona el capítulo abierto, el lector, el botón para
 *   escribir/editar un capítulo y su borrado. Todo se guarda
 *   en la nube (Supabase) y se ve en ambos.
 *
 * ¿Cómo funciona?
*  - Carga los capítulos del proveedor de la nube. Nada se
 *     re-siembra: lo borrado queda borrado.
 *   - "Escribir capítulo" abre el compositor; al editar se abre
 *     con el capítulo relleno. Los cambios entran solos a la
 *     línea de tiempo, sin recargar la página.
 *   - Cuenta capítulos leídos por sesión (easter egg).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/history/chapters.ts
 *   - src/lib/data/index.ts (proveedor de la nube)
 *   - ./ChapterCard.tsx / ./ChapterReader.tsx / ./ChapterComposer.tsx
 *   - src/lib/toast.ts (secreto por capítulos leídos)
 */

"use client";

import { motion, type Variants } from "motion/react";
import { PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { data } from "@/lib/data";
import type { StoryChapter } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

import { ChapterCard } from "./ChapterCard";
import { ChapterComposer } from "./ChapterComposer";
import { ChapterReader } from "./ChapterReader";

/** Entrada escalonada de los capítulos. */
const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/** Línea de tiempo de los capítulos. */
export function HistoriaTimeline() {
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [openChapter, setOpenChapter] = useState<StoryChapter | null>(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<StoryChapter | null>(null);
  const readCount = useRef(0);

  // Carga los capítulos de la nube (sin re-siembra).
  useEffect(() => {
    let active = true;
    const run = async () => {
      let list: StoryChapter[] = [];
      try {
        list = await data.getStoryChapters();
      } catch (error) {
        console.error(error);
      }
      if (active) {
        setChapters([...list].sort((a, b) => a.date.localeCompare(b.date)));
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const handleOpen = useCallback((chapter: StoryChapter) => {
    setOpenChapter(chapter);
  }, []);

  const handleClose = useCallback(() => {
    setOpenChapter(null);
    readCount.current += 1;
    // Secreto: al leer 3 capítulos en una sesión.
    if (readCount.current === 3) {
      showToast(
        "Un pequeño secreto",
        "Cada recuerdo que lees enciende una estrella más en nuestro cielo.",
      );
    }
  }, []);

  const handleSaved = useCallback((chapter: StoryChapter) => {
    setComposing(false);
    setEditing(null);
    setOpenChapter((previous) => (previous?.id === chapter.id ? chapter : previous));
    setChapters((previous) => {
      const exists = previous.some((item) => item.id === chapter.id);
      const next = exists
        ? previous.map((item) => (item.id === chapter.id ? chapter : item))
        : [...previous, chapter];
      return next.sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  const handleDelete = useCallback(
    (chapter: StoryChapter) => {
      void data.deleteStoryChapter(chapter.id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setChapters((previous) => previous.filter((item) => item.id !== chapter.id));
      setOpenChapter(null);
      playChime(true);
      showToast("Capítulo borrado", `"${chapter.title}" ya no está en el libro.`);
    },
    [],
  );

  return (
    <section
      aria-label="Línea de tiempo de nuestra historia"
      className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
    >
      {/* Contador + escribir capítulo */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5">
        <span className="glass inline-flex items-center gap-1.5 rounded-full border-white/10 px-4 py-1.5 text-xs text-starlight/70">
          {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"} escritos
        </span>
        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em]",
            "bg-gradient-to-r from-violet-glow/80 via-purple-glow/80 to-pink-glow/80 text-night-950",
            "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-95",
          )}
        >
          <PenLine className="size-3.5" />
          Escribir capítulo
        </button>
      </div>

      <div className="relative">
        {/* La línea que une los capítulos */}
        <div
          aria-hidden
          className="absolute bottom-8 left-[30px] top-2 w-px bg-gradient-to-b from-purple-glow/50 via-pink-glow/30 to-transparent"
        />

        {chapters.length > 0 ? (
          <motion.ol
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="relative flex flex-col gap-10 pl-20 sm:pl-24"
          >
            {chapters.map((chapter, index) => (
              <motion.li key={chapter.id} variants={itemVariants} className="relative">
                {/* Punto luminoso del capítulo */}
                <span
                  aria-hidden
                  className="absolute -left-[76px] top-6 size-3 rounded-full bg-gold-glow shadow-[0_0_14px_3px_rgba(216,189,143,0.4)] sm:-left-[84px]"
                />
                <ChapterCard
                  chapter={chapter}
                  index={index}
                  onOpen={() => handleOpen(chapter)}
                  onEdit={() => setEditing(chapter)}
                  onDelete={() => handleDelete(chapter)}
                />
              </motion.li>
            ))}
          </motion.ol>
        ) : (
          <p className="py-10 text-center text-sm italic text-starlight/60">
            El libro está vacío: escribe el primer capítulo.
          </p>
        )}

        {/* Fin de la línea: una estrella */}
        <div aria-hidden className="relative mt-10 pl-20 sm:pl-24">
          <span className="ml-[19px] flex size-6 animate-sparkle items-center justify-center text-gold-glow">
            ✦
          </span>
        </div>
      </div>

      {/* Lector a pantalla completa */}
      {openChapter && (
        <ChapterReader
          chapter={openChapter}
          onClose={handleClose}
          onEdit={() => setEditing(openChapter)}
          onDelete={() => handleDelete(openChapter)}
        />
      )}

      {/* Compositor de capítulos (nuevo o editando) */}
      {(composing || editing) && (
        <ChapterComposer
          chapter={editing ?? undefined}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
          onCreated={handleSaved}
        />
      )}
    </section>
  );
}