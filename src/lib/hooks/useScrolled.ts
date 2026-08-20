/**
 * ============================================================
 * HOOK useScrolled — DETECTA SCROLL (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Devuelve true cuando la página se ha desplazado más allá
 *   de un umbral. Se usa para dar glassmorphism a la navbar.
 *
 * ¿Cómo funciona?
 *   Escucha el evento scroll (pasivo) y compara window.scrollY.
 *
 * ¿Dónde modificarlo?
 *   - Umbral: parámetro threshold.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/layout/Navbar.tsx
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Indica si la página superó el umbral de scroll.
 * @param threshold Píxeles de scroll para activarse (default 24).
 */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
