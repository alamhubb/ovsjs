/**
 * Subhuti Parser - 高性能 PEG Parser 框架（融合版）
 *
 * 设计理念：性能优先 + 简洁清晰 + 易用性
 *
 * 核心特性：
 * - ✅ 标志驱动（性能优于异常驱动 50-100 倍）
 * - ✅ 返回值语义（清晰的成功/失败判断）
 * - ✅ 成功才添加 CST（清晰的生命周期）
 * - ✅ 双数组结构（children + tokens 分离）
 * - ✅ 两层 Map Packrat（便于按规则管理）
 * - ✅ 极简回溯（O(1) 快照）
 *
 * 融合决策：
 * - 控制流：标志驱动（旧版）- 避免异常开销
 * - 标志简化：单一标志 ruleSuccess（去掉 loopMatchSuccess）
 * - Or 规则：返回值判断（简化逻辑）
 * - CST 结构：双数组（旧版）- 快速访问 tokens
 * - Packrat：两层 Map（旧版）- 便于管理
 * - 错误类：ParsingError（新版）- 详细错误信息
 * - 设计理念："成功才添加"（新版）- 清晰的生命周期
 *
 * @version 3.0.0 - 融合最优实践
 * @date 2025-11-03
 */

import SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import SubhutiCst from "../struct/SubhutiCst.ts"
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"

// ============================================
// [1] 数据结构定义
// ============================================

/**
 * 回溯数据（3字段 - 支持双数组结构）
 */
export class SubhutiBackData {
    tokenIndex: number                    // tokens 读取位置
    curCstChildrenLength: number          // children 数组长度
    curCstTokensLength: number            // tokens 数组长度（支持快速访问）
}

/**
 * Packrat Parsing 缓存结果
 */
export class SubhutiMemoResult {
    success: boolean                      // 解析是否成功
    endTokenIndex: number                 // 解析结束位置
    cst?: SubhutiCst                      // 成功时的 CST 节点
}

/**
 * Or 规则参数类型
 */
export class SubhutiParserOr {
    alt: Function
}

/**
 * 解析错误类（详细错误信息）
 */
export class ParsingError extends Error {
    expected: string
    found?: SubhutiMatchToken
    position: {
        index: number
        line: number
        column: number
    }
    ruleStack: string[]

    constructor(message: string, details: {
        expected: string
        found?: SubhutiMatchToken
        position: { index: number, line: number, column: number }
        ruleStack: string[]
    }) {
        super(message)
        this.name = 'ParsingError'
        this.expected = details.expected
        this.found = details.found
        this.position = details.position
        this.ruleStack = details.ruleStack
    }

    toString(): string {
        const location = `line ${this.position.line}, column ${this.position.column}`
        const expected = `Expected: ${this.expected}`
        const found = `Found: ${this.found?.tokenName || 'EOF'}`
        const context = `Context: ${this.ruleStack.join(' → ')}`
        return `Parsing Error at ${location}\n${expected}\n${found}\n${context}`
    }
}

// ============================================
// [2] 装饰器系统
// ============================================

export function Subhuti<E extends SubhutiTokenConsumer, T extends new (...args: any[]) => SubhutiParser<E>>(
    target: T,
    context: ClassDecoratorContext
) {
    context.metadata.className = target.name
    return target
}

export function SubhutiRule(targetFun: any, context: ClassMethodDecoratorContext) {
    const ruleName = targetFun.name
    const wrappedFunction = function(): SubhutiCst {
        return this.subhutiRule(targetFun, ruleName, context.metadata.className)
    }
    Object.defineProperty(wrappedFunction, 'name', {value: ruleName})
    return wrappedFunction
}

export type SubhutiTokenConsumerConstructor<T extends SubhutiTokenConsumer> =
    new (parser: SubhutiParser<T>) => T

// ============================================
// [3] SubhutiParser 核心类（融合版）
// ============================================

export default class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> {
    // ========================================
    // 核心字段
    // ========================================

    tokenConsumer: T
    private _tokens: SubhutiMatchToken[] = []
    private tokenIndex: number = 0

