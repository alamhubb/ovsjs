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
    // relativeDepthByStack?: number    // 基于栈计算的相对深度（非缓存时记录）
    // relativeDepthByChilds?: number   // 基于 childs 计算的相对深度（缓存恢复时计算）

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
     * 非缓存场景：输出待处理的规则日志（内部实现）
     * 特点：只有一次断链，只有一个折叠段
     *
     * 【设计思路】
     * 1. 不需要提前标记 shouldBreakLine
     * 2. 遍历时直接判断是否到达断点
     * 3. 到达断点前：积累到折叠链
     * 4. 到达断点后：逐个输出并赋值 shouldBreakLine = true
     */
    public static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[]): number {
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

        //最后一个未输出的 OrEntry（使用 findLastIndex 直接获取正向索引）
        let lastOrIndex = [...pendingRules].reverse().findIndex(item => !!item.orBranchInfo?.isOrEntry)

        const minChainRulesLength = 2

        // 计算断链位置：最后一个 Or 的位置 + 1（如果没有 Or，则至少保留 minChainRulesLength 个规则单独输出）
        // lastOrIndex = -1 表示没有找到 Or 节点
        const breakPoint = Math.max(lastOrIndex, minChainRulesLength)

        //获取折叠链和单独输出的规则
        if (breakPoint < pendingRules.length) {
            const singleRules = pendingRules.splice(-breakPoint);
            // 输出折叠链
            this.printChainRule(pendingRules, baseDepth)
            return this.printMultipleSingleRule(singleRules, baseDepth + 1)
        } else {
            return this.printMultipleSingleRule(pendingRules, baseDepth)
        }
    }

    /**
     * 缓存场景：输出待处理的规则日志（内部实现）
     *
     * 特点：
     * - displayDepth 已经在 restoreFromCacheAndPushAndPrint 中设置好了
     * - shouldBreakLine 已经在第一次输出时设置并缓存了
     * - 直接根据这些信息输出即可
     */
    public static flushPendingOutputs_Cache_Impl(ruleStack: RuleStackItem[]): void {



        // 按照 shouldBreakLine 分组
        const groups: RuleStackItem[][] = []
        let currentGroup: RuleStackItem[] = [pendingRules[0]]
        groups.push(currentGroup)

        for (let i = 1; i < pendingRules.length; i++) {
            const item = pendingRules[i]
            const prevItem = pendingRules[i - 1]

            // 如果当前规则和前一个规则的 shouldBreakLine 相同，且 displayDepth 相同，则归为同一组（折叠链）
            if (item.shouldBreakLine === prevItem.shouldBreakLine &&
                item.displayDepth === prevItem.displayDepth) {
                currentGroup.push(item)
            } else {
                // 否则开始新的一组
                currentGroup = [item]
                groups.push(currentGroup)
            }
        }

        // 输出每一组
        for (const group of groups) {
            if (group.length === 1) {
                // 单个规则：单独输出
                this.printSingleRuleWithDepth(group[0])
            } else {
                // 多个规则：折叠输出
                this.printChainRuleWithDepth(group)
            }
        }
    }

    /**
     * 打印单个规则（使用已设置的 displayDepth）
     */
    private static printSingleRuleWithDepth(item: RuleStackItem): void {
        const depth = item.displayDepth ?? 0
        const prefix = '│  '.repeat(depth)

        let printStr = ''
        if (item.orBranchInfo) {
            if (item.orBranchInfo.isOrEntry) {
                printStr = '🔀 ' + item.ruleName + '(Or)'
            } else if (item.orBranchInfo.isOrBranch) {
                printStr = `[Branch #${item.orBranchInfo.branchIndex + 1}]`
            } else {
                printStr = `错误`
            }
        } else {
            printStr = item.ruleName
        }

        console.log(prefix + '├─' + printStr)
        item.outputted = true
    }

    /**
     * 打印折叠链（使用已设置的 displayDepth）
     */
    private static printChainRuleWithDepth(rules: RuleStackItem[]): void {
        // 过滤 or 和虚拟规则
        const names = rules.filter(item => !item.orBranchInfo).map(r => r.ruleName)

        const displayNames = names.length > 5
            ? [...names.slice(0, 3), '...', ...names.slice(-2)]
            : names

        // 使用第一个规则的 displayDepth
        const depth = rules[0].displayDepth ?? 0
        const prefix = '│  '.repeat(depth)

        console.log(prefix + '├─' + displayNames.join(' > '))

        rules.forEach(r => {
            r.outputted = true
        })
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
        return displayDepth
    }

}

