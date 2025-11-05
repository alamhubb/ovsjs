/**
 * Subhuti Lookahead - 前瞻功能（静态工具类）
 * 
 * 对应 ECMAScript® 2025 规范中的所有 [lookahead ...] 约束
 * 规范地址：https://tc39.es/ecma262/2025/#sec-grammar-summary
 * 
 * 设计原则：
 * 1. 不消费 token（只查看，tokenIndex 不变）
 * 2. 不影响 parseSuccess 状态
 * 3. 返回 boolean（true = 满足约束）
 * 4. 提供静态方法，Parser 直接调用
 * 
 * @version 1.0.0
 */

import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts"

export default class SubhutiLookahead {
  
  // ============================================
  // 层级 1：基础方法（8 个）
  // ============================================
  
  /**
   * 前瞻：获取未来的 token（不消费）
   * 
   * @param tokens token 数组
   * @param currentIndex 当前 tokenIndex
   * @param offset 偏移量（1 = 下一个 token，2 = 下下个...）
   * @returns token 或 undefined（EOF）
   * 
   * @example
   * const next = SubhutiLookahead.peek(tokens, index, 1)  // 下一个 token
   * const next2 = SubhutiLookahead.peek(tokens, index, 2) // 下下个 token
   */
  static peek(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    offset: number = 1
  ): SubhutiMatchToken | undefined {
    const index = currentIndex + offset - 1
    return index >= 0 && index < tokens.length 
      ? tokens[index] 
      : undefined
  }
  
  /**
   * 前瞻：获取连续的 N 个 token
   * 
   * @param tokens token 数组
   * @param currentIndex 当前 tokenIndex
   * @param count 要获取的 token 数量
   * @returns token 数组（长度可能小于 count，如果遇到 EOF）
   * 
   * @example
   * const next2 = SubhutiLookahead.peekSequence(tokens, index, 2)
   * // 返回：[token1, token2] 或 [token1] 或 []
   */
  static peekSequence(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    count: number
  ): SubhutiMatchToken[] {
    const result: SubhutiMatchToken[] = []
    for (let i = 1; i <= count; i++) {
      const token = this.peek(tokens, currentIndex, i)
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
   * if (SubhutiLookahead.is(tokens, index, 'ElseTok')) { ... }
   */
  static is(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    tokenName: string, 
    offset: number = 1
  ): boolean {
    return this.peek(tokens, currentIndex, offset)?.tokenName === tokenName
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
   * if (SubhutiLookahead.isNot(this._tokens, this.tokenIndex, 'LBrace')) {
   *   this.ExpressionBody()
   * }
   */
  static isNot(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    tokenName: string, 
    offset: number = 1
  ): boolean {
    const token = this.peek(tokens, currentIndex, offset)
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
   * if (SubhutiLookahead.isIn(tokens, index, ['DecimalDigit8', 'DecimalDigit9'])) { ... }
   */
  static isIn(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    tokenNames: string[], 
    offset: number = 1
  ): boolean {
    const token = this.peek(tokens, currentIndex, offset)
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
   * if (SubhutiLookahead.isNotIn(this._tokens, this.tokenIndex, ['LBrace', 'FunctionTok', 'ClassTok'])) {
   *   this.Expression()
   * }
   */
  static isNotIn(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    tokenNames: string[], 
    offset: number = 1
  ): boolean {
    const token = this.peek(tokens, currentIndex, offset)
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
   * if (SubhutiLookahead.matchSequence(tokens, index, ['AsyncTok', 'FunctionTok'])) { ... }
   */
  static matchSequence(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    tokenNames: string[]
  ): boolean {
    const peeked = this.peekSequence(tokens, currentIndex, tokenNames.length)
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
   * if (SubhutiLookahead.notMatchSequence(this._tokens, this.tokenIndex, ['LetTok', 'LBracket'])) {
   *   this.Expression({ In: false })
   * }
   */
  static notMatchSequence(
    tokens: SubhutiMatchToken[], 
    currentIndex: number, 
    tokenNames: string[]
  ): boolean {
    return !this.matchSequence(tokens, currentIndex, tokenNames)
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
   * if (!SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(this._tokens, this.tokenIndex)) {
   *   this.AssignmentExpression()
   * }
   */
  static isAsyncFunctionWithoutLineTerminator(
    tokens: SubhutiMatchToken[], 
    currentIndex: number
  ): boolean {
    const t1 = this.peek(tokens, currentIndex, 1)
    if (t1?.tokenName !== 'AsyncTok') {
      return false
    }
    
    const t2 = this.peek(tokens, currentIndex, 2)
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
   * if (SubhutiLookahead.isAsyncGeneratorWithoutLineTerminator(this._tokens, this.tokenIndex)) {
   *   // 这是 async generator
   * }
   */
  static isAsyncGeneratorWithoutLineTerminator(
    tokens: SubhutiMatchToken[], 
    currentIndex: number
  ): boolean {
    const t1 = this.peek(tokens, currentIndex, 1)
    if (t1?.tokenName !== 'AsyncTok') {
      return false
    }
    
    const t2 = this.peek(tokens, currentIndex, 2)
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
   * if (!SubhutiLookahead.isLetBracket(this._tokens, this.tokenIndex)) {
   *   this.Expression({ In: false })
   * }
   */
  static isLetBracket(
    tokens: SubhutiMatchToken[], 
    currentIndex: number
  ): boolean {
    return this.matchSequence(tokens, currentIndex, ['LetTok', 'LBracket'])
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
   * if (SubhutiLookahead.canBeExpressionStatement(this._tokens, this.tokenIndex)) {
   *   this.Expression({ In: true })
   *   this.tokenConsumer.Semicolon()
   * }
   */
  // static canBeExpressionStatement(
  //   tokens: SubhutiMatchToken[], 
  //   currentIndex: number
  // ): boolean {
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
   * if (SubhutiLookahead.canBeExportDefaultExpression(this._tokens, this.tokenIndex)) {
   *   this.AssignmentExpression({ In: true })
   *   this.tokenConsumer.Semicolon()
   * }
   */
  // static canBeExportDefaultExpression(
  //   tokens: SubhutiMatchToken[], 
  //   currentIndex: number
  // ): boolean {
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
   * if (SubhutiLookahead.canBeForOfLeftHandSide(this._tokens, this.tokenIndex)) {
   *   this.LeftHandSideExpression()
   * }
   */
  // static canBeForOfLeftHandSide(
  //   tokens: SubhutiMatchToken[], 
  //   currentIndex: number
  // ): boolean {
  //   // TODO: 实现
  //   throw new Error('Not implemented yet')
  // }
}





