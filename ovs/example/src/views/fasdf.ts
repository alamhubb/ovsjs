import { h, ref, computed } from 'vue'

const count = ref(0)

setInterval(() => {
    count.value++
    console.log('计数器：', count.value)
}, 1000)

const colors = ['red','green','blue','orange','purple']
const colorIndex = ref(0)

// 使用 computed 计算当前样式
const style = computed(() => ({ color: colors[colorIndex.value] }))

// 每秒切换颜色
setInterval(() => {
    colorIndex.value = (colorIndex.value + 1) % colors.length
}, 1000)

div({style: style}) {
    p { 'Hello, OVS!' }
    p { count }
    p { '颜色变化演示' }
}