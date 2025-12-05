import { div, h1, h3, a } from '../utils/htmlElements';
import { ref } from 'vue';

export default (function(){
    let a1 = ref(0);
    const timer = setInterval(() => {
        a1.value = a1.value + 1;
    },1000);
    return div({},a1);
})();
