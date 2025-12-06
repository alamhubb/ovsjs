//#region src/SlimeTokenType.d.ts
/**
 * ES2025 Token 名称 - 完全符合 ECMAScript® 2025 规范 A.1 词法语法
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 *
 * 设计原则：
 * 1. TokenNames 属性名和值与规范 A.1 顶层规则名称完全一致
 * 2. 关键字名与规范 ReservedWord 一致（首字母大写）
 * 3. 标点符号使用语义化名称
 */
/**
 * 赋值运算符 Token 类型
 * 对应: = += -= *= /= %= **= <<= >>= >>>= &= |= ^= &&= ||= ??=
 */
declare const SlimeAssignmentOperatorTokenTypes: {
  readonly Assign: "Assign";
  readonly PlusAssign: "PlusAssign";
  readonly MinusAssign: "MinusAssign";
  readonly MultiplyAssign: "MultiplyAssign";
  readonly DivideAssign: "DivideAssign";
  readonly ModuloAssign: "ModuloAssign";
  readonly ExponentiationAssign: "ExponentiationAssign";
  readonly LeftShiftAssign: "LeftShiftAssign";
  readonly RightShiftAssign: "RightShiftAssign";
  readonly UnsignedRightShiftAssign: "UnsignedRightShiftAssign";
  readonly BitwiseAndAssign: "BitwiseAndAssign";
  readonly BitwiseOrAssign: "BitwiseOrAssign";
  readonly BitwiseXorAssign: "BitwiseXorAssign";
  readonly LogicalAndAssign: "LogicalAndAssign";
  readonly LogicalOrAssign: "LogicalOrAssign";
  readonly NullishCoalescingAssign: "NullishCoalescingAssign";
};
/**
 * 更新运算符 Token 类型
 * 对应: ++ --
 */
declare const SlimeUpdateOperatorTokenTypes: {
  readonly Increment: "Increment";
  readonly Decrement: "Decrement";
};
/**
 * 一元运算符 Token 类型
 * 对应: - + ! ~ typeof void delete
 */
declare const SlimeUnaryOperatorTokenTypes: {
  readonly Minus: "Minus";
  readonly Plus: "Plus";
  readonly LogicalNot: "LogicalNot";
  readonly BitwiseNot: "BitwiseNot";
  readonly Typeof: "Typeof";
  readonly Void: "Void";
  readonly Delete: "Delete";
};
/**
 * 二元运算符 Token 类型
 * 对应: == != === !== < > <= >= << >> >>> + - * / % ** | ^ & in instanceof
 */
declare const SlimeBinaryOperatorTokenTypes: {
  readonly Equal: "Equal";
  readonly NotEqual: "NotEqual";
  readonly StrictEqual: "StrictEqual";
  readonly StrictNotEqual: "StrictNotEqual";
  readonly Less: "Less";
  readonly Greater: "Greater";
  readonly LessEqual: "LessEqual";
  readonly GreaterEqual: "GreaterEqual";
  readonly LeftShift: "LeftShift";
  readonly RightShift: "RightShift";
  readonly UnsignedRightShift: "UnsignedRightShift";
  readonly Plus: "Plus";
  readonly Minus: "Minus";
  readonly Asterisk: "Asterisk";
  readonly Slash: "Slash";
  readonly Modulo: "Modulo";
  readonly Exponentiation: "Exponentiation";
  readonly BitwiseOr: "BitwiseOr";
  readonly BitwiseXor: "BitwiseXor";
  readonly BitwiseAnd: "BitwiseAnd";
  readonly In: "In";
  readonly Instanceof: "Instanceof";
};
/**
 * 逻辑运算符 Token 类型
 * 对应: || && ??
 */
