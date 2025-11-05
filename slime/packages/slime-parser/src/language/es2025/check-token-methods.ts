/**
 * 检查 Es2025Parser 中使用的 tokenConsumer 方法是否都存在
 */

import * as fs from 'fs'
import * as path from 'path'

// 1. 读取 Parser 文件，提取所有 tokenConsumer 方法调用
const parserFile = path.join(__dirname, 'Es2025Parser.ts')
const parserContent = fs.readFileSync(parserFile, 'utf-8')

const methodCalls = new Set<string>()
const regex = /this\.tokenConsumer\.(\w+)\(/g
let match

while ((match = regex.exec(parserContent)) !== null) {
  methodCalls.add(match[1])
}

console.log(`在 Parser 中找到 ${methodCalls.size} 个不同的 tokenConsumer 方法调用\n`)

// 2. 读取所有 TokenConsumer 文件，提取方法定义
const tokenConsumerFiles = [
  '../es5/Es5TokenConsumer.ts',
  '../es2015/Es6Tokens.ts',
  '../es2020/Es2020Tokens.ts',
  './Es2025Tokens.ts'
]

const definedMethods = new Set<string>()

for (const file of tokenConsumerFiles) {
  const filePath = path.join(__dirname, file)
  if (!fs.existsSync(filePath)) continue
  
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // 匹配方法定义：methodName() { 或 methodName(): 
  const methodRegex = /^\s+(\w+)\s*\(\s*\)\s*[:{]/gm
  let methodMatch
  
  while ((methodMatch = methodRegex.exec(content)) !== null) {
    definedMethods.add(methodMatch[1])
  }
}

console.log(`在 TokenConsumer 中找到 ${definedMethods.size} 个已定义的方法\n`)

// 3. 找出不匹配的方法
const missingMethods = [...methodCalls].filter(m => !definedMethods.has(m))

if (missingMethods.length === 0) {
  console.log('✅ 所有方法都已定义！')
} else {
  console.log(`❌ 发现 ${missingMethods.length} 个未定义的方法:\n`)
  missingMethods.sort().forEach(method => {
    console.log(`  - ${method}()`)
  })
  
  console.log('\n🔍 建议修复方案:\n')
  
  // 提供修复建议
  const fixes: { [key: string]: string } = {
    'Equal': 'Eq',
    'StrictEqual': 'EqEqEq',
    'StrictNotEqual': 'NotEqEq',
    'NotEqual': 'NotEq',
    'LogicalOr': 'VerticalBarVerticalBar',
    'LogicalAnd': 'AmpersandAmpersand',
    'BitwiseOr': 'VerticalBar',
    'BitwiseXor': 'Circumflex',
    'BitwiseAnd': 'Ampersand',
    'BitwiseNot': 'Tilde',
    'LogicalNot': 'Exclamation',
    'LessThan': 'Less',
    'GreaterThan': 'More',
    'LessThanOrEqual': 'LessEq',
    'GreaterThanOrEqual': 'MoreEq',
    'LeftShift': 'LessLess',
    'SignedRightShift': 'MoreMore',
    'UnsignedRightShift': 'MoreMoreMore',
    'Modulo': 'Percent',
    'Increment': 'PlusPlus',
    'Decrement': 'MinusMinus',
    'LogicalAndAssign': 'AmpersandAmpersandEq',
    'LogicalOrAssign': 'VerticalBarVerticalBarEq',
    'NullishCoalescingAssign': 'QuestionQuestionEq',
  }
  
  missingMethods.forEach(method => {
    if (fixes[method]) {
      console.log(`  ${method}() → ${fixes[method]}()`)
    } else {
      console.log(`  ${method}() → ???`)
    }
  })
}











