/**
 * Subhuti Error - 简化错误处理系统（v3.0）
 * 
 * 设计理念：
 * - YAGNI：只实现实际需要的功能
 * - 简单优于复杂：一个好的 API 胜过两个平庸的 API
 * - 基于实际需求：删除未使用的 ErrorDiagnoser 和 ErrorFormatter
 * 
 * @version 3.0.0 - 极简重构
 * @date 2025-11-04
 */

import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";

// ============================================
// 核心错误处理
// ============================================

/**
 * 错误详情（平铺结构）
 */
export interface ErrorDetails {
    // 通用字段
    expected: string
    found?: SubhutiMatchToken
    position: {
        tokenIndex: number      // token 数组索引
        charIndex: number       // 字符位置索引
        line: number
        column: number
    }
    ruleStack: string[]
    type?: 'parsing' | 'left-recursion' | 'infinite-loop' | 'or-branch-shadowing'  // 默认 'parsing'

    // Loop 错误专用字段（平铺）
    loopRuleName?: string                 // 循环的规则名
    loopDetectionSet?: string[]           // 循环检测点列表
    loopCstDepth?: number                 // CST 栈深度
    loopCacheStats?: {                    // 缓存统计
        hits: number
        misses: number
        hitRate: string
        currentSize: number
    }
    loopTokenContext?: SubhutiMatchToken[] // Token 上下文

    // 新增：简短的修复提示
    hint?: string

    // 新增：规则路径（格式化后的字符串）
    rulePath?: string

    // 新增：自定义建议（可选，如果提供则使用，否则自动生成）
    suggestions?: string[]
}

/**
 * 解析错误类
 * 
 * 设计理念：
 * - 清晰的视觉层次
 * - 关键信息突出显示
 * - 智能修复建议（只保留最常见的场景）
 * 
 * 参考：Rust compiler error messages
 */
export class ParsingError extends Error {
    readonly expected: string
    readonly found?: SubhutiMatchToken
    readonly position: {
        readonly tokenIndex: number    // token 数组索引
        readonly charIndex: number     // 字符位置索引
        readonly line: number
        readonly column: number
    }
    readonly ruleStack: readonly string[]
    readonly type: 'parsing' | 'left-recursion' | 'infinite-loop'
    
    // Loop 错误专用字段（平铺）
    readonly loopRuleName?: string
    readonly loopDetectionSet?: readonly string[]
    readonly loopCstDepth?: number
    readonly loopCacheStats?: Readonly<{
        hits: number
        misses: number
        hitRate: string
        currentSize: number
    }>
    readonly loopTokenContext?: readonly SubhutiMatchToken[]

    // 新增：简短的修复提示
    readonly hint?: string

    // 新增：规则路径（格式化后的字符串）
    readonly rulePath?: string

    /**
     * ⭐ 智能修复建议（仅 parsing 错误）
     */
    readonly suggestions: readonly string[]
    
    /**
     * 是否启用详细错误信息（仅 parsing 错误使用）
     */
    private readonly useDetailed: boolean
    
    constructor(
        message: string,
        details: ErrorDetails,
        useDetailed: boolean = true
    ) {
        super(message)
        this.name = 'ParsingError'
        this.type = details.type || 'parsing'
        this.expected = details.expected
        this.found = details.found
        this.position = details.position
        this.ruleStack = Object.freeze([...details.ruleStack])
        
        // Loop 错误字段
        this.loopRuleName = details.loopRuleName
        this.loopDetectionSet = details.loopDetectionSet ? Object.freeze([...details.loopDetectionSet]) : undefined
        this.loopCstDepth = details.loopCstDepth
        this.loopCacheStats = details.loopCacheStats
        this.loopTokenContext = details.loopTokenContext ? Object.freeze([...details.loopTokenContext]) : undefined

        // 新增：修复提示
        this.hint = details.hint

        // 新增：规则路径
        this.rulePath = details.rulePath
        
        this.useDetailed = useDetailed

        // 智能建议：优先使用传入的 suggestions，否则自动生成
        if (details.suggestions && details.suggestions.length > 0) {
            this.suggestions = Object.freeze([...details.suggestions])
        } else if (this.type === 'parsing' && useDetailed) {
            this.suggestions = Object.freeze(this.generateSuggestions())
        } else {
            this.suggestions = Object.freeze([])
        }
    }
    
