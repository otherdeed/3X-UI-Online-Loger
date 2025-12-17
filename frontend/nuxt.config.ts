// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app:{
    baseURL: '/secret-monitor-777/',
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico'
        },
      ]
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    public: {
      wsUrl: process.env.WS_URL || 'ws://localhost:3001/ws-logs',
      apiUrl: process.env.API_URL || 'http://localhost:3001/api'
    }
  },
  nitro: {
    serveStatic: true,
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark'
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})