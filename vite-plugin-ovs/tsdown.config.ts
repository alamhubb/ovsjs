import {defineConfig} from 'tsdown'

export default defineConfig({
    entry: ['index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    outDir: 'dist',
    target: 'es2022',
    external: [/node_modules/],
})

