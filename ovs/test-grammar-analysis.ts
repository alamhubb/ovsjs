#!/usr/bin/env tsx
/**
 * 🔍 OVS 语法层面的映射分析
 * 
 * 目标：从语法角度分析每个阶段的转换
 */

import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import { ovs6Tokens } from './src/parser/OvsConsumer.ts'
import OvsTokenConsumer from './src/parser/OvsConsumer.ts'
import OvsParser from './src/parser/OvsParser.ts'
import OvsCstToSlimeAstUtil from './src/factory/OvsCstToSlimeAstUtil.ts'
import SlimeGenerator from '../slime/packages/slime-generator/src/SlimeGenerator.ts'
import JsonUtil from 'subhuti/src/utils/JsonUtil.ts'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 分析简单的 OVS 代码
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const source = `const name = "Alice"
div { name }`

log('blue', '\n' + '='.repeat(70))
log('blue', '🔍 OVS 语法层面分析')
log('blue', '='.repeat(70))

log('cyan', '\n📄 源码：')
source.split('\n').forEach((line, i) => {
  console.log(`  ${i + 1}: ${line}`)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 1 步：词法分析（Tokens）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 1 步：词法分析（Lexer）')
log('blue', '='.repeat(70))

const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(source)

log('cyan', '\n📊 Token 列表：')
tokens.forEach((token, i) => {
  console.log(`  [${i}] ${token.tokenName.padEnd(15)} "${token.tokenValue}" @ index=${token.index}`)
})

log('magenta', '\n💡 观察：')
log('yellow', '  • 每个 token 都有完整的位置信息（index, rowNum, columnStartNum）')
log('yellow', '  • div 和 name 都是 Identifier 类型')
log('yellow', '  • 所有位置信息都是准确的')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 2 步：语法分析（CST）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 2 步：语法分析（Parser → CST）')
log('blue', '='.repeat(70))

const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()

log('cyan', '\n📊 CST 结构（简化）：')

// 递归打印 CST 结构
function printCst(cst: any, depth = 0) {
  const indent = '  '.repeat(depth)
  const locInfo = cst.loc?.value ? ` [value="${cst.loc.value}"]` : ''
  console.log(`${indent}- ${cst.name}${locInfo}`)
  
  if (cst.children && cst.children.length > 0 && depth < 4) {
    cst.children.slice(0, 5).forEach((child: any) => {
      printCst(child, depth + 1)
    })
    if (cst.children.length > 5) {
      console.log(`${indent}  ... (${cst.children.length - 5} more)`)
    }
  }
}

printCst(cst)

log('magenta', '\n💡 观察：')
log('yellow', '  • CST 保留了完整的语法结构')
log('yellow', '  • 每个节点的 loc 信息继承自 token')
log('yellow', '  • OvsRenderDomViewDeclaration 是 OVS 特有语法')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 3 步：AST 转换
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 3 步：AST 转换（CST → AST）')
log('blue', '='.repeat(70))

const ast = OvsCstToSlimeAstUtil.toProgram(cst)

log('cyan', '\n📊 AST 结构：')
log('yellow', `类型: ${ast.type}`)
log('yellow', `语句数: ${ast.body.length}`)

ast.body.forEach((stmt: any, i) => {
  log('cyan', `\n语句 ${i + 1}:`)
  console.log(`  类型: ${stmt.type}`)
  
  if (stmt.type === 'VariableDeclaration') {
    console.log(`  kind: ${stmt.kind}`)
    console.log(`  声明数: ${stmt.declarations.length}`)
    stmt.declarations.forEach((decl: any, j: number) => {
      console.log(`    [${j}] ${decl.id.name} = ${decl.init?.value || decl.init?.type}`)
      console.log(`       id.loc: ${decl.id.loc ? JSON.stringify({
        value: decl.id.loc.value,
        index: decl.id.loc.start.index
      }) : 'null'}`)
    })
  } else if (stmt.type === 'ExportDefaultDeclaration') {
    console.log(`  declaration.type: ${stmt.declaration.type}`)
    if (stmt.declaration.type === 'CallExpression') {
      console.log(`  这是一个 IIFE（自执行函数）`)
      console.log(`  包含 OVS 转换后的代码`)
    }
  }
})

log('magenta', '\n💡 关键观察：')
log('yellow', '  • OVS 的 div { name } 被转换成了什么？')
log('yellow', '  • 转换过程中创建了哪些新节点？')
log('yellow', '  • 这些新节点有 loc 信息吗？')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 4 步：代码生成（映射分析）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 4 步：代码生成（AST → Code + Mappings）')
log('blue', '='.repeat(70))

const result = SlimeGenerator.generator(ast, tokens)

log('cyan', '\n📄 生成的代码（前 400 字符）：')
console.log(result.code.substring(0, 400))

log('cyan', '\n📊 映射分析：')
console.log(`总映射数: ${result.mapping.length}`)

// 分类映射
const mappingsWithValue = result.mapping.filter(m => 
  m.source && m.source.value && m.source.value !== 'null' && m.source.value !== 'undefined'
)
const mappingsWithoutValue = result.mapping.filter(m =>
  !m.source || !m.source.value || m.source.value === 'null' || m.source.value === 'undefined'
)

log('green', `有效映射: ${mappingsWithValue.length}`)
log('red', `无效映射: ${mappingsWithoutValue.length}`)

log('cyan', '\n✅ 有效映射详情：')
mappingsWithValue.forEach((m, i) => {
  console.log(`  [${i}] "${m.source.value}" @ src=${m.source.index} → gen=${m.generate.index}`)
})

log('cyan', '\n❌ 无效映射（前 10 个）：')
mappingsWithoutValue.slice(0, 10).forEach((m, i) => {
  console.log(`  [${i}] source.value="${m.source?.value}" generate.value="${m.generate?.value}"`)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 5 步：语法角度分析无效映射
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 5 步：语法角度分析')
log('blue', '='.repeat(70))

log('cyan', '\n🔍 无效映射对应的生成代码：')
const codeAnalysis: Record<string, number> = {}

mappingsWithoutValue.forEach(m => {
  const value = m.generate?.value || ''
  if (!codeAnalysis[value]) {
    codeAnalysis[value] = 0
  }
  codeAnalysis[value]++
})

Object.entries(codeAnalysis).forEach(([value, count]) => {
  console.log(`  "${value}": ${count} 次`)
})

log('magenta', '\n💡 语法层面的问题：')

log('yellow', '\n1. import 语句：')
log('cyan', '   源码没有 import，这是编译器添加的')
log('cyan', '   问题：为什么创建了映射？应该调用 addCode() 不创建映射')

log('yellow', '\n2. createReactiveVNode：')
log('cyan', '   这是 OVS 框架函数，源码中写的是 div')
log('cyan', '   问题：div → createReactiveVNode(\'div\', ...) 转换过程出了什么问题？')

log('yellow', '\n3. children 变量：')
log('cyan', '   源码没有 children，这是编译器生成的临时变量')
log('cyan', '   问题：为什么创建了映射？')

log('yellow', '\n4. 各种括号、运算符：')
log('cyan', '   这些都是凭空生成的语法结构')
log('cyan', '   问题：调用了 addCodeAndMappings 而不是 addCode')

log('magenta', '\n🎯 核心问题定位：')
log('red', '  在 AST → 代码生成 过程中，某些地方：')
log('red', '  • 本应调用 addCode(token) 不创建映射')
log('red', '  • 实际调用了 addCodeAndMappings(token, loc)')
log('red', '  • 而这个 loc 是一个包含 value="null" 的对象')

log('yellow', '\n💡 需要检查的关键位置：')
log('cyan', '  1. ensureOvsAPIImport() - 添加 import 的地方')
log('cyan', '  2. wrapTopLevelExpressions() - 包裹 IIFE 的地方')
log('cyan', '  3. createOvsRenderDomViewDeclarationAst() - 转换 div{} 的地方')
log('cyan', '  4. SlimeGenerator.generatorImportDeclaration() - 生成 import 的地方')

log('blue', '\n' + '='.repeat(70))


/**
 * 🔍 OVS 语法层面的映射分析
 * 
 * 目标：从语法角度分析每个阶段的转换
 */

import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import { ovs6Tokens } from './src/parser/OvsConsumer.ts'
import OvsTokenConsumer from './src/parser/OvsConsumer.ts'
import OvsParser from './src/parser/OvsParser.ts'
import OvsCstToSlimeAstUtil from './src/factory/OvsCstToSlimeAstUtil.ts'
import SlimeGenerator from '../slime/packages/slime-generator/src/SlimeGenerator.ts'
import JsonUtil from 'subhuti/src/utils/JsonUtil.ts'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 分析简单的 OVS 代码
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const source = `const name = "Alice"
div { name }`

log('blue', '\n' + '='.repeat(70))
log('blue', '🔍 OVS 语法层面分析')
log('blue', '='.repeat(70))

log('cyan', '\n📄 源码：')
source.split('\n').forEach((line, i) => {
  console.log(`  ${i + 1}: ${line}`)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 1 步：词法分析（Tokens）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 1 步：词法分析（Lexer）')
log('blue', '='.repeat(70))

const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(source)

log('cyan', '\n📊 Token 列表：')
tokens.forEach((token, i) => {
  console.log(`  [${i}] ${token.tokenName.padEnd(15)} "${token.tokenValue}" @ index=${token.index}`)
})

log('magenta', '\n💡 观察：')
log('yellow', '  • 每个 token 都有完整的位置信息（index, rowNum, columnStartNum）')
log('yellow', '  • div 和 name 都是 Identifier 类型')
log('yellow', '  • 所有位置信息都是准确的')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 2 步：语法分析（CST）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 2 步：语法分析（Parser → CST）')
log('blue', '='.repeat(70))

const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()

log('cyan', '\n📊 CST 结构（简化）：')

// 递归打印 CST 结构
function printCst(cst: any, depth = 0) {
  const indent = '  '.repeat(depth)
  const locInfo = cst.loc?.value ? ` [value="${cst.loc.value}"]` : ''
  console.log(`${indent}- ${cst.name}${locInfo}`)
  
  if (cst.children && cst.children.length > 0 && depth < 4) {
    cst.children.slice(0, 5).forEach((child: any) => {
      printCst(child, depth + 1)
    })
    if (cst.children.length > 5) {
      console.log(`${indent}  ... (${cst.children.length - 5} more)`)
    }
  }
}

printCst(cst)

log('magenta', '\n💡 观察：')
log('yellow', '  • CST 保留了完整的语法结构')
log('yellow', '  • 每个节点的 loc 信息继承自 token')
log('yellow', '  • OvsRenderDomViewDeclaration 是 OVS 特有语法')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 3 步：AST 转换
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 3 步：AST 转换（CST → AST）')
log('blue', '='.repeat(70))

const ast = OvsCstToSlimeAstUtil.toProgram(cst)

log('cyan', '\n📊 AST 结构：')
log('yellow', `类型: ${ast.type}`)
log('yellow', `语句数: ${ast.body.length}`)

ast.body.forEach((stmt: any, i) => {
  log('cyan', `\n语句 ${i + 1}:`)
  console.log(`  类型: ${stmt.type}`)
  
  if (stmt.type === 'VariableDeclaration') {
    console.log(`  kind: ${stmt.kind}`)
    console.log(`  声明数: ${stmt.declarations.length}`)
    stmt.declarations.forEach((decl: any, j: number) => {
      console.log(`    [${j}] ${decl.id.name} = ${decl.init?.value || decl.init?.type}`)
      console.log(`       id.loc: ${decl.id.loc ? JSON.stringify({
        value: decl.id.loc.value,
        index: decl.id.loc.start.index
      }) : 'null'}`)
    })
  } else if (stmt.type === 'ExportDefaultDeclaration') {
    console.log(`  declaration.type: ${stmt.declaration.type}`)
    if (stmt.declaration.type === 'CallExpression') {
      console.log(`  这是一个 IIFE（自执行函数）`)
      console.log(`  包含 OVS 转换后的代码`)
    }
  }
})

log('magenta', '\n💡 关键观察：')
log('yellow', '  • OVS 的 div { name } 被转换成了什么？')
log('yellow', '  • 转换过程中创建了哪些新节点？')
log('yellow', '  • 这些新节点有 loc 信息吗？')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 4 步：代码生成（映射分析）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 4 步：代码生成（AST → Code + Mappings）')
log('blue', '='.repeat(70))

const result = SlimeGenerator.generator(ast, tokens)

log('cyan', '\n📄 生成的代码（前 400 字符）：')
console.log(result.code.substring(0, 400))

log('cyan', '\n📊 映射分析：')
console.log(`总映射数: ${result.mapping.length}`)

// 分类映射
const mappingsWithValue = result.mapping.filter(m => 
  m.source && m.source.value && m.source.value !== 'null' && m.source.value !== 'undefined'
)
const mappingsWithoutValue = result.mapping.filter(m =>
  !m.source || !m.source.value || m.source.value === 'null' || m.source.value === 'undefined'
)

log('green', `有效映射: ${mappingsWithValue.length}`)
log('red', `无效映射: ${mappingsWithoutValue.length}`)

log('cyan', '\n✅ 有效映射详情：')
mappingsWithValue.forEach((m, i) => {
  console.log(`  [${i}] "${m.source.value}" @ src=${m.source.index} → gen=${m.generate.index}`)
})

log('cyan', '\n❌ 无效映射（前 10 个）：')
mappingsWithoutValue.slice(0, 10).forEach((m, i) => {
  console.log(`  [${i}] source.value="${m.source?.value}" generate.value="${m.generate?.value}"`)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 第 5 步：语法角度分析无效映射
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log('blue', '\n' + '='.repeat(70))
log('blue', '第 5 步：语法角度分析')
log('blue', '='.repeat(70))

log('cyan', '\n🔍 无效映射对应的生成代码：')
const codeAnalysis: Record<string, number> = {}

mappingsWithoutValue.forEach(m => {
  const value = m.generate?.value || ''
  if (!codeAnalysis[value]) {
    codeAnalysis[value] = 0
  }
  codeAnalysis[value]++
})

Object.entries(codeAnalysis).forEach(([value, count]) => {
  console.log(`  "${value}": ${count} 次`)
})

log('magenta', '\n💡 语法层面的问题：')

log('yellow', '\n1. import 语句：')
log('cyan', '   源码没有 import，这是编译器添加的')
log('cyan', '   问题：为什么创建了映射？应该调用 addCode() 不创建映射')

log('yellow', '\n2. createReactiveVNode：')
log('cyan', '   这是 OVS 框架函数，源码中写的是 div')
log('cyan', '   问题：div → createReactiveVNode(\'div\', ...) 转换过程出了什么问题？')

log('yellow', '\n3. children 变量：')
log('cyan', '   源码没有 children，这是编译器生成的临时变量')
log('cyan', '   问题：为什么创建了映射？')

log('yellow', '\n4. 各种括号、运算符：')
log('cyan', '   这些都是凭空生成的语法结构')
log('cyan', '   问题：调用了 addCodeAndMappings 而不是 addCode')

log('magenta', '\n🎯 核心问题定位：')
log('red', '  在 AST → 代码生成 过程中，某些地方：')
log('red', '  • 本应调用 addCode(token) 不创建映射')
log('red', '  • 实际调用了 addCodeAndMappings(token, loc)')
log('red', '  • 而这个 loc 是一个包含 value="null" 的对象')

log('yellow', '\n💡 需要检查的关键位置：')
log('cyan', '  1. ensureOvsAPIImport() - 添加 import 的地方')
log('cyan', '  2. wrapTopLevelExpressions() - 包裹 IIFE 的地方')
log('cyan', '  3. createOvsRenderDomViewDeclarationAst() - 转换 div{} 的地方')
log('cyan', '  4. SlimeGenerator.generatorImportDeclaration() - 生成 import 的地方')

log('blue', '\n' + '='.repeat(70))



















