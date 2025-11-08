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
 * - 每个方法最多 4 个参数
 * - 可以修改传入的状态对象（副作用）
 * - 直接输出到控制台
 *
 * @version 1.0.0
 * @date 2025-11-08
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
 * 规则栈项（合并了缓冲区的功能）
 */
export interface RuleStackItem {
    ruleName: string
    depth: number               // 进入时的深度
    startTime: number
    outputted: boolean          // 是否已输出
    hasConsumedToken: boolean
    hasExited: boolean          // 是否已退出（标记后立即 pop）
    displayDepth?: number       // 显示深度（flush 时计算）
    orSuffix: string            // Or 标记
    canChain: boolean           // 是否可折叠
}

/**
 * 待输出规则（旧版，用于兼容）
 */
export interface PendingRule {
    ruleName: string
    depth: number
}

/**
 * 待输出项（新版 - 延迟计算设计）
 * 
 * 设计理念：
 * - 进入时不计算 displayDepth（信息不完整）
 * - flush 时计算 displayDepth（知道完整规则和链结构）
 * - 保留历史（部分清空，保留未退出的作为基准）
 * 
 * @example
 * ```typescript
 * // 进入时保存
 * const item: PendingOutput = {
 *   ruleName: "Statement",
 *   depth: 1,
 *   displayDepth: undefined,  // 不计算
 *   outputted: false,
 *   hasExited: false,
 *   orSuffix: " [#1/3 ✅]",
 *   canChain: false
 * }
 * 
 * // flush 时计算
 * item.displayDepth = begin  // 基于基准计算
 * 
 * // 打印时使用
 * const line = formatLine([item.ruleName, item.orSuffix], {depth: item.displayDepth})
 * ```
 */
export interface PendingOutput {
    /**
     * 规则名称
     */
    ruleName: string
    
    /**
     * 规则在 ruleStack 中的真实深度（用于验证和过滤）
     */
    depth: number
    
    /**
     * 显示深度（flush 时计算）
     */
    displayDepth?: number
    
    /**
     * 是否已输出（新增）
     */
    outputted: boolean
    
    /**
     * 是否已退出（新增）
     */
    hasExited: boolean
    
    /**
     * Or 后缀标记（进入时计算）
     * - "" - 无 Or 标记
     * - " [Or]" - Or 父规则
     * - " [#1/3 ✅]" - Or 分支规则
     */
    orSuffix: string
    
    /**
     * 是否可以合并到规则链中
     * - true: 可以合并（无 Or 标记，depth 连续）
     * - false: 不能合并（有 Or 标记）
     */
    canChain: boolean
    
    /**
     * 进入时间戳（用于调试和性能分析）
     */
    timestamp?: number
}

/**
 * Or 分支信息
 */
export interface OrBranchInfo {
    totalBranches: number
    currentBranch: number
    targetDepth: number
    savedPendingLength: number
}

/**
 * 规则追踪上下文（旧版）
 */
export interface RuleTraceContext {
    ruleStack: RuleStackItem[]
    pendingRules: PendingRule[]
    currentOrInfo: OrBranchInfo | null
}

/**
 * 规则追踪上下文（新版 - 数据自包含设计）
 * 
 * 特点：
 * - pendingOutputs 存储完整的计算结果（displayDepth、orSuffix）
 * - 打印时只使用 pendingOutputs 项的字段，不依赖外部状态
 * - ruleStack 和 currentOrInfo 仍保留，但只在进入时用于计算
 */
export interface RuleTraceContextV2 {
    ruleStack: RuleStackItem[]
    pendingOutputs: PendingOutput[]  // 替代 pendingRules
    currentOrInfo: OrBranchInfo | null
}

/**
 * 祖先查找结果
 */
export interface AncestorInfo {
    index: number
    displayDepth: number
}

// ============================================
// SubhutiDebugRuleTracePrint - 规则路径输出工具类
// ============================================

export class SubhutiDebugRuleTracePrint {
    // ========================================
    // 核心输出方法
    // ========================================

