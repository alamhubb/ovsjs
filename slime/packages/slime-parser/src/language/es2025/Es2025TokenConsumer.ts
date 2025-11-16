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
import { es2025TokensObj } from "./Es2025Tokens.ts"

export default class Es2025TokenConsumer extends SubhutiTokenConsumer {
    // ============================================
    // 关键字 (Keywords)
    // ============================================
    
    AwaitTok() {
        return this.consume(es2025TokensObj.AwaitTok)
    }
    
    BreakTok() {
        return this.consume(es2025TokensObj.BreakTok)
    }
    
    CaseTok() {
        return this.consume(es2025TokensObj.CaseTok)
    }
    
    CatchTok() {
        return this.consume(es2025TokensObj.CatchTok)
    }
    
    ClassTok() {
        return this.consume(es2025TokensObj.ClassTok)
    }
    
    ConstTok() {
        return this.consume(es2025TokensObj.ConstTok)
    }
    
    ContinueTok() {
        return this.consume(es2025TokensObj.ContinueTok)
    }
    
    DebuggerTok() {
        return this.consume(es2025TokensObj.DebuggerTok)
    }
    
    DefaultTok() {
        return this.consume(es2025TokensObj.DefaultTok)
    }
    
    DeleteTok() {
        return this.consume(es2025TokensObj.DeleteTok)
    }
    
    DoTok() {
        return this.consume(es2025TokensObj.DoTok)
    }
    
    ElseTok() {
        return this.consume(es2025TokensObj.ElseTok)
    }
    
    EnumTok() {
        return this.consume(es2025TokensObj.EnumTok)
    }
    
    ExportTok() {
        return this.consume(es2025TokensObj.ExportTok)
    }
    
    ExtendsTok() {
        return this.consume(es2025TokensObj.ExtendsTok)
    }
    
    FalseTok() {
        return this.consume(es2025TokensObj.FalseTok)
    }
    
    FinallyTok() {
        return this.consume(es2025TokensObj.FinallyTok)
    }
    
    ForTok() {
        return this.consume(es2025TokensObj.ForTok)
    }
    
    FunctionTok() {
        return this.consume(es2025TokensObj.FunctionTok)
    }
    
    IfTok() {
        return this.consume(es2025TokensObj.IfTok)
    }
    
    ImportTok() {
        return this.consume(es2025TokensObj.ImportTok)
    }
    
    InTok() {
        return this.consume(es2025TokensObj.InTok)
    }
    
    InstanceofTok() {
        return this.consume(es2025TokensObj.InstanceofTok)
    }
    
    NewTok() {
        return this.consume(es2025TokensObj.NewTok)
    }
    
    NullTok() {
        return this.consume(es2025TokensObj.NullTok)
    }
    
    ReturnTok() {
        return this.consume(es2025TokensObj.ReturnTok)
    }
    
    SuperTok() {
        return this.consume(es2025TokensObj.SuperTok)
    }
    
    SwitchTok() {
        return this.consume(es2025TokensObj.SwitchTok)
    }
    
    ThisTok() {
        return this.consume(es2025TokensObj.ThisTok)
    }
    
    ThrowTok() {
        return this.consume(es2025TokensObj.ThrowTok)
    }
    
    TrueTok() {
        return this.consume(es2025TokensObj.TrueTok)
    }
    
    TryTok() {
        return this.consume(es2025TokensObj.TryTok)
    }
    
    TypeofTok() {
        return this.consume(es2025TokensObj.TypeofTok)
    }
    
    VarTok() {
        return this.consume(es2025TokensObj.VarTok)
    }
    
    VoidTok() {
        return this.consume(es2025TokensObj.VoidTok)
    }
    
    WhileTok() {
        return this.consume(es2025TokensObj.WhileTok)
    }
    
    WithTok() {
        return this.consume(es2025TokensObj.WithTok)
    }
    
    YieldTok() {
        return this.consume(es2025TokensObj.YieldTok)
    }
    
    // ============================================
    // 上下文关键字 (Contextual Keywords)
    // ============================================
    
    AsyncTok() {
        return this.consume(es2025TokensObj.AsyncTok)
    }
    
