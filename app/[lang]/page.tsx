import { Suspense } from "react";

import { MainPage, StaticMainPage } from "@/components/home/MainPage";
import { getExperiences } from "@/lib/data/experiences";
import { getLinks } from "@/lib/data/links";
import { resolveOverview, type ProjectOverview } from "@/lib/data/overview";
import { getHighlightedProjects } from "@/lib/data/projects";
import { getAllTechs } from "@/lib/data/techs";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  const backend = getHighlightedProjects("backend");
  const game = getHighlightedProjects("game");

  const union = new Map<string, (typeof backend)[number]>();
  for (const p of [...backend, ...game]) union.set(p.id, p);

  const overviews: Record<string, ProjectOverview> = {};
  for (const p of union.values()) {
    overviews[p.id] = resolveOverview(p, locale);
  }

  const props = {
    highlightsByMode: { backend, game },
    overviews,
    techs: getAllTechs(),
    experiences: getExperiences(),
    links: getLinks(),
  };

  return (
    // MainPage reads ?mode via useSearchParams, so it must sit inside
    // Suspense. The fallback renders the same body in the default backend
    // mode and is prerendered into the static HTML; after hydration the
    // real MainPage (which reads ?mode) replaces it.
    <Suspense fallback={<StaticMainPage {...props} />}>
      <MainPage {...props} />
    </Suspense>
  );
}
