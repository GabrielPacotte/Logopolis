"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

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
type FieldErrors = Record<string, string>;

/** {a browser makes an authentication request} => {sends credentials with CSRF protection and returns only safe display data}
 * Errors: converts network and public API errors into an actionable message without exposing internals.
 * Effects: initializes Shield's CSRF cookie before mutations.
 * Invariants: query-string tokens and response payloads are never logged or rendered verbatim.
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
      /* no-content is expected */
    }
    return {
      ok: response.ok,
      message:
        payload.message ??
        (response.ok
          ? "La demande a été prise en compte."
          : "La demande n’a pas pu être traitée. Réessayez dans quelques instants."),
      user: payload.user,
    };
  } catch {
    return {
      ok: false,
      message: "Le service est indisponible. Réessayez dans quelques instants.",
    };
  }
}

/**
 * {PRÉCONDITIONS} => {POSTCONDITIONS}
 *
 * Préconditions : `email` est la valeur brute courante du formulaire ;
 * `password` et `confirmation`, lorsqu’ils sont présents, sont leurs valeurs
 * brutes courantes. Cette fonction ne doit pas servir à déterminer si un
 * compte existe.
 *
 * Postconditions : renvoie une nouvelle table champ→message ne contenant que
 * les refus déterministes et sûrs côté client pour les valeurs fournies ; les
 * champs valides sont absents. Elle ne renvoie ni mot de passe, ni jeton, ni
 * erreur serveur, ni information sur l’existence d’un compte.
 *
 * Erreurs/refus : aucune exception n’est levée pour une saisie, même vide.
 * Effets/invariants : aucun effet de bord ; préserve l’invariant
 * d’anti-énumération en ne validant que la syntaxe et la politique de mot de
 * passe.
 */
function validationErrors(
  email: string,
  password?: string,
  confirmation?: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = "Indiquez votre adresse e-mail.";
  else if (!/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Indiquez une adresse e-mail valide.";
  if (password !== undefined && (password.length < 12 || password.length > 128))
    errors["password"] =
      "Le mot de passe doit compter entre 12 et 128 caractères.";
  if (confirmation !== undefined && password !== confirmation)
    errors.confirmation = "Les deux mots de passe sont différents.";
  return errors;
}

export function AuthLayout({
  children,
  title,
  eyebrow = "Authentification",
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
}) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link href="/" className="auth-brand">
          Logopolis
        </Link>
        <span aria-hidden="true" className="auth-rule" />
      </header>
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-eyebrow">{eyebrow}</p>
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}

function FormMessage({
  message,
  error,
}: {
  message?: string;
  error?: boolean;
}) {
  return message ? (
    <p
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      className={error ? "auth-error" : "auth-success"}
    >
      {message}
    </p>
  ) : null;
}
function FieldError({ id, children }: { id: string; children?: string }) {
  return children ? (
    <p id={id} className="field-error">
      {children}
    </p>
  ) : null;
}

export function CredentialsForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const isRegister = mode === "register";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    const nextErrors = validationErrors(
      email,
      password,
      isRegister ? confirmation : undefined,
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFailed(true);
      setMessage("Corrigez les champs signalés avant de continuer.");
      if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.password) passwordRef.current?.focus();
      else confirmationRef.current?.focus();
      return;
    }
    const result = await requestAuthentication(
      isRegister ? "/auth/register" : "/auth/login",
      { body: { email, password } },
    );
    if (result.ok && isRegister) {
      router.push("/auth/verification-email?pending=1");
      return;
    }
    if (result.ok) {
      router.push("/account");
      return;
    }
    setFailed(true);
    setMessage(
      isRegister
        ? "L’inscription n’a pas pu être finalisée. Vérifiez les informations saisies puis réessayez."
        : "La connexion a échoué. Vérifiez vos identifiants puis réessayez.",
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
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? `${mode}-email-error` : undefined}
        required
        ref={emailRef}
      />
      <FieldError id={`${mode}-email-error`}>{errors.email}</FieldError>
      <label htmlFor={`${mode}-password`}>Mot de passe</label>
      <input
        id={`${mode}-password`}
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        minLength={isRegister ? 12 : undefined}
        maxLength={128}
        aria-invalid={Boolean(errors.password)}
        aria-describedby={
          errors.password
            ? `${mode}-password-error`
            : isRegister
              ? "password-help"
              : undefined
        }
        required
        ref={passwordRef}
      />
      <FieldError id={`${mode}-password-error`}>{errors.password}</FieldError>
      {isRegister ? (
        <>
          <p id="password-help" className="auth-help">
            12 à 128 caractères.
          </p>
          <label htmlFor="register-confirmation">
            Confirmer le mot de passe
          </label>
          <input
            id="register-confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmation)}
            aria-describedby={
              errors.confirmation ? "register-confirmation-error" : undefined
            }
            required
            ref={confirmationRef}
          />
          <FieldError id="register-confirmation-error">
            {errors.confirmation}
          </FieldError>
        </>
      ) : null}
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const resend = action === "resend";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const nextErrors = validationErrors(email);
    setErrors(nextErrors);
    if (nextErrors.email) {
      setFailed(true);
      setMessage("Corrigez l’adresse e-mail signalée avant de continuer.");
      emailRef.current?.focus();
      return;
    }
    const result = await requestAuthentication(
      resend ? "/auth/verification-email" : "/auth/password-reset",
      { body: { email } },
    );
    setFailed(!result.ok);
    setMessage(
      result.ok
        ? "Si cette adresse peut recevoir ce message, les prochaines étapes vous ont été indiquées."
        : "La demande n’a pas pu être traitée. Réessayez dans quelques instants.",
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={`${action}-email`}>Adresse e-mail</label>
      <input
        id={`${action}-email`}
        name="email"
        type="email"
        autoComplete="email"
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? `${action}-email-error` : undefined}
        required
        ref={emailRef}
      />
      <FieldError id={`${action}-email-error`}>{errors.email}</FieldError>
      <button type="submit">
        {resend ? "Renvoyer l’e-mail" : "Demander un lien"}
      </button>
      <FormMessage message={message} error={failed} />
    </form>
  );
}

