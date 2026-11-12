"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout, PasswordResetConfirmationForm } from "../../auth-client";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  return (
    <AuthLayout title="Choisir un nouveau mot de passe">
      {!token ? (
        <p id="invalid-link" role="alert">
          Ce lien de réinitialisation est incomplet ou invalide. Demandez un
          nouveau lien.
        </p>
      ) : null}
      <PasswordResetConfirmationForm token={token} />
      <p className="auth-links">
        <Link href="/auth/password-reset">Demander un nouveau lien</Link>
      </p>
    </AuthLayout>
  );
}

export default function PasswordResetConfirmationPage() {
  return (
    <Suspense fallback={<p>Chargement du formulaire…</p>}>
      <ConfirmationContent />
    </Suspense>
  );
}
