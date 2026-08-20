/**
 * ============================================================
 * JARDÍN — ESCENA 2D PLANA, FRONTAL Y HORIZONTAL (FASE 9.7)
 * ============================================================
 *
 * ¿Qué hace?
 *   Un jardín con estética de videojuego retro / plantilla de
 *   píxel (side-scroller plano): cielo degradado con sol arriba
 *   a la izquierda, suelo como franja horizontal de dos capas
 *   (pasto con bloques arriba, tierra/roca abajo) y las casas
 *   de las mascotas alineadas en el eje X sobre el pasto.
 *
 * ¿Cómo funciona?
 *   - Nada de rotaciones, skew ni matrices: solo capas rectas.
 *   - WalkingPet: la mascota camina por el eje X (motion value)
 *     con rebote vertical puro (translateY cíclico 0 → -4px).
 *   - Al pulsarla: detiene el paseo, salto de alegría (rebotes
 *     rápidos), camina en línea recta hasta la puerta (houseX),
 *     baja su opacidad a 0 (entró) 3 segundos y reaparece para
 *     seguir paseando.
 *   - Z-index: pasto < flores < casas < mascotas (las mascotas
 *     pasan limpias por delante de las fachadas).
 */

"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PawPrint } from "lucide-react";

import {
  GARDEN_FLOWERS,
  GARDEN_PETS,
  GROUND_Y,
  SCENE_H,
  SCENE_W,
} from "@/data/pets";
import { playChime } from "@/lib/audio/chime";

import { PetHouse } from "./PetHouse";
import { PetSprite } from "./PetSprite";

export function GardenIntro() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-36 text-center sm:px-6">
      <span className="glass inline-flex items-center gap-2 rounded-sm border-2 border-[#17181f] px-4 py-1.5 font-pixel text-[9px] uppercase text-green-glow">
        <PawPrint className="size-3.5 text-green-glow" />
        Jardín
      </span>
      <h1 className="mt-6 font-pixel text-xl uppercase leading-relaxed text-primary sm:text-2xl md:text-3xl">
        El jardín de{" "}
        <span className="text-gradient">nuestra jauría</span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-starlight sm:text-lg">
        Rayo, Night, Apio y Shelby viven en su prado. Pulsa a tu favorita:
        salta de alegría y vuelve solita a su casita.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* UNA MASCOTA QUE CAMINA POR EL PASTO (EJE X)                         */
/* ------------------------------------------------------------------ */

