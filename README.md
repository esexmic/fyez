# Nuestro Universo

Un lugar privado y especial donde se guarda la historia de una pareja: capítulos de historia, recuerdos, fotos, cartas, juegos y tesoros que se acumulan con los años.

> **Estado actual:** Todo en la nube (Supabase) — 11 secciones activas, sesiones para los dos, contenido editable desde cada página.

---

## Inicio rápido

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:3000)
```

Comandos de calidad:

```bash
npm run lint       # revisión de código
npm run typecheck  # revisión de tipos TypeScript
npm run build      # compilación de producción
```

---

## Estructura del proyecto

```
src/
├── app/                  # Páginas y rutas (Next.js App Router)
│   ├── page.tsx          # Inicio (diseño en FASE 2)
│   ├── historia/         # Nuestra Historia (FASE 3)
│   ├── recuerdos/        # Recuerdos (FASE 4)
│   ├── juegos/           # Minijuegos (FASE 6)
│   ├── cartas/           # Cartas (FASE 7)
│   ├── regalos/          # Regalos (FASE 8)
│   ├── musica/           # Música (FASE 10)
│   ├── calendario/       # Calendario (FASE 11)
│   ├── logros/           # Logros (FASE 12)
│   ├── capsulas/         # Cápsulas del Tiempo (FASE 13)
│   └── secretos/         # Secretos (FASE 14)
├── components/
│   ├── layout/           # Navbar, Footer, Background
│   ├── ui/               # Button, Card, Section, Modal, ComingSoon
│   ├── home/             # Hero, SectionGrid, SectionCard
│   ├── historia/         # Línea de tiempo y lector del libro (FASE 3)
│   ├── recuerdos/        # Galería y lightbox (FASE 4)
│   ├── juegos/           # Quiz y Memorama (FASE 6)
│   ├── cartas/           # Buzón y lector de cartas (FASE 7)
│   ├── regalos/          # Galería de regalos (FASE 8)
│   ├── musica/           # Reproductor y playlist (FASE 10)
│   ├── calendario/       # Póster del calendario (FASE 11)
│   ├── logros/           # Logros con verificación (FASE 12)
│   ├── capsulas/         # Cápsulas del tiempo (FASE 13)
│   ├── secretos/         # Secretos con fecha de apertura (FASE 14)
│   ├── background/       # AtmosphereSky, ParticleCanvas, PetStars
│   ├── atmosphere/       # SetAtmosphere (cielo por página)
│   └── easter-eggs/      # EasterEggLayer (ejecución de secretos)
├── data/
│   ├── config.ts         # Nombres, aniversario, mascotas
│   ├── atmospheres.ts    # Los 9 cielos (fuente única)
│   ├── sections.ts       # Catálogo de secciones (fuente única)
│   └── history/
│       └── chapters.ts   # Capítulos del libro (FASE 3, editable)
│   └── memories.ts       # Recuerdos de la galería (FASE 4, editable)
│   └── games.ts          # Preguntas y parejas de juegos (FASE 6, editable)
├── lib/
│   ├── constants.ts      # Rutas y duraciones
│   ├── utils/cn.ts       # Unión de clases CSS
│   ├── hooks/useAudio.ts # Control de música de fondo
│   ├── easter-eggs/      # Registro de secretos (30+ planificados)
│   └── data/             # Capa de datos desacoplada (solo Supabase)
│       ├── types.ts      # Contratos de datos (Memory, Letter...)
│       ├── provider.ts   # Interfaz del proveedor
│       ├── index.ts      # Proveedor activo (siempre la nube)
│       └── supabase/     # Implementación de la nube
public/
├── audio/                # Música y sonidos (FASE 2)
├── images/               # Fotos de los recuerdos
└── fonts/                # Tipografías personalizadas
docs/
├── WORKFLOW.md           # Reglas de trabajo entre fases
├── ROADMAP.md            # Plan de fases
├── ARCHITECTURE.md       # Arquitectura detallada
└── PHASE-1.md            # Resumen de la FASE 1
```

---

## Cómo se trabaja este proyecto

Este proyecto se construye **fase por fase**, con aprobación después de cada una.
Consulta `docs/WORKFLOW.md` para conocer las reglas y `docs/ROADMAP.md` para el plan completo.

- [Reglas de trabajo](docs/WORKFLOW.md)
- [Plan de fases](docs/ROADMAP.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Resumen FASE 1](docs/PHASE-1.md)
- [Resumen FASE 2](docs/PHASE-2.md)
- [Resumen FASE 3](docs/PHASE-3.md)
- [Resumen FASE 4](docs/PHASE-4.md)
- [Resumen FASE 5](docs/PHASE-5.md)
- [Resumen FASE 6](docs/PHASE-6.md)
