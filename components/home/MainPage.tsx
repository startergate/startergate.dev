"use client";

import { useCallback, useMemo, useState } from "react";

import { ProjectModal } from "@/components/projects/ProjectModal";
import { useRegisterConsoleCapabilities } from "@/lib/console/ConsoleCapabilities";
import { findProjectByQuery } from "@/lib/data/find-project";
import type { ProjectOverview } from "@/lib/data/overview";
import { getProjectDisplayName } from "@/lib/data/project-name";
import type { Experience, LinkItem, ProfileMode, Project, Tech } from "@/lib/data/types";
import { useLang } from "@/lib/i18n/LangProvider";
import { useProfileMode } from "@/lib/mode/useProfileMode";

import { About } from "./About";
import { Hero } from "./Hero";
import { Highlights } from "./Highlights";
import { Links } from "./Links";
import { Resume } from "./Resume";
import { Technologies } from "./Technologies";

type MainPageProps = {
  highlightsByMode: { backend: Project[]; game: Project[] };
  overviews: Record<string, ProjectOverview>;
  techs: Tech[];
  experiences: Experience[];
  links: LinkItem[];
};

/**
 * Main page entry. The mode comes only from the URL query (?mode=game) via
 * useSearchParams, and the hero/about/highlights/techs/resume change with
 * it (spec §4.1). Popups opened on the main page do not change the URL
 * (spec §2.3). Because useSearchParams is used, callers wrap this in
 * <Suspense> — see StaticMainPage for the prerendered fallback.
 */
export function MainPage(props: MainPageProps) {
  const [mode, setMode] = useProfileMode();
  return <MainPageContent mode={mode} setMode={setMode} {...props} />;
}

const noop = () => {};

/**
 * Suspense fallback for MainPage: renders the full body in the default
 * backend mode without reading search params, so it is prerendered into
 * the static HTML. After hydration the real MainPage replaces it.
 */
export function StaticMainPage(props: MainPageProps) {
  return <MainPageContent mode="backend" setMode={noop} {...props} />;
}

/**
 * Main page body for a given mode. Holds all rendering and interaction
 * logic (popup state, console capabilities) but takes the mode as props so
 * it can render without useSearchParams.
 */
export function MainPageContent({
  mode,
  setMode,
  highlightsByMode,
  overviews,
  techs,
  experiences,
  links,
}: MainPageProps & {
  mode: ProfileMode;
  setMode: (mode: ProfileMode) => void;
}) {
  const { lang, dict } = useLang();
  const [openId, setOpenId] = useState<string | null>(null);

  const projects = highlightsByMode[mode];

  const openProject = useCallback(
    (query: string) => {
      const found = findProjectByQuery(projects, query);
      if (found) setOpenId(found.id);
      return found ? getProjectDisplayName(found, lang) : null;
    },
    [projects, lang],
  );

  useRegisterConsoleCapabilities(
    useMemo(
      () => ({
        mode: { current: () => mode, set: setMode },
        projects: {
          list: () => projects.map((p) => ({ id: p.id, name: getProjectDisplayName(p, lang) })),
          open: openProject,
          close: () => setOpenId(null),
        },
      }),
      [mode, setMode, projects, openProject, lang],
    ),
  );

  return (
    <>
      <Hero mode={mode} />
      <div className="wrap">
        <About mode={mode} dict={dict} />
        <Highlights lang={lang} dict={dict} projects={projects} onOpen={setOpenId} />
        <Technologies mode={mode} dict={dict} techs={techs} />
        <Resume lang={lang} dict={dict} experiences={experiences} />
        <Links links={links} heading={dict.links.heading} />
      </div>
      {openId ? (
        <ProjectModal
          projects={projects}
          overviews={overviews}
          currentId={openId}
          onClose={() => setOpenId(null)}
          onNavigate={setOpenId}
        />
      ) : null}
    </>
  );
}
