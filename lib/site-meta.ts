import siteData from "@/data/site.json";
import { l10n } from "@/lib/i18n/l10n";
import type { Locale } from "@/lib/i18n/locales";

export const SITE_URL = "https://startergate.dev";
export const SITE_TITLE = siteData.title;
export const SITE_EMAIL = siteData.email;
export const SITE_OPEN_TO_WORK: boolean = siteData.openToWork;
export const SITE_CONFERENCES_URL = `${SITE_URL}/Conferences`;
// Previous site generations: v0 is the HTML/CSS site (startergate/old),
// v1 is the Gatsby site (startergate/startergate.dev-v1).
export const SITE_V0_URL = `${SITE_URL}/old/`;
export const SITE_V1_URL = `${SITE_URL}/v1/`;

export function getSiteDescription(locale: Locale): string {
  return l10n(siteData.description, locale);
}

export function getSiteName(locale: Locale): string {
  return l10n(siteData.name, locale);
}
