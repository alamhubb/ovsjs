import {SlimeCstToAst} from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import {
  type SlimeClassDeclaration,
  type SlimeClassBody,
  type SlimeVariableDeclaration,
  type SlimeIdentifier,
  type SlimeStatement,
  type SlimeDeclaration,
  type SlimeExpression,
  type SlimeProgram,
  type SlimeModuleDeclaration,
  type SlimePropertyDefinition,
  type SlimeMethodDefinition,
  type SlimeFunctionExpression
} from "slime-ast/src/SlimeESTree.ts";
import SlimeAstUtil from "slime-ast/src/SlimeNodeCreate.ts";
import SlimeTokenCreate from "slime-ast/src/SlimeTokenCreate.ts";
import ObjectScriptParser from "../parser/ObjectScriptParser.ts";
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts";

// 简单的 UUID 生成函数
let uuidCounter = 0;
function generateUUID(): string {
  return `${Date.now().toString(36)}_${(uuidCounter++).toString(36)}`;
}

/**
 * 转换结果接口
 * 包含 AST 和元数据
 */
export interface TransformResult {
  ast: SlimeProgram
  meta: {
    /** 是否需要导入 $osRuntime */
    needsOsRuntime: boolean
  }
}

export function checkCstName(cst: SubhutiCst, cstName: string) {
  if (cst.name !== cstName) {
    throw new Error(`Expected CST name '${cstName}', but got '${cst.name}'`)
  }
  return cstName
}

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
export class ObjectCstToSlimeAst extends SlimeCstToAst {
  /** 是否需要导入 $osRuntime（用于多继承） */
  private _needsOsRuntime = false

  /**
   * 重写 toProgram 以支持 ObjectDeclaration
   *
   * 因为一个 ObjectDeclaration 会生成两个 AST 节点（class + const），
   * 所以需要在这里展平处理
   *
   * @returns TransformResult 包含 AST 和元数据
   */
  toProgram(cst: SubhutiCst): TransformResult {
    // 重置状态
    this._needsOsRuntime = false

    // 调用父类方法获取基础 Program
    const program = super.toProgram(cst)

    // 展平：将可能的双节点数组展开（来自 ObjectDeclaration）
    const flatBody: Array<SlimeStatement | SlimeModuleDeclaration> = []
    for (const item of program.body) {
      if (Array.isArray(item)) {
        // 如果是数组（来自 ObjectDeclaration），展平
        flatBody.push(...item)
      } else {
        flatBody.push(item)
      }
    }

    // 如果需要 $osRuntime，在头部注入 import 语句
    if (this._needsOsRuntime) {
      const importDecl = this.createOsRuntimeImport()
      flatBody.unshift(importDecl)
    }

    program.body = flatBody

    return {
      ast: program,
      meta: {
        needsOsRuntime: this._needsOsRuntime
      }
    }
  }

  /**
   * 创建 $osRuntime 的 import 声明
   * import { $osRuntime } from 'object-script/runtime'
   */
  private createOsRuntimeImport(): SlimeModuleDeclaration {
    // 创建 ImportSpecifier: $osRuntime
    const osRuntimeId = SlimeAstUtil.createIdentifier('$osRuntime')
    const specifier = SlimeAstUtil.createImportSpecifier(osRuntimeId, osRuntimeId)
    const specifierItem = SlimeAstUtil.createImportSpecifierItem(specifier)

    // 创建 source: 'object-script/runtime'
    const source = SlimeAstUtil.createStringLiteral('object-script/runtime')

    // 创建 ImportDeclaration
    return SlimeAstUtil.createImportDeclaration([specifierItem], source)
  }

