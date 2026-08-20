/**
 * ============================================================
 * CONVERTIR AUDIO — MP4/VIDEO → MP3 (en el navegador)
 * ============================================================
 *
 * ¿Qué hace?
 *   Convierte un archivo de video (mp4, webm...) a mp3 usando
 *   ffmpeg.wasm, todo dentro del navegador: el archivo nunca
 *   sale de la computadora. Si el archivo ya es mp3 u otro
 *   audio soportado, se devuelve tal cual.
 *
 * ¿Cómo funciona?
 *   - ffmpeg.wasm se carga desde CDN solo la primera vez que se
 *     necesita (bajada única de ~30MB en memoria, no se instala
 *     nada en tu equipo).
 *   - La conversión es a 128kbps, buena calidad sin peso de más.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/musica/SongComposer.tsx
 */

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
const FFMPEG_BASE = "https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/umd";

let loadPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

/** Carga ffmpeg.wasm una sola vez (lazy). */
function getFfmpeg(): Promise<import("@ffmpeg/ffmpeg").FFmpeg> {
  if (!loadPromise) {
    loadPromise = import("@ffmpeg/ffmpeg").then(async ({ FFmpeg }) => {
      const { toBlobURL } = await import("@ffmpeg/util");
      const instance = new FFmpeg();
      await instance.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${FFMPEG_BASE}/worker.js`, "text/javascript"),
      });
      return instance;
    });
  }
  return loadPromise;
}

/** ¿El archivo es video (necesita conversión)? */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/** ¿El archivo ya es audio reproducible? */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/");
}

/** Convierte un video a mp3. Si ya es audio, devuelve el archivo original. */
export async function toMp3Blob(file: File): Promise<Blob> {
  if (!isVideoFile(file)) {
    if (file.type === "audio/mp3" || file.type === "audio/mpeg" || file.name.endsWith(".mp3")) {
      return file;
    }
    // Otro audio (ogg, wav, m4a...): se normaliza a mp3 también.
  }

  const ffmpeg = await getFfmpeg();
  const { fetchFile } = await import("@ffmpeg/util");

  await ffmpeg.writeFile("input", await fetchFile(file));
  await ffmpeg.exec(["-i", "input", "-vn", "-codec:a", "libmp3lame", "-b:a", "128k", "output.mp3"]);
  const data = await ffmpeg.readFile("output.mp3");

  await ffmpeg.deleteFile("input");
  await ffmpeg.deleteFile("output.mp3");

  if (typeof data === "string") {
    throw new Error("La conversión no devolvió audio válido.");
  }
  const copy = new Uint8Array(data);
  return new Blob([copy.buffer], { type: "audio/mpeg" });
}

/** Devuelve la primera canción de un archivo de audio (usado por el input). */
export function getFileNameWithoutExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index > 0 ? name.slice(0, index) : name;
}