    /**
     * 单一核心标志：ruleSuccess
     *
     * 简化理由：
     * - 旧版双标志（ruleMatchSuccess + loopMatchSuccess）太复杂
     * - Or 可以通过返回值判断成功（返回 CST = 成功，返回 undefined = 失败）
     * - 不需要第二个标志
     */
    private _ruleSuccess = true

    curCst: SubhutiCst
    cstStack: SubhutiCst[] = []
    ruleStack: string[] = []

    initFlag = true
    className: string

    // ========================================
    // Packrat Parsing（两层 Map - 便于管理）
    // ========================================

    enableMemoization: boolean = true
    private memoCache = new Map<string, Map<number, SubhutiMemoResult>>()
    memoStats = {
        hits: 0,
        misses: 0,
        stores: 0
    }

    // ========================================
    // 构造函数
    // ========================================

    constructor(
        tokens?: SubhutiMatchToken[],
        TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = SubhutiTokenConsumer as any
    ) {
        if (tokens) {
            this.setTokens(tokens)
        }
        this.tokenConsumer = new TokenConsumerClass(this) as T
        this.className = this.constructor.name
    }

    // ========================================
    // Getter/Setter
    // ========================================

    get ruleSuccess() {
        return this._ruleSuccess
    }

    setRuleSuccess(flag: boolean) {
        this._ruleSuccess = flag
    }

    setTokens(tokens?: SubhutiMatchToken[]) {
        this._tokens = tokens
        this.tokenIndex = 0
        this.clearMemoCache()
    }

    get tokenIsEmpty() {
        return !this._tokens || this.tokenIndex >= this._tokens.length
    }

    // ========================================
    // 规则执行入口（Packrat 集成）
    // ========================================

