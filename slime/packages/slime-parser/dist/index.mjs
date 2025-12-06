import "slime-ast/src/SlimeESTree.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SubhutiParser, { Subhuti, SubhutiRule } from "subhuti/src/SubhutiParser.ts";
import { LexicalGoal, matchRegExpLiteral } from "subhuti/src/SubhutiLexer.ts";
import { SlimeBinaryOperatorTokenTypes, SlimeContextualKeywordTokenTypes, SlimeReservedWordTokenTypes, SlimeTokenType, SlimeUnaryOperatorTokenTypes } from "slime-token/src/SlimeTokenType.ts";
import SubhutiTokenConsumer from "subhuti/src/SubhutiTokenConsumer.ts";
import { createEmptyValueRegToken, createKeywordToken, createValueRegToken } from "subhuti/src/struct/SubhutiCreateToken.ts";
import SlimeAstUtil from "slime-ast/src/SlimeNodeCreate.ts";
import SlimeTokenCreate from "slime-ast/src/SlimeTokenCreate.ts";
import { SlimeNodeType } from "slime-ast/src/SlimeNodeType.ts";

//#region src/language/es2025/SlimeTokenConsumer.ts
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
		return this.consume(SlimeReservedWordTokenTypes.Await);
	}
	Break() {
		return this.consume(SlimeReservedWordTokenTypes.Break);
	}
	Case() {
		return this.consume(SlimeReservedWordTokenTypes.Case);
	}
	Catch() {
		return this.consume(SlimeReservedWordTokenTypes.Catch);
	}
	Class() {
		return this.consume(SlimeReservedWordTokenTypes.Class);
	}
	Const() {
		return this.consume(SlimeReservedWordTokenTypes.Const);
	}
	Continue() {
		return this.consume(SlimeReservedWordTokenTypes.Continue);
	}
	Debugger() {
		return this.consume(SlimeReservedWordTokenTypes.Debugger);
	}
	Default() {
		return this.consume(SlimeReservedWordTokenTypes.Default);
	}
	Do() {
		return this.consume(SlimeReservedWordTokenTypes.Do);
	}
	Else() {
		return this.consume(SlimeReservedWordTokenTypes.Else);
	}
	Enum() {
		return this.consume(SlimeReservedWordTokenTypes.Enum);
	}
	Export() {
		return this.consume(SlimeReservedWordTokenTypes.Export);
	}
	Extends() {
		return this.consume(SlimeReservedWordTokenTypes.Extends);
	}
	False() {
		return this.consume(SlimeReservedWordTokenTypes.False);
	}
	Finally() {
		return this.consume(SlimeReservedWordTokenTypes.Finally);
	}
	For() {
		return this.consume(SlimeReservedWordTokenTypes.For);
	}
	Function() {
		return this.consume(SlimeReservedWordTokenTypes.Function);
	}
	If() {
		return this.consume(SlimeReservedWordTokenTypes.If);
	}
	Import() {
		return this.consume(SlimeReservedWordTokenTypes.Import);
	}
	New() {
		return this.consume(SlimeReservedWordTokenTypes.New);
	}
	/**
	* NullLiteral
	* 规范 A.1: NullLiteral :: null
	*/
	NullLiteral() {
		return this.consume(SlimeReservedWordTokenTypes.NullLiteral);
	}
	Return() {
		return this.consume(SlimeReservedWordTokenTypes.Return);
	}
	Super() {
		return this.consume(SlimeReservedWordTokenTypes.Super);
	}
	Switch() {
		return this.consume(SlimeReservedWordTokenTypes.Switch);
	}
	This() {
		return this.consume(SlimeReservedWordTokenTypes.This);
	}
	Throw() {
		return this.consume(SlimeReservedWordTokenTypes.Throw);
	}
	True() {
		return this.consume(SlimeReservedWordTokenTypes.True);
	}
	Try() {
		return this.consume(SlimeReservedWordTokenTypes.Try);
	}
	Var() {
		return this.consume(SlimeReservedWordTokenTypes.Var);
	}
	While() {
		return this.consume(SlimeReservedWordTokenTypes.While);
	}
	With() {
		return this.consume(SlimeReservedWordTokenTypes.With);
	}
	Yield() {
		return this.consume(SlimeReservedWordTokenTypes.Yield);
	}
	/**
	* 消费 'let' 软关键字
	* 用于 let 声明
	* 注意：let 在非严格模式下可作为标识符，因此作为软关键字处理
	*/
	Let() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Let);
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
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Async);
	}
	/**
	* 消费 'static' 软关键字
	* 用于类的静态成员
	* 注意：非严格模式下可作为标识符
	*/
	Static() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Static);
	}
	/**
	* 消费 'as' 软关键字
	* 用于 import/export 的重命名
	*/
	As() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.As);
	}
	/**
	* 消费 'get' 软关键字
	* 用于 getter 方法定义
	*/
	Get() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Get);
	}
	/**
	* 消费 'set' 软关键字
	* 用于 setter 方法定义
	*/
	Set() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Set);
	}
	/**
	* 消费 'of' 软关键字
	* 用于 for-of 语句
	*/
	Of() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Of);
	}
	/**
	* 消费 'target' 软关键字
	* 用于 new.target
	*/
	Target() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Target);
	}
	/**
	* 消费 'meta' 软关键字
	* 用于 import.meta
	*/
	Meta() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Meta);
	}
	/**
	* 消费 'from' 软关键字
	* 用于 import/export 语句
	*/
	From() {
		return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.From);
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
//#region src/language/es2025/SlimeTokens.ts
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
//#region src/language/es2025/SlimeParser.ts
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
		this.assertNotContextualSequenceNoLT(SlimeContextualKeywordTokenTypes.Async, SlimeTokenType.Function);
		this.assertNotContextualSequence(SlimeContextualKeywordTokenTypes.Let, SlimeTokenType.LBracket);
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
				this.assertNotContextualSequence(SlimeContextualKeywordTokenTypes.Let, SlimeTokenType.LBracket);
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
				this.assertNotContextualSequence(SlimeContextualKeywordTokenTypes.Let, SlimeTokenType.LBracket);
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
				this.assertNotContextual(SlimeContextualKeywordTokenTypes.Let);
				this.assertNotContextualPair(SlimeContextualKeywordTokenTypes.Async, SlimeContextualKeywordTokenTypes.Of);
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
				this.assertNotContextual(SlimeContextualKeywordTokenTypes.Let);
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
				this.assertNotContextualSequenceNoLT(SlimeContextualKeywordTokenTypes.Async, SlimeTokenType.Function);
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
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
		return typeof o$1;
	} : function(o$1) {
		return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
	}, _typeof(o);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}

