/**
 * SlimeAstInterface.ts - AST 节点接口定义
 *
 * 完全按照 ECMAScript® 2025 规范 (es2025-grammar.md) 定义
 * 与 Es2025Parser.ts 中的规则 1:1 对应
 * 完全保留所有 Token 以支持源码还原
 *
 * @see https://tc39.es/ecma262/2025/#sec-grammar-summary
 */

import { SlimeAstType } from "./SlimeAstType.ts"
import type { SubhutiSourceLocation } from "../../../../subhuti/src/struct/SubhutiCst.ts"
import type {
    SlimeBaseNode,
    SlimeTokenNode,
    SlimeLParenToken,
    SlimeRParenToken,
    SlimeLBraceToken,
    SlimeRBraceToken,
    SlimeLBracketToken,
    SlimeRBracketToken,
    SlimeDotToken,
    SlimeEllipsisToken,
    SlimeSemicolonToken,
    SlimeCommaToken,
    SlimeColonToken,
    SlimeQuestionMarkToken,
    SlimeArrowToken,
    SlimeEqualsToken,
    SlimeAsteriskToken,
    SlimePlusToken,
    SlimeMinusToken,
    SlimePlusPlusToken,
    SlimeMinusMinusToken,
    SlimeExclamationToken,
    SlimeTildeToken,
    SlimeQuestionDotToken,
    // 关键字
    SlimeVarKeywordToken,
    SlimeLetKeywordToken,
    SlimeConstKeywordToken,
    SlimeFunctionKeywordToken,
    SlimeClassKeywordToken,
    SlimeExtendsKeywordToken,
    SlimeStaticKeywordToken,
    SlimeGetKeywordToken,
    SlimeSetKeywordToken,
    SlimeAsyncKeywordToken,
    SlimeAwaitKeywordToken,
    SlimeYieldKeywordToken,
    SlimeNewKeywordToken,
    SlimeSuperKeywordToken,
    SlimeThisKeywordToken,
    SlimeIfKeywordToken,
    SlimeElseKeywordToken,
    SlimeForKeywordToken,
    SlimeInKeywordToken,
    SlimeOfKeywordToken,
    SlimeWhileKeywordToken,
    SlimeDoKeywordToken,
    SlimeSwitchKeywordToken,
    SlimeCaseKeywordToken,
    SlimeDefaultKeywordToken,
    SlimeBreakKeywordToken,
    SlimeContinueKeywordToken,
    SlimeReturnKeywordToken,
    SlimeThrowKeywordToken,
    SlimeTryKeywordToken,
    SlimeCatchKeywordToken,
    SlimeFinallyKeywordToken,
    SlimeWithKeywordToken,
    SlimeDebuggerKeywordToken,
    SlimeImportKeywordToken,
    SlimeExportKeywordToken,
    SlimeFromKeywordToken,
    SlimeAsKeywordToken,
    SlimeTypeofKeywordToken,
    SlimeVoidKeywordToken,
    SlimeDeleteKeywordToken,
    SlimeInstanceofKeywordToken,
    SlimeNullKeywordToken,
    SlimeTrueKeywordToken,
    SlimeFalseKeywordToken,
    SlimeTargetKeywordToken,
    SlimeMetaKeywordToken,
    // Token 类型
    SlimeAssignmentOperatorToken,
    SlimeIdentifierToken,
    SlimeIdentifierNameToken,
    SlimePrivateIdentifierToken,
    SlimeNumericLiteralToken,
    SlimeStringLiteralToken,
    SlimeRegularExpressionLiteralToken,
    SlimeNoSubstitutionTemplateToken,
    SlimeTemplateHeadToken,
    SlimeTemplateMiddleToken,
    SlimeTemplateTailToken,
} from "./SlimeTokenNodes.ts"

// 重新导出基础类型
export type { SlimeBaseNode, SlimeTokenNode } from "./SlimeTokenNodes.ts"

// ============================================
// A.2 表达式 (Expressions)
// ============================================

// --- A.2.1 标识符引用 ---

/**
 * IdentifierReference :
 *   Identifier
 *   yield (in non-yield context)
 *   await (in non-await context)
 */
export interface SlimeIdentifierReference extends SlimeBaseNode {
    type: SlimeAstType.IdentifierReference
    identifier: SlimeIdentifierToken
}

/**
 * BindingIdentifier :
 *   Identifier
 *   yield
 *   await
 */
export interface SlimeBindingIdentifier extends SlimeBaseNode {
    type: SlimeAstType.BindingIdentifier
    identifier: SlimeIdentifierToken
}

/**
 * LabelIdentifier :
 *   Identifier
 */
export interface SlimeLabelIdentifier extends SlimeBaseNode {
    type: SlimeAstType.LabelIdentifier
    identifier: SlimeIdentifierToken
}

/**
 * Identifier :
 *   IdentifierName but not ReservedWord
 */
export interface SlimeIdentifier extends SlimeBaseNode {
    type: SlimeAstType.Identifier
    name: string
}

// --- A.2.2 基本表达式 ---

/**
 * PrimaryExpression :
 *   this
 *   IdentifierReference
 *   Literal
 *   ArrayLiteral
 *   ObjectLiteral
 *   FunctionExpression
 *   ClassExpression
 *   GeneratorExpression
 *   AsyncFunctionExpression
 *   AsyncGeneratorExpression
 *   RegularExpressionLiteral
 *   TemplateLiteral
 *   CoverParenthesizedExpressionAndArrowParameterList
 */
export type SlimePrimaryExpression =
    | SlimeThisExpression
    | SlimeIdentifierReference
    | SlimeLiteral
    | SlimeArrayLiteral
    | SlimeObjectLiteral
    | SlimeFunctionExpression
    | SlimeClassExpression
    | SlimeGeneratorExpression
    | SlimeAsyncFunctionExpression
    | SlimeAsyncGeneratorExpression
    | SlimeRegularExpressionLiteral
    | SlimeTemplateLiteral
    | SlimeParenthesizedExpression

/**
 * this 表达式
 */
export interface SlimeThisExpression extends SlimeBaseNode {
    type: SlimeAstType.PrimaryExpression
    thisKeyword: SlimeThisKeywordToken
}

/**
 * ParenthesizedExpression :
 *   ( Expression )
 */
export interface SlimeParenthesizedExpression extends SlimeBaseNode {
    type: SlimeAstType.ParenthesizedExpression
    lParen: SlimeLParenToken
    expression: SlimeExpression
    rParen: SlimeRParenToken
}

// --- A.2.3 字面量 ---

/**
 * Literal :
 *   NullLiteral
 *   BooleanLiteral
 *   NumericLiteral
 *   StringLiteral
 */
export type SlimeLiteral =
    | SlimeNullLiteral
    | SlimeBooleanLiteral
    | SlimeNumericLiteral
    | SlimeStringLiteral

/**
 * NullLiteral : null
 */
export interface SlimeNullLiteral extends SlimeBaseNode {
    type: SlimeAstType.NullLiteral
    nullKeyword: SlimeNullKeywordToken
    value: null
}

