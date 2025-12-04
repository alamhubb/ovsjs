import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: 'cjs',  // VSCode 扩展需要 CommonJS
  dts: false,     // 不需要类型声明
  clean: true,
  outDir: 'out',
  // 所有依赖都作为外部模块
  external: [
    'vscode',
    '@volar/language-server/protocol',
    '@volar/vscode',
    '@volar/vscode/node',
    'path',
  ],
})

