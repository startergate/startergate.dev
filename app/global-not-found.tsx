import type { Metadata } from "next";
import Link from "next/link";

import en from "@/lib/i18n/dictionaries/en";
import ko from "@/lib/i18n/dictionaries/ko";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { LEGACY_REDIRECT_SCRIPT } from "@/lib/legacy-redirect-script";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme-init-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "404",
};

/**
 * 전체 사이트 공통 404. 레이아웃을 우회하므로 폰트·테마 스크립트·
 * globals.css를 직접 끌어온다 (Next.js global-not-found 규칙).
 * 어떤 언어로 보여줄지 서버에서 알 수 없으므로(라우트가 전혀 매칭되지
 * 않았으므로) 한국어/영어를 함께 보여준다.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{ __html: LEGACY_REDIRECT_SCRIPT }}
        />
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <section>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              {ko.notFound.title}
            </h1>
            <p style={{ color: "var(--muted)" }}>{ko.notFound.description}</p>
            <Link href="/ko/">{ko.notFound.backHome}</Link>
          </section>
          <section>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              {en.notFound.title}
            </h1>
            <p style={{ color: "var(--muted)" }}>{en.notFound.description}</p>
            <Link href="/en/">{en.notFound.backHome}</Link>
          </section>
        </main>
      </body>
    </html>
  );
}