/**
 * BooleanLiteral : true | false
 */
export interface SlimeBooleanLiteral extends SlimeBaseNode {
    type: SlimeAstType.BooleanLiteral
    booleanKeyword: SlimeTrueKeywordToken | SlimeFalseKeywordToken
    value: boolean
}

/**
 * NumericLiteral
 */
export interface SlimeNumericLiteral extends SlimeBaseNode {
    type: SlimeAstType.NumericLiteral
    raw: string
    value: number
}

/**
 * StringLiteral
 */
export interface SlimeStringLiteral extends SlimeBaseNode {
    type: SlimeAstType.StringLiteral
    raw: string
    value: string
}

/**
 * RegularExpressionLiteral
 */
export interface SlimeRegularExpressionLiteral extends SlimeBaseNode {
    type: SlimeAstType.RegularExpressionLiteral
    raw: string
    pattern: string
    flags: string
}

// --- A.2.4 数组字面量 ---

/**
 * ArrayLiteral :
 *   [ Elision_opt ]
 *   [ ElementList ]
 *   [ ElementList , Elision_opt ]
 */
export interface SlimeArrayLiteral extends SlimeBaseNode {
    type: SlimeAstType.ArrayLiteral
    lBracket: SlimeLBracketToken
    elements: SlimeElementList | null
    rBracket: SlimeRBracketToken
}

/**
 * ElementList :
 *   Elision_opt AssignmentExpression
 *   Elision_opt SpreadElement
 *   ElementList , Elision_opt AssignmentExpression
 *   ElementList , Elision_opt SpreadElement
 */
export interface SlimeElementList extends SlimeBaseNode {
    type: SlimeAstType.ElementList
    items: SlimeElementListItem[]
}

export interface SlimeElementListItem {
    elision: SlimeElision | null
    element: SlimeAssignmentExpression | SlimeSpreadElement
    comma: SlimeCommaToken | null  // 最后一个元素可能没有逗号
}

/**
 * Elision :
 *   ,
 *   Elision ,
 */
export interface SlimeElision extends SlimeBaseNode {
    type: SlimeAstType.Elision
    commas: SlimeCommaToken[]
}

/**
 * SpreadElement :
 *   ... AssignmentExpression
 */
export interface SlimeSpreadElement extends SlimeBaseNode {
    type: SlimeAstType.SpreadElement
    ellipsis: SlimeEllipsisToken
    argument: SlimeAssignmentExpression
}

// --- A.2.5 对象字面量 ---

/**
 * ObjectLiteral :
 *   { }
 *   { PropertyDefinitionList }
 *   { PropertyDefinitionList , }
 */
export interface SlimeObjectLiteral extends SlimeBaseNode {
    type: SlimeAstType.ObjectLiteral
    lBrace: SlimeLBraceToken
    properties: SlimePropertyDefinitionList | null
    trailingComma: SlimeCommaToken | null
    rBrace: SlimeRBraceToken
}

/**
 * PropertyDefinitionList :
 *   PropertyDefinition
 *   PropertyDefinitionList , PropertyDefinition
 */
export interface SlimePropertyDefinitionList extends SlimeBaseNode {
    type: SlimeAstType.PropertyDefinitionList
    items: SlimePropertyDefinitionListItem[]
}

export interface SlimePropertyDefinitionListItem {
    property: SlimePropertyDefinition
    comma: SlimeCommaToken | null
}

/**
 * PropertyDefinition :
 *   IdentifierReference
 *   CoverInitializedName
 *   PropertyName : AssignmentExpression
 *   MethodDefinition
 *   ... AssignmentExpression
 */
export type SlimePropertyDefinition =
    | SlimeShorthandProperty
    | SlimeCoverInitializedName
    | SlimeKeyValueProperty
    | SlimeMethodDefinition
    | SlimeSpreadProperty

export interface SlimeShorthandProperty extends SlimeBaseNode {
    type: SlimeAstType.PropertyDefinition
    kind: 'shorthand'
    name: SlimeIdentifierReference
}

export interface SlimeKeyValueProperty extends SlimeBaseNode {
    type: SlimeAstType.PropertyDefinition
    kind: 'init'
    name: SlimePropertyName
    colon: SlimeColonToken
    value: SlimeAssignmentExpression
}

export interface SlimeSpreadProperty extends SlimeBaseNode {
    type: SlimeAstType.PropertyDefinition
    kind: 'spread'
    ellipsis: SlimeEllipsisToken
    argument: SlimeAssignmentExpression
}

/**
 * CoverInitializedName :
 *   IdentifierReference Initializer
 */
export interface SlimeCoverInitializedName extends SlimeBaseNode {
    type: SlimeAstType.CoverInitializedName
    name: SlimeIdentifierReference
    initializer: SlimeInitializer
}

/**
 * PropertyName :
 *   LiteralPropertyName
 *   ComputedPropertyName
 */
export type SlimePropertyName =
    | SlimeLiteralPropertyName
    | SlimeComputedPropertyName

/**
 * LiteralPropertyName :
 *   IdentifierName
 *   StringLiteral
 *   NumericLiteral
 */
export interface SlimeLiteralPropertyName extends SlimeBaseNode {
    type: SlimeAstType.LiteralPropertyName
    name: SlimeIdentifierNameToken | SlimeStringLiteralToken | SlimeNumericLiteralToken
}

/**
 * ComputedPropertyName :
 *   [ AssignmentExpression ]
 */
export interface SlimeComputedPropertyName extends SlimeBaseNode {
    type: SlimeAstType.ComputedPropertyName
    lBracket: SlimeLBracketToken
    expression: SlimeAssignmentExpression
    rBracket: SlimeRBracketToken
}

/**
 * Initializer :
 *   = AssignmentExpression
 */
export interface SlimeInitializer extends SlimeBaseNode {
    type: SlimeAstType.Initializer
    equals: SlimeEqualsToken
    value: SlimeAssignmentExpression
}

// --- A.2.6 模板字面量 ---

/**
 * TemplateLiteral :
 *   NoSubstitutionTemplate
 *   SubstitutionTemplate
 */
export type SlimeTemplateLiteral =
    | SlimeNoSubstitutionTemplate
    | SlimeSubstitutionTemplate

export interface SlimeNoSubstitutionTemplate extends SlimeBaseNode {
    type: SlimeAstType.TemplateLiteral
    template: SlimeNoSubstitutionTemplateToken
}

export interface SlimeSubstitutionTemplate extends SlimeBaseNode {
    type: SlimeAstType.SubstitutionTemplate
    head: SlimeTemplateHeadToken
    expression: SlimeExpression
    spans: SlimeTemplateSpans
}

/**
 * TemplateSpans :
 *   TemplateTail
 *   TemplateMiddleList TemplateTail
 */
export interface SlimeTemplateSpans extends SlimeBaseNode {
    type: SlimeAstType.TemplateSpans
    middleList: SlimeTemplateMiddleList | null
    tail: SlimeTemplateTailToken
}

