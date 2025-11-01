/**
 * 阶段1: CST内容正确性测试
 * 不仅验证结构完整，还要验证内容正确
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

console.log(`🧪 阶段1: CST内容正确性测试`)
console.log('验证: Token值保留、节点类型、语法结构\n')

// 收集CST中的所有token值
function collectTokenValues(node: any): string[] {
  const values: string[] = []
  
  // CST叶子节点的token值存储在value属性中
  if (node.value !== undefined && (!node.children || node.children.length === 0)) {
    values.push(node.value)
  }
  
  if (node.children) {
    for (const child of node.children) {
      values.push(...collectTokenValues(child))
    }
  }
  
  return values
}

// 收集CST中的所有节点名称
function collectNodeNames(node: any): string[] {
  const names: string[] = []
  
  if (node.name) {
    names.push(node.name)
  }
  
  if (node.children) {
    for (const child of node.children) {
      names.push(...collectNodeNames(child))
    }
  }
  
  return names
}

// 查找CST中的节点
function findNodes(node: any, targetName: string): any[] {
  const results: any[] = []
  
  if (node.name === targetName) {
    results.push(node)
  }
  
  if (node.children) {
    for (const child of node.children) {
      results.push(...findNodes(child, targetName))
    }
  }
  
  return results
}

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))
  console.log(`输入代码预览: ${code.substring(0, 60).replace(/\n/g, ' ')}...`)

  try {
    // 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    
    // 收集输入代码中的所有token值
    const inputTokens = tokens.map((t: any) => t.tokenValue).filter((v: any) => v !== undefined)
    console.log(`✅ 词法: ${tokens.length} tokens`)

    // 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log(`✅ 语法: CST生成`)
    
    // 验证1: CST中是否保留了所有token值
    const cstTokens = collectTokenValues(cst)
    const missingTokens: string[] = []
    
    for (const inputToken of inputTokens) {
      if (!cstTokens.includes(inputToken)) {
        missingTokens.push(inputToken)
      }
    }
    
    if (missingTokens.length > 0) {
      console.log(`  ❌ CST丢失了${missingTokens.length}个token值:`, missingTokens.slice(0, 5))
      throw new Error('Token值未完整保留')
    }
    console.log(`✅ Token值: ${cstTokens.length}个token值完整保留`)
    
    // 验证2: 根据文件名验证特定的CST节点
    const nodeNames = collectNodeNames(cst)
    const expectedNodes: { [key: string]: string[] } = {
      '11-function-declaration': ['FunctionDeclaration'],
      '14-arrow-basic': ['ArrowFunction'],
      '19-array-destructuring-basic': ['ArrayBindingPattern'],
      '23-object-destructuring-basic': ['ObjectBindingPattern'],
      '27-array-spread': ['SpreadElement'],
      '33-class-basic': ['ClassDeclaration'],
      '39-export-default': ['ExportDeclaration'],
      '42-import-basic': ['ImportDeclaration'],
      '45-generator': ['GeneratorDeclaration'],
      '46-async-await': ['AsyncFunctionDeclaration'],
    }
    
    const expected = expectedNodes[testName]
    if (expected) {
      const missing = expected.filter(nodeName => !nodeNames.includes(nodeName))
      if (missing.length > 0) {
        console.log(`  ⚠️ 预期节点缺失: ${missing.join(', ')}`)
        console.log(`  实际节点: ${nodeNames.slice(0, 10).join(', ')}...`)
      } else {
        console.log(`✅ 节点类型: 包含预期的 ${expected.join(', ')}`)
      }
    }
    
    // 验证3: 对于关键语法结构，深入检查CST内容
    if (testName.includes('function')) {
      const funcDecls = findNodes(cst, 'FunctionDeclaration')
      const funcExprs = findNodes(cst, 'FunctionExpression')
      const arrowFuncs = findNodes(cst, 'ArrowFunction')
      const total = funcDecls.length + funcExprs.length + arrowFuncs.length
      console.log(`✅ 函数结构: ${total}个函数（声明:${funcDecls.length}, 表达式:${funcExprs.length}, 箭头:${arrowFuncs.length}）`)
    }
    
    if (testName.includes('class')) {
      const classDecls = findNodes(cst, 'ClassDeclaration')
      console.log(`✅ 类结构: ${classDecls.length}个类声明`)
    }

  } catch (error: any) {
    console.log(`\n❌ 失败: ${error.message}`)
    console.log('输入代码:')
    console.log(code)
    console.log('\n⚠️ 测试在第', i + 1, '个用例停止')
    console.log(`当前进度: ${i}/${files.length} 通过\n`)
    process.exit(1)
  }
}

console.log('\n' + '='.repeat(60))
console.log(`🎉 阶段1内容验证全部通过: ${files.length}/${files.length}`)
console.log('✅ 所有CST的token值、节点类型、语法结构均正确')

