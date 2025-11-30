import type * as ESTree from "estree";
import {
    SlimeAstType
} from "./SlimeAstType.ts";

import {
    SlimeTokenType,
    SlimeUpdateOperatorTokenTypes,
    SlimeUnaryOperatorTokenTypes,
    SlimeBinaryOperatorTokenTypes,
    SlimeLogicalOperatorTokenTypes,
    SlimeAssignmentOperatorTokenTypes,
} from "slime-token/src/SlimeTokensName";
import type {SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";

/**
 * 辅助类型：排除 ESTree 类型中与 Slime 冲突的属性
 * - loc: 使用 SubhutiSourceLocation 替代 SourceLocation
 * - leadingComments/trailingComments: 使用 SlimeComment[] 替代 Comment[]
 * - K: 可选的额外排除属性
 */
type SlimeExtends<T, K extends keyof any = never> = Omit<T, 'loc' | 'leadingComments' | 'trailingComments' | K>

export interface SlimeBaseNodeWithoutComments extends SlimeExtends<ESTree.BaseNodeWithoutComments> {
    // Every leaf interface Slimethat extends ESTree.that, SlimeBaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SubhutiSourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface SlimeBaseNode extends SlimeBaseNodeWithoutComments, SlimeExtends<ESTree.BaseNode> {
    leadingComments?: SlimeComment[] | undefined;
    trailingComments?: SlimeComment[] | undefined;
}

// ============================================
// Token 节点基础类型
// ============================================

/**
 * Token 节点基础类型
 * 所有 token 节点都继承此类型，包含 value 和位置信息
 */
export interface SlimeTokenNode extends SlimeBaseNodeWithoutComments {
    /** Token 原始值 */
    value: string;
}

// ============================================
// 变量声明关键字 Token
// ============================================

export interface SlimeVarToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Var;
    value: "var";
}

export interface SlimeLetToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Let;
    value: "let";
}

export interface SlimeConstToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Const;
    value: "const";
}

/** 变量声明关键字 Token 联合类型 */
export type SlimeVariableDeclarationKindToken = SlimeVarToken | SlimeLetToken | SlimeConstToken;

// ============================================
// 赋值运算符 Token
// ============================================

export interface SlimeAssignToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Assign;
    value: "=";
}

// ============================================
// 标点符号 Token
// ============================================

export interface SlimeSemicolonToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Semicolon;
    value: ";";
}

export interface SlimeLBraceToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.LBrace;
    value: "{";
}

export interface SlimeRBraceToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.RBrace;
    value: "}";
}

export interface SlimeLBracketToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.LBracket;
    value: "[";
}

export interface SlimeRBracketToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.RBracket;
    value: "]";
}

export interface SlimeLParenToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.LParen;
    value: "(";
}

export interface SlimeRParenToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.RParen;
    value: ")";
}

export interface SlimeCommaToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Comma;
    value: ",";
}

export interface SlimeColonToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Colon;
    value: ":";
}

// ============================================
// 通用 Token 组合接口
// ============================================

/** 包含大括号的节点 { } */
export interface SlimeBraceTokens {
    lBraceToken?: SlimeLBraceToken;
    rBraceToken?: SlimeRBraceToken;
}

/** 包含中括号的节点 [ ] */
export interface SlimeBracketTokens {
    lBracketToken?: SlimeLBracketToken;
    rBracketToken?: SlimeRBracketToken;
}

/** 包含小括号的节点 ( ) */
export interface SlimeParenTokens {
    lParenToken?: SlimeLParenToken;
    rParenToken?: SlimeRParenToken;
}

/** 函数结构：小括号 + 大括号 */
export interface SlimeFunctionTokens extends SlimeParenTokens, SlimeBraceTokens {
}

/** 包含冒号的节点 */
export interface SlimeColonTokens {
    colonToken?: SlimeColonToken;
}

/** 包含分号的节点 */
export interface SlimeSemicolonTokens {
    semicolonToken?: SlimeSemicolonToken;
}

// ============================================
// 关键字 Token
// ============================================

export interface SlimeFunctionToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Function;
    value: "function";
}

export interface SlimeAsyncToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Async;
    value: "async";
}

export interface SlimeAsteriskToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Asterisk;
    value: "*";
}

export interface SlimeArrowToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Arrow;
    value: "=>";
}

// 控制流关键字
export interface SlimeIfToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.If;
    value: "if";
}

export interface SlimeElseToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Else;
    value: "else";
}

export interface SlimeForToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.For;
    value: "for";
}

export interface SlimeWhileToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.While;
    value: "while";
}

export interface SlimeDoToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Do;
    value: "do";
}

export interface SlimeInToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.In;
    value: "in";
}

export interface SlimeOfToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Of;
    value: "of";
}

export interface SlimeSwitchToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Switch;
    value: "switch";
}

export interface SlimeCaseToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Case;
    value: "case";
}

export interface SlimeDefaultToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Default;
    value: "default";
}

export interface SlimeBreakToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Break;
    value: "break";
}

