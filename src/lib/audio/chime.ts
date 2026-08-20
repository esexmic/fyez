/**
 * ============================================================
 * CHIME — SONIDOS SUAVES (Web Audio, sin archivos)
 * ============================================================
 *
 * ¿Qué hace?
 *   Pequeños sonidos cálidos para el libro de historia: un
 *   carrillón suave al abrir un capítulo y uno más tenue al
 *   cerrarlo. Se generan en vivo (sin archivos de audio).
 *
 * ¿Cómo funciona?
 *   Usa la Web Audio API: un oscilador senoidal con un
 *   crecimiento y decaimiento muy suaves, a volumen bajo.
 *   El AudioContext se crea en el primer clic (permiso del
 *   navegador) y se reutiliza.
 *
 * ¿Dónde modificarlo?
 *   - Tono y suavidad: valores de frecuencia y ganancia.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/historia/ChapterReader.tsx (abrir/cerrar)
 */

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Reproduce un carrillón suave.
 * @param gentle true = tono más tenue (para cerrar).
 */
export function playChime(gentle = false): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  // Tono base: Mi (agradable) o Do (tenue)...
  osc.frequency.setValueAtTime(gentle ? 523.25 : 659.25, now);
  osc.frequency.exponentialRampToValueAtTime(gentle ? 587.33 : 880, now + 0.28);

  // Envoltura: sube despacio y decae con calma (muy bajo volumen).
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gentle ? 0.035 : 0.055, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.7);
}
