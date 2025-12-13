import CssTsTokenConsumer, { cssTsTokens } from "./CssTsTokenConsumer.js"
import { Subhuti, SubhutiRule } from 'subhuti/src/SubhutiParser.ts'
import type { SubhutiParserOptions } from 'subhuti/src/SubhutiParser.ts'
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts"
import type { ExpressionParams, StatementParams, DeclarationParams } from "slime-parser/src/language/es2025/SlimeParser.ts"

/**
 * CssTsParser - CSS-in-TS 样式声明解析器
 * 
 * 支持的语法：
 * 
 * 1. css 表达式（推荐）：
 *    const buttonBase = css { colorRed, fontBold }
 *    const styles = { primary: css { bgPrimary } }
 * 
 * 2. 原子样式声明（旧语法，保留兼容）：
 *    css colorRed
 *    css buttonBase = { colorRed, fontBold }
 * 
 * 3. 在 class 属性中使用：
 *    div(class = css { primaryButton, marginTop }) {}
 */
@Subhuti
export default class CssTsParser<T extends CssTsTokenConsumer = CssTsTokenConsumer> extends SlimeParser<T> {
  constructor(sourceCode: string = '', options?: SubhutiParserOptions<T>) {
    super(sourceCode, options ?? {
      tokenConsumer: CssTsTokenConsumer as any,
      tokenDefinitions: cssTsTokens
    })
  }

  @SubhutiRule
  CssExpression(params: ExpressionParams = {}) {
    this.tokenConsumer.Css()
    this.Or([
      { alt: () => this.CssStyleObject(params) },
      { alt: () => this.tokenConsumer.IdentifierName() }
    ])
    return this.curCst
  }

  @SubhutiRule
  CssDeclaration(params: DeclarationParams = {}) {
    this.tokenConsumer.Css()
    this.tokenConsumer.IdentifierName()
    this.Option(() => {
      this.tokenConsumer.Assign()
      this.CssStyleObject(params)
    })
    return this.curCst
  }

  @SubhutiRule
  CssStyleObject(params: ExpressionParams = {}) {
    this.tokenConsumer.LBrace()
    this.Option(() => {
      this.ElementList(params)
    })
    this.tokenConsumer.RBrace()
    return this.curCst
  }

  @SubhutiRule
  Declaration(params: DeclarationParams = {}) {
    return this.Or([
      { alt: () => this.CssDeclaration(params) },
      { alt: () => this.HoistableDeclaration({ ...params, Default: false }) },
      { alt: () => this.ClassDeclaration({ ...params, Default: false }) },
      { alt: () => this.LexicalDeclaration({ ...params, In: true }) }
    ])
  }

  @SubhutiRule
  PrimaryExpression(params: ExpressionParams = {}) {
    return this.Or([
      { alt: () => this.CssExpression(params) },
      { alt: () => this.tokenConsumer.This() },
      { alt: () => this.IdentifierReference(params) },
      { alt: () => this.Literal() },
      { alt: () => this.ArrayLiteral(params) },
      { alt: () => this.ObjectLiteral(params) },
      { alt: () => this.FunctionExpression() },
      { alt: () => this.ClassExpression(params) },
      { alt: () => this.GeneratorExpression() },
      { alt: () => this.AsyncFunctionExpression() },
      { alt: () => this.AsyncGeneratorExpression() },
      { alt: () => this.consumeRegularExpressionLiteral() },
      { alt: () => this.TemplateLiteral(params) },
      { alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params) }
    ])
  }

  private consumeRegularExpressionLiteral(): any {
    return (this as any).consume('RegularExpressionLiteral', 'InputElementRegExp')
  }

  @SubhutiRule
  Statement(params: StatementParams = {}) {
    const { Return = false } = params
    return this.Or([
      { alt: () => this.CssDeclarationStatement(params) },
      { alt: () => this.BlockStatement(params) },
      { alt: () => this.VariableStatement(params) },
      { alt: () => this.EmptyStatement() },
      { alt: () => this.ExpressionStatement(params) },
      { alt: () => this.IfStatement(params) },
      { alt: () => this.BreakableStatement(params) },
      { alt: () => this.ContinueStatement(params) },
      { alt: () => this.BreakStatement(params) },
      ...(Return ? [{ alt: () => this.ReturnStatement(params) }] : []),
      { alt: () => this.WithStatement(params) },
      { alt: () => this.LabelledStatement(params) },
      { alt: () => this.ThrowStatement(params) },
      { alt: () => this.TryStatement(params) },
      { alt: () => this.DebuggerStatement() }
    ])
  }

  @SubhutiRule
  CssDeclarationStatement(params: StatementParams = {}) {
    this.CssDeclaration(params)
    return this.curCst
  }
}