export interface SlimeContinueToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Continue;
    value: "continue";
}

export interface SlimeReturnToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Return;
    value: "return";
}

export interface SlimeThrowToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Throw;
    value: "throw";
}

export interface SlimeTryToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Try;
    value: "try";
}

export interface SlimeCatchToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Catch;
    value: "catch";
}

export interface SlimeFinallyToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Finally;
    value: "finally";
}

export interface SlimeWithToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.With;
    value: "with";
}

export interface SlimeDebuggerToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Debugger;
    value: "debugger";
}

export interface SlimeAwaitToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Await;
    value: "await";
}

export interface SlimeYieldToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Yield;
    value: "yield";
}

// 类相关关键字
export interface SlimeClassToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Class;
    value: "class";
}

export interface SlimeExtendsToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Extends;
    value: "extends";
}

export interface SlimeStaticToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Static;
    value: "static";
}

export interface SlimeGetToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Get;
    value: "get";
}

export interface SlimeSetToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Set;
    value: "set";
}

// 操作符关键字
export interface SlimeNewToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.New;
    value: "new";
}

export interface SlimeTypeofToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Typeof;
    value: "typeof";
}

export interface SlimeVoidToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Void;
    value: "void";
}

export interface SlimeDeleteToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Delete;
    value: "delete";
}

export interface SlimeInstanceofToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Instanceof;
    value: "instanceof";
}

// 模块关键字
export interface SlimeImportToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Import;
    value: "import";
}

export interface SlimeExportToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Export;
    value: "export";
}

export interface SlimeFromToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.From;
    value: "from";
}

export interface SlimeAsToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.As;
    value: "as";
}

// 展开运算符 (Ellipsis)
export interface SlimeEllipsisToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Ellipsis;
    value: "...";
}

// 点号
export interface SlimeDotToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Dot;
    value: ".";
}

// 可选链
export interface SlimeOptionalChainingToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.OptionalChaining;
    value: "?.";
}

// 问号
export interface SlimeQuestionToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Question;
    value: "?";
}

// ============================================
// 运算符 Token（用于表达式）
// ============================================

/** 二元运算符 Token */
export interface SlimeBinaryOperatorToken extends SlimeTokenNode {
    type: typeof SlimeBinaryOperatorTokenTypes[keyof typeof SlimeBinaryOperatorTokenTypes];
    value: SlimeBinaryOperator;
}

/** 一元运算符 Token */
export interface SlimeUnaryOperatorToken extends SlimeTokenNode {
    type: typeof SlimeUnaryOperatorTokenTypes[keyof typeof SlimeUnaryOperatorTokenTypes];
    value: SlimeUnaryOperator;
}

/** 逻辑运算符 Token */
export interface SlimeLogicalOperatorToken extends SlimeTokenNode {
    type: typeof SlimeLogicalOperatorTokenTypes[keyof typeof SlimeLogicalOperatorTokenTypes];
    value: SlimeLogicalOperator;
}

/** 赋值运算符 Token */
export interface SlimeAssignmentOperatorToken extends SlimeTokenNode {
    type: typeof SlimeAssignmentOperatorTokenTypes[keyof typeof SlimeAssignmentOperatorTokenTypes];
    value: SlimeAssignmentOperator;
}

/** 更新运算符 Token */
export interface SlimeUpdateOperatorToken extends SlimeTokenNode {
    type: typeof SlimeUpdateOperatorTokenTypes[keyof typeof SlimeUpdateOperatorTokenTypes];
    value: SlimeUpdateOperator;
}

export interface SlimeNodeMap {
    SlimeAssignmentProperty: SlimeAssignmentProperty;
    SlimeCatchClause: SlimeCatchClause;
    SlimeClass: SlimeClass;
    SlimeClassBody: SlimeClassBody;
    SlimeExpression: SlimeExpression;
    SlimeFunction: SlimeFunction;
    SlimeIdentifier: SlimeIdentifier;
    SlimeLiteral: SlimeLiteral;
    SlimeMethodDefinition: SlimeMethodDefinition;
    SlimeModuleDeclaration: SlimeModuleDeclaration;
    SlimeModuleSpecifier: SlimeModuleSpecifier;
    SlimePattern: SlimePattern;
    SlimePrivateIdentifier: SlimePrivateIdentifier;
    SlimeProgram: SlimeProgram;
    SlimeProperty: SlimeProperty;
    SlimePropertyDefinition: SlimePropertyDefinition;
    SlimeSpreadElement: SlimeSpreadElement;
    SlimeStatement: SlimeStatement;
    SlimeSuper: SlimeSuper;
    SlimeSwitchCase: SlimeSwitchCase;
    SlimeTemplateElement: SlimeTemplateElement;
    SlimeVariableDeclarator: SlimeVariableDeclarator;
}

export type SlimeNode = SlimeNodeMap[keyof SlimeNodeMap];

export interface SlimeComment extends SlimeBaseNodeWithoutComments, SlimeExtends<ESTree.Comment> {
    type: "Line" | "Block";
    value: string;
}