export function VerificationLink({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  async function verify() {
    const result = await requestAuthentication(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { method: "GET" },
    );
    if (result.ok) {
      router.replace("/auth?verified=1");
      return;
    }
    setFailed(true);
    setMessage(
      "Ce lien est invalide, expiré ou a déjà été utilisé. Demandez un nouveau lien.",
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
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    const nextErrors = validationErrors(
      "valid@example.test",
      password,
      confirmation,
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.password) passwordRef.current?.focus();
      else confirmationRef.current?.focus();
      return;
    }
    const result = await requestAuthentication("/auth/password-reset/confirm", {
      body: { token, password },
    });
    if (result.ok) {
      router.push("/auth?reset=1");
      return;
    }
    setFailed(true);
    setMessage(
      "Ce lien est invalide, expiré ou a déjà été utilisé. Demandez un nouveau lien.",
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
        ref={passwordRef}
        autoComplete="new-password"
        aria-invalid={Boolean(errors.password)}
        aria-describedby={errors.password ? "password-error" : "password-help"}
      />
      <p id="password-help" className="auth-help">
        12 à 128 caractères.
      </p>
      <FieldError id="password-error">{errors.password}</FieldError>
      <label htmlFor="confirmation">Confirmer le nouveau mot de passe</label>
      <input
        id="confirmation"
        name="confirmation"
        type="password"
        required
        ref={confirmationRef}
        autoComplete="new-password"
        aria-invalid={Boolean(errors.confirmation)}
        aria-describedby={
          errors.confirmation ? "confirmation-error" : undefined
        }
      />
      <FieldError id="confirmation-error">{errors.confirmation}</FieldError>
      <button type="submit" disabled={!token}>
        Enregistrer le mot de passe
      </button>
      <FormMessage message={message} error={failed} />
    </form>
  );
}

export function LoginNotice() {
  const params = useSearchParams();
  return (
    <FormMessage
      message={
        params.get("verified")
          ? "Votre adresse e-mail est vérifiée. Connectez-vous pour poursuivre."
          : params.get("reset")
            ? "Votre mot de passe a été remplacé. Vous pouvez vous connecter."
            : undefined
      }
    />
  );
}
export function AccountStatus() {
  const router = useRouter();
  const [user, setUser] = useState<ApiResult["user"]>();
  const [message, setMessage] = useState("Vérification de votre session…");
  useEffect(() => {
    void requestAuthentication("/auth/me", { method: "GET" }).then((result) => {
      if (!result.ok) {
        router.replace("/auth");
        return;
      }
      setUser(result.user);
      setMessage("Bienvenue dans votre espace personnel.");
    });
  }, [router]);
  async function logout() {
    const result = await requestAuthentication("/auth/logout");
    if (result.ok) router.replace("/auth");
    else setMessage(result.message);
  }
  return (
    <div className="account-summary">
      <FormMessage message={message} />
      {user ? (
        <>
          <dl>
            <div>
              <dt>Adresse e-mail</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Statut</dt>
              <dd>
                {user.emailVerified ? "Adresse vérifiée" : "Adresse à vérifier"}
              </dd>
            </div>
          </dl>
          <button onClick={logout}>Se déconnecter</button>
        </>
      ) : null}
    </div>
  );
}
