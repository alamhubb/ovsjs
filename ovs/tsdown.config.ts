import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  outDir: 'dist',
  // 编译装饰器 - 使用 es2020 以确保装饰器被正确转换
  target: 'es2020',
  // 打包 workspace 依赖（使用正则匹配所有路径）
  noExternal: [/slime-/, /subhuti/],
  // 所有 node_modules 保持外部
  external: [/node_modules/],
})

