/**
 * Subhuti Grammar Validation - 规则收集器
 *
 * 功能：收集 Parser 中所有规则的 AST 结构
 *
 * 实现方案：使用双层Proxy拦截Parser方法调用，记录规则结构
 *
 * 核心原理：
 * 1. **Parser Proxy**：拦截规则方法调用（Or/Many/Option/AtLeastOne/子规则）
 * 2. **TokenConsumer Proxy**：拦截token消费调用（LParen/RParen/Identifier等）
 * 3. **双层Proxy的必要性**：
 *    - tokenConsumer是独立对象，不是Parser的方法
 *    - 规则内部通过this.tokenConsumer.XXX()消费token
 *    - 如果只有Parser Proxy，无法拦截tokenConsumer的方法调用
 *
 * 关键改进（相比初始版本）：
 * 1. ✅ 同时拦截consume和_consumeToken（兼容两种调用方式）
 * 2. ✅ 代理tokenConsumer对象（拦截所有token消费）
 * 3. ✅ 拦截子规则调用（记录subrule节点）
 * 4. ✅ 修复this绑定问题（所有handler使用proxy而不是target）
 * 5. ✅ 使用分析模式（Parser不抛异常，避免用异常控制流程）
 *
 * 收集到的AST用途：
 * - 提供给SubhutiGrammarAnalyzer计算路径（展开subrule为实际token序列）
 * - 提供给SubhutiConflictDetector检测Or分支冲突（基于token路径的前缀检测）
 *
 * @version 3.0.0 - 使用分析模式，不再依赖异常处理
 */

import type SubhutiParser from "../SubhutiParser"
import type {ConsumeNode, RuleNode, SequenceNode} from "./SubhutiValidationError"

/**
 * 规则收集器
 *
 * 职责：
 * 1. 启用 Parser 的分析模式（不抛异常）
 * 2. 创建 Parser 的 Proxy 代理
 * 3. 拦截 Or/Many/Option/AtLeastOne/consume 方法调用
 * 4. 记录调用序列形成 AST
 *
 * 优势：
 * - Parser 代码完全干净，无需任何验证相关代码
 * - 验证逻辑完全独立，易于维护
 * - 生产环境零性能开销
 * - 不使用异常控制流程，性能更好
 */
export class SubhutiRuleCollector {
    /** 收集到的规则 AST */
    private ruleASTs = new Map<string, SequenceNode>()


    private tokenAstCache = new Map<string, ConsumeNode>()

    /** 当前正在记录的规则栈 */
    private currentRuleStack: SequenceNode[] = []

    /** 当前规则名称 */
    private currentRuleName: string = ''

    /** 是否正在执行顶层规则调用 */
    private isExecutingTopLevelRule: boolean = false

    /** 正在执行的规则栈（用于检测递归） */
    private executingRuleStack: Set<string> = new Set()

    /**
     * 收集所有规则 - 静态方法
     *
     * @param parser Parser 实例
     * @returns 规则名称 → AST 的映射
     */
    static collectRules(parser: SubhutiParser): { cstMap: Map<string, SequenceNode>, tokenMap: Map<string, ConsumeNode> } {
        const collector = new SubhutiRuleCollector()
        return collector.collect(parser)
    }

