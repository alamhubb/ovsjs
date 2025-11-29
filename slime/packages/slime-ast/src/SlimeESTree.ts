/**
 * SlimeESTree.ts - ESTree 兼容的 AST 接口定义
 *
 * 设计原则：
 * 1. 核心字段完全兼容 ESTree 规范
 * 2. type 字符串使用 ESTree 标准值（如 "Identifier"）
 * 3. Token 信息作为可选字段**展平**到节点上（不嵌套）
 * 4. 双继承：同时继承 ESTree 类型 + Slime 基础类型
 *
 * @see https://github.com/estree/estree
 */

import type * as ESTree from './estree'
import type { SlimeTokenNode, SlimeBaseNode } from './SlimeTokenNodes'
import type { SubhutiSourceLocation } from '../../../../subhuti/src/struct/SubhutiCst'

// ============================================
// 重新导出基础类型
// ============================================
export type { SlimeTokenNode, SlimeBaseNode } from './SlimeTokenNodes'
export type { SubhutiSourceLocation } from '../../../../subhuti/src/struct/SubhutiCst'
export type SlimePosition = ESTree.Position
export type SlimeComment = ESTree.Comment

// ============================================
// Slime 通用 Token 扩展字段（mixin 接口）
// ============================================

/** 通用的括号 Token 字段 */
export interface SlimeParenTokens {
    lParen?: SlimeTokenNode
    rParen?: SlimeTokenNode
}

/** 通用的花括号 Token 字段 */
export interface SlimeBraceTokens {
    lBrace?: SlimeTokenNode
    rBrace?: SlimeTokenNode
}

/** 通用的方括号 Token 字段 */
export interface SlimeBracketTokens {
    lBracket?: SlimeTokenNode
    rBracket?: SlimeTokenNode
}

/** 通用的逗号分隔列表 Token 字段 */
export interface SlimeCommaListTokens {
    commas?: SlimeTokenNode[]
    trailingComma?: SlimeTokenNode
}

// ============================================
// Slime 扩展的 ESTree 类型
// 双继承：ESTree 类型 + SlimeBaseNode（位置信息）
// Token 信息展平为可选字段
// ============================================

// --- 基础节点（双继承） ---
export interface SlimeNode extends ESTree.BaseNode, SlimeBaseNode {
    type: string
    loc: SubhutiSourceLocation  // Slime 的位置信息（必需）
}

// --- Program ---
export interface SlimeProgram extends ESTree.Program, SlimeNode {
    type: "Program"
    body: (SlimeDirective | SlimeStatement | SlimeModuleDeclaration)[]
}

export interface SlimeDirective extends ESTree.Directive, SlimeNode {
    type: "ExpressionStatement"
    semicolon?: SlimeTokenNode
}

// --- Identifier ---
export interface SlimeIdentifier extends ESTree.Identifier, SlimeNode {
    type: "Identifier"
    // ESTree: name
    // Slime 扩展: token 信息
    token?: SlimeTokenNode
}

// --- PrivateIdentifier ---
export interface SlimePrivateIdentifier extends ESTree.PrivateIdentifier, SlimeNode {
    type: "PrivateIdentifier"
    token?: SlimeTokenNode
}

// --- Literals ---
export interface SlimeLiteral extends ESTree.Literal, SlimeNode {
    type: "Literal"
    // ESTree: value, raw
    // Slime 扩展
    token?: SlimeTokenNode
}

export interface SlimeSimpleLiteral extends ESTree.SimpleLiteral, SlimeNode {
    type: "Literal"
    token?: SlimeTokenNode
}

export interface SlimeRegExpLiteral extends ESTree.RegExpLiteral, SlimeNode {
    type: "Literal"
    token?: SlimeTokenNode
}

export interface SlimeBigIntLiteral extends ESTree.BigIntLiteral, SlimeNode {
    type: "Literal"
    token?: SlimeTokenNode
}

export interface SlimeNullLiteral extends SlimeSimpleLiteral {
    value: null
}

export interface SlimeBooleanLiteral extends SlimeSimpleLiteral {
    value: boolean
}

export interface SlimeNumericLiteral extends SlimeSimpleLiteral {
    value: number
}

export interface SlimeStringLiteral extends SlimeSimpleLiteral {
    value: string
}

