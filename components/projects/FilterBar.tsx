"use client";

import { useState } from "react";

import { CheckIcon, ChevronDownIcon, CloseIcon } from "@/components/icons";
import { STATUS_COLOR_VAR } from "@/lib/data/status";
import {
  CAT_OPTIONS,
  STATUS_OPTIONS,
  type FilterKey,
  type ProjectFilters,
} from "@/lib/data/project-filter";
import type { Project } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";
import { fillTemplate } from "@/lib/i18n/template";

import styles from "./FilterBar.module.css";

type Group = {
  key: FilterKey;
  label: string;
  width: string;
  cols: string;
  options: { value: string; label: string; color?: string }[];
};

/**
 * 프로젝트 목록 필터 바: 드롭다운 4개(체크박스+개수), 칩, 전체 초기화,
 * 결과 개수 (spec §4.2, 시안 Projects.dc.html). 드롭다운 바깥을 클릭하면
 * 닫히는 건 보이지 않는 전체 화면 오버레이로 구현한다(시안과 동일).
 */
export function FilterBar({
  dict,
  filters,
  onToggle,
  onReset,
  allProjects,
  techOptions,
  typeOptions,
  resultCount,
}: {
  dict: Dictionary;
  filters: ProjectFilters;
  onToggle: (key: FilterKey, value: string) => void;
  onReset: () => void;
  allProjects: Project[];
  techOptions: string[];
  typeOptions: string[];
  resultCount: number;
}) {
  const [openDd, setOpenDd] = useState<FilterKey | null>(null);
  const [resultCountPrefix, resultCountSuffix] =
    dict.projectsPage.resultCountTemplate.split("{count}");

  const countFor = (key: FilterKey, value: string): number => {
    switch (key) {
      case "cat":
        return allProjects.filter((p) => p.category === value).length;
      case "tech":
        return allProjects.filter((p) => p.techs.includes(value)).length;
      case "type":
        return allProjects.filter((p) => p.types.includes(value)).length;
      case "status":
        return allProjects.filter((p) => p.status === value).length;
    }
  };

  const groups: Group[] = [
    {
      key: "cat",
      label: dict.projectsPage.filters.cat,
      width: "220px",
      cols: "minmax(0, 1fr)",
      options: CAT_OPTIONS.map((k) => ({ value: k, label: dict.projectsPage.category[k] })),
    },
    {
      key: "tech",
      label: dict.projectsPage.filters.tech,
      width: "440px",
      cols: "repeat(2, minmax(0, 1fr))",
      options: techOptions.map((k) => ({ value: k, label: k })),
    },
    {
      key: "type",
      label: dict.projectsPage.filters.type,
      width: "260px",
      cols: "minmax(0, 1fr)",
      options: typeOptions.map((k) => ({ value: k, label: k })),
    },
    {
      key: "status",
      label: dict.projectsPage.filters.status,
      width: "220px",
      cols: "minmax(0, 1fr)",
      options: STATUS_OPTIONS.map((k) => ({
        value: k,
        label: dict.status[k],
        color: STATUS_COLOR_VAR[k],
      })),
    },
  ];

  const activeChips = groups.flatMap((g) =>
    filters[g.key].map((value) => {
      const opt = g.options.find((o) => o.value === value);
      const label = opt?.label ?? value;
      return { key: `${g.key}:${value}`, label, groupKey: g.key, value };
    }),
  );

  const hasActiveFilters = activeChips.length > 0;

  return (
    <section aria-label={dict.pageTitles.projects} className={styles.section}>
      {openDd ? (
        <div
          aria-hidden="true"
          className={styles.outsideOverlay}
          onClick={() => setOpenDd(null)}
        />
      ) : null}
      <div className={styles.row}>
        {groups.map((g) => {
          const sel = filters[g.key];
          const isOpen = openDd === g.key;
          return (
            <div key={g.key} className={styles.ddWrap}>
              <button
                type="button"
                className={`${styles.ddBtn} ${isOpen ? styles.ddBtnOpen : ""} ${sel.length ? styles.ddBtnSel : ""}`}
                onClick={() => setOpenDd(isOpen ? null : g.key)}
                aria-haspopup="true"
                aria-expanded={isOpen}
              >
                <span>{g.label}</span>
                {sel.length > 0 ? <span className={styles.ddCount}>{sel.length}</span> : null}
                <ChevronDownIcon className={styles.ddChev} />
              </button>
              {isOpen ? (
                <div
                  role="group"
                  aria-label={g.label}
                  className={styles.ddPop}
                  style={{ width: g.width, gridTemplateColumns: g.cols }}
                >
                  {g.options.map((o) => {
                    const on = (sel as string[]).includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        className={`${styles.ddOpt} ${on ? styles.ddOptOn : ""}`}
                        onClick={() => onToggle(g.key, o.value)}
                      >
                        <span className={styles.ddCheck}>
                          <CheckIcon />
                        </span>
                        {o.color ? (
                          <span className={styles.ddDot} style={{ background: o.color }} />
                        ) : null}
                        <span className={styles.ddOptLabel}>{o.label}</span>
                        <span className={styles.chipCount}>{countFor(g.key, o.value)}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
        <span aria-live="polite" className={styles.count}>
          {resultCountPrefix}
          <strong className={styles.countNum}>{resultCount}</strong>
          {resultCountSuffix}
        </span>
      </div>

      {hasActiveFilters ? (
        <div className={styles.chipsRow}>
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              className={styles.chip}
              onClick={() => onToggle(c.groupKey, c.value)}
              aria-label={fillTemplate(dict.projectsPage.removeChipAriaTemplate, { label: c.label })}
            >
              {c.label}
              <CloseIcon />
            </button>
          ))}
          <button type="button" className={styles.resetBtn} onClick={onReset}>
            {dict.projectsPage.resetFilters}
          </button>
        </div>
      ) : null}
    </section>
  );
}
