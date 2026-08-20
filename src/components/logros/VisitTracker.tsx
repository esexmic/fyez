/** Registra la visita a la sección actual para los logros. */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getSectionIdByPath } from "@/data/sections";
import { markSectionVisited } from "@/lib/achievements";

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sectionId = getSectionIdByPath(pathname);
    if (sectionId) markSectionVisited(sectionId);
  }, [pathname]);

  return null;
}