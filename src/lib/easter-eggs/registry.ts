/**
 * ============================================================
 * EASTER EGGS — REGISTRO CENTRAL
 * ============================================================
 *
 * ¿Qué hace?
 *   Es el "libro maestro" de todos los secretos de la app.
 *   Aquí se agregan los easter eggs creados en cada fase.
 *
 * ¿Cómo funciona?
 *   1. Importa el tipo EasterEgg desde ./types.
 *   2. Registra tu secreto con registerEasterEgg().
 *   3. La capa EasterEggLayer lo detecta y lo activa.
 *
 * ¿Dónde modificarlo?
 *   Al final de este archivo, con registerEasterEgg({...}).
 *   NUNCA borres un secreto existente: usa el campo
 *   `enabled` (ver más abajo) para desactivarlo.
 *
 * ¿Qué archivos utiliza?
 *   - ./types.ts (definiciones)
 *   - src/components/easter-eggs/EasterEggLayer.tsx (ejecución)
 *
 * ⚠️ Objetivo: acumular 30+ secretos repartidos por toda la app.
 */

import type { EasterEgg } from "./types";

/** Lista interna de secretos registrados. */
const registry = new Map<string, EasterEgg>();

/**
 * Registra un nuevo easter egg en la aplicación.
 * @param egg Secreto que cumple la interfaz EasterEgg.
 */
export function registerEasterEgg(egg: EasterEgg): void {
  registry.set(egg.id, egg);
}

/** Devuelve todos los secretos activos (sin los desactivados). */
export function getAllEasterEggs(): EasterEgg[] {
  return Array.from(registry.values());
}

/** Busca un secreto por su id. */
export function getEasterEgg(id: string): EasterEgg | undefined {
  return registry.get(id);
}

/**
 * Desactiva un secreto sin eliminarlo del código.
 * Útil para desactivar temporalmente uno problemático.
 */
export function disableEasterEgg(id: string): void {
  const egg = registry.get(id);
  if (egg) {
    registry.set(id, { ...egg, repeatable: false });
  }
}

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 2 (diseño)
 * ============================================================ */

registerEasterEgg({
  id: "luna-mensaje",
  name: "La luna habla",
  trigger: { type: "click", selector: "[data-easter-moon]" },
  action: {
    type: "message",
    text: "Si la luna pudiera hablar, diría tu nombre en voz baja.",
  },
  createdInPhase: 2,
});

registerEasterEgg({
  id: "palabra-amor",
  name: "La palabra más linda",
  trigger: { type: "keys", combo: ["a", "m", "o", "r"] },
  action: {
    type: "message",
    text: "Esa es la palabra más linda del universo.",
  },
  createdInPhase: 2,
});

registerEasterEgg({
  id: "gratitud-tiempo",
  name: "Gracias por quedarte",
  trigger: { type: "time", delayMs: 30_000 },
  action: {
    type: "message",
    text: "Llevas aquí un rato... me gusta que existas en mi universo.",
  },
  createdInPhase: 2,
});

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 3 (Nuestra Historia)
 * ============================================================ */

registerEasterEgg({
  id: "estrella-rayo",
  name: "La estrella de Rayo",
  trigger: { type: "click", selector: '[data-pet-star="rayo"]' },
  action: {
    type: "message",
    text: "Rayo guarda los días de juegos y ladridos de felicidad.",
  },
  createdInPhase: 3,
});

registerEasterEgg({
  id: "estrella-night",
  name: "La estrella de Night",
  trigger: { type: "click", selector: '[data-pet-star="night"]' },
  action: {
    type: "message",
    text: "Night vigila las noches tranquilas y las cobijas calientitas.",
  },
  createdInPhase: 3,
});

registerEasterEgg({
  id: "estrella-apio",
  name: "La estrella de Apio",
  trigger: { type: "click", selector: '[data-pet-star="apio"]' },
  action: {
    type: "message",
    text: "Apio ronronea para recordarnos que la paz siempre está cerca.",
  },
  createdInPhase: 3,
});

registerEasterEgg({
  id: "estrella-shelby",
  name: "La estrella de Shelby",
  trigger: { type: "click", selector: '[data-pet-star="shelby"]' },
  action: {
    type: "message",
    text: "Shelby brilla con la alegría de las tardes en familia.",
  },
  createdInPhase: 3,
});

registerEasterEgg({
  id: "sello-del-libro",
  name: "Un capítulo por descubrir",
  trigger: { type: "click", selector: "[data-chapter-start]" },
  action: {
    type: "message",
    text: "Nuestra historia siempre tendrá un capítulo más por escribir.",
  },
  createdInPhase: 3,
});

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 4 (Recuerdos)
 * ============================================================ */

registerEasterEgg({
  id: "galeria-guardiana",
  name: "La guardiana de la galería",
  trigger: { type: "click", selector: "[data-memory-gallery]" },
  action: {
    type: "message",
    text: "Esta galería guarda cada momento como quien guarda tesoros.",
  },
  createdInPhase: 4,
});

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 5 (Nube de Recuerdos)
 * ============================================================ */

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 6 (Minijuegos)
 * ============================================================ */

registerEasterEgg({
  id: "juegos-recuerdos",
  name: "Los juegos también recuerdan",
  trigger: { type: "click", selector: "[data-games-hub]" },
  action: {
    type: "message",
    text: "Cada juego esconde un trocito de nuestra historia.",
  },
  createdInPhase: 6,
});

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 7 (Cartas)
 * ============================================================ */

registerEasterEgg({
  id: "cartas-corazon",
  name: "El corazón de las cartas",
  trigger: { type: "click", selector: "[data-letters-gallery]" },
  action: {
    type: "message",
    text: "Cada carta abre una ventana al corazón de quien la escribió.",
  },
  createdInPhase: 7,
});

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 8–14 (Regalos, Jardín, Música,
 * Calendario, Logros, Cápsulas y Secretos)
 * ============================================================ */

