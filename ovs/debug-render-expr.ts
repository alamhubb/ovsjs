// 调试 #{ } 语法的CST结构
import fs from 'fs'
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import OvsParser from './src/parser/OvsParser.ts'
import OvsTokenConsumer, { ovs6Tokens } from './src/parser/OvsConsumer.ts'

const code = `
div {
  #{ "hello" }
}
`

console.log('📄 测试代码：')
console.log(code)
console.log('\n🔍 词法分析（Tokens）：')

// 1. 词法分析
const lexer = new SubhutiLexer(code, ovs6Tokens)
const tokens = lexer.getAllTokens()

console.log(tokens.map(t => `${t.name} -> "${t.image}"`).join('\n'))

console.log('\n🌲 语法分析（CST）：')

// 2. 语法分析
const parser = new OvsParser()
const tokenConsumer = new OvsTokenConsumer(tokens)
parser.tokenConsumer = tokenConsumer
parser.input = tokens

const cst = parser.Program()

console.log('\n📊 CST结构（递归打印）：')

function printCst(cst: any, indent = 0) {
  const prefix = '  '.repeat(indent)
  console.log(`${prefix}${cst.name}`)
  
  if (cst.tokenType) {
    console.log(`${prefix}  [Token: "${cst.image}"]`)
  }
  
  if (cst.children && cst.children.length > 0) {
    for (const child of cst.children) {
      printCst(child, indent + 1)
    }
  }
}

printCst(cst)

// 保存完整CST到文件
fs.writeFileSync('ovs/debug-cst.json', JSON.stringify(cst, null, 2))
console.log('\n✅ 完整CST已保存到 ovs/debug-cst.json')

