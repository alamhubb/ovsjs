/**
 * 测试作用域问题
 */
import { vitePluginOvsTransform } from '../src/index.ts'

const code = `view CountDisplay(props) {
  div { props.count }
}

div {
  CountDisplay(count = 1) { }
}
`

console.log('作用域测试')
console.log('─'.repeat(60))
console.log('输入:')
console.log(code)
console.log('─'.repeat(60))

const result = vitePluginOvsTransform(code)
console.log('输出:')
console.log(result.code)
