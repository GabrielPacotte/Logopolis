import Link from "next/link";
import { AccountStatus, AuthLayout } from "../auth/auth-client";

export default function AccountPage() {
  return (
    <AuthLayout title="Mon espace">
      <AccountStatus />
      <p className="auth-links">
        <Link href="/auth/verification-email">Renvoyer la vérification</Link>
        <Link href="/auth">Retour à la connexion</Link>
      </p>
    </AuthLayout>
  );
}
