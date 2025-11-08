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
    depth: number               // 进入时的深度（用于性能统计）
    startTime: number
    outputted: boolean          // 是否已输出
    hasConsumedToken: boolean
    hasExited: boolean          // 是否已退出（标记后立即 pop）
    displayDepth?: number       // 显示深度（flush 时计算）
    isOrEntry: boolean          // 是否是 Or 入口规则
    orBranchInfo?: string       // Or 分支信息（如 "#1/3"），用于显示
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
        
        // 计算断点（最后一个 Or 入口规则 或 爷爷规则，取较小值）
        let lastOrIndex = -1
        for (let i = pending.length - 1; i >= 0; i--) {
            if (pending[i].isOrEntry) {
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
            this.printChain(pending.slice(0, breakPoint), baseDepth)
            
            // 单独部分：[breakPoint, end]
            this.printIndividual(pending.slice(breakPoint), baseDepth + 1)
        } else {
            // 全部单独输出
            this.printIndividual(pending, baseDepth)
        }
    }
    
    /**
     * 打印折叠链
     */
    private static printChain(rules: RuleStackItem[], depth: number): void {
        const names = rules.map(r => r.ruleName)
        
        // 简化长链：>5 个规则时，显示前3个 + ... + 后2个
        const displayNames = names.length > 5 
            ? [...names.slice(0, 3), '...', ...names.slice(-2)]
            : names
        
        console.log('  '.repeat(depth) + displayNames.join(' > '))
        
        rules.forEach(r => {
            r.displayDepth = depth
            r.outputted = true
        })
    }

    /**
     * 打印单独规则（深度递增）
     */
    private static printIndividual(rules: RuleStackItem[], startDepth: number): void {
        let depth = startDepth
        rules.forEach(r => {
            const suffix = r.isOrEntry ? ' [Or]' : ''
            console.log('  '.repeat(depth) + r.ruleName + suffix)
            r.displayDepth = depth
            r.outputted = true
            depth++
        })
    }

    /**
     * 获取 Or 信息（返回结构化数据）
     * 
     * @param ruleDepth - 规则深度
     * @param orInfo - Or 分支信息
     * @returns {isOrEntry: boolean, branchInfo?: string}
     */
    static getOrInfo(
        ruleDepth: number,
        orInfo: OrBranchInfo | null
    ): { isOrEntry: boolean; branchInfo?: string } {
        if (!orInfo) {
            return { isOrEntry: false }
        }

        // Or 分支入口规则（例如：LetOrConst）
        if (ruleDepth === orInfo.targetDepth) {
            return {
                isOrEntry: true,
                branchInfo: `#${orInfo.currentBranch + 1}/${orInfo.totalBranches}`
            }
        }

        return { isOrEntry: false }
    }

}

