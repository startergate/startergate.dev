import type { Project } from "./types";

/** 콘솔 `open <id|이름>`이 쓰는 매칭: id 완전일치 → 이름 완전일치 →
 * 이름 부분일치(대소문자 무시) (spec §8). */
export function findProjectByQuery(projects: Project[], query: string): Project | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    projects.find((p) => p.id === q) ??
    projects.find((p) => p.name.toLowerCase() === q) ??
    projects.find((p) => p.name.toLowerCase().includes(q))
  );
}
