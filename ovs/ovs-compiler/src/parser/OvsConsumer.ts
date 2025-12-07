import { createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import {SlimeTokensObj} from "slime-parser/src/language/es2025/SlimeTokens.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";
import SlimeTokenConsumer from "slime-parser/src/language/es2025/SlimeTokenConsumer.ts";

export const ovsTokenName = {
  ...SlimeTokenType,
  Hash: "Hash"
}

// OVS 软关键字（上下文关键字）
// 这些在词法层是 IdentifierName，在语法层通过值检查来识别
// 这样用户仍然可以使用 view 作为变量名
export const OvsContextualKeywordTypes = {
  View: 'view',  // view ComponentName() { ... }
} as const;

// 合并 tokens:
// 1. SlimeTokensObj 放前面（PrivateIdentifier #name 需要优先于单独的 Hash #）
// 2. Hash 放最后（作为 fallback，匹配不是 PrivateIdentifier 的单独 #）
export const ovs6Tokens = [
  ...Object.values(SlimeTokensObj),
  createRegToken(ovsTokenName.Hash, /#/)  // 放在 PrivateIdentifier 之后
]

export default class OvsTokenConsumer extends SlimeTokenConsumer {
  /**
   * 消费 'view' 软关键字
   * 用于 OVS 组件声明：view ComponentName(props) { ... }
   * 注意：view 可作为标识符使用，如 `const view = 123`
   */
  View() {
    return this.consumeIdentifierValue(OvsContextualKeywordTypes.View)
  }

  /** 消费 # token（NoRenderBlock 的开始） */
  Hash() {
    return this.consume(ovsTokenName.Hash)
  }
}
