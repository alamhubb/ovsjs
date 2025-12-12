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
  /** 转换后的 CSS class 名称（kebab-case） */
  cssClassName: string
  /** 源码位置 */
  loc?: any
}

/**
 * 驼峰命名转 kebab-case
 * colorRed → color-red
 * fontBold → font-bold
 * bgBlue → bg-blue
 * fontSize14 → font-size-14
 * height32 → height-32
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

    const program = SlimeNodeCreate.createProgram(body, sourceType)
    program.loc = cst.loc

    return program
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
   */
  createCssExpressionAst(cst: SubhutiCst): SlimeExpression {
    const children = cst.children || []
    
    // 检查是否是单原子形式：css colorRed
    const identifierCst = children.find(c => c.name === 'IdentifierName')
    if (identifierCst) {
      // 单原子形式：返回字符串字面量 "colorRed"
      const atomName = identifierCst.value || identifierCst.children?.[0]?.value || ''
      // 收集原子类名
      this.usedAtoms.add(atomName)
      return SlimeNodeCreate.createStringLiteral(atomName)
    }
    
    // 多原子形式：css { colorRed, fontBold }
    const styleObjectCst = children.find(c => c.name === CssTsParser.prototype.CssStyleObject.name)
    const properties = this.extractCssProperties(styleObjectCst)
    
    // 收集原子类名
    for (const prop of properties) {
      this.usedAtoms.add(prop)
    }
    
    // 创建 cssts.$cls(csstsAtom.prop1, csstsAtom.prop2, ...) 调用
    return this.createCsstsClsCall(properties, cst.loc)
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
          cssClassName: camelToKebab(styleName),
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
          cssClassName: camelToKebab(styleName),
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
   * 提取 CssStyleObject 中的属性名称
   */
  private extractCssProperties(styleObjectCst: SubhutiCst | undefined): string[] {
    if (!styleObjectCst) return []

    const properties: string[] = []
    const propListCst = styleObjectCst.children?.find(
      c => c.name === CssTsParser.prototype.CssPropertyList.name
    )

    if (propListCst && propListCst.children) {
      for (const child of propListCst.children) {
        if (child.name === CssTsParser.prototype.CssProperty.name || 
            child.name === 'IdentifierName') {
          const name = child.value || child.children?.[0]?.value
          if (name) {
            properties.push(name)
          }
        }
      }
    }

    return properties
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
