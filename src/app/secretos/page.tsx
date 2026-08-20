/** Página de secretos (FASE 14). */
import { SetAtmosphere } from "@/components/atmosphere/SetAtmosphere";
import { SecretsGallery, SecretosIntro } from "@/components/secretos/Secretos";

export default function SecretosPage() {
  return (
    <main className="relative flex-1">
      <SetAtmosphere id="noche-magica" />
      <SecretosIntro />
      <SecretsGallery />
    </main>
  );
}