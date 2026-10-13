"use client";

import { useCallback, useMemo, useState } from "react";

import { useRegisterConsoleCapabilities } from "@/lib/console/ConsoleCapabilities";
import { formatTimelineHeading } from "@/lib/data/timeline-format";
import type { TimelineItem, TimelineType } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";
import type { Locale } from "@/lib/i18n/locales";

import styles from "./TimelineList.module.css";

const TYPES: TimelineType[] = ["career", "award", "cert", "group", "edu"];
const ALL_KEYS = ["all", ...TYPES] as const;

function dotClass(type: TimelineType): string {
  if (type === "award") return styles.dotAward;
  if (type === "career") return styles.dotCareer;
  return styles.dotOther;
}

function groupByYear(items: TimelineItem[]) {
  const map = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const list = map.get(item.year) ?? [];
    list.push(item);
    map.set(item.year, list);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, yearItems]) => ({ year, items: yearItems }));
}

/**
 * 카테고리 칩(단일 선택) + 연도별 세로 타임라인 (spec §4.3,
 * 시안 Timeline.dc.html). 필터는 URL에 남기지 않는다.
 */
export function TimelineList({
  lang,
  dict,
  items,
}: {
  lang: Locale;
  dict: Dictionary;
  items: TimelineItem[];
}) {
  const [active, setActive] = useState<TimelineType | "all">("all");

  const filtered = active === "all" ? items : items.filter((i) => i.type === active);
  const years = groupByYear(filtered);

  const consoleApplyFilter = useCallback(
    (args: string[]) => {
      const key = args[0]?.toLowerCase();
      const match = ALL_KEYS.find((k) => k === key);
      if (!match) return undefined;
      setActive(match);
      const label = match === "all" ? dict.timelinePage.all : dict.timelinePage.types[match];
      return { group: "filter", label, added: true };
    },
    [dict],
  );

  useRegisterConsoleCapabilities(
    useMemo(
      () => ({
        filter: { apply: consoleApplyFilter, help: dict.console.filterTimelineHelp },
        reset: () => setActive("all"),
      }),
      [consoleApplyFilter, dict],
    ),
  );

  return (
    <>
      <section aria-label={dict.timelinePage.all} className={styles.filterSection}>
        <div role="group" aria-label={dict.timelinePage.all} className={styles.chips}>
          <button
            type="button"
            className={`${styles.chip} ${active === "all" ? styles.chipOn : ""}`}
            onClick={() => setActive("all")}
            aria-pressed={active === "all"}
          >
            {dict.timelinePage.all}
            <span className={styles.chipCount}>{items.length}</span>
          </button>
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.chip} ${active === t ? styles.chipOn : ""}`}
              onClick={() => setActive(t)}
              aria-pressed={active === t}
            >
              {dict.timelinePage.types[t]}
              <span className={styles.chipCount}>
                {items.filter((i) => i.type === t).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Timeline" className={styles.timelineSection}>
        <div aria-hidden="true" className={styles.axis} />
        {years.map((yr) => (
          <div key={yr.year} className={styles.row}>
            <div className={styles.yearCol}>{yr.year}</div>
            <div className={styles.itemsCol}>
              {yr.items.map((item, i) => {
                const { heading, sub } = formatTimelineHeading(item, lang);
                const Tag = item.link ? "a" : "article";
                return (
                  <Tag
                    key={i}
                    href={item.link}
                    target={item.link ? "_blank" : undefined}
                    rel={item.link ? "noreferrer" : undefined}
                    className={styles.item}
                  >
                    <span aria-hidden="true" className={`${styles.dot} ${dotClass(item.type)}`} />
                    <div className={styles.itemTop}>
                      <span className={styles.typeTag}>{dict.timelinePage.types[item.type]}</span>
                      <span className={`mono ${styles.date}`}>{item.date}</span>
                    </div>
                    <h2 className={styles.heading}>{heading}</h2>
                    {sub ? <p className={styles.sub}>{sub}</p> : null}
                  </Tag>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
