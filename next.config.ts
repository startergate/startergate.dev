import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Static export has no image optimization server. After `next build`,
  // next-image-export-optimizer resizes public/images into WebP at several
  // widths, and components/ui/OptimizedImage wires them up via a custom loader.
  images: {
    loader: "custom",
    // Only the widths our fixed-size images need at 1x/2x (logos 26–168px,
    // screenshots 800–960px); every extra size is another file per image.
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 960, 1280, 1920],
  },
  transpilePackages: ["next-image-export-optimizer"],
  env: {
    nextImageExportOptimizer_imageFolderPath: "public/images",
    nextImageExportOptimizer_exportFolderPath: "out",
    nextImageExportOptimizer_quality: "75",
    nextImageExportOptimizer_storePicturesInWEBP: "true",
    nextImageExportOptimizer_exportFolderName: "nextImageExportOptimizer",
    // Logos have transparent backgrounds; a blurred placeholder looks wrong.
    nextImageExportOptimizer_generateAndUseBlurImages: "false",
  },
  experimental: {
    // app/global-not-found.tsx로 전체 사이트 공통 404를 구성한다.
    // (루트 레이아웃이 [lang] 동적 세그먼트와 "/" 리다이렉트 세그먼트로
    // 나뉘어 있어, 두 레이아웃을 합성하는 단일 not-found UI를 만들 수 없다.)
    globalNotFound: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: "startergate",
  project: "startergate-dev",

  // Source map upload; skipped when the token is absent (e.g. local builds).
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,

  // Release name defaults to the git HEAD SHA; commits are associated
  // automatically. Only builds with the token (the deploy workflow) record it.
  release: {
    deploy: { env: "production" },
  },

  silent: !process.env.CI,
});
