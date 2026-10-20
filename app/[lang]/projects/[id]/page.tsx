import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { collectTechOptions, collectTypeOptions } from "@/lib/data/project-filter";
import { resolveOverview, type ProjectOverview } from "@/lib/data/overview";
import { getAllProjects } from "@/lib/data/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

/**
 * 목록과 같은 컴포넌트를 쓰고 팝업만 열린 상태로 그린다 (spec §2.3,
 * 2026-10-13 변경: 쿼리 파라미터 대신 실제 라우트). 존재하지 않는
 * id는 generateStaticParams에 없으니 정적 export에서 아예 빌드되지
 * 않고, 404(global-not-found)가 목록으로 리다이렉트한다.
 */
export function generateStaticParams() {
  return getAllProjects().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const project = getAllProjects().find((p) => p.id === id);
  return {
    title: project?.name,
    ...getPageUrlMetadata(
      locale,
      `projects/${id}/`,
      project ? `${project.name} | ${SITE_TITLE}` : SITE_TITLE,
    ),
  };
}

export default async function ProjectDeepLinkPage({
  params,
}: PageProps<"/[lang]/projects/[id]">) {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  const allProjects = getAllProjects().sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  if (!allProjects.some((p) => p.id === id)) {
    notFound();
  }

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
        initialOpenId={id}
      />
    </div>
  );
}
