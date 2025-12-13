/**
 * 测试只有 view 的情况
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  {
    name: 'view A() { }',
    code: `view A() { }`,
  },
  {
    name: 'view A() { } (带换行)',
    code: `view A() { }
`,
  },
  {
    name: 'view 带内容',
    code: `view CountDisplay(props) {
  div({  class:  'count-display'  }) {
    span { 'Current count: ' }
  }
}`,
  },
  {
    name: 'view 带内容 (带换行)',
    code: `view CountDisplay(props) {
  div({  class:  'count-display'  }) {
    span { 'Current count: ' }
  }
}
`,
  },
]

console.log('view only 测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  console.log(`代码长度: ${test.code.length}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
