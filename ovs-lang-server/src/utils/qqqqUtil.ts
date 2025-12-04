export default class QqqqUtil {
    static log(str: any) {
        const error = new Error(str)
        const stack = error.stack.split('\n');  // 将堆栈按行分割
        const trace = stack.slice(2, 10);  // 获取第二行的调用信息（实际函数的调用位置）
        console.log(stack[0].trim());  // 打印一行的调用信息
        // console.log(trace.join('\n'));  // 打印一行的调用信息
    }

    static test(str: any) {
        console.log(String(str))
    }
}
