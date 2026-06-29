import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ovs from '../vite-plugin-ovs/src/index.ts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ovs()
    ],
    resolve: {
        alias: [
            { find: 'ovs-compiler', replacement: resolve(__dirname, '../ovs/ovs-compiler/src/index.ts') },
            { find: 'ovsjs', replacement: resolve(__dirname, '../ovs/ovs-runtime/src/index.ts') },
            { find: 'cssts-compiler', replacement: resolve(__dirname, '../../cssts/cssts/cssts-compiler/src/index.ts') }
        ]
    },
    optimizeDeps: {
        // 排除本地包，不进行预构建
        exclude: [
            'ovs-compiler',
            'ovsjs',
            'cssts-compiler'
        ]
    },
    server: {
        host: '192.168.1.7'
    }
})
