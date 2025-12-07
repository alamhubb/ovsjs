/**
 * 服务端入口
 * 用于 SSR - 将 Vue 组件渲染为 HTML 字符串
 */
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App'

export async function render() {
    const app = createSSRApp(App)
    const html = await renderToString(app)
    return { html }
}

