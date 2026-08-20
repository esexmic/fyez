# FASE 5 — Nube de Recuerdos (Completada)

Fragmentos que flotan en el cielo de la noche tranquila: nubes con
frases cortas y estrellas cerradas que esconden los recuerdos más
mágicos. Tocar un fragmento lo revela con un carrillón.

## ✅ Qué se hizo

- **Cielo de fragmentos** (`CloudSky`): lienzo alto y nocturno donde
  cada fragmento flota con su propia posición (x, y) y su propio ritmo
  de flotación (retraso y duración distintos).
- **Nubes abiertas**: píldoras de cristal con emoji y frase corta.
- **Estrellas cerradas** (`locked`): brillan doradas; al tocarlas se
  revela el recuerdo con un estallido de destellos.
- **Revelado cinematográfico** (`CloudReveal`): fade + escala + blur,
  carrillón suave al abrir, Escape o clic fuera para cerrar, bloqueo
  de scroll.
- **Datos de ejemplo** en `src/data/cloudMemories.ts` (8 fragmentos con
  frases, textos, emojis, posiciones y 3 estrellas cerradas).
- **Easter egg de FASE 5**: clic en el cielo de la nube + secreto al
  abrir 3 fragmentos en una sesión.
- **Verificación**: lint ✅, typecheck ✅, build ✅, `/nube` 200 ✅.

## 📁 Archivos creados

| Archivo | Función |
|---|---|
| `src/data/cloudMemories.ts` | Los fragmentos flotantes (editable) |
| `src/components/nube/NubeIntro.tsx` | Encabezado de la nube |
| `src/components/nube/CloudSky.tsx` | Lienzo + gestión del revelado |
| `src/components/nube/CloudFragment.tsx` | Nube o estrella flotante |
| `src/components/nube/CloudReveal.tsx` | Modal de revelado |
| `src/app/nube/page.tsx` | Página de la nube |

## 📁 Archivos modificados

- `src/lib/data/types.ts` — nuevo tipo `CloudMemory`
- `src/data/sections.ts` — nube pasa a `status: "built"`
- `src/lib/easter-eggs/registry.ts` — secreto de FASE 5 (van 11 de 30+)

## ⚙️ Qué falta

- **Tus textos** en `src/data/cloudMemories.ts` (frase corta visible +
  texto que se revela; puedes moverlas con x/y).
- FASE 6: Minijuegos.

## 💡 Posibles mejoras (sin implementar)

- **Nube que crece**: cada recuerdo nuevo agrega una nube más al cielo.
- **Movimiento con el mouse**: parallax al pasar el cursor.
- **Constelación**: unir las estrellas con líneas para descubrir una
  forma.
