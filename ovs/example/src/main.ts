import { createApp, h } from 'vue'
import DefaultViews from "@/views/hello.ovs"

createApp({
  setup() {
    return () => DefaultViews  // DefaultViews 是 children 数组，需要包装成函数
  }
}).mount('#app')
