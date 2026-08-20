/**
 * ============================================================
 * EASTER EGG LAYER — MOTOR DE SECRETOS (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Componente global (montado en el layout) que vigila los
 *   disparadores registrados y los activa.
 *
 * ¿Cómo funciona?
 *   Soporta hoy 5 tipos de disparador:
 *   - "click": escucha clics en el selector indicado.
 *   - "keys": detecta una combinación de teclas escrita.
 *   - "time": lanza el secreto tras permanecer N ms.
 *   - "date": lanza el secreto solo en una fecha especial
 *     (mes y día, en la hora de Monterrey).
 *   - "scroll": lanza el secreto al bajar N píxeles.
 *   - "hover": escucha el cursor sobre un selector.
 *   Los secretos viven en src/lib/easter-eggs/registry.ts.
 *
 * ¿Dónde modificarlo?
 *   - Agregar secretos: registry.ts (sin tocar este archivo).
 *   - Nuevos tipos de disparador: extiende el switch inferior.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/easter-eggs/registry.ts y types.ts
 *   - src/lib/toast.ts (muestra el mensaje del secreto)
 *   - src/app/layout.tsx (aquí se monta)
 */

"use client";

import { useEffect } from "react";

import { getAllEasterEggs } from "@/lib/easter-eggs/registry";
import { monterreyToday } from "@/lib/monterrey";
import { showToast } from "@/lib/toast";

/** Muestra la acción "message" de un secreto. */
function showMessage(text: string) {
  showToast("Secreto encontrado", text);
}

const SHOWN_KEY = "fyez:easter-eggs-shown";

/** Marca un secreto como mostrado. Devuelve true solo la primera vez. */
function claimOnce(id: string): boolean {
  try {
    const raw = window.sessionStorage.getItem(SHOWN_KEY);
    const shown = new Set(raw ? (JSON.parse(raw) as string[]) : []);
    if (shown.has(id)) return false;
    shown.add(id);
    window.sessionStorage.setItem(SHOWN_KEY, JSON.stringify(Array.from(shown)));
    return true;
  } catch {
    return true;
  }
}

export function EasterEggLayer() {
  useEffect(() => {
    const eggs = getAllEasterEggs();
    const cleanup: Array<() => void> = [];

    for (const egg of eggs) {
      const trigger = egg.trigger;
      switch (trigger.type) {
        case "click": {
          const handler = () => {
            // Un solo disparo por sesión: no molesta al tocar la página.
            if (!claimOnce(egg.id)) return;
            if (egg.action.type === "message") showMessage(egg.action.text);
          };
          const target = document.querySelector(trigger.selector);
          target?.addEventListener("click", handler);
          cleanup.push(() => target?.removeEventListener("click", handler));
          break;
        }

        case "keys": {
          const combo = trigger.combo;
          let buffer = 0;
          const handler = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            buffer = key === combo[buffer] ? buffer + 1 : key === combo[0] ? 1 : 0;
            if (buffer === combo.length) {
              buffer = 0;
              if (!claimOnce(egg.id)) return;
              if (egg.action.type === "message") showMessage(egg.action.text);
            }
          };
          window.addEventListener("keydown", handler);
          cleanup.push(() => window.removeEventListener("keydown", handler));
          break;
        }

        case "time": {
          const timer = window.setTimeout(() => {
            if (!claimOnce(egg.id)) return;
            if (egg.action.type === "message") showMessage(egg.action.text);
          }, trigger.delayMs);
          cleanup.push(() => clearTimeout(timer));
          break;
        }

        case "date": {
          // Hoy en Monterrey: "YYYY-MM-DD" -> [mes, día].
          const [, month, day] = monterreyToday().split("-").map(Number);
          if (month === trigger.month && day === trigger.day) {
            if (!claimOnce(egg.id)) break;
            const timer = window.setTimeout(() => {
              if (egg.action.type === "message") showMessage(egg.action.text);
            }, 2500);
            cleanup.push(() => clearTimeout(timer));
          }
          break;
        }

        case "scroll": {
          const handler = () => {
            if (window.scrollY < trigger.thresholdPx) return;
            if (!claimOnce(egg.id)) return;
            if (egg.action.type === "message") showMessage(egg.action.text);
            window.removeEventListener("scroll", handler);
          };
          window.addEventListener("scroll", handler, { passive: true });
          cleanup.push(() => window.removeEventListener("scroll", handler));
          break;
        }

        case "hover": {
          const handler = () => {
            if (!claimOnce(egg.id)) return;
            if (egg.action.type === "message") showMessage(egg.action.text);
            target?.removeEventListener("mouseenter", handler);
          };
          const target = document.querySelector(trigger.selector);
          target?.addEventListener("mouseenter", handler);
          cleanup.push(() => target?.removeEventListener("mouseenter", handler));
          break;
        }
      }
    }

    return () => cleanup.forEach((fn) => fn());
  }, []);

  return null;
}
