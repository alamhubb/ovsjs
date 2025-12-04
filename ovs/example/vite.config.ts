import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from "node:url";
import {vitePluginOvsTransform} from "../src";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vitePluginOvsTransform()
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
