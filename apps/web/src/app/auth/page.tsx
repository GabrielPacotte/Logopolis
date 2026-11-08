import Link from "next/link";
import { AuthLayout, CredentialsForm } from "./auth-client";

export default function AuthenticationPage() {
  return (
    <AuthLayout title="Accéder à Logopolis">
      <CredentialsForm mode="login" />
      <p className="auth-links">
        <Link href="/auth/register">Créer un compte</Link>
        <Link href="/auth/password-reset">Mot de passe oublié ?</Link>
        <Link href="/auth/verification-email">Renvoyer la vérification</Link>
        <Link href="/account">Voir mon espace</Link>
      </p>
    </AuthLayout>
  );
}
