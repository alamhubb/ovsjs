/**
 * Subhuti Debug - 统一调试和性能分析系统（v4.0）
 * 
 * 设计理念：
 * - YAGNI：只实现实际需要的功能
 * - 简单优于复杂：统一入口，清晰的输出
 * - 职责分离：追踪器（有状态）+ 工具集（无状态）
 * 
 * 架构：
 * - SubhutiDebugUtils - 无状态工具集（CST分析、Token验证、高级调试）
 * - SubhutiTraceDebugger - 有状态追踪器（过程追踪、性能统计、自动输出）
 * 
 * 功能：
 * - ✅ 规则执行追踪（进入/退出）
 * - ✅ Token 消费显示（成功/失败）
 * - ✅ 缓存命中标识（⚡CACHED）
 * - ✅ 耗时信息
 * - ✅ 嵌套层级（缩进）
 * - ✅ Or 分支选择
 * - ✅ 回溯标识
 * - ✅ 性能统计（totalCalls, avgTime, cacheHits）
 * - ✅ Top N 慢规则（简化输出）
 * - ✅ 二分增量调试（bisectDebug）
 * - ✅ CST 结构验证
 * - ✅ Token 完整性检查
 * 
 * @version 4.0.0 - 职责分离 + 通用调试工具
 * @date 2025-11-06
 */

// ============================================
// 类型定义
// ============================================

/**
 * 规则性能统计
 */
export interface RuleStats {
    ruleName: string
    totalCalls: number          // 总调用次数（含缓存命中）
    actualExecutions: number    // 实际执行次数（不含缓存）
    cacheHits: number          // 缓存命中次数
    totalTime: number          // 总耗时（含缓存查询）
    executionTime: number      // 实际执行耗时（不含缓存）
    avgTime: number            // 平均耗时（仅实际执行）
}

// ============================================
// SubhutiDebugger - 调试器接口
// ============================================

/**
 * 调试器接口（v6.0 - 精简优化）
 * 
 * Parser 通过此接口通知调试器解析过程中的事件
 * 
 * 设计原则：
 * - 只保留实际使用的参数
 * - 移除冗余和可推导的参数
 * - 移除空实现的方法
 */
export interface SubhutiDebugger {
    /**
     * 规则进入事件
     * @param ruleName - 规则名称
     * @returns 上下文对象（用于计算耗时，通常返回 startTime）
     */
    onRuleEnter(ruleName: string): unknown
    
    /**
     * 规则退出事件
     * @param ruleName - 规则名称
     * @param cacheHit - 是否为缓存命中
     * @param context - onRuleEnter 返回的上下文（用于计算耗时）
     */
    onRuleExit(
        ruleName: string, 
        cacheHit: boolean,
        context?: unknown
    ): void
    
    /**
     * Token 消费事件
     * @param tokenIndex - Token 索引位置
     * @param tokenValue - Token 值
     * @param tokenName - Token 类型名
     * @param success - 是否消费成功
     */
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void
    
    /**
     * Or 分支尝试事件
     * @param branchIndex - 当前分支索引（0-based）
     * @param totalBranches - 总分支数
     * 
     * 注意：
     * - isRetry 可由 branchIndex > 0 推导
     * - ruleName 可通过后续 onRuleEnter 获取
     */
    onOrBranch?(
        branchIndex: number,
        totalBranches: number
    ): void
    
    /**
     * 回溯事件
     * @param fromTokenIndex - 回溯起始位置
     * @param toTokenIndex - 回溯目标位置
     * 
     * 注意：当前实现为空，但保留用于未来性能分析
     */
    onBacktrack?(
        fromTokenIndex: number,
        toTokenIndex: number
    ): void
}

// ============================================
// SubhutiTraceDebugger - 统一调试器（v3.0）
// ============================================

