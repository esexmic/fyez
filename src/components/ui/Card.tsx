/**
 * ============================================================
 * CARD — TARJETA BASE REUTILIZABLE
 * ============================================================
 *
 * ¿Qué hace?
 *   Contenedor de contenido con título opcional. Es la base de
 *   tarjetas de recuerdos, juegos y cartas.
 *
 * ¿Cómo funciona?
 *   Compone un header (opcional) + cuerpo. El diseño visual
 *   (glassmorphism, sombras, profundidad) se define en FASE 2.
 *
 * ¿Dónde modificarlo?
 *   - Visual: FASE 2.
 *   - Estructura: solo si todas las tarjetas cambian igual.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/utils/cn.ts
 */

import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título opcional de la tarjeta. */
  title?: string;
  /** Subtítulo opcional (por ejemplo, la fecha). */
  subtitle?: string;
  /** Contenido de acción (botones, enlaces) dentro del header. */
  action?: React.ReactNode;
}

/**
 * Tarjeta base de la aplicación.
 * @example <Card title="Nuestro primer viaje" subtitle="2023">...</Card>
 */
export function Card({ title, subtitle, action, className, children, ...props }: CardProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
