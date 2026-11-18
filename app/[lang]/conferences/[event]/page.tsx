import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/conferences/Conference.module.css";
import { EventSessions, type EventSessionsDay } from "@/components/conferences/EventSessions";
import { ChevronLeftIcon, ExternalArrowIcon } from "@/components/icons";
import {
  getConferenceEvent,
  getConferenceEvents,
  getConferencesSourceUrl,
  getEventYear,
} from "@/lib/data/conferences";
import {
  conferenceYearAnchor,
  formatConferenceDates,
  formatDayLabel,
  shortDayDate,
} from "@/lib/data/conferences-format";
import { formatDate } from "@/lib/data/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { fillTemplate } from "@/lib/i18n/template";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

/** Only events with notes get a page; the rest are listed as "노트 없음". */
export function generateStaticParams() {
  return getConferenceEvents()
    .filter((e) => e.noteCount > 0)
    .map((e) => ({ event: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/conferences/[event]">): Promise<Metadata> {
  const { lang, event: slug } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const event = getConferenceEvent(slug);
  if (!event) return {};
  return {
    title: event.title,
    ...getPageUrlMetadata(locale, `conferences/${slug}/`, `${event.title} | ${SITE_TITLE}`),
  };
}

export default async function ConferenceEventPage({
  params,
}: PageProps<"/[lang]/conferences/[event]">) {
  const { lang, event: slug } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const t = dict.conferencesPage;
  const event = getConferenceEvent(slug);
  if (!event || event.noteCount === 0) notFound();

  const dateText = [
    formatConferenceDates(event),
    event.attendedDay ? fillTemplate(t.attendedDayTemplate, { n: event.attendedDay }) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const days: EventSessionsDay[] = event.days.map((d, i) => ({
    key: d.day ? `day-${d.day}` : `part-${i}`,
    label: formatDayLabel(d.day, dict),
    date: event.days.length > 1 && d.date ? formatDate(d.date) : "",
    shortDate: shortDayDate(d.date),
    sessions: d.sessions.map((s, j) => ({
      key: s.slug || `row-${j}`,
      title: s.title,
      time: s.time,
      speaker: s.speaker,
      href: s.notePath ? `/${locale}/conferences/${event.slug}/${s.slug}/` : undefined,
    })),
  }));

  return (
    <div className={`wrap ${styles.page}`}>
      <nav aria-label={t.breadcrumbAria} className={`mono ${styles.breadcrumb}`}>
        <Link href={`/${locale}/conferences/`}>{t.breadcrumbRoot}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${locale}/conferences/#${conferenceYearAnchor(getEventYear(event))}`}>
          {getEventYear(event)}
        </Link>
        <span aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent}>{event.title}</span>
      </nav>

      <header className={styles.eventHead}>
        <h1 className={styles.eventTitle}>{event.title}</h1>
        <div className={styles.eventMeta}>
          {dateText ? <span>{dateText}</span> : null}
          <span>{fillTemplate(t.noteCountTemplate, { n: event.noteCount })}</span>
        </div>
        {t.koreanOnlyNotice ? <p className={styles.empty}>{t.koreanOnlyNotice}</p> : null}
      </header>

      <EventSessions days={days} />

      <div className={styles.footerLinks}>
        <Link href={`/${locale}/conferences/`}>
          <ChevronLeftIcon />
          {t.backToList}
        </Link>
        {event.dir ? (
          <a href={getConferencesSourceUrl(event.dir)} target="_blank" rel="noreferrer">
            {t.viewSourceEvent}
            <ExternalArrowIcon />
          </a>
        ) : null}
      </div>
    </div>
  );
}
