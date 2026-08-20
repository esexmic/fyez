/**
 * ============================================================
 * MÚSICA — LA BANDA SONORA DE NOSOTROS DOS (FASE 10)
 * ============================================================
 *
 * ¿Qué hace?
 *   Las canciones de ejemplo de la pareja. Las nuevas canciones
 *   se suben desde la propia página (/musica → "Subir canción")
 *   y se guardan en la nube (Supabase) o en el navegador.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Las canciones actuales son de muestra. Edítalas aquí.
 */

import type { Song } from "@/lib/data/types";

export const SONGS: Song[] = [
  {
    id: "despacito",
    title: "Despacito",
    artist: "Luis Fonsi",
    emoji: "🎶",
    reason: "La primera canción que bailamos (o intentamos bailar).",
    author: "César",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    createdAt: "2025-12-25T00:00:00.000Z",
  },
  {
    id: "perfect",
    title: "Perfect",
    artist: "Ed Sheeran",
    emoji: "💞",
    reason: "Nuestra canción de las noches tranquilas.",
    author: "César",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "love-story",
    title: "Love Story",
    artist: "Taylor Swift",
    emoji: "📖",
    reason: "Porque nuestra historia también merece su canción.",
    author: "César",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    createdAt: "2026-02-14T00:00:00.000Z",
  },
  {
    id: "dahood-rap",
    title: "La del juego",
    artist: "La que sonaba en Dahood",
    emoji: "🎮",
    reason: "La que no podíamos dejar de escuchar mientras jugábamos.",
    author: "César",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "cancion-cocina",
    title: "La del desayuno",
    artist: "La que bailamos con las sobras",
    emoji: "🍳",
    reason: "Cocinar juntos y que suene de fondo es nuestro plan perfecto.",
    author: "César",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    createdAt: "2026-04-01T00:00:00.000Z",
  },
];

/** Canciones ordenadas de la más antigua a la más reciente. */
export const SONGS_SORTED = [...SONGS].sort((a, b) =>
  a.createdAt.localeCompare(b.createdAt),
);