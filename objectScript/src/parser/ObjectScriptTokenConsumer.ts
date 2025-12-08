import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer";
import {SlimeTokensObj, slimeTokens} from "slime-parser/src/language/es2025/SlimeTokens";
import {createKeywordToken, type SubhutiCreateToken} from "subhuti/src/struct/SubhutiCreateToken";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType";

/**
 * ObjectScript Token 名称扩展
 */
export const ObjectScriptTokenName = {
  ...SlimeTokenType,
  ObjectToken: 'ObjectToken',
} as const

/**
 * ObjectScript Token 对象扩展
 * 在 SlimeTokens 基础上添加 object 关键字
 */
export const ObjectScriptTokensObj = {
  ...SlimeTokensObj,
  // object 关键字用于单例对象声明
  ObjectToken: createKeywordToken(ObjectScriptTokenName.ObjectToken, "object")
}

/**
 * ObjectScript 所有 Token 数组
 */
export const objectScriptTokens: SubhutiCreateToken[] = Object.values(ObjectScriptTokensObj)

// 兼容旧名称
export const objectScript6Tokens = objectScriptTokens

/**
 * ObjectScript Token Consumer
 * 继承 SlimeTokenConsumer，添加 ObjectScript 特有的 token 消费方法
 */
export default class ObjectScriptTokenConsumer extends SlimeTokenConsumer {
  /**
   * 消费 object 关键字
   * 用于单例对象声明: object MyConfig { ... }
   */
  ObjectToken() {
    return this.consume(ObjectScriptTokensObj.ObjectToken)
  }
}
