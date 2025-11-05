/**
 * ES2025 Tokens - 完全符合 ECMAScript® 2025 规范
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 * 
 * 设计原则：
 * 1. 完全独立，不继承任何其他版本
 * 2. 按规范 A.1 词法语法组织
 * 3. 只在词法层实现字符级 lookahead
 * 4. 长 token 在前，短 token 在后
 * 5. YAGNI - 只导出 tokens 数组，不需要对象、Map、Consumer 类
 */

import {
  createKeywordToken,
  createValueRegToken,
  createEmptyValueRegToken,
  SubhutiCreateToken
} from 'subhuti/src/struct/SubhutiCreateToken.ts'

export const es2025Tokens: SubhutiCreateToken[] = [
  
  // ============================================
  // A.1.2 注释 (Comments)
  // 规范：§1.3 Line 90-123
  // ============================================
  
  // Hashbang 注释（必须在文件开头）
  createValueRegToken('HashbangComment', /#![^\n\r]*/, '', 'skip'),
  
  // 多行注释
  createValueRegToken('MultiLineComment', /\/\*[\s\S]*?\*\//, '', 'skip'),
  
  // 单行注释
  createValueRegToken('SingleLineComment', /\/\/[^\n\r]*/, '', 'skip'),
  
  // ============================================
  // A.1.1 空白符和换行符
  // 规范：§1.2 Line 60-86
  // ============================================
  
  // 空白符（跳过）
  createValueRegToken('WhiteSpace', /[\t\v\f \u00A0\uFEFF]+/, '', 'skip'),
  
  // 换行符：\r\n 必须整体匹配（优先）
  createValueRegToken('LineTerminator', /\r\n/, '', 'skip'),
  
  // 换行符：其他形式
  createValueRegToken('LineTerminator', /[\n\r\u2028\u2029]/, '', 'skip'),
  
  // ============================================
  // A.1.5 关键字和保留字
  // 规范：§1.5 Line 174-179
  // 优先级：关键字必须在标识符之前
  // ============================================
  
  createKeywordToken('AwaitTok', 'await'),
  createKeywordToken('BreakTok', 'break'),
  createKeywordToken('CaseTok', 'case'),
  createKeywordToken('CatchTok', 'catch'),
  createKeywordToken('ClassTok', 'class'),
  createKeywordToken('ConstTok', 'const'),
  createKeywordToken('ContinueTok', 'continue'),
  createKeywordToken('DebuggerTok', 'debugger'),
  createKeywordToken('DefaultTok', 'default'),
  createKeywordToken('DeleteTok', 'delete'),
  createKeywordToken('DoTok', 'do'),
  createKeywordToken('ElseTok', 'else'),
  createKeywordToken('EnumTok', 'enum'),
  createKeywordToken('ExportTok', 'export'),
  createKeywordToken('ExtendsTok', 'extends'),
  createKeywordToken('FalseTok', 'false'),
  createKeywordToken('FinallyTok', 'finally'),
  createKeywordToken('ForTok', 'for'),
  createKeywordToken('FunctionTok', 'function'),
  createKeywordToken('IfTok', 'if'),
  createKeywordToken('ImportTok', 'import'),
  createKeywordToken('InTok', 'in'),
  createKeywordToken('InstanceofTok', 'instanceof'),
  createKeywordToken('NewTok', 'new'),
  createKeywordToken('NullTok', 'null'),
  createKeywordToken('ReturnTok', 'return'),
  createKeywordToken('SuperTok', 'super'),
  createKeywordToken('SwitchTok', 'switch'),
  createKeywordToken('ThisTok', 'this'),
  createKeywordToken('ThrowTok', 'throw'),
  createKeywordToken('TrueTok', 'true'),
  createKeywordToken('TryTok', 'try'),
  createKeywordToken('TypeofTok', 'typeof'),
  createKeywordToken('VarTok', 'var'),
  createKeywordToken('VoidTok', 'void'),
  createKeywordToken('WhileTok', 'while'),
  createKeywordToken('WithTok', 'with'),
  createKeywordToken('YieldTok', 'yield'),
  
  // 上下文关键字
  createKeywordToken('AsyncTok', 'async'),
  createKeywordToken('LetTok', 'let'),
  createKeywordToken('StaticTok', 'static'),
  createKeywordToken('GetTok', 'get'),
  createKeywordToken('SetTok', 'set'),
  createKeywordToken('OfTok', 'of'),
  createKeywordToken('TargetTok', 'target'),  // new.target
  createKeywordToken('MetaTok', 'meta'),      // import.meta
  createKeywordToken('AsTok', 'as'),
  createKeywordToken('FromTok', 'from'),
  
  // ============================================
  // A.1.9 数字字面量
  // 规范：§1.9 Line 219-329
  // 优先级：BigInt > 特殊进制 > 十进制
  // ============================================
  
  // BigInt：十六进制 + n
  createEmptyValueRegToken('BigIntLiteral', /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),
  
  // BigInt：二进制 + n
  createEmptyValueRegToken('BigIntLiteral', /0[bB][01](_?[01])*n/),
  
  // BigInt：八进制 + n
  createEmptyValueRegToken('BigIntLiteral', /0[oO][0-7](_?[0-7])*n/),
  
  // BigInt：十进制 + n
  createEmptyValueRegToken('BigIntLiteral', /(?:0|[1-9](_?[0-9])*)n/),
  
  // 十六进制
  createEmptyValueRegToken('NumericLiteral', /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),
  
  // 二进制
  createEmptyValueRegToken('NumericLiteral', /0[bB][01](_?[01])*/),
  
  // 八进制
  createEmptyValueRegToken('NumericLiteral', /0[oO][0-7](_?[0-7])*/),
  
  // 遗留八进制（严格模式下不允许）
  createEmptyValueRegToken('LegacyOctalLiteral', /0[0-7]+/),
  
  // 十进制（含小数、科学计数法、数字分隔符）
  createEmptyValueRegToken('NumericLiteral', /(?:[0-9](_?[0-9])*\.([0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*|[0-9](_?[0-9])*)([eE][+-]?[0-9](_?[0-9])*)?/),
  
  // ============================================
  // A.1.10 字符串字面量
  // 规范：§1.10 Line 331-413
  // ============================================
  
  // 双引号字符串
  createEmptyValueRegToken('StringLiteral', /"(?:[^\n\r"\\]|\\(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9xu\n\r]|0(?![0-9])|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
  
  // 单引号字符串
  createEmptyValueRegToken('StringLiteral', /'(?:[^\n\r'\\]|\\(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9xu\n\r]|0(?![0-9])|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),
  
  // ============================================
  // A.1.12 模板字面量
  // 规范：§1.12 Line 461-518
  // 优先级：必须在字符串之前
  // ============================================
  
  createEmptyValueRegToken('TemplateHead', /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
  
  createEmptyValueRegToken('TemplateMiddle', /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
  
  createEmptyValueRegToken('TemplateTail', /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
  
  createEmptyValueRegToken('NoSubstitutionTemplate', /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
  
  // ============================================
  // A.1.8 运算符和标点符号
  // 规范：§1.8 Line 181-202
  // 优先级：4字符 > 3字符 > 2字符 > 1字符
  // ============================================
  
  // 4 字符
  createValueRegToken('UnsignedRightShiftAssign', />>>=/, '>>>='),
  
  // 3 字符
  createValueRegToken('Ellipsis', /\.\.\./, '...'),
  createValueRegToken('UnsignedRightShift', />>>/, '>>>'),
  createValueRegToken('StrictEqual', /===/, '==='),
  createValueRegToken('StrictNotEqual', /!==/, '!=='),
  createValueRegToken('LeftShiftAssign', /<<=/, '<<='),
  createValueRegToken('RightShiftAssign', />>=/, '>>='),
  createValueRegToken('ExponentiationAssign', /\*\*=/, '**='),
  createValueRegToken('LogicalAndAssign', /&&=/, '&&='),
  createValueRegToken('LogicalOrAssign', /\|\|=/, '||='),
  createValueRegToken('NullishCoalescingAssign', /\?\?=/, '??='),
  
  // 2 字符
  createValueRegToken('Arrow', /=>/, '=>'),
  createValueRegToken('PlusAssign', /\+=/, '+='),
  createValueRegToken('MinusAssign', /-=/, '-='),
  createValueRegToken('MultiplyAssign', /\*=/, '*='),
  createValueRegToken('DivideAssign', /\/=/, '/='),
  createValueRegToken('ModuloAssign', /%=/, '%='),
  createValueRegToken('LeftShift', /<</, '<<'),
  createValueRegToken('RightShift', />>/, '>>'),
  createValueRegToken('LessEqual', /<=/, '<='),
  createValueRegToken('GreaterEqual', />=/, '>='),
  createValueRegToken('Equal', /==/, '=='),
  createValueRegToken('NotEqual', /!=/, '!='),
  createValueRegToken('LogicalAnd', /&&/, '&&'),
  createValueRegToken('LogicalOr', /\|\|/, '||'),
  createValueRegToken('NullishCoalescing', /\?\?/, '??'),
  createValueRegToken('Increment', /\+\+/, '++'),
  createValueRegToken('Decrement', /--/, '--'),
  createValueRegToken('Exponentiation', /\*\*/, '**'),
  createValueRegToken('BitwiseAndAssign', /&=/, '&='),
  createValueRegToken('BitwiseOrAssign', /\|=/, '|='),
  createValueRegToken('BitwiseXorAssign', /\^=/, '^='),
  
  // 🔥 OptionalChaining: ?. [lookahead ∉ DecimalDigit]
  // 规范：§1.8 Line 189
  createValueRegToken(
    'OptionalChaining',
    /\?\./,
    '?.',
    undefined,
    { not: /^\d/ }  // 后面不能是数字
  ),
  
  // 1 字符
  createValueRegToken('LBrace', /\{/, '{'),
  createValueRegToken('RBrace', /\}/, '}'),
  createValueRegToken('LParen', /\(/, '('),
  createValueRegToken('RParen', /\)/, ')'),
  createValueRegToken('LBracket', /\[/, '['),
  createValueRegToken('RBracket', /\]/, ']'),
  createValueRegToken('Dot', /\./, '.'),
  createValueRegToken('Semicolon', /;/, ';'),
  createValueRegToken('Comma', /,/, ','),
  createValueRegToken('Less', /</, '<'),
  createValueRegToken('Greater', />/, '>'),
  createValueRegToken('Plus', /\+/, '+'),
  createValueRegToken('Minus', /-/, '-'),
  createValueRegToken('Asterisk', /\*/, '*'),
  createValueRegToken('Slash', /\//, '/'),
  createValueRegToken('Modulo', /%/, '%'),
  createValueRegToken('BitwiseAnd', /&/, '&'),
  createValueRegToken('BitwiseOr', /\|/, '|'),
  createValueRegToken('BitwiseXor', /\^/, '^'),
  createValueRegToken('BitwiseNot', /~/, '~'),
  createValueRegToken('LogicalNot', /!/, '!'),
  createValueRegToken('Question', /\?/, '?'),
  createValueRegToken('Colon', /:/, ':'),
  createValueRegToken('Assign', /=/, '='),
  
  // ============================================
  // A.1.5 标识符
  // 规范：§1.5 Line 138-179
  // 优先级：私有标识符 > 普通标识符
  // ============================================
  
  // 私有标识符：# + IdentifierName
  createEmptyValueRegToken('PrivateIdentifier', /#[a-zA-Z_$][a-zA-Z0-9_$]*/),
  
  // 普通标识符
  createEmptyValueRegToken('Identifier', /[a-zA-Z_$][a-zA-Z0-9_$]*/),
  
  // ============================================
  // A.1.11 正则字面量（简化版）
  // 规范：§1.11 Line 415-458
  // 注意：完整实现需要上下文感知
  // ============================================
  
  createEmptyValueRegToken('RegularExpressionLiteral', /\/(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])+\/[dgimsuvy]*/),
]