export interface SlimeProgram extends SlimeBaseNode, Omit<SlimeExtends<ESTree.Program>, 'body'> {
    type: typeof SlimeAstType.Program;
    sourceType: "script" | "module";
    body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>;
    comments?: SlimeComment[] | undefined;
}

export interface SlimeDirective extends SlimeBaseNode, Omit<SlimeExtends<ESTree.Directive>, 'expression'> {
    type: typeof SlimeAstType.ExpressionStatement;
    expression: SlimeLiteral;
    directive: string;
}

export interface SlimeBaseFunction extends SlimeBaseNode, Omit<SlimeExtends<ESTree.BaseFunction>, 'params' | 'body'>, SlimeFunctionTokens {
    params: SlimePattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    /** function 关键字 Token */
    functionToken?: SlimeFunctionToken;
    /** async 关键字 Token */
    asyncToken?: SlimeAsyncToken;
    /** generator * Token */
    asteriskToken?: SlimeAsteriskToken;
    /** 参数之间的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: SlimeBlockStatement | SlimeExpression;
}

export type SlimeFunction = SlimeFunctionDeclaration | SlimeFunctionExpression | SlimeArrowFunctionExpression;

export type SlimeStatement =
    | SlimeExpressionStatement
    | SlimeBlockStatement
    | SlimeStaticBlock
    | SlimeEmptyStatement
    | SlimeDebuggerStatement
    | SlimeWithStatement
    | SlimeReturnStatement
    | SlimeLabeledStatement
    | SlimeBreakStatement
    | SlimeContinueStatement
    | SlimeIfStatement
    | SlimeSwitchStatement
    | SlimeThrowStatement
    | SlimeTryStatement
    | SlimeWhileStatement
    | SlimeDoWhileStatement
    | SlimeForStatement
    | SlimeForInStatement
    | SlimeForOfStatement
    | SlimeDeclaration;

export interface SlimeBaseStatement extends SlimeBaseNode, SlimeExtends<ESTree.BaseStatement> {
}

export interface SlimeEmptyStatement extends SlimeBaseStatement, SlimeExtends<ESTree.EmptyStatement>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.EmptyStatement;
}

export interface SlimeBlockStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.BlockStatement>, 'body'>, SlimeBraceTokens {
    type: typeof SlimeAstType.BlockStatement;
    body: SlimeStatement[];
    innerComments?: SlimeComment[] | undefined;
}

export interface SlimeStaticBlock extends SlimeExtends<ESTree.StaticBlock, 'innerComments'>, Omit<SlimeBlockStatement, 'type' | 'body'> {
    type: typeof SlimeAstType.StaticBlock;
}

export interface SlimeExpressionStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ExpressionStatement>, 'expression'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ExpressionStatement;
    expression: SlimeExpression;
}

export interface SlimeIfStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.IfStatement>, 'test' | 'consequent' | 'alternate'>, SlimeParenTokens {
    type: typeof SlimeAstType.IfStatement;
    test: SlimeExpression;
    consequent: SlimeStatement;
    alternate?: SlimeStatement | null | undefined;
    /** if 关键字 Token */
    ifToken?: SlimeIfToken;
    /** else 关键字 Token */
    elseToken?: SlimeElseToken;
}

export interface SlimeLabeledStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.LabeledStatement>, 'label' | 'body'> {
    type: typeof SlimeAstType.LabeledStatement;
    label: SlimeIdentifier;
    body: SlimeStatement;
}

export interface SlimeBreakStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.BreakStatement>, 'label'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.BreakStatement;
    label?: SlimeIdentifier | null | undefined;
    /** break 关键字 Token */
    breakToken?: SlimeBreakToken;
}

export interface SlimeContinueStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ContinueStatement>, 'label'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ContinueStatement;
    label?: SlimeIdentifier | null | undefined;
    /** continue 关键字 Token */
    continueToken?: SlimeContinueToken;
}

export interface SlimeWithStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.WithStatement>, 'object' | 'body'>, SlimeParenTokens {
    type: typeof SlimeAstType.WithStatement;
    object: SlimeExpression;
    body: SlimeStatement;
    /** with 关键字 Token */
    withToken?: SlimeWithToken;
}

export interface SlimeSwitchStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.SwitchStatement>, 'discriminant' | 'cases'>, SlimeParenTokens, SlimeBraceTokens {
    type: typeof SlimeAstType.SwitchStatement;
    discriminant: SlimeExpression;
    cases: SlimeSwitchCase[];
    /** switch 关键字 Token */
    switchToken?: SlimeSwitchToken;
}

export interface SlimeReturnStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ReturnStatement>, 'argument'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ReturnStatement;
    argument?: SlimeExpression | null | undefined;
    /** return 关键字 Token */
    returnToken?: SlimeReturnToken;
}

export interface SlimeThrowStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ThrowStatement>, 'argument'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ThrowStatement;
    argument: SlimeExpression;
    /** throw 关键字 Token */
    throwToken?: SlimeThrowToken;
}