declare const SlimeLogicalOperatorTokenTypes: {
  readonly LogicalOr: "LogicalOr";
  readonly LogicalAnd: "LogicalAnd";
  readonly NullishCoalescing: "NullishCoalescing";
};
/**
 * 软关键字（Contextual Keywords）Token 类型
 *
 * 这些标识符在词法层是 IdentifierName，在特定语法位置作为关键字处理。
 * 规范中没有作为 ReservedWord，可以作为变量名使用。
 *
 * 使用场景：
 * - async: 异步函数声明 `async function`、异步方法、异步箭头函数
 * - static: 类静态成员 `static method()` / `static field`
 * - get: 访问器 `get prop()` (MethodDefinition)
 * - set: 访问器 `set prop(v)` (MethodDefinition)
 * - of: for-of 循环 `for (x of iterable)`
 * - from: 模块导入导出 `import x from 'module'` / `export * from 'module'`
 * - as: 模块重命名 `import { x as y }` / `export { x as y }`
 * - target: 元属性 `new.target` (NewTarget)
 * - meta: 元属性 `import.meta` (ImportMeta)
 */
declare const SlimeContextualKeywordTokenTypes: {
  readonly Async: "async";
  readonly Static: "static";
  readonly Let: "let";
  readonly Get: "get";
  readonly Set: "set";
  readonly Of: "of";
  readonly From: "from";
  readonly As: "as";
  readonly Target: "target";
  readonly Meta: "meta";
};
/**
 * 保留字（Reserved Words）Token 类型
 *
 * 规范 A.1.7: ReservedWord :: one of
 *   await break case catch class const continue debugger default
 *   delete do else enum export extends false finally for function
 *   if import in instanceof new null return super switch this
 *   throw true try typeof var void while with yield
 *
 * 注意：
 * - let 在 ES2025 规范中不是 ReservedWord，在非严格模式下可作为标识符
 *   因此 let 被放在 SlimeContextualKeywordTokenTypes 作为软关键字处理
 * - delete, typeof, void, in, instanceof 同时也是运算符（已在运算符分组中定义）
 */
