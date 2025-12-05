import {h} from 'vue'
import {ref} from 'vue';

let a1 = ref(0)
const timer = setInterval(() => {
    a1.value = a1.value + 1
}, 1000);

export default {
    data() {
        return {
            msg: 'hello'
        }
    },
    render() {
        return h('div', [a1.value, this.msg])
    }
}