export interface SlimeTryStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.TryStatement>, 'block' | 'handler' | 'finalizer'> {
    type: typeof SlimeAstType.TryStatement;
    block: SlimeBlockStatement;
    handler?: SlimeCatchClause | null | undefined;
    finalizer?: SlimeBlockStatement | null | undefined;
    /** try 关键字 Token */
    tryToken?: SlimeTryToken;
    /** finally 关键字 Token */
    finallyToken?: SlimeFinallyToken;
}

export interface SlimeWhileStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.WhileStatement>, 'test' | 'body'>, SlimeParenTokens {
    type: typeof SlimeAstType.WhileStatement;
    test: SlimeExpression;
    body: SlimeStatement;
    /** while 关键字 Token */
    whileToken?: SlimeWhileToken;
}

export interface SlimeDoWhileStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.DoWhileStatement>, 'body' | 'test'>, SlimeParenTokens, SlimeSemicolonTokens {
    type: typeof SlimeAstType.DoWhileStatement;
    body: SlimeStatement;
    test: SlimeExpression;
    /** do 关键字 Token */
    doToken?: SlimeDoToken;
    /** while 关键字 Token */
    whileToken?: SlimeWhileToken;
}

export interface SlimeForStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ForStatement>, 'init' | 'test' | 'update' | 'body'>, SlimeParenTokens {
    type: typeof SlimeAstType.ForStatement;
    init?: SlimeVariableDeclaration | SlimeExpression | null | undefined;
    test?: SlimeExpression | null | undefined;
    update?: SlimeExpression | null | undefined;
    body: SlimeStatement;
    /** for 关键字 Token */
    forToken?: SlimeForToken;
    /** 第一个分号 */
    semicolon1Token?: SlimeSemicolonToken;
    /** 第二个分号 */
    semicolon2Token?: SlimeSemicolonToken;
}

export interface SlimeBaseForXStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.BaseForXStatement>, 'left' | 'right' | 'body'>, SlimeParenTokens {
    left: SlimeVariableDeclaration | SlimePattern;
    right: SlimeExpression;
    body: SlimeStatement;
    /** for 关键字 Token */
    forToken?: SlimeForToken;
}

export interface SlimeForInStatement extends SlimeBaseForXStatement, Omit<SlimeExtends<ESTree.ForInStatement>, 'body' | 'left' | 'right'> {
    type: typeof SlimeAstType.ForInStatement;
    /** in 关键字 Token */
    inToken?: SlimeInToken;
}

export interface SlimeDebuggerStatement extends SlimeBaseStatement, SlimeExtends<ESTree.DebuggerStatement>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.DebuggerStatement;
    /** debugger 关键字 Token */
    debuggerToken?: SlimeDebuggerToken;
}

export type SlimeDeclaration = SlimeFunctionDeclaration | SlimeVariableDeclaration | SlimeClassDeclaration;

export interface SlimeBaseDeclaration extends SlimeBaseStatement, SlimeExtends<ESTree.BaseDeclaration> {
}

export interface SlimeMaybeNamedFunctionDeclaration extends SlimeBaseFunction, SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.MaybeNamedFunctionDeclaration>, 'params' | 'body' | 'id'> {
    type: typeof SlimeAstType.FunctionDeclaration;
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: SlimeIdentifier | null;
    body: SlimeBlockStatement;
}

export interface SlimeFunctionDeclaration extends SlimeMaybeNamedFunctionDeclaration, Omit<SlimeExtends<ESTree.FunctionDeclaration>, 'body' | 'params'> {
    id: SlimeIdentifier;
}

export interface SlimeVariableDeclaration extends SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.VariableDeclaration>, 'kind'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.VariableDeclaration;
    declarations: SlimeVariableDeclarator[];
    /** 变量声明关键字 Token (var/let/const) */
    kind: SlimeVariableDeclarationKindToken;
}

export interface SlimeVariableDeclarator extends SlimeBaseNode, Omit<SlimeExtends<ESTree.VariableDeclarator>, 'id' | 'init'> {
    type: typeof SlimeAstType.VariableDeclarator;
    id: SlimePattern;
    init?: SlimeExpression | null | undefined;
    /** 赋值符号 Token，包含位置信息 */
    assignToken?: SlimeAssignToken;
}

