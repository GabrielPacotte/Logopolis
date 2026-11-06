import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logopolis — socle technique",
  description: "Application Web technique initiale de Logopolis",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
