import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgicon from 'vite-plugin-svgicon'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgicon({
      include: ['**/svg/*.svg']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'svgfilepath': fileURLToPath(new URL('./src/assets/svg', import.meta.url))
    }
  }
})
