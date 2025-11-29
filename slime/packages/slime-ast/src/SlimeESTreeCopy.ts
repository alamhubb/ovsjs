/**
 * SlimeESTree.ts - ESTree 兼容�?AST 接口定义
 *
 * 设计原则�?
 * 1. 核心字段完全兼容 ESTree 规范
 * 2. type 使用 SlimeAstType 枚举常量
 * 3. Token 信息作为可选字段展平到节点上（不嵌套）
 * 4. 双继承：同时继承 ESTree 类型 + Slime 基础类型
 *
 * @see https://github.com/estree/estree
 */

import type * as ESTree from "estree";
import type { SlimeTokenNode } from './SlimeTokenNodes'
import { SlimeAstType } from './SlimeAstType'

// ============================================
// 重新导出基础类型
// ============================================
export type { SlimeTokenNode } from './SlimeTokenNodes'
export { SlimeAstType } from './SlimeAstType'
// 直接使用 ESTree 类型
export type SlimeSourceLocation = ESTree.SourceLocation
export type SlimePosition = ESTree.Position
export type SlimeComment = ESTree.Comment

// ============================================
// 类型映射（与 ESTree 一致的方式）
// ============================================
export interface SlimeNodeMap {
    AssignmentProperty: SlimeAssignmentProperty
    CatchClause: SlimeCatchClause
    Class: SlimeClass
    ClassBody: SlimeClassBody
    Expression: SlimeExpression
    Function: SlimeFunction
    Identifier: SlimeIdentifier
    Literal: SlimeLiteral
    MethodDefinition: SlimeMethodDefinition
    ModuleDeclaration: SlimeModuleDeclaration
    ModuleSpecifier: SlimeModuleSpecifier
    Pattern: SlimePattern
    PrivateIdentifier: SlimePrivateIdentifier
    Program: SlimeProgram
    Property: SlimeProperty
    PropertyDefinition: SlimePropertyDefinition
    SpreadElement: SlimeSpreadElement
    Statement: SlimeStatement
    Super: SlimeSuper
    SwitchCase: SlimeSwitchCase
    TemplateElement: SlimeTemplateElement
    VariableDeclarator: SlimeVariableDeclarator
}

export interface SlimeExpressionMap {
    ArrayExpression: SlimeArrayExpression
    ArrowFunctionExpression: SlimeArrowFunctionExpression
    AssignmentExpression: SlimeAssignmentExpression
    AwaitExpression: SlimeAwaitExpression
    BinaryExpression: SlimeBinaryExpression
    CallExpression: SlimeCallExpression
    ChainExpression: SlimeChainExpression
    ClassExpression: SlimeClassExpression
    ConditionalExpression: SlimeConditionalExpression
    FunctionExpression: SlimeFunctionExpression
    Identifier: SlimeIdentifier
    ImportExpression: SlimeImportExpression
    Literal: SlimeLiteral
    LogicalExpression: SlimeLogicalExpression
    MemberExpression: SlimeMemberExpression
    MetaProperty: SlimeMetaProperty
    NewExpression: SlimeNewExpression
    ObjectExpression: SlimeObjectExpression
    SequenceExpression: SlimeSequenceExpression
    TaggedTemplateExpression: SlimeTaggedTemplateExpression
    TemplateLiteral: SlimeTemplateLiteral
    ThisExpression: SlimeThisExpression
    UnaryExpression: SlimeUnaryExpression
    UpdateExpression: SlimeUpdateExpression
    YieldExpression: SlimeYieldExpression
}

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
// Token 信息展平为可选字�?
// ============================================

// --- 基础节点（继�?ESTree 对应类型�?--
export interface SlimeBaseNodeWithoutComments extends ESTree.BaseNodeWithoutComments {
    type: SlimeAstType | string
}

export interface SlimeBaseNode extends ESTree.BaseNode, SlimeBaseNodeWithoutComments {}

