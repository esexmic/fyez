/**
 * ============================================================
 * PÁGINA DE NUESTRA HISTORIA — EL LIBRO (FASE 3)
 * ============================================================
 *
 * ¿Qué hace?
 *   El libro de la historia: encabezado + línea de tiempo de
 *   capítulos. El fondo es oscuro y fijo (noche tranquila):
 *   abrir un capítulo NO cambia el cielo de la página.
 *
 * ¿Cómo funciona?
 *   - SetAtmosphere activa el cielo de la página.
 *   - HistoriaTimeline gestiona la línea de tiempo y el lector.
 *
 * ¿Dónde modificarlo?
 *   - Contenido: src/data/history/chapters.ts
 *   - Componentes: src/components/historia/
 *
 * ¿Qué archivos utiliza?
 *   - src/components/atmosphere/SetAtmosphere.tsx
 *   - src/components/historia/HistoriaIntro.tsx
 *   - src/components/historia/HistoriaTimeline.tsx
 */

import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { HistoriaIntro } from "@/components/historia/HistoriaIntro";
import { HistoriaTimeline } from "@/components/historia/HistoriaTimeline";

export default function HistoriaPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="noche-tranquila" />
      <HistoriaIntro />
      <HistoriaTimeline />
    </main>
  );
}
