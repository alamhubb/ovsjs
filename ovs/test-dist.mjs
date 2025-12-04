/**
 * 测试编译后的 OVS 转换功能
 */
import { ovsTransform, vitePluginOvsTransform, ovsTransformBase } from './dist/index.mjs'

console.log('========================================')
console.log('测试 OVS 编译后的转换功能')
console.log('========================================\n')

// 先测试 ovsTransformBase
console.log('🔍 调试 ovsTransformBase...')
try {
  const baseResult = ovsTransformBase('const x = 1')
  console.log('baseResult.ast:', baseResult.ast ? 'exists' : 'null/undefined')
  console.log('baseResult.tokens.length:', baseResult.tokens?.length)
} catch(e) {
  console.log('ovsTransformBase error:', e.message)
  console.log(e.stack.split('\n').slice(0, 5).join('\n'))
}
console.log('')

// 测试用例 1：简单的 OVS 组件
const testCase1 = `div {
  h1 { "Hello World" }
  p { "This is a paragraph" }
}`

console.log('📝 测试用例 1：简单 OVS 组件')
console.log('输入代码:')
console.log(testCase1)
console.log('\n输出代码:')
try {
  const result1 = ovsTransform(testCase1)
  console.log(result1.code)
  console.log('✅ 测试通过\n')
} catch (e) {
  console.log('❌ 测试失败:', e.message)
}

// 测试用例 2：带属性的组件
const testCase2 = `div {
  button({ onClick: handleClick }) { "Click me" }
}`

console.log('----------------------------------------')
console.log('📝 测试用例 2：带属性的组件')
console.log('输入代码:')
console.log(testCase2)
console.log('\n输出代码:')
try {
  const result2 = ovsTransform(testCase2)
  console.log(result2.code)
  console.log('✅ 测试通过\n')
} catch (e) {
  console.log('❌ 测试失败:', e.message)
}

// 测试用例 3：嵌套组件
const testCase3 = `ul {
  li { "Item 1" }
  li { "Item 2" }
  li { "Item 3" }
}`

console.log('----------------------------------------')
console.log('📝 测试用例 3：嵌套组件')
console.log('输入代码:')
console.log(testCase3)
console.log('\n输出代码:')
try {
  const result3 = ovsTransform(testCase3)
  console.log(result3.code)
  console.log('✅ 测试通过\n')
} catch (e) {
  console.log('❌ 测试失败:', e.message)
}

// 测试用例 4：标准 JavaScript 代码（不含 OVS 语法）
const testCase4 = `const x = 1 + 2
function add(a, b) {
  return a + b
}
console.log(add(x, 3))`

console.log('----------------------------------------')
console.log('📝 测试用例 4：标准 JavaScript 代码')
console.log('输入代码:')
console.log(testCase4)
console.log('\n输出代码:')
try {
  const result4 = ovsTransform(testCase4)
  console.log(result4.code)
  console.log('✅ 测试通过\n')
} catch (e) {
  console.log('❌ 测试失败:', e.message)
}

// 测试用例 5：vitePlugin 转换（自动包裹 export default）
const testCase5 = `div {
  span { "Vite Plugin Test" }
}`

console.log('----------------------------------------')
console.log('📝 测试用例 5：vitePluginOvsTransform（自动 export default）')
console.log('输入代码:')
console.log(testCase5)
console.log('\n输出代码:')
try {
  const result5 = vitePluginOvsTransform(testCase5)
  console.log(result5.code)
  console.log('✅ 测试通过\n')
} catch (e) {
  console.log('❌ 测试失败:', e.message)
}

// 测试用例 6：let 作为标识符（之前的 bug 修复验证）
const testCase6 = `if (1) let
{}`

console.log('----------------------------------------')
console.log('📝 测试用例 6：let 作为标识符（验证 bug 修复）')
console.log('输入代码:')
console.log(JSON.stringify(testCase6))
console.log('\n输出代码:')
try {
  const result6 = ovsTransform(testCase6)
  console.log(result6.code)
  // 验证输出不包含括号
  if (result6.code.includes('let (')) {
    console.log('❌ 测试失败: let 被错误转换为函数调用')
  } else {
    console.log('✅ 测试通过\n')
  }
} catch (e) {
  console.log('❌ 测试失败:', e.message)
}

console.log('========================================')
console.log('所有测试完成！')
console.log('========================================')

