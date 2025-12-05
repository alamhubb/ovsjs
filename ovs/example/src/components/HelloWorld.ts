import { ref, h, defineComponent } from 'vue'

export default defineComponent({
    setup() {
        const a1 = ref(0)

        setInterval(() => {
            a1.value++
        }, 1000)

        // setup 返回函数时，Vue 认为这是 render 函数
        return () => h('div', {
            onClick() { a1.value = 0 }
        }, [a1.value])
    }
})