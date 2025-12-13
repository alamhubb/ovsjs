/**
 * 逐步调试 HelloWorld.ovs
 */
import OvsParser from '../src/parser/OvsParser.ts'

const testCases = [
  {
    name: '只有 view 声明',
    code: `view CountDisplay(props) {
  div({  class:  'count-display'  }) {
    span { 'Current count: ' }
  }
}`,
  },
  {
    name: 'view 声明 + 顶层 div',
    code: `view CountDisplay(props) {
}

div {
}`,
  },
  {
    name: 'import + view',
    code: `import {  ref  } from 'vue';

view CountDisplay(props) {
}`,
  },
  {
    name: 'import + view + div',
    code: `import {  ref  } from 'vue';

view CountDisplay(props) {
}

div {
}`,
  },
]

console.log('调试测试')
console.log('─'.repeat(60))

for (const test of testCases) {
  console.log(`\n测试: ${test.name}`)
  try {
    const parser = new OvsParser(test.code)
    const result = parser.Program()
    console.log(`✅ 解析成功`)
  } catch (error: any) {
    console.log(`❌ 解析失败: ${error.message}`)
  }
}
