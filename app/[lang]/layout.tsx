import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import { BottomDock } from "@/components/layout/BottomDock";
import { Ground } from "@/components/layout/Ground";
import { NavPill } from "@/components/layout/NavPill";
import { GroundStationConsole } from "@/components/console/GroundStationConsole";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { ConsoleCapabilitiesProvider } from "@/lib/console/ConsoleCapabilities";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LangProvider } from "@/lib/i18n/LangProvider";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/locales";
import { NavMenuProvider } from "@/lib/layout/NavMenuContext";
import {
  SITE_TITLE,
  SITE_URL,
  getPageUrlMetadata,
  getSiteDescription,
} from "@/lib/site-meta";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme-init-script";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/**
 * <meta name="color-scheme">를 찍어, 테마 인라인 스크립트가 실행되기도
 * 전인 아주 초반(또는 언어 전환으로 전체 새로 로드될 때 그 사이)에도
 * 브라우저가 흰색이 아니라 시스템 선호에 맞는 캔버스 배경을 바로
 * 그리게 한다 — 언어 전환(하드 네비게이션) 때 흰 사각형이 잠깐
 * 비쳤다 사라지던 플래시를 줄인다.
 */
export const viewport: Viewport = {
  colorScheme: "dark light",
};

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const description = getSiteDescription(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_TITLE}`,
    },
    description,
    ...getPageUrlMetadata(locale, ""),
    twitter: {
      card: "summary",
      creator: "@startergate",
      title: SITE_TITLE,
      description,
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
        {/* 첫 페인트 전 data-theme 설정 (spec §3.4). <script> 태그(또는
            next/script의 beforeInteractive)는 최초 서버 렌더에서만
            안전하다 — 이 레이아웃이 클라이언트에서 다시 렌더되면(예:
            [lang] 파라미터가 바뀌는 언어 전환) React가 "Encountered a
            script tag while rendering" 오류를 던진다. 그래서 언어 전환은
            components/layout/LangSwitcher.tsx에서 router.push 대신
            location.href로 완전히 새로 로드하게 했다 — 그러면 이
            루트 레이아웃이 클라이언트에서 재렌더되는 일 자체가 없다. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <ThemeProvider>
          <LangProvider lang={lang} dict={dict}>
            <NavMenuProvider>
              <ConsoleCapabilitiesProvider>
                <NavPill />
                {children}
                <Ground previousVersionsLabel={dict.footer.previousVersions} />
                <BottomDock />
                <GroundStationConsole />
              </ConsoleCapabilitiesProvider>
            </NavMenuProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
