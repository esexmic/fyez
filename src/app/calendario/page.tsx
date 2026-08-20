/** Página del calendario: póster unificado 2026 (FASE 11.5). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { CalendarPoster } from "@/components/calendario/CalendarPoster";

export default function CalendarioPage() {
  return (
    <main className="relative flex flex-1 flex-col">
      <SetAtmosphere id="dia-nublado" />
      <CalendarPoster />
    </main>
  );
}