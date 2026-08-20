/**
 * ============================================================
 * TOAST — NOTIFICACIONES FLOTANTES (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Muestra avisos elegantes en la parte baja de la pantalla.
 *   Se usa para los botones "Próximamente" y los easter eggs.
 *
 * ¿Cómo funciona?
 *   - Cualquier código llama a showToast(título, mensaje).
 *   - El componente Toast (montado en el layout) se suscribe
 *     y muestra la notificación con animación de entrada/salida.
 *
 * ¿Dónde modificarlo?
 *   - Tiempo visible: AUTO_DISMISS_MS en src/lib/toast.ts
 *   - Estilo: clases de este componente.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/toast.ts (sistema de eventos)
 *   - src/app/layout.tsx (aquí se monta)
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { subscribeToast, type ToastData } from "@/lib/toast";

export function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => subscribeToast(setToast), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="status"
            className="glass flex max-w-md items-start gap-3 rounded-2xl px-5 py-4 shadow-[0_16px_50px_-12px_rgba(124,58,237,0.4)]"
          >
            <span aria-hidden className="mt-0.5 size-2 shrink-0 animate-glow-pulse rounded-full bg-gradient-to-br from-purple-glow to-pink-glow" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-sm text-starlight/90">{toast.message}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
