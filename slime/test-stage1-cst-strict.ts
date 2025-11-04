/**
 * 阶段1: CST生成严格测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 * 验证内容: CST结构完整性、节点类型正确性、Token值保留
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

console.log(`🧪 阶段1: CST生成严格测试 (${files.length} 个用例)`)
console.log('测试范围: 词法分析 → 语法分析')
console.log('验证内容: CST结构、节点类型、Token值\n')

// 递归验证CST节点
function validateCSTNode(node: any, path: string = 'root'): string[] {
  const errors: string[] = []
  
  // 检查1: 节点必须有name或value
  if (!node.name && node.value === undefined) {
    errors.push(`${path}: 节点缺少name和value`)
    return errors
  }
  
  // 检查2: 如果有children，必须是数组
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      errors.push(`${path}: children不是数组，类型=${typeof node.children}`)
      return errors
    }
    
    // 检查3: children不应该包含null/undefined
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (child === null || child === undefined) {
        errors.push(`${path}.children[${i}]: 子节点为${child}`)
      } else {
        // 递归验证子节点
        const childPath = `${path}.children[${i}](${child.name || 'token'})`
        errors.push(...validateCSTNode(child, childPath))
      }
    }
  }
  
  // 检查4: loc位置信息完整性
  if (node.loc) {
    if (!node.loc.start || !node.loc.end) {
      errors.push(`${path}: loc缺少start或end`)
    }
    if (node.loc.start && (node.loc.start.index === undefined || node.loc.start.line === undefined)) {
      errors.push(`${path}: loc.start缺少index或line`)
    }
  }
  
  return errors
}

// 统计CST节点信息
function getCSTStats(node: any): { nodes: number, tokens: number, depth: number } {
  let nodes = 0
  let tokens = 0
  let maxDepth = 0
  
  function traverse(n: any, depth: number) {
    if (n.children && n.children.length > 0) {
      nodes++
      maxDepth = Math.max(maxDepth, depth)
      for (const child of n.children) {
        traverse(child, depth + 1)
      }
    } else {
      tokens++
    }
  }
  
  traverse(node, 0)
  return { nodes, tokens, depth: maxDepth }
}

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.tokenize(code)
    console.log(`✅ 词法分析: ${tokens.length} tokens`)
    
    // 验证tokens完整性
    let hasInvalidToken = false
    for (let j = 0; j < tokens.length; j++) {
      const token: any = tokens[j]
      if (!token || token.tokenName === undefined || token.tokenValue === undefined) {
        console.log(`  ⚠️ Token[${j}] 不完整: tokenName=${token?.tokenName}, tokenValue=${token?.tokenValue}`)
        hasInvalidToken = true
      }
      // 验证位置信息
      if (token && (token.index === undefined || token.rowNum === undefined)) {
        console.log(`  ⚠️ Token[${j}] 缺少位置信息`)
        hasInvalidToken = true
      }
    }
    
    if (hasInvalidToken) {
      console.log(`  ❌ 存在不完整的Token`)
      throw new Error('Token验证失败')
    }

    // 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log(`✅ 语法分析: CST生成成功`)
    
    // 验证CST根节点
    if (!cst.name || cst.name !== 'Program') {
      console.log(`  ❌ CST根节点name错误: ${cst.name}`)
      throw new Error('CST根节点验证失败')
    }
    
    if (!cst.children || cst.children.length === 0) {
      console.log(`  ⚠️ CST根节点没有children（可能是空程序）`)
    }
    
    // 验证CST结构完整性
    const errors = validateCSTNode(cst, 'Program')
    if (errors.length > 0) {
      console.log(`  ❌ CST结构验证失败:`)
      errors.slice(0, 5).forEach(err => console.log(`     - ${err}`))
      if (errors.length > 5) {
        console.log(`     ... 还有${errors.length - 5}个错误`)
      }
      throw new Error('CST结构验证失败')
    }
    
    // 统计CST信息
    const stats = getCSTStats(cst)
    console.log(`✅ CST结构验证通过`)
    console.log(`   节点数: ${stats.nodes}, Token数: ${stats.tokens}, 深度: ${stats.depth}`)

  } catch (error: any) {
    console.log(`\n❌ 失败: ${error.message}`)
    console.log('\n输入代码:')
    console.log(code)
    console.log('\n⚠️ 测试在第', i + 1, '个用例停止')
    console.log(`当前进度: ${i}/${files.length} 通过\n`)
    process.exit(1)
  }
}

console.log('\n' + '='.repeat(60))
console.log(`🎉 阶段1严格测试全部通过: ${files.length}/${files.length}`)
console.log('✅ 所有CST结构完整且正确')

