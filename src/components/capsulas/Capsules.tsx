/**
 * CÁPSULAS DEL TIEMPO — selladas hasta su fecha, guardadas en la
 * nube (Supabase) para que César y Sofía compartan las mismas.
 * Cada quien las abre en su dispositivo: una vez abierta, queda
 * abierta para él/ella.
 */
"use client";

import { motion, type Variants } from "motion/react";
import {
  Hourglass,
  Lock,
  Pencil,
  Plus,
  Send,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { data } from "@/lib/data";
import type { TimeCapsule } from "@/lib/data/types";
import { getOpenedCapsules, onCapsulesChanged, openCapsule } from "@/lib/capsules";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function formatOpenDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CapsulasIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-blush-200">
        <Hourglass className="size-3.5 text-blush-glow" />
        Cápsulas del Tiempo
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Mensajes que{" "}
        <span className="text-gradient">viajan al futuro</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Cerramos hoy unas palabras para abrirlas cuando toque. La paciencia
        también es parte del amor.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* COMPOSITOR DE CÁPSULAS — sellar (o corregir) una cápsula            */
/* ------------------------------------------------------------------ */

const LIMITS = {
  title: 60,
  message: 2000,
  hint: 120,
} as const;

function CapsuleComposer({
  onClose,
  onSaved,
  capsule,
}: {
  onClose: () => void;
  onSaved: (capsule: TimeCapsule) => void;
  /** Cápsula existente: abre el formulario en modo edición. */
  capsule?: TimeCapsule | null;
}) {
  const editing = Boolean(capsule);
  const [title, setTitle] = useState(capsule?.title ?? "");
  const [emoji, setEmoji] = useState(capsule?.emoji ?? "🕰️");
  const [openDate, setOpenDate] = useState(capsule?.openDate ?? "");
  const [message, setMessage] = useState(capsule?.message ?? "");
  const [hint, setHint] = useState(capsule?.hint ?? "");
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const canSave =
    !saving &&
    title.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(openDate) &&
    message.trim().length > 0;

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
      const payload = {
        title: title.trim(),
        emoji,
        openDate: openDate.trim(),
        message: message.trim(),
        hint: hint.trim() || undefined,
      };
      const saved = capsule
        ? await data.updateCapsule(capsule.id, payload)
        : await data.addCapsule(payload);
      playChime(false);
      showToast(
        capsule ? "Cápsula actualizada" : "Cápsula sellada",
        `Se abrirá el ${formatOpenDate(saved.openDate)}.`,
      );
      onSaved(saved);
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
      aria-label={editing ? "Editar una cápsula" : "Sellar una cápsula"}
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

        <div className="px-7 pb-5 pt-7 sm:px-9">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-glow/90">
            <Hourglass className="size-3.5" />
            {editing ? "Editar cápsula" : "Sellar una cápsula"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing ? "Corrige este mensaje" : "Para el futuro que nos espera"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            Escribe lo que quieras, elige la fecha en que se abrirá y una
            pequeña pista visible desde antes.
          </p>
        </div>

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
              placeholder="Ej: Nuestro primer aniversario…"
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

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Emoji
              </span>
              <input
                type="text"
                value={emoji}
                maxLength={8}
                onChange={(event) => setEmoji(event.target.value.trim() || "🕰️")}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-center text-xl",
                  "outline-none transition-colors focus:border-blush-glow/60",
                )}
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                <Lock className="size-3.5" />
                Se abre el día
              </span>
              <input
                type="date"
                value={openDate}
                min={todayIso}
                onChange={(event) => setOpenDate(event.target.value)}
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
              El mensaje que viajará
            </span>
            <textarea
              value={message}
              maxLength={LIMITS.message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              placeholder={"Para el día en que esto se abra…\n\nSi hoy estás triste, recuerda que…"}
              disabled={saving}
              className={cn(
                "resize-none rounded-xl border border-white/10 bg-night-800/60 px-4 py-3 text-sm leading-relaxed text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-blush-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {message.length}/{LIMITS.message}
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
              Pista visible (opcional)
            </span>
            <input
              type="text"
              value={hint}
              maxLength={LIMITS.hint}
              onChange={(event) => setHint(event.target.value)}
              placeholder="Una sola línea que se ve antes de abrirla…"
              disabled={saving}
              className={cn(
                "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                "placeholder:text-starlight/40",
                "outline-none transition-colors focus:border-blush-glow/60",
              )}
            />
            <span className="text-right text-[10px] text-starlight/40">
              {hint.length}/{LIMITS.hint}
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
                  <Send className="size-4" />
                  {editing ? "Guardar cambios" : "Sellar cápsula"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GALERÍA DE CÁPSULAS                                                 */
/* ------------------------------------------------------------------ */

export function CapsulesGallery() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<TimeCapsule | null>(null);
  const [opened, setOpened] = useState<Set<string>>(() => getOpenedCapsules());

  useEffect(() => onCapsulesChanged(() => setOpened(getOpenedCapsules())), []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      let list: TimeCapsule[] = [];
      try {
        list = await data.getCapsules();
      } catch (error) {
        console.error(error);
      }
      if (active) setCapsules(list);
      if (active) setLoading(false);
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(
    () => [...capsules].sort((a, b) => a.openDate.localeCompare(b.openDate)),
    [capsules],
  );

  const handleSaved = useCallback((capsule: TimeCapsule) => {
    setComposing(false);
    setEditing(null);
    setCapsules((previous) => {
      const exists = previous.some((item) => item.id === capsule.id);
      return exists
        ? previous.map((item) => (item.id === capsule.id ? capsule : item))
        : [capsule, ...previous];
    });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const target = capsules.find((item) => item.id === id);
      void data.deleteCapsule(id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setCapsules((previous) => previous.filter((item) => item.id !== id));
      if (target) {
        playChime(true);
        showToast("Cápsula quitada", `"${target.title}" ya no viajará al futuro.`);
      }
    },
    [capsules],
  );

  return (
    <section
      data-capsules-gallery
      aria-label="Cápsulas del tiempo"
      className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
    >
      {/* Barra superior */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-starlight/70">
          {loading
            ? "Abriendo el cofre…"
            : capsules.length > 0
              ? `${capsules.length} ${capsules.length === 1 ? "cápsula sellada" : "cápsulas selladas"}`
              : "Ninguna cápsula por ahora"}
        </span>

        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium",
            "bg-gradient-to-r from-blush-glow via-pink-glow to-purple-glow text-night-950",
            "shadow-[0_8px_30px_-10px_rgba(219,180,166,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
          )}
        >
          <Plus className="size-4" />
          Sellar una cápsula
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Abriendo el cofre…
        </p>
      ) : capsules.length > 0 ? (
        <motion.ul
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          {sorted.map((capsule) => {
            const isOpened = opened.has(capsule.id);
            const canOpen =
              !isOpened && new Date(`${capsule.openDate}T23:59:59`) <= new Date();
            const locked = !isOpened && !canOpen;
            return (
              <motion.li key={capsule.id} variants={itemVariants}>
                <div
                  className={cn(
                    "group w-full rounded-3xl border p-6 text-left transition-colors",
                    isOpened
                      ? "border-gold-glow/30 bg-gradient-to-br from-gold-glow/10 via-night-900/60 to-night-950/80"
                      : canOpen
                        ? "border-blush-glow/30 bg-night-900/60"
                        : "border-white/10 bg-night-900/40 opacity-70",
                  )}
                >
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (canOpen) openCapsule(capsule.id);
                    }}
                    className={cn(
                      "flex w-full items-center gap-4 text-left",
                      !locked && "cursor-pointer",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full border text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6",
                        isOpened
                          ? "border-gold-glow/40 bg-night-800"
                          : "border-white/10 bg-night-800",
                      )}
                    >
                      {capsule.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-primary">
                        {capsule.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-starlight/60">
                        {isOpened ? (
                          <Unlock className="size-3.5 text-gold-glow" />
                        ) : (
                          <Lock className="size-3.5" />
                        )}
                        {isOpened
                          ? `Abierta el ${formatOpenDate(capsule.openDate)}`
                          : `Se abre el ${formatOpenDate(capsule.openDate)}`}
                      </p>
                      {(isOpened || canOpen) && capsule.hint && (
                        <p className="mt-1 text-xs italic text-purple-200/80">
                          {capsule.hint}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Editar y Borrar */}
                  <div className="mt-3 flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditing(capsule)}
                      aria-label={`Editar cápsula: ${capsule.title}`}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-starlight/40 transition-all duration-300 hover:text-primary active:scale-95"
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(capsule.id)}
                      aria-label={`Borrar cápsula: ${capsule.title}`}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-starlight/40 transition-all duration-300 hover:text-red-300 active:scale-95"
                    >
                      <Trash2 className="size-3.5" />
                      Quitar
                    </button>
                  </div>

                  <div className="mt-4">
                    {isOpened ? (
                      <p className="text-sm leading-relaxed text-starlight">
                        {capsule.message}
                      </p>
                    ) : canOpen ? (
                      <p className="text-sm text-starlight/70">
                        Ya está lista para abrirse — tócala cuando quieras. 🔓
                      </p>
                    ) : (
                      <p className="text-sm text-starlight/40">
                        Sellada. Lleva dentro una carta para ese día. 🕰️
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          El cofre está vacío. Sella la primera cápsula.
        </p>
      )}

      {/* Compositor (nueva o editando) */}
      {(composing || editing) && (
        <CapsuleComposer
          capsule={editing ?? undefined}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}