/**
 * ============================================================
 * PARTICLE CANVAS — PARTÍCULAS DEL CIELO (FASE 2.5)
 * ============================================================
 *
 * ¿Qué hace?
 *   Canvas que dibuja las partículas de la atmósfera activa:
 *   estrellas que parpadean, estrellas fugaces, destellos,
 *   luciérnagas, lluvia ligera, hojas y pétalos. En los días
 *   especiales (cumpleaños y aniversario) hay lluvia de
 *   estrellas doradas.
 *
 * ¿Cómo funciona?
 *   - Lee la atmósfera (particles) y dibuja cada tipo.
 *   - Densidades limitadas por área de pantalla (rendimiento),
 *     con cuentas máximas bajas para no cargar el navegador.
 *   - Con prefers-reduced-motion dibuja una vez, estático.
 *
 * ¿Dónde modificarlo?
 *   - Densidades: constantes DENSITY_*.
 *   - Colores de partículas: mapas de color (abajo).
 *   - Días con lluvia de estrellas: src/lib/dates.ts.
 *
 * ¿Qué archivos utiliza?
 *   - src/data/atmospheres.ts (partículas de cada cielo)
 *   - src/lib/dates.ts (lluvia de estrellas en días especiales)
 */

"use client";

import { useEffect, useRef } from "react";

import type { AtmosphereId, ParticleKind } from "@/data/atmospheres";
import { getAtmosphere } from "@/data/atmospheres";
import { getShootingStarRate } from "@/lib/dates";

/* ---------- Configuración de densidades ---------- */
const DENSITY = {
  stars: 7500,
  shooting: 26000,
  rain: 16000,
  leaves: 55000,
  petals: 42000,
  fireflies: 90000,
  sparkles: 60000,
} as const;

const MAX_COUNT = {
  stars: 90,
  shooting: 3,
  rain: 70,
  leaves: 18,
  petals: 24,
  fireflies: 6,
  sparkles: 8,
} as const;

/* ---------- Colores por tipo ---------- */
const STAR_COLORS: ReadonlyArray<readonly [number, number, number]> = [
  [233, 237, 246],
  [185, 174, 222],
  [211, 168, 194],
  [169, 179, 204],
];
const LEAF_COLORS = ["#c98a5a", "#b06a52", "#d9a569", "#a0705a"];
const PETAL_COLORS = ["#e9c3cf", "#efd6dd", "#f0e0e6", "#e5c8d6"];
const RAIN_COLOR = "rgba(143, 176, 217, 0.3)";
const FIREFLY_COLOR = "rgba(232, 217, 160, 0.85)";
const SPARKLE_COLOR = "rgba(216, 189, 143, 0.7)";

/* ---------- Tipos internos ---------- */
interface Star {
  x: number;
  y: number;
  radius: number;
  base: number;
  phase: number;
  speed: number;
  depth: number;
  color: readonly [number, number, number];
}
interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
}
interface Faller {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  sway: number;
}
interface Firefly {
  x: number;
  y: number;
  tx: number;
  ty: number;
  phase: number;
}
interface Spark {
  x: number;
  y: number;
  vy: number;
  phase: number;
  size: number;
}
interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  gold: boolean;
}

export interface ParticleCanvasProps {
  id: AtmosphereId;
}

