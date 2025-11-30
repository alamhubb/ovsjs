/**
 * SlimeTokenCreate.ts - Token 节点创建工厂
 * 
 * 为每个 Token 类型提供创建方法
 */

import type { SubhutiSourceLocation } from "subhuti/src/struct/SubhutiCst.ts";
import type {
    SlimeVarToken,
    SlimeLetToken,
    SlimeConstToken,
    SlimeAssignToken,
    SlimeLParenToken,
    SlimeRParenToken,
    SlimeLBraceToken,
    SlimeRBraceToken,
    SlimeLBracketToken,
    SlimeRBracketToken,
    SlimeSemicolonToken,
    SlimeCommaToken,
    SlimeDotToken,
    SlimeArrowToken,
    SlimeQuestionToken,
    SlimeColonToken,
    SlimeFunctionToken,
    SlimeAsyncToken,
    SlimeClassToken,
    SlimeExtendsToken,
    SlimeStaticToken,
    SlimeGetToken,
    SlimeSetToken,
    SlimeIfToken,
    SlimeElseToken,
    SlimeSwitchToken,
    SlimeCaseToken,
    SlimeDefaultToken,
    SlimeForToken,
    SlimeWhileToken,
    SlimeDoToken,
    SlimeOfToken,
    SlimeBreakToken,
    SlimeContinueToken,
    SlimeReturnToken,
    SlimeThrowToken,
    SlimeTryToken,
    SlimeCatchToken,
    SlimeFinallyToken,
    SlimeWithToken,
    SlimeDebuggerToken,
    SlimeNewToken,
    SlimeYieldToken,
    SlimeAwaitToken,
    SlimeImportToken,
    SlimeExportToken,
    SlimeFromToken,
    SlimeAsToken, SlimeEllipsisToken,
} from "./SlimeESTree.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokensName.ts";

class SlimeTokenFactory {
    // ============================================
    // 变量声明关键字 Token
    // ============================================

    createVarToken(loc?: SubhutiSourceLocation): SlimeVarToken {
        return { type: SlimeTokenType.Var, value: "var", loc } as SlimeVarToken;
    }

    createLetToken(loc?: SubhutiSourceLocation): SlimeLetToken {
        return { type: SlimeTokenType.Let, value: "let", loc } as SlimeLetToken;
    }

    createConstToken(loc?: SubhutiSourceLocation): SlimeConstToken {
        return { type: SlimeTokenType.Const, value: "const", loc } as SlimeConstToken;
    }

    // ============================================
    // 赋值运算符 Token
    // ============================================

    createAssignToken(loc?: SubhutiSourceLocation): SlimeAssignToken {
        return { type: SlimeTokenType.Assign, value: "=", loc } as SlimeAssignToken;
    }

    // ============================================
    // 标点符号 Token
    // ============================================

    createLParenToken(loc?: SubhutiSourceLocation): SlimeLParenToken {
        return { type: SlimeTokenType.LParen, value: "(", loc } as SlimeLParenToken;
    }

    createRParenToken(loc?: SubhutiSourceLocation): SlimeRParenToken {
        return { type: SlimeTokenType.RParen, value: ")", loc } as SlimeRParenToken;
    }

    createLBraceToken(loc?: SubhutiSourceLocation): SlimeLBraceToken {
        return { type: SlimeTokenType.LBrace, value: "{", loc } as SlimeLBraceToken;
    }

    createRBraceToken(loc?: SubhutiSourceLocation): SlimeRBraceToken {
        return { type: SlimeTokenType.RBrace, value: "}", loc } as SlimeRBraceToken;
    }

    createLBracketToken(loc?: SubhutiSourceLocation): SlimeLBracketToken {
        return { type: SlimeTokenType.LBracket, value: "[", loc } as SlimeLBracketToken;
    }

    createRBracketToken(loc?: SubhutiSourceLocation): SlimeRBracketToken {
        return { type: SlimeTokenType.RBracket, value: "]", loc } as SlimeRBracketToken;
    }

