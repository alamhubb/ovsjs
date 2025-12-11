import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

// CssTs 配置：设置类名前缀
// 改为 'el-' 可生成 el-bg-primary, el-color-white 等
import { setPrefix } from './cssts'
setPrefix('el-')  // Element Plus 风格前缀

createApp(App).mount('#app')
