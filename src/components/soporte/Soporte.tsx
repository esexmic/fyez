/**
 * ============================================================
 * SOPORTE — TICKETS DE FALLAS QUE ENCONTRAMOS Y ARREGLAMOS
 * ============================================================
 *
 * ¿Qué hace?
 *   Un lugar para anotar las fallas que encontramos en la app:
 *   César o Sofía reportan lo que se rompió (o lo que falta),
 *   queda guardado en la nube, y cuando lo arreglamos se marca
 *   "arreglada" con el nombre de quién lo resolvió. Así nada
 *   se pierde entre mensajes.
 *
 * ¿Cómo funciona?
 *   - Las fallas viven en Supabase (tabla `tickets`).
 *   - El autor sale automáticamente de la sesión (César/Sofía).
 *   - Cada falla: título + explicación. Se puede marcar como
 *     arreglada (con quién la arregló) o borrarse.
 *   - Sin re-siembra: lo que se borra, queda borrado.
 *
 * ¿Dónde modificarlo?
 *   - Tabla: docs/supabase-schema.sql (bloque SOPORTE).
 *   - Guardado: src/lib/data/ (proveedores).
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/index.ts (data.getTickets, addTicket…)
 *   - src/lib/auth.ts (useAuth para el autor)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { CheckCheck, PenLine, Trash2, Wrench, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import type { Ticket } from "@/lib/data/types";
import { data } from "@/lib/data";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function formatDay(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

export function SoporteIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-10 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200">
        <Wrench className="size-3.5 text-purple-glow" />
        Soporte
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
        Fallas que <span className="text-gradient">arreglamos</span> juntos
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Si algo se rompe o algo falta, lo anotamos aquí para no olvidarlo.
        Cuando quede resuelto, lo marcamos y sigue siendo nuestro.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* TICKET COMPOSER — REPORTAR UNA FALLA                                */
/* ------------------------------------------------------------------ */

const LIMITS = {
  title: 80,
  description: 1500,
} as const;

