/**
 * ============================================================
 * CASA EN PIXEL-ART 2D FRONTAL (ESTILO HABBO / RETRO 8-16 BITS)
 * ============================================================
 *
 * ¿Qué hace?
 *   Dibuja la casa de cada mascota con estética de cuadrícula:
 *   bordes oscuros gruesos, rellenos sólidos, sombra de bloque
 *   (una banda más oscura a la izquierda y una más clara a la
 *   derecha para dar volumen 2D), ladrillos en las esquinas,
 *   tejas marcadas en el techo y madera en la puerta.
 *
 *   - Apio:   blanca, techo negro (dos aguas).
 *   - Rayo:   arena con techo dorado.
 *   - Shelby: gris con rayas atigradas en fachada y techo.
 *   - Night:  gris oscuro, techo plano y ventana corrida.
 *
 * La casa se ancla en pet.houseX (centro) y su base descansa
 * sobre la línea del pasto (GROUND_Y).
 */

import { GROUND_Y, SCENE_H, type GardenPet } from "@/data/pets";

const W = 250;
const H = 250;

/** Contorno pixel grueso de todo el dibujo. */
const OUT = "#17181f";
const OUT_W = 4;

/** Rayas atigradas diagonales en bloques (patrón por casa). */
function Stripes({ id, color }: { id: string; color: string }) {
  return (
    <pattern
      id={`stripes-${id}`}
      width="22"
      height="22"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(38)"
    >
      <rect width="22" height="22" fill="transparent" />
      <rect width="8" height="22" fill={color} opacity="0.3" />
    </pattern>
  );
}

/** Ladrillos pixelados en las esquinas (columnas zigzag). */
function BrickColumn({
  x,
  y,
  h,
  color,
}: {
  x: number;
  y: number;
  h: number;
  color: string;
}) {
  const rows = Math.floor(h / 12);
  return (
    <g>
      {Array.from({ length: rows }).map((_, index) => (
        <rect
          key={index}
          x={x + (index % 2 === 0 ? 0 : 7)}
          y={y + index * 12}
          width={15}
          height={9}
          rx={1}
          fill={color}
          stroke={OUT}
          strokeWidth="2"
        />
      ))}
    </g>
  );
}

