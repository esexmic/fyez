/**
 * ============================================================
 * LOGROS — NUESTRAS PEQUEÑAS MEDALLAS (FASE 12 + retos)
 * ============================================================
 *
 * ¿Qué hace?
 *   Galería completa de logros de la pareja:
 *    - Se SIEMBRAN 5 logros iniciales la primera vez.
 *    - Cualquiera puede PROPONER retos (título, cómo se completa,
 *      autor, emoji y fecha límite).
 *    - Si el reto vence sin completarse, pasa solo a FALLIDOS.
 *    - Completar un logro adjunta fecha, quién, frase y fotos
 *      como prueba → queda EN REVISIÓN.
 *    - La otra persona VERIFICA (confirma o rechaza) la prueba.
 *
 * ¿Qué archivos utiliza?
 *   - ./LogroComposer.tsx (proponer / editar)
 *   - ./LogroComplete.tsx (completar con prueba)
 *   - ./LogroVerify.tsx (verificar la prueba)
 *   - src/lib/data/index.ts (data.*)
 *   - src/data/achievements.ts (logros semilla)
 */

"use client";

import { motion, type Variants } from "motion/react";
import {
  BadgeCheck,
  Check,
  Cloud,
  HardDrive,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { data } from "@/lib/data";
import type { Achievement } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { formatDeadlineCompact, isDeadlinePassed, monterreyNow, monterreyToday } from "@/lib/monterrey";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

import { LogroComposer } from "./LogroComposer";
import { LogroComplete } from "./LogroComplete";
import { LogroVerify } from "./LogroVerify";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function LogrosIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200">
        <Trophy className="size-3.5 text-purple-glow" />
        Logros
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Nuestras pequeñas{" "}
        <span className="text-gradient">medallas</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Propón retos con fecha límite, complétalos con fotos como prueba y
        que la otra persona los verifique.
      </p>
    </section>
  );
}

