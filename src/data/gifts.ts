/**
 * ============================================================
 * REGALOS — SEMILLA DE EJEMPLO (FASE 8)
 * ============================================================
 *
 * ¿Qué hace?
 *   Los regalos de ejemplo que se cargan la primera vez. Después,
 *   los regalos nuevos se agregan desde la propia página
 *   (/regalos > "Agregar regalo") con foto, tipo ("queremos
 *   regalarlo" / "ya se regaló"), título, subtítulo, texto y
 *   autor, y se guardan en el proveedor de datos.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Los regalos actuales son de muestra. Cámbialos o crea los
 *   tuyos desde la página.
 *
 * ¿Cómo funciona?
 *   - date: fecha ISO (año-mes-día); la lista ordena de la
 *     más antigua a la más reciente.
 *   - emoji: respaldo visual cuando el regalo no tiene foto.
 */

import type { Gift } from "@/lib/data/types";

export const GIFTS: Gift[] = [
  {
    id: "primera-navidad",
    kind: "given",
    title: "Nuestra primera Navidad",
    subtitle: "El regalo de empezar juntos",
    date: "2025-12-25",
    emoji: "🎄",
    description:
      "Fue el día en que el calendario dejó de ser solo fechas y se volvió nuestro. No hubo papel ni cinta: el regalo fue decirnos sí.",
    author: "César",
  },
  {
    id: "anillo",
    kind: "given",
    title: "Un anillo prometido",
    subtitle: "La promesa de un futuro en común",
    date: "2026-02-14",
    emoji: "💍",
    description: "Pequeño, pero pesa lo que pesa una promesa. Desde ese día, el 14 de febrero significa otra cosa.",
    author: "Sofía",
  },
  {
    id: "collar",
    kind: "given",
    title: "Collar de las estrellas",
    subtitle: "Para llevar nuestro cielo contigo",
    date: "2026-05-20",
    emoji: "🌟",
    description: "Las mismas estrellas del inicio, ahora a tu cuello. Donde quiera que vayas, llevas nuestro cielo.",
    author: "César",
  },
  {
    id: "dahood",
    kind: "given",
    title: "Skins de Dahood",
    subtitle: "Nuestras partidas con estilo",
    date: "2026-06-12",
    emoji: "🎮",
    description: "En el juego y en la vida: juntos por siempre, y con el skin más bonito.",
    author: "Sofía",
  },
];

/** Regalos ordenados de la fecha más antigua a la más reciente. */
export const GIFTS_SORTED = [...GIFTS].sort((a, b) => a.date.localeCompare(b.date));
