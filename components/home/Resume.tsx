"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ChevronDownIcon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatExperiencePeriod } from "@/lib/data/experience-format";
import { monogram } from "@/lib/data/monogram";
import { getTechByName } from "@/lib/data/techs";
import type { Experience } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";
import { useLang } from "@/lib/i18n/LangProvider";
import { l10n } from "@/lib/i18n/l10n";
import type { Locale } from "@/lib/i18n/locales";
import { useTheme } from "@/lib/theme/ThemeProvider";

import { SectionLabel } from "./SectionLabel";
import styles from "./Resume.module.css";

function ExperienceCard({ exp }: { exp: Experience }) {
  const { lang, dict } = useLang();
  const { theme, mounted } = useTheme();
  const [open, setOpen] = useState(false);

  // mounted 전엔 서버와 같은 기본(src) 변형만 쓴다 — 실제 테마로
  // 바로 고르면 서버 추정(dark)과 달라 하이드레이션이 깨진다.
  const logoSrc =
    mounted && theme === "light" && exp.companyLogo?.srcOnLight
      ? exp.companyLogo.srcOnLight
      : exp.companyLogo?.src;

  return (
    <article className={`${styles.exp} ${open ? styles.expOpen : ""}`}>
      <div className={styles.expRow}>
        <span
          className={styles.logo}
          style={
            exp.companyLogo?.background || exp.companyLogo?.padding
              ? {
                  ...(exp.companyLogo.background ? { background: exp.companyLogo.background } : null),
                  ...(exp.companyLogo.padding ? { padding: exp.companyLogo.padding } : null),
                }
              : undefined
          }
        >
          {logoSrc ? (
            <Image
              src={`/images/${logoSrc}`}
              alt={l10n(exp.company, lang)}
              width={168}
              height={56}
              className={styles.logoImg}
            />
          ) : (
            monogram(l10n(exp.company, lang))
          )}
        </span>
        <div className={styles.main}>
          <div className={styles.titleRow}>
            <h3 className={styles.company}>
              {l10n(exp.company, lang)}
              {exp.companyNote ? (
                <Tooltip content={l10n(exp.companyNote, lang)} className={styles.companyNote}>
                  *
                </Tooltip>
              ) : null}{" "}
              <span className={styles.companyTitle}>{l10n(exp.title, lang)}</span>
            </h3>
            <span className={`num ${styles.period}`}>{formatExperiencePeriod(exp, lang)}</span>
          </div>
          {exp.location ? (
            <div className={styles.place}>{l10n(exp.location, lang)}</div>
          ) : null}
          <p className={styles.summary}>{l10n(exp.summary, lang)}</p>
          <div className={styles.stackRow}>
            {exp.techs.map((name) => {
              const tech = getTechByName(name);
              return (
                <Badge
                  key={name}
                  mono={tech?.abbr ?? monogram(name)}
                  logoSrc={tech?.logo?.src}
                  logoBackground={tech?.logo?.background}
                  logoPadding={tech?.logo?.padding}
                  className={styles.stackBadge}
                >
                  {name}
                </Badge>
              );
            })}
          </div>
          {exp.detail ? (
            <div className={styles.more}>
              <div className={styles.moreInner}>
                <p className={styles.detail}>{l10n(exp.detail, lang)}</p>
              </div>
            </div>
          ) : null}
        </div>
        {exp.detail ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={dict.resume.detailAriaExpand}
            aria-expanded={open}
            className={styles.toggleBtn}
          >
            <ChevronDownIcon className={styles.chev} />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function CvDownloadDropdown() {
  const { dict } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.downloadWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.downloadBtn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={dict.resume.downloadAria}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        {dict.resume.downloadCv}
      </button>
      {open ? (
        <div className={styles.downloadMenu} role="menu">
          {dict.resume.cvOptions.map((opt) => (
            <a
              key={opt.file}
              href={`/${opt.file}`}
              download
              role="menuitem"
              className={styles.downloadOpt}
              onClick={() => setOpen(false)}
            >
              {opt.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** 04 — Résumé. 경력 카드 + CV 다운로드 + Timeline 링크 카드 (spec §4.1). */
export function Resume({
  lang,
  dict,
  experiences,
}: {
  lang: Locale;
  dict: Dictionary;
  experiences: Experience[];
}) {
  return (
    <section className={styles.section}>
      <SectionLabel id="resume" num="04" label="Résumé" />
      <div className={styles.headRow}>
        <h2 className={styles.heading}>{dict.resume.heading}</h2>
        <CvDownloadDropdown />
      </div>
      <div className={styles.list}>
        {experiences.map((exp, i) => (
          <ExperienceCard key={i} exp={exp} />
        ))}
      </div>
      <Link href={`/${lang}/timeline/`} className={styles.timelineLink}>
        <span>
          <span className={styles.timelineLinkTitle}>{dict.resume.timelineCardTitle}</span>
          <span className={styles.timelineLinkSub}>{dict.resume.timelineCardSub}</span>
        </span>
        <span className={styles.timelineLinkCta}>{dict.resume.timelineCardCta}</span>
      </Link>
    </section>
  );
}
