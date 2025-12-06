import { SlimeAssignmentOperatorTokenTypes, SlimeBinaryOperatorTokenTypes, SlimeLogicalOperatorTokenTypes, SlimeTokenType, SlimeUnaryOperatorTokenTypes, SlimeUpdateOperatorTokenTypes } from "slime-token/src/SlimeTokenType.ts";

//#region src/SlimeNodeType.ts
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
//#region src/SlimeESTree.ts
/** Program source type */
const SlimeProgramSourceType = {
	Script: "script",
	Module: "module"
};

//#endregion
//#region src/SlimeNodeCreate.ts
/**
* SlimeNodeCreate.ts - AST 节点创建工厂
*
* 为每个 AST 节点类型提供创建方法
* Token 创建方法请使用 SlimeTokenCreate.ts
* 与 SlimeESTree.ts 中的 AST 类型一一对应
*/
var SlimeNodeCreate = class {
	commonLocType(node) {
		if (!node.loc) node.loc = {
			value: null,
			type: node.type,
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
		return node;
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

//#endregion
//#region src/SlimeTokenCreate.ts
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

//#endregion
export { SlimeNodeType, SlimeProgramSourceType };