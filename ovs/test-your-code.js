/**
 * 测试用户的原始代码
 */
import {ovsTransform} from "./src/index.ts"

console.log('='.repeat(80))
console.log('测试：你的原始代码')
console.log('='.repeat(80))

// 你的原始代码
const code = `createComponentVNode(div,{},[createComponentVNode(...)])
`

console.log('输入代码:')
console.log(code)
console.log('\n问题分析：')
console.log('注意：createComponentVNode(...) 中的 ... 是不完整的 spread 语法')
console.log('正确的 spread 语法：...args（需要变量名）')
console.log('错误的语法：...（只有三个点，没有变量名）')

try {
  const result = ovsTransform(code)
  console.log('\n输出代码:')
  console.log(result.code)
  
  if (result.code.includes('createComponentVNode')) {
    console.log('\n✅ 函数名存在')
  } else {
    console.log('\n❌ 函数名丢失')
  }
  
  if (result.code.length < 30) {
    console.log('❌ 内容严重丢失！')
  }
} catch (error) {
  console.log('\n❌ 编译错误:', error.message)
}

console.log('\n' + '='.repeat(80))
console.log('对比：正确的 spread 语法')
console.log('='.repeat(80))

const correctCode1 = `createComponentVNode(div,{},[createComponentVNode(...args)])`
console.log('测试1 - spread 变量:')
console.log('输入:', correctCode1)
const result1 = ovsTransform(correctCode1)
console.log('输出:', result1.code)
console.log('✅ 正常编译\n')

const correctCode2 = `createComponentVNode(div,{},[createComponentVNode(p, {}, ['hello'])])`
console.log('测试2 - 完整参数:')
console.log('输入:', correctCode2)
const result2 = ovsTransform(correctCode2)
console.log('输出:', result2.code)
console.log('✅ 正常编译\n')

console.log('='.repeat(80))
console.log('结论')
console.log('='.repeat(80))
console.log('问题：createComponentVNode(...) 中的 ... 是非法语法')
console.log('原因：JavaScript 的 spread 运算符必须后跟变量名')
console.log('\n解决方案：')
console.log('1. 使用完整的 spread：createComponentVNode(...args)')
console.log('2. 使用具体的参数：createComponentVNode(p, {}, [])')
console.log('3. 如果是测试代码，使用 OVS 语法：div { p { } }')












