import { PageHeader } from "@/components/layout/PageHeader";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";

export default async function TimelinePage({
  params,
}: PageProps<"/[lang]/timeline">) {
  const { lang } = await params;
  const dict = await getDictionary(isLocale(lang) ? lang : DEFAULT_LOCALE);

  // TODO(4단계): 카테고리 칩 + 연도별 세로 타임라인으로 채운다.
  return <PageHeader title={dict.pageTitles.timeline} />;
}
