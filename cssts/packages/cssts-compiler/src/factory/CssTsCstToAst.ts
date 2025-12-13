import { SlimeCstToAst } from "slime-parser/src/language/SlimeCstToAstUtil.ts"
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts"
import CssTsParser from "../parser/CssTsParser.js"
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
 * 简单的 camelCase 转 kebab-case（用于生成 CSS 类名）
 */
function getCssClassName(atomName: string): string {
  return atomName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()
}

/**
 * CSS 样式声明信息
 */
export interface CssStyleInfo {
  name: string
  isAtomic: boolean
  dependencies: string[]
  cssClassName: string
  loc?: any
}

function camelToKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()
}

/**
 * CssTsCstToAst - CSS-in-TS CST 到 AST 转换器
 */
export class CssTsCstToAst extends SlimeCstToAst {
  private cssStyles: Map<string, CssStyleInfo> = new Map()
  private usedAtoms: Set<string> = new Set()

  getCssStyles(): Map<string, CssStyleInfo> {
    return this.cssStyles
  }

  clearCssStyles() {
    this.cssStyles.clear()
  }

  getUsedAtoms(): Set<string> {
    return this.usedAtoms
  }

  clearUsedAtoms() {
    this.usedAtoms.clear()
  }

  toProgram(cst: SubhutiCst): SlimeProgram {
    // 支持 Program 和 Module 两种入口
    const programName = SlimeParser.prototype.Program?.name || 'Program'
    const moduleName = SlimeParser.prototype.Module?.name || 'Module'
    
    if (cst.name !== programName && cst.name !== moduleName) {
      throw new Error(`Expected ${programName} or ${moduleName}, got ${cst.name}`)
    }

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
      if (child.name === hashbangCommentName) continue
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

    if (this.usedAtoms.size > 0) {
      body = this.ensureCsstsImports(body)
    }

    const program = SlimeNodeCreate.createProgram(body, sourceType)
    program.loc = cst.loc
    return program
  }

  private ensureCsstsImports(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
    let hasCsstsImport = false
    let hasCsstsAtomImport = false

    for (const stmt of body) {
      if (stmt.type === SlimeNodeType.ImportDeclaration) {
        const importDecl = stmt as any
        const source = importDecl.source?.value
        if (source === 'cssts' || source === 'cssts-runtime') {
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
          for (const spec of importDecl.specifiers || []) {
            if (spec.imported?.name === 'csstsAtom' || spec.local?.name === 'csstsAtom') {
              hasCsstsAtomImport = true
            }
          }
        }
      }
    }

    const newImports: SlimeModuleDeclaration[] = []

    if (!hasCsstsImport) {
      newImports.push(this.createCsstsImport())
    }

    if (!hasCsstsAtomImport) {
      newImports.push(this.createCsstsAtomImport())
    }

    if (newImports.length > 0) {
      let insertIndex = 0
      for (let i = 0; i < body.length; i++) {
        if (body[i].type === SlimeNodeType.ImportDeclaration) {
          insertIndex = i + 1
        } else {
          break
        }
      }
      return [...body.slice(0, insertIndex), ...newImports, ...body.slice(insertIndex)]
    }

    return body
  }

  private createCsstsImport(): SlimeModuleDeclaration {
    return {
      type: SlimeNodeType.ImportDeclaration,
      specifiers: [{
        type: SlimeNodeType.ImportSpecifier,
        imported: SlimeNodeCreate.createIdentifier('cssts'),
        local: SlimeNodeCreate.createIdentifier('cssts')
      }],
      source: SlimeNodeCreate.createStringLiteral('cssts-runtime')
    } as any
  }

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

  createDeclarationAst(cst: SubhutiCst): any {
    const first = cst.children?.[0]
    if (first && first.name === CssTsParser.prototype.CssDeclaration.name) {
      return this.createCssDeclarationAst(first)
    }
    return super.createDeclarationAst(cst)
  }

  createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
    const first = cst.children?.[0]
    if (first && first.name === CssTsParser.prototype.CssExpression.name) {
      return this.createCssExpressionAst(first)
    }
    return super.createPrimaryExpressionAst(cst)
  }

  createCssExpressionAst(cst: SubhutiCst): SlimeExpression {
    const children = cst.children || []
    const styleObjectCst = children.find(c => c.name === CssTsParser.prototype.CssStyleObject.name)
    
    if (styleObjectCst) {
      const args = this.extractCssPropertyExpressions(styleObjectCst)
      return this.createCsstsClsCallWithArgs(args, cst.loc)
    }
    
    const identifierCsts = children.filter(c => c.name === 'IdentifierName')
    if (identifierCsts.length >= 2) {
      const atomCst = identifierCsts[1]
      const atomName = atomCst.value || atomCst.children?.[0]?.value || ''
      this.usedAtoms.add(atomName)
      return SlimeNodeCreate.createStringLiteral(atomName)
    }
    
    return SlimeNodeCreate.createStringLiteral('')
  }

  protected createCsstsClsCall(properties: string[], loc?: any): SlimeExpression {
    const csstsId = SlimeNodeCreate.createIdentifier('cssts')
    const clsId = SlimeNodeCreate.createIdentifier('$cls')
    const callee: SlimeExpression = {
      type: SlimeNodeType.MemberExpression,
      object: csstsId,
      property: clsId,
      computed: false,
      optional: false
    } as any
    
    const args = properties.map(prop => this.createCsstsAtomMember(prop))
    
    return {
      type: SlimeNodeType.CallExpression,
      callee,
      arguments: args,
      optional: false,
      loc
    } as any
  }

  protected createCsstsClsCallWithArgs(args: SlimeExpression[], loc?: any): SlimeExpression {
    const csstsId = SlimeNodeCreate.createIdentifier('cssts')
    const clsId = SlimeNodeCreate.createIdentifier('$cls')
    const callee: SlimeExpression = {
      type: SlimeNodeType.MemberExpression,
      object: csstsId,
      property: clsId,
      computed: false,
      optional: false
    } as any
    
    return {
      type: SlimeNodeType.CallExpression,
      callee,
      arguments: args,
      optional: false,
      loc
    } as any
  }

  private extractCssPropertyExpressions(styleObjectCst: SubhutiCst | undefined): SlimeExpression[] {
    if (!styleObjectCst) return []

    const elementListCst = styleObjectCst.children?.find(c => c.name === 'ElementList')
    if (!elementListCst) return []

    const elements = this.processElementList(elementListCst)
    return elements.map(expr => this.transformCssPropertyExpression(expr))
  }

  private processElementList(cst: SubhutiCst): SlimeExpression[] {
    if (!cst.children) return []

    const expressions: SlimeExpression[] = []
    
    for (const child of cst.children) {
      if (child.name === 'Comma' || child.value === ',' || child.name === 'Elision') {
        continue
      }
      
      if (child.name === 'AssignmentExpression') {
        const expr = this.createAssignmentExpressionAst(child)
        expressions.push(expr)
      } else if (child.name === 'SpreadElement') {
        const expr = this.createSpreadElementAst(child)
        expressions.push(expr as any)
      }
    }

    return expressions
  }

  createSpreadElementAst(cst: SubhutiCst): any {
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

  private transformCssPropertyExpression(expr: SlimeExpression): SlimeExpression {
    if (!expr) return expr

    if (expr.type === SlimeNodeType.Identifier) {
      const name = (expr as any).name || ''
      if (name) {
        this.usedAtoms.add(name)
        return this.createCsstsAtomMember(name)
      }
    }

    if ((expr as any).type === SlimeNodeType.SpreadElement) {
      return expr
    }

    if (expr.type === SlimeNodeType.LogicalExpression) {
      const logicalExpr = expr as any
      return {
        ...logicalExpr,
        right: this.transformCssPropertyExpression(logicalExpr.right)
      }
    }

    if (expr.type === SlimeNodeType.ConditionalExpression) {
      const condExpr = expr as any
      return {
        ...condExpr,
        consequent: this.transformCssPropertyExpression(condExpr.consequent),
        alternate: condExpr.alternate ? this.transformCssPropertyExpression(condExpr.alternate) : condExpr.alternate
      }
    }

    if (expr.type === SlimeNodeType.CallExpression) {
      return expr
    }

    return expr
  }

  protected createCsstsAtomMember(propName: string): SlimeExpression {
    return {
      type: SlimeNodeType.MemberExpression,
      object: SlimeNodeCreate.createIdentifier('csstsAtom'),
      property: SlimeNodeCreate.createIdentifier(propName),
      computed: false,
      optional: false
    } as any
  }

  createAssignmentExpressionAst(cst: SubhutiCst): SlimeExpression {
    const ast = super.createAssignmentExpressionAst(cst)
    
    if (this.isCssReplacePattern(ast)) {
      return this.transformToCsstsReplace(ast)
    }
    
    return ast
  }

  private isCssReplacePattern(ast: any): boolean {
    if (ast.type !== SlimeNodeType.AssignmentExpression) return false
    if (ast.operator !== '=') return false
    if (ast.left?.type !== SlimeNodeType.MemberExpression) return false
    if (ast.right?.type !== SlimeNodeType.Literal) return false
    if (typeof ast.right?.value !== 'string') return false
    return true
  }

  private transformToCsstsReplace(ast: any): SlimeExpression {
    const memberExpr = ast.left
    const objectName: string = memberExpr.object?.name || memberExpr.object?.value || 'style'
    const propertyName: string = memberExpr.property?.name || memberExpr.property?.value || ''
    const newAtomName: string = ast.right.value || ''
    
    const csstsId = SlimeNodeCreate.createIdentifier('cssts')
    const replaceId = SlimeNodeCreate.createIdentifier('replace')
    const callee: SlimeExpression = {
      type: SlimeNodeType.MemberExpression,
      object: csstsId,
      property: replaceId,
      computed: false,
      optional: false
    } as any
    
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
    
    return {
      type: SlimeNodeType.AssignmentExpression,
      operator: '=',
      left: SlimeNodeCreate.createIdentifier(objectName),
      right: replaceCall,
      loc: ast.loc
    } as any
  }

  createStatementListItemAst(cst: SubhutiCst): SlimeStatement[] {
    this.checkCstName(cst, SlimeParser.prototype.StatementListItem.name)

    if (!cst.children || cst.children.length === 0) {
      return []
    }

    const child = cst.children[0]

    if (child.name === SlimeParser.prototype.Statement.name) {
      const statementChild = child.children?.[0]

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

  createCssDeclarationAst(cst: SubhutiCst): SlimeStatement | null {
    const children = cst.children || []

    const styleNameCst = children[1]
    if (!styleNameCst) {
      throw new Error('CssDeclaration: missing style name')
    }
    const styleName: string = styleNameCst.value || styleNameCst.children?.[0]?.value || ''

    const assignIndex = children.findIndex(c => c.value === '=' || c.name === 'Assign')
    const hasValue = assignIndex !== -1

    if (hasValue) {
      const styleObjectCst = children.find(c => c.name === CssTsParser.prototype.CssStyleObject.name)
      const dependencies = this.extractCssProperties(styleObjectCst)

      if (styleName) {
        this.cssStyles.set(styleName, {
          name: styleName,
          isAtomic: false,
          dependencies,
          cssClassName: getCssClassName(styleName),
          loc: cst.loc
        })
      }

      return this.createCssConstDeclaration(styleName, dependencies, cst.loc)
    } else {
      if (styleName) {
        this.cssStyles.set(styleName, {
          name: styleName,
          isAtomic: true,
          dependencies: [],
          cssClassName: getCssClassName(styleName),
          loc: cst.loc
        })
      }

      return {
        type: SlimeNodeType.EmptyStatement,
        loc: cst.loc
      } as any
    }
  }

  private extractCssProperties(styleObjectCst: SubhutiCst | undefined): string[] {
    if (!styleObjectCst) return []

    const properties: string[] = []
    const elementListCst = styleObjectCst.children?.find(c => c.name === 'ElementList')

    if (elementListCst && elementListCst.children) {
      for (const child of elementListCst.children) {
        if (child.name === 'Comma' || child.value === ',') continue
        
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

  private extractIdentifierName(cst: SubhutiCst): string | null {
    if (!cst) return null
    
    if (cst.name === 'IdentifierName') {
      return cst.value || cst.children?.[0]?.value || null
    }
    
    if (cst.children && cst.children.length > 0) {
      return this.extractIdentifierName(cst.children[0])
    }
    
    return null
  }

  private createCssConstDeclaration(
    styleName: string,
    dependencies: string[],
    loc?: any
  ): SlimeStatement {
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
