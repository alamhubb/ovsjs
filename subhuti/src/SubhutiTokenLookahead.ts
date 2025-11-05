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
    
    // ============================================
    // 层级 2：高频组合（3 个）
    // 对应规范中出现 3+ 次的模式
    // ============================================
    
    /**
     * 检查：async [no LineTerminator here] function
     * 
     * 规范中的使用案例（出现 8 次）：
     * - Line 1087: ExpressionStatement          - [lookahead ∉ {async [no LT] function}]
     * - Line 1371: AsyncGeneratorDeclaration    - async [no LT] function *
     * - Line 1375: AsyncGeneratorExpression     - async [no LT] function *
     * - Line 1378: AsyncGeneratorMethod         - async [no LT] *
     * - Line 1388: AsyncFunctionDeclaration     - async [no LT] function
     * - Line 1392: AsyncFunctionExpression      - async [no LT] function
     * - Line 1395: AsyncMethod                  - async [no LT] ClassElementName
     * - Line 1558: export default               - [lookahead ∉ {async [no LT] function}]
     * 
     * @returns true = 是 async function（无换行符）
     * 
     * @example
     * // ExpressionStatement: 排除 async function
     * if (!this.tokenHelper.isAsyncFunctionWithoutLineTerminator()) {
     *   this.AssignmentExpression()
     * }
     */
    isAsyncFunctionWithoutLineTerminator(): boolean {
        const t1 = this.peek(1)
        if (t1?.tokenName !== 'AsyncTok') {
            return false
        }
        
        const t2 = this.peek(2)
        if (t2?.tokenName !== 'FunctionTok') {
            return false
        }
        
        // 检查 async 和 function 之间没有换行符（同一行）
        return t2.rowNum === t1.rowNum
    }
    
    /**
     * 检查：async [no LineTerminator here] *
     * 
     * 规范中的使用案例（出现 3 次）：
     * - Line 1371: AsyncGeneratorDeclaration    - async [no LT] function *
     * - Line 1375: AsyncGeneratorExpression     - async [no LT] function *
     * - Line 1378: AsyncGeneratorMethod         - async [no LT] *
     * 
     * @returns true = 是 async *（无换行符）
     * 
     * @example
     * // AsyncGeneratorMethod: async [no LT] *
     * if (this.tokenHelper.isAsyncGeneratorWithoutLineTerminator()) {
     *   // 这是 async generator
     * }
     */
    isAsyncGeneratorWithoutLineTerminator(): boolean {
        const t1 = this.peek(1)
        if (t1?.tokenName !== 'AsyncTok') {
            return false
        }
        
        const t2 = this.peek(2)
        if (t2?.tokenName !== 'Asterisk') {
            return false
        }
        
        // 检查 async 和 * 之间没有换行符（同一行）
        return t2.rowNum === t1.rowNum
    }
    
    /**
     * 检查：let [
     * 
     * 规范中的使用案例（出现 4 次）：
     * - Line 1087: ExpressionStatement          - [lookahead ∉ {let [}]
     * - Line 1115: ForStatement                 - [lookahead ≠ let []
     * - Line 1120: ForInOfStatement (in)        - [lookahead ≠ let []
     * - Line 1123: ForInOfStatement (of)        - [lookahead ∉ {let}]（隐含 let [）
     * 
     * @returns true = 是 let [ 序列
     * 
     * @example
     * // ForStatement: [lookahead ≠ let []
     * if (!this.tokenHelper.isLetBracket()) {
     *   this.Expression({ In: false })
     * }
     */
    isLetBracket(): boolean {
        return this.matchSequence(['LetTok', 'LBracket'])
    }
    
    // ============================================
    // TODO: 层级 3 - 高层语义方法（第二版实现）
    // ============================================
    
    /**
     * TODO: 第二版实现
     * 
     * 检查：能否作为 ExpressionStatement
     * 
     * 对应规范 Line 1087：
     * [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
     * 
     * 实现逻辑：
     * 1. 不能是 { → isNot('LBrace')
     * 2. 不能是 function → isNot('FunctionTok')
     * 3. 不能是 class → isNot('ClassTok')
     * 4. 不能是 async function（无换行） → !isAsyncFunctionWithoutLineTerminator()
     * 5. 不能是 let [ → !isLetBracket()
     * 
     * 使用示例：
     * if (this.tokenHelper.canBeExpressionStatement()) {
     *   this.Expression({ In: true })
     *   this.tokenConsumer.Semicolon()
     * }
     */
    // canBeExpressionStatement(): boolean {
    //   // TODO: 实现
    //   throw new Error('Not implemented yet')
    // }
    
    /**
     * TODO: 第二版实现
     * 
     * 检查：能否作为 export default 表达式
     * 
     * 对应规范 Line 1558：
     * [lookahead ∉ {function, async [no LineTerminator here] function, class}]
     * 
     * 实现逻辑：
     * 1. 不能是 function → isNot('FunctionTok')
     * 2. 不能是 class → isNot('ClassTok')
     * 3. 不能是 async function（无换行） → !isAsyncFunctionWithoutLineTerminator()
     * 
     * 使用示例：
     * if (this.tokenHelper.canBeExportDefaultExpression()) {
     *   this.AssignmentExpression({ In: true })
     *   this.tokenConsumer.Semicolon()
     * }
     */
    // canBeExportDefaultExpression(): boolean {
    //   // TODO: 实现
    //   throw new Error('Not implemented yet')
    // }
    
    /**
     * TODO: 第二版实现
     * 
     * 检查：能否作为 ForInOfStatement 的左侧表达式
     * 
     * 对应规范 Line 1123：
     * [lookahead ∉ {let, async of}]
     * 
     * 实现逻辑：
     * 1. 不能是 let → isNot('LetTok')
     * 2. 不能是 async of → !matchSequence(['AsyncTok', 'OfTok'])
     * 
     * 使用示例：
     * if (this.tokenHelper.canBeForOfLeftHandSide()) {
     *   this.LeftHandSideExpression()
     * }
     */
    // canBeForOfLeftHandSide(): boolean {
    //   // TODO: 实现
    //   throw new Error('Not implemented yet')
    // }
}

