/**
 * ============================================================
 * PET SPRITE — MASCOTAS EN PIXEL-ART (RETRO 8-16 BITS)
 * ============================================================
 *
 * ¿Qué hace?
 *   Dibuja a cada mascota como un sprite de videojuego: formas
 *   cuadriculadas, contornos oscuros marcados, ojos de píxel
 *   (rectángulos, nada de círculos perfectos) y rasgos de alto
 *   contraste:
 *     - Apio (gato): cuerpo blanco + mancha en bloques en el
 *       bigote.
 *     - Rayo (perro): café claro + cejas rubias pixeladas.
 *     - Shelby y Night (gatos): grises con rayas escalonadas.
 *
 * El "caminar" lo hace el contenedor (Garden.tsx): rebote
 * vertical rítmico + paso lateral. Aquí solo se anima la cola
 * y el vaivén de las patas.
 */

"use client";

import { motion, type MotionValue } from "motion/react";

import type { GardenPet } from "@/data/pets";

interface PetSpriteProps {
  pet: GardenPet;
  /** Dirección del paseo (1 = derecha, -1 = izquierda). */
  facing: MotionValue<1 | -1>;
}

/** Contorno pixel oscuro de todos los sprites. */
const OUT = "#17181f";

export function PetSprite({ pet, facing }: PetSpriteProps) {
  const cat = pet.kind === "cat";

  return (
    <motion.svg
      viewBox="0 0 110 76"
      className="h-24 w-36 drop-shadow-[0_8px_0_rgba(0,0,0,0.25)] sm:h-28 sm:w-[10.5rem]"
      style={{ scaleX: facing }}
      aria-hidden
    >
      {/* ---------- Cola (escalonada, con contorno) ---------- */}
      {cat ? (
        <motion.path
          d="M30 46 L12 46 L12 40 L6 40 L6 26 L14 26 L14 20 L8 20 L8 16 L16 16"
          fill="none"
          stroke={OUT}
          strokeWidth="11"
          strokeLinejoin="miter"
          strokeLinecap="butt"
          animate={{ rotate: [0, 14, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "view-box", transformOrigin: "30px 46px" }}
        />
      ) : (
        <motion.path
          d="M30 44 L16 44 L16 36 L22 36 L22 28 L16 28 L16 24 L22 24"
          fill="none"
          stroke={OUT}
          strokeWidth="11"
          strokeLinejoin="miter"
          strokeLinecap="butt"
          animate={{ rotate: [-8, 14, -8] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "view-box", transformOrigin: "30px 44px" }}
        />
      )}
      <motion.path
        d={
          cat
            ? "M30 46 L12 46 L12 40 L6 40 L6 26 L14 26 L14 20 L8 20 L8 16 L16 16"
            : "M30 44 L16 44 L16 36 L22 36 L22 28 L16 28 L16 24 L22 24"
        }
        fill="none"
        stroke={pet.body}
        strokeWidth="7"
        strokeLinejoin="miter"
        strokeLinecap="butt"
        animate={{ rotate: cat ? [0, 14, 0] : [-8, 14, -8] }}
        transition={
          cat
            ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformBox: "view-box", transformOrigin: "30px 44px" }}
      />

      {/* ---------- Patas (vaivén rítmico) ---------- */}
      <motion.g
        animate={{ y: [0, -3.5, 0] }}
        transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="44" y="57" width="10" height="13" fill={pet.body} stroke={OUT} strokeWidth="2.5" />
        <rect x="44" y="66" width="10" height="4" fill={pet.detail} stroke={OUT} strokeWidth="2.5" />
        <rect x="66" y="57" width="10" height="13" fill={pet.body} stroke={OUT} strokeWidth="2.5" />
        <rect x="66" y="66" width="10" height="4" fill={pet.detail} stroke={OUT} strokeWidth="2.5" />
      </motion.g>
      <motion.g
        animate={{ y: [0, 3.5, 0] }}
        transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="55" y="57" width="10" height="13" fill={pet.detail} opacity="0.55" stroke={OUT} strokeWidth="2.5" />
        <rect x="77" y="57" width="10" height="13" fill={pet.detail} opacity="0.55" stroke={OUT} strokeWidth="2.5" />
      </motion.g>

      {/* ---------- Cuerpo (bloque sólido con contorno) ---------- */}
      <rect x="32" y="24" width="56" height="36" rx="3" fill={pet.body} stroke={OUT} strokeWidth="3" />
      <rect x="38" y="45" width="46" height="13" rx="3" fill={pet.belly} />

      {/* Rayas escalonadas (Shelby y Night) */}
      {cat && pet.id !== "apio" && (
        <g fill={pet.detail}>
          <rect x="43" y="22" width="6" height="14" />
          <rect x="45" y="17" width="3" height="7" />
          <rect x="53" y="22" width="6" height="14" />
          <rect x="55" y="17" width="3" height="7" />
          <rect x="63" y="22" width="6" height="14" />
          <rect x="65" y="17" width="3" height="7" />
        </g>
      )}

      {/* ---------- Cabeza (cuadrada, con orejas pixeladas) ---------- */}
      <rect x="82" y="20" width="28" height="26" rx="2" fill={pet.body} stroke={OUT} strokeWidth="3" />

      {cat ? (
        <>
          <path
            d="M84 24 L86 6 L90 4 L96 12 L96 24 Z"
            fill={pet.body}
            stroke={OUT}
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          <path d="M87 18 L88 10 L91 8 L93 15 Z" fill={pet.belly} opacity="0.6" />
          <path
            d="M97 14 L105 4 L110 18 L102 20 Z"
            fill={pet.body}
            stroke={OUT}
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          <path d="M100 13 L104 8 L106 12 L103 15 Z" fill={pet.belly} opacity="0.6" />
        </>
      ) : (
        <>
          {/* Orejas caídas (Rayo) */}
          <path
            d="M84 22 L80 8 L87 4 L92 18 Z"
            fill={pet.detail}
            stroke={OUT}
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          <path
            d="M96 14 L105 4 L110 20 L104 21 Z"
            fill={pet.detail}
            stroke={OUT}
            strokeWidth="3"
            strokeLinejoin="miter"
          />
        </>
      )}

      {/* Cejas rubias pixeladas (Rayo) */}
      {pet.accent && (
        <g fill={pet.accent} stroke={OUT} strokeWidth="1.5">
          <rect x="86" y="17" width="9" height="3" />
          <rect x="98" y="17" width="9" height="3" />
        </g>
      )}

      {/* Ojo de píxel (con brillo) */}
      <rect x="92" y="25" width="5" height="6" fill={OUT} />
      <rect x="92" y="25" width="2" height="2" fill="#fff" opacity="0.9" />

      {/* Mancha del bigote (Apio) en bloques */}
      {pet.patch && (
        <g fill={pet.patch}>
          <rect x="66" y="30" width="12" height="6" />
          <rect x="64" y="36" width="8" height="8" />
          <rect x="74" y="36" width="10" height="8" />
          <rect x="66" y="44" width="14" height="5" />
        </g>
      )}

      {/* Hocico y nariz */}
      <rect
        x={cat ? 90 : 88}
        y={cat ? 35 : 33}
        width={cat ? 12 : 16}
        height={cat ? 9 : 12}
        rx="2"
        fill={pet.belly}
        stroke={OUT}
        strokeWidth="2.5"
      />
      <rect x={cat ? 96 : 98} y={cat ? 32 : 30} width="5" height="4" fill="#2c2a33" />
      <rect x={cat ? 95 : 97} y={cat ? 43 : 42} width="3" height="4" fill={OUT} />

      {/* Bigotes (líneas pixel) */}
      {cat ? (
        <g fill={pet.detail} opacity="0.7">
          <rect x="98" y="37" width="9" height="2" />
          <rect x="98" y="42" width="9" height="2" />
        </g>
      ) : (
        <rect x="100" y="42" width="5" height="6" fill="#d9798a" stroke={OUT} strokeWidth="1.5" />
      )}
    </motion.svg>
  );
}
