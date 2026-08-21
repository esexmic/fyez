/**
 * ============================================================
 * SUPABASE — PROVEEDOR DE NUBE (ACTIVO con DATABASE_PROVIDER=supabase)
 * ============================================================
 *
 * ¿Qué hace?
 *   Implementación del contrato DataProvider usando la API
 *   oficial de Supabase (@supabase/supabase-js). Las cartas
 *   (y en el futuro el resto de colecciones) se guardan en la
 *   nube y se ven desde cualquier dispositivo.
 *
 * ¿Cómo funciona?
 *   1. Instalar: npm install @supabase/supabase-js
 *   2. Crear las tablas: ejecutar docs/supabase-schema.sql en
 *      Supabase > SQL Editor.
 *   3. Poner DATABASE_PROVIDER=supabase y las claves en .env.local
 *      (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).
 *   4. src/lib/data/index.ts ya activa este proveedor.
 *
 * ⚠️ Nota de seguridad
 *   Las tablas se crean CON Row Level Security activa y con una
 *   política abierta para la clave anónima (using true / with
 *   check true), porque es una app personal de pareja. Las
 *   políticas se crean en docs/supabase-schema.sql. Si algún día
 *   la app es pública, cambia las políticas por unas por usuario.
 *
 * ¿Dónde modificarlo?
 *   - Cambios de estructura: actualizar aquí y en provider.ts.
 *
 * ¿Qué archivos utiliza?
 *   - ../provider.ts (contrato que implementa)
 *   - ../index.ts (selección del proveedor activo)
 *   - ../types.ts (tipos de dominio)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { DataProvider } from "../provider";
import type {
  Achievement,
  CalendarPhoto,
  GameRecord,
  Gift,
  Letter,
  Memory,
  SecretEntry,
  Song,
  SpotifySyncTrack,
  SpecialDate,
  StoryChapter,
  Ticket,
  TimeCapsule,
} from "../types";

/** Bucket de Storage donde viven los audios subidos. */
const SONGS_BUCKET = "songs";

/** Bucket de Storage para las imágenes de prueba de logros. */
const LOGROS_BUCKET = "logros";

/** Bucket de Storage para las fotos de los regalos. */
const REGALOS_BUCKET = "regalos";

/** Bucket de Storage para fotos y videos de los recuerdos. */
const RECUERDOS_BUCKET = "recuerdos";

/** Bucket de Storage para las fotos del calendario (póster). */
const CALENDARIO_BUCKET = "calendario";

/** Cliente Supabase (se crea solo al primer uso, ya en el navegador). */
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Supabase: faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
      );
    }
    client = createClient(url, anonKey);
  }
  return client;
}

/* ---------- Mapeo fila (snake_case) -> tipo (camelCase) ---------- */

interface MemoryRow {
  id: string;
  title: string;
  description: string | null;
  kind: Memory["kind"];
  url: string | null;
  date: string;
  emoji: string | null;
  tint: string | null;
  tags: string[] | null;
  author: string | null;
}

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    kind: row.kind,
    url: row.url ?? undefined,
    date: row.date,
    emoji: row.emoji ?? undefined,
    tint: row.tint ?? undefined,
    tags: row.tags ?? undefined,
    author: row.author ?? undefined,
  };
}

interface ChapterRow {
  id: string;
  title: string;
  date: string;
  content: string;
  image_url: string | null;
  atmosphere: string | null;
  quote: string | null;
  author: string | null;
}

function toChapter(row: ChapterRow): StoryChapter {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    content: row.content,
    imageUrl: row.image_url ?? undefined,
    atmosphere: row.atmosphere ?? undefined,
    quote: row.quote ?? undefined,
    author: row.author ?? undefined,
  };
}

interface LetterRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  author: string | null;
}

function toLetter(row: LetterRow): Letter {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    read: row.read,
    author: row.author ?? undefined,
  };
}

