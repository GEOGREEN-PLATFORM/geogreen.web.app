import * as Sentry from "@sentry/nuxt";

Sentry.init({
  dsn: "https://4aecef0cc8b39de43242f42c561a833a@o4509306986299392.ingest.de.sentry.io/4509306987675728",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
