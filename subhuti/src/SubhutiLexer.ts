import { SubhutiCreateToken } from './struct/SubhutiCreateToken.ts'
import SubhutiMatchToken from './struct/SubhutiMatchToken.ts'

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
  private readonly _tokens: SubhutiCreateToken[]
  private _templateDepth = 0

  constructor(tokens: SubhutiCreateToken[]) {
    // 预编译：给所有正则加 ^ 锚点，并保留原有 flags
    this._tokens = tokens.map(token => {
      if (!token.pattern) return token
      
      return {
        ...token,
        pattern: new RegExp('^' + token.pattern.source, token.pattern.flags)
      }
    })
  }

  /**
   * 词法分析主入口
   * @param code 源代码
   * @returns Token 流
   */
  lexer(code: string): SubhutiMatchToken[] {
    const result: SubhutiMatchToken[] = []
    let index = 0
    let rowNum = 1
    let columnNum = 1

    while (index < code.length) {
      const matched = this._matchToken(code, index, rowNum, columnNum)
      
      if (!matched) {
        const errorChar = code[index]
        throw new Error(
          `Unexpected character "${errorChar}" at position ${index} (line ${rowNum}, column ${columnNum})`
        )
      }

      // skip 类型的 token 不加入结果
      if (!matched.skip) {
        result.push(matched.token)
      }

      // 更新位置
      const valueLength = matched.token.tokenValue.length
      index += valueLength
      
      // 更新行列号
      const lines = matched.token.tokenValue.split('\n')
      if (lines.length > 1) {
        rowNum += lines.length - 1
        columnNum = lines[lines.length - 1].length + 1
      } else {
        columnNum += valueLength
      }

      // 更新模板深度
      this._updateTemplateDepth(matched.token.tokenName)
    }

    return result
  }

  private _matchToken(code: string, index: number, rowNum: number, columnNum: number) {
    const remaining = code.slice(index)

    for (const token of this._getActiveTokens()) {
      const match = remaining.match(token.pattern)
      if (!match) continue

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
      columnEndNum: columnNum + value.length - 1
    }
  }

  /**
   * 根据模板深度返回活跃的 tokens
   * 实现 ECMAScript 规范的 InputElement 切换机制
   */
  private _getActiveTokens(): SubhutiCreateToken[] {
    // 在模板内部：所有 tokens 都可用
    if (this._templateDepth > 0) {
      return this._tokens
    }

    // 在模板外部：过滤掉只能在模板内部出现的 tokens
    return this._tokens.filter(
      t => t.name !== 'TemplateMiddle' && t.name !== 'TemplateTail'
    )
  }

  /**
   * 更新模板字符串嵌套深度
   * TemplateHead: 进入模板（深度 +1）
   * TemplateTail: 退出模板（深度 -1）
   * TemplateMiddle: 保持深度
   */
  private _updateTemplateDepth(tokenName: string): void {
    if (tokenName === 'TemplateHead') {
      this._templateDepth++
    } else if (tokenName === 'TemplateTail') {
      this._templateDepth--
    }
  }
}




