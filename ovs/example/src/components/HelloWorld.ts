import {h, ref} from 'vue'

// 用 IIFE 包裹，返回一个工厂函数
const createComponent = (function () {
    // 这里可以放一些共享的东西（如果需要）

    return function () {
        // 每次调用都创建新的状态 —— 独立！
        let a1 = ref(0)
        const timer = setInterval(() => {
            a1.value = a1.value + 1
        }, 1000)

        return {
            data() {
                return {
                    msg: 'hello'
                }
            },
            render() {
                return h('div', {
                    onClick() {
                        a1.value = 0
                    }
                }, [a1.value, this.msg])
            },
            unmounted() {
                clearInterval(timer)  // 清理定时器
            }
        }
    }
})()

// 使用方式
export default createComponent()  // 每次调用创建独立实例