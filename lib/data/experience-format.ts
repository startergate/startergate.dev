import type { Locale } from "@/lib/i18n/locales";

import type { Experience } from "./types";

/** "2020-12" → "2020.12" (기존 사이트 표기와 맞춘 점 구분). */
function formatYm(ym: string): string {
  return ym.replaceAll("-", ".");
}

function formatDuration(months: number, locale: Locale): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (locale === "en") {
    const parts: string[] = [];
    if (years) parts.push(`${years}y`);
    if (rest || !years) parts.push(`${rest}mo`);
    return parts.join(" ");
  }
  const parts: string[] = [];
  if (years) parts.push(`${years}년`);
  if (rest || !years) parts.push(`${rest}개월`);
  return parts.join(" ");
}

/**
 * 경력 카드에 쓰는 "2020.12 ~ 2026.03 (5년 3개월)" 같은 표시 문자열을
 * startedAt/finishedAt(YYYY-MM)에서 계산한다 — 기존엔 이 문자열을
 * 데이터에 그대로 적어 뒀었다 (spec 외, 피드백으로 구조화).
 */
export function formatExperiencePeriod(exp: Experience, locale: Locale): string {
  const start = formatYm(exp.startedAt);
  if (!exp.finishedAt) return start;

  const end = formatYm(exp.finishedAt);
  const [sy, sm] = exp.startedAt.split("-").map(Number);
  const [ey, em] = exp.finishedAt.split("-").map(Number);
  const months = (ey - sy) * 12 + (em - sm);

  return `${start} ~ ${end} (${formatDuration(months, locale)})`;
}
