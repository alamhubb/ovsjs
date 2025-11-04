/**
 * Subhuti 错误处理器
 * 
 * 提供两种错误级别：
 * - 详细模式：Rust风格格式 + 智能修复建议（默认）
 * - 简单模式：基本错误信息
 * 
 * @version 1.0.0
 * @date 2025-11-04
 */

import SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"

// ============================================
// [1] 类型定义
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

// ============================================
// [2] ParsingError 类（支持简单/详细模式）
// ============================================

/**
 * 解析错误类
 * 
 * 设计理念：
 * - 清晰的视觉层次
 * - 关键信息突出显示
 * - 便于快速定位问题
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
     * ⭐ 智能修复建议
     * 
     * 根据错误上下文自动生成的修复建议
     * - 基于期望/实际token
     * - 基于规则栈
     * - 基于常见错误模式
     */
    readonly suggestions: readonly string[]
    
    /**
     * 是否启用详细错误信息
     */
    private readonly useDetailed: boolean
    
    constructor(
        message: string,
        details: ErrorDetails,
        useDetailed: boolean = true  // ⭐ 默认启用详细模式
    ) {
        super(message)
        this.name = 'ParsingError'
        this.expected = details.expected
        this.found = details.found
        this.position = details.position
        this.ruleStack = Object.freeze([...details.ruleStack])
        this.useDetailed = useDetailed
        
        // ⭐ 详细模式才生成智能建议
        this.suggestions = useDetailed 
            ? Object.freeze(this.generateSuggestions())
            : Object.freeze([])
    }
    
    /**
     * 智能修复建议生成器 ⭐⭐⭐
     * 
     * 根据以下信息生成建议：
     * 1. expected vs found（期望vs实际）
     * 2. ruleStack（解析上下文）
     * 3. 常见错误模式
     * 
     * 设计理念：
     * - 优先最可能的原因
     * - 提供具体的修复方法
     * - 最多3-5条建议（避免信息过载）
     */
    private generateSuggestions(): string[] {
        const suggestions: string[] = []
        const { expected, found, ruleStack } = this
        
        // ========================================
        // 规则1：闭合符号缺失
        // ========================================
        if (expected === 'RBrace') {
            if (found?.tokenName === 'Semicolon') {
                suggestions.push('💡 可能缺少闭合花括号 }')
                suggestions.push('   → 检查是否有未闭合的代码块或对象字面量')
            } else {
                suggestions.push('💡 可能缺少 }')
                suggestions.push('   → 检查对应的 { 位置')
            }
        }
        
        if (expected === 'RParen') {
            suggestions.push('💡 可能缺少闭合括号 )')
            suggestions.push('   → 检查函数调用或表达式的括号是否匹配')
        }
        
        if (expected === 'RBracket') {
            suggestions.push('💡 可能缺少闭合方括号 ]')
            suggestions.push('   → 检查数组字面量或下标访问的括号')
        }
        
        // ========================================
        // 规则2：分号问题
        // ========================================
        if (expected === 'Semicolon') {
            suggestions.push('💡 可能缺少分号 ;')
            suggestions.push('   → 或者上一行语句未正确结束')
        }
        
        if (found?.tokenName === 'Semicolon' && expected !== 'Semicolon') {
            suggestions.push('💡 意外的分号')
            suggestions.push('   → 检查是否多余，或上一行语法错误')
        }
        
        // ========================================
        // 规则3：关键字拼写错误
        // ========================================
        if (expected.endsWith('Tok') && found?.tokenName === 'Identifier') {
            const keyword = expected.replace('Tok', '').toLowerCase()
            const foundValue = found.tokenValue
            suggestions.push(`💡 期望关键字 "${keyword}"，但发现标识符 "${foundValue}"`)
            suggestions.push(`   → 检查是否拼写错误或使用了保留字`)
        }
        
        // ========================================
        // 规则4：根据规则栈推断上下文
        // ========================================
        const lastRule = ruleStack[ruleStack.length - 1]
        
        if (lastRule === 'ImportDeclaration' || ruleStack.includes('ImportDeclaration')) {
            suggestions.push('💡 Import语句语法：')
            suggestions.push('   → import { name } from "module"')
            suggestions.push('   → import name from "module"')
            suggestions.push('   → import * as name from "module"')
        }
        
        if (lastRule === 'FunctionDeclaration' || ruleStack.includes('FunctionDeclaration')) {
            suggestions.push('💡 函数声明语法：')
            suggestions.push('   → function name(params) { body }')
        }
        
        if (lastRule === 'ArrowFunction' || ruleStack.includes('ArrowFunction')) {
            suggestions.push('💡 箭头函数语法：')
            suggestions.push('   → (params) => expression')
            suggestions.push('   → (params) => { statements }')
        }
        
        // ========================================
        // 规则5：对象/数组字面量
        // ========================================
        if (expected === 'Colon' && ruleStack.some(r => r.includes('Object') || r.includes('Property'))) {
            suggestions.push('💡 对象属性语法：{ key: value }')
            suggestions.push('   → 检查属性名和值之间是否缺少冒号')
        }
        
        if (expected === 'Comma' && ruleStack.some(r => r.includes('Array') || r.includes('Object'))) {
            suggestions.push('💡 多个元素/属性之间需要逗号分隔')
            suggestions.push('   → 或者可能是多余的逗号（尾随逗号）')
        }
        
        // ========================================
        // 规则6：常见语法错误
        // ========================================
        if (expected === 'Identifier' && found?.tokenName === 'Number') {
            suggestions.push('💡 期望标识符，但发现数字')
            suggestions.push('   → 变量名不能以数字开头')
        }
        
        if (expected === 'Identifier' && found?.tokenName?.endsWith('Tok')) {
            const keyword = found.tokenName.replace('Tok', '').toLowerCase()
            suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`)
        }
        
        // ========================================
        // 规则7：EOF（文件结束）
        // ========================================
        if (!found || found.tokenName === 'EOF') {
            suggestions.push('💡 代码意外结束')
            suggestions.push('   → 检查是否有未闭合的括号、花括号或引号')
            suggestions.push('   → 文件可能被意外截断')
        }
        
        // 限制建议数量（避免信息过载）
        return suggestions.slice(0, 5)
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
     * 
     * 格式：
     * ```
     * ❌ Parsing Error
     * 
     *   --> line 23, column 15
     * 
     * Expected: RBrace
     * Found:    Semicolon
     * 
     * Rule stack:
     *   ... (5 more)
     *   ├─> Statement
     *   ├─> BlockStatement
     *   └─> Block
     * 
     * Suggestions:
     *   💡 可能缺少闭合花括号 }
     *      → 检查是否有未闭合的代码块或对象字面量
     *   💡 检查对应的 { 位置
     * ```
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
        
        // 规则栈（简化显示）
        if (this.ruleStack.length > 0) {
            lines.push('')
            lines.push('Rule stack:')
            
            const maxDisplay = 5  // 最多显示 5 个规则
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
        
        // ⭐ 智能修复建议
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
     * 
     * 格式：
     * ```
     * Parsing Error at line 23:15
     * Expected: RBrace
     * Found: Semicolon
     * ```
     */
    private toSimpleString(): string {
        const lines: string[] = []
        
        lines.push(`Parsing Error at line ${this.position.line}:${this.position.column}`)
        lines.push(`Expected: ${this.expected}`)
        lines.push(`Found: ${this.found?.tokenName || 'EOF'}`)
        
        return lines.join('\n')
    }
    
    /**
     * 简洁格式（用于日志）
     */
    toShortString(): string {
        return `Parsing Error at line ${this.position.line}:${this.position.column}: Expected ${this.expected}, found ${this.found?.tokenName || 'EOF'}`
    }
}

// ============================================
// [3] SubhutiErrorHandler 类
// ============================================

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
            this.enableDetailedErrors  // ⭐ 传入详细模式开关
        )
    }
}

