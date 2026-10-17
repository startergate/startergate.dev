import Link from "next/link";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";
import type { Locale } from "@/lib/i18n/locales";

import { SectionLabel } from "./SectionLabel";
import styles from "./Highlights.module.css";

/** 02 — Project Highlights. 모드별 하이라이트 프로젝트 그리드 (spec §4.1). */
export function Highlights({
  lang,
  dict,
  projects,
  onOpen,
}: {
  lang: Locale;
  dict: Dictionary;
  projects: Project[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className={styles.section}>
      <SectionLabel id="projects" num="02" label="Project Highlights" />
      <div className={styles.headRow}>
        <h2 className={styles.heading}>{dict.highlights.heading}</h2>
        <Badge href="https://github.com/startergate" mono="GH" iconType="github">
          {dict.highlights.ghBadge}
        </Badge>
      </div>
      <div className={styles.grid}>
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onOpen={() => onOpen(p.id)} />
        ))}
      </div>
      <Link href={`/${lang}/projects/`} className={styles.seeMore}>
        {dict.highlights.seeMore}
      </Link>
    </section>
  );
}
