/**
 * Subhuti Token Lookahead - Token 前瞻基础类（抽象）
 * 
 * 职责：
 * 1. Token 前瞻（只读查询）
 * 2. 行终止符检查
 * 3. 对应 ECMAScript® 2025 规范中的所有 [lookahead ...] 约束
 * 
 * 设计模式：
 * - 抽象类，定义访问接口（tokens, currentIndex, curToken）
 * - 子类（SubhutiParser）实现具体访问逻辑
 * - 避免循环依赖，实现依赖倒置
 * 
 * 规范地址：https://tc39.es/ecma262/2025/#sec-grammar-summary
 * 
 * @version 3.0.0
 */

import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts"

export default class SubhutiTokenLookahead {
    // ============================================
    // Token 数据（protected，子类可访问）
    // ============================================
    
    /**
     * Token 数组
     */
    protected _tokens: SubhutiMatchToken[] = []
    
    /**
     * 当前 token 索引
     */
    protected tokenIndex: number = 0

    /**
     * 核心状态：当前规则是否成功
     * - true: 成功，继续执行
     * - false: 失败，停止并返回 undefined
     */
    protected _parseSuccess = true


    // SubhutiParser，前瞻失败返回 undefined，应该同时设置解析失败
    protected parserFail(): never {
        this._parseSuccess = false
        return undefined as never
    }

    /**
     * 获取当前 token
     */
    get curToken(): SubhutiMatchToken | undefined {
        return this._tokens[this.tokenIndex]
    }
    // ============================================
    // 层级 1：私有查询方法（内部实现，返回 boolean）
    // ============================================
    
    /**
     * 前瞻：获取未来的 token（不消费）
     *
     * @param offset 偏移量（1 = 下一个 token，2 = 下下个...）
     * @returns token 或 undefined（EOF）
     */
    private peek(offset: number = 1): SubhutiMatchToken | undefined {
        const index = this.tokenIndex + offset - 1
        return index >= 0 && index < this._tokens.length
            ? this._tokens[index]
            : undefined
    }

    /**
     * 前瞻：获取连续的 N 个 token
     *
     * @param count 要获取的 token 数量
     * @returns token 数组（长度可能小于 count，如果遇到 EOF）
     */
    private peekSequence(count: number): SubhutiMatchToken[] {
        const result: SubhutiMatchToken[] = []
        for (let i = 1; i <= count; i++) {
            const token = this.peek(i)
            if (!token) break
            result.push(token)
        }
        return result
    }
    
    /**
     * [lookahead = token]
     * 规范：正向前瞻，检查下一个 token 是否匹配
     */
    private lookahead(tokenName: string, offset: number = 1): boolean {
        return this.peek(offset)?.tokenName === tokenName
    }

    /**
     * [lookahead ≠ token]
     * 规范：否定前瞻，检查下一个 token 是否不匹配
     */
    private lookaheadNot(tokenName: string, offset: number = 1): boolean {
        const token = this.peek(offset)
        // EOF 时返回 true（认为"不是任何具体 token"）
        return token ? token.tokenName !== tokenName : true
    }
    
    /**
     * [lookahead ∈ {t1, t2, ...}]
     * 规范：正向集合前瞻，检查下一个 token 是否在集合中
     */
    private lookaheadIn(tokenNames: string[], offset: number = 1): boolean {
        const token = this.peek(offset)
        return token ? tokenNames.includes(token.tokenName) : false
    }

    /**
     * [lookahead ∉ {t1, t2, ...}]
     * 规范：否定集合前瞻，检查下一个 token 是否不在集合中
     */
    private lookaheadNotIn(tokenNames: string[], offset: number = 1): boolean {
        const token = this.peek(offset)
        // EOF 时返回 true（认为"不在任何集合中"）
        return token ? !tokenNames.includes(token.tokenName) : true
    }
    
    /**
     * [lookahead = t1 t2 ...]
     * 规范：序列前瞻，检查连续的 token 序列是否匹配
     */
    private lookaheadSequence(tokenNames: string[]): boolean {
        const peeked = this.peekSequence(tokenNames.length)
        if (peeked.length !== tokenNames.length) {
            return false
        }
        return peeked.every((token, i) => token.tokenName === tokenNames[i])
    }

    /**
     * [lookahead ≠ t1 t2 ...]
     * 规范：否定序列前瞻，检查连续的 token 序列是否不匹配
     */
    private lookaheadNotSequence(tokenNames: string[]): boolean {
        return !this.lookaheadSequence(tokenNames)
    }
    

