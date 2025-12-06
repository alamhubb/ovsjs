import {SlimeCstToAst} from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import OvsParser from "../parser/OvsParser.ts";
import {SlimeNodeType} from "slime-ast/src/SlimeNodeType.ts";
import {
    type SlimeCallExpression,
    type SlimeExpression,
    type SlimeExpressionStatement, type SlimeIdentifier,
    type SlimeMemberExpression,
    type SlimeModuleDeclaration,
    type SlimeProgram,
    SlimeProgramSourceType,
    type SlimeStatement
} from "slime-ast/src/SlimeESTree.ts";
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts";
import SlimeNodeCreate from "slime-ast/src/SlimeNodeCreate.ts";
import slimeTokenCreate from "slime-ast/src/SlimeTokenCreate.ts";
import SlimeTokenCreate from "slime-ast/src/SlimeTokenCreate.ts";

// HTML 标签列表，用于判断是否需要转换为 $OvsHtmlTag.xxx()
const HTML_TAGS = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
  'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
  'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
  'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed',
  'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
  'i', 'iframe', 'img', 'input', 'ins',
  'kbd',
  'label', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'menu', 'meta', 'meter',
  'nav', 'noscript',
  'object', 'ol', 'optgroup', 'option', 'output',
  'p', 'picture', 'pre', 'progress',
  'q',
  'rp', 'rt', 'ruby',
  's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg',
  'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
  'u', 'ul',
  'var', 'video',
  'wbr'
])

/** 检查标签名是否是 HTML 标签 */
function isHtmlTag(tagName: string): boolean {
  return HTML_TAGS.has(tagName.toLowerCase())
}

