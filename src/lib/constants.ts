/**
 * ============================================================
 * CONSTANTES GLOBALES
 * ============================================================
 *
 * ¿Qué hace?
 *   Valores fijos compartidos por toda la aplicación
 *   (rutas, eventos, duraciones).
 *
 * ¿Cómo funciona?
 *   Se importan donde se necesiten. Centralizar evita
 *   números mágicos repetidos en los componentes.
 *
 * ¿Dónde modificarlo?
 *   Edita los valores aquí. Solo afecta a una fuente.
 *
 * ¿Qué archivos utiliza?
 *   - Todos los que importen estos valores.
 */

/** Rutas internas de la aplicación. */
export const ROUTES = {
  home: "/",
  historia: "/historia",
  recuerdos: "/recuerdos",
  juegos: "/juegos",
  cartas: "/cartas",
  regalos: "/regalos",
} as const;

/** Duración de transiciones y animaciones base (ms). */
export const DURATIONS = {
  quick: 200,
  base: 300,
  slow: 600,
} as const;
