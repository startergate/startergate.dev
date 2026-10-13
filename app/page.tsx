"use client";

import { useEffect } from "react";
import Link from "next/link";

import { isLocale, type Locale } from "@/lib/i18n/locales";

function detectLocale(): Locale {
  try {
    const saved = window.localStorage.getItem("lang");
    if (saved && isLocale(saved)) return saved;
  } catch {
    // localStorage 접근 불가(프라이버시 모드 등) — 브라우저 언어로 판단한다.
  }
  return navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
}

/**
 * 정적 배포라 미들웨어 없이 클라이언트에서 언어를 판별해 보낸다 (spec §2.1).
 *
 * next/navigation의 router.replace()가 아니라 location.replace()를
 * 쓴다 — "/"와 "/{lang}/"는 서로 다른 루트 레이아웃이라, Next의
 * 클라이언트 라우터로 넘어가면 이전 <html>이 정리되지 않은 채 새
 * <html>이 그 안에 중첩 렌더되어 하이드레이션이 깨진다(실제로
 * 재현됨). location.replace()는 진짜 브라우저 네비게이션이라 안전하다.
 */
export default function RootRedirectPage() {
  useEffect(() => {
    window.location.replace(`/${detectLocale()}/`);
  }, []);

  return (
    <noscript>
      <p>
        <Link href="/ko/">한국어</Link> · <Link href="/en/">English</Link>
      </p>
    </noscript>
  );
}
