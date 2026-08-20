/**
 * ============================================================
 * PET STARS — LAS ESTRELLAS DE NUESTRAS MASCOTAS (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Rayo, Night, Apio y Shelby tienen su propia estrella en el
 *   cielo del inicio. Al pasar el cursor se ilumina con su
 *   nombre; al hacer clic revela un mensaje (easter egg).
 *
 * ¿Cómo funciona?
 *   - Cuatro pequeñas estrellas doradas fijas en la zona alta.
 *   - El clic lo gestiona EasterEggLayer (registro central).
 *   - En pantallas pequeñas se mantienen, discretas.
 *
 * ¿Dónde modificarlo?
 *   - Posiciones: array PET_STARS.
 *   - Mensajes: src/lib/easter-eggs/registry.ts (id pet-*).
 *
 * ¿Qué archivos utiliza?
 *   - src/data/config.ts (PETS)
 *   - src/lib/easter-eggs/registry.ts
 */

"use client";

import { PETS } from "@/data/config";

/** Posiciones de cada estrella (solo decorativas, no bloquean). */
const PET_STAR_POSITIONS: Record<string, string> = {
  rayo: "right-[10%] top-[16%]",
  night: "right-[19%] top-[30%]",
  apio: "right-[6%] top-[39%]",
  shelby: "right-[14%] top-[53%]",
};

/** Estrellas de las mascotas en el cielo del inicio. */
export function PetStars() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2]">
      {PETS.map((pet) => {
        const position = PET_STAR_POSITIONS[pet.id];
        if (!position) return null;
        return (
          <button
            key={pet.id}
            type="button"
            data-pet-star={pet.id}
            aria-label={`Estrella de ${pet.name}`}
            aria-hidden
            tabIndex={-1}
            className={`group pointer-events-auto absolute ${position} flex cursor-pointer items-center justify-center`}
          >
            {/* Nombre al pasar el cursor */}
            <span className="absolute -top-8 whitespace-nowrap rounded-full border border-white/10 bg-night-900/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
              {pet.name}
            </span>
            {/* La estrella */}
            <span className="size-2.5 animate-twinkle rounded-full bg-gold-glow/85 shadow-[0_0_12px_2px_rgba(216,189,143,0.5)] transition-transform duration-300 group-hover:scale-150 group-hover:bg-gold-glow" />
          </button>
        );
      })}
    </div>
  );
}