    /**
     * 收集所有规则（私有实现）
     */
    private collect(parser: SubhutiParser): { cstMap: Map<string, SequenceNode>, tokenMap: Map<string, ConsumeNode> } {
        // ✅ 启用分析模式（不抛异常）
        parser.enableAnalysisMode()

        // 创建代理，拦截方法调用
        const proxy = this.createAnalyzeProxy(parser)

        // 获取所有 @SubhutiRule 方法
        const ruleNames = this.getAllRuleNames(parser)

        // 遍历执行每个规则
        for (const ruleName of ruleNames) {
            this.collectRule(proxy, ruleName)
        }

        // ✅ 恢复正常模式
        parser.disableAnalysisMode()

        return {
            cstMap: this.ruleASTs,
            tokenMap: this.tokenAstCache
        }
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
                    const debugRules = ['ConditionalExpression', 'AssignmentExpression', 'Expression', 'Statement']
                    const isDebugRule = debugRules.includes(collector.currentRuleName)

                    return (alternatives: Array<{ alt: () => any }>) => {
                        if (isDebugRule) {
                            console.log(`🔍 [DEBUG] Or 被拦截，当前规则: ${collector.currentRuleName}`)
                        }
                        return collector.handleOr(alternatives, proxy)
                    }
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
                    return function (...args: any[]) {
                        const debugRules = ['ConditionalExpression', 'AssignmentExpression', 'Expression', 'Statement']
                        const isDebugRule = debugRules.includes(prop)

                        // 如果是顶层规则调用（收集该规则本身），执行原方法
                        if (collector.isExecutingTopLevelRule && prop === collector.currentRuleName) {
                            collector.isExecutingTopLevelRule = false

                            if (isDebugRule) {
                                console.log(`🔍 [DEBUG] 顶层规则调用: ${prop}, isExecutingTopLevelRule=true`)
                            }

                            // ✅ 检测递归：如果规则已在执行栈中，说明是递归调用
                            if (collector.executingRuleStack.has(prop)) {
                                // 记录递归调用，但不执行（防止无限递归）
                                console.warn(`[RECURSION DETECTED] Rule "${prop}" calls itself recursively`)
                                return collector.handleSubrule(prop)
                            }

                            // 将规则加入执行栈
                            collector.executingRuleStack.add(prop)

                            try {
                                // ✅ 方案3：获取原始函数（绕过装饰器），在 proxy 上下文中执行
                                // 这样规则内部的 this.Or() 等调用会被 proxy 拦截
                                const originalFun = (original as any).__originalFunction__ || original

                                if (isDebugRule) {
                                    console.log(`🔍 [DEBUG] 执行原始函数: ${prop}`)
                                    console.log(`🔍 [DEBUG] 使用 ${(original as any).__originalFunction__ ? '原始函数' : '装饰后函数'}`)
                                }

                                // 在 proxy 上下文中执行原始函数
                                const result = originalFun.call(proxy, ...args)

                                if (isDebugRule) {
                                    console.log(`🔍 [DEBUG] 原始函数执行完成: ${prop}, 返回值:`, result)
                                }
                                return result
                            } finally {
                                // 执行完成后，从执行栈中移除
                                collector.executingRuleStack.delete(prop)
                            }
                        }

                        // 如果是子规则调用，只记录，不执行
                        if (isDebugRule) {
                            console.log(`🔍 [DEBUG] 子规则调用（不执行）: ${prop}`)
                        }
                        return collector.handleSubrule(prop)
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
                    return function (...args: any[]) {
                        // 记录 token 消费（方法名即 token 名）
                        collector.handleConsume(prop)

                        // 不需要执行原方法，因为我们只是收集 AST 结构
                        // 直接返回 undefined
                        return undefined

                        // // 尝试执行原方法，但捕获异常
                        // try {
                        //     return original.apply(target, args)
                        // } catch (error: any) {
                        //     // 消费失败（缺少token），但我们已经记录了consume调用
                        //     // 返回undefined，让规则继续执行
                        //     return undefined
                        // }
                    }
                }

                return original
            }
        })
    }

    /**
     * 收集单个规则
     *
     * 异常处理说明：
     * - ✅ Parser 在分析模式下不会抛出解析相关的异常（左递归、无限循环、Token 消费失败等）
     * - ✅ 但仍需 try-catch 捕获业务逻辑错误（如废弃方法主动抛出的 Error）
     * - ✅ 即使抛出错误，Proxy 也已经收集到了部分 AST，仍然保存
     *
     * 这与之前的设计不同：
     * - 之前：依赖异常来控制流程（不好的设计）
     * - 现在：只捕获真正的业务错误（正常的异常处理）
     */
    private collectRule(proxy: SubhutiParser, ruleName: string): void {
        // ⏱️ 记录开始时间
        const startTime = Date.now()

        // 重置状态
        this.currentRuleName = ruleName
        this.currentRuleStack = []
        this.isExecutingTopLevelRule = false

        // 创建根 Sequence 节点
        const rootNode: SequenceNode = {
            type: 'sequence',
            ruleName: ruleName,
            nodes: []
        }
        this.currentRuleStack.push(rootNode)

        try {
            // 执行规则（分析模式下会记录调用，不会抛解析异常）
            // 注意：这里调用proxy的方法，让内部的子规则调用被拦截
            const ruleMethod = (proxy as any)[ruleName]
            if (typeof ruleMethod === 'function') {
                this.isExecutingTopLevelRule = true
                ruleMethod.call(proxy)
                this.isExecutingTopLevelRule = false
            }

            // 保存 AST
            this.ruleASTs.set(ruleName, rootNode)

            // ⏱️ 计算耗时
            const elapsed = Date.now() - startTime

            // 日志输出（可选）
            if (rootNode.nodes.length > 0) {
                if (elapsed > 100) {
                    console.info(`✓ Rule "${ruleName}" collected (${rootNode.nodes.length} nodes) [${elapsed}ms] ⚠️ SLOW`)
                } else {
                    console.info(`✓ Rule "${ruleName}" collected (${rootNode.nodes.length} nodes) [${elapsed}ms]`)
                }
            } else {
                // 空 AST 也保存（用于左递归检测）
                console.warn(`⚠ Rule "${ruleName}" has empty AST (may indicate recursion or parsing failure) [${elapsed}ms]`)
            }

            // 如果超过10秒，输出警告
            if (elapsed > 10000) {
                console.error(`❌❌❌ Rule "${ruleName}" took ${elapsed}ms (${(elapsed / 1000).toFixed(2)}s) - EXTREMELY SLOW!`)
            }
        } catch (error: any) {
            // 捕获业务逻辑错误（如废弃方法、未实现方法等）
            // 即使抛出错误，我们也已经通过 Proxy 收集到了部分 AST
            this.ruleASTs.set(ruleName, rootNode)

            // ⏱️ 计算耗时
            const elapsed = Date.now() - startTime

            if (rootNode.nodes.length > 0) {
                console.info(`✓ Rule "${ruleName}" collected with error (${error?.message || error}), saved partial AST (${rootNode.nodes.length} nodes) [${elapsed}ms]`)
            } else {
                console.warn(`⚠ Rule "${ruleName}" failed: ${error?.message || error} (empty AST saved) [${elapsed}ms]`)
            }
        }
    }

    /**
     * 获取所有规则名称（遍历整个原型链，只收集被 @SubhutiRule 装饰的方法）
     *
     * 通过检查 __isSubhutiRule__ 元数据标记来区分规则方法和普通方法
     */
    private getAllRuleNames(parser: SubhutiParser): string[] {
        const ruleNames = new Set<string>()
        let prototype = Object.getPrototypeOf(parser)

        // 遍历整个原型链，直到 Object.prototype
        while (prototype && prototype !== Object.prototype) {
            // 遍历当前原型的所有方法
            for (const key of Object.getOwnPropertyNames(prototype)) {
                if (key === 'constructor') continue

                const descriptor = Object.getOwnPropertyDescriptor(prototype, key)
                if (descriptor && typeof descriptor.value === 'function') {
                    // ✅ 检查是否是 @SubhutiRule 装饰的方法
                    const method = descriptor.value
                    if (method.__isSubhutiRule__ === true) {
                        ruleNames.add(key)
                    }
                }
            }

            // 移动到父类原型
            prototype = Object.getPrototypeOf(prototype)
        }

        return Array.from(ruleNames)
    }

    // ============================================
    // Proxy 拦截方法
    // ============================================

    /**
     * 处理 Or 规则
     */
    private handleOr(alternatives: Array<{ alt: () => any }>, target: any): void {
        const debugRules = ['ConditionalExpression', 'AssignmentExpression', 'Expression', 'Statement']
        const isDebugRule = debugRules.includes(this.currentRuleName)

        const altNodes: any[] = []

        if (isDebugRule) {
            console.log(`🔍 [DEBUG] handleOr in ${this.currentRuleName}, ${alternatives.length} 个分支`)
        }

        for (let i = 0; i < alternatives.length; i++) {
            const alt = alternatives[i]
            // 进入新的序列
            const seqNode: SequenceNode = {type: 'sequence', nodes: []}
            this.currentRuleStack.push(seqNode)

            if (isDebugRule) {
                console.log(`🔍 [DEBUG]   执行分支 ${i + 1}/${alternatives.length}`)
            }

            try {
                // 执行分支（会通过 proxy 拦截）
                alt.alt.call(target)

                // 退出序列，获取结果
                const result = this.currentRuleStack.pop()
                if (result) {
                    if (isDebugRule) {
                        console.log(`🔍 [DEBUG]   分支 ${i + 1} 收集到 ${result.nodes?.length || 0} 个节点`)
                    }
                    altNodes.push(result)
                }
            } catch (error: any) {
                // 分支执行失败（可能是缺少token或其他错误）
                // 但我们仍然尝试保存已收集的部分AST
                const result = this.currentRuleStack.pop()
                if (isDebugRule) {
                    console.log(`🔍 [DEBUG]   分支 ${i + 1} 执行失败: ${error?.message}`)
                    console.log(`🔍 [DEBUG]   已收集部分节点: ${result?.nodes?.length || 0}`)
                }
                if (result && result.nodes && result.nodes.length > 0) {
                    // 如果收集到了部分节点，仍然保存
                    altNodes.push(result)
                }
                // 注意：我们不抛出异常，继续处理下一个分支
            }
        }

        // 记录 Or 节点（即使某些分支失败，只要有至少一个分支成功）
        if (altNodes.length > 0) {
            if (isDebugRule) {
                console.log(`🔍 [DEBUG] 记录 Or 节点，包含 ${altNodes.length} 个分支`)
            }
            this.recordNode({type: 'or', alternatives: altNodes})
        } else {
            if (isDebugRule) {
                console.log(`🔍 [DEBUG] ⚠️ Or 节点没有任何有效分支！`)
            }
        }
    }

    /**
     * 处理 Many 规则
     */
    private handleMany(fn: () => any, target: any): void {
        const seqNode: SequenceNode = {type: 'sequence', nodes: []}
        this.currentRuleStack.push(seqNode)

        try {
            // 执行一次（收集内部结构）
            fn.call(target)

            const innerNode = this.currentRuleStack.pop()
            if (innerNode) {
                this.recordNode({type: 'many', node: innerNode})
            }
        } catch (error: any) {
            // 执行失败，但仍然尝试保存已收集的部分
            const innerNode = this.currentRuleStack.pop()
            if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) {
                this.recordNode({type: 'many', node: innerNode})
            }
        }
    }

    /**
     * 处理 Option 规则
     */
    private handleOption(fn: () => any, target: any): void {
        const seqNode: SequenceNode = {type: 'sequence', nodes: []}
        this.currentRuleStack.push(seqNode)

        try {
            fn.call(target)

            const innerNode = this.currentRuleStack.pop()
            if (innerNode) {
                this.recordNode({type: 'option', node: innerNode})
            }
        } catch (error: any) {
            // 执行失败，但仍然尝试保存已收集的部分
            const innerNode = this.currentRuleStack.pop()
            if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) {
                this.recordNode({type: 'option', node: innerNode})
            }
        }
    }

    /**
     * 处理 AtLeastOne 规则
     */
    private handleAtLeastOne(fn: () => any, target: any): void {
        const seqNode: SequenceNode = {type: 'sequence', nodes: []}
        this.currentRuleStack.push(seqNode)

        try {
            fn.call(target)

            const innerNode = this.currentRuleStack.pop()
            if (innerNode) {
                this.recordNode({type: 'atLeastOne', node: innerNode})
            }
        } catch (error: any) {
            // 执行失败，但仍然尝试保存已收集的部分
            const innerNode = this.currentRuleStack.pop()
            if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) {
                this.recordNode({type: 'atLeastOne', node: innerNode})
            }
        }
    }

    /**
     * 处理 consume
     */
    private handleConsume(tokenName: string): void {
        const tokenNode: ConsumeNode = {type: 'consume', tokenName}
        this.tokenAstCache.set(tokenName, tokenNode)
        this.recordNode(tokenNode)
    }

    /**
     * 处理子规则调用
     */
    private handleSubrule(ruleName: string): any {
        const debugRules = ['ConditionalExpression', 'AssignmentExpression', 'Expression', 'Statement']
        const isDebugRule = debugRules.includes(this.currentRuleName)

        if (isDebugRule) {
            console.log(`🔍 [DEBUG]     子规则调用: ${ruleName}`)
        }

        this.recordNode({type: 'subrule', ruleName})
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

