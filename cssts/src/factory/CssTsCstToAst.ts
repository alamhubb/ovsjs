import { SlimeCstToAst } from "slime-parser/src/language/SlimeCstToAstUtil.ts"
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts"
import CssTsParser from "../parser/CssTsParser.ts"
import { SlimeNodeType } from "slime-ast/src/SlimeNodeType.ts"
import {
  type SlimeExpression,
  type SlimeStatement,
  type SlimeModuleDeclaration,
  type SlimeProgram,
  SlimeProgramSourceType,
} from "slime-ast/src/SlimeESTree.ts"
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts"
import SlimeNodeCreate from "slime-ast/src/SlimeNodeCreate.ts"
// 导入运行时的命名转换函数，使用统一的 property_value 命名规范
import { getCssClassName } from "../runtime/index.ts"

/**
 * CSS 样式声明信息
 */
export interface CssStyleInfo {
  /** 样式名称（驼峰命名） */
  name: string
  /** 是否是原子样式（无依赖） */
  isAtomic: boolean
  /** 依赖的其他样式名称 */
  dependencies: string[]
  /** 转换后的 CSS class 名称（property_value 格式） */
  cssClassName: string
  /** 源码位置 */
  loc?: any
}

/**
 * 驼峰命名转 kebab-case（内部辅助函数）
 * 
 * 注意：CSS 类名生成请使用 getCssClassName()，它遵循 property_value 命名规范
 * 
 * @example
 * colorRed → color-red
 * fontBold → font-bold
 * bgBlue → bg-blue
 */
function camelToKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // 小写后跟大写
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')   // 字母后跟数字
    .toLowerCase()
}

/**
 * CssTsCstToAst - CSS-in-TS CST 到 AST 转换器
 * 
 * 主要功能：
 * 1. 转换 CssDeclaration CST 为 AST
 * 2. 收集所有 css 声明信息
 * 3. 分析依赖关系
 */
export class CssTsCstToAst extends SlimeCstToAst {
  /**
   * 收集的所有 CSS 样式声明
   */
  private cssStyles: Map<string, CssStyleInfo> = new Map()

  /**
   * 获取所有收集的 CSS 样式
   */
  getCssStyles(): Map<string, CssStyleInfo> {
    return this.cssStyles
  }

  /**
   * 清空收集的样式（用于新文件）
   */
  clearCssStyles() {
    this.cssStyles.clear()
  }

  /**
   * 将 CST 转换为 Program AST
   */
  toProgram(cst: SubhutiCst): SlimeProgram {
    this.checkCstName(cst, SlimeParser.prototype.Program.name)

    if (!cst.children || cst.children.length === 0) {
      return SlimeNodeCreate.createProgram([], SlimeProgramSourceType.Module)
    }

    const hashbangCommentName = 'HashbangComment'
    const moduleBodyName = SlimeParser.prototype.ModuleBody?.name || 'ModuleBody'
    const scriptBodyName = SlimeParser.prototype.ScriptBody?.name || 'ScriptBody'
    const moduleItemListName = SlimeParser.prototype.ModuleItemList?.name || 'ModuleItemList'
    const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'

    let bodyChild: SubhutiCst | null = null
    for (const child of cst.children) {
      if (child.name === hashbangCommentName) {
        continue
      }
      bodyChild = child
      break
    }

    if (!bodyChild) {
      return SlimeNodeCreate.createProgram([], SlimeProgramSourceType.Module)
    }

    let body: Array<SlimeStatement | SlimeModuleDeclaration> = []
    let sourceType: SlimeProgramSourceType = SlimeProgramSourceType.Module

    if (bodyChild.name === moduleBodyName) {
      const moduleItemList = bodyChild.children?.[0]
      if (moduleItemList && moduleItemList.name === moduleItemListName) {
        body = this.createModuleItemListAst(moduleItemList)
      }
      sourceType = SlimeProgramSourceType.Module
    } else if (bodyChild.name === moduleItemListName) {
      body = this.createModuleItemListAst(bodyChild)
      sourceType = SlimeProgramSourceType.Module
    } else if (bodyChild.name === scriptBodyName) {
      const statementList = bodyChild.children?.[0]
      if (statementList && statementList.name === statementListName) {
        body = this.createStatementListAst(statementList)
      }
      sourceType = SlimeProgramSourceType.Script
    } else if (bodyChild.name === statementListName) {
      body = this.createStatementListAst(bodyChild)
      sourceType = SlimeProgramSourceType.Script
    }

    // 如果使用了 css { } 语法，自动添加 cssts 和 csstsAtom 导入
    if (this.usedAtoms.size > 0) {
      body = this.ensureCsstsImports(body)
    }

    const program = SlimeNodeCreate.createProgram(body, sourceType)
    program.loc = cst.loc

    return program
  }

