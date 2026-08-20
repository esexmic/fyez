/**
 * ============================================================
 * EASTER EGGS — TIPOS Y CONTRATO
 * ============================================================
 *
 * ¿Qué hace?
 *   Define la estructura que debe tener cada secreto
 *   (easter egg) de la aplicación.
 *
 * ¿Cómo funciona?
 *   Cada secreto se registra en src/lib/easter-eggs/registry.ts
 *   cumpliendo esta interfaz. La capa de ejecución
 *   (EasterEggLayer) se encarga de activarlos.
 *
 * ¿Dónde modificarlo?
 *   Normalmente NO se modifica: se crean nuevos objetos
 *   EasterEgg. Solo se toca si se necesita un tipo nuevo
 *   de disparador.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/easter-eggs/registry.ts
 *   - src/components/easter-eggs/EasterEggLayer.tsx
 */

/** Cómo se activa el secreto. */
export type EasterEggTrigger =
  /** Clic en un área específica de la página. */
  | { type: "click"; selector: string }
  /** Combinación de teclas (ej: ["ArrowUp","ArrowUp","ArrowDown"]). */
  | { type: "keys"; combo: string[] }
  /** Después de permanecer N milisegundos en la página. */
  | { type: "time"; delayMs: number }
  /** En fechas especiales (ej: cumpleaños, aniversario). */
  | { type: "date"; month: number; day: number }
  /** Al desplazarse a una posición de la página. */
  | { type: "scroll"; thresholdPx: number }
  /** Al pasar el cursor sobre un elemento. */
  | { type: "hover"; selector: string };

/** Qué hace el secreto cuando se activa. */
export type EasterEggAction =
  /** Muestra un mensaje oculto. */
  | { type: "message"; text: string }
  /** Activa una animación especial (definida en FASE 2+). */
  | { type: "animation"; name: string }
  /** Desbloquea un recuerdo oculto. */
  | { type: "unlock"; memoryId: string }
  /** Ejecuta una función personalizada (modo avanzado). */
  | { type: "custom"; handler: string };

/** Definición completa de un secreto. */
export interface EasterEgg {
  /** Identificador único (ej: "estrellas-ocultas"). */
  id: string;
  /** Nombre descriptivo para la documentación. */
  name: string;
  /** Cuándo se activa. */
  trigger: EasterEggTrigger;
  /** Qué ocurre al activarse. */
  action: EasterEggAction;
  /** ¿Puede repetirse varias veces? */
  repeatable?: boolean;
  /** Marcado en la fase en que se crea (para documentación). */
  createdInPhase?: number;
}
