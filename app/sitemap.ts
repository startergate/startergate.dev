import type { MetadataRoute } from "next";

import { getConferenceEvents, getNotedSessions } from "@/lib/data/conferences";
import { getAllProjects } from "@/lib/data/projects";
import { LOCALES } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/site-meta";

export const dynamic = "force-static";

/** Every localized page with ko/en hreflang alternates ("/" is noindex). */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "projects/",
    "timeline/",
    ...getAllProjects().map((p) => `projects/${p.id}/`),
    "conferences/",
    ...getConferenceEvents()
      .filter((e) => e.noteCount > 0)
      .flatMap((e) => [
        `conferences/${e.slug}/`,
        ...getNotedSessions(e).map((s) => `conferences/${e.slug}/${s.slug}/`),
      ]),
  ];
  return paths.flatMap((path) => {
    const languages = {
      ...Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE_URL}/${l}/${path}`]),
      ),
      "x-default": `${SITE_URL}/en/${path}`,
    };
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/${path}`,
      alternates: { languages },
    }));
  });
}
