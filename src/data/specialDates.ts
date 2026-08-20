/**
 * SECRETOS — FECHAS IMPORTANTES DE LA PAREJA (FASE 11)
 *
 * ¿Qué hace?
 *   Las fechas de ejemplo que se cargan la primera vez. Después,
 *   las fechas nuevas se agregan desde la propia página
 *   (/calendario > "Agregar fecha") y se guardan en el proveedor
 *   de datos (local o Supabase), como el resto de la app.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Las fechas actuales son de muestra. Cámbialas o crea las
 *   tuyas desde la página.
 */

import type { SpecialDate } from "@/lib/data/types";

export const SPECIAL_DATES: SpecialDate[] = [
  { id: "navidad", date: "12-25", title: "Nuestra Navidad", emoji: "🎄", description: "El día en que empezó todo." },
  { id: "cumple-cesar", date: "01-31", title: "Cumpleaños de César", emoji: "🎂" },
  { id: "cumple-sofia", date: "08-22", title: "Cumpleaños de Sofía", emoji: "🎁" },
  { id: "san-valentin", date: "02-14", title: "San Valentín", emoji: "💘", description: "El 14 nos queda corto." },
  { id: "aniversario", date: "12-25", title: "Aniversario", emoji: "💍", description: "Otro año eligiéndonos." },
  { id: "dahood", date: "01-12", title: "Día del Dahood", emoji: "🎮", description: "El primer día que jugamos juntos." },
];
