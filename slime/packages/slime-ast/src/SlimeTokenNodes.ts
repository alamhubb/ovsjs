/**
 * SlimeTokenNodes.ts - Token 节点定义
 * 
 * 定义所有 Token（终结符）节点接口
 * 完全保留源码位置信息
 * 
 * @see SlimeAstType.ts 中的 Token 类型定义
 */

import { SlimeAstType } from './SlimeAstType.ts'
import type { SubhutiSourceLocation } from '../../../../subhuti/src/struct/SubhutiCst.ts'

// ============================================
// 基础接口
// ============================================

/**
 * 所有 AST 节点的基础接口
 */
export interface SlimeBaseNode {
    /** 节点类型 */
    type: SlimeAstType | string
    /** 位置信息 */
    loc: SubhutiSourceLocation
}

/**
 * Token 节点基础接口（终结符）
 * 所有具体的 Token 节点都继承此接口
 */
export interface SlimeTokenNode extends SlimeBaseNode {
    /** Token 原始值 */
    value: string
}

// ============================================
// 标点符号 Token
// ============================================

export interface SlimeLParenToken extends SlimeTokenNode {
    type: SlimeAstType.LParen
    value: '('
}

export interface SlimeRParenToken extends SlimeTokenNode {
    type: SlimeAstType.RParen
    value: ')'
}

export interface SlimeLBraceToken extends SlimeTokenNode {
    type: SlimeAstType.LBrace
    value: '{'
}

export interface SlimeRBraceToken extends SlimeTokenNode {
    type: SlimeAstType.RBrace
    value: '}'
}

export interface SlimeLBracketToken extends SlimeTokenNode {
    type: SlimeAstType.LBracket
    value: '['
}

export interface SlimeRBracketToken extends SlimeTokenNode {
    type: SlimeAstType.RBracket
    value: ']'
}

export interface SlimeDotToken extends SlimeTokenNode {
    type: SlimeAstType.Dot
    value: '.'
}

export interface SlimeEllipsisToken extends SlimeTokenNode {
    type: SlimeAstType.Ellipsis
    value: '...'
}

export interface SlimeSemicolonToken extends SlimeTokenNode {
    type: SlimeAstType.Semicolon
    value: ';'
}

export interface SlimeCommaToken extends SlimeTokenNode {
    type: SlimeAstType.Comma
    value: ','
}

export interface SlimeQuestionDotToken extends SlimeTokenNode {
    type: SlimeAstType.QuestionDot
    value: '?.'
}

export interface SlimeColonToken extends SlimeTokenNode {
    type: SlimeAstType.Colon
    value: ':'
}

export interface SlimeQuestionMarkToken extends SlimeTokenNode {
    type: SlimeAstType.QuestionMark
    value: '?'
}

export interface SlimeArrowToken extends SlimeTokenNode {
    type: SlimeAstType.Arrow
    value: '=>'
}

// ============================================
// 比较运算符 Token
// ============================================

export interface SlimeLessThanToken extends SlimeTokenNode {
    type: SlimeAstType.LessThan
    value: '<'
}

export interface SlimeGreaterThanToken extends SlimeTokenNode {
    type: SlimeAstType.GreaterThan
    value: '>'
}

export interface SlimeLessThanEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.LessThanEquals
    value: '<='
}

export interface SlimeGreaterThanEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.GreaterThanEquals
    value: '>='
}

export interface SlimeEqualsEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.EqualsEquals
    value: '=='
}

export interface SlimeExclamationEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.ExclamationEquals
    value: '!='
}

export interface SlimeEqualsEqualsEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.EqualsEqualsEquals
    value: '==='
}

export interface SlimeExclamationEqualsEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.ExclamationEqualsEquals
    value: '!=='
}

// ============================================
// 算术运算符 Token
// ============================================

export interface SlimePlusToken extends SlimeTokenNode {
    type: SlimeAstType.Plus
    value: '+'
}

export interface SlimeMinusToken extends SlimeTokenNode {
    type: SlimeAstType.Minus
    value: '-'
}

export interface SlimeAsteriskToken extends SlimeTokenNode {
    type: SlimeAstType.Asterisk
    value: '*'
}

export interface SlimeSlashToken extends SlimeTokenNode {
    type: SlimeAstType.Slash
    value: '/'
}

export interface SlimePercentToken extends SlimeTokenNode {
    type: SlimeAstType.Percent
    value: '%'
}

export interface SlimeAsteriskAsteriskToken extends SlimeTokenNode {
    type: SlimeAstType.AsteriskAsterisk
    value: '**'
}

// ============================================
// 自增自减运算符 Token
// ============================================

export interface SlimePlusPlusToken extends SlimeTokenNode {
    type: SlimeAstType.PlusPlus
    value: '++'
}

