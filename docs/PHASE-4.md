# FASE 4 — Recuerdos: la galería (Completada)

Los momentos de la pareja en una galería bajo el cielo del atardecer:
fotos, videos y notas, con vista ampliada y navegación con teclado.

## ✅ Qué se hizo

- **Galería con filtros** (`MemoriesGallery`): Todos / Fotos / Videos /
  Notas, con contador de momentos.
- **Tarjetas de recuerdo** (`MemoryCard`): foto (next/image con lazy
  loading), video con botón de reproducir o nota; sin foto aún se ve un
  "cielo de recuerdo" (emoji + gradiente) hasta que agregues la real.
- **Lightbox a pantalla completa** (`Lightbox`): flechas, teclado
  (← → Esc), cierre con clic fuera, contador (1/9), carrillón suave al
  abrir, bloqueo de scroll.
- **Carga por lotes** (9 de 9 con "Cargar más") para crecer a cientos o
  miles de recuerdos sin perder rendimiento.
- **Datos de ejemplo** en `src/data/memories.ts` (9 recuerdos alrededor de
  sus fechas reales: aniversario, cumpleaños, mascotas...).
- **Insignia "En vivo"** en las tarjetas del inicio para secciones ya
  construidas (corazón latiendo) en lugar de "Próximamente".
- **Easter egg de FASE 4**: clic en la galería ("La guardiana de la
  galería") + secreto al abrir 5 recuerdos en una sesión.
- **Verificación**: lint ✅, typecheck ✅, build ✅, `/recuerdos` 200 ✅.

## 📁 Archivos creados

| Archivo | Función |
|---|---|
| `src/data/memories.ts` | Los recuerdos (editable) |
| `src/components/recuerdos/MemoriesIntro.tsx` | Encabezado de la galería |
| `src/components/recuerdos/MemoriesGallery.tsx` | Filtros + rejilla + lightbox |
| `src/components/recuerdos/MemoryCard.tsx` | Tarjeta de recuerdo |
| `src/components/recuerdos/Lightbox.tsx` | Visor a pantalla completa |
| `src/app/recuerdos/page.tsx` | Página de la galería |

## 📁 Archivos modificados

- `src/lib/data/types.ts` — Memory: `url` opcional + `emoji` y `tint`
- `src/data/sections.ts` — recuerdos pasa a `status: "built"`
- `src/components/home/SectionCard.tsx` — insignia "En vivo" si está built
- `src/lib/easter-eggs/registry.ts` — secreto de FASE 4 (van 9 de 30+)

## ⚙️ Qué falta

- **Fotos reales**: copiar archivos a `public/images/recuerdos/` y poner
  la `url` en `src/data/memories.ts` (instrucciones dentro del archivo).
- FASE 5: Nube de Recuerdos.

## 💡 Posibles mejoras (sin implementar)

- **Búsqueda** por etiquetas (el campo `tags` ya existe).
- **Álbumes** (agrupar por viaje, año, persona).
- **Descarga** de la foto desde el lightbox.
- Guardado en Supabase/Firebase cuando se conecte (el tipo ya lo soporta).
