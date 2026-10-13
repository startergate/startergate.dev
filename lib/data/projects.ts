import fs from "node:fs";
import path from "node:path";

import type { Project, ProfileMode } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "data/projects");

let cache: Project[] | null = null;

/** data/projects/*.json 전체를 읽어온다 (서버 전용 — fs를 쓴다). */
export function getAllProjects(): Project[] {
  if (cache) return cache;
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".json"));
  cache = files.map(
    (f) =>
      JSON.parse(
        fs.readFileSync(path.join(PROJECTS_DIR, f), "utf8"),
      ) as Project,
  );
  return cache;
}

export function getProjectById(id: string): Project | undefined {
  return getAllProjects().find((p) => p.id === id);
}

/** highlight.{mode} 값으로 정렬된 하이라이트 프로젝트 목록 (spec §4.1, §5.1). */
export function getHighlightedProjects(mode: ProfileMode): Project[] {
  return getAllProjects()
    .filter((p) => p.highlight?.[mode] != null)
    .sort((a, b) => a.highlight![mode]! - b.highlight![mode]!);
}
