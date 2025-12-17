import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node'
  },
  external: [/node_modules/],
})