/**
 * TemplateMiddleList :
 *   TemplateMiddle Expression
 *   TemplateMiddleList TemplateMiddle Expression
 */
export interface SlimeTemplateMiddleList extends SlimeBaseNode {
    type: SlimeAstType.TemplateMiddleList
    items: SlimeTemplateMiddleItem[]
}

export interface SlimeTemplateMiddleItem {
    middle: SlimeTemplateMiddleToken
    expression: SlimeExpression
}
// --- A.2.7 成员表达式 ---

/**
 * MemberExpression :
 *   PrimaryExpression
 *   MemberExpression [ Expression ]
 *   MemberExpression . IdentifierName
 *   MemberExpression TemplateLiteral
 *   SuperProperty
 *   MetaProperty
 *   new MemberExpression Arguments
 *   MemberExpression . PrivateIdentifier
 */
export interface SlimeMemberExpression extends SlimeBaseNode {
    type: SlimeAstType.MemberExpression
    object: SlimeExpression | SlimeSuper
    property: SlimeExpression | SlimePrivateIdentifier
    // 访问类型
    accessor: SlimeMemberAccessor
    computed: boolean
}

export type SlimeMemberAccessor =
    | SlimeDotAccessor
    | SlimeBracketAccessor
    | SlimeQuestionDotAccessor

export interface SlimeDotAccessor {
    type: 'dot'
    dot: SlimeDotToken
}

export interface SlimeBracketAccessor {
    type: 'bracket'
    lBracket: SlimeLBracketToken
    rBracket: SlimeRBracketToken
}

export interface SlimeQuestionDotAccessor {
    type: 'questionDot'
    questionDot: SlimeQuestionDotToken
}

/**
 * SuperProperty :
 *   super [ Expression ]
 *   super . IdentifierName
 */
export interface SlimeSuperProperty extends SlimeBaseNode {
    type: SlimeAstType.SuperProperty
    superKeyword: SlimeSuperKeywordToken
    accessor: SlimeMemberAccessor
    property: SlimeExpression | SlimeIdentifierNameToken
}

/**
 * Super
 */
export interface SlimeSuper extends SlimeBaseNode {
    type: SlimeAstType.SuperProperty
    superKeyword: SlimeSuperKeywordToken
}

/**
 * MetaProperty :
 *   NewTarget
 *   ImportMeta
 */
export type SlimeMetaProperty = SlimeNewTarget | SlimeImportMeta

/**
 * NewTarget : new . target
 */
export interface SlimeNewTarget extends SlimeBaseNode {
    type: SlimeAstType.NewTarget
    newKeyword: SlimeNewKeywordToken
    dot: SlimeDotToken
    targetKeyword: SlimeTargetKeywordToken
}

/**
 * ImportMeta : import . meta
 */
export interface SlimeImportMeta extends SlimeBaseNode {
    type: SlimeAstType.ImportMeta
    importKeyword: SlimeImportKeywordToken
    dot: SlimeDotToken
    metaKeyword: SlimeMetaKeywordToken
}

/**
 * NewExpression :
 *   MemberExpression
 *   new NewExpression
 */
export interface SlimeNewExpression extends SlimeBaseNode {
    type: SlimeAstType.NewExpression
    newKeyword: SlimeNewKeywordToken
    callee: SlimeMemberExpression | SlimeNewExpression
    arguments: SlimeArguments | null
}

// --- A.2.8 调用表达式 ---

/**
 * CallExpression :
 *   CoverCallExpressionAndAsyncArrowHead
 *   SuperCall
 *   ImportCall
 *   CallExpression Arguments
 *   CallExpression [ Expression ]
 *   CallExpression . IdentifierName
 *   CallExpression TemplateLiteral
 *   CallExpression . PrivateIdentifier
 */
export interface SlimeCallExpression extends SlimeBaseNode {
    type: SlimeAstType.CallExpression
    callee: SlimeExpression | SlimeSuper
    arguments: SlimeArguments
    optional: boolean
}

/**
 * SuperCall : super Arguments
 */
export interface SlimeSuperCall extends SlimeBaseNode {
    type: SlimeAstType.SuperCall
    superKeyword: SlimeSuperKeywordToken
    arguments: SlimeArguments
}

/**
 * ImportCall : import ( AssignmentExpression )
 */
export interface SlimeImportCall extends SlimeBaseNode {
    type: SlimeAstType.ImportCall
    importKeyword: SlimeImportKeywordToken
    lParen: SlimeLParenToken
    source: SlimeAssignmentExpression
    options: SlimeImportCallOptions | null
    rParen: SlimeRParenToken
}

export interface SlimeImportCallOptions {
    comma: SlimeCommaToken
    options: SlimeAssignmentExpression
    trailingComma: SlimeCommaToken | null
}

/**
 * Arguments :
 *   ( )
 *   ( ArgumentList )
 *   ( ArgumentList , )
 */
export interface SlimeArguments extends SlimeBaseNode {
    type: SlimeAstType.Arguments
    lParen: SlimeLParenToken
    argumentList: SlimeArgumentList | null
    trailingComma: SlimeCommaToken | null
    rParen: SlimeRParenToken
}

/**
 * ArgumentList :
 *   AssignmentExpression
 *   ... AssignmentExpression
 *   ArgumentList , AssignmentExpression
 *   ArgumentList , ... AssignmentExpression
 */
export interface SlimeArgumentList extends SlimeBaseNode {
    type: SlimeAstType.ArgumentList
    items: SlimeArgumentListItem[]
}

export interface SlimeArgumentListItem {
    ellipsis: SlimeEllipsisToken | null
    argument: SlimeAssignmentExpression
    comma: SlimeCommaToken | null
}
// --- A.2.9 可选链 ---

/**
 * OptionalExpression :
 *   MemberExpression OptionalChain
 *   CallExpression OptionalChain
 *   OptionalExpression OptionalChain
 */
export interface SlimeOptionalExpression extends SlimeBaseNode {
    type: SlimeAstType.OptionalExpression
    expression: SlimeMemberExpression | SlimeCallExpression | SlimeOptionalExpression
    chain: SlimeOptionalChain
}

/**
 * OptionalChain :
 *   ?. Arguments
 *   ?. [ Expression ]
 *   ?. IdentifierName
 *   ?. TemplateLiteral
 *   ?. PrivateIdentifier
 *   OptionalChain Arguments
 *   OptionalChain [ Expression ]
 *   OptionalChain . IdentifierName
 *   OptionalChain TemplateLiteral
 *   OptionalChain . PrivateIdentifier
 */
export interface SlimeOptionalChain extends SlimeBaseNode {
    type: SlimeAstType.OptionalChain
    items: SlimeOptionalChainItem[]
}

export type SlimeOptionalChainItem =
    | SlimeOptionalCallItem
    | SlimeOptionalMemberItem
    | SlimeOptionalTemplateItem

export interface SlimeOptionalCallItem {
    type: 'call'
    questionDot: SlimeQuestionDotToken | null
    arguments: SlimeArguments
}

