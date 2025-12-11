/**
 * 测试 Button 组件的语法
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  // 测试 OVS 参数语法 - 使用 = 
  {
    name: 'OVS 参数 - 使用 =',
    code: 'button(class = "btn") { }',
  },
  // 测试 OVS 参数语法 - 使用 :
  {
    name: 'OVS 参数 - 使用 :',
    code: 'button({ class: "btn" }) { }',
  },
  // 测试 view 内部的 const
  {
    name: 'view 内部 const',
    code: `view A(props) {
  const x = 1
  div { }
}`,
  },
  // 测试 view 内部的 computed
  {
    name: 'view 内部 computed',
    code: `view A(props) {
  const x = computed(() => 1)
  div { }
}`,
  },
  // 测试 view 内部的 if
  {
    name: 'view 内部 if',
    code: `view A(props) {
  if (props.loading) {
    span { }
  }
  div { }
}`,
  },
  // 测试完整的 Button 组件
  {
    name: 'Button 组件简化版',
    code: `import { computed } from 'vue'

view Button(props) {
  const buttonClasses = computed(() => {
    return props.type
  })

  button({
    class: buttonClasses.value,
    disabled: props.disabled,
  }) {
    if (props.loading) {
      span({ class: 'loading' }) { '⟳' }
    }
    
    span({}) {
      props.children
    }
  }
}

export default Button`,
  },
]

console.log('Button 语法解析测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  console.log(`代码:\n${test.code}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
