import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

// 注入 CssTs 主题样式
import { injectTheme } from 'cssts-theme-element'
injectTheme()

createApp(App).mount('#app')
