/**
 * ============================================================
 * SECTION — SECCIÓN BASE DE PÁGINA
 * ============================================================
 *
 * ¿Qué hace?
 *   Envuelve un bloque de contenido con encabezado (título y
 *   subtítulo opcionales) y un id para navegación/anclas.
 *
 * ¿Cómo funciona?
 *   Se usa en cada página para mantener la misma estructura
 *   y semántica. El diseño visual se define en FASE 2.
 *
 * ¿Dónde modificarlo?
 *   - Visual: FASE 2.
 *   - Estructura: solo si todas las secciones cambian igual.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/utils/cn.ts
 */

import { cn } from "@/lib/utils/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Identificador del bloque (para enlaces internos). */
  sectionId?: string;
  /** Título principal de la sección. */
  title?: string;
  /** Texto breve que acompaña al título. */
  subtitle?: string;
}

/**
 * Sección base de una página.
 * @example <Section sectionId="historia" title="Nuestra Historia">...</Section>
 */
export function Section({
  sectionId,
  title,
  subtitle,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section id={sectionId} className={cn("flex flex-col", className)} {...props}>
      {(title || subtitle) && (
        <header className="flex flex-col gap-2">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
