// 使用包名导入
import { CssTsCstToAst } from "cssts-compiler";
import { SubhutiCst } from "subhuti";
import OvsParser from "../parser/OvsParser.ts";
import {
  SlimeAstTypeName,
  type SlimeBlockStatement,
  type SlimeCallExpression,
  type SlimeExpression,
  type SlimeExpressionStatement,
  type SlimeIdentifier,
  type SlimeModuleDeclaration,
  type SlimeProgram,
  type SlimeStatement,
  SlimeAstCreateUtils,
  SlimeTokenCreateUtils
} from "slime-ast";
import { SlimeParser, registerSlimeCstToAstUtil } from "slime-parser";

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

/**
 * 判断表达式是否是副作用表达式（不应该渲染）
 *
 * 副作用表达式的主要目的是产生副作用，返回值只是副产品：
 * - AssignmentExpression: x = 1, x += 1, x ||= 1 等
 * - UpdateExpression: x++, ++x, x--, --x
 * - UnaryExpression(delete): delete obj.prop
 * - UnaryExpression(void): void expr（显式丢弃返回值）
 *
 * 这些表达式在 OVS 渲染上下文中不应该被 children.push()
 */
function isSideEffectExpression(expr: SlimeExpression): boolean {
  // 赋值表达式 - 副作用
  if (expr.type === SlimeAstTypeName.AssignmentExpression) {
    return true
  }

  // 更新表达式 - 副作用
  if (expr.type === SlimeAstTypeName.UpdateExpression) {
    return true
  }

  // delete 表达式 - 副作用
  if (expr.type === SlimeAstTypeName.UnaryExpression &&
    (expr as any).operator === 'delete') {
    return true
  }

  // void 表达式 - 显式丢弃返回值，不渲染
  if (expr.type === SlimeAstTypeName.UnaryExpression &&
    (expr as any).operator === 'void') {
    return true
  }

  return false
}

/** 
 * 创建 callee 表达式
 * - HTML 标签返回 $OvsHtmlTag.xxx
 * - 用户组件返回标识符（需要配合 h() 使用）
 */
