/**
 * 分析规则测试覆盖度
 * 
 * 目标：
 * 1. 提取Es6Parser.ts中所有规则及其Or分支
 * 2. 分析每个规则测试文件的测试用例
 * 3. 对比是否所有分支都有测试
 * 4. 输出未完全覆盖的规则
 */

import * as fs from 'fs'
import * as path from 'path'

interface RuleInfo {
  name: string
  lineNumber: number
  orBranches: string[]
  optionCount: number
  manyCount: number
}

interface TestFileInfo {
  filename: string
  ruleName: string
  testCaseCount: number
  testDescriptions: string[]
}

/**
 * 提取Es6Parser.ts中的规则信息
 */
function extractParserRules(parserFilePath: string): RuleInfo[] {
  const content = fs.readFileSync(parserFilePath, 'utf-8')
  const lines = content.split('\n')
  const rules: RuleInfo[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 查找 @SubhutiRule
    if (line.trim() === '@SubhutiRule') {
      // 下一行应该是规则名
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        const match = nextLine.match(/(\w+)\(\s*\)\s*{/)
        
        if (match) {
          const ruleName = match[1]
          const ruleInfo: RuleInfo = {
            name: ruleName,
            lineNumber: i + 2, // 实际行号（从1开始）
            orBranches: [],
            optionCount: 0,
            manyCount: 0
          }
          
          // 分析规则body（简单版本：只看接下来的100行）
          let braceCount = 1
          let ruleBody = ''
          
          for (let j = i + 2; j < Math.min(i + 200, lines.length); j++) {
            const bodyLine = lines[j]
            ruleBody += bodyLine + '\n'
            
            // 统计大括号
            braceCount += (bodyLine.match(/{/g) || []).length
            braceCount -= (bodyLine.match(/}/g) || []).length
            
            if (braceCount === 0) break
          }
          
          // 分析Or分支
          const orMatches = ruleBody.matchAll(/this\.Or\(\s*\[/g)
          let orCount = 0
          for (const _ of orMatches) {
            orCount++
          }
          
          // 简单估算：每个Or通常有3-5个分支
          // 我们需要手动查看源代码确定精确数量
          if (orCount > 0) {
            // 计算alt数量
            const altMatches = ruleBody.match(/\{\s*alt:/g)
            if (altMatches) {
              for (let k = 0; k < altMatches.length; k++) {
                ruleInfo.orBranches.push(`Branch_${k + 1}`)
              }
            }
          }
          
          // 统计Option数量
          const optionMatches = ruleBody.match(/this\.Option\(/g)
          ruleInfo.optionCount = optionMatches ? optionMatches.length : 0
          
          // 统计Many数量
          const manyMatches = ruleBody.match(/this\.Many\(/g)
          ruleInfo.manyCount = manyMatches ? manyMatches.length : 0
          
          rules.push(ruleInfo)
        }
      }
    }
  }
  
  return rules
}

/**
 * 分析测试文件
 */
function analyzeTestFile(testFilePath: string): TestFileInfo {
  const filename = path.basename(testFilePath)
  const content = fs.readFileSync(testFilePath, 'utf-8')
  const lines = content.split('\n')
  
  // 提取规则名
  const ruleNameMatch = filename.match(/^\d{3}-(.+)\.js$/)
  const ruleName = ruleNameMatch ? ruleNameMatch[1] : 'Unknown'
  
  // 统计测试用例
  const testCases: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('// ✅')) {
      testCases.push(trimmed.substring(5).trim())
    }
  }
  
  return {
    filename,
    ruleName,
    testCaseCount: testCases.length,
    testDescriptions: testCases
  }
}

/**
 * 递归查找所有测试文件
 */
function findAllTestFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      files.push(...findAllTestFiles(fullPath))
    } else if (item.endsWith('.js') && /^\d{3}-/.test(item)) {
      files.push(fullPath)
    }
  }
  
  return files
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 分析Es6Parser规则测试覆盖度...\n')
  
  // 1. 提取Parser规则
  const parserPath = path.join(__dirname, '../../packages/slime-parser/src/language/es2015/Es6Parser.ts')
  console.log('📖 读取Parser文件:', parserPath)
  const rules = extractParserRules(parserPath)
  console.log(`✅ 找到 ${rules.length} 个规则\n`)
  
  // 2. 分析测试文件
  const testDir = path.join(__dirname)
  const testFiles = findAllTestFiles(testDir)
  console.log(`📁 找到 ${testFiles.length} 个测试文件\n`)
  
  const testInfoMap = new Map<string, TestFileInfo>()
  for (const file of testFiles) {
    const info = analyzeTestFile(file)
    testInfoMap.set(info.ruleName, info)
  }
  
  // 3. 对比覆盖度
  console.log('========== 覆盖度分析 ==========\n')
  
  let fullyCovered = 0
  let partiallyCovered = 0
  let notCovered = 0
  
  const complexRules: Array<{rule: RuleInfo, test?: TestFileInfo}> = []
  
  for (const rule of rules) {
    const testInfo = testInfoMap.get(rule.name)
    
    if (!testInfo) {
      console.log(`❌ ${rule.name.padEnd(40)} | 无测试文件`)
      notCovered++
      continue
    }
    
    // 分析复杂度
    const complexity = rule.orBranches.length + rule.optionCount + rule.manyCount
    
    if (complexity > 5) {
      complexRules.push({ rule, test: testInfo })
    }
    
    // 评估覆盖度
    const hasOr = rule.orBranches.length > 0
    const hasOption = rule.optionCount > 0
    const hasMany = rule.manyCount > 0
    
    // 简单评估：测试用例数量 >= Or分支数 + Option数 * 2
    const minRequiredTests = rule.orBranches.length + rule.optionCount * 2 + rule.manyCount * 3
    const hasEnoughTests = testInfo.testCaseCount >= minRequiredTests
    
    if (hasEnoughTests) {
      console.log(`✅ ${rule.name.padEnd(40)} | 用例: ${testInfo.testCaseCount.toString().padStart(3)} | Or: ${rule.orBranches.length.toString().padStart(2)} | Opt: ${rule.optionCount.toString().padStart(2)} | Many: ${rule.manyCount.toString().padStart(2)}`)
      fullyCovered++
    } else {
      console.log(`⚠️  ${rule.name.padEnd(40)} | 用例: ${testInfo.testCaseCount.toString().padStart(3)} | Or: ${rule.orBranches.length.toString().padStart(2)} | Opt: ${rule.optionCount.toString().padStart(2)} | Many: ${rule.manyCount.toString().padStart(2)} | 建议: ${minRequiredTests}+`)
      partiallyCovered++
    }
  }
  
  // 4. 输出复杂规则
  console.log('\n========== 复杂规则（需重点测试）==========\n')
  
  complexRules.sort((a, b) => {
    const compA = a.rule.orBranches.length + a.rule.optionCount + a.rule.manyCount
    const compB = b.rule.orBranches.length + b.rule.optionCount + b.rule.manyCount
    return compB - compA
  })
  
  for (const {rule, test} of complexRules.slice(0, 20)) {
    const testCount = test ? test.testCaseCount : 0
    const complexity = rule.orBranches.length + rule.optionCount + rule.manyCount
    console.log(`📌 ${rule.name.padEnd(35)} | 复杂度: ${complexity.toString().padStart(2)} | 测试: ${testCount.toString().padStart(3)} | Or: ${rule.orBranches.length} | Opt: ${rule.optionCount} | Many: ${rule.manyCount}`)
  }
  
  // 5. 总结
  console.log('\n========== 总结 ==========')
  console.log(`📊 总规则数: ${rules.length}`)
  console.log(`✅ 充分覆盖: ${fullyCovered} (${((fullyCovered / rules.length) * 100).toFixed(1)}%)`)
  console.log(`⚠️  部分覆盖: ${partiallyCovered} (${((partiallyCovered / rules.length) * 100).toFixed(1)}%)`)
  console.log(`❌ 未覆盖: ${notCovered}`)
  
  const totalCovered = fullyCovered + partiallyCovered
  const coverageRate = (totalCovered / rules.length) * 100
  
  console.log('\n========== 质量评级 ==========')
  if (coverageRate === 100 && partiallyCovered === 0) {
    console.log('🏆 等级：5星 - 完美！所有规则都充分测试')
  } else if (coverageRate >= 95) {
    console.log('⭐⭐⭐⭐ 等级：4星 - 优秀！少量规则需要补充测试')
  } else if (coverageRate >= 85) {
    console.log('⭐⭐⭐ 等级：3星 - 良好，部分规则需要改进')
  } else if (coverageRate >= 70) {
    console.log('⭐⭐ 等级：2星 - 一般，较多规则需要补充测试')
  } else {
    console.log('⭐ 等级：1星 - 需要大幅改进')
  }
}

main()



