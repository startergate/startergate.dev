import type { Locale } from "@/lib/i18n/locales";

export const SITE_URL = "https://startergate.dev";
export const SITE_TITLE = "STARTERGATE";

// TODO(2단계 데이터 이전): data/site.json으로 옮긴다.
// 기존 Gatsby gatsby-config.js의 siteMetadata.description을 임시로 쓴다.
export const SITE_DESCRIPTION: Record<Locale, string> = {
  ko: "최호승(STARTERGATE), Backend Developer.",
  en: "I'm STARTERGATE. Backend Developer.",
};
