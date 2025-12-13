import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 使用本地开发版本的 vite-plugin-ovs
import ovs from '../../vite-plugin-ovs/src/index.ts'

export default defineConfig({
  plugins: [
    vue(),
    ovs()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 让 ovs-compiler 使用本地版本
      'ovs-compiler': fileURLToPath(new URL('../../ovs/ovs-compiler/src/index.ts', import.meta.url)),
      // 让 cssts 使用本地版本
      'cssts': fileURLToPath(new URL('../../cssts/src/runtime/index.ts', import.meta.url)),
      // 让 cssts-theme-element 使用本地版本
      'cssts-theme-element': fileURLToPath(new URL('../../cssts-theme-element/src/index.ts', import.meta.url))
    }
  }
})
