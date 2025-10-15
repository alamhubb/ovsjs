import { SubhutiCreateToken, createKeywordToken, createRegToken } from '../../src/struct/SubhutiCreateToken.ts'

// 最小化Token集合 - 专门用于测试Or回退

export enum MinimalTokenName {
  // 标识符和字面量
  Identifier = 'Identifier',
  NumericLiteral = 'NumericLiteral',
  
  // 运算符
  Arrow = 'Arrow',          // =>
  LessThan = 'LessThan',    // <
  LogicalOr = 'LogicalOr',  // ||
  
  // 括号
  LParen = 'LParen',        // (
  RParen = 'RParen',        // )
  
  // 分隔符
  Semicolon = 'Semicolon',  // ;
}

export const minimalTokens: SubhutiCreateToken[] = [
  // 运算符（使用正则，优先匹配）
  createRegToken(MinimalTokenName.Arrow, /=>/),
  createRegToken(MinimalTokenName.LogicalOr, /\|\|/),
  createRegToken(MinimalTokenName.LessThan, /</),
  createRegToken(MinimalTokenName.LParen, /\(/),
  createRegToken(MinimalTokenName.RParen, /\)/),
  createRegToken(MinimalTokenName.Semicolon, /;/),
  
  // 字面量（后匹配）
  createRegToken(MinimalTokenName.NumericLiteral, /[0-9]+/),
  createRegToken(MinimalTokenName.Identifier, /[a-zA-Z_][a-zA-Z0-9_]*/),
]

