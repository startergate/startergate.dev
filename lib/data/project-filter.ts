import type { Project, ProjectCategory, ProjectStatus } from "./types";

export type FilterKey = "cat" | "tech" | "type" | "status";

export const CAT_OPTIONS: ProjectCategory[] = ["work", "team", "personal"];
export const STATUS_OPTIONS: ProjectStatus[] = ["planning", "active", "done", "canceled"];

export type ProjectFilters = {
  cat: ProjectCategory[];
  tech: string[];
  type: string[];
  status: ProjectStatus[];
};

export const EMPTY_FILTERS: ProjectFilters = { cat: [], tech: [], type: [], status: [] };

/** 같은 그룹 안에서는 OR, 그룹끼리는 AND로 결합한다 (spec §4.2). */
export function matchesFilters(p: Project, f: ProjectFilters): boolean {
  return (
    (f.cat.length === 0 || f.cat.includes(p.category)) &&
    (f.tech.length === 0 || f.tech.some((t) => p.techs.includes(t))) &&
    (f.type.length === 0 || f.type.some((t) => p.types.includes(t))) &&
    (f.status.length === 0 || f.status.includes(p.status))
  );
}

export function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** 프로젝트 데이터에서 자동으로 모은 사용 기술/유형 옵션 (spec §4.2). */
export function collectTechOptions(projects: Project[]): string[] {
  return Array.from(new Set(projects.flatMap((p) => p.techs))).sort();
}

export function collectTypeOptions(projects: Project[]): string[] {
  return Array.from(new Set(projects.flatMap((p) => p.types))).sort();
}