// --- 基础类型（继�?ESTree 对应类型�?--
// 注意：不重新声明复杂字段，避免类型冲突。具体类型再声明 Slime 版本的字段�?
export interface SlimeBaseStatement extends ESTree.BaseStatement, SlimeBaseNode {}
export interface SlimeBaseExpression extends ESTree.BaseExpression, SlimeBaseNode {}
export interface SlimeBasePattern extends ESTree.BasePattern, SlimeBaseNode {}
export interface SlimeBaseDeclaration extends ESTree.BaseDeclaration, SlimeBaseStatement {}
export interface SlimeBaseModuleDeclaration extends ESTree.BaseModuleDeclaration, SlimeBaseNode {}
export interface SlimeBaseModuleSpecifier extends ESTree.BaseModuleSpecifier, SlimeBaseNode {}
export interface SlimeBaseFunction extends ESTree.BaseFunction, SlimeBaseNode {}
export interface SlimeBaseForXStatement extends ESTree.BaseForXStatement, SlimeBaseStatement {}
export interface SlimeBaseCallExpression extends ESTree.BaseCallExpression, SlimeBaseExpression {}
export interface SlimeBaseClass extends ESTree.BaseClass, SlimeBaseNode {}

// --- Program ---
export interface SlimeProgram extends ESTree.Program, SlimeBaseNode {
    type: typeof SlimeAstType.Program
    body: (SlimeDirective | SlimeStatement | SlimeModuleDeclaration)[]
}

export interface SlimeDirective extends ESTree.Directive, SlimeBaseStatement {
    type: typeof SlimeAstType.ExpressionStatement
    semicolon?: SlimeTokenNode
}

// --- Identifier ---
// ESTree: Identifier extends BaseNode, BaseExpression, BasePattern
export interface SlimeIdentifier extends ESTree.Identifier, SlimeBaseExpression, SlimeBasePattern {
    type: typeof SlimeAstType.Identifier
    // ESTree: name
    // Slime 扩展: token 信息
    token?: SlimeTokenNode
}

// --- PrivateIdentifier ---
export interface SlimePrivateIdentifier extends ESTree.PrivateIdentifier, SlimeBaseNode {
    type: typeof SlimeAstType.PrivateIdentifier
    token?: SlimeTokenNode
}

// --- Literals ---
// SlimeLiteral 是联合类型，定义在文件末�?
export interface SlimeSimpleLiteral extends ESTree.SimpleLiteral, SlimeBaseExpression {
    type: typeof SlimeAstType.Literal
    token?: SlimeTokenNode
}

export interface SlimeRegExpLiteral extends ESTree.RegExpLiteral, SlimeBaseExpression {
    type: typeof SlimeAstType.Literal
    token?: SlimeTokenNode
}

export interface SlimeBigIntLiteral extends ESTree.BigIntLiteral, SlimeBaseExpression {
    type: typeof SlimeAstType.Literal
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
    | SlimeDeclaration

export interface SlimeExpressionStatement extends ESTree.ExpressionStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.ExpressionStatement
    expression: SlimeExpression
    semicolon?: SlimeTokenNode
}

export interface SlimeBlockStatement extends ESTree.BlockStatement, SlimeBaseStatement, SlimeBraceTokens {
    type: typeof SlimeAstType.BlockStatement
    body: SlimeStatement[]
}

export interface SlimeStaticBlock extends ESTree.StaticBlock, SlimeBaseStatement, SlimeBraceTokens {
    type: typeof SlimeAstType.StaticBlock
    body: SlimeStatement[]
    staticKeyword?: SlimeTokenNode
}

export interface SlimeEmptyStatement extends ESTree.EmptyStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.EmptyStatement
    semicolon?: SlimeTokenNode
}

export interface SlimeDebuggerStatement extends ESTree.DebuggerStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.DebuggerStatement
    debuggerKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeReturnStatement extends ESTree.ReturnStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.ReturnStatement
    argument: SlimeExpression | null
    returnKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeBreakStatement extends ESTree.BreakStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.BreakStatement
    label: SlimeIdentifier | null
    breakKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeContinueStatement extends ESTree.ContinueStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.ContinueStatement
    label: SlimeIdentifier | null
    continueKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeLabeledStatement extends ESTree.LabeledStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.LabeledStatement
    label: SlimeIdentifier
    body: SlimeStatement
    colon?: SlimeTokenNode
}

export interface SlimeWithStatement extends ESTree.WithStatement, SlimeBaseStatement, SlimeParenTokens {
    type: typeof SlimeAstType.WithStatement
    object: SlimeExpression
    body: SlimeStatement
    withKeyword?: SlimeTokenNode
}