export interface SlimeMinusMinusToken extends SlimeTokenNode {
    type: SlimeAstType.MinusMinus
    value: '--'
}

// ============================================
// 位运算符 Token
// ============================================

export interface SlimeLessThanLessThanToken extends SlimeTokenNode {
    type: SlimeAstType.LessThanLessThan
    value: '<<'
}

export interface SlimeGreaterThanGreaterThanToken extends SlimeTokenNode {
    type: SlimeAstType.GreaterThanGreaterThan
    value: '>>'
}

export interface SlimeGreaterThanGreaterThanGreaterThanToken extends SlimeTokenNode {
    type: SlimeAstType.GreaterThanGreaterThanGreaterThan
    value: '>>>'
}

export interface SlimeAmpersandToken extends SlimeTokenNode {
    type: SlimeAstType.Ampersand
    value: '&'
}

export interface SlimeBarToken extends SlimeTokenNode {
    type: SlimeAstType.Bar
    value: '|'
}

export interface SlimeCaretToken extends SlimeTokenNode {
    type: SlimeAstType.Caret
    value: '^'
}

export interface SlimeTildeToken extends SlimeTokenNode {
    type: SlimeAstType.Tilde
    value: '~'
}

export interface SlimeExclamationToken extends SlimeTokenNode {
    type: SlimeAstType.Exclamation
    value: '!'
}

// ============================================
// 逻辑运算符 Token
// ============================================

export interface SlimeAmpersandAmpersandToken extends SlimeTokenNode {
    type: SlimeAstType.AmpersandAmpersand
    value: '&&'
}

export interface SlimeBarBarToken extends SlimeTokenNode {
    type: SlimeAstType.BarBar
    value: '||'
}

export interface SlimeQuestionQuestionToken extends SlimeTokenNode {
    type: SlimeAstType.QuestionQuestion
    value: '??'
}

// ============================================
// 赋值运算符 Token
// ============================================

export interface SlimeEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.Equals
    value: '='
}

export interface SlimePlusEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.PlusEquals
    value: '+='
}

export interface SlimeMinusEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.MinusEquals
    value: '-='
}

export interface SlimeAsteriskEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.AsteriskEquals
    value: '*='
}

export interface SlimeSlashEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.SlashEquals
    value: '/='
}

export interface SlimePercentEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.PercentEquals
    value: '%='
}

export interface SlimeAsteriskAsteriskEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.AsteriskAsteriskEquals
    value: '**='
}

export interface SlimeLessThanLessThanEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.LessThanLessThanEquals
    value: '<<='
}

export interface SlimeGreaterThanGreaterThanEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.GreaterThanGreaterThanEquals
    value: '>>='
}

export interface SlimeGreaterThanGreaterThanGreaterThanEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.GreaterThanGreaterThanGreaterThanEquals
    value: '>>>='
}

export interface SlimeAmpersandEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.AmpersandEquals
    value: '&='
}

export interface SlimeBarEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.BarEquals
    value: '|='
}

export interface SlimeCaretEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.CaretEquals
    value: '^='
}

export interface SlimeAmpersandAmpersandEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.AmpersandAmpersandEquals
    value: '&&='
}

export interface SlimeBarBarEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.BarBarEquals
    value: '||='
}

export interface SlimeQuestionQuestionEqualsToken extends SlimeTokenNode {
    type: SlimeAstType.QuestionQuestionEquals
    value: '??='
}

// ============================================
// 关键字 Token
// ============================================

// --- 保留字关键字 ---

export interface SlimeAwaitKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.AwaitKeyword
    value: 'await'
}

export interface SlimeBreakKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.BreakKeyword
    value: 'break'
}

export interface SlimeCaseKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.CaseKeyword
    value: 'case'
}

export interface SlimeCatchKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.CatchKeyword
    value: 'catch'
}

export interface SlimeClassKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ClassKeyword
    value: 'class'
}

export interface SlimeConstKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ConstKeyword
    value: 'const'
}

export interface SlimeContinueKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ContinueKeyword
    value: 'continue'
}

export interface SlimeDebuggerKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.DebuggerKeyword
    value: 'debugger'
}

export interface SlimeDefaultKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.DefaultKeyword
    value: 'default'
}

export interface SlimeDeleteKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.DeleteKeyword
    value: 'delete'
}

export interface SlimeDoKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.DoKeyword
    value: 'do'
}

export interface SlimeElseKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ElseKeyword
    value: 'else'
}

export interface SlimeExportKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ExportKeyword
    value: 'export'
}

export interface SlimeExtendsKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ExtendsKeyword
    value: 'extends'
}

export interface SlimeFalseKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.FalseKeyword
    value: 'false'
}

