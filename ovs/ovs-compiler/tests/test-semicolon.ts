/**
 * 测试带分号的 import
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  {
    name: 'import 无分号',
    code: `import { ref } from 'vue'
view A() { }`,
  },
  {
    name: 'import 有分号',
    code: `import { ref } from 'vue';
view A() { }`,
  },
  {
    name: '只有 import 有分号',
    code: `import { ref } from 'vue';`,
  },
]

console.log('分号测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  console.log(`代码: ${test.code}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
