import { div } from '../utils/htmlElements';
import { ref } from 'vue';
import { defineOvsComponent } from '../utils/ReactiveVNode';

export default defineOvsComponent((props) => {
    const a1 = ref(0)

    setInterval(() => {
        a1.value++
    }, 1000)

    return div({
        onClick: () => a1.value = 0
    }, a1)
})
