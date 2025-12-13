/**
 * 测试旧语法（对象参数）
 */
import { vitePluginOvsTransform } from '../src/index.ts'

const code = `import { ref } from 'vue'

view CountDisplay(props) {
  div({ class: 'count-display' }) {
    span { 'Current count: ' }
    strong({ style: 'color: #42b883;' }) { props.count }
  }
}

div({ class: 'greetings' }) {
  h1 { 'Hello' }
  CountDisplay({ count: 1 })
}
`

console.log('旧语法测试')
console.log('─'.repeat(60))
console.log('输入:')
console.log(code)
console.log('─'.repeat(60))

try {
  const result = vitePluginOvsTransform(code)
  console.log('✅ 转换成功')
  console.log('输出:')
  console.log(result.code)
} catch (e: any) {
  console.log('❌ 转换失败:', e.message)
}
