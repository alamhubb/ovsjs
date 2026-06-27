import { defineConfig } from 'tsdown'

export default defineConfig([
  // Client (VSCode Extension) - CommonJS
  {
    entry: {
      'extension': 'ovs-vscode-client/src/extension.ts',
    },
    format: 'cjs',
    outDir: 'dist',
    clean: true,
    target: 'es2020',
    tsconfig: 'tsconfig.json',
    external: ['vscode'],
  },
  // Server (Language Server) - CommonJS with types
  {
    entry: {
      'language-server': 'ovs-language-server/src/index.ts',
    },
    format: 'cjs',
    dts: true,
    outDir: 'dist',
    target: 'es2020',
    tsconfig: 'tsconfig.json',
  },
])
