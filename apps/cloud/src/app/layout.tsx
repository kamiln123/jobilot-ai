import type { Metadata } from "next";

import { CloudNavigationFrame } from "@/components/cloud-navigation-frame";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobilot AI — zarządzaj poszukiwaniem pracy",
  description: "Prywatny system zarządzania aplikacjami rekrutacyjnymi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CloudNavigationFrame>{children}</CloudNavigationFrame>
        <SiteFooter />
      </body>
    </html>
  );
}
