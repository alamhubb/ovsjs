/**
 * SlimeESTree.ts - ESTree 兼容�?AST 接口定义
 *
 * 设计原则�? * 1. 核心字段完全兼容 ESTree 规范
 * 2. type 字符串使�?ESTree 标准值（�?"Identifier"�? * 3. Token 信息作为可选字�?*展平**到节点上（不嵌套�? * 4. 双继承：同时继承 ESTree 类型 + Slime 基础类型
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
// Slime 通用 Token 扩展字段（mixin 接口�?// ============================================

/** 通用的括�?Token 字段 */
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
// Slime 扩展�?ESTree 类型
// 双继承：ESTree 类型 + SlimeBaseNode（位置信息）
// Token 信息展平为可选字�?// ============================================

// --- 基础节点（双继承�?---
export interface SlimeNode extends ESTree.BaseNode, SlimeBaseNode {
    type: string
    loc: SubhutiSourceLocation  // Slime 的位置信息（必需�?}

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

export interface SlimeReturnStatement extends ESTree.ReturnStatement, SlimeNode {
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

export interface SlimeWithStatement extends ESTree.WithStatement, SlimeNode, SlimeParenTokens {
    type: "WithStatement"
    object: SlimeExpression
    body: SlimeStatement
    withKeyword?: SlimeTokenNode
}

export interface SlimeIfStatement extends ESTree.IfStatement, SlimeNode, SlimeParenTokens {
    type: "IfStatement"
    test: SlimeExpression
    consequent: SlimeStatement
    alternate: SlimeStatement | null
    ifKeyword?: SlimeTokenNode
    elseKeyword?: SlimeTokenNode
}

export interface SlimeSwitchStatement extends ESTree.SwitchStatement, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "SwitchStatement"
    discriminant: SlimeExpression
    cases: SlimeSwitchCase[]
    switchKeyword?: SlimeTokenNode
}

export interface SlimeSwitchCase extends ESTree.SwitchCase, SlimeNode {
    type: "SwitchCase"
    test: SlimeExpression | null
    consequent: SlimeStatement[]
    caseKeyword?: SlimeTokenNode
    defaultKeyword?: SlimeTokenNode
    colon?: SlimeTokenNode
}

export interface SlimeThrowStatement extends ESTree.ThrowStatement, SlimeNode {
    type: "ThrowStatement"
    argument: SlimeExpression
    throwKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeTryStatement extends ESTree.TryStatement, SlimeNode {
    type: "TryStatement"
    block: SlimeBlockStatement
    handler: SlimeCatchClause | null
    finalizer: SlimeBlockStatement | null
    tryKeyword?: SlimeTokenNode
    finallyKeyword?: SlimeTokenNode
}

export interface SlimeCatchClause extends ESTree.CatchClause, SlimeNode, SlimeParenTokens {
    type: "CatchClause"
    param: SlimePattern | null
    body: SlimeBlockStatement
    catchKeyword?: SlimeTokenNode
}

export interface SlimeWhileStatement extends ESTree.WhileStatement, SlimeNode, SlimeParenTokens {
    type: "WhileStatement"
    test: SlimeExpression
    body: SlimeStatement
    whileKeyword?: SlimeTokenNode
}

export interface SlimeDoWhileStatement extends ESTree.DoWhileStatement, SlimeNode, SlimeParenTokens {
    type: "DoWhileStatement"
    body: SlimeStatement
    test: SlimeExpression
    doKeyword?: SlimeTokenNode
    whileKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeForStatement extends ESTree.ForStatement, SlimeNode, SlimeParenTokens {
    type: "ForStatement"
    init: SlimeVariableDeclaration | SlimeExpression | null
    test: SlimeExpression | null
    update: SlimeExpression | null
    body: SlimeStatement
    forKeyword?: SlimeTokenNode
    semicolon1?: SlimeTokenNode
    semicolon2?: SlimeTokenNode
}

export interface SlimeForInStatement extends ESTree.ForInStatement, SlimeNode, SlimeParenTokens {
    type: "ForInStatement"
    left: SlimeVariableDeclaration | SlimePattern
    right: SlimeExpression
    body: SlimeStatement
    forKeyword?: SlimeTokenNode
    inKeyword?: SlimeTokenNode
}

export interface SlimeForOfStatement extends ESTree.ForOfStatement, SlimeNode, SlimeParenTokens {
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

export interface SlimeFunctionDeclaration extends ESTree.FunctionDeclaration, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "FunctionDeclaration"
    id: SlimeIdentifier | null
    params: SlimePattern[]
    body: SlimeBlockStatement
    functionKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode  // generator
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeVariableDeclaration extends ESTree.VariableDeclaration, SlimeNode, SlimeCommaListTokens {
    type: "VariableDeclaration"
    declarations: SlimeVariableDeclarator[]
    keyword?: SlimeTokenNode  // var/let/const
    semicolon?: SlimeTokenNode
}

export interface SlimeVariableDeclarator extends ESTree.VariableDeclarator, SlimeNode {
    type: "VariableDeclarator"
    id: SlimePattern
    init: SlimeExpression | null
    equals?: SlimeTokenNode
}

export interface SlimeClassDeclaration extends ESTree.ClassDeclaration, SlimeNode, SlimeBraceTokens {
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

export interface SlimeArrayExpression extends ESTree.ArrayExpression, SlimeNode, SlimeBracketTokens, SlimeCommaListTokens {
    type: "ArrayExpression"
    elements: (SlimeExpression | SlimeSpreadElement | null)[]
}

export interface SlimeObjectExpression extends ESTree.ObjectExpression, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ObjectExpression"
    properties: (SlimeProperty | SlimeSpreadElement)[]
}

export interface SlimeProperty extends ESTree.Property, SlimeNode {
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

export interface SlimeFunctionExpression extends ESTree.FunctionExpression, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
    type: "FunctionExpression"
    id: SlimeIdentifier | null
    params: SlimePattern[]
    body: SlimeBlockStatement
    functionKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeArrowFunctionExpression extends ESTree.ArrowFunctionExpression, SlimeNode, SlimeParenTokens {
    type: "ArrowFunctionExpression"
    params: SlimePattern[]
    body: SlimeBlockStatement | SlimeExpression
    arrow?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeClassExpression extends ESTree.ClassExpression, SlimeNode, SlimeBraceTokens {
    type: "ClassExpression"
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

export interface SlimeUnaryExpression extends ESTree.UnaryExpression, SlimeNode {
    type: "UnaryExpression"
    argument: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeUpdateExpression extends ESTree.UpdateExpression, SlimeNode {
    type: "UpdateExpression"
    argument: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeBinaryExpression extends ESTree.BinaryExpression, SlimeNode {
    type: "BinaryExpression"
    left: SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeAssignmentExpression extends ESTree.AssignmentExpression, SlimeNode {
    type: "AssignmentExpression"
    left: SlimePattern | SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeLogicalExpression extends ESTree.LogicalExpression, SlimeNode {
    type: "LogicalExpression"
    left: SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeMemberExpression extends ESTree.MemberExpression, SlimeNode {
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

export interface SlimeConditionalExpression extends ESTree.ConditionalExpression, SlimeNode {
    type: "ConditionalExpression"
    test: SlimeExpression
    consequent: SlimeExpression
    alternate: SlimeExpression
    questionMark?: SlimeTokenNode
    colon?: SlimeTokenNode
}

export interface SlimeCallExpression extends ESTree.SimpleCallExpression, SlimeNode, SlimeParenTokens, SlimeCommaListTokens {
    type: "CallExpression"
    callee: SlimeExpression | SlimeSuper
    arguments: (SlimeExpression | SlimeSpreadElement)[]
    optional: boolean
}

export interface SlimeSimpleCallExpression extends SlimeCallExpression {}

export interface SlimeNewExpression extends ESTree.NewExpression, SlimeNode, SlimeParenTokens, SlimeCommaListTokens {
    type: "NewExpression"
    callee: SlimeExpression
    arguments: (SlimeExpression | SlimeSpreadElement)[]
    newKeyword?: SlimeTokenNode
}

export interface SlimeSequenceExpression extends ESTree.SequenceExpression, SlimeNode, SlimeCommaListTokens {
    type: "SequenceExpression"
    expressions: SlimeExpression[]
}

export interface SlimeTemplateLiteral extends ESTree.TemplateLiteral, SlimeNode {
    type: "TemplateLiteral"
    quasis: SlimeTemplateElement[]
    expressions: SlimeExpression[]
}

export interface SlimeTaggedTemplateExpression extends ESTree.TaggedTemplateExpression, SlimeNode {
    type: "TaggedTemplateExpression"
    tag: SlimeExpression
    quasi: SlimeTemplateLiteral
}

export interface SlimeTemplateElement extends ESTree.TemplateElement, SlimeNode {
    type: "TemplateElement"
    token?: SlimeTokenNode
}

export interface SlimeSpreadElement extends ESTree.SpreadElement, SlimeNode {
    type: "SpreadElement"
    argument: SlimeExpression
    ellipsis?: SlimeTokenNode
}

export interface SlimeYieldExpression extends ESTree.YieldExpression, SlimeNode {
    type: "YieldExpression"
    argument: SlimeExpression | null
    delegate: boolean
    yieldKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
}

export interface SlimeAwaitExpression extends ESTree.AwaitExpression, SlimeNode {
    type: "AwaitExpression"
    argument: SlimeExpression
    awaitKeyword?: SlimeTokenNode
}

export interface SlimeImportExpression extends ESTree.ImportExpression, SlimeNode, SlimeParenTokens {
    type: "ImportExpression"
    source: SlimeExpression
    importKeyword?: SlimeTokenNode
}

export interface SlimeChainExpression extends ESTree.ChainExpression, SlimeNode {
    type: "ChainExpression"
    expression: SlimeCallExpression | SlimeMemberExpression
}

export interface SlimeMetaProperty extends ESTree.MetaProperty, SlimeNode {
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

export interface SlimeObjectPattern extends ESTree.ObjectPattern, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ObjectPattern"
    properties: (SlimeAssignmentProperty | SlimeRestElement)[]
}

export interface SlimeArrayPattern extends ESTree.ArrayPattern, SlimeNode, SlimeBracketTokens, SlimeCommaListTokens {
    type: "ArrayPattern"
    elements: (SlimePattern | null)[]
}

export interface SlimeRestElement extends ESTree.RestElement, SlimeNode {
    type: "RestElement"
    argument: SlimePattern
    ellipsis?: SlimeTokenNode
}

export interface SlimeAssignmentPattern extends ESTree.AssignmentPattern, SlimeNode {
    type: "AssignmentPattern"
    left: SlimePattern
    right: SlimeExpression
    equals?: SlimeTokenNode
}

export interface SlimeAssignmentProperty extends ESTree.AssignmentProperty, SlimeNode {
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
export interface SlimeClass extends ESTree.Class, SlimeNode, SlimeBraceTokens {
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

export interface SlimeClassBody extends ESTree.ClassBody, SlimeNode, SlimeBraceTokens {
    type: "ClassBody"
    body: SlimeClassElement[]
}

export type SlimeClassElement =
    | SlimeMethodDefinition
    | SlimePropertyDefinition
    | SlimeStaticBlock

export interface SlimeMethodDefinition extends ESTree.MethodDefinition, SlimeNode, SlimeParenTokens, SlimeBraceTokens {
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

export interface SlimePropertyDefinition extends ESTree.PropertyDefinition, SlimeNode {
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

export interface SlimeImportDeclaration extends ESTree.ImportDeclaration, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ImportDeclaration"
    specifiers: (SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier)[]
    source: SlimeLiteral
    importKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeImportSpecifier extends ESTree.ImportSpecifier, SlimeNode {
    type: "ImportSpecifier"
    imported: SlimeIdentifier | SlimeLiteral
    local: SlimeIdentifier
    asKeyword?: SlimeTokenNode
}

export interface SlimeImportDefaultSpecifier extends ESTree.ImportDefaultSpecifier, SlimeNode {
    type: "ImportDefaultSpecifier"
    local: SlimeIdentifier
}

export interface SlimeImportNamespaceSpecifier extends ESTree.ImportNamespaceSpecifier, SlimeNode {
    type: "ImportNamespaceSpecifier"
    local: SlimeIdentifier
    asterisk?: SlimeTokenNode
    asKeyword?: SlimeTokenNode
}

export interface SlimeExportNamedDeclaration extends ESTree.ExportNamedDeclaration, SlimeNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: "ExportNamedDeclaration"
    declaration: SlimeDeclaration | null
    specifiers: SlimeExportSpecifier[]
    source: SlimeLiteral | null
    exportKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeExportSpecifier extends ESTree.ExportSpecifier, SlimeNode {
    type: "ExportSpecifier"
    local: SlimeIdentifier | SlimeLiteral
    exported: SlimeIdentifier | SlimeLiteral
    asKeyword?: SlimeTokenNode
}

export interface SlimeExportDefaultDeclaration extends ESTree.ExportDefaultDeclaration, SlimeNode {
    type: "ExportDefaultDeclaration"
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression
    exportKeyword?: SlimeTokenNode
    defaultKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeExportAllDeclaration extends ESTree.ExportAllDeclaration, SlimeNode {
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
export interface SlimeMaybeNamedFunctionDeclaration extends SlimeFunctionDeclaration {
    type: "FunctionDeclaration"
    id: SlimeIdentifier | null
}

export interface SlimeMaybeNamedClassDeclaration extends SlimeClassDeclaration {
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
