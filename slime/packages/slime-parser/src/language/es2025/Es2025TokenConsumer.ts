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

import {
    SlimeBinaryOperatorTokenTypes,
    SlimeContextualKeywordTokenTypes,
    SlimeReservedWordTokenTypes, SlimeUnaryOperatorTokenTypes,
    TokenNames
} from "slime-token/src/SlimeTokensName"
import SubhutiTokenConsumer from "subhuti/src/SubhutiTokenConsumer.ts"

export default class Es2025TokenConsumer extends SubhutiTokenConsumer {

    // ============================================
    // 软关键字消费辅助方法
    // ============================================

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
    protected consumeIdentifierValue(value: string) {
        const token = this.parser.curToken
        if (token?.tokenName === TokenNames.IdentifierName && token.tokenValue === value) {
            return this.consume(TokenNames.IdentifierName)
        }
        // 标记解析失败
        this.parser._markParseFail()
        return undefined
    }

    // ============================================
    // 关键字 (Keywords)
    // ============================================

    Await() {
        return this.consume(SlimeReservedWordTokenTypes.Await)
    }

    Break() {
        return this.consume(SlimeReservedWordTokenTypes.Break)
    }

    Case() {
        return this.consume(SlimeReservedWordTokenTypes.Case)
    }

    Catch() {
        return this.consume(SlimeReservedWordTokenTypes.Catch)
    }

    Class() {
        return this.consume(SlimeReservedWordTokenTypes.Class)
    }

    Const() {
        return this.consume(SlimeReservedWordTokenTypes.Const)
    }

    Continue() {
        return this.consume(SlimeReservedWordTokenTypes.Continue)
    }

    Debugger() {
        return this.consume(SlimeReservedWordTokenTypes.Debugger)
    }

    Default() {
        return this.consume(SlimeReservedWordTokenTypes.Default)
    }

    Do() {
        return this.consume(SlimeReservedWordTokenTypes.Do)
    }

    Else() {
        return this.consume(SlimeReservedWordTokenTypes.Else)
    }

    Enum() {
        return this.consume(SlimeReservedWordTokenTypes.Enum)
    }

    Export() {
        return this.consume(SlimeReservedWordTokenTypes.Export)
    }

    Extends() {
        return this.consume(SlimeReservedWordTokenTypes.Extends)
    }

    False() {
        return this.consume(SlimeReservedWordTokenTypes.False)
    }

    Finally() {
        return this.consume(SlimeReservedWordTokenTypes.Finally)
    }

    For() {
        return this.consume(SlimeReservedWordTokenTypes.For)
    }

    Function() {
        return this.consume(SlimeReservedWordTokenTypes.Function)
    }

    If() {
        return this.consume(SlimeReservedWordTokenTypes.If)
    }

    Import() {
        return this.consume(SlimeReservedWordTokenTypes.Import)
    }

    New() {
        return this.consume(SlimeReservedWordTokenTypes.New)
    }

    /**
     * NullLiteral
     * 规范 A.1: NullLiteral :: null
     */
    NullLiteral() {
        return this.consume(SlimeReservedWordTokenTypes.NullLiteral)
    }

    Return() {
        return this.consume(SlimeReservedWordTokenTypes.Return)
    }

    Super() {
        return this.consume(SlimeReservedWordTokenTypes.Super)
    }

    Switch() {
        return this.consume(SlimeReservedWordTokenTypes.Switch)
    }

    This() {
        return this.consume(SlimeReservedWordTokenTypes.This)
    }

    Throw() {
        return this.consume(SlimeReservedWordTokenTypes.Throw)
    }

    True() {
        return this.consume(SlimeReservedWordTokenTypes.True)
    }

    Try() {
        return this.consume(SlimeReservedWordTokenTypes.Try)
    }


    Var() {
        return this.consume(SlimeReservedWordTokenTypes.Var)
    }
    While() {
        return this.consume(SlimeReservedWordTokenTypes.While)
    }

    With() {
        return this.consume(SlimeReservedWordTokenTypes.With)
    }

    Yield() {
        return this.consume(SlimeReservedWordTokenTypes.Yield)
    }

    /**
     * 消费 'let' 关键字
     * 用于 let 声明
     * 注意：在严格模式下是保留字，非严格模式下可作为标识符（为向后兼容）
     * 但我们将其作为独立 token 处理，与 const/var 保持一致
     */
    Let() {
        return this.consume(SlimeReservedWordTokenTypes.Let)
    }

