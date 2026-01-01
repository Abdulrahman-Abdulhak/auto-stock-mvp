import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { setRequestLocale } from "next-intl/server";

import {
  AppBootstraps,
  AppContainer,
  AppProviders,
  PageHeader,
} from "@components";
import { siteConfig } from "@config/site";
import { supportedLocales } from "@config/locale";
import { cn } from "@lib/cn";
import { getDirection } from "@i18n/direction";

import "../globals.css";

import { Header } from "./components";

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
    default: siteConfig.name.default,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description.default,
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
            <Header />
            <main>
              <PageHeader />
              <AppContainer>{children}</AppContainer>
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
