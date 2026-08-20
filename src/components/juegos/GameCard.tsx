/**
 * ============================================================
 * GAME CARD — PUERTA A UN JUEGO (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Tarjeta del catálogo: emoji, título, descripción, récord
 *   guardado y el botón para entrar al juego.
 *
 * ¿Cómo funciona?
 *   - Lee el récord desde src/lib/highscores.ts.
 *   - Al pulsar "Jugar", el hub abre el juego a pantalla
 *     completa.
 *
 * ¿Dónde modificarlo?
 *   - Estilo: clases de este componente.
 *   - Contenido: src/data/games.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/games.ts (GameMeta)
 *   - src/lib/highscores.ts
 *   - lucide-react (Play)
 */

"use client";

import { Play } from "lucide-react";
import { useEffect, useState } from "react";

import type { GameMeta } from "@/data/games";
import { getBest } from "@/lib/highscores";
import { cn } from "@/lib/utils/cn";

export interface GameCardProps {
  game: GameMeta;
  onPlay: (game: GameMeta) => void;
}

/** Tarjeta de un juego del catálogo. */
export function GameCard({ game, onPlay }: GameCardProps) {
  const [best, setBest] = useState<number | null>(null);

  // Récord compartido desde la nube.
  useEffect(() => {
    let active = true;
    void getBest(game.id).then((value) => {
      if (active) setBest(value);
    });
    return () => {
      active = false;
    };
  }, [game.id]);

  return (
    <article
      className={cn(
        "group relative flex w-full max-w-md flex-col items-center gap-4 overflow-hidden rounded-3xl p-8 text-center",
        "glass transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-purple-glow/30",
      )}
    >
      {/* Brillo superior al hover */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-glow/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <span
        aria-hidden
        className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-glow/30 to-pink-glow/10 text-4xl shadow-[0_10px_36px_-10px_rgba(141,130,214,0.5)]"
      >
        {game.emoji}
      </span>

      <h2 className="font-display text-2xl font-semibold text-primary">
        {game.title}
      </h2>
      <p className="text-sm leading-relaxed text-starlight/80">
        {game.description}
      </p>

      <p className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-starlight/70">
        {best === null ? (
          <>Aún sin récord</>
        ) : (
          <>
            Récord: <span className="font-medium text-gold-glow">{best}</span>{" "}
            {game.bestLabel}
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => onPlay(game)}
        className={cn(
          "relative inline-flex h-11 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-full px-8 text-sm font-medium tracking-wide",
          "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
          "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-glow/70",
        )}
      >
        <Play className="size-4" />
        Jugar
      </button>
    </article>
  );
}
