//#region src/SlimeTokenType.ts
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
const SlimeAssignmentOperatorTokenTypes = {
	Assign: "Assign",
	PlusAssign: "PlusAssign",
	MinusAssign: "MinusAssign",
	MultiplyAssign: "MultiplyAssign",
	DivideAssign: "DivideAssign",
	ModuloAssign: "ModuloAssign",
	ExponentiationAssign: "ExponentiationAssign",
	LeftShiftAssign: "LeftShiftAssign",
	RightShiftAssign: "RightShiftAssign",
	UnsignedRightShiftAssign: "UnsignedRightShiftAssign",
	BitwiseAndAssign: "BitwiseAndAssign",
	BitwiseOrAssign: "BitwiseOrAssign",
	BitwiseXorAssign: "BitwiseXorAssign",
	LogicalAndAssign: "LogicalAndAssign",
	LogicalOrAssign: "LogicalOrAssign",
	NullishCoalescingAssign: "NullishCoalescingAssign"
};
/**
* 更新运算符 Token 类型
* 对应: ++ --
*/
const SlimeUpdateOperatorTokenTypes = {
	Increment: "Increment",
	Decrement: "Decrement"
};
/**
* 一元运算符 Token 类型
* 对应: - + ! ~ typeof void delete
*/
const SlimeUnaryOperatorTokenTypes = {
	Minus: "Minus",
	Plus: "Plus",
	LogicalNot: "LogicalNot",
	BitwiseNot: "BitwiseNot",
	Typeof: "Typeof",
	Void: "Void",
	Delete: "Delete"
};
/**
* 二元运算符 Token 类型
* 对应: == != === !== < > <= >= << >> >>> + - * / % ** | ^ & in instanceof
*/
const SlimeBinaryOperatorTokenTypes = {
	Equal: "Equal",
	NotEqual: "NotEqual",
	StrictEqual: "StrictEqual",
	StrictNotEqual: "StrictNotEqual",
	Less: "Less",
	Greater: "Greater",
	LessEqual: "LessEqual",
	GreaterEqual: "GreaterEqual",
	LeftShift: "LeftShift",
	RightShift: "RightShift",
	UnsignedRightShift: "UnsignedRightShift",
	Plus: "Plus",
	Minus: "Minus",
	Asterisk: "Asterisk",
	Slash: "Slash",
	Modulo: "Modulo",
	Exponentiation: "Exponentiation",
	BitwiseOr: "BitwiseOr",
	BitwiseXor: "BitwiseXor",
	BitwiseAnd: "BitwiseAnd",
	In: "In",
	Instanceof: "Instanceof"
};
/**
* 逻辑运算符 Token 类型
* 对应: || && ??
*/
const SlimeLogicalOperatorTokenTypes = {
	LogicalOr: "LogicalOr",
	LogicalAnd: "LogicalAnd",
	NullishCoalescing: "NullishCoalescing"
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
const SlimeContextualKeywordTokenTypes = {
	Async: "async",
	Static: "static",
	Let: "let",
	Get: "get",
	Set: "set",
	Of: "of",
	From: "from",
	As: "as",
	Target: "target",
	Meta: "meta"
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
const SlimeReservedWordTokenTypes = {
	Await: "Await",
	Break: "Break",
	Case: "Case",
	Catch: "Catch",
	Class: "Class",
	Const: "Const",
	Continue: "Continue",
	Debugger: "Debugger",
	Default: "Default",
	Do: "Do",
	Else: "Else",
	Enum: "Enum",
	Export: "Export",
	Extends: "Extends",
	False: "False",
	Finally: "Finally",
	For: "For",
	Function: "Function",
	If: "If",
	Import: "Import",
	New: "New",
	NullLiteral: "NullLiteral",
	Return: "Return",
	Super: "Super",
	Switch: "Switch",
	This: "This",
	Throw: "Throw",
	True: "True",
	Try: "Try",
	Var: "Var",
	While: "While",
	With: "With",
	Yield: "Yield"
};
const SlimeTokenType = {
	WhiteSpace: "WhiteSpace",
	LineTerminator: "LineTerminator",
	HashbangComment: "HashbangComment",
	MultiLineComment: "MultiLineComment",
	SingleLineComment: "SingleLineComment",
	SingleLineHTMLOpenComment: "SingleLineHTMLOpenComment",
	SingleLineHTMLCloseComment: "SingleLineHTMLCloseComment",
	IdentifierName: "IdentifierName",
	PrivateIdentifier: "PrivateIdentifier",
	NumericLiteral: "NumericLiteral",
	StringLiteral: "StringLiteral",
	NoSubstitutionTemplate: "NoSubstitutionTemplate",
	TemplateHead: "TemplateHead",
	TemplateMiddle: "TemplateMiddle",
	TemplateTail: "TemplateTail",
	RegularExpressionLiteral: "RegularExpressionLiteral",
	Ellipsis: "Ellipsis",
	Arrow: "Arrow",
	OptionalChaining: "OptionalChaining",
	LBrace: "LBrace",
	RBrace: "RBrace",
	LParen: "LParen",
	RParen: "RParen",
	LBracket: "LBracket",
	RBracket: "RBracket",
	Dot: "Dot",
	Semicolon: "Semicolon",
	Comma: "Comma",
	Question: "Question",
	Colon: "Colon",
	...SlimeReservedWordTokenTypes,
	...SlimeAssignmentOperatorTokenTypes,
	...SlimeUpdateOperatorTokenTypes,
	...SlimeUnaryOperatorTokenTypes,
	...SlimeBinaryOperatorTokenTypes,
	...SlimeLogicalOperatorTokenTypes,
	...SlimeContextualKeywordTokenTypes
};

//#endregion
export { SlimeAssignmentOperatorTokenTypes, SlimeBinaryOperatorTokenTypes, SlimeContextualKeywordTokenTypes, SlimeLogicalOperatorTokenTypes, SlimeReservedWordTokenTypes, SlimeTokenType, SlimeUnaryOperatorTokenTypes, SlimeUpdateOperatorTokenTypes };