  /**
   * 确保有 cssts 和 csstsAtom 的导入
   */
  private ensureCsstsImports(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
    // 检查是否已经有 cssts 导入
    let hasCsstsImport = false
    let hasCsstsAtomImport = false

    for (const stmt of body) {
      if (stmt.type === SlimeNodeType.ImportDeclaration) {
        const importDecl = stmt as any
        const source = importDecl.source?.value
        if (source === 'cssts' || source?.endsWith('/cssts')) {
          // 检查是否导入了 cssts
          for (const spec of importDecl.specifiers || []) {
            if (spec.type === SlimeNodeType.ImportSpecifier) {
              if (spec.imported?.name === 'cssts' || spec.local?.name === 'cssts') {
                hasCsstsImport = true
              }
            } else if (spec.type === SlimeNodeType.ImportDefaultSpecifier) {
              if (spec.local?.name === 'cssts') {
                hasCsstsImport = true
              }
            }
          }
        }
        if (source === 'cssts-theme-element' || source?.includes('csstsAtom')) {
          // 检查是否导入了 csstsAtom
          for (const spec of importDecl.specifiers || []) {
            if (spec.imported?.name === 'csstsAtom' || spec.local?.name === 'csstsAtom') {
              hasCsstsAtomImport = true
            }
          }
        }
      }
    }

    const newImports: SlimeModuleDeclaration[] = []

    // 添加 cssts 导入
    if (!hasCsstsImport) {
      newImports.push(this.createCsstsImport())
    }

    // 添加 csstsAtom 导入
    if (!hasCsstsAtomImport) {
      newImports.push(this.createCsstsAtomImport())
    }

    if (newImports.length > 0) {
      // 找到第一个非导入语句的位置
      let insertIndex = 0
      for (let i = 0; i < body.length; i++) {
        if (body[i].type === SlimeNodeType.ImportDeclaration) {
          insertIndex = i + 1
        } else {
          break
        }
      }
      // 在导入语句后面插入新的导入
      return [...body.slice(0, insertIndex), ...newImports, ...body.slice(insertIndex)]
    }

    return body
  }

  /**
   * 创建 cssts 导入语句
   * import { cssts } from 'cssts'
   */
  private createCsstsImport(): SlimeModuleDeclaration {
    return {
      type: SlimeNodeType.ImportDeclaration,
      specifiers: [{
        type: SlimeNodeType.ImportSpecifier,
        imported: SlimeNodeCreate.createIdentifier('cssts'),
        local: SlimeNodeCreate.createIdentifier('cssts')
      }],
      source: SlimeNodeCreate.createStringLiteral('cssts')
    } as any
  }

  /**
   * 创建 csstsAtom 导入语句
   * import { csstsAtom } from 'cssts-theme-element'
   */
  private createCsstsAtomImport(): SlimeModuleDeclaration {
    return {
      type: SlimeNodeType.ImportDeclaration,
      specifiers: [{
        type: SlimeNodeType.ImportSpecifier,
        imported: SlimeNodeCreate.createIdentifier('csstsAtom'),
        local: SlimeNodeCreate.createIdentifier('csstsAtom')
      }],
      source: SlimeNodeCreate.createStringLiteral('cssts-theme-element')
    } as any
  }

  /**
   * 处理 Declaration
   */
  createDeclarationAst(cst: SubhutiCst): any {
    const first = cst.children?.[0]
    if (first && first.name === CssTsParser.prototype.CssDeclaration.name) {
      return this.createCssDeclarationAst(first)
    }
    return super.createDeclarationAst(cst)
  }

