// 为所有规则生成测试模板

import * as fs from 'fs'
import * as path from 'path'

const parserFile = './packages/slime-parser/src/language/es2015/Es6Parser.ts'
const content = fs.readFileSync(parserFile, 'utf-8')
const lines = content.split('\n')

// 提取规则及其内容
interface Rule {
    name: string
    lineNumber: number
    content: string[]
}

const rules: Rule[] = []
let currentRule: Rule | null = null
let braceCount = 0
let inRule = false

lines.forEach((line, index) => {
    // 检测@SubhutiRule
    if (line.trim().startsWith('@SubhutiRule')) {
        // 下一行应该是方法名
        const nextLine = lines[index + 1]
        const match = nextLine?.match(/(\w+)\s*\(/)
        if (match) {
            currentRule = {
                name: match[1],
                lineNumber: index + 2,
                content: []
            }
            inRule = false
        }
    }
    
    // 记录规则内容
    if (currentRule && !inRule) {
        if (line.includes('{')) {
            inRule = true
            braceCount = 1
            currentRule.content.push(line)
        }
    } else if (currentRule && inRule) {
        currentRule.content.push(line)
        braceCount += (line.match(/{/g) || []).length
        braceCount -= (line.match(/}/g) || []).length
        
        if (braceCount === 0) {
            rules.push(currentRule)
            currentRule = null
            inRule = false
        }
    }
})

console.log(`📊 提取了 ${rules.length} 个规则\n`)

// 规则分类映射
const categoryMap: Record<string, {dir: string, prefix: string}> = {
    literals: {dir: '01-literals', prefix: '0'},
    identifiers: {dir: '02-identifiers', prefix: '1'},
    expressions: {dir: '03-expressions', prefix: '2'},
    operators: {dir: '04-operators', prefix: '3'},
    statements: {dir: '05-statements', prefix: '4'},
    functions: {dir: '06-functions', prefix: '5'},
    classes: {dir: '07-classes', prefix: '6'},
    modules: {dir: '08-modules', prefix: '7'},
    destructuring: {dir: '09-destructuring', prefix: '8'},
    others: {dir: '10-others', prefix: '9'}
}

// 分类规则
function categorizeRule(ruleName: string): string {
    const lower = ruleName.toLowerCase()
    
    if (lower.includes('literal') || lower.includes('template')) return 'literals'
    if (lower.includes('identifier') || lower.includes('binding')) return 'identifiers'
    if (lower.includes('expression')) return 'expressions'
    if (lower.includes('operator') || lower.includes('binary') || lower.includes('unary') || lower.includes('conditional')) return 'operators'
    if (lower.includes('statement') || lower.includes('iteration') || lower.includes('if') || lower.includes('for') || lower.includes('while') || lower.includes('switch') || lower.includes('try') || lower.includes('throw') || lower.includes('break') || lower.includes('continue') || lower.includes('return') || lower.includes('with') || lower.includes('debugger')) return 'statements'
    if (lower.includes('function') || lower.includes('arrow') || lower.includes('generator') || lower.includes('yield') || lower.includes('await') || lower.includes('async')) return 'functions'
    if (lower.includes('class') || lower.includes('method') || lower.includes('constructor') || lower.includes('heritage')) return 'classes'
    if (lower.includes('import') || lower.includes('export') || lower.includes('module') || lower.includes('from')) return 'modules'
    if (lower.includes('pattern') || lower.includes('destructur')) return 'destructuring'
    return 'others'
}

// 分析规则内容，提取Or分支
function analyzeRule(rule: Rule): string[] {
    const content = rule.content.join('\n')
    const insights: string[] = []
    
    // 检测Or规则
    if (content.includes('this.Or([')) {
        const orMatch = content.match(/this\.Or\(\[([\s\S]*?)\]\)/g)
        if (orMatch) {
            insights.push(`✓ 包含Or规则（${orMatch.length}处）`)
        }
    }
    
    // 检测Option
    if (content.includes('this.Option(')) {
        const optionMatches = content.match(/this\.Option\(/g)
        insights.push(`✓ 包含Option（${optionMatches?.length || 0}处）`)
    }
    
    // 检测Many
    if (content.includes('this.Many(')) {
        const manyMatches = content.match(/this\.Many\(/g)
        insights.push(`✓ 包含Many（${manyMatches?.length || 0}处）`)
    }
    
    return insights
}

// 生成测试模板
function generateTestTemplate(rule: Rule, category: string, index: number): string {
    const insights = analyzeRule(rule)
    const categoryInfo = categoryMap[category]
    const testNumber = `${categoryInfo.prefix}${String(index + 1).padStart(2, '0')}`
    const fileName = rule.name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)
    
    return `/**
 * 规则测试：${rule.name}
 * 
 * 位置：Es6Parser.ts Line ${rule.lineNumber}
 * 分类：${category}
 * 编号：${testNumber}
 * 
 * 规则特征：
${insights.map(i => ` * ${i}`).join('\n') || ' * 简单规则'}
 * 
 * 测试目标：
 * - 验证规则的基本功能
${insights.some(i => i.includes('Or')) ? ' * - 覆盖所有Or分支' : ''}
${insights.some(i => i.includes('Option')) ? ' * - 测试Option的有无两种情况' : ''}
${insights.some(i => i.includes('Many')) ? ' * - 测试Many的0/1/多种情况' : ''}
 * 
 * 创建时间：${new Date().toISOString().split('T')[0]}
 * 状态：⏸️ 待完善
 */

// TODO: 添加测试用例
// 从简单到复杂编写测试代码

// ✅ 测试1：基本用法
// 示例代码

// ✅ 测试2：边界情况
// 示例代码

// ✅ 测试3：复杂场景
// 示例代码
`
}

// 按分类组织规则
const categorized: Record<string, Rule[]> = {}
rules.forEach(rule => {
    const category = categorizeRule(rule.name)
    if (!categorized[category]) {
        categorized[category] = []
    }
    categorized[category].push(rule)
})

// 生成测试文件
let totalGenerated = 0
Object.entries(categorized).forEach(([category, ruleList]) => {
    const categoryInfo = categoryMap[category]
    if (!categoryInfo) return
    
    const dirPath = `./tests/es6rules/${categoryInfo.dir}`
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
    
    ruleList.forEach((rule, index) => {
        const testNumber = `${categoryInfo.prefix}${String(index + 1).padStart(2, '0')}`
        const fileName = rule.name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)
        const filePath = path.join(dirPath, `${testNumber}-${fileName}.js`)
        
        // 只生成不存在的文件
        if (!fs.existsSync(filePath)) {
            const template = generateTestTemplate(rule, category, index)
            fs.writeFileSync(filePath, template)
            totalGenerated++
        }
    })
    
    console.log(`✅ ${category}: 生成 ${ruleList.length} 个测试文件`)
})

console.log(`\n🎉 共生成 ${totalGenerated} 个测试模板文件`)
console.log(`📁 目录：tests/es6rules/`)