    createSemicolonToken(loc?: SubhutiSourceLocation): SlimeSemicolonToken {
        return { type: SlimeTokenType.Semicolon, value: ";", loc } as SlimeSemicolonToken;
    }

    createCommaToken(loc?: SubhutiSourceLocation): SlimeCommaToken {
        return { type: SlimeTokenType.Comma, value: ",", loc } as SlimeCommaToken;
    }

    createDotToken(loc?: SubhutiSourceLocation): SlimeDotToken {
        return { type: SlimeTokenType.Dot, value: ".", loc } as SlimeDotToken;
    }

    createSpreadToken(loc?: SubhutiSourceLocation): SlimeEllipsisToken {
        return { type: SlimeTokenType.Ellipsis, value: "...", loc } as SlimeEllipsisToken;
    }

    createArrowToken(loc?: SubhutiSourceLocation): SlimeArrowToken {
        return { type: SlimeTokenType.Arrow, value: "=>", loc } as SlimeArrowToken;
    }

    createQuestionToken(loc?: SubhutiSourceLocation): SlimeQuestionToken {
        return { type: SlimeTokenType.Question, value: "?", loc } as SlimeQuestionToken;
    }

    createColonToken(loc?: SubhutiSourceLocation): SlimeColonToken {
        return { type: SlimeTokenType.Colon, value: ":", loc } as SlimeColonToken;
    }

    // ============================================
    // 函数/类关键字 Token
    // ============================================

    createFunctionToken(loc?: SubhutiSourceLocation): SlimeFunctionToken {
        return { type: SlimeTokenType.Function, value: "function", loc } as SlimeFunctionToken;
    }

    createAsyncToken(loc?: SubhutiSourceLocation): SlimeAsyncToken {
        return { type: SlimeTokenType.Async, value: "async", loc } as SlimeAsyncToken;
    }

    createClassToken(loc?: SubhutiSourceLocation): SlimeClassToken {
        return { type: SlimeTokenType.Class, value: "class", loc } as SlimeClassToken;
    }

    createExtendsToken(loc?: SubhutiSourceLocation): SlimeExtendsToken {
        return { type: SlimeTokenType.Extends, value: "extends", loc } as SlimeExtendsToken;
    }

    createStaticToken(loc?: SubhutiSourceLocation): SlimeStaticToken {
        return { type: SlimeTokenType.Static, value: "static", loc } as SlimeStaticToken;
    }

    createGetToken(loc?: SubhutiSourceLocation): SlimeGetToken {
        return { type: SlimeTokenType.Get, value: "get", loc } as SlimeGetToken;
    }

    createSetToken(loc?: SubhutiSourceLocation): SlimeSetToken {
        return { type: SlimeTokenType.Set, value: "set", loc } as SlimeSetToken;
    }

    // ============================================
    // 控制流关键字 Token
    // ============================================

    createIfToken(loc?: SubhutiSourceLocation): SlimeIfToken {
        return { type: SlimeTokenType.If, value: "if", loc } as SlimeIfToken;
    }

    createElseToken(loc?: SubhutiSourceLocation): SlimeElseToken {
        return { type: SlimeTokenType.Else, value: "else", loc } as SlimeElseToken;
    }

    createSwitchToken(loc?: SubhutiSourceLocation): SlimeSwitchToken {
        return { type: SlimeTokenType.Switch, value: "switch", loc } as SlimeSwitchToken;
    }

    createCaseToken(loc?: SubhutiSourceLocation): SlimeCaseToken {
        return { type: SlimeTokenType.Case, value: "case", loc } as SlimeCaseToken;
    }

    createDefaultToken(loc?: SubhutiSourceLocation): SlimeDefaultToken {
        return { type: SlimeTokenType.Default, value: "default", loc } as SlimeDefaultToken;
    }