/**
 * Subhuti 轨迹调试器（v4.0 - 极简版）
 * 
 * 设计原则：
 * - 调用 debug() = 输出所有诊断信息
 * - 不调用 = 无输出
 * - 无参数，无多余方法
 * 
 * 整合功能：
 * - 过程追踪（规则进入/退出、Token 消费、Or 分支、回溯）
 * - 性能统计（调用次数、耗时、缓存命中率）
 * - CST 结构验证（null/undefined/children 检测）
 * - Token 完整性检查（输入 vs CST 对比）
 * - CST 统计分析（节点数、深度、类型分布）
 * - CST 可视化（树形结构展示）
 * 
 * 使用示例：
 * ```typescript
 * const parser = new MyParser(tokens)
 * parser.debug()  // 开启调试，输出所有信息
 * const cst = parser.Script()
 * ```
 * 
 * ============================================================
 * ⚠️ 已知限制 - Or 分支的 Token 消费输出
 * ============================================================
 * 
 * 当前实现会输出 Or 分支中所有成功的 Token 消费，包括失败分支的局部成功消费。
 * 这可能导致同一个 Token 被显示多次消费。
 * 
 * 【示例】代码：`const obj = { sum: 5 + 6 }`
 * 
 * ObjectLiteral 有3个分支：
 *   - 分支0: { }                      → 失败（缺少 }）
 *   - 分支1: { PropertyDefinitionList , } → 失败（缺少尾部逗号）
 *   - 分支2: { PropertyDefinitionList }   → 成功 ✅
 * 
 * 输出会显示：
 *   ObjectLiteral
 *     🔹 Consume token[3] - { - <LBrace> [1:13-13] ✅  ← 分支0的消费
 *     🔹 Consume token[3] - { - <LBrace> [1:13-13] ✅  ← 分支1的消费
 *     🔹 Consume token[3] - { - <LBrace> [1:13-13] ✅  ← 分支2的消费（成功）
 *     PropertyDefinitionList > ...
 * 
 * 【原因】
 * - Token 消费是立即输出的（实时追踪）
 * - 当 Or 分支失败时，已输出的内容无法撤销
 * - 回溯机制只恢复 tokenIndex，不会撤销输出
 * 
 * 【价值】
 * - ✅ 可以看到 Or 分支的所有尝试过程（调试价值）
 * - ✅ 帮助发现 Or 分支顺序问题（性能优化）
 * - ✅ 展示解析器的动态行为（教学价值）
 * 
 * 【与 CST 的区别】
 * - 规则路径：记录动态过程（包括失败的尝试）
 * - CST 结构：只显示最终成功路径（静态结果）
 * 
 * 【未来改进】
 * - 需要实现 Or 分支输出缓冲机制
 * - 在 Or 分支成功后才输出缓冲内容
 * - 需要修改 SubhutiParser 添加 onOrSuccess 回调
 * 
 * ============================================================
 * 缩进规则（v3.0 - 智能缩进）
 * ============================================================
 * 
 * ✅ 取消默认层级缩进
 *    - 不再根据规则嵌套深度自动缩进
 * 
 * ✅ 同级垂直对齐
 *    - 同一父节点下的所有子节点必须垂直对齐
 *    - 所有推格规则只影响子级，同级始终对齐
 * 
 * ✅ Or/Many/AtLeastOne：第一条规则的子级推1格
 *    - 第一条规则本身不推，其子级推1格（2个空格）
 * 
 * ✅ Consume：自己推1格
 *    - Consume 语句本身推1格（2个空格）
 *    - 不影响 Consume 的同级规则
 * 
 * ✅ 消费Token后：当前规则的后续子规则推1格（不影响兄弟）
 *    - 规则内部消费 token 后，该规则的子级推1格（2个空格）
 *    - 不影响该规则的同级规则
 * 
 * ✅ Option：包裹内容的子级推1格
 *    - Option 包裹内容的子级推1格（2个空格）
 *    - 不影响同级规则
 * 
 * 🔄 累积效果：
 *    - 多个推格规则可以累积（例如：Or +2空格 + 消费Token +2空格 = +4空格）
 *    - 累积只作用于子级，同级始终保持对齐
 * 
 * ============================================================
 * 输出格式示例（代码：let count = 1）
 * ============================================================
 * 
 * 【解析过程 - 实时输出】
 * ──────────────────────────────────────
 * ➡️  Script
 * ➡️  StatementList
 * 🔀 Or → trying Statement (#0/2)
 * ➡️  Statement
 *   ➡️  VariableStatement
 *   ➡️  VariableDeclaration
 *   ➡️  LetDeclaration
 *     🔹 Consume  token[0] - let - <LetTok>  ✅
 *     ➡️  BindingList
 *     ➡️  LexicalBinding
 *     ➡️  BindingIdentifier
 *       🔹 Consume  token[1] - count - <Identifier>  ✅
 *     ➡️  Initializer
 *       🔹 Consume  token[2] - = - <Assign>  ✅
 *       ➡️  AssignmentExpression
 *       ➡️  ConditionalExpression
 *       ➡️  PrimaryExpression
 *       ➡️  Literal
 *         🔹 Consume  token[3] - 1 - <DecimalLiteral>  ✅
 * ⏪ Backtrack  token[4] → token[4]
 * 
 * ============================================================
 * 
 * 【第一部分：性能摘要】
 * ──────────────────────────────────────
 * 
 * ⏱️  性能摘要
 * ────────────────────────────────────────
 * 总耗时: 0.75ms
 * 总调用: 25 次
 * 实际执行: 25 次
 * 缓存命中: 0 次 (0.0%)
 * 
 * Top 5 慢规则:
 *   1. Script: 0.75ms (1次, 平均750.0μs)
 *   2. StatementList: 0.68ms (1次, 平均680.0μs)
 *   3. Statement: 0.55ms (1次, 平均550.0μs)
 *   4. VariableStatement: 0.52ms (1次, 平均520.0μs)
 *   5. VariableDeclaration: 0.48ms (1次, 平均480.0μs)
 * 
 * 📋 所有规则详细统计:
 *   Script: 1次 | 执行1次 | 耗时0.75ms | 缓存0%
 *   StatementList: 1次 | 执行1次 | 耗时0.68ms | 缓存0%
 *   Statement: 1次 | 执行1次 | 耗时0.55ms | 缓存0%
 *   VariableStatement: 1次 | 执行1次 | 耗时0.52ms | 缓存0%
 *   VariableDeclaration: 1次 | 执行1次 | 耗时0.48ms | 缓存0%
 *   ... (更多规则)
 * 
 * ============================================================
 * 
 * 【第二部分：CST 验证报告】
 * ──────────────────────────────────────
 * 
 * 🔍 CST 验证报告
 * ────────────────────────────────────────
 * 
 * 📌 结构完整性: ✅
 *    无结构错误
 * 
 * 📌 Token 完整性: ✅
 *    输入 tokens: 4 个
 *    CST tokens:  4 个
 *    输入列表: [let, count, =, 1]
 *    CST列表:  [let, count, =, 1]
 *    ✅ 完整保留
 * 
 * 📌 CST 统计:
 *    总节点数: 28
 *    叶子节点: 4
 *    最大深度: 13
 *    节点类型: 14 种
 * 
 *    节点类型分布:
 *      Script: 1
 *      StatementList: 1
 *      Statement: 1
 *      VariableStatement: 1
 *      VariableDeclaration: 1
 *      ... (更多类型)
 * 
 * ────────────────────────────────────────
 * 
 * 【第三部分：CST 可视化】
 * ──────────────────────────────────────
 * 
 * 📊 CST 结构
 * ────────────────────────────────────────
 * └─Script [1:1-12]
 *    └─StatementList [1:1-12]
 *       └─Statement [1:1-12]
 *          └─VariableStatement [1:1-12]
 *             └─VariableDeclaration [1:1-12]
 *                └─LetDeclaration [1:1-12]
 *                   ├─LetTok: "let" [1:1-3]
 *                   └─BindingList [1:5-12]
 *                      └─LexicalBinding [1:5-12]
 *                         ├─BindingIdentifier [1:5-9]
 *                         │  └─Identifier: "count" [1:5-9]
 *                         └─Initializer [1:11-12]
 *                            ├─Assign: "=" [1:11-11]
 *                            └─AssignmentExpression [1:13-13]
 *                               └─ConditionalExpression [1:13-13]
 *                                  └─PrimaryExpression [1:13-13]
 *                                     └─Literal [1:13-13]
 *                                        └─DecimalLiteral: "1" [1:13-13]
 * ────────────────────────────────────────
 * 
 * ============================================================
 * 🎉 Debug 输出完成
 * ============================================================
 * 
 * 注意：
 * - 此输出格式可能随版本更新而调整
 * - 如需修改格式，请同步更新此注释中的示例
 */

import type SubhutiCst from "./struct/SubhutiCst.ts"

// ============================================
// TreeFormatHelper - 树形输出格式化辅助（轻量级）
// ============================================

/**
 * 树形输出格式化辅助类
 * 
 * 设计原则：
 * - 只提取真正重复的格式化部分
 * - 保持简单，避免过度抽象
 * - 为运行时追踪和 CST 输出提供统一的格式化工具
 * 
 * 核心功能：
 * 1. formatLine - 统一的行输出格式化（自动处理缩进、拼接、过滤空值）
 * 2. formatTokenValue - Token 值转义和截断
 * 3. formatLocation - 位置信息格式化
 * 4. formatRuleChain - 规则链拼接
 * 
 * @version 2.0.0
 * @date 2025-11-07
 */
class TreeFormatHelper {
    // ========================================
    // 核心方法：统一行输出
    // ========================================
    
    /**
     * 格式化一行输出（核心方法）
     * 
     * 功能：
     * - 自动处理缩进（depth 或 prefix）
     * - 自动拼接内容数组
     * - 自动过滤空值（null/undefined/''）
     * - 统一管理分隔符
     * 
     * @param parts - 内容数组（null/undefined/'' 会被自动过滤）
     * @param options - 配置选项
     * @returns 格式化后的完整行
     * 
     * @example
     * // CST 节点输出
     * formatLine(
     *     ['└─', 'ConstTok:', '"const"', '[1:1-5]'],
     *     { prefix: '│  ', separator: ' ' }
     * )
     * // => "│  └─ ConstTok: "const" [1:1-5]"
     * 
     * @example
     * // 规则链输出（自动过滤空值）
     * formatLine(
     *     ['Script', 'StatementList', 'Statement', null],
     *     { depth: 0, separator: ' > ' }
     * )
     * // => "Script > StatementList > Statement"
     * 
     * @example
     * // Token 消费输出
     * formatLine(
     *     ['🔹 Consume', 'token[0]', '-', 'const', '-', '<ConstTok>', '✅'],
     *     { depth: 3, separator: ' ' }
     * )
     * // => "      🔹 Consume token[0] - const - <ConstTok> ✅"
     */
    static formatLine(
        parts: (string | number | null | undefined)[],
        options: {
            depth?: number      // 深度模式（优先使用）
            prefix?: string     // 前缀模式（已累积的前缀字符串）
            separator?: string  // 内容分隔符（默认：''，即紧贴）
        }
    ): string {
        // 1. 计算缩进
        const indent = options.prefix ?? '  '.repeat(options.depth ?? 0)
        
        // 2. 过滤空值并拼接（核心价值）
        const content = parts
            .filter(p => p !== null && p !== undefined && p !== '')
            .join(options.separator ?? '')
        
        // 3. 返回完整行
        return indent + content
    }
    
