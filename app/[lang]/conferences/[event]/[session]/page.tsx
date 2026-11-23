import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/conferences/Conference.module.css";
import { ExternalArrowIcon } from "@/components/icons";
import {
  getConferenceEvents,
  getConferenceNote,
  getConferencesSourceUrl,
  getEventYear,
  getNotedSessions,
  type ConferenceSession,
} from "@/lib/data/conferences";
import { conferenceYearAnchor, formatDayLabel } from "@/lib/data/conferences-format";
import { renderConferenceNote } from "@/lib/data/conferences-markdown";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

/** Every (event, session) pair with a note. [event]/page.tsx is a sibling
 * page, not a layout, so its params are not passed down here. */
export function generateStaticParams() {
  return getConferenceEvents().flatMap((e) =>
    getNotedSessions(e).map((s) => ({ event: e.slug, session: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/conferences/[event]/[session]">): Promise<Metadata> {
  const { lang, event, session } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const note = getConferenceNote(event, session);
  if (!note) return {};
  // A README-as-note session carries the event title itself.
  const title =
    note.session.title === note.event.title
      ? note.event.title
      : `${note.session.title} — ${note.event.title}`;
  return {
    title,
    ...getPageUrlMetadata(
      locale,
      `conferences/${event}/${session}/`,
      `${title} | ${SITE_TITLE}`,
    ),
  };
}

/** "DAY 2 · 10:30 ~ 11:00" */
function sessionWhen(session: ConferenceSession, dict: Dictionary): string {
  return [formatDayLabel(session.day, dict), session.time ?? ""].filter(Boolean).join(" · ");
}

export default async function ConferenceSessionPage({
  params,
}: PageProps<"/[lang]/conferences/[event]/[session]">) {
  const { lang, event: eventSlug, session: sessionSlug } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const t = dict.conferencesPage;
  const note = getConferenceNote(eventSlug, sessionSlug);
  if (!note) notFound();

  const { event, session, prev, next } = note;
  const { html, toc } = renderConferenceNote(note.body, session.notePath!);
  const when = sessionWhen(session, dict);
  const eventHref = `/${locale}/conferences/${event.slug}/`;
  const sessionHref = (s: ConferenceSession) => `${eventHref}${s.slug}/`;
  const pagerHint = (label: string, s: ConferenceSession, arrow: "prev" | "next") => {
    const parts = [label, sessionWhen(s, dict)].filter(Boolean).join(" · ");
    return arrow === "prev" ? `← ${parts}` : `${parts} →`;
  };

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.noteLayout}>
        <article className={styles.note}>
          <nav aria-label={t.breadcrumbAria} className={`mono ${styles.breadcrumb}`}>
            <Link href={`/${locale}/conferences/`}>{t.breadcrumbRoot}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/conferences/#${conferenceYearAnchor(getEventYear(event))}`}>
              {getEventYear(event)}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={eventHref}>{event.title}</Link>
            {session.day ? (
              <>
                <span aria-hidden="true">/</span>
                <span className={styles.breadcrumbCurrent}>{formatDayLabel(session.day, dict)}</span>
              </>
            ) : null}
          </nav>

          <header className={styles.noteHead}>
            <h1 className={styles.noteTitle}>{session.title}</h1>
            {session.speaker || when ? (
              <div className={styles.noteMeta}>
                {session.speaker ? <span>{session.speaker}</span> : null}
                {when ? <span className={`mono ${styles.noteTime}`}>{when}</span> : null}
              </div>
            ) : null}
          </header>

          <div
            lang="ko"
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {prev || next ? (
            <nav aria-label={t.sessionNavAria} className={styles.pager}>
              {prev ? (
                <Link href={sessionHref(prev)} className={styles.pagerLink}>
                  <span className={`mono ${styles.pagerHint}`}>{pagerHint(t.prev, prev, "prev")}</span>
                  <span className={styles.pagerTitle}>{prev.title}</span>
                </Link>
              ) : null}
              {next ? (
                <Link href={sessionHref(next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                  <span className={`mono ${styles.pagerHint}`}>{pagerHint(t.next, next, "next")}</span>
                  <span className={styles.pagerTitle}>{next.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </article>

        <aside aria-label={t.tocTitle} className={styles.toc}>
          {toc.length > 0 ? (
            <div>
              <div className={`mono ${styles.tocTitle}`}>{t.tocTitle}</div>
              <ol className={styles.tocList}>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <a
            className={styles.sourceLink}
            href={getConferencesSourceUrl(session.notePath)}
            target="_blank"
            rel="noreferrer"
          >
            {t.viewSourceNote}
            <ExternalArrowIcon />
          </a>
        </aside>
      </div>
    </div>
  );
}
