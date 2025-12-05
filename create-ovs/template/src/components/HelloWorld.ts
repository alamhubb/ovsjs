import {div, h1, h3, a} from '../utils/htmlElements';
import {defineComponent, ref} from 'vue';

export default defineComponent((props) => {
    const a1 = ref(0)

    // 定时器只创建一次
    setInterval(() => {
        a1.value++
    }, 1000)
    return div({}, a1.value);
})