// --- Statements ---
export type SlimeStatement =
    | SlimeExpressionStatement
    | SlimeBlockStatement
    | SlimeEmptyStatement
    | SlimeDebuggerStatement
    | SlimeReturnStatement
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
    | SlimeLabeledStatement
    | SlimeWithStatement
    | SlimeVariableDeclaration
    | SlimeFunctionDeclaration
    | SlimeClassDeclaration

export interface SlimeExpressionStatement extends ESTree.ExpressionStatement, SlimeNode {
    type: "ExpressionStatement"
    expression: SlimeExpression
    semicolon?: SlimeTokenNode
}

export interface SlimeBlockStatement extends ESTree.BlockStatement, SlimeNode, SlimeBraceTokens {
    type: "BlockStatement"
    body: SlimeStatement[]
}

export interface SlimeStaticBlock extends ESTree.StaticBlock, SlimeNode, SlimeBraceTokens {
    type: "StaticBlock"
    body: SlimeStatement[]
    staticKeyword?: SlimeTokenNode
}

export interface SlimeEmptyStatement extends ESTree.EmptyStatement, SlimeNode {
    type: "EmptyStatement"
    semicolon?: SlimeTokenNode
}

export interface SlimeDebuggerStatement extends ESTree.DebuggerStatement, SlimeNode {
    type: "DebuggerStatement"
    debuggerKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeReturnStatement extends Omit<ESTree.ReturnStatement, 'argument'>, SlimeNode {
    type: "ReturnStatement"
    argument: SlimeExpression | null
    returnKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeBreakStatement extends ESTree.BreakStatement, SlimeNode {
    type: "BreakStatement"
    label: SlimeIdentifier | null
    breakKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeContinueStatement extends ESTree.ContinueStatement, SlimeNode {
    type: "ContinueStatement"
    label: SlimeIdentifier | null
    continueKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeLabeledStatement extends ESTree.LabeledStatement, SlimeNode {
    type: "LabeledStatement"
    label: SlimeIdentifier
    body: SlimeStatement
    colon?: SlimeTokenNode
}

export interface SlimeWithStatement extends Omit<ESTree.WithStatement, 'object' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "WithStatement"
    object: SlimeExpression
    body: SlimeStatement
    withKeyword?: SlimeTokenNode
}

export interface SlimeIfStatement extends Omit<ESTree.IfStatement, 'test' | 'consequent' | 'alternate'>, SlimeNode, SlimeParenTokens {
    type: "IfStatement"
    test: SlimeExpression
    consequent: SlimeStatement
    alternate: SlimeStatement | null
    ifKeyword?: SlimeTokenNode
    elseKeyword?: SlimeTokenNode
}

export interface SlimeSwitchStatement extends Omit<ESTree.SwitchStatement, 'discriminant' | 'cases'>, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "SwitchStatement"
    discriminant: SlimeExpression
    cases: SlimeSwitchCase[]
    switchKeyword?: SlimeTokenNode
}

export interface SlimeSwitchCase extends Omit<ESTree.SwitchCase, 'test' | 'consequent'>, SlimeNode {
    type: "SwitchCase"
    test: SlimeExpression | null
    consequent: SlimeStatement[]
    caseKeyword?: SlimeTokenNode
    defaultKeyword?: SlimeTokenNode
    colon?: SlimeTokenNode
}

export interface SlimeThrowStatement extends Omit<ESTree.ThrowStatement, 'argument'>, SlimeNode {
    type: "ThrowStatement"
    argument: SlimeExpression
    throwKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeTryStatement extends Omit<ESTree.TryStatement, 'block' | 'handler' | 'finalizer'>, SlimeNode {
    type: "TryStatement"
    block: SlimeBlockStatement
    handler: SlimeCatchClause | null
    finalizer: SlimeBlockStatement | null
    tryKeyword?: SlimeTokenNode
    finallyKeyword?: SlimeTokenNode
}

export interface SlimeCatchClause extends Omit<ESTree.CatchClause, 'param' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "CatchClause"
    param: SlimePattern | null
    body: SlimeBlockStatement
    catchKeyword?: SlimeTokenNode
}

export interface SlimeWhileStatement extends Omit<ESTree.WhileStatement, 'test' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "WhileStatement"
    test: SlimeExpression
    body: SlimeStatement
    whileKeyword?: SlimeTokenNode
}

export interface SlimeDoWhileStatement extends Omit<ESTree.DoWhileStatement, 'body' | 'test'>, SlimeNode, SlimeParenTokens {
    type: "DoWhileStatement"
    body: SlimeStatement
    test: SlimeExpression
    doKeyword?: SlimeTokenNode
    whileKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeForStatement extends Omit<ESTree.ForStatement, 'init' | 'test' | 'update' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "ForStatement"
    init: SlimeVariableDeclaration | SlimeExpression | null
    test: SlimeExpression | null
    update: SlimeExpression | null
    body: SlimeStatement
    forKeyword?: SlimeTokenNode
    semicolon1?: SlimeTokenNode
    semicolon2?: SlimeTokenNode
}

export interface SlimeForInStatement extends Omit<ESTree.ForInStatement, 'left' | 'right' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "ForInStatement"
    left: SlimeVariableDeclaration | SlimePattern
    right: SlimeExpression
    body: SlimeStatement
    forKeyword?: SlimeTokenNode
    inKeyword?: SlimeTokenNode
}