  /**
   * 重写 createDeclarationAst 以支持 ObjectDeclaration
   *
   * 注意：这里返回 any 类型，因为 ObjectDeclaration 需要返回数组（两个节点）
   */
  createDeclarationAst(cst: SubhutiCst): any {
    // 首先检查第一个子节点
    const first = cst.children?.[0]
    if (!first) {
      return super.createDeclarationAst(cst)
    }

    // 检查是否是 ObjectDeclaration
    if (first.name === ObjectScriptParser.prototype.ObjectDeclaration.name) {
      return this.createObjectDeclarationAst(first)
    }

    // 其他声明类型交给父类处理
    return super.createDeclarationAst(cst)
  }

  // ============================================
  // 多继承支持
  // ============================================

  /**
   * 重写 createClassDeclarationAst 以支持多继承
   *
   * 检测到多继承时，生成调用 $osRuntime.initMultipleInheritance 的代码
   */
  createClassDeclarationAst(cst: SubhutiCst): SlimeClassDeclaration {
    // 先调用父类方法获取基础 AST
    const classDecl = super.createClassDeclarationAst(cst)

    // 查找 ClassTail 中的 ClassHeritage
    const classTailCst = cst.children?.find(
      child => child.name === SlimeParser.prototype.ClassTail?.name || child.name === 'ClassTail'
    )
    if (!classTailCst) {
      return classDecl
    }

    const classHeritageCst = classTailCst.children?.find(
      child => child.name === ObjectScriptParser.prototype.ClassHeritage.name || child.name === 'ClassHeritage'
    )
    if (!classHeritageCst) {
      return classDecl
    }

    // 检查是否是多继承（有逗号分隔的多个父类）
    const parentClasses = this.extractMultipleParentClasses(classHeritageCst)
    if (parentClasses.length <= 1) {
      // 单继承，使用父类处理
      return classDecl
    }

    // 多继承：生成新的类声明
    return this.transformToMultipleInheritance(classDecl, parentClasses, cst.loc)
  }

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
  extractMultipleParentClasses(cst: SubhutiCst): SlimeExpression[] {
    const parentClasses: SlimeExpression[] = []
    const parentNames: string[] = []  // 用于检测重复

    for (const child of cst.children || []) {
      // 跳过 Extends token
      if (child.name === 'Extends' || child.value === 'extends') continue
      // 跳过 Comma token
      if (child.name === 'Comma' || child.value === ',') continue

      // LeftHandSideExpression 是父类
      if (child.name === SlimeParser.prototype.LeftHandSideExpression?.name ||
          child.name === 'LeftHandSideExpression') {
        const expr = this.createLeftHandSideExpressionAst(child)

        // 检测重复继承
        const parentName = this.getExpressionName(expr)
        if (parentName && parentNames.includes(parentName)) {
          const loc = child.loc || cst.loc
          throw new Error(
            `Duplicate parent class '${parentName}' in extends clause` +
            (loc ? ` at line ${loc.start?.line}, column ${loc.start?.column}` : '')
          )
        }
        if (parentName) {
          parentNames.push(parentName)
        }

        parentClasses.push(expr)
      }
    }

    return parentClasses
  }

  /**
   * 从表达式中提取名称（用于重复检测）
   */
  private getExpressionName(expr: SlimeExpression): string | null {
    if (expr.type === 'Identifier') {
      return (expr as any).name
    }
    // 处理 MemberExpression 如 Namespace.Class
    if (expr.type === 'MemberExpression') {
      const memberExpr = expr as any
      const objectName = this.getExpressionName(memberExpr.object)
      const propName = memberExpr.property?.name
      if (objectName && propName) {
        return `${objectName}.${propName}`
      }
    }
    return null
  }

