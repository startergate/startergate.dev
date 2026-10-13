import { PageHeader } from "@/components/layout/PageHeader";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";

export default async function ProjectsPage({
  params,
}: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  const dict = await getDictionary(isLocale(lang) ? lang : DEFAULT_LOCALE);

  // TODO(3단계): 필터 바 + 카드 그리드 + 팝업(/{lang}/projects/{id}/)로 채운다.
  return <PageHeader title={dict.pageTitles.projects} />;
}
