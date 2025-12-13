/**
 * 对比新旧语法生成的代码
 */
import { vitePluginOvsTransform } from '../src/index.ts'

// 旧语法（对象参数）- 这个现在解析会失败
const oldSyntax = `div({ class: 'container' }) {
  'hello'
}`

// 新语法（OvsArguments）
const newSyntax = `div(class = 'container') {
  'hello'
}`

console.log('语法对比测试')
console.log('─'.repeat(60))

console.log('\n旧语法（对象参数）:')
console.log(oldSyntax)
try {
  const result = vitePluginOvsTransform(oldSyntax)
  console.log('输出:', result.code)
} catch (e: any) {
  console.log('错误:', e.message)
}

console.log('\n新语法（OvsArguments）:')
console.log(newSyntax)
try {
  const result = vitePluginOvsTransform(newSyntax)
  console.log('输出:', result.code)
} catch (e: any) {
  console.log('错误:', e.message)
}
