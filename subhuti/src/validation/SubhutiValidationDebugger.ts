/**
 * Subhuti Validation Debugger - 语法验证调试器（完全无侵入版）
 * 
 * 设计理念：
 * - 类似 SubhutiTraceDebugger，提供完整的验证过程追踪
 * - 完全独立：不修改 Parser 核心代码
 * - 两种使用方式：独立调用 或 钩子模式
 * 
 * 功能：
 * - ✅ 规则收集追踪（哪些规则被收集）
 * - ✅ 路径计算追踪（每个规则生成了哪些路径）
 * - ✅ 冲突检测追踪（哪些分支被比较）
 * - ✅ 路径可视化（树形结构）
 * - ✅ 统计信息（规则数、路径数、耗时等）
 * - ✅ 错误详细说明（为什么冲突、如何修复）
 * 
 * 使用方式1：独立调用（完全无侵入）
 * ```typescript
 * const parser = new MyParser()
 * const debugger = new SubhutiValidationDebugger()
 * 
 * // 执行调试（自动输出详细报告）
 * const result = debugger.debug(parser)
 * ```
 * 
 * 使用方式2：钩子模式（轻量侵入，需要 Parser 传递 debug 选项）
 * ```typescript
 * const parser = new MyParser()
 * const debugger = new SubhutiValidationDebugger()
 * 
 * // Parser 会在验证完成后调用 debugger.onValidationComplete()
 * const result = parser.validateGrammar({ debug: debugger })
 * ```
 * 
 * @version 1.0.0
 * @date 2025-11-06
 */

import type { SubhutiGrammarAnalyzer } from "./SubhutiGrammarAnalyzer"
import type { SubhutiRuleCollector } from "./SubhutiRuleCollector"
import type { 
    ValidationError, 
    RuleNode, 
    Path,
    ValidateOptions 
} from "./SubhutiValidationError"

// ============================================
// 类型定义
// ============================================

/**
 * 调试事件类型
 */
export interface DebugEvent {
    type: 'rule-collect' | 'path-compute' | 'conflict-detect' | 'error-found'
    timestamp: number
    data: any
}

/**
 * 规则统计信息
 */
export interface RuleDebugInfo {
    ruleName: string
    /** AST 节点数量 */
    astNodeCount: number
    /** 生成的路径数量 */
    pathCount: number
    /** 最长路径长度 */
    maxPathLength: number
    /** 路径计算耗时（ms） */
    pathComputeTime: number
    /** 是否有冲突 */
    hasConflict: boolean
}

/**
 * 冲突详细信息
 */
export interface ConflictDebugInfo {
    error: ValidationError
    /** 冲突的具体位置（第几个token） */
    conflictPosition: number
    /** 分支A的完整路径列表 */
    branchAPaths: Path[]
    /** 分支B的完整路径列表 */
    branchBPaths: Path[]
    /** 路径差异分析 */
    pathDiff: {
        common: string[]  // 公共部分
        onlyA: string[]   // 只在A中
        onlyB: string[]   // 只在B中
    }
}

// ============================================
// SubhutiValidationDebugger - 验证调试器
// ============================================

export class SubhutiValidationDebugger {
    // ========================================
    // 追踪数据
    // ========================================
    private events: DebugEvent[] = []
    private ruleInfos = new Map<string, RuleDebugInfo>()
    private conflictInfos: ConflictDebugInfo[] = []
    
    // ========================================
    // 统计数据
    // ========================================
    private stats = {
        totalRules: 0,
        collectedRules: 0,
        totalPaths: 0,
        totalConflicts: 0,
        fatalErrors: 0,
        warnings: 0,
        collectTime: 0,
        analyzeTime: 0,
        detectTime: 0,
        totalTime: 0
    }
    
    // ========================================
    // 配置选项
    // ========================================
    private options = {
        /** 是否输出规则收集过程 */
        traceCollect: true,
        /** 是否输出路径计算过程 */
        traceCompute: true,
        /** 是否输出冲突检测过程 */
        traceDetect: true,
        /** 是否显示路径详情 */
        showPaths: true,
        /** 路径显示数量上限 */
        maxPathsToShow: 10,
        /** 是否自动输出报告 */
        autoOutput: true
    }
    
