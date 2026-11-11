import { renderOgImage } from "@/lib/og/og-image";

// The single share image used by every page (lib/site-meta.ts
// SITE_OG_IMAGE), built once to out/og.png.
export const dynamic = "force-static";

export async function GET() {
  return renderOgImage();
}
