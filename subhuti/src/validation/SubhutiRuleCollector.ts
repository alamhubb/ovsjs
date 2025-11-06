/**
 * Subhuti Grammar Validation - 规则收集器
 * 
 * 功能：收集 Parser 中所有规则的 AST 结构
 * 原理：切换到分析模式，执行规则函数并记录调用序列
 * 
 * @version 1.0.0
 */

import type SubhutiParser from "../SubhutiParser"
import type { RuleNode, SequenceNode } from "./SubhutiValidationError"

/**
 * 规则收集器
 * 
 * 职责：
 * 1. 遍历所有 @SubhutiRule 方法
 * 2. 在分析模式下执行（不需要真实tokens）
 * 3. 记录每个规则的调用序列（AST）
 */
export class SubhutiRuleCollector {
    /** 收集到的规则 AST */
    private ruleASTs = new Map<string, RuleNode>()
    
    /** 当前正在记录的规则栈 */
    private currentRuleStack: SequenceNode[] = []
    
    /** 当前规则名称 */
    private currentRuleName: string = ''
    
    /**
     * 收集所有规则
     * 
     * @param parser Parser 实例
     * @returns 规则名称 → AST 的映射
     */
    collectRules(parser: SubhutiParser): Map<string, RuleNode> {
        // 保存原始状态
        const originalMode = (parser as any)._mode
        const originalAnalyzer = (parser as any)._analyzer
        
        try {
            // 切换到分析模式
            (parser as any)._mode = 'analyze'
            ;(parser as any)._analyzer = this
            
            // 获取所有 @SubhutiRule 方法
            const ruleNames = this.getAllRuleNames(parser)
            
            // 遍历执行每个规则
            for (const ruleName of ruleNames) {
                this.collectRule(parser, ruleName)
            }
            
            return this.ruleASTs
        } finally {
            // 恢复原始状态
            ;(parser as any)._mode = originalMode
            ;(parser as any)._analyzer = originalAnalyzer
        }
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
        } catch (error) {
            // 分析模式下的错误可以忽略（规则可能依赖特定状态）
            console.warn(`Failed to collect rule "${ruleName}":`, error)
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
    
    /**
     * 记录节点（由 Parser 在分析模式下调用）
     */
    recordNode(node: RuleNode): void {
        const currentSeq = this.currentRuleStack[this.currentRuleStack.length - 1]
        if (currentSeq) {
            currentSeq.nodes.push(node)
        }
    }
    
    /**
     * 进入嵌套结构（Or/Option/Many/AtLeastOne）
     */
    enterNested(node: SequenceNode): void {
        this.currentRuleStack.push(node)
    }
    
    /**
     * 退出嵌套结构
     */
    exitNested(): RuleNode | undefined {
        return this.currentRuleStack.pop()
    }
    
    /**
     * 获取当前序列节点
     */
    getCurrentSequence(): SequenceNode | undefined {
        return this.currentRuleStack[this.currentRuleStack.length - 1]
    }
}

