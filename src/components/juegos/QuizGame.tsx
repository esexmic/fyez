/**
 * ============================================================
 * QUIZ GAME — ¿QUÉ TAN BIEN ME CONOCES? (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Juego de preguntas sobre la pareja. Al responder, muestra
 *   si acertaste con un mensaje cariñoso; al terminar guarda
 *   el récord de aciertos en el dispositivo.
 *
 * ¿Cómo funciona?
 *   - Una pregunta a la vez, con las 4 opciones.
 *   - Al elegir: acierto (verde) o fallo (rosa) + mensaje.
 *   - Al final: puntuación, mensaje según el resultado y
 *     récord guardado (src/lib/highscores.ts).
 *   - Escape o botón cierran el juego.
 *
 * ¿Dónde modificarlo?
 *   - Preguntas: src/data/games.ts (QUIZ_QUESTIONS).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/games.ts (QUIZ_QUESTIONS)
 *   - src/lib/highscores.ts
 *   - src/lib/audio/chime.ts
 *   - lucide-react (X, Check, X as CloseIcon)
 */

"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

import { QUIZ_QUESTIONS, shuffle, type QuizQuestion } from "@/data/games";
import { getBest, saveBest } from "@/lib/highscores";
import { playChime } from "@/lib/audio/chime";
import { cn } from "@/lib/utils/cn";

export interface QuizGameProps {
  onClose: () => void;
}

/** Estado de una pregunta ya respondida. */
interface Answered {
  index: number;
  selected: number;
  correct: boolean;
}

export function QuizGame({ onClose }: QuizGameProps) {
  const [deck, setDeck] = useState<QuizQuestion[]>(() => shuffle(QUIZ_QUESTIONS));
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  // Récord compartido desde la nube.
  useEffect(() => {
    void getBest("quiz").then(setBest);
  }, []);

  // Cerrar con Escape.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear el scroll del fondo mientras se juega.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const question = deck[current];
  const total = deck.length;

  const handleSelect = (optionIndex: number) => {
    if (answered !== null) return;
    const correct = optionIndex === question.correct;
    setAnswered({ index: current, selected: optionIndex, correct });
    if (correct) {
      setScore((value) => value + 1);
      playChime(false);
    } else {
      playChime(true);
    }
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setFinished(true);
      void saveBest("quiz", score).then(setBest);
    } else {
      setCurrent((value) => value + 1);
      setAnswered(null);
    }
  };

  const handleRestart = () => {
    setDeck(shuffle(QUIZ_QUESTIONS));
    setCurrent(0);
    setAnswered(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Juego: ¿Qué tan bien me conoces?"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
    >
      <div className="glass relative w-full max-w-lg rounded-3xl p-6 sm:p-8">
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

        {!finished ? (
          <>
            {/* Progreso y puntuación */}
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-starlight/70">
              <span>
                Pregunta {current + 1} de {total}
              </span>
              <span>
                Aciertos: <span className="text-gold-glow">{score}</span>
              </span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-glow to-pink-glow transition-all duration-500"
                style={{ width: `${((current + (answered ? 1 : 0)) / total) * 100}%` }}
              />
            </div>

            {/* Pregunta */}
            <h2 className="mt-6 font-display text-xl font-semibold leading-snug text-primary sm:text-2xl">
              {question.question}
            </h2>

            {/* Opciones */}
            <div className="mt-5 flex flex-col gap-2.5">
              {question.options.map((option, optionIndex) => {
                const isSelected = answered?.selected === optionIndex;
                const isCorrect = answered !== null && optionIndex === question.correct;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => handleSelect(optionIndex)}
                    disabled={answered !== null}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300",
                      answered === null
                        ? "border-white/10 bg-white/[0.03] text-primary hover:border-purple-glow/50 hover:bg-white/[0.06] active:scale-[0.98]"
                        : isCorrect
                          ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                          : isSelected
                            ? "border-pink-glow/50 bg-pink-glow/10 text-pink-100"
                            : "border-white/5 bg-white/[0.02] text-starlight/40",
                    )}
                  >
                    {answered !== null && (isCorrect || isSelected) && (
                      <Check className="size-4 shrink-0" />
                    )}
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Mensaje tras responder */}
            {answered && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p
                  className={cn(
                    "text-xs font-medium uppercase tracking-[0.18em]",
                    answered.correct ? "text-emerald-200/90" : "text-pink-glow",
                  )}
                >
                  {answered.correct ? "¡Correcto!" : "Esta vez no..."}
                </p>
                <p className="mt-1.5 text-sm italic leading-relaxed text-starlight/90">
                  {question.message}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow px-6 text-sm font-medium text-primary transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                >
                  {current + 1 >= total ? "Ver resultado" : "Siguiente"}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Resultado */
          <div className="py-6 text-center">
            <span className="text-5xl">{score === total ? "🏆" : score >= total / 2 ? "✨" : "💛"}</span>
            <h2 className="mt-4 font-display text-3xl font-semibold text-primary">
              {score} de {total}
            </h2>
            <p className="mt-2 text-sm italic leading-relaxed text-starlight/90">
              {score === total
                ? "Perfecto: me conoces de memoria."
                : score >= total / 2
                  ? "Muy bien: nuestro amor se nota en cada respuesta."
                  : "Solo significa que nos queda toda la vida para conocernos."}
            </p>
            <p className="mt-4 text-xs text-starlight/60">
              Récord guardado:{" "}
              <span className="font-medium text-gold-glow">
                {best === null ? `${score}/${total}` : `${best}/${total}`}
              </span>{" "}
              aciertos
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
