import { SubhutiCreateToken } from './struct/SubhutiCreateToken.ts'
import SubhutiMatchToken from './struct/SubhutiMatchToken.ts'

export const SubhutiLexerTokenNames = {
    TemplateHead: 'TemplateHead',
    TemplateMiddle: 'TemplateMiddle',
    TemplateTail: 'TemplateTail',
}

/**
 * Subhuti Lexer - 词法分析器
 * 
 * 核心特性：
 * - 预编译正则（构造时一次性处理）
 * - 词法层 lookahead（OptionalChaining 等）
 * - 模板字符串状态管理（InputElement 切换）
 * 
 * @version 1.0.0
 */
export default class SubhutiLexer {
  private readonly _allTokens: SubhutiCreateToken[]
  private readonly _tokensOutsideTemplate: SubhutiCreateToken[]
  private _templateDepth = 0
  private _lastRowNum = 1  // 记录上一个 token 的行号（用于计算 hasLineBreakBefore）

  constructor(tokens: SubhutiCreateToken[]) {
    // 预编译：给所有正则加 ^ 锚点，并保留原有 flags
    this._allTokens = tokens.map(token => {
      if (!token.pattern) return token
      
      return {
        ...token,
        pattern: new RegExp('^' + token.pattern.source, token.pattern.flags)
      }
    })
    
    // 预过滤：只过滤一次，构建模板外部使用的 token 集合
    // 使用硬编码常量（符合 ECMAScript 规范和行业标准）
    this._tokensOutsideTemplate = this._allTokens.filter(
      t => t.name !== SubhutiLexerTokenNames.TemplateMiddle && 
           t.name !== SubhutiLexerTokenNames.TemplateTail
    )
  }

  /**
   * 词法分析主入口
   * @param code 源代码
   * @returns Token 流
   */
  tokenize(code: string): SubhutiMatchToken[] {
    const result: SubhutiMatchToken[] = []
    let index = 0
    let rowNum = 1
    let columnNum = 1
    this._lastRowNum = 1  // 重置上一个 token 的行号

    while (index < code.length) {
      // 传入已匹配的 tokens，用于上下文约束检查
      const matched = this._matchToken(code, index, rowNum, columnNum, result)

      if (!matched) {
        const errorChar = code[index]
        throw new Error(
          `Unexpected character "${errorChar}" at position ${index} (line ${rowNum}, column ${columnNum})`
        )
      }

      // skip 类型的 token 不加入结果
      if (!matched.skip) {
        result.push(matched.token)
        // 只在非 skip token 时更新行号（用于下一个 token 计算 hasLineBreakBefore）
        this._lastRowNum = rowNum
      }

      // 更新位置
      const valueLength = matched.token.tokenValue.length
      index += valueLength

      // 更新行列号
      // LineTerminator 包括: LF(\n), CR(\r), LS(\u2028), PS(\u2029)
      // 注意: \r\n 算作一个换行
      const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g)
      if (lineBreaks && lineBreaks.length > 0) {
        rowNum += lineBreaks.length
        // 最后一个换行符之后的内容长度
        const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1])
        const lastBreakLen = lineBreaks[lineBreaks.length - 1].length
        columnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1
      } else {
        columnNum += valueLength
      }

      // 更新模板深度
      this._updateTemplateDepth(matched.token.tokenName)
    }

    return result
  }

  private _matchToken(
    code: string,
    index: number,
    rowNum: number,
    columnNum: number,
    matchedTokens: SubhutiMatchToken[]
  ) {
    const remaining = code.slice(index)
    // 获取前一个 token 的名称（用于上下文约束检查）
    const lastTokenName = matchedTokens.length > 0
      ? matchedTokens[matchedTokens.length - 1].tokenName
      : null

    for (const token of this._getActiveTokens()) {
      const match = remaining.match(token.pattern)
      if (!match) continue

      // 上下文约束检查：onlyAtStart - 只能在文件开头匹配（如 Hashbang）
      if (token.contextConstraint?.onlyAtStart && index !== 0) {
        continue  // 不在文件开头，跳过这个 token
      }

      // 上下文约束检查：onlyAfter - 只有前一个 token 在集合中才匹配
      if (token.contextConstraint?.onlyAfter) {
        if (!lastTokenName || !token.contextConstraint.onlyAfter.has(lastTokenName)) {
          continue  // 不满足条件，跳过这个 token
        }
      }

      // 上下文约束检查：notAfter - 前一个 token 不能在集合中
      if (token.contextConstraint?.notAfter) {
        if (lastTokenName && token.contextConstraint.notAfter.has(lastTokenName)) {
          continue  // 不满足条件，跳过这个 token
        }
      }

      // 词法层 lookahead 检查
      if (token.lookaheadAfter?.not) {
        const afterText = remaining.slice(match[0].length)
        const { not } = token.lookaheadAfter

        const shouldSkip = not instanceof RegExp
          ? not.test(afterText)
          : afterText.startsWith(not)

        if (shouldSkip) continue
      }

      return {
        token: this._createMatchToken(token, match[0], index, rowNum, columnNum),
        skip: token.skip
      }
    }

    return null
  }

  private _createMatchToken(
    token: SubhutiCreateToken,
    value: string,
    index: number,
    rowNum: number,
    columnNum: number
  ): SubhutiMatchToken {
    return {
      tokenName: token.name,
      tokenValue: value,
      index: index,
      rowNum: rowNum,
      columnStartNum: columnNum,
      columnEndNum: columnNum + value.length - 1,
      hasLineBreakBefore: rowNum > this._lastRowNum  // 计算是否有换行（Babel 风格）
    }
  }

  /**
   * 根据模板深度返回活跃的 tokens
   * 实现 ECMAScript 规范的 InputElement 切换机制
   * 
   * 使用预编译策略：构造时过滤一次，运行时只选择数组（性能优化）
   */
  private _getActiveTokens(): SubhutiCreateToken[] {
    // 在模板内部：所有 tokens 都可用
    // 在模板外部：使用预过滤的 token 集合
    return this._templateDepth > 0 
      ? this._allTokens 
      : this._tokensOutsideTemplate
  }

  /**
   * 更新模板字符串嵌套深度
   * 
   * 实现 ECMAScript 规范的 InputElement 切换机制：
   * - TemplateHead (`${`) 进入模板上下文（深度 +1）
   * - TemplateTail (}`) 退出模板上下文（深度 -1）
   * - TemplateMiddle: 保持深度不变
   * 
   * 参考实现：Babel、Acorn、TypeScript Scanner
   * 行业标准做法：直接硬编码 token 名称，无需配置
   */
  private _updateTemplateDepth(tokenName: string): void {
    if (tokenName === SubhutiLexerTokenNames.TemplateHead) {
      this._templateDepth++
    } else if (tokenName === SubhutiLexerTokenNames.TemplateTail) {
      this._templateDepth--
    }
  }
}





