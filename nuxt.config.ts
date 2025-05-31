// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      PORTAL_HTTP_PROTOCOL: "",
      PORTAL_API_HOST: "",
      PORTAL_API_PORT: "",
      PORTAL_KEYCLOAK_URL: "",
    },
  },

  ssr: true,
  app: {
    head: {
      charset: "utf-8",
      title: "GeoGreen",
      meta: [
        {
          name: "description",
          content:
            "GeoGreen — интерактивная платформа для быстрого обнаружения и устранения очагов экологических угроз (борщевик, свалки и др.). Отмечайте проблемы на карте, объединяйтесь и сохраняйте природу чистой!",
        },
      ],
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      htmlAttrs: {
        lang: "ru",
      },
    },
  },
  modules: [
    "@pinia/nuxt",
    "nuxt-quasar-ui",
    "@nuxt/image",
    "@nuxt/test-utils/module",
    "@sentry/nuxt/module",
  ],

  css: [
    "normalize.css/normalize.css",
    "@/assets/styles/quasar_class_overriding.scss",
    "@/assets/styles/colors.scss",
    "@/assets/styles/typography.scss",
    "@/assets/styles/fonts.scss",
    "@/assets/styles/main.scss",
    "@/assets/styles/status_model_classes.scss",
  ],

  quasar: {
    lang: "ru",
    config: {
      brand: {
        primary: "var(--app-green-500)",
        dark: "var(--app-grey-800)",
        negative: "var(--app-red-500)",
        positive: "var(--app-green-500)",
      },
      dark: "auto",
    },
  },

  build: {
    transpile: process.env.NODE_ENV === "test" ? ["vue3-openlayers", "ol"] : [],
  },
  experimental: {
    asyncContext: true,
  },
  sentry: {
    sourceMapsUploadOptions: {
      org: "geogreen-cr",
      project: "javascript-nuxt",
    },
  },

  sourcemap: {
    client: "hidden",
  },
});
