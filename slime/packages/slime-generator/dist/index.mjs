import "slime-ast/src/SlimeESTree.ts";
import { SlimeNodeType } from "slime-ast/src/SlimeNodeType.ts";
import { createEmptyValueRegToken, createKeywordToken, createValueRegToken } from "subhuti/src/struct/SubhutiCreateToken.ts";
import "subhuti/src/struct/SubhutiMatchToken.ts";
import { SlimeTokenType } from "slime-token/src/SlimeTokenType.ts";

//#region src/SlimeCodeMapping.ts
var SlimeCodeLocation = class {
	type = "";
	line = 0;
	value = "";
	column = 0;
	length = 0;
	index = 0;
};

//#endregion
//#region ../slime-parser/src/language/es2025/SlimeTokens.ts
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
//#region src/SlimeGenerator.ts
const Es6TokenName = SlimeTokenType;
const createSoftKeywordToken = (name, value) => ({
	name,
	type: name,
	value
});
const es6TokensObj = {
	...SlimeTokensObj,
	OfTok: createSoftKeywordToken("OfTok", "of"),
	AsyncTok: createSoftKeywordToken("AsyncTok", "async"),
	StaticTok: createSoftKeywordToken("StaticTok", "static"),
	AsTok: createSoftKeywordToken("AsTok", "as"),
	GetTok: createSoftKeywordToken("GetTok", "get"),
	SetTok: createSoftKeywordToken("SetTok", "set"),
	FromTok: createSoftKeywordToken("FromTok", "from"),
	Eq: SlimeTokensObj.Assign
};
const es6TokenMapObj = {
	"const": SlimeTokensObj.ConstTok,
	"let": createSoftKeywordToken("Let", "let"),
	"var": SlimeTokensObj.VarTok
};
var SlimeGenerator = class {
	static mappings = null;
	static lastSourcePosition = null;
	static generatePosition = null;
	static sourceCodeIndex = null;
	static generateCode = "";
	static generateLine = 0;
	static generateColumn = 0;
	static generateIndex = 0;
	static tokens = null;
	static indent = 0;
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
	static generator(node, tokens) {
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
		this.generatorNode(node);
		return {
			mapping: this.mappings,
			code: this.generateCode
		};
	}
	static generatorProgram(node) {
		this.generatorNodes(node.body);
	}
	static generatorModuleDeclarations(node) {
		for (const nodeElement of node) this.generatorNode(nodeElement);
	}
	static generatorImportDeclaration(node) {
		this.addCodeAndMappings(es6TokensObj.ImportTok, node.loc);
		this.addSpacing();
		const hasSpecifiers = node.specifiers && node.specifiers.length > 0;
		const hasEmptyNamedImport = !hasSpecifiers && node.lBraceToken && node.rBraceToken;
		if (hasSpecifiers) {
			const getSpecType = (s) => s.specifier?.type || s.type;
			const getSpec = (s) => s.specifier || s;
			const hasDefault = node.specifiers.some((s) => getSpecType(s) === SlimeNodeType.ImportDefaultSpecifier);
			const hasNamed = node.specifiers.some((s) => getSpecType(s) === SlimeNodeType.ImportSpecifier);
			const hasNamespace = node.specifiers.some((s) => getSpecType(s) === SlimeNodeType.ImportNamespaceSpecifier);
			if (hasDefault) {
				const defaultItem = node.specifiers.find((s) => getSpecType(s) === SlimeNodeType.ImportDefaultSpecifier);
				this.generatorNode(getSpec(defaultItem));
				if (hasNamed || hasNamespace) {
					this.addComma();
					this.addSpacing();
				}
			}
			if (hasNamespace) {
				const nsItem = node.specifiers.find((s) => getSpecType(s) === SlimeNodeType.ImportNamespaceSpecifier);
				this.generatorNode(getSpec(nsItem));
			} else if (hasNamed) {
				const namedItems = node.specifiers.filter((s) => getSpecType(s) === SlimeNodeType.ImportSpecifier);
				this.addLBrace();
				namedItems.forEach((item, index) => {
					if (index > 0) this.addComma();
					this.generatorNode(getSpec(item));
				});
				this.addRBrace();
			}
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.FromTok, node.loc);
			this.addSpacing();
		} else if (hasEmptyNamedImport) {
			this.addLBrace();
			this.addRBrace();
			this.addSpacing();
			this.addCodeAndMappings(es6TokensObj.FromTok, node.loc);
			this.addSpacing();
		}
		this.generatorNode(node.source);
		this.generatorAttributes(node.attributes);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/** 生成 ES2025 Import Attributes: with { type: "json" } 或 with {} */
	static generatorAttributes(attrs) {
		if (attrs === void 0) return;
		this.addSpacing();
		this.addCode({
			type: "With",
			name: "With",
			value: "with"
		});
		this.addSpacing();
		this.addLBrace();
		attrs.forEach((attr, index) => {
			if (index > 0) {
				this.addComma();
				this.addSpacing();
			}
			if (attr.key.type === SlimeNodeType.Identifier) this.generatorIdentifier(attr.key);
			else this.generatorNode(attr.key);
			this.addCode(es6TokensObj.Colon);
			this.addSpacing();
			this.generatorNode(attr.value);
		});
		this.addRBrace();
	}
	static generatorImportSpecifier(node) {
		if (node.imported.name !== node.local.name) {
			this.generatorNode(node.imported);
			this.addSpacing();
			this.addCode(es6TokensObj.AsTok);
			this.addSpacing();
			this.generatorNode(node.local);
		} else this.generatorNode(node.local);
	}
	static generatorImportDefaultSpecifier(node) {
		this.generatorNode(node.local);
	}
	static generatorImportNamespaceSpecifier(node) {
		this.addCode(es6TokensObj.Asterisk);
		this.addSpacing();
		this.addCode(es6TokensObj.AsTok);
		this.addSpacing();
		this.generatorNode(node.local);
	}
	static generatorExportNamedDeclaration(node) {
		this.addCode(es6TokensObj.ExportTok);
		this.addSpacing();
		if (node.declaration) this.generatorNode(node.declaration);
		else if (node.specifiers) {
			this.addLBrace();
			node.specifiers.forEach((item, index) => {
				if (index > 0) {
					this.addComma();
					this.addSpacing();
				}
				const spec = item.specifier || item;
				this.generatorExportSpecifier(spec);
			});
			this.addRBrace();
			if (node.source) {
				this.addSpacing();
				this.addCode(es6TokensObj.FromTok);
				this.addSpacing();
				this.generatorNode(node.source);
			}
			this.generatorAttributes(node.attributes);
			this.addCode(es6TokensObj.Semicolon);
			this.addNewLine();
		}
	}
	static generatorExportSpecifier(spec) {
		this.generatorNode(spec.local);
		if ((spec.local.type === SlimeNodeType.Literal ? spec.local.value : spec.local.name) !== (spec.exported.type === SlimeNodeType.Literal ? spec.exported.value : spec.exported.name)) {
			this.addSpacing();
			this.addCode(es6TokensObj.AsTok);
			this.addSpacing();
			this.generatorNode(spec.exported);
		}
	}
	static generatorExportAllDeclaration(node) {
		this.addCode(es6TokensObj.ExportTok);
		this.addSpacing();
		this.addCode(es6TokensObj.Asterisk);
		this.addSpacing();
		if (node.exported) {
			this.addCode(es6TokensObj.AsTok);
			this.addSpacing();
			this.generatorNode(node.exported);
			this.addSpacing();
		}
		this.addCode(es6TokensObj.FromTok);
		this.addSpacing();
		this.generatorNode(node.source);
		this.generatorAttributes(node.attributes);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	static generatorNodes(nodes) {
		nodes.forEach((node, index) => {
			this.generatorNode(node);
			if (index < nodes.length - 1) this.addIndent();
		});
	}
	static generatorExpressionStatement(node) {
		this.generatorNode(node.expression);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	static generatorYieldExpression(node) {
		this.addCode(es6TokensObj.YieldTok);
		if (node.delegate) this.addCode(es6TokensObj.Asterisk);
		if (node.argument) {
			this.addSpacing();
			this.generatorNode(node.argument);
		}
	}
	static generatorAwaitExpression(node) {
		this.addCode(es6TokensObj.AwaitTok);
		if (node.argument) {
			this.addSpacing();
			this.generatorNode(node.argument);
		}
	}
	static generatorTemplateLiteral(node) {
		const quasis = node.quasis || [];
		const expressions = node.expressions || [];
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
	static generatorCallExpression(node) {
		this.generatorNode(node.callee);
		if (node.optional) this.addCode(es6TokensObj.OptionalChaining);
		this.addLParen();
		if (node.arguments.length) node.arguments.forEach((item, index) => {
			if (index !== 0) this.addComma();
			const argument = item.argument || item;
			if (argument.type === SlimeNodeType.SpreadElement) this.generatorSpreadElement(argument);
			else this.generatorNode(argument);
		});
		this.addRParen();
	}
	static generatorFunctionExpression(node) {
		if (node.async) {
			this.addCode(es6TokensObj.AsyncTok);
			this.addSpacing();
		}
		this.addCodeAndMappings(es6TokensObj.FunctionTok, node.loc);
		if (node.generator) this.addCode(es6TokensObj.Asterisk);
		if (node.id) {
			this.addSpacing();
			this.generatorNode(node.id);
		}
		this.generatorFunctionParams(node.params);
		if (node.body && node.body.type) this.generatorNode(node.body);
		else {
			this.addLBrace();
			this.addRBrace();
		}
	}
	/**
	* 生成箭头函数表达式
	*/
	static generatorArrowFunctionExpression(node) {
		if (node.async) {
			this.addCode(es6TokensObj.AsyncTok);
			this.addSpacing();
		}
		const unwrapParam = (p) => p.param !== void 0 ? p.param : p;
		const firstParam = node.params?.[0] ? unwrapParam(node.params[0]) : null;
		const hasParenTokens = node.lParenToken || node.rParenToken;
		if (node.params && node.params.length === 1 && firstParam?.type === SlimeNodeType.Identifier && !hasParenTokens) this.generatorNode(firstParam);
		else {
			this.addLParen();
			if (node.params) node.params.forEach((item, index) => {
				if (index !== 0) this.addComma();
				const param = unwrapParam(item);
				this.generatorNode(param);
			});
			this.addRParen();
		}
		this.addSpacing();
		this.addCode(es6TokensObj.Arrow);
		this.addSpacing();
		if (node.expression && node.body.type !== SlimeNodeType.BlockStatement) if (node.body.type === SlimeNodeType.ObjectExpression) {
			this.addLParen();
			this.generatorNode(node.body);
			this.addRParen();
		} else this.generatorNode(node.body);
		else this.generatorNode(node.body, false);
	}
	/**
	* 生成二元运算表达式
	*/
	static generatorBinaryExpression(node) {
		this.generatorNode(node.left);
		this.addSpacing();
		this.addString(node.operator);
		this.addSpacing();
		this.generatorNode(node.right);
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
	static isComplexNode(node) {
		if (!node) return false;
		if (node.type === SlimeNodeType.CallExpression) return true;
		if (node.type === SlimeNodeType.ObjectExpression && node.properties?.length > 1) return true;
		if (node.type === SlimeNodeType.ArrayExpression) return node.elements?.some((item) => this.isComplexNode(item?.element));
		return false;
	}
	static generatorArrayExpression(node) {
		this.addLBracket(node.loc);
		if (node.elements?.some((item) => this.isComplexNode(item?.element)) && node.elements.length > 0) {
			this.addNewLine();
			this.indent++;
			this.addIndent();
			node.elements.forEach((item, index) => {
				const element = item.element;
				if (element === null || element === void 0) {} else if (element.type === SlimeNodeType.SpreadElement) this.generatorSpreadElement(element);
				else this.generatorNode(element);
				if (index < node.elements.length - 1) {
					this.addComma();
					this.addNewLine();
					this.addIndent();
				}
			});
			this.addNewLine();
			this.indent--;
			this.addIndent();
		} else for (const item of node.elements) {
			const element = item.element;
			if (element === null || element === void 0) {} else if (element.type === SlimeNodeType.SpreadElement) this.generatorSpreadElement(element);
			else this.generatorNode(element);
			if (item.commaToken) this.addComma();
		}
		this.addRBracket(node.loc);
	}
	static generatorObjectExpression(node) {
		this.addLBrace();
		node.properties.forEach((item, index) => {
			const property = item.property;
			if (property.type === SlimeNodeType.SpreadElement) this.generatorSpreadElement(property);
			else this.generatorNode(property);
			if (item.commaToken) this.addComma();
		});
		this.addRBrace();
	}
	static generatorParenthesizedExpression(node) {
		this.addLParen();
		this.generatorNode(node.expression);
		this.addRParen();
	}
	static generatorSequenceExpression(node) {
		if (node.expressions && Array.isArray(node.expressions)) for (let i = 0; i < node.expressions.length; i++) {
			if (i > 0) this.addComma();
			this.generatorNode(node.expressions[i]);
		}
	}
	static generatorPrivateIdentifier(node) {
		this.addString(node.name);
	}
	static generatorProperty(node) {
		if (node.kind === "get" || node.kind === "set") {
			if (node.kind === "get") this.addCode(es6TokensObj.GetTok);
			else this.addCode(es6TokensObj.SetTok);
			this.addSpacing();
			if (node.computed) {
				this.addLBracket();
				this.generatorNode(node.key);
				this.addRBracket();
			} else this.generatorNode(node.key);
			const value = node.value;
			this.generatorFunctionParams(value.params);
			if (value.body) this.generatorNode(value.body);
		} else if (node.method) {
			const value = node.value;
			if (value.async) {
				this.addCode(es6TokensObj.AsyncTok);
				this.addSpacing();
			}
			if (value.generator) this.addCode(es6TokensObj.Asterisk);
			if (node.computed) {
				this.addLBracket();
				this.generatorNode(node.key);
				this.addRBracket();
			} else this.generatorNode(node.key);
			this.generatorFunctionParams(value.params);
			if (value.body) this.generatorNode(value.body);
		} else if (node.shorthand) if (node.value && node.value.type === SlimeNodeType.AssignmentPattern) this.generatorNode(node.value);
		else this.generatorNode(node.key);
		else {
			if (node.computed) {
				this.addLBracket();
				this.generatorNode(node.key);
				this.addRBracket();
			} else this.generatorNode(node.key);
			this.addCode(es6TokensObj.Colon);
			this.generatorNode(node.value);
		}
	}
	static patternTypes = [
		SlimeNodeType.Identifier,
		SlimeNodeType.ObjectPattern,
		SlimeNodeType.ArrayPattern,
		SlimeNodeType.RestElement,
		SlimeNodeType.AssignmentPattern,
		SlimeNodeType.MemberExpression
	];
	static generatorIdentifier(node) {
		const identifierName = node.raw || node.loc?.value || node.name || "";
		if (!identifierName) console.error("generatorIdentifier: node.name is undefined", JSON.stringify(node, null, 2));
		const identifier = {
			type: Es6TokenName.IdentifierNameTok,
			name: Es6TokenName.IdentifierNameTok,
			value: identifierName
		};
		this.addCodeAndMappings(identifier, node.loc);
	}
	static generatorFunctionDeclaration(node) {
		if (node.async) {
			this.addCode(es6TokensObj.AsyncTok);
			this.addSpacing();
		}
		this.addCode(es6TokensObj.FunctionTok);
		if (node.generator) this.addCode(es6TokensObj.Asterisk);
		if (node.id) {
			this.addSpacing();
			this.generatorIdentifier(node.id);
		}
		this.generatorFunctionParams(node.params);
		if (node.body) this.generatorBlockStatement(node.body, true);
	}
	static generatorClassDeclaration(node) {
		this.addCode(es6TokensObj.ClassTok);
		if (node.id) {
			this.addSpacing();
			this.generatorNode(node.id);
		}
		if (node.superClass) {
			this.addSpacing();
			this.addCode(es6TokensObj.ExtendsTok);
			this.addSpacing();
			this.generatorNode(node.superClass);
		}
		this.generatorClassBody(node.body);
	}
	static generatorClassExpression(node) {
		this.addCode(es6TokensObj.ClassTok);
		if (node.id) {
			this.addSpacing();
			this.generatorNode(node.id);
		}
		if (node.superClass) {
			this.addSpacing();
			this.addCode(es6TokensObj.ExtendsTok);
			this.addSpacing();
			this.generatorNode(node.superClass);
		}
		this.generatorClassBody(node.body);
	}
	static generatorClassBody(body) {
		this.addLBrace(body.loc);
		if (body?.body?.length) body.body.forEach((element) => {
			this.generatorNode(element);
		});
		this.addRBrace(body.loc);
	}
	static generatorMethodDefinition(node) {
		if (node.static) {
			this.addCode(es6TokensObj.StaticTok);
			this.addSpacing();
		}
		if (node.value && node.value.async) {
			this.addCode(es6TokensObj.AsyncTok);
			this.addSpacing();
		}
		if (node.kind === "get") {
			this.addCode(es6TokensObj.GetTok);
			this.addSpacing();
		} else if (node.kind === "set") {
			this.addCode(es6TokensObj.SetTok);
			this.addSpacing();
		}
		if (node.value && node.value.generator) this.addCode(es6TokensObj.Asterisk);
		if (node.key) if (node.computed) {
			this.addLBracket();
			this.generatorNode(node.key);
			this.addRBracket();
		} else this.generatorNode(node.key);
		if (node.value) {
			this.generatorFunctionParams(node.value.params);
			if (node.value.body) this.generatorNode(node.value.body);
		}
	}
	static generatorPropertyDefinition(node) {
		if (node.static) {
			this.addCode(es6TokensObj.StaticTok);
			this.addSpacing();
		}
		if (node.key) if (node.computed) {
			this.addLBracket();
			this.generatorNode(node.key);
			this.addRBracket();
		} else this.generatorNode(node.key);
		if (node.value) {
			this.addSpacing();
			this.addCode(es6TokensObj.Eq);
			this.addSpacing();
			this.generatorNode(node.value);
		}
		this.addCode(es6TokensObj.Semicolon);
	}
	static generatorNewExpression(node) {
		this.addCode(es6TokensObj.NewTok);
		this.addSpacing();
		if (node.callee) this.generatorNode(node.callee);
		if (node.lParenToken || node.arguments && node.arguments.length > 0) {
			this.addLParen();
			if (node.arguments && node.arguments.length > 0) node.arguments.forEach((arg, index) => {
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
	static generatorNode(node, addNewLineAfter = false) {
		if (!node) return;
		if (node.type === SlimeNodeType.Program) return this.generatorProgram(node);
		else if (node.type === SlimeNodeType.PrivateIdentifier) this.generatorPrivateIdentifier(node);
		else if (node.type === SlimeNodeType.Identifier) this.generatorIdentifier(node);
		else if (node.type === SlimeNodeType.ThisExpression || node.type === "ThisExpression") this.addCode(es6TokensObj.ThisTok);
		else if (node.type === SlimeNodeType.NumericLiteral) this.generatorNumberLiteral(node);
		else if (node.type === SlimeNodeType.Literal) this.generatorLiteral(node);
		else if (node.type === SlimeNodeType.MemberExpression) this.generatorMemberExpression(node);
		else if (node.type === SlimeNodeType.CallExpression) this.generatorCallExpression(node);
		else if (node.type === SlimeNodeType.FunctionExpression) this.generatorFunctionExpression(node);
		else if (node.type === SlimeNodeType.ArrowFunctionExpression) this.generatorArrowFunctionExpression(node);
		else if (node.type === SlimeNodeType.BinaryExpression) this.generatorBinaryExpression(node);
		else if (node.type === SlimeNodeType.LogicalExpression || node.type === "LogicalExpression") this.generatorBinaryExpression(node);
		else if (node.type === SlimeNodeType.StringLiteral) this.generatorStringLiteral(node);
		else if (node.type === SlimeNodeType.ArrayExpression) this.generatorArrayExpression(node);
		else if (node.type === SlimeNodeType.ObjectExpression) this.generatorObjectExpression(node);
		else if (node.type === SlimeNodeType.ParenthesizedExpression) this.generatorParenthesizedExpression(node);
		else if (node.type === "SequenceExpression") this.generatorSequenceExpression(node);
		else if (node.type === SlimeNodeType.Property) this.generatorProperty(node);
		else if (node.type === SlimeNodeType.VariableDeclarator) this.generatorVariableDeclarator(node);
		else if (node.type === SlimeNodeType.RestElement) this.generatorRestElement(node);
		else if (node.type === SlimeNodeType.SpreadElement) this.generatorSpreadElement(node);
		else if (node.type === SlimeNodeType.ObjectPattern) this.generatorObjectPattern(node);
		else if (node.type === SlimeNodeType.ArrayPattern) this.generatorArrayPattern(node);
		else if (node.type === SlimeNodeType.AssignmentPattern) this.generatorAssignmentPattern(node);
		else if (node.type === SlimeNodeType.FunctionDeclaration) this.generatorFunctionDeclaration(node);
		else if (node.type === SlimeNodeType.ClassDeclaration) this.generatorClassDeclaration(node);
		else if (node.type === SlimeNodeType.ClassExpression) this.generatorClassExpression(node);
		else if (node.type === SlimeNodeType.MethodDefinition) this.generatorMethodDefinition(node);
		else if (node.type === "PropertyDefinition") this.generatorPropertyDefinition(node);
		else if (node.type === "NewExpression") this.generatorNewExpression(node);
		else if (node.type === SlimeNodeType.VariableDeclaration) this.generatorVariableDeclaration(node);
		else if (node.type === SlimeNodeType.ExpressionStatement) this.generatorExpressionStatement(node);
		else if (node.type === SlimeNodeType.ReturnStatement) this.generatorReturnStatement(node);
		else if (node.type === SlimeNodeType.BlockStatement) this.generatorBlockStatement(node, addNewLineAfter);
		else if (node.type === SlimeNodeType.IfStatement) this.generatorIfStatement(node);
		else if (node.type === SlimeNodeType.ForStatement) this.generatorForStatement(node);
		else if (node.type === SlimeNodeType.ForInStatement || node.type === SlimeNodeType.ForOfStatement) this.generatorForInOfStatement(node);
		else if (node.type === SlimeNodeType.WhileStatement) this.generatorWhileStatement(node);
		else if (node.type === SlimeNodeType.DoWhileStatement) this.generatorDoWhileStatement(node);
		else if (node.type === SlimeNodeType.SwitchStatement) this.generatorSwitchStatement(node);
		else if (node.type === SlimeNodeType.SwitchCase) this.generatorSwitchCase(node);
		else if (node.type === SlimeNodeType.TryStatement) this.generatorTryStatement(node);
		else if (node.type === "CatchClause") this.generatorCatchClause(node);
		else if (node.type === SlimeNodeType.ThrowStatement) this.generatorThrowStatement(node);
		else if (node.type === SlimeNodeType.BreakStatement) this.generatorBreakStatement(node);
		else if (node.type === SlimeNodeType.ContinueStatement) this.generatorContinueStatement(node);
		else if (node.type === SlimeNodeType.LabeledStatement) this.generatorLabeledStatement(node);
		else if (node.type === SlimeNodeType.WithStatement) this.generatorWithStatement(node);
		else if (node.type === SlimeNodeType.DebuggerStatement) this.generatorDebuggerStatement(node);
		else if (node.type === SlimeNodeType.EmptyStatement) this.generatorEmptyStatement(node);
		else if (node.type === SlimeNodeType.ImportSpecifier) this.generatorImportSpecifier(node);
		else if (node.type === SlimeNodeType.ImportDefaultSpecifier) this.generatorImportDefaultSpecifier(node);
		else if (node.type === SlimeNodeType.ImportNamespaceSpecifier) this.generatorImportNamespaceSpecifier(node);
		else if (node.type === SlimeNodeType.ExportNamedDeclaration) this.generatorExportNamedDeclaration(node);
		else if (node.type === SlimeNodeType.ExportDefaultDeclaration) this.generatorExportDefaultDeclaration(node);
		else if (node.type === "ExportAllDeclaration") this.generatorExportAllDeclaration(node);
		else if (node.type === SlimeNodeType.ImportDeclaration) this.generatorImportDeclaration(node);
		else if (node.type === SlimeNodeType.ImportExpression) this.generatorImportExpression(node);
		else if (node.type === SlimeNodeType.ChainExpression) this.generatorChainExpression(node);
		else if (node.type === SlimeNodeType.StaticBlock) this.generatorStaticBlock(node);
		else if (node.type === "ConditionalExpression") this.generatorConditionalExpression(node);
		else if (node.type === "AssignmentExpression") this.generatorAssignmentExpression(node);
		else if (node.type === "BooleanLiteral") this.addString(node.value ? "true" : "false");
		else if (node.type === "NullLiteral") this.addString("null");
		else if (node.type === "UnaryExpression") this.generatorUnaryExpression(node);
		else if (node.type === SlimeNodeType.UpdateExpression) this.generatorUpdateExpression(node);
		else if (node.type === SlimeNodeType.YieldExpression) this.generatorYieldExpression(node);
		else if (node.type === SlimeNodeType.AwaitExpression) this.generatorAwaitExpression(node);
		else if (node.type === SlimeNodeType.TemplateLiteral) this.generatorTemplateLiteral(node);
		else if (node.type === "Super") this.addString("super");
		else if (node.type === "TaggedTemplateExpression") {
			this.generatorNode(node.tag);
			this.generatorTemplateLiteral(node.quasi);
		} else if (node.type === "MetaProperty") {
			this.generatorNode(node.meta);
			this.addCode(es6TokensObj.Dot);
			this.generatorNode(node.property);
		} else if (node.type === SlimeNodeType.OptionalCallExpression) this.generatorOptionalCallExpression(node);
		else if (node.type === SlimeNodeType.OptionalMemberExpression) this.generatorOptionalMemberExpression(node);
		else {
			console.error("未知节点:", JSON.stringify(node, null, 2));
			throw new Error("不支持的类型：" + node.type);
		}
		if (node.loc && node.loc.newLine) this.addNewLine();
	}
	static generatorUnaryExpression(node) {
		this.addString(node.operator);
		if (node.operator === "typeof" || node.operator === "void" || node.operator === "delete") this.addSpacing();
		this.generatorNode(node.argument);
	}
	static generatorUpdateExpression(node) {
		if (node.prefix) {
			this.addString(node.operator);
			this.generatorNode(node.argument);
		} else {
			this.generatorNode(node.argument);
			this.addString(node.operator);
		}
	}
	static generatorConditionalExpression(node) {
		this.generatorNode(node.test);
		this.addString("?");
		this.generatorNode(node.consequent);
		this.addString(":");
		this.generatorNode(node.alternate);
	}
	static generatorAssignmentExpression(node) {
		this.generatorNode(node.left);
		this.addSpacing();
		this.addString(node.operator || "=");
		this.addSpacing();
		this.generatorNode(node.right);
	}
	static generatorObjectPattern(node) {
		this.addLBrace();
		node.properties.forEach((item, index) => {
			const prop = item.property !== void 0 ? item.property : item;
			const commaToken = item.commaToken;
			if (prop.type === SlimeNodeType.RestElement) this.generatorRestElement(prop);
			else if (prop.shorthand) if (prop.value && prop.value.type === SlimeNodeType.AssignmentPattern) this.generatorNode(prop.value);
			else this.generatorNode(prop.key);
			else {
				if (prop.computed) {
					this.addLBracket();
					this.generatorNode(prop.key);
					this.addRBracket();
				} else this.generatorNode(prop.key);
				this.addCode(es6TokensObj.Colon);
				this.addSpacing();
				this.generatorNode(prop.value);
			}
			if (commaToken) this.addComma();
			else if (index < node.properties.length - 1) this.addComma();
		});
		this.addRBrace();
	}
	static generatorArrayPattern(node) {
		this.addLBracket();
		node.elements.forEach((item, index) => {
			const wrapped = item;
			const element = wrapped.element !== void 0 ? wrapped.element : item;
			const commaToken = wrapped.commaToken;
			if (element) this.generatorNode(element);
			if (commaToken) this.addComma();
			else if (index < node.elements.length - 1) this.addComma();
		});
		this.addRBracket();
	}
	static generatorRestElement(node) {
		this.addCode(es6TokensObj.Ellipsis);
		this.generatorNode(node.argument);
	}
	static generatorSpreadElement(node) {
		this.addCode(es6TokensObj.Ellipsis);
		this.generatorNode(node.argument);
	}
	static generatorAssignmentPattern(node) {
		this.generatorNode(node.left);
		this.addSpacing();
		this.addCode(es6TokensObj.Eq);
		this.addSpacing();
		this.generatorNode(node.right);
	}
	/**
	* 生成块语句（{...}）
	* @param node BlockStatement 节点
	* @param addNewLineAfter 是否在 } 后换行（默认 false）
	*/
	static generatorBlockStatement(node, addNewLineAfter = false) {
		this.addLBrace();
		this.addNewLine();
		this.indent++;
		this.addIndent();
		this.generatorNodes(node.body);
		this.indent--;
		this.addIndent();
		this.addRBrace();
		if (addNewLineAfter) this.addNewLine();
	}
	static generatorReturnStatement(node) {
		this.addCode(es6TokensObj.ReturnTok);
		if (node.argument) {
			this.addSpacing();
			this.generatorNode(node.argument);
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
	static generatorMemberExpression(node) {
		this.generatorNode(node.object);
		if (node.computed) {
			if (node.optional) this.addCode(es6TokensObj.OptionalChaining);
			this.addLBracket();
			this.generatorNode(node.property);
			this.addRBracket();
		} else {
			if (node.optional) if (node.optionalChainingToken) this.addCodeAndMappings(es6TokensObj.OptionalChaining, node.optionalChainingToken.loc);
			else this.addCode(es6TokensObj.OptionalChaining);
			else if (node.dotToken) this.addDot(node.dotToken.loc);
			else this.addCode(es6TokensObj.Dot);
			if (node.property) this.generatorNode(node.property);
		}
	}
	/**
	* 生成可选调用表达式：obj?.method() 或 obj?.()
	*/
	static generatorOptionalCallExpression(node) {
		this.generatorNode(node.callee);
		if (node.optional) this.addCode(es6TokensObj.OptionalChaining);
		this.addLParen();
		if (node.arguments && node.arguments.length > 0) node.arguments.forEach((arg, index) => {
			if (index > 0) this.addComma();
			const argument = arg.argument || arg;
			if (argument.type === SlimeNodeType.SpreadElement) this.generatorSpreadElement(argument);
			else this.generatorNode(argument);
		});
		this.addRParen();
	}
	/**
	* 生成可选成员访问表达式：obj?.prop 或 obj?.[expr]
	*/
	static generatorOptionalMemberExpression(node) {
		this.generatorNode(node.object);
		if (node.computed) {
			if (node.optional) this.addCode(es6TokensObj.OptionalChaining);
			this.addLBracket();
			this.generatorNode(node.property);
			this.addRBracket();
		} else {
			if (node.optional) this.addCode(es6TokensObj.OptionalChaining);
			else this.addCode(es6TokensObj.Dot);
			this.generatorNode(node.property);
		}
	}
	/**
	* 生成变量声明（内部辅助方法）
	* @param node VariableDeclaration 节点
	* @param addSemicolonAndNewLine 是否添加分号和换行（默认 true）
	*/
	static generatorVariableDeclarationCore(node, addSemicolonAndNewLine) {
		const kindValue = typeof node.kind === "string" ? node.kind : node.kind?.value?.valueOf();
		const kindLoc = typeof node.kind === "string" ? void 0 : node.kind?.loc;
		this.addCodeAndMappings(es6TokenMapObj[kindValue], kindLoc);
		this.addSpacing();
		for (let i = 0; i < node.declarations.length; i++) {
			this.generatorNode(node.declarations[i]);
			if (i < node.declarations.length - 1) {
				this.addCode(es6TokensObj.Comma);
				this.addSpacing();
			}
		}
		if (addSemicolonAndNewLine) {
			this.addCode(es6TokensObj.Semicolon);
			this.addNewLine();
		}
	}
	static generatorVariableDeclaration(node) {
		this.generatorVariableDeclarationCore(node, true);
	}
	static get lastMapping() {
		if (this.mappings.length) return this.mappings[this.mappings.length - 1];
		return null;
	}
	static generatorVariableDeclarator(node) {
		this.generatorNode(node.id);
		if (node.init) {
			this.addSpacing();
			if (node.equal) this.addCodeAndMappings(es6TokensObj.Eq, node.equal.loc);
			else this.addCode(es6TokensObj.Eq);
			this.addSpacing();
			this.generatorNode(node.init);
		}
	}
	static generatorNumberLiteral(node) {
		const numValue = node.raw || String(node.value);
		this.addCodeAndMappings({
			type: Es6TokenName.NumericLiteral,
			name: Es6TokenName.NumericLiteral,
			value: numValue
		}, node.loc);
	}
	static generatorStringLiteral(node) {
		const strValue = node.raw || `'${node.value}'`;
		this.addCodeAndMappings({
			type: Es6TokenName.StringLiteral,
			name: Es6TokenName.StringLiteral,
			value: strValue
		}, node.loc);
	}
	/**
	* 生成 ESTree 标准的 Literal 节点
	* Literal 可以是：number, string, boolean, null, RegExp, BigInt
	*/
	static generatorLiteral(node) {
		const value = node.value;
		const raw = node.raw;
		if (value === null) this.addCodeAndMappings({
			type: "NullLiteral",
			name: "NullLiteral",
			value: "null"
		}, node.loc);
		else if (typeof value === "boolean") {
			const boolValue = value ? "true" : "false";
			this.addCodeAndMappings({
				type: "BooleanLiteral",
				name: "BooleanLiteral",
				value: boolValue
			}, node.loc);
		} else if (typeof value === "number") {
			const numValue = raw || String(value);
			this.addCodeAndMappings({
				type: Es6TokenName.NumericLiteral,
				name: Es6TokenName.NumericLiteral,
				value: numValue
			}, node.loc);
		} else if (typeof value === "string") {
			const strValue = raw || `'${value}'`;
			this.addCodeAndMappings({
				type: Es6TokenName.StringLiteral,
				name: Es6TokenName.StringLiteral,
				value: strValue
			}, node.loc);
		} else if (typeof value === "bigint" || raw && raw.endsWith("n")) {
			const bigintValue = raw || `${value}n`;
			this.addCodeAndMappings({
				type: "BigIntLiteral",
				name: "BigIntLiteral",
				value: bigintValue
			}, node.loc);
		} else if (value instanceof RegExp || node.regex) {
			const regexValue = raw || String(value);
			this.addCodeAndMappings({
				type: "RegularExpressionLiteral",
				name: "RegularExpressionLiteral",
				value: regexValue
			}, node.loc);
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
	static generatorIfStatement(node) {
		this.addCode(es6TokensObj.IfTok);
		this.addSpacing();
		this.addCode(es6TokensObj.LParen);
		this.generatorNode(node.test);
		this.addCode(es6TokensObj.RParen);
		if (node.consequent.type !== SlimeNodeType.BlockStatement) this.addSpacing();
		this.generatorNode(node.consequent, true);
		if (node.alternate) {
			this.addCode(es6TokensObj.ElseTok);
			if (node.alternate.type !== SlimeNodeType.BlockStatement) this.addSpacing();
			this.generatorNode(node.alternate, true);
		}
	}
	/**
	* 生成 for 语句
	*/
	static generatorForStatement(node) {
		this.addCode(es6TokensObj.ForTok);
		this.addSpacing();
		this.addCode(es6TokensObj.LParen);
		if (node.init) if (node.init.type === SlimeNodeType.VariableDeclaration) this.generatorVariableDeclarationCore(node.init, false);
		else this.generatorNode(node.init);
		this.addCode(es6TokensObj.Semicolon);
		if (node.test) this.generatorNode(node.test);
		this.addCode(es6TokensObj.Semicolon);
		if (node.update) this.generatorNode(node.update);
		this.addCode(es6TokensObj.RParen);
		if (node.body) this.generatorNode(node.body, true);
	}
	/**
	* 生成 for...in / for...of 语句
	*/
	static generatorForInOfStatement(node) {
		this.addCode(es6TokensObj.ForTok);
		if (node.await) {
			this.addSpacing();
			this.addCode(es6TokensObj.AwaitTok);
		}
		this.addSpacing();
		this.addCode(es6TokensObj.LParen);
		if (!node.left) {} else if (node.left.type === SlimeNodeType.VariableDeclaration) {
			this.addCode(es6TokenMapObj[node.left.kind.value.valueOf()]);
			this.addSpacing();
			if (node.left.declarations && node.left.declarations.length > 0) {
				const decl = node.left.declarations[0];
				this.generatorNode(decl.id);
				if (decl.init) {
					this.addSpacing();
					this.addCode(es6TokensObj.Assign);
					this.addSpacing();
					this.generatorNode(decl.init);
				}
			}
		} else this.generatorNode(node.left);
		this.addSpacing();
		if (node.type === SlimeNodeType.ForInStatement) this.addCode(es6TokensObj.InTok);
		else this.addCode(es6TokensObj.OfTok);
		this.addSpacing();
		this.generatorNode(node.right);
		this.addCode(es6TokensObj.RParen);
		this.generatorNode(node.body, true);
	}
	/**
	* 生成 while 语句
	*/
	static generatorWhileStatement(node) {
		this.addCode(es6TokensObj.WhileTok);
		this.addSpacing();
		this.addCode(es6TokensObj.LParen);
		if (node.test) this.generatorNode(node.test);
		this.addCode(es6TokensObj.RParen);
		if (node.body) this.generatorNode(node.body, true);
	}
	/**
	* 生成 do...while 语句
	*/
	static generatorDoWhileStatement(node) {
		this.addCode(es6TokensObj.DoTok);
		if (node.body?.type === SlimeNodeType.BlockStatement) this.generatorNode(node.body);
		else {
			this.addSpacing();
			this.generatorNode(node.body);
		}
		this.addCode(es6TokensObj.WhileTok);
		this.addSpacing();
		this.addCode(es6TokensObj.LParen);
		this.generatorNode(node.test);
		this.addCode(es6TokensObj.RParen);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成 switch 语句
	*/
	static generatorSwitchStatement(node) {
		this.addCode(es6TokensObj.SwitchTok);
		this.addSpacing();
		this.addCode(es6TokensObj.LParen);
		this.generatorNode(node.discriminant);
		this.addCode(es6TokensObj.RParen);
		this.addCode(es6TokensObj.LBrace);
		if (node.cases) this.generatorNodes(node.cases);
		this.addCode(es6TokensObj.RBrace);
	}
	/**
	* 生成 switch case 分支
	*/
	static generatorSwitchCase(node) {
		if (node.test) {
			this.addCode(es6TokensObj.CaseTok);
			this.addSpacing();
			this.generatorNode(node.test);
			this.addCode(es6TokensObj.Colon);
		} else {
			this.addCode(es6TokensObj.DefaultTok);
			this.addCode(es6TokensObj.Colon);
		}
		if (node.consequent && node.consequent.length > 0) this.generatorNodes(node.consequent);
	}
	/**
	* 生成 try 语句
	*/
	static generatorTryStatement(node) {
		this.addCode(es6TokensObj.TryTok);
		this.addSpacing();
		this.generatorNode(node.block, false);
		if (node.handler) {
			this.addCode(es6TokensObj.CatchTok);
			if (node.handler.param) {
				this.addSpacing();
				this.addLParen();
				this.generatorNode(node.handler.param);
				this.addRParen();
			}
			const hasFinalizer = !!node.finalizer;
			this.generatorNode(node.handler.body, !hasFinalizer);
		}
		if (node.finalizer) {
			this.addCode(es6TokensObj.FinallyTok);
			this.addSpacing();
			this.generatorNode(node.finalizer, true);
		}
	}
	/**
	* 生成 catch 子句
	*
	* 注意：虽然大多数情况下 catch 会在 TryStatement 中直接处理，
	* 但某些情况下可能需要单独生成 CatchClause 节点，因此保留此方法。
	*/
	static generatorCatchClause(node) {
		this.addCode(es6TokensObj.CatchTok);
		if (node.param) {
			this.addSpacing();
			this.addLParen();
			this.generatorNode(node.param);
			this.addRParen();
		}
		if (node.body) this.generatorNode(node.body);
	}
	/**
	* 生成 throw 语句
	*/
	static generatorThrowStatement(node) {
		this.addCode(es6TokensObj.ThrowTok);
		if (node.argument) {
			this.addSpacing();
			this.generatorNode(node.argument);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成 break 语句
	*/
	static generatorBreakStatement(node) {
		this.addCode(es6TokensObj.BreakTok);
		if (node.label) {
			this.addSpacing();
			this.generatorNode(node.label);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成 continue 语句
	*/
	static generatorContinueStatement(node) {
		this.addCode(es6TokensObj.ContinueTok);
		if (node.label) {
			this.addSpacing();
			this.generatorNode(node.label);
		}
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成标签语句
	*/
	static generatorLabeledStatement(node) {
		this.generatorNode(node.label);
		this.addCode(es6TokensObj.Colon);
		this.generatorNode(node.body);
	}
	/**
	* 生成 with 语句
	*/
	static generatorWithStatement(node) {
		this.addCode(es6TokensObj.WithTok);
		this.addCode(es6TokensObj.LParen);
		this.generatorNode(node.object);
		this.addCode(es6TokensObj.RParen);
		this.generatorNode(node.body);
	}
	/**
	* 生成 debugger 语句
	*/
	static generatorDebuggerStatement(node) {
		this.addCode(es6TokensObj.DebuggerTok);
		this.addCode(es6TokensObj.Semicolon);
		this.addNewLine();
	}
	/**
	* 生成空语句
	*/
	static generatorEmptyStatement(node) {
		this.addCode(es6TokensObj.Semicolon);
	}
	/**
	* 生成 export default 声明
	* export default expression
	*/
	static generatorExportDefaultDeclaration(node) {
		this.addCode(es6TokensObj.ExportTok);
		this.addSpacing();
		this.addCode(es6TokensObj.DefaultTok);
		this.addSpacing();
		this.generatorNode(node.declaration);
		const declarationType = node.declaration?.type;
		if (declarationType !== SlimeNodeType.FunctionDeclaration && declarationType !== SlimeNodeType.ClassDeclaration) {
			this.addCode(es6TokensObj.Semicolon);
			this.addNewLine();
		}
	}
	/**
	* 生成 ChainExpression（可选链表达式）
	* 例如: obj?.prop 或 obj?.method()
	*/
	static generatorChainExpression(node) {
		this.generatorNode(node.expression);
	}
	/**
	* 生成 ImportExpression（动态导入）
	* 例如: import('./module.js')
	*/
	static generatorImportExpression(node) {
		this.addCode(es6TokensObj.ImportTok);
		this.addLParen();
		this.generatorNode(node.source);
		this.addRParen();
	}
	/**
	* 生成 StaticBlock（类的静态初始化块）
	* 例如: static { console.log('init') }
	*/
	static generatorStaticBlock(node) {
		this.addCode(es6TokensObj.StaticTok);
		this.addSpacing();
		this.addLBrace();
		this.addNewLine();
		this.indent++;
		this.addIndent();
		this.generatorNodes(node.body);
		this.indent--;
		this.addIndent();
		this.addRBrace();
		this.addNewLine();
	}
};

//#endregion
export { SlimeCodeLocation };