/**
 * GALERÍA DE REGALOS — carga los regalos del proveedor (local o
 * Supabase) con pestañas para filtrar por tipo ("Todos" /
 * "Queremos regalarlo" / "Ya se regaló"), botón para agregar y
 * borrar. Cada tarjeta abre el lector a pantalla completa.
 */
"use client";

import { motion, type Variants } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Gift, Plus } from "lucide-react";

import { data } from "@/lib/data";
import type { Gift as GiftType } from "@/lib/data/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

import { GiftCard } from "./GiftCard";
import { GiftComposer } from "./GiftComposer";
import { GiftReader } from "./GiftReader";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type Filter = "all" | "wish" | "given";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "wish", label: "Queremos regalarlo" },
  { id: "given", label: "Ya se regaló" },
];

export function GiftsGallery() {
  const { name } = useAuth();
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<GiftType | null>(null);
  const [reading, setReading] = useState<GiftType | null>(null);

  // Carga los regalos de la nube (sin re-siembra).
  useEffect(() => {
    let active = true;
    const run = async () => {
      let list: GiftType[] = [];
      try {
        list = await data.getGifts();
      } catch (error) {
        console.error(error);
      }
      if (active) setGifts(list);
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const handleCreated = useCallback((gift: GiftType) => {
    setComposing(false);
    setEditing(null);
    setReading(null);
    setGifts((previous) => {
      const exists = previous.some((item) => item.id === gift.id);
      return exists
        ? previous.map((item) => (item.id === gift.id ? gift : item))
        : [gift, ...previous];
    });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const target = gifts.find((item) => item.id === id);
      void data.deleteGift(id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setGifts((previous) => previous.filter((item) => item.id !== id));
      if (target) {
        playChime(true);
        showToast("Regalo quitado", `"${target.title}" ya no está en la lista.`);
        setReading(null);
      }
    },
    [gifts],
  );

  const visible = gifts
    .filter((gift) => filter === "all" || gift.kind === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section
      data-gifts-gallery
      aria-label="Regalos"
      className="relative mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6"
    >
      {/* Barra de filtros + agregar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-300",
              filter === option.id
                ? "border-blush-glow/60 bg-blush-glow/15 text-blush-200"
                : "border-white/10 bg-night-800/50 text-starlight/60 hover:border-white/25 hover:text-primary",
            )}
          >
            {option.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "ml-1 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.14em]",
            "bg-gradient-to-r from-blush-glow/80 via-pink-glow/80 to-purple-glow/80 text-night-950",
            "shadow-[0_8px_30px_-10px_rgba(219,180,166,0.5)] transition-all duration-300 hover:brightness-110 active:scale-95",
          )}
        >
          <Plus className="size-3.5" />
          Agregar regalo
        </button>
      </div>

      {visible.length > 0 ? (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((gift) => (
            <motion.div key={gift.id} variants={itemVariants}>
              <GiftCard gift={gift} onOpen={() => setReading(gift)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-12 text-center">
          <Gift className="mx-auto size-8 text-starlight/30" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-sm text-starlight/60">
            {filter === "all"
              ? "Todavía no hay regalos."
              : "Nada por aquí todavía. ¡Agrega el primero!"}
          </p>
        </div>
      )}

      {reading && (
        <GiftReader
          gift={reading}
          onClose={() => setReading(null)}
          onDelete={handleDelete}
          onEdit={(gift) => {
            setReading(null);
            setEditing(gift);
          }}
        />
      )}

      {(composing || editing) && (
        <GiftComposer
          author={name || "César"}
          gift={editing ?? undefined}
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