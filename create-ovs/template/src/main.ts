import { createApp } from 'vue'
import HelloOvs from '@/views/hello.ovs'

createApp({
  setup() {
    return () => HelloOvs.toVnode()
  }
}).mount('#app')

