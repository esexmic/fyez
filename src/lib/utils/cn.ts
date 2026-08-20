/**
 * ============================================================
 * UTILIDAD "cn" — UNIR CLASES CSS
 * ============================================================
 *
 * ¿Qué hace?
 *   Combina clases CSS condicionalmente, resolviendo conflictos
 *   entre clases de Tailwind (ej: "px-4" + "px-6").
 *
 * ¿Cómo funciona?
 *   Usa clsx para unir clases y tailwind-merge para resolver
 *   duplicados. Es el estándar en proyectos React modernos.
 *
 * ¿Dónde modificarlo?
 *   No se modifica. Se importa en cualquier componente:
 *     cn("base", condicion && "clase", variante)
 *
 * ¿Qué archivos utiliza?
 *   - node_modules/clsx
 *   - node_modules/tailwind-merge
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