export interface SlimeOptionalMemberItem {
    type: 'member'
    questionDot: SlimeQuestionDotToken | null
    accessor: SlimeMemberAccessor
    property: SlimeExpression | SlimePrivateIdentifier
}

export interface SlimeOptionalTemplateItem {
    type: 'template'
    questionDot: SlimeQuestionDotToken | null
    template: SlimeTemplateLiteral
}

/**
 * LeftHandSideExpression :
 *   NewExpression
 *   CallExpression
 *   OptionalExpression
 */
export type SlimeLeftHandSideExpression =
    | SlimeNewExpression
    | SlimeCallExpression
    | SlimeOptionalExpression
    | SlimeMemberExpression
    | SlimePrimaryExpression

// --- A.2.10 更新表达式 ---

/**
 * UpdateExpression :
 *   LeftHandSideExpression
 *   LeftHandSideExpression ++
 *   LeftHandSideExpression --
 *   ++ UnaryExpression
 *   -- UnaryExpression
 */
export interface SlimeUpdateExpression extends SlimeBaseNode {
    type: SlimeAstType.UpdateExpression
    operator: SlimePlusPlusToken | SlimeMinusMinusToken
    argument: SlimeLeftHandSideExpression | SlimeUnaryExpression
    prefix: boolean
}

// --- A.2.11 一元表达式 ---

/**
 * UnaryExpression :
 *   UpdateExpression
 *   delete UnaryExpression
 *   void UnaryExpression
 *   typeof UnaryExpression
 *   + UnaryExpression
 *   - UnaryExpression
 *   ~ UnaryExpression
 *   ! UnaryExpression
 *   AwaitExpression
 */
export interface SlimeUnaryExpression extends SlimeBaseNode {
    type: SlimeAstType.UnaryExpression
    operator: SlimeUnaryOperator
    argument: SlimeUnaryExpression | SlimeUpdateExpression
    prefix: true
}

export type SlimeUnaryOperator =
    | SlimeDeleteKeywordToken
    | SlimeVoidKeywordToken
    | SlimeTypeofKeywordToken
    | SlimePlusToken
    | SlimeMinusToken
    | SlimeTildeToken
    | SlimeExclamationToken

/**
 * AwaitExpression : await UnaryExpression
 */
export interface SlimeAwaitExpression extends SlimeBaseNode {
    type: SlimeAstType.AwaitExpression
    awaitKeyword: SlimeAwaitKeywordToken
    argument: SlimeUnaryExpression
}

// --- A.2.12 二元表达式 ---

/**
 * 二元表达式（包括所有优先级）
 * ExponentiationExpression, MultiplicativeExpression, AdditiveExpression,
 * ShiftExpression, RelationalExpression, EqualityExpression,
 * BitwiseANDExpression, BitwiseXORExpression, BitwiseORExpression,
 * LogicalANDExpression, LogicalORExpression, CoalesceExpression
 */
export interface SlimeBinaryExpression extends SlimeBaseNode {
    type: SlimeAstType
    operator: SlimeTokenNode
    left: SlimeExpression
    right: SlimeExpression
}

/**
 * ConditionalExpression :
 *   ShortCircuitExpression
 *   ShortCircuitExpression ? AssignmentExpression : AssignmentExpression
 */
export interface SlimeConditionalExpression extends SlimeBaseNode {
    type: SlimeAstType.ConditionalExpression
    test: SlimeExpression
    questionMark: SlimeQuestionMarkToken
    consequent: SlimeAssignmentExpression
    colon: SlimeColonToken
    alternate: SlimeAssignmentExpression
}
// --- A.2.13 赋值表达式 ---

/**
 * AssignmentExpression :
 *   ConditionalExpression
 *   YieldExpression
 *   ArrowFunction
 *   AsyncArrowFunction
 *   LeftHandSideExpression = AssignmentExpression
 *   LeftHandSideExpression AssignmentOperator AssignmentExpression
 *   LeftHandSideExpression &&= AssignmentExpression
 *   LeftHandSideExpression ||= AssignmentExpression
 *   LeftHandSideExpression ??= AssignmentExpression
 */
export interface SlimeAssignmentExpression extends SlimeBaseNode {
    type: SlimeAstType.AssignmentExpression
    left: SlimeLeftHandSideExpression | SlimePattern
    operator: SlimeAssignmentOperatorToken
    right: SlimeAssignmentExpression
}

/**
 * YieldExpression :
 *   yield
 *   yield AssignmentExpression
 *   yield * AssignmentExpression
 */
export interface SlimeYieldExpression extends SlimeBaseNode {
    type: SlimeAstType.YieldExpression
    yieldKeyword: SlimeYieldKeywordToken
    asterisk: SlimeAsteriskToken | null
    argument: SlimeAssignmentExpression | null
}

// --- A.2.14 逗号表达式 ---

/**
 * Expression :
 *   AssignmentExpression
 *   Expression , AssignmentExpression
 */
export interface SlimeSequenceExpression extends SlimeBaseNode {
    type: SlimeAstType.Expression
    expressions: SlimeExpressionItem[]
}

export interface SlimeExpressionItem {
    expression: SlimeAssignmentExpression
    comma: SlimeCommaToken | null
}

/**
 * Expression 联合类型
 */
export type SlimeExpression =
    | SlimePrimaryExpression
    | SlimeMemberExpression
    | SlimeNewExpression
    | SlimeCallExpression
    | SlimeOptionalExpression
    | SlimeUpdateExpression
    | SlimeUnaryExpression
    | SlimeAwaitExpression
    | SlimeBinaryExpression
    | SlimeConditionalExpression
    | SlimeAssignmentExpression
    | SlimeYieldExpression
    | SlimeArrowFunction
    | SlimeAsyncArrowFunction
    | SlimeSequenceExpression

/**
 * PrivateIdentifier : # IdentifierName
 */
export interface SlimePrivateIdentifier extends SlimeBaseNode {
    type: SlimeAstType.PrivateIdentifier
    name: string
}

// ============================================
// 向前声明（在后续章节定义）
// ============================================

// 这些类型将在语句和函数/类章节定义
export interface SlimeArrowFunction extends SlimeBaseNode {
    type: SlimeAstType.ArrowFunction
    params: SlimeArrowParameters
    arrow: SlimeArrowToken
    body: SlimeConciseBody
}

export interface SlimeAsyncArrowFunction extends SlimeBaseNode {
    type: SlimeAstType.AsyncArrowFunction
    asyncKeyword: SlimeAsyncKeywordToken
    params: SlimeArrowParameters
    arrow: SlimeArrowToken
    body: SlimeAsyncConciseBody
}

export type SlimeArrowParameters = SlimeBindingIdentifier | SlimeFormalParameters

export type SlimeConciseBody = SlimeExpressionBody | SlimeFunctionBody

export type SlimeAsyncConciseBody = SlimeExpressionBody | SlimeAsyncFunctionBody

export interface SlimeExpressionBody extends SlimeBaseNode {
    type: SlimeAstType.ExpressionBody
    expression: SlimeAssignmentExpression
}

