import OvsParser from '../src/parser/OvsParser.ts'

const tests = [
  // 基础测试
  { name: '空视图', code: 'const x = div { }' },
  { name: '单个子视图', code: 'const x = div { div{"hello"} }' },
  { name: '两个子视图', code: 'const x = div { div{"a"} div{"b"} }' },
  { name: '用分号分隔', code: 'const x = div { div{"a"}; div{"b"} }' },

  // 用户的实际代码
  { name: '用户代码', code: `const div123 = div { div{'woshidiv:'} div{count} }` },
]

for (const test of tests) {
  console.log(`\n测试: ${test.name}`)
  console.log(`代码: ${test.code}`)
  try {
    const parser = new OvsParser(test.code)
    parser.Program()
    console.log('✅ 解析成功!')
  } catch (e: any) {
    console.log('❌ 解析失败:', e.message)
  }
}

