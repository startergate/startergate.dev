import type { Metadata } from "next";

import { inter } from "@/lib/fonts";
import { SITE_TITLE } from "@/lib/site-meta";
import "../globals.css";

export const metadata: Metadata = {
  title: SITE_TITLE,
  robots: { index: false },
};

/**
 * "/" 전용 루트 레이아웃. 라우트 그룹(괄호 폴더)으로 분리해야 진짜
 * 독립된 루트 레이아웃이 된다 — app/layout.tsx를 그냥 두고
 * app/[lang]/layout.tsx를 또 하나의 루트라고 가정했던 게 1단계의
 * 실수였다. app/layout.tsx가 있으면 Next는 그걸 유일한 진짜 루트로
 * 보고 app/[lang]/layout.tsx를 그 "안에" 중첩시키는데, 둘 다 자기
 * html/body를 그리니 정적 빌드 결과물에 <html> 안에 <html>이 중첩된
 * 상태로 나갔다(JetBrains Mono 폰트 변수 클래스가 통째로 사라지는
 * 등 눈에 잘 안 띄는 문제를 일으켰다). 라우트 그룹을 쓰면 URL은 그대로
 * "/"이면서 app/[lang]/layout.tsx와 완전히 독립된 두 번째 루트가 된다.
 */
export default function RootRedirectLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
