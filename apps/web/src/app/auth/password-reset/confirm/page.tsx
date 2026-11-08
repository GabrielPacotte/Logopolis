"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const csrfCookieName = "XSRF-TOKEN";

function PasswordResetConfirmationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch(`${apiUrl}/auth/csrf`, { credentials: "include" });
    const csrf = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${csrfCookieName}=`))
      ?.split("=")[1];
    const response = await fetch(`${apiUrl}/auth/password-reset/confirm`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-xsrf-token": csrf } : {}),
      },
      body: JSON.stringify({ token, password: form.get("password") }),
    });
    setMessage(
      response.ok
        ? "Votre mot de passe a été remplacé."
        : "Ce lien est invalide, expiré ou la demande a été refusée.",
    );
  }

  return (
    <main>
      <h1>Choisir un nouveau mot de passe</h1>
      {!token ? (
        <p id="invalid-link" role="alert">
          Ce lien de réinitialisation est incomplet ou invalide. Demandez un
          nouveau lien.
        </p>
      ) : null}
      <form onSubmit={submit}>
        <label htmlFor="password">Nouveau mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={12}
          required
          autoComplete="new-password"
          aria-describedby={token ? undefined : "invalid-link"}
        />
        <button type="submit" disabled={!token}>
          Enregistrer le mot de passe
        </button>
      </form>
      {message ? <p role="status">{message}</p> : null}
    </main>
  );
}

export default function PasswordResetConfirmationPage() {
  return (
    <Suspense fallback={<p>Chargement du formulaire…</p>}>
      <PasswordResetConfirmationForm />
    </Suspense>
  );
}
