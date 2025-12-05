import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginOvs from 'ovsjs'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginOvs()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

