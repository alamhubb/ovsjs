import {SlimeCstToAst} from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SubhutiCst, {type SubhutiPosition, type SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";
import {
  type SlimeCallExpression,
  type SlimeExpression, type SlimeImportDeclaration, type SlimeImportDefaultSpecifier, type SlimeModuleDeclaration,
  type SlimeProgram, SlimeProgramSourceType,
  type SlimeStatement
} from "slime-ast/src/SlimeAstInterface.ts";
import OvsParser from "../parser/OvsParser.ts";
import JsonUtil from "subhuti/src/utils/JsonUtil.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import type {OvsAstLexicalBinding, OvsAstRenderDomViewDeclaration} from "../interface/OvsInterface";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";
import Es6TokenConsumer from "slime-parser/src/language/es2015/Es6Tokens.ts";

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
  toProgram(cst: SubhutiCst): SlimeProgram {
    const astName = checkCstName(cst, Es6Parser.prototype.Program.name);
    //找到导入模块，看有没有导入ovs，没有的话则添加导入代码
    const first = cst.children[0]
    let program: SlimeProgram
    let body: Array<SlimeStatement | SlimeModuleDeclaration>
    let hasImportOvsFLag = false
    if (first.name === Es6Parser.prototype.ModuleItemList.name) {
      body = this.createModuleItemListAst(first)
      for (const item of body) {
        if (item.type === SlimeAstType.ImportDeclaration) {
          const importDeclaration: SlimeImportDeclaration = item as SlimeImportDeclaration
          const importDefaultSpecifiers: SlimeImportDefaultSpecifier[] = importDeclaration.specifiers.filter(item => item.type === SlimeAstType.ImportDefaultSpecifier)
          hasImportOvsFLag = importDefaultSpecifiers.some(item => item.local.name === 'OvsAPI')
        }
      }
    } else if (first.name === Es6Parser.prototype.StatementList.name) {
      body = this.createStatementListAst(first)
    }

    if (!hasImportOvsFLag) {
      const local = SlimeAstUtil.createIdentifier('OvsAPI')
      const ovsImportDefaultSpecifiers: SlimeImportDefaultSpecifier = SlimeAstUtil.createImportDefaultSpecifier(local)
      const from = SlimeAstUtil.createFromKeyword()
      const source = SlimeAstUtil.createStringLiteral('ovsjs/src/OvsAPI')
      const ovsImport = SlimeAstUtil.createImportDeclaration([ovsImportDefaultSpecifiers], from, source)
      ovsImport.loc.newLine = true
      // body.unshift(ovsImport)
    }

    program = SlimeAstUtil.createProgram(body, SlimeProgramSourceType.module)
    program.loc = cst.loc
    return program
  }


  createExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = cst.name
    let left
    if (astName === OvsParser.prototype.OvsRenderDomViewDeclaration.name) {
      left = this.createOvsRenderDomViewDeclarationAst(cst)
    } else {
      left = super.createExpressionAst(cst)
    }
    return left
  }

  createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeCallExpression {
    const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
    let children = []
    if (cst.children.length > 1) {
      children = cst.children[2].children.filter(item => item.name === OvsParser.prototype.OvsRenderDomViewDeclarator.name).map(item => this.createOvsRenderDomViewDeclaratorAst(item)) as any[]
    }

    const id = this.createIdentifierAst(cst.children[0])
    id.loc = cst.children[0].loc

    const ast: OvsAstRenderDomViewDeclaration = {
      type: astName as any,
      id: id,
      // children: cst.children[2].children.filter(item => item.name === OvsParser.prototype.OvsRenderDomViewDeclarator.name),
      children: children,
      loc: cst.loc
      // children: this.createAssignmentExpressionAst(cst.children[2])
    } as any

    const res = this.createOvsRenderDomViewDeclarationEstreeAst(ast)
    // left = this.ovsRenderDomViewDeclarationAstToEstreeAst(left)
    return res
  }

  createOvsRenderDomViewDeclarationEstreeAst(ast: OvsAstRenderDomViewDeclaration): SlimeCallExpression {
    const body = this.createOvsAPICreateVNode(ast)
    const viewIIFE = this.createIIFE(body)
    return viewIIFE
  }

  createIIFE(body: Array<SlimeStatement>): SlimeCallExpression {
    const blockStatement = SlimeAstUtil.createBlockStatement(null, null, body, body[0].loc)
    const lp = SlimeAstUtil.createLParen(blockStatement.loc)
    const rp = SlimeAstUtil.createRParen(blockStatement.loc)
    const functionParams = SlimeAstUtil.createFunctionParams(lp, rp)
    const functionExpression = SlimeAstUtil.createFunctionExpression(blockStatement, null, functionParams, blockStatement.loc)
    const callExpression = SlimeAstUtil.createCallExpression(functionExpression, [])
    return callExpression
  }

  createOvsAPICreateVNode(ast: OvsAstRenderDomViewDeclaration): SlimeStatement[] {
    const memberExpressionObject = SlimeAstUtil.createIdentifier('OvsAPI')
    memberExpressionObject.loc = ast.id.loc

    const memberExpressionProperty = SlimeAstUtil.createIdentifier('createVNode')
    memberExpressionProperty.loc = ast.id.loc

    const dot = SlimeAstUtil.createDotOperator(ast.id.loc)

    const memberExpression = SlimeAstUtil.createMemberExpression(memberExpressionObject, dot, memberExpressionProperty)
    memberExpression.loc = ast.id.loc

    const OvsAPICreateVNodeFirstParamsViewName = SlimeAstUtil.createStringLiteral(ast.id.name)
    OvsAPICreateVNodeFirstParamsViewName.loc = ast.id.loc

    const OvsAPICreateVNodeSecondParamsChildren = SlimeAstUtil.createArrayExpression(ast.children)

    const callExpression = SlimeAstUtil.createCallExpression(memberExpression, [OvsAPICreateVNodeFirstParamsViewName, OvsAPICreateVNodeSecondParamsChildren])
    const ReturnStatement = SlimeAstUtil.createReturnStatement(callExpression)

    ReturnStatement.loc = ast.loc
    return [ReturnStatement]
  }

  createOvsRenderDomViewDeclaratorAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclarator.name);
    const firstChild = cst.children[0]
    if (firstChild.name === OvsParser.prototype.OvsLexicalBinding.name) {
      const ast: OvsAstLexicalBinding = {
        type: OvsParser.prototype.OvsLexicalBinding.name as any,
        id: this.createIdentifierAst(firstChild.children[0].children[0]) as any,
        init: this.createAssignmentExpressionAst(firstChild.children[1].children[1]) as any,
      }
      return ast as any
    } else {
      return this.createAssignmentExpressionAst(firstChild)
    }
  }
}

const OvsCstToSlimeAstUtil = new OvsCstToSlimeAst()
export default OvsCstToSlimeAstUtil
