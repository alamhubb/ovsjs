import { createRegToken } from 'subhuti'
import { SlimeTokensObj, SlimeTokenType } from "@qin/generated-qin-parser-ts";
// 使用包名导入
import { CssTsTokenConsumer, CssTsContextualKeywordTypes, cssTsTokens } from "cssts-compiler";

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
// 2. Hash 放最后，确保 PrivateIdentifier 优先匹配，单独 # 用于 NoRenderBlock
export const ovs6Tokens = cssTsTokens.concat([
  createRegToken(ovsTokenName.Hash, /#/)  // 放在 PrivateIdentifier 之后
])

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
    this.consumeIdentifierValue(OvsContextualKeywordTypes.View)
  }

  /** 消费 # token（NoRenderBlock 的开始） */
  Hash() {
    this.consume(ovsTokenName.Hash)
  }
}
