/**
 * ============================================================
 * PÁGINA DE INICIO — EL REFUGIO (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Página principal: portada (Hero) + rejilla de las 13
 *   secciones + las estrellas de las mascotas en el cielo.
 *
 * ¿Cómo funciona?
 *   Compone bloques de components/home y components/background.
 *
 * ¿Dónde modificarlo?
 *   - Hero: src/components/home/Hero.tsx
 *   - Secciones: src/components/home/SectionGrid.tsx
 *   - Estrellas de mascotas: src/components/background/PetStars.tsx
 *
 * ¿Qué archivos utiliza?
 *   - src/components/home/Hero.tsx
 *   - src/components/home/SectionGrid.tsx
 *   - src/components/background/PetStars.tsx
 */

import { PetStars } from "@/components/background/PetStars";
import { Hero } from "@/components/home/Hero";
import { SectionGrid } from "@/components/home/SectionGrid";

export default function Home() {
  return (
    <main className="relative flex-1">
      <PetStars />
      <Hero />
      <SectionGrid />
    </main>
  );
}
