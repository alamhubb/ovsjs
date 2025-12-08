import {defineConfig} from 'tsdown'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    // 将所有依赖打包进来（解决 .ts 深层导入问题）
    noExternal: [/.*/],
})

