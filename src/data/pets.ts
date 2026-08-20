/**
 * ============================================================
 * MASCOTAS DEL JARDÍN — QUIÉNES SON Y CÓMO SE VEN (FASE 9.7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Define a cada mascota para el jardín 2D plano (vista
 *   frontal, estilo side-scroller): su casa alineada en el eje
 *   X sobre la franja de pasto, su rango de paseo, su velocidad
 *   y los colores exactos de su cuerpo y su casa.
 *
 * ¿Cómo se ven? (lo que dijiste)
 *   - Apio: blanco con una mancha negra en el bigote.
 *   - Rayo: café claro con cejas rubias.
 *   - Shelby y Night: grises con rayas (arquitectura distinta
 *     en sus casas para diferenciarlas).
 *
 * Colores de las casas (match con la mascota):
 *   - Apio:   estructura blanca, techo negro (dos aguas).
 *   - Rayo:   café/arena con detalles amarillo dorado.
 *   - Shelby: gris con texturas lineales atigradas (dos aguas).
 *   - Night:  gris oscuro moderno con techo plano y ventana
 *     corrida (arquitectónicamente distinta a Shelby).
 *
 * El lienzo del jardín es de SCENE_W x SCENE_H px y la línea
 * del pasto está en GROUND_Y (los personajes se posan ahí).
 */

export interface GardenPet {
  id: string;
  name: string;
  kind: "dog" | "cat";
  /** Color principal del cuerpo. */
  body: string;
  /** Vientre / pecho (más claro). */
  belly: string;
  /** Detalle más oscuro: manchas, rayas, orejas. */
  detail: string;
  /** Respaldo dorado/rubio (cejas de Rayo). */
  accent?: string;
  /** Mancha del bigote de Apio. */
  patch?: string;
  /** Frase al pulsarla. */
  frase: string;
  /** Centro de la casa en el eje X del lienzo (px). */
  houseX: number;
  /** Velocidad de paseo (px por segundo). */
  speed: number;
  /** Rango libre de paseo en el eje X (px). */
  walkMin: number;
  walkMax: number;
  house: {
    roof: "gable" | "flat";
    door: "rect" | "arch";
    /** Fachada (color principal). */
    wall: string;
    /** Detalles de la fachada (sombra, marco). */
    wallDark: string;
    /** Techo principal. */
    roofColor: string;
    /** Contraste del techo. */
    roofDark: string;
    /** Puertas, ventanas, filetes. */
    trim: string;
    /** Rayas atigradas (Shelby). */
    stripes?: boolean;
    /** Ventana corrida moderna (Night). */
    modernWindow?: boolean;
  };
}

/** Lienzo del jardín (px). */
export const SCENE_W = 1200;
export const SCENE_H = 640;

/** Línea del pasto: ahí se posan casas y mascotas (px desde arriba). */
export const GROUND_Y = 470;

export const GARDEN_PETS: GardenPet[] = [
  {
    id: "rayo",
    name: "Rayo",
    kind: "dog",
    body: "#c1906b",
    belly: "#ecd9b8",
    detail: "#a5714a",
    accent: "#e8d29b",
    frase: "¡Wof! El pasto quedó perfecto para correr.",
    houseX: 180,
    speed: 110,
    walkMin: 80,
    walkMax: 690,
    house: {
      roof: "gable",
      door: "rect",
      wall: "#dcbd90",
      wallDark: "#c9a87b",
      roofColor: "#e0b96a",
      roofDark: "#b98a4c",
      trim: "#8a5a33",
    },
  },
  {
    id: "night",
    name: "Night",
    kind: "cat",
    body: "#7d8491",
    belly: "#a6adba",
    detail: "#565d6c",
    frase: "Night vigila las siestas del jardín desde su cama.",
    houseX: 475,
    speed: 70,
    walkMin: 350,
    walkMax: 830,
    house: {
      roof: "flat",
      door: "arch",
      wall: "#82878f",
      wallDark: "#6d727c",
      roofColor: "#464b57",
      roofDark: "#383c46",
      trim: "#2e323b",
      modernWindow: true,
    },
  },
  {
    id: "apio",
    name: "Apio",
    kind: "cat",
    body: "#f1ece3",
    belly: "#ffffff",
    detail: "#d8d2c6",
    patch: "#2c2e35",
    frase: "Apio presume su bigote con la manchita que lo dice todo.",
    houseX: 770,
    speed: 85,
    walkMin: 620,
    walkMax: 1120,
    house: {
      roof: "gable",
      door: "rect",
      wall: "#f6f3ec",
      wallDark: "#e6e1d3",
      roofColor: "#2c2e35",
      roofDark: "#181a1f",
      trim: "#2c2e35",
    },
  },
  {
    id: "shelby",
    name: "Shelby",
    kind: "cat",
    body: "#b3b9c4",
    belly: "#d9dee7",
    detail: "#828a98",
    frase: "Shelby persigue mariposas que solo ella ve.",
    houseX: 1065,
    speed: 90,
    walkMin: 900,
    walkMax: 1150,
    house: {
      roof: "gable",
      door: "rect",
      wall: "#a9afba",
      wallDark: "#979ead",
      roofColor: "#8a92a0",
      roofDark: "#6e7684",
      trim: "#575e6b",
      stripes: true,
    },
  },
];

/**
 * Flores decorativas del césped (coordenadas del lienzo).
 * y está dentro de la franja de pasto (GROUND_Y + 16 … GROUND_Y + 54).
 */
export const GARDEN_FLOWERS: {
  x: number;
  y: number;
  emoji: string;
  size: number;
}[] = [
  { x: 66, y: 502, emoji: "🌼", size: 20 },
  { x: 150, y: 490, emoji: "🌷", size: 19 },
  { x: 262, y: 514, emoji: "🌼", size: 17 },
  { x: 388, y: 498, emoji: "🌻", size: 20 },
  { x: 560, y: 512, emoji: "🌷", size: 18 },
  { x: 680, y: 492, emoji: "🌼", size: 19 },
  { x: 830, y: 510, emoji: "🌼", size: 17 },
  { x: 950, y: 494, emoji: "🌷", size: 19 },
  { x: 1032, y: 516, emoji: "🌻", size: 20 },
  { x: 1142, y: 500, emoji: "🌼", size: 17 },
];
