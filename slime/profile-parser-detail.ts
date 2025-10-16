import {readFileSync} from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import {LogUtil} from "./src/logutil";

Error.stackTraceLimit = 50;

// 详细的Parser性能分析 - 找出热点函数
const testFile = process.argv[2] || 'tests/cases/single/12-template-literals.js'

console.log(`\n🔬 Parser详细性能分析: ${testFile}\n`)

const code = readFileSync(testFile, 'utf-8')
const lines = code.split('\n').length

console.log(`文件信息: ${lines}行代码\n`)

// 词法分析
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log(`✅ 生成 ${tokens.length} 个tokens\n`)
console.log(tokens)

// 准备Parser性能监控
const parser = new Es6Parser(tokens)

// 统计调用次数
let orCallCount = 0
let manyCallCount = 0
let optionCallCount = 0
let backDataCallCount = 0
let setBackDataCallCount = 0

// 包装关键方法
const originalOr = parser.Or.bind(parser)
const originalMany = parser.Many.bind(parser)
const originalOption = parser.Option.bind(parser)
const originalSetBackData = parser.setBackData.bind(parser)

// 保存原始backData的实现
const backDataDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(parser), 'backData')
const originalBackDataGetter = backDataDescriptor?.get

parser.Or = function (...args) {
  orCallCount++
  return originalOr(...args)
}

parser.Many = function (...args) {
  manyCallCount++
  return originalMany(...args)
}

parser.Option = function (...args) {
  optionCallCount++
  return originalOption(...args)
}

// 只有在backData是getter时才包装
if (originalBackDataGetter) {
  Object.defineProperty(parser, 'backData', {
    get: function () {
      backDataCallCount++
      return originalBackDataGetter.call(this)
    },
    configurable: true
  })
}

parser.setBackData = function (...args) {
  setBackDataCallCount++
  return originalSetBackData(...args)
}

// 执行解析并计时
console.time('⏱️ Parser总耗时')

try {
  const cst = parser.Program()
  LogUtil.log(cst)
} catch (e) {
  console.error( e)
}
console.timeEnd('⏱️ Parser总耗时')

console.log(`\n📊 Parser调用统计:\n`)
console.log(`  Or分支选择:     ${orCallCount.toLocaleString()} 次`)
console.log(`  Many循环:       ${manyCallCount.toLocaleString()} 次`)
console.log(`  Option可选:     ${optionCallCount.toLocaleString()} 次`)
console.log(`  backData创建:   ${backDataCallCount.toLocaleString()} 次 (快照)`)
console.log(`  setBackData回退: ${setBackDataCallCount.toLocaleString()} 次`)

console.log(`\n🎯 性能热点分析:\n`)

const totalCalls = orCallCount + manyCallCount + optionCallCount
console.log(`  总控制流调用: ${totalCalls.toLocaleString()} 次`)
console.log(`  快照操作: ${(backDataCallCount + setBackDataCallCount).toLocaleString()} 次`)

if (backDataCallCount > 0) {
  console.log(`\n  每个快照的创建成本: ~${(1156 / backDataCallCount * 1000).toFixed(2)}μs`)
}

console.log(`\n💡 优化建议:`)
if (backDataCallCount > 5000) {
  console.log(`  ⚠️ backData调用过于频繁 (${backDataCallCount}次)`)
  console.log(`     建议: 缓存tokens.slice()结果`)
}
if (orCallCount > 1000) {
  console.log(`  ⚠️ Or分支选择频繁 (${orCallCount}次)`)
  console.log(`     建议: 优化分支顺序或添加FIRST集预判`)
}
if (setBackDataCallCount > backDataCallCount * 0.5) {
  console.log(`  ⚠️ 回退率较高 (${((setBackDataCallCount / backDataCallCount) * 100).toFixed(1)}%)`)
  console.log(`     建议: 优化语法规则或添加lookahead`)
}

