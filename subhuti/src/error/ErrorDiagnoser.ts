/**
 * Parser 错误智能诊断器
 * 
 * 职责：
 * - 分析 ParsingError
 * - 生成智能修复建议
 * - 识别常见错误模式
 * 
 * 设计理念：
 * - 外置于核心 Parser
 * - 基于错误数据分析
 * - 可扩展的规则系统
 */

import type SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"

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
        
        // ========================================
        // 规则2：分号问题
        // ========================================
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
        
        // ========================================
        // 规则3：关键字拼写错误
        // ========================================
        if (expected.endsWith('Tok') && found?.tokenName === 'Identifier') {
            const keyword = expected.replace('Tok', '').toLowerCase()
            const foundValue = found.tokenValue
            suggestions.push(`💡 期望关键字 "${keyword}"，但发现标识符 "${foundValue}"`)
            suggestions.push(`   → 检查是否拼写错误或使用了保留字`)
            possibleFixes.push(`将 "${foundValue}" 改为 "${keyword}"`)
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
        
        // ========================================
        // 规则5：对象/数组字面量
        // ========================================
        if (expected === 'Colon' && ruleStack.some(r => r.includes('Object') || r.includes('Property'))) {
            suggestions.push('💡 对象属性语法：{ key: value }')
            suggestions.push('   → 检查属性名和值之间是否缺少冒号')
            possibleFixes.push('在属性名后添加 :')
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
            possibleFixes.push('将变量名改为以字母或下划线开头')
        }
        
        if (expected === 'Identifier' && found?.tokenName?.endsWith('Tok')) {
            const keyword = found.tokenName.replace('Tok', '').toLowerCase()
            suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`)
            possibleFixes.push(`使用其他变量名代替 "${keyword}"`)
        }
        
        // ========================================
        // 规则7：EOF（文件结束）
        // ========================================
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


