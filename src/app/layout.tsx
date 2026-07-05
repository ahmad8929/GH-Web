import type { Metadata } from "next";
import { Nunito, Poppins } from "next/font/google";
import "./globals.css";

import { Providers } from "@/context/providers";
import { SiteShell } from "@/components/site-shell";

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Poppins({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gyan Hub | The friendly school store",
    template: "%s | Gyan Hub",
  },
  description:
    "Used books, new books, uniforms, stationery, and custom notebooks — plus donations, sell-back, and school community goodness, all in one friendly store.",
  keywords: [
    "school store",
    "used textbooks",
    "school uniforms",
    "stationery",
    "custom notebooks",
    "donate school supplies",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
