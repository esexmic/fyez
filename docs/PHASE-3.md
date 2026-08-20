# FASE 3 — Nuestra Historia: el libro interactivo (Completada)

La historia de la pareja como un **libro interactivo**: capítulos que se
leen a pantalla completa, cada uno bajo su propio cielo y con un sonido
suave de carrillón al abrirse.

## ✅ Qué se hizo

- **Capítulos con datos en un solo archivo**: `src/data/history/chapters.ts`
  (título, fecha, atmósfera, frase final y contenido). Contenido actual = de
  ejemplo; la interfaz no cambia al reemplazarlo.
- **Línea de tiempo del libro** (`HistoriaTimeline`): línea luminosa que une
  los capítulos, puntos dorados, entrada escalonada con blur.
- **Tarjetas de capítulo** (`ChapterCard`): numeral romano, fecha en español,
  ventana que muestra el cielo del capítulo y su nombre.
- **Lector a pantalla completa** (`ChapterReader`): transición cinematográfica
  (fade + escala + blur), carrillón suave al abrir/cerrar, cambio del cielo al
  del recuerdo, bloqueo del scroll, cierre con Escape o botón.
- **Encabezado del libro** (`HistoriaIntro`): insignia, título con shimmer y
  contador de capítulos.
- **Cielo de la página**: amanecer (un nuevo comienzo).
- **Easter eggs de FASE 3**: una estrella con mensaje por cada mascota
  (clic en su estrella del inicio) y "Un capítulo por descubrir" en el
  contador del libro.
- **Verificación**: `npm run lint` ✅, `npm run typecheck` ✅,
  `npm run build` ✅, `/` y `/historia` responden 200.

## 📁 Archivos creados

| Archivo | Función |
|---|---|
| `src/data/history/chapters.ts` | Los capítulos del libro (editable) |
| `src/components/historia/HistoriaIntro.tsx` | Encabezado del libro |
| `src/components/historia/HistoriaTimeline.tsx` | Línea de tiempo + lector |
| `src/components/historia/ChapterCard.tsx` | Tarjeta de capítulo |
| `src/components/historia/ChapterReader.tsx` | Lector a pantalla completa |
| `src/app/historia/page.tsx` | Página del libro |

## 📁 Archivos modificados

- `src/lib/easter-eggs/registry.ts` — 5 secretos nuevos de FASE 3
- `src/components/background/ParticleCanvas.tsx` — densidad de "shooting"
- `src/components/historia/HistoriaIntro.tsx` — ancla `data-chapter-start`
- `src/components/layout/Footer.tsx` — nombres de mascotas desde config

## 🆕 Componentes nuevos

| Componente | Ruta | Función |
|---|---|---|
| `HistoriaIntro` | `historia/HistoriaIntro.tsx` | Entrada del libro |
| `HistoriaTimeline` | `historia/HistoriaTimeline.tsx` | Línea + lector + secreto |
| `ChapterCard` | `historia/ChapterCard.tsx` | Nodo de la línea |
| `ChapterReader` | `historia/ChapterReader.tsx` | Lector fullscreen |

## ⚙️ Qué falta

- **Escribir la historia real** en `src/data/history/chapters.ts`
  (los 4 capítulos actuales son de ejemplo).
- FASE 4 en adelante: Recuerdos, Nube, Juegos, Cartas, Regalos, Jardín,
  Música, Calendario, Logros, Cápsulas, Secretos.

## 💡 Posibles mejoras (sin implementar)

- **Nuevos capítulos en vivo**: los capítulos no usados por persona
  aparecen como "por escribir".
- **Último capítulo** con cierre especial (texto y cielo propios).
- **Página de capítulo en URL** (`/historia/el-comienzo`) para compartir.
