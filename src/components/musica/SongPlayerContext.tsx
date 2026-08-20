/**
 * ============================================================
 * SONG PLAYER — REPRODUCTOR GLOBAL DE MÚSICA
 * ============================================================
 *
 * ¿Qué hace?
 *   Reproductor único para toda la app: la música vive aquí y
 *   sigue sonando al cambiar de página. El botón de música del
 *   navbar lo enciende con la playlist completa; el mini
 *   reproductor flotante (SongPlayerBar) permite pausar, saltar
 *   y arrastrar la barra de tiempo.
 *
 * ¿Cómo funciona?
 *   - Un único elemento <audio> creado al primer uso.
 *   - Al terminar una canción, salta a la siguiente (1 a 1);
 *     al llegar al final, se detiene.
 *   - El provider vive en el layout raíz, así el estado
 *     permanece entre páginas.
 *
 * ¿Qué archivos utiliza?
 *   - src/app/layout.tsx (provider + SongPlayerBar)
 *   - src/components/ui/MusicButton.tsx (encender/apagar)
 *   - src/components/musica/Musica.tsx (página de música)
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Song } from "@/lib/data/types";

interface SongPlayerValue {
  /** Lista de canciones de la playlist. */
  playlist: Song[];
  /** Canción en reproducción (o null si está parado). */
  current: Song | null;
  /** ¿El mini reproductor flotante está visible? */
  isOpen: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  /** Enciende el reproductor desde el principio de la lista. */
  start: (songs: Song[], startIndex?: number) => void;
  /** Reproduce una canción concreta (pausa/reanuda si es la misma). */
  playSong: (song: Song) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  /** Apaga todo: detiene el audio y oculta el reproductor. */
  stop: () => void;
  /** Mantiene la lista al día (tras añadir/editar/borrar canciones). */
  syncPlaylist: (songs: Song[]) => void;
}

const SongPlayerContext = createContext<SongPlayerValue | null>(null);

export function SongPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [current, setCurrent] = useState<Song | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /** Crea el elemento de audio una sola vez. */
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  }, []);

  const play = useCallback((song: Song) => {
    const audio = getAudio();
    audio.src = song.audioUrl;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setCurrent(song);
    setIsOpen(true);
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [getAudio]);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    setCurrent(null);
    setIsPlaying(false);
    setIsOpen(false);
    setCurrentTime(0);
    setDuration(0);
  }, [getAudio]);

  const toggle = useCallback(() => {
    const audio = getAudio();
    if (!current) return;
    if (audio.paused) {
      void audio.play().then(() => setIsPlaying(true));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [current, getAudio]);

  const start = useCallback(
    (songs: Song[], startIndex = 0) => {
      if (songs.length === 0) return;
      setPlaylist(songs);
      play(songs[Math.min(startIndex, songs.length - 1)]);
    },
    [play],
  );

  const playSong = useCallback(
    (song: Song) => {
      if (current?.id === song.id) {
        toggle();
        return;
      }
      play(song);
    },
    [current, play, toggle],
  );

  const seek = useCallback(
    (time: number) => {
      const audio = getAudio();
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [getAudio],
  );

  // Al terminar la canción: pasa a la siguiente (1 a 1); al final, para.
  useEffect(() => {
    const audio = getAudio();
    const onEnded = () => {
      setCurrentTime(0);
      const index = playlist.findIndex((song) => song.id === current?.id);
      const nextSong = playlist[index + 1];
      if (nextSong) {
        play(nextSong);
      } else {
        stop();
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [current, getAudio, play, playlist, stop]);

  const next = useCallback(() => {
    const index = playlist.findIndex((song) => song.id === current?.id);
    const nextSong = playlist[index + 1];
    if (nextSong) play(nextSong);
  }, [current, play, playlist]);

  const prev = useCallback(() => {
    const index = playlist.findIndex((song) => song.id === current?.id);
    const prevSong = playlist[index - 1];
    if (prevSong) play(prevSong);
  }, [current, play, playlist]);

  const syncPlaylist = useCallback(
    (songs: Song[]) => {
      setPlaylist(songs);
      if (current && !songs.some((song) => song.id === current.id)) {
        stop();
        return;
      }
      if (current) {
        const updated = songs.find((song) => song.id === current.id);
        if (updated) {
          setCurrent(updated);
          if (updated.audioUrl !== current.audioUrl) {
            const audio = getAudio();
            audio.src = updated.audioUrl;
            if (!audio.paused) void audio.play();
          }
        }
      }
    },
    [current, getAudio, stop],
  );

  const value: SongPlayerValue = {
    playlist,
    current,
    isOpen,
    isPlaying,
    currentTime,
    duration,
    start,
    playSong,
    toggle,
    next,
    prev,
    seek,
    stop,
    syncPlaylist,
  };

  return (
    <SongPlayerContext.Provider value={value}>{children}</SongPlayerContext.Provider>
  );
}

/** Acceso al reproductor global desde cualquier componente. */
export function useSongPlayer(): SongPlayerValue {
  const value = useContext(SongPlayerContext);
  if (!value) throw new Error("useSongPlayer debe usarse dentro de SongPlayerProvider");
  return value;
}