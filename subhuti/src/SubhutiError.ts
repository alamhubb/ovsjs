/**
 * Subhuti Error - 错误处理系统
 * 
 * 包含：
 * - SubhutiErrorHandler + ParsingError: 核心错误处理
 * - ErrorDiagnoser: 智能错误诊断器
 * - ErrorFormatter: 多格式错误格式化器
 * 
 * @version 2.0.0 - 文件合并重构
 * @date 2025-11-04
 */


// ============================================
// [1] SubhutiErrorHandler + ParsingError - 核心错误处理
// ============================================

import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";

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
     */
    private generateSuggestions(): string[] {
        const suggestions: string[] = []
        const { expected, found, ruleStack } = this
        
        // 闭合符号缺失
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
        
        // 分号问题
        if (expected === 'Semicolon') {
            suggestions.push('💡 可能缺少分号 ;')
            suggestions.push('   → 或者上一行语句未正确结束')
        }
        
        if (found?.tokenName === 'Semicolon' && expected !== 'Semicolon') {
            suggestions.push('💡 意外的分号')
            suggestions.push('   → 检查是否多余，或上一行语法错误')
        }
        
        // 关键字拼写错误
        if (expected.endsWith('Tok') && found?.tokenName === 'Identifier') {
            const keyword = expected.replace('Tok', '').toLowerCase()
            const foundValue = found.tokenValue
            suggestions.push(`💡 期望关键字 "${keyword}"，但发现标识符 "${foundValue}"`)
            suggestions.push(`   → 检查是否拼写错误或使用了保留字`)
        }
        
        // 根据规则栈推断上下文
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
        
        // 对象/数组字面量
        if (expected === 'Colon' && ruleStack.some(r => r.includes('Object') || r.includes('Property'))) {
            suggestions.push('💡 对象属性语法：{ key: value }')
            suggestions.push('   → 检查属性名和值之间是否缺少冒号')
        }
        
        if (expected === 'Comma' && ruleStack.some(r => r.includes('Array') || r.includes('Object'))) {
            suggestions.push('💡 多个元素/属性之间需要逗号分隔')
            suggestions.push('   → 或者可能是多余的逗号（尾随逗号）')
        }
        
        // 常见语法错误
        if (expected === 'Identifier' && found?.tokenName === 'Number') {
            suggestions.push('💡 期望标识符，但发现数字')
            suggestions.push('   → 变量名不能以数字开头')
        }
        
        if (expected === 'Identifier' && found?.tokenName?.endsWith('Tok')) {
            const keyword = found.tokenName.replace('Tok', '').toLowerCase()
            suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`)
        }
        
        // EOF（文件结束）
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

// ============================================
// [2] ErrorDiagnoser - 智能错误诊断器
// ============================================

/**
 * 简化的错误接口（不依赖具体类）
 */
export interface ParseErrorInfo {
    expected: string
    found?: SubhutiMatchToken
    position: {
        index: number
        line: number
        column: number
    }
    ruleStack: readonly string[]
}

/**
 * 诊断结果
 */
export interface Diagnosis {
    suggestions: string[]
    relatedRules: string[]
    possibleFixes: string[]
    severity: 'critical' | 'high' | 'medium' | 'low'
}

/**
 * 错误诊断器
 * 
 * 职责：
 * - 分析 ParsingError
 * - 生成智能修复建议
 * - 识别常见错误模式
 */
export class ErrorDiagnoser {
    /**
     * 诊断错误并生成建议
     */
    diagnose(error: ParseErrorInfo): Diagnosis {
        const suggestions: string[] = []
        const relatedRules: string[] = []
        const possibleFixes: string[] = []
        
        const { expected, found, ruleStack } = error
        
        // 闭合符号缺失
        if (expected === 'RBrace') {
            if (found?.tokenName === 'Semicolon') {
                suggestions.push('💡 可能缺少闭合花括号 }')
                suggestions.push('   → 检查是否有未闭合的代码块或对象字面量')
            } else {
                suggestions.push('💡 可能缺少 }')
                suggestions.push('   → 检查对应的 { 位置')
            }
            possibleFixes.push('添加 } 在适当位置')
        }
        
        if (expected === 'RParen') {
            suggestions.push('💡 可能缺少闭合括号 )')
            suggestions.push('   → 检查函数调用或表达式的括号是否匹配')
            possibleFixes.push('添加 ) 在适当位置')
        }
        
        if (expected === 'RBracket') {
            suggestions.push('💡 可能缺少闭合方括号 ]')
            suggestions.push('   → 检查数组字面量或下标访问的括号')
            possibleFixes.push('添加 ] 在适当位置')
        }
        
        // 分号问题
        if (expected === 'Semicolon') {
            suggestions.push('💡 可能缺少分号 ;')
            suggestions.push('   → 或者上一行语句未正确结束')
            possibleFixes.push('添加分号 ;')
        }
        
        if (found?.tokenName === 'Semicolon' && expected !== 'Semicolon') {
            suggestions.push('💡 意外的分号')
            suggestions.push('   → 检查是否多余，或上一行语法错误')
            possibleFixes.push('删除多余的分号')
        }
        
        // 关键字拼写错误
        if (expected.endsWith('Tok') && found?.tokenName === 'Identifier') {
            const keyword = expected.replace('Tok', '').toLowerCase()
            const foundValue = found.tokenValue
            suggestions.push(`💡 期望关键字 "${keyword}"，但发现标识符 "${foundValue}"`)
            suggestions.push(`   → 检查是否拼写错误或使用了保留字`)
            possibleFixes.push(`将 "${foundValue}" 改为 "${keyword}"`)
        }
        
        // 根据规则栈推断上下文
        const lastRule = ruleStack[ruleStack.length - 1]
        
        if (lastRule === 'ImportDeclaration' || ruleStack.includes('ImportDeclaration')) {
            suggestions.push('💡 Import语句语法：')
            suggestions.push('   → import { name } from "module"')
            suggestions.push('   → import name from "module"')
            suggestions.push('   → import * as name from "module"')
            relatedRules.push('ImportDeclaration')
        }
        
        if (lastRule === 'FunctionDeclaration' || ruleStack.includes('FunctionDeclaration')) {
            suggestions.push('💡 函数声明语法：')
            suggestions.push('   → function name(params) { body }')
            relatedRules.push('FunctionDeclaration')
        }
        
        if (lastRule === 'ArrowFunction' || ruleStack.includes('ArrowFunction')) {
            suggestions.push('💡 箭头函数语法：')
            suggestions.push('   → (params) => expression')
            suggestions.push('   → (params) => { statements }')
            relatedRules.push('ArrowFunction')
        }
        
        // 对象/数组字面量
        if (expected === 'Colon' && ruleStack.some(r => r.includes('Object') || r.includes('Property'))) {
            suggestions.push('💡 对象属性语法：{ key: value }')
            suggestions.push('   → 检查属性名和值之间是否缺少冒号')
            possibleFixes.push('在属性名后添加 :')
        }
        
        if (expected === 'Comma' && ruleStack.some(r => r.includes('Array') || r.includes('Object'))) {
            suggestions.push('💡 多个元素/属性之间需要逗号分隔')
            suggestions.push('   → 或者可能是多余的逗号（尾随逗号）')
        }
        
        // 常见语法错误
        if (expected === 'Identifier' && found?.tokenName === 'Number') {
            suggestions.push('💡 期望标识符，但发现数字')
            suggestions.push('   → 变量名不能以数字开头')
            possibleFixes.push('将变量名改为以字母或下划线开头')
        }
        
        if (expected === 'Identifier' && found?.tokenName?.endsWith('Tok')) {
            const keyword = found.tokenName.replace('Tok', '').toLowerCase()
            suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`)
            possibleFixes.push(`使用其他变量名代替 "${keyword}"`)
        }
        
        // EOF（文件结束）
        if (!found || found.tokenName === 'EOF') {
            suggestions.push('💡 代码意外结束')
            suggestions.push('   → 检查是否有未闭合的括号、花括号或引号')
            suggestions.push('   → 文件可能被意外截断')
        }
        
        // 确定严重程度
        const severity = this.determineSeverity(expected, found, ruleStack)
        
        // 限制建议数量（避免信息过载）
        return {
            suggestions: suggestions.slice(0, 5),
            relatedRules,
            possibleFixes,
            severity
        }
    }
    
    /**
     * 确定错误严重程度
     */
    private determineSeverity(
        expected: string,
        found: SubhutiMatchToken | undefined,
        ruleStack: readonly string[]
    ): 'critical' | 'high' | 'medium' | 'low' {
        // 文件意外结束 = 严重
        if (!found || found.tokenName === 'EOF') {
            return 'critical'
        }
        
        // 闭合符号缺失 = 高
        if (['RBrace', 'RParen', 'RBracket'].includes(expected)) {
            return 'high'
        }
        
        // 关键字错误 = 高
        if (expected.endsWith('Tok')) {
            return 'high'
        }
        
        // 标点符号问题 = 中等
        if (['Semicolon', 'Comma', 'Colon'].includes(expected)) {
            return 'medium'
        }
        
        // 其他 = 低
        return 'low'
    }
    
    /**
     * 生成完整的诊断报告（文本格式）
     */
    generateReport(error: ParseErrorInfo): string {
        const diagnosis = this.diagnose(error)
        const lines: string[] = []
        
        lines.push('🔍 错误诊断')
        lines.push('═'.repeat(80))
        
        // 基本信息
        lines.push(`位置: line ${error.position.line}, column ${error.position.column}`)
        lines.push(`期望: ${error.expected}`)
        lines.push(`实际: ${error.found?.tokenName || 'EOF'}`)
        lines.push(`严重程度: ${diagnosis.severity}`)
        lines.push('')
        
        // 规则栈
        if (error.ruleStack.length > 0) {
            lines.push('规则栈:')
            const visible = error.ruleStack.slice(-5)
            const hidden = error.ruleStack.length - visible.length
            if (hidden > 0) {
                lines.push(`  ... (${hidden} more)`)
            }
            visible.forEach((rule, i) => {
                const isLast = i === visible.length - 1
                const prefix = isLast ? '└─>' : '├─>'
                lines.push(`  ${prefix} ${rule}`)
            })
            lines.push('')
        }
        
        // 建议
        if (diagnosis.suggestions.length > 0) {
            lines.push('💡 修复建议:')
            diagnosis.suggestions.forEach(suggestion => {
                lines.push(`  ${suggestion}`)
            })
            lines.push('')
        }
        
        // 可能的修复
        if (diagnosis.possibleFixes.length > 0) {
            lines.push('🔧 可能的修复:')
            diagnosis.possibleFixes.forEach((fix, i) => {
                lines.push(`  ${i + 1}. ${fix}`)
            })
        }
        
        return lines.join('\n')
    }
}

