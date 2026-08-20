/**
 * ============================================================
 * SONG COMPOSER — SUBIR UNA CANCIÓN (FASE 10)
 * ============================================================
 *
 * ¿Qué hace?
 *   Formulario a pantalla completa para añadir una canción a la
 *   banda sonora desde la página: título, frase que dedica,
 *   cantante y autor. El audio se puede dar de 3 formas:
 *     - Pegando una URL directa (mp3/ogg).
 *     - Subiendo un mp3 ya listo.
 *     - Subiendo un video (mp4/webm): se convierte a mp3 aquí
 *       mismo (en el navegador) y se guarda la versión mp3.
 *
 * ¿Cómo funciona?
 *   - La conversión la hace ffmpeg.wasm en el navegador
 *     (src/lib/audio/convert.ts), sin enviar el video a ningún
 *     lado.
 *   - Con el proveedor Supabase, el audio se sube a Storage y
 *     el registro (con la URL) a la tabla songs. Con el
 *     proveedor local, se guarda en el navegador.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/audio/convert.ts (mp4 → mp3)
 *   - src/lib/data/index.ts (data.addSong)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { motion } from "motion/react";
import { FileAudio, FileVideo, Link2, Music, Send, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Song } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { getFileNameWithoutExtension, isVideoFile, toMp3Blob } from "@/lib/audio/convert";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const LIMITS = {
  title: 80,
  artist: 60,
  reason: 300,
  author: 30,
  url: 500,
} as const;

const EMOJIS = ["🎵", "🎶", "💖", "🌟", "🎧", "🎤", "🎸", "🪩"];

export interface SongComposerProps {
  onClose: () => void;
  /** Se llama con la canción creada/actualizada (la lista se refresca). */
  onCreated: (song: Song) => void;
  /** Si se pasa, el formulario edita esa canción en lugar de crear una nueva. */
  song?: Song | null;
}

type SourceMode = "url" | "file";

