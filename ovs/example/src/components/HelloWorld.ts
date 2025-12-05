import {h, ref, defineComponent} from 'vue'

export default defineComponent((props) => {
    const a1 = ref(0)

    // 定时器只创建一次
    setInterval(() => {
        a1.value++
    }, 1000)
    return () => {
        // 这里只读，不改！
        // 而且不能写 a1.value++，只能显示 a1.value
        return h('div', {onClick: () => a1.value = 0}, [a1.value])
    }
})