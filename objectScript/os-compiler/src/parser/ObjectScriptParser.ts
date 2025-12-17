import { Subhuti, SubhutiRule } from "subhuti";
import { SlimeParser } from "slime-parser";
import type { ExpressionParams, DeclarationParams } from "slime-parser";
import ObjectScriptTokenConsumer, {objectScriptTokens} from "./ObjectScriptTokenConsumer";

/**
 * ObjectScript Parser
 *
 * 继承 SlimeParser，扩展支持：
 * 1. object 关键字 - 单例对象声明
 * 2. 多继承语法 - class A extends B, C { }
 */
@Subhuti
export default class ObjectScriptParser extends SlimeParser<ObjectScriptTokenConsumer> {
  /**
   * 构造函数 - 使用按需词法分析模式
   * @param sourceCode 原始源码
   */
  constructor(sourceCode: string = '') {
    super(sourceCode, {
      tokenConsumer: ObjectScriptTokenConsumer,
      tokenDefinitions: objectScriptTokens
    })
  }

  // ============================================
  // 多继承语法支持
  // ============================================

  /**
   * ClassHeritage - 覆盖父类，支持多继承
   *
   * ObjectScript 扩展语法：
   *   ClassHeritage[Yield, Await] :
   *       extends LeftHandSideExpression[?Yield, ?Await] (, LeftHandSideExpression[?Yield, ?Await])*
   *
   * 示例：
   *   class A extends B { }           // 单继承
   *   class A extends B, C { }        // 多继承
   *   class A extends B, C, D { }     // 多继承（多个父类）
   */
  @SubhutiRule
  ClassHeritage(params: ExpressionParams = {}) {
    this.tokenConsumer.Extends()
    // 第一个父类（必须）
    this.LeftHandSideExpression(params)
    // 可选的额外父类（用逗号分隔）
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.LeftHandSideExpression(params)
    })
    return this.curCst
  }

  // ============================================
  // object 关键字支持（单例对象声明）
  // ============================================

  /**
   * ObjectDeclaration - object 关键字声明单例对象
   *
   * 语法：
   *   object Identifier { ObjectBody }
   *   object Identifier extends Parent { ObjectBody }
   *
   * 示例：
   *   object AppConfig {
   *     name = "MyApp"
   *     version = "1.0.0"
   *   }
   */
  @SubhutiRule
  ObjectDeclaration(params: DeclarationParams = {}) {
    this.tokenConsumer.ObjectToken()
    this.BindingIdentifier(params)
    this.Option(() => this.ObjectHeritage(params))
    this.tokenConsumer.LBrace()
    this.Option(() => this.ObjectBody(params))
    this.tokenConsumer.RBrace()
    return this.curCst
  }

  /**
   * ObjectHeritage - object 的继承（单继承）
   */
  @SubhutiRule
  ObjectHeritage(params: ExpressionParams = {}) {
    this.tokenConsumer.Extends()
    this.LeftHandSideExpression(params)
    return this.curCst
  }

  /**
   * ObjectBody - object 的主体
   */
  @SubhutiRule
  ObjectBody(params: ExpressionParams = {}) {
    return this.ObjectElementList(params)
  }

  /**
   * ObjectElementList - object 元素列表
   */
  @SubhutiRule
  ObjectElementList(params: ExpressionParams = {}) {
    this.Many(() => this.ObjectElement(params))
    return this.curCst
  }

  /**
   * ObjectElement - object 元素（方法或属性）
   */
  @SubhutiRule
  ObjectElement(params: ExpressionParams = {}) {
    return this.Or([
      {alt: () => this.MethodDefinition(params)},
      {alt: () => this.ObjectPropertyAssignment(params)},
      {alt: () => this.EmptyStatement()}
    ])
  }

  /**
   * ObjectPropertyAssignment - object 属性赋值
   * 语法: Identifier = Expression
   */
  @SubhutiRule
  ObjectPropertyAssignment(params: ExpressionParams = {}) {
    this.BindingIdentifier(params)
    this.tokenConsumer.Assign()
    this.AssignmentExpression({...params, In: true})
    return this.curCst
  }

  /**
   * Declaration - 覆盖父类，添加 ObjectDeclaration 支持
   */
  @SubhutiRule
  Declaration(params: DeclarationParams = {}) {
    return this.Or([
      {alt: () => this.ObjectDeclaration(params)},
      {alt: () => this.HoistableDeclaration({...params, Default: false})},
      {alt: () => this.ClassDeclaration({...params, Default: false})},
      {alt: () => this.LexicalDeclaration({...params, In: true})}
    ])
  }
}
