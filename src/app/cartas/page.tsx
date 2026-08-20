/**
 * ============================================================
 * PÁGINA DE CARTAS (FASE 7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Las cartas escritas para ti, bajo el cielo de lluvia.
 *
 * ¿Cómo funciona?
 *   - SetAtmosphere activa el cielo de la página.
 *   - LettersGallery gestiona la lista y la apertura de sobres.
 *
 * ¿Dónde modificarlo?
 *   - Contenido: src/data/letters.ts
 *   - Componentes: src/components/cartas/
 *
 * ¿Qué archivos utiliza?
 *   - src/components/atmosphere/SetAtmosphere.tsx
 *   - src/components/cartas/CartasIntro.tsx
 *   - src/components/cartas/LettersGallery.tsx
 */

import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { CartasIntro } from "@/components/cartas/CartasIntro";
import { LettersGallery } from "@/components/cartas/LettersGallery";

export default function CartasPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="lluvia" />
      <CartasIntro />
      <LettersGallery />
    </main>
  );
}