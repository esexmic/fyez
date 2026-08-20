# FASE 6 — Minijuegos (Completada)

Juegos exclusivos de la pareja bajo el cielo del día cálido, con
récords guardados en el dispositivo.

## ✅ Qué se hizo

- **Catálogo de juegos** (`GamesHub` + `GameCard`): tarjetas con emoji,
  descripción, récord guardado y botón "Jugar".
- **¿Qué tan bien me conoces?** (`QuizGame`): 8 preguntas (ejemplo) con
  feedback al instante, mensaje cariñoso por pregunta, barra de progreso,
  resultado final con mensaje según la puntuación y récord guardado.
- **Memorama de nosotros** (`MemoramaGame`): 8 parejas (mascotas, café,
  luna, estrella, pastel), cartas con giro 3D, cronómetro, contador de
  movimientos, carrillón al acertar y récord guardado.
- **Récords** (`src/lib/highscores.ts`): se guardan en el navegador
  (localStorage); cada juego con su propia clave.
- **Preguntas y parejas editables** en `src/data/games.ts` (con
  instrucciones dentro del archivo).
- **Easter egg de FASE 6**: clic en el catálogo (van 13 de 30+).
- **Verificación**: lint ✅, typecheck ✅, build ✅, `/juegos` 200 ✅.

## 📁 Archivos creados

| Archivo | Función |
|---|---|
| `src/data/games.ts` | Catálogo, preguntas y parejas (editable) |
| `src/lib/highscores.ts` | Récords en el navegador |
| `src/components/juegos/GamesIntro.tsx` | Encabezado |
| `src/components/juegos/GamesHub.tsx` | Catálogo + apertura de juegos |
| `src/components/juegos/GameCard.tsx` | Tarjeta de juego |
| `src/components/juegos/QuizGame.tsx` | Juego de preguntas |
| `src/components/juegos/MemoramaGame.tsx` | Memorama |
| `src/app/juegos/page.tsx` | Página de minijuegos |

## 📁 Archivos modificados

- `src/data/sections.ts` — juegos pasa a `status: "built"`
- `src/lib/easter-eggs/registry.ts` — secreto de FASE 6
- `cambios.txt` — apartado FASE 6 + estado actualizado

## ⚙️ Qué falta

- **Tus preguntas y parejas** en `src/data/games.ts` (las actuales son
  de ejemplo).
- FASE 7: Cartas.

## 💡 Posibles mejoras (sin implementar)

- **Más juegos**: "Adivina el año", "Preguntas del mes" (cambian cada
  mes).
- **Puntuación con estrellas** y desbloqueo de logros (conecta con la
  sección Logros de la FASE 12).
- **Récords en la nube** cuando haya base de datos (highscores ya está
  preparado para migrar).