    LetTok() {
        return this.consume(es2025TokensObj.LetTok)
    }
    
    StaticTok() {
        return this.consume(es2025TokensObj.StaticTok)
    }
    
    GetTok() {
        return this.consume(es2025TokensObj.GetTok)
    }
    
    SetTok() {
        return this.consume(es2025TokensObj.SetTok)
    }
    
    OfTok() {
        return this.consume(es2025TokensObj.OfTok)
    }
    
    TargetTok() {
        return this.consume(es2025TokensObj.TargetTok)
    }
    
    MetaTok() {
        return this.consume(es2025TokensObj.MetaTok)
    }
    
    AsTok() {
        return this.consume(es2025TokensObj.AsTok)
    }
    
    FromTok() {
        return this.consume(es2025TokensObj.FromTok)
    }
    
    // ============================================
    // 字面量 (Literals)
    // ============================================
    
    Number() {
        return this.consume(es2025TokensObj.NumericLiteral)
    }
    
    BigInt() {
        return this.consume(es2025TokensObj.BigIntDecimal)
    }
    
    String() {
        return this.consume(es2025TokensObj.StringDoubleQuote)
    }
    
    NoSubstitutionTemplate() {
        return this.consume(es2025TokensObj.NoSubstitutionTemplate)
    }
    
    TemplateHead() {
        return this.consume(es2025TokensObj.TemplateHead)
    }
    
    TemplateMiddle() {
        return this.consume(es2025TokensObj.TemplateMiddle)
    }
    
    TemplateTail() {
        return this.consume(es2025TokensObj.TemplateTail)
    }
    
    RegularExpression() {
        return this.consume(es2025TokensObj.RegularExpressionLiteral)
    }
    
    // ============================================
    // 标识符 (Identifiers)
    // ============================================
    
    IdentifierName() {
        return this.consume(es2025TokensObj.IdentifierName)
    }
    
    PrivateIdentifier() {
        return this.consume(es2025TokensObj.PrivateIdentifier)
    }
    
    // ============================================
    // 运算符 - 4字符 (4-character Operators)
    // ============================================
    
    UnsignedRightShiftAssign() {
        return this.consume(es2025TokensObj.UnsignedRightShiftAssign)
    }
    
    // ============================================
    // 运算符 - 3字符 (3-character Operators)
    // ============================================
    
    Ellipsis() {
        return this.consume(es2025TokensObj.Ellipsis)
    }
    
    UnsignedRightShift() {
        return this.consume(es2025TokensObj.UnsignedRightShift)
    }
    
    StrictEqual() {
        return this.consume(es2025TokensObj.StrictEqual)
    }
    
    StrictNotEqual() {
        return this.consume(es2025TokensObj.StrictNotEqual)
    }
    
    LeftShiftAssign() {
        return this.consume(es2025TokensObj.LeftShiftAssign)
    }
    
    SignedRightShiftAssign() {
        return this.consume(es2025TokensObj.RightShiftAssign)
    }
    
    ExponentiationAssign() {
        return this.consume(es2025TokensObj.ExponentiationAssign)
    }
    
    LogicalAndAssign() {
        return this.consume(es2025TokensObj.LogicalAndAssign)
    }
    
    LogicalOrAssign() {
        return this.consume(es2025TokensObj.LogicalOrAssign)
    }
    
    NullishCoalescingAssign() {
        return this.consume(es2025TokensObj.NullishCoalescingAssign)
    }
    
    // ============================================
    // 运算符 - 2字符 (2-character Operators)
    // ============================================
    
    Arrow() {
        return this.consume(es2025TokensObj.Arrow)
    }
    
    PlusAssign() {
        return this.consume(es2025TokensObj.PlusAssign)
    }
    
    MinusAssign() {
        return this.consume(es2025TokensObj.MinusAssign)
    }
    
    MultiplyAssign() {
        return this.consume(es2025TokensObj.MultiplyAssign)
    }
    
    DivideAssign() {
        return this.consume(es2025TokensObj.DivideAssign)
    }
    
    ModuloAssign() {
        return this.consume(es2025TokensObj.ModuloAssign)
    }
    
