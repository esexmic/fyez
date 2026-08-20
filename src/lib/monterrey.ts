/**
 * ============================================================
 * TIEMPO DE MONTERREY (UTC-6 fijo, sin horario de verano)
 * ============================================================
 *
 * ¿Qué hace?
 *   Todas las horas de la app (fecha límite de logros, hora en
 *   que se completó un logro) viven en la zona de Monterrey,
 *   Nuevo León: Zona Centro de México, UTC-6 (CST). México
 *   abolió el horario de verano, así que el desfase nunca cambia.
 *
 * ¿Cómo funciona?
 *   - El navegador puede estar en cualquier zona: aquí se pide
 *     a Intl que calcule siempre con America/Monterrey.
 *   - Formato interno: "YYYY-MM-DDTHH:mm" (hora de pared de
 *     Monterrey). Para guardar un momento real en la nube se
 *     convierte a ISO (UTC) con monterreyWallToISO.
 */

const MONTERREY_TZ = "America/Monterrey";
/** Desfase de Monterrey: UTC-6 (fijo, sin horario de verano). */
const OFFSET_HOURS = 6;

/** "YYYY-MM-DDTHH:mm" actual en Monterrey. */
export function monterreyNow(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MONTERREY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Fecha de hoy en Monterrey ("YYYY-MM-DD"). */
export function monterreyToday(): string {
  return monterreyNow().slice(0, 10);
}

/**
 * Convierte una hora de pared de Monterrey ("YYYY-MM-DDTHH:mm")
 * a un instante ISO (UTC) real, para guardarlo en la nube.
 */
export function monterreyWallToISO(wall: string): string {
  const [date, time] = wall.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  // En Monterrey es 6 horas antes que UTC: se suman para obtener el instante.
  return new Date(Date.UTC(year, month - 1, day, hours + OFFSET_HOURS, minutes)).toISOString();
}

/**
 * ¿El logro ya venció? Acepta "YYYY-MM-DD" (vence a las 23:59 de
 * ese día) o "YYYY-MM-DDTHH:mm".
 */
export function isDeadlinePassed(deadline: string, now = monterreyNow()): boolean {
  const effective = /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? `${deadline}T23:59` : deadline;
  return effective < now;
}

/** "18 de agosto de 2026 · 9:00 p. m." (o solo la fecha si no hay hora). */
export function formatDeadline(deadline: string): string {
  const hasTime = deadline.includes("T");
  const dateText = formatInMonterrey(deadline.includes("T") ? deadline : `${deadline}T12:00`, false);
  if (!hasTime) return dateText;
  const [, time] = deadline.split("T");
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw) % 24;
  const suffix = hours >= 12 ? "p. m." : "a. m.";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${dateText} · ${display}:${minutes} ${suffix}`;
}

/** "18 de agosto de 2026" o "18 de agosto de 2026, 9:00 p. m." (zona Monterrey). */
export function formatInMonterrey(iso: string, withTime = true): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      timeZone: MONTERREY_TZ,
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(withTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Versión compacta de una fecha límite: "18 ago 2026 · 9:00 p. m.". */
export function formatDeadlineCompact(deadline: string): string {
  const hasTime = deadline.includes("T");
  const dateText = hasTime ? deadline.slice(0, 10) : deadline;
  const [year, month, day] = dateText.split("-").map(Number);
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const text = `${day} ${months[(month - 1) % 12]} ${year}`;
  if (!hasTime) return text;
  const [, time] = deadline.split("T");
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw) % 24;
  const suffix = hours >= 12 ? "p. m." : "a. m.";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${text} · ${display}:${minutes} ${suffix}`;
}