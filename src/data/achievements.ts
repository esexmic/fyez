/**
 * LOGROS — NUESTRAS PEQUEÑAS MEDALLAS (FASE 12)
 *
 * ¿Qué hace?
 *   Los logros de la pareja. Cada uno se gana visitando
 *   (o completando) las secciones de la página.
 */

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  /** Secciones que hay que visitar para ganarlo. */
  requiredSections: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "primer-paso",
    title: "Primer paso",
    emoji: "🌷",
    description: "Visitar la sección de Nuestras Memorias.",
    requiredSections: ["memorias"],
  },
  {
    id: "cartas",
    title: "Escritor de cartas",
    emoji: "💌",
    description: "Leer (o escribir) una carta en la sección de Cartas.",
    requiredSections: ["cartas", "memorias"],
  },
  {
    id: "jardin",
    title: "Corazón de calendario",
    emoji: "📅",
    description: "Visitar el Calendario de fechas importantes.",
    requiredSections: ["calendario"],
  },
  {
    id: "musico",
    title: "DJ de la relación",
    emoji: "🎶",
    description: "Visitar nuestra playlist de Música.",
    requiredSections: ["musica"],
  },
  {
    id: "explorador",
    title: "Explorador curioso",
    emoji: "🗺️",
    description: "Visitar todos los rincones secretos de la página.",
    requiredSections: ["secretos"],
  },
];