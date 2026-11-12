import { AccountStatus, AuthLayout } from "../auth/auth-client";

export default function AccountPage() {
  return (
    <AuthLayout title="Mon espace">
      <AccountStatus />
    </AuthLayout>
  );
}