interface SecretRow {
  id: string;
  title: string;
  message: string;
  author: string;
  emoji: string | null;
  open_from: string | null;
  created_at: string;
}

function toSecret(row: SecretRow): SecretEntry {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    author: row.author,
    emoji: row.emoji ?? "🤫",
    openFrom: row.open_from,
    createdAt: row.created_at,
  };
}

interface SpecialDateRow {
  id: string;
  date: string;
  title: string;
  emoji: string | null;
  description: string | null;
}

function toSpecialDate(row: SpecialDateRow): SpecialDate {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    emoji: row.emoji ?? "💗",
    description: row.description ?? undefined,
  };
}

interface GameRow {
  id: string;
  name: string;
  description: string | null;
  high_score: number | null;
}

function toGame(row: GameRow): GameRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    highScore: row.high_score ?? undefined,
  };
}

/* ---------- Cápsulas del tiempo ---------- */

interface CapsuleRow {
  id: string;
  title: string;
  emoji: string | null;
  open_date: string;
  message: string;
  hint: string | null;
  author: string | null;
  created_at: string;
}

function toCapsule(row: CapsuleRow): TimeCapsule {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji ?? "🕰️",
    openDate: row.open_date,
    message: row.message,
    hint: row.hint ?? undefined,
    author: row.author ?? undefined,
    createdAt: row.created_at,
  };
}

/* ---------- Fotos del calendario ---------- */

interface CalendarPhotoRow {
  slot: number;
  url: string | null;
}

function toCalendarPhoto(row: CalendarPhotoRow): CalendarPhoto {
  return { slot: row.slot, url: row.url };
}

interface GiftRow {
  id: string;
  kind: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author: string | null;
  image_url: string | null;
  emoji: string | null;
  date: string;
  created_at: string | null;
}

function toGift(row: GiftRow): Gift {
  return {
    id: row.id,
    kind: row.kind === "wish" ? "wish" : "given",
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    author: row.author ?? undefined,
    imageUrl: row.image_url ?? undefined,
    emoji: row.emoji ?? undefined,
    date: row.date,
    createdAt: row.created_at ?? undefined,
  };
}

interface SongRow {
  id: string;
  title: string;
  artist: string;
  reason: string;
  author: string;
  emoji: string | null;
  audio_url: string;
  created_at: string;
}

function toSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    reason: row.reason,
    author: row.author,
    emoji: row.emoji ?? undefined,
    audioUrl: row.audio_url,
    createdAt: row.created_at,
  };
}

interface AchievementRow {
  id: string;
  title: string;
  emoji: string | null;
  howto: string;
  author: string;
  deadline: string | null;
  image_url: string | null;
  status: Achievement["status"];
  completed_by: string | null;
  completed_at: string | null;
  completion_phrase: string | null;
  images: string[] | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

function toAchievement(row: AchievementRow): Achievement {
  return {
    id: row.id,
    title: row.title,
    emoji: row.emoji ?? "🏅",
    howto: row.howto,
    author: row.author,
    deadline: row.deadline,
    imageUrl: row.image_url ?? undefined,
    status: row.status,
    completedBy: row.completed_by ?? undefined,
    completedAt: row.completed_at ?? undefined,
    completionPhrase: row.completion_phrase ?? undefined,
    images: row.images ?? [],
    verifiedBy: row.verified_by ?? undefined,
    verifiedAt: row.verified_at ?? undefined,
    createdAt: row.created_at,
  };
}

/**
 * Lanza un error legible si la respuesta de Supabase falla.
 * Los errores típicos llevan una pista de cómo arreglarlos
 * (ejecutar el SQL de docs/supabase-schema.sql).
 */
function ensureOk(error: unknown): void {
  if (!error) return;
  if (typeof error === "object" && error !== null) {
    const record = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const message =
      typeof record.message === "string" && record.message.trim().length > 0
        ? record.message
        : String(error);
    let extra = "";
    if (/row-level security/i.test(message)) {
      extra =
        " (falta la política de RLS: ejecuta todo docs/supabase-schema.sql — crea las políticas de cada tabla)";
    } else if (/could not find the table|does not exist/i.test(message)) {
      extra =
        " (falta la tabla: ejecuta todo docs/supabase-schema.sql)";
    } else if (typeof record.hint === "string" && record.hint.trim().length > 0) {
      extra = ` (${record.hint})`;
    } else if (typeof record.details === "string" && record.details.trim().length > 0) {
      extra = ` (${record.details})`;
    }
    throw new Error(`Supabase: ${message}${extra}`);
  }
  throw new Error(`Supabase: ${String(error)}`);
}

/* ---------- Proveedor Supabase ---------- */

/** Fila de la tabla `tickets` (snake_case) -> Ticket (camelCase). */
interface TicketRow {
  id: string;
  title: string;
  description: string;
  status: Ticket["status"];
  author: string;
  fixed_by: string | null;
  fixed_at: string | null;
  created_at: string;
}

function toTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    author: row.author,
    fixedBy: row.fixed_by ?? undefined,
    fixedAt: row.fixed_at ?? undefined,
    createdAt: row.created_at,
  };
}

