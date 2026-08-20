# Arquitectura — Nuestro Universo

## Base tecnológica

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | Next.js 16 (App Router) | Escalable, SEO, rutas por carpeta, óptimo en rendimiento |
| Lenguaje | TypeScript (strict) | Evita errores, código autodocumentado |
| Estilos | Tailwind CSS v4 | Diseño rápido, tokens centralizados |
| Animaciones | Motion (Framer Motion) | Animaciones fluidas de nivel premium |
| Utilidades | clsx + tailwind-merge | Combinación de clases segura |
| Música | Hook propio useAudio | Control total, sin librerías pesadas |
| Datos | Capa desacoplada (local → Supabase/Firebase) | Cambiar de base sin tocar la interfaz |

## Principios

1. **Desacoplamiento total de datos:** la interfaz habla solo con `src/lib/data/index.ts`. La base (local, Supabase o Firebase) se cambia en un solo lugar.
2. **Fuente única de verdad:** secciones y configuración viven en `src/data/` (config.ts y sections.ts).
3. **Componentes base reutilizables:** Button, Card, Section, Modal, ComingSoon en `src/components/ui/`.
4. **Sin archivos gigantes:** funciones pequeñas, cada componente en su archivo.
5. **Comentado en español:** cada módulo explica qué hace, cómo funciona, dónde modificarlo y qué archivos usa.

## Flujo de datos

```
Página (src/app/...) 
   │ importa
   ▼
Componentes de sección (src/components/...)
   │ importan
   ▼
Capa de datos (src/lib/data/index.ts → getActiveProvider())
   │ elige según .env
   ▼
local-provider.ts   |   supabase/provider.ts (futuro)   |   firebase/provider.ts (futuro)
```

Ejemplo de uso en un componente (FASE 3+):

```ts
import { data } from "@/lib/data";

// Lee los capítulos de la historia
const chapters = await data.getStoryChapters();
```

## Añadir una sección nueva

1. Crear carpeta en `src/app/` (ej: `viajes/page.tsx`).
2. Agregarla al array `SECTIONS` en `src/data/sections.ts`.
3. El Navbar y el Footer la muestran automáticamente.

## Añadir un easter egg (secreto)

1. Registrar en `src/lib/easter-eggs/registry.ts` un objeto `EasterEgg`.
2. Ampliar `EasterEggLayer` si el tipo de disparador lo requiere.
3. Cada secreto es independiente y no afecta el funcionamiento principal.

## Conectar Supabase (cuando se decida)

1. `npm install @supabase/supabase-js`
2. Completar `src/lib/data/supabase/provider.ts` implementando `DataProvider`.
3. Llenar `.env.local` (ver `.env.example`).
4. Cambiar `DATABASE_PROVIDER=supabase` en `.env.local`.
5. Activar el proveedor en `src/lib/data/index.ts`.

La interfaz no requiere ningún cambio.

## Rendimiento

- **Lazy loading** para imágenes y componentes pesados (fases 2+).
- **next/image** para optimizar fotos automáticamente.
- Carga diferida de las secciones con `next/dynamic` si es necesario.
- Estilos y JS mínimos por página (App Router).

## Accesibilidad

- HTML semántico (header, nav, main, section, footer).
- aria-label en elementos interactivos.
- Soporte de teclado (Escape cierra ventanas).
- Contraste pensado para el tema definitivo (FASE 2).
