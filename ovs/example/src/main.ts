import { createApp } from 'vue'
import DefaultView from "@/views/hello.ovs"

createApp({
  setup() {
    // hello.ovs 导出的是单个 VNode
    return () => DefaultView.toVnode()
  }
}).mount('#app')
