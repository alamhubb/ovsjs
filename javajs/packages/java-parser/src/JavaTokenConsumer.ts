/**
 * Java 17 Token Consumer - Token 消费封装
 *
 * 职责：
 * 1. 为每个 Java token 提供类型安全的消费方法
 * 2. 提供语义化的 API（方法名即文档）
 * 3. 支持 IDE 自动补全和编译时检查
 */

import { SubhutiTokenConsumer } from 'subhuti'
import { JavaTokenType } from './JavaTokenType.ts'

export default class JavaTokenConsumer extends SubhutiTokenConsumer {

    // ============================================
    // 上下文关键字消费辅助方法
    // ============================================

    /**
     * 消费一个 IDENTIFIER 并检查其值是否匹配
     * 用于上下文关键字（如 var, yield, record, sealed, permits）
     */
    protected consumeIdentifierValue(value: string) {
        const token = this.parser.curToken
        if (token?.tokenName === JavaTokenType.IDENTIFIER && token.tokenValue === value) {
            return this.consume(JavaTokenType.IDENTIFIER)
        }
        this.parser._markParseFail()
        return undefined
    }

    // ============================================
    // 关键字 (Keywords)
    // ============================================

    ABSTRACT() { return this.consume(JavaTokenType.ABSTRACT) }
    ASSERT() { return this.consume(JavaTokenType.ASSERT) }
    BOOLEAN() { return this.consume(JavaTokenType.BOOLEAN) }
    BREAK() { return this.consume(JavaTokenType.BREAK) }
    BYTE() { return this.consume(JavaTokenType.BYTE) }
    CASE() { return this.consume(JavaTokenType.CASE) }
    CATCH() { return this.consume(JavaTokenType.CATCH) }
    CHAR() { return this.consume(JavaTokenType.CHAR) }
    CLASS() { return this.consume(JavaTokenType.CLASS) }
    CONST() { return this.consume(JavaTokenType.CONST) }
    CONTINUE() { return this.consume(JavaTokenType.CONTINUE) }
    DEFAULT() { return this.consume(JavaTokenType.DEFAULT) }
    DO() { return this.consume(JavaTokenType.DO) }
    DOUBLE() { return this.consume(JavaTokenType.DOUBLE) }
    ELSE() { return this.consume(JavaTokenType.ELSE) }
    ENUM() { return this.consume(JavaTokenType.ENUM) }
    EXPORTS() { return this.consume(JavaTokenType.EXPORTS) }
    EXTENDS() { return this.consume(JavaTokenType.EXTENDS) }
    FINAL() { return this.consume(JavaTokenType.FINAL) }
    FINALLY() { return this.consume(JavaTokenType.FINALLY) }
    FLOAT() { return this.consume(JavaTokenType.FLOAT) }
    FOR() { return this.consume(JavaTokenType.FOR) }
    GOTO() { return this.consume(JavaTokenType.GOTO) }
    IF() { return this.consume(JavaTokenType.IF) }
    IMPLEMENTS() { return this.consume(JavaTokenType.IMPLEMENTS) }
    IMPORT() { return this.consume(JavaTokenType.IMPORT) }
    INSTANCEOF() { return this.consume(JavaTokenType.INSTANCEOF) }
    INT() { return this.consume(JavaTokenType.INT) }
    INTERFACE() { return this.consume(JavaTokenType.INTERFACE) }
    LONG() { return this.consume(JavaTokenType.LONG) }
    MODULE() { return this.consume(JavaTokenType.MODULE) }
    NATIVE() { return this.consume(JavaTokenType.NATIVE) }
    NEW() { return this.consume(JavaTokenType.NEW) }
    NON_SEALED() { return this.consume(JavaTokenType.NON_SEALED) }
    OPEN() { return this.consume(JavaTokenType.OPEN) }
    OPENS() { return this.consume(JavaTokenType.OPENS) }
    PACKAGE() { return this.consume(JavaTokenType.PACKAGE) }
    PERMITS() { return this.consume(JavaTokenType.PERMITS) }
    PRIVATE() { return this.consume(JavaTokenType.PRIVATE) }
    PROTECTED() { return this.consume(JavaTokenType.PROTECTED) }
    PROVIDES() { return this.consume(JavaTokenType.PROVIDES) }
    PUBLIC() { return this.consume(JavaTokenType.PUBLIC) }
    RECORD() { return this.consume(JavaTokenType.RECORD) }
    REQUIRES() { return this.consume(JavaTokenType.REQUIRES) }
    RETURN() { return this.consume(JavaTokenType.RETURN) }
    SEALED() { return this.consume(JavaTokenType.SEALED) }
    SHORT() { return this.consume(JavaTokenType.SHORT) }
    STATIC() { return this.consume(JavaTokenType.STATIC) }
    STRICTFP() { return this.consume(JavaTokenType.STRICTFP) }
    SUPER() { return this.consume(JavaTokenType.SUPER) }
    SWITCH() { return this.consume(JavaTokenType.SWITCH) }
    SYNCHRONIZED() { return this.consume(JavaTokenType.SYNCHRONIZED) }
    THIS() { return this.consume(JavaTokenType.THIS) }
    THROW() { return this.consume(JavaTokenType.THROW) }
    THROWS() { return this.consume(JavaTokenType.THROWS) }
    TO() { return this.consume(JavaTokenType.TO) }
    TRANSIENT() { return this.consume(JavaTokenType.TRANSIENT) }
    TRANSITIVE() { return this.consume(JavaTokenType.TRANSITIVE) }
    TRY() { return this.consume(JavaTokenType.TRY) }
    USES() { return this.consume(JavaTokenType.USES) }
    VAR() { return this.consume(JavaTokenType.VAR) }
    VOID() { return this.consume(JavaTokenType.VOID) }
    VOLATILE() { return this.consume(JavaTokenType.VOLATILE) }
    WHEN() { return this.consume(JavaTokenType.WHEN) }
    WHILE() { return this.consume(JavaTokenType.WHILE) }
    WITH() { return this.consume(JavaTokenType.WITH) }
    YIELD() { return this.consume(JavaTokenType.YIELD) }


