import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

// 测试1：空类
const test1 = `class A {}`

// 测试2：只有方法，没有constructor
const test2 = `
class B {
  greet() {
    return "Hello"
  }
}
`.trim()

// 测试3：constructor但没有赋值语句
const test3 = `
class C {
  constructor(name) {
    return name
  }
}
`.trim()

// 测试4：constructor with简单赋值
const test4 = `
class D {
  constructor(name) {
    this.name = name
  }
}
`.trim()

function testCode(name: string, code: string) {
  console.log(`\n=== ${name} ===`)
  console.log('代码:', code)
  
  try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log('CST children:', cst.children?.length)
    
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    console.log('AST body:', ast.body?.length)
    
    const result = SlimeGenerator.generator(ast, tokens)
    console.log('生成:', result.code.replace(/\n/g, ' '))
    console.log('✅ 通过')
  } catch (error) {
    console.error('❌ 失败:', error instanceof Error ? error.message : error)
  }
}

testCode('测试1: 空类', test1)
testCode('测试2: 只有方法', test2)
testCode('测试3: constructor with return', test3)
testCode('测试4: constructor with 赋值', test4)




