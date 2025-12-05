import {h} from 'vue'
import { ref } from 'vue';

export default {
    data() {
        return {
            msg: 'hello'
        }
    },
    render() {
        let a1 = ref(0)
        const timer = setInterval(() => {
            a1.value = a1.value+1
        }, 1000);
        return h('div', a1)
    }
}