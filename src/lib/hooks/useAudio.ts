/**
 * ============================================================
 * HOOK useAudio — CONTROL DE MÚSICA Y SONIDOS
 * ============================================================
 *
 * ¿Qué hace?
 *   Gestiona la reproducción de música de fondo (play/pause,
 *   volumen, memoria de preferencia). La música en sí se
 *   configurará en la FASE 2.
 *
 * ¿Cómo funciona?
 *   Usa un elemento HTMLAudioElement apuntando a un archivo
 *   en public/audio. Recuerda la preferencia en localStorage.
 *
 * ¿Dónde modificarlo?
 *   En la FASE 2 se conecta el archivo de audio y los botones
 *   de la interfaz. La lógica base ya queda lista aquí.
 *
 * ¿Qué archivos utiliza?
 *   - public/audio/ (carpeta donde irá la música)
 *   - Componentes de la interfaz (botón de música)
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFERENCE_KEY = "nuestro-universo:music";

export interface AudioControls {
  /** ¿Hay música reproduciéndose? */
  isPlaying: boolean;
  /** Reproduce o pausa la música. */
  toggle: () => void;
  /** Cambia el volumen (0 a 1). */
  setVolume: (volume: number) => void;
  /** Volume actual (0 a 1). */
  volume: number;
}

/** Preferencia guardada del usuario (1 = activada). */
function readPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PREFERENCE_KEY) === "1";
}

/**
 * Hook que controla la música de fondo.
 * @param src Ruta del archivo de audio dentro de public/audio.
 */
export function useAudio(src: string): AudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(readPreference);
  const [volume, setVolumeState] = useState(0.5);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    // Si el usuario ya activó la música antes, se reanuda.
    if (readPreference()) {
      void audioRef.current.play().catch(() => {});
    }
    return () => {
      audioRef.current?.pause();
    };
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => {});
      setIsPlaying(true);
      window.localStorage.setItem(PREFERENCE_KEY, "1");
    } else {
      audio.pause();
      setIsPlaying(false);
      window.localStorage.setItem(PREFERENCE_KEY, "0");
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.min(1, Math.max(0, value));
    audio.volume = clamped;
    setVolumeState(clamped);
  }, []);

  return { isPlaying, toggle, setVolume, volume };
}
