import { createRegToken } from 'subhuti/src/struct/SubhutiCreateToken.ts'
import {SlimeTokensObj} from "slime-parser/src/language/es2025/SlimeTokens.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";
import CssTsTokenConsumer, { CssTsContextualKeywordTypes, cssTsTokens } from "cssts/src/parser/CssTsTokenConsumer.ts";

export const ovsTokenName = {
  ...SlimeTokenType,
  Hash: "Hash"
}

// OVS 软关键字（上下文关键字）
// 这些在词法层是 IdentifierName，在语法层通过值检查来识别
// 这样用户仍然可以使用 view 作为变量名
export const OvsContextualKeywordTypes = {
  ...CssTsContextualKeywordTypes,  // 继承 CssTs 的软关键字 (css)
  View: 'view',  // view ComponentName() { ... }
} as const;

// 合并 tokens:
// 1. cssTsTokens 包含了 SlimeTokensObj（PrivateIdentifier #name 需要优先于单独的 Hash #）
// 2. Hash 放最后（作为 fallback，匹配不是 PrivateIdentifier 的单独 #）
export const ovs6Tokens = [
  ...cssTsTokens,  // 使用 CssTs 的 tokens（已包含 SlimeTokensObj）
  createRegToken(ovsTokenName.Hash, /#/)  // 放在 PrivateIdentifier 之后
]

/**
 * OvsTokenConsumer - 继承 CssTsTokenConsumer
 * 
 * 继承链：SlimeTokenConsumer -> CssTsTokenConsumer -> OvsTokenConsumer
 * 
 * 这样 OVS 文件中可以同时使用：
 * - CssTs 的 css 软关键字
 * - OVS 的 view 软关键字
 */
export default class OvsTokenConsumer extends CssTsTokenConsumer {
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