/** Orden de la lista: en revisión → pendientes → ganados → fallidos. */
function sortAchievements(items: Achievement[]): Achievement[] {
  const order: Record<string, number> = { review: 0, pending: 1, done: 2, failed: 3 };
  return [...items].sort((a, b) => {
    const diff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (diff !== 0) return diff;
    // Dentro de pendientes, los que vencen antes primero (sin fecha al final).
    if (a.status === "pending" && b.status === "pending") {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function LogrosGallery() {
  const { name } = useAuth();
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [completing, setCompleting] = useState<Achievement | null>(null);
  const [verifying, setVerifying] = useState<Achievement | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Achievement | null>(null);

  const load = useCallback(async () => {
    let list: Achievement[];
    try {
      list = await data.getAchievements();
    } catch (error) {
      console.error(error);
      list = [];
    }

    // Los retos vencidos pasan solos a fallidos (hora de Monterrey).
    const nowMty = monterreyNow();
    const overdue = list.filter(
      (item) => item.status === "pending" && item.deadline && isDeadlinePassed(item.deadline, nowMty),
    );
    if (overdue.length > 0) {
      await Promise.all(
        overdue.map((item) => data.updateAchievement(item.id, { status: "failed" })),
      );
      list = await data.getAchievements();
    }

    setItems(sortAchievements(list));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const handleSaved = useCallback(() => {
    setComposing(false);
    setEditing(null);
    setCompleting(null);
    setVerifying(null);
    void load();
  }, [load]);

  const handleDelete = useCallback(
    async (target: Achievement) => {
      try {
        await data.deleteAchievement(target.id);
        setItems((previous) => previous.filter((item) => item.id !== target.id));
        setDeleting(null);
        playChime(true);
        showToast("Logro borrado", `"${target.title}" ya no está en la lista.`);
      } catch {
        setDeleting(null);
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      }
    },
    [],
  );

  const stats = useMemo(() => {
    const done = items.filter((item) => item.status === "done").length;
    const review = items.filter((item) => item.status === "review").length;
    const failed = items.filter((item) => item.status === "failed").length;
    const total = items.length;
    return { done, review, failed, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [items]);

  return (
    <section
      data-logros-gallery
      aria-label="Logros"
      className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
    >
      {/* Barra superior: nube + editar + proponer logro */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs",
            data.name === "supabase"
              ? "border-green-glow/25 bg-white/[0.03] text-green-glow/90"
              : "border-white/10 bg-white/[0.03] text-starlight/70",
          )}
        >
          {data.name === "supabase" ? (
            <>
              <Cloud className="size-3.5" />
              Nube conectada
            </>
          ) : (
            <>
              <HardDrive className="size-3.5" />
              Este dispositivo
            </>
          )}
        </span>

        <button
          type="button"
          onClick={() => setEditMode((value) => !value)}
          aria-pressed={editMode}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]",
            editMode
              ? "border-gold-glow/50 bg-gold-glow/10 text-gold-glow"
              : "glass text-starlight/85 hover:border-white/25 hover:text-primary",
          )}
        >
          {editMode ? <Check className="size-4" /> : <Pencil className="size-4" />}
          {editMode ? "Hecho" : "Editar"}
        </button>

        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium",
            "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
            "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
          )}
        >
          <Plus className="size-4" />
          Proponer logro
        </button>
      </div>

      {/* Aviso del modo edición */}
      {editMode && (
        <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-gold-glow/25 bg-gold-glow/5 px-5 py-3 text-center text-xs leading-relaxed text-gold-glow">
          Modo edición: usa <Pencil className="inline size-3.5" /> para corregir
          (título, cómo se completa, autor, emoji o fecha límite) y{" "}
          <Trash2 className="inline size-3.5" /> para borrar el reto.
        </div>
      )}

      {/* Progreso */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-night-900/50 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-starlight">
            <span className="font-semibold text-gold-glow">{stats.done}</span>{" "}
            de {stats.total} ganados
          </p>
          <p className="shrink-0 text-xs tabular-nums text-starlight/60">{stats.percent}%</p>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${stats.percent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-gold-glow/70 to-gold-glow"
          />
        </div>
        <p className="mt-2 text-xs italic text-starlight/60">
          {stats.review > 0
            ? `${stats.review} esperan tu verificación.`
            : stats.failed > 0
              ? `${stats.failed} quedaron fallidos.`
              : "Propón retos y complétalos con prueba."}
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Reuniendo las medallas…
        </p>
      ) : items.length > 0 ? (
        <motion.ul
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {items.map((achievement) => (
            <LogroCard
              key={achievement.id}
              achievement={achievement}
              editMode={editMode}
              currentName={name}
              onOpenProof={() => setVerifying(achievement)}
              onComplete={() => setCompleting(achievement)}
              onVerify={() => setVerifying(achievement)}
              onEdit={() => {
                setEditing(achievement);
                setEditMode(false);
              }}
              onDelete={() => setDeleting(achievement)}
            />
          ))}
        </motion.ul>
      ) : (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Todavía no hay logros. Propón tu primer reto. ✨
        </p>
      )}

      {/* Modales */}
      {(composing || editing) && (
        <LogroComposer
          achievement={editing}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
      {completing && (
        <LogroComplete
          achievement={completing}
          onClose={() => setCompleting(null)}
          onSaved={handleSaved}
        />
      )}
      {verifying && (
        <LogroVerify
          achievement={verifying}
          readOnly={verifying.status === "done"}
          onClose={() => setVerifying(null)}
          onSaved={handleSaved}
          onViewImage={setViewingImage}
        />
      )}
      {deleting && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Borrar logro"
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-night-950/95 p-4"
          onClick={() => setDeleting(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-night-900/95 p-8 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="text-3xl">🗑️</span>
            <h3 className="mt-3 font-display text-xl font-semibold text-primary">
              ¿Borrar “{deleting.title}”?
            </h3>
            <p className="mt-2 text-sm text-starlight/75">
              El reto desaparecerá de la lista. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="glass inline-flex h-10 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium text-starlight transition-all duration-300 hover:border-white/25 hover:text-primary active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleting)}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/40 px-6 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-400/10 active:scale-[0.97]"
              >
                <Trash2 className="size-4" />
                Borrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Visor de imagen (prueba de un logro) */}
      {viewingImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto de la prueba"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-night-950/95 p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            type="button"
            aria-label="Cerrar foto"
            className="absolute right-5 top-5 flex size-10 cursor-pointer items-center justify-center rounded-full glass text-starlight transition-all duration-300 hover:border-white/25 hover:text-primary"
          >
            <X className="size-4.5" />
          </button>
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            src={viewingImage}
            alt="Prueba del logro"
            className="max-h-[85vh] max-w-full rounded-2xl border border-white/15 object-contain shadow-[0_30px_100px_-30px_rgba(10,14,30,1)]"
          />
        </div>
      )}
    </section>
  );
}

interface LogroCardProps {
  achievement: Achievement;
  editMode: boolean;
  /** Quién está conectado ahora (para decidir si puede verificar). */
  currentName: string;
  /** Abre la prueba del logro (ganados: pulsar la tarjeta). */
  onOpenProof: () => void;
  onComplete: () => void;
  onVerify: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Una tarjeta de logro con su estado y acciones. */
function LogroCard({
  achievement,
  editMode,
  currentName,
  onOpenProof,
  onComplete,
  onVerify,
  onEdit,
  onDelete,
}: LogroCardProps) {
  const { status } = achievement;
  const isAuthor = achievement.author === currentName;
  const showVerifyButton = status === "review" && isAuthor;
  const awaitingVerify = status === "review" && !isAuthor;
  const clickableDone = status === "done" && !editMode;

  const style = {
    pending: {
      card: "border-white/10 bg-night-900/60 hover:border-white/25",
      icon: "border-white/10 bg-night-800 text-starlight/60",
      badge: "border-white/10 bg-white/[0.04] text-starlight/60",
    },
    review: {
      card: "border-blush-glow/40 bg-night-900/70",
      icon: "border-blush-glow/50 bg-night-800 text-blush-glow",
      badge: "border-blush-glow/40 bg-blush-glow/10 text-blush-glow",
    },
    done: {
      card: "border-gold-glow/20 bg-night-900/60 hover:border-gold-glow/40 hover:bg-night-900/80",
      icon: "border-gold-glow/40 bg-gradient-to-b from-gold-glow/25 via-gold-glow/10 to-transparent text-gold-glow shadow-[0_0_16px_-6px_rgba(250,204,21,0.45)]",
      badge: "border-gold-glow/30 bg-gold-glow/10 text-gold-glow",
    },
    failed: {
      card: "border-red-400/25 bg-red-950/10 hover:border-red-400/40",
      icon: "border-red-400/30 bg-night-800 text-red-400/80",
      badge: "border-red-400/30 bg-red-400/10 text-red-400",
    },
  } as const;

  const isOverdueToday =
    status === "pending" && achievement.deadline !== null && achievement.deadline.slice(0, 10) === monterreyToday();

  return (
    <motion.li variants={itemVariants}>
      <div
        role={clickableDone ? "button" : undefined}
        tabIndex={clickableDone ? 0 : undefined}
        onClick={clickableDone ? onOpenProof : undefined}
        onKeyDown={
          clickableDone
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") onOpenProof();
              }
            : undefined
        }
        aria-label={clickableDone ? `Ver la prueba de ${achievement.title}` : undefined}
        className={cn(
          "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-300",
          style[status].card,
          clickableDone && "cursor-pointer",
        )}
      >
        {/* Halo suave en ganados */}
        {status === "done" && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gold-glow/10 blur-2xl"
          />
        )}

        <div className="flex min-w-0 flex-1 items-start gap-4">
          {achievement.imageUrl ? (
            <img
              src={achievement.imageUrl}
              alt=""
              className="size-12 shrink-0 rounded-xl border border-white/10 object-cover"
            />
          ) : (
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full border text-xl",
                style[status].icon,
              )}
            >
              {achievement.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-semibold", status === "failed" ? "text-starlight/70 line-through" : "text-primary")}>
              {achievement.title}
            </p>
            <p className="mt-0.5 text-xs italic text-starlight/60">{achievement.howto}</p>
          </div>
          {!editMode && status === "pending" && achievement.deadline && (
            <p className="shrink-0 pt-1 text-right text-[10px] leading-tight text-starlight/50">
              Vence:
              <span className="block font-semibold text-starlight/75">
                {formatDeadlineCompact(achievement.deadline)}
              </span>
            </p>
          )}
          {editMode && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Editar ${achievement.title}`}
                title="Editar"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-gold-glow/30 text-gold-glow transition-colors hover:bg-gold-glow/10"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Borrar ${achievement.title}`}
                title="Borrar"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-red-400/30 text-red-400 transition-colors hover:bg-red-400/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Meta: autor + fecha límite */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-starlight/50">
          <span>Propuesto por {achievement.author}</span>
          {isOverdueToday && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-400/10 px-2 py-0.5 font-medium text-red-400">
              <Zap className="size-3" />
              ¡Vence hoy!
            </span>
          )}
          {status === "done" && achievement.verifiedBy && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gold-glow/20 bg-gold-glow/5 px-2 py-0.5 text-gold-glow/90">
              <ShieldCheck className="size-3" />
              Verificado por {achievement.verifiedBy}
            </span>
          )}
        </div>

        {/* Estado + acciones */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
              style[status].badge,
            )}
          >
            {status === "pending" && <Lock className="size-3" />}
            {status === "review" && <ShieldCheck className="size-3" />}
            {status === "done" && <BadgeCheck className="size-3" />}
            {status === "failed" && <X className="size-3" />}
            {status === "pending" && "Pendiente"}
            {status === "review" && "En revisión"}
            {status === "done" && "Ganado"}
            {status === "failed" && "Fallido"}
          </span>

          {!editMode && status === "pending" && (
            <button
              type="button"
              onClick={onComplete}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-semibold",
                "bg-gradient-to-r from-gold-glow/90 to-gold-glow text-night-950",
                "shadow-[0_6px_20px_-8px_rgba(250,204,21,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
              )}
            >
              <Sparkles className="size-3.5" />
              Acompletado
            </button>
          )}

          {showVerifyButton && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-blush-glow/30 bg-blush-glow/5 px-2 py-0.5 text-[10px] text-blush-glow/80">
                Solo tú puedes verificar
              </span>
              <button
                type="button"
                onClick={onVerify}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-semibold",
                  "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
                  "shadow-[0_6px_20px_-8px_rgba(160,138,216,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
                )}
              >
                <ShieldCheck className="size-3.5" />
                Verificar
              </button>
            </div>
          )}

          {awaitingVerify && (
            <span className="text-[11px] italic text-starlight/50">
              Esperando que {achievement.author} lo verifique…
            </span>
          )}

          {clickableDone && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-glow/80 transition-colors group-hover:text-gold-glow">
              <ShieldCheck className="size-3.5" />
              Ver la prueba
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
}