    /**
     * 配置调试选项
     */
    configure(options: Partial<typeof this.options>): this {
        Object.assign(this.options, options)
        return this
    }
    
    // ========================================
    // 公开 API
    // ========================================
    
    /**
     * 钩子方法：验证完成后调用（轻量侵入模式）
     * 
     * Parser 会在 validateGrammar() 完成后调用此方法
     * 
     * @param ruleASTs 收集到的规则 AST
     * @param errors 检测到的错误
     */
    onValidationComplete(ruleASTs: Map<string, RuleNode>, errors: ValidationError[]): void {
        // 记录数据
        this.stats.collectedRules = ruleASTs.size
        this.stats.totalRules = ruleASTs.size
        this.stats.totalConflicts = errors.length
        this.stats.fatalErrors = errors.filter(e => e.level === 'FATAL').length
        this.stats.warnings = errors.filter(e => e.level === 'ERROR').length
        
        // 创建语法分析器并计算路径
        const { SubhutiGrammarAnalyzer } = require('./SubhutiGrammarAnalyzer')
        const analyzer = new SubhutiGrammarAnalyzer(ruleASTs, { maxPaths: 100 })
        
        let totalPaths = 0
        
        // 收集规则信息并计算路径
        for (const [ruleName, ast] of ruleASTs) {
            const nodeCount = this.countASTNodes(ast)
            const paths = analyzer.computePaths(ruleName)
            totalPaths += paths.length
            
            this.ruleInfos.set(ruleName, {
                ruleName,
                astNodeCount: nodeCount,
                pathCount: paths.length,
                maxPathLength: Math.max(...paths.map(p => this.countTokens(p)), 0),
                pathComputeTime: 0,
                hasConflict: false
            })
        }
        
        this.stats.totalPaths = totalPaths
        
        // 标记有冲突的规则
        for (const error of errors) {
            const info = this.ruleInfos.get(error.ruleName)
            if (info) {
                info.hasConflict = true
            }
        }
        
        // 输出简化报告
        console.log('\n' + '='.repeat(80))
        console.log('🔍 Subhuti Grammar Validation Debug')
        console.log('='.repeat(80))
        console.log(`\n✓ 收集了 ${ruleASTs.size} 个规则`)
        console.log(`✓ 计算了 ${totalPaths.toLocaleString()} 条路径`)
        console.log(`✓ 发现 ${errors.length} 个冲突`)
        
        if (errors.length > 0) {
            this.outputReport(errors)
        }
        
        console.log('='.repeat(80))
    }
    
    /**
     * 调试完整的验证流程（独立调用，完全无侵入）
     * 
     * @param parser Parser 实例
     * @param validateOptions 验证选项
     * @returns 验证结果
     */
    debug(parser: any, validateOptions?: ValidateOptions): { success: boolean; errors: ValidationError[] } {
        const startTime = performance.now()
        
        console.log('\n' + '='.repeat(80))
        console.log('🔍 Subhuti Grammar Validation Debug')
        console.log('='.repeat(80))
        
        try {
            // 步骤1：规则收集
            console.log('\n【步骤 1：规则收集】')
            console.log('─'.repeat(80))
            const { SubhutiRuleCollector } = require('./SubhutiRuleCollector')
            const collector = new SubhutiRuleCollector()
            
            const collectStart = performance.now()
            const ruleASTs = this.instrumentCollector(collector, parser)
            this.stats.collectTime = performance.now() - collectStart
            
            console.log(`✓ 收集完成：${ruleASTs.size} 个规则，耗时 ${this.stats.collectTime.toFixed(2)}ms`)
            
            // 步骤2：路径计算
            console.log('\n【步骤 2：路径计算】')
            console.log('─'.repeat(80))
            const { SubhutiGrammarAnalyzer } = require('./SubhutiGrammarAnalyzer')
            const analyzer = new SubhutiGrammarAnalyzer(ruleASTs, {
                maxPaths: validateOptions?.maxPaths || 100
            })
            
            const analyzeStart = performance.now()
            this.instrumentAnalyzer(analyzer, ruleASTs)
            this.stats.analyzeTime = performance.now() - analyzeStart
            
            console.log(`✓ 计算完成：${this.stats.totalPaths} 条路径，耗时 ${this.stats.analyzeTime.toFixed(2)}ms`)
            
            // 步骤3：冲突检测
            console.log('\n【步骤 3：冲突检测】')
            console.log('─'.repeat(80))
            const { SubhutiConflictDetector } = require('./SubhutiConflictDetector')
            const detector = new SubhutiConflictDetector(analyzer, ruleASTs)
            
            const detectStart = performance.now()
            const errors = this.instrumentDetector(detector, ruleASTs)
            this.stats.detectTime = performance.now() - detectStart
            
            this.stats.totalConflicts = errors.length
            this.stats.fatalErrors = errors.filter(e => e.level === 'FATAL').length
            this.stats.warnings = errors.filter(e => e.level === 'ERROR').length
            
            console.log(`✓ 检测完成：${errors.length} 个冲突，耗时 ${this.stats.detectTime.toFixed(2)}ms`)
            
            // 总耗时
            this.stats.totalTime = performance.now() - startTime
            
            // 自动输出报告
            if (this.options.autoOutput) {
                this.outputReport(errors)
            }
            
            // 返回验证结果
            return {
                success: errors.length === 0,
                errors: errors
            }
        } catch (error: any) {
            console.error('\n❌ 验证调试失败:', error.message)
            throw error
        }
    }
    
