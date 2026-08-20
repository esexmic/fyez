/**
 * ============================================================
 * SECRETOS — CON FECHA MÍNIMA PARA ABRIRLOS (FASE 14)
 * ============================================================
 *
 * ¿Qué hace?
 *   Los secretos enviados entre César y Sofía, como las cartas:
 *   TÍTULO, MENSAJE y AUTOR abajo en chico. Cada secreto puede
 *   tener una FECHA MÍNIMA para abrirlo: antes de esa fecha
 *   queda cerrado con candado y se avisa el día en que se podrá
 *   leer; cuando llega el día, se abre igual que un sobre.
 *
 * ¿Cómo funciona?
 *   - Los secretos viven en el proveedor de datos (local o
 *     Supabase, como las cartas).
 *   - El autor sale automáticamente de la sesión (César/Sofía).
 *   - Las fechas se comparan con la hora de Monterrey.
 *   - El lector y el compositor abren a pantalla completa,
 *     bloqueando el scroll y pausando el fondo.
 *
 * ¿Dónde modificarlo?
 *   - Secretos de ejemplo: src/data/secrets.ts.
 *   - Guardado: src/lib/data/ (proveedores).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/secrets.ts (secretos iniciales)
 *   - src/lib/data/index.ts (data.getSecrets, addSecret)
 *   - src/lib/auth.ts (useAuth para el autor)
 *   - src/lib/monterrey.ts (fechas en Monterrey)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { CalendarClock, Clock, Lock, MoonStar, Pencil, Send, Sparkles, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { SecretEntry } from "@/lib/data/types";
import { data } from "@/lib/data";
import { useAuth } from "@/components/auth/AuthProvider";
import { isDeadlinePassed, monterreyNow, monterreyToday } from "@/lib/monterrey";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/** "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm" -> "22 de agosto" o "22 de agosto · 9:30 p. m.". */
function formatOpenDate(openFrom: string): string {
  const hasTime = openFrom.includes("T");
  const [year, month, day] = openFrom.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const thisYear = date.getFullYear() === new Date(monterreyToday()).getFullYear();
  const dateText = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: thisYear ? "long" : "short",
    ...(thisYear ? {} : { year: "numeric" }),
  });
  if (!hasTime) return dateText;
  const [, time] = openFrom.split("T");
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw) % 24;
  const suffix = hours >= 12 ? "p. m." : "a. m.";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${dateText} · ${display}:${minutes} ${suffix}`;
}

/** ¿Se puede abrir ya este secreto (fecha y hora de Monterrey)? */
function isOpenable(secret: SecretEntry): boolean {
  if (!secret.openFrom) return true;
  // "YYYY-MM-DD" abre a las 23:59 de ese día; "YYYY-MM-DDTHH:mm"
  // abre justo a esa hora. La fecha ha llegado = se puede abrir.
  return isDeadlinePassed(secret.openFrom, monterreyNow());
}

export function SecretosIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-blush-200">
        <MoonStar className="size-3.5 text-blush-glow" />
        Secretos
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Pequeños misterios por{" "}
        <span className="text-gradient">descubrir</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Algunos secretos se abren de inmediato; otros esperan su día. Deja uno
        y elige cuándo podrá leerse.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SECRET READER — LECTURA A PANTALLA COMPLETA                        */
/* ------------------------------------------------------------------ */

function SecretReader({
  secret,
  onClose,
  onEdit,
  onDelete,
}: {
  secret: SecretEntry;
  onClose: () => void;
  onEdit?: (secret: SecretEntry) => void;
  onDelete?: (id: string) => void;
}) {
  // Bloqueo de scroll + pausa del fondo + cerrar con Escape.
  useEffect(() => {
    playChime(false);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("fyez:background-off"));
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("fyez:background-on"));
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Secreto: ${secret.title}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/95 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar secreto"
        className={cn(
          "absolute right-4 top-4 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full",
          "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
        )}
      >
        <X className="size-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-night-900/95 px-7 py-10 text-center sm:px-10"
      >
        <span className="inline-flex text-5xl">{secret.emoji}</span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-primary sm:text-3xl">
          {secret.title}
        </h2>

        <div className="mx-auto my-6 h-px w-44 bg-gradient-to-r from-transparent via-blush-glow/40 to-transparent" />

        <div className="space-y-5 text-left">
          {secret.message.split(/\n\s*\n/).map((paragraph, index) => (
            <p
              key={index}
              className="text-sm leading-relaxed text-starlight/90 sm:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Autor abajo en chico */}
        <p className="mt-8 text-sm italic text-starlight/60">
          — {secret.author}, con un secreto más
        </p>

        {/* Editar y Borrar */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(secret)}
              aria-label={`Editar secreto: ${secret.title}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs text-starlight/40 transition-all duration-300 hover:text-primary active:scale-95"
            >
              <Pencil className="size-3.5" />
              Editar este secreto
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(secret.id)}
              aria-label={`Borrar secreto: ${secret.title}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs text-starlight/40 transition-all duration-300 hover:text-red-300 active:scale-95"
            >
              <Trash2 className="size-3.5" />
              Quitar este secreto
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECRET COMPOSER — SOLTAR UN SECRETO                                */
/* ------------------------------------------------------------------ */

const LIMITS = {
  title: 60,
  message: 2000,
} as const;

function SecretComposer({
  author,
  onClose,
  onCreated,
  secret,
}: {
  author: string;
  onClose: () => void;
  onCreated: (secret: SecretEntry) => void;
  /** Secreto existente: abre el formulario en modo edición. */
  secret?: SecretEntry | null;
}) {
  const editing = Boolean(secret);
  const [title, setTitle] = useState(secret?.title ?? "");
  const [message, setMessage] = useState(secret?.message ?? "");
  const [emoji, setEmoji] = useState(secret?.emoji ?? "🤫");
  const [openDate, setOpenDate] = useState(() => secret?.openFrom?.slice(0, 10) ?? "");
  const [openTime, setOpenTime] = useState(() => secret?.openFrom?.includes("T") ? secret.openFrom.slice(11, 16) : "");
  const [saving, setSaving] = useState(false);

  const canSave =
    !saving && title.trim().length > 0 && message.trim().length > 0;

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
      const hasDate = openDate.trim().length > 0;
      const hasTime = openTime.trim().length > 0;
      const openFrom = hasDate
        ? hasTime
          ? `${openDate.trim()}T${openTime.trim()}`
          : openDate.trim()
        : null;
      const payload = {
        title: title.trim(),
        message: message.trim(),
        author: secret?.author ?? author,
        emoji,
        openFrom,
      };
      const created = secret
        ? await data.updateSecret(secret.id, payload)
        : await data.addSecret(payload);
      playChime(false);
      showToast(
        secret ? "Secreto actualizado" : "Secreto guardado",
        openFrom
          ? `Se abrirá el ${formatOpenDate(openFrom)}.`
          : `"${created.title}" ya puede leerse.`,
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
      aria-label={editing ? "Editar un secreto" : "Soltar un secreto"}
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
            <MoonStar className="size-3.5" />
            {editing ? "Editar secreto" : "Soltar un secreto"}
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {editing ? "Corrige este misterio" : "¿Qué le escondes hoy?"}
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            Elige el día y la hora (de Monterrey) en que podrá abrirlo, o
            déjalo listo para leerse de inmediato. Tú decides cuándo lo descubre.
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
              placeholder="El misterio que esconde…"
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
              El secreto
            </span>
            <textarea
              value={message}
              maxLength={LIMITS.message}
              onChange={(event) => setMessage(event.target.value)}
              rows={7}
              placeholder={"Te guardo este secreto porque…\n\nCuando lo leas, vas a entender por qué…"}
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

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Emoji
              </span>
              <input
                type="text"
                value={emoji}
                maxLength={8}
                onChange={(event) => setEmoji(event.target.value.trim() || "🤫")}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-center text-xl",
                  "outline-none transition-colors focus:border-blush-glow/60",
                )}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                <CalendarClock className="size-3.5" />
                Abrirse el día
              </span>
              <input
                type="date"
                value={openDate}
                min={monterreyToday()}
                onChange={(event) => setOpenDate(event.target.value)}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "outline-none transition-colors focus:border-blush-glow/60",
                  "[color-scheme:dark]",
                )}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                <Clock className="size-3.5" />
                A las (opcional)
              </span>
              <input
                type="time"
                value={openTime}
                onChange={(event) => setOpenTime(event.target.value)}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-sm text-primary",
                  "outline-none transition-colors focus:border-blush-glow/60",
                  "[color-scheme:dark]",
                )}
              />
              <span className="text-right text-[10px] text-starlight/40">
                Hora de Monterrey
              </span>
            </label>
          </div>

          {/* Autor, abajo en chico */}
          <p className="text-center text-sm italic text-starlight/60">
            — {author}
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
                  {editing ? "Guardar cambios" : "Guardar secreto"}
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
/* SECRETS GALLERY — LA LISTA DE SECRETOS                             */
/* ------------------------------------------------------------------ */

export function SecretsGallery() {
  const { name } = useAuth();
  const [secrets, setSecrets] = useState<SecretEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSecret, setOpenSecret] = useState<SecretEntry | null>(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<SecretEntry | null>(null);

  // Carga de secretos: del más reciente al más antiguo.
  useEffect(() => {
    let active = true;
    data
      .getSecrets()
      .then((items) => {
        if (!active) return;
        setSecrets([...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleOpen = useCallback((secret: SecretEntry) => {
    if (!isOpenable(secret)) {
      showToast("Todavía no", `Este secreto se abrirá el ${formatOpenDate(secret.openFrom ?? "")}.`);
      return;
    }
    setOpenSecret(secret);
  }, []);

  const handleClose = useCallback(() => {
    setOpenSecret(null);
  }, []);

  const handleCreated = useCallback((secret: SecretEntry) => {
    setComposing(false);
    setEditing(null);
    setOpenSecret(null);
    setSecrets((previous) => {
      const exists = previous.some((item) => item.id === secret.id);
      return exists
        ? previous.map((item) => (item.id === secret.id ? secret : item))
        : [secret, ...previous];
    });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const target = secrets.find((item) => item.id === id);
      void data.deleteSecret(id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setSecrets((previous) => previous.filter((item) => item.id !== id));
      setOpenSecret(null);
      if (target) {
        showToast("Secreto quitado", `"${target.title}" ya no está en el cofre.`);
      }
    },
    [secrets],
  );

  const lockedCount = secrets.filter((secret) => !isOpenable(secret)).length;

  return (
    <section
      data-secrets-gallery
      aria-label="Secretos"
      className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
    >
      {/* Barra superior */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-starlight/70">
          {loading
            ? "Abriendo el cofre…"
            : secrets.length > 0
              ? (
                  <>
                    <Sparkles className="size-3.5 text-blush-glow" />
                    {secrets.length} {secrets.length === 1 ? "secreto" : "secretos"}
                    {lockedCount > 0 &&
                      ` · ${lockedCount} esperando su día`}
                  </>
                )
              : "El cofre está vacío por ahora"}
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
          <Send className="size-4" />
          Soltar un secreto
        </button>
      </div>

      {/* Rejilla de secretos */}
      {loading ? (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Abriendo el cofre…
        </p>
      ) : secrets.length > 0 ? (
        <motion.ul
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2"
        >
          {secrets.map((secret) => {
            const openable = isOpenable(secret);
            return (
              <motion.li key={secret.id} variants={itemVariants}>
                <button
                  type="button"
                  onClick={() => handleOpen(secret)}
                  aria-label={openable ? `Abrir secreto: ${secret.title}` : `Secreto que se abrirá el ${formatOpenDate(secret.openFrom ?? "")}`}
                  className={cn(
                    "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border p-6 text-left transition-all duration-500 hover:-translate-y-1",
                    openable
                      ? "border-blush-glow/30 bg-gradient-to-br from-blush-glow/10 via-night-900/60 to-night-950/80 hover:border-blush-glow/50"
                      : "border-white/10 bg-night-900/60",
                  )}
                >
                  {/* Candado del secreto cerrado */}
                  {!openable && (
                    <span className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-gold-glow/30 bg-night-950/60 text-gold-glow">
                      <Lock className="size-3.5" />
                    </span>
                  )}

                  <span
                    className={cn(
                      "text-3xl transition-transform duration-500 group-hover:scale-110",
                      !openable && "opacity-60",
                    )}
                  >
                    {secret.emoji}
                  </span>

                  <h3 className="mt-4 font-display text-lg font-semibold text-primary">
                    {secret.title}
                  </h3>

                  {openable ? (
                    <>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-starlight/75">
                        {secret.message}
                      </p>
                      <p className="mt-4 text-xs italic text-starlight/50">
                        — {secret.author}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-starlight/50">
                        Este secreto aún está sellado.
                      </p>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gold-glow">
                        <CalendarClock className="size-3.5" />
                        Se abrirá el {formatOpenDate(secret.openFrom ?? "")}
                      </p>
                      <p className="mt-2 text-xs italic text-starlight/50">
                        — {secret.author}
                      </p>
                    </>
                  )}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          El cofre está vacío. Deja el primer secreto.
        </p>
      )}

      {/* Lector a pantalla completa */}
      <AnimatePresence>
        {openSecret && (
          <SecretReader
            secret={openSecret}
            onClose={handleClose}
            onEdit={(secret) => {
              setOpenSecret(null);
              setEditing(secret);
            }}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* Compositor (nuevo o editando) */}
      {(composing || editing) && (
        <SecretComposer
          author={name || "César"}
          secret={editing ?? undefined}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
          onCreated={handleCreated}
        />
      )}
    </section>
  );
}