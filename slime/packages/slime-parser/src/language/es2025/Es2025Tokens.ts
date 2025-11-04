/**
 * ES2025 Token Definitions
 * 基于 ECMAScript® 2025 Grammar Summary (es2025-grammar.md)
 * 扩展 ES2020 Tokens
 */

import Es2020TokenConsumer from "../es2020/Es2020Tokens.ts";
import {Es2020TokenName, es2020TokensObj} from "../es2020/Es2020Tokens.ts";
import {
  createEmptyValueRegToken,
  createKeywordToken,
  createRegToken,
  createValueRegToken,
  SubhutiCreateToken
} from 'subhuti/src/struct/SubhutiCreateToken.ts'

/**
 * ES2025 Token Names
 * 扩展 ES2020 Tokens，新增 ES2025 特性的词法单元
 * 
 * 注：ES2025 主要是对现有特性的完善和稳定，词法层变化较小
 */
export const Es2025TokenName = {
  ...Es2020TokenName,
  
  // ES2025 可能新增的关键字（根据最新提案）
  // TODO: 根据 ES2025 正式规范补充
  
  // 注：以下 tokens 可能已在 ES2020 中定义
  // 这里保留以确保完整性
}

/**
 * ES2025 Tokens 对象定义
 * 
 * 注意事项：
 * 1. ES2025 主要对现有语法进行完善
 * 2. 词法层基本与 ES2020 一致
 * 3. 主要变化在语法层（Parser）的规则组合
 */
export const es2025TokensObj = {
  ...es2020TokensObj,
  
  // ============================================
  // ES2025 可能新增的 Tokens（待规范确认）
  // ============================================
  
  // TODO: 根据 ES2025 正式规范补充新增 tokens
  // 目前 ES2025 主要是对现有特性的完善，词法层变化不大
};

/**
 * ES2025 Tokens 数组
 * 用于词法分析器
 * 
 * ⚠️ 重要：Token 顺序影响匹配优先级
 * - 复合运算符必须在单个运算符之前
 * - 更长的 token 必须在更短的之前
 */
export const es2025Tokens = [
  // 继承 ES2020 的所有 tokens
  ...Object.values(es2025TokensObj),
  
  // TODO: 补充 ES2025 新增 tokens（如果有）
];

/**
 * ES2025 Token Map
 * 按名称或值快速查找 Token
 */
export const es2025TokenMapObj: { [key in string]: SubhutiCreateToken } = Object.fromEntries(
  es2025Tokens.map(token => [token.isKeyword ? token.value : token.name, token])
);

/**
 * ES2025 Token Consumer
 * 扩展 Es2020TokenConsumer，添加 ES2025 新增 Token 的消费方法
 * 
 * 注：ES2025 词法层与 ES2020 基本一致
 * 主要变化在语法规则（Parser）层面
 */
export default class Es2025TokenConsumer extends Es2020TokenConsumer {
  
  // ============================================
  // ES2025 可能新增的消费方法（待补充）
  // ============================================
  
  // TODO: 根据 ES2025 正式规范补充新增方法
  // 目前继承 Es2020TokenConsumer 的所有方法即可
}