declare const SlimeReservedWordTokenTypes: {
  readonly Await: "Await";
  readonly Break: "Break";
  readonly Case: "Case";
  readonly Catch: "Catch";
  readonly Class: "Class";
  readonly Const: "Const";
  readonly Continue: "Continue";
  readonly Debugger: "Debugger";
  readonly Default: "Default";
  readonly Do: "Do";
  readonly Else: "Else";
  readonly Enum: "Enum";
  readonly Export: "Export";
  readonly Extends: "Extends";
  readonly False: "False";
  readonly Finally: "Finally";
  readonly For: "For";
  readonly Function: "Function";
  readonly If: "If";
  readonly Import: "Import";
  readonly New: "New";
  readonly NullLiteral: "NullLiteral";
  readonly Return: "Return";
  readonly Super: "Super";
  readonly Switch: "Switch";
  readonly This: "This";
  readonly Throw: "Throw";
  readonly True: "True";
  readonly Try: "Try";
  readonly Var: "Var";
  readonly While: "While";
  readonly With: "With";
  readonly Yield: "Yield";
};
declare const SlimeTokenType: {
  readonly Async: "async";
  readonly Static: "static";
  readonly Let: "let";
  readonly Get: "get";
  readonly Set: "set";
  readonly Of: "of";
  readonly From: "from";
  readonly As: "as";
  readonly Target: "target";
  readonly Meta: "meta";
  readonly LogicalOr: "LogicalOr";
  readonly LogicalAnd: "LogicalAnd";
  readonly NullishCoalescing: "NullishCoalescing";
  readonly Equal: "Equal";
  readonly NotEqual: "NotEqual";
  readonly StrictEqual: "StrictEqual";
  readonly StrictNotEqual: "StrictNotEqual";
  readonly Less: "Less";
  readonly Greater: "Greater";
  readonly LessEqual: "LessEqual";
  readonly GreaterEqual: "GreaterEqual";
  readonly LeftShift: "LeftShift";
  readonly RightShift: "RightShift";
  readonly UnsignedRightShift: "UnsignedRightShift";
  readonly Plus: "Plus";
  readonly Minus: "Minus";
  readonly Asterisk: "Asterisk";
  readonly Slash: "Slash";
  readonly Modulo: "Modulo";
  readonly Exponentiation: "Exponentiation";
  readonly BitwiseOr: "BitwiseOr";
  readonly BitwiseXor: "BitwiseXor";
  readonly BitwiseAnd: "BitwiseAnd";
  readonly In: "In";
  readonly Instanceof: "Instanceof";
  readonly LogicalNot: "LogicalNot";
  readonly BitwiseNot: "BitwiseNot";
  readonly Typeof: "Typeof";
  readonly Void: "Void";
  readonly Delete: "Delete";
  readonly Increment: "Increment";
  readonly Decrement: "Decrement";
  readonly Assign: "Assign";
  readonly PlusAssign: "PlusAssign";
  readonly MinusAssign: "MinusAssign";
  readonly MultiplyAssign: "MultiplyAssign";
  readonly DivideAssign: "DivideAssign";
  readonly ModuloAssign: "ModuloAssign";
  readonly ExponentiationAssign: "ExponentiationAssign";
  readonly LeftShiftAssign: "LeftShiftAssign";
  readonly RightShiftAssign: "RightShiftAssign";
  readonly UnsignedRightShiftAssign: "UnsignedRightShiftAssign";
  readonly BitwiseAndAssign: "BitwiseAndAssign";
  readonly BitwiseOrAssign: "BitwiseOrAssign";
  readonly BitwiseXorAssign: "BitwiseXorAssign";
  readonly LogicalAndAssign: "LogicalAndAssign";
  readonly LogicalOrAssign: "LogicalOrAssign";
  readonly NullishCoalescingAssign: "NullishCoalescingAssign";
  readonly Await: "Await";
  readonly Break: "Break";
  readonly Case: "Case";
  readonly Catch: "Catch";
  readonly Class: "Class";
  readonly Const: "Const";
  readonly Continue: "Continue";
  readonly Debugger: "Debugger";
  readonly Default: "Default";
  readonly Do: "Do";
  readonly Else: "Else";
  readonly Enum: "Enum";
  readonly Export: "Export";
  readonly Extends: "Extends";
  readonly False: "False";
  readonly Finally: "Finally";
  readonly For: "For";
  readonly Function: "Function";
  readonly If: "If";
  readonly Import: "Import";
  readonly New: "New";
  readonly NullLiteral: "NullLiteral";
  readonly Return: "Return";
  readonly Super: "Super";
  readonly Switch: "Switch";
  readonly This: "This";
  readonly Throw: "Throw";
  readonly True: "True";
  readonly Try: "Try";
  readonly Var: "Var";
  readonly While: "While";
  readonly With: "With";
  readonly Yield: "Yield";
  readonly WhiteSpace: "WhiteSpace";
  readonly LineTerminator: "LineTerminator";
  readonly HashbangComment: "HashbangComment";
  readonly MultiLineComment: "MultiLineComment";
  readonly SingleLineComment: "SingleLineComment";
  readonly SingleLineHTMLOpenComment: "SingleLineHTMLOpenComment";
  readonly SingleLineHTMLCloseComment: "SingleLineHTMLCloseComment";
  readonly IdentifierName: "IdentifierName";
  readonly PrivateIdentifier: "PrivateIdentifier";
  readonly NumericLiteral: "NumericLiteral";
  readonly StringLiteral: "StringLiteral";
  readonly NoSubstitutionTemplate: "NoSubstitutionTemplate";
  readonly TemplateHead: "TemplateHead";
  readonly TemplateMiddle: "TemplateMiddle";
  readonly TemplateTail: "TemplateTail";
  readonly RegularExpressionLiteral: "RegularExpressionLiteral";
  readonly Ellipsis: "Ellipsis";
  readonly Arrow: "Arrow";
  readonly OptionalChaining: "OptionalChaining";
  readonly LBrace: "LBrace";
  readonly RBrace: "RBrace";
  readonly LParen: "LParen";
  readonly RParen: "RParen";
  readonly LBracket: "LBracket";
  readonly RBracket: "RBracket";
  readonly Dot: "Dot";
  readonly Semicolon: "Semicolon";
  readonly Comma: "Comma";
  readonly Question: "Question";
  readonly Colon: "Colon";
};
//#endregion
export { SlimeAssignmentOperatorTokenTypes, SlimeBinaryOperatorTokenTypes, SlimeContextualKeywordTokenTypes, SlimeLogicalOperatorTokenTypes, SlimeReservedWordTokenTypes, SlimeTokenType, SlimeUnaryOperatorTokenTypes, SlimeUpdateOperatorTokenTypes };