/** Elige la extensión del archivo según su tipo MIME. */
function storageExtension(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("quicktime")) return "mov";
  return "jpg";
}

export const supabaseProvider: DataProvider = {
  name: "supabase",

  /* ---------- Recuerdos ---------- */
  async getMemories() {
    const { data, error } = await getClient().from("memories").select("*").order("date");
    ensureOk(error);
    return (data as MemoryRow[]).map(toMemory);
  },

  async addMemory(memory, file) {
    let url = memory.url;
    if (file) {
      const path = `recuerdos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${storageExtension(file.type)}`;
      const { error: uploadError } = await getClient()
        .storage.from(RECUERDOS_BUCKET)
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      ensureOk(uploadError);
      url = getClient().storage.from(RECUERDOS_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await getClient()
      .from("memories")
      .insert({
        title: memory.title,
        description: memory.description ?? null,
        kind: memory.kind,
        url: url ?? null,
        date: memory.date,
        emoji: memory.emoji ?? null,
        tint: memory.tint ?? null,
        tags: memory.tags ?? null,
        author: memory.author ?? null,
      })
      .select()
      .single();
    ensureOk(error);
    return toMemory(data as MemoryRow);
  },

  async deleteMemory(id) {
    const { data, error } = await getClient().from("memories").select("url").eq("id", id).maybeSingle();
    ensureOk(error);
    const url = (data as { url: string | null } | null)?.url;
    if (url) {
      const path = decodeURIComponent(url.split(`/object/public/${RECUERDOS_BUCKET}/`)[1] ?? "");
      if (path) {
        const { error: removeError } = await getClient().storage.from(RECUERDOS_BUCKET).remove([path]);
        ensureOk(removeError);
      }
    }
    const { error: deleteError } = await getClient().from("memories").delete().eq("id", id);
    ensureOk(deleteError);
  },

  async updateMemory(id, patch, file) {
    let url = patch.url;
    if (file) {
      const path = `recuerdos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${storageExtension(file.type)}`;
      const { error: uploadError } = await getClient()
        .storage.from(RECUERDOS_BUCKET)
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      ensureOk(uploadError);
      url = getClient().storage.from(RECUERDOS_BUCKET).getPublicUrl(path).data.publicUrl;
    }
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.description !== undefined) update.description = patch.description ?? null;
    if (patch.kind !== undefined) update.kind = patch.kind;
    if (patch.date !== undefined) update.date = patch.date;
    if (patch.emoji !== undefined) update.emoji = patch.emoji ?? null;
    if (patch.tint !== undefined) update.tint = patch.tint ?? null;
    if (patch.tags !== undefined) update.tags = patch.tags ?? null;
    if (patch.author !== undefined) update.author = patch.author ?? null;
    if (url !== undefined) update.url = url;

    const { data, error } = await getClient()
      .from("memories")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toMemory(data as MemoryRow);
  },

  /* ---------- Historia ---------- */
  async getStoryChapters() {
    const { data, error } = await getClient().from("chapters").select("*").order("date");
    ensureOk(error);
    return (data as ChapterRow[]).map(toChapter);
  },

  async addStoryChapter(chapter) {
    const { data, error } = await getClient()
      .from("chapters")
      .insert({
        title: chapter.title,
        date: chapter.date,
        content: chapter.content,
        image_url: chapter.imageUrl ?? null,
        atmosphere: chapter.atmosphere ?? null,
        quote: chapter.quote ?? null,
        author: chapter.author ?? null,
      })
      .select()
      .single();
    ensureOk(error);
    return toChapter(data as ChapterRow);
  },

  async updateStoryChapter(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.date !== undefined) update.date = patch.date;
    if (patch.content !== undefined) update.content = patch.content;
    if (patch.imageUrl !== undefined) update.image_url = patch.imageUrl ?? null;
    if (patch.atmosphere !== undefined) update.atmosphere = patch.atmosphere ?? null;
    if (patch.quote !== undefined) update.quote = patch.quote ?? null;
    if (patch.author !== undefined) update.author = patch.author ?? null;

    const { data, error } = await getClient()
      .from("chapters")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toChapter(data as ChapterRow);
  },

  async deleteStoryChapter(id) {
    const { error } = await getClient().from("chapters").delete().eq("id", id);
    ensureOk(error);
  },

  /* ---------- Cartas ---------- */
  async getLetters() {
    const { data, error } = await getClient().from("letters").select("*").order("created_at");
    ensureOk(error);
    return (data as LetterRow[]).map(toLetter);
  },

  async addLetter(letter) {
    const { data, error } = await getClient()
      .from("letters")
      .insert({ title: letter.title, content: letter.content, author: letter.author ?? null })
      .select()
      .single();
    ensureOk(error);
    return toLetter(data as LetterRow);
  },

  async markLetterAsRead(id) {
    const { error } = await getClient().from("letters").update({ read: true }).eq("id", id);
    ensureOk(error);
  },

  /* ---------- Secretos ---------- */
  async getSecrets() {
    const { data, error } = await getClient().from("secretos").select("*").order("created_at");
    ensureOk(error);
    return (data as SecretRow[]).map(toSecret);
  },

  async addSecret(secret) {
    const { data, error } = await getClient()
      .from("secretos")
      .insert({
        title: secret.title,
        message: secret.message,
        author: secret.author,
        emoji: secret.emoji,
        open_from: secret.openFrom,
      })
      .select()
      .single();
    ensureOk(error);
    return toSecret(data as SecretRow);
  },

  async updateSecret(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.message !== undefined) update.message = patch.message;
    if (patch.author !== undefined) update.author = patch.author;
    if (patch.emoji !== undefined) update.emoji = patch.emoji;
    if (patch.openFrom !== undefined) update.open_from = patch.openFrom;

    const { data, error } = await getClient()
      .from("secretos")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toSecret(data as SecretRow);
  },

  async deleteSecret(id) {
    const { error } = await getClient().from("secretos").delete().eq("id", id);
    ensureOk(error);
  },

  /* ---------- Cápsulas del tiempo ---------- */
  async getCapsules() {
    const { data, error } = await getClient().from("capsulas").select("*").order("open_date");
    ensureOk(error);
    return (data as CapsuleRow[]).map(toCapsule);
  },

  async addCapsule(capsule) {
    const { data, error } = await getClient()
      .from("capsulas")
      .insert({
        title: capsule.title,
        emoji: capsule.emoji,
        open_date: capsule.openDate,
        message: capsule.message,
        hint: capsule.hint ?? null,
        author: capsule.author ?? null,
      })
      .select()
      .single();
    ensureOk(error);
    return toCapsule(data as CapsuleRow);
  },

  async updateCapsule(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.emoji !== undefined) update.emoji = patch.emoji;
    if (patch.openDate !== undefined) update.open_date = patch.openDate;
    if (patch.message !== undefined) update.message = patch.message;
    if (patch.hint !== undefined) update.hint = patch.hint ?? null;
    if (patch.author !== undefined) update.author = patch.author ?? null;

    const { data, error } = await getClient()
      .from("capsulas")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toCapsule(data as CapsuleRow);
  },

  async deleteCapsule(id) {
    const { error } = await getClient().from("capsulas").delete().eq("id", id);
    ensureOk(error);
  },

  /* ---------- Fotos del calendario ---------- */
  async getCalendarPhotos() {
    const { data, error } = await getClient().from("calendario").select("*");
    ensureOk(error);
    return (data as CalendarPhotoRow[]).map(toCalendarPhoto);
  },

  async saveCalendarPhoto(slot, file) {
    const extension = file.type === "image/png" ? "png" : "jpg";
    const path = `calendario/${slot}-${Date.now()}.${extension}`;
    const { error: uploadError } = await getClient()
      .storage.from(CALENDARIO_BUCKET)
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    ensureOk(uploadError);
    const url = getClient().storage.from(CALENDARIO_BUCKET).getPublicUrl(path).data.publicUrl;

    const { data, error } = await getClient()
      .from("calendario")
      .upsert({ slot, url }, { onConflict: "slot" })
      .select()
      .single();
    ensureOk(error);
    return toCalendarPhoto(data as CalendarPhotoRow);
  },
  async getSpecialDates() {
    const { data, error } = await getClient().from("fechas").select("*").order("date");
    ensureOk(error);
    return (data as SpecialDateRow[]).map(toSpecialDate);
  },

  async addSpecialDate(date) {
    const { data, error } = await getClient()
      .from("fechas")
      .insert({
        date: date.date,
        title: date.title,
        emoji: date.emoji,
        description: date.description ?? null,
      })
      .select()
      .single();
    ensureOk(error);
    return toSpecialDate(data as SpecialDateRow);
  },

  async deleteSpecialDate(id) {
    const { error } = await getClient().from("fechas").delete().eq("id", id);
    ensureOk(error);
  },

  /* ---------- Juegos ---------- */
  async getGames() {
    const { data, error } = await getClient().from("games").select("*").order("id");
    ensureOk(error);
    return (data as GameRow[]).map(toGame);
  },

  async updateHighScore(id, score) {
    const { data, error } = await getClient()
      .from("games")
      .select("high_score")
      .eq("id", id)
      .maybeSingle();
    ensureOk(error);
    const current = (data as { high_score: number | null } | null)?.high_score ?? 0;
    const next = Math.max(current, score);
    const { error: upsertError } = await getClient()
      .from("games")
      .upsert({ id, high_score: next }, { onConflict: "id" });
    ensureOk(upsertError);
  },

  /* ---------- Regalos ---------- */
  async getGifts() {
    const { data, error } = await getClient().from("gifts").select("*").order("date");
    ensureOk(error);
    return (data as GiftRow[]).map(toGift);
  },

  async addGift(gift, imageFile) {
    let imageUrl = gift.imageUrl;
    if (imageFile) {
      const extension = imageFile.type === "image/png" ? "png" : "jpg";
      const path = `regalos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const { error: uploadError } = await getClient()
        .storage.from(REGALOS_BUCKET)
        .upload(path, imageFile, { contentType: imageFile.type || "image/jpeg", upsert: false });
      ensureOk(uploadError);
      imageUrl = getClient().storage.from(REGALOS_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await getClient()
      .from("gifts")
      .insert({
        kind: gift.kind,
        title: gift.title,
        subtitle: gift.subtitle ?? null,
        description: gift.description ?? null,
        author: gift.author ?? null,
        image_url: imageUrl ?? null,
        emoji: gift.emoji ?? null,
        date: gift.date,
      })
      .select()
      .single();
    ensureOk(error);
    return toGift(data as GiftRow);
  },

  async updateGift(id, patch, imageFile) {
    let imageUrl = patch.imageUrl;
    if (imageFile) {
      const extension = imageFile.type === "image/png" ? "png" : "jpg";
      const path = `regalos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const { error: uploadError } = await getClient()
        .storage.from(REGALOS_BUCKET)
        .upload(path, imageFile, { contentType: imageFile.type || "image/jpeg", upsert: false });
      ensureOk(uploadError);
      imageUrl = getClient().storage.from(REGALOS_BUCKET).getPublicUrl(path).data.publicUrl;
    }
    const update: Record<string, unknown> = {};
    if (patch.kind !== undefined) update.kind = patch.kind;
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.subtitle !== undefined) update.subtitle = patch.subtitle ?? null;
    if (patch.description !== undefined) update.description = patch.description ?? null;
    if (patch.author !== undefined) update.author = patch.author ?? null;
    if (patch.emoji !== undefined) update.emoji = patch.emoji ?? null;
    if (patch.date !== undefined) update.date = patch.date;
    if (imageUrl !== undefined) update.image_url = imageUrl;

    const { data, error } = await getClient()
      .from("gifts")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toGift(data as GiftRow);
  },

  async deleteGift(id) {
    const { data, error } = await getClient().from("gifts").select("image_url").eq("id", id).maybeSingle();
    ensureOk(error);
    const imageUrl = (data as { image_url: string | null } | null)?.image_url;
    if (imageUrl) {
      const path = decodeURIComponent(imageUrl.split(`/object/public/${REGALOS_BUCKET}/`)[1] ?? "");
      if (path) {
        const { error: removeError } = await getClient().storage.from(REGALOS_BUCKET).remove([path]);
        ensureOk(removeError);
      }
    }
    const { error: deleteError } = await getClient().from("gifts").delete().eq("id", id);
    ensureOk(deleteError);
  },

  /* ---------- Canciones ---------- */
  async getSongs() {
    const { data, error } = await getClient().from("songs").select("*").order("created_at");
    ensureOk(error);
    return (data as SongRow[]).map(toSong);
  },

  async addSong(song, audioFile) {
    let audioUrl = song.audioUrl;

    // Si viene un archivo de audio, se sube a Storage y se usa su URL pública.
    if (audioFile) {
      const path = `songs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
      const { error: uploadError } = await getClient()
        .storage.from(SONGS_BUCKET)
        .upload(path, audioFile, { contentType: "audio/mpeg", upsert: false });
      ensureOk(uploadError);
      audioUrl = getClient().storage.from(SONGS_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await getClient()
      .from("songs")
      .insert({
        title: song.title,
        artist: song.artist,
        reason: song.reason,
        author: song.author,
        emoji: song.emoji ?? null,
        audio_url: audioUrl,
      })
      .select()
      .single();
    ensureOk(error);
    return toSong(data as SongRow);
  },

  async updateSong(id, song, audioFile) {
    // Si se sube un audio nuevo, se guarda en Storage y se usa su URL.
    let audioUrl = song.audioUrl;
    if (audioFile) {
      const path = `songs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
      const { error: uploadError } = await getClient()
        .storage.from(SONGS_BUCKET)
        .upload(path, audioFile, { contentType: "audio/mpeg", upsert: false });
      ensureOk(uploadError);
      audioUrl = getClient().storage.from(SONGS_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await getClient()
      .from("songs")
      .update({
        title: song.title,
        artist: song.artist,
        reason: song.reason,
        author: song.author,
        emoji: song.emoji ?? null,
        ...(audioUrl ? { audio_url: audioUrl } : {}),
      })
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toSong(data as SongRow);
  },

  async deleteSong(id) {
    const { data, error } = await getClient().from("songs").select("audio_url").eq("id", id).maybeSingle();
    ensureOk(error);
    const audioUrl = (data as { audio_url: string | null } | null)?.audio_url;
    if (audioUrl) {
      const path = decodeURIComponent(audioUrl.split(`/object/public/${SONGS_BUCKET}/`)[1] ?? "");
      if (path) {
        const { error: removeError } = await getClient().storage.from(SONGS_BUCKET).remove([path]);
        ensureOk(removeError);
      }
    }
    const { error: deleteError } = await getClient().from("songs").delete().eq("id", id);
    ensureOk(deleteError);
  },

  /* ---------- Logros ---------- */
  async getAchievements() {
    const { data, error } = await getClient().from("achievements").select("*").order("created_at");
    ensureOk(error);
    return (data as AchievementRow[]).map(toAchievement);
  },

  async addAchievement(achievement) {
    const { data, error } = await getClient()
      .from("achievements")
      .insert({
        title: achievement.title,
        emoji: achievement.emoji,
        howto: achievement.howto,
        author: achievement.author,
        deadline: achievement.deadline,
        image_url: achievement.imageUrl ?? null,
        status: achievement.status,
        images: achievement.images,
      })
      .select()
      .single();
    ensureOk(error);
    return toAchievement(data as AchievementRow);
  },

  async updateAchievement(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.emoji !== undefined) update.emoji = patch.emoji;
    if (patch.howto !== undefined) update.howto = patch.howto;
    if (patch.author !== undefined) update.author = patch.author;
    if (patch.deadline !== undefined) update.deadline = patch.deadline;
    if (patch.imageUrl !== undefined) update.image_url = patch.imageUrl ?? null;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.completedBy !== undefined) update.completed_by = patch.completedBy ?? null;
    if (patch.completedAt !== undefined) update.completed_at = patch.completedAt ?? null;
    if (patch.completionPhrase !== undefined) update.completion_phrase = patch.completionPhrase ?? null;
    if (patch.images !== undefined) update.images = patch.images;
    if (patch.verifiedBy !== undefined) update.verified_by = patch.verifiedBy ?? null;
    if (patch.verifiedAt !== undefined) update.verified_at = patch.verifiedAt ?? null;

    const { data, error } = await getClient()
      .from("achievements")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toAchievement(data as AchievementRow);
  },

  async deleteAchievement(id) {
    const { error } = await getClient().from("achievements").delete().eq("id", id);
    ensureOk(error);
  },

  async uploadAchievementImage(file) {
    const extension = file.type === "image/png" ? "png" : "jpg";
    const path = `logros/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const { error } = await getClient()
      .storage.from(LOGROS_BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    ensureOk(error);
    return getClient().storage.from(LOGROS_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  /* ---------- Soporte (tickets de fallas) ---------- */
  async getTickets() {
    const { data, error } = await getClient().from("tickets").select("*").order("created_at");
    ensureOk(error);
    return (data as TicketRow[]).map(toTicket);
  },

  async addTicket(ticket) {
    const { data, error } = await getClient()
      .from("tickets")
      .insert({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        author: ticket.author,
      })
      .select()
      .single();
    ensureOk(error);
    return toTicket(data as TicketRow);
  },

  async updateTicket(id, patch) {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.author !== undefined) update.author = patch.author;
    if (patch.fixedBy !== undefined) update.fixed_by = patch.fixedBy ?? null;
    if (patch.fixedAt !== undefined) update.fixed_at = patch.fixedAt ?? null;

    const { data, error } = await getClient()
      .from("tickets")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    ensureOk(error);
    return toTicket(data as TicketRow);
  },

  async deleteTicket(id) {
    const { error } = await getClient().from("tickets").delete().eq("id", id);
    ensureOk(error);
  },

  async getSpotifyTracks() {
    const { data, error } = await getClient()
      .from("spotify_tracks")
      .select("*")
      .order("created_at", { ascending: false });
    ensureOk(error);
    return (data ?? []) as unknown as SpotifySyncTrack[];
  },
};