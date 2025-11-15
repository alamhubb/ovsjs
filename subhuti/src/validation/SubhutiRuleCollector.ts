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

    /** 是否正在执行顶层规则调用 */
    private isExecutingTopLevelRule: boolean = false
    
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

        const proxy = new Proxy(parser, {
            get(target: any, prop: string | symbol) {
                // if (prop === 'Or' || prop === 'Arguments') {
                //     console.log(`[PROXY] get: ${String(prop)}`)
                // }

                // 拦截核心方法
                if (prop === 'Or') {
                    // console.log(`[PROXY] Intercepting Or`)
                    return (alternatives: Array<{ alt: () => any }>) =>
                        collector.handleOr(alternatives, proxy)
                }
                if (prop === 'Many') {
                    return (fn: () => any) =>
                        collector.handleMany(fn, proxy)
                }
                if (prop === 'Option') {
                    return (fn: () => any) =>
                        collector.handleOption(fn, proxy)
                }
                if (prop === 'AtLeastOne') {
                    return (fn: () => any) =>
                        collector.handleAtLeastOne(fn, proxy)
                }
                // 拦截 consume 和 _consumeToken（兼容两种调用方式）
                if (prop === 'consume' || prop === '_consumeToken') {
                    return (tokenName: string) =>
                        collector.handleConsume(tokenName)
                }

                // 拦截 tokenConsumer，返回代理对象
                if (prop === 'tokenConsumer') {
                    const originalConsumer = Reflect.get(target, prop)
                    return collector.createTokenConsumerProxy(originalConsumer)
                }

                // 拦截子规则调用（以大写字母开头的方法，但排除核心方法）
                const original = Reflect.get(target, prop)
                const coreMethod = ['Or', 'Many', 'Option', 'AtLeastOne', 'consume', '_consumeToken', 'tokenConsumer']
                if (typeof original === 'function' &&
                    typeof prop === 'string' &&
                    /^[A-Z]/.test(prop) &&
                    !coreMethod.includes(prop)) {
                    return function(...args: any[]) {
                        return collector.handleSubrule(prop, original, proxy, args)
                    }
                }

                // 其他属性/方法保持原样
                return original
            }
        })

        return proxy
    }

    /**
     * 创建 TokenConsumer 代理（拦截 token 消费调用）
     */
    private createTokenConsumerProxy(tokenConsumer: any): any {
        const collector = this

        return new Proxy(tokenConsumer, {
            get(target: any, prop: string | symbol) {
                const original = Reflect.get(target, prop)

                // 拦截所有方法调用（除了特殊属性）
                if (typeof original === 'function' && typeof prop === 'string') {
                    return function(...args: any[]) {
                        // 记录 token 消费（方法名即 token 名）
                        collector.handleConsume(prop)

                        // 尝试执行原方法，但捕获异常
                        try {
                            return original.apply(target, args)
                        } catch (error: any) {
                            // 消费失败（缺少token），但我们已经记录了consume调用
                            // 返回undefined，让规则继续执行
                            return undefined
                        }
                    }
                }

                return original
            }
        })
    }
    
    /**
     * 收集单个规则
     */
    private collectRule(proxy: SubhutiParser, ruleName: string): void {
        // 重置状态
        this.currentRuleName = ruleName
        this.currentRuleStack = []
        this.isExecutingTopLevelRule = false

        // 创建根 Sequence 节点
        const rootNode: SequenceNode = {
            type: 'sequence',
            nodes: []
        }
        this.currentRuleStack.push(rootNode)

        try {
            // 执行规则（分析模式下会记录调用）
            // 注意：这里调用proxy的方法，让内部的子规则调用被拦截
            const ruleMethod = (proxy as any)[ruleName]
            if (typeof ruleMethod === 'function') {
                this.isExecutingTopLevelRule = true
                ruleMethod.call(proxy)
                this.isExecutingTopLevelRule = false
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

        // console.log(`[DEBUG] handleOr: ${this.currentRuleName}, alternatives: ${alternatives.length}`)

        for (const alt of alternatives) {
            // 进入新的序列
            const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
            this.currentRuleStack.push(seqNode)

            try {
                // 执行分支（会通过 proxy 拦截）
                alt.alt.call(target)

                // 退出序列，获取结果
                const result = this.currentRuleStack.pop()
                if (result) {
                    // console.log(`[DEBUG] Or branch collected ${result.nodes?.length || 0} nodes`)
                    altNodes.push(result)
                }
            } catch (error: any) {
                // 分支执行失败（可能是缺少token或其他错误）
                // 但我们仍然尝试保存已收集的部分AST
                const result = this.currentRuleStack.pop()
                if (result && result.nodes && result.nodes.length > 0) {
                    // 如果收集到了部分节点，仍然保存
                    // console.log(`[DEBUG] Or branch failed but collected ${result.nodes.length} partial nodes`)
                    altNodes.push(result)
                }
                // 注意：我们不抛出异常，继续处理下一个分支
            }
        }

        // 记录 Or 节点（即使某些分支失败，只要有至少一个分支成功）
        if (altNodes.length > 0) {
            // console.log(`[DEBUG] Recording Or node with ${altNodes.length} alternatives`)
            this.recordNode({ type: 'or', alternatives: altNodes })
        }
    }
    
    /**
     * 处理 Many 规则
     */
    private handleMany(fn: () => any, target: any): void {
        const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
        this.currentRuleStack.push(seqNode)

        try {
            // 执行一次（收集内部结构）
            fn.call(target)

            const innerNode = this.currentRuleStack.pop()
            if (innerNode) {
                this.recordNode({ type: 'many', node: innerNode })
            }
        } catch (error: any) {
            // 执行失败，但仍然尝试保存已收集的部分
            const innerNode = this.currentRuleStack.pop()
            if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) {
                this.recordNode({ type: 'many', node: innerNode })
            }
        }
    }

    /**
     * 处理 Option 规则
     */
    private handleOption(fn: () => any, target: any): void {
        const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
        this.currentRuleStack.push(seqNode)

        try {
            fn.call(target)

            const innerNode = this.currentRuleStack.pop()
            if (innerNode) {
                this.recordNode({ type: 'option', node: innerNode })
            }
        } catch (error: any) {
            // 执行失败，但仍然尝试保存已收集的部分
            const innerNode = this.currentRuleStack.pop()
            if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) {
                this.recordNode({ type: 'option', node: innerNode })
            }
        }
    }

    /**
     * 处理 AtLeastOne 规则
     */
    private handleAtLeastOne(fn: () => any, target: any): void {
        const seqNode: SequenceNode = { type: 'sequence', nodes: [] }
        this.currentRuleStack.push(seqNode)

        try {
            fn.call(target)

            const innerNode = this.currentRuleStack.pop()
            if (innerNode) {
                this.recordNode({ type: 'atLeastOne', node: innerNode })
            }
        } catch (error: any) {
            // 执行失败，但仍然尝试保存已收集的部分
            const innerNode = this.currentRuleStack.pop()
            if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) {
                this.recordNode({ type: 'atLeastOne', node: innerNode })
            }
        }
    }
    
    /**
     * 处理 consume
     */
    private handleConsume(tokenName: string): void {
        this.recordNode({ type: 'consume', tokenName })
    }

    /**
     * 处理子规则调用
     */
    private handleSubrule(ruleName: string, original: Function, target: any, args: any[]): any {
        // 如果是顶层规则调用，不记录为subrule，但要清除标志
        if (this.isExecutingTopLevelRule && ruleName === this.currentRuleName) {
            this.isExecutingTopLevelRule = false
            // 执行原方法
            try {
                return original.apply(target, args)
            } catch (error: any) {
                return undefined
            }
        }

        // 记录子规则调用
        this.recordNode({ type: 'subrule', ruleName })

        // 执行原方法（可能会抛出异常）
        try {
            return original.apply(target, args)
        } catch (error: any) {
            // 子规则执行失败，但我们已经记录了调用
            return undefined
        }
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