export interface SlimeExpressionMap {
    SlimeArrayExpression: SlimeArrayExpression;
    SlimeArrowFunctionExpression: SlimeArrowFunctionExpression;
    SlimeAssignmentExpression: SlimeAssignmentExpression;
    SlimeAwaitExpression: SlimeAwaitExpression;
    SlimeBinaryExpression: SlimeBinaryExpression;
    SlimeCallExpression: SlimeCallExpression;
    SlimeChainExpression: SlimeChainExpression;
    SlimeClassExpression: SlimeClassExpression;
    SlimeConditionalExpression: SlimeConditionalExpression;
    SlimeFunctionExpression: SlimeFunctionExpression;
    SlimeIdentifier: SlimeIdentifier;
    SlimeImportExpression: SlimeImportExpression;
    SlimeLiteral: SlimeLiteral;
    SlimeLogicalExpression: SlimeLogicalExpression;
    SlimeMemberExpression: SlimeMemberExpression;
    SlimeMetaProperty: SlimeMetaProperty;
    SlimeNewExpression: SlimeNewExpression;
    SlimeObjectExpression: SlimeObjectExpression;
    SlimeSequenceExpression: SlimeSequenceExpression;
    SlimeTaggedTemplateExpression: SlimeTaggedTemplateExpression;
    SlimeTemplateLiteral: SlimeTemplateLiteral;
    SlimeThisExpression: SlimeThisExpression;
    SlimeUnaryExpression: SlimeUnaryExpression;
    SlimeUpdateExpression: SlimeUpdateExpression;
    SlimeYieldExpression: SlimeYieldExpression;
}

export type SlimeExpression = ESTree.Expression & SlimeExpressionMap[keyof SlimeExpressionMap];

export interface SlimeBaseExpression extends SlimeBaseNode, SlimeExtends<ESTree.BaseExpression> {
}

export type SlimeChainElement = SlimeSimpleCallExpression | SlimeMemberExpression;

export interface SlimeChainExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ChainExpression>, 'expression'> {
    type: typeof SlimeAstType.ChainExpression;
    expression: SlimeChainElement;
}

export interface SlimeThisExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ThisExpression> {
    type: typeof SlimeAstType.ThisExpression;
}

export interface SlimeArrayExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ArrayExpression>, 'elements'>, SlimeBracketTokens {
    type: typeof SlimeAstType.ArrayExpression;
    elements: Array<SlimeExpression | SlimeSpreadElement | null>;
    /** commaTokens[i] 对应 elements[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeObjectExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ObjectExpression>, 'properties'>, SlimeBraceTokens {
    type: typeof SlimeAstType.ObjectExpression;
    properties: Array<SlimeProperty | SlimeSpreadElement>;
    /** commaTokens[i] 对应 properties[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimePrivateIdentifier extends SlimeBaseNode, SlimeExtends<ESTree.PrivateIdentifier> {
    type: typeof SlimeAstType.PrivateIdentifier;
    name: string;
}

export interface SlimeProperty extends SlimeBaseNode, Omit<SlimeExtends<ESTree.Property>, 'key' | 'value'>, SlimeColonTokens, SlimeBracketTokens {
    type: typeof SlimeAstType.Property;
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeExpression | SlimePattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    /** get 关键字 Token */
    getToken?: SlimeGetToken;
    /** set 关键字 Token */
    setToken?: SlimeSetToken;
    /** async 关键字 Token */
    asyncToken?: SlimeAsyncToken;
    /** * Token (generator) */
    asteriskToken?: SlimeAsteriskToken;
    shorthand: boolean;
    computed: boolean;
}

