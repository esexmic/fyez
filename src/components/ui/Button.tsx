/**
 * ============================================================
 * BUTTON — BOTÓN BASE (DISEÑO PREMIUM, FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Botón estándar de la app con variantes y tamaños, más
 *   microinteracciones: glow al hover, escala al pulsar y
 *   efecto ripple (onda) en cada clic.
 *
 * ¿Cómo funciona?
 *   - Variantes: primary (gradiente), ghost (cristal), outline.
 *   - El ripple crea un span con la clase .ripple (globals.css)
 *     en la posición exacta del clic y se elimina al terminar.
 *   - focus-visible muestra un anillo para accesibilidad.
 *
 * ¿Dónde modificarlo?
 *   - Colores/glow: mapas VARIANT_CLASSES y SIZE_CLASSES.
 *   - Duración del ripple: CSS (.ripple) en globals.css.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/utils/cn.ts
 *   - src/app/globals.css (clases .ripple y tokens de color)
 */

"use client";

import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Clases por tamaño. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-8 text-base",
};

/** Clases por variante (brillo tenue, nunca fluorescente). */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary " +
    "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] " +
    "hover:shadow-[0_12px_44px_-8px_rgba(201,154,180,0.5)] hover:brightness-110",
  ghost:
    "glass text-primary hover:bg-white/10 hover:border-white/25",
  outline:
    "border border-white/15 text-starlight hover:border-purple-glow/60 hover:text-primary",
};

/** Crea la onda de clic (ripple) en la posición del puntero. */
function createRipple(event: React.PointerEvent<HTMLButtonElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const span = document.createElement("span");
  span.className = "ripple";
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.style.left = `${event.clientX - rect.left - size / 2}px`;
  span.style.top = `${event.clientY - rect.top - size / 2}px`;
  button.appendChild(span);
  window.setTimeout(() => span.remove(), 650);
}

/**
 * Botón base de la aplicación.
 * @example <Button variant="primary" size="lg" onClick={...}>Explorar</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  onPointerDown,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-wide",
        "transition-all duration-300 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-glow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night-950",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      onPointerDown={(event) => {
        createRipple(event);
        onPointerDown?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