    // ========================================
    // 辅助方法：值格式化
    // ========================================
    
    /**
     * 计算缩进字符串
     * 
     * @param depth - 深度（0-based）
     * @returns 缩进字符串（每层 2 个空格）
     * 
     * @example
     * ```typescript
     * TreeFormatHelper.indent(0)  // => ""
     * TreeFormatHelper.indent(1)  // => "  "
     * TreeFormatHelper.indent(3)  // => "      "
     * ```
     */
    static indent(depth: number): string {
        return '  '.repeat(depth)
    }
    
    /**
     * 格式化 Token 值（处理特殊字符和长度限制）
     * 
     * 用于两个场景：
     * - 运行时追踪：token[0] - "const" - <ConstTok>
     * - CST 输出：ConstTok: "const"
     * 
     * @param value - 原始值
     * @param maxLength - 最大长度（超过则截断）
     * @returns 转义并截断后的值
     * 
     * @example
     * ```typescript
     * TreeFormatHelper.formatTokenValue("hello\nworld")  // => "hello\\nworld"
     * TreeFormatHelper.formatTokenValue("a".repeat(50), 20)  // => "aaaaa...（截断）"
     * ```
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
     * @returns 格式化的位置字符串
     * 
     * @example
     * ```typescript
     * TreeFormatHelper.formatLocation({
     *     start: {line: 1, column: 1},
     *     end: {line: 1, column: 5}
     * })  // => "[1:1-5]"
     * 
     * TreeFormatHelper.formatLocation({
     *     start: {line: 1, column: 1},
     *     end: {line: 3, column: 10}
     * })  // => "[1:1-3:10]"
     * ```
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
     * @returns 连接后的规则链字符串
     * 
     * @example
     * ```typescript
     * TreeFormatHelper.formatRuleChain([
     *     'Script', 'StatementList', 'Statement'
     * ])  // => "Script > StatementList > Statement"
     * 
     * TreeFormatHelper.formatRuleChain(['A', 'B'], ' → ')
     * // => "A → B"
     * ```
     */
    static formatRuleChain(rules: string[], separator: string = ' > '): string {
        return rules.join(separator)
    }
}

// ============================================
// SubhutiDebugUtils - 调试工具集（v4.0）
// ============================================

/**
 * Subhuti 调试工具集
 * 
 * 职责：
 * - 提供独立的调试工具（无状态）
 * - CST 分析、Token 验证、高级调试方法
 * 
 * 使用场景：
 * - 测试脚本直接调用
 * - 外部工具集成
 * - 自定义验证逻辑
 * 
 * @version 4.0.0 - 职责分离
 * @date 2025-11-06
 */
export class SubhutiDebugUtils {
    // ========================================
    // CST Token 分析
    // ========================================
    
