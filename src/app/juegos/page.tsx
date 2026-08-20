/**
 * ============================================================
 * PÁGINA DE MINIJUEGOS (FASE 6)
 * ============================================================
 *
 * ¿Qué hace?
 *   El catálogo de juegos bajo el cielo del día cálido.
 *
 * ¿Cómo funciona?
 *   - SetAtmosphere activa el cielo de la página.
 *   - GamesHub muestra el catálogo y abre el juego elegido.
 *
 * ¿Dónde modificarlo?
 *   - Contenido: src/data/games.ts
 *   - Componentes: src/components/juegos/
 *
 * ¿Qué archivos utiliza?
 *   - src/components/atmosphere/SetAtmosphere.tsx
 *   - src/components/juegos/GamesIntro.tsx
 *   - src/components/juegos/GamesHub.tsx
 */

import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { GamesHub } from "@/components/juegos/GamesHub";
import { GamesIntro } from "@/components/juegos/GamesIntro";

export default function JuegosPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="dia-calido" />
      <GamesIntro />
      <GamesHub />
    </main>
  );
}
