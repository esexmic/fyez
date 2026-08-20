/**
 * ============================================================
 * MEMORAMA GAME — MEMORAMA DE NOSOTROS (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Juego de memoria con los símbolos de la pareja: encuentra
 *   las 8 parejas en el menor número de movimientos posible.
 *
 * ¿Cómo funciona?
 *   - Baraja las cartas (cada pareja se duplica).
 *   - Al dar vuelta dos: si coinciden, se quedan y suena el
 *     carrillón; si no, se ocultan solas.
 *   - Al completar: tiempo, movimientos y récord guardado
 *     (src/lib/highscores.ts).
 *   - Escape o botón cierran el juego.
 *
 * ¿Dónde modificarlo?
 *   - Parejas: src/data/games.ts (MEMORAMA_ITEMS).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/games.ts (MEMORAMA_ITEMS, shuffle)
 *   - src/lib/highscores.ts
 *   - src/lib/audio/chime.ts
 *   - lucide-react (X, Sparkles)
 */

"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MEMORAMA_ITEMS, shuffle } from "@/data/games";
import { getBest, saveBest } from "@/lib/highscores";
import { playChime } from "@/lib/audio/chime";
import { cn } from "@/lib/utils/cn";

export interface MemoramaGameProps {
  onClose: () => void;
}

/** Una carta del tablero (pareja duplicada). */
interface Card {
  key: number;
  pairId: string;
  emoji: string;
  label: string;
}

/** Da formato al tiempo (mm:ss). */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function MemoramaGame({ onClose }: MemoramaGameProps) {
  const [deck, setDeck] = useState<Card[]>(() =>
    shuffle(
      MEMORAMA_ITEMS.flatMap((item, index) => [
        { key: index * 2, pairId: item.id, emoji: item.emoji, label: item.label },
        { key: index * 2 + 1, pairId: item.id, emoji: item.emoji, label: item.label },
      ]),
    ),
  );
  const [flipped, setFlipped] = useState<Card[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const pendingTimers = useRef<number[]>([]);
  const matchedRef = useRef<Set<string>>(new Set());
  const movesRef = useRef(0);

  const totalPairs = MEMORAMA_ITEMS.length;

  // Récord compartido desde la nube.
  useEffect(() => {
    void getBest("memorama").then(setBest);
  }, []);

  // Cronómetro mientras el juego no termina.
  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  // Cerrar con Escape + bloqueo de scroll + limpieza de temporizadores.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      pendingTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, [onClose]);

  const handleCardClick = (card: Card) => {
    if (finished) return;
    if (flipped.length === 2) return;
    if (flipped.some((item) => item.key === card.key)) return;
    if (matched.has(card.pairId)) return;

    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);
    if (nextFlipped.length !== 2) return;

    const moveCount = movesRef.current + 1;
    movesRef.current = moveCount;
    setMoves(moveCount);

    const [first, second] = nextFlipped;
    const isMatch = first.pairId === second.pairId;

    const timer = window.setTimeout(() => {
      if (isMatch) {
        const nextMatched = new Set(matchedRef.current).add(first.pairId);
        matchedRef.current = nextMatched;
        setMatched(nextMatched);
        setFlipped([]);
        playChime(false);
        // ¿Es la última pareja?
        if (nextMatched.size === totalPairs) {
          setFinished(true);
          void saveBest("memorama", moveCount).then(setBest);
        }
      } else {
        setFlipped([]);
      }
    }, isMatch ? 350 : 850);
    pendingTimers.current.push(timer);
  };

  const handleRestart = () => {
    pendingTimers.current.forEach((timer) => window.clearTimeout(timer));
    pendingTimers.current = [];
    setDeck(
      shuffle(
        MEMORAMA_ITEMS.flatMap((item, index) => [
          { key: index * 2, pairId: item.id, emoji: item.emoji, label: item.label },
          { key: index * 2 + 1, pairId: item.id, emoji: item.emoji, label: item.label },
        ]),
      ),
    );
    setFlipped([]);
    setMatched(new Set());
    matchedRef.current = new Set();
    movesRef.current = 0;
    setMoves(0);
    setSeconds(0);
    setFinished(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Juego: Memorama de nosotros"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
    >
      <div className="glass relative w-full max-w-md rounded-3xl p-6 sm:p-8">
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar juego"
          className={cn(
            "absolute right-4 top-4 flex size-10 cursor-pointer items-center justify-center rounded-full",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
          )}
        >
          <X className="size-4.5" />
        </button>

        {/* Marcador */}
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-starlight/70">
          <span>
            Movimientos: <span className="text-gold-glow">{moves}</span>
          </span>
          <span>{formatTime(seconds)}</span>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-starlight/50">
          Parejas: {matched.size} / {totalPairs}
        </p>

        {/* Tablero */}
        {!finished ? (
          <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
            {deck.map((card) => {
              const isUp = flipped.some((item) => item.key === card.key) || matched.has(card.pairId);
              const isMatched = matched.has(card.pairId);
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  aria-label={isUp ? card.label : "Carta oculta"}
                  className="aspect-square w-full cursor-pointer rounded-2xl [perspective:600px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-glow/70"
                >
                  <span
                    className={cn(
                      "relative block size-full transition-transform duration-500 [transform-style:preserve-3d]",
                      isUp && "[transform:rotateY(180deg)]",
                    )}
                  >
                    {/* Reverso */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-2xl border border-white/10",
                        "bg-gradient-to-br from-violet-glow/25 to-pink-glow/10 text-gold-glow [backface-visibility:hidden]",
                      )}
                    >
                      <Sparkles className="size-4 animate-sparkle" />
                    </span>
                    {/* Frente */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border [backface-visibility:hidden] [transform:rotateY(180deg)]",
                        isMatched
                          ? "border-gold-glow/40 bg-gradient-to-br from-gold-glow/15 to-pink-glow/10"
                          : "border-white/15 bg-white/[0.06]",
                      )}
                    >
                      <span className="text-2xl">{card.emoji}</span>
                      <span className="max-w-full truncate px-1 text-[9px] font-medium text-starlight/80">
                        {card.label}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Resultado */
          <div className="py-8 text-center">
            <span className="text-5xl">🏆</span>
            <h2 className="mt-4 font-display text-3xl font-semibold text-primary">
              ¡Completo!
            </h2>
            <p className="mt-2 text-sm italic leading-relaxed text-starlight/90">
              Encontraste las {totalPairs} parejas en {moves}{" "}
              {moves === 1 ? "movimiento" : "movimientos"} y {formatTime(seconds)}.
            </p>
            <p className="mt-4 text-xs text-starlight/60">
              Récord guardado:{" "}
              <span className="font-medium text-gold-glow">
                {best === null ? `${moves} movimientos` : `${best} movimientos`}
              </span>
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow px-6 text-sm font-medium text-primary transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              >
                Jugar otra vez
              </button>
              <button
                type="button"
                onClick={onClose}
                className="glass inline-flex h-10 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium text-primary transition-all duration-300 hover:border-white/25 hover:bg-white/10 active:scale-[0.97]"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
