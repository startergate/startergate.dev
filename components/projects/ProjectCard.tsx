"use client";

import Image from "next/image";

import { cardPeriod } from "@/lib/data/format";
import { monogram } from "@/lib/data/monogram";
import { STATUS_COLOR_VAR } from "@/lib/data/status";
import { getTechByName } from "@/lib/data/techs";
import type { Project } from "@/lib/data/types";
import { useLang } from "@/lib/i18n/LangProvider";
import { l10n } from "@/lib/i18n/l10n";
import { fillTemplate } from "@/lib/i18n/template";
import { useTheme } from "@/lib/theme/ThemeProvider";

import styles from "./ProjectCard.module.css";

/**
 * 메인·프로젝트 목록 공용 프로젝트 카드 (spec §6.1, 시안 ProjectCard.dc.html).
 */
export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const { lang, dict } = useLang();
  const { theme, mounted } = useTheme();

  const primaryTech = project.techs[0];
  const tech = primaryTech ? getTechByName(primaryTech) : undefined;
  // part(담당 영역)는 2단계 데이터 이전 때 비워둔 프로젝트가 많아
  // types[0]로 대신한다 (docs/spec.md §5.1).
  const part = project.part ?? project.types[0] ?? "";
  const period = cardPeriod(project);
  const statusLabel = dict.status[project.status];
  const statusColor = STATUS_COLOR_VAR[project.status];
  const ariaLabel = `${fillTemplate(dict.modal.detailAriaTemplate, { name: project.name })} · ${statusLabel}`;

  // mounted 전엔 서버와 같은 기본(src) 변형만 쓴다 (components/home/Resume.tsx와 동일한 이유).
  const logoSrc =
    mounted && theme === "light" && project.logo?.srcOnLight
      ? project.logo.srcOnLight
      : project.logo?.src;

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
    >
      <span className={styles.head}>
        <span className={styles.mono} aria-hidden="true">
          {logoSrc ? (
            <Image
              src={`/images/${logoSrc}`}
              alt=""
              width={44}
              height={44}
              className={styles.monoImg}
            />
          ) : (
            monogram(project.name)
          )}
        </span>
        <span className={styles.titleCol}>
          <span className={styles.name}>{project.name}</span>
          <span className={styles.desc}>{l10n(project.description, lang)}</span>
        </span>
        <span className={styles.status} style={{ color: statusColor }}>
          <span className={styles.statusDot} style={{ background: statusColor }} />
          {statusLabel}
        </span>
      </span>

      <span className={styles.metaRow}>
        {tech ? (
          <span className={styles.techBadge}>
            <span className={styles.techMono}>
              {tech.logo?.src ? (
                <Image
                  src={`/images/${tech.logo.src}`}
                  alt=""
                  width={20}
                  height={20}
                  className={styles.techLogo}
                />
              ) : (
                tech.abbr ?? monogram(tech.name)
              )}
            </span>
            {tech.name}
          </span>
        ) : null}
        <span aria-hidden="true">·</span>
        <span className={styles.part}>{part}</span>
        {period ? <span className={`mono ${styles.period}`}>{period}</span> : null}
      </span>
    </button>
  );
}
