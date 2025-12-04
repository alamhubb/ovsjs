import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vitePluginOvs()
    ],
    build: {
        minify: false,
    },
    esbuild: {
        target: 'es2022'
    },
    resolve: {
        alias: {
            '@':
                fileURLToPath(new URL('./example/src', import.meta.url))
        }
    }
})
