import Es6TokenConsumer from "../es2015/Es6Tokens.ts";
import {Es6TokenName, es6TokensObj} from "../es2015/Es6Tokens.ts";
import {
  createEmptyValueRegToken,
  createKeywordToken,
  createRegToken,
  createValueRegToken,
  SubhutiCreateToken
} from 'subhuti/src/struct/SubhutiCreateToken.ts'

/**
 * ES2020 (ES11) Token Names
 * 扩展 ES6 Tokens，新增 ES2020 特性的词法单元
 */
export const Es2020TokenName = {
  ...Es6TokenName,
  // ES2020 新增运算符
  OptionalChaining: 'OptionalChainingTok',      // ?.
  NullishCoalescing: 'NullishCoalescingTok',    // ??
  Exponentiation: 'ExponentiationTok',          // ** (ES2016)
  ExponentiationAssign: 'ExponentiationAssignTok', // **= (ES2016)
  
  // ES2020 新增关键字
  MetaTok: 'MetaTok',                           // meta (用于 import.meta)
  
  // ES2020 BigInt 字面量
  BigIntLiteral: 'BigIntLiteralTok',            // 123n, 0b1010n, 0o777n, 0xFFn
  
  // ES2022 私有标识符符号
  Hash: 'HashTok',                              // # (用于私有属性)
}

/**
 * ES2020 Tokens 对象定义
 * 
 * 注意事项：
 * 1. OptionalChaining (?.) 需要在 Dot 之前定义，优先匹配
 * 2. Exponentiation (**) 需要在 Asterisk 之前定义，优先匹配
 * 3. NullishCoalescing (??) 需要在 Question 之前定义，优先匹配
 * 4. ExponentiationAssign (**=) 需要在 Exponentiation 之前定义，优先匹配
 * 5. BigIntLiteral 支持十进制、二进制、八进制、十六进制 + n 后缀
 */
export const es2020TokensObj = {
  ...es6TokensObj,
  
  // ============================================
  // ES2020 新增运算符 Tokens
  // ============================================
  
  /**
   * OptionalChaining: ?.
   * 规范 §1.8: OptionalChainingPunctuator :: ?. [lookahead ∉ DecimalDigit]
   * 
   * 注意：词法层无法实现前瞻检查，需在 Parser 层处理
   * 优先级：必须在 Question 和 Dot 之前定义
   */
  OptionalChaining: createValueRegToken(
    Es2020TokenName.OptionalChaining, 
    /\?\./,  // 匹配 ?.
    '?.'
  ),
  
  /**
   * NullishCoalescing: ??
   * 规范 §1.8: Nullish Coalescing Operator
   * 
   * 优先级：必须在 Question 之前定义
   */
  NullishCoalescing: createValueRegToken(
    Es2020TokenName.NullishCoalescing,
    /\?\?/,  // 匹配 ??
    '??'
  ),
  
  /**
   * ExponentiationAssign: **=
   * 规范 §1.8: AssignmentOperator
   * 
   * 优先级：必须在 Exponentiation 之前定义
   */
  ExponentiationAssign: createValueRegToken(
    Es2020TokenName.ExponentiationAssign,
    /\*\*=/,  // 匹配 **=
    '**='
  ),
  
  /**
   * Exponentiation: **
   * 规范 §1.8: Exponentiation Operator (ES2016)
   * 
   * 优先级：必须在 Asterisk 之前定义
   */
  Exponentiation: createValueRegToken(
    Es2020TokenName.Exponentiation,
    /\*\*/,  // 匹配 **
    '**'
  ),
  
  // ============================================
  // ES2020 新增关键字 Tokens
  // ============================================
  
  /**
   * meta: 用于 import.meta
   * 规范 §2.7: ImportMeta :: import . meta
   */
  MetaTok: createKeywordToken(Es2020TokenName.MetaTok, "meta"),
  
  // ============================================
  // ES2020 BigInt 字面量 Tokens
  // ============================================
  
  /**
   * BigIntLiteral: 大整数字面量（带 n 后缀）
   * 规范 §1.9.3
   * 
   * 支持：
   * - 十进制: 123n, 0n
   * - 二进制: 0b1010n, 0B1010n
   * - 八进制: 0o777n, 0O777n
   * - 十六进制: 0xFFn, 0XFFn
   * 
   * 注意：
   * 1. 0n 是有效的 BigInt
   * 2. 浮点数不能有 n 后缀（如 1.5n 非法）
   * 3. 科学计数法不能有 n 后缀（如 1e10n 非法）
   */
  BigIntLiteral: createEmptyValueRegToken(
    Es2020TokenName.BigIntLiteral,
    // 组合正则：十进制 | 二进制 | 八进制 | 十六进制 + n 后缀
    /(?:0[bB][01]+|0[oO][0-7]+|0[xX][0-9a-fA-F]+|0|[1-9][0-9]*)n/
  ),
  
  /**
   * Hash: # 符号（ES2022）
   * 规范 §1.5.2: PrivateIdentifier :: # IdentifierName
   * 
   * 用于：
   * - 私有字段: #count
   * - 私有方法: #privateMethod()
   * 
   * 设计说明：
   * - 词法层只识别 # 符号
   * - 语法层组合 # + IdentifierName 形成 PrivateIdentifier
   * - 符合"词法分析识别token，语法分析负责组合"的原则
   */
  Hash: createValueRegToken(
    Es2020TokenName.Hash,
    /#/,
    '#'
  ),
};