/** Tejas del techo a dos aguas (bandas escalonadas recortadas). */
function RoofTiles({ id, light, dark }: { id: string; light: string; dark: string }) {
  return (
    <g>
      {/* Relleno base */}
      <path d={`M ${W / 2} 14 L 236 100 L 14 100 Z`} fill={light} stroke={OUT} strokeWidth={OUT_W} />
      {/* Bandas de tejas: filas horizontales recortadas al triángulo */}
      <clipPath id={`roof-clip-${id}`}>
        <path d={`M ${W / 2} 14 L 236 100 L 14 100 Z`} />
      </clipPath>
      <g clipPath={`url(#roof-clip-${id})`}>
        {[30, 48, 66, 84].map((y) => (
          <g key={y}>
            {Array.from({ length: 8 }).map((_, index) => (
              <rect
                key={index}
                x={-8 + index * 34 + (index % 2) * 17}
                y={y}
                width={30}
                height={15}
                fill={index % 2 === 0 ? dark : light}
                stroke={OUT}
                strokeWidth="2"
              />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
}

export function PetHouse({ pet }: { pet: GardenPet }) {
  const { house } = pet;
  const stripes = house.stripes ? `url(#stripes-${pet.id})` : undefined;
  const baseY = SCENE_H - GROUND_Y; // px desde abajo
  const mid = W / 2;

  return (
    <div
      className="absolute"
      style={{
        left: pet.houseX,
        bottom: baseY,
        width: W,
        height: H,
        transform: "translateX(-50%)",
        zIndex: 2,
      }}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full drop-shadow-[0_12px_0_rgba(0,0,0,0.28)]"
      >
        <defs>
          {house.stripes && <Stripes id={pet.id} color={house.roofDark} />}
        </defs>

        {/* Sombra de bloque en el suelo */}
        <rect x={70} y={H - 8} width={110} height={8} rx={2} fill="rgba(0,0,0,0.35)" />

        {/* ---------- TECHO ---------- */}
        {house.roof === "gable" ? (
          <RoofTiles id={pet.id} light={house.roofColor} dark={house.roofDark} />
        ) : (
          <g>
            {/* Losa plana moderna (Night) */}
            <rect x={12} y={46} width={W - 24} height={54} fill={house.roofColor} stroke={OUT} strokeWidth={OUT_W} />
            <rect x={8} y={38} width={W - 16} height={12} fill={house.roofDark} stroke={OUT} strokeWidth={OUT_W} />
            {/* Unidad de ventilación */}
            <rect x={mid - 26} y={30} width={52} height={12} fill={house.roofColor} stroke={OUT} strokeWidth="3" />
            <rect x={mid - 17} y={24} width={34} height={8} fill={house.roofDark} stroke={OUT} strokeWidth="3" />
          </g>
        )}

        {/* Filete bajo el techo */}
        <rect x={10} y={100} width={W - 20} height={10} fill={house.roofDark} stroke={OUT} strokeWidth={OUT_W} />
        <rect x={10} y={100} width={W - 20} height={3} fill={house.trim} />

        {/* ---------- FACHADA ---------- */}
        <rect x={16} y={110} width={W - 32} height={H - 110} fill={house.wall} stroke={OUT} strokeWidth={OUT_W} />

        {/* Sombra de bloque: banda izquierda oscura + derecha clara */}
        <rect x={16} y={110} width={30} height={H - 110} fill={house.wallDark} />
        <rect x={W - 46} y={110} width={30} height={H - 110} fill="rgba(255,255,255,0.12)" />
        <line x1={16} y1={110} x2={16} y2={H} stroke={OUT} strokeWidth={OUT_W} />
        <line x1={W - 16} y1={110} x2={W - 16} y2={H} stroke={OUT} strokeWidth={OUT_W} />

        {/* Rayas atigradas de la fachada (Shelby) */}
        {stripes && (
          <rect x={16} y={110} width={W - 32} height={H - 110} fill={stripes} />
        )}

        {/* Ladrillos en las esquinas */}
        <BrickColumn x={22} y={118} h={96} color={house.wallDark} />
        <BrickColumn x={W - 22 - 15} y={118} h={96} color={house.wallDark} />

        {/* Zócalo */}
        <rect x={16} y={H - 18} width={W - 32} height={12} fill={house.wallDark} stroke={OUT} strokeWidth="3" />

        {/* ---------- VENTANAS ---------- */}
        {house.modernWindow ? (
          <g>
            <rect x={40} y={142} width={W - 80} height={48} fill="#a7d8ff" stroke={OUT} strokeWidth={OUT_W} />
            <line x1={mid} y1={142} x2={mid} y2={190} stroke={OUT} strokeWidth="3" />
            <line x1={40} y1={166} x2={W - 40} y2={166} stroke={OUT} strokeWidth="3" />
            <rect x={34} y={190} width={W - 68} height={7} fill={house.trim} stroke={OUT} strokeWidth="3" />
          </g>
        ) : (
          <g>
            {[46, W - 46 - 50].map((wx, index) => (
              <g key={index}>
                <rect x={wx} y={140} width={50} height={56} fill="#a7d8ff" stroke={OUT} strokeWidth={OUT_W} />
                <line x1={wx + 25} y1={140} x2={wx + 25} y2={196} stroke={OUT} strokeWidth="3" />
                <line x1={wx} y1={168} x2={wx + 50} y2={168} stroke={OUT} strokeWidth="3" />
                <rect x={wx - 5} y={196} width={60} height={7} fill={house.trim} stroke={OUT} strokeWidth="3" />
                <rect x={wx + 8} y={140} width={34} height={4} fill="rgba(255,255,255,0.45)" />
              </g>
            ))}
          </g>
        )}

        {/* ---------- PUERTA (madera) ---------- */}
        <g>
          {house.door === "arch" ? (
            <path
              d={`M ${mid - 26} ${H - 18} L ${mid - 26} 204 Q ${mid - 26} 178 ${mid} 178 Q ${mid + 26} 178 ${mid + 26} 204 L ${mid + 26} ${H - 18} Z`}
              fill={house.trim}
              stroke={OUT}
              strokeWidth={OUT_W}
            />
          ) : (
            <rect x={mid - 26} y={186} width={52} height={H - 186} fill={house.trim} stroke={OUT} strokeWidth={OUT_W} />
          )}
          {/* Vetas de la madera */}
          {[mid - 17, mid - 6, mid + 5, mid + 16].map((x) => (
            <rect key={x} x={x} y={200} width={3} height={H - 204} fill="rgba(0,0,0,0.28)" />
          ))}
          {/* Bisagras y pomo pixel */}
          <rect x={mid - 23} y={204} width={4} height={8} fill={house.wall} stroke={OUT} strokeWidth="2" />
          <rect x={mid - 23} y={H - 34} width={4} height={8} fill={house.wall} stroke={OUT} strokeWidth="2" />
          <rect x={mid + 12} y={H - 38} width={6} height={6} fill="#ffd98a" stroke={OUT} strokeWidth="2" />
        </g>

        {/* ---------- PLACA DEL NOMBRE ---------- */}
        <g>
          <rect x={mid - 42} y={116} width={84} height={18} fill={house.trim} stroke={OUT} strokeWidth="3" />
          <text
            x={mid}
            y={129}
            textAnchor="middle"
            fontSize="8"
            fontWeight="400"
            fill="#fff"
            style={{
              fontFamily: "var(--font-pixel), 'Courier New', monospace",
              letterSpacing: "0.05em",
            }}
          >
            {pet.name}
          </text>
        </g>
      </svg>
    </div>
  );
}
