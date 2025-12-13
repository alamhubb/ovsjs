import { createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import { SlimeTokensObj } from "slime-parser/src/language/es2025/SlimeTokens.ts"
import { SlimeTokenType } from "slime-token/src/SlimeTokenType.ts"
import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer.ts"

export const cssTsTokenName = {
  ...SlimeTokenType,
}

/**
 * CssTs 软关键字（上下文关键字）
 */
export const CssTsContextualKeywordTypes = {
  Css: 'css',
} as const

export const cssTsTokens = [
  ...Object.values(SlimeTokensObj),
]

export default class CssTsTokenConsumer extends SlimeTokenConsumer {
  /**
   * 消费 'css' 软关键字
   */
  Css() {
    return this.consumeIdentifierValue(CssTsContextualKeywordTypes.Css)
  }
}