  /**
   * 将多继承类转换为运行时委托模式
   *
   * 输入：class A extends B, C { foo() {} }
   * 输出：class A { constructor(...args) { $osRuntime.initMultipleInheritance(this, [B, C], args) } foo() {} }
   */
  transformToMultipleInheritance(
    originalClass: SlimeClassDeclaration,
    parentClasses: SlimeExpression[],
    loc: any
  ): SlimeClassDeclaration {
    // 1. 移除 superClass（不再使用原生继承）
    const newClass: SlimeClassDeclaration = {
      ...originalClass,
      superClass: null
    }

    // 2. 查找或创建构造函数
    const existingConstructor = this.findConstructor(originalClass.body)
    const newConstructor = this.createMultiInheritanceConstructor(parentClasses, existingConstructor, loc)

    // 3. 转换所有方法体中的 super 表达式
    const transformedBodyElements = (originalClass.body.body || []).map(element => {
      if (element.type === 'MethodDefinition' && element.kind !== 'constructor') {
        return this.transformMethodDefinition(element as SlimeMethodDefinition, loc)
      }
      return element
    })

    // 4. 替换或添加构造函数
    const newBody: SlimeClassBody = {
      ...originalClass.body,
      body: this.replaceOrAddConstructor(transformedBodyElements, newConstructor)
    }

    newClass.body = newBody
    return newClass
  }

  /**
   * 转换方法定义中的 super 表达式
   */
  transformMethodDefinition(method: SlimeMethodDefinition, loc: any): SlimeMethodDefinition {
    const funcExpr = method.value as SlimeFunctionExpression
    if (!funcExpr?.body?.body) return method

    const transformedStatements = funcExpr.body.body.map(stmt =>
      this.transformStatementSuperExpressions(stmt, loc)
    )

    return {
      ...method,
      value: {
        ...funcExpr,
        body: {
          ...funcExpr.body,
          body: transformedStatements
        }
      }
    } as SlimeMethodDefinition
  }

  /**
   * 递归转换语句中的 super 表达式
   */
  transformStatementSuperExpressions(stmt: SlimeStatement, loc: any): SlimeStatement {
    if (!stmt) return stmt

    // 表达式语句
    if (stmt.type === 'ExpressionStatement') {
      const exprStmt = stmt as any
      return {
        ...exprStmt,
        expression: this.transformExpression(exprStmt.expression, loc)
      }
    }

    // return 语句
    if (stmt.type === 'ReturnStatement') {
      const retStmt = stmt as any
      if (retStmt.argument) {
        return {
          ...retStmt,
          argument: this.transformExpression(retStmt.argument, loc)
        }
      }
    }

    // if 语句
    if (stmt.type === 'IfStatement') {
      const ifStmt = stmt as any
      return {
        ...ifStmt,
        test: this.transformExpression(ifStmt.test, loc),
        consequent: this.transformStatementSuperExpressions(ifStmt.consequent, loc),
        alternate: ifStmt.alternate ? this.transformStatementSuperExpressions(ifStmt.alternate, loc) : null
      }
    }

    // 块语句
    if (stmt.type === 'BlockStatement') {
      const blockStmt = stmt as any
      return {
        ...blockStmt,
        body: blockStmt.body.map((s: SlimeStatement) => this.transformStatementSuperExpressions(s, loc))
      }
    }

    // 变量声明
    if (stmt.type === 'VariableDeclaration') {
      const varDecl = stmt as any
      return {
        ...varDecl,
        declarations: varDecl.declarations.map((decl: any) => ({
          ...decl,
          init: decl.init ? this.transformExpression(decl.init, loc) : null
        }))
      }
    }

    return stmt
  }

