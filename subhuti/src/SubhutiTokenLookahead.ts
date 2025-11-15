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

    /**
     * 获取当前 token
     */
    get curToken(): SubhutiMatchToken | undefined {
        return this._tokens[this.tokenIndex]
    }
    // ============================================
    // 行终止符检查（从 SubhutiParser 移入）
    // ============================================
    
    /**
     * 检查当前 token 前是否有换行符（用于 ECMAScript [no LineTerminator here] 限制）
     * 
     * 实现方式：直接读取 Lexer 在词法阶段计算好的 hasLineBreakBefore 属性（Babel 风格）
     * - 性能优势：词法阶段计算一次，语法阶段直接读取
     * - 代码简洁：一行代码，无需边界检查
     */
    hasLineTerminatorBefore(): boolean {
        return this.curToken?.hasLineBreakBefore ?? false
    }

    // ============================================
    // 层级 1：基础前瞻方法（8 个）
    // ============================================
    
    /**
     * 前瞻：获取未来的 token（不消费）
     * 
     * @param offset 偏移量（1 = 下一个 token，2 = 下下个...）
     * @returns token 或 undefined（EOF）
     * 
     * @example
     * const next = this.tokenHelper.peek(1)  // 下一个 token
     * const next2 = this.tokenHelper.peek(2) // 下下个 token
     */
    peek(offset: number = 1): SubhutiMatchToken | undefined {
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
     * 
     * @example
     * const next2 = this.tokenHelper.peekSequence(2)
     * // 返回：[token1, token2] 或 [token1] 或 []
     */
    peekSequence(count: number): SubhutiMatchToken[] {
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
     * 
     * 规范中的使用：较少使用（多数是否定前瞻）
     * 
     * @example
     * // 检查下一个是否是 else
     * if (this.tokenHelper.is('ElseTok')) { ... }
     */
    tokenIs(tokenName: string, offset: number = 1): boolean {
        return this.peek(offset)?.tokenName === tokenName
    }
    
    /**
     * [lookahead ≠ token]
     * 规范：否定前瞻，检查下一个 token 是否不匹配
     * 
     * 规范中的使用案例：
     * - Line 82:   [lookahead ≠ <LF>]           - LineTerminatorSequence
     * - Line 1096: [lookahead ≠ else]           - IfStatement
     * - Line 1126: [lookahead ≠ let]            - for await
     * - Line 1296: [lookahead ≠ {]              - ConciseBody
     * - Line 1311: [lookahead ≠ {]              - AsyncConciseBody
     * - Line 1868: [lookahead ≠ ^]              - CharacterClass (RegExp)
     * - Line 1930: [lookahead ≠ ^]              - NestedClass (RegExp)
     * - Line 1914: [lookahead ≠ &]              - ClassIntersection (RegExp)
     * 
     * @example
     * // ConciseBody: [lookahead ≠ {]
     * if (this.tokenHelper.isNot('LBrace')) {
     *   this.ExpressionBody()
     * }
     */
    tokenNotIs(tokenName: string, offset: number = 1): boolean {
        const token = this.peek(offset)
        // EOF 时返回 true（认为"不是任何具体 token"）
        return token ? token.tokenName !== tokenName : true
    }
    
    /**
     * [lookahead ∈ {t1, t2, ...}]
     * 规范：正向集合前瞻，检查下一个 token 是否在集合中
     * 
     * 规范中的使用案例：
     * - Line 386: [lookahead ∈ {8, 9}]          - LegacyOctalEscapeSequence
     * 
     * @example
     * // 检查是否是 8 或 9
     * if (this.tokenHelper.isIn(['DecimalDigit8', 'DecimalDigit9'])) { ... }
     */
    tokenIn(tokenNames: string[], offset: number = 1): boolean {
        const token = this.peek(offset)
        return token ? tokenNames.includes(token.tokenName) : false
    }
    
    /**
     * [lookahead ∉ {t1, t2, ...}]
     * 规范：否定集合前瞻，检查下一个 token 是否不在集合中
     * 
     * 规范中的使用案例：
     * - Line 189:  [lookahead ∉ DecimalDigit]   - OptionalChainingPunctuator (词法)
     * - Line 363:  [lookahead ∉ DecimalDigit]   - EscapeSequence (词法)
     * - Line 387:  [lookahead ∉ OctalDigit]     - LegacyOctalEscapeSequence (词法)
     * - Line 496:  [lookahead ∉ DecimalDigit]   - TemplateEscapeSequence (词法)
     * - Line 503-511: [lookahead ∉ HexDigit]    - NotEscapeSequence (词法)
     * - Line 1087: [lookahead ∉ {{, function, async [no LT] function, class, let [}] - ExpressionStatement
     * - Line 1123: [lookahead ∉ {let, async of}] - ForInOfStatement
     * - Line 1558: [lookahead ∉ {function, async [no LT] function, class}] - export default
     * - Line 1763: [lookahead ∉ DecimalDigit]   - CharacterEscape (RegExp)
     * - Line 1772: [lookahead ∉ DecimalDigit]   - DecimalEscape (RegExp)
     * - Line 1949: [lookahead ∉ ClassSetReservedDoublePunctuator] - ClassSetCharacter (RegExp)
     * 
     * @example
     * // ExpressionStatement: [lookahead ∉ {{, function, class}]
     * if (this.tokenHelper.isNotIn(['LBrace', 'FunctionTok', 'ClassTok'])) {
     *   this.Expression()
     * }
     */
    tokenNotIn(tokenNames: string[], offset: number = 1): boolean {
        const token = this.peek(offset)
        // EOF 时返回 true（认为"不在任何集合中"）
        return token ? !tokenNames.includes(token.tokenName) : true
    }
    
    /**
     * [lookahead = t1 t2 ...]
     * 规范：序列前瞻，检查连续的 token 序列是否匹配
     * 
     * 规范中的使用：较少使用（多数是否定序列）
     * 
     * @example
     * // 检查是否是 "async function"
     * if (this.tokenHelper.matchSequence(['AsyncTok', 'FunctionTok'])) { ... }
     */
    matchSequence(tokenNames: string[]): boolean {
        const peeked = this.peekSequence(tokenNames.length)
        if (peeked.length !== tokenNames.length) {
            return false
        }
        return peeked.every((token, i) => token.tokenName === tokenNames[i])
    }
    
    /**
     * [lookahead ≠ t1 t2 ...]
     * 规范：否定序列前瞻，检查连续的 token 序列是否不匹配
     * 
     * 规范中的使用案例：
     * - Line 1115: [lookahead ≠ let []          - ForStatement
     * - Line 1120: [lookahead ≠ let []          - ForInOfStatement (in)
     * 
     * @example
     * // ForStatement: [lookahead ≠ let []
     * if (this.tokenHelper.notMatchSequence(['LetTok', 'LBracket'])) {
     *   this.Expression({ In: false })
     * }
     */
    notMatchSequence(tokenNames: string[]): boolean {
        return !this.matchSequence(tokenNames)
    }
    
    
    /**
     * 检查：token 序列匹配且中间无换行符
     * 
     * 通用能力：可用于任何需要序列+换行符约束的语言
     * 
     * @param tokenNames token 名称序列
     * @returns true = 序列匹配且中间都在同一行
     * 
     * @example
     * // 检查 async function 且中间无换行
     * if (this.matchSequenceWithoutLineTerminator(['AsyncTok', 'FunctionTok'])) {
     *   // 是 async function（同一行）
     * }
     */
    matchSequenceWithoutLineTerminator(tokenNames: string[]): boolean {
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

    // ============================================
    // 层级 2：前瞻检查方法（自动设置 _parseSuccess）
    // ============================================

    /**
     * 前瞻检查：当前 token 不能是指定类型
     * 如果是，则标记失败
     *
     * @param tokenName - 不允许的 token 类型
     * @param offset - 偏移量（默认 1，即当前 token）
     *
     * @example
     * // [lookahead ≠ function]
     * this.lookaheadNot('FunctionTok')
     */
    protected lookaheadNot(tokenName: string, offset: number = 1): void {
        if (!this._parseSuccess) return

        if (this.tokenIs(tokenName, offset)) {
            this._parseSuccess = false
        }
    }

    /**
     * 前瞻检查：当前 token 不能是多个类型中的任何一个
     * 如果是其中之一，则标记失败
     *
     * @param tokenNames - 不允许的 token 类型列表
     * @param offset - 偏移量（默认 1）
     *
     * @example
     * // [lookahead ∉ {{, function, class}]
     * this.lookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])
     */
    protected lookaheadNotIn(tokenNames: string[], offset: number = 1): void {
        if (!this._parseSuccess) return

        for (const tokenName of tokenNames) {
            if (this.tokenIs(tokenName, offset)) {
                this._parseSuccess = false
                return
            }
        }
    }

    /**
     * 前瞻检查：不能是指定的 token 序列
     * 如果完全匹配序列，则标记失败
     *
     * @param tokenNames - token 序列
     *
     * @example
     * // [lookahead ≠ async function]
     * this.lookaheadNotSequence(['AsyncTok', 'FunctionTok'])
     */
    protected lookaheadNotSequence(tokenNames: string[]): void {
        if (!this._parseSuccess) return

        // 检查序列是否完全匹配
        for (let i = 0; i < tokenNames.length; i++) {
            const token = this.peek(i + 1)
            if (token?.tokenName !== tokenNames[i]) {
                return  // 序列不匹配，前瞻通过
            }
        }

        // 序列完全匹配，前瞻失败
        this._parseSuccess = false
    }

    /**
     * 前瞻检查：当前 token 必须是指定类型
     * 如果不是，则标记失败
     *
     * @param tokenName - 必须的 token 类型
     * @param offset - 偏移量（默认 1）
     *
     * @example
     * // [lookahead = =]
     * this.lookaheadIs('Assign')
     */
    protected lookaheadIs(tokenName: string, offset: number = 1): void {
        if (!this._parseSuccess) return

        if (!this.tokenIs(tokenName, offset)) {
            this._parseSuccess = false
        }
    }

    /**
     * 前瞻检查：必须是指定的 token 序列
     * 如果不完全匹配，则标记失败
     *
     * @param tokenNames - token 序列
     *
     * @example
     * // [lookahead = async function]
     * this.lookaheadIsSequence(['AsyncTok', 'FunctionTok'])
     */
    protected lookaheadIsSequence(tokenNames: string[]): void {
        if (!this._parseSuccess) return

        for (let i = 0; i < tokenNames.length; i++) {
            const token = this.peek(i + 1)
            if (token?.tokenName !== tokenNames[i]) {
                this._parseSuccess = false
                return
            }
        }
    }

    /**
     * 前瞻检查：当前 token 前不能有换行符
     * 如果有，则标记失败
     *
     * @example
     * // [no LineTerminator here]
     * this.lookaheadNotLineBreak()
     */
    protected lookaheadNotLineBreak(): void {
        if (!this._parseSuccess) return

        if (this.curToken?.hasLineBreakBefore) {
            this._parseSuccess = false
        }
    }
}

