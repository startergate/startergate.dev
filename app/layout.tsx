import type { Metadata } from "next";

import { inter } from "@/lib/fonts";
import { SITE_TITLE } from "@/lib/site-meta";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_TITLE,
  robots: { index: false },
};

/**
 * "/" 전용 루트 레이아웃. 실제 콘텐츠는 app/[lang]/layout.tsx가 가진
 * 레이아웃을 쓴다 — [lang]이 루트 레이아웃 앞의 동적 세그먼트라
 * 두 번째 루트 레이아웃이 된다 (spec §2.1, Next.js 다중 루트 레이아웃).
 */
export default function RootRedirectLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
