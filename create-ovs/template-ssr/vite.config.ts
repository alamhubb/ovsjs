import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ovs from 'vite-plugin-ovs'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ovs()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    // 构建配置：生成易读的代码
    build: {
        minify: false,           // 不压缩
        sourcemap: true,         // 生成 sourcemap
        rollupOptions: {
            output: {
                // 保持模块结构，方便阅读
                preserveModules: false,
                // 不混淆变量名
                compact: false,
            }
        }
    },
    // SSR 配置
    ssr: {
        // 不外部化 ovsjs，确保它被正确编译
        noExternal: ['ovsjs']
    }
})

