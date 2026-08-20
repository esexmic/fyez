# FASE 7 â€” Cartas (Completada)

Cartas escritas para ti, bajo el cielo de lluvia, con sobres que se
abren con animaciÃ³n y estado leÃ­da/no leÃ­da guardado en el dispositivo.

## âœ… QuÃ© se hizo

- **Lista de cartas** (`LettersGallery` + `LetterCard`): filtro
  (todas / sin abrir), contador de cartas pendientes y rejilla de sobres.
- **Sobres con estado**: sin leer = sobre cerrado con sello dorado;
  leÃ­da = sello de verificaciÃ³n. El estado se guarda en el navegador
  (`src/lib/letters.ts`).
- **Apertura animada** (`LetterReader`): el sobre se abre (solapa que
  gira, el papel sube y el sello se apaga), suena un carrillÃ³n suave y
  luego se muestra la carta completa.
- **Escribir cartas desde la pÃ¡gina** (`LetterComposer`): botÃ³n
  "Escribir una carta" con formulario (tÃ­tulo + texto); al guardar la
  carta aparece en la lista como un sobre mÃ¡s.
- **Datos con proveedor desacoplado**: las cartas se leen y guardan con
  la capa de datos (`src/lib/data/`). Hoy el proveedor local las guarda
  en el navegador; cuando se conecte Supabase/Firebase (variable
  `NEXT_PUBLIC_DATABASE_PROVIDER` en `.env.local`) se migran a la nube sin tocar
  la interfaz.
- **Cartas editables** en `src/data/letters.ts` (con instrucciones
  dentro del archivo; los pÃ¡rrafos van separados por una lÃ­nea en blanco).
- **Easter egg de FASE 7**: clic en la lista de cartas (van 14 de 30+).
- **VerificaciÃ³n**: lint âœ…, typecheck âœ…, build âœ…, `/cartas` 200 âœ….

## ðŸ“ Archivos creados

| Archivo | FunciÃ³n |
|---|---|
| `src/data/letters.ts` | Las cartas (editable) |
| `src/lib/letters.ts` | Estado leÃ­da/no leÃ­da en el navegador |
| `src/components/cartas/CartasIntro.tsx` | Encabezado |
| `src/components/cartas/LetterCard.tsx` | Tarjeta de sobre (cerrado/abierto) |
| `src/components/cartas/LetterReader.tsx` | Lector con apertura animada |
| `src/components/cartas/LetterComposer.tsx` | Formulario "Escribir una carta" |
| `src/components/cartas/LettersGallery.tsx` | Lista + filtros + lector + compositor |

## ðŸ“ Archivos modificados

- `src/app/cartas/page.tsx` â€” construida (antes "PrÃ³ximamente")
- `src/data/sections.ts` â€” cartas pasa a `status: "built"`
- `src/lib/data/local-provider.ts` â€” semilla de cartas + lectura/guardado
- `src/lib/data/provider.ts` â€” contrato `addLetter` sin campo `read`
- `src/lib/easter-eggs/registry.ts` â€” secreto de FASE 7
- `cambios.txt` â€” apartado FASE 7 + estado actualizado

## âš™ï¸ QuÃ© falta

- **Tus cartas reales** en `src/data/letters.ts` (las actuales son de
  ejemplo).
- FASE 8: Regalos.

## ðŸ’¡ Posibles mejoras (sin implementar)

- **Escribir cartas**: guardar borradores, editar fechas futuras
  (cartas que solo se pueden abrir en una fecha concreta).
- **CaligrafÃ­a y sellos personalizados** por autor.
- **Cartas en la nube** cuando haya base de datos (el proveedor ya
  tiene `getLetters`/`addLetter`/`markLetterAsRead` para migrar).