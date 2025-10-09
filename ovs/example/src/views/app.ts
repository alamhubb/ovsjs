// 使用默认导入（OVS 文件导出的是 default）
import Hello from "@/views/hello.ovs";

export const App = {
    components: {
        Hello
    },
    render() {
        // Hello 是一个函数组件，直接调用返回 VNode
        return Hello()
    }
};