export interface SlimeIfStatement extends ESTree.IfStatement, SlimeBaseStatement, SlimeParenTokens {
    type: typeof SlimeAstType.IfStatement
    test: SlimeExpression
    consequent: SlimeStatement
    alternate: SlimeStatement | null
    ifKeyword?: SlimeTokenNode
    elseKeyword?: SlimeTokenNode
}

export interface SlimeSwitchStatement extends ESTree.SwitchStatement, SlimeBaseStatement, SlimeParenTokens, SlimeBraceTokens {
    type: typeof SlimeAstType.SwitchStatement
    discriminant: SlimeExpression
    cases: SlimeSwitchCase[]
    switchKeyword?: SlimeTokenNode
}

export interface SlimeSwitchCase extends ESTree.SwitchCase, SlimeBaseNode {
    type: typeof SlimeAstType.SwitchCase
    test: SlimeExpression | null
    consequent: SlimeStatement[]
    caseKeyword?: SlimeTokenNode
    defaultKeyword?: SlimeTokenNode
    colon?: SlimeTokenNode
}

export interface SlimeThrowStatement extends ESTree.ThrowStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.ThrowStatement
    argument: SlimeExpression
    throwKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeTryStatement extends ESTree.TryStatement, SlimeBaseStatement {
    type: typeof SlimeAstType.TryStatement
    block: SlimeBlockStatement
    handler: SlimeCatchClause | null
    finalizer: SlimeBlockStatement | null
    tryKeyword?: SlimeTokenNode
    finallyKeyword?: SlimeTokenNode
}

export interface SlimeCatchClause extends ESTree.CatchClause, SlimeBaseNode, SlimeParenTokens {
    type: typeof SlimeAstType.CatchClause
    param: SlimePattern | null
    body: SlimeBlockStatement
    catchKeyword?: SlimeTokenNode
}

export interface SlimeWhileStatement extends ESTree.WhileStatement, SlimeBaseStatement, SlimeParenTokens {
    type: typeof SlimeAstType.WhileStatement
    test: SlimeExpression
    body: SlimeStatement
    whileKeyword?: SlimeTokenNode
}