// ============================================
// [3] ErrorFormatter - 错误格式化器
// ============================================

/**
 * 格式化风格
 */
export type ErrorFormatStyle = 'rust' | 'simple' | 'json' | 'compact'

/**
 * 错误格式化器
 * 
 * 职责：
 * - 格式化 ParsingError 为不同风格
 * - Rust风格、简洁风格、JSON格式等
 */
export class ErrorFormatter {
    /**
     * 格式化错误（主方法）
     */
    format(error: ParseErrorInfo, style: ErrorFormatStyle = 'rust'): string {
        switch (style) {
            case 'rust':
                return this.formatRustStyle(error)
            case 'simple':
                return this.formatSimpleStyle(error)
            case 'json':
                return this.formatJsonStyle(error)
            case 'compact':
                return this.formatCompactStyle(error)
            default:
                return this.formatRustStyle(error)
        }
    }
    
    /**
     * Rust 风格格式化（详细、美观）
     */
    formatRustStyle(error: ParseErrorInfo): string {
        const lines: string[] = []
        
        // 标题
        lines.push('❌ Parsing Error')
        lines.push('')
        
        // 位置信息
        lines.push(`  --> line ${error.position.line}, column ${error.position.column}`)
        lines.push('')
        
        // 期望和实际
        lines.push(`Expected: ${error.expected}`)
        lines.push(`Found:    ${error.found?.tokenName || 'EOF'}`)
        
        // 规则栈（简化显示）
        if (error.ruleStack.length > 0) {
            lines.push('')
            lines.push('Rule stack:')
            
            const maxDisplay = 5  // 最多显示 5 个规则
            const visible = error.ruleStack.slice(-maxDisplay)
            const hidden = error.ruleStack.length - visible.length
            
            if (hidden > 0) {
                lines.push(`  ... (${hidden} more)`)
            }
            
            visible.forEach((rule, i) => {
                const isLast = i === visible.length - 1
                const prefix = isLast ? '└─>' : '├─>'
                lines.push(`  ${prefix} ${rule}`)
            })
        }
        
        return lines.join('\n')
    }
    
