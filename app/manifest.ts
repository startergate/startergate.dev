import type { MetadataRoute } from "next";

import { SITE_TITLE } from "@/lib/site-meta";

// 정적 export 요건: Route Handler 성격의 파일이라 명시적으로 고정해야 한다.
export const dynamic = "force-static";

// 기존 gatsby-plugin-manifest 설정을 옮긴다. background/theme_color는
// 구 팔레트(#3D414D) 대신 새 디자인 토큰의 dark bg를 쓴다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: "STG",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#080B12",
    theme_color: "#080B12",
    icons: [
      {
        src: "/icon.png",
        sizes: "460x460",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
