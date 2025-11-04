/**
 * SubhutiParser 调试数据可视化器（极简版）
 * 
 * 职责：
 * - 格式化调试数据
 * - 生成可读的报告
 * 
 * 设计理念：
 * - 完全独立，不依赖 Parser
 * - 基于简单数据结构
 * - 多种格式输出
 */

import type SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import type SubhutiCst from "../struct/SubhutiCst.ts"

/**
 * 调试数据类型（与 SubhutiParser 中的定义一致）
 */
export interface DebugData {
    ruleExecutions: Array<{
        type: 'enter' | 'exit'
        ruleName: string
        tokenIndex: number
        timestamp: number
        success?: boolean
    }>
    orBranches: Array<{
        ruleName: string
        totalBranches: number
        successBranch?: number
        tokenIndex: number
    }>
    tokenConsumes: Array<{
        tokenName: string
        tokenIndex: number
        success: boolean
    }>
    startTime: number
    endTime: number
}

/**
 * 可视化选项
 */
export interface VisualizerOptions {
    mode?: 'timeline' | 'or-branches' | 'token-compare' | 'full'
    maxDepth?: number
    highlightRules?: string[]
    showTimestamps?: boolean
    showTokenIndex?: boolean
}

/**
 * SubhutiParser 可视化器
 */
export class SubhutiVisualizer {
    /**
     * 生成完整报告
     */
    static generateReport(
        data: DebugData,
        tokens: SubhutiMatchToken[],
        cst: SubhutiCst | undefined,
        options: VisualizerOptions = {}
    ): string {
        const {
            mode = 'full',
            maxDepth = Infinity,
            highlightRules = [],
            showTimestamps = false,
            showTokenIndex = true
        } = options
        
        const lines: string[] = []
        
        lines.push('═'.repeat(80))
        lines.push('🔍 SubhutiParser 调试报告')
        lines.push('═'.repeat(80))
        lines.push('')
        
        // 总体统计
        lines.push(...this.generateSummary(data, tokens, cst))
        lines.push('')
        
        // 根据模式生成不同部分
        if (mode === 'timeline' || mode === 'full') {
            lines.push(...this.generateTimeline(data, { maxDepth, highlightRules, showTimestamps, showTokenIndex }))
            lines.push('')
        }
        
        if (mode === 'or-branches' || mode === 'full') {
            lines.push(...this.generateOrBranchesReport(data))
            lines.push('')
        }
        
        if (mode === 'token-compare' || mode === 'full') {
            lines.push(...this.generateTokenComparison(tokens, data.tokenConsumes, cst))
            lines.push('')
        }
        
        return lines.join('\n')
    }
    
    /**
     * 生成总体统计
     */
    private static generateSummary(
        data: DebugData,
        tokens: SubhutiMatchToken[],
        cst: SubhutiCst | undefined
    ): string[] {
        const lines: string[] = []
        const duration = data.endTime - data.startTime
        
        lines.push('📊 总体统计')
        lines.push('─'.repeat(80))
        lines.push(`  解析耗时:     ${duration.toFixed(2)}ms`)
        lines.push(`  输入Token数:  ${tokens.length}`)
        lines.push(`  规则执行数:   ${data.ruleExecutions.length / 2}`)  // 除以2因为有 enter 和 exit
        lines.push(`  Or分支数:     ${data.orBranches.length}`)
        lines.push(`  Token消费数:  ${data.tokenConsumes.length}`)
        lines.push(`  解析状态:     ${cst ? '✅ 成功' : '❌ 失败'}`)
        
        return lines
    }
    
    /**
     * 生成规则执行时间线
     */
    static generateTimeline(
        data: DebugData,
        options: Partial<VisualizerOptions> = {}
    ): string[] {
        const lines: string[] = []
        const { maxDepth = Infinity, highlightRules = [], showTimestamps = false, showTokenIndex = true } = options
        
        lines.push('📍 规则执行时间线')
        lines.push('═'.repeat(80))
        
        // 计算深度
        let currentDepth = 0
        
        for (const exec of data.ruleExecutions) {
            if (exec.type === 'exit') currentDepth--
            
            if (currentDepth >= maxDepth) {
                if (exec.type === 'enter') currentDepth++
                continue
            }
            
            const indent = '  '.repeat(currentDepth)
            const timestamp = showTimestamps ? `[${(exec.timestamp - data.startTime).toFixed(1)}ms]` : ''
            const tokenIdx = showTokenIndex ? `[${exec.tokenIndex}]` : ''
            const highlight = highlightRules.includes(exec.ruleName) ? '🔍' : ''
            
            if (exec.type === 'enter') {
                lines.push(`${indent}${timestamp}${tokenIdx} → ${highlight}${exec.ruleName}`)
                currentDepth++
            } else {
                const status = exec.success ? '✅' : '❌'
                lines.push(`${indent}${timestamp}${tokenIdx} ${status} ${highlight}${exec.ruleName}`)
            }
        }
        
        return lines
    }
    
