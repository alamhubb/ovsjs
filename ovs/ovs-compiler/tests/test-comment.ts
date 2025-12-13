/**
 * 测试注释
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  {
    name: 'import + 空行 + view',
    code: `import { ref } from 'vue';

view A() { }`,
  },
  {
    name: 'import + 多空行 + view',
    code: `import { ref } from 'vue';


view A() { }`,
  },
  {
    name: 'import + 单行注释 + view',
    code: `import { ref } from 'vue';
// 这是注释
view A() { }`,
  },
  {
    name: 'import + 空行 + 单行注释 + view',
    code: `import { ref } from 'vue';

// 这是注释
view A() { }`,
  },
]

console.log('注释测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  console.log(`代码:\n${test.code}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
