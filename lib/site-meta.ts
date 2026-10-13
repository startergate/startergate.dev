import siteData from "@/data/site.json";
import { l10n } from "@/lib/i18n/l10n";
import type { Locale } from "@/lib/i18n/locales";

export const SITE_URL = "https://startergate.dev";
export const SITE_TITLE = siteData.title;
export const SITE_EMAIL = siteData.email;
export const SITE_OPEN_TO_WORK: boolean = siteData.openToWork;

export function getSiteDescription(locale: Locale): string {
  return l10n(siteData.description, locale);
}
