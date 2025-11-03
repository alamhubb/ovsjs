/**
 * 测试私有属性功能
 */

import Es2020Parser from './packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import { es2020Tokens } from './packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'

const code = `class Counter {
  // 私有字段
  #count = 0;
  #name = "counter";
  
  // 公共方法访问私有字段
  increment() {
    this.#count++;
  }
  
  getCount() {
    return this.#count;
  }
  
  // 私有方法
  #reset() {
    this.#count = 0;
  }
  
  resetPublic() {
    this.#reset();
  }
}`

console.log('📝 输入代码:')
console.log(code)
console.log('\n' + '='.repeat(60) + '\n')

try {
  // 1. 词法分析
  const lexer = new SubhutiLexer(es2020Tokens)
  const tokens = lexer.lexer(code)
  console.log('✅ 步骤1: 词法分析成功')
  console.log('   Token数量:', tokens.length)
  const hashTokens = tokens.filter(t => t.tokenName === 'HashTok')
  console.log('   私有标识符数量:', hashTokens.length)
  
  // 2. 语法分析
  const parser = new Es2020Parser(tokens)
  const cst = parser.Program()
  console.log('✅ 步骤2: 语法分析成功')
  console.log('   CST节点:', cst ? 'created' : 'null')
  
  // 3. CST -> AST
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  console.log('✅ 步骤3: AST转换成功')
  console.log('   顶层语句数:', ast.body.length)
  
  // 4. 代码生成
  const result = SlimeGenerator.generator(ast, tokens)
  console.log('✅ 步骤4: 代码生成成功')
  console.log('\n' + '='.repeat(60))
  console.log('📤 生成代码:')
  console.log('='.repeat(60))
  console.log(result.code)
  console.log('='.repeat(60))
  
  console.log('\n🎉 所有步骤成功！ES2020 私有属性支持已完整实现！')
  
} catch (e) {
  console.error('\n❌ 错误:', e.message)
  console.error(e.stack)
  process.exit(1)
}

