/**
 * ============================================================
 * LAYOUT RAÍZ — ESTRUCTURA GLOBAL DE LA APP (FASE 2)
 * ============================================================
 *
 * ¿Qué hace?
 *   Envuelve toda la aplicación: idioma, metadatos, fuentes
 *   (Geist + Playfair Display), fondo animado, navbar, footer,
 *   toasts y capa de easter eggs.
 *
 * ¿Cómo funciona?
 *   Next.js usa este archivo como envoltorio de TODAS las rutas.
 *   Las capas globales (Toast, EasterEggLayer) viven aquí y
 *   aplican a cualquier página.
 *
 * ¿Dónde modificarlo?
 *   - Nombre/descripción: src/data/config.ts
 *   - Colores/tipografías: src/app/globals.css
 *
 * ¿Qué archivos utiliza?
 *   - src/components/layout/Navbar.tsx, Footer.tsx, Background.tsx
 *   - src/components/ui/Toast.tsx
 *   - src/components/easter-eggs/EasterEggLayer.tsx
 */

import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Press_Start_2P,
} from "next/font/google";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { EasterEggLayer } from "@/components/easter-eggs/EasterEggLayer";
import { Background } from "@/components/layout/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { VisitTracker } from "@/components/logros/VisitTracker";
import { SongPlayerBar } from "@/components/musica/SongPlayerBar";
import { SongPlayerProvider } from "@/components/musica/SongPlayerContext";
import { Toast } from "@/components/ui/Toast";
import { APP } from "@/data/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Tipografía elegante para títulos (estilo editorial). */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

/** Tipografía pixelada 8-bits (jardín y detalles retro). */
const pixelFont = Press_Start_2P({
  variable: "--font-pixel-2p",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: APP.name,
  description: APP.description,
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${pixelFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <SongPlayerProvider>
            <Background>
              <Navbar />
              {children}
              <Footer />
              <VisitTracker />
            </Background>
            <SongPlayerBar />
          </SongPlayerProvider>
        </AuthProvider>
        <Toast />
        <EasterEggLayer />
      </body>
    </html>
  );
}
