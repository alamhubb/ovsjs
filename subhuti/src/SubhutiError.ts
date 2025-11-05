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
    position: { index: number, line: number, column: number }
    ruleStack: string[]
    type?: 'parsing' | 'loop'             // 默认 'parsing'
    
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
        readonly index: number
        readonly line: number
        readonly column: number
    }
    readonly ruleStack: readonly string[]
    readonly type: 'parsing' | 'loop'
    
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
        
        this.useDetailed = useDetailed
        
        // 仅 parsing 错误生成智能建议
        this.suggestions = (this.type === 'parsing' && useDetailed)
            ? Object.freeze(this.generateSuggestions())
            : Object.freeze([])
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
        // 循环错误：只有一种详细格式
        if (this.type === 'loop') {
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
        
        // 位置信息
        lines.push(`  --> line ${this.position.line}, column ${this.position.column}`)
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
        return `Parsing Error at line ${this.position.line}:${this.position.column}: Expected ${this.expected}, found ${this.found?.tokenName || 'EOF'}`
    }
    
    /**
     * 简洁格式（用于日志）
     */
    toShortString(): string {
        return this.toSimpleString()
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
        lines.push('❌ 检测到无限循环（左递归或循环依赖）')
        lines.push('')
        
        // 核心信息
        lines.push(`规则 "${this.loopRuleName}" 在 token 位置 ${this.position.index} 处重复调用自己`)
        lines.push(`当前 token: ${this.found?.tokenName || 'EOF'}("${this.found?.tokenValue || ''}")`)
        lines.push(`  --> line ${this.position.line}, column ${this.position.column}`)
        lines.push('')
        
        // 规则调用栈
        if (this.ruleStack.length > 0) {
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
