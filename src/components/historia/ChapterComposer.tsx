/**
 * ============================================================
 * CHAPTER COMPOSER — AGREGAR UN CAPÍTULO DESDE EL LIBRO
 * ============================================================
 *
 * ¿Qué hace?
 *   Modal para escribir un capítulo nuevo de la historia:
 *   título, fecha, el cielo (el tiempo de ese día), la frase
 *   que lo cierra y el texto. Quién lo escribe sale solo: el
 *   autor es quien tiene la sesión abierta (César o Sofía).
 *
 * ¿Cómo funciona?
 *   - Guarda con data.addStoryChapter(); el numeral romano se
 *     asigna solo según el orden de fechas en la línea de tiempo.
 *   - El cielo se elige de los cielos disponibles (día soleado,
 *     amanecer, lluvia…): ver src/data/atmospheres.ts.
 *   - El contenido: cada bloque separado por línea en blanco
 *     se muestra como párrafo aparte.
 */

"use client";

import { BookHeart, PenLine, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ATMOSPHERES } from "@/data/atmospheres";
import type { AtmosphereId } from "@/data/atmospheres";
import { data } from "@/lib/data";
import type { StoryChapter } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const LIMITS = {
  title: 60,
  quote: 200,
  content: 6000,
} as const;

interface ChapterComposerProps {
  onClose: () => void;
  onCreated: (chapter: StoryChapter) => void;
  /** Si se pasa, el formulario edita ese capítulo en lugar de crear uno nuevo. */
  chapter?: StoryChapter | null;
}

export function ChapterComposer({ onClose, onCreated, chapter }: ChapterComposerProps) {
  const { name } = useAuth();
  const editing = Boolean(chapter);
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [isoDate, setIsoDate] = useState(chapter?.date ?? "");
  const [atmosphere, setAtmosphere] = useState<AtmosphereId>(
    (chapter?.atmosphere as AtmosphereId) || "amanecer",
  );
  const [quote, setQuote] = useState(chapter?.quote ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [saving, setSaving] = useState(false);

  const canSave =
    !saving &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(isoDate);

  // Escape cierra + bloqueo de scroll + pausa del fondo.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("fyez:background-off"));
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("fyez:background-on"));
    };
  }, [onClose, saving]);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      date: isoDate,
      atmosphere,
      quote: quote.trim() || undefined,
      content: content.trim(),
      author: chapter?.author ?? (name || "César"),
    };
    try {
      const saved = editing && chapter
        ? await data.updateStoryChapter(chapter.id, payload)
        : await data.addStoryChapter(payload);
      playChime(false);
      showToast(
        editing ? "Capítulo actualizado" : "Capítulo guardado",
        `"${saved.title}" ya vive en nuestro libro.`,
      );
      onCreated(saved);
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error && error.message.startsWith("Supabase:")
          ? "Supabase"
          : "No se pudo guardar",
        error instanceof Error ? error.message : "Inténtalo de nuevo en un momento.",
      );
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escribir un capítulo nuevo"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-night-900/95"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Cerrar sin guardar"
          className={cn(
            "absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
            saving && "pointer-events-none opacity-50",
          )}
        >
          <X className="size-4.5" />
        </button>

        <div className="px-7 pb-7 pt-7 sm:px-9">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-purple-glow/90">
            <BookHeart className="size-3.5" />
            {editing ? "Editar un capítulo" : "Escribir un capítulo"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing ? "Corrige este día" : "Un día más en nuestro libro"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            {editing
              ? "Al guardar, el capítulo se actualiza en la nube: lo verán los dos al instante."
              : "La página asigna el numeral solo, según la fecha. El capítulo llevará tu nombre como autor: " +
                (name || "César") +
                "."}
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                  Título
                </span>
                <input
                  type="text"
                  value={title}
                  maxLength={LIMITS.title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej: El día que empezó todo…"
                  disabled={saving}
                  className={cn(
                    "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                    "placeholder:text-starlight/40",
                    "outline-none transition-colors focus:border-purple-glow/60",
                  )}
                />
                <span className="text-right text-[10px] text-starlight/40">
                  {title.length}/{LIMITS.title}
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                  Fecha
                </span>
                <input
                  type="date"
                  value={isoDate}
                  onChange={(event) => setIsoDate(event.target.value)}
                  disabled={saving}
                  className={cn(
                    "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                    "outline-none transition-colors focus:border-purple-glow/60",
                    "[color-scheme:dark]",
                  )}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                El tiempo de ese día (su cielo)
              </span>
              <select
                value={atmosphere}
                onChange={(event) => setAtmosphere(event.target.value as AtmosphereId)}
                disabled={saving}
                className={cn(
                  "h-11 cursor-pointer rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "outline-none transition-colors focus:border-purple-glow/60",
                  "[color-scheme:dark]",
                )}
              >
                {(Object.keys(ATMOSPHERES) as AtmosphereId[]).map((id) => (
                  <option key={id} value={id}>
                    {ATMOSPHERES[id].name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Frase (opcional — la que cierra el capítulo)
              </span>
              <input
                type="text"
                value={quote}
                maxLength={LIMITS.quote}
                onChange={(event) => setQuote(event.target.value)}
                placeholder={"La frase que resume ese día…"}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "placeholder:text-starlight/40",
                  "outline-none transition-colors focus:border-purple-glow/60",
                )}
              />
              <span className="text-right text-[10px] text-starlight/40">
                {quote.length}/{LIMITS.quote}
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                El capítulo
              </span>
              <textarea
                value={content}
                maxLength={LIMITS.content}
                onChange={(event) => setContent(event.target.value)}
                rows={7}
                placeholder={
                  "Cuenta el día con tus palabras…\n\nCada bloque separado por una línea en blanco será un párrafo."
                }
                disabled={saving}
                className={cn(
                  "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                  "placeholder:text-starlight/40",
                  "outline-none transition-colors focus:border-purple-glow/60",
                )}
              />
              <span className="text-right text-[10px] text-starlight/40">
                {content.length}/{LIMITS.content}
              </span>
            </label>

            <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
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
                  "bg-gradient-to-r from-violet-glow/80 via-purple-glow/80 to-pink-glow/80 text-night-950",
                  "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
                )}
              >
                {saving ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-night-950/30 border-t-night-950" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <PenLine className="size-4" />
                    {editing ? "Guardar cambios" : "Guardar capítulo"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}