import { ref } from 'vue';
import { defineOvsComponent, $OvsHtmlTag } from 'ovsjs';

export default defineOvsComponent((props) => {
    const count = ref(0)

    setInterval(() => {
        count.value++
    }, 1000)

    return $OvsHtmlTag.div({
        onClick: () => count.value = 0
    }, count)
})
