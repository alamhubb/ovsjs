import { defineConfig } from 'tsdown'

const isDev = process.argv.includes('--watch')

export default defineConfig([
  // Client (VSCode Extension) - CommonJS
  {
    entry: ['ovs-vscode-client/src/extension.ts'],
    format: 'cjs',
    dts: false,
    clean: true,
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
  // Server (Language Server) - ESM
  {
    entry: {
      'language-server': 'ovs-lang-server/src/index.ts',
    },
    format: 'esm',
    dts: false,
    clean: false, // 不清理，因为上面已经清理过了
    outDir: 'dist',
    target: 'es2020',
    // 外部依赖：Node 内置模块和一些大型依赖
    external: [
      // @volar 系列保持外部
      '@volar/language-server',
      '@volar/language-server/node.js',
      '@volar/language-server/lib/project/typescriptProject.js',
      '@volar/language-server/lib/project/typescriptProjectLs.js',
      '@volar/language-server/lib/project/simpleProject.js',
      '@volar/language-server/lib/project/inferredCompilerOptions.js',
      '@volar/language-server/lib/features/configurations.js',
      '@volar/language-server/lib/features/editorFeatures.js',
      '@volar/language-server/lib/features/textDocuments.js',
      '@volar/language-server/lib/features/workspaceFolders.js',
      '@volar/language-server/lib/features/fileWatcher.js',
      '@volar/language-server/lib/features/languageFeatures.js',
      '@volar/language-server/lib/features/fileSystem.js',
      '@volar/language-core',
      '@volar/language-service',
      '@volar/typescript',
      // 其他外部依赖
      'typescript',
      'vscode-languageserver',
      'vscode-uri',
      'path-browserify',
      'semver',
      'vscode-nls',
      'typescript-auto-import-cache',
    ],
    // 打包 workspace 依赖 (ovsjs, slime-*, subhuti)
    noExternal: [
      /^ovsjs/,
      /^slime-/,
      /^subhuti/,
    ],
  },
])

