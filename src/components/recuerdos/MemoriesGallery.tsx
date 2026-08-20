/**
 * ============================================================
 * MEMORIES GALLERY — LA GALERÍA DE RECUERDOS (FASE 4) +
 * GALERÍA COLECCIONABLE (FASE 15)
 * ============================================================
 *
 * ¿Qué hace?
 *   La galería completa: filtros (todos / fotos / videos / notas),
 *   rejilla con carga por lotes, lightbox a pantalla completa,
 *   botón para agregar un recuerdo nuevo (foto, video o nota) y
 *   el secreto por revisitar recuerdos.
 *
 * ¿Cómo funciona?
 *   - Carga los recuerdos del proveedor activo (local o Supabase);
 *     la primera vez siembra el contenido de ejemplo de
 *     src/data/memories.ts y desde ahí la galería crece con lo
 *     que suban César y Sofía.
 *   - "Agregar memoria" abre el compositor (./MemoryComposer.tsx).
 *   - El lightbox permite borrar un recuerdo desde su título.
 *   - Muestra de 9 en 9 ("Cargar más") para crecer sin límite.
 *   - Secreto: al abrir 5 recuerdos en una sesión.
 *
 * ¿Dónde modificarlo?
 *   - Contenido de ejemplo: src/data/memories.ts.
 *   - Lote de carga: constante PAGE_SIZE.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/memories.ts (siembra inicial)
 *   - src/lib/data/index.ts (proveedor activo)
 *   - ./MemoryCard.tsx
 *   - ./MemoryComposer.tsx
 *   - ./Lightbox.tsx
 *   - src/lib/toast.ts (secreto de los 5 recuerdos)
 */

"use client";

import { motion, type Variants } from "motion/react";
import { Camera, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MEMORIES } from "@/data/memories";
import { data } from "@/lib/data";
import type { Memory } from "@/lib/data/types";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

import { Lightbox } from "./Lightbox";
import { MemoryCard } from "./MemoryCard";
import { MemoryComposer } from "./MemoryComposer";

/** Cuántos recuerdos se muestran por lote. */
const PAGE_SIZE = 9;

type MemoryFilter = "all" | Memory["kind"];

const FILTERS: Array<{ id: MemoryFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "photo", label: "Fotos" },
  { id: "video", label: "Videos" },
  { id: "note", label: "Notas" },
];

/** Entrada escalonada de la rejilla. */
const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function MemoriesGallery() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const openedCount = useRef(0);

  // Carga los recuerdos; la primera vez siembra los de ejemplo.
  useEffect(() => {
    let active = true;
    const run = async () => {
      let list: Memory[] = [];
      try {
        list = await data.getMemories();
      } catch (error) {
        console.error(error);
      }
      if (!active) return;
      if (list.length === 0) {
        try {
          await Promise.all(
            MEMORIES.map((item) =>
              data.addMemory({
                title: item.title,
                description: item.description,
                kind: item.kind,
                url: item.url,
                date: item.date,
                emoji: item.emoji,
                tint: item.tint,
                tags: item.tags,
                author: item.author,
              }),
            ),
          );
          list = await data.getMemories();
        } catch (error) {
          console.error(error);
          showToast(
            "Supabase",
            "Ejecuta docs/supabase-schema.sql en el SQL Editor.",
          );
        }
      }
      if (active) setMemories(list);
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return filter === "all"
      ? memories
      : memories.filter((memory) => memory.kind === filter);
  }, [filter, memories]);

  // Al cambiar de filtro, se reinicia el lote.
  const onFilterChange = (next: MemoryFilter) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
    setLightboxIndex(null);
  };

  const visible = filtered.slice(0, visibleCount);
  const total = filtered.length;
  const hasMore = visibleCount < total;

  const handleOpen = useCallback((memory: Memory) => {
    const index = filtered.findIndex((item) => item.id === memory.id);
    setLightboxIndex(index);
  }, [filtered]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
    openedCount.current += 1;
    // Secreto: al abrir 5 recuerdos en una sesión.
    if (openedCount.current === 5) {
      showToast(
        "Cinco recuerdos",
        "Cada recuerdo que revives brilla un poco más en nuestro cielo.",
      );
    }
  }, []);

  const handleNavigate = useCallback((nextIndex: number) => {
    setLightboxIndex(nextIndex);
  }, []);

  const handleCreated = useCallback((memory: Memory) => {
    setComposing(false);
    setEditing(null);
    setMemories((previous) => {
      const exists = previous.some((item) => item.id === memory.id);
      return exists
        ? previous.map((item) => (item.id === memory.id ? memory : item))
        : [memory, ...previous];
    });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const target = memories.find((item) => item.id === id);
      void data.deleteMemory(id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setMemories((previous) => previous.filter((item) => item.id !== id));
      setLightboxIndex(null);
      if (target) {
        showToast("Recuerdo quitado", `"${target.title}" ya no está en la galería.`);
      }
    },
    [memories],
  );

  return (
    <section
      data-memory-gallery
      aria-label="Galería de recuerdos"
      className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6"
    >
      {/* Filtros + agregar */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onFilterChange(option.id)}
            aria-pressed={filter === option.id}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center justify-center rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]",
              filter === option.id
                ? "border-purple-glow/50 bg-gradient-to-r from-violet-glow/30 to-pink-glow/20 text-primary"
                : "glass text-starlight/85 hover:border-white/25 hover:text-primary",
            )}
          >
            {option.label}
          </button>
        ))}

        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-starlight/70">
          {total} {total === 1 ? "momento guardado" : "momentos guardados"}
        </span>

        <button
          type="button"
          onClick={() => setComposing(true)}
          data-recuerdo-composer
          className={cn(
            "ml-1 inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-5 text-sm font-medium",
            "bg-gradient-to-r from-blush-glow/80 via-pink-glow/80 to-purple-glow/80 text-night-950",
            "shadow-[0_8px_30px_-10px_rgba(219,180,166,0.5)] transition-all duration-300 hover:brightness-110 active:scale-95",
          )}
        >
          <Plus className="size-4" />
          Agregar recuerdo
        </button>
      </div>

      {/* Rejilla */}
      {visible.length > 0 ? (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((memory) => (
            <motion.div key={memory.id} variants={itemVariants}>
              <MemoryCard memory={memory} onOpen={handleOpen} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-12 text-center">
          <Camera className="mx-auto size-8 text-starlight/30" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-sm text-starlight/60">
            {filter === "all"
              ? "Todavía no hay momentos guardados. ¡Agrega el primero!"
              : "Nada por aquí todavía. ¡Agrega el primero!"}
          </p>
        </div>
      )}

      {/* Cargar más */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className={cn(
              "inline-flex h-11 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-full px-8 text-sm font-medium tracking-wide",
              "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
              "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
            )}
          >
            Cargar más recuerdos
          </button>
        </div>
      )}

      {/* Visor a pantalla completa */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <Lightbox
          memories={filtered}
          index={lightboxIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
          onDelete={handleDelete}
          onEdit={(memory) => {
            setLightboxIndex(null);
            setEditing(memory);
          }}
        />
      )}

      {/* Compositor de recuerdos (nuevo o editando) */}
      {(composing || editing) && (
        <MemoryComposer
          memory={editing ?? undefined}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
          onCreated={handleCreated}
        />
      )}
    </section>
  );
}