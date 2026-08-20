/**
 * ============================================================
 * ATMOSPHERE SKY — EL CIELO DE CADA LUGAR (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Pinta el cielo de la atmósfera activa: degradado, astro
 *   (sol o luna con halo suave), nubes que avanzan despacio y
 *   viñeta de comodidad (nunca contrastes agresivos).
 *
 * ¿Cómo funciona?
 *   - Lee la atmósfera desde src/data/atmospheres.ts.
 *   - El degradado es opaco: al cambiar de cielo, el fondo
 *     nuevo cubre al anterior y Background lo funde suavemente.
 *   - La luna lleva data-easter-moon (secreto de clic).
 *
 * ¿Dónde modificarlo?
 *   - Colores y astros: src/data/atmospheres.ts.
 *   - Posición del sol/luna: mapa CELESTIAL de este archivo.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/atmospheres.ts
 *   - src/app/globals.css (animación de nubes)
 */

import type { AtmosphereId } from "@/data/atmospheres";
import { getAtmosphere } from "@/data/atmospheres";
import { cn } from "@/lib/utils/cn";

/** Posición del sol o la luna según el cielo. */
const CELESTIAL_POSITIONS: Partial<Record<AtmosphereId, string>> = {
  atardecer: "left-[16%] top-[58%]",
  amanecer: "left-[46%] top-[56%]",
  "dia-calido": "left-[64%] top-[20%]",
  otono: "left-[22%] top-[28%]",
  primavera: "left-[30%] top-[22%]",
  "noche-tranquila": "right-[12%] top-[14%]",
  "noche-magica": "right-[16%] top-[18%]",
};

/** Nubes suaves (solo cielos con `clouds: true`). */
const CLOUDS = [
  { className: "left-[8%] top-[24%] size-[320px]", duration: "80s", delay: "-20s" },
  { className: "right-[12%] top-[34%] size-[260px]", duration: "65s", delay: "-40s" },
  { className: "left-[38%] top-[52%] size-[300px]", duration: "95s", delay: "-60s" },
];

export interface AtmosphereSkyProps {
  id: AtmosphereId;
}

/** El cielo de una atmósfera. */
export function AtmosphereSky({ id }: AtmosphereSkyProps) {
  const atmosphere = getAtmosphere(id);
  const celestialClass = CELESTIAL_POSITIONS[id];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Degradado principal */}
      <div className="absolute inset-0" style={{ background: atmosphere.sky }} />

      {/* Mantos de luz: veladuras suaves que dan profundidad */}
      <div
        aria-hidden
        className="absolute -left-1/4 top-[-20%] size-[70vw] animate-drift rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(141,130,214,0.55) 0%, rgba(141,130,214,0) 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-1/4 bottom-[-25%] size-[80vw] animate-drift rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(201,154,180,0.5) 0%, rgba(201,154,180,0) 65%)",
          animationDelay: "-13s",
        }}
      />

      {/* Astro (sol o luna) */}
      {atmosphere.celestial !== "none" && celestialClass && (
        <div className={cn("absolute", celestialClass)}>
          {atmosphere.celestial === "moon" ? (
            <div
              data-easter-moon=""
              className="size-24 animate-float-slow rounded-full bg-[radial-gradient(circle_at_35%_32%,#eef2fb_0%,#d9e2f0_45%,#b9c6e0_62%,rgba(185,198,224,0)_75%)] shadow-[0_0_50px_12px_rgba(217,226,240,0.12)]"
            />
          ) : (
            /* Sol en calma: disco y halo suave, sin rayos ni destellos */
            <div className="relative size-24 animate-float-slow">
              <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(242,207,159,0.22)_0%,rgba(242,207,159,0.08)_45%,transparent_70%)]" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_36%_32%,#fdf3e0_0%,#f2cf9f_55%,#e8b27d_80%,rgba(232,178,125,0)_96%)]" />
            </div>
          )}
        </div>
      )}

      {/* Nubes que avanzan despacio */}
      {atmosphere.clouds &&
        CLOUDS.map((cloud, index) => (
          <div
            key={index}
            className={cn(
              "absolute animate-cloud-drift rounded-full bg-white/10 blur-3xl",
              cloud.className,
            )}
            style={{ animationDuration: cloud.duration, animationDelay: cloud.delay }}
          />
        ))}

      {/* Oscurece un poco la parte alta (contraste del navbar) */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(10,14,30,0.35)] to-transparent" />

      {/* Viñeta de comodidad */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,14,30,0.5)_100%)]" />
    </div>
  );
}
