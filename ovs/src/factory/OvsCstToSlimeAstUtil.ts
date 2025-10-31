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
   * 计数器：标记当前是否在 NoRenderBlock #{} 内部
   * 用于判断 ExpressionStatement 是否应该渲染
   *
   * 工作原理：
   * - 进入 #{} 时 +1
   * - 退出时 -1
   * - 当 > 0 时，表示在 #{} 内部，默认不渲染
   * - 但 OvsRenderFunction 优先级更高，仍然渲染
   */
  private noRenderDepth = 0;

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
   * 输入：ovsView ComponentName (state) : div { ... }
   * 输出：function ComponentName(state) { return createReactiveVNode('div', ...) }
   * 
   * 返回类型：ReactiveVNodeApi
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

    // 参数处理：使用用户声明的参数
    let params
    const formalParamsCst = classDeclChildren.find(c => c.name === 'FunctionFormalParameters')
    
    if (formalParamsCst) {
      // 用户声明了参数，直接使用用户的参数
      params = this.createFunctionFormalParametersAst(formalParamsCst)
    } else {
      // 用户没有声明参数，抛出错误提示必须声明
      throw new Error('ovsView 组件必须声明参数，格式: ovsView ComponentName (state) : rootElement { ... }')
    }

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

  /**
   * Override: 处理 StatementList，支持 NoRenderBlock
   * 
   * NoRenderBlock (#{ }) 的处理：
   * - 进入时 noRenderDepth++
   * - 递归处理内部语句
   * - 展开内部语句（去掉 #{} 包裹）
   * - 退出时 noRenderDepth--
   */
  createStatementListAst(cst: SubhutiCst): SlimeStatement[] {
    checkCstName(cst, Es6Parser.prototype.StatementList.name)
    
    const statements: SlimeStatement[] = []
    
    if (!cst.children) return statements
    
    for (const child of cst.children) {
      // StatementListItem 包裹了 Statement 或 Declaration
      const stmts = this.createStatementListItemAst(child)
      
      // 展开数组
      if (Array.isArray(stmts)) {
        statements.push(...stmts)
      } else {
        statements.push(stmts as any)
      }
    }
    
    return statements
  }
  
  /**
   * Override: 处理 StatementListItem，支持 NoRenderBlock 展开
   */
  createStatementListItemAst(cst: SubhutiCst): SlimeStatement[] {
    checkCstName(cst, Es6Parser.prototype.StatementListItem.name)
    
    if (!cst.children || cst.children.length === 0) {
      return []
    }
    
    const child = cst.children[0]
    
    // 检查是否是 Statement -> NoRenderBlock
    if (child.name === Es6Parser.prototype.Statement.name) {
      const statementChild = child.children?.[0]
      
      if (statementChild && statementChild.name === OvsParser.prototype.NoRenderBlock.name) {
        // 识别为 NoRenderBlock，展开处理
        this.noRenderDepth++
        
        try {
          // 找到内部的 StatementList
          const innerList = statementChild.children?.find(
            c => c.name === Es6Parser.prototype.StatementList.name
          )
          
          if (innerList) {
            // 递归处理内部语句，直接展开
            const innerStatements = this.createStatementListAst(innerList)
            return innerStatements  // 返回数组（会被展开）
          }
          
          return []
        } finally {
          this.noRenderDepth--
        }
      }
    }
    
    // 正常处理（调用父类）
    return super.createStatementListItemAst(cst)
  }

  createExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = cst.name
    let left
    if (astName === OvsParser.prototype.OvsRenderFunction.name) {
      left = this.createOvsRenderDomViewDeclarationAst(cst)
    } else {
      left = super.createExpressionAst(cst)
    }
    return left
  }

  /**
   * 重写 ExpressionStatement 处理
   *
   * 核心逻辑（新版本）：
   * - 优先级：OvsRenderFunction > noRenderDepth > ovsRenderDomViewDepth
   * - OvsRenderFunction（p {}）：永远渲染（优先级最高）
   * - 在 #{} 内（noRenderDepth > 0）：不渲染（除非是 OvsRenderFunction）
   * - 在 div {} 内（ovsRenderDomViewDepth > 0）：渲染
   * - 其他：保持原样（不渲染）
   *
   * 示例：
   * div {
   *   p {}           → children.push(h('p', ...))  ✅ 渲染（OvsRenderFunction）
   *   func()         → children.push(func())       ✅ 渲染（在 div {} 内）
   *   #{ func() }    → func()                      ❌ 不渲染（在 #{} 内）
   *   #{ p {} }      → children.push(h('p', ...))  ✅ 渲染（OvsRenderFunction 优先）
   * }
   */
  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement | any {
    const exprCst = cst.children?.[0]
    if (!exprCst) {
      throw new Error('ExpressionStatement has no expression')
    }

    // 检查 CST 类型，判断是否是 OvsRenderFunction
    let actualCst = exprCst
    while (actualCst.name === 'Expression' && actualCst.children && actualCst.children.length > 0) {
      actualCst = actualCst.children[0]
    }
    
    // 检查 AssignmentExpression 的第一个子节点
    let isOvsRenderFunction = false
    if (actualCst.name === 'AssignmentExpression' && actualCst.children && actualCst.children.length > 0) {
      const firstChild = actualCst.children[0]
      isOvsRenderFunction = firstChild.name === OvsParser.prototype.OvsRenderFunction.name
      if (isOvsRenderFunction) {
        actualCst = firstChild
      }
    } else if (actualCst.name === OvsParser.prototype.OvsRenderFunction.name) {
      isOvsRenderFunction = true
    }

    const expr = this.createExpressionAst(exprCst)

    // 判断逻辑
    if (this.ovsRenderDomViewDepth > 0) {
      // 在 div {} 内
      
      // 1. OvsRenderFunction → 永远渲染（优先级最高）
      if (isOvsRenderFunction) {
        const pushCall = SlimeAstUtil.createCallExpression(
          SlimeAstUtil.createMemberExpression(
            SlimeAstUtil.createIdentifier('children'),
            SlimeAstUtil.createDotOperator(cst.loc),
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
      
      // 2. 在 #{} 内 → 不渲染，保持原样
      if (this.noRenderDepth > 0) {
        return {
          type: SlimeAstType.ExpressionStatement,
          expression: expr,
          loc: cst.loc
        } as SlimeExpressionStatement
      }
      
      // 3. 在 div {} 内，不在 #{} 内 → 渲染
      const pushCall = SlimeAstUtil.createCallExpression(
        SlimeAstUtil.createMemberExpression(
          SlimeAstUtil.createIdentifier('children'),
          SlimeAstUtil.createDotOperator(cst.loc),
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
    
    // 不在 div {} 内 → 保持原样
    return {
      type: SlimeAstType.ExpressionStatement,
      expression: expr,
      loc: cst.loc
    } as SlimeExpressionStatement
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
    
    // 进入新的渲染元素，临时清零 noRenderDepth（#{} 对元素内部不生效）
    const savedNoRenderDepth = this.noRenderDepth
    this.noRenderDepth = 0

    try {
      // 查找 StatementList 节点
      const statementListCst = cst.children?.find(child =>
        child.name === 'StatementList'
      )

      // StatementList是可选的（空div也合法）
      // 转换 StatementList，会自动处理所有语句
      // NoRenderBlock #{} 会被展开，其内部语句直接平铺
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

      // 判断是否有非渲染语句（需要 IIFE）
      const hasNonRenderStatements = bodyStatements.some(stmt => {
        // Declaration（如 const x = 1）→ 复杂
        if (stmt.type === SlimeAstType.VariableDeclaration || 
            stmt.type === SlimeAstType.FunctionDeclaration ||
            stmt.type === SlimeAstType.ClassDeclaration) {
          return true
        }
        
        // IfStatement、ForStatement 等 → 复杂
        if (stmt.type === SlimeAstType.IfStatement ||
            stmt.type === SlimeAstType.ForStatement ||
            stmt.type === SlimeAstType.WhileStatement) {
          return true
        }
        
        // ExpressionStatement 但不是 children.push → 复杂
        if (stmt.type === SlimeAstType.ExpressionStatement) {
          const exprStmt = stmt as SlimeExpressionStatement
          if (exprStmt.expression.type !== SlimeAstType.CallExpression) {
            return true
          }
          const callExpr = exprStmt.expression as SlimeCallExpression
          if (callExpr.callee.type === 'MemberExpression') {
            const memberExpr = callExpr.callee as any
            return !(memberExpr.object?.name === 'children' && memberExpr.property?.name === 'push')
          }
          return true
        }
        
        return false
      })
      
      const isSimple = !hasNonRenderStatements
      const currentAttrsVarName = this.attrsVarNameStack[this.attrsVarNameStack.length - 1]

      if (isSimple) {
        // 简单情况：直接返回 h 调用，无 IIFE
        return this.createSimpleView(id, bodyStatements, currentAttrsVarName, componentProps)
      } else {
        // 复杂情况：生成完整 IIFE
        return this.createComplexIIFE(id, bodyStatements, currentAttrsVarName, componentProps)
      }
    } finally {
      // 退出 OvsRenderDomViewDeclaration，计数器 -1 并弹出栈
      // 使用 finally 确保即使出错也会恢复计数器和栈
      this.ovsRenderDomViewDepth--
      this.attrsVarNameStack.pop()
      this.noRenderDepth = savedNoRenderDepth  // 恢复外层的 noRenderDepth
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
    componentProps: SlimeExpression | null
  ): SlimeCallExpression {
    // 从 ExpressionStatement 中提取表达式
    const childExpressions: SlimeExpression[] = statements.map(stmt => {
      const exprStmt = stmt as SlimeExpressionStatement
      const pushCall = exprStmt.expression as SlimeCallExpression
      if (pushCall && pushCall.type === SlimeAstType.CallExpression && pushCall.arguments.length > 0) {
        return pushCall.arguments[0] as SlimeExpression
      }
      return exprStmt.expression
    })

    // 创建 children 数组
    const childrenArray = SlimeAstUtil.createArrayExpression(childExpressions)

    // 创建 props 对象：如果是组件调用，使用 componentProps，否则用空对象
    const propsObject = componentProps || SlimeAstUtil.createObjectExpression([])

    // 创建第一个参数：组件用 Identifier，标签用 StringLiteral
    const firstArg = id  // MyComponent（不加引号）

    // 创建 createReactiveVNode(Component, props, children) 或 createReactiveVNode('div', {}, children) 调用
    const vNodeCall = SlimeAstUtil.createCallExpression(
      SlimeAstUtil.createIdentifier('createReactiveVNode'),
      [
        firstArg,         // 第一个参数：组件标识符或标签字符串
        propsObject,      // 第二个参数：props
        childrenArray     // 第三个参数：children
      ]
    )

    return vNodeCall
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
    componentProps: SlimeExpression | null
  ): SlimeCallExpression {
    // 生成完整的 IIFE 函数体
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. 声明 children 数组：const children = []
      // 注意：这是自动生成的代码，不传递loc（避免创建错误映射）
      SlimeAstUtil.createVariableDeclaration(
        SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const),
        [
          SlimeAstUtil.createVariableDeclarator(
            SlimeAstUtil.createIdentifier('children'),
            SlimeAstUtil.createEqualOperator(),
            SlimeAstUtil.createArrayExpression([])
          )
        ]
      )
    ]

    // 2. 如果有attrs，声明 attrs 对象：const temp$$attrs$$uuid = {}
    // 注意：这也是自动生成的代码，不传递loc（避免创建错误映射）
    if (attrsVarName) {
      const attrsDeclaration = SlimeAstUtil.createVariableDeclaration(
        SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const),
        [
          SlimeAstUtil.createVariableDeclarator(
            SlimeAstUtil.createIdentifier(attrsVarName),
            SlimeAstUtil.createEqualOperator(),
            SlimeAstUtil.createObjectExpression([])
          )
        ]
      )
      iifeFunctionBody.push(attrsDeclaration)
    }

    // 3. 转换后的语句（包含 temp$$attrs$$.name = value 和 children.push()）
    iifeFunctionBody.push(...statements)

    // 4. 返回 createReactiveVNode('div', {ovsAttr: temp$$attrs$$uuid}, children)
    iifeFunctionBody.push(this.createReturnOvsAPICreateVNode(id, attrsVarName, componentProps))

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
    componentProps: SlimeExpression | null
  ): SlimeStatement {

    // 创建 createReactiveVNode 函数标识符
    const createReactiveVNodeIdentifier = SlimeAstUtil.createIdentifier('createReactiveVNode')

    // 创建 props 对象
    let propsObject
    if (componentProps) {
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
    const firstArg = id  // MyComponent（不加引号）

    // 创建函数调用：createReactiveVNode(Component, props, children) 或 createReactiveVNode('div', props, children)
    const callExpression = SlimeAstUtil.createCallExpression(
      createReactiveVNodeIdentifier,
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