    /**
     * 输出所有待处理的规则（主入口）
     * 
     * 功能：
     * - 识别规则链并折叠显示
     * - 输出单个规则或折叠链
     * - 清空 pendingRules 和 currentOrInfo
     * 
     * 副作用：
     * - 修改 ruleStack 中的 outputted 和 displayDepth
     * - 清空 context.pendingRules
     * - 重置 context.currentOrInfo
     * - 输出到控制台
     * 
     * @param context - 规则追踪上下文（需要完整上下文来修改多个状态）
     */
    static flushPendingRules(context: RuleTraceContext): void {
        const validRules = SubhutiDebugRuleTracePrint.getValidRules(
            context.pendingRules,
            context.ruleStack
        )
        
        let i = 0
        while (i < validRules.length) {
            const chainStart = i
            
            // 查找连续递增的链
            while (i + 1 < validRules.length &&
                   validRules[i + 1].depth === validRules[i].depth + 1) {
                // 在 Or 规则前断开
                if (SubhutiDebugRuleTracePrint.getOrSuffix(validRules[i + 1].depth, context.currentOrInfo) !== '') {
                    break
                }
                i++
            }
            
            const chain = validRules.slice(chainStart, i + 1)
            
            // >1 个规则就折叠
            if (chain.length > 1) {
                SubhutiDebugRuleTracePrint.outputCollapsedChain(chain, context.ruleStack)
            } else {
                SubhutiDebugRuleTracePrint.outputRule(chain[0], context.ruleStack, context.currentOrInfo)
            }
            
            i++
        }
        
        // 清空状态
        context.pendingRules.length = 0
        context.currentOrInfo = null
    }

    // ========================================
    // 规则过滤和验证
    // ========================================

    /**
     * 过滤有效规则（去除失败的 Or 分支）
     * 
     * 算法：
     * - 使用 depth 作为索引匹配 ruleStack
     * - 验证规则名称是否一致（双重保险）
     * 
     * @param pendingRules - 待输出的规则列表
     * @param ruleStack - 规则栈
     * @returns 有效的规则列表
     */
    static getValidRules(
        pendingRules: PendingRule[],
        ruleStack: RuleStackItem[]
    ): PendingRule[] {
        const validRules: PendingRule[] = []
        
        // 配对算法：按 depth 匹配
        for (const pending of pendingRules) {
            // 检查 pending.depth 是否在 ruleStack 的有效范围内
            if (pending.depth < ruleStack.length) {
                const stackRule = ruleStack[pending.depth]
                // 验证规则名称是否匹配（双重保险）
                if (stackRule && stackRule.ruleName === pending.ruleName) {
                    validRules.push(pending)
                }
            }
        }

        return validRules
    }

    // ========================================
    // 深度计算
    // ========================================

    /**
     * 查找最近的已输出祖先规则
     * 
     * @param ruleStack - 规则栈
     * @param beforeIndex - 搜索截止位置（不含）
     * @returns 祖先信息或 null
     */
    static findLastOutputAncestor(
        ruleStack: RuleStackItem[],
        beforeIndex: number
    ): AncestorInfo | null {
        // 限制搜索范围：不能超过当前 ruleStack 的长度
        const maxIndex = Math.min(beforeIndex, ruleStack.length)
        
        // 从 maxIndex-1 开始向前遍历 ruleStack，查找最近已输出的祖先
        for (let i = maxIndex - 1; i >= 0; i--) {
            const rule = ruleStack[i]
            // 如果规则已输出且记录了显示深度，说明找到了有效祖先
            if (rule.outputted && rule.displayDepth !== undefined) {
                return { index: i, displayDepth: rule.displayDepth }
            }
        }
        
        // 没有找到任何祖先，返回 null
        return null
    }

    /**
     * 计算规则的显示深度
     * 
     * 算法：
     * - 如果没有祖先：使用真实深度
     * - 如果有祖先：显示深度 = 祖先显示深度 + 相对偏移
     * 
     * @param ruleStack - 规则栈
     * @param realDepth - 真实深度（在 ruleStack 中的索引）
     * @returns 显示深度
     */
    static getDisplayDepth(
        ruleStack: RuleStackItem[],
        realDepth: number
    ): number {
        // 查找最近的已输出祖先
        const ancestor = SubhutiDebugRuleTracePrint.findLastOutputAncestor(ruleStack, realDepth)
        
        // 如果没有祖先（第一批输出的规则），直接使用真实深度
        if (!ancestor) {
            return realDepth
        }
        
        // 基于祖先计算：显示深度 = 祖先显示深度 + 相对偏移
        return ancestor.displayDepth + (realDepth - ancestor.index)
    }

