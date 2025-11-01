/**
 * 规则测试: CST内容正确性测试
 * 用于测试152个Parser规则对应的测试文件
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests/es6rules')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js') && !f.startsWith('add-') && !f.startsWith('rename-') && !f.startsWith('enhance-') && !f.startsWith('verify-'))
  .sort()

console.log(`🧪 ES6规则测试: CST内容正确性验证`)
console.log(`📋 找到 ${files.length} 个规则测试文件\n`)

// 收集CST中的所有token值
function collectTokenValues(node: any): string[] {
  const values: string[] = []
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

// 验证CST结构完整性
interface CSTValidationError {
  path: string
  issue: string
}

function validateCSTStructure(node: any, path: string = 'root'): CSTValidationError[] {
  const errors: CSTValidationError[] = []
  if (node === null || node === undefined) {
    errors.push({ path, issue: 'Node is null or undefined' })
    return errors
  }
  if (!node.name && node.value === undefined) {
    errors.push({ path, issue: 'Node has neither name nor value' })
  }
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      errors.push({ path, issue: `children is not an array` })
      return errors
    }
    node.children.forEach((child: any, index: number) => {
      if (child === null || child === undefined) {
        errors.push({ path: `${path}.children[${index}]`, issue: 'Child is null or undefined' })
      } else {
        const childErrors = validateCSTStructure(child, `${path}.children[${index}]`)
        errors.push(...childErrors)
      }
    })
  }
  return errors
}

// 统计CST节点信息
function getCSTStatistics(node: any): { totalNodes: number; leafNodes: number; maxDepth: number } {
  const stats = { totalNodes: 0, leafNodes: 0, maxDepth: 0 }
  function traverse(node: any, depth: number) {
    if (!node) return
    stats.totalNodes++
    stats.maxDepth = Math.max(stats.maxDepth, depth)
    if (!node.children || node.children.length === 0) {
      stats.leafNodes++
    } else {
      for (const child of node.children) {
        traverse(child, depth + 1)
      }
    }
  }
  traverse(node, 0)
  return stats
}

// 测试执行
let passCount = 0
let failCount = 0
const failedFiles: string[] = []

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')
  const codeLines = code.split('\n').filter(l => !l.trim().startsWith('//') && l.trim())
  const actualCode = codeLines.join('\n').trim()

  if (!actualCode) {
    console.log(`[${i + 1}/${files.length}] ⏭️  ${testName}`)
    continue
  }

  try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(actualCode)
    const inputTokens = tokens.map((t: any) => t.tokenValue).filter((v: any) => v !== undefined)

    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    const structureErrors = validateCSTStructure(cst)
    if (structureErrors.length > 0) {
      console.log(`[${i + 1}/${files.length}] ❌ ${testName} - CST结构错误`)
      failCount++
      failedFiles.push(testName)
      continue
    }
    
    const cstTokens = collectTokenValues(cst)
    const missingTokens = inputTokens.filter(t => !cstTokens.includes(t))
    
    if (missingTokens.length > 0) {
      console.log(`[${i + 1}/${files.length}] ❌ ${testName} - Token丢失`)
      failCount++
      failedFiles.push(testName)
      continue
    }

    const stats = getCSTStatistics(cst)
    console.log(`[${i + 1}/${files.length}] ✅ ${testName}`)
    passCount++

  } catch (error: any) {
    console.log(`[${i + 1}/${files.length}] ❌ ${testName} - ${error.message.substring(0, 60)}`)
    failCount++
    failedFiles.push(testName)
  }
}

console.log('\n' + '='.repeat(80))
console.log(`📊 测试总结: ${files.length} 文件 | ✅ ${passCount} | ❌ ${failCount}`)
console.log(`通过率: ${((passCount / files.length) * 100).toFixed(1)}%`)

if (failedFiles.length > 0) {
  console.log(`\n❌ 失败的文件 (前10个):`)
  failedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`))
  if (failedFiles.length > 10) console.log(`  ... 还有 ${failedFiles.length - 10} 个`)
  process.exit(1)
} else {
  console.log(`\n🎉 所有 ${files.length} 个规则测试全部通过！`)
}
