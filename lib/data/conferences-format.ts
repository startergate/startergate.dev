import { fillTemplate } from "@/lib/i18n/template";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";

import type { ConferenceEvent } from "./conferences";
import { formatDate } from "./format";

/** "2023.05.03 ~ 2023.05.04", or one date. */
export function formatConferenceDates(event: ConferenceEvent): string {
  const { dates } = event;
  if (dates.length === 0) return "";
  const first = formatDate(dates[0]);
  const last = formatDate(dates[dates.length - 1]);
  return first === last ? first : `${first} ~ ${last}`;
}

/** Element id of a year row on the list page, e.g. "year-2019". */
export function conferenceYearAnchor(year: string): string {
  return `year-${year}`;
}

/** "DAY 1" or "" when the day has no number. */
export function formatDayLabel(day: number | null | undefined, dict: Dictionary): string {
  return day ? fillTemplate(dict.conferencesPage.dayLabelTemplate, { n: day }) : "";
}

/** "05.03" from "2023-05-03"; "" for coarser dates. */
export function shortDayDate(date: string | undefined): string {
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? formatDate(date.slice(5)) : "";
}
