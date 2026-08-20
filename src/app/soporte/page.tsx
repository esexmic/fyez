/** Página de Soporte — reporte de fallas (FASE 15). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { SoporteGallery, SoporteIntro } from "@/components/soporte/Soporte";

export default function SoportePage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="primavera" />
      <SoporteIntro />
      <SoporteGallery />
    </main>
  );
}