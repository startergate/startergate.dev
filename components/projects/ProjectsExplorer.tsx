"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProjectModal } from "@/components/projects/ProjectModal";
import { EMPTY_FILTERS, matchesFilters, toggleIn, type ProjectFilters } from "@/lib/data/project-filter";
import type { ProjectOverview } from "@/lib/data/overview";
import type { Project } from "@/lib/data/types";
import { useLang } from "@/lib/i18n/LangProvider";
import { markCameFromList, didComeFromList } from "@/lib/mode/cameFromList";

import { FilterBar } from "./FilterBar";
import { ProjectCard } from "./ProjectCard";
import styles from "./ProjectsExplorer.module.css";

const STORAGE_KEY = "projectFilters";

function loadStoredFilters(): ProjectFilters {
  if (typeof window === "undefined") return EMPTY_FILTERS;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_FILTERS, ...parsed };
  } catch {
    return EMPTY_FILTERS;
  }
}

/**
 * 프로젝트 목록 + 필터 + 팝업. `/projects/`와 `/projects/{id}/`가 같은
 * 컴포넌트를 쓴다(spec §2.2, §2.3) — initialOpenId만 다르다. 필터는
 * sessionStorage에 저장해 두 라우트 사이를 오갈 때(이전/다음, 열기/닫기)
 * 그대로 유지되게 한다. URL에는 필터를 남기지 않는다.
 */
export function ProjectsExplorer({
  lang,
  allProjects,
  techOptions,
  typeOptions,
  overviews,
  initialOpenId,
}: {
  lang: string;
  allProjects: Project[];
  techOptions: string[];
  typeOptions: string[];
  overviews: Record<string, ProjectOverview>;
  initialOpenId?: string;
}) {
  const { dict } = useLang();
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFilters>(loadStoredFilters);
  const [openId, setOpenId] = useState<string | undefined>(initialOpenId);
  // 브라우저 뒤로/앞으로가기처럼 이 컴포넌트가 리마운트 없이 다른
  // /projects/{id}/로 바뀌는 경우를 렌더 중에 동기화한다(React가
  // 권장하는 "렌더 중 상태 조정" 패턴 — effect에서 하면 한 프레임 늦는다).
  const [syncedInitialOpenId, setSyncedInitialOpenId] = useState(initialOpenId);
  if (initialOpenId !== syncedInitialOpenId) {
    setSyncedInitialOpenId(initialOpenId);
    setOpenId(initialOpenId);
  }

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // sessionStorage 접근 불가 — 이번 세션만 영향받는다.
    }
  }, [filters]);

  const filtered = allProjects.filter((p) => matchesFilters(p, filters));

  const toggleFilter = (key: keyof ProjectFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: toggleIn(prev[key] as string[], value),
    }));
  };

  const openProject = (id: string) => {
    markCameFromList();
    setOpenId(id);
    router.push(`/${lang}/projects/${id}/`, { scroll: false });
  };

  const navigateTo = (id: string) => {
    setOpenId(id);
    router.replace(`/${lang}/projects/${id}/`, { scroll: false });
  };

  const close = () => {
    setOpenId(undefined);
    if (didComeFromList()) {
      router.back();
    } else {
      router.replace(`/${lang}/projects/`, { scroll: false });
    }
  };

  return (
    <>
      <FilterBar
        dict={dict}
        filters={filters}
        onToggle={toggleFilter}
        onReset={() => setFilters(EMPTY_FILTERS)}
        allProjects={allProjects}
        techOptions={techOptions}
        typeOptions={typeOptions}
        resultCount={filtered.length}
      />

      <section aria-label={dict.pageTitles.projects} className={styles.gridSection}>
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => openProject(p.id)} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p style={{ margin: "24px 0 0", color: "var(--muted)" }}>
            {dict.projectsPage.noResults}
          </p>
        ) : null}
      </section>

      {openId ? (
        <ProjectModal
          // sessionStorage에 남은 필터가 직접 들어온 프로젝트를 가리고
          // 있으면(예: 필터링된 상태로 링크를 공유받은 경우) 팝업만큼은
          // 전체 목록 순서로 보여준다. 그리드는 여전히 필터를 반영한다.
          projects={filtered.some((p) => p.id === openId) ? filtered : allProjects}
          overviews={overviews}
          currentId={openId}
          onClose={close}
          onNavigate={navigateTo}
        />
      ) : null}
    </>
  );
}
