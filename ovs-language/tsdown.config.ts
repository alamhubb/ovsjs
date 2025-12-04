import { defineConfig } from 'tsdown'

const isWatch = process.argv.includes('--watch')

export default defineConfig([
  // Client (VSCode Extension) - CommonJS
  {
    entry: ['ovs-vscode-client/src/extension.ts'],
    format: 'cjs',
    dts: false,
    clean: !isWatch, // watch 模式下不清理，避免循环触发
    outDir: 'dist',
    // 重命名输出文件
    outExtension: () => ({ js: '.cjs' }),
    // VSCode 模块必须外部化
    external: [
      'vscode',
    ],
    // 打包所有其他依赖
    noExternal: [
      '@volar/language-server/protocol',
      '@volar/vscode',
      '@volar/vscode/node',
      'vscode-languageclient',
    ],
  },
  // Server (Language Server) - CommonJS (VSCode LanguageClient 需要 CJS)
  {
    entry: {
      'language-server': 'ovs-lang-server/src/index.ts',
    },
    format: 'cjs',
    dts: false,
    clean: false, // 不清理，因为上面已经清理过了
    outDir: 'dist',
    target: 'es2020',
    outExtension: () => ({ js: '.cjs' }),
    // 只外部化 typescript（用户 VSCode 自带）
    external: [
      'typescript',
    ],
    // 打包所有其他依赖
    noExternal: [/.*/],
  },
])