//#endregion
//#region src/language/SlimeCstToAstUtil.ts
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
function checkCstName(cst, cstName) {
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
		_defineProperty(this, "expressionAstCache", /* @__PURE__ */ new WeakMap());
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
		return SlimeAstUtil.createIdentifier(decodedName, tokenLoc || cst.loc);
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
		if (!cst.children || cst.children.length === 0) return SlimeAstUtil.createProgram([], isModule ? "module" : "script");
		let bodyChild = null;
		for (const child of cst.children) if (child.name === "HashbangComment") hashbangComment = child.value || child.children?.[0]?.value || null;
		else if (child.name === "ModuleBody" || child.name === "ScriptBody" || child.name === "ModuleItemList" || child.name === SlimeParser.prototype.ModuleItemList?.name || child.name === "StatementList" || child.name === SlimeParser.prototype.StatementList?.name) bodyChild = child;
		if (bodyChild) if (bodyChild.name === "ModuleBody") {
			const moduleItemList = bodyChild.children?.[0];
			if (moduleItemList && (moduleItemList.name === "ModuleItemList" || moduleItemList.name === SlimeParser.prototype.ModuleItemList?.name)) {
				const body = this.createModuleItemListAst(moduleItemList);
				program = SlimeAstUtil.createProgram(body, "module");
			} else program = SlimeAstUtil.createProgram([], "module");
		} else if (bodyChild.name === SlimeParser.prototype.ModuleItemList?.name || bodyChild.name === "ModuleItemList") {
			const body = this.createModuleItemListAst(bodyChild);
			program = SlimeAstUtil.createProgram(body, "module");
		} else if (bodyChild.name === "ScriptBody") {
			const statementList = bodyChild.children?.[0];
			if (statementList && (statementList.name === "StatementList" || statementList.name === SlimeParser.prototype.StatementList?.name)) {
				const body = this.createStatementListAst(statementList);
				program = SlimeAstUtil.createProgram(body, "script");
			} else program = SlimeAstUtil.createProgram([], "script");
		} else if (bodyChild.name === SlimeParser.prototype.StatementList?.name || bodyChild.name === "StatementList") {
			const body = this.createStatementListAst(bodyChild);
			program = SlimeAstUtil.createProgram(body, "script");
		} else throw new Error(`Unexpected body child: ${bodyChild.name}`);
		else program = SlimeAstUtil.createProgram([], isModule ? "module" : "script");
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
		return SlimeAstUtil.createProgram([], "script");
	}
	/**
	* ScriptBody CST �?AST
	*/
	createScriptBodyAst(cst) {
		const stmtList = cst.children?.find((ch) => ch.name === "StatementList" || ch.name === SlimeParser.prototype.StatementList?.name);
		if (stmtList) {
			const body = this.createStatementListAst(stmtList);
			return SlimeAstUtil.createProgram(body, "script");
		}
		return SlimeAstUtil.createProgram([], "script");
	}
	/**
	* Module CST �?AST
	*/
	createModuleAst(cst) {
		const moduleBody = cst.children?.find((ch) => ch.name === "ModuleBody" || ch.name === SlimeParser.prototype.ModuleBody?.name);
		if (moduleBody) return this.createModuleBodyAst(moduleBody);
		return SlimeAstUtil.createProgram([], "module");
	}
	/**
	* ModuleBody CST �?AST
	*/
	createModuleBodyAst(cst) {
		const moduleItemList = cst.children?.find((ch) => ch.name === "ModuleItemList" || ch.name === SlimeParser.prototype.ModuleItemList?.name);
		if (moduleItemList) {
			const body = this.createModuleItemListAst(moduleItemList);
			return SlimeAstUtil.createProgram(body, "module");
		}
		return SlimeAstUtil.createProgram([], "module");
	}
	/**
	* NameSpaceImport CST �?AST
	* NameSpaceImport -> * as ImportedBinding
	*/
	createNameSpaceImportAst(cst) {
		let asteriskToken = void 0;
		let asToken = void 0;
		for (const child of cst.children) if (child.name === "Asterisk" || child.value === "*") asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc);
		else if (child.name === "As" || child.value === "as") asToken = SlimeTokenCreate.createAsToken(child.loc);
		const binding = cst.children.find((ch) => ch.name === SlimeParser.prototype.ImportedBinding?.name);
		if (!binding) throw new Error("NameSpaceImport missing ImportedBinding");
		const local = this.createImportedBindingAst(binding);
		return SlimeAstUtil.createImportNamespaceSpecifier(local, cst.loc, asteriskToken, asToken);
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
					type: SlimeNodeType.ImportSpecifier,
					imported,
					local,
					loc: child.loc
				});
			} else if (binding) {
				const id = this.createImportedBindingAst(binding);
				specifiers.push({
					type: SlimeNodeType.ImportSpecifier,
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
		for (const child of children) if (child.name === "As" || child.value === "as") asToken = SlimeTokenCreate.createAsToken(child.loc);
		else if (child.name === SlimeParser.prototype.ImportedBinding?.name || child.name === "ImportedBinding") local = this.createImportedBindingAst(child);
		else if (child.name === SlimeParser.prototype.ModuleExportName?.name || child.name === "ModuleExportName" || child.name === SlimeParser.prototype.IdentifierName?.name || child.name === "IdentifierName") {
			if (!imported) imported = this.createModuleExportNameAst(child);
		}
		if (!local && imported) local = { ...imported };
		if (!imported && local) imported = { ...local };
		return SlimeAstUtil.createImportSpecifier(imported, local, asToken);
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
		checkCstName(cst, SlimeParser.prototype.ImportDeclaration?.name);
		const first = cst.children[0];
		const first1 = cst.children[1];
		let importDeclaration;
		let importToken = void 0;
		let semicolonToken = void 0;
		if (first && (first.name === "Import" || first.value === "import")) importToken = SlimeTokenCreate.createImportToken(first.loc);
		const semicolonCst = cst.children.find((ch) => ch.name === "Semicolon" || ch.value === ";");
		if (semicolonCst) semicolonToken = SlimeTokenCreate.createSemicolonToken(semicolonCst.loc);
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
			importDeclaration = SlimeAstUtil.createImportDeclaration(clauseResult.specifiers, fromClause.source, cst.loc, importToken, fromClause.fromToken, clauseResult.lBraceToken, clauseResult.rBraceToken, semicolonToken, attributes, withToken);
		} else if (first1.name === SlimeParser.prototype.ModuleSpecifier?.name) {
			const source = this.createModuleSpecifierAst(first1);
			importDeclaration = SlimeAstUtil.createImportDeclaration([], source, cst.loc, importToken, void 0, void 0, void 0, semicolonToken, attributes, withToken);
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
							type: SlimeNodeType.Identifier,
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
		checkCstName(cst, SlimeParser.prototype.FromClause?.name);
		const first = cst.children[0];
		const ModuleSpecifier = this.createModuleSpecifierAst(cst.children[1]);
		let fromToken = void 0;
		if (first && (first.name === "From" || first.value === "from")) fromToken = SlimeTokenCreate.createFromToken(first.loc);
		return {
			source: ModuleSpecifier,
			fromToken
		};
	}
	createModuleSpecifierAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ModuleSpecifier?.name);
		const first = cst.children[0];
		return SlimeAstUtil.createStringLiteral(first.value);
	}
	createImportClauseAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ImportClause?.name);
		const result = [];
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.ImportedDefaultBinding?.name) {
			const specifier = this.createImportedDefaultBindingAst(first);
			const commaCst = cst.children.find((ch) => ch.name === "Comma" || ch.value === ",");
			const commaToken = commaCst ? SlimeTokenCreate.createCommaToken(commaCst.loc) : void 0;
			result.push(SlimeAstUtil.createImportSpecifierItem(specifier, commaToken));
			const namedImportsCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.NamedImports?.name || ch.name === "NamedImports");
			const namespaceImportCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.NameSpaceImport?.name || ch.name === "NameSpaceImport");
			if (namedImportsCst) {
				const namedResult = this.createNamedImportsListAstWrapped(namedImportsCst);
				result.push(...namedResult.specifiers);
				lBraceToken = namedResult.lBraceToken;
				rBraceToken = namedResult.rBraceToken;
			} else if (namespaceImportCst) result.push(SlimeAstUtil.createImportSpecifierItem(this.createNameSpaceImportAst(namespaceImportCst), void 0));
		} else if (first.name === SlimeParser.prototype.NameSpaceImport?.name) result.push(SlimeAstUtil.createImportSpecifierItem(this.createNameSpaceImportAst(first), void 0));
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
		checkCstName(cst, SlimeParser.prototype.ImportedDefaultBinding?.name);
		const first = cst.children[0];
		const id = this.createImportedBindingAst(first);
		return SlimeAstUtil.createImportDefaultSpecifier(id);
	}
	createImportedBindingAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ImportedBinding?.name);
		const first = cst.children[0];
		return this.createBindingIdentifierAst(first);
	}
	/** 返回包装类型的版本，包含 brace tokens */
	createNamedImportsListAstWrapped(cst) {
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children || []) if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
		else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
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
				if (hasSpec) specifiers.push(SlimeAstUtil.createImportSpecifierItem(currentSpec, void 0));
				const moduleExportName = child.children.find((ch) => ch.name === SlimeParser.prototype.ModuleExportName?.name || ch.name === "ModuleExportName");
				const binding = child.children.find((ch) => ch.name === SlimeParser.prototype.ImportedBinding?.name || ch.name === "ImportedBinding");
				if (moduleExportName && binding) {
					const imported = this.createModuleExportNameAst(moduleExportName);
					const local = this.createImportedBindingAst(binding);
					currentSpec = {
						type: SlimeNodeType.ImportSpecifier,
						imported,
						local,
						loc: child.loc
					};
				} else if (binding) {
					const id = this.createImportedBindingAst(binding);
					currentSpec = {
						type: SlimeNodeType.ImportSpecifier,
						imported: id,
						local: id,
						loc: child.loc
					};
				}
				hasSpec = true;
			} else if (child.name === "Comma" || child.value === ",") {
				if (hasSpec) {
					const commaToken = SlimeTokenCreate.createCommaToken(child.loc);
					specifiers.push(SlimeAstUtil.createImportSpecifierItem(currentSpec, commaToken));
					hasSpec = false;
					currentSpec = null;
				}
			}
		}
		if (hasSpec) specifiers.push(SlimeAstUtil.createImportSpecifierItem(currentSpec, void 0));
		return {
			specifiers,
			lBraceToken,
			rBraceToken
		};
	}
	createIdentifierNameAst(cst) {
		if (cst.value !== void 0) {
			const decodedName = decodeUnicodeEscapes(cst.value);
			return SlimeAstUtil.createIdentifier(decodedName, cst.loc);
		}
		let current = cst;
		while (current.children && current.children.length > 0 && current.value === void 0) current = current.children[0];
		if (current.value !== void 0) {
			const decodedName = decodeUnicodeEscapes(current.value);
			return SlimeAstUtil.createIdentifier(decodedName, current.loc || cst.loc);
		}
		throw new Error(`createIdentifierNameAst: Cannot extract value from IdentifierName`);
	}
	createBindingIdentifierAst(cst) {
		checkCstName(cst, SlimeParser.prototype.BindingIdentifier?.name);
		const first = cst.children[0];
		if (first.name === "Identifier" || first.name === SlimeParser.prototype.Identifier?.name) {
			const tokenCst = first.children?.[0];
			if (tokenCst && tokenCst.value !== void 0) return SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
		}
		if (first.value !== void 0) return SlimeAstUtil.createIdentifier(first.value, first.loc);
		throw new Error(`createBindingIdentifierAst: Cannot extract identifier value from ${first.name}`);
	}
	createStatementListAst(cst) {
		checkCstName(cst, SlimeParser.prototype.StatementList?.name);
		if (cst.children) return cst.children.map((item) => this.createStatementListItemAst(item)).flat();
		return [];
	}
	createStatementListItemAst(cst) {
		checkCstName(cst, SlimeParser.prototype.StatementListItem?.name);
		return cst.children.map((item) => {
			if (item.name === SlimeParser.prototype.Declaration?.name) return [this.createDeclarationAst(item)];
			return this.createStatementAst(item).flat().map((stmt) => {
				if (stmt.type === SlimeNodeType.ExpressionStatement) {
					const expr = stmt.expression;
					if (expr.type === SlimeNodeType.FunctionExpression) {
						const funcExpr = expr;
						if (funcExpr.id) return {
							type: SlimeNodeType.FunctionDeclaration,
							id: funcExpr.id,
							params: funcExpr.params,
							body: funcExpr.body,
							generator: funcExpr.generator,
							async: funcExpr.async,
							loc: funcExpr.loc
						};
					}
					if (expr.type === SlimeNodeType.ClassExpression) {
						const classExpr = expr;
						if (classExpr.id) return {
							type: SlimeNodeType.ClassDeclaration,
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
		checkCstName(cst, SlimeParser.prototype.Statement?.name);
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
		checkCstName(cst, SlimeParser.prototype.ExportDeclaration?.name);
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
			if (name === SlimeTokenConsumer.prototype.Export?.name || child.value === "export") exportToken = SlimeTokenCreate.createExportToken(child.loc);
			else if (name === SlimeTokenConsumer.prototype.Default?.name || child.value === "default") {
				defaultToken = SlimeTokenCreate.createDefaultToken(child.loc);
				isDefault = true;
			} else if (name === SlimeTokenConsumer.prototype.Asterisk?.name || child.value === "*") asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc);
			else if (name === SlimeTokenConsumer.prototype.Semicolon?.name || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
			else if (name === SlimeTokenConsumer.prototype.As?.name || child.value === "as") asToken = SlimeTokenCreate.createAsToken(child.loc);
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
			return SlimeAstUtil.createExportDefaultDeclaration(decl, cst.loc, exportToken, defaultToken);
		}
		if (exportFromClause && fromClause) {
			const fromClauseResult = this.createFromClauseAst(fromClause);
			if (exportFromClause.children?.some((ch) => ch.name === SlimeTokenConsumer.prototype.Asterisk?.name || ch.value === "*")) {
				let exported = null;
				const moduleExportName = exportFromClause.children?.find((ch) => ch.name === SlimeParser.prototype.ModuleExportName?.name);
				if (moduleExportName) exported = this.createModuleExportNameAst(moduleExportName);
				const result = SlimeAstUtil.createExportAllDeclaration(fromClauseResult.source, exported, cst.loc, exportToken, asteriskToken, asToken, fromClauseResult.fromToken, semicolonToken);
				if (withToken) {
					result.attributes = attributes;
					result.withToken = withToken;
				}
				return result;
			} else {
				const namedExportsCst = exportFromClause.children?.find((ch) => ch.name === SlimeParser.prototype.NamedExports?.name || ch.name === "NamedExports");
				const specifiers = namedExportsCst ? this.createNamedExportsAst(namedExportsCst) : [];
				const result = SlimeAstUtil.createExportNamedDeclaration(null, specifiers, fromClauseResult.source, cst.loc, exportToken, fromClauseResult.fromToken, semicolonToken);
				if (withToken) {
					result.attributes = attributes;
					result.withToken = withToken;
				}
				return result;
			}
		}
		if (namedExports) {
			const specifiers = this.createNamedExportsAst(namedExports);
			return SlimeAstUtil.createExportNamedDeclaration(null, specifiers, null, cst.loc, exportToken, void 0, semicolonToken);
		}
		if (variableStatement) {
			const decl = this.createVariableStatementAst(variableStatement);
			return SlimeAstUtil.createExportNamedDeclaration(decl, [], null, cst.loc, exportToken);
		}
		if (declaration) {
			const decl = this.createDeclarationAst(declaration);
			return SlimeAstUtil.createExportNamedDeclaration(decl, [], null, cst.loc, exportToken);
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
					commaToken: SlimeTokenCreate.createCommaToken(child.loc)
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
			else if (child.name === SlimeTokenConsumer.prototype.As?.name || child.value === "as") asToken = SlimeTokenCreate.createAsToken(child.loc);
		}
		if (!exported) exported = local;
		return SlimeAstUtil.createExportSpecifier(local, exported, cst.loc, asToken);
	}
	/**
	* 创建 ModuleExportName AST
	*/
	createModuleExportNameAst(cst) {
		const first = cst.children?.[0];
		if (!first) throw new Error("ModuleExportName has no children");
		if (first.name === SlimeParser.prototype.IdentifierName?.name) return this.createIdentifierNameAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.StringLiteral?.name) return SlimeAstUtil.createStringLiteral(first.value, first.loc);
		else return SlimeAstUtil.createIdentifier(first.value, first.loc);
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
			type: SlimeNodeType.VariableDeclaration,
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
					assignToken = SlimeTokenCreate.createAssignToken(assignCst.loc);
				}
				init = this.createInitializerAst(child);
			}
		}
		return SlimeAstUtil.createVariableDeclarator(id, assignToken, init, cst.loc);
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
			type: SlimeNodeType.VariableDeclaration,
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
			type: SlimeNodeType.VariableDeclarator,
			id,
			init,
			loc: cst.loc
		};
	}
	createHoistableDeclarationAst(cst) {
		checkCstName(cst, SlimeParser.prototype.HoistableDeclaration?.name);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return {
			type: SlimeNodeType.FunctionDeclaration,
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createFunctionDeclaration(id, params, body, false, true, cst.loc);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return {
			type: SlimeNodeType.FunctionDeclaration,
			id,
			params,
			body,
			generator: true,
			async: true,
			loc: cst.loc
		};
	}
	createVariableDeclarationAst(cst) {
		checkCstName(cst, SlimeParser.prototype.VariableDeclaration?.name);
		let kindCst = cst.children[0].children[0];
		let kindToken = void 0;
		const kindValue = kindCst.value;
		if (kindValue === "var") kindToken = SlimeTokenCreate.createVarToken(kindCst.loc);
		else if (kindValue === "let") kindToken = SlimeTokenCreate.createLetToken(kindCst.loc);
		else if (kindValue === "const") kindToken = SlimeTokenCreate.createConstToken(kindCst.loc);
		let declarations = [];
		if (cst.children[1]) declarations = this.createVariableDeclarationListAst(cst.children[1]);
		return SlimeAstUtil.createVariableDeclaration(kindToken, declarations, cst.loc);
	}
	createVariableDeclarationListAst(cst) {
		return cst.children.filter((item) => item.name === SlimeParser.prototype.LexicalBinding?.name || item.name === "VariableDeclarator").map((item) => this.createVariableDeclaratorAst(item));
	}
	createClassDeclarationAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ClassDeclaration?.name);
		let classToken = void 0;
		let id = null;
		let classTailCst = null;
		for (const child of cst.children) {
			const name = child.name;
			if (name === "Class" || child.value === "class") classToken = SlimeTokenCreate.createClassToken(child.loc);
			else if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") id = this.createBindingIdentifierAst(child);
			else if (name === SlimeParser.prototype.ClassTail?.name || name === "ClassTail") classTailCst = child;
		}
		if (!classTailCst) throw new Error("ClassDeclaration missing ClassTail");
		const classTailResult = this.createClassTailAst(classTailCst);
		return SlimeAstUtil.createClassDeclaration(id, classTailResult.body, classTailResult.superClass, cst.loc, classToken, classTailResult.extendsToken);
	}
	createClassTailAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ClassTail?.name);
		let superClass = null;
		let body = {
			type: SlimeNodeType.ClassBody,
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
		else if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
		else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
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
		checkCstName(cst, SlimeParser.prototype.ClassHeritage?.name);
		return this.createLeftHandSideExpressionAst(cst.children[1]);
	}
	createClassHeritageAstWithToken(cst) {
		checkCstName(cst, SlimeParser.prototype.ClassHeritage?.name);
		let extendsToken = void 0;
		const extendsCst = cst.children.find((ch) => ch.name === "Extends" || ch.value === "extends");
		if (extendsCst) extendsToken = SlimeTokenCreate.createExtendsToken(extendsCst.loc);
		return {
			superClass: this.createLeftHandSideExpressionAst(cst.children[1]),
			extendsToken
		};
	}
	createInitializerAst(cst) {
		checkCstName(cst, SlimeParser.prototype.Initializer?.name);
		const assignmentExpressionCst = cst.children[1];
		return this.createAssignmentExpressionAst(assignmentExpressionCst);
	}
	createFieldDefinitionAst(staticCst, cst) {
		checkCstName(cst, SlimeParser.prototype.FieldDefinition?.name);
		const elementNameCst = cst.children[0];
		const key = this.createClassElementNameAst(elementNameCst);
		const isComputed = this.isComputedPropertyName(elementNameCst);
		let value = null;
		if (cst.children.length > 1) {
			const initializerCst = cst.children[1];
			if (initializerCst && initializerCst.name === SlimeParser.prototype.Initializer?.name) value = this.createInitializerAst(initializerCst);
		}
		const isStatic = this.isStaticModifier(staticCst);
		return SlimeAstUtil.createPropertyDefinition(key, value, isComputed, isStatic || false, cst.loc);
	}
	/**
	* 检�?ClassElementName/PropertyName 是否是计算属性名
	*/
	isComputedPropertyName(cst) {
		if (!cst || !cst.children) return false;
		function hasComputedPropertyName(node) {
			if (!node) return false;
			if (node.name === "ComputedPropertyName" || node.name === SlimeParser.prototype.ComputedPropertyName?.name) return true;
			if (node.children) {
				for (const child of node.children) if (hasComputedPropertyName(child)) return true;
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
			const identifier = SlimeAstUtil.createIdentifier(name, cst.loc);
			if (raw !== name) identifier.raw = raw;
			return identifier;
		}
		if (cst.children && cst.children.length >= 2) {
			const rawName = cst.children[1].children[0].value;
			const decodedName = decodeUnicodeEscapes(rawName);
			const identifier = SlimeAstUtil.createIdentifier("#" + decodedName);
			if (rawName !== decodedName) identifier.raw = "#" + rawName;
			return identifier;
		}
		if (cst.children && cst.children.length === 1) {
			const child = cst.children[0];
			if (child.value) {
				const rawName = child.value;
				const decodedName = decodeUnicodeEscapes(rawName);
				const identifier = SlimeAstUtil.createIdentifier("#" + decodedName);
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
		const astName = checkCstName(cst, SlimeParser.prototype.ClassBody?.name);
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
		for (const child of cst.children || []) if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
		else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
		else if (child.name === "ClassStaticBlockBody") {
			const stmtListCst = child.children?.find((c) => c.name === "ClassStaticBlockStatementList" || c.name === "StatementList");
			if (stmtListCst) {
				const actualStatementList = stmtListCst.name === "ClassStaticBlockStatementList" ? stmtListCst.children?.find((c) => c.name === "StatementList") : stmtListCst;
				if (actualStatementList) bodyStatements = this.createStatementListAst(actualStatementList);
			}
		}
		return SlimeAstUtil.createStaticBlock(bodyStatements, cst.loc, lBraceToken, rBraceToken);
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
		const body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode?.loc);
		const value = {
			type: SlimeNodeType.FunctionExpression,
			id: null,
			params,
			body,
			generator,
			async,
			loc: cst.loc
		};
		return SlimeAstUtil.createMethodDefinition(key, value, kind, false, false, cst.loc);
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
		checkCstName(cst, SlimeParser.prototype.ClassElementName?.name);
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
		checkCstName(cst, SlimeParser.prototype.FormalParameterList?.name);
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
		checkCstName(cst, SlimeParser.prototype.BindingElement?.name);
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
					type: SlimeNodeType.AssignmentPattern,
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
		checkCstName(cst, SlimeParser.prototype.SingleNameBinding?.name);
		const first = cst.children[0];
		const id = this.createBindingIdentifierAst(first);
		const initializer = cst.children.find((ch) => ch.name === SlimeParser.prototype.Initializer?.name);
		if (initializer) {
			const init = this.createInitializerAst(initializer);
			return {
				type: SlimeNodeType.AssignmentPattern,
				left: id,
				right: init,
				loc: cst.loc
			};
		}
		return id;
	}
	createFunctionRestParameterAst(cst) {
		checkCstName(cst, SlimeParser.prototype.FunctionRestParameter?.name);
		const first = cst.children[0];
		return this.createBindingRestElementAst(first);
	}
	createBindingRestElementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.BindingRestElement?.name);
		const argumentCst = cst.children[1];
		let argument;
		if (argumentCst.name === SlimeParser.prototype.BindingIdentifier?.name) argument = this.createBindingIdentifierAst(argumentCst);
		else if (argumentCst.name === SlimeParser.prototype.BindingPattern?.name) argument = this.createBindingPatternAst(argumentCst);
		else throw new Error(`BindingRestElement: 不支持的类型 ${argumentCst.name}`);
		return SlimeAstUtil.createRestElement(argument);
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
			if (lastParam) params.push(SlimeAstUtil.createFunctionParam(lastParam));
			lastParam = this.createFormalParameterAst(child);
		} else if (child.name === SlimeParser.prototype.FunctionRestParameter?.name) {
			if (lastParam) params.push(SlimeAstUtil.createFunctionParam(lastParam));
			lastParam = this.createFunctionRestParameterAst(child);
		} else if (child.name === SlimeTokenConsumer.prototype.Comma?.name || child.value === ",") {
			if (lastParam) {
				params.push(SlimeAstUtil.createFunctionParam(lastParam, SlimeTokenCreate.createCommaToken(child.loc)));
				lastParam = null;
			}
		}
		if (lastParam) params.push(SlimeAstUtil.createFunctionParam(lastParam));
		return params;
	}
	createMethodDefinitionAst(staticCst, cst) {
		checkCstName(cst, SlimeParser.prototype.MethodDefinition?.name);
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
		if (staticCst && (staticCst.name === "Static" || staticCst.value === "static")) staticToken = SlimeTokenCreate.createStaticToken(staticCst.loc);
		const firstChild = children[i++];
		let key;
		if (firstChild.name === "IdentifierName") key = SlimeAstUtil.createIdentifier(firstChild.value, firstChild.loc);
		else if (firstChild.name === "IdentifierName") {
			const tokenCst = firstChild.children[0];
			key = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
		} else if (firstChild.name === "PropertyName" || firstChild.name === "LiteralPropertyName") key = this.createPropertyNameAst(firstChild);
		else key = this.createClassElementNameAst(firstChild);
		if (children[i]?.name === "LParen" || children[i]?.value === "(") {
			lParenToken = SlimeTokenCreate.createLParenToken(children[i].loc);
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
			rParenToken = SlimeTokenCreate.createRParenToken(children[i].loc);
			i++;
		}
		if (children[i]?.name === "LBrace" || children[i]?.value === "{") {
			lBraceToken = SlimeTokenCreate.createLBraceToken(children[i].loc);
			i++;
		}
		let body;
		if (children[i]?.name === "FunctionBody" || children[i]?.name === SlimeParser.prototype.FunctionBody?.name) {
			const bodyStatements = this.createFunctionBodyAst(children[i]);
			body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc, lBraceToken, rBraceToken);
			i++;
		} else body = SlimeAstUtil.createBlockStatement([], void 0, lBraceToken, rBraceToken);
		if (children[i]?.name === "RBrace" || children[i]?.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(children[i].loc);
		const functionExpression = SlimeAstUtil.createFunctionExpression(body, null, params, false, false, cst.loc, void 0, void 0, void 0, lParenToken, rParenToken, lBraceToken, rBraceToken);
		const isConstructor = key.type === "Identifier" && key.name === "constructor" && !this.isStaticModifier(staticCst);
		const isStatic = this.isStaticModifier(staticCst);
		const kind = isConstructor ? "constructor" : "method";
		return SlimeAstUtil.createMethodDefinition(key, functionExpression, kind, false, isStatic, cst.loc, staticToken);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const functionExpression = SlimeAstUtil.createFunctionExpression(body, null, params, false, false, cst.loc);
		const isComputed = this.isComputedPropertyName(classElementNameCst);
		const isConstructor = key.type === "Identifier" && key.name === "constructor" && !this.isStaticModifier(staticCst);
		const isStatic = this.isStaticModifier(staticCst);
		const kind = isConstructor ? "constructor" : "method";
		return SlimeAstUtil.createMethodDefinition(key, functionExpression, kind, isComputed, isStatic, cst.loc);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const methodDef = SlimeAstUtil.createMethodDefinition(key, {
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const methodDef = SlimeAstUtil.createMethodDefinition(key, {
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const methodDef = SlimeAstUtil.createMethodDefinition(key, {
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const methodDef = SlimeAstUtil.createMethodDefinition(key, {
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyChild.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const functionExpression = {
			type: "FunctionExpression",
			id: null,
			params,
			body,
			generator: true,
			async: false
		};
		const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyChild.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const functionExpression = {
			type: "FunctionExpression",
			id: null,
			params,
			body,
			generator: false,
			async: true
		};
		const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyChild.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		const functionExpression = {
			type: "FunctionExpression",
			id: null,
			params,
			body,
			generator: true,
			async: true
		};
		const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression);
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
		if (first.name === "FormalParameter" || first.name === SlimeParser.prototype.FormalParameter?.name) return [SlimeAstUtil.createFunctionParam(this.createFormalParameterAst(first), void 0)];
		if (first.name === "BindingElement" || first.name === SlimeParser.prototype.BindingElement?.name) return [SlimeAstUtil.createFunctionParam(this.createBindingElementAst(first), void 0)];
		return [];
	}
	createFormalParameterAst(cst) {
		const first = cst.children[0];
		if (first.name === "BindingElement" || first.name === SlimeParser.prototype.BindingElement?.name) return this.createBindingElementAst(first);
		return this.createBindingElementAst(cst);
	}
	createBindingPatternAst(cst) {
		checkCstName(cst, SlimeParser.prototype.BindingPattern?.name);
		const child = cst.children[0];
		if (child.name === SlimeParser.prototype.ArrayBindingPattern?.name) return this.createArrayBindingPatternAst(child);
		else if (child.name === SlimeParser.prototype.ObjectBindingPattern?.name) return this.createObjectBindingPatternAst(child);
		else throw new Error(`Unknown BindingPattern type: ${child.name}`);
	}
	createArrayBindingPatternAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ArrayBindingPattern?.name);
		const elements = [];
		let lBracketToken;
		let rBracketToken;
		for (const child of cst.children) if (child.value === "[") lBracketToken = SlimeTokenCreate.createLBracketToken(child.loc);
		else if (child.value === "]") rBracketToken = SlimeTokenCreate.createRBracketToken(child.loc);
		const bindingList = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingElementList?.name);
		if (bindingList) for (let i = 0; i < bindingList.children.length; i++) {
			const child = bindingList.children[i];
			if (child.value === ",") if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate.createCommaToken(child.loc);
			else SlimeTokenCreate.createCommaToken(child.loc);
			else if (child.name === SlimeParser.prototype.BindingElisionElement?.name) {
				const elision = child.children.find((ch) => ch.name === SlimeParser.prototype.Elision?.name);
				if (elision) {
					for (const elisionChild of elision.children || []) if (elisionChild.value === ",") elements.push({
						element: null,
						commaToken: SlimeTokenCreate.createCommaToken(elisionChild.loc)
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
				if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate.createCommaToken(child.loc);
			}
			if (child.name === SlimeParser.prototype.Elision?.name || child.name === "Elision") {
				for (const elisionChild of child.children || []) if (elisionChild.value === ",") elements.push({
					element: null,
					commaToken: SlimeTokenCreate.createCommaToken(elisionChild.loc)
				});
			}
		}
		const restElement = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingRestElement?.name);
		if (restElement) {
			const restNode = this.createBindingRestElementAst(restElement);
			elements.push({ element: restNode });
		}
		return {
			type: SlimeNodeType.ArrayPattern,
			elements,
			lBracketToken,
			rBracketToken,
			loc: cst.loc
		};
	}
	createObjectBindingPatternAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ObjectBindingPattern?.name);
		const properties = [];
		let lBraceToken;
		let rBraceToken;
		for (const child of cst.children) if (child.value === "{") lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
		else if (child.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
		const propList = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingPropertyList?.name);
		if (propList) for (let i = 0; i < propList.children.length; i++) {
			const child = propList.children[i];
			if (child.value === ",") {
				if (properties.length > 0 && !properties[properties.length - 1].commaToken) properties[properties.length - 1].commaToken = SlimeTokenCreate.createCommaToken(child.loc);
			} else if (child.name === SlimeParser.prototype.BindingProperty?.name) {
				const singleName = child.children.find((ch) => ch.name === SlimeParser.prototype.SingleNameBinding?.name);
				if (singleName) {
					const value = this.createSingleNameBindingAst(singleName);
					const identifier = singleName.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name);
					const key = this.createBindingIdentifierAst(identifier);
					properties.push({ property: {
						type: SlimeNodeType.Property,
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
							type: SlimeNodeType.Property,
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
			if (properties.length > 0 && !properties[properties.length - 1].commaToken) properties[properties.length - 1].commaToken = SlimeTokenCreate.createCommaToken(child.loc);
		}
		const restElement = cst.children.find((ch) => ch.name === SlimeParser.prototype.BindingRestElement?.name || ch.name === "BindingRestElement" || ch.name === SlimeParser.prototype.BindingRestProperty?.name || ch.name === "BindingRestProperty");
		if (restElement) {
			const identifier = restElement.children.find((ch) => ch.name === SlimeParser.prototype.BindingIdentifier?.name || ch.name === "BindingIdentifier");
			if (identifier) {
				const restId = this.createBindingIdentifierAst(identifier);
				const ellipsisCst = restElement.children.find((ch) => ch.value === "...");
				const ellipsisToken = ellipsisCst ? SlimeTokenCreate.createEllipsisToken(ellipsisCst.loc) : void 0;
				const restNode = {
					type: SlimeNodeType.RestElement,
					argument: restId,
					ellipsisToken,
					loc: restElement.loc
				};
				properties.push({ property: restNode });
			}
		}
		return {
			type: SlimeNodeType.ObjectPattern,
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
			type: SlimeNodeType.Property,
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
		return SlimeAstUtil.createRestElement(id);
	}
	createFunctionExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.FunctionExpression?.name);
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
				functionToken = SlimeTokenCreate.createFunctionToken(child.loc);
				continue;
			}
			if (name === "Async" || value === "async") {
				asyncToken = SlimeTokenCreate.createAsyncToken(child.loc);
				isAsync = true;
				continue;
			}
			if (name === "Asterisk" || value === "*") {
				asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc);
				isGenerator = true;
				continue;
			}
			if (name === "LParen" || value === "(") {
				lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || value === ")") {
				rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
				continue;
			}
			if (name === "LBrace" || value === "{") {
				lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
				continue;
			}
			if (name === "RBrace" || value === "}") {
				rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
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
				body = SlimeAstUtil.createBlockStatement(bodyStatements, child.loc);
				continue;
			}
		}
		if (!body) body = SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createFunctionExpression(body, functionId, params, isGenerator, isAsync, cst.loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken);
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
		checkCstName(cst, SlimeParser.prototype.ReturnStatement?.name);
		let argument = null;
		let returnToken = void 0;
		let semicolonToken = void 0;
		const returnCst = cst.children[0];
		if (returnCst && (returnCst.name === "Return" || returnCst.value === "return")) returnToken = SlimeTokenCreate.createReturnToken(returnCst.loc);
		if (cst.children.length > 1) for (let i = 1; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === "Semicolon" || child.name === "SemicolonASI" || child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
			else if (!argument) argument = this.createExpressionAst(child);
		}
		return SlimeAstUtil.createReturnStatement(argument, cst.loc, returnToken, semicolonToken);
	}
	createExpressionStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ExpressionStatement?.name);
		let semicolonToken = void 0;
		let expression = null;
		for (const child of cst.children || []) if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression" || !expression) expression = this.createExpressionAst(child);
		return SlimeAstUtil.createExpressionStatement(expression, cst.loc, semicolonToken);
	}
	/**
	* 创建 if 语句 AST
	* if (test) consequent [else alternate]
	* ES2025: if ( Expression ) IfStatementBody [else IfStatementBody]
	*/
	createIfStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.IfStatement?.name);
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
				ifToken = SlimeTokenCreate.createIfToken(child.loc);
				continue;
			}
			if (name === "LParen" || child.value === "(") {
				lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || child.value === ")") {
				rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
				continue;
			}
			if (name === "Else" || child.value === "else") {
				elseToken = SlimeTokenCreate.createElseToken(child.loc);
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
		return SlimeAstUtil.createIfStatement(test, consequent, alternate, cst.loc, ifToken, elseToken, lParenToken, rParenToken);
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
		checkCstName(cst, SlimeParser.prototype.ForStatement?.name);
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
				forToken = SlimeTokenCreate.createForToken(child.loc);
				continue;
			}
			if (name === "LParen" || child.value === "(") {
				lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || child.value === ")") {
				rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
				continue;
			}
			if (name === "Var" || child.value === "var") continue;
			if (name === "Semicolon" || child.value === ";" || child.loc?.type === "Semicolon") {
				semicolonTokens.push(SlimeTokenCreate.createSemicolonToken(child.loc));
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
		return SlimeAstUtil.createForStatement(body, init, test, update, cst.loc, forToken, lParenToken, rParenToken, semicolonTokens[0], semicolonTokens[1]);
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
			type: SlimeNodeType.VariableDeclaration,
			kind,
			declarations,
			loc: cst.loc
		};
	}
	/**
	* 创建 for...in / for...of 语句 AST
	*/
	createForInOfStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ForInOfStatement?.name);
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
				type: SlimeNodeType.VariableDeclaration,
				declarations: [{
					type: SlimeNodeType.VariableDeclarator,
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
				type: SlimeNodeType.VariableDeclaration,
				declarations: [{
					type: SlimeNodeType.VariableDeclarator,
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
				type: SlimeNodeType.VariableDeclaration,
				declarations: [{
					type: SlimeNodeType.VariableDeclarator,
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
			type: isForOf ? SlimeNodeType.ForOfStatement : SlimeNodeType.ForInStatement,
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
		checkCstName(cst, SlimeParser.prototype.WhileStatement?.name);
		let whileToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "While" || child.value === "while") whileToken = SlimeTokenCreate.createWhileToken(child.loc);
			else if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
		}
		const expression = cst.children.find((ch) => ch.name === SlimeParser.prototype.Expression?.name);
		const statement = cst.children.find((ch) => ch.name === SlimeParser.prototype.Statement?.name);
		const test = expression ? this.createExpressionAst(expression) : null;
		const bodyArray = statement ? this.createStatementAst(statement) : [];
		const body = bodyArray.length > 0 ? bodyArray[0] : null;
		return SlimeAstUtil.createWhileStatement(test, body, cst.loc, whileToken, lParenToken, rParenToken);
	}
	/**
	* 创建 do...while 语句 AST
	*/
	createDoWhileStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.DoWhileStatement?.name);
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
			if (name === "Do" || child.value === "do") doToken = SlimeTokenCreate.createDoToken(child.loc);
			else if (name === "While" || child.value === "while") whileToken = SlimeTokenCreate.createWhileToken(child.loc);
			else if (name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
			else if (name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
			else if (name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
			else if (name === SlimeParser.prototype.Statement?.name || name === "Statement") {
				const bodyArray = this.createStatementAst(child);
				body = bodyArray.length > 0 ? bodyArray[0] : null;
			} else if (name === SlimeParser.prototype.Expression?.name || name === "Expression") test = this.createExpressionAst(child);
		}
		return SlimeAstUtil.createDoWhileStatement(body, test, cst.loc, doToken, whileToken, lParenToken, rParenToken, semicolonToken);
	}
	/**
	* 创建 switch 语句 AST
	* SwitchStatement: switch ( Expression ) CaseBlock
	*/
	createSwitchStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.SwitchStatement?.name);
		let switchToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "Switch" || child.value === "switch") switchToken = SlimeTokenCreate.createSwitchToken(child.loc);
			else if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
		}
		const discriminantCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.Expression?.name);
		const discriminant = discriminantCst ? this.createExpressionAst(discriminantCst) : null;
		const caseBlockCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.CaseBlock?.name);
		const cases = caseBlockCst ? this.extractCasesFromCaseBlock(caseBlockCst) : [];
		if (caseBlockCst && caseBlockCst.children) {
			const lBraceCst = caseBlockCst.children.find((ch) => ch.name === "LBrace" || ch.value === "{");
			const rBraceCst = caseBlockCst.children.find((ch) => ch.name === "RBrace" || ch.value === "}");
			if (lBraceCst) lBraceToken = SlimeTokenCreate.createLBraceToken(lBraceCst.loc);
			if (rBraceCst) rBraceToken = SlimeTokenCreate.createRBraceToken(rBraceCst.loc);
		}
		return SlimeAstUtil.createSwitchStatement(discriminant, cases, cst.loc, switchToken, lParenToken, rParenToken, lBraceToken, rBraceToken);
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
		checkCstName(cst, SlimeParser.prototype.Catch?.name);
		let catchToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "Catch" || child.value === "catch") catchToken = SlimeTokenCreate.createCatchToken(child.loc);
			else if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
		}
		const paramCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.CatchParameter?.name);
		const blockCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Block?.name);
		const param = paramCst ? this.createCatchParameterAst(paramCst) : null;
		const body = blockCst ? this.createBlockAst(blockCst) : SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createCatchClause(body, param, cst.loc, catchToken, lParenToken, rParenToken);
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
			type: SlimeNodeType.VariableDeclaration,
			declarations: [{
				type: SlimeNodeType.VariableDeclarator,
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
			for (const child of cst.children || []) if (child.name === "Case" || child.value === "case") caseToken = SlimeTokenCreate.createCaseToken(child.loc);
			else if (child.name === "Colon" || child.value === ":") colonToken = SlimeTokenCreate.createColonToken(child.loc);
			const testCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.Expression?.name);
			test = testCst ? this.createExpressionAst(testCst) : null;
			const stmtListCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.StatementList?.name);
			consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : [];
		} else if (cst.name === SlimeParser.prototype.DefaultClause?.name) {
			for (const child of cst.children || []) if (child.name === "Default" || child.value === "default") defaultToken = SlimeTokenCreate.createDefaultToken(child.loc);
			else if (child.name === "Colon" || child.value === ":") colonToken = SlimeTokenCreate.createColonToken(child.loc);
			test = null;
			const stmtListCst = cst.children?.find((ch) => ch.name === SlimeParser.prototype.StatementList?.name);
			consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : [];
		}
		return SlimeAstUtil.createSwitchCase(consequent, test, cst.loc, caseToken, defaultToken, colonToken);
	}
	/**
	* 创建 try 语句 AST
	*/
	createTryStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.TryStatement?.name);
		let tryToken = void 0;
		let finallyToken = void 0;
		for (const child of cst.children) {
			if (!child) continue;
			if (child.name === "Try" || child.value === "try") tryToken = SlimeTokenCreate.createTryToken(child.loc);
			else if (child.name === "Finally" || child.value === "finally") finallyToken = SlimeTokenCreate.createFinallyToken(child.loc);
		}
		const blockCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Block?.name);
		const catchCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Catch?.name);
		const finallyCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Finally?.name);
		const block = blockCst ? this.createBlockAst(blockCst) : null;
		const handler = catchCst ? this.createCatchAst(catchCst) : null;
		const finalizer = finallyCst ? this.createFinallyAst(finallyCst) : null;
		return SlimeAstUtil.createTryStatement(block, handler, finalizer, cst.loc, tryToken, finallyToken);
	}
	/**
	* 从Block CST创建BlockStatement AST
	* Block: LBrace StatementList? RBrace
	*/
	createBlockAst(cst) {
		checkCstName(cst, SlimeParser.prototype.Block?.name);
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		if (cst.children) {
			for (const child of cst.children) if (child.name === "LBrace" || child.value === "{") lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
			else if (child.name === "RBrace" || child.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
		}
		const statementListCst = cst.children?.find((child) => child.name === SlimeParser.prototype.StatementList?.name);
		const statements = statementListCst ? this.createStatementListAst(statementListCst) : [];
		return SlimeAstUtil.createBlockStatement(statements, cst.loc, lBraceToken, rBraceToken);
	}
	/**
	* 创建 CatchParameter AST
	*/
	createCatchParameterAst(cst) {
		checkCstName(cst, SlimeParser.prototype.CatchParameter?.name);
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.BindingIdentifier?.name) return this.createBindingIdentifierAst(first);
		else if (first.name === SlimeParser.prototype.BindingPattern?.name) return this.createBindingPatternAst(first);
		return null;
	}
	/**
	* 创建 Finally 子句 AST
	*/
	createFinallyAst(cst) {
		checkCstName(cst, SlimeParser.prototype.Finally?.name);
		const blockCst = cst.children.find((ch) => ch.name === SlimeParser.prototype.Block?.name);
		return blockCst ? this.createBlockAst(blockCst) : null;
	}
	/**
	* 创建 throw 语句 AST
	*/
	createThrowStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ThrowStatement?.name);
		let throwToken = void 0;
		let semicolonToken = void 0;
		let argument = null;
		for (const child of cst.children || []) if (child.name === "Throw" || child.value === "throw") throwToken = SlimeTokenCreate.createThrowToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") argument = this.createExpressionAst(child);
		return SlimeAstUtil.createThrowStatement(argument, cst.loc, throwToken, semicolonToken);
	}
	/**
	* 创建 break 语句 AST
	*/
	createBreakStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.BreakStatement?.name);
		let breakToken = void 0;
		let semicolonToken = void 0;
		let label = null;
		for (const child of cst.children || []) if (child.name === "Break" || child.value === "break") breakToken = SlimeTokenCreate.createBreakToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.LabelIdentifier?.name || child.name === "LabelIdentifier") label = this.createLabelIdentifierAst(child);
		else if (child.name === SlimeParser.prototype.IdentifierName?.name) label = this.createIdentifierNameAst(child);
		else if (child.name === SlimeTokenConsumer.prototype.IdentifierName?.name) label = this.createIdentifierAst(child);
		return SlimeAstUtil.createBreakStatement(label, cst.loc, breakToken, semicolonToken);
	}
	/**
	* 创建 continue 语句 AST
	*/
	createContinueStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ContinueStatement?.name);
		let continueToken = void 0;
		let semicolonToken = void 0;
		let label = null;
		for (const child of cst.children || []) if (child.name === "Continue" || child.value === "continue") continueToken = SlimeTokenCreate.createContinueToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
		else if (child.name === SlimeParser.prototype.LabelIdentifier?.name || child.name === "LabelIdentifier") label = this.createLabelIdentifierAst(child);
		else if (child.name === SlimeParser.prototype.IdentifierName?.name) label = this.createIdentifierNameAst(child);
		else if (child.name === SlimeTokenConsumer.prototype.IdentifierName?.name) label = this.createIdentifierAst(child);
		return SlimeAstUtil.createContinueStatement(label, cst.loc, continueToken, semicolonToken);
	}
	/**
	* 创建标签语句 AST
	* ES2025: LabelledStatement -> LabelIdentifier : LabelledItem
	* LabelledItem -> Statement | FunctionDeclaration
	*/
	createLabelledStatementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.LabelledStatement?.name);
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
			type: SlimeNodeType.LabeledStatement,
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
		checkCstName(cst, SlimeParser.prototype.WithStatement?.name);
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
			type: SlimeNodeType.WithStatement,
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
		checkCstName(cst, SlimeParser.prototype.DebuggerStatement?.name);
		let debuggerToken = void 0;
		let semicolonToken = void 0;
		for (const child of cst.children || []) if (child.name === "Debugger" || child.value === "debugger") debuggerToken = SlimeTokenCreate.createDebuggerToken(child.loc);
		else if (child.name === "Semicolon" || child.value === ";") semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc);
		return SlimeAstUtil.createDebuggerStatement(cst.loc, debuggerToken, semicolonToken);
	}
	/**
	* 创建空语�?AST
	*/
	createEmptyStatementAst(cst) {
		let semicolonToken = void 0;
		if (cst.value === ";" || cst.name === SlimeTokenConsumer.prototype.Semicolon?.name) semicolonToken = SlimeTokenCreate.createSemicolonToken(cst.loc);
		else {
			const semicolonCst = cst.children?.find((ch) => ch.name === "Semicolon" || ch.value === ";");
			if (semicolonCst) semicolonToken = SlimeTokenCreate.createSemicolonToken(semicolonCst.loc);
		}
		return SlimeAstUtil.createEmptyStatement(cst.loc, semicolonToken);
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
				functionToken = SlimeTokenCreate.createFunctionToken(child.loc);
				continue;
			}
			if (name === "LParen" || value === "(") {
				lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				continue;
			}
			if (name === "RParen" || value === ")") {
				rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
				continue;
			}
			if (name === "LBrace" || value === "{") {
				lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
				continue;
			}
			if (name === "RBrace" || value === "}") {
				rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
				continue;
			}
			if (name === "Async" || value === "async") {
				asyncToken = SlimeTokenCreate.createAsyncToken(child.loc);
				isAsync = true;
				continue;
			}
			if (name === "Asterisk" || value === "*") {
				asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc);
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
				body = SlimeAstUtil.createBlockStatement(statements, child.loc);
				continue;
			}
		}
		if (!body) body = SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createFunctionDeclaration(functionName, params, body, isGenerator, isAsync, cst.loc, functionToken, asyncToken, asteriskToken, lParenToken, rParenToken, lBraceToken, rBraceToken);
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
					const commaToken = SlimeTokenCreate.createCommaToken(child.loc);
					params.push(SlimeAstUtil.createFunctionParam(currentParam, commaToken));
					hasParam = false;
					currentParam = null;
				}
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameterList?.name || name === "FormalParameterList") {
				if (hasParam) {
					params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
					hasParam = false;
					currentParam = null;
				}
				params.push(...this.createFormalParameterListFromEs2025Wrapped(child));
				continue;
			}
			if (name === SlimeParser.prototype.FunctionRestParameter?.name || name === "FunctionRestParameter") {
				if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
				currentParam = this.createFunctionRestParameterAst(child);
				hasParam = true;
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameter?.name || name === "FormalParameter") {
				if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
				currentParam = this.createFormalParameterAst(child);
				hasParam = true;
				continue;
			}
			if (name === SlimeParser.prototype.BindingElement?.name || name === "BindingElement") {
				if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
				currentParam = this.createBindingElementAst(child);
				hasParam = true;
				continue;
			}
			if (name === SlimeParser.prototype.BindingIdentifier?.name || name === "BindingIdentifier") {
				if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
				currentParam = this.createBindingIdentifierAst(child);
				hasParam = true;
				continue;
			}
		}
		if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
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
					const commaToken = SlimeTokenCreate.createCommaToken(child.loc);
					params.push(SlimeAstUtil.createFunctionParam(currentParam, commaToken));
					hasParam = false;
					currentParam = null;
				}
				continue;
			}
			if (name === SlimeParser.prototype.FormalParameter?.name || name === "FormalParameter") {
				if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
				currentParam = this.createFormalParameterAst(child);
				hasParam = true;
			}
		}
		if (hasParam) params.push(SlimeAstUtil.createFunctionParam(currentParam, void 0));
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
			type: SlimeNodeType.RestElement,
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
				current = SlimeAstUtil.createCallExpression(current, args);
			} else if (child.name === "DotMemberExpression") {
				const dotChild = child.children[0];
				const tokenCst = child.children[1].children[0];
				const property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
				const dotOp = SlimeTokenCreate.createDotToken(dotChild.loc);
				current = SlimeAstUtil.createMemberExpression(current, dotOp, property);
			} else if (child.name === "Dot") {
				const dotOp = SlimeTokenCreate.createDotToken(child.loc);
				const nextChild = cst.children[i + 1];
				let property = null;
				if (nextChild) {
					if (nextChild.name === SlimeParser.prototype.IdentifierName?.name || nextChild.name === "IdentifierName") {
						const tokenCst = nextChild.children[0];
						property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
						i++;
					} else if (nextChild.name === "PrivateIdentifier") {
						property = SlimeAstUtil.createIdentifier(nextChild.value, nextChild.loc);
						i++;
					}
				}
				current = SlimeAstUtil.createMemberExpression(current, dotOp, property);
			} else if (child.name === "BracketExpression") {
				const propertyExpression = this.createExpressionAst(child.children[1]);
				current = {
					type: SlimeNodeType.MemberExpression,
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
						type: SlimeNodeType.MemberExpression,
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
		checkCstName(cst, SlimeParser.prototype.SuperCall?.name);
		const argumentsCst = cst.children[1];
		const argumentsAst = this.createArgumentsAst(argumentsCst);
		const superNode = {
			type: "Super",
			loc: cst.children[0].loc
		};
		return SlimeAstUtil.createCallExpression(superNode, argumentsAst);
	}
	/**
	* 创建 ImportCall AST
	* ImportCall: import ( AssignmentExpression ,_opt )
	*           | import ( AssignmentExpression , AssignmentExpression ,_opt )
	*/
	createImportCallAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ImportCall?.name);
		const args = [];
		for (const child of cst.children) if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
			const expr = this.createAssignmentExpressionAst(child);
			args.push(SlimeAstUtil.createCallArgument(expr));
		}
		const importIdentifier = SlimeAstUtil.createIdentifier("import", cst.children[0].loc);
		return SlimeAstUtil.createCallExpression(importIdentifier, args);
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
				type: SlimeNodeType.MemberExpression,
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
				type: SlimeNodeType.MemberExpression,
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
				property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
			} else property = SlimeAstUtil.createIdentifier(identifierNameCst.value, identifierNameCst.loc);
			return {
				type: SlimeNodeType.MemberExpression,
				object: superNode,
				property,
				computed: false,
				optional: false,
				loc: cst.loc
			};
		} else {
			const propToken = cst.children[2];
			const property = SlimeAstUtil.createIdentifier(propToken.value, propToken.loc);
			return {
				type: SlimeNodeType.MemberExpression,
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
			meta: SlimeAstUtil.createIdentifier("new", first.loc),
			property: SlimeAstUtil.createIdentifier("target", first.loc),
			loc: cst.loc
		};
		else return {
			type: "MetaProperty",
			meta: SlimeAstUtil.createIdentifier("import", first.loc),
			property: SlimeAstUtil.createIdentifier("meta", first.loc),
			loc: cst.loc
		};
	}
	createArgumentsAst(cst) {
		checkCstName(cst, SlimeParser.prototype.Arguments?.name);
		const first1 = cst.children[1];
		if (first1) {
			if (first1.name === SlimeParser.prototype.ArgumentList?.name) return this.createArgumentListAst(first1);
		}
		return [];
	}
	createArgumentListAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ArgumentList?.name);
		const arguments_ = [];
		let currentArg = null;
		let hasArg = false;
		let pendingEllipsis = null;
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === "Ellipsis" || child.name === "Ellipsis") pendingEllipsis = child;
			else if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
				if (hasArg) arguments_.push(SlimeAstUtil.createCallArgument(currentArg, void 0));
				const expr = this.createAssignmentExpressionAst(child);
				if (pendingEllipsis) {
					const ellipsisToken = SlimeTokenCreate.createEllipsisToken(pendingEllipsis.loc);
					currentArg = SlimeAstUtil.createSpreadElement(expr, child.loc, ellipsisToken);
					pendingEllipsis = null;
				} else currentArg = expr;
				hasArg = true;
			} else if (child.name === SlimeParser.prototype.SpreadElement?.name) {
				if (hasArg) arguments_.push(SlimeAstUtil.createCallArgument(currentArg, void 0));
				currentArg = this.createSpreadElementAst(child);
				hasArg = true;
			} else if (child.name === "Comma" || child.value === ",") {
				const commaToken = SlimeTokenCreate.createCommaToken(child.loc);
				if (hasArg) {
					arguments_.push(SlimeAstUtil.createCallArgument(currentArg, commaToken));
					hasArg = false;
					currentArg = null;
				}
			}
		}
		if (hasArg) arguments_.push(SlimeAstUtil.createCallArgument(currentArg, void 0));
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
			if (newCst && (newCst.name === "New" || newCst.value === "new")) newToken = SlimeTokenCreate.createNewToken(newCst.loc);
			const argsCst = cst.children[2];
			if (argsCst && argsCst.children) {
				for (const child of argsCst.children) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
			}
			const calleeExpression = this.createMemberExpressionAst(cst.children[1]);
			const args = this.createArgumentsAst(cst.children[2]);
			return SlimeAstUtil.createNewExpression(calleeExpression, args, cst.loc, newToken, lParenToken, rParenToken);
		} else {
			const firstChild = cst.children[0];
			if (firstChild.name === "New" || firstChild.value === "new") {
				const newToken = SlimeTokenCreate.createNewToken(firstChild.loc);
				const innerNewExpr = cst.children[1];
				const calleeExpression = this.createNewExpressionAst(innerNewExpr);
				return SlimeAstUtil.createNewExpression(calleeExpression, [], cst.loc, newToken, void 0, void 0);
			} else return this.createExpressionAst(firstChild);
		}
	}
	createMemberExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.MemberExpression?.name);
		if (cst.children.length === 0) throw new Error("MemberExpression has no children");
		let current;
		let startIdx = 1;
		if (cst.children[0].name === "New") {
			const newCst = cst.children[0];
			const memberExprCst = cst.children[1];
			const argsCst = cst.children[2];
			const callee = this.createMemberExpressionAst(memberExprCst);
			const args = argsCst ? this.createArgumentsAst(argsCst) : [];
			const newToken = SlimeTokenCreate.createNewToken(newCst.loc);
			let lParenToken = void 0;
			let rParenToken = void 0;
			if (argsCst && argsCst.children) {
				for (const child of argsCst.children) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
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
				const dotToken = SlimeTokenCreate.createDotToken(child.children[0].loc);
				let property = null;
				if (child.children[1]) {
					const identifierNameCst = child.children[1];
					if (identifierNameCst.name === SlimeParser.prototype.IdentifierName?.name) {
						const tokenCst = identifierNameCst.children[0];
						property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
					} else property = this.createIdentifierAst(identifierNameCst);
				}
				current = SlimeAstUtil.createMemberExpression(current, dotToken, property);
			} else if (child.name === "Dot") {
				const dotToken = SlimeTokenCreate.createDotToken(child.loc);
				const nextChild = cst.children[i + 1];
				let property = null;
				if (nextChild) {
					if (nextChild.name === SlimeParser.prototype.IdentifierName?.name || nextChild.name === "IdentifierName") {
						const tokenCst = nextChild.children[0];
						property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
						i++;
					} else if (nextChild.name === "PrivateIdentifier") {
						property = SlimeAstUtil.createIdentifier(nextChild.value, nextChild.loc);
						i++;
					}
				}
				current = SlimeAstUtil.createMemberExpression(current, dotToken, property);
			} else if (child.name === "BracketExpression") {
				const propertyExpression = this.createExpressionAst(child.children[1]);
				current = {
					type: SlimeNodeType.MemberExpression,
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
						type: SlimeNodeType.MemberExpression,
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
				current = SlimeAstUtil.createCallExpression(current, args);
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
			const eqAst = SlimeTokenCreate.createAssignToken(eqCst.loc);
			const initCst = varCst.children[1];
			if (initCst) if (initCst.name === SlimeParser.prototype.AssignmentExpression?.name) {
				const init = this.createAssignmentExpressionAst(initCst);
				variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst, init);
			} else {
				const init = this.createExpressionAst(initCst);
				variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst, init);
			}
			else variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst);
		} else variableDeclarator = SlimeAstUtil.createVariableDeclarator(id);
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
			type: SlimeNodeType.AssignmentPattern,
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
					type: SlimeNodeType.OptionalCallExpression,
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
						type: SlimeNodeType.OptionalMemberExpression,
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
				property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc);
				result = {
					type: SlimeNodeType.OptionalMemberExpression,
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
					type: SlimeNodeType.OptionalMemberExpression,
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
				type: SlimeNodeType.LogicalExpression,
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
			type: SlimeNodeType.BinaryExpression,
			operator: "**",
			left,
			right
		};
	}
	createLogicalORExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.LogicalORExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.LogicalExpression,
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
		checkCstName(cst, SlimeParser.prototype.LogicalANDExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.LogicalExpression,
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
		checkCstName(cst, SlimeParser.prototype.BitwiseORExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.BitwiseXORExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.BitwiseANDExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.EqualityExpression?.name);
		if (cst.children.length > 1) {
			const left = this.createExpressionAst(cst.children[0]);
			const operator = cst.children[1].value;
			const right = this.createExpressionAst(cst.children[2]);
			return {
				type: SlimeNodeType.BinaryExpression,
				operator,
				left,
				right,
				loc: cst.loc
			};
		}
		return this.createExpressionAst(cst.children[0]);
	}
	createRelationalExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.RelationalExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.ShiftExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.AdditiveExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.MultiplicativeExpression?.name);
		if (cst.children.length > 1) {
			let left = this.createExpressionAst(cst.children[0]);
			for (let i = 1; i < cst.children.length; i += 2) {
				const operatorNode = cst.children[i];
				const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value;
				const right = this.createExpressionAst(cst.children[i + 1]);
				left = {
					type: SlimeNodeType.BinaryExpression,
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
		checkCstName(cst, SlimeParser.prototype.UnaryExpression?.name);
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
			type: SlimeNodeType.UnaryExpression,
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
					type: SlimeNodeType.UpdateExpression,
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
					type: SlimeNodeType.UpdateExpression,
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
		checkCstName(cst, SlimeParser.prototype.LeftHandSideExpression?.name);
		if (!cst.children || cst.children.length === 0) return SlimeAstUtil.createIdentifier("", cst.loc);
		if (cst.children.length > 1) {}
		return this.createExpressionAst(cst.children[0]);
	}
	createPrimaryExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.PrimaryExpression?.name);
		const first = cst.children[0];
		if (first.name === SlimeParser.prototype.IdentifierReference?.name) return this.createIdentifierAst(first.children[0]);
		else if (first.name === SlimeParser.prototype.Literal?.name) return this.createLiteralAst(first);
		else if (first.name === SlimeParser.prototype.ArrayLiteral?.name) return this.createArrayLiteralAst(first);
		else if (first.name === SlimeParser.prototype.FunctionExpression?.name) return this.createFunctionExpressionAst(first);
		else if (first.name === SlimeParser.prototype.ObjectLiteral?.name) return this.createObjectLiteralAst(first);
		else if (first.name === SlimeParser.prototype.ClassExpression?.name) return this.createClassExpressionAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.This?.name) return SlimeAstUtil.createThisExpression(first.loc);
		else if (first.name === SlimeTokenConsumer.prototype.RegularExpressionLiteral?.name) return this.createRegExpLiteralAst(first);
		else if (first.name === SlimeParser.prototype.GeneratorExpression?.name || first.name === "GeneratorExpression") return this.createGeneratorExpressionAst(first);
		else if (first.name === SlimeParser.prototype.AsyncFunctionExpression?.name || first.name === "AsyncFunctionExpression") return this.createAsyncFunctionExpressionAst(first);
		else if (first.name === SlimeParser.prototype.AsyncGeneratorExpression?.name || first.name === "AsyncGeneratorExpression") return this.createAsyncGeneratorExpressionAst(first);
		else if (first.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name || first.name === "CoverParenthesizedExpressionAndArrowParameterList") {
			if (!first.children || first.children.length === 0) return SlimeAstUtil.createIdentifier("undefined", first.loc);
			if (first.children.length === 2) return SlimeAstUtil.createIdentifier("undefined", first.loc);
			const middleCst = first.children[1];
			if (!middleCst) return SlimeAstUtil.createIdentifier("undefined", first.loc);
			if (middleCst.name === SlimeParser.prototype.Expression?.name || middleCst.name === "Expression") {
				const innerExpr = this.createExpressionAst(middleCst);
				return SlimeAstUtil.createParenthesizedExpression(innerExpr, first.loc);
			}
			if (middleCst.name === SlimeParser.prototype.AssignmentExpression?.name || middleCst.name === "AssignmentExpression") {
				const innerExpr = this.createExpressionAst(middleCst);
				return SlimeAstUtil.createParenthesizedExpression(innerExpr, first.loc);
			}
			if (middleCst.name === SlimeParser.prototype.FormalParameterList?.name || middleCst.name === "FormalParameterList") {
				const params = this.createFormalParameterListAst(middleCst);
				if (params.length === 1 && params[0].type === SlimeNodeType.Identifier) return SlimeAstUtil.createParenthesizedExpression(params[0], first.loc);
				if (params.length > 1) {
					const expressions = params.map((p) => p);
					return SlimeAstUtil.createParenthesizedExpression({
						type: "SequenceExpression",
						expressions
					}, first.loc);
				}
				return SlimeAstUtil.createIdentifier("undefined", first.loc);
			}
			try {
				const innerExpr = this.createExpressionAst(middleCst);
				return SlimeAstUtil.createParenthesizedExpression(innerExpr, first.loc);
			} catch (e) {
				return SlimeAstUtil.createIdentifier("undefined", first.loc);
			}
		} else if (first.name === SlimeParser.prototype.TemplateLiteral?.name) return this.createTemplateLiteralAst(first);
		else if (first.name === SlimeParser.prototype.ParenthesizedExpression?.name) {
			const expressionCst = first.children[1];
			const innerExpression = this.createExpressionAst(expressionCst);
			return SlimeAstUtil.createParenthesizedExpression(innerExpression, first.loc);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createFunctionExpression(body, id, params, true, false, cst.loc);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createFunctionExpression(body, id, params, false, true, cst.loc);
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
			body = SlimeAstUtil.createBlockStatement(bodyStatements, bodyNode.loc);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return SlimeAstUtil.createFunctionExpression(body, id, params, true, true, cst.loc);
	}
	createTemplateLiteralAst(cst) {
		checkCstName(cst, SlimeParser.prototype.TemplateLiteral?.name);
		const first = cst.children[0];
		if (first.name === SlimeTokenConsumer.prototype.NoSubstitutionTemplate?.name || first.name === "NoSubstitutionTemplate") {
			const raw = first.value || "``";
			const cooked = raw.slice(1, -1);
			const quasis$1 = [SlimeAstUtil.createTemplateElement(true, raw, cooked, first.loc)];
			return SlimeAstUtil.createTemplateLiteral(quasis$1, [], cst.loc);
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
				quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, child.loc));
			} else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") expressions.push(this.createExpressionAst(child));
			else if (child.name === SlimeParser.prototype.TemplateSpans?.name || child.name === "TemplateSpans") this.processTemplateSpans(child, quasis, expressions);
		}
		return SlimeAstUtil.createTemplateLiteral(quasis, expressions, cst.loc);
	}
	processTemplateSpans(cst, quasis, expressions) {
		const first = cst.children[0];
		if (first.name === SlimeTokenConsumer.prototype.TemplateTail?.name) {
			const raw = first.value || "";
			const cooked = raw.slice(1, -1);
			quasis.push(SlimeAstUtil.createTemplateElement(true, raw, cooked, first.loc));
			return;
		}
		if (first.name === SlimeParser.prototype.TemplateMiddleList?.name) {
			this.processTemplateMiddleList(first, quasis, expressions);
			if (cst.children[1] && cst.children[1].name === SlimeTokenConsumer.prototype.TemplateTail?.name) {
				const tail = cst.children[1];
				const raw = tail.value || "";
				const cooked = raw.slice(1, -1);
				quasis.push(SlimeAstUtil.createTemplateElement(true, raw, cooked, tail.loc));
			}
		}
	}
	processTemplateMiddleList(cst, quasis, expressions) {
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === SlimeTokenConsumer.prototype.TemplateMiddle?.name || child.name === "TemplateMiddle") {
				const raw = child.value || "";
				const cooked = raw.slice(1, -2);
				quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, child.loc));
			} else if (child.name === SlimeParser.prototype.Expression?.name || child.name === "Expression") expressions.push(this.createExpressionAst(child));
			else if (child.name === SlimeParser.prototype.TemplateMiddleList?.name || child.name === "TemplateMiddleList") this.processTemplateMiddleList(child, quasis, expressions);
		}
	}
	createClassExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ClassExpression?.name);
		let id = null;
		let tailStartIndex = 1;
		const nextChild = cst.children[1];
		if (nextChild && nextChild.name === SlimeParser.prototype.BindingIdentifier?.name) {
			id = this.createBindingIdentifierAst(nextChild);
			tailStartIndex = 2;
		}
		const classTail = this.createClassTailAst(cst.children[tailStartIndex]);
		return SlimeAstUtil.createClassExpression(id, classTail.superClass, classTail.body, cst.loc);
	}
	createPropertyDefinitionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.PropertyDefinition?.name);
		if (!cst.children || cst.children.length === 0) throw new Error("PropertyDefinition CST has no children - this should not happen for valid syntax");
		const first = cst.children[0];
		if (first.name === "Ellipsis" || first.value === "...") {
			const AssignmentExpressionCst = cst.children[1];
			const argument = this.createAssignmentExpressionAst(AssignmentExpressionCst);
			return {
				type: SlimeNodeType.SpreadElement,
				argument,
				loc: cst.loc
			};
		} else if (cst.children.length > 2) {
			const PropertyNameCst = cst.children[0];
			const AssignmentExpressionCst = cst.children[2];
			const key = this.createPropertyNameAst(PropertyNameCst);
			const value = this.createAssignmentExpressionAst(AssignmentExpressionCst);
			const keyAst = SlimeAstUtil.createPropertyAst(key, value);
			if (PropertyNameCst.children[0].name === SlimeParser.prototype.ComputedPropertyName?.name) keyAst.computed = true;
			return keyAst;
		} else if (first.name === SlimeParser.prototype.MethodDefinition?.name) {
			const SlimeMethodDefinition$1 = this.createMethodDefinitionAst(null, first);
			const keyAst = SlimeAstUtil.createPropertyAst(SlimeMethodDefinition$1.key, SlimeMethodDefinition$1.value);
			if (SlimeMethodDefinition$1.computed) keyAst.computed = true;
			if (SlimeMethodDefinition$1.kind === "get" || SlimeMethodDefinition$1.kind === "set") keyAst.kind = SlimeMethodDefinition$1.kind;
			else keyAst.method = true;
			return keyAst;
		} else if (first.name === SlimeParser.prototype.IdentifierReference?.name) {
			const identifierCst = first.children[0];
			const identifier = this.createIdentifierAst(identifierCst);
			const keyAst = SlimeAstUtil.createPropertyAst(identifier, identifier);
			keyAst.shorthand = true;
			return keyAst;
		} else if (first.name === "CoverInitializedName") {
			const identifierRefCst = first.children[0];
			const initializerCst = first.children[1];
			const identifierCst = identifierRefCst.children[0];
			const identifier = this.createIdentifierAst(identifierCst);
			const defaultValue = this.createAssignmentExpressionAst(initializerCst.children[1]);
			const assignmentPattern = {
				type: SlimeNodeType.AssignmentPattern,
				left: identifier,
				right: defaultValue,
				loc: first.loc
			};
			const keyAst = SlimeAstUtil.createPropertyAst(identifier, assignmentPattern);
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
			if (first.value !== void 0) return SlimeAstUtil.createIdentifier(first.value, first.loc);
			let current = first;
			while (current.children && current.children.length > 0 && current.value === void 0) current = current.children[0];
			if (current.value !== void 0) return SlimeAstUtil.createIdentifier(current.value, current.loc || first.loc);
			throw new Error(`createLiteralPropertyNameAst: Cannot extract value from IdentifierName`);
		} else if (first.name === "Identifier" || first.name === SlimeParser.prototype.Identifier?.name) return this.createIdentifierAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.NumericLiteral?.name || first.name === "NumericLiteral" || first.name === "Number") return this.createNumericLiteralAst(first);
		else if (first.name === SlimeTokenConsumer.prototype.StringLiteral?.name || first.name === "StringLiteral" || first.name === "String") return this.createStringLiteralAst(first);
		else if (first.value !== void 0) return SlimeAstUtil.createIdentifier(first.value, first.loc);
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
		return SlimeAstUtil.createNumericLiteral(Number(rawValue), rawValue);
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
		return SlimeAstUtil.createStringLiteral(rawValue, cst.loc, rawValue);
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
				type: SlimeNodeType.Literal,
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
			type: SlimeNodeType.Literal,
			value: rawValue,
			raw: rawValue,
			loc: cst.loc
		};
	}
	createLiteralFromToken(token) {
		const tokenName = token.tokenName;
		if (tokenName === SlimeTokenConsumer.prototype.NullLiteral?.name) return SlimeAstUtil.createNullLiteralToken();
		else if (tokenName === SlimeTokenConsumer.prototype.True?.name) return SlimeAstUtil.createBooleanLiteral(true);
		else if (tokenName === SlimeTokenConsumer.prototype.False?.name) return SlimeAstUtil.createBooleanLiteral(false);
		else if (tokenName === SlimeTokenConsumer.prototype.NumericLiteral?.name) return SlimeAstUtil.createNumericLiteral(Number(token.tokenValue));
		else if (tokenName === SlimeTokenConsumer.prototype.StringLiteral?.name) return SlimeAstUtil.createStringLiteral(token.tokenValue);
		else throw new Error(`Unsupported literal token: ${tokenName}`);
	}
	createElementListAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ElementList?.name);
		const elements = [];
		let currentElement = null;
		let hasElement = false;
		for (let i = 0; i < cst.children.length; i++) {
			const child = cst.children[i];
			if (child.name === SlimeParser.prototype.AssignmentExpression?.name) {
				if (hasElement) elements.push(SlimeAstUtil.createArrayElement(currentElement, void 0));
				currentElement = this.createAssignmentExpressionAst(child);
				hasElement = true;
			} else if (child.name === SlimeParser.prototype.SpreadElement?.name) {
				if (hasElement) elements.push(SlimeAstUtil.createArrayElement(currentElement, void 0));
				currentElement = this.createSpreadElementAst(child);
				hasElement = true;
			} else if (child.name === SlimeParser.prototype.Elision?.name) {
				const elisionCommas = child.children?.filter((c) => c.name === "Comma" || c.value === ",") || [];
				for (let j = 0; j < elisionCommas.length; j++) if (hasElement) {
					const commaToken = SlimeTokenCreate.createCommaToken(elisionCommas[j].loc);
					elements.push(SlimeAstUtil.createArrayElement(currentElement, commaToken));
					hasElement = false;
					currentElement = null;
				} else {
					const commaToken = SlimeTokenCreate.createCommaToken(elisionCommas[j].loc);
					elements.push(SlimeAstUtil.createArrayElement(null, commaToken));
				}
			} else if (child.name === "Comma" || child.value === ",") {
				const commaToken = SlimeTokenCreate.createCommaToken(child.loc);
				elements.push(SlimeAstUtil.createArrayElement(currentElement, commaToken));
				hasElement = false;
				currentElement = null;
			}
		}
		if (hasElement) elements.push(SlimeAstUtil.createArrayElement(currentElement, void 0));
		return elements;
	}
	createSpreadElementAst(cst) {
		checkCstName(cst, SlimeParser.prototype.SpreadElement?.name);
		let ellipsisToken = void 0;
		const ellipsisCst = cst.children.find((ch) => ch.name === "Ellipsis" || ch.name === "Ellipsis" || ch.value === "...");
		if (ellipsisCst) ellipsisToken = SlimeTokenCreate.createEllipsisToken(ellipsisCst.loc);
		const expression = cst.children.find((ch) => ch.name === SlimeParser.prototype.AssignmentExpression?.name);
		if (!expression) throw new Error("SpreadElement missing AssignmentExpression");
		return SlimeAstUtil.createSpreadElement(this.createAssignmentExpressionAst(expression), cst.loc, ellipsisToken);
	}
	/**
	* 布尔字面�?CST �?AST
	* BooleanLiteral -> true | false
	*/
	createBooleanLiteralAst(cst) {
		const firstChild = cst.children?.[0];
		if (firstChild?.name === "True" || firstChild?.value === "true") {
			const lit = SlimeAstUtil.createBooleanLiteral(true);
			lit.loc = firstChild.loc || cst.loc;
			return lit;
		} else {
			const lit = SlimeAstUtil.createBooleanLiteral(false);
			lit.loc = firstChild?.loc || cst.loc;
			return lit;
		}
	}
	/**
	* ArrayLiteral CST �?ArrayExpression AST
	* ArrayLiteral -> [ Elision? ] | [ ElementList ] | [ ElementList , Elision? ]
	*/
	createArrayLiteralAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ArrayLiteral?.name);
		let lBracketToken = void 0;
		let rBracketToken = void 0;
		if (cst.children && cst.children.length > 0) {
			const firstChild = cst.children[0];
			if (firstChild && (firstChild.name === "LBracket" || firstChild.value === "[")) lBracketToken = SlimeTokenCreate.createLBracketToken(firstChild.loc);
			const lastChild = cst.children[cst.children.length - 1];
			if (lastChild && (lastChild.name === "RBracket" || lastChild.value === "]")) rBracketToken = SlimeTokenCreate.createRBracketToken(lastChild.loc);
		}
		const elementList = cst.children.find((ch) => ch.name === SlimeParser.prototype.ElementList?.name);
		const elements = elementList ? this.createElementListAst(elementList) : [];
		for (const child of cst.children) if (child.name === "Comma" || child.value === ",") {} else if (child.name === SlimeParser.prototype.Elision?.name || child.name === "Elision") {
			const elisionCommas = child.children?.filter((c) => c.name === "Comma" || c.value === ",") || [];
			for (let j = 0; j < elisionCommas.length; j++) {
				const commaToken = SlimeTokenCreate.createCommaToken(elisionCommas[j].loc);
				elements.push(SlimeAstUtil.createArrayElement(null, commaToken));
			}
		}
		return SlimeAstUtil.createArrayExpression(elements, cst.loc, lBracketToken, rBracketToken);
	}
	/**
	* 对象字面�?CST �?AST（透传�?ObjectExpression�?
	* ObjectLiteral -> { } | { PropertyDefinitionList } | { PropertyDefinitionList , }
	*/
	createObjectLiteralAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ObjectLiteral?.name);
		const properties = [];
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		if (cst.children && cst.children.length > 0) {
			const firstChild = cst.children[0];
			if (firstChild && (firstChild.name === "LBrace" || firstChild.value === "{")) lBraceToken = SlimeTokenCreate.createLBraceToken(firstChild.loc);
			const lastChild = cst.children[cst.children.length - 1];
			if (lastChild && (lastChild.name === "RBrace" || lastChild.value === "}")) rBraceToken = SlimeTokenCreate.createRBraceToken(lastChild.loc);
		}
		if (cst.children.length > 2) {
			const PropertyDefinitionListCst = cst.children[1];
			let currentProperty = null;
			let hasProperty = false;
			for (const child of PropertyDefinitionListCst.children) if (child.name === SlimeParser.prototype.PropertyDefinition?.name && child.children && child.children.length > 0) {
				if (hasProperty) properties.push(SlimeAstUtil.createObjectPropertyItem(currentProperty, void 0));
				currentProperty = this.createPropertyDefinitionAst(child);
				hasProperty = true;
			} else if (child.name === "Comma" || child.value === ",") {
				const commaToken = SlimeTokenCreate.createCommaToken(child.loc);
				if (hasProperty) {
					properties.push(SlimeAstUtil.createObjectPropertyItem(currentProperty, commaToken));
					hasProperty = false;
					currentProperty = null;
				}
			}
			if (hasProperty) properties.push(SlimeAstUtil.createObjectPropertyItem(currentProperty, void 0));
		}
		return SlimeAstUtil.createObjectExpression(properties, cst.loc, lBraceToken, rBraceToken);
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
		checkCstName(cst, SlimeParser.prototype.Literal?.name);
		const firstChild = cst.children[0];
		let value;
		const childName = firstChild.name;
		if (childName === SlimeTokenConsumer.prototype.NumericLiteral?.name || childName === "NumericLiteral") {
			const rawValue = firstChild.value;
			value = SlimeAstUtil.createNumericLiteral(Number(rawValue), rawValue);
		} else if (childName === SlimeTokenConsumer.prototype.True?.name || childName === "True") value = SlimeAstUtil.createBooleanLiteral(true);
		else if (childName === SlimeTokenConsumer.prototype.False?.name || childName === "False") value = SlimeAstUtil.createBooleanLiteral(false);
		else if (childName === SlimeTokenConsumer.prototype.NullLiteral?.name || childName === "NullLiteral" || childName === "Null") value = SlimeAstUtil.createNullLiteralToken();
		else if (childName === SlimeTokenConsumer.prototype.StringLiteral?.name || childName === "StringLiteral") {
			const rawValue = firstChild.value;
			value = SlimeAstUtil.createStringLiteral(rawValue, firstChild.loc, rawValue);
		} else if (childName === "BooleanLiteral" || childName === SlimeParser.prototype.BooleanLiteral?.name) {
			const innerChild = firstChild.children?.[0];
			if (innerChild?.name === "True" || innerChild?.value === "true") value = SlimeAstUtil.createBooleanLiteral(true);
			else value = SlimeAstUtil.createBooleanLiteral(false);
			value.loc = innerChild?.loc || firstChild.loc;
			return value;
		} else if (childName === "NullLiteral") value = SlimeAstUtil.createNullLiteralToken();
		else if (childName === "BigIntLiteral") {
			const rawValue = firstChild.value || firstChild.children?.[0]?.value;
			const numStr = rawValue.endsWith("n") ? rawValue.slice(0, -1) : rawValue;
			value = SlimeAstUtil.createBigIntLiteral(numStr, rawValue);
		} else {
			const rawValue = firstChild.value;
			if (rawValue !== void 0) value = SlimeAstUtil.createStringLiteral(rawValue, firstChild.loc, rawValue);
			else {
				const innerChild = firstChild.children?.[0];
				if (innerChild?.value) value = SlimeAstUtil.createStringLiteral(innerChild.value, innerChild.loc, innerChild.value);
				else throw new Error(`Cannot extract value from Literal: ${childName}`);
			}
		}
		value.loc = firstChild.loc;
		return value;
	}
	createAssignmentExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.AssignmentExpression?.name);
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
		checkCstName(cst, SlimeParser.prototype.ArrowFunction?.name);
		let asyncToken = void 0;
		let arrowToken = void 0;
		let lParenToken = void 0;
		let rParenToken = void 0;
		const commaTokens = [];
		let offset = 0;
		let isAsync = false;
		if (cst.children[0] && cst.children[0].name === "Async") {
			asyncToken = SlimeTokenCreate.createAsyncToken(cst.children[0].loc);
			isAsync = true;
			offset = 1;
		}
		if (!cst.children || cst.children.length < 3 + offset) throw new Error(`createArrowFunctionAst: 期望${3 + offset}个children，实�?{cst.children?.length || 0}个`);
		const arrowParametersCst = cst.children[0 + offset];
		const arrowCst = cst.children[1 + offset];
		const conciseBodyCst = cst.children[2 + offset];
		if (arrowCst && (arrowCst.name === "Arrow" || arrowCst.value === "=>")) arrowToken = SlimeTokenCreate.createArrowToken(arrowCst.loc);
		let params;
		if (arrowParametersCst.name === SlimeParser.prototype.BindingIdentifier?.name) params = [{ param: this.createBindingIdentifierAst(arrowParametersCst) }];
		else if (arrowParametersCst.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
			for (const child of arrowParametersCst.children || []) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
			else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
			else if (child.name === "Comma" || child.value === ",") commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc));
			params = this.createArrowParametersFromCoverGrammar(arrowParametersCst).map((p, i) => ({
				param: p,
				commaToken: commaTokens[i]
			}));
		} else if (arrowParametersCst.name === SlimeParser.prototype.ArrowParameters?.name) {
			const firstChild = arrowParametersCst.children?.[0];
			if (firstChild?.name === SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
				for (const child of firstChild.children || []) if (child.name === "LParen" || child.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(child.loc);
				else if (child.name === "RParen" || child.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(child.loc);
				else if (child.name === "Comma" || child.value === ",") commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc));
			}
			params = this.createArrowParametersAst(arrowParametersCst).map((p, i) => ({
				param: p,
				commaToken: commaTokens[i]
			}));
		} else throw new Error(`createArrowFunctionAst: 不支持的参数类型 ${arrowParametersCst.name}`);
		const body = this.createConciseBodyAst(conciseBodyCst);
		return SlimeAstUtil.createArrowFunctionExpression(body, params, body.type !== SlimeNodeType.BlockStatement, isAsync, cst.loc, arrowToken, asyncToken, lParenToken, rParenToken);
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
			arrowToken = SlimeTokenCreate.createArrowToken(cst.children[i].loc);
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
				type: SlimeNodeType.ArrowFunctionExpression,
				id: null,
				params,
				body: SlimeAstUtil.createBlockStatement([]),
				generator: false,
				async: true,
				expression: false,
				loc: cst.loc
			};
		}
		for (let i = 0; i < arrowIndex; i++) {
			const child = cst.children[i];
			if (child.name === "Async" || child.name === "IdentifierName" && child.value === "async") {
				asyncToken = SlimeTokenCreate.createAsyncToken(child.loc);
				continue;
			}
			if (child.name === SlimeParser.prototype.BindingIdentifier?.name || child.name === "BindingIdentifier") params = [this.createBindingIdentifierAst(child)];
			else if (child.name === "AsyncArrowBindingIdentifier" || child.name === SlimeParser.prototype.AsyncArrowBindingIdentifier?.name) {
				const bindingId = child.children?.find((c) => c.name === "BindingIdentifier" || c.name === SlimeParser.prototype.BindingIdentifier?.name) || child.children?.[0];
				if (bindingId) params = [this.createBindingIdentifierAst(bindingId)];
			} else if (child.name === "CoverCallExpressionAndAsyncArrowHead") {
				params = this.createAsyncArrowParamsFromCover(child);
				for (const subChild of child.children || []) if (subChild.name === "Arguments" || subChild.name === SlimeParser.prototype.Arguments?.name) {
					for (const argChild of subChild.children || []) if (argChild.name === "LParen" || argChild.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(argChild.loc);
					else if (argChild.name === "RParen" || argChild.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(argChild.loc);
				}
			} else if (child.name === SlimeParser.prototype.ArrowFormalParameters?.name || child.name === "ArrowFormalParameters") {
				params = this.createArrowFormalParametersAst(child);
				for (const subChild of child.children || []) if (subChild.name === "LParen" || subChild.value === "(") lParenToken = SlimeTokenCreate.createLParenToken(subChild.loc);
				else if (subChild.name === "RParen" || subChild.value === ")") rParenToken = SlimeTokenCreate.createRParenToken(subChild.loc);
			}
		}
		const bodyIndex = arrowIndex + 1;
		if (bodyIndex < cst.children.length) {
			const bodyCst = cst.children[bodyIndex];
			if (bodyCst.name === "AsyncConciseBody" || bodyCst.name === "ConciseBody") body = this.createConciseBodyAst(bodyCst);
			else body = this.createExpressionAst(bodyCst);
		} else body = SlimeAstUtil.createBlockStatement([]);
		return {
			type: SlimeNodeType.ArrowFunctionExpression,
			id: null,
			params,
			body,
			generator: false,
			async: true,
			expression: body.type !== SlimeNodeType.BlockStatement,
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
				if (expr$1.type === SlimeNodeType.AssignmentExpression) return this.convertAssignmentExpressionToPattern(expr$1);
			}
		}
		const findInnerExpr = (node) => {
			if (!node.children || node.children.length === 0) return node;
			const first = node.children[0];
			if (first.name === "ObjectLiteral" || first.name === "ArrayLiteral" || first.name === "IdentifierReference" || first.name === "Identifier" || first.name === "BindingIdentifier") return first;
			return findInnerExpr(first);
		};
		const inner = findInnerExpr(cst);
		if (inner.name === "ObjectLiteral") return this.convertObjectLiteralToPattern(inner);
		else if (inner.name === "ArrayLiteral") return this.convertArrayLiteralToPattern(inner);
		else if (inner.name === "IdentifierReference" || inner.name === "Identifier") {
			const identifierName = (inner.name === "IdentifierReference" ? findInnerExpr(inner) : inner).children?.[0];
			if (identifierName) return SlimeAstUtil.createIdentifier(identifierName.value, identifierName.loc);
		} else if (inner.name === "BindingIdentifier") return this.createBindingIdentifierAst(inner);
		const expr = this.createExpressionAst(cst);
		if (expr.type === SlimeNodeType.Identifier) return expr;
		else if (expr.type === SlimeNodeType.ObjectExpression) return this.convertObjectExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType.ArrayExpression) return this.convertArrayExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType.AssignmentExpression) return this.convertAssignmentExpressionToPattern(expr);
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
		if (hasEllipsis) return SlimeAstUtil.createRestElement(basePattern);
		return basePattern;
	}
	/**
	* �?ObjectLiteral CST 转换�?ObjectPattern
	*/
	convertObjectLiteralToPattern(cst) {
		const properties = [];
		let lBraceToken = void 0;
		let rBraceToken = void 0;
		for (const child of cst.children || []) if (child.value === "{") lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc);
		else if (child.value === "}") rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc);
		else if (child.name === "PropertyDefinitionList") for (const prop of child.children || []) {
			if (prop.value === ",") {
				if (properties.length > 0 && !properties[properties.length - 1].commaToken) properties[properties.length - 1].commaToken = SlimeTokenCreate.createCommaToken(prop.loc);
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
								type: SlimeNodeType.RestElement,
								argument: restId,
								ellipsisToken: SlimeTokenCreate.createEllipsisToken(ellipsis.loc),
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
			type: SlimeNodeType.ObjectPattern,
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
				const id = SlimeAstUtil.createIdentifier(idNode.value, idNode.loc);
				return {
					type: SlimeNodeType.Property,
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
					const id = SlimeAstUtil.createIdentifier(idNode.value, idNode.loc);
					let value = id;
					if (initializer) {
						const init = this.createInitializerAst(initializer);
						value = {
							type: SlimeNodeType.AssignmentPattern,
							left: id,
							right: init,
							loc: first.loc
						};
					}
					return {
						type: SlimeNodeType.Property,
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
					type: SlimeNodeType.Property,
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
			if (property.type === SlimeNodeType.SpreadElement) properties.push({ property: {
				type: SlimeNodeType.RestElement,
				argument: property.argument,
				loc: property.loc
			} });
			else {
				const value = this.convertExpressionToPatternFromAST(property.value);
				properties.push({ property: {
					type: SlimeNodeType.Property,
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
			type: SlimeNodeType.ObjectPattern,
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
			type: SlimeNodeType.ArrayPattern,
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
			type: SlimeNodeType.AssignmentPattern,
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
		if (expr.type === SlimeNodeType.Identifier) return expr;
		else if (expr.type === SlimeNodeType.ObjectExpression) return this.convertObjectExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType.ArrayExpression) return this.convertArrayExpressionToPattern(expr);
		else if (expr.type === SlimeNodeType.AssignmentExpression) return this.convertAssignmentExpressionToPattern(expr);
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
				if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate.createCommaToken(elisionChild.loc);
				elements.push({ element: null });
			}
		};
		for (const child of cst.children || []) if (child.value === "[") lBracketToken = SlimeTokenCreate.createLBracketToken(child.loc);
		else if (child.value === "]") rBracketToken = SlimeTokenCreate.createRBracketToken(child.loc);
		else if (child.name === "Elision") processElision(child);
		else if (child.name === "ElementList") {
			const elemChildren = child.children || [];
			for (let i = 0; i < elemChildren.length; i++) {
				const elem = elemChildren[i];
				if (elem.value === ",") {
					if (elements.length > 0 && !elements[elements.length - 1].commaToken) elements[elements.length - 1].commaToken = SlimeTokenCreate.createCommaToken(elem.loc);
				} else if (elem.name === "Elision") processElision(elem);
				else if (elem.name === "AssignmentExpression") {
					const expr = this.createExpressionAst(elem);
					const pattern = this.convertExpressionToPatternFromAST(expr);
					elements.push({ element: pattern || expr });
				} else if (elem.name === "SpreadElement") {
					const restNode = this.createSpreadElementAst(elem);
					elements.push({ element: {
						type: SlimeNodeType.RestElement,
						argument: restNode.argument,
						loc: restNode.loc
					} });
				}
			}
		}
		return {
			type: SlimeNodeType.ArrayPattern,
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
		checkCstName(cst, SlimeParser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name);
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
			if (assignmentAst.type === SlimeNodeType.Identifier) return [assignmentAst];
			if (assignmentAst.type === SlimeNodeType.AssignmentExpression) return [{
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
				if (assignmentAst.type === SlimeNodeType.Identifier) params.push(assignmentAst);
				else if (assignmentAst.type === SlimeNodeType.AssignmentExpression) params.push({
					type: "AssignmentPattern",
					left: assignmentAst.left,
					right: assignmentAst.right
				});
				else if (assignmentAst.type === SlimeNodeType.ObjectExpression) params.push(this.convertExpressionToPattern(assignmentAst));
				else if (assignmentAst.type === SlimeNodeType.ArrayExpression) params.push(this.convertExpressionToPattern(assignmentAst));
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
		if (expr.type === SlimeNodeType.Identifier) return expr;
		if (expr.type === SlimeNodeType.ObjectExpression) {
			const properties = [];
			for (const item of expr.properties || []) {
				const prop = item.property !== void 0 ? item.property : item;
				if (prop.type === SlimeNodeType.SpreadElement) properties.push({
					property: {
						type: SlimeNodeType.RestElement,
						argument: this.convertExpressionToPattern(prop.argument),
						loc: prop.loc
					},
					commaToken: item.commaToken
				});
				else if (prop.type === SlimeNodeType.Property) {
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
				type: SlimeNodeType.ObjectPattern,
				properties,
				loc: expr.loc,
				lBraceToken: expr.lBraceToken,
				rBraceToken: expr.rBraceToken
			};
		}
		if (expr.type === SlimeNodeType.ArrayExpression) {
			const elements = [];
			for (const item of expr.elements || []) {
				const elem = item.element !== void 0 ? item.element : item;
				if (elem === null) elements.push(item);
				else if (elem.type === SlimeNodeType.SpreadElement) elements.push({
					element: {
						type: SlimeNodeType.RestElement,
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
				type: SlimeNodeType.ArrayPattern,
				elements,
				loc: expr.loc,
				lBracketToken: expr.lBracketToken,
				rBracketToken: expr.rBracketToken
			};
		}
		if (expr.type === SlimeNodeType.AssignmentExpression) return {
			type: SlimeNodeType.AssignmentPattern,
			left: this.convertExpressionToPattern(expr.left),
			right: expr.right,
			loc: expr.loc
		};
		if (expr.type === SlimeNodeType.SpreadElement) return {
			type: SlimeNodeType.RestElement,
			argument: this.convertExpressionToPattern(expr.argument),
			loc: expr.loc
		};
		return expr;
	}
	/**
	* 创建箭头函数参数 AST
	*/
	createArrowParametersAst(cst) {
		checkCstName(cst, SlimeParser.prototype.ArrowParameters?.name);
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
				return SlimeAstUtil.createBlockStatement(bodyStatements, cst.loc);
			}
			return SlimeAstUtil.createBlockStatement([], cst.loc);
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
		checkCstName(cst, SlimeParser.prototype.ConditionalExpression?.name);
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
			if (questionCst && (questionCst.name === "Question" || questionCst.value === "?")) questionToken = SlimeTokenCreate.createQuestionToken(questionCst.loc);
			if (colonCst && (colonCst.name === "Colon" || colonCst.value === ":")) colonToken = SlimeTokenCreate.createColonToken(colonCst.loc);
			consequent = this.createAssignmentExpressionAst(cst.children[2]);
			alternate = this.createAssignmentExpressionAst(cst.children[4]);
		}
		return SlimeAstUtil.createConditionalExpression(test, consequent, alternate, cst.loc, questionToken, colonToken);
	}
	createYieldExpressionAst(cst) {
		let yieldToken = void 0;
		let asteriskToken = void 0;
		let delegate = false;
		let startIndex = 1;
		if (cst.children[0] && (cst.children[0].name === "Yield" || cst.children[0].value === "yield")) yieldToken = SlimeTokenCreate.createYieldToken(cst.children[0].loc);
		if (cst.children[1] && cst.children[1].name === SlimeTokenConsumer.prototype.Asterisk?.name) {
			asteriskToken = SlimeTokenCreate.createAsteriskToken(cst.children[1].loc);
			delegate = true;
			startIndex = 2;
		}
		let argument = null;
		if (cst.children[startIndex]) argument = this.createAssignmentExpressionAst(cst.children[startIndex]);
		return SlimeAstUtil.createYieldExpression(argument, delegate, cst.loc, yieldToken, asteriskToken);
	}
	createAwaitExpressionAst(cst) {
		checkCstName(cst, SlimeParser.prototype.AwaitExpression?.name);
		let awaitToken = void 0;
		if (cst.children[0] && (cst.children[0].name === "Await" || cst.children[0].value === "await")) awaitToken = SlimeTokenCreate.createAwaitToken(cst.children[0].loc);
		const argumentCst = cst.children[1];
		const argument = this.createExpressionAst(argumentCst);
		return SlimeAstUtil.createAwaitExpression(argument, cst.loc, awaitToken);
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
					type: SlimeNodeType.LogicalExpression,
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
					type: SlimeNodeType.LogicalExpression,
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
export { ReservedWords, SlimeCstToAst, SlimeTokensObj, checkCstName, slimeTokens, throwNewError };