"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ProjectModal } from "@/components/projects/ProjectModal";
import { useRegisterConsoleCapabilities } from "@/lib/console/ConsoleCapabilities";
import { findProjectByQuery } from "@/lib/data/find-project";
import {
  CAT_OPTIONS,
  EMPTY_FILTERS,
  STATUS_OPTIONS,
  matchesFilters,
  toggleIn,
  type ProjectFilters,
} from "@/lib/data/project-filter";
import type { ProjectOverview } from "@/lib/data/overview";
import type { Project } from "@/lib/data/types";
import { useLang } from "@/lib/i18n/LangProvider";
import { markCameFromList, didComeFromList } from "@/lib/mode/cameFromList";

import { FilterBar } from "./FilterBar";
import { ProjectCard } from "./ProjectCard";
import styles from "./ProjectsExplorer.module.css";

const STORAGE_KEY = "projectFilters";

function loadStoredFilters(): ProjectFilters {
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
  // 서버는 sessionStorage를 모르니 항상 EMPTY_FILTERS로 시작해야
  // 하이드레이션이 깨지지 않는다(여기서 바로 읽으면 이전 세션에
  // 필터가 남아 있던 사용자만 서버/클라이언트 렌더가 달라져
  // 깨진다 — 실제로 재현됨). 마운트 직후에만 동기화한다.
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS);
  const [openId, setOpenId] = useState<string | undefined>(initialOpenId);

  useEffect(() => {
    const stored = loadStoredFilters();
    const isEmpty = Object.values(stored).every((v) => (v as unknown[]).length === 0);
    if (!isEmpty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters(stored);
    }
  }, []);
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

  const close = useCallback(() => {
    setOpenId(undefined);
    if (didComeFromList()) {
      router.back();
    } else {
      router.replace(`/${lang}/projects/`, { scroll: false });
    }
  }, [router, lang]);

  const consoleOpenProject = useCallback(
    (query: string) => {
      const found = findProjectByQuery(filtered, query);
      if (found) openProject(found.id);
      return found?.name ?? null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, lang],
  );

  const consoleApplyFilter = useCallback(
    (args: string[]) => {
      const [groupRaw, ...rest] = args;
      const group = groupRaw?.toLowerCase();
      const valueQuery = rest.join(" ").toLowerCase();
      if (!valueQuery) return undefined;

      let value: string | undefined;
      let label: string | undefined;
      if (group === "cat") {
        value = CAT_OPTIONS.find(
          (k) => k === valueQuery || dict.projectsPage.category[k].toLowerCase() === valueQuery,
        );
        label = value ? dict.projectsPage.category[value as (typeof CAT_OPTIONS)[number]] : undefined;
      } else if (group === "status") {
        value = STATUS_OPTIONS.find(
          (k) => k === valueQuery || dict.status[k].toLowerCase() === valueQuery,
        );
        label = value ? dict.status[value as (typeof STATUS_OPTIONS)[number]] : undefined;
      } else if (group === "tech") {
        value = techOptions.find((t) => t.toLowerCase() === valueQuery);
        label = value;
      } else if (group === "type") {
        value = typeOptions.find((t) => t.toLowerCase() === valueQuery);
        label = value;
      }
      if (!group || !value || !label) return undefined;

      const wasOn = (filters[group as keyof ProjectFilters] as string[]).includes(value);
      toggleFilter(group as keyof ProjectFilters, value);
      return { group, label, added: !wasOn };
    },
    [filters, techOptions, typeOptions, dict],
  );

  useRegisterConsoleCapabilities(
    useMemo(
      () => ({
        projects: {
          list: () => filtered.map((p) => ({ id: p.id, name: p.name })),
          open: consoleOpenProject,
          close,
        },
        filter: {
          apply: consoleApplyFilter,
          help: dict.console.filterHelp,
        },
        reset: () => setFilters(EMPTY_FILTERS),
      }),
      [filtered, consoleOpenProject, close, consoleApplyFilter, dict],
    ),
  );

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
