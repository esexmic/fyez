# FASE 2 — Diseño de la pantalla principal (Completada)

Dirección artística: **"Noche de Obsidiana"** — un cielo nocturno premium,
íntimo y cinematográfico. Nada infantil: elegancia, profundidad y detalles.

## ✅ Qué se hizo

- **Tema visual completo** en `globals.css`: paleta de la noche (nunca negro
  puro), tokens de color, 9 animaciones base (flotar, brillo, destello,
  derivas, ecualizador, latido, ripple, shimmer) y respeto a
  `prefers-reduced-motion`.
- **Fondo vivo**: canvas de estrellas con parpadeo individual, estrellas
  fugaces cada 5-12 s, parallax suave con el mouse, nebulosas violeta/rosa en
  movimiento lento, luna con halo y viñeta de profundidad.
- **Hero cinematográfico**: título Playfair con degradado brillante animado,
  subtítulo, contador de días juntos, botones con glow/ripple y destellos.
- **12 tarjetas glass** (Historia, Recuerdos, Nube, Juegos, Cartas, Regalos,
  Jardín, Música, Calendario, Logros, Cápsulas del Tiempo, Secretos) con
  flotación, inclinación y borde brillante al hover.
- **Navbar glass** que cambia al hacer scroll, menú móvil animado y botón de
  música con ecualizador (solo diseño).
- **Footer elegante** con línea de brillo y corazón latiendo.
- **Toasts "Próximamente"** para todos los botones sin destino.
- **Luz que sigue al cursor** (solo PC) para la sensación premium.
- **3 primeros easter eggs**: clic en la luna, escribir "amor", y
  permanecer 30 s en la página.
- **8 páginas internas** con placeholder premium (las 12 secciones navegables).

## 📁 Archivos modificados

- `src/app/globals.css` — tema completo de la fase
- `src/app/layout.tsx` — fuente Playfair, PointerGlow, Toast, viewport
- `src/app/page.tsx` — Hero + SectionGrid
- `src/data/sections.ts` — 12 secciones con icono, acento y navbar
- `src/components/layout/Navbar.tsx`, `Footer.tsx`, `Background.tsx`
- `src/components/ui/Button.tsx`, `ComingSoon.tsx`
- `src/components/shared/SectionPlaceholder.tsx` (nuevo diseño)
- `src/components/easter-eggs/EasterEggLayer.tsx` (motor activo)
- `src/lib/easter-eggs/registry.ts` (3 secretos)
- `package.json` — se añadió lucide-react

## 🆕 Componentes nuevos

| Componente | Ruta | Función |
|---|---|---|
| `StarrySky` | `background/StarrySky.tsx` | Canvas: estrellas, fugaces, parallax |
| `Nebula` | `background/Nebula.tsx` | Nebulosas, luna, viñeta |
| `Hero` | `home/Hero.tsx` | Portada principal |
| `SectionCard` | `home/SectionCard.tsx` | Tarjeta glass de sección |
| `SectionGrid` | `home/SectionGrid.tsx` | Rejilla con entrada escalonada |
| `Toast` | `ui/Toast.tsx` + `lib/toast.ts` | Notificaciones flotantes |
| `PointerGlow` | `ui/PointerGlow.tsx` | Luz que sigue al cursor |
| `MusicButton` | `ui/MusicButton.tsx` | Botón música (diseño) |
| `SectionIcon` | `icons/sectionIcons.tsx` | Iconos por sección |
| `useScrolled` | `lib/hooks/useScrolled.ts` | Detección de scroll |

## ⚙️ Qué falta por desarrollar

- FASE 3: Nuestra Historia (funcional).
- Conectar la música real al MusicButton (hook useAudio ya listo).
- Más easter eggs (vamos 3 de 30+).
- Cambiar la fecha de aniversario en `src/data/config.ts` (hoy es 1/1/2020).

## 💡 Posibles mejoras (sin implementar)

- **PWA**: instalar la app en el celular.
- **Modo "día"** como contraste opcional (no recomendado para este tema).
- **Sonido de clic** sutil en botones (cuando exista la música).
- **Git**: inicializar repositorio para registrar cada fase.
- Más capas de parallax (nubes lentas en primer plano).
