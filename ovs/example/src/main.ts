import { createApp, h } from 'vue'
import DefaultViews from "@/views/hello.ovs"

createApp({
  setup() {
    return () => DefaultViews.toVnode()
  }
}).mount('#app')