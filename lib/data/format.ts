import type { Project } from "./types";

export function yearOf(dateStr: string): string {
  return dateStr.slice(0, 4);
}

/** 카드 마지막 줄에 쓰는 압축 기간 표시, 예: "2020 — 2026" / "2026 —". */
export function cardPeriod(project: Project): string {
  const start = yearOf(project.startedAt);
  if (project.finishedAt) return `${start} — ${yearOf(project.finishedAt)}`;
  return `${start} —`;
}

/** 팝업의 날짜 수(YYYY-MM-DD) 표시, 예: "2020.02.14". */
export function formatDate(dateStr: string): string {
  return dateStr.replaceAll("-", ".");
}

/** 두 날짜(또는 날짜~오늘) 사이의 일수. */
export function daysBetween(startedAt: string, finishedAt?: string): number {
  const start = new Date(`${startedAt}T00:00:00`);
  const end = finishedAt ? new Date(`${finishedAt}T00:00:00`) : new Date();
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}