    LeftShift() {
        return this.consume(es2025TokensObj.LeftShift)
    }
    
    SignedRightShift() {
        return this.consume(es2025TokensObj.RightShift)
    }
    
    LessThanOrEqual() {
        return this.consume(es2025TokensObj.LessEqual)
    }
    
    GreaterThanOrEqual() {
        return this.consume(es2025TokensObj.GreaterEqual)
    }
    
    Equal() {
        return this.consume(es2025TokensObj.Equal)
    }
    
    NotEqual() {
        return this.consume(es2025TokensObj.NotEqual)
    }
    
    LogicalAnd() {
        return this.consume(es2025TokensObj.LogicalAnd)
    }
    
    LogicalOr() {
        return this.consume(es2025TokensObj.LogicalOr)
    }
    
    NullishCoalescing() {
        return this.consume(es2025TokensObj.NullishCoalescing)
    }
    
    Increment() {
        return this.consume(es2025TokensObj.Increment)
    }
    
    Decrement() {
        return this.consume(es2025TokensObj.Decrement)
    }
    
    Exponentiation() {
        return this.consume(es2025TokensObj.Exponentiation)
    }
    
    BitwiseAndAssign() {
        return this.consume(es2025TokensObj.BitwiseAndAssign)
    }
    
    BitwiseOrAssign() {
        return this.consume(es2025TokensObj.BitwiseOrAssign)
    }
    
    BitwiseXorAssign() {
        return this.consume(es2025TokensObj.BitwiseXorAssign)
    }
    
    OptionalChaining() {
        return this.consume(es2025TokensObj.OptionalChaining)
    }
    
    // ============================================
    // 运算符 - 1字符 (1-character Operators)
    // ============================================
    
    LBrace() {
        return this.consume(es2025TokensObj.LBrace)
    }
    
    RBrace() {
        return this.consume(es2025TokensObj.RBrace)
    }
    
    LParen() {
        return this.consume(es2025TokensObj.LParen)
    }
    
    RParen() {
        return this.consume(es2025TokensObj.RParen)
    }
    
    LBracket() {
        return this.consume(es2025TokensObj.LBracket)
    }
    
    RBracket() {
        return this.consume(es2025TokensObj.RBracket)
    }
    
    Dot() {
        return this.consume(es2025TokensObj.Dot)
    }
    
    Semicolon() {
        return this.consume(es2025TokensObj.Semicolon)
    }
    
    Comma() {
        return this.consume(es2025TokensObj.Comma)
    }
    
    LessThan() {
        return this.consume(es2025TokensObj.Less)
    }
    
    GreaterThan() {
        return this.consume(es2025TokensObj.Greater)
    }
    
    Plus() {
        return this.consume(es2025TokensObj.Plus)
    }
    
    Minus() {
        return this.consume(es2025TokensObj.Minus)
    }
    
    Asterisk() {
        return this.consume(es2025TokensObj.Asterisk)
    }
    
    Slash() {
        return this.consume(es2025TokensObj.Slash)
    }
    
    Modulo() {
        return this.consume(es2025TokensObj.Modulo)
    }
    
    BitwiseAnd() {
        return this.consume(es2025TokensObj.BitwiseAnd)
    }
    
    BitwiseOr() {
        return this.consume(es2025TokensObj.BitwiseOr)
    }
    
    BitwiseXor() {
        return this.consume(es2025TokensObj.BitwiseXor)
    }
    
    BitwiseNot() {
        return this.consume(es2025TokensObj.BitwiseNot)
    }
    
    LogicalNot() {
        return this.consume(es2025TokensObj.LogicalNot)
    }
    
    Question() {
        return this.consume(es2025TokensObj.Question)
    }
    
    Colon() {
        return this.consume(es2025TokensObj.Colon)
    }
    
    Assign() {
        return this.consume(es2025TokensObj.Assign)
    }
    
    Hash() {
        // Hash 用于私有标识符的 # 符号，但词法上已经合并到 PrivateIdentifier 中
        // 这里保留方法以防 Parser 中有单独使用的场景
        return this.consume(es2025TokensObj.PrivateIdentifier)
    }
}

