/**
 * CÁPSULAS DEL TIEMPO — MENSAJES QUE VIAJAN AL FUTURO (FASE 13)
 *
 * ¿Qué hace?
 *   Cápsulas selladas que se abren cada una en su fecha:
 *   dentro guardan recuerdos y mensajes para el futuro.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Las cápsulas actuales son de muestra. Edítalas cuando
 *   quieras en este archivo.
 *
 * ¿Cómo funciona?
 *   - openDate: fecha ISO (año-mes-día) en la que la cápsula
 *     deja de estar sellada. Las abiertas dejan verse.
 */

export interface Capsule {
  id: string;
  title: string;
  emoji: string;
  /** Fecha ISO en la que se abre. */
  openDate: string;
  message: string;
  /** Pequeña pista de lo que guarda (visible mientras está sellada). */
  hint?: string;
}

export const CAPSULES: Capsule[] = [
  {
    id: "aniversario-1",
    title: "Nuestro primer aniversario",
    emoji: "💍",
    openDate: "2026-12-25",
    message:
      "¡Un año completando estrellas! Hoy celebramos el día en que el calendario dejó de ser solo fechas. Cierra los ojos y recuerda la primera vez que bailamos juntos.",
    hint: "Un año de cielos compartidos.",
  },
  {
    id: "navidad-2",
    title: "Dos Navidades juntos",
    emoji: "🎄",
    openDate: "2027-12-25",
    message:
      "Dos Navidades eligiéndonos. Sigue siendo cierto: lo mejor del regalo no es lo que hay dentro, sino con quién lo abres.",
    hint: "Dos árboles y la misma sonrisa.",
  },
  {
    id: "sueno-casa",
    title: "La casa soñada",
    emoji: "🏡",
    openDate: "2028-06-15",
    message:
      "¿Llegamos? Esta cápsula se abre el día en que la casa soñada sea nuestra. Si ya la tienes enfrente: bienvenido a casa, otra vez.",
    hint: "Donde duerman Rayo, Night, Apio y Shelby.",
  },
  {
    id: "miercoles-vez",
    title: "Recuerda este miércoles",
    emoji: "🌙",
    openDate: "2030-01-31",
    message:
      "Si hoy es tu cumpleaños: que este mensaje te recuerde cuánto se ha construido, cuántas flores han florecido y cuánto queda por sembrar.",
    hint: "El día que empieza otro año tuyo.",
  },
];