    // ========================================
    // 追踪方法（注入到各个组件）
    // ========================================
    
    /**
     * 注入规则收集器（追踪收集过程）
     */
    private instrumentCollector(collector: any, parser: any): Map<string, RuleNode> {
        if (this.options.traceCollect) {
            console.log('开始收集规则...\n')
        }
        
        const ruleASTs = collector.collectRules(parser)
        
        this.stats.collectedRules = ruleASTs.size
        this.stats.totalRules = ruleASTs.size
        
        if (this.options.traceCollect) {
            console.log('\n收集到的规则：')
            let index = 1
            for (const [ruleName, ast] of ruleASTs) {
                const nodeCount = this.countASTNodes(ast)
                console.log(`  ${index}. ${ruleName} (${nodeCount} 个节点)`)
                
                // 记录规则信息
                this.ruleInfos.set(ruleName, {
                    ruleName,
                    astNodeCount: nodeCount,
                    pathCount: 0,
                    maxPathLength: 0,
                    pathComputeTime: 0,
                    hasConflict: false
                })
                
                index++
            }
        }
        
        return ruleASTs
    }
    
    /**
     * 注入语法分析器（追踪路径计算）
     */
    private instrumentAnalyzer(analyzer: SubhutiGrammarAnalyzer, ruleASTs: Map<string, RuleNode>): void {
        if (this.options.traceCompute) {
            console.log('开始计算路径...\n')
        }
        
        let totalPaths = 0
        
        for (const ruleName of ruleASTs.keys()) {
            const start = performance.now()
            const paths = analyzer.computePaths(ruleName)
            const duration = performance.now() - start
            
            totalPaths += paths.length
            
            // 更新规则信息
            const info = this.ruleInfos.get(ruleName)
            if (info) {
                info.pathCount = paths.length
                info.maxPathLength = Math.max(...paths.map(p => this.countTokens(p)))
                info.pathComputeTime = duration
            }
            
            if (this.options.traceCompute) {
                console.log(
                    `  ${ruleName}: ${paths.length} 条路径 ` +
                    `(最长 ${this.countTokens(paths[0] || '')} tokens, ${duration.toFixed(2)}ms)`
                )
                
                // 显示前几条路径
                if (this.options.showPaths && paths.length > 0) {
                    const showCount = Math.min(paths.length, this.options.maxPathsToShow)
                    for (let i = 0; i < showCount; i++) {
                        const path = paths[i]
                        const tokens = path === '' ? '(空路径)' : path.replace(/,/g, ' → ').slice(0, -3)
                        console.log(`    [${i}] ${tokens}`)
                    }
                    
                    if (paths.length > showCount) {
                        console.log(`    ... 还有 ${paths.length - showCount} 条路径`)
                    }
                    console.log('')
                }
            }
        }
        
        this.stats.totalPaths = totalPaths
    }
    
