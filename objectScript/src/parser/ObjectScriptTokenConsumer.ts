import Es6TokenConsumer, {Es6TokenName, es6TokensObj} from "slime-parser/src/language/es2025/Es2025Tokens";
import {createKeywordToken} from "subhuti/src/struct/SubhutiCreateToken";

export const objectScriptTokenName = {
  ...Es6TokenName,
  ObjectToken: 'ObjectToken',
}
export const objectScriptTokensObj = {
  ...es6TokensObj,
  ObjectToken: createKeywordToken(objectScriptTokenName.ObjectToken, "object")
}
export const objectScript6Tokens = Object.values(objectScriptTokensObj)

export default class ObjectScriptTokenConsumer extends Es6TokenConsumer {
  ObjectToken() {
    return this.consume(objectScriptTokensObj.ObjectToken)
  }
}
