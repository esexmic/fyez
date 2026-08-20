/**
 * ============================================================
 * HIGH SCORES — RÉCORDS DE LOS JUEGOS EN LA NUBE (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Lee y guarda los récords de los juegos en Supabase (tabla
 *   "games"), para que César y Sofía compartan el mismo récord
 *   desde cualquier dispositivo.
 *
 * ¿Cómo funciona?
 *   - getBest devuelve el récord del juego (id "quiz",
 *     "memorama") o null si aún no existe.
 *   - saveBest actualiza el récord solo si el nuevo valor es
 *     mejor (en el memorama, MENOS movimientos es mejor).
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data (data.getGames / data.updateHighScore)
 *   - src/components/juegos/QuizGame.tsx
 *   - src/components/juegos/MemoramaGame.tsx
 *   - src/components/juegos/GameCard.tsx
 */

import { data } from "@/lib/data";

/** Lee el récord guardado en la nube (null si no existe). */
export async function getBest(name: string): Promise<number | null> {
  try {
    const games = await data.getGames();
    const game = games.find((item) => item.id === name);
    return game?.highScore ?? null;
  } catch {
    return null;
  }
}

/**
 * Guarda un récord si el nuevo valor es mejor que el anterior.
 * Devuelve el récord actualizado (o null si el guardado falla).
 */
export async function saveBest(name: string, value: number): Promise<number | null> {
  const previous = await getBest(name);
  const isBetter = previous === null || value < previous;
  if (!isBetter) return previous;
  try {
    await data.updateHighScore(name, value);
  } catch {
    return null;
  }
  return value;
}