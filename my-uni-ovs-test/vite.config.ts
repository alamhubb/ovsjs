import {defineConfig} from "vite";
import {uniRender} from "vite-plugin-uni-render";
import {resolve} from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const uni = require("@dcloudio/vite-plugin-uni").default;
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uniRender(),
        uni()
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    server: {
        host: '192.168.1.7'
    }
});