    createForToken(loc?: SubhutiSourceLocation): SlimeForToken {
        return { type: SlimeTokenType.For, value: "for", loc } as SlimeForToken;
    }

    createWhileToken(loc?: SubhutiSourceLocation): SlimeWhileToken {
        return { type: SlimeTokenType.While, value: "while", loc } as SlimeWhileToken;
    }

    createDoToken(loc?: SubhutiSourceLocation): SlimeDoToken {
        return { type: SlimeTokenType.Do, value: "do", loc } as SlimeDoToken;
    }

    createOfToken(loc?: SubhutiSourceLocation): SlimeOfToken {
        return { type: SlimeTokenType.Of, value: "of", loc } as SlimeOfToken;
    }

    createBreakToken(loc?: SubhutiSourceLocation): SlimeBreakToken {
        return { type: SlimeTokenType.Break, value: "break", loc } as SlimeBreakToken;
    }

    createContinueToken(loc?: SubhutiSourceLocation): SlimeContinueToken {
        return { type: SlimeTokenType.Continue, value: "continue", loc } as SlimeContinueToken;
    }

    createReturnToken(loc?: SubhutiSourceLocation): SlimeReturnToken {
        return { type: SlimeTokenType.Return, value: "return", loc } as SlimeReturnToken;
    }

    createThrowToken(loc?: SubhutiSourceLocation): SlimeThrowToken {
        return { type: SlimeTokenType.Throw, value: "throw", loc } as SlimeThrowToken;
    }

    createTryToken(loc?: SubhutiSourceLocation): SlimeTryToken {
        return { type: SlimeTokenType.Try, value: "try", loc } as SlimeTryToken;
    }

    createCatchToken(loc?: SubhutiSourceLocation): SlimeCatchToken {
        return { type: SlimeTokenType.Catch, value: "catch", loc } as SlimeCatchToken;
    }

    createFinallyToken(loc?: SubhutiSourceLocation): SlimeFinallyToken {
        return { type: SlimeTokenType.Finally, value: "finally", loc } as SlimeFinallyToken;
    }

    createWithToken(loc?: SubhutiSourceLocation): SlimeWithToken {
        return { type: SlimeTokenType.With, value: "with", loc } as SlimeWithToken;
    }

    createDebuggerToken(loc?: SubhutiSourceLocation): SlimeDebuggerToken {
        return { type: SlimeTokenType.Debugger, value: "debugger", loc } as SlimeDebuggerToken;
    }

    // ============================================
    // 操作符关键字 Token
    // ============================================

    createNewToken(loc?: SubhutiSourceLocation): SlimeNewToken {
        return { type: SlimeTokenType.New, value: "new", loc } as SlimeNewToken;
    }

    createYieldToken(loc?: SubhutiSourceLocation): SlimeYieldToken {
        return { type: SlimeTokenType.Yield, value: "yield", loc } as SlimeYieldToken;
    }

    createAwaitToken(loc?: SubhutiSourceLocation): SlimeAwaitToken {
        return { type: SlimeTokenType.Await, value: "await", loc } as SlimeAwaitToken;
    }

    // ============================================
    // 模块关键字 Token
    // ============================================

    createImportToken(loc?: SubhutiSourceLocation): SlimeImportToken {
        return { type: SlimeTokenType.Import, value: "import", loc } as SlimeImportToken;
    }

    createExportToken(loc?: SubhutiSourceLocation): SlimeExportToken {
        return { type: SlimeTokenType.Export, value: "export", loc } as SlimeExportToken;
    }

    createFromToken(loc?: SubhutiSourceLocation): SlimeFromToken {
        return { type: SlimeTokenType.From, value: "from", loc } as SlimeFromToken;
    }

    createAsToken(loc?: SubhutiSourceLocation): SlimeAsToken {
        return { type: SlimeTokenType.As, value: "as", loc } as SlimeAsToken;
    }
}

const SlimeTokenCreate = new SlimeTokenFactory();
export default SlimeTokenCreate;