  /**
   * 递归转换表达式中的 super 表达式
   */
  transformExpression(expr: any, loc: any): any {
    if (!expr) return expr

    // 赋值表达式: super.name = x 或 super.B.name = x
    if (expr.type === 'AssignmentExpression') {
      const left = expr.left
      if (this.isSuperMemberExpression(left)) {
        // super.name = x → $osRuntime.superSet(this, 'name', x)
        // super.B.name = x → $osRuntime.superSetOn(this, B, 'name', x)
        return this.transformSuperAssignment(expr, loc)
      }
      return {
        ...expr,
        left: this.transformExpression(expr.left, loc),
        right: this.transformExpression(expr.right, loc)
      }
    }

    // 调用表达式: super.foo() 或 super.B.foo()
    if (expr.type === 'CallExpression') {
      const callee = expr.callee
      if (this.isSuperMemberExpression(callee)) {
        // super.foo() → $osRuntime.superCall(this, 'foo', [...args])
        // super.B.foo() → $osRuntime.superCallOn(this, B, 'foo', [...args])
        return this.transformSuperCall(expr, loc)
      }
      return {
        ...expr,
        callee: this.transformExpression(expr.callee, loc),
        arguments: expr.arguments?.map((arg: any) => ({
          ...arg,
          argument: arg.argument ? this.transformExpression(arg.argument, loc) : undefined
        }))
      }
    }

    // 成员表达式: super.name 或 super.B.name（非赋值、非调用）
    if (expr.type === 'MemberExpression') {
      if (this.isSuperMemberExpression(expr)) {
        // super.name → $osRuntime.superGet(this, 'name')
        // super.B.name → $osRuntime.superGetOn(this, B, 'name')
        return this.transformSuperGet(expr, loc)
      }
      return {
        ...expr,
        object: this.transformExpression(expr.object, loc),
        property: this.transformExpression(expr.property, loc)
      }
    }

    // 二元表达式
    if (expr.type === 'BinaryExpression' || expr.type === 'LogicalExpression') {
      return {
        ...expr,
        left: this.transformExpression(expr.left, loc),
        right: this.transformExpression(expr.right, loc)
      }
    }

    // 条件表达式
    if (expr.type === 'ConditionalExpression') {
      return {
        ...expr,
        test: this.transformExpression(expr.test, loc),
        consequent: this.transformExpression(expr.consequent, loc),
        alternate: this.transformExpression(expr.alternate, loc)
      }
    }

    return expr
  }

  /**
   * 检查是否是 super 成员表达式
   * super.xxx 或 super.B.xxx
   */
  isSuperMemberExpression(expr: any): boolean {
    if (expr?.type !== 'MemberExpression') return false
    // super.xxx
    if (expr.object?.type === 'Super') return true
    // super.B.xxx
    if (expr.object?.type === 'MemberExpression' && expr.object.object?.type === 'Super') return true
    return false
  }

  /**
   * 判断是否是 super.B.xxx 形式（显式指定父类）
   */
  isExplicitSuperExpression(expr: any): boolean {
    return expr?.type === 'MemberExpression' &&
           expr.object?.type === 'MemberExpression' &&
           expr.object.object?.type === 'Super'
  }

  /**
   * 转换 super.foo() 或 super.B.foo() 为运行时调用
   */
  transformSuperCall(expr: any, loc: any): any {
    this._needsOsRuntime = true
    const callee = expr.callee
    const args = this.extractCallArguments(expr.arguments || [])

    if (this.isExplicitSuperExpression(callee)) {
      // super.B.foo() → $osRuntime.superCallOn(this, B, 'foo', [...args])
      const parentClassName = callee.object.property.name
      const methodName = callee.property.name
      return this.createRuntimeCall('superCallOn', [
        SlimeAstUtil.createThisExpression(loc),
        SlimeAstUtil.createIdentifier(parentClassName, loc),
        SlimeAstUtil.createStringLiteral(methodName, loc),
        this.createArrayExpression(args, loc)
      ], loc)
    } else {
      // super.foo() → $osRuntime.superCall(this, 'foo', [...args])
      const methodName = callee.property.name
      return this.createRuntimeCall('superCall', [
        SlimeAstUtil.createThisExpression(loc),
        SlimeAstUtil.createStringLiteral(methodName, loc),
        this.createArrayExpression(args, loc)
      ], loc)
    }
  }

