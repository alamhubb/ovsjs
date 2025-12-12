import CssTsTokenConsumer, { cssTsTokens } from "./CssTsTokenConsumer.ts"
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
 *    const buttonBase = css { colorRed, fontBold }   // 赋值给变量
 *    const styles = { primary: css { bgPrimary } }   // 在对象中使用
 * 
 * 2. 原子样式声明（旧语法，保留兼容）：
 *    css colorRed        // 声明一个原子样式
 *    css buttonBase = { colorRed, fontBold }     // 组合多个样式
 * 
 * 3. 在 class 属性中使用：
 *    div(class = css { primaryButton, marginTop }) {}
 * 
 * 编译时会：
 * - 将 css { ... } 转换为字符串 "class-name1 class-name2"
 * - 驼峰命名自动转换为 kebab-case
 * 
 * 泛型参数 T：
 * - 允许子类（如 OvsParser）传入自己的 TokenConsumer
 * - T 必须继承自 CssTsTokenConsumer，确保有 Css() 方法
 */
@Subhuti
export default class CssTsParser<T extends CssTsTokenConsumer = CssTsTokenConsumer> extends SlimeParser<T> {
  /**
   * 构造函数 - 使用按需词法分析模式
   * @param sourceCode 原始源码
   * @param options 可选的解析器配置（子类可传入自己的 tokenConsumer 和 tokenDefinitions）
   */
  constructor(sourceCode: string = '', options?: SubhutiParserOptions<T>) {
    super(sourceCode, options ?? {
      tokenConsumer: CssTsTokenConsumer as any,
      tokenDefinitions: cssTsTokens
    })
  }

  // ==================== CssTs 样式语法 ====================

  /**
   * CssExpression - CSS 样式表达式
   * 
   * 语法：
   *   css { CssPropertyList }    // 多原子：css { colorRed, fontBold }
   *   css IdentifierName         // 单原子：css colorRed
   * 
   * 示例：
   *   const buttonBase = css { colorRed, fontBold }
   *   const styles = { primary: css { bgPrimary, colorWhite } }
   *   button(class = css { rounded, cursorPointer })
   *   style.color = css colorRed   // 单原子用于替换
   * 
   * 编译后：
   *   const buttonBase = cssts.$cls(colorRed, fontBold)
   *   style.color = css colorRed → style = cssts.replace(style, "color", "colorRed")
   */
  @SubhutiRule
  CssExpression(params: ExpressionParams = {}) {
    this.tokenConsumer.Css()           // css 软关键字
    // 两种形式：{ ... } 或 单个标识符
    this.Or([
      { alt: () => this.CssStyleObject(params) },  // css { colorRed, fontBold }
      { alt: () => this.tokenConsumer.IdentifierName() }  // css colorRed
    ])
    return this.curCst
  }

  /**
   * CssDeclaration - CSS 样式声明（旧语法，保留兼容）
   * 
   * 语法：
   *   css IdentifierName                              // 原子样式：css colorRed
   *   css IdentifierName = { CssPropertyList }        // 组合样式：css buttonBase = { colorRed, fontBold }
   */
  @SubhutiRule
  CssDeclaration(params: DeclarationParams = {}) {
    this.tokenConsumer.Css()           // css 软关键字
    this.tokenConsumer.IdentifierName() // 样式名称
    
    // 可选的 = { ... } 部分（组合样式）
    this.Option(() => {
      this.tokenConsumer.Assign()      // =
      this.CssStyleObject(params)      // { ... }
    })
    
    return this.curCst
  }

  /**
   * CssStyleObject - CSS 样式对象
   * 
   * 语法：{ CssPropertyList }
   * 
   * 示例：
   *   { colorRed }
   *   { colorRed, fontBold }
   *   { buttonBase, bgBlue, marginTop }
   */
  @SubhutiRule
  CssStyleObject(params: ExpressionParams = {}) {
    this.tokenConsumer.LBrace()
    this.Option(() => {
      this.CssPropertyList(params)
    })
    this.tokenConsumer.RBrace()
    return this.curCst
  }

  /**
   * CssPropertyList - CSS 属性列表
   * 
   * 语法：CssProperty (, CssProperty)*
   */
  @SubhutiRule
  CssPropertyList(params: ExpressionParams = {}) {
    this.CssProperty(params)
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.CssProperty(params)
    })
    return this.curCst
  }

  /**
   * CssProperty - CSS 属性（样式引用）
   * 
   * 语法：IdentifierName
   * 
   * 每个属性都是对另一个 css 声明的引用
   */
  @SubhutiRule
  CssProperty(params: ExpressionParams = {}) {
    return this.tokenConsumer.IdentifierName()
  }

  /**
   * Declaration - 覆盖父类，添加 CssDeclaration 支持
   */
  @SubhutiRule
  Declaration(params: DeclarationParams = {}) {
    return this.Or([
      { alt: () => this.CssDeclaration(params) },  // 添加 css 样式声明
      { alt: () => this.HoistableDeclaration({ ...params, Default: false }) },
      { alt: () => this.ClassDeclaration({ ...params, Default: false }) },
      { alt: () => this.LexicalDeclaration({ ...params, In: true }) }
    ])
  }

  /**
   * PrimaryExpression - 覆盖父类，添加 CssExpression 支持
   * 
   * 这允许 css { } 作为表达式使用：
   *   const style = css { colorRed }
   *   button(class = css { rounded })
   */
  @SubhutiRule
  PrimaryExpression(params: ExpressionParams = {}) {
    return this.Or([
      { alt: () => this.CssExpression(params) },  // 🆕 css 表达式
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
      { alt: () => this.RegularExpressionLiteral() },
      { alt: () => this.TemplateLiteral(params) },
      { alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params) }
    ])
  }

  /**
   * Statement - 覆盖父类，支持 CssDeclaration 作为语句
   * 
   * 这允许在任何语句位置使用 css 声明：
   *   function setup() {
   *     css colorRed
   *     css buttonBase = { colorRed }
   *   }
   */
  @SubhutiRule
  Statement(params: StatementParams = {}) {
    const { Return = false } = params
    return this.Or([
      { alt: () => this.CssDeclarationStatement(params) },  // css 声明语句
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

  /**
   * CssDeclarationStatement - CSS 声明语句
   * 
   * 将 CssDeclaration 包装为语句，不需要分号
   */
  @SubhutiRule
  CssDeclarationStatement(params: StatementParams = {}) {
    this.CssDeclaration(params)
    // 不需要分号，类似于 FunctionDeclaration
    return this.curCst
  }
}
