import { Suspense } from "react";

import { MainPage } from "@/components/home/MainPage";
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

  return (
    // MainPage는 useSearchParams(?mode=game)를 쓰므로 Suspense로 감싼다.
    <Suspense fallback={null}>
      <MainPage
        highlightsByMode={{ backend, game }}
        overviews={overviews}
        techs={getAllTechs()}
        experiences={getExperiences()}
        links={getLinks()}
      />
    </Suspense>
  );
}
