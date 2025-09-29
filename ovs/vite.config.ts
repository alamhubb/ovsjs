import {defineConfig} from 'vite'
import {fileURLToPath, URL} from "node:url";
import vitePluginOvs from "./src";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
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
                fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