registerEasterEgg({
  id: "regalos-tesoro",
  name: "El tesoro de los regalos",
  trigger: { type: "click", selector: "[data-gifts-gallery]" },
  action: {
    type: "message",
    text: "Lo que más vale no se envuelve: se recuerda al abrirlo.",
  },
  createdInPhase: 8,
});

registerEasterEgg({
  id: "musica-cancion",
  name: "La canción que no está",
  trigger: { type: "click", selector: "[data-songs-list]" },
  action: {
    type: "message",
    text: "Hay una canción que no está en la lista: la que suena en mi cabeza cuando pienso en ti.",
  },
  createdInPhase: 10,
});

registerEasterEgg({
  id: "calendario-fecha",
  name: "Una fecha más",
  trigger: { type: "click", selector: "[data-calendar-poster]" },
  action: {
    type: "message",
    text: "La fecha más importante no está aquí: es la que tú quieras que sea.",
  },
  createdInPhase: 11,
});

registerEasterEgg({
  id: "logros-medalla",
  name: "La medalla invisible",
  trigger: { type: "click", selector: "[data-logros-gallery]" },
  action: {
    type: "message",
    text: "El mayor logro de todos no se muestra aquí: es habernos encontrado.",
  },
  createdInPhase: 12,
});

registerEasterEgg({
  id: "capsulas-tiempo",
  name: "El tiempo viaja doble",
  trigger: { type: "click", selector: "[data-capsules-gallery]" },
  action: {
    type: "message",
    text: "Las cápsulas guardan palabras; nosotros, la prisa por leerlas.",
  },
  createdInPhase: 13,
});

registerEasterEgg({
  id: "secretos-final",
  name: "El último secreto",
  trigger: { type: "click", selector: "[data-secrets-gallery]" },
  action: {
    type: "message",
    text: "El secreto más guardado: nunca dejes de decir lo que sientes.",
  },
  createdInPhase: 14,
});

/* ============================================================
 * SECRETOS REGISTRADOS — FASE 15 (Galería de recuerdos y más)
 * ============================================================ */

registerEasterEgg({
  id: "recuerdos-subida",
  name: "El cofre de la galería",
  trigger: { type: "click", selector: "[data-recuerdo-composer]" },
  action: {
    type: "message",
    text: "Cada foto que subimos hace más grande nuestro cofre de memorias.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "palabra-te-amo",
  name: "La palabra completa",
  trigger: { type: "keys", combo: ["t", "e", "a", "m", "o"] },
  action: {
    type: "message",
    text: "Te amo: con eso basta para explicar el universo completo.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "beso-guardado",
  name: "Un beso en el código",
  trigger: { type: "keys", combo: ["b", "e", "s", "o"] },
  action: {
    type: "message",
    text: "Hay un beso guardado entre cada línea de este proyecto.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "tres-seis-cinco",
  name: "Los días del año",
  trigger: { type: "keys", combo: ["3", "6", "5"] },
  action: {
    type: "message",
    text: "Los 365 días del año caben en una sola sonrisa tuya.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "cielo-compartido",
  name: "El mismo cielo",
  trigger: { type: "keys", combo: ["c", "i", "e", "l", "o"] },
  action: {
    type: "message",
    text: "Aunque miremos desde lejos, siempre es el mismo cielo.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "minuto-juntos",
  name: "Un minuto contigo",
  trigger: { type: "time", delayMs: 60_000 },
  action: {
    type: "message",
    text: "Un minuto a tu lado vale más que mil horas en cualquier otro lugar.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "otro-ratito",
  name: "Quédate un ratito más",
  trigger: { type: "time", delayMs: 120_000 },
  action: {
    type: "message",
    text: "¿Dos minutos ya? Quédate un ratito más, nunca sobras.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "scroll-profundo",
  name: "El fondo de la página",
  trigger: { type: "scroll", thresholdPx: 2500 },
  action: {
    type: "message",
    text: "Llegaste hasta el fondo: nuestro amor también llega ahí y más lejos.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "san-valentin",
  name: "Día de San Valentín",
  trigger: { type: "date", month: 2, day: 14 },
  action: {
    type: "message",
    text: "Hoy San Valentín, pero para nosotros cada día lo es.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "diciembre-25",
  name: "El día más brillante",
  trigger: { type: "date", month: 12, day: 25 },
  action: {
    type: "message",
    text: "Nuestro aniversario: el día en que el universo se puso de acuerdo.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "cortina-recuerdos",
  name: "La cortina de la galería",
  trigger: { type: "hover", selector: "[data-memory-gallery]" },
  action: {
    type: "message",
    text: "Detente un segundo: este momento también quedará en la galería.",
  },
  createdInPhase: 15,
});

registerEasterEgg({
  id: "palabra-secreto",
  name: "La palabra secreta",
  trigger: { type: "keys", combo: ["s", "e", "c", "r", "e", "t", "o"] },
  action: {
    type: "message",
    text: "La palabra más importante no se escribe: se siente a diario.",
  },
  createdInPhase: 15,
});

/* ============================================================
 * AQUÍ SE REGISTRAN LOS SECRETOS (fase por fase)
 * Ejemplo:
 *
 * registerEasterEgg({
 *   id: "mensaje-secreto-2",
 *   name: "Mensaje oculto en el inicio",
 *   trigger: { type: "click", selector: "#logo-secreto" },
 *   action: { type: "message", text: "Te amo más que ayer." },
 *   createdInPhase: 3,
 * });
 * ============================================================ */
