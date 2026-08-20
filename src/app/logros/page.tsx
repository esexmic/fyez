/** Página de logros (FASE 12). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { LogrosGallery, LogrosIntro } from "@/components/logros/Logros";

export default function LogrosPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="atardecer" />
      <LogrosIntro />
      <LogrosGallery />
    </main>
  );
}