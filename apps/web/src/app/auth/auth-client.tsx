"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const csrfCookieName = "XSRF-TOKEN";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, string>;
};
type ApiResult = {
  ok: boolean;
  message: string;
  user?: { email: string; emailVerified: boolean };
};

/**
 * {a browser submits an authentication request} => {sends cookies and a CSRF token for mutations, without exposing a response body in the UI}
 *
 * Effects: initializes the API anti-CSRF cookie before a state-changing request.
 * Invariants: tokens in query strings are never written to the page or browser console.
 */
async function requestAuthentication(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult> {
  try {
    const method = options.method ?? "POST";
    let csrf: string | undefined;
    if (method !== "GET") {
      await fetch(`${apiUrl}/auth/csrf`, { credentials: "include" });
      csrf = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith(`${csrfCookieName}=`))
        ?.split("=")[1];
    }
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(csrf ? { "x-xsrf-token": csrf } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    let payload: {
      message?: string;
      user?: { email: string; emailVerified: boolean };
    } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      // Successful auth endpoints intentionally have no response body.
    }
    return {
      ok: response.ok,
      message:
        payload.message ??
        (response.ok
          ? "La demande a été prise en compte."
          : "La demande a été refusée. Vérifiez les informations saisies et réessayez."),
      user: payload.user,
    };
  } catch {
    return {
      ok: false,
      message: "Le service est indisponible. Réessayez dans quelques instants.",
    };
  }
}

export function AuthLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand">
        Logopolis
      </Link>
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}

function FormMessage({ message, error }: { message?: string; error: boolean }) {
  if (!message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={error ? "auth-error" : "auth-success"}
    >
      {message}
    </p>
  );
}

export function CredentialsForm({ mode }: { mode: "register" | "login" }) {
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  const isRegister = mode === "register";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await requestAuthentication(
      isRegister ? "/auth/register" : "/auth/login",
      {
        body: {
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        },
      },
    );
    setFailed(!result.ok);
    setMessage(
      result.ok && !isRegister
        ? `Connexion établie pour ${result.user?.email ?? "votre compte"}.`
        : result.message,
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={`${mode}-email`}>Adresse e-mail</label>
      <input
        id={`${mode}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <label htmlFor={`${mode}-password`}>Mot de passe</label>
      <input
        id={`${mode}-password`}
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        minLength={isRegister ? 12 : undefined}
        required
      />
      {isRegister ? <p className="auth-help">12 à 128 caractères.</p> : null}
      <button type="submit">
        {isRegister ? "Créer mon compte" : "Se connecter"}
      </button>
      <FormMessage message={message} error={failed} />
    </form>
  );
}

export function EmailActionForm({ action }: { action: "resend" | "recovery" }) {
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  const resend = action === "resend";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await requestAuthentication(
      resend ? "/auth/verification-email" : "/auth/password-reset",
      { body: { email: String(form.get("email") ?? "") } },
    );
    setFailed(!result.ok);
    setMessage(result.message);
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={`${action}-email`}>Adresse e-mail</label>
      <input
        id={`${action}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <button type="submit">
        {resend ? "Renvoyer le lien" : "Demander un lien"}
      </button>
      <FormMessage message={message} error={failed} />
    </form>
  );
}

export function VerificationLink({ token }: { token: string }) {
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  async function verify() {
    const result = await requestAuthentication(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { method: "GET" },
    );
    setFailed(!result.ok);
    setMessage(
      result.ok
        ? "Votre adresse e-mail est vérifiée. Vous pouvez maintenant revenir à votre compte."
        : "Ce lien est invalide, expiré ou a déjà été utilisé. Demandez un nouveau lien.",
    );
  }
  return (
    <>
      <button type="button" onClick={verify} disabled={!token}>
        Vérifier mon adresse e-mail
      </button>
      <FormMessage message={message} error={failed} />
    </>
  );
}

export function PasswordResetConfirmationForm({ token }: { token: string }) {
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await requestAuthentication("/auth/password-reset/confirm", {
      body: { token, password: String(form.get("password") ?? "") },
    });
    setFailed(!result.ok);
    setMessage(
      result.ok
        ? "Votre mot de passe a été remplacé. Vous pouvez vous connecter."
        : "Ce lien est invalide, expiré ou la demande a été refusée.",
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="password">Nouveau mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        minLength={12}
        maxLength={128}
        required
        autoComplete="new-password"
      />
      <p className="auth-help">12 à 128 caractères.</p>
      <button type="submit" disabled={!token}>
        Enregistrer le mot de passe
      </button>
      <FormMessage message={message} error={failed} />
    </form>
  );
}

export function AccountStatus() {
  const [message, setMessage] = useState("Vérification de votre session…");
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    void requestAuthentication("/auth/me", { method: "GET" }).then((result) => {
      setSignedIn(result.ok);
      setMessage(
        result.ok
          ? `Connecté·e en tant que ${result.user?.email ?? "utilisateur"}${result.user?.emailVerified ? ". Adresse vérifiée." : ". Adresse non vérifiée."}`
          : "Aucune session active.",
      );
    });
  }, []);
  async function logout() {
    const result = await requestAuthentication("/auth/logout");
    setSignedIn(false);
    setMessage(result.ok ? "Vous êtes déconnecté·e." : result.message);
  }
  return (
    <>
      <p role="status">{message}</p>
      {signedIn ? <button onClick={logout}>Se déconnecter</button> : null}
    </>
  );
}