export interface SlimeDoWhileStatement extends ESTree.DoWhileStatement, SlimeBaseStatement, SlimeParenTokens {
    type: typeof SlimeAstType.DoWhileStatement
    body: SlimeStatement
    test: SlimeExpression
    doKeyword?: SlimeTokenNode
    whileKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeForStatement extends ESTree.ForStatement, SlimeBaseStatement, SlimeParenTokens {
    type: typeof SlimeAstType.ForStatement
    init: SlimeVariableDeclaration | SlimeExpression | null
    test: SlimeExpression | null
    update: SlimeExpression | null
    body: SlimeStatement
    forKeyword?: SlimeTokenNode
    semicolon1?: SlimeTokenNode
    semicolon2?: SlimeTokenNode
}

export interface SlimeForInStatement extends ESTree.ForInStatement, SlimeBaseForXStatement, SlimeParenTokens {
    type: typeof SlimeAstType.ForInStatement
    left: SlimeVariableDeclaration | SlimePattern
    right: SlimeExpression
    body: SlimeStatement
    forKeyword?: SlimeTokenNode
    inKeyword?: SlimeTokenNode
}

export interface SlimeForOfStatement extends ESTree.ForOfStatement, SlimeBaseForXStatement, SlimeParenTokens {
    type: typeof SlimeAstType.ForOfStatement
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

export interface SlimeFunctionDeclaration extends ESTree.FunctionDeclaration, SlimeBaseDeclaration, SlimeParenTokens, SlimeBraceTokens {
    type: typeof SlimeAstType.FunctionDeclaration
    id: SlimeIdentifier | null
    params: SlimePattern[]
    body: SlimeBlockStatement
    functionKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode  // generator
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeVariableDeclaration extends ESTree.VariableDeclaration, SlimeBaseDeclaration, SlimeCommaListTokens {
    type: typeof SlimeAstType.VariableDeclaration
    declarations: SlimeVariableDeclarator[]
    keyword?: SlimeTokenNode  // var/let/const
    semicolon?: SlimeTokenNode
}

export interface SlimeVariableDeclarator extends ESTree.VariableDeclarator, SlimeBaseNode {
    type: typeof SlimeAstType.VariableDeclarator
    id: SlimePattern
    init: SlimeExpression | null
    equals?: SlimeTokenNode
}

export interface SlimeClassDeclaration extends ESTree.ClassDeclaration, SlimeBaseDeclaration, SlimeBraceTokens {
    type: typeof SlimeAstType.ClassDeclaration
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

// --- Expressions ---
export type SlimeExpression = SlimeExpressionMap[keyof SlimeExpressionMap]

export interface SlimeThisExpression extends ESTree.ThisExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.ThisExpression
    thisKeyword?: SlimeTokenNode
}

export interface SlimeArrayExpression extends ESTree.ArrayExpression, SlimeBaseExpression, SlimeBracketTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.ArrayExpression
    // elements 从 ESTree.ArrayExpression 继承
}

export interface SlimeObjectExpression extends ESTree.ObjectExpression, SlimeBaseExpression, SlimeBraceTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.ObjectExpression
    properties: (SlimeProperty | SlimeSpreadElement)[]
}

export interface SlimeProperty extends ESTree.Property, SlimeBaseNode {
    type: typeof SlimeAstType.Property
    key: SlimeExpression | SlimePrivateIdentifier  // 与 ESTree 一致
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

export interface SlimeFunctionExpression extends ESTree.FunctionExpression, SlimeBaseExpression, SlimeParenTokens, SlimeBraceTokens {
    type: typeof SlimeAstType.FunctionExpression
    id: SlimeIdentifier | null
    params: SlimePattern[]
    body: SlimeBlockStatement
    functionKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeArrowFunctionExpression extends ESTree.ArrowFunctionExpression, SlimeBaseExpression, SlimeParenTokens {
    type: typeof SlimeAstType.ArrowFunctionExpression
    params: SlimePattern[]
    body: SlimeBlockStatement | SlimeExpression
    arrow?: SlimeTokenNode
    asyncKeyword?: SlimeTokenNode
    commas?: SlimeTokenNode[]
}

export interface SlimeClassExpression extends ESTree.ClassExpression, SlimeBaseExpression, SlimeBraceTokens {
    type: typeof SlimeAstType.ClassExpression
    id: SlimeIdentifier | null
    superClass: SlimeExpression | null
    body: SlimeClassBody
    classKeyword?: SlimeTokenNode
    extendsKeyword?: SlimeTokenNode
}

export interface SlimeUnaryExpression extends ESTree.UnaryExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.UnaryExpression
    argument: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeUpdateExpression extends ESTree.UpdateExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.UpdateExpression
    argument: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeBinaryExpression extends ESTree.BinaryExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.BinaryExpression
    left: SlimeExpression | SlimePrivateIdentifier  // 与 ESTree 一致
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeAssignmentExpression extends ESTree.AssignmentExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.AssignmentExpression
    left: SlimePattern | SlimeMemberExpression  // 与 ESTree 一致：Pattern | MemberExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

export interface SlimeLogicalExpression extends ESTree.LogicalExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.LogicalExpression
    left: SlimeExpression
    right: SlimeExpression
    operatorToken?: SlimeTokenNode
}

// ESTree: MemberExpression extends BaseExpression, BasePattern
export interface SlimeMemberExpression extends ESTree.MemberExpression, SlimeBaseExpression, SlimeBasePattern {
    type: typeof SlimeAstType.MemberExpression
    object: SlimeExpression | SlimeSuper
    property: SlimeExpression | SlimePrivateIdentifier
    computed: boolean
    optional: boolean
    dot?: SlimeTokenNode
    questionDot?: SlimeTokenNode
    lBracket?: SlimeTokenNode
    rBracket?: SlimeTokenNode
}

export interface SlimeConditionalExpression extends ESTree.ConditionalExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.ConditionalExpression
    test: SlimeExpression
    consequent: SlimeExpression
    alternate: SlimeExpression
    questionMark?: SlimeTokenNode
    colon?: SlimeTokenNode
}

export interface SlimeSimpleCallExpression extends ESTree.SimpleCallExpression, SlimeBaseCallExpression, SlimeParenTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.CallExpression
    callee: SlimeExpression | SlimeSuper
    arguments: (SlimeExpression | SlimeSpreadElement)[]
    optional: boolean
}

export interface SlimeNewExpression extends ESTree.NewExpression, SlimeBaseExpression, SlimeParenTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.NewExpression
    callee: SlimeExpression
    arguments: (SlimeExpression | SlimeSpreadElement)[]
    newKeyword?: SlimeTokenNode
}

