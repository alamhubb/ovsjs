/**
 * 调试转换结果
 */
import { vitePluginOvsTransform } from '../src/index.ts'

const testCases = [
  {
    name: 'HTML 标签带参数',
    code: `div(class = 'test') { 'hello' }`,
  },
  {
    name: '组件调用带参数',
    code: `MyComponent(count = 1) { }`,
  },
  {
    name: 'view 内组件调用',
    code: `view A() {
  MyComponent(count = 1) { }
}`,
  },
]

console.log('转换调试')
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
