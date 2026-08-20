/**
 * ============================================================
 * SONG PLAYER BAR — REPRODUCTOR FLOTANTE GLOBAL
 * ============================================================
 *
 * ¿Qué hace?
 *   Minireproductor flotante que acompaña todas las páginas
 *   mientras la música está encendida. Es libre: se puede
 *   ARRASTRAR por la pantalla, MINIMIZAR a una píldora pequeña,
 *   EXPANDIR a modo grande (frase + siguiente canción) y
 *   REDIMENSIONAR el ancho desde la esquina. La posición,
 *   el tamaño y el modo se recuerdan entre páginas y recargas.
 *
 * ¿Cómo funciona?
 *   - El <audio> y el estado viven en SongPlayerProvider
 *     (contexto global del layout), por eso la música no se
 *     corta al navegar.
 *   - El drag usa Pointer Events (funciona con ratón y dedo).
 *   - Las preferencias se guardan en localStorage.
 *
 * ¿Qué archivos utiliza?
 *   - ./SongPlayerContext.tsx (estado del reproductor)
 *   - src/app/layout.tsx (montado en toda la app)
 */

"use client";

import {
  GripHorizontal,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { useSongPlayer } from "./SongPlayerContext";
import { cn } from "@/lib/utils/cn";

type PlayerSize = "mini" | "normal" | "large";

interface PlayerPrefs {
  x?: number;
  y?: number;
  width?: number;
  size?: PlayerSize;
}

const STORAGE_KEY = "fyez:player:ui";
const MIN_WIDTH = 300;
const MAX_WIDTH = 700;
/** Margen mínimo respecto a los bordes de la pantalla. */
const EDGE = 8;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Lee las preferencias guardadas del reproductor. */
function readPrefs(): PlayerPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlayerPrefs;
  } catch {
    return {};
  }
}

