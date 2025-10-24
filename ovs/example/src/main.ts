import { createApp, h } from 'vue'
import DefaultViews from "@/views/hello.ovs"
import { toVnode } from './utils/ReactiveVNode'

createApp({
  setup() {
    return () => {
      // DefaultViews 是 ReactiveVNode 数组，需要转换成 VNode
      if (Array.isArray(DefaultViews)) {
        return DefaultViews.map(item => {
          // 如果是 ReactiveVNodeApi，调用 toVnode()
          if (item && typeof item === 'object' && 'toVnode' in item) {
            return item.toVnode()
          }
          return item
        })
      }
      return DefaultViews
    }
  }
}).mount('#app')
