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
 * 错误详情
 */
export interface ErrorDetails {
    expected: string
    found?: SubhutiMatchToken
    position: { index: number, line: number, column: number }
    ruleStack: string[]
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
    
    /**
     * ⭐ 智能修复建议（简化版）
     * 
     * 只覆盖最常见的 8 种错误场景
     */
    readonly suggestions: readonly string[]
    
    /**
     * 是否启用详细错误信息
     */
    private readonly useDetailed: boolean
    
    constructor(
        message: string,
        details: ErrorDetails,
        useDetailed: boolean = true
    ) {
        super(message)
        this.name = 'ParsingError'
        this.expected = details.expected
        this.found = details.found
        this.position = details.position
        this.ruleStack = Object.freeze([...details.ruleStack])
        this.useDetailed = useDetailed
        
        // 详细模式才生成智能建议
        this.suggestions = useDetailed 
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
     * 格式化错误信息（根据模式选择详细或简单）⭐
     */
    toString(): string {
        if (this.useDetailed) {
            return this.toDetailedString()
        } else {
            return this.toSimpleString()
        }
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
