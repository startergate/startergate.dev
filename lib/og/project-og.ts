import type { Project } from "@/lib/data/types";
import { OG_IMAGE_SIZE, SITE_OG_IMAGE, SITE_TITLE } from "@/lib/site-meta";

/** The personal logo; projects using it just get the site image. */
const PERSONAL_LOGO_SRC = "startergate.png";

/** Projects whose share image pairs the personal logo with their own logo. */
export function hasProjectOgImage(project: Project): boolean {
  const src = project.logo?.src;
  return (
    !!src && src !== PERSONAL_LOGO_SRC && src.toLowerCase().endsWith(".png")
  );
}

/** File name under /og/ built by app/(redirect)/og/[file]/route.tsx. */
export function getProjectOgFile(project: Project): string {
  return `${project.id}.png`;
}

/** og:image for a project page; falls back to the site image. */
export function getProjectOgImage(project: Project, displayName: string) {
  if (!hasProjectOgImage(project)) return SITE_OG_IMAGE;
  return {
    url: `/og/${getProjectOgFile(project)}`,
    alt: `${SITE_TITLE} · ${displayName}`,
    ...OG_IMAGE_SIZE,
    type: "image/png",
  };
}
