import * as Sentry from "@sentry/nextjs";

// Static export (GitHub Pages) has no server or edge runtime, so the browser
// is the only place Sentry runs.
Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ??
    "https://9032d632db6fbace5bde12a071b949bd@o495890.ingest.us.sentry.io/4512289493942272",
  environment: process.env.NODE_ENV,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
