/**
 * SubhutiDebugRuleTracePrint - 规则路径输出工具类
 *
 * 职责：
 * - 负责规则执行路径的格式化输出
 * - 处理规则链的折叠显示
 * - 计算缩进和显示深度
 * - 生成 Or 分支标记
 *
 * 设计：
 * - 纯静态方法，无实例状态
 * - 直接基于 RuleStackItem[] 进行输出
 * - 可以修改传入的状态对象（副作用）
 * - 直接输出到控制台
 */

// ============================================
// TreeFormatHelper - 树形输出格式化辅助
// ============================================

/**
 * 树形输出格式化辅助类
 *
 * 提供统一的格式化工具方法供调试工具使用
 *
 * 核心功能：
 * 1. formatLine - 统一的行输出格式化（自动处理缩进、拼接、过滤空值）
 * 2. formatTokenValue - Token 值转义和截断
 * 3. formatLocation - 位置信息格式化
 * 4. formatRuleChain - 规则链拼接
 */
export class TreeFormatHelper {
    /**
     * 格式化一行输出
     *
     * @param parts - 内容数组（null/undefined/'' 会被自动过滤）
     * @param options - 配置选项
     */
    static formatLine(
        parts: (string | number | null | undefined)[],
        options: {
            depth?: number
            prefix?: string
            separator?: string
        }
    ): string {
        const indent = options.prefix ?? '  '.repeat(options.depth ?? 0)
        const content = parts
            .filter(p => p !== null && p !== undefined && p !== '')
            .join(options.separator ?? '')
        return indent + content
    }

    /**
     * 格式化 Token 值（处理特殊字符和长度限制）
     *
     * @param value - 原始值
     * @param maxLength - 最大长度（超过则截断）
     */
    static formatTokenValue(value: string, maxLength: number = 40): string {
        // 转义特殊字符
        let escaped = value
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')

        // 限制长度
        if (escaped.length > maxLength) {
            escaped = escaped.slice(0, maxLength) + '...'
        }

        return escaped
    }

    /**
     * 格式化位置信息
     *
     * @param loc - 位置对象 {start: {line, column}, end: {line, column}}
     */
    static formatLocation(loc: any): string {
        if (!loc?.start || !loc?.end) {
            return ''
        }

        const startLine = loc.start.line
        const startCol = loc.start.column
        const endLine = loc.end.line
        const endCol = loc.end.column

        if (startLine === endLine) {
            return `[${startLine}:${startCol}-${endCol}]`
        } else {
            return `[${startLine}:${startCol}-${endLine}:${endCol}]`
        }
    }

    /**
     * 格式化规则链（用于折叠显示）
     *
     * @param rules - 规则名数组
     * @param separator - 分隔符（默认 " > "）
     */
    static formatRuleChain(rules: string[], separator: string = ' > '): string {
        return rules.join(separator)
    }
}

// ============================================
// 类型定义
// ============================================

/**
 * 规则栈项
 */
export interface RuleStackItem {
    ruleName?: string
    tokenValue?: string
    tokenName?: string
    startTime: number
    outputted: boolean          // 是否已输出
    tokenIndex: number          // 规则进入时的 token 索引（用于缓存键）

    shouldBreakLine?: boolean   // 是否应该在这里换行（单独一行）
    displayDepth?: number       // 显示深度（flush 时计算）
    childs?: string[]           // 子节点的 key（可以是规则 key 或 Token key）

    // 【防御性编程】两种方式计算的相对深度，用于交叉验证
    relativeDepthByStack?: number    // 基于栈计算的相对深度（非缓存时记录）
    relativeDepthByChilds?: number   // 基于 childs 计算的相对深度（缓存恢复时计算）

    orBranchInfo?: {
        orIndex?: number           // 同一规则内 Or 的序号（0, 1, 2...，用于区分多个 Or）
        branchIndex?: number       // Or 分支索引（1, 2, 3...）
        isOrEntry: boolean         // 是否是 Or 包裹节点（onOrEnter 创建）
        isOrBranch: boolean        // 是否是 Or 分支节点（onOrBranch 创建）
        totalBranches?: number     // Or 分支信息（如 "#1/3" 或 "3" 表示总分支数）
    }
}

/**
 * Or 分支信息
 */
export interface OrBranchInfo {
    totalBranches: number
    currentBranch: number
    targetDepth: number
    savedPendingLength: number
    parentRuleName: string  // 父规则名（调用 Or 的规则）
}

// ============================================
// SubhutiDebugRuleTracePrint - 规则路径输出工具类
// ============================================

