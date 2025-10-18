import { createApp, h } from 'vue'
import DefaultViews from "@/views/hello.ovs"

const App = {
    render() {
        return h('div', {}, DefaultViews)
    }
}

const app = createApp(App)
app.mount('#app')
