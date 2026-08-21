/**
 * ============================================================
 * TIPOS DE DATOS DEL DOMINIO
 * ============================================================
 *
 * ¿Qué hace?
 *   Define la forma de los datos que guardaremos en la app:
 *   recuerdos, capítulos de historia, cartas, juegos y regalos.
 *
 * ¿Cómo funciona?
 *   Estos tipos son el "contrato" entre la interfaz visual y
 *   cualquier base de datos (local, Supabase o Firebase).
 *   Las fases 3+ usan estos tipos para construir sus páginas.
 *
 * ¿Dónde modificarlo?
 *   Se amplía conforme la app crece. Cambiar un campo aquí
 *   requiere actualizar también los proveedores (ver ./provider.ts).
 *
 * ¿Qué archivos utiliza?
 *   - ./provider.ts (interfaz que devuelve estos tipos)
 *   - ./local-provider.ts (implementación local)
 */

/** Un recuerdo: foto, video o momento especial. */
export interface Memory {
  id: string;
  title: string;
  description?: string;
  /** Tipo de contenido. */
  kind: "photo" | "video" | "note";
  /**
   * URL del contenido (local o remota).
   * Si está vacío se muestra un "cielo de recuerdo" (emoji + tint).
   */
  url?: string;
  /** Fecha del momento. */
  date: string; // ISO (ej: "2023-06-15")
  /** Emoji que representa el momento (usado sin foto). */
  emoji?: string;
  /** Gradiente del marco cuando no hay foto (2 colores CSS). */
  tint?: string;
  /** Etiquetas para buscar (ej: ["viaje", "playa"]). */
  tags?: string[];
  /** Quién lo subió (César o Sofía). */
  author?: string;
}

/** Un capítulo de la historia de la pareja. */
export interface StoryChapter {
  id: string;
  title: string;
  /** Fecha en que ocurrió (permite ordenar la línea de tiempo). */
  date: string; // ISO
  content: string;
  /** Imagen opcional del capítulo. */
  imageUrl?: string;
  /** Cielo que envuelve este recuerdo (ver src/data/atmospheres.ts). */
  atmosphere?: string;
  /** Frase que cierra el capítulo. */
  quote?: string;
  /** Quién escribió o subió el capítulo (César o Sofía). */
  author?: string;
}

/** Una carta escrita a la otra persona. */
export interface Letter {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO
  /** Quién la escribió (César o Sofía). */
  author?: string;
  /** ¿Leída por la otra persona? */
  read: boolean;
}

/** Un secreto enviado: solo se abre desde una fecha (y hora) mínima. */
export interface SecretEntry {
  id: string;
  title: string;
  message: string;
  /** Quién lo dejó (César o Sofía). */
  author: string;
  /** Emoji que representa el secreto. */
  emoji: string;
  /**
   * Fecha mínima para abrirlo, hora de Monterrey:
   * "YYYY-MM-DD" (abre a las 23:59) o "YYYY-MM-DDTHH:mm",
   * o null si se abre ya.
   */
  openFrom: string | null;
  createdAt: string; // ISO
}

/** Una fecha importante de la pareja (se repite cada año). */
export interface SpecialDate {
  id: string;
  /** Mes y día (MM-DD). */
  date: string;
  title: string;
  emoji: string;
  /** Por qué se celebra (se muestra al abrir el mes). */
  description?: string;
}

/** Un minijuego disponible en la app. */
export interface GameRecord {
  id: string;
  name: string;
  description?: string;
  /** Puntuación más alta alcanzada. */
  highScore?: number;
}

/** Un regalo registrado (físico o digital). */
export interface Gift {
  id: string;
  /** "wish": queremos regalarlo · "given": ya se regaló. */
  kind: "wish" | "given";
  title: string;
  /** Subtítulo corto (ej: "para nuestro aniversario"). */
  subtitle?: string;
  /** Texto largo con la historia del regalo. */
  description?: string;
  /** Quién lo agregó (César o Sofía). */
  author?: string;
  /** Foto del regalo (en vez del emoji). */
  imageUrl?: string;
  /** Emoji como respaldo cuando no hay foto. */
  emoji?: string;
  date: string; // ISO
  createdAt?: string; // ISO
}

/** Una canción de la banda sonora de la pareja. */
export interface Song {
  id: string;
  title: string;
  /** Cantante o grupo. */
  artist: string;
  /** Frase que la persona dedica al enviarla. */
  reason: string;
  /** Quién la manda (César o Sofía). */
  author: string;
  /** URL del audio (enlace directo o archivo subido a la nube). */
  audioUrl: string;
  /** Emoji que representa la canción. */
  emoji?: string;
  createdAt: string; // ISO
}

/** Una cápsula del tiempo: sellada hasta su fecha de apertura. */
export interface TimeCapsule {
  id: string;
  title: string;
  emoji: string;
  /** Fecha ISO en la que se abre ("YYYY-MM-DD"). */
  openDate: string;
  message: string;
  /** Pequeña pista de lo que guarda (visible mientras está sellada). */
  hint?: string;
  /** Quién la escribió (César o Sofía). */
  author?: string;
  createdAt?: string; // ISO
}

/** Una de las fotos del calendario (póster de pareja). */
export interface CalendarPhoto {
  /** Posición en el póster: 1, 2 o 3. */
  slot: number;
  url: string | null;
}

/** Una canción sincronizada desde Spotify (tabla spotify_tracks). */
export interface SpotifySyncTrack {
  id: string;
  spotify_id: string;
  title: string;
  artist: string;
  album: string | null;
  cover_url: string | null;
  preview_url: string | null;
  external_url: string;
  embed_url: string;
  duration_ms: number | null;
  added_at_spotify: string | null;
  created_at: string;
}

/** Una falla o pendiente reportado en el apartado Soporte. */
export interface Ticket {
  id: string;
  /** Qué falla o qué falta arreglar. */
  title: string;
  /** Explicación más larga de la falla. */
  description: string;
  /** "open": falla reportada · "fixed": ya arreglada. */
  status: "open" | "fixed";
  /** Quién la reportó (César o Sofía). */
  author: string;
  /** Quién la arregló (cuando se marca como arreglada). */
  fixedBy?: string;
  /** Cuándo se arregló (ISO). */
  fixedAt?: string;
  createdAt: string; // ISO
}

/* ------------------------------------------------------------------ */
/* LOGROS (dinámicos, con retos y verificación)                        */
/* ------------------------------------------------------------------ */

/** Estado de un logro: pendiente → en revisión → ganado (o fallido). */
export type AchievementStatus = "pending" | "review" | "done" | "failed";

/** Un logro propuesto por uno de los dos (retos con fecha límite). */
export interface Achievement {
  id: string;
  title: string;
  /** Emoji que representa el logro. */
  emoji: string;
  /** Frase que describe cómo completarlo. */
  howto: string;
  /** Quién lo propuso (César o Sofía). */
  author: string;
  /** Fecha límite (YYYY-MM-DD) o null si no expira. */
  deadline: string | null;
  /** Imagen de ilustración del reto (opcional). */
  imageUrl?: string | null;
  status: AchievementStatus;
  /** Quién lo completó (propone la prueba). */
  completedBy?: string;
  /** Cuándo se completó (ISO). */
  completedAt?: string;
  /** Frase que acompañó la prueba. */
  completionPhrase?: string;
  /** Imágenes de prueba de que se completó. */
  images: string[];
  /** Quién lo verificó (la otra persona). */
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string; // ISO
}
