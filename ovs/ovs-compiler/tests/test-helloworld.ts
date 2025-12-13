/**
 * 测试 HelloWorld.ovs 的内容（新语法）
 */
import OvsParser from '../src/parser/OvsParser.ts'

const code = `import { ref } from 'vue'

// 定义一个小组件，接收 count 并显示
view CountDisplay(props) {
  div(class = 'count-display') {
    span { 'Current count: ' }
    strong(style = 'color: #42b883; font-size: 24px;') { props.count }
  }
}

// 主视图
div(class = 'greetings', onClick() { count.value = 0 }) {

  h3 {
    "You've successfully created a project with "
    a(href = 'https://vite.dev/', target = '_blank', rel = 'noopener') { 'Vite' }
    ' + '
    a(href = 'https://vuejs.org/', target = '_blank', rel = 'noopener') { 'Vue 3' }
    ' + '
    a(href = 'https://github.com/alamhubb/ovsjs', target = '_blank', rel = 'noopener') { 'OVS' }
    '.'
  }

  const msg = "You did it!"
  let count = ref(0)

  h1(class = 'green') { msg }

  const countView = span { count }

  CountDisplay(count = countView)

  p(style = 'color: #888; font-size: 12px;') { '(Click anywhere to reset)' }
}
`

console.log('HelloWorld.ovs 解析测试（新语法）')
console.log('─'.repeat(60))

try {
  const parser = new OvsParser(code)
  const result = parser.Program()
  console.log('✅ 解析成功')
  console.log(`Tokens 数量: ${parser.parsedTokens.length}`)
} catch (error: any) {
  console.log('❌ 解析失败:', error.message)
}
