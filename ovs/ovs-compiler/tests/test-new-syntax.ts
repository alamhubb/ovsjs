/**
 * 测试新语法 OvsArguments: div(class = 'x') { }
 */
import OvsParser from '../src/parser/OvsParser.ts'
import { vitePluginOvsTransform } from '../src/index.ts'

const testCases = [
  { name: '简单 div', code: `div { }` },
  { name: 'div 带单个属性', code: `div(class = 'x') { }` },
  { name: 'div 带多个属性', code: `div(class = 'x', id = 'y') { }` },
  { name: 'div 带方法', code: `div(onClick() { console.log('clicked') }) { }` },
  { name: 'div 带简写属性', code: `const disabled = true; div(disabled) { }` },
  { name: 'div 带展开属性', code: `const props = {}; div(...props) { }` },
  { name: 'view 声明带参数', code: `view Card(props) { div(class = 'card') { props.title } }` },
  { name: '组件调用', code: `div { Card(title = 'Hello') { } }` },
]

console.log('新语法测试 (OvsArguments)')
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

// 测试完整转换
console.log('\n\n完整转换测试')
console.log('─'.repeat(60))

const fullCode = `
import { ref } from 'vue'

view CountDisplay(props) {
  div(class = 'count-display') {
    span { 'Current count: ' }
    strong(style = 'color: #42b883') { props.count }
  }
}

div(class = 'app') {
  h1 { 'Hello OVS!' }
  CountDisplay(count = 42) { }
}
`

console.log('输入代码:')
console.log(fullCode)

try {
  const result = vitePluginOvsTransform(fullCode, 'test.ovs')
  console.log('\n✅ 转换成功')
  console.log('生成代码:')
  console.log(result?.code)
} catch (error: any) {
  console.log(`\n❌ 转换失败: ${error.message}`)
}