export class SubhutiDebugRuleTracePrint {
    /**
     * 统一的 Or 标记格式化方法
     * 所有字符串拼接都在这里处理
     *
     * @param item - 规则栈项
     * @returns 显示后缀（如 "" / " [Or]" / " [Or #1/3]"）
     */
    static formatOrSuffix(item: RuleStackItem): string {
        // 优先使用 orBranchInfo 对象（新设计）
        if (item.orBranchInfo) {
            const info = item.orBranchInfo

            if (info.isOrEntry) {
                // Or 包裹节点：显示 [Or]
                return ' [Or]'
            } else if (info.isOrBranch) {
                return ` [Or #${info.branchIndex + 1}/${info.totalBranches}]`
            } else {
                return `错误`
            }
        }
        // 普通规则，无后缀
        return ''
    }

    /**
     * 判断是否是 Or 相关节点
     */
    static isOrEntry(item: RuleStackItem): boolean {
        // 新设计：检查 orBranchInfo 对象
        return item.orBranchInfo?.isOrEntry
    }

    /**
     * 缓存场景：输出待处理的规则日志（公开方法）
     * 调用时机：缓存恢复时
     */
    static flushPendingOutputs_Cache(ruleStack: RuleStackItem[]): void {
        // 【第一步】获取所有未输出的规则
        const pending = ruleStack.filter(item => !item.outputted)
        if (pending.length === 0) return

        // 【第二步】调用内部实现
        this.flushPendingOutputs_Cache_Impl(ruleStack, pending)
    }

