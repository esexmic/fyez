/**
 * ============================================================
 * AUTH PROVIDER — PUERTA CON LLAVE DE LA APP
 * ============================================================
 *
 * ¿Qué hace?
 *   Decide quién está dentro de la app. Si nadie ha entrado,
 *   muestra la pantalla de acceso y oculta todo el contenido.
 *   Expone la identidad (César / Sofía) a cualquier página.
 *
 * ¿Cómo funciona?
 *   - El usuario elige quién es y escribe su PIN (ver
 *     src/lib/auth.ts). Si coincide, se guarda la sesión.
 *   - useAuth() devuelve { identity, name, logout }.
 *
 * ¿Qué archivos utiliza?
 *   - src/lib/auth.ts (PINs, sesión)
 *   - src/app/layout.tsx (envuelve toda la app)
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Heart } from "lucide-react";
import { KeyRound } from "lucide-react";
import { motion } from "motion/react";

import {
  clearIdentity,
  getPinFor,
  getStoredIdentity,
  getUserName,
  storeIdentity,
  USERS,
  type Identity,
  type UserId,
} from "@/lib/auth";
import { cn } from "@/lib/utils/cn";

interface AuthValue {
  identity: Identity | null;
  name: string;
  logout: () => void;
}

const AuthContext = createContext<AuthValue>({
  identity: null,
  name: "",
  logout: () => {},
});

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}

/** Pantalla de acceso con llave. */
function AuthScreen({ onSuccess }: { onSuccess: (identity: Identity) => void }) {
  const [selected, setSelected] = useState<UserId>("cesar");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function tryEnter() {
    if (pin.trim() === getPinFor(selected)) {
      onSuccess(storeIdentity(selected));
      return;
    }
    setError(true);
    setTimeout(() => setError(false), 600);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-night-950 px-4">
      {/* Resplandores de fondo */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 size-96 rounded-full bg-violet-glow/15 blur-[120px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-1/4 size-96 rounded-full bg-pink-glow/15 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-night-900/80 p-8 text-center shadow-[0_30px_90px_-30px_rgba(10,14,30,1)] backdrop-blur-xl"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-glow to-pink-glow shadow-[0_8px_30px_-8px_rgba(141,130,214,0.7)]">
          <Heart className="size-6 fill-primary text-primary" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-primary">
          Nuestro Universo
        </h1>
        <p className="mt-2 text-sm text-starlight/75">
          Este lugar es solo nuestro. Di quién eres y entra con tu llave.
        </p>

        {/* Quién eres */}
        <div className="mt-6 flex gap-2">
          {USERS.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                setSelected(user.id);
                setPin("");
                setError(false);
              }}
              aria-pressed={selected === user.id}
              className={cn(
                "h-11 flex-1 cursor-pointer rounded-full border text-sm font-medium transition-all duration-300 active:scale-[0.97]",
                selected === user.id
                  ? "border-purple-glow/50 bg-purple-glow/10 text-primary"
                  : "glass text-starlight/80 hover:border-white/25",
              )}
            >
              Soy {user.name}
            </button>
          ))}
        </div>

        {/* Llave */}
        <label className="mt-5 flex flex-col gap-1.5 text-left">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-starlight/70">
            Llave de {getUserName(selected)}
          </span>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            maxLength={8}
            onChange={(event) => {
              setPin(event.target.value);
              setError(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") tryEnter();
            }}
            placeholder="••••"
            aria-label={`Llave de ${getUserName(selected)}`}
            className={cn(
              "h-12 rounded-xl border bg-night-800/60 px-4 text-center text-lg tracking-[0.5em] text-primary",
              "placeholder:text-starlight/25",
              "outline-none transition-colors focus:border-purple-glow/60",
              error ? "border-red-400/60" : "border-white/10",
            )}
          />
          {error ? (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center text-xs text-red-400"
            >
              Esa no es la llave… inténtalo otra vez.
            </motion.p>
          ) : (
            <p className="text-center text-[10px] text-starlight/40">
              Pide tu pin a Cesar, en caso de perderlo comunicaselo.
            </p>
          )}
        </label>

        <button
          type="button"
          onClick={tryEnter}
          disabled={pin.length === 0}
          className={cn(
            "mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium",
            "bg-gradient-to-r from-violet-glow via-purple-glow to-pink-glow text-primary",
            "shadow-[0_8px_30px_-10px_rgba(160,138,216,0.5)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
          )}
        >
          <KeyRound className="size-4" />
          Entrar
        </button>
      </motion.div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIdentity(getStoredIdentity());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const value: AuthValue = {
    identity,
    name: identity ? getUserName(identity.user) : "",
    logout: () => {
      clearIdentity();
      setIdentity(null);
    },
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={value}>
      {identity ? children : <AuthScreen onSuccess={setIdentity} />}
    </AuthContext.Provider>
  );
}