    /**
     * 简洁风格（单行）
     */
    formatSimpleStyle(error: ParseErrorInfo): string {
        return `Parsing Error at line ${error.position.line}:${error.position.column}: Expected ${error.expected}, found ${error.found?.tokenName || 'EOF'}`
    }
    
    /**
     * JSON 格式（机器可读）
     */
    formatJsonStyle(error: ParseErrorInfo): string {
        const data = {
            error: 'ParsingError',
            expected: error.expected,
            found: error.found ? {
                tokenName: error.found.tokenName,
                tokenValue: error.found.tokenValue,
                index: error.found.index
            } : null,
            position: error.position,
            ruleStack: error.ruleStack
        }
        
        return JSON.stringify(data, null, 2)
    }
    
    /**
     * 紧凑风格（最短）
     */
    formatCompactStyle(error: ParseErrorInfo): string {
        return `Error(${error.position.line}:${error.position.column}): Expected ${error.expected}`
    }
    
    /**
     * 带颜色的格式化（终端）
     */
    formatWithColors(error: ParseErrorInfo): string {
        const lines: string[] = []
        
        // ANSI 颜色代码
        const red = '\x1b[31m'
        const yellow = '\x1b[33m'
        const cyan = '\x1b[36m'
        const reset = '\x1b[0m'
        const bold = '\x1b[1m'
        
        // 标题（红色）
        lines.push(`${red}${bold}❌ Parsing Error${reset}`)
        lines.push('')
        
        // 位置信息（青色）
        lines.push(`${cyan}  --> line ${error.position.line}, column ${error.position.column}${reset}`)
        lines.push('')
        
        // 期望和实际
        lines.push(`${bold}Expected:${reset} ${error.expected}`)
        lines.push(`${bold}Found:${reset}    ${error.found?.tokenName || 'EOF'}`)
        
        // 规则栈（黄色）
        if (error.ruleStack.length > 0) {
            lines.push('')
            lines.push(`${yellow}Rule stack:${reset}`)
            
            const visible = error.ruleStack.slice(-5)
            const hidden = error.ruleStack.length - visible.length
            
            if (hidden > 0) {
                lines.push(`  ... (${hidden} more)`)
            }
            
            visible.forEach((rule, i) => {
                const isLast = i === visible.length - 1
                const prefix = isLast ? '└─>' : '├─>'
                lines.push(`  ${prefix} ${rule}`)
            })
        }
        
        return lines.join('\n')
    }
    
    /**
     * 格式化为 Markdown（文档友好）
     */
    formatMarkdown(error: ParseErrorInfo): string {
        const lines: string[] = []
        
        lines.push('## ❌ Parsing Error')
        lines.push('')
        lines.push(`**Location:** line ${error.position.line}, column ${error.position.column}`)
        lines.push('')
        lines.push(`**Expected:** \`${error.expected}\``)
        lines.push(`**Found:** \`${error.found?.tokenName || 'EOF'}\``)
        lines.push('')
        
        if (error.ruleStack.length > 0) {
            lines.push('**Rule Stack:**')
            lines.push('```')
            error.ruleStack.forEach(rule => {
                lines.push(`  ${rule}`)
            })
            lines.push('```')
        }
        
        return lines.join('\n')
    }
}



