/**
 * 客户端入口
 * 用于 hydration - 接管服务端渲染的 HTML
 */
import './assets/main.css'
import { createSSRApp } from 'vue'  // ← 使用 createSSRApp
import App from './App'

// 客户端 hydration
// createSSRApp 明确告诉 Vue：这是 SSR 应用，需要 Hydration
const app = createSSRApp(App)
app.mount('#app')  // Vue 会复用已有 DOM，而不是重新创建

console.log('[OVS SSR] Client hydration complete')

