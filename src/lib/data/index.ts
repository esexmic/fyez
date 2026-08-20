/**
 * ============================================================
 * PROVEEDOR DE DATOS ACTIVO — SIEMPRE LA NUBE (SUPABASE)
 * ============================================================
 *
 * ¿Qué hace?
 *   Desde que se conectó Supabase, la app guarda SIEMPRE en la
 *   nube: lo que agrega César lo ve Sofía y viceversa. No hay
 *   más almacenamiento local para los datos de la app.
 *
 * ¿Cómo funciona?
 *   - El proveedor se elige en este archivo (hoy: supabase).
 *   - Los componentes usan `data` desde este archivo, jamás
 *     importan un proveedor directamente.
 *
 * ¿Dónde modificarlo?
 *   - Claves: .env.local (NEXT_PUBLIC_SUPABASE_URL y
 *     NEXT_PUBLIC_SUPABASE_ANON_KEY).
 *   - Esquema: docs/supabase-schema.sql (ejecutar en SQL Editor).
 *
 * ¿Qué archivos utiliza?
 *   - ./provider.ts (contrato)
 *   - ./supabase/provider.ts (implementación en la nube)
 */

import { supabaseProvider } from "./supabase/provider";
import type { DataProvider } from "./provider";

/** Proveedor activo: la nube de Supabase. */
export function getActiveProvider(): DataProvider {
  return supabaseProvider;
}

/** Instancia única del proveedor para toda la app. */
export const data: DataProvider = getActiveProvider();