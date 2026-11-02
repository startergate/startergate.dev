import type { Metadata } from "next";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const title = dict.pageTitles.projects;
  return {
    title,
    ...getPageUrlMetadata(locale, "projects/", `${title} | ${SITE_TITLE}`),
  };
}

/** 목록 UI는 layout.tsx에 있다 — 이 페이지는 메타데이터만 담당한다. */
export default function ProjectsPage() {
  return null;
}
