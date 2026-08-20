/**
 * ============================================================
 * TOAST — SISTEMA DE NOTIFICACIONES (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Mini-sistema de eventos para mostrar notificaciones sin
 *   usar un contexto de React: cualquier módulo puede llamar
 *   a showToast().
 *
 * ¿Cómo funciona?
 *   - Mantiene una única notificación visible a la vez.
 *   - Los suscriptores (componente Toast) reciben el cambio.
 *   - La notificación se cierra sola tras AUTO_DISMISS_MS.
 *
 * ¿Dónde modificarlo?
 *   - Duración visible: AUTO_DISMISS_MS.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/ui/Toast.tsx (componente visual)
 */

export interface ToastData {
  id: number;
  title: string;
  message?: string;
}

/** Tiempo que permanece visible la notificación (ms). */
const AUTO_DISMISS_MS = 3200;

let currentToast: ToastData | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | undefined;

type Listener = (toast: ToastData | null) => void;
const listeners = new Set<Listener>();

/** Muestra una notificación (reemplaza la anterior). */
export function showToast(title: string, message?: string): void {
  const toast: ToastData = { id: Date.now(), title, message };
  currentToast = toast;
  listeners.forEach((listener) => listener(toast));

  clearTimeout(dismissTimer);
  dismissTimer = setTimeout(() => {
    currentToast = null;
    listeners.forEach((listener) => listener(null));
  }, AUTO_DISMISS_MS);
}

/** Devuelve una función para cerrar la notificación. */
export function dismissToast(): void {
  clearTimeout(dismissTimer);
  currentToast = null;
  listeners.forEach((listener) => listener(null));
}

/** Suscribe un componente a los cambios de notificación. */
export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentToast);
  return () => listeners.delete(listener);
}
