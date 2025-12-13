/**
 * 缩小范围
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  { name: 'view A() { }', code: `view A() { }` },
  { name: 'view A(props) { }', code: `view A(props) { }` },
  { name: 'view A() { div { } }', code: `view A() { div { } }` },
  { name: 'view A(props) { div { } }', code: `view A(props) { div { } }` },
  { name: 'view A() { div({ class: "x" }) { } }', code: `view A() { div({ class: "x" }) { } }` },
]

console.log('缩小范围测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
