/**
 * ============================================================
 * NAVBAR — BARRA SUPERIOR Y MENÚ DE PÁGINAS
 * ============================================================
 *
 * ¿Qué hace?
 *   Barra superior fija con el logo y, a la derecha, la sesión
 *   activa, el reproductor y el botón de menú (3 líneas) que
 *   abre TODAS las páginas en un panel, para cualquier pantalla.
 *
 * ¿Cómo funciona?
 *   - El botón ☰ abre un panel desde la derecha: arriba muestra
 *     quién está dentro (César o Sofía) con su botón de salir,
 *     y abajo la lista completa de páginas con su icono.
 *   - Se cierra al tocar una página, con Escape o tocando fuera.
 *   - usePathname resalta la página activa.
 *   - useScrolled(24) activa el cristal al desplazarse.
 *
 * ¿Dónde modificarlo?
 *   - Enlaces: src/data/sections.ts.
 *   - Estilo: clases de este componente.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/hooks/useScrolled.ts
 *   - src/components/ui/MusicButton.tsx
 *   - src/components/icons/sectionIcons.tsx (SectionIcon)
 *   - lucide-react (Heart, LogOut, Menu, X)
 */

"use client";

import { Heart, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { SectionIcon } from "@/components/icons/sectionIcons";
import { MusicButton } from "@/components/ui/MusicButton";
import { SECTIONS } from "@/data/sections";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { cn } from "@/lib/utils/cn";

/** ¿Esta ruta corresponde a la sección? */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const scrolled = useScrolled(24);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const { name, logout } = useAuth();

  // Al cambiar de página, el menú se cierra solo (ajuste durante el render).
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  // Escape cierra el menú y bloquea el scroll del fondo.
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || menuOpen
          ? "border-x-0 border-t-0 border-b border-white/10 bg-night-900/90 shadow-[0_10px_40px_-18px_rgba(10,14,30,0.9)]"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Ir al inicio"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-glow to-pink-glow shadow-[0_6px_20px_-6px_rgba(141,130,214,0.6)] transition-transform duration-300 group-hover:scale-110">
            <Heart className="size-4.5 fill-primary text-primary" />
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-wide text-primary sm:block">
            Nuestro Universo
          </span>
        </Link>

        {/* Enlaces centrados (estilo página profesional) */}
        <nav
          aria-label="Navegación principal"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          {SECTIONS.filter((section) => section.inNavbar).map((section) => {
            const active = isActive(pathname, section.href);
            return (
              <Link
                key={section.id}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-white/5 text-primary"
                    : "text-starlight/70 hover:bg-white/5 hover:text-primary",
                )}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones derecha */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="glass flex size-11 cursor-pointer items-center justify-center rounded-full text-starlight transition-all duration-300 hover:border-purple-glow/50 hover:text-primary active:scale-95"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <MusicButton />
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-green-glow" />
            {name}
          </span>
        </div>
      </div>

      {/* Panel del menú */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Fondo oscuro detrás del panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden
              className="fixed inset-0 z-40 bg-night-950/70 backdrop-blur-sm"
            />

            {/* Panel con sesión + páginas */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              aria-label="Menú de páginas"
              className="fixed bottom-0 right-0 top-16 z-50 flex w-[min(85vw,340px)] flex-col border-l border-white/10 bg-night-900/95 backdrop-blur-xl"
            >
              {/* Sesión activa */}
              <div className="border-b border-white/10 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-starlight/60">
                  Sesión activa
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-glow/40 to-pink-glow/30 font-display text-lg text-primary">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-primary">{name}</p>
                      <p className="flex items-center gap-1.5 text-xs text-starlight/60">
                        <span className="size-1.5 rounded-full bg-green-glow" />
                        Dentro del universo
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-starlight/70 transition-all duration-300 hover:border-red-400/40 hover:text-red-300 active:scale-95"
                  >
                    <LogOut className="size-4.5" />
                  </button>
                </div>
              </div>

              {/* Todas las páginas */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-starlight/60">
                  Nuestros lugares
                </p>
                <ul className="flex flex-col gap-1">
                  {SECTIONS.map((section) => {
                    const active = isActive(pathname, section.href);
                    return (
                      <li key={section.id}>
                        <Link
                          href={section.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                            active
                              ? "bg-white/5 font-medium text-primary"
                              : "text-starlight hover:bg-white/5 hover:text-primary",
                          )}
                        >
                          <SectionIcon
                            iconKey={section.icon}
                            className={cn(
                              "size-4",
                              active ? "text-purple-glow" : "text-starlight/70",
                            )}
                            strokeWidth={1.8}
                          />
                          <span className="truncate">{section.label}</span>
                          {active && (
                            <span
                              aria-hidden
                              className="ml-auto size-1.5 rounded-full bg-purple-glow"
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pie del panel */}
              <div className="border-t border-white/10 p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-starlight/50">
                  Hecho con{" "}
                  <Heart className="size-3.5 fill-pink-glow text-pink-glow" />
                  para nosotros dos
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}