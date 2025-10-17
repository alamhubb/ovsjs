// 分析链式调用的CST结构
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `obj.a.b.c`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

// 递归打印CST结构（只显示name，不显示完整内容）
function printCst(node: any, depth = 0) {
  const indent = '  '.repeat(depth)
  const name = node.name || node.type || node.value || '?'
  console.log(`${indent}${name} (${node.children?.length || 0})`)
  if (node.children && depth < 20) {
    node.children.forEach((child: any) => printCst(child, depth + 1))
  }
}

console.log('CST结构:')
printCst(cst)

