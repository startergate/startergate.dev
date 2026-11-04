import fs from "node:fs";
import path from "node:path";

import type { Locale } from "@/lib/i18n/locales";
import { l10n, type L10n } from "@/lib/i18n/l10n";

import type { Project, ProjectContent, ProjectImage, ProjectStatus } from "./types";

function readProjectMarkdown(ref: string): string {
  const full = path.join(process.cwd(), "data", ref);
  const raw = fs.readFileSync(full, "utf8");
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\\\n/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");
}

/** Markdown body for the given language; a plain string ref is shared by all languages. */
function readContentRef(ref: string | L10n, lang: Locale): string {
  return readProjectMarkdown(typeof ref === "string" ? ref : l10n(ref, lang));
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

export type ResolvedSubProject = {
  id: string;
  title: string;
  status: ProjectStatus;
  startedAt: string;
  finishedAt?: string;
  images: ProjectImage[];
  overview?: string;
  sections: ProjectSection[];
};

export type ProjectOverview = {
  overview: string;
  sections: ProjectSection[];
  subProjects: ResolvedSubProject[];
};

function resolveContent(c: ProjectContent, lang: Locale, no: string): ProjectSection {
  return {
    no,
    title: l10n(c.title, lang),
    body: c.text ? l10n(c.text, lang) : c.ref ? readContentRef(c.ref, lang) : undefined,
    image: c.image,
  };
}

/**
 * Splits contents into the optional "개요" overview (first section with an
 * overview title) and the numbered sections. Shared by projects and
 * sub-projects so both follow the same content rules.
 */
function splitContents(
  contents: ProjectContent[],
  lang: Locale,
): { overview?: string; sections: ProjectSection[] } {
  const first = contents[0];
  const useFirstAsOverview = !!first && isOverviewTitle(first.title.ko);
  const sectionsRaw = useFirstAsOverview ? contents.slice(1) : contents;
  const overview = useFirstAsOverview
    ? first.ref
      ? readContentRef(first.ref, lang)
      : first.text
        ? l10n(first.text, lang)
        : undefined
    : undefined;
  const sections = sectionsRaw.map((c, i) =>
    resolveContent(c, lang, String(i + 1).padStart(2, "0")),
  );
  return { overview, sections };
}

/**
 * 팝업 본문의 "개요"와 번호 붙은 본문 섹션을 서버에서 미리 계산한다
 * (contents[].ref의 마크다운을 읽어야 해서 fs가 필요하다 — 클라이언트
 * 컴포넌트인 ProjectModal에서 직접 하지 않는다). spec §6.2.
 */
export function resolveOverview(
  project: Project,
  lang: Locale,
): ProjectOverview {
  const { overview, sections } = splitContents(project.contents ?? [], lang);

  const subProjects: ResolvedSubProject[] = (project.subProjects ?? []).map((sp) => ({
    id: sp.id,
    title: l10n(sp.title, lang),
    status: sp.status,
    startedAt: sp.startedAt,
    finishedAt: sp.finishedAt,
    images: sp.images ?? [],
    ...splitContents(sp.contents ?? [], lang),
  }));

  return {
    overview: overview ?? l10n(project.description, lang),
    sections,
    subProjects,
  };
}
