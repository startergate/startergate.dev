import type { Metadata } from "next";

import { ConferenceList } from "@/components/conferences/ConferenceList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getConferenceEvents } from "@/lib/data/conferences";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/conferences">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const title = dict.pageTitles.conferences;
  return {
    title,
    ...getPageUrlMetadata(locale, "conferences/", `${title} | ${SITE_TITLE}`),
  };
}

export default async function ConferencesPage({
  params,
}: PageProps<"/[lang]/conferences">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return (
    <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
      <PageHeader title={dict.pageTitles.conferences} />
      <ConferenceList lang={locale} dict={dict} events={getConferenceEvents()} />
    </div>
  );
}
