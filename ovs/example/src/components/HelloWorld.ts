import {h, ref} from 'vue'

export default (function () {
    let a1 = ref(0);
    setInterval(() => {
        a1.value++
    }, 1000)
    return (function () {
        return h('div', a1.value);
    })();
})();
