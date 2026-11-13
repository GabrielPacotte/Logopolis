// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CredentialsForm, EmailActionForm } from "./auth-client";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("authentication web components", () => {
  afterEach(cleanup);

  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
  });

  it("announces an explicit registration error and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<CredentialsForm mode="register" />);

    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Corrigez les champs signalés");
    expect(screen.getByLabelText("Adresse e-mail")).toHaveFocus();
    expect(screen.getByLabelText("Adresse e-mail")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Indiquez votre adresse e-mail.")).toHaveAttribute(
      "id",
      "register-email-error",
    );
  });

  it("uses an error alert and focus for an invalid recovery address", async () => {
    const user = userEvent.setup();
    render(<EmailActionForm action="recovery" />);

    await user.click(screen.getByRole("button", { name: "Demander un lien" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Corrigez l’adresse e-mail signalée",
    );
    expect(screen.getByLabelText("Adresse e-mail")).toHaveFocus();
  });

  it("shows only the contextual e-mail action for the current journey", () => {
    const { rerender } = render(<EmailActionForm action="recovery" />);
    expect(
      screen.getByRole("button", { name: "Demander un lien" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Renvoyer l’e-mail" }),
    ).not.toBeInTheDocument();

    rerender(<EmailActionForm action="resend" />);
    expect(
      screen.getByRole("button", { name: "Renvoyer l’e-mail" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Demander un lien" }),
    ).not.toBeInTheDocument();
  });
});
