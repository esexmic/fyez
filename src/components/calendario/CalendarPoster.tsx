/**
 * ============================================================
 * CALENDARIO — PÓSTER UNIFICADO (FASE 11.7)
 * ============================================================
 *
 * ¿Qué hace?
 *   El calendario 2026 visto como un póster único y compacto:
 *   un contenedor de cristal oscuro con desenfoque, el año
 *   arriba, "for love of cesar y sofy" y un espacio reservado
 *   para 3 fotos de pareja (próximamente). Debajo, los 12 meses
 *   en una rejilla 4×3 (2×6 en móvil) integrados en la hoja.
 *   Los días importantes muestran el número DENTRO de un corazón
 *   rojo (SVG), sin texto de eventos.
 *
 *   Las fechas son DINÁMICAS: se cargan del proveedor de datos
 *   (local o Supabase) y se administran desde la página con
 *   "Agregar fecha" (título, emoji, día y por qué se celebra).
 *   En el menú de cada mes se pueden borrar con la papelera.
 *   La primera vez se siembran las fechas de ejemplo.
 *
 *   Cada mes abre como las cartas: pulsar cualquier parte del
 *   mes abre "//// MES ///" con el mes en grande y la lista de
 *   fechas con su explicación. Se cierra con ✕, Escape o afuera.
 *
 * ¿Cómo funciona?
 *   - La semana empieza en lunes (L M X J V S D).
 *   - El día de hoy conserva un anillo dorado discreto.
 *   - Rejilla adaptativa: 2 columnas en móvil, 4 en escritorio.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/ (proveedor de fechas + seed)
 *   - src/data/specialDates.ts (fechas de ejemplo)
 *   - src/lib/audio/chime.ts y src/lib/toast.ts
 */

"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { CalendarHeart, ChevronDown, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SPECIAL_DATES } from "@/data/specialDates";
import { data } from "@/lib/data";
import type { SpecialDate } from "@/lib/data/types";
import { playChime } from "@/lib/audio/chime";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";

const YEAR = 2026;

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

const posterVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/** Cuántos días tiene un mes (en 2026, sin bisiesto). */
function daysInMonth(monthIndex: number): number {
  return new Date(YEAR, monthIndex + 1, 0).getDate();
}

/** Días "fantasma" antes del 1 del mes (la semana empieza en lunes). */
function leadingBlanks(monthIndex: number): number {
  return (new Date(YEAR, monthIndex, 1).getDay() + 6) % 7;
}