    // ========================================
    // 单个规则输出
    // ========================================

    /**
     * 输出单个规则
     * 
     * 副作用：
     * - 输出到控制台
     * - 修改 ruleStack[rule.depth].outputted = true
     * - 修改 ruleStack[rule.depth].displayDepth
     * 
     * @param rule - 待输出的规则
     * @param ruleStack - 规则栈
     * @param orInfo - Or 分支信息（可能为 null）
     */
    static outputRule(
        rule: PendingRule,
        ruleStack: RuleStackItem[],
        orInfo: OrBranchInfo | null
    ): void {
        // 基于最近祖先计算显示深度
        const displayDepth = SubhutiDebugRuleTracePrint.getDisplayDepth(
            ruleStack,
            rule.depth
        )
        
        // 获取 Or 标记（如果有）
        const orSuffix = SubhutiDebugRuleTracePrint.getOrSuffix(
            rule.depth,
            orInfo
        )
        
        // 格式化输出行
        const line = TreeFormatHelper.formatLine(
            [rule.ruleName, orSuffix],
            { depth: displayDepth }
        )
        console.log(line)
        
        // 标记 ruleStack 中对应规则为已输出，并记录显示深度
        if (rule.depth < ruleStack.length) {
            ruleStack[rule.depth].outputted = true
            ruleStack[rule.depth].displayDepth = displayDepth
        }
    }

    // ========================================
    // 折叠链输出
    // ========================================

    /**
     * 输出折叠的规则链（用 > 连接）
     * 
     * 功能：
     * - 将规则名用 " > " 连接
     * - 如果链长度 >5，简化为：前3个 + ... + 后2个
     * 
     * 副作用：
     * - 输出到控制台
     * - 修改链中所有规则的 outputted = true
     * - 修改链中所有规则的 displayDepth（共享同一深度）
     * 
     * @param chain - 规则链
     * @param ruleStack - 规则栈
     */
    static outputCollapsedChain(
        chain: PendingRule[],
        ruleStack: RuleStackItem[]
    ): void {
        // 提取所有规则名
        const ruleNames = chain.map(r => r.ruleName)
        
        // 如果链长度 >5，简化为：前3个 + ... + 后2个
        const names = ruleNames.length > 5 
            ? [...ruleNames.slice(0, 3), '...', ...ruleNames.slice(-2)]
            : ruleNames
        
        // 基于最近祖先计算折叠链的显示深度
        const displayDepth = SubhutiDebugRuleTracePrint.getDisplayDepth(
            ruleStack,
            chain[0].depth
        )
        
        // 格式化输出行
        const line = TreeFormatHelper.formatLine(
            names,
            { depth: displayDepth, separator: ' > ' }
        )
        console.log(line)
        
        // 标记链中所有规则为已输出，共享同一个显示深度
        for (const rule of chain) {
            // 边界检查：确保规则在 ruleStack 范围内
            if (rule.depth < ruleStack.length) {
                ruleStack[rule.depth].outputted = true
                ruleStack[rule.depth].displayDepth = displayDepth
            }
        }
    }

    // ========================================
    // Or 分支标记
    // ========================================

    /**
     * 获取 Or 后缀标记
     * 
     * 规则：
     * - Or 父规则（targetDepth - 1）：显示 " [Or]"
     * - Or 分支规则（targetDepth）：显示 " [#X/Y ✅]"
     * - 其他规则：返回空字符串
     * 
     * @param ruleDepth - 规则深度
     * @param orInfo - Or 分支信息（可能为 null）
     * @returns Or 后缀字符串
     */
    static getOrSuffix(
        ruleDepth: number,
        orInfo: OrBranchInfo | null
    ): string {
        if (!orInfo) return ''

        // Or 父规则
        if (ruleDepth === orInfo.targetDepth - 1) {
            return ' [Or]'
        }

        // Or 分支规则
        if (ruleDepth === orInfo.targetDepth) {
            return ` [#${orInfo.currentBranch + 1}/${orInfo.totalBranches} ✅]`
        }

        return ''
    }

