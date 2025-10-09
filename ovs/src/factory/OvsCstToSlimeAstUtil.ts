import {SlimeCstToAst} from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import {
  type SlimeCallExpression,
  type SlimeExpression, 
  type SlimeExpressionStatement,
  type SlimeImportDeclaration, 
  type SlimeImportDefaultSpecifier, 
  type SlimeModuleDeclaration,
  type SlimeProgram, 
  SlimeProgramSourceType,
  type SlimeStatement,
  type SlimeIdentifier
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
  // 计数器：标记当前是否在 OvsRenderDomViewDeclaration 内部
  private ovsRenderDomViewDepth = 0;

  toProgram(cst: SubhutiCst): SlimeProgram {
    checkCstName(cst, Es6Parser.prototype.Program.name);
    //找到导入模块，看有没有导入ovs，没有的话则添加导入代码
    const first = cst.children?.[0]
    if (!first) {
      throw new Error('Program has no children')
    }
    
    let program: SlimeProgram
    let body: Array<SlimeStatement | SlimeModuleDeclaration> = []
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
      if (ovsImport.loc) {
        ovsImport.loc.newLine = true
      }
      body.unshift(ovsImport)
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

  // 重写 ExpressionStatement 处理
  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement {
    const exprCst = cst.children?.[0]
    if (!exprCst) {
      throw new Error('ExpressionStatement has no expression')
    }
    
    const expr = this.createExpressionAst(exprCst)
    
    // 如果在 OvsRenderDomViewDeclaration 内部，转换为 children.push(expr)
    if (this.ovsRenderDomViewDepth > 0) {
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
      // 不在内部，调用父类方法
      return super.createExpressionStatementAst(cst)
    }
  }

  createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeCallExpression {
    checkCstName(cst, OvsParser.prototype.OvsRenderDomViewDeclaration.name);
    
    // 获取元素名称（如 'div'）
    const idCst = cst.children?.[0]
    if (!idCst) {
      throw new Error('OvsRenderDomViewDeclaration has no identifier')
    }
    const id = this.createIdentifierAst(idCst)
    id.loc = idCst.loc

    // 进入 OvsRenderDomViewDeclaration，计数器 +1
    this.ovsRenderDomViewDepth++
    
    try {
      // 获取 StatementList (cst.children[2])
      const statementListCst = cst.children?.[2]
      if (!statementListCst) {
        throw new Error('OvsRenderDomViewDeclaration has no StatementList')
      }
      
      // 转换 StatementList，会自动处理所有语句（包括 ExpressionStatement）
      const bodyStatements = this.createStatementListAst(statementListCst)
      
      // 生成完整的函数体
      const iifeFunctionBody: SlimeStatement[] = [
        // const children = []
        {
          type: SlimeAstType.VariableDeclaration,
          kind: 'const' as any,
          declarations: [
            {
              type: SlimeAstType.VariableDeclarator,
              id: SlimeAstUtil.createIdentifier('children'),
              init: SlimeAstUtil.createArrayExpression([]),
              loc: cst.loc
            }
          ],
          loc: cst.loc
        } as any,
        // 转换后的语句（ExpressionStatement 已经变成 children.push()）
        ...bodyStatements,
        // return OvsAPI.createVNode(...)
        this.createReturnOvsAPICreateVNode(id)
      ]
      
      // 生成 IIFE
      return this.createIIFE(iifeFunctionBody)
    } finally {
      // 退出 OvsRenderDomViewDeclaration，计数器 -1
      this.ovsRenderDomViewDepth--
    }
  }

  // 创建 return OvsAPI.createVNode('div', children)
  private createReturnOvsAPICreateVNode(id: SlimeIdentifier): SlimeStatement {
    const memberExpression = SlimeAstUtil.createMemberExpression(
      SlimeAstUtil.createIdentifier('OvsAPI'),
      SlimeAstUtil.createDotOperator(id.loc || undefined),
      SlimeAstUtil.createIdentifier('createVNode')
    )
    
    const callExpression = SlimeAstUtil.createCallExpression(
      memberExpression,
      [
        SlimeAstUtil.createStringLiteral(id.name),  // 元素名称
        SlimeAstUtil.createIdentifier('children')    // children 数组
      ]
    )
    
    return SlimeAstUtil.createReturnStatement(callExpression)
  }

  // 创建 IIFE：(function() { ... })()
  private createIIFE(body: Array<SlimeStatement>): SlimeCallExpression {
    const loc = body[0]?.loc || undefined
    const blockStatement = SlimeAstUtil.createBlockStatement(
      { type: 'LBrace', value: '{', loc } as any,
      { type: 'RBrace', value: '}', loc } as any,
      body,
      loc
    )
    const lp = SlimeAstUtil.createLParen(loc)
    const rp = SlimeAstUtil.createRParen(loc)
    const functionParams = SlimeAstUtil.createFunctionParams(lp, rp)
    const functionExpression = SlimeAstUtil.createFunctionExpression(blockStatement, null, functionParams, loc)
    const callExpression = SlimeAstUtil.createCallExpression(functionExpression, [])
    return callExpression
  }
}

const OvsCstToSlimeAstUtil = new OvsCstToSlimeAst()
export default OvsCstToSlimeAstUtil