export interface SlimePropertyDefinition extends SlimeBaseNode, Omit<SlimeExtends<ESTree.PropertyDefinition>, 'key' | 'value'> {
    type: typeof SlimeAstType.PropertyDefinition;
    key: SlimeExpression | SlimePrivateIdentifier;
    value?: SlimeExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface SlimeFunctionExpression extends SlimeBaseFunction, SlimeBaseExpression, Omit<SlimeExtends<ESTree.FunctionExpression>, 'params' | 'body' | 'id'> {
    id?: SlimeIdentifier | null | undefined;
    type: typeof SlimeAstType.FunctionExpression;
    body: SlimeBlockStatement;
}

export interface SlimeSequenceExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.SequenceExpression>, 'expressions'> {
    type: typeof SlimeAstType.SequenceExpression;
    expressions: SlimeExpression[];
}

export interface SlimeUnaryExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.UnaryExpression>, 'operator'> {
    type: typeof SlimeAstType.UnaryExpression;
    /** 运算符 Token */
    operator: SlimeUnaryOperatorToken;
    prefix: true;
    argument: SlimeExpression;
}

export interface SlimeBinaryExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.BinaryExpression>, 'operator'> {
    type: typeof SlimeAstType.BinaryExpression;
    /** 运算符 Token */
    operator: SlimeBinaryOperatorToken;
    left: SlimeExpression | SlimePrivateIdentifier;
    right: SlimeExpression;
}

export interface SlimeAssignmentExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.AssignmentExpression>, 'operator'> {
    type: typeof SlimeAstType.AssignmentExpression;
    /** 运算符 Token */
    operator: SlimeAssignmentOperatorToken;
    left: SlimePattern | SlimeMemberExpression;
    right: SlimeExpression;
}

export interface SlimeUpdateExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.UpdateExpression>, 'operator'> {
    type: typeof SlimeAstType.UpdateExpression;
    /** 运算符 Token */
    operator: SlimeUpdateOperatorToken;
    argument: SlimeExpression;
    prefix: boolean;
}

export interface SlimeLogicalExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.LogicalExpression>, 'operator' | 'left' | 'right'> {
    type: typeof SlimeAstType.LogicalExpression;
    /** 运算符 Token */
    operator: SlimeLogicalOperatorToken;
    left: SlimeExpression;
    right: SlimeExpression;
}

export interface SlimeConditionalExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ConditionalExpression>, 'test' | 'alternate' | 'consequent'>, SlimeColonTokens {
    type: typeof SlimeAstType.ConditionalExpression;
    test: SlimeExpression;
    alternate: SlimeExpression;
    consequent: SlimeExpression;
    /** ? Token */
    questionToken?: SlimeQuestionToken;
}

export interface SlimeBaseCallExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.BaseCallExpression>, 'callee' | 'arguments'>, SlimeParenTokens {
    callee: SlimeExpression | SlimeSuper;
    arguments: Array<SlimeExpression | SlimeSpreadElement>;
    /** 参数之间的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export type SlimeCallExpression = SlimeSimpleCallExpression | SlimeNewExpression;

export interface SlimeSimpleCallExpression extends SlimeBaseCallExpression, Omit<SlimeExtends<ESTree.SimpleCallExpression>, 'arguments' | 'callee'> {
    type: typeof SlimeAstType.CallExpression;
    optional: boolean;
}

export interface SlimeNewExpression extends SlimeBaseCallExpression, Omit<SlimeExtends<ESTree.NewExpression>, 'arguments' | 'callee'> {
    type: typeof SlimeAstType.NewExpression;
    /** new 关键字 Token */
    newToken?: SlimeNewToken;
}

export interface SlimeMemberExpression extends SlimeBaseExpression, SlimeBasePattern, Omit<SlimeExtends<ESTree.MemberExpression>, 'object' | 'property'>, SlimeBracketTokens {
    type: typeof SlimeAstType.MemberExpression;
    object: SlimeExpression | SlimeSuper;
    property: SlimeExpression | SlimePrivateIdentifier;
    computed: boolean;
    optional: boolean;
    /** 点号 Token (非计算属性) */
    dotToken?: SlimeDotToken;
    /** 可选链 Token ?. */
    optionalChainingToken?: SlimeOptionalChainingToken;
}

export type SlimePattern =
    SlimeIdentifier
    | SlimeObjectPattern
    | SlimeArrayPattern
    | SlimeRestElement
    | SlimeAssignmentPattern
    | SlimeMemberExpression;

export interface SlimeBasePattern extends SlimeBaseNode, SlimeExtends<ESTree.BasePattern> {
}

export interface SlimeSwitchCase extends SlimeBaseNode, Omit<SlimeExtends<ESTree.SwitchCase>, 'test' | 'consequent'>, SlimeColonTokens {
    type: typeof SlimeAstType.SwitchCase;
    test?: SlimeExpression | null | undefined;
    consequent: SlimeStatement[];
    /** case 关键字 Token (如果是 case) */
    caseToken?: SlimeCaseToken;
    /** default 关键字 Token (如果是 default) */
    defaultToken?: SlimeDefaultToken;
}

export interface SlimeCatchClause extends SlimeBaseNode, Omit<SlimeExtends<ESTree.CatchClause>, 'param' | 'body'>, SlimeParenTokens {
    type: typeof SlimeAstType.CatchClause;
    param: SlimePattern | null;
    body: SlimeBlockStatement;
    /** catch 关键字 Token */
    catchToken?: SlimeCatchToken;
}

export interface SlimeIdentifier extends SlimeBaseNode, SlimeBaseExpression, SlimeBasePattern, SlimeExtends<ESTree.Identifier> {
    type: typeof SlimeAstType.Identifier;
    name: string;
}

export type SlimeLiteral = SlimeSimpleLiteral | SlimeRegExpLiteral | SlimeBigIntLiteral;

export interface SlimeSimpleLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.SimpleLiteral> {
    type: typeof SlimeAstType.Literal;
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface SlimeRegExpLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.RegExpLiteral> {
    type: typeof SlimeAstType.Literal;
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface SlimeBigIntLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.BigIntLiteral> {
    type: typeof SlimeAstType.Literal;
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

export type SlimeUnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

export type SlimeBinaryOperator =
    | "=="
    | "!="
    | "==="
    | "!=="
    | "<"
    | "<="
    | ">"
    | ">="
    | "<<"
    | ">>"
    | ">>>"
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "**"
    | "|"
    | "^"
    | "&"
    | "in"
    | "instanceof";

export type SlimeLogicalOperator = "||" | "&&" | "??";

export type SlimeAssignmentOperator =
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "**="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&="
    | "||="
    | "&&="
    | "??=";

export type SlimeUpdateOperator = "++" | "--";

export interface SlimeForOfStatement extends SlimeBaseForXStatement, Omit<SlimeExtends<ESTree.ForOfStatement>, 'body' | 'left' | 'right'> {
    type: typeof SlimeAstType.ForOfStatement;
    await: boolean;
    /** of 关键字 Token */
    ofToken?: SlimeOfToken;
    /** await 关键字 Token (for await...of) */
    awaitToken?: SlimeAwaitToken;
}

export interface SlimeSuper extends SlimeBaseNode, SlimeExtends<ESTree.Super> {
    type: typeof SlimeAstType.Super;
}

export interface SlimeSpreadElement extends SlimeBaseNode, Omit<SlimeExtends<ESTree.SpreadElement>, 'argument'> {
    type: typeof SlimeAstType.SpreadElement;
    argument: SlimeExpression;
    /** ... 展开运算符 Token */
    ellipsisToken?: SlimeEllipsisToken;
}

export interface SlimeArrowFunctionExpression extends SlimeBaseExpression, SlimeBaseFunction, Omit<SlimeExtends<ESTree.ArrowFunctionExpression>, 'params' | 'body'> {
    type: typeof SlimeAstType.ArrowFunctionExpression;
    expression: boolean;
    body: SlimeBlockStatement | SlimeExpression;
    /** 箭头 Token => */
    arrowToken?: SlimeArrowToken;
}

export interface SlimeYieldExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.YieldExpression>, 'argument'> {
    type: typeof SlimeAstType.YieldExpression;
    argument?: SlimeExpression | null | undefined;
    delegate: boolean;
    /** yield 关键字 Token */
    yieldToken?: SlimeYieldToken;
    /** * Token (delegate yield) */
    asteriskToken?: SlimeAsteriskToken;
}

export interface SlimeTemplateLiteral extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.TemplateLiteral>, 'quasis' | 'expressions'> {
    type: typeof SlimeAstType.TemplateLiteral;
    quasis: SlimeTemplateElement[];
    expressions: SlimeExpression[];
}

export interface SlimeTaggedTemplateExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.TaggedTemplateExpression>, 'tag' | 'quasi'> {
    type: typeof SlimeAstType.TaggedTemplateExpression;
    tag: SlimeExpression;
    quasi: SlimeTemplateLiteral;
}

export interface SlimeTemplateElement extends SlimeBaseNode, SlimeExtends<ESTree.TemplateElement> {
    type: typeof SlimeAstType.TemplateElement;
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface SlimeAssignmentProperty extends SlimeProperty, Omit<SlimeExtends<ESTree.AssignmentProperty>, 'key'> {
    value: SlimePattern;
    kind: "init";
    method: boolean; // false
}

export interface SlimeObjectPattern extends SlimeBasePattern, Omit<SlimeExtends<ESTree.ObjectPattern>, 'properties'>, SlimeBraceTokens {
    type: typeof SlimeAstType.ObjectPattern;
    properties: Array<SlimeAssignmentProperty | SlimeRestElement>;
    /** commaTokens[i] 对应 properties[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeArrayPattern extends SlimeBasePattern, Omit<SlimeExtends<ESTree.ArrayPattern>, 'elements'>, SlimeBracketTokens {
    type: typeof SlimeAstType.ArrayPattern;
    elements: Array<SlimePattern | null>;
    /** commaTokens[i] 对应 elements[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeRestElement extends SlimeBasePattern, Omit<SlimeExtends<ESTree.RestElement>, 'argument'> {
    type: typeof SlimeAstType.RestElement;
    argument: SlimePattern;
    /** ... 展开运算符 Token */
    ellipsisToken?: SlimeEllipsisToken;
}

export interface SlimeAssignmentPattern extends SlimeBasePattern, Omit<SlimeExtends<ESTree.AssignmentPattern>, 'left' | 'right'> {
    type: typeof SlimeAstType.AssignmentPattern;
    left: SlimePattern;
    right: SlimeExpression;
}

export type SlimeClass = SlimeClassDeclaration | SlimeClassExpression;

export interface SlimeBaseClass extends SlimeBaseNode, Omit<SlimeExtends<ESTree.BaseClass>, 'superClass' | 'body'> {
    superClass?: SlimeExpression | null | undefined;
    body: SlimeClassBody;
    /** class 关键字 Token */
    classToken?: SlimeClassToken;
    /** extends 关键字 Token */
    extendsToken?: SlimeExtendsToken;
}

export interface SlimeClassBody extends SlimeBaseNode, Omit<SlimeExtends<ESTree.ClassBody>, 'body'>, SlimeBraceTokens {
    type: typeof SlimeAstType.ClassBody;
    body: Array<SlimeMethodDefinition | SlimePropertyDefinition | SlimeStaticBlock>;
}

export interface SlimeMethodDefinition extends SlimeBaseNode, Omit<SlimeExtends<ESTree.MethodDefinition>, 'value' | 'key'> {
    type: typeof SlimeAstType.MethodDefinition;
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeFunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
    /** static 关键字 Token */
    staticToken?: SlimeStaticToken;
    /** get 关键字 Token */
    getToken?: SlimeGetToken;
    /** set 关键字 Token */
    setToken?: SlimeSetToken;
    /** async 关键字 Token */
    asyncToken?: SlimeAsyncToken;
    /** generator * Token */
    asteriskToken?: SlimeAsteriskToken;
}

export interface SlimeMaybeNamedClassDeclaration extends SlimeBaseClass, SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.MaybeNamedClassDeclaration>, 'body' | 'superClass'> {
    type: typeof SlimeAstType.ClassDeclaration;
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: SlimeIdentifier | null;
}

export interface SlimeClassDeclaration extends SlimeMaybeNamedClassDeclaration, Omit<SlimeExtends<ESTree.ClassDeclaration>, 'body' | 'superClass'> {
    id: SlimeIdentifier;
}

export interface SlimeClassExpression extends SlimeBaseClass, SlimeBaseExpression, Omit<SlimeExtends<ESTree.ClassExpression>, 'body' | 'superClass'> {
    type: typeof SlimeAstType.ClassExpression;
    id?: SlimeIdentifier | null | undefined;
}

export interface SlimeMetaProperty extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.MetaProperty>, 'meta' | 'property'> {
    type: typeof SlimeAstType.MetaProperty;
    meta: SlimeIdentifier;
    property: SlimeIdentifier;
}

export type SlimeModuleDeclaration =
    | SlimeImportDeclaration
    | SlimeExportNamedDeclaration
    | SlimeExportDefaultDeclaration
    | SlimeExportAllDeclaration;

export interface SlimeBaseModuleDeclaration extends SlimeBaseNode, SlimeExtends<ESTree.BaseModuleDeclaration> {
}

export type SlimeModuleSpecifier =
    SlimeImportSpecifier
    | SlimeImportDefaultSpecifier
    | SlimeImportNamespaceSpecifier
    | SlimeExportSpecifier;

export interface SlimeBaseModuleSpecifier extends SlimeBaseNode, SlimeExtends<ESTree.BaseModuleSpecifier> {
    local: SlimeIdentifier;
}

export interface SlimeImportDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ImportDeclaration>, 'specifiers' | 'source'>, SlimeBraceTokens, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ImportDeclaration;
    specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>;
    source: SlimeLiteral;
    /** import 关键字 Token */
    importToken?: SlimeImportToken;
    /** from 关键字 Token */
    fromToken?: SlimeFromToken;
    /** specifiers 之间的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeImportSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportSpecifier, 'local'> {
    type: typeof SlimeAstType.ImportSpecifier;
    imported: SlimeIdentifier | SlimeLiteral;
    /** as 关键字 Token */
    asToken?: SlimeAsToken;
}

export interface SlimeImportExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ImportExpression>, 'source'>, SlimeParenTokens {
    type: typeof SlimeAstType.ImportExpression;
    source: SlimeExpression;
    /** import 关键字 Token */
    importToken?: SlimeImportToken;
}

export interface SlimeImportDefaultSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportDefaultSpecifier, 'local'> {
    type: typeof SlimeAstType.ImportDefaultSpecifier;
}

export interface SlimeImportNamespaceSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportNamespaceSpecifier, 'local'> {
    type: typeof SlimeAstType.ImportNamespaceSpecifier;
    /** * Token */
    asteriskToken?: SlimeAsteriskToken;
    /** as 关键字 Token */
    asToken?: SlimeAsToken;
}

export interface SlimeExportNamedDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ExportNamedDeclaration>, 'declaration'>, SlimeBraceTokens, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ExportNamedDeclaration;
    declaration?: SlimeDeclaration | null | undefined;
    specifiers: SlimeExportSpecifier[];
    source?: SlimeLiteral | null | undefined;
    /** export 关键字 Token */
    exportToken?: SlimeExportToken;
    /** from 关键字 Token */
    fromToken?: SlimeFromToken;
    /** specifiers 之间的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeExportSpecifier extends Omit<SlimeExtends<ESTree.ExportSpecifier>, 'local' | 'exported'>, Omit<SlimeBaseModuleSpecifier, 'local'> {
    type: typeof SlimeAstType.ExportSpecifier;
    local: SlimeIdentifier | SlimeLiteral;
    exported: SlimeIdentifier | SlimeLiteral;
    /** as 关键字 Token */
    asToken?: SlimeAsToken;
}

export interface SlimeExportDefaultDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ExportDefaultDeclaration>, 'declaration'> {
    type: typeof SlimeAstType.ExportDefaultDeclaration;
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression;
    /** export 关键字 Token */
    exportToken?: SlimeExportToken;
    /** default 关键字 Token */
    defaultToken?: SlimeDefaultToken;
}

export interface SlimeExportAllDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ExportAllDeclaration>, 'exported' | 'source'>, SlimeSemicolonTokens {
    type: typeof SlimeAstType.ExportAllDeclaration;
    exported: SlimeIdentifier | SlimeLiteral | null;
    source: SlimeLiteral;
    /** export 关键字 Token */
    exportToken?: SlimeExportToken;
    /** * Token */
    asteriskToken?: SlimeAsteriskToken;
    /** as 关键字 Token */
    asToken?: SlimeAsToken;
    /** from 关键字 Token */
    fromToken?: SlimeFromToken;
}

export interface SlimeAwaitExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.AwaitExpression>, 'argument'> {
    type: typeof SlimeAstType.AwaitExpression;
    argument: SlimeExpression;
    /** await 关键字 Token */
    awaitToken?: SlimeAwaitToken;
}
