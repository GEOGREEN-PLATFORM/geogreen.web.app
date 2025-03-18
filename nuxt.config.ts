// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      PORTAL_HTTP_PROTOCOL: "",
      PORTAL_API_HOST: "",
      PORTAL_PORT: "",
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
    preference: "dark", // default value of $colorMode.preference
    fallback: "light", // fallback value if not system preference found
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "-mode",
    storage: "localStorage", // or 'sessionStorage' or 'cookie'
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
        primary: "var(--app-blue-9)",
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