    Void() {
        return this.consume(SlimeUnaryOperatorTokenTypes.Void)
    }

    Typeof() {
        return this.consume(SlimeUnaryOperatorTokenTypes.Typeof)
    }

    In() {
        return this.consume(SlimeBinaryOperatorTokenTypes.In)
    }

    Instanceof() {
        return this.consume(SlimeBinaryOperatorTokenTypes.Instanceof)
    }
    Delete() {
        return this.consume(SlimeUnaryOperatorTokenTypes.Delete)
    }

    // ============================================
    // 软关键字 (Soft Keywords / Contextual Keywords)
    // 按照 ES2025 规范，这些在词法层是 IdentifierName
    // 在语法层通过值检查来识别
    // ============================================

    /**
     * 消费 'async' 软关键字
     * 用于 async 函数、async 箭头函数、async 方法
     * 注意：async 可作为标识符使用，如 `let async = 1`
     */
    Async() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Async)
    }

    /**
     * 消费 'static' 软关键字
     * 用于类的静态成员
     * 注意：非严格模式下可作为标识符
     */
    Static() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Static)
    }

    /**
     * 消费 'as' 软关键字
     * 用于 import/export 的重命名
     */
    As() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.As)
    }

    /**
     * 消费 'get' 软关键字
     * 用于 getter 方法定义
     */
    Get() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Get)
    }

    /**
     * 消费 'set' 软关键字
     * 用于 setter 方法定义
     */
    Set() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Set)
    }

    /**
     * 消费 'of' 软关键字
     * 用于 for-of 语句
     */
    Of() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Of)
    }

    /**
     * 消费 'target' 软关键字
     * 用于 new.target
     */
    Target() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Target)
    }

    /**
     * 消费 'meta' 软关键字
     * 用于 import.meta
     */
    Meta() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.Meta)
    }

    /**
     * 消费 'from' 软关键字
     * 用于 import/export 语句
     */
    From() {
        return this.consumeIdentifierValue(SlimeContextualKeywordTokenTypes.From)
    }

    // ============================================
    // 字面量 (Literals)
    // ============================================

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
        return this.consume(TokenNames.NumericLiteral)
    }

    StringLiteral() {
        return this.consume(TokenNames.StringLiteral)
    }

    NoSubstitutionTemplate() {
        return this.consume(TokenNames.NoSubstitutionTemplate)
    }

    TemplateHead() {
        return this.consume(TokenNames.TemplateHead)
    }

    TemplateMiddle() {
        return this.consume(TokenNames.TemplateMiddle)
    }

    TemplateTail() {
        return this.consume(TokenNames.TemplateTail)
    }

    RegularExpressionLiteral() {
        return this.consume(TokenNames.RegularExpressionLiteral)
    }

    // ============================================
    // 注释 (Comments)
    // ============================================

    /**
     * Hashbang 注释 (#!...)
     * 只能出现在文件开头，由 Parser 的 Program 规则显式调用
     */
    HashbangComment() {
        return this.consume(TokenNames.HashbangComment)
    }

    // ============================================
    // 标识符 (Identifiers)
    // ============================================

    /**
     * IdentifierName
     * 规范: IdentifierName :: IdentifierStart | IdentifierName IdentifierPart
     */
    IdentifierName() {
        return this.consume(TokenNames.IdentifierName)
    }

    /**
     * PrivateIdentifier
     * 规范: PrivateIdentifier :: # IdentifierName
     */
    PrivateIdentifier() {
        return this.consume(TokenNames.PrivateIdentifier)
    }
    
    // ============================================
    // 运算符 - 4字符 (4-character Operators)
    // ============================================

    UnsignedRightShiftAssign() {
        return this.consume(TokenNames.UnsignedRightShiftAssign)
    }

    // ============================================
    // 运算符 - 3字符 (3-character Operators)
    // ============================================

    Ellipsis() {
        return this.consume(TokenNames.Ellipsis)
    }

    UnsignedRightShift() {
        return this.consume(TokenNames.UnsignedRightShift)
    }

    StrictEqual() {
        return this.consume(TokenNames.StrictEqual)
    }

    StrictNotEqual() {
        return this.consume(TokenNames.StrictNotEqual)
    }

    LeftShiftAssign() {
        return this.consume(TokenNames.LeftShiftAssign)
    }

    RightShiftAssign() {
        return this.consume(TokenNames.RightShiftAssign)
    }

    ExponentiationAssign() {
        return this.consume(TokenNames.ExponentiationAssign)
    }

    LogicalAndAssign() {
        return this.consume(TokenNames.LogicalAndAssign)
    }

    LogicalOrAssign() {
        return this.consume(TokenNames.LogicalOrAssign)
    }

    NullishCoalescingAssign() {
        return this.consume(TokenNames.NullishCoalescingAssign)
    }

    // ============================================
    // 运算符 - 2字符 (2-character Operators)
    // ============================================

    Arrow() {
        return this.consume(TokenNames.Arrow)
    }

    PlusAssign() {
        return this.consume(TokenNames.PlusAssign)
    }

    MinusAssign() {
        return this.consume(TokenNames.MinusAssign)
    }

    MultiplyAssign() {
        return this.consume(TokenNames.MultiplyAssign)
    }

    DivideAssign() {
        return this.consume(TokenNames.DivideAssign)
    }

    ModuloAssign() {
        return this.consume(TokenNames.ModuloAssign)
    }

    LeftShift() {
        return this.consume(TokenNames.LeftShift)
    }

    RightShift() {
        return this.consume(TokenNames.RightShift)
    }

    LessEqual() {
        return this.consume(TokenNames.LessEqual)
    }

    GreaterEqual() {
        return this.consume(TokenNames.GreaterEqual)
    }

    Equal() {
        return this.consume(TokenNames.Equal)
    }

    NotEqual() {
        return this.consume(TokenNames.NotEqual)
    }

    LogicalAnd() {
        return this.consume(TokenNames.LogicalAnd)
    }

    LogicalOr() {
        return this.consume(TokenNames.LogicalOr)
    }

    NullishCoalescing() {
        return this.consume(TokenNames.NullishCoalescing)
    }

    Increment() {
        return this.consume(TokenNames.Increment)
    }

    Decrement() {
        return this.consume(TokenNames.Decrement)
    }

    Exponentiation() {
        return this.consume(TokenNames.Exponentiation)
    }

    BitwiseAndAssign() {
        return this.consume(TokenNames.BitwiseAndAssign)
    }

    BitwiseOrAssign() {
        return this.consume(TokenNames.BitwiseOrAssign)
    }

    BitwiseXorAssign() {
        return this.consume(TokenNames.BitwiseXorAssign)
    }

    OptionalChaining() {
        return this.consume(TokenNames.OptionalChaining)
    }
    
    // ============================================
    // 运算符 - 1字符 (1-character Operators)
    // ============================================

    LBrace() {
        return this.consume(TokenNames.LBrace)
    }

    RBrace() {
        return this.consume(TokenNames.RBrace)
    }

    LParen() {
        return this.consume(TokenNames.LParen)
    }

    RParen() {
        return this.consume(TokenNames.RParen)
    }

    LBracket() {
        return this.consume(TokenNames.LBracket)
    }

    RBracket() {
        return this.consume(TokenNames.RBracket)
    }

    Dot() {
        return this.consume(TokenNames.Dot)
    }

    Semicolon() {
        return this.consume(TokenNames.Semicolon)
    }

    Comma() {
        return this.consume(TokenNames.Comma)
    }

    Less() {
        return this.consume(TokenNames.Less)
    }

    Greater() {
        return this.consume(TokenNames.Greater)
    }

    Plus() {
        return this.consume(TokenNames.Plus)
    }

    Minus() {
        return this.consume(TokenNames.Minus)
    }

    Asterisk() {
        return this.consume(TokenNames.Asterisk)
    }

    Slash() {
        return this.consume(TokenNames.Slash)
    }

    Modulo() {
        return this.consume(TokenNames.Modulo)
    }

    BitwiseAnd() {
        return this.consume(TokenNames.BitwiseAnd)
    }

    BitwiseOr() {
        return this.consume(TokenNames.BitwiseOr)
    }

    BitwiseXor() {
        return this.consume(TokenNames.BitwiseXor)
    }

    BitwiseNot() {
        return this.consume(TokenNames.BitwiseNot)
    }

    LogicalNot() {
        return this.consume(TokenNames.LogicalNot)
    }

    Question() {
        return this.consume(TokenNames.Question)
    }

    Colon() {
        return this.consume(TokenNames.Colon)
    }

    Assign() {
        return this.consume(TokenNames.Assign)
    }
}