    // ========================================
    // 新版输出方法（数据自包含）
    // ========================================

    /**
     * 输出单个规则（数据自包含版本）
     * 
     * 特点：
     * - 不读取任何外部状态（ruleStack、currentOrInfo）
     * - 只使用 item 自己的字段
     * - 可以调用格式化函数（formatLine）
     * - 输出后标记 ruleStack（用于后续规则的 displayDepth 计算）
     * 
     * @param item - 缓冲区项（包含所有需要的数据）
     * @param ruleStack - 规则栈（用于标记输出状态）
     * 
     * @example
     * ```typescript
     * const item = {
     *   ruleName: "Statement",
     *   displayDepth: 2,
     *   orSuffix: " [#1/3 ✅]",
     *   ...
     * }
     * outputSelfContainedItem(item, ruleStack)
     * // 输出: "    Statement [#1/3 ✅]"
     * ```
     */
    static outputSelfContainedItem(
        item: PendingOutput,
        ruleStack: RuleStackItem[]
    ): void {
        // ✅ 只使用 item 的字段，不读取外部状态
        const line = TreeFormatHelper.formatLine(
            [item.ruleName, item.orSuffix],
            { depth: item.displayDepth }
        )
        
        console.log(line)
        
        // ✅ 标记 ruleStack（关键！用于后续规则的祖先查找）
        if (item.depth < ruleStack.length) {
            ruleStack[item.depth].outputted = true
            ruleStack[item.depth].displayDepth = item.displayDepth
        }
    }

    /**
     * 输出规则链（数据自包含版本）
     * 
     * 特点：
     * - 不读取任何外部状态
     * - 只使用 chain 数组中各项的字段
     * - 自动简化长链（>5 个规则）
     * - 输出后标记 ruleStack（用于后续规则的 displayDepth 计算）
     * 
     * @param chain - 缓冲区项数组
     * @param ruleStack - 规则栈（用于标记输出状态）
     * 
     * @example
     * ```typescript
     * const chain = [
     *   { ruleName: "Script", displayDepth: 0, ... },
     *   { ruleName: "Statement", displayDepth: 0, ... },
     *   { ruleName: "LetDeclaration", displayDepth: 0, ... }
     * ]
     * outputSelfContainedChain(chain, ruleStack)
     * // 输出: "Script > Statement > LetDeclaration"
     * ```
     */
    static outputSelfContainedChain(
        chain: PendingOutput[],
        ruleStack: RuleStackItem[]
    ): void {
        if (chain.length === 0) return
        
        // ✅ 只使用 chain 的数据
        const ruleNames = chain.map(item => item.ruleName)
        
        // 简化长链：>5 个规则时，显示前3个 + ... + 后2个
        const names = ruleNames.length > 5 
            ? [...ruleNames.slice(0, 3), '...', ...ruleNames.slice(-2)]
            : ruleNames
        
        // ✅ displayDepth 从 chain[0] 读取（链中所有项共享同一显示深度）
        const line = TreeFormatHelper.formatLine(
            names,
            { depth: chain[0].displayDepth, separator: ' > ' }
        )
        
        console.log(line)
        
        // ✅ 标记链中所有规则为已输出（关键！用于后续规则的祖先查找）
        for (const item of chain) {
            if (item.depth < ruleStack.length) {
                ruleStack[item.depth].outputted = true
                ruleStack[item.depth].displayDepth = chain[0].displayDepth  // 共享同一显示深度
            }
        }
    }

