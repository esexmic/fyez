/**
 * ============================================================
 * MUSIC BUTTON — BOTÓN DE MÚSICA DEL NAVBAR
 * ============================================================
 *
 * ¿Qué hace?
 *   Enciende y apaga el reproductor global con la playlist
 *   completa de /musica:
 *     - Si está apagado: carga las canciones y empieza desde
 *       la primera (sigue sonando al cambiar de página).
 *     - Si está sonando: se apaga por completo y desaparece el
 *       reproductor flotante.
 *     - Si está pausado: reanuda donde se quedó.
 *
 * ¿Cómo funciona?
 *   - Lee el estado del SongPlayerProvider (contexto global).
 *   - Las canciones se cargan del proveedor de datos (nube o
 *     dispositivo).
 *
 * ¿Qué archivos utiliza?
 *   - src/components/musica/SongPlayerContext.tsx
 *   - src/lib/data/index.ts (data.getSongs)
 *   - src/lib/toast.ts
 */

"use client";

import { Music2 } from "lucide-react";

import { useSongPlayer } from "@/components/musica/SongPlayerContext";
import { data } from "@/lib/data";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

/** Barras del ecualizador (4 con retardos distintos). */
const BARS = [
  { delay: "0s", duration: "1.1s" },
  { delay: "0.15s", duration: "0.9s" },
  { delay: "0.3s", duration: "1.25s" },
  { delay: "0.45s", duration: "1s" },
];

/** Botón de música: enciende/apaga la playlist global. */
export function MusicButton() {
  const { isOpen, isPlaying, start, toggle, stop } = useSongPlayer();

  async function handleClick() {
    if (isOpen) {
      // Si está sonando se apaga; si está pausado, reanuda.
      if (isPlaying) {
        stop();
        showToast("Música apagada", "La banda sonora se detuvo.");
      } else {
        toggle();
      }
      return;
    }
    try {
      const songs = (await data.getSongs()).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
      if (songs.length === 0) {
        showToast("Música", "Todavía no hay canciones en la banda sonora.");
        return;
      }
      start(songs, 0);
      showToast("Música encendida", "Suena toda nuestra banda sonora.");
    } catch {
      showToast("Música", "No se pudo cargar la banda sonora.");
    }
  }

  const active = isOpen;

  return (
    <button
      type="button"
      aria-label={isPlaying ? "Pausar música" : "Activar música"}
      aria-pressed={active}
      onClick={() => void handleClick()}
      className={cn(
        "relative flex size-11 cursor-pointer items-center justify-center rounded-full transition-all duration-300",
        "glass hover:scale-105 hover:border-purple-glow/50 hover:bg-white/10",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-glow/70",
        active && "border-purple-glow/40 animate-glow-pulse",
      )}
    >
      {isPlaying ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {BARS.map((bar, index) => (
            <span
              key={index}
              className="w-[3px] origin-bottom animate-eq rounded-full bg-gradient-to-t from-purple-glow to-pink-glow"
              style={{
                height: "100%",
                animationDelay: bar.delay,
                animationDuration: bar.duration,
              }}
            />
          ))}
        </span>
      ) : (
        <Music2
          className={cn(
            "size-5 transition-colors",
            active ? "text-purple-glow" : "text-starlight",
          )}
        />
      )}
    </button>
  );
}