export interface SlimeForOfStatement extends Omit<ESTree.ForOfStatement, 'left' | 'right' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "ForOfStatement"
    left: SlimeVariableDeclaration | SlimePattern
    right: SlimeExpression
    body: SlimeStatement
    await: boolean
    forKeyword?: SlimeTokenNode
    awaitKeyword?: SlimeTokenNode
    ofKeyword?: SlimeTokenNode
}

// --- Declarations ---
export type SlimeDeclaration =
    | SlimeFunctionDeclaration
    | SlimeVariableDeclaration
    | SlimeClassDeclaration

export interface SlimeFunctionDeclaration extends Omit<ESTree.FunctionDeclaration, 'id' | 'params' | 'body'>, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "FunctionDeclaration"
    id: SlimeIdentifier | null
    params: SlimePattern[]
    body: SlimeBlockStatement
    functionKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode  // generator
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeVariableDeclaration extends Omit<ESTree.VariableDeclaration, 'declarations'>, SlimeNode, SlimeCommaListTokens {
    type: "VariableDeclaration"
    declarations: SlimeVariableDeclarator[]
    keyword?: SlimeTokenNode  // var/let/const
    semicolon?: SlimeTokenNode
}

export interface SlimeVariableDeclarator extends Omit<ESTree.VariableDeclarator, 'id' | 'init'>, SlimeNode {
    type: "VariableDeclarator"
    id: SlimePattern
    init: SlimeExpression | null
    equals?: SlimeTokenNode
}

export interface SlimeClassDeclaration extends Omit<ESTree.ClassDeclaration, 'id' | 'superClass' | 'body'>, SlimeNode, SlimeBraceTokens {
    type: "ClassDeclaration"
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

// --- Expressions ---
export type SlimeExpression =
    | SlimeIdentifier
    | SlimeLiteral
    | SlimeThisExpression
    | SlimeArrayExpression
    | SlimeObjectExpression
    | SlimeFunctionExpression
    | SlimeArrowFunctionExpression
    | SlimeClassExpression
    | SlimeUnaryExpression
    | SlimeUpdateExpression
    | SlimeBinaryExpression
    | SlimeAssignmentExpression
    | SlimeLogicalExpression
    | SlimeMemberExpression
    | SlimeConditionalExpression
    | SlimeCallExpression
    | SlimeNewExpression
    | SlimeSequenceExpression
    | SlimeTemplateLiteral
    | SlimeTaggedTemplateExpression
    | SlimeYieldExpression
    | SlimeAwaitExpression
    | SlimeImportExpression
    | SlimeChainExpression
    | SlimeMetaProperty

export interface SlimeThisExpression extends ESTree.ThisExpression, SlimeNode {
    type: "ThisExpression"
    thisKeyword?: SlimeTokenNode
}

export interface SlimeArrayExpression extends Omit<ESTree.ArrayExpression, 'elements'>, SlimeNode, SlimeBracketTokens, SlimeCommaListTokens {
    type: "ArrayExpression"
    elements: (SlimeExpression | SlimeSpreadElement | null)[]
}

export interface SlimeObjectExpression extends Omit<ESTree.ObjectExpression, 'properties'>, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ObjectExpression"
    properties: (SlimeProperty | SlimeSpreadElement)[]
}