export interface SlimeFinallyKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.FinallyKeyword
    value: 'finally'
}

export interface SlimeForKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ForKeyword
    value: 'for'
}

export interface SlimeFunctionKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.FunctionKeyword
    value: 'function'
}

export interface SlimeIfKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.IfKeyword
    value: 'if'
}

export interface SlimeImportKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ImportKeyword
    value: 'import'
}

export interface SlimeInKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.InKeyword
    value: 'in'
}

export interface SlimeInstanceofKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.InstanceofKeyword
    value: 'instanceof'
}

export interface SlimeNewKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.NewKeyword
    value: 'new'
}

export interface SlimeNullKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.NullKeyword
    value: 'null'
}

export interface SlimeReturnKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ReturnKeyword
    value: 'return'
}

export interface SlimeSuperKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.SuperKeyword
    value: 'super'
}

export interface SlimeSwitchKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.SwitchKeyword
    value: 'switch'
}

export interface SlimeThisKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ThisKeyword
    value: 'this'
}

export interface SlimeThrowKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.ThrowKeyword
    value: 'throw'
}

export interface SlimeTrueKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.TrueKeyword
    value: 'true'
}

export interface SlimeTryKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.TryKeyword
    value: 'try'
}

export interface SlimeTypeofKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.TypeofKeyword
    value: 'typeof'
}

export interface SlimeVarKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.VarKeyword
    value: 'var'
}

export interface SlimeVoidKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.VoidKeyword
    value: 'void'
}

export interface SlimeWhileKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.WhileKeyword
    value: 'while'
}

export interface SlimeWithKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.WithKeyword
    value: 'with'
}

export interface SlimeYieldKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.YieldKeyword
    value: 'yield'
}

// --- 上下文关键字 ---

export interface SlimeAsyncKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.AsyncKeyword
    value: 'async'
}

export interface SlimeFromKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.FromKeyword
    value: 'from'
}

export interface SlimeGetKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.GetKeyword
    value: 'get'
}

export interface SlimeLetKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.LetKeyword
    value: 'let'
}

export interface SlimeMetaKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.MetaKeyword
    value: 'meta'
}

export interface SlimeOfKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.OfKeyword
    value: 'of'
}

export interface SlimeSetKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.SetKeyword
    value: 'set'
}

export interface SlimeStaticKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.StaticKeyword
    value: 'static'
}

export interface SlimeTargetKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.TargetKeyword
    value: 'target'
}

export interface SlimeAsKeywordToken extends SlimeTokenNode {
    type: SlimeAstType.AsKeyword
    value: 'as'
}

// ============================================
// 模板字符串 Token
// ============================================

export interface SlimeNoSubstitutionTemplateToken extends SlimeTokenNode {
    type: SlimeAstType.NoSubstitutionTemplate
    // value 包含完整的模板字符串，包括反引号
}

export interface SlimeTemplateHeadToken extends SlimeTokenNode {
    type: SlimeAstType.TemplateHead
    // value 包含 ` ... ${
}

export interface SlimeTemplateMiddleToken extends SlimeTokenNode {
    type: SlimeAstType.TemplateMiddle
    // value 包含 } ... ${
}

export interface SlimeTemplateTailToken extends SlimeTokenNode {
    type: SlimeAstType.TemplateTail
    // value 包含 } ... `
}

// ============================================
// 字面量 Token
// ============================================

export interface SlimeIdentifierToken extends SlimeTokenNode {
    type: SlimeAstType.Identifier
    // value 是标识符名称
}

export interface SlimeIdentifierNameToken extends SlimeTokenNode {
    type: SlimeAstType.IdentifierName
    // value 是标识符名称（可以是保留字）
}

export interface SlimePrivateIdentifierToken extends SlimeTokenNode {
    type: SlimeAstType.PrivateIdentifier
    // value 包含 # 前缀，如 "#foo"
}

export interface SlimeNumericLiteralToken extends SlimeTokenNode {
    type: SlimeAstType.NumericLiteral
    // value 是数字的字符串表示
}

export interface SlimeStringLiteralToken extends SlimeTokenNode {
    type: SlimeAstType.StringLiteral
    // value 包含引号
}

export interface SlimeRegularExpressionLiteralToken extends SlimeTokenNode {
    type: SlimeAstType.RegularExpressionLiteral
    // value 包含 /pattern/flags
}

// ============================================
// 联合类型（便于类型推断）
// ============================================

/** 所有标点符号 Token 的联合类型 */
export type SlimePunctuatorToken =
    | SlimeLParenToken
    | SlimeRParenToken
    | SlimeLBraceToken
    | SlimeRBraceToken
    | SlimeLBracketToken
    | SlimeRBracketToken
    | SlimeDotToken
    | SlimeEllipsisToken
    | SlimeSemicolonToken
    | SlimeCommaToken
    | SlimeQuestionDotToken
    | SlimeColonToken
    | SlimeQuestionMarkToken
    | SlimeArrowToken

