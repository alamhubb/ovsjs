/**
 * 测试精确的 HelloWorld.ovs 开头
 */
import OvsParser from '../src/parser/OvsParser.ts'

// 精确复制 HelloWorld.ovs 的开头
const code = `import {  ref  } from 'vue';


// 定义一个小组件，接收 count 并显示
// view 是软关键字，可以在其他地方作为变量名使用
view CountDisplay(props) {
}`

console.log('精确测试')
console.log('─'.repeat(60))
console.log('代码:')
console.log(code)
console.log('─'.repeat(60))

try {
  const parser = new OvsParser(code)
  const result = parser.Program()
  console.log('✅ 解析成功')
  console.log(`Tokens: ${parser.parsedTokens.map(t => t.tokenName).join(', ')}`)
} catch (error: any) {
  console.log('❌ 解析失败:', error.message)
}
