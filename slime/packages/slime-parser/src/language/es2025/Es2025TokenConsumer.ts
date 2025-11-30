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

import SubhutiTokenConsumer from "subhuti/src/SubhutiTokenConsumer.ts"
import { TokenNames, ContextualKeywords } from "./Es2025Tokens.ts"

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

    AwaitTok() {
        return this.consume(TokenNames.AwaitTok)
    }

    BreakTok() {
        return this.consume(TokenNames.BreakTok)
    }

    CaseTok() {
        return this.consume(TokenNames.CaseTok)
    }

    CatchTok() {
        return this.consume(TokenNames.CatchTok)
    }

    ClassTok() {
        return this.consume(TokenNames.ClassTok)
    }

    ConstTok() {
        return this.consume(TokenNames.ConstTok)
    }

    ContinueTok() {
        return this.consume(TokenNames.ContinueTok)
    }

    DebuggerTok() {
        return this.consume(TokenNames.DebuggerTok)
    }

    DefaultTok() {
        return this.consume(TokenNames.DefaultTok)
    }

    DeleteTok() {
        return this.consume(TokenNames.DeleteTok)
    }

    DoTok() {
        return this.consume(TokenNames.DoTok)
    }

    ElseTok() {
        return this.consume(TokenNames.ElseTok)
    }

    EnumTok() {
        return this.consume(TokenNames.EnumTok)
    }

    ExportTok() {
        return this.consume(TokenNames.ExportTok)
    }

    ExtendsTok() {
        return this.consume(TokenNames.ExtendsTok)
    }

    FalseTok() {
        return this.consume(TokenNames.FalseTok)
    }

    FinallyTok() {
        return this.consume(TokenNames.FinallyTok)
    }

    ForTok() {
        return this.consume(TokenNames.ForTok)
    }

    FunctionTok() {
        return this.consume(TokenNames.FunctionTok)
    }

    IfTok() {
        return this.consume(TokenNames.IfTok)
    }

    ImportTok() {
        return this.consume(TokenNames.ImportTok)
    }

    InTok() {
        return this.consume(TokenNames.InTok)
    }

    InstanceofTok() {
        return this.consume(TokenNames.InstanceofTok)
    }

    NewTok() {
        return this.consume(TokenNames.NewTok)
    }

    NullTok() {
        return this.consume(TokenNames.NullTok)
    }

    ReturnTok() {
        return this.consume(TokenNames.ReturnTok)
    }

    SuperTok() {
        return this.consume(TokenNames.SuperTok)
    }

    SwitchTok() {
        return this.consume(TokenNames.SwitchTok)
    }

    ThisTok() {
        return this.consume(TokenNames.ThisTok)
    }

    ThrowTok() {
        return this.consume(TokenNames.ThrowTok)
    }

    TrueTok() {
        return this.consume(TokenNames.TrueTok)
    }

    TryTok() {
        return this.consume(TokenNames.TryTok)
    }

    TypeofTok() {
        return this.consume(TokenNames.TypeofTok)
    }

    VarTok() {
        return this.consume(TokenNames.VarTok)
    }

    VoidTok() {
        return this.consume(TokenNames.VoidTok)
    }

    WhileTok() {
        return this.consume(TokenNames.WhileTok)
    }

    WithTok() {
        return this.consume(TokenNames.WithTok)
    }

    YieldTok() {
        return this.consume(TokenNames.YieldTok)
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
    AsyncTok() {
        return this.consumeIdentifierValue(ContextualKeywords.ASYNC)
    }

    /**
     * 消费 'let' 关键字
     * 用于 let 声明
     * 注意：在严格模式下是保留字，非严格模式下可作为标识符（为向后兼容）
     * 但我们将其作为独立 token 处理，与 const/var 保持一致
     */
    LetTok() {
        return this.consume(TokenNames.LetTok)
    }

    /**
     * 消费 'static' 软关键字
     * 用于类的静态成员
     * 注意：非严格模式下可作为标识符
     */
    StaticTok() {
        return this.consumeIdentifierValue(ContextualKeywords.STATIC)
    }

    /**
     * 消费 'as' 软关键字
     * 用于 import/export 的重命名
     */
    AsTok() {
        return this.consumeIdentifierValue(ContextualKeywords.AS)
    }

    /**
     * 消费 'get' 软关键字
     * 用于 getter 方法定义
     */
    GetTok() {
        return this.consumeIdentifierValue(ContextualKeywords.GET)
    }

    /**
     * 消费 'set' 软关键字
     * 用于 setter 方法定义
     */
    SetTok() {
        return this.consumeIdentifierValue(ContextualKeywords.SET)
    }

    /**
     * 消费 'of' 软关键字
     * 用于 for-of 语句
     */
    OfTok() {
        return this.consumeIdentifierValue(ContextualKeywords.OF)
    }

    /**
     * 消费 'target' 软关键字
     * 用于 new.target
     */
    TargetTok() {
        return this.consumeIdentifierValue(ContextualKeywords.TARGET)
    }

    /**
     * 消费 'meta' 软关键字
     * 用于 import.meta
     */
    MetaTok() {
        return this.consumeIdentifierValue(ContextualKeywords.META)
    }

    /**
     * 消费 'from' 软关键字
     * 用于 import/export 语句
     */
    FromTok() {
        return this.consumeIdentifierValue(ContextualKeywords.FROM)
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

    RegularExpression() {
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

    SignedRightShiftAssign() {
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

    SignedRightShift() {
        return this.consume(TokenNames.RightShift)
    }

    LessThanOrEqual() {
        return this.consume(TokenNames.LessEqual)
    }

    GreaterThanOrEqual() {
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

    LessThan() {
        return this.consume(TokenNames.Less)
    }

    GreaterThan() {
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

    Hash() {
        // Hash 用于私有标识符的 # 符号，但词法上已经合并到 PrivateIdentifier 中
        // 这里保留方法以防 Parser 中有单独使用的场景
        return this.consume(TokenNames.PrivateIdentifier)
    }
}

