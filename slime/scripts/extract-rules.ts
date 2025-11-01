// 提取Es6Parser中的所有规则

import * as fs from 'fs'

const parserFile = './packages/slime-parser/src/language/es2015/Es6Parser.ts'
const content = fs.readFileSync(parserFile, 'utf-8')

// 匹配 @SubhutiRule 后面的方法名
const rulePattern = /@SubhutiRule\s+(\w+)\s*\(/g
const rules: string[] = []

let match
while ((match = rulePattern.exec(content)) !== null) {
    rules.push(match[1])
}

console.log(`📊 总共发现 ${rules.length} 个规则\n`)

// 按功能分类（根据规则名称模式）
const categories = {
    expressions: [] as string[],
    statements: [] as string[],
    functions: [] as string[],
    classes: [] as string[],
    modules: [] as string[],
    destructuring: [] as string[],
    operators: [] as string[],
    identifiers: [] as string[],
    literals: [] as string[],
    others: [] as string[]
}

rules.forEach(rule => {
    const lower = rule.toLowerCase()
    
    if (lower.includes('literal') || lower.includes('template')) {
        categories.literals.push(rule)
    } else if (lower.includes('identifier') || lower.includes('binding')) {
        categories.identifiers.push(rule)
    } else if (lower.includes('expression')) {
        categories.expressions.push(rule)
    } else if (lower.includes('statement') || lower.includes('iteration') || 
               lower.includes('if') || lower.includes('for') || 
               lower.includes('while') || lower.includes('switch') ||
               lower.includes('try') || lower.includes('throw') ||
               lower.includes('break') || lower.includes('continue') ||
               lower.includes('return') || lower.includes('with') ||
               lower.includes('debugger')) {
        categories.statements.push(rule)
    } else if (lower.includes('function') || lower.includes('arrow') ||
               lower.includes('generator') || lower.includes('yield') ||
               lower.includes('await') || lower.includes('async')) {
        categories.functions.push(rule)
    } else if (lower.includes('class') || lower.includes('method') ||
               lower.includes('constructor') || lower.includes('heritage')) {
        categories.classes.push(rule)
    } else if (lower.includes('import') || lower.includes('export') ||
               lower.includes('module') || lower.includes('from')) {
        categories.modules.push(rule)
    } else if (lower.includes('pattern') || lower.includes('destructur')) {
        categories.destructuring.push(rule)
    } else if (lower.includes('operator') || lower.includes('binary') ||
               lower.includes('unary') || lower.includes('conditional')) {
        categories.operators.push(rule)
    } else {
        categories.others.push(rule)
    }
})

// 输出分类结果
console.log('📋 规则分类：\n')
Object.entries(categories).forEach(([category, ruleList]) => {
    if (ruleList.length > 0) {
        console.log(`${category.toUpperCase()} (${ruleList.length}个):`)
        ruleList.forEach(rule => console.log(`  - ${rule}`))
        console.log()
    }
})

// 生成测试计划
const testPlan = `# ES6 规则测试计划

**生成时间：** ${new Date().toISOString()}
**规则总数：** ${rules.length}

## 分类统计

| 分类 | 规则数 | 编号范围 |
|------|--------|---------|
| Literals | ${categories.literals.length} | 001-099 |
| Identifiers | ${categories.identifiers.length} | 101-199 |
| Expressions | ${categories.expressions.length} | 201-299 |
| Operators | ${categories.operators.length} | 301-399 |
| Statements | ${categories.statements.length} | 401-499 |
| Functions | ${categories.functions.length} | 501-599 |
| Classes | ${categories.classes.length} | 601-699 |
| Modules | ${categories.modules.length} | 701-799 |
| Destructuring | ${categories.destructuring.length} | 801-899 |
| Others | ${categories.others.length} | 901-999 |

## 详细规则清单

${Object.entries(categories).map(([category, ruleList], catIndex) => {
    if (ruleList.length === 0) return ''
    const baseNumber = (catIndex + 1) * 100
    return `### ${category.charAt(0).toUpperCase() + category.slice(1)} (${ruleList.length}个)

| 编号 | 规则名 | 测试文件 | 状态 |
|------|--------|---------|------|
${ruleList.map((rule, index) => {
    const num = String(baseNumber + index + 1).padStart(3, '0')
    const filename = rule.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)
    return `| ${num} | ${rule} | ${num}-${filename}.js | ⏸️ 待创建 |`
}).join('\n')}
`
}).join('\n')}

## 优先级

### P0 - 高优先级（关键规则，先实现）
- ImportClause（已发现Bug）
- AssignmentExpression（复杂Or规则）
- Statement（多分支）
- Expression（多分支）
- FormalParameterList（复杂规则）

### P1 - 中优先级
- 所有含Or的规则
- 所有模块/类/函数规则

### P2 - 低优先级
- 简单透传规则
- 辅助规则

## 实施状态

- [ ] 创建测试目录结构
- [ ] 实现P0规则测试
- [ ] 实现P1规则测试
- [ ] 实现P2规则测试
- [ ] 创建测试运行器
- [ ] 集成到CI
`

fs.writeFileSync('./tests/es6rules/TEST_PLAN.md', testPlan)
console.log('✅ 测试计划已生成：tests/es6rules/TEST_PLAN.md')


