/**
 * SubhutiGrammarValidator - 语法验证器
 * 
 * 职责：
 * 1. 封装所有语法验证逻辑
 * 2. 管理分析模式
 * 3. 提供简洁的验证 API
 */

import SubhutiCst from "../struct/SubhutiCst";
import {
    SubhutiRuleCollector,
    SubhutiGrammarAnalyzer,
    SubhutiConflictDetector,
    SubhutiGrammarValidationError,
    type ValidationResult
} from "./index";

export class SubhutiGrammarValidator {
    /** 分析器实例 */
    private analyzer?: SubhutiRuleCollector
    
    /** 运行模式 */
    private mode: 'parse' | 'analyze' = 'parse'
    
    /**
     * 生命周期钩子：Parser 创建时调用
     * 开发环境自动验证，有问题直接抛异常
     */
    onParserCreated(parser: any): void {
        this.validate(parser)
    }
    
    /**
     * 验证语法：有问题直接抛异常
     */
    validate(parser: any): void {
        // 1. 收集规则 AST
        const collector = new SubhutiRuleCollector()
        const ruleASTs = collector.collectRules(parser)
        
        // 2. 创建语法分析器
        const analyzer = new SubhutiGrammarAnalyzer(ruleASTs, {
            maxPaths: 10000
        })
        
        // 3. 检测冲突
        const detector = new SubhutiConflictDetector(analyzer, ruleASTs)
        const errors = detector.detectAllConflicts()
        
        // 4. 有错误直接抛出
        if (errors.length > 0) {
            throw new SubhutiGrammarValidationError(errors)
        }
    }
    
    // ============================================
    // 分析模式支持
    // ============================================
    
    /**
     * 进入分析模式
     */
    enterAnalyzeMode(): void {
        this.mode = 'analyze'
        this.analyzer = new SubhutiRuleCollector()
    }
    
    /**
     * 退出分析模式
     */
    exitAnalyzeMode(): void {
        this.mode = 'parse'
        this.analyzer = undefined
    }
    
    /**
     * 检查是否在分析模式
     */
    isAnalyzeMode(): boolean {
        return this.mode === 'analyze'
    }
    
    /**
     * 通知分析器记录节点
     */
    notifyAnalyzer(node: any): void {
        if (this.analyzer) {
            this.analyzer.recordNode(node)
        }
    }
    
    /**
     * 进入嵌套结构
     */
    enterNested(node: any): void {
        this.analyzer?.enterNested(node)
    }
    
    /**
     * 退出嵌套结构
     */
    exitNested(): any {
        return this.analyzer?.exitNested()
    }
    
    // ============================================
    // Or 规则分析
    // ============================================
    
    /**
     * 处理 Or 规则的分析模式
     */
    handleOrAnalyze(alternatives: Array<{ alt: () => any }>, curCst: SubhutiCst | undefined): SubhutiCst | undefined {
        if (this.mode !== 'analyze') {
            return undefined
        }
        
        const altNodes: any[] = []
        
        for (const alt of alternatives) {
            // 进入新的序列
            const seqNode = { type: 'sequence', nodes: [] }
            this.enterNested(seqNode)
            
            // 执行分支（记录调用）
            alt.alt()
            
            // 退出序列，获取结果
            const result = this.exitNested()
            if (result) {
                altNodes.push(result)
            }
        }
        
        // 记录 Or 节点
        this.notifyAnalyzer({ type: 'or', alternatives: altNodes })
        
        return curCst
    }
    
    // ============================================
    // Many 规则分析
    // ============================================
    
    /**
     * 处理 Many 规则的分析模式
     */
    handleManyAnalyze(fn: () => any, curCst: SubhutiCst | undefined): SubhutiCst | undefined {
        if (this.mode !== 'analyze') {
            return undefined
        }
        
        const seqNode = { type: 'sequence', nodes: [] }
        this.enterNested(seqNode)
        fn()
        const innerNode = this.exitNested()
        if (innerNode) {
            this.notifyAnalyzer({ type: 'many', node: innerNode })
        }
        return curCst
    }
    
    // ============================================
    // Option 规则分析
    // ============================================
    
    /**
     * 处理 Option 规则的分析模式
     */
    handleOptionAnalyze(fn: () => any, curCst: SubhutiCst | undefined): SubhutiCst | undefined {
        if (this.mode !== 'analyze') {
            return undefined
        }
        
        const seqNode = { type: 'sequence', nodes: [] }
        this.enterNested(seqNode)
        fn()
        const innerNode = this.exitNested()
        if (innerNode) {
            this.notifyAnalyzer({ type: 'option', node: innerNode })
        }
        return curCst
    }
    
    // ============================================
    // AtLeastOne 规则分析
    // ============================================
    
    /**
     * 处理 AtLeastOne 规则的分析模式
     */
    handleAtLeastOneAnalyze(fn: () => any, curCst: SubhutiCst | undefined): SubhutiCst | undefined {
        if (this.mode !== 'analyze') {
            return undefined
        }
        
        const seqNode = { type: 'sequence', nodes: [] }
        this.enterNested(seqNode)
        fn()
        const innerNode = this.exitNested()
        if (innerNode) {
            this.notifyAnalyzer({ type: 'atLeastOne', node: innerNode })
        }
        return curCst
    }
    
    // ============================================
    // consume 分析
    // ============================================
    
    /**
     * 处理 consume 的分析模式
     */
    handleConsumeAnalyze(tokenName: string, curCst: SubhutiCst | undefined): SubhutiCst | undefined {
        if (this.mode !== 'analyze') {
            return undefined
        }
        
        this.notifyAnalyzer({ type: 'consume', tokenName })
        
        // 创建假 CST（让规则函数继续执行）
        const fakeCst = new SubhutiCst()
        fakeCst.name = tokenName
        
        // 添加到当前 CST
        if (curCst) {
            curCst.children?.push(fakeCst)
        }
        
        return fakeCst
    }
}

