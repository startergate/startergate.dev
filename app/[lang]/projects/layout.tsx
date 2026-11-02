import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { collectTechOptions, collectTypeOptions } from "@/lib/data/project-filter";
import { resolveOverview, type ProjectOverview } from "@/lib/data/overview";
import { getAllProjects } from "@/lib/data/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";

/**
 * 목록 UI는 레이아웃에 둔다 — `/projects/`와 `/projects/{id}/` 사이를
 * 오가도 ProjectsExplorer(와 팝업)가 리마운트되지 않아 팝업 등장
 * 애니메이션이 다시 재생되지 않는다(#36). 열린 프로젝트는 explorer가
 * useParams로 읽고, 두 페이지는 메타데이터만 담당한다.
 */
export default async function ProjectsLayout({
  children,
  params,
}: LayoutProps<"/[lang]/projects">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  const allProjects = getAllProjects().sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  const overviews: Record<string, ProjectOverview> = {};
  for (const p of allProjects) {
    overviews[p.id] = resolveOverview(p, locale);
  }

  return (
    <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
      <PageHeader title={dict.pageTitles.projects} />
      <ProjectsExplorer
        lang={locale}
        allProjects={allProjects}
        techOptions={collectTechOptions(allProjects)}
        typeOptions={collectTypeOptions(allProjects)}
        overviews={overviews}
      />
      {children}
    </div>
  );
}
