import { createKeywordToken, createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import Es6TokenConsumer, {Es6TokenName, es6TokensObj} from "slime-parser/src/language/es2015/Es6Tokens.ts";

export const ovsTokenName = {
  ...Es6TokenName,
  OvsViewToken: "OvsViewToken",
  Hash: "Hash"
}
export const ovsTokensObj = {
  ...es6TokensObj,
  OvsViewToken: createKeywordToken(ovsTokenName.OvsViewToken, "ovsView"),
  Hash: createRegToken(ovsTokenName.Hash, /^#/)
}
export const ovs6Tokens = Object.values(ovsTokensObj)

export default class OvsTokenConsumer extends Es6TokenConsumer {
  OvsViewToken() {
    return this.consume(ovsTokensObj.OvsViewToken)
  }

  Hash() {
    return this.consume(ovsTokensObj.Hash)
  }
}
