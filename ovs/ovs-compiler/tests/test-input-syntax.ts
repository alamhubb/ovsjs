/**
 * 测试 Input 组件的语法
 */
import OvsParser from '../src/parser/OvsParser.ts'

// 简化版 Input 组件测试
const inputCode = `
import { computed, onMounted } from 'vue'

view Input(props) {
  const emit = (event, ...args) => {
    const handler = props[\`on\${event.charAt(0).toUpperCase()}\${event.slice(1)}\`]
    if (handler) handler(...args)
  }

  const inputType = computed(() => {
    return props.type || 'text'
  })

  if (props.type === 'textarea') {
    div(class = 'cu-textarea') {
      textarea(
        class = 'cu-textarea__inner',
        disabled = props.disabled,
        placeholder = props.placeholder
      ) {}
    }
  } else {
    div(class = 'cu-input') {
      input(
        class = 'cu-input__inner',
        type = inputType.value,
        disabled = props.disabled,
        placeholder = props.placeholder
      ) {}
    }
  }
}

export default Input
`

console.log('测试简化版 Input 组件:')
console.log(inputCode)
console.log('\n---')

try {
  const parser = new OvsParser(inputCode)
  const result = parser.Program()
  console.log('✅ 解析成功')
  console.log(`Tokens 数量: ${parser.parsedTokens.length}`)
} catch (error: any) {
  console.log(`❌ 解析失败: ${error.message}`)
}
