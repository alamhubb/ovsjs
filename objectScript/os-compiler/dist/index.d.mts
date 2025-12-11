//#region ../../subhuti/src/struct/SubhutiCreateToken.d.ts
/**
 * 词法前瞻配置
 */
interface SubhutiTokenLookahead {
  is?: RegExp | string;
  not?: RegExp | string;
  in?: (RegExp | string)[];
  notIn?: (RegExp | string)[];
}
/**
 * 上下文约束配置
 * 用于处理词法歧义（如正则表达式 vs 除法）
 */
interface SubhutiTokenContextConstraint {
  onlyAfter?: Set<string>;
  notAfter?: Set<string>;
  onlyAtStart?: boolean;
  onlyAtLineStart?: boolean;
}
/**
 * SubhutiCreateToken 构造函数参数类型
 */
interface SubhutiCreateTokenOptions {
  name: string;
  type?: string;
  pattern?: RegExp;
  isKeyword?: boolean;
  skip?: boolean;
  value?: string;
  categories?: any;
  lookaheadAfter?: SubhutiTokenLookahead;
  contextConstraint?: SubhutiTokenContextConstraint;
}
declare class SubhutiCreateToken {
  name: string;
  type: string;
  pattern?: RegExp;
  isKeyword?: boolean;
  skip?: boolean;
  value?: string;
  categories?: any;
  lookaheadAfter?: SubhutiTokenLookahead;
  contextConstraint?: SubhutiTokenContextConstraint;
  constructor(ovsToken: SubhutiCreateTokenOptions);
}
//#endregion
//#region src/parser/ObjectScriptTokenConsumer.d.ts
/**
 * ObjectScript 软关键字（上下文关键字）
 * 这些在词法层是 IdentifierName，在语法层通过值检查来识别
 * 这样用户仍然可以使用 object 作为变量名
 */
declare const ObjectScriptContextualKeywords: {
  readonly Object: "object";
};
/**
 * ObjectScript 所有 Token 数组
 */
declare const objectScriptTokens: SubhutiCreateToken[];
/**
 * ObjectScript Token Consumer
 * 继承 SlimeTokenConsumer，添加 ObjectScript 特有的 token 消费方法
 */
declare class ObjectScriptTokenConsumer extends SlimeTokenConsumer {
  /**
   * 消费 object 软关键字
   * 用于单例对象声明: object MyConfig { ... }
   *
   * 注意：object 是软关键字（上下文关键字），用户仍可使用 object 作为变量名
   * 例如：const object = someValue  // 合法
   */
  ObjectToken(): any;
}
//#endregion
//#region src/parser/ObjectScriptParser.d.ts
/**
 * ObjectScript Parser
 *
 * 继承 SlimeParser，扩展支持：
 * 1. object 关键字 - 单例对象声明
 * 2. 多继承语法 - class A extends B, C { }
 */
declare class ObjectScriptParser extends SlimeParser<ObjectScriptTokenConsumer> {
  /**
   * 构造函数 - 使用按需词法分析模式
   * @param sourceCode 原始源码
   */
  constructor(sourceCode?: string);
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
  ClassHeritage(params?: ExpressionParams): any;
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
  ObjectDeclaration(params?: DeclarationParams): any;
  /**
   * ObjectHeritage - object 的继承（单继承）
   */
  ObjectHeritage(params?: ExpressionParams): any;
  /**
   * ObjectBody - object 的主体
   */
  ObjectBody(params?: ExpressionParams): any;
  /**
   * ObjectElementList - object 元素列表
   */
  ObjectElementList(params?: ExpressionParams): any;
  /**
   * ObjectElement - object 元素（方法或属性）
   */
  ObjectElement(params?: ExpressionParams): any;
  /**
   * ObjectPropertyAssignment - object 属性赋值
   * 语法: Identifier = Expression
   */
  ObjectPropertyAssignment(params?: ExpressionParams): any;
  /**
   * Declaration - 覆盖父类，添加 ObjectDeclaration 支持
   */
  Declaration(params?: DeclarationParams): any;
}
//#endregion
//#region src/factory/ObjectCstToSlimeAst.d.ts
/**
 * ObjectScript CST 到 Slime AST 转换器
 *
 * 核心功能：将 object 声明转换为临时类 + 实例化
 *
 * 转换示例：
 * ```
 * // 输入 CST
 * object Person {
 *   name = "Alice"
 *   greet() { return "Hello" }
 * }
 *
 * // 输出 AST（两个语句）
 * class $$OsClassPerson_a1b2c3d4 {
 *   name = "Alice"
 *   greet() { return "Hello" }
 * }
 * const Person = new $$OsClassPerson_a1b2c3d4()
 * ```
 */