    /**
     * 生成 Or 分支选择报告
     */
    static generateOrBranchesReport(data: DebugData): string[] {
        const lines: string[] = []
        
        lines.push('🔀 Or 分支选择分析')
        lines.push('═'.repeat(80))
        
        if (data.orBranches.length === 0) {
            lines.push('  （没有 Or 规则执行）')
            return lines
        }
        
        for (const orBranch of data.orBranches) {
            lines.push('')
            lines.push(`📌 ${orBranch.ruleName} @ token[${orBranch.tokenIndex}]`)
            lines.push(`   总分支数: ${orBranch.totalBranches}`)
            
            if (orBranch.successBranch !== undefined) {
                lines.push(`   ✅ 成功分支: ${orBranch.successBranch}`)
            } else {
                lines.push(`   ❌ 所有分支都失败`)
            }
        }
        
        return lines
    }
    
    /**
     * 生成 Token 对比报告
     */
    static generateTokenComparison(
        inputTokens: SubhutiMatchToken[],
        tokenConsumes: Array<{ tokenName: string; tokenIndex: number; success: boolean }>,
        cst: SubhutiCst | undefined
    ): string[] {
        const lines: string[] = []
        
        lines.push('🔍 Token 完整性检查')
        lines.push('═'.repeat(80))
        
        // 过滤掉注释和空白
        const meaningfulTokens = inputTokens.filter((t: any) => {
            const tokenName = t.tokenType?.name || t.tokenName || ''
            return tokenName !== 'SingleLineComment' &&
                tokenName !== 'MultiLineComment' &&
                tokenName !== 'Spacing' &&
                tokenName !== 'LineBreak'
        })
        
        // 收集 CST 中的 token
        const cstTokens = cst ? this.collectCSTTokens(cst) : []
        
        // 对比
        lines.push(`输入 Token 数: ${meaningfulTokens.length}`)
        lines.push(`CST Token 数:  ${cstTokens.length}`)
        lines.push(`消费尝试数:    ${tokenConsumes.length}`)
        lines.push(`消费成功数:    ${tokenConsumes.filter(t => t.success).length}`)
        lines.push('')
        
        // 详细对比
        lines.push('详细对比:')
        const missing: string[] = []
        
        for (let i = 0; i < meaningfulTokens.length; i++) {
            const inputToken = meaningfulTokens[i]
            const tokenValue = (inputToken as any).tokenValue || ''
            const found = cstTokens.includes(tokenValue)
            const status = found ? '✅' : '❌'
            
            if (!found) {
                missing.push(tokenValue)
            }
            
            lines.push(`  [${i}] ${status} "${tokenValue}"`)
        }
        
        if (missing.length > 0) {
            lines.push('')
            lines.push(`⚠️  丢失的 Token (${missing.length}个):`)
            missing.forEach(token => {
                lines.push(`     ❌ "${token}"`)
            })
        } else {
            lines.push('')
            lines.push('✅ 所有 Token 都已保留！')
        }
        
        return lines
    }
    
    /**
     * 收集 CST 中的所有 token 值
     */
    private static collectCSTTokens(node: SubhutiCst): string[] {
        const tokens: string[] = []
        
        if (node.value !== undefined && (!node.children || node.children.length === 0)) {
            tokens.push(node.value)
        }
        
        if (node.children) {
            for (const child of node.children) {
                tokens.push(...this.collectCSTTokens(child))
            }
        }
        
        return tokens
    }
    
    /**
     * 生成简洁报告（单行）
     */
    static generateShortReport(
        data: DebugData,
        tokens: SubhutiMatchToken[],
        cst: SubhutiCst | undefined
    ): string {
        const duration = data.endTime - data.startTime
        const status = cst ? '✅' : '❌'
        const ruleCount = data.ruleExecutions.length / 2
        const orCount = data.orBranches.length
        const tokenCount = data.tokenConsumes.filter(t => t.success).length
        
        return `${status} Parse ${duration.toFixed(2)}ms | ${ruleCount} rules | ${orCount} ors | ${tokenCount} tokens consumed | ${tokens.length} tokens total`
    }
}
