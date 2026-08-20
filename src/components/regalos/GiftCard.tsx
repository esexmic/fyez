/**
 * Tarjeta de un regalo: foto (o emoji si no hay), sello del tipo
 * ("queremos regalarlo" / "ya se regaló"), fecha, título,
 * subtítulo y autor. Al pulsarla abre el lector a pantalla completa.
 */
"use client";

import { Gift as GiftIcon } from "lucide-react";
import { motion } from "motion/react";

import type { Gift } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

export function formatShortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface GiftCardProps {
  gift: Gift;
  onOpen: () => void;
}

export function GiftCard({ gift, onOpen }: GiftCardProps) {
  const wish = gift.kind === "wish";

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl border p-5 text-left",
        "bg-night-900/60 backdrop-blur transition-colors duration-300",
        "hover:border-white/20",
        wish && "border-gold-glow/25",
      )}
    >
      {/* Sello del tipo de regalo */}
      <span
        className={cn(
          "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]",
          wish
            ? "border-gold-glow/40 bg-gold-glow/10 text-gold-glow"
            : "border-blush-glow/40 bg-blush-glow/10 text-blush-200",
        )}
      >
        <GiftIcon className="size-3" aria-hidden />
        {wish ? "Queremos regalarlo" : "Ya se regaló"}
      </span>

      {/* Foto o emoji */}
      {gift.imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <span className="text-5xl transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6">
            {gift.emoji ?? "🎁"}
          </span>
        </div>
      )}

      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
        {formatShortDate(gift.date)}
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-primary transition-colors group-hover:text-blush-glow">
        {gift.title}
      </h3>
      {gift.subtitle && (
        <p className="mt-1 text-sm italic text-starlight/70">{gift.subtitle}</p>
      )}
      {gift.author && (
        <p className="mt-3 border-t border-white/10 pt-2.5 text-xs text-starlight/60">
          — con amor, {gift.author}
        </p>
      )}
    </motion.button>
  );
}