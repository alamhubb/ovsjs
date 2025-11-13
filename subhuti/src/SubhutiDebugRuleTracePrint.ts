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

import {LogUtil} from "./logutil.ts";

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

    //用来判断是否为来自缓存的数据
    isManuallyAdded?: boolean   // 是否应该在这里换行（单独一行）
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


    public static getPrintToken(tokenItem: RuleStackItem, location?: string): string[] {

        // 格式化 token 值（转义特殊字符、截断长字符串）
        const value = TreeFormatHelper.formatTokenValue(tokenItem.tokenValue, 20)

        const tokenStrs = ['🔹 Consume', `token[${tokenItem.tokenIndex}]`, '-', value, '-', `<${tokenItem.tokenName}>`, location || '[]', '✅ ']

        return tokenStrs
    }

    public static printLine(str: string[], depth: number, symbol: string = '└─') {
        str.push(depth)
        const line = TreeFormatHelper.formatLine(
            str,
            // 前缀：根据深度生成缩进，└─ 表示是叶子节点
            {prefix: '│  '.repeat(depth) + symbol, separator: ' '}
        )
        LogUtil.log(line)
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
        const unOutputIndex = ruleStack.findIndex(item => !item.outputted)

        if (unOutputIndex < 0) {
            throw new Error('系统错误：没有带输出的日志')
        }
        let pendingRules = ruleStack.slice(unOutputIndex)

        if (!pendingRules.length) {
            throw new Error('系统错误：pendingRules 为空')
        }

        // 最后一个已输出的规则
        const lastOutputted = ruleStack[unOutputIndex - 1]

        // 计算基准深度
        // 如果没有已输出的规则（第一次输出），baseDepth = 0
        let baseDepth = 0
        if (lastOutputted) {
            // 否则 baseDepth = 最后一个已输出规则的深度 + 1
            baseDepth = lastOutputted.displayDepth + 1
        }

        //最后一个未输出的 OrEntry（使用 findLastIndex 直接获取正向索引）
        let lastOrIndex = [...pendingRules].reverse().findIndex(item => !!item.orBranchInfo?.isOrEntry)

        const minChainRulesLength = 2

        // 计算断链位置：最后一个 Or 的位置 + 1（如果没有 Or，则至少保留 minChainRulesLength 个规则单独输出）
        // lastOrIndex = -1 表示没有找到 Or 节点
        // 注意：如果找到了 Or 节点（lastOrIndex >= 0），则至少要保留 lastOrIndex + 1 个规则单独输出
        const breakPoint = Math.max(lastOrIndex + 1, minChainRulesLength)

        //获取折叠链和单独输出的规则
        if (breakPoint < pendingRules.length) {
            const singleRules = pendingRules.splice(-breakPoint);
            // 输出折叠链
            this.printChainRule(pendingRules, baseDepth)
            return this.printMultipleSingleRule(singleRules, baseDepth + 1)
            // return this.printMultipleSingleRule(pendingRules, baseDepth)
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
        let pendingRules = ruleStack.filter(item => !item.outputted)

        if (pendingRules.length === 0) {
            throw new Error('不该触发没有规则场景')
        }

        // 【缓存场景的折叠逻辑】
        // 规则：
        // 1. Or 包裹节点（childs > 1）及其 3 层子孙节点 → 换行（shouldBreakLine=true）
        // 2. Token 节点 → 换行（shouldBreakLine=true）
        // 3. 其他节点 → 折叠（shouldBreakLine=false）
        //
        // 分组策略：
        // - shouldBreakLine=true 的节点：每个节点单独一组
        // - shouldBreakLine=false 的节点：所有连续的节点在一组（折叠），不管前一个节点是什么

        const groups: RuleStackItem[][] = []
        let currentGroup: RuleStackItem[] = []

        for (let i = 0; i < pendingRules.length; i++) {
            const item = pendingRules[i]

            if (item.shouldBreakLine) {
                // 需要换行的节点：单独一组
                // 先保存之前的折叠组（如果有）
                if (currentGroup.length > 0) {
                    groups.push(currentGroup)
                    currentGroup = []
                }
                // 当前节点单独一组
                groups.push([item])
            } else {
                // 不需要换行的节点：加入当前折叠组
                currentGroup.push(item)
            }
        }

        // 保存最后的折叠组（如果有）
        if (currentGroup.length > 0) {
            groups.push(currentGroup)
        }

        // 输出每一组
        for (const group of groups) {
            if (group.length === 1 && group[0].shouldBreakLine) {
                // 单个节点且需要换行：单独输出
                this.printMultipleSingleRule(group)
            } else {
                // 多个节点（折叠组）：折叠输出
                // 注意：printChainRule 现在可以处理 shouldBreakLine=false 的 Or 节点
                this.printChainRule(group)
            }
        }
    }

    /**
     * 打印折叠链,兼容非缓存和缓存，
     * @param rules
     * @param depth 兼容非缓存和缓存，
     */
    static printChainRule(rules: RuleStackItem[], depth: number = rules[0].displayDepth): void {
        // 过滤规则：
        // 1. 过滤掉 Or 分支节点（isOrBranch）
        // 2. 过滤掉需要换行的 Or 包裹节点（isOrEntry && shouldBreakLine）
        // 3. 保留不需要换行的 Or 包裹节点（isOrEntry && !shouldBreakLine）
        // 4. 保留普通规则节点
        const names = rules
            .filter(item => {
                if (!item.orBranchInfo) {
                    // 普通规则节点：保留
                    return true
                }
                if (item.orBranchInfo.isOrBranch) {
                    // Or 分支节点：过滤掉
                    return false
                }
                if (item.orBranchInfo.isOrEntry) {
                    // Or 包裹节点：只保留不需要换行的（shouldBreakLine=false）
                    return !item.shouldBreakLine
                }
                return false
            })
            .map(r => r.ruleName)

        const displayNames = names.length > 5
            ? [...names.slice(0, 3), '...', ...names.slice(-2)]
            : names

        if (names.length > 0) {
            SubhutiDebugRuleTracePrint.printLine([displayNames.join(' > ')], depth, '├─')
        }

        rules.forEach(r => {
            r.displayDepth = depth
            // r.relativeDepthByStack = 0
            r.outputted = true
        })
    }

    /**
     * 打印单独规则
     * 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
     *
     * @param rules
     * @param depth 兼容非缓存和缓存，
     */
    static printMultipleSingleRule(rules: RuleStackItem[], depth: number = rules[0].displayDepth): number {
        rules.forEach((item, index) => {
            // 判断是否是最后一个
            const isLast = index === rules.length - 1


            // ✅ 修复：所有规则使用相同的深度（同级）
            // 因为 printSingleRule 通常只传入 1 个规则，不需要递增深度

            // 生成前缀：每一层的连接线

            let printStrs = []

            let branch = isLast ? '└─' : '├─'

            if (item.orBranchInfo) {
                const branchInfo = item.orBranchInfo
                if (item.orBranchInfo.isOrEntry) {
                    // branch = '🔀 '
                    // Or 包裹节点：显示 [Or]
                    printStrs = ['🔀 ' + item.ruleName + '(Or)']
                } else if (item.orBranchInfo.isOrBranch) {
                    printStrs = [`[Branch #${branchInfo.branchIndex + 1}](${item.ruleName})`]
                    // 🔍 调试：记录 Or 分支被标记为 outputted
                } else {
                    printStrs = [`错误`]
                }
            } else {
                if (item.tokenName) {
                    printStrs = SubhutiDebugRuleTracePrint.getPrintToken(item)
                } else {
                    printStrs = [item.ruleName]
                }

            }
            if (item.isManuallyAdded) {
                // 普通规则：添加缓存标记
                printStrs.push(`⚡[Cached]`)
            }


            if (!item.isManuallyAdded) {
                item.displayDepth = depth
            }

            SubhutiDebugRuleTracePrint.printLine(printStrs, item.displayDepth, branch)


            // item.shouldBreakLine = true
            item.outputted = true

            depth++
        })
        return depth
    }

}

