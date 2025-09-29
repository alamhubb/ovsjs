import {Es5TokensName, es5TokensObj} from "./Es5Tokens.ts";
import SubhutiTokenConsumer from "subhuti/src/parser/SubhutiTokenConsumer.ts";

//想让他单例，那他就不能有属性。不能有状态。，有状态对象做不了多例
export default class Es5TokenConsumer extends SubhutiTokenConsumer {
    ThisTok() {
        return this.consume(es5TokensObj.ThisTok);
    }

    Identifier() {
        return this.consume(es5TokensObj.Identifier);
    }

    NullLiteral() {
        return this.consume(es5TokensObj.NullLiteral);
    }

    BooleanLiteral() {
        this.or([
            {alt: () => this.TrueTok()},
            {alt: () => this.FalseTok()}
        ])
    }

    TrueTok() {
        return this.consume(es5TokensObj.TrueTok);
    }

    FalseTok() {
        return this.consume(es5TokensObj.FalseTok);
    }

    NumericLiteral() {
        return this.consume(es5TokensObj.NumericLiteral);
    }

    StringLiteral() {
        return this.consume(es5TokensObj.StringLiteral);
    }

    RegularExpressionLiteral() {
        return this.consume(es5TokensObj.RegularExpressionLiteral);
    }

    LParen() {
        return this.consume(es5TokensObj.LParen);
    }

    RParen() {
        return this.consume(es5TokensObj.RParen);
    }

    LBracket() {
        return this.consume(es5TokensObj.LBracket);
    }

    RBracket() {
        return this.consume(es5TokensObj.RBracket);
    }

    Comma() {
        return this.consume(es5TokensObj.Comma);
    }

    LBrace() {
        return this.consume(es5TokensObj.LBrace);
    }

    RBrace() {
        return this.consume(es5TokensObj.RBrace);
    }

    Colon() {
        return this.consume(es5TokensObj.Colon);
    }

    GetTok() {
        return this.consume(es5TokensObj.GetTok);
    }

    SetTok() {
        return this.consume(es5TokensObj.SetTok);
    }

    NewTok() {
        return this.consume(es5TokensObj.NewTok);
    }

    Dot() {
        return this.consume(es5TokensObj.Dot);
    }

    PlusPlus() {
        return this.consume(es5TokensObj.PlusPlus);
    }

    MinusMinus() {
        return this.consume(es5TokensObj.MinusMinus);
    }

    DeleteTok() {
        return this.consume(es5TokensObj.DeleteTok);
    }

    VoidTok() {
        return this.consume(es5TokensObj.VoidTok);
    }

    TypeofTok() {
        return this.consume(es5TokensObj.TypeofTok);
    }

    Plus() {
        return this.consume(es5TokensObj.Plus);
    }

    Minus() {
        return this.consume(es5TokensObj.Minus);
    }

    Tilde() {
        return this.consume(es5TokensObj.Tilde);
    }

    Exclamation() {
        return this.consume(es5TokensObj.Exclamation);
    }

    VerticalBarVerticalBar() {
        return this.consume(es5TokensObj.VerticalBarVerticalBar);
    }

    AmpersandAmpersand() {
        return this.consume(es5TokensObj.AmpersandAmpersand);
    }

    VerticalBar() {
        return this.consume(es5TokensObj.VerticalBar);
    }

    Circumflex() {
        return this.consume(es5TokensObj.Circumflex);
    }

    Ampersand() {
        return this.consume(es5TokensObj.Ampersand);
    }

    InstanceOfTok() {
        return this.consume(es5TokensObj.InstanceOfTok);
    }

    InTok() {
        return this.consume(es5TokensObj.InTok);
    }

    Eq() {
        return this.consume(es5TokensObj.Eq);
    }

    AsteriskEq() {
        return this.consume(es5TokensObj.AsteriskEq);
    }

    SlashEq() {
        return this.consume(es5TokensObj.SlashEq);
    }

    PercentEq() {
        return this.consume(es5TokensObj.PercentEq);
    }

    MinusEq() {
        return this.consume(es5TokensObj.MinusEq);
    }

    PlusEq() {
        return this.consume(es5TokensObj.PlusEq);
    }


    LessLessEq() {
        return this.consume(es5TokensObj.LessLessEq);
    }

    MoreMoreEq() {
        return this.consume(es5TokensObj.MoreMoreEq);
    }

    MoreMoreMoreEq() {
        return this.consume(es5TokensObj.MoreMoreMoreEq);
    }

    AmpersandEq() {
        return this.consume(es5TokensObj.AmpersandEq);
    }

    CircumflexEq() {
        return this.consume(es5TokensObj.CircumflexEq);
    }

    VerticalBarEq() {
        return this.consume(es5TokensObj.VerticalBarEq);
    }

    EqEq() {
        return this.consume(es5TokensObj.EqEq);
    }

    NotEq() {
        return this.consume(es5TokensObj.NotEq);
    }

    EqEqEq() {
        return this.consume(es5TokensObj.EqEqEq);
    }

    NotEqEq() {
        return this.consume(es5TokensObj.NotEqEq);
    }

    Less() {
        return this.consume(es5TokensObj.Less);
    }

    More() {
        return this.consume(es5TokensObj.More);
    }

    LessEq() {
        return this.consume(es5TokensObj.LessEq);
    }

    MoreEq() {
        return this.consume(es5TokensObj.MoreEq);
    }

    LessLess() {
        return this.consume(es5TokensObj.LessLess);
    }

    MoreMore() {
        return this.consume(es5TokensObj.MoreMore);
    }

    MoreMoreMore() {
        return this.consume(es5TokensObj.MoreMoreMore);
    }

    Asterisk() {
        return this.consume(es5TokensObj.Asterisk);
    }

    Slash() {
        return this.consume(es5TokensObj.Slash);
    }

    Percent() {
        return this.consume(es5TokensObj.Percent);
    }

    Question() {
        return this.consume(es5TokensObj.Question);
    }

    Semicolon() {
        return this.consume(es5TokensObj.Semicolon);
    }

    VarTok() {
        return this.consume(es5TokensObj.VarTok);
    }

    IfTok() {
        return this.consume(es5TokensObj.IfTok);
    }

    ElseTok() {
        return this.consume(es5TokensObj.ElseTok);
    }

    DoTok() {
        return this.consume(es5TokensObj.DoTok);
    }

    WhileTok() {
        return this.consume(es5TokensObj.WhileTok);
    }

    ForTok() {
        return this.consume(es5TokensObj.ForTok);
    }

    ContinueTok() {
        return this.consume(es5TokensObj.ContinueTok);
    }

    BreakTok() {
        return this.consume(es5TokensObj.BreakTok);
    }

    ReturnTok() {
        return this.consume(es5TokensObj.ReturnTok);
    }

    WithTok() {
        return this.consume(es5TokensObj.WithTok);
    }

    SwitchTok() {
        return this.consume(es5TokensObj.SwitchTok);
    }

    CaseTok() {
        return this.consume(es5TokensObj.CaseTok);
    }

    DefaultTok() {
        return this.consume(es5TokensObj.DefaultTok);
    }

    ThrowTok() {
        return this.consume(es5TokensObj.ThrowTok);
    }

    TryTok() {
        return this.consume(es5TokensObj.TryTok);
    }

    CatchTok() {
        return this.consume(es5TokensObj.CatchTok);
    }

    FinallyTok() {
        return this.consume(es5TokensObj.FinallyTok);
    }

    DebuggerTok() {
        return this.consume(es5TokensObj.DebuggerTok);
    }

    FunctionTok() {
        return this.consume(es5TokensObj.FunctionTok);
    }
}