    /**
     * 非缓存场景：输出待处理的规则日志（内部实现）
     * 特点：只有一次断链，只有一个折叠段
     *
     * 【设计思路】
     * 1. 不需要提前标记 shouldBreakLine
     * 2. 遍历时直接判断是否到达断点
     * 3. 到达断点前：积累到折叠链
     * 4. 到达断点后：逐个输出并赋值 shouldBreakLine = true
     */
    public static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[]): void {
        if (!ruleStack.length) {
            throw new Error('系统错误：ruleStack 为空')
        }

        // 查找最后一个已输出的规则
        const lastOutputted = [...ruleStack].reverse().find(item => item.outputted)

        // 计算基准深度
        // 如果没有已输出的规则（第一次输出），baseDepth = 0
        let baseDepth = 0
        if (lastOutputted) {
            // 否则 baseDepth = 最后一个已输出规则的深度 + 1
            baseDepth = lastOutputted.displayDepth + 1
        }


        let pendingRules = ruleStack.filter(item => !item.outputted)

        if (!pendingRules.length) {
            throw new Error('系统错误')
        }

        //最后一个未输出的or
        let lastOrIndex = [...pendingRules].reverse().findIndex(item => !!item?.orBranchInfo?.isOrEntry)

        const minChainRulesLength = 2

        //获取断链索引
        const breakIndex = pendingRules.length - Math.max(lastOrIndex, minChainRulesLength)

        //获取折叠链
        if (pendingRules.length > minChainRulesLength) {
            const singleRules = pendingRules.splice(-breakIndex);
            // 输出折叠链
            this.printChainRule(pendingRules, baseDepth)
            this.printMultipleSingleRule(singleRules, baseDepth + 1)
        } else {
            this.printMultipleSingleRule(pendingRules, baseDepth)
        }
    }

    /**
     * 缓存场景：输出待处理的规则日志（内部实现）
     * 特点：可能有多次断链，可能有多个折叠段
     */
    private static flushPendingOutputs_Cache_Impl(ruleStack: RuleStackItem[], pending: RuleStackItem[]): void {
        // 【第一步】计算基准深度（最后一个已输出规则的 displayDepth + 1）
        const lastOutputted = [...ruleStack]
            .reverse()
            .find(item => item.outputted && item.displayDepth !== undefined)
        const baseDepth = lastOutputted ? lastOutputted.displayDepth + 1 : 0

        // 【第二步】计算 relativeDepthByChilds（基于 shouldBreakLine 标记）
        let relativeDepth = 0
        let chainRulesForDepth: RuleStackItem[] = []

        for (const rule of pending) {
            if (rule.shouldBreakLine) {
                // 当前规则需要换行（断链）

                // 先处理之前积累的折叠链
                if (chainRulesForDepth.length > 0) {
                    // 折叠链中的所有规则相对深度相同
                    for (const chainRule of chainRulesForDepth) {
                        chainRule.relativeDepthByChilds = relativeDepth
                    }
                    relativeDepth++
                    chainRulesForDepth = []
                }

                // 当前规则的相对深度
                rule.relativeDepthByChilds = relativeDepth
                relativeDepth++
            } else {
                // 不换行，积累到链中
                chainRulesForDepth.push(rule)
            }
        }

        // 处理最后剩余的折叠链
        if (chainRulesForDepth.length > 0) {
            for (const chainRule of chainRulesForDepth) {
                chainRule.relativeDepthByChilds = relativeDepth
            }
        }

        // 【第三步】防御性编程：对比两种相对深度计算方式
        for (const rule of pending) {
            // const depthByStack = rule.relativeDepthByStack
            const depthByChilds = rule.relativeDepthByChilds

            // 如果两个都存在，必须一致
            // if (depthByStack !== undefined && depthByChilds !== undefined) {
            //     if (depthByStack !== depthByChilds) {
            //         const ruleName = rule.ruleName ?? `Token[${rule.tokenValue}]`
            //         throw new Error(
            //             `❌ 相对深度不一致！规则: ${ruleName}\n` +
            //             `   基于栈计算: ${depthByStack}\n` +
            //             `   基于childs计算: ${depthByChilds}\n` +
            //             `   这表明缓存恢复逻辑有问题！`
            //         )
            //     }
            // }

            // 使用相对深度计算显示深度
            const finalRelativeDepth = depthByChilds
            rule.displayDepth = baseDepth + finalRelativeDepth
        }

        // 【第四步】根据 shouldBreakLine 标记进行分组输出
        // 缓存场景可能有多个折叠段，需要逐个处理
        let chainRules: RuleStackItem[] = []  // 积累要折叠的规则

        for (const rule of pending) {
            if (rule.shouldBreakLine) {
                // 当前规则需要换行（断链）

                // 先输出之前积累的折叠链（如果有的话）
                if (chainRules.length > 0) {
                    // 折叠链中的所有规则使用第一个规则的深度
                    const chainDepth = chainRules[0].displayDepth ?? baseDepth
                    this.printChainRule(chainRules, chainDepth)
                    chainRules = []  // 重置链
                }

                // 再输出当前规则（单独一行）
                const ruleDepth = rule.displayDepth ?? baseDepth
                this.printMultipleSingleRule([rule], ruleDepth)
            } else {
                // 不换行，积累到链中
                chainRules.push(rule)
            }
        }

        // 【第五步】输出最后剩余的折叠链（如果有的话）
        if (chainRules.length > 0) {
            const chainDepth = chainRules[0].displayDepth ?? baseDepth
            this.printChainRule(chainRules, chainDepth)
        }
    }

    /**
     * 打印折叠链
     */
    static printChainRule(rules: RuleStackItem[], depth: number): void {
        //过滤or和虚拟规则
        const names = rules.filter(item => !item.orBranchInfo).map(r => r.ruleName)

        const displayNames = names.length > 5
            ? [...names.slice(0, 3), '...', ...names.slice(-2)]
            : names

        // 前缀：前面层级的垂直线
        const prefix = '│  '.repeat(depth)

        // console.log(prefix + '├─' + names.join(' > '))
        // 折叠链用 ├─（因为后面有单独规则）
        console.log(prefix + '├─' + displayNames.join(' > '))

        rules.forEach(r => {
            r.displayDepth = depth
            // r.relativeDepthByStack = 0
            r.outputted = true
        })
    }

    /**
     * 打印单独规则
     * 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
     */
    static printMultipleSingleRule(rules: RuleStackItem[], displayDepth: number): void {
        rules.forEach((item, index) => {
            // 判断是否是最后一个
            const isLast = index === rules.length - 1

            // 生成缩进（父层级）+ 分支符号
            const branch = isLast ? '└─' : '├─'

            // ✅ 修复：所有规则使用相同的深度（同级）
            // 因为 printSingleRule 通常只传入 1 个规则，不需要递增深度

            // 生成前缀：每一层的连接线
            let prefix = ''
            for (let d = 0; d < displayDepth; d++) {
                prefix += '│  '
            }

            let printStr = ''
            if (item.orBranchInfo) {
                const branchInfo = item.orBranchInfo
                if (item.orBranchInfo.isOrEntry) {
                    // Or 包裹节点：显示 [Or]
                    printStr = '🔀 ' + item.ruleName + '(Or)'
                } else if (item.orBranchInfo.isOrBranch) {
                    printStr = `[Branch #${branchInfo.branchIndex + 1}]`
                } else {
                    printStr = `错误`
                }
            } else {
                // 普通规则：添加缓存标记
                printStr = item.ruleName
                /*if (item.isManuallyAdded) {
                    printStr += ' ⚡[Cached]'
                }*/
            }

            // console.log('  '.repeat(depth) +  printStr)
            console.log(prefix + branch + printStr)
            item.displayDepth = displayDepth
            item.shouldBreakLine = true
            item.outputted = true
            displayDepth++
        })
    }

}

