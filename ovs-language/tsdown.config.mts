import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: {
      'language-server': 'ovs-language-server/src/index.ts',
    },
    format: 'cjs',
    dts: true,
    outDir: 'dist',
    clean: true,
    target: 'es2020',
    tsconfig: 'tsconfig.json',
  },
])
