/** Estado de las cápsulas del tiempo (guardado en el navegador). */
const STORAGE_KEY = "fyez:capsules:opened";

const REOPEN_EVENT = "fyez:capsules-changed";

export function getOpenedCapsules(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(
      Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [],
    );
  } catch {
    return new Set();
  }
}

export function openCapsule(id: string): void {
  if (typeof window === "undefined") return;
  const opened = getOpenedCapsules();
  opened.add(id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(opened)));
    window.dispatchEvent(new Event(REOPEN_EVENT));
  } catch {
    /* sin almacenamiento: se ignora */
  }
}

/** Evento para que varias pestañas estén al día. */
export function onCapsulesChanged(callback: () => void): () => void {
  window.addEventListener(REOPEN_EVENT, callback);
  return () => window.removeEventListener(REOPEN_EVENT, callback);
}