declare class ObjectCstToSlimeAst extends SlimeCstToAst {
  /**
   * 是否需要导入 $osRuntime（用于多继承）
   * 在 toProgram() 调用后可读取此属性
   */
  needsOsRuntime: boolean;
  /**
   * 重写 toProgram 以支持 ObjectDeclaration
   *
   * 因为一个 ObjectDeclaration 会生成两个 AST 节点（class + const），
   * 所以需要在这里展平处理
   *
   * @returns SlimeProgram AST
   */
  toProgram(cst: SubhutiCst): SlimeProgram$1;
  /**
   * 创建 $osRuntime 的 import 声明
   * import { $osRuntime } from 'osjs'
   */
  private createOsRuntimeImport;
  /**
   * 重写 createDeclarationAst 以支持 ObjectDeclaration
   *
   * 注意：这里返回 any 类型，因为 ObjectDeclaration 需要返回数组（两个节点）
   */
  createDeclarationAst(cst: SubhutiCst): any;
  /**
   * 重写 createClassDeclarationAst 以支持多继承
   *
   * 检测到多继承时，生成调用 $osRuntime.initMultipleInheritance 的代码
   */
  createClassDeclarationAst(cst: SubhutiCst): SlimeClassDeclaration;
  /**
   * 从 ClassHeritage CST 提取多个父类表达式
   *
   * CST 结构（多继承）：
   * ClassHeritage
   *   ├── Extends
   *   ├── LeftHandSideExpression (第一个父类)
   *   ├── Comma
   *   ├── LeftHandSideExpression (第二个父类)
   *   ├── Comma
   *   ├── LeftHandSideExpression (第三个父类)
   *   └── ...
   */
  extractMultipleParentClasses(cst: SubhutiCst): SlimeExpression[];
  /**
   * 从表达式中提取名称（用于重复检测）
   */
  private getExpressionName;
  /**
   * 将多继承类转换为运行时委托模式
   *
   * 输入：class A extends B, C { foo() {} }
   * 输出：class A { constructor(...args) { $osRuntime.initMultipleInheritance(this, [B, C], args) } foo() {} }
   */
  transformToMultipleInheritance(originalClass: SlimeClassDeclaration, parentClasses: SlimeExpression[], loc: any): SlimeClassDeclaration;
  /**
   * 转换方法定义中的 super 表达式
   */
  transformMethodDefinition(method: SlimeMethodDefinition, loc: any): SlimeMethodDefinition;
  /**
   * 递归转换语句中的 super 表达式
   */
  transformStatementSuperExpressions(stmt: SlimeStatement, loc: any): SlimeStatement;
  /**
   * 递归转换表达式中的 super 表达式
   */
  transformExpression(expr: any, loc: any): any;
  /**
   * 检查是否是 super 成员表达式
   * super.xxx 或 super.B.xxx
   */
  isSuperMemberExpression(expr: any): boolean;
  /**
   * 判断是否是 super.B.xxx 形式（显式指定父类）
   */
  isExplicitSuperExpression(expr: any): boolean;
  /**
   * 转换 super.foo() 或 super.B.foo() 为运行时调用
   */
  transformSuperCall(expr: any, loc: any): any;
  /**
   * 转换 super.name 或 super.B.name 为运行时调用
   */
  transformSuperGet(expr: any, loc: any): any;
  /**
   * 转换 super.name = x 或 super.B.name = x 为运行时调用
   */
  transformSuperAssignment(expr: any, loc: any): any;
  /**
   * 创建 $osRuntime.methodName(...args) 调用表达式
   */
  createRuntimeCall(methodName: string, args: any[], loc: any): any;
  /**
   * 从调用参数中提取实际的表达式
   */
  extractCallArguments(args: any[]): any[];
  /**
   * 创建数组表达式
   */
  createArrayExpression(elements: any[], loc: any): any;
  /**
   * 在类体中查找构造函数
   */
  findConstructor(classBody: SlimeClassBody): SlimeMethodDefinition | null;
  /**
   * 创建多继承的构造函数
   *
   * 如果没有用户定义的构造函数：生成默认无参调用所有父类
   * 如果有用户定义的构造函数：转换 super.ClassName(args) 调用
   */
  createMultiInheritanceConstructor(parentClasses: SlimeExpression[], existingConstructor: SlimeMethodDefinition | null, loc: any): SlimeMethodDefinition;
  /**
   * 转换 super.ClassName(args) 调用为 $osRuntime.initParent(this, ClassName, [args])
   *
   * 如果不是 super.ClassName() 调用，返回原语句
   * 如果是 super() 调用（单继承），返回 null 过滤掉
   */
  transformSuperClassCall(stmt: SlimeStatement, loc: any): SlimeStatement | null;
  /**
   * 创建 $osRuntime.initParent(this, ClassName, [args]) 调用语句
   */
  createInitParentCall(parentExpr: SlimeExpression, args: any[], loc: any): SlimeStatement;
  /**
   * 检查语句是否是 super() 调用
   */
  isSuperCall(stmt: SlimeStatement): boolean;
  /**
   * 在类体中替换或添加构造函数
   */
  replaceOrAddConstructor(body: any[], newConstructor: SlimeMethodDefinition): any[];
  /**
   * 转换 ObjectDeclaration 为 ClassDeclaration + VariableDeclaration
   *
   * CST 结构：
   * ObjectDeclaration
   *   ├── ObjectToken (token: "object")
   *   ├── BindingIdentifier (对象名)
   *   ├── ObjectHeritage? (extends ...)
   *   ├── LBrace
   *   ├── ObjectBody? (属性和方法)
   *   └── RBrace
   *
   * @param cst ObjectDeclaration CST 节点
   * @returns [ClassDeclaration, VariableDeclaration] 两个 AST 节点的数组
   */
  createObjectDeclarationAst(cst: SubhutiCst): SlimeStatement[];
  /**
   * 转换 ObjectBody 为 ClassBody
   *
   * CST 结构：
   * ObjectBody
   *   └── ObjectElementList
   *       ├── ObjectElement (方法或属性)
   *       ├── ObjectElement
   *       └── ...
   */
  createObjectBodyAst(cst: SubhutiCst): SlimeClassBody;
  /**
   * 转换 ObjectElementList 为 ClassBody 元素数组
   */
  createObjectElementListAst(cst: SubhutiCst): Array<any>;
  /**
   * 转换 ObjectElement（单个属性或方法）
   *
   * ObjectElement 可以是：
   * - MethodDefinition（方法）
   * - ObjectPropertyAssignment（属性赋值）
   * - EmptySemicolon（空分号，忽略）
   */
  createObjectElementAst(cst: SubhutiCst): any;
  /**
   * 转换 ObjectPropertyAssignment 为 PropertyDefinition
   *
   * CST 结构：
   * ObjectPropertyAssignment
   *   ├── BindingIdentifier (属性名)
   *   ├── Eq (=)
   *   └── AssignmentExpression (值)
   *
   * 转换为：PropertyDefinition
   *   key: Identifier
   *   value: Expression
   */
  createObjectPropertyAssignmentAst(cst: SubhutiCst): SlimePropertyDefinition;
  /**
   * 创建空的 ClassBody
   */
  createEmptyClassBody(): SlimeClassBody;
}
//#endregion
//#region src/index.d.ts
interface OsTransformBaseResult {
  ast: SlimeProgram;
  tokens: SubhutiMatchToken[];
}
/**
 * ObjectScript 代码转换基础函数
 * 返回 AST 和 tokens
 */
declare function osTransformBase(code: string): OsTransformBaseResult;
/**
 * ObjectScript 代码转换（纯编译）
 * 返回编译后的代码和 source mapping
 */
declare function osTransform(code: string): SlimeGeneratorResult;
/**
 * Vite 插件专用的 ObjectScript 代码转换
 * 添加 osjs 运行时导入
 */
declare function vitePluginOsTransform(code: string): SlimeGeneratorResult;
//#endregion
export { ObjectCstToSlimeAst, ObjectScriptContextualKeywords, ObjectScriptParser, ObjectScriptTokenConsumer, OsTransformBaseResult, objectScriptTokens, osTransform, osTransformBase, vitePluginOsTransform };