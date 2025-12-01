import { SubhutiCreateToken } from './struct/SubhutiCreateToken.ts'
import SubhutiMatchToken from './struct/SubhutiMatchToken.ts'

/**
 * 正则表达式字面量的 pattern（用于 Parser 层的 rescan）
 * 根据 ECMAScript 规范，RegularExpressionFirstChar 不能是 * (避免与 /* 注释冲突)
 */
export const REGEXP_LITERAL_PATTERN = /^\/(?:[^\n\r\/\\[*]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])*\/[dgimsuvy]*/

/**
 * 尝试匹配正则表达式字面量
 * 用于 Parser 层在需要时重新扫描 Slash 为 RegularExpressionLiteral
 *
 * @param text 要匹配的文本（应以 / 开头）
 * @returns 匹配的正则表达式字面量字符串，或 null
 */
export function matchRegExpLiteral(text: string): string | null {
    const match = text.match(REGEXP_LITERAL_PATTERN)
    return match ? match[0] : null
}

/**
 * 词法目标（对应 ECMAScript 规范的 InputElement）
 */
export enum LexicalGoal {
    /** InputElementDiv - 期望除法运算符 */
    InputElementDiv = 'InputElementDiv',
    /** InputElementRegExp - 期望正则表达式 */
    InputElementRegExp = 'InputElementRegExp',
    /** InputElementTemplateTail - 期望模板尾部（} 开头的模板部分） */
    InputElementTemplateTail = 'InputElementTemplateTail',
}

/**
 * Token 缓存条目
 * 存储解析出的 token 及其后续位置信息
 */
