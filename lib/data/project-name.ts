import { l10n } from "@/lib/i18n/l10n";
import type { Locale } from "@/lib/i18n/locales";

import type { Project } from "./types";

/** 화면에 보이는 프로젝트 이름: name이 있으면 name, 없으면 가칭(codename)을
 * 현재 언어로 (spec §5). 카드·팝업·콘솔·메타데이터가 모두 이것을 쓴다. */
export function getProjectDisplayName(project: Project, locale: Locale): string {
  if (project.name) return project.name;
  return project.codename ? l10n(project.codename, locale) : project.id;
}

/** name이 있을 때만 팝업 제목 아래에 따로 보여줄 가칭. name이 없으면
 * 가칭이 곧 표시 이름이므로 null. */
export function getProjectSubCodename(project: Project, locale: Locale): string | null {
  return project.name && project.codename ? l10n(project.codename, locale) : null;
}

/** 콘솔 검색 등에서 쓰는, 언어와 무관한 모든 이름 후보. */
export function getProjectNameCandidates(project: Project): string[] {
  const names = [project.name, project.codename?.ko, project.codename?.en];
  return names.filter((n): n is string => !!n);
}
