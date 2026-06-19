import * as Sentry from "@sentry/nextjs";

const dsn = process.env.BUGSINK_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  tracesSampleRate: 0,
  enabled: process.env.NODE_ENV === "production" && Boolean(dsn),
  sendDefaultPii: false,
});