    /**
     * 检查：token 序列匹配且中间无换行符
     *
     * @param tokenNames token 名称序列
     * @returns true = 序列匹配且中间都在同一行
     *
     * @example
     * // async [no LineTerminator here] function
     * if (this.lookaheadSequenceNoLT(['AsyncTok', 'FunctionTok'])) { ... }
     */
    private lookaheadSequenceNoLT(tokenNames: string[]): boolean {
        const peeked = this.peekSequence(tokenNames.length)
        if (peeked.length !== tokenNames.length) {
            return false
        }

        // 检查每个 token 的名称匹配
        for (let i = 0; i < tokenNames.length; i++) {
            if (peeked[i].tokenName !== tokenNames[i]) {
                return false
            }

            // 检查第二个及之后的 token 前面没有换行符
            if (i > 0 && peeked[i].hasLineBreakBefore) {
                return false
            }
        }

        return true
    }

    /**
     * [no LineTerminator here]
     * 检查当前 token 前是否有换行符
     */
    private lookaheadHasLineBreak(): boolean {
        return this.curToken?.hasLineBreakBefore ?? false
    }

    // ============================================
    // 层级 2：受保护的断言方法（自动设置 _parseSuccess）
    // ============================================

    /**
     * 断言：当前 token 必须是指定类型
     * 如果不是，则标记失败
     *
     * @param tokenName - 必须的 token 类型
     * @param offset - 偏移量（默认 1）
     *
     * @example
     * // [lookahead = =]
     * this.assertLookahead('Assign')
     */
    protected assertLookahead(tokenName: string, offset: number = 1): void {
        if (!this._parseSuccess) return

        if (!this.lookahead(tokenName, offset)) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：当前 token 不能是指定类型
     * 如果是，则标记失败
     *
     * @param tokenName - 不允许的 token 类型
     * @param offset - 偏移量（默认 1）
     *
     * @example
     * // [lookahead ≠ else]
     * this.assertLookaheadNot('ElseTok')
     */
    protected assertLookaheadNot(tokenName: string, offset: number = 1): void {
        if (!this._parseSuccess) return

        if (this.lookahead(tokenName, offset)) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：当前 token 必须在指定集合中
     * 如果不在，则标记失败
     *
     * @param tokenNames - 允许的 token 类型列表
     * @param offset - 偏移量（默认 1）
     *
     * @example
     * // [lookahead ∈ {8, 9}]
     * this.assertLookaheadIn(['DecimalDigit8', 'DecimalDigit9'])
     */
    protected assertLookaheadIn(tokenNames: string[], offset: number = 1): void {
        if (!this._parseSuccess) return

        if (!this.lookaheadIn(tokenNames, offset)) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：当前 token 不能在指定集合中
     * 如果在，则标记失败
     *
     * @param tokenNames - 不允许的 token 类型列表
     * @param offset - 偏移量（默认 1）
     *
     * @example
     * // [lookahead ∉ {{, function, class}]
     * this.assertLookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])
     */
    protected assertLookaheadNotIn(tokenNames: string[], offset: number = 1): void {
        if (!this._parseSuccess) return

        if (this.lookaheadIn(tokenNames, offset)) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：必须是指定的 token 序列
     * 如果不匹配，则标记失败
     *
     * @param tokenNames - token 序列
     *
     * @example
     * // [lookahead = async function]
     * this.assertLookaheadSequence(['AsyncTok', 'FunctionTok'])
     */
    protected assertLookaheadSequence(tokenNames: string[]): void {
        if (!this._parseSuccess) return

        if (!this.lookaheadSequence(tokenNames)) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：不能是指定的 token 序列
     * 如果匹配，则标记失败
     *
     * @param tokenNames - token 序列
     *
     * @example
     * // [lookahead ≠ let []
     * this.assertLookaheadNotSequence(['LetTok', 'LBracket'])
     */
    protected assertLookaheadNotSequence(tokenNames: string[]): void {
        if (!this._parseSuccess) return

        if (this.lookaheadSequence(tokenNames)) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：当前 token 前不能有换行符
     * 如果有，则标记失败
     *
     * @example
     * // [no LineTerminator here]
     * this.assertNoLineBreak()
     */
    protected assertNoLineBreak(): void {
        if (!this._parseSuccess) return

        if (this.lookaheadHasLineBreak()) {
            this._parseSuccess = false
        }
    }

    /**
     * 断言：条件必须为真
     * 如果条件为假，则标记失败
     *
     * @param condition - 要检查的条件
     *
     * @example
     * // 断言：标识符不能是保留字
     * const cst = this.tokenConsumer.Identifier()
     * this.assertCondition(!(cst && ReservedWords.has(cst.value!)))
     */
    protected assertCondition(condition: boolean): void {
        if (!this._parseSuccess) return

        if (!condition) {
            this._parseSuccess = false
        }
    }
}

