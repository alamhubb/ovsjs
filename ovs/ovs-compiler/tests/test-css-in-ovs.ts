/**
 * 测试 OvsParser 继承 CssTsParser 后的 css 语法支持
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  // CssTs 语法测试
  {
    name: 'CssTs - 原子样式声明',
    code: 'css colorRed',
    shouldPass: true
  },
  {
    name: 'CssTs - 组合样式声明',
    code: 'css buttonBase = { colorRed, fontBold }',
    shouldPass: true
  },
  {
    name: 'CssTs - 多个样式声明',
    code: `css colorRed
css fontBold
css buttonBase = { colorRed, fontBold }`,
    shouldPass: true
  },
  // OVS + CssTs 混合语法测试
  {
    name: 'OVS + CssTs - 在 view 中使用 css',
    code: `css colorRed
css buttonStyle = { colorRed }

view Button(props) {
  button(class = buttonStyle) {
    props.children
  }
}`,
    shouldPass: true
  },
  {
    name: 'OVS + CssTs - 在函数中声明 css',
    code: `function setup() {
  css localStyle = { colorRed }
  return localStyle
}`,
    shouldPass: true
  },
  // OVS 视图语法测试
  {
    name: 'OVS - 简单视图',
    code: 'div { }',
    shouldPass: true
  },
  {
    name: 'OVS - 带 props 的视图',
    code: 'div(class = "container") { }',
    shouldPass: true
  },
  {
    name: 'OVS - view 声明',
    code: `view Card(props) {
  div(class = "card") {
    props.title
  }
}`,
    shouldPass: true
  },
  // 综合测试
  {
    name: '综合 - 完整组件示例',
    code: `import { ref } from 'vue'

css colorPrimary
css bgWhite
css buttonBase = { colorPrimary, bgWhite }

view Button(props) {
  const count = ref(0)
  
  button(class = buttonBase, onClick = () => count.value++) {
    props.label
  }
}

export default Button`,
    shouldPass: true
  }
]

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' OvsParser + CssTsParser 集成测试'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')
console.log()

let passed = 0
let failed = 0

for (const testCase of testCases) {
  try {
    const parser = new OvsParser(testCase.code)
    const result = parser.Program()
    
    if (testCase.shouldPass) {
      console.log(`✅ ${testCase.name}`)
      passed++
    } else {
      console.log(`❌ ${testCase.name} - 应该失败但成功了`)
      failed++
    }
  } catch (error: any) {
    if (!testCase.shouldPass) {
      console.log(`✅ ${testCase.name} - 预期失败`)
      passed++
    } else {
      console.log(`❌ ${testCase.name} - 解析失败`)
      console.log(`   错误: ${error.message}`)
      failed++
    }
  }
}

console.log()
console.log('─'.repeat(80))
console.log(`结果: ${passed} 通过, ${failed} 失败`)
