import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer";
import {SlimeTokensObj} from "slime-parser/src/language/es2025/SlimeTokens";
import {type SubhutiCreateToken} from "subhuti/src/struct/SubhutiCreateToken";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType";

/**
 * ObjectScript Token 名称（继承 SlimeTokenType）
 */
export const ObjectScriptTokenName = {
  ...SlimeTokenType,
} as const

/**
 * ObjectScript 软关键字（上下文关键字）
 * 这些在词法层是 IdentifierName，在语法层通过值检查来识别
 * 这样用户仍然可以使用 object 作为变量名
 */
export const ObjectScriptContextualKeywords = {
  Object: 'object',  // object MyConfig { ... }
} as const

/**
 * ObjectScript Token 对象（继承 SlimeTokensObj）
 * 注意：object 是软关键字，不在这里定义
 */
export const ObjectScriptTokensObj = {
  ...SlimeTokensObj,
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
   * 消费 object 软关键字
   * 用于单例对象声明: object MyConfig { ... }
   *
   * 注意：object 是软关键字（上下文关键字），用户仍可使用 object 作为变量名
   * 例如：const object = someValue  // 合法
   */
  ObjectToken() {
    return this.consumeIdentifierValue(ObjectScriptContextualKeywords.Object)
  }
}
