/** Página de música (FASE 10). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { MusicaIntro, SongsList } from "@/components/musica/Musica";

export default function MusicaPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="noche-tranquila" />
      <MusicaIntro />
      <SongsList />
    </main>
  );
}