"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout, EmailActionForm, VerificationLink } from "../auth-client";

function VerificationContent() {
  const token = useSearchParams().get("token") ?? "";
  if (token) {
    return (
      <AuthLayout title="Vérifier votre adresse e-mail">
        <p>
          Pour protéger votre compte, confirmez volontairement votre adresse.
        </p>
        <VerificationLink token={token} />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout title="Renvoyer la vérification">
      <p>
        Si un compte non vérifié correspond à cette adresse, un nouveau lien
        sera préparé.
      </p>
      <EmailActionForm action="resend" />
      <p className="auth-links">
        <Link href="/auth">Retour à la connexion</Link>
      </p>
    </AuthLayout>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<p>Chargement…</p>}>
      <VerificationContent />
    </Suspense>
  );
}
