import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { TimelineList } from "@/components/timeline/TimelineList";
import { getTimelineItems } from "@/lib/data/timeline";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/timeline">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const title = dict.pageTitles.timeline;
  return {
    title,
    ...getPageUrlMetadata(locale, "timeline/", `${title} | ${SITE_TITLE}`),
  };
}

export default async function TimelinePage({
  params,
}: PageProps<"/[lang]/timeline">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return (
    <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
      <PageHeader title={dict.pageTitles.timeline} />
      <TimelineList lang={locale} dict={dict} items={getTimelineItems()} />
    </div>
  );
}
