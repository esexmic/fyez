/**
 * ============================================================
 * SECCIONES DE LA APLICACIÓN (FUENTE ÚNICA DE VERDAD)
 * ============================================================
 *
 * ¿Qué hace?
 *   Define TODAS las secciones de la app: su ruta, nombre,
 *   icono, acento de color, su cielo (atmósfera) y estado.
 *
 * ¿Cómo funciona?
 *   Navbar, Footer, página de inicio y placeholders leen esta
 *   lista. Si mañana agregas una sección, solo editas este
 *   archivo y creas su carpeta en src/app.
 *
 * ¿Dónde modificarlo?
 *   Agrega o quita objetos dentro del array SECTIONS.
 *   - icon: clave del icono (ver src/components/icons/sectionIcons.tsx)
 *   - accent: color de acento ("violet" | "purple" | "pink" | "blush")
 *   - atmosphere: el cielo de este lugar (src/data/atmospheres.ts)
 *   - inNavbar: ¿aparece en la barra de navegación?
 *   - status: "built" (funciona) o "planned" (próximamente)
 *
 * ¿Qué archivos utiliza?
 *   - src/components/layout/Navbar.tsx
 *   - src/components/layout/Footer.tsx
 *   - src/components/home/SectionGrid.tsx
 *   - src/components/shared/SectionPlaceholder.tsx
 */

import type { AtmosphereId } from "@/data/atmospheres";

export type SectionStatus = "built" | "planned";
export type SectionPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export type SectionAccent = "violet" | "purple" | "pink" | "blush";

export interface Section {
  /** Identificador único (debe coincidir con la carpeta en src/app). */
  id: string;
  /** Nombre visible. */
  label: string;
  /** Ruta en la aplicación. */
  href: string;
  /** Pequeña descripción (tarjetas y footer). */
  description: string;
  /** Clave del icono (lucide). */
  icon: string;
  /** Acento de color para el diseño. */
  accent: SectionAccent;
  /** ¿Se muestra en la barra de navegación? */
  inNavbar: boolean;
  /** Cielo de esta sección (ver src/data/atmospheres.ts). */
  atmosphere: AtmosphereId;
  /** Fase del roadmap en la que se construye. */
  phase: SectionPhase;
  /** Estado actual de desarrollo. */
  status: SectionStatus;
}

export const SECTIONS: Section[] = [
  {
    id: "inicio",
    label: "Inicio",
    href: "/",
    description: "El inicio de todo",
    icon: "sparkles",
    accent: "violet",
    inNavbar: false,
    atmosphere: "noche-magica",
    phase: 2,
    status: "planned",
  },
  {
    id: "historia",
    label: "Nuestra Historia",
    href: "/historia",
    description: "Nuestra historia por partes, desde el primer dia hasta el mas reciente.",
    icon: "book-heart",
    accent: "violet",
    inNavbar: true,
    atmosphere: "amanecer",
    phase: 3,
    status: "built",
  },
  {
    id: "recuerdos",
    label: "Recuerdos",
    href: "/recuerdos",
    description: "Fotos o videos con frases que nos recuerdan momentos bonitos.",
    icon: "camera",
    accent: "purple",
    inNavbar: true,
    atmosphere: "atardecer",
    phase: 4,
    status: "built",
  },
  {
    id: "juegos",
    label: "Minijuegos",
    href: "/juegos",
    description: "Minijuegos para que te diviertas",
    icon: "gamepad",
    accent: "pink",
    inNavbar: true,
    atmosphere: "dia-calido",
    phase: 6,
    status: "built",
  },
  {
    id: "cartas",
    label: "Cartas",
    href: "/cartas",
    description: "Para mandarnos cartas cada que queramos.",
    icon: "mail-heart",
    accent: "pink",
    inNavbar: true,
    atmosphere: "lluvia",
    phase: 7,
    status: "built",
  },
  {
    id: "regalos",
    label: "Regalos",
    href: "/regalos",
    description: "Regalos que tenemos planeados darnos o que ya se dieron.",
    icon: "gift",
    accent: "blush",
    inNavbar: true,
    atmosphere: "noche-magica",
    phase: 8,
    status: "built",
  },
  {
    id: "musica",
    label: "Música",
    href: "/musica",
    description: "Musicas que nos dedicamos",
    icon: "music",
    accent: "blush",
    inNavbar: false,
    atmosphere: "noche-tranquila",
    phase: 10,
    status: "built",
  },
  {
    id: "calendario",
    label: "Calendario",
    href: "/calendario",
    description: "Fechas importantes para nosotros",
    icon: "calendar-heart",
    accent: "violet",
    inNavbar: false,
    atmosphere: "dia-nublado",
    phase: 11,
    status: "built",
  },
  {
    id: "logros",
    label: "Logros",
    href: "/logros",
    description: "Logros que hemos cumplido juntos como relacion.",
    icon: "trophy",
    accent: "purple",
    inNavbar: false,
    atmosphere: "dia-calido",
    phase: 12,
    status: "built",
  },
  {
    id: "capsulas",
    label: "Cápsulas del Tiempo",
    href: "/capsulas",
    description: "Para poner cosas que queremos lograr en un futuro juntos.",
    icon: "hourglass",
    accent: "pink",
    inNavbar: false,
    atmosphere: "amanecer",
    phase: 13,
    status: "built",
  },
  {
    id: "secretos",
    label: "Secretos",
    href: "/secretos",
    description: "Aqui podemos guardar secretos y se abriran en la fecha que decidamos.",
    icon: "sparkles",
    accent: "blush",
    inNavbar: false,
    atmosphere: "noche-magica",
    phase: 14,
    status: "built",
  },
];

/** Secciones que ya tienen página creada en src/app. */
export const BUILT_SECTIONS = SECTIONS.filter((s) => s.status === "built");

/** Secciones pendientes (para mostrar "Próximamente"). */
export const PLANNED_SECTIONS = SECTIONS.filter((s) => s.status === "planned");

/** Devuelve el id de la sección a la que pertenece una ruta. */
export function getSectionIdByPath(pathname: string): string | null {
  const section = SECTIONS.find((s) => s.href !== "/" && pathname.startsWith(s.href));
  return section?.id ?? null;
}
