import { l10n } from "@/lib/i18n/l10n";
import type { Locale } from "@/lib/i18n/locales";

import { formatDate } from "./format";
import type { TimelineItem } from "./types";

/**
 * 타임라인 아이템의 날짜 칩("2020.12 ~ 2026.03" 등)을 startedAt/
 * finishedAt/ongoing에서 계산한다 — 기존엔 이 문자열을 데이터에
 * 그대로 적어 뒀었다 (spec 외, 피드백으로 구조화). startedAt은
 * "YYYY" | "YYYY-MM" | "YYYY-MM-DD" 정밀도를 그대로 쓴다.
 */
export function formatTimelinePeriod(item: TimelineItem): string {
  const start = formatDate(item.startedAt);
  if (item.finishedAt) return `${start} ~ ${formatDate(item.finishedAt)}`;
  if (item.ongoing) return `${start} ~`;
  return start;
}

/**
 * 항목 종류에 따라 소속/제목/설명을 묶어 제목·부제로 만든다.
 * (career/group: "{소속} · {제목}" · award: "{제목} {등급}" ·
 * cert: 제목 + 발급기관/점수 · edu: 학교명 + 학과·지역)
 */
export function formatTimelineHeading(
  item: TimelineItem,
  lang: Locale,
): { heading: string; sub?: string } {
  const title = l10n(item.title, lang);
  const org = item.org ? l10n(item.org, lang) : undefined;
  const description = item.description ? l10n(item.description, lang) : undefined;

  switch (item.type) {
    case "career":
    case "group":
      return { heading: org ? `${org} · ${title}` : title, sub: description };
    case "award":
      return { heading: org ? `${title} ${org}` : title, sub: description };
    case "cert":
      return { heading: title, sub: org ?? description };
    case "edu":
      return {
        heading: org ?? title,
        sub: [org ? title : undefined, description].filter(Boolean).join(" · ") || undefined,
      };
  }
}
