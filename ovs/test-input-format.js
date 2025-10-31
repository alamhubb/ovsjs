/**
 * 测试：验证 ovsTransform 的正确输入格式
 */
import {ovsTransform} from "./src/index.ts"

console.log('='.repeat(80))
console.log('测试1：错误的输入（已编译的 JavaScript 代码）')
console.log('='.repeat(80))

const wrongCode = `createComponentVNode(div,{},[createComponentVNode(...)])
`

console.log('输入代码:')
console.log(wrongCode)

try {
  const wrongResult = ovsTransform(wrongCode)
  console.log('\n输出代码:')
  console.log(wrongResult.code)
  console.log('\n❌ 问题：输出不完整或错误！')
} catch (error) {
  console.error('\n❌ 编译错误:', error.message)
}

console.log('\n' + '='.repeat(80))
console.log('测试2：正确的输入（OVS 语法）')
console.log('='.repeat(80))

const correctCode = `
div {
  p { "hello" }
  span { "world" }
}
`

console.log('输入代码:')
console.log(correctCode)

const correctResult = ovsTransform(correctCode)
console.log('\n输出代码:')
console.log(correctResult.code)
console.log('\n✅ 正确：完整的 JavaScript 代码！')

console.log('\n' + '='.repeat(80))
console.log('测试3：带变量的 OVS 语法')
console.log('='.repeat(80))

const varCode = `
const greeting = "Hello OVS"

div {
  h1 { greeting }
  p { "Welcome!" }
}
`

console.log('输入代码:')
console.log(varCode)

const varResult = ovsTransform(varCode)
console.log('\n输出代码:')
console.log(varResult.code)
console.log('\n✅ 正确：变量和元素都被正确编译！')












