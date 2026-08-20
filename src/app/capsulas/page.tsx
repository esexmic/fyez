/** Página de cápsulas del tiempo (FASE 13). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { CapsulesGallery, CapsulasIntro } from "@/components/capsulas/Capsules";

export default function CapsulasPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="amanecer" />
      <CapsulasIntro />
      <CapsulesGallery />
    </main>
  );
}