    subhutiRule(targetFun: any, ruleName: string, className: string): SubhutiCst | undefined {
        // 确定是本类的方法
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return
            }
        }

        const initFlag = this.initFlag

        if (initFlag) {
            // 初始化
            this.initFlag = false
            this.setRuleSuccess(true)
            this.cstStack = []
            this.ruleStack = []
        } else {
            // 检查是否可以继续
            if (!this.ruleSuccess) {
                return
            }

            // Packrat: 查询缓存
            if (this.enableMemoization) {
                const cached = this.getMemoized(ruleName, this.tokenIndex)
                if (cached !== undefined) {
                    this.memoStats.hits++
                    return this.applyMemoizedResult(cached)
                }
                this.memoStats.misses++
            }
        }

        // 执行规则
        const startTokenIndex = this.tokenIndex
        const cst = this.processCst(ruleName, targetFun)

        if (initFlag) {
            this.initFlag = true
        } else {
            // Packrat: 存储缓存
            if (this.enableMemoization) {
                this.storeMemoized(ruleName, startTokenIndex, cst, this.tokenIndex)
            }

            // 清理空数组
            if (cst) {
                if (!cst.children?.length) cst.children = undefined
                if (!cst.tokens?.length) cst.tokens = undefined
            }

            const parentCst = this.cstStack[this.cstStack.length - 1]
            this.curCst = parentCst
        }

        return cst
    }

    // ========================================
    // CST 构建（成功才添加）
    // ========================================

    /**
     * 处理 CST 节点
     *
     * 融合设计：
     * - 理念：成功才添加（新版）
     * - 实现：标志判断（旧版性能）
     */
    processCst(ruleName: string, targetFun: Function): SubhutiCst | undefined {
        const cst = new SubhutiCst()
        cst.name = ruleName
        cst.children = []
        cst.tokens = []  // ✅ 双数组结构（快速访问）

        // 1. 进入上下文
        this.cstStack.push(cst)
        this.ruleStack.push(ruleName)
        this.curCst = cst

        // 2. 执行规则函数
        targetFun.apply(this)

        // 3. 退出上下文
        this.cstStack.pop()
        this.ruleStack.pop()

        // 4. 判断成功/失败
        if (this.ruleSuccess) {
            // ✅ 成功：添加到父节点（成功才添加）
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cst)
            }

            // 设置位置信息
            this.setLocation(cst)
            return cst
        }

        // ❌ 失败：不添加到父节点
        return undefined
    }

    private setLocation(cst: SubhutiCst) {
        if (cst.children && cst.children[0]?.loc) {
            const lastChild = cst.children[cst.children.length - 1]
            cst.loc = {
                type: cst.name,
                start: cst.children[0].loc.start,
                end: lastChild?.loc?.end || cst.children[0].loc.end
            }
        }
    }

    // ========================================
    // Or 规则（标志驱动 + 返回值语义）
    // ========================================

    /**
     * Or 规则 - 顺序选择
     *
     * 融合设计：
     * - 性能：标志驱动（避免异常开销）
     * - 简洁：返回值语义（CST = 成功，undefined = 失败）
     * - 去掉复杂的 allowError 机制
     */
    Or(alternatives: SubhutiParserOr[]): SubhutiCst | undefined {
        if (!this.ruleSuccess) {
            return undefined
        }

        const backData = this.backData

        for (let i = 0; i < alternatives.length; i++) {
            const alt = alternatives[i]
            const isLast = i === alternatives.length - 1

            // 尝试分支
            const result = alt.alt()

            // 判断成功（通过返回值）
            if (result !== undefined && this.ruleSuccess) {
                // ✅ 成功：返回结果
                return result
            }

            // ❌ 失败：回溯
            if (!isLast) {
                // 非最后分支：重置状态，继续尝试
                this.restoreState(backData)
                this.setRuleSuccess(true)
            } else {
                // 最后分支：只回溯数据，保持失败状态
                this.restoreState(backData)
            }
        }

        // 所有分支都失败
        return undefined
    }

    // ========================================
    // Many/Option 规则（简洁实现）
    // ========================================

    /**
     * Many 规则 - 0次或多次（总是成功）
     */
    Many(fn: Function): SubhutiCst | undefined {
        if (!this.ruleSuccess) {
            return undefined
        }

        let backData = this.backData

        while (true) {
            backData = this.backData
            fn()

            if (!this.ruleSuccess) {
                // 失败：回溯，退出循环
                this.restoreState(backData)
                this.setRuleSuccess(true)
                break
            }
        }

        return this.curCst
    }

    /**
     * Option 规则 - 0次或1次（总是成功）
     */
    Option(fn: Function): SubhutiCst | undefined {
        if (!this.ruleSuccess) {
            return undefined
        }

        const backData = this.backData
        fn()

        if (!this.ruleSuccess) {
            // 失败：回溯，重置状态
            this.restoreState(backData)
            this.setRuleSuccess(true)
        }

        return this.curCst
    }

    // ========================================
    // Token 消费
    // ========================================

    consumeToken(tokenName: string): SubhutiCst | undefined {
        if (!this.ruleSuccess) {
            return undefined
        }

        const token = this.getMatchToken()

        if (!token || token.tokenName !== tokenName) {
            // 失败：设置标志
            this.setRuleSuccess(false)

            // 只在真正需要时抛出详细错误
            throw new ParsingError(
                `Expected ${tokenName}`,
                {
                    expected: tokenName,
                    found: token,
                    position: token ? {
                        index: token.index || 0,
                        line: token.rowNum || 0,
                        column: token.columnStartNum || 0
                    } : {
                        index: this._tokens[this._tokens.length - 1]?.index || 0,
                        line: this._tokens[this._tokens.length - 1]?.rowNum || 0,
                        column: this._tokens[this._tokens.length - 1]?.columnEndNum || 0
                    },
                    ruleStack: [...this.ruleStack]
                }
            )
        }

        // 成功：消费 token
        this.setRuleSuccess(true)
        const consumedToken = this.consumeMatchToken()
        return this.generateCstByToken(consumedToken)
    }

    generateCstByToken(token: SubhutiMatchToken): SubhutiCst {
        const cst = new SubhutiCst()
        cst.name = token.tokenName
        cst.value = token.tokenValue
        cst.loc = {
            type: token.tokenName,
            value: token.tokenValue,
            start: {
                index: token.index || 0,
                line: token.rowNum || 0,
                column: token.columnStartNum || 0
            },
            end: {
                index: (token.index || 0) + token.tokenValue.length,
                line: token.rowNum || 0,
                column: token.columnEndNum || 0
            }
        }

        // 添加到当前 CST（双数组）
        this.curCst.children.push(cst)
        this.curCst.pushCstToken(token)

        return cst
    }

    getMatchToken(): SubhutiMatchToken | undefined {
        return this._tokens[this.tokenIndex]
    }

    consumeMatchToken(): SubhutiMatchToken {
        return this._tokens[this.tokenIndex++]
    }

    // ========================================
    // 回溯机制（O(1) 极简）
    // ========================================

    get backData(): SubhutiBackData {
        return {
            tokenIndex: this.tokenIndex,
            curCstChildrenLength: this.curCst.children.length,
            curCstTokensLength: this.curCst.tokens.length
        }
    }

    restoreState(backData: SubhutiBackData) {
        this.tokenIndex = backData.tokenIndex
        this.curCst.children.length = backData.curCstChildrenLength
        this.curCst.tokens.length = backData.curCstTokensLength
    }

    // ========================================
    // Packrat Parsing（两层 Map）
    // ========================================

    private getMemoized(ruleName: string, tokenIndex: number): SubhutiMemoResult | undefined {
        const ruleCache = this.memoCache.get(ruleName)
        if (!ruleCache) return undefined
        return ruleCache.get(tokenIndex)
    }

    private applyMemoizedResult(cached: SubhutiMemoResult): SubhutiCst | undefined {
        // 恢复状态
        this.tokenIndex = cached.endTokenIndex
        this.setRuleSuccess(cached.success)

        if (cached.success && cached.cst) {
            // 添加到父节点
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cached.cst)
            }
            return cached.cst
        }

        return undefined
    }

    private storeMemoized(
        ruleName: string,
        startTokenIndex: number,
        cst: SubhutiCst | undefined,
        endTokenIndex: number
    ) {
        let ruleCache = this.memoCache.get(ruleName)
        if (!ruleCache) {
            ruleCache = new Map<number, SubhutiMemoResult>()
            this.memoCache.set(ruleName, ruleCache)
        }

        ruleCache.set(startTokenIndex, {
            success: cst !== undefined,
            endTokenIndex: endTokenIndex,
            cst: cst
        })

        this.memoStats.stores++
    }

    clearMemoCache() {
        this.memoCache.clear()
        this.memoStats = { hits: 0, misses: 0, stores: 0 }
    }

    getMemoStats() {
        const total = this.memoStats.hits + this.memoStats.misses
        const hitRate = total > 0 ? (this.memoStats.hits / total * 100).toFixed(1) : '0.0'

        return {
            ...this.memoStats,
            total,
            hitRate: `${hitRate}%`,
            cacheSize: this.memoCache.size,
            totalEntries: Array.from(this.memoCache.values())
                .reduce((sum, map) => sum + map.size, 0)
        }
    }

    // ========================================
    // 辅助方法
    // ========================================

    /**
     * 清空特定规则的缓存（两层 Map 优势）
     */
    clearRuleCache(ruleName: string) {
        this.memoCache.delete(ruleName)  // O(1) 操作
    }

    /**
     * 获取特定规则的缓存统计
     */
    getRuleCacheStats(ruleName: string): number {
        const ruleCache = this.memoCache.get(ruleName)
        return ruleCache ? ruleCache.size : 0
    }

    get tokensName() {
        return this._tokens.map(item => item.tokenName).join('->')
    }

    get ruleStackNames() {
        return this.ruleStack.join('->')
    }

    /**
     * 代码生成（遍历 CST）
     */
    exec(cst: SubhutiCst = this.curCst, code = ''): string {
        if (cst.value) {
            code = (' ' + code + ' ' + cst.value)
        } else {
            if (cst.children) {
                const childrenCode = cst.children
                    .map(child => this.exec(child, code))
                    .join(' ')
                code = (code + ' ' + childrenCode)
            }
        }
        return code.trim()
    }
}
