/**
 * ============================================================
 * FOOTER — PIE DE PÁGINA (FASE 2.5, PERSONALIZADO)
 * ============================================================
 *
 * ¿Qué hace?
 *   Cierre del sitio: dedicatoria a Sofía, enlaces a todas las
 *   secciones y una línea sobre las mascotas que patrullan
 *   estas páginas.
 *
 * ¿Cómo funciona?
 *   - Los textos personales vienen de src/data/config.ts.
 *   - Las mascotas se nombran desde PETS (config).
 *   - El corazón late con la animación heartbeat.
 *
 * ¿Dónde modificarlo?
 *   - Textos: src/data/config.ts.
 *   - Estilo: clases de este componente.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/config.ts
 *   - src/data/sections.ts
 *   - lucide-react (Heart)
 */

import { Heart } from "lucide-react";
import Link from "next/link";

import { APP, COUPLE, PETS } from "@/data/config";
import { SECTIONS } from "@/data/sections";

export function Footer() {
  return (
    <footer className="relative mt-24 w-full">
      {/* Línea de brillo superior */}
      <div aria-hidden className="hairline absolute inset-x-0 top-0 opacity-50" />

      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Marca y dedicatoria */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-glow to-pink-glow shadow-[0_6px_20px_-6px_rgba(141,130,214,0.6)]">
                <Heart className="size-4.5 fill-primary text-primary" />
              </span>
              <span className="font-display text-lg font-semibold text-primary">
                {APP.name}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-starlight/80">
              Hecho por {COUPLE.nickname1}, para {COUPLE.nickname2}.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-starlight/50">
              {PETS.map((pet) => pet.name).join(", ")} patrullan estas páginas
              mientras alguien escribe el siguiente capítulo.
            </p>
          </div>

          {/* Enlaces */}
          <nav aria-label="Enlaces del pie de página">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-starlight/60">
              Nuestros lugares
            </p>
            <ul className="mt-4 grid max-w-md grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className="text-sm text-starlight/80 transition-colors hover:text-primary"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Línea inferior */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-starlight/50 sm:flex-row">
          <p>
            {new Date().getFullYear()} — {APP.name}
          </p>
          <p className="flex items-center gap-1.5">
            Cada día más{" "}
            <Heart className="size-3.5 animate-heartbeat fill-pink-glow text-pink-glow" />
          </p>
        </div>
      </div>
    </footer>
  );
}
