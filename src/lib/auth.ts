/**
 * ============================================================
 * ACCESO CON LLAVE — QUIÉN ENTRA AL UNIVERSO
 * ============================================================
 *
 * ¿Qué hace?
 *   Puerta de entrada de la app: solo César y Sofía pueden
 *   entrar, cada uno con su contraseña (PIN). Sirve de identidad
 *   (quién escribe, quién completa logros y quién los verifica)
 *   y evita que otras personas vean los contenidos.
 *
 * ¿Cómo funciona?
 *   - Pin de César:  NEXT_PUBLIC_PIN_CESAR  (por defecto 1406)
 *   - Pin de Sofía:  NEXT_PUBLIC_PIN_SOFIA  (por defecto 1209)
 *   Los PIN se pueden cambiar en .env.local / Vercel. Son
 *   verificados en el navegador (app personal): bastan contra
 *   curiosos, no contra hackers expertos.
 *   - La sesión vive en sessionStorage: al cerrar el navegador
 *     hay que volver a entrar. Botón de salir en el navbar.
 *
 * ¿Qué archivos utiliza?
 *   - src/components/auth/AuthProvider.tsx (pantalla + contexto)
 */

export const USERS = [
  { id: "cesar", name: "César" },
  { id: "sofia", name: "Sofía" },
] as const;

export type UserId = (typeof USERS)[number]["id"];

export interface Identity {
  user: UserId;
}

const STORAGE_KEY = "fyez:identity";

/** PIN por defecto si no se configuran en .env.local */
const DEFAULT_PINS: Record<UserId, string> = {
  cesar: "3101",
  sofia: "2208",
};

export function getPinFor(user: UserId): string {
  const raw =
    user === "cesar"
      ? process.env.NEXT_PUBLIC_PIN_CESAR
      : process.env.NEXT_PUBLIC_PIN_SOFIA;
  return raw && raw.trim().length > 0 ? raw.trim() : DEFAULT_PINS[user];
}

export function getUserName(user: UserId): string {
  return USERS.find((u) => u.id === user)?.name ?? "Amigo/a";
}

export function getStoredIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Identity;
    if (parsed.user !== "cesar" && parsed.user !== "sofia") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeIdentity(user: UserId): Identity {
  const identity: Identity = { user };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    /* sin almacenamiento: la sesión dura lo que la página */
  }
  return identity;
}

export function clearIdentity(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin almacenamiento: nada que limpiar */
  }
}