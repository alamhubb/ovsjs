import {SlimeCstToAst} from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import {
  type SlimeCallExpression,
  type SlimeExpression,
  type SlimeExpressionStatement,
  type SlimeModuleDeclaration,
  type SlimeProgram,
  SlimeProgramSourceType,
  type SlimeStatement,
  type SlimeIdentifier,
  SlimeVariableDeclarationKindValue
} from "slime-ast/src/SlimeAstInterface.ts";
import OvsParser from "../parser/OvsParser.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";

export function checkCstName(cst: SubhutiCst, cstName: string) {
  if (cst.name !== cstName) {
    console.log(cst)
    throwNewError(cst.name)
  }
  return cstName
}

export function throwNewError(errorMsg: string = 'syntax error') {
  throw new Error(errorMsg)
}

export class OvsCstToSlimeAst extends SlimeCstToAst {
  /**
   * 计数器：标记当前是否在 OvsRenderDomViewDeclaration 内部
   * 用于判断 ExpressionStatement 是否需要转换为 children.push()
   *
   * 工作原理：
   * - 进入 OvsRenderDomViewDeclaration 时 +1
   * - 退出时 -1
   * - 当 > 0 时，表示在 OvsRenderDomViewDeclaration 内部
   * - 支持嵌套：外层 div { 内层 span { } }
   */
  private ovsRenderDomViewDepth = 0;

  /**
   * 当前view的临时attrs变量名栈（支持嵌套）,必须使用，不使用而是使用ovsview中循环的方法的话解决不了 if for 中使用此方式的问题
   */
  private attrsVarNameStack: Array<string | null> = [];

  /**
   * 将 CST 转换为 Program AST
   *
   * 职责：纯语法转换（OVS 语法 → JavaScript AST）
   * 不包含：
   * - import 添加（移到外层 ensureOvsAPIImport - 导入 createReactiveVNode）
   * - 组件包装（移到外层 wrapAsVueComponent）
   *
   * @param cst Program CST 节点
   * @returns Program AST
   */
  toProgram(cst: SubhutiCst): SlimeProgram {
    checkCstName(cst, Es6Parser.prototype.Program.name);

    // 获取第一个子节点（ModuleItemList 或 StatementList）
    const first = cst.children?.[0]
    if (!first) {
      throw new Error('Program has no children')
    }

    // 根据子节点类型转换为 AST
    let body: Array<SlimeStatement | SlimeModuleDeclaration> = []
    if (first.name === Es6Parser.prototype.ModuleItemList.name) {
      // 模块代码（包含 import/export）
      body = this.createModuleItemListAst(first)
    } else if (first.name === Es6Parser.prototype.StatementList.name) {
      // 脚本代码（不包含 import/export）
      body = this.createStatementListAst(first)
    }

    // 创建 Program AST
    const program = SlimeAstUtil.createProgram(body, SlimeProgramSourceType.module)
    program.loc = cst.loc

    return program
  }


  createDeclarationAst(cst: SubhutiCst): any {
    // Declaration -> OvsViewDeclaration | VariableDeclaration | FunctionDeclaration | ...
    // 检查第一个child是否是 OvsViewDeclaration
    const first = cst.children?.[0]
    if (first && first.name === OvsParser.prototype.OvsViewDeclaration.name) {
      return this.createOvsViewDeclarationAst(first)
    }
    return super.createDeclarationAst(cst)
  }

