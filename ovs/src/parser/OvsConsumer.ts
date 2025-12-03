import { createKeywordToken, createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import {SlimeTokensObj} from "slime-parser/src/language/es2025/SlimeTokens.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";
import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer.ts";

export const ovsTokenName = {
  ...SlimeTokenType,
  OvsViewToken: "OvsViewToken",
  Hash: "Hash"
}
export const ovsTokensObj = {
  ...SlimeTokensObj,
  OvsViewToken: createKeywordToken(ovsTokenName.OvsViewToken, "ovsView"),
  Hash: createRegToken(ovsTokenName.Hash, /^#/)
}
export const ovs6Tokens = Object.values(ovsTokensObj)

export default class OvsTokenConsumer extends SlimeTokenConsumer {
  OvsViewToken() {
    return this.consume(ovsTokenName.OvsViewToken)
  }

  Hash() {
    return this.consume(ovsTokenName.Hash)
  }
}
