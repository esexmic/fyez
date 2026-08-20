/** Progreso de logros de la pareja (guardado en el navegador). */
import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";

const STORAGE_KEY = "fyez:visited:sections";

export function getVisitedSections(): Set<string> {
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

export function markSectionVisited(id: string): void {
  if (typeof window === "undefined") return;
  const visited = getVisitedSections();
  if (visited.has(id)) return;
  visited.add(id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visited)));
  } catch {
    /* sin almacenamiento: se ignora */
  }
}

export function getEarnedAchievements(): Achievement[] {
  const visited = getVisitedSections();
  return ACHIEVEMENTS.filter((achievement) =>
    achievement.requiredSections.every((section) => visited.has(section)),
  );
}