function createCalleeForTag(tagName: string, loc?: any): SlimeExpression {
  if (isHtmlTag(tagName)) {
    // HTML 标签 → $OvsHtmlTag.tagName
    // 关键：给标签名标识符设置 loc，用于 source map 映射
    const tagIdentifier = SlimeAstCreateUtils.createIdentifier(tagName)
    if (loc) {
      tagIdentifier.loc = {
        ...loc,
        value: tagName  // 确保 value 字段包含标签名，供 SlimeGenerator 使用
      }
    }
    const memberExpr = SlimeAstCreateUtils.createMemberExpression(
      SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
      SlimeTokenCreateUtils.createDotToken(),
      tagIdentifier
    )
    if (loc) memberExpr.loc = loc
    return memberExpr
  } else {
    // 用户组件 → 直接使用标识符
    const id = SlimeAstCreateUtils.createIdentifier(tagName)
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

export class OvsCstToSlimeAst extends CssTsCstToAst {
  /**
   * 标记是否使用了 OVS 特有语法
   * 包括：div {}、view 声明、css {} 等
   * 如果没有使用 OVS 语法，则不做 defineOvsComponent 包装
   */
  private hasOvsSyntax = false;

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


  constructor() {
    super()  // 父类构造链会自动注册到 cssts 和 slime 层
    registerOvsCstToSlimeAst(this)  // 只注册到 ovs 层
  }


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
  /**
   * 重写父类的 resetState 方法，重置 OVS 特有的状态
   */
  protected override resetState(): void {
    super.resetState()
    this.hasOvsSyntax = false
    this.ovsRenderDomViewDepth = 0
    this.noRenderDepth = 0
    this.attrsVarNameStack = []
  }

  /**
   * 面向文件的完整 AST 转换：CST → AST + 后处理
   * 
   * 职责：完整的文件转换，包含所有后处理
   * - 添加 cssts/csstsAtom 导入（如果使用了 CSSTS 语法）
   * - 添加 $OvsHtmlTag/defineOvsComponent 导入（如果使用了 OVS 语法）
   * - 包装成 defineOvsComponent（如果没有 export 且使用了 OVS 语法）
   * 
   * 适用场景：vite 插件、实际编译
   */
  toFileAst(cst: SubhutiCst): SlimeProgram {
    // 先调用 toProgram 做纯 AST 转换
    const program = this.toProgram(cst)

    // 获取 body 进行后处理
    let body = [...program.body]

    // 1. CSSTS 后处理：添加 cssts 和 csstsAtom 导入
    body = this.processCsstsPostTransform(body)

    // 2. OVS 后处理：处理顶层表达式和自动导入
    body = this.processTopLevelAndImports(body)

    // 更新 program.body
    program.body = body

    return program
  }

  /**
   * 处理顶层表达式和自动导入
   * 
   * 职责分离：
   * 1. ensureRequiredImports - 自动添加导入（不改变语句顺序）
   * 2. wrapAsDefineOvsComponent - 包装成组件（内部会重排序）
   * 
   * 只有在需要包装时才会重排序，避免普通 JS 代码被错误重排
   */
  private processTopLevelAndImports(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
    // 如果没有使用 OVS 语法，直接返回原始 body，保持语句顺序不变
    if (!this.hasOvsSyntax) {
      return body
    }

    // 1. 自动添加导入（不改变其他语句顺序）
    body = this.ensureRequiredImports(body)

    // 2. 如果需要包装，才做包装（包装内部会重排序）
    if (this.shouldWrapAsComponent(body)) {
      body = this.wrapAsDefineOvsComponent(body)
    }

    return body
  }

  /**
   * 检查是否需要包装成 defineOvsComponent
   * 
   * 条件：
   * - 使用了 OVS 语法（hasOvsSyntax = true）
   * - 没有任何 export 语句
   * - 有顶层表达式语句
   */
  private shouldWrapAsComponent(body: Array<SlimeStatement | SlimeModuleDeclaration>): boolean {
    let hasAnyExport = false
    let hasTopLevelExpression = false

    for (const stmt of body) {
      if (stmt.type === SlimeAstTypeName.ExportDefaultDeclaration ||
        stmt.type === SlimeAstTypeName.ExportNamedDeclaration) {
        hasAnyExport = true
        break
      }
      if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
        hasTopLevelExpression = true
      }
    }

    return !hasAnyExport && hasTopLevelExpression
  }

  /**
   * 自动添加必要的导入语句
   * 
   * 检查 body 中是否使用了 $OvsHtmlTag、defineOvsComponent 等，
   * 如果使用了但没有导入，则在 body 开头添加导入语句。
   * 
   * 注意：只在 body 开头插入导入，不改变其他语句的顺序
   */
  private ensureRequiredImports(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
    const bodyJson = JSON.stringify(body)

    // 提取现有的 imports
    let imports: any[] = []
    const nonImports: any[] = []

    for (const stmt of body) {
      if (stmt.type === SlimeAstTypeName.ImportDeclaration) {
        imports.push(stmt)
      } else {
        nonImports.push(stmt)
      }
    }

    //todo 实现不优雅，不应该判断字符串
    // 检查并添加必要的导入
    if (bodyJson.includes('$OvsHtmlTag')) {
      imports = this.ensureOvsHtmlTagImport(imports)
    }
    if (bodyJson.includes('defineOvsComponent')) {
      imports = this.ensureDefineOvsComponentImport(imports)
    }

    // 返回：imports 在前，其他语句保持原顺序
    return [...imports, ...nonImports]
  }

  /**
   * 包装成 defineOvsComponent 导出
   * 
   * 将顶层表达式包装成：
   * export default defineOvsComponent((props) => {
   *   // declarations 放这里
   *   return expression
   * })
   * 
   * 注意：只有这个方法内部会重排序（imports → export default）
   */
  private wrapAsDefineOvsComponent(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
    // 分类语句
    let imports: any[] = []
    let declarations: any[] = []
    let expressions: SlimeStatement[] = []
    let otherStatements: any[] = []

    for (const stmt of body) {
      if (stmt.type === SlimeAstTypeName.ImportDeclaration) {
        imports.push(stmt)
      } else if (stmt.type === SlimeAstTypeName.VariableDeclaration ||
        stmt.type === SlimeAstTypeName.FunctionDeclaration ||
        stmt.type === SlimeAstTypeName.ClassDeclaration) {
        declarations.push(stmt)
      } else if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
        expressions.push(stmt as SlimeStatement)
      } else {
        otherStatements.push(stmt)
      }
    }

    // 确保有 defineOvsComponent 导入
    imports = this.ensureDefineOvsComponentImport(imports)

    // 提取表达式值
    const exprValues = expressions.map(e =>
      e.type === SlimeAstTypeName.ExpressionStatement ? (e as any).expression : e
    )

    // 处理单个或多个表达式
    let finalExpr: any
    if (exprValues.length === 1) {
      finalExpr = exprValues[0]
    } else {
      // 多个表达式，用 Fragment 包装
      imports = this.ensureFragmentImport(imports)
      finalExpr = this.createFragmentWrapper(exprValues)
    }

    // 创建 defineOvsComponent 包装
    // declarations 放在箭头函数体内，expressions 作为 return
    const returnStmt = SlimeAstCreateUtils.createReturnStatement(finalExpr)
    const blockStatement = SlimeAstCreateUtils.createBlockStatement([...declarations, ...otherStatements, returnStmt])
    const arrowFunction = SlimeAstCreateUtils.createArrowFunctionExpression(
      blockStatement,
      [SlimeAstCreateUtils.createIdentifier('props')],
      false,
      false
    )
    const defineOvsCall = SlimeAstCreateUtils.createCallExpression(
      SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
      [arrowFunction]
    )

    // 重排序：imports 在前，然后是 export default
    return [
      ...imports,
      {
        type: SlimeAstTypeName.ExportDefaultDeclaration,
        declaration: defineOvsCall
      } as any
    ]
  }

  /**
   * 确保有 $OvsHtmlTag 导入
   */
  private ensureOvsHtmlTagImport(imports: any[]): any[] {
    for (const imp of imports) {
      if (imp.source?.value === 'ovsjs') {
        const specs = imp.specifiers || []
        if (!specs.some((s: any) => s.imported?.name === '$OvsHtmlTag' || s.local?.name === '$OvsHtmlTag')) {
          specs.push({
            type: SlimeAstTypeName.ImportSpecifier,
            imported: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
            local: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag')
          })
        }
        return imports
      }
    }
    return [{
      type: SlimeAstTypeName.ImportDeclaration,
      specifiers: [{
        type: SlimeAstTypeName.ImportSpecifier,
        imported: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
        local: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag')
      }],
      source: SlimeAstCreateUtils.createStringLiteral('ovsjs')
    }, ...imports]
  }

  /**
   * 确保有 defineOvsComponent 导入
   */
  private ensureDefineOvsComponentImport(imports: any[]): any[] {
    for (const imp of imports) {
      if (imp.source?.value === 'ovsjs') {
        const specs = imp.specifiers || []
        if (!specs.some((s: any) => s.imported?.name === 'defineOvsComponent' || s.local?.name === 'defineOvsComponent')) {
          specs.push({
            type: SlimeAstTypeName.ImportSpecifier,
            imported: SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
            local: SlimeAstCreateUtils.createIdentifier('defineOvsComponent')
          })
        }
        return imports
      }
    }
    return [{
      type: SlimeAstTypeName.ImportDeclaration,
      specifiers: [{
        type: SlimeAstTypeName.ImportSpecifier,
        imported: SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
        local: SlimeAstCreateUtils.createIdentifier('defineOvsComponent')
      }],
      source: SlimeAstCreateUtils.createStringLiteral('ovsjs')
    }, ...imports]
  }

  /**
   * 确保有 Fragment 和 h 导入
   */
  private ensureFragmentImport(imports: any[]): any[] {
    for (const imp of imports) {
      if (imp.source?.value === 'vue') {
        const specs = imp.specifiers || []
        if (!specs.some((s: any) => s.imported?.name === 'Fragment')) {
          specs.push({
            type: SlimeAstTypeName.ImportSpecifier,
            imported: SlimeAstCreateUtils.createIdentifier('Fragment'),
            local: SlimeAstCreateUtils.createIdentifier('Fragment')
          })
        }
        if (!specs.some((s: any) => s.imported?.name === 'h')) {
          specs.push({
            type: SlimeAstTypeName.ImportSpecifier,
            imported: SlimeAstCreateUtils.createIdentifier('h'),
            local: SlimeAstCreateUtils.createIdentifier('h')
          })
        }
        return imports
      }
    }
    return [{
      type: SlimeAstTypeName.ImportDeclaration,
      specifiers: [
        { type: SlimeAstTypeName.ImportSpecifier, imported: SlimeAstCreateUtils.createIdentifier('Fragment'), local: SlimeAstCreateUtils.createIdentifier('Fragment') },
        { type: SlimeAstTypeName.ImportSpecifier, imported: SlimeAstCreateUtils.createIdentifier('h'), local: SlimeAstCreateUtils.createIdentifier('h') }
      ],
      source: SlimeAstCreateUtils.createStringLiteral('vue')
    }, ...imports]
  }

  /**
   * 创建 Fragment 包装
   */
  private createFragmentWrapper(expressions: any[]): any {
    const arrayElements = expressions.map((expr, index) => {
      const isLast = index === expressions.length - 1
      return SlimeAstCreateUtils.createArrayElement(expr, isLast ? undefined : SlimeTokenCreateUtils.createCommaToken())
    })
    return SlimeAstCreateUtils.createCallExpression(
      SlimeAstCreateUtils.createIdentifier('h'),
      [
        SlimeAstCreateUtils.createIdentifier('Fragment'),
        SlimeAstCreateUtils.createNullLiteralToken(),
        SlimeAstCreateUtils.createArrayExpression(arrayElements)
      ]
    )
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
   * 转换 OvsViewDeclaration 为 defineOvsComponent 包裹的组件
   *
   * 新语法输入：view ComponentName (props) { div { ... } }
   * 输出：const ComponentName = defineOvsComponent(props => { ... return div(...) })
   *
   * 这样生成的组件既可以：
   * 1. 在 OVS 内部作为函数调用（返回的组件会被 mapChildrenToVNodes 用 h() 渲染）
   * 2. 在 Vue 模板中作为组件使用
   * 3. 被 export 导出供其他文件使用
   *
   * CST 结构：OvsViewToken, IdentifierName, ArrowFormalParameters?, LBrace, StatementList?, RBrace
   */
  createOvsViewDeclarationAst(cst: SubhutiCst): any {
    checkCstName(cst, OvsParser.prototype.OvsViewDeclaration.name)

    // 标记使用了 OVS 语法
    this.hasOvsSyntax = true;

    const children = cst.children || []

    // 1. 提取组件名（第2个子节点：IdentifierName）
    const componentNameCst = children[1]
    if (!componentNameCst) {
      throw new Error('OvsViewDeclaration: missing component name')
    }
    const componentName = this.createIdentifierAst(componentNameCst)

    // 2. 提取参数（可选的 ArrowFormalParameters）
    // view 声明的参数会成为 defineOvsComponent 内部箭头函数的参数
    let params: any[] = []
    const arrowFormalParamsName = SlimeParser.prototype.ArrowFormalParameters?.name || 'ArrowFormalParameters'
    const formalParamsCst = children.find(c => c.name === arrowFormalParamsName)

    if (formalParamsCst) {
      params = this.createArrowFormalParametersAstWrapped(formalParamsCst)
    }
    // 如果没有声明参数，默认使用 props
    if (params.length === 0) {
      params = [SlimeAstCreateUtils.createIdentifier('props')]
    }

    // 3. 提取函数体内的 StatementList
    const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'
    const statementListCst = children.find(c => c.name === statementListName)

    let functionBodyStatements: SlimeStatement[] = []

    if (statementListCst) {
      // 转换 StatementList
      functionBodyStatements = this.createStatementListAst(statementListCst)
    }

    // 4. 处理函数体：检查最后一条语句
    // 如果最后一条是 ExpressionStatement 且表达式是 OvsRenderFunction 调用，
    // 需要将其转换为 return 语句
    // 关键：返回箭头函数 () => expr，而不是直接返回 expr
    // 这样 Vue 每次渲染时会重新执行箭头函数，响应式数据变化会触发更新
    if (functionBodyStatements.length > 0) {
      const lastStmt = functionBodyStatements[functionBodyStatements.length - 1]

      // 检查是否是 ExpressionStatement
      if (lastStmt.type === SlimeAstTypeName.ExpressionStatement) {
        const expr = (lastStmt as SlimeExpressionStatement).expression

        // 检查是否是 CallExpression（OvsRenderFunction 转换后的结果）
        // 简单视图：$OvsHtmlTag.div({}, [...])
        // 复杂视图：(function() { ... })() - IIFE
        if (expr.type === SlimeAstTypeName.CallExpression) {
          // 将表达式包装成箭头函数：() => expr
          // 这样 Vue 的渲染函数每次执行时都会重新求值响应式数据
          const arrowFunc = SlimeAstCreateUtils.createArrowFunctionExpression(
            expr,  // 表达式体
            [],    // 无参数
            false, // 非 async
            false  // 非 generator
          )

          // 将最后的表达式语句转换为 return () => expr
          functionBodyStatements[functionBodyStatements.length - 1] =
            SlimeAstCreateUtils.createReturnStatement(arrowFunc)
        }
      }
    }


    // 5. 创建箭头函数体
    const arrowFunctionBody = SlimeAstCreateUtils.createBlockStatement(
      functionBodyStatements,
      cst.loc,
      { type: 'LBrace', value: '{', loc: cst.loc } as any,
      { type: 'RBrace', value: '}', loc: cst.loc } as any
    )

    // 6. 创建箭头函数：props => { ... }
    const arrowFunction = SlimeAstCreateUtils.createArrowFunctionExpression(
      arrowFunctionBody,
      params,
      false,  // async
      false   // generator
    )

    // 7. 创建 defineOvsComponent(props => { ... }) 调用
    const defineOvsCall = SlimeAstCreateUtils.createCallExpression(
      SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
      [arrowFunction]
    )

    // 8. 创建变量声明：const ComponentName = defineOvsComponent(...)
    const variableDeclaration = SlimeAstCreateUtils.createVariableDeclaration(
      SlimeTokenCreateUtils.createConstToken(),
      [
        SlimeAstCreateUtils.createVariableDeclarator(
          componentName,
          SlimeTokenCreateUtils.createAssignToken(),
          defineOvsCall
        )
      ]
    )
    variableDeclaration.loc = cst.loc

    return variableDeclaration
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
          const pushCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createMemberExpression(
              SlimeAstCreateUtils.createIdentifier('children'),
              SlimeTokenCreateUtils.createDotToken(cst.loc),
              SlimeAstCreateUtils.createIdentifier('push')
            ),
            [expr]
          )
          if (cst.loc) {
            pushCall.loc = cst.loc
          }
          return [{
            type: SlimeAstTypeName.ExpressionStatement,
            expression: pushCall,
            loc: cst.loc
          } as SlimeExpressionStatement]
        }

        // 不在渲染上下文中，直接作为表达式语句
        return [{
          type: SlimeAstTypeName.ExpressionStatement,
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
        return this.createRenderExpressionStatement(expr, cst.loc)
      }

      // 2. 在 #{} 内 → 不渲染，保持原样
      if (this.noRenderDepth > 0) {
        return {
          type: SlimeAstTypeName.ExpressionStatement,
          expression: expr,
          loc: cst.loc
        } as SlimeExpressionStatement
      }

      // 3. 副作用表达式（赋值、更新、delete）→ 不渲染
      // 这些表达式的主要目的是副作用，返回值只是副产品
      if (isSideEffectExpression(expr)) {
        return {
          type: SlimeAstTypeName.ExpressionStatement,
          expression: expr,
          loc: cst.loc
        } as SlimeExpressionStatement
      }

      // 4. 求值表达式 → 渲染
      return this.createRenderExpressionStatement(expr, cst.loc)
    }

    // 不在 div {} 内 → 保持原样
    return {
      type: SlimeAstTypeName.ExpressionStatement,
      expression: expr,
      loc: cst.loc
    } as SlimeExpressionStatement
  }

  /**
   * 创建渲染表达式语句 - 包装为 children.push(expr)
   */
  private createRenderExpressionStatement(expr: SlimeExpression, loc: any): SlimeExpressionStatement {
    const pushCall = SlimeAstCreateUtils.createCallExpression(
      SlimeAstCreateUtils.createMemberExpression(
        SlimeAstCreateUtils.createIdentifier('children'),
        SlimeTokenCreateUtils.createDotToken(loc),
        SlimeAstCreateUtils.createIdentifier('push')
      ),
      [expr]
    )
    if (loc) {
      pushCall.loc = loc
    }
    return {
      type: SlimeAstTypeName.ExpressionStatement,
      expression: pushCall,
      loc: loc
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
    // 标记使用了 OVS 语法
    this.hasOvsSyntax = true

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

    // 查找 OvsArguments 节点（OVS 专属参数语法）
    // 新语法：div(id = "main", class = { colorRed }) {}
    const ovsArgumentsName = 'OvsArguments'
    const ovsArgumentsCst = cst.children?.find(child => child.name === ovsArgumentsName)
    let componentProps: SlimeExpression | null = null

    if (ovsArgumentsCst) {
      // 转换 OvsArguments 为对象表达式
      componentProps = this.createOvsArgumentsAst(ovsArgumentsCst)
    } else {
      // 兼容旧语法：查找普通 Arguments 节点
      const argumentsName = SlimeParser.prototype.Arguments?.name || 'Arguments'
      const argumentsCst = cst.children?.find(child => child.name === argumentsName)

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
      // IIFE 判断规则：
      // 只要满足以下任一条件，就需要复杂模式（IIFE）：
      // 1. 有非 ExpressionStatement（声明/控制流）
      // 2. 有来自 #{} 不渲染块的语句
      // 3. 有副作用表达式（赋值/更新/delete）—— 这些不会变成 children.push()
      //
      // 这与 createExpressionStatementAst 中的渲染判断逻辑保持一致：
      // - 副作用表达式不渲染，所以需要 IIFE 来执行它们
      // - 求值表达式会变成 children.push()，可以内联到数组中
      const hasComplexStatements = bodyStatements.some(stmt => {
        // 情况1: 非 ExpressionStatement（声明/控制流）
        if (stmt.type !== SlimeAstTypeName.ExpressionStatement) {
          return true
        }

        // 情况2: 来自 #{} 不渲染块的语句
        if ((stmt as any).__fromNoRenderBlock) {
          return true
        }

        // 情况3: 副作用表达式（赋值/更新/delete）
        // 这些表达式不会变成 children.push()，需要在 IIFE 中执行
        const expr = (stmt as SlimeExpressionStatement).expression
        if (expr && isSideEffectExpression(expr)) {
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
      if (pushCall && pushCall.type === SlimeAstTypeName.CallExpression && pushCall.arguments.length > 0) {
        element = pushCall.arguments[0] as SlimeExpression
      } else {
        element = exprStmt.expression
      }
      // 包装为 ArrayElement，除了最后一个元素都需要逗号
      const needComma = index < statements.length - 1
      return SlimeAstCreateUtils.createArrayElement(element, needComma ? SlimeTokenCreateUtils.createCommaToken() : undefined)
    })

    // 创建 children 数组
    const childrenArray = SlimeAstCreateUtils.createArrayExpression(childElements)

    // 创建 props 对象：如果是组件调用，使用 componentProps，否则用空对象
    const propsObject = componentProps || SlimeAstCreateUtils.createObjectExpression([])

    // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
    const callee = createCalleeForTag(id.name, id.loc)

    // 创建 tagName(props, children) 或 $OvsHtmlTag.tagName(props, children) 调用
    const vNodeCall = SlimeAstCreateUtils.createCallExpression(
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
      SlimeAstCreateUtils.createVariableDeclaration(
        SlimeTokenCreateUtils.createConstToken(),
        [
          SlimeAstCreateUtils.createVariableDeclarator(
            SlimeAstCreateUtils.createIdentifier('children'),
            SlimeTokenCreateUtils.createAssignToken(),
            SlimeAstCreateUtils.createArrayExpression([])
          )
        ]
      )
    ]

    // 2. 如果有attrs，声明 attrs 对象：const temp$$attrs$$uuid = {}
    // 注意：这也是自动生成的代码，不传递loc（避免创建错误映射）
    if (attrsVarName) {
      const attrsDeclaration = SlimeAstCreateUtils.createVariableDeclaration(
        SlimeTokenCreateUtils.createConstToken(),
        [
          SlimeAstCreateUtils.createVariableDeclarator(
            SlimeAstCreateUtils.createIdentifier(attrsVarName),
            SlimeTokenCreateUtils.createAssignToken(),
            SlimeAstCreateUtils.createObjectExpression([])
          )
        ]
      )
      iifeFunctionBody.push(attrsDeclaration)
    }

    // 3. 转换后的语句（包含 temp$$attrs$$.name = value 和 children.push()）
    iifeFunctionBody.push(...statements)

    // 4. 返回 children
    iifeFunctionBody.push(
      SlimeAstCreateUtils.createReturnStatement(
        SlimeAstCreateUtils.createIdentifier('children')
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
    // 构建 IIFE 函数体
    const iifeFunctionBody: SlimeStatement[] = [
      // 1. 声明 children 数组：const children = []
      SlimeAstCreateUtils.createVariableDeclaration(
        SlimeTokenCreateUtils.createConstToken(),
        [
          SlimeAstCreateUtils.createVariableDeclarator(
            SlimeAstCreateUtils.createIdentifier('children'),
            SlimeTokenCreateUtils.createAssignToken(),
            SlimeAstCreateUtils.createArrayExpression([])
          )
        ]
      )
    ]

    // 2. 如果有attrs，声明 attrs 对象
    if (attrsVarName) {
      const attrsDeclaration = SlimeAstCreateUtils.createVariableDeclaration(
        SlimeTokenCreateUtils.createConstToken(),
        [
          SlimeAstCreateUtils.createVariableDeclarator(
            SlimeAstCreateUtils.createIdentifier(attrsVarName),
            SlimeTokenCreateUtils.createAssignToken(),
            SlimeAstCreateUtils.createObjectExpression([])
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
    _attrsVarName: string | null,  // 保留用于将来的属性赋值功能
    componentProps: SlimeExpression | null
  ): SlimeStatement {

    // 创建 props 对象
    let propsObject
    if (componentProps) {
      // 组件调用：使用 componentProps
      propsObject = componentProps
    } else {
      // 普通元素无自定义props：{}
      propsObject = SlimeAstCreateUtils.createObjectExpression([])
    }

    // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
    const callee = createCalleeForTag(id.name, id.loc)

    // 创建函数调用：tagName(props, children) 或 $OvsHtmlTag.tagName(props, children)
    const callExpression = SlimeAstCreateUtils.createCallExpression(
      callee,
      [
        propsObject,                                  // 第一个参数：props 对象
        SlimeAstCreateUtils.createIdentifier('children')    // 第二个参数：children 数组（固定名字）
      ]
    )

    // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
    if (id.loc) {
      callExpression.loc = id.loc
    }

    // 包装为 return 语句
    return SlimeAstCreateUtils.createReturnStatement(callExpression)
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
    const blockStatement = SlimeAstCreateUtils.createBlockStatement(
      body,
      loc,
      SlimeTokenCreateUtils.createLBraceToken(loc),
      SlimeTokenCreateUtils.createRBraceToken(loc)
    )

    // 创建函数表达式
    const functionExpression = SlimeAstCreateUtils.createFunctionExpression(
      blockStatement,
      null,  // id
      [],    // params (空参数)
      false, // generator
      false, // async
      loc,
      undefined, // functionToken
      undefined, // asyncToken
      undefined, // asteriskToken
      SlimeTokenCreateUtils.createLParenToken(loc),  // lParenToken
      SlimeTokenCreateUtils.createRParenToken(loc)   // rParenToken
    )

    // 用括号包裹 function expression，使其成为合法的 IIFE
    const parenExpr = SlimeAstCreateUtils.createParenthesizedExpression(functionExpression, loc)

    // 创建函数调用（立即执行）
    const callExpression = SlimeAstCreateUtils.createCallExpression(parenExpr, [])

    return callExpression
  }

  // ==================== OVS 参数语法转换 ====================

  /**
   * 转换 OvsArguments CST 为 ObjectExpression AST
   * 
   * 输入 CST: OvsArguments -> OvsPropertyDefinitionList -> OvsPropertyDefinition*
   * 输出 AST: ObjectExpression { properties: SlimeObjectPropertyItem[] }
   * 
   * 特殊处理：
   * - class = { colorRed, fontBold } → class: [OvsCls.colorRed, OvsCls.fontBold]
   */
  createOvsArgumentsAst(cst: SubhutiCst): SlimeExpression {
    const properties: any[] = []

    // 查找 OvsPropertyDefinitionList
    const propListCst = cst.children?.find(child => child.name === 'OvsPropertyDefinitionList')

    if (propListCst && propListCst.children) {
      const propDefs = propListCst.children.filter(c => c.name === 'OvsPropertyDefinition')

      for (let i = 0; i < propDefs.length; i++) {
        const propDefCst = propDefs[i]
        const prop = this.createOvsPropertyDefinitionAst(propDefCst)
        if (prop) {
          // 包装为 ObjectPropertyItem，除了最后一个都需要逗号
          const needComma = i < propDefs.length - 1
          properties.push(
            SlimeAstCreateUtils.createObjectPropertyItem(
              prop,
              needComma ? SlimeTokenCreateUtils.createCommaToken() : undefined
            )
          )
        }
      }
    }

    return SlimeAstCreateUtils.createObjectExpression(properties)
  }

  /**
   * 转换 OvsPropertyDefinition CST 为 Property AST
   * 
   * 处理的语法形式：
   * 1. PropertyName = AssignmentExpression  → { key: value }
   * 2. MethodDefinition                     → { method() {} }
   * 3. ... AssignmentExpression             → { ...spread }
   * 4. IdentifierReference                  → { shorthand: true }
   * 
   * 特殊处理 class 属性：
   * - class = { colorRed, fontBold } → class: [OvsCls.colorRed, OvsCls.fontBold]
   */
  createOvsPropertyDefinitionAst(cst: SubhutiCst): any {
    if (!cst.children || cst.children.length === 0) return null

    const firstChild = cst.children[0]

    // 1. 展开属性: ... AssignmentExpression
    if (firstChild.name === 'Ellipsis' || firstChild.value === '...') {
      const exprCst = cst.children.find(c =>
        c.name !== 'Ellipsis' && c.value !== '...'
      )
      if (exprCst) {
        const argument = this.createExpressionAst(exprCst)
        return SlimeAstCreateUtils.createSpreadElement(argument, cst.loc)
      }
      return null
    }

    // 2. 方法定义: MethodDefinition
    if (firstChild.name === 'MethodDefinition') {
      // MethodDefinition 在对象字面量中会被转换为 Property with method: true
      // 先创建 MethodDefinition AST，然后转换为 Property
      const methodDef = this.createMethodDefinitionAst(null, firstChild)

      const keyAst = SlimeAstCreateUtils.createPropertyAst(methodDef.key, methodDef.value)

      // 继承 MethodDefinition 的 computed 标志
      if (methodDef.computed) {
        keyAst.computed = true
      }

      // 继承 MethodDefinition 的 kind 标志（getter/setter/method）
      if (methodDef.kind === 'get' || methodDef.kind === 'set') {
        keyAst.kind = methodDef.kind
      } else {
        // 普通方法使用 method: true
        keyAst.method = true
      }

      keyAst.loc = cst.loc
      return keyAst
    }

    // 3. PropertyName = AssignmentExpression 或 简写属性
    // 查找 PropertyName
    const propertyNameCst = cst.children.find(c => c.name === 'PropertyName')

    // 查找 = 号后的表达式
    const assignIndex = cst.children.findIndex(c => c.value === '=' || c.name === 'Assign')

    if (propertyNameCst && assignIndex !== -1) {
      // 完整属性: name = value
      const key = this.createPropertyNameAst(propertyNameCst)
      const keyName = this.getPropertyKeyName(key)

      // 找到 = 后面的表达式
      const valueCst = cst.children[assignIndex + 1]
      if (!valueCst) return null

      let value = this.createExpressionAst(valueCst)

      // 特殊处理 class 属性
      if (keyName === 'class' && value.type === SlimeAstTypeName.ObjectExpression) {
        value = this.transformClassObjectToArray(value)
      }

      // 使用 createPropertyAst 创建属性
      const prop = SlimeAstCreateUtils.createPropertyAst(key, value)
      prop.loc = cst.loc
      return prop
    }

    // 4. 简写属性: IdentifierReference
    const idRefCst = cst.children.find(c => c.name === 'IdentifierReference')
    if (idRefCst) {
      const id = this.createIdentifierReferenceAst(idRefCst)
      // 创建简写属性
      const prop = SlimeAstCreateUtils.createPropertyAst(id, { ...id })
      prop.shorthand = true
      prop.loc = cst.loc
      return prop
    }

    return null
  }

  /**
   * 获取属性键的名称（用于判断是否是 class 属性）
   */
  private getPropertyKeyName(key: any): string | null {
    if (key.type === SlimeAstTypeName.Identifier) {
      return key.name
    }
    if (key.type === SlimeAstTypeName.Literal && typeof key.value === 'string') {
      return key.value
    }
    return null
  }

  /**
   * 转换 class 对象为数组
   * 
   * 输入: { colorRed, fontBold }  (ObjectExpression with shorthand properties)
   * 输出: [OvsCls.colorRed, OvsCls.fontBold]  (ArrayExpression)
   */
  private transformClassObjectToArray(objExpr: any): SlimeExpression {
    const elements: any[] = []

    if (objExpr.properties) {
      const propItems = objExpr.properties
      const totalProps = propItems.length

      for (let i = 0; i < totalProps; i++) {
        const propItem = propItems[i]
        // SlimeObjectPropertyItem 结构: { property: SlimeProperty, commaToken? }
        const prop = propItem.property || propItem

        // 只处理简写属性
        if (prop.shorthand && prop.key && prop.key.type === SlimeAstTypeName.Identifier) {
          const className = prop.key.name
          // 创建 OvsCls.className
          const memberExpr = SlimeAstCreateUtils.createMemberExpression(
            SlimeAstCreateUtils.createIdentifier('OvsCls'),
            SlimeTokenCreateUtils.createDotToken(),
            SlimeAstCreateUtils.createIdentifier(className)
          )
          elements.push(
            SlimeAstCreateUtils.createArrayElement(
              memberExpr,
              i < totalProps - 1
                ? SlimeTokenCreateUtils.createCommaToken()
                : undefined
            )
          )
        }
      }
    }

    return SlimeAstCreateUtils.createArrayExpression(elements)
  }

  /**
   * 转换 PropertyName CST 为 AST
   */
  private createPropertyNameAst(cst: SubhutiCst): any {
    if (!cst.children || cst.children.length === 0) return null

    const child = cst.children[0]

    // LiteralPropertyName
    if (child.name === 'LiteralPropertyName') {
      return this.createLiteralPropertyNameAst(child)
    }

    // ComputedPropertyName
    if (child.name === 'ComputedPropertyName') {
      return this.createComputedPropertyNameAst(child)
    }

    return null
  }

  /**
   * 转换 LiteralPropertyName CST 为 AST
   */
  private createLiteralPropertyNameAst(cst: SubhutiCst): any {
    if (!cst.children || cst.children.length === 0) return null

    const child = cst.children[0]

    // IdentifierName
    if (child.name === 'IdentifierName' || child.value) {
      const name = child.value || child.children?.[0]?.value
      return SlimeAstCreateUtils.createIdentifier(name)
    }

    // StringLiteral / NumericLiteral
    if (child.name === 'StringLiteral' || child.name === 'NumericLiteral') {
      return this.createLiteralAst(child)
    }

    return null
  }

  /**
   * 转换 ComputedPropertyName CST 为 AST
   */
  private createComputedPropertyNameAst(cst: SubhutiCst): any {
    // [expression]
    const exprCst = cst.children?.find(c =>
      c.name !== 'LBracket' && c.name !== 'RBracket' &&
      c.value !== '[' && c.value !== ']'
    )
    if (exprCst) {
      return this.createExpressionAst(exprCst)
    }
    return null
  }

  // ==================== 函数作用域边界处理 ====================
  // 
  // 核心规则：OVS 渲染上下文不穿透函数边界
  // 
  // 问题场景：
  //   div { button(onClick() { addTodo() }) {} }
  //   
  // 错误行为：addTodo() 被包装成 children.push(addTodo())
  // 正确行为：addTodo() 直接执行，不包装
  //
  // 原因：函数体是独立的 JavaScript 执行上下文，不属于 OVS 渲染上下文

  /**
   * 重写 createFunctionBodyAst：进入函数体时暂时退出 OVS 渲染上下文
   * 
   * 覆盖的场景：
   * - function f() { ... }
   * - onClick() { ... }（MethodDefinition）
   * - async function() { ... }
   * - *function() { ... }（Generator）
   */
  createFunctionBodyAst(cst: SubhutiCst): Array<SlimeStatement> {
    // 保存当前渲染上下文状态
    const savedRenderDepth = this.ovsRenderDomViewDepth
    const savedNoRenderDepth = this.noRenderDepth

    // 进入函数体 = 退出 OVS 渲染上下文
    this.ovsRenderDomViewDepth = 0
    this.noRenderDepth = 0

    try {
      return super.createFunctionBodyAst(cst)
    } finally {
      // 退出函数体 = 恢复之前的渲染上下文
      this.ovsRenderDomViewDepth = savedRenderDepth
      this.noRenderDepth = savedNoRenderDepth
    }
  }

  /**
   * 重写 createConciseBodyAst：箭头函数体
   * 
   * 两种形式：
   * 1. () => { statements } - block 形式，需要重置渲染上下文
   * 2. () => expression - 表达式形式，不需要重置（不走 StatementList）
   */
  createConciseBodyAst(cst: SubhutiCst): SlimeBlockStatement | SlimeExpression {
    const first = cst.children?.[0]

    // 只有 block 形式 () => { ... } 需要重置渲染上下文
    if (first?.name === 'LBrace') {
      const savedRenderDepth = this.ovsRenderDomViewDepth
      const savedNoRenderDepth = this.noRenderDepth

      this.ovsRenderDomViewDepth = 0
      this.noRenderDepth = 0

      try {
        return super.createConciseBodyAst(cst)
      } finally {
        this.ovsRenderDomViewDepth = savedRenderDepth
        this.noRenderDepth = savedNoRenderDepth
      }
    }

    // 表达式形式 () => expr 直接调用父类
    return super.createConciseBodyAst(cst)
  }

}

// ==================== 全局注册机制 ====================
// 使用 Proxy 模式，确保导入的 ovsCstToSlimeAst 能动态代理到当前注册的实例
// 初始化默认实例
let _ovsCstToSlimeAstUtil: OvsCstToSlimeAst

_ovsCstToSlimeAstUtil = new OvsCstToSlimeAst()
/**
 * 注册 OvsCstToSlimeAst 实例到全局
 * 
 * 子类构造函数会自动调用此方法，所以会注册最终的子类实例
 * 父层（cssts-compiler 和 slime-parser）的注册已通过 super() 中的父类构造函数自动完成
 */
export function registerOvsCstToSlimeAst(instance: OvsCstToSlimeAst): void {
  _ovsCstToSlimeAstUtil = instance
}

// Proxy: 保持 ovsCstToSlimeAst.xxx() 调用方式，同时支持动态替换
export const OvsCstToSlimeAstUtils = new Proxy({} as OvsCstToSlimeAst, {
  get(_, prop) {
    const val = (_ovsCstToSlimeAstUtil as any)[prop]
    return typeof val === 'function' ? val.bind(_ovsCstToSlimeAstUtil) : val
  }
})