export interface TokenCacheEntry {
    /** 解析出的 token */
    token: SubhutiMatchToken
    /** token 结束后的下一个位置（跳过空白后） */
    nextCodeIndex: number
    /** 下一个位置的行号 */
    nextLine: number
    /** 下一个位置的列号 */
    nextColumn: number
    /** 上一个 token 的名称（用于上下文约束检查） */
    lastTokenName: string | null
}

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
    // 注意：必须用 (?:...) 包裹整个正则，否则 ^A|B 只会锚定 A 分支
    // 例如：^abc|\.14 匹配 "float = 3.14" 会在位置 9 匹配到 .14（错误）
    //       ^(?:abc|\.14) 则不会匹配（正确）
    this._allTokens = tokens.map(token => {
      if (!token.pattern) return token

      return {
        ...token,
        pattern: new RegExp('^(?:' + token.pattern.source + ')', token.pattern.flags)
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

      // 上下文约束检查：onlyAtLineStart - 只能在行首匹配（如 HTMLCloseComment -->）
      // 条件：当前行号 > 上一个非 skip token 的行号，说明在新行开始
      if (token.contextConstraint?.onlyAtLineStart && rowNum <= this._lastRowNum) {
        continue  // 不在行首，跳过这个 token
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

  /**
   * 尝试匹配模板 token (TemplateMiddle 或 TemplateTail)
   * 仅在 InputElementTemplateTail 模式下使用
   */
  private _matchTemplateToken(
    remaining: string,
    index: number,
    rowNum: number,
    columnNum: number
  ) {
    for (const token of this._allTokens) {
      if (token.name !== SubhutiLexerTokenNames.TemplateMiddle &&
          token.name !== SubhutiLexerTokenNames.TemplateTail) {
        continue
      }

      const match = remaining.match(token.pattern)
      if (match) {
        return {
          token: this._createMatchTokenWithLastRow(
            token.name,
            match[0],
            index,
            rowNum,
            columnNum,
            rowNum
          ),
          skip: false
        }
      }
    }
    return null
  }

  // ============================================
  // 按需词法分析 API（On-Demand Lexing）
  // 符合 ECMAScript 规范的 InputElement 切换机制
  // ============================================

  /**
   * 创建初始词法状态
   */
  createInitialState(): LexerState {
    return {
      position: 0,
      rowNum: 1,
      columnNum: 1,
      templateDepth: 0,
      lastTokenRowNum: 1,
      lastTokenName: null
    }
  }

  /**
   * 按需读取下一个 token
   *
   * @param code 源代码
   * @param state 当前词法状态（会被修改）
   * @param lexicalGoal 词法目标（InputElementDiv 或 InputElementRegExp）
   * @returns token 或 null（EOF）
   */
  readNextToken(
    code: string,
    state: LexerState,
    lexicalGoal: LexicalGoal = LexicalGoal.InputElementDiv
  ): SubhutiMatchToken | null {
    // 跳过空白和注释，直到找到有效 token
    while (state.position < code.length) {
      const matched = this._matchTokenWithGoal(
        code,
        state.position,
        state.rowNum,
        state.columnNum,
        state.lastTokenName,
        state.templateDepth,
        lexicalGoal
      )

      if (!matched) {
        const errorChar = code[state.position]
        throw new Error(
          `Unexpected character "${errorChar}" at position ${state.position} (line ${state.rowNum}, column ${state.columnNum})`
        )
      }

      // 更新位置
      const valueLength = matched.token.tokenValue.length
      state.position += valueLength

      // 更新行列号
      const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g)
      if (lineBreaks && lineBreaks.length > 0) {
        state.rowNum += lineBreaks.length
        const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1])
        const lastBreakLen = lineBreaks[lineBreaks.length - 1].length
        state.columnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1
      } else {
        state.columnNum += valueLength
      }

      // 更新模板深度
      if (matched.token.tokenName === SubhutiLexerTokenNames.TemplateHead) {
        state.templateDepth++
      } else if (matched.token.tokenName === SubhutiLexerTokenNames.TemplateTail) {
        state.templateDepth--
      }

      // skip 类型的 token 继续读取下一个
      if (matched.skip) {
        continue
      }

      // 更新状态
      state.lastTokenRowNum = matched.token.rowNum
      state.lastTokenName = matched.token.tokenName

      return matched.token
    }

    return null  // EOF
  }

  /**
   * 检查是否到达文件末尾
   */
  isEOF(code: string, state: LexerState): boolean {
    // 跳过空白检查是否还有内容
    let pos = state.position
    while (pos < code.length) {
      const remaining = code.slice(pos)
      // 检查是否是空白或注释
      const whitespaceMatch = remaining.match(/^[\s]+/)
      if (whitespaceMatch) {
        pos += whitespaceMatch[0].length
        continue
      }
      const singleLineComment = remaining.match(/^\/\/[^\n\r]*/)
      if (singleLineComment) {
        pos += singleLineComment[0].length
        continue
      }
      const multiLineComment = remaining.match(/^\/\*[\s\S]*?\*\//)
      if (multiLineComment) {
        pos += multiLineComment[0].length
        continue
      }
      // 还有其他内容
      return false
    }
    return true
  }

  /**
   * 带词法目标的 token 匹配
   */
  private _matchTokenWithGoal(
    code: string,
    index: number,
    rowNum: number,
    columnNum: number,
    lastTokenName: string | null,
    templateDepth: number,
    lexicalGoal: LexicalGoal
  ) {
    const remaining = code.slice(index)

    // 获取活跃的 tokens
    // 注意：即使 templateDepth > 0，默认情况下也不应该匹配 TemplateMiddle/TemplateTail
    // 只有在 InputElementTemplateTail 模式下才匹配它们
    const activeTokens = this._tokensOutsideTemplate

    for (const token of activeTokens) {
      // InputElementTemplateTail 模式：只匹配 TemplateMiddle 或 TemplateTail
      // 这是模板表达式结束后，需要匹配 } 开头的模板部分
      if (lexicalGoal === LexicalGoal.InputElementTemplateTail) {
        // 在这个模式下，优先尝试匹配模板 token
        const templateMatch = this._matchTemplateToken(remaining, index, rowNum, columnNum)
        if (templateMatch) {
          return templateMatch
        }
        // 如果没有匹配，继续正常匹配
      }

      // 根据词法目标处理 Slash
      if (token.name === 'Slash' || token.name === 'DivideAssign') {
        if (lexicalGoal === LexicalGoal.InputElementRegExp && remaining.startsWith('/')) {
          // 在 InputElementRegExp 模式下，尝试匹配正则表达式
          const regexpMatch = matchRegExpLiteral(remaining)
          if (regexpMatch) {
            return {
              token: this._createMatchTokenWithLastRow(
                'RegularExpressionLiteral',
                regexpMatch,
                index,
                rowNum,
                columnNum,
                rowNum  // lastRowNum 传入当前行号
              ),
              skip: false
            }
          }
          // 正则表达式匹配失败，继续尝试其他 token（包括 Slash）
        }
      }

      const match = remaining.match(token.pattern)
      if (!match) continue

      // 上下文约束检查：onlyAtStart
      if (token.contextConstraint?.onlyAtStart && index !== 0) {
        continue
      }

      // 上下文约束检查：onlyAtLineStart - 只能在行首匹配（如 HTMLCloseComment -->）
      if (token.contextConstraint?.onlyAtLineStart && rowNum <= this._lastRowNum) {
        continue
      }

      // 上下文约束检查：onlyAfter（在按需模式下仍然检查，用于非 Slash token）
      if (token.contextConstraint?.onlyAfter) {
        if (!lastTokenName || !token.contextConstraint.onlyAfter.has(lastTokenName)) {
          continue
        }
      }

      // 上下文约束检查：notAfter
      if (token.contextConstraint?.notAfter) {
        if (lastTokenName && token.contextConstraint.notAfter.has(lastTokenName)) {
          continue
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
        token: this._createMatchTokenWithLastRow(token.name, match[0], index, rowNum, columnNum, this._lastRowNum),
        skip: token.skip
      }
    }

    return null
  }

  // ============================================
  // 新的按位置+模式读取 API
  // ============================================

  /**
   * 在指定位置用指定模式读取单个 token
   *
   * @param code 源代码
   * @param codeIndex 起始位置
   * @param line 起始行号
   * @param column 起始列号
   * @param goal 词法目标
   * @param lastTokenName 上一个 token 的名称（用于上下文约束）
   * @param templateDepth 模板字符串深度
   * @returns TokenCacheEntry 或 null（EOF）
   */
  readTokenAt(
    code: string,
    codeIndex: number,
    line: number,
    column: number,
    goal: LexicalGoal,
    lastTokenName: string | null = null,
    templateDepth: number = 0
  ): TokenCacheEntry | null {
    let pos = codeIndex
    let rowNum = line
    let columnNum = column
    let lastRowNum = line  // 用于 hasLineBreakBefore 计算
    let currentLastTokenName = lastTokenName

    // 跳过空白和注释，直到找到有效 token
    while (pos < code.length) {
      const matched = this._matchTokenWithGoal(
        code,
        pos,
        rowNum,
        columnNum,
        currentLastTokenName,
        templateDepth,
        goal
      )

      if (!matched) {
        const errorChar = code[pos]
        throw new Error(
          `Unexpected character "${errorChar}" at position ${pos} (line ${rowNum}, column ${columnNum})`
        )
      }

      const valueLength = matched.token.tokenValue.length
      const nextPos = pos + valueLength

      // 计算下一个位置的行列号
      let nextRowNum = rowNum
      let nextColumnNum = columnNum
      const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g)
      if (lineBreaks && lineBreaks.length > 0) {
        nextRowNum += lineBreaks.length
        const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1])
        const lastBreakLen = lineBreaks[lineBreaks.length - 1].length
        nextColumnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1
      } else {
        nextColumnNum += valueLength
      }

      // skip 类型的 token 继续读取下一个
      if (matched.skip) {
        // 注意：不更新 lastRowNum！
        // lastRowNum 应该保持为上一个非 skip token 的行号
        // 这样 hasLineBreakBefore 才能正确计算
        pos = nextPos
        rowNum = nextRowNum
        columnNum = nextColumnNum
        continue
      }

      // 找到有效 token，返回缓存条目
      // 重新创建 token 以包含正确的 hasLineBreakBefore
      const token: SubhutiMatchToken = {
        tokenName: matched.token.tokenName,
        tokenValue: matched.token.tokenValue,
        index: pos,
        rowNum: rowNum,
        columnStartNum: columnNum,
        columnEndNum: columnNum + valueLength - 1,
        hasLineBreakBefore: rowNum > lastRowNum
      }

      return {
        token,
        nextCodeIndex: nextPos,
        nextLine: nextRowNum,
        nextColumn: nextColumnNum,
        lastTokenName: token.tokenName
      }
    }

    return null  // EOF
  }

  /**
   * 创建 token（带 lastRowNum 参数）
   */
  private _createMatchTokenWithLastRow(
    tokenName: string,
    value: string,
    index: number,
    rowNum: number,
    columnNum: number,
    lastRowNum: number
  ): SubhutiMatchToken {
    return {
      tokenName: tokenName,
      tokenValue: value,
      index: index,
      rowNum: rowNum,
      columnStartNum: columnNum,
      columnEndNum: columnNum + value.length - 1,
      hasLineBreakBefore: rowNum > lastRowNum
    }
  }
}





