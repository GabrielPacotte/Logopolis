import Link from "next/link";
import { AuthLayout, CredentialsForm } from "../auth-client";

export default function RegistrationPage() {
  return (
    <AuthLayout title="Créer un compte">
      <CredentialsForm mode="register" />
      <p className="auth-links">
        Déjà inscrit·e ? <Link href="/auth">Se connecter</Link>
      </p>
    </AuthLayout>
  );
}
