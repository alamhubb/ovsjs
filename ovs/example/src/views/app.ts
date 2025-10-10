// Test: No default export in hello.ovs
// All expressions wrapped in IIFE, returned as array
import DefaultViews from "@/views/hello.ovs";

export const App = {
    render() {
        // DefaultViews is an array containing all views
        return DefaultViews
    }
};
