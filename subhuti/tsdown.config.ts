import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  outDir: 'dist',
  // 编译装饰器
  target: 'es2020',
})