    /**
     * 收集 CST 中的所有 token 值
     * 
     * @param node - CST 节点
     * @returns token 值数组
     * 
     * @example
     * ```typescript
     * const cst = parser.Script()
     * const tokens = SubhutiDebugUtils.collectTokens(cst)
     * console.log(tokens)  // ['const', 'obj', '=', '{', 'sum', ':', '5', '+', '6', '}']
     * ```
     */
    static collectTokens(node: any): string[] {
        const values: string[] = []

        if (!node) return values

        if (node.value !== undefined && (!node.children || node.children.length === 0)) {
            values.push(node.value)
        }

        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                values.push(...SubhutiDebugUtils.collectTokens(child))
            }
        }

        return values
    }
    
    /**
     * 验证 CST 的 token 完整性
     * 
     * @param cst - CST 节点
     * @param inputTokens - 输入 token 数组或 token 值数组
     * @returns 验证结果
     * 
     * @example
     * ```typescript
     * const result = SubhutiDebugUtils.validateTokenCompleteness(cst, tokens)
     * if (result.complete) {
     *     console.log('✅ Token 完整')
     * } else {
     *     console.log('❌ 缺失:', result.missing)
     * }
     * ```
     */
    static validateTokenCompleteness(
        cst: any,
        inputTokens: string[] | any[]
    ): {
        complete: boolean
        inputCount: number
        cstCount: number
        inputTokens: string[]
        cstTokens: string[]
        missing: string[]
    } {
        // 提取 token 值
        const inputValues = inputTokens.map(t => 
            typeof t === 'string' ? t : (t.tokenValue || '')
        ).filter(v => v !== '')
        
        const cstTokens = SubhutiDebugUtils.collectTokens(cst)
        
        // 找出缺失的 token（按顺序比较）
        const missing: string[] = []
        for (let i = 0; i < inputValues.length; i++) {
            if (i >= cstTokens.length || inputValues[i] !== cstTokens[i]) {
                missing.push(inputValues[i])
            }
        }
        
        return {
            complete: missing.length === 0 && inputValues.length === cstTokens.length,
            inputCount: inputValues.length,
            cstCount: cstTokens.length,
            inputTokens: inputValues,
            cstTokens: cstTokens,
            missing: missing
        }
    }
    
    // ========================================
    // CST 结构验证
    // ========================================
    
    /**
     * 验证 CST 结构完整性
     * 
     * @param node - CST 节点
     * @param path - 节点路径（用于错误报告）
     * @returns 错误列表
     */
    static validateStructure(
        node: any,
        path: string = 'root'
    ): Array<{path: string, issue: string, node?: any}> {
        const errors: Array<{path: string, issue: string, node?: any}> = []

        if (node === null) {
            errors.push({ path, issue: 'Node is null' })
            return errors
        }

        if (node === undefined) {
            errors.push({ path, issue: 'Node is undefined' })
            return errors
        }

        if (!node.name && node.value === undefined) {
            errors.push({
                path,
                issue: 'Node has neither name nor value',
                node: { ...node, children: node.children ? `[${node.children.length} children]` : undefined }
            })
        }

        if (node.children !== undefined) {
            if (!Array.isArray(node.children)) {
                errors.push({
                    path,
                    issue: `children is not an array (type: ${typeof node.children})`,
                    node: { name: node.name, childrenType: typeof node.children }
                })
                return errors
            }

            node.children.forEach((child: any, index: number) => {
                const childPath = `${path}.children[${index}]`

                if (child === null) {
                    errors.push({ path: childPath, issue: 'Child is null' })
                    return
                }

                if (child === undefined) {
                    errors.push({ path: childPath, issue: 'Child is undefined' })
                    return
                }

                const childErrors = SubhutiDebugUtils.validateStructure(child, childPath)
                errors.push(...childErrors)
            })
        }

        if (node.value !== undefined && node.children && node.children.length > 0) {
            errors.push({
                path,
                issue: `Leaf node has both value and non-empty children`,
                node: { name: node.name, value: node.value, childrenCount: node.children.length }
            })
        }

        return errors
    }
    
    /**
     * 获取 CST 统计信息
     * 
     * @param node - CST 节点
     * @returns 统计信息
     */
    static getCSTStatistics(node: any): {
        totalNodes: number
        leafNodes: number
        maxDepth: number
        nodeTypes: Map<string, number>
    } {
        const stats = {
            totalNodes: 0,
            leafNodes: 0,
            maxDepth: 0,
            nodeTypes: new Map<string, number>()
        }

        const traverse = (node: any, depth: number) => {
            if (!node) return

            stats.totalNodes++
            stats.maxDepth = Math.max(stats.maxDepth, depth)

            if (node.name) {
                stats.nodeTypes.set(node.name, (stats.nodeTypes.get(node.name) || 0) + 1)
            }

            if (!node.children || node.children.length === 0) {
                stats.leafNodes++
            } else {
                for (const child of node.children) {
                    traverse(child, depth + 1)
                }
            }
        }

        traverse(node, 0)
        return stats
    }
    
    /**
     * 格式化 CST 为树形结构字符串
     * 
     * @param cst - CST 节点
     * @param prefix - 前缀（递归使用）
     * @param isLast - 是否为最后一个子节点（递归使用）
     * @returns 树形结构字符串
     */
    static formatCst(cst: any, prefix: string = '', isLast: boolean = true): string {
        const lines: string[] = []
        
        // 当前节点行
        const connector = isLast ? '└─' : '├─'
        const nodeLine = SubhutiDebugUtils.formatNode(cst, prefix, connector)
        lines.push(nodeLine)
        
        // 子节点
        if (cst.children && cst.children.length > 0) {
            const childPrefix = prefix + (isLast ? '   ' : '│  ')
            
            cst.children.forEach((child: any, index: number) => {
                const isLastChild = index === cst.children.length - 1
                lines.push(SubhutiDebugUtils.formatCst(child, childPrefix, isLastChild))
            })
        }
        
        return lines.join('\n')
    }
    
    /**
     * 格式化单个节点（使用 TreeFormatHelper）
     */
    private static formatNode(cst: any, prefix: string, connector: string): string {
        const isToken = cst.value !== undefined
        
        if (isToken) {
            // Token 节点：显示名称、值、位置
            const value = TreeFormatHelper.formatTokenValue(cst.value)
            const location = cst.loc ? TreeFormatHelper.formatLocation(cst.loc) : null
            
            return TreeFormatHelper.formatLine(
                [connector, cst.name + ':', `"${value}"`, location],
                { prefix, separator: ' ' }
            )
        } else {
            // Rule 节点：只显示名称
            return TreeFormatHelper.formatLine(
                [connector, cst.name],
                { prefix }
            )
        }
    }
    
    // 注意：formatValue 和 formatLocation 已移至 TreeFormatHelper
    // 保留这些方法作为向后兼容的别名
    
    /**
     * @deprecated 请使用 TreeFormatHelper.formatTokenValue()
     */
    private static formatValue(value: string): string {
        return `"${TreeFormatHelper.formatTokenValue(value)}"`
    }
    
    /**
     * @deprecated 请使用 TreeFormatHelper.formatLocation()
     */
    private static formatLocation(loc: any): string {
        return TreeFormatHelper.formatLocation(loc)
    }
    
    // ========================================
    // 高级调试方法
    // ========================================
    
    /**
     * 二分增量调试 - 从最底层规则逐层测试到顶层
     * 
     * 这是一个强大的调试工具，用于快速定位问题层级。
     * 它会从最底层规则开始逐层测试，直到找到第一个失败的层级。
     * 
     * @param tokens - 输入 token 流
     * @param ParserClass - Parser 类（构造函数）
     * @param levels - 测试层级配置（从底层到顶层）
     * @param options - 可选配置
     * @param options.enableDebugOnLastLevel - 是否在最后一层启用 debug（默认 true）
     * @param options.stopOnFirstError - 遇到第一个错误时停止（默认 true）
     * @param options.showStackTrace - 显示堆栈跟踪（默认 true）
     * @param options.stackTraceLines - 堆栈跟踪显示行数（默认 10）
     * 
     * @example
     * ```typescript
     * import { SubhutiDebugUtils } from 'subhuti/src/SubhutiDebug'
     * import Es2025Parser from './Es2025Parser'
     * 
     * const tokens = lexer.tokenize("let count = 1")
     * 
     * SubhutiDebugUtils.bisectDebug(tokens, Es2025Parser, [
     *     { name: 'LexicalDeclaration', call: (p) => p.LexicalDeclaration({In: true}) },
     *     { name: 'Declaration', call: (p) => p.Declaration() },
     *     { name: 'StatementListItem', call: (p) => p.StatementListItem() },
     *     { name: 'Script', call: (p) => p.Script() }
     * ], { enableDebugOnLastLevel: false })
     * ```
     */
    static bisectDebug(
        tokens: any[],
        ParserClass: new (tokens: any[]) => any,
        levels: Array<{
            name: string
            call: (parser: any) => any
        }>,
        options?: {
            enableDebugOnLastLevel?: boolean
            stopOnFirstError?: boolean
            showStackTrace?: boolean
            stackTraceLines?: number
        }
    ): void {
        // 默认选项
        const opts = {
            enableDebugOnLastLevel: true,
            stopOnFirstError: true,
            showStackTrace: true,
            stackTraceLines: 10,
            ...options
        }
        
        console.log('\n🔬 二分增量调试模式')
        console.log('='.repeat(80))
        console.log('策略：从最底层规则逐层测试，找出问题层级\n')
        
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i]
            
            console.log(`\n[${'▸'.repeat(i + 1)}] 测试层级 ${i + 1}: ${level.name}`)
            console.log('-'.repeat(80))
            
            try {
                // 创建 parser 实例
                const parser = new ParserClass(tokens)
                
                // 在最后一层（顶层规则）开启 debug（如果支持且已启用）
                if (opts.enableDebugOnLastLevel && i === levels.length - 1) {
                    if (typeof parser.debug === 'function') {
                        parser.debug()
                    }
                }
                
                const result = level.call(parser)
                
                if (!result) {
                    console.log(`\n⚠️ ${level.name} 返回 undefined`)
                    continue
                }
                
                // 验证 token 完整性
                const validation = SubhutiDebugUtils.validateTokenCompleteness(result, tokens)
                
                if (validation.complete) {
                    console.log(`\n✅ ${level.name} 解析成功（Token完整: ${validation.cstCount}/${validation.inputCount}）`)
                } else {
                    console.log(`\n❌ ${level.name} Token不完整`)
                    console.log(`   输入tokens: ${validation.inputCount} 个`)
                    console.log(`   CST tokens:  ${validation.cstCount} 个`)
                    console.log(`   输入列表: [${validation.inputTokens.join(', ')}]`)
                    console.log(`   CST列表:  [${validation.cstTokens.join(', ')}]`)
                    
                    if (validation.missing.length > 0) {
                        console.log(`   ❌ 缺失或错位: [${validation.missing.join(', ')}]`)
                    }
                    
                    console.log(`\n🔍 问题定位: ${level.name} 未能消费所有token`)
                    
                    if (i > 0) {
                        console.log(`   ⚠️ 前一层级（${levels[i - 1].name}）也可能有问题`)
                        console.log(`   💡 建议: 检查 ${level.name} 和 ${levels[i - 1].name} 的实现`)
                    } else {
                        console.log(`   💡 建议: 检查 ${level.name} 的实现，确保所有token都被正确处理`)
                    }
                    
                    if (opts.stopOnFirstError) {
                        return // 遇到 token 不完整就停止
                    }
                }
            } catch (error: any) {
                console.log(`\n❌ ${level.name} 解析失败`)
                console.log(`   错误: ${error.message}`)
                console.log(`\n🔍 问题定位: ${level.name} 层级出现错误`)
                
                if (i > 0) {
                    console.log(`   ✅ 前一层级（${levels[i - 1].name}）可以工作`)
                    console.log(`   ❌ 当前层级（${level.name}）出现问题`)
                    console.log(`\n💡 建议: 检查 ${level.name} 的实现，特别是它如何调用 ${levels[i - 1].name}`)
                } else {
                    console.log(`   ❌ 最底层规则（${level.name}）就已经失败`)
                    console.log(`\n💡 建议: 检查 ${level.name} 的实现和 token 定义`)
                }
                
                // 输出堆栈跟踪
                if (opts.showStackTrace && error.stack) {
                    console.log(`\n📋 堆栈跟踪（前${opts.stackTraceLines}行）:`)
                    const stackLines = error.stack.split('\n').slice(0, opts.stackTraceLines)
                    stackLines.forEach((line: string) => console.log(`   ${line}`))
                }
                
                if (opts.stopOnFirstError) {
                    return // 遇到错误就停止
                }
            }
        }
        
        console.log('\n' + '='.repeat(80))
        console.log('🎉 所有层级测试通过！')
        console.log('='.repeat(80))
    }
}

