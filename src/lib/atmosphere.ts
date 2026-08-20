/**
 * ============================================================
 * ATMÓSFERA ACTIVA — STORE GLOBAL (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Guarda qué cielo está activo en cada momento. Cualquier
 *   página puede cambiarlo con setAtmosphere(); el fondo se
 *   suscribe y se funde al nuevo cielo.
 *
 * ¿Cómo funciona?
 *   Mini-store de eventos (sin React Context): los componentes
 *   de fondo se suscriben con useSyncExternalStore.
 *
 * ¿Dónde modificarlo?
 *   - Normalmente no se modifica: se usa setAtmosphere().
 *
 * ¿Qué archivos utiliza?
 *   - src/components/atmosphere/SetAtmosphere.tsx (cambiarlo)
 *   - src/components/background/Background.tsx (leerlo)
 *   - src/components/historia/ChapterReader.tsx (por capítulo)
 */

import type { AtmosphereId } from "@/data/atmospheres";

/** Cielo por defecto mientras la página no define uno. */
const DEFAULT_ATMOSPHERE: AtmosphereId = "noche-magica";

let current: AtmosphereId = DEFAULT_ATMOSPHERE;

type Listener = (id: AtmosphereId) => void;
const listeners = new Set<Listener>();

/** Cambia el cielo activo (toda la app se entera). */
export function setAtmosphere(id: AtmosphereId): void {
  if (current === id) return;
  current = id;
  listeners.forEach((listener) => listener(id));
}

/** Devuelve el cielo activo. */
export function getAtmosphere(): AtmosphereId {
  return current;
}

/** Suscribe un componente a los cambios de cielo. */
export function subscribeAtmosphere(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
