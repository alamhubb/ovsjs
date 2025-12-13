import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/parser/index.ts', 'src/factory/index.ts', 'src/generator/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
})