/** 所有比较运算符 Token 的联合类型 */
export type SlimeComparisonOperatorToken =
    | SlimeLessThanToken
    | SlimeGreaterThanToken
    | SlimeLessThanEqualsToken
    | SlimeGreaterThanEqualsToken
    | SlimeEqualsEqualsToken
    | SlimeExclamationEqualsToken
    | SlimeEqualsEqualsEqualsToken
    | SlimeExclamationEqualsEqualsToken

/** 所有算术运算符 Token 的联合类型 */
export type SlimeArithmeticOperatorToken =
    | SlimePlusToken
    | SlimeMinusToken
    | SlimeAsteriskToken
    | SlimeSlashToken
    | SlimePercentToken
    | SlimeAsteriskAsteriskToken

/** 所有赋值运算符 Token 的联合类型 */
export type SlimeAssignmentOperatorToken =
    | SlimeEqualsToken
    | SlimePlusEqualsToken
    | SlimeMinusEqualsToken
    | SlimeAsteriskEqualsToken
    | SlimeSlashEqualsToken
    | SlimePercentEqualsToken
    | SlimeAsteriskAsteriskEqualsToken
    | SlimeLessThanLessThanEqualsToken
    | SlimeGreaterThanGreaterThanEqualsToken
    | SlimeGreaterThanGreaterThanGreaterThanEqualsToken
    | SlimeAmpersandEqualsToken
    | SlimeBarEqualsToken
    | SlimeCaretEqualsToken
    | SlimeAmpersandAmpersandEqualsToken
    | SlimeBarBarEqualsToken
    | SlimeQuestionQuestionEqualsToken

/** 所有关键字 Token 的联合类型 */
export type SlimeKeywordToken =
    | SlimeAwaitKeywordToken
    | SlimeBreakKeywordToken
    | SlimeCaseKeywordToken
    | SlimeCatchKeywordToken
    | SlimeClassKeywordToken
    | SlimeConstKeywordToken
    | SlimeContinueKeywordToken
    | SlimeDebuggerKeywordToken
    | SlimeDefaultKeywordToken
    | SlimeDeleteKeywordToken
    | SlimeDoKeywordToken
    | SlimeElseKeywordToken
    | SlimeExportKeywordToken
    | SlimeExtendsKeywordToken
    | SlimeFalseKeywordToken
    | SlimeFinallyKeywordToken
    | SlimeForKeywordToken
    | SlimeFunctionKeywordToken
    | SlimeIfKeywordToken
    | SlimeImportKeywordToken
    | SlimeInKeywordToken
    | SlimeInstanceofKeywordToken
    | SlimeNewKeywordToken
    | SlimeNullKeywordToken
    | SlimeReturnKeywordToken
    | SlimeSuperKeywordToken
    | SlimeSwitchKeywordToken
    | SlimeThisKeywordToken
    | SlimeThrowKeywordToken
    | SlimeTrueKeywordToken
    | SlimeTryKeywordToken
    | SlimeTypeofKeywordToken
    | SlimeVarKeywordToken
    | SlimeVoidKeywordToken
    | SlimeWhileKeywordToken
    | SlimeWithKeywordToken
    | SlimeYieldKeywordToken
    | SlimeAsyncKeywordToken
    | SlimeFromKeywordToken
    | SlimeGetKeywordToken
    | SlimeLetKeywordToken
    | SlimeMetaKeywordToken
    | SlimeOfKeywordToken
    | SlimeSetKeywordToken
    | SlimeStaticKeywordToken
    | SlimeTargetKeywordToken
    | SlimeAsKeywordToken

/** 所有模板字符串 Token 的联合类型 */
export type SlimeTemplateToken =
    | SlimeNoSubstitutionTemplateToken
    | SlimeTemplateHeadToken
    | SlimeTemplateMiddleToken
    | SlimeTemplateTailToken

/** 所有字面量 Token 的联合类型 */
export type SlimeLiteralToken =
    | SlimeIdentifierToken
    | SlimeIdentifierNameToken
    | SlimePrivateIdentifierToken
    | SlimeNumericLiteralToken
    | SlimeStringLiteralToken
    | SlimeRegularExpressionLiteralToken

/** 所有 Token 的联合类型 */
export type SlimeAnyToken =
    | SlimePunctuatorToken
    | SlimeComparisonOperatorToken
    | SlimeArithmeticOperatorToken
    | SlimeAssignmentOperatorToken
    | SlimeKeywordToken
    | SlimeTemplateToken
    | SlimeLiteralToken