/** Formulario para subir o editar una canción. */
export function SongComposer({ onClose, onCreated, song }: SongComposerProps) {
  const { name } = useAuth();
  const editing = Boolean(song);
  const [title, setTitle] = useState(song?.title ?? "");
  const [reason, setReason] = useState(song?.reason ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [author, setAuthor] = useState(song?.author ?? name ?? "");
  const [url, setUrl] = useState(song?.audioUrl ?? "");
  const [mode, setMode] = useState<SourceMode>(song ? "url" : "url");
  const [file, setFile] = useState<File | null>(null);
  const [emoji, setEmoji] = useState<string>(song?.emoji ?? EMOJIS[0]);
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSource = mode === "url" ? url.trim().length > 0 : file !== null;
  const canSave =
    !saving &&
    !converting &&
    title.trim().length > 0 &&
    artist.trim().length > 0 &&
    // Al editar se puede conservar el audio actual sin tocar la fuente.
    (editing || hasSource);

  // Escape cierra + bloqueo de scroll + pausa del fondo.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving && !converting) onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("fyez:background-off"));
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("fyez:background-on"));
    };
  }, [onClose, saving, converting]);

  function handleFilePick(picked: File | null) {
    if (!picked) return;
    if (!isVideoFile(picked) && !picked.type.startsWith("audio/")) {
      showToast("Formato no válido", "Sube un audio (mp3, ogg, wav…) o un video (mp4, webm).");
      return;
    }
    setFile(picked);
    if (!title.trim()) setTitle(getFileNameWithoutExtension(picked.name));
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);

    let audioBlob: Blob | null = null;

    try {
      if (mode === "file" && file) {
        // Si es video, se convierte a mp3 (aquí mismo, en el navegador).
        if (isVideoFile(file)) {
          setConverting(true);
          showToast("Convirtiendo", "Tu video se está convirtiendo a mp3…");
          audioBlob = await toMp3Blob(file);
          setConverting(false);
        } else {
          audioBlob = await toMp3Blob(file);
        }
      }

      const nextUrl = audioBlob ? "" : url.trim();
      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        reason: reason.trim() || "Para escucharla juntos.",
        author: author.trim() || "Anónimo",
        emoji,
        // En edición, si no se indicó audio nuevo, se conserva el actual.
        audioUrl: editing ? nextUrl || song!.audioUrl : nextUrl,
      };

      const saved = editing
        ? await data.updateSong(song!.id, payload, audioBlob ?? undefined)
        : await data.addSong(payload, audioBlob ?? undefined);

      playChime(false);
      showToast(
        editing ? "Canción actualizada" : "Canción guardada",
        `"${saved.title}" ya está en nuestro universo.`,
      );
      onCreated(saved);
    } catch (error) {
      setSaving(false);
      setConverting(false);
      console.error(error);
      showToast(
        error instanceof Error && error.message.startsWith("Supabase:")
          ? "Supabase"
          : "No se pudo guardar",
        error instanceof Error ? error.message : "Inténtalo de nuevo en un momento.",
      );
    }
  }

  const busy = saving || converting;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Subir una canción"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-night-900/95"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Cerrar sin guardar"
          className={cn(
            "absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
            busy && "pointer-events-none opacity-50",
          )}
        >
          <X className="size-4.5" />
        </button>

        {/* Encabezado */}
        <div className="px-7 pb-5 pt-7 sm:px-9">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-blush-glow/90">
            <Music className="size-3.5" />
            {editing ? "Editar canción" : "Subir una canción"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing
              ? "Corrige lo que haga falta"
              : "Hazla sonar en nuestro universo"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            {editing
              ? "Cambia el título, la frase, el cantante, el autor, el emoji o el audio. Si no tocas la música, se conserva la actual."
              : "Escribe lo que te hace dedicármela y elige el audio: un enlace, un mp3 listo o un video (lo convierto a mp3 aquí mismo)."}
          </p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Título de la canción
            </span>
            <input
              type="text"
              value={title}
              maxLength={LIMITS.title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nombre de la canción"
              disabled={busy}
              className={cn(
                "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-blush-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {title.length}/{LIMITS.title}
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Cantante
              </span>
              <input
                type="text"
                value={artist}
                maxLength={LIMITS.artist}
                onChange={(event) => setArtist(event.target.value)}
                placeholder="Artista o grupo"
                disabled={busy}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "placeholder:text-starlight/40",
                  "outline-none transition-colors focus:border-blush-glow/60",
                )}
              />
              <span className="text-right text-[10px] text-starlight/40">
                {artist.length}/{LIMITS.artist}
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Autor (quién la manda)
              </span>
              <input
                type="text"
                value={author}
                maxLength={LIMITS.author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Tu nombre"
                disabled={busy}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "placeholder:text-starlight/40",
                  "outline-none transition-colors focus:border-blush-glow/60",
                )}
              />
              <span className="text-right text-[10px] text-starlight/40">
                {author.length}/{LIMITS.author}
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Frase que me dedica
            </span>
            <textarea
              value={reason}
              maxLength={LIMITS.reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder={"Esta canción me recuerda cuando…"}
              disabled={busy}
              className={cn(
                "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-blush-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {reason.length}/{LIMITS.reason}
            </span>
          </label>

          {/* Emoji de la canción */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Emoji de la canción
            </span>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  disabled={busy}
                  aria-pressed={emoji === option}
                  className={cn(
                    "flex size-11 cursor-pointer items-center justify-center rounded-xl border text-xl transition-all duration-200 active:scale-90",
                    emoji === option
                      ? "border-blush-glow/60 bg-blush-glow/10 shadow-[0_0_14px_-4px_rgba(219,180,166,0.6)]"
                      : "border-white/10 bg-night-800/40 hover:border-blush-glow/40",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Origen del audio */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              La música
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("url")}
                disabled={busy}
                aria-pressed={mode === "url"}
                className={cn(
                  "inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-xs font-medium transition-all duration-300 active:scale-[0.97]",
                  mode === "url"
                    ? "border-blush-glow/50 bg-blush-glow/10 text-primary"
                    : "glass text-starlight/80 hover:border-white/25",
                )}
              >
                <Link2 className="size-3.5" />
                Enlace
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("file");
                  fileInputRef.current?.click();
                }}
                disabled={busy}
                aria-pressed={mode === "file"}
                className={cn(
                  "inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-xs font-medium transition-all duration-300 active:scale-[0.97]",
                  mode === "file"
                    ? "border-blush-glow/50 bg-blush-glow/10 text-primary"
                    : "glass text-starlight/80 hover:border-white/25",
                )}
              >
                <Upload className="size-3.5" />
                Subir archivo
              </button>
            </div>

            {mode === "url" ? (
              <label className="flex flex-col gap-1.5">
                <input
                  type="url"
                  value={url}
                  maxLength={LIMITS.url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://… (enlace directo al mp3/ogg)"
                  disabled={busy}
                  className={cn(
                    "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                    "placeholder:text-starlight/40",
                    "outline-none transition-colors focus:border-blush-glow/60",
                  )}
                />
                <span className="text-[10px] text-starlight/40">
                  {editing && !url.trim()
                    ? "Déjalo vacío para conservar el audio actual."
                    : "El enlace debe apuntar directo al archivo de audio (termina en .mp3, .ogg…)."}
                </span>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className={cn(
                  "flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed transition-colors",
                  file
                    ? "border-blush-glow/50 bg-blush-glow/5"
                    : "border-white/15 bg-night-800/40 hover:border-blush-glow/40",
                )}
              >
                {file ? (
                  <>
                    <span className="flex items-center gap-2 text-sm font-medium text-primary">
                      {isVideoFile(file) ? (
                        <FileVideo className="size-4 text-blush-glow" />
                      ) : (
                        <FileAudio className="size-4 text-blush-glow" />
                      )}
                      {file.name}
                    </span>
                    <span className="text-[11px] text-starlight/60">
                      {isVideoFile(file)
                        ? "Se convertirá a mp3 al guardar"
                        : `${Math.round(file.size / 1024 / 1024)} MB · listo para guardar`}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="size-5 text-starlight/50" />
                    <span className="text-xs text-starlight/70">
                      {editing
                        ? "Elige un audio nuevo (si no eliges, se conserva el actual)"
                        : "Elige un mp3… o un mp4/webm (lo convierto a mp3)"}
                    </span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/mp4,video/webm,application/octet-stream"
              className="hidden"
              onChange={(event) => handleFilePick(event.target.files?.[0] ?? null)}
            />
          </div>

          {converting && (
            <p className="flex items-center gap-2 text-xs text-blush-glow/90">
              <span className="size-3.5 animate-spin rounded-full border-2 border-blush-glow/30 border-t-blush-glow" />
              Convirtiendo video a mp3… puede tardar un momento.
            </p>
          )}

          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="glass inline-flex h-11 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium text-starlight transition-all duration-300 hover:border-white/25 hover:text-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-7 text-sm font-medium",
                "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
                "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
              )}
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-primary" />
                  Guardando…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  {editing ? "Guardar cambios" : "Guardar canción"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}