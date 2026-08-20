/**
 * ============================================================
 * MINIJUEGOS — LOS JUEGOS DE NUESTRO UNIVERSO (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   Los juegos exclusivos de la pareja y su contenido:
 *   el catálogo, las preguntas del quiz "¿Qué tan bien me
 *   conoces?" y las parejas del Memorama.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Las preguntas y parejas actuales son de muestra. Edítalas
 *   cuando quieras: solo cambia este archivo; los juegos se
 *   adaptan solos.
 *
 * ¿Cómo funciona?
 *   - GAMES: el catálogo que se muestra en la página.
 *   - QUIZ_QUESTIONS: pregunta + opciones + correcta + mensaje.
 *   - MEMORAMA_ITEMS: cada pareja es un objeto (emoji + nombre).
 *
 * ¿Dónde modificarlo?
 *   - Preguntas del quiz: QUIZ_QUESTIONS (correct = índice de
 *     la opción correcta, empezando en 0).
 *   - Parejas del memorama: MEMORAMA_ITEMS (el juego duplica
 *     cada una para formar las parejas).
 *
 * ¿Qué archivos utiliza?
 *   - src/components/juegos/QuizGame.tsx
 *   - src/components/juegos/MemoramaGame.tsx
 *   - src/components/juegos/GamesHub.tsx
 */

/** Una pregunta del quiz "¿Qué tan bien me conoces?". */
export interface QuizQuestion {
  id: string;
  question: string;
  /** Opciones de respuesta (4 recomendadas). */
  options: string[];
  /** Índice de la opción correcta (0 = primera). */
  correct: number;
  /** Mensaje cariñoso que se muestra al responder. */
  message: string;
}

/** Un par del Memorama (el juego crea su pareja automáticamente). */
export interface MemoramaItem {
  id: string;
  emoji: string;
  label: string;
}

/** Descripción de un juego del catálogo. */
export interface GameMeta {
  id: "quiz" | "memorama";
  title: string;
  description: string;
  emoji: string;
  /** Clave del récord en la nube (tabla "games" de Supabase). */
  bestKey: string;
  /** Etiqueta del récord (ej: "8/8", "20 movimientos"). */
  bestLabel: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "quiz",
    title: "¿Conoces nuestra relación?",
    description:
      "Son preguntas basicas sobre nuestra relacion, como fechas, gustos y momentos que hemos pasado juntos.",
    emoji: "💞",
    bestKey: "quiz",
    bestLabel: "aciertos",
  },
  {
    id: "memorama",
    title: "Memorama de nosotros",
    description:
      "Encuentra el par de cada carta y recuerdanos en ellas.",
    emoji: "🃏",
    bestKey: "memorama",
    bestLabel: "movimientos",
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "¿Cuál es la fecha de nuestro aniversario?",
    options: ["24 de diciembre", "1 de enero", "25 de febrero", "25 de diciembre"],
    correct: 3,
    message: "Mi mejor comienzo en esta vida fue a tu lado, el 25 de diciembre.",
  },
  {
    id: "q2",
    question: "¿Cual es el nombre de el hijo que es de los dos?",
    options: ["Apio", "Bolilla", "Rayo", "Shelby"],
    correct: 2,
    message: "Rayo, nuestro primer hijo en conjunto.",
  },
  {
    id: "q3",
    question: "¿Cual fue el dia en el que nos casamos en roblox?",
    options: ["12 de enero", "18 de marzo", "25 de abril", "27 de febrero"],
    correct: 0,
    message: "27 de febrero fue el dia, no creo que lo sepas jeje",
  },
  {
    id: "q4",
    question: "En que meses tuvimos muchas peleas",
    options: ["Enero y febrero", "Marzo y abril", "Mayo y junio", "todos los meses"],
    correct: 2,
    message: "En junio no se que nos paso",
  },
  {
    id: "q5",
    question: "El primer dia que jugamos dahood",
    options: ["12 de enero", "12 de febrero", "12 de marzo", "ninguno de los anteriores"],
    correct: 0,
    message: "12 de enero fue el primer dia que jugamos dahood juntos.",
  },
  {
    id: "q6",
    question: "¿Cual es mi comida favorita?",
    options: ["Milanesas con espaguetti", "boneless con ranch", "boneless con buffalo", "pizza", "la 2 y la 3 juntas"],
    correct: 4,
    message: "no es muy dificil",
  },
  {
    id: "q7",
    question: "Cual es mi juego favorito?",
    options: [
      "Free fire",
      "Valorant",
      "fivem",
      "Minecraft",
    ],
    correct: 1,
    message: "era muy facil",
  },
  {
    id: "q8",
    question: "Cuantas veces hemos terminado y vuelto a estar juntos?",
    options: ["1", "2", "3", "no se pueden contar"],
    correct: 3,
    message: "son muchass",
  },
];

export const MEMORAMA_ITEMS: MemoramaItem[] = [
  { id: "rayo", emoji: "🐕", label: "Rayo" },
  { id: "night", emoji: "😹", label: "Night" },
  { id: "apio", emoji: "🐱", label: "Apio" },
  { id: "shelby", emoji: "🐈", label: "Shelby" },
  { id: "Maria", emoji: "🙀", label: "Maria" },
  { id: "Sofy", emoji: "👧", label: "Sofy" },
  { id: "Cesar", emoji: "🦸‍♂️", label: "Cesar" },
  { id: "pato", emoji: "🐥", label: "Pato" },
];

/** Baraja una copia de un arreglo (algoritmo Fisher-Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
