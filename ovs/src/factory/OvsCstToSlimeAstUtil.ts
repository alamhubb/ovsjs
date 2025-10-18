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
   * - import 添加（移到外层 ensureOvsAPIImport）
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
   * 转换 OvsViewDeclaration 为 Vue 3 setup 对象
   * 
   * 输入：ovsView PriceTag ({attrs}) { let price = attrs.price; return div { ... } }
   * 输出：const PriceTag = { setup(props, {slots}) { let price = props.attrs.price; return h('div', ...) } }
   */
  createOvsViewDeclarationAst(cst: SubhutiCst): any {
    checkCstName(cst, OvsParser.prototype.OvsViewDeclaration.name)
    
    // 新结构：OvsViewToken, ovsRenderDomClassDeclaration, Block
    const children = cst.children || []
    
    // 1. 从 ovsRenderDomClassDeclaration 中提取组件名和参数
    const classDeclCst = children[1]
    if (!classDeclCst) {
      throw new Error('OvsViewDeclaration: missing class declaration')
    }
    
    // ovsRenderDomClassDeclaration 的结构：Identifier, FunctionFormalParameters?
    const classDeclChildren = classDeclCst.children || []
    
    // 组件名
    const componentNameCst = classDeclChildren[0]
    if (!componentNameCst) {
      throw new Error('OvsViewDeclaration: missing component name')
    }
    const componentName = this.createIdentifierAst(componentNameCst)
    
    // 参数（从 ovsRenderDomClassDeclaration 提取）
    let userParams
    const secondChild = classDeclChildren[1]
    if (secondChild && secondChild.name === 'FunctionFormalParameters') {
      userParams = this.createFunctionFormalParametersAst(secondChild)
    } else {
      // 无参数，创建 props 参数
      const loc = cst.loc
      userParams = SlimeAstUtil.createFunctionParams(
        SlimeAstUtil.createLParen(loc),
        SlimeAstUtil.createRParen(loc),
        loc,
        [SlimeAstUtil.createIdentifier('props')]
      )
    }
    
    // 添加第二个参数 {slots}（用于插槽支持）
    const slotsParam = {
      type: SlimeAstType.ObjectPattern,
      properties: [
        SlimeAstUtil.createPropertyAst(
          SlimeAstUtil.createIdentifier('slots'),
          SlimeAstUtil.createIdentifier('slots')
        )
      ]
    }
    
    // setup 函数参数：(props或用户参数, {slots})
    const existingParams = userParams.params || []
    const setupParams = SlimeAstUtil.createFunctionParams(
      userParams.lParen,
      userParams.rParen,
      cst.loc,
      [...existingParams, slotsParam]
    )
    
    // 2. BlockStatement（第3个：Block）
    const blockCst = children[2]
    if (!blockCst) {
      throw new Error('OvsViewDeclaration: missing block statement')
    }
    
    // 解析 BlockStatement 中的语句
    const blockAst = this.createBlockStatementAst(blockCst)
    const blockStatements = (blockAst as any).body as SlimeStatement[]
    
    // 3. 遍历语句，处理 return 中的 OvsRenderFunction
    const transformedStatements: SlimeStatement[] = []
    for (const stmt of blockStatements) {
      if (stmt.type === SlimeAstType.ReturnStatement && (stmt as any).argument) {
        const returnArg = (stmt as any).argument
        
        // 如果 return 的是 OvsRenderFunction 调用表达式，需要展开
        if (returnArg.type === SlimeAstType.CallExpression) {
          const callExpr = returnArg as SlimeCallExpression
          const callee = callExpr.callee
          
          if (callee.type === 'FunctionExpression') {
            // 这是 IIFE，展开它
            const iifeBody = (callee as any).body.body as SlimeStatement[]
            
            // 提取 IIFE 内的所有语句（除了最后的 return）
            const statementsWithoutReturn = iifeBody.slice(0, -1)
            const lastReturn = iifeBody[iifeBody.length - 1]
            
            // 添加所有中间语句
            transformedStatements.push(...statementsWithoutReturn)
            
            // 修改最后的 return 语句
            if (lastReturn && lastReturn.type === SlimeAstType.ReturnStatement) {
              transformedStatements.push(lastReturn)
            }
            continue
          }
        }
        
        // 其他情况，保持原样
        transformedStatements.push(stmt)
      } else {
        transformedStatements.push(stmt)
      }
    }
    
    // 4. 创建 setup 函数体
    const setupBody = SlimeAstUtil.createBlockStatement(
      { type: 'LBrace', value: '{', loc: cst.loc } as any,
      { type: 'RBrace', value: '}', loc: cst.loc } as any,
      transformedStatements,
      cst.loc
    )
    
    // 5. 创建 setup 函数表达式
    const setupFunction = {
      type: 'FunctionExpression',
      id: null,
      params: setupParams,
      body: setupBody,
      generator: false,
      async: false,
      loc: cst.loc
    }
    
    // 6. 提取 props 参数名（从用户定义的参数中）
    const userParamsNames: string[] = []
    const existingParamsList = userParams.params || []
    for (const param of existingParamsList) {
      if (param.type === SlimeAstType.ObjectPattern) {
        // 提取对象解构中的属性名
        const objPattern = param as any
        for (const prop of objPattern.properties || []) {
          if (prop.key && prop.key.type === SlimeAstType.Identifier) {
            userParamsNames.push(prop.key.name)
          }
        }
      } else if (param.type === SlimeAstType.Identifier) {
        userParamsNames.push((param as any).name)
      }
    }
    
    // 7. 创建 props 声明数组：props: ['attrs', 'xxx']
    const propsArray = {
      type: SlimeAstType.ArrayExpression,
      elements: userParamsNames.map(name => 
        SlimeAstUtil.createLiteral(name)
      ),
      loc: cst.loc
    }
    
    const propsProperty = SlimeAstUtil.createPropertyAst(
      SlimeAstUtil.createIdentifier('props'),
      propsArray
    )
    
    // 8. 创建 setup 属性
    const setupProperty = SlimeAstUtil.createPropertyAst(
      SlimeAstUtil.createIdentifier('setup'),
      setupFunction
    )
    
    // 9. 创建对象：{ props: ['attrs'], setup: function(...) {...} }
    const componentObject = {
      type: SlimeAstType.ObjectExpression,
      properties: [propsProperty, setupProperty],
      loc: cst.loc
    }
    
    // 10. 创建变量声明：const PriceTag = { props: ['attrs'], setup(...) {...} }
    const variableDeclarator = SlimeAstUtil.createVariableDeclarator(
      componentName,
      SlimeAstUtil.createEqualOperator(cst.loc),
      componentObject
    )
    
    // 创建 const 关键字节点
    const constKind = SlimeAstUtil.createVariableDeclarationKind(
      SlimeVariableDeclarationKindValue.const,
      cst.loc
    )
    
    const variableDeclaration = SlimeAstUtil.createVariableDeclaration(
      constKind,
      [variableDeclarator],
      cst.loc
    )
    
    return variableDeclaration
  }

  createExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = cst.name
    let left
    if (astName === OvsParser.prototype.SlotDeclaration.name) {
      left = this.createSlotDeclarationAst(cst)
    } else if (astName === OvsParser.prototype.OvsRenderFunction.name) {
      left = this.createOvsRenderDomViewDeclarationAst(cst)
    } else {
      left = super.createExpressionAst(cst)
    }
    return left
  }

  /**
   * 转换 slot{} 为 slots.default() 调用
   */
  createSlotDeclarationAst(cst: SubhutiCst): SlimeExpression {
    checkCstName(cst, OvsParser.prototype.SlotDeclaration.name)
    
    // slot{} → slots.default()
    const slotsDefaultCall = SlimeAstUtil.createCallExpression(
      SlimeAstUtil.createMemberExpression(
        SlimeAstUtil.createIdentifier('slots'),
        SlimeAstUtil.createDotOperator(cst.loc),
        SlimeAstUtil.createIdentifier('default')
      ),
      []
    )
    
    return slotsDefaultCall
  }

  /**
   * 重写 ExpressionStatement 处理
   * 
   * 核心逻辑：
   * - 检查 ovsRenderDomViewDepth 计数器
   * - 如果 > 0，说明在 OvsRenderDomViewDeclaration 内部
   * - 识别赋值表达式（name = value）→ 生成三条语句：
   *   1. let name = value
   *   2. temp$$attrs$$.name = name
   *   3. children.push(temp$$attrs$$.name)
   * - 其他表达式 → children.push(expression)
   * 
   * 示例：
   * 输入：name = 123  → [let name = 123, temp$$attrs$$.name = name, children.push(temp$$attrs$$.name)]
   * 输入：456        → children.push(456)
   */
  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement | any {
    const exprCst = cst.children?.[0]
    if (!exprCst) {
      throw new Error('ExpressionStatement has no expression')
    }
    
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
      
      // 其他表达式 → children.push(expr)
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
   *    - 简单（只有表达式）：OvsAPI.createVNode('div', {}, [children])  ⭐ 无 IIFE
   *    - 复杂（有语句）：IIFE包裹
   * 4. 退出时计数器 -1，弹出栈（用 try-finally 保证）
   * 
   * 示例（简单）：
   * 输入：div { h1 { greeting } }
   * 输出：OvsAPI.createVNode('div', {}, [
   *   OvsAPI.createVNode('h1', {}, [greeting])
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
   *   return OvsAPI.createVNode('div', {attrs: temp$$attrs$$uuid}, children)
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
      // 提取 Arguments 内的参数（通常是一个对象）
      // Arguments 结构：LParen, ArgumentList?, RParen
      const argListCst = argumentsCst.children.find(child => child.name === 'ArgumentList')
      if (argListCst && argListCst.children) {
        // ArgumentList 第一个元素
        const firstArgCst = argListCst.children[0]
        if (firstArgCst && firstArgCst.children?.[0]) {
          componentProps = this.createExpressionAst(firstArgCst.children[0])
        }
      }
    }

    // 进入 OvsRenderDomViewDeclaration，计数器 +1
    this.ovsRenderDomViewDepth++
    // 生成唯一的attrs变量名并压入栈
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
      const isSimple = this.isSimpleViewBody(bodyStatements)
      
      // 保存当前attrs变量名（从栈顶获取）
      const currentAttrsVarName = this.attrsVarNameStack[this.attrsVarNameStack.length - 1]
      
      if (isSimple) {
        // 简单情况：直接返回 h 调用，无 IIFE
        return this.createSimpleView(id, bodyStatements, currentAttrsVarName, isComponent, componentProps, cst.loc)
      } else {
        // 复杂情况：生成完整 IIFE
        return this.createComplexIIFE(id, bodyStatements, currentAttrsVarName, isComponent, componentProps, cst.loc)
      }
    } finally {
      // 退出 OvsRenderDomViewDeclaration，计数器 -1 并弹出栈
      // 使用 finally 确保即使出错也会恢复计数器和栈
      this.ovsRenderDomViewDepth--
      this.attrsVarNameStack.pop()
    }
  }

  /**
   * 判断 view body 是否为简单情况
   * 
   * 简单情况：只包含 ExpressionStatement（表达式语句）
   * 复杂情况：包含任何其他类型的语句（变量声明、控制流等）
   * 
   * @param statements 语句数组
   * @returns true 为简单情况，false 为复杂情况
   */
  private isSimpleViewBody(statements: SlimeStatement[]): boolean {
    return statements.every(stmt => {
      // 只允许 ExpressionStatement
      if (stmt.type !== SlimeAstType.ExpressionStatement) {
        return false
      }
      
      // ExpressionStatement 内部可以是任何表达式
      // 包括 OvsView (IIFE CallExpression)、变量引用、字面量等
      return true
    })
  }

  /**
   * 创建简单视图（直接返回 h 调用，无 IIFE）
   * 
   * 生成：
   * h('div', {}, [child1, child2])
   * 
   * @param id 元素标识符
   * @param statements 语句数组（只包含 ExpressionStatement）
   * @param attrsVarName attrs变量名（简单视图通常为null）
   * @param loc 位置信息
   * @returns CallExpression - h 调用
   */
  private createSimpleView(
    id: SlimeIdentifier, 
    statements: SlimeStatement[],
    _attrsVarName: string | null,
    isComponent: boolean,
    componentProps: SlimeExpression | null,
    loc: any
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

    // 创建 h(Component, props, children) 或 h('div', {}, children) 调用
    const hCall = SlimeAstUtil.createCallExpression(
      SlimeAstUtil.createIdentifier('h'),
      [
        firstArg,         // 第一个参数：组件标识符或标签字符串
        propsObject,      // 第二个参数：props
        childrenArray     // 第三个参数：children
      ]
    )

    return hCall
  }

  /**
   * 创建完整的 IIFE（有语句的复杂情况）
   * 
   * 生成：
   * (function() {
   *   const children = []
   *   const temp$$attrs$$uuid = {}
   *   ...statements
   *   return h('div', {ovsAttr: temp$$attrs$$uuid}, children)
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
    componentProps: SlimeExpression | null,
    loc: any
  ): SlimeCallExpression {
    // 生成完整的 IIFE 函数体
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. 声明 children 数组：const children = []
      SlimeAstUtil.createVariableDeclaration(
        SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const, loc),
        [
          SlimeAstUtil.createVariableDeclarator(
            SlimeAstUtil.createIdentifier('children'),
            SlimeAstUtil.createEqualOperator(loc),
            SlimeAstUtil.createArrayExpression([])
          )
        ],
        loc
      )
    ]
    
    // 2. 如果有attrs，声明 attrs 对象：const temp$$attrs$$uuid = {}
    if (attrsVarName) {
      const attrsDeclaration = SlimeAstUtil.createVariableDeclaration(
        SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const, loc),
        [
          SlimeAstUtil.createVariableDeclarator(
            SlimeAstUtil.createIdentifier(attrsVarName),
            SlimeAstUtil.createEqualOperator(loc),
            SlimeAstUtil.createObjectExpression([])
          )
        ],
        loc
      )
      iifeFunctionBody.push(attrsDeclaration)
    }
    
    // 3. 转换后的语句（包含 temp$$attrs$$.name = value 和 children.push()）
    iifeFunctionBody.push(...statements)
    
    // 4. 返回 h('div', {ovsAttr: temp$$attrs$$uuid}, children)
    iifeFunctionBody.push(this.createReturnOvsAPICreateVNode(id, attrsVarName, isComponent, componentProps))
    
    // 生成 IIFE：(function() { ... })()
    return this.createIIFE(iifeFunctionBody)
  }

  /**
   * 创建 return h(...) 语句
   * 
   * 生成：
   * return h('div', {ovsAttr: temp$$attrs$$}, children) 或
   * return h(MyComponent, {attrs: ...}, children)
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
    const loc = id.loc || undefined
    
    // 创建 h 函数标识符
    const hIdentifier = SlimeAstUtil.createIdentifier('h')
    
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
    
    // 创建函数调用：h(Component, props, children) 或 h('div', props, children)
    const callExpression = SlimeAstUtil.createCallExpression(
      hIdentifier,
      [
        firstArg,                                     // 第一个参数：组件标识符或标签字符串
        propsObject,                                  // 第二个参数：props 对象
        SlimeAstUtil.createIdentifier('children')    // 第三个参数：children 数组
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
