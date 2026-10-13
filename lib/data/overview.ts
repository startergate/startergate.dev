import fs from "node:fs";
import path from "node:path";

import type { Locale } from "@/lib/i18n/locales";
import { l10n } from "@/lib/i18n/l10n";

import type { Project } from "./types";

function readProjectMarkdown(ref: string): string {
  const full = path.join(process.cwd(), "data", ref);
  const raw = fs.readFileSync(full, "utf8");
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\\\n/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");
}

function isOverviewTitle(titleKo: string): boolean {
  return titleKo === "개요" || /^what is/i.test(titleKo);
}

export type ProjectSection = {
  no: string;
  title: string;
  body?: string;
  image?: string;
};

export type ProjectOverview = {
  overview: string;
  sections: ProjectSection[];
};

/**
 * 팝업 본문의 "개요"와 번호 붙은 본문 섹션을 서버에서 미리 계산한다
 * (contents[].ref의 마크다운을 읽어야 해서 fs가 필요하다 — 클라이언트
 * 컴포넌트인 ProjectModal에서 직접 하지 않는다). spec §6.2.
 */
export function resolveOverview(
  project: Project,
  lang: Locale,
): ProjectOverview {
  const contents = project.contents ?? [];
  const first = contents[0];
  const useFirstAsOverview = !!first && isOverviewTitle(first.title.ko);
  const sectionsRaw = useFirstAsOverview ? contents.slice(1) : contents;

  const overview = useFirstAsOverview
    ? first.ref
      ? readProjectMarkdown(first.ref)
      : l10n(first.text ?? project.description, lang)
    : l10n(project.description, lang);

  const sections: ProjectSection[] = sectionsRaw.map((c, i) => ({
    no: String(i + 1).padStart(2, "0"),
    title: l10n(c.title, lang),
    body: c.text ? l10n(c.text, lang) : c.ref ? readProjectMarkdown(c.ref) : undefined,
    image: c.image,
  }));

  return { overview, sections };
}
