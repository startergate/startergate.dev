"use client";

import Link from "next/link";
import { useState } from "react";

import { ChevronRightIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";

import styles from "./Conference.module.css";

export type EventSessionsDay = {
  key: string;
  /** "DAY 1"; "" when the event has no day split. */
  label: string;
  /** "2023.05.03" */
  date: string;
  /** "05.03" for the tab */
  shortDate: string;
  sessions: {
    key: string;
    title: string;
    time?: string;
    speaker?: string;
    href?: string;
  }[];
};

/**
 * 행사 페이지의 세션 목록 (spec §4.4). 여러 날 간 행사는 날짜 탭
 * (전체 / DAY 1 / DAY 2)으로 나눈다. 섹션 번호 라벨은 두지 않는다.
 */
export function EventSessions({ days }: { days: EventSessionsDay[] }) {
  const { dict } = useLang();
  const t = dict.conferencesPage;
  const [selected, setSelected] = useState("all");
  const multi = days.length > 1;
  const shown = multi && selected !== "all" ? days.filter((d) => d.key === selected) : days;
  const tabs = [
    { key: "all", label: t.allDays },
    ...days.map((d) => ({
      key: d.key,
      label: d.shortDate ? `${d.label} · ${d.shortDate}` : d.label,
    })),
  ];

  return (
    <section aria-label={t.sessionsAria} className={styles.sessions}>
      {multi ? (
        <div role="group" aria-label={t.dayTabsAria} className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${selected === tab.key ? styles.tabOn : ""}`}
              aria-pressed={selected === tab.key}
              onClick={() => setSelected(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {shown.map((day) => (
        <div key={day.key} className={styles.day}>
          {day.label || day.date ? (
            <div className={styles.dayHead}>
              {day.label ? <span className={`mono ${styles.dayLabel}`}>{day.label}</span> : null}
              {day.date ? <span className={`mono ${styles.dayDate}`}>{day.date}</span> : null}
            </div>
          ) : null}
          {day.sessions.length === 0 ? (
            <p className={styles.empty}>{t.noSessions}</p>
          ) : (
            <ol className={styles.sessionList}>
              {day.sessions.map((s) => {
                const body = (
                  <>
                    <span className={`mono ${styles.sessionTime}`}>{s.time ?? "—"}</span>
                    <span className={styles.sessionMain}>
                      <span className={styles.sessionTitle}>{s.title}</span>
                      {s.speaker ? (
                        <span className={styles.sessionSpeaker}>{s.speaker}</span>
                      ) : null}
                    </span>
                    {s.href ? (
                      <ChevronRightIcon className={styles.sessionArrow} />
                    ) : (
                      <span className={styles.sessionNoNote}>{t.noNoteSession}</span>
                    )}
                  </>
                );
                return (
                  <li key={s.key} className={styles.sessionItem}>
                    {s.href ? (
                      <Link href={s.href} className={styles.sessionRow}>
                        {body}
                      </Link>
                    ) : (
                      <div className={`${styles.sessionRow} ${styles.sessionRowStatic}`}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ))}
    </section>
  );
}
