import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { collectTechOptions, collectTypeOptions } from "@/lib/data/project-filter";
import { resolveOverview, type ProjectOverview } from "@/lib/data/overview";
import { getAllProjects } from "@/lib/data/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  return { title: dict.pageTitles.projects };
}

export default async function ProjectsPage({
  params,
}: PageProps<"/[lang]/projects">) {
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
    </div>
  );
}
