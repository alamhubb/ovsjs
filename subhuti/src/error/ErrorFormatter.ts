/**
 * Parser 错误格式化器
 * 
 * 职责：
 * - 格式化 ParsingError 为不同风格
 * - Rust风格、简洁风格、JSON格式等
 * 
 * 设计理念：
 * - 外置于核心 Parser
 * - 多种格式支持
 * - 可扩展
 */

import type SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"

/**
 * 简化的错误接口
 */
export interface ParseErrorInfo {
    message: string
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
 * 格式化风格
 */
export type ErrorFormatStyle = 'rust' | 'simple' | 'json' | 'compact'

/**
 * 错误格式化器
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
     * ```
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
     * 
     * 格式：Parsing Error at line 23:15: Expected RBrace, found Semicolon
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
            message: error.message,
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
     * 
     * 格式：Error(23:15): Expected RBrace
     */
    formatCompactStyle(error: ParseErrorInfo): string {
        return `Error(${error.position.line}:${error.position.column}): Expected ${error.expected}`
    }
    
    /**
     * 带颜色的格式化（终端）
     * 
     * 需要 ANSI 颜色支持
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


