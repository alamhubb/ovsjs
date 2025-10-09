// 使用命名导入（从 OVS 文件导入 hello）
import {hello} from "@/views/hello.ovs";

export const App = {
    components: {
    },
    render() {
        // hello 是一个 IIFE 表达式，直接返回 VNode
        return hello
    }
};
