/**
 * ============================================================
 * ICONOS DE SECCIONES — MAPA id → ICONO LUCIDE (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Convierte la clave de icono (string) definida en
 *   sections.ts en el componente de icono real de lucide-react.
 *
 * ¿Cómo funciona?
 *   - La clave viene del campo `icon` de cada sección.
 *   - Si una sección nueva necesita icono, se agrega aquí.
 *
 * ¿Dónde modificarlo?
 *   - Agregar entradas al objeto SECTION_ICONS.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/sections.ts (claves de icono)
 *   - src/components/home/SectionCard.tsx
 *   - src/components/shared/SectionPlaceholder.tsx
 */

import {
  BookHeart,
  CalendarHeart,
  Camera,
  Cloud,
  Flower2,
  Gamepad2,
  Gift,
  Hourglass,
  Mail,
  Music,
  Sparkles,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";

/** Mapa de iconos disponibles para las secciones. */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  "book-heart": BookHeart,
  camera: Camera,
  cloud: Cloud,
  gamepad: Gamepad2,
  "mail-heart": Mail,
  gift: Gift,
  flower: Flower2,
  music: Music,
  "calendar-heart": CalendarHeart,
  trophy: Trophy,
  hourglass: Hourglass,
  sparkles: Sparkles,
  wrench: Wrench,
};

export interface SectionIconProps {
  /** Clave de icono definida en src/data/sections.ts. */
  iconKey: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * Icono de sección seguro (usa Sparkles si la clave no existe).
 * @example <SectionIcon iconKey="camera" className="size-6" />
 */
export function SectionIcon({ iconKey, className, strokeWidth }: SectionIconProps) {
  return createElement(SECTION_ICONS[iconKey] ?? Sparkles, { className, strokeWidth });
}
