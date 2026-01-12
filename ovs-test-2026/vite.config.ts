import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ovs from 'vite-plugin-ovs'
import { viteMono } from '../../monorepo/vite-plugin-mono/src/index'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        viteMono(),  // 必须放在最前面，拦截本地包
        vue(),
        vueDevTools(),
        ovs()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        host: '192.168.1.7'
    }
})