// ============================================
// SubhutiTraceDebugger - 追踪器（v4.0）
// ============================================

/**
 * Subhuti 轨迹调试器（v5.2 - 只显示成功路径）
 * 
 * 职责：
 * - 追踪解析过程（规则进入/退出、Token 消费、Or 分支）
 * - 性能统计（调用次数、耗时、缓存命中率）
 * - 自动输出调试报告
 * 
 * 输出优化：
 * - 只输出成功的路径（失败的分支完全不显示）
 * - 规则链合并显示（用 > 连接）
 * - Or 只显示成功的分支（带规则链）
 * - 只有 Token 消费才右推缩进
 * - 极简输出，信息密度高
 * 
 * @version 5.2.0 - 只显示成功路径，极简输出
 * @date 2025-11-07
 */
export class SubhutiTraceDebugger implements SubhutiDebugger {
    // ========================================
    // 过程追踪数据
    // ========================================
    public ruleStack: Array<{
        ruleName: string
        startTime: number
        outputted: boolean       // 该规则是否已输出
        hasConsumedToken: boolean // 该规则是否消费了 token
    }> = []
    
    // 未输出的规则（等待输出）
    private pendingRules: Array<{
        ruleName: string
        depth: number           // 规则深度
    }> = []
    
    // Or 分支信息（当前活跃的 Or）
    private currentOrInfo: {
        totalBranches: number    // 总分支数
        currentBranch: number    // 当前分支索引（从 0 开始）
        targetDepth: number      // Or 所在的深度
        savedPendingLength: number  // Or开始时的pendingRules长度
    } | null = null
    
    // 视觉深度系统
    private visualDepth = 0
    // 记录上次输出批次结束时的状态（用于计算下次的 visualDepth）
    private lastActualDepth: number | null = null
    private lastVisualDepth: number | null = null

    // ========================================
    // 性能统计数据
    // ========================================
    private stats = new Map<string, RuleStats>()
    
    // ========================================
    // Token 数据
    // ========================================
    private inputTokens: any[] = []  // 存储完整 token 对象（包含位置信息）
    
    // ========================================
    // CST 数据
    // ========================================
    private topLevelCst: SubhutiCst | null = null
    
    /**
     * 构造函数
     * 
     * @param tokens - 输入 token 流（用于完整性检查和位置信息）
     */
    constructor(tokens?: any[]) {
        this.inputTokens = this.extractValidTokens(tokens || [])
    }
    
    /**
     * 从 token 流中提取有效 token（排除注释、空格等）
     * 
     * @returns 完整的 token 对象数组（包含 tokenValue, tokenName, loc 等）
     */
    private extractValidTokens(tokens: any[]): any[] {
        const excludeNames = ['SingleLineComment', 'MultiLineComment', 'Spacing', 'LineBreak']
        return tokens.filter(t => {
            const name = t.tokenName || ''
            return excludeNames.indexOf(name) === -1
        })
    }
    
    // ========================================
    // 辅助方法
    // ========================================
    
    /**
     * 输出待处理的规则
     * 
     * 核心逻辑：
     * 1. 过滤有效规则（去除失败的 Or 分支）
     * 2. 根据 actualDepth 差值调整 visualDepth
     * 3. 识别并折叠规则链（>= 2 个规则）
     * 4. 在 Or 规则前断开链
     */
    private flushPendingRules(): void {
        const validRules = this.getValidRules()
        if (validRules.length === 0) return
        
        // 初始化视觉深度
        const firstRuleActualDepth = validRules[0].depth
        if (this.lastActualDepth === null) {
            this.visualDepth = firstRuleActualDepth
        } else {
            const depthDiff = firstRuleActualDepth - this.lastActualDepth
            this.visualDepth = this.lastVisualDepth! + depthDiff
        }
        
        // 识别链、折叠/输出
        let i = 0
        let lastProcessedActualDepth = this.lastActualDepth
        
        while (i < validRules.length) {
            const chainStart = i
            
            // 查找连续递增的规则链（depth 连续 +1）
            while (i + 1 < validRules.length && 
                   validRules[i + 1].depth === validRules[i].depth + 1) {
                const nextRule = validRules[i + 1]
                // 在 Or 规则前断开链
                if (this.currentOrInfo && 
                    (nextRule.depth === this.currentOrInfo.targetDepth - 1 ||
                     nextRule.depth === this.currentOrInfo.targetDepth)) {
                    break
                }
                i++
            }
            
            const chain = validRules.slice(chainStart, i + 1)
            
            if (chain.length >= 2) {
                this.outputCollapsedChain(chain)
                lastProcessedActualDepth = chain[chain.length - 1].depth
            } else {
                chain.forEach(rule => {
                    if (lastProcessedActualDepth !== null) {
                        this.visualDepth += rule.depth - lastProcessedActualDepth
                    }
                    this.outputRule(rule)
                    lastProcessedActualDepth = rule.depth
                })
            }
            i++
        }
        
        // 记录状态并为 token 准备
        this.lastActualDepth = validRules[validRules.length - 1].depth
        this.lastVisualDepth = this.visualDepth
        this.visualDepth++  // token 比规则缩进 1 层
        
        // 清理状态
        this.pendingRules = []
        this.currentOrInfo = null
    }
    
