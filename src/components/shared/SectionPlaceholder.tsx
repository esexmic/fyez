/**
 * ============================================================
 * SECTION PLACEHOLDER — PUERTA EN CONSTRUCCIÓN (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Plantilla única para las páginas aún no construidas: activa
 *   el cielo de esa sección, muestra su icono, nombre, emoción
 *   y un botón de regreso.
 *
 * ¿Cómo funciona?
 *   - Recibe el id de la sección y busca sus datos en
 *     src/data/sections.ts (icono, atmósfera, descripción).
 *   - Activa su atmósfera con <SetAtmosphere />.
 *
 * ¿Dónde modificarlo?
 *   - Datos de cada sección: src/data/sections.ts.
 *   - Estilo: clases de este componente.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/sections.ts
 *   - src/data/atmospheres.ts
 *   - src/components/atmosphere/SetAtmosphere.tsx
 *   - src/components/icons/sectionIcons.tsx
 *   - src/components/ui/ComingSoon.tsx
 *   - lucide-react (ArrowLeft)
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { SectionIcon } from "@/components/icons/sectionIcons";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { getAtmosphere } from "@/data/atmospheres";
import { SECTIONS } from "@/data/sections";

export interface SectionPlaceholderProps {
  /** Id de la sección (debe existir en src/data/sections.ts). */
  sectionId: string;
}

/**
 * Plantilla de página en construcción.
 * @example <SectionPlaceholder sectionId="recuerdos" />
 */
export function SectionPlaceholder({ sectionId }: SectionPlaceholderProps) {
  const section = SECTIONS.find((item) => item.id === sectionId);
  const atmosphere = section ? getAtmosphere(section.atmosphere) : null;

  return (
    <>
      {section && <SetAtmosphere id={section.atmosphere} />}
      <main className="relative flex flex-1 items-center justify-center px-4 py-32 sm:px-6">
        <div className="glass relative w-full max-w-md overflow-hidden rounded-3xl px-8 py-14 text-center">
          {/* Línea de brillo superior */}
          <div aria-hidden className="hairline absolute inset-x-8 top-0 opacity-60" />

          {atmosphere && (
            <span
              aria-hidden
              className="mx-auto mb-5 flex size-16 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-violet-glow/35 to-pink-glow/10"
            >
              <SectionIcon iconKey={section?.icon ?? "sparkles"} className="size-8 text-primary/90" strokeWidth={1.5} />
            </span>
          )}

          <h1 className="font-display text-3xl font-semibold text-primary sm:text-4xl">
            {section?.label ?? sectionId}
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-starlight/80">
            {section?.description ?? "Una experiencia especial en camino."}
          </p>

          {/* El cielo de este lugar */}
          {atmosphere && (
            <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs italic text-starlight/70">
              Bajo el cielo de {atmosphere.name.toLowerCase()}
            </p>
          )}

          <div className="mt-6 flex justify-center">
            <ComingSoon />
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="glass inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-primary transition-all duration-300 hover:border-white/25 hover:bg-white/10 active:scale-[0.97]"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
