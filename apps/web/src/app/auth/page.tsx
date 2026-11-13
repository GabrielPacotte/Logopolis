import Link from "next/link";
import { Suspense } from "react";
import { AuthLayout, CredentialsForm, LoginNotice } from "./auth-client";

export default function AuthenticationPage() {
  return (
    <AuthLayout title="Accéder à Logopolis">
      <Suspense fallback={null}>
        <LoginNotice />
      </Suspense>
      <CredentialsForm mode="login" />
      <p className="auth-links">
        <Link href="/auth/register">Créer un compte</Link>
        <Link href="/auth/password-reset">Mot de passe oublié ?</Link>
      </p>
    </AuthLayout>
  );
}
