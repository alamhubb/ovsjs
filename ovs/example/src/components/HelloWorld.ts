import {ref, h, unref} from 'vue';

// 你想要的 IIFE 风格，但返回一个组件定义
export default (function () {
    const a1 = ref(0)

    setInterval(() => {
        a1.value++
    }, 1000)

    // 返回 Options 组件，Vue 负责响应式更新
    return {
        toVnode() {
            // 直接在 toVnode 里访问闭包中的 ref
            return h('div', {
                onClick() {
                    a1.value = 0
                }
            }, [a1.value])
        }
    }
})()

// return {
//     toVnode() {
//         // 直接在 toVnode 里访问闭包中的 ref
//         return h('div', { onClick: () => a1.value = 0 }, [unref(a1)])
//     }
// }