/**
 * ES2020 Tokens 数组
 * 用于词法分析器
 * 
 * ⚠️ 重要：Token 顺序影响匹配优先级
 * - 复合运算符必须在单个运算符之前
 * - OptionalChaining (?.) 必须在 Question (?) 之前
 * - Exponentiation (**) 必须在 Asterisk (*) 之前
 * - NullishCoalescing (??) 必须在 Question (?) 之前
 */
export const es2020Tokens = [
  // ============================================
  // 优先级最高：ES2020 复合运算符（必须在前）
  // ============================================
  es2020TokensObj.ExponentiationAssign,   // **= (必须在 ** 之前)
  es2020TokensObj.Exponentiation,         // ** (必须在 * 之前)
  es2020TokensObj.NullishCoalescing,      // ?? (必须在 ? 之前)
  es2020TokensObj.OptionalChaining,       // ?. (必须在 ? 和 . 之前)
  
  // ============================================
  // 其他 ES6/ES5 tokens
  // ============================================
  ...Object.values(es6TokensObj),
  
  // ============================================
  // ES2020 其他新增 tokens
  // ============================================
  es2020TokensObj.MetaTok,                // meta 关键字
  es2020TokensObj.BigIntLiteral,          // BigInt 字面量
  es2020TokensObj.Hash,                   // # 符号（ES2022 私有标识符）
];

/**
 * ES2020 Token Map
 * 按名称或值快速查找 Token
 */
export const es2020TokenMapObj: { [key in string]: SubhutiCreateToken } = Object.fromEntries(
  es2020Tokens.map(token => [token.isKeyword ? token.value : token.name, token])
);

/**
 * ES2020 Token Consumer
 * 扩展 Es6TokenConsumer，添加 ES2020 新增 Token 的消费方法
 */
export default class Es2020TokenConsumer extends Es6TokenConsumer {
  
  // ============================================
  // ES2020 新增运算符消费方法
  // ============================================
  
  /**
   * 消费 Optional Chaining 运算符: ?.
   * 
   * 注意：规范要求 ?. [lookahead ∉ DecimalDigit]
   * 但词法层无法实现前瞻，需在 Parser 层验证
   */
  OptionalChaining() {
    return this.consume(es2020TokensObj.OptionalChaining);
  }
  
  /**
   * 消费 Nullish Coalescing 运算符: ??
   */
  NullishCoalescing() {
    return this.consume(es2020TokensObj.NullishCoalescing);
  }
  
  /**
   * 消费幂运算符: **
   * ES2016 新增
   */
  Exponentiation() {
    return this.consume(es2020TokensObj.Exponentiation);
  }
  
  /**
   * 消费幂赋值运算符: **=
   * ES2016 新增
   */
  ExponentiationAssign() {
    return this.consume(es2020TokensObj.ExponentiationAssign);
  }
  
  // ============================================
  // ES2020 新增关键字消费方法
  // ============================================
  
  /**
   * 消费 meta 关键字
   * 用于 import.meta 表达式
   */
  MetaTok() {
    return this.consume(es2020TokensObj.MetaTok);
  }
  
  // ============================================
  // ES2020 BigInt 字面量消费方法
  // ============================================
  
  /**
   * 消费 BigInt 字面量
   * 
   * 示例：
   * - 123n (十进制)
   * - 0b1010n (二进制)
   * - 0o777n (八进制)
   * - 0xFFn (十六进制)
   */
  BigIntLiteral() {
    return this.consume(es2020TokensObj.BigIntLiteral);
  }
  
  // ============================================
  // ES2022 私有标识符符号消费方法
  // ============================================
  
  /**
   * 消费 # 符号（ES2022）
   * 
   * 用于私有标识符：
   * - #count
   * - #privateMethod
   * 
   * 注意：# 和标识符的组合在 Parser 层实现
   */
  Hash() {
    return this.consume(es2020TokensObj.Hash);
  }
}