    /**
     * 注入冲突检测器（追踪检测过程）
     */
    private instrumentDetector(detector: any, ruleASTs: Map<string, RuleNode>): ValidationError[] {
        if (this.options.traceDetect) {
            console.log('开始检测冲突...\n')
        }
        
        const errors = detector.detectAllConflicts()
        
        if (this.options.traceDetect) {
            if (errors.length === 0) {
                console.log('  ✓ 未发现冲突')
            } else {
                console.log(`  ✗ 发现 ${errors.length} 个冲突:\n`)
                
                errors.forEach((error: ValidationError, index: number) => {
                    console.log(`  [${index + 1}] ${error.ruleName} - ${error.message}`)
                    console.log(`      类型: ${error.type}`)
                    console.log(`      分支: [${error.branchIndices.join(', ')}]`)
                    console.log(`      路径A: ${this.formatPath(error.conflictPaths.pathA)}`)
                    console.log(`      路径B: ${this.formatPath(error.conflictPaths.pathB)}`)
                    console.log(`      建议: ${error.suggestion}`)
                    console.log('')
                    
                    // 标记规则有冲突
                    const info = this.ruleInfos.get(error.ruleName)
                    if (info) {
                        info.hasConflict = true
                    }
                })
            }
        }
        
        return errors
    }
    
    // ========================================
    // 输出报告
    // ========================================
    
    /**
     * 输出完整调试报告
     */
    private outputReport(errors: ValidationError[]): void {
        console.log('\n' + '='.repeat(80))
        console.log('📊 验证调试报告')
        console.log('='.repeat(80))
        
        // ========================================
        // 第一部分：总体统计
        // ========================================
        console.log('\n【第一部分：总体统计】')
        console.log('─'.repeat(80))
        console.log('\n⏱️  性能统计')
        console.log(`  总耗时: ${this.stats.totalTime.toFixed(2)}ms`)
        console.log(`    - 规则收集: ${this.stats.collectTime.toFixed(2)}ms (${(this.stats.collectTime / this.stats.totalTime * 100).toFixed(1)}%)`)
        console.log(`    - 路径计算: ${this.stats.analyzeTime.toFixed(2)}ms (${(this.stats.analyzeTime / this.stats.totalTime * 100).toFixed(1)}%)`)
        console.log(`    - 冲突检测: ${this.stats.detectTime.toFixed(2)}ms (${(this.stats.detectTime / this.stats.totalTime * 100).toFixed(1)}%)`)
        
        console.log('\n📋 规则统计')
        console.log(`  总规则数: ${this.stats.totalRules}`)
        console.log(`  已收集: ${this.stats.collectedRules}`)
        console.log(`  总路径数: ${this.stats.totalPaths.toLocaleString()}`)
        console.log(`  平均路径/规则: ${(this.stats.totalPaths / this.stats.collectedRules).toFixed(1)}`)
        
        console.log('\n⚠️  冲突统计')
        console.log(`  总冲突数: ${this.stats.totalConflicts}`)
        console.log(`  致命错误: ${this.stats.fatalErrors}`)
        console.log(`  警告: ${this.stats.warnings}`)
        
        // ========================================
        // 第二部分：规则详情
        // ========================================
        console.log('\n【第二部分：规则详情】')
        console.log('─'.repeat(80))
        
        // Top 5 路径最多的规则
        const topPathRules = Array.from(this.ruleInfos.values())
            .sort((a, b) => b.pathCount - a.pathCount)
            .slice(0, 5)
        
        console.log('\n📈 路径最多的规则（Top 5）:')
        topPathRules.forEach((info, i) => {
            const conflictMark = info.hasConflict ? '⚠️ ' : '✓ '
            console.log(
                `  ${i + 1}. ${conflictMark}${info.ruleName}: ${info.pathCount.toLocaleString()} 条路径 ` +
                `(最长 ${info.maxPathLength} tokens, ${info.pathComputeTime.toFixed(2)}ms)`
            )
        })
        
        // 有冲突的规则
        const conflictRules = Array.from(this.ruleInfos.values())
            .filter(info => info.hasConflict)
        
        if (conflictRules.length > 0) {
            console.log('\n⚠️  有冲突的规则:')
            conflictRules.forEach((info, i) => {
                console.log(
                    `  ${i + 1}. ${info.ruleName}: ${info.pathCount} 条路径, ` +
                    `AST ${info.astNodeCount} 个节点`
                )
            })
        }
        
        // ========================================
        // 第三部分：冲突详情
        // ========================================
        if (errors.length > 0) {
            console.log('\n【第三部分：冲突详情】')
            console.log('─'.repeat(80))
            
            errors.forEach((error, index) => {
                console.log(`\n🔴 冲突 ${index + 1}/${errors.length}`)
                console.log('─'.repeat(40))
                console.log(`规则: ${error.ruleName}`)
                console.log(`类型: ${error.type}`)
                console.log(`级别: ${error.level}`)
                console.log(`分支: [${error.branchIndices.join(', ')}]`)
                console.log(`\n问题: ${error.message}`)
                console.log(`\n路径对比:`)
                console.log(`  分支 ${error.branchIndices[0]}: ${this.formatPath(error.conflictPaths.pathA)}`)
                console.log(`  分支 ${error.branchIndices[1]}: ${this.formatPath(error.conflictPaths.pathB)}`)
                
                // 分析冲突原因
                const analysis = this.analyzeConflict(error)
                console.log(`\n原因分析:`)
                console.log(`  ${analysis}`)
                
                console.log(`\n修复建议:`)
                console.log(`  ${error.suggestion}`)
            })
        }
        
        // ========================================
        // 结尾
        // ========================================
        console.log('\n' + '='.repeat(80))
        console.log('🎉 验证调试完成')
        console.log('='.repeat(80))
    }
    
