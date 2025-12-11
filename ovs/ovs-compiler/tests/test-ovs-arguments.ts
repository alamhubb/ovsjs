import { vitePluginOvsTransform } from '../src/index'

// 测试新的 OVS 参数语法

const testCases = [
    // 基础：空参数
    'div() { "hello" }',
    
    // 单个属性
    'div(id = "main") { "hello" }',
    
    // 多个属性
    'div(id = "main", class = "container") { "hello" }',
    
    // class 使用对象简写 - 特殊处理
    'div(class = { colorRed, fontBold }) { "hello" }',
    
    // 方法简写
    'div(onClick() { console.log("clicked") }) { "hello" }',
    
    // 展开操作符
    'div(...props) { "hello" }',
    
    // 混合使用所有特性
    'div(id = "app", class = { primary, active }, onClick() { handleClick() }, ...rest) { "content" }',
    
    // 带参数的方法
    'button(onMouseEnter(e) { console.log(e.target) }) { "hover me" }',
    
    // 嵌套元素
    `div(class = { container }) {
      h1(class = { title }) { "Hello" }
      p(id = "desc") { "World" }
    }`,
    
    // 简写属性（布尔属性）
    'input(disabled, readonly) {}',
]

console.log('=== 测试 OVS 参数语法转换 ===\n')

for (const code of testCases) {
    console.log(`输入: ${code}`)
    try {
        const result = vitePluginOvsTransform(code)
        console.log(`输出: ${result.code}`)
        console.log(`结果: ✅ 转换成功`)
    } catch (e: any) {
        console.log(`结果: ❌ 转换失败 - ${e.message}`)
        console.log(e.stack)
    }
    console.log('')
}