  /**
   * 转换 super.name 或 super.B.name 为运行时调用
   */
  transformSuperGet(expr: any, loc: any): any {
    this._needsOsRuntime = true

    if (this.isExplicitSuperExpression(expr)) {
      // super.B.name → $osRuntime.superGetOn(this, B, 'name')
      const parentClassName = expr.object.property.name
      const propName = expr.property.name
      return this.createRuntimeCall('superGetOn', [
        SlimeAstUtil.createThisExpression(loc),
        SlimeAstUtil.createIdentifier(parentClassName, loc),
        SlimeAstUtil.createStringLiteral(propName, loc)
      ], loc)
    } else {
      // super.name → $osRuntime.superGet(this, 'name')
      const propName = expr.property.name
      return this.createRuntimeCall('superGet', [
        SlimeAstUtil.createThisExpression(loc),
        SlimeAstUtil.createStringLiteral(propName, loc)
      ], loc)
    }
  }

  /**
   * 转换 super.name = x 或 super.B.name = x 为运行时调用
   */
  transformSuperAssignment(expr: any, loc: any): any {
    this._needsOsRuntime = true
    const left = expr.left
    const right = this.transformExpression(expr.right, loc)

    if (this.isExplicitSuperExpression(left)) {
      // super.B.name = x → $osRuntime.superSetOn(this, B, 'name', x)
      const parentClassName = left.object.property.name
      const propName = left.property.name
      return this.createRuntimeCall('superSetOn', [
        SlimeAstUtil.createThisExpression(loc),
        SlimeAstUtil.createIdentifier(parentClassName, loc),
        SlimeAstUtil.createStringLiteral(propName, loc),
        right
      ], loc)
    } else {
      // super.name = x → $osRuntime.superSet(this, 'name', x)
      const propName = left.property.name
      return this.createRuntimeCall('superSet', [
        SlimeAstUtil.createThisExpression(loc),
        SlimeAstUtil.createStringLiteral(propName, loc),
        right
      ], loc)
    }
  }

