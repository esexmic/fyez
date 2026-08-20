/**
 * ============================================================
 * SECTION CARD — PUERTA HACIA CADA RINCÓN (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Cada tarjeta es una puerta con su propia ventana al cielo:
 *   muestra el degradado de su atmósfera, su astro, el icono,
 *   el nombre y la emoción del lugar.
 *
 * ¿Cómo funciona?
 *   - Recibe la sección (src/data/sections.ts) y su índice.
 *   - La franja superior es una "ventana" al cielo de ese lugar.
 *   - Al pulsar navega a la página de la sección.
 *
 * ¿Dónde modificarlo?
 *   - Cielos: src/data/atmospheres.ts.
 *   - Acentos: objeto ACCENTS (abajo).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/sections.ts
 *   - src/data/atmospheres.ts
 *   - src/components/icons/sectionIcons.tsx
 *   - src/components/ui/ComingSoon.tsx
 *   - src/lib/utils/cn.ts
 */

"use client";

import { Heart, Moon, Sun } from "lucide-react";
import Link from "next/link";

import { SectionIcon } from "@/components/icons/sectionIcons";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { getAtmosphere } from "@/data/atmospheres";
import type { Section, SectionAccent } from "@/data/sections";
import { cn } from "@/lib/utils/cn";

/** Acentos de color por clave (suaves, nunca saturados). */
const ACCENTS: Record<SectionAccent, { glow: string; icon: string }> = {
  violet: {
    glow: "rgba(141,130,214,0.4)",
    icon: "linear-gradient(135deg, rgba(141,130,214,0.3), rgba(160,138,216,0.06))",
  },
  purple: {
    glow: "rgba(160,138,216,0.4)",
    icon: "linear-gradient(135deg, rgba(160,138,216,0.3), rgba(201,154,180,0.06))",
  },
  pink: {
    glow: "rgba(201,154,180,0.4)",
    icon: "linear-gradient(135deg, rgba(201,154,180,0.3), rgba(211,168,194,0.06))",
  },
  blush: {
    glow: "rgba(211,168,194,0.4)",
    icon: "linear-gradient(135deg, rgba(211,168,194,0.3), rgba(201,154,180,0.06))",
  },
};

export interface SectionCardProps {
  section: Section;
  /** Índice en la lista (controla el retraso de flotación). */
  index: number;
}

/**
 * Tarjeta-puerta de la página de inicio.
 * @example <SectionCard section={section} index={0} />
 */
export function SectionCard({ section, index }: SectionCardProps) {
  const accent = ACCENTS[section.accent];
  const atmosphere = getAtmosphere(section.atmosphere);

  return (
    <Link
      href={section.href}
      aria-label={`${section.label} — ${atmosphere.emotion}`}
      className={cn(
        "group relative flex animate-float flex-col gap-4 overflow-hidden rounded-3xl p-6",
        "glass transition-all duration-500",
        "hover:-translate-y-2 hover:rotate-[-0.75deg] hover:border-white/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-glow/70",
      )}
      style={{ animationDelay: `${(index % 6) * 0.6}s`, "--card-glow": accent.glow } as React.CSSProperties}
    >
      {/* Borde superior con brillo (aparece al hover) */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-gradient-to-r from-transparent via-purple-glow/60 to-transparent",
        )}
      />

      {/* Sombra de glow al hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: "0 18px 50px -14px var(--card-glow)" }}
      />

      {/* Ventana al cielo de este lugar */}
      <div
        aria-hidden
        className="relative h-16 overflow-hidden rounded-2xl border border-white/10"
        style={{ background: atmosphere.sky }}
      >
        {/* Astro de este cielo */}
        <span
          className={cn(
            "absolute",
            atmosphere.celestial === "sun"
              ? "right-3 top-2 text-sun/80"
              : atmosphere.celestial === "moon"
                ? "right-3 top-2 text-moon/80"
                : "hidden",
          )}
        >
          {atmosphere.celestial === "sun" ? (
            <Sun className="size-5 drop-shadow-[0_0_10px_rgba(242,207,159,0.8)]" />
          ) : (
            <Moon className="size-5 drop-shadow-[0_0_10px_rgba(217,226,240,0.8)]" />
          )}
        </span>
        {/* Nombre del cielo */}
        <span className="absolute bottom-1.5 left-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 drop-shadow-[0_1px_3px_rgba(10,14,30,0.7)]">
          {atmosphere.name}
        </span>
      </div>

      <div className="flex items-start justify-between">
        {/* Icono con gradiente */}
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
          style={{ background: accent.icon }}
        >
          <SectionIcon iconKey={section.icon} className="size-5.5 text-primary/90" strokeWidth={1.6} />
        </span>
        {section.status === "built" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-glow/30 bg-purple-glow/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-purple-200">
            <Heart className="size-3 animate-heartbeat fill-pink-glow text-pink-glow" />
            En vivo
          </span>
        ) : (
          <ComingSoon />
        )}
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-primary">
          {section.label}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-starlight/80">
          {section.description}
        </p>
        <p className="mt-2 text-xs italic text-starlight/50">
          {atmosphere.emotion}
        </p>
      </div>
    </Link>
  );
}
