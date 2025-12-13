/**
 * 测试嵌套组件调用
 */
import { vitePluginOvsTransform } from '../src/index.ts'

const testCases = [
  {
    name: '顶层组件调用',
    code: `CountDisplay(count = 1) { }`,
  },
  {
    name: 'div 内组件调用（无参数）',
    code: `div { CountDisplay { } }`,
  },
  {
    name: 'div 内组件调用（有参数）',
    code: `div { CountDisplay(count = 1) { } }`,
  },
]

console.log('嵌套组件测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  console.log(`输入: ${test.code}`)
  try {
    const result = vitePluginOvsTransform(test.code)
    console.log(`输出: ${result.code}`)
  } catch (error: any) {
    console.log(`错误: ${error.message}`)
  }
}
