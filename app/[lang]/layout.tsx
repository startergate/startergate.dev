import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NavPill } from "@/components/layout/NavPill";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LangProvider } from "@/lib/i18n/LangProvider";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/locales";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site-meta";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme-init-script";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_TITLE}`,
    },
    description: SITE_DESCRIPTION[locale],
    alternates: {
      canonical: `/${locale}/`,
      languages: {
        ko: "/ko/",
        en: "/en/",
        "x-default": "/en/",
      },
    },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION[locale],
      type: "website",
      url: `${SITE_URL}/${locale}/`,
    },
    twitter: {
      card: "summary",
      creator: "@startergate",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION[locale],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* 첫 페인트 전 data-theme 설정 (spec §3.4) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LangProvider lang={lang} dict={dict}>
            <NavPill />
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