  /**
   * 处理 PrimaryExpression - 添加 CssExpression 支持
   */
  createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
    const first = cst.children?.[0]
    if (first && first.name === CssTsParser.prototype.CssExpression.name) {
      return this.createCssExpressionAst(first)
    }
    return super.createPrimaryExpressionAst(cst)
  }

  /**
   * 收集的原子类名（用于生成 CsstsAtom）
   */
  private usedAtoms: Set<string> = new Set()

  /**
   * 获取使用的原子类名
   */
  getUsedAtoms(): Set<string> {
    return this.usedAtoms
  }

  /**
   * 清空使用的原子类
   */
  clearUsedAtoms() {
    this.usedAtoms.clear()
  }

  /**
   * 转换 CssExpression CST 为 AST
   * 
   * 两种形式：
   * 1. css { colorRed, fontBold } → cssts.$cls(csstsAtom.colorRed, csstsAtom.fontBold)
   * 2. css colorRed → 字符串 "colorRed"（用于替换语法）
   * 
   * 支持复杂表达式：
   * - 展开语法：...baseStyle
   * - 条件表达式：props.disabled && css { ... }
   */
  createCssExpressionAst(cst: SubhutiCst): SlimeExpression {
    const children = cst.children || []
    
    // CssExpression 的 children 结构：
    // - css { ... } 形式：[IdentifierName(css), CssStyleObject]
    // - css atomName 形式：[IdentifierName(css), IdentifierName(atomName)]
    
    // 查找 CssStyleObject
    const styleObjectCst = children.find(c => c.name === CssTsParser.prototype.CssStyleObject.name)
    
    if (styleObjectCst) {
      // 多原子形式：css { colorRed, fontBold, ...baseStyle, condition && css { ... } }
      const args = this.extractCssPropertyExpressions(styleObjectCst)
      
      // 创建 cssts.$cls(...args) 调用
      return this.createCsstsClsCallWithArgs(args, cst.loc)
    }
    
    // 单原子形式：css colorRed
    // 第二个 IdentifierName 是原子名称（第一个是 css 关键字）
    const identifierCsts = children.filter(c => c.name === 'IdentifierName')
    if (identifierCsts.length >= 2) {
      const atomCst = identifierCsts[1]  // 第二个是原子名称
      const atomName = atomCst.value || atomCst.children?.[0]?.value || ''
      // 收集原子类名
      this.usedAtoms.add(atomName)
      return SlimeNodeCreate.createStringLiteral(atomName)
    }
    
    // 兜底：返回空字符串
    return SlimeNodeCreate.createStringLiteral('')
  }

  /**
   * 创建 cssts.$cls(csstsAtom.prop1, csstsAtom.prop2, ...) 调用表达式
   */
  protected createCsstsClsCall(properties: string[], loc?: any): SlimeExpression {
    // callee: cssts.$cls (MemberExpression)
    const csstsId = SlimeNodeCreate.createIdentifier('cssts')
    const clsId = SlimeNodeCreate.createIdentifier('$cls')
    const callee: SlimeExpression = {
      type: SlimeNodeType.MemberExpression,
      object: csstsId,
      property: clsId,
      computed: false,
      optional: false
    } as any
    
    // arguments: [csstsAtom.prop1, csstsAtom.prop2, ...]
    const args = properties.map(prop => this.createCsstsAtomMember(prop))
    
    // 创建 CallExpression
    return {
      type: SlimeNodeType.CallExpression,
      callee,
      arguments: args,
      optional: false,
      loc
    } as any
  }

  /**
   * 创建 cssts.$cls(...args) 调用表达式（支持任意表达式参数）
   */
  protected createCsstsClsCallWithArgs(args: SlimeExpression[], loc?: any): SlimeExpression {
    // callee: cssts.$cls (MemberExpression)
    const csstsId = SlimeNodeCreate.createIdentifier('cssts')
    const clsId = SlimeNodeCreate.createIdentifier('$cls')
    const callee: SlimeExpression = {
      type: SlimeNodeType.MemberExpression,
      object: csstsId,
      property: clsId,
      computed: false,
      optional: false
    } as any
    
    // 创建 CallExpression
    return {
      type: SlimeNodeType.CallExpression,
      callee,
      arguments: args,
      optional: false,
      loc
    } as any
  }

  /**
   * 提取 CssStyleObject 中的元素表达式
   * 
   * CssStyleObject 现在使用 ElementList（和数组字面量一样）
   * ElementList 包含 AssignmentExpression 或 SpreadElement
   */
  private extractCssPropertyExpressions(styleObjectCst: SubhutiCst | undefined): SlimeExpression[] {
    if (!styleObjectCst) return []

    // 查找 ElementList
    const elementListCst = styleObjectCst.children?.find(
      c => c.name === 'ElementList'
    )

    if (!elementListCst) return []

    // 使用父类的 createElementListAst 来处理 ElementList
    // 然后对每个元素进行转换
    const elements = this.processElementList(elementListCst)
    
    // 转换每个元素：简单标识符 → csstsAtom.identifier
    return elements.map(expr => this.transformCssPropertyExpression(expr))
  }

  /**
   * 处理 ElementList CST，返回表达式数组
   * 
   * ElementList 结构：
   * - AssignmentExpression | SpreadElement
   * - (, AssignmentExpression | SpreadElement)*
   */
  private processElementList(cst: SubhutiCst): SlimeExpression[] {
    if (!cst.children) return []

    const expressions: SlimeExpression[] = []
    
    for (const child of cst.children) {
      // 跳过逗号和 Elision
      if (child.name === 'Comma' || child.value === ',' || child.name === 'Elision') {
        continue
      }
      
      // AssignmentExpression
      if (child.name === 'AssignmentExpression') {
        const expr = this.createAssignmentExpressionAst(child)
        expressions.push(expr)
      }
      // SpreadElement
      else if (child.name === 'SpreadElement') {
        const expr = this.createSpreadElementAst(child)
        expressions.push(expr as any)
      }
    }

    return expressions
  }

  /**
   * 创建 SpreadElement AST（覆盖父类方法）
   */
  createSpreadElementAst(cst: SubhutiCst): any {
    // SpreadElement: ... AssignmentExpression
    const assignExprCst = cst.children?.find(c => c.name === 'AssignmentExpression')
    if (!assignExprCst) {
      throw new Error('SpreadElement: missing AssignmentExpression')
    }
    
    const argument = this.createAssignmentExpressionAst(assignExprCst)
    return {
      type: SlimeNodeType.SpreadElement,
      argument,
      loc: cst.loc
    }
  }

  /**
   * 转换 CssProperty 表达式
   * - 简单标识符 colorRed → csstsAtom.colorRed
   * - 展开语法保持不变（SpreadElement）
   * - 条件表达式递归处理
   */
  private transformCssPropertyExpression(expr: SlimeExpression): SlimeExpression {
    if (!expr) return expr

    // 简单标识符 → csstsAtom.identifier
    if (expr.type === SlimeNodeType.Identifier) {
      const name = (expr as any).name || ''
      if (name) {
        this.usedAtoms.add(name)
        return this.createCsstsAtomMember(name)
      }
    }

    // 展开语法 ...baseStyle → 保持不变
    if ((expr as any).type === SlimeNodeType.SpreadElement) {
      return expr
    }

    // 逻辑表达式 condition && css { ... }
    if (expr.type === SlimeNodeType.LogicalExpression) {
      const logicalExpr = expr as any
      return {
        ...logicalExpr,
        right: this.transformCssPropertyExpression(logicalExpr.right)
      }
    }

    // 条件表达式 condition ? css { ... } : css { ... }
    if (expr.type === SlimeNodeType.ConditionalExpression) {
      const condExpr = expr as any
      return {
        ...condExpr,
        consequent: this.transformCssPropertyExpression(condExpr.consequent),
        alternate: condExpr.alternate ? this.transformCssPropertyExpression(condExpr.alternate) : condExpr.alternate
      }
    }

    // CallExpression (已经是 cssts.$cls 调用) → 保持不变
    if (expr.type === SlimeNodeType.CallExpression) {
      return expr
    }

    return expr
  }

  /**
   * 创建 csstsAtom.propName 成员表达式
   */
  protected createCsstsAtomMember(propName: string): SlimeExpression {
    return {
      type: SlimeNodeType.MemberExpression,
      object: SlimeNodeCreate.createIdentifier('csstsAtom'),
      property: SlimeNodeCreate.createIdentifier(propName),
      computed: false,
      optional: false
    } as any
  }

  /**
   * 处理赋值表达式，检测 style.atom = css newAtom 模式
   * 
   * 输入：style.bgPrimary = css bgSuccess
   * 输出：style = cssts.replace(style, "bgPrimary", "bgSuccess")
   */
  createAssignmentExpressionAst(cst: SubhutiCst): SlimeExpression {
    // 先调用父类处理
    const ast = super.createAssignmentExpressionAst(cst)
    
    // 检测是否是 style.atom = css newAtom 模式
    if (this.isCssReplacePattern(ast)) {
      return this.transformToCsstsReplace(ast)
    }
    
    return ast
  }

  /**
   * 检测是否是 style.atom = css newAtom 模式
   */
  private isCssReplacePattern(ast: any): boolean {
    // 检查是否是赋值表达式
    if (ast.type !== SlimeNodeType.AssignmentExpression) return false
    if (ast.operator !== '=') return false
    
    // 检查左边是否是 MemberExpression (style.atom)
    if (ast.left?.type !== SlimeNodeType.MemberExpression) return false
    
    // 检查右边是否是字符串字面量（来自 css atomName）
    if (ast.right?.type !== SlimeNodeType.Literal) return false
    if (typeof ast.right?.value !== 'string') return false
    
    return true
  }

  /**
   * 将 style.atom = "newAtom" 转换为 style = cssts.replace(style, "atom", "newAtom")
   */
  private transformToCsstsReplace(ast: any): SlimeExpression {
    const memberExpr = ast.left
    const objectName: string = memberExpr.object?.name || memberExpr.object?.value || 'style'
    const propertyName: string = memberExpr.property?.name || memberExpr.property?.value || ''
    const newAtomName: string = ast.right.value || ''
    
    // 创建 cssts.replace(style, "atom", "newAtom") 调用
    const csstsId = SlimeNodeCreate.createIdentifier('cssts')
    const replaceId = SlimeNodeCreate.createIdentifier('replace')
    const callee: SlimeExpression = {
      type: SlimeNodeType.MemberExpression,
      object: csstsId,
      property: replaceId,
      computed: false,
      optional: false
    } as any
    
    // arguments: [style, "atom", "newAtom"]
    const args = [
      SlimeNodeCreate.createIdentifier(objectName),
      SlimeNodeCreate.createStringLiteral(propertyName),
      SlimeNodeCreate.createStringLiteral(newAtomName)
    ]
    
    const replaceCall: SlimeExpression = {
      type: SlimeNodeType.CallExpression,
      callee,
      arguments: args,
      optional: false
    } as any
    
    // 创建 style = cssts.replace(...) 赋值表达式
    return {
      type: SlimeNodeType.AssignmentExpression,
      operator: '=',
      left: SlimeNodeCreate.createIdentifier(objectName),
      right: replaceCall,
      loc: ast.loc
    } as any
  }

  /**
   * 处理 StatementListItem
   */
  createStatementListItemAst(cst: SubhutiCst): SlimeStatement[] {
    this.checkCstName(cst, SlimeParser.prototype.StatementListItem.name)

    if (!cst.children || cst.children.length === 0) {
      return []
    }

    const child = cst.children[0]

    // 检查是否是 Statement
    if (child.name === SlimeParser.prototype.Statement.name) {
      const statementChild = child.children?.[0]

      // 处理 CssDeclarationStatement
      if (statementChild && statementChild.name === CssTsParser.prototype.CssDeclarationStatement.name) {
        const cssDecl = statementChild.children?.find(
          c => c.name === CssTsParser.prototype.CssDeclaration.name
        )
        if (cssDecl) {
          const ast = this.createCssDeclarationAst(cssDecl)
          return ast ? [ast] : []
        }
        return []
      }
    }

    return super.createStatementListItemAst(cst)
  }

  /**
   * 转换 CssDeclaration CST 为 AST
   * 
   * 输入：
   *   css colorRed                           // 原子样式
   *   css buttonBase = { colorRed, fontBold } // 组合样式
   * 
   * 输出：
   *   // 原子样式 → 空语句（仅收集信息）
   *   // 组合样式 → const buttonBase = { colorRed, fontBold }
   */
  createCssDeclarationAst(cst: SubhutiCst): SlimeStatement | null {
    const children = cst.children || []

    // 提取样式名称（第2个子节点：IdentifierName）
    const styleNameCst = children[1]
    if (!styleNameCst) {
      throw new Error('CssDeclaration: missing style name')
    }
    const styleName: string = styleNameCst.value || styleNameCst.children?.[0]?.value || ''

    // 检查是否有 = { ... } 部分
    const assignIndex = children.findIndex(c => c.value === '=' || c.name === 'Assign')
    const hasValue = assignIndex !== -1

    if (hasValue) {
      // 组合样式：css buttonBase = { colorRed, fontBold }
      const styleObjectCst = children.find(c => c.name === CssTsParser.prototype.CssStyleObject.name)
      const dependencies = this.extractCssProperties(styleObjectCst)

      // 收集样式信息
      if (styleName) {
        this.cssStyles.set(styleName, {
          name: styleName,
          isAtomic: false,
          dependencies,
          cssClassName: getCssClassName(styleName),
          loc: cst.loc
        })
      }

      // 生成 const buttonBase = { colorRed, fontBold }
      // 这里简化处理，实际可以生成更复杂的 AST
      return this.createCssConstDeclaration(styleName, dependencies, cst.loc)
    } else {
      // 原子样式：css colorRed
      if (styleName) {
        this.cssStyles.set(styleName, {
          name: styleName,
          isAtomic: true,
          dependencies: [],
          cssClassName: getCssClassName(styleName),
          loc: cst.loc
        })
      }

      // 原子样式不生成代码，仅收集信息
      // 返回空语句
      return {
        type: SlimeNodeType.EmptyStatement,
        loc: cst.loc
      } as any
    }
  }

  /**
   * 提取 CssStyleObject 中的属性名称（用于 CssDeclaration 旧语法）
   * 
   * 现在 CssStyleObject 使用 ElementList，需要从中提取简单标识符名称
   */
  private extractCssProperties(styleObjectCst: SubhutiCst | undefined): string[] {
    if (!styleObjectCst) return []

    const properties: string[] = []
    const elementListCst = styleObjectCst.children?.find(
      c => c.name === 'ElementList'
    )

    if (elementListCst && elementListCst.children) {
      for (const child of elementListCst.children) {
        // 跳过逗号
        if (child.name === 'Comma' || child.value === ',') continue
        
        // 从 AssignmentExpression 中提取标识符名称
        if (child.name === 'AssignmentExpression') {
          const name = this.extractIdentifierName(child)
          if (name) {
            properties.push(name)
          }
        }
      }
    }

    return properties
  }

  /**
   * 从表达式 CST 中提取标识符名称（递归查找）
   */
  private extractIdentifierName(cst: SubhutiCst): string | null {
    if (!cst) return null
    
    // 直接是 IdentifierName
    if (cst.name === 'IdentifierName') {
      return cst.value || cst.children?.[0]?.value || null
    }
    
    // 递归查找第一个子节点
    if (cst.children && cst.children.length > 0) {
      return this.extractIdentifierName(cst.children[0])
    }
    
    return null
  }

  /**
   * 创建 const 声明 AST
   * const styleName = { prop1, prop2, ... }
   */
  private createCssConstDeclaration(
    styleName: string,
    dependencies: string[],
    loc?: any
  ): SlimeStatement {
    // 创建对象表达式 { prop1, prop2, ... }
    const properties = dependencies.map((dep, i) => {
      const id = SlimeNodeCreate.createIdentifier(dep)
      const prop = SlimeNodeCreate.createPropertyAst(id, { ...id })
      prop.shorthand = true
      return SlimeNodeCreate.createObjectPropertyItem(
        prop,
        i < dependencies.length - 1 ? { type: 'Comma', value: ',' } as any : undefined
      )
    })

    const objectExpr = SlimeNodeCreate.createObjectExpression(properties)

    // 创建变量声明
    const declarator = SlimeNodeCreate.createVariableDeclarator(
      SlimeNodeCreate.createIdentifier(styleName),
      { type: 'Assign', value: '=' } as any,
      objectExpr
    )

    const declaration = SlimeNodeCreate.createVariableDeclaration(
      { type: 'Const', value: 'const' } as any,
      [declarator]
    )

    declaration.loc = loc
    return declaration
  }

  private checkCstName(cst: SubhutiCst, expectedName: string) {
    if (cst.name !== expectedName) {
      throw new Error(`Expected ${expectedName}, got ${cst.name}`)
    }
  }
}

const cssTsCstToAst = new CssTsCstToAst()
export default cssTsCstToAst
