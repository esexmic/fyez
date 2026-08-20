/**
 * ============================================================
 * LOGRO COMPOSER — PROPONER / CORREGIR UN LOGRO
 * ============================================================
 *
 * ¿Qué hace?
 *   Formulario a pantalla completa para proponer un reto nuevo:
 *   título, cómo se completa, quién lo propone, emoji y fecha
 *   límite. Si no se completa antes de la fecha, pasa a fallidos.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/index.ts (data.addAchievement/updateAchievement)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { motion } from "motion/react";
import { CalendarClock, ImagePlus, Send, Trophy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Achievement } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { monterreyNow, monterreyToday } from "@/lib/monterrey";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const LIMITS = {
  title: 80,
  howto: 300,
  author: 30,
} as const;

const EMOJIS = ["🏅", "💖", "🌟", "🔥", "🎯", "👑", "✨", "🌈"];

export interface LogroComposerProps {
  onClose: () => void;
  /** Se llama con el logro creado/actualizado (la lista se refresca). */
  onSaved: (achievement: Achievement) => void;
  /** Si se pasa, el formulario edita ese logro. */
  achievement?: Achievement | null;
}

/** Formulario para proponer o editar un logro. */
export function LogroComposer({ onClose, onSaved, achievement }: LogroComposerProps) {
  const editing = Boolean(achievement);
  const { name } = useAuth();
  const [title, setTitle] = useState(achievement?.title ?? "");
  const [howto, setHowto] = useState(achievement?.howto ?? "");
  const [author, setAuthor] = useState(achievement?.author ?? name);
  const [emoji, setEmoji] = useState(achievement?.emoji ?? EMOJIS[0]);
  const [hasDeadline, setHasDeadline] = useState(Boolean(achievement?.deadline));
  const initialDeadline = achievement?.deadline ?? null;
  const [deadlineDate, setDeadlineDate] = useState(
    initialDeadline ? initialDeadline.slice(0, 10) : monterreyToday(),
  );
  const [deadlineTime, setDeadlineTime] = useState(
    initialDeadline?.includes("T")
      ? initialDeadline.slice(11, 16)
      : monterreyNow().slice(11, 16),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : !removeImage
      ? (achievement?.imageUrl ?? null)
      : null;

  const canSave =
    !saving &&
    title.trim().length > 0 &&
    howto.trim().length > 0 &&
    author.trim().length > 0 &&
    (!hasDeadline || (deadlineDate.trim().length > 0 && deadlineTime.trim().length > 0));

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
    try {
      const base = {
        title: title.trim(),
        howto: howto.trim(),
        author: author.trim(),
        emoji,
        deadline: hasDeadline ? `${deadlineDate}T${deadlineTime}` : null,
      };

      // Si se eligió imagen nueva se sube; si se quitó, se limpia.
      let uploaded: string | null = null;
      if (imageFile) {
        uploaded = await data.uploadAchievementImage(imageFile);
      }
      const touchImage = Boolean(imageFile) || removeImage;

      const saved = editing
        ? await data.updateAchievement(achievement!.id, {
            ...base,
            ...(touchImage ? { imageUrl: uploaded ?? null } : {}),
          })
        : await data.addAchievement({
            ...base,
            status: "pending",
            images: [],
            ...(uploaded ? { imageUrl: uploaded } : {}),
          });

      playChime(false);
      showToast(
        editing ? "Logro actualizado" : "Reto propuesto",
        `"${saved.title}" ${editing ? "se corrigió" : "ya está en la lista"}.`,
      );
      onSaved(saved);
    } catch (error) {
      setSaving(false);
      console.error(error);
      showToast("No se pudo guardar", "Inténtalo de nuevo en un momento.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Proponer un logro"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
      onClick={() => {
        if (!saving) onClose();
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
          disabled={saving}
          aria-label="Cerrar sin guardar"
          className={cn(
            "absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-gold-glow/40 hover:text-primary active:scale-95",
            saving && "pointer-events-none opacity-50",
          )}
        >
          <X className="size-4.5" />
        </button>

        {/* Encabezado */}
        <div className="px-7 pb-5 pt-7 sm:px-9">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
            <Trophy className="size-3.5" />
            {editing ? "Editar logro" : "Proponer un reto"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing ? "Corrige lo que haga falta" : "¿Qué tendríamos que lograr?"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            {editing
              ? "Cambia el título, cómo se completa, quién lo propuso, el emoji o la fecha límite."
              : "Escribe el reto y la fecha límite: si no se cumple para ese día, pasará a fallidos."}
          </p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Título del logro
            </span>
            <input
              type="text"
              value={title}
              maxLength={LIMITS.title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej: Cocinar una cena juntos"
              disabled={saving}
              className={cn(
                "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-gold-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {title.length}/{LIMITS.title}
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Cómo se completa
            </span>
            <textarea
              value={howto}
              maxLength={LIMITS.howto}
              onChange={(event) => setHowto(event.target.value)}
              rows={3}
              placeholder={"Describe el reto: qué hay que hacer para ganarlo…"}
              disabled={saving}
              className={cn(
                "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-gold-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {howto.length}/{LIMITS.howto}
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Quién lo propone
            </span>
            <input
              type="text"
              value={author}
              maxLength={LIMITS.author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Tu nombre"
              disabled={saving}
              className={cn(
                "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-gold-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {author.length}/{LIMITS.author}
            </span>
          </label>

          {/* Emoji del logro */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Emoji del logro
            </span>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  disabled={saving}
                  aria-pressed={emoji === option}
                  className={cn(
                    "flex size-11 cursor-pointer items-center justify-center rounded-xl border text-xl transition-all duration-200 active:scale-90",
                    emoji === option
                      ? "border-gold-glow/60 bg-gold-glow/10 shadow-[0_0_14px_-4px_rgba(250,204,21,0.5)]"
                      : "border-white/10 bg-night-800/40 hover:border-gold-glow/40",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Imagen del reto */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Foto del reto (opcional)
            </span>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Vista previa del reto"
                  className="h-40 w-full rounded-xl border border-white/10 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                  disabled={saving}
                  aria-label="Quitar la foto del reto"
                  className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-red-500/90 text-white transition-transform hover:scale-110"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={saving}
                className={cn(
                  "flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors",
                  "border-white/15 bg-night-800/40 hover:border-gold-glow/40",
                )}
              >
                <ImagePlus className="size-5 text-starlight/50" />
                <span className="text-xs text-starlight/70">
                  Sube una foto que ilustre el reto
                </span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null;
                if (picked && picked.type.startsWith("image/")) {
                  setImageFile(picked);
                  setRemoveImage(false);
                }
              }}
            />
          </div>

          {/* Fecha límite */}
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-night-800/40 p-3.5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                <CalendarClock className="size-3.5" />
                Fecha límite
              </span>
              <input
                type="checkbox"
                checked={hasDeadline}
                onChange={(event) => setHasDeadline(event.target.checked)}
                disabled={saving}
                className="size-4 accent-gold-glow"
              />
            </label>
            {hasDeadline && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={deadlineDate}
                  min={monterreyToday()}
                  onChange={(event) => setDeadlineDate(event.target.value)}
                  disabled={saving}
                  className={cn(
                    "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                    "outline-none transition-colors focus:border-gold-glow/60",
                  )}
                />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(event) => setDeadlineTime(event.target.value)}
                  disabled={saving}
                  aria-label="Hora límite"
                  className={cn(
                    "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                    "outline-none transition-colors focus:border-gold-glow/60",
                  )}
                />
              </div>
            )}
            <p className="text-[10px] leading-relaxed text-starlight/40">
              {hasDeadline
                ? "Hora de Monterrey (UTC-6). Si no se completa antes de esa hora, el logro pasará a FALLIDOS en rojo."
                : "Desmarcado: el reto no expira, esperará hasta completarse."}
            </p>
          </div>

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
              onClick={() => void handleSave()}
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
                  {editing ? "Guardar cambios" : "Proponer logro"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}