import { getAllProjects } from "@/lib/data/projects";
import { renderProjectOgImage } from "@/lib/og/og-image";
import { getProjectOgFile, hasProjectOgImage } from "@/lib/og/project-og";

// Share images for projects with their own logo: out/og/{id}.png.
// Language-independent (no text), so one file per project.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects()
    .filter(hasProjectOgImage)
    .map((p) => ({ file: getProjectOgFile(p) }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/og/[file]">,
) {
  const { file } = await params;
  const project = getAllProjects().find(
    (p) => hasProjectOgImage(p) && getProjectOgFile(p) === file,
  );
  if (!project?.logo) return new Response(null, { status: 404 });
  return renderProjectOgImage(project.logo);
}
