# Fases 8–14 — Regalos, Jardín, Música, Calendario, Logros, Cápsulas y Secretos

Las siete secciones que quedaban pendientes se construyeron en una sola tanda. Todas siguen el mismo patrón: página en `src/app/<sección>/page.tsx`, componentes en `src/components/<sección>/`, datos de ejemplo en `src/data/`.

---

## Fase 8 — Regalos ✅

**Ruta:** `/regalos` · **Cielo:** noche-mágica

- `src/data/gifts.ts` — catálogo (`GIFTS`, ordenado en `GIFTS_SORTED`).
- `src/components/regalos/RegalosIntro.tsx` — encabezado.
- `src/components/regalos/GiftCard.tsx` — tarjeta que se eleva al hover.
- `src/components/regalos/GiftsGallery.tsx` — rejilla con stagger.
- `src/app/regalos/page.tsx`.

Para personalizar: edita los objetos de `GIFTS` (título, fecha ISO, emoji, descripción, nota).

## Fase 9 — Jardín ✅

**Ruta:** `/jardin` · **Cielo:** primavera

- `src/data/garden.ts` — flores con posición (% del lienzo).
- `src/lib/garden.ts` — guardado de flores que ya florecieron (localStorage `fyez:garden:bloomed`).
- `src/components/jardin/Garden.tsx` — jardín interactivo (tocar una flor la hace florecer, suena un carrillón y revela su mensaje). Contador de flores restantes.
- `src/app/jardin/page.tsx`.

Para personalizar: edita `GARDEN_FLOWERS` (mensaje, emoji, posición).

## Fase 10 — Música ✅

**Ruta:** `/musica` · **Cielo:** noche-tranquila

- `src/data/songs.ts` — canciones (`SONGS`).
- `src/components/musica/Musica.tsx` — lista numerada con motivo de cada canción.
- `src/app/musica/page.tsx`.

Para personalizar: edita `SONGS` (título, artista, emoji, motivo).

## Fase 11 — Calendario ✅

**Ruta:** `/calendario` · **Cielo:** día-nublado

- `src/data/specialDates.ts` — fechas (formato `MM-DD`, el año se ignora) + helpers `getNextSpecialDate` e `isTodaySpecial`.
- `src/components/calendario/Calendario.tsx` — tarjeta "próxima fecha" (o "hoy es especial") con animación.
- `src/components/calendario/DatesList.tsx` — todas las fechas ordenadas por mes y día.
- `src/app/calendario/page.tsx`.

Para personalizar: edita `SPECIAL_DATES` (fecha `MM-DD`, título, emoji, descripción). La tarjeta "hoy es especial" se enciende sola cuando la fecha coincide.

## Fase 12 — Logros ✅

**Ruta:** `/logros` · **Cielo:** día-cálido

- `src/data/achievements.ts` — medallas (`ACHIEVEMENTS`), cada una con las secciones que hay que visitar.
- `src/lib/achievements.ts` — registro de visitas (localStorage `fyez:visited:sections`) y cálculo de ganadas.
- `src/components/logros/VisitTracker.tsx` — registra la visita automáticamente en cada página (montado en `src/app/layout.tsx`).
- `src/components/logros/Logros.tsx` — lista con medallas ganadas (doradas) y pendientes (candado).
- `src/data/sections.ts` — añade `getSectionIdByPath` para mapear ruta → sección.
- `src/app/logros/page.tsx`.

Para personalizar: edita `ACHIEVEMENTS` (título, emoji, descripción, `requiredSections` = ids de `sections.ts`).

## Fase 13 — Cápsulas del Tiempo ✅

**Ruta:** `/capsulas` · **Cielo:** amanecer

- `src/data/capsules.ts` — cápsulas con `openDate` (ISO) a partir del cual se pueden abrir.
- `src/lib/capsules.ts` — estado de abiertas (localStorage `fyez:capsules:opened` + evento entre pestañas).
- `src/components/capsulas/Capsules.tsx` — sellada con candado y pista → abrible (se ilumina) → abierta (mensaje completo).
- `src/app/capsulas/page.tsx`.

Para personalizar: edita `CAPSULES` (título, emoji, `openDate`, mensaje, pista).

## Fase 14 — Secretos ✅

**Ruta:** `/secretos` · **Cielo:** noche-mágica

- `src/data/secrets.ts` — secretos (`SECRETS`: pista visible + texto oculto).
- `src/lib/secrets.ts` — estado de revelados (localStorage `fyez:secrets:revealed`).
- `src/components/secretos/Secretos.tsx` — tarjetas que se revelan al tocarlas (con carrillón).
- `src/app/secretos/page.tsx`.

Para personalizar: edita `SECRETS` (emoji, pista, secreto).

---

## Notas técnicas

- **Typecheck y lint:** pasan sin errores (`npx tsc --noEmit`, `npm run lint`).
- **sections.ts:** las 7 secciones cambiaron a `status: "built"` y sus fases reales (8–14). `SectionPlaceholder` ya no se usa en ninguna página.
- **Iconos:** se reutilizaron iconos de lucide existentes (Gift, Leaf, Music, CalendarHeart, Trophy, Hourglass, MoonStar, Lock, Unlock).
- **Persistencia:** los estados interactivos (flores, cápsulas, secretos, visitas) viven en el navegador de cada dispositivo. Si quieres que también se sincronicen en la nube (como las cartas), dime y conecto los que quieras a Supabase.