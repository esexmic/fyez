/**
 * ============================================================
 * ATMÓSFERAS — LOS CIELOS DE NUESTRO UNIVERSO
 * ============================================================
 *
 * ¿Qué hace?
 *   Cada sección (y cada capítulo de historia) vive bajo su
 *   propio cielo: atardeceres cálidos, noches tranquilas,
 *   lluvia suave... Cada atmósfera define el degradado del
 *   cielo, su astro (sol/luna), sus partículas y su emoción.
 *
 * ¿Cómo funciona?
 *   - La página activa una atmósfera con <SetAtmosphere id=... />.
 *   - AtmosphereSky pinta el degradado + astro + nubes.
 *   - ParticleCanvas dibuja las partículas (estrellas, lluvia,
 *     pétalos, hojas, luciérnagas, destellos).
 *   - El cambio de cielo se funde con una transición suave.
 *
 * ¿Dónde modificarlo?
 *   - Colores de un cielo: edita el string `sky`.
 *   - Partículas de un cielo: edita el array `particles`.
 *   - Para un cielo nuevo: agrega un id aquí y úsalo en
 *     src/data/sections.ts o en los capítulos.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/background/AtmosphereSky.tsx
 *   - src/components/background/ParticleCanvas.tsx
 *   - src/lib/atmosphere.ts (store activo)
 */

export type AtmosphereId =
  | "atardecer"
  | "noche-tranquila"
  | "noche-magica"
  | "dia-calido"
  | "dia-nublado"
  | "primavera"
  | "otono"
  | "lluvia"
  | "amanecer";

export type ParticleKind =
  | "stars"
  | "shooting"
  | "sparkles"
  | "fireflies"
  | "rain"
  | "leaves"
  | "petals";

export type CelestialKind = "sun" | "moon" | "none";

export interface Atmosphere {
  id: AtmosphereId;
  /** Nombre que se muestra en la interfaz. */
  name: string;
  /** La emoción que transmite este cielo. */
  emotion: string;
  /** Degradado del cielo (CSS). */
  sky: string;
  /** Astro visible (sol o luna). */
  celestial: CelestialKind;
  /** ¿Se ven nubes? */
  clouds: boolean;
  /** Partículas que viven en este cielo. */
  particles: ParticleKind[];
}

export const ATMOSPHERES: Record<AtmosphereId, Atmosphere> = {
  atardecer: {
    id: "atardecer",
    name: "Atardecer cálido",
    emotion: "Calidez y recuerdos felices",
    sky: "linear-gradient(180deg, #3b2f63 0%, #6e4770 40%, #b06a75 68%, #e2a079 86%, #f5c98c 100%)",
    celestial: "sun",
    clouds: true,
    particles: ["stars", "sparkles"],
  },
  "noche-tranquila": {
    id: "noche-tranquila",
    name: "Noche tranquila",
    emotion: "Paz para leer y recordar",
    sky: "linear-gradient(180deg, #0e1530 0%, #17203f 55%, #212a4e 100%)",
    celestial: "moon",
    clouds: false,
    particles: ["stars", "fireflies"],
  },
  "noche-magica": {
    id: "noche-magica",
    name: "Noche mágica",
    emotion: "Magia y estrellas que crecen",
    sky: "linear-gradient(180deg, #0c1229 0%, #1a2348 50%, #2b3260 100%)",
    celestial: "moon",
    clouds: false,
    particles: ["stars", "shooting", "sparkles"],
  },
  "dia-calido": {
    id: "dia-calido",
    name: "Día cálido",
    emotion: "Luz, risas y energía",
    sky: "linear-gradient(180deg, #3f6d96 0%, #6d9cc4 45%, #a8c8dc 75%, #e9cda0 100%)",
    celestial: "sun",
    clouds: true,
    particles: ["sparkles"],
  },
  "dia-nublado": {
    id: "dia-nublado",
    name: "Día nublado",
    emotion: "Tranquilidad para reflexionar",
    sky: "linear-gradient(180deg, #37425f 0%, #57688c 55%, #7d8ca6 100%)",
    celestial: "none",
    clouds: true,
    particles: [],
  },
  primavera: {
    id: "primavera",
    name: "Primavera",
    emotion: "Flores y vida nueva",
    sky: "linear-gradient(180deg, #5c8fb8 0%, #a3c2d9 55%, #d9c3d4 80%, #ecd7c0 100%)",
    celestial: "sun",
    clouds: true,
    particles: ["petals", "sparkles"],
  },
  otono: {
    id: "otono",
    name: "Otoño",
    emotion: "Hojas que caen con calma",
    sky: "linear-gradient(180deg, #4a3a58 0%, #7d5560 45%, #b57e5f 75%, #d9a569 100%)",
    celestial: "sun",
    clouds: true,
    particles: ["leaves"],
  },
  lluvia: {
    id: "lluvia",
    name: "Lluvia ligera",
    emotion: "Serenidad para leer cartas",
    sky: "linear-gradient(180deg, #273452 0%, #40537c 55%, #5f7198 100%)",
    celestial: "none",
    clouds: true,
    particles: ["rain"],
  },
  amanecer: {
    id: "amanecer",
    name: "Amanecer",
    emotion: "Nuevos comienzos",
    sky: "linear-gradient(180deg, #1b2345 0%, #4a5885 40%, #8fa0bd 65%, #e8b48f 88%, #f6d8a8 100%)",
    celestial: "sun",
    clouds: true,
    particles: ["stars", "sparkles"],
  },
};

/** Devuelve una atmósfera (con respaldo seguro a la noche tranquila). */
export function getAtmosphere(id: AtmosphereId): Atmosphere {
  return ATMOSPHERES[id] ?? ATMOSPHERES["noche-tranquila"];
}