// Pattern 类型（用于解构）
export type SlimePattern =
    | SlimeBindingIdentifier
    | SlimeBindingPattern

export type SlimeBindingPattern =
    | SlimeObjectBindingPattern
    | SlimeArrayBindingPattern

// ============================================
// 占位符接口（将在后续任务中完整定义）
// 这些是为了让当前文件编译通过
// ============================================

// 绑定模式
export interface SlimeObjectBindingPattern extends SlimeBaseNode {
    type: SlimeAstType.ObjectBindingPattern
    lBrace: SlimeLBraceToken
    properties: SlimeBindingPropertyList | null
    rBrace: SlimeRBraceToken
}

export interface SlimeArrayBindingPattern extends SlimeBaseNode {
    type: SlimeAstType.ArrayBindingPattern
    lBracket: SlimeLBracketToken
    elements: SlimeBindingElementList | null
    rBracket: SlimeRBracketToken
}

export interface SlimeBindingPropertyList extends SlimeBaseNode {
    type: SlimeAstType.BindingPropertyList
    items: SlimeBindingPropertyItem[]
}

export interface SlimeBindingPropertyItem {
    property: SlimeBindingProperty
    comma: SlimeCommaToken | null
}

export type SlimeBindingProperty = SlimeSingleNameBinding | SlimeKeyValueBindingProperty

export interface SlimeSingleNameBinding extends SlimeBaseNode {
    type: SlimeAstType.SingleNameBinding
    name: SlimeBindingIdentifier
    initializer: SlimeInitializer | null
}

export interface SlimeKeyValueBindingProperty extends SlimeBaseNode {
    type: SlimeAstType.BindingProperty
    name: SlimePropertyName
    colon: SlimeColonToken
    element: SlimeBindingElement
}

export interface SlimeBindingElement extends SlimeBaseNode {
    type: SlimeAstType.BindingElement
    binding: SlimeBindingIdentifier | SlimeBindingPattern
    initializer: SlimeInitializer | null
}

export interface SlimeBindingElementList extends SlimeBaseNode {
    type: SlimeAstType.BindingElementList
    items: SlimeBindingElementItem[]
}

export interface SlimeBindingElementItem {
    elision: SlimeElision | null
    element: SlimeBindingElement | SlimeBindingRestElement | null
    comma: SlimeCommaToken | null
}

export interface SlimeBindingRestElement extends SlimeBaseNode {
    type: SlimeAstType.BindingRestElement
    ellipsis: SlimeEllipsisToken
    argument: SlimeBindingIdentifier | SlimeBindingPattern
}

// 函数参数
export interface SlimeFormalParameters extends SlimeBaseNode {
    type: SlimeAstType.FormalParameters
    lParen: SlimeLParenToken
    params: SlimeFormalParameterList | null
    rest: SlimeFunctionRestParameter | null
    rParen: SlimeRParenToken
}

export interface SlimeFormalParameterList extends SlimeBaseNode {
    type: SlimeAstType.FormalParameterList
    items: SlimeFormalParameterItem[]
}

export interface SlimeFormalParameterItem {
    param: SlimeBindingElement
    comma: SlimeCommaToken | null
}

export interface SlimeFunctionRestParameter extends SlimeBaseNode {
    type: SlimeAstType.FunctionRestParameter
    ellipsis: SlimeEllipsisToken
    element: SlimeBindingIdentifier | SlimeBindingPattern
}

// 函数体
export interface SlimeFunctionBody extends SlimeBaseNode {
    type: SlimeAstType.FunctionBody
    lBrace: SlimeLBraceToken
    statements: SlimeStatementList | null
    rBrace: SlimeRBraceToken
}

export interface SlimeAsyncFunctionBody extends SlimeBaseNode {
    type: SlimeAstType.AsyncFunctionBody
    lBrace: SlimeLBraceToken
    statements: SlimeStatementList | null
    rBrace: SlimeRBraceToken
}

export interface SlimeStatementList extends SlimeBaseNode {
    type: SlimeAstType.StatementList
    items: SlimeStatementListItem[]
}

export type SlimeStatementListItem = SlimeStatement | SlimeDeclaration

// 函数和类声明（占位）
export interface SlimeFunctionDeclaration extends SlimeBaseNode {
    type: SlimeAstType.FunctionDeclaration
    functionKeyword: SlimeFunctionKeywordToken
    asterisk: SlimeAsteriskToken | null  // generator
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeFunctionBody
}

export interface SlimeFunctionExpression extends SlimeBaseNode {
    type: SlimeAstType.FunctionExpression
    functionKeyword: SlimeFunctionKeywordToken
    asterisk: SlimeAsteriskToken | null  // generator
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeFunctionBody
}

export interface SlimeGeneratorExpression extends SlimeBaseNode {
    type: SlimeAstType.GeneratorExpression
    functionKeyword: SlimeFunctionKeywordToken
    asterisk: SlimeAsteriskToken
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeFunctionBody
}

export interface SlimeAsyncFunctionExpression extends SlimeBaseNode {
    type: SlimeAstType.AsyncFunctionExpression
    asyncKeyword: SlimeAsyncKeywordToken
    functionKeyword: SlimeFunctionKeywordToken
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeAsyncFunctionBody
}

export interface SlimeAsyncGeneratorExpression extends SlimeBaseNode {
    type: SlimeAstType.AsyncGeneratorExpression
    asyncKeyword: SlimeAsyncKeywordToken
    functionKeyword: SlimeFunctionKeywordToken
    asterisk: SlimeAsteriskToken
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeAsyncFunctionBody
}

// 类声明（占位）
export interface SlimeClassDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ClassDeclaration
    classKeyword: SlimeClassKeywordToken
    name: SlimeBindingIdentifier | null
    tail: SlimeClassTail
}

export interface SlimeClassExpression extends SlimeBaseNode {
    type: SlimeAstType.ClassExpression
    classKeyword: SlimeClassKeywordToken
    name: SlimeBindingIdentifier | null
    tail: SlimeClassTail
}

export interface SlimeClassTail extends SlimeBaseNode {
    type: SlimeAstType.ClassTail
    heritage: SlimeClassHeritage | null
    lBrace: SlimeLBraceToken
    body: SlimeClassBody | null
    rBrace: SlimeRBraceToken
}

export interface SlimeClassHeritage extends SlimeBaseNode {
    type: SlimeAstType.ClassHeritage
    extendsKeyword: SlimeExtendsKeywordToken
    superClass: SlimeLeftHandSideExpression
}

export interface SlimeClassBody extends SlimeBaseNode {
    type: SlimeAstType.ClassBody
    elements: SlimeClassElement[]
}

export type SlimeClassElement =
    | SlimeMethodDefinition
    | SlimeFieldDefinition
    | SlimeClassStaticBlock
    | SlimeEmptySemicolon

export interface SlimeMethodDefinition extends SlimeBaseNode {
    type: SlimeAstType.MethodDefinition
    staticKeyword: SlimeStaticKeywordToken | null
    kind: 'method' | 'get' | 'set' | 'constructor'
    name: SlimeClassElementName
    params: SlimeFormalParameters
    body: SlimeFunctionBody
}