    // ========================================
    // 辅助方法
    // ========================================
    
    /**
     * 计算 AST 节点数量
     */
    private countASTNodes(node: RuleNode): number {
        switch (node.type) {
            case 'consume':
            case 'subrule':
                return 1
            
            case 'sequence':
                return 1 + node.nodes.reduce((sum, n) => sum + this.countASTNodes(n), 0)
            
            case 'or':
                return 1 + node.alternatives.reduce((sum, n) => sum + this.countASTNodes(n), 0)
            
            case 'option':
            case 'many':
            case 'atLeastOne':
                return 1 + this.countASTNodes(node.node)
            
            default:
                return 0
        }
    }
    
    /**
     * 计算路径中的 token 数量
     */
    private countTokens(path: Path): number {
        if (path === '') return 0
        return (path.match(/,/g) || []).length
    }
    
    /**
     * 格式化路径（用于显示）
     */
    private formatPath(path: Path): string {
        if (path === '') {
            return '(空路径)'
        }
        
        if (path.startsWith('<')) {
            return path  // 特殊标记，直接返回
        }
        
        // 'Token1,Token2,' → 'Token1 → Token2'
        return path.replace(/,/g, ' → ').slice(0, -3)
    }
    
    /**
     * 分析冲突原因
     */
    private analyzeConflict(error: ValidationError): string {
        if (error.type === 'empty-path') {
            return `分支 ${error.branchIndices[0]} 可以匹配空输入（0个token），` +
                   `导致后续所有分支（包括分支 ${error.branchIndices[1]}）都不可达。` +
                   `这通常是由 Option() 或 Many() 引起的。`
        }
        
        if (error.type === 'prefix-conflict') {
            const pathA = error.conflictPaths.pathA
            const pathB = error.conflictPaths.pathB
            const tokensA = this.countTokens(pathA)
            const tokensB = this.countTokens(pathB)
            
            return `分支 ${error.branchIndices[0]} 的路径（${tokensA} tokens）是 ` +
                   `分支 ${error.branchIndices[1]} 路径（${tokensB} tokens）的前缀。` +
                   `这意味着当输入匹配前 ${tokensA} 个token时，Parser会优先选择分支 ${error.branchIndices[0]}，` +
                   `导致分支 ${error.branchIndices[1]} 永远不会被尝试。`
        }
        
        return '未知冲突类型'
    }
    
    /**
     * 获取统计信息（供外部使用）
     */
    getStats() {
        return { ...this.stats }
    }
    
    /**
     * 获取规则信息（供外部使用）
     */
    getRuleInfos() {
        return new Map(this.ruleInfos)
    }
    
    /**
     * 清除所有数据
     */
    clear(): void {
        this.events = []
        this.ruleInfos.clear()
        this.conflictInfos = []
        this.stats = {
            totalRules: 0,
            collectedRules: 0,
            totalPaths: 0,
            totalConflicts: 0,
            fatalErrors: 0,
            warnings: 0,
            collectTime: 0,
            analyzeTime: 0,
            detectTime: 0,
            totalTime: 0
        }
    }
}

