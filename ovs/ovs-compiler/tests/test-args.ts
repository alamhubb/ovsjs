/**
 * 测试带参数的情况
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  { name: '顶层 div({ }) { }', code: `div({ class: "x" }) { }` },
  { name: '顶层 div() { }', code: `div() { }` },
  { name: 'view 内 div() { }', code: `view A() { div() { } }` },
  { name: 'view 内 div({ }) { }', code: `view A() { div({ class: "x" }) { } }` },
  { name: '函数内 div({ }) { }', code: `function f() { div({ class: "x" }) { } }` },
]

console.log('参数测试')
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