    /**
     * 获取有效规则（只保留还在规则栈中的规则）
     * 
     * ==========================================
     * Or 分支过滤器 - 去除失败的尝试
     * ==========================================
     * 
     * 为什么需要这个方法？
     * - Or 分支失败时，规则会退出 ruleStack
     * - 但 pendingRules 中仍保留这些规则的记录
     * - 我们只想输出成功的路径，不输出失败的尝试
     * 
     * 工作原理（配对算法）：
     * 1. 获取当前 ruleStack 中的规则名列表
     * 2. 遍历 pendingRules，检查每个规则是否还在 ruleStack 中
     * 3. 只保留仍在 ruleStack 中的规则
     * 
     * 示例（Or 分支）：
     * ```
     * 进入 BindingIdentifier                     pendingRules: [BindingIdentifier]
     *   尝试 Or 分支 0: StringLiteral             pendingRules: [BindingIdentifier, StringLiteral]
     *     失败，退出 StringLiteral                ruleStack: [BindingIdentifier]
     *   尝试 Or 分支 1: Identifier ✅             pendingRules: [BindingIdentifier, Identifier]
     *     成功！                                   ruleStack: [BindingIdentifier, Identifier]
     * 
     * getValidRules() 返回: [BindingIdentifier, Identifier]
     * （StringLiteral 被过滤掉了）
     * ```
     * 
     * @returns 有效的规则列表（按原顺序）
     */
    private getValidRules(): Array<{ruleName: string, depth: number}> {
        // 步骤 1: 获取当前栈中的规则名列表
        // ruleStack: [{ruleName: 'A', ...}, {ruleName: 'B', ...}]
        // → stackRuleNames: ['A', 'B']
        const stackRuleNames = this.ruleStack.map(r => r.ruleName)
        const validRules: Array<{ruleName: string, depth: number}> = []
        
        // 步骤 2: 配对算法
        // outputIndex: 记录上次匹配的位置，避免重复匹配同名规则
        // 例如：如果有两个 Identifier 规则，第一个匹配第一个，第二个匹配第二个
        let outputIndex = 0
        
        for (const pending of this.pendingRules) {
            // 在 stackRuleNames 中查找这个规则（从 outputIndex 开始）
            const stackIndex = stackRuleNames.indexOf(pending.ruleName, outputIndex)
            
            if (stackIndex >= 0) {
                // 找到了！说明这个规则仍在栈中（成功的路径）
                validRules.push(pending)
                // 更新 outputIndex，下次从这个位置之后开始找
                outputIndex = stackIndex + 1
            }
            // 找不到 → 说明已退出栈（失败的 Or 分支） → 不添加
        }
        
        return validRules
    }
    
    /**
     * 输出折叠的规则链（用 > 连接，超长时双行显示）
     * 
     * ==========================================
     * 规则链折叠器 - 提升可读性的关键
     * ==========================================
     * 
     * 为什么要折叠？
     * - 长表达式链有 19 个规则：AssignmentExpression > ConditionalExpression > ... > Literal
     * - 如果每个占一行，会非常冗长
     * - 折叠后一行显示，简洁清晰
     * 
     * 折叠示例：
     * ```
     * 不折叠（19行）:                   折叠后（1行 + 子规则）:
     * AssignmentExpression             AssignmentExpression > ... > PrimaryExpression
     *   ConditionalExpression            Literal [Or]
     *     ShortCircuitExpression           🔹 token[3] - 1
     *       ...（中间15个）
     *       MemberExpression
     *         PrimaryExpression
     *           Literal
     *             🔹 token[3] - 1
     * ```
     * 
     * 双行显示（超长时）：
     * - 第一行：完整规则链（所有规则名）
     * - 第二行：简化版（前3个 + ... + 后2个）
     * - 触发条件：字符数 > 120
     * 
     * 视觉深度系统：
     * - 使用 visualDepth（当前视觉层级）
     * - 折叠链只增加 1 层视觉深度（不管链有多长）
     * - 这解决了 Literal 缩进 27 层的问题
     * 
     * @param chain - 要折叠的规则链
     */
    private outputCollapsedChain(chain: Array<{ruleName: string, depth: number}>): void {
        if (chain.length === 0) return
        
        // 步骤 1: 提取规则名和 Or 标记
        const ruleNames = chain.map(r => r.ruleName)
        const orSuffix = this.getOrSuffix(chain)  // 可能是 [Or] 或 [#1/3 ✅] 或 ''
        
        // 步骤 2: 输出第一行（完整版，始终显示）
        // 使用 visualDepth 作为缩进，用 ' > ' 连接规则名
        // 例如：AssignmentExpression > ConditionalExpression > ... > PrimaryExpression
        const fullLine = TreeFormatHelper.formatLine(
            [...ruleNames, orSuffix],
            { depth: this.visualDepth, separator: ' > ' }
        )
        console.log(fullLine)
        
        // 步骤 3: 判断是否需要输出简化版
        const MAX_CHARS = 120  // 超过此字符数时输出简化版
        const fullText = ruleNames.join(' > ')
        
        if (fullText.length > MAX_CHARS) {
            // 配置：简化版显示的规则数量
            const SHOW_HEAD = 3  // 显示前3个
            const SHOW_TAIL = 2  // 显示后2个
            
            // 构造简化版：前3个 + '...' + 后2个
            // 例如：AssignmentExpression > ConditionalExpression > ShortCircuitExpression > ... > MemberExpression > PrimaryExpression
            const shortNames = [
                ...ruleNames.slice(0, SHOW_HEAD),
                '...',
                ...ruleNames.slice(-SHOW_TAIL)
            ]
            
            // 输出第二行（简化版）
            const shortLine = TreeFormatHelper.formatLine(
                [...shortNames, orSuffix],
                { depth: this.visualDepth, separator: ' > ' }
            )
            console.log(shortLine)
        }
        
        // 步骤 4: 折叠链不推进 visualDepth
        // visualDepth 的推进统一由 flushPendingRules() 管理
    }
    
    /**
     * 输出单个规则（带 Or 标记）
     */
    private outputRule(rule: {ruleName: string, depth: number}): void {
        const orSuffix = this.getOrSuffix([rule])
        const line = TreeFormatHelper.formatLine(
            [rule.ruleName, orSuffix],
            { depth: this.visualDepth }
        )
        console.log(line)
    }
    
    /**
     * 获取 Or 后缀标记
     * 
     * 设计思路：
     * - Or 父规则显示 [Or]：告诉用户"这里有 Or 分支"
     * - Or 目标规则显示 [#1/3 ✅]：告诉用户"选择了第几个分支"
     * 
     * 示例输出：
     * ```
     * BindingIdentifier [Or]       ← 父规则标记
     *   Identifier [#1/3 ✅]        ← 目标规则显示分支信息
     * ```
     * 
     * @param rules - 规则列表（通常是单个规则或折叠链）
     * @returns Or 标记字符串
     */
    private getOrSuffix(rules: Array<{ruleName: string, depth: number}>): string {
        if (!this.currentOrInfo) return ''
        
        // 检查是否是 Or 父规则（depth = targetDepth - 1）
        const hasOrParent = rules.some(r => r.depth === this.currentOrInfo!.targetDepth - 1)
        if (hasOrParent) {
            return ' [Or]'  // 父规则只显示 [Or] 标记
        }
        
        // 检查是否是 Or 目标规则（depth = targetDepth）
        const hasOrTarget = rules.some(r => r.depth === this.currentOrInfo!.targetDepth)
        if (hasOrTarget) {
            // 目标规则显示分支信息：[#当前分支/总分支数 ✅]
            return ` [#${this.currentOrInfo.currentBranch + 1}/${this.currentOrInfo.totalBranches} ✅]`
        }
        
        return ''
    }
    