export interface SlimeFieldDefinition extends SlimeBaseNode {
    type: SlimeAstType.FieldDefinition
    staticKeyword: SlimeStaticKeywordToken | null
    name: SlimeClassElementName
    initializer: SlimeInitializer | null
    semicolon: SlimeSemicolonToken
}

export type SlimeClassElementName = SlimePropertyName | SlimePrivateIdentifier

export interface SlimeClassStaticBlock extends SlimeBaseNode {
    type: SlimeAstType.ClassStaticBlock
    staticKeyword: SlimeStaticKeywordToken
    lBrace: SlimeLBraceToken
    body: SlimeStatementList | null
    rBrace: SlimeRBraceToken
}

export interface SlimeEmptySemicolon extends SlimeBaseNode {
    type: SlimeAstType.EmptyStatement
    semicolon: SlimeSemicolonToken
}

// 语句类型（占位）
export type SlimeStatement =
    | SlimeBlockStatement
    | SlimeVariableStatement
    | SlimeEmptyStatement
    | SlimeExpressionStatement
    | SlimeIfStatement
    | SlimeIterationStatement
    | SlimeContinueStatement
    | SlimeBreakStatement
    | SlimeReturnStatement
    | SlimeWithStatement
    | SlimeSwitchStatement
    | SlimeLabelledStatement
    | SlimeThrowStatement
    | SlimeTryStatement
    | SlimeDebuggerStatement

export type SlimeDeclaration =
    | SlimeFunctionDeclaration
    | SlimeGeneratorDeclaration
    | SlimeAsyncFunctionDeclaration
    | SlimeAsyncGeneratorDeclaration
    | SlimeClassDeclaration
    | SlimeLexicalDeclaration

export interface SlimeBlockStatement extends SlimeBaseNode {
    type: SlimeAstType.BlockStatement
    lBrace: SlimeLBraceToken
    statements: SlimeStatementList | null
    rBrace: SlimeRBraceToken
}