/** 创建 callee 表达式：HTML 标签返回 $OvsHtmlTag.xxx，其他返回标识符 */
function createCalleeForTag(tagName: string, loc?: any): SlimeExpression {
  if (isHtmlTag(tagName)) {
    // HTML 标签 → $OvsHtmlTag.tagName
    // 关键：给标签名标识符设置 loc，用于 source map 映射
    const tagIdentifier = SlimeNodeCreate.createIdentifier(tagName)
    if (loc) {
      tagIdentifier.loc = {
        ...loc,
        value: tagName  // 确保 value 字段包含标签名，供 SlimeGenerator 使用
      }
    }
    const memberExpr = SlimeNodeCreate.createMemberExpression(
      SlimeNodeCreate.createIdentifier('$OvsHtmlTag'),
      SlimeTokenCreate.createDotToken(),
      tagIdentifier
    )
    if (loc) memberExpr.loc = loc
    return memberExpr
  } else {
    // 用户组件 → 直接使用标识符
    const id = SlimeNodeCreate.createIdentifier(tagName)
    if (loc) id.loc = loc
    return id
  }
}

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
   * - import 添加（移到外层 ensureOvsAPIImport - 导入 createComponentVNode）
   * - 组件包装（移到外层 wrapAsVueComponent）
   *
   * 支持的 CST 结构（与 SlimeParser 保持一致）：
   * - Program -> ModuleBody -> ModuleItemList（模块代码）
   * - Program -> ScriptBody -> StatementList（脚本代码）
   * - Program -> ModuleItemList（兼容旧结构）
   * - Program -> StatementList（兼容旧结构）
   *
   * @param cst Program CST 节点
   * @returns Program AST
   */
  toProgram(cst: SubhutiCst): SlimeProgram {
    checkCstName(cst, SlimeParser.prototype.Program.name);

    // 如果没有子节点，返回空程序
    if (!cst.children || cst.children.length === 0) {
      return SlimeNodeCreate.createProgram([], SlimeProgramSourceType.Module)
    }

    // 使用 SlimeParser.prototype.XXX.name 确保与 Parser 同步
    const hashbangCommentName = 'HashbangComment'  // Token 名称，不是规则
    const moduleBodyName = SlimeParser.prototype.ModuleBody?.name || 'ModuleBody'
    const scriptBodyName = SlimeParser.prototype.ScriptBody?.name || 'ScriptBody'
    const moduleItemListName = SlimeParser.prototype.ModuleItemList?.name || 'ModuleItemList'
    const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'

    // 查找主体内容（跳过 HashbangComment）
    let bodyChild: SubhutiCst | null = null
    for (const child of cst.children) {
      if (child.name === hashbangCommentName) {
        continue  // 跳过 hashbang 注释
      }
      bodyChild = child
      break
    }

    if (!bodyChild) {
      return SlimeNodeCreate.createProgram([], SlimeProgramSourceType.Module)
    }

    // 根据子节点类型转换为 AST
    let body: Array<SlimeStatement | SlimeModuleDeclaration> = []
    let sourceType: SlimeProgramSourceType = SlimeProgramSourceType.Module

    if (bodyChild.name === moduleBodyName) {
      // 新结构：Program -> ModuleBody -> ModuleItemList
      const moduleItemList = bodyChild.children?.[0]
      if (moduleItemList && moduleItemList.name === moduleItemListName) {
        body = this.createModuleItemListAst(moduleItemList)
      }
      sourceType = SlimeProgramSourceType.Module
    } else if (bodyChild.name === moduleItemListName) {
      // 兼容旧结构：Program -> ModuleItemList
      body = this.createModuleItemListAst(bodyChild)
      sourceType = SlimeProgramSourceType.Module
    } else if (bodyChild.name === scriptBodyName) {
      // 新结构：Program -> ScriptBody -> StatementList
      const statementList = bodyChild.children?.[0]
      if (statementList && statementList.name === statementListName) {
        body = this.createStatementListAst(statementList)
      }
      sourceType = SlimeProgramSourceType.Script
    } else if (bodyChild.name === statementListName) {
      // 兼容旧结构：Program -> StatementList
      body = this.createStatementListAst(bodyChild)
      sourceType = SlimeProgramSourceType.Script
    }

    // 创建 Program AST
    const program = SlimeNodeCreate.createProgram(body, sourceType)
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
   * 输出：function ComponentName(state) { return createComponentVNode('div', ...) }
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

    // OvsRenderDomClassDeclaration 的结构：Identifier, ArrowFormalParameters?, Colon
    // 注意：使用 ArrowFormalParameters 而不是 FunctionFormalParameters
    const classDeclChildren = classDeclCst.children || []

    // 组件名
    const componentNameCst = classDeclChildren[0]
    if (!componentNameCst) {
      throw new Error('OvsViewDeclaration: missing component name')
    }
    const componentName = this.createIdentifierAst(componentNameCst)

    // 参数处理：使用用户声明的参数
    // 使用 SlimeParser.prototype.ArrowFormalParameters.name 确保与 Parser 同步
    let params
    const arrowFormalParamsName = SlimeParser.prototype.ArrowFormalParameters?.name || 'ArrowFormalParameters'
    const formalParamsCst = classDeclChildren.find(c => c.name === arrowFormalParamsName)

    if (formalParamsCst) {
      // 用户声明了参数，使用 ArrowFormalParameters 的转换方法
      params = this.createArrowFormalParametersAstWrapped(formalParamsCst)
    } else {
      // 用户没有声明参数，抛出错误提示必须声明
      throw new Error('ovsView 组件必须声明参数123，格式: ovsView ComponentName (state) : rootElement { ... }')
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

    if (viewExpression.type === SlimeNodeType.CallExpression) {
      const iife = viewExpression as SlimeCallExpression
      const iifeFunc = iife.callee

      if (iifeFunc.type === 'FunctionExpression') {
        // 复杂视图的 IIFE：(function() { const children = []; ...; return h(...) })()
        // 直接展开 IIFE 内容到函数体（参数是 child，内部是 children，不冲突）
        const iifeBody = (iifeFunc as any).body.body as SlimeStatement[]

        // 去掉最后一条 return 语句，修改为 return h(...)
        const statementsWithoutReturn = iifeBody.slice(0, -1)
        const lastReturn = iifeBody[iifeBody.length - 1]

        if (lastReturn && lastReturn.type === SlimeNodeType.ReturnStatement) {
          const returnExpr = (lastReturn as any).argument
          functionBodyStatements = [
            ...statementsWithoutReturn,
            SlimeNodeCreate.createReturnStatement(returnExpr)
          ]
        } else {
          functionBodyStatements = iifeBody
        }
      } else {
        // 简单视图的 h 调用：h('div', {}, [...])
        functionBodyStatements = [
          SlimeNodeCreate.createReturnStatement(viewExpression)
        ]
      }
    } else {
      // 其他类型，直接 return
      functionBodyStatements = [
        SlimeNodeCreate.createReturnStatement(viewExpression)
      ]
    }

    // 创建函数体
    const functionBody = SlimeNodeCreate.createBlockStatement(
      functionBodyStatements,
      cst.loc,
      { type: 'LBrace', value: '{', loc: cst.loc } as any,
      { type: 'RBrace', value: '}', loc: cst.loc } as any
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
    checkCstName(cst, SlimeParser.prototype.StatementList.name)
    
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
   * Override: 处理 StatementListItem，支持 OvsRenderStatement 和 NoRenderBlock
   */
  createStatementListItemAst(cst: SubhutiCst): SlimeStatement[] {
    checkCstName(cst, SlimeParser.prototype.StatementListItem.name)

    if (!cst.children || cst.children.length === 0) {
      return []
    }

    const child = cst.children[0]

    // 检查是否是 Statement
    if (child.name === SlimeParser.prototype.Statement.name) {
      const statementChild = child.children?.[0]

      // 处理 OvsRenderStatement - 语句版本的 OVS 渲染
      if (statementChild && statementChild.name === OvsParser.prototype.OvsRenderStatement.name) {
        // OvsRenderStatement 和 OvsRenderFunction 的 CST 结构相同，复用转换逻辑
        const expr = this.createOvsRenderDomViewDeclarationAst(statementChild)

        // 在 OVS 渲染上下文中，需要包装成 children.push()
        if (this.ovsRenderDomViewDepth > 0) {
          const pushCall = SlimeNodeCreate.createCallExpression(
            SlimeNodeCreate.createMemberExpression(
              SlimeNodeCreate.createIdentifier('children'),
              SlimeTokenCreate.createDotToken(cst.loc),
              SlimeNodeCreate.createIdentifier('push')
            ),
            [expr]
          )
          if (cst.loc) {
            pushCall.loc = cst.loc
          }
          return [{
            type: SlimeNodeType.ExpressionStatement,
            expression: pushCall,
            loc: cst.loc
          } as SlimeExpressionStatement]
        }

        // 不在渲染上下文中，直接作为表达式语句
        return [{
          type: SlimeNodeType.ExpressionStatement,
          expression: expr,
          loc: cst.loc
        } as SlimeExpressionStatement]
      }

      // 处理 NoRenderBlock - 展开处理
      if (statementChild && statementChild.name === OvsParser.prototype.NoRenderBlock.name) {
        // 识别为 NoRenderBlock，展开处理
        this.noRenderDepth++

        try {
          // 找到内部的 StatementList
          const innerList = statementChild.children?.find(
            c => c.name === SlimeParser.prototype.StatementList.name
          )

          if (innerList) {
            // 递归处理内部语句，直接展开
            const innerStatements = this.createStatementListAst(innerList)
            // ✨ 标记这些语句来自 #{} 块
            // 后续 IIFE 决策会根据此标记判断是否需要复杂模式
            innerStatements.forEach(stmt => {
              (stmt as any).__fromNoRenderBlock = true
            })
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
   * 重写 PrimaryExpression 处理
   *
   * 添加对 OvsRenderFunction 的支持
   * OvsRenderFunction 在 OvsParser 中被放在 PrimaryExpression 层级
   */
  createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
    const first = cst.children?.[0]

    // 处理 OvsRenderFunction
    if (first && first.name === OvsParser.prototype.OvsRenderFunction.name) {
      return this.createOvsRenderDomViewDeclarationAst(first)
    }

    // 其他情况调用父类处理
    return super.createPrimaryExpressionAst(cst)
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
  /**
   * 递归查找 CST 树中是否包含 OvsRenderFunction 节点
   * Expression 层级很深，需要递归遍历
   */
  private findOvsRenderFunction(cst: SubhutiCst): boolean {
    if (!cst) return false

    // 直接匹配
    if (cst.name === OvsParser.prototype.OvsRenderFunction.name) {
      return true
    }

    // 递归检查第一个子节点（表达式解析的核心路径）
    if (cst.children && cst.children.length > 0) {
      return this.findOvsRenderFunction(cst.children[0])
    }

    return false
  }

  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement | any {
    const exprCst = cst.children?.[0]
    if (!exprCst) {
      throw new Error('ExpressionStatement has no expression')
    }

    // 检查是否包含 OvsRenderFunction（递归查找）
    const isOvsRenderFunction = this.findOvsRenderFunction(exprCst)

    const expr = this.createExpressionAst(exprCst)

    // 判断逻辑
    if (this.ovsRenderDomViewDepth > 0) {
      // 在 div {} 内

      // 1. OvsRenderFunction → 永远渲染（优先级最高）
      if (isOvsRenderFunction) {
        const pushCall = SlimeNodeCreate.createCallExpression(
          SlimeNodeCreate.createMemberExpression(
            SlimeNodeCreate.createIdentifier('children'),
            SlimeTokenCreate.createDotToken(cst.loc),
            SlimeNodeCreate.createIdentifier('push')
          ),
          [expr]
        )
        // 设置 pushCall 的 loc，用于 source map 映射
        if (cst.loc) {
          pushCall.loc = cst.loc
        }
        return {
          type: SlimeNodeType.ExpressionStatement,
          expression: pushCall,
          loc: cst.loc
        } as SlimeExpressionStatement
      }

      // 2. 在 #{} 内 → 不渲染，保持原样
      if (this.noRenderDepth > 0) {
        return {
          type: SlimeNodeType.ExpressionStatement,
          expression: expr,
          loc: cst.loc
        } as SlimeExpressionStatement
      }

      // 3. 在 div {} 内，不在 #{} 内 → 渲染
      const pushCall = SlimeNodeCreate.createCallExpression(
        SlimeNodeCreate.createMemberExpression(
          SlimeNodeCreate.createIdentifier('children'),
          SlimeTokenCreate.createDotToken(cst.loc),
          SlimeNodeCreate.createIdentifier('push')
        ),
        [expr]
      )
      // 设置 pushCall 的 loc，用于 source map 映射
      if (cst.loc) {
        pushCall.loc = cst.loc
      }
      return {
        type: SlimeNodeType.ExpressionStatement,
        expression: pushCall,
        loc: cst.loc
      } as SlimeExpressionStatement
    }
    
    // 不在 div {} 内 → 保持原样
    return {
      type: SlimeNodeType.ExpressionStatement,
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
   *    - 简单（只有表达式）：createComponentVNode('div', {}, [children])  ⭐ 无 IIFE
   *    - 复杂（有语句）：IIFE包裹
   * 4. 退出时计数器 -1，弹出栈（用 try-finally 保证）
   *
   * 示例（简单）：
   * 输入：div { h1 { greeting } }
   * 输出：createComponentVNode('div', {}, [
   *   createComponentVNode('h1', {}, [greeting])
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
   *   return createComponentVNode('div', {attrs: temp$$attrs$$uuid}, children)
   * })()
   */
  createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeExpression {
    // 支持 OvsRenderFunction（表达式版本）和 OvsRenderStatement（语句版本）
    // 两者的 CST 结构相同，只是名称不同
    const isRenderFunction = cst.name === OvsParser.prototype.OvsRenderFunction.name
    const isRenderStatement = cst.name === OvsParser.prototype.OvsRenderStatement.name
    if (!isRenderFunction && !isRenderStatement) {
      throw new Error(`Expected OvsRenderFunction or OvsRenderStatement, got ${cst.name}`)
    }

    // 获取元素/组件名称
    // OvsRenderFunction/OvsRenderStatement 使用 IdentifierReference，需要通过专门的方法转换
    const idCst = cst.children?.[0]
    if (!idCst) {
      throw new Error('OvsRenderDomViewDeclaration has no identifier')
    }
    const id = this.createIdentifierReferenceAst(idCst)
    
    // 设置 loc 信息，确保包含 value（标签名）用于源码映射
    if (idCst.loc) {
      id.loc = {
        type: idCst.loc.type,
        value: id.name,  // 关键：设置 value 为标签名，供 SlimeGenerator 使用
        start: idCst.loc.start,
        end: idCst.loc.end
      }
    }

    // 查找 Arguments 节点（组件调用参数）
    // 使用 SlimeParser.prototype.XXX.name 确保与 Parser 同步
    const argumentsName = SlimeParser.prototype.Arguments?.name || 'Arguments'
    const argumentsCst = cst.children?.find(child => child.name === argumentsName)
    let componentProps: SlimeExpression | null = null

    if (argumentsCst && argumentsCst.children) {
      // 提取 Arguments 内的参数
      // Arguments 结构：LParen, ArgumentList?, RParen
      const argumentListName = SlimeParser.prototype.ArgumentList?.name || 'ArgumentList'
      const argListCst = argumentsCst.children.find(child => child.name === argumentListName)
      if (argListCst && argListCst.children?.[0]?.children?.[0]) {
        // 直接使用第一个参数作为 componentProps
        componentProps = this.createExpressionAst(argListCst.children[0].children[0])
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
      const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'
      const statementListCst = cst.children?.find(child =>
        child.name === statementListName
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

      // 判断是否有复杂语句（需要 IIFE）
      // 
      // IIFE 判断规则（v0.2.1 优化）：
      // 只要满足以下任一条件，就需要复杂模式（IIFE）：
      // 1. 有非 ExpressionStatement（声明/控制流）
      // 2. 有来自 #{} 不渲染块的语句
      // 
      // 好处：
      // - 与实现解耦：不依赖 children.push() 这个具体函数名
      // - 语义清晰：直接表达"有复杂内容就用IIFE"
      // - 高度稳定：未来改变渲染方式时，此逻辑无需改动
      const hasComplexStatements = bodyStatements.some(stmt => {
        // 情况1: 非 ExpressionStatement（声明/控制流）
        if (stmt.type !== SlimeNodeType.ExpressionStatement) {
          return true
        }
        
        // 情况2: 来自 #{} 不渲染块的语句
        if ((stmt as any).__fromNoRenderBlock) {
          return true
        }
        
        return false
      })
      
      const isSimple = !hasComplexStatements
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
   * 创建简单视图（直接返回标签函数调用，无 IIFE）
   *
   * 生成：
   * - HTML 标签：div(props, children) - 直接调用 htmlElements 中的函数
   * - 组件：MyComponent(props, children) - 调用组件函数
   *
   * @param id 元素/组件标识符
   * @param statements 语句数组（只包含 ExpressionStatement）
   * @param attrsVarName attrs变量名（已弃用，保留用于将来功能）
   * @returns CallExpression - 标签函数调用
   */
  private createSimpleView(
    id: SlimeIdentifier,
    statements: SlimeStatement[],
    _attrsVarName: string | null,
    componentProps: SlimeExpression | null
  ): SlimeCallExpression {
    // 从 ExpressionStatement 中提取表达式，并包装为 ArrayElement
    const childElements = statements.map((stmt, index) => {
      const exprStmt = stmt as SlimeExpressionStatement
      const pushCall = exprStmt.expression as SlimeCallExpression
      let element: SlimeExpression
      if (pushCall && pushCall.type === SlimeNodeType.CallExpression && pushCall.arguments.length > 0) {
        element = pushCall.arguments[0] as SlimeExpression
      } else {
        element = exprStmt.expression
      }
      // 包装为 ArrayElement，除了最后一个元素都需要逗号
      const needComma = index < statements.length - 1
      return SlimeNodeCreate.createArrayElement(element, needComma ? SlimeTokenCreate.createCommaToken() : undefined)
    })

    // 创建 children 数组
    const childrenArray = SlimeNodeCreate.createArrayExpression(childElements)

    // 创建 props 对象：如果是组件调用，使用 componentProps，否则用空对象
    const propsObject = componentProps || SlimeNodeCreate.createObjectExpression([])

    // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
    const callee = createCalleeForTag(id.name, id.loc)

    // 创建 tagName(props, children) 或 $OvsHtmlTag.tagName(props, children) 调用
    const vNodeCall = SlimeNodeCreate.createCallExpression(
      callee,
      [
        propsObject,      // 第一个参数：props
        childrenArray     // 第二个参数：children
      ]
    )

    // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
    // 这样 LSP 可以准确映射到原始位置，提供准确的代码建议
    if (id.loc) {
      vNodeCall.loc = id.loc
    }

    return vNodeCall
  }

  /**
   * 创建基础 IIFE（不需要id）
   *
   * 生成：
   * (function() {
   *   const children = []
   *   ...statements
   *   return children
   * })()
   *
   * 这是通用的IIFE生成逻辑，被 createComplexIIFE 和顶层导出逻辑调用
   *
   * @param statements 语句数组
   * @param attrsVarName attrs变量名（可选，已弃用，保留用于将来功能）
   * @returns CallExpression
   */
  public createBaseIIFE(
    statements: SlimeStatement[],
    attrsVarName?: string | null
  ): SlimeCallExpression {
    // 生成完整的 IIFE 函数体
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. 声明 children 数组：const children = []
      // 注意：这是自动生成的代码，不传递loc（避免创建错误映射）
      SlimeNodeCreate.createVariableDeclaration(
          SlimeTokenCreate.createConstToken(),
        [
          SlimeNodeCreate.createVariableDeclarator(
            SlimeNodeCreate.createIdentifier('children'),
            SlimeTokenCreate.createAssignToken(),
            SlimeNodeCreate.createArrayExpression([])
          )
        ]
      )
    ]

    // 2. 如果有attrs，声明 attrs 对象：const temp$$attrs$$uuid = {}
    // 注意：这也是自动生成的代码，不传递loc（避免创建错误映射）
    if (attrsVarName) {
      const attrsDeclaration = SlimeNodeCreate.createVariableDeclaration(
          SlimeTokenCreate.createConstToken(),
        [
          SlimeNodeCreate.createVariableDeclarator(
            SlimeNodeCreate.createIdentifier(attrsVarName),
              SlimeTokenCreate.createAssignToken(),
            SlimeNodeCreate.createObjectExpression([])
          )
        ]
      )
      iifeFunctionBody.push(attrsDeclaration)
    }

    // 3. 转换后的语句（包含 temp$$attrs$$.name = value 和 children.push()）
    iifeFunctionBody.push(...statements)

    // 4. 返回 children
    iifeFunctionBody.push(
      SlimeNodeCreate.createReturnStatement(
        SlimeNodeCreate.createIdentifier('children')
      )
    )

    // 生成 IIFE：(function() { ... })()
    return this.createIIFE(iifeFunctionBody)
  }

  /**
   * 创建完整的 IIFE（需要id）
   *
   * 生成：
   * (function() {
   *   const children = []
   *   ...statements
   *   return createComponentVNode(firstArg, props, children)
   * })()
   * 其中 firstArg 是标签字符串（'div'）或组件标识符（MyComponent）
   *
   * 调用基础的 createBaseIIFE() 然后包装返回 createComponentVNode
   *
   * @param id 元素/组件标识符
   * @param statements 语句数组
   * @param attrsVarName attrs变量名（已弃用，保留用于将来功能）
   * @param componentProps 组件props对象
   * @returns CallExpression
   */
  private createComplexIIFE(
    id: SlimeIdentifier,
    statements: SlimeStatement[],
    attrsVarName: string | null,
    componentProps: SlimeExpression | null
  ): SlimeCallExpression {
    // 1. 创建基础的 IIFE（包含children数组和push逻辑）
    const baseIIFE = this.createBaseIIFE(statements, attrsVarName)

    // 2. 但是基础IIFE返回的是children数组，我们需要把它改成返回 createComponentVNode
    // 所以需要重新构建函数体，用基础的前半部分逻辑，但改变return语句
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. 声明 children 数组：const children = []
      SlimeNodeCreate.createVariableDeclaration(
        SlimeTokenCreate.createConstToken(),
        [
          SlimeNodeCreate.createVariableDeclarator(
            SlimeNodeCreate.createIdentifier('children'),
            SlimeTokenCreate.createAssignToken(),
            SlimeNodeCreate.createArrayExpression([])
          )
        ]
      )
    ]

    // 2. 如果有attrs，声明 attrs 对象
    if (attrsVarName) {
      const attrsDeclaration = SlimeNodeCreate.createVariableDeclaration(
          SlimeTokenCreate.createConstToken(),
        [
          SlimeNodeCreate.createVariableDeclarator(
            SlimeNodeCreate.createIdentifier(attrsVarName),
              SlimeTokenCreate.createAssignToken(),
            SlimeNodeCreate.createObjectExpression([])
          )
        ]
      )
      iifeFunctionBody.push(attrsDeclaration)
    }

    // 3. 转换后的语句
    iifeFunctionBody.push(...statements)

    // 4. 返回 createComponentVNode(id, props, children) 而不是 children
    iifeFunctionBody.push(this.createReturnOvsAPICreateVNode(id, attrsVarName, componentProps))

    // 生成 IIFE：(function() { ... })()
    return this.createIIFE(iifeFunctionBody)
  }

  /**
   * 创建 return tagName(props, children) 语句
   *
   * 生成：
   * - HTML 标签：return div(props, children)
   * - 组件：return MyComponent(props, children)
   *
   * @param id 元素/组件标识符
   * @param attrsVarName attrs变量名（已弃用，保留用于将来功能）
   * @param componentProps 组件props对象
   * @returns ReturnStatement
   */
  private createReturnOvsAPICreateVNode(
    id: SlimeIdentifier,
    attrsVarName: string | null,
    componentProps: SlimeExpression | null
  ): SlimeStatement {

    // 创建 props 对象
    let propsObject
    if (componentProps) {
      // 组件调用：使用 componentProps
      propsObject = componentProps
    } else {
      // 普通元素无自定义props：{}
      // 注：attrsVarName 保留用于将来的属性赋值功能
      propsObject = SlimeNodeCreate.createObjectExpression([])
    }

    // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
    const callee = createCalleeForTag(id.name, id.loc)

    // 创建函数调用：tagName(props, children) 或 $OvsHtmlTag.tagName(props, children)
    const callExpression = SlimeNodeCreate.createCallExpression(
      callee,
      [
        propsObject,                                  // 第一个参数：props 对象
        SlimeNodeCreate.createIdentifier('children')    // 第二个参数：children 数组（固定名字）
      ]
    )

    // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
    if (id.loc) {
      callExpression.loc = id.loc
    }

    // 包装为 return 语句
    return SlimeNodeCreate.createReturnStatement(callExpression)
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
    const blockStatement = SlimeNodeCreate.createBlockStatement(
      body,
      loc,
      SlimeTokenCreate.createLBraceToken(loc),
      SlimeTokenCreate.createRBraceToken(loc)
    )

    // 创建函数表达式
    const functionExpression = SlimeNodeCreate.createFunctionExpression(
      blockStatement,
      null,  // id
      [],    // params (空参数)
      false, // generator
      false, // async
      loc,
      undefined, // functionToken
      undefined, // asyncToken
      undefined, // asteriskToken
      SlimeTokenCreate.createLParenToken(loc),  // lParenToken
      SlimeTokenCreate.createRParenToken(loc)   // rParenToken
    )

    // 用括号包裹 function expression，使其成为合法的 IIFE
    const parenExpr = SlimeNodeCreate.createParenthesizedExpression(functionExpression, loc)

    // 创建函数调用（立即执行）
    const callExpression = SlimeNodeCreate.createCallExpression(parenExpr, [])

    return callExpression
  }

}

const OvsCstToSlimeNodeCreate = new OvsCstToSlimeAst()
export default OvsCstToSlimeNodeCreate
