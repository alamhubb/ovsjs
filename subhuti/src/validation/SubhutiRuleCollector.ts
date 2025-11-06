/**
 * Subhuti Grammar Validation - 规则收集器
 * 
 * 功能：收集 Parser 中所有规则的 AST 结构
 * 原理：使用 Proxy 拦截 Parser 方法调用，记录调用序列
 * 
 * @version 2.0.0 - Proxy 方案（零侵入）
 */

import type SubhutiParser from "../SubhutiParser"
import type { RuleNode, SequenceNode } from "./SubhutiValidationError"

/**
 * 规则收集器
 * 
 * 职责：
 * 1. 创建 Parser 的 Proxy 代理
 * 2. 拦截 Or/Many/Option/AtLeastOne/consume 方法调用
 * 3. 记录调用序列形成 AST
 * 
 * 优势：
 * - Parser 代码完全干净，无需任何验证相关代码
 * - 验证逻辑完全独立，易于维护
 * - 生产环境零性能开销
 */
export class SubhutiRuleCollector {
    /** 收集到的规则 AST */
    private ruleASTs = new Map<string, RuleNode>()
    
    /** 当前正在记录的规则栈 */
    private currentRuleStack: SequenceNode[] = []
    
    /** 当前规则名称 */
    private currentRuleName: string = ''
    
    /**
     * 收集所有规则 - 静态方法
     * 
     * @param parser Parser 实例
     * @returns 规则名称 → AST 的映射
     */
    static collectRules(parser: SubhutiParser): Map<string, RuleNode> {
        const collector = new SubhutiRuleCollector()
        return collector.collect(parser)
    }
    
    /**
     * 收集所有规则（私有实现）
     */
    private collect(parser: SubhutiParser): Map<string, RuleNode> {
        // 创建代理，拦截方法调用
        const proxy = this.createAnalyzeProxy(parser)
        
        // 获取所有 @SubhutiRule 方法
        const ruleNames = this.getAllRuleNames(parser)
        
        // 遍历执行每个规则
        for (const ruleName of ruleNames) {
            this.collectRule(proxy, ruleName)
        }
        
        return this.ruleASTs
    }
    
    /**
     * 创建分析代理（拦截 Parser 方法调用）
     */
    private createAnalyzeProxy(parser: SubhutiParser): SubhutiParser {
        const collector = this
        
        return new Proxy(parser, {
            get(target: any, prop: string | symbol) {
                // 拦截核心方法
                if (prop === 'Or') {
                    return (alternatives: Array<{ alt: () => any }>) => 
                        collector.handleOr(alternatives, target)
                }
                if (prop === 'Many') {
                    return (fn: () => any) => 
                        collector.handleMany(fn, target)
                }
                if (prop === 'Option') {
                    return (fn: () => any) => 
                        collector.handleOption(fn, target)
                }
                if (prop === 'AtLeastOne') {
                    return (fn: () => any) => 
                        collector.handleAtLeastOne(fn, target)
                }
                if (prop === 'consume') {
                    return (tokenName: string) => 
                        collector.handleConsume(tokenName)
                }
                
                // 其他属性/方法保持原样
                return Reflect.get(target, prop)
            }
        })
    }
    
