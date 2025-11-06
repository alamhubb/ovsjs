/**
 * 对比 ES2025 语法规范和 Parser 实现
 * 
 * 目标：
 * 1. 找出所有需要调整顺序的规则
 * 2. 验证 Parser 中的顺序是否正确
 */

import * as fs from 'fs'

interface GrammarRule {
    name: string
    alternatives: string[]
    location: string // 在规范中的位置
}

interface ParserRule {
    name: string
    alternatives: {
        index: number
        pattern: string
        tokens: string[]
    }[]
    location: number // 行号
}

class GrammarParserComparator {
    private grammarRules: Map<string, GrammarRule> = new Map()
    private parserRules: Map<string, ParserRule> = new Map()
    
    /**
     * 从 es2025-grammar.md 中提取规则
     */
    parseGrammarFile(filePath: string) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')
        
        let currentRule: GrammarRule | null = null
        let currentSection = ''
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            
            // 检测章节标题
            if (line.startsWith('##')) {
                currentSection = line.replace(/^#+\s*/, '')
                continue
            }
            
            // 检测规则定义（带参数）
            const ruleMatch = line.match(/^(\w+)\[([^\]]+)\]\s*:/)
            if (ruleMatch) {
                if (currentRule) {
                    this.grammarRules.set(currentRule.name, currentRule)
                }
                currentRule = {
                    name: ruleMatch[1],
                    alternatives: [],
                    location: `${currentSection} (line ${i + 1})`
                }
                continue
            }
            
            // 检测简单规则定义
            const simpleRuleMatch = line.match(/^(\w+)\s*:/)
            if (simpleRuleMatch) {
                if (currentRule) {
                    this.grammarRules.set(currentRule.name, currentRule)
                }
                currentRule = {
                    name: simpleRuleMatch[1],
                    alternatives: [],
                    location: `${currentSection} (line ${i + 1})`
                }
                continue
            }
            
            // 收集规则的各个产生式
            if (currentRule && line && !line.startsWith('```')) {
                // 去除前导空格，识别产生式
                if (!line.startsWith('[') && !line.startsWith('//')) {
                    currentRule.alternatives.push(line)
                }
            }
        }
        
        if (currentRule) {
            this.grammarRules.set(currentRule.name, currentRule)
        }
    }
    
    /**
     * 分析哪些规则需要特殊的顺序处理
     */
    analyzeOrderDependentRules() {
        const results: {
            ruleName: string
            reason: string
            grammarAlternatives: string[]
            suggestedOrder: number[]
            conflicts: string[]
        }[] = []
        
        for (const [name, rule] of this.grammarRules) {
            const analysis = this.analyzeRuleOrder(rule)
            if (analysis.hasOrderIssue) {
                results.push({
                    ruleName: name,
                    reason: analysis.reason,
                    grammarAlternatives: rule.alternatives,
                    suggestedOrder: analysis.suggestedOrder,
                    conflicts: analysis.conflicts
                })
            }
        }
        
        return results
    }
    
    /**
     * 分析单个规则是否需要调整顺序
     */
    private analyzeRuleOrder(rule: GrammarRule) {
        const alternatives = rule.alternatives
        const prefixGroups: Map<string, number[]> = new Map()
        const conflicts: string[] = []
        
        // 提取每个产生式的前缀（前几个token）
        const prefixes = alternatives.map((alt, idx) => ({
            index: idx,
            tokens: this.extractTokens(alt)
        }))
        
        // 按前缀分组
        for (const prefix of prefixes) {
            const key = prefix.tokens.slice(0, 3).join(' ')
            if (!prefixGroups.has(key)) {
                prefixGroups.set(key, [])
            }
            prefixGroups.get(key)!.push(prefix.index)
        }
        
        // 检查每组是否有问题
        let hasOrderIssue = false
        const suggestedOrder: number[] = []
        
        for (const [prefix, indices] of prefixGroups) {
            if (indices.length > 1) {
                // 同一前缀有多个产生式 → 需要按长度排序
                hasOrderIssue = true
                
                // 按token数量降序排列
                const sorted = indices.sort((a, b) => {
                    const lenA = prefixes[a].tokens.length
                    const lenB = prefixes[b].tokens.length
                    return lenB - lenA // 长的在前
                })
                
                conflicts.push(
                    `Alternatives with prefix "${prefix}":\n` +
                    sorted.map(idx => 
                        `  [${idx}] ${alternatives[idx].substring(0, 60)}... (${prefixes[idx].tokens.length} tokens)`
                    ).join('\n') +
                    `\n  → Should be ordered: ${sorted.join(' → ')}`
                )
                
                suggestedOrder.push(...sorted)
            } else {
                suggestedOrder.push(indices[0])
            }
        }
        
        return {
            hasOrderIssue,
            reason: hasOrderIssue 
                ? `Multiple alternatives share common prefix`
                : '',
            suggestedOrder,
            conflicts
        }
    }
    
    /**
     * 从产生式中提取 token 序列
     */
    private extractTokens(alternative: string): string[] {
        const tokens: string[] = []
        
        // 简单的 token 提取逻辑
        const parts = alternative.split(/\s+/).filter(p => p.length > 0)
        
        for (const part of parts) {
            // 跳过参数标记
            if (part.startsWith('[')) continue
            
            // 识别终结符（小写开头或特殊符号）
            if (/^[a-z]/.test(part) || /^[^A-Za-z]/.test(part)) {
                tokens.push(part)
            }
            // 识别非终结符（大写开头）
            else if (/^[A-Z]/.test(part)) {
                tokens.push(`<${part}>`)
            }
            
            // 只取前 5 个 token
            if (tokens.length >= 5) break
        }
        
        return tokens
    }
    
    /**
     * 生成分析报告
     */
    generateReport() {
        console.log('=' .repeat(80))
        console.log('ES2025 Grammar → PEG Parser 顺序分析报告')
        console.log('=' .repeat(80))
        console.log()
        
        const orderDependentRules = this.analyzeOrderDependentRules()
        
        console.log(`📊 总规则数: ${this.grammarRules.size}`)
        console.log(`⚠️  需要调整顺序的规则: ${orderDependentRules.length}`)
        console.log()
        
        if (orderDependentRules.length === 0) {
            console.log('✅ 没有发现需要调整顺序的规则！')
            return
        }
        
        console.log('详细分析：')
        console.log('-'.repeat(80))
        
        orderDependentRules.forEach((result, idx) => {
            console.log(`\n${idx + 1}. ${result.ruleName}`)
            console.log(`   原因: ${result.reason}`)
            console.log()
            
            result.conflicts.forEach(conflict => {
                console.log(conflict)
            })
            
            console.log()
        })
        
        // 生成检查清单
        console.log('\n' + '='.repeat(80))
        console.log('🔍 Parser 实现检查清单')
        console.log('='.repeat(80))
        console.log()
        
        orderDependentRules.forEach(result => {
            console.log(`[ ] ${result.ruleName}`)
            console.log(`    位置: ${this.grammarRules.get(result.ruleName)?.location}`)
            console.log(`    建议顺序: ${result.suggestedOrder.join(' → ')}`)
            console.log()
        })
    }
}

// 运行分析
const comparator = new GrammarParserComparator()
comparator.parseGrammarFile('src/language/es2025/es2025-grammar.md')
comparator.generateReport()






