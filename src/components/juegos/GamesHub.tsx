/**
 * ============================================================
 * GAMES HUB — EL CATÁLOGO DE JUEGOS (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Muestra el catálogo de juegos y abre el juego elegido a
 *   pantalla completa.
 *
 * ¿Cómo funciona?
 *   - GAMES (src/data/games.ts) alimenta las tarjetas.
 *   - Al elegir un juego, se monta en un overlay con
 *     transición (AnimatePresence).
 *
 * ¿Dónde modificarlo?
 *   - Catálogo: src/data/games.ts.
 *   - Estilo: clases de este componente.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/games.ts (GAMES, GameMeta)
 *   - ./GameCard.tsx
 *   - ./QuizGame.tsx
 *   - ./MemoramaGame.tsx
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { GAMES, type GameMeta } from "@/data/games";

import { GameCard } from "./GameCard";
import { MemoramaGame } from "./MemoramaGame";
import { QuizGame } from "./QuizGame";

export function GamesHub() {
  const [activeGame, setActiveGame] = useState<GameMeta["id"] | null>(null);

  const handlePlay = (game: GameMeta) => {
    setActiveGame(game.id);
  };

  return (
    <section
      data-games-hub
      aria-label="Catálogo de juegos"
      className="relative mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6"
    >
      <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-stretch">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} onPlay={handlePlay} />
        ))}
      </div>

      {/* Juego activo */}
      <AnimatePresence>
        {activeGame === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60]"
          >
            <QuizGame onClose={() => setActiveGame(null)} />
          </motion.div>
        )}
        {activeGame === "memorama" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60]"
          >
            <MemoramaGame onClose={() => setActiveGame(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