  /**
   * 创建 $osRuntime.methodName(...args) 调用表达式
   */
  createRuntimeCall(methodName: string, args: any[], loc: any): any {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: SlimeAstUtil.createIdentifier('$osRuntime', loc),
        property: SlimeAstUtil.createIdentifier(methodName, loc),
        computed: false,
        optional: false,
        loc
      },
      arguments: args.map((arg, index) => ({
        argument: arg,
        commaToken: index < args.length - 1 ? SlimeTokenCreate.createCommaToken(loc) : undefined
      })),
      loc
    }
  }

  /**
   * 从调用参数中提取实际的表达式
   */
  extractCallArguments(args: any[]): any[] {
    return args.map((arg: any) => {
      if (arg.argument !== undefined) return arg.argument
      if (arg.element !== undefined) return arg.element
      return arg
    })
  }

  /**
   * 创建数组表达式
   */
  createArrayExpression(elements: any[], loc: any): any {
    return {
      type: 'ArrayExpression',
      elements: elements.map((el, index) => ({
        element: el,
        commaToken: index < elements.length - 1 ? SlimeTokenCreate.createCommaToken(loc) : undefined
      })),
      loc
    }
  }

  /**
   * 在类体中查找构造函数
   */
  findConstructor(classBody: SlimeClassBody): SlimeMethodDefinition | null {
    for (const element of classBody.body || []) {
      if (element.type === 'MethodDefinition' && element.kind === 'constructor') {
        return element as SlimeMethodDefinition
      }
    }
    return null
  }

  /**
   * 创建多继承的构造函数
   *
   * 如果没有用户定义的构造函数：生成默认无参调用所有父类
   * 如果有用户定义的构造函数：转换 super.ClassName(args) 调用
   */
  createMultiInheritanceConstructor(
    parentClasses: SlimeExpression[],
    existingConstructor: SlimeMethodDefinition | null,
    loc: any
  ): SlimeMethodDefinition {
    let bodyStatements: SlimeStatement[] = []
    let params: any[] = []

    if (existingConstructor) {
      // 有用户定义的构造函数：转换 super.ClassName(args) 调用
      const existingValue = existingConstructor.value as SlimeFunctionExpression
      params = existingValue?.params || []

      const existingBody = existingValue?.body
      if (existingBody && existingBody.body) {
        // 转换所有语句，将 super.ClassName(args) 转换为 $osRuntime.initParent()
        bodyStatements = existingBody.body.map(stmt => this.transformSuperClassCall(stmt, loc))
          .filter(stmt => stmt !== null) as SlimeStatement[]
      }
    } else {
      // 没有用户定义的构造函数：生成默认无参调用所有父类
      bodyStatements = parentClasses.map(parentExpr =>
        this.createInitParentCall(parentExpr, [], loc)
      )
    }

    // 创建构造函数 AST
    const constructor: SlimeMethodDefinition = {
      type: 'MethodDefinition' as any,
      key: SlimeAstUtil.createIdentifier('constructor', loc),
      value: {
        type: 'FunctionExpression' as any,
        id: null,
        params: params,
        body: {
          type: 'BlockStatement' as any,
          body: bodyStatements,
          loc
        },
        generator: false,
        async: false,
        loc
      } as SlimeFunctionExpression,
      kind: 'constructor',
      computed: false,
      static: false,
      loc
    }

    return constructor
  }

  /**
   * 转换 super.ClassName(args) 调用为 $osRuntime.initParent(this, ClassName, [args])
   *
   * 如果不是 super.ClassName() 调用，返回原语句
   * 如果是 super() 调用（单继承），返回 null 过滤掉
   */
  transformSuperClassCall(stmt: SlimeStatement, loc: any): SlimeStatement | null {
    if (stmt.type !== 'ExpressionStatement') return stmt

    const expr = (stmt as any).expression
    if (expr?.type !== 'CallExpression') return stmt

    const callee = expr.callee

    // 检查是否是 super() 调用（单继承，过滤掉）
    if (callee?.type === 'Super') {
      return null
    }

    // 检查是否是 super.ClassName(args) 调用
    if (callee?.type === 'MemberExpression' &&
        callee.object?.type === 'Super' &&
        callee.property?.type === 'Identifier') {

      const className = callee.property.name
      const args = expr.arguments || []

      // 转换为 $osRuntime.initParent(this, ClassName, [args])
      return this.createInitParentCall(
        SlimeAstUtil.createIdentifier(className, loc),
        args,
        loc
      )
    }

    return stmt
  }

  /**
   * 创建 $osRuntime.initParent(this, ClassName, [args]) 调用语句
   */
  createInitParentCall(parentExpr: SlimeExpression, args: any[], loc: any): SlimeStatement {
    // 标记需要导入 $osRuntime
    this._needsOsRuntime = true

    // 将参数包装成数组元素格式
    // 注意：args 可能来自不同来源：
    // 1. SlimeCallExpression.arguments: { argument: SlimeExpression, commaToken? }
    // 2. SlimeArrayExpression.elements: { element: SlimeExpression, commaToken? }
    // 3. 直接的 AST 节点数组
    const arrayElements = args.map((arg: any, index: number) => {
      let actualArg: any
      if (arg.argument !== undefined) {
        // 来自 CallExpression.arguments
        actualArg = arg.argument
      } else if (arg.element !== undefined) {
        // 来自 ArrayExpression.elements
        actualArg = arg.element
      } else {
        // 直接的 AST 节点
        actualArg = arg
      }
      return {
        element: actualArg,
        commaToken: index < args.length - 1 ? { value: ',' } : undefined
      }
    })

    return {
      type: 'ExpressionStatement' as any,
      expression: {
        type: 'CallExpression' as any,
        callee: {
          type: 'MemberExpression' as any,
          object: SlimeAstUtil.createIdentifier('$osRuntime', loc),
          property: SlimeAstUtil.createIdentifier('initParent', loc),
          computed: false,
          optional: false,
          loc
        },
        arguments: [
          // this
          { type: 'ThisExpression' as any, loc },
          // ClassName
          parentExpr,
          // [args]
          {
            type: 'ArrayExpression' as any,
            elements: arrayElements,
            loc
          }
        ],
        optional: false,
        loc
      },
      loc
    } as any
  }

  /**
   * 检查语句是否是 super() 调用
   */
  isSuperCall(stmt: SlimeStatement): boolean {
    if (stmt.type !== 'ExpressionStatement') return false
    const expr = (stmt as any).expression
    if (expr?.type !== 'CallExpression') return false
    return expr.callee?.type === 'Super'
  }

  /**
   * 在类体中替换或添加构造函数
   */
  replaceOrAddConstructor(body: any[], newConstructor: SlimeMethodDefinition): any[] {
    const result: any[] = []
    let found = false

    for (const element of body || []) {
      if (element.type === 'MethodDefinition' && element.kind === 'constructor') {
        result.push(newConstructor)
        found = true
      } else {
        result.push(element)
      }
    }

    if (!found) {
      // 构造函数放在最前面
      result.unshift(newConstructor)
    }

    return result
  }

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
  createObjectDeclarationAst(cst: SubhutiCst): [SlimeClassDeclaration, SlimeVariableDeclaration] {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectDeclaration.name)
    
    // 1. 提取对象名（BindingIdentifier）
    // BindingIdentifier 本身是一个规则，其children[0]是Identifier token
    const nameNode = cst.children?.find(child => 
      child.name === 'BindingIdentifier'
    )
    if (!nameNode) {
      throw new Error('ObjectDeclaration: 缺少对象名')
    }
    // BindingIdentifier的第一个子节点是Identifier token
    const identifierToken = nameNode.children?.[0]
    if (!identifierToken) {
      throw new Error('ObjectDeclaration: BindingIdentifier没有Identifier token')
    }
    const objectName = identifierToken.value || identifierToken.name
    
    // 2. 生成临时类名（使用 UUID）
    const uuid = generateUUID()
    const tempClassName = `$$OsClass${objectName}_${uuid}`
    const tempClassId = SlimeAstUtil.createIdentifier(tempClassName, cst.loc)
    
    // 3. 提取继承信息（ObjectHeritage）
    const heritageNode = cst.children?.find(child => 
      child.name === ObjectScriptParser.prototype.ObjectHeritage.name
    )
    let superClass: SlimeExpression | undefined = undefined
    if (heritageNode) {
      // ObjectHeritage: ExtendsTok + BindingIdentifier
      const superClassNode = heritageNode.children?.find(child => 
        child.name === 'BindingIdentifier'
      )
      if (superClassNode) {
        // BindingIdentifier的第一个子节点是Identifier token
        const superIdToken = superClassNode.children?.[0]
        if (superIdToken) {
          const superClassName = superIdToken.value || superIdToken.name
          superClass = SlimeAstUtil.createIdentifier(superClassName, superIdToken.loc)
        }
      }
    }
    
    // 4. 提取对象体（ObjectBody）
    const bodyNode = cst.children?.find(child => 
      child.name === ObjectScriptParser.prototype.ObjectBody.name
    )
    const classBody = bodyNode 
      ? this.createObjectBodyAst(bodyNode)
      : this.createEmptyClassBody()
    
    // 5. 创建 ClassDeclaration AST
    const classDecl: SlimeClassDeclaration = {
      type: 'ClassDeclaration' as any,
      id: tempClassId,
      superClass: superClass,
      body: classBody,
      loc: cst.loc
    }
    
    // 6. 创建 VariableDeclaration AST: const objectName = new tempClassName()
    const varDecl = SlimeAstUtil.createVariableDeclaration(
      SlimeTokenCreate.createConstToken(cst.loc),
      [
        SlimeAstUtil.createVariableDeclarator(
          SlimeAstUtil.createIdentifier(objectName, cst.loc),
          SlimeTokenCreate.createAssignmentOperatorToken('=', cst.loc),
          // new tempClassName()
          {
            type: 'NewExpression',
            callee: SlimeAstUtil.createIdentifier(tempClassName, cst.loc),
            arguments: [], // 无参数
            loc: cst.loc
          } as any
        )
      ],
      cst.loc
    )
    
    // 7. 返回两个 AST 节点
    return [classDecl, varDecl]
  }

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
  createObjectBodyAst(cst: SubhutiCst): SlimeClassBody {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectBody.name)
    
    // 查找 ObjectElementList
    const elementListNode = cst.children?.find(child => 
      child.name === ObjectScriptParser.prototype.ObjectElementList.name
    )
    
    if (!elementListNode) {
      return this.createEmptyClassBody()
    }
    
    // 转换所有元素
    const elements = this.createObjectElementListAst(elementListNode)
    
    return {
      type: 'ClassBody' as any,
      body: elements,
      loc: cst.loc
    }
  }

  /**
   * 转换 ObjectElementList 为 ClassBody 元素数组
   */
  createObjectElementListAst(cst: SubhutiCst): Array<any> {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectElementList.name)
    
    const elements: Array<any> = []
    
    // 遍历所有 ObjectElement
    for (const child of cst.children || []) {
      if (child.name === ObjectScriptParser.prototype.ObjectElement.name) {
        const element = this.createObjectElementAst(child)
        if (element) {
          elements.push(element)
        }
      }
    }
    
    return elements
  }

  /**
   * 转换 ObjectElement（单个属性或方法）
   * 
   * ObjectElement 可以是：
   * - MethodDefinition（方法）
   * - ObjectPropertyAssignment（属性赋值）
   * - EmptySemicolon（空分号，忽略）
   */
  createObjectElementAst(cst: SubhutiCst): any {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectElement.name)
    
    const child = cst.children?.[0]
    if (!child) {
      return null
    }
    
    // 方法定义（继承自 ES6）
    if (child.name === 'MethodDefinition') {
      // createMethodDefinitionAst 需要两个参数：(staticCst, cst)
      // 第一个参数是 static 关键字节点（object不支持static，传null）
      // 第二个参数是 MethodDefinition CST 节点
      return this.createMethodDefinitionAst(null, child)
    }
    
    // 属性赋值（ObjectScript 特有）
    if (child.name === ObjectScriptParser.prototype.ObjectPropertyAssignment.name) {
      return this.createObjectPropertyAssignmentAst(child)
    }
    
    // EmptySemicolon（忽略）
    if (child.name === 'EmptySemicolon') {
      return null
    }
    
    throw new Error(`ObjectElement: 不支持的子节点类型 '${child.name}'`)
  }

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
  createObjectPropertyAssignmentAst(cst: SubhutiCst): SlimePropertyDefinition {
    checkCstName(cst, ObjectScriptParser.prototype.ObjectPropertyAssignment.name)
    
    // 1. 提取属性名
    const nameNode = cst.children?.find(child => 
      child.name === 'BindingIdentifier'
    )
    if (!nameNode) {
      throw new Error('ObjectPropertyAssignment: 缺少属性名')
    }
    // BindingIdentifier的第一个子节点是Identifier token
    const keyToken = nameNode.children?.[0]
    if (!keyToken) {
      throw new Error('ObjectPropertyAssignment: BindingIdentifier没有Identifier token')
    }
    const keyName = keyToken.value || keyToken.name
    const key = SlimeAstUtil.createIdentifier(keyName, keyToken.loc)
    
    // 2. 提取属性值
    const valueNode = cst.children?.find(child => 
      child.name === 'AssignmentExpression'
    )
    if (!valueNode) {
      throw new Error('ObjectPropertyAssignment: 缺少属性值')
    }
    const value = this.createAssignmentExpressionAst(valueNode)
    
    // 3. 创建 PropertyDefinition
    return SlimeAstUtil.createPropertyDefinition(key, value, false)
  }

  /**
   * 创建空的 ClassBody
   */
  createEmptyClassBody(): SlimeClassBody {
    return {
      type: 'ClassBody' as any,
      body: [],
      loc: undefined
    }
  }
}

// 导出单例实例
const ObjectCstToSlimeAstUtil = new ObjectCstToSlimeAst()
export default ObjectCstToSlimeAstUtil