  /**
   * 转换 OvsViewDeclaration 为函数声明
   *
   * 输入：ovsView parent1 ({attrs}) : div { ... }
   * 输出：function parent1({attrs}) { return h('div', ...) }
   */
  createOvsViewDeclarationAst(cst: SubhutiCst): any {
    checkCstName(cst, OvsParser.prototype.OvsViewDeclaration.name)

    // 结构：OvsViewToken, ovsRenderDomClassDeclaration, OvsRenderDomViewDeclaration
    const children = cst.children || []

    // 1. 从 ovsRenderDomClassDeclaration 中提取组件名和参数
    const classDeclCst = children[1]
    if (!classDeclCst) {
      throw new Error('OvsViewDeclaration: missing class declaration')
    }

    // ovsRenderDomClassDeclaration 的结构：Identifier, FunctionFormalParameters?, Colon
    const classDeclChildren = classDeclCst.children || []

    // 组件名
    const componentNameCst = classDeclChildren[0]
    if (!componentNameCst) {
      throw new Error('OvsViewDeclaration: missing component name')
    }
    const componentName = this.createIdentifierAst(componentNameCst)

    // 第一个参数固定为 props（不再使用用户声明的参数）
    const propsParam = SlimeAstUtil.createIdentifier('props')
    
    // 第二个参数 child（用于接收 children）
    const childParam = SlimeAstUtil.createIdentifier('child')

    // 组件参数：(props, child)
    const params = SlimeAstUtil.createFunctionParams(
      SlimeAstUtil.createLParen(cst.loc),
      SlimeAstUtil.createRParen(cst.loc),
      cst.loc,
      [propsParam, childParam]
    )

    // 2. 视图内容（第3个：OvsRenderDomViewDeclaration）
    const viewCst = children[2]
    if (!viewCst) {
      throw new Error('OvsViewDeclaration: missing view declaration')
    }

    // 转换视图为表达式（IIFE或h调用）
    const viewExpression = this.createOvsRenderDomViewDeclarationAst(viewCst)

    // 根据视图类型展开到函数体（内部 children 数组不会与参数 child 冲突）
    let functionBodyStatements: SlimeStatement[] = []

    if (viewExpression.type === SlimeAstType.CallExpression) {
      const iife = viewExpression as SlimeCallExpression
      const iifeFunc = iife.callee

      if (iifeFunc.type === 'FunctionExpression') {
        // 复杂视图的 IIFE：(function() { const children = []; ...; return h(...) })()
        // 直接展开 IIFE 内容到函数体（参数是 child，内部是 children，不冲突）
        const iifeBody = (iifeFunc as any).body.body as SlimeStatement[]

        // 去掉最后一条 return 语句，修改为 return h(...)
        const statementsWithoutReturn = iifeBody.slice(0, -1)
        const lastReturn = iifeBody[iifeBody.length - 1]

        if (lastReturn && lastReturn.type === SlimeAstType.ReturnStatement) {
          const returnExpr = (lastReturn as any).argument
          functionBodyStatements = [
            ...statementsWithoutReturn,
            SlimeAstUtil.createReturnStatement(returnExpr)
          ]
        } else {
          functionBodyStatements = iifeBody
        }
      } else {
        // 简单视图的 h 调用：h('div', {}, [...])
        functionBodyStatements = [
          SlimeAstUtil.createReturnStatement(viewExpression)
        ]
      }
    } else {
      // 其他类型，直接 return
      functionBodyStatements = [
        SlimeAstUtil.createReturnStatement(viewExpression)
      ]
    }

    // 创建函数体
    const functionBody = SlimeAstUtil.createBlockStatement(
      { type: 'LBrace', value: '{', loc: cst.loc } as any,
      { type: 'RBrace', value: '}', loc: cst.loc } as any,
      functionBodyStatements,
      cst.loc
    )

    // 创建函数声明（手动构造AST节点）
    const functionDeclaration = {
      type: 'FunctionDeclaration',
      id: componentName,
      params: params,
      body: functionBody,
      generator: false,
      async: false,
      loc: cst.loc
    }

    return functionDeclaration
  }

  createExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = cst.name
    let left
    if (astName === OvsParser.prototype.RenderExpression.name) {
      // #{ expression } 渲染表达式
      left = this.createRenderExpressionAst(cst)
    } else if (astName === OvsParser.prototype.SlotDeclaration.name) {
      // slot{} 改为直接渲染 children
      left = this.createSlotDeclarationAst(cst)
    } else if (astName === OvsParser.prototype.OvsRenderFunction.name) {
      left = this.createOvsRenderDomViewDeclarationAst(cst)
    } else {
      left = super.createExpressionAst(cst)
    }
    return left
  }

  /**
   * 转换 #{ expression } 为表达式
   * 
   * 核心作用：标记这是需要渲染的表达式
   * 在 createExpressionStatementAst 中会被识别并生成 children.push()
   */
  createRenderExpressionAst(cst: SubhutiCst): SlimeExpression {
    // RenderExpression 结构：Hash, LBrace, Expression, RBrace
    // 找到 Expression 节点
    const expressionCst = cst.children?.find(child => child.name === 'Expression')
    
    if (!expressionCst) {
      throw new Error('RenderExpression has no Expression child')
    }
    
    // 调用父类方法解析 Expression（父类会自动处理嵌套）
    const innerExpr = super.createExpressionAst(expressionCst)
    
    return innerExpr
  }

  /**
   * 转换 slot{} 为 child（渲染第二个参数）
   */
  createSlotDeclarationAst(cst: SubhutiCst): SlimeExpression {
    checkCstName(cst, OvsParser.prototype.SlotDeclaration.name)

    // slot{} → child（渲染第二个参数 child）
    const result: any = SlimeAstUtil.createIdentifier('child')
    return result
  }

  /**
   * 重写 ExpressionStatement 处理
   *
   * 核心逻辑（新版本 - 只有 OvsRenderFunction 和 RenderExpression 才渲染）：
   * - 检查 ovsRenderDomViewDepth 计数器
   * - 如果 > 0，说明在 OvsRenderDomViewDeclaration 内部
   * - 基于 CST 类型判断是否渲染：
   *   - OvsRenderFunction（h2 {}）：渲染
   *   - RenderExpression（#{ }）：渲染
   *   - 其他：保持原样（纯逻辑，不渲染）
   * - 赋值表达式（name = value）仍然特殊处理为三条语句
   *
   * 示例：
   * 输入：#{ 456 }    → children.push(456)  ✅ 渲染
   * 输入：h2 {}       → children.push(createReactiveVNode('h2', ...))  ✅ 渲染
   * 输入：func()      → func()              ✅ 纯逻辑
   */
  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement | any {
    const exprCst = cst.children?.[0]
    if (!exprCst) {
      throw new Error('ExpressionStatement has no expression')
    }

    // 检查 CST 类型，判断是否应该渲染
    // Expression 可能有多层嵌套，找到实际的表达式类型
    let actualCst = exprCst
    while (actualCst.name === 'Expression' && actualCst.children && actualCst.children.length > 0) {
      actualCst = actualCst.children[0]
    }
    
    // ⭐ 特殊处理：AssignmentExpression 可能包含 RenderExpression、SlotDeclaration 等
    // AssignmentExpression 的第一个子节点可能是这些特殊类型
    let isRenderExpression = false
    let isSlotDeclaration = false
    let isOvsRenderFunction = false
    
    if (actualCst.name === 'AssignmentExpression' && actualCst.children && actualCst.children.length > 0) {
      const firstChild = actualCst.children[0]
      isRenderExpression = firstChild.name === OvsParser.prototype.RenderExpression.name
      isSlotDeclaration = firstChild.name === OvsParser.prototype.SlotDeclaration.name
      isOvsRenderFunction = firstChild.name === OvsParser.prototype.OvsRenderFunction.name
      
      // 如果是特殊类型，使用第一个子节点作为 actualCst
      if (isRenderExpression || isSlotDeclaration || isOvsRenderFunction) {
        actualCst = firstChild
      }
    }

    const cstName = actualCst.name
    const isOvsRenderFunctionDirect = cstName === OvsParser.prototype.OvsRenderFunction.name
    const isRenderExpressionDirect = cstName === OvsParser.prototype.RenderExpression.name
    const isSlotDeclarationDirect = cstName === OvsParser.prototype.SlotDeclaration.name

    const expr = this.createExpressionAst(exprCst)

    // 如果在 OvsRenderDomViewDeclaration 内部
    if (this.ovsRenderDomViewDepth > 0) {
      // 检查是否是简单赋值表达式（name = value，且name未声明过）
      const isAssignment = expr.type === 'AssignmentExpression'
      const isEqualOp = (expr as any).operator === '='
      const isIdentifierLeft = (expr as any).left?.type === SlimeAstType.Identifier

      // 获取当前栈顶的 attrsVarName
      const currentAttrsVarName = this.attrsVarNameStack[this.attrsVarNameStack.length - 1]

      if (isAssignment && isEqualOp && isIdentifierLeft && currentAttrsVarName) {
        const varName = (expr.left as SlimeIdentifier).name
        const varValue = expr.right
        const loc = cst.loc

        // 生成三条语句：
        // 1. let name = value
        const varDeclaration = SlimeAstUtil.createVariableDeclaration(
          SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.let, loc),
          [
            SlimeAstUtil.createVariableDeclarator(
              SlimeAstUtil.createIdentifier(varName),
              SlimeAstUtil.createEqualOperator(loc),
              varValue
            )
          ],
          loc
        )

        // 2. temp$$attrs$$uuid.name = name
        const attrsAssignment = {
          type: SlimeAstType.ExpressionStatement,
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: SlimeAstUtil.createMemberExpression(
              SlimeAstUtil.createIdentifier(currentAttrsVarName),
              SlimeAstUtil.createDotOperator(loc),
              SlimeAstUtil.createIdentifier(varName)
            ),
            right: SlimeAstUtil.createIdentifier(varName),  // 使用声明的变量
            loc
          },
          loc
        }

        // 3. children.push(temp$$attrs$$uuid.name)
        const pushStatement = {
          type: SlimeAstType.ExpressionStatement,
          expression: SlimeAstUtil.createCallExpression(
            SlimeAstUtil.createMemberExpression(
              SlimeAstUtil.createIdentifier('children'),
              SlimeAstUtil.createDotOperator(loc),
              SlimeAstUtil.createIdentifier('push')
            ),
            [
              SlimeAstUtil.createMemberExpression(
                SlimeAstUtil.createIdentifier(currentAttrsVarName),
                SlimeAstUtil.createDotOperator(loc),
                SlimeAstUtil.createIdentifier(varName)
              )
            ]
          ),
          loc
        }

        // 返回三条语句数组（稍后会被展开）
        return [varDeclaration, attrsAssignment, pushStatement]
      }

      // 判断是否应该渲染（基于 CST 类型）
      const shouldRender = isOvsRenderFunctionDirect || isRenderExpressionDirect || isSlotDeclarationDirect || isOvsRenderFunction || isRenderExpression || isSlotDeclaration
      
      if (shouldRender) {
        // 生成 children.push(expr)
        const pushCall = SlimeAstUtil.createCallExpression(
          SlimeAstUtil.createMemberExpression(
            SlimeAstUtil.createIdentifier('children'),
            SlimeAstUtil.createDotOperator(cst.loc || undefined),
            SlimeAstUtil.createIdentifier('push')
          ),
          [expr]
        )

        return {
          type: SlimeAstType.ExpressionStatement,
          expression: pushCall,
          loc: cst.loc
        } as SlimeExpressionStatement
      }

      // 其他表达式：保持原样（不渲染）
      return super.createExpressionStatementAst(cst)
    } else {
      // 不在 OvsRenderDomViewDeclaration 内部，调用父类方法保持原样
      return super.createExpressionStatementAst(cst)
    }
  }

  /**
   * 转换 OvsRenderDomViewDeclaration 为表达式或 IIFE
   *
   * 转换流程：
   * 1. 进入时计数器 +1，生成唯一的attrs变量名并入栈
   * 2. 转换 StatementList（赋值表达式转为三条语句，其他表达式转为 children.push()）
   * 3. 判断是简单还是复杂情况：
   *    - 简单（只有表达式）：createReactiveVNode('div', {}, [children])  ⭐ 无 IIFE
   *    - 复杂（有语句）：IIFE包裹
   * 4. 退出时计数器 -1，弹出栈（用 try-finally 保证）
   *
   * 示例（简单）：
   * 输入：div { h1 { greeting } }
   * 输出：createReactiveVNode('div', {}, [
   *   createReactiveVNode('h1', {}, [greeting])
   * ])
   *
   * 示例（复杂，带attrs）：
   * 输入：div { let a = 1; name = a; 123 }
   * 输出：(function() {
   *   const children = []
   *   const temp$$attrs$$uuid = {}
   *   let a = 1
   *   let name = a
   *   temp$$attrs$$uuid.name = name
   *   children.push(temp$$attrs$$uuid.name)
   *   children.push(123)
   *   return createReactiveVNode('div', {attrs: temp$$attrs$$uuid}, children)
   * })()
   */
  createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeExpression {
    checkCstName(cst, OvsParser.prototype.OvsRenderFunction.name);

    // 获取元素/组件名称
    const idCst = cst.children?.[0]
    if (!idCst) {
      throw new Error('OvsRenderDomViewDeclaration has no identifier')
    }
    const id = this.createIdentifierAst(idCst)
    id.loc = idCst.loc

    // 检查是否是组件（首字母大写）
    const isComponent = id.name[0] === id.name[0].toUpperCase()

    // 查找 Arguments 节点（组件调用参数）
    const argumentsCst = cst.children?.find(child => child.name === 'Arguments')
    let componentProps: SlimeExpression | null = null

    if (argumentsCst && argumentsCst.children) {
      // 提取 Arguments 内的参数
      // Arguments 结构：LParen, ArgumentList?, RParen
      const argListCst = argumentsCst.children.find(child => child.name === 'ArgumentList')
      if (argListCst && argListCst.children) {
        // ArgumentList 第一个元素
        const firstArgCst = argListCst.children[0]
        if (firstArgCst && firstArgCst.children?.[0]) {
          const argExpr = this.createExpressionAst(firstArgCst.children[0])
          
          // 如果参数是 {attrs: {...}}，提取 attrs 的值
          if (argExpr.type === 'ObjectExpression' && argExpr.properties) {
            const attrsProperty = argExpr.properties.find((prop: any) => 
              prop.key?.name === 'attrs' || prop.key?.value === 'attrs'
            )
            if (attrsProperty && 'value' in attrsProperty && attrsProperty.value) {
              // 提取 attrs 的值作为 componentProps
              componentProps = (attrsProperty.value as any) as SlimeExpression | null
            } else {
              // 没有 attrs 属性，直接使用整个对象
              componentProps = argExpr as any as SlimeExpression | null
            }
          } else {
            // 不是对象表达式，直接使用
            componentProps = (argExpr as any) as SlimeExpression | null
          }
        }
      }
    }

    // 进入 OvsRenderDomViewDeclaration，计数器 +1
    this.ovsRenderDomViewDepth++
    // 生成唯一的 uuid（用于 attrs 变量名，children 固定不需要 uuid）
    const uuid = Math.random().toString(36).substring(2, 10)
    const attrsVarName = `temp$$attrs$$${uuid}`
    this.attrsVarNameStack.push(attrsVarName)

    try {
      // 查找 StatementList 节点
      const statementListCst = cst.children?.find(child =>
        child.name === 'StatementList'
      )

      // StatementList是可选的（空div也合法）
      // 转换 StatementList，会自动处理所有语句
      // 其中 ExpressionStatement 会被 createExpressionStatementAst 转换为 children.push()
      // 注意：createExpressionStatementAst 可能返回数组，需要展开
      let bodyStatements: SlimeStatement[] = []
      if (statementListCst) {
        const statements = this.createStatementListAst(statementListCst)
        // 展开数组（因为赋值表达式会返回两条语句）
        for (const stmt of statements) {
          if (Array.isArray(stmt)) {
            bodyStatements.push(...stmt)
          } else {
            bodyStatements.push(stmt)
          }
        }
      }

      // 判断是简单还是复杂情况
      // 注意：现在即使只有表达式，如果有非渲染表达式（如 func()），也要当复杂情况处理
      const hasNonRenderStatements = bodyStatements.some(stmt => {
        // 如果不是 ExpressionStatement，说明有语句（复杂情况）
        if (stmt.type !== SlimeAstType.ExpressionStatement) {
          return true
        }
        // 如果 ExpressionStatement 的表达式不是 children.push，说明是非渲染表达式（复杂情况）
        const exprStmt = stmt as SlimeExpressionStatement
        if (exprStmt.expression.type !== SlimeAstType.CallExpression) {
          return true  // 非 CallExpression，可能是副作用函数
        }
        const callExpr = exprStmt.expression as SlimeCallExpression
        // 检查是否是 children.push 调用
        if (callExpr.callee.type === 'MemberExpression') {
          const memberExpr = callExpr.callee as any
          return !(memberExpr.object?.name === 'children' && memberExpr.property?.name === 'push')
        }
        return false
      })
      
      const isSimple = !hasNonRenderStatements

      // 保存当前attrs变量名（从栈顶获取）
      const currentAttrsVarName = this.attrsVarNameStack[this.attrsVarNameStack.length - 1]

      if (isSimple) {
        // 简单情况：直接返回 h 调用，无 IIFE
        return this.createSimpleView(id, bodyStatements, currentAttrsVarName, isComponent, componentProps)
      } else {
        // 复杂情况：生成完整 IIFE
        return this.createComplexIIFE(id, bodyStatements, currentAttrsVarName, isComponent, componentProps)
      }
    } finally {
      // 退出 OvsRenderDomViewDeclaration，计数器 -1 并弹出栈
      // 使用 finally 确保即使出错也会恢复计数器和栈
      this.ovsRenderDomViewDepth--
      this.attrsVarNameStack.pop()
    }
  }

  /**
   * 创建简单视图（直接返回 createReactiveVNode 调用，无 IIFE）
   *
   * 生成：
   * createReactiveVNode('div', {}, [child1, child2])
   *
   * @param id 元素标识符
   * @param statements 语句数组（只包含 ExpressionStatement）
   * @param attrsVarName attrs变量名（简单视图通常为null）
   * @returns CallExpression - createReactiveVNode 调用
   */
  private createSimpleView(
    id: SlimeIdentifier,
    statements: SlimeStatement[],
    _attrsVarName: string | null,
    isComponent: boolean,
    componentProps: SlimeExpression | null
  ): SlimeCallExpression {
    // 从 ExpressionStatement 中提取表达式
    const childExpressions: SlimeExpression[] = statements.map(stmt => {
      const exprStmt = stmt as SlimeExpressionStatement
      const pushCall = exprStmt.expression as SlimeCallExpression
      if (pushCall.type === SlimeAstType.CallExpression && pushCall.arguments.length > 0) {
        return pushCall.arguments[0] as SlimeExpression
      }
      return exprStmt.expression
    })

    // 创建 children 数组
    const childrenArray = SlimeAstUtil.createArrayExpression(childExpressions)

    // 创建 props 对象：如果是组件调用，使用 componentProps，否则用空对象
    const propsObject = componentProps || SlimeAstUtil.createObjectExpression([])

    // 创建第一个参数：组件用 Identifier，标签用 StringLiteral
    const firstArg = isComponent
      ? id  // MyComponent（不加引号）
      : SlimeAstUtil.createStringLiteral(id.name)  // 'div'（加引号）

    // 创建 createReactiveVNode(Component, props, children) 或 createReactiveVNode('div', {}, children) 调用
    const reactiveVNodeCall = SlimeAstUtil.createCallExpression(
      SlimeAstUtil.createIdentifier('createReactiveVNode'),
      [
        firstArg,         // 第一个参数：组件标识符或标签字符串
        propsObject,      // 第二个参数：props
        childrenArray     // 第三个参数：children
      ]
    )

    return reactiveVNodeCall
  }

  /**
   * 创建完整的 IIFE（有语句的复杂情况）
   *
   * 生成：
   * (function() {
   *   const children = []
   *   const temp$$attrs$$uuid = {}
   *   ...statements
   *   return createReactiveVNode('div', {ovsAttr: temp$$attrs$$uuid}, children)
   * })()
   *
   * @param id 元素/组件标识符
   * @param statements 语句数组
   * @param attrsVarName attrs变量名
   * @param isComponent 是否是组件
   * @param componentProps 组件props
   * @param loc 位置信息
   * @returns CallExpression
   */
  private createComplexIIFE(
    id: SlimeIdentifier,
    statements: SlimeStatement[],
    attrsVarName: string | null,
    isComponent: boolean,
    componentProps: SlimeExpression | null
  ): SlimeCallExpression {
    // 生成完整的 IIFE 函数体
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. 声明 children 数组：const children = []
      SlimeAstUtil.createVariableDeclaration(
        SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const, id.loc || undefined),
        [
          SlimeAstUtil.createVariableDeclarator(
            SlimeAstUtil.createIdentifier('children'),
            SlimeAstUtil.createEqualOperator(id.loc || undefined),
            SlimeAstUtil.createArrayExpression([])
          )
        ],
        id.loc || undefined
      )
    ]

    // 2. 如果有attrs，声明 attrs 对象：const temp$$attrs$$uuid = {}
    if (attrsVarName) {
      const attrsDeclaration = SlimeAstUtil.createVariableDeclaration(
        SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const, id.loc || undefined),
        [
          SlimeAstUtil.createVariableDeclarator(
            SlimeAstUtil.createIdentifier(attrsVarName),
            SlimeAstUtil.createEqualOperator(id.loc || undefined),
            SlimeAstUtil.createObjectExpression([])
          )
        ],
        id.loc || undefined
      )
      iifeFunctionBody.push(attrsDeclaration)
    }

    // 3. 转换后的语句（包含 temp$$attrs$$.name = value 和 children.push()）
    iifeFunctionBody.push(...statements)

    // 4. 返回 createReactiveVNode('div', {ovsAttr: temp$$attrs$$uuid}, children)
    iifeFunctionBody.push(this.createReturnOvsAPICreateVNode(id, attrsVarName, isComponent, componentProps))

    // 生成 IIFE：(function() { ... })()
    return this.createIIFE(iifeFunctionBody)
  }

  /**
   * 创建 return createReactiveVNode(...) 语句
   *
   * 生成：
   * return createReactiveVNode('div', {ovsAttr: temp$$attrs$$}, children) 或
   * return createReactiveVNode(MyComponent, props, children)
   *
   * @param id 元素/组件标识符
   * @param attrsVarName attrs变量名
   * @param isComponent 是否是组件
   * @param componentProps 组件props对象
   * @returns ReturnStatement
   */
  private createReturnOvsAPICreateVNode(
    id: SlimeIdentifier,
    attrsVarName: string | null,
    isComponent: boolean,
    componentProps: SlimeExpression | null
  ): SlimeStatement {

    // 创建 createReactiveVNode 函数标识符
    const reactiveVNodeIdentifier = SlimeAstUtil.createIdentifier('createReactiveVNode')

    // 创建 props 对象
    let propsObject
    if (isComponent && componentProps) {
      // 组件调用：使用 componentProps
      propsObject = componentProps
    } else if (attrsVarName) {
      // 普通元素有attrs：{ovsAttr: temp$$attrs$$uuid}
      propsObject = SlimeAstUtil.createObjectExpression([
        SlimeAstUtil.createPropertyAst(
          SlimeAstUtil.createIdentifier('ovsAttr'),
          SlimeAstUtil.createIdentifier(attrsVarName)
        )
      ])
    } else {
      // 普通元素无attrs：{}
      propsObject = SlimeAstUtil.createObjectExpression([])
    }

    // 创建第一个参数：组件用 Identifier，标签用 StringLiteral
    const firstArg = isComponent
      ? id  // MyComponent（不加引号）
      : SlimeAstUtil.createStringLiteral(id.name)  // 'div'（加引号）

    // 创建函数调用：createReactiveVNode(Component, props, children) 或 createReactiveVNode('div', props, children)
    const callExpression = SlimeAstUtil.createCallExpression(
      reactiveVNodeIdentifier,
      [
        firstArg,                                     // 第一个参数：组件标识符或标签字符串
        propsObject,                                  // 第二个参数：props 对象
        SlimeAstUtil.createIdentifier('children')    // 第三个参数：children 数组（固定名字）
      ]
    )

    // 包装为 return 语句
    return SlimeAstUtil.createReturnStatement(callExpression)
  }

  /**
   * 创建 IIFE（立即执行函数表达式）
   *
   * 生成：
   * (function() {
   *   ...body
   * })()
   *
   * @param body 函数体语句数组
   * @returns CallExpression
   */
  private createIIFE(body: Array<SlimeStatement>): SlimeCallExpression {
    const loc = body[0]?.loc || undefined

    // 创建函数体的 BlockStatement
    const blockStatement = SlimeAstUtil.createBlockStatement(
      { type: 'LBrace', value: '{', loc } as any,
      { type: 'RBrace', value: '}', loc } as any,
      body,
      loc
    )

    // 创建函数参数（空参数）
    const lp = SlimeAstUtil.createLParen(loc)
    const rp = SlimeAstUtil.createRParen(loc)
    const functionParams = SlimeAstUtil.createFunctionParams(lp, rp)

    // 创建函数表达式
    const functionExpression = SlimeAstUtil.createFunctionExpression(blockStatement, null, functionParams, loc)

    // 创建函数调用（立即执行）
    const callExpression = SlimeAstUtil.createCallExpression(functionExpression, [])

    return callExpression
  }

}

const OvsCstToSlimeAstUtil = new OvsCstToSlimeAst()
export default OvsCstToSlimeAstUtil