/** Ajusta un punto para que el widget no salga de la pantalla. */
function clampPoint(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const minX = width / 2 + EDGE;
  const maxX = Math.max(minX, window.innerWidth - width / 2 - EDGE);
  const minY = Math.max(height / 2 + EDGE, 78);
  const maxY = Math.max(minY, window.innerHeight - height / 2 - EDGE);
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

export function SongPlayerBar() {
  const { current, isPlaying, currentTime, duration, toggle, next, prev, seek, stop, playlist } =
    useSongPlayer();
  const [size, setSize] = useState<PlayerSize>(() => readPrefs().size ?? "normal");
  const [width, setWidth] = useState<number>(() => readPrefs().width ?? 560);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const saved = readPrefs();
    if (saved.x !== undefined && saved.y !== undefined) {
      return { x: saved.x, y: saved.y };
    }
    return { x: typeof window === "undefined" ? 400 : window.innerWidth / 2, y: typeof window === "undefined" ? 600 : window.innerHeight - 150 };
  });

  const barRef = useRef<HTMLDivElement>(null);
  const grabRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  // Espejo del estado para escribir el DOM sin re-renders durante la captura.
  const posRef = useRef(pos);
  const widthRef = useRef(width);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  // Guarda las preferencias cuando cambian.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pos, width, size }));
    } catch {
      /* sin almacenamiento: se ignora */
    }
  }, [pos, width, size]);

  const startDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    grabRef.current = { dx: event.clientX - centerX, dy: event.clientY - centerY };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    document.body.classList.add("select-none");
  }, []);

  const onDragMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const grab = grabRef.current;
    const bar = barRef.current;
    if (!grab || !bar) return;
    const next = clampPoint(
      event.clientX - grab.dx,
      event.clientY - grab.dy,
      bar.offsetWidth,
      bar.offsetHeight,
    );
    // Movimiento fluido: escribimos directo en el DOM (sin re-render).
    bar.style.left = `${next.x}px`;
    bar.style.top = `${next.y}px`;
    posRef.current = next;
  }, []);

  const endDrag = useCallback(() => {
    if (!grabRef.current) return;
    grabRef.current = null;
    document.body.classList.remove("select-none");
    // Persistimos la última posición (y sincronizamos React).
    setPos({ ...posRef.current });
  }, []);

  const startResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    resizeRef.current = { startX: event.clientX, startWidth: rect.width };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    document.body.classList.add("select-none");
    event.stopPropagation();
  }, []);

  const onResizeMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    const bar = barRef.current;
    if (!resize || !bar) return;
    const viewportMax = Math.min(MAX_WIDTH, window.innerWidth - EDGE * 2);
    const nextWidth = Math.min(
      Math.max(resize.startWidth + (event.clientX - resize.startX), MIN_WIDTH),
      Math.max(viewportMax, MIN_WIDTH),
    );
    bar.style.width = `${nextWidth}px`;
    widthRef.current = nextWidth;
  }, []);

  const endResize = useCallback(() => {
    if (!resizeRef.current) return;
    resizeRef.current = null;
    document.body.classList.remove("select-none");
    setWidth(widthRef.current);
  }, []);

  const nextSong = useMemo(() => {
    if (!current) return null;
    const index = playlist.findIndex((song) => song.id === current.id);
    if (index < 0) return null;
    return playlist[index + 1] ?? null;
  }, [current, playlist]);

  if (!current) return null;

  return (
    <div
      ref={barRef}
      style={{
        left: pos.x,
        top: pos.y,
        width: size === "mini" ? undefined : width,
        transform: "translate(-50%, -50%)",
        willChange: "left, top",
      }}
      className="fixed z-[80] select-none"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/15 bg-night-900/70 shadow-[0_20px_60px_-20px_rgba(10,14,30,0.9)] backdrop-blur-xl",
          size === "mini" ? "p-2" : "p-3.5",
        )}
      >
        {/* Zona de arrastre */}
        <div
          role="button"
          aria-label="Mover el reproductor"
          onPointerDown={startDrag}
          onPointerMove={onDragMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          className={cn(
            "absolute inset-x-14 top-0 z-10 flex h-6 cursor-move touch-none items-center justify-center",
            size === "mini" ? "hidden" : "",
          )}
        >
          <GripHorizontal className="size-4 text-starlight/30" />
        </div>

        {size === "mini" ? (
          /* ---------- Modo mini: píldora compacta ---------- */
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-night-800 text-base">
              {current.emoji ?? "🎵"}
            </span>
            <p className="max-w-28 truncate text-xs font-semibold text-primary">
              {current.title}
            </p>
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-blush-glow transition-all duration-300 hover:bg-blush-glow/10 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 translate-x-[1px]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setSize("normal")}
              aria-label="Expandir reproductor"
              title="Expandir"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-starlight/70 transition-colors hover:text-primary"
            >
              <Maximize2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="Apagar la música"
              title="Apagar"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-starlight/70 transition-colors hover:text-red-400"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          /* ---------- Modo normal / grande ---------- */
          <>
            {/* Cabecera: canción + acciones */}
            <div className="flex items-center gap-3 pr-1 pt-1.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-night-800 text-lg">
                {current.emoji ?? "🎵"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">
                  {current.title}
                </p>
                <p className="truncate text-xs text-starlight/70">
                  {current.artist} · para {current.author}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSize("mini")}
                  aria-label="Minimizar reproductor"
                  title="Minimizar"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-starlight/70 transition-colors hover:text-primary"
                >
                  <Minimize2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSize((value) => (value === "large" ? "normal" : "large"))}
                  aria-label={size === "large" ? "Reducir reproductor" : "Expandir reproductor"}
                  title={size === "large" ? "Reducir" : "Expandir"}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-starlight/70 transition-colors hover:text-primary"
                >
                  <Maximize2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Apagar la música"
                  title="Apagar"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-starlight/70 transition-colors hover:text-red-400"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modo grande: detalles extra */}
            {size === "large" && current.reason && (
              <p className="mt-3 border-t border-white/10 pt-3 text-xs italic leading-relaxed text-purple-200/85">
                “{current.reason}”
              </p>
            )}

            {/* Tiempos (encima de la barra) */}
            <p className="mt-2 text-center text-[11px] tabular-nums text-starlight/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>

            {/* Controles + barra */}
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Canción anterior"
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-starlight/80 transition-colors hover:text-primary"
              >
                <SkipBack className="size-4.5" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-blush-glow/50 bg-blush-glow/10 text-blush-glow transition-all duration-300 hover:bg-blush-glow/20 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="size-5" />
                ) : (
                  <Play className="size-5 translate-x-[1px]" />
                )}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Siguiente canción"
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-starlight/80 transition-colors hover:text-primary"
              >
                <SkipForward className="size-4.5" />
              </button>

              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => {
                  seek(Number(event.target.value));
                }}
                aria-label="Barra de tiempo de la canción"
                className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-blush-glow"
              />
            </div>

            {size === "large" && (
              <p className="mt-3 border-t border-white/10 pt-3 text-center text-[11px] text-starlight/60">
                {nextSong ? (
                  <>
                    Sigue: <span className="text-primary">{nextSong.title}</span>
                  </>
                ) : (
                  "Última canción de la playlist"
                )}
              </p>
            )}
          </>
        )}

        {/* Asa para redimensionar (esquina inferior derecha) */}
        {size !== "mini" && (
          <div
            role="button"
            aria-label="Redimensionar el reproductor"
            onPointerDown={startResize}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            onLostPointerCapture={endResize}
            className="absolute bottom-1 right-1 z-20 flex h-5 w-5 cursor-nwse-resize touch-none items-end justify-end rounded-sm text-starlight/40 hover:text-starlight/80"
          >
            <svg viewBox="0 0 10 10" className="size-3 fill-current">
              <path d="M9 1v8H1" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}