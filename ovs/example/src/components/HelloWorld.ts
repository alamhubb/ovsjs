import {ref, h} from 'vue';

export default function HelloWorld() {
    const a1 = ref(0)
    setInterval(() => {
        a1.value++
    }, 1000)
    return () => h('div', {
        onClick() {
            a1.value = 0
        }
    }, [a1.value])
}