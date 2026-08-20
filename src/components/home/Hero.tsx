/**
 * ============================================================
 * HERO — BIENVENIDA AL REFUGIO (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Portada emocional: insignia de bienvenida, título, la frase
 *   que define este lugar, dedicatoria, contador de días juntos
 *   y botones. Si hoy es un día especial (cumpleaños o
 *   aniversario) muestra un saludo cálido.
 *
 * ¿Cómo funciona?
 *   - Entrada escalonada con fade + blur (motion).
 *   - getSpecialDay() detecta fechas importantes.
 *   - El contador usa la fecha real de src/data/config.ts.
 *
 * ¿Dónde modificarlo?
 *   - Frase principal: texto de este componente.
 *   - Fechas y nombres: src/data/config.ts.
 *   - Mensajes de días especiales: src/lib/dates.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/ui/Button.tsx
 *   - src/data/config.ts
 *   - src/lib/dates.ts
 *   - src/lib/toast.ts
 *   - motion/react, lucide-react
 */

"use client";

import { ChevronDown, Heart, Sparkles } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { COUPLE } from "@/data/config";
import { getSpecialDay } from "@/lib/dates";

/** Entrada escalonada de los elementos del hero. */
const heroVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export function Hero() {
  // Días transcurridos desde nuestro comienzo (config.ts).
  // Se calcula tras el montaje para mantener el render puro.
  const [daysTogether, setDaysTogether] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const elapsed = Date.now() - COUPLE.anniversary.getTime();
      setDaysTogether(Math.max(0, Math.floor(elapsed / 86_400_000)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const anniversaryLabel = useMemo(
    () =>
      COUPLE.anniversary.toLocaleDateString(COUPLE.locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  // ¿Hoy es un día especial?
  const specialDay = useMemo(() => getSpecialDay(), []);

  const router = useRouter();

  function handleExplore() {
    document.getElementById("nuestros-lugares")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleStory() {
    router.push("/historia");
  }

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pb-24 pt-24 text-center">
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative flex max-w-3xl flex-col items-center gap-7"
      >
        {/* Saludo de día especial */}
        {specialDay && (
          <motion.div
            variants={itemVariants}
            className="glass flex items-center gap-2.5 rounded-full border-gold-glow/20 px-5 py-2.5"
          >
            <Sparkles className="size-4 animate-sparkle text-gold-glow" />
            <p className="text-sm text-primary/90">{specialDay.message}</p>
          </motion.div>
        )}

        {/* Insignia de bienvenida */}
        <motion.span
          variants={itemVariants}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-purple-200"
        >
          <Sparkles className="size-3.5 animate-sparkle text-gold-glow" />
          Welcome to
        </motion.span>

        {/* Título principal */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl font-bold leading-tight tracking-tight text-primary sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Nuestro{" "}
          <span className="text-gradient">Universo</span>
        </motion.h1>

        {/* La frase que define este lugar */}
        <motion.p
          variants={itemVariants}
          className="max-w-xl text-base leading-relaxed text-starlight sm:text-lg"
        >
          Este es nuestro mundo: el rincón donde guardamos lo que vivimos
          y lo que nos espera.
        </motion.p>

        {/* Dedicatoria */}
        <motion.p
          variants={itemVariants}
          className="text-sm text-starlight/60"
        >
          Hecho por {COUPLE.nickname1}, para {COUPLE.nickname2}.
        </motion.p>

        {/* Contador de días juntos */}
        <motion.div
          variants={itemVariants}
          className="glass flex items-center gap-2.5 rounded-full px-5 py-2.5"
        >
          <Heart className="size-4 animate-heartbeat fill-pink-glow text-pink-glow" />
          <p className="text-sm text-starlight">
            Desde el {anniversaryLabel}, llevamos{" "}
            <span className="font-semibold text-primary">{daysTogether} días</span>{" "}
            amándonos
          </p>
        </motion.div>

        {/* Botones */}
        <motion.div
          variants={itemVariants}
          className="mt-2 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button size="lg" onClick={handleExplore}>
            Explorar
            <Sparkles className="size-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={handleStory}>
            Nuestra Historia
          </Button>
        </motion.div>

        {/* Línea sutil */}
        <motion.p
          variants={itemVariants}
          className="mt-4 text-xs uppercase tracking-[0.25em] text-starlight/40"
        >
          11 páginas, solo de nosotros
        </motion.p>

        {/* Indicador de scroll (en el flujo, sin hueco) */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-10"
        >
          <ChevronDown className="size-5 animate-float text-starlight/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
