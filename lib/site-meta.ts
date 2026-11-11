import type { Metadata } from "next";

import siteData from "@/data/site.json";
import { l10n } from "@/lib/i18n/l10n";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export const SITE_URL = "https://startergate.dev";
export const SITE_TITLE = siteData.title;
export const SITE_EMAIL = siteData.email;
export const SITE_OPEN_TO_WORK: boolean = siteData.openToWork;
export const SITE_CONFERENCES_URL = `${SITE_URL}/Conferences`;
// Previous site generations: v0 is the HTML/CSS site (startergate/old),
// v1 is the Gatsby site (startergate/startergate.dev-v1).
export const SITE_V0_URL = `${SITE_URL}/old/`;
export const SITE_V1_URL = `${SITE_URL}/v1/`;

export const TWITTER_CREATOR = "@satellite_stg";

/** Size of the generated og.png (lib/og/og-image.tsx). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/** The default share image, built by app/(redirect)/og.png/route.tsx. */
export const SITE_OG_IMAGE = {
  url: "/og.png",
  alt: SITE_TITLE,
  ...OG_IMAGE_SIZE,
  type: "image/png",
};

const OG_LOCALES: Record<Locale, string> = { ko: "ko_KR", en: "en_US" };

/**
 * canonical, hreflang, og:* and twitter:* for one localized page. `path` is
 * the part after the locale prefix ("" for home, "projects/" etc.).
 * openGraph and twitter are returned whole because Next replaces the
 * parent's objects rather than merging them, so the image is repeated on
 * every page. The image is an og.png route handler rather than the
 * opengraph-image convention: under output: "export" that convention
 * writes extensionless files and only reaches pages without their own
 * openGraph.
 */
export function getPageUrlMetadata(
  locale: Locale,
  path: string,
  title: string = SITE_TITLE,
  description: string = getSiteDescription(locale),
  image: typeof SITE_OG_IMAGE = SITE_OG_IMAGE,
): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: {
      canonical: `/${locale}/${path}`,
      languages: {
        ko: `/ko/${path}`,
        en: `/en/${path}`,
        "x-default": `/en/${path}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/${locale}/${path}`,
      siteName: SITE_TITLE,
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALES[l],
      ),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_CREATOR,
      title,
      description,
      images: [image],
    },
  };
}

export function getSiteDescription(locale: Locale): string {
  return l10n(siteData.description, locale);
}

export function getSiteName(locale: Locale): string {
  return l10n(siteData.name, locale);
}
