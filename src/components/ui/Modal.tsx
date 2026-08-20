/**
 * ============================================================
 * MODAL — VENTANA EMERGENTE BASE
 * ============================================================
 *
 * ¿Qué hace?
 *   Ventana emergente reutilizable para cartas, mensajes
 *   secretos, galerías y avisos.
 *
 * ¿Cómo funciona?
 *   - Se monta solo cuando `open` es true.
 *   - Cierra con la tecla Escape o clic en la zona oscura.
 *   - El diseño visual (glassmorphism, animación de entrada)
 *     se define en FASE 2.
 *
 * ¿Dónde modificarlo?
 *   - Visual: FASE 2.
 *   - Comportamiento: aquí mismo si es necesario.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/utils/cn.ts
 */

"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  /** ¿Ventana visible? */
  open: boolean;
  /** Función para cerrar la ventana. */
  onClose: () => void;
  /** Título opcional de la ventana. */
  title?: string;
  /** Contenido de la ventana. */
  children: React.ReactNode;
}

/**
 * Ventana emergente base.
 * @example <Modal open={open} onClose={() => setOpen(false)} title="Carta">...</Modal>
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  // Cierra la ventana con la tecla Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className={cn("fixed inset-0 z-50")}>
      {/* Fondo oscuro: clic para cerrar */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
