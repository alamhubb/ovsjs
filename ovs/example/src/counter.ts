import { ref } from 'vue'

// 创建响应式计数器
export const count = ref(0)

// 每秒自增
setInterval(() => {
  count.value++
  console.log('计数器：', count.value)
}, 1000)