export interface SlimeProperty extends Omit<ESTree.Property, 'key' | 'value'>, SlimeNode {
    type: "Property"
    key: SlimeExpression
    value: SlimeExpression | SlimePattern
    kind: "init" | "get" | "set"
    method: boolean
    shorthand: boolean
    computed: boolean
    colon?: SlimeTokenNode
    getKeyword?: SlimeTokenNode
    setKeyword?: SlimeTokenNode
    lBracket?: SlimeTokenNode  // for computed
    rBracket?: SlimeTokenNode
}

export interface SlimeFunctionExpression extends Omit<ESTree.FunctionExpression, 'id' | 'params' | 'body'>, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "FunctionExpression"
    id: SlimeIdentifier | null
    params: SlimePattern[]
    body: SlimeBlockStatement
    functionKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeArrowFunctionExpression extends Omit<ESTree.ArrowFunctionExpression, 'params' | 'body'>, SlimeNode, SlimeParenTokens {
    type: "ArrowFunctionExpression"
    params: SlimePattern[]
    body: SlimeBlockStatement | SlimeExpression
    arrow?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeClassExpression extends Omit<ESTree.ClassExpression, 'id' | 'superClass' | 'body'>, SlimeNode, SlimeBraceTokens {
    type: "ClassExpression"
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

export interface SlimeUnaryExpression extends Omit<ESTree.UnaryExpression, 'argument'>, SlimeNode {
    type: "UnaryExpression"
    argument: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeUpdateExpression extends Omit<ESTree.UpdateExpression, 'argument'>, SlimeNode {
    type: "UpdateExpression"
    argument: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeBinaryExpression extends Omit<ESTree.BinaryExpression, 'left' | 'right'>, SlimeNode {
    type: "BinaryExpression"
    left: SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeAssignmentExpression extends Omit<ESTree.AssignmentExpression, 'left' | 'right'>, SlimeNode {
    type: "AssignmentExpression"
    left: SlimePattern | SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeLogicalExpression extends Omit<ESTree.LogicalExpression, 'left' | 'right'>, SlimeNode {
    type: "LogicalExpression"
    left: SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeMemberExpression extends Omit<ESTree.MemberExpression, 'object' | 'property'>, SlimeNode {
    type: "MemberExpression"
    object: SlimeExpression | SlimeSuper
    property: SlimeExpression | SlimePrivateIdentifier
    computed: boolean
    optional: boolean
    dot?: SlimeTokenNode
    questionDot?: SlimeTokenNode
    lBracket?: SlimeTokenNode
    rBracket?: SlimeTokenNode
}

export interface SlimeConditionalExpression extends Omit<ESTree.ConditionalExpression, 'test' | 'consequent' | 'alternate'>, SlimeNode {
    type: "ConditionalExpression"
    test: SlimeExpression
    consequent: SlimeExpression
    alternate: SlimeExpression
    questionMark?: SlimeTokenNode
    colon?: SlimeTokenNode
}

export interface SlimeCallExpression extends Omit<ESTree.SimpleCallExpression, 'callee' | 'arguments'>, SlimeNode, SlimeParenTokens, SlimeCommaListTokens {
    type: "CallExpression"
    callee: SlimeExpression | SlimeSuper
    arguments: (SlimeExpression | SlimeSpreadElement)[]
    optional: boolean
}

export interface SlimeSimpleCallExpression extends SlimeCallExpression {}

export interface SlimeNewExpression extends Omit<ESTree.NewExpression, 'callee' | 'arguments'>, SlimeNode, SlimeParenTokens, SlimeCommaListTokens {
    type: "NewExpression"
    callee: SlimeExpression
    arguments: (SlimeExpression | SlimeSpreadElement)[]
    newKeyword?: SlimeTokenNode
}

export interface SlimeSequenceExpression extends Omit<ESTree.SequenceExpression, 'expressions'>, SlimeNode, SlimeCommaListTokens {
    type: "SequenceExpression"
    expressions: SlimeExpression[]
}

export interface SlimeTemplateLiteral extends Omit<ESTree.TemplateLiteral, 'quasis' | 'expressions'>, SlimeNode {
    type: "TemplateLiteral"
    quasis: SlimeTemplateElement[]
    expressions: SlimeExpression[]
}

export interface SlimeTaggedTemplateExpression extends Omit<ESTree.TaggedTemplateExpression, 'tag' | 'quasi'>, SlimeNode {
    type: "TaggedTemplateExpression"
    tag: SlimeExpression
    quasi: SlimeTemplateLiteral
}

export interface SlimeTemplateElement extends ESTree.TemplateElement, SlimeNode {
    type: "TemplateElement"
    token?: SlimeTokenNode
}

export interface SlimeSpreadElement extends Omit<ESTree.SpreadElement, 'argument'>, SlimeNode {
    type: "SpreadElement"
    argument: SlimeExpression
    ellipsis?: SlimeTokenNode
}

export interface SlimeYieldExpression extends Omit<ESTree.YieldExpression, 'argument'>, SlimeNode {
    type: "YieldExpression"
    argument: SlimeExpression | null
    delegate: boolean
    yieldKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
}

export interface SlimeAwaitExpression extends Omit<ESTree.AwaitExpression, 'argument'>, SlimeNode {
    type: "AwaitExpression"
    argument: SlimeExpression
    awaitKeyword?: SlimeTokenNode
}

export interface SlimeImportExpression extends Omit<ESTree.ImportExpression, 'source'>, SlimeNode, SlimeParenTokens {
    type: "ImportExpression"
    source: SlimeExpression
    importKeyword?: SlimeTokenNode
}

export interface SlimeChainExpression extends Omit<ESTree.ChainExpression, 'expression'>, SlimeNode {
    type: "ChainExpression"
    expression: SlimeCallExpression | SlimeMemberExpression
}

export interface SlimeMetaProperty extends Omit<ESTree.MetaProperty, 'meta' | 'property'>, SlimeNode {
    type: "MetaProperty"
    meta: SlimeIdentifier
    property: SlimeIdentifier
    dot?: SlimeTokenNode
}

export interface SlimeSuper extends ESTree.Super, SlimeNode {
    type: "Super"
    superKeyword?: SlimeTokenNode
}



// --- Patterns ---
export type SlimePattern =
    | SlimeIdentifier
    | SlimeObjectPattern
    | SlimeArrayPattern
    | SlimeRestElement
    | SlimeAssignmentPattern
    | SlimeMemberExpression

export interface SlimeObjectPattern extends Omit<ESTree.ObjectPattern, 'properties'>, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ObjectPattern"
    properties: (SlimeAssignmentProperty | SlimeRestElement)[]
}

export interface SlimeArrayPattern extends Omit<ESTree.ArrayPattern, 'elements'>, SlimeNode, SlimeBracketTokens, SlimeCommaListTokens {
    type: "ArrayPattern"
    elements: (SlimePattern | null)[]
}

export interface SlimeRestElement extends Omit<ESTree.RestElement, 'argument'>, SlimeNode {
    type: "RestElement"
    argument: SlimePattern
    ellipsis?: SlimeTokenNode
}

export interface SlimeAssignmentPattern extends Omit<ESTree.AssignmentPattern, 'left' | 'right'>, SlimeNode {
    type: "AssignmentPattern"
    left: SlimePattern
    right: SlimeExpression
    equals?: SlimeTokenNode
}

export interface SlimeAssignmentProperty extends Omit<ESTree.AssignmentProperty, 'key' | 'value'>, SlimeNode {
    type: "Property"
    key: SlimeExpression
    value: SlimePattern
    shorthand: boolean
    computed: boolean
    colon?: SlimeTokenNode
    lBracket?: SlimeTokenNode
    rBracket?: SlimeTokenNode
}

// --- Classes ---
export interface SlimeClass extends Omit<ESTree.Class, 'id' | 'superClass' | 'body'>, SlimeNode, SlimeBraceTokens {
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

export interface SlimeClassBody extends Omit<ESTree.ClassBody, 'body'>, SlimeNode, SlimeBraceTokens {
    type: "ClassBody"
    body: SlimeClassElement[]
}

export type SlimeClassElement =
    | SlimeMethodDefinition
    | SlimePropertyDefinition
    | SlimeStaticBlock

export interface SlimeMethodDefinition extends Omit<ESTree.MethodDefinition, 'key' | 'value'>, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "MethodDefinition"
    key: SlimeExpression | SlimePrivateIdentifier
    value: SlimeFunctionExpression
    kind: "constructor" | "method" | "get" | "set"
    computed: boolean
    static: boolean
    staticKeyword?: SlimeTokenNode
    getKeyword?: SlimeTokenNode
    setKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    lBracketKey?: SlimeTokenNode  // for computed key
    rBracketKey?: SlimeTokenNode
}

export interface SlimePropertyDefinition extends Omit<ESTree.PropertyDefinition, 'key' | 'value'>, SlimeNode {
    type: "PropertyDefinition"
    key: SlimeExpression | SlimePrivateIdentifier
    value: SlimeExpression | null
    computed: boolean
    static: boolean
    staticKeyword?: SlimeTokenNode
    equals?: SlimeTokenNode
    semicolon?: SlimeTokenNode
    lBracket?: SlimeTokenNode
    rBracket?: SlimeTokenNode
}

// --- Modules ---
export type SlimeModuleDeclaration =
    | SlimeImportDeclaration
    | SlimeExportNamedDeclaration
    | SlimeExportDefaultDeclaration
    | SlimeExportAllDeclaration

export interface SlimeImportDeclaration extends Omit<ESTree.ImportDeclaration, 'specifiers' | 'source'>, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ImportDeclaration"
    specifiers: (SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier)[]
    source: SlimeLiteral
    importKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeImportSpecifier extends Omit<ESTree.ImportSpecifier, 'imported' | 'local'>, SlimeNode {
    type: "ImportSpecifier"
    imported: SlimeIdentifier | SlimeLiteral
    local: SlimeIdentifier
    asKeyword?: SlimeTokenNode
}

export interface SlimeImportDefaultSpecifier extends Omit<ESTree.ImportDefaultSpecifier, 'local'>, SlimeNode {
    type: "ImportDefaultSpecifier"
    local: SlimeIdentifier
}

export interface SlimeImportNamespaceSpecifier extends Omit<ESTree.ImportNamespaceSpecifier, 'local'>, SlimeNode {
    type: "ImportNamespaceSpecifier"
    local: SlimeIdentifier
    asterisk?: SlimeTokenNode
    asKeyword?: SlimeTokenNode
}

export interface SlimeExportNamedDeclaration extends Omit<ESTree.ExportNamedDeclaration, 'declaration' | 'specifiers' | 'source'>, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ExportNamedDeclaration"
    declaration: SlimeDeclaration | null
    specifiers: SlimeExportSpecifier[]
    source: SlimeLiteral | null
    exportKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeExportSpecifier extends Omit<ESTree.ExportSpecifier, 'local' | 'exported'>, SlimeNode {
    type: "ExportSpecifier"
    local: SlimeIdentifier | SlimeLiteral
    exported: SlimeIdentifier | SlimeLiteral
    asKeyword?: SlimeTokenNode
}

export interface SlimeExportDefaultDeclaration extends Omit<ESTree.ExportDefaultDeclaration, 'declaration'>, SlimeNode {
    type: "ExportDefaultDeclaration"
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression
    exportKeyword?: SlimeTokenNode
    defaultKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeExportAllDeclaration extends Omit<ESTree.ExportAllDeclaration, 'source' | 'exported'>, SlimeNode {
    type: "ExportAllDeclaration"
    source: SlimeLiteral
    exported: SlimeIdentifier | SlimeLiteral | null
    exportKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
    asKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

// --- MaybeNamed (for export default) ---
export interface SlimeMaybeNamedFunctionDeclaration extends Omit<SlimeFunctionDeclaration, 'id'> {
    type: "FunctionDeclaration"
    id: SlimeIdentifier | null
}

export interface SlimeMaybeNamedClassDeclaration extends Omit<SlimeClassDeclaration, 'id'> {
    type: "ClassDeclaration"
    id: SlimeIdentifier | null
}

// --- Operators (直接使用 ESTree 类型) ---
export type SlimeUnaryOperator = ESTree.UnaryOperator
export type SlimeBinaryOperator = ESTree.BinaryOperator
export type SlimeLogicalOperator = ESTree.LogicalOperator
export type SlimeAssignmentOperator = ESTree.AssignmentOperator
export type SlimeUpdateOperator = ESTree.UpdateOperator

// --- Function 联合类型 ---
export type SlimeFunction = SlimeFunctionDeclaration | SlimeFunctionExpression | SlimeArrowFunctionExpression