    /**
     * 收集单个规则
     */
    private collectRule(parser: SubhutiParser, ruleName: string): void {
        // 重置状态
        this.currentRuleName = ruleName
        this.currentRuleStack = []
        
        // 创建根 Sequence 节点
        const rootNode: SequenceNode = {
            type: 'sequence',
            nodes: []
        }
        this.currentRuleStack.push(rootNode)
        
        try {
            // 执行规则（分析模式下会记录调用）
            const ruleMethod = (parser as any)[ruleName]
            if (typeof ruleMethod === 'function') {
                ruleMethod.call(parser)
            }
            
            // 保存 AST（简化：如果只有一个子节点，直接返回子节点）
            if (rootNode.nodes.length === 1) {
                this.ruleASTs.set(ruleName, rootNode.nodes[0])
            } else {
                this.ruleASTs.set(ruleName, rootNode)
            }
        } catch (error: any) {
            // 特殊处理：循环错误（左递归/右递归）
            if (error?.type === 'loop') {
                // 递归是预期情况，保存已收集的部分AST
                if (rootNode.nodes.length > 0) {
                    // 有部分AST，保存它
                    this.ruleASTs.set(ruleName, rootNode)
                    console.info(`✓ Rule "${ruleName}" contains recursion, saved partial AST (${rootNode.nodes.length} nodes)`)
                } else {
                    // 没收集到任何东西，标记为递归规则
                    console.info(`✓ Rule "${ruleName}" contains direct recursion, skipped`)
                    // 不保存AST（返回空）
                }
            } else {
                // 其他错误才是真正的失败
                console.warn(`✗ Failed to collect rule "${ruleName}":`, error?.message || error)
            }
        }
    }
    
    /**
     * 获取所有规则名称
     */
    private getAllRuleNames(parser: SubhutiParser): string[] {
        const ruleNames: string[] = []
        const prototype = Object.getPrototypeOf(parser)
        
        // 遍历原型链上的所有方法
        for (const key of Object.getOwnPropertyNames(prototype)) {
            if (key === 'constructor') continue
            
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key)
            if (descriptor && typeof descriptor.value === 'function') {
                // 检查是否是 @SubhutiRule 装饰的方法
                // （装饰后的方法会有特殊标记，或者我们简单地认为所有方法都是规则）
                ruleNames.push(key)
            }
        }
        
        return ruleNames
    }
    
    // ============================================
    // Proxy 拦截方法
    // ============================================
    
    /**
     * 处理 Or 规则
     */
    private handleOr(alternatives: Array<{ alt: () => any }>, target: any): void {
        const altNodes: any[] = []
        
        for (const alt of alternatives) {
            // 进入新的序列
            const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
            this.currentRuleStack.push(seqNode)
            
            // 执行分支（会通过 proxy 拦截）
            alt.alt.call(target)
            
            // 退出序列，获取结果
            const result = this.currentRuleStack.pop()
            if (result) {
                altNodes.push(result)
            }
        }
        
        // 记录 Or 节点
        this.recordNode({ type: 'or', alternatives: altNodes })
    }
    
    /**
     * 处理 Many 规则
     */
    private handleMany(fn: () => any, target: any): void {
        const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
        this.currentRuleStack.push(seqNode)
        
        // 执行一次（收集内部结构）
        fn.call(target)
        
        const innerNode = this.currentRuleStack.pop()
        if (innerNode) {
            this.recordNode({ type: 'many', node: innerNode })
        }
    }
    
    /**
     * 处理 Option 规则
     */
    private handleOption(fn: () => any, target: any): void {
        const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
        this.currentRuleStack.push(seqNode)
        
        fn.call(target)
        
        const innerNode = this.currentRuleStack.pop()
        if (innerNode) {
            this.recordNode({ type: 'option', node: innerNode })
        }
    }
    
    /**
     * 处理 AtLeastOne 规则
     */
    private handleAtLeastOne(fn: () => any, target: any): void {
        const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
        this.currentRuleStack.push(seqNode)
        
        fn.call(target)
        
        const innerNode = this.currentRuleStack.pop()
        if (innerNode) {
            this.recordNode({ type: 'atLeastOne', node: innerNode })
        }
    }
    
    /**
     * 处理 consume
     */
    private handleConsume(tokenName: string): void {
        this.recordNode({ type: 'consume', tokenName })
    }
    
    /**
     * 记录节点到当前序列
     */
    private recordNode(node: RuleNode): void {
        const currentSeq = this.currentRuleStack[this.currentRuleStack.length - 1]
        if (currentSeq) {
            currentSeq.nodes.push(node)
        }
    }
}

