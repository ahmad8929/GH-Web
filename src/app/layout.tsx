import type { Metadata } from "next";
import { Fraunces, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const uiFont = Sora({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gyan Hub | School Marketplace",
  description:
    "Buy, sell, exchange, and donate textbooks, uniforms, stationery, and other school essentials in one trusted marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${uiFont.variable}`}
    >
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
