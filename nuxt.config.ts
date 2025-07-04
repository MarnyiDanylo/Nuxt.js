// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: [
        '@nuxt/ui',
        '@vueuse/nuxt'
    ],
    css: ['@/assets/css/tailwind.css'],
    runtimeConfig: {
        public: {
            apiBase: 'http://localhost/api'
        }
    },
    vite: {
        optimizeDeps: {
            include: ['zod']
        },
        server: {
            fs: {
                strict: false
            }
        }
    }
})
