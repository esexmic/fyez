/**
 * ============================================================
 * FECHAS ESPECIALES — CUMPLEAÑOS Y ANIVERSARIO
 * ============================================================
 *
 * ¿Qué hace?
 *   Detecta si hoy es un día importante: cumpleaños de Sofía,
 *   cumpleaños de César o nuestro aniversario.
 *
 * ¿Cómo funciona?
 *   Compara la fecha de hoy con BIRTHDAYS y COUPLE.anniversary
 *   (src/data/config.ts). En esos días:
 *   - El hero muestra un saludo especial.
 *   - El cielo hace una lluvia de estrellas (ParticleCanvas).
 *
 * ¿Dónde modificarlo?
 *   - Fechas: src/data/config.ts
 *   - Mensajes: este archivo.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/home/Hero.tsx (banner especial)
 *   - src/components/background/ParticleCanvas.tsx (lluvia de estrellas)
 */

import { BIRTHDAYS, COUPLE } from "@/data/config";

export type SpecialDay =
  | "sofia-birthday"
  | "cesar-birthday"
  | "anniversary"
  | null;

export interface SpecialDayInfo {
  key: Exclude<SpecialDay, null>;
  message: string;
}

/** ¿Hoy es un día especial? */
export function getSpecialDay(now: Date = new Date()): SpecialDayInfo | null {
  const month = now.getMonth();
  const day = now.getDate();

  if (month === BIRTHDAYS.sofia.month && day === BIRTHDAYS.sofia.day) {
    return {
      key: "sofia-birthday",
      message: "Hoy es el cumpleaños de Sofía: el cielo lo celebra con una lluvia de estrellas.",
    };
  }
  if (month === BIRTHDAYS.cesar.month && day === BIRTHDAYS.cesar.day) {
    return {
      key: "cesar-birthday",
      message: "Hoy es el cumpleaños de César: el cielo se llena de destellos por él.",
    };
  }
  if (
    month === COUPLE.anniversary.getMonth() &&
    day === COUPLE.anniversary.getDate()
  ) {
    return {
      key: "anniversary",
      message: "Hoy celebramos otro aniversario de nuestro comienzo.",
    };
  }
  return null;
}

/** Multiplicador de estrellas fugaces para el día de hoy. */
export function getShootingStarRate(now: Date = new Date()): number {
  const special = getSpecialDay(now);
  if (special?.key === "sofia-birthday" || special?.key === "cesar-birthday") {
    return 7;
  }
  if (special?.key === "anniversary") return 3;
  return 1;
}
