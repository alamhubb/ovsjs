import { createKeywordToken, createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import {SlimeTokensObj} from "slime-parser/src/language/es2025/SlimeTokens.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";
import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer.ts";

export const ovsTokenName = {
  ...SlimeTokenType,
  OvsViewToken: "OvsViewToken",
  Hash: "Hash"
}

// OVS 特有的 tokens - 放在 SlimeTokens 之前
const ovsSpecificTokens = [
  createKeywordToken(ovsTokenName.OvsViewToken, "ovsView"),
  createRegToken(ovsTokenName.Hash, /#/)
]

// 合并 tokens: OVS tokens 放前面，确保优先级高于 IdentifierName
export const ovs6Tokens = [
  ...ovsSpecificTokens,
  ...Object.values(SlimeTokensObj)
]

export default class OvsTokenConsumer extends SlimeTokenConsumer {
  OvsViewToken() {
    return this.consume(ovsTokenName.OvsViewToken)
  }

  Hash() {
    return this.consume(ovsTokenName.Hash)
  }
}
