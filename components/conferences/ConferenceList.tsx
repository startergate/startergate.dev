import Link from "next/link";

import timelineStyles from "@/components/timeline/TimelineList.module.css";
import { getEventYear, type ConferenceEvent } from "@/lib/data/conferences";
import { conferenceYearAnchor, formatConferenceDates } from "@/lib/data/conferences-format";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";
import type { Locale } from "@/lib/i18n/locales";
import { fillTemplate } from "@/lib/i18n/template";

import styles from "./ConferenceList.module.css";

function groupByYear(events: ConferenceEvent[]) {
  const map = new Map<string, ConferenceEvent[]>();
  for (const event of events) {
    const year = getEventYear(event);
    map.set(year, [...(map.get(year) ?? []), event]);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, items]) => ({ year, items }));
}

/**
 * 가 본 컨퍼런스 목록 (spec §4.4). 타임라인(TimelineList)과 같은
 * 연도별 세로 타임라인 구조·스타일을 그대로 쓰고, 필터·검색은 없다.
 * 노트가 있는 행사는 행사 페이지로, 노트를 다른 곳에 둔 행사는 그
 * 링크로 가고, 노트가 없는 행사는 링크 없이 보인다.
 */
export function ConferenceList({
  lang,
  dict,
  events,
}: {
  lang: Locale;
  dict: Dictionary;
  events: ConferenceEvent[];
}) {
  const t = dict.conferencesPage;
  const years = groupByYear(events);

  return (
    <>
      {t.koreanOnlyNotice ? <p className={styles.notice}>{t.koreanOnlyNotice}</p> : null}
      <section
        aria-label={t.listAria}
        className={`${timelineStyles.timelineSection} ${styles.list}`}
      >
        <div aria-hidden="true" className={`${timelineStyles.axis} ${styles.axis}`} />
        {years.map((yr) => (
          <div
            key={yr.year}
            id={conferenceYearAnchor(yr.year)}
            className={`${timelineStyles.row} ${styles.yearRow}`}
          >
            <div className={timelineStyles.yearCol}>{yr.year}</div>
            <div className={timelineStyles.itemsCol}>
              {yr.items.map((event) => {
                const chip =
                  event.noteCount > 0
                    ? fillTemplate(t.sessionCountTemplate, { n: event.noteCount })
                    : event.externalUrl
                      ? t.externalNotes
                      : t.noNotes;
                const sub = event.attendedDay
                  ? fillTemplate(t.attendedDayTemplate, { n: event.attendedDay })
                  : undefined;
                const dot =
                  event.noteCount > 0 ? timelineStyles.dotCareer : timelineStyles.dotOther;
                const content = (
                  <>
                    <span aria-hidden="true" className={`${timelineStyles.dot} ${dot}`} />
                    <div className={timelineStyles.itemTop}>
                      <span className={timelineStyles.typeTag}>{chip}</span>
                      <span className={`mono ${timelineStyles.date}`}>
                        {formatConferenceDates(event)}
                      </span>
                    </div>
                    <h2 className={timelineStyles.heading}>{event.title}</h2>
                    {sub ? <p className={timelineStyles.sub}>{sub}</p> : null}
                  </>
                );
                if (event.noteCount > 0) {
                  return (
                    <Link
                      key={event.slug}
                      href={`/${lang}/conferences/${event.slug}/`}
                      className={timelineStyles.item}
                    >
                      {content}
                    </Link>
                  );
                }
                if (event.externalUrl) {
                  return (
                    <a
                      key={event.slug}
                      href={event.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={timelineStyles.item}
                    >
                      {content}
                    </a>
                  );
                }
                return (
                  <article key={event.slug} className={`${timelineStyles.item} ${styles.static}`}>
                    {content}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