export interface SlimeSequenceExpression extends ESTree.SequenceExpression, SlimeBaseExpression, SlimeCommaListTokens {
    type: typeof SlimeAstType.SequenceExpression
    expressions: SlimeExpression[]
}

export interface SlimeTemplateLiteral extends ESTree.TemplateLiteral, SlimeBaseExpression {
    type: typeof SlimeAstType.TemplateLiteral
    quasis: SlimeTemplateElement[]
    expressions: SlimeExpression[]
}

export interface SlimeTaggedTemplateExpression extends ESTree.TaggedTemplateExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.TaggedTemplateExpression
    tag: SlimeExpression
    quasi: SlimeTemplateLiteral
}

export interface SlimeTemplateElement extends ESTree.TemplateElement, SlimeBaseNode {
    type: typeof SlimeAstType.TemplateElement
    token?: SlimeTokenNode
}

export interface SlimeSpreadElement extends ESTree.SpreadElement, SlimeBaseNode {
    type: typeof SlimeAstType.SpreadElement
    argument: SlimeExpression
    ellipsis?: SlimeTokenNode
}

export interface SlimeYieldExpression extends ESTree.YieldExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.YieldExpression
    argument: SlimeExpression | null
    delegate: boolean
    yieldKeyword?: SlimeTokenNode
    asterisk?: SlimeTokenNode
}

export interface SlimeAwaitExpression extends ESTree.AwaitExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.AwaitExpression
    argument: SlimeExpression
    awaitKeyword?: SlimeTokenNode
}

export interface SlimeImportExpression extends ESTree.ImportExpression, SlimeBaseExpression, SlimeParenTokens {
    type: typeof SlimeAstType.ImportExpression
    source: SlimeExpression
    importKeyword?: SlimeTokenNode
}

export interface SlimeChainExpression extends ESTree.ChainExpression, SlimeBaseExpression {
    type: typeof SlimeAstType.ChainExpression
    expression: SlimeSimpleCallExpression | SlimeMemberExpression  // 与 ESTree ChainElement 一致
}

export interface SlimeMetaProperty extends ESTree.MetaProperty, SlimeBaseExpression {
    type: typeof SlimeAstType.MetaProperty
    meta: SlimeIdentifier
    property: SlimeIdentifier
    dot?: SlimeTokenNode
}

export interface SlimeSuper extends ESTree.Super, SlimeBaseNode {
    type: typeof SlimeAstType.Super
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

export interface SlimeObjectPattern extends ESTree.ObjectPattern, SlimeBasePattern, SlimeBraceTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.ObjectPattern
    properties: (SlimeAssignmentProperty | SlimeRestElement)[]
}

export interface SlimeArrayPattern extends ESTree.ArrayPattern, SlimeBasePattern, SlimeBracketTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.ArrayPattern
    elements: (SlimePattern | null)[]
}

export interface SlimeRestElement extends ESTree.RestElement, SlimeBasePattern {
    type: typeof SlimeAstType.RestElement
    argument: SlimePattern
    ellipsis?: SlimeTokenNode
}

export interface SlimeAssignmentPattern extends ESTree.AssignmentPattern, SlimeBasePattern {
    type: typeof SlimeAstType.AssignmentPattern
    left: SlimePattern
    right: SlimeExpression
    equals?: SlimeTokenNode
}

export interface SlimeAssignmentProperty extends ESTree.AssignmentProperty, SlimeBaseNode {
    type: typeof SlimeAstType.Property
    key: SlimeExpression | SlimePrivateIdentifier  // 与 ESTree Property 一致
    value: SlimePattern
    shorthand: boolean
    computed: boolean
    colon?: SlimeTokenNode
    lBracket?: SlimeTokenNode
    rBracket?: SlimeTokenNode
}

// --- Classes ---
// SlimeClass 是联合类型，定义在文件末尾

export interface SlimeClassBody extends ESTree.ClassBody, SlimeBaseNode, SlimeBraceTokens {
    type: typeof SlimeAstType.ClassBody
    body: SlimeClassElement[]
}

export type SlimeClassElement =
    | SlimeMethodDefinition
    | SlimePropertyDefinition
    | SlimeStaticBlock

