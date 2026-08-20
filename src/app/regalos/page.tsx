/** Página de regalos (FASE 8). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { RegalosIntro } from "@/components/regalos/RegalosIntro";
import { GiftsGallery } from "@/components/regalos/GiftsGallery";

export default function RegalosPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="noche-magica" />
      <RegalosIntro />
      <GiftsGallery />
    </main>
  );
}