/** Fechas especiales que caen en un mes dado (índice 0-11). */
function datesInMonth(dates: SpecialDate[], monthIndex: number): SpecialDate[] {
  return dates
    .filter((item) => Number(item.date.split("-")[0]) === monthIndex + 1)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Corazón rojo con el día adentro (SVG). */
function HeartDay({
  day,
  className = "size-4 sm:size-5",
  fontSize = 8,
}: {
  day: number;
  className?: string;
  fontSize?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
    >
      <svg viewBox="0 0 24 24" className="size-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#f43f5e"
        />
        <text
          x="12"
          y={11.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="800"
          fill="white"
        >
          {day}
        </text>
      </svg>
    </span>
  );
}

/** Cuadrícula de días de un mes (tamaño compacto o grande). */
function MonthDaysGrid({
  monthIndex,
  dates,
  big = false,
}: {
  monthIndex: number;
  dates: SpecialDate[];
  big?: boolean;
}) {
  const today = new Date();
  const monthDates = datesInMonth(dates, monthIndex);
  const totalDays = daysInMonth(monthIndex);
  const blanks = leadingBlanks(monthIndex);

  const weekdayClass = big
    ? "text-[9px] uppercase tracking-wider text-starlight/40 sm:text-[10px]"
    : "text-[7px] uppercase tracking-wider text-starlight/35 sm:text-[8px]";
  const dayClass = big
    ? "text-xs font-medium tabular-nums sm:text-sm"
    : "text-[7px] tabular-nums sm:text-[9px]";

  return (
    <>
      <div className={cn("grid grid-cols-7 text-center", weekdayClass)}>
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 text-center sm:mt-1.5">
        {Array.from({ length: blanks }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: totalDays }).map((_, index) => {
          const day = index + 1;
          const dayDates = monthDates.filter(
            (item) => Number(item.date.split("-")[1]) === day,
          );
          const isToday =
            today.getFullYear() === YEAR &&
            today.getMonth() === monthIndex &&
            today.getDate() === day;

          return (
            <span
              key={day}
              title={
                dayDates.length > 0
                  ? dayDates.map((item) => item.title).join(" · ")
                  : undefined
              }
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-full transition-colors",
                dayClass,
                dayDates.length > 0 ? "text-starlight" : "text-starlight/40",
                isToday && "bg-gold-glow/10 ring-1 ring-gold-glow/60",
              )}
            >
              {dayDates.length > 0 ? (
                <HeartDay
                  day={day}
                  className={big ? "size-5 sm:size-6" : "size-3 sm:size-3.5"}
                  fontSize={big ? 9 : 7.5}
                />
              ) : (
                day
              )}
            </span>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* COMPOSITOR — AGREGAR UNA FECHA                                      */
/* ------------------------------------------------------------------ */

const LIMITS = {
  title: 40,
  description: 200,
} as const;

function DateComposer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (date: SpecialDate) => void;
}) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("💗");
  const [fullDate, setFullDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave =
    !saving &&
    title.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(fullDate);

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
      const created = await data.addSpecialDate({
        date: fullDate.slice(5), // "YYYY-MM-DD" -> "MM-DD" (se repite cada año)
        title: title.trim(),
        emoji,
        description: description.trim() || undefined,
      });
      playChime(false);
      showToast("Fecha agregada", `"${created.title}" ya tiene su día en el calendario.`);
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
      aria-label="Agregar una fecha"
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
            <CalendarHeart className="size-3.5" />
            Agregar fecha
          </span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-primary sm:text-3xl">
            Un día solo nuestro
          </h2>
          <p className="mt-2 text-sm text-starlight/75">
            Cada año se repite: en el póster aparecerá con un corazón y, al
            abrir el mes, con su explicación.
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
              placeholder="Ej: El día que fuimos al mar…"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Emoji
              </span>
              <input
                type="text"
                value={emoji}
                maxLength={8}
                onChange={(event) => setEmoji(event.target.value.trim() || "💗")}
                disabled={saving}
                className={cn(
                  "h-11 rounded-xl border border-white/10 bg-night-800/60 px-4 text-center text-xl",
                  "outline-none transition-colors focus:border-blush-glow/60",
                )}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
                Día
              </span>
              <input
                type="date"
                value={fullDate}
                onChange={(event) => setFullDate(event.target.value)}
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
              Por qué se celebra (opcional)
            </span>
            <textarea
              value={description}
              maxLength={LIMITS.description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder={"Ese día…\n\nPor eso es solo nuestro."}
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
                  <Plus className="size-4" />
                  Guardar fecha
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
/* MENÚ DEL MES — PANTALLA COMPLETA                                    */
/* ------------------------------------------------------------------ */

function MonthModal({
  monthIndex,
  dates,
  onClose,
  onDelete,
}: {
  monthIndex: number;
  dates: SpecialDate[];
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const monthName = MONTHS[monthIndex];
  const monthDates = datesInMonth(dates, monthIndex);

  // Carrillón + bloqueo de scroll + pausa del fondo + cerrar con Escape.
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
      aria-label={`Mes de ${monthName}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/95 p-4"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar mes"
        className={cn(
          "absolute right-4 top-4 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full",
          "glass text-starlight transition-all duration-300 hover:scale-105 hover:border-pink-glow/40 hover:text-primary active:scale-95",
        )}
      >
        <X className="size-5" />
      </button>

      {/* Mes */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-night-900/95 px-6 py-8 text-center sm:px-10"
      >
        <p className="font-display text-2xl font-bold uppercase tracking-wide text-primary sm:text-3xl">
          <span className="mr-3 select-none text-blush-glow/40">{"////"}</span>
          {monthName}
          <span className="ml-3 select-none text-blush-glow/40">{"///"}</span>
        </p>

        {/* El mes en grande, con corazones en las fechas */}
        <div className="mx-auto mt-6 w-full max-w-sm">
          <MonthDaysGrid monthIndex={monthIndex} dates={dates} big />
        </div>

        {/* Explicación de cada fecha especial */}
        <div className="mx-auto mt-7 w-full max-w-md border-t border-white/10 pt-5 text-left">
          <ul className="divide-y divide-white/5">
            {monthDates.length > 0 ? (
              monthDates.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 py-3.5 first:pt-0"
                >
                  <HeartDay
                    day={Number(item.date.split("-")[1])}
                    className="mt-0.5 size-6"
                    fontSize={10}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary">
                      {item.emoji} {item.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-starlight/75">
                      {item.description ?? "Un día para celebrarnos."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Borrar fecha: ${item.title}`}
                    className="mt-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-starlight/40 transition-all duration-300 hover:text-red-300 active:scale-90"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm italic text-starlight/40">
                Este mes no tiene fechas marcadas todavía.
              </li>
            )}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PÓSTER                                                              */
/* ------------------------------------------------------------------ */

export function CalendarPoster() {
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);

  // Carga las fechas; la primera vez siembra las de ejemplo.
  useEffect(() => {
    let active = true;
    const run = async () => {
      let list: SpecialDate[] = [];
      try {
        list = await data.getSpecialDates();
      } catch (error) {
        console.error(error);
      }
      if (!active) return;
      if (list.length === 0) {
        try {
          await Promise.all(
            SPECIAL_DATES.map((item) =>
              data.addSpecialDate({
                date: item.date,
                title: item.title,
                emoji: item.emoji,
                description: item.description,
              }),
            ),
          );
          list = await data.getSpecialDates();
        } catch (error) {
          console.error(error);
          showToast(
            "Supabase",
            "Ejecuta docs/supabase-schema.sql en el SQL Editor.",
          );
        }
      }
      if (active) setDates(list);
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  // Carga las 3 fotos de pareja (slots 1 a 3 de la nube).
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [savingPhoto, setSavingPhoto] = useState<number | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoSlot = useRef<number>(1);

  useEffect(() => {
    let active = true;
    data
      .getCalendarPhotos()
      .then((items) => {
        if (!active) return;
        const next: (string | null)[] = [null, null, null];
        for (const item of items) {
          if (item.slot >= 1 && item.slot <= 3) next[item.slot - 1] = item.url;
        }
        setPhotos(next);
      })
      .catch((error) => console.error(error));
    return () => {
      active = false;
    };
  }, []);

  // Pide una foto para el slot dado.
  const handlePhotoClick = useCallback((slot: number) => {
    photoSlot.current = slot;
    photoInput.current?.click();
  }, []);

  const handlePhotoPick = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const slot = photoSlot.current;
      setSavingPhoto(slot);
      try {
        const saved = await data.saveCalendarPhoto(slot, file);
        setPhotos((previous) => {
          const next = [...previous];
          next[slot - 1] = saved.url;
          return next;
        });
        playChime(false);
        showToast("Foto actualizada", `La foto ${slot} del póster cambió.`);
      } catch (error) {
        console.error(error);
        showToast(
          error instanceof Error && error.message.startsWith("Supabase:")
            ? "Supabase"
            : "No se pudo subir",
          error instanceof Error ? error.message : "Inténtalo de nuevo en un momento.",
        );
      } finally {
        setSavingPhoto(null);
      }
    },
    [],
  );

  const handleCreated = useCallback((date: SpecialDate) => {
    setComposing(false);
    setDates((previous) => [date, ...previous]);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const target = dates.find((item) => item.id === id);
      void data.deleteSpecialDate(id).catch(() => {
        showToast("No se pudo borrar", "Inténtalo de nuevo en un momento.");
      });
      setDates((previous) => previous.filter((item) => item.id !== id));
      if (target) {
        playChime(true);
        showToast("Fecha borrada", `"${target.title}" ya no está en el calendario.`);
      }
    },
    [dates],
  );

  return (
    <section
      data-calendar-poster
      aria-label="Póster del calendario 2026"
      className="relative mx-auto flex w-full max-w-[48.875rem] flex-1 flex-col justify-center px-4 pb-10 pt-[14vh] sm:px-6"
    >
      <motion.div
        variants={posterVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-night-950/60 px-3 pb-6 pt-6 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5 sm:pb-7 sm:pt-7">
          {/* Resplandor suave superior */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(219,180,166,0.12),transparent_65%)]"
          />

          {/* Agregar fecha */}
          <button
            type="button"
            onClick={() => setComposing(true)}
            className={cn(
              "absolute right-3 top-3 z-10 inline-flex h-7 cursor-pointer items-center gap-1 rounded-full",
              "border border-white/10 bg-white/[0.04] px-3 text-[10px] font-medium text-starlight/80 backdrop-blur",
              "transition-all duration-300 hover:border-blush-glow/40 hover:text-primary active:scale-95 sm:right-4 sm:top-4",
            )}
          >
            <Plus className="size-3" />
            Agregar fecha
          </button>

          {/* ----- Encabezado del póster ----- */}
          <header className="relative text-center">
            <motion.h1
              variants={itemVariants}
              className="font-display text-3xl font-bold leading-none tracking-tight text-primary sm:text-4xl"
            >
              <span className="text-gradient">{YEAR}</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-1.5 max-w-md font-display text-[11px] italic text-blush-glow/90 sm:text-xs"
            >
              for love of cesar y sofy
            </motion.p>
            <motion.div
              variants={itemVariants}
              aria-hidden
              className="mx-auto mt-3 h-px w-28 bg-gradient-to-r from-transparent via-blush-glow/50 to-transparent"
            />
          </header>

          {/* ----- 3 fotos de pareja (se cambian desde la página) ----- */}
          <motion.div
            variants={itemVariants}
            aria-label="Fotos de la pareja"
            className="mt-5 flex items-end justify-center gap-2"
          >
            {[1, 2, 3].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handlePhotoClick(slot)}
                disabled={savingPhoto !== null}
                title="Cambiar esta foto"
                className={cn(
                  "group relative flex aspect-[3/4] w-7 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border transition-colors sm:w-9",
                  photos[slot - 1]
                    ? "border-white/15"
                    : "border-dashed border-white/15 bg-white/[0.04] hover:border-blush-glow/50",
                  slot === 2 && "sm:w-10",
                  savingPhoto === slot && "animate-pulse",
                )}
              >
                {photos[slot - 1] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photos[slot - 1] ?? undefined}
                      alt={`Foto ${slot} del póster`}
                      className="size-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-night-950/60 text-starlight opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <ImagePlus className="size-3" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-starlight/30">
                      <ImagePlus className="size-3" />
                    </span>
                    <span className="mt-0.5 text-[6px] text-starlight/30">
                      Foto {slot}
                    </span>
                  </>
                )}
              </button>
            ))}
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoPick}
            />
          </motion.div>

          {/* ----- Rejilla de meses: 2 columnas en móvil, 4×3 en escritorio ----- */}
          <motion.div
            variants={itemVariants}
            className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-6"
          >
            {MONTHS.map((monthName, monthIndex) => {
              const open = openMonth === monthIndex;

              return (
                <div
                  key={monthName}
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  onClick={() => setOpenMonth(monthIndex)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpenMonth(monthIndex);
                    }
                  }}
                  className="group cursor-pointer text-center"
                >
                  {/* Nombre y flecha del mes */}
                  <span className="inline-flex items-center gap-1">
                    <span className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors group-hover:text-blush-glow sm:text-[11px]">
                      {monthName}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-3 text-starlight/40 transition-transform duration-300 group-hover:text-blush-glow",
                        open && "rotate-180 text-blush-glow",
                      )}
                    />
                  </span>

                  {/* Vista compacta */}
                  <div className="mt-2">
                    <MonthDaysGrid monthIndex={monthIndex} dates={dates} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* Menú del mes a pantalla completa */}
      <AnimatePresence>
        {openMonth !== null && (
          <MonthModal
            monthIndex={openMonth}
            dates={dates}
            onClose={() => setOpenMonth(null)}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* Agregar fecha */}
      {composing && (
        <DateComposer onClose={() => setComposing(false)} onCreated={handleCreated} />
      )}
    </section>
  );
}