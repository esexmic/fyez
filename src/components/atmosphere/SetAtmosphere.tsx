/**
 * ============================================================
 * SET ATMOSPHERE — CAMBIA EL CIELO DE UNA PÁGINA (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Declara qué atmósfera (cielo) quiere una página. Se monta
 *   una vez en el contenido y el fondo se funde al nuevo cielo.
 *
 * ¿Cómo funciona?
 *   Llama a setAtmosphere() (store global) al montarse.
 *   Ejemplo de uso en una página:
 *     <SetAtmosphere id="atardecer" />
 *
 * ¿Dónde modificarlo?
 *   - No se modifica: solo se usa con ids de src/data/atmospheres.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/atmosphere.ts (store)
 */

"use client";

import { useEffect } from "react";

import type { AtmosphereId } from "@/data/atmospheres";
import { setAtmosphere } from "@/lib/atmosphere";

export interface SetAtmosphereProps {
  id: AtmosphereId;
}

/** Fija el cielo de la página actual. */
export function SetAtmosphere({ id }: SetAtmosphereProps) {
  useEffect(() => {
    setAtmosphere(id);
  }, [id]);

  return null;
}