export interface SlimeVariableStatement extends SlimeBaseNode {
    type: SlimeAstType.VariableStatement
    varKeyword: SlimeVarKeywordToken
    declarations: SlimeVariableDeclarationList
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeVariableDeclarationList extends SlimeBaseNode {
    type: SlimeAstType.VariableDeclarationList
    items: SlimeVariableDeclarationItem[]
}

export interface SlimeVariableDeclarationItem {
    declaration: SlimeVariableDeclaration
    comma: SlimeCommaToken | null
}

export interface SlimeVariableDeclaration extends SlimeBaseNode {
    type: SlimeAstType.VariableDeclaration
    binding: SlimeBindingIdentifier | SlimeBindingPattern
    initializer: SlimeInitializer | null
}

export interface SlimeLexicalDeclaration extends SlimeBaseNode {
    type: SlimeAstType.LexicalDeclaration
    letOrConst: SlimeLetKeywordToken | SlimeConstKeywordToken
    bindings: SlimeBindingList
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeBindingList extends SlimeBaseNode {
    type: SlimeAstType.BindingList
    items: SlimeLexicalBindingItem[]
}

export interface SlimeLexicalBindingItem {
    binding: SlimeLexicalBinding
    comma: SlimeCommaToken | null
}

export interface SlimeLexicalBinding extends SlimeBaseNode {
    type: SlimeAstType.LexicalBinding
    binding: SlimeBindingIdentifier | SlimeBindingPattern
    initializer: SlimeInitializer | null
}

export interface SlimeEmptyStatement extends SlimeBaseNode {
    type: SlimeAstType.EmptyStatement
    semicolon: SlimeSemicolonToken
}

export interface SlimeExpressionStatement extends SlimeBaseNode {
    type: SlimeAstType.ExpressionStatement
    expression: SlimeExpression
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeIfStatement extends SlimeBaseNode {
    type: SlimeAstType.IfStatement
    ifKeyword: SlimeIfKeywordToken
    lParen: SlimeLParenToken
    test: SlimeExpression
    rParen: SlimeRParenToken
    consequent: SlimeStatement
    elseClause: SlimeElseClause | null
}

export interface SlimeElseClause {
    elseKeyword: SlimeElseKeywordToken
    alternate: SlimeStatement
}

export type SlimeIterationStatement =
    | SlimeDoWhileStatement
    | SlimeWhileStatement
    | SlimeForStatement
    | SlimeForInOfStatement

export interface SlimeDoWhileStatement extends SlimeBaseNode {
    type: SlimeAstType.DoWhileStatement
    doKeyword: SlimeDoKeywordToken
    body: SlimeStatement
    whileKeyword: SlimeWhileKeywordToken
    lParen: SlimeLParenToken
    test: SlimeExpression
    rParen: SlimeRParenToken
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeWhileStatement extends SlimeBaseNode {
    type: SlimeAstType.WhileStatement
    whileKeyword: SlimeWhileKeywordToken
    lParen: SlimeLParenToken
    test: SlimeExpression
    rParen: SlimeRParenToken
    body: SlimeStatement
}

export interface SlimeForStatement extends SlimeBaseNode {
    type: SlimeAstType.ForStatement
    forKeyword: SlimeForKeywordToken
    lParen: SlimeLParenToken
    init: SlimeExpression | SlimeVariableDeclarationList | SlimeLexicalDeclaration | null
    semicolon1: SlimeSemicolonToken
    test: SlimeExpression | null
    semicolon2: SlimeSemicolonToken
    update: SlimeExpression | null
    rParen: SlimeRParenToken
    body: SlimeStatement
}

export interface SlimeForInOfStatement extends SlimeBaseNode {
    type: SlimeAstType.ForInOfStatement
    forKeyword: SlimeForKeywordToken
    awaitKeyword: SlimeAwaitKeywordToken | null
    lParen: SlimeLParenToken
    left: SlimeLeftHandSideExpression | SlimeForDeclaration | SlimeVariableDeclarationList
    inOrOf: SlimeInKeywordToken | SlimeOfKeywordToken
    right: SlimeExpression | SlimeAssignmentExpression
    rParen: SlimeRParenToken
    body: SlimeStatement
}

export interface SlimeForDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ForDeclaration
    letOrConst: SlimeLetKeywordToken | SlimeConstKeywordToken
    binding: SlimeForBinding
}

export type SlimeForBinding = SlimeBindingIdentifier | SlimeBindingPattern

export interface SlimeContinueStatement extends SlimeBaseNode {
    type: SlimeAstType.ContinueStatement
    continueKeyword: SlimeContinueKeywordToken
    label: SlimeLabelIdentifier | null
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeBreakStatement extends SlimeBaseNode {
    type: SlimeAstType.BreakStatement
    breakKeyword: SlimeBreakKeywordToken
    label: SlimeLabelIdentifier | null
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeReturnStatement extends SlimeBaseNode {
    type: SlimeAstType.ReturnStatement
    returnKeyword: SlimeReturnKeywordToken
    argument: SlimeExpression | null
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeWithStatement extends SlimeBaseNode {
    type: SlimeAstType.WithStatement
    withKeyword: SlimeWithKeywordToken
    lParen: SlimeLParenToken
    object: SlimeExpression
    rParen: SlimeRParenToken
    body: SlimeStatement
}

export interface SlimeSwitchStatement extends SlimeBaseNode {
    type: SlimeAstType.SwitchStatement
    switchKeyword: SlimeSwitchKeywordToken
    lParen: SlimeLParenToken
    discriminant: SlimeExpression
    rParen: SlimeRParenToken
    cases: SlimeCaseBlock
}

export interface SlimeCaseBlock extends SlimeBaseNode {
    type: SlimeAstType.CaseBlock
    lBrace: SlimeLBraceToken
    clauses: (SlimeCaseClause | SlimeDefaultClause)[]
    rBrace: SlimeRBraceToken
}

export interface SlimeCaseClause extends SlimeBaseNode {
    type: SlimeAstType.CaseClause
    caseKeyword: SlimeCaseKeywordToken
    test: SlimeExpression
    colon: SlimeColonToken
    consequent: SlimeStatementList | null
}

export interface SlimeDefaultClause extends SlimeBaseNode {
    type: SlimeAstType.DefaultClause
    defaultKeyword: SlimeDefaultKeywordToken
    colon: SlimeColonToken
    consequent: SlimeStatementList | null
}

export interface SlimeLabelledStatement extends SlimeBaseNode {
    type: SlimeAstType.LabelledStatement
    label: SlimeLabelIdentifier
    colon: SlimeColonToken
    body: SlimeStatement | SlimeFunctionDeclaration
}

export interface SlimeThrowStatement extends SlimeBaseNode {
    type: SlimeAstType.ThrowStatement
    throwKeyword: SlimeThrowKeywordToken
    argument: SlimeExpression
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeTryStatement extends SlimeBaseNode {
    type: SlimeAstType.TryStatement
    tryKeyword: SlimeTryKeywordToken
    block: SlimeBlockStatement
    catchClause: SlimeCatch | null
    finallyClause: SlimeFinally | null
}

export interface SlimeCatch extends SlimeBaseNode {
    type: SlimeAstType.Catch
    catchKeyword: SlimeCatchKeywordToken
    parameter: SlimeCatchParameter | null
    block: SlimeBlockStatement
}

export interface SlimeCatchParameter {
    lParen: SlimeLParenToken
    param: SlimeBindingIdentifier | SlimeBindingPattern
    rParen: SlimeRParenToken
}

export interface SlimeFinally extends SlimeBaseNode {
    type: SlimeAstType.Finally
    finallyKeyword: SlimeFinallyKeywordToken
    block: SlimeBlockStatement
}

export interface SlimeDebuggerStatement extends SlimeBaseNode {
    type: SlimeAstType.DebuggerStatement
    debuggerKeyword: SlimeDebuggerKeywordToken
    semicolon: SlimeSemicolonToken | null
}

// Generator 和 Async 声明
export interface SlimeGeneratorDeclaration extends SlimeBaseNode {
    type: SlimeAstType.GeneratorDeclaration
    functionKeyword: SlimeFunctionKeywordToken
    asterisk: SlimeAsteriskToken
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeFunctionBody
}

export interface SlimeAsyncFunctionDeclaration extends SlimeBaseNode {
    type: SlimeAstType.AsyncFunctionDeclaration
    asyncKeyword: SlimeAsyncKeywordToken
    functionKeyword: SlimeFunctionKeywordToken
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeAsyncFunctionBody
}

export interface SlimeAsyncGeneratorDeclaration extends SlimeBaseNode {
    type: SlimeAstType.AsyncGeneratorDeclaration
    asyncKeyword: SlimeAsyncKeywordToken
    functionKeyword: SlimeFunctionKeywordToken
    asterisk: SlimeAsteriskToken
    name: SlimeBindingIdentifier | null
    params: SlimeFormalParameters
    body: SlimeAsyncFunctionBody
}

// ============================================
// A.5 脚本和模块 (Scripts and Modules)
// ============================================

/**
 * Script :
 *   ScriptBody_opt
 */
export interface SlimeScript extends SlimeBaseNode {
    type: SlimeAstType.Script
    body: SlimeScriptBody | null
}

/**
 * ScriptBody :
 *   StatementList
 */
export interface SlimeScriptBody extends SlimeBaseNode {
    type: SlimeAstType.ScriptBody
    statements: SlimeStatementList
}

/**
 * Module :
 *   ModuleBody_opt
 */
export interface SlimeModule extends SlimeBaseNode {
    type: SlimeAstType.Module
    body: SlimeModuleBody | null
}

/**
 * ModuleBody :
 *   ModuleItemList
 */
export interface SlimeModuleBody extends SlimeBaseNode {
    type: SlimeAstType.ModuleBody
    items: SlimeModuleItemList
}

/**
 * ModuleItemList :
 *   ModuleItem
 *   ModuleItemList ModuleItem
 */
export interface SlimeModuleItemList extends SlimeBaseNode {
    type: SlimeAstType.ModuleItemList
    items: SlimeModuleItem[]
}

/**
 * ModuleItem :
 *   ImportDeclaration
 *   ExportDeclaration
 *   StatementListItem
 */
export type SlimeModuleItem =
    | SlimeImportDeclaration
    | SlimeExportDeclaration
    | SlimeStatementListItem

// --- A.5.4 导入 ---

/**
 * ImportDeclaration :
 *   import ImportClause FromClause ;
 *   import ModuleSpecifier ;
 */
export interface SlimeImportDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ImportDeclaration
    importKeyword: SlimeImportKeywordToken
    clause: SlimeImportClause | null
    fromClause: SlimeFromClause | null
    moduleSpecifier: SlimeModuleSpecifier | null
    withClause: SlimeWithClause | null
    semicolon: SlimeSemicolonToken | null
}

/**
 * ImportClause :
 *   ImportedDefaultBinding
 *   NameSpaceImport
 *   NamedImports
 *   ImportedDefaultBinding , NameSpaceImport
 *   ImportedDefaultBinding , NamedImports
 */
export interface SlimeImportClause extends SlimeBaseNode {
    type: SlimeAstType.ImportClause
    defaultBinding: SlimeImportedDefaultBinding | null
    comma: SlimeCommaToken | null
    namespaceOrNamed: SlimeNameSpaceImport | SlimeNamedImports | null
}

/**
 * ImportedDefaultBinding :
 *   ImportedBinding
 */
export interface SlimeImportedDefaultBinding extends SlimeBaseNode {
    type: SlimeAstType.ImportedDefaultBinding
    binding: SlimeImportedBinding
}

/**
 * NameSpaceImport :
 *   * as ImportedBinding
 */
export interface SlimeNameSpaceImport extends SlimeBaseNode {
    type: SlimeAstType.NameSpaceImport
    asterisk: SlimeAsteriskToken
    asKeyword: SlimeAsKeywordToken
    binding: SlimeImportedBinding
}

/**
 * NamedImports :
 *   { }
 *   { ImportsList }
 *   { ImportsList , }
 */
export interface SlimeNamedImports extends SlimeBaseNode {
    type: SlimeAstType.NamedImports
    lBrace: SlimeLBraceToken
    imports: SlimeImportsList | null
    trailingComma: SlimeCommaToken | null
    rBrace: SlimeRBraceToken
}

/**
 * FromClause :
 *   from ModuleSpecifier
 */
export interface SlimeFromClause extends SlimeBaseNode {
    type: SlimeAstType.FromClause
    fromKeyword: SlimeFromKeywordToken
    specifier: SlimeModuleSpecifier
}

/**
 * ImportsList :
 *   ImportSpecifier
 *   ImportsList , ImportSpecifier
 */
export interface SlimeImportsList extends SlimeBaseNode {
    type: SlimeAstType.ImportsList
    items: SlimeImportsListItem[]
}

export interface SlimeImportsListItem {
    specifier: SlimeImportSpecifier
    comma: SlimeCommaToken | null
}

/**
 * ImportSpecifier :
 *   ImportedBinding
 *   ModuleExportName as ImportedBinding
 */
export interface SlimeImportSpecifier extends SlimeBaseNode {
    type: SlimeAstType.ImportSpecifier
    name: SlimeModuleExportName | null
    asKeyword: SlimeAsKeywordToken | null
    binding: SlimeImportedBinding
}

/**
 * ModuleSpecifier :
 *   StringLiteral
 */
export interface SlimeModuleSpecifier extends SlimeBaseNode {
    type: SlimeAstType.ModuleSpecifier
    value: SlimeStringLiteralToken
}

/**
 * ImportedBinding :
 *   BindingIdentifier
 */
export interface SlimeImportedBinding extends SlimeBaseNode {
    type: SlimeAstType.ImportedBinding
    binding: SlimeBindingIdentifier
}

/**
 * ModuleExportName :
 *   IdentifierName
 *   StringLiteral
 */
export type SlimeModuleExportName = SlimeIdentifierNameToken | SlimeStringLiteralToken

/**
 * WithClause :
 *   with { WithEntries }
 */
export interface SlimeWithClause extends SlimeBaseNode {
    type: SlimeAstType.WithClause
    withKeyword: SlimeWithKeywordToken
    lBrace: SlimeLBraceToken
    entries: SlimeWithEntries | null
    trailingComma: SlimeCommaToken | null
    rBrace: SlimeRBraceToken
}

/**
 * WithEntries :
 *   AttributeKey : StringLiteral
 *   AttributeKey : StringLiteral , WithEntries
 */
export interface SlimeWithEntries extends SlimeBaseNode {
    type: SlimeAstType.WithEntries
    items: SlimeWithEntryItem[]
}

export interface SlimeWithEntryItem {
    key: SlimeAttributeKey
    colon: SlimeColonToken
    value: SlimeStringLiteralToken
    comma: SlimeCommaToken | null
}

/**
 * AttributeKey :
 *   IdentifierName
 *   StringLiteral
 */
export type SlimeAttributeKey = SlimeIdentifierNameToken | SlimeStringLiteralToken

// --- A.5.5 导出 ---

/**
 * ExportDeclaration :
 *   export ExportFromClause FromClause ;
 *   export NamedExports ;
 *   export VariableStatement
 *   export Declaration
 *   export default HoistableDeclaration
 *   export default ClassDeclaration
 *   export default AssignmentExpression ;
 */
export type SlimeExportDeclaration =
    | SlimeExportFromDeclaration
    | SlimeExportNamedDeclaration
    | SlimeExportVariableDeclaration
    | SlimeExportDeclarationDeclaration
    | SlimeExportDefaultDeclaration

export interface SlimeExportFromDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ExportDeclaration
    exportKeyword: SlimeExportKeywordToken
    exportFromClause: SlimeExportFromClause
    fromClause: SlimeFromClause
    withClause: SlimeWithClause | null
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeExportNamedDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ExportDeclaration
    exportKeyword: SlimeExportKeywordToken
    namedExports: SlimeNamedExports
    semicolon: SlimeSemicolonToken | null
}

export interface SlimeExportVariableDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ExportDeclaration
    exportKeyword: SlimeExportKeywordToken
    variableStatement: SlimeVariableStatement
}

export interface SlimeExportDeclarationDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ExportDeclaration
    exportKeyword: SlimeExportKeywordToken
    declaration: SlimeDeclaration
}

export interface SlimeExportDefaultDeclaration extends SlimeBaseNode {
    type: SlimeAstType.ExportDeclaration
    exportKeyword: SlimeExportKeywordToken
    defaultKeyword: SlimeDefaultKeywordToken
    declaration: SlimeHoistableDeclaration | SlimeClassDeclaration | SlimeAssignmentExpression
    semicolon: SlimeSemicolonToken | null
}

export type SlimeHoistableDeclaration =
    | SlimeFunctionDeclaration
    | SlimeGeneratorDeclaration
    | SlimeAsyncFunctionDeclaration
    | SlimeAsyncGeneratorDeclaration

/**
 * ExportFromClause :
 *   *
 *   * as ModuleExportName
 *   NamedExports
 */
export type SlimeExportFromClause =
    | SlimeExportAllFromClause
    | SlimeExportAsFromClause
    | SlimeNamedExports

export interface SlimeExportAllFromClause extends SlimeBaseNode {
    type: SlimeAstType.ExportFromClause
    asterisk: SlimeAsteriskToken
}

export interface SlimeExportAsFromClause extends SlimeBaseNode {
    type: SlimeAstType.ExportFromClause
    asterisk: SlimeAsteriskToken
    asKeyword: SlimeAsKeywordToken
    exportedName: SlimeModuleExportName
}

/**
 * NamedExports :
 *   { }
 *   { ExportsList }
 *   { ExportsList , }
 */
export interface SlimeNamedExports extends SlimeBaseNode {
    type: SlimeAstType.NamedExports
    lBrace: SlimeLBraceToken
    exports: SlimeExportsList | null
    trailingComma: SlimeCommaToken | null
    rBrace: SlimeRBraceToken
}

/**
 * ExportsList :
 *   ExportSpecifier
 *   ExportsList , ExportSpecifier
 */
export interface SlimeExportsList extends SlimeBaseNode {
    type: SlimeAstType.ExportsList
    items: SlimeExportsListItem[]
}

export interface SlimeExportsListItem {
    specifier: SlimeExportSpecifier
    comma: SlimeCommaToken | null
}

/**
 * ExportSpecifier :
 *   ModuleExportName
 *   ModuleExportName as ModuleExportName
 */
export interface SlimeExportSpecifier extends SlimeBaseNode {
    type: SlimeAstType.ExportSpecifier
    localName: SlimeModuleExportName
    asKeyword: SlimeAsKeywordToken | null
    exportedName: SlimeModuleExportName | null
}
