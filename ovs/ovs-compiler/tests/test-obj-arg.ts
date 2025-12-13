/**
 * 测试对象参数
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  { name: 'OVS 语法: div(class = "x") { }', code: `div(class = "x") { }` },
  { name: '对象语法: div({ class: "x" }) { }', code: `div({ class: "x" }) { }` },
  { name: '空参数: div() { }', code: `div() { }` },
  { name: '无参数: div { }', code: `div { }` },
]

console.log('对象参数测试')
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
