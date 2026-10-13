import type { Locale } from "./locales";

/**
 * 영어 번역이 아직 없는 데이터는 한국어로 대체 표시한다 (spec §2.1).
 */
export type L10n = {
  ko: string;
  en?: string;
};

export function l10n(value: L10n, locale: Locale): string {
  if (locale === "en" && value.en) return value.en;
  return value.ko;
}
