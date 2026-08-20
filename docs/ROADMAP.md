# Roadmap — Nuestro Universo

Plan de construcción por fases. Cada fase requiere aprobación antes de pasar a la siguiente.

---

## Fase 1 — Arquitectura ✅ COMPLETADA

- Estructura de carpetas y configuración del proyecto.
- Componentes base sin diseño.
- Capa de datos desacoplada (local hoy, Supabase/Firebase mañana).
- Documentación y reglas de trabajo.

## Fase 2 — Pantalla principal (diseño) ✅ COMPLETADA

- Fondo animado, partículas y efectos visuales.
- Navbar con glassmorphism y menú móvil.
- Botones y tarjetas con estilo premium.
- Footer, música de fondo, iconos, transiciones.
- Todos los botones funcionan pero muestran "Próximamente".
- Primeros easter eggs del sitio.

## Fase 2.5 — Rediseño de identidad ✅ COMPLETADA

- Cielos y atmósferas por sección (9 atmósferas).
- Partículas por cielo (estrellas, lluvia, hojas, pétalos...).
- Datos reales de la pareja y las mascotas.
- Estrellas de las mascotas en el inicio.

## Fase 3 — Nuestra Historia ✅ COMPLETADA

- Línea de tiempo con capítulos.
- Lector a pantalla completa con cielo y sonido por capítulo.
- Conexión con la capa de datos (StoryChapter).
- Contenido actual = de ejemplo (editar `src/data/history/chapters.ts`).

## Fase 4 — Recuerdos ✅ COMPLETADA

- Galería de fotos, videos y notas con lazy loading.
- Vista ampliada con animación (lightbox + teclado).
- Carga por lotes para soportar miles de elementos.
- Contenido actual = de ejemplo (editar `src/data/memories.ts`).

## Fase 5 — Nube de recuerdos ✅ COMPLETADA

- Fragmentos flotantes interactivos.
- Estrellas que desbloquean recuerdos.
- Experiencia de exploración.

## Fase 6 — Minijuegos ✅ COMPLETADA

- Juegos exclusivos de la pareja.
- Puntuaciones guardadas.

## Fase 7 — Cartas ✅ COMPLETADA

- Cartas escritas con animación de apertura.
- Estados de leída/no leída.
- Conectada a Supabase (las cartas viven en la nube).

## Fase 8 — Regalos ✅ COMPLETADA

- Catálogo de regalos con fecha, emoji y nota.
- Contenido de muestra (editar `src/data/gifts.ts`).

## Fase 9 — Jardín ✅ COMPLETADA

- Jardín interactivo: flores que florecen al tocarlas.
- Lo florecido se guarda en el navegador.
- Contenido de muestra (editar `src/data/garden.ts`).

## Fase 10 — Música ✅ COMPLETADA

- Catálogo "la banda sonora de nosotros".
- Contenido de muestra (editar `src/data/songs.ts`).

## Fase 11 — Calendario ✅ COMPLETADA

- Tarjeta de la próxima fecha especial.
- Lista de todas las fechas (ordenadas por mes).
- Contenido de muestra (editar `src/data/specialDates.ts`).

## Fase 12 — Logros ✅ COMPLETADA

- Medallas que se ganan visitando secciones.
- El progreso se guarda en el navegador.

## Fase 13 — Cápsulas del Tiempo ✅ COMPLETADA

- Cápsulas selladas hasta su fecha de apertura.
- Las ya abiertas quedan marcadas.
- Contenido de muestra (editar `src/data/capsules.ts`).

## Fase 14 — Secretos ✅ COMPLETADA

- Tarjetas con secretos que se revelan al tocarlas.
- Los revelados quedan marcados.
- Contenido de muestra (editar `src/data/secrets.ts`).

---

## Estado de las secciones

| Sección | Ruta | Fase | Estado |
|---|---|---|---|
| Inicio | `/` | 2 | ✅ Construido |
| Nuestra Historia | `/historia` | 3 | ✅ Construido |
| Recuerdos | `/recuerdos` | 4 | ✅ Construido |
| Nube de Recuerdos | `/nube` | 5 | ✅ Construido |
| Minijuegos | `/juegos` | 6 | ✅ Construido |
| Cartas | `/cartas` | 7 | ✅ Construido |
| Regalos | `/regalos` | 8 | ✅ Construido |
| Jardín | `/jardin` | 9 | ✅ Construido |
| Música | `/musica` | 10 | ✅ Construido |
| Calendario | `/calendario` | 11 | ✅ Construido |
| Logros | `/logros` | 12 | ✅ Construido |
| Cápsulas del Tiempo | `/capsulas` | 13 | ✅ Construido |
| Secretos | `/secretos` | 14 | ✅ Construido |

## Fases futuras (ideas, sin implementar)

- Eventos según la fecha (cumpleaños, aniversario) con sorpresas.
- Subida real de fotos y videos (hoy se editan en `src/data`).
- Más easter eggs (objetivo: 30+).