/**
 * 客户端入口
 * 用于 hydration - 接管服务端渲染的 HTML
 */
import './assets/main.css'
import { createApp } from 'vue'
import App from './App'

// 客户端 hydration
const app = createApp(App)
app.mount('#app')

console.log('[OVS SSR] Client hydration complete')

