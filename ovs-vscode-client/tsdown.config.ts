import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: 'cjs',  // VSCode 扩展需要 CommonJS
  dts: false,     // 不需要类型声明
  clean: true,
  outDir: 'out',
  external: ['vscode'],  // vscode 模块由 VSCode 提供
})

