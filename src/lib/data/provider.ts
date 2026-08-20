/**
 * ============================================================
 * CONTRATO DEL PROVEEDOR DE DATOS (DESACOPLADO)
 * ============================================================
 *
 * ¿Qué hace?
 *   Define la interfaz que CUALQUIER base de datos debe cumplir.
 *   La interfaz visual solo habla con este contrato, nunca con
 *   Supabase o Firebase directamente.
 *
 * ¿Cómo funciona?
 *   Existen implementaciones de esta interfaz:
 *     - local-provider.ts → guarda en memoria/localStorage (hoy)
 *     - supabase/         → implementación futura
 *     - firebase/         → implementación futura
 *   El archivo index.ts decide cuál se usa (según .env).
 *
 * ¿Dónde modificarlo?
 *   Solo se modifica si los datos de la app cambian de forma.
 *   Al agregar una sección nueva (ej: cartas), se agrega su
 *   método aquí y en cada implementación.
 *
 * ¿Qué archivos utiliza?
 *   - ./types.ts (tipos que devuelve)
 *   - ./local-provider.ts (implementación local)
 *   - ./index.ts (selección del proveedor activo)
 */

import type {
  Achievement,
  CalendarPhoto,
  GameRecord,
  Gift,
  Letter,
  Memory,
  SecretEntry,
  Song,
  SpecialDate,
  StoryChapter,
  Ticket,
  TimeCapsule,
} from "./types";

/** Contrato mínimo que debe cumplir cualquier base de datos. */
export interface DataProvider {
  /** Nombre del proveedor activo (local, supabase, firebase). */
  readonly name: string;

  /* ---------- Recuerdos ---------- */
  getMemories(): Promise<Memory[]>;
  /**
   * Guarda un recuerdo nuevo.
   * @param memory Datos del recuerdo (sin id).
   * @param file Foto o video opcional; si se incluye, el proveedor
   *   lo sube (nube o navegador) y genera el campo url.
   */
  addMemory(memory: Omit<Memory, "id">, file?: Blob): Promise<Memory>;
  /** Actualiza los datos de un recuerdo (con foto/video nuevo opcional). */
  updateMemory(id: string, patch: Partial<Omit<Memory, "id">>, file?: Blob): Promise<Memory>;
  /** Borra un recuerdo (y su archivo de la nube si fue subido). */
  deleteMemory(id: string): Promise<void>;

  /* ---------- Historia ---------- */
  getStoryChapters(): Promise<StoryChapter[]>;
  addStoryChapter(chapter: Omit<StoryChapter, "id">): Promise<StoryChapter>;
  /** Actualiza los datos de un capítulo. */
  updateStoryChapter(
    id: string,
    patch: Partial<Omit<StoryChapter, "id">>,
  ): Promise<StoryChapter>;
  /** Borra un capítulo de la historia. */
  deleteStoryChapter(id: string): Promise<void>;

  /* ---------- Cartas ---------- */
  getLetters(): Promise<Letter[]>;
  addLetter(letter: Omit<Letter, "id" | "createdAt" | "read">): Promise<Letter>;
  markLetterAsRead(id: string): Promise<void>;

  /* ---------- Secretos ---------- */
  getSecrets(): Promise<SecretEntry[]>;
  addSecret(secret: Omit<SecretEntry, "id" | "createdAt">): Promise<SecretEntry>;
  /** Actualiza los datos de un secreto. */
  updateSecret(id: string, patch: Partial<Omit<SecretEntry, "id" | "createdAt">>): Promise<SecretEntry>;
  /** Borra un secreto. */
  deleteSecret(id: string): Promise<void>;

  /* ---------- Cápsulas del tiempo ---------- */
  getCapsules(): Promise<TimeCapsule[]>;
  addCapsule(capsule: Omit<TimeCapsule, "id" | "createdAt">): Promise<TimeCapsule>;
  updateCapsule(id: string, patch: Partial<Omit<TimeCapsule, "id" | "createdAt">>): Promise<TimeCapsule>;
  deleteCapsule(id: string): Promise<void>;

  /* ---------- Fotos del calendario ---------- */
  getCalendarPhotos(): Promise<CalendarPhoto[]>;
  saveCalendarPhoto(slot: number, file: Blob): Promise<CalendarPhoto>;

  /* ---------- Fechas importantes ---------- */
  getSpecialDates(): Promise<SpecialDate[]>;
  addSpecialDate(date: Omit<SpecialDate, "id">): Promise<SpecialDate>;
  deleteSpecialDate(id: string): Promise<void>;

  /* ---------- Juegos ---------- */
  getGames(): Promise<GameRecord[]>;
  updateHighScore(id: string, score: number): Promise<void>;

  /* ---------- Regalos ---------- */
  getGifts(): Promise<Gift[]>;
  /**
   * Guarda un regalo nuevo.
   * @param gift Datos del regalo (sin id).
   * @param imageFile Foto opcional; si se incluye, el proveedor
   *   la sube (nube o navegador) y genera imageUrl.
   */
  addGift(gift: Omit<Gift, "id" | "createdAt">, imageFile?: Blob): Promise<Gift>;
  /** Actualiza los datos de un regalo (con foto nueva opcional). */
  updateGift(id: string, patch: Partial<Omit<Gift, "id" | "createdAt">>, imageFile?: Blob): Promise<Gift>;
  /** Borra un regalo (y su foto de la nube si fue subida). */
  deleteGift(id: string): Promise<void>;

  /* ---------- Canciones ---------- */
  getSongs(): Promise<Song[]>;
  /**
   * Guarda una canción nueva.
   * @param song Datos de la canción (sin id ni createdAt).
   * @param audioFile Archivo de audio (mp3) ya listo para guardar;
   *   si se incluye, el proveedor lo sube y genera audioUrl.
   */
  addSong(song: Omit<Song, "id" | "createdAt">, audioFile?: Blob): Promise<Song>;
  /** Actualiza los datos de una canción (y opcionalmente su audio). */
  updateSong(
    id: string,
    song: Partial<Omit<Song, "id" | "createdAt">>,
    audioFile?: Blob,
  ): Promise<Song>;
  /** Borra una canción (y su audio de la nube si fue subido). */
  deleteSong(id: string): Promise<void>;

  /* ---------- Logros ---------- */
  getAchievements(): Promise<Achievement[]>;
  /** Crea un logro nuevo (estado inicial: pendiente). */
  addAchievement(
    achievement: Omit<Achievement, "id" | "createdAt">,
  ): Promise<Achievement>;
  /** Actualiza cualquier campo de un logro (estado, pruebas, verificación…). */
  updateAchievement(
    id: string,
    patch: Partial<Omit<Achievement, "id" | "createdAt">>,
  ): Promise<Achievement>;
  /** Borra un logro. */
  deleteAchievement(id: string): Promise<void>;
  /**
   * Sube una imagen (prueba de un logro) y devuelve su URL.
   * Con el proveedor local se comprime y guarda en el navegador.
   */
  uploadAchievementImage(file: Blob): Promise<string>;

  /* ---------- Soporte (tickets de fallas) ---------- */
  getTickets(): Promise<Ticket[]>;
  /** Reporta una falla nueva (estado inicial: abierta). */
  addTicket(ticket: Omit<Ticket, "id" | "createdAt">): Promise<Ticket>;
  /** Actualiza una falla (estado, quién la arregló, texto…). */
  updateTicket(id: string, patch: Partial<Omit<Ticket, "id" | "createdAt">>): Promise<Ticket>;
  /** Borra una falla del registro. */
  deleteTicket(id: string): Promise<void>;
}
