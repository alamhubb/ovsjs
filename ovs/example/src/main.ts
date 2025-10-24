import { createApp } from 'vue'
import DefaultViews from "@/views/hello.ovs"

createApp({
  setup() {
    return () => DefaultViews.map(v => v.toVnode())
  }
}).mount('#app')
