/**
 * LECTOR DE REGALO — pantalla completa, al estilo de cartas y
 * secretos: foto grande, título, subtítulo, historia, fecha y
 * autor. Se cierra con ✕, Escape o clic fuera.
 */
"use client";

import { Gift, Pencil, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

import type { Gift as GiftType } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { cn } from "@/lib/utils/cn";
import { formatShortDate } from "./GiftCard";

interface GiftReaderProps {
  gift: GiftType;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: (gift: GiftType) => void;
}

export function GiftReader({ gift, onClose, onDelete, onEdit }: GiftReaderProps) {
  const wish = gift.kind === "wish";

  // Carrillón + bloqueo de scroll + pausa del fondo + cerrar con Escape.
  useEffect(() => {
    playChime(false);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("fyez:background-off"));

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);

    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("fyez:background-on"));
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={gift.title}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar regalo"
        className={cn(
          "absolute right-4 top-4 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full",
          "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
        )}
      >
        <X className="size-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-night-900/95 px-6 py-8 text-center sm:px-10"
      >
        {/* Sello del tipo */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]",
            wish
              ? "border-gold-glow/40 bg-gold-glow/10 text-gold-glow"
              : "border-blush-glow/40 bg-blush-glow/10 text-blush-200",
          )}
        >
          <Gift className="size-3.5" aria-hidden />
          {wish ? "Queremos regalarlo" : "Ya se regaló"}
        </span>

        {/* Foto grande o emoji */}
        {gift.imageUrl ? (
          <div className="mx-auto mt-6 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gift.imageUrl}
              alt={gift.title}
              className="max-h-[45vh] w-full object-cover"
            />
          </div>
        ) : (
          <div className="mx-auto mt-6 flex w-full max-w-sm items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] py-12">
            <span className="text-7xl">{gift.emoji ?? "🎁"}</span>
          </div>
        )}

        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
          {formatShortDate(gift.date)}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">
          {gift.title}
        </h2>
        {gift.subtitle && (
          <p className="mt-2 font-display text-base italic text-blush-glow/90">
            {gift.subtitle}
          </p>
        )}

        {gift.description && (
          <p className="mx-auto mt-5 max-w-md whitespace-pre-line text-[15px] leading-relaxed text-starlight/85">
            {gift.description}
          </p>
        )}

        {gift.author && (
          <p className="mt-6 border-t border-white/10 pt-4 text-sm italic text-starlight/60">
            — con amor, {gift.author}
          </p>
        )}

        {/* Editar y Borrar */}
        <div className="mx-auto mt-7 flex items-center justify-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(gift)}
              aria-label={`Editar regalo: ${gift.title}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs text-starlight/40 transition-all duration-300 hover:text-primary active:scale-95"
            >
              <Pencil className="size-3.5" />
              Editar este regalo
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onDelete(gift.id);
              onClose();
            }}
            aria-label={`Borrar regalo: ${gift.title}`}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs text-starlight/40 transition-all duration-300 hover:text-red-300 active:scale-95"
          >
            <Trash2 className="size-3.5" />
            Quitar este regalo
          </button>
        </div>
      </motion.div>
    </div>
  );
}