    // ========================================
    // 过程追踪方法
    // ========================================
    
    /**
     * 规则进入事件处理器
     * 
     * ==========================================
     * 延迟输出策略的核心 - 只记录，不输出
     * ==========================================
     * 
     * 为什么不在这里输出？
     * - 此时还不知道规则是否会成功（Or 分支可能失败）
     * - 无法判断后面是否有可折叠的长链
     * - 无法判断是否有 Or 父规则需要单独显示
     * 
     * 所以采用延迟输出策略：
     * 1. onRuleEnter: 只记录到 pendingRules 和 ruleStack
     * 2. onTokenConsume: 触发批量输出 flushPendingRules()
     * 3. 批量输出时可以：
     *    - 过滤失败的 Or 分支
     *    - 识别可折叠的长链
     *    - 在 Or 父规则前断开
     * 
     * 数据结构：
     * - ruleStack: 记录当前活跃的规则栈（用于判断规则是否仍在执行）
     * - pendingRules: 记录待输出的规则（带 depth 信息）
     * - stats: 性能统计数据
     * 
     * @param ruleName - 规则名称
     * @returns startTime - 用于后续计算耗时
     */
    onRuleEnter(ruleName: string): number {
        const startTime = performance.now()
        
        // 步骤 1: 记录到规则栈（表示"正在执行"）
        this.ruleStack.push({
            ruleName,
            startTime,
            outputted: false,           // 是否已输出（当前未使用）
            hasConsumedToken: false     // 是否消费了 token（当前未使用）
        })
        
        // 步骤 2: 加入待输出队列（等待 token 消费时触发输出）
        const depth = this.ruleStack.length - 1  // 当前规则的深度
        this.pendingRules.push({
            ruleName,
            depth  // 保存深度，用于后续折叠判断
        })
        
        // 步骤 3: 性能统计
        let stat = this.stats.get(ruleName)
        if (!stat) {
            // 第一次遇到这个规则，初始化统计数据
            stat = {
                ruleName,
                totalCalls: 0,          // 总调用次数（含缓存）
                actualExecutions: 0,    // 实际执行次数（不含缓存）
                cacheHits: 0,           // 缓存命中次数
                totalTime: 0,           // 总耗时（含缓存查询）
                executionTime: 0,       // 实际执行耗时
                avgTime: 0              // 平均耗时
            }
            this.stats.set(ruleName, stat)
        }
        stat.totalCalls++
        
        return startTime  // 返回给 Parser，用于 onRuleExit 计算耗时
    }
    
    onRuleExit(
        ruleName: string, 
        cacheHit: boolean,
        context?: unknown
    ): void {
        // 计算耗时
        let duration = 0
        if (context !== undefined && typeof context === 'number') {
            duration = performance.now() - context
        }
        
        // 弹出规则栈
        this.ruleStack.pop()
        
        // 性能统计
        const stat = this.stats.get(ruleName)
        if (stat) {
            stat.totalTime += duration
            
            if (cacheHit) {
                stat.cacheHits++
            } else {
                stat.actualExecutions++
                stat.executionTime += duration
                
                if (stat.actualExecutions > 0) {
                    stat.avgTime = stat.executionTime / stat.actualExecutions
                }
            }
        }
    }
    
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void {
        // 只输出成功的 Token 消费
        if (!success) {
            return
        }
        
        // 输出待处理的规则（会自动为 token +1）
        this.flushPendingRules()
        
        const depth = this.visualDepth
        const value = TreeFormatHelper.formatTokenValue(tokenValue, 20)
        
        // 获取 token 的位置信息（支持多种格式）
        const token = this.inputTokens[tokenIndex]
        let location: string | null = null
        
        if (token) {
            // 格式1：CST 风格 (loc: {start: {line, column}, end: {...}})
            if (token.loc) {
                location = TreeFormatHelper.formatLocation(token.loc)
            }
            // 格式2：Subhuti 风格 (rowNum, columnStartNum, columnEndNum)
            else if (token.rowNum !== undefined && token.columnStartNum !== undefined) {
                const row = token.rowNum
                const start = token.columnStartNum
                const end = token.columnEndNum ?? start + tokenValue.length - 1
                location = `[${row}:${start}-${end}]`
            }
        }
        
        const line = TreeFormatHelper.formatLine(
            ['🔹 Consume', `token[${tokenIndex}]`, '-', value, '-', `<${tokenName}>`, location, '✅'],
            { depth, separator: ' ' }
        )
        
        console.log(line)
        
        // Token 输出后不再增加 visualDepth
        // 下次 flushPendingRules() 会重置 visualDepth 到新规则的 depth
        
        // 标记当前规则已消费 token
        if (this.ruleStack.length > 0) {
            const currentRule = this.ruleStack[this.ruleStack.length - 1]
            currentRule.hasConsumedToken = true
        }
    }
    
    onOrBranch(
        branchIndex: number,
        totalBranches: number
    ): void {
        // 新的 Or 开始（branchIndex = 0）
        if (branchIndex === 0) {
            // 创建新的 Or 追踪
            // targetDepth 是第一个分支规则将要处于的深度
            this.currentOrInfo = {
                totalBranches,
                currentBranch: 0,
                targetDepth: this.ruleStack.length,  // 下一个规则进入后的深度
                savedPendingLength: this.pendingRules.length  // 保存当前pending长度
            }
        } else {
            // 尝试下一个分支（branchIndex > 0）
            // 失败的分支：恢复pending到Or开始前的状态
            if (this.currentOrInfo) {
                this.pendingRules.length = this.currentOrInfo.savedPendingLength
                this.currentOrInfo.currentBranch = branchIndex
            }
        }
    }
    
    onBacktrack(
        fromTokenIndex: number,
        toTokenIndex: number
    ): void {
        // 不输出正常回溯（只在真正出错时才需要）
    }
    
    // ========================================
    // CST 验证方法（调用 SubhutiDebugUtils）
    // ========================================
    
    /**
     * 收集所有 token 值（内部调用 SubhutiDebugUtils）
     */
    private collectTokenValues(node: any): string[] {
        return SubhutiDebugUtils.collectTokens(node)
    }
    
    /**
     * 检查 Token 完整性（内部调用 SubhutiDebugUtils）
     */
    private checkTokenCompleteness(cst: SubhutiCst): {
        input: string[]
        cst: string[]
        missing: string[]
    } {
        const result = SubhutiDebugUtils.validateTokenCompleteness(cst, this.inputTokens)
        return {
            input: result.inputTokens,
            cst: result.cstTokens,
            missing: result.missing
        }
    }
    
    /**
     * 验证 CST 结构完整性（内部调用 SubhutiDebugUtils）
     */
    private validateStructure(node: any, path: string = 'root'): Array<{path: string, issue: string, node?: any}> {
        return SubhutiDebugUtils.validateStructure(node, path)
    }
    
