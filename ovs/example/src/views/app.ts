// Test: No default export in hello.ovs
// All expressions wrapped in IIFE, returned as array
import DefaultViews from "@/views/hello.ovs";
import { h } from 'vue';

export const App = {
    render() {
        // DefaultViews is an array containing all views
        // Wrap in a div to return a single VNode
        return h('div', {}, DefaultViews)
    }
};
