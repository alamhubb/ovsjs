import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vitePluginOvs from '../ovs/src/index.ts'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginOvs()
  ],
  esbuild: {
    target: 'es2022'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

