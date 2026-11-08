import Link from "next/link";
import { AuthLayout, EmailActionForm } from "../auth-client";

export default function PasswordResetPage() {
  return (
    <AuthLayout title="Récupérer votre compte">
      <p>
        Nous vous indiquerons la suite à donner sans révéler si cette adresse
        possède un compte.
      </p>
      <EmailActionForm action="recovery" />
      <p className="auth-links">
        <Link href="/auth">Retour à la connexion</Link>
      </p>
    </AuthLayout>
  );
}
