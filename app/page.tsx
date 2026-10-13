"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
 */
export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${detectLocale()}/`);
  }, [router]);

  return (
    <noscript>
      <p>
        <Link href="/ko/">한국어</Link> · <Link href="/en/">English</Link>
      </p>
    </noscript>
  );
}