    // ============================================
    // 字面量 (Literals)
    // ============================================

    DECIMAL_LITERAL() { return this.consume(JavaTokenType.DECIMAL_LITERAL) }
    HEX_LITERAL() { return this.consume(JavaTokenType.HEX_LITERAL) }
    OCT_LITERAL() { return this.consume(JavaTokenType.OCT_LITERAL) }
    BINARY_LITERAL() { return this.consume(JavaTokenType.BINARY_LITERAL) }
    FLOAT_LITERAL() { return this.consume(JavaTokenType.FLOAT_LITERAL) }
    HEX_FLOAT_LITERAL() { return this.consume(JavaTokenType.HEX_FLOAT_LITERAL) }
    BOOL_LITERAL() { return this.consume(JavaTokenType.BOOL_LITERAL) }
    CHAR_LITERAL() { return this.consume(JavaTokenType.CHAR_LITERAL) }
    STRING_LITERAL() { return this.consume(JavaTokenType.STRING_LITERAL) }
    TEXT_BLOCK() { return this.consume(JavaTokenType.TEXT_BLOCK) }
    NULL_LITERAL() { return this.consume(JavaTokenType.NULL_LITERAL) }

    // ============================================
    // 分隔符 (Separators)
    // ============================================

    LPAREN() { return this.consume(JavaTokenType.LPAREN) }
    RPAREN() { return this.consume(JavaTokenType.RPAREN) }
    LBRACE() { return this.consume(JavaTokenType.LBRACE) }
    RBRACE() { return this.consume(JavaTokenType.RBRACE) }
    LBRACK() { return this.consume(JavaTokenType.LBRACK) }
    RBRACK() { return this.consume(JavaTokenType.RBRACK) }
    SEMI() { return this.consume(JavaTokenType.SEMI) }
    COMMA() { return this.consume(JavaTokenType.COMMA) }
    DOT() { return this.consume(JavaTokenType.DOT) }
    AT() { return this.consume(JavaTokenType.AT) }
    ELLIPSIS() { return this.consume(JavaTokenType.ELLIPSIS) }

    // ============================================
    // 运算符 (Operators)
    // ============================================

    // 赋值运算符
    ASSIGN() { return this.consume(JavaTokenType.ASSIGN) }
    ADD_ASSIGN() { return this.consume(JavaTokenType.ADD_ASSIGN) }
    SUB_ASSIGN() { return this.consume(JavaTokenType.SUB_ASSIGN) }
    MUL_ASSIGN() { return this.consume(JavaTokenType.MUL_ASSIGN) }
    DIV_ASSIGN() { return this.consume(JavaTokenType.DIV_ASSIGN) }
    AND_ASSIGN() { return this.consume(JavaTokenType.AND_ASSIGN) }
    OR_ASSIGN() { return this.consume(JavaTokenType.OR_ASSIGN) }
    XOR_ASSIGN() { return this.consume(JavaTokenType.XOR_ASSIGN) }
    MOD_ASSIGN() { return this.consume(JavaTokenType.MOD_ASSIGN) }
    LSHIFT_ASSIGN() { return this.consume(JavaTokenType.LSHIFT_ASSIGN) }
    RSHIFT_ASSIGN() { return this.consume(JavaTokenType.RSHIFT_ASSIGN) }
    URSHIFT_ASSIGN() { return this.consume(JavaTokenType.URSHIFT_ASSIGN) }

    // 比较运算符
    GT() { return this.consume(JavaTokenType.GT) }
    LT() { return this.consume(JavaTokenType.LT) }
    EQUAL() { return this.consume(JavaTokenType.EQUAL) }
    LE() { return this.consume(JavaTokenType.LE) }
    GE() { return this.consume(JavaTokenType.GE) }
    NOTEQUAL() { return this.consume(JavaTokenType.NOTEQUAL) }

    // 逻辑运算符
    BANG() { return this.consume(JavaTokenType.BANG) }
    AND() { return this.consume(JavaTokenType.AND) }
    OR() { return this.consume(JavaTokenType.OR) }

    // 位运算符
    TILDE() { return this.consume(JavaTokenType.TILDE) }
    BITAND() { return this.consume(JavaTokenType.BITAND) }
    BITOR() { return this.consume(JavaTokenType.BITOR) }
    CARET() { return this.consume(JavaTokenType.CARET) }

    // 算术运算符
    ADD() { return this.consume(JavaTokenType.ADD) }
    SUB() { return this.consume(JavaTokenType.SUB) }
    MUL() { return this.consume(JavaTokenType.MUL) }
    DIV() { return this.consume(JavaTokenType.DIV) }
    MOD() { return this.consume(JavaTokenType.MOD) }

    // 自增自减
    INC() { return this.consume(JavaTokenType.INC) }
    DEC() { return this.consume(JavaTokenType.DEC) }

    // 其他运算符
    QUESTION() { return this.consume(JavaTokenType.QUESTION) }
    COLON() { return this.consume(JavaTokenType.COLON) }
    ARROW() { return this.consume(JavaTokenType.ARROW) }
    COLONCOLON() { return this.consume(JavaTokenType.COLONCOLON) }

    // ============================================
    // 标识符 (Identifier)
    // ============================================

    IDENTIFIER() { return this.consume(JavaTokenType.IDENTIFIER) }
}
