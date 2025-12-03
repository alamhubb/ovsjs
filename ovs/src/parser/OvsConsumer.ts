import { createKeywordToken, createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import {SlimeTokensObj} from "slime-parser/src/language/es2025/SlimeTokens.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";
import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer.ts";

export const ovsTokenName = {
  ...SlimeTokenType,
  OvsViewToken: "OvsViewToken",
  Hash: "Hash"
}

// OVS 特有的 tokens
const ovsSpecificTokens = [
  createKeywordToken(ovsTokenName.OvsViewToken, "ovsView"),
  createRegToken(ovsTokenName.Hash, /#/)
]

// 合并 tokens:
// 1. OvsViewToken 放最前面（确保 ovsView 不被识别为普通标识符）
// 2. SlimeTokensObj 放中间（PrivateIdentifier #name 需要优先于单独的 Hash #）
// 3. Hash 放最后（作为 fallback，匹配不是 PrivateIdentifier 的单独 #）
export const ovs6Tokens = [
  createKeywordToken(ovsTokenName.OvsViewToken, "ovsView"),
  ...Object.values(SlimeTokensObj),
  createRegToken(ovsTokenName.Hash, /#/)  // 放在 PrivateIdentifier 之后
]

export default class OvsTokenConsumer extends SlimeTokenConsumer {
  OvsViewToken() {
    return this.consume(ovsTokenName.OvsViewToken)
  }

  /** 消费 # token（NoRenderBlock 的开始） */
  Hash() {
    return this.consume(ovsTokenName.Hash)
  }
}
