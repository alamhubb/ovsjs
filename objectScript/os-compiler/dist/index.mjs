import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
//#region ../../slime/node_modules/slime-ast/src/SlimeNodeType.ts
/**
* SlimeNodeType - AST 节点类型常量
*
* 与 ESTree 规范的 type 字符串完全一致
* 使用 as const 确保类型是字面量类型
*/
const SlimeNodeType$1 = {
	Program: "Program",
	Identifier: "Identifier",
	PrivateIdentifier: "PrivateIdentifier",
	Literal: "Literal",
	NullLiteral: "NullLiteral",
	StringLiteral: "StringLiteral",
	NumericLiteral: "NumericLiteral",
	BooleanLiteral: "BooleanLiteral",
	ExpressionStatement: "ExpressionStatement",
	BlockStatement: "BlockStatement",
	StaticBlock: "StaticBlock",
	EmptyStatement: "EmptyStatement",
	DebuggerStatement: "DebuggerStatement",
	ReturnStatement: "ReturnStatement",
	BreakStatement: "BreakStatement",
	ContinueStatement: "ContinueStatement",
	LabeledStatement: "LabeledStatement",
	WithStatement: "WithStatement",
	IfStatement: "IfStatement",
	SwitchStatement: "SwitchStatement",
	SwitchCase: "SwitchCase",
	ThrowStatement: "ThrowStatement",
	TryStatement: "TryStatement",
	CatchClause: "CatchClause",
	WhileStatement: "WhileStatement",
	DoWhileStatement: "DoWhileStatement",
	ForStatement: "ForStatement",
	ForInStatement: "ForInStatement",
	ForOfStatement: "ForOfStatement",
	FunctionDeclaration: "FunctionDeclaration",
	VariableDeclaration: "VariableDeclaration",
	VariableDeclarator: "VariableDeclarator",
	ClassDeclaration: "ClassDeclaration",
	ThisExpression: "ThisExpression",
	ArrayExpression: "ArrayExpression",
	ObjectExpression: "ObjectExpression",
	Property: "Property",
	FunctionExpression: "FunctionExpression",
	ArrowFunctionExpression: "ArrowFunctionExpression",
	ClassExpression: "ClassExpression",
	UnaryExpression: "UnaryExpression",
	UpdateExpression: "UpdateExpression",
	BinaryExpression: "BinaryExpression",
	AssignmentExpression: "AssignmentExpression",
	LogicalExpression: "LogicalExpression",
	MemberExpression: "MemberExpression",
	ConditionalExpression: "ConditionalExpression",
	CallExpression: "CallExpression",
	NewExpression: "NewExpression",
	SequenceExpression: "SequenceExpression",
	TemplateLiteral: "TemplateLiteral",
	TaggedTemplateExpression: "TaggedTemplateExpression",
	TemplateElement: "TemplateElement",
	SpreadElement: "SpreadElement",
	YieldExpression: "YieldExpression",
	AwaitExpression: "AwaitExpression",
	ImportExpression: "ImportExpression",
	ChainExpression: "ChainExpression",
	MetaProperty: "MetaProperty",
	Super: "Super",
	ParenthesizedExpression: "ParenthesizedExpression",
	OptionalCallExpression: "OptionalCallExpression",
	OptionalMemberExpression: "OptionalMemberExpression",
	ObjectPattern: "ObjectPattern",
	ArrayPattern: "ArrayPattern",
	RestElement: "RestElement",
	AssignmentPattern: "AssignmentPattern",
	ClassBody: "ClassBody",
	MethodDefinition: "MethodDefinition",
	PropertyDefinition: "PropertyDefinition",
	ImportDeclaration: "ImportDeclaration",
	ImportSpecifier: "ImportSpecifier",
	ImportDefaultSpecifier: "ImportDefaultSpecifier",
	ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
	ExportNamedDeclaration: "ExportNamedDeclaration",
	ExportSpecifier: "ExportSpecifier",
	ExportDefaultDeclaration: "ExportDefaultDeclaration",
	ExportAllDeclaration: "ExportAllDeclaration"
};

//#endregion
//#region ../../slime/packages/slime-generator/src/SlimeCodeMapping.ts
var SlimeCodeLocation = class {
	constructor() {
		this.type = "";
		this.line = 0;
		this.value = "";
		this.column = 0;
		this.length = 0;
		this.index = 0;
	}
};

//#endregion
//#region ../../slime/node_modules/subhuti/src/struct/SubhutiCreateToken.ts
var SubhutiCreateToken$1 = class {
	constructor(ovsToken) {
		this.name = ovsToken.name;
		this.type = ovsToken.type || ovsToken.name;
		this.pattern = ovsToken.pattern;
		if (ovsToken.value) this.value = ovsToken.value;
		else this.value = emptyValue$1;
		this.isKeyword = ovsToken.isKeyword ?? false;
		this.skip = ovsToken.skip;
		this.lookaheadAfter = ovsToken.lookaheadAfter;
		this.contextConstraint = ovsToken.contextConstraint;
	}
};
const emptyValue$1 = "Error:CannotUseValue";
function createKeywordToken$1(name, pattern) {
	const token = new SubhutiCreateToken$1({
		name,
		pattern: /* @__PURE__ */ new RegExp(pattern + "(?![a-zA-Z0-9_$])"),
		value: pattern
	});
	token.isKeyword = true;
	return token;
}
function createValueRegToken$1(name, pattern, value, skip, lookahead, contextConstraint) {
	return new SubhutiCreateToken$1({
		name,
		pattern,
		value,
		skip,
		lookaheadAfter: lookahead,
		contextConstraint
	});
}
function createEmptyValueRegToken$1(name, pattern, contextConstraint) {
	return new SubhutiCreateToken$1({
		name,
		pattern,
		contextConstraint
	});
}

//#endregion
//#region ../../slime/node_modules/slime-parser/node_modules/slime-token/src/SlimeTokenType.ts
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
const SlimeAssignmentOperatorTokenTypes$2 = {
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
const SlimeUpdateOperatorTokenTypes$2 = {
	Increment: "Increment",
	Decrement: "Decrement"
};
/**
* 一元运算符 Token 类型
* 对应: - + ! ~ typeof void delete
*/
const SlimeUnaryOperatorTokenTypes$2 = {
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
const SlimeBinaryOperatorTokenTypes$2 = {
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
const SlimeLogicalOperatorTokenTypes$2 = {
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
const SlimeContextualKeywordTokenTypes$2 = {
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
const SlimeReservedWordTokenTypes$2 = {
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
const SlimeTokenType$2 = {
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
	...SlimeReservedWordTokenTypes$2,
	...SlimeAssignmentOperatorTokenTypes$2,
	...SlimeUpdateOperatorTokenTypes$2,
	...SlimeUnaryOperatorTokenTypes$2,
	...SlimeBinaryOperatorTokenTypes$2,
	...SlimeLogicalOperatorTokenTypes$2,
	...SlimeContextualKeywordTokenTypes$2
};

//#endregion
//#region ../../slime/node_modules/slime-parser/src/language/es2025/SlimeTokens.ts
const ID_START_SOURCE$1 = String.raw`[\p{ID_Start}$_]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}`;
const ID_CONTINUE_SOURCE$1 = String.raw`[\p{ID_Continue}$\u200C\u200D]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}`;
const IDENTIFIER_NAME_PATTERN$1 = new RegExp(`(?:${ID_START_SOURCE$1})(?:${ID_CONTINUE_SOURCE$1})*`, "u");
const PRIVATE_IDENTIFIER_PATTERN$1 = new RegExp(`#(?:${ID_START_SOURCE$1})(?:${ID_CONTINUE_SOURCE$1})*`, "u");
const SlimeTokensObj$1 = {
	HashbangComment: createValueRegToken$1(SlimeTokenType$2.HashbangComment, /#![^\n\r\u2028\u2029]*/, "", false, void 0, { onlyAtStart: true }),
	MultiLineComment: createValueRegToken$1(SlimeTokenType$2.MultiLineComment, /\/\*[\s\S]*?\*\//, "", true),
	SingleLineComment: createValueRegToken$1(SlimeTokenType$2.SingleLineComment, /\/\/[^\n\r\u2028\u2029]*/, "", true),
	SingleLineHTMLOpenComment: createValueRegToken$1(SlimeTokenType$2.SingleLineHTMLOpenComment, /<!--[^\n\r\u2028\u2029]*/, "", true),
	SingleLineHTMLCloseComment: createValueRegToken$1(SlimeTokenType$2.SingleLineHTMLCloseComment, /-->[^\n\r\u2028\u2029]*/, "", true, void 0, { onlyAtLineStart: true }),
	WhiteSpace: createValueRegToken$1(SlimeTokenType$2.WhiteSpace, /[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/, "", true),
	LineTerminatorCRLF: createValueRegToken$1(SlimeTokenType$2.LineTerminator, /\r\n/, "", true),
	LineTerminator: createValueRegToken$1(SlimeTokenType$2.LineTerminator, /[\n\r\u2028\u2029]/, "", true),
	AwaitTok: createKeywordToken$1(SlimeTokenType$2.Await, "await"),
	BreakTok: createKeywordToken$1(SlimeTokenType$2.Break, "break"),
	CaseTok: createKeywordToken$1(SlimeTokenType$2.Case, "case"),
	CatchTok: createKeywordToken$1(SlimeTokenType$2.Catch, "catch"),
	ClassTok: createKeywordToken$1(SlimeTokenType$2.Class, "class"),
	ConstTok: createKeywordToken$1(SlimeTokenType$2.Const, "const"),
	ContinueTok: createKeywordToken$1(SlimeTokenType$2.Continue, "continue"),
	DebuggerTok: createKeywordToken$1(SlimeTokenType$2.Debugger, "debugger"),
	DefaultTok: createKeywordToken$1(SlimeTokenType$2.Default, "default"),
	DeleteTok: createKeywordToken$1(SlimeTokenType$2.Delete, "delete"),
	DoTok: createKeywordToken$1(SlimeTokenType$2.Do, "do"),
	ElseTok: createKeywordToken$1(SlimeTokenType$2.Else, "else"),
	EnumTok: createKeywordToken$1(SlimeTokenType$2.Enum, "enum"),
	ExportTok: createKeywordToken$1(SlimeTokenType$2.Export, "export"),
	ExtendsTok: createKeywordToken$1(SlimeTokenType$2.Extends, "extends"),
	FalseTok: createKeywordToken$1(SlimeTokenType$2.False, "false"),
	FinallyTok: createKeywordToken$1(SlimeTokenType$2.Finally, "finally"),
	ForTok: createKeywordToken$1(SlimeTokenType$2.For, "for"),
	FunctionTok: createKeywordToken$1(SlimeTokenType$2.Function, "function"),
	IfTok: createKeywordToken$1(SlimeTokenType$2.If, "if"),
	ImportTok: createKeywordToken$1(SlimeTokenType$2.Import, "import"),
	InTok: createKeywordToken$1(SlimeTokenType$2.In, "in"),
	InstanceofTok: createKeywordToken$1(SlimeTokenType$2.Instanceof, "instanceof"),
	NewTok: createKeywordToken$1(SlimeTokenType$2.New, "new"),
	NullTok: createKeywordToken$1(SlimeTokenType$2.NullLiteral, "null"),
	ReturnTok: createKeywordToken$1(SlimeTokenType$2.Return, "return"),
	SuperTok: createKeywordToken$1(SlimeTokenType$2.Super, "super"),
	SwitchTok: createKeywordToken$1(SlimeTokenType$2.Switch, "switch"),
	ThisTok: createKeywordToken$1(SlimeTokenType$2.This, "this"),
	ThrowTok: createKeywordToken$1(SlimeTokenType$2.Throw, "throw"),
	TrueTok: createKeywordToken$1(SlimeTokenType$2.True, "true"),
	TryTok: createKeywordToken$1(SlimeTokenType$2.Try, "try"),
	TypeofTok: createKeywordToken$1(SlimeTokenType$2.Typeof, "typeof"),
	VarTok: createKeywordToken$1(SlimeTokenType$2.Var, "var"),
	VoidTok: createKeywordToken$1(SlimeTokenType$2.Void, "void"),
	WhileTok: createKeywordToken$1(SlimeTokenType$2.While, "while"),
	WithTok: createKeywordToken$1(SlimeTokenType$2.With, "with"),
	YieldTok: createKeywordToken$1(SlimeTokenType$2.Yield, "yield"),
	NumericLiteralBigIntHex: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),
	NumericLiteralBigIntBinary: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /0[bB][01](_?[01])*n/),
	NumericLiteralBigIntOctal: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /0[oO][0-7](_?[0-7])*n/),
	NumericLiteralBigIntDecimal: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /(?:0|[1-9](_?[0-9])*)n/),
	NumericLiteralHex: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),
	NumericLiteralBinary: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /0[bB][01](_?[01])*/),
	NumericLiteralOctal: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /0[oO][0-7](_?[0-7])*/),
	NumericLiteralDecimal: createEmptyValueRegToken$1(SlimeTokenType$2.NumericLiteral, /(?:0[0-9]*|[1-9](_?[0-9])*)(?:\.([0-9](_?[0-9])*)?)?([eE][+-]?[0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*([eE][+-]?[0-9](_?[0-9])*)?/),
	DoubleStringCharacters: createEmptyValueRegToken$1(SlimeTokenType$2.StringLiteral, /"(?:[^\n\r"\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
	SingleStringCharacters: createEmptyValueRegToken$1(SlimeTokenType$2.StringLiteral, /'(?:[^\n\r'\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),
	TemplateHead: createEmptyValueRegToken$1(SlimeTokenType$2.TemplateHead, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
	TemplateMiddle: createEmptyValueRegToken$1(SlimeTokenType$2.TemplateMiddle, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
	TemplateTail: createEmptyValueRegToken$1(SlimeTokenType$2.TemplateTail, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
	NoSubstitutionTemplate: createEmptyValueRegToken$1(SlimeTokenType$2.NoSubstitutionTemplate, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
	UnsignedRightShiftAssign: createValueRegToken$1(SlimeTokenType$2.UnsignedRightShiftAssign, />>>=/, ">>>="),
	Ellipsis: createValueRegToken$1(SlimeTokenType$2.Ellipsis, /\.\.\./, "..."),
	UnsignedRightShift: createValueRegToken$1(SlimeTokenType$2.UnsignedRightShift, />>>/, ">>>"),
	StrictEqual: createValueRegToken$1(SlimeTokenType$2.StrictEqual, /===/, "==="),
	StrictNotEqual: createValueRegToken$1(SlimeTokenType$2.StrictNotEqual, /!==/, "!=="),
	LeftShiftAssign: createValueRegToken$1(SlimeTokenType$2.LeftShiftAssign, /<<=/, "<<="),
	RightShiftAssign: createValueRegToken$1(SlimeTokenType$2.RightShiftAssign, />>=/, ">>="),
	ExponentiationAssign: createValueRegToken$1(SlimeTokenType$2.ExponentiationAssign, /\*\*=/, "**="),
	LogicalAndAssign: createValueRegToken$1(SlimeTokenType$2.LogicalAndAssign, /&&=/, "&&="),
	LogicalOrAssign: createValueRegToken$1(SlimeTokenType$2.LogicalOrAssign, /\|\|=/, "||="),
	NullishCoalescingAssign: createValueRegToken$1(SlimeTokenType$2.NullishCoalescingAssign, /\?\?=/, "??="),
	Arrow: createValueRegToken$1(SlimeTokenType$2.Arrow, /=>/, "=>"),
	PlusAssign: createValueRegToken$1(SlimeTokenType$2.PlusAssign, /\+=/, "+="),
	MinusAssign: createValueRegToken$1(SlimeTokenType$2.MinusAssign, /-=/, "-="),
	MultiplyAssign: createValueRegToken$1(SlimeTokenType$2.MultiplyAssign, /\*=/, "*="),
	DivideAssign: createValueRegToken$1(SlimeTokenType$2.DivideAssign, /\/=/, "/="),
	ModuloAssign: createValueRegToken$1(SlimeTokenType$2.ModuloAssign, /%=/, "%="),
	LeftShift: createValueRegToken$1(SlimeTokenType$2.LeftShift, /<</, "<<"),
	RightShift: createValueRegToken$1(SlimeTokenType$2.RightShift, />>/, ">>"),
	LessEqual: createValueRegToken$1(SlimeTokenType$2.LessEqual, /<=/, "<="),
	GreaterEqual: createValueRegToken$1(SlimeTokenType$2.GreaterEqual, />=/, ">="),
	Equal: createValueRegToken$1(SlimeTokenType$2.Equal, /==/, "=="),
	NotEqual: createValueRegToken$1(SlimeTokenType$2.NotEqual, /!=/, "!="),
	LogicalAnd: createValueRegToken$1(SlimeTokenType$2.LogicalAnd, /&&/, "&&"),
	LogicalOr: createValueRegToken$1(SlimeTokenType$2.LogicalOr, /\|\|/, "||"),
	NullishCoalescing: createValueRegToken$1(SlimeTokenType$2.NullishCoalescing, /\?\?/, "??"),
	Increment: createValueRegToken$1(SlimeTokenType$2.Increment, /\+\+/, "++"),
	Decrement: createValueRegToken$1(SlimeTokenType$2.Decrement, /--/, "--"),
	Exponentiation: createValueRegToken$1(SlimeTokenType$2.Exponentiation, /\*\*/, "**"),
	BitwiseAndAssign: createValueRegToken$1(SlimeTokenType$2.BitwiseAndAssign, /&=/, "&="),
	BitwiseOrAssign: createValueRegToken$1(SlimeTokenType$2.BitwiseOrAssign, /\|=/, "|="),
	BitwiseXorAssign: createValueRegToken$1(SlimeTokenType$2.BitwiseXorAssign, /\^=/, "^="),
	OptionalChaining: createValueRegToken$1(SlimeTokenType$2.OptionalChaining, /\?\./, "?.", false, { not: /^\d/ }),
	LBrace: createValueRegToken$1(SlimeTokenType$2.LBrace, /\{/, "{"),
	RBrace: createValueRegToken$1(SlimeTokenType$2.RBrace, /\}/, "}"),
	LParen: createValueRegToken$1(SlimeTokenType$2.LParen, /\(/, "("),
	RParen: createValueRegToken$1(SlimeTokenType$2.RParen, /\)/, ")"),
	LBracket: createValueRegToken$1(SlimeTokenType$2.LBracket, /\[/, "["),
	RBracket: createValueRegToken$1(SlimeTokenType$2.RBracket, /\]/, "]"),
	Dot: createValueRegToken$1(SlimeTokenType$2.Dot, /\./, "."),
	Semicolon: createValueRegToken$1(SlimeTokenType$2.Semicolon, /;/, ";"),
	Comma: createValueRegToken$1(SlimeTokenType$2.Comma, /,/, ","),
	Less: createValueRegToken$1(SlimeTokenType$2.Less, /</, "<"),
	Greater: createValueRegToken$1(SlimeTokenType$2.Greater, />/, ">"),
	Plus: createValueRegToken$1(SlimeTokenType$2.Plus, /\+/, "+"),
	Minus: createValueRegToken$1(SlimeTokenType$2.Minus, /-/, "-"),
	Asterisk: createValueRegToken$1(SlimeTokenType$2.Asterisk, /\*/, "*"),
	Slash: createValueRegToken$1(SlimeTokenType$2.Slash, /\//, "/"),
	Modulo: createValueRegToken$1(SlimeTokenType$2.Modulo, /%/, "%"),
	BitwiseAnd: createValueRegToken$1(SlimeTokenType$2.BitwiseAnd, /&/, "&"),
	BitwiseOr: createValueRegToken$1(SlimeTokenType$2.BitwiseOr, /\|/, "|"),
	BitwiseXor: createValueRegToken$1(SlimeTokenType$2.BitwiseXor, /\^/, "^"),
	BitwiseNot: createValueRegToken$1(SlimeTokenType$2.BitwiseNot, /~/, "~"),
	LogicalNot: createValueRegToken$1(SlimeTokenType$2.LogicalNot, /!/, "!"),
	Question: createValueRegToken$1(SlimeTokenType$2.Question, /\?/, "?"),
	Colon: createValueRegToken$1(SlimeTokenType$2.Colon, /:/, ":"),
	Assign: createValueRegToken$1(SlimeTokenType$2.Assign, /=/, "="),
	PrivateIdentifier: createEmptyValueRegToken$1(SlimeTokenType$2.PrivateIdentifier, PRIVATE_IDENTIFIER_PATTERN$1),
	IdentifierName: createEmptyValueRegToken$1(SlimeTokenType$2.IdentifierName, IDENTIFIER_NAME_PATTERN$1)
};
const slimeTokens$1 = Object.values(SlimeTokensObj$1);

//#endregion
//#region ../../slime/packages/slime-token/src/SlimeTokenType.ts
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
const SlimeContextualKeywordTokenTypes$1 = {
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
const SlimeReservedWordTokenTypes$1 = {
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
	...SlimeReservedWordTokenTypes$1,
	...SlimeAssignmentOperatorTokenTypes,
	...SlimeUpdateOperatorTokenTypes,
	...SlimeUnaryOperatorTokenTypes,
	...SlimeBinaryOperatorTokenTypes,
	...SlimeLogicalOperatorTokenTypes,
	...SlimeContextualKeywordTokenTypes$1
};

//#endregion
//#region ../../slime/packages/slime-generator/src/SlimeGenerator.ts
const Es6TokenName = SlimeTokenType;
const createSoftKeywordToken = (name, value) => ({
	name,
	type: name,
	value
});
const es6TokensObj = {
	...SlimeTokensObj$1,
	OfTok: createSoftKeywordToken("OfTok", "of"),
	AsyncTok: createSoftKeywordToken("AsyncTok", "async"),
	StaticTok: createSoftKeywordToken("StaticTok", "static"),
	AsTok: createSoftKeywordToken("AsTok", "as"),
	GetTok: createSoftKeywordToken("GetTok", "get"),
	SetTok: createSoftKeywordToken("SetTok", "set"),
	FromTok: createSoftKeywordToken("FromTok", "from"),
	Eq: SlimeTokensObj$1.Assign
};
const es6TokenMapObj = {
	"const": SlimeTokensObj$1.ConstTok,
	"let": createSoftKeywordToken("Let", "let"),
	"var": SlimeTokensObj$1.VarTok
};
var SlimeGenerator = class {
	static {
		this.mappings = null;
	}
	static {
		this.lastSourcePosition = null;
	}
	static {
		this.generatePosition = null;
	}
	static {
		this.sourceCodeIndex = null;
	}
	static {
		this.generateCode = "";
	}
	static {
		this.generateLine = 0;
	}
	static {
		this.generateColumn = 0;
	}
	static {
		this.generateIndex = 0;
	}
	static {
		this.tokens = null;
	}
	static {
		this.indent = 0;
	}
	static findNextTokenLocByTypeAndIndex(tokenType, index) {
		const popToken = this.tokens.find((item) => item.tokenName === tokenType && item.index > index);
		let loc = null;
		if (popToken) loc = {
			value: popToken.tokenValue,
			type: popToken.tokenName,
			start: {
				index: popToken.index,
				line: popToken.rowNum,
				column: popToken.columnStartNum
			},
			end: {
				index: popToken.index + popToken.tokenValue.length,
				line: popToken.rowNum,
				column: popToken.columnEndNum
			}
		};
		return loc;
	}
	static generator(node$1, tokens) {
		this.mappings = [];
		this.tokens = tokens;
		this.lastSourcePosition = new SlimeCodeLocation();
		this.generatePosition = new SlimeCodeLocation();
		this.sourceCodeIndex = 0;
		this.generateLine = 0;
		this.generateColumn = 0;
		this.generateIndex = 0;
		this.generateCode = "";
		this.indent = 0;
		this.generatorNode(node$1);
		return {
			mapping: this.mappings,
			code: this.generateCode
		};
	}
	static generatorProgram(node$1) {
		this.generatorNodes(node$1.body);
	}
	static generatorModuleDeclarations(node$1) {
		for (const nodeElement of node$1) this.generatorNode(nodeElement);
	}
	static generatorImportDeclaration(node$1) {
		this.addCodeAndMappings(es6TokensObj.ImportTok, node$1.loc);
		this.addSpacing();
		const hasSpecifiers = node$1.specifiers && node$1.specifiers.length > 0;
		const hasEmptyNamedImport = !hasSpecifiers && node$1.lBraceToken && node$1.rBraceToken;
		if (hasSpecifiers) {
			const getSpecType = (s) => s.specifier?.type || s.type;
			const getSpec = (s) => s.specifier || s;
			const hasDefault = node$1.specifiers.some((s) => getSpecType(s) === SlimeNodeType$1.ImportDefaultSpecifier);
			const hasNamed = node$1.specifiers.some((s) => getSpecType(s) === SlimeNodeType$1.ImportSpecifier);
			const hasNamespace = node$1.specifiers.some((s) => getSpecType(s) === SlimeNodeType$1.ImportNamespaceSpecifier);
			if (hasDefault) {
				const defaultItem = node$1.specifiers.find((s) => getSpecType(s) === SlimeNodeType$1.ImportDefaultSpecifier);
				this.generatorNode(getSpec(defaultItem));
				if (hasNamed || hasNamespace) {
					this.addComma();
					this.addSpacing();
				}
			}
			if (hasNamespace) {
				const nsItem = node$1.specifiers.find((s) => getSpecType(s) === SlimeNodeType$1.ImportNamespaceSpecifier);
				this.generatorNode(getSpec(nsItem));
			} else if (hasNamed) {
				const namedItems = node$1.specifiers.filter((s) => getSpecType(s) === SlimeNodeType$1.ImportSpecifier);
				this.addLBrace();
				namedItems.forEach((item, index) => {
					if (index > 0) this.addComma();
					this.generatorNode(getSpec(item));
				});
				this.addRBrace();
			}
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.FromTok, node$1.loc);
			this.addSpacing();
		} else if (hasEmptyNamedImport) {
			this.addLBrace();
			this.addRBrace();
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.FromTok, node$1.loc);
			this.addSpacing();
		}
		this.generatorNode(node$1.source);
		this.generatorAttributes(node$1.attributes);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/** 生成 ES2025 Import Attributes: with { type: "json" } 或 with {} */
	static generatorAttributes(attrs) {
		if (attrs === void 0) return;
		this.addSpacing();
		this.addCodeAndMappings({
			type: "With",
			name: "With",
			value: "with"
		}, node.withToken?.loc);
		this.addSpacing();
		this.addLBrace(node.attributesLBraceToken?.loc);
		attrs.forEach((attr, index) => {
			if (index > 0) {
				this.addComma();
				this.addSpacing();
			}
			if (attr.key.type === SlimeNodeType$1.Identifier) this.generatorIdentifier(attr.key);
			else this.generatorNode(attr.key);
			this.addCodeAndMappings(es6TokensObj.Colon, attr.colonToken?.loc);
			this.addSpacing();
			this.generatorNode(attr.value);
		});
		this.addRBrace(node.attributesRBraceToken?.loc);
	}
	static generatorImportSpecifier(node$1) {
		if (node$1.imported.name !== node$1.local.name) {
			this.generatorNode(node$1.imported);
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.AsTok, node$1.asToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.local);
		} else this.generatorNode(node$1.local);
	}
	static generatorImportDefaultSpecifier(node$1) {
		this.generatorNode(node$1.local);
	}
	static generatorImportNamespaceSpecifier(node$1) {
		this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.AsTok, node$1.asToken?.loc);
		this.addSpacing();
		this.generatorNode(node$1.local);
	}
	static generatorExportNamedDeclaration(node$1) {
		this.addCodeAndMappings(es6TokensObj.ExportTok, node$1.exportToken?.loc);
		this.addSpacing();
		if (node$1.declaration) this.generatorNode(node$1.declaration);
		else if (node$1.specifiers) {
			this.addLBrace(node$1.lBraceToken?.loc);
			node$1.specifiers.forEach((item, index) => {
				if (index > 0) {
					this.addComma();
					this.addSpacing();
				}
				const spec = item.specifier || item;
				this.generatorExportSpecifier(spec);
			});
			this.addRBrace(node$1.rBraceToken?.loc);
			if (node$1.source) {
				this.addSpacing();
				this.addCodeAndMappings(es6TokensObj.FromTok, node$1.fromToken?.loc);
				this.addSpacing();
				this.generatorNode(node$1.source);
			}
			this.generatorAttributes(node$1.attributes);
			this.addCode(es6TokensObj.Semicolon);
			this.addNewLine();
		}
	}
	static generatorExportSpecifier(spec) {
		this.generatorNode(spec.local);
		if ((spec.local.type === SlimeNodeType$1.Literal ? spec.local.value : spec.local.name) !== (spec.exported.type === SlimeNodeType$1.Literal ? spec.exported.value : spec.exported.name)) {
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.AsTok, spec.asToken?.loc);
			this.addSpacing();
			this.generatorNode(spec.exported);
		}
	}
	static generatorExportAllDeclaration(node$1) {
		this.addCodeAndMappings(es6TokensObj.ExportTok, node$1.exportToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
		this.addSpacing();
		if (node$1.exported) {
			this.addCodeAndMappings(es6TokensObj.AsTok, node$1.asToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.exported);
			this.addSpacing();
		}
		this.addCodeAndMappings(es6TokensObj.FromTok, node$1.fromToken?.loc);
		this.addSpacing();
		this.generatorNode(node$1.source);
		this.generatorAttributes(node$1.attributes);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	static generatorNodes(nodes) {
		nodes.forEach((node$1, index) => {
			this.generatorNode(node$1);
			if (index < nodes.length - 1) this.addIndent();
		});
	}
	static generatorExpressionStatement(node$1) {
		this.generatorNode(node$1.expression);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	static generatorYieldExpression(node$1) {
		this.addCodeAndMappings(es6TokensObj.YieldTok, node$1.yieldToken?.loc);
		if (node$1.delegate) this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
		if (node$1.argument) {
			this.addSpacing();
			this.generatorNode(node$1.argument);
		}
	}
	static generatorAwaitExpression(node$1) {
		this.addCodeAndMappings(es6TokensObj.AwaitTok, node$1.awaitToken?.loc);
		if (node$1.argument) {
			this.addSpacing();
			this.generatorNode(node$1.argument);
		}
	}
	static generatorTemplateLiteral(node$1) {
		const quasis = node$1.quasis || [];
		const expressions = node$1.expressions || [];
		if (expressions.length === 0 && quasis.length === 1 && quasis[0].value?.raw) {
			this.addString(quasis[0].value.raw);
			return;
		}
		for (let i = 0; i < quasis.length; i++) {
			const quasi = quasis[i];
			if (quasi.value) {
				const raw = quasi.value.raw || "";
				this.addString(raw);
			}
			if (i < expressions.length) this.generatorNode(expressions[i]);
		}
	}
	static generatorCallExpression(node$1) {
		this.generatorNode(node$1.callee);
		if (node$1.optional) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node$1.optionalChainingToken?.loc);
		this.addLParen(node$1.lParenToken?.loc);
		if (node$1.arguments.length) node$1.arguments.forEach((item, index) => {
			if (index !== 0) this.addComma();
			const argument = item.argument || item;
			if (argument.type === SlimeNodeType$1.SpreadElement) this.generatorSpreadElement(argument);
			else this.generatorNode(argument);
		});
		this.addRParen(node$1.rParenToken?.loc);
	}
	static generatorFunctionExpression(node$1) {
		if (node$1.async) {
			this.addCodeAndMappings(es6TokensObj.AsyncTok, node$1.asyncToken?.loc);
			this.addSpacing();
		}
		this.addCodeAndMappings(es6TokensObj.FunctionTok, node$1.functionToken?.loc);
		if (node$1.generator) this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
		if (node$1.id) {
			this.addSpacing();
			this.generatorNode(node$1.id);
		}
		this.generatorFunctionParams(node$1.params);
		if (node$1.body && node$1.body.type) this.generatorNode(node$1.body);
		else {
			this.addLBrace();
			this.addRBrace();
		}
	}
	/**
	* 生成箭头函数表达式
	*/
	static generatorArrowFunctionExpression(node$1) {
		if (node$1.async) {
			this.addCodeAndMappings(es6TokensObj.AsyncTok, node$1.asyncToken?.loc);
			this.addSpacing();
		}
		const unwrapParam = (p) => p.param !== void 0 ? p.param : p;
		const firstParam = node$1.params?.[0] ? unwrapParam(node$1.params[0]) : null;
		const hasParenTokens = node$1.lParenToken || node$1.rParenToken;
		if (node$1.params && node$1.params.length === 1 && firstParam?.type === SlimeNodeType$1.Identifier && !hasParenTokens) this.generatorNode(firstParam);
		else {
			this.addLParen();
			if (node$1.params) node$1.params.forEach((item, index) => {
				if (index !== 0) this.addComma();
				const param = unwrapParam(item);
				this.generatorNode(param);
			});
			this.addRParen();
		}
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.Arrow, node$1.arrowToken?.loc);
		this.addSpacing();
		if (node$1.expression && node$1.body.type !== SlimeNodeType$1.BlockStatement) if (node$1.body.type === SlimeNodeType$1.ObjectExpression) {
			this.addLParen();
			this.generatorNode(node$1.body);
			this.addRParen();
		} else this.generatorNode(node$1.body);
		else this.generatorNode(node$1.body, false);
	}
	/**
	* 生成二元运算表达式
	*/
	static generatorBinaryExpression(node$1) {
		this.generatorNode(node$1.left);
		this.addSpacing();
		this.addString(node$1.operator);
		this.addSpacing();
		this.generatorNode(node$1.right);
	}
	/**
	* 生成函数参数列表
	* @param params SlimeFunctionParam[] 参数列表
	*/
	static generatorFunctionParams(params) {
		this.addLParen();
		if (params && params.length > 0) params.forEach((item, index) => {
			if (index !== 0) this.addComma();
			const param = item.param || item;
			this.generatorNode(param);
		});
		this.addRParen();
	}
	/**
	* 判断节点是否"复杂"（需要换行）
	* 复杂的定义：
	* - CallExpression（函数调用）
	* - ObjectExpression（超过1个属性）
	* - ArrayExpression（包含复杂元素）
	*/
	static isComplexNode(node$1) {
		if (!node$1) return false;
		if (node$1.type === SlimeNodeType$1.CallExpression) return true;
		if (node$1.type === SlimeNodeType$1.ObjectExpression && node$1.properties?.length > 1) return true;
		if (node$1.type === SlimeNodeType$1.ArrayExpression) return node$1.elements?.some((item) => this.isComplexNode(item?.element));
		return false;
	}
	static generatorArrayExpression(node$1) {
		this.addLBracket(node$1.loc);
		if (node$1.elements?.some((item) => this.isComplexNode(item?.element)) && node$1.elements.length > 0) {
			this.addNewLine();
			this.indent++;
			this.addIndent();
			node$1.elements.forEach((item, index) => {
				const element = item.element;
				if (element === null || element === void 0) {} else if (element.type === SlimeNodeType$1.SpreadElement) this.generatorSpreadElement(element);
				else this.generatorNode(element);
				if (index < node$1.elements.length - 1) {
					this.addComma();
					this.addNewLine();
					this.addIndent();
				}
			});
			this.addNewLine();
			this.indent--;
			this.addIndent();
		} else for (const item of node$1.elements) {
			const element = item.element;
			if (element === null || element === void 0) {} else if (element.type === SlimeNodeType$1.SpreadElement) this.generatorSpreadElement(element);
			else this.generatorNode(element);
			if (item.commaToken) this.addComma();
		}
		this.addRBracket(node$1.loc);
	}
	static generatorObjectExpression(node$1) {
		this.addLBrace();
		node$1.properties.forEach((item, index) => {
			const property = item.property;
			if (property.type === SlimeNodeType$1.SpreadElement) this.generatorSpreadElement(property);
			else this.generatorNode(property);
			if (item.commaToken) this.addComma();
		});
		this.addRBrace();
	}
	static generatorParenthesizedExpression(node$1) {
		this.addLParen();
		this.generatorNode(node$1.expression);
		this.addRParen();
	}
	static generatorSequenceExpression(node$1) {
		if (node$1.expressions && Array.isArray(node$1.expressions)) for (let i = 0; i < node$1.expressions.length; i++) {
			if (i > 0) this.addComma();
			this.generatorNode(node$1.expressions[i]);
		}
	}
	static generatorPrivateIdentifier(node$1) {
		this.addString(node$1.name);
	}
	static generatorProperty(node$1) {
		if (node$1.kind === "get" || node$1.kind === "set") {
			if (node$1.kind === "get") this.addCodeAndMappings(es6TokensObj.GetTok, node$1.getToken?.loc);
			else this.addCodeAndMappings(es6TokensObj.SetTok, node$1.setToken?.loc);
			this.addSpacing();
			if (node$1.computed) {
				this.addLBracket();
				this.generatorNode(node$1.key);
				this.addRBracket();
			} else this.generatorNode(node$1.key);
			const value = node$1.value;
			this.generatorFunctionParams(value.params);
			if (value.body) this.generatorNode(value.body);
		} else if (node$1.method) {
			const value = node$1.value;
			if (value.async) {
				this.addCodeAndMappings(es6TokensObj.AsyncTok, node$1.asyncToken?.loc);
				this.addSpacing();
			}
			if (value.generator) this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
			if (node$1.computed) {
				this.addLBracket();
				this.generatorNode(node$1.key);
				this.addRBracket();
			} else this.generatorNode(node$1.key);
			this.generatorFunctionParams(value.params);
			if (value.body) this.generatorNode(value.body);
		} else if (node$1.shorthand) if (node$1.value && node$1.value.type === SlimeNodeType$1.AssignmentPattern) this.generatorNode(node$1.value);
		else this.generatorNode(node$1.key);
		else {
			if (node$1.computed) {
				this.addLBracket();
				this.generatorNode(node$1.key);
				this.addRBracket();
			} else this.generatorNode(node$1.key);
			this.addCodeAndMappings(es6TokensObj.Colon, node$1.colonToken?.loc);
			this.generatorNode(node$1.value);
		}
	}
	static {
		this.patternTypes = [
			SlimeNodeType$1.Identifier,
			SlimeNodeType$1.ObjectPattern,
			SlimeNodeType$1.ArrayPattern,
			SlimeNodeType$1.RestElement,
			SlimeNodeType$1.AssignmentPattern,
			SlimeNodeType$1.MemberExpression
		];
	}
	static generatorIdentifier(node$1) {
		const identifierName = node$1.raw || node$1.loc?.value || node$1.name || "";
		if (!identifierName) console.error("generatorIdentifier: node.name is undefined", JSON.stringify(node$1, null, 2));
		const identifier = {
			type: Es6TokenName.IdentifierNameTok,
			name: Es6TokenName.IdentifierNameTok,
			value: identifierName
		};
		this.addCodeAndMappings(identifier, node$1.loc);
	}
	static generatorFunctionDeclaration(node$1) {
		if (node$1.async) {
			this.addCodeAndMappings(es6TokensObj.AsyncTok, node$1.asyncToken?.loc);
			this.addSpacing();
		}
		this.addCodeAndMappings(es6TokensObj.FunctionTok, node$1.functionToken?.loc);
		if (node$1.generator) this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
		if (node$1.id) {
			this.addSpacing();
			this.generatorIdentifier(node$1.id);
		}
		this.generatorFunctionParams(node$1.params);
		if (node$1.body) this.generatorBlockStatement(node$1.body, true);
	}
	static generatorClassDeclaration(node$1) {
		this.addCodeAndMappings(es6TokensObj.ClassTok, node$1.classToken?.loc);
		if (node$1.id) {
			this.addSpacing();
			this.generatorNode(node$1.id);
		}
		if (node$1.superClass) {
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.ExtendsTok, node$1.extendsToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.superClass);
		}
		this.generatorClassBody(node$1.body);
		this.addNewLine();
	}
	static generatorClassExpression(node$1) {
		this.addCodeAndMappings(es6TokensObj.ClassTok, node$1.classToken?.loc);
		if (node$1.id) {
			this.addSpacing();
			this.generatorNode(node$1.id);
		}
		if (node$1.superClass) {
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.ExtendsTok, node$1.extendsToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.superClass);
		}
		this.generatorClassBody(node$1.body);
	}
	static generatorClassBody(body) {
		this.addLBrace(body.lBraceToken?.loc);
		if (body?.body?.length) {
			this.addNewLine();
			this.indent++;
			body.body.forEach((element, index) => {
				this.addIndent();
				this.generatorNode(element);
				this.addNewLine();
			});
			this.indent--;
		}
		this.addRBrace(body.rBraceToken?.loc);
	}
	static generatorMethodDefinition(node$1) {
		if (node$1.static) {
			this.addCodeAndMappings(es6TokensObj.StaticTok, node$1.staticToken?.loc);
			this.addSpacing();
		}
		if (node$1.value && node$1.value.async) {
			this.addCodeAndMappings(es6TokensObj.AsyncTok, node$1.asyncToken?.loc);
			this.addSpacing();
		}
		if (node$1.kind === "get") {
			this.addCodeAndMappings(es6TokensObj.GetTok, node$1.getToken?.loc);
			this.addSpacing();
		} else if (node$1.kind === "set") {
			this.addCodeAndMappings(es6TokensObj.SetTok, node$1.setToken?.loc);
			this.addSpacing();
		}
		if (node$1.value && node$1.value.generator) this.addCodeAndMappings(es6TokensObj.Asterisk, node$1.asteriskToken?.loc);
		if (node$1.key) if (node$1.computed) {
			this.addLBracket();
			this.generatorNode(node$1.key);
			this.addRBracket();
		} else this.generatorNode(node$1.key);
		if (node$1.value) {
			this.generatorFunctionParams(node$1.value.params);
			if (node$1.value.body) this.generatorNode(node$1.value.body);
		}
	}
	static generatorPropertyDefinition(node$1) {
		if (node$1.static) {
			this.addCodeAndMappings(es6TokensObj.StaticTok, node$1.staticToken?.loc);
			this.addSpacing();
		}
		if (node$1.key) if (node$1.computed) {
			this.addLBracket(node$1.lBracketToken?.loc);
			this.generatorNode(node$1.key);
			this.addRBracket(node$1.rBracketToken?.loc);
		} else this.generatorNode(node$1.key);
		if (node$1.value) {
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.Eq, node$1.equalToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.value);
		}
		this.addCode(es6TokensObj.Semicolon);
	}
	static generatorNewExpression(node$1) {
		this.addCodeAndMappings(es6TokensObj.NewTok, node$1.newToken?.loc);
		this.addSpacing();
		if (node$1.callee) this.generatorNode(node$1.callee);
		if (node$1.lParenToken || node$1.arguments && node$1.arguments.length > 0) {
			this.addLParen();
			if (node$1.arguments && node$1.arguments.length > 0) node$1.arguments.forEach((arg, index) => {
				if (index > 0) {
					this.addComma();
					this.addSpacing();
				}
				if (arg && arg.argument) this.generatorNode(arg.argument);
				else this.generatorNode(arg);
			});
			this.addRParen();
		}
	}
	/**
	* 生成任意节点
	* @param node AST 节点
	* @param addNewLineAfter 如果节点是 BlockStatement，是否在 } 后换行（默认 false）
	*/
	static generatorNode(node$1, addNewLineAfter = false) {
		if (!node$1) return;
		if (node$1.type === SlimeNodeType$1.Program) return this.generatorProgram(node$1);
		else if (node$1.type === SlimeNodeType$1.PrivateIdentifier) this.generatorPrivateIdentifier(node$1);
		else if (node$1.type === SlimeNodeType$1.Identifier) this.generatorIdentifier(node$1);
		else if (node$1.type === SlimeNodeType$1.ThisExpression || node$1.type === "ThisExpression") this.addCodeAndMappings(es6TokensObj.ThisTok, node$1.thisToken?.loc);
		else if (node$1.type === SlimeNodeType$1.NumericLiteral) this.generatorNumberLiteral(node$1);
		else if (node$1.type === SlimeNodeType$1.Literal) this.generatorLiteral(node$1);
		else if (node$1.type === SlimeNodeType$1.MemberExpression) this.generatorMemberExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.CallExpression) this.generatorCallExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.FunctionExpression) this.generatorFunctionExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.ArrowFunctionExpression) this.generatorArrowFunctionExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.BinaryExpression) this.generatorBinaryExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.LogicalExpression || node$1.type === "LogicalExpression") this.generatorBinaryExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.StringLiteral) this.generatorStringLiteral(node$1);
		else if (node$1.type === SlimeNodeType$1.ArrayExpression) this.generatorArrayExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.ObjectExpression) this.generatorObjectExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.ParenthesizedExpression) this.generatorParenthesizedExpression(node$1);
		else if (node$1.type === "SequenceExpression") this.generatorSequenceExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.Property) this.generatorProperty(node$1);
		else if (node$1.type === SlimeNodeType$1.VariableDeclarator) this.generatorVariableDeclarator(node$1);
		else if (node$1.type === SlimeNodeType$1.RestElement) this.generatorRestElement(node$1);
		else if (node$1.type === SlimeNodeType$1.SpreadElement) this.generatorSpreadElement(node$1);
		else if (node$1.type === SlimeNodeType$1.ObjectPattern) this.generatorObjectPattern(node$1);
		else if (node$1.type === SlimeNodeType$1.ArrayPattern) this.generatorArrayPattern(node$1);
		else if (node$1.type === SlimeNodeType$1.AssignmentPattern) this.generatorAssignmentPattern(node$1);
		else if (node$1.type === SlimeNodeType$1.FunctionDeclaration) this.generatorFunctionDeclaration(node$1);
		else if (node$1.type === SlimeNodeType$1.ClassDeclaration) this.generatorClassDeclaration(node$1);
		else if (node$1.type === SlimeNodeType$1.ClassExpression) this.generatorClassExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.MethodDefinition) this.generatorMethodDefinition(node$1);
		else if (node$1.type === "PropertyDefinition") this.generatorPropertyDefinition(node$1);
		else if (node$1.type === "NewExpression") this.generatorNewExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.VariableDeclaration) this.generatorVariableDeclaration(node$1);
		else if (node$1.type === SlimeNodeType$1.ExpressionStatement) this.generatorExpressionStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.ReturnStatement) this.generatorReturnStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.BlockStatement) this.generatorBlockStatement(node$1, addNewLineAfter);
		else if (node$1.type === SlimeNodeType$1.IfStatement) this.generatorIfStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.ForStatement) this.generatorForStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.ForInStatement || node$1.type === SlimeNodeType$1.ForOfStatement) this.generatorForInOfStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.WhileStatement) this.generatorWhileStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.DoWhileStatement) this.generatorDoWhileStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.SwitchStatement) this.generatorSwitchStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.SwitchCase) this.generatorSwitchCase(node$1);
		else if (node$1.type === SlimeNodeType$1.TryStatement) this.generatorTryStatement(node$1);
		else if (node$1.type === "CatchClause") this.generatorCatchClause(node$1);
		else if (node$1.type === SlimeNodeType$1.ThrowStatement) this.generatorThrowStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.BreakStatement) this.generatorBreakStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.ContinueStatement) this.generatorContinueStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.LabeledStatement) this.generatorLabeledStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.WithStatement) this.generatorWithStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.DebuggerStatement) this.generatorDebuggerStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.EmptyStatement) this.generatorEmptyStatement(node$1);
		else if (node$1.type === SlimeNodeType$1.ImportSpecifier) this.generatorImportSpecifier(node$1);
		else if (node$1.type === SlimeNodeType$1.ImportDefaultSpecifier) this.generatorImportDefaultSpecifier(node$1);
		else if (node$1.type === SlimeNodeType$1.ImportNamespaceSpecifier) this.generatorImportNamespaceSpecifier(node$1);
		else if (node$1.type === SlimeNodeType$1.ExportNamedDeclaration) this.generatorExportNamedDeclaration(node$1);
		else if (node$1.type === SlimeNodeType$1.ExportDefaultDeclaration) this.generatorExportDefaultDeclaration(node$1);
		else if (node$1.type === "ExportAllDeclaration") this.generatorExportAllDeclaration(node$1);
		else if (node$1.type === SlimeNodeType$1.ImportDeclaration) this.generatorImportDeclaration(node$1);
		else if (node$1.type === SlimeNodeType$1.ImportExpression) this.generatorImportExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.ChainExpression) this.generatorChainExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.StaticBlock) this.generatorStaticBlock(node$1);
		else if (node$1.type === "ConditionalExpression") this.generatorConditionalExpression(node$1);
		else if (node$1.type === "AssignmentExpression") this.generatorAssignmentExpression(node$1);
		else if (node$1.type === "BooleanLiteral") this.addString(node$1.value ? "true" : "false");
		else if (node$1.type === "NullLiteral") this.addString("null");
		else if (node$1.type === "UnaryExpression") this.generatorUnaryExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.UpdateExpression) this.generatorUpdateExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.YieldExpression) this.generatorYieldExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.AwaitExpression) this.generatorAwaitExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.TemplateLiteral) this.generatorTemplateLiteral(node$1);
		else if (node$1.type === "Super") this.addString("super");
		else if (node$1.type === "TaggedTemplateExpression") {
			this.generatorNode(node$1.tag);
			this.generatorTemplateLiteral(node$1.quasi);
		} else if (node$1.type === "MetaProperty") {
			this.generatorNode(node$1.meta);
			this.addDot(node$1.dotToken?.loc);
			this.generatorNode(node$1.property);
		} else if (node$1.type === SlimeNodeType$1.OptionalCallExpression) this.generatorOptionalCallExpression(node$1);
		else if (node$1.type === SlimeNodeType$1.OptionalMemberExpression) this.generatorOptionalMemberExpression(node$1);
		else {
			console.error("未知节点:", JSON.stringify(node$1, null, 2));
			throw new Error("不支持的类型：" + node$1.type);
		}
		if (node$1.loc && node$1.loc.newLine) this.addNewLine();
	}
	static generatorUnaryExpression(node$1) {
		this.addString(node$1.operator);
		if (node$1.operator === "typeof" || node$1.operator === "void" || node$1.operator === "delete") this.addSpacing();
		this.generatorNode(node$1.argument);
	}
	static generatorUpdateExpression(node$1) {
		if (node$1.prefix) {
			this.addString(node$1.operator);
			this.generatorNode(node$1.argument);
		} else {
			this.generatorNode(node$1.argument);
			this.addString(node$1.operator);
		}
	}
	static generatorConditionalExpression(node$1) {
		this.generatorNode(node$1.test);
		this.addString("?");
		this.generatorNode(node$1.consequent);
		this.addString(":");
		this.generatorNode(node$1.alternate);
	}
	static generatorAssignmentExpression(node$1) {
		this.generatorNode(node$1.left);
		this.addSpacing();
		this.addString(node$1.operator || "=");
		this.addSpacing();
		this.generatorNode(node$1.right);
	}
	static generatorObjectPattern(node$1) {
		this.addLBrace();
		node$1.properties.forEach((item, index) => {
			const prop = item.property !== void 0 ? item.property : item;
			const commaToken = item.commaToken;
			if (prop.type === SlimeNodeType$1.RestElement) this.generatorRestElement(prop);
			else if (prop.shorthand) if (prop.value && prop.value.type === SlimeNodeType$1.AssignmentPattern) this.generatorNode(prop.value);
			else this.generatorNode(prop.key);
			else {
				if (prop.computed) {
					this.addLBracket(prop.lBracketToken?.loc);
					this.generatorNode(prop.key);
					this.addRBracket(prop.rBracketToken?.loc);
				} else this.generatorNode(prop.key);
				this.addCodeAndMappings(es6TokensObj.Colon, prop.colonToken?.loc);
				this.addSpacing();
				this.generatorNode(prop.value);
			}
			if (commaToken) this.addComma();
			else if (index < node$1.properties.length - 1) this.addComma();
		});
		this.addRBrace();
	}
	static generatorArrayPattern(node$1) {
		this.addLBracket();
		node$1.elements.forEach((item, index) => {
			const wrapped = item;
			const element = wrapped.element !== void 0 ? wrapped.element : item;
			const commaToken = wrapped.commaToken;
			if (element) this.generatorNode(element);
			if (commaToken) this.addComma();
			else if (index < node$1.elements.length - 1) this.addComma();
		});
		this.addRBracket();
	}
	static generatorRestElement(node$1) {
		this.addCodeAndMappings(es6TokensObj.Ellipsis, node$1.ellipsisToken?.loc);
		this.generatorNode(node$1.argument);
	}
	static generatorSpreadElement(node$1) {
		this.addCodeAndMappings(es6TokensObj.Ellipsis, node$1.ellipsisToken?.loc);
		this.generatorNode(node$1.argument);
	}
	static generatorAssignmentPattern(node$1) {
		this.generatorNode(node$1.left);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.Eq, node$1.equalToken?.loc);
		this.addSpacing();
		this.generatorNode(node$1.right);
	}
	/**
	* 生成块语句（{...}）
	* @param node BlockStatement 节点
	* @param addNewLineAfter 是否在 } 后换行（默认 false）
	*/
	static generatorBlockStatement(node$1, addNewLineAfter = false) {
		this.addLBrace(node$1.lBraceToken?.loc);
		this.addNewLine();
		this.indent++;
		this.addIndent();
		this.generatorNodes(node$1.body);
		this.indent--;
		this.addIndent();
		this.addRBrace(node$1.rBraceToken?.loc);
		if (addNewLineAfter) this.addNewLine();
	}
	static generatorReturnStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.ReturnTok, node$1.returnToken?.loc);
		if (node$1.argument) {
			this.addSpacing();
			this.generatorNode(node$1.argument);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	static addSpacing() {
		this.addString(" ");
	}
	static addDot(loc) {
		this.addCodeAndMappings(es6TokensObj.Dot, loc);
	}
	static addComma(loc) {
		this.addCodeAndMappings(es6TokensObj.Comma, loc);
	}
	static addLParen(loc) {
		this.addCodeAndMappings(es6TokensObj.LParen, loc);
	}
	static addRParen(loc) {
		this.addCodeAndMappings(es6TokensObj.RParen, loc);
	}
	static addLBrace(loc) {
		this.addCodeAndMappings(es6TokensObj.LBrace, loc);
	}
	static addRBrace(loc) {
		this.addCodeAndMappings(es6TokensObj.RBrace, loc);
	}
	static addLBracket(loc) {
		this.addCodeAndMappings(es6TokensObj.LBracket, loc);
	}
	static addRBracket(loc) {
		this.addCodeAndMappings(es6TokensObj.RBracket, loc);
	}
	static generatorMemberExpression(node$1) {
		this.generatorNode(node$1.object);
		if (node$1.computed) {
			if (node$1.optional) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node$1.optionalChainingToken?.loc);
			this.addLBracket(node$1.lBracketToken?.loc);
			this.generatorNode(node$1.property);
			this.addRBracket(node$1.rBracketToken?.loc);
		} else {
			if (node$1.optional) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node$1.optionalChainingToken?.loc);
			else this.addDot(node$1.dotToken?.loc);
			if (node$1.property) this.generatorNode(node$1.property);
		}
	}
	/**
	* 生成可选调用表达式：obj?.method() 或 obj?.()
	*/
	static generatorOptionalCallExpression(node$1) {
		this.generatorNode(node$1.callee);
		if (node$1.optional) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node$1.optionalChainingToken?.loc);
		this.addLParen(node$1.lParenToken?.loc);
		if (node$1.arguments && node$1.arguments.length > 0) node$1.arguments.forEach((arg, index) => {
			if (index > 0) this.addComma();
			const argument = arg.argument || arg;
			if (argument.type === SlimeNodeType$1.SpreadElement) this.generatorSpreadElement(argument);
			else this.generatorNode(argument);
		});
		this.addRParen(node$1.rParenToken?.loc);
	}
	/**
	* 生成可选成员访问表达式：obj?.prop 或 obj?.[expr]
	*/
	static generatorOptionalMemberExpression(node$1) {
		this.generatorNode(node$1.object);
		if (node$1.computed) {
			if (node$1.optional) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node$1.optionalChainingToken?.loc);
			this.addLBracket(node$1.lBracketToken?.loc);
			this.generatorNode(node$1.property);
			this.addRBracket(node$1.rBracketToken?.loc);
		} else {
			if (node$1.optional) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node$1.optionalChainingToken?.loc);
			else this.addDot(node$1.dotToken?.loc);
			this.generatorNode(node$1.property);
		}
	}
	/**
	* 生成变量声明（内部辅助方法）
	* @param node VariableDeclaration 节点
	* @param addSemicolonAndNewLine 是否添加分号和换行（默认 true）
	*/
	static generatorVariableDeclarationCore(node$1, addSemicolonAndNewLine) {
		const kindValue = typeof node$1.kind === "string" ? node$1.kind : node$1.kind?.value?.valueOf();
		const kindLoc = typeof node$1.kind === "string" ? void 0 : node$1.kind?.loc;
		this.addCodeAndMappings(es6TokenMapObj[kindValue], kindLoc);
		this.addSpacing();
		for (let i = 0; i < node$1.declarations.length; i++) {
			this.generatorNode(node$1.declarations[i]);
			if (i < node$1.declarations.length - 1) {
				this.addCode(es6TokensObj.Comma);
				this.addSpacing();
			}
		}
		if (addSemicolonAndNewLine) {
			this.addCode(es6TokensObj.Semicolon);
			this.addNewLine();
		}
	}
	static generatorVariableDeclaration(node$1) {
		this.generatorVariableDeclarationCore(node$1, true);
	}
	static get lastMapping() {
		if (this.mappings.length) return this.mappings[this.mappings.length - 1];
		return null;
	}
	static generatorVariableDeclarator(node$1) {
		this.generatorNode(node$1.id);
		if (node$1.init) {
			this.addSpacing();
			if (node$1.equal) this.addCodeAndMappings(es6TokensObj.Eq, node$1.equal.loc);
			else this.addCode(es6TokensObj.Eq);
			this.addSpacing();
			this.generatorNode(node$1.init);
		}
	}
	static generatorNumberLiteral(node$1) {
		const numValue = node$1.raw || String(node$1.value);
		this.addCodeAndMappings({
			type: Es6TokenName.NumericLiteral,
			name: Es6TokenName.NumericLiteral,
			value: numValue
		}, node$1.loc);
	}
	static generatorStringLiteral(node$1) {
		const strValue = node$1.raw || `'${node$1.value}'`;
		this.addCodeAndMappings({
			type: Es6TokenName.StringLiteral,
			name: Es6TokenName.StringLiteral,
			value: strValue
		}, node$1.loc);
	}
	/**
	* 生成 ESTree 标准的 Literal 节点
	* Literal 可以是：number, string, boolean, null, RegExp, BigInt
	*/
	static generatorLiteral(node$1) {
		const value = node$1.value;
		const raw = node$1.raw;
		if (value === null) this.addCodeAndMappings({
			type: "NullLiteral",
			name: "NullLiteral",
			value: "null"
		}, node$1.loc);
		else if (typeof value === "boolean") {
			const boolValue = value ? "true" : "false";
			this.addCodeAndMappings({
				type: "BooleanLiteral",
				name: "BooleanLiteral",
				value: boolValue
			}, node$1.loc);
		} else if (typeof value === "number") {
			const numValue = raw || String(value);
			this.addCodeAndMappings({
				type: Es6TokenName.NumericLiteral,
				name: Es6TokenName.NumericLiteral,
				value: numValue
			}, node$1.loc);
		} else if (typeof value === "string") {
			const strValue = raw || `'${value}'`;
			this.addCodeAndMappings({
				type: Es6TokenName.StringLiteral,
				name: Es6TokenName.StringLiteral,
				value: strValue
			}, node$1.loc);
		} else if (typeof value === "bigint" || raw && raw.endsWith("n")) {
			const bigintValue = raw || `${value}n`;
			this.addCodeAndMappings({
				type: "BigIntLiteral",
				name: "BigIntLiteral",
				value: bigintValue
			}, node$1.loc);
		} else if (value instanceof RegExp || node$1.regex) {
			const regexValue = raw || String(value);
			this.addCodeAndMappings({
				type: "RegularExpressionLiteral",
				name: "RegularExpressionLiteral",
				value: regexValue
			}, node$1.loc);
		} else {
			const fallbackValue = raw || String(value);
			this.addString(fallbackValue);
		}
	}
	static cstLocationToSlimeLocation(cstLocation) {
		if (cstLocation) {
			if (!cstLocation.value || cstLocation.value === null || cstLocation.value === "null" || cstLocation.value === "undefined") return null;
			return {
				type: cstLocation.type,
				index: cstLocation.start.index,
				value: cstLocation.value,
				length: cstLocation.end.index - cstLocation.start.index,
				line: cstLocation.start.line,
				column: cstLocation.start.column
			};
		}
		return null;
	}
	static addCodeAndMappingsBySourcePosition(token, sourcePosition) {
		this.addMappings(token, sourcePosition);
		this.addCode(token);
	}
	static addCodeAndMappingsFindLoc(token, tokenType, findIndex) {
		const cstLocation = this.findNextTokenLocByTypeAndIndex(tokenType, findIndex);
		if (cstLocation) this.addCodeAndMappings(token, cstLocation);
		else this.addCodeAndMappings(token);
	}
	/**
	* 添加代码并记录 source map 映射
	*
	* 参数要求：
	* - token 必须符合 SubhutiCreateToken 接口，包含：
	*   - type: token 类型（必需）- 用于标识 token 的种类
	*   - name: token 名称（必需）
	*   - value: token 值（必需）- 实际生成的代码内容
	*
	* 使用场景：
	* - 需要在生成代码和原始代码之间建立映射关系
	* - 用于调试时能够定位到原始代码位置
	*
	* 注意：如果不需要 source map，使用 addString() 更高效
	*/
	static addCodeAndMappings(token, cstLocation = null) {
		if (!token) {
			console.warn("SlimeGenerator.addCodeAndMappings: token is undefined");
			return;
		}
		if (cstLocation) {
			const sourcePosition = this.cstLocationToSlimeLocation(cstLocation);
			if (sourcePosition) this.addCodeAndMappingsBySourcePosition(token, sourcePosition);
			else this.addCode(token);
		} else this.addCode(token);
	}
	/**
	* 添加代码 token（可能记录 source map 映射）
	*
	* 使用场景：
	* 1. 预定义的 token：关键字（if, function, class）、符号（;, {, }）
	* 2. 需要 source map 映射的内容：标识符、字面量等
	* 3. 配合 addCodeAndMappings() 使用
	*
	* 参数要求：
	* - 必须符合 SubhutiCreateToken 接口（包含 type, name, value 属性）
	*
	* 与 addString() 的区别：
	* - addCode()：需要完整的 token 对象，可能记录 source map
	* - addString()：只需字符串，性能更好，不记录 source map
	*/
	static addCode(code) {
		this.generateCode += code.value;
		this.generateColumn += code.value.length;
		this.generateIndex += code.value.length;
	}
	/**
	* 添加字符串代码（不记录 source map 映射）
	*
	* 使用场景：
	* 1. 动态内容：运算符（+, -, *, /）、标识符名称、字面量值
	* 2. 格式化字符：空格、换行等
	* 3. 不需要调试映射的内容
	*
	* 与 addCode() 的区别：
	* - addCode()：需要 SubhutiCreateToken 对象，可能记录 source map
	* - addString()：直接字符串拼接，性能更好，不记录 source map
	*
	* 性能优势：避免对象创建和属性访问，性能提升约 2-3倍
	*/
	static addString(str) {
		this.generateCode += str;
		this.generateColumn += str.length;
		this.generateIndex += str.length;
	}
	static addSemicolonAndNewLine() {}
	static addSemicolon() {
		this.addString(";");
	}
	static addNewLine() {
		this.generateCode += "\n";
		this.generateLine++;
		this.generateColumn = 0;
		this.generateIndex++;
	}
	/**
	* 阶段2：添加当前缩进（2个空格 * indent层级）
	*/
	static addIndent() {
		const indentStr = "  ".repeat(this.indent);
		this.addString(indentStr);
	}
	/**
	* @deprecated 使用 addSpacing() 代替，保持代码风格统一
	*
	* 该方法已不再使用，所有空格处理已统一为 addSpacing()
	* 保留此方法仅为了向后兼容（如果有外部调用）
	*/
	static addCodeSpacing() {
		this.addString(" ");
	}
	static addMappings(generateToken, sourcePosition) {
		let generate = {
			type: generateToken.name,
			index: this.generateIndex,
			value: generateToken.value,
			length: generateToken.value.length,
			line: this.generateLine,
			column: this.generateColumn
		};
		if (!sourcePosition) {}
		this.mappings.push({
			source: sourcePosition,
			generate
		});
	}
	/**
	* 生成 if 语句
	* if (test) consequent [else alternate]
	*/
	static generatorIfStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.IfTok, node$1.ifToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		this.generatorNode(node$1.test);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		if (node$1.consequent.type !== SlimeNodeType$1.BlockStatement) this.addSpacing();
		this.generatorNode(node$1.consequent, true);
		if (node$1.alternate) {
			this.addCodeAndMappings(es6TokensObj.ElseTok, node$1.elseToken?.loc);
			if (node$1.alternate.type !== SlimeNodeType$1.BlockStatement) this.addSpacing();
			this.generatorNode(node$1.alternate, true);
		}
	}
	/**
	* 生成 for 语句
	*/
	static generatorForStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.ForTok, node$1.forToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		if (node$1.init) if (node$1.init.type === SlimeNodeType$1.VariableDeclaration) this.generatorVariableDeclarationCore(node$1.init, false);
		else this.generatorNode(node$1.init);
		this.addCodeAndMappings(es6TokensObj.Semicolon, node$1.semicolon1Token?.loc);
		if (node$1.test) this.generatorNode(node$1.test);
		this.addCodeAndMappings(es6TokensObj.Semicolon, node$1.semicolon2Token?.loc);
		if (node$1.update) this.generatorNode(node$1.update);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		if (node$1.body) this.generatorNode(node$1.body, true);
	}
	/**
	* 生成 for...in / for...of 语句
	*/
	static generatorForInOfStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.ForTok, node$1.forToken?.loc);
		if (node$1.await) {
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.AwaitTok, node$1.awaitToken?.loc);
		}
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		if (!node$1.left) {} else if (node$1.left.type === SlimeNodeType$1.VariableDeclaration) {
			this.addCode(es6TokenMapObj[node$1.left.kind.value.valueOf()]);
			this.addSpacing();
			if (node$1.left.declarations && node$1.left.declarations.length > 0) {
				const decl = node$1.left.declarations[0];
				this.generatorNode(decl.id);
				if (decl.init) {
					this.addSpacing();
					this.addCode(es6TokensObj.Assign);
					this.addSpacing();
					this.generatorNode(decl.init);
				}
			}
		} else this.generatorNode(node$1.left);
		this.addSpacing();
		if (node$1.type === SlimeNodeType$1.ForInStatement) this.addCodeAndMappings(es6TokensObj.InTok, node$1.inToken?.loc);
		else this.addCodeAndMappings(es6TokensObj.OfTok, node$1.ofToken?.loc);
		this.addSpacing();
		this.generatorNode(node$1.right);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		this.generatorNode(node$1.body, true);
	}
	/**
	* 生成 while 语句
	*/
	static generatorWhileStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.WhileTok, node$1.whileToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		if (node$1.test) this.generatorNode(node$1.test);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		if (node$1.body) this.generatorNode(node$1.body, true);
	}
	/**
	* 生成 do...while 语句
	*/
	static generatorDoWhileStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.DoTok, node$1.doToken?.loc);
		if (node$1.body?.type === SlimeNodeType$1.BlockStatement) this.generatorNode(node$1.body);
		else {
			this.addSpacing();
			this.generatorNode(node$1.body);
		}
		this.addCodeAndMappings(es6TokensObj.WhileTok, node$1.whileToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		this.generatorNode(node$1.test);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成 switch 语句
	*/
	static generatorSwitchStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.SwitchTok, node$1.switchToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		this.generatorNode(node$1.discriminant);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		this.addCodeAndMappings(es6TokensObj.LBrace, node$1.lBraceToken?.loc);
		if (node$1.cases) this.generatorNodes(node$1.cases);
		this.addCodeAndMappings(es6TokensObj.RBrace, node$1.rBraceToken?.loc);
	}
	/**
	* 生成 switch case 分支
	*/
	static generatorSwitchCase(node$1) {
		if (node$1.test) {
			this.addCodeAndMappings(es6TokensObj.CaseTok, node$1.caseToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.test);
			this.addCodeAndMappings(es6TokensObj.Colon, node$1.colonToken?.loc);
		} else {
			this.addCodeAndMappings(es6TokensObj.DefaultTok, node$1.defaultToken?.loc);
			this.addCodeAndMappings(es6TokensObj.Colon, node$1.colonToken?.loc);
		}
		if (node$1.consequent && node$1.consequent.length > 0) this.generatorNodes(node$1.consequent);
	}
	/**
	* 生成 try 语句
	*/
	static generatorTryStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.TryTok, node$1.tryToken?.loc);
		this.addSpacing();
		this.generatorNode(node$1.block, false);
		if (node$1.handler) {
			this.addCodeAndMappings(es6TokensObj.CatchTok, node$1.handler.catchToken?.loc);
			if (node$1.handler.param) {
				this.addSpacing();
				this.addLParen(node$1.handler.lParenToken?.loc);
				this.generatorNode(node$1.handler.param);
				this.addRParen(node$1.handler.rParenToken?.loc);
			}
			const hasFinalizer = !!node$1.finalizer;
			this.generatorNode(node$1.handler.body, !hasFinalizer);
		}
		if (node$1.finalizer) {
			this.addCodeAndMappings(es6TokensObj.FinallyTok, node$1.finallyToken?.loc);
			this.addSpacing();
			this.generatorNode(node$1.finalizer, true);
		}
	}
	/**
	* 生成 catch 子句
	*
	* 注意：虽然大多数情况下 catch 会在 TryStatement 中直接处理，
	* 但某些情况下可能需要单独生成 CatchClause 节点，因此保留此方法。
	*/
	static generatorCatchClause(node$1) {
		this.addCodeAndMappings(es6TokensObj.CatchTok, node$1.catchToken?.loc);
		if (node$1.param) {
			this.addSpacing();
			this.addLParen(node$1.lParenToken?.loc);
			this.generatorNode(node$1.param);
			this.addRParen(node$1.rParenToken?.loc);
		}
		if (node$1.body) this.generatorNode(node$1.body);
	}
	/**
	* 生成 throw 语句
	*/
	static generatorThrowStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.ThrowTok, node$1.throwToken?.loc);
		if (node$1.argument) {
			this.addSpacing();
			this.generatorNode(node$1.argument);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成 break 语句
	*/
	static generatorBreakStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.BreakTok, node$1.breakToken?.loc);
		if (node$1.label) {
			this.addSpacing();
			this.generatorNode(node$1.label);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成 continue 语句
	*/
	static generatorContinueStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.ContinueTok, node$1.continueToken?.loc);
		if (node$1.label) {
			this.addSpacing();
			this.generatorNode(node$1.label);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成标签语句
	*/
	static generatorLabeledStatement(node$1) {
		this.generatorNode(node$1.label);
		this.addCodeAndMappings(es6TokensObj.Colon, node$1.colonToken?.loc);
		this.generatorNode(node$1.body);
	}
	/**
	* 生成 with 语句
	*/
	static generatorWithStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.WithTok, node$1.withToken?.loc);
		this.addCodeAndMappings(es6TokensObj.LParen, node$1.lParenToken?.loc);
		this.generatorNode(node$1.object);
		this.addCodeAndMappings(es6TokensObj.RParen, node$1.rParenToken?.loc);
		this.generatorNode(node$1.body);
	}
	/**
	* 生成 debugger 语句
	*/
	static generatorDebuggerStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.DebuggerTok, node$1.debuggerToken?.loc);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成空语句
	*/
	static generatorEmptyStatement(node$1) {
		this.addCodeAndMappings(es6TokensObj.Semicolon, node$1.semicolonToken?.loc);
	}
	/**
	* 生成 export default 声明
	* export default expression
	*/
	static generatorExportDefaultDeclaration(node$1) {
		this.addCodeAndMappings(es6TokensObj.ExportTok, node$1.exportToken?.loc);
		this.addSpacing();
		this.addCodeAndMappings(es6TokensObj.DefaultTok, node$1.defaultToken?.loc);
		this.addSpacing();
		this.generatorNode(node$1.declaration);
		const declarationType = node$1.declaration?.type;
		if (declarationType !== SlimeNodeType$1.FunctionDeclaration && declarationType !== SlimeNodeType$1.ClassDeclaration) {
			this.addCode(es6TokensObj.Semicolon);
			this.addNewLine();
		}
	}
	/**
	* 生成 ChainExpression（可选链表达式）
	* 例如: obj?.prop 或 obj?.method()
	*/
	static generatorChainExpression(node$1) {
		this.generatorNode(node$1.expression);
	}
	/**
	* 生成 ImportExpression（动态导入）
	* 例如: import('./module.js')
	*/
	static generatorImportExpression(node$1) {
		this.addCodeAndMappings(es6TokensObj.ImportTok, node$1.importToken?.loc);
		this.addLParen(node$1.lParenToken?.loc);
		this.generatorNode(node$1.source);
		this.addRParen(node$1.rParenToken?.loc);
	}
	/**
	* 生成 StaticBlock（类的静态初始化块）
	* 例如: static { console.log('init') }
	*/
	static generatorStaticBlock(node$1) {
		this.addCodeAndMappings(es6TokensObj.StaticTok, node$1.staticToken?.loc);
		this.addSpacing();
		this.addLBrace(node$1.lBraceToken?.loc);
		this.addNewLine();
		this.indent++;
		this.addIndent();
		this.generatorNodes(node$1.body);
		this.indent--;
		this.addIndent();
		this.addRBrace(node$1.rBraceToken?.loc);
		this.addNewLine();
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiTokenLookahead.ts
var SubhutiTokenLookahead = class {
	constructor() {
		this._parseSuccess = true;
	}
	get parserFail() {
		return !this._parseSuccess;
	}
	/**
	* 标记解析失败（用于手动失败）
	*
	* 用于自定义验证逻辑中标记解析失败
	*
	* @returns never (实际返回 undefined，但类型声明为 never 以便链式调用)
	*/
	setParseFail() {
		this._parseSuccess = false;
	}
	/**
	* 获取当前 token（由子类实现）
	*/
	get curToken() {}
	/**
	* 前瞻：获取未来的 token（不消费）
	* 由子类 SubhutiParser 覆盖实现
	*
	* @param offset 偏移量（1 = 当前 token，2 = 下一个...）
	* @returns token 或 undefined（EOF）
	*/
	peek(offset = 1) {}
	/**
	* LA (LookAhead) - 前瞻获取 token（不消费）
	*
	* 这是 parser 领域的标准术语：
	* - LA(1) = 当前 token
	* - LA(2) = 下一个 token
	* - LA(n) = 第 n 个 token
	*
	* @param offset 偏移量（1 = 当前 token，2 = 下一个...）
	* @returns token 或 undefined（EOF）
	*/
	LA(offset = 1) {
		return this.peek(offset);
	}
	/**
	* 前瞻：获取连续的 N 个 token
	*
	* @param count 要获取的 token 数量
	* @returns token 数组（长度可能小于 count，如果遇到 EOF）
	*/
	peekSequence(count) {
		const result = [];
		for (let i = 1; i <= count; i++) {
			const token = this.peek(i);
			if (!token) break;
			result.push(token);
		}
		return result;
	}
	/**
	* [lookahead = token]
	* 规范：正向前瞻，检查下一个 token 是否匹配
	*/
	lookahead(tokenName, offset = 1) {
		return this.peek(offset)?.tokenName === tokenName;
	}
	/**
	* [lookahead ≠ token]
	* 规范：否定前瞻，检查下一个 token 是否不匹配
	*/
	lookaheadNot(tokenName, offset = 1) {
		const token = this.peek(offset);
		return token ? token.tokenName !== tokenName : true;
	}
	/**
	* [lookahead ∈ {t1, t2, ...}]
	* 规范：正向集合前瞻，检查下一个 token 是否在集合中
	*/
	lookaheadIn(tokenNames, offset = 1) {
		const token = this.peek(offset);
		return token ? tokenNames.includes(token.tokenName) : false;
	}
	/**
	* [lookahead ∉ {t1, t2, ...}]
	* 规范：否定集合前瞻，检查下一个 token 是否不在集合中
	*/
	lookaheadNotIn(tokenNames, offset = 1) {
		const token = this.peek(offset);
		return token ? !tokenNames.includes(token.tokenName) : true;
	}
	/**
	* [lookahead = t1 t2 ...]
	* 规范：序列前瞻，检查连续的 token 序列是否匹配
	*/
	lookaheadSequence(tokenNames) {
		const peeked = this.peekSequence(tokenNames.length);
		if (peeked.length !== tokenNames.length) return false;
		return peeked.every((token, i) => token.tokenName === tokenNames[i]);
	}
	/**
	* [lookahead ≠ t1 t2 ...]
	* 规范：否定序列前瞻，检查连续的 token 序列是否不匹配
	*/
	lookaheadNotSequence(tokenNames) {
		return !this.lookaheadSequence(tokenNames);
	}
	/**
	* 检查：token 序列匹配且中间无换行符
	*
	* @param tokenNames token 名称序列
	* @returns true = 序列匹配且中间都在同一行
	*
	* @example
	* // async [no LineTerminator here] function
	* if (this.lookaheadSequenceNoLT(['AsyncTok', 'FunctionTok'])) { ... }
	*/
	lookaheadSequenceNoLT(tokenNames) {
		const peeked = this.peekSequence(tokenNames.length);
		if (peeked.length !== tokenNames.length) return false;
		for (let i = 0; i < tokenNames.length; i++) {
			if (peeked[i].tokenName !== tokenNames[i]) return false;
			if (i > 0 && peeked[i].hasLineBreakBefore) return false;
		}
		return true;
	}
	/**
	* [no LineTerminator here]
	* 检查当前 token 前是否有换行符
	*/
	lookaheadHasLineBreak() {
		return this.curToken?.hasLineBreakBefore ?? false;
	}
	/**
	* 断言：当前 token 必须是指定类型
	* 如果不是，则标记失败
	*
	* @param tokenName - 必须的 token 类型
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead = =]
	* this.assertLookahead('Assign')
	*/
	assertLookahead(tokenName, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookahead(tokenName, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 不能是指定类型
	* 如果是，则标记失败
	*
	* @param tokenName - 不允许的 token 类型
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ≠ else]
	* this.assertLookaheadNot('ElseTok')
	*/
	assertLookaheadNot(tokenName, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadNot(tokenName, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 必须在指定集合中
	* 如果不在，则标记失败
	*
	* @param tokenNames - 允许的 token 类型列表
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ∈ {8, 9}]
	* this.assertLookaheadIn(['DecimalDigit8', 'DecimalDigit9'])
	*/
	assertLookaheadIn(tokenNames, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadIn(tokenNames, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 不能在指定集合中
	* 如果在，则标记失败
	*
	* @param tokenNames - 不允许的 token 类型列表
	* @param offset - 偏移量（默认 1）
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ∉ {{, function, class}]
	* this.assertLookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])
	*/
	assertLookaheadNotIn(tokenNames, offset = 1) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadNotIn(tokenNames, offset);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：必须是指定的 token 序列
	* 如果不匹配，则标记失败
	*
	* @param tokenNames - token 序列
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead = async function]
	* this.assertLookaheadSequence(['AsyncTok', 'FunctionTok'])
	*/
	assertLookaheadSequence(tokenNames) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadSequence(tokenNames);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：不能是指定的 token 序列
	* 如果匹配，则标记失败
	*
	* @param tokenNames - token 序列
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ≠ let []
	* this.assertLookaheadNotSequence(['LetTok', 'LBracket'])
	*/
	assertLookaheadNotSequence(tokenNames) {
		if (!this._parseSuccess) return false;
		const result = this.lookaheadNotSequence(tokenNames);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：不能是指定的 token 序列（考虑换行符约束）
	* 如果序列匹配且中间没有换行符，则标记失败
	*
	* @param tokenNames - token 序列
	* @returns 断言是否成功
	*
	* @example
	* // [lookahead ≠ async [no LineTerminator here] function]
	* this.assertLookaheadNotSequenceNoLT(['AsyncTok', 'FunctionTok'])
	*/
	assertLookaheadNotSequenceNoLT(tokenNames) {
		if (!this._parseSuccess) return false;
		const result = !this.lookaheadSequenceNoLT(tokenNames);
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：当前 token 前不能有换行符
	* 如果有，则标记失败
	*
	* @returns 断言是否成功
	*
	* @example
	* // [no LineTerminator here]
	* this.assertNoLineBreak()
	*/
	assertNoLineBreak() {
		if (!this._parseSuccess) return false;
		const result = !this.lookaheadHasLineBreak();
		if (!result) this._parseSuccess = false;
		return result;
	}
	/**
	* 断言：条件必须为真
	* 如果条件为假，则标记失败
	*
	* @param condition - 要检查的条件
	* @returns 断言是否成功（即条件本身）
	*
	* @example
	* // 断言：标识符不能是保留字
	* const cst = this.tokenConsumer.Identifier()
	* this.assertCondition(!(cst && ReservedWords.has(cst.value!)))
	*/
	assertCondition(condition) {
		if (!this._parseSuccess) return false;
		if (!condition) this._parseSuccess = false;
		return condition;
	}
	/**
	* 检查当前 token 是否匹配指定类型
	* 对应 Babel 的 match 方法
	* @param tokenName token 类型名称
	*/
	match(tokenName) {
		return this.curToken?.tokenName === tokenName;
	}
};

//#endregion
//#region ../../subhuti/src/struct/SubhutiCst.ts
var SubhutiCst = class {
	constructor(cst) {
		if (cst) {
			this.name = cst.name;
			this.children = cst.children;
			this.value = cst.value;
		}
	}
	/**
	* 获取指定名称的第 N 个子节点
	*
	* @param name 子节点名称
	* @param index 索引（默认 0，即第一个）
	* @returns 匹配的子节点，如果不存在返回 undefined
	*
	* 用法：
	* ```typescript
	* const leftOperand = cst.getChild('Expression', 0)
	* const rightOperand = cst.getChild('Expression', 1)
	* ```
	*/
	getChild(name, index = 0) {
		if (!this.children) return void 0;
		return this.children.filter((c) => c.name === name)[index];
	}
	/**
	* 获取所有指定名称的子节点
	*
	* @param name 子节点名称
	* @returns 匹配的子节点数组
	*
	* 用法：
	* ```typescript
	* const allStatements = cst.getChildren('Statement')
	* ```
	*/
	getChildren(name) {
		if (!this.children) return [];
		return this.children.filter((c) => c.name === name);
	}
	/**
	* 获取指定名称的 token 节点
	*
	* @param tokenName Token 名称
	* @returns 匹配的 token 节点，如果不存在返回 undefined
	*
	* 用法：
	* ```typescript
	* const identifier = cst.getToken('Identifier')
	* console.log(identifier?.value)
	* ```
	*/
	getToken(tokenName) {
		if (!this.children) return void 0;
		return this.children.find((c) => c.name === tokenName && c.value !== void 0);
	}
	/**
	* 检查是否有指定名称的子节点
	*
	* @param name 子节点名称
	* @returns 如果存在返回 true，否则返回 false
	*
	* 用法：
	* ```typescript
	* if (cst.hasChild('ElseClause')) {
	*   // 处理 else 分支
	* }
	* ```
	*/
	hasChild(name) {
		if (!this.children) return false;
		return this.children.some((c) => c.name === name);
	}
	/**
	* 获取子节点数量
	*/
	get childCount() {
		return this.children?.length || 0;
	}
	/**
	* 是否为叶子节点（token 节点）
	*/
	get isToken() {
		return this.value !== void 0;
	}
	/**
	* 是否为空节点（无子节点）
	*/
	get isEmpty() {
		return !this.children || this.children.length === 0;
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiError.ts
/**
* 解析错误类
*
* 设计理念：
* - 清晰的视觉层次
* - 关键信息突出显示
* - 智能修复建议（只保留最常见的场景）
*
* 参考：Rust compiler error messages
*/
var ParsingError = class extends Error {
	constructor(message, details, useDetailed = true) {
		super(message);
		this.name = "ParsingError";
		this.type = details.type || "parsing";
		this.expected = details.expected;
		this.found = details.found;
		this.position = details.position;
		this.ruleStack = Object.freeze([...details.ruleStack]);
		this.loopRuleName = details.loopRuleName;
		this.loopDetectionSet = details.loopDetectionSet ? Object.freeze([...details.loopDetectionSet]) : void 0;
		this.loopCstDepth = details.loopCstDepth;
		this.loopCacheStats = details.loopCacheStats;
		this.loopTokenContext = details.loopTokenContext ? Object.freeze([...details.loopTokenContext]) : void 0;
		this.hint = details.hint;
		this.rulePath = details.rulePath;
		this.useDetailed = useDetailed;
		if (details.suggestions && details.suggestions.length > 0) this.suggestions = Object.freeze([...details.suggestions]);
		else if (this.type === "parsing" && useDetailed) this.suggestions = Object.freeze(this.generateSuggestions());
		else this.suggestions = Object.freeze([]);
	}
	/**
	* 智能修复建议生成器（简化版）⭐
	* 
	* 只保留最常见的 8 种错误场景：
	* 1. 闭合符号缺失（{} () []）
	* 2. 分号问题
	* 3. 关键字拼写错误
	* 4. 标识符错误
	* 5. EOF 问题
	*/
	generateSuggestions() {
		const suggestions = [];
		const { expected, found } = this;
		if (expected === "RBrace") suggestions.push("💡 可能缺少闭合花括号 }");
		else if (expected === "RParen") suggestions.push("💡 可能缺少闭合括号 )");
		else if (expected === "RBracket") suggestions.push("💡 可能缺少闭合方括号 ]");
		else if (expected === "Semicolon") suggestions.push("💡 可能缺少分号 ;");
		else if (found?.tokenName === "Semicolon" && expected !== "Semicolon") suggestions.push("💡 意外的分号");
		else if (expected.endsWith("Tok") && found?.tokenName === "Identifier") {
			const keyword = expected.replace("Tok", "").toLowerCase();
			suggestions.push(`💡 期望关键字 "${keyword}"，检查是否拼写错误`);
		} else if (expected === "Identifier") {
			if (found?.tokenName === "Number") suggestions.push("💡 变量名不能以数字开头");
			else if (found?.tokenName?.endsWith("Tok")) {
				const keyword = found.tokenName.replace("Tok", "").toLowerCase();
				suggestions.push(`💡 "${keyword}" 是保留关键字，不能用作标识符`);
			}
		}
		if (!found || found.tokenName === "EOF") suggestions.push("💡 代码意外结束，检查是否有未闭合的括号、花括号或引号");
		return suggestions.slice(0, 3);
	}
	/**
	* 格式化错误信息（根据类型和模式选择）⭐
	*/
	toString() {
		if (this.type === "or-branch-shadowing") return this.toOrBranchShadowingString();
		if (this.type === "left-recursion" || this.type === "infinite-loop") return this.toLoopDetailedString();
		return this.useDetailed ? this.toDetailedString() : this.toSimpleString();
	}
	/**
	* 详细格式（Rust 风格 + 智能建议）
	*/
	toDetailedString() {
		const lines = [];
		lines.push("❌ Parsing Error");
		lines.push("");
		lines.push(`Token[${this.position.tokenIndex}]: ${this.found?.tokenName || "EOF"} @ line ${this.position.line}:${this.position.column} (pos ${this.position.codeIndex})`);
		lines.push("");
		lines.push(`Expected: ${this.expected}`);
		lines.push(`Found:    ${this.found?.tokenName || "EOF"}`);
		if (this.ruleStack.length > 0) {
			lines.push("");
			lines.push("Rule stack:");
			const visible = this.ruleStack.slice(-5);
			const hidden = this.ruleStack.length - visible.length;
			if (hidden > 0) lines.push(`  ... (${hidden} more)`);
			visible.forEach((rule, i) => {
				const prefix = i === visible.length - 1 ? "└─>" : "├─>";
				lines.push(`  ${prefix} ${rule}`);
			});
		}
		if (this.suggestions.length > 0) {
			lines.push("");
			lines.push("Suggestions:");
			this.suggestions.forEach((suggestion) => {
				lines.push(`  ${suggestion}`);
			});
		}
		return lines.join("\n");
	}
	/**
	* 简单格式（基本信息）
	*/
	toSimpleString() {
		return `Parsing Error at token[${this.position.tokenIndex}] line ${this.position.line}:${this.position.column}: Expected ${this.expected}, found ${this.found?.tokenName || "EOF"}`;
	}
	/**
	* 简洁格式（用于日志）
	*/
	toShortString() {
		return this.toSimpleString();
	}
	/**
	* 格式化左递归路径（更清晰的显示）
	*/
	formatLeftRecursionPath(lines) {
		if (!this.loopRuleName || this.ruleStack.length === 0) return;
		let firstRecursionIndex = -1;
		let recursiveRuleName = this.loopRuleName;
		const ruleCounts = /* @__PURE__ */ new Map();
		for (let i = 0; i < this.ruleStack.length; i++) {
			const rule = this.ruleStack[i];
			const count = (ruleCounts.get(rule) || 0) + 1;
			ruleCounts.set(rule, count);
			if (count === 2 && firstRecursionIndex === -1) {
				firstRecursionIndex = this.ruleStack.indexOf(rule);
				recursiveRuleName = rule;
			}
		}
		if (firstRecursionIndex === -1) {
			lines.push(`  完整调用栈:`);
			this.ruleStack.forEach((rule, i) => {
				lines.push(`    ${i + 1}. ${rule}`);
			});
			return;
		}
		const recursionPath = this.ruleStack.slice(firstRecursionIndex);
		const pathType = recursionPath.length === 1 ? "直接左递归" : "间接左递归";
		lines.push(`  类型: ${pathType}`);
		lines.push(`  循环规则: ${recursiveRuleName}`);
		lines.push(`  路径: ${recursionPath.join(" → ")} → ${recursiveRuleName} ⚠️`);
		lines.push("");
		lines.push("  详细调用栈:");
		recursionPath.forEach((rule, i) => {
			const marker = i === 0 ? " ← 首次调用" : rule === recursiveRuleName ? " ← 循环" : "";
			lines.push(`    ${i + 1}. ${rule}${marker}`);
		});
		lines.push(`    ${recursionPath.length + 1}. ${recursiveRuleName} ⚠️ 循环点`);
	}
	/**
	* 循环错误详细格式⭐
	* 
	* 展示信息：
	* - 循环规则名和位置
	* - 当前 token 信息
	* - 完整规则调用栈
	* - 循环检测集合内容
	* - CST 栈深度
	* - 缓存统计（可选）
	* - Token 上下文（可选）
	* - 修复建议
	*/
	toLoopDetailedString() {
		const lines = [];
		lines.push(`❌ 检测到${this.type === "left-recursion" ? "左递归" : "无限循环"}`);
		lines.push("");
		lines.push(`规则 "${this.loopRuleName}" 在 token[${this.position.tokenIndex}] 处重复调用自己`);
		lines.push(`Token[${this.position.tokenIndex}]: ${this.found?.tokenName || "EOF"}("${this.found?.tokenValue || ""}") @ line ${this.position.line}:${this.position.column}`);
		lines.push("");
		if (this.rulePath) {
			lines.push("规则路径:");
			lines.push(this.rulePath);
			lines.push("");
		} else if (this.ruleStack.length > 0) if (this.type === "left-recursion") {
			lines.push("左递归路径:");
			this.formatLeftRecursionPath(lines);
			lines.push("");
		} else {
			lines.push("规则调用栈:");
			const visible = this.ruleStack.slice(-8);
			const hidden = this.ruleStack.length - visible.length;
			if (hidden > 0) lines.push(`  ... (隐藏 ${hidden} 层)`);
			visible.forEach((rule, i) => {
				const isLast = i === visible.length - 1;
				const prefix = "  " + "  ".repeat(i) + (isLast ? "└─>" : "├─>");
				lines.push(`${prefix} ${rule}`);
			});
			lines.push(`  ${"  ".repeat(visible.length)}└─> ${this.loopRuleName} ⚠️ 循环点`);
			lines.push("");
		}
		lines.push("诊断信息:");
		lines.push(`  • CST 栈深度: ${this.loopCstDepth}`);
		if (this.loopDetectionSet) {
			lines.push(`  • 循环检测点: ${this.loopDetectionSet.length} 个`);
			if (this.loopDetectionSet.length > 0 && this.loopDetectionSet.length <= 10) lines.push(`    ${this.loopDetectionSet.join(", ")}`);
			else if (this.loopDetectionSet.length > 10) lines.push(`    ${this.loopDetectionSet.slice(0, 10).join(", ")} ...`);
		}
		if (this.loopCacheStats) {
			lines.push(`  • 缓存命中率: ${this.loopCacheStats.hitRate} (${this.loopCacheStats.hits} hits / ${this.loopCacheStats.misses} misses)`);
			lines.push(`  • 缓存大小: ${this.loopCacheStats.currentSize}`);
		}
		if (this.loopTokenContext && this.loopTokenContext.length > 0) {
			lines.push("");
			lines.push("Token 上下文:");
			this.loopTokenContext.forEach((token) => {
				const marker = token === this.found ? " <-- 当前位置" : "";
				lines.push(`  ${token.tokenName}("${token.tokenValue}")${marker}`);
			});
		}
		if (this.hint) {
			lines.push("💡 提示:");
			lines.push(`  ${this.hint}`);
			lines.push("");
		}
		lines.push("");
		lines.push("⚠️ PEG 解析器无法直接处理左递归。");
		lines.push("请重构语法以消除左递归。");
		lines.push("");
		lines.push("示例:");
		lines.push("  ❌ 错误:  Expression → Expression '+' Term | Term");
		lines.push("  ✅ 正确:  Expression → Term ('+' Term)*");
		lines.push("");
		lines.push("常见模式:");
		lines.push("  • 左递归:       A → A 'x' | 'y'          →  改为: A → 'y' ('x')*");
		lines.push("  • 间接左递归:   A → B, B → C, C → A      →  需要手动展开或重构");
		lines.push("  • 循环依赖:     A → B, B → A             →  检查是否有空匹配分支");
		return lines.join("\n");
	}
	/**
	* Or 分支遮蔽错误格式化（详细版）
	*/
	toOrBranchShadowingString() {
		const lines = [];
		lines.push("");
		lines.push("=".repeat(80));
		lines.push("❌ 检测到 Or 分支遮蔽问题");
		lines.push("=".repeat(80));
		lines.push(`规则 "${this.loopRuleName}" 在 token[${this.position.tokenIndex}] 处重复调用自己`);
		lines.push(`Token[${this.position.tokenIndex}]: ${this.found?.tokenName}("${this.found?.tokenValue}") @ line ${this.position.line}:${this.position.column}`);
		lines.push("");
		if (this.ruleStack.length > 0) {
			lines.push("规则调用栈:");
			this.ruleStack.forEach((rule, index) => {
				const marker = index === this.ruleStack.length - 1 ? " <-- 当前规则" : "";
				lines.push(`  [${index}] ${rule}${marker}`);
			});
			lines.push("");
		}
		if (this.loopTokenContext && this.loopTokenContext.length > 0) {
			lines.push("Token 上下文:");
			this.loopTokenContext.forEach((token) => {
				const marker = token === this.found ? " <-- 当前位置" : "";
				lines.push(`  ${token.tokenName}("${token.tokenValue}")${marker}`);
			});
			lines.push("");
		}
		if (this.hint) {
			lines.push("💡 提示:");
			lines.push(`  ${this.hint}`);
			lines.push("");
		}
		lines.push("");
		lines.push("⚠️ 这不是左递归问题，而是 Or 分支遮蔽问题！");
		lines.push("");
		lines.push("问题原因:");
		lines.push("  在 PEG 中，Or 是顺序选择（Ordered Choice）：");
		lines.push("  - 第一个匹配的分支会立即返回");
		lines.push("  - 如果前面的分支\"部分匹配\"了输入，后面的分支永远无法尝试");
		lines.push("  - 这导致某些输入无法正确解析");
		lines.push("");
		lines.push("示例:");
		lines.push("  ❌ 错误顺序:");
		lines.push("    LeftHandSideExpression → NewExpression | CallExpression");
		lines.push("    // NewExpression 包含 MemberExpression");
		lines.push("    // CallExpression 也包含 MemberExpression，但还有 Arguments");
		lines.push("    // NewExpression 会先匹配 \"console.log\"，导致 CallExpression 无法匹配 \"console.log(...)\"");
		lines.push("");
		lines.push("  ✅ 正确顺序:");
		lines.push("    LeftHandSideExpression → CallExpression | NewExpression");
		lines.push("    // 先尝试更长的规则（CallExpression）");
		lines.push("    // 再尝试更短的规则（NewExpression）");
		lines.push("");
		lines.push("修复方法:");
		lines.push("  1. 调整 Or 分支顺序：将更具体、更长的规则放在前面");
		lines.push("  2. 确保前面的分支不会\"遮蔽\"后面的分支");
		lines.push("  3. 如果两个分支有包含关系，将\"更大\"的分支放在前面");
		return lines.join("\n");
	}
};
/**
* Subhuti 错误处理器
* 
* 管理错误创建和格式化
*/
var SubhutiErrorHandler = class {
	constructor() {
		this.enableDetailedErrors = true;
	}
	/**
	* 设置是否启用详细错误
	* 
	* @param enable - true: 详细错误（Rust风格+建议），false: 简单错误
	*/
	setDetailed(enable) {
		this.enableDetailedErrors = enable;
	}
	/**
	* 创建解析错误
	* 
	* @param details - 错误详情
	* @returns ParsingError 实例
	*/
	createError(details) {
		return new ParsingError(`Expected ${details.expected}`, details, this.enableDetailedErrors);
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiDebugRuleTracePrint.ts
/**
* SubhutiDebugRuleTracePrint - 规则路径输出工具类
*
* 职责：
* - 负责规则执行路径的格式化输出
* - 处理规则链的折叠显示
* - 计算缩进和显示深度
* - 生成 Or 分支标记
*
* 设计：
* - 纯静态方法，无实例状态
* - 直接基于 RuleStackItem[] 进行输出
* - 可以修改传入的状态对象（副作用）
* - 直接输出到控制台
*
* 配置：
* - showRulePath: 控制是否输出规则执行路径（默认 true）
*/
let _showRulePath = true;
/**
* 设置是否显示规则执行路径
* @param show - true 显示，false 不显示
*/
function setShowRulePath(show) {
	_showRulePath = show;
}
/**
* 树形输出格式化辅助类
*
* 提供统一的格式化工具方法供调试工具使用
*
* 核心功能：
* 1. formatLine - 统一的行输出格式化（自动处理缩进、拼接、过滤空值）
* 2. formatTokenValue - Token 值转义和截断
* 3. formatLocation - 位置信息格式化
* 4. formatRuleChain - 规则链拼接
*/
var TreeFormatHelper = class {
	/**
	* 格式化一行输出
	*
	* @param parts - 内容数组（null/undefined/'' 会被自动过滤）
	* @param options - 配置选项
	*/
	static formatLine(content, options) {
		return (options.prefix ?? "  ".repeat(options.depth ?? 0)) + content;
	}
	static contentJoin(parts) {
		return parts.filter((p) => p !== null && p !== void 0 && p !== "");
	}
	/**
	* 格式化 Token 值（处理特殊字符和长度限制）
	*
	* @param value - 原始值
	* @param maxLength - 最大长度（超过则截断）
	*/
	static formatTokenValue(value, maxLength = 40) {
		let escaped = value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
		if (escaped.length > maxLength) escaped = escaped.slice(0, maxLength) + "...";
		return escaped;
	}
	/**
	* 格式化位置信息
	*
	* @param loc - 位置对象 {start: {line, column}, end: {line, column}}
	*/
	static formatLocation(loc) {
		if (!loc?.start || !loc?.end) return "";
		const startLine = loc.start.line;
		const startCol = loc.start.column;
		const endLine = loc.end.line;
		const endCol = loc.end.column;
		if (startLine === endLine) return `[${startLine}:${startCol}-${endCol}]`;
		else return `[${startLine}:${startCol}-${endLine}:${endCol}]`;
	}
	/**
	* 格式化规则链（用于折叠显示）
	*
	* @param rules - 规则名数组
	* @param separator - 分隔符（默认 " > "）
	*/
	static formatRuleChain(rules, separator = " > ") {
		return rules.join(separator);
	}
};
var SubhutiDebugRuleTracePrint = class SubhutiDebugRuleTracePrint {
	/**
	* 统一的 Or 标记格式化方法
	* 所有字符串拼接都在这里处理
	*
	* @param item - 规则栈项
	* @returns 显示后缀（如 "" / " [Or]" / " [Or #1/3]"）
	*/
	static formatOrSuffix(item) {
		if (item.orBranchInfo) {
			const info = item.orBranchInfo;
			if (info.isOrEntry) return " [Or]";
			else if (info.isOrBranch) return ` [Or #${info.branchIndex + 1}/${info.totalBranches}]`;
			else return `错误`;
		}
		return "";
	}
	/**
	* 判断是否是 Or 相关节点
	*/
	static isOrEntry(item) {
		return item.orBranchInfo?.isOrEntry;
	}
	static getPrintToken(tokenItem, location) {
		const value = TreeFormatHelper.formatTokenValue(tokenItem.tokenValue || "", 20);
		if (tokenItem.tokenSuccess) return [
			"✅",
			"Consume",
			`token[${tokenItem.tokenIndex}]`,
			value,
			"-",
			`<${tokenItem.tokenName}>`,
			location || "[]"
		].join(" ");
		else return [
			"❌",
			`token[${tokenItem.tokenIndex}]`,
			"Expect:",
			tokenItem.tokenExpectName,
			"-",
			"Get:",
			value,
			"-",
			`<${tokenItem.tokenName}>`
		].join(" ");
	}
	/**
	* 格式化一行（返回字符串）
	*/
	static formatLine(str, depth, symbol = "└─") {
		return TreeFormatHelper.formatLine(str, { prefix: "│  ".repeat(depth) + symbol });
	}
	static consoleLog(...strs) {
		if (!_showRulePath) return;
		console.log(...strs);
	}
	/**
	* 非缓存场景：格式化待处理的规则日志（返回字符串数组）
	* 特点：只有一次断链，只有一个折叠段
	*
	* 【设计思路】
	* 1. 不需要提前标记 shouldBreakLine
	* 2. 遍历时直接判断是否到达断点
	* 3. 到达断点前：积累到折叠链
	* 4. 到达断点后：逐个输出并赋值 shouldBreakLine = true
	*/
	static formatPendingOutputs_NonCache_Impl(ruleStack) {
		if (!ruleStack.length) throw new Error("系统错误：ruleStack 为空");
		const allLines = [];
		let unOutputIndex = ruleStack.findIndex((item) => !item.outputted);
		if (unOutputIndex < 0) unOutputIndex = ruleStack.length;
		let pendingRules = ruleStack.slice(unOutputIndex);
		const lastOutputted = ruleStack[unOutputIndex - 1];
		let baseDepth = 0;
		if (lastOutputted) baseDepth = lastOutputted.displayDepth;
		let lastOrIndex = [...pendingRules].reverse().findIndex((item) => !!item.orBranchInfo?.isOrEntry);
		const breakPoint = Math.max(lastOrIndex + 1, 2);
		if (breakPoint < pendingRules.length - 1) {
			const singleRules = pendingRules.splice(-breakPoint);
			const groups = [];
			let currentGroup = [pendingRules[0]];
			groups.push(currentGroup);
			for (let i = 1; i < pendingRules.length; i++) {
				const item = pendingRules[i];
				const prevItem = pendingRules[i - 1];
				if (item.shouldBreakLine === prevItem.shouldBreakLine) currentGroup.push(item);
				else {
					currentGroup = [item];
					groups.push(currentGroup);
				}
			}
			for (const group of groups) if (group[0].shouldBreakLine) {
				const result$1 = this.formatMultipleSingleRule(group, baseDepth);
				allLines.push(...result$1.lines);
				baseDepth = result$1.depth;
			} else {
				baseDepth++;
				const lines = this.formatChainRule(group, baseDepth);
				allLines.push(...lines);
			}
			const result = this.formatMultipleSingleRule(singleRules, baseDepth);
			allLines.push(...result.lines);
		} else {
			const result = this.formatMultipleSingleRule(pendingRules, baseDepth);
			allLines.push(...result.lines);
		}
		return allLines;
	}
	/**
	* 非缓存场景：输出待处理的规则日志（直接输出到控制台）
	*/
	static flushPendingOutputs_NonCache_Impl(ruleStack) {
		this.formatPendingOutputs_NonCache_Impl(ruleStack).forEach((line) => this.consoleLog(line));
		return ruleStack[ruleStack.length - 1]?.displayDepth || 0;
	}
	static flushPendingOutputs_Cache_Impl(ruleStack) {
		let pendingRules = ruleStack.filter((item) => !item.outputted);
		if (pendingRules.length === 0) throw new Error("不该触发没有规则场景");
		const groups = [];
		let currentGroup = [pendingRules[0]];
		groups.push(currentGroup);
		for (let i = 1; i < pendingRules.length; i++) {
			const item = pendingRules[i];
			const prevItem = pendingRules[i - 1];
			if (item.shouldBreakLine === prevItem.shouldBreakLine) currentGroup.push(item);
			else {
				currentGroup = [item];
				groups.push(currentGroup);
			}
		}
		for (const group of groups) if (group[0].shouldBreakLine) this.printMultipleSingleRule(group);
		else this.printChainRule(group);
	}
	/**
	* 格式化折叠链（返回字符串数组）
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static formatChainRule(rules, depth = rules[0].displayDepth) {
		if (!rules.length) throw new Error("系统错误");
		const names = rules.map((r) => SubhutiDebugRuleTracePrint.getRuleItemLogContent(r));
		const displayNames = names.length > 4 ? [
			...names.slice(0, 2),
			"...",
			...names.slice(-2)
		] : names;
		const line = SubhutiDebugRuleTracePrint.formatLine(displayNames.join(" > "), depth, "├─");
		rules.forEach((r) => {
			r.displayDepth = depth;
			r.outputted = true;
		});
		return [line];
	}
	/**
	* 打印折叠链（直接输出到控制台）
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static printChainRule(rules, depth = rules[0].displayDepth) {
		this.formatChainRule(rules, depth).forEach((line) => this.consoleLog(line));
	}
	/**
	* 格式化单独规则（返回字符串数组）
	* 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
	*
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static formatMultipleSingleRule(rules, depth = rules[0].displayDepth) {
		const lines = [];
		rules.forEach((item, index) => {
			depth++;
			const isLast = index === rules.length - 1;
			if (!item.isManuallyAdded) item.displayDepth = depth;
			let branch = isLast ? "└─" : "├─";
			let printStr = this.getRuleItemLogContent(item);
			const line = SubhutiDebugRuleTracePrint.formatLine(printStr, item.displayDepth, branch);
			lines.push(line);
			item.outputted = true;
		});
		return {
			lines,
			depth
		};
	}
	/**
	* 打印单独规则（直接输出到控制台）
	* 注意：传入的 rules 数组通常只有 1 个元素（单独显示的规则）
	*
	* @param rules
	* @param depth 兼容非缓存和缓存，
	*/
	static printMultipleSingleRule(rules, depth = rules[0].displayDepth) {
		const result = this.formatMultipleSingleRule(rules, depth);
		result.lines.forEach((line) => this.consoleLog(line));
		return result.depth;
	}
	static getRuleItemLogContent(tokenItem) {
		let res = "错误";
		if (tokenItem.orBranchInfo) {
			const branchInfo = tokenItem.orBranchInfo;
			if (tokenItem.orBranchInfo.isOrEntry) res = "🔀 " + tokenItem.ruleName + "(Or)";
			else if (tokenItem.orBranchInfo.isOrBranch) res = `[Branch #${branchInfo.branchIndex + 1}](${tokenItem.ruleName})`;
		} else if (tokenItem.tokenExpectName) res = SubhutiDebugRuleTracePrint.getPrintToken(tokenItem);
		else res = tokenItem.ruleName;
		if (tokenItem.isManuallyAdded) res += ` ⚡[Cached]`;
		return res;
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiDebug.ts
/**
* Subhuti 调试工具集
*
* 职责：
* - 提供独立的调试工具（无状态）
* - CST 分析、Token 验证、高级调试方法
*
* 使用场景：
* - 测试脚本直接调用
* - 外部工具集成
* - 自定义验证逻辑
*
* @version 4.0.0 - 职责分离
* @date 2025-11-06
*/
var SubhutiDebugUtils = class SubhutiDebugUtils {
	/**
	* 收集 CST 中的所有 token 值
	*
	* @param node - CST 节点
	* @returns token 值数组
	*
	* @example
	* ```typescript
	* const cst = parser.Script()
	* const tokens = SubhutiDebugUtils.collectTokens(cst)
	* console.log(tokens)  // ['const', 'obj', '=', '{', 'sum', ':', '5', '+', '6', '}']
	* ```
	*/
	static collectTokens(node$1) {
		const values = [];
		if (!node$1) return values;
		if (node$1.value !== void 0 && (!node$1.children || node$1.children.length === 0)) values.push(node$1.value);
		if (node$1.children && Array.isArray(node$1.children)) for (const child of node$1.children) values.push(...SubhutiDebugUtils.collectTokens(child));
		return values;
	}
	/**
	* 验证 CST 的 token 完整性
	*
	* @param cst - CST 节点
	* @param inputTokens - 输入 token 数组或 token 值数组
	* @returns 验证结果
	*
	* @example
	* ```typescript
	* const result = SubhutiDebugUtils.validateTokenCompleteness(cst, tokens)
	* if (result.complete) {
	*     console.log('✅ Token 完整')
	* } else {
	*     console.log('❌ 缺失:', result.missing)
	* }
	* ```
	*/
	static validateTokenCompleteness(cst, inputTokens) {
		const inputValues = inputTokens.map((t) => typeof t === "string" ? t : t.tokenValue || "").filter((v) => v !== "");
		const cstTokens = SubhutiDebugUtils.collectTokens(cst);
		const missing = [];
		for (let i = 0; i < inputValues.length; i++) if (i >= cstTokens.length || inputValues[i] !== cstTokens[i]) missing.push(inputValues[i]);
		return {
			complete: missing.length === 0 && inputValues.length === cstTokens.length,
			inputCount: inputValues.length,
			cstCount: cstTokens.length,
			inputTokens: inputValues,
			cstTokens,
			missing
		};
	}
	/**
	* 验证 CST 结构完整性
	*
	* @param node - CST 节点
	* @param path - 节点路径（用于错误报告）
	* @returns 错误列表
	*/
	static validateStructure(node$1, path$1 = "root") {
		const errors = [];
		if (node$1 === null) {
			errors.push({
				path: path$1,
				issue: "Node is null"
			});
			return errors;
		}
		if (node$1 === void 0) {
			errors.push({
				path: path$1,
				issue: "Node is undefined"
			});
			return errors;
		}
		if (!node$1.name && node$1.value === void 0) errors.push({
			path: path$1,
			issue: "Node has neither name nor value",
			node: {
				...node$1,
				children: node$1.children ? `[${node$1.children.length} children]` : void 0
			}
		});
		if (node$1.children !== void 0) {
			if (!Array.isArray(node$1.children)) {
				errors.push({
					path: path$1,
					issue: `children is not an array (type: ${typeof node$1.children})`,
					node: {
						name: node$1.name,
						childrenType: typeof node$1.children
					}
				});
				return errors;
			}
			node$1.children.forEach((child, index) => {
				const childPath = `${path$1}.children[${index}]`;
				if (child === null) {
					errors.push({
						path: childPath,
						issue: "Child is null"
					});
					return;
				}
				if (child === void 0) {
					errors.push({
						path: childPath,
						issue: "Child is undefined"
					});
					return;
				}
				const childErrors = SubhutiDebugUtils.validateStructure(child, childPath);
				errors.push(...childErrors);
			});
		}
		if (node$1.value !== void 0 && node$1.children && node$1.children.length > 0) errors.push({
			path: path$1,
			issue: `Leaf node has both value and non-empty children`,
			node: {
				name: node$1.name,
				value: node$1.value,
				childrenCount: node$1.children.length
			}
		});
		return errors;
	}
	/**
	* 获取 CST 统计信息
	*
	* @param node - CST 节点
	* @returns 统计信息
	*/
	static getCSTStatistics(node$1) {
		const stats = {
			totalNodes: 0,
			leafNodes: 0,
			maxDepth: 0,
			nodeTypes: /* @__PURE__ */ new Map()
		};
		const traverse = (node$2, depth) => {
			if (!node$2) return;
			stats.totalNodes++;
			stats.maxDepth = Math.max(stats.maxDepth, depth);
			if (node$2.name) stats.nodeTypes.set(node$2.name, (stats.nodeTypes.get(node$2.name) || 0) + 1);
			if (!node$2.children || node$2.children.length === 0) stats.leafNodes++;
			else for (const child of node$2.children) traverse(child, depth + 1);
		};
		traverse(node$1, 0);
		return stats;
	}
	/**
	* 格式化 CST 为树形结构字符串
	*
	* @param cst - CST 节点
	* @param prefix - 前缀（递归使用）
	* @param isLast - 是否为最后一个子节点（递归使用）
	* @returns 树形结构字符串
	*/
	static formatCst(cst, prefix = "", isLast = true) {
		const lines = [];
		const connector = isLast ? "└─" : "├─";
		const nodeLine = SubhutiDebugUtils.formatNode(cst, prefix, connector);
		lines.push(nodeLine);
		if (cst.children && cst.children.length > 0) {
			const childPrefix = prefix + (isLast ? "   " : "│  ");
			cst.children.forEach((child, index) => {
				const isLastChild = index === cst.children.length - 1;
				lines.push(SubhutiDebugUtils.formatCst(child, childPrefix, isLastChild));
			});
		}
		return lines.join("\n");
	}
	/**
	* 格式化单个节点（使用 TreeFormatHelper）
	*/
	static formatNode(cst, prefix, connector) {
		if (cst.value !== void 0) {
			const value = TreeFormatHelper.formatTokenValue(cst.value);
			const location = cst.loc ? TreeFormatHelper.formatLocation(cst.loc) : null;
			return TreeFormatHelper.formatLine([
				connector,
				cst.name + ":",
				`"${value}"`,
				location
			].join(""), { prefix });
		} else return TreeFormatHelper.formatLine([connector, cst.name].join(""), { prefix });
	}
	/**
	* 二分增量调试 - 从最底层规则逐层测试到顶层
	*
	* 这是一个强大的调试工具，用于快速定位问题层级。
	* 它会从最底层规则开始逐层测试，直到找到第一个失败的层级。
	*
	* @param tokens - 输入 token 流
	* @param ParserClass - Parser 类（构造函数）
	* @param levels - 测试层级配置（从底层到顶层）
	* @param options - 可选配置
	* @param options.enableDebugOnLastLevel - 是否在最后一层启用 debug（默认 true）
	* @param options.stopOnFirstError - 遇到第一个错误时停止（默认 true）
	* @param options.showStackTrace - 显示堆栈跟踪（默认 true）
	* @param options.stackTraceLines - 堆栈跟踪显示行数（默认 10）
	*
	* @example
	* ```typescript
	* import { SubhutiDebugUtils } from 'subhuti/src/SubhutiDebug'
	* import Es2025Parser from './Es2025Parser'
	*
	* const tokens = lexer.tokenize("let count = 1")
	*
	* SubhutiDebugUtils.bisectDebug(tokens, Es2025Parser, [
	*     { name: 'LexicalDeclaration', call: (p) => p.LexicalDeclaration({In: true}) },
	*     { name: 'Declaration', call: (p) => p.Declaration() },
	*     { name: 'StatementListItem', call: (p) => p.StatementListItem() },
	*     { name: 'Script', call: (p) => p.Script() }
	* ], { enableDebugOnLastLevel: false })
	* ```
	*/
	static bisectDebug(tokens, ParserClass, levels, options) {
		const opts = {
			enableDebugOnLastLevel: true,
			stopOnFirstError: true,
			showStackTrace: true,
			stackTraceLines: 10,
			...options
		};
		console.log("\n🔬 二分增量调试模式");
		console.log("=".repeat(80));
		console.log("策略：从最底层规则逐层测试，找出问题层级\n");
		for (let i = 0; i < levels.length; i++) {
			const level = levels[i];
			console.log(`\n[${"▸".repeat(i + 1)}] 测试层级 ${i + 1}: ${level.name}`);
			console.log("-".repeat(80));
			try {
				const parser = new ParserClass(tokens);
				if (opts.enableDebugOnLastLevel && i === levels.length - 1) {
					if (typeof parser.debug === "function") parser.debug();
				}
				const result = level.call(parser);
				if (!result) {
					console.log(`\n⚠️ ${level.name} 返回 undefined`);
					continue;
				}
				const validation = SubhutiDebugUtils.validateTokenCompleteness(result, tokens);
				if (validation.complete) console.log(`\n✅ ${level.name} 解析成功（Token完整: ${validation.cstCount}/${validation.inputCount}）`);
				else {
					console.log(`\n❌ ${level.name} Token不完整`);
					console.log(`   输入tokens: ${validation.inputCount} 个`);
					console.log(`   CST tokens:  ${validation.cstCount} 个`);
					console.log(`   输入列表: [${validation.inputTokens.join(", ")}]`);
					console.log(`   CST列表:  [${validation.cstTokens.join(", ")}]`);
					if (validation.missing.length > 0) console.log(`   ❌ 缺失或错位: [${validation.missing.join(", ")}]`);
					console.log(`\n🔍 问题定位: ${level.name} 未能消费所有token`);
					if (i > 0) {
						console.log(`   ⚠️ 前一层级（${levels[i - 1].name}）也可能有问题`);
						console.log(`   💡 建议: 检查 ${level.name} 和 ${levels[i - 1].name} 的实现`);
					} else console.log(`   💡 建议: 检查 ${level.name} 的实现，确保所有token都被正确处理`);
					if (opts.stopOnFirstError) return;
				}
			} catch (error) {
				console.log(`\n❌ ${level.name} 解析失败`);
				console.log(`   错误: ${error.message}`);
				console.log(`\n🔍 问题定位: ${level.name} 层级出现错误`);
				if (i > 0) {
					console.log(`   ✅ 前一层级（${levels[i - 1].name}）可以工作`);
					console.log(`   ❌ 当前层级（${level.name}）出现问题`);
					console.log(`\n💡 建议: 检查 ${level.name} 的实现，特别是它如何调用 ${levels[i - 1].name}`);
				} else {
					console.log(`   ❌ 最底层规则（${level.name}）就已经失败`);
					console.log(`\n💡 建议: 检查 ${level.name} 的实现和 token 定义`);
				}
				if (opts.showStackTrace && error.stack) {
					console.log(`\n📋 堆栈跟踪（前${opts.stackTraceLines}行）:`);
					error.stack.split("\n").slice(0, opts.stackTraceLines).forEach((line) => console.log(`   ${line}`));
				}
				if (opts.stopOnFirstError) return;
			}
		}
		console.log("\n" + "=".repeat(80));
		console.log("🎉 所有层级测试通过！");
		console.log("=".repeat(80));
	}
};
var SubhutiTraceDebugger = class {
	/**
	* 构造函数
	*
	* @param tokens - 输入 token 流（用于完整性检查和位置信息）
	*/
	constructor(tokens) {
		this.ruleStack = [];
		this.stats = /* @__PURE__ */ new Map();
		this.rulePathCache = /* @__PURE__ */ new Map();
		this.inputTokens = [];
		this.topLevelCst = null;
		this.openDebugLogCache = true;
		this.inputTokens = this.extractValidTokens(tokens || []);
	}
	/**
	* 重置调试器状态，为新一轮解析做准备
	*
	* 职责：
	* - 清空旧的规则路径缓存
	* - 清空旧的性能统计
	* - 刷新 token 快照
	*
	* 调用时机：每次顶层规则开始前（由 SubhutiParser 调用）
	*/
	resetForNewParse(tokens) {
		this.rulePathCache.clear();
		this.stats.clear();
		if (tokens) this.inputTokens = this.extractValidTokens(tokens);
	}
	/**
	* 从 token 流中提取有效 token（排除注释、空格等）
	*
	* @returns 完整的 token 对象数组（包含 tokenValue, tokenName, loc 等）
	*/
	extractValidTokens(tokens) {
		const excludeNames = [
			"SingleLineComment",
			"MultiLineComment",
			"Spacing",
			"LineBreak"
		];
		return tokens.filter((t) => {
			const name = t.tokenName || "";
			return excludeNames.indexOf(name) === -1;
		});
	}
	/**
	* 深拷贝 RuleStackItem（手动拷贝每个字段）
	*/
	deepCloneRuleStackItem(item) {
		if (item.ruleName) {
			if (!item.childs.length) throw new Error("系统错误");
		}
		return {
			ruleName: item.ruleName,
			tokenName: item.tokenName,
			tokenValue: item.tokenValue,
			startTime: item.startTime,
			outputted: item.outputted,
			tokenIndex: item.tokenIndex,
			tokenSuccess: item.tokenSuccess,
			tokenExpectName: item.tokenExpectName,
			shouldBreakLine: item.shouldBreakLine,
			displayDepth: item.displayDepth,
			childs: item.childs,
			orBranchInfo: item.orBranchInfo ? {
				orIndex: item.orBranchInfo.orIndex,
				branchIndex: item.orBranchInfo.branchIndex,
				isOrEntry: item.orBranchInfo.isOrEntry,
				isOrBranch: item.orBranchInfo.isOrBranch,
				totalBranches: item.orBranchInfo.totalBranches
			} : void 0
		};
	}
	/**
	* 生成缓存键（包含 Or 节点信息）
	*/
	generateCacheKey(item) {
		return `${item.ruleName}:${item.tokenIndex.toString()}:${item.orBranchInfo ? item.orBranchInfo.isOrEntry ? "1" : "0" : "0"}:${item.orBranchInfo ? item.orBranchInfo.isOrBranch ? "1" : "0" : "0"}:${item.orBranchInfo?.orIndex?.toString() ?? "-1"}:${item.orBranchInfo?.branchIndex?.toString() ?? "-1"}:${item.tokenValue ?? ""}:${item.tokenName ?? ""}:${item.tokenExpectName ?? ""}:${item.tokenSuccess ?? false}`;
	}
	createTokenItem(tokenIndex, tokenValue, tokenName, expectName, success) {
		return {
			ruleName: void 0,
			tokenSuccess: success,
			tokenExpectName: expectName,
			startTime: 0,
			outputted: false,
			tokenIndex,
			shouldBreakLine: true,
			tokenValue,
			tokenName
		};
	}
	/**
	* 从缓存恢复规则路径（递归恢复整个链条）
	*
	* @param cacheKey - 缓存键
	* @param isRoot - 是否是根节点
	* @param OrBranchNeedNewLine - 是否需要单独行，or相关专用
	* @param displayDepth - 父节点的 displayDepth（用于计算当前节点的深度）
	*/
	restoreFromCacheAndPushAndPrint(cacheKey, displayDepth, OrBranchNeedNewLine, isRoot = true) {
		const cached = this.cacheGet(cacheKey);
		if (!cached) throw new Error("系统错误");
		const restoredItem = this.deepCloneRuleStackItem(cached);
		restoredItem.outputted = false;
		restoredItem.isManuallyAdded = true;
		restoredItem.shouldBreakLine = false;
		OrBranchNeedNewLine = false;
		const lastRowShouldBreakLine = this.ruleStack[this.ruleStack.length - 1].shouldBreakLine;
		let tempBreakLine = false;
		if (isRoot) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (OrBranchNeedNewLine) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (restoredItem.tokenExpectName) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (restoredItem.orBranchInfo && restoredItem.orBranchInfo.isOrEntry && restoredItem.childs.length > 1) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
			OrBranchNeedNewLine = true;
		} else if (["UpdateExpression"].indexOf(restoredItem.ruleName) > -1) {
			displayDepth++;
			restoredItem.shouldBreakLine = true;
		} else if (lastRowShouldBreakLine) {
			displayDepth++;
			tempBreakLine = true;
		}
		restoredItem.displayDepth = displayDepth;
		if (OrBranchNeedNewLine && restoredItem.orBranchInfo) OrBranchNeedNewLine = restoredItem.orBranchInfo.isOrBranch || false;
		let childBeginIndex = this.ruleStack.push(restoredItem);
		if (cached.childs) {
			let i = 0;
			for (const childKey of cached.childs) {
				const nextItem = this.restoreFromCacheAndPushAndPrint(childKey, displayDepth, OrBranchNeedNewLine, false);
				if (!isRoot && i === 0 && lastRowShouldBreakLine && !restoredItem.shouldBreakLine && nextItem.shouldBreakLine) {
					this.ruleStack.splice(childBeginIndex);
					if (!tempBreakLine) displayDepth++;
					restoredItem.shouldBreakLine = true;
					restoredItem.displayDepth = displayDepth;
					this.restoreFromCacheAndPushAndPrint(childKey, displayDepth, OrBranchNeedNewLine, false);
				}
				i++;
			}
		}
		if (isRoot) {
			SubhutiDebugRuleTracePrint.flushPendingOutputs_Cache_Impl(this.ruleStack);
			this.ruleStack.splice(childBeginIndex);
		}
		return restoredItem;
	}
	/**
	* 规则进入事件处理器 - 立即建立父子关系版本
	*
	* 流程：
	* 1. 检查缓存命中（缓存命中直接回放）
	* 2. 从栈顶获取父节点（上一行）
	* 3. 立即建立父→子关系
	* 4. 记录当前规则到缓存
	* 5. 推入栈
	*
	* @param ruleName - 规则名称
	* @param tokenIndex - 规则进入时的 token 索引
	*/
	onRuleEnter(ruleName, tokenIndex) {
		const startTime = performance.now();
		let stat = this.stats.get(ruleName);
		if (!stat) {
			stat = {
				ruleName,
				totalCalls: 0,
				actualExecutions: 0,
				cacheHits: 0,
				totalTime: 0,
				executionTime: 0,
				avgTime: 0
			};
			this.stats.set(ruleName, stat);
		}
		stat.totalCalls++;
		const ruleItem = {
			ruleName,
			tokenIndex,
			startTime,
			outputted: false,
			childs: []
		};
		if (this.openDebugLogCache) {
			const cacheKey = this.generateCacheKey(ruleItem);
			if (this.cacheGet(cacheKey)) {
				let depth = SubhutiDebugRuleTracePrint.flushPendingOutputs_NonCache_Impl(this.ruleStack);
				this.restoreFromCacheAndPushAndPrint(cacheKey, depth, false);
				return startTime;
			}
		}
		this.ruleStack.push(ruleItem);
		return startTime;
	}
	onRuleExit(ruleName, cacheHit, startTime) {
		let duration = 0;
		if (startTime !== void 0 && typeof startTime === "number") duration = performance.now() - startTime;
		if (this.ruleStack.length === 0) throw new Error(`❌ Rule exit error: ruleStack is empty when exiting ${ruleName}`);
		const curRule = this.ruleStack.pop();
		if (!curRule || curRule.ruleName !== ruleName) throw new Error(`❌ Rule exit mismatch: expected ${ruleName} at top, got ${curRule?.ruleName || "undefined"}`);
		const stat = this.stats.get(ruleName);
		if (stat) {
			stat.totalTime += duration;
			if (cacheHit) stat.cacheHits++;
			else {
				stat.actualExecutions++;
				stat.executionTime += duration;
				if (stat.actualExecutions > 0) stat.avgTime = stat.executionTime / stat.actualExecutions;
			}
		}
		if (!curRule.outputted) return;
		const cacheKey = this.generateCacheKey(curRule);
		const parentItem = this.ruleStack[this.ruleStack.length - 1];
		if (parentItem) {
			if (!parentItem.childs) throw new Error(`❌ Parent rule ${parentItem.ruleName} does not have childs array when exiting rule ${ruleName}`);
			if (parentItem.childs.some((key) => key === cacheKey)) {
				console.log(`  ❌ 重复检测：规则 ${ruleName} 已存在于父节点的 childs 中`);
				console.log(`  父节点的所有子节点键:`);
				parentItem.childs.forEach((key, idx) => {
					console.log(`    [${idx}] ${key}`);
				});
				throw new Error(`❌ Rule ${ruleName} already exists in parent rule ${parentItem.ruleName}'s childs`);
			}
			this.parentPushChild(parentItem, cacheKey);
		}
		if (!this.cacheGet(cacheKey)) {
			const cloned = this.deepCloneRuleStackItem(curRule);
			this.cacheSet(cacheKey, cloned);
		}
	}
	cacheSet(key, value) {
		if (!value.tokenExpectName) {
			if (!value.childs || value.childs?.length === 0) throw new Error("bugai wei 0");
		}
		this.rulePathCache.set(key, value);
	}
	cacheGet(key) {
		return this.rulePathCache.get(key);
	}
	onTokenConsume(tokenIndex, tokenValue, tokenName, expectName, success) {
		if (this.ruleStack.length === 0) throw new Error(`❌ Token consume error: ruleStack is empty when consuming token ${tokenName}`);
		const parentRule = this.ruleStack[this.ruleStack.length - 1];
		if (!success) {
			if (tokenIndex <= parentRule.tokenIndex) return;
		}
		const tokenItem = this.createTokenItem(tokenIndex, tokenValue, tokenName, expectName, success);
		const tokenKey = this.generateCacheKey(tokenItem);
		if (!this.rulePathCache.has(tokenKey)) this.cacheSet(tokenKey, this.deepCloneRuleStackItem(tokenItem));
		if (!parentRule.childs) throw new Error(`❌ Parent rule ${parentRule.ruleName} does not have childs array when consuming token ${tokenName}`);
		if (parentRule.childs.some((key) => key === tokenKey)) throw new Error(`❌ Token ${tokenName} already exists in parent rule ${parentRule.ruleName}'s childs`);
		this.parentPushChild(parentRule, tokenKey);
		const depth = SubhutiDebugRuleTracePrint.flushPendingOutputs_NonCache_Impl(this.ruleStack);
		const token = this.inputTokens[tokenIndex];
		let location = null;
		if (success) {
			if (token) {
				if (token.loc) location = TreeFormatHelper.formatLocation(token.loc);
				else if (token.rowNum !== void 0 && token.columnStartNum !== void 0) {
					const row = token.rowNum;
					const start = token.columnStartNum;
					location = `[${row}:${start}-${token.columnEndNum ?? start + tokenValue.length - 1}]`;
				}
			}
		}
		const tokenStr = SubhutiDebugRuleTracePrint.getPrintToken(tokenItem, location);
		const line = SubhutiDebugRuleTracePrint.formatLine(tokenStr, depth);
		SubhutiDebugRuleTracePrint.consoleLog(line);
	}
	onOrEnter(parentRuleName, tokenIndex) {
		let orIndex = 0;
		if (this.ruleStack.length > 0) {
			const parentRule = this.ruleStack[this.ruleStack.length - 1];
			if (parentRule.childs) for (const childKey of parentRule.childs) {
				const childItem = this.cacheGet(childKey);
				if (childItem && childItem.orBranchInfo?.isOrEntry) orIndex++;
			}
		}
		this.ruleStack.push({
			ruleName: parentRuleName,
			startTime: performance.now(),
			outputted: false,
			shouldBreakLine: true,
			tokenIndex,
			childs: [],
			orBranchInfo: {
				orIndex,
				isOrEntry: true,
				isOrBranch: false,
				startTokenIndex: tokenIndex,
				branchAttempts: []
			}
		});
	}
	onOrExit(parentRuleName) {
		if (this.ruleStack.length === 0) throw new Error(`❌ Or exit error: ruleStack is empty when exiting Or for ${parentRuleName}`);
		const curOrNode = this.ruleStack.pop();
		if (!(curOrNode.ruleName === parentRuleName && curOrNode.orBranchInfo && curOrNode.orBranchInfo.isOrEntry && !curOrNode.orBranchInfo.isOrBranch)) {
			const orInfo = curOrNode.orBranchInfo ? `(entry=${curOrNode.orBranchInfo.isOrEntry}, branch=${curOrNode.orBranchInfo.isOrBranch})` : "(no orBranchInfo)";
			throw new Error(`❌ Or exit mismatch: expected ${parentRuleName}(OrEntry) at top, got ${curOrNode.ruleName}${orInfo}`);
		}
		if (!curOrNode.outputted) return;
		const cacheKey = this.generateCacheKey(curOrNode);
		const parentItem = this.ruleStack[this.ruleStack.length - 1];
		if (parentItem) {
			if (!parentItem.childs) throw new Error(`❌ Parent rule ${parentItem.ruleName} does not have childs array when exiting Or ${parentRuleName}`);
			if (parentItem.childs.some((key) => key === cacheKey)) throw new Error(`❌ ${cacheKey} Or ${parentRuleName} already exists in parent rule ${parentItem.ruleName}'s childs`);
			this.parentPushChild(parentItem, cacheKey);
		}
		if (!this.cacheGet(cacheKey)) {
			const cloned = this.deepCloneRuleStackItem(curOrNode);
			this.cacheSet(cacheKey, cloned);
		}
	}
	onOrBranch(branchIndex, totalBranches, parentRuleName) {
		const tokenIndex = this.ruleStack.length > 0 ? this.ruleStack[this.ruleStack.length - 1]?.tokenIndex ?? 0 : 0;
		let orIndex = void 0;
		if (this.ruleStack.length > 0) {
			const parentOrEntry = this.ruleStack[this.ruleStack.length - 1];
			if (parentOrEntry.orBranchInfo?.isOrEntry) orIndex = parentOrEntry.orBranchInfo.orIndex;
		}
		this.ruleStack.push({
			ruleName: parentRuleName,
			startTime: performance.now(),
			outputted: false,
			tokenIndex,
			childs: [],
			orBranchInfo: {
				orIndex,
				isOrEntry: false,
				isOrBranch: true,
				branchIndex,
				totalBranches
			}
		});
	}
	onOrBranchExit(parentRuleName, branchIndex) {
		if (this.ruleStack.length === 0) throw new Error(`❌ OrBranch exit error: ruleStack is empty when exiting branch ${branchIndex} for ${parentRuleName}`);
		const curBranchNode = this.ruleStack.pop();
		if (!(curBranchNode.ruleName === parentRuleName && curBranchNode.orBranchInfo && curBranchNode.orBranchInfo.isOrBranch && !curBranchNode.orBranchInfo.isOrEntry && curBranchNode.orBranchInfo.branchIndex === branchIndex)) {
			const info = curBranchNode.orBranchInfo;
			const infoStr = info ? `(entry=${info.isOrEntry}, branch=${info.isOrBranch}, idx=${info.branchIndex})` : "(no orInfo)";
			throw new Error(`❌ OrBranch exit mismatch: expected ${parentRuleName}(branchIdx=${branchIndex}) at top, got ${curBranchNode.ruleName}${infoStr}`);
		}
		if (!curBranchNode.outputted) return;
		const cacheKey = this.generateCacheKey(curBranchNode);
		const parentOrNode = this.ruleStack[this.ruleStack.length - 1];
		if (parentOrNode) {
			if (!parentOrNode.childs) throw new Error(`❌ Parent Or node ${parentOrNode.ruleName} does not have childs array when exiting branch ${branchIndex}`);
			if (parentOrNode.childs.some((key) => key === cacheKey)) throw new Error(`❌ OrBranch ${branchIndex} already exists in parent Or node ${parentOrNode.ruleName}'s childs`);
			this.parentPushChild(parentOrNode, cacheKey);
		}
		if (!this.cacheGet(cacheKey)) {
			const cloned = this.deepCloneRuleStackItem(curBranchNode);
			this.cacheSet(cacheKey, cloned);
		}
	}
	onBacktrack(fromTokenIndex, toTokenIndex) {}
	/**
	* 收集所有 token 值（内部调用 SubhutiDebugUtils）
	*/
	collectTokenValues(node$1) {
		return SubhutiDebugUtils.collectTokens(node$1);
	}
	/**
	* 检查 Token 完整性（内部调用 SubhutiDebugUtils）
	*/
	checkTokenCompleteness(cst) {
		const result = SubhutiDebugUtils.validateTokenCompleteness(cst, this.inputTokens);
		return {
			input: result.inputTokens,
			cst: result.cstTokens,
			missing: result.missing
		};
	}
	/**
	* 验证 CST 结构完整性（内部调用 SubhutiDebugUtils）
	*/
	validateStructure(node$1, path$1 = "root") {
		return SubhutiDebugUtils.validateStructure(node$1, path$1);
	}
	/**
	* 获取 CST 统计信息（内部调用 SubhutiDebugUtils）
	*/
	getCSTStatistics(node$1) {
		return SubhutiDebugUtils.getCSTStatistics(node$1);
	}
	static {
		this.collectTokens = SubhutiDebugUtils.collectTokens;
	}
	static {
		this.validateTokenCompleteness = SubhutiDebugUtils.validateTokenCompleteness;
	}
	/**
	* 获取性能摘要
	*/
	getSummary() {
		const allStats = Array.from(this.stats.values());
		if (allStats.length === 0) return "📊 性能摘要：无数据";
		const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0);
		const totalExecutions = allStats.reduce((sum, s) => sum + s.actualExecutions, 0);
		const totalCacheHits = allStats.reduce((sum, s) => sum + s.cacheHits, 0);
		const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0);
		const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls * 100).toFixed(1) : "0.0";
		const lines = [];
		lines.push("⏱️  性能摘要");
		lines.push("─".repeat(40));
		lines.push(`总耗时: ${totalTime.toFixed(2)}ms`);
		lines.push(`总调用: ${totalCalls.toLocaleString()} 次`);
		lines.push(`实际执行: ${totalExecutions.toLocaleString()} 次`);
		lines.push(`缓存命中: ${totalCacheHits.toLocaleString()} 次 (${cacheHitRate}%)`);
		lines.push("");
		const top5 = allStats.filter((s) => s.actualExecutions > 0).sort((a, b) => b.executionTime - a.executionTime).slice(0, 5);
		if (top5.length > 0) {
			lines.push("Top 5 慢规则:");
			top5.forEach((stat, i) => {
				const avgUs = (stat.avgTime * 1e3).toFixed(1);
				lines.push(`  ${i + 1}. ${stat.ruleName}: ${stat.executionTime.toFixed(2)}ms (${stat.totalCalls}次, 平均${avgUs}μs)`);
			});
		}
		return lines.join("\n");
	}
	/**
	* 设置要展示的 CST（由 Parser 在解析完成后调用）
	*/
	setCst(cst) {
		this.topLevelCst = cst || null;
	}
	parentPushChild(parent, child) {
		parent.childs.push(child);
	}
	/**
	* 自动输出完整调试报告
	*/
	autoOutput() {
		console.log("\n" + "=".repeat(60));
		console.log("🔍 Subhuti Debug 输出");
		console.log("=".repeat(60));
		console.log("\n【第一部分：性能摘要】");
		console.log("─".repeat(60));
		console.log("\n" + this.getSummary());
		console.log("\n📋 所有规则详细统计:");
		Array.from(this.stats.values()).sort((a, b) => b.executionTime - a.executionTime).forEach((stat) => {
			const cacheRate = stat.totalCalls > 0 ? (stat.cacheHits / stat.totalCalls * 100).toFixed(1) : "0.0";
			console.log(`  ${stat.ruleName}: ${stat.totalCalls}次 | 执行${stat.actualExecutions}次 | 耗时${stat.executionTime.toFixed(2)}ms | 缓存${cacheRate}%`);
		});
		console.log("\n" + "=".repeat(60));
		if (this.topLevelCst) {
			console.log("\n【第二部分：CST 验证报告】");
			console.log("─".repeat(60));
			console.log("\n🔍 CST 验证报告");
			console.log("─".repeat(60));
			const structureErrors = this.validateStructure(this.topLevelCst);
			console.log(`\n📌 结构完整性: ${structureErrors.length === 0 ? "✅" : "❌"}`);
			if (structureErrors.length > 0) {
				console.log(`   发现 ${structureErrors.length} 个错误:`);
				structureErrors.forEach((err, i) => {
					console.log(`\n   [${i + 1}] ${err.path}`);
					console.log(`       问题: ${err.issue}`);
					if (err.node) {
						const nodeStr = JSON.stringify(err.node, null, 2).split("\n").map((line) => `       ${line}`).join("\n");
						console.log(nodeStr);
					}
				});
			} else console.log("   无结构错误");
			const tokenResult = this.checkTokenCompleteness(this.topLevelCst);
			console.log(`\n📌 Token 完整性: ${tokenResult.missing.length === 0 ? "✅" : "❌"}`);
			console.log(`   输入 tokens: ${tokenResult.input.length} 个`);
			console.log(`   CST tokens:  ${tokenResult.cst.length} 个`);
			console.log(`   输入列表: [${tokenResult.input.join(", ")}]`);
			console.log(`   CST列表:  [${tokenResult.cst.join(", ")}]`);
			if (tokenResult.missing.length > 0) console.log(`   ❌ 缺失: [${tokenResult.missing.join(", ")}]`);
			else console.log(`   ✅ 完整保留`);
			const stats = this.getCSTStatistics(this.topLevelCst);
			console.log(`\n📌 CST 统计:`);
			console.log(`   总节点数: ${stats.totalNodes}`);
			console.log(`   叶子节点: ${stats.leafNodes}`);
			console.log(`   最大深度: ${stats.maxDepth}`);
			console.log(`   节点类型: ${stats.nodeTypes.size} 种`);
			console.log(`\n   节点类型分布:`);
			Array.from(stats.nodeTypes.entries()).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
				console.log(`     ${name}: ${count}`);
			});
			console.log("─".repeat(60));
			console.log("\n【第三部分：CST 可视化】");
			console.log("─".repeat(60));
			console.log("\n📊 CST 结构");
			console.log("─".repeat(60));
			console.log(SubhutiDebugUtils.formatCst(this.topLevelCst));
			console.log("─".repeat(60));
		}
		console.log("\n" + "=".repeat(60));
		console.log("🎉 Debug 输出完成");
		console.log("=".repeat(60));
	}
};

//#endregion
//#region ../../node_modules/lru-cache/dist/esm/index.js
/**
* @module LRUCache
*/
const defaultPerf = typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date;
const warned = /* @__PURE__ */ new Set();
/* c8 ignore start */
const PROCESS = typeof process === "object" && !!process ? process : {};
/* c8 ignore start */
const emitWarning = (msg, type, code, fn) => {
	typeof PROCESS.emitWarning === "function" ? PROCESS.emitWarning(msg, type, code, fn) : console.error(`[${code}] ${type}: ${msg}`);
};
let AC = globalThis.AbortController;
let AS = globalThis.AbortSignal;
/* c8 ignore start */
if (typeof AC === "undefined") {
	AS = class AbortSignal {
		onabort;
		_onabort = [];
		reason;
		aborted = false;
		addEventListener(_, fn) {
			this._onabort.push(fn);
		}
	};
	AC = class AbortController {
		constructor() {
			warnACPolyfill();
		}
		signal = new AS();
		abort(reason) {
			if (this.signal.aborted) return;
			this.signal.reason = reason;
			this.signal.aborted = true;
			for (const fn of this.signal._onabort) fn(reason);
			this.signal.onabort?.(reason);
		}
	};
	let printACPolyfillWarning = PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1";
	const warnACPolyfill = () => {
		if (!printACPolyfillWarning) return;
		printACPolyfillWarning = false;
		emitWarning("AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", warnACPolyfill);
	};
}
/* c8 ignore stop */
const shouldWarn = (code) => !warned.has(code);
const isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
/* c8 ignore start */
const getUintArray = (max) => !isPosInt(max) ? null : max <= Math.pow(2, 8) ? Uint8Array : max <= Math.pow(2, 16) ? Uint16Array : max <= Math.pow(2, 32) ? Uint32Array : max <= Number.MAX_SAFE_INTEGER ? ZeroArray : null;
/* c8 ignore stop */
var ZeroArray = class extends Array {
	constructor(size) {
		super(size);
		this.fill(0);
	}
};
var Stack = class Stack {
	heap;
	length;
	static #constructing = false;
	static create(max) {
		const HeapCls = getUintArray(max);
		if (!HeapCls) return [];
		Stack.#constructing = true;
		const s = new Stack(max, HeapCls);
		Stack.#constructing = false;
		return s;
	}
	constructor(max, HeapCls) {
		/* c8 ignore start */
		if (!Stack.#constructing) throw new TypeError("instantiate Stack using Stack.create(n)");
		/* c8 ignore stop */
		this.heap = new HeapCls(max);
		this.length = 0;
	}
	push(n) {
		this.heap[this.length++] = n;
	}
	pop() {
		return this.heap[--this.length];
	}
};
/**
* Default export, the thing you're using this module to get.
*
* The `K` and `V` types define the key and value types, respectively. The
* optional `FC` type defines the type of the `context` object passed to
* `cache.fetch()` and `cache.memo()`.
*
* Keys and values **must not** be `null` or `undefined`.
*
* All properties from the options object (with the exception of `max`,
* `maxSize`, `fetchMethod`, `memoMethod`, `dispose` and `disposeAfter`) are
* added as normal public members. (The listed options are read-only getters.)
*
* Changing any of these will alter the defaults for subsequent method calls.
*/
var LRUCache = class LRUCache {
	#max;
	#maxSize;
	#dispose;
	#onInsert;
	#disposeAfter;
	#fetchMethod;
	#memoMethod;
	#perf;
	/**
	* {@link LRUCache.OptionsBase.perf}
	*/
	get perf() {
		return this.#perf;
	}
	/**
	* {@link LRUCache.OptionsBase.ttl}
	*/
	ttl;
	/**
	* {@link LRUCache.OptionsBase.ttlResolution}
	*/
	ttlResolution;
	/**
	* {@link LRUCache.OptionsBase.ttlAutopurge}
	*/
	ttlAutopurge;
	/**
	* {@link LRUCache.OptionsBase.updateAgeOnGet}
	*/
	updateAgeOnGet;
	/**
	* {@link LRUCache.OptionsBase.updateAgeOnHas}
	*/
	updateAgeOnHas;
	/**
	* {@link LRUCache.OptionsBase.allowStale}
	*/
	allowStale;
	/**
	* {@link LRUCache.OptionsBase.noDisposeOnSet}
	*/
	noDisposeOnSet;
	/**
	* {@link LRUCache.OptionsBase.noUpdateTTL}
	*/
	noUpdateTTL;
	/**
	* {@link LRUCache.OptionsBase.maxEntrySize}
	*/
	maxEntrySize;
	/**
	* {@link LRUCache.OptionsBase.sizeCalculation}
	*/
	sizeCalculation;
	/**
	* {@link LRUCache.OptionsBase.noDeleteOnFetchRejection}
	*/
	noDeleteOnFetchRejection;
	/**
	* {@link LRUCache.OptionsBase.noDeleteOnStaleGet}
	*/
	noDeleteOnStaleGet;
	/**
	* {@link LRUCache.OptionsBase.allowStaleOnFetchAbort}
	*/
	allowStaleOnFetchAbort;
	/**
	* {@link LRUCache.OptionsBase.allowStaleOnFetchRejection}
	*/
	allowStaleOnFetchRejection;
	/**
	* {@link LRUCache.OptionsBase.ignoreFetchAbort}
	*/
	ignoreFetchAbort;
	#size;
	#calculatedSize;
	#keyMap;
	#keyList;
	#valList;
	#next;
	#prev;
	#head;
	#tail;
	#free;
	#disposed;
	#sizes;
	#starts;
	#ttls;
	#autopurgeTimers;
	#hasDispose;
	#hasFetchMethod;
	#hasDisposeAfter;
	#hasOnInsert;
	/**
	* Do not call this method unless you need to inspect the
	* inner workings of the cache.  If anything returned by this
	* object is modified in any way, strange breakage may occur.
	*
	* These fields are private for a reason!
	*
	* @internal
	*/
	static unsafeExposeInternals(c) {
		return {
			starts: c.#starts,
			ttls: c.#ttls,
			autopurgeTimers: c.#autopurgeTimers,
			sizes: c.#sizes,
			keyMap: c.#keyMap,
			keyList: c.#keyList,
			valList: c.#valList,
			next: c.#next,
			prev: c.#prev,
			get head() {
				return c.#head;
			},
			get tail() {
				return c.#tail;
			},
			free: c.#free,
			isBackgroundFetch: (p) => c.#isBackgroundFetch(p),
			backgroundFetch: (k, index, options, context) => c.#backgroundFetch(k, index, options, context),
			moveToTail: (index) => c.#moveToTail(index),
			indexes: (options) => c.#indexes(options),
			rindexes: (options) => c.#rindexes(options),
			isStale: (index) => c.#isStale(index)
		};
	}
	/**
	* {@link LRUCache.OptionsBase.max} (read-only)
	*/
	get max() {
		return this.#max;
	}
	/**
	* {@link LRUCache.OptionsBase.maxSize} (read-only)
	*/
	get maxSize() {
		return this.#maxSize;
	}
	/**
	* The total computed size of items in the cache (read-only)
	*/
	get calculatedSize() {
		return this.#calculatedSize;
	}
	/**
	* The number of items stored in the cache (read-only)
	*/
	get size() {
		return this.#size;
	}
	/**
	* {@link LRUCache.OptionsBase.fetchMethod} (read-only)
	*/
	get fetchMethod() {
		return this.#fetchMethod;
	}
	get memoMethod() {
		return this.#memoMethod;
	}
	/**
	* {@link LRUCache.OptionsBase.dispose} (read-only)
	*/
	get dispose() {
		return this.#dispose;
	}
	/**
	* {@link LRUCache.OptionsBase.onInsert} (read-only)
	*/
	get onInsert() {
		return this.#onInsert;
	}
	/**
	* {@link LRUCache.OptionsBase.disposeAfter} (read-only)
	*/
	get disposeAfter() {
		return this.#disposeAfter;
	}
	constructor(options) {
		const { max = 0, ttl, ttlResolution = 1, ttlAutopurge, updateAgeOnGet, updateAgeOnHas, allowStale, dispose, onInsert, disposeAfter, noDisposeOnSet, noUpdateTTL, maxSize = 0, maxEntrySize = 0, sizeCalculation, fetchMethod, memoMethod, noDeleteOnFetchRejection, noDeleteOnStaleGet, allowStaleOnFetchRejection, allowStaleOnFetchAbort, ignoreFetchAbort, perf } = options;
		if (perf !== void 0) {
			if (typeof perf?.now !== "function") throw new TypeError("perf option must have a now() method if specified");
		}
		this.#perf = perf ?? defaultPerf;
		if (max !== 0 && !isPosInt(max)) throw new TypeError("max option must be a nonnegative integer");
		const UintArray = max ? getUintArray(max) : Array;
		if (!UintArray) throw new Error("invalid max value: " + max);
		this.#max = max;
		this.#maxSize = maxSize;
		this.maxEntrySize = maxEntrySize || this.#maxSize;
		this.sizeCalculation = sizeCalculation;
		if (this.sizeCalculation) {
			if (!this.#maxSize && !this.maxEntrySize) throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
			if (typeof this.sizeCalculation !== "function") throw new TypeError("sizeCalculation set to non-function");
		}
		if (memoMethod !== void 0 && typeof memoMethod !== "function") throw new TypeError("memoMethod must be a function if defined");
		this.#memoMethod = memoMethod;
		if (fetchMethod !== void 0 && typeof fetchMethod !== "function") throw new TypeError("fetchMethod must be a function if specified");
		this.#fetchMethod = fetchMethod;
		this.#hasFetchMethod = !!fetchMethod;
		this.#keyMap = /* @__PURE__ */ new Map();
		this.#keyList = new Array(max).fill(void 0);
		this.#valList = new Array(max).fill(void 0);
		this.#next = new UintArray(max);
		this.#prev = new UintArray(max);
		this.#head = 0;
		this.#tail = 0;
		this.#free = Stack.create(max);
		this.#size = 0;
		this.#calculatedSize = 0;
		if (typeof dispose === "function") this.#dispose = dispose;
		if (typeof onInsert === "function") this.#onInsert = onInsert;
		if (typeof disposeAfter === "function") {
			this.#disposeAfter = disposeAfter;
			this.#disposed = [];
		} else {
			this.#disposeAfter = void 0;
			this.#disposed = void 0;
		}
		this.#hasDispose = !!this.#dispose;
		this.#hasOnInsert = !!this.#onInsert;
		this.#hasDisposeAfter = !!this.#disposeAfter;
		this.noDisposeOnSet = !!noDisposeOnSet;
		this.noUpdateTTL = !!noUpdateTTL;
		this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
		this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
		this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
		this.ignoreFetchAbort = !!ignoreFetchAbort;
		if (this.maxEntrySize !== 0) {
			if (this.#maxSize !== 0) {
				if (!isPosInt(this.#maxSize)) throw new TypeError("maxSize must be a positive integer if specified");
			}
			if (!isPosInt(this.maxEntrySize)) throw new TypeError("maxEntrySize must be a positive integer if specified");
			this.#initializeSizeTracking();
		}
		this.allowStale = !!allowStale;
		this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
		this.updateAgeOnGet = !!updateAgeOnGet;
		this.updateAgeOnHas = !!updateAgeOnHas;
		this.ttlResolution = isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
		this.ttlAutopurge = !!ttlAutopurge;
		this.ttl = ttl || 0;
		if (this.ttl) {
			if (!isPosInt(this.ttl)) throw new TypeError("ttl must be a positive integer if specified");
			this.#initializeTTLTracking();
		}
		if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) throw new TypeError("At least one of max, maxSize, or ttl is required");
		if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
			const code = "LRU_CACHE_UNBOUNDED";
			if (shouldWarn(code)) {
				warned.add(code);
				emitWarning("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.", "UnboundedCacheWarning", code, LRUCache);
			}
		}
	}
	/**
	* Return the number of ms left in the item's TTL. If item is not in cache,
	* returns `0`. Returns `Infinity` if item is in cache without a defined TTL.
	*/
	getRemainingTTL(key) {
		return this.#keyMap.has(key) ? Infinity : 0;
	}
	#initializeTTLTracking() {
		const ttls = new ZeroArray(this.#max);
		const starts = new ZeroArray(this.#max);
		this.#ttls = ttls;
		this.#starts = starts;
		const purgeTimers = this.ttlAutopurge ? new Array(this.#max) : void 0;
		this.#autopurgeTimers = purgeTimers;
		this.#setItemTTL = (index, ttl, start = this.#perf.now()) => {
			starts[index] = ttl !== 0 ? start : 0;
			ttls[index] = ttl;
			if (purgeTimers?.[index]) {
				clearTimeout(purgeTimers[index]);
				purgeTimers[index] = void 0;
			}
			if (ttl !== 0 && purgeTimers) {
				const t = setTimeout(() => {
					if (this.#isStale(index)) this.#delete(this.#keyList[index], "expire");
				}, ttl + 1);
				/* c8 ignore start */
				if (t.unref) t.unref();
				/* c8 ignore stop */
				purgeTimers[index] = t;
			}
		};
		this.#updateItemAge = (index) => {
			starts[index] = ttls[index] !== 0 ? this.#perf.now() : 0;
		};
		this.#statusTTL = (status, index) => {
			if (ttls[index]) {
				const ttl = ttls[index];
				const start = starts[index];
				/* c8 ignore next */
				if (!ttl || !start) return;
				status.ttl = ttl;
				status.start = start;
				status.now = cachedNow || getNow();
				status.remainingTTL = ttl - (status.now - start);
			}
		};
		let cachedNow = 0;
		const getNow = () => {
			const n = this.#perf.now();
			if (this.ttlResolution > 0) {
				cachedNow = n;
				const t = setTimeout(() => cachedNow = 0, this.ttlResolution);
				/* c8 ignore start */
				if (t.unref) t.unref();
			}
			return n;
		};
		this.getRemainingTTL = (key) => {
			const index = this.#keyMap.get(key);
			if (index === void 0) return 0;
			const ttl = ttls[index];
			const start = starts[index];
			if (!ttl || !start) return Infinity;
			return ttl - ((cachedNow || getNow()) - start);
		};
		this.#isStale = (index) => {
			const s = starts[index];
			const t = ttls[index];
			return !!t && !!s && (cachedNow || getNow()) - s > t;
		};
	}
	#updateItemAge = () => {};
	#statusTTL = () => {};
	#setItemTTL = () => {};
	/* c8 ignore stop */
	#isStale = () => false;
	#initializeSizeTracking() {
		const sizes = new ZeroArray(this.#max);
		this.#calculatedSize = 0;
		this.#sizes = sizes;
		this.#removeItemSize = (index) => {
			this.#calculatedSize -= sizes[index];
			sizes[index] = 0;
		};
		this.#requireSize = (k, v, size, sizeCalculation) => {
			if (this.#isBackgroundFetch(v)) return 0;
			if (!isPosInt(size)) if (sizeCalculation) {
				if (typeof sizeCalculation !== "function") throw new TypeError("sizeCalculation must be a function");
				size = sizeCalculation(v, k);
				if (!isPosInt(size)) throw new TypeError("sizeCalculation return invalid (expect positive integer)");
			} else throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");
			return size;
		};
		this.#addItemSize = (index, size, status) => {
			sizes[index] = size;
			if (this.#maxSize) {
				const maxSize = this.#maxSize - sizes[index];
				while (this.#calculatedSize > maxSize) this.#evict(true);
			}
			this.#calculatedSize += sizes[index];
			if (status) {
				status.entrySize = size;
				status.totalCalculatedSize = this.#calculatedSize;
			}
		};
	}
	#removeItemSize = (_i) => {};
	#addItemSize = (_i, _s, _st) => {};
	#requireSize = (_k, _v, size, sizeCalculation) => {
		if (size || sizeCalculation) throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
		return 0;
	};
	*#indexes({ allowStale = this.allowStale } = {}) {
		if (this.#size) for (let i = this.#tail;;) {
			if (!this.#isValidIndex(i)) break;
			if (allowStale || !this.#isStale(i)) yield i;
			if (i === this.#head) break;
			else i = this.#prev[i];
		}
	}
	*#rindexes({ allowStale = this.allowStale } = {}) {
		if (this.#size) for (let i = this.#head;;) {
			if (!this.#isValidIndex(i)) break;
			if (allowStale || !this.#isStale(i)) yield i;
			if (i === this.#tail) break;
			else i = this.#next[i];
		}
	}
	#isValidIndex(index) {
		return index !== void 0 && this.#keyMap.get(this.#keyList[index]) === index;
	}
	/**
	* Return a generator yielding `[key, value]` pairs,
	* in order from most recently used to least recently used.
	*/
	*entries() {
		for (const i of this.#indexes()) if (this.#valList[i] !== void 0 && this.#keyList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield [this.#keyList[i], this.#valList[i]];
	}
	/**
	* Inverse order version of {@link LRUCache.entries}
	*
	* Return a generator yielding `[key, value]` pairs,
	* in order from least recently used to most recently used.
	*/
	*rentries() {
		for (const i of this.#rindexes()) if (this.#valList[i] !== void 0 && this.#keyList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield [this.#keyList[i], this.#valList[i]];
	}
	/**
	* Return a generator yielding the keys in the cache,
	* in order from most recently used to least recently used.
	*/
	*keys() {
		for (const i of this.#indexes()) {
			const k = this.#keyList[i];
			if (k !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield k;
		}
	}
	/**
	* Inverse order version of {@link LRUCache.keys}
	*
	* Return a generator yielding the keys in the cache,
	* in order from least recently used to most recently used.
	*/
	*rkeys() {
		for (const i of this.#rindexes()) {
			const k = this.#keyList[i];
			if (k !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield k;
		}
	}
	/**
	* Return a generator yielding the values in the cache,
	* in order from most recently used to least recently used.
	*/
	*values() {
		for (const i of this.#indexes()) if (this.#valList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield this.#valList[i];
	}
	/**
	* Inverse order version of {@link LRUCache.values}
	*
	* Return a generator yielding the values in the cache,
	* in order from least recently used to most recently used.
	*/
	*rvalues() {
		for (const i of this.#rindexes()) if (this.#valList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield this.#valList[i];
	}
	/**
	* Iterating over the cache itself yields the same results as
	* {@link LRUCache.entries}
	*/
	[Symbol.iterator]() {
		return this.entries();
	}
	/**
	* A String value that is used in the creation of the default string
	* description of an object. Called by the built-in method
	* `Object.prototype.toString`.
	*/
	[Symbol.toStringTag] = "LRUCache";
	/**
	* Find a value for which the supplied fn method returns a truthy value,
	* similar to `Array.find()`. fn is called as `fn(value, key, cache)`.
	*/
	find(fn, getOptions = {}) {
		for (const i of this.#indexes()) {
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0) continue;
			if (fn(value, this.#keyList[i], this)) return this.get(this.#keyList[i], getOptions);
		}
	}
	/**
	* Call the supplied function on each item in the cache, in order from most
	* recently used to least recently used.
	*
	* `fn` is called as `fn(value, key, cache)`.
	*
	* If `thisp` is provided, function will be called in the `this`-context of
	* the provided object, or the cache if no `thisp` object is provided.
	*
	* Does not update age or recenty of use, or iterate over stale values.
	*/
	forEach(fn, thisp = this) {
		for (const i of this.#indexes()) {
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0) continue;
			fn.call(thisp, value, this.#keyList[i], this);
		}
	}
	/**
	* The same as {@link LRUCache.forEach} but items are iterated over in
	* reverse order.  (ie, less recently used items are iterated over first.)
	*/
	rforEach(fn, thisp = this) {
		for (const i of this.#rindexes()) {
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0) continue;
			fn.call(thisp, value, this.#keyList[i], this);
		}
	}
	/**
	* Delete any stale entries. Returns true if anything was removed,
	* false otherwise.
	*/
	purgeStale() {
		let deleted = false;
		for (const i of this.#rindexes({ allowStale: true })) if (this.#isStale(i)) {
			this.#delete(this.#keyList[i], "expire");
			deleted = true;
		}
		return deleted;
	}
	/**
	* Get the extended info about a given entry, to get its value, size, and
	* TTL info simultaneously. Returns `undefined` if the key is not present.
	*
	* Unlike {@link LRUCache#dump}, which is designed to be portable and survive
	* serialization, the `start` value is always the current timestamp, and the
	* `ttl` is a calculated remaining time to live (negative if expired).
	*
	* Always returns stale values, if their info is found in the cache, so be
	* sure to check for expirations (ie, a negative {@link LRUCache.Entry#ttl})
	* if relevant.
	*/
	info(key) {
		const i = this.#keyMap.get(key);
		if (i === void 0) return void 0;
		const v = this.#valList[i];
		/* c8 ignore start - this isn't tested for the info function,
		* but it's the same logic as found in other places. */
		const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
		if (value === void 0) return void 0;
		/* c8 ignore end */
		const entry = { value };
		if (this.#ttls && this.#starts) {
			const ttl = this.#ttls[i];
			const start = this.#starts[i];
			if (ttl && start) {
				entry.ttl = ttl - (this.#perf.now() - start);
				entry.start = Date.now();
			}
		}
		if (this.#sizes) entry.size = this.#sizes[i];
		return entry;
	}
	/**
	* Return an array of [key, {@link LRUCache.Entry}] tuples which can be
	* passed to {@link LRUCache#load}.
	*
	* The `start` fields are calculated relative to a portable `Date.now()`
	* timestamp, even if `performance.now()` is available.
	*
	* Stale entries are always included in the `dump`, even if
	* {@link LRUCache.OptionsBase.allowStale} is false.
	*
	* Note: this returns an actual array, not a generator, so it can be more
	* easily passed around.
	*/
	dump() {
		const arr = [];
		for (const i of this.#indexes({ allowStale: true })) {
			const key = this.#keyList[i];
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0 || key === void 0) continue;
			const entry = { value };
			if (this.#ttls && this.#starts) {
				entry.ttl = this.#ttls[i];
				const age = this.#perf.now() - this.#starts[i];
				entry.start = Math.floor(Date.now() - age);
			}
			if (this.#sizes) entry.size = this.#sizes[i];
			arr.unshift([key, entry]);
		}
		return arr;
	}
	/**
	* Reset the cache and load in the items in entries in the order listed.
	*
	* The shape of the resulting cache may be different if the same options are
	* not used in both caches.
	*
	* The `start` fields are assumed to be calculated relative to a portable
	* `Date.now()` timestamp, even if `performance.now()` is available.
	*/
	load(arr) {
		this.clear();
		for (const [key, entry] of arr) {
			if (entry.start) {
				const age = Date.now() - entry.start;
				entry.start = this.#perf.now() - age;
			}
			this.set(key, entry.value, entry);
		}
	}
	/**
	* Add a value to the cache.
	*
	* Note: if `undefined` is specified as a value, this is an alias for
	* {@link LRUCache#delete}
	*
	* Fields on the {@link LRUCache.SetOptions} options param will override
	* their corresponding values in the constructor options for the scope
	* of this single `set()` operation.
	*
	* If `start` is provided, then that will set the effective start
	* time for the TTL calculation. Note that this must be a previous
	* value of `performance.now()` if supported, or a previous value of
	* `Date.now()` if not.
	*
	* Options object may also include `size`, which will prevent
	* calling the `sizeCalculation` function and just use the specified
	* number if it is a positive integer, and `noDisposeOnSet` which
	* will prevent calling a `dispose` function in the case of
	* overwrites.
	*
	* If the `size` (or return value of `sizeCalculation`) for a given
	* entry is greater than `maxEntrySize`, then the item will not be
	* added to the cache.
	*
	* Will update the recency of the entry.
	*
	* If the value is `undefined`, then this is an alias for
	* `cache.delete(key)`. `undefined` is never stored in the cache.
	*/
	set(k, v, setOptions = {}) {
		if (v === void 0) {
			this.delete(k);
			return this;
		}
		const { ttl = this.ttl, start, noDisposeOnSet = this.noDisposeOnSet, sizeCalculation = this.sizeCalculation, status } = setOptions;
		let { noUpdateTTL = this.noUpdateTTL } = setOptions;
		const size = this.#requireSize(k, v, setOptions.size || 0, sizeCalculation);
		if (this.maxEntrySize && size > this.maxEntrySize) {
			if (status) {
				status.set = "miss";
				status.maxEntrySizeExceeded = true;
			}
			this.#delete(k, "set");
			return this;
		}
		let index = this.#size === 0 ? void 0 : this.#keyMap.get(k);
		if (index === void 0) {
			index = this.#size === 0 ? this.#tail : this.#free.length !== 0 ? this.#free.pop() : this.#size === this.#max ? this.#evict(false) : this.#size;
			this.#keyList[index] = k;
			this.#valList[index] = v;
			this.#keyMap.set(k, index);
			this.#next[this.#tail] = index;
			this.#prev[index] = this.#tail;
			this.#tail = index;
			this.#size++;
			this.#addItemSize(index, size, status);
			if (status) status.set = "add";
			noUpdateTTL = false;
			if (this.#hasOnInsert) this.#onInsert?.(v, k, "add");
		} else {
			this.#moveToTail(index);
			const oldVal = this.#valList[index];
			if (v !== oldVal) {
				if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
					oldVal.__abortController.abort(/* @__PURE__ */ new Error("replaced"));
					const { __staleWhileFetching: s } = oldVal;
					if (s !== void 0 && !noDisposeOnSet) {
						if (this.#hasDispose) this.#dispose?.(s, k, "set");
						if (this.#hasDisposeAfter) this.#disposed?.push([
							s,
							k,
							"set"
						]);
					}
				} else if (!noDisposeOnSet) {
					if (this.#hasDispose) this.#dispose?.(oldVal, k, "set");
					if (this.#hasDisposeAfter) this.#disposed?.push([
						oldVal,
						k,
						"set"
					]);
				}
				this.#removeItemSize(index);
				this.#addItemSize(index, size, status);
				this.#valList[index] = v;
				if (status) {
					status.set = "replace";
					const oldValue = oldVal && this.#isBackgroundFetch(oldVal) ? oldVal.__staleWhileFetching : oldVal;
					if (oldValue !== void 0) status.oldValue = oldValue;
				}
			} else if (status) status.set = "update";
			if (this.#hasOnInsert) this.onInsert?.(v, k, v === oldVal ? "update" : "replace");
		}
		if (ttl !== 0 && !this.#ttls) this.#initializeTTLTracking();
		if (this.#ttls) {
			if (!noUpdateTTL) this.#setItemTTL(index, ttl, start);
			if (status) this.#statusTTL(status, index);
		}
		if (!noDisposeOnSet && this.#hasDisposeAfter && this.#disposed) {
			const dt = this.#disposed;
			let task;
			while (task = dt?.shift()) this.#disposeAfter?.(...task);
		}
		return this;
	}
	/**
	* Evict the least recently used item, returning its value or
	* `undefined` if cache is empty.
	*/
	pop() {
		try {
			while (this.#size) {
				const val = this.#valList[this.#head];
				this.#evict(true);
				if (this.#isBackgroundFetch(val)) {
					if (val.__staleWhileFetching) return val.__staleWhileFetching;
				} else if (val !== void 0) return val;
			}
		} finally {
			if (this.#hasDisposeAfter && this.#disposed) {
				const dt = this.#disposed;
				let task;
				while (task = dt?.shift()) this.#disposeAfter?.(...task);
			}
		}
	}
	#evict(free) {
		const head = this.#head;
		const k = this.#keyList[head];
		const v = this.#valList[head];
		if (this.#hasFetchMethod && this.#isBackgroundFetch(v)) v.__abortController.abort(/* @__PURE__ */ new Error("evicted"));
		else if (this.#hasDispose || this.#hasDisposeAfter) {
			if (this.#hasDispose) this.#dispose?.(v, k, "evict");
			if (this.#hasDisposeAfter) this.#disposed?.push([
				v,
				k,
				"evict"
			]);
		}
		this.#removeItemSize(head);
		if (this.#autopurgeTimers?.[head]) {
			clearTimeout(this.#autopurgeTimers[head]);
			this.#autopurgeTimers[head] = void 0;
		}
		if (free) {
			this.#keyList[head] = void 0;
			this.#valList[head] = void 0;
			this.#free.push(head);
		}
		if (this.#size === 1) {
			this.#head = this.#tail = 0;
			this.#free.length = 0;
		} else this.#head = this.#next[head];
		this.#keyMap.delete(k);
		this.#size--;
		return head;
	}
	/**
	* Check if a key is in the cache, without updating the recency of use.
	* Will return false if the item is stale, even though it is technically
	* in the cache.
	*
	* Check if a key is in the cache, without updating the recency of
	* use. Age is updated if {@link LRUCache.OptionsBase.updateAgeOnHas} is set
	* to `true` in either the options or the constructor.
	*
	* Will return `false` if the item is stale, even though it is technically in
	* the cache. The difference can be determined (if it matters) by using a
	* `status` argument, and inspecting the `has` field.
	*
	* Will not update item age unless
	* {@link LRUCache.OptionsBase.updateAgeOnHas} is set.
	*/
	has(k, hasOptions = {}) {
		const { updateAgeOnHas = this.updateAgeOnHas, status } = hasOptions;
		const index = this.#keyMap.get(k);
		if (index !== void 0) {
			const v = this.#valList[index];
			if (this.#isBackgroundFetch(v) && v.__staleWhileFetching === void 0) return false;
			if (!this.#isStale(index)) {
				if (updateAgeOnHas) this.#updateItemAge(index);
				if (status) {
					status.has = "hit";
					this.#statusTTL(status, index);
				}
				return true;
			} else if (status) {
				status.has = "stale";
				this.#statusTTL(status, index);
			}
		} else if (status) status.has = "miss";
		return false;
	}
	/**
	* Like {@link LRUCache#get} but doesn't update recency or delete stale
	* items.
	*
	* Returns `undefined` if the item is stale, unless
	* {@link LRUCache.OptionsBase.allowStale} is set.
	*/
	peek(k, peekOptions = {}) {
		const { allowStale = this.allowStale } = peekOptions;
		const index = this.#keyMap.get(k);
		if (index === void 0 || !allowStale && this.#isStale(index)) return;
		const v = this.#valList[index];
		return this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
	}
	#backgroundFetch(k, index, options, context) {
		const v = index === void 0 ? void 0 : this.#valList[index];
		if (this.#isBackgroundFetch(v)) return v;
		const ac = new AC();
		const { signal } = options;
		signal?.addEventListener("abort", () => ac.abort(signal.reason), { signal: ac.signal });
		const fetchOpts = {
			signal: ac.signal,
			options,
			context
		};
		const cb = (v$1, updateCache = false) => {
			const { aborted } = ac.signal;
			const ignoreAbort = options.ignoreFetchAbort && v$1 !== void 0;
			if (options.status) if (aborted && !updateCache) {
				options.status.fetchAborted = true;
				options.status.fetchError = ac.signal.reason;
				if (ignoreAbort) options.status.fetchAbortIgnored = true;
			} else options.status.fetchResolved = true;
			if (aborted && !ignoreAbort && !updateCache) return fetchFail(ac.signal.reason);
			const bf$1 = p;
			const vl = this.#valList[index];
			if (vl === p || ignoreAbort && updateCache && vl === void 0) if (v$1 === void 0) if (bf$1.__staleWhileFetching !== void 0) this.#valList[index] = bf$1.__staleWhileFetching;
			else this.#delete(k, "fetch");
			else {
				if (options.status) options.status.fetchUpdated = true;
				this.set(k, v$1, fetchOpts.options);
			}
			return v$1;
		};
		const eb = (er) => {
			if (options.status) {
				options.status.fetchRejected = true;
				options.status.fetchError = er;
			}
			return fetchFail(er);
		};
		const fetchFail = (er) => {
			const { aborted } = ac.signal;
			const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
			const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
			const noDelete = allowStale || options.noDeleteOnFetchRejection;
			const bf$1 = p;
			if (this.#valList[index] === p) {
				if (!noDelete || bf$1.__staleWhileFetching === void 0) this.#delete(k, "fetch");
				else if (!allowStaleAborted) this.#valList[index] = bf$1.__staleWhileFetching;
			}
			if (allowStale) {
				if (options.status && bf$1.__staleWhileFetching !== void 0) options.status.returnedStale = true;
				return bf$1.__staleWhileFetching;
			} else if (bf$1.__returned === bf$1) throw er;
		};
		const pcall = (res, rej) => {
			const fmp = this.#fetchMethod?.(k, v, fetchOpts);
			if (fmp && fmp instanceof Promise) fmp.then((v$1) => res(v$1 === void 0 ? void 0 : v$1), rej);
			ac.signal.addEventListener("abort", () => {
				if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
					res(void 0);
					if (options.allowStaleOnFetchAbort) res = (v$1) => cb(v$1, true);
				}
			});
		};
		if (options.status) options.status.fetchDispatched = true;
		const p = new Promise(pcall).then(cb, eb);
		const bf = Object.assign(p, {
			__abortController: ac,
			__staleWhileFetching: v,
			__returned: void 0
		});
		if (index === void 0) {
			this.set(k, bf, {
				...fetchOpts.options,
				status: void 0
			});
			index = this.#keyMap.get(k);
		} else this.#valList[index] = bf;
		return bf;
	}
	#isBackgroundFetch(p) {
		if (!this.#hasFetchMethod) return false;
		const b = p;
		return !!b && b instanceof Promise && b.hasOwnProperty("__staleWhileFetching") && b.__abortController instanceof AC;
	}
	async fetch(k, fetchOptions = {}) {
		const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, ttl = this.ttl, noDisposeOnSet = this.noDisposeOnSet, size = 0, sizeCalculation = this.sizeCalculation, noUpdateTTL = this.noUpdateTTL, noDeleteOnFetchRejection = this.noDeleteOnFetchRejection, allowStaleOnFetchRejection = this.allowStaleOnFetchRejection, ignoreFetchAbort = this.ignoreFetchAbort, allowStaleOnFetchAbort = this.allowStaleOnFetchAbort, context, forceRefresh = false, status, signal } = fetchOptions;
		if (!this.#hasFetchMethod) {
			if (status) status.fetch = "get";
			return this.get(k, {
				allowStale,
				updateAgeOnGet,
				noDeleteOnStaleGet,
				status
			});
		}
		const options = {
			allowStale,
			updateAgeOnGet,
			noDeleteOnStaleGet,
			ttl,
			noDisposeOnSet,
			size,
			sizeCalculation,
			noUpdateTTL,
			noDeleteOnFetchRejection,
			allowStaleOnFetchRejection,
			allowStaleOnFetchAbort,
			ignoreFetchAbort,
			status,
			signal
		};
		let index = this.#keyMap.get(k);
		if (index === void 0) {
			if (status) status.fetch = "miss";
			const p = this.#backgroundFetch(k, index, options, context);
			return p.__returned = p;
		} else {
			const v = this.#valList[index];
			if (this.#isBackgroundFetch(v)) {
				const stale = allowStale && v.__staleWhileFetching !== void 0;
				if (status) {
					status.fetch = "inflight";
					if (stale) status.returnedStale = true;
				}
				return stale ? v.__staleWhileFetching : v.__returned = v;
			}
			const isStale = this.#isStale(index);
			if (!forceRefresh && !isStale) {
				if (status) status.fetch = "hit";
				this.#moveToTail(index);
				if (updateAgeOnGet) this.#updateItemAge(index);
				if (status) this.#statusTTL(status, index);
				return v;
			}
			const p = this.#backgroundFetch(k, index, options, context);
			const staleVal = p.__staleWhileFetching !== void 0 && allowStale;
			if (status) {
				status.fetch = isStale ? "stale" : "refresh";
				if (staleVal && isStale) status.returnedStale = true;
			}
			return staleVal ? p.__staleWhileFetching : p.__returned = p;
		}
	}
	async forceFetch(k, fetchOptions = {}) {
		const v = await this.fetch(k, fetchOptions);
		if (v === void 0) throw new Error("fetch() returned undefined");
		return v;
	}
	memo(k, memoOptions = {}) {
		const memoMethod = this.#memoMethod;
		if (!memoMethod) throw new Error("no memoMethod provided to constructor");
		const { context, forceRefresh, ...options } = memoOptions;
		const v = this.get(k, options);
		if (!forceRefresh && v !== void 0) return v;
		const vv = memoMethod(k, v, {
			options,
			context
		});
		this.set(k, vv, options);
		return vv;
	}
	/**
	* Return a value from the cache. Will update the recency of the cache
	* entry found.
	*
	* If the key is not found, get() will return `undefined`.
	*/
	get(k, getOptions = {}) {
		const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, status } = getOptions;
		const index = this.#keyMap.get(k);
		if (index !== void 0) {
			const value = this.#valList[index];
			const fetching = this.#isBackgroundFetch(value);
			if (status) this.#statusTTL(status, index);
			if (this.#isStale(index)) {
				if (status) status.get = "stale";
				if (!fetching) {
					if (!noDeleteOnStaleGet) this.#delete(k, "expire");
					if (status && allowStale) status.returnedStale = true;
					return allowStale ? value : void 0;
				} else {
					if (status && allowStale && value.__staleWhileFetching !== void 0) status.returnedStale = true;
					return allowStale ? value.__staleWhileFetching : void 0;
				}
			} else {
				if (status) status.get = "hit";
				if (fetching) return value.__staleWhileFetching;
				this.#moveToTail(index);
				if (updateAgeOnGet) this.#updateItemAge(index);
				return value;
			}
		} else if (status) status.get = "miss";
	}
	#connect(p, n) {
		this.#prev[n] = p;
		this.#next[p] = n;
	}
	#moveToTail(index) {
		if (index !== this.#tail) {
			if (index === this.#head) this.#head = this.#next[index];
			else this.#connect(this.#prev[index], this.#next[index]);
			this.#connect(this.#tail, index);
			this.#tail = index;
		}
	}
	/**
	* Deletes a key out of the cache.
	*
	* Returns true if the key was deleted, false otherwise.
	*/
	delete(k) {
		return this.#delete(k, "delete");
	}
	#delete(k, reason) {
		let deleted = false;
		if (this.#size !== 0) {
			const index = this.#keyMap.get(k);
			if (index !== void 0) {
				if (this.#autopurgeTimers?.[index]) {
					clearTimeout(this.#autopurgeTimers?.[index]);
					this.#autopurgeTimers[index] = void 0;
				}
				deleted = true;
				if (this.#size === 1) this.#clear(reason);
				else {
					this.#removeItemSize(index);
					const v = this.#valList[index];
					if (this.#isBackgroundFetch(v)) v.__abortController.abort(/* @__PURE__ */ new Error("deleted"));
					else if (this.#hasDispose || this.#hasDisposeAfter) {
						if (this.#hasDispose) this.#dispose?.(v, k, reason);
						if (this.#hasDisposeAfter) this.#disposed?.push([
							v,
							k,
							reason
						]);
					}
					this.#keyMap.delete(k);
					this.#keyList[index] = void 0;
					this.#valList[index] = void 0;
					if (index === this.#tail) this.#tail = this.#prev[index];
					else if (index === this.#head) this.#head = this.#next[index];
					else {
						const pi = this.#prev[index];
						this.#next[pi] = this.#next[index];
						const ni = this.#next[index];
						this.#prev[ni] = this.#prev[index];
					}
					this.#size--;
					this.#free.push(index);
				}
			}
		}
		if (this.#hasDisposeAfter && this.#disposed?.length) {
			const dt = this.#disposed;
			let task;
			while (task = dt?.shift()) this.#disposeAfter?.(...task);
		}
		return deleted;
	}
	/**
	* Clear the cache entirely, throwing away all values.
	*/
	clear() {
		return this.#clear("delete");
	}
	#clear(reason) {
		for (const index of this.#rindexes({ allowStale: true })) {
			const v = this.#valList[index];
			if (this.#isBackgroundFetch(v)) v.__abortController.abort(/* @__PURE__ */ new Error("deleted"));
			else {
				const k = this.#keyList[index];
				if (this.#hasDispose) this.#dispose?.(v, k, reason);
				if (this.#hasDisposeAfter) this.#disposed?.push([
					v,
					k,
					reason
				]);
			}
		}
		this.#keyMap.clear();
		this.#valList.fill(void 0);
		this.#keyList.fill(void 0);
		if (this.#ttls && this.#starts) {
			this.#ttls.fill(0);
			this.#starts.fill(0);
			for (const t of this.#autopurgeTimers ?? []) if (t !== void 0) clearTimeout(t);
			this.#autopurgeTimers?.fill(void 0);
		}
		if (this.#sizes) this.#sizes.fill(0);
		this.#head = 0;
		this.#tail = 0;
		this.#free.length = 0;
		this.#calculatedSize = 0;
		this.#size = 0;
		if (this.#hasDisposeAfter && this.#disposed) {
			const dt = this.#disposed;
			let task;
			while (task = dt?.shift()) this.#disposeAfter?.(...task);
		}
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiPackratCache.ts
/**
* Subhuti SubhutiPackratCache Cache - 集成 LRU 缓存 + 统计的 SubhutiPackratCache Parsing 管理器 ⭐⭐⭐
*
* 职责：
* - LRU 缓存实现（使用成熟的 lru-cache 库）
* - 统计缓存命中率
* - 应用和存储缓存结果
* - 提供性能分析建议
*
* 设计理念：
* - 使用开源库：基于 lru-cache（10k+ stars，每周 4000万+ 下载）
* - 默认最优：LRU(10000) 生产级配置
* - 零配置：开箱即用
* - 高性能：lru-cache 高度优化，所有操作 O(1)
* - 集成统计：hits/misses/stores 与缓存操作原子化
*
* 使用示例：
* ```typescript
* // 默认配置（推荐 99%）- LRU(10000)
* const cache = new SubhutiPackratCache()
*
* // 自定义缓存大小（大文件）- LRU(50000)
* const cache = new SubhutiPackratCache(50000)
*
* // 无限缓存（小文件 + 内存充足）
* const cache = new SubhutiPackratCache(0)
* ```
*
* 性能：
* - get: O(1) 常数时间
* - set: O(1) 常数时间
* - 统计集成：零额外开销
*/
var SubhutiPackratCache = class {
	/**
	* 构造 SubhutiPackratCache Cache
	*
	* 使用示例：
	* ```typescript
	* // 默认配置（推荐 99%）
	* new SubhutiPackratCache()          → LRU(10000)
	*
	* // 大文件
	* new SubhutiPackratCache(50000)     → LRU(50000)
	*
	* // 超大文件
	* new SubhutiPackratCache(100000)    → LRU(100000)
	*
	* // 无限缓存（小文件 + 内存充足）
	* new SubhutiPackratCache(0)         → Unlimited
	* ```
	*
	* @param maxSize 最大缓存条目数
	*                - 0：无限缓存，永不淘汰
	*                - >0：启用 LRU，达到上限自动淘汰最旧条目
	*                - 默认：10000（适用 99% 场景）
	*/
	constructor(maxSize = 1e4) {
		this.stats = {
			hits: 0,
			misses: 0,
			stores: 0
		};
		this.maxSize = maxSize;
		if (maxSize === 0) this.cache = new LRUCache({ max: Infinity });
		else this.cache = new LRUCache({ max: maxSize });
	}
	/**
	* 查询缓存 - O(1) ⭐⭐⭐
	*
	* 集成功能：
	* - LRU 查找（由 lru-cache 库自动处理）
	* - 统计记录（hits / misses）
	* - 自动更新访问顺序（由 lru-cache 库自动处理）
	*
	* @param ruleName 规则名称
	* @param tokenIndex token 索引
	* @returns 缓存结果，未命中返回 undefined
	*/
	get(ruleName, tokenIndex) {
		const key = `${ruleName}:${tokenIndex}`;
		const result = this.cache.get(key);
		if (result === void 0) {
			this.stats.misses++;
			return;
		}
		this.stats.hits++;
		return result;
	}
	/**
	* 存储缓存 - O(1) ⭐⭐⭐
	*
	* 集成功能：
	* - LRU 存储（由 lru-cache 库自动处理）
	* - 统计记录（stores）
	* - 自动淘汰旧条目（由 lru-cache 库自动处理）
	*
	* @param ruleName 规则名称
	* @param tokenIndex token 索引
	* @param result 缓存结果
	*/
	set(ruleName, tokenIndex, result) {
		const key = `${ruleName}:${tokenIndex}`;
		this.stats.stores++;
		this.cache.set(key, result);
	}
	/**
	* 清空所有缓存
	*
	* 使用场景：
	* - 解析新文件前
	* - 手动清理内存
	* - 测试重置
	*/
	clear() {
		this.cache.clear();
		this.stats.hits = 0;
		this.stats.misses = 0;
		this.stats.stores = 0;
	}
	/**
	* 获取缓存的总条目数
	*/
	get size() {
		return this.cache.size;
	}
	/**
	* 获取缓存统计报告（唯一对外API）⭐
	*
	* 这是获取统计信息的唯一方法，包含完整的分析数据：
	* - 基础统计：hits、misses、stores、total、命中率
	* - 缓存信息：最大容量、当前大小、使用率
	* - 性能建议：根据数据自动生成
	*
	* 使用示例：
	* ```typescript
	* const report = cache.getStatsReport()
	* console.log(`命中率: ${report.hitRate}`)
	* console.log(`建议: ${report.suggestions.join(', ')}`)
	* ```
	*/
	getStatsReport() {
		const total = this.stats.hits + this.stats.misses;
		const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : "0.0";
		const hitRateNum = parseFloat(hitRate);
		const usageRate = this.maxSize > 0 ? (this.size / this.maxSize * 100).toFixed(1) + "%" : "unlimited";
		const suggestions = [];
		if (hitRateNum >= 70) suggestions.push("✅ 缓存命中率优秀（≥ 70%）");
		else if (hitRateNum >= 50) suggestions.push("✅ 缓存命中率良好（50-70%）");
		else if (hitRateNum >= 30) suggestions.push("⚠️ 缓存命中率偏低（30-50%），可能语法复杂");
		else suggestions.push("❌ 缓存命中率低（< 30%），建议检查语法规则");
		if (this.maxSize > 0) {
			const usageRatio = this.size / this.maxSize;
			if (usageRatio > .9) suggestions.push("⚠️ 缓存使用率高（> 90%），建议增加 maxSize");
			else if (usageRatio > .7) suggestions.push("⚠️ 缓存使用率较高（70-90%），可考虑增加 maxSize");
			if (usageRatio < .1 && total > 1e4) suggestions.push("💡 缓存使用率低（< 10%），可考虑减小 maxSize 节省内存");
		}
		return {
			hits: this.stats.hits,
			misses: this.stats.misses,
			stores: this.stats.stores,
			total,
			hitRate: `${hitRate}%`,
			maxCacheSize: this.maxSize,
			currentSize: this.size,
			usageRate,
			suggestions
		};
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiTokenConsumer.ts
var SubhutiTokenConsumer = class {
	constructor(parser) {
		this.parser = parser;
	}
	/**
	* 消费一个 token（修改 Parser 状态）
	* @param tokenName token 名称（来自 TokenNames）
	* @param goal 可选的词法目标（用于模板尾部等场景）
	*/
	consume(tokenName, goal) {
		return this.parser._consumeToken(tokenName, goal);
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiLexer.ts
/**
* 正则表达式字面量的 pattern（用于 Parser 层的 rescan）
* 根据 ECMAScript 规范，RegularExpressionFirstChar 不能是 * (避免与 /* 注释冲突)
*/
const REGEXP_LITERAL_PATTERN = /^\/(?:[^\n\r\/\\[*]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])*\/[dgimsuvy]*/;
/**
* 尝试匹配正则表达式字面量
* 用于 Parser 层在需要时重新扫描 Slash 为 RegularExpressionLiteral
*
* @param text 要匹配的文本（应以 / 开头）
* @returns 匹配的正则表达式字面量字符串，或 null
*/
function matchRegExpLiteral(text) {
	const match = text.match(REGEXP_LITERAL_PATTERN);
	return match ? match[0] : null;
}
/**
* 词法目标（对应 ECMAScript 规范的 InputElement）
*/
let LexicalGoal = /* @__PURE__ */ function(LexicalGoal$1) {
	/** InputElementDiv - 期望除法运算符 */
	LexicalGoal$1["InputElementDiv"] = "InputElementDiv";
	/** InputElementRegExp - 期望正则表达式 */
	LexicalGoal$1["InputElementRegExp"] = "InputElementRegExp";
	/** InputElementTemplateTail - 期望模板尾部（} 开头的模板部分） */
	LexicalGoal$1["InputElementTemplateTail"] = "InputElementTemplateTail";
	return LexicalGoal$1;
}({});
const SubhutiLexerTokenNames = {
	TemplateHead: "TemplateHead",
	TemplateMiddle: "TemplateMiddle",
	TemplateTail: "TemplateTail"
};
/**
* Subhuti Lexer - 词法分析器
* 
* 核心特性：
* - 预编译正则（构造时一次性处理）
* - 词法层 lookahead（OptionalChaining 等）
* - 模板字符串状态管理（InputElement 切换）
* 
* @version 1.0.0
*/
var SubhutiLexer = class {
	constructor(tokens) {
		this._templateDepth = 0;
		this._lastRowNum = 1;
		this._allTokens = tokens.map((token) => {
			if (!token.pattern) return token;
			return {
				...token,
				pattern: new RegExp("^(?:" + token.pattern.source + ")", token.pattern.flags)
			};
		});
		this._tokensOutsideTemplate = this._allTokens.filter((t) => t.name !== SubhutiLexerTokenNames.TemplateMiddle && t.name !== SubhutiLexerTokenNames.TemplateTail);
	}
	/**
	* 词法分析主入口
	* @param code 源代码
	* @returns Token 流
	*/
	tokenize(code) {
		const result = [];
		let index = 0;
		let rowNum = 1;
		let columnNum = 1;
		this._lastRowNum = 1;
		while (index < code.length) {
			const matched = this._matchToken(code, index, rowNum, columnNum, result);
			if (!matched) {
				const errorChar = code[index];
				throw new Error(`Unexpected character "${errorChar}" at position ${index} (line ${rowNum}, column ${columnNum})`);
			}
			if (!matched.skip) {
				result.push(matched.token);
				this._lastRowNum = rowNum;
			}
			const valueLength = matched.token.tokenValue.length;
			index += valueLength;
			const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g);
			if (lineBreaks && lineBreaks.length > 0) {
				rowNum += lineBreaks.length;
				const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1]);
				const lastBreakLen = lineBreaks[lineBreaks.length - 1].length;
				columnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1;
			} else columnNum += valueLength;
			this._updateTemplateDepth(matched.token.tokenName);
		}
		return result;
	}
	_matchToken(code, index, rowNum, columnNum, matchedTokens) {
		const remaining = code.slice(index);
		const lastTokenName = matchedTokens.length > 0 ? matchedTokens[matchedTokens.length - 1].tokenName : null;
		for (const token of this._getActiveTokens()) {
			const match = remaining.match(token.pattern);
			if (!match) continue;
			if (token.contextConstraint?.onlyAtStart && index !== 0) continue;
			if (token.contextConstraint?.onlyAtLineStart && rowNum <= this._lastRowNum) continue;
			if (token.contextConstraint?.onlyAfter) {
				if (!lastTokenName || !token.contextConstraint.onlyAfter.has(lastTokenName)) continue;
			}
			if (token.contextConstraint?.notAfter) {
				if (lastTokenName && token.contextConstraint.notAfter.has(lastTokenName)) continue;
			}
			if (token.lookaheadAfter?.not) {
				const afterText = remaining.slice(match[0].length);
				const { not } = token.lookaheadAfter;
				if (not instanceof RegExp ? not.test(afterText) : afterText.startsWith(not)) continue;
			}
			return {
				token: this._createMatchToken(token, match[0], index, rowNum, columnNum),
				skip: token.skip
			};
		}
		return null;
	}
	_createMatchToken(token, value, index, rowNum, columnNum) {
		return {
			tokenName: token.name,
			tokenValue: value,
			index,
			rowNum,
			columnStartNum: columnNum,
			columnEndNum: columnNum + value.length - 1,
			hasLineBreakBefore: rowNum > this._lastRowNum
		};
	}
	/**
	* 根据模板深度返回活跃的 tokens
	* 实现 ECMAScript 规范的 InputElement 切换机制
	* 
	* 使用预编译策略：构造时过滤一次，运行时只选择数组（性能优化）
	*/
	_getActiveTokens() {
		return this._templateDepth > 0 ? this._allTokens : this._tokensOutsideTemplate;
	}
	/**
	* 更新模板字符串嵌套深度
	*
	* 实现 ECMAScript 规范的 InputElement 切换机制：
	* - TemplateHead (`${`) 进入模板上下文（深度 +1）
	* - TemplateTail (}`) 退出模板上下文（深度 -1）
	* - TemplateMiddle: 保持深度不变
	*
	* 参考实现：Babel、Acorn、TypeScript Scanner
	* 行业标准做法：直接硬编码 token 名称，无需配置
	*/
	_updateTemplateDepth(tokenName) {
		if (tokenName === SubhutiLexerTokenNames.TemplateHead) this._templateDepth++;
		else if (tokenName === SubhutiLexerTokenNames.TemplateTail) this._templateDepth--;
	}
	/**
	* 尝试匹配模板 token (TemplateMiddle 或 TemplateTail)
	* 仅在 InputElementTemplateTail 模式下使用
	*/
	_matchTemplateToken(remaining, index, rowNum, columnNum) {
		for (const token of this._allTokens) {
			if (token.name !== SubhutiLexerTokenNames.TemplateMiddle && token.name !== SubhutiLexerTokenNames.TemplateTail) continue;
			const match = remaining.match(token.pattern);
			if (match) return {
				token: this._createMatchTokenWithLastRow(token.name, match[0], index, rowNum, columnNum, rowNum),
				skip: false
			};
		}
		return null;
	}
	/**
	* 创建初始词法状态
	*/
	createInitialState() {
		return {
			position: 0,
			rowNum: 1,
			columnNum: 1,
			templateDepth: 0,
			lastTokenRowNum: 1,
			lastTokenName: null
		};
	}
	/**
	* 按需读取下一个 token
	*
	* @param code 源代码
	* @param state 当前词法状态（会被修改）
	* @param lexicalGoal 词法目标（InputElementDiv 或 InputElementRegExp）
	* @returns token 或 null（EOF）
	*/
	readNextToken(code, state, lexicalGoal = LexicalGoal.InputElementDiv) {
		while (state.position < code.length) {
			const matched = this._matchTokenWithGoal(code, state.position, state.rowNum, state.columnNum, state.lastTokenName, state.templateDepth, lexicalGoal);
			if (!matched) {
				const errorChar = code[state.position];
				throw new Error(`Unexpected character "${errorChar}" at position ${state.position} (line ${state.rowNum}, column ${state.columnNum})`);
			}
			const valueLength = matched.token.tokenValue.length;
			state.position += valueLength;
			const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g);
			if (lineBreaks && lineBreaks.length > 0) {
				state.rowNum += lineBreaks.length;
				const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1]);
				const lastBreakLen = lineBreaks[lineBreaks.length - 1].length;
				state.columnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1;
			} else state.columnNum += valueLength;
			if (matched.token.tokenName === SubhutiLexerTokenNames.TemplateHead) state.templateDepth++;
			else if (matched.token.tokenName === SubhutiLexerTokenNames.TemplateTail) state.templateDepth--;
			if (matched.skip) continue;
			state.lastTokenRowNum = matched.token.rowNum;
			state.lastTokenName = matched.token.tokenName;
			return matched.token;
		}
		return null;
	}
	/**
	* 检查是否到达文件末尾
	*/
	isEOF(code, state) {
		let pos = state.position;
		while (pos < code.length) {
			const remaining = code.slice(pos);
			const whitespaceMatch = remaining.match(/^[\s]+/);
			if (whitespaceMatch) {
				pos += whitespaceMatch[0].length;
				continue;
			}
			const singleLineComment = remaining.match(/^\/\/[^\n\r]*/);
			if (singleLineComment) {
				pos += singleLineComment[0].length;
				continue;
			}
			const multiLineComment = remaining.match(/^\/\*[\s\S]*?\*\//);
			if (multiLineComment) {
				pos += multiLineComment[0].length;
				continue;
			}
			return false;
		}
		return true;
	}
	/**
	* 带词法目标的 token 匹配
	*/
	_matchTokenWithGoal(code, index, rowNum, columnNum, lastTokenName, templateDepth, lexicalGoal) {
		const remaining = code.slice(index);
		const activeTokens = this._tokensOutsideTemplate;
		for (const token of activeTokens) {
			if (lexicalGoal === LexicalGoal.InputElementTemplateTail) {
				const templateMatch = this._matchTemplateToken(remaining, index, rowNum, columnNum);
				if (templateMatch) return templateMatch;
			}
			if (token.name === "Slash" || token.name === "DivideAssign") {
				if (lexicalGoal === LexicalGoal.InputElementRegExp && remaining.startsWith("/")) {
					const regexpMatch = matchRegExpLiteral(remaining);
					if (regexpMatch) return {
						token: this._createMatchTokenWithLastRow("RegularExpressionLiteral", regexpMatch, index, rowNum, columnNum, rowNum),
						skip: false
					};
				}
			}
			const match = remaining.match(token.pattern);
			if (!match) continue;
			if (token.contextConstraint?.onlyAtStart && index !== 0) continue;
			if (token.contextConstraint?.onlyAtLineStart && rowNum <= this._lastRowNum) continue;
			if (token.contextConstraint?.onlyAfter) {
				if (!lastTokenName || !token.contextConstraint.onlyAfter.has(lastTokenName)) continue;
			}
			if (token.contextConstraint?.notAfter) {
				if (lastTokenName && token.contextConstraint.notAfter.has(lastTokenName)) continue;
			}
			if (token.lookaheadAfter?.not) {
				const afterText = remaining.slice(match[0].length);
				const { not } = token.lookaheadAfter;
				if (not instanceof RegExp ? not.test(afterText) : afterText.startsWith(not)) continue;
			}
			return {
				token: this._createMatchTokenWithLastRow(token.name, match[0], index, rowNum, columnNum, this._lastRowNum),
				skip: token.skip
			};
		}
		return null;
	}
	/**
	* 在指定位置用指定模式读取单个 token
	*
	* @param code 源代码
	* @param codeIndex 起始位置
	* @param line 起始行号
	* @param column 起始列号
	* @param goal 词法目标
	* @param lastTokenName 上一个 token 的名称（用于上下文约束）
	* @param templateDepth 模板字符串深度
	* @returns TokenCacheEntry 或 null（EOF）
	*/
	readTokenAt(code, codeIndex, line, column, goal, lastTokenName = null, templateDepth = 0) {
		let pos = codeIndex;
		let rowNum = line;
		let columnNum = column;
		let lastRowNum = line;
		let currentLastTokenName = lastTokenName;
		while (pos < code.length) {
			const matched = this._matchTokenWithGoal(code, pos, rowNum, columnNum, currentLastTokenName, templateDepth, goal);
			if (!matched) {
				const errorChar = code[pos];
				throw new Error(`Unexpected character "${errorChar}" at position ${pos} (line ${rowNum}, column ${columnNum})`);
			}
			const valueLength = matched.token.tokenValue.length;
			const nextPos = pos + valueLength;
			let nextRowNum = rowNum;
			let nextColumnNum = columnNum;
			const lineBreaks = matched.token.tokenValue.match(/\r\n|[\n\r\u2028\u2029]/g);
			if (lineBreaks && lineBreaks.length > 0) {
				nextRowNum += lineBreaks.length;
				const lastBreakIndex = matched.token.tokenValue.lastIndexOf(lineBreaks[lineBreaks.length - 1]);
				const lastBreakLen = lineBreaks[lineBreaks.length - 1].length;
				nextColumnNum = matched.token.tokenValue.length - lastBreakIndex - lastBreakLen + 1;
			} else nextColumnNum += valueLength;
			if (matched.skip) {
				pos = nextPos;
				rowNum = nextRowNum;
				columnNum = nextColumnNum;
				continue;
			}
			const token = {
				tokenName: matched.token.tokenName,
				tokenValue: matched.token.tokenValue,
				index: pos,
				rowNum,
				columnStartNum: columnNum,
				columnEndNum: columnNum + valueLength - 1,
				hasLineBreakBefore: rowNum > lastRowNum
			};
			return {
				token,
				nextCodeIndex: nextPos,
				nextLine: nextRowNum,
				nextColumn: nextColumnNum,
				lastTokenName: token.tokenName
			};
		}
		return null;
	}
	/**
	* 创建 token（带 lastRowNum 参数）
	*/
	_createMatchTokenWithLastRow(tokenName, value, index, rowNum, columnNum, lastRowNum) {
		return {
			tokenName,
			tokenValue: value,
			index,
			rowNum,
			columnStartNum: columnNum,
			columnEndNum: columnNum + value.length - 1,
			hasLineBreakBefore: rowNum > lastRowNum
		};
	}
};

//#endregion
//#region ../../subhuti/src/validation/SubhutiRuleCollector.ts
/**
* 规则收集器
*
* 职责：
* 1. 启用 Parser 的分析模式（不抛异常）
* 2. 创建 Parser 的 Proxy 代理
* 3. 拦截 Or/Many/Option/AtLeastOne/consume 方法调用
* 4. 记录调用序列形成 AST
*
* 优势：
* - Parser 代码完全干净，无需任何验证相关代码
* - 验证逻辑完全独立，易于维护
* - 生产环境零性能开销
* - 不使用异常控制流程，性能更好
*/
var SubhutiRuleCollector = class SubhutiRuleCollector {
	constructor() {
		this.ruleASTs = /* @__PURE__ */ new Map();
		this.tokenAstCache = /* @__PURE__ */ new Map();
		this.currentRuleStack = [];
		this.currentRuleName = "";
		this.isExecutingTopLevelRule = false;
		this.executingRuleStack = /* @__PURE__ */ new Set();
	}
	/**
	* 收集所有规则 - 静态方法
	*
	* @param parser Parser 实例
	* @returns 规则名称 → AST 的映射
	*/
	static collectRules(parser) {
		return new SubhutiRuleCollector().collect(parser);
	}
	/**
	* 收集所有规则（私有实现）
	*/
	collect(parser) {
		parser.enableAnalysisMode();
		const proxy = this.createAnalyzeProxy(parser);
		const ruleNames = this.getAllRuleNames(parser);
		for (const ruleName of ruleNames) this.collectRule(proxy, ruleName);
		parser.disableAnalysisMode();
		return {
			cstMap: this.ruleASTs,
			tokenMap: this.tokenAstCache
		};
	}
	/**
	* 创建分析代理（拦截 Parser 方法调用）
	*/
	createAnalyzeProxy(parser) {
		const collector = this;
		const proxy = new Proxy(parser, { get(target, prop) {
			if (prop === "Or") {
				[
					"ConditionalExpression",
					"AssignmentExpression",
					"Expression",
					"Statement"
				].includes(collector.currentRuleName);
				return (alternatives) => {
					return collector.handleOr(alternatives, proxy);
				};
			}
			if (prop === "Many") return (fn) => collector.handleMany(fn, proxy);
			if (prop === "Option") return (fn) => collector.handleOption(fn, proxy);
			if (prop === "AtLeastOne") return (fn) => collector.handleAtLeastOne(fn, proxy);
			if (prop === "consume" || prop === "_consumeToken") return (tokenName) => collector.handleConsume(tokenName);
			if (prop === "tokenConsumer") {
				const originalConsumer = Reflect.get(target, prop);
				return collector.createTokenConsumerProxy(originalConsumer);
			}
			const original = Reflect.get(target, prop);
			if (typeof original === "function" && typeof prop === "string" && /^[A-Z]/.test(prop) && ![
				"Or",
				"Many",
				"Option",
				"AtLeastOne",
				"consume",
				"_consumeToken",
				"tokenConsumer"
			].includes(prop)) return function(...args) {
				[
					"ConditionalExpression",
					"AssignmentExpression",
					"Expression",
					"Statement"
				].includes(prop);
				if (collector.isExecutingTopLevelRule && prop === collector.currentRuleName) {
					collector.isExecutingTopLevelRule = false;
					if (collector.executingRuleStack.has(prop)) return collector.handleSubrule(prop);
					collector.executingRuleStack.add(prop);
					try {
						return (original.__originalFunction__ || original).call(proxy, ...args);
					} finally {
						collector.executingRuleStack.delete(prop);
					}
				}
				return collector.handleSubrule(prop);
			};
			return original;
		} });
		return proxy;
	}
	/**
	* 创建 TokenConsumer 代理（拦截 token 消费调用）
	*/
	createTokenConsumerProxy(tokenConsumer) {
		const collector = this;
		return new Proxy(tokenConsumer, { get(target, prop) {
			const original = Reflect.get(target, prop);
			if (typeof original === "function" && typeof prop === "string") return function(...args) {
				collector.handleConsume(prop);
			};
			return original;
		} });
	}
	/**
	* 收集单个规则
	*
	* 异常处理说明：
	* - ✅ Parser 在分析模式下不会抛出解析相关的异常（左递归、无限循环、Token 消费失败等）
	* - ✅ 但仍需 try-catch 捕获业务逻辑错误（如废弃方法主动抛出的 Error）
	* - ✅ 即使抛出错误，Proxy 也已经收集到了部分 AST，仍然保存
	*
	* 这与之前的设计不同：
	* - 之前：依赖异常来控制流程（不好的设计）
	* - 现在：只捕获真正的业务错误（正常的异常处理）
	*/
	collectRule(proxy, ruleName) {
		const startTime = Date.now();
		this.currentRuleName = ruleName;
		this.currentRuleStack = [];
		this.isExecutingTopLevelRule = false;
		const rootNode = {
			type: "sequence",
			ruleName,
			nodes: []
		};
		this.currentRuleStack.push(rootNode);
		try {
			const ruleMethod = proxy[ruleName];
			if (typeof ruleMethod === "function") {
				this.isExecutingTopLevelRule = true;
				ruleMethod.call(proxy);
				this.isExecutingTopLevelRule = false;
			}
			this.ruleASTs.set(ruleName, rootNode);
			const elapsed = Date.now() - startTime;
			if (elapsed > 1e4) console.error(`❌❌❌ Rule "${ruleName}" took ${elapsed}ms (${(elapsed / 1e3).toFixed(2)}s) - EXTREMELY SLOW!`);
		} catch (error) {
			this.ruleASTs.set(ruleName, rootNode);
			Date.now() - startTime;
		}
	}
	/**
	* 获取所有规则名称（遍历整个原型链，只收集被 @SubhutiRule 装饰的方法）
	*
	* 通过检查 __isSubhutiRule__ 元数据标记来区分规则方法和普通方法
	*/
	getAllRuleNames(parser) {
		const ruleNames = /* @__PURE__ */ new Set();
		let prototype = Object.getPrototypeOf(parser);
		while (prototype && prototype !== Object.prototype) {
			for (const key of Object.getOwnPropertyNames(prototype)) {
				if (key === "constructor") continue;
				const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
				if (descriptor && typeof descriptor.value === "function") {
					if (descriptor.value.__isSubhutiRule__ === true) ruleNames.add(key);
				}
			}
			prototype = Object.getPrototypeOf(prototype);
		}
		return Array.from(ruleNames);
	}
	/**
	* 处理 Or 规则
	*/
	handleOr(alternatives, target) {
		const altNodes = [];
		for (let i = 0; i < alternatives.length; i++) {
			const alt = alternatives[i];
			this.currentRuleStack.push({
				type: "sequence",
				nodes: []
			});
			try {
				alt.alt.call(target);
				const result = this.currentRuleStack.pop();
				if (result) altNodes.push(result);
			} catch (error) {
				const result = this.currentRuleStack.pop();
				if (result && result.nodes && result.nodes.length > 0) altNodes.push(result);
			}
		}
		if (altNodes.length > 0) this.recordNode({
			type: "or",
			alternatives: altNodes
		});
	}
	/**
	* 处理 Many 规则
	*/
	handleMany(fn, target) {
		this.currentRuleStack.push({
			type: "sequence",
			nodes: []
		});
		try {
			fn.call(target);
			const innerNode = this.currentRuleStack.pop();
			if (innerNode) this.recordNode({
				type: "many",
				node: innerNode
			});
		} catch (error) {
			const innerNode = this.currentRuleStack.pop();
			if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) this.recordNode({
				type: "many",
				node: innerNode
			});
		}
	}
	/**
	* 处理 Option 规则
	*/
	handleOption(fn, target) {
		this.currentRuleStack.push({
			type: "sequence",
			nodes: []
		});
		try {
			fn.call(target);
			const innerNode = this.currentRuleStack.pop();
			if (innerNode) this.recordNode({
				type: "option",
				node: innerNode
			});
		} catch (error) {
			const innerNode = this.currentRuleStack.pop();
			if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) this.recordNode({
				type: "option",
				node: innerNode
			});
		}
	}
	/**
	* 处理 AtLeastOne 规则
	*/
	handleAtLeastOne(fn, target) {
		this.currentRuleStack.push({
			type: "sequence",
			nodes: []
		});
		try {
			fn.call(target);
			const innerNode = this.currentRuleStack.pop();
			if (innerNode) this.recordNode({
				type: "atLeastOne",
				node: innerNode
			});
		} catch (error) {
			const innerNode = this.currentRuleStack.pop();
			if (innerNode && innerNode.nodes && innerNode.nodes.length > 0) this.recordNode({
				type: "atLeastOne",
				node: innerNode
			});
		}
	}
	/**
	* 处理 consume
	*/
	handleConsume(tokenName) {
		const tokenNode = {
			type: "consume",
			tokenName
		};
		this.tokenAstCache.set(tokenName, tokenNode);
		this.recordNode(tokenNode);
	}
	/**
	* 处理子规则调用
	*/
	handleSubrule(ruleName) {
		this.recordNode({
			type: "subrule",
			ruleName
		});
	}
	/**
	* 记录节点到当前序列
	*/
	recordNode(node$1) {
		const currentSeq = this.currentRuleStack[this.currentRuleStack.length - 1];
		if (currentSeq) currentSeq.nodes.push(node$1);
	}
};

//#endregion
//#region ../../subhuti/src/validation/ArrayTria.ts
/**
* 前缀树节点（针对字符串数组）
*
* 核心设计：
* - children: Map<string, ArrayTrieNode> - 存储子节点，key 是 token（字符串）
* - fullPaths: string[][] - 存储所有经过此节点的完整路径
*
* 示例：
* 路径 ["If", "LParen", "Expression"] 会创建：
* root -> "If" -> "LParen" -> "Expression"
* 每个节点都会存储完整路径的引用
*/
var ArrayTrieNode = class {
	constructor() {
		this.children = /* @__PURE__ */ new Map();
		this.fullPaths = [];
	}
};
/**
* 字符串数组前缀树
*
* 核心原理：
* 1. 将字符串数组中的每个字符串当作基本单元（类似字符）
* 2. 构建树形结构，共享相同前缀
* 3. 查询时只需遍历前缀的 token，无需遍历所有路径
*/
var ArrayTrie = class {
	constructor() {
		this.root = new ArrayTrieNode();
	}
	/**
	* 插入路径到前缀树
	*
	* 核心逻辑：
	* 1. 从 root 开始
	* 2. 遍历路径的每个 token（字符串）
	* 3. 如果子节点不存在，创建新节点
	* 4. 移动到子节点
	* 5. 在每个节点存储完整路径的引用
	*
	* 时间复杂度：O(k)，k=路径长度（token数）
	*/
	insert(path$1) {
		let node$1 = this.root;
		for (const ruleName of path$1) {
			if (!node$1.children.has(ruleName)) node$1.children.set(ruleName, new ArrayTrieNode());
			node$1 = node$1.children.get(ruleName);
			node$1.fullPaths.push(path$1);
		}
	}
	/**
	* 查找完全相同的路径
	*/
	findEqual(path$1) {
		let node$1 = this.root;
		for (const token of path$1) {
			if (!node$1.children.has(token)) return null;
			node$1 = node$1.children.get(token);
		}
		for (const fullPath of node$1.fullPaths) if (this.isEqual(path$1, fullPath)) return fullPath;
		return null;
	}
	/**
	* 查找以 prefix 为前缀的路径（且不等于 prefix）
	*
	* 核心逻辑：
	* 1. 从 root 开始
	* 2. 沿着 prefix 的每个 token 向下遍历
	* 3. 如果找不到对应的子节点，返回 null
	* 4. 找到前缀节点后，检查 fullPaths 中是否有更长的路径
	* 5. 返回第一个匹配的完整路径
	*
	* 时间复杂度：O(k)，k=前缀长度（token数）
	*/
	findPrefixMatch(prefix) {
		let node$1 = this.root;
		for (const token of prefix) {
			if (!node$1.children.has(token)) return null;
			node$1 = node$1.children.get(token);
		}
		for (const fullPath of node$1.fullPaths) if (this.isPrefix(prefix, fullPath)) return fullPath;
		return null;
	}
	/**
	* 检查两个路径数组是否完全相同
	*
	* 核心逻辑：
	* 1. 长度必须相同
	* 2. 逐个比较 token，必须完全相同
	*
	* 时间复杂度：O(k)，k=路径长度
	*
	* @returns 如果两个路径完全相同返回 true，否则返回 false
	* @param prefix
	* @param fullPath
	*/
	isEqual(prefix, fullPath) {
		if (prefix.length !== fullPath.length) return false;
		for (let i = 0; i < prefix.length; i++) if (prefix[i] !== fullPath[i]) return false;
		return true;
	}
	/**
	* 检查 prefix 是否是 fullPath 的前缀
	*
	* 核心逻辑：
	* 1. 前缀必须比完整路径短
	* 2. 逐个比较 token，必须完全相同
	*
	* 时间复杂度：O(k)，k=前缀长度
	*/
	isPrefix(prefix, fullPath) {
		if (fullPath.length < prefix.length) return false;
		for (let i = 0; i < prefix.length; i++) if (prefix[i] !== fullPath[i]) return false;
		return true;
	}
};

//#endregion
//#region ../../node_modules/fast-cartesian/build/src/validate.js
const validateInputs = (inputs) => {
	if (!Array.isArray(inputs)) throw new TypeError("Argument must be an array of arrays");
	inputs.forEach(validateInput);
	validateDimensions(inputs);
	validateCombinations(inputs);
};
const validateInput = (input) => {
	if (!Array.isArray(input)) throw new TypeError(`Argument must be an array: ${input}`);
};
const validateDimensions = ({ length }) => {
	if (length >= MAX_DIMENSIONS) throw new TypeError(`Too many arrays (${length}): please use the 'big-cartesian' library instead of 'fast-cartesian'`);
};
const MAX_DIMENSIONS = 100;
const validateCombinations = (inputs) => {
	const size = inputs.reduce(multiplySize, 1);
	if (size >= MAX_SIZE) {
		const sizeStr = Number.isFinite(size) ? ` (${size.toExponential(0)})` : "";
		throw new TypeError(`Too many combinations${sizeStr}: please use the 'big-cartesian' library instead of 'fast-cartesian'`);
	}
};
const multiplySize = (size, input) => size * input.length;
const MAX_SIZE = 2 ** 32;

//#endregion
//#region ../../node_modules/fast-cartesian/build/src/main.js
const fastCartesian = (inputs) => {
	validateInputs(inputs);
	const result = [];
	if (inputs.length === 0) return result;
	getLoopFunc(inputs.length)(inputs, result);
	return result;
};
var main_default = fastCartesian;
const getLoopFunc = (length) => {
	const cachedLoopFunc = cache[length];
	if (cachedLoopFunc !== void 0) return cachedLoopFunc;
	const loopFunc = mGetLoopFunc(length);
	cache[length] = loopFunc;
	return loopFunc;
};
const cache = {};
const mGetLoopFunc = (length) => {
	const indexes = Array.from({ length }, getIndex);
	const start = indexes.map((index) => `for (const value${index} of arrays[${index}]) {`).join("\n");
	const middle = indexes.map((index) => `value${index}`).join(", ");
	const end = "}\n".repeat(length);
	return new Function("arrays", "result", `${start}\nresult.push([${middle}])\n${end}`);
};
const getIndex = (value, index) => String(index);

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/graph.js
var require_graph = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DEFAULT_EDGE_NAME = "\0";
	var GRAPH_NODE = "\0";
	var EDGE_KEY_DELIM = "";
	var Graph$3 = class {
		_isDirected = true;
		_isMultigraph = false;
		_isCompound = false;
		_label;
		_defaultNodeLabelFn = () => void 0;
		_defaultEdgeLabelFn = () => void 0;
		_nodes = {};
		_in = {};
		_preds = {};
		_out = {};
		_sucs = {};
		_edgeObjs = {};
		_edgeLabels = {};
		_nodeCount = 0;
		_edgeCount = 0;
		_parent;
		_children;
		constructor(opts) {
			if (opts) {
				this._isDirected = Object.hasOwn(opts, "directed") ? opts.directed : true;
				this._isMultigraph = Object.hasOwn(opts, "multigraph") ? opts.multigraph : false;
				this._isCompound = Object.hasOwn(opts, "compound") ? opts.compound : false;
			}
			if (this._isCompound) {
				this._parent = {};
				this._children = {};
				this._children[GRAPH_NODE] = {};
			}
		}
		/**
		* Whether graph was created with 'directed' flag set to true or not.
		*/
		isDirected() {
			return this._isDirected;
		}
		/**
		* Whether graph was created with 'multigraph' flag set to true or not.
		*/
		isMultigraph() {
			return this._isMultigraph;
		}
		/**
		* Whether graph was created with 'compound' flag set to true or not.
		*/
		isCompound() {
			return this._isCompound;
		}
		/**
		* Sets the label of the graph.
		*/
		setGraph(label) {
			this._label = label;
			return this;
		}
		/**
		* Gets the graph label.
		*/
		graph() {
			return this._label;
		}
		/**
		* Sets the default node label. If newDefault is a function, it will be
		* invoked ach time when setting a label for a node. Otherwise, this label
		* will be assigned as default label in case if no label was specified while
		* setting a node.
		* Complexity: O(1).
		*/
		setDefaultNodeLabel(newDefault) {
			this._defaultNodeLabelFn = newDefault;
			if (typeof newDefault !== "function") this._defaultNodeLabelFn = () => newDefault;
			return this;
		}
		/**
		* Gets the number of nodes in the graph.
		* Complexity: O(1).
		*/
		nodeCount() {
			return this._nodeCount;
		}
		/**
		* Gets all nodes of the graph. Note, the in case of compound graph subnodes are
		* not included in list.
		* Complexity: O(1).
		*/
		nodes() {
			return Object.keys(this._nodes);
		}
		/**
		* Gets list of nodes without in-edges.
		* Complexity: O(|V|).
		*/
		sources() {
			var self = this;
			return this.nodes().filter((v) => Object.keys(self._in[v]).length === 0);
		}
		/**
		* Gets list of nodes without out-edges.
		* Complexity: O(|V|).
		*/
		sinks() {
			var self = this;
			return this.nodes().filter((v) => Object.keys(self._out[v]).length === 0);
		}
		/**
		* Invokes setNode method for each node in names list.
		* Complexity: O(|names|).
		*/
		setNodes(vs, value) {
			var args = arguments;
			var self = this;
			vs.forEach(function(v) {
				if (args.length > 1) self.setNode(v, value);
				else self.setNode(v);
			});
			return this;
		}
		/**
		* Creates or updates the value for the node v in the graph. If label is supplied
		* it is set as the value for the node. If label is not supplied and the node was
		* created by this call then the default node label will be assigned.
		* Complexity: O(1).
		*/
		setNode(v, value) {
			if (Object.hasOwn(this._nodes, v)) {
				if (arguments.length > 1) this._nodes[v] = value;
				return this;
			}
			this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
			if (this._isCompound) {
				this._parent[v] = GRAPH_NODE;
				this._children[v] = {};
				this._children[GRAPH_NODE][v] = true;
			}
			this._in[v] = {};
			this._preds[v] = {};
			this._out[v] = {};
			this._sucs[v] = {};
			++this._nodeCount;
			return this;
		}
		/**
		* Gets the label of node with specified name.
		* Complexity: O(|V|).
		*/
		node(v) {
			return this._nodes[v];
		}
		/**
		* Detects whether graph has a node with specified name or not.
		*/
		hasNode(v) {
			return Object.hasOwn(this._nodes, v);
		}
		/**
		* Remove the node with the name from the graph or do nothing if the node is not in
		* the graph. If the node was removed this function also removes any incident
		* edges.
		* Complexity: O(1).
		*/
		removeNode(v) {
			var self = this;
			if (Object.hasOwn(this._nodes, v)) {
				var removeEdge = (e) => self.removeEdge(self._edgeObjs[e]);
				delete this._nodes[v];
				if (this._isCompound) {
					this._removeFromParentsChildList(v);
					delete this._parent[v];
					this.children(v).forEach(function(child) {
						self.setParent(child);
					});
					delete this._children[v];
				}
				Object.keys(this._in[v]).forEach(removeEdge);
				delete this._in[v];
				delete this._preds[v];
				Object.keys(this._out[v]).forEach(removeEdge);
				delete this._out[v];
				delete this._sucs[v];
				--this._nodeCount;
			}
			return this;
		}
		/**
		* Sets node p as a parent for node v if it is defined, or removes the
		* parent for v if p is undefined. Method throws an exception in case of
		* invoking it in context of noncompound graph.
		* Average-case complexity: O(1).
		*/
		setParent(v, parent) {
			if (!this._isCompound) throw new Error("Cannot set parent in a non-compound graph");
			if (parent === void 0) parent = GRAPH_NODE;
			else {
				parent += "";
				for (var ancestor = parent; ancestor !== void 0; ancestor = this.parent(ancestor)) if (ancestor === v) throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
				this.setNode(parent);
			}
			this.setNode(v);
			this._removeFromParentsChildList(v);
			this._parent[v] = parent;
			this._children[parent][v] = true;
			return this;
		}
		_removeFromParentsChildList(v) {
			delete this._children[this._parent[v]][v];
		}
		/**
		* Gets parent node for node v.
		* Complexity: O(1).
		*/
		parent(v) {
			if (this._isCompound) {
				var parent = this._parent[v];
				if (parent !== GRAPH_NODE) return parent;
			}
		}
		/**
		* Gets list of direct children of node v.
		* Complexity: O(1).
		*/
		children(v = GRAPH_NODE) {
			if (this._isCompound) {
				var children = this._children[v];
				if (children) return Object.keys(children);
			} else if (v === GRAPH_NODE) return this.nodes();
			else if (this.hasNode(v)) return [];
		}
		/**
		* Return all nodes that are predecessors of the specified node or undefined if node v is not in
		* the graph. Behavior is undefined for undirected graphs - use neighbors instead.
		* Complexity: O(|V|).
		*/
		predecessors(v) {
			var predsV = this._preds[v];
			if (predsV) return Object.keys(predsV);
		}
		/**
		* Return all nodes that are successors of the specified node or undefined if node v is not in
		* the graph. Behavior is undefined for undirected graphs - use neighbors instead.
		* Complexity: O(|V|).
		*/
		successors(v) {
			var sucsV = this._sucs[v];
			if (sucsV) return Object.keys(sucsV);
		}
		/**
		* Return all nodes that are predecessors or successors of the specified node or undefined if
		* node v is not in the graph.
		* Complexity: O(|V|).
		*/
		neighbors(v) {
			var preds = this.predecessors(v);
			if (preds) {
				const union = new Set(preds);
				for (var succ of this.successors(v)) union.add(succ);
				return Array.from(union.values());
			}
		}
		isLeaf(v) {
			var neighbors;
			if (this.isDirected()) neighbors = this.successors(v);
			else neighbors = this.neighbors(v);
			return neighbors.length === 0;
		}
		/**
		* Creates new graph with nodes filtered via filter. Edges incident to rejected node
		* are also removed. In case of compound graph, if parent is rejected by filter,
		* than all its children are rejected too.
		* Average-case complexity: O(|E|+|V|).
		*/
		filterNodes(filter) {
			var copy = new this.constructor({
				directed: this._isDirected,
				multigraph: this._isMultigraph,
				compound: this._isCompound
			});
			copy.setGraph(this.graph());
			var self = this;
			Object.entries(this._nodes).forEach(function([v, value]) {
				if (filter(v)) copy.setNode(v, value);
			});
			Object.values(this._edgeObjs).forEach(function(e) {
				if (copy.hasNode(e.v) && copy.hasNode(e.w)) copy.setEdge(e, self.edge(e));
			});
			var parents = {};
			function findParent(v) {
				var parent = self.parent(v);
				if (parent === void 0 || copy.hasNode(parent)) {
					parents[v] = parent;
					return parent;
				} else if (parent in parents) return parents[parent];
				else return findParent(parent);
			}
			if (this._isCompound) copy.nodes().forEach((v) => copy.setParent(v, findParent(v)));
			return copy;
		}
		/**
		* Sets the default edge label or factory function. This label will be
		* assigned as default label in case if no label was specified while setting
		* an edge or this function will be invoked each time when setting an edge
		* with no label specified and returned value * will be used as a label for edge.
		* Complexity: O(1).
		*/
		setDefaultEdgeLabel(newDefault) {
			this._defaultEdgeLabelFn = newDefault;
			if (typeof newDefault !== "function") this._defaultEdgeLabelFn = () => newDefault;
			return this;
		}
		/**
		* Gets the number of edges in the graph.
		* Complexity: O(1).
		*/
		edgeCount() {
			return this._edgeCount;
		}
		/**
		* Gets edges of the graph. In case of compound graph subgraphs are not considered.
		* Complexity: O(|E|).
		*/
		edges() {
			return Object.values(this._edgeObjs);
		}
		/**
		* Establish an edges path over the nodes in nodes list. If some edge is already
		* exists, it will update its label, otherwise it will create an edge between pair
		* of nodes with label provided or default label if no label provided.
		* Complexity: O(|nodes|).
		*/
		setPath(vs, value) {
			var self = this;
			var args = arguments;
			vs.reduce(function(v, w) {
				if (args.length > 1) self.setEdge(v, w, value);
				else self.setEdge(v, w);
				return w;
			});
			return this;
		}
		/**
		* Creates or updates the label for the edge (v, w) with the optionally supplied
		* name. If label is supplied it is set as the value for the edge. If label is not
		* supplied and the edge was created by this call then the default edge label will
		* be assigned. The name parameter is only useful with multigraphs.
		*/
		setEdge() {
			var v, w, name, value;
			var valueSpecified = false;
			var arg0 = arguments[0];
			if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
				v = arg0.v;
				w = arg0.w;
				name = arg0.name;
				if (arguments.length === 2) {
					value = arguments[1];
					valueSpecified = true;
				}
			} else {
				v = arg0;
				w = arguments[1];
				name = arguments[3];
				if (arguments.length > 2) {
					value = arguments[2];
					valueSpecified = true;
				}
			}
			v = "" + v;
			w = "" + w;
			if (name !== void 0) name = "" + name;
			var e = edgeArgsToId(this._isDirected, v, w, name);
			if (Object.hasOwn(this._edgeLabels, e)) {
				if (valueSpecified) this._edgeLabels[e] = value;
				return this;
			}
			if (name !== void 0 && !this._isMultigraph) throw new Error("Cannot set a named edge when isMultigraph = false");
			this.setNode(v);
			this.setNode(w);
			this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
			var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
			v = edgeObj.v;
			w = edgeObj.w;
			Object.freeze(edgeObj);
			this._edgeObjs[e] = edgeObj;
			incrementOrInitEntry(this._preds[w], v);
			incrementOrInitEntry(this._sucs[v], w);
			this._in[w][e] = edgeObj;
			this._out[v][e] = edgeObj;
			this._edgeCount++;
			return this;
		}
		/**
		* Gets the label for the specified edge.
		* Complexity: O(1).
		*/
		edge(v, w, name) {
			var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
			return this._edgeLabels[e];
		}
		/**
		* Gets the label for the specified edge and converts it to an object.
		* Complexity: O(1)
		*/
		edgeAsObj() {
			const edge = this.edge(...arguments);
			if (typeof edge !== "object") return { label: edge };
			return edge;
		}
		/**
		* Detects whether the graph contains specified edge or not. No subgraphs are considered.
		* Complexity: O(1).
		*/
		hasEdge(v, w, name) {
			var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
			return Object.hasOwn(this._edgeLabels, e);
		}
		/**
		* Removes the specified edge from the graph. No subgraphs are considered.
		* Complexity: O(1).
		*/
		removeEdge(v, w, name) {
			var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
			var edge = this._edgeObjs[e];
			if (edge) {
				v = edge.v;
				w = edge.w;
				delete this._edgeLabels[e];
				delete this._edgeObjs[e];
				decrementOrRemoveEntry(this._preds[w], v);
				decrementOrRemoveEntry(this._sucs[v], w);
				delete this._in[w][e];
				delete this._out[v][e];
				this._edgeCount--;
			}
			return this;
		}
		/**
		* Return all edges that point to the node v. Optionally filters those edges down to just those
		* coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
		* Complexity: O(|E|).
		*/
		inEdges(v, u) {
			var inV = this._in[v];
			if (inV) {
				var edges = Object.values(inV);
				if (!u) return edges;
				return edges.filter((edge) => edge.v === u);
			}
		}
		/**
		* Return all edges that are pointed at by node v. Optionally filters those edges down to just
		* those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
		* Complexity: O(|E|).
		*/
		outEdges(v, w) {
			var outV = this._out[v];
			if (outV) {
				var edges = Object.values(outV);
				if (!w) return edges;
				return edges.filter((edge) => edge.w === w);
			}
		}
		/**
		* Returns all edges to or from node v regardless of direction. Optionally filters those edges
		* down to just those between nodes v and w regardless of direction.
		* Complexity: O(|E|).
		*/
		nodeEdges(v, w) {
			var inEdges = this.inEdges(v, w);
			if (inEdges) return inEdges.concat(this.outEdges(v, w));
		}
	};
	function incrementOrInitEntry(map, k) {
		if (map[k]) map[k]++;
		else map[k] = 1;
	}
	function decrementOrRemoveEntry(map, k) {
		if (!--map[k]) delete map[k];
	}
	function edgeArgsToId(isDirected, v_, w_, name) {
		var v = "" + v_;
		var w = "" + w_;
		if (!isDirected && v > w) {
			var tmp = v;
			v = w;
			w = tmp;
		}
		return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (name === void 0 ? DEFAULT_EDGE_NAME : name);
	}
	function edgeArgsToObj(isDirected, v_, w_, name) {
		var v = "" + v_;
		var w = "" + w_;
		if (!isDirected && v > w) {
			var tmp = v;
			v = w;
			w = tmp;
		}
		var edgeObj = {
			v,
			w
		};
		if (name) edgeObj.name = name;
		return edgeObj;
	}
	function edgeObjToId(isDirected, edgeObj) {
		return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
	}
	module.exports = Graph$3;
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = "2.2.4";
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		Graph: require_graph(),
		version: require_version()
	};
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/json.js
var require_json = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Graph$2 = require_graph();
	module.exports = {
		write: write$1,
		read
	};
	/**
	* Creates a JSON representation of the graph that can be serialized to a string with
	* JSON.stringify. The graph can later be restored using json.read.
	*/
	function write$1(g) {
		var json = {
			options: {
				directed: g.isDirected(),
				multigraph: g.isMultigraph(),
				compound: g.isCompound()
			},
			nodes: writeNodes(g),
			edges: writeEdges(g)
		};
		if (g.graph() !== void 0) json.value = structuredClone(g.graph());
		return json;
	}
	function writeNodes(g) {
		return g.nodes().map(function(v) {
			var nodeValue = g.node(v);
			var parent = g.parent(v);
			var node$1 = { v };
			if (nodeValue !== void 0) node$1.value = nodeValue;
			if (parent !== void 0) node$1.parent = parent;
			return node$1;
		});
	}
	function writeEdges(g) {
		return g.edges().map(function(e) {
			var edgeValue = g.edge(e);
			var edge = {
				v: e.v,
				w: e.w
			};
			if (e.name !== void 0) edge.name = e.name;
			if (edgeValue !== void 0) edge.value = edgeValue;
			return edge;
		});
	}
	/**
	* Takes JSON as input and returns the graph representation.
	*
	* @example
	* var g2 = graphlib.json.read(JSON.parse(str));
	* g2.nodes();
	* // ['a', 'b']
	* g2.edges()
	* // [ { v: 'a', w: 'b' } ]
	*/
	function read(json) {
		var g = new Graph$2(json.options).setGraph(json.value);
		json.nodes.forEach(function(entry) {
			g.setNode(entry.v, entry.value);
			if (entry.parent) g.setParent(entry.v, entry.parent);
		});
		json.edges.forEach(function(entry) {
			g.setEdge({
				v: entry.v,
				w: entry.w,
				name: entry.name
			}, entry.value);
		});
		return g;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/components.js
var require_components = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = components;
	function components(g) {
		var visited = {};
		var cmpts = [];
		var cmpt;
		function dfs$3(v) {
			if (Object.hasOwn(visited, v)) return;
			visited[v] = true;
			cmpt.push(v);
			g.successors(v).forEach(dfs$3);
			g.predecessors(v).forEach(dfs$3);
		}
		g.nodes().forEach(function(v) {
			cmpt = [];
			dfs$3(v);
			if (cmpt.length) cmpts.push(cmpt);
		});
		return cmpts;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/data/priority-queue.js
var require_priority_queue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A min-priority queue data structure. This algorithm is derived from Cormen,
	* et al., "Introduction to Algorithms". The basic idea of a min-priority
	* queue is that you can efficiently (in O(1) time) get the smallest key in
	* the queue. Adding and removing elements takes O(log n) time. A key can
	* have its priority decreased in O(log n) time.
	*/
	var PriorityQueue$2 = class {
		_arr = [];
		_keyIndices = {};
		/**
		* Returns the number of elements in the queue. Takes `O(1)` time.
		*/
		size() {
			return this._arr.length;
		}
		/**
		* Returns the keys that are in the queue. Takes `O(n)` time.
		*/
		keys() {
			return this._arr.map(function(x) {
				return x.key;
			});
		}
		/**
		* Returns `true` if **key** is in the queue and `false` if not.
		*/
		has(key) {
			return Object.hasOwn(this._keyIndices, key);
		}
		/**
		* Returns the priority for **key**. If **key** is not present in the queue
		* then this function returns `undefined`. Takes `O(1)` time.
		*
		* @param {Object} key
		*/
		priority(key) {
			var index = this._keyIndices[key];
			if (index !== void 0) return this._arr[index].priority;
		}
		/**
		* Returns the key for the minimum element in this queue. If the queue is
		* empty this function throws an Error. Takes `O(1)` time.
		*/
		min() {
			if (this.size() === 0) throw new Error("Queue underflow");
			return this._arr[0].key;
		}
		/**
		* Inserts a new key into the priority queue. If the key already exists in
		* the queue this function returns `false`; otherwise it will return `true`.
		* Takes `O(n)` time.
		*
		* @param {Object} key the key to add
		* @param {Number} priority the initial priority for the key
		*/
		add(key, priority) {
			var keyIndices = this._keyIndices;
			key = String(key);
			if (!Object.hasOwn(keyIndices, key)) {
				var arr = this._arr;
				var index = arr.length;
				keyIndices[key] = index;
				arr.push({
					key,
					priority
				});
				this._decrease(index);
				return true;
			}
			return false;
		}
		/**
		* Removes and returns the smallest key in the queue. Takes `O(log n)` time.
		*/
		removeMin() {
			this._swap(0, this._arr.length - 1);
			var min = this._arr.pop();
			delete this._keyIndices[min.key];
			this._heapify(0);
			return min.key;
		}
		/**
		* Decreases the priority for **key** to **priority**. If the new priority is
		* greater than the previous priority, this function will throw an Error.
		*
		* @param {Object} key the key for which to raise priority
		* @param {Number} priority the new priority for the key
		*/
		decrease(key, priority) {
			var index = this._keyIndices[key];
			if (priority > this._arr[index].priority) throw new Error("New priority is greater than current priority. Key: " + key + " Old: " + this._arr[index].priority + " New: " + priority);
			this._arr[index].priority = priority;
			this._decrease(index);
		}
		_heapify(i) {
			var arr = this._arr;
			var l = 2 * i;
			var r = l + 1;
			var largest = i;
			if (l < arr.length) {
				largest = arr[l].priority < arr[largest].priority ? l : largest;
				if (r < arr.length) largest = arr[r].priority < arr[largest].priority ? r : largest;
				if (largest !== i) {
					this._swap(i, largest);
					this._heapify(largest);
				}
			}
		}
		_decrease(index) {
			var arr = this._arr;
			var priority = arr[index].priority;
			var parent;
			while (index !== 0) {
				parent = index >> 1;
				if (arr[parent].priority < priority) break;
				this._swap(index, parent);
				index = parent;
			}
		}
		_swap(i, j) {
			var arr = this._arr;
			var keyIndices = this._keyIndices;
			var origArrI = arr[i];
			var origArrJ = arr[j];
			arr[i] = origArrJ;
			arr[j] = origArrI;
			keyIndices[origArrJ.key] = i;
			keyIndices[origArrI.key] = j;
		}
	};
	module.exports = PriorityQueue$2;
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/dijkstra.js
var require_dijkstra = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var PriorityQueue$1 = require_priority_queue();
	module.exports = dijkstra$1;
	var DEFAULT_WEIGHT_FUNC$1 = () => 1;
	function dijkstra$1(g, source, weightFn, edgeFn) {
		return runDijkstra(g, String(source), weightFn || DEFAULT_WEIGHT_FUNC$1, edgeFn || function(v) {
			return g.outEdges(v);
		});
	}
	function runDijkstra(g, source, weightFn, edgeFn) {
		var results = {};
		var pq = new PriorityQueue$1();
		var v, vEntry;
		var updateNeighbors = function(edge) {
			var w = edge.v !== v ? edge.v : edge.w;
			var wEntry = results[w];
			var weight = weightFn(edge);
			var distance = vEntry.distance + weight;
			if (weight < 0) throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + edge + " Weight: " + weight);
			if (distance < wEntry.distance) {
				wEntry.distance = distance;
				wEntry.predecessor = v;
				pq.decrease(w, distance);
			}
		};
		g.nodes().forEach(function(v$1) {
			var distance = v$1 === source ? 0 : Number.POSITIVE_INFINITY;
			results[v$1] = { distance };
			pq.add(v$1, distance);
		});
		while (pq.size() > 0) {
			v = pq.removeMin();
			vEntry = results[v];
			if (vEntry.distance === Number.POSITIVE_INFINITY) break;
			edgeFn(v).forEach(updateNeighbors);
		}
		return results;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/dijkstra-all.js
var require_dijkstra_all = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var dijkstra = require_dijkstra();
	module.exports = dijkstraAll;
	function dijkstraAll(g, weightFunc, edgeFunc) {
		return g.nodes().reduce(function(acc, v) {
			acc[v] = dijkstra(g, v, weightFunc, edgeFunc);
			return acc;
		}, {});
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/tarjan.js
var require_tarjan = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = tarjan$1;
	function tarjan$1(g) {
		var index = 0;
		var stack = [];
		var visited = {};
		var results = [];
		function dfs$3(v) {
			var entry = visited[v] = {
				onStack: true,
				lowlink: index,
				index: index++
			};
			stack.push(v);
			g.successors(v).forEach(function(w$1) {
				if (!Object.hasOwn(visited, w$1)) {
					dfs$3(w$1);
					entry.lowlink = Math.min(entry.lowlink, visited[w$1].lowlink);
				} else if (visited[w$1].onStack) entry.lowlink = Math.min(entry.lowlink, visited[w$1].index);
			});
			if (entry.lowlink === entry.index) {
				var cmpt = [];
				var w;
				do {
					w = stack.pop();
					visited[w].onStack = false;
					cmpt.push(w);
				} while (v !== w);
				results.push(cmpt);
			}
		}
		g.nodes().forEach(function(v) {
			if (!Object.hasOwn(visited, v)) dfs$3(v);
		});
		return results;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/find-cycles.js
var require_find_cycles = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var tarjan = require_tarjan();
	module.exports = findCycles;
	function findCycles(g) {
		return tarjan(g).filter(function(cmpt) {
			return cmpt.length > 1 || cmpt.length === 1 && g.hasEdge(cmpt[0], cmpt[0]);
		});
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/floyd-warshall.js
var require_floyd_warshall = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = floydWarshall;
	var DEFAULT_WEIGHT_FUNC = () => 1;
	function floydWarshall(g, weightFn, edgeFn) {
		return runFloydWarshall(g, weightFn || DEFAULT_WEIGHT_FUNC, edgeFn || function(v) {
			return g.outEdges(v);
		});
	}
	function runFloydWarshall(g, weightFn, edgeFn) {
		var results = {};
		var nodes = g.nodes();
		nodes.forEach(function(v) {
			results[v] = {};
			results[v][v] = { distance: 0 };
			nodes.forEach(function(w) {
				if (v !== w) results[v][w] = { distance: Number.POSITIVE_INFINITY };
			});
			edgeFn(v).forEach(function(edge) {
				var w = edge.v === v ? edge.w : edge.v;
				var d = weightFn(edge);
				results[v][w] = {
					distance: d,
					predecessor: v
				};
			});
		});
		nodes.forEach(function(k) {
			var rowK = results[k];
			nodes.forEach(function(i) {
				var rowI = results[i];
				nodes.forEach(function(j) {
					var ik = rowI[k];
					var kj = rowK[j];
					var ij = rowI[j];
					var altDistance = ik.distance + kj.distance;
					if (altDistance < ij.distance) {
						ij.distance = altDistance;
						ij.predecessor = kj.predecessor;
					}
				});
			});
		});
		return results;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/topsort.js
var require_topsort = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function topsort$1(g) {
		var visited = {};
		var stack = {};
		var results = [];
		function visit(node$1) {
			if (Object.hasOwn(stack, node$1)) throw new CycleException();
			if (!Object.hasOwn(visited, node$1)) {
				stack[node$1] = true;
				visited[node$1] = true;
				g.predecessors(node$1).forEach(visit);
				delete stack[node$1];
				results.push(node$1);
			}
		}
		g.sinks().forEach(visit);
		if (Object.keys(visited).length !== g.nodeCount()) throw new CycleException();
		return results;
	}
	var CycleException = class extends Error {
		constructor() {
			super(...arguments);
		}
	};
	module.exports = topsort$1;
	topsort$1.CycleException = CycleException;
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/is-acyclic.js
var require_is_acyclic = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var topsort = require_topsort();
	module.exports = isAcyclic;
	function isAcyclic(g) {
		try {
			topsort(g);
		} catch (e) {
			if (e instanceof topsort.CycleException) return false;
			throw e;
		}
		return true;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/dfs.js
var require_dfs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = dfs$2;
	function dfs$2(g, vs, order) {
		if (!Array.isArray(vs)) vs = [vs];
		var navigation = g.isDirected() ? (v) => g.successors(v) : (v) => g.neighbors(v);
		var orderFunc = order === "post" ? postOrderDfs : preOrderDfs;
		var acc = [];
		var visited = {};
		vs.forEach((v) => {
			if (!g.hasNode(v)) throw new Error("Graph does not have node: " + v);
			orderFunc(v, navigation, visited, acc);
		});
		return acc;
	}
	function postOrderDfs(v, navigation, visited, acc) {
		var stack = [[v, false]];
		while (stack.length > 0) {
			var curr = stack.pop();
			if (curr[1]) acc.push(curr[0]);
			else if (!Object.hasOwn(visited, curr[0])) {
				visited[curr[0]] = true;
				stack.push([curr[0], true]);
				forEachRight(navigation(curr[0]), (w) => stack.push([w, false]));
			}
		}
	}
	function preOrderDfs(v, navigation, visited, acc) {
		var stack = [v];
		while (stack.length > 0) {
			var curr = stack.pop();
			if (!Object.hasOwn(visited, curr)) {
				visited[curr] = true;
				acc.push(curr);
				forEachRight(navigation(curr), (w) => stack.push(w));
			}
		}
	}
	function forEachRight(array, iteratee) {
		var length = array.length;
		while (length--) iteratee(array[length], length, array);
		return array;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/postorder.js
var require_postorder = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var dfs$1 = require_dfs();
	module.exports = postorder;
	function postorder(g, vs) {
		return dfs$1(g, vs, "post");
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/preorder.js
var require_preorder = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var dfs = require_dfs();
	module.exports = preorder;
	function preorder(g, vs) {
		return dfs(g, vs, "pre");
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/prim.js
var require_prim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Graph$1 = require_graph();
	var PriorityQueue = require_priority_queue();
	module.exports = prim;
	function prim(g, weightFunc) {
		var result = new Graph$1();
		var parents = {};
		var pq = new PriorityQueue();
		var v;
		function updateNeighbors(edge) {
			var w = edge.v === v ? edge.w : edge.v;
			var pri = pq.priority(w);
			if (pri !== void 0) {
				var edgeWeight = weightFunc(edge);
				if (edgeWeight < pri) {
					parents[w] = v;
					pq.decrease(w, edgeWeight);
				}
			}
		}
		if (g.nodeCount() === 0) return result;
		g.nodes().forEach(function(v$1) {
			pq.add(v$1, Number.POSITIVE_INFINITY);
			result.setNode(v$1);
		});
		pq.decrease(g.nodes()[0], 0);
		var init = false;
		while (pq.size() > 0) {
			v = pq.removeMin();
			if (Object.hasOwn(parents, v)) result.setEdge(v, parents[v]);
			else if (init) throw new Error("Input graph is not connected: " + g);
			else init = true;
			g.nodeEdges(v).forEach(updateNeighbors);
		}
		return result;
	}
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/lib/alg/index.js
var require_alg = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		components: require_components(),
		dijkstra: require_dijkstra(),
		dijkstraAll: require_dijkstra_all(),
		findCycles: require_find_cycles(),
		floydWarshall: require_floyd_warshall(),
		isAcyclic: require_is_acyclic(),
		postorder: require_postorder(),
		preorder: require_preorder(),
		prim: require_prim(),
		tarjan: require_tarjan(),
		topsort: require_topsort()
	};
}));

//#endregion
//#region ../../node_modules/@dagrejs/graphlib/index.js
var require_graphlib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Copyright (c) 2014, Chris Pettitt
	* All rights reserved.
	*
	* Redistribution and use in source and binary forms, with or without
	* modification, are permitted provided that the following conditions are met:
	*
	* 1. Redistributions of source code must retain the above copyright notice, this
	* list of conditions and the following disclaimer.
	*
	* 2. Redistributions in binary form must reproduce the above copyright notice,
	* this list of conditions and the following disclaimer in the documentation
	* and/or other materials provided with the distribution.
	*
	* 3. Neither the name of the copyright holder nor the names of its contributors
	* may be used to endorse or promote products derived from this software without
	* specific prior written permission.
	*
	* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
	* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	var lib = require_lib();
	module.exports = {
		Graph: lib.Graph,
		json: require_json(),
		alg: require_alg(),
		version: lib.version
	};
}));

//#endregion
//#region ../../subhuti/src/validation/SubhutiGrammarAnalyzer.ts
var import_graphlib = /* @__PURE__ */ __toESM(require_graphlib(), 1);
const { Graph, alg } = import_graphlib.default;
/**
* 性能分析器
*/
var PerformanceAnalyzer = class {
	constructor() {
		this.stats = /* @__PURE__ */ new Map();
		this.callStack = [];
		this.cacheStats = {
			subRuleHandlerTotal: 0,
			recursiveReturn: 0,
			levelLimitReturn: 0,
			dfsFirstKCache: {
				hit: 0,
				miss: 0,
				total: 0
			},
			bfsAllCache: {
				hit: 0,
				miss: 0,
				total: 0
			},
			bfsLevelCache: {
				hit: 0,
				miss: 0,
				total: 0
			},
			getDirectChildren: {
				hit: 0,
				miss: 0,
				total: 0
			},
			dfsFirst1: {
				hit: 0,
				miss: 0,
				total: 0
			},
			dfsFirstK: {
				hit: 0,
				miss: 0,
				total: 0
			},
			bfsLevel: {
				hit: 0,
				miss: 0,
				total: 0
			},
			expandOneLevel: {
				hit: 0,
				miss: 0,
				total: 0
			},
			expandOneLevelTruncated: {
				hit: 0,
				miss: 0,
				total: 0
			},
			actualCompute: 0,
			bfsOptimization: {
				totalCalls: 0,
				skippedLevels: 0,
				fromLevel1: 0,
				fromCachedLevel: 0
			}
		};
	}
	startMethod(methodName) {
		const callId = this.callStack.length;
		this.callStack.push({
			methodName,
			startTime: Date.now(),
			childTime: 0
		});
		return callId;
	}
	endMethod(callId, inputSize, outputSize) {
		const call = this.callStack[callId];
		if (!call) throw new Error(`调用栈错误: callId ${callId} 不存在`);
		const totalDuration = Date.now() - call.startTime;
		const netDuration = totalDuration - call.childTime;
		if (callId > 0) {
			const parentCall = this.callStack[callId - 1];
			parentCall.childTime += totalDuration;
		}
		if (!this.stats.has(call.methodName)) this.stats.set(call.methodName, {
			count: 0,
			totalTime: 0,
			netTime: 0,
			maxTime: 0,
			minTime: Infinity,
			inputSizes: [],
			outputSizes: []
		});
		const stat = this.stats.get(call.methodName);
		stat.count++;
		stat.totalTime += totalDuration;
		stat.netTime += netDuration;
		stat.maxTime = Math.max(stat.maxTime, netDuration);
		stat.minTime = Math.min(stat.minTime, netDuration);
		if (inputSize !== void 0) stat.inputSizes.push(inputSize);
		if (outputSize !== void 0) stat.outputSizes.push(outputSize);
		this.callStack.pop();
		return netDuration;
	}
	record(methodName, duration, inputSize, outputSize) {
		if (!this.stats.has(methodName)) this.stats.set(methodName, {
			count: 0,
			totalTime: 0,
			netTime: 0,
			maxTime: 0,
			minTime: Infinity,
			inputSizes: [],
			outputSizes: []
		});
		const stat = this.stats.get(methodName);
		stat.count++;
		stat.totalTime += duration;
		stat.netTime += duration;
		stat.maxTime = Math.max(stat.maxTime, duration);
		stat.minTime = Math.min(stat.minTime, duration);
		if (inputSize !== void 0) stat.inputSizes.push(inputSize);
		if (outputSize !== void 0) stat.outputSizes.push(outputSize);
	}
	recordCacheHit(cacheType) {
		this.cacheStats[cacheType].hit++;
		this.cacheStats[cacheType].total++;
	}
	recordCacheMiss(cacheType) {
		this.cacheStats[cacheType].miss++;
		this.cacheStats[cacheType].total++;
	}
	recordActualCompute() {
		this.cacheStats.actualCompute++;
	}
	report() {
		console.log("\n📊 ===== 性能分析报告 =====\n");
		console.log("🎯 subRuleHandler 调用统计:");
		console.log(`   总调用次数: ${this.cacheStats.subRuleHandlerTotal}`);
		console.log(`   递归检测返回: ${this.cacheStats.recursiveReturn}`);
		console.log(`   层级限制返回: ${this.cacheStats.levelLimitReturn}`);
		console.log(`   正常处理: ${this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn}`);
		console.log("");
		console.log("💾 缓存命中率统计:");
		console.log(`   DFS_First1 (深度优先 First(1)):`);
		console.log(`     命中: ${this.cacheStats.dfsFirst1.hit}`);
		console.log(`     未命中: ${this.cacheStats.dfsFirst1.miss}`);
		console.log(`     总次数: ${this.cacheStats.dfsFirst1.total}`);
		console.log(`     命中率: ${this.cacheStats.dfsFirst1.total > 0 ? (this.cacheStats.dfsFirst1.hit / this.cacheStats.dfsFirst1.total * 100).toFixed(1) : 0}%`);
		console.log(`   DFS_FirstK (深度优先 First(K)):`);
		console.log(`     命中: ${this.cacheStats.dfsFirstK.hit}`);
		console.log(`     未命中: ${this.cacheStats.dfsFirstK.miss}`);
		console.log(`     总次数: ${this.cacheStats.dfsFirstK.total}`);
		console.log(`     命中率: ${this.cacheStats.dfsFirstK.total > 0 ? (this.cacheStats.dfsFirstK.hit / this.cacheStats.dfsFirstK.total * 100).toFixed(1) : 0}%`);
		console.log(`   GetDirectChildren (懒加载缓存):`);
		console.log(`     命中: ${this.cacheStats.getDirectChildren.hit}`);
		console.log(`     未命中: ${this.cacheStats.getDirectChildren.miss}`);
		console.log(`     总次数: ${this.cacheStats.getDirectChildren.total}`);
		console.log(`     命中率: ${this.cacheStats.getDirectChildren.total > 0 ? (this.cacheStats.getDirectChildren.hit / this.cacheStats.getDirectChildren.total * 100).toFixed(1) : 0}%`);
		if (this.cacheStats.bfsOptimization.totalCalls > 0) {
			console.log(`\n   🚀 BFS 增量优化效果:`);
			console.log(`     总调用次数: ${this.cacheStats.bfsOptimization.totalCalls}`);
			console.log(`     从 level 1 开始: ${this.cacheStats.bfsOptimization.fromLevel1} (${(this.cacheStats.bfsOptimization.fromLevel1 / this.cacheStats.bfsOptimization.totalCalls * 100).toFixed(1)}%)`);
			console.log(`     从缓存层级开始: ${this.cacheStats.bfsOptimization.fromCachedLevel} (${(this.cacheStats.bfsOptimization.fromCachedLevel / this.cacheStats.bfsOptimization.totalCalls * 100).toFixed(1)}%)`);
			console.log(`     总计跳过层数: ${this.cacheStats.bfsOptimization.skippedLevels}`);
			if (this.cacheStats.bfsOptimization.fromCachedLevel > 0) {
				const avgSkipped = this.cacheStats.bfsOptimization.skippedLevels / this.cacheStats.bfsOptimization.fromCachedLevel;
				console.log(`     平均每次跳过: ${avgSkipped.toFixed(2)} 层`);
			}
		}
		if (this.cacheStats.bfsLevel.total > 0) {
			console.log(`   BFS_Level (handleDFS特殊场景: firstK=∞, maxLevel=1):`);
			console.log(`     命中: ${this.cacheStats.bfsLevel.hit}`);
			console.log(`     未命中: ${this.cacheStats.bfsLevel.miss}`);
			console.log(`     总次数: ${this.cacheStats.bfsLevel.total}`);
			console.log(`     命中率: ${(this.cacheStats.bfsLevel.hit / this.cacheStats.bfsLevel.total * 100).toFixed(1)}%`);
		}
		if (this.cacheStats.expandOneLevel.total > 0) {
			console.log(`   ExpandOneLevel (BFS路径展开缓存):`);
			console.log(`     命中: ${this.cacheStats.expandOneLevel.hit}`);
			console.log(`     未命中: ${this.cacheStats.expandOneLevel.miss}`);
			console.log(`     总次数: ${this.cacheStats.expandOneLevel.total}`);
			console.log(`     命中率: ${(this.cacheStats.expandOneLevel.hit / this.cacheStats.expandOneLevel.total * 100).toFixed(1)}%`);
		}
		console.log(`   实际计算次数 (getDirectChildren): ${this.cacheStats.actualCompute}`);
		console.log("");
		const expectedNormalProcess = this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn;
		const actualCacheOperations = this.cacheStats.dfsFirst1.hit + this.cacheStats.dfsFirstK.hit + this.cacheStats.actualCompute;
		console.log(`📈 统计验证:`);
		console.log(`   预期正常处理: ${expectedNormalProcess}`);
		console.log(`   实际缓存操作: ${actualCacheOperations}`);
		console.log(`   差异: ${expectedNormalProcess - actualCacheOperations} (应该接近0)`);
		console.log("");
		const sorted = Array.from(this.stats.entries()).sort((a, b) => b[1].netTime - a[1].netTime).slice(0, 20);
		const totalTime = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.totalTime, 0);
		const totalNetTime = Array.from(this.stats.values()).reduce((sum, stat) => sum + stat.netTime, 0);
		console.log("⏱️  方法耗时统计 (按净耗时排序, Top 20):");
		console.log("=".repeat(80));
		for (const [method, stat] of sorted) {
			const avgNetTime = stat.netTime / stat.count;
			const avgTotalTime = stat.totalTime / stat.count;
			const percentage = totalNetTime > 0 ? (stat.netTime / totalNetTime * 100).toFixed(1) : "0.0";
			const avgInput = stat.inputSizes.length > 0 ? stat.inputSizes.reduce((a, b) => a + b, 0) / stat.inputSizes.length : 0;
			const avgOutput = stat.outputSizes.length > 0 ? stat.outputSizes.reduce((a, b) => a + b, 0) / stat.outputSizes.length : 0;
			console.log(`📌 ${method}:`);
			console.log(`   净耗时: ${stat.netTime.toFixed(0)}ms (${percentage}%) | 总耗时: ${stat.totalTime.toFixed(0)}ms`);
			console.log(`   调用次数: ${stat.count}次, 平均净耗时: ${avgNetTime.toFixed(2)}ms, 平均总耗时: ${avgTotalTime.toFixed(2)}ms`);
			console.log(`   最大耗时: ${stat.maxTime.toFixed(0)}ms, 最小耗时: ${stat.minTime === Infinity ? 0 : stat.minTime.toFixed(0)}ms`);
			if (stat.inputSizes.length > 0 && stat.outputSizes.length > 0) console.log(`   输入→输出: ${avgInput.toFixed(1)} → ${avgOutput.toFixed(1)} (${(avgOutput / avgInput).toFixed(1)}x)`);
			console.log("");
		}
		console.log(`⏱️  所有方法净耗时总和: ${totalNetTime.toFixed(2)}ms`);
		console.log(`⏱️  所有方法总耗时总和: ${totalTime.toFixed(2)}ms`);
		console.log("=".repeat(80));
		console.log("");
	}
	clear() {
		this.stats.clear();
		this.cacheStats = {
			subRuleHandlerTotal: 0,
			recursiveReturn: 0,
			levelLimitReturn: 0,
			dfsFirstKCache: {
				hit: 0,
				miss: 0,
				total: 0
			},
			bfsAllCache: {
				hit: 0,
				miss: 0,
				total: 0
			},
			bfsLevelCache: {
				hit: 0,
				miss: 0,
				total: 0
			},
			getDirectChildren: {
				hit: 0,
				miss: 0,
				total: 0
			},
			dfsFirst1: {
				hit: 0,
				miss: 0,
				total: 0
			},
			dfsFirstK: {
				hit: 0,
				miss: 0,
				total: 0
			},
			bfsLevel: {
				hit: 0,
				miss: 0,
				total: 0
			},
			expandOneLevel: {
				hit: 0,
				miss: 0,
				total: 0
			},
			expandOneLevelTruncated: {
				hit: 0,
				miss: 0,
				total: 0
			},
			actualCompute: 0,
			bfsOptimization: {
				totalCalls: 0,
				skippedLevels: 0,
				fromLevel1: 0,
				fromCachedLevel: 0
			}
		};
	}
};
/**
* 全局统一限制配置
*
* 设计理念：
* - MAX_LEVEL：控制展开深度，防止无限递归
* - MAX_BRANCHES：仅用于冲突检测时的路径比较优化
*/
const EXPANSION_LIMITS = {
	FIRST_K: 3,
	FIRST_Max: 100,
	LEVEL_1: 1,
	LEVEL_K: 1,
	INFINITY: Infinity,
	RuleJoinSymbol: "",
	MAX_BRANCHES: Infinity
};
/**
* 语法分析器
*
* 职责：
* 1. 接收规则 AST
* 2. 按层级展开规则（不再完全展开到token）
* 3. 分层存储展开结果
* 4. 只缓存直接子节点，使用时按需展开
*
* 性能：
* - 默认限制：3层展开，10000条路径
* - 缓存机制：只缓存直接子节点
* - 按需计算：使用时才递归展开
*/
var SubhutiGrammarAnalyzer = class {
	/**
	* 写入日志（使用当前深度控制缩进，自动添加文件名前缀）
	* 使用同步写入确保日志立即刷新到磁盘
	*/
	writeLog(message, depth) {
		if (this.currentLogFd !== null && this.currentRuleName) {
			const indent = "  ".repeat(depth !== void 0 ? depth : this.currentDepth);
			const logFileName = `${this.currentRuleName}-执行中.log`;
			const logLine = `${indent}[${logFileName}] ${message}\n`;
			try {
				fs.writeSync(this.currentLogFd, logLine, null, "utf8");
			} catch (error) {
				console.error(`写入日志失败: ${logFileName}`, error);
			}
		}
	}
	/**
	* 开始记录规则日志
	*/
	startRuleLogging(ruleName) {
		console.log(`🔍 startRuleLogging 被调用: ${ruleName}`);
		this.endRuleLogging();
		this.currentRuleName = ruleName;
		this.currentDepth = 0;
		const __filename = fileURLToPath(import.meta.url);
		let subhutiDir = path.dirname(__filename);
		while (subhutiDir !== path.dirname(subhutiDir)) {
			if (path.basename(subhutiDir) === "subhuti") break;
			subhutiDir = path.dirname(subhutiDir);
		}
		const logDir = path.join(subhutiDir, "logall");
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
			console.log(`📁 创建日志目录: ${logDir}`);
		} else console.log(`📁 使用日志目录: ${logDir}`);
		const logFilePath = path.join(logDir, `${ruleName}-执行中.log`);
		this.currentLogFilePath = logFilePath;
		console.log(`[DEBUG] 准备创建日志文件: ${logFilePath}`);
		try {
			console.log(`[DEBUG] 开始写入文件内容...`);
			const initialContent = `========== 开始处理规则: ${ruleName} ==========\n时间: ${(/* @__PURE__ */ new Date()).toISOString()}\n\n`;
			this.currentLogFd = fs.openSync(logFilePath, "w");
			fs.writeSync(this.currentLogFd, initialContent, null, "utf8");
			console.log(`[DEBUG] 文件描述符已打开并写入初始内容`);
			if (fs.existsSync(logFilePath)) {
				const stats = fs.statSync(logFilePath);
				console.log(`✅ 日志文件已创建: ${logFilePath}, 大小: ${stats.size} bytes`);
			} else {
				console.error(`❌ 文件写入后不存在: ${logFilePath}`);
				if (this.currentLogFd !== null) {
					fs.closeSync(this.currentLogFd);
					this.currentLogFd = null;
				}
				return;
			}
		} catch (error) {
			console.error(`❌ 创建日志文件失败: ${logFilePath}`);
			console.error(`错误类型: ${error?.constructor?.name || typeof error}`);
			console.error(`错误消息: ${error?.message || String(error)}`);
			if (error?.stack) console.error(`错误堆栈:`, error.stack);
			if (this.currentLogFd !== null) {
				try {
					fs.closeSync(this.currentLogFd);
				} catch (e) {}
				this.currentLogFd = null;
			}
		}
	}
	/**
	* 结束记录规则日志
	*/
	endRuleLogging() {
		if (this.currentLogFd !== null && this.currentRuleName && this.currentLogFilePath) {
			this.writeLog("", 0);
			this.writeLog(`========== 结束处理规则: ${this.currentRuleName} ==========`, 0);
			const ruleName = this.currentRuleName;
			const executingFilePath = this.currentLogFilePath;
			const __filename = fileURLToPath(import.meta.url);
			let subhutiDir = path.dirname(__filename);
			while (subhutiDir !== path.dirname(subhutiDir)) {
				if (path.basename(subhutiDir) === "subhuti") break;
				subhutiDir = path.dirname(subhutiDir);
			}
			const logDir = path.join(subhutiDir, "logall");
			const completedFilePath = path.join(logDir, `${ruleName}-执行完.log`);
			console.log(`[DEBUG] 准备关闭日志文件: ${ruleName}`);
			try {
				fs.closeSync(this.currentLogFd);
				this.currentLogFd = null;
				this.currentLogFilePath = null;
				console.log(`[DEBUG] 文件描述符已关闭，准备重命名文件`);
				console.log(`[DEBUG] 源文件: ${executingFilePath}`);
				console.log(`[DEBUG] 目标文件: ${completedFilePath}`);
				if (fs.existsSync(executingFilePath)) {
					console.log(`[DEBUG] 源文件存在，开始重命名`);
					fs.renameSync(executingFilePath, completedFilePath);
					console.log(`✅ 日志文件已重命名: ${ruleName}-执行中.log -> ${ruleName}-执行完.log`);
				} else console.error(`❌ 源文件不存在: ${executingFilePath}`);
			} catch (error) {
				console.error(`❌ 关闭或重命名日志文件失败: ${executingFilePath} -> ${completedFilePath}`, error);
			}
		}
		this.currentRuleName = null;
		this.currentDepth = 0;
		this.currentLogFd = null;
		this.currentLogFilePath = null;
	}
	/**
	* 封装的缓存 get 方法（统一管理所有缓存统计）
	*
	* ✅ 设计原则：
	* - 每次 get 调用都会增加 total 计数
	* - 如果缓存存在则 hit++，否则 miss++
	* - total 始终等于 hit + miss
	*
	* @param cacheType - 缓存类型
	* @param key - 缓存键
	* @returns 缓存的值，如果不存在返回 undefined
	*/
	getCacheValue(cacheType, key) {
		let result;
		switch (cacheType) {
			case "dfsFirstKCache":
				result = this.dfsFirstKCache.get(key);
				break;
			case "bfsAllCache":
				result = this.bfsAllCache.get(key);
				break;
			case "bfsLevelCache":
				result = this.bfsLevelCache.get(key);
				break;
		}
		if (result !== void 0) this.perfAnalyzer.recordCacheHit(cacheType);
		else {
			if (cacheType === "bfsAllCache") {}
			this.perfAnalyzer.recordCacheMiss(cacheType);
		}
		return result;
	}
	/**
	* 构造函数
	*
	* @param ruleASTs 规则名称 → AST 的映射
	* @param tokenCache
	* @param options 配置选项
	*/
	constructor(ruleASTs, tokenCache, options) {
		this.ruleASTs = ruleASTs;
		this.tokenCache = tokenCache;
		this.recursiveDetectionSet = /* @__PURE__ */ new Set();
		this.currentRuleName = null;
		this.currentLogFd = null;
		this.currentLogFilePath = null;
		this.currentDepth = 0;
		this.dfsFirstKCache = /* @__PURE__ */ new Map();
		this.bfsAllCache = /* @__PURE__ */ new Map();
		this.bfsLevelCache = /* @__PURE__ */ new Map();
		this.perfAnalyzer = new PerformanceAnalyzer();
		this.detectedLeftRecursionErrors = /* @__PURE__ */ new Map();
		this.compareStats = {
			firstKDetected: 0,
			bothDetected: 0,
			firstKOnlyDetected: 0
		};
		this.depthMap = /* @__PURE__ */ new Map();
		this.depmap = /* @__PURE__ */ new Map();
		this.operationStartTime = 0;
		this.currentProcessingRule = "";
		this.timeoutSeconds = 1e3;
		this.options = { maxLevel: options?.maxLevel ?? 5 };
	}
	getRuleNodeByAst(ruleName) {
		const ruleNode = this.ruleASTs.get(ruleName);
		if (!ruleNode) throw new Error("系统错误");
		return ruleNode;
	}
	/**
	* 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
	*
	* 实现方式：
	* - 遍历所有规则的 AST
	* - 递归查找所有 Or 节点
	* - 先计算每个分支的 First(1) 集合
	* - 如果有冲突，再深入检测 First(5)
	*
	* @returns Or 冲突错误列表
	*/
	/**
	* 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
	*
	* 实现方式：
	* - 遍历所有规则的 AST
	* - 递归查找所有 Or 节点
	* - 先计算每个分支的 First(1) 集合
	* - 如果有冲突，再深入检测 First(5)
	*
	* @returns Or 冲突错误列表
	*/
	checkAllOrConflicts() {
		const orConflictErrors = [];
		this.compareStats = {
			firstKDetected: 0,
			bothDetected: 0,
			firstKOnlyDetected: 0
		};
		const perfStats = {
			totalTime: 0,
			ruleStats: /* @__PURE__ */ new Map()
		};
		const startTime = Date.now();
		for (const [ruleName, ruleAST] of this.ruleASTs.entries()) {
			const ruleStartTime = Date.now();
			const ruleStats = {
				time: 0,
				orNodeCount: 0,
				pathCount: 0,
				maxPathCount: 0
			};
			const error = this.checkOrConflictsInNodeSmart(ruleName, ruleAST, ruleStats);
			if (error) orConflictErrors.push(error);
			ruleStats.time = Date.now() - ruleStartTime;
			perfStats.ruleStats.set(ruleName, ruleStats);
		}
		perfStats.totalTime = Date.now() - startTime;
		console.log(`\n📊 FirstK vs MaxLevel 检测对比统计:`);
		console.log(`   FirstK 检测到问题: ${this.compareStats.firstKDetected} 个`);
		console.log(`   两者都检测到: ${this.compareStats.bothDetected} 个`);
		console.log(`   仅 FirstK 检测到 (MaxLevel 未检测到): ${this.compareStats.firstKOnlyDetected} 个`);
		return orConflictErrors;
	}
	/**
	* 递归检查节点中的 Or 冲突（智能模式：先 First(1)，有冲突再 First(5)）
	*
	* @param ruleName 规则名
	* @param node 当前节点
	* @param ruleStats 规则统计信息
	*/
	checkOrConflictsInNodeSmart(ruleName, node$1, ruleStats) {
		let error;
		switch (node$1.type) {
			case "or":
				if (ruleStats) ruleStats.orNodeCount++;
				error = this.detectOrBranchConflictsWithCache(ruleName, node$1, ruleStats);
				if (error) return error;
				for (const alt of node$1.alternatives) {
					error = this.checkOrConflictsInNodeSmart(ruleName, alt, ruleStats);
					if (error) return error;
				}
				break;
			case "sequence":
				for (const child of node$1.nodes) {
					error = this.checkOrConflictsInNodeSmart(ruleName, child, ruleStats);
					if (error) return error;
				}
				break;
			case "option":
			case "many":
			case "atLeastOne":
				error = this.checkOrConflictsInNodeSmart(ruleName, node$1.node, ruleStats);
				if (error) return error;
				break;
			case "consume":
			case "subrule": break;
		}
	}
	/**
	* 获取 Or 节点所有分支的完整路径（深度展开）
	*
	* 核心逻辑：
	* 1. 展开每个分支到第一层（得到规则名序列）
	* 2. 从 cache 获取每个规则的所有路径
	* 3. 笛卡尔积组合，得到分支的所有可能路径
	* 4. 返回每个分支的路径集合
	*
	* @param orNode - Or 节点
	* @param firstK - First(K) 的 K 值
	* @param cacheType - 缓存类型
	* @returns 每个分支的路径集合数组
	*/
	getOrNodeAllBranchRules(ruleName, orNode, firstK, cacheType) {
		let allOrs = [];
		for (const seqNode of orNode.alternatives) {
			const nodeAllBranches = this.expandNode(seqNode, EXPANSION_LIMITS.INFINITY, 1, 1, false);
			const isMore = firstK === EXPANSION_LIMITS.INFINITY;
			if (isMore) {
				if (["ImportCall"].includes(ruleName)) {
					console.log(ruleName);
					console.log(nodeAllBranches);
				}
			}
			let allBranchAllSeq = [];
			for (const branch of nodeAllBranches) {
				const seqAllBranches = branch.map((rule) => {
					if (this.tokenCache.has(rule)) return [[rule]];
					const paths = this.getCacheValue(cacheType, rule);
					if (!paths) throw new Error("系统错误");
					return paths;
				});
				const branchAllSeq = this.cartesianProduct(seqAllBranches, firstK);
				if (isMore) {
					if (branchAllSeq.length > 1e4) {
						console.log(ruleName);
						console.log("branchAllSeq.length");
						console.log(branchAllSeq.length);
					}
				}
				allBranchAllSeq = allBranchAllSeq.concat(branchAllSeq);
			}
			allOrs.push(this.deduplicate(allBranchAllSeq));
		}
		return allOrs;
	}
	removeDuplicatePaths(pathsFront, pathsBehind) {
		if (pathsBehind.length === 0) return [];
		const frontSet = /* @__PURE__ */ new Set();
		for (const path$1 of pathsFront) {
			const key = path$1.join(EXPANSION_LIMITS.RuleJoinSymbol);
			frontSet.add(key);
		}
		const uniqueBehind = [];
		for (const path$1 of pathsBehind) {
			const key = path$1.join(EXPANSION_LIMITS.RuleJoinSymbol);
			if (!frontSet.has(key)) uniqueBehind.push(path$1);
		}
		return uniqueBehind;
	}
	/**
	* 使用前缀树检测两个路径集合中是否存在完全相同的路径
	*
	* @param pathsFront - 前面分支的路径数组
	* @param pathsBehind - 后面分支的路径数组
	* @returns 如果找到完全相同的路径返回该路径，否则返回 null
	*/
	findEqualPath(pathsFront, pathsBehind) {
		const behindSet = /* @__PURE__ */ new Set();
		for (const path$1 of pathsBehind) behindSet.add(path$1.join(EXPANSION_LIMITS.RuleJoinSymbol));
		for (const pathFront of pathsFront) {
			const key = pathFront.join(EXPANSION_LIMITS.RuleJoinSymbol);
			if (behindSet.has(key)) return pathFront;
		}
	}
	/**
	* 使用前缀树检测两个路径集合中的前缀关系
	*
	* @param pathsFront - 前面分支的路径数组
	* @param pathsBehind - 后面分支的路径数组
	* @returns 如果找到前缀关系返回 { prefix, full }，否则返回 null
	*/
	trieTreeFindPrefixMatch(pathsFront, pathsBehind) {
		if (pathsBehind.length === 0 || pathsFront.length === 0) return null;
		const uniqueBehind = this.removeDuplicatePaths(pathsFront, pathsBehind);
		if (uniqueBehind.length === 0) return null;
		const trie = new ArrayTrie();
		for (const path$1 of uniqueBehind) trie.insert(path$1);
		for (const pathFront of pathsFront) {
			const fullPath = trie.findPrefixMatch(pathFront);
			if (fullPath) return {
				prefix: pathFront,
				full: fullPath
			};
		}
		return null;
	}
	/**
	* 生成前缀冲突的修复建议
	*
	* @param ruleName - 规则名
	* @param branchA - 分支A索引
	* @param branchB - 分支B索引
	* @param conflict - 冲突信息
	* @returns 修复建议
	*/
	getPrefixConflictSuggestion(ruleName, branchA, branchB, conflict) {
		if (conflict.type === "equal") return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`;
		return ``;
	}
	/**
	* 线路1：使用 First(K) 检测 Or 分支冲突（智能检测）
	*
	* 检测逻辑：对每个路径对，根据长度选择检测方法
	* - 路径长度都等于 firstK：检测是否完全相同（findEqualPath）
	* - 前面路径长度 < firstK：检测是否是前缀（findPrefixRelation）
	*
	* 数据源：dfsFirstKCache（First(K) 的展开结果）
	*
	* @param ruleName 输出错误日志使用
	* @param orNode - Or 节点
	* @param ruleStats
	*/
	detectOrBranchEqualWithFirstK(ruleName, orNode, ruleStats) {
		if (orNode.alternatives.length < 2) return;
		const branchPathSets = this.getOrNodeAllBranchRules(ruleName, orNode, EXPANSION_LIMITS.FIRST_K, "dfsFirstKCache");
		const firstK = EXPANSION_LIMITS.FIRST_K;
		if (ruleStats) {
			const totalPaths = branchPathSets.reduce((sum, paths) => sum + paths.length, 0);
			const maxPaths = Math.max(...branchPathSets.map((paths) => paths.length));
			ruleStats.pathCount += totalPaths;
			ruleStats.maxPathCount = Math.max(ruleStats.maxPathCount, maxPaths);
		}
		for (let i = 0; i < branchPathSets.length; i++) for (let j = i + 1; j < branchPathSets.length; j++) {
			const pathsFront = branchPathSets[i];
			const pathsBehind = branchPathSets[j];
			const equalPath = this.findEqualPath(pathsFront, pathsBehind);
			if (equalPath) {
				const equalPathStr = equalPath.join(EXPANSION_LIMITS.RuleJoinSymbol);
				return {
					level: "ERROR",
					type: "or-identical-branches",
					ruleName,
					branchIndices: [i, j],
					conflictPaths: {
						pathA: equalPathStr,
						pathB: equalPathStr
					},
					message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 和分支 ${j + 1} 的前 ${firstK} 个 token 完全相同`,
					suggestion: this.getEqualBranchSuggestion(ruleName, i, j, equalPathStr)
				};
			}
			const prefixRelation = this.trieTreeFindPrefixMatch(pathsFront, pathsBehind);
			if (prefixRelation) {
				const prefixStr = prefixRelation.prefix.join(EXPANSION_LIMITS.RuleJoinSymbol);
				const fullStr = prefixRelation.full.join(EXPANSION_LIMITS.RuleJoinSymbol);
				return {
					level: "ERROR",
					type: "prefix-conflict",
					ruleName,
					branchIndices: [i, j],
					conflictPaths: {
						pathA: prefixStr,
						pathB: fullStr
					},
					message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}（在 First(${firstK}) 阶段检测到）`,
					suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
						prefix: prefixStr,
						full: fullStr,
						type: "prefix"
					})
				};
			}
		}
	}
	/**
	* 线路2：使用 MaxLevel 检测 Or 分支的前缀遮蔽关系
	*
	* 检测目标：前面的分支是否是后面分支的前缀
	* 数据源：bfsAllCache（深度展开的完整路径）
	* 检测方法：findPrefixRelation()
	* 性能：O(n²) - 深度检测
	*
	* 适用场景：
	* - 检测前缀遮蔽问题
	* - 需要深度展开才能发现的冲突
	*
	* @param ruleName - 规则名
	* @param orNode - Or 节点
	*/
	detectOrBranchPrefixWithMaxLevel(ruleName, orNode, ruleStats) {
		if (orNode.alternatives.length < 2) return;
		const branchPathSets = this.getOrNodeAllBranchRules(ruleName, orNode, EXPANSION_LIMITS.INFINITY, "bfsAllCache");
		if (ruleStats) {
			branchPathSets.reduce((sum, paths) => sum + paths.length, 0);
			Math.max(...branchPathSets.map((paths) => paths.length));
		}
		for (let i = 0; i < branchPathSets.length; i++) for (let j = i + 1; j < branchPathSets.length; j++) {
			const pathsFront = branchPathSets[i];
			const pathsBehind = branchPathSets[j];
			const prefixRelation = this.trieTreeFindPrefixMatch(pathsFront, pathsBehind);
			if (prefixRelation) {
				const prefixStr = prefixRelation.prefix.join(EXPANSION_LIMITS.RuleJoinSymbol);
				const fullStr = prefixRelation.full.join(EXPANSION_LIMITS.RuleJoinSymbol);
				return {
					level: "ERROR",
					type: "prefix-conflict",
					ruleName,
					branchIndices: [i, j],
					conflictPaths: {
						pathA: prefixStr,
						pathB: fullStr
					},
					message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}`,
					suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
						prefix: prefixStr,
						full: fullStr,
						type: "prefix"
					})
				};
			}
		}
	}
	/**
	* 生成相同分支的修复建议
	*/
	getEqualBranchSuggestion(ruleName, branchA, branchB, equalPath) {
		return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

检测到的问题：
  相同路径: ${equalPath}

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

修复建议：
1. **删除重复分支**：保留其中一个分支即可
2. **检查逻辑**：确认是否是复制粘贴错误
3. **合并分支**：如果语义相同，合并为一个分支

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`;
	}
	detectOrBranchConflictsWithCache(ruleName, orNode, ruleStats) {
		const orStartTime = Date.now();
		let firstKError = this.detectOrBranchEqualWithFirstK(ruleName, orNode, ruleStats);
		if (!firstKError) return;
		this.compareStats.firstKDetected++;
		const maxLevelError = this.detectOrBranchPrefixWithMaxLevel(ruleName, orNode, ruleStats);
		if (maxLevelError) this.compareStats.bothDetected++;
		else this.compareStats.firstKOnlyDetected++;
		Date.now() - orStartTime;
		if (firstKError.type === "prefix-conflict") {
			if (!maxLevelError) {
				const errorMsg = `
🔴 ========== 防御性检查失败 ==========
规则: ${ruleName}
问题: First(K) 检测到遮蔽，但 MaxLevel 未检测到

First(K) 检测结果:
  类型: ${firstKError.type}
  分支: ${firstKError.branchIndices[0] + 1} → ${firstKError.branchIndices[1] + 1}
  前缀: ${firstKError.conflictPaths?.pathA}
  完整: ${firstKError.conflictPaths?.pathB}

MaxLevel 检测结果: 无冲突

可能原因:
1. First(K) 误报（检测逻辑错误）
2. MaxLevel 漏检（检测逻辑错误）
3. dfsFirstKCache 和 bfsAllCache 数据不一致
==========================================`;
				console.error(errorMsg);
				throw new Error(`防御性检查失败: First(K) 检测到遮蔽但 MaxLevel 未检测到 (规则: ${ruleName})`);
			}
		}
		return maxLevelError;
	}
	findRuleDepth(ruleName) {
		if (this.recursiveDetectionSet.has(ruleName)) return 1;
		this.recursiveDetectionSet.add(ruleName);
		try {
			const node$1 = this.ruleASTs.get(ruleName);
			const result = this.findNodeDepth(node$1);
			if (result > 1e6) {
				console.log(ruleName);
				console.log(result);
			}
			return result;
		} finally {
			this.recursiveDetectionSet.delete(ruleName);
		}
	}
	manyAndOptionDepth(node$1) {
		const num = this.findNodeDepth(node$1.node);
		return num + num;
	}
	atLeastOneDepth(node$1) {
		const num = this.findNodeDepth(node$1.node);
		return num + num;
	}
	seqDepth(seq) {
		if (seq.nodes.length < 1) return 1;
		let all = 1;
		for (let i = 0; i < seq.nodes.length; i++) {
			const node$1 = seq.nodes[i];
			const depth = this.findNodeDepth(node$1);
			all = all * depth;
		}
		return all;
	}
	orDepth(or) {
		if (or.alternatives.length < 1) throw new Error("xitongcuowu");
		let orPossibility = 0;
		for (let i = 0; i < or.alternatives.length; i++) {
			const alternative = or.alternatives[i];
			const depth = this.findNodeDepth(alternative);
			orPossibility += depth;
		}
		if (orPossibility === 0) throw new Error("系统错误");
		return orPossibility;
	}
	findNodeDepth(node$1) {
		this.checkTimeout("findNodeDepth");
		const callId = this.perfAnalyzer.startMethod("findNodeDepth");
		let result;
		switch (node$1.type) {
			case "consume":
				result = 1;
				break;
			case "subrule":
				result = this.findRuleDepth(node$1.ruleName);
				break;
			case "or":
				result = this.orDepth(node$1);
				break;
			case "sequence":
				result = this.seqDepth(node$1);
				break;
			case "option":
			case "many":
			case "atLeastOne":
				result = this.manyAndOptionDepth(node$1);
				break;
			default: throw new Error(`未知节点类型: ${node$1.type}`);
		}
		this.perfAnalyzer.endMethod(callId, void 0);
		return result;
	}
	deepDepth(node$1, depth) {
		this.checkTimeout("deepDepth");
		const callId = this.perfAnalyzer.startMethod("findNodeDepth");
		let result;
		let tempary = [];
		switch (node$1.type) {
			case "consume":
				result = depth;
				break;
			case "subrule":
				const ruleName = node$1.ruleName;
				if (this.depmap.has(ruleName)) return this.depmap.get(ruleName);
				if (this.recursiveDetectionSet.has(ruleName)) return depth;
				depth++;
				this.recursiveDetectionSet.add(ruleName);
				const subNode = this.ruleASTs.get(ruleName);
				result = this.deepDepth(subNode, depth);
				this.recursiveDetectionSet.delete(ruleName);
				break;
			case "or":
				tempary = [];
				for (const alternative of node$1.alternatives) tempary.push(this.deepDepth(alternative, depth));
				result = Math.max(...tempary);
				break;
			case "sequence":
				tempary = [];
				for (const alternative of node$1.nodes) tempary.push(this.deepDepth(alternative, depth));
				result = Math.max(...tempary);
				break;
			case "option":
			case "many":
			case "atLeastOne":
				result = this.deepDepth(node$1.node, depth);
				break;
			default: throw new Error(`未知节点类型: ${node$1.type}`);
		}
		this.perfAnalyzer.endMethod(callId, void 0);
		return result;
	}
	collectDependencies(node$1, fromRule) {
		switch (node$1.type) {
			case "consume":
				this.graph.setEdge(fromRule, node$1.tokenName);
				break;
			case "subrule":
				this.graph.setEdge(fromRule, node$1.ruleName);
				break;
			case "sequence":
				node$1.nodes.forEach((n) => this.collectDependencies(n, fromRule));
				break;
			case "or":
				node$1.alternatives.forEach((alt) => this.collectDependencies(alt, fromRule));
				break;
			case "option":
			case "many":
			case "atLeastOne":
				this.collectDependencies(node$1.node, fromRule);
				break;
		}
	}
	graphToMermaid(g) {
		const lines = ["graph TD"];
		for (const edge of g.edges()) lines.push(`    ${edge.v} --> ${edge.w}`);
		return lines.join("\n");
	}
	grachScc() {
		this.graph = new Graph({ directed: true });
		for (const [ruleName, node$1] of this.ruleASTs) {
			this.graph.setNode(ruleName);
			this.collectDependencies(node$1, ruleName);
		}
		const dotString = write(this.graph);
		console.log(dotString);
		const sccs = alg.tarjan(this.graph);
		console.log("=== 强连通分量（循环） ===");
		for (const scc of sccs) if (scc.length > 1) {
			console.log("====================");
			console.log(`循环: `);
			console.log(`${scc.length}`);
		}
	}
	computeRuleDepth() {
		for (const node$1 of this.ruleASTs.values()) {
			this.recursiveDetectionSet.clear();
			const result = this.deepDepth(node$1, 1);
			console.log(node$1.ruleName);
			console.log(result);
			this.depmap.set(node$1.ruleName, result);
		}
	}
	computeRulePossibility() {
		for (const node$1 of this.ruleASTs.values()) {
			this.recursiveDetectionSet.clear();
			const ruleName = node$1.ruleName;
			console.log("进入规则：" + ruleName);
			const result = this.findNodeDepth(node$1);
			if (this.depthMap.has(ruleName)) {
				const num = this.depthMap.get(ruleName);
				if (result !== num) {
					console.log("更新设置");
					console.log(ruleName);
					console.log("jiuzhi");
					console.log(num);
					console.log("心智");
					console.log(result);
					this.depthMap.set(ruleName, result);
					throw new Error("系统错误");
				}
			} else {
				this.depthMap.set(ruleName, result);
				console.log("初次设置");
				console.log(ruleName);
				console.log(result);
			}
		}
	}
	/**
	* 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
	*
	* 应该在收集 AST 之后立即调用
	*
	* @returns { errors: 验证错误列表, stats: 统计信息 }
	*/
	initCacheAndCheckLeftRecursion() {
		this.operationStartTime = Date.now();
		const totalStartTime = Date.now();
		const stats = {
			dfsFirstKTime: 0,
			bfsMaxLevelTime: 0,
			orDetectionTime: 0,
			leftRecursionCount: 0,
			orConflictCount: 0,
			totalTime: 0,
			dfsFirstKCacheSize: 0,
			bfsAllCacheSize: 0,
			firstK: 0,
			cacheUsage: {
				dfsFirstK: {
					hit: 0,
					miss: 0,
					total: 0,
					hitRate: 0
				},
				bfsLevelCache: {
					hit: 0,
					miss: 0,
					total: 0,
					hitRate: 0,
					size: 0
				},
				getDirectChildren: {
					hit: 0,
					miss: 0,
					total: 0,
					hitRate: 0
				}
			}
		};
		this.detectedLeftRecursionErrors.clear();
		this.operationStartTime = Date.now();
		const t1_2_start = Date.now();
		console.log(`\n📦 ===== BFS MaxLevel 缓存生成开始 =====`);
		console.log(`目标层级: Level 1 到 Level ${EXPANSION_LIMITS.LEVEL_K}`);
		const ruleNames = Array.from(this.ruleASTs.keys());
		for (const ruleName of ruleNames) {
			this.recursiveDetectionSet.clear();
			this.expandPathsByDFSCache(ruleName, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.INFINITY, true);
		}
		const startLevel = EXPANSION_LIMITS.LEVEL_K;
		for (let level = startLevel; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
			console.log(`\n📊 正在生成 Level ${level} 的缓存...`);
			let levelRuleIndex = 0;
			for (const ruleName of ruleNames) {
				levelRuleIndex++;
				const key = `${ruleName}:${level}`;
				if (this.bfsLevelCache.has(key)) continue;
				const ruleStartTime = Date.now();
				this.expandPathsByBFSCache(ruleName, level);
				const ruleDuration = Date.now() - ruleStartTime;
				const cachedPaths = this.bfsLevelCache.get(key);
				const pathCount = cachedPaths ? cachedPaths.length : 0;
				if (ruleDuration > 10 || pathCount > 100) console.log(`  ✅ 生成完成: ${ruleName}, Level ${level} (耗时: ${ruleDuration}ms, 路径数: ${pathCount})`);
			}
			console.log(`📊 Level ${level} 缓存生成完成`);
		}
		console.log(`\n📦 正在聚合所有层级的数据到 bfsAllCache...`);
		let aggregateIndex = 0;
		for (const ruleName of ruleNames) {
			aggregateIndex++;
			const aggregateStartTime = Date.now();
			let allLevelPaths = [];
			for (let level = startLevel; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
				const key = `${ruleName}:${level}`;
				if (this.bfsLevelCache.has(key)) {
					const levelPaths = this.getCacheValue("bfsLevelCache", key);
					allLevelPaths = allLevelPaths.concat(levelPaths);
				}
			}
			const deduplicated = this.deduplicate(allLevelPaths);
			this.bfsAllCache.set(ruleName, deduplicated);
			if (deduplicated.length > 1e3) {
				const aggregateDuration = Date.now() - aggregateStartTime;
				console.log(`  [${aggregateIndex}/${ruleNames.length}] 聚合完成: ${ruleName} (耗时: ${aggregateDuration}ms, 路径数: ${deduplicated.length})`);
			}
		}
		stats.bfsMaxLevelTime = Date.now() - t1_2_start;
		console.log(`\n✅ BFS MaxLevel 缓存生成完成 (总耗时: ${stats.bfsMaxLevelTime}ms)`);
		console.log(`========================================\n`);
		this.operationStartTime = 0;
		for (const error of this.detectedLeftRecursionErrors.values()) {
			const ruleAST = this.getRuleNodeByAst(error.ruleName);
			error.suggestion = this.getLeftRecursionSuggestion(error.ruleName, ruleAST, new Set([error.ruleName]));
		}
		stats.leftRecursionCount = this.detectedLeftRecursionErrors.size;
		const leftRecursionErrors = Array.from(this.detectedLeftRecursionErrors.values());
		const t2 = Date.now();
		const orConflictErrors = this.checkAllOrConflicts();
		stats.orDetectionTime = Date.now() - t2;
		stats.orConflictCount = orConflictErrors.length;
		const allErrors = [];
		allErrors.push(...leftRecursionErrors);
		allErrors.push(...orConflictErrors);
		stats.totalTime = Date.now() - totalStartTime;
		stats.dfsFirstKCacheSize = this.dfsFirstKCache.size;
		stats.bfsAllCacheSize = this.bfsAllCache.size;
		stats.firstK = EXPANSION_LIMITS.FIRST_K;
		const dfsFirstKCacheStats = this.perfAnalyzer.cacheStats.dfsFirstKCache;
		const bfsAllCacheStats = this.perfAnalyzer.cacheStats.bfsAllCache;
		const bfsLevelCacheStats = this.perfAnalyzer.cacheStats.bfsLevelCache;
		const getDirectChildrenStats = this.perfAnalyzer.cacheStats.getDirectChildren;
		stats.cacheUsage = {
			dfsFirstK: {
				hit: dfsFirstKCacheStats.hit,
				miss: dfsFirstKCacheStats.miss,
				total: dfsFirstKCacheStats.total,
				hitRate: dfsFirstKCacheStats.total > 0 ? dfsFirstKCacheStats.hit / dfsFirstKCacheStats.total * 100 : 0,
				getCount: dfsFirstKCacheStats.total
			},
			bfsAllCache: {
				hit: bfsAllCacheStats.hit,
				miss: bfsAllCacheStats.miss,
				total: bfsAllCacheStats.total,
				hitRate: bfsAllCacheStats.total > 0 ? bfsAllCacheStats.hit / bfsAllCacheStats.total * 100 : 0,
				getCount: bfsAllCacheStats.total,
				size: this.bfsAllCache.size
			},
			bfsLevelCache: {
				hit: bfsLevelCacheStats.hit,
				miss: bfsLevelCacheStats.miss,
				total: bfsLevelCacheStats.total,
				hitRate: bfsLevelCacheStats.total > 0 ? bfsLevelCacheStats.hit / bfsLevelCacheStats.total * 100 : 0,
				size: this.bfsLevelCache.size,
				getCount: bfsLevelCacheStats.total
			},
			getDirectChildren: {
				hit: getDirectChildrenStats.hit,
				miss: getDirectChildrenStats.miss,
				total: getDirectChildrenStats.total,
				hitRate: getDirectChildrenStats.total > 0 ? getDirectChildrenStats.hit / getDirectChildrenStats.total * 100 : 0
			}
		};
		this.perfAnalyzer.report();
		return {
			errors: allErrors,
			stats
		};
	}
	cartesianProductInner1(arrays, firstK) {
		const callId = this.perfAnalyzer.startMethod("cartesianProduct");
		if (arrays.length === 0) return [[]];
		if (arrays.length === 1) {
			const inputSize$1 = arrays[0].length;
			this.perfAnalyzer.endMethod(callId, inputSize$1, inputSize$1);
			return arrays[0];
		}
		const perfStats = {
			totalBranches: 0,
			skippedByLength: 0,
			skippedByDuplicate: 0,
			actualCombined: 0,
			maxResultSize: 0,
			movedToFinal: 0
		};
		const arrayFirst = arrays[0];
		let result = arrayFirst.filter((item) => item.length < firstK);
		let finalResult = arrayFirst.filter((item) => item.length >= firstK).map((item) => item.join(EXPANSION_LIMITS.RuleJoinSymbol));
		const finalResultSet = new Set(finalResult);
		for (let i = 1; i < arrays.length; i++) {
			this.checkTimeout(`cartesianProduct-数组${i}/${arrays.length}`);
			const arrilen = arrays[i].length;
			const currentArray = this.deduplicate(arrays[i]);
			if (arrilen > currentArray.length) throw new Error("系统错误");
			const temp = [];
			let seqIndex = 0;
			const totalSeqs = result.length;
			const shouldLogProgress = totalSeqs > 1e3 || currentArray.length > 1e3;
			const cartesianStartTime = shouldLogProgress ? Date.now() : 0;
			if (shouldLogProgress) totalSeqs * currentArray.length;
			for (const seq of result) {
				if (currentArray.length * seq.length > 3e4) {}
				seqIndex++;
				if (seqIndex % 1e3 === 0 || seqIndex === totalSeqs) {
					this.checkTimeout(`cartesianProduct-seq${seqIndex}/${totalSeqs}`);
					if (shouldLogProgress) {
						Date.now() - cartesianStartTime;
						(seqIndex / totalSeqs * 100).toFixed(1);
					}
				}
				const availableLength = firstK - seq.length;
				if (availableLength < 0) throw new Error("系统错误：序列长度超过限制");
				else if (availableLength === 0) {
					const seqKey$1 = seq.join(EXPANSION_LIMITS.RuleJoinSymbol);
					finalResultSet.add(seqKey$1);
					perfStats.movedToFinal++;
					perfStats.skippedByLength += currentArray.length;
					continue;
				}
				const seqDeduplicateSet = /* @__PURE__ */ new Set();
				const seqLength = seq.length;
				const seqKey = seqLength > 0 ? seq.join(EXPANSION_LIMITS.RuleJoinSymbol) : "";
				for (const branch of currentArray) {
					perfStats.totalBranches++;
					const truncatedBranch = branch.length <= availableLength ? branch : branch.slice(0, availableLength);
					const truncatedLength = truncatedBranch.length;
					const branchKey = truncatedBranch.join(EXPANSION_LIMITS.RuleJoinSymbol);
					if (seqDeduplicateSet.has(branchKey)) {
						perfStats.skippedByDuplicate++;
						continue;
					}
					seqDeduplicateSet.add(branchKey);
					const combinedLength = seqLength + truncatedLength;
					if (combinedLength > firstK) throw new Error("系统错误：笛卡尔积拼接后长度超过限制");
					if (combinedLength === firstK) {
						const combinedKey = seqKey ? seqKey + EXPANSION_LIMITS.RuleJoinSymbol + branchKey : branchKey;
						finalResultSet.add(combinedKey);
						perfStats.movedToFinal++;
					} else {
						const combined = new Array(combinedLength);
						for (let j = 0; j < seqLength; j++) combined[j] = seq[j];
						for (let j = 0; j < truncatedLength; j++) combined[seqLength + j] = truncatedBranch[j];
						temp.push(combined);
					}
					perfStats.actualCombined++;
				}
			}
			const dedupStartTime = Date.now();
			result = this.deduplicate(temp);
			Date.now() - dedupStartTime;
			perfStats.maxResultSize = Math.max(perfStats.maxResultSize, result.length + finalResultSet.size);
			if (result.length + finalResultSet.size > 1e5) console.warn(`⚠️ 笛卡尔积中间结果较大: temp=${result.length}, final=${finalResultSet.size} (数组 ${i}/${arrays.length - 1})`);
			if (result.length === 0 && finalResultSet.size > 0) break;
		}
		let finalArray = [];
		for (const seqStr of finalResultSet) if (seqStr === "") finalArray.push([]);
		else finalArray.push(seqStr.split(EXPANSION_LIMITS.RuleJoinSymbol));
		finalArray = finalArray.concat(result);
		const finalDedupStartTime = Date.now();
		const deduplicatedFinalArray = this.deduplicate(finalArray);
		Date.now() - finalDedupStartTime;
		for (const resultElement of deduplicatedFinalArray) if (resultElement.length > firstK) throw new Error("系统错误：最终结果长度超过限制");
		const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0);
		this.perfAnalyzer.endMethod(callId, inputSize, deduplicatedFinalArray.length);
		return deduplicatedFinalArray;
	}
	/**
	* 计算笛卡尔积（优化版：先截取再拼接 + seq级别去重 + 提前移入最终结果集）
	* [[a1, a2], [b1, b2]] → [[a1, b1], [a1, b2], [a2, b1], [a2, b2]]
	*
	* ⚠️ 重要：空分支处理
	* - 空分支 [] 参与笛卡尔积时，会被正常拼接
	* - [...seq, ...[]] = [...seq]，相当于只保留 seq
	* - 例如：[[a]] × [[], [b]] → [[a], [a,b]]
	* - 这正是 option/many 需要的行为：可以跳过或执行
	*
	* 🔧 优化策略：
	* 1. 先计算可拼接长度，避免拼接超长数据
	* 2. seq 级别去重，提前跳过重复分支
	* 3. 修复循环逻辑，逐个数组处理
	* 4. 长度达到 firstK 的序列立即移入最终结果集，不再参与后续计算
	* 5. 所有序列都达到 firstK 时提前结束，跳过剩余数组
	*/
	cartesianProduct(arrays, firstK) {
		return this.cartesianProductInner1(arrays, firstK);
	}
	cartesianProductInner2(arrays, firstK) {
		const callId = this.perfAnalyzer.startMethod("cartesianProduct");
		let deduplicatedFinalArray = main_default(arrays).map((item) => {
			return item.flat();
		});
		const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0);
		this.perfAnalyzer.endMethod(callId, inputSize, deduplicatedFinalArray.length);
		return deduplicatedFinalArray;
	}
	/**
	* 深度优先展开（DFS - Depth-First Search）
	*
	* 🚀 算法：递归深入，自然展开到token
	*
	* 适用场景：
	* - maxLevel = INFINITY（无限层级）
	* - 需要完全展开到token
	* - 适合 First(K) + 完全展开
	*
	* 优势：
	* - 递归处理AST，代码简洁
	* - 自然深入到叶子节点
	* - 配合 firstK 截取，可提前终止部分分支
	*
	* @param node - AST 节点（可选）
	* @param ruleName - 规则名（可选）
	* @param firstK - 取前 K 个符号
	* @param curLevel - 当前层级（默认 0）
	* @param maxLevel - 最大展开层级（通常为 Infinity）
	* @param isFirstPosition - 是否在第一个位置（用于左递归检测）
	* @returns 展开后的路径数组 string[][]
	*
	* 调用方式：
	* - expandPathsByDFS(node, null, firstK, curLevel, maxLevel) - 传入节点
	* - expandPathsByDFS(null, ruleName, firstK, curLevel, maxLevel) - 传入规则名
	*
	* 核心逻辑：递归处理 AST 节点
	* - consume: 返回 [[tokenName]]
	* - subrule: 递归展开
	* - sequence: 笛卡尔积组合子节点
	* - or: 合并所有分支
	* - option/many: 添加空分支
	*/
	expandNode(node$1, firstK, curLevel, maxLevel, isFirstPosition = false) {
		const callId = this.perfAnalyzer.startMethod("expandNode");
		let result;
		switch (node$1.type) {
			case "consume":
				result = [[node$1.tokenName]];
				break;
			case "subrule":
				result = this.expandPathsByDFSCache(node$1.ruleName, firstK, curLevel, maxLevel, isFirstPosition);
				break;
			case "or":
				result = this.expandOr(node$1.alternatives, firstK, curLevel, maxLevel, isFirstPosition);
				break;
			case "sequence":
				result = this.expandSequenceNode(node$1, firstK, curLevel, maxLevel, isFirstPosition);
				break;
			case "option":
			case "many":
				result = this.expandOption(node$1.node, firstK, curLevel, maxLevel, isFirstPosition);
				break;
			case "atLeastOne":
				result = this.expandAtLeastOne(node$1.node, firstK, curLevel, maxLevel, isFirstPosition);
				break;
			default: throw new Error(`未知节点类型: ${node$1.type}`);
		}
		this.perfAnalyzer.endMethod(callId, void 0, result.length);
		return result;
	}
	checkTimeout(location) {
		if (!this.operationStartTime) return;
		const elapsed = (Date.now() - this.operationStartTime) / 1e3;
		this.timeoutSeconds - elapsed;
		if (elapsed > this.timeoutSeconds) {
			const errorMsg = `
❌ ========== 操作超时 ==========
超时位置: ${location}
当前规则: ${this.currentProcessingRule}
已耗时: ${elapsed.toFixed(2)}秒
超时阈值: ${this.timeoutSeconds}秒

建议：
1. 检查是否存在笛卡尔积爆炸
2. 检查是否有循环递归未被检测
3. 查看日志最后处理的规则和子节点
================================`;
			console.error(errorMsg);
			throw new Error(`操作超时: ${elapsed.toFixed(2)}秒 (超时位置: ${location})`);
		}
	}
	expandSequenceNode(node$1, firstK, curLevel, maxLevel, isFirstPosition = true) {
		const callId = this.perfAnalyzer.startMethod("expandSequenceNode");
		this.checkTimeout("expandSequenceNode-开始");
		if (node$1.nodes.length === 0) return [[]];
		let requiredCount = 0;
		let expandToIndex = node$1.nodes.length;
		for (let i = 0; i < node$1.nodes.length; i++) {
			const child = node$1.nodes[i];
			if (child.type !== "option" && child.type !== "many") {
				requiredCount++;
				if (requiredCount >= firstK) {
					expandToIndex = i + 1;
					break;
				}
			}
		}
		const nodesToExpand = node$1.nodes.slice(0, expandToIndex);
		const allBranches = [];
		let minLengthSum = 0;
		for (let i = 0; i < nodesToExpand.length; i++) {
			this.checkTimeout(`expandSequenceNode-子节点${i + 1}`);
			const expandChildStartTime = Date.now();
			let branches = this.expandNode(nodesToExpand[i], firstK, curLevel, maxLevel, isFirstPosition && i === 0);
			Date.now() - expandChildStartTime;
			if (branches.length === 0) return [];
			branches = branches.map((item) => item.slice(0, firstK));
			allBranches.push(branches);
			let minLength = Infinity;
			for (const b of branches) {
				const len = b.length;
				if (len < minLength) {
					minLength = len;
					if (minLength === 0) break;
				}
			}
			minLengthSum += minLength;
			if (minLengthSum >= firstK) break;
		}
		if (allBranches.length === 0) return [];
		this.checkTimeout("expandSequenceNode-笛卡尔积前");
		const result = this.cartesianProduct(allBranches, firstK);
		this.checkTimeout("expandSequenceNode-笛卡尔积后");
		const finalResult = this.truncateAndDeduplicate(result, firstK);
		this.perfAnalyzer.endMethod(callId, node$1.nodes.length, finalResult.length);
		return finalResult;
	}
	/**
	* 广度优先展开（BFS - Breadth-First Search）
	*
	* 🚀 算法：逐层循环，精确控制层数
	* 🔥 优化：增量复用 - 从最近的缓存层级开始，而非每次从 level 1 开始
	*
	* 适用场景：
	* - maxLevel = 具体值（如 3, 5）
	* - 需要展开到指定层级
	* - 适合 First(∞) + 限制层数
	*
	* 设计理念：
	* - BFS 只负责按层级完整展开（firstK=∞）
	* - 不负责截取操作
	* - 截取由外层调用者统一处理
	*
	* 优化策略：
	* - 增量复用：level3 = level2 + 展开1层
	* - 缓存查找：从 maxLevel-1 → maxLevel-2 → ... → level 1
	* - 跳过中间计算：避免重复展开低层级
	*
	* @param ruleName 顶层规则名
	* @param maxLevel 目标层级
	* @returns 展开到目标层级的完整路径（不截取）
	*
	* 核心逻辑（增量展开）：
	* 1. 查找最近的缓存层级（maxLevel-1, maxLevel-2, ..., 1）
	* 2. 从最近的缓存开始展开（而非总是从 level 1）
	* 3. 每次展开1层：调用 expandSinglePath
	* 4. 分离已完成（全token）和未完成（含规则名）的路径
	* 5. 继续展开未完成的路径
	* 6. 达到目标层级后停止
	*
	* 示例：
	* 展开 level 4：
	*   - 查找 level 3 缓存 → 找到 ✅
	*   - level 3 + 展开1层 = level 4
	*   - 节省：level 1→2→3 的计算
	*/
	/**
	* BFS 展开（纯递归实现，智能缓存复用）
	*
	* 核心思想：
	* 1. 查找最大可用缓存块（如 level 3）
	* 2. 对缓存的每个路径中的规则名，递归调用自己
	* 3. 缓存并返回结果
	*
	* 示例：查找 A:10，缓存有 A:3
	* - 找到 A:3 = [a1, B, c1]
	* - 对 B 递归调用 expandPathsByBFSCache(B, 7, [B])
	*   - 找到 B:3 = [b1, C, c1]
	*   - 对 C 递归调用 expandPathsByBFSCache(C, 4, [C])
	*     - 找到 C:3 = [c1, D, c3]
	*     - 对 D 递归调用 expandPathsByBFSCache(D, 1, [D])
	*       - 返回 getDirectChildren(D)
	*     - 缓存 C:4 ✅
	*   - 缓存 B:7 ✅
	* - 缓存 A:10 ✅
	*
	* BFS 展开（纯净版，单方法递归实现）
	*
	* 核心逻辑：
	* 1. 查找 ruleName 的最近缓存
	* 2. 对缓存的每个路径中的规则名，递归调用自己
	* 3. 自动缓存中间结果
	*
	* 示例：查找 A:10，缓存有 A:3
	* - 查找 A:10 → 找到 A:3 = [[a1, B, c1]]
	* - 对 B 递归：expandPathsByBFSCacheClean(B, 7)
	*   - 查找 B:7 → 找到 B:3 = [[b1, C, d1]]
	*   - 对 C 递归：expandPathsByBFSCacheClean(C, 4)
	*     - 查找 C:4 → 找到 C:3 = [[c1, D, e1]]
	*     - 对 D 递归：expandPathsByBFSCacheClean(D, 1)
	*       → 返回 getDirectChildren(D)
	*     - 缓存 C:4 ✅
	*   - 缓存 B:7 ✅
	* - 缓存 A:10 ✅
	*
	* @param ruleName 规则名
	* @param targetLevel 目标层级
	* @returns 展开结果
	*/
	expandPathsByBFSCache(ruleName, targetLevel) {
		const depth = this.currentDepth;
		if (targetLevel === 0) throw new Error("系统错误");
		const tokenNode = this.tokenCache?.get(ruleName);
		if (tokenNode && tokenNode.type === "consume") return [[ruleName]];
		if (targetLevel === EXPANSION_LIMITS.LEVEL_1) {
			this.writeLog(`触发 getDirectChildren(${ruleName}) [执行中]`, depth);
			this.currentDepth = depth + 1;
			const result = this.getDirectChildren(ruleName);
			this.currentDepth = depth;
			this.writeLog(`触发 getDirectChildren(${ruleName}) [执行完]`, depth);
			this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=1), 路径数: ${result.length} [执行完]`, depth);
			return result;
		}
		const key = `${ruleName}:${targetLevel}`;
		this.currentProcessingRule = `${ruleName}:Level${targetLevel}`;
		this.checkTimeout(`expandPathsByBFSCache-${ruleName}-Level${targetLevel}`);
		if (this.bfsLevelCache.has(key)) {
			const cached = this.getCacheValue("bfsLevelCache", key);
			this.writeLog(`✅ BFS缓存命中: ${key}, 路径数: ${cached.length}`, depth);
			this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 缓存命中, 路径数: ${cached.length} [执行完]`, depth);
			return cached;
		}
		this.writeLog(`❌ BFS缓存未命中: ${key}`, depth);
		let cachedLevel = 1;
		let cachedBranches = null;
		for (let level = Math.min(targetLevel, EXPANSION_LIMITS.LEVEL_K); level >= 2; level--) {
			const cacheKey = `${ruleName}:${level}`;
			if (this.bfsLevelCache.has(cacheKey)) {
				cachedLevel = level;
				cachedBranches = this.getCacheValue("bfsLevelCache", cacheKey);
				this.writeLog(`✅ 找到缓存: ${cacheKey}, 路径数: ${cachedBranches.length}`, depth);
				if (level === targetLevel) {
					this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 使用缓存, 路径数: ${cachedBranches.length} [执行完]`, depth);
					return cachedBranches;
				}
				break;
			} else this.writeLog(`❌ 没有缓存: ${cacheKey}`, depth);
		}
		if (!cachedBranches) {
			this.writeLog(`触发 getDirectChildren(${ruleName}) [执行中]`, depth);
			cachedLevel = EXPANSION_LIMITS.LEVEL_1;
			this.currentDepth = depth + 1;
			cachedBranches = this.getDirectChildren(ruleName);
			this.currentDepth = depth;
			this.writeLog(`触发 getDirectChildren(${ruleName}) [执行完]`, depth);
		}
		const remainingLevels = targetLevel - cachedLevel;
		if (remainingLevels <= 0) throw new Error("系统错误");
		let expandedPaths = [];
		const totalPaths = cachedBranches.length;
		const branchResults = [];
		for (let branchIndex = 0; branchIndex < cachedBranches.length; branchIndex++) {
			const branchSeqRules = cachedBranches[branchIndex];
			if (branchIndex % 10 === 0 || branchIndex === cachedBranches.length - 1) this.checkTimeout(`expandPathsByBFSCache-${ruleName}-处理路径${branchIndex + 1}/${totalPaths}`);
			const branchAllRuleBranchSeqs = [];
			for (let ruleIndex = 0; ruleIndex < branchSeqRules.length; ruleIndex++) {
				const subRuleName = branchSeqRules[ruleIndex];
				this.checkTimeout(`expandPathsByBFSCache-${ruleName}-展开符号${ruleIndex + 1}/${branchSeqRules.length}:${subRuleName}`);
				if (branchSeqRules.includes(subRuleName) && branchSeqRules.indexOf(subRuleName) < ruleIndex) {
					this.writeLog(`⚠️ 递归检测: ${subRuleName} 已在路径中，不再展开`, depth);
					branchAllRuleBranchSeqs.push([[subRuleName]]);
					continue;
				}
				this.writeLog(`展开子规则: ${subRuleName}, 剩余层数: ${remainingLevels} [执行中]`, depth);
				this.currentDepth = depth + 1;
				const result = this.expandPathsByBFSCache(subRuleName, remainingLevels);
				this.currentDepth = depth;
				branchAllRuleBranchSeqs.push(result);
				this.writeLog(`展开子规则: ${subRuleName}, 剩余层数: ${remainingLevels} [执行完], 结果数: ${result.length}`, depth);
			}
			const branchSizes = branchAllRuleBranchSeqs.map((b) => b.length);
			const estimatedCombinations = branchSizes.reduce((a, b) => a * b, 1);
			const totalInputSize = branchSizes.reduce((a, b) => a + b, 0);
			this.writeLog(`笛卡尔积计算 [执行中]: 分支数: ${branchAllRuleBranchSeqs.length}, 各分支大小: [${branchSizes.join(", ")}], 预计组合数: ${estimatedCombinations}, 总输入大小: ${totalInputSize}`, depth);
			const pathResult = this.cartesianProduct(branchAllRuleBranchSeqs, EXPANSION_LIMITS.INFINITY);
			this.writeLog(`笛卡尔积计算 [执行完]: 结果数: ${pathResult.length}, 预计组合数: ${estimatedCombinations}`, depth);
			this.checkTimeout(`expandPathsByBFSCache-${ruleName}-路径${branchIndex + 1}-笛卡尔积后`);
			if (targetLevel === EXPANSION_LIMITS.LEVEL_K) {
				const branchName = branchSeqRules.join(" ");
				branchResults.push({
					branchName,
					paths: pathResult
				});
			}
			expandedPaths = expandedPaths.concat(pathResult);
		}
		this.checkTimeout(`expandPathsByBFSCache-${ruleName}-去重前`);
		const finalResult = this.deduplicate(expandedPaths);
		if (this.bfsLevelCache.has(key)) throw new Error("系统错误");
		if (!this.isRuleNameOnly(finalResult, ruleName)) {
			this.bfsLevelCache.set(key, finalResult);
			this.writeLog(`📦 存储缓存: ${key}, 路径数: ${finalResult.length}`, depth);
		} else this.writeLog(`⚠️ 跳过缓存（规则名本身）: ${key}`, depth);
		if (targetLevel === EXPANSION_LIMITS.LEVEL_K) {
			this.writeLog(``, depth);
			this.writeLog(`📋 完整结果 (共 ${finalResult.length} 条路径, ${branchResults.length} 个语法分支):`, depth);
			this.writeLog(`${"=".repeat(80)}`, depth);
			for (let i = 0; i < branchResults.length; i++) {
				const branch = branchResults[i];
				this.writeLog(``, depth);
				this.writeLog(`分支 ${i + 1}: ${branch.branchName} (${branch.paths.length} 条路径)`, depth);
				this.writeLog(`${"-".repeat(80)}`, depth);
				branch.paths.forEach((path$1, index) => {
					this.writeLog(`   ${(index + 1).toString().padStart(4, " ")}. ${path$1.join(" ")}`, depth);
				});
			}
			this.writeLog(`${"=".repeat(80)}`, depth);
			this.writeLog(``, depth);
		}
		this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 路径数: ${finalResult.length} [执行完]`, depth);
		return finalResult;
	}
	/**
	* 获取规则的直接子节点（展开1层）
	*
	* @param ruleName 规则名
	* @returns 直接子节点的所有路径（展开1层）
	*
	* 优先级：
	* 1. 从 bfsLevelCache 获取 "ruleName:1"（如果已初始化）
	* 2. 动态计算并缓存
	*
	* 示例：
	* - Statement → [[BlockStatement], [IfStatement], [ExpressionStatement], ...]
	* - IfStatement → [[If, LParen, Expression, RParen, Statement]]
	*/
	getDirectChildren(ruleName) {
		const maxLevel = EXPANSION_LIMITS.LEVEL_1;
		const key = `${ruleName}:${maxLevel}`;
		const depth = this.currentDepth;
		if (this.bfsLevelCache.has(key)) {
			this.perfAnalyzer.recordCacheHit("getDirectChildren");
			const cached = this.getCacheValue("bfsLevelCache", key);
			this.writeLog(`✅ getDirectChildren缓存命中: ${key}, 路径数: ${cached.length}`, depth);
			this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), 缓存命中, 路径数: ${cached.length} [执行完]`, depth);
			return cached;
		}
		this.perfAnalyzer.recordCacheMiss("getDirectChildren");
		this.writeLog(`❌ getDirectChildren缓存未命中: ${key}`, depth);
		const tokenNode = this.tokenCache?.get(ruleName);
		if (tokenNode && tokenNode.type === "consume") {
			const result$1 = [[ruleName]];
			this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), Token节点, 路径数: 1 [执行完]`, depth);
			return result$1;
		}
		if (!this.getRuleNodeByAst(ruleName)) throw new Error(`系统错误：规则不存在: ${ruleName}`);
		const t0 = Date.now();
		const result = this.expandPathsByDFSCache(ruleName, EXPANSION_LIMITS.INFINITY, 0, maxLevel, false);
		Date.now() - t0;
		const shouldCache = !this.isRuleNameOnly(result, ruleName);
		if (shouldCache && !this.bfsLevelCache.has(key)) {
			this.bfsLevelCache.set(key, result);
			this.writeLog(`📦 存储BFS缓存: ${key}, 路径数: ${result.length}`, depth);
		} else if (!shouldCache) this.writeLog(`⚠️ 跳过缓存（规则名本身）: ${key}`, depth);
		this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), 路径数: ${result.length} [执行完]`, depth);
		return result;
	}
	/**
	* 处理 DFS 模式（深度优先展开，无限层级）
	*
	* @param ruleName 规则名
	* @param firstK 截取数量
	* @param curLevel 当前层级
	* @param maxLevel
	* @param isFirstPosition 是否在第一个位置（用于左递归检测）
	* @returns 展开结果
	*/
	expandPathsByDFSCache(ruleName, firstK, curLevel, maxLevel, isFirstPosition) {
		const t0 = Date.now();
		this.perfAnalyzer.cacheStats.subRuleHandlerTotal++;
		if (!ruleName) throw new Error("系统错误");
		if (curLevel === maxLevel) {
			this.perfAnalyzer.cacheStats.levelLimitReturn++;
			return [[ruleName]];
		} else if (curLevel > maxLevel) throw new Error("系统错误");
		curLevel++;
		if (firstK === EXPANSION_LIMITS.FIRST_K) {
			const cached = this.getCacheValue("dfsFirstKCache", ruleName);
			if (cached !== void 0) {
				const duration = Date.now() - t0;
				this.perfAnalyzer.record("subRuleHandler", duration);
				return cached;
			}
		} else if (firstK === EXPANSION_LIMITS.INFINITY) {
			if (maxLevel !== EXPANSION_LIMITS.LEVEL_1) throw new Error(`系统错误：不支持的参数组合 firstK=${firstK}, maxLevel=${maxLevel}`);
		}
		if (this.recursiveDetectionSet.has(ruleName)) if (isFirstPosition) {
			if (!this.detectedLeftRecursionErrors.has(ruleName)) {
				const error = {
					level: "FATAL",
					type: "left-recursion",
					ruleName,
					branchIndices: [],
					conflictPaths: {
						pathA: "",
						pathB: ""
					},
					message: `规则 "${ruleName}" 存在左递归`,
					suggestion: ""
				};
				this.detectedLeftRecursionErrors.set(ruleName, error);
			}
			this.perfAnalyzer.cacheStats.recursiveReturn++;
			return [[ruleName]];
		} else {
			this.perfAnalyzer.cacheStats.recursiveReturn++;
			return [[ruleName]];
		}
		this.recursiveDetectionSet.add(ruleName);
		try {
			this.perfAnalyzer.recordActualCompute();
			const expandCallId = this.perfAnalyzer.startMethod("expandPathsByDFSCache");
			const subNode = this.getRuleNodeByAst(ruleName);
			const finalResult = this.expandNode(subNode, firstK, curLevel, maxLevel, isFirstPosition);
			this.perfAnalyzer.endMethod(expandCallId, void 0, finalResult.length);
			const shouldCache = !this.isRuleNameOnly(finalResult, ruleName);
			if (firstK === EXPANSION_LIMITS.FIRST_K) {
				if (shouldCache && !this.dfsFirstKCache.has(ruleName)) this.dfsFirstKCache.set(ruleName, finalResult);
			} else if (firstK === EXPANSION_LIMITS.INFINITY) {
				if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
					const key = ruleName + `:${EXPANSION_LIMITS.LEVEL_1}`;
					if (shouldCache && !this.bfsLevelCache.has(key)) this.bfsLevelCache.set(key, finalResult);
				}
			}
			return finalResult;
		} finally {
			this.recursiveDetectionSet.delete(ruleName);
		}
	}
	/**
	* 判断展开结果是否是规则名本身（未展开）
	*
	* 规则名本身的情况：[[ruleName]] - 只有一个路径，且这个路径只有一个元素，就是这个规则名
	*
	* @param result 展开结果
	* @param ruleName 规则名
	* @returns 如果是规则名本身返回 true，否则返回 false
	*/
	isRuleNameOnly(result, ruleName) {
		if (result.length === 1 && result[0].length === 1 && result[0][0] === ruleName) return true;
		return false;
	}
	/**
	* 去重：移除重复的分支
	*
	* 例如：[[a,b], [c,d], [a,b]] → [[a,b], [c,d]]
	*
	* ⚠️ 重要：空分支处理
	* - 空分支 [] 会被序列化为空字符串 ""
	* - 空分支不会被过滤，会正常参与去重
	* - 例如：[[], [a], []] → [[], [a]]
	*/
	deduplicate(branches) {
		const callId = this.perfAnalyzer.startMethod("deduplicate");
		const seen = /* @__PURE__ */ new Set();
		const result = [];
		for (const branch of branches) {
			const key = branch.join(EXPANSION_LIMITS.RuleJoinSymbol);
			if (!seen.has(key)) {
				seen.add(key);
				result.push(branch);
			}
		}
		this.perfAnalyzer.endMethod(callId, branches.length, result.length);
		return result;
	}
	/**
	* 截取并去重：先截取到 firstK，再去重
	*
	* 使用场景：笛卡尔积后路径变长，需要截取
	*
	* 例如：[[a,b,c], [d,e,f]], firstK=2 → [[a,b], [d,e]]
	*
	* ⚠️ 重要：空分支处理
	* - 空分支 [] slice(0, firstK) 还是 []
	* - 空分支不会被过滤，会正常参与去重
	* - 例如：[[], [a,b,c]], firstK=2 → [[], [a,b]]
	*
	* 🔧 优化：如果 firstK=INFINITY，不需要截取，只去重
	*/
	truncateAndDeduplicate(branches, firstK) {
		const callId = this.perfAnalyzer.startMethod("truncateAndDeduplicate");
		if (firstK === EXPANSION_LIMITS.INFINITY) {
			const result$1 = this.deduplicate(branches);
			this.perfAnalyzer.endMethod(callId, branches.length, result$1.length);
			return result$1;
		}
		const truncated = branches.map((branch) => branch.slice(0, firstK));
		const result = this.deduplicate(truncated);
		this.perfAnalyzer.endMethod(callId, branches.length, result.length);
		return result;
	}
	/**
	* 展开 Or 节点
	*
	* 核心逻辑：合并所有分支的展开结果
	*
	* 例如：or(abc / de) firstK=2
	*   → abc 展开为 [[a,b]]
	*   → de 展开为 [[d,e]]
	*   → 合并为 [[a,b], [d,e]]
	*
	* ⚠️ 重要：空分支在 or 中的处理
	* - 如果某个分支是 option/many，可能包含空分支 []
	* - 例如：or(option(a) / b)
	*   → option(a) 展开为 [[], [a]]
	*   → b 展开为 [[b]]
	*   → 合并为 [[], [a], [b]]
	* - 空分支会被正常保留，不会被过滤
	*
	* 注意：不需要截取，因为子节点已保证长度≤firstK
	*
	* 🔴 关键：Or 分支中的每个替代也是"第一个位置"
	* - 在 PEG 的选择中，每个分支都是独立的起点
	* - Or 分支内的第一个规则需要检测左递归
	* - 例如：A → A '+' B | C
	*   - 第一个分支 A '+' B 中，A 在第一个位置，需要检测
	*   - 第二个分支 C 中，C 也在第一个位置
	*/
	expandOr(alternatives, firstK, curLevel, maxLevel, isFirstPosition = true) {
		const callId = this.perfAnalyzer.startMethod("expandOr");
		if (alternatives.length === 0) throw new Error("系统错误：Or 节点没有分支");
		let result = [];
		for (const alt of alternatives) {
			const branches = this.expandNode(alt, firstK, curLevel, maxLevel, isFirstPosition);
			result = result.concat(branches);
		}
		if (result.length === 0) throw new Error("系统错误：Or 节点所有分支都没有结果");
		const finalResult = this.deduplicate(result);
		this.perfAnalyzer.endMethod(callId, alternatives.length, finalResult.length);
		return finalResult;
	}
	/**
	* 展开 Option/Many 节点
	*
	* option(X) = ε | X（0次或1次）
	* many(X) = ε | X | XX | XXX...（0次或多次）
	*
	* First 集合：
	* First(option(X)) = {ε} ∪ First(X)
	* First(many(X)) = {ε} ∪ First(X)
	*
	* 例如：option(abc) firstK=2
	*   → abc 展开为 [[a,b]]
	*   → 结果为 [[], [a,b]]（空分支 + 内部分支）
	*
	* ⚠️⚠️⚠️ 关键：空分支 [] 的重要性 ⚠️⚠️⚠️
	* - 空分支 [] 表示 option/many 可以跳过（0次）
	* - 空分支在后续处理中不会被过滤：
	*   1. deduplicate：[] join(',') = ""，正常去重
	*   2. cartesianProduct：[...seq, ...[]] = [...seq]，正常拼接
	*   3. truncateAndDeduplicate：[] slice(0,k) = []，正常截取
	* - 空分支必须保留，否则 option/many 的语义就错了！
	*
	* 注意：不需要截取，因为子节点已保证长度≤firstK
	*
	* 🔴 关键：Option 内的规则也需要检测左递归
	* - 虽然 option(X) 可以跳过，但当内部有递归时也是左递归
	* - 例如：A → option(A) B
	*   - option(A) 中的 A 在第一个位置，需要检测左递归
	*/
	expandOption(node$1, firstK, curLevel, maxLevel, isFirstPosition = true) {
		const callId = this.perfAnalyzer.startMethod("expandOption");
		const result = [[], ...this.expandNode(node$1, firstK, curLevel, maxLevel, isFirstPosition)];
		const finalResult = this.deduplicate(result);
		this.perfAnalyzer.endMethod(callId, void 0, finalResult.length);
		return finalResult;
	}
	/**
	* 展开 AtLeastOne 节点
	*
	* atLeastOne(X) = X | XX | XXX...（至少1次）
	*
	* First 集合：
	* First(atLeastOne(X)) = First(X) ∪ First(XX)
	*
	* 例如：atLeastOne(ab) firstK=3
	*   → ab 展开为 [[a,b]]
	*   → 1次：[[a,b]]
	*   → 2次：[[a,b,a,b]] 截取到3 → [[a,b,a]]
	*   → 结果为 [[a,b], [a,b,a]]
	*
	* ⚠️ 重要：空分支说明
	* - atLeastOne 至少执行1次，不会产生空分支 []
	* - 与 option/many 不同，atLeastOne 的结果不包含 []
	* - 但如果内部节点包含空分支（来自嵌套的 option/many）：
	*   例如：atLeastOne(option(a))
	*   → option(a) 展开为 [[], [a]]
	*   → 1次：[[], [a]]
	*   → 2次：[[], [a]] × 2 → [[], [a]]（空分支拼接还是空分支）
	*   → 结果为 [[], [a]]
	* - 空分支会被正常保留，不会被过滤
	*
	* 注意：doubleBranches 需要内部截取，因为拼接后会超过 firstK
	*
	* 🔴 关键：AtLeastOne 内的规则也需要检测左递归
	*/
	expandAtLeastOne(node$1, firstK, curLevel, maxLevel, isFirstPosition = true) {
		const callId = this.perfAnalyzer.startMethod("expandAtLeastOne");
		const innerBranches = this.expandNode(node$1, firstK, curLevel, maxLevel, isFirstPosition);
		const doubleBranches = innerBranches.map((branch) => {
			return [...branch, ...branch].slice(0, firstK);
		});
		const result = [...innerBranches, ...doubleBranches];
		const finalResult = this.deduplicate(result);
		this.perfAnalyzer.endMethod(callId, void 0, finalResult.length);
		return finalResult;
	}
	/**
	* 生成左递归修复建议
	*
	* @param ruleName 规则名
	* @param node 规则节点
	* @param firstSet First 集合
	* @returns 修复建议
	*/
	getLeftRecursionSuggestion(ruleName, node$1, firstSet) {
		if (node$1.type === "or") return `PEG 不支持左递归！请将左递归改为右递归，或使用 Many/AtLeastOne。

示例：
  ❌ 左递归（非法）：
     ${ruleName} → ${ruleName} '+' Term | Term

  ✅ 右递归（合法）：
     ${ruleName} → Term ('+' Term)*

  或使用 Many：
     ${ruleName} → Term
     ${ruleName}Suffix → '+' Term
     完整形式 → ${ruleName} ${ruleName}Suffix*

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(", ")}${firstSet.size > 5 ? ", ..." : ""}}
包含 ${ruleName} 本身，说明存在左递归。`;
		return `PEG 不支持左递归！请重构语法以消除左递归。

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(", ")}${firstSet.size > 5 ? ", ..." : ""}}
包含 ${ruleName} 本身，说明存在左递归。`;
	}
};

//#endregion
//#region ../../subhuti/src/validation/SubhutiValidationError.ts
/**
* 语法验证异常
*/
var SubhutiGrammarValidationError = class extends Error {
	constructor(errors, stats) {
		super("Grammar validation failed");
		this.errors = errors;
		this.stats = stats;
		this.name = "SubhutiGrammarValidationError";
	}
	/**
	* 格式化错误信息（包含统计信息）
	*/
	toString() {
		const lines = [];
		for (const error of this.errors) {
			let title = "";
			if (error.type === "prefix-conflict" && error.branchIndices.length === 2) {
				const [i, j] = error.branchIndices;
				title = `[${error.level}] 分支 ${j} 被分支 ${i} 遮蔽`;
			} else if (error.type === "or-identical-branches" && error.branchIndices.length === 2) {
				const [i, j] = error.branchIndices;
				title = `[${error.level}] 分支 ${i} 和分支 ${j} 完全相同`;
			} else title = `[${error.level}] ${error.message}`;
			lines.push(title);
			lines.push(`  Rule: ${error.ruleName}`);
			lines.push(`  Branches: [${error.branchIndices.join(", ")}]`);
			if (error.conflictPaths) {
				lines.push(`  Path A: ${error.conflictPaths.pathA}`);
				lines.push(`  Path B: ${error.conflictPaths.pathB}`);
			}
			if (error.type === "prefix-conflict" && error.branchIndices.length === 2) {
				const [i, j] = error.branchIndices;
				lines.push(`  Suggestion: 将分支 ${j} 移到分支 ${i} 前面（长规则在前，短规则在后）`);
			} else lines.push(`  Suggestion: ${error.suggestion}`);
			lines.push("");
		}
		if (this.stats) {
			const s = this.stats;
			lines.push("");
			lines.push("=".repeat(60));
			lines.push("📊 ========== 统计信息 ==========");
			lines.push("=".repeat(60));
			lines.push("");
			lines.push("⏱️  时间统计：");
			lines.push(`   总耗时: ${s.totalTime}ms`);
			lines.push(`   ├─ First(K) 缓存生成: ${s.dfsFirstKTime}ms (${(s.dfsFirstKTime / s.totalTime * 100).toFixed(1)}%)`);
			lines.push(`   ├─ MaxLevel 缓存生成: ${s.bfsMaxLevelTime}ms (${(s.bfsMaxLevelTime / s.totalTime * 100).toFixed(1)}%)`);
			lines.push(`   └─ Or 冲突检测: ${s.orDetectionTime}ms (${(s.orDetectionTime / s.totalTime * 100).toFixed(1)}%)`);
			lines.push("");
			lines.push("🔍 检测结果：");
			lines.push(`   ├─ 左递归错误: ${s.leftRecursionCount} 个`);
			lines.push(`   └─ Or 分支遮蔽: ${s.orConflictCount} 个`);
			lines.push(`   总计: ${this.errors.length} 个错误`);
			lines.push("");
			lines.push("📦 缓存信息：");
			lines.push(`   ├─ dfsFirstKCache: ${s.dfsFirstKCacheSize} 条 (First(${s.firstK}))`);
			lines.push(`   └─ bfsAllCache: ${s.bfsAllCacheSize} 条 (MaxLevel)`);
			if (s.cacheUsage) {
				lines.push("");
				lines.push("💾 缓存使用率：");
				const dfs$3 = s.cacheUsage.dfsFirstK;
				lines.push(`   dfsFirstKCache:`);
				lines.push(`      查询次数: ${dfs$3.getCount}`);
				lines.push(`      命中次数: ${dfs$3.hit}`);
				lines.push(`      未命中次数: ${dfs$3.miss}`);
				lines.push(`      命中率: ${dfs$3.hitRate.toFixed(1)}%`);
				lines.push(`      缓存总条数: ${s.dfsFirstKCacheSize}`);
				const bfsAll = s.cacheUsage.bfsAllCache;
				lines.push(`   bfsAllCache:`);
				lines.push(`      查询次数: ${bfsAll.getCount}`);
				lines.push(`      命中次数: ${bfsAll.hit}`);
				lines.push(`      未命中次数: ${bfsAll.miss}`);
				lines.push(`      命中率: ${bfsAll.total > 0 ? bfsAll.hitRate.toFixed(1) : "0.0"}%`);
				lines.push(`      缓存总条数: ${bfsAll.size}`);
				const bfsLevel = s.cacheUsage.bfsLevelCache;
				lines.push(`   bfsLevelCache:`);
				lines.push(`      查询次数: ${bfsLevel.getCount}`);
				lines.push(`      命中次数: ${bfsLevel.hit}`);
				lines.push(`      未命中次数: ${bfsLevel.miss}`);
				lines.push(`      命中率: ${bfsLevel.total > 0 ? bfsLevel.hitRate.toFixed(1) : "N/A"}%`);
				lines.push(`      缓存总条数: ${bfsLevel.size}`);
				const gdc = s.cacheUsage.getDirectChildren;
				if (gdc.total > 0) {
					lines.push(`   getDirectChildren (懒加载):`);
					lines.push(`      查询次数: ${gdc.total}`);
					lines.push(`      命中次数: ${gdc.hit}`);
					lines.push(`      未命中次数: ${gdc.miss}`);
					lines.push(`      命中率: ${gdc.hitRate.toFixed(1)}%`);
					lines.push(`      缓存总条数: 与 bfsLevelCache 共用`);
				}
			}
			lines.push("");
			lines.push("=".repeat(60));
		}
		return lines.join("\n");
	}
};

//#endregion
//#region ../../subhuti/src/validation/SubhutiGrammarValidator.ts
/**
* SubhutiGrammarValidator - 语法验证器
*
* 职责：
* 1. 提供静态验证方法
* 2. 封装验证流程（收集 → 分析 → 检测 → 报告）
*
* 设计：
* - 纯静态方法，无实例状态
* - 使用 Proxy 方案收集 AST（零侵入）
* - 有问题直接抛异常
*
* @version 2.0.0 - 静态方法重构
*/
var SubhutiGrammarValidator = class {
	/**
	* 验证语法：有问题直接抛异常
	*
	* 流程（分层检测）：
	* 1. 使用 Proxy 收集规则 AST
	* 2. 分析所有可能路径和 First 集合
	* 3. Level 0: 左递归检测 (FATAL) - 最先检测，最致命
	* 4. Level 1 & 2: Or 分支冲突检测 (FATAL/ERROR)
	* 5. 有错误抛 SubhutiGrammarValidationError
	*
	* @param parser Parser 实例
	* @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
	* @throws SubhutiGrammarValidationError 语法有冲突时抛出
	*/
	static validate(parser) {
		const ruleASTs = SubhutiRuleCollector.collectRules(parser);
		const result = new SubhutiGrammarAnalyzer(ruleASTs.cstMap, ruleASTs.tokenMap).initCacheAndCheckLeftRecursion();
		if (result.errors.length > 0) {
			const error = new SubhutiGrammarValidationError(result.errors, result.stats);
			console.error("\n" + error.toString());
		}
	}
};

//#endregion
//#region ../../subhuti/src/SubhutiParser.ts
/**
* Subhuti Parser - 高性能 PEG Parser 框架
*
* 核心特性：
* - Packrat Parsing（线性时间复杂度，LRU 缓存）
* - 返回值语义（成功返回 CST，失败返回 undefined）
*
* 架构设计：
* - 继承 SubhutiTokenLookahead（前瞻能力）
* - 实现 ITokenConsumerContext（提供消费接口）
* - 支持泛型扩展 SubhutiTokenConsumer
*
* @version 5.0.0
*/
function Subhuti(target, context) {
	return target;
}
function SubhutiRule(targetFun, context) {
	const ruleName = targetFun.name;
	const wrappedFunction = function(...args) {
		const className = this.constructor.name;
		return this.executeRuleWrapper(targetFun, ruleName, className, ...args);
	};
	Object.defineProperty(wrappedFunction, "name", { value: ruleName });
	Object.defineProperty(wrappedFunction, "__originalFunction__", {
		value: targetFun,
		writable: false,
		enumerable: false,
		configurable: false
	});
	Object.defineProperty(wrappedFunction, "__isSubhutiRule__", {
		value: true,
		writable: false,
		enumerable: false,
		configurable: false
	});
	return wrappedFunction;
}
var SubhutiParser = class extends SubhutiTokenLookahead {
	/**
	* 设置同步点 Token
	*/
	setSyncTokens(tokens) {
		this._syncTokens = new Set(tokens);
		return this;
	}
	/**
	* 添加同步点 Token
	*/
	addSyncTokens(tokens) {
		for (const token of tokens) this._syncTokens.add(token);
		return this;
	}
	/**
	* 启用容错模式
	*/
	enableErrorRecovery() {
		this._errorRecoveryMode = true;
		return this;
	}
	/**
	* 获取容错模式状态
	*/
	get errorRecoveryMode() {
		return this._errorRecoveryMode;
	}
	getRuleStack() {
		return this.cstStack.map((item) => item.name);
	}
	/**
	* 获取未被解析的 tokens 列表
	*/
	get unparsedTokens() {
		return this._unparsedTokens;
	}
	/**
	* 是否有未被解析的 tokens
	*/
	get hasUnparsedTokens() {
		return this._unparsedTokens.length > 0;
	}
	/**
	* 构造函数 - 按需词法分析模式
	*
	* @param sourceCode 源代码
	* @param options 配置选项
	*/
	constructor(sourceCode = "", options) {
		super();
		this.cstStack = [];
		this._lexer = null;
		this._sourceCode = "";
		this._codeIndex = 0;
		this._codeLine = 1;
		this._codeColumn = 1;
		this._lastTokenName = null;
		this._templateDepth = 0;
		this._defaultGoal = LexicalGoal.InputElementDiv;
		this._tokenCache = /* @__PURE__ */ new Map();
		this._parsedTokens = [];
		this._analysisMode = false;
		this._errorRecoveryMode = false;
		this._syncTokens = new Set([
			"LetTok",
			"ConstTok",
			"VarTok",
			"FunctionTok",
			"ClassTok",
			"AsyncTok",
			"IfTok",
			"ForTok",
			"WhileTok",
			"DoTok",
			"SwitchTok",
			"TryTok",
			"ThrowTok",
			"ReturnTok",
			"BreakTok",
			"ContinueTok",
			"ImportTok",
			"ExportTok",
			"DebuggerTok",
			"Semicolon"
		]);
		this._errorHandler = new SubhutiErrorHandler();
		this.loopDetectionSet = /* @__PURE__ */ new Set();
		this.enableMemoization = true;
		this._partialMatchCandidates = [];
		this._unparsedTokens = [];
		this._parseRecordRoot = null;
		this._parseRecordStack = [];
		this.className = this.constructor.name;
		this._cache = new SubhutiPackratCache();
		this._sourceCode = sourceCode;
		this._codeIndex = 0;
		this._codeLine = 1;
		this._codeColumn = 1;
		this._lastTokenName = null;
		this._templateDepth = 0;
		this._tokenCache = /* @__PURE__ */ new Map();
		this._parsedTokens = [];
		if (options?.tokenDefinitions) this._lexer = new SubhutiLexer(options.tokenDefinitions);
		if (options?.tokenConsumer) this.tokenConsumer = new options.tokenConsumer(this);
		else this.tokenConsumer = new SubhutiTokenConsumer(this);
	}
	/**
	* 获取已解析的 token 列表
	*/
	get parsedTokens() {
		return this._parsedTokens;
	}
	/**
	* 获取最后解析的 token 索引
	* @returns token 索引，如果没有已解析的 token 则返回 -1
	*/
	get lastTokenIndex() {
		return this._parsedTokens.length - 1;
	}
	/**
	* 获取当前正在处理的 token 索引（下一个将被 consume 的 token）
	* @returns 当前 token 索引
	*/
	get currentTokenIndex() {
		return this._parsedTokens.length;
	}
	/**
	* 获取或解析指定位置和模式的 token
	*
	* @param codeIndex 源码位置
	* @param line 行号
	* @param column 列号
	* @param goal 词法目标
	* @returns TokenCacheEntry 或 null（EOF）
	*/
	_getOrParseToken(codeIndex, line, column, goal) {
		if (!this._lexer) return null;
		const positionCache = this._tokenCache.get(codeIndex);
		if (positionCache?.has(goal)) return positionCache.get(goal);
		const entry = this._lexer.readTokenAt(this._sourceCode, codeIndex, line, column, goal, this._lastTokenName, this._templateDepth);
		if (!entry) return null;
		if (!positionCache) this._tokenCache.set(codeIndex, /* @__PURE__ */ new Map());
		this._tokenCache.get(codeIndex).set(goal, entry);
		return entry;
	}
	/**
	* LA (LookAhead) - 前瞻获取 token（支持模式数组）
	*
	* @param offset 偏移量（1 = 当前 token，2 = 下一个...）
	* @param goals 每个位置的词法目标（可选，不传用默认值）
	* @returns token 或 undefined（EOF）
	*/
	LA(offset = 1, goals) {
		let currentIndex = this._codeIndex;
		let currentLine = this._codeLine;
		let currentColumn = this._codeColumn;
		for (let i = 0; i < offset; i++) {
			const goal = goals?.[i] ?? this._defaultGoal;
			const entry = this._getOrParseToken(currentIndex, currentLine, currentColumn, goal);
			if (!entry) return void 0;
			if (i === offset - 1) return entry.token;
			currentIndex = entry.nextCodeIndex;
			currentLine = entry.nextLine;
			currentColumn = entry.nextColumn;
		}
	}
	/**
	* peek - 前瞻获取 token（支持模式数组）
	*/
	peek(offset = 1, goals) {
		return this.LA(offset, goals);
	}
	/**
	* 获取当前 token（使用默认词法目标）
	*/
	get curToken() {
		return this.LA(1);
	}
	/**
	* 供 TokenConsumer 使用的 consume 方法
	* @param tokenName token 名称
	* @param goal 可选的词法目标（用于模板尾部等场景）
	*/
	_consumeToken(tokenName, goal) {
		return this.consume(tokenName, goal);
	}
	/**
	* 供 TokenConsumer 使用的标记解析失败方法
	* 用于软关键字检查失败时标记解析失败
	*/
	_markParseFail() {
		this._parseSuccess = false;
	}
	get curCst() {
		return this.cstStack[this.cstStack.length - 1];
	}
	cache(enable = true) {
		this.enableMemoization = enable;
		return this;
	}
	/**
	* 启用调试模式
	* @param showRulePath - 是否显示规则执行路径（默认 true）
	*                       传入 false 时只显示性能统计和 CST 验证报告
	*/
	debug(showRulePath = true) {
		setShowRulePath(showRulePath);
		this._debugger = new SubhutiTraceDebugger(this._parsedTokens);
		return this;
	}
	errorHandler(enable = true) {
		this._errorHandler.setDetailed(enable);
		return this;
	}
	/**
	* 启用分析模式（用于语法验证，不抛异常）
	*
	* 在分析模式下：
	* - 不抛出左递归异常
	* - 不抛出无限循环异常
	* - 不抛出 Token 消费失败异常
	* - 不抛出 EOF 检测异常
	*
	* @internal 仅供 SubhutiRuleCollector 使用
	*/
	enableAnalysisMode() {
		this._analysisMode = true;
	}
	/**
	* 禁用分析模式（恢复正常模式）
	*
	* @internal 仅供 SubhutiRuleCollector 使用
	*/
	disableAnalysisMode() {
		this._analysisMode = false;
	}
	/**
	* 启用语法验证（链式调用），验证语法（检测 Or 规则冲突）
	*
	* 用法：
	* ```typescript
	* const parser = new Es2025Parser(tokens).validate()
	* const cst = parser.Script()
	* ```
	*
	* @returns this - 支持链式调用
	* @throws SubhutiGrammarValidationError - 语法有冲突时抛出
	*/
	validate() {
		SubhutiGrammarValidator.validate(this);
		return this;
	}
	/**
	* 检测是否是直接或间接左递归
	*
	* ✅ 这个方法可以准确判断左递归
	* ❌ 不能判断是否是 Or 分支遮蔽（返回 false 只表示不是左递归）
	*
	* @param ruleName 当前规则名称
	* @param ruleStack 规则调用栈
	* @returns true: 确定是左递归, false: 不是左递归（但不能确定是什么问题）
	*/
	isDirectLeftRecursion(ruleName, ruleStack) {
		const ruleCounts = /* @__PURE__ */ new Map();
		for (const rule of ruleStack) ruleCounts.set(rule, (ruleCounts.get(rule) || 0) + 1);
		for (const count of ruleCounts.values()) if (count >= 2) return true;
		return false;
	}
	/**
	* 抛出循环错误信息
	*
	* @param ruleName 当前规则名称
	*/
	throwLoopError(ruleName) {
		if (this._analysisMode) {
			this._parseSuccess = false;
			return;
		}
		const currentToken = this.curToken;
		const tokenContext = this.getTokenContext(2);
		const cacheStatsReport = this._cache.getStatsReport();
		const ruleStack = this.getRuleStack();
		const errorType = this.isDirectLeftRecursion(ruleName, ruleStack) ? "left-recursion" : "or-branch-shadowing";
		throw this._errorHandler.createError({
			type: errorType,
			expected: "",
			found: currentToken,
			position: {
				tokenIndex: this.currentTokenIndex,
				codeIndex: this._codeIndex,
				line: currentToken?.rowNum || this._codeLine,
				column: currentToken?.columnStartNum || this._codeColumn
			},
			ruleStack: [...ruleStack],
			loopRuleName: ruleName,
			loopDetectionSet: Array.from(this.loopDetectionSet),
			loopCstDepth: this.cstStack.length,
			loopCacheStats: {
				hits: cacheStatsReport.hits,
				misses: cacheStatsReport.misses,
				hitRate: cacheStatsReport.hitRate,
				currentSize: cacheStatsReport.currentSize
			},
			loopTokenContext: tokenContext,
			hint: "检查规则定义，确保在递归前消费了 token"
		});
	}
	/**
	* 规则执行入口（由 @SubhutiRule 装饰器调用）
	* 职责：前置检查 → 循环检测 → Packrat 缓存 → 核心执行 → 后置处理
	*/
	executeRuleWrapper(targetFun, ruleName, className, ...args) {
		if (this.checkRuleIsThisClass(ruleName, className)) return;
		const isTopLevel = this.cstStack.length === 0;
		if (isTopLevel) this.initTopLevelData();
		if (this.parserFail) return;
		const tokenIndex = this.currentTokenIndex;
		const key = `${ruleName}:${tokenIndex}`;
		if (this.loopDetectionSet.has(key)) this.throwLoopError(ruleName);
		this.loopDetectionSet.add(key);
		try {
			const startTime = this._debugger?.onRuleEnter(ruleName, tokenIndex);
			if (this.enableMemoization) {
				const cached = this._cache.get(ruleName, tokenIndex);
				if (cached !== void 0) {
					this._debugger?.onRuleExit(ruleName, true, startTime);
					if (this.errorRecoveryMode && cached.endTokenIndex > tokenIndex) {
						const recordNode$1 = {
							name: ruleName,
							startTokenIndex: tokenIndex,
							endTokenIndex: cached.endTokenIndex,
							children: cached.recordNode?.children ? [...cached.recordNode.children] : []
						};
						const recordParent = this._parseRecordStack[this._parseRecordStack.length - 1];
						if (recordParent) recordParent.children.push(recordNode$1);
						for (let i = this._parseRecordStack.length - 1; i >= 0; i--) {
							const ancestor = this._parseRecordStack[i];
							if (cached.endTokenIndex > ancestor.endTokenIndex) ancestor.endTokenIndex = cached.endTokenIndex;
						}
					}
					const cst$1 = this.applyCachedResult(cached);
					if (!cst$1.children?.length) cst$1.children = void 0;
					return cst$1;
				}
			}
			const startTokenIndex = tokenIndex;
			let recordNode = null;
			if (this.errorRecoveryMode) {
				recordNode = {
					name: ruleName,
					children: [],
					startTokenIndex: tokenIndex,
					endTokenIndex: tokenIndex
				};
				this._parseRecordStack.push(recordNode);
			}
			const cst = this.executeRuleCore(ruleName, targetFun, ...args);
			if (this.errorRecoveryMode && recordNode) {
				this._parseRecordStack.pop();
				if (recordNode.endTokenIndex > recordNode.startTokenIndex) {
					const recordParent = this._parseRecordStack[this._parseRecordStack.length - 1];
					if (recordParent) recordParent.children.push(recordNode);
				}
			}
			if (this.enableMemoization) {
				const endTokenIndex = this.currentTokenIndex;
				const finalEndIndex = recordNode ? Math.max(recordNode.endTokenIndex, endTokenIndex) : endTokenIndex;
				const consumedTokens = this._parseSuccess ? this._parsedTokens.slice(startTokenIndex) : void 0;
				this._cache.set(ruleName, startTokenIndex, {
					endTokenIndex: finalEndIndex,
					cst,
					parseSuccess: this._parseSuccess,
					recordNode,
					parsedTokens: consumedTokens
				});
			}
			this.onRuleExitDebugHandler(ruleName, cst, isTopLevel, startTime);
			if (isTopLevel && this._parseSuccess) {
				if (!this.isEof) {
					const nextToken = this.LA(1);
					throw new Error(`Parser internal error: parsing succeeded but source code remains unconsumed. Next token: "${nextToken?.tokenValue}" (${nextToken?.tokenName}) at position ${this._codeIndex}`);
				}
			}
			if (isTopLevel && this.parserFail) this.handleTopLevelError(ruleName, startTokenIndex);
			if (!cst.children?.length) cst.children = void 0;
			return cst;
		} finally {
			this.loopDetectionSet.delete(key);
		}
	}
	initTopLevelData() {
		this._parseSuccess = true;
		this.cstStack.length = 0;
		this.loopDetectionSet.clear();
		this._codeIndex = 0;
		this._codeLine = 1;
		this._codeColumn = 1;
		this._parsedTokens = [];
		this._tokenCache.clear();
		this._debugger?.resetForNewParse?.(this._parsedTokens);
	}
	checkRuleIsThisClass(ruleName, className) {
		if (this.hasOwnProperty(ruleName)) {
			if (className !== this.className) return true;
		}
	}
	onRuleExitDebugHandler(ruleName, cst, isTopLevel, startTime) {
		if (cst && !cst.children?.length) cst.children = void 0;
		if (!isTopLevel) this._debugger?.onRuleExit(ruleName, false, startTime);
		else if (this._debugger) {
			if ("setCst" in this._debugger) this._debugger.setCst(cst);
			this._debugger?.autoOutput?.();
		}
	}
	/**
	* 执行规则函数核心逻辑
	* 职责：创建 CST → 执行规则 → 成功则添加到父节点
	*/
	executeRuleCore(ruleName, targetFun, ...args) {
		const cst = new SubhutiCst();
		cst.name = ruleName;
		cst.children = [];
		this.cstStack.push(cst);
		targetFun.apply(this, args);
		this.cstStack.pop();
		if (this._parseSuccess) {
			const parentCst = this.cstStack[this.cstStack.length - 1];
			if (parentCst) parentCst.children.push(cst);
			this.setLocation(cst);
		}
		return cst;
	}
	setLocation(cst) {
		if (cst.children && cst.children[0]?.loc) {
			const lastChild = cst.children[cst.children.length - 1];
			cst.loc = {
				type: cst.name,
				start: cst.children[0].loc.start,
				end: lastChild?.loc?.end || cst.children[0].loc.end
			};
		}
	}
	/**
	* Or 规则 - 顺序选择（PEG 风格）
	*
	* 核心逻辑：
	* - 依次尝试每个分支，第一个成功的分支生效
	* - 所有分支都失败则整体失败
	*
	* 优化：只有消费了 token 才需要回溯（没消费 = 状态没变）
	*/
	Or(alternatives) {
		if (this.parserFail) return;
		const savedState = this.saveState();
		const startCodeIndex = this._codeIndex;
		const totalCount = alternatives.length;
		const parentRuleName = this.curCst?.name || "Unknown";
		this._debugger?.onOrEnter?.(parentRuleName, startCodeIndex);
		for (let i = 0; i < totalCount; i++) {
			const alt = alternatives[i];
			const isLast = i === totalCount - 1;
			this._debugger?.onOrBranch?.(i, totalCount, parentRuleName);
			alt.alt();
			this._debugger?.onOrBranchExit?.(parentRuleName, i);
			if (this._parseSuccess) {
				this._debugger?.onOrExit?.(parentRuleName);
				return;
			}
			if (!isLast) {
				this.recordPartialMatchAndRestore(savedState, startCodeIndex);
				this._parseSuccess = true;
			}
		}
		this._debugger?.onOrExit?.(parentRuleName);
	}
	/**
	* Many 规则 - 0次或多次（EBNF { ... }）
	*
	* 循环执行直到失败或没消费 token
	*/
	Many(fn) {
		while (this.tryAndRestore(fn));
	}
	/**
	* 带容错的 Many 规则（使用解析记录树）
	* - 当全局 errorRecoveryMode 开启时，解析失败会尝试恢复并继续
	* - 使用解析记录树记录所有解析尝试，只增不删
	* - 失败时从解析记录树提取最优路径恢复 CST
	* @param fn 要执行的规则函数
	*/
	ManyWithRecovery(fn) {
		if (!this.errorRecoveryMode) throw new Error("非容错模式不应该进入 ManyWithRecovery");
		this._unparsedTokens.length = 0;
		while (!this.parserFailOrIsEof) {
			const startTokenIndex = this.currentTokenIndex;
			this._parseRecordRoot = {
				name: "__ParseRecordRoot__",
				children: [],
				startTokenIndex,
				endTokenIndex: startTokenIndex
			};
			this._parseRecordStack = [this._parseRecordRoot];
			if (this.tryAndRestore(fn)) {
				this._parseRecordRoot = null;
				this._parseRecordStack = [];
				continue;
			}
			const syncIndex = this.findNextSyncPoint(this._codeIndex + 1);
			const recoveredCST = this.recoverFromParseRecord(this._parseRecordRoot, syncIndex);
			if (recoveredCST && recoveredCST.children && recoveredCST.children.length > 0) {
				const currentCst = this.curCst;
				if (currentCst) currentCst.children.push(...recoveredCST.children);
				const maxTokenIndex = this.getParseRecordMaxEndIndex(this._parseRecordRoot, syncIndex);
				if (maxTokenIndex > 0 && maxTokenIndex <= this._parsedTokens.length) {
					const lastToken = this._parsedTokens[maxTokenIndex - 1];
					this._codeIndex = lastToken.index + lastToken.tokenValue.length;
				}
			} else this._codeIndex++;
			this._parseRecordRoot = null;
			this._parseRecordStack = [];
			this._parseSuccess = true;
		}
		if (this._unparsedTokens.length > 0) this._parseSuccess = false;
	}
	/**
	* 从解析记录树恢复 CST
	* 找到 endTokenIndex <= maxIndex 的最深路径，转换为 CST
	*/
	recoverFromParseRecord(root, maxIndex) {
		if (!root || root.children.length === 0) return null;
		const cst = new SubhutiCst();
		cst.name = root.name;
		cst.children = this.parseRecordChildrenToCST(root.children, maxIndex);
		if (!cst.children || cst.children.length === 0) return null;
		return cst;
	}
	/**
	* 将解析记录树子节点转换为 CST 子节点
	*
	* 选择策略：
	* 1. 按 startTokenIndex 分组（同一位置开始的是 Or 的不同分支）
	* 2. 对于每组，选择 endTokenIndex <= maxIndex 且最大的
	* 3. 如果有多个相同深度的，选择最后一个
	*/
	parseRecordChildrenToCST(nodes, maxIndex) {
		const groups = /* @__PURE__ */ new Map();
		for (const node$1 of nodes) {
			if (node$1.endTokenIndex > maxIndex) continue;
			const key = node$1.startTokenIndex;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(node$1);
		}
		const selectedNodes = [];
		for (const [startIdx, group] of groups) {
			let best = null;
			for (const node$1 of group) if (!best || node$1.endTokenIndex >= best.endTokenIndex) best = node$1;
			if (best) selectedNodes.push(best);
		}
		selectedNodes.sort((a, b) => a.startTokenIndex - b.startTokenIndex);
		return selectedNodes.map((node$1) => this.parseRecordNodeToCST(node$1, maxIndex));
	}
	/**
	* 将单个解析记录节点转换为 CST 节点
	*/
	parseRecordNodeToCST(node$1, maxIndex) {
		const cst = new SubhutiCst();
		cst.name = node$1.name;
		if (node$1.token) {
			cst.value = node$1.value;
			cst.loc = {
				type: node$1.token.tokenName,
				value: node$1.token.tokenValue,
				start: {
					index: node$1.token.index || 0,
					line: node$1.token.rowNum || 0,
					column: node$1.token.columnStartNum || 0
				},
				end: {
					index: (node$1.token.index || 0) + node$1.token.tokenValue.length,
					line: node$1.token.rowNum || 0,
					column: node$1.token.columnEndNum || 0
				}
			};
		}
		if (node$1.children.length > 0) {
			cst.children = this.parseRecordChildrenToCST(node$1.children, maxIndex);
			if (cst.children.length === 0) cst.children = void 0;
			else this.setLocation(cst);
		}
		return cst;
	}
	/**
	* 获取解析记录树中 <= maxIndex 的最大 endTokenIndex
	*/
	getParseRecordMaxEndIndex(root, maxIndex) {
		let maxEnd = root.endTokenIndex <= maxIndex ? root.endTokenIndex : 0;
		for (const child of root.children) {
			const childMax = this.getParseRecordMaxEndIndex(child, maxIndex);
			if (childMax > maxEnd) maxEnd = childMax;
		}
		return maxEnd;
	}
	/**
	* 找到下一个同步点（语句开始 token）
	* @param fromIndex 从哪个源码位置开始查找
	* @returns 同步点的源码位置，如果没找到返回源码末尾
	*/
	findNextSyncPoint(fromIndex) {
		for (let i = fromIndex; i < this._sourceCode.length; i++) {
			const entry = this._getOrParseToken(i, this._codeLine, this._codeColumn, this._defaultGoal);
			if (entry && this._syncTokens.has(entry.token.tokenName)) return i;
		}
		return this._sourceCode.length;
	}
	/**
	* 创建 ErrorNode，包含指定范围内的 token
	* @param startIndex 起始源码位置（包含）
	* @param endIndex 结束源码位置（不包含）
	* @returns ErrorNode CST 节点
	*/
	createErrorNode(startIndex, endIndex) {
		const errorNode = new SubhutiCst();
		errorNode.name = "ErrorNode";
		errorNode.children = [];
		for (const token of this._parsedTokens) if (token.index >= startIndex && token.index < endIndex) {
			const tokenNode = new SubhutiCst();
			tokenNode.name = token.tokenName;
			tokenNode.value = token.tokenValue;
			tokenNode.loc = {
				type: token.tokenName,
				value: token.tokenValue,
				start: {
					index: token.index,
					line: token.rowNum,
					column: token.columnStartNum
				},
				end: {
					index: token.index + (token.tokenValue?.length || 0),
					line: token.rowNum,
					column: token.columnEndNum
				}
			};
			errorNode.children.push(tokenNode);
		}
		if (errorNode.children.length > 0) {
			const first = errorNode.children[0];
			const last = errorNode.children[errorNode.children.length - 1];
			errorNode.loc = {
				type: "ErrorNode",
				start: first.loc.start,
				end: last.loc.end
			};
		}
		return errorNode;
	}
	/**
	* Option 规则 - 0次或1次（EBNF [ ... ]）
	*
	* 尝试执行一次，失败则回溯，不影响整体解析状态
	*/
	Option(fn) {
		this.tryAndRestore(fn);
	}
	/**
	* AtLeastOne 规则 - 1次或多次
	*
	* 第一次必须成功，后续循环执行直到失败
	*/
	AtLeastOne(fn) {
		if (this.parserFail) return;
		fn();
		while (this.tryAndRestore(fn));
	}
	/**
	* 顶层规则失败时的错误处理
	*
	* @param ruleName 规则名
	* @param startIndex 规则开始时的源码位置
	*/
	handleTopLevelError(ruleName, startIndex) {
		if (this._analysisMode) return;
		const noTokenConsumed = this.currentTokenIndex === startIndex;
		const found = this.curToken;
		throw this._errorHandler.createError({
			type: "parsing",
			expected: noTokenConsumed ? "valid syntax" : "EOF (end of file)",
			found,
			position: {
				tokenIndex: this.currentTokenIndex,
				codeIndex: this._codeIndex,
				line: found?.rowNum ?? this._codeLine,
				column: found?.columnStartNum ?? this._codeColumn
			},
			ruleStack: this.getRuleStack().length > 0 ? this.getRuleStack() : [ruleName]
		});
	}
	get parserFailOrIsEof() {
		return this.parserFail || this.isEof;
	}
	/**
	* 消费 token（智能错误管理）
	* - 失败时返回 undefined，不抛异常
	* - 支持传入词法目标（可选）
	*/
	consume(tokenName, goal) {
		if (this.parserFail) return;
		if (this.isEof) {
			this._parseSuccess = false;
			return;
		}
		const actualGoal = goal ?? this._defaultGoal;
		const entry = this._getOrParseToken(this._codeIndex, this._codeLine, this._codeColumn, actualGoal);
		if (!entry) {
			this._parseSuccess = false;
			return;
		}
		const token = entry.token;
		if (token.tokenName !== tokenName) {
			this._parseSuccess = false;
			this._debugger?.onTokenConsume(this._codeIndex, token.tokenValue, token.tokenName, tokenName, false);
			return;
		}
		this._debugger?.onTokenConsume(this._codeIndex, token.tokenValue, token.tokenName, tokenName, true);
		const cst = this.generateCstByToken(token);
		if (token.tokenName === "TemplateHead") this._templateDepth++;
		else if (token.tokenName === "TemplateTail") this._templateDepth--;
		this._codeIndex = entry.nextCodeIndex;
		this._codeLine = entry.nextLine;
		this._codeColumn = entry.nextColumn;
		this._lastTokenName = entry.lastTokenName;
		this._parsedTokens.push(token);
		return cst;
	}
	generateCstByToken(token) {
		const cst = new SubhutiCst();
		cst.name = token.tokenName;
		cst.value = token.tokenValue;
		cst.loc = {
			type: token.tokenName,
			value: token.tokenValue,
			start: {
				index: token.index || 0,
				line: token.rowNum || 0,
				column: token.columnStartNum || 0
			},
			end: {
				index: (token.index || 0) + token.tokenValue.length,
				line: token.rowNum || 0,
				column: token.columnEndNum || 0
			}
		};
		const currentCst = this.curCst;
		if (currentCst) currentCst.children.push(cst);
		if (this.errorRecoveryMode) {
			const newEndIndex = this.currentTokenIndex;
			const tokenNode = {
				name: token.tokenName,
				children: [],
				startTokenIndex: this.lastTokenIndex,
				endTokenIndex: newEndIndex,
				token,
				value: token.tokenValue
			};
			const recordCurrent = this._parseRecordStack[this._parseRecordStack.length - 1];
			if (recordCurrent) recordCurrent.children.push(tokenNode);
			for (const ancestor of this._parseRecordStack) ancestor.endTokenIndex = newEndIndex;
		}
		return cst;
	}
	saveState() {
		const currentCst = this.curCst;
		return {
			codeIndex: this._codeIndex,
			codeLine: this._codeLine,
			codeColumn: this._codeColumn,
			lastTokenName: this._lastTokenName,
			curCstChildrenLength: currentCst?.children?.length || 0,
			parsedTokensLength: this._parsedTokens.length
		};
	}
	restoreState(backData) {
		const fromIndex = this._codeIndex;
		const toIndex = backData.codeIndex;
		if (fromIndex !== toIndex) this._debugger?.onBacktrack?.(fromIndex, toIndex);
		this._codeIndex = backData.codeIndex;
		this._codeLine = backData.codeLine;
		this._codeColumn = backData.codeColumn;
		this._lastTokenName = backData.lastTokenName;
		this._parsedTokens.length = backData.parsedTokensLength;
		const currentCst = this.curCst;
		if (currentCst) currentCst.children.length = backData.curCstChildrenLength;
	}
	/**
	* 【容错模式】记录部分匹配并回溯
	* - 解析记录树方案中，部分匹配由 _parseRecordRoot 记录
	* - 这里只需要回溯 CST（解析记录树是只增不删的）
	*
	* @param savedState 保存的状态
	* @param startCodeIndex 起始源码位置
	*/
	recordPartialMatchAndRestore(savedState, startCodeIndex) {
		this.restoreState(savedState);
	}
	/**
	* 检查是否已到达源码末尾
	*/
	get isEof() {
		return this._getOrParseToken(this._codeIndex, this._codeLine, this._codeColumn, this._defaultGoal) === null;
	}
	/**
	* 尝试执行函数，失败时自动回溯并重置状态
	*
	* @param fn 要执行的函数
	* @returns true: 成功且消费了 token，false: 失败或没消费 token
	*/
	tryAndRestore(fn) {
		if (this.parserFailOrIsEof) return false;
		const savedState = this.saveState();
		const startIndex = this._codeIndex;
		fn();
		if (this.parserFail) {
			this.recordPartialMatchAndRestore(savedState, startIndex);
			this._parseSuccess = true;
			return false;
		}
		return this._codeIndex !== startIndex;
	}
	/**
	* 应用缓存结果（恢复状态）
	*/
	applyCachedResult(cached) {
		if (cached.parsedTokens && cached.parsedTokens.length > 0) {
			this._parsedTokens.push(...cached.parsedTokens);
			const lastToken = cached.parsedTokens[cached.parsedTokens.length - 1];
			this._codeIndex = lastToken.index + lastToken.tokenValue.length;
			this._codeLine = lastToken.rowNum;
			this._codeColumn = lastToken.columnEndNum;
			this._lastTokenName = lastToken.tokenName;
		}
		this._parseSuccess = cached.parseSuccess;
		if (cached.parseSuccess) {
			const parentCst = this.cstStack[this.cstStack.length - 1];
			if (parentCst) parentCst.children.push(cached.cst);
		}
		return cached.cst;
	}
	/**
	* 获取 token 上下文（从 parsedTokens 获取最近的 N 个 token）
	*
	* @param contextSize - 上下文大小（默认 2）
	* @returns token 上下文数组
	*/
	getTokenContext(contextSize = 2) {
		const tokens = this._parsedTokens;
		const len = tokens.length;
		const start = Math.max(0, len - contextSize);
		return tokens.slice(start);
	}
	/**
	* 生成当前规则路径的字符串（用于错误信息）
	*
	* @returns 格式化后的规则路径字符串数组
	*/
	formatCurrentRulePath() {
		if (!this._debugger) return this.formatSimpleRulePath();
		const ruleStack = this._debugger.ruleStack;
		if (!ruleStack || ruleStack.length === 0) return ["  (empty)"];
		return SubhutiDebugRuleTracePrint.formatPendingOutputs_NonCache_Impl(ruleStack);
	}
	/**
	* 简单格式化规则路径（当没有调试器时）
	*/
	formatSimpleRulePath() {
		const ruleStack = this.getRuleStack();
		if (ruleStack.length === 0) return ["  (empty)"];
		const lines = [];
		for (let i = 0; i < ruleStack.length; i++) {
			const rule = ruleStack[i];
			const isLast = i === ruleStack.length - 1;
			const indent = "  ".repeat(i);
			const connector = i === 0 ? "" : "└─ ";
			const marker = isLast ? " ← 当前位置" : "";
			lines.push(`  ${indent}${connector}${rule}${marker}`);
		}
		return lines;
	}
	/**
	* 创建无限循环错误
	*
	* @param ruleName - 规则名称
	* @param hint - 修复提示
	* @returns ParsingError 实例（分析模式下返回 null）
	*/
	createInfiniteLoopError(ruleName, hint) {
		if (this._analysisMode) {
			this._parseSuccess = false;
			return null;
		}
		const rulePath = this.formatCurrentRulePath().join("\n");
		const ruleStack = this.getRuleStack();
		const errorType = this.isDirectLeftRecursion(ruleName, ruleStack) ? "left-recursion" : "infinite-loop";
		return this._errorHandler.createError({
			type: errorType,
			expected: "",
			found: this.curToken,
			position: {
				tokenIndex: this.currentTokenIndex,
				codeIndex: this._codeIndex,
				line: this.curToken?.rowNum || this._codeLine,
				column: this.curToken?.columnStartNum || this._codeColumn
			},
			ruleStack: [...ruleStack],
			loopRuleName: ruleName,
			loopDetectionSet: [],
			loopCstDepth: this.cstStack.length,
			loopTokenContext: this.getTokenContext(2),
			hint,
			rulePath
		});
	}
};

//#endregion
//#region ../../slime/packages/slime-parser/src/language/es2025/SlimeTokenConsumer.ts
/**
* ES2025 Token Consumer - Token 消费封装
*
* 职责：
* 1. 为每个 ES2025 token 提供类型安全的消费方法
* 2. 提供语义化的 API（方法名即文档）
* 3. 支持 IDE 自动补全和编译时检查
*
* 设计模式：
* - 继承 SubhutiTokenConsumer（基于接口依赖）
* - 为每个 TokenNames 提供对应的消费方法
* - 方法名与 token 名一致，易于理解
*
* @version 1.0.0
*/
var SlimeTokenConsumer = class extends SubhutiTokenConsumer {
	/**
	* 消费一个 IdentifierName 并检查其值是否匹配
	*
	* 用于软关键字（如 get, set, of, target, meta, from）
	* 按照 ES2025 规范，这些在词法层是 IdentifierName，
	* 在语法层通过值检查来识别
	*
	* @param value 期望的标识符值
	* @returns CST 节点或 undefined
	*/
	consumeIdentifierValue(value) {
		const token = this.parser.curToken;
		if (token?.tokenName === SlimeTokenType.IdentifierName && token.tokenValue === value) return this.consume(SlimeTokenType.IdentifierName);
		this.parser._markParseFail();
	}
	Await() {
		return this.consume(SlimeReservedWordTokenTypes$1.Await);
	}
	Break() {
		return this.consume(SlimeReservedWordTokenTypes$1.Break);
	}
	Case() {
		return this.consume(SlimeReservedWordTokenTypes$1.Case);
	}
	Catch() {
		return this.consume(SlimeReservedWordTokenTypes$1.Catch);
	}
	Class() {
		return this.consume(SlimeReservedWordTokenTypes$1.Class);
	}
	Const() {
		return this.consume(SlimeReservedWordTokenTypes$1.Const);
	}
	Continue() {
		return this.consume(SlimeReservedWordTokenTypes$1.Continue);
	}
	Debugger() {
		return this.consume(SlimeReservedWordTokenTypes$1.Debugger);
	}
	Default() {
		return this.consume(SlimeReservedWordTokenTypes$1.Default);
	}
	Do() {
		return this.consume(SlimeReservedWordTokenTypes$1.Do);
	}
	Else() {
		return this.consume(SlimeReservedWordTokenTypes$1.Else);
	}
	Enum() {
		return this.consume(SlimeReservedWordTokenTypes$1.Enum);
	}
	Export() {
		return this.consume(SlimeReservedWordTokenTypes$1.Export);
	}
	Extends() {
		return this.consume(SlimeReservedWordTokenTypes$1.Extends);
	}
	False() {
		return this.consume(SlimeReservedWordTokenTypes$1.False);
	}
	Finally() {
		return this.consume(SlimeReservedWordTokenTypes$1.Finally);
	}
	For() {
		return this.consume(SlimeReservedWordTokenTypes$1.For);
	}
	Function() {
		return this.consume(SlimeReservedWordTokenTypes$1.Function);
	}
	If() {
		return this.consume(SlimeReservedWordTokenTypes$1.If);
	}
	Import() {
		return this.consume(SlimeReservedWordTokenTypes$1.Import);
	}
	New() {
		return this.consume(SlimeReservedWordTokenTypes$1.New);
	}
	/**
	* NullLiteral
	* 规范 A.1: NullLiteral :: null
	*/
	NullLiteral() {
		return this.consume(SlimeReservedWordTokenTypes$1.NullLiteral);
	}
	Return() {
		return this.consume(SlimeReservedWordTokenTypes$1.Return);
	}
	Super() {
		return this.consume(SlimeReservedWordTokenTypes$1.Super);
	}
	Switch() {
		return this.consume(SlimeReservedWordTokenTypes$1.Switch);
	}
	This() {
		return this.consume(SlimeReservedWordTokenTypes$1.This);
	}
	Throw() {
		return this.consume(SlimeReservedWordTokenTypes$1.Throw);
	}
	True() {
		return this.consume(SlimeReservedWordTokenTypes$1.True);
	}
	Try() {
		return this.consume(SlimeReservedWordTokenTypes$1.Try);
	}
	Var() {
		return this.consume(SlimeReservedWordTokenTypes$1.Var);
	}
	While() {
		return this.consume(SlimeReservedWordTokenTypes$1.While);
	}
	With() {
		return this.consume(SlimeReservedWordTokenTypes$1.With);
	}
	Yield() {
		return this.consume(SlimeReservedWordTokenTypes$1.Yield);
	}
	/**
	* 消费 'let' 软关键字
	* 用于 let 声明
	* 注意：let 在非严格模式下可作为标识符，因此作为软关键字处理
	*/
	Let() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Let);
	}
	Void() {
		return this.consume(SlimeUnaryOperatorTokenTypes.Void);
	}
	Typeof() {
		return this.consume(SlimeUnaryOperatorTokenTypes.Typeof);
	}
	In() {
		return this.consume(SlimeBinaryOperatorTokenTypes.In);
	}
	Instanceof() {
		return this.consume(SlimeBinaryOperatorTokenTypes.Instanceof);
	}
	Delete() {
		return this.consume(SlimeUnaryOperatorTokenTypes.Delete);
	}
	/**
	* 消费 'async' 软关键字
	* 用于 async 函数、async 箭头函数、async 方法
	* 注意：async 可作为标识符使用，如 `let async = 1`
	*/
	Async() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Async);
	}
	/**
	* 消费 'static' 软关键字
	* 用于类的静态成员
	* 注意：非严格模式下可作为标识符
	*/
	Static() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Static);
	}
	/**
	* 消费 'as' 软关键字
	* 用于 import/export 的重命名
	*/
	As() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.As);
	}
	/**
	* 消费 'get' 软关键字
	* 用于 getter 方法定义
	*/
	Get() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Get);
	}
	/**
	* 消费 'set' 软关键字
	* 用于 setter 方法定义
	*/
	Set() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Set);
	}
	/**
	* 消费 'of' 软关键字
	* 用于 for-of 语句
	*/
	Of() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Of);
	}
	/**
	* 消费 'target' 软关键字
	* 用于 new.target
	*/
	Target() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Target);
	}
	/**
	* 消费 'meta' 软关键字
	* 用于 import.meta
	*/
	Meta() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.Meta);
	}
	/**
	* 消费 'from' 软关键字
	* 用于 import/export 语句
	*/
	From() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes$1.From);
	}
	/**
	* NumericLiteral
	* 规范中 NumericLiteral 包含所有数字变体：
	* - DecimalLiteral (如 123, 1.5, .5, 1e10)
	* - DecimalBigIntegerLiteral (如 123n)
	* - NonDecimalIntegerLiteral (如 0xFF, 0b11, 0o77)
	* - NonDecimalIntegerLiteral BigIntLiteralSuffix (如 0xFFn, 0b11n, 0o77n)
	* - LegacyOctalIntegerLiteral (如 077, Annex B)
	*/
	NumericLiteral() {
		return this.consume(SlimeTokenType.NumericLiteral);
	}
	StringLiteral() {
		return this.consume(SlimeTokenType.StringLiteral);
	}
	NoSubstitutionTemplate() {
		return this.consume(SlimeTokenType.NoSubstitutionTemplate);
	}
	TemplateHead() {
		return this.consume(SlimeTokenType.TemplateHead);
	}
	/**
	* 消费 TemplateMiddle token (}...${)
	* 使用 InputElementTemplateTail 词法目标，确保 } 被识别为模板部分而非 RBrace
	*/
	TemplateMiddle() {
		return this.consume(SlimeTokenType.TemplateMiddle, LexicalGoal.InputElementTemplateTail);
	}
	/**
	* 消费 TemplateTail token (}...`)
	* 使用 InputElementTemplateTail 词法目标，确保 } 被识别为模板部分而非 RBrace
	*/
	TemplateTail() {
		return this.consume(SlimeTokenType.TemplateTail, LexicalGoal.InputElementTemplateTail);
	}
	RegularExpressionLiteral() {
		return this.consume(SlimeTokenType.RegularExpressionLiteral);
	}
	/**
	* Hashbang 注释 (#!...)
	* 只能出现在文件开头，由 Parser 的 Program 规则显式调用
	*/
	HashbangComment() {
		return this.consume(SlimeTokenType.HashbangComment);
	}
	/**
	* IdentifierName
	* 规范: IdentifierName :: IdentifierStart | IdentifierName IdentifierPart
	*/
	IdentifierName() {
		return this.consume(SlimeTokenType.IdentifierName);
	}
	/**
	* PrivateIdentifier
	* 规范: PrivateIdentifier :: # IdentifierName
	*/
	PrivateIdentifier() {
		return this.consume(SlimeTokenType.PrivateIdentifier);
	}
	UnsignedRightShiftAssign() {
		return this.consume(SlimeTokenType.UnsignedRightShiftAssign);
	}
	Ellipsis() {
		return this.consume(SlimeTokenType.Ellipsis);
	}
	UnsignedRightShift() {
		return this.consume(SlimeTokenType.UnsignedRightShift);
	}
	StrictEqual() {
		return this.consume(SlimeTokenType.StrictEqual);
	}
	StrictNotEqual() {
		return this.consume(SlimeTokenType.StrictNotEqual);
	}
	LeftShiftAssign() {
		return this.consume(SlimeTokenType.LeftShiftAssign);
	}
	RightShiftAssign() {
		return this.consume(SlimeTokenType.RightShiftAssign);
	}
	ExponentiationAssign() {
		return this.consume(SlimeTokenType.ExponentiationAssign);
	}
	LogicalAndAssign() {
		return this.consume(SlimeTokenType.LogicalAndAssign);
	}
	LogicalOrAssign() {
		return this.consume(SlimeTokenType.LogicalOrAssign);
	}
	NullishCoalescingAssign() {
		return this.consume(SlimeTokenType.NullishCoalescingAssign);
	}
	Arrow() {
		return this.consume(SlimeTokenType.Arrow);
	}
	PlusAssign() {
		return this.consume(SlimeTokenType.PlusAssign);
	}
	MinusAssign() {
		return this.consume(SlimeTokenType.MinusAssign);
	}
	MultiplyAssign() {
		return this.consume(SlimeTokenType.MultiplyAssign);
	}
	DivideAssign() {
		return this.consume(SlimeTokenType.DivideAssign);
	}
	ModuloAssign() {
		return this.consume(SlimeTokenType.ModuloAssign);
	}
	LeftShift() {
		return this.consume(SlimeTokenType.LeftShift);
	}
	RightShift() {
		return this.consume(SlimeTokenType.RightShift);
	}
	LessEqual() {
		return this.consume(SlimeTokenType.LessEqual);
	}
	GreaterEqual() {
		return this.consume(SlimeTokenType.GreaterEqual);
	}
	Equal() {
		return this.consume(SlimeTokenType.Equal);
	}
	NotEqual() {
		return this.consume(SlimeTokenType.NotEqual);
	}
	LogicalAnd() {
		return this.consume(SlimeTokenType.LogicalAnd);
	}
	LogicalOr() {
		return this.consume(SlimeTokenType.LogicalOr);
	}
	NullishCoalescing() {
		return this.consume(SlimeTokenType.NullishCoalescing);
	}
	Increment() {
		return this.consume(SlimeTokenType.Increment);
	}
	Decrement() {
		return this.consume(SlimeTokenType.Decrement);
	}
	Exponentiation() {
		return this.consume(SlimeTokenType.Exponentiation);
	}
	BitwiseAndAssign() {
		return this.consume(SlimeTokenType.BitwiseAndAssign);
	}
	BitwiseOrAssign() {
		return this.consume(SlimeTokenType.BitwiseOrAssign);
	}
	BitwiseXorAssign() {
		return this.consume(SlimeTokenType.BitwiseXorAssign);
	}
	OptionalChaining() {
		return this.consume(SlimeTokenType.OptionalChaining);
	}
	LBrace() {
		return this.consume(SlimeTokenType.LBrace);
	}
	RBrace() {
		return this.consume(SlimeTokenType.RBrace);
	}
	LParen() {
		return this.consume(SlimeTokenType.LParen);
	}
	RParen() {
		return this.consume(SlimeTokenType.RParen);
	}
	LBracket() {
		return this.consume(SlimeTokenType.LBracket);
	}
	RBracket() {
		return this.consume(SlimeTokenType.RBracket);
	}
	Dot() {
		return this.consume(SlimeTokenType.Dot);
	}
	Semicolon() {
		return this.consume(SlimeTokenType.Semicolon);
	}
	Comma() {
		return this.consume(SlimeTokenType.Comma);
	}
	Less() {
		return this.consume(SlimeTokenType.Less);
	}
	Greater() {
		return this.consume(SlimeTokenType.Greater);
	}
	Plus() {
		return this.consume(SlimeTokenType.Plus);
	}
	Minus() {
		return this.consume(SlimeTokenType.Minus);
	}
	Asterisk() {
		return this.consume(SlimeTokenType.Asterisk);
	}
	Slash() {
		return this.consume(SlimeTokenType.Slash);
	}
	Modulo() {
		return this.consume(SlimeTokenType.Modulo);
	}
	BitwiseAnd() {
		return this.consume(SlimeTokenType.BitwiseAnd);
	}
	BitwiseOr() {
		return this.consume(SlimeTokenType.BitwiseOr);
	}
	BitwiseXor() {
		return this.consume(SlimeTokenType.BitwiseXor);
	}
	BitwiseNot() {
		return this.consume(SlimeTokenType.BitwiseNot);
	}
	LogicalNot() {
		return this.consume(SlimeTokenType.LogicalNot);
	}
	Question() {
		return this.consume(SlimeTokenType.Question);
	}
	Colon() {
		return this.consume(SlimeTokenType.Colon);
	}
	Assign() {
		return this.consume(SlimeTokenType.Assign);
	}
};

//#endregion
//#region ../../subhuti/src/struct/SubhutiCreateToken.ts
var SubhutiCreateToken = class {
	constructor(ovsToken) {
		this.name = ovsToken.name;
		this.type = ovsToken.type || ovsToken.name;
		this.pattern = ovsToken.pattern;
		if (ovsToken.value) this.value = ovsToken.value;
		else this.value = emptyValue;
		this.isKeyword = ovsToken.isKeyword ?? false;
		this.skip = ovsToken.skip;
		this.lookaheadAfter = ovsToken.lookaheadAfter;
		this.contextConstraint = ovsToken.contextConstraint;
	}
};
const emptyValue = "Error:CannotUseValue";
function createKeywordToken(name, pattern) {
	const token = new SubhutiCreateToken({
		name,
		pattern: /* @__PURE__ */ new RegExp(pattern + "(?![a-zA-Z0-9_$])"),
		value: pattern
	});
	token.isKeyword = true;
	return token;
}
function createValueRegToken(name, pattern, value, skip, lookahead, contextConstraint) {
	return new SubhutiCreateToken({
		name,
		pattern,
		value,
		skip,
		lookaheadAfter: lookahead,
		contextConstraint
	});
}
function createEmptyValueRegToken(name, pattern, contextConstraint) {
	return new SubhutiCreateToken({
		name,
		pattern,
		contextConstraint
	});
}

//#endregion
//#region ../../slime/packages/slime-parser/src/language/es2025/SlimeTokens.ts
const ID_START_SOURCE = String.raw`[\p{ID_Start}$_]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}`;
const ID_CONTINUE_SOURCE = String.raw`[\p{ID_Continue}$\u200C\u200D]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}`;
const IDENTIFIER_NAME_PATTERN = new RegExp(`(?:${ID_START_SOURCE})(?:${ID_CONTINUE_SOURCE})*`, "u");
const PRIVATE_IDENTIFIER_PATTERN = new RegExp(`#(?:${ID_START_SOURCE})(?:${ID_CONTINUE_SOURCE})*`, "u");
const SlimeTokensObj = {
	HashbangComment: createValueRegToken(SlimeTokenType.HashbangComment, /#![^\n\r\u2028\u2029]*/, "", false, void 0, { onlyAtStart: true }),
	MultiLineComment: createValueRegToken(SlimeTokenType.MultiLineComment, /\/\*[\s\S]*?\*\//, "", true),
	SingleLineComment: createValueRegToken(SlimeTokenType.SingleLineComment, /\/\/[^\n\r\u2028\u2029]*/, "", true),
	SingleLineHTMLOpenComment: createValueRegToken(SlimeTokenType.SingleLineHTMLOpenComment, /<!--[^\n\r\u2028\u2029]*/, "", true),
	SingleLineHTMLCloseComment: createValueRegToken(SlimeTokenType.SingleLineHTMLCloseComment, /-->[^\n\r\u2028\u2029]*/, "", true, void 0, { onlyAtLineStart: true }),
	WhiteSpace: createValueRegToken(SlimeTokenType.WhiteSpace, /[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/, "", true),
	LineTerminatorCRLF: createValueRegToken(SlimeTokenType.LineTerminator, /\r\n/, "", true),
	LineTerminator: createValueRegToken(SlimeTokenType.LineTerminator, /[\n\r\u2028\u2029]/, "", true),
	AwaitTok: createKeywordToken(SlimeTokenType.Await, "await"),
	BreakTok: createKeywordToken(SlimeTokenType.Break, "break"),
	CaseTok: createKeywordToken(SlimeTokenType.Case, "case"),
	CatchTok: createKeywordToken(SlimeTokenType.Catch, "catch"),
	ClassTok: createKeywordToken(SlimeTokenType.Class, "class"),
	ConstTok: createKeywordToken(SlimeTokenType.Const, "const"),
	ContinueTok: createKeywordToken(SlimeTokenType.Continue, "continue"),
	DebuggerTok: createKeywordToken(SlimeTokenType.Debugger, "debugger"),
	DefaultTok: createKeywordToken(SlimeTokenType.Default, "default"),
	DeleteTok: createKeywordToken(SlimeTokenType.Delete, "delete"),
	DoTok: createKeywordToken(SlimeTokenType.Do, "do"),
	ElseTok: createKeywordToken(SlimeTokenType.Else, "else"),
	EnumTok: createKeywordToken(SlimeTokenType.Enum, "enum"),
	ExportTok: createKeywordToken(SlimeTokenType.Export, "export"),
	ExtendsTok: createKeywordToken(SlimeTokenType.Extends, "extends"),
	FalseTok: createKeywordToken(SlimeTokenType.False, "false"),
	FinallyTok: createKeywordToken(SlimeTokenType.Finally, "finally"),
	ForTok: createKeywordToken(SlimeTokenType.For, "for"),
	FunctionTok: createKeywordToken(SlimeTokenType.Function, "function"),
	IfTok: createKeywordToken(SlimeTokenType.If, "if"),
	ImportTok: createKeywordToken(SlimeTokenType.Import, "import"),
	InTok: createKeywordToken(SlimeTokenType.In, "in"),
	InstanceofTok: createKeywordToken(SlimeTokenType.Instanceof, "instanceof"),
	NewTok: createKeywordToken(SlimeTokenType.New, "new"),
	NullTok: createKeywordToken(SlimeTokenType.NullLiteral, "null"),
	ReturnTok: createKeywordToken(SlimeTokenType.Return, "return"),
	SuperTok: createKeywordToken(SlimeTokenType.Super, "super"),
	SwitchTok: createKeywordToken(SlimeTokenType.Switch, "switch"),
	ThisTok: createKeywordToken(SlimeTokenType.This, "this"),
	ThrowTok: createKeywordToken(SlimeTokenType.Throw, "throw"),
	TrueTok: createKeywordToken(SlimeTokenType.True, "true"),
	TryTok: createKeywordToken(SlimeTokenType.Try, "try"),
	TypeofTok: createKeywordToken(SlimeTokenType.Typeof, "typeof"),
	VarTok: createKeywordToken(SlimeTokenType.Var, "var"),
	VoidTok: createKeywordToken(SlimeTokenType.Void, "void"),
	WhileTok: createKeywordToken(SlimeTokenType.While, "while"),
	WithTok: createKeywordToken(SlimeTokenType.With, "with"),
	YieldTok: createKeywordToken(SlimeTokenType.Yield, "yield"),
	NumericLiteralBigIntHex: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),
	NumericLiteralBigIntBinary: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[bB][01](_?[01])*n/),
	NumericLiteralBigIntOctal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[oO][0-7](_?[0-7])*n/),
	NumericLiteralBigIntDecimal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /(?:0|[1-9](_?[0-9])*)n/),
	NumericLiteralHex: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),
	NumericLiteralBinary: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[bB][01](_?[01])*/),
	NumericLiteralOctal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[oO][0-7](_?[0-7])*/),
	NumericLiteralDecimal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /(?:0[0-9]*|[1-9](_?[0-9])*)(?:\.([0-9](_?[0-9])*)?)?([eE][+-]?[0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*([eE][+-]?[0-9](_?[0-9])*)?/),
	DoubleStringCharacters: createEmptyValueRegToken(SlimeTokenType.StringLiteral, /"(?:[^\n\r"\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
	SingleStringCharacters: createEmptyValueRegToken(SlimeTokenType.StringLiteral, /'(?:[^\n\r'\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),
	TemplateHead: createEmptyValueRegToken(SlimeTokenType.TemplateHead, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
	TemplateMiddle: createEmptyValueRegToken(SlimeTokenType.TemplateMiddle, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
	TemplateTail: createEmptyValueRegToken(SlimeTokenType.TemplateTail, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
	NoSubstitutionTemplate: createEmptyValueRegToken(SlimeTokenType.NoSubstitutionTemplate, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
	UnsignedRightShiftAssign: createValueRegToken(SlimeTokenType.UnsignedRightShiftAssign, />>>=/, ">>>="),
	Ellipsis: createValueRegToken(SlimeTokenType.Ellipsis, /\.\.\./, "..."),
	UnsignedRightShift: createValueRegToken(SlimeTokenType.UnsignedRightShift, />>>/, ">>>"),
	StrictEqual: createValueRegToken(SlimeTokenType.StrictEqual, /===/, "==="),
	StrictNotEqual: createValueRegToken(SlimeTokenType.StrictNotEqual, /!==/, "!=="),
	LeftShiftAssign: createValueRegToken(SlimeTokenType.LeftShiftAssign, /<<=/, "<<="),
	RightShiftAssign: createValueRegToken(SlimeTokenType.RightShiftAssign, />>=/, ">>="),
	ExponentiationAssign: createValueRegToken(SlimeTokenType.ExponentiationAssign, /\*\*=/, "**="),
	LogicalAndAssign: createValueRegToken(SlimeTokenType.LogicalAndAssign, /&&=/, "&&="),
	LogicalOrAssign: createValueRegToken(SlimeTokenType.LogicalOrAssign, /\|\|=/, "||="),
	NullishCoalescingAssign: createValueRegToken(SlimeTokenType.NullishCoalescingAssign, /\?\?=/, "??="),
	Arrow: createValueRegToken(SlimeTokenType.Arrow, /=>/, "=>"),
	PlusAssign: createValueRegToken(SlimeTokenType.PlusAssign, /\+=/, "+="),
	MinusAssign: createValueRegToken(SlimeTokenType.MinusAssign, /-=/, "-="),
	MultiplyAssign: createValueRegToken(SlimeTokenType.MultiplyAssign, /\*=/, "*="),
	DivideAssign: createValueRegToken(SlimeTokenType.DivideAssign, /\/=/, "/="),
	ModuloAssign: createValueRegToken(SlimeTokenType.ModuloAssign, /%=/, "%="),
	LeftShift: createValueRegToken(SlimeTokenType.LeftShift, /<</, "<<"),
	RightShift: createValueRegToken(SlimeTokenType.RightShift, />>/, ">>"),
	LessEqual: createValueRegToken(SlimeTokenType.LessEqual, /<=/, "<="),
	GreaterEqual: createValueRegToken(SlimeTokenType.GreaterEqual, />=/, ">="),
	Equal: createValueRegToken(SlimeTokenType.Equal, /==/, "=="),
	NotEqual: createValueRegToken(SlimeTokenType.NotEqual, /!=/, "!="),
	LogicalAnd: createValueRegToken(SlimeTokenType.LogicalAnd, /&&/, "&&"),
	LogicalOr: createValueRegToken(SlimeTokenType.LogicalOr, /\|\|/, "||"),
	NullishCoalescing: createValueRegToken(SlimeTokenType.NullishCoalescing, /\?\?/, "??"),
	Increment: createValueRegToken(SlimeTokenType.Increment, /\+\+/, "++"),
	Decrement: createValueRegToken(SlimeTokenType.Decrement, /--/, "--"),
	Exponentiation: createValueRegToken(SlimeTokenType.Exponentiation, /\*\*/, "**"),
	BitwiseAndAssign: createValueRegToken(SlimeTokenType.BitwiseAndAssign, /&=/, "&="),
	BitwiseOrAssign: createValueRegToken(SlimeTokenType.BitwiseOrAssign, /\|=/, "|="),
	BitwiseXorAssign: createValueRegToken(SlimeTokenType.BitwiseXorAssign, /\^=/, "^="),
	OptionalChaining: createValueRegToken(SlimeTokenType.OptionalChaining, /\?\./, "?.", false, { not: /^\d/ }),
	LBrace: createValueRegToken(SlimeTokenType.LBrace, /\{/, "{"),
	RBrace: createValueRegToken(SlimeTokenType.RBrace, /\}/, "}"),
	LParen: createValueRegToken(SlimeTokenType.LParen, /\(/, "("),
	RParen: createValueRegToken(SlimeTokenType.RParen, /\)/, ")"),
	LBracket: createValueRegToken(SlimeTokenType.LBracket, /\[/, "["),
	RBracket: createValueRegToken(SlimeTokenType.RBracket, /\]/, "]"),
	Dot: createValueRegToken(SlimeTokenType.Dot, /\./, "."),
	Semicolon: createValueRegToken(SlimeTokenType.Semicolon, /;/, ";"),
	Comma: createValueRegToken(SlimeTokenType.Comma, /,/, ","),
	Less: createValueRegToken(SlimeTokenType.Less, /</, "<"),
	Greater: createValueRegToken(SlimeTokenType.Greater, />/, ">"),
	Plus: createValueRegToken(SlimeTokenType.Plus, /\+/, "+"),
	Minus: createValueRegToken(SlimeTokenType.Minus, /-/, "-"),
	Asterisk: createValueRegToken(SlimeTokenType.Asterisk, /\*/, "*"),
	Slash: createValueRegToken(SlimeTokenType.Slash, /\//, "/"),
	Modulo: createValueRegToken(SlimeTokenType.Modulo, /%/, "%"),
	BitwiseAnd: createValueRegToken(SlimeTokenType.BitwiseAnd, /&/, "&"),
	BitwiseOr: createValueRegToken(SlimeTokenType.BitwiseOr, /\|/, "|"),
	BitwiseXor: createValueRegToken(SlimeTokenType.BitwiseXor, /\^/, "^"),
	BitwiseNot: createValueRegToken(SlimeTokenType.BitwiseNot, /~/, "~"),
	LogicalNot: createValueRegToken(SlimeTokenType.LogicalNot, /!/, "!"),
	Question: createValueRegToken(SlimeTokenType.Question, /\?/, "?"),
	Colon: createValueRegToken(SlimeTokenType.Colon, /:/, ":"),
	Assign: createValueRegToken(SlimeTokenType.Assign, /=/, "="),
	PrivateIdentifier: createEmptyValueRegToken(SlimeTokenType.PrivateIdentifier, PRIVATE_IDENTIFIER_PATTERN),
	IdentifierName: createEmptyValueRegToken(SlimeTokenType.IdentifierName, IDENTIFIER_NAME_PATTERN)
};
const slimeTokens = Object.values(SlimeTokensObj);

//#endregion
//#region ../../slime/packages/slime-parser/src/language/es2025/SlimeParser.ts
/**
* ES2025 Parser - 完全符合 ECMAScript® 2025 规范的 Parser
* 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
*
* 设计原则：
* 1. 完全按照规范语法实现，一对一映射
* 2. 每个规则都是独立的方法，使用 @SubhutiRule 装饰器
* 3. 使用 Es2025TokenConsumer 提供类型安全的 token 消费
* 4. 支持所有参数化规则 [Yield, Await, In, Return, Default, Tagged]
*
* @version 1.0.0
*/
/**
* ES2025 保留字集合
* 来源：ECMAScript® 2025 规范 12.7.2 Keywords and Reserved Words
*
* 分类说明：
* 1. 硬关键字（永久保留，在此集合中）：
*    break, case, catch, class, const, continue, debugger, default,
*    delete, do, else, enum, export, extends, false, finally, for, function,
*    if, import, in, instanceof, new, null, return, super, switch, this,
*    throw, true, try, typeof, var, void, while, with, await, yield
*    实现方式：createKeywordToken + 独立 Token
*
* 2. 软关键字（不在此集合中，可作标识符）：
*    async, let, static, as, get, set, of, from, target, meta
*    - async: 可作变量名，如 `let async = 1`
*    - let, static: 非严格模式下可作标识符
*    - 其他: 仅在特定语法位置是关键字
*    实现方式：识别为 IdentifierName + consumeIdentifierValue()
*
* 用途：在 Parser 中验证标识符是否为保留字
* 实现：自动从所有 isKeyword=true 的 token 中提取（仅包含硬关键字）
*/
const ReservedWords = new Set(slimeTokens.filter((token) => token.isKeyword).map((token) => token.value));
const ID_START_REGEX = /^[\p{ID_Start}$_]$/u;
const ID_CONTINUE_REGEX = /^[\p{ID_Continue}$\u200C\u200D]$/u;
/**
* 解码 Unicode 转义序列
* 支持 \uXXXX 和 \u{XXXXX} 格式
*/
function decodeUnicodeEscape(escape) {
	if (escape.startsWith("\\u{") && escape.endsWith("}")) {
		const hex = escape.slice(3, -1);
		const codePoint = parseInt(hex, 16);
		if (isNaN(codePoint) || codePoint > 1114111) return null;
		return codePoint;
	} else if (escape.startsWith("\\u") && escape.length === 6) {
		const hex = escape.slice(2);
		const codePoint = parseInt(hex, 16);
		if (isNaN(codePoint)) return null;
		return codePoint;
	}
	return null;
}
/**
* 解码标识符中的 Unicode 转义序列
* 返回解码后的字符串，如果解码失败返回 null
*/
function decodeIdentifier(name) {
	const chars = [];
	let i = 0;
	while (i < name.length) if (name[i] === "\\" && name[i + 1] === "u") if (name[i + 2] === "{") {
		const endBrace = name.indexOf("}", i + 3);
		if (endBrace === -1) return null;
		const codePoint = decodeUnicodeEscape(name.slice(i, endBrace + 1));
		if (codePoint === null) return null;
		chars.push(String.fromCodePoint(codePoint));
		i = endBrace + 1;
	} else {
		if (i + 6 > name.length) return null;
		const codePoint = decodeUnicodeEscape(name.slice(i, i + 6));
		if (codePoint === null) return null;
		chars.push(String.fromCodePoint(codePoint));
		i += 6;
	}
	else {
		const codePoint = name.codePointAt(i);
		chars.push(String.fromCodePoint(codePoint));
		i += codePoint > 65535 ? 2 : 1;
	}
	return chars.join("");
}
/**
* 验证包含 Unicode 转义的标识符是否有效
*
* 按照 ECMAScript 规范，Unicode 转义解码后的字符必须满足：
* - 第一个字符：ID_Start | $ | _
* - 后续字符：ID_Continue | $ | ZWNJ | ZWJ
*
* 注意：使用 for...of 正确迭代 Unicode 码点（处理代理对）
*/
function isValidIdentifierWithEscapes(name) {
	const decoded = decodeIdentifier(name);
	if (decoded === null || decoded.length === 0) return false;
	let isFirst = true;
	for (const char of decoded) if (isFirst) {
		if (!ID_START_REGEX.test(char)) return false;
		isFirst = false;
	} else if (!ID_CONTINUE_REGEX.test(char)) return false;
	return true;
}
var SlimeParser = @Subhuti class extends SubhutiParser {
	/**
	* 构造函数
	* @param sourceCode 原始源码，使用按需词法分析模式
	* @param options 可选配置，子类可以覆盖 tokenConsumer 和 tokenDefinitions
	*/
	constructor(sourceCode = "", options) {
		const defaultTokenConsumer = SlimeTokenConsumer;
		super(sourceCode, {
			tokenConsumer: options?.tokenConsumer ?? defaultTokenConsumer,
			tokenDefinitions: options?.tokenDefinitions ?? slimeTokens
		});
	}
	/**
	* 检查当前 token 是否是指定的上下文关键字（软关键字）
	* @param value 软关键字的值（如 SlimeContextualKeywordTokenTypes.LET）
	*/
	isContextual(value) {
		return this.match(SlimeTokenType.IdentifierName) && this.curToken?.tokenValue === value;
	}
	/**
	* 检查从当前位置开始是否是：上下文关键字 + 后续 token 序列
	* @param contextualValue 软关键字的值
	* @param nextTokenNames 后续 token 名称列表
	*/
	isContextualSequence(contextualValue, ...nextTokenNames) {
		if (!this.isContextual(contextualValue)) return false;
		for (let i = 0; i < nextTokenNames.length; i++) if (this.peek(i + 1)?.tokenName !== nextTokenNames[i]) return false;
		return true;
	}
	/**
	* 检查从当前位置开始是否是：上下文关键字 + 后续 token 序列（中间无换行符）
	* @param contextualValue 软关键字的值
	* @param nextTokenNames 后续 token 名称列表
	*/
	isContextualSequenceNoLT(contextualValue, ...nextTokenNames) {
		if (!this.isContextual(contextualValue)) return false;
		for (let i = 0; i < nextTokenNames.length; i++) {
			const token = this.peek(i + 1);
			if (token?.tokenName !== nextTokenNames[i]) return false;
			if (token.hasLineBreakBefore) return false;
		}
		return true;
	}
	/**
	* 断言：当前 token 不能是指定的上下文关键字
	* @param value 软关键字的值
	*/
	assertNotContextual(value) {
		if (!this._parseSuccess) return false;
		if (this.isContextual(value)) {
			this._parseSuccess = false;
			return false;
		}
		return true;
	}
	/**
	* 断言：不能是上下文关键字 + 后续 token 序列
	* @param contextualValue 软关键字的值
	* @param nextTokenNames 后续 token 名称列表
	*/
	assertNotContextualSequence(contextualValue, ...nextTokenNames) {
		if (!this._parseSuccess) return false;
		if (this.isContextualSequence(contextualValue, ...nextTokenNames)) {
			this._parseSuccess = false;
			return false;
		}
		return true;
	}
	/**
	* 断言：不能是上下文关键字 + 后续 token 序列（考虑换行符约束）
	* @param contextualValue 软关键字的值
	* @param nextTokenNames 后续 token 名称列表
	*/
	assertNotContextualSequenceNoLT(contextualValue, ...nextTokenNames) {
		if (!this._parseSuccess) return false;
		if (this.isContextualSequenceNoLT(contextualValue, ...nextTokenNames)) {
			this._parseSuccess = false;
			return false;
		}
		return true;
	}
	/**
	* 检查从当前位置开始是否是两个连续的上下文关键字
	* 用于 [lookahead ∉ {async of}] 这样的约束
	* @param first 第一个软关键字的值
	* @param second 第二个软关键字的值
	*/
	isContextualPair(first, second) {
		if (!this.isContextual(first)) return false;
		const nextToken = this.peek(1);
		return nextToken?.tokenName === SlimeTokenType.IdentifierName && nextToken.tokenValue === second;
	}
	/**
	* 断言：不能是两个连续的上下文关键字
	* @param first 第一个软关键字的值
	* @param second 第二个软关键字的值
	*/
	assertNotContextualPair(first, second) {
		if (!this._parseSuccess) return false;
		if (this.isContextualPair(first, second)) {
			this._parseSuccess = false;
			return false;
		}
		return true;
	}
	/**
	* 将当前 Slash 或 DivideAssign token 重新扫描为 RegularExpressionLiteral
	*
	* 当词法分析阶段将正则表达式误判为除法时调用。
	* 例如:
	*   `if(1)/  foo/` 中的 `/  foo/` 被误判为 Slash, foo, Slash
	*   `} /42/i` 中的 `/42/i` 被误判为 Slash, 42, Slash, i
	*   `x = /=foo/g` 中的 `/=foo/g` 被误判为 DivideAssign, foo, Slash, g
	*
	* 工作原理：
	* 1. 从原始源码的当前 token 位置开始，直接匹配正则表达式
	* 2. 如果匹配成功，计算覆盖了多少个原始 tokens
	* 3. 替换这些 tokens 为一个 RegularExpressionLiteral
	*
	* @returns 是否成功重新扫描
	*/
	rescanSlashAsRegExp() {
		const curToken = this.curToken;
		if (!curToken || curToken.tokenName !== SlimeTokenType.Slash && curToken.tokenName !== SlimeTokenType.DivideAssign) return false;
		const regexpMatch = matchRegExpLiteral(this._sourceCode.slice(curToken.index));
		if (!regexpMatch) return false;
		const regexpEndIndex = curToken.index + regexpMatch.length;
		const startTokenIndex = this.tokenIndex;
		let tokensToReplace = 1;
		for (let i = startTokenIndex + 1; i < this._tokens.length; i++) if (this._tokens[i].index < regexpEndIndex) tokensToReplace++;
		else break;
		const newToken = {
			tokenName: SlimeTokenType.RegularExpressionLiteral,
			tokenValue: regexpMatch,
			index: curToken.index,
			rowNum: curToken.rowNum,
			columnStartNum: curToken.columnStartNum,
			columnEndNum: curToken.columnStartNum + regexpMatch.length - 1,
			hasLineBreakBefore: curToken.hasLineBreakBefore
		};
		this._tokens.splice(startTokenIndex, tokensToReplace, newToken);
		return true;
	}
	/**
	* IdentifierReference[Yield, Await] :
	*     Identifier
	*     [~Yield] yield
	*     [~Await] await
	*/
	@SubhutiRule IdentifierReference(params = {}) {
		const { Yield = false, Await = false } = params;
		return this.Or([
			{ alt: () => this.Identifier() },
			...!Yield ? [{ alt: () => this.tokenConsumer.Yield() }] : [],
			...!Await ? [{ alt: () => this.tokenConsumer.Await() }] : []
		]);
	}
	/**
	* BindingIdentifier[Yield, Await] :
	*     Identifier
	*     yield
	*     await
	*
	* 注意：根据 ES2025 规范，BindingIdentifier 语法上允许 yield 和 await 作为标识符。
	* 与 LabelIdentifier 不同，这里没有 [~Yield]/[~Await] 条件限制。
	* yield/await 在特定上下文中是否合法，由静态语义（Static Semantics）检查决定。
	*/
	@SubhutiRule BindingIdentifier(params = {}) {
		return this.Or([
			{ alt: () => this.Identifier() },
			{ alt: () => this.tokenConsumer.Yield() },
			{ alt: () => this.tokenConsumer.Await() }
		]);
	}
	/**
	* LabelIdentifier[Yield, Await] :
	*     Identifier
	*     [~Yield] yield
	*     [~Await] await
	*/
	@SubhutiRule LabelIdentifier(params = {}) {
		const { Yield = false, Await = false } = params;
		return this.Or([
			{ alt: () => this.Identifier() },
			...!Yield ? [{ alt: () => this.tokenConsumer.Yield() }] : [],
			...!Await ? [{ alt: () => this.tokenConsumer.Await() }] : []
		]);
	}
	/**
	* Identifier :
	*     IdentifierName but not ReservedWord
	*
	* 根据 ECMAScript 规范 12.7，当标识符包含 Unicode 转义序列时，
	* 解码后的字符必须满足 ID_Start（第一个字符）或 ID_Continue（后续字符）属性。
	* 参考 Acorn 实现。
	*/
	@SubhutiRule Identifier() {
		const cst = this.tokenConsumer.IdentifierName();
		if (!cst) return void 0;
		const value = cst.value;
		if (ReservedWords.has(value)) throw new Error(`[Lexer Bug] 保留字 "${value}" 被错误识别为 IdentifierName，应该是独立的关键字 token`);
		if (value.includes("\\u")) {
			if (!isValidIdentifierWithEscapes(value)) return this.setParseFail();
			const decoded = decodeIdentifier(value);
			if (decoded !== null && ReservedWords.has(decoded)) return this.setParseFail();
		}
		return cst;
	}
	/**
	* IdentifierName - 语法层规则
	*
	* 按照 ES2025 规范，IdentifierName 包括所有标识符字符序列（包括关键字）
	* 用于：属性名、成员访问、ModuleExportName 等场景
	*
	* 注意：词法层的 IdentifierName token 只匹配非关键字标识符，
	* 所以这里需要显式包含所有关键字 token
	*
	* 同样需要验证 Unicode 转义的有效性
	*/
	@SubhutiRule IdentifierName() {
		return this.Or([
			{ alt: () => {
				const cst = this.tokenConsumer.IdentifierName();
				if (!cst) return void 0;
				const value = cst.value;
				if (value.includes("\\u")) {
					if (!isValidIdentifierWithEscapes(value)) return this.setParseFail();
				}
				return cst;
			} },
			{ alt: () => this.tokenConsumer.Await() },
			{ alt: () => this.tokenConsumer.Break() },
			{ alt: () => this.tokenConsumer.Case() },
			{ alt: () => this.tokenConsumer.Catch() },
			{ alt: () => this.tokenConsumer.Class() },
			{ alt: () => this.tokenConsumer.Const() },
			{ alt: () => this.tokenConsumer.Continue() },
			{ alt: () => this.tokenConsumer.Debugger() },
			{ alt: () => this.tokenConsumer.Default() },
			{ alt: () => this.tokenConsumer.Delete() },
			{ alt: () => this.tokenConsumer.Do() },
			{ alt: () => this.tokenConsumer.Else() },
			{ alt: () => this.tokenConsumer.Enum() },
			{ alt: () => this.tokenConsumer.Export() },
			{ alt: () => this.tokenConsumer.Extends() },
			{ alt: () => this.tokenConsumer.False() },
			{ alt: () => this.tokenConsumer.Finally() },
			{ alt: () => this.tokenConsumer.For() },
			{ alt: () => this.tokenConsumer.Function() },
			{ alt: () => this.tokenConsumer.If() },
			{ alt: () => this.tokenConsumer.Import() },
			{ alt: () => this.tokenConsumer.In() },
			{ alt: () => this.tokenConsumer.Instanceof() },
			{ alt: () => this.tokenConsumer.New() },
			{ alt: () => this.tokenConsumer.NullLiteral() },
			{ alt: () => this.tokenConsumer.Return() },
			{ alt: () => this.tokenConsumer.Super() },
			{ alt: () => this.tokenConsumer.Switch() },
			{ alt: () => this.tokenConsumer.This() },
			{ alt: () => this.tokenConsumer.Throw() },
			{ alt: () => this.tokenConsumer.True() },
			{ alt: () => this.tokenConsumer.Try() },
			{ alt: () => this.tokenConsumer.Typeof() },
			{ alt: () => this.tokenConsumer.Var() },
			{ alt: () => this.tokenConsumer.Void() },
			{ alt: () => this.tokenConsumer.While() },
			{ alt: () => this.tokenConsumer.With() },
			{ alt: () => this.tokenConsumer.Yield() },
			{ alt: () => this.tokenConsumer.Async() },
			{ alt: () => this.tokenConsumer.Let() },
			{ alt: () => this.tokenConsumer.Static() },
			{ alt: () => this.tokenConsumer.As() }
		]);
	}
	/**
	* PrimaryExpression[Yield, Await] :
	*     this
	*     IdentifierReference[?Yield, ?Await]
	*     Literal
	*     ArrayLiteral[?Yield, ?Await]
	*     ObjectLiteral[?Yield, ?Await]
	*     FunctionExpression
	*     ClassExpression[?Yield, ?Await]
	*     GeneratorExpression
	*     AsyncFunctionExpression
	*     AsyncGeneratorExpression
	*     RegularExpressionLiteral
	*     TemplateLiteral[?Yield, ?Await, ~Tagged]
	*     CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
	*/
	@SubhutiRule PrimaryExpression(params = {}) {
		return this.Or([
			{ alt: () => this.tokenConsumer.This() },
			{ alt: () => this.AsyncGeneratorExpression() },
			{ alt: () => this.AsyncFunctionExpression() },
			{ alt: () => this.IdentifierReference(params) },
			{ alt: () => this.Literal() },
			{ alt: () => this.GeneratorExpression() },
			{ alt: () => this.FunctionExpression() },
			{ alt: () => this.ClassExpression(params) },
			{ alt: () => this.ArrayLiteral(params) },
			{ alt: () => this.ObjectLiteral(params) },
			{ alt: () => this.consumeRegularExpressionLiteral() },
			{ alt: () => this.TemplateLiteral({
				...params,
				Tagged: false
			}) },
			{ alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params) }
		]);
	}
	/**
	* 消费正则表达式字面量（使用 InputElementRegExp 模式）
	*/
	consumeRegularExpressionLiteral() {
		return this.consume(SlimeTokenType.RegularExpressionLiteral, LexicalGoal.InputElementRegExp);
	}
	/**
	* CoverParenthesizedExpressionAndArrowParameterList[Yield, Await] :
	*     ( Expression[+In, ?Yield, ?Await] )
	*     ( Expression[+In, ?Yield, ?Await] , )
	*     ( )
	*     ( ... BindingIdentifier[?Yield, ?Await] )
	*     ( ... BindingPattern[?Yield, ?Await] )
	*     ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
	*     ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
	*/
	@SubhutiRule CoverParenthesizedExpressionAndArrowParameterList(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.Comma();
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.tokenConsumer.Ellipsis();
				this.BindingIdentifier(params);
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.tokenConsumer.Ellipsis();
				this.BindingPattern(params);
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.Comma();
				this.tokenConsumer.Ellipsis();
				this.BindingIdentifier(params);
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.Comma();
				this.tokenConsumer.Ellipsis();
				this.BindingPattern(params);
				this.tokenConsumer.RParen();
			} }
		]);
	}
	/**
	* ParenthesizedExpression[Yield, Await] :
	*     ( Expression[+In, ?Yield, ?Await] )
	*
	* Supplemental Syntax:
	* When processing PrimaryExpression : CoverParenthesizedExpressionAndArrowParameterList,
	* the interpretation is refined using this rule.
	*
	* 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
	*/
	@SubhutiRule ParenthesizedExpression(params = {}) {
		this.tokenConsumer.LParen();
		this.Expression({
			...params,
			In: true
		});
		return this.tokenConsumer.RParen();
	}
	/**
	* Literal :
	*     NullLiteral
	*     BooleanLiteral
	*     NumericLiteral
	*     StringLiteral
	*
	* 注意：NullLiteral、NumericLiteral、StringLiteral 是词法规则（A.1 Lexical Grammar），
	* 直接使用 tokenConsumer 消费 token
	*/
	@SubhutiRule Literal() {
		return this.Or([
			{ alt: () => this.tokenConsumer.NullLiteral() },
			{ alt: () => this.BooleanLiteral() },
			{ alt: () => this.tokenConsumer.NumericLiteral() },
			{ alt: () => this.tokenConsumer.StringLiteral() }
		]);
	}
	/**
	* BooleanLiteral :
	*     true
	*     false
	*/
	@SubhutiRule BooleanLiteral() {
		return this.Or([{ alt: () => this.tokenConsumer.True() }, { alt: () => this.tokenConsumer.False() }]);
	}
	/**
	* ArrayLiteral[Yield, Await] :
	*     [ Elision_opt ]
	*     [ ElementList[?Yield, ?Await] ]
	*     [ ElementList[?Yield, ?Await] , Elision_opt ]
	*/
	@SubhutiRule ArrayLiteral(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.Option(() => this.Elision());
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.ElementList(params);
				this.tokenConsumer.Comma();
				this.Option(() => this.Elision());
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.ElementList(params);
				this.tokenConsumer.RBracket();
			} }
		]);
	}
	/**
	* ElementList[Yield, Await] :
	*     Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
	*     Elision_opt SpreadElement[?Yield, ?Await]
	*     ElementList[?Yield, ?Await] , Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
	*     ElementList[?Yield, ?Await] , Elision_opt SpreadElement[?Yield, ?Await]
	*/
	@SubhutiRule ElementList(params = {}) {
		this.Option(() => this.Elision());
		this.Or([{ alt: () => this.AssignmentExpression({
			...params,
			In: true
		}) }, { alt: () => this.SpreadElement(params) }]);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.Option(() => this.Elision());
			this.Or([{ alt: () => this.AssignmentExpression({
				...params,
				In: true
			}) }, { alt: () => this.SpreadElement(params) }]);
		});
		return this.curCst;
	}
	/**
	* Elision :
	*     ,
	*     Elision ,
	*/
	@SubhutiRule Elision() {
		this.tokenConsumer.Comma();
		this.Many(() => this.tokenConsumer.Comma());
		return this.curCst;
	}
	/**
	* SpreadElement[Yield, Await] :
	*     ... AssignmentExpression[+In, ?Yield, ?Await]
	*/
	@SubhutiRule SpreadElement(params = {}) {
		this.tokenConsumer.Ellipsis();
		return this.AssignmentExpression({
			...params,
			In: true
		});
	}
	/**
	* ObjectLiteral[Yield, Await] :
	*     { }
	*     { PropertyDefinitionList[?Yield, ?Await] }
	*     { PropertyDefinitionList[?Yield, ?Await] , }
	*/
	@SubhutiRule ObjectLiteral(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.PropertyDefinitionList(params);
				this.tokenConsumer.Comma();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.PropertyDefinitionList(params);
				this.tokenConsumer.RBrace();
			} }
		]);
	}
	/**
	* PropertyDefinitionList[Yield, Await] :
	*     PropertyDefinition[?Yield, ?Await]
	*     PropertyDefinitionList[?Yield, ?Await] , PropertyDefinition[?Yield, ?Await]
	*/
	@SubhutiRule PropertyDefinitionList(params = {}) {
		this.PropertyDefinition(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.PropertyDefinition(params);
		});
		return this.curCst;
	}
	/**
	* PropertyDefinition[Yield, Await] :
	*     IdentifierReference[?Yield, ?Await]
	*     CoverInitializedName[?Yield, ?Await]
	*     PropertyName[?Yield, ?Await] : AssignmentExpression[+In, ?Yield, ?Await]
	*     MethodDefinition[?Yield, ?Await]
	*     ... AssignmentExpression[+In, ?Yield, ?Await]
	*
	* ⚠️ Or 顺序调整：
	* 为了正确处理 PEG 的贪婪匹配，将更具体的规则（带明确分隔符的）放在前面：
	* 1. ... AssignmentExpression - 有明确的 `...` 前缀
	* 2. PropertyName : AssignmentExpression - 有明确的 `:` 分隔符
	* 3. CoverInitializedName - 有明确的 `=` 分隔符
	* 4. MethodDefinition - 有明确的函数签名
	* 5. IdentifierReference - 简写属性，最宽松，放最后
	*/
	@SubhutiRule PropertyDefinition(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.Ellipsis();
				this.AssignmentExpression({
					...params,
					In: true
				});
			} },
			{ alt: () => {
				this.PropertyName(params);
				this.tokenConsumer.Colon();
				this.AssignmentExpression({
					...params,
					In: true
				});
			} },
			{ alt: () => this.CoverInitializedName(params) },
			{ alt: () => this.MethodDefinition(params) },
			{ alt: () => this.IdentifierReference(params) }
		]);
	}
	/**
	* PropertyName[Yield, Await] :
	*     LiteralPropertyName
	*     ComputedPropertyName[?Yield, ?Await]
	*/
	@SubhutiRule PropertyName(params = {}) {
		return this.Or([{ alt: () => this.LiteralPropertyName() }, { alt: () => this.ComputedPropertyName(params) }]);
	}
	/**
	* LiteralPropertyName :
	*     IdentifierName
	*     StringLiteral
	*     NumericLiteral
	*
	* 注意：StringLiteral、NumericLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
	*/
	@SubhutiRule LiteralPropertyName() {
		return this.Or([
			{ alt: () => this.IdentifierName() },
			{ alt: () => this.tokenConsumer.StringLiteral() },
			{ alt: () => this.tokenConsumer.NumericLiteral() }
		]);
	}
	/**
	* ComputedPropertyName[Yield, Await] :
	*     [ AssignmentExpression[+In, ?Yield, ?Await] ]
	*/
	@SubhutiRule ComputedPropertyName(params = {}) {
		this.tokenConsumer.LBracket();
		this.AssignmentExpression({
			...params,
			In: true
		});
		return this.tokenConsumer.RBracket();
	}
	/**
	* CoverInitializedName[Yield, Await] :
	*     IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]
	*/
	@SubhutiRule CoverInitializedName(params = {}) {
		this.IdentifierReference(params);
		return this.Initializer({
			...params,
			In: true
		});
	}
	/**
	* Initializer[In, Yield, Await] :
	*     = AssignmentExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule Initializer(params = {}) {
		this.tokenConsumer.Assign();
		return this.AssignmentExpression(params);
	}
	/**
	* TemplateLiteral[Yield, Await, Tagged] :
	*     NoSubstitutionTemplate
	*     SubstitutionTemplate[?Yield, ?Await, ?Tagged]
	*/
	@SubhutiRule TemplateLiteral(params = {}) {
		return this.Or([{ alt: () => this.tokenConsumer.NoSubstitutionTemplate() }, { alt: () => this.SubstitutionTemplate(params) }]);
	}
	/**
	* SubstitutionTemplate[Yield, Await, Tagged] :
	*     TemplateHead Expression[+In, ?Yield, ?Await] TemplateSpans[?Yield, ?Await, ?Tagged]
	*/
	@SubhutiRule SubstitutionTemplate(params = {}) {
		this.tokenConsumer.TemplateHead();
		this.Expression({
			...params,
			In: true
		});
		return this.TemplateSpans(params);
	}
	/**
	* TemplateSpans[Yield, Await, Tagged] :
	*     TemplateTail
	*     TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateTail
	*/
	@SubhutiRule TemplateSpans(params = {}) {
		return this.Or([{ alt: () => this.tokenConsumer.TemplateTail() }, { alt: () => {
			this.TemplateMiddleList(params);
			this.tokenConsumer.TemplateTail();
		} }]);
	}
	/**
	* TemplateMiddleList[Yield, Await, Tagged] :
	*     TemplateMiddle Expression[+In, ?Yield, ?Await]
	*     TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateMiddle Expression[+In, ?Yield, ?Await]
	*/
	@SubhutiRule TemplateMiddleList(params = {}) {
		this.tokenConsumer.TemplateMiddle();
		this.Expression({
			...params,
			In: true
		});
		this.Many(() => {
			this.tokenConsumer.TemplateMiddle();
			this.Expression({
				...params,
				In: true
			});
		});
		return this.curCst;
	}
	/**
	* MemberExpression[Yield, Await] :
	*     PrimaryExpression[?Yield, ?Await]
	*     MemberExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
	*     MemberExpression[?Yield, ?Await] . IdentifierName
	*     MemberExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
	*     SuperProperty[?Yield, ?Await]
	*     MetaProperty
	*     new MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
	*     MemberExpression[?Yield, ?Await] . PrivateIdentifier
	*/
	@SubhutiRule MemberExpression(params = {}) {
		this.Or([
			{ alt: () => this.PrimaryExpression(params) },
			{ alt: () => this.SuperProperty(params) },
			{ alt: () => this.MetaProperty() },
			{ alt: () => {
				this.tokenConsumer.New();
				this.MemberExpression(params);
				this.Arguments(params);
			} }
		]);
		this.Many(() => this.Or([
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.Dot();
				this.IdentifierName();
			} },
			{ alt: () => this.TemplateLiteral({
				...params,
				Tagged: true
			}) },
			{ alt: () => {
				this.tokenConsumer.Dot();
				this.tokenConsumer.PrivateIdentifier();
			} }
		]));
		return this.curCst;
	}
	/**
	* SuperProperty[Yield, Await] :
	*     super [ Expression[+In, ?Yield, ?Await] ]
	*     super . IdentifierName
	*/
	@SubhutiRule SuperProperty(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Super();
			this.tokenConsumer.LBracket();
			this.Expression({
				...params,
				In: true
			});
			this.tokenConsumer.RBracket();
		} }, { alt: () => {
			this.tokenConsumer.Super();
			this.tokenConsumer.Dot();
			this.IdentifierName();
		} }]);
	}
	/**
	* MetaProperty :
	*     NewTarget
	*     ImportMeta
	*/
	@SubhutiRule MetaProperty() {
		return this.Or([{ alt: () => this.NewTarget() }, { alt: () => this.ImportMeta() }]);
	}
	/**
	* NewTarget :
	*     new . target
	*/
	@SubhutiRule NewTarget() {
		this.tokenConsumer.New();
		this.tokenConsumer.Dot();
		return this.tokenConsumer.Target();
	}
	/**
	* ImportMeta :
	*     import . meta
	*/
	@SubhutiRule ImportMeta() {
		this.tokenConsumer.Import();
		this.tokenConsumer.Dot();
		return this.tokenConsumer.Meta();
	}
	/**
	* NewExpression[Yield, Await] :
	*     MemberExpression[?Yield, ?Await]
	*     new NewExpression[?Yield, ?Await]
	*/
	@SubhutiRule NewExpression(params = {}) {
		return this.Or([{ alt: () => this.MemberExpression(params) }, { alt: () => {
			this.tokenConsumer.New();
			this.NewExpression(params);
		} }]);
	}
	/**
	* CallExpression[Yield, Await] :
	*     CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await]
	*     SuperCall[?Yield, ?Await]
	*     ImportCall[?Yield, ?Await]
	*     CallExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
	*     CallExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
	*     CallExpression[?Yield, ?Await] . IdentifierName
	*     CallExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
	*     CallExpression[?Yield, ?Await] . PrivateIdentifier
	*/
	@SubhutiRule CallExpression(params = {}) {
		this.Or([
			{ alt: () => this.CoverCallExpressionAndAsyncArrowHead(params) },
			{ alt: () => this.SuperCall(params) },
			{ alt: () => this.ImportCall(params) }
		]);
		this.Many(() => this.Or([
			{ alt: () => this.Arguments(params) },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.Dot();
				this.IdentifierName();
			} },
			{ alt: () => this.TemplateLiteral({
				...params,
				Tagged: true
			}) },
			{ alt: () => {
				this.tokenConsumer.Dot();
				this.tokenConsumer.PrivateIdentifier();
			} }
		]));
		return this.curCst;
	}
	/**
	* CoverCallExpressionAndAsyncArrowHead[Yield, Await] :
	*     MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
	*
	* 这是一个 Cover Grammar，用于覆盖：
	* 1. 函数调用：func(args)
	* 2. Async 箭头函数头：async (args) => {}
	*/
	@SubhutiRule CoverCallExpressionAndAsyncArrowHead(params = {}) {
		this.MemberExpression(params);
		return this.Arguments(params);
	}
	/**
	* CallMemberExpression[Yield, Await] :
	*     MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
	*
	* Supplemental Syntax:
	* When processing CallExpression : CoverCallExpressionAndAsyncArrowHead,
	* the interpretation is refined using this rule.
	*
	* 注意：虽然此方法与 CoverCallExpressionAndAsyncArrowHead 实现完全相同，
	* 但为了与 ES2025 规范完全一致，保留此方法。
	* 规范中 CallMemberExpression 是 Supplemental Syntax，用于语义分析时精化 Cover Grammar。
	*/
	@SubhutiRule CallMemberExpression(params = {}) {
		this.MemberExpression(params);
		return this.Arguments(params);
	}
	/**
	* SuperCall[Yield, Await] :
	*     super Arguments[?Yield, ?Await]
	*/
	@SubhutiRule SuperCall(params = {}) {
		this.tokenConsumer.Super();
		return this.Arguments(params);
	}
	/**
	* ImportCall[Yield, Await] :
	*     import ( AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
	*     import ( AssignmentExpression[+In, ?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
	*/
	@SubhutiRule ImportCall(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Import();
			this.tokenConsumer.LParen();
			this.AssignmentExpression({
				...params,
				In: true
			});
			this.tokenConsumer.Comma();
			this.AssignmentExpression({
				...params,
				In: true
			});
			this.Option(() => this.tokenConsumer.Comma());
			this.tokenConsumer.RParen();
		} }, { alt: () => {
			this.tokenConsumer.Import();
			this.tokenConsumer.LParen();
			this.AssignmentExpression({
				...params,
				In: true
			});
			this.Option(() => this.tokenConsumer.Comma());
			this.tokenConsumer.RParen();
		} }]);
	}
	/**
	* Arguments[Yield, Await] :
	*     ( )
	*     ( ArgumentList[?Yield, ?Await] )
	*     ( ArgumentList[?Yield, ?Await] , )
	*/
	@SubhutiRule Arguments(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.ArgumentList(params);
				this.tokenConsumer.Comma();
				this.tokenConsumer.RParen();
			} },
			{ alt: () => {
				this.tokenConsumer.LParen();
				this.ArgumentList(params);
				this.tokenConsumer.RParen();
			} }
		]);
	}
	/**
	* ArgumentList[Yield, Await] :
	*     AssignmentExpression[+In, ?Yield, ?Await]
	*     ... AssignmentExpression[+In, ?Yield, ?Await]
	*     ArgumentList[?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await]
	*     ArgumentList[?Yield, ?Await] , ... AssignmentExpression[+In, ?Yield, ?Await]
	*/
	@SubhutiRule ArgumentList(params = {}) {
		this.Or([{ alt: () => this.AssignmentExpression({
			...params,
			In: true
		}) }, { alt: () => {
			this.tokenConsumer.Ellipsis();
			this.AssignmentExpression({
				...params,
				In: true
			});
		} }]);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.Or([{ alt: () => this.AssignmentExpression({
				...params,
				In: true
			}) }, { alt: () => {
				this.tokenConsumer.Ellipsis();
				this.AssignmentExpression({
					...params,
					In: true
				});
			} }]);
		});
		return this.curCst;
	}
	/**
	* OptionalExpression[Yield, Await] :
	*     MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
	*     CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
	*     OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
	*
	* PEG 实现注意事项：
	* - CallExpression 必须在 MemberExpression 之前，因为 CallExpression 包含 Arguments
	* - 例如 `fn()?.value`：CallExpression 匹配 `fn()`，然后 OptionalChain 匹配 `?.value`
	* - 如果 MemberExpression 在前，它只会匹配 `fn`，导致 `()` 无法消费
	*/
	@SubhutiRule OptionalExpression(params = {}) {
		this.Or([{ alt: () => this.CallExpression(params) }, { alt: () => this.MemberExpression(params) }]);
		this.OptionalChain(params);
		this.Many(() => this.OptionalChain(params));
		return this.curCst;
	}
	/**
	* OptionalChain[Yield, Await] :
	*     ?. Arguments[?Yield, ?Await]
	*     ?. [ Expression[+In, ?Yield, ?Await] ]
	*     ?. IdentifierName
	*     ?. TemplateLiteral[?Yield, ?Await, +Tagged]
	*     ?. PrivateIdentifier
	*     OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
	*     OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
	*     OptionalChain[?Yield, ?Await] . IdentifierName
	*     OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
	*     OptionalChain[?Yield, ?Await] . PrivateIdentifier
	*/
	@SubhutiRule OptionalChain(params = {}) {
		this.Or([
			{ alt: () => {
				this.tokenConsumer.OptionalChaining();
				this.Arguments(params);
			} },
			{ alt: () => {
				this.tokenConsumer.OptionalChaining();
				this.tokenConsumer.LBracket();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.OptionalChaining();
				this.IdentifierName();
			} },
			{ alt: () => {
				this.tokenConsumer.OptionalChaining();
				this.TemplateLiteral({
					...params,
					Tagged: true
				});
			} },
			{ alt: () => {
				this.tokenConsumer.OptionalChaining();
				this.tokenConsumer.PrivateIdentifier();
			} }
		]);
		this.Many(() => this.Or([
			{ alt: () => this.Arguments(params) },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.Dot();
				this.IdentifierName();
			} },
			{ alt: () => this.TemplateLiteral({
				...params,
				Tagged: true
			}) },
			{ alt: () => {
				this.tokenConsumer.Dot();
				this.tokenConsumer.PrivateIdentifier();
			} }
		]));
		return this.curCst;
	}
	/**
	* LeftHandSideExpression[Yield, Await] :
	*     NewExpression[?Yield, ?Await]
	*     CallExpression[?Yield, ?Await]
	*     OptionalExpression[?Yield, ?Await]
	*
	* PEG 实现注意事项：
	*
	* 规范中的三个产生式在语义上是互斥的：
	* - CallExpression: 必须包含至少一个 Arguments（函数调用 `()`）
	* - OptionalExpression: 必须包含至少一个 OptionalChain（可选链 `?.`）
	* - NewExpression: 不包含 Arguments 或 OptionalChain
	*
	* 但在 PEG 中，由于顺序选择的特性，如果按规范顺序实现会导致问题：
	* - NewExpression 包含 MemberExpression，会匹配 `console.log`
	* - 然后 NewExpression 结束，`(x)` 无法被消耗
	* - 导致解析失败或无限循环
	*
	* 解决方案：调整分支顺序，将"更长"的规则放在前面
	* - OptionalExpression 在前：最长匹配，包含 CallExpression/MemberExpression + OptionalChain
	*   例如：`fn()?.value`、`obj?.method()`
	* - CallExpression 次之：包含 Arguments（如 `console.log(x)`）
	* - NewExpression 最后：匹配其他情况（如 `this`、`obj.prop`）
	*
	* 这与规范顺序不一致，但在 PEG 中是必要的。
	*/
	@SubhutiRule LeftHandSideExpression(params = {}) {
		return this.Or([
			{ alt: () => this.OptionalExpression(params) },
			{ alt: () => this.CallExpression(params) },
			{ alt: () => this.NewExpression(params) }
		]);
	}
	/**
	* UpdateExpression[Yield, Await] :
	*     LeftHandSideExpression[?Yield, ?Await]
	*     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
	*     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
	*     ++ UnaryExpression[?Yield, ?Await]
	*     -- UnaryExpression[?Yield, ?Await]
	*/
	@SubhutiRule UpdateExpression(params = {}) {
		return this.Or([
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.assertNoLineBreak();
				this.tokenConsumer.Increment();
			} },
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.assertNoLineBreak();
				this.tokenConsumer.Decrement();
			} },
			{ alt: () => {
				this.tokenConsumer.Increment();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Decrement();
				this.UnaryExpression(params);
			} },
			{ alt: () => this.LeftHandSideExpression(params) }
		]);
	}
	/**
	* UnaryExpression[Yield, Await] :
	*     UpdateExpression[?Yield, ?Await]
	*     delete UnaryExpression[?Yield, ?Await]
	*     void UnaryExpression[?Yield, ?Await]
	*     typeof UnaryExpression[?Yield, ?Await]
	*     + UnaryExpression[?Yield, ?Await]
	*     - UnaryExpression[?Yield, ?Await]
	*     ~ UnaryExpression[?Yield, ?Await]
	*     ! UnaryExpression[?Yield, ?Await]
	*     [+Await] AwaitExpression[?Yield]
	*/
	@SubhutiRule UnaryExpression(params = {}) {
		const { Await = false } = params;
		return this.Or([
			{ alt: () => this.UpdateExpression(params) },
			{ alt: () => {
				this.tokenConsumer.Delete();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Void();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Typeof();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Plus();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Minus();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.BitwiseNot();
				this.UnaryExpression(params);
			} },
			{ alt: () => {
				this.tokenConsumer.LogicalNot();
				this.UnaryExpression(params);
			} },
			...Await ? [{ alt: () => this.AwaitExpression(params) }] : []
		]);
	}
	/**
	* AwaitExpression[Yield] :
	*     await UnaryExpression[?Yield, +Await]
	*/
	@SubhutiRule AwaitExpression(params = {}) {
		this.tokenConsumer.Await();
		return this.UnaryExpression({
			...params,
			Await: true
		});
	}
	/**
	* ExponentiationExpression[Yield, Await] :
	*     UnaryExpression[?Yield, ?Await]
	*     UpdateExpression[?Yield, ?Await] ** ExponentiationExpression[?Yield, ?Await]
	*/
	@SubhutiRule ExponentiationExpression(params = {}) {
		return this.Or([{ alt: () => {
			this.UpdateExpression(params);
			this.tokenConsumer.Exponentiation();
			this.ExponentiationExpression(params);
		} }, { alt: () => this.UnaryExpression(params) }]);
	}
	/**
	* MultiplicativeExpression[Yield, Await] :
	*     ExponentiationExpression[?Yield, ?Await]
	*     MultiplicativeExpression[?Yield, ?Await] MultiplicativeOperator ExponentiationExpression[?Yield, ?Await]
	*/
	@SubhutiRule MultiplicativeExpression(params = {}) {
		this.ExponentiationExpression(params);
		this.Many(() => {
			this.MultiplicativeOperator();
			this.ExponentiationExpression(params);
		});
		return this.curCst;
	}
	/**
	* MultiplicativeOperator : one of
	*     * / %
	*/
	@SubhutiRule MultiplicativeOperator() {
		return this.Or([
			{ alt: () => this.tokenConsumer.Asterisk() },
			{ alt: () => this.tokenConsumer.Slash() },
			{ alt: () => this.tokenConsumer.Modulo() }
		]);
	}
	/**
	* AdditiveExpression[Yield, Await] :
	*     MultiplicativeExpression[?Yield, ?Await]
	*     AdditiveExpression[?Yield, ?Await] + MultiplicativeExpression[?Yield, ?Await]
	*     AdditiveExpression[?Yield, ?Await] - MultiplicativeExpression[?Yield, ?Await]
	*/
	@SubhutiRule AdditiveExpression(params = {}) {
		this.MultiplicativeExpression(params);
		this.Many(() => {
			this.Or([{ alt: () => this.tokenConsumer.Plus() }, { alt: () => this.tokenConsumer.Minus() }]);
			this.MultiplicativeExpression(params);
		});
		return this.curCst;
	}
	/**
	* ShiftExpression[Yield, Await] :
	*     AdditiveExpression[?Yield, ?Await]
	*     ShiftExpression[?Yield, ?Await] << AdditiveExpression[?Yield, ?Await]
	*     ShiftExpression[?Yield, ?Await] >> AdditiveExpression[?Yield, ?Await]
	*     ShiftExpression[?Yield, ?Await] >>> AdditiveExpression[?Yield, ?Await]
	*/
	@SubhutiRule ShiftExpression(params = {}) {
		this.AdditiveExpression(params);
		this.Many(() => {
			this.Or([
				{ alt: () => this.tokenConsumer.LeftShift() },
				{ alt: () => this.tokenConsumer.RightShift() },
				{ alt: () => this.tokenConsumer.UnsignedRightShift() }
			]);
			this.AdditiveExpression(params);
		});
		return this.curCst;
	}
	/**
	* RelationalExpression[In, Yield, Await] :
	*     ShiftExpression[?Yield, ?Await]
	*     RelationalExpression[?In, ?Yield, ?Await] < ShiftExpression[?Yield, ?Await]
	*     RelationalExpression[?In, ?Yield, ?Await] > ShiftExpression[?Yield, ?Await]
	*     RelationalExpression[?In, ?Yield, ?Await] <= ShiftExpression[?Yield, ?Await]
	*     RelationalExpression[?In, ?Yield, ?Await] >= ShiftExpression[?Yield, ?Await]
	*     RelationalExpression[?In, ?Yield, ?Await] instanceof ShiftExpression[?Yield, ?Await]
	*     [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
	*     [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]
	*/
	@SubhutiRule RelationalExpression(params = {}) {
		const { In = false } = params;
		if (In && this.lookahead(SlimeTokenType.PrivateIdentifier, 1)) {
			this.tokenConsumer.PrivateIdentifier();
			this.tokenConsumer.In();
			this.ShiftExpression(params);
			return this.curCst;
		}
		this.ShiftExpression(params);
		this.Many(() => {
			this.Or([
				{ alt: () => this.tokenConsumer.Less() },
				{ alt: () => this.tokenConsumer.Greater() },
				{ alt: () => this.tokenConsumer.LessEqual() },
				{ alt: () => this.tokenConsumer.GreaterEqual() },
				{ alt: () => this.tokenConsumer.Instanceof() },
				...In ? [{ alt: () => this.tokenConsumer.In() }] : []
			]);
			this.ShiftExpression(params);
		});
		return this.curCst;
	}
	/**
	* EqualityExpression[In, Yield, Await] :
	*     RelationalExpression[?In, ?Yield, ?Await]
	*     EqualityExpression[?In, ?Yield, ?Await] == RelationalExpression[?In, ?Yield, ?Await]
	*     EqualityExpression[?In, ?Yield, ?Await] != RelationalExpression[?In, ?Yield, ?Await]
	*     EqualityExpression[?In, ?Yield, ?Await] === RelationalExpression[?In, ?Yield, ?Await]
	*     EqualityExpression[?In, ?Yield, ?Await] !== RelationalExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule EqualityExpression(params = {}) {
		this.RelationalExpression(params);
		this.Many(() => {
			this.Or([
				{ alt: () => this.tokenConsumer.StrictEqual() },
				{ alt: () => this.tokenConsumer.StrictNotEqual() },
				{ alt: () => this.tokenConsumer.Equal() },
				{ alt: () => this.tokenConsumer.NotEqual() }
			]);
			this.RelationalExpression(params);
		});
		return this.curCst;
	}
	/**
	* BitwiseANDExpression[In, Yield, Await] :
	*     EqualityExpression[?In, ?Yield, ?Await]
	*     BitwiseANDExpression[?In, ?Yield, ?Await] & EqualityExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule BitwiseANDExpression(params = {}) {
		this.EqualityExpression(params);
		this.Many(() => {
			this.tokenConsumer.BitwiseAnd();
			this.EqualityExpression(params);
		});
		return this.curCst;
	}
	/**
	* BitwiseXORExpression[In, Yield, Await] :
	*     BitwiseANDExpression[?In, ?Yield, ?Await]
	*     BitwiseXORExpression[?In, ?Yield, ?Await] ^ BitwiseANDExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule BitwiseXORExpression(params = {}) {
		this.BitwiseANDExpression(params);
		this.Many(() => {
			this.tokenConsumer.BitwiseXor();
			this.BitwiseANDExpression(params);
		});
		return this.curCst;
	}
	/**
	* BitwiseORExpression[In, Yield, Await] :
	*     BitwiseXORExpression[?In, ?Yield, ?Await]
	*     BitwiseORExpression[?In, ?Yield, ?Await] | BitwiseXORExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule BitwiseORExpression(params = {}) {
		this.BitwiseXORExpression(params);
		this.Many(() => {
			this.tokenConsumer.BitwiseOr();
			this.BitwiseXORExpression(params);
		});
		return this.curCst;
	}
	/**
	* LogicalANDExpression[In, Yield, Await] :
	*     BitwiseORExpression[?In, ?Yield, ?Await]
	*     LogicalANDExpression[?In, ?Yield, ?Await] && BitwiseORExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule LogicalANDExpression(params = {}) {
		this.BitwiseORExpression(params);
		this.Many(() => {
			this.tokenConsumer.LogicalAnd();
			this.BitwiseORExpression(params);
		});
		return this.curCst;
	}
	/**
	* LogicalORExpression[In, Yield, Await] :
	*     LogicalANDExpression[?In, ?Yield, ?Await]
	*     LogicalORExpression[?In, ?Yield, ?Await] || LogicalANDExpression[?In, ?Yield, ?Await]
	*
	* ⚠️ PEG 改写说明：
	*
	* LogicalORExpression 和 CoalesceExpression 共享 BitwiseORExpression 作为基础。
	* 在 PEG 有序选择中，如果先尝试 LogicalORExpression，它会成功匹配基础表达式后返回，
	* 导致后续的 ?? 运算符无法被 CoalesceExpression 处理。
	*
	* 解决方案：将两者的功能合并到 ShortCircuitExpression 中：
	*   1. 先解析公共基础（LogicalANDExpression）
	*   2. 根据后续 token（|| 或 ??）决定走哪条路径
	*
	* 此规则的功能已被 ShortCircuitExpression + LogicalORExpressionTail 吸收。
	*/
	@SubhutiRule LogicalORExpression(params = {}) {
		throw new Error("LogicalORExpression 在 PEG 实现中已被 ShortCircuitExpression 吸收，不应直接调用");
	}
	/**
	* LogicalORExpressionTail - LogicalORExpression 的后续部分
	*
	* 对应规范：( || LogicalANDExpression )+
	* 注意：基础表达式已在 ShortCircuitExpression 中解析
	*/
	@SubhutiRule LogicalORExpressionTail(params = {}) {
		return this.AtLeastOne(() => {
			this.tokenConsumer.LogicalOr();
			this.LogicalANDExpression(params);
		});
	}
	/**
	* CoalesceExpression[In, Yield, Await] :
	*     CoalesceExpressionHead[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]
	*
	* ⚠️ PEG 改写说明：
	*
	* 与 LogicalORExpression 相同，此规则的功能已被 ShortCircuitExpression 吸收。
	* 参见 LogicalORExpression 的注释。
	*/
	@SubhutiRule CoalesceExpression(params = {}) {
		throw new Error("CoalesceExpression 在 PEG 实现中已被 ShortCircuitExpression 吸收，不应直接调用");
	}
	/**
	* CoalesceExpressionTail - CoalesceExpression 的后续部分
	*
	* 对应规范：( ?? BitwiseORExpression )+
	* 注意：基础表达式已在 ShortCircuitExpression 中解析
	*/
	@SubhutiRule CoalesceExpressionTail(params = {}) {
		return this.AtLeastOne(() => {
			this.tokenConsumer.NullishCoalescing();
			this.BitwiseORExpression(params);
		});
	}
	/**
	* CoalesceExpressionHead[In, Yield, Await] :
	*     CoalesceExpression[?In, ?Yield, ?Await]
	*     BitwiseORExpression[?In, ?Yield, ?Await]
	*
	* ⚠️ PEG 改写说明：
	* 此规则用于规范中的左递归表达，在 PEG 实现中已被吸收。
	*/
	@SubhutiRule CoalesceExpressionHead(params = {}) {
		throw new Error("CoalesceExpressionHead 在 PEG 实现中已被吸收，不应直接调用");
	}
	/**
	* ShortCircuitExpression[In, Yield, Await] :
	*     LogicalORExpression[?In, ?Yield, ?Await]
	*     CoalesceExpression[?In, ?Yield, ?Await]
	*
	* ⚠️ PEG 改写说明：
	*
	* LogicalORExpression 和 CoalesceExpression 共享公共前缀（BitwiseORExpression）。
	* 在 PEG 有序选择中，必须先解析公共部分，再根据后续 token 分发：
	*
	* 改写结构：
	*   ShortCircuitExpression → LogicalANDExpression ShortCircuitExpressionTail?
	*   ShortCircuitExpressionTail → LogicalORExpressionTail | CoalesceExpressionTail
	*   LogicalORExpressionTail → ( || LogicalANDExpression )+
	*   CoalesceExpressionTail → ( ?? BitwiseORExpression )+
	*/
	@SubhutiRule ShortCircuitExpression(params = {}) {
		this.LogicalANDExpression(params);
		this.Option(() => this.ShortCircuitExpressionTail(params));
		return this.curCst;
	}
	/**
	* ShortCircuitExpressionTail - 短路表达式的尾部分发
	*
	* 根据后续 token（|| 或 ??）决定走 LogicalOR 还是 Coalesce 路径
	*/
	@SubhutiRule ShortCircuitExpressionTail(params = {}) {
		return this.Or([{ alt: () => this.LogicalORExpressionTail(params) }, { alt: () => this.CoalesceExpressionTail(params) }]);
	}
	/**
	* ConditionalExpression[In, Yield, Await] :
	*     ShortCircuitExpression[?In, ?Yield, ?Await]
	*     ShortCircuitExpression[?In, ?Yield, ?Await] ? AssignmentExpression[+In, ?Yield, ?Await] : AssignmentExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule ConditionalExpression(params = {}) {
		return this.Or([{ alt: () => {
			this.ShortCircuitExpression(params);
			this.tokenConsumer.Question();
			this.AssignmentExpression({
				...params,
				In: true
			});
			this.tokenConsumer.Colon();
			this.AssignmentExpression(params);
		} }, { alt: () => this.ShortCircuitExpression(params) }]);
	}
	/**
	* AssignmentExpression[In, Yield, Await] :
	*     ConditionalExpression[?In, ?Yield, ?Await]
	*     [+Yield] YieldExpression[?In, ?Await]
	*     ArrowFunction[?In, ?Yield, ?Await]
	*     AsyncArrowFunction[?In, ?Yield, ?Await]
	*     LeftHandSideExpression[?Yield, ?Await] = AssignmentExpression[?In, ?Yield, ?Await]
	*     LeftHandSideExpression[?Yield, ?Await] AssignmentOperator AssignmentExpression[?In, ?Yield, ?Await]
	*     LeftHandSideExpression[?Yield, ?Await] &&= AssignmentExpression[?In, ?Yield, ?Await]
	*     LeftHandSideExpression[?Yield, ?Await] ||= AssignmentExpression[?In, ?Yield, ?Await]
	*     LeftHandSideExpression[?Yield, ?Await] ??= AssignmentExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule AssignmentExpression(params = {}) {
		const { Yield = false } = params;
		return this.Or([
			{ alt: () => this.ArrowFunction(params) },
			{ alt: () => this.AsyncArrowFunction(params) },
			...Yield ? [{ alt: () => this.YieldExpression(params) }] : [],
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.tokenConsumer.Assign();
				this.AssignmentExpression(params);
			} },
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.AssignmentOperator();
				this.AssignmentExpression(params);
			} },
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.tokenConsumer.LogicalAndAssign();
				this.AssignmentExpression(params);
			} },
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.tokenConsumer.LogicalOrAssign();
				this.AssignmentExpression(params);
			} },
			{ alt: () => {
				this.LeftHandSideExpression(params);
				this.tokenConsumer.NullishCoalescingAssign();
				this.AssignmentExpression(params);
			} },
			{ alt: () => this.ConditionalExpression(params) }
		]);
	}
	/**
	* AssignmentOperator : one of
	*     *= /= %= += -= <<= >>= >>>= &= ^= |= **=
	*/
	@SubhutiRule AssignmentOperator() {
		return this.Or([
			{ alt: () => this.tokenConsumer.MultiplyAssign() },
			{ alt: () => this.tokenConsumer.DivideAssign() },
			{ alt: () => this.tokenConsumer.ModuloAssign() },
			{ alt: () => this.tokenConsumer.PlusAssign() },
			{ alt: () => this.tokenConsumer.MinusAssign() },
			{ alt: () => this.tokenConsumer.LeftShiftAssign() },
			{ alt: () => this.tokenConsumer.RightShiftAssign() },
			{ alt: () => this.tokenConsumer.UnsignedRightShiftAssign() },
			{ alt: () => this.tokenConsumer.BitwiseAndAssign() },
			{ alt: () => this.tokenConsumer.BitwiseXorAssign() },
			{ alt: () => this.tokenConsumer.BitwiseOrAssign() },
			{ alt: () => this.tokenConsumer.ExponentiationAssign() }
		]);
	}
	/**
	* Expression[In, Yield, Await] :
	*     AssignmentExpression[?In, ?Yield, ?Await]
	*     Expression[?In, ?Yield, ?Await] , AssignmentExpression[?In, ?Yield, ?Await]
	*/
	@SubhutiRule Expression(params = {}) {
		this.AssignmentExpression(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.AssignmentExpression(params);
		});
		return this.curCst;
	}
	/**
	* Statement[Yield, Await, Return] :
	*     BlockStatement[?Yield, ?Await, ?Return]
	*     VariableStatement[?Yield, ?Await]
	*     EmptyStatement
	*     ExpressionStatement[?Yield, ?Await]
	*     IfStatement[?Yield, ?Await, ?Return]
	*     BreakableStatement[?Yield, ?Await, ?Return]
	*     ContinueStatement[?Yield, ?Await]
	*     BreakStatement[?Yield, ?Await]
	*     [+Return] ReturnStatement[?Yield, ?Await]
	*     WithStatement[?Yield, ?Await, ?Return]
	*     LabelledStatement[?Yield, ?Await, ?Return]
	*     ThrowStatement[?Yield, ?Await]
	*     TryStatement[?Yield, ?Await, ?Return]
	*     DebuggerStatement
	*/
	@SubhutiRule Statement(params = {}) {
		const { Return = false } = params;
		return this.Or([
			{ alt: () => this.BlockStatement(params) },
			{ alt: () => this.VariableStatement(params) },
			{ alt: () => this.EmptyStatement() },
			{ alt: () => this.ExpressionStatement(params) },
			{ alt: () => this.IfStatement(params) },
			{ alt: () => this.BreakableStatement(params) },
			{ alt: () => this.ContinueStatement(params) },
			{ alt: () => this.BreakStatement(params) },
			...Return ? [{ alt: () => this.ReturnStatement(params) }] : [],
			{ alt: () => this.WithStatement(params) },
			{ alt: () => this.LabelledStatement(params) },
			{ alt: () => this.ThrowStatement(params) },
			{ alt: () => this.TryStatement(params) },
			{ alt: () => this.DebuggerStatement() }
		]);
	}
	/**
	* Declaration[Yield, Await] :
	*     HoistableDeclaration[?Yield, ?Await, ~Default]
	*     ClassDeclaration[?Yield, ?Await, ~Default]
	*     LexicalDeclaration[+In, ?Yield, ?Await]
	*/
	@SubhutiRule Declaration(params = {}) {
		return this.Or([
			{ alt: () => this.HoistableDeclaration({
				...params,
				Default: false
			}) },
			{ alt: () => this.ClassDeclaration({
				...params,
				Default: false
			}) },
			{ alt: () => this.LexicalDeclaration({
				...params,
				In: true
			}) }
		]);
	}
	/**
	* HoistableDeclaration[Yield, Await, Default] :
	*     FunctionDeclaration[?Yield, ?Await, ?Default]
	*     GeneratorDeclaration[?Yield, ?Await, ?Default]
	*     AsyncFunctionDeclaration[?Yield, ?Await, ?Default]
	*     AsyncGeneratorDeclaration[?Yield, ?Await, ?Default]
	*/
	@SubhutiRule HoistableDeclaration(params = {}) {
		return this.Or([
			{ alt: () => this.FunctionDeclaration(params) },
			{ alt: () => this.GeneratorDeclaration(params) },
			{ alt: () => this.AsyncFunctionDeclaration(params) },
			{ alt: () => this.AsyncGeneratorDeclaration(params) }
		]);
	}
	/**
	* BreakableStatement[Yield, Await, Return] :
	*     IterationStatement[?Yield, ?Await, ?Return]
	*     SwitchStatement[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule BreakableStatement(params = {}) {
		return this.Or([{ alt: () => this.IterationStatement(params) }, { alt: () => this.SwitchStatement(params) }]);
	}
	/**
	* BlockStatement[Yield, Await, Return] :
	*     Block[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule BlockStatement(params = {}) {
		return this.Block(params);
	}
	/**
	* Block[Yield, Await, Return] :
	*     { StatementList[?Yield, ?Await, ?Return]_opt }
	*/
	@SubhutiRule Block(params = {}) {
		this.tokenConsumer.LBrace();
		this.Option(() => this.StatementList(params));
		return this.tokenConsumer.RBrace();
	}
	/**
	* StatementList[Yield, Await, Return] :
	*     StatementListItem[?Yield, ?Await, ?Return]
	*     StatementList[?Yield, ?Await, ?Return] StatementListItem[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule StatementList(params = {}) {
		if (this.errorRecoveryMode) this.ManyWithRecovery(() => this.StatementListItem(params));
		else this.Many(() => this.StatementListItem(params));
		return this.curCst;
	}
	/**
	* StatementListItem[Yield, Await, Return] :
	*     Statement[?Yield, ?Await, ?Return]
	*     Declaration[?Yield, ?Await]
	*
	* PEG 实现注意：Declaration 必须在 Statement 之前尝试
	* 原因：let 是软关键字，在 ExpressionStatement 中会被当作标识符消费
	* 如果先尝试 Statement，`let { a } = 1` 会被错误解析为表达式语句
	*/
	@SubhutiRule StatementListItem(params = {}) {
		return this.Or([{ alt: () => this.Declaration(params) }, { alt: () => this.Statement(params) }]);
	}
	/**
	* LexicalDeclaration[In, Yield, Await] :
	*     LetOrConst BindingList[?In, ?Yield, ?Await] ;
	*/
	@SubhutiRule LexicalDeclaration(params = {}) {
		this.LetOrConst();
		this.BindingList(params);
		return this.SemicolonASI();
	}
	/**
	* LetOrConst :
	*     let
	*     const
	*/
	@SubhutiRule LetOrConst() {
		return this.Or([{ alt: () => this.tokenConsumer.Let() }, { alt: () => this.tokenConsumer.Const() }]);
	}
	/**
	* BindingList[In, Yield, Await] :
	*     LexicalBinding[?In, ?Yield, ?Await]
	*     BindingList[?In, ?Yield, ?Await] , LexicalBinding[?In, ?Yield, ?Await]
	*/
	@SubhutiRule BindingList(params = {}) {
		this.LexicalBinding(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.LexicalBinding(params);
		});
		return this.curCst;
	}
	/**
	* LexicalBinding[In, Yield, Await] :
	*     BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
	*     BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
	*/
	@SubhutiRule LexicalBinding(params = {}) {
		return this.Or([{ alt: () => {
			this.BindingIdentifier(params);
			this.Option(() => this.Initializer(params));
		} }, { alt: () => {
			this.BindingPattern(params);
			this.Initializer(params);
		} }]);
	}
	/**
	* VariableStatement[Yield, Await] :
	*     var VariableDeclarationList[+In, ?Yield, ?Await] ;
	*/
	@SubhutiRule VariableStatement(params = {}) {
		this.tokenConsumer.Var();
		this.VariableDeclarationList({
			...params,
			In: true
		});
		return this.SemicolonASI();
	}
	/**
	* VariableDeclarationList[In, Yield, Await] :
	*     VariableDeclaration[?In, ?Yield, ?Await]
	*     VariableDeclarationList[?In, ?Yield, ?Await] , VariableDeclaration[?In, ?Yield, ?Await]
	*/
	@SubhutiRule VariableDeclarationList(params = {}) {
		this.VariableDeclaration(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.VariableDeclaration(params);
		});
		return this.curCst;
	}
	/**
	* VariableDeclaration[In, Yield, Await] :
	*     BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
	*     BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
	*/
	@SubhutiRule VariableDeclaration(params = {}) {
		return this.Or([{ alt: () => {
			this.BindingIdentifier(params);
			this.Option(() => this.Initializer(params));
		} }, { alt: () => {
			this.BindingPattern(params);
			this.Initializer(params);
		} }]);
	}
	/**
	* BindingPattern[Yield, Await] :
	*     ObjectBindingPattern[?Yield, ?Await]
	*     ArrayBindingPattern[?Yield, ?Await]
	*/
	@SubhutiRule BindingPattern(params = {}) {
		return this.Or([{ alt: () => this.ObjectBindingPattern(params) }, { alt: () => this.ArrayBindingPattern(params) }]);
	}
	/**
	* ObjectBindingPattern[Yield, Await] :
	*     { }
	*     { BindingRestProperty[?Yield, ?Await] }
	*     { BindingPropertyList[?Yield, ?Await] }
	*     { BindingPropertyList[?Yield, ?Await] , BindingRestProperty[?Yield, ?Await]_opt }
	*/
	@SubhutiRule ObjectBindingPattern(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.BindingRestProperty(params);
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.BindingPropertyList(params);
				this.tokenConsumer.Comma();
				this.Option(() => this.BindingRestProperty(params));
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.BindingPropertyList(params);
				this.tokenConsumer.RBrace();
			} }
		]);
	}
	/**
	* ArrayBindingPattern[Yield, Await] :
	*     [ Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
	*     [ BindingElementList[?Yield, ?Await] ]
	*     [ BindingElementList[?Yield, ?Await] , Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
	*/
	@SubhutiRule ArrayBindingPattern(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.Option(() => this.Elision());
				this.Option(() => this.BindingRestElement(params));
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.BindingElementList(params);
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.BindingElementList(params);
				this.tokenConsumer.Comma();
				this.Option(() => this.Elision());
				this.Option(() => this.BindingRestElement(params));
				this.tokenConsumer.RBracket();
			} }
		]);
	}
	/**
	* BindingRestProperty[Yield, Await] :
	*     ... BindingIdentifier[?Yield, ?Await]
	*/
	@SubhutiRule BindingRestProperty(params = {}) {
		this.tokenConsumer.Ellipsis();
		return this.BindingIdentifier(params);
	}
	/**
	* BindingPropertyList[Yield, Await] :
	*     BindingProperty[?Yield, ?Await]
	*     BindingPropertyList[?Yield, ?Await] , BindingProperty[?Yield, ?Await]
	*/
	@SubhutiRule BindingPropertyList(params = {}) {
		this.BindingProperty(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.BindingProperty(params);
		});
		return this.curCst;
	}
	/**
	* BindingElementList[Yield, Await] :
	*     BindingElisionElement[?Yield, ?Await]
	*     BindingElementList[?Yield, ?Await] , BindingElisionElement[?Yield, ?Await]
	*/
	@SubhutiRule BindingElementList(params = {}) {
		this.BindingElisionElement(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.BindingElisionElement(params);
		});
		return this.curCst;
	}
	/**
	* BindingElisionElement[Yield, Await] :
	*     Elision_opt BindingElement[?Yield, ?Await]
	*/
	@SubhutiRule BindingElisionElement(params = {}) {
		this.Option(() => this.Elision());
		return this.BindingElement(params);
	}
	/**
	* BindingProperty[Yield, Await] :
	*     SingleNameBinding[?Yield, ?Await]
	*     PropertyName[?Yield, ?Await] : BindingElement[?Yield, ?Await]
	*/
	@SubhutiRule BindingProperty(params = {}) {
		return this.Or([{ alt: () => {
			this.PropertyName(params);
			this.tokenConsumer.Colon();
			this.BindingElement(params);
		} }, { alt: () => this.SingleNameBinding(params) }]);
	}
	/**
	* BindingElement[Yield, Await] :
	*     SingleNameBinding[?Yield, ?Await]
	*     BindingPattern[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
	*/
	@SubhutiRule BindingElement(params = {}) {
		return this.Or([{ alt: () => this.SingleNameBinding(params) }, { alt: () => {
			this.BindingPattern(params);
			this.Option(() => this.Initializer({
				...params,
				In: true
			}));
		} }]);
	}
	/**
	* SingleNameBinding[Yield, Await] :
	*     BindingIdentifier[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
	*/
	@SubhutiRule SingleNameBinding(params = {}) {
		this.BindingIdentifier(params);
		this.Option(() => this.Initializer({
			...params,
			In: true
		}));
		return this.curCst;
	}
	/**
	* BindingRestElement[Yield, Await] :
	*     ... BindingIdentifier[?Yield, ?Await]
	*     ... BindingPattern[?Yield, ?Await]
	*/
	@SubhutiRule BindingRestElement(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Ellipsis();
			this.BindingIdentifier(params);
		} }, { alt: () => {
			this.tokenConsumer.Ellipsis();
			this.BindingPattern(params);
		} }]);
	}
	/**
	* Automatic Semicolon Insertion (ASI)
	*
	* ECMAScript 规范 11.9: Automatic Semicolon Insertion
	*
	* 在以下情况下允许省略分号（自动插入）：
	* 1. 遇到换行符（Line Terminator）
	* 2. 遇到文件结束符（EOF）
	* 3. 遇到右大括号 }
	*
	* 实现方式：
	* - 如果有显式分号，消费它
	* - 否则检查是否满足 ASI 条件
	* - 如果不满足 ASI 条件，则失败
	*/
	@SubhutiRule SemicolonASI() {
		if (this.match(SlimeTokenType.Semicolon)) {
			this.tokenConsumer.Semicolon();
			return this.curCst;
		}
		if (!this.canAutoInsertSemicolon()) return this.setParseFail();
		return this.curCst;
	}
	/**
	* 检查是否可以自动插入分号
	*
	* ASI 条件：
	* 1. 当前 token 前有换行符
	* 2. 当前 token 是 }
	* 3. 已到达文件末尾（EOF）
	*/
	canAutoInsertSemicolon() {
		if (this.isEof) return true;
		if (!this.curToken) return true;
		if (this.curToken.hasLineBreakBefore) return true;
		if (this.match(SlimeTokenType.RBrace)) return true;
		return false;
	}
	/**
	* EmptyStatement :
	*     ;
	*/
	@SubhutiRule EmptyStatement() {
		return this.tokenConsumer.Semicolon();
	}
	/**
	* ExpressionStatement[Yield, Await] :
	*     [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
	*     Expression[+In, ?Yield, ?Await] ;
	*/
	@SubhutiRule ExpressionStatement(params = {}) {
		this.assertLookaheadNotIn([
			SlimeTokenType.LBrace,
			SlimeTokenType.Function,
			SlimeTokenType.Class
		]);
		this.assertNotContextualSequenceNoLT(SlimeContextualKeywordTokenTypes$1.Async, SlimeTokenType.Function);
		this.assertNotContextualSequence(SlimeContextualKeywordTokenTypes$1.Let, SlimeTokenType.LBracket);
		this.Expression({
			...params,
			In: true
		});
		return this.SemicolonASI();
	}
	/**
	* IfStatement[Yield, Await, Return] :
	*     if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] else Statement[?Yield, ?Await, ?Return]
	*     if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] [lookahead ≠ else]
	*
	* Annex B.3.4:
	*     if ( Expression ) FunctionDeclaration else Statement
	*     if ( Expression ) Statement else FunctionDeclaration
	*     if ( Expression ) FunctionDeclaration else FunctionDeclaration
	*     if ( Expression ) FunctionDeclaration [lookahead ≠ else]
	*/
	@SubhutiRule IfStatement(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.If();
			this.tokenConsumer.LParen();
			this.Expression({
				...params,
				In: true
			});
			this.tokenConsumer.RParen();
			this.IfStatementBody(params);
			this.tokenConsumer.Else();
			this.IfStatementBody(params);
		} }, { alt: () => {
			this.tokenConsumer.If();
			this.tokenConsumer.LParen();
			this.Expression({
				...params,
				In: true
			});
			this.tokenConsumer.RParen();
			this.IfStatementBody(params);
			this.assertLookaheadNot(SlimeTokenType.Else);
		} }]);
	}
	/**
	* IfStatementBody - 辅助规则（非规范正式定义）
	*
	* ⚠️ 注意：此规则不是 ECMAScript 规范的正式语法规则，
	* 而是为了支持 Annex B.3.4（Web 兼容性附录）而添加的辅助规则。
	*
	* Annex B.3.4 规定，在非严格模式的 Web 浏览器环境中，
	* IfStatement 的 body 位置允许直接放置 FunctionDeclaration：
	*
	*   if ( Expression ) FunctionDeclaration else Statement
	*   if ( Expression ) Statement else FunctionDeclaration
	*   if ( Expression ) FunctionDeclaration else FunctionDeclaration
	*   if ( Expression ) FunctionDeclaration [lookahead ≠ else]
	*
	* 这是历史遗留行为，严格模式下不允许。
	*
	* 参考：ECMAScript 2025 Annex B.3.4 FunctionDeclarations in IfStatement Statement Clauses
	*/
	@SubhutiRule IfStatementBody(params = {}) {
		return this.Or([{ alt: () => this.Statement(params) }, { alt: () => this.FunctionDeclaration({
			...params,
			Default: false
		}) }]);
	}
	/**
	* IterationStatement[Yield, Await, Return] :
	*     DoWhileStatement[?Yield, ?Await, ?Return]
	*     WhileStatement[?Yield, ?Await, ?Return]
	*     ForStatement[?Yield, ?Await, ?Return]
	*     ForInOfStatement[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule IterationStatement(params = {}) {
		return this.Or([
			{ alt: () => this.DoWhileStatement(params) },
			{ alt: () => this.WhileStatement(params) },
			{ alt: () => this.ForStatement(params) },
			{ alt: () => this.ForInOfStatement(params) }
		]);
	}
	/**
	* DoWhileStatement[Yield, Await, Return] :
	*     do Statement[?Yield, ?Await, ?Return] while ( Expression[+In, ?Yield, ?Await] ) ;
	*
	* 注意：根据 ECMAScript 规范 11.9.1 ASI 规则：
	* "The previous token is ) and the inserted semicolon would then be parsed as
	*  the terminating semicolon of a do-while statement"
	* 因此 do-while 语句末尾的分号支持 ASI，即使下一个 token 不满足通常的 ASI 条件
	*/
	@SubhutiRule DoWhileStatement(params = {}) {
		this.tokenConsumer.Do();
		this.Statement(params);
		this.tokenConsumer.While();
		this.tokenConsumer.LParen();
		this.Expression({
			...params,
			In: true
		});
		this.tokenConsumer.RParen();
		this.Option(() => this.tokenConsumer.Semicolon());
		return this.curCst;
	}
	/**
	* WhileStatement[Yield, Await, Return] :
	*     while ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule WhileStatement(params = {}) {
		this.tokenConsumer.While();
		this.tokenConsumer.LParen();
		this.Expression({
			...params,
			In: true
		});
		this.tokenConsumer.RParen();
		return this.Statement(params);
	}
	/**
	* ForStatement[Yield, Await, Return] :
	*     for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
	*     for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
	*     for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule ForStatement(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.tokenConsumer.Var();
				this.VariableDeclarationList({
					...params,
					In: false
				});
				this.tokenConsumer.Semicolon();
				this.Option(() => this.Expression({
					...params,
					In: true
				}));
				this.tokenConsumer.Semicolon();
				this.Option(() => this.Expression({
					...params,
					In: true
				}));
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.LexicalDeclaration({
					...params,
					In: false
				});
				this.Option(() => this.Expression({
					...params,
					In: true
				}));
				this.tokenConsumer.Semicolon();
				this.Option(() => this.Expression({
					...params,
					In: true
				}));
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.assertNotContextualSequence(SlimeContextualKeywordTokenTypes$1.Let, SlimeTokenType.LBracket);
				this.Option(() => this.Expression({
					...params,
					In: false
				}));
				this.tokenConsumer.Semicolon();
				this.Option(() => this.Expression({
					...params,
					In: true
				}));
				this.tokenConsumer.Semicolon();
				this.Option(() => this.Expression({
					...params,
					In: true
				}));
				this.tokenConsumer.RParen();
				this.Statement(params);
			} }
		]);
	}
	/**
	* ForInOfStatement[Yield, Await, Return] :
	*     for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*     [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*
	* B.3.5 Initializers in ForIn Statement Heads (非严格模式扩展):
	*     for ( var BindingIdentifier[?Yield, ?Await] Initializer[~In, ?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule ForInOfStatement(params = {}) {
		const { Await = false } = params;
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.tokenConsumer.Var();
				this.BindingIdentifier(params);
				this.Initializer({
					...params,
					In: false
				});
				this.tokenConsumer.In();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.tokenConsumer.Var();
				this.ForBinding(params);
				this.tokenConsumer.In();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.assertNotContextualSequence(SlimeContextualKeywordTokenTypes$1.Let, SlimeTokenType.LBracket);
				this.LeftHandSideExpression(params);
				this.tokenConsumer.In();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.ForDeclaration(params);
				this.tokenConsumer.In();
				this.Expression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.tokenConsumer.Var();
				this.ForBinding(params);
				this.tokenConsumer.Of();
				this.AssignmentExpression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.ForDeclaration(params);
				this.tokenConsumer.Of();
				this.AssignmentExpression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.LParen();
				this.assertNotContextual(SlimeContextualKeywordTokenTypes$1.Let);
				this.assertNotContextualPair(SlimeContextualKeywordTokenTypes$1.Async, SlimeContextualKeywordTokenTypes$1.Of);
				this.LeftHandSideExpression(params);
				this.tokenConsumer.Of();
				this.AssignmentExpression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} },
			...Await ? [{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.Await();
				this.tokenConsumer.LParen();
				this.tokenConsumer.Var();
				this.ForBinding(params);
				this.tokenConsumer.Of();
				this.AssignmentExpression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} }] : [],
			...Await ? [{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.Await();
				this.tokenConsumer.LParen();
				this.ForDeclaration(params);
				this.tokenConsumer.Of();
				this.AssignmentExpression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} }] : [],
			...Await ? [{ alt: () => {
				this.tokenConsumer.For();
				this.tokenConsumer.Await();
				this.tokenConsumer.LParen();
				this.assertNotContextual(SlimeContextualKeywordTokenTypes$1.Let);
				this.LeftHandSideExpression(params);
				this.tokenConsumer.Of();
				this.AssignmentExpression({
					...params,
					In: true
				});
				this.tokenConsumer.RParen();
				this.Statement(params);
			} }] : []
		]);
	}
	/**
	* ForDeclaration[Yield, Await] :
	*     LetOrConst ForBinding[?Yield, ?Await]
	*/
	@SubhutiRule ForDeclaration(params = {}) {
		this.LetOrConst();
		return this.ForBinding(params);
	}
	/**
	* ForBinding[Yield, Await] :
	*     BindingIdentifier[?Yield, ?Await]
	*     BindingPattern[?Yield, ?Await]
	*/
	@SubhutiRule ForBinding(params = {}) {
		return this.Or([{ alt: () => this.BindingIdentifier(params) }, { alt: () => this.BindingPattern(params) }]);
	}
	/**
	* ContinueStatement[Yield, Await] :
	*     continue ;
	*     continue [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
	*/
	@SubhutiRule ContinueStatement(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Continue();
			this.assertNoLineBreak();
			this.LabelIdentifier(params);
			this.SemicolonASI();
		} }, { alt: () => {
			this.tokenConsumer.Continue();
			this.SemicolonASI();
		} }]);
	}
	/**
	* BreakStatement[Yield, Await] :
	*     break ;
	*     break [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
	*/
	@SubhutiRule BreakStatement(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Break();
			this.assertNoLineBreak();
			this.LabelIdentifier(params);
			this.SemicolonASI();
		} }, { alt: () => {
			this.tokenConsumer.Break();
			this.SemicolonASI();
		} }]);
	}
	/**
	* ReturnStatement[Yield, Await] :
	*     return ;
	*     return [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
	*/
	@SubhutiRule ReturnStatement(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Return();
			this.assertNoLineBreak();
			this.Expression({
				...params,
				In: true
			});
			this.SemicolonASI();
		} }, { alt: () => {
			this.tokenConsumer.Return();
			this.SemicolonASI();
		} }]);
	}
	/**
	* WithStatement[Yield, Await, Return] :
	*     with ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule WithStatement(params = {}) {
		this.tokenConsumer.With();
		this.tokenConsumer.LParen();
		this.Expression({
			...params,
			In: true
		});
		this.tokenConsumer.RParen();
		return this.Statement(params);
	}
	/**
	* SwitchStatement[Yield, Await, Return] :
	*     switch ( Expression[+In, ?Yield, ?Await] ) CaseBlock[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule SwitchStatement(params = {}) {
		this.tokenConsumer.Switch();
		this.tokenConsumer.LParen();
		this.Expression({
			...params,
			In: true
		});
		this.tokenConsumer.RParen();
		return this.CaseBlock(params);
	}
	/**
	* CaseBlock[Yield, Await, Return] :
	*     { CaseClauses[?Yield, ?Await, ?Return]_opt }
	*     { CaseClauses[?Yield, ?Await, ?Return]_opt DefaultClause[?Yield, ?Await, ?Return] CaseClauses[?Yield, ?Await, ?Return]_opt }
	*/
	@SubhutiRule CaseBlock(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.LBrace();
			this.Option(() => this.CaseClauses(params));
			this.DefaultClause(params);
			this.Option(() => this.CaseClauses(params));
			this.tokenConsumer.RBrace();
		} }, { alt: () => {
			this.tokenConsumer.LBrace();
			this.Option(() => this.CaseClauses(params));
			this.tokenConsumer.RBrace();
		} }]);
	}
	/**
	* CaseClauses[Yield, Await, Return] :
	*     CaseClause[?Yield, ?Await, ?Return]
	*     CaseClauses[?Yield, ?Await, ?Return] CaseClause[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule CaseClauses(params = {}) {
		this.AtLeastOne(() => this.CaseClause(params));
		return this.curCst;
	}
	/**
	* CaseClause[Yield, Await, Return] :
	*     case Expression[+In, ?Yield, ?Await] : StatementList[?Yield, ?Await, ?Return]_opt
	*/
	@SubhutiRule CaseClause(params = {}) {
		this.tokenConsumer.Case();
		this.Expression({
			...params,
			In: true
		});
		this.tokenConsumer.Colon();
		this.Option(() => this.StatementList(params));
		return this.curCst;
	}
	/**
	* DefaultClause[Yield, Await, Return] :
	*     default : StatementList[?Yield, ?Await, ?Return]_opt
	*/
	@SubhutiRule DefaultClause(params = {}) {
		this.tokenConsumer.Default();
		this.tokenConsumer.Colon();
		this.Option(() => this.StatementList(params));
		return this.curCst;
	}
	/**
	* LabelledStatement[Yield, Await, Return] :
	*     LabelIdentifier[?Yield, ?Await] : LabelledItem[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule LabelledStatement(params = {}) {
		this.LabelIdentifier(params);
		this.tokenConsumer.Colon();
		return this.LabelledItem(params);
	}
	/**
	* LabelledItem[Yield, Await, Return] :
	*     Statement[?Yield, ?Await, ?Return]
	*     FunctionDeclaration[?Yield, ?Await, ~Default]
	*/
	@SubhutiRule LabelledItem(params = {}) {
		return this.Or([{ alt: () => this.Statement(params) }, { alt: () => this.FunctionDeclaration({
			...params,
			Default: false
		}) }]);
	}
	/**
	* ThrowStatement[Yield, Await] :
	*     throw [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
	*/
	@SubhutiRule ThrowStatement(params = {}) {
		this.tokenConsumer.Throw();
		this.assertNoLineBreak();
		this.Expression({
			...params,
			In: true
		});
		return this.SemicolonASI();
	}
	/**
	* TryStatement[Yield, Await, Return] :
	*     try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return]
	*     try Block[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
	*     try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule TryStatement(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.Try();
				this.Block(params);
				this.Catch(params);
				this.Finally(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Try();
				this.Block(params);
				this.Catch(params);
			} },
			{ alt: () => {
				this.tokenConsumer.Try();
				this.Block(params);
				this.Finally(params);
			} }
		]);
	}
	/**
	* Catch[Yield, Await, Return] :
	*     catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
	*     catch Block[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule Catch(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Catch();
			this.tokenConsumer.LParen();
			this.CatchParameter(params);
			this.tokenConsumer.RParen();
			this.Block(params);
		} }, { alt: () => {
			this.tokenConsumer.Catch();
			this.Block(params);
		} }]);
	}
	/**
	* Finally[Yield, Await, Return] :
	*     finally Block[?Yield, ?Await, ?Return]
	*/
	@SubhutiRule Finally(params = {}) {
		this.tokenConsumer.Finally();
		return this.Block(params);
	}
	/**
	* CatchParameter[Yield, Await] :
	*     BindingIdentifier[?Yield, ?Await]
	*     BindingPattern[?Yield, ?Await]
	*/
	@SubhutiRule CatchParameter(params = {}) {
		return this.Or([{ alt: () => this.BindingIdentifier(params) }, { alt: () => this.BindingPattern(params) }]);
	}
	/**
	* DebuggerStatement :
	*     debugger ;
	*/
	@SubhutiRule DebuggerStatement() {
		this.tokenConsumer.Debugger();
		return this.SemicolonASI();
	}
	/**
	* YieldExpression[In, Await] :
	*     yield
	*     yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
	*     yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
	*/
	@SubhutiRule YieldExpression(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.Yield();
				this.assertNoLineBreak();
				this.tokenConsumer.Asterisk();
				this.AssignmentExpression({
					...params,
					Yield: true
				});
			} },
			{ alt: () => {
				this.tokenConsumer.Yield();
				this.assertNoLineBreak();
				this.AssignmentExpression({
					...params,
					Yield: true
				});
			} },
			{ alt: () => this.tokenConsumer.Yield() }
		]);
	}
	/**
	* ArrowFunction[In, Yield, Await] :
	*     ArrowParameters[?Yield, ?Await] [no LineTerminator here] => ConciseBody[?In]
	*/
	@SubhutiRule ArrowFunction(params = {}) {
		this.ArrowParameters(params);
		this.assertNoLineBreak();
		this.tokenConsumer.Arrow();
		this.ConciseBody(params);
		return this.curCst;
	}
	/**
	* ArrowParameters[Yield, Await] :
	*     BindingIdentifier[?Yield, ?Await]
	*     CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
	*/
	@SubhutiRule ArrowParameters(params = {}) {
		return this.Or([{ alt: () => this.BindingIdentifier(params) }, { alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params) }]);
	}
	/**
	* ArrowFormalParameters[Yield, Await] :
	*     ( UniqueFormalParameters[?Yield, ?Await] )
	*
	* Supplemental Syntax:
	* When processing ArrowParameters : CoverParenthesizedExpressionAndArrowParameterList,
	* the interpretation is refined using this rule.
	*
	* 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
	*/
	@SubhutiRule ArrowFormalParameters(params = {}) {
		this.tokenConsumer.LParen();
		this.UniqueFormalParameters(params);
		return this.tokenConsumer.RParen();
	}
	/**
	* ConciseBody[In] :
	*     [lookahead ≠ {] ExpressionBody[?In, ~Await]
	*     { FunctionBody[~Yield, ~Await] }
	*/
	@SubhutiRule ConciseBody(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.LBrace();
			this.FunctionBody({
				Yield: false,
				Await: false
			});
			this.tokenConsumer.RBrace();
		} }, { alt: () => {
			this.assertLookaheadNot(SlimeTokenType.LBrace);
			this.ExpressionBody({
				...params,
				Await: false
			});
		} }]);
	}
	/**
	* ExpressionBody[In, Await] :
	*     AssignmentExpression[?In, ~Yield, ?Await]
	*/
	@SubhutiRule ExpressionBody(params = {}) {
		return this.AssignmentExpression({
			...params,
			Yield: false
		});
	}
	/**
	* AsyncArrowFunction[In, Yield, Await] :
	*     async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
	*     CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]
	*/
	@SubhutiRule AsyncArrowFunction(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Async();
			this.assertNoLineBreak();
			this.AsyncArrowBindingIdentifier(params);
			this.assertNoLineBreak();
			this.tokenConsumer.Arrow();
			this.AsyncConciseBody(params);
		} }, { alt: () => {
			this.CoverCallExpressionAndAsyncArrowHead(params);
			this.assertNoLineBreak();
			this.tokenConsumer.Arrow();
			this.AsyncConciseBody(params);
		} }]);
	}
	/**
	* AsyncArrowBindingIdentifier[Yield] :
	*     BindingIdentifier[?Yield, +Await]
	*/
	@SubhutiRule AsyncArrowBindingIdentifier(params = {}) {
		return this.BindingIdentifier({
			...params,
			Await: true
		});
	}
	/**
	* AsyncConciseBody[In] :
	*     [lookahead ≠ {] ExpressionBody[?In, +Await]
	*     { AsyncFunctionBody }
	*/
	@SubhutiRule AsyncConciseBody(params = {}) {
		return this.Or([{ alt: () => {
			this.tokenConsumer.LBrace();
			this.AsyncFunctionBody();
			this.tokenConsumer.RBrace();
		} }, { alt: () => {
			this.assertLookaheadNot(SlimeTokenType.LBrace);
			this.ExpressionBody({
				...params,
				Await: true
			});
		} }]);
	}
	/**
	* AsyncArrowHead :
	*     async [no LineTerminator here] ArrowFormalParameters[~Yield, +Await]
	*
	* Supplemental Syntax:
	* When processing AsyncArrowFunction : CoverCallExpressionAndAsyncArrowHead [no LineTerminator here] => AsyncConciseBody,
	* the interpretation is refined using this rule.
	*
	* 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
	*/
	@SubhutiRule AsyncArrowHead() {
		this.tokenConsumer.Async();
		this.assertNoLineBreak();
		this.ArrowFormalParameters({
			Yield: false,
			Await: true
		});
		return this.curCst;
	}
	/**
	* UniqueFormalParameters[Yield, Await] :
	*     FormalParameters[?Yield, ?Await]
	*/
	@SubhutiRule UniqueFormalParameters(params = {}) {
		return this.FormalParameters(params);
	}
	/**
	* FormalParameters[Yield, Await] :
	*     [empty]
	*     FunctionRestParameter[?Yield, ?Await]
	*     FormalParameterList[?Yield, ?Await]
	*     FormalParameterList[?Yield, ?Await] ,
	*     FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]
	*/
	@SubhutiRule FormalParameters(params = {}) {
		return this.Or([
			{ alt: () => {
				this.FormalParameterList(params);
				this.tokenConsumer.Comma();
				this.FunctionRestParameter(params);
			} },
			{ alt: () => {
				this.FormalParameterList(params);
				this.tokenConsumer.Comma();
			} },
			{ alt: () => this.FormalParameterList(params) },
			{ alt: () => this.FunctionRestParameter(params) },
			{ alt: () => this.curCst }
		]);
	}
	/**
	* FormalParameterList[Yield, Await] :
	*     FormalParameter[?Yield, ?Await]
	*     FormalParameterList[?Yield, ?Await] , FormalParameter[?Yield, ?Await]
	*/
	@SubhutiRule FormalParameterList(params = {}) {
		this.FormalParameter(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.FormalParameter(params);
		});
		return this.curCst;
	}
	/**
	* FunctionRestParameter[Yield, Await] :
	*     BindingRestElement[?Yield, ?Await]
	*/
	@SubhutiRule FunctionRestParameter(params = {}) {
		return this.BindingRestElement(params);
	}
	/**
	* FormalParameter[Yield, Await] :
	*     BindingElement[?Yield, ?Await]
	*/
	@SubhutiRule FormalParameter(params = {}) {
		return this.BindingElement(params);
	}
	/**
	* FunctionBody[Yield, Await] :
	*     FunctionStatementList[?Yield, ?Await]
	*/
	@SubhutiRule FunctionBody(params = {}) {
		return this.FunctionStatementList(params);
	}
	/**
	* FunctionStatementList[Yield, Await] :
	*     StatementList[?Yield, ?Await, +Return]_opt
	*/
	@SubhutiRule FunctionStatementList(params = {}) {
		const statementParams = {
			Yield: params.Yield,
			Await: params.Await,
			Return: true
		};
		this.Option(() => this.StatementList(statementParams));
		return this.curCst;
	}
	/**
	* FunctionExpression :
	*     function BindingIdentifier[~Yield, ~Await]_opt ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
	*/
	@SubhutiRule FunctionExpression() {
		this.tokenConsumer.Function();
		this.Option(() => this.BindingIdentifier({
			Yield: false,
			Await: false
		}));
		this.tokenConsumer.LParen();
		this.FormalParameters({
			Yield: false,
			Await: false
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.FunctionBody({
			Yield: false,
			Await: false
		});
		return this.tokenConsumer.RBrace();
	}
	/**
	* FunctionDeclaration[Yield, Await, Default] :
	*     function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
	*     [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
	*/
	@SubhutiRule FunctionDeclaration(params = {}) {
		const { Default = false } = params;
		return this.Or([{ alt: () => {
			this.tokenConsumer.Function();
			this.BindingIdentifier(params);
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: false,
				Await: false
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.FunctionBody({
				Yield: false,
				Await: false
			});
			this.tokenConsumer.RBrace();
		} }, ...Default ? [{ alt: () => {
			this.tokenConsumer.Function();
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: false,
				Await: false
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.FunctionBody({
				Yield: false,
				Await: false
			});
			this.tokenConsumer.RBrace();
		} }] : []]);
	}
	/**
	* GeneratorDeclaration[Yield, Await, Default] :
	*     function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
	*     [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
	*/
	@SubhutiRule GeneratorDeclaration(params = {}) {
		const { Default = false } = params;
		return this.Or([{ alt: () => {
			this.tokenConsumer.Function();
			this.tokenConsumer.Asterisk();
			this.BindingIdentifier(params);
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: true,
				Await: false
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.GeneratorBody();
			this.tokenConsumer.RBrace();
		} }, ...Default ? [{ alt: () => {
			this.tokenConsumer.Function();
			this.tokenConsumer.Asterisk();
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: true,
				Await: false
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.GeneratorBody();
			this.tokenConsumer.RBrace();
		} }] : []]);
	}
	/**
	* GeneratorExpression :
	*     function * BindingIdentifier[+Yield, ~Await]_opt ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
	*/
	@SubhutiRule GeneratorExpression() {
		this.tokenConsumer.Function();
		this.tokenConsumer.Asterisk();
		this.Option(() => this.BindingIdentifier({
			Yield: true,
			Await: false
		}));
		this.tokenConsumer.LParen();
		this.FormalParameters({
			Yield: true,
			Await: false
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.GeneratorBody();
		return this.tokenConsumer.RBrace();
	}
	/**
	* GeneratorMethod[Yield, Await] :
	*     * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, ~Await] ) { GeneratorBody }
	*/
	@SubhutiRule GeneratorMethod(params = {}) {
		this.tokenConsumer.Asterisk();
		this.ClassElementName(params);
		this.tokenConsumer.LParen();
		this.UniqueFormalParameters({
			Yield: true,
			Await: false
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.GeneratorBody();
		return this.tokenConsumer.RBrace();
	}
	/**
	* GeneratorBody :
	*     FunctionBody[+Yield, ~Await]
	*/
	@SubhutiRule GeneratorBody() {
		return this.FunctionBody({
			Yield: true,
			Await: false
		});
	}
	/**
	* AsyncFunctionDeclaration[Yield, Await, Default] :
	*     async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
	*     [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
	*/
	@SubhutiRule AsyncFunctionDeclaration(params = {}) {
		const { Default = false } = params;
		return this.Or([{ alt: () => {
			this.tokenConsumer.Async();
			this.assertNoLineBreak();
			this.tokenConsumer.Function();
			this.BindingIdentifier(params);
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: false,
				Await: true
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.AsyncFunctionBody();
			this.tokenConsumer.RBrace();
		} }, ...Default ? [{ alt: () => {
			this.tokenConsumer.Async();
			this.assertNoLineBreak();
			this.tokenConsumer.Function();
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: false,
				Await: true
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.AsyncFunctionBody();
			this.tokenConsumer.RBrace();
		} }] : []]);
	}
	/**
	* AsyncFunctionExpression :
	*     async [no LineTerminator here] function BindingIdentifier[~Yield, +Await]_opt ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
	*/
	@SubhutiRule AsyncFunctionExpression() {
		this.tokenConsumer.Async();
		this.assertNoLineBreak();
		this.tokenConsumer.Function();
		this.Option(() => this.BindingIdentifier({
			Yield: false,
			Await: true
		}));
		this.tokenConsumer.LParen();
		this.FormalParameters({
			Yield: false,
			Await: true
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.AsyncFunctionBody();
		this.tokenConsumer.RBrace();
		return this.curCst;
	}
	/**
	* AsyncMethod[Yield, Await] :
	*     async [no LineTerminator here] ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
	*/
	@SubhutiRule AsyncMethod(params = {}) {
		this.tokenConsumer.Async();
		this.assertNoLineBreak();
		this.ClassElementName(params);
		this.tokenConsumer.LParen();
		this.UniqueFormalParameters({
			Yield: false,
			Await: true
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.AsyncFunctionBody();
		this.tokenConsumer.RBrace();
		return this.curCst;
	}
	/**
	* AsyncFunctionBody :
	*     FunctionBody[~Yield, +Await]
	*/
	@SubhutiRule AsyncFunctionBody() {
		return this.FunctionBody({
			Yield: false,
			Await: true
		});
	}
	/**
	* AsyncGeneratorDeclaration[Yield, Await, Default] :
	*     async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
	*     [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
	*/
	@SubhutiRule AsyncGeneratorDeclaration(params = {}) {
		const { Default = false } = params;
		return this.Or([{ alt: () => {
			this.tokenConsumer.Async();
			this.assertNoLineBreak();
			this.tokenConsumer.Function();
			this.tokenConsumer.Asterisk();
			this.BindingIdentifier(params);
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: true,
				Await: true
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.AsyncGeneratorBody();
			this.tokenConsumer.RBrace();
		} }, ...Default ? [{ alt: () => {
			this.tokenConsumer.Async();
			this.assertNoLineBreak();
			this.tokenConsumer.Function();
			this.tokenConsumer.Asterisk();
			this.tokenConsumer.LParen();
			this.FormalParameters({
				Yield: true,
				Await: true
			});
			this.tokenConsumer.RParen();
			this.tokenConsumer.LBrace();
			this.AsyncGeneratorBody();
			this.tokenConsumer.RBrace();
		} }] : []]);
	}
	/**
	* AsyncGeneratorExpression :
	*     async [no LineTerminator here] function * BindingIdentifier[+Yield, +Await]_opt ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
	*/
	@SubhutiRule AsyncGeneratorExpression() {
		this.tokenConsumer.Async();
		this.assertNoLineBreak();
		this.tokenConsumer.Function();
		this.tokenConsumer.Asterisk();
		this.Option(() => this.BindingIdentifier({
			Yield: true,
			Await: true
		}));
		this.tokenConsumer.LParen();
		this.FormalParameters({
			Yield: true,
			Await: true
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.AsyncGeneratorBody();
		this.tokenConsumer.RBrace();
		return this.curCst;
	}
	/**
	* AsyncGeneratorMethod[Yield, Await] :
	*     async [no LineTerminator here] * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
	*/
	@SubhutiRule AsyncGeneratorMethod(params = {}) {
		this.tokenConsumer.Async();
		this.assertNoLineBreak();
		this.tokenConsumer.Asterisk();
		this.ClassElementName(params);
		this.tokenConsumer.LParen();
		this.UniqueFormalParameters({
			Yield: true,
			Await: true
		});
		this.tokenConsumer.RParen();
		this.tokenConsumer.LBrace();
		this.AsyncGeneratorBody();
		this.tokenConsumer.RBrace();
		return this.curCst;
	}
	/**
	* AsyncGeneratorBody :
	*     FunctionBody[+Yield, +Await]
	*/
	@SubhutiRule AsyncGeneratorBody() {
		return this.FunctionBody({
			Yield: true,
			Await: true
		});
	}
	/**
	* MethodDefinition[Yield, Await] :
	*     ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
	*     GeneratorMethod[?Yield, ?Await]
	*     AsyncMethod[?Yield, ?Await]
	*     AsyncGeneratorMethod[?Yield, ?Await]
	*     get ClassElementName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
	*     set ClassElementName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }
	*/
	@SubhutiRule MethodDefinition(params = {}) {
		return this.Or([
			{ alt: () => this.GeneratorMethod(params) },
			{ alt: () => this.AsyncGeneratorMethod(params) },
			{ alt: () => this.AsyncMethod(params) },
			{ alt: () => {
				this.tokenConsumer.Get();
				this.ClassElementName(params);
				this.tokenConsumer.LParen();
				this.tokenConsumer.RParen();
				this.tokenConsumer.LBrace();
				this.FunctionBody({
					Yield: false,
					Await: false
				});
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.Set();
				this.ClassElementName(params);
				this.tokenConsumer.LParen();
				this.PropertySetParameterList();
				this.tokenConsumer.RParen();
				this.tokenConsumer.LBrace();
				this.FunctionBody({
					Yield: false,
					Await: false
				});
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.ClassElementName(params);
				this.tokenConsumer.LParen();
				this.UniqueFormalParameters({
					Yield: false,
					Await: false
				});
				this.tokenConsumer.RParen();
				this.tokenConsumer.LBrace();
				this.FunctionBody({
					Yield: false,
					Await: false
				});
				this.tokenConsumer.RBrace();
			} }
		]);
	}
	/**
	* PropertySetParameterList :
	*     FormalParameter[~Yield, ~Await]
	*
	* 注意：ES2025 规范中 PropertySetParameterList 直接定义为单个 FormalParameter，
	* 而不是使用 FormalParameters，这是为了强制 setter 必须恰好有一个参数。
	* 但现代引擎（V8、SpiderMonkey）和解析器（Babel、Acorn）为了与函数参数尾随逗号
	* 特性（ES2017）保持一致，都允许 setter 参数后有可选的尾随逗号。
	* 例如：set foo(a,) {} 是被接受的。
	*/
	@SubhutiRule PropertySetParameterList() {
		this.FormalParameter({
			Yield: false,
			Await: false
		});
		this.Option(() => this.tokenConsumer.Comma());
		return this.curCst;
	}
	/**
	* ClassDeclaration[Yield, Await, Default] :
	*     class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
	*     [+Default] class ClassTail[?Yield, ?Await]
	*/
	@SubhutiRule ClassDeclaration(params = {}) {
		const { Default = false } = params;
		return this.Or([{ alt: () => {
			this.tokenConsumer.Class();
			this.BindingIdentifier(params);
			this.ClassTail(params);
		} }, ...Default ? [{ alt: () => {
			this.tokenConsumer.Class();
			this.ClassTail(params);
		} }] : []]);
	}
	/**
	* ClassExpression[Yield, Await] :
	*     class BindingIdentifier[?Yield, ?Await]_opt ClassTail[?Yield, ?Await]
	*/
	@SubhutiRule ClassExpression(params = {}) {
		this.tokenConsumer.Class();
		this.Option(() => this.BindingIdentifier(params));
		return this.ClassTail(params);
	}
	/**
	* ClassTail[Yield, Await] :
	*     ClassHeritage[?Yield, ?Await]_opt { ClassBody[?Yield, ?Await]_opt }
	*/
	@SubhutiRule ClassTail(params = {}) {
		this.Option(() => this.ClassHeritage(params));
		this.tokenConsumer.LBrace();
		this.Option(() => this.ClassBody(params));
		return this.tokenConsumer.RBrace();
	}
	/**
	* ClassHeritage[Yield, Await] :
	*     extends LeftHandSideExpression[?Yield, ?Await]
	*/
	@SubhutiRule ClassHeritage(params = {}) {
		this.tokenConsumer.Extends();
		return this.LeftHandSideExpression(params);
	}
	/**
	* ClassBody[Yield, Await] :
	*     ClassElementList[?Yield, ?Await]
	*/
	@SubhutiRule ClassBody(params = {}) {
		return this.ClassElementList(params);
	}
	/**
	* ClassElementList[Yield, Await] :
	*     ClassElement[?Yield, ?Await]
	*     ClassElementList[?Yield, ?Await] ClassElement[?Yield, ?Await]
	*/
	@SubhutiRule ClassElementList(params = {}) {
		this.AtLeastOne(() => this.ClassElement(params));
		return this.curCst;
	}
	/**
	* ClassElement[Yield, Await] :
	*     MethodDefinition[?Yield, ?Await]
	*     static MethodDefinition[?Yield, ?Await]
	*     FieldDefinition[?Yield, ?Await] ;
	*     static FieldDefinition[?Yield, ?Await] ;
	*     ClassStaticBlock
	*     ;
	*
	* ⚠️ 规范顺序：MethodDefinition 必须在 FieldDefinition 之前尝试！
	* 因为 getter/setter 方法以 get/set 开头，如果先尝试 FieldDefinition，
	* 会把 get/set 匹配为字段名，导致 "get\na" 被解析为两个字段而不是一个 getter。
	*/
	@SubhutiRule ClassElement(params = {}) {
		return this.Or([
			{ alt: () => this.MethodDefinition(params) },
			{ alt: () => {
				this.tokenConsumer.Static();
				this.MethodDefinition(params);
			} },
			{ alt: () => {
				this.FieldDefinition(params);
				this.SemicolonASI();
			} },
			{ alt: () => {
				this.tokenConsumer.Static();
				this.FieldDefinition(params);
				this.SemicolonASI();
			} },
			{ alt: () => this.ClassStaticBlock() },
			{ alt: () => this.tokenConsumer.Semicolon() }
		]);
	}
	/**
	* FieldDefinition[Yield, Await] :
	*     ClassElementName[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
	*
	* 注意：根据 ECMAScript 规范的静态语义（Early Errors），
	* 类字段的 Initializer 中不能使用 await 作为 AwaitExpression。
	* 这是因为字段初始化器在类实例化时执行，而不是在声明时执行。
	* 所以这里将 Initializer 的 Await 参数设为 false，
	* 使得 await 可以作为标识符使用。Yield 同理。
	*
	* 但是 ClassElementName（包括 ComputedPropertyName）继承外部的 Await 参数，
	* 因为计算属性名在类声明时求值，此时外部的 await 上下文是有效的。
	*/
	@SubhutiRule FieldDefinition(params = {}) {
		this.ClassElementName(params);
		this.Option(() => this.Initializer({
			...params,
			In: true,
			Yield: false,
			Await: false
		}));
		return this.curCst;
	}
	/**
	* ClassElementName[Yield, Await] :
	*     PropertyName[?Yield, ?Await]
	*     PrivateIdentifier
	*
	* 注意：PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
	*/
	@SubhutiRule ClassElementName(params = {}) {
		return this.Or([{ alt: () => this.PropertyName(params) }, { alt: () => this.tokenConsumer.PrivateIdentifier() }]);
	}
	/**
	* ClassStaticBlock :
	*     static { ClassStaticBlockBody }
	*/
	@SubhutiRule ClassStaticBlock() {
		this.tokenConsumer.Static();
		this.tokenConsumer.LBrace();
		this.ClassStaticBlockBody();
		return this.tokenConsumer.RBrace();
	}
	/**
	* ClassStaticBlockBody :
	*     ClassStaticBlockStatementList
	*/
	@SubhutiRule ClassStaticBlockBody() {
		return this.ClassStaticBlockStatementList();
	}
	/**
	* ClassStaticBlockStatementList :
	*     StatementList[~Yield, +Await, ~Return]_opt
	*/
	@SubhutiRule ClassStaticBlockStatementList() {
		this.Option(() => this.StatementList({
			Yield: false,
			Await: true,
			Return: false
		}));
		return this.curCst;
	}
	/**
	* Program - 统一的解析入口
	*
	* 根据 sourceType 参数决定按 Script 还是 Module 模式解析。
	* Hashbang 注释只能出现在文件开头（参考 Acorn/Babel 实现）。
	*
	* @param sourceType - 'script' | 'module'，默认为 'module'
	*/
	@SubhutiRule Program(sourceType = "module") {
		this.Option(() => this.tokenConsumer.HashbangComment());
		if (sourceType === "module") this.Option(() => this.ModuleBody());
		else this.Option(() => this.ScriptBody());
		return this.curCst;
	}
	/**
	* Script :
	*     ScriptBody_opt
	*/
	@SubhutiRule Script() {
		this.Option(() => this.tokenConsumer.HashbangComment());
		this.Option(() => this.ScriptBody());
		return this.curCst;
	}
	/**
	* ScriptBody :
	*     StatementList[~Yield, ~Await, ~Return]
	*/
	@SubhutiRule ScriptBody() {
		return this.StatementList({
			Yield: false,
			Await: false,
			Return: false
		});
	}
	/**
	* Module :
	*     ModuleBody_opt
	*/
	@SubhutiRule Module() {
		this.Option(() => this.tokenConsumer.HashbangComment());
		this.Option(() => this.ModuleBody());
		return this.curCst;
	}
	/**
	* ModuleBody :
	*     ModuleItemList
	*/
	@SubhutiRule ModuleBody() {
		return this.ModuleItemList();
	}
	/**
	* ModuleItemList :
	*     ModuleItem
	*     ModuleItemList ModuleItem
	*/
	@SubhutiRule ModuleItemList() {
		if (this.errorRecoveryMode) this.ManyWithRecovery(() => this.ModuleItem());
		else this.Many(() => this.ModuleItem());
		return this.curCst;
	}
	/**
	* ModuleItem :
	*     ImportDeclaration
	*     ExportDeclaration
	*     StatementListItem[~Yield, +Await, ~Return]
	*/
	@SubhutiRule ModuleItem() {
		return this.Or([
			{ alt: () => this.ImportDeclaration() },
			{ alt: () => this.ExportDeclaration() },
			{ alt: () => this.StatementListItem({
				Yield: false,
				Await: true,
				Return: false
			}) }
		]);
	}
	/**
	* ImportDeclaration :
	*     import ImportClause FromClause WithClause_opt ;
	*     import ModuleSpecifier WithClause_opt ;
	*/
	@SubhutiRule ImportDeclaration() {
		return this.Or([{ alt: () => {
			this.tokenConsumer.Import();
			this.ImportClause();
			this.FromClause();
			this.Option(() => this.WithClause());
			this.SemicolonASI();
		} }, { alt: () => {
			this.tokenConsumer.Import();
			this.ModuleSpecifier();
			this.Option(() => this.WithClause());
			this.SemicolonASI();
		} }]);
	}
	/**
	* ImportClause :
	*     ImportedDefaultBinding
	*     NameSpaceImport
	*     NamedImports
	*     ImportedDefaultBinding , NameSpaceImport
	*     ImportedDefaultBinding , NamedImports
	*/
	@SubhutiRule ImportClause() {
		return this.Or([
			{ alt: () => {
				this.ImportedDefaultBinding();
				this.tokenConsumer.Comma();
				this.NameSpaceImport();
			} },
			{ alt: () => {
				this.ImportedDefaultBinding();
				this.tokenConsumer.Comma();
				this.NamedImports();
			} },
			{ alt: () => this.ImportedDefaultBinding() },
			{ alt: () => this.NameSpaceImport() },
			{ alt: () => this.NamedImports() }
		]);
	}
	/**
	* ImportedDefaultBinding :
	*     ImportedBinding
	*/
	@SubhutiRule ImportedDefaultBinding() {
		return this.ImportedBinding();
	}
	/**
	* NameSpaceImport :
	*     * as ImportedBinding
	*/
	@SubhutiRule NameSpaceImport() {
		this.tokenConsumer.Asterisk();
		this.tokenConsumer.As();
		return this.ImportedBinding();
	}
	/**
	* NamedImports :
	*     { }
	*     { ImportsList }
	*     { ImportsList , }
	*/
	@SubhutiRule NamedImports() {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.ImportsList();
				this.tokenConsumer.Comma();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.ImportsList();
				this.tokenConsumer.RBrace();
			} }
		]);
	}
	/**
	* FromClause :
	*     from ModuleSpecifier
	*/
	@SubhutiRule FromClause() {
		this.tokenConsumer.From();
		return this.ModuleSpecifier();
	}
	/**
	* ImportsList :
	*     ImportSpecifier
	*     ImportsList , ImportSpecifier
	*/
	@SubhutiRule ImportsList() {
		this.ImportSpecifier();
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.ImportSpecifier();
		});
		return this.curCst;
	}
	/**
	* ImportSpecifier :
	*     ImportedBinding
	*     ModuleExportName as ImportedBinding
	*/
	@SubhutiRule ImportSpecifier() {
		return this.Or([{ alt: () => {
			this.ModuleExportName();
			this.tokenConsumer.As();
			this.ImportedBinding();
		} }, { alt: () => this.ImportedBinding() }]);
	}
	/**
	* ModuleSpecifier :
	*     StringLiteral
	*
	* 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
	*/
	@SubhutiRule ModuleSpecifier() {
		return this.tokenConsumer.StringLiteral();
	}
	/**
	* ImportedBinding :
	*     BindingIdentifier[~Yield, +Await]
	*/
	@SubhutiRule ImportedBinding() {
		return this.BindingIdentifier({
			Yield: false,
			Await: true
		});
	}
	/**
	* WithClause :
	*     with { }
	*     with { WithEntries ,_opt }
	*/
	@SubhutiRule WithClause() {
		return this.Or([{ alt: () => {
			this.tokenConsumer.With();
			this.tokenConsumer.LBrace();
			this.tokenConsumer.RBrace();
		} }, { alt: () => {
			this.tokenConsumer.With();
			this.tokenConsumer.LBrace();
			this.WithEntries();
			this.Option(() => this.tokenConsumer.Comma());
			this.tokenConsumer.RBrace();
		} }]);
	}
	/**
	* WithEntries :
	*     AttributeKey : StringLiteral
	*     AttributeKey : StringLiteral , WithEntries
	*
	* 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
	*/
	@SubhutiRule WithEntries() {
		this.AttributeKey();
		this.tokenConsumer.Colon();
		this.tokenConsumer.StringLiteral();
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.AttributeKey();
			this.tokenConsumer.Colon();
			this.tokenConsumer.StringLiteral();
		});
		return this.curCst;
	}
	/**
	* AttributeKey :
	*     IdentifierName
	*     StringLiteral
	*
	* 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
	*/
	@SubhutiRule AttributeKey() {
		return this.Or([{ alt: () => this.IdentifierName() }, { alt: () => this.tokenConsumer.StringLiteral() }]);
	}
	/**
	* ExportDeclaration :
	*     export ExportFromClause FromClause WithClause_opt ;
	*     export NamedExports ;
	*     export VariableStatement[~Yield, +Await]
	*     export Declaration[~Yield, +Await]
	*     export default HoistableDeclaration[~Yield, +Await, +Default]
	*     export default ClassDeclaration[~Yield, +Await, +Default]
	*     export default [lookahead ∉ {function, async [no LineTerminator here] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;
	*/
	@SubhutiRule ExportDeclaration() {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.Export();
				this.ExportFromClause();
				this.FromClause();
				this.Option(() => this.WithClause());
				this.SemicolonASI();
			} },
			{ alt: () => {
				this.tokenConsumer.Export();
				this.NamedExports();
				this.SemicolonASI();
			} },
			{ alt: () => {
				this.tokenConsumer.Export();
				this.VariableStatement({
					Yield: false,
					Await: true
				});
			} },
			{ alt: () => {
				this.tokenConsumer.Export();
				this.Declaration({
					Yield: false,
					Await: true
				});
			} },
			{ alt: () => {
				this.tokenConsumer.Export();
				this.tokenConsumer.Default();
				this.HoistableDeclaration({
					Yield: false,
					Await: true,
					Default: true
				});
			} },
			{ alt: () => {
				this.tokenConsumer.Export();
				this.tokenConsumer.Default();
				this.ClassDeclaration({
					Yield: false,
					Await: true,
					Default: true
				});
			} },
			{ alt: () => {
				this.tokenConsumer.Export();
				this.tokenConsumer.Default();
				this.assertLookaheadNotIn([SlimeTokenType.Function, SlimeTokenType.Class]);
				this.assertNotContextualSequenceNoLT(SlimeContextualKeywordTokenTypes$1.Async, SlimeTokenType.Function);
				this.AssignmentExpression({
					In: true,
					Yield: false,
					Await: true
				});
				this.SemicolonASI();
			} }
		]);
	}
	/**
	* ExportFromClause :
	*     *
	*     * as ModuleExportName
	*     NamedExports
	*/
	@SubhutiRule ExportFromClause() {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.Asterisk();
				this.tokenConsumer.As();
				this.ModuleExportName();
			} },
			{ alt: () => this.tokenConsumer.Asterisk() },
			{ alt: () => this.NamedExports() }
		]);
	}
	/**
	* NamedExports :
	*     { }
	*     { ExportsList }
	*     { ExportsList , }
	*/
	@SubhutiRule NamedExports() {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.ExportsList();
				this.tokenConsumer.Comma();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.ExportsList();
				this.tokenConsumer.RBrace();
			} }
		]);
	}
	/**
	* ExportsList :
	*     ExportSpecifier
	*     ExportsList , ExportSpecifier
	*/
	@SubhutiRule ExportsList() {
		this.ExportSpecifier();
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.ExportSpecifier();
		});
		return this.curCst;
	}
	/**
	* ExportSpecifier :
	*     ModuleExportName
	*     ModuleExportName as ModuleExportName
	*/
	@SubhutiRule ExportSpecifier() {
		return this.Or([{ alt: () => {
			this.ModuleExportName();
			this.tokenConsumer.As();
			this.ModuleExportName();
		} }, { alt: () => this.ModuleExportName() }]);
	}
	/**
	* ModuleExportName :
	*     IdentifierName
	*     StringLiteral
	*
	* 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
	*/
	@SubhutiRule ModuleExportName() {
		return this.Or([{ alt: () => this.IdentifierName() }, { alt: () => this.tokenConsumer.StringLiteral() }]);
	}
	/**
	* AssignmentPattern[Yield, Await] :
	*     ObjectAssignmentPattern[?Yield, ?Await]
	*     ArrayAssignmentPattern[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentPattern(params = {}) {
		return this.Or([{ alt: () => this.ObjectAssignmentPattern(params) }, { alt: () => this.ArrayAssignmentPattern(params) }]);
	}
	/**
	* ObjectAssignmentPattern[Yield, Await] :
	*     { }
	*     { AssignmentRestProperty[?Yield, ?Await] }
	*     { AssignmentPropertyList[?Yield, ?Await] }
	*     { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await]_opt }
	*/
	@SubhutiRule ObjectAssignmentPattern(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.AssignmentRestProperty(params);
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.AssignmentPropertyList(params);
				this.tokenConsumer.Comma();
				this.Option(() => this.AssignmentRestProperty(params));
				this.tokenConsumer.RBrace();
			} },
			{ alt: () => {
				this.tokenConsumer.LBrace();
				this.AssignmentPropertyList(params);
				this.tokenConsumer.RBrace();
			} }
		]);
	}
	/**
	* ArrayAssignmentPattern[Yield, Await] :
	*     [ Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
	*     [ AssignmentElementList[?Yield, ?Await] ]
	*     [ AssignmentElementList[?Yield, ?Await] , Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
	*/
	@SubhutiRule ArrayAssignmentPattern(params = {}) {
		return this.Or([
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.Option(() => this.Elision());
				this.Option(() => this.AssignmentRestElement(params));
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.AssignmentElementList(params);
				this.tokenConsumer.Comma();
				this.Option(() => this.Elision());
				this.Option(() => this.AssignmentRestElement(params));
				this.tokenConsumer.RBracket();
			} },
			{ alt: () => {
				this.tokenConsumer.LBracket();
				this.AssignmentElementList(params);
				this.tokenConsumer.RBracket();
			} }
		]);
	}
	/**
	* AssignmentRestProperty[Yield, Await] :
	*     ... DestructuringAssignmentTarget[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentRestProperty(params = {}) {
		this.tokenConsumer.Ellipsis();
		return this.DestructuringAssignmentTarget(params);
	}
	/**
	* AssignmentPropertyList[Yield, Await] :
	*     AssignmentProperty[?Yield, ?Await]
	*     AssignmentPropertyList[?Yield, ?Await] , AssignmentProperty[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentPropertyList(params = {}) {
		this.AssignmentProperty(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.AssignmentProperty(params);
		});
		return this.curCst;
	}
	/**
	* AssignmentElementList[Yield, Await] :
	*     AssignmentElisionElement[?Yield, ?Await]
	*     AssignmentElementList[?Yield, ?Await] , AssignmentElisionElement[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentElementList(params = {}) {
		this.AssignmentElisionElement(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.AssignmentElisionElement(params);
		});
		return this.curCst;
	}
	/**
	* AssignmentElisionElement[Yield, Await] :
	*     Elision_opt AssignmentElement[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentElisionElement(params = {}) {
		this.Option(() => this.Elision());
		return this.AssignmentElement(params);
	}
	/**
	* AssignmentProperty[Yield, Await] :
	*     IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
	*     PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentProperty(params = {}) {
		return this.Or([{ alt: () => {
			this.PropertyName(params);
			this.tokenConsumer.Colon();
			this.AssignmentElement(params);
		} }, { alt: () => {
			this.IdentifierReference(params);
			this.Option(() => this.Initializer({
				...params,
				In: true
			}));
		} }]);
	}
	/**
	* AssignmentElement[Yield, Await] :
	*     DestructuringAssignmentTarget[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
	*/
	@SubhutiRule AssignmentElement(params = {}) {
		this.DestructuringAssignmentTarget(params);
		this.Option(() => this.Initializer({
			...params,
			In: true
		}));
		return this.curCst;
	}
	/**
	* AssignmentRestElement[Yield, Await] :
	*     ... DestructuringAssignmentTarget[?Yield, ?Await]
	*/
	@SubhutiRule AssignmentRestElement(params = {}) {
		this.tokenConsumer.Ellipsis();
		return this.DestructuringAssignmentTarget(params);
	}
	/**
	* DestructuringAssignmentTarget[Yield, Await] :
	*     LeftHandSideExpression[?Yield, ?Await]
	*/
	@SubhutiRule DestructuringAssignmentTarget(params = {}) {
		return this.LeftHandSideExpression(params);
	}
};
/**
* === ES2025 Parser 完整实现 ===
*
* 本 Parser 完全基于 ECMAScript® 2025 规范（https://tc39.es/ecma262/2025/#sec-grammar-summary）
*
* ✅ 已完整实现的部分：
*
* A.2 Expressions（表达式）：
* - IdentifierReference、BindingIdentifier、LabelIdentifier
* - PrimaryExpression（this、Literal、ArrayLiteral、ObjectLiteral 等）
* - TemplateLiteral（模板字面量）
* - MemberExpression、NewExpression、CallExpression
* - OptionalExpression（可选链）
* - UpdateExpression、UnaryExpression
* - 所有二元运算符表达式（乘法、加法、位移、关系、相等、位运算、逻辑运算）
* - ConditionalExpression（三元运算符）
* - AssignmentExpression（赋值表达式）
* - YieldExpression、ArrowFunction、AsyncArrowFunction
* - Expression（逗号表达式）
*
* A.3 Statements（语句）：
* - BlockStatement、VariableStatement、EmptyStatement
* - ExpressionStatement、IfStatement
* - IterationStatement（DoWhile、While、For、ForInOf）
* - ContinueStatement、BreakStatement、ReturnStatement
* - WithStatement、SwitchStatement、LabelledStatement
* - ThrowStatement、TryStatement、DebuggerStatement
* - LexicalDeclaration、VariableDeclaration
* - BindingPattern（解构绑定）
*
* A.4 Functions and Classes（函数和类）：
* - FormalParameters、UniqueFormalParameters
* - FunctionBody、FunctionExpression、FunctionDeclaration
* - GeneratorExpression、GeneratorDeclaration、GeneratorBody
* - AsyncFunctionExpression、AsyncFunctionDeclaration、AsyncFunctionBody
* - AsyncGeneratorExpression、AsyncGeneratorDeclaration、AsyncGeneratorBody
* - ArrowFunction、AsyncArrowFunction
* - MethodDefinition（普通方法、Generator、Async、AsyncGenerator、getter、setter）
* - ClassExpression、ClassDeclaration、ClassTail、ClassBody
* - ClassElement、FieldDefinition、ClassStaticBlock
*
* A.5 Scripts and Modules（脚本和模块）：
* - Script、Module、ModuleItem
* - ImportDeclaration、ImportClause、NameSpaceImport、NamedImports
* - ExportDeclaration、ExportFromClause、NamedExports
* - WithClause（Import Assertions）
*
* Supplemental Syntax（补充语法）：
* - AssignmentPattern、ObjectAssignmentPattern、ArrayAssignmentPattern
* - AssignmentProperty、AssignmentElement、DestructuringAssignmentTarget
*
* ✅ 语法特性覆盖：
* 1. 参数化规则：完整支持 [Yield, Await, In, Return, Default, Tagged]
* 2. 前瞻约束：实现所有 [lookahead =, ≠, ∈, ∉] 规则
* 3. 换行符约束：实现所有 [no LineTerminator here] 规则
* 4. Cover Grammar：支持 CoverParenthesizedExpression、CoverCallExpression 等
*
* ✅ 设计特点：
* 1. 完全符合 ES2025 规范，一对一映射语法规则
* 2. 使用 SubhutiParser 的 PEG 能力（Or, Many, Option, AtLeastOne）
* 3. 类型安全的 TokenConsumer 接口
* 4. 继承 SubhutiTokenLookahead 提供完整的前瞻能力
* 5. 支持所有现代 JavaScript 特性（async/await、class、module、optional chaining 等）
*
* 📝 实现说明：
* - 本实现专注于语法结构的完全符合性
* - 不考虑运行结果，只保证与规范一致
* - 所有规则都使用 @SubhutiRule 装饰器
* - 参数传递严格遵循规范的参数化规则
*
* @version 2.0.0 - 完整实现版本
* @specification ECMAScript® 2025 Language Specification
* @url https://tc39.es/ecma262/2025/#sec-grammar-summary
*/

//#endregion
//#region src/parser/ObjectScriptTokenConsumer.ts
/**
* ObjectScript Token 名称（继承 SlimeTokenType）
*/
const ObjectScriptTokenName = { ...SlimeTokenType };
/**
* ObjectScript 软关键字（上下文关键字）
* 这些在词法层是 IdentifierName，在语法层通过值检查来识别
* 这样用户仍然可以使用 object 作为变量名
*/
const ObjectScriptContextualKeywords = { Object: "object" };
/**
* ObjectScript Token 对象（继承 SlimeTokensObj）
* 注意：object 是软关键字，不在这里定义
*/
const ObjectScriptTokensObj = { ...SlimeTokensObj };
/**
* ObjectScript 所有 Token 数组
*/
const objectScriptTokens = Object.values(ObjectScriptTokensObj);
/**
* ObjectScript Token Consumer
* 继承 SlimeTokenConsumer，添加 ObjectScript 特有的 token 消费方法
*/
var ObjectScriptTokenConsumer = class extends SlimeTokenConsumer {
	/**
	* 消费 object 软关键字
	* 用于单例对象声明: object MyConfig { ... }
	*
	* 注意：object 是软关键字（上下文关键字），用户仍可使用 object 作为变量名
	* 例如：const object = someValue  // 合法
	*/
	ObjectToken() {
		return this.consumeIdentifierValue(ObjectScriptContextualKeywords.Object);
	}
};

//#endregion
//#region src/parser/ObjectScriptParser.ts
var ObjectScriptParser = @Subhuti class extends SlimeParser {
	/**
	* 构造函数 - 使用按需词法分析模式
	* @param sourceCode 原始源码
	*/
	constructor(sourceCode = "") {
		super(sourceCode, {
			tokenConsumer: ObjectScriptTokenConsumer,
			tokenDefinitions: objectScriptTokens
		});
	}
	/**
	* ClassHeritage - 覆盖父类，支持多继承
	*
	* ObjectScript 扩展语法：
	*   ClassHeritage[Yield, Await] :
	*       extends LeftHandSideExpression[?Yield, ?Await] (, LeftHandSideExpression[?Yield, ?Await])*
	*
	* 示例：
	*   class A extends B { }           // 单继承
	*   class A extends B, C { }        // 多继承
	*   class A extends B, C, D { }     // 多继承（多个父类）
	*/
	@SubhutiRule ClassHeritage(params = {}) {
		this.tokenConsumer.Extends();
		this.LeftHandSideExpression(params);
		this.Many(() => {
			this.tokenConsumer.Comma();
			this.LeftHandSideExpression(params);
		});
		return this.curCst;
	}
	/**
	* ObjectDeclaration - object 关键字声明单例对象
	*
	* 语法：
	*   object Identifier { ObjectBody }
	*   object Identifier extends Parent { ObjectBody }
	*
	* 示例：
	*   object AppConfig {
	*     name = "MyApp"
	*     version = "1.0.0"
	*   }
	*/
	@SubhutiRule ObjectDeclaration(params = {}) {
		this.tokenConsumer.ObjectToken();
		this.BindingIdentifier(params);
		this.Option(() => this.ObjectHeritage(params));
		this.tokenConsumer.LBrace();
		this.Option(() => this.ObjectBody(params));
		this.tokenConsumer.RBrace();
		return this.curCst;
	}
	/**
	* ObjectHeritage - object 的继承（单继承）
	*/
	@SubhutiRule ObjectHeritage(params = {}) {
		this.tokenConsumer.Extends();
		this.LeftHandSideExpression(params);
		return this.curCst;
	}
	/**
	* ObjectBody - object 的主体
	*/
	@SubhutiRule ObjectBody(params = {}) {
		return this.ObjectElementList(params);
	}
	/**
	* ObjectElementList - object 元素列表
	*/
	@SubhutiRule ObjectElementList(params = {}) {
		this.Many(() => this.ObjectElement(params));
		return this.curCst;
	}
	/**
	* ObjectElement - object 元素（方法或属性）
	*/
	@SubhutiRule ObjectElement(params = {}) {
		return this.Or([
			{ alt: () => this.MethodDefinition(params) },
			{ alt: () => this.ObjectPropertyAssignment(params) },
			{ alt: () => this.EmptyStatement() }
		]);
	}
	/**
	* ObjectPropertyAssignment - object 属性赋值
	* 语法: Identifier = Expression
	*/
	@SubhutiRule ObjectPropertyAssignment(params = {}) {
		this.BindingIdentifier(params);
		this.tokenConsumer.Assign();
		this.AssignmentExpression({
			...params,
			In: true
		});
		return this.curCst;
	}
	/**
	* Declaration - 覆盖父类，添加 ObjectDeclaration 支持
	*/
	@SubhutiRule Declaration(params = {}) {
		return this.Or([
			{ alt: () => this.ObjectDeclaration(params) },
			{ alt: () => this.HoistableDeclaration({
				...params,
				Default: false
			}) },
			{ alt: () => this.ClassDeclaration({
				...params,
				Default: false
			}) },
			{ alt: () => this.LexicalDeclaration({
				...params,
				In: true
			}) }
		]);
	}
};

//#endregion
//#region ../../slime/node_modules/slime-ast/src/SlimeESTree.ts
/** Program source type */
const SlimeProgramSourceType$1 = {
	Script: "script",
	Module: "module"
};

//#endregion
//#region ../../slime/node_modules/slime-ast/src/SlimeNodeCreate.ts
/**
* SlimeNodeCreate.ts - AST 节点创建工厂
*
* 为每个 AST 节点类型提供创建方法
* Token 创建方法请使用 SlimeTokenCreate.ts
* 与 SlimeESTree.ts 中的 AST 类型一一对应
*/
var SlimeNodeCreate$1 = class {
	commonLocType(node$1) {
		if (!node$1.loc) node$1.loc = {
			value: null,
			type: node$1.type,
			start: {
				index: 0,
				line: 0,
				column: 0
			},
			end: {
				index: 0,
				line: 0,
				column: 0
			}
		};
		return node$1;
	}
	createProgram(body, sourceType = SlimeProgramSourceType$1.Script) {
		return this.commonLocType({
			type: SlimeNodeType$1.Program,
			sourceType,
			body
		});
	}
	createMemberExpression(object, dot, property) {
		return this.commonLocType({
			type: SlimeNodeType$1.MemberExpression,
			object,
			dot,
			property,
			computed: false,
			optional: false,
			loc: object.loc
		});
	}
	createArrayExpression(elements, loc, lBracketToken, rBracketToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ArrayExpression,
			elements: elements || [],
			lBracketToken,
			rBracketToken,
			loc
		});
	}
	/** 创建数组元素包装 */
	createArrayElement(element, commaToken) {
		return {
			element,
			commaToken
		};
	}
	createPropertyAst(key, value) {
		return this.commonLocType({
			type: SlimeNodeType$1.Property,
			key,
			value,
			kind: "init",
			method: false,
			shorthand: false,
			computed: false
		});
	}
	createObjectExpression(properties = [], loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ObjectExpression,
			properties,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	/** 创建对象属性包装 */
	createObjectPropertyItem(property, commaToken) {
		return {
			property,
			commaToken
		};
	}
	createParenthesizedExpression(expression, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.ParenthesizedExpression,
			expression,
			loc
		});
	}
	createClassExpression(id, superClass, body, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.ClassExpression,
			id,
			body,
			superClass,
			loc
		});
	}
	createCallExpression(callee, args, loc, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.CallExpression,
			callee,
			arguments: args,
			optional: false,
			lParenToken,
			rParenToken,
			loc
		});
	}
	/** 创建调用参数包装 */
	createCallArgument(argument, commaToken) {
		return {
			argument,
			commaToken
		};
	}
	/** 创建函数参数包装 */
	createFunctionParam(param, commaToken) {
		return {
			param,
			commaToken
		};
	}
	createThisExpression(loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.ThisExpression,
			loc
		});
	}
	createChainExpression(expression, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.ChainExpression,
			expression,
			loc
		});
	}
	createSequenceExpression(expressions, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.SequenceExpression,
			expressions,
			loc
		});
	}
	createUnaryExpression(operator, argument, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.UnaryExpression,
			operator,
			prefix: true,
			argument,
			loc
		});
	}
	createBinaryExpression(operator, left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.BinaryExpression,
			operator,
			left,
			right,
			loc
		});
	}
	createAssignmentExpression(operator, left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.AssignmentExpression,
			operator,
			left,
			right,
			loc
		});
	}
	createUpdateExpression(operator, argument, prefix, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.UpdateExpression,
			operator,
			argument,
			prefix,
			loc
		});
	}
	createLogicalExpression(operator, left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.LogicalExpression,
			operator,
			left,
			right,
			loc
		});
	}
	createConditionalExpression(test, consequent, alternate, loc, questionToken, colonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ConditionalExpression,
			test,
			consequent,
			alternate,
			questionToken,
			colonToken,
			loc
		});
	}
	createNewExpression(callee, args, loc, newToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.NewExpression,
			callee,
			arguments: args,
			newToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createArrowFunctionExpression(body, params, expression, async = false, loc, arrowToken, asyncToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ArrowFunctionExpression,
			body,
			params,
			expression,
			async,
			arrowToken,
			asyncToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createYieldExpression(argument, delegate = false, loc, yieldToken, asteriskToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.YieldExpression,
			argument,
			delegate,
			yieldToken,
			asteriskToken,
			loc
		});
	}
	createTaggedTemplateExpression(tag, quasi, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.TaggedTemplateExpression,
			tag,
			quasi,
			loc
		});
	}
	createAwaitExpression(argument, loc, awaitToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.AwaitExpression,
			argument,
			awaitToken,
			loc
		});
	}
	createMetaProperty(meta, property, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.MetaProperty,
			meta,
			property,
			loc
		});
	}
	createImportExpression(source, loc, importToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ImportExpression,
			source,
			importToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createSuper(loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.Super,
			loc
		});
	}
	createPrivateIdentifier(name, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.PrivateIdentifier,
			name,
			loc
		});
	}
	createBlockStatement(body, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.BlockStatement,
			body,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createEmptyStatement(loc, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.EmptyStatement,
			semicolonToken,
			loc
		});
	}
	createExpressionStatement(expression, loc, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ExpressionStatement,
			expression,
			semicolonToken,
			loc
		});
	}
	createIfStatement(test, consequent, alternate, loc, ifToken, elseToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.IfStatement,
			test,
			consequent,
			alternate,
			ifToken,
			elseToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createLabeledStatement(label, body, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.LabeledStatement,
			label,
			body,
			loc
		});
	}
	createBreakStatement(label, loc, breakToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.BreakStatement,
			label,
			breakToken,
			semicolonToken,
			loc
		});
	}
	createContinueStatement(label, loc, continueToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ContinueStatement,
			label,
			continueToken,
			semicolonToken,
			loc
		});
	}
	createWithStatement(object, body, loc, withToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.WithStatement,
			object,
			body,
			withToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createSwitchStatement(discriminant, cases, loc, switchToken, lParenToken, rParenToken, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.SwitchStatement,
			discriminant,
			cases,
			switchToken,
			lParenToken,
			rParenToken,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createReturnStatement(argument, loc, returnToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ReturnStatement,
			argument,
			returnToken,
			semicolonToken,
			loc
		});
	}
	createThrowStatement(argument, loc, throwToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ThrowStatement,
			argument,
			throwToken,
			semicolonToken,
			loc
		});
	}
	createTryStatement(block, handler, finalizer, loc, tryToken, finallyToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.TryStatement,
			block,
			handler,
			finalizer,
			tryToken,
			finallyToken,
			loc
		});
	}
	createWhileStatement(test, body, loc, whileToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.WhileStatement,
			test,
			body,
			whileToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createDoWhileStatement(body, test, loc, doToken, whileToken, lParenToken, rParenToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.DoWhileStatement,
			body,
			test,
			doToken,
			whileToken,
			lParenToken,
			rParenToken,
			semicolonToken,
			loc
		});
	}
	createForStatement(body, init, test, update, loc, forToken, lParenToken, rParenToken, semicolon1Token, semicolon2Token) {
		return this.commonLocType({
			type: SlimeNodeType$1.ForStatement,
			init,
			test,
			update,
			body,
			forToken,
			lParenToken,
			rParenToken,
			semicolon1Token,
			semicolon2Token,
			loc
		});
	}
	createForInStatement(left, right, body, loc, forToken, inToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ForInStatement,
			left,
			right,
			body,
			forToken,
			inToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createForOfStatement(left, right, body, isAwait = false, loc, forToken, ofToken, awaitToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ForOfStatement,
			left,
			right,
			body,
			await: isAwait,
			forToken,
			ofToken,
			awaitToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createDebuggerStatement(loc, debuggerToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.DebuggerStatement,
			debuggerToken,
			semicolonToken,
			loc
		});
	}
	createSwitchCase(consequent, test, loc, caseToken, defaultToken, colonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.SwitchCase,
			test,
			consequent,
			caseToken,
			defaultToken,
			colonToken,
			loc
		});
	}
	createCatchClause(body, param, loc, catchToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.CatchClause,
			param,
			body,
			catchToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createStaticBlock(body, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.StaticBlock,
			body,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createFunctionExpression(body, id, params, generator, async, loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.FunctionExpression,
			params: params || [],
			id,
			body,
			generator: generator || false,
			async: async || false,
			functionToken,
			asyncToken,
			asteriskToken,
			lParenToken,
			rParenToken,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createVariableDeclaration(kind, declarations, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.VariableDeclaration,
			declarations,
			kind,
			loc
		});
	}
	createVariableDeclarator(id, assignToken, init, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.VariableDeclarator,
			id,
			assignToken,
			init,
			loc
		});
	}
	createRestElement(argument, loc, ellipsisToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.RestElement,
			argument,
			ellipsisToken,
			loc
		});
	}
	createSpreadElement(argument, loc, ellipsisToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.SpreadElement,
			argument,
			ellipsisToken,
			loc
		});
	}
	createObjectPattern(properties, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ObjectPattern,
			properties,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	/** 创建解构对象属性包装 */
	createObjectPatternProperty(property, commaToken) {
		return {
			property,
			commaToken
		};
	}
	createArrayPattern(elements, loc, lBracketToken, rBracketToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ArrayPattern,
			elements,
			lBracketToken,
			rBracketToken,
			loc
		});
	}
	/** 创建解构数组元素包装 */
	createArrayPatternElement(element, commaToken) {
		return {
			element,
			commaToken
		};
	}
	createAssignmentPattern(left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.AssignmentPattern,
			left,
			right,
			loc
		});
	}
	createAssignmentProperty(key, value, shorthand = false, computed = false, loc, colonToken, lBracketToken, rBracketToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.Property,
			key,
			value,
			kind: "init",
			method: false,
			shorthand,
			computed,
			colonToken,
			lBracketToken,
			rBracketToken,
			loc
		});
	}
	createImportDeclaration(specifiers, source, loc, importToken, fromToken, lBraceToken, rBraceToken, semicolonToken, attributes, withToken) {
		const decl = {
			type: SlimeNodeType$1.ImportDeclaration,
			source,
			specifiers,
			importToken,
			fromToken,
			lBraceToken,
			rBraceToken,
			semicolonToken,
			loc
		};
		if (withToken) {
			decl.attributes = attributes || [];
			decl.withToken = withToken;
		}
		return this.commonLocType(decl);
	}
	/** 创建 import specifier 包装 */
	createImportSpecifierItem(specifier, commaToken) {
		return {
			specifier,
			commaToken
		};
	}
	createImportSpecifier(local, imported, loc, asToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ImportSpecifier,
			local,
			imported,
			asToken,
			loc
		});
	}
	createImportDefaultSpecifier(local, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.ImportDefaultSpecifier,
			local,
			loc
		});
	}
	createImportNamespaceSpecifier(local, loc, asteriskToken, asToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ImportNamespaceSpecifier,
			local,
			asteriskToken,
			asToken,
			loc
		});
	}
	createExportDefaultDeclaration(declaration, loc, exportToken, defaultToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ExportDefaultDeclaration,
			declaration,
			exportToken,
			defaultToken,
			loc
		});
	}
	createExportNamedDeclaration(declaration, specifiers, source, loc, exportToken, fromToken, lBraceToken, rBraceToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ExportNamedDeclaration,
			declaration,
			specifiers,
			source,
			exportToken,
			fromToken,
			lBraceToken,
			rBraceToken,
			semicolonToken,
			loc
		});
	}
	/** 创建 export specifier 包装 */
	createExportSpecifierItem(specifier, commaToken) {
		return {
			specifier,
			commaToken
		};
	}
	createExportSpecifier(local, exported, loc, asToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ExportSpecifier,
			local,
			exported,
			asToken,
			loc
		});
	}
	createExportAllDeclaration(source, exported, loc, exportToken, asteriskToken, asToken, fromToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ExportAllDeclaration,
			source,
			exported,
			exportToken,
			asteriskToken,
			asToken,
			fromToken,
			semicolonToken,
			loc
		});
	}
	createDirective(expression, directive, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.ExpressionStatement,
			expression,
			directive,
			loc
		});
	}
	createClassDeclaration(id, body, superClass, loc, classToken, extendsToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ClassDeclaration,
			id,
			body,
			superClass,
			classToken,
			extendsToken,
			loc
		});
	}
	createClassBody(body, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.ClassBody,
			body,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createFunctionDeclaration(id, params, body, generator = false, async = false, loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.FunctionDeclaration,
			id,
			params,
			body,
			generator,
			async,
			functionToken,
			asyncToken,
			asteriskToken,
			lParenToken,
			rParenToken,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createIdentifier(name, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.Identifier,
			name,
			loc
		});
	}
	createLiteral(value) {
		let ast;
		if (value === void 0) {} else if (typeof value === "string") ast = this.createStringLiteral(value);
		else if (typeof value === "number") ast = this.createNumericLiteral(value);
		return ast;
	}
	createNullLiteralToken() {
		return this.commonLocType({
			type: SlimeNodeType$1.Literal,
			value: null
		});
	}
	createStringLiteral(value, loc, raw) {
		const hasQuotes = /^['"].*['"]$/.test(value);
		const cleanValue = value.replace(/^['"]|['"]$/g, "");
		return this.commonLocType({
			type: SlimeNodeType$1.Literal,
			value: cleanValue,
			raw: raw || (hasQuotes ? value : `'${value}'`),
			loc
		});
	}
	createNumericLiteral(value, raw) {
		return this.commonLocType({
			type: SlimeNodeType$1.Literal,
			value,
			raw: raw || String(value)
		});
	}
	createBooleanLiteral(value, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.Literal,
			value,
			loc
		});
	}
	createRegExpLiteral(pattern, flags, raw, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.Literal,
			regex: {
				pattern,
				flags
			},
			raw: raw || `/${pattern}/${flags}`,
			loc
		});
	}
	createBigIntLiteral(bigint, raw, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.Literal,
			bigint,
			raw: raw || `${bigint}n`,
			loc
		});
	}
	createTemplateLiteral(quasis, expressions, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.TemplateLiteral,
			quasis,
			expressions,
			loc
		});
	}
	createTemplateElement(tail, raw, cooked, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.TemplateElement,
			tail,
			value: {
				raw,
				cooked: cooked !== void 0 ? cooked : raw
			},
			loc
		});
	}
	createMethodDefinition(key, value, kind = "method", computed = false, isStatic = false, loc, staticToken, getToken, setToken, asyncToken, asteriskToken) {
		return this.commonLocType({
			type: SlimeNodeType$1.MethodDefinition,
			key,
			value,
			kind,
			computed,
			static: isStatic,
			staticToken,
			getToken,
			setToken,
			asyncToken,
			asteriskToken,
			loc
		});
	}
	createPropertyDefinition(key, value, computed = false, isStatic = false, loc) {
		return this.commonLocType({
			type: SlimeNodeType$1.PropertyDefinition,
			key,
			value: value ?? null,
			computed,
			static: isStatic,
			loc
		});
	}
};
const SlimeAstCreateUtil$1 = new SlimeNodeCreate$1();
var SlimeNodeCreate_default$1 = SlimeAstCreateUtil$1;

//#endregion
//#region ../../slime/node_modules/slime-ast/node_modules/slime-token/src/SlimeTokenType.ts
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
const SlimeAssignmentOperatorTokenTypes$1 = {
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
const SlimeUpdateOperatorTokenTypes$1 = {
	Increment: "Increment",
	Decrement: "Decrement"
};
/**
* 一元运算符 Token 类型
* 对应: - + ! ~ typeof void delete
*/
const SlimeUnaryOperatorTokenTypes$1 = {
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
const SlimeBinaryOperatorTokenTypes$1 = {
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
const SlimeLogicalOperatorTokenTypes$1 = {
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
const SlimeTokenType$1 = {
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
	...SlimeAssignmentOperatorTokenTypes$1,
	...SlimeUpdateOperatorTokenTypes$1,
	...SlimeUnaryOperatorTokenTypes$1,
	...SlimeBinaryOperatorTokenTypes$1,
	...SlimeLogicalOperatorTokenTypes$1,
	...SlimeContextualKeywordTokenTypes
};

//#endregion
//#region ../../slime/node_modules/slime-ast/src/SlimeTokenCreate.ts
var SlimeTokenFactory$1 = class {
	createVarToken(loc) {
		return {
			type: SlimeTokenType$1.Var,
			value: "var",
			loc
		};
	}
	createLetToken(loc) {
		return {
			type: SlimeTokenType$1.Let,
			value: "let",
			loc
		};
	}
	createConstToken(loc) {
		return {
			type: SlimeTokenType$1.Const,
			value: "const",
			loc
		};
	}
	createAssignToken(loc) {
		return {
			type: SlimeTokenType$1.Assign,
			value: "=",
			loc
		};
	}
	createLParenToken(loc) {
		return {
			type: SlimeTokenType$1.LParen,
			value: "(",
			loc
		};
	}
	createRParenToken(loc) {
		return {
			type: SlimeTokenType$1.RParen,
			value: ")",
			loc
		};
	}
	createLBraceToken(loc) {
		return {
			type: SlimeTokenType$1.LBrace,
			value: "{",
			loc
		};
	}
	createRBraceToken(loc) {
		return {
			type: SlimeTokenType$1.RBrace,
			value: "}",
			loc
		};
	}
	createLBracketToken(loc) {
		return {
			type: SlimeTokenType$1.LBracket,
			value: "[",
			loc
		};
	}
	createRBracketToken(loc) {
		return {
			type: SlimeTokenType$1.RBracket,
			value: "]",
			loc
		};
	}
	createSemicolonToken(loc) {
		return {
			type: SlimeTokenType$1.Semicolon,
			value: ";",
			loc
		};
	}
	createCommaToken(loc) {
		return {
			type: SlimeTokenType$1.Comma,
			value: ",",
			loc
		};
	}
	createDotToken(loc) {
		return {
			type: SlimeTokenType$1.Dot,
			value: ".",
			loc
		};
	}
	createSpreadToken(loc) {
		return {
			type: SlimeTokenType$1.Ellipsis,
			value: "...",
			loc
		};
	}
	createArrowToken(loc) {
		return {
			type: SlimeTokenType$1.Arrow,
			value: "=>",
			loc
		};
	}
	createQuestionToken(loc) {
		return {
			type: SlimeTokenType$1.Question,
			value: "?",
			loc
		};
	}
	createColonToken(loc) {
		return {
			type: SlimeTokenType$1.Colon,
			value: ":",
			loc
		};
	}
	createEllipsisToken(loc) {
		return {
			type: SlimeTokenType$1.Ellipsis,
			value: "...",
			loc
		};
	}
	createOptionalChainingToken(loc) {
		return {
			type: SlimeTokenType$1.OptionalChaining,
			value: "?.",
			loc
		};
	}
	createAsteriskToken(loc) {
		return {
			type: SlimeTokenType$1.Asterisk,
			value: "*",
			loc
		};
	}
	createFunctionToken(loc) {
		return {
			type: SlimeTokenType$1.Function,
			value: "function",
			loc
		};
	}
	createAsyncToken(loc) {
		return {
			type: SlimeTokenType$1.Async,
			value: "async",
			loc
		};
	}
	createClassToken(loc) {
		return {
			type: SlimeTokenType$1.Class,
			value: "class",
			loc
		};
	}
	createExtendsToken(loc) {
		return {
			type: SlimeTokenType$1.Extends,
			value: "extends",
			loc
		};
	}
	createStaticToken(loc) {
		return {
			type: SlimeTokenType$1.Static,
			value: "static",
			loc
		};
	}
	createGetToken(loc) {
		return {
			type: SlimeTokenType$1.Get,
			value: "get",
			loc
		};
	}
	createSetToken(loc) {
		return {
			type: SlimeTokenType$1.Set,
			value: "set",
			loc
		};
	}
	createIfToken(loc) {
		return {
			type: SlimeTokenType$1.If,
			value: "if",
			loc
		};
	}
	createElseToken(loc) {
		return {
			type: SlimeTokenType$1.Else,
			value: "else",
			loc
		};
	}
	createSwitchToken(loc) {
		return {
			type: SlimeTokenType$1.Switch,
			value: "switch",
			loc
		};
	}
	createCaseToken(loc) {
		return {
			type: SlimeTokenType$1.Case,
			value: "case",
			loc
		};
	}
	createDefaultToken(loc) {
		return {
			type: SlimeTokenType$1.Default,
			value: "default",
			loc
		};
	}
	createForToken(loc) {
		return {
			type: SlimeTokenType$1.For,
			value: "for",
			loc
		};
	}
	createWhileToken(loc) {
		return {
			type: SlimeTokenType$1.While,
			value: "while",
			loc
		};
	}
	createDoToken(loc) {
		return {
			type: SlimeTokenType$1.Do,
			value: "do",
			loc
		};
	}
	createOfToken(loc) {
		return {
			type: SlimeTokenType$1.Of,
			value: "of",
			loc
		};
	}
	createBreakToken(loc) {
		return {
			type: SlimeTokenType$1.Break,
			value: "break",
			loc
		};
	}
	createContinueToken(loc) {
		return {
			type: SlimeTokenType$1.Continue,
			value: "continue",
			loc
		};
	}
	createReturnToken(loc) {
		return {
			type: SlimeTokenType$1.Return,
			value: "return",
			loc
		};
	}
	createThrowToken(loc) {
		return {
			type: SlimeTokenType$1.Throw,
			value: "throw",
			loc
		};
	}
	createTryToken(loc) {
		return {
			type: SlimeTokenType$1.Try,
			value: "try",
			loc
		};
	}
	createCatchToken(loc) {
		return {
			type: SlimeTokenType$1.Catch,
			value: "catch",
			loc
		};
	}
	createFinallyToken(loc) {
		return {
			type: SlimeTokenType$1.Finally,
			value: "finally",
			loc
		};
	}
	createWithToken(loc) {
		return {
			type: SlimeTokenType$1.With,
			value: "with",
			loc
		};
	}
	createDebuggerToken(loc) {
		return {
			type: SlimeTokenType$1.Debugger,
			value: "debugger",
			loc
		};
	}
	createNewToken(loc) {
		return {
			type: SlimeTokenType$1.New,
			value: "new",
			loc
		};
	}
	createYieldToken(loc) {
		return {
			type: SlimeTokenType$1.Yield,
			value: "yield",
			loc
		};
	}
	createAwaitToken(loc) {
		return {
			type: SlimeTokenType$1.Await,
			value: "await",
			loc
		};
	}
	createTypeofToken(loc) {
		return {
			type: SlimeTokenType$1.Typeof,
			value: "typeof",
			loc
		};
	}
	createVoidToken(loc) {
		return {
			type: SlimeTokenType$1.Void,
			value: "void",
			loc
		};
	}
	createDeleteToken(loc) {
		return {
			type: SlimeTokenType$1.Delete,
			value: "delete",
			loc
		};
	}
	createInstanceofToken(loc) {
		return {
			type: SlimeTokenType$1.Instanceof,
			value: "instanceof",
			loc
		};
	}
	createImportToken(loc) {
		return {
			type: SlimeTokenType$1.Import,
			value: "import",
			loc
		};
	}
	createExportToken(loc) {
		return {
			type: SlimeTokenType$1.Export,
			value: "export",
			loc
		};
	}
	createFromToken(loc) {
		return {
			type: SlimeTokenType$1.From,
			value: "from",
			loc
		};
	}
	createAsToken(loc) {
		return {
			type: SlimeTokenType$1.As,
			value: "as",
			loc
		};
	}
	createInToken(loc) {
		return {
			type: SlimeTokenType$1.In,
			value: "in",
			loc
		};
	}
	/**
	* 创建二元运算符 Token
	* 支持: == != === !== < <= > >= << >> >>> + - * / % ** | ^ & in instanceof
	*/
	createBinaryOperatorToken(operator, loc) {
		return {
			type: {
				"==": SlimeBinaryOperatorTokenTypes$1.Equal,
				"!=": SlimeBinaryOperatorTokenTypes$1.NotEqual,
				"===": SlimeBinaryOperatorTokenTypes$1.StrictEqual,
				"!==": SlimeBinaryOperatorTokenTypes$1.StrictNotEqual,
				"<": SlimeBinaryOperatorTokenTypes$1.Less,
				"<=": SlimeBinaryOperatorTokenTypes$1.LessEqual,
				">": SlimeBinaryOperatorTokenTypes$1.Greater,
				">=": SlimeBinaryOperatorTokenTypes$1.GreaterEqual,
				"<<": SlimeBinaryOperatorTokenTypes$1.LeftShift,
				">>": SlimeBinaryOperatorTokenTypes$1.RightShift,
				">>>": SlimeBinaryOperatorTokenTypes$1.UnsignedRightShift,
				"+": SlimeBinaryOperatorTokenTypes$1.Plus,
				"-": SlimeBinaryOperatorTokenTypes$1.Minus,
				"*": SlimeBinaryOperatorTokenTypes$1.Asterisk,
				"/": SlimeBinaryOperatorTokenTypes$1.Slash,
				"%": SlimeBinaryOperatorTokenTypes$1.Modulo,
				"**": SlimeBinaryOperatorTokenTypes$1.Exponentiation,
				"|": SlimeBinaryOperatorTokenTypes$1.BitwiseOr,
				"^": SlimeBinaryOperatorTokenTypes$1.BitwiseXor,
				"&": SlimeBinaryOperatorTokenTypes$1.BitwiseAnd,
				"in": SlimeBinaryOperatorTokenTypes$1.In,
				"instanceof": SlimeBinaryOperatorTokenTypes$1.Instanceof
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建一元运算符 Token
	* 支持: - + ! ~ typeof void delete
	*/
	createUnaryOperatorToken(operator, loc) {
		return {
			type: {
				"-": SlimeUnaryOperatorTokenTypes$1.Minus,
				"+": SlimeUnaryOperatorTokenTypes$1.Plus,
				"!": SlimeUnaryOperatorTokenTypes$1.LogicalNot,
				"~": SlimeUnaryOperatorTokenTypes$1.BitwiseNot,
				"typeof": SlimeUnaryOperatorTokenTypes$1.Typeof,
				"void": SlimeUnaryOperatorTokenTypes$1.Void,
				"delete": SlimeUnaryOperatorTokenTypes$1.Delete
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建逻辑运算符 Token
	* 支持: || && ??
	*/
	createLogicalOperatorToken(operator, loc) {
		return {
			type: {
				"||": SlimeLogicalOperatorTokenTypes$1.LogicalOr,
				"&&": SlimeLogicalOperatorTokenTypes$1.LogicalAnd,
				"??": SlimeLogicalOperatorTokenTypes$1.NullishCoalescing
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建赋值运算符 Token
	* 支持: = += -= *= /= %= **= <<= >>= >>>= |= ^= &= ||= &&= ??=
	*/
	createAssignmentOperatorToken(operator, loc) {
		return {
			type: {
				"=": SlimeAssignmentOperatorTokenTypes$1.Assign,
				"+=": SlimeAssignmentOperatorTokenTypes$1.PlusAssign,
				"-=": SlimeAssignmentOperatorTokenTypes$1.MinusAssign,
				"*=": SlimeAssignmentOperatorTokenTypes$1.MultiplyAssign,
				"/=": SlimeAssignmentOperatorTokenTypes$1.DivideAssign,
				"%=": SlimeAssignmentOperatorTokenTypes$1.ModuloAssign,
				"**=": SlimeAssignmentOperatorTokenTypes$1.ExponentiationAssign,
				"<<=": SlimeAssignmentOperatorTokenTypes$1.LeftShiftAssign,
				">>=": SlimeAssignmentOperatorTokenTypes$1.RightShiftAssign,
				">>>=": SlimeAssignmentOperatorTokenTypes$1.UnsignedRightShiftAssign,
				"|=": SlimeAssignmentOperatorTokenTypes$1.BitwiseOrAssign,
				"^=": SlimeAssignmentOperatorTokenTypes$1.BitwiseXorAssign,
				"&=": SlimeAssignmentOperatorTokenTypes$1.BitwiseAndAssign,
				"||=": SlimeAssignmentOperatorTokenTypes$1.LogicalOrAssign,
				"&&=": SlimeAssignmentOperatorTokenTypes$1.LogicalAndAssign,
				"??=": SlimeAssignmentOperatorTokenTypes$1.NullishCoalescingAssign
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建更新运算符 Token
	* 支持: ++ --
	*/
	createUpdateOperatorToken(operator, loc) {
		return {
			type: {
				"++": SlimeUpdateOperatorTokenTypes$1.Increment,
				"--": SlimeUpdateOperatorTokenTypes$1.Decrement
			}[operator],
			value: operator,
			loc
		};
	}
};
const SlimeTokenCreate$1 = new SlimeTokenFactory$1();
var SlimeTokenCreate_default$1 = SlimeTokenCreate$1;

//#endregion
//#region ../../slime/packages/slime-parser/src/language/SlimeCstToAstUtil.ts
/**
* �?Unicode 转义序列解码为实际字�?
* 支持 \uXXXX �?\u{XXXXX} 格式
*
* @param str 可能包含 Unicode 转义的字符串
* @returns 解码后的字符�?
*/
function decodeUnicodeEscapes(str) {
	if (!str || !str.includes("\\u")) return str || "";
	return str.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (match, braceCode, fourDigitCode) => {
		const codePoint = parseInt(braceCode || fourDigitCode, 16);
		return String.fromCodePoint(codePoint);
	});
}
function checkCstName$1(cst, cstName) {
	if (cst.name !== cstName) throwNewError(cst.name);
	return cstName;
}
function throwNewError(errorMsg = "syntax error") {
	throw new Error(errorMsg);
}
/**
* CST �?AST 转换�?
*
* ## 两层架构设计
*
* ### 第一层：AST 工厂�?(SlimeNodeCreate.ts / SlimeAstUtil)
* - �?ESTree AST 节点类型一一对应的纯粹创建方�?
* - 不依�?CST 结构，只接收参数创建节点
* - 示例：createIdentifier(name, loc) �?SlimeIdentifier
*
* ### 第二层：CST 转换�?(本类)
* - �?CST 规则一一对应的转换方�?(createXxxAst)
* - 解析 CST 结构，提取信息，调用 AST 工厂�?
* - 中心转发方法：createAstFromCst(cst) - 自动根据类型分发
*
* ## 方法命名规范
*
* | 方法类型 | 命名模式 | 说明 |
* |----------|----------|------|
* | CST 规则转换 | createXxxAst | �?@SubhutiRule 规则一一对应 |
* | AST 类型映射 | createXxxAst | CST 规则�?�?AST 类型名时使用 |
* | 内部辅助方法 | private createXxxAst | ES2025 专用处理�?|
* | 工具方法 | convertXxx / isXxx | 表达式转模式、检查方法等 |
*
* ## 方法命名规范
*
* 所�?CST 转换方法命名�?createXxxAst，其�?Xxx �?CST 规则名一致�?
* 内部调用 SlimeNodeCreate / SlimeAstUtil 中与 AST 类型名一致的工厂方法�?
*
* 例如�?
* - createArrayLiteralAst (CST 规则�? �?内部调用 createArrayExpression (AST 类型�?
* - createObjectLiteralAst (CST 规则�? �?内部调用 createObjectExpression (AST 类型�?
* - createCatchAst (CST 规则�? �?内部调用 createCatchClause (AST 类型�?
*
* ## 核心分发方法
* - createAstFromCst: 中心转发，根�?CST 类型显式分发到对应方�?
* - createStatementDeclarationAst: 语句/声明分发
*
* ## 辅助处理方法
* - toProgram: Program 入口处理
*/
var SlimeCstToAst = class {
	constructor() {
		this.expressionAstCache = /* @__PURE__ */ new WeakMap();
	}
	/**
	* 中心转发方法：根�?CST 节点类型显式分发到对应的转换方法
	*
	* 这是 CST �?AST 两层架构的核心入口：
	* - 第一层：AST 工厂�?(SlimeNodeCreate.ts) - 纯粹�?AST 节点创建
	* - 第二层：CST 转换�?(本类) - 解析 CST 结构，调�?AST 工厂�?
	*
	* @param cst CST 节点
	* @returns 对应�?AST 节点
	*/
	createAstFromCst(cst) {
		const name = cst.name;
		if (name === SlimeParser.prototype.IdentifierReference?.name) return this.createIdentifierReferenceAst(cst);
		if (name === SlimeParser.prototype.BindingIdentifier?.name) return this.createBindingIdentifierAst(cst);
		if (name === SlimeParser.prototype.LabelIdentifier?.name) return this.createLabelIdentifierAst(cst);
		if (name === SlimeParser.prototype.Identifier?.name) return this.createIdentifierAst(cst);
		if (name === SlimeParser.prototype.IdentifierName?.name) return this.createIdentifierNameAst(cst);
		if (name === SlimeParser.prototype.Literal?.name) return this.createLiteralAst(cst);
		if (name === SlimeParser.prototype.BooleanLiteral?.name) return this.createBooleanLiteralAst(cst);
		if (name === SlimeParser.prototype.ArrayLiteral?.name) return this.createArrayLiteralAst(cst);
		if (name === SlimeParser.prototype.ObjectLiteral?.name) return this.createObjectLiteralAst(cst);
		if (name === SlimeParser.prototype.TemplateLiteral?.name) return this.createTemplateLiteralAst(cst);
		if (name === SlimeParser.prototype.LiteralPropertyName?.name) return this.createLiteralPropertyNameAst(cst);
		if (name === SlimeTokenConsumer.prototype.NumericLiteral?.name) return this.createNumericLiteralAst(cst);
		if (name === SlimeTokenConsumer.prototype.StringLiteral?.name) return this.createStringLiteralAst(cst);
		if (name === SlimeTokenConsumer.prototype.RegularExpressionLiteral?.name) return this.createRegExpLiteralAst(cst);
		if (name === SlimeParser.prototype.PrimaryExpression?.name) return this.createPrimaryExpressionAst(cst);
		if (name === SlimeParser.prototype.Expression?.name) return this.createExpressionAst(cst);
		if (name === SlimeParser.prototype.AssignmentExpression?.name) return this.createAssignmentExpressionAst(cst);
		if (name === SlimeParser.prototype.ConditionalExpression?.name) return this.createConditionalExpressionAst(cst);
		if (name === SlimeParser.prototype.ShortCircuitExpression?.name) return this.createShortCircuitExpressionAst(cst);
		if (name === SlimeParser.prototype.LogicalORExpression?.name) return this.createLogicalORExpressionAst(cst);
		if (name === SlimeParser.prototype.LogicalANDExpression?.name) return this.createLogicalANDExpressionAst(cst);
		if (name === SlimeParser.prototype.BitwiseORExpression?.name) return this.createBitwiseORExpressionAst(cst);
		if (name === SlimeParser.prototype.BitwiseXORExpression?.name) return this.createBitwiseXORExpressionAst(cst);
		if (name === SlimeParser.prototype.BitwiseANDExpression?.name) return this.createBitwiseANDExpressionAst(cst);
		if (name === SlimeParser.prototype.EqualityExpression?.name) return this.createEqualityExpressionAst(cst);
		if (name === SlimeParser.prototype.RelationalExpression?.name) return this.createRelationalExpressionAst(cst);
		if (name === SlimeParser.prototype.ShiftExpression?.name) return this.createShiftExpressionAst(cst);
		if (name === SlimeParser.prototype.AdditiveExpression?.name) return this.createAdditiveExpressionAst(cst);
		if (name === SlimeParser.prototype.MultiplicativeExpression?.name) return this.createMultiplicativeExpressionAst(cst);
		if (name === SlimeParser.prototype.ExponentiationExpression?.name) return this.createExponentiationExpressionAst(cst);
		if (name === SlimeParser.prototype.UnaryExpression?.name) return this.createUnaryExpressionAst(cst);
		if (name === SlimeParser.prototype.UpdateExpression?.name) return this.createUpdateExpressionAst(cst);
		if (name === SlimeParser.prototype.LeftHandSideExpression?.name) return this.createLeftHandSideExpressionAst(cst);
		if (name === SlimeParser.prototype.NewExpression?.name) return this.createNewExpressionAst(cst);
		if (name === SlimeParser.prototype.CallExpression?.name) return this.createCallExpressionAst(cst);
		if (name === SlimeParser.prototype.CallMemberExpression?.name) return this.createCallMemberExpressionAst(cst);
		if (name === SlimeParser.prototype.MemberExpression?.name) return this.createMemberExpressionAst(cst);
		if (name === SlimeParser.prototype.OptionalExpression?.name) return this.createOptionalExpressionAst(cst);
		if (name === SlimeParser.prototype.CoalesceExpression?.name) return this.createCoalesceExpressionAst(cst);
		if (name === SlimeParser.prototype.CoalesceExpressionHead?.name) return this.createCoalesceExpressionHeadAst(cst);
		if (name === SlimeParser.prototype.ParenthesizedExpression?.name) return this.createParenthesizedExpressionAst(cst);
		if (name === SlimeParser.prototype.AwaitExpression?.name) return this.createAwaitExpressionAst(cst);
		if (name === SlimeParser.prototype.YieldExpression?.name) return this.createYieldExpressionAst(cst);
		if (name === SlimeParser.prototype.MetaProperty?.name) return this.createMetaPropertyAst(cst);
		if (name === SlimeParser.prototype.SuperProperty?.name) return this.createSuperPropertyAst(cst);
		if (name === SlimeParser.prototype.SuperCall?.name) return this.createSuperCallAst(cst);
		if (name === SlimeParser.prototype.ImportCall?.name) return this.createImportCallAst(cst);
		if (name === SlimeParser.prototype.SpreadElement?.name) return this.createSpreadElementAst(cst);
		if (name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) return this.createCoverParenthesizedExpressionAndArrowParameterListAst(cst);
		if (name === SlimeParser.prototype.CoverCallExpressionAndAsyncArrowHead?.name) return this.createCoverCallExpressionAndAsyncArrowHeadAst(cst);
		if (name === SlimeParser.prototype.CoverInitializedName?.name) return this.createCoverInitializedNameAst(cst);
		if (name === SlimeParser.prototype.Statement?.name) return this.createStatementAst(cst);
		if (name === SlimeParser.prototype.StatementList?.name) return this.createStatementListAst(cst);
		if (name === SlimeParser.prototype.StatementListItem?.name) return this.createStatementListItemAst(cst);
		if (name === SlimeParser.prototype.Block?.name) return this.createBlockAst(cst);
		if (name === SlimeParser.prototype.BlockStatement?.name) return this.createBlockStatementAst(cst);
		if (name === SlimeParser.prototype.EmptyStatement?.name) return this.createEmptyStatementAst(cst);
		if (name === SlimeParser.prototype.ExpressionStatement?.name) return this.createExpressionStatementAst(cst);
		if (name === SlimeParser.prototype.IfStatement?.name) return this.createIfStatementAst(cst);
		if (name === SlimeParser.prototype.IfStatementBody?.name) return this.createIfStatementBodyAst(cst);
		if (name === SlimeParser.prototype.BreakableStatement?.name) return this.createBreakableStatementAst(cst);
		if (name === SlimeParser.prototype.IterationStatement?.name) return this.createIterationStatementAst(cst);
		if (name === SlimeParser.prototype.ForStatement?.name) return this.createForStatementAst(cst);
		if (name === SlimeParser.prototype.ForInOfStatement?.name) return this.createForInOfStatementAst(cst);
		if (name === SlimeParser.prototype.ForDeclaration?.name) return this.createForDeclarationAst(cst);
		if (name === SlimeParser.prototype.ForBinding?.name) return this.createForBindingAst(cst);
		if (name === SlimeParser.prototype.WhileStatement?.name) return this.createWhileStatementAst(cst);
		if (name === SlimeParser.prototype.DoWhileStatement?.name) return this.createDoWhileStatementAst(cst);
		if (name === SlimeParser.prototype.SwitchStatement?.name) return this.createSwitchStatementAst(cst);
		if (name === SlimeParser.prototype.CaseBlock?.name) return this.createCaseBlockAst(cst);
		if (name === SlimeParser.prototype.CaseClauses?.name) return this.createCaseClausesAst(cst);
		if (name === SlimeParser.prototype.CaseClause?.name) return this.createCaseClauseAst(cst);
		if (name === SlimeParser.prototype.DefaultClause?.name) return this.createDefaultClauseAst(cst);
		if (name === SlimeParser.prototype.BreakStatement?.name) return this.createBreakStatementAst(cst);
		if (name === SlimeParser.prototype.ContinueStatement?.name) return this.createContinueStatementAst(cst);
		if (name === SlimeParser.prototype.ReturnStatement?.name) return this.createReturnStatementAst(cst);
		if (name === SlimeParser.prototype.WithStatement?.name) return this.createWithStatementAst(cst);
		if (name === SlimeParser.prototype.LabelledStatement?.name) return this.createLabelledStatementAst(cst);
		if (name === SlimeParser.prototype.LabelledItem?.name) return this.createLabelledItemAst(cst);
		if (name === SlimeParser.prototype.ThrowStatement?.name) return this.createThrowStatementAst(cst);
		if (name === SlimeParser.prototype.TryStatement?.name) return this.createTryStatementAst(cst);
		if (name === SlimeParser.prototype.Catch?.name) return this.createCatchAst(cst);
		if (name === SlimeParser.prototype.CatchParameter?.name) return this.createCatchParameterAst(cst);
		if (name === SlimeParser.prototype.Finally?.name) return this.createFinallyAst(cst);
		if (name === SlimeParser.prototype.DebuggerStatement?.name) return this.createDebuggerStatementAst(cst);
		if (name === SlimeParser.prototype.SemicolonASI?.name) return this.createSemicolonASIAst(cst);
		if (name === SlimeParser.prototype.ExpressionBody?.name) return this.createExpressionBodyAst(cst);
		if (name === SlimeParser.prototype.Declaration?.name) return this.createDeclarationAst(cst);
		if (name === SlimeParser.prototype.HoistableDeclaration?.name) return this.createHoistableDeclarationAst(cst);
		if (name === SlimeParser.prototype.VariableStatement?.name) return this.createVariableStatementAst(cst);
		if (name === SlimeParser.prototype.VariableDeclaration?.name) return this.createVariableDeclarationAst(cst);
		if (name === SlimeParser.prototype.VariableDeclarationList?.name) return this.createVariableDeclarationListAst(cst);
		if (name === SlimeParser.prototype.LexicalDeclaration?.name) return this.createLexicalDeclarationAst(cst);
		if (name === SlimeParser.prototype.LetOrConst?.name) return this.createLetOrConstAst(cst);
		if (name === SlimeParser.prototype.LexicalBinding?.name) return this.createLexicalBindingAst(cst);
		if (name === SlimeParser.prototype.Initializer?.name) return this.createInitializerAst(cst);
		if (name === SlimeParser.prototype.FunctionDeclaration?.name) return this.createFunctionDeclarationAst(cst);
		if (name === SlimeParser.prototype.FunctionExpression?.name) return this.createFunctionExpressionAst(cst);
		if (name === SlimeParser.prototype.FunctionBody?.name) return this.createFunctionBodyAst(cst);
		if (name === SlimeParser.prototype.FunctionStatementList?.name) return this.createFunctionStatementListAst(cst);
		if (name === SlimeParser.prototype.FormalParameters?.name) return this.createFormalParametersAst(cst);
		if (name === SlimeParser.prototype.FormalParameterList?.name) return this.createFormalParameterListAst(cst);
		if (name === SlimeParser.prototype.FormalParameter?.name) return this.createFormalParameterAst(cst);
		if (name === SlimeParser.prototype.FunctionRestParameter?.name) return this.createFunctionRestParameterAst(cst);
		if (name === SlimeParser.prototype.UniqueFormalParameters?.name) return this.createUniqueFormalParametersAst(cst);
		if (name === SlimeParser.prototype.ArrowFunction?.name) return this.createArrowFunctionAst(cst);
		if (name === SlimeParser.prototype.ArrowParameters?.name) return this.createArrowParametersAst(cst);
		if (name === SlimeParser.prototype.ArrowFormalParameters?.name) return this.createArrowFormalParametersAst(cst);
		if (name === SlimeParser.prototype.ConciseBody?.name) return this.createConciseBodyAst(cst);
		if (name === SlimeParser.prototype.AsyncFunctionDeclaration?.name) return this.createAsyncFunctionDeclarationAst(cst);
		if (name === SlimeParser.prototype.AsyncFunctionExpression?.name) return this.createAsyncFunctionExpressionAst(cst);
		if (name === SlimeParser.prototype.AsyncFunctionBody?.name) return this.createAsyncFunctionBodyAst(cst);
		if (name === SlimeParser.prototype.AsyncArrowFunction?.name) return this.createAsyncArrowFunctionAst(cst);
		if (name === SlimeParser.prototype.AsyncArrowHead?.name) return this.createAsyncArrowHeadAst(cst);
		if (name === SlimeParser.prototype.AsyncArrowBindingIdentifier?.name) return this.createAsyncArrowBindingIdentifierAst(cst);
		if (name === SlimeParser.prototype.AsyncConciseBody?.name) return this.createAsyncConciseBodyAst(cst);
		if (name === SlimeParser.prototype.GeneratorDeclaration?.name) return this.createGeneratorDeclarationAst(cst);
		if (name === SlimeParser.prototype.GeneratorExpression?.name) return this.createGeneratorExpressionAst(cst);
		if (name === SlimeParser.prototype.GeneratorBody?.name) return this.createGeneratorBodyAst(cst);
		if (name === SlimeParser.prototype.AsyncGeneratorDeclaration?.name) return this.createAsyncGeneratorDeclarationAst(cst);
		if (name === SlimeParser.prototype.AsyncGeneratorExpression?.name) return this.createAsyncGeneratorExpressionAst(cst);
		if (name === SlimeParser.prototype.AsyncGeneratorBody?.name) return this.createAsyncGeneratorBodyAst(cst);
		if (name === SlimeParser.prototype.ClassDeclaration?.name) return this.createClassDeclarationAst(cst);
		if (name === SlimeParser.prototype.ClassExpression?.name) return this.createClassExpressionAst(cst);
		if (name === SlimeParser.prototype.ClassTail?.name) return this.createClassTailAst(cst);
		if (name === SlimeParser.prototype.ClassHeritage?.name) return this.createClassHeritageAst(cst);
		if (name === SlimeParser.prototype.ClassBody?.name) return this.createClassBodyAst(cst);
		if (name === SlimeParser.prototype.ClassElementList?.name) return this.createClassElementListAst(cst);
		if (name === SlimeParser.prototype.ClassElement?.name) return this.createClassElementAst(cst);
		if (name === SlimeParser.prototype.ClassElementName?.name) return this.createClassElementNameAst(cst);
		if (name === SlimeParser.prototype.ClassStaticBlock?.name) return this.createClassStaticBlockAst(cst);
		if (name === SlimeParser.prototype.ClassStaticBlockBody?.name) return this.createClassStaticBlockBodyAst(cst);
		if (name === SlimeParser.prototype.ClassStaticBlockStatementList?.name) return this.createClassStaticBlockStatementListAst(cst);
		if (name === SlimeParser.prototype.MethodDefinition?.name) return this.createMethodDefinitionAst(null, cst);
		if (name === SlimeParser.prototype.FieldDefinition?.name) return this.createFieldDefinitionAst(null, cst);
		if (name === SlimeParser.prototype.GeneratorMethod?.name) return this.createGeneratorMethodAst(cst);
		if (name === SlimeParser.prototype.AsyncMethod?.name) return this.createAsyncMethodAst(cst);
		if (name === SlimeParser.prototype.AsyncGeneratorMethod?.name) return this.createAsyncGeneratorMethodAst(cst);
		if (name === "PrivateIdentifier") return this.createPrivateIdentifierAst(cst);
		if (name === SlimeParser.prototype.PropertyDefinition?.name) return this.createPropertyDefinitionAst(cst);
		if (name === SlimeParser.prototype.PropertyName?.name) return this.createPropertyNameAst(cst);
		if (name === SlimeParser.prototype.ComputedPropertyName?.name) return this.createComputedPropertyNameAst(cst);
		if (name === SlimeParser.prototype.PropertySetParameterList?.name) return this.createPropertySetParameterListAst(cst);
		if (name === SlimeParser.prototype.BindingPattern?.name) return this.createBindingPatternAst(cst);
		if (name === SlimeParser.prototype.ObjectBindingPattern?.name) return this.createObjectBindingPatternAst(cst);
		if (name === SlimeParser.prototype.ArrayBindingPattern?.name) return this.createArrayBindingPatternAst(cst);
		if (name === SlimeParser.prototype.BindingPropertyList?.name) return this.createBindingPropertyListAst(cst);
		if (name === SlimeParser.prototype.BindingProperty?.name) return this.createBindingPropertyAst(cst);
		if (name === SlimeParser.prototype.BindingElementList?.name) return this.createBindingElementListAst(cst);
		if (name === SlimeParser.prototype.BindingElisionElement?.name) return this.createBindingElisionElementAst(cst);
		if (name === SlimeParser.prototype.BindingElement?.name) return this.createBindingElementAst(cst);
		if (name === SlimeParser.prototype.BindingRestElement?.name) return this.createBindingRestElementAst(cst);
		if (name === SlimeParser.prototype.BindingRestProperty?.name) return this.createBindingRestPropertyAst(cst);
		if (name === SlimeParser.prototype.SingleNameBinding?.name) return this.createSingleNameBindingAst(cst);
		if (name === SlimeParser.prototype.AssignmentPattern?.name) return this.createAssignmentPatternAst(cst);
		if (name === SlimeParser.prototype.ObjectAssignmentPattern?.name) return this.createObjectAssignmentPatternAst(cst);
		if (name === SlimeParser.prototype.ArrayAssignmentPattern?.name) return this.createArrayAssignmentPatternAst(cst);
		if (name === SlimeParser.prototype.AssignmentPropertyList?.name) return this.createAssignmentPropertyListAst(cst);
		if (name === SlimeParser.prototype.AssignmentProperty?.name) return this.createAssignmentPropertyAst(cst);
		if (name === SlimeParser.prototype.AssignmentElementList?.name) return this.createAssignmentElementListAst(cst);
		if (name === SlimeParser.prototype.AssignmentElisionElement?.name) return this.createAssignmentElisionElementAst(cst);
		if (name === SlimeParser.prototype.AssignmentElement?.name) return this.createAssignmentElementAst(cst);
		if (name === SlimeParser.prototype.AssignmentRestElement?.name) return this.createAssignmentRestElementAst(cst);
		if (name === SlimeParser.prototype.AssignmentRestProperty?.name) return this.createAssignmentRestPropertyAst(cst);
		if (name === SlimeParser.prototype.Elision?.name) return this.createElisionAst(cst);
		if (name === SlimeParser.prototype.ElementList?.name) return this.createElementListAst(cst);
		if (name === SlimeParser.prototype.Module?.name) return this.createModuleAst(cst);
		if (name === SlimeParser.prototype.ModuleBody?.name) return this.createModuleBodyAst(cst);
		if (name === SlimeParser.prototype.ModuleItem?.name) return this.createModuleItemAst(cst);
		if (name === SlimeParser.prototype.ModuleItemList?.name) return this.createModuleItemListAst(cst);
		if (name === SlimeParser.prototype.ImportDeclaration?.name) return this.createImportDeclarationAst(cst);
		if (name === SlimeParser.prototype.ImportClause?.name) return this.createImportClauseAst(cst);
		if (name === SlimeParser.prototype.ImportedDefaultBinding?.name) return this.createImportedDefaultBindingAst(cst);
		if (name === SlimeParser.prototype.NameSpaceImport?.name) return this.createNameSpaceImportAst(cst);
		if (name === SlimeParser.prototype.NamedImports?.name) return this.createNamedImportsAst(cst);
		if (name === SlimeParser.prototype.ImportsList?.name) return this.createImportsListAst(cst);
		if (name === SlimeParser.prototype.ImportSpecifier?.name) return this.createImportSpecifierAst(cst);
		if (name === SlimeParser.prototype.ImportedBinding?.name) return this.createImportedBindingAst(cst);
		if (name === SlimeParser.prototype.ModuleSpecifier?.name) return this.createModuleSpecifierAst(cst);
		if (name === SlimeParser.prototype.FromClause?.name) return this.createFromClauseAst(cst);
		if (name === SlimeParser.prototype.ModuleExportName?.name) return this.createModuleExportNameAst(cst);
		if (name === SlimeParser.prototype.ExportDeclaration?.name) return this.createExportDeclarationAst(cst);
		if (name === SlimeParser.prototype.ExportFromClause?.name) return this.createExportFromClauseAst(cst);
		if (name === SlimeParser.prototype.NamedExports?.name) return this.createNamedExportsAst(cst);
		if (name === SlimeParser.prototype.ExportsList?.name) return this.createExportsListAst(cst);
		if (name === SlimeParser.prototype.ExportSpecifier?.name) return this.createExportSpecifierAst(cst);
		if (name === SlimeParser.prototype.WithClause?.name) return this.createWithClauseAst(cst);
		if (name === SlimeParser.prototype.WithEntries?.name) return this.createWithEntriesAst(cst);
		if (name === SlimeParser.prototype.AttributeKey?.name) return this.createAttributeKeyAst(cst);
		if (name === SlimeParser.prototype.Program?.name) return this.createProgramAst(cst);
		if (name === SlimeParser.prototype.Script?.name) return this.createScriptAst(cst);
		if (name === SlimeParser.prototype.ScriptBody?.name) return this.createScriptBodyAst(cst);
		if (name === SlimeParser.prototype.Arguments?.name) return this.createArgumentsAst(cst);
		if (name === SlimeParser.prototype.ArgumentList?.name) return this.createArgumentListAst(cst);
		if (name === SlimeParser.prototype.AssignmentOperator?.name) return this.createAssignmentOperatorAst(cst);
		if (name === SlimeParser.prototype.MultiplicativeOperator?.name) return this.createMultiplicativeOperatorAst(cst);
		if (cst.children && cst.children.length === 1) return this.createAstFromCst(cst.children[0]);
		throw new Error(`No conversion method found for CST node: ${name}`);
	}
	/**
	* 创建 IdentifierReference �?AST
	*
	* 语法：IdentifierReference -> Identifier | yield | await
	*
	* IdentifierReference 是对 Identifier 的引用包装，
	* �?ES 规范中用于区分标识符的不同使用场景�?
	*/
	createIdentifierReferenceAst(cst) {
		const expectedName = SlimeParser.prototype.IdentifierReference?.name || "IdentifierReference";
		if (cst.name !== expectedName && cst.name !== "IdentifierReference") throw new Error(`Expected IdentifierReference, got ${cst.name}`);
		const child = cst.children?.[0];
		if (!child) throw new Error("IdentifierReference has no children");
		return this.createIdentifierAst(child);
	}
	/**
	* 创建 LabelIdentifier �?AST
	*
	* 语法：LabelIdentifier -> Identifier | [~Yield] yield | [~Await] await
	*
	* LabelIdentifier 用于 break/continue 语句的标签和 LabelledStatement 的标签�?
	* 结构�?IdentifierReference 相同�?
	*/
	createLabelIdentifierAst(cst) {
		const expectedName = SlimeParser.prototype.LabelIdentifier?.name || "LabelIdentifier";
		if (cst.name !== expectedName && cst.name !== "LabelIdentifier") throw new Error(`Expected LabelIdentifier, got ${cst.name}`);
		const child = cst.children?.[0];
		if (!child) throw new Error("LabelIdentifier has no children");
		return this.createIdentifierAst(child);
	}
	createIdentifierAst(cst) {
		const expectedName = SlimeParser.prototype.Identifier?.name || "Identifier";
		const isIdentifier = cst.name === expectedName || cst.name === "Identifier";
		const isIdentifierName = cst.name === "IdentifierName" || cst.name === SlimeParser.prototype.IdentifierName?.name;
		const isYield = cst.name === "Yield";
		const isAwait = cst.name === "Await";
		let value;
		let tokenLoc = void 0;
		if (isYield || isAwait) {
			value = cst.value || cst.name.toLowerCase();
			tokenLoc = cst.loc;
		} else if (isIdentifierName) if (cst.value !== void 0 && cst.value !== null) {
			value = cst.value;
			tokenLoc = cst.loc;
		} else if (cst.children && cst.children.length > 0) {
			const tokenCst = cst.children[0];
			if (tokenCst.value !== void 0) {
				value = tokenCst.value;
				tokenLoc = tokenCst.loc || cst.loc;
			} else throw new Error(`createIdentifierAst: Cannot extract value from IdentifierName CST`);
		} else throw new Error(`createIdentifierAst: Invalid IdentifierName CST structure`);
		else if (!isIdentifier) throw new Error(`Expected Identifier, got ${cst.name}`);
		else if (cst.value !== void 0 && cst.value !== null) {
			value = cst.value;
			tokenLoc = cst.loc;
		} else if (cst.children && cst.children.length > 0) {
			const tokenCst = cst.children[0];
			if (tokenCst.value !== void 0) {
				value = tokenCst.value;
				tokenLoc = tokenCst.loc || cst.loc;
			} else throw new Error(`createIdentifierAst: Cannot extract value from Identifier CST`);
		} else throw new Error(`createIdentifierAst: Invalid Identifier CST structure`);
		const decodedName = decodeUnicodeEscapes(value);
		return SlimeNodeCreate_default$1.createIdentifier(decodedName, tokenLoc || cst.loc);
	}
	/**
	* [入口方法] 将顶�?CST 转换�?Program AST
	*
	* 存在必要性：这是外部调用的主入口，支�?Module、Script、Program 多种顶层 CST�?
	*/
	toProgram(cst) {
		const isModule = cst.name === SlimeParser.prototype.Module?.name || cst.name === "Module";
		const isScript = cst.name === SlimeParser.prototype.Script?.name || cst.name === "Script";
		const isProgram = cst.name === SlimeParser.prototype.Program?.name || cst.name === "Program";
		if (!isModule && !isScript && !isProgram) throw new Error(`Expected CST name 'Module', 'Script' or 'Program', but got '${cst.name}'`);
		let program;
		let hashbangComment = null;
		if (!cst.children || cst.children.length === 0) return SlimeNodeCreate_default$1.createProgram([], isModule ? "module" : "script");
		let bodyChild = null;
		for (const child of cst.children) if (child.name === "HashbangComment") hashbangComment = child.value || child.children?.[0]?.value || null;
		else if (child.name === "ModuleBody" || child.name === "ScriptBody" || child.name === "ModuleItemList" || child.name === SlimeParser.prototype.ModuleItemList?.name || child.name === "StatementList" || child.name === SlimeParser.prototype.StatementList?.name) bodyChild = child;
		if (bodyChild) if (bodyChild.name === "ModuleBody") {
			const moduleItemList = bodyChild.children?.[0];
			if (moduleItemList && (moduleItemList.name === "ModuleItemList" || moduleItemList.name === SlimeParser.prototype.ModuleItemList?.name)) {
				const body = this.createModuleItemListAst(moduleItemList);
				program = SlimeNodeCreate_default$1.createProgram(body, "module");
			} else program = SlimeNodeCreate_default$1.createProgram([], "module");
		} else if (bodyChild.name === SlimeParser.prototype.ModuleItemList?.name || bodyChild.name === "ModuleItemList") {
			const body = this.createModuleItemListAst(bodyChild);
			program = SlimeNodeCreate_default$1.createProgram(body, "module");
		} else if (bodyChild.name === "ScriptBody") {
			const statementList = bodyChild.children?.[0];
			if (statementList && (statementList.name === "StatementList" || statementList.name === SlimeParser.prototype.StatementList?.name)) {
				const body = this.createStatementListAst(statementList);
				program = SlimeNodeCreate_default$1.createProgram(body, "script");
			} else program = SlimeNodeCreate_default$1.createProgram([], "script");
		} else if (bodyChild.name === SlimeParser.prototype.StatementList?.name || bodyChild.name === "StatementList") {
			const body = this.createStatementListAst(bodyChild);
			program = SlimeNodeCreate_default$1.createProgram(body, "script");
		} else throw new Error(`Unexpected body child: ${bodyChild.name}`);
		else program = SlimeNodeCreate_default$1.createProgram([], isModule ? "module" : "script");
		if (hashbangComment) program.hashbang = hashbangComment;
		program.loc = cst.loc;
		return program;
	}
	createModuleItemListAst(cst) {
		return cst.children.map((item) => {
			if (item.name === SlimeParser.prototype.ModuleItem?.name || item.name === "ModuleItem") {
				const innerItem = item.children?.[0];
				if (!innerItem) return void 0;
				return this.createModuleItemAst(innerItem);
			}
			return this.createModuleItemAst(item);
		}).filter((ast) => ast !== void 0).flat();
	}
	/**
	* Program CST �?AST
	*
	* 存在必要性：Program 是顶层入口规则，需要处�?Script �?Module 两种情况�?
	*/
	createProgramAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) {
			if (firstChild.name === "Script" || firstChild.name === SlimeParser.prototype.Script?.name) return this.createScriptAst(firstChild);
			else if (firstChild.name === "Module" || firstChild.name === SlimeParser.prototype.Module?.name) return this.createModuleAst(firstChild);
		}
		return this.toProgram(cst);
	}
	/**
	* Script CST �?AST
	*/
	createScriptAst(cst) {
		const scriptBody = cst.children?.find((ch) => ch.name === "ScriptBody" || ch.name === SlimeParser.prototype.ScriptBody?.name);
		if (scriptBody) return this.createScriptBodyAst(scriptBody);
		return SlimeNodeCreate_default$1.createProgram([], "script");
	}
	/**
	* ScriptBody CST �?AST
	*/
	createScriptBodyAst(cst) {
		const stmtList = cst.children?.find((ch) => ch.name === "StatementList" || ch.name === SlimeParser.prototype.StatementList?.name);
		if (stmtList) {
			const body = this.createStatementListAst(stmtList);
			return SlimeNodeCreate_default$1.createProgram(body, "script");
		}
		return SlimeNodeCreate_default$1.createProgram([], "script");
	}
	/**
	* Module CST �?AST
	*/
	createModuleAst(cst) {
		const moduleBody = cst.children?.find((ch) => ch.name === "ModuleBody" || ch.name === SlimeParser.prototype.ModuleBody?.name);
		if (moduleBody) return this.createModuleBodyAst(moduleBody);
		return SlimeNodeCreate_default$1.createProgram([], "module");
	}
	/**
	* ModuleBody CST �?AST
	*/
	createModuleBodyAst(cst) {
		const moduleItemList = cst.children?.find((ch) => ch.name === "ModuleItemList" || ch.name === SlimeParser.prototype.ModuleItemList?.name);
		if (moduleItemList) {
			const body = this.createModuleItemListAst(moduleItemList);
			return SlimeNodeCreate_default$1.createProgram(body, "module");
		}
		return SlimeNodeCreate_default$1.createProgram([], "module");
	}
	/**
	* NameSpaceImport CST �?AST
	* NameSpaceImport -> * as ImportedBinding
	*/
	createNameSpaceImportAst(cst) {
		let asteriskToken = void 0;
		let asToken = void 0;
		for (const child of cst.children) if (child.name === "Asterisk" || child.value === "*") asteriskToken = SlimeTokenCreate_default$1.createAsteriskToken(child.loc);
		else if (child.name === "As" || child.value === "as") asToken = SlimeTokenCreate_default$1.createAsToken(child.loc);
		const binding = cst.children.find((ch) => ch.name === SlimeParser.prototype.ImportedBinding?.name);
		if (!binding) throw new Error("NameSpaceImport missing ImportedBinding");
		const local = this.createImportedBindingAst(binding);
		return SlimeNodeCreate_default$1.createImportNamespaceSpecifier(local, cst.loc, asteriskToken, asToken);
	}
	/**
	* NamedImports CST 转 AST
	* NamedImports -> { } | { ImportsList } | { ImportsList , }
	*/
	createNamedImportsAst(cst) {
		const importsList = cst.children.find((ch) => ch.name === SlimeParser.prototype.ImportsList?.name);
		if (!importsList) return [];
		const specifiers = [];
		for (const child of importsList.children) if (child.name === SlimeParser.prototype.ImportSpecifier?.name) {
			const identifierName = child.children.find((ch) => ch.name === SlimeParser.prototype.IdentifierName?.name);
			const binding = child.children.find((ch) => ch.name === SlimeParser.prototype.ImportedBinding?.name);
			if (identifierName && binding) {
				const imported = this.createIdentifierNameAst(identifierName);
				const local = this.createImportedBindingAst(binding);
				specifiers.push({
					type: SlimeNodeType$1.ImportSpecifier,
					imported,
					local,
					loc: child.loc
				});
			} else if (binding) {
				const id = this.createImportedBindingAst(binding);
				specifiers.push({
					type: SlimeNodeType$1.ImportSpecifier,
					imported: id,
					local: id,
					loc: child.loc
				});
			}
		}
		return specifiers;
	}
	/**
	* ImportsList CST �?AST
	* ImportsList -> ImportSpecifier (, ImportSpecifier)*
	*/
	createImportsListAst(cst) {
		const specifiers = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.ImportSpecifier?.name || child.name === "ImportSpecifier") specifiers.push(this.createImportSpecifierAst(child));
		return specifiers;
	}
	/**
	* ImportSpecifier CST �?AST
	* ImportSpecifier -> ImportedBinding | ModuleExportName as ImportedBinding
	*/
	createImportSpecifierAst(cst) {
		const children = cst.children || [];
		let imported = null;
		let local = null;
		let asToken = void 0;
		for (const child of children) if (child.name === "As" || child.value === "as") asToken = SlimeTokenCreate_default$1.createAsToken(child.loc);
		else if (child.name === SlimeParser.prototype.ImportedBinding?.name || child.name === "ImportedBinding") local = this.createImportedBindingAst(child);
		else if (child.name === SlimeParser.prototype.ModuleExportName?.name || child.name === "ModuleExportName" || child.name === SlimeParser.prototype.IdentifierName?.name || child.name === "IdentifierName") {
			if (!imported) imported = this.createModuleExportNameAst(child);
		}
		if (!local && imported) local = { ...imported };
		if (!imported && local) imported = { ...local };
		return SlimeNodeCreate_default$1.createImportSpecifier(imported, local, asToken);
	}
	/**
	* AttributeKey CST �?AST
	* AttributeKey -> IdentifierName | StringLiteral
	*/
	createAttributeKeyAst(cst) {
		const firstChild = cst.children?.[0];
		if (!firstChild) throw new Error("AttributeKey has no children");
		if (firstChild.name === SlimeParser.prototype.IdentifierName?.name || firstChild.name === "IdentifierName" || firstChild.value !== void 0 && !firstChild.value.startsWith("\"") && !firstChild.value.startsWith("'")) return this.createIdentifierNameAst(firstChild);
		else return this.createStringLiteralAst(firstChild);
	}
	/**
	* ExportFromClause CST �?AST
	* ExportFromClause -> * | * as ModuleExportName | NamedExports
	*/
	createExportFromClauseAst(cst) {
		const children = cst.children || [];
		if (children.find((ch) => ch.name === "Asterisk" || ch.value === "*")) {
			const asTok = children.find((ch) => ch.name === "As" || ch.value === "as");
			const exportedName = children.find((ch) => ch.name === SlimeParser.prototype.ModuleExportName?.name || ch.name === "ModuleExportName");
			if (asTok && exportedName) return {
				type: "exportAll",
				exported: this.createModuleExportNameAst(exportedName)
			};
			else return {
				type: "exportAll",
				exported: null
			};
		}
		const namedExports = children.find((ch) => ch.name === SlimeParser.prototype.NamedExports?.name || ch.name === "NamedExports");
		if (namedExports) return {
			type: "namedExports",
			specifiers: this.createNamedExportsAst(namedExports)
		};
		return { type: "unknown" };
	}
	/**
	* WithEntries CST �?AST
	* WithEntries -> AttributeKey : StringLiteral (, AttributeKey : StringLiteral)*
	*/
	createWithEntriesAst(cst) {
		const entries = [];
		let currentKey = null;
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.AttributeKey?.name || child.name === "AttributeKey") currentKey = this.createAttributeKeyAst(child);
		else if (child.name === "StringLiteral" || child.value && (child.value.startsWith("\"") || child.value.startsWith("'"))) {
			if (currentKey) {
				entries.push({
					type: "ImportAttribute",
					key: currentKey,
					value: this.createStringLiteralAst(child)
				});
				currentKey = null;
			}
		}
		return entries;
	}
	createModuleItemAst(item) {
		const name = item.name;
		if (name === SlimeParser.prototype.ExportDeclaration?.name || name === "ExportDeclaration") return this.createExportDeclarationAst(item);
		else if (name === SlimeParser.prototype.ImportDeclaration?.name || name === "ImportDeclaration") return this.createImportDeclarationAst(item);
		else if (name === SlimeParser.prototype.StatementListItem?.name || name === "StatementListItem") return this.createStatementListItemAst(item);
		console.warn(`createModuleItemAst: Unknown item type: ${name}`);
	}
	createImportDeclarationAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ImportDeclaration?.name);
		const first = cst.children[0];
		const first1 = cst.children[1];
		let importDeclaration;
		let importToken = void 0;
		let semicolonToken = void 0;
		if (first && (first.name === "Import" || first.value === "import")) importToken = SlimeTokenCreate_default$1.createImportToken(first.loc);
		const semicolonCst = cst.children.find((ch) => ch.name === "Semicolon" || ch.value === ";");
		if (semicolonCst) semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(semicolonCst.loc);
		const withClauseCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.WithClause?.name || ch.name === "WithClause");
		let attributes = [];
		let withToken = void 0;
		if (withClauseCst) {
			const parsed = this.createWithClauseAst(withClauseCst);
			attributes = parsed.attributes;
			withToken = parsed.withToken;
		}
		if (first1.name === SlimeParser.prototype.ImportClause?.name) {
			const clauseResult = this.createImportClauseAst(first1);
			const fromClause = this.createFromClauseAst(cst.children[2]);
			importDeclaration = SlimeNodeCreate_default$1.createImportDeclaration(clauseResult.specifiers, fromClause.source, cst.loc, importToken, fromClause.fromToken, clauseResult.lBraceToken, clauseResult.rBraceToken, semicolonToken, attributes, withToken);
		} else if (first1.name === SlimeParser.prototype.ModuleSpecifier?.name) {
			const source = this.createModuleSpecifierAst(first1);
			importDeclaration = SlimeNodeCreate_default$1.createImportDeclaration([], source, cst.loc, importToken, void 0, void 0, void 0, semicolonToken, attributes, withToken);
		}
		return importDeclaration;
	}
	/** 解析 WithClause: with { type: "json" } */
	createWithClauseAst(cst) {
		let withToken = void 0;
		const attributes = [];
		for (const child of cst.children || []) if (child.name === "With" || child.value === "with") withToken = {
			type: "With",
			value: "with",
			loc: child.loc
		};
		else if (child.name === SlimeParser.prototype.WithEntries?.name || child.name === "WithEntries") {
			let currentKey = null;
			for (const entry of child.children || []) if (entry.name === SlimeParser.prototype.AttributeKey?.name || entry.name === "AttributeKey") {
				const keyChild = entry.children?.[0];
				if (keyChild) {
					if (keyChild.name === "IdentifierName" || keyChild.name === SlimeParser.prototype.IdentifierName?.name) {
						const nameToken = keyChild.children?.[0];
						currentKey = {
							type: SlimeNodeType$1.Identifier,
							name: nameToken?.value || keyChild.value,
							loc: keyChild.loc
						};
					} else if (keyChild.name === "StringLiteral" || keyChild.value?.startsWith("\"") || keyChild.value?.startsWith("'")) currentKey = this.createStringLiteralAst(keyChild);
				}
			} else if (entry.name === "StringLiteral" || entry.value?.startsWith("\"") || entry.value?.startsWith("'")) {
				if (currentKey) {
					attributes.push({
						type: "ImportAttribute",
						key: currentKey,
						value: this.createStringLiteralAst(entry),
						loc: {
							...currentKey.loc,
							end: entry.loc?.end
						}
					});
					currentKey = null;
				}
			}
		}
		return {
			attributes,
			withToken
		};
	}
	createFromClauseAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.FromClause?.name);
		const first = cst.children[0];
		const ModuleSpecifier = this.createModuleSpecifierAst(cst.children[1]);
		let fromToken = void 0;
		if (first && (first.name === "From" || first.value === "from")) fromToken = SlimeTokenCreate_default$1.createFromToken(first.loc);
		return {
			source: ModuleSpecifier,
			fromToken
		};
	}
	createModuleSpecifierAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ModuleSpecifier?.name);
		const first = cst.children[0];
		return SlimeNodeCreate_default$1.createStringLiteral(first.value);
	}
	createImportClauseAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ImportClause?.name);
		const result = [];
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.ImportedDefaultBinding?.name) {
			const specifier = this.createImportedDefaultBindingAst(first);
			const commaCst = cst.children.find((ch) => ch.name === "Comma" || ch.value === ",");
			const commaToken = commaCst ? SlimeTokenCreate_default$1.createCommaToken(commaCst.loc) : void 0;
			result.push(SlimeNodeCreate_default$1.createImportSpecifierItem(specifier, commaToken));
			const namedImportsCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.NamedImports?.name || ch.name === "NamedImports");
			const namespaceImportCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.NameSpaceImport?.name || ch.name === "NameSpaceImport");
			if (namedImportsCst) {
				const namedResult = this.createNamedImportsListAstWrapped(namedImportsCst);
				result.push(...namedResult.specifiers);
				lBraceToken = namedResult.lBraceToken;
				rBraceToken = namedResult.rBraceToken;
			} else if (namespaceImportCst) result.push(SlimeNodeCreate_default$1.createImportSpecifierItem(this.createNameSpaceImportAst(namespaceImportCst), void 0));
		} else if (first.name === SlimeParser.prototype.NameSpaceImport?.name) result.push(SlimeNodeCreate_default$1.createImportSpecifierItem(this.createNameSpaceImportAst(first), void 0));
		else if (first.name === SlimeParser.prototype.NamedImports?.name) {
			const namedResult = this.createNamedImportsListAstWrapped(first);
			result.push(...namedResult.specifiers);
			lBraceToken = namedResult.lBraceToken;
			rBraceToken = namedResult.rBraceToken;
		}
		return {
			specifiers: result,
			lBraceToken,
			rBraceToken
		};
	}
	createImportedDefaultBindingAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ImportedDefaultBinding?.name);
		const first = cst.children[0];
		const id = this.createImportedBindingAst(first);
		return SlimeNodeCreate_default$1.createImportDefaultSpecifier(id);
	}
	createImportedBindingAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ImportedBinding?.name);
		const first = cst.children[0];
		return this.createBindingIdentifierAst(first);
	}
	/** 返回包装类型的版本，包含 brace tokens */
	createNamedImportsListAstWrapped(cst) {
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children || []) if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
		else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
		const importsList = cst.children.find((ch) => ch.name === SlimeParser.prototype.ImportsList?.name);
		if (!importsList) return {
			specifiers: [],
			lBraceToken,
			rBraceToken
		};
		const specifiers = [];
		let currentSpec = null;
		let hasSpec = false;
		for (let i = 0; i < importsList.children.length; i++) {
			const child = importsList.children[i];
			if (child.name === SlimeParser.prototype.ImportSpecifier?.name) {
				if (hasSpec) specifiers.push(SlimeNodeCreate_default$1.createImportSpecifierItem(currentSpec, void 0));
				const moduleExportName = child.children.find((ch) => ch.name === SlimeParser.prototype.ModuleExportName?.name || ch.name === "ModuleExportName");
				const binding = child.children.find((ch) => ch.name === SlimeParser.prototype.ImportedBinding?.name || ch.name === "ImportedBinding");
				if (moduleExportName && binding) {
					const imported = this.createModuleExportNameAst(moduleExportName);
					const local = this.createImportedBindingAst(binding);
					currentSpec = {
						type: SlimeNodeType$1.ImportSpecifier,
						imported,
						local,
						loc: child.loc
					};
				} else if (binding) {
					const id = this.createImportedBindingAst(binding);
					currentSpec = {
						type: SlimeNodeType$1.ImportSpecifier,
						imported: id,
						local: id,
						loc: child.loc
					};
				}
				hasSpec = true;
			} else if (child.name === "Comma" || child.value === ",") {
				if (hasSpec) {
					const commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
					specifiers.push(SlimeNodeCreate_default$1.createImportSpecifierItem(currentSpec, commaToken));
					hasSpec = false;
					currentSpec = null;
				}
			}
		}
		if (hasSpec) specifiers.push(SlimeNodeCreate_default$1.createImportSpecifierItem(currentSpec, void 0));
		return {
			specifiers,
			lBraceToken,
			rBraceToken
		};
	}
	createIdentifierNameAst(cst) {
		if (cst.value !== void 0) {
			const decodedName = decodeUnicodeEscapes(cst.value);
			return SlimeNodeCreate_default$1.createIdentifier(decodedName, cst.loc);
		}
		let current = cst;
		while (current.children && current.children.length > 0 && current.value === void 0) current = current.children[0];
		if (current.value !== void 0) {
			const decodedName = decodeUnicodeEscapes(current.value);
			return SlimeNodeCreate_default$1.createIdentifier(decodedName, current.loc || cst.loc);
		}
		throw new Error(`createIdentifierNameAst: Cannot extract value from IdentifierName`);
	}
	createBindingIdentifierAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BindingIdentifier?.name);
		const first = cst.children[0];
		if (first.name === "Identifier" || first.name === SlimeParser.prototype.Identifier?.name) {
			const tokenCst = first.children?.[0];
			if (tokenCst && tokenCst.value !== void 0) return SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
		}
		if (first.value !== void 0) return SlimeNodeCreate_default$1.createIdentifier(first.value, first.loc);
		throw new Error(`createBindingIdentifierAst: Cannot extract identifier value from ${first.name}`);
	}
	createStatementListAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.StatementList?.name);
		if (cst.children) return cst.children.map((item) => this.createStatementListItemAst(item)).flat();
		return [];
	}
	createStatementListItemAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.StatementListItem?.name);
		return cst.children.map((item) => {
			if (item.name === SlimeParser.prototype.Declaration?.name) return [this.createDeclarationAst(item)];
			return this.createStatementAst(item).flat().map((stmt) => {
				if (stmt.type === SlimeNodeType$1.ExpressionStatement) {
					const expr = stmt.expression;
					if (expr.type === SlimeNodeType$1.FunctionExpression) {
						const funcExpr = expr;
						if (funcExpr.id) return {
							type: SlimeNodeType$1.FunctionDeclaration,
							id: funcExpr.id,
							params: funcExpr.params,
							body: funcExpr.body,
							generator: funcExpr.generator,
							async: funcExpr.async,
							loc: funcExpr.loc
						};
					}
					if (expr.type === SlimeNodeType$1.ClassExpression) {
						const classExpr = expr;
						if (classExpr.id) return {
							type: SlimeNodeType$1.ClassDeclaration,
							id: classExpr.id,
							superClass: classExpr.superClass,
							body: classExpr.body,
							loc: classExpr.loc
						};
					}
				}
				return stmt;
			});
		}).flat();
	}
	createStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Statement?.name);
		return cst.children.map((item) => this.createStatementDeclarationAst(item)).filter((stmt) => stmt !== void 0);
	}
	/**
	* [核心分发方法] 根据 CST 节点类型创建对应�?Statement/Declaration AST
	*
	* 存在必要性：ECMAScript 语法�?Statement �?Declaration 有多种具体类型，
	* 需要一个统一的分发方法来处理各种语句和声明�?
	*
	* 处理的节点类型包括：
	* - Statement 包装节点 �?递归处理子节�?
	* - BreakableStatement �?IterationStatement | SwitchStatement
	* - VariableStatement �?VariableDeclaration
	* - ExpressionStatement �?ExpressionStatement
	* - IfStatement, ForStatement, WhileStatement 等具体语�?
	* - FunctionDeclaration, ClassDeclaration 等声�?
	*/
	createStatementDeclarationAst(cst) {
		if (cst.name === SlimeParser.prototype.Statement?.name || cst.name === "Statement") {
			if (cst.children && cst.children.length > 0) return this.createStatementDeclarationAst(cst.children[0]);
			return;
		} else if (cst.name === SlimeParser.prototype.BreakableStatement?.name) {
			if (cst.children && cst.children.length > 0) return this.createStatementDeclarationAst(cst.children[0]);
			return;
		} else if (cst.name === SlimeParser.prototype.IterationStatement?.name) {
			if (cst.children && cst.children.length > 0) return this.createStatementDeclarationAst(cst.children[0]);
			return;
		} else if (cst.name === "IfStatementBody") {
			if (cst.children && cst.children.length > 0) return this.createStatementDeclarationAst(cst.children[0]);
			return;
		} else if (cst.name === SlimeParser.prototype.VariableStatement?.name || cst.name === "VariableStatement") return this.createVariableStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.VariableDeclaration?.name) return this.createVariableDeclarationAst(cst);
		else if (cst.name === SlimeParser.prototype.ExpressionStatement?.name) return this.createExpressionStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.ReturnStatement?.name) return this.createReturnStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.IfStatement?.name) return this.createIfStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.ForStatement?.name) return this.createForStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.ForInOfStatement?.name) return this.createForInOfStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.WhileStatement?.name) return this.createWhileStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.DoWhileStatement?.name) return this.createDoWhileStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.BlockStatement?.name) return this.createBlockStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.SwitchStatement?.name) return this.createSwitchStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.TryStatement?.name) return this.createTryStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.ThrowStatement?.name) return this.createThrowStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.BreakStatement?.name) return this.createBreakStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.ContinueStatement?.name) return this.createContinueStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.LabelledStatement?.name) return this.createLabelledStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.WithStatement?.name) return this.createWithStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.DebuggerStatement?.name) return this.createDebuggerStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.EmptyStatement?.name) return this.createEmptyStatementAst(cst);
		else if (cst.name === SlimeParser.prototype.FunctionDeclaration?.name) return this.createFunctionDeclarationAst(cst);
		else if (cst.name === SlimeParser.prototype.ClassDeclaration?.name) return this.createClassDeclarationAst(cst);
	}
	createExportDeclarationAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ExportDeclaration?.name);
		const children = cst.children || [];
		let exportToken = void 0;
		let defaultToken = void 0;
		let asteriskToken = void 0;
		let semicolonToken = void 0;
		let asToken = void 0;
		let exportFromClause = null;
		let fromClause = null;
		let namedExports = null;
		let variableStatement = null;
		let declaration = null;
		let hoistableDeclaration = null;
		let classDeclaration = null;
		let assignmentExpression = null;
		let withClauseCst = null;
		let isDefault = false;
		for (const child of children) {
			const name = child.name;
			if (name === SlimeTokenConsumer.prototype.Export?.name || child.value === "export") exportToken = SlimeTokenCreate_default$1.createExportToken(child.loc);
			else if (name === SlimeTokenConsumer.prototype.Default?.name || child.value === "default") {
				defaultToken = SlimeTokenCreate_default$1.createDefaultToken(child.loc);
				isDefault = true;
			} else if (name === SlimeTokenConsumer.prototype.Asterisk?.name || child.value === "*") asteriskToken = SlimeTokenCreate_default$1.createAsteriskToken(child.loc);
			else if (name === SlimeTokenConsumer.prototype.Semicolon?.name || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
			else if (name === SlimeTokenConsumer.prototype.As?.name || child.value === "as") asToken = SlimeTokenCreate_default$1.createAsToken(child.loc);
			else if (name === SlimeParser.prototype.ExportFromClause?.name) exportFromClause = child;
			else if (name === SlimeParser.prototype.FromClause?.name) fromClause = child;
			else if (name === SlimeParser.prototype.NamedExports?.name) namedExports = child;
			else if (name === SlimeParser.prototype.VariableStatement?.name) variableStatement = child;
			else if (name === SlimeParser.prototype.Declaration?.name) declaration = child;
			else if (name === SlimeParser.prototype.HoistableDeclaration?.name) hoistableDeclaration = child;
			else if (name === SlimeParser.prototype.ClassDeclaration?.name) classDeclaration = child;
			else if (name === SlimeParser.prototype.AssignmentExpression?.name) assignmentExpression = child;
			else if (name === SlimeParser.prototype.WithClause?.name || name === "WithClause") withClauseCst = child;
		}
		let attributes = [];
		let withToken = void 0;
		if (withClauseCst) {
			const parsed = this.createWithClauseAst(withClauseCst);
			attributes = parsed.attributes;
			withToken = parsed.withToken;
		}
		if (isDefault) {
			let decl = null;
			if (hoistableDeclaration) decl = this.createHoistableDeclarationAst(hoistableDeclaration);
			else if (classDeclaration) decl = this.createClassDeclarationAst(classDeclaration);
			else if (assignmentExpression) decl = this.createAssignmentExpressionAst(assignmentExpression);
			return SlimeNodeCreate_default$1.createExportDefaultDeclaration(decl, cst.loc, exportToken, defaultToken);
		}
		if (exportFromClause && fromClause) {
			const fromClauseResult = this.createFromClauseAst(fromClause);
			if (exportFromClause.children?.some((ch) => ch.name === SlimeTokenConsumer.prototype.Asterisk?.name || ch.value === "*")) {
				let exported = null;
				const moduleExportName = exportFromClause.children?.find((ch) => ch.name === SlimeParser.prototype.ModuleExportName?.name);
				if (moduleExportName) exported = this.createModuleExportNameAst(moduleExportName);
				const result = SlimeNodeCreate_default$1.createExportAllDeclaration(fromClauseResult.source, exported, cst.loc, exportToken, asteriskToken, asToken, fromClauseResult.fromToken, semicolonToken);
				if (withToken) {
					result.attributes = attributes;
					result.withToken = withToken;
				}
				return result;
			} else {
				const namedExportsCst = exportFromClause.children?.find((ch) => ch.name === SlimeParser.prototype.NamedExports?.name || ch.name === "NamedExports");
				const specifiers = namedExportsCst ? this.createNamedExportsAst(namedExportsCst) : [];
				const result = SlimeNodeCreate_default$1.createExportNamedDeclaration(null, specifiers, fromClauseResult.source, cst.loc, exportToken, fromClauseResult.fromToken, semicolonToken);
				if (withToken) {
					result.attributes = attributes;
					result.withToken = withToken;
				}
				return result;
			}
		}
		if (namedExports) {
			const specifiers = this.createNamedExportsAst(namedExports);
			return SlimeNodeCreate_default$1.createExportNamedDeclaration(null, specifiers, null, cst.loc, exportToken, void 0, semicolonToken);
		}
		if (variableStatement) {
			const decl = this.createVariableStatementAst(variableStatement);
			return SlimeNodeCreate_default$1.createExportNamedDeclaration(decl, [], null, cst.loc, exportToken);
		}
		if (declaration) {
			const decl = this.createDeclarationAst(declaration);
			return SlimeNodeCreate_default$1.createExportNamedDeclaration(decl, [], null, cst.loc, exportToken);
		}
		throw new Error(`Unsupported export declaration structure`);
	}
	/**
	* 创建 NamedExports AST (export { a, b, c })
	*/
	createNamedExportsAst(cst) {
		const specifiers = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.ExportsList?.name) return this.createExportsListAst(child);
		else if (child.name === SlimeParser.prototype.ExportSpecifier?.name) specifiers.push({ specifier: this.createExportSpecifierAst(child) });
		return specifiers;
	}
	/**
	* 创建 ExportsList AST
	*/
	createExportsListAst(cst) {
		const specifiers = [];
		let lastSpecifier = null;
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.ExportSpecifier?.name) {
			if (lastSpecifier) specifiers.push({ specifier: lastSpecifier });
			lastSpecifier = this.createExportSpecifierAst(child);
		} else if (child.name === SlimeTokenConsumer.prototype.Comma?.name || child.value === ",") {
			if (lastSpecifier) {
				specifiers.push({
					specifier: lastSpecifier,
					commaToken: SlimeTokenCreate_default$1.createCommaToken(child.loc)
				});
				lastSpecifier = null;
			}
		}
		if (lastSpecifier) specifiers.push({ specifier: lastSpecifier });
		return specifiers;
	}
	/**
	* 创建 ExportSpecifier AST
	*/
	createExportSpecifierAst(cst) {
		const children = cst.children || [];
		let local = null;
		let exported = null;
		let asToken = void 0;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child.name === SlimeParser.prototype.ModuleExportName?.name) if (!local) local = this.createModuleExportNameAst(child);
			else exported = this.createModuleExportNameAst(child);
			else if (child.name === SlimeTokenConsumer.prototype.As?.name || child.value === "as") asToken = SlimeTokenCreate_default$1.createAsToken(child.loc);
		}
		if (!exported) exported = local;
		return SlimeNodeCreate_default$1.createExportSpecifier(local, exported, cst.loc, asToken);
	}
	/**
	* 创建 ModuleExportName AST
	*/
	createModuleExportNameAst(cst) {
		const first = cst.children?.[0];
		if (!first) throw new Error("ModuleExportName has no children");
		if (first.name === SlimeParser.prototype.IdentifierName?.name) return this.createIdentifierNameAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.StringLiteral?.name) return SlimeNodeCreate_default$1.createStringLiteral(first.value, first.loc);
		else return SlimeNodeCreate_default$1.createIdentifier(first.value, first.loc);
	}
	createDeclarationAst(cst) {
		const first = cst.name === SlimeParser.prototype.Declaration?.name || cst.name === "Declaration" ? cst.children[0] : cst;
		const name = first.name;
		if (name === SlimeParser.prototype.VariableDeclaration?.name || name === "VariableDeclaration") return this.createVariableDeclarationAst(first);
		else if (name === SlimeParser.prototype.LexicalDeclaration?.name || name === "LexicalDeclaration") return this.createLexicalDeclarationAst(first);
		else if (name === SlimeParser.prototype.ClassDeclaration?.name || name === "ClassDeclaration") return this.createClassDeclarationAst(first);
		else if (name === SlimeParser.prototype.FunctionDeclaration?.name || name === "FunctionDeclaration") return this.createFunctionDeclarationAst(first);
		else if (name === SlimeParser.prototype.HoistableDeclaration?.name || name === "HoistableDeclaration") return this.createHoistableDeclarationAst(first);
		else throw new Error(`Unsupported Declaration type: ${name}`);
	}
	createLexicalDeclarationAst(cst) {
		const children = cst.children || [];
		let kind = "const";
		const declarations = [];
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (child.loc?.type === "Semicolon" || child.value === ";" || child.value === ",") continue;
			if (name === SlimeParser.prototype.LetOrConst?.name || name === "LetOrConst") {
				if (child.children && child.children.length > 0) kind = child.children[0].value || "const";
				continue;
			}
			if (name === "Let" || child.value === "let") {
				kind = "let";
				continue;
			}
			if (name === "Const" || child.value === "const") {
				kind = "const";
				continue;
			}
			if (name === "BindingList" || name === SlimeParser.prototype.BindingList?.name) {
				for (const binding of child.children || []) {
					if (binding.name === "LexicalBinding" || binding.name === SlimeParser.prototype.LexicalBinding?.name) declarations.push(this.createLexicalBindingAst(binding));
					if (binding.value === ",") continue;
				}
				continue;
			}
			if (name === "LexicalBinding" || name === SlimeParser.prototype.LexicalBinding?.name) declarations.push(this.createLexicalBindingAst(child));
		}
		return {
			type: SlimeNodeType$1.VariableDeclaration,
			kind,
			declarations,
			loc: cst.loc
		};
	}
	createLexicalBindingAst(cst) {
		const children = cst.children || [];
		let id = null;
		let init = null;
		let assignToken = void 0;
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") id = this.createBindingIdentifierAst(child);
			else if (name === SlimeParser.prototype.BindingPattern?.name || name === "BindingPattern") id = this.createBindingPatternAst(child);
			else if (name === SlimeParser.prototype.Initializer?.name || name === "Initializer") {
				if (child.children && child.children[0]) {
					const assignCst = child.children[0];
					assignToken = SlimeTokenCreate_default$1.createAssignToken(assignCst.loc);
				}
				init = this.createInitializerAst(child);
			}
		}
		return SlimeNodeCreate_default$1.createVariableDeclarator(id, assignToken, init, cst.loc);
	}
	/**
	* 创建 var 变量声明语句 AST
	* ES2025 VariableStatement: var VariableDeclarationList ;
	*/
	createVariableStatementAst(cst) {
		const children = cst.children || [];
		const declarations = [];
		for (const child of children) {
			if (!child) continue;
			if (child.name === SlimeParser.prototype.VariableDeclarationList?.name || child.name === "VariableDeclarationList") {
				for (const varDeclCst of child.children || []) if (varDeclCst.name === SlimeParser.prototype.VariableDeclaration?.name || varDeclCst.name === "VariableDeclaration") declarations.push(this.createVariableDeclaratorFromVarDeclaration(varDeclCst));
			}
		}
		return {
			type: SlimeNodeType$1.VariableDeclaration,
			kind: "var",
			declarations,
			loc: cst.loc
		};
	}
	/**
	* �?VariableDeclaration CST 创建 VariableDeclarator AST
	* VariableDeclaration: BindingIdentifier Initializer? | BindingPattern Initializer
	*/
	createVariableDeclaratorFromVarDeclaration(cst) {
		const children = cst.children || [];
		let id = null;
		let init = null;
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") id = this.createBindingIdentifierAst(child);
			else if (name === SlimeParser.prototype.BindingPattern?.name || name === "BindingPattern") id = this.createBindingPatternAst(child);
			else if (name === SlimeParser.prototype.Initializer?.name || name === "Initializer") init = this.createInitializerAst(child);
		}
		return {
			type: SlimeNodeType$1.VariableDeclarator,
			id,
			init,
			loc: cst.loc
		};
	}
	createHoistableDeclarationAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.HoistableDeclaration?.name);
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.FunctionDeclaration?.name || first.name === "FunctionDeclaration") return this.createFunctionDeclarationAst(first);
		else if (first.name === SlimeParser.prototype.GeneratorDeclaration?.name || first.name === "GeneratorDeclaration") return this.createGeneratorDeclarationAst(first);
		else if (first.name === SlimeParser.prototype.AsyncFunctionDeclaration?.name || first.name === "AsyncFunctionDeclaration") return this.createAsyncFunctionDeclarationAst(first);
		else if (first.name === SlimeParser.prototype.AsyncGeneratorDeclaration?.name || first.name === "AsyncGeneratorDeclaration") return this.createAsyncGeneratorDeclarationAst(first);
		else throw new Error(`Unsupported HoistableDeclaration type: ${first.name}`);
	}
	createGeneratorDeclarationAst(cst) {
		let id = null;
		let params = [];
		let body;
		const bindingId = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) id = this.createBindingIdentifierAst(bindingId);
		const formalParams = cst.children.find((ch) => ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters" || ch.name === SlimeParser.prototype.FormalParameterList?.name || ch.name === "FormalParameterList");
		if (formalParams) if (formalParams.name === "FormalParameters" || formalParams.name === SlimeParser.prototype.FormalParameters?.name) params = this.createFormalParametersAstWrapped(formalParams);
		else params = this.createFormalParameterListFromEs2025Wrapped(formalParams);
		const bodyNode = cst.children.find((ch) => ch.name === "GeneratorBody" || ch.name === SlimeParser.prototype.GeneratorBody?.name || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		if (bodyNode) {
			const bodyStatements = this.createFunctionBodyAst(bodyNode);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return {
			type: SlimeNodeType$1.FunctionDeclaration,
			id,
			params,
			body,
			generator: true,
			async: false,
			loc: cst.loc
		};
	}
	createAsyncFunctionDeclarationAst(cst) {
		let id = null;
		let params = [];
		let body;
		const bindingId = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) id = this.createBindingIdentifierAst(bindingId);
		const formalParams = cst.children.find((ch) => ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters" || ch.name === SlimeParser.prototype.FormalParameterList?.name || ch.name === "FormalParameterList");
		if (formalParams) if (formalParams.name === "FormalParameters" || formalParams.name === SlimeParser.prototype.FormalParameters?.name) params = this.createFormalParametersAstWrapped(formalParams);
		else params = this.createFormalParameterListAstWrapped(formalParams);
		const bodyNode = cst.children.find((ch) => ch.name === "AsyncFunctionBody" || ch.name === SlimeParser.prototype.AsyncFunctionBody?.name || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		if (bodyNode) {
			const bodyStatements = this.createFunctionBodyAst(bodyNode);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createFunctionDeclaration(id, params, body, false, true, cst.loc);
	}
	createAsyncGeneratorDeclarationAst(cst) {
		let id = null;
		let params = [];
		let body;
		const bindingId = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) id = this.createBindingIdentifierAst(bindingId);
		const formalParams = cst.children.find((ch) => ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters" || ch.name === SlimeParser.prototype.FormalParameterList?.name || ch.name === "FormalParameterList");
		if (formalParams) if (formalParams.name === "FormalParameters" || formalParams.name === SlimeParser.prototype.FormalParameters?.name) params = this.createFormalParametersAstWrapped(formalParams);
		else params = this.createFormalParameterListFromEs2025Wrapped(formalParams);
		const bodyNode = cst.children.find((ch) => ch.name === "AsyncGeneratorBody" || ch.name === SlimeParser.prototype.AsyncGeneratorBody?.name || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		if (bodyNode) {
			const bodyStatements = this.createFunctionBodyAst(bodyNode);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return {
			type: SlimeNodeType$1.FunctionDeclaration,
			id,
			params,
			body,
			generator: true,
			async: true,
			loc: cst.loc
		};
	}
	createVariableDeclarationAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.VariableDeclaration?.name);
		let kindCst = cst.children[0].children[0];
		let kindToken = void 0;
		const kindValue = kindCst.value;
		if (kindValue === "var") kindToken = SlimeTokenCreate_default$1.createVarToken(kindCst.loc);
		else if (kindValue === "let") kindToken = SlimeTokenCreate_default$1.createLetToken(kindCst.loc);
		else if (kindValue === "const") kindToken = SlimeTokenCreate_default$1.createConstToken(kindCst.loc);
		let declarations = [];
		if (cst.children[1]) declarations = this.createVariableDeclarationListAst(cst.children[1]);
		return SlimeNodeCreate_default$1.createVariableDeclaration(kindToken, declarations, cst.loc);
	}
	createVariableDeclarationListAst(cst) {
		return cst.children.filter((item) => item.name === SlimeParser.prototype.LexicalBinding?.name || item.name === "VariableDeclarator").map((item) => this.createVariableDeclaratorAst(item));
	}
	createClassDeclarationAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ClassDeclaration?.name);
		let classToken = void 0;
		let id = null;
		let classTailCst = null;
		for (const child of cst.children) {
			const name = child.name;
			if (name === "Class" || child.value === "class") classToken = SlimeTokenCreate_default$1.createClassToken(child.loc);
			else if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") id = this.createBindingIdentifierAst(child);
			else if (name === SlimeParser.prototype.ClassTail?.name || name === "ClassTail") classTailCst = child;
		}
		if (!classTailCst) throw new Error("ClassDeclaration missing ClassTail");
		const classTailResult = this.createClassTailAst(classTailCst);
		return SlimeNodeCreate_default$1.createClassDeclaration(id, classTailResult.body, classTailResult.superClass, cst.loc, classToken, classTailResult.extendsToken);
	}
	createClassTailAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ClassTail?.name);
		let superClass = null;
		let body = {
			type: SlimeNodeType$1.ClassBody,
			body: [],
			loc: cst.loc
		};
		let extendsToken = void 0;
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children) if (child.name === SlimeParser.prototype.ClassHeritage?.name) {
			const heritageResult = this.createClassHeritageAstWithToken(child);
			superClass = heritageResult.superClass;
			extendsToken = heritageResult.extendsToken;
		} else if (child.name === SlimeParser.prototype.ClassBody?.name) body = this.createClassBodyAst(child);
		else if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
		else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
		if (body) {
			body.lBraceToken = lBraceToken;
			body.rBraceToken = rBraceToken;
		}
		return {
			superClass,
			body,
			extendsToken,
			lBraceToken,
			rBraceToken
		};
	}
	createClassHeritageAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ClassHeritage?.name);
		return this.createLeftHandSideExpressionAst(cst.children[1]);
	}
	createClassHeritageAstWithToken(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ClassHeritage?.name);
		let extendsToken = void 0;
		const extendsCst = cst.children.find((ch) => ch.name === "Extends" || ch.value === "extends");
		if (extendsCst) extendsToken = SlimeTokenCreate_default$1.createExtendsToken(extendsCst.loc);
		return {
			superClass: this.createLeftHandSideExpressionAst(cst.children[1]),
			extendsToken
		};
	}
	createInitializerAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Initializer?.name);
		const assignmentExpressionCst = cst.children[1];
		return this.createAssignmentExpressionAst(assignmentExpressionCst);
	}
	createFieldDefinitionAst(staticCst, cst) {
		checkCstName$1(cst, SlimeParser.prototype.FieldDefinition?.name);
		const elementNameCst = cst.children[0];
		const key = this.createClassElementNameAst(elementNameCst);
		const isComputed = this.isComputedPropertyName(elementNameCst);
		let value = null;
		if (cst.children.length > 1) {
			const initializerCst = cst.children[1];
			if (initializerCst && initializerCst.name === SlimeParser.prototype.Initializer?.name) value = this.createInitializerAst(initializerCst);
		}
		const isStatic = this.isStaticModifier(staticCst);
		return SlimeNodeCreate_default$1.createPropertyDefinition(key, value, isComputed, isStatic || false, cst.loc);
	}
	/**
	* 检�?ClassElementName/PropertyName 是否是计算属性名
	*/
	isComputedPropertyName(cst) {
		if (!cst || !cst.children) return false;
		function hasComputedPropertyName(node$1) {
			if (!node$1) return false;
			if (node$1.name === "ComputedPropertyName" || node$1.name === SlimeParser.prototype.ComputedPropertyName?.name) return true;
			if (node$1.children) {
				for (const child of node$1.children) if (hasComputedPropertyName(child)) return true;
			}
			return false;
		}
		return hasComputedPropertyName(cst);
	}
	/**
	* [AST 类型映射] PrivateIdentifier 终端�?�?Identifier AST
	*
	* 存在必要性：PrivateIdentifier �?CST 中是一个终端符（token），
	* 但在 ESTree AST 中需要表示为 Identifier 节点，name �?# 开头�?
	*
	* PrivateIdentifier :: # IdentifierName
	* AST 表示：{ type: "Identifier", name: "#count" }
	*/
	createPrivateIdentifierAst(cst) {
		if (cst.value) {
			const rawName = cst.value;
			const decodedName = decodeUnicodeEscapes(rawName);
			const name = decodedName.startsWith("#") ? decodedName : "#" + decodedName;
			const raw = rawName.startsWith("#") ? rawName : "#" + rawName;
			const identifier = SlimeNodeCreate_default$1.createIdentifier(name, cst.loc);
			if (raw !== name) identifier.raw = raw;
			return identifier;
		}
		if (cst.children && cst.children.length >= 2) {
			const rawName = cst.children[1].children[0].value;
			const decodedName = decodeUnicodeEscapes(rawName);
			const identifier = SlimeNodeCreate_default$1.createIdentifier("#" + decodedName);
			if (rawName !== decodedName) identifier.raw = "#" + rawName;
			return identifier;
		}
		if (cst.children && cst.children.length === 1) {
			const child = cst.children[0];
			if (child.value) {
				const rawName = child.value;
				const decodedName = decodeUnicodeEscapes(rawName);
				const identifier = SlimeNodeCreate_default$1.createIdentifier("#" + decodedName);
				if (rawName !== decodedName) identifier.raw = "#" + rawName;
				return identifier;
			}
		}
		throw new Error("createPrivateIdentifierAst: 无法解析 PrivateIdentifier");
	}
	/**
	* 检�?CST 节点是否表示 static 修饰�?
	* 兼容 Static �?IdentifierNameTok (value='static') 两种情况
	*/
	isStaticModifier(cst) {
		if (!cst) return false;
		if (cst.name === SlimeTokenConsumer.prototype.Static?.name || cst.name === "Static" || cst.name === "Static") return true;
		if ((cst.name === "IdentifierName" || cst.name === "IdentifierName") && cst.value === "static") return true;
		return false;
	}
	createClassBodyAst(cst) {
		const astName = checkCstName$1(cst, SlimeParser.prototype.ClassBody?.name);
		const elementsWrapper = cst.children && cst.children[0];
		const body = [];
		if (elementsWrapper && Array.isArray(elementsWrapper.children)) for (const element of elementsWrapper.children) {
			const elementChildren = element.children ?? [];
			if (!elementChildren.length) continue;
			let staticCst = null;
			let targetCst = null;
			let classStaticBlockCst = null;
			for (const child of elementChildren) if (child.name === "Static" || child.value === "static") staticCst = child;
			else if (child.name === "SemicolonASI" || child.name === "Semicolon" || child.value === ";") continue;
			else if (child.name === "ClassStaticBlock") classStaticBlockCst = child;
			else if (child.name === SlimeParser.prototype.MethodDefinition?.name || child.name === SlimeParser.prototype.FieldDefinition?.name || child.name === "MethodDefinition" || child.name === "FieldDefinition") targetCst = child;
			if (classStaticBlockCst) {
				const staticBlock = this.createClassStaticBlockAst(classStaticBlockCst);
				if (staticBlock) body.push(staticBlock);
				continue;
			}
			if (targetCst) {
				if (targetCst.name === SlimeParser.prototype.MethodDefinition?.name) body.push(this.createMethodDefinitionAst(staticCst, targetCst));
				else if (targetCst.name === SlimeParser.prototype.FieldDefinition?.name) body.push(this.createFieldDefinitionAst(staticCst, targetCst));
			}
		}
		return {
			type: astName,
			body,
			loc: cst.loc
		};
	}
	/**
	* 创建 ClassStaticBlock AST (ES2022)
	* ClassStaticBlock: static { ClassStaticBlockBody }
	*/
	createClassStaticBlockAst(cst) {
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		let bodyStatements = [];
		for (const child of cst.children || []) if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
		else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
		else if (child.name === "ClassStaticBlockBody") {
			const stmtListCst = child.children?.find((c) => c.name === "ClassStaticBlockStatementList" || c.name === "StatementList");
			if (stmtListCst) {
				const actualStatementList = stmtListCst.name === "ClassStaticBlockStatementList" ? stmtListCst.children?.find((c) => c.name === "StatementList") : stmtListCst;
				if (actualStatementList) bodyStatements = this.createStatementListAst(actualStatementList);
			}
		}
		return SlimeNodeCreate_default$1.createStaticBlock(bodyStatements, cst.loc, lBraceToken, rBraceToken);
	}
	/**
	* GeneratorMethod CST �?AST
	* GeneratorMethod -> * ClassElementName ( UniqueFormalParameters ) { GeneratorBody }
	*/
	createGeneratorMethodAst(cst) {
		return this.createMethodDefinitionAstInternal(cst, "method", true, false);
	}
	/**
	* GeneratorBody CST �?AST（透传�?FunctionBody�?
	*/
	createGeneratorBodyAst(cst) {
		return this.createFunctionBodyAst(cst);
	}
	/**
	* AsyncMethod CST �?AST
	* AsyncMethod -> async ClassElementName ( UniqueFormalParameters ) { AsyncFunctionBody }
	*/
	createAsyncMethodAst(cst) {
		return this.createMethodDefinitionAstInternal(cst, "method", false, true);
	}
	/**
	* AsyncFunctionBody CST �?AST（透传�?FunctionBody�?
	*/
	createAsyncFunctionBodyAst(cst) {
		return this.createFunctionBodyAst(cst);
	}
	/**
	* AsyncGeneratorMethod CST �?AST
	*/
	createAsyncGeneratorMethodAst(cst) {
		return this.createMethodDefinitionAstInternal(cst, "method", true, true);
	}
	/**
	* AsyncGeneratorBody CST �?AST（透传�?FunctionBody�?
	*/
	createAsyncGeneratorBodyAst(cst) {
		return this.createFunctionBodyAst(cst);
	}
	/**
	* 内部辅助方法：创建 MethodDefinition AST
	*/
	createMethodDefinitionAstInternal(cst, kind, generator, async) {
		const classElementName = cst.children?.find((ch) => ch.name === SlimeParser.prototype.ClassElementName?.name || ch.name === "ClassElementName" || ch.name === SlimeParser.prototype.PropertyName?.name || ch.name === "PropertyName");
		const key = classElementName ? this.createClassElementNameAst(classElementName) : null;
		const formalParams = cst.children?.find((ch) => ch.name === SlimeParser.prototype.UniqueFormalParameters?.name || ch.name === "UniqueFormalParameters" || ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters");
		const params = formalParams ? this.createFormalParametersAst(formalParams) : [];
		const bodyNode = cst.children?.find((ch) => ch.name === "GeneratorBody" || ch.name === "AsyncFunctionBody" || ch.name === "AsyncGeneratorBody" || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		const bodyStatements = bodyNode ? this.createFunctionBodyAst(bodyNode) : [];
		const body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode?.loc);
		const value = {
			type: SlimeNodeType$1.FunctionExpression,
			id: null,
			params,
			body,
			generator,
			async,
			loc: cst.loc
		};
		return SlimeNodeCreate_default$1.createMethodDefinition(key, value, kind, false, false, cst.loc);
	}
	/**
	* ClassElement CST �?AST
	* ClassElement -> MethodDefinition | static MethodDefinition | FieldDefinition | ...
	*/
	createClassElementAst(cst) {
		const firstChild = cst.children?.[0];
		if (!firstChild) return null;
		let staticCst = null;
		let startIndex = 0;
		if (firstChild.name === "Static" || firstChild.value === "static") {
			staticCst = firstChild;
			startIndex = 1;
		}
		const actualChild = cst.children?.[startIndex];
		if (!actualChild) return null;
		if (actualChild.name === SlimeParser.prototype.MethodDefinition?.name || actualChild.name === "MethodDefinition") return this.createMethodDefinitionAst(staticCst, actualChild);
		else if (actualChild.name === SlimeParser.prototype.FieldDefinition?.name || actualChild.name === "FieldDefinition") return this.createFieldDefinitionAst(staticCst, actualChild);
		else if (actualChild.name === SlimeParser.prototype.ClassStaticBlock?.name || actualChild.name === "ClassStaticBlock") return this.createClassStaticBlockAst(actualChild);
		return null;
	}
	/**
	* ClassElementName CST �?AST
	* ClassElementName :: PropertyName | PrivateIdentifier
	*/
	createClassElementNameAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ClassElementName?.name);
		const first = cst.children[0];
		if (!first) throw new Error("createClassElementNameAst: ClassElementName has no children");
		if (first.name === "PrivateIdentifier") return this.createPrivateIdentifierAst(first);
		return this.createPropertyNameAst(first);
	}
	/**
	* ClassElementList CST �?AST
	*/
	createClassElementListAst(cst) {
		const elements = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.ClassElement?.name || child.name === "ClassElement") {
			const element = this.createClassElementAst(child);
			if (element) elements.push(element);
		}
		return elements;
	}
	/**
	* ClassStaticBlockBody CST �?AST
	*/
	createClassStaticBlockBodyAst(cst) {
		const stmtList = cst.children?.find((ch) => ch.name === "ClassStaticBlockStatementList" || ch.name === SlimeParser.prototype.ClassStaticBlockStatementList?.name);
		if (stmtList) return this.createClassStaticBlockStatementListAst(stmtList);
		return [];
	}
	/**
	* ClassStaticBlockStatementList CST �?AST
	*/
	createClassStaticBlockStatementListAst(cst) {
		const stmtList = cst.children?.find((ch) => ch.name === "StatementList" || ch.name === SlimeParser.prototype.StatementList?.name);
		if (stmtList) return this.createStatementListAst(stmtList);
		return [];
	}
	/**
	* AsyncArrowBindingIdentifier CST �?AST
	*/
	createAsyncArrowBindingIdentifierAst(cst) {
		const bindingId = cst.children?.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) return this.createBindingIdentifierAst(bindingId);
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createBindingIdentifierAst(firstChild);
		throw new Error("AsyncArrowBindingIdentifier has no identifier");
	}
	/**
	* AsyncConciseBody CST �?AST
	*/
	createAsyncConciseBodyAst(cst) {
		return this.createConciseBodyAst(cst);
	}
	/**
	* AsyncArrowHead CST �?AST（透传�?
	*/
	createAsyncArrowHeadAst(cst) {
		return cst.children?.[0] ? this.createAstFromCst(cst.children[0]) : null;
	}
	createFormalParameterListAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.FormalParameterList?.name);
		if (!cst.children || cst.children.length === 0) return [];
		const params = [];
		for (const child of cst.children) {
			const name = child.name;
			if (name === "FunctionRestParameter" || name === SlimeParser.prototype.FunctionRestParameter?.name) {
				params.push(this.createFunctionRestParameterAst(child));
				continue;
			}
			if (name === "FormalParameter" || name === SlimeParser.prototype.FormalParameter?.name) {
				params.push(this.createFormalParameterAst(child));
				continue;
			}
			if (name === "BindingElement" || name === SlimeParser.prototype.BindingElement?.name) {
				params.push(this.createBindingElementAst(child));
				continue;
			}
			if (name === "BindingIdentifier" || name === SlimeParser.prototype.BindingIdentifier?.name) {
				params.push(this.createBindingIdentifierAst(child));
				continue;
			}
			if (child.value === ",") continue;
		}
		return params;
	}
	createBindingElementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BindingElement?.name);
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.SingleNameBinding?.name) return this.createSingleNameBindingAst(first);
		else if (first.name === SlimeParser.prototype.BindingPattern?.name || first.name === SlimeParser.prototype.ArrayBindingPattern?.name || first.name === SlimeParser.prototype.ObjectBindingPattern?.name) {
			const initializer = cst.children.find((ch) => ch.name === SlimeParser.prototype.Initializer?.name || ch.name === "Initializer");
			let pattern;
			if (first.name === SlimeParser.prototype.BindingPattern?.name) pattern = this.createBindingPatternAst(first);
			else if (first.name === SlimeParser.prototype.ArrayBindingPattern?.name) pattern = this.createArrayBindingPatternAst(first);
			else pattern = this.createObjectBindingPatternAst(first);
			if (initializer) {
				const init = this.createInitializerAst(initializer);
				return {
					type: SlimeNodeType$1.AssignmentPattern,
					left: pattern,
					right: init,
					loc: cst.loc
				};
			}
			return pattern;
		}
		return this.createSingleNameBindingAst(first);
	}
	createSingleNameBindingAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.SingleNameBinding?.name);
		const first = cst.children[0];
		const id = this.createBindingIdentifierAst(first);
		const initializer = cst.children.find((ch) => ch.name === SlimeParser.prototype.Initializer?.name);
		if (initializer) {
			const init = this.createInitializerAst(initializer);
			return {
				type: SlimeNodeType$1.AssignmentPattern,
				left: id,
				right: init,
				loc: cst.loc
			};
		}
		return id;
	}
	createFunctionRestParameterAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.FunctionRestParameter?.name);
		const first = cst.children[0];
		return this.createBindingRestElementAst(first);
	}
	createBindingRestElementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BindingRestElement?.name);
		const argumentCst = cst.children[1];
		let argument;
		if (argumentCst.name === SlimeParser.prototype.BindingIdentifier?.name) argument = this.createBindingIdentifierAst(argumentCst);
		else if (argumentCst.name === SlimeParser.prototype.BindingPattern?.name) argument = this.createBindingPatternAst(argumentCst);
		else throw new Error(`BindingRestElement: 不支持的类型 ${argumentCst.name}`);
		return SlimeNodeCreate_default$1.createRestElement(argument);
	}
	createFunctionBodyAst(cst) {
		const children = cst.children || [];
		if (children.length === 0) return [];
		const first = children[0];
		if (!first) return [];
		const name = first.name;
		if (name === "FunctionBody" || name === SlimeParser.prototype.FunctionBody?.name) return this.createFunctionBodyAst(first);
		if (name === "FunctionStatementList" || name === SlimeParser.prototype.FunctionStatementList?.name) return this.createFunctionStatementListAst(first);
		if (name === "StatementList" || name === SlimeParser.prototype.StatementList?.name) return this.createStatementListAst(first);
		return this.createStatementListAst(first);
	}
	createFunctionStatementListAst(cst) {
		const children = cst.children || [];
		if (children.length === 0) return [];
		const first = children[0];
		if (!first) return [];
		if (first.name === "StatementList" || first.name === SlimeParser.prototype.StatementList?.name) return this.createStatementListAst(first);
		return this.createStatementListItemAst(first);
	}
	/**
	* 创建 FormalParameterList AST (包装版本)
	*/
	createFormalParameterListAstWrapped(cst) {
		const params = [];
		let lastParam = null;
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.FormalParameter?.name) {
			if (lastParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(lastParam));
			lastParam = this.createFormalParameterAst(child);
		} else if (child.name === SlimeParser.prototype.FunctionRestParameter?.name) {
			if (lastParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(lastParam));
			lastParam = this.createFunctionRestParameterAst(child);
		} else if (child.name === SlimeTokenConsumer.prototype.Comma?.name || child.value === ",") {
			if (lastParam) {
				params.push(SlimeNodeCreate_default$1.createFunctionParam(lastParam, SlimeTokenCreate_default$1.createCommaToken(child.loc)));
				lastParam = null;
			}
		}
		if (lastParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(lastParam));
		return params;
	}
	createMethodDefinitionAst(staticCst, cst) {
		checkCstName$1(cst, SlimeParser.prototype.MethodDefinition?.name);
		const first = cst.children?.[0];
		if (!first) throw new Error("MethodDefinition has no children");
		if (first.name === "ClassElementName") return this.createMethodDefinitionClassElementNameAst(staticCst, cst);
		else if (first.name === "Get") return this.createMethodDefinitionGetterMethodAst(staticCst, cst);
		else if (first.name === "Set") return this.createMethodDefinitionSetterMethodAst(staticCst, cst);
		else if (first.name === SlimeParser.prototype.GeneratorMethod?.name || first.name === "GeneratorMethod") return this.createMethodDefinitionGeneratorMethodAst(staticCst, first);
		else if (first.name === "AsyncMethod" || first.name === SlimeParser.prototype.AsyncMethod?.name) return this.createMethodDefinitionAsyncMethodAst(staticCst, first);
		else if (first.name === "AsyncGeneratorMethod" || first.name === SlimeParser.prototype.AsyncGeneratorMethod?.name) return this.createMethodDefinitionAsyncGeneratorMethodAst(staticCst, first);
		else if (first.name === "Asterisk") return this.createMethodDefinitionGeneratorMethodAst(staticCst, cst);
		else if (first.name === "Async") return this.createMethodDefinitionAsyncMethodFromChildren(staticCst, cst);
		else if (first.name === "IdentifierName" || first.name === "IdentifierName" || first.name === "PropertyName" || first.name === "LiteralPropertyName") {
			if (first.value === "get" && cst.children[1]?.name === "ClassElementName") return this.createMethodDefinitionGetterMethodFromIdentifier(staticCst, cst);
			else if (first.value === "set" && cst.children[1]?.name === "ClassElementName") return this.createMethodDefinitionSetterMethodFromIdentifier(staticCst, cst);
			return this.createMethodDefinitionMethodDefinitionFromIdentifier(staticCst, cst);
		} else throw new Error("不支持的类型: " + first.name);
	}
	/**
	* [内部方法] 从直接的标识符创建方法定�?
	* 处理 ES2025 Parser �?IdentifierNameTok ( UniqueFormalParameters ) { FunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionMethodDefinitionFromIdentifier(staticCst, cst) {
		let i = 0;
		const children = cst.children;
		let staticToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		if (staticCst && (staticCst.name === "Static" || staticCst.value === "static")) staticToken = SlimeTokenCreate_default$1.createStaticToken(staticCst.loc);
		const firstChild = children[i++];
		let key;
		if (firstChild.name === "IdentifierName") key = SlimeNodeCreate_default$1.createIdentifier(firstChild.value, firstChild.loc);
		else if (firstChild.name === "IdentifierName") {
			const tokenCst = firstChild.children[0];
			key = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
		} else if (firstChild.name === "PropertyName" || firstChild.name === "LiteralPropertyName") key = this.createPropertyNameAst(firstChild);
		else key = this.createClassElementNameAst(firstChild);
		if (children[i]?.name === "LParen" || children[i]?.value === "(") {
			lParenToken = SlimeTokenCreate_default$1.createLParenToken(children[i].loc);
			i++;
		}
		let params = [];
		if (children[i]?.name === "UniqueFormalParameters" || children[i]?.name === SlimeParser.prototype.UniqueFormalParameters?.name) {
			params = this.createUniqueFormalParametersAstWrapped(children[i]);
			i++;
		} else if (children[i]?.name === "FormalParameters" || children[i]?.name === SlimeParser.prototype.FormalParameters?.name) {
			params = this.createFormalParametersAstWrapped(children[i]);
			i++;
		}
		if (children[i]?.name === "RParen" || children[i]?.value === ")") {
			rParenToken = SlimeTokenCreate_default$1.createRParenToken(children[i].loc);
			i++;
		}
		if (children[i]?.name === "LBrace" || children[i]?.value === "{") {
			lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(children[i].loc);
			i++;
		}
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, children[i].loc, lBraceToken, rBraceToken);
			i++;
		} else body = SlimeNodeCreate_default$1.createBlockStatement([], void 0, lBraceToken, rBraceToken);
		if (children[i]?.name === "RBrace" || children[i]?.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(children[i].loc);
		const functionExpression = SlimeNodeCreate_default$1.createFunctionExpression(body, null, params, false, false, cst.loc, void 0, void 0, void 0, lParenToken, rParenToken, lBraceToken, rBraceToken);
		const isConstructor = key.type === "Identifier" && key.name === "constructor" && !this.isStaticModifier(staticCst);
		const isStatic = this.isStaticModifier(staticCst);
		const kind = isConstructor ? "constructor" : "method";
		return SlimeNodeCreate_default$1.createMethodDefinition(key, functionExpression, kind, false, isStatic, cst.loc, staticToken);
	}
	/**
	* [内部方法] 普通方法定�?
	* 处理 ES2025 Parser �?ClassElementName ( UniqueFormalParameters ) { FunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionClassElementNameAst(staticCst, cst) {
		let i = 0;
		const children = cst.children;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		if (children[i]?.name === "LParen") i++;
		let params = [];
		if (children[i]?.name === "UniqueFormalParameters" || children[i]?.name === SlimeParser.prototype.UniqueFormalParameters?.name) {
			params = this.createUniqueFormalParametersAstWrapped(children[i]);
			i++;
		} else if (children[i]?.name === "FormalParameters" || children[i]?.name === SlimeParser.prototype.FormalParameters?.name) {
			params = this.createFormalParametersAstWrapped(children[i]);
			i++;
		}
		if (children[i]?.name === "RParen") i++;
		if (children[i]?.name === "LBrace") i++;
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const functionExpression = SlimeNodeCreate_default$1.createFunctionExpression(body, null, params, false, false, cst.loc);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		const isConstructor = key.type === "Identifier" && key.name === "constructor" && !this.isStaticModifier(staticCst);
		const isStatic = this.isStaticModifier(staticCst);
		const kind = isConstructor ? "constructor" : "method";
		return SlimeNodeCreate_default$1.createMethodDefinition(key, functionExpression, kind, isComputed, isStatic, cst.loc);
	}
	/**
	* [内部方法] getter 方法
	* 处理 ES2025 Parser �?get ClassElementName ( ) { FunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionGetterMethodAst(staticCst, cst) {
		const children = cst.children;
		let i = 1;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		while (i < children.length && [
			"LParen",
			"RParen",
			"LBrace"
		].includes(children[i]?.name)) i++;
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, {
			type: "FunctionExpression",
			id: null,
			params: [],
			body
		});
		methodDef.kind = "get";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* [内部方法] setter 方法
	* 处理 ES2025 Parser �?set ClassElementName ( PropertySetParameterList ) { FunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionSetterMethodAst(staticCst, cst) {
		const children = cst.children;
		let i = 1;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		if (children[i]?.name === "LParen") i++;
		let params = [];
		if (children[i]?.name === "PropertySetParameterList" || children[i]?.name === SlimeParser.prototype.PropertySetParameterList?.name) {
			params = this.createPropertySetParameterListAst(children[i]);
			i++;
		}
		while (i < children.length && ["RParen", "LBrace"].includes(children[i]?.name)) i++;
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, {
			type: "FunctionExpression",
			id: null,
			params,
			body
		});
		methodDef.kind = "set";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* [内部方法] getter 方法 (�?IdentifierNameTok="get" 开�?
	* 处理 ES2025 Parser �?IdentifierNameTok="get" ClassElementName ( ) { FunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionGetterMethodFromIdentifier(staticCst, cst) {
		const children = cst.children;
		let i = 1;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		while (i < children.length && ["LParen", "RParen"].includes(children[i]?.name)) i++;
		if (children[i]?.name === "LBrace") i++;
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, {
			type: "FunctionExpression",
			id: null,
			params: [],
			body
		});
		methodDef.kind = "get";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* [内部方法] setter 方法 (�?IdentifierNameTok="set" 开�?
	* 处理 ES2025 Parser �?IdentifierNameTok="set" ClassElementName ( ... ) { FunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionSetterMethodFromIdentifier(staticCst, cst) {
		const children = cst.children;
		let i = 1;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		if (children[i]?.name === "LParen") i++;
		let params = [];
		if (children[i]?.name === "PropertySetParameterList" || children[i]?.name === SlimeParser.prototype.PropertySetParameterList?.name) {
			params = this.createPropertySetParameterListAst(children[i]);
			i++;
		} else if (children[i]?.name === "BindingIdentifier" || children[i]?.name === "BindingElement") {
			params = [this.createBindingIdentifierAst(children[i])];
			i++;
		}
		while (i < children.length && ["RParen", "LBrace"].includes(children[i]?.name)) i++;
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, {
			type: "FunctionExpression",
			id: null,
			params,
			body
		});
		methodDef.kind = "set";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* [内部方法] generator 方法
	* 处理 ES2025 Parser �?* ClassElementName ( UniqueFormalParameters ) { GeneratorBody } 结构
	* @internal
	*/
	createMethodDefinitionGeneratorMethodAst(staticCst, cst) {
		const children = cst.children;
		let i = 1;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		if (children[i]?.name === "LParen") i++;
		let params = [];
		if (children[i]?.name === "UniqueFormalParameters" || children[i]?.name === SlimeParser.prototype.UniqueFormalParameters?.name) {
			params = this.createUniqueFormalParametersAst(children[i]);
			i++;
		}
		while (i < children.length && ["RParen", "LBrace"].includes(children[i]?.name)) i++;
		let body;
		const bodyChild = children[i];
		if (bodyChild?.name === "GeneratorBody" || bodyChild?.name === SlimeParser.prototype.GeneratorBody?.name || bodyChild?.name === "FunctionBody" || bodyChild?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(bodyChild);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyChild.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const functionExpression = {
			type: "FunctionExpression",
			id: null,
			params,
			body,
			generator: true,
			async: false
		};
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, functionExpression);
		methodDef.kind = "method";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* [内部方法] generator 方法 (�?MethodDefinition children 直接处理)
	* @internal
	*/
	createMethodDefinitionGeneratorMethodFromChildren(staticCst, cst) {
		return this.createMethodDefinitionGeneratorMethodAst(staticCst, cst);
	}
	/**
	* [内部方法] async 方法
	* 处理 ES2025 Parser �?async ClassElementName ( UniqueFormalParameters ) { AsyncFunctionBody } 结构
	* @internal
	*/
	createMethodDefinitionAsyncMethodAst(staticCst, cst) {
		const children = cst.children;
		let i = 1;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		if (children[i]?.name === "LParen") i++;
		let params = [];
		if (children[i]?.name === "UniqueFormalParameters" || children[i]?.name === SlimeParser.prototype.UniqueFormalParameters?.name) {
			params = this.createUniqueFormalParametersAst(children[i]);
			i++;
		}
		while (i < children.length && ["RParen", "LBrace"].includes(children[i]?.name)) i++;
		let body;
		const bodyChild = children[i];
		if (bodyChild?.name === "AsyncFunctionBody" || bodyChild?.name === SlimeParser.prototype.AsyncFunctionBody?.name || bodyChild?.name === "FunctionBody" || bodyChild?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(bodyChild);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyChild.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const functionExpression = {
			type: "FunctionExpression",
			id: null,
			params,
			body,
			generator: false,
			async: true
		};
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, functionExpression);
		methodDef.kind = "method";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* [内部方法] async 方法 (�?MethodDefinition children 直接处理)
	* @internal
	*/
	createMethodDefinitionAsyncMethodFromChildren(staticCst, cst) {
		if (cst.children[1]?.name === "Asterisk") return this.createMethodDefinitionAsyncGeneratorMethodAst(staticCst, cst);
		return this.createMethodDefinitionAsyncMethodAst(staticCst, cst);
	}
	/**
	* [内部方法] async generator 方法
	* 处理 ES2025 Parser �?async * ClassElementName ( ... ) { AsyncGeneratorBody } 结构
	* @internal
	*/
	createMethodDefinitionAsyncGeneratorMethodAst(staticCst, cst) {
		const children = cst.children;
		let i = 2;
		const classElementNameCst = children[i++];
		const key = this.createClassElementNameAst(classElementNameCst);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		if (children[i]?.name === "LParen") i++;
		let params = [];
		if (children[i]?.name === "UniqueFormalParameters" || children[i]?.name === SlimeParser.prototype.UniqueFormalParameters?.name) {
			params = this.createUniqueFormalParametersAst(children[i]);
			i++;
		}
		while (i < children.length && ["RParen", "LBrace"].includes(children[i]?.name)) i++;
		let body;
		const bodyChild = children[i];
		if (bodyChild?.name === "AsyncGeneratorBody" || bodyChild?.name === SlimeParser.prototype.AsyncGeneratorBody?.name || bodyChild?.name === "FunctionBody" || bodyChild?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(bodyChild);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyChild.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		const functionExpression = {
			type: "FunctionExpression",
			id: null,
			params,
			body,
			generator: true,
			async: true
		};
		const methodDef = SlimeNodeCreate_default$1.createMethodDefinition(key, functionExpression);
		methodDef.kind = "method";
		methodDef.computed = isComputed;
		if (this.isStaticModifier(staticCst)) methodDef.static = true;
		return methodDef;
	}
	/**
	* 处理 UniqueFormalParameters CST 节点
	*/
	createUniqueFormalParametersAst(cst) {
		if (!cst.children || cst.children.length === 0) return [];
		const first = cst.children[0];
		if (first.name === "FormalParameters" || first.name === SlimeParser.prototype.FormalParameters?.name) return this.createFormalParametersAst(first);
		return this.createFormalParametersAst(cst);
	}
	/** 返回包装类型的版�?*/
	createUniqueFormalParametersAstWrapped(cst) {
		if (!cst.children || cst.children.length === 0) return [];
		const first = cst.children[0];
		if (first.name === "FormalParameters" || first.name === SlimeParser.prototype.FormalParameters?.name) return this.createFormalParametersAstWrapped(first);
		return this.createFormalParametersAstWrapped(cst);
	}
	/**
	* 处理 PropertySetParameterList
	*/
	createPropertySetParameterListAst(cst) {
		if (!cst.children || cst.children.length === 0) return [];
		const first = cst.children[0];
		if (first.name === "FormalParameter" || first.name === SlimeParser.prototype.FormalParameter?.name) return [this.createFormalParameterAst(first)];
		if (first.name === "BindingElement" || first.name === SlimeParser.prototype.BindingElement?.name) return [this.createBindingElementAst(first)];
		return [];
	}
	/** 返回包装类型的版�?*/
	createPropertySetParameterListAstWrapped(cst) {
		if (!cst.children || cst.children.length === 0) return [];
		const first = cst.children[0];
		if (first.name === "FormalParameter" || first.name === SlimeParser.prototype.FormalParameter?.name) return [SlimeNodeCreate_default$1.createFunctionParam(this.createFormalParameterAst(first), void 0)];
		if (first.name === "BindingElement" || first.name === SlimeParser.prototype.BindingElement?.name) return [SlimeNodeCreate_default$1.createFunctionParam(this.createBindingElementAst(first), void 0)];
		return [];
	}
	createFormalParameterAst(cst) {
		const first = cst.children[0];
		if (first.name === "BindingElement" || first.name === SlimeParser.prototype.BindingElement?.name) return this.createBindingElementAst(first);
		return this.createBindingElementAst(cst);
	}
	createBindingPatternAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BindingPattern?.name);
		const child = cst.children[0];
		if (child.name === SlimeParser.prototype.ArrayBindingPattern?.name) return this.createArrayBindingPatternAst(child);
		else if (child.name === SlimeParser.prototype.ObjectBindingPattern?.name) return this.createObjectBindingPatternAst(child);
		else throw new Error(`Unknown BindingPattern type: ${child.name}`);
	}
	createArrayBindingPatternAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ArrayBindingPattern?.name);
		const elements = [];
		let lBracketToken;
		let rBracketToken;
		for (const child of cst.children) if (child.value === "[") lBracketToken = SlimeTokenCreate_default$1.createLBracketToken(child.loc);
		else if (child.value === "]") rBracketToken = SlimeTokenCreate_default$1.createRBracketToken(child.loc);
		const bindingList = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingElementList?.name);
		if (bindingList) for (let i = 0; i < bindingList.children.length; i++) {
			const child = bindingList.children[i];
			if (child.value === ",") if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
			else SlimeTokenCreate_default$1.createCommaToken(child.loc);
			else if (child.name === SlimeParser.prototype.BindingElisionElement?.name) {
				const elision = child.children.find((ch) => ch.name === SlimeParser.prototype.Elision?.name);
				if (elision) {
					for (const elisionChild of elision.children || []) if (elisionChild.value === ",") elements.push({
						element: null,
						commaToken: SlimeTokenCreate_default$1.createCommaToken(elisionChild.loc)
					});
				}
				const bindingElement = child.children.find((ch) => ch.name === SlimeParser.prototype.BindingElement?.name);
				if (bindingElement) {
					const element = this.createBindingElementAst(bindingElement);
					if (element) elements.push({ element });
				}
			}
		}
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.value === "[" || child.value === "]" || child.name === SlimeParser.prototype.BindingElementList?.name || child.name === SlimeParser.prototype.BindingRestElement?.name) continue;
			if (child.value === ",") {
				if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
			}
			if (child.name === SlimeParser.prototype.Elision?.name || child.name === "Elision") {
				for (const elisionChild of child.children || []) if (elisionChild.value === ",") elements.push({
					element: null,
					commaToken: SlimeTokenCreate_default$1.createCommaToken(elisionChild.loc)
				});
			}
		}
		const restElement = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingRestElement?.name);
		if (restElement) {
			const restNode = this.createBindingRestElementAst(restElement);
			elements.push({ element: restNode });
		}
		return {
			type: SlimeNodeType$1.ArrayPattern,
			elements,
			lBracketToken,
			rBracketToken,
			loc: cst.loc
		};
	}
	createObjectBindingPatternAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ObjectBindingPattern?.name);
		const properties = [];
		let lBraceToken;
		let rBraceToken;
		for (const child of cst.children) if (child.value === "{") lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
		else if (child.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
		const propList = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingPropertyList?.name);
		if (propList) for (let i = 0; i < propList.children.length; i++) {
			const child = propList.children[i];
			if (child.value === ",") {
				if (properties.length > 0 && !properties[properties.length - 1].commaToken) properties[properties.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
			} else if (child.name === SlimeParser.prototype.BindingProperty?.name) {
				const singleName = child.children.find((ch) => ch.name === SlimeParser.prototype.SingleNameBinding?.name);
				if (singleName) {
					const value = this.createSingleNameBindingAst(singleName);
					const identifier = singleName.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name);
					const key = this.createBindingIdentifierAst(identifier);
					properties.push({ property: {
						type: SlimeNodeType$1.Property,
						key,
						value,
						kind: "init",
						computed: false,
						shorthand: true,
						loc: child.loc
					} });
				} else {
					const propName = child.children.find((ch) => ch.name === SlimeParser.prototype.PropertyName?.name);
					const bindingElement = child.children.find((ch) => ch.name === SlimeParser.prototype.BindingElement?.name);
					if (propName && bindingElement) {
						const key = this.createPropertyNameAst(propName);
						const value = this.createBindingElementAst(bindingElement);
						const isComputed = this.isComputedPropertyName(propName);
						properties.push({ property: {
							type: SlimeNodeType$1.Property,
							key,
							value,
							kind: "init",
							computed: isComputed,
							shorthand: false,
							loc: child.loc
						} });
					}
				}
			}
		}
		for (const child of cst.children) if (child.value === ",") {
			if (properties.length > 0 && !properties[properties.length - 1].commaToken) properties[properties.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
		}
		const restElement = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingRestElement?.name || ch.name === "BindingRestElement" || ch.name === SlimeParser.prototype.BindingRestProperty?.name || ch.name === "BindingRestProperty");
		if (restElement) {
			const identifier = restElement.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
			if (identifier) {
				const restId = this.createBindingIdentifierAst(identifier);
				const ellipsisCst = restElement.children.find((ch) => ch.value === "...");
				const ellipsisToken = ellipsisCst ? SlimeTokenCreate_default$1.createEllipsisToken(ellipsisCst.loc) : void 0;
				const restNode = {
					type: SlimeNodeType$1.RestElement,
					argument: restId,
					ellipsisToken,
					loc: restElement.loc
				};
				properties.push({ property: restNode });
			}
		}
		return {
			type: SlimeNodeType$1.ObjectPattern,
			properties,
			lBraceToken,
			rBraceToken,
			loc: cst.loc
		};
	}
	/**
	* AssignmentPattern CST �?AST
	* AssignmentPattern -> ObjectAssignmentPattern | ArrayAssignmentPattern
	*/
	createAssignmentPatternAst(cst) {
		const firstChild = cst.children?.[0];
		if (!firstChild) throw new Error("AssignmentPattern has no children");
		if (firstChild.name === SlimeParser.prototype.ObjectAssignmentPattern?.name || firstChild.name === "ObjectAssignmentPattern") return this.createObjectAssignmentPatternAst(firstChild);
		else if (firstChild.name === SlimeParser.prototype.ArrayAssignmentPattern?.name || firstChild.name === "ArrayAssignmentPattern") return this.createArrayAssignmentPatternAst(firstChild);
		throw new Error(`Unknown AssignmentPattern type: ${firstChild.name}`);
	}
	/**
	* ObjectAssignmentPattern CST �?AST
	*/
	createObjectAssignmentPatternAst(cst) {
		return this.createObjectBindingPatternAst(cst);
	}
	/**
	* ArrayAssignmentPattern CST �?AST
	*/
	createArrayAssignmentPatternAst(cst) {
		return this.createArrayBindingPatternAst(cst);
	}
	/**
	* BindingProperty CST �?AST
	* BindingProperty -> SingleNameBinding | PropertyName : BindingElement
	*/
	createBindingPropertyAst(cst) {
		const children = cst.children || [];
		const singleNameBinding = children.find((ch) => ch.name === SlimeParser.prototype.SingleNameBinding?.name || ch.name === "SingleNameBinding");
		if (singleNameBinding) return this.createSingleNameBindingAst(singleNameBinding);
		const propertyName = children.find((ch) => ch.name === SlimeParser.prototype.PropertyName?.name || ch.name === "PropertyName");
		const bindingElement = children.find((ch) => ch.name === SlimeParser.prototype.BindingElement?.name || ch.name === "BindingElement");
		const key = propertyName ? this.createPropertyNameAst(propertyName) : null;
		const value = bindingElement ? this.createBindingElementAst(bindingElement) : null;
		return {
			type: SlimeNodeType$1.Property,
			key,
			value,
			kind: "init",
			method: false,
			shorthand: false,
			computed: false,
			loc: cst.loc
		};
	}
	/**
	* BindingPropertyList CST 转 AST
	*/
	createBindingPropertyListAst(cst) {
		const properties = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.BindingProperty?.name || child.name === "BindingProperty") properties.push(this.createBindingPropertyAst(child));
		return properties;
	}
	/**
	* BindingElementList CST �?AST
	*/
	createBindingElementListAst(cst) {
		const elements = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.BindingElement?.name || child.name === "BindingElement") elements.push(this.createBindingElementAst(child));
		else if (child.name === SlimeParser.prototype.BindingRestElement?.name || child.name === "BindingRestElement") elements.push(this.createBindingRestElementAst(child));
		else if (child.name === SlimeParser.prototype.BindingElisionElement?.name || child.name === "BindingElisionElement") {
			elements.push(null);
			const bindingElement = child.children?.find((ch) => ch.name === SlimeParser.prototype.BindingElement?.name || ch.name === "BindingElement");
			if (bindingElement) elements.push(this.createBindingElementAst(bindingElement));
		}
		return elements;
	}
	/**
	* BindingElisionElement CST �?AST
	*/
	createBindingElisionElementAst(cst) {
		const bindingElement = cst.children?.find((ch) => ch.name === SlimeParser.prototype.BindingElement?.name || ch.name === "BindingElement");
		if (bindingElement) return this.createBindingElementAst(bindingElement);
		return null;
	}
	/**
	* AssignmentPropertyList CST �?AST
	*/
	createAssignmentPropertyListAst(cst) {
		const properties = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.AssignmentProperty?.name || child.name === "AssignmentProperty") properties.push(this.createAssignmentPropertyAst(child));
		return properties;
	}
	/**
	* AssignmentProperty CST �?AST
	*/
	createAssignmentPropertyAst(cst) {
		return this.createBindingPropertyAst(cst);
	}
	/**
	* AssignmentElementList CST �?AST
	*/
	createAssignmentElementListAst(cst) {
		return this.createBindingElementListAst(cst);
	}
	/**
	* AssignmentElement CST �?AST
	*/
	createAssignmentElementAst(cst) {
		return this.createBindingElementAst(cst);
	}
	/**
	* AssignmentElisionElement CST �?AST
	*/
	createAssignmentElisionElementAst(cst) {
		return this.createBindingElisionElementAst(cst);
	}
	/**
	* AssignmentRestElement CST �?AST
	*/
	createAssignmentRestElementAst(cst) {
		return this.createBindingRestElementAst(cst);
	}
	/**
	* AssignmentRestProperty CST �?AST
	*/
	createAssignmentRestPropertyAst(cst) {
		return this.createBindingRestPropertyAst(cst);
	}
	/**
	* BindingRestProperty CST �?AST
	*/
	createBindingRestPropertyAst(cst) {
		const argument = cst.children?.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		const id = argument ? this.createBindingIdentifierAst(argument) : null;
		return SlimeNodeCreate_default$1.createRestElement(id);
	}
	createFunctionExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.FunctionExpression?.name);
		let isAsync = false;
		let isGenerator = false;
		let functionId = null;
		let params = [];
		let body;
		let functionToken = void 0;
		let asyncToken = void 0;
		let asteriskToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children || []) {
			if (!child) continue;
			const name = child.name;
			const value = child.value;
			if (name === "Function" || value === "function") {
				functionToken = SlimeTokenCreate_default$1.createFunctionToken(child.loc);
				continue;
			}
			if (name === "Async" || value === "async") {
				asyncToken = SlimeTokenCreate_default$1.createAsyncToken(child.loc);
				isAsync = true;
				continue;
			}
			if (name === "Asterisk" || value === "*") {
				asteriskToken = SlimeTokenCreate_default$1.createAsteriskToken(child.loc);
				isGenerator = true;
				continue;
			}
			if (name === "LParen" || value === "(") {
				lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || value === ")") {
				rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
				continue;
			}
			if (name === "LBrace" || value === "{") {
				lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
				continue;
			}
			if (name === "RBrace" || value === "}") {
				rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
				continue;
			}
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") {
				functionId = this.createBindingIdentifierAst(child);
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameters?.name || name === "FormalParameters") {
				params = this.createFormalParametersAstWrapped(child);
				continue;
			}
			if (name === SlimeParser.prototype.FunctionBody?.name || name === "FunctionBody") {
				const bodyStatements = this.createFunctionBodyAst(child);
				body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, child.loc);
				continue;
			}
		}
		if (!body) body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createFunctionExpression(body, functionId, params, isGenerator, isAsync, cst.loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken);
	}
	/**
	* 处理 FormalParameters CST 节点
	*/
	createFormalParametersAst(cst) {
		if (!cst.children || cst.children.length === 0) return [];
		const params = [];
		for (const child of cst.children) {
			const name = child.name;
			if (name === SlimeParser.prototype.FormalParameterList?.name || name === "FormalParameterList") return this.createFormalParameterListAst(child);
			if (name === SlimeParser.prototype.FormalParameter?.name || name === "FormalParameter") {
				params.push(this.createFormalParameterAst(child));
				continue;
			}
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") {
				params.push(this.createBindingIdentifierAst(child));
				continue;
			}
			if (name === SlimeParser.prototype.BindingElement?.name || name === "BindingElement") {
				params.push(this.createBindingElementAst(child));
				continue;
			}
			if (name === SlimeParser.prototype.FunctionRestParameter?.name || name === "FunctionRestParameter") {
				params.push(this.createFunctionRestParameterAst(child));
				continue;
			}
			if (child.value === "," || child.value === "(" || child.value === ")") continue;
		}
		return params;
	}
	/**
	* 创建 BlockStatement AST
	* 处理两种情况�?
	* 1. 直接�?StatementList（旧的实现）
	* 2. �?BlockStatement，需要提取内部的 Block -> StatementList
	*/
	createBlockStatementAst(cst) {
		let statements;
		if (cst.name === SlimeParser.prototype.StatementList?.name) statements = this.createStatementListAst(cst);
		else if (cst.name === SlimeParser.prototype.BlockStatement?.name) {
			const blockCst = cst.children?.[0];
			if (blockCst && blockCst.name === SlimeParser.prototype.Block?.name) {
				const statementListCst = blockCst.children?.find((child) => child.name === SlimeParser.prototype.StatementList?.name);
				if (statementListCst) statements = this.createStatementListAst(statementListCst);
				else statements = [];
			} else statements = [];
		} else throw new Error(`Expected StatementList or BlockStatement, got ${cst.name}`);
		return {
			type: SlimeParser.prototype.BlockStatement?.name,
			body: statements,
			loc: cst.loc
		};
	}
	createReturnStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ReturnStatement?.name);
		let argument = null;
		let returnToken = void 0;
		let semicolonToken = void 0;
		const returnCst = cst.children[0];
		if (returnCst && (returnCst.name === "Return" || returnCst.value === "return")) returnToken = SlimeTokenCreate_default$1.createReturnToken(returnCst.loc);
		if (cst.children.length > 1) for (let i = 1; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === "Semicolon" || child.name === "SemicolonASI" || child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
			else if (!argument) argument = this.createExpressionAst(child);
		}
		return SlimeNodeCreate_default$1.createReturnStatement(argument, cst.loc, returnToken, semicolonToken);
	}
	createExpressionStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ExpressionStatement?.name);
		let semicolonToken = void 0;
		let expression = null;
		for (const child of cst.children || []) if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression" || !expression) expression = this.createExpressionAst(child);
		return SlimeNodeCreate_default$1.createExpressionStatement(expression, cst.loc, semicolonToken);
	}
	/**
	* 创建 if 语句 AST
	* if (test) consequent [else alternate]
	* ES2025: if ( Expression ) IfStatementBody [else IfStatementBody]
	*/
	createIfStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.IfStatement?.name);
		let test = null;
		let consequent = null;
		let alternate = null;
		let ifToken = void 0;
		let elseToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		const children = cst.children || [];
		let foundElse = false;
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (name === "If" || child.value === "if") {
				ifToken = SlimeTokenCreate_default$1.createIfToken(child.loc);
				continue;
			}
			if (name === "LParen" || child.value === "(") {
				lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || child.value === ")") {
				rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
				continue;
			}
			if (name === "Else" || child.value === "else") {
				elseToken = SlimeTokenCreate_default$1.createElseToken(child.loc);
				foundElse = true;
				continue;
			}
			if (name === SlimeParser.prototype.Expression?.name || name === "Expression") {
				test = this.createExpressionAst(child);
				continue;
			}
			if (name === SlimeParser.prototype.IfStatementBody?.name || name === "IfStatementBody") {
				const body = this.createIfStatementBodyAst(child);
				if (!foundElse) consequent = body;
				else alternate = body;
				continue;
			}
			if (name === SlimeParser.prototype.Statement?.name || name === "Statement") {
				const stmts = this.createStatementAst(child);
				const body = Array.isArray(stmts) ? stmts[0] : stmts;
				if (!foundElse) consequent = body;
				else alternate = body;
				continue;
			}
		}
		return SlimeNodeCreate_default$1.createIfStatement(test, consequent, alternate, cst.loc, ifToken, elseToken, lParenToken, rParenToken);
	}
	/**
	* 创建 IfStatementBody AST
	* IfStatementBody: Statement | FunctionDeclaration
	*/
	createIfStatementBodyAst(cst) {
		const children = cst.children || [];
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (name === SlimeParser.prototype.Statement?.name || name === "Statement") {
				const stmts = this.createStatementAst(child);
				return Array.isArray(stmts) ? stmts[0] : stmts;
			}
			if (name === SlimeParser.prototype.FunctionDeclaration?.name || name === "FunctionDeclaration") return this.createFunctionDeclarationAst(child);
		}
		return this.createStatementDeclarationAst(cst);
	}
	/**
	* 创建 for 语句 AST
	* ES2025 ForStatement:
	*   for ( var VariableDeclarationList ; Expression_opt ; Expression_opt ) Statement
	*   for ( LexicalDeclaration Expression_opt ; Expression_opt ) Statement
	*   for ( Expression_opt ; Expression_opt ; Expression_opt ) Statement
	*
	* 注意：LexicalDeclaration 内部已经包含分号（SemicolonASI�?
	*/
	createForStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ForStatement?.name);
		let init = null;
		let test = null;
		let update = null;
		let body = null;
		let forToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		const semicolonTokens = [];
		const children = cst.children || [];
		const expressions = [];
		let hasLexicalDeclaration = false;
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (name === "For" || child.value === "for") {
				forToken = SlimeTokenCreate_default$1.createForToken(child.loc);
				continue;
			}
			if (name === "LParen" || child.value === "(") {
				lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || child.value === ")") {
				rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
				continue;
			}
			if (name === "Var" || child.value === "var") continue;
			if (name === "Semicolon" || child.value === ";" || child.loc?.type === "Semicolon") {
				semicolonTokens.push(SlimeTokenCreate_default$1.createSemicolonToken(child.loc));
				continue;
			}
			if (name === SlimeParser.prototype.VariableDeclarationList?.name || name === "VariableDeclarationList") {
				init = this.createVariableDeclarationFromList(child, "var");
				continue;
			}
			if (name === SlimeParser.prototype.LexicalDeclaration?.name || name === "LexicalDeclaration") {
				init = this.createLexicalDeclarationAst(child);
				hasLexicalDeclaration = true;
				continue;
			}
			if (name === SlimeParser.prototype.VariableDeclaration?.name || name === "VariableDeclaration") {
				init = this.createVariableDeclarationAst(child);
				continue;
			}
			if (name === SlimeParser.prototype.Expression?.name || name === "Expression") {
				expressions.push(this.createExpressionAst(child));
				continue;
			}
			if (name === SlimeParser.prototype.Statement?.name || name === "Statement") {
				const stmts = this.createStatementAst(child);
				body = Array.isArray(stmts) ? stmts[0] : stmts;
				continue;
			}
		}
		if (hasLexicalDeclaration) {
			if (expressions.length >= 1) test = expressions[0];
			if (expressions.length >= 2) update = expressions[1];
		} else if (init) {
			if (expressions.length >= 1) test = expressions[0];
			if (expressions.length >= 2) update = expressions[1];
		} else {
			if (expressions.length >= 1) init = expressions[0];
			if (expressions.length >= 2) test = expressions[1];
			if (expressions.length >= 3) update = expressions[2];
		}
		return SlimeNodeCreate_default$1.createForStatement(body, init, test, update, cst.loc, forToken, lParenToken, rParenToken, semicolonTokens[0], semicolonTokens[1]);
	}
	/**
	* �?VariableDeclarationList 创建 VariableDeclaration AST
	*/
	createVariableDeclarationFromList(cst, kind) {
		const children = cst.children || [];
		const declarations = [];
		for (const child of children) {
			if (!child) continue;
			const name = child.name;
			if (child.value === "," || name === "Comma") continue;
			if (name === SlimeParser.prototype.VariableDeclaration?.name || name === "VariableDeclaration") declarations.push(this.createVariableDeclaratorFromVarDeclaration(child));
		}
		return {
			type: SlimeNodeType$1.VariableDeclaration,
			kind,
			declarations,
			loc: cst.loc
		};
	}
	/**
	* 创建 for...in / for...of 语句 AST
	*/
	createForInOfStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ForInOfStatement?.name);
		const hasAwait = cst.children.some((ch) => ch.name === "Await");
		let left = null;
		let right = null;
		let body = null;
		let isForOf = false;
		const forDeclarationCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.ForDeclaration?.name || ch.name === "ForDeclaration");
		const leftHandSideCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.LeftHandSideExpression?.name || ch.name === "LeftHandSideExpression");
		const varBindingCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.ForBinding?.name || ch.name === "ForBinding");
		const varTokenCst = cst.children.find((ch) => ch.name === "Var" || ch.value === "var");
		const bindingIdCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		const initializerCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Initializer?.name || ch.name === "Initializer");
		if (forDeclarationCst) {
			const letOrConstCst = forDeclarationCst.children[0];
			const forBindingCst = forDeclarationCst.children[1];
			const actualBinding = forBindingCst.children[0];
			let id;
			if (actualBinding.name === SlimeParser.prototype.BindingPattern?.name || actualBinding.name === "BindingPattern") id = this.createBindingPatternAst(actualBinding);
			else if (actualBinding.name === SlimeParser.prototype.BindingIdentifier?.name || actualBinding.name === "BindingIdentifier") id = this.createBindingIdentifierAst(actualBinding);
			else id = this.createBindingIdentifierAst(actualBinding);
			const kind = letOrConstCst.children[0].value;
			left = {
				type: SlimeNodeType$1.VariableDeclaration,
				declarations: [{
					type: SlimeNodeType$1.VariableDeclarator,
					id,
					init: null,
					loc: forBindingCst.loc
				}],
				kind: {
					type: "VariableDeclarationKind",
					value: kind,
					loc: letOrConstCst.loc
				},
				loc: forDeclarationCst.loc
			};
		} else if (varTokenCst && bindingIdCst && initializerCst) {
			const id = this.createBindingIdentifierAst(bindingIdCst);
			const init = this.createInitializerAst(initializerCst);
			left = {
				type: SlimeNodeType$1.VariableDeclaration,
				declarations: [{
					type: SlimeNodeType$1.VariableDeclarator,
					id,
					init,
					loc: {
						...bindingIdCst.loc,
						end: initializerCst.loc.end
					}
				}],
				kind: {
					type: "VariableDeclarationKind",
					value: "var",
					loc: varTokenCst.loc
				},
				loc: {
					...varTokenCst.loc,
					end: initializerCst.loc.end
				}
			};
		} else if (leftHandSideCst) left = this.createLeftHandSideExpressionAst(leftHandSideCst);
		else if (varBindingCst) {
			const actualBinding = varBindingCst.children[0];
			let id;
			if (actualBinding.name === SlimeParser.prototype.BindingPattern?.name || actualBinding.name === "BindingPattern") id = this.createBindingPatternAst(actualBinding);
			else id = this.createBindingIdentifierAst(actualBinding);
			left = {
				type: SlimeNodeType$1.VariableDeclaration,
				declarations: [{
					type: SlimeNodeType$1.VariableDeclarator,
					id,
					init: null,
					loc: varBindingCst.loc
				}],
				kind: {
					type: "VariableDeclarationKind",
					value: "var",
					loc: cst.children.find((ch) => ch.name === "Var")?.loc
				},
				loc: varBindingCst.loc
			};
		}
		const inOrOfCst = cst.children.find((ch) => ch.name === "In" || ch.name === "Of" || ch.value === "in" || ch.value === "of");
		isForOf = inOrOfCst?.value === "of" || inOrOfCst?.name === "OfTok";
		const inOrOfIndex = cst.children.indexOf(inOrOfCst);
		if (inOrOfIndex !== -1 && inOrOfIndex + 1 < cst.children.length) {
			const rightCst = cst.children[inOrOfIndex + 1];
			if (rightCst.name !== "RParen") right = this.createExpressionAst(rightCst);
		}
		const statementCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Statement?.name || ch.name === "Statement");
		if (statementCst) {
			const bodyStatements = this.createStatementAst(statementCst);
			body = Array.isArray(bodyStatements) && bodyStatements.length > 0 ? bodyStatements[0] : bodyStatements;
		}
		const result = {
			type: isForOf ? SlimeNodeType$1.ForOfStatement : SlimeNodeType$1.ForInStatement,
			left,
			right,
			body,
			loc: cst.loc
		};
		if (hasAwait) result.await = true;
		return result;
	}
	/**
	* 创建 while 语句 AST
	*/
	createWhileStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.WhileStatement?.name);
		let whileToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "While" || child.value === "while") whileToken = SlimeTokenCreate_default$1.createWhileToken(child.loc);
			else if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
		}
		const expression = cst.children.find((ch) => ch.name === SlimeParser.prototype.Expression?.name);
		const statement = cst.children.find((ch) => ch.name === SlimeParser.prototype.Statement?.name);
		const test = expression ? this.createExpressionAst(expression) : null;
		const bodyArray = statement ? this.createStatementAst(statement) : [];
		const body = bodyArray.length > 0 ? bodyArray[0] : null;
		return SlimeNodeCreate_default$1.createWhileStatement(test, body, cst.loc, whileToken, lParenToken, rParenToken);
	}
	/**
	* 创建 do...while 语句 AST
	*/
	createDoWhileStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.DoWhileStatement?.name);
		let doToken = void 0;
		let whileToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		let semicolonToken = void 0;
		let body = null;
		let test = null;
		for (const child of cst.children) {
			if (!child) continue;
			const name = child.name;
			if (name === "Do" || child.value === "do") doToken = SlimeTokenCreate_default$1.createDoToken(child.loc);
			else if (name === "While" || child.value === "while") whileToken = SlimeTokenCreate_default$1.createWhileToken(child.loc);
			else if (name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
			else if (name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
			else if (name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
			else if (name === SlimeParser.prototype.Statement?.name || name === "Statement") {
				const bodyArray = this.createStatementAst(child);
				body = bodyArray.length > 0 ? bodyArray[0] : null;
			} else if (name === SlimeParser.prototype.Expression?.name || name === "Expression") test = this.createExpressionAst(child);
		}
		return SlimeNodeCreate_default$1.createDoWhileStatement(body, test, cst.loc, doToken, whileToken, lParenToken, rParenToken, semicolonToken);
	}
	/**
	* 创建 switch 语句 AST
	* SwitchStatement: switch ( Expression ) CaseBlock
	*/
	createSwitchStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.SwitchStatement?.name);
		let switchToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "Switch" || child.value === "switch") switchToken = SlimeTokenCreate_default$1.createSwitchToken(child.loc);
			else if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
		}
		const discriminantCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.Expression?.name);
		const discriminant = discriminantCst ? this.createExpressionAst(discriminantCst) : null;
		const caseBlockCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.CaseBlock?.name);
		const cases = caseBlockCst ? this.extractCasesFromCaseBlock(caseBlockCst) : [];
		if (caseBlockCst && caseBlockCst.children) {
			const lBraceCst = caseBlockCst.children.find((ch) => ch.name === "LBrace" || ch.value === "{");
			const rBraceCst = caseBlockCst.children.find((ch) => ch.name === "RBrace" || ch.value === "}");
			if (lBraceCst) lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(lBraceCst.loc);
			if (rBraceCst) rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(rBraceCst.loc);
		}
		return SlimeNodeCreate_default$1.createSwitchStatement(discriminant, cases, cst.loc, switchToken, lParenToken, rParenToken, lBraceToken, rBraceToken);
	}
	/**
	* BreakableStatement CST �?AST（透传�?
	* BreakableStatement -> IterationStatement | SwitchStatement
	*/
	createBreakableStatementAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createStatementDeclarationAst(firstChild);
		throw new Error("BreakableStatement has no children");
	}
	/**
	* IterationStatement CST �?AST（透传�?
	* IterationStatement -> DoWhileStatement | WhileStatement | ForStatement | ForInOfStatement
	*/
	createIterationStatementAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createStatementDeclarationAst(firstChild);
		throw new Error("IterationStatement has no children");
	}
	/**
	* CaseBlock CST �?AST
	* CaseBlock -> { CaseClauses? DefaultClause? CaseClauses? }
	*/
	createCaseBlockAst(cst) {
		return this.extractCasesFromCaseBlock(cst);
	}
	/**
	* CaseClauses CST �?AST
	* CaseClauses -> CaseClause+
	*/
	createCaseClausesAst(cst) {
		const cases = [];
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.CaseClause?.name || child.name === "CaseClause") cases.push(this.createSwitchCaseAst(child));
		return cases;
	}
	/**
	* CaseClause CST �?AST
	* CaseClause -> case Expression : StatementList?
	*/
	createCaseClauseAst(cst) {
		return this.createSwitchCaseAst(cst);
	}
	/**
	* DefaultClause CST �?AST
	* DefaultClause -> default : StatementList?
	*/
	createDefaultClauseAst(cst) {
		return this.createSwitchCaseAst(cst);
	}
	/**
	* LabelledItem CST �?AST（透传�?
	* LabelledItem -> Statement | FunctionDeclaration
	*/
	createLabelledItemAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createStatementDeclarationAst(firstChild);
		throw new Error("LabelledItem has no children");
	}
	/**
	* Catch CST �?CatchClause AST
	* Catch -> catch ( CatchParameter ) Block | catch Block
	*/
	createCatchAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Catch?.name);
		let catchToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "Catch" || child.value === "catch") catchToken = SlimeTokenCreate_default$1.createCatchToken(child.loc);
			else if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
		}
		const paramCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.CatchParameter?.name);
		const blockCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Block?.name);
		const param = paramCst ? this.createCatchParameterAst(paramCst) : null;
		const body = blockCst ? this.createBlockAst(blockCst) : SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createCatchClause(body, param, cst.loc, catchToken, lParenToken, rParenToken);
	}
	/**
	* SemicolonASI CST �?AST
	* 处理自动分号插入
	*/
	createSemicolonASIAst(cst) {
		return null;
	}
	/**
	* ForDeclaration CST �?AST
	* ForDeclaration -> LetOrConst ForBinding
	*/
	createForDeclarationAst(cst) {
		const letOrConst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.LetOrConst?.name || ch.name === "LetOrConst");
		const forBinding = cst.children?.find((ch) => ch.name === SlimeParser.prototype.ForBinding?.name || ch.name === "ForBinding");
		const kind = letOrConst?.children?.[0]?.value || "let";
		const id = forBinding ? this.createForBindingAst(forBinding) : null;
		return {
			type: SlimeNodeType$1.VariableDeclaration,
			declarations: [{
				type: SlimeNodeType$1.VariableDeclarator,
				id,
				init: null,
				loc: forBinding?.loc
			}],
			kind: {
				type: "VariableDeclarationKind",
				value: kind,
				loc: letOrConst?.loc
			},
			loc: cst.loc
		};
	}
	/**
	* ForBinding CST �?AST
	* ForBinding -> BindingIdentifier | BindingPattern
	*/
	createForBindingAst(cst) {
		const firstChild = cst.children?.[0];
		if (!firstChild) return null;
		if (firstChild.name === SlimeParser.prototype.BindingIdentifier?.name || firstChild.name === "BindingIdentifier") return this.createBindingIdentifierAst(firstChild);
		else if (firstChild.name === SlimeParser.prototype.BindingPattern?.name || firstChild.name === "BindingPattern") return this.createBindingPatternAst(firstChild);
		return this.createBindingIdentifierAst(firstChild);
	}
	/**
	* LetOrConst CST �?AST
	* LetOrConst -> let | const
	*/
	createLetOrConstAst(cst) {
		return (cst.children?.[0])?.value || "let";
	}
	/**
	* �?CaseBlock 提取所�?case/default 子句
	* CaseBlock: { CaseClauses? DefaultClause? CaseClauses? }
	*/
	extractCasesFromCaseBlock(caseBlockCst) {
		const cases = [];
		if (!caseBlockCst.children) return cases;
		caseBlockCst.children.forEach((child) => {
			if (child.name === SlimeParser.prototype.CaseClauses?.name) {
				if (child.children) child.children.forEach((caseClauseCst) => {
					cases.push(this.createSwitchCaseAst(caseClauseCst));
				});
			} else if (child.name === SlimeParser.prototype.DefaultClause?.name) cases.push(this.createSwitchCaseAst(child));
		});
		return cases;
	}
	/**
	* [AST 类型映射] CaseClause/DefaultClause CST �?SwitchCase AST
	*
	* 存在必要性：CST �?case �?default 是分开的规则（CaseClause/DefaultClause），
	* �?ESTree AST 统一使用 SwitchCase 类型，通过 test 是否�?null 区分�?
	*
	* CaseClause: case Expression : StatementList?
	* DefaultClause: default : StatementList?
	* @internal
	*/
	createSwitchCaseAst(cst) {
		let test = null;
		let consequent = [];
		let caseToken = void 0;
		let defaultToken = void 0;
		let colonToken = void 0;
		if (cst.name === SlimeParser.prototype.CaseClause?.name) {
			for (const child of cst.children || []) if (child.name === "Case" || child.value === "case") caseToken = SlimeTokenCreate_default$1.createCaseToken(child.loc);
			else if (child.name === "Colon" || child.value === ":") colonToken = SlimeTokenCreate_default$1.createColonToken(child.loc);
			const testCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.Expression?.name);
			test = testCst ? this.createExpressionAst(testCst) : null;
			const stmtListCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.StatementList?.name);
			consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : [];
		} else if (cst.name === SlimeParser.prototype.DefaultClause?.name) {
			for (const child of cst.children || []) if (child.name === "Default" || child.value === "default") defaultToken = SlimeTokenCreate_default$1.createDefaultToken(child.loc);
			else if (child.name === "Colon" || child.value === ":") colonToken = SlimeTokenCreate_default$1.createColonToken(child.loc);
			test = null;
			const stmtListCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.StatementList?.name);
			consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : [];
		}
		return SlimeNodeCreate_default$1.createSwitchCase(consequent, test, cst.loc, caseToken, defaultToken, colonToken);
	}
	/**
	* 创建 try 语句 AST
	*/
	createTryStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.TryStatement?.name);
		let tryToken = void 0;
		let finallyToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "Try" || child.value === "try") tryToken = SlimeTokenCreate_default$1.createTryToken(child.loc);
			else if (child.name === "Finally" || child.value === "finally") finallyToken = SlimeTokenCreate_default$1.createFinallyToken(child.loc);
		}
		const blockCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Block?.name);
		const catchCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Catch?.name);
		const finallyCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Finally?.name);
		const block = blockCst ? this.createBlockAst(blockCst) : null;
		const handler = catchCst ? this.createCatchAst(catchCst) : null;
		const finalizer = finallyCst ? this.createFinallyAst(finallyCst) : null;
		return SlimeNodeCreate_default$1.createTryStatement(block, handler, finalizer, cst.loc, tryToken, finallyToken);
	}
	/**
	* 从Block CST创建BlockStatement AST
	* Block: LBrace StatementList? RBrace
	*/
	createBlockAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Block?.name);
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		if (cst.children) {
			for (const child of cst.children) if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
			else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
		}
		const statementListCst = cst.children?.find((child) => child.name === SlimeParser.prototype.StatementList?.name);
		const statements = statementListCst ? this.createStatementListAst(statementListCst) : [];
		return SlimeNodeCreate_default$1.createBlockStatement(statements, cst.loc, lBraceToken, rBraceToken);
	}
	/**
	* 创建 CatchParameter AST
	*/
	createCatchParameterAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.CatchParameter?.name);
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.BindingIdentifier?.name) return this.createBindingIdentifierAst(first);
		else if (first.name === SlimeParser.prototype.BindingPattern?.name) return this.createBindingPatternAst(first);
		return null;
	}
	/**
	* 创建 Finally 子句 AST
	*/
	createFinallyAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Finally?.name);
		const blockCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Block?.name);
		return blockCst ? this.createBlockAst(blockCst) : null;
	}
	/**
	* 创建 throw 语句 AST
	*/
	createThrowStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ThrowStatement?.name);
		let throwToken = void 0;
		let semicolonToken = void 0;
		let argument = null;
		for (const child of cst.children || []) if (child.name === "Throw" || child.value === "throw") throwToken = SlimeTokenCreate_default$1.createThrowToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") argument = this.createExpressionAst(child);
		return SlimeNodeCreate_default$1.createThrowStatement(argument, cst.loc, throwToken, semicolonToken);
	}
	/**
	* 创建 break 语句 AST
	*/
	createBreakStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BreakStatement?.name);
		let breakToken = void 0;
		let semicolonToken = void 0;
		let label = null;
		for (const child of cst.children || []) if (child.name === "Break" || child.value === "break") breakToken = SlimeTokenCreate_default$1.createBreakToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.LabelIdentifier?.name || child.name === "LabelIdentifier") label = this.createLabelIdentifierAst(child);
		else if (child.name === SlimeParser.prototype.IdentifierName?.name) label = this.createIdentifierNameAst(child);
		else if (child.name === SlimeTokenConsumer.prototype.IdentifierName?.name) label = this.createIdentifierAst(child);
		return SlimeNodeCreate_default$1.createBreakStatement(label, cst.loc, breakToken, semicolonToken);
	}
	/**
	* 创建 continue 语句 AST
	*/
	createContinueStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ContinueStatement?.name);
		let continueToken = void 0;
		let semicolonToken = void 0;
		let label = null;
		for (const child of cst.children || []) if (child.name === "Continue" || child.value === "continue") continueToken = SlimeTokenCreate_default$1.createContinueToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.LabelIdentifier?.name || child.name === "LabelIdentifier") label = this.createLabelIdentifierAst(child);
		else if (child.name === SlimeParser.prototype.IdentifierName?.name) label = this.createIdentifierNameAst(child);
		else if (child.name === SlimeTokenConsumer.prototype.IdentifierName?.name) label = this.createIdentifierAst(child);
		return SlimeNodeCreate_default$1.createContinueStatement(label, cst.loc, continueToken, semicolonToken);
	}
	/**
	* 创建标签语句 AST
	* ES2025: LabelledStatement -> LabelIdentifier : LabelledItem
	* LabelledItem -> Statement | FunctionDeclaration
	*/
	createLabelledStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.LabelledStatement?.name);
		let label = null;
		let body = null;
		if (cst.children && cst.children.length > 0) for (const child of cst.children) {
			if (!child) continue;
			const name = child.name;
			if (child.value === ":" || name === "Colon") continue;
			if (name === SlimeParser.prototype.LabelIdentifier?.name || name === "LabelIdentifier") {
				label = this.createLabelIdentifierAst(child);
				continue;
			}
			if (name === SlimeParser.prototype.LabelledItem?.name || name === "LabelledItem") {
				const itemChild = child.children?.[0];
				if (itemChild) body = this.createStatementDeclarationAst(itemChild);
				continue;
			}
			if (name === SlimeParser.prototype.Statement?.name || name === "Statement") {
				body = this.createStatementDeclarationAst(child);
				continue;
			}
			if (name === SlimeParser.prototype.IdentifierName?.name) {
				label = this.createIdentifierNameAst(child);
				continue;
			}
			if (name === SlimeTokenConsumer.prototype.IdentifierName?.name) {
				label = this.createIdentifierAst(child);
				continue;
			}
		}
		return {
			type: SlimeNodeType$1.LabeledStatement,
			label,
			body,
			loc: cst.loc
		};
	}
	/**
	* 创建 with 语句 AST
	* WithStatement: with ( Expression ) Statement
	*/
	createWithStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.WithStatement?.name);
		let object = null;
		let body = null;
		let withToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		for (const child of cst.children || []) if (child.name === "With" || child.value === "with") withToken = child;
		else if (child.name === "LParen" || child.value === "(") lParenToken = child;
		else if (child.name === "RParen" || child.value === ")") rParenToken = child;
		else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") object = this.createExpressionAst(child);
		else if (child.name === SlimeParser.prototype.Statement?.name || child.name === "Statement") {
			const bodyArray = this.createStatementAst(child);
			body = Array.isArray(bodyArray) && bodyArray.length > 0 ? bodyArray[0] : bodyArray;
		}
		return {
			type: SlimeNodeType$1.WithStatement,
			object,
			body,
			withToken,
			lParenToken,
			rParenToken,
			loc: cst.loc
		};
	}
	/**
	* 创建 debugger 语句 AST
	*/
	createDebuggerStatementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.DebuggerStatement?.name);
		let debuggerToken = void 0;
		let semicolonToken = void 0;
		for (const child of cst.children || []) if (child.name === "Debugger" || child.value === "debugger") debuggerToken = SlimeTokenCreate_default$1.createDebuggerToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(child.loc);
		return SlimeNodeCreate_default$1.createDebuggerStatement(cst.loc, debuggerToken, semicolonToken);
	}
	/**
	* 创建空语�?AST
	*/
	createEmptyStatementAst(cst) {
		let semicolonToken = void 0;
		if (cst.value === ";" || cst.name === SlimeTokenConsumer.prototype.Semicolon?.name) semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(cst.loc);
		else {
			const semicolonCst = cst.children?.find((ch) => ch.name === "Semicolon" || ch.value === ";");
			if (semicolonCst) semicolonToken = SlimeTokenCreate_default$1.createSemicolonToken(semicolonCst.loc);
		}
		return SlimeNodeCreate_default$1.createEmptyStatement(cst.loc, semicolonToken);
	}
	/**
	* 创建函数声明 AST
	* ES2025 FunctionDeclaration structure:
	* - function BindingIdentifier ( FormalParameters ) { FunctionBody }
	* Children: [FunctionTok, BindingIdentifier, LParen, FormalParameters, RParen, LBrace, FunctionBody, RBrace]
	*/
	createFunctionDeclarationAst(cst) {
		const children = cst.children || [];
		let functionName = null;
		let params = [];
		let body = null;
		let isAsync = false;
		let isGenerator = false;
		let functionToken = void 0;
		let asyncToken = void 0;
		let asteriskToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (!child) continue;
			const name = child.name;
			const value = child.value || child.loc?.value;
			if (name === "Function" || value === "function") {
				functionToken = SlimeTokenCreate_default$1.createFunctionToken(child.loc);
				continue;
			}
			if (name === "LParen" || value === "(") {
				lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || value === ")") {
				rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
				continue;
			}
			if (name === "LBrace" || value === "{") {
				lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
				continue;
			}
			if (name === "RBrace" || value === "}") {
				rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
				continue;
			}
			if (name === "Async" || value === "async") {
				asyncToken = SlimeTokenCreate_default$1.createAsyncToken(child.loc);
				isAsync = true;
				continue;
			}
			if (name === "Asterisk" || value === "*") {
				asteriskToken = SlimeTokenCreate_default$1.createAsteriskToken(child.loc);
				isGenerator = true;
				continue;
			}
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") {
				functionName = this.createBindingIdentifierAst(child);
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameters?.name || name === "FormalParameters") {
				params = this.createFormalParametersAstWrapped(child);
				continue;
			}
			if (name === SlimeParser.prototype.FunctionBody?.name || name === "FunctionBody") {
				const statements = this.createFunctionBodyAst(child);
				body = SlimeNodeCreate_default$1.createBlockStatement(statements, child.loc);
				continue;
			}
		}
		if (!body) body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createFunctionDeclaration(functionName, params, body, isGenerator, isAsync, cst.loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken);
	}
	/**
	* Create FormalParameters AST
	* ES2025 FormalParameters:
	*   [empty]
	*   FunctionRestParameter
	*   FormalParameterList
	*   FormalParameterList ,
	*   FormalParameterList , FunctionRestParameter
	*/
	createFormalParametersAstWrapped(cst) {
		const children = cst.children || [];
		const params = [];
		let currentParam = null;
		let hasParam = false;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (!child) continue;
			const name = child.name;
			if (child.value === "(" || name === "LParen") continue;
			if (child.value === ")" || name === "RParen") continue;
			if (child.value === "," || name === "Comma") {
				if (hasParam) {
					const commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
					params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, commaToken));
					hasParam = false;
					currentParam = null;
				}
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameterList?.name || name === "FormalParameterList") {
				if (hasParam) {
					params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
					hasParam = false;
					currentParam = null;
				}
				params.push(...this.createFormalParameterListFromEs2025Wrapped(child));
				continue;
			}
			if (name === SlimeParser.prototype.FunctionRestParameter?.name || name === "FunctionRestParameter") {
				if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
				currentParam = this.createFunctionRestParameterAst(child);
				hasParam = true;
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameter?.name || name === "FormalParameter") {
				if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
				currentParam = this.createFormalParameterAst(child);
				hasParam = true;
				continue;
			}
			if (name === SlimeParser.prototype.BindingElement?.name || name === "BindingElement") {
				if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
				currentParam = this.createBindingElementAst(child);
				hasParam = true;
				continue;
			}
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") {
				if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
				currentParam = this.createBindingIdentifierAst(child);
				hasParam = true;
				continue;
			}
		}
		if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
		return params;
	}
	/**
	* �?ES2025 FormalParameterList 创建参数 AST（包装类型）
	* FormalParameterList: FormalParameter (, FormalParameter)*
	*/
	createFormalParameterListFromEs2025Wrapped(cst) {
		const children = cst.children || [];
		const params = [];
		let currentParam = null;
		let hasParam = false;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (!child) continue;
			const name = child.name;
			if (child.value === "," || name === "Comma") {
				if (hasParam) {
					const commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
					params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, commaToken));
					hasParam = false;
					currentParam = null;
				}
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameter?.name || name === "FormalParameter") {
				if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
				currentParam = this.createFormalParameterAst(child);
				hasParam = true;
			}
		}
		if (hasParam) params.push(SlimeNodeCreate_default$1.createFunctionParam(currentParam, void 0));
		return params;
	}
	createFunctionRestParameterAstAlt(cst) {
		const children = cst.children || [];
		let argument = null;
		for (const child of children) {
			if (!child) continue;
			if (child.value === "..." || child.name === "Ellipsis") continue;
			if (child.name === SlimeParser.prototype.BindingIdentifier?.name || child.name === "BindingIdentifier") argument = this.createBindingIdentifierAst(child);
			else if (child.name === SlimeParser.prototype.BindingRestElement?.name || child.name === "BindingRestElement") return this.createBindingRestElementAst(child);
			else if (child.name === SlimeParser.prototype.BindingPattern?.name || child.name === "BindingPattern") argument = this.createBindingPatternAst(child);
		}
		return {
			type: SlimeNodeType$1.RestElement,
			argument,
			loc: cst.loc
		};
	}
	createCallExpressionAst(cst) {
		const isCallExpr = cst.name === SlimeParser.prototype.CallExpression?.name || cst.name === "CallExpression";
		const isCoverExpr = cst.name === "CoverCallExpressionAndAsyncArrowHead";
		if (!isCallExpr && !isCoverExpr) throw new Error(`createCallExpressionAst: Expected CallExpression or CoverCallExpressionAndAsyncArrowHead, got ${cst.name}`);
		if (cst.children.length === 1) {
			const first = cst.children[0];
			if (first.name === SlimeParser.prototype.SuperCall?.name) return this.createSuperCallAst(first);
			return this.createExpressionAst(first);
		}
		let current;
		const firstChild = cst.children[0];
		if (firstChild.name === "CoverCallExpressionAndAsyncArrowHead") current = this.createCallExpressionAst(firstChild);
		else if (firstChild.name === SlimeParser.prototype.MemberExpression?.name || firstChild.name === "MemberExpression") current = this.createMemberExpressionAst(firstChild);
		else if (firstChild.name === SlimeParser.prototype.SuperCall?.name || firstChild.name === "SuperCall") current = this.createSuperCallAst(firstChild);
		else if (firstChild.name === SlimeParser.prototype.ImportCall?.name || firstChild.name === "ImportCall") current = this.createImportCallAst(firstChild);
		else current = this.createExpressionAst(firstChild);
		for (let i = 1; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === SlimeParser.prototype.Arguments?.name || child.name === "Arguments") {
				const args = this.createArgumentsAst(child);
				current = SlimeNodeCreate_default$1.createCallExpression(current, args);
			} else if (child.name === "DotMemberExpression") {
				const dotChild = child.children[0];
				const tokenCst = child.children[1].children[0];
				const property = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
				const dotOp = SlimeTokenCreate_default$1.createDotToken(dotChild.loc);
				current = SlimeNodeCreate_default$1.createMemberExpression(current, dotOp, property);
			} else if (child.name === "Dot") {
				const dotOp = SlimeTokenCreate_default$1.createDotToken(child.loc);
				const nextChild = cst.children[i + 1];
				let property = null;
				if (nextChild) {
					if (nextChild.name === SlimeParser.prototype.IdentifierName?.name || nextChild.name === "IdentifierName") {
						const tokenCst = nextChild.children[0];
						property = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
						i++;
					} else if (nextChild.name === "PrivateIdentifier") {
						property = SlimeNodeCreate_default$1.createIdentifier(nextChild.value, nextChild.loc);
						i++;
					}
				}
				current = SlimeNodeCreate_default$1.createMemberExpression(current, dotOp, property);
			} else if (child.name === "BracketExpression") {
				const propertyExpression = this.createExpressionAst(child.children[1]);
				current = {
					type: SlimeNodeType$1.MemberExpression,
					object: current,
					property: propertyExpression,
					computed: true,
					optional: false,
					loc: cst.loc
				};
			} else if (child.name === "LBracket") {
				const expressionChild = cst.children[i + 1];
				if (expressionChild && expressionChild.name !== "RBracket") {
					const propertyExpression = this.createExpressionAst(expressionChild);
					current = {
						type: SlimeNodeType$1.MemberExpression,
						object: current,
						property: propertyExpression,
						computed: true,
						optional: false,
						loc: cst.loc
					};
					i += 2;
				}
			} else if (child.name === SlimeParser.prototype.TemplateLiteral?.name || child.name === "TemplateLiteral") {
				const quasi = this.createTemplateLiteralAst(child);
				current = {
					type: "TaggedTemplateExpression",
					tag: current,
					quasi,
					loc: cst.loc
				};
			} else if (child.name === "RBracket") continue;
		}
		return current;
	}
	createSuperCallAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.SuperCall?.name);
		const argumentsCst = cst.children[1];
		const argumentsAst = this.createArgumentsAst(argumentsCst);
		const superNode = {
			type: "Super",
			loc: cst.children[0].loc
		};
		return SlimeNodeCreate_default$1.createCallExpression(superNode, argumentsAst);
	}
	/**
	* 创建 ImportCall AST
	* ImportCall: import ( AssignmentExpression ,_opt )
	*           | import ( AssignmentExpression , AssignmentExpression ,_opt )
	*/
	createImportCallAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ImportCall?.name);
		const args = [];
		for (const child of cst.children) if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
			const expr = this.createAssignmentExpressionAst(child);
			args.push(SlimeNodeCreate_default$1.createCallArgument(expr));
		}
		const importIdentifier = SlimeNodeCreate_default$1.createIdentifier("import", cst.children[0].loc);
		return SlimeNodeCreate_default$1.createCallExpression(importIdentifier, args);
	}
	createSuperPropertyAst(cst) {
		const superNode = {
			type: "Super",
			loc: cst.children[0].loc
		};
		const second = cst.children[1];
		if (second.name === "BracketExpression") {
			const propertyExpression = this.createExpressionAst(second.children[1]);
			return {
				type: SlimeNodeType$1.MemberExpression,
				object: superNode,
				property: propertyExpression,
				computed: true,
				optional: false,
				loc: cst.loc
			};
		} else if (second.name === "LBracket") {
			const expressionCst = cst.children[2];
			const propertyExpression = this.createExpressionAst(expressionCst);
			return {
				type: SlimeNodeType$1.MemberExpression,
				object: superNode,
				property: propertyExpression,
				computed: true,
				optional: false,
				loc: cst.loc
			};
		} else if (second.name === "Dot") {
			const identifierNameCst = cst.children[2];
			let property;
			if (identifierNameCst.name === "IdentifierName" || identifierNameCst.name === SlimeParser.prototype.IdentifierName?.name) {
				const tokenCst = identifierNameCst.children[0];
				property = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
			} else property = SlimeNodeCreate_default$1.createIdentifier(identifierNameCst.value, identifierNameCst.loc);
			return {
				type: SlimeNodeType$1.MemberExpression,
				object: superNode,
				property,
				computed: false,
				optional: false,
				loc: cst.loc
			};
		} else {
			const propToken = cst.children[2];
			const property = SlimeNodeCreate_default$1.createIdentifier(propToken.value, propToken.loc);
			return {
				type: SlimeNodeType$1.MemberExpression,
				object: superNode,
				property,
				computed: false,
				optional: false,
				loc: cst.loc
			};
		}
	}
	createMetaPropertyAst(cst) {
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.NewTarget?.name) return {
			type: "MetaProperty",
			meta: SlimeNodeCreate_default$1.createIdentifier("new", first.loc),
			property: SlimeNodeCreate_default$1.createIdentifier("target", first.loc),
			loc: cst.loc
		};
		else return {
			type: "MetaProperty",
			meta: SlimeNodeCreate_default$1.createIdentifier("import", first.loc),
			property: SlimeNodeCreate_default$1.createIdentifier("meta", first.loc),
			loc: cst.loc
		};
	}
	createArgumentsAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Arguments?.name);
		const first1 = cst.children[1];
		if (first1) {
			if (first1.name === SlimeParser.prototype.ArgumentList?.name) return this.createArgumentListAst(first1);
		}
		return [];
	}
	createArgumentListAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ArgumentList?.name);
		const arguments_ = [];
		let currentArg = null;
		let hasArg = false;
		let pendingEllipsis = null;
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === "Ellipsis" || child.name === "Ellipsis") pendingEllipsis = child;
			else if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
				if (hasArg) arguments_.push(SlimeNodeCreate_default$1.createCallArgument(currentArg, void 0));
				const expr = this.createAssignmentExpressionAst(child);
				if (pendingEllipsis) {
					const ellipsisToken = SlimeTokenCreate_default$1.createEllipsisToken(pendingEllipsis.loc);
					currentArg = SlimeNodeCreate_default$1.createSpreadElement(expr, child.loc, ellipsisToken);
					pendingEllipsis = null;
				} else currentArg = expr;
				hasArg = true;
			} else if (child.name === SlimeParser.prototype.SpreadElement?.name) {
				if (hasArg) arguments_.push(SlimeNodeCreate_default$1.createCallArgument(currentArg, void 0));
				currentArg = this.createSpreadElementAst(child);
				hasArg = true;
			} else if (child.name === "Comma" || child.value === ",") {
				const commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
				if (hasArg) {
					arguments_.push(SlimeNodeCreate_default$1.createCallArgument(currentArg, commaToken));
					hasArg = false;
					currentArg = null;
				}
			}
		}
		if (hasArg) arguments_.push(SlimeNodeCreate_default$1.createCallArgument(currentArg, void 0));
		return arguments_;
	}
	createMemberExpressionFirstOr(cst) {
		if (cst.name === SlimeParser.prototype.PrimaryExpression?.name || cst.name === "PrimaryExpression") return this.createPrimaryExpressionAst(cst);
		else if (cst.name === SlimeParser.prototype.SuperProperty?.name || cst.name === "SuperProperty") return this.createSuperPropertyAst(cst);
		else if (cst.name === SlimeParser.prototype.MetaProperty?.name || cst.name === "MetaProperty") return this.createMetaPropertyAst(cst);
		else if (cst.name === "NewMemberExpressionArguments") return this.createNewExpressionAst(cst);
		else if (cst.name === "New") throw new Error("createMemberExpressionFirstOr: NewTok should be handled in createMemberExpressionAst");
		else throw new Error("createMemberExpressionFirstOr: 不支持的类型: " + cst.name);
	}
	createNewExpressionAst(cst) {
		const isNewMemberExpr = cst.name === "NewMemberExpressionArguments";
		const isNewExpr = cst.name === SlimeParser.prototype.NewExpression?.name;
		if (!isNewMemberExpr && !isNewExpr) throw new Error("createNewExpressionAst: 不支持的类型 " + cst.name);
		if (isNewMemberExpr) {
			let newToken = void 0;
			let lParenToken = void 0;
			let rParenToken = void 0;
			const newCst = cst.children[0];
			if (newCst && (newCst.name === "New" || newCst.value === "new")) newToken = SlimeTokenCreate_default$1.createNewToken(newCst.loc);
			const argsCst = cst.children[2];
			if (argsCst && argsCst.children) {
				for (const child of argsCst.children) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
			}
			const calleeExpression = this.createMemberExpressionAst(cst.children[1]);
			const args = this.createArgumentsAst(cst.children[2]);
			return SlimeNodeCreate_default$1.createNewExpression(calleeExpression, args, cst.loc, newToken, lParenToken, rParenToken);
		} else {
			const firstChild = cst.children[0];
			if (firstChild.name === "New" || firstChild.value === "new") {
				const newToken = SlimeTokenCreate_default$1.createNewToken(firstChild.loc);
				const innerNewExpr = cst.children[1];
				const calleeExpression = this.createNewExpressionAst(innerNewExpr);
				return SlimeNodeCreate_default$1.createNewExpression(calleeExpression, [], cst.loc, newToken, void 0, void 0);
			} else return this.createExpressionAst(firstChild);
		}
	}
	createMemberExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.MemberExpression?.name);
		if (cst.children.length === 0) throw new Error("MemberExpression has no children");
		let current;
		let startIdx = 1;
		if (cst.children[0].name === "New") {
			const newCst = cst.children[0];
			const memberExprCst = cst.children[1];
			const argsCst = cst.children[2];
			const callee = this.createMemberExpressionAst(memberExprCst);
			const args = argsCst ? this.createArgumentsAst(argsCst) : [];
			const newToken = SlimeTokenCreate_default$1.createNewToken(newCst.loc);
			let lParenToken = void 0;
			let rParenToken = void 0;
			if (argsCst && argsCst.children) {
				for (const child of argsCst.children) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
			}
			current = {
				type: "NewExpression",
				callee,
				arguments: args,
				newToken,
				lParenToken,
				rParenToken,
				loc: cst.loc
			};
			startIdx = 3;
		} else current = this.createMemberExpressionFirstOr(cst.children[0]);
		for (let i = startIdx; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === "DotIdentifier") {
				const dotToken = SlimeTokenCreate_default$1.createDotToken(child.children[0].loc);
				let property = null;
				if (child.children[1]) {
					const identifierNameCst = child.children[1];
					if (identifierNameCst.name === SlimeParser.prototype.IdentifierName?.name) {
						const tokenCst = identifierNameCst.children[0];
						property = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
					} else property = this.createIdentifierAst(identifierNameCst);
				}
				current = SlimeNodeCreate_default$1.createMemberExpression(current, dotToken, property);
			} else if (child.name === "Dot") {
				const dotToken = SlimeTokenCreate_default$1.createDotToken(child.loc);
				const nextChild = cst.children[i + 1];
				let property = null;
				if (nextChild) {
					if (nextChild.name === SlimeParser.prototype.IdentifierName?.name || nextChild.name === "IdentifierName") {
						const tokenCst = nextChild.children[0];
						property = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
						i++;
					} else if (nextChild.name === "PrivateIdentifier") {
						property = SlimeNodeCreate_default$1.createIdentifier(nextChild.value, nextChild.loc);
						i++;
					}
				}
				current = SlimeNodeCreate_default$1.createMemberExpression(current, dotToken, property);
			} else if (child.name === "BracketExpression") {
				const propertyExpression = this.createExpressionAst(child.children[1]);
				current = {
					type: SlimeNodeType$1.MemberExpression,
					object: current,
					property: propertyExpression,
					computed: true,
					optional: false,
					loc: cst.loc
				};
			} else if (child.name === "LBracket") {
				const expressionChild = cst.children[i + 1];
				if (expressionChild) {
					const propertyExpression = this.createExpressionAst(expressionChild);
					current = {
						type: SlimeNodeType$1.MemberExpression,
						object: current,
						property: propertyExpression,
						computed: true,
						optional: false,
						loc: cst.loc
					};
					i += 2;
				}
			} else if (child.name === SlimeParser.prototype.Arguments?.name || child.name === "Arguments") {
				const args = this.createArgumentsAst(child);
				current = SlimeNodeCreate_default$1.createCallExpression(current, args);
			} else if (child.name === SlimeParser.prototype.TemplateLiteral?.name || child.name === "TemplateLiteral") {
				const quasi = this.createTemplateLiteralAst(child);
				current = {
					type: "TaggedTemplateExpression",
					tag: current,
					quasi,
					loc: cst.loc
				};
			} else if (child.name === "RBracket") continue;
			else throw new Error(`未知的MemberExpression子节点类�? ${child.name}`);
		}
		return current;
	}
	createVariableDeclaratorAst(cst) {
		const firstChild = cst.children[0];
		let id;
		if (firstChild.name === SlimeParser.prototype.BindingIdentifier?.name) id = this.createBindingIdentifierAst(firstChild);
		else if (firstChild.name === SlimeParser.prototype.BindingPattern?.name) id = this.createBindingPatternAst(firstChild);
		else throw new Error(`Unexpected variable declarator id type: ${firstChild.name}`);
		let variableDeclarator;
		const varCst = cst.children[1];
		if (varCst) {
			const eqCst = varCst.children[0];
			const eqAst = SlimeTokenCreate_default$1.createAssignToken(eqCst.loc);
			const initCst = varCst.children[1];
			if (initCst) if (initCst.name === SlimeParser.prototype.AssignmentExpression?.name) {
				const init = this.createAssignmentExpressionAst(initCst);
				variableDeclarator = SlimeNodeCreate_default$1.createVariableDeclarator(id, eqAst, init);
			} else {
				const init = this.createExpressionAst(initCst);
				variableDeclarator = SlimeNodeCreate_default$1.createVariableDeclarator(id, eqAst, init);
			}
			else variableDeclarator = SlimeNodeCreate_default$1.createVariableDeclarator(id, eqAst);
		} else variableDeclarator = SlimeNodeCreate_default$1.createVariableDeclarator(id);
		variableDeclarator.loc = cst.loc;
		return variableDeclarator;
	}
	/**
	* CoverParenthesizedExpressionAndArrowParameterList CST �?AST
	* 这是一�?cover grammar，根据上下文可能是括号表达式或箭头函数参�?
	*/
	createCoverParenthesizedExpressionAndArrowParameterListAst(cst) {
		return this.createParenthesizedExpressionAst(cst);
	}
	/**
	* ParenthesizedExpression CST �?AST
	* ParenthesizedExpression -> ( Expression )
	*/
	createParenthesizedExpressionAst(cst) {
		for (const child of cst.children || []) if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression" || child.name === SlimeParser.prototype.AssignmentExpression?.name) return this.createExpressionAst(child);
		const innerExpr = cst.children?.find((ch) => ch.name !== "LParen" && ch.name !== "RParen" && ch.value !== "(" && ch.value !== ")");
		if (innerExpr) return this.createExpressionAst(innerExpr);
		throw new Error("ParenthesizedExpression has no inner expression");
	}
	/**
	* ComputedPropertyName CST �?AST
	* ComputedPropertyName -> [ AssignmentExpression ]
	*/
	createComputedPropertyNameAst(cst) {
		const expr = cst.children?.find((ch) => ch.name === SlimeParser.prototype.AssignmentExpression?.name || ch.name === "AssignmentExpression");
		if (expr) return this.createAssignmentExpressionAst(expr);
		throw new Error("ComputedPropertyName missing AssignmentExpression");
	}
	/**
	* CoverInitializedName CST �?AST
	* CoverInitializedName -> IdentifierReference Initializer
	*/
	createCoverInitializedNameAst(cst) {
		const idRef = cst.children?.find((ch) => ch.name === SlimeParser.prototype.IdentifierReference?.name || ch.name === "IdentifierReference");
		const init = cst.children?.find((ch) => ch.name === SlimeParser.prototype.Initializer?.name || ch.name === "Initializer");
		const id = idRef ? this.createIdentifierReferenceAst(idRef) : null;
		const initValue = init ? this.createInitializerAst(init) : null;
		return {
			type: SlimeNodeType$1.AssignmentPattern,
			left: id,
			right: initValue,
			loc: cst.loc
		};
	}
	/**
	* CoverCallExpressionAndAsyncArrowHead CST �?AST
	* 这是一�?cover grammar，通常作为 CallExpression 处理
	*/
	createCoverCallExpressionAndAsyncArrowHeadAst(cst) {
		return this.createCallExpressionAst(cst);
	}
	/**
	* CallMemberExpression CST �?AST
	* CallMemberExpression -> MemberExpression Arguments
	*/
	createCallMemberExpressionAst(cst) {
		return this.createCallExpressionAst(cst);
	}
	/**
	* ShortCircuitExpression CST �?AST（透传�?
	* ShortCircuitExpression -> LogicalORExpression | CoalesceExpression
	*/
	createShortCircuitExpressionAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createExpressionAst(firstChild);
		throw new Error("ShortCircuitExpression has no children");
	}
	/**
	* CoalesceExpressionHead CST 转 AST
	* CoalesceExpressionHead -> CoalesceExpression | BitwiseORExpression
	*/
	createCoalesceExpressionHeadAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createExpressionAst(firstChild);
		throw new Error("CoalesceExpressionHead has no children");
	}
	/**
	* MultiplicativeOperator CST �?AST
	* MultiplicativeOperator -> * | / | %
	*/
	createMultiplicativeOperatorAst(cst) {
		return (cst.children?.[0])?.value || "*";
	}
	/**
	* AssignmentOperator CST �?AST
	* AssignmentOperator -> *= | /= | %= | += | -= | <<= | >>= | >>>= | &= | ^= | |= | **= | &&= | ||= | ??=
	*/
	createAssignmentOperatorAst(cst) {
		return (cst.children?.[0])?.value || "=";
	}
	/**
	* ExpressionBody CST �?AST
	* ExpressionBody -> AssignmentExpression
	*/
	createExpressionBodyAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild) return this.createAssignmentExpressionAst(firstChild);
		throw new Error("ExpressionBody has no children");
	}
	createExpressionAst(cst) {
		const cached = this.expressionAstCache.get(cst);
		if (cached) return cached;
		const result = this.createExpressionAstUncached(cst);
		this.expressionAstCache.set(cst, result);
		return result;
	}
	createExpressionAstUncached(cst) {
		const astName = cst.name;
		let left;
		if (astName === SlimeParser.prototype.Expression?.name) {
			const expressions = [];
			for (const child of cst.children || []) {
				if (child.name === "Comma" || child.value === ",") continue;
				expressions.push(this.createExpressionAst(child));
			}
			if (expressions.length === 1) left = expressions[0];
			else if (expressions.length > 1) left = {
				type: "SequenceExpression",
				expressions,
				loc: cst.loc
			};
			else throw new Error("Expression has no children");
		} else if (astName === SlimeParser.prototype.Statement?.name) left = this.createStatementAst(cst);
		else if (astName === SlimeParser.prototype.AssignmentExpression?.name) left = this.createAssignmentExpressionAst(cst);
		else if (astName === SlimeParser.prototype.ConditionalExpression?.name) left = this.createConditionalExpressionAst(cst);
		else if (astName === SlimeParser.prototype.LogicalORExpression?.name) left = this.createLogicalORExpressionAst(cst);
		else if (astName === SlimeParser.prototype.LogicalANDExpression?.name) left = this.createLogicalANDExpressionAst(cst);
		else if (astName === SlimeParser.prototype.BitwiseORExpression?.name) left = this.createBitwiseORExpressionAst(cst);
		else if (astName === SlimeParser.prototype.BitwiseXORExpression?.name) left = this.createBitwiseXORExpressionAst(cst);
		else if (astName === SlimeParser.prototype.BitwiseANDExpression?.name) left = this.createBitwiseANDExpressionAst(cst);
		else if (astName === SlimeParser.prototype.EqualityExpression?.name) left = this.createEqualityExpressionAst(cst);
		else if (astName === SlimeParser.prototype.RelationalExpression?.name) left = this.createRelationalExpressionAst(cst);
		else if (astName === SlimeParser.prototype.ShiftExpression?.name) left = this.createShiftExpressionAst(cst);
		else if (astName === SlimeParser.prototype.AdditiveExpression?.name) left = this.createAdditiveExpressionAst(cst);
		else if (astName === SlimeParser.prototype.MultiplicativeExpression?.name) left = this.createMultiplicativeExpressionAst(cst);
		else if (astName === SlimeParser.prototype.UnaryExpression?.name) left = this.createUnaryExpressionAst(cst);
		else if (astName === "PostfixExpression") left = this.createUpdateExpressionAst(cst);
		else if (astName === SlimeParser.prototype.UpdateExpression?.name || astName === "UpdateExpression") left = this.createUpdateExpressionAst(cst);
		else if (astName === SlimeParser.prototype.LeftHandSideExpression?.name) left = this.createLeftHandSideExpressionAst(cst);
		else if (astName === SlimeParser.prototype.CallExpression?.name) left = this.createCallExpressionAst(cst);
		else if (astName === SlimeParser.prototype.NewExpression?.name) left = this.createNewExpressionAst(cst);
		else if (astName === "NewMemberExpressionArguments") left = this.createNewExpressionAst(cst);
		else if (astName === SlimeParser.prototype.MemberExpression?.name) left = this.createMemberExpressionAst(cst);
		else if (astName === SlimeParser.prototype.PrimaryExpression?.name) left = this.createPrimaryExpressionAst(cst);
		else if (astName === SlimeParser.prototype.YieldExpression?.name) left = this.createYieldExpressionAst(cst);
		else if (astName === SlimeParser.prototype.AwaitExpression?.name) left = this.createAwaitExpressionAst(cst);
		else if (astName === SlimeParser.prototype.SuperProperty?.name) left = this.createSuperPropertyAst(cst);
		else if (astName === SlimeParser.prototype.MetaProperty?.name) left = this.createMetaPropertyAst(cst);
		else if (astName === "ShortCircuitExpression") {
			left = this.createExpressionAst(cst.children[0]);
			if (cst.children.length > 1 && cst.children[1]) {
				const tailCst = cst.children[1];
				if (tailCst.name === "ShortCircuitExpressionTail" || tailCst.name === "LogicalORExpressionTail") left = this.createShortCircuitExpressionTailAst(left, tailCst);
			}
		} else if (astName === "CoalesceExpression") left = this.createCoalesceExpressionAst(cst);
		else if (astName === "ExponentiationExpression") left = this.createExponentiationExpressionAst(cst);
		else if (astName === "CoverCallExpressionAndAsyncArrowHead") left = this.createCallExpressionAst(cst);
		else if (astName === "OptionalExpression") left = this.createOptionalExpressionAst(cst);
		else if (astName === SlimeParser.prototype.ArrowFunction?.name || astName === "ArrowFunction") left = this.createArrowFunctionAst(cst);
		else if (astName === "AsyncArrowFunction") left = this.createAsyncArrowFunctionAst(cst);
		else if (astName === SlimeParser.prototype.ImportCall?.name || astName === "ImportCall") left = this.createImportCallAst(cst);
		else if (astName === "PrivateIdentifier") left = this.createPrivateIdentifierAst(cst);
		else throw new Error("Unsupported expression type: " + cst.name);
		return left;
	}
	/**
	* 创建 OptionalExpression AST（ES2020�?
	* 处理可选链语法 ?.
	*
	* OptionalExpression:
	*   MemberExpression OptionalChain
	*   CallExpression OptionalChain
	*   OptionalExpression OptionalChain
	*/
	createOptionalExpressionAst(cst) {
		if (!cst.children || cst.children.length === 0) throw new Error("OptionalExpression: no children");
		let result = this.createExpressionAst(cst.children[0]);
		for (let i = 1; i < cst.children.length; i++) {
			const chainCst = cst.children[i];
			if (chainCst.name === "OptionalChain") result = this.createOptionalChainAst(result, chainCst);
		}
		return result;
	}
	/**
	* 创建 OptionalChain AST
	* 处理 ?. 后的各种访问形式
	*
	* 注意：只有紧跟在 ?. 后面的操作是 optional: true
	* 链式的后续操作（�?foo?.().bar() 中的 .bar()）是 optional: false
	*/
	createOptionalChainAst(object, chainCst) {
		let result = object;
		let nextIsOptional = false;
		for (const child of chainCst.children) {
			const name = child.name;
			if (name === "OptionalChaining" || child.value === "?.") {
				nextIsOptional = true;
				continue;
			} else if (name === "Arguments") {
				const args = this.createArgumentsAst(child);
				result = {
					type: SlimeNodeType$1.OptionalCallExpression,
					callee: result,
					arguments: args,
					optional: nextIsOptional,
					loc: chainCst.loc
				};
				nextIsOptional = false;
			} else if (name === "LBracket" || child.value === "[") {
				const exprIndex = chainCst.children.indexOf(child) + 1;
				if (exprIndex < chainCst.children.length) {
					const property = this.createExpressionAst(chainCst.children[exprIndex]);
					result = {
						type: SlimeNodeType$1.OptionalMemberExpression,
						object: result,
						property,
						computed: true,
						optional: nextIsOptional,
						loc: chainCst.loc
					};
					nextIsOptional = false;
				}
			} else if (name === "IdentifierName") {
				let property;
				const tokenCst = child.children[0];
				property = SlimeNodeCreate_default$1.createIdentifier(tokenCst.value, tokenCst.loc);
				result = {
					type: SlimeNodeType$1.OptionalMemberExpression,
					object: result,
					property,
					computed: false,
					optional: nextIsOptional,
					loc: chainCst.loc
				};
				nextIsOptional = false;
			} else if (name === "Dot" || child.value === ".") continue;
			else if (name === "RBracket" || child.value === "]") continue;
			else if (name === "PrivateIdentifier") {
				const property = this.createPrivateIdentifierAst(child);
				result = {
					type: SlimeNodeType$1.OptionalMemberExpression,
					object: result,
					property,
					computed: false,
					optional: nextIsOptional,
					loc: chainCst.loc
				};
				nextIsOptional = false;
			} else if (name === "Expression") continue;
		}
		return result;
	}
	/**
	* 创建 CoalesceExpression AST（ES2020�?
	* 处理 ?? 空值合并运算符
	*/
	createCoalesceExpressionAst(cst) {
		if (cst.children.length === 1) return this.createExpressionAst(cst.children[0]);
		let left = this.createExpressionAst(cst.children[0]);
		for (let i = 1; i < cst.children.length; i += 2) {
			cst.children[i];
			const right = this.createExpressionAst(cst.children[i + 1]);
			left = {
				type: SlimeNodeType$1.LogicalExpression,
				operator: "??",
				left,
				right
			};
		}
		return left;
	}
	/**
	* 创建 ExponentiationExpression AST（ES2016�?
	* 处理 ** 幂运算符
	*/
	createExponentiationExpressionAst(cst) {
		if (cst.children.length === 1) return this.createExpressionAst(cst.children[0]);
		const left = this.createExpressionAst(cst.children[0]);
		cst.children[1];
		const right = this.createExponentiationExpressionAst(cst.children[2]);
		return {
			type: SlimeNodeType$1.BinaryExpression,
			operator: "**",
			left,
			right
		};
	}
	createLogicalORExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.LogicalORExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.LogicalExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createLogicalANDExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.LogicalANDExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.LogicalExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createBitwiseORExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BitwiseORExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createBitwiseXORExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BitwiseXORExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createBitwiseANDExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.BitwiseANDExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createEqualityExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.EqualityExpression?.name);
		if (cst.children.length > 1) {
			const left = this.createExpressionAst(cst.children[0]);
			const operator = cst.children[1].value;
			const right = this.createExpressionAst(cst.children[2]);
			return {
				type: SlimeNodeType$1.BinaryExpression,
				operator,
				left,
				right,
				loc: cst.loc
			};
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createRelationalExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.RelationalExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createShiftExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ShiftExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createAdditiveExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.AdditiveExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createMultiplicativeExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.MultiplicativeExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType$1.BinaryExpression,
					operator,
					left,
					right,
					loc: cst.loc
				};
			}
			return left;
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createUnaryExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.UnaryExpression?.name);
		if (!cst.children || cst.children.length === 0) {
			console.error("UnaryExpression CST没有children:", JSON.stringify(cst, null, 2));
			throw new Error(`UnaryExpression CST没有children，可能是Parser生成的CST不完整`);
		}
		if (cst.children.length === 1) {
			const child = cst.children[0];
			if (child.value !== void 0 && !child.children) throw new Error(`UnaryExpression CST不完整：只有运算符token '${child.name}' (${child.value})，缺少操作数。这是Parser层的问题，请检查Es2025Parser.UnaryExpression的Or分支逻辑。`);
			return this.createExpressionAst(child);
		}
		const operatorToken = cst.children[0];
		const argumentCst = cst.children[1];
		const operator = {
			"Exclamation": "!",
			"Plus": "+",
			"Minus": "-",
			"Tilde": "~",
			"Typeof": "typeof",
			"Void": "void",
			"Delete": "delete",
			"PlusPlus": "++",
			"MinusMinus": "--"
		}[operatorToken.name] || operatorToken.value;
		const argument = this.createExpressionAst(argumentCst);
		return {
			type: SlimeNodeType$1.UnaryExpression,
			operator,
			prefix: true,
			argument,
			loc: cst.loc
		};
	}
	createUpdateExpressionAst(cst) {
		if (cst.children.length > 1) {
			const first = cst.children[0];
			if (first.loc?.type === "PlusPlus" || first.loc?.type === "MinusMinus" || first.value === "++" || first.value === "--") {
				const operator = first.value || first.loc?.value;
				const argument = this.createExpressionAst(cst.children[1]);
				return {
					type: SlimeNodeType$1.UpdateExpression,
					operator,
					argument,
					prefix: true,
					loc: cst.loc
				};
			} else {
				const argument = this.createExpressionAst(cst.children[0]);
				let operator;
				for (let i = 1; i < cst.children.length; i++) {
					const child = cst.children[i];
					if (child.loc?.type === "PlusPlus" || child.loc?.type === "MinusMinus" || child.value === "++" || child.value === "--") {
						operator = child.value || child.loc?.value;
						break;
					}
				}
				if (operator) return {
					type: SlimeNodeType$1.UpdateExpression,
					operator,
					argument,
					prefix: false,
					loc: cst.loc
				};
			}
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createLeftHandSideExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.LeftHandSideExpression?.name);
		if (!cst.children || cst.children.length === 0) return SlimeNodeCreate_default$1.createIdentifier("", cst.loc);
		if (cst.children.length > 1) {}
		return this.createExpressionAst(cst.children[0]);
	}
	createPrimaryExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.PrimaryExpression?.name);
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.IdentifierReference?.name) return this.createIdentifierAst(first.children[0]);
		else if (first.name === SlimeParser.prototype.Literal?.name) return this.createLiteralAst(first);
		else if (first.name === SlimeParser.prototype.ArrayLiteral?.name) return this.createArrayLiteralAst(first);
		else if (first.name === SlimeParser.prototype.FunctionExpression?.name) return this.createFunctionExpressionAst(first);
		else if (first.name === SlimeParser.prototype.ObjectLiteral?.name) return this.createObjectLiteralAst(first);
		else if (first.name === SlimeParser.prototype.ClassExpression?.name) return this.createClassExpressionAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.This?.name) return SlimeNodeCreate_default$1.createThisExpression(first.loc);
		else if (first.name === SlimeTokenConsumer.prototype.RegularExpressionLiteral?.name) return this.createRegExpLiteralAst(first);
		else if (first.name === SlimeParser.prototype.GeneratorExpression?.name || first.name === "GeneratorExpression") return this.createGeneratorExpressionAst(first);
		else if (first.name === SlimeParser.prototype.AsyncFunctionExpression?.name || first.name === "AsyncFunctionExpression") return this.createAsyncFunctionExpressionAst(first);
		else if (first.name === SlimeParser.prototype.AsyncGeneratorExpression?.name || first.name === "AsyncGeneratorExpression") return this.createAsyncGeneratorExpressionAst(first);
		else if (first.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name || first.name === "CoverParenthesizedExpressionAndArrowParameterList") {
			if (!first.children || first.children.length === 0) return SlimeNodeCreate_default$1.createIdentifier("undefined", first.loc);
			if (first.children.length === 2) return SlimeNodeCreate_default$1.createIdentifier("undefined", first.loc);
			const middleCst = first.children[1];
			if (!middleCst) return SlimeNodeCreate_default$1.createIdentifier("undefined", first.loc);
			if (middleCst.name === SlimeParser.prototype.Expression?.name || middleCst.name === "Expression") {
				const innerExpr = this.createExpressionAst(middleCst);
				return SlimeNodeCreate_default$1.createParenthesizedExpression(innerExpr, first.loc);
			}
			if (middleCst.name === SlimeParser.prototype.AssignmentExpression?.name || middleCst.name === "AssignmentExpression") {
				const innerExpr = this.createExpressionAst(middleCst);
				return SlimeNodeCreate_default$1.createParenthesizedExpression(innerExpr, first.loc);
			}
			if (middleCst.name === SlimeParser.prototype.FormalParameterList?.name || middleCst.name === "FormalParameterList") {
				const params = this.createFormalParameterListAst(middleCst);
				if (params.length === 1 && params[0].type === SlimeNodeType$1.Identifier) return SlimeNodeCreate_default$1.createParenthesizedExpression(params[0], first.loc);
				if (params.length > 1) {
					const expressions = params.map((p) => p);
					return SlimeNodeCreate_default$1.createParenthesizedExpression({
						type: "SequenceExpression",
						expressions
					}, first.loc);
				}
				return SlimeNodeCreate_default$1.createIdentifier("undefined", first.loc);
			}
			try {
				const innerExpr = this.createExpressionAst(middleCst);
				return SlimeNodeCreate_default$1.createParenthesizedExpression(innerExpr, first.loc);
			} catch (e) {
				return SlimeNodeCreate_default$1.createIdentifier("undefined", first.loc);
			}
		} else if (first.name === SlimeParser.prototype.TemplateLiteral?.name) return this.createTemplateLiteralAst(first);
		else if (first.name === SlimeParser.prototype.ParenthesizedExpression?.name) {
			const expressionCst = first.children[1];
			const innerExpression = this.createExpressionAst(expressionCst);
			return SlimeNodeCreate_default$1.createParenthesizedExpression(innerExpression, first.loc);
		} else if (first.name === "RegularExpressionLiteral" || first.name === "RegularExpressionLiteral") return this.createRegExpLiteralAst(first);
		else throw new Error("未知的 PrimaryExpression 类型: " + first.name);
	}
	createGeneratorExpressionAst(cst) {
		let id = null;
		let params = [];
		let body;
		const bindingId = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) id = this.createBindingIdentifierAst(bindingId);
		const formalParams = cst.children.find((ch) => ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters" || ch.name === SlimeParser.prototype.FormalParameterList?.name || ch.name === "FormalParameterList");
		if (formalParams) if (formalParams.name === "FormalParameters" || formalParams.name === SlimeParser.prototype.FormalParameters?.name) params = this.createFormalParametersAstWrapped(formalParams);
		else params = this.createFormalParameterListFromEs2025Wrapped(formalParams);
		const bodyNode = cst.children.find((ch) => ch.name === "GeneratorBody" || ch.name === SlimeParser.prototype.GeneratorBody?.name || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		if (bodyNode) {
			const bodyStatements = this.createFunctionBodyAst(bodyNode);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createFunctionExpression(body, id, params, true, false, cst.loc);
	}
	createAsyncFunctionExpressionAst(cst) {
		let id = null;
		let params = [];
		let body;
		const bindingId = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) id = this.createBindingIdentifierAst(bindingId);
		const formalParams = cst.children.find((ch) => ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters" || ch.name === SlimeParser.prototype.FormalParameterList?.name || ch.name === "FormalParameterList");
		if (formalParams) if (formalParams.name === "FormalParameters" || formalParams.name === SlimeParser.prototype.FormalParameters?.name) params = this.createFormalParametersAstWrapped(formalParams);
		else params = this.createFormalParameterListFromEs2025Wrapped(formalParams);
		const bodyNode = cst.children.find((ch) => ch.name === "AsyncFunctionBody" || ch.name === SlimeParser.prototype.AsyncFunctionBody?.name || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		if (bodyNode) {
			const bodyStatements = this.createFunctionBodyAst(bodyNode);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createFunctionExpression(body, id, params, false, true, cst.loc);
	}
	createAsyncGeneratorExpressionAst(cst) {
		let id = null;
		let params = [];
		let body;
		const bindingId = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
		if (bindingId) id = this.createBindingIdentifierAst(bindingId);
		const formalParams = cst.children.find((ch) => ch.name === SlimeParser.prototype.FormalParameters?.name || ch.name === "FormalParameters" || ch.name === SlimeParser.prototype.FormalParameterList?.name || ch.name === "FormalParameterList");
		if (formalParams) if (formalParams.name === "FormalParameters" || formalParams.name === SlimeParser.prototype.FormalParameters?.name) params = this.createFormalParametersAstWrapped(formalParams);
		else params = this.createFormalParameterListFromEs2025Wrapped(formalParams);
		const bodyNode = cst.children.find((ch) => ch.name === "AsyncGeneratorBody" || ch.name === SlimeParser.prototype.AsyncGeneratorBody?.name || ch.name === "FunctionBody" || ch.name === SlimeParser.prototype.FunctionBody?.name);
		if (bodyNode) {
			const bodyStatements = this.createFunctionBodyAst(bodyNode);
			body = SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return SlimeNodeCreate_default$1.createFunctionExpression(body, id, params, true, true, cst.loc);
	}
	createTemplateLiteralAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.TemplateLiteral?.name);
		const first = cst.children[0];
		if (first.name === SlimeTokenConsumer.prototype.NoSubstitutionTemplate?.name || first.name === "NoSubstitutionTemplate") {
			const raw = first.value || "``";
			const cooked = raw.slice(1, -1);
			const quasis$1 = [SlimeNodeCreate_default$1.createTemplateElement(true, raw, cooked, first.loc)];
			return SlimeNodeCreate_default$1.createTemplateLiteral(quasis$1, [], cst.loc);
		}
		let targetCst = cst;
		if (first.name === SlimeParser.prototype.SubstitutionTemplate?.name || first.name === "SubstitutionTemplate") targetCst = first;
		const quasis = [];
		const expressions = [];
		for (let i = 0; i < targetCst.children.length; i++) {
			const child = targetCst.children[i];
			if (child.name === SlimeTokenConsumer.prototype.TemplateHead?.name || child.name === "TemplateHead") {
				const raw = child.value || "";
				const cooked = raw.slice(1, -2);
				quasis.push(SlimeNodeCreate_default$1.createTemplateElement(false, raw, cooked, child.loc));
			} else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") expressions.push(this.createExpressionAst(child));
			else if (child.name === SlimeParser.prototype.TemplateSpans?.name || child.name === "TemplateSpans") this.processTemplateSpans(child, quasis, expressions);
		}
		return SlimeNodeCreate_default$1.createTemplateLiteral(quasis, expressions, cst.loc);
	}
	processTemplateSpans(cst, quasis, expressions) {
		const first = cst.children[0];
		if (first.name === SlimeTokenConsumer.prototype.TemplateTail?.name) {
			const raw = first.value || "";
			const cooked = raw.slice(1, -1);
			quasis.push(SlimeNodeCreate_default$1.createTemplateElement(true, raw, cooked, first.loc));
			return;
		}
		if (first.name === SlimeParser.prototype.TemplateMiddleList?.name) {
			this.processTemplateMiddleList(first, quasis, expressions);
			if (cst.children[1] && cst.children[1].name === SlimeTokenConsumer.prototype.TemplateTail?.name) {
				const tail = cst.children[1];
				const raw = tail.value || "";
				const cooked = raw.slice(1, -1);
				quasis.push(SlimeNodeCreate_default$1.createTemplateElement(true, raw, cooked, tail.loc));
			}
		}
	}
	processTemplateMiddleList(cst, quasis, expressions) {
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === SlimeTokenConsumer.prototype.TemplateMiddle?.name || child.name === "TemplateMiddle") {
				const raw = child.value || "";
				const cooked = raw.slice(1, -2);
				quasis.push(SlimeNodeCreate_default$1.createTemplateElement(false, raw, cooked, child.loc));
			} else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") expressions.push(this.createExpressionAst(child));
			else if (child.name === SlimeParser.prototype.TemplateMiddleList?.name || child.name === "TemplateMiddleList") this.processTemplateMiddleList(child, quasis, expressions);
		}
	}
	createClassExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ClassExpression?.name);
		let id = null;
		let tailStartIndex = 1;
		const nextChild = cst.children[1];
		if (nextChild && nextChild.name === SlimeParser.prototype.BindingIdentifier?.name) {
			id = this.createBindingIdentifierAst(nextChild);
			tailStartIndex = 2;
		}
		const classTail = this.createClassTailAst(cst.children[tailStartIndex]);
		return SlimeNodeCreate_default$1.createClassExpression(id, classTail.superClass, classTail.body, cst.loc);
	}
	createPropertyDefinitionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.PropertyDefinition?.name);
		if (!cst.children || cst.children.length === 0) throw new Error("PropertyDefinition CST has no children - this should not happen for valid syntax");
		const first = cst.children[0];
		if (first.name === "Ellipsis" || first.value === "...") {
			const AssignmentExpressionCst = cst.children[1];
			const argument = this.createAssignmentExpressionAst(AssignmentExpressionCst);
			return {
				type: SlimeNodeType$1.SpreadElement,
				argument,
				loc: cst.loc
			};
		} else if (cst.children.length > 2) {
			const PropertyNameCst = cst.children[0];
			const AssignmentExpressionCst = cst.children[2];
			const key = this.createPropertyNameAst(PropertyNameCst);
			const value = this.createAssignmentExpressionAst(AssignmentExpressionCst);
			const keyAst = SlimeNodeCreate_default$1.createPropertyAst(key, value);
			if (PropertyNameCst.children[0].name === SlimeParser.prototype.ComputedPropertyName?.name) keyAst.computed = true;
			return keyAst;
		} else if (first.name === SlimeParser.prototype.MethodDefinition?.name) {
			const SlimeMethodDefinition = this.createMethodDefinitionAst(null, first);
			const keyAst = SlimeNodeCreate_default$1.createPropertyAst(SlimeMethodDefinition.key, SlimeMethodDefinition.value);
			if (SlimeMethodDefinition.computed) keyAst.computed = true;
			if (SlimeMethodDefinition.kind === "get" || SlimeMethodDefinition.kind === "set") keyAst.kind = SlimeMethodDefinition.kind;
			else keyAst.method = true;
			return keyAst;
		} else if (first.name === SlimeParser.prototype.IdentifierReference?.name) {
			const identifierCst = first.children[0];
			const identifier = this.createIdentifierAst(identifierCst);
			const keyAst = SlimeNodeCreate_default$1.createPropertyAst(identifier, identifier);
			keyAst.shorthand = true;
			return keyAst;
		} else if (first.name === "CoverInitializedName") {
			const identifierRefCst = first.children[0];
			const initializerCst = first.children[1];
			const identifierCst = identifierRefCst.children[0];
			const identifier = this.createIdentifierAst(identifierCst);
			const defaultValue = this.createAssignmentExpressionAst(initializerCst.children[1]);
			const assignmentPattern = {
				type: SlimeNodeType$1.AssignmentPattern,
				left: identifier,
				right: defaultValue,
				loc: first.loc
			};
			const keyAst = SlimeNodeCreate_default$1.createPropertyAst(identifier, assignmentPattern);
			keyAst.shorthand = true;
			return keyAst;
		} else throw new Error(`不支持的PropertyDefinition类型: ${first.name}`);
	}
	createPropertyNameAst(cst) {
		if (!cst || !cst.children || cst.children.length === 0) throw new Error("createPropertyNameAst: invalid cst or no children");
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.LiteralPropertyName?.name || first.name === "LiteralPropertyName") return this.createLiteralPropertyNameAst(first);
		else if (first.name === SlimeParser.prototype.ComputedPropertyName?.name || first.name === "ComputedPropertyName") return this.createAssignmentExpressionAst(first.children[1]);
		return this.createLiteralPropertyNameAst(first);
	}
	createLiteralPropertyNameAst(cst) {
		if (!cst) throw new Error("createLiteralPropertyNameAst: cst is null");
		let first = cst;
		if (cst.name === SlimeParser.prototype.LiteralPropertyName?.name || cst.name === "LiteralPropertyName") {
			if (!cst.children || cst.children.length === 0) throw new Error("createLiteralPropertyNameAst: LiteralPropertyName has no children");
			first = cst.children[0];
		}
		if (first.name === "IdentifierName" || first.name === SlimeParser.prototype.IdentifierName?.name) {
			if (first.value !== void 0) return SlimeNodeCreate_default$1.createIdentifier(first.value, first.loc);
			let current = first;
			while (current.children && current.children.length > 0 && current.value === void 0) current = current.children[0];
			if (current.value !== void 0) return SlimeNodeCreate_default$1.createIdentifier(current.value, current.loc || first.loc);
			throw new Error(`createLiteralPropertyNameAst: Cannot extract value from IdentifierName`);
		} else if (first.name === "Identifier" || first.name === SlimeParser.prototype.Identifier?.name) return this.createIdentifierAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.NumericLiteral?.name || first.name === "NumericLiteral" || first.name === "Number") return this.createNumericLiteralAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.StringLiteral?.name || first.name === "StringLiteral" || first.name === "String") return this.createStringLiteralAst(first);
		else if (first.value !== void 0) return SlimeNodeCreate_default$1.createIdentifier(first.value, first.loc);
		throw new Error(`createLiteralPropertyNameAst: Unknown type: ${first.name}`);
	}
	/**
	* [AST 类型映射] NumericLiteral 终端�?�?Literal AST
	*
	* 存在必要性：NumericLiteral �?CST 中是终端符，�?ESTree AST 中是 Literal 类型�?
	*/
	createNumericLiteralAst(cst) {
		if (![
			SlimeTokenConsumer.prototype.NumericLiteral?.name,
			"NumericLiteral",
			"NumericLiteral",
			"Number"
		].includes(cst.name)) throw new Error(`Expected NumericLiteral, got ${cst.name}`);
		const rawValue = cst.value;
		return SlimeNodeCreate_default$1.createNumericLiteral(Number(rawValue), rawValue);
	}
	/**
	* [AST 类型映射] StringLiteral 终端�?�?Literal AST
	*
	* 存在必要性：StringLiteral �?CST 中是终端符，�?ESTree AST 中是 Literal 类型�?
	*/
	createStringLiteralAst(cst) {
		if (![
			SlimeTokenConsumer.prototype.StringLiteral?.name,
			"StringLiteral",
			"StringLiteral",
			"String"
		].includes(cst.name)) throw new Error(`Expected StringLiteral, got ${cst.name}`);
		const rawValue = cst.value;
		return SlimeNodeCreate_default$1.createStringLiteral(rawValue, cst.loc, rawValue);
	}
	/**
	* [AST 类型映射] RegularExpressionLiteral 终端�?�?Literal AST
	*
	* 存在必要性：RegularExpressionLiteral �?CST 中是终端符，
	* �?ESTree AST 中是 Literal 类型，需要解析正则表达式�?pattern �?flags�?
	*
	* RegularExpressionLiteral: /pattern/flags
	*/
	createRegExpLiteralAst(cst) {
		const rawValue = cst.value;
		const match = rawValue.match(/^\/(.*)\/([gimsuy]*)$/);
		if (match) {
			const pattern = match[1];
			const flags = match[2];
			return {
				type: SlimeNodeType$1.Literal,
				value: new RegExp(pattern, flags),
				raw: rawValue,
				regex: {
					pattern,
					flags
				},
				loc: cst.loc
			};
		}
		return {
			type: SlimeNodeType$1.Literal,
			value: rawValue,
			raw: rawValue,
			loc: cst.loc
		};
	}
	createLiteralFromToken(token) {
		const tokenName = token.tokenName;
		if (tokenName === SlimeTokenConsumer.prototype.NullLiteral?.name) return SlimeNodeCreate_default$1.createNullLiteralToken();
		else if (tokenName === SlimeTokenConsumer.prototype.True?.name) return SlimeNodeCreate_default$1.createBooleanLiteral(true);
		else if (tokenName === SlimeTokenConsumer.prototype.False?.name) return SlimeNodeCreate_default$1.createBooleanLiteral(false);
		else if (tokenName === SlimeTokenConsumer.prototype.NumericLiteral?.name) return SlimeNodeCreate_default$1.createNumericLiteral(Number(token.tokenValue));
		else if (tokenName === SlimeTokenConsumer.prototype.StringLiteral?.name) return SlimeNodeCreate_default$1.createStringLiteral(token.tokenValue);
		else throw new Error(`Unsupported literal token: ${tokenName}`);
	}
	createElementListAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ElementList?.name);
		const elements = [];
		let currentElement = null;
		let hasElement = false;
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
				if (hasElement) elements.push(SlimeNodeCreate_default$1.createArrayElement(currentElement, void 0));
				currentElement = this.createAssignmentExpressionAst(child);
				hasElement = true;
			} else if (child.name === SlimeParser.prototype.SpreadElement?.name) {
				if (hasElement) elements.push(SlimeNodeCreate_default$1.createArrayElement(currentElement, void 0));
				currentElement = this.createSpreadElementAst(child);
				hasElement = true;
			} else if (child.name === SlimeParser.prototype.Elision?.name) {
				const elisionCommas = child.children?.filter((c) => c.name === "Comma" || c.value === ",") || [];
				for (let j = 0; j < elisionCommas.length; j++) if (hasElement) {
					const commaToken = SlimeTokenCreate_default$1.createCommaToken(elisionCommas[j].loc);
					elements.push(SlimeNodeCreate_default$1.createArrayElement(currentElement, commaToken));
					hasElement = false;
					currentElement = null;
				} else {
					const commaToken = SlimeTokenCreate_default$1.createCommaToken(elisionCommas[j].loc);
					elements.push(SlimeNodeCreate_default$1.createArrayElement(null, commaToken));
				}
			} else if (child.name === "Comma" || child.value === ",") {
				const commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
				elements.push(SlimeNodeCreate_default$1.createArrayElement(currentElement, commaToken));
				hasElement = false;
				currentElement = null;
			}
		}
		if (hasElement) elements.push(SlimeNodeCreate_default$1.createArrayElement(currentElement, void 0));
		return elements;
	}
	createSpreadElementAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.SpreadElement?.name);
		let ellipsisToken = void 0;
		const ellipsisCst = cst.children.find((ch) => ch.name === "Ellipsis" || ch.name === "Ellipsis" || ch.value === "...");
		if (ellipsisCst) ellipsisToken = SlimeTokenCreate_default$1.createEllipsisToken(ellipsisCst.loc);
		const expression = cst.children.find((ch) => ch.name === SlimeParser.prototype.AssignmentExpression?.name);
		if (!expression) throw new Error("SpreadElement missing AssignmentExpression");
		return SlimeNodeCreate_default$1.createSpreadElement(this.createAssignmentExpressionAst(expression), cst.loc, ellipsisToken);
	}
	/**
	* 布尔字面�?CST �?AST
	* BooleanLiteral -> true | false
	*/
	createBooleanLiteralAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild?.name === "True" || firstChild?.value === "true") {
			const lit = SlimeNodeCreate_default$1.createBooleanLiteral(true);
			lit.loc = firstChild.loc || cst.loc;
			return lit;
		} else {
			const lit = SlimeNodeCreate_default$1.createBooleanLiteral(false);
			lit.loc = firstChild?.loc || cst.loc;
			return lit;
		}
	}
	/**
	* ArrayLiteral CST �?ArrayExpression AST
	* ArrayLiteral -> [ Elision? ] | [ ElementList ] | [ ElementList , Elision? ]
	*/
	createArrayLiteralAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ArrayLiteral?.name);
		let lBracketToken = void 0;
		let rBracketToken = void 0;
		if (cst.children && cst.children.length > 0) {
			const firstChild = cst.children[0];
			if (firstChild && (firstChild.name === "LBracket" || firstChild.value === "[")) lBracketToken = SlimeTokenCreate_default$1.createLBracketToken(firstChild.loc);
			const lastChild = cst.children[cst.children.length - 1];
			if (lastChild && (lastChild.name === "RBracket" || lastChild.value === "]")) rBracketToken = SlimeTokenCreate_default$1.createRBracketToken(lastChild.loc);
		}
		const elementList = cst.children.find((ch) => ch.name === SlimeParser.prototype.ElementList?.name);
		const elements = elementList ? this.createElementListAst(elementList) : [];
		for (const child of cst.children) if (child.name === "Comma" || child.value === ",") {} else if (child.name === SlimeParser.prototype.Elision?.name || child.name === "Elision") {
			const elisionCommas = child.children?.filter((c) => c.name === "Comma" || c.value === ",") || [];
			for (let j = 0; j < elisionCommas.length; j++) {
				const commaToken = SlimeTokenCreate_default$1.createCommaToken(elisionCommas[j].loc);
				elements.push(SlimeNodeCreate_default$1.createArrayElement(null, commaToken));
			}
		}
		return SlimeNodeCreate_default$1.createArrayExpression(elements, cst.loc, lBracketToken, rBracketToken);
	}
	/**
	* 对象字面�?CST �?AST（透传�?ObjectExpression�?
	* ObjectLiteral -> { } | { PropertyDefinitionList } | { PropertyDefinitionList , }
	*/
	createObjectLiteralAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ObjectLiteral?.name);
		const properties = [];
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		if (cst.children && cst.children.length > 0) {
			const firstChild = cst.children[0];
			if (firstChild && (firstChild.name === "LBrace" || firstChild.value === "{")) lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(firstChild.loc);
			const lastChild = cst.children[cst.children.length - 1];
			if (lastChild && (lastChild.name === "RBrace" || lastChild.value === "}")) rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(lastChild.loc);
		}
		if (cst.children.length > 2) {
			const PropertyDefinitionListCst = cst.children[1];
			let currentProperty = null;
			let hasProperty = false;
			for (const child of PropertyDefinitionListCst.children) if (child.name === SlimeParser.prototype.PropertyDefinition?.name && child.children && child.children.length > 0) {
				if (hasProperty) properties.push(SlimeNodeCreate_default$1.createObjectPropertyItem(currentProperty, void 0));
				currentProperty = this.createPropertyDefinitionAst(child);
				hasProperty = true;
			} else if (child.name === "Comma" || child.value === ",") {
				const commaToken = SlimeTokenCreate_default$1.createCommaToken(child.loc);
				if (hasProperty) {
					properties.push(SlimeNodeCreate_default$1.createObjectPropertyItem(currentProperty, commaToken));
					hasProperty = false;
					currentProperty = null;
				}
			}
			if (hasProperty) properties.push(SlimeNodeCreate_default$1.createObjectPropertyItem(currentProperty, void 0));
		}
		return SlimeNodeCreate_default$1.createObjectExpression(properties, cst.loc, lBraceToken, rBraceToken);
	}
	/**
	* Elision（逗号空位）CST �?AST
	* Elision -> , | Elision ,
	* 返回 null 元素的数�?
	*/
	createElisionAst(cst) {
		let count = 0;
		for (const child of cst.children || []) if (child.value === ",") count++;
		return count;
	}
	createLiteralAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.Literal?.name);
		const firstChild = cst.children[0];
		let value;
		const childName = firstChild.name;
		if (childName === SlimeTokenConsumer.prototype.NumericLiteral?.name || childName === "NumericLiteral") {
			const rawValue = firstChild.value;
			value = SlimeNodeCreate_default$1.createNumericLiteral(Number(rawValue), rawValue);
		} else if (childName === SlimeTokenConsumer.prototype.True?.name || childName === "True") value = SlimeNodeCreate_default$1.createBooleanLiteral(true);
		else if (childName === SlimeTokenConsumer.prototype.False?.name || childName === "False") value = SlimeNodeCreate_default$1.createBooleanLiteral(false);
		else if (childName === SlimeTokenConsumer.prototype.NullLiteral?.name || childName === "NullLiteral" || childName === "Null") value = SlimeNodeCreate_default$1.createNullLiteralToken();
		else if (childName === SlimeTokenConsumer.prototype.StringLiteral?.name || childName === "StringLiteral") {
			const rawValue = firstChild.value;
			value = SlimeNodeCreate_default$1.createStringLiteral(rawValue, firstChild.loc, rawValue);
		} else if (childName === "BooleanLiteral" || childName === SlimeParser.prototype.BooleanLiteral?.name) {
			const innerChild = firstChild.children?.[0];
			if (innerChild?.name === "True" || innerChild?.value === "true") value = SlimeNodeCreate_default$1.createBooleanLiteral(true);
			else value = SlimeNodeCreate_default$1.createBooleanLiteral(false);
			value.loc = innerChild?.loc || firstChild.loc;
			return value;
		} else if (childName === "NullLiteral") value = SlimeNodeCreate_default$1.createNullLiteralToken();
		else if (childName === "BigIntLiteral") {
			const rawValue = firstChild.value || firstChild.children?.[0]?.value;
			const numStr = rawValue.endsWith("n") ? rawValue.slice(0, -1) : rawValue;
			value = SlimeNodeCreate_default$1.createBigIntLiteral(numStr, rawValue);
		} else {
			const rawValue = firstChild.value;
			if (rawValue !== void 0) value = SlimeNodeCreate_default$1.createStringLiteral(rawValue, firstChild.loc, rawValue);
			else {
				const innerChild = firstChild.children?.[0];
				if (innerChild?.value) value = SlimeNodeCreate_default$1.createStringLiteral(innerChild.value, innerChild.loc, innerChild.value);
				else throw new Error(`Cannot extract value from Literal: ${childName}`);
			}
		}
		value.loc = firstChild.loc;
		return value;
	}
	createAssignmentExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.AssignmentExpression?.name);
		if (cst.children.length === 1) {
			const child = cst.children[0];
			if (child.name === SlimeParser.prototype.ArrowFunction?.name) return this.createArrowFunctionAst(child);
			return this.createExpressionAst(child);
		}
		const leftCst = cst.children[0];
		const operatorCst = cst.children[1];
		const rightCst = cst.children[2];
		const left = this.createExpressionAst(leftCst);
		const right = this.createAssignmentExpressionAst(rightCst);
		return {
			type: "AssignmentExpression",
			operator: operatorCst.children && operatorCst.children[0]?.value || operatorCst.value || "=",
			left,
			right,
			loc: cst.loc
		};
	}
	/**
	* 创建箭头函数 AST
	*/
	createArrowFunctionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ArrowFunction?.name);
		let asyncToken = void 0;
		let arrowToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		const commaTokens = [];
		let offset = 0;
		let isAsync = false;
		if (cst.children[0] && cst.children[0].name === "Async") {
			asyncToken = SlimeTokenCreate_default$1.createAsyncToken(cst.children[0].loc);
			isAsync = true;
			offset = 1;
		}
		if (!cst.children || cst.children.length < 3 + offset) throw new Error(`createArrowFunctionAst: 期望${3 + offset}个children，实�?{cst.children?.length || 0}个`);
		const arrowParametersCst = cst.children[0 + offset];
		const arrowCst = cst.children[1 + offset];
		const conciseBodyCst = cst.children[2 + offset];
		if (arrowCst && (arrowCst.name === "Arrow" || arrowCst.value === "=>")) arrowToken = SlimeTokenCreate_default$1.createArrowToken(arrowCst.loc);
		let params;
		if (arrowParametersCst.name === SlimeParser.prototype.BindingIdentifier?.name) params = [{ param: this.createBindingIdentifierAst(arrowParametersCst) }];
		else if (arrowParametersCst.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
			for (const child of arrowParametersCst.children || []) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
			else if (child.name === "Comma" || child.value === ",") commaTokens.push(SlimeTokenCreate_default$1.createCommaToken(child.loc));
			params = this.createArrowParametersFromCoverGrammar(arrowParametersCst).map((p, i) => ({
				param: p,
				commaToken: commaTokens[i]
			}));
		} else if (arrowParametersCst.name === SlimeParser.prototype.ArrowParameters?.name) {
			const firstChild = arrowParametersCst.children?.[0];
			if (firstChild?.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
				for (const child of firstChild.children || []) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(child.loc);
				else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(child.loc);
				else if (child.name === "Comma" || child.value === ",") commaTokens.push(SlimeTokenCreate_default$1.createCommaToken(child.loc));
			}
			params = this.createArrowParametersAst(arrowParametersCst).map((p, i) => ({
				param: p,
				commaToken: commaTokens[i]
			}));
		} else throw new Error(`createArrowFunctionAst: 不支持的参数类型 ${arrowParametersCst.name}`);
		const body = this.createConciseBodyAst(conciseBodyCst);
		return SlimeNodeCreate_default$1.createArrowFunctionExpression(body, params, body.type !== SlimeNodeType$1.BlockStatement, isAsync, cst.loc, arrowToken, asyncToken, lParenToken, rParenToken);
	}
	/**
	* 创建 Async 箭头函数 AST
	* AsyncArrowFunction: async AsyncArrowBindingIdentifier => AsyncConciseBody
	*                   | CoverCallExpressionAndAsyncArrowHead => AsyncConciseBody
	*/
	createAsyncArrowFunctionAst(cst) {
		let params = [];
		let body;
		let arrowIndex = -1;
		let arrowToken = void 0;
		let asyncToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		for (let i = 0; i < cst.children.length; i++) if (cst.children[i].name === "Arrow" || cst.children[i].value === "=>") {
			arrowToken = SlimeTokenCreate_default$1.createArrowToken(cst.children[i].loc);
			arrowIndex = i;
			break;
		}
		if (arrowIndex === -1) {
			for (const child of cst.children) if (child.name === "CoverCallExpressionAndAsyncArrowHead") {
				params = this.createAsyncArrowParamsFromCover(child);
				break;
			} else if (child.name === "Async") continue;
			else if (child.name === "BindingIdentifier" || child.name === SlimeParser.prototype.BindingIdentifier?.name) {
				params = [this.createBindingIdentifierAst(child)];
				break;
			}
			return {
				type: SlimeNodeType$1.ArrowFunctionExpression,
				id: null,
				params,
				body: SlimeNodeCreate_default$1.createBlockStatement([]),
				generator: false,
				async: true,
				expression: false,
				loc: cst.loc
			};
		}
		for (let i = 0; i < arrowIndex; i++) {
			const child = cst.children[i];
			if (child.name === "Async" || child.name === "IdentifierName" && child.value === "async") {
				asyncToken = SlimeTokenCreate_default$1.createAsyncToken(child.loc);
				continue;
			}
			if (child.name === SlimeParser.prototype.BindingIdentifier?.name || child.name === "BindingIdentifier") params = [this.createBindingIdentifierAst(child)];
			else if (child.name === "AsyncArrowBindingIdentifier" || child.name === SlimeParser.prototype.AsyncArrowBindingIdentifier?.name) {
				const bindingId = child.children?.find((c) => c.name === "BindingIdentifier" || c.name === SlimeParser.prototype.BindingIdentifier?.name) || child.children?.[0];
				if (bindingId) params = [this.createBindingIdentifierAst(bindingId)];
			} else if (child.name === "CoverCallExpressionAndAsyncArrowHead") {
				params = this.createAsyncArrowParamsFromCover(child);
				for (const subChild of child.children || []) if (subChild.name === "Arguments" || subChild.name === SlimeParser.prototype.Arguments?.name) {
					for (const argChild of subChild.children || []) if (argChild.name === "LParen" || argChild.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(argChild.loc);
					else if (argChild.name === "RParen" || argChild.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(argChild.loc);
				}
			} else if (child.name === SlimeParser.prototype.ArrowFormalParameters?.name || child.name === "ArrowFormalParameters") {
				params = this.createArrowFormalParametersAst(child);
				for (const subChild of child.children || []) if (subChild.name === "LParen" || subChild.value === "(") lParenToken = SlimeTokenCreate_default$1.createLParenToken(subChild.loc);
				else if (subChild.name === "RParen" || subChild.value === ")") rParenToken = SlimeTokenCreate_default$1.createRParenToken(subChild.loc);
			}
		}
		const bodyIndex = arrowIndex + 1;
		if (bodyIndex < cst.children.length) {
			const bodyCst = cst.children[bodyIndex];
			if (bodyCst.name === "AsyncConciseBody" || bodyCst.name === "ConciseBody") body = this.createConciseBodyAst(bodyCst);
			else body = this.createExpressionAst(bodyCst);
		} else body = SlimeNodeCreate_default$1.createBlockStatement([]);
		return {
			type: SlimeNodeType$1.ArrowFunctionExpression,
			id: null,
			params,
			body,
			generator: false,
			async: true,
			expression: body.type !== SlimeNodeType$1.BlockStatement,
			arrowToken,
			asyncToken,
			lParenToken,
			rParenToken,
			loc: cst.loc
		};
	}
	/**
	* �?CoverCallExpressionAndAsyncArrowHead 提取 async 箭头函数参数
	*/
	createAsyncArrowParamsFromCover(cst) {
		const params = [];
		for (const child of cst.children || []) if (child.name === "Arguments" || child.name === SlimeParser.prototype.Arguments?.name) {
			for (const argChild of child.children || []) if (argChild.name === "ArgumentList" || argChild.name === SlimeParser.prototype.ArgumentList?.name) {
				let hasEllipsis = false;
				for (const arg of argChild.children || []) {
					if (arg.value === ",") continue;
					if (arg.name === "Ellipsis" || arg.value === "...") {
						hasEllipsis = true;
						continue;
					}
					const param = this.convertCoverParameterCstToPattern(arg, hasEllipsis);
					if (param) {
						params.push(param);
						hasEllipsis = false;
					}
				}
			}
		}
		return params;
	}
	/**
	* 将表达式 CST 转换�?Pattern（用�?cover grammar�?
	* 这用于处�?async (expr) => body 中的 expr �?pattern 的转�?
	*/
	/**
	* �?CST 表达式转换为 Pattern（用�?cover grammar�?
	* 这用于处�?async (expr) => body 中的 expr �?pattern 的转�?
	* 注意：这个方法处�?CST 节点，convertExpressionToPattern 处理 AST 节点
	*/
	convertCstToPattern(cst) {
		if (cst.name === "AssignmentExpression" || cst.name === SlimeParser.prototype.AssignmentExpression?.name) {
			if (cst.children?.some((ch) => ch.name === "Assign" || ch.value === "=") && cst.children && cst.children.length >= 3) {
				const expr$1 = this.createAssignmentExpressionAst(cst);
				if (expr$1.type === SlimeNodeType$1.AssignmentExpression) return this.convertAssignmentExpressionToPattern(expr$1);
			}
		}
		const findInnerExpr = (node$1) => {
			if (!node$1.children || node$1.children.length === 0) return node$1;
			const first = node$1.children[0];
			if (first.name === "ObjectLiteral" || first.name === "ArrayLiteral" || first.name === "IdentifierReference" || first.name === "Identifier" || first.name === "BindingIdentifier") return first;
			return findInnerExpr(first);
		};
		const inner = findInnerExpr(cst);
		if (inner.name === "ObjectLiteral") return this.convertObjectLiteralToPattern(inner);
		else if (inner.name === "ArrayLiteral") return this.convertArrayLiteralToPattern(inner);
		else if (inner.name === "IdentifierReference" || inner.name === "Identifier") {
			const identifierName = (inner.name === "IdentifierReference" ? findInnerExpr(inner) : inner).children?.[0];
			if (identifierName) return SlimeNodeCreate_default$1.createIdentifier(identifierName.value, identifierName.loc);
		} else if (inner.name === "BindingIdentifier") return this.createBindingIdentifierAst(inner);
		const expr = this.createExpressionAst(cst);
		if (expr.type === SlimeNodeType$1.Identifier) return expr;
		else if (expr.type === SlimeNodeType$1.ObjectExpression) return this.convertObjectExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType$1.ArrayExpression) return this.convertArrayExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType$1.AssignmentExpression) return this.convertAssignmentExpressionToPattern(expr);
		return null;
	}
	/**
	* Cover 语法下，将单个参数相关的 CST 节点转换�?Pattern
	* 仅在“参数位置”调用，用于 Arrow / AsyncArrow 等场�?
	*/
	convertCoverParameterCstToPattern(cst, hasEllipsis) {
		let basePattern = null;
		if (cst.name === SlimeParser.prototype.BindingIdentifier?.name || cst.name === "BindingIdentifier") basePattern = this.createBindingIdentifierAst(cst);
		else if (cst.name === SlimeParser.prototype.BindingPattern?.name || cst.name === "BindingPattern") basePattern = this.createBindingPatternAst(cst);
		else if (cst.name === SlimeParser.prototype.ArrayBindingPattern?.name || cst.name === "ArrayBindingPattern") basePattern = this.createArrayBindingPatternAst(cst);
		else if (cst.name === SlimeParser.prototype.ObjectBindingPattern?.name || cst.name === "ObjectBindingPattern") basePattern = this.createObjectBindingPatternAst(cst);
		if (!basePattern) basePattern = this.convertCstToPattern(cst);
		if (!basePattern) {
			const identifierCst = this.findFirstIdentifierInExpression(cst);
			if (identifierCst) basePattern = this.createIdentifierAst(identifierCst);
		}
		if (!basePattern) return null;
		if (hasEllipsis) return SlimeNodeCreate_default$1.createRestElement(basePattern);
		return basePattern;
	}
	/**
	* �?ObjectLiteral CST 转换�?ObjectPattern
	*/
	convertObjectLiteralToPattern(cst) {
		const properties = [];
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children || []) if (child.value === "{") lBraceToken = SlimeTokenCreate_default$1.createLBraceToken(child.loc);
		else if (child.value === "}") rBraceToken = SlimeTokenCreate_default$1.createRBraceToken(child.loc);
		else if (child.name === "PropertyDefinitionList") for (const prop of child.children || []) {
			if (prop.value === ",") {
				if (properties.length > 0 && !properties[properties.length - 1].commaToken) properties[properties.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(prop.loc);
				continue;
			}
			if (prop.name === "PropertyDefinition") {
				const ellipsis = prop.children?.find((c) => c.value === "..." || c.name === "Ellipsis");
				if (ellipsis) {
					const assignExpr = prop.children?.find((c) => c.name === "AssignmentExpression");
					if (assignExpr) {
						const idCst = this.findFirstIdentifierInExpression(assignExpr);
						if (idCst) {
							const restId = this.createIdentifierAst(idCst);
							const restNode = {
								type: SlimeNodeType$1.RestElement,
								argument: restId,
								ellipsisToken: SlimeTokenCreate_default$1.createEllipsisToken(ellipsis.loc),
								loc: prop.loc
							};
							properties.push({ property: restNode });
						}
					}
				} else {
					const patternProp = this.convertPropertyDefinitionToPatternProperty(prop);
					if (patternProp) properties.push({ property: patternProp });
				}
			}
		}
		return {
			type: SlimeNodeType$1.ObjectPattern,
			properties,
			lBraceToken,
			rBraceToken,
			loc: cst.loc
		};
	}
	/**
	* �?PropertyDefinition CST 转换�?Pattern 属�?
	*/
	convertPropertyDefinitionToPatternProperty(cst) {
		const first = cst.children?.[0];
		if (!first) return null;
		if (first.name === "IdentifierReference") {
			const idNode = first.children?.[0]?.children?.[0];
			if (idNode) {
				const id = SlimeNodeCreate_default$1.createIdentifier(idNode.value, idNode.loc);
				return {
					type: SlimeNodeType$1.Property,
					key: id,
					value: id,
					kind: "init",
					computed: false,
					shorthand: true,
					loc: cst.loc
				};
			}
		} else if (first.name === "CoverInitializedName") {
			const idRef = first.children?.find((c) => c.name === "IdentifierReference");
			const initializer = first.children?.find((c) => c.name === "Initializer");
			if (idRef) {
				const idNode = idRef.children?.[0]?.children?.[0];
				if (idNode) {
					const id = SlimeNodeCreate_default$1.createIdentifier(idNode.value, idNode.loc);
					let value = id;
					if (initializer) {
						const init = this.createInitializerAst(initializer);
						value = {
							type: SlimeNodeType$1.AssignmentPattern,
							left: id,
							right: init,
							loc: first.loc
						};
					}
					return {
						type: SlimeNodeType$1.Property,
						key: id,
						value,
						kind: "init",
						computed: false,
						shorthand: true,
						loc: cst.loc
					};
				}
			}
		} else if (first.name === "PropertyName") {
			const propName = first;
			const colonCst = cst.children?.find((c) => c.value === ":");
			const valueCst = cst.children?.[2];
			if (colonCst && valueCst) {
				const key = this.createPropertyNameAst(propName);
				const valueExpr = this.createExpressionAst(valueCst);
				const value = this.convertExpressionToPatternFromAST(valueExpr);
				return {
					type: SlimeNodeType$1.Property,
					key,
					value: value || valueExpr,
					kind: "init",
					computed: this.isComputedPropertyName(propName),
					shorthand: false,
					loc: cst.loc
				};
			}
		}
		return null;
	}
	/**
	* �?ObjectExpression AST 转换�?ObjectPattern
	*/
	convertObjectExpressionToPattern(expr) {
		const properties = [];
		for (const prop of expr.properties || []) {
			const property = prop.property || prop;
			if (property.type === SlimeNodeType$1.SpreadElement) properties.push({ property: {
				type: SlimeNodeType$1.RestElement,
				argument: property.argument,
				loc: property.loc
			} });
			else {
				const value = this.convertExpressionToPatternFromAST(property.value);
				properties.push({ property: {
					type: SlimeNodeType$1.Property,
					key: property.key,
					value: value || property.value,
					kind: "init",
					computed: property.computed,
					shorthand: property.shorthand,
					loc: property.loc
				} });
			}
		}
		return {
			type: SlimeNodeType$1.ObjectPattern,
			properties,
			lBraceToken: expr.lBraceToken,
			rBraceToken: expr.rBraceToken,
			loc: expr.loc
		};
	}
	/**
	* �?ArrayExpression AST 转换�?ArrayPattern
	*/
	convertArrayExpressionToPattern(expr) {
		const elements = [];
		for (const elem of expr.elements || []) if (elem === null || elem.element === null) elements.push({ element: null });
		else {
			const element = elem.element || elem;
			const pattern = this.convertExpressionToPatternFromAST(element);
			elements.push({
				element: pattern || element,
				commaToken: elem.commaToken
			});
		}
		return {
			type: SlimeNodeType$1.ArrayPattern,
			elements,
			lBracketToken: expr.lBracketToken,
			rBracketToken: expr.rBracketToken,
			loc: expr.loc
		};
	}
	/**
	* �?AssignmentExpression AST 转换�?AssignmentPattern
	*/
	convertAssignmentExpressionToPattern(expr) {
		const left = this.convertExpressionToPatternFromAST(expr.left);
		return {
			type: SlimeNodeType$1.AssignmentPattern,
			left: left || expr.left,
			right: expr.right,
			loc: expr.loc
		};
	}
	/**
	* 将表达式 AST 转换�?Pattern
	*/
	convertExpressionToPatternFromAST(expr) {
		if (!expr) return null;
		if (expr.type === SlimeNodeType$1.Identifier) return expr;
		else if (expr.type === SlimeNodeType$1.ObjectExpression) return this.convertObjectExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType$1.ArrayExpression) return this.convertArrayExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType$1.AssignmentExpression) return this.convertAssignmentExpressionToPattern(expr);
		return null;
	}
	/**
	* �?ArrayLiteral CST 转换�?ArrayPattern
	*/
	convertArrayLiteralToPattern(cst) {
		const elements = [];
		let lBracketToken = void 0;
		let rBracketToken = void 0;
		const processElision = (elisionNode) => {
			for (const elisionChild of elisionNode.children || []) if (elisionChild.value === ",") {
				if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(elisionChild.loc);
				elements.push({ element: null });
			}
		};
		for (const child of cst.children || []) if (child.value === "[") lBracketToken = SlimeTokenCreate_default$1.createLBracketToken(child.loc);
		else if (child.value === "]") rBracketToken = SlimeTokenCreate_default$1.createRBracketToken(child.loc);
		else if (child.name === "Elision") processElision(child);
		else if (child.name === "ElementList") {
			const elemChildren = child.children || [];
			for (let i = 0; i < elemChildren.length; i++) {
				const elem = elemChildren[i];
				if (elem.value === ",") {
					if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate_default$1.createCommaToken(elem.loc);
				} else if (elem.name === "Elision") processElision(elem);
				else if (elem.name === "AssignmentExpression") {
					const expr = this.createExpressionAst(elem);
					const pattern = this.convertExpressionToPatternFromAST(expr);
					elements.push({ element: pattern || expr });
				} else if (elem.name === "SpreadElement") {
					const restNode = this.createSpreadElementAst(elem);
					elements.push({ element: {
						type: SlimeNodeType$1.RestElement,
						argument: restNode.argument,
						loc: restNode.loc
					} });
				}
			}
		}
		return {
			type: SlimeNodeType$1.ArrayPattern,
			elements,
			lBracketToken,
			rBracketToken,
			loc: cst.loc
		};
	}
	/**
	* �?ArrowFormalParameters 提取参数
	*/
	createArrowFormalParametersAst(cst) {
		const params = [];
		for (const child of cst.children || []) {
			if (child.name === "UniqueFormalParameters" || child.name === SlimeParser.prototype.UniqueFormalParameters?.name) return this.createUniqueFormalParametersAst(child);
			if (child.name === "FormalParameters" || child.name === SlimeParser.prototype.FormalParameters?.name) return this.createFormalParametersAst(child);
		}
		return params;
	}
	/**
	* �?ArrowFormalParameters 提取参数 (包装类型版本)
	*/
	createArrowFormalParametersAstWrapped(cst) {
		for (const child of cst.children || []) {
			if (child.name === "UniqueFormalParameters" || child.name === SlimeParser.prototype.UniqueFormalParameters?.name) return this.createUniqueFormalParametersAstWrapped(child);
			if (child.name === "FormalParameters" || child.name === SlimeParser.prototype.FormalParameters?.name) return this.createFormalParametersAstWrapped(child);
		}
		return [];
	}
	/**
	* 从CoverParenthesizedExpressionAndArrowParameterList提取箭头函数参数
	*/
	createArrowParametersFromCoverGrammar(cst) {
		checkCstName$1(cst, SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name);
		if (cst.children.length === 0) return [];
		if (cst.children.length === 2) return [];
		const params = [];
		const formalParameterListCst = cst.children.find((child) => child.name === SlimeParser.prototype.FormalParameterList?.name);
		if (formalParameterListCst) return this.createFormalParameterListAst(formalParameterListCst);
		const expressionCst = cst.children.find((child) => child.name === SlimeParser.prototype.Expression?.name);
		if (expressionCst && expressionCst.children?.length) for (const child of expressionCst.children) {
			if (child.name === "Comma" || child.value === ",") continue;
			const param = this.convertCoverParameterCstToPattern(child, false);
			if (param) params.push(param);
		}
		if (cst.children.some((child) => child.name === "Ellipsis" || child.name === "Ellipsis")) {
			const bindingIdentifierCst = cst.children.find((child) => child.name === SlimeParser.prototype.BindingIdentifier?.name || child.name === "BindingIdentifier");
			const bindingPatternCst = bindingIdentifierCst ? null : cst.children.find((child) => child.name === SlimeParser.prototype.BindingPattern?.name || child.name === "BindingPattern" || child.name === SlimeParser.prototype.ArrayBindingPattern?.name || child.name === "ArrayBindingPattern" || child.name === SlimeParser.prototype.ObjectBindingPattern?.name || child.name === "ObjectBindingPattern");
			const restTarget = bindingIdentifierCst || bindingPatternCst;
			if (restTarget) {
				const restParam = this.convertCoverParameterCstToPattern(restTarget, true);
				if (restParam) params.push(restParam);
			}
		} else if (params.length === 0) {
			const bindingIdentifierCst = cst.children.find((child) => child.name === SlimeParser.prototype.BindingIdentifier?.name || child.name === "BindingIdentifier");
			if (bindingIdentifierCst) params.push(this.createBindingIdentifierAst(bindingIdentifierCst));
		}
		return params;
	}
	/**
	* 从Expression中提取箭头函数参�?
	* 处理逗号表达�?(a, b) 或单个参�?(x)
	*/
	extractParametersFromExpression(expressionCst) {
		if (expressionCst.name === SlimeParser.prototype.AssignmentExpression?.name) {
			const assignmentAst = this.createAssignmentExpressionAst(expressionCst);
			if (assignmentAst.type === SlimeNodeType$1.Identifier) return [assignmentAst];
			if (assignmentAst.type === SlimeNodeType$1.AssignmentExpression) return [{
				type: "AssignmentPattern",
				left: assignmentAst.left,
				right: assignmentAst.right
			}];
			return [assignmentAst];
		}
		if (expressionCst.children && expressionCst.children.length > 0) {
			const params = [];
			for (const child of expressionCst.children) if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
				const assignmentAst = this.createAssignmentExpressionAst(child);
				if (assignmentAst.type === SlimeNodeType$1.Identifier) params.push(assignmentAst);
				else if (assignmentAst.type === SlimeNodeType$1.AssignmentExpression) params.push({
					type: "AssignmentPattern",
					left: assignmentAst.left,
					right: assignmentAst.right
				});
				else if (assignmentAst.type === SlimeNodeType$1.ObjectExpression) params.push(this.convertExpressionToPattern(assignmentAst));
				else if (assignmentAst.type === SlimeNodeType$1.ArrayExpression) params.push(this.convertExpressionToPattern(assignmentAst));
				else {
					const identifier = this.findFirstIdentifierInExpression(child);
					if (identifier) params.push(this.createIdentifierAst(identifier));
				}
			}
			if (params.length > 0) return params;
		}
		const identifierCst = this.findFirstIdentifierInExpression(expressionCst);
		if (identifierCst) return [this.createIdentifierAst(identifierCst)];
		return [];
	}
	/**
	* 在Expression中查找第一个Identifier（辅助方法）
	*/
	findFirstIdentifierInExpression(cst) {
		if (cst.name === SlimeTokenConsumer.prototype.IdentifierName?.name) return cst;
		if (cst.children) for (const child of cst.children) {
			const found = this.findFirstIdentifierInExpression(child);
			if (found) return found;
		}
		return null;
	}
	/**
	* 将表达式转换为模式（用于箭头函数参数解构�?
	* ObjectExpression -> ObjectPattern
	* ArrayExpression -> ArrayPattern
	* Identifier -> Identifier
	* SpreadElement -> RestElement
	*/
	convertExpressionToPattern(expr) {
		if (!expr) return expr;
		if (expr.type === SlimeNodeType$1.Identifier) return expr;
		if (expr.type === SlimeNodeType$1.ObjectExpression) {
			const properties = [];
			for (const item of expr.properties || []) {
				const prop = item.property !== void 0 ? item.property : item;
				if (prop.type === SlimeNodeType$1.SpreadElement) properties.push({
					property: {
						type: SlimeNodeType$1.RestElement,
						argument: this.convertExpressionToPattern(prop.argument),
						loc: prop.loc
					},
					commaToken: item.commaToken
				});
				else if (prop.type === SlimeNodeType$1.Property) {
					const convertedValue = this.convertExpressionToPattern(prop.value);
					properties.push({
						property: {
							...prop,
							value: convertedValue
						},
						commaToken: item.commaToken
					});
				} else properties.push(item);
			}
			return {
				type: SlimeNodeType$1.ObjectPattern,
				properties,
				loc: expr.loc,
				lBraceToken: expr.lBraceToken,
				rBraceToken: expr.rBraceToken
			};
		}
		if (expr.type === SlimeNodeType$1.ArrayExpression) {
			const elements = [];
			for (const item of expr.elements || []) {
				const elem = item.element !== void 0 ? item.element : item;
				if (elem === null) elements.push(item);
				else if (elem.type === SlimeNodeType$1.SpreadElement) elements.push({
					element: {
						type: SlimeNodeType$1.RestElement,
						argument: this.convertExpressionToPattern(elem.argument),
						loc: elem.loc
					},
					commaToken: item.commaToken
				});
				else elements.push({
					element: this.convertExpressionToPattern(elem),
					commaToken: item.commaToken
				});
			}
			return {
				type: SlimeNodeType$1.ArrayPattern,
				elements,
				loc: expr.loc,
				lBracketToken: expr.lBracketToken,
				rBracketToken: expr.rBracketToken
			};
		}
		if (expr.type === SlimeNodeType$1.AssignmentExpression) return {
			type: SlimeNodeType$1.AssignmentPattern,
			left: this.convertExpressionToPattern(expr.left),
			right: expr.right,
			loc: expr.loc
		};
		if (expr.type === SlimeNodeType$1.SpreadElement) return {
			type: SlimeNodeType$1.RestElement,
			argument: this.convertExpressionToPattern(expr.argument),
			loc: expr.loc
		};
		return expr;
	}
	/**
	* 创建箭头函数参数 AST
	*/
	createArrowParametersAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ArrowParameters?.name);
		if (cst.children.length === 0) return [];
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.BindingIdentifier?.name) return [this.createBindingIdentifierAst(first)];
		if (first.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) return this.createArrowParametersFromCoverGrammar(first);
		if (first.name === SlimeTokenConsumer.prototype.LParen?.name) {
			const formalParameterListCst = cst.children.find((child) => child.name === SlimeParser.prototype.FormalParameterList?.name);
			if (formalParameterListCst) return this.createFormalParameterListAst(formalParameterListCst);
			return [];
		}
		return [];
	}
	/**
	* 创建箭头函数�?AST
	*/
	createConciseBodyAst(cst) {
		if (!cst) throw new Error("createConciseBodyAst: cst is null or undefined");
		if (![
			SlimeParser.prototype.ConciseBody?.name,
			"ConciseBody",
			"AsyncConciseBody"
		].includes(cst.name)) throw new Error(`createConciseBodyAst: 期望 ConciseBody �?AsyncConciseBody，实�?${cst.name}`);
		const first = cst.children[0];
		if (first.name === "LBrace") {
			const functionBodyCst = cst.children.find((child) => child.name === "FunctionBody" || child.name === SlimeParser.prototype.FunctionBody?.name || child.name === "AsyncFunctionBody" || child.name === SlimeParser.prototype.AsyncFunctionBody?.name);
			if (functionBodyCst) {
				const bodyStatements = this.createFunctionBodyAst(functionBodyCst);
				return SlimeNodeCreate_default$1.createBlockStatement(bodyStatements, cst.loc);
			}
			return SlimeNodeCreate_default$1.createBlockStatement([], cst.loc);
		}
		if (first.name === SlimeParser.prototype.AssignmentExpression?.name || first.name === "AssignmentExpression") return this.createAssignmentExpressionAst(first);
		if (first.name === "ExpressionBody") {
			const innerExpr = first.children[0];
			if (innerExpr) {
				if (innerExpr.name === "AssignmentExpression" || innerExpr.name === SlimeParser.prototype.AssignmentExpression?.name) return this.createAssignmentExpressionAst(innerExpr);
				return this.createExpressionAst(innerExpr);
			}
		}
		return this.createExpressionAst(first);
	}
	createConditionalExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.ConditionalExpression?.name);
		const firstChild = cst.children[0];
		let test = this.createExpressionAst(firstChild);
		let alternate;
		let consequent;
		let questionToken = void 0;
		let colonToken = void 0;
		if (cst.children.length === 1) return this.createExpressionAst(cst.children[0]);
		else {
			const questionCst = cst.children[1];
			const colonCst = cst.children[3];
			if (questionCst && (questionCst.name === "Question" || questionCst.value === "?")) questionToken = SlimeTokenCreate_default$1.createQuestionToken(questionCst.loc);
			if (colonCst && (colonCst.name === "Colon" || colonCst.value === ":")) colonToken = SlimeTokenCreate_default$1.createColonToken(colonCst.loc);
			consequent = this.createAssignmentExpressionAst(cst.children[2]);
			alternate = this.createAssignmentExpressionAst(cst.children[4]);
		}
		return SlimeNodeCreate_default$1.createConditionalExpression(test, consequent, alternate, cst.loc, questionToken, colonToken);
	}
	createYieldExpressionAst(cst) {
		let yieldToken = void 0;
		let asteriskToken = void 0;
		let delegate = false;
		let startIndex = 1;
		if (cst.children[0] && (cst.children[0].name === "Yield" || cst.children[0].value === "yield")) yieldToken = SlimeTokenCreate_default$1.createYieldToken(cst.children[0].loc);
		if (cst.children[1] && cst.children[1].name === SlimeTokenConsumer.prototype.Asterisk?.name) {
			asteriskToken = SlimeTokenCreate_default$1.createAsteriskToken(cst.children[1].loc);
			delegate = true;
			startIndex = 2;
		}
		let argument = null;
		if (cst.children[startIndex]) argument = this.createAssignmentExpressionAst(cst.children[startIndex]);
		return SlimeNodeCreate_default$1.createYieldExpression(argument, delegate, cst.loc, yieldToken, asteriskToken);
	}
	createAwaitExpressionAst(cst) {
		checkCstName$1(cst, SlimeParser.prototype.AwaitExpression?.name);
		let awaitToken = void 0;
		if (cst.children[0] && (cst.children[0].name === "Await" || cst.children[0].value === "await")) awaitToken = SlimeTokenCreate_default$1.createAwaitToken(cst.children[0].loc);
		const argumentCst = cst.children[1];
		const argument = this.createExpressionAst(argumentCst);
		return SlimeNodeCreate_default$1.createAwaitExpression(argument, cst.loc, awaitToken);
	}
	/**
	* 处理 ShortCircuitExpressionTail (|| �??? 运算符的尾部)
	* CST 结构：ShortCircuitExpressionTail -> LogicalORExpressionTail | CoalesceExpressionTail
	* LogicalORExpressionTail -> LogicalOr LogicalANDExpression LogicalORExpressionTail?
	*/
	createShortCircuitExpressionTailAst(left, tailCst) {
		const tailChildren = tailCst.children || [];
		if (tailCst.name === "ShortCircuitExpressionTail" && tailChildren.length > 0) {
			const innerTail = tailChildren[0];
			return this.createShortCircuitExpressionTailAst(left, innerTail);
		}
		if (tailCst.name === "LogicalORExpressionTail") {
			let result = left;
			for (let i = 0; i < tailChildren.length; i += 2) {
				const operator = tailChildren[i].value || "||";
				const rightCst = tailChildren[i + 1];
				if (!rightCst) break;
				const right = this.createExpressionAst(rightCst);
				result = {
					type: SlimeNodeType$1.LogicalExpression,
					operator,
					left: result,
					right,
					loc: tailCst.loc
				};
			}
			return result;
		}
		if (tailCst.name === "CoalesceExpressionTail") {
			let result = left;
			for (let i = 0; i < tailChildren.length; i += 2) {
				const operator = tailChildren[i].value || "??";
				const rightCst = tailChildren[i + 1];
				if (!rightCst) break;
				const right = this.createExpressionAst(rightCst);
				result = {
					type: SlimeNodeType$1.LogicalExpression,
					operator,
					left: result,
					right,
					loc: tailCst.loc
				};
			}
			return result;
		}
		console.warn("Unknown ShortCircuitExpressionTail type:", tailCst.name);
		return left;
	}
};
const SlimeCstToAstUtil = new SlimeCstToAst();

//#endregion
//#region ../../slime/packages/slime-ast/src/SlimeESTree.ts
/** Program source type */
const SlimeProgramSourceType = {
	Script: "script",
	Module: "module"
};

//#endregion
//#region ../../slime/packages/slime-ast/src/SlimeNodeType.ts
/**
* SlimeNodeType - AST 节点类型常量
*
* 与 ESTree 规范的 type 字符串完全一致
* 使用 as const 确保类型是字面量类型
*/
const SlimeNodeType = {
	Program: "Program",
	Identifier: "Identifier",
	PrivateIdentifier: "PrivateIdentifier",
	Literal: "Literal",
	NullLiteral: "NullLiteral",
	StringLiteral: "StringLiteral",
	NumericLiteral: "NumericLiteral",
	BooleanLiteral: "BooleanLiteral",
	ExpressionStatement: "ExpressionStatement",
	BlockStatement: "BlockStatement",
	StaticBlock: "StaticBlock",
	EmptyStatement: "EmptyStatement",
	DebuggerStatement: "DebuggerStatement",
	ReturnStatement: "ReturnStatement",
	BreakStatement: "BreakStatement",
	ContinueStatement: "ContinueStatement",
	LabeledStatement: "LabeledStatement",
	WithStatement: "WithStatement",
	IfStatement: "IfStatement",
	SwitchStatement: "SwitchStatement",
	SwitchCase: "SwitchCase",
	ThrowStatement: "ThrowStatement",
	TryStatement: "TryStatement",
	CatchClause: "CatchClause",
	WhileStatement: "WhileStatement",
	DoWhileStatement: "DoWhileStatement",
	ForStatement: "ForStatement",
	ForInStatement: "ForInStatement",
	ForOfStatement: "ForOfStatement",
	FunctionDeclaration: "FunctionDeclaration",
	VariableDeclaration: "VariableDeclaration",
	VariableDeclarator: "VariableDeclarator",
	ClassDeclaration: "ClassDeclaration",
	ThisExpression: "ThisExpression",
	ArrayExpression: "ArrayExpression",
	ObjectExpression: "ObjectExpression",
	Property: "Property",
	FunctionExpression: "FunctionExpression",
	ArrowFunctionExpression: "ArrowFunctionExpression",
	ClassExpression: "ClassExpression",
	UnaryExpression: "UnaryExpression",
	UpdateExpression: "UpdateExpression",
	BinaryExpression: "BinaryExpression",
	AssignmentExpression: "AssignmentExpression",
	LogicalExpression: "LogicalExpression",
	MemberExpression: "MemberExpression",
	ConditionalExpression: "ConditionalExpression",
	CallExpression: "CallExpression",
	NewExpression: "NewExpression",
	SequenceExpression: "SequenceExpression",
	TemplateLiteral: "TemplateLiteral",
	TaggedTemplateExpression: "TaggedTemplateExpression",
	TemplateElement: "TemplateElement",
	SpreadElement: "SpreadElement",
	YieldExpression: "YieldExpression",
	AwaitExpression: "AwaitExpression",
	ImportExpression: "ImportExpression",
	ChainExpression: "ChainExpression",
	MetaProperty: "MetaProperty",
	Super: "Super",
	ParenthesizedExpression: "ParenthesizedExpression",
	OptionalCallExpression: "OptionalCallExpression",
	OptionalMemberExpression: "OptionalMemberExpression",
	ObjectPattern: "ObjectPattern",
	ArrayPattern: "ArrayPattern",
	RestElement: "RestElement",
	AssignmentPattern: "AssignmentPattern",
	ClassBody: "ClassBody",
	MethodDefinition: "MethodDefinition",
	PropertyDefinition: "PropertyDefinition",
	ImportDeclaration: "ImportDeclaration",
	ImportSpecifier: "ImportSpecifier",
	ImportDefaultSpecifier: "ImportDefaultSpecifier",
	ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
	ExportNamedDeclaration: "ExportNamedDeclaration",
	ExportSpecifier: "ExportSpecifier",
	ExportDefaultDeclaration: "ExportDefaultDeclaration",
	ExportAllDeclaration: "ExportAllDeclaration"
};

//#endregion
//#region ../../slime/packages/slime-ast/src/SlimeNodeCreate.ts
/**
* SlimeNodeCreate.ts - AST 节点创建工厂
*
* 为每个 AST 节点类型提供创建方法
* Token 创建方法请使用 SlimeTokenCreate.ts
* 与 SlimeESTree.ts 中的 AST 类型一一对应
*/
var SlimeNodeCreate = class {
	commonLocType(node$1) {
		if (!node$1.loc) node$1.loc = {
			value: null,
			type: node$1.type,
			start: {
				index: 0,
				line: 0,
				column: 0
			},
			end: {
				index: 0,
				line: 0,
				column: 0
			}
		};
		return node$1;
	}
	createProgram(body, sourceType = SlimeProgramSourceType.Script) {
		return this.commonLocType({
			type: SlimeNodeType.Program,
			sourceType,
			body
		});
	}
	createMemberExpression(object, dot, property) {
		return this.commonLocType({
			type: SlimeNodeType.MemberExpression,
			object,
			dot,
			property,
			computed: false,
			optional: false,
			loc: object.loc
		});
	}
	createArrayExpression(elements, loc, lBracketToken, rBracketToken) {
		return this.commonLocType({
			type: SlimeNodeType.ArrayExpression,
			elements: elements || [],
			lBracketToken,
			rBracketToken,
			loc
		});
	}
	/** 创建数组元素包装 */
	createArrayElement(element, commaToken) {
		return {
			element,
			commaToken
		};
	}
	createPropertyAst(key, value) {
		return this.commonLocType({
			type: SlimeNodeType.Property,
			key,
			value,
			kind: "init",
			method: false,
			shorthand: false,
			computed: false
		});
	}
	createObjectExpression(properties = [], loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.ObjectExpression,
			properties,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	/** 创建对象属性包装 */
	createObjectPropertyItem(property, commaToken) {
		return {
			property,
			commaToken
		};
	}
	createParenthesizedExpression(expression, loc) {
		return this.commonLocType({
			type: SlimeNodeType.ParenthesizedExpression,
			expression,
			loc
		});
	}
	createClassExpression(id, superClass, body, loc) {
		return this.commonLocType({
			type: SlimeNodeType.ClassExpression,
			id,
			body,
			superClass,
			loc
		});
	}
	createCallExpression(callee, args, loc, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.CallExpression,
			callee,
			arguments: args,
			optional: false,
			lParenToken,
			rParenToken,
			loc
		});
	}
	/** 创建调用参数包装 */
	createCallArgument(argument, commaToken) {
		return {
			argument,
			commaToken
		};
	}
	/** 创建函数参数包装 */
	createFunctionParam(param, commaToken) {
		return {
			param,
			commaToken
		};
	}
	createThisExpression(loc) {
		return this.commonLocType({
			type: SlimeNodeType.ThisExpression,
			loc
		});
	}
	createChainExpression(expression, loc) {
		return this.commonLocType({
			type: SlimeNodeType.ChainExpression,
			expression,
			loc
		});
	}
	createSequenceExpression(expressions, loc) {
		return this.commonLocType({
			type: SlimeNodeType.SequenceExpression,
			expressions,
			loc
		});
	}
	createUnaryExpression(operator, argument, loc) {
		return this.commonLocType({
			type: SlimeNodeType.UnaryExpression,
			operator,
			prefix: true,
			argument,
			loc
		});
	}
	createBinaryExpression(operator, left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType.BinaryExpression,
			operator,
			left,
			right,
			loc
		});
	}
	createAssignmentExpression(operator, left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType.AssignmentExpression,
			operator,
			left,
			right,
			loc
		});
	}
	createUpdateExpression(operator, argument, prefix, loc) {
		return this.commonLocType({
			type: SlimeNodeType.UpdateExpression,
			operator,
			argument,
			prefix,
			loc
		});
	}
	createLogicalExpression(operator, left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType.LogicalExpression,
			operator,
			left,
			right,
			loc
		});
	}
	createConditionalExpression(test, consequent, alternate, loc, questionToken, colonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ConditionalExpression,
			test,
			consequent,
			alternate,
			questionToken,
			colonToken,
			loc
		});
	}
	createNewExpression(callee, args, loc, newToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.NewExpression,
			callee,
			arguments: args,
			newToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createArrowFunctionExpression(body, params, expression, async = false, loc, arrowToken, asyncToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.ArrowFunctionExpression,
			body,
			params,
			expression,
			async,
			arrowToken,
			asyncToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createYieldExpression(argument, delegate = false, loc, yieldToken, asteriskToken) {
		return this.commonLocType({
			type: SlimeNodeType.YieldExpression,
			argument,
			delegate,
			yieldToken,
			asteriskToken,
			loc
		});
	}
	createTaggedTemplateExpression(tag, quasi, loc) {
		return this.commonLocType({
			type: SlimeNodeType.TaggedTemplateExpression,
			tag,
			quasi,
			loc
		});
	}
	createAwaitExpression(argument, loc, awaitToken) {
		return this.commonLocType({
			type: SlimeNodeType.AwaitExpression,
			argument,
			awaitToken,
			loc
		});
	}
	createMetaProperty(meta, property, loc) {
		return this.commonLocType({
			type: SlimeNodeType.MetaProperty,
			meta,
			property,
			loc
		});
	}
	createImportExpression(source, loc, importToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.ImportExpression,
			source,
			importToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createSuper(loc) {
		return this.commonLocType({
			type: SlimeNodeType.Super,
			loc
		});
	}
	createPrivateIdentifier(name, loc) {
		return this.commonLocType({
			type: SlimeNodeType.PrivateIdentifier,
			name,
			loc
		});
	}
	createBlockStatement(body, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.BlockStatement,
			body,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createEmptyStatement(loc, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.EmptyStatement,
			semicolonToken,
			loc
		});
	}
	createExpressionStatement(expression, loc, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ExpressionStatement,
			expression,
			semicolonToken,
			loc
		});
	}
	createIfStatement(test, consequent, alternate, loc, ifToken, elseToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.IfStatement,
			test,
			consequent,
			alternate,
			ifToken,
			elseToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createLabeledStatement(label, body, loc) {
		return this.commonLocType({
			type: SlimeNodeType.LabeledStatement,
			label,
			body,
			loc
		});
	}
	createBreakStatement(label, loc, breakToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.BreakStatement,
			label,
			breakToken,
			semicolonToken,
			loc
		});
	}
	createContinueStatement(label, loc, continueToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ContinueStatement,
			label,
			continueToken,
			semicolonToken,
			loc
		});
	}
	createWithStatement(object, body, loc, withToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.WithStatement,
			object,
			body,
			withToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createSwitchStatement(discriminant, cases, loc, switchToken, lParenToken, rParenToken, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.SwitchStatement,
			discriminant,
			cases,
			switchToken,
			lParenToken,
			rParenToken,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createReturnStatement(argument, loc, returnToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ReturnStatement,
			argument,
			returnToken,
			semicolonToken,
			loc
		});
	}
	createThrowStatement(argument, loc, throwToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ThrowStatement,
			argument,
			throwToken,
			semicolonToken,
			loc
		});
	}
	createTryStatement(block, handler, finalizer, loc, tryToken, finallyToken) {
		return this.commonLocType({
			type: SlimeNodeType.TryStatement,
			block,
			handler,
			finalizer,
			tryToken,
			finallyToken,
			loc
		});
	}
	createWhileStatement(test, body, loc, whileToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.WhileStatement,
			test,
			body,
			whileToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createDoWhileStatement(body, test, loc, doToken, whileToken, lParenToken, rParenToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.DoWhileStatement,
			body,
			test,
			doToken,
			whileToken,
			lParenToken,
			rParenToken,
			semicolonToken,
			loc
		});
	}
	createForStatement(body, init, test, update, loc, forToken, lParenToken, rParenToken, semicolon1Token, semicolon2Token) {
		return this.commonLocType({
			type: SlimeNodeType.ForStatement,
			init,
			test,
			update,
			body,
			forToken,
			lParenToken,
			rParenToken,
			semicolon1Token,
			semicolon2Token,
			loc
		});
	}
	createForInStatement(left, right, body, loc, forToken, inToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.ForInStatement,
			left,
			right,
			body,
			forToken,
			inToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createForOfStatement(left, right, body, isAwait = false, loc, forToken, ofToken, awaitToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.ForOfStatement,
			left,
			right,
			body,
			await: isAwait,
			forToken,
			ofToken,
			awaitToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createDebuggerStatement(loc, debuggerToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.DebuggerStatement,
			debuggerToken,
			semicolonToken,
			loc
		});
	}
	createSwitchCase(consequent, test, loc, caseToken, defaultToken, colonToken) {
		return this.commonLocType({
			type: SlimeNodeType.SwitchCase,
			test,
			consequent,
			caseToken,
			defaultToken,
			colonToken,
			loc
		});
	}
	createCatchClause(body, param, loc, catchToken, lParenToken, rParenToken) {
		return this.commonLocType({
			type: SlimeNodeType.CatchClause,
			param,
			body,
			catchToken,
			lParenToken,
			rParenToken,
			loc
		});
	}
	createStaticBlock(body, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.StaticBlock,
			body,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createFunctionExpression(body, id, params, generator, async, loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.FunctionExpression,
			params: params || [],
			id,
			body,
			generator: generator || false,
			async: async || false,
			functionToken,
			asyncToken,
			asteriskToken,
			lParenToken,
			rParenToken,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createVariableDeclaration(kind, declarations, loc) {
		return this.commonLocType({
			type: SlimeNodeType.VariableDeclaration,
			declarations,
			kind,
			loc
		});
	}
	createVariableDeclarator(id, assignToken, init, loc) {
		return this.commonLocType({
			type: SlimeNodeType.VariableDeclarator,
			id,
			assignToken,
			init,
			loc
		});
	}
	createRestElement(argument, loc, ellipsisToken) {
		return this.commonLocType({
			type: SlimeNodeType.RestElement,
			argument,
			ellipsisToken,
			loc
		});
	}
	createSpreadElement(argument, loc, ellipsisToken) {
		return this.commonLocType({
			type: SlimeNodeType.SpreadElement,
			argument,
			ellipsisToken,
			loc
		});
	}
	createObjectPattern(properties, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.ObjectPattern,
			properties,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	/** 创建解构对象属性包装 */
	createObjectPatternProperty(property, commaToken) {
		return {
			property,
			commaToken
		};
	}
	createArrayPattern(elements, loc, lBracketToken, rBracketToken) {
		return this.commonLocType({
			type: SlimeNodeType.ArrayPattern,
			elements,
			lBracketToken,
			rBracketToken,
			loc
		});
	}
	/** 创建解构数组元素包装 */
	createArrayPatternElement(element, commaToken) {
		return {
			element,
			commaToken
		};
	}
	createAssignmentPattern(left, right, loc) {
		return this.commonLocType({
			type: SlimeNodeType.AssignmentPattern,
			left,
			right,
			loc
		});
	}
	createAssignmentProperty(key, value, shorthand = false, computed = false, loc, colonToken, lBracketToken, rBracketToken) {
		return this.commonLocType({
			type: SlimeNodeType.Property,
			key,
			value,
			kind: "init",
			method: false,
			shorthand,
			computed,
			colonToken,
			lBracketToken,
			rBracketToken,
			loc
		});
	}
	createImportDeclaration(specifiers, source, loc, importToken, fromToken, lBraceToken, rBraceToken, semicolonToken, attributes, withToken) {
		const decl = {
			type: SlimeNodeType.ImportDeclaration,
			source,
			specifiers,
			importToken,
			fromToken,
			lBraceToken,
			rBraceToken,
			semicolonToken,
			loc
		};
		if (withToken) {
			decl.attributes = attributes || [];
			decl.withToken = withToken;
		}
		return this.commonLocType(decl);
	}
	/** 创建 import specifier 包装 */
	createImportSpecifierItem(specifier, commaToken) {
		return {
			specifier,
			commaToken
		};
	}
	createImportSpecifier(local, imported, loc, asToken) {
		return this.commonLocType({
			type: SlimeNodeType.ImportSpecifier,
			local,
			imported,
			asToken,
			loc
		});
	}
	createImportDefaultSpecifier(local, loc) {
		return this.commonLocType({
			type: SlimeNodeType.ImportDefaultSpecifier,
			local,
			loc
		});
	}
	createImportNamespaceSpecifier(local, loc, asteriskToken, asToken) {
		return this.commonLocType({
			type: SlimeNodeType.ImportNamespaceSpecifier,
			local,
			asteriskToken,
			asToken,
			loc
		});
	}
	createExportDefaultDeclaration(declaration, loc, exportToken, defaultToken) {
		return this.commonLocType({
			type: SlimeNodeType.ExportDefaultDeclaration,
			declaration,
			exportToken,
			defaultToken,
			loc
		});
	}
	createExportNamedDeclaration(declaration, specifiers, source, loc, exportToken, fromToken, lBraceToken, rBraceToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ExportNamedDeclaration,
			declaration,
			specifiers,
			source,
			exportToken,
			fromToken,
			lBraceToken,
			rBraceToken,
			semicolonToken,
			loc
		});
	}
	/** 创建 export specifier 包装 */
	createExportSpecifierItem(specifier, commaToken) {
		return {
			specifier,
			commaToken
		};
	}
	createExportSpecifier(local, exported, loc, asToken) {
		return this.commonLocType({
			type: SlimeNodeType.ExportSpecifier,
			local,
			exported,
			asToken,
			loc
		});
	}
	createExportAllDeclaration(source, exported, loc, exportToken, asteriskToken, asToken, fromToken, semicolonToken) {
		return this.commonLocType({
			type: SlimeNodeType.ExportAllDeclaration,
			source,
			exported,
			exportToken,
			asteriskToken,
			asToken,
			fromToken,
			semicolonToken,
			loc
		});
	}
	createDirective(expression, directive, loc) {
		return this.commonLocType({
			type: SlimeNodeType.ExpressionStatement,
			expression,
			directive,
			loc
		});
	}
	createClassDeclaration(id, body, superClass, loc, classToken, extendsToken) {
		return this.commonLocType({
			type: SlimeNodeType.ClassDeclaration,
			id,
			body,
			superClass,
			classToken,
			extendsToken,
			loc
		});
	}
	createClassBody(body, loc, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.ClassBody,
			body,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createFunctionDeclaration(id, params, body, generator = false, async = false, loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken) {
		return this.commonLocType({
			type: SlimeNodeType.FunctionDeclaration,
			id,
			params,
			body,
			generator,
			async,
			functionToken,
			asyncToken,
			asteriskToken,
			lParenToken,
			rParenToken,
			lBraceToken,
			rBraceToken,
			loc
		});
	}
	createIdentifier(name, loc) {
		return this.commonLocType({
			type: SlimeNodeType.Identifier,
			name,
			loc
		});
	}
	createLiteral(value) {
		let ast;
		if (value === void 0) {} else if (typeof value === "string") ast = this.createStringLiteral(value);
		else if (typeof value === "number") ast = this.createNumericLiteral(value);
		return ast;
	}
	createNullLiteralToken() {
		return this.commonLocType({
			type: SlimeNodeType.Literal,
			value: null
		});
	}
	createStringLiteral(value, loc, raw) {
		const hasQuotes = /^['"].*['"]$/.test(value);
		const cleanValue = value.replace(/^['"]|['"]$/g, "");
		return this.commonLocType({
			type: SlimeNodeType.Literal,
			value: cleanValue,
			raw: raw || (hasQuotes ? value : `'${value}'`),
			loc
		});
	}
	createNumericLiteral(value, raw) {
		return this.commonLocType({
			type: SlimeNodeType.Literal,
			value,
			raw: raw || String(value)
		});
	}
	createBooleanLiteral(value, loc) {
		return this.commonLocType({
			type: SlimeNodeType.Literal,
			value,
			loc
		});
	}
	createRegExpLiteral(pattern, flags, raw, loc) {
		return this.commonLocType({
			type: SlimeNodeType.Literal,
			regex: {
				pattern,
				flags
			},
			raw: raw || `/${pattern}/${flags}`,
			loc
		});
	}
	createBigIntLiteral(bigint, raw, loc) {
		return this.commonLocType({
			type: SlimeNodeType.Literal,
			bigint,
			raw: raw || `${bigint}n`,
			loc
		});
	}
	createTemplateLiteral(quasis, expressions, loc) {
		return this.commonLocType({
			type: SlimeNodeType.TemplateLiteral,
			quasis,
			expressions,
			loc
		});
	}
	createTemplateElement(tail, raw, cooked, loc) {
		return this.commonLocType({
			type: SlimeNodeType.TemplateElement,
			tail,
			value: {
				raw,
				cooked: cooked !== void 0 ? cooked : raw
			},
			loc
		});
	}
	createMethodDefinition(key, value, kind = "method", computed = false, isStatic = false, loc, staticToken, getToken, setToken, asyncToken, asteriskToken) {
		return this.commonLocType({
			type: SlimeNodeType.MethodDefinition,
			key,
			value,
			kind,
			computed,
			static: isStatic,
			staticToken,
			getToken,
			setToken,
			asyncToken,
			asteriskToken,
			loc
		});
	}
	createPropertyDefinition(key, value, computed = false, isStatic = false, loc) {
		return this.commonLocType({
			type: SlimeNodeType.PropertyDefinition,
			key,
			value: value ?? null,
			computed,
			static: isStatic,
			loc
		});
	}
};
const SlimeAstCreateUtil = new SlimeNodeCreate();
var SlimeNodeCreate_default = SlimeAstCreateUtil;

//#endregion
//#region ../../slime/packages/slime-ast/src/SlimeTokenCreate.ts
var SlimeTokenFactory = class {
	createVarToken(loc) {
		return {
			type: SlimeTokenType.Var,
			value: "var",
			loc
		};
	}
	createLetToken(loc) {
		return {
			type: SlimeTokenType.Let,
			value: "let",
			loc
		};
	}
	createConstToken(loc) {
		return {
			type: SlimeTokenType.Const,
			value: "const",
			loc
		};
	}
	createAssignToken(loc) {
		return {
			type: SlimeTokenType.Assign,
			value: "=",
			loc
		};
	}
	createLParenToken(loc) {
		return {
			type: SlimeTokenType.LParen,
			value: "(",
			loc
		};
	}
	createRParenToken(loc) {
		return {
			type: SlimeTokenType.RParen,
			value: ")",
			loc
		};
	}
	createLBraceToken(loc) {
		return {
			type: SlimeTokenType.LBrace,
			value: "{",
			loc
		};
	}
	createRBraceToken(loc) {
		return {
			type: SlimeTokenType.RBrace,
			value: "}",
			loc
		};
	}
	createLBracketToken(loc) {
		return {
			type: SlimeTokenType.LBracket,
			value: "[",
			loc
		};
	}
	createRBracketToken(loc) {
		return {
			type: SlimeTokenType.RBracket,
			value: "]",
			loc
		};
	}
	createSemicolonToken(loc) {
		return {
			type: SlimeTokenType.Semicolon,
			value: ";",
			loc
		};
	}
	createCommaToken(loc) {
		return {
			type: SlimeTokenType.Comma,
			value: ",",
			loc
		};
	}
	createDotToken(loc) {
		return {
			type: SlimeTokenType.Dot,
			value: ".",
			loc
		};
	}
	createSpreadToken(loc) {
		return {
			type: SlimeTokenType.Ellipsis,
			value: "...",
			loc
		};
	}
	createArrowToken(loc) {
		return {
			type: SlimeTokenType.Arrow,
			value: "=>",
			loc
		};
	}
	createQuestionToken(loc) {
		return {
			type: SlimeTokenType.Question,
			value: "?",
			loc
		};
	}
	createColonToken(loc) {
		return {
			type: SlimeTokenType.Colon,
			value: ":",
			loc
		};
	}
	createEllipsisToken(loc) {
		return {
			type: SlimeTokenType.Ellipsis,
			value: "...",
			loc
		};
	}
	createOptionalChainingToken(loc) {
		return {
			type: SlimeTokenType.OptionalChaining,
			value: "?.",
			loc
		};
	}
	createAsteriskToken(loc) {
		return {
			type: SlimeTokenType.Asterisk,
			value: "*",
			loc
		};
	}
	createFunctionToken(loc) {
		return {
			type: SlimeTokenType.Function,
			value: "function",
			loc
		};
	}
	createAsyncToken(loc) {
		return {
			type: SlimeTokenType.Async,
			value: "async",
			loc
		};
	}
	createClassToken(loc) {
		return {
			type: SlimeTokenType.Class,
			value: "class",
			loc
		};
	}
	createExtendsToken(loc) {
		return {
			type: SlimeTokenType.Extends,
			value: "extends",
			loc
		};
	}
	createStaticToken(loc) {
		return {
			type: SlimeTokenType.Static,
			value: "static",
			loc
		};
	}
	createGetToken(loc) {
		return {
			type: SlimeTokenType.Get,
			value: "get",
			loc
		};
	}
	createSetToken(loc) {
		return {
			type: SlimeTokenType.Set,
			value: "set",
			loc
		};
	}
	createIfToken(loc) {
		return {
			type: SlimeTokenType.If,
			value: "if",
			loc
		};
	}
	createElseToken(loc) {
		return {
			type: SlimeTokenType.Else,
			value: "else",
			loc
		};
	}
	createSwitchToken(loc) {
		return {
			type: SlimeTokenType.Switch,
			value: "switch",
			loc
		};
	}
	createCaseToken(loc) {
		return {
			type: SlimeTokenType.Case,
			value: "case",
			loc
		};
	}
	createDefaultToken(loc) {
		return {
			type: SlimeTokenType.Default,
			value: "default",
			loc
		};
	}
	createForToken(loc) {
		return {
			type: SlimeTokenType.For,
			value: "for",
			loc
		};
	}
	createWhileToken(loc) {
		return {
			type: SlimeTokenType.While,
			value: "while",
			loc
		};
	}
	createDoToken(loc) {
		return {
			type: SlimeTokenType.Do,
			value: "do",
			loc
		};
	}
	createOfToken(loc) {
		return {
			type: SlimeTokenType.Of,
			value: "of",
			loc
		};
	}
	createBreakToken(loc) {
		return {
			type: SlimeTokenType.Break,
			value: "break",
			loc
		};
	}
	createContinueToken(loc) {
		return {
			type: SlimeTokenType.Continue,
			value: "continue",
			loc
		};
	}
	createReturnToken(loc) {
		return {
			type: SlimeTokenType.Return,
			value: "return",
			loc
		};
	}
	createThrowToken(loc) {
		return {
			type: SlimeTokenType.Throw,
			value: "throw",
			loc
		};
	}
	createTryToken(loc) {
		return {
			type: SlimeTokenType.Try,
			value: "try",
			loc
		};
	}
	createCatchToken(loc) {
		return {
			type: SlimeTokenType.Catch,
			value: "catch",
			loc
		};
	}
	createFinallyToken(loc) {
		return {
			type: SlimeTokenType.Finally,
			value: "finally",
			loc
		};
	}
	createWithToken(loc) {
		return {
			type: SlimeTokenType.With,
			value: "with",
			loc
		};
	}
	createDebuggerToken(loc) {
		return {
			type: SlimeTokenType.Debugger,
			value: "debugger",
			loc
		};
	}
	createNewToken(loc) {
		return {
			type: SlimeTokenType.New,
			value: "new",
			loc
		};
	}
	createYieldToken(loc) {
		return {
			type: SlimeTokenType.Yield,
			value: "yield",
			loc
		};
	}
	createAwaitToken(loc) {
		return {
			type: SlimeTokenType.Await,
			value: "await",
			loc
		};
	}
	createTypeofToken(loc) {
		return {
			type: SlimeTokenType.Typeof,
			value: "typeof",
			loc
		};
	}
	createVoidToken(loc) {
		return {
			type: SlimeTokenType.Void,
			value: "void",
			loc
		};
	}
	createDeleteToken(loc) {
		return {
			type: SlimeTokenType.Delete,
			value: "delete",
			loc
		};
	}
	createInstanceofToken(loc) {
		return {
			type: SlimeTokenType.Instanceof,
			value: "instanceof",
			loc
		};
	}
	createImportToken(loc) {
		return {
			type: SlimeTokenType.Import,
			value: "import",
			loc
		};
	}
	createExportToken(loc) {
		return {
			type: SlimeTokenType.Export,
			value: "export",
			loc
		};
	}
	createFromToken(loc) {
		return {
			type: SlimeTokenType.From,
			value: "from",
			loc
		};
	}
	createAsToken(loc) {
		return {
			type: SlimeTokenType.As,
			value: "as",
			loc
		};
	}
	createInToken(loc) {
		return {
			type: SlimeTokenType.In,
			value: "in",
			loc
		};
	}
	/**
	* 创建二元运算符 Token
	* 支持: == != === !== < <= > >= << >> >>> + - * / % ** | ^ & in instanceof
	*/
	createBinaryOperatorToken(operator, loc) {
		return {
			type: {
				"==": SlimeBinaryOperatorTokenTypes.Equal,
				"!=": SlimeBinaryOperatorTokenTypes.NotEqual,
				"===": SlimeBinaryOperatorTokenTypes.StrictEqual,
				"!==": SlimeBinaryOperatorTokenTypes.StrictNotEqual,
				"<": SlimeBinaryOperatorTokenTypes.Less,
				"<=": SlimeBinaryOperatorTokenTypes.LessEqual,
				">": SlimeBinaryOperatorTokenTypes.Greater,
				">=": SlimeBinaryOperatorTokenTypes.GreaterEqual,
				"<<": SlimeBinaryOperatorTokenTypes.LeftShift,
				">>": SlimeBinaryOperatorTokenTypes.RightShift,
				">>>": SlimeBinaryOperatorTokenTypes.UnsignedRightShift,
				"+": SlimeBinaryOperatorTokenTypes.Plus,
				"-": SlimeBinaryOperatorTokenTypes.Minus,
				"*": SlimeBinaryOperatorTokenTypes.Asterisk,
				"/": SlimeBinaryOperatorTokenTypes.Slash,
				"%": SlimeBinaryOperatorTokenTypes.Modulo,
				"**": SlimeBinaryOperatorTokenTypes.Exponentiation,
				"|": SlimeBinaryOperatorTokenTypes.BitwiseOr,
				"^": SlimeBinaryOperatorTokenTypes.BitwiseXor,
				"&": SlimeBinaryOperatorTokenTypes.BitwiseAnd,
				"in": SlimeBinaryOperatorTokenTypes.In,
				"instanceof": SlimeBinaryOperatorTokenTypes.Instanceof
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建一元运算符 Token
	* 支持: - + ! ~ typeof void delete
	*/
	createUnaryOperatorToken(operator, loc) {
		return {
			type: {
				"-": SlimeUnaryOperatorTokenTypes.Minus,
				"+": SlimeUnaryOperatorTokenTypes.Plus,
				"!": SlimeUnaryOperatorTokenTypes.LogicalNot,
				"~": SlimeUnaryOperatorTokenTypes.BitwiseNot,
				"typeof": SlimeUnaryOperatorTokenTypes.Typeof,
				"void": SlimeUnaryOperatorTokenTypes.Void,
				"delete": SlimeUnaryOperatorTokenTypes.Delete
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建逻辑运算符 Token
	* 支持: || && ??
	*/
	createLogicalOperatorToken(operator, loc) {
		return {
			type: {
				"||": SlimeLogicalOperatorTokenTypes.LogicalOr,
				"&&": SlimeLogicalOperatorTokenTypes.LogicalAnd,
				"??": SlimeLogicalOperatorTokenTypes.NullishCoalescing
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建赋值运算符 Token
	* 支持: = += -= *= /= %= **= <<= >>= >>>= |= ^= &= ||= &&= ??=
	*/
	createAssignmentOperatorToken(operator, loc) {
		return {
			type: {
				"=": SlimeAssignmentOperatorTokenTypes.Assign,
				"+=": SlimeAssignmentOperatorTokenTypes.PlusAssign,
				"-=": SlimeAssignmentOperatorTokenTypes.MinusAssign,
				"*=": SlimeAssignmentOperatorTokenTypes.MultiplyAssign,
				"/=": SlimeAssignmentOperatorTokenTypes.DivideAssign,
				"%=": SlimeAssignmentOperatorTokenTypes.ModuloAssign,
				"**=": SlimeAssignmentOperatorTokenTypes.ExponentiationAssign,
				"<<=": SlimeAssignmentOperatorTokenTypes.LeftShiftAssign,
				">>=": SlimeAssignmentOperatorTokenTypes.RightShiftAssign,
				">>>=": SlimeAssignmentOperatorTokenTypes.UnsignedRightShiftAssign,
				"|=": SlimeAssignmentOperatorTokenTypes.BitwiseOrAssign,
				"^=": SlimeAssignmentOperatorTokenTypes.BitwiseXorAssign,
				"&=": SlimeAssignmentOperatorTokenTypes.BitwiseAndAssign,
				"||=": SlimeAssignmentOperatorTokenTypes.LogicalOrAssign,
				"&&=": SlimeAssignmentOperatorTokenTypes.LogicalAndAssign,
				"??=": SlimeAssignmentOperatorTokenTypes.NullishCoalescingAssign
			}[operator],
			value: operator,
			loc
		};
	}
	/**
	* 创建更新运算符 Token
	* 支持: ++ --
	*/
	createUpdateOperatorToken(operator, loc) {
		return {
			type: {
				"++": SlimeUpdateOperatorTokenTypes.Increment,
				"--": SlimeUpdateOperatorTokenTypes.Decrement
			}[operator],
			value: operator,
			loc
		};
	}
};
const SlimeTokenCreate = new SlimeTokenFactory();
var SlimeTokenCreate_default = SlimeTokenCreate;

//#endregion
//#region src/factory/ObjectCstToSlimeAst.ts
let uuidCounter = 0;
function generateUUID() {
	return `${Date.now().toString(36)}_${(uuidCounter++).toString(36)}`;
}
function checkCstName(cst, cstName) {
	if (cst.name !== cstName) throw new Error(`Expected CST name '${cstName}', but got '${cst.name}'`);
	return cstName;
}
/**
* 从 BindingIdentifier CST 节点中提取标识符名称
*
* CST 结构：
* BindingIdentifier
*   └── Identifier
*       └── IdentifierName: "actualName"  <-- 值在这里
*
* @param bindingIdCst BindingIdentifier CST 节点
* @returns 标识符名称和 loc 信息
*/
function extractIdentifierFromBindingId(bindingIdCst) {
	const identifierNode = bindingIdCst.children?.[0];
	if (!identifierNode) throw new Error("BindingIdentifier: 缺少 Identifier 子节点");
	const identifierNameNode = identifierNode.children?.[0];
	if (identifierNameNode) return {
		name: identifierNameNode.value || identifierNameNode.name,
		loc: identifierNameNode.loc
	};
	return {
		name: identifierNode.value || identifierNode.name,
		loc: identifierNode.loc
	};
}
/**
* ObjectScript CST 到 Slime AST 转换器
*
* 核心功能：将 object 声明转换为临时类 + 实例化
*
* 转换示例：
* ```
* // 输入 CST
* object Person {
*   name = "Alice"
*   greet() { return "Hello" }
* }
*
* // 输出 AST（两个语句）
* class $$OsClassPerson_a1b2c3d4 {
*   name = "Alice"
*   greet() { return "Hello" }
* }
* const Person = new $$OsClassPerson_a1b2c3d4()
* ```
*/
var ObjectCstToSlimeAst = class extends SlimeCstToAst {
	constructor(..._args) {
		super(..._args);
		this.needsOsRuntime = false;
	}
	/**
	* 重写 toProgram 以支持 ObjectDeclaration
	*
	* 因为一个 ObjectDeclaration 会生成两个 AST 节点（class + const），
	* 所以需要在这里展平处理
	*
	* @returns SlimeProgram AST
	*/
	toProgram(cst) {
		this.needsOsRuntime = false;
		const program = super.toProgram(cst);
		const flatBody = [];
		for (const item of program.body) if (Array.isArray(item)) flatBody.push(...item);
		else flatBody.push(item);
		if (this.needsOsRuntime) {
			const importDecl = this.createOsRuntimeImport();
			flatBody.unshift(importDecl);
		}
		program.body = flatBody;
		return program;
	}
	/**
	* 创建 $osRuntime 的 import 声明
	* import { $osRuntime } from 'osjs'
	*/
	createOsRuntimeImport() {
		const osRuntimeId = SlimeNodeCreate_default.createIdentifier("$osRuntime");
		const specifier = SlimeNodeCreate_default.createImportSpecifier(osRuntimeId, osRuntimeId);
		const specifierItem = SlimeNodeCreate_default.createImportSpecifierItem(specifier);
		const source = SlimeNodeCreate_default.createStringLiteral("osjs");
		return SlimeNodeCreate_default.createImportDeclaration([specifierItem], source);
	}
	/**
	* 重写 createDeclarationAst 以支持 ObjectDeclaration
	*
	* 注意：这里返回 any 类型，因为 ObjectDeclaration 需要返回数组（两个节点）
	*/
	createDeclarationAst(cst) {
		const first = cst.children?.[0];
		if (!first) return super.createDeclarationAst(cst);
		if (first.name === ObjectScriptParser.prototype.ObjectDeclaration.name) return this.createObjectDeclarationAst(first);
		return super.createDeclarationAst(cst);
	}
	/**
	* 重写 createClassDeclarationAst 以支持多继承
	*
	* 检测到多继承时，生成调用 $osRuntime.initMultipleInheritance 的代码
	*/
	createClassDeclarationAst(cst) {
		const classDecl = super.createClassDeclarationAst(cst);
		const classTailCst = cst.children?.find((child) => child.name === SlimeParser.prototype.ClassTail?.name || child.name === "ClassTail");
		if (!classTailCst) return classDecl;
		const classHeritageCst = classTailCst.children?.find((child) => child.name === ObjectScriptParser.prototype.ClassHeritage.name || child.name === "ClassHeritage");
		if (!classHeritageCst) return classDecl;
		const parentClasses = this.extractMultipleParentClasses(classHeritageCst);
		if (parentClasses.length <= 1) return classDecl;
		return this.transformToMultipleInheritance(classDecl, parentClasses, cst.loc);
	}
	/**
	* 从 ClassHeritage CST 提取多个父类表达式
	*
	* CST 结构（多继承）：
	* ClassHeritage
	*   ├── Extends
	*   ├── LeftHandSideExpression (第一个父类)
	*   ├── Comma
	*   ├── LeftHandSideExpression (第二个父类)
	*   ├── Comma
	*   ├── LeftHandSideExpression (第三个父类)
	*   └── ...
	*/
	extractMultipleParentClasses(cst) {
		const parentClasses = [];
		const parentNames = [];
		for (const child of cst.children || []) {
			if (child.name === "Extends" || child.value === "extends") continue;
			if (child.name === "Comma" || child.value === ",") continue;
			if (child.name === SlimeParser.prototype.LeftHandSideExpression?.name || child.name === "LeftHandSideExpression") {
				const expr = this.createLeftHandSideExpressionAst(child);
				const parentName = this.getExpressionName(expr);
				if (parentName && parentNames.includes(parentName)) {
					const loc = child.loc || cst.loc;
					throw new Error(`Duplicate parent class '${parentName}' in extends clause` + (loc ? ` at line ${loc.start?.line}, column ${loc.start?.column}` : ""));
				}
				if (parentName) parentNames.push(parentName);
				parentClasses.push(expr);
			}
		}
		return parentClasses;
	}
	/**
	* 从表达式中提取名称（用于重复检测）
	*/
	getExpressionName(expr) {
		if (expr.type === "Identifier") return expr.name;
		if (expr.type === "MemberExpression") {
			const memberExpr = expr;
			const objectName = this.getExpressionName(memberExpr.object);
			const propName = memberExpr.property?.name;
			if (objectName && propName) return `${objectName}.${propName}`;
		}
		return null;
	}
	/**
	* 将多继承类转换为运行时委托模式
	*
	* 输入：class A extends B, C { foo() {} }
	* 输出：class A { constructor(...args) { $osRuntime.initMultipleInheritance(this, [B, C], args) } foo() {} }
	*/
	transformToMultipleInheritance(originalClass, parentClasses, loc) {
		const newClass = {
			...originalClass,
			superClass: null
		};
		const existingConstructor = this.findConstructor(originalClass.body);
		const newConstructor = this.createMultiInheritanceConstructor(parentClasses, existingConstructor, loc);
		const transformedBodyElements = (originalClass.body.body || []).map((element) => {
			if (element.type === "MethodDefinition" && element.kind !== "constructor") return this.transformMethodDefinition(element, loc);
			return element;
		});
		newClass.body = {
			...originalClass.body,
			body: this.replaceOrAddConstructor(transformedBodyElements, newConstructor)
		};
		return newClass;
	}
	/**
	* 转换方法定义中的 super 表达式
	*/
	transformMethodDefinition(method, loc) {
		const funcExpr = method.value;
		if (!funcExpr?.body?.body) return method;
		const transformedStatements = funcExpr.body.body.map((stmt) => this.transformStatementSuperExpressions(stmt, loc));
		return {
			...method,
			value: {
				...funcExpr,
				body: {
					...funcExpr.body,
					body: transformedStatements
				}
			}
		};
	}
	/**
	* 递归转换语句中的 super 表达式
	*/
	transformStatementSuperExpressions(stmt, loc) {
		if (!stmt) return stmt;
		if (stmt.type === "ExpressionStatement") {
			const exprStmt = stmt;
			return {
				...exprStmt,
				expression: this.transformExpression(exprStmt.expression, loc)
			};
		}
		if (stmt.type === "ReturnStatement") {
			const retStmt = stmt;
			if (retStmt.argument) return {
				...retStmt,
				argument: this.transformExpression(retStmt.argument, loc)
			};
		}
		if (stmt.type === "IfStatement") {
			const ifStmt = stmt;
			return {
				...ifStmt,
				test: this.transformExpression(ifStmt.test, loc),
				consequent: this.transformStatementSuperExpressions(ifStmt.consequent, loc),
				alternate: ifStmt.alternate ? this.transformStatementSuperExpressions(ifStmt.alternate, loc) : null
			};
		}
		if (stmt.type === "BlockStatement") {
			const blockStmt = stmt;
			return {
				...blockStmt,
				body: blockStmt.body.map((s) => this.transformStatementSuperExpressions(s, loc))
			};
		}
		if (stmt.type === "VariableDeclaration") {
			const varDecl = stmt;
			return {
				...varDecl,
				declarations: varDecl.declarations.map((decl) => ({
					...decl,
					init: decl.init ? this.transformExpression(decl.init, loc) : null
				}))
			};
		}
		return stmt;
	}
	/**
	* 递归转换表达式中的 super 表达式
	*/
	transformExpression(expr, loc) {
		if (!expr) return expr;
		if (expr.type === "AssignmentExpression") {
			const left = expr.left;
			if (this.isSuperMemberExpression(left)) return this.transformSuperAssignment(expr, loc);
			return {
				...expr,
				left: this.transformExpression(expr.left, loc),
				right: this.transformExpression(expr.right, loc)
			};
		}
		if (expr.type === "CallExpression") {
			const callee = expr.callee;
			if (this.isSuperMemberExpression(callee)) return this.transformSuperCall(expr, loc);
			return {
				...expr,
				callee: this.transformExpression(expr.callee, loc),
				arguments: expr.arguments?.map((arg) => ({
					...arg,
					argument: arg.argument ? this.transformExpression(arg.argument, loc) : void 0
				}))
			};
		}
		if (expr.type === "MemberExpression") {
			if (this.isSuperMemberExpression(expr)) return this.transformSuperGet(expr, loc);
			return {
				...expr,
				object: this.transformExpression(expr.object, loc),
				property: this.transformExpression(expr.property, loc)
			};
		}
		if (expr.type === "BinaryExpression" || expr.type === "LogicalExpression") return {
			...expr,
			left: this.transformExpression(expr.left, loc),
			right: this.transformExpression(expr.right, loc)
		};
		if (expr.type === "ConditionalExpression") return {
			...expr,
			test: this.transformExpression(expr.test, loc),
			consequent: this.transformExpression(expr.consequent, loc),
			alternate: this.transformExpression(expr.alternate, loc)
		};
		return expr;
	}
	/**
	* 检查是否是 super 成员表达式
	* super.xxx 或 super.B.xxx
	*/
	isSuperMemberExpression(expr) {
		if (expr?.type !== "MemberExpression") return false;
		if (expr.object?.type === "Super") return true;
		if (expr.object?.type === "MemberExpression" && expr.object.object?.type === "Super") return true;
		return false;
	}
	/**
	* 判断是否是 super.B.xxx 形式（显式指定父类）
	*/
	isExplicitSuperExpression(expr) {
		return expr?.type === "MemberExpression" && expr.object?.type === "MemberExpression" && expr.object.object?.type === "Super";
	}
	/**
	* 转换 super.foo() 或 super.B.foo() 为运行时调用
	*/
	transformSuperCall(expr, loc) {
		this.needsOsRuntime = true;
		const callee = expr.callee;
		const args = this.extractCallArguments(expr.arguments || []);
		if (this.isExplicitSuperExpression(callee)) {
			const parentClassName = callee.object.property.name;
			const methodName = callee.property.name;
			return this.createRuntimeCall("superCallOn", [
				SlimeNodeCreate_default.createThisExpression(loc),
				SlimeNodeCreate_default.createIdentifier(parentClassName, loc),
				SlimeNodeCreate_default.createStringLiteral(methodName, loc),
				this.createArrayExpression(args, loc)
			], loc);
		} else {
			const methodName = callee.property.name;
			return this.createRuntimeCall("superCall", [
				SlimeNodeCreate_default.createThisExpression(loc),
				SlimeNodeCreate_default.createStringLiteral(methodName, loc),
				this.createArrayExpression(args, loc)
			], loc);
		}
	}
	/**
	* 转换 super.name 或 super.B.name 为运行时调用
	*/
	transformSuperGet(expr, loc) {
		this.needsOsRuntime = true;
		if (this.isExplicitSuperExpression(expr)) {
			const parentClassName = expr.object.property.name;
			const propName = expr.property.name;
			return this.createRuntimeCall("superGetOn", [
				SlimeNodeCreate_default.createThisExpression(loc),
				SlimeNodeCreate_default.createIdentifier(parentClassName, loc),
				SlimeNodeCreate_default.createStringLiteral(propName, loc)
			], loc);
		} else {
			const propName = expr.property.name;
			return this.createRuntimeCall("superGet", [SlimeNodeCreate_default.createThisExpression(loc), SlimeNodeCreate_default.createStringLiteral(propName, loc)], loc);
		}
	}
	/**
	* 转换 super.name = x 或 super.B.name = x 为运行时调用
	*/
	transformSuperAssignment(expr, loc) {
		this.needsOsRuntime = true;
		const left = expr.left;
		const right = this.transformExpression(expr.right, loc);
		if (this.isExplicitSuperExpression(left)) {
			const parentClassName = left.object.property.name;
			const propName = left.property.name;
			return this.createRuntimeCall("superSetOn", [
				SlimeNodeCreate_default.createThisExpression(loc),
				SlimeNodeCreate_default.createIdentifier(parentClassName, loc),
				SlimeNodeCreate_default.createStringLiteral(propName, loc),
				right
			], loc);
		} else {
			const propName = left.property.name;
			return this.createRuntimeCall("superSet", [
				SlimeNodeCreate_default.createThisExpression(loc),
				SlimeNodeCreate_default.createStringLiteral(propName, loc),
				right
			], loc);
		}
	}
	/**
	* 创建 $osRuntime.methodName(...args) 调用表达式
	*/
	createRuntimeCall(methodName, args, loc) {
		return {
			type: "CallExpression",
			callee: {
				type: "MemberExpression",
				object: SlimeNodeCreate_default.createIdentifier("$osRuntime", loc),
				property: SlimeNodeCreate_default.createIdentifier(methodName, loc),
				computed: false,
				optional: false,
				loc
			},
			arguments: args.map((arg, index) => ({
				argument: arg,
				commaToken: index < args.length - 1 ? SlimeTokenCreate_default.createCommaToken(loc) : void 0
			})),
			loc
		};
	}
	/**
	* 从调用参数中提取实际的表达式
	*/
	extractCallArguments(args) {
		return args.map((arg) => {
			if (arg.argument !== void 0) return arg.argument;
			if (arg.element !== void 0) return arg.element;
			return arg;
		});
	}
	/**
	* 创建数组表达式
	*/
	createArrayExpression(elements, loc) {
		return {
			type: "ArrayExpression",
			elements: elements.map((el, index) => ({
				element: el,
				commaToken: index < elements.length - 1 ? SlimeTokenCreate_default.createCommaToken(loc) : void 0
			})),
			loc
		};
	}
	/**
	* 在类体中查找构造函数
	*/
	findConstructor(classBody) {
		for (const element of classBody.body || []) if (element.type === "MethodDefinition" && element.kind === "constructor") return element;
		return null;
	}
	/**
	* 创建多继承的构造函数
	*
	* 如果没有用户定义的构造函数：生成默认无参调用所有父类
	* 如果有用户定义的构造函数：转换 super.ClassName(args) 调用
	*/
	createMultiInheritanceConstructor(parentClasses, existingConstructor, loc) {
		let bodyStatements = [];
		let params = [];
		if (existingConstructor) {
			const existingValue = existingConstructor.value;
			params = existingValue?.params || [];
			const existingBody = existingValue?.body;
			if (existingBody && existingBody.body) bodyStatements = existingBody.body.map((stmt) => this.transformSuperClassCall(stmt, loc)).filter((stmt) => stmt !== null);
		} else bodyStatements = parentClasses.map((parentExpr) => this.createInitParentCall(parentExpr, [], loc));
		return {
			type: "MethodDefinition",
			key: SlimeNodeCreate_default.createIdentifier("constructor", loc),
			value: {
				type: "FunctionExpression",
				id: null,
				params,
				body: {
					type: "BlockStatement",
					body: bodyStatements,
					loc
				},
				generator: false,
				async: false,
				loc
			},
			kind: "constructor",
			computed: false,
			static: false,
			loc
		};
	}
	/**
	* 转换 super.ClassName(args) 调用为 $osRuntime.initParent(this, ClassName, [args])
	*
	* 如果不是 super.ClassName() 调用，返回原语句
	* 如果是 super() 调用（单继承），返回 null 过滤掉
	*/
	transformSuperClassCall(stmt, loc) {
		if (stmt.type !== "ExpressionStatement") return stmt;
		const expr = stmt.expression;
		if (expr?.type !== "CallExpression") return stmt;
		const callee = expr.callee;
		if (callee?.type === "Super") return null;
		if (callee?.type === "MemberExpression" && callee.object?.type === "Super" && callee.property?.type === "Identifier") {
			const className = callee.property.name;
			const args = expr.arguments || [];
			return this.createInitParentCall(SlimeNodeCreate_default.createIdentifier(className, loc), args, loc);
		}
		return stmt;
	}
	/**
	* 创建 $osRuntime.initParent(this, ClassName, [args]) 调用语句
	*/
	createInitParentCall(parentExpr, args, loc) {
		this.needsOsRuntime = true;
		const arrayElements = args.map((arg, index) => {
			let actualArg;
			if (arg.argument !== void 0) actualArg = arg.argument;
			else if (arg.element !== void 0) actualArg = arg.element;
			else actualArg = arg;
			return {
				element: actualArg,
				commaToken: index < args.length - 1 ? { value: "," } : void 0
			};
		});
		return {
			type: "ExpressionStatement",
			expression: {
				type: "CallExpression",
				callee: {
					type: "MemberExpression",
					object: SlimeNodeCreate_default.createIdentifier("$osRuntime", loc),
					property: SlimeNodeCreate_default.createIdentifier("initParent", loc),
					computed: false,
					optional: false,
					loc
				},
				arguments: [
					{
						type: "ThisExpression",
						loc
					},
					parentExpr,
					{
						type: "ArrayExpression",
						elements: arrayElements,
						loc
					}
				],
				optional: false,
				loc
			},
			loc
		};
	}
	/**
	* 检查语句是否是 super() 调用
	*/
	isSuperCall(stmt) {
		if (stmt.type !== "ExpressionStatement") return false;
		const expr = stmt.expression;
		if (expr?.type !== "CallExpression") return false;
		return expr.callee?.type === "Super";
	}
	/**
	* 在类体中替换或添加构造函数
	*/
	replaceOrAddConstructor(body, newConstructor) {
		const result = [];
		let found = false;
		for (const element of body || []) if (element.type === "MethodDefinition" && element.kind === "constructor") {
			result.push(newConstructor);
			found = true;
		} else result.push(element);
		if (!found) result.unshift(newConstructor);
		return result;
	}
	/**
	* 转换 ObjectDeclaration 为 ClassDeclaration + VariableDeclaration
	* 
	* CST 结构：
	* ObjectDeclaration
	*   ├── ObjectToken (token: "object")
	*   ├── BindingIdentifier (对象名)
	*   ├── ObjectHeritage? (extends ...)
	*   ├── LBrace
	*   ├── ObjectBody? (属性和方法)
	*   └── RBrace
	* 
	* @param cst ObjectDeclaration CST 节点
	* @returns [ClassDeclaration, VariableDeclaration] 两个 AST 节点的数组
	*/
	createObjectDeclarationAst(cst) {
		checkCstName(cst, ObjectScriptParser.prototype.ObjectDeclaration.name);
		const nameNode = cst.children?.find((child) => child.name === "BindingIdentifier");
		if (!nameNode) throw new Error("ObjectDeclaration: 缺少对象名");
		const { name: objectName, loc: nameLoc } = extractIdentifierFromBindingId(nameNode);
		const tempClassName = `$$OsClass${objectName}_${generateUUID()}`;
		const tempClassId = SlimeNodeCreate_default.createIdentifier(tempClassName, cst.loc);
		const heritageNode = cst.children?.find((child) => child.name === ObjectScriptParser.prototype.ObjectHeritage.name);
		let superClass = void 0;
		if (heritageNode) {
			const lhsNode = heritageNode.children?.find((child) => child.name === "LeftHandSideExpression");
			if (lhsNode) {
				const parentExpr = this.createLeftHandSideExpressionAst(lhsNode);
				superClass = {
					type: "CallExpression",
					callee: {
						type: "MemberExpression",
						object: SlimeNodeCreate_default.createIdentifier("$osRuntime", cst.loc),
						property: SlimeNodeCreate_default.createIdentifier("getObjectClass", cst.loc),
						computed: false,
						optional: false,
						loc: cst.loc
					},
					arguments: [parentExpr],
					optional: false,
					loc: cst.loc
				};
				this._needsOsRuntime = true;
			}
		}
		const bodyNode = cst.children?.find((child) => child.name === ObjectScriptParser.prototype.ObjectBody.name);
		const classBody = bodyNode ? this.createObjectBodyAst(bodyNode) : this.createEmptyClassBody();
		const classDecl = {
			type: "ClassDeclaration",
			id: tempClassId,
			superClass,
			body: classBody,
			loc: cst.loc
		};
		const varDecl = SlimeNodeCreate_default.createVariableDeclaration(SlimeTokenCreate_default.createConstToken(cst.loc), [SlimeNodeCreate_default.createVariableDeclarator(SlimeNodeCreate_default.createIdentifier(objectName, cst.loc), SlimeTokenCreate_default.createAssignmentOperatorToken("=", cst.loc), {
			type: "NewExpression",
			callee: SlimeNodeCreate_default.createIdentifier(tempClassName, cst.loc),
			arguments: [],
			loc: cst.loc
		})], cst.loc);
		const setClassStmt = {
			type: "ExpressionStatement",
			expression: {
				type: "CallExpression",
				callee: {
					type: "MemberExpression",
					object: SlimeNodeCreate_default.createIdentifier("$osRuntime", cst.loc),
					property: SlimeNodeCreate_default.createIdentifier("setObjectClass", cst.loc),
					computed: false,
					optional: false,
					loc: cst.loc
				},
				arguments: [SlimeNodeCreate_default.createIdentifier(objectName, cst.loc), SlimeNodeCreate_default.createIdentifier(tempClassName, cst.loc)],
				optional: false,
				loc: cst.loc
			},
			loc: cst.loc
		};
		this._needsOsRuntime = true;
		return [
			classDecl,
			varDecl,
			setClassStmt
		];
	}
	/**
	* 转换 ObjectBody 为 ClassBody
	* 
	* CST 结构：
	* ObjectBody
	*   └── ObjectElementList
	*       ├── ObjectElement (方法或属性)
	*       ├── ObjectElement
	*       └── ...
	*/
	createObjectBodyAst(cst) {
		checkCstName(cst, ObjectScriptParser.prototype.ObjectBody.name);
		const elementListNode = cst.children?.find((child) => child.name === ObjectScriptParser.prototype.ObjectElementList.name);
		if (!elementListNode) return this.createEmptyClassBody();
		return {
			type: "ClassBody",
			body: this.createObjectElementListAst(elementListNode),
			loc: cst.loc
		};
	}
	/**
	* 转换 ObjectElementList 为 ClassBody 元素数组
	*/
	createObjectElementListAst(cst) {
		checkCstName(cst, ObjectScriptParser.prototype.ObjectElementList.name);
		const elements = [];
		for (const child of cst.children || []) if (child.name === ObjectScriptParser.prototype.ObjectElement.name) {
			const element = this.createObjectElementAst(child);
			if (element) elements.push(element);
		}
		return elements;
	}
	/**
	* 转换 ObjectElement（单个属性或方法）
	* 
	* ObjectElement 可以是：
	* - MethodDefinition（方法）
	* - ObjectPropertyAssignment（属性赋值）
	* - EmptySemicolon（空分号，忽略）
	*/
	createObjectElementAst(cst) {
		checkCstName(cst, ObjectScriptParser.prototype.ObjectElement.name);
		const child = cst.children?.[0];
		if (!child) return null;
		if (child.name === "MethodDefinition") return this.createMethodDefinitionAst(null, child);
		if (child.name === ObjectScriptParser.prototype.ObjectPropertyAssignment.name) return this.createObjectPropertyAssignmentAst(child);
		if (child.name === "EmptySemicolon") return null;
		throw new Error(`ObjectElement: 不支持的子节点类型 '${child.name}'`);
	}
	/**
	* 转换 ObjectPropertyAssignment 为 PropertyDefinition
	* 
	* CST 结构：
	* ObjectPropertyAssignment
	*   ├── BindingIdentifier (属性名)
	*   ├── Eq (=)
	*   └── AssignmentExpression (值)
	* 
	* 转换为：PropertyDefinition
	*   key: Identifier
	*   value: Expression
	*/
	createObjectPropertyAssignmentAst(cst) {
		checkCstName(cst, ObjectScriptParser.prototype.ObjectPropertyAssignment.name);
		const nameNode = cst.children?.find((child) => child.name === "BindingIdentifier");
		if (!nameNode) throw new Error("ObjectPropertyAssignment: 缺少属性名");
		const { name: keyName, loc: keyLoc } = extractIdentifierFromBindingId(nameNode);
		const key = SlimeNodeCreate_default.createIdentifier(keyName, keyLoc);
		const valueNode = cst.children?.find((child) => child.name === "AssignmentExpression");
		if (!valueNode) throw new Error("ObjectPropertyAssignment: 缺少属性值");
		const value = this.createAssignmentExpressionAst(valueNode);
		return SlimeNodeCreate_default.createPropertyDefinition(key, value, false);
	}
	/**
	* 创建空的 ClassBody
	*/
	createEmptyClassBody() {
		return {
			type: "ClassBody",
			body: [],
			loc: void 0
		};
	}
};
const ObjectCstToSlimeAstUtil = new ObjectCstToSlimeAst();

//#endregion
//#region src/index.ts
/**
* ObjectScript 编译器
*
* 提供 ObjectScript 代码解析和转换功能
*
* @example
* ```typescript
* import { osTransform, ObjectScriptParser, ObjectCstToSlimeAst } from 'os-compiler'
* ```
*/
/**
* ObjectScript 代码转换基础函数
* 返回 AST 和 tokens
*/
function osTransformBase(code) {
	const parser = new ObjectScriptParser(code);
	let curCst = parser.Program();
	const tokens = parser.parsedTokens;
	if (!tokens.length) return {
		ast: null,
		tokens
	};
	return {
		ast: new ObjectCstToSlimeAst().toProgram(curCst),
		tokens
	};
}
/**
* ObjectScript 代码转换（纯编译）
* 返回编译后的代码和 source mapping
*/
function osTransform(code) {
	let codeResult = osTransformBase(code);
	return SlimeGenerator.generator(codeResult.ast, codeResult.tokens);
}
/**
* Vite 插件专用的 ObjectScript 代码转换
* 添加 osjs 运行时导入
*/
function vitePluginOsTransform(code) {
	let codeResult = osTransformBase(code);
	let ast = codeResult.ast;
	if (!ast) return {
		code: "",
		mapping: []
	};
	const result = SlimeGenerator.generator(ast, codeResult.tokens);
	result.mapping = result.mapping.filter((m) => m.source && m.source.value && m.source.value !== "" && m.source.length > 0);
	return result;
}

//#endregion
export { ObjectCstToSlimeAst, ObjectScriptContextualKeywords, ObjectScriptParser, ObjectScriptTokenConsumer, objectScriptTokens, osTransform, osTransformBase, vitePluginOsTransform };