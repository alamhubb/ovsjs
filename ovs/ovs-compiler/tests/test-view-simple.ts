/**
 * 简单测试 view 声明
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  // 最简单的 view 声明
  {
    name: 'view 声明 - 最简单',
    code: 'view A() { }',
  },
  // view 声明带内容
  {
    name: 'view 声明 - 带 div',
    code: 'view A() { div { } }',
  },
  // 带 import 的 view 声明
  {
    name: 'view 声明 - 带 import',
    code: `import { ref } from 'vue'
view A() { }`,
  },
  // 带 export 的 view 声明
  {
    name: 'view 声明 - 带 export',
    code: `view A() { }
export default A`,
  },
]

console.log('view 声明解析测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  console.log(`代码:\n${test.code}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
    console.log(`   Tokens: ${parser.parsedTokens.map(t => t.tokenName).join(', ')}`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
