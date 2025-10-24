import { createApp, h } from 'vue'
import DefaultViews from "@/views/hello.ovs"

createApp({
  setup() {
    // return () => DefaultViews.map(v => v.toVnode())
    return () => DefaultViews.toVnode()
  }
}).mount('#app')