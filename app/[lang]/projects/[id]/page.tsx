import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllProjects } from "@/lib/data/projects";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales";
import { SITE_TITLE, getPageUrlMetadata } from "@/lib/site-meta";

/**
 * 목록(layout.tsx)이 useParams로 id를 읽어 팝업을 연 상태로 그린다
 * (spec §2.3, 2026-10-13 변경: 쿼리 파라미터 대신 실제 라우트). 이
 * 페이지는 메타데이터만 담당한다. 존재하지 않는 id는
 * generateStaticParams에 없으니 정적 export에서 아예 빌드되지 않고,
 * 404(global-not-found)가 목록으로 리다이렉트한다.
 */
export function generateStaticParams() {
  return getAllProjects().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const project = getAllProjects().find((p) => p.id === id);
  return {
    title: project?.name,
    ...getPageUrlMetadata(
      locale,
      `projects/${id}/`,
      project ? `${project.name} | ${SITE_TITLE}` : SITE_TITLE,
    ),
  };
}

export default async function ProjectDeepLinkPage({
  params,
}: PageProps<"/[lang]/projects/[id]">) {
  const { id } = await params;
  if (!getAllProjects().some((p) => p.id === id)) {
    notFound();
  }
  return null;
}
