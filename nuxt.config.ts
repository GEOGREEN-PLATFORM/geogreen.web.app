// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      PORTAL_HTTP_PROTOCOL: "",
      PORTAL_API_HOST: "",
      PORTAL_PORT_GEOSPATIAL: "",
      PORTAL_PORT_FILE_SERVER: "",
      PORTAL_PORT_PHOTO_ANALYSE: "",
      PORTAL_PORT_USER_REPORT: "",
    },
  },
  modules: [
    "@pinia/nuxt",
    "nuxt-quasar-ui",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@nuxt/test-utils/module",
  ],
  colorMode: {
    preference: "light",
    fallback: "light",
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "-mode",
    storage: "cookie",
    storageKey: "nuxt-color-mode",
  },
  css: [
    "normalize.css/normalize.css",
    "@/assets/styles/quasar_class_overriding.scss",
    "@/assets/styles/colors.scss",
    "@/assets/styles/typography.scss",
    "@/assets/styles/fonts.scss",
    "@/assets/styles/main.scss",
  ],
  quasar: {
    lang: "ru",
    config: {
      brand: {
        primary: "var(--app-green-500)",
        dark: "",
        negative: "var(--app-red-500)",
        positive: "#BC0909",
      },
    },
  },
  build: {
    transpile: process.env.NODE_ENV === "test" ? ["vue3-openlayers", "ol"] : [],
  },
});
