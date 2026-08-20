/**
 * ============================================================
 * CARTAS — PALABRAS ESCRITAS PARA TI (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Las cartas de la sección "Cartas". Cada una es un mensaje
 *   escrito que se abre con la animación de un sobre y queda
 *   marcada como leída.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Las cartas de muestra se cargan la primera vez que se abre
 *   la app y luego viven en el almacenamiento del navegador
 *   (junto con las que se escriban desde la página). Para
 *   cambiar las de ejemplo:
 *     1. Edita los textos dentro de LETTERS.
 *     2. Separa los párrafos con UNA línea en blanco.
 *     3. createdAt es la fecha (ISO); la lista ordena de la
 *        más antigua a la más reciente.
 *   Si ya abriste la app antes, borra las cartas guardadas
 *   (DevTools > Application > Local Storage > nuestro-universo:db)
 *   o escribe cartas nuevas desde la página.
 *
 * ¿Cómo funciona?
 *   - id: identificador único de la carta.
 *   - title: el título que se lee en el sobre.
 *   - content: el texto completo (párrafos separados por
 *     líneas en blanco).
 *   - createdAt: fecha en formato ISO (ej: "2025-12-25T21:30:00").
 *   - read: por defecto false; el estado real se guarda en el
 *     proveedor de datos (src/lib/data/).
 *
 * ¿Dónde modificarlo?
 *   - Agrega, quita o edita objetos dentro de LETTERS.
 *   - Desde la página: botón "Escribir una carta".
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (tipo Letter)
 *   - src/lib/data/local-provider.ts (seed inicial + guardado)
 *   - src/components/cartas/LettersGallery.tsx
 *   - src/components/cartas/LetterReader.tsx
 *   - src/components/cartas/LetterComposer.tsx
 */

import type { Letter } from "@/lib/data/types";

export const LETTERS: Letter[] = [
  {
    id: "la-primera-navidad",
    title: "La primera Navidad",
    content:
      "Esa noche no sabíamos que estábamos empezando algo. Para nosotros era solo una fecha más en el calendario, y resultó ser el día en que todo comenzó a tener sentido.\n\nGracias por quedarte desde entonces. Hoy, cada Navidad me recuerda que lo mejor de mi vida empezó en una noche fría que por fin se sentía cálida.",
    createdAt: "2025-12-25T22:00:00.000Z",
    read: false,
    author: "Sofía",
  },
  {
    id: "quince-de-febrero",
    title: "Quince de febrero",
    content:
      "El día después de San Valentín también es nuestro: el día en que el 14 se queda corto para decir todo lo que siento.\n\nTe escribo esta carta para recordarte que no necesito un día marcado en el calendario para elegirte. Te elijo los otros 364 también, y los bisiestos también.",
    createdAt: "2026-02-15T20:00:00.000Z",
    read: false,
    author: "César",
  },
  {
    id: "dias-de-lluvia",
    title: "Los días de lluvia",
    content:
      "Hay días en los que la lluvia no deja salir, y me acuerdo de nosotros en casa: tú en una punta, yo en la otra, y el mundo entero en medio sin importar.\n\nEsos días no hicimos nada extraordinario, y aun así son de los que guardo como tesoros. Contigo, hasta el silencio se siente como una conversación.",
    createdAt: "2026-06-18T18:30:00.000Z",
    read: false,
    author: "César",
  },
  {
    id: "en-el-futuro",
    title: "Para cuando leas esto",
    content:
      "Esta carta viaja hacia adelante en el tiempo, a cualquier día en el que la abras. Quiero que sepas que, sin importar cuándo sea, lo que escribo aquí sigue siendo verdad:\n\nTe amo, te elijo y me alegro de que la vida me haya puesto enfrente a ti. Nuestro universo, con sus nubes, sus juegos y sus recuerdos, siempre será el mejor lugar que conozco.",
    createdAt: "2026-08-12T12:00:00.000Z",
    read: false,
    author: "Sofía",
  },
];

/** Cartas ordenadas de la más antigua a la más reciente. */
export const LETTERS_SORTED = [...LETTERS].sort((a, b) =>
  a.createdAt.localeCompare(b.createdAt),
);