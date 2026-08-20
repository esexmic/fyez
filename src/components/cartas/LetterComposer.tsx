/**
 * ============================================================
 * LETTER COMPOSER — ESCRIBIR UNA CARTA (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Formulario a pantalla completa para escribir una carta
 *   desde la página: título + texto. Al guardar, la carta se
 *   agrega al proveedor de datos (hoy el navegador; cuando se
 *   conecte la base de datos, se guardará en la nube).
 *
 * ¿Cómo funciona?
 *   - Se requiere título y texto (los párrafos se separan con
 *     una línea en blanco).
 *   - Escape o el botón cierran sin guardar; el scroll del
 *     fondo se bloquea mientras está abierto.
 *   - Al guardar: carrillón suave, aviso y la lista se refresca.
 *
 * ¿Dónde modificarlo?
 *   - Límites de texto: constantes LIMITS.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/index.ts (data.addLetter)
 *   - src/lib/audio/chime.ts
 *   - motion/react, lucide-react (X, Send, Heart)
 */

"use client";

import { motion } from "motion/react";
import { Heart, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Letter } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

/** Límites del texto. */
const LIMITS = {
  title: 60,
  content: 4000,
} as const;

export interface LetterComposerProps {
  onClose: () => void;
  /** Se llama con la carta recién creada (la lista se refresca). */
  onCreated: (letter: Letter) => void;
}

/** Formulario para escribir una carta. */
export function LetterComposer({ onClose, onCreated }: LetterComposerProps) {
  const { name } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = !saving && title.trim().length > 0 && content.trim().length > 0;

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
      const created = await data.addLetter({
        title: title.trim(),
        content: content.trim(),
        author: name,
      });
      playChime(false);
      showToast("Carta guardada", `"${created.title}" ya vive en nuestro universo.`);
      onCreated(created);
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
      aria-label="Escribir una carta"
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
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
            saving && "pointer-events-none opacity-50",
          )}
        >
          <X className="size-4.5" />
        </button>

        {/* Encabezado */}
        <div className="px-7 pb-5 pt-7 sm:px-9">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
            <Heart className="size-3.5 fill-gold-glow/60" strokeWidth={1.8} />
            Escribir una carta
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            Dile lo que llevas dentro
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            La carta se guarda en este universo y queda lista para abrirla
            como los demás sobres. Separa los párrafos con una línea en blanco.
          </p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Título
            </span>
            <input
              type="text"
              value={title}
              maxLength={LIMITS.title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Para cuando leas esto…"
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
              Tu carta
            </span>
            <textarea
              value={content}
              maxLength={LIMITS.content}
              onChange={(event) => setContent(event.target.value)}
              rows={9}
              placeholder={"Te escribo esta carta porque…\n\nQuiero que sepas que…"}
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
                  Guardar carta
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}