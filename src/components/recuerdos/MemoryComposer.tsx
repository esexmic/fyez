/**
 * ============================================================
 * MEMORY COMPOSER — AGREGAR UN RECUERDO DESDE LA PÁGINA (FASE 15)
 * ============================================================
 *
 * ¿Qué hace?
 *   Modal para guardar un momento nuevo en la galería: foto,
 *   video o nota, con título, fecha, descripción opcional y
 *   archivo opcional (foto o video, según el tipo elegido).
 *   Sin archivo, el recuerdo se muestra como "cielo de
 *   recuerdo" (emoji + gradiente).
 *
 * ¿Cómo funciona?
 *   - Guarda con data.addMemory(memory, file): el proveedor
 *     activo sube el archivo (nube en Supabase o comprimido en
 *     el navegador) y genera la url.
 *   - El emoji queda como respaldo: si no se escribe, se pone
 *     el ícono por defecto del tipo.
 */

"use client";

import { Camera, Film, ImagePlus, NotebookPen, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Memory } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const LIMITS = {
  title: 80,
  description: 600,
} as const;

/** Gradientes de respaldo (sin foto, se usa un "cielo de recuerdo"). */
const TINTS = [
  "linear-gradient(160deg, #1a2348 0%, #3b2f63 60%, #6e4770 100%)",
  "linear-gradient(160deg, #273452 0%, #40537c 70%, #5f7198 100%)",
  "linear-gradient(160deg, #2b3260 0%, #7d5560 60%, #d9a569 100%)",
  "linear-gradient(160deg, #5c8fb8 0%, #a3c2d9 55%, #ecd7c0 100%)",
];

/** Emoji por defecto según el tipo de recuerdo. */
const DEFAULT_EMOJI: Record<Memory["kind"], string> = {
  photo: "📸",
  video: "🎬",
  note: "💌",
};

interface MemoryComposerProps {
  onClose: () => void;
  onCreated: (memory: Memory) => void;
  /** Si se pasa, el formulario edita ese recuerdo en lugar de crear uno nuevo. */
  memory?: Memory | null;
}

export function MemoryComposer({ onClose, onCreated, memory }: MemoryComposerProps) {
  const { name } = useAuth();
  const editing = Boolean(memory);
  const [kind, setKind] = useState<Memory["kind"]>(memory?.kind ?? "photo");
  const [title, setTitle] = useState(memory?.title ?? "");
  const [description, setDescription] = useState(memory?.description ?? "");
  const [emoji, setEmoji] = useState(memory?.emoji ?? "");
  const [isoDate, setIsoDate] = useState(memory?.date ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const canSave =
    !saving &&
    title.trim().length > 0 &&
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

  function handlePickFile(picked: File) {
    setFile(picked);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(String(reader.result));
    reader.readAsDataURL(picked);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const payload: Partial<Memory> = {
      title: title.trim(),
      description: description.trim() || undefined,
      kind,
      date: isoDate,
      emoji: emoji.trim() || DEFAULT_EMOJI[kind],
      tint: memory?.tint ?? TINTS[Math.floor(Math.random() * TINTS.length)],
      author: name,
    };
    try {
      const created = editing && memory
        ? await data.updateMemory(memory.id, payload, file ?? undefined)
        : await data.addMemory(
            {
              title: title.trim(),
              description: description.trim() || undefined,
              kind,
              date: isoDate,
              emoji: emoji.trim() || DEFAULT_EMOJI[kind],
              tint: TINTS[Math.floor(Math.random() * TINTS.length)],
              author: name,
            },
            file ?? undefined,
          );
      playChime(false);
      showToast(
        editing ? "Recuerdo actualizado" : "Recuerdo guardado",
        `"${created.title}" ya brilla en nuestra galería.`,
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

  const KINDS: { id: Memory["kind"]; label: string; icon: typeof Camera }[] = [
    { id: "photo", label: "Foto", icon: Camera },
    { id: "video", label: "Video", icon: Film },
    { id: "note", label: "Nota", icon: NotebookPen },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agregar un recuerdo"
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
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-pink-glow/90">
            <Camera className="size-3.5" />
            {editing ? "Editar recuerdo" : "Agregar recuerdo"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing ? "Un momento que ya está" : "Un momento que se queda"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            {editing
              ? "Al guardar, el recuerdo se actualiza en la nube: lo verán los dos al instante."
              : "Sube una foto o un video, o escribe una nota. Sin archivo, el recuerdo se muestra con su emoji y su cielo."}
          </p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-4 px-7 pb-7 sm:px-9">
          {/* Tipo de recuerdo */}
          <div className="grid grid-cols-3 gap-2">
            {KINDS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setKind(option.id);
                    setFile(null);
                    setFilePreview(null);
                  }}
                  disabled={saving}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-300",
                    kind === option.id
                      ? "border-pink-glow/60 bg-pink-glow/15 text-blush-200"
                      : "border-white/10 bg-night-800/60 text-starlight/60 hover:border-white/20",
                  )}
                >
                  <Icon className="size-4" />
                  {option.label}
                </button>
              );
            })}
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
                placeholder="Ej: Nuestro día en el parque…"
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "placeholder:text-starlight/40",
                  "outline-none transition-colors focus:border-pink-glow/60",
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
                  "outline-none transition-colors focus:border-pink-glow/60",
                  "[color-scheme:dark]",
                )}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Qué pasó ese día (opcional)
            </span>
            <textarea
              value={description}
              maxLength={LIMITS.description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder={"Cuenta por qué vale guardarlo…"}
              disabled={saving}
              className={cn(
                "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-pink-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {description.length}/{LIMITS.description}
            </span>
          </label>

          {/* Archivo (solo para foto y video) */}
          {kind !== "note" && (
            <div className="flex items-center gap-4">
              {filePreview ? (
                kind === "video" ? (
                  <video
                    src={filePreview}
                    muted
                    playsInline
                    className="size-24 shrink-0 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={filePreview}
                    alt="Vista previa del recuerdo"
                    className="size-24 shrink-0 rounded-2xl border border-white/10 object-cover"
                  />
                )
              ) : (
                <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.04] text-starlight/30">
                  <ImagePlus className="size-7" strokeWidth={1.5} aria-hidden />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                  {kind === "video" ? "Video (opcional)" : "Foto (opcional)"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!saving) fileInput.current?.click();
                  }}
                  disabled={saving}
                  className={cn(
                    "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-starlight",
                    "transition-all duration-300 hover:border-pink-glow/50 hover:text-primary",
                    filePreview && "text-blush-200",
                  )}
                >
                  <ImagePlus className="size-4" />
                  {filePreview ? "Cambiar archivo" : "Subir archivo"}
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept={kind === "video" ? "video/*" : "image/*"}
                  className="hidden"
                  onChange={(event) => {
                    const picked = event.target.files?.[0];
                    if (picked) handlePickFile(picked);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
          )}

          {/* Emoji (respaldo cuando no hay archivo) */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Emoji (opcional)
            </span>
            <input
              type="text"
              value={emoji}
              maxLength={8}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder={DEFAULT_EMOJI[kind]}
              disabled={saving}
              className={cn(
                "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-pink-glow/60",
              )}
            />
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
                    <Camera className="size-4" />
                    {editing ? "Guardar cambios" : "Guardar recuerdo"}
                  </>
                )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}