import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext } from "@playwright/test";

const mailpitUrl = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:8025";

/**
 * {Mailpit contains a message sent to the synthetic address} => {returns the first authentication URL from that message}
 *
 * Errors: fails the E2E scenario when Mailpit does not expose a matching message in time.
 * Effects: polls Mailpit's local HTTP API only.
 * Invariants: uses synthetic test addresses and never logs token-bearing URLs.
 */
async function waitForMailLink(
  request: APIRequestContext,
  recipient: string,
  route: string,
): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await request.get(`${mailpitUrl}/api/v1/messages`);
    const payload = (await response.json()) as {
      messages?: Array<{ ID?: string; To?: Array<{ Address?: string }> }>;
    };
    const message = payload.messages?.find((candidate) =>
      candidate.To?.some((to) => to.Address === recipient),
    );
    if (!message?.ID) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      continue;
    }
    const detail = await request.get(
      `${mailpitUrl}/api/v1/message/${message.ID}`,
    );
    const body = (await detail.json()) as { Text?: string };
    const link = body.Text?.match(
      new RegExp(`http[^\\s]+${route}\\?token=[^\\s]+`),
    )?.[0];
    if (link) return link;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Expected a local Mailpit message for the E2E scenario.");
}

async function mailpitMessageCount(
  request: APIRequestContext,
  recipient: string,
): Promise<number> {
  const response = await request.get(`${mailpitUrl}/api/v1/messages`);
  const payload = (await response.json()) as {
    messages?: Array<{ To?: Array<{ Address?: string }> }>;
  };
  return (
    payload.messages?.filter((candidate) =>
      candidate.To?.some((to) => to.Address === recipient),
    ).length ?? 0
  );
}

test.describe("authentication journey with local Mailpit", () => {
  test("registers, verifies, signs in and opens the minimal account", async ({
    page,
    request,
  }) => {
    const email = `reader-${Date.now()}@example.test`;
    await page.goto("/auth/register");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page
      .getByLabel("Mot de passe", { exact: true })
      .fill("a-safe-password");
    await page.getByLabel("Confirmer le mot de passe").fill("a-safe-password");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByRole("heading", { name: "Poursuivre votre inscription" }),
    ).toBeVisible();
    const verificationLink = await waitForMailLink(
      request,
      email,
      "/auth/verification-email",
    );
    await page.goto(verificationLink);
    await page
      .getByRole("button", { name: "Vérifier mon adresse e-mail" })
      .click();
    await expect(
      page.getByText(
        "Votre adresse e-mail est vérifiée. Connectez-vous pour poursuivre.",
      ),
    ).toBeVisible();
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill("a-safe-password");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByRole("heading", { name: "Mon espace" }),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText("Adresse vérifiée")).toBeVisible();
  });

  test("does not mislead a person who registers an existing address", async ({
    page,
    request,
  }) => {
    const email = `existing-${Date.now()}@example.test`;
    const testPassphrase = "a-safe-password";
    const register = async () => {
      await page.goto("/auth/register");
      await page.getByLabel("Adresse e-mail").fill(email);
      await page
        .getByLabel("Mot de passe", { exact: true })
        .fill(testPassphrase);
      await page.getByLabel("Confirmer le mot de passe").fill(testPassphrase);
      await page.getByRole("button", { name: "Créer mon compte" }).click();
      await expect(
        page.getByRole("heading", { name: "Poursuivre votre inscription" }),
      ).toBeVisible();
    };

    await register();
    await waitForMailLink(request, email, "/auth/verification-email");
    expect(await mailpitMessageCount(request, email)).toBe(1);

    await register();
    await expect(page.getByText(/lorsque cela est possible/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Se connecter" }),
    ).toHaveAttribute("href", "/auth");
    await expect(
      page.getByRole("link", { name: "Mot de passe oublié ?" }),
    ).toHaveAttribute("href", "/auth/password-reset");
    await expect(
      page.getByRole("link", {
        name: "Vous attendez un e-mail de vérification ?",
      }),
    ).toHaveAttribute("href", "/auth/verification-email");
    await expect(
      page.getByRole("heading", { name: "Vérifiez votre adresse e-mail" }),
    ).not.toBeVisible();
    await expect.poll(() => mailpitMessageCount(request, email)).toBe(1);
  });

  test("shows explicit validation errors and resets a password through Mailpit", async ({
    page,
    request,
  }) => {
    const email = `reset-${Date.now()}@example.test`;
    await page.goto("/auth/register");
    await page.getByLabel("Adresse e-mail").fill("not-an-email");
    await page
      .getByLabel("Mot de passe", { exact: true })
      .fill("a-safe-password");
    await page.getByLabel("Confirmer le mot de passe").fill("a-safe-password");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByText("Indiquez une adresse e-mail valide."),
    ).toBeVisible();
    await expect(page.getByLabel("Adresse e-mail")).toBeFocused();
    await expect(
      page.getByText("Indiquez une adresse e-mail valide."),
    ).toHaveAttribute("id", "register-email-error");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page
      .getByLabel("Mot de passe", { exact: true })
      .fill("a-safe-password");
    await page.getByLabel("Confirmer le mot de passe").fill("a-safe-password");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByRole("heading", { name: "Poursuivre votre inscription" }),
    ).toBeVisible();
    await page.goto("/auth/password-reset");
    await page.getByLabel("Adresse e-mail").fill("not-an-email");
    await page.getByRole("button", { name: "Demander un lien" }).click();
    const recoveryValidationMessage = page.getByText(
      "Corrigez l’adresse e-mail signalée avant de continuer.",
    );
    await expect(recoveryValidationMessage).toBeVisible();
    await expect(recoveryValidationMessage).toHaveAttribute("role", "alert");
    await expect(page.getByLabel("Adresse e-mail")).toBeFocused();
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByRole("button", { name: "Demander un lien" }).click();
    await expect(
      page.getByText(
        "Si cette adresse peut recevoir ce message, les prochaines étapes vous ont été indiquées.",
      ),
    ).toBeVisible();
    const resetLink = await waitForMailLink(
      request,
      email,
      "/auth/password-reset/confirm",
    );
    await page.goto(resetLink);
    await page.locator("#password").fill("a-new-safe-password");
    await page
      .getByLabel("Confirmer le nouveau mot de passe")
      .fill("a-new-safe-password");
    await page
      .getByRole("button", { name: "Enregistrer le mot de passe" })
      .click();
    await expect(
      page.getByText(
        "Votre mot de passe a été remplacé. Vous pouvez vous connecter.",
      ),
    ).toBeVisible();
  });

  test("has no automated accessibility violations on authentication forms", async ({
    page,
  }) => {
    await page.goto("/auth/register");
    await expect(
      new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22a",
          "wcag22aa",
        ])
        .analyze(),
    ).resolves.toMatchObject({ violations: [] });

    await page.goto("/auth/password-reset");
    await expect(
      new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22a",
          "wcag22aa",
        ])
        .analyze(),
    ).resolves.toMatchObject({ violations: [] });
  });
});
