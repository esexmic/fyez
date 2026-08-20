/**
 * ============================================================
 * COMING SOON — INSIGNIA "PRÓXIMAMENTE" (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Insignia elegante que indica contenido aún no disponible.
 *   Se usa en tarjetas, placeholders y páginas internas.
 *
 * ¿Cómo funciona?
 *   Píldora de cristal con texto en mayúsculas espaciado y un
 *   icono de destello animado (animate-sparkle).
 *
 * ¿Dónde modificarlo?
 *   - Texto por defecto: prop `label`.
 *   - Estilo: clases de este componente.
 *
 * ¿Qué archivos utiliza?
 *   - lucide-react (Sparkles)
 */

import { Sparkles } from "lucide-react";

export interface ComingSoonProps {
  /** Texto que se muestra. */
  label?: string;
}

/**
 * Insignia de contenido aún no disponible.
 * @example <ComingSoon />
 */
export function ComingSoon({ label = "Próximamente" }: ComingSoonProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-starlight/90">
      <Sparkles className="size-3.5 animate-sparkle text-purple-glow" />
      {label}
    </span>
  );
}
