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
      // 让 cssts 使用本地版本（新结构）
      'cssts': fileURLToPath(new URL('../../cssts/src/index.ts', import.meta.url)),
      'cssts-runtime': fileURLToPath(new URL('../../cssts/packages/cssts-runtime/src/index.ts', import.meta.url)),
      'cssts-compiler': fileURLToPath(new URL('../../cssts/packages/cssts-compiler/src/index.ts', import.meta.url)),
      // 让 cssts-theme-element 使用本地版本
      'cssts-theme-element': fileURLToPath(new URL('../../cssts-theme-element/src/index.ts', import.meta.url)),
      // 让 @cssts-ui/components 使用本地版本
      '@cssts-ui/components': fileURLToPath(new URL('../../cssts-ui/packages/cssts-components/src/index.ts', import.meta.url))
    },
    // 添加 .cssts 扩展名解析支持
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.cssts']
  },
  // 配置 esbuild 跳过 cssts-ui 目录（因为它包含 css {} 语法）
  optimizeDeps: {
    exclude: ['@cssts-ui/components']
  }
})