    /**
     * 获取 CST 统计信息（内部调用 SubhutiDebugUtils）
     */
    private getCSTStatistics(node: any): {
        totalNodes: number
        leafNodes: number
        maxDepth: number
        nodeTypes: Map<string, number>
    } {
        return SubhutiDebugUtils.getCSTStatistics(node)
    }
    
    // ========================================
    // 向后兼容 - 静态方法别名
    // ========================================
    
    /**
     * @deprecated 请使用 SubhutiDebugUtils.collectTokens()
     */
    static collectTokens = SubhutiDebugUtils.collectTokens
    
    /**
     * @deprecated 请使用 SubhutiDebugUtils.validateTokenCompleteness()
     */
    static validateTokenCompleteness = SubhutiDebugUtils.validateTokenCompleteness
    
    // ========================================
    // 性能统计输出
    // ========================================
    
    /**
     * 获取性能摘要
     */
    private getSummary(): string {
        const allStats = Array.from(this.stats.values())
        
        if (allStats.length === 0) {
            return '📊 性能摘要：无数据'
        }
        
        // 计算总计
        const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0)
        const totalExecutions = allStats.reduce((sum, s) => sum + s.actualExecutions, 0)
        const totalCacheHits = allStats.reduce((sum, s) => sum + s.cacheHits, 0)
        const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0)
        const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls * 100).toFixed(1) : '0.0'
        
        const lines: string[] = []
        lines.push('⏱️  性能摘要')
        lines.push('─'.repeat(40))
        lines.push(`总耗时: ${totalTime.toFixed(2)}ms`)
        lines.push(`总调用: ${totalCalls.toLocaleString()} 次`)
        lines.push(`实际执行: ${totalExecutions.toLocaleString()} 次`)
        lines.push(`缓存命中: ${totalCacheHits.toLocaleString()} 次 (${cacheHitRate}%)`)
        lines.push('')
        
        // Top 5 慢规则（简化版，无表格边框）
        const top5 = allStats
            .filter(s => s.actualExecutions > 0)
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, 5)
        
        if (top5.length > 0) {
            lines.push('Top 5 慢规则:')
            top5.forEach((stat, i) => {
                const avgUs = (stat.avgTime * 1000).toFixed(1)
                lines.push(
                    `  ${i + 1}. ${stat.ruleName}: ${stat.executionTime.toFixed(2)}ms ` +
                    `(${stat.totalCalls}次, 平均${avgUs}μs)`
                )
            })
        }
        
        return lines.join('\n')
    }
    
    // ========================================
    // CST 相关方法
    // ========================================
    
    /**
     * 设置要展示的 CST（由 Parser 在解析完成后调用）
     */
    setCst(cst: SubhutiCst | undefined): void {
        this.topLevelCst = cst || null
    }
    
    // ========================================
    // 自动输出（由 Parser 在顶层规则完成时调用）
    // ========================================
    
    /**
     * 自动输出完整调试报告
     */
    autoOutput(): void {
        console.log('\n' + '='.repeat(60))
        console.log('🔍 Subhuti Debug 输出')
        console.log('='.repeat(60))
        
        // ========================================
        // 第一部分：性能摘要
        // ========================================
        console.log('\n【第一部分：性能摘要】')
        console.log('─'.repeat(60))
        console.log('\n' + this.getSummary())
        
        // 所有规则详细统计
        console.log('\n📋 所有规则详细统计:')
        const allStats = Array.from(this.stats.values())
            .sort((a, b) => b.executionTime - a.executionTime)
        
        allStats.forEach((stat) => {
            const cacheRate = stat.totalCalls > 0 
                ? (stat.cacheHits / stat.totalCalls * 100).toFixed(1) 
                : '0.0'
            console.log(
                `  ${stat.ruleName}: ${stat.totalCalls}次 | ` +
                `执行${stat.actualExecutions}次 | ` +
                `耗时${stat.executionTime.toFixed(2)}ms | ` +
                `缓存${cacheRate}%`
            )
        })
        
        console.log('\n' + '='.repeat(60))
        
        // ========================================
        // 第二部分：CST 验证报告
        // ========================================
        if (this.topLevelCst) {
            console.log('\n【第二部分：CST 验证报告】')
            console.log('─'.repeat(60))
            console.log('\n🔍 CST 验证报告')
            console.log('─'.repeat(60))
            
            // 2.1 结构验证
            const structureErrors = this.validateStructure(this.topLevelCst)
            console.log(`\n📌 结构完整性: ${structureErrors.length === 0 ? '✅' : '❌'}`)
            
            if (structureErrors.length > 0) {
                console.log(`   发现 ${structureErrors.length} 个错误:`)
                structureErrors.forEach((err, i) => {
                    console.log(`\n   [${i + 1}] ${err.path}`)
                    console.log(`       问题: ${err.issue}`)
                    if (err.node) {
                        const nodeStr = JSON.stringify(err.node, null, 2)
                            .split('\n')
                            .map(line => `       ${line}`)
                            .join('\n')
                        console.log(nodeStr)
                    }
                })
            } else {
                console.log('   无结构错误')
            }
            
            // 2.2 Token 完整性
            const tokenResult = this.checkTokenCompleteness(this.topLevelCst)
            console.log(`\n📌 Token 完整性: ${tokenResult.missing.length === 0 ? '✅' : '❌'}`)
            console.log(`   输入 tokens: ${tokenResult.input.length} 个`)
            console.log(`   CST tokens:  ${tokenResult.cst.length} 个`)
            console.log(`   输入列表: [${tokenResult.input.join(', ')}]`)
            console.log(`   CST列表:  [${tokenResult.cst.join(', ')}]`)
            
            if (tokenResult.missing.length > 0) {
                console.log(`   ❌ 缺失: [${tokenResult.missing.join(', ')}]`)
            } else {
                console.log(`   ✅ 完整保留`)
            }
            
            // 2.3 CST 统计
            const stats = this.getCSTStatistics(this.topLevelCst)
            console.log(`\n📌 CST 统计:`)
            console.log(`   总节点数: ${stats.totalNodes}`)
            console.log(`   叶子节点: ${stats.leafNodes}`)
            console.log(`   最大深度: ${stats.maxDepth}`)
            console.log(`   节点类型: ${stats.nodeTypes.size} 种`)
            
            // 节点类型分布
            console.log(`\n   节点类型分布:`)
            const sortedTypes = Array.from(stats.nodeTypes.entries())
                .sort((a, b) => b[1] - a[1])
            sortedTypes.forEach(([name, count]) => {
                console.log(`     ${name}: ${count}`)
            })
            
            console.log('─'.repeat(60))
            
            // ========================================
            // 第三部分：CST 可视化
            // ========================================
            console.log('\n【第三部分：CST 可视化】')
            console.log('─'.repeat(60))
            console.log('\n📊 CST 结构')
            console.log('─'.repeat(60))
            console.log(SubhutiDebugUtils.formatCst(this.topLevelCst))
            console.log('─'.repeat(60))
        }
        
        console.log('\n' + '='.repeat(60))
        console.log('🎉 Debug 输出完成')
        console.log('='.repeat(60))
    }
}


// ============================================
// 导出
// ============================================

export { SubhutiTraceDebugger as default }
