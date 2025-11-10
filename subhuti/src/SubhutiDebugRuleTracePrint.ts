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
    ruleName: string
    startTime: number
    outputted: boolean          // 是否已输出
    hasExited: boolean          // 是否已退出（标记后立即 pop）
    tokenIndex: number          // 规则进入时的 token 索引（用于缓存键）
    isManuallyAdded?: boolean   // 是否从缓存恢复的手动添加项
    displayDepth?: number       // 显示深度（flush 时计算）
    consumedTokens?: Array<{    // 该规则及其子规则消费的所有 Token
        tokenIndex: number
        tokenValue: string
        tokenName: string
    }>
    orBranchInfo?: {
        branchIndex?: number
        isOrEntry: boolean // 是否是 Or 包裹节点（onOrEnter 创建）
        isOrBranch: boolean // 是否是 Or 分支节点（onOrBranch 创建）
        totalBranches?: number // Or 分支信息（如 "#1/3" 或 "3" 表示总分支数）
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
     * 输出待处理的规则
     *
     * 实现规则：
     * 1. 连续无 Or 标记的规则折叠显示
     * 2. 最近的 Or 入口规则单独显示
     * 3. 父规则和爷爷规则单独显示
     * 4. Token 相关规则单独显示
     */
    static flushPendingOutputs(ruleStack: RuleStackItem[]): void {
        // 获取所有未输出的规则
        const pending = ruleStack.filter(item => !item.outputted)
        if (pending.length === 0) return

        // 计算基准深度（最后一个已输出规则的 displayDepth + 1）
        const lastOutputted = [...ruleStack]
            .reverse()
            .find(item => item.outputted && item.displayDepth !== undefined)
        const baseDepth = lastOutputted ? lastOutputted.displayDepth + 1 : 0

        // 计算断点（最后一个 Or 相关规则 或 爷爷规则，取较小值）
        // 使用统一的 isOrRelated 方法判断
        let lastOrIndex = -1
        for (let i = pending.length - 1; i >= 0; i--) {
            if (this.isOrEntry(pending[i])) {
                lastOrIndex = i
                break
            }
        }
        const grandpaIndex = pending.length >= 2 ? pending.length - 2 : -1
        const validIndices = [lastOrIndex, grandpaIndex].filter(i => i >= 0)
        const breakPoint = validIndices.length > 0 ? Math.min(...validIndices) : -1

        // 执行输出
        if (breakPoint > 0) {
            // 折叠部分：[0, breakPoint)
            this.printChainRule(pending.slice(0, breakPoint), baseDepth)

            // 单独部分：[breakPoint, end]
            this.printSingleRule(pending.slice(breakPoint), baseDepth + 1)
        } else {
            // 全部单独输出
            this.printSingleRule(pending, baseDepth)
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
            r.outputted = true
        })
    }

    /**
     * 打印单独规则（深度递增）
     */
    static printSingleRule(rules: RuleStackItem[], startDepth: number): void {
        rules.forEach((item, index) => {
            // 判断是否是最后一个
            const isLast = index === rules.length - 1

            // 生成缩进（父层级）+ 分支符号
            const branch = isLast ? '└─' : '├─'

            const depth = startDepth + index

            // 生成前缀：每一层的连接线
            let prefix = ''
            for (let d = 0; d < depth; d++) {
                // 计算在 d 这一层，后面是否还有节点
                // d 对应的规则索引是 (d - startDepth)
                const ruleIndexAtLayer = d - startDepth

                // 如果当前规则索引 > ruleIndexAtLayer，说明 d 层的规则后面还有节点
                if (ruleIndexAtLayer < index) {
                    prefix += '│  '
                } else {
                    prefix += '   '
                }
            }

            let printStr = ''
            if (item.orBranchInfo) {
                const branchInfo = item.orBranchInfo
                if (item.orBranchInfo.isOrEntry) {
                    // Or 包裹节点：显示 [Or]
                    printStr =  '🔀 ' +item.ruleName + '(Or)'
                } else if (item.orBranchInfo.isOrBranch) {
                    printStr = `[Branch #${branchInfo.branchIndex + 1}]`
                } else {
                    printStr = `错误`
                }
            } else {
                // 普通规则：添加缓存标记
                printStr = item.ruleName
                if (item.isManuallyAdded) {
                    printStr += ' ⚡[Cached]'
                }
            }
            
            // console.log('  '.repeat(depth) +  printStr)
            console.log(prefix + branch + printStr)
            item.displayDepth = depth
            item.outputted = true
            // depth++
        })
    }

}