/** Campo de partículas de la atmósfera activa. */
export function ParticleCanvas({ id }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const atmosphere = getAtmosphere(id);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shootingRate = getShootingStarRate();

    let width = 0;
    let height = 0;
    let rafId = 0;
    let running = false;
    let suppressed = false;
    let stars: Star[] = [];
    let rain: Drop[] = [];
    let leaves: Faller[] = [];
    let petals: Faller[] = [];
    let fireflies: Firefly[] = [];
    let sparks: Spark[] = [];
    let shooting: ShootingStar | null = null;
    let nextShootingAt = 0;

    const has = (kind: ParticleKind) => atmosphere.particles.includes(kind);

    /** Crea las partículas según el tamaño de pantalla. */
    const initParticles = () => {
      const area = width * height;
      const count = (kind: ParticleKind, fallback: number) =>
        Math.min(MAX_COUNT[kind] ?? 0, Math.floor(area / (DENSITY[kind] ?? area)) || fallback);

      stars = has("stars")
        ? Array.from({ length: count("stars", 120) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0.4 + Math.random() * 1.2,
            base: 0.3 + Math.random() * 0.55,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 1.5,
            depth: 0.4 + Math.random() * 0.6,
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          }))
        : [];

      rain = has("rain")
        ? Array.from({ length: count("rain", 60) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 5 + Math.random() * 4,
            length: 9 + Math.random() * 10,
          }))
        : [];

      const makeFaller = (colors: string[]): Faller => ({
        x: Math.random() * width,
        y: -20 - Math.random() * height * 0.4,
        vx: (Math.random() - 0.3) * 0.6,
        vy: 0.5 + Math.random() * 0.9,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        sway: Math.random() * Math.PI * 2,
      });

      leaves = has("leaves")
        ? Array.from({ length: count("leaves", 10) }, () => makeFaller(LEAF_COLORS))
        : [];
      petals = has("petals")
        ? Array.from({ length: count("petals", 14) }, () => makeFaller(PETAL_COLORS))
        : [];

      fireflies = has("fireflies")
        ? Array.from({ length: count("fireflies", 6) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            tx: Math.random() * width,
            ty: Math.random() * height,
            phase: Math.random() * Math.PI * 2,
          }))
        : [];

      sparks = has("sparkles")
        ? Array.from({ length: count("sparkles", 10) }, () => ({
            x: Math.random() * width,
            y: height * (0.4 + Math.random() * 0.6),
            vy: 0.1 + Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2,
            size: 2 + Math.random() * 2,
          }))
        : [];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      initParticles();
    };

    const drawStar = (star: Star, time: number) => {
      const twinkle = Math.sin(time * 0.001 * star.speed + star.phase);
      const opacity = star.base * (0.55 + 0.45 * twinkle);
      const [r, g, b] = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(3)})`;
      ctx.fill();
    };

    const drawRain = () => {
      ctx.strokeStyle = RAIN_COLOR;
      ctx.lineWidth = 1;
      for (const drop of rain) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2.2, drop.y - drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > height + 20) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }
      }
    };

    const drawFaller = (items: Faller[], time: number) => {
      for (const item of items) {
        item.rot += item.vr;
        item.x += item.vx + Math.sin(time * 0.001 + item.sway) * 0.3;
        item.y += item.vy;
        if (item.y > height + 20) {
          item.y = -20;
          item.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rot);
        ctx.fillStyle = item.color;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.ellipse(0, 0, item.size, item.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const drawFireflies = (time: number) => {
      for (const fly of fireflies) {
        fly.x += (fly.tx - fly.x) * 0.01;
        fly.y += (fly.ty - fly.y) * 0.01;
        if (Math.random() < 0.01) {
          fly.tx = Math.random() * width;
          fly.ty = Math.random() * height;
        }
        const glow = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 0.002 + fly.phase));
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = FIREFLY_COLOR.replace("0.85", (glow * 0.35).toFixed(2));
        ctx.fill();
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = FIREFLY_COLOR;
        ctx.fill();
      }
    };

    const drawSparks = (time: number) => {
      for (const spark of sparks) {
        spark.y -= spark.vy;
        if (spark.y < -10) {
          spark.y = height + 10;
          spark.x = Math.random() * width;
        }
        const glow = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.002 + spark.phase));
        ctx.save();
        ctx.translate(spark.x, spark.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = SPARKLE_COLOR.replace("0.7", (glow * 0.5).toFixed(2));
        ctx.fillRect(-spark.size / 2, -spark.size / 2, spark.size, spark.size);
        ctx.restore();
      }
    };

    const spawnShootingStar = () => {
      shooting = {
        x: width * (0.25 + Math.random() * 0.65),
        y: height * (0.05 + Math.random() * 0.3),
        vx: -(4 + Math.random() * 3),
        vy: 2.6 + Math.random() * 2.4,
        life: 1,
        gold: shootingRate > 1,
      };
    };

    const drawShootingStar = (star: ShootingStar) => {
      const trail = 26;
      const tailX = star.x - star.vx * trail;
      const tailY = star.y - star.vy * trail;
      const head = star.gold ? "rgba(255,236,190,0.95)" : "rgba(255,255,255,0.9)";
      const tail = star.gold ? "rgba(242,207,159,0)" : "rgba(160,138,216,0)";
      const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      gradient.addColorStop(0, head);
      gradient.addColorStop(1, tail);
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    };

    const animate = (time: number) => {
      if (!running) {
        cancelAnimationFrame(rafId);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) drawStar(star, time);
      drawRain();
      drawFaller(leaves, time);
      drawFaller(petals, time);
      drawFireflies(time);
      drawSparks(time);

      // Estrellas fugaces (más frecuentes en días especiales).
      if (has("shooting")) {
        if (time > nextShootingAt) {
          nextShootingAt = time + (9000 + Math.random() * 7000) / shootingRate;
          spawnShootingStar();
        }
        if (shooting) {
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          shooting.life -= 0.012;
          if (shooting.life <= 0) shooting = null;
          else drawShootingStar(shooting);
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) drawStar(star, 0);
    };

    const onResize = () => {
      resize();
      if (reducedMotion) drawStatic();
    };

    /** Detiene el bucle (deja el último frame pintado). */
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    /** Reanuda el bucle de animación. */
    const start = () => {
      if (running || suppressed || reducedMotion) return;
      running = true;
      nextShootingAt = performance.now() + 2500;
      rafId = requestAnimationFrame(animate);
    };

    /** Pausa cuando hay una capa encima (lightbox) o la pestaña está oculta. */
    const onSuppress = () => {
      suppressed = true;
      stop();
    };
    const onResume = () => {
      suppressed = false;
      start();
    };
    const onVisibility = () => {
      if (document.hidden) onSuppress();
      else onResume();
    };

    resize();
    if (reducedMotion) {
      drawStatic();
    } else {
      start();
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("fyez:background-off", onSuppress);
    window.addEventListener("fyez:background-on", onResume);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("fyez:background-off", onSuppress);
      window.removeEventListener("fyez:background-on", onResume);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [id]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
