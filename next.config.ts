import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
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
