import { createKeywordToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import Es6TokenConsumer, {Es6TokenName, es6TokensObj} from "slime-parser/src/language/es2015/Es6Tokens.ts";

export const ovsTokenName = {
  ...Es6TokenName,
  OvsToken: "OvsToken",
  OvsViewToken: "OvsViewToken",
  SlotToken: "SlotToken"
}
export const ovsTokensObj = {
  ...es6TokensObj,
  OvsToken: createKeywordToken(ovsTokenName.OvsToken, "Ovs"),
  OvsViewToken: createKeywordToken(ovsTokenName.OvsViewToken, "ovsView"),
  SlotToken: createKeywordToken(ovsTokenName.SlotToken, "slot")
}
export const ovs6Tokens = Object.values(ovsTokensObj)

export default class OvsTokenConsumer extends Es6TokenConsumer {
  OvsToken() {
    return this.consume(ovsTokensObj.OvsToken)
  }
  
  OvsViewToken() {
    return this.consume(ovsTokensObj.OvsViewToken)
  }
  
  SlotToken() {
    return this.consume(ovsTokensObj.SlotToken)
  }
}
