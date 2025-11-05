/**
 * 分析 Es2025Parser 中的 Or 规则顺序
 * 找出可能有问题的短规则在前、长规则在后的情况
 */

import * as fs from 'fs'
import * as path from 'path'

const parserFile = path.join(__dirname, 'Es2025Parser.ts')
const content = fs.readFileSync(parserFile, 'utf-8')

interface OrBranch {
  code: string
  isEmpty: boolean
  length: number
  hasConsume: boolean
  hasRule: boolean
}

interface OrRule {
  ruleName: string
  lineNumber: number
  branches: OrBranch[]
  hasIssue: boolean
  issueDescription: string
}

/**
 * 分析单个 Or 分支
 */
function analyzeBranch(branchCode: string): OrBranch {
  const trimmed = branchCode.trim()
  
  // 检查是否为空规则
  const isEmpty = /^\{\s*alt:\s*\(\)\s*=>\s*\{\s*\}\s*\}/.test(trimmed)
  
  // 检查是否包含 consume
  const hasConsume = /this\.tokenConsumer\./.test(trimmed)
  
  // 检查是否调用其他规则
  const hasRule = /this\.[A-Z]/.test(trimmed)
  
  return {
    code: trimmed,
    isEmpty,
    length: trimmed.length,
    hasConsume,
    hasRule
  }
}

/**
 * 检查 Or 规则是否有顺序问题
 */
function checkOrRule(branches: OrBranch[]): { hasIssue: boolean; description: string } {
  // 规则1: 空规则在前面（最严重）
  if (branches.length > 1 && branches[0].isEmpty) {
    return {
      hasIssue: true,
      description: '❌ 空规则在第1个位置，会导致所有后续分支无法执行'
    }
  }
  
  // 规则2: 空规则不在最后
  const emptyIndex = branches.findIndex(b => b.isEmpty)
  if (emptyIndex !== -1 && emptyIndex !== branches.length - 1) {
    return {
      hasIssue: true,
      description: `⚠️ 空规则在第${emptyIndex + 1}个位置，应该放在最后（位置${branches.length}）`
    }
  }
  
  // 规则3: 短规则在长规则前面
  for (let i = 0; i < branches.length - 1; i++) {
    const current = branches[i]
    const next = branches[i + 1]
    
    // 跳过空规则的比较
    if (current.isEmpty || next.isEmpty) continue
    
    // 如果当前分支没有 consume 也没有规则调用，但下一个有，说明顺序可能有问题
    if (!current.hasConsume && !current.hasRule && (next.hasConsume || next.hasRule)) {
      return {
        hasIssue: true,
        description: `⚠️ 第${i + 1}个分支比第${i + 2}个分支短，可能导致长规则无法匹配`
      }
    }
    
    // 如果当前分支只有一个简单规则，下一个有多个操作，可能有问题
    const currentOps = (current.code.match(/this\./g) || []).length
    const nextOps = (next.code.match(/this\./g) || []).length
    
    if (currentOps > 0 && nextOps > currentOps * 2) {
      return {
        hasIssue: true,
        description: `⚠️ 第${i + 1}个分支（${currentOps}个操作）比第${i + 2}个分支（${nextOps}个操作）简单很多`
      }
    }
  }
  
  return { hasIssue: false, description: '' }
}

/**
 * 提取规则名称
 */
function extractRuleName(lines: string[], startLine: number): string {
  // 向上查找最近的 @SubhutiRule
  for (let i = startLine; i >= Math.max(0, startLine - 20); i--) {
    const line = lines[i]
    const match = line.match(/^\s*([A-Z][a-zA-Z0-9_]*)\s*\(/)
    if (match) {
      return match[1]
    }
  }
  return 'Unknown'
}

/**
 * 解析所有 Or 规则
 */
function parseOrRules(): OrRule[] {
  const lines = content.split('\n')
  const orRules: OrRule[] = []
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    
    // 查找 this.Or([
    if (line.includes('this.Or([')) {
      const ruleName = extractRuleName(lines, i)
      const lineNumber = i + 1
      
      // 提取 Or 的所有分支
      let braceCount = 0
      let bracketCount = 0
      let inOr = false
      let currentBranch = ''
      const branches: string[] = []
      
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j]
        
        if (currentLine.includes('this.Or([')) {
          inOr = true
          bracketCount = 1
        }
        
        if (inOr) {
          currentBranch += currentLine + '\n'
          
          // 统计括号
          for (const char of currentLine) {
            if (char === '[') bracketCount++
            if (char === ']') bracketCount--
            if (char === '{') braceCount++
            if (char === '}') braceCount--
          }
          
          // 检测分支结束
          if (currentLine.includes('{ alt:') && braceCount === 1) {
            // 新分支开始，保存之前的
            if (currentBranch.trim() && branches.length > 0) {
              branches.push(currentBranch)
              currentBranch = ''
            }
          }
          
          // Or 规则结束
          if (bracketCount === 0 && currentLine.includes('])')) {
            if (currentBranch.trim()) {
              branches.push(currentBranch)
            }
            break
          }
        }
      }
      
      // 更简单的分支提取策略
      const orMatch = content.substring(
        content.indexOf('this.Or([', lines.slice(0, i).join('\n').length),
        content.length
      )
      
      const altMatches = orMatch.match(/\{\s*alt:\s*\(\)\s*=>\s*[\s\S]*?\}\s*(?=[,\]])/g)
      
      if (altMatches && altMatches.length > 0) {
        const analyzedBranches = altMatches.map(analyzeBranch)
        const { hasIssue, description } = checkOrRule(analyzedBranches)
        
        orRules.push({
          ruleName,
          lineNumber,
          branches: analyzedBranches,
          hasIssue,
          issueDescription: description
        })
      }
      
      i += 20 // 跳过已分析的行
    } else {
      i++
    }
  }
  
  return orRules
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 分析 Es2025Parser.ts 中的 Or 规则...\n')
  console.log('=' .repeat(80))
  
  const orRules = parseOrRules()
  
  console.log(`\n📊 找到 ${orRules.length} 个 Or 规则\n`)
  
  const issueRules = orRules.filter(r => r.hasIssue)
  
  if (issueRules.length === 0) {
    console.log('✅ 所有 Or 规则的顺序都正确！')
    return
  }
  
  console.log(`❌ 发现 ${issueRules.length} 个有问题的 Or 规则：\n`)
  console.log('=' .repeat(80))
  
  issueRules.forEach((rule, index) => {
    console.log(`\n${index + 1}. ${rule.ruleName} (第 ${rule.lineNumber} 行)`)
    console.log(`   ${rule.issueDescription}`)
    console.log(`   分支数: ${rule.branches.length}`)
    
    rule.branches.forEach((branch, i) => {
      const prefix = branch.isEmpty ? '  [空] ' : '  [√]  '
      const ops = (branch.code.match(/this\./g) || []).length
      console.log(`   ${prefix}分支 ${i + 1}: ${ops} 个操作${branch.isEmpty ? ' (空规则)' : ''}`)
    })
  })
  
  console.log('\n' + '=' .repeat(80))
  console.log('\n📋 修复建议：\n')
  console.log('1. 将空规则 { alt: () => {} } 移到最后')
  console.log('2. 将长规则（多个操作）放在短规则前面')
  console.log('3. 将更具体的规则放在更通用的规则前面')
  console.log('\n' + '=' .repeat(80))
}

main()





