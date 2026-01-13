import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ovs from 'vite-plugin-ovs'
import { viteMono } from '../../monorepo/vite-plugin-mono/src/index'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        viteMono(),  // 必须放在最前面，拦截本地包
        vue(),
        vueDevTools(),
        ovs()
    ],
    resolve: {
        alias: [
            { find: 'ovs-compiler', replacement: resolve(__dirname, '../ovs/ovs-compiler/src/index.ts') },
            { find: 'ovsjs', replacement: resolve(__dirname, '../ovs/ovs-runtime/src/index.ts') },
            { find: 'cssts-compiler', replacement: resolve(__dirname, '../../cssts/cssts/cssts-compiler/src/index.ts') },
            { find: 'slime-parser', replacement: resolve(__dirname, '../../slime/slime-parser/src/index.ts') },
            { find: 'slime-ast', replacement: resolve(__dirname, '../../slime/slime-ast/src/index.ts') },
            { find: 'slime-generator', replacement: resolve(__dirname, '../../slime/slime-generator/src/index.ts') },
            { find: 'slime-token', replacement: resolve(__dirname, '../../slime/slime-token/src/index.ts') }
        ]
    },
    optimizeDeps: {
        // 排除本地包，不进行预构建
        exclude: [
            'ovs-compiler',
            'ovsjs',
            'cssts-compiler',
            'slime-parser',
            'slime-ast',
            'slime-generator',
            'slime-token'
        ]
    },
    server: {
        host: '192.168.1.7'
    }
})
