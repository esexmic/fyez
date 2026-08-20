/**
 * SECRETOS — PEQUEÑOS MISTERIOS POR DESCUBRIR (FASE 14)
 *
 * ¿Qué hace?
 *   Secretos con fecha mínima para abrirlos: TÍTULO, MENSAJE y
 *   AUTOR abajo en chico. Los que dejáis vosotros se guardan en
 *   la base de datos (cartas, local o Supabase); estos son los
 *   de ejemplo que se cargan la primera vez.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Los secretos actuales son de muestra. Edítalos cuando
 *   quieras en este archivo o crea nuevos desde la página.
 */

import type { SecretEntry } from "@/lib/data/types";

export const SECRETS: SecretEntry[] = [
  {
    id: "primer-mensaje",
    emoji: "💬",
    title: "El primer mensaje",
    message:
      "Era un 'hola' que llevaba tres días pensando cómo mandar.\n\nNunca pensé que de un hola tan pequeño saldría todo esto.",
    author: "César",
    openFrom: null,
    createdAt: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "nervios",
    emoji: "🎀",
    title: "Cuando vas a llegar",
    message:
      "Cuento los minutos y ensayo lo que diré, aunque ya lo sepamos.\n\nEs el mejor ensayo de mi vida.",
    author: "Sofía",
    openFrom: null,
    createdAt: "2026-01-15T12:00:00.000Z",
  },
  {
    id: "cancion-favorita-tuya",
    emoji: "🎵",
    title: "Nuestra canción de fondo",
    message:
      "La pongo cuando necesito sentirme cerca de ti aunque estés lejos.\n\nDonde suena esa canción, estás tú.",
    author: "César",
    openFrom: null,
    createdAt: "2026-02-02T12:00:00.000Z",
  },
  {
    id: "sueno",
    emoji: "🌙",
    title: "El sueño que se repite",
    message:
      "Sueño que bailamos en una cocina que todavía no es nuestra.\n\nUn día de estos el sueño va a despertarme de verdad.",
    author: "Sofía",
    openFrom: null,
    createdAt: "2026-03-10T12:00:00.000Z",
  },
  {
    id: "mascota",
    emoji: "🐾",
    title: "Truco de exponer",
    message:
      "A veces llamo 'Rayo' a todos los perros que veo.\n\nTodos me recuerdan a él.",
    author: "César",
    openFrom: null,
    createdAt: "2026-04-05T12:00:00.000Z",
  },
  {
    id: "dahood-secreto",
    emoji: "🎮",
    title: "Mi truco en Dahood",
    message:
      "Cuando pierdo contigo, pierdo sonriendo.\n\nEs mi forma favorita de perder.",
    author: "Sofía",
    openFrom: null,
    createdAt: "2026-05-20T12:00:00.000Z",
  },
];