    /**
     * 智能修复建议生成器（简化版）⭐
     * 
     * 只保留最常见的 8 种错误场景：
     * 1. 闭合符号缺失（{} () []）
     * 2. 分号问题
     * 3. 关键字拼写错误
     * 4. 标识符错误
     * 5. EOF 问题
     */
    private generateSuggestions(): string[] {
        const suggestions: string[] = []
        const { expected, found } = this
        
        // 1. 闭合符号缺失
        if (expected === 'RBrace') {
            suggestions.push('💡 可能缺少闭合花括号 }')
        } else if (expected === 'RParen') {
            suggestions.push('💡 可能缺少闭合括号 )')
        } else if (expected === 'RBracket') {
            suggestions.push('💡 可能缺少闭合方括号 ]')
        }
        
        // 2. 分号问题
        else if (expected === 'Semicolon') {
            suggestions.push('💡 可能缺少分号 ;')
        } else if (found?.tokenName === 'Semicolon' && expected !== 'Semicolon') {
            suggestions.push('💡 意外的分号')
        }
        
        // 3. 关键字拼写错误
        else if (expected.endsWith('Tok') && found?.tokenName === 'Identifier') {
            const keyword = expected.replace('Tok', '').toLowerCase()
            suggestions.push(`💡 期望关键字 "${keyword}"，检查是否拼写错误`)
        }
        
        // 4. 标识符相关错误
        else if (expected === 'Identifier') {
            if (found?.tokenName === 'Number') {
                suggestions.push('💡 变量名不能以数字开头')
            } else if (found?.tokenName?.endsWith('Tok')) {
                const keyword = found.tokenName.replace('Tok', '').toLowerCase()
                suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`)
            }
        }
        
        // 5. EOF（文件意外结束）
        if (!found || found.tokenName === 'EOF') {
            suggestions.push('💡 代码意外结束，检查是否有未闭合的括号、花括号或引号')
        }
        
        // 限制建议数量（避免信息过载）
        return suggestions.slice(0, 3)
    }
    
    /**
     * 格式化错误信息（根据类型和模式选择）⭐
     */
    toString(): string {
        // Or 分支遮蔽错误：特殊格式
        if (this.type === 'or-branch-shadowing') {
            return this.toOrBranchShadowingString()
        }

        // 循环错误：只有一种详细格式
        if (this.type === 'left-recursion' || this.type === 'infinite-loop') {
            return this.toLoopDetailedString()
        }
        
        // 解析错误：根据模式选择
        return this.useDetailed ? this.toDetailedString() : this.toSimpleString()
    }
    
    /**
     * 详细格式（Rust 风格 + 智能建议）
     */
    private toDetailedString(): string {
        const lines: string[] = []

        // 标题
        lines.push('❌ Parsing Error')
        lines.push('')

        // 位置信息 - 使用紧凑格式
        lines.push(`Token: token[${this.position.tokenIndex}] ${this.found?.tokenName || 'EOF'} @ line ${this.position.line}:${this.position.column} (char ${this.position.charIndex})`)
        lines.push('')

        // 期望和实际
        lines.push(`Expected: ${this.expected}`)
        lines.push(`Found:    ${this.found?.tokenName || 'EOF'}`)

        // 规则栈（简化显示，最多 5 个）
        if (this.ruleStack.length > 0) {
            lines.push('')
            lines.push('Rule stack:')

            const maxDisplay = 5
            const visible = this.ruleStack.slice(-maxDisplay)
            const hidden = this.ruleStack.length - visible.length

            if (hidden > 0) {
                lines.push(`  ... (${hidden} more)`)
            }

            visible.forEach((rule, i) => {
                const isLast = i === visible.length - 1
                const prefix = isLast ? '└─>' : '├─>'
                lines.push(`  ${prefix} ${rule}`)
            })
        }

        // 智能修复建议
        if (this.suggestions.length > 0) {
            lines.push('')
            lines.push('Suggestions:')
            this.suggestions.forEach(suggestion => {
                lines.push(`  ${suggestion}`)
            })
        }

        return lines.join('\n')
    }
    
    /**
     * 简单格式（基本信息）
     */
    private toSimpleString(): string {
        return `Parsing Error at token[${this.position.tokenIndex}] line ${this.position.line}:${this.position.column}: Expected ${this.expected}, found ${this.found?.tokenName || 'EOF'}`
    }
    
    /**
     * 简洁格式（用于日志）
     */
    toShortString(): string {
        return this.toSimpleString()
    }

    /**
     * 格式化左递归路径（更清晰的显示）
     */
    private formatLeftRecursionPath(lines: string[]): void {
        if (!this.loopRuleName || this.ruleStack.length === 0) {
            return
        }

        // 找到任何重复规则的第一次出现位置
        let firstRecursionIndex = -1
        let recursiveRuleName = this.loopRuleName

        const ruleCounts = new Map<string, number>()
        for (let i = 0; i < this.ruleStack.length; i++) {
            const rule = this.ruleStack[i]
            const count = (ruleCounts.get(rule) || 0) + 1
            ruleCounts.set(rule, count)

            // 找到第一个重复的规则
            if (count === 2 && firstRecursionIndex === -1) {
                firstRecursionIndex = this.ruleStack.indexOf(rule)
                recursiveRuleName = rule
            }
        }

        if (firstRecursionIndex === -1) {
            // 降级：使用普通格式
            lines.push(`  完整调用栈:`)
            this.ruleStack.forEach((rule, i) => {
                lines.push(`    ${i + 1}. ${rule}`)
            })
            return
        }

        // 显示从第一次出现到当前的路径
        const recursionPath = this.ruleStack.slice(firstRecursionIndex)

        // 判断是直接还是间接左递归
        const isDirect = recursionPath.length === 1
        const pathType = isDirect ? '直接左递归' : '间接左递归'

        lines.push(`  类型: ${pathType}`)
        lines.push(`  循环规则: ${recursiveRuleName}`)
        lines.push(`  路径: ${recursionPath.join(' → ')} → ${recursiveRuleName} ⚠️`)
        lines.push('')
        lines.push('  详细调用栈:')

        recursionPath.forEach((rule, i) => {
            const isFirst = i === 0
            const isRecursive = rule === recursiveRuleName
            const marker = isFirst ? ' ← 首次调用' : (isRecursive ? ' ← 循环' : '')
            lines.push(`    ${i + 1}. ${rule}${marker}`)
        })

        lines.push(`    ${recursionPath.length + 1}. ${recursiveRuleName} ⚠️ 循环点`)
    }
    
    /**
     * 循环错误详细格式⭐
     * 
     * 展示信息：
     * - 循环规则名和位置
     * - 当前 token 信息
     * - 完整规则调用栈
     * - 循环检测集合内容
     * - CST 栈深度
     * - 缓存统计（可选）
     * - Token 上下文（可选）
     * - 修复建议
     */
    private toLoopDetailedString(): string {
        const lines: string[] = []

        // 标题
        lines.push(`❌ 检测到${this.type === 'left-recursion' ? '左递归' : '无限循环'}`)
        lines.push('')

        // 核心信息 - 使用紧凑格式
        lines.push(`规则 "${this.loopRuleName}" 在 token[${this.position.tokenIndex}] 处重复调用自己`)
        lines.push(`Token: token[${this.position.tokenIndex}] ${this.found?.tokenName || 'EOF'}("${this.found?.tokenValue || ''}") @ line ${this.position.line}:${this.position.column} (char ${this.position.charIndex})`)
        lines.push('')
        
        // 🆕 规则路径（如果有）
        if (this.rulePath) {
            lines.push('规则路径:')
            lines.push(this.rulePath)
            lines.push('')
        } else if (this.ruleStack.length > 0) {
            // 显示左递归路径
            if (this.type === 'left-recursion') {
                lines.push('左递归路径:')
                this.formatLeftRecursionPath(lines)
                lines.push('')
            } else {
                // 普通规则调用栈
                lines.push('规则调用栈:')
                const maxDisplay = 8
                const visible = this.ruleStack.slice(-maxDisplay)
                const hidden = this.ruleStack.length - visible.length

                if (hidden > 0) {
                    lines.push(`  ... (隐藏 ${hidden} 层)`)
                }

                visible.forEach((rule, i) => {
                    const isLast = i === visible.length - 1
                    const prefix = '  ' + '  '.repeat(i) + (isLast ? '└─>' : '├─>')
                    lines.push(`${prefix} ${rule}`)
                })
                lines.push(`  ${'  '.repeat(visible.length)}└─> ${this.loopRuleName} ⚠️ 循环点`)
                lines.push('')
            }
        }
        
        // 诊断信息
        lines.push('诊断信息:')
        lines.push(`  • CST 栈深度: ${this.loopCstDepth}`)
        
        if (this.loopDetectionSet) {
            lines.push(`  • 循环检测点: ${this.loopDetectionSet.length} 个`)
            
            if (this.loopDetectionSet.length > 0 && this.loopDetectionSet.length <= 10) {
                lines.push(`    ${this.loopDetectionSet.join(', ')}`)
            } else if (this.loopDetectionSet.length > 10) {
                lines.push(`    ${this.loopDetectionSet.slice(0, 10).join(', ')} ...`)
            }
        }
        
        // 缓存统计（可选）
        if (this.loopCacheStats) {
            lines.push(`  • 缓存命中率: ${this.loopCacheStats.hitRate} (${this.loopCacheStats.hits} hits / ${this.loopCacheStats.misses} misses)`)
            lines.push(`  • 缓存大小: ${this.loopCacheStats.currentSize}`)
        }
        
        // Token 上下文（可选）
        if (this.loopTokenContext && this.loopTokenContext.length > 0) {
            lines.push('')
            lines.push('Token 上下文:')
            this.loopTokenContext.forEach((token) => {
                const isCurrent = token === this.found
                const marker = isCurrent ? ' <-- 当前位置' : ''
                lines.push(`  ${token.tokenName}("${token.tokenValue}")${marker}`)
            })
        }
        
        // 显示 hint（如果有）
        if (this.hint) {
            lines.push('💡 提示:')
            lines.push(`  ${this.hint}`)
            lines.push('')
        }
        
        lines.push('')
        // 修复建议
        lines.push('⚠️ PEG 解析器无法直接处理左递归。')
        lines.push('请重构语法以消除左递归。')
        lines.push('')
        lines.push('示例:')
        lines.push('  ❌ 错误:  Expression → Expression \'+\' Term | Term')
        lines.push('  ✅ 正确:  Expression → Term (\'+\' Term)*')
        lines.push('')
        lines.push('常见模式:')
        lines.push('  • 左递归:       A → A \'x\' | \'y\'          →  改为: A → \'y\' (\'x\')*')
        lines.push('  • 间接左递归:   A → B, B → C, C → A      →  需要手动展开或重构')
        lines.push('  • 循环依赖:     A → B, B → A             →  检查是否有空匹配分支')

        return lines.join('\n')
    }

    /**
     * Or 分支遮蔽错误格式化（详细版）
     */
    private toOrBranchShadowingString(): string {
        const lines: string[] = []

        lines.push('')
        lines.push('='.repeat(80))
        lines.push('❌ 检测到 Or 分支遮蔽问题')
        lines.push('='.repeat(80))
        lines.push(`规则 "${this.loopRuleName}" 在 token[${this.position.tokenIndex}] 处重复调用自己`)
        lines.push(`Token: token[${this.position.tokenIndex}] ${this.found?.tokenName}("${this.found?.tokenValue}") @ line ${this.position.line}:${this.position.column}`)
        lines.push('')

        // 规则调用栈
        if (this.ruleStack.length > 0) {
            lines.push('规则调用栈:')
            this.ruleStack.forEach((rule, index) => {
                const marker = index === this.ruleStack.length - 1 ? ' <-- 当前规则' : ''
                lines.push(`  [${index}] ${rule}${marker}`)
            })
            lines.push('')
        }

        // Token 上下文
        if (this.loopTokenContext && this.loopTokenContext.length > 0) {
            lines.push('Token 上下文:')
            this.loopTokenContext.forEach(token => {
                const isCurrent = token === this.found
                const marker = isCurrent ? ' <-- 当前位置' : ''
                lines.push(`  ${token.tokenName}("${token.tokenValue}")${marker}`)
            })
            lines.push('')
        }

        // 显示 hint（如果有）
        if (this.hint) {
            lines.push('💡 提示:')
            lines.push(`  ${this.hint}`)
            lines.push('')
        }

        lines.push('')
        // 修复建议
        lines.push('⚠️ 这不是左递归问题，而是 Or 分支遮蔽问题！')
        lines.push('')
        lines.push('问题原因:')
        lines.push('  在 PEG 中，Or 是顺序选择（Ordered Choice）：')
        lines.push('  - 第一个匹配的分支会立即返回')
        lines.push('  - 如果前面的分支"部分匹配"了输入，后面的分支永远无法尝试')
        lines.push('  - 这导致某些输入无法正确解析')
        lines.push('')
        lines.push('示例:')
        lines.push('  ❌ 错误顺序:')
        lines.push('    LeftHandSideExpression → NewExpression | CallExpression')
        lines.push('    // NewExpression 包含 MemberExpression')
        lines.push('    // CallExpression 也包含 MemberExpression，但还有 Arguments')
        lines.push('    // NewExpression 会先匹配 "console.log"，导致 CallExpression 无法匹配 "console.log(...)"')
        lines.push('')
        lines.push('  ✅ 正确顺序:')
        lines.push('    LeftHandSideExpression → CallExpression | NewExpression')
        lines.push('    // 先尝试更长的规则（CallExpression）')
        lines.push('    // 再尝试更短的规则（NewExpression）')
        lines.push('')
        lines.push('修复方法:')
        lines.push('  1. 调整 Or 分支顺序：将更具体、更长的规则放在前面')
        lines.push('  2. 确保前面的分支不会"遮蔽"后面的分支')
        lines.push('  3. 如果两个分支有包含关系，将"更大"的分支放在前面')

        return lines.join('\n')
    }
}

/**
 * Subhuti 错误处理器
 * 
 * 管理错误创建和格式化
 */
export class SubhutiErrorHandler {
    private enableDetailedErrors: boolean = true
    
    /**
     * 设置是否启用详细错误
     * 
     * @param enable - true: 详细错误（Rust风格+建议），false: 简单错误
     */
    setDetailed(enable: boolean): void {
        this.enableDetailedErrors = enable
    }
    
    /**
     * 创建解析错误
     * 
     * @param details - 错误详情
     * @returns ParsingError 实例
     */
    createError(details: ErrorDetails): ParsingError {
        return new ParsingError(
            `Expected ${details.expected}`,
            details,
            this.enableDetailedErrors
        )
    }
}
