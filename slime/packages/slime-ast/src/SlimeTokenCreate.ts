/**
 * SlimeTokenCreate.ts - Token 节点创建工厂
 *
 * 为每个 Token 类型提供创建方法
 * 与 SlimeESTree.ts 中的 Token 类型一一对应
 */

import type { SubhutiSourceLocation } from "subhuti/src/struct/SubhutiCst.ts";
import type {
    // 变量声明关键字 Token
    SlimeVarToken,
    SlimeLetToken,
    SlimeConstToken,
    // 赋值运算符 Token
    SlimeAssignToken,
    // 标点符号 Token
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
    SlimeEllipsisToken,
    SlimeOptionalChainingToken,
    SlimeAsteriskToken,
    // 函数/类关键字 Token
    SlimeFunctionToken,
    SlimeAsyncToken,
    SlimeClassToken,
    SlimeExtendsToken,
    SlimeStaticToken,
    SlimeGetToken,
    SlimeSetToken,
    // 控制流关键字 Token
    SlimeIfToken,
    SlimeElseToken,
    SlimeSwitchToken,
    SlimeCaseToken,
    SlimeDefaultToken,
    SlimeForToken,
    SlimeWhileToken,
    SlimeDoToken,
    SlimeInToken,
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
    // 操作符关键字 Token
    SlimeNewToken,
    SlimeYieldToken,
    SlimeAwaitToken,
    SlimeTypeofToken,
    SlimeVoidToken,
    SlimeDeleteToken,
    SlimeInstanceofToken,
    // 模块关键字 Token
    SlimeImportToken,
    SlimeExportToken,
    SlimeFromToken,
    SlimeAsToken,
    // 运算符 Token
    SlimeBinaryOperatorToken,
    SlimeUnaryOperatorToken,
    SlimeLogicalOperatorToken,
    SlimeAssignmentOperatorToken,
    SlimeUpdateOperatorToken,
    // 运算符值类型
    SlimeBinaryOperator,
    SlimeUnaryOperator,
    SlimeLogicalOperator,
    SlimeAssignmentOperator,
    SlimeUpdateOperator,
} from "./SlimeESTree.ts";
import {
    SlimeTokenType,
    SlimeBinaryOperatorTokenTypes,
    SlimeUnaryOperatorTokenTypes,
    SlimeLogicalOperatorTokenTypes,
    SlimeAssignmentOperatorTokenTypes,
    SlimeUpdateOperatorTokenTypes,
} from "slime/packages/slime-token/src/SlimeTokenType.ts";

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

    createEllipsisToken(loc?: SubhutiSourceLocation): SlimeEllipsisToken {
        return { type: SlimeTokenType.Ellipsis, value: "...", loc } as SlimeEllipsisToken;
    }

    createOptionalChainingToken(loc?: SubhutiSourceLocation): SlimeOptionalChainingToken {
        return { type: SlimeTokenType.OptionalChaining, value: "?.", loc } as SlimeOptionalChainingToken;
    }

    createAsteriskToken(loc?: SubhutiSourceLocation): SlimeAsteriskToken {
        return { type: SlimeTokenType.Asterisk, value: "*", loc } as SlimeAsteriskToken;
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

    createTypeofToken(loc?: SubhutiSourceLocation): SlimeTypeofToken {
        return { type: SlimeTokenType.Typeof, value: "typeof", loc } as SlimeTypeofToken;
    }

    createVoidToken(loc?: SubhutiSourceLocation): SlimeVoidToken {
        return { type: SlimeTokenType.Void, value: "void", loc } as SlimeVoidToken;
    }

    createDeleteToken(loc?: SubhutiSourceLocation): SlimeDeleteToken {
        return { type: SlimeTokenType.Delete, value: "delete", loc } as SlimeDeleteToken;
    }

    createInstanceofToken(loc?: SubhutiSourceLocation): SlimeInstanceofToken {
        return { type: SlimeTokenType.Instanceof, value: "instanceof", loc } as SlimeInstanceofToken;
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

    createInToken(loc?: SubhutiSourceLocation): SlimeInToken {
        return { type: SlimeTokenType.In, value: "in", loc } as SlimeInToken;
    }

    // ============================================
    // 运算符 Token
    // ============================================

    /**
     * 创建二元运算符 Token
     * 支持: == != === !== < <= > >= << >> >>> + - * / % ** | ^ & in instanceof
     */
    createBinaryOperatorToken(operator: SlimeBinaryOperator, loc?: SubhutiSourceLocation): SlimeBinaryOperatorToken {
        const typeMap: Record<SlimeBinaryOperator, string> = {
            "==": SlimeBinaryOperatorTokenTypes.Equal,
            "!=": SlimeBinaryOperatorTokenTypes.NotEqual,
            "===": SlimeBinaryOperatorTokenTypes.StrictEqual,
            "!==": SlimeBinaryOperatorTokenTypes.StrictNotEqual,
            "<": SlimeBinaryOperatorTokenTypes.Less,
            "<=": SlimeBinaryOperatorTokenTypes.LessEqual,
            ">": SlimeBinaryOperatorTokenTypes.Greater,
            ">=": SlimeBinaryOperatorTokenTypes.GreaterEqual,
            "<<": SlimeBinaryOperatorTokenTypes.LeftShift,
            ">>": SlimeBinaryOperatorTokenTypes.RightShift,
            ">>>": SlimeBinaryOperatorTokenTypes.UnsignedRightShift,
            "+": SlimeBinaryOperatorTokenTypes.Plus,
            "-": SlimeBinaryOperatorTokenTypes.Minus,
            "*": SlimeBinaryOperatorTokenTypes.Asterisk,
            "/": SlimeBinaryOperatorTokenTypes.Slash,
            "%": SlimeBinaryOperatorTokenTypes.Modulo,
            "**": SlimeBinaryOperatorTokenTypes.Exponentiation,
            "|": SlimeBinaryOperatorTokenTypes.BitwiseOr,
            "^": SlimeBinaryOperatorTokenTypes.BitwiseXor,
            "&": SlimeBinaryOperatorTokenTypes.BitwiseAnd,
            "in": SlimeBinaryOperatorTokenTypes.In,
            "instanceof": SlimeBinaryOperatorTokenTypes.Instanceof,
        };
        return { type: typeMap[operator], value: operator, loc } as SlimeBinaryOperatorToken;
    }

    /**
     * 创建一元运算符 Token
     * 支持: - + ! ~ typeof void delete
     */
    createUnaryOperatorToken(operator: SlimeUnaryOperator, loc?: SubhutiSourceLocation): SlimeUnaryOperatorToken {
        const typeMap: Record<SlimeUnaryOperator, string> = {
            "-": SlimeUnaryOperatorTokenTypes.Minus,
            "+": SlimeUnaryOperatorTokenTypes.Plus,
            "!": SlimeUnaryOperatorTokenTypes.LogicalNot,
            "~": SlimeUnaryOperatorTokenTypes.BitwiseNot,
            "typeof": SlimeUnaryOperatorTokenTypes.Typeof,
            "void": SlimeUnaryOperatorTokenTypes.Void,
            "delete": SlimeUnaryOperatorTokenTypes.Delete,
        };
        return { type: typeMap[operator], value: operator, loc } as SlimeUnaryOperatorToken;
    }

    /**
     * 创建逻辑运算符 Token
     * 支持: || && ??
     */
    createLogicalOperatorToken(operator: SlimeLogicalOperator, loc?: SubhutiSourceLocation): SlimeLogicalOperatorToken {
        const typeMap: Record<SlimeLogicalOperator, string> = {
            "||": SlimeLogicalOperatorTokenTypes.LogicalOr,
            "&&": SlimeLogicalOperatorTokenTypes.LogicalAnd,
            "??": SlimeLogicalOperatorTokenTypes.NullishCoalescing,
        };
        return { type: typeMap[operator], value: operator, loc } as SlimeLogicalOperatorToken;
    }

    /**
     * 创建赋值运算符 Token
     * 支持: = += -= *= /= %= **= <<= >>= >>>= |= ^= &= ||= &&= ??=
     */
    createAssignmentOperatorToken(operator: SlimeAssignmentOperator, loc?: SubhutiSourceLocation): SlimeAssignmentOperatorToken {
        const typeMap: Record<SlimeAssignmentOperator, string> = {
            "=": SlimeAssignmentOperatorTokenTypes.Assign,
            "+=": SlimeAssignmentOperatorTokenTypes.PlusAssign,
            "-=": SlimeAssignmentOperatorTokenTypes.MinusAssign,
            "*=": SlimeAssignmentOperatorTokenTypes.MultiplyAssign,
            "/=": SlimeAssignmentOperatorTokenTypes.DivideAssign,
            "%=": SlimeAssignmentOperatorTokenTypes.ModuloAssign,
            "**=": SlimeAssignmentOperatorTokenTypes.ExponentiationAssign,
            "<<=": SlimeAssignmentOperatorTokenTypes.LeftShiftAssign,
            ">>=": SlimeAssignmentOperatorTokenTypes.RightShiftAssign,
            ">>>=": SlimeAssignmentOperatorTokenTypes.UnsignedRightShiftAssign,
            "|=": SlimeAssignmentOperatorTokenTypes.BitwiseOrAssign,
            "^=": SlimeAssignmentOperatorTokenTypes.BitwiseXorAssign,
            "&=": SlimeAssignmentOperatorTokenTypes.BitwiseAndAssign,
            "||=": SlimeAssignmentOperatorTokenTypes.LogicalOrAssign,
            "&&=": SlimeAssignmentOperatorTokenTypes.LogicalAndAssign,
            "??=": SlimeAssignmentOperatorTokenTypes.NullishCoalescingAssign,
        };
        return { type: typeMap[operator], value: operator, loc } as SlimeAssignmentOperatorToken;
    }

    /**
     * 创建更新运算符 Token
     * 支持: ++ --
     */
    createUpdateOperatorToken(operator: SlimeUpdateOperator, loc?: SubhutiSourceLocation): SlimeUpdateOperatorToken {
        const typeMap: Record<SlimeUpdateOperator, string> = {
            "++": SlimeUpdateOperatorTokenTypes.Increment,
            "--": SlimeUpdateOperatorTokenTypes.Decrement,
        };
        return { type: typeMap[operator], value: operator, loc } as SlimeUpdateOperatorToken;
    }
}

const SlimeTokenCreate = new SlimeTokenFactory();
export default SlimeTokenCreate;

