"use client";

import { useState } from "react";

import { ProjectModal } from "@/components/projects/ProjectModal";
import type { ProjectOverview } from "@/lib/data/overview";
import type { Experience, LinkItem, Project, Tech } from "@/lib/data/types";
import { useLang } from "@/lib/i18n/LangProvider";
import { useProfileMode } from "@/lib/mode/useProfileMode";

import { About } from "./About";
import { Hero } from "./Hero";
import { Highlights } from "./Highlights";
import { Links } from "./Links";
import { Resume } from "./Resume";
import { Technologies } from "./Technologies";

/**
 * 메인 페이지 본문. mode는 URL 쿼리(?mode=game)로만 판단하고
 * (useSearchParams), 모드에 따라 히어로/소개/하이라이트/기술/이력이
 * 바뀐다 (spec §4.1). 메인에서 여는 팝업은 URL을 바꾸지 않는다 (spec §2.3).
 */
export function MainPage({
  highlightsByMode,
  overviews,
  techs,
  experiences,
  links,
}: {
  highlightsByMode: { backend: Project[]; game: Project[] };
  overviews: Record<string, ProjectOverview>;
  techs: Tech[];
  experiences: Experience[];
  links: LinkItem[];
}) {
  const { lang, dict } = useLang();
  const [mode] = useProfileMode();
  const [openId, setOpenId] = useState<string | null>(null);

  const projects = highlightsByMode[mode];

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
