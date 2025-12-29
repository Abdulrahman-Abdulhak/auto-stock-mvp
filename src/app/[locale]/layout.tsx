import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { setRequestLocale } from "next-intl/server";

import { AppBootstraps, AppProviders } from "@components";
import { siteConfig } from "@config/site";
import { supportedLocales } from "@config/locale";
import { cn } from "@lib/cn";
import { getDirection } from "@utils";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased bg-background text-foreground"
        )}
      >
        <AppBootstraps />
        <AppProviders>
          <div className="app">
            <main>{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
