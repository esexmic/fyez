/**
 * ============================================================
 * CAPÍTULOS — EL LIBRO DE NUESTRA HISTORIA (FASE 3)
 * ============================================================
 *
 * ¿Qué hace?
 *   Los capítulos del libro interactivo. Cada capítulo vive
 *   bajo su propio cielo (atmosphere) que refuerza su emoción.
 *
 * ¿Cómo funciona?
 *   - Este archivo se lee para pintar la línea de tiempo.
 *   - Los capítulos se ordenan por fecha automáticamente.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Los textos actuales son de muestra para que veas el diseño.
 *   REEMPLÁZALOS por los reales cuando quieras. Solo edita
 *   este archivo; la interfaz no cambia.
 *
 * ¿Dónde modificarlo?
 *   - Agrega, quita o edita objetos dentro de CHAPTERS.
 *   - Cielos disponibles: src/data/atmospheres.ts.
 *     (atardecer, noche-tranquila, noche-magica, dia-calido,
 *     dia-nublado, primavera, otono, lluvia, amanecer)
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (tipo StoryChapter)
 *   - src/components/historia/HistoriaTimeline.tsx
 */

import type { StoryChapter } from "@/lib/data/types";

/** Frase final del capítulo (si no quieres una, déjala vacía). */

export const CHAPTERS: StoryChapter[] = [
  {
    id: "25 december-2025",
    author: "César",
    title: "the start",
    date: "2025-12-25",
    atmosphere: "amanecer",
    quote:
      "Desde entonces diciembre fue mi mes favorito",
    content: [
      "Nuestra historia empezó el 12 de diciembre, pero el 25 marqué la fecha en la que decidí que nuestro destino sería el mismo.",
      "El 12 de diciembre me querias comer😳",
    ].join("\n\n"),
  },
  {
    id: "Rayo",
    author: "César",
    title: "Rayo",
    date: "2026-01-29",
    atmosphere: "dia-calido",
    quote:
      "siempre me querias quitar la custodia cuando nos peleabamos",
    content: [
      "Fue el dia en el que llego nuestro segundo hijo Rayo Emanuel Gaytan Rendon",
      "era un bebe muyyy bonito",
    ].join("\n\n"),
  },
  {
    id: "my-birthday",
    author: "Sofía",
    title: "My birthday",
    date: "2026-01-31",
    atmosphere: "atardecer",
    quote:
      "fuiste de las pocas personas que me regalaron algo y por eso te amo",
    content: [
      "Aun recuerdo como desperte y encontre a mi hermana en la puerta del cuarto con el desayuno que me mandaste",
      "Me senti importante en tu vida y eso me hizo sentirme especial",
    ].join("\n\n"),
  },
  {
    id: "Sanvalentin",
    author: "César",
    title: "San valentin",
    date: "2026-02-14",
    atmosphere: "primavera",
    quote:
      "por cierto tu regalo aun sigue y esta en esta pagina https://ezfylove.netlify.app/",
    content: [
      "el 14 de febrero recuerdo como te hice tu regalo, te lo di y pasamos la mayor parte del tiempo juntos, como la buena pareja que somos.",
      "por cierto comimos lo mismo ese dia",
    ].join("\n\n"),
  },
  {       
    id: "ruptura",
    author: "César",
    title: "¿The end?",
    date: "2026-05-29",
    atmosphere: "lluvia",
    quote:
      "Siempre nos amamos pero nunca nos entendimos",
    content: [
      "en este momento nuestros caminos habian tomado rumbos diferentes y por alguna u otra razon ¿terminamos?",
      "hasta este punto tu no sabias nada de mi, ni yo de ti, no quedaban rastros de nosotros dos juntos, ni parecia que en algun momento fuimos una pareja tan unida.",
    ].join("\n\n"),
  },
  {       
    id: "vuelta",
    author: "César",
    title: "¿We're back?",
    date: "2026-07-26",
    atmosphere: "amanecer",
    quote:
      "un amor se aproxima de vuelta",
    content: [
      "En esta fecha volvimos a hablar, volvimos a encontrarnos y un poco de nuestro amor volvio a florecer igual que la primera vez que hablamos.",
      "volvimos a hablar por cosas imprevistas, nos tratabamos como amigos y no tocabamos nuestro pasado, eramos nuevas personas.",
    ].join("\n\n"),
  },
  {       
    id: "Actualidad",
    author: "César",
    title: "Present",
    date: "2026-08-04",
    atmosphere: "otono",
    quote:
      "por cierto estoy sin internet haciendo esto",
    content: [
      "actualmente volvemos a intentar reconstruir nuestro amor poco a poco, nos tratamos como siempre y nos entendemos mejor.",
      "para cuando estoy escribiendo esto es el presente, tu cumpleaños se aproxima y tengo pensado que esto sera tu regalo.",
    ].join("\n\n"),
  }
];

/** Capítulos ordenados por fecha (de más antiguo a más nuevo). */
export const CHAPTERS_SORTED = [...CHAPTERS].sort((a, b) =>
  a.date.localeCompare(b.date),
);

///amanecer