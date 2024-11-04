// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'nuxt-quasar-ui',
    '@nuxt/image',
  ],
  eslint: {
    config: {
      standalone: false,
    },
  },
  css: [
    '@/assets/styles/quasar_class_overriding.scss',
    '@/assets/styles/colors.scss',
    '@/assets/styles/fonts.scss',
    '@/assets/styles/main.scss',
  ],
  quasar: {
    config: {
      brand: {
        primary: '#6369D1',
        dark: '#120C0A',
        negative: '#FA5738',
        positive: '#BC0909',
      },
    },
  },
})
