/**
 * ============================================================
 * PÁGINA DE RECUERDOS — LA GALERÍA (FASE 4)
 * ============================================================
 *
 * ¿Qué hace?
 *   La galería de momentos bajo el cielo del atardecer.
 *
 * ¿Cómo funciona?
 *   - SetAtmosphere activa el cielo de la página.
 *   - MemoriesGallery gestiona filtros, rejilla y lightbox.
 *
 * ¿Dónde modificarlo?
 *   - Contenido: src/data/memories.ts
 *   - Componentes: src/components/recuerdos/
 *
 * ¿Qué archivos utiliza?
 *   - src/components/atmosphere/SetAtmosphere.tsx
 *   - src/components/recuerdos/MemoriesIntro.tsx
 *   - src/components/recuerdos/MemoriesGallery.tsx
 */

import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { MemoriesGallery } from "@/components/recuerdos/MemoriesGallery";
import { MemoriesIntro } from "@/components/recuerdos/MemoriesIntro";

export default function RecuerdosPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="atardecer" />
      <MemoriesIntro />
      <MemoriesGallery />
    </main>
  );
}