function WalkingPet({ pet }: { pet: (typeof GARDEN_PETS)[number] }) {
  const x = useMotionValue(pet.houseX);
  const facing = useMotionValue<1 | -1>(1);
  const jump = useMotionValue(0);
  const opacity = useMotionValue(1);

  const [talking, setTalking] = useState(false);
  const mode = useRef<"wander" | "jump" | "home">("wander");
  const walkCtl = useRef<AnimationPlaybackControls | null>(null);
  const talkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Salto de alegría: altura y escala derivadas del valor 0 → 1 → 0.
  const jumpY = useTransform(jump, (v) => -v * 30);
  const jumpScale = useTransform(jump, (v) => 1 + v * 0.08);

  // Bucle de vida: paseo libre aleatorio, o regreso a casa al pulsarla.
  useEffect(() => {
    let alive = true;
    const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    const walkTo = async (targetX: number) => {
      const fromX = x.get();
      facing.set(targetX >= fromX ? 1 : -1);
      const duration = Math.max(0.35, Math.abs(targetX - fromX) / pet.speed);
      const ctl = animate(x, targetX, { duration, ease: steppedEase });
      walkCtl.current = ctl;
      await ctl.finished;
    };

    const loop = async () => {
      await delay(300 + Math.random() * 900);
      while (alive) {
        if (mode.current === "wander") {
          const target =
            pet.walkMin + Math.random() * (pet.walkMax - pet.walkMin);
          await walkTo(target);
          await delay(600 + Math.random() * 1400);
        } else if (mode.current === "jump") {
          // Esperando a que termine el salto (lo manda a "home").
          await delay(110);
        } else {
          // Regreso a casa: entra y reaparece.
          await walkTo(pet.houseX);
          await animate(opacity, 0, { duration: 0.4, ease: "easeIn" }).finished;
          await delay(3000);
          await animate(opacity, 1, { duration: 0.4, ease: "easeOut" }).finished;
          mode.current = "wander";
        }
      }
    };

    void loop();
    return () => {
      alive = false;
    };
  }, [pet, x, facing, opacity]);

  const handleTap = useCallback(() => {
    if (mode.current !== "wander") return;
    mode.current = "jump";
    playChime(true);
    setTalking(true);
    if (talkTimer.current) clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(() => setTalking(false), 5200);
    walkCtl.current?.stop();
    animate(jump, [0, 1, 0, 0.35, 0], {
      duration: 1.05,
      times: [0, 0.28, 0.55, 0.75, 1],
      ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
      onComplete: () => {
        mode.current = "home";
      },
    });
  }, [jump]);

  // Limpieza al desmontar.
  useEffect(() => {
    return () => {
      if (talkTimer.current) clearTimeout(talkTimer.current);
      walkCtl.current?.stop();
    };
  }, []);

  return (
    <motion.button
      type="button"
      aria-label={pet.name}
      onClick={handleTap}
      className="absolute -translate-x-1/2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-glow/70"
      style={{
        left: x,
        bottom: SCENE_H - GROUND_Y,
        opacity,
        zIndex: 10,
      }}
    >
      {/* Frase al pulsarla */}
      {talking && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-20 left-1/2 z-20 w-max max-w-52 -translate-x-1/2 rounded-sm border-4 border-[#17181f] bg-night-900 px-3 py-2 text-center font-pixel text-[9px] uppercase leading-loose text-primary shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
        >
          {pet.frase}
        </motion.span>
      )}

      {/* Salto de alegría */}
      <motion.div style={{ y: jumpY, scale: jumpScale }}>
        {/* Rebote del paso: translateY cíclico rítmico */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.38, repeat: Infinity, ease: "easeInOut" }}
          className="transition-transform duration-200 group-hover:scale-105"
        >
          <PetSprite pet={pet} facing={facing} />
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* LA ESCENA                                                           */
/* ------------------------------------------------------------------ */

const GRASS_HEIGHT = 56;

/** Ease "entrecortado" (estilo sprite): avance en pasos discretos. */
const WALK_STEPS = 12;
const steppedEase = (t: number): number =>
  Math.floor(t * WALK_STEPS) / WALK_STEPS;

/** Franja de pasto: cuadrícula de bloques pixelados. */
const GRASS_BG = [
  "repeating-linear-gradient(0deg, rgba(0,0,0,0.32) 0 2px, transparent 2px 26px)",
  "repeating-linear-gradient(90deg, rgba(0,0,0,0.20) 0 2px, transparent 2px 26px)",
  "linear-gradient(180deg, rgba(255,255,255,0.16) 0 4px, rgba(255,255,255,0) 9px)",
  "repeating-linear-gradient(90deg, #3f6b48 0 26px, #47784f 26px 52px)",
  "linear-gradient(180deg, rgba(0,0,0,0) 84%, rgba(0,0,0,0.28) 100%)",
].join(", ");

/** Capa inferior de tierra/roca: bloques con piedritas. */
const DIRT_BG = [
  "radial-gradient(circle 6px at 12% 22%, rgba(0,0,0,0.18), transparent)",
  "radial-gradient(circle 5px at 40% 58%, rgba(0,0,0,0.15), transparent)",
  "radial-gradient(circle 6px at 74% 32%, rgba(0,0,0,0.17), transparent)",
  "radial-gradient(circle 5px at 92% 70%, rgba(0,0,0,0.14), transparent)",
  "repeating-linear-gradient(0deg, rgba(0,0,0,0.26) 0 2px, transparent 2px 28px)",
  "repeating-linear-gradient(90deg, rgba(0,0,0,0.13) 0 2px, transparent 2px 28px)",
  "linear-gradient(180deg, #8a5f3a, #6c4a2c)",
].join(", ");

export function Garden() {
  return (
    <section
      data-garden
      aria-label="Jardín de las mascotas"
      className="relative mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6"
    >
      <div className="relative h-[76vh] min-h-[520px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-night-950/70 via-night-900/45 to-green-glow/25 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        {/* ESCENA: lienzo plano sin rotaciones, con render píxel nítido */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="pixel-render relative scale-[0.30] min-[430px]:scale-[0.36] sm:scale-[0.5] md:scale-[0.66] lg:scale-[0.84] xl:scale-[0.86]"
            style={{ width: SCENE_W, height: SCENE_H }}
          >
            {/* Cielo: degradado suave con sol arriba a la izquierda */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0"
              style={{
                height: GROUND_Y,
                background:
                  "linear-gradient(180deg, rgba(146,178,196,0.22), rgba(143,174,143,0.12) 62%, rgba(63,107,72,0.28))",
              }}
            />
            <div
              aria-hidden
              className="absolute left-[6%] top-[8%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(240,214,130,0.38),transparent_68%)] blur-[1px]"
            />
            <div
              aria-hidden
              className="absolute left-[8.5%] top-[10.5%] h-9 w-9 bg-[#ffe9b0] opacity-85 shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
            />

            {/* Nubecitas a la derecha (bloques pixel) */}
            <div aria-hidden className="absolute right-[10%] top-[13%] opacity-90">
              <span className="block h-3 w-16 bg-white/[0.14]" />
              <span className="-mt-2 ml-6 block h-3 w-12 bg-white/[0.11]" />
            </div>
            <div aria-hidden className="absolute right-[30%] top-[21%] opacity-80">
              <span className="block h-2.5 w-14 bg-white/[0.10]" />
              <span className="-mt-2 ml-5 block h-2.5 w-10 bg-white/[0.08]" />
            </div>

            {/* SUELO: franja horizontal que abarca el 100% del ancho */}
            <div
              aria-hidden
              className="absolute inset-x-0"
              style={{ top: GROUND_Y, bottom: 0 }}
            >
              {/* Pasto (bloques limpios) */}
              <div
                className="absolute inset-x-0"
                style={{ top: 0, height: GRASS_HEIGHT, background: GRASS_BG }}
              />
              {/* Borde de separación pasto/tierra */}
              <div
                className="absolute inset-x-0"
                style={{
                  top: GRASS_HEIGHT,
                  height: 4,
                  background: "rgba(0,0,0,0.3)",
                }}
              />
              {/* Tierra / roca (grosor del piso) */}
              <div
                className="absolute inset-x-0"
                style={{ top: GRASS_HEIGHT + 4, bottom: 0, background: DIRT_BG }}
              />
            </div>

            {/* Flores decorativas sobre el pasto (detrás de las casas) */}
            {GARDEN_FLOWERS.map((flower, index) => (
              <span
                key={index}
                aria-hidden
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
                style={{
                  left: flower.x,
                  top: flower.y,
                  fontSize: flower.size,
                  zIndex: 1,
                }}
              >
                {flower.emoji}
              </span>
            ))}

            {/* Casas: alineadas en el eje X sobre el pasto */}
            {GARDEN_PETS.map((pet) => (
              <PetHouse key={pet.id} pet={pet} />
            ))}

            {/* Las mascotas (z-index por encima de todo) */}
            {GARDEN_PETS.map((pet) => (
              <WalkingPet key={pet.id} pet={pet} />
            ))}

            {/* Leyenda (cartel pixel) */}
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm border-2 border-[#17181f] bg-night-900/85 px-3 py-1.5 font-pixel text-[8px] uppercase text-starlight/75">
              Pulsa a tu favorita · salta y vuelve a su casita
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