    /**
     * 过滤有效输出（去除失败的 Or 分支）
     * 
     * 算法：
     * - 验证 pendingOutputs[i].depth 对应的 ruleStack 中规则名是否匹配
     * - 只保留匹配的项（成功的路径）
     * 
     * @param pendingOutputs - 待输出列表
     * @param ruleStack - 规则栈（用于验证）
     * @returns 有效的输出列表
     */
    static filterValidOutputs(
        pendingOutputs: PendingOutput[],
        ruleStack: RuleStackItem[]
    ): PendingOutput[] {
        return pendingOutputs.filter(item => {
            // 边界检查
            if (item.depth >= ruleStack.length) {
                return false
            }
            
            // 验证规则名是否匹配
            return ruleStack[item.depth].ruleName === item.ruleName
        })
    }

    /**
     * 输出所有有效的缓冲区项（新版主入口）
     * 
     * 功能：
     * - 过滤有效输出（去除失败的 Or 分支）
     * - 识别规则链并合并输出
     * - 单个规则单独输出
     * - 标记 ruleStack 的输出状态（用于后续规则的 displayDepth 计算）
     * - 清空缓冲区
     * 
     * 特点：
     * - 打印时只使用缓冲区项的字段
     * - 过滤时需要 ruleStack 验证（无法避免）
     * - 输出后标记 ruleStack（关键！）
     * 
     * @param context - 规则追踪上下文
     */
    static flushPendingOutputs(context: RuleTraceContextV2): void {
        // 1️⃣ 过滤待输出的项（outputted = false）
        const toOutput = context.pendingOutputs.filter(item => !item.outputted)
        
        if (toOutput.length === 0) {
            return
        }
        
        // 2️⃣ 查找基准深度（最后一个 outputted=true && hasExited=false）
        let baseDepth = -1
        for (let i = context.pendingOutputs.length - 1; i >= 0; i--) {
            const item = context.pendingOutputs[i]
            if (item.outputted && !item.hasExited && item.displayDepth !== undefined) {
                baseDepth = item.displayDepth
                break
            }
        }
        
        let begin = baseDepth === -1 ? 0 : baseDepth + 1
        
        // 3️⃣ 识别链并计算 displayDepth
        let i = 0
        while (i < toOutput.length) {
            // 查找连续的可折叠链
            const chain: PendingOutput[] = []
            let j = i
            
            // 链的条件：
            // - canChain = true（无 Or 标记）
            // - depth 连续递增
            while (j < toOutput.length && toOutput[j].canChain) {
                if (chain.length === 0 || 
                    toOutput[j].depth === chain[chain.length - 1].depth + 1) {
                    chain.push(toOutput[j])
                    j++
                } else {
                    break
                }
            }
            
            if (chain.length > 1) {
                // 链：共享 displayDepth
                for (const item of chain) {
                    item.displayDepth = begin
                }
                SubhutiDebugRuleTracePrint.outputChain(chain)
                i = j
            } else {
                // 单独：使用 begin，然后递增
                toOutput[i].displayDepth = begin
                SubhutiDebugRuleTracePrint.outputSingle(toOutput[i])
                begin++
                i++
            }
        }
        
        // 4️⃣ 标记已输出
        for (const item of toOutput) {
            item.outputted = true
        }
        
        // 5️⃣ 清理已退出的项（部分清空）
        context.pendingOutputs = context.pendingOutputs.filter(item => !item.hasExited)
    }

    /**
     * 输出单个规则（新版 - 不标记 ruleStack）
     * 
     * @param item - 待输出项
     */
    static outputSingle(item: PendingOutput): void {
        const line = TreeFormatHelper.formatLine(
            [item.ruleName, item.orSuffix],
            { depth: item.displayDepth! }
        )
        console.log(line)
    }

    /**
     * 输出规则链（新版 - 不标记 ruleStack）
     * 
     * @param chain - 规则链
     */
    static outputChain(chain: PendingOutput[]): void {
        if (chain.length === 0) return
        
        const ruleNames = chain.map(item => item.ruleName)
        
        // 简化长链：>5 个规则时，显示前3个 + ... + 后2个
        const names = ruleNames.length > 5 
            ? [...ruleNames.slice(0, 3), '...', ...ruleNames.slice(-2)]
            : ruleNames
        
        const line = TreeFormatHelper.formatLine(
            names,
            { depth: chain[0].displayDepth!, separator: ' > ' }
        )
        
        console.log(line)
    }
}

