/**
 * ============================================================
 * LOGRO VERIFY — LA OTRA PERSONA CONFIRMA O RECHAZA
 * ============================================================
 *
 * ¿Qué hace?
 *   Muestra la prueba de un logro completado (quién, cuándo,
 *   frase y fotos) para que la otra persona la revise y decida:
 *    - Confirmar  → el logro se marca GANADO (verificado por ella).
 *    - Rechazar   → vuelve a PENDIENTE y se descarta la prueba.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/index.ts (data.updateAchievement)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { motion } from "motion/react";
import { Check, ShieldCheck, ThumbsDown, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Achievement } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { formatInMonterrey } from "@/lib/monterrey";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

export interface LogroVerifyProps {
  achievement: Achievement;
  onClose: () => void;
  /** Se llama con el logro actualizado (la lista se refresca). */
  onSaved: (achievement: Achievement) => void;
  onViewImage: (url: string) => void;
  /** true = solo ver la prueba (logro ya ganado). */
  readOnly?: boolean;
}

/** Modal de verificación de un logro completado. */
export function LogroVerify({
  achievement,
  onClose,
  onSaved,
  onViewImage,
  readOnly = false,
}: LogroVerifyProps) {
  const { name } = useAuth();
  const [saving, setSaving] = useState(false);
  // Solo quien PROPUSO el logro puede verificarlo (nunca quien lo completó).
  const canDecide = !readOnly && achievement.author === name;

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

  async function handleDecision(confirm: boolean) {
    if (saving) return;
    setSaving(true);
    try {
      const saved = confirm
        ? await data.updateAchievement(achievement.id, {
            status: "done",
            verifiedBy: name,
            verifiedAt: new Date().toISOString(),
          })
        : await data.updateAchievement(achievement.id, {
            status: "pending",
            completedBy: undefined,
            completedAt: undefined,
            completionPhrase: undefined,
            images: [],
            verifiedBy: undefined,
            verifiedAt: undefined,
          });

      playChime(confirm);
      showToast(
        confirm ? "¡Logro confirmado!" : "Logro rechazado",
        confirm
          ? `“${achievement.title}” quedó ganado para siempre.`
          : `“${achievement.title}” volvió a pendientes.`,
      );
      onSaved(saved);
    } catch (error) {
      setSaving(false);
      console.error(error);
      showToast("No se pudo guardar", "Inténtalo de nuevo en un momento.");
    }
  }

  const completedOn = achievement.completedAt
    ? formatInMonterrey(achievement.completedAt)
    : "fecha desconocida";

  const verifiedOn = achievement.verifiedAt
    ? formatInMonterrey(achievement.verifiedAt)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verificar logro"
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
          aria-label="Cerrar"
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
            <ShieldCheck className="size-3.5" />
            {readOnly ? "Prueba del logro" : "Verificación pendiente"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {achievement.emoji} {achievement.title}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            {readOnly
              ? achievement.verifiedBy
                ? `${achievement.completedBy} lo completó el ${completedOn} · verificado por ${achievement.verifiedBy}${verifiedOn ? ` el ${verifiedOn}` : ""}.`
                : `${achievement.completedBy} lo completó el ${completedOn}.`
              : `${achievement.completedBy} dice que lo completó el ${completedOn}. ${
                  achievement.author === name
                    ? "Eres quien lo propuso: revisa la prueba y decide."
                    : `Solo ${achievement.author} (quien lo propuso) puede verificarlo.`
                }`}
          </p>
        </div>

        {/* Detalle */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          {achievement.completionPhrase && (
            <p className="rounded-2xl border border-white/10 bg-night-800/50 p-4 text-sm italic leading-relaxed text-purple-200/90">
              “{achievement.completionPhrase}”
            </p>
          )}

          {/* Fotos de la prueba */}
          {achievement.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {achievement.images.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => onViewImage(url)}
                  aria-label="Ver la foto en grande"
                  className="cursor-zoom-in overflow-hidden rounded-xl border border-white/10 transition-transform duration-300 hover:scale-[1.03]"
                >
                  <img src={url} alt="Prueba del logro" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/15 bg-night-800/30 p-4 text-center text-xs italic text-starlight/50">
              No adjuntó fotos como prueba.
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {canDecide ? (
              <>
                <button
                  type="button"
                  onClick={() => void handleDecision(false)}
                  disabled={saving}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/40 px-6 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-400/10 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
                >
                  <ThumbsDown className="size-4" />
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDecision(true)}
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
                      Guardando…
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Sí, lo completó
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="glass inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium text-starlight transition-all duration-300 hover:border-white/25 hover:text-primary active:scale-[0.97] sm:w-auto"
              >
                Cerrar
              </button>
            )}
          </div>
          {!readOnly && !canDecide && (
            <p className="text-center text-[10px] text-starlight/40">
              La verificación la hace solo {achievement.author}, que propuso el logro.
            </p>
          )}
          {canDecide && (
            <p className="text-center text-[10px] text-starlight/40">
              Confirma solo si de verdad lo hizo: no queremos medallas falsas. 🏅
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}