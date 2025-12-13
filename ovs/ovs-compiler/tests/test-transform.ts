/**
 * 测试转换结果
 */
import { vitePluginOvsTransform } from '../src/index.ts'

const code = `import { ref } from 'vue'

view CountDisplay(props) {
  div(class = 'count-display') {
    span { 'Current count: ' }
  }
}

div {
  CountDisplay(count = 1) { }
}
`

console.log('转换测试')
console.log('─'.repeat(60))
console.log('输入代码:')
console.log(code)
console.log('─'.repeat(60))

try {
  const result = vitePluginOvsTransform(code)
  console.log('✅ 转换成功')
  console.log('生成代码:')
  console.log(result.code)
} catch (error: any) {
  console.log('❌ 转换失败:', error.message)
}
