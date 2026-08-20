/**
 * ============================================================
 * RECUERDOS — LOS MOMENTOS DE NUESTRO UNIVERSO (FASE 4)
 * ============================================================
 *
 * ¿Qué hace?
 *   Los recuerdos que se muestran en la galería. Cada uno es
 *   una foto, un video o una nota escrita.
 *
 * ⚠️ IMPORTANTE — CONTENIDO DE EJEMPLO
 *   Los recuerdos actuales son de muestra (sin fotos reales:
 *   se ven como "cielos de recuerdo" con emoji). Cuando tengas
 *   tus fotos:
 *     1. Copia la foto en public/images/recuerdos/
 *     2. En el objeto, escribe url: "/images/recuerdos/tu-foto.jpg"
 *     3. (Opcional) quita emoji y tint para usar la foto.
 *
 * ¿Cómo funciona?
 *   - kind: "photo" (imagen) | "video" | "note" (texto escrito).
 *   - date: fecha ISO (año-mes-día); la galería ordena de la
 *     más nueva a la más antigua.
 *   - emoji + tint: marco decorativo cuando aún no hay foto.
 *
 * ¿Dónde modificarlo?
 *   - Agrega, quita o edita objetos dentro de MEMORIES.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/data/types.ts (tipo Memory)
 *   - src/components/recuerdos/MemoriesGallery.tsx
 *   - src/components/recuerdos/Lightbox.tsx
 */

import type { Memory } from "@/lib/data/types";

export const MEMORIES: Memory[] = [
  {
    id: "navidad-2025",
    title: "Nuestra primera Navidad juntos",
    kind: "photo",
    url: "/images/recuerdos/25december.JPEG",
    date: "2025-12-25",
    emoji: "🌙",
    tint: "linear-gradient(160deg, #1a2348 0%, #3b2f63 60%, #6e4770 100%)",
    description: "el inicio de viaje que no tiene fin.",
    tags: ["navidad", "aniversario"],
    author: "Sofía",
  },
  {
    id: "cumple-cesar",
    title: "El cumpleaños de César",
    kind: "photo",
    url: "/images/recuerdos/cumpleC.jpg",
    date: "2026-01-31",
    emoji: "🎂",
    tint: "linear-gradient(160deg, #2b3260 0%, #7d5560 60%, #d9a569 100%)",
    description: "El cumpleaños de Cesar y uno de sus momentos mas importantes a tu lado.",
    tags: ["cumpleaños"],
    author: "Sofía",
  },
  {
    id: "noche-roblox",
    title: "Noches de roblox",
    kind: "photo",
    url: "/images/recuerdos/roblox.JPEG",
    date: "2026-07-28",
    emoji: "☕",
    tint: "linear-gradient(160deg, #273452 0%, #40537c 70%, #5f7198 100%)",
    description:
      "Noches inolvidables que pasabamos juntos como novios.",
    tags: ["casa", "conversación"],
    author: "César",
  },
  {
    id: "Comida",
    title: "Comimos juntos",
    kind: "photo",
    url: "/images/recuerdos/irl.JPEG",
    date: "2026-05-13",
    emoji: "🌼",
    tint: "linear-gradient(160deg, #5c8fb8 0%, #a3c2d9 55%, #ecd7c0 100%)",
    description: "fuimos por unas hambuerguesas",
    tags: ["viaje", "aire libre"],
    author: "César",
  },
  {
    id: "presumirte",
    title: "Unas de las primeras veces que te presumí",
    kind: "video",
    url: "/images/recuerdos/laprimeravez.mp4",
    date: "2026-01-07",
    emoji: "🍳",
    tint: "linear-gradient(160deg, #4a3a58 0%, #b57e5f 75%, #e2a079 100%)",
    description: "te veias hermosa.",
    tags: ["casa", "risas"],
    author: "César",
  },
  {
    id: "cumple-sofia",
    title: "El cumpleaños de Sofía",
    kind: "photo",
    date: "2026-08-22",
    emoji: "Proximamente",
    tint: "linear-gradient(160deg, #3b2f63 0%, #6e4770 55%, #c99ab4 100%)",
    description: "",
    tags: ["cumpleaños"],
  },
  {
    id: "aparicion-rayo",
    title: "La llegada de Rayo",
    kind: "photo",
    url: "/images/recuerdos/rayo.JPEG",
    date: "2026-01-25",
    emoji: "🌠",
    tint: "linear-gradient(160deg, #0c1229 0%, #1a2348 60%, #3b2f63 100%)",
    description: "El día que Rayo llegó a nuestras vidas y nos llenó de alegría.",
    tags: ["noche", "romántico"],
    author: "Sofía",
  },
  {
    id: "san-valentin-2026",
    title: "Nuestro primer San Valentín juntos",
    kind: "photo",
    url: "/images/recuerdos/sanvalentin.JPEG",
    date: "2026-02-14",
    emoji: "✉️",
    tint: "linear-gradient(160deg, #212a4e 0%, #4a3a58 70%, #7d5560 100%)",
    description:
      "nuestro primer San Valentín juntos de muchos que faltan.",
    tags: ["love", "amor"],
    author: "César",
  },
  {
    id: "shelbyto-engordo",
    title: "shelbyto engordo",
    kind: "video",
    url: "/images/recuerdos/shelbyto.mp4",
    date: "2026-02-22",
    emoji: "🐾",
    tint: "linear-gradient(160deg, #37425f 0%, #57688c 55%, #8fae8f 100%)",
    description: "lo tuvimos que meter al gym",
    tags: ["mascotas", "familia"],
    author: "César",
  },
];

/** Recuerdos ordenados de la fecha más antigua a la más reciente. */
export const MEMORIES_SORTED = [...MEMORIES].sort((a, b) =>
  a.date.localeCompare(b.date),
);