function TicketComposer({
  author,
  onClose,
  onCreated,
}: {
  author: string;
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave =
    !saving && title.trim().length > 0 && description.trim().length > 0;

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
      const created = await data.addTicket({
        title: title.trim(),
        description: description.trim(),
        status: "open",
        author,
      });
      playChime(false);
      showToast("Falla reportada", `"${created.title}" quedó en la lista de soporte.`);
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
      aria-label="Reportar una falla"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/95 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-night-900/95 px-7 py-10 sm:px-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className={cn(
            "absolute right-4 top-4 flex size-11 cursor-pointer items-center justify-center rounded-full",
            "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-purple-glow/40 hover:text-primary active:scale-95",
          )}
        >
          <X className="size-5" />
        </button>

        <span className="inline-flex text-4xl">🔧</span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-primary sm:text-3xl">
          Reportar una falla
        </h2>
        <p className="mt-2 text-sm text-starlight/60">
          Escribe qué se rompió o qué falta para que lo arreglemos después.
        </p>

        <div className="mt-7 space-y-4 text-left">
          <div>
            <label
              htmlFor="ticket-title"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-starlight/60"
            >
              Título
            </label>
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, LIMITS.title))}
              maxLength={LIMITS.title}
              placeholder="Ej: Los logros no cargan en el celular"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-primary placeholder:text-starlight/30 focus:border-purple-glow/60 focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-starlight/40">
              {title.length}/{LIMITS.title}
            </p>
          </div>
          <div>
            <label
              htmlFor="ticket-description"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-starlight/60"
            >
              Qué pasa
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, LIMITS.description))
              }
              maxLength={LIMITS.description}
              rows={6}
              placeholder="Describe la falla: dónde pasa, qué hiciste y qué esperabas que pasara…"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-primary placeholder:text-starlight/30 focus:border-purple-glow/60 focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-starlight/40">
              {description.length}/{LIMITS.description}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-5 py-2.5 text-sm text-starlight/60 transition-colors hover:text-primary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium",
              "bg-gradient-to-r from-purple-glow to-pink-glow text-night-950",
              "shadow-[0_8px_30px_-10px_rgba(141,130,214,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
              !canSave && "cursor-not-allowed opacity-40",
            )}
          >
            <PenLine className="size-4" />
            {saving ? "Guardando…" : "Reportar falla"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SOPORTE GALLERY — LA LISTA DE FALLAS                                */
/* ------------------------------------------------------------------ */

export function SoporteGallery() {
  const { name } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);

  // Carga las fallas: de la más reciente a la más antigua.
  useEffect(() => {
    let active = true;
    data
      .getTickets()
      .then((items) => {
        if (!active) return;
        setTickets([...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCreated = useCallback((ticket: Ticket) => {
    setComposing(false);
    setTickets((previous) => [ticket, ...previous]);
  }, []);

  const handleToggleFixed = useCallback(
    async (ticket: Ticket) => {
      const nextStatus: Ticket["status"] = ticket.status === "open" ? "fixed" : "open";
      const patch =
        nextStatus === "fixed"
          ? { status: nextStatus, fixedBy: name, fixedAt: new Date().toISOString() }
          : { status: nextStatus, fixedBy: undefined, fixedAt: undefined };
      try {
        const updated = await data.updateTicket(ticket.id, patch);
        playChime(false);
        showToast(
          nextStatus === "fixed" ? "Falla arreglada" : "Falla abierta de nuevo",
          nextStatus === "fixed"
            ? `"${ticket.title}" quedó resuelta${name ? ` por ${name}` : ""}.`
            : `"${ticket.title}" vuelve a estar pendiente.`,
        );
        setTickets((previous) =>
          previous.map((item) => (item.id === ticket.id ? updated : item)),
        );
      } catch (error) {
        console.error(error);
        showToast("No se pudo guardar", "Inténtalo de nuevo en un momento.");
      }
    },
    [name],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const target = tickets.find((item) => item.id === id);
      void data.deleteTicket(id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setTickets((previous) => previous.filter((item) => item.id !== id));
      if (target) {
        showToast("Falla quitada", `"${target.title}" ya no está en la lista.`);
      }
    },
    [tickets],
  );

  const openCount = tickets.filter((ticket) => ticket.status === "open").length;

  return (
    <section
      data-soporte-gallery
      aria-label="Soporte"
      className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
    >
      {/* Barra superior */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-starlight/70">
          {loading
            ? "Revisando la lista…"
            : tickets.length > 0
              ? (
                  <>
                    <Wrench className="size-3.5 text-purple-glow" />
                    {tickets.length} {tickets.length === 1 ? "falla" : "fallas"}
                    {openCount > 0 && ` · ${openCount} por arreglar`}
                  </>
                )
              : "Sin fallas anotadas ✨"}
        </span>

        <button
          type="button"
          onClick={() => setComposing(true)}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium",
            "bg-gradient-to-r from-purple-glow via-pink-glow to-blush-glow text-night-950",
            "shadow-[0_8px_30px_-10px_rgba(141,130,214,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
          )}
        >
          <PenLine className="size-4" />
          Reportar falla
        </button>
      </div>

      {/* Lista de fallas */}
      {loading ? (
        <p className="py-16 text-center text-sm italic text-starlight/60">
          Revisando la lista…
        </p>
      ) : tickets.length > 0 ? (
        <motion.ul
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2"
        >
          {tickets.map((ticket) => {
            const fixed = ticket.status === "fixed";
            return (
              <motion.li key={ticket.id} variants={itemVariants}>
                <article
                  className={cn(
                    "glass flex h-full flex-col rounded-2xl p-5 transition-all duration-300",
                    fixed && "opacity-70",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold leading-snug text-primary">
                      {ticket.title}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                        fixed
                          ? "border border-green-glow/30 bg-green-glow/10 text-green-300"
                          : "border border-amber-400/30 bg-amber-400/10 text-amber-300",
                      )}
                    >
                      {fixed ? (
                        <>
                          <CheckCheck className="size-3" />
                          Arreglada
                        </>
                      ) : (
                        "Por arreglar"
                      )}
                    </span>
                  </div>

                  <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-starlight/80">
                    {ticket.description}
                  </p>

                  <p className="mt-4 text-xs text-starlight/50">
                    {fixed && ticket.fixedBy
                      ? `Arreglada${ticket.fixedAt ? ` el ${formatDay(ticket.fixedAt)}` : ""} por ${ticket.fixedBy}`
                      : `${ticket.author} la anotó el ${formatDay(ticket.createdAt)}`}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                    <button
                      type="button"
                      onClick={() => void handleToggleFixed(ticket)}
                      aria-label={fixed ? "Volver a abrir falla" : "Marcar como arreglada"}
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-300 active:scale-95",
                        fixed
                          ? "text-starlight/50 hover:text-amber-300"
                          : "border border-green-glow/30 text-green-300 hover:bg-green-glow/10",
                      )}
                    >
                      <CheckCheck className="size-3.5" />
                      {fixed ? "Abrir de nuevo" : "Arreglada ✓"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ticket.id)}
                      aria-label={`Borrar falla: ${ticket.title}`}
                      className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-starlight/40 transition-all duration-300 hover:text-red-300 active:scale-95"
                    >
                      <Trash2 className="size-3.5" />
                      Quitar
                    </button>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="text-5xl">🔧</span>
          <p className="text-sm text-starlight/60">
            Todavía no hay fallas anotadas. Si algo se rompe, reporta la
            primera.
          </p>
        </div>
      )}

      {/* Composer */}
      <AnimatePresence>
        {composing && (
          <TicketComposer
            author={name}
            onClose={() => setComposing(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </section>
  );
}