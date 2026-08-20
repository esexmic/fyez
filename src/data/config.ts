/**
 * ============================================================
 * CONFIGURACIÓN CENTRAL — NUESTRA HISTORIA REAL
 * ============================================================
 *
 * ¿Qué hace?
 *   Todos los datos personales del proyecto viven aquí: nombres,
 *   aniversario, cumpleaños y mascotas. Nada se escribe "a mano"
 *   en otros archivos.
 *
 * ¿Dónde modificarlo?
 *   Cambia los valores aquí y se reflejan en toda la app.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/dates.ts (fechas especiales)
 *   - src/components/layout/Footer.tsx (nombres)
 *   - src/components/home/Hero.tsx (contador y dedicatoria)
 *   - src/components/background/PetStars.tsx (estrellas de mascotas)
 */

export const COUPLE = {
  /** Nombres completos. */
  person1: "César Jaime Rendón",
  person2: "Sofía Julieta Gaytán",

  /** Cómo los llamamos en la app (cariñosos y cortos). */
  nickname1: "César",
  nickname2: "Sofía",

  /** Nuestra historia comenzó el 25 de diciembre de 2025. */
  anniversary: new Date(2025, 11, 25),

  /** Idioma de las fechas visibles. */
  locale: "es-ES",
} as const;

/** Cumpleaños (mes 0-11, día 1-31). */
export const BIRTHDAYS = {
  sofia: { month: 7, day: 22 }, // 22 de agosto
  cesar: { month: 0, day: 31 }, // 31 de enero
} as const;

/** Mascotas que forman parte de nuestra historia. */
export const PETS = [
  { id: "rayo", name: "Rayo", kind: "dog" },
  { id: "night", name: "Night", kind: "cat" },
  { id: "apio", name: "Apio", kind: "cat" },
  { id: "shelby", name: "Shelby", kind: "cat" },
] as const;

/** Datos de la aplicación. */
export const APP = {
  name: "Nuestro Universo",
  description:
    "El refugio donde vive nuestra historia: recuerdos, cartas, juegos y estrellas que encendemos juntos.",
} as const;

/** Preferencias de experiencia. */
export const EXPERIENCE = {
  /** Duración base (ms) de las transiciones suaves. */
  baseTransitionMs: 300,
  /** ¿Reproducir música automáticamente? (futuras fases). */
  autoplayMusic: false,
} as const;
