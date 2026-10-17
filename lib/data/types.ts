import type { L10n } from "@/lib/i18n/l10n";

export type ProjectCategory = "work" | "team" | "personal";
export type ProjectStatus = "planning" | "active" | "canceled" | "done";
export type ProfileMode = "backend" | "game";

export type Person = { link: string; avatar?: string };

export type Tech = {
  name: string;
  mode: ProfileMode | "all";
  level: "using" | "learned" | "learning";
  logo?: { src: string; background?: string; cover?: boolean; padding?: number };
  abbr?: string;
};

export type Experience = {
  company: L10n;
  /** 회사명 옆에 각주 형태 툴팁으로 보여줄 보충 설명(예: 사명 변경 이력). */
  companyNote?: L10n;
  companyLogo?: { src: string; srcOnLight?: string; background?: string; padding?: number };
  title: L10n;
  /** "YYYY-MM" (일 단위는 안 씀). 화면에 보이는 "2020.12 ~ 2026.03
   * (5년 3개월)" 같은 표시 문자열은 lib/data/experience-format.ts가
   * 이 두 값에서 계산한다 — 데이터에 텍스트로 미리 넣지 않는다. */
  startedAt: string;
  finishedAt?: string;
  location?: L10n;
  link?: string;
  summary: L10n;
  detail?: L10n;
  techs: string[];
};

export type LinkItem = { type: string; link: string; external_id: string };

export type TimelineType = "career" | "award" | "cert" | "group" | "edu";

export type TimelineItem = {
  type: TimelineType;
  /** "YYYY" | "YYYY-MM" | "YYYY-MM-DD" — 원래 자료의 정밀도를 그대로
   * 쓴다(수상일은 보통 월까지만, 자격증은 날짜 없이 연도만인 경우도
   * 있음). 화면 표시는 lib/data/timeline-format.ts에서 계산한다. */
  startedAt: string;
  finishedAt?: string;
  /** 종료일 없이 지금까지 계속되는 중(예: 현재 활동 중인 동아리). */
  ongoing?: boolean;
  title: L10n;
  org?: L10n;
  description?: L10n;
  link?: string;
};

export type Project = {
  id: string;
  name: string;
  description: L10n;
  category: ProjectCategory;
  team?: { name: string; link?: string };
  status: ProjectStatus;
  startedAt: string;
  finishedAt?: string;
  types: string[];
  techs: string[];
  part?: string;
  collaborators: { name: string; roles: L10n[] | string[] }[];
  logo?: { src: string; srcOnLight?: string; isTitle?: boolean; background?: string; padding?: number };
  images?: { src: string; description?: L10n }[];
  links?: { type: string; link: string; label: string }[];
  contents?: { title: L10n; text?: L10n; ref?: string; image?: string }[];
  highlight?: { backend?: number; game?: number };
};
