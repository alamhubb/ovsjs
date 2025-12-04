import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  outDir: 'dist',
  // 编译装饰器
  target: 'es2020',
  // 只把 npm 包标记为外部依赖，workspace 依赖会被打包进去
  external: [
    // @volar 系列
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
    // 其他 npm 包
    'typescript',
    'vscode-languageserver',
    'vscode-uri',
    'path-browserify',
    'semver',
    'vscode-nls',
    'typescript-auto-import-cache',
    // 注意：ovsjs, subhuti, slime-* 等 workspace 依赖不在这里，会被打包进去
  ],
})

