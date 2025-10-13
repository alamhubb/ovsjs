import { createApp, h } from 'vue'
import './style.css'
import DefaultViews from "@/views/hello.ovs"

const App = {
    render() {
        return h('div', {}, DefaultViews)
    }
}

const app = createApp(App)
app.mount('#app')
