import { createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import { SlimeTokensObj } from "slime-parser/src/language/es2025/SlimeTokens.ts"
import { SlimeTokenType } from "slime-token/src/SlimeTokenType.ts"
import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer.ts"

export const cssTsTokenName = {
  ...SlimeTokenType,
}

/**
 * CssTs 软关键字（上下文关键字）
 * 这些在词法层是 IdentifierName，在语法层通过值检查来识别
 */
export const CssTsContextualKeywordTypes = {
  Css: 'css',  // css colorRed 或 css buttonBase = { colorRed, fontBold }
} as const

// 合并 tokens - 使用 SlimeTokensObj
export const cssTsTokens = [
  ...Object.values(SlimeTokensObj),
]

export default class CssTsTokenConsumer extends SlimeTokenConsumer {
  /**
   * 消费 'css' 软关键字
   * 用于 CssTs 样式声明：css colorRed 或 css buttonBase = { ... }
   * 注意：css 可作为标识符使用，如 `const css = 123`
   */
  Css() {
    return this.consumeIdentifierValue(CssTsContextualKeywordTypes.Css)
  }
}