export interface SlimeMethodDefinition extends ESTree.MethodDefinition, SlimeBaseNode, SlimeParenTokens, SlimeBraceTokens {
    type: typeof SlimeAstType.MethodDefinition
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

export interface SlimePropertyDefinition extends ESTree.PropertyDefinition, SlimeBaseNode {
    type: typeof SlimeAstType.PropertyDefinition
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

export interface SlimeImportDeclaration extends ESTree.ImportDeclaration, SlimeBaseNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.ImportDeclaration
    specifiers: (SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier)[]
    source: SlimeLiteral
    importKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeImportSpecifier extends ESTree.ImportSpecifier, SlimeBaseNode {
    type: typeof SlimeAstType.ImportSpecifier
    imported: SlimeIdentifier | SlimeLiteral
    local: SlimeIdentifier
    asKeyword?: SlimeTokenNode
}

export interface SlimeImportDefaultSpecifier extends ESTree.ImportDefaultSpecifier, SlimeBaseNode {
    type: typeof SlimeAstType.ImportDefaultSpecifier
    local: SlimeIdentifier
}

export interface SlimeImportNamespaceSpecifier extends ESTree.ImportNamespaceSpecifier, SlimeBaseNode {
    type: typeof SlimeAstType.ImportNamespaceSpecifier
    local: SlimeIdentifier
    asterisk?: SlimeTokenNode
    asKeyword?: SlimeTokenNode
}

export interface SlimeExportNamedDeclaration extends ESTree.ExportNamedDeclaration, SlimeBaseNode, SlimeBraceTokens, SlimeCommaListTokens {
    type: typeof SlimeAstType.ExportNamedDeclaration
    declaration: SlimeDeclaration | null
    specifiers: SlimeExportSpecifier[]
    source: SlimeLiteral | null
    exportKeyword?: SlimeTokenNode
    fromKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeExportSpecifier extends ESTree.ExportSpecifier, SlimeBaseNode {
    type: typeof SlimeAstType.ExportSpecifier
    local: SlimeIdentifier | SlimeLiteral
    exported: SlimeIdentifier | SlimeLiteral
    asKeyword?: SlimeTokenNode
}

export interface SlimeExportDefaultDeclaration extends ESTree.ExportDefaultDeclaration, SlimeBaseNode {
    type: typeof SlimeAstType.ExportDefaultDeclaration
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression
    exportKeyword?: SlimeTokenNode
    defaultKeyword?: SlimeTokenNode
    semicolon?: SlimeTokenNode
}

export interface SlimeExportAllDeclaration extends ESTree.ExportAllDeclaration, SlimeBaseNode {
    type: typeof SlimeAstType.ExportAllDeclaration
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
    type: typeof SlimeAstType.FunctionDeclaration
    id: SlimeIdentifier | null
}

export interface SlimeMaybeNamedClassDeclaration extends SlimeClassDeclaration {
    type: typeof SlimeAstType.ClassDeclaration
    id: SlimeIdentifier | null
}

// --- Operators (直接使用 ESTree 类型) ---
export type SlimeUnaryOperator = ESTree.UnaryOperator
export type SlimeBinaryOperator = ESTree.BinaryOperator
export type SlimeLogicalOperator = ESTree.LogicalOperator
export type SlimeAssignmentOperator = ESTree.AssignmentOperator
export type SlimeUpdateOperator = ESTree.UpdateOperator

// --- 联合类型（与 ESTree 一致）---
export type SlimeFunction =
    | SlimeFunctionDeclaration
    | SlimeFunctionExpression
    | SlimeArrowFunctionExpression

export type SlimeClass =
    | SlimeClassDeclaration
    | SlimeClassExpression

export type SlimeChainElement =
    | SlimeSimpleCallExpression
    | SlimeMemberExpression

export type SlimeLiteral =
    | SlimeSimpleLiteral
    | SlimeRegExpLiteral
    | SlimeBigIntLiteral

export type SlimeModuleSpecifier =
    | SlimeImportSpecifier
    | SlimeImportDefaultSpecifier
    | SlimeImportNamespaceSpecifier
    | SlimeExportSpecifier

export type SlimeCallExpression =
    | SlimeSimpleCallExpression
    | SlimeNewExpression

// --- Node 联合类型（所有节点类型）---
export type SlimeNode = SlimeNodeMap[keyof SlimeNodeMap]
