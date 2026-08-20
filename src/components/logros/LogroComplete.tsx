/**
 * ============================================================
 * LOGRO COMPLETE — ENVIAR LA PRUEBA DE QUE LO COMPLETASTE
 * ============================================================
 *
 * ¿Qué hace?
 *   Cuando un logro está pendiente, cualquiera de los dos puede
 *   marcarlo como completado: indica la fecha, quién lo hizo,
 *   una frase y adjunta fotos como prueba. Queda "en revisión"
 *   hasta que la otra persona lo verifique.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/index.ts (data.updateAchievement + uploads)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { motion } from "motion/react";
import { Camera, Check, ImagePlus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Achievement } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { monterreyNow, monterreyToday, monterreyWallToISO } from "@/lib/monterrey";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const MAX_IMAGES = 3;

export interface LogroCompleteProps {
  achievement: Achievement;
  onClose: () => void;
  /** Se llama con el logro actualizado (la lista se refresca). */
  onSaved: (achievement: Achievement) => void;
}

/** Formulario para completar un logro con su prueba. */
export function LogroComplete({ achievement, onClose, onSaved }: LogroCompleteProps) {
  const { name } = useAuth();
  const nowMty = monterreyNow();
  const [completedDate, setCompletedDate] = useState(nowMty.slice(0, 10));
  const [completedTime, setCompletedTime] = useState(nowMty.slice(11, 16));
  const [completedBy, setCompletedBy] = useState(name);
  const [phrase, setPhrase] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFiles(picked: FileList | null) {
    if (!picked) return;
    const next = Array.from(picked).filter((file) => file.type.startsWith("image/"));
    if (next.length === 0) {
      showToast("Imagen no válida", "Sube fotos (jpg, png, webp…).");
      return;
    }
    setImages((previous) => [...previous, ...next].slice(0, MAX_IMAGES));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const urls: string[] = [];
      for (const file of images) {
        urls.push(await data.uploadAchievementImage(file));
      }

      const saved = await data.updateAchievement(achievement.id, {
        status: "review",
        completedBy,
        completedAt: monterreyWallToISO(`${completedDate}T${completedTime}`),
        completionPhrase: phrase.trim() || undefined,
        images: urls,
      });

      playChime(false);
      showToast(
        "¡Logro completado!",
        "Quedó en revisión para que la otra persona lo verifique.",
      );
      onSaved(saved);
    } catch (error) {
      setSaving(false);
      console.error(error);
      showToast("No se pudo enviar", "Inténtalo de nuevo en un momento.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Completar logro"
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
            <Check className="size-3.5" />
            Completar logro
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {achievement.emoji} {achievement.title}
          </h2>
          <p className="mt-2 text-sm italic leading-relaxed text-starlight/75">
            “{achievement.howto}”
          </p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Fecha en que se completó
              </span>
              <input
                type="date"
                value={completedDate}
                max={monterreyToday()}
                onChange={(event) => setCompletedDate(event.target.value)}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "outline-none transition-colors focus:border-gold-glow/60",
                )}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Hora en que se completó
              </span>
              <input
                type="time"
                value={completedTime}
                max={monterreyNow().slice(11, 16)}
                onChange={(event) => setCompletedTime(event.target.value)}
                disabled={saving}
                aria-label="Hora en que se completó"
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "outline-none transition-colors focus:border-gold-glow/60",
                )}
              />
              <span className="text-right text-[10px] text-starlight/40">
                Hora de Monterrey (UTC-6)
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Quién lo completó
            </span>
            <div className="flex gap-2">
              {(["César", "Sofía"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCompletedBy(option)}
                  disabled={saving}
                  aria-pressed={completedBy === option}
                  className={cn(
                    "h-11 flex-1 cursor-pointer rounded-xl border text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                    completedBy === option
                      ? "border-gold-glow/60 bg-gold-glow/10 text-primary"
                      : "border-white/10 bg-night-800/40 text-starlight/70 hover:border-gold-glow/40",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Frase de tu logro
            </span>
            <textarea
              value={phrase}
              maxLength={300}
              onChange={(event) => setPhrase(event.target.value)}
              rows={3}
              placeholder="Cuéntale cómo lo lograste…"
              disabled={saving}
              className={cn(
                "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-gold-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">{phrase.length}/300</span>
          </label>

          {/* Pruebas */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Fotos de prueba ({images.length}/{MAX_IMAGES})
            </span>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Prueba ${index + 1}`}
                      className="size-20 rounded-xl border border-white/10 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((previous) => previous.filter((_, i) => i !== index))
                      }
                      disabled={saving}
                      aria-label={`Quitar prueba ${index + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-red-500/90 text-white transition-transform hover:scale-110"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className={cn(
                  "flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors",
                  "border-white/15 bg-night-800/40 hover:border-gold-glow/40",
                )}
              >
                <ImagePlus className="size-5 text-starlight/50" />
                <span className="text-xs text-starlight/70">
                  Adjunta la prueba de que lo completaste (hasta {MAX_IMAGES} fotos)
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-night-800/40 p-3 text-[11px] leading-relaxed text-starlight/60">
            <Camera className="mt-0.5 size-3.5 shrink-0" />
            Se quedará como “En revisión” hasta que la otra persona vea tus
            fotos y lo confirme (o lo rechace).
          </p>

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
              disabled={saving}
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
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Enviar para verificar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}