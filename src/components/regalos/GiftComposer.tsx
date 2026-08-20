/**
 * COMPOSITOR DE REGALOS — agregar un regalo desde la página.
 * Dos tipos: "queremos regalarlo" (deseo) o "ya se regaló".
 * Campos: tipo, fecha, título, subtítulo, texto, autor y una
 * foto (en vez del emoji; el emoji queda de respaldo).
 */
"use client";

import { Gift, ImagePlus, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { data } from "@/lib/data";
import type { Gift as GiftType } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const LIMITS = {
  title: 60,
  subtitle: 80,
  description: 600,
} as const;

interface GiftComposerProps {
  author: string;
  onClose: () => void;
  onCreated: (gift: GiftType) => void;
  /** Regalo existente: abre el formulario en modo edición. */
  gift?: GiftType | null;
}

export function GiftComposer({ author, onClose, onCreated, gift }: GiftComposerProps) {
  const editing = Boolean(gift);
  const [kind, setKind] = useState<"wish" | "given">(gift?.kind ?? "given");
  const [title, setTitle] = useState(gift?.title ?? "");
  const [subtitle, setSubtitle] = useState(gift?.subtitle ?? "");
  const [description, setDescription] = useState(gift?.description ?? "");
  const [isoDate, setIsoDate] = useState(gift?.date ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(gift?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const canSave =
    !saving && title.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(isoDate);

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

  function handlePickImage(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      if (gift) {
        const updated = await data.updateGift(
          gift.id,
          {
            kind,
            title: title.trim(),
            subtitle: subtitle.trim() || undefined,
            description: description.trim() || undefined,
            imageUrl: undefined,
            date: isoDate,
          },
          imageFile ?? undefined,
        );
        playChime(false);
        showToast("Regalo actualizado", `"${updated.title}" quedó guardado con los cambios.`);
        onCreated(updated);
        return;
      }
      const created = await data.addGift(
        {
          kind,
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          description: description.trim() || undefined,
          author,
          imageUrl: undefined,
          date: isoDate,
        },
        imageFile ?? undefined,
      );
      playChime(false);
      showToast(
        "Regalo guardado",
        kind === "wish"
          ? `"${created.title}" quedó en la lista de deseos.`
          : `"${created.title}" ya forma parte de nuestra historia.`,
      );
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
      aria-label={editing ? "Editar un regalo" : "Agregar un regalo"}
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
            <Gift className="size-3.5" />
            {editing ? "Editar regalo" : "Agregar regalo"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing ? "Corrige este tesoro" : "Un nuevo tesoro nuestro"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            Cuenta qué es, cuándo pasó y por qué vale guardarlo. La foto es
            opcional: sin ella, usamos un emoji.
          </p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          {/* Tipo de regalo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind("given")}
              disabled={saving}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-300",
                kind === "given"
                  ? "border-blush-glow/60 bg-blush-glow/15 text-blush-200"
                  : "border-white/10 bg-night-800/60 text-starlight/60 hover:border-white/20",
              )}
            >
              Ya se regaló 🎁
            </button>
            <button
              type="button"
              onClick={() => setKind("wish")}
              disabled={saving}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-300",
                kind === "wish"
                  ? "border-gold-glow/60 bg-gold-glow/15 text-gold-glow"
                  : "border-white/10 bg-night-800/60 text-starlight/60 hover:border-white/20",
              )}
            >
              Queremos regalarlo 🌟
            </button>
          </div>

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
                placeholder="Ej: La taza de dinosaurio…"
                disabled={saving}
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
                  "outline-none transition-colors focus:border-blush-glow/60",
                  "[color-scheme:dark]",
                )}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Subtítulo (opcional)
            </span>
            <input
              type="text"
              value={subtitle}
              maxLength={LIMITS.subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Ej: para nuestro aniversario"
              disabled={saving}
              className={cn(
                "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-blush-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {subtitle.length}/{LIMITS.subtitle}
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Historia del regalo
            </span>
            <textarea
              value={description}
              maxLength={LIMITS.description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder={"Por qué lo elegimos…\n\nQué significa para nosotros."}
              disabled={saving}
              className={cn(
                "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-blush-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {description.length}/{LIMITS.description}
            </span>
          </label>

          {/* Foto */}
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Vista previa del regalo"
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.04] text-starlight/30">
                <Gift className="size-7" strokeWidth={1.5} aria-hidden />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Foto del regalo (opcional)
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!saving) fileInput.current?.click();
                }}
                disabled={saving}
                className={cn(
                  "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-starlight",
                  "transition-all duration-300 hover:border-blush-glow/50 hover:text-primary",
                  imagePreview && "text-blush-200",
                )}
              >
                <ImagePlus className="size-4" />
                {imagePreview ? "Cambiar foto" : "Subir foto"}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handlePickImage(file);
                  event.target.value = "";
                }}
              />
            </div>
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
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-7 text-sm font-medium",
                "bg-gradient-to-r from-blush-glow/80 via-pink-glow/80 to-purple-glow/80 text-night-950",
                "shadow-[0_8px_30px_-10px_rgba(219,180,166,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
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
                  <Gift className="size-4" />
                  {editing ? "Guardar cambios" : "Guardar regalo"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}