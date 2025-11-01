/**
 * 测试：OVS 作为 JavaScript 超集，应该支持纯 JS 代码
 */
import {ovsTransform} from "./src/index.ts"

console.log('='.repeat(80))
console.log('测试1：简单的函数调用')
console.log('='.repeat(80))

const test1 = `createComponentVNode(div, {}, [])`
console.log('输入:', test1)
const result1 = ovsTransform(test1)
console.log('输出:', result1.code)
console.log('预期:', test1)
console.log('结果:', result1.code === test1 + ';' ? '✅ 通过' : '❌ 失败')

console.log('\n' + '='.repeat(80))
console.log('测试2：嵌套的函数调用')
console.log('='.repeat(80))

const test2 = `createComponentVNode(div, {}, [createComponentVNode(p, {}, ['hello'])])`
console.log('输入:', test2)
const result2 = ovsTransform(test2)
console.log('输出:', result2.code)
console.log('结果:', result2.code.includes('createComponentVNode') ? '✅ 包含函数名' : '❌ 函数名丢失')

console.log('\n' + '='.repeat(80))
console.log('测试3：带 spread 运算符 (...)')
console.log('='.repeat(80))

const test3 = `createComponentVNode(div, {}, [createComponentVNode(...args)])`
console.log('输入:', test3)
try {
  const result3 = ovsTransform(test3)
  console.log('输出:', result3.code)
  console.log('结果:', result3.code.includes('...') ? '✅ spread 保留' : '❌ spread 丢失')
} catch (error) {
  console.log('❌ 编译错误:', error.message)
}

console.log('\n' + '='.repeat(80))
console.log('测试4：你的原始代码（简化版，去掉 ...）')
console.log('='.repeat(80))

const test4 = `createComponentVNode(div, {}, [createComponentVNode(p)])`
console.log('输入:', test4)
const result4 = ovsTransform(test4)
console.log('输出:', result4.code)
console.log('结果:', result4.code.length > 30 ? '✅ 内容完整' : '❌ 内容丢失')

console.log('\n' + '='.repeat(80))
console.log('测试5：纯 JavaScript 代码（变量、函数、控制流）')
console.log('='.repeat(80))

const test5 = `
const a = 1
const b = 2
function add(x, y) {
  return x + y
}
const result = add(a, b)
`
console.log('输入:', test5)
const result5 = ovsTransform(test5)
console.log('输出:', result5.code)
console.log('结果:', result5.code.includes('function add') ? '✅ JS 代码正常' : '❌ JS 代码异常')

console.log('\n' + '='.repeat(80))
console.log('总结')
console.log('='.repeat(80))
console.log('OVS 作为 JavaScript 超集，应该：')
console.log('1. ✅ 完整支持所有 JavaScript 语法')
console.log('2. ✅ 原样输出纯 JavaScript 代码（不修改）')
console.log('3. ✅ 在 JavaScript 基础上扩展 OVS 语法（div {}）')






















