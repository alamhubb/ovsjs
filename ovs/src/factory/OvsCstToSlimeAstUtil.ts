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

  /**
   * OVS 不需要重写 createStatementDeclarationAst
   * 父类已经处理了所有 ES6 语句类型
   * 我们只需要重写 createExpressionStatementAst 来实现特殊的渲染逻辑
   */

  /**
   * 重写 ExpressionStatement 处理
   * 
   * 核心逻辑：
   * - 检查 ovsRenderDomViewDepth 计数器
   * - 如果 > 0，说明在 OvsRenderDomViewDeclaration 内部
   * - 将 ExpressionStatement 转换为 children.push(expression)
   * 
   * 示例：
   * 输入：123
   * 输出（在 div 内）：children.push(123)
   * 输出（不在 div 内）：123;
   */
  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement {
    const exprCst = cst.children?.[0]
    if (!exprCst) {
      throw new Error('ExpressionStatement has no expression')
    }
    
    const expr = this.createExpressionAst(exprCst)
    
    // 如果在 OvsRenderDomViewDeclaration 内部，转换为 children.push(expr)
    if (this.ovsRenderDomViewDepth > 0) {
      // 创建 children.push(expr) 调用
      const pushCall = SlimeAstUtil.createCallExpression(
        SlimeAstUtil.createMemberExpression(
          SlimeAstUtil.createIdentifier('children'),
          SlimeAstUtil.createDotOperator(cst.loc || undefined),
          SlimeAstUtil.createIdentifier('push')
        ),
        [expr]
      )
      
      // 返回包装后的 ExpressionStatement
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
   * 转换 OvsRenderDomViewDeclaration 为 IIFE
   * 
   * 转换流程：
   * 1. 进入时计数器 +1（标记进入 OvsRenderDomViewDeclaration）
   * 2. 转换 StatementList（ExpressionStatement 会自动转为 children.push()）
   * 3. 生成 IIFE 函数体：
   *    - const children = []
   *    - 转换后的语句
   *    - return OvsAPI.createVNode('div', children)
   * 4. 退出时计数器 -1（用 try-finally 保证）
   * 
   * 示例：
   * 输入：div { const a = 1; 123 }
   * 输出：(function() {
   *   const children = []
   *   const a = 1
   *   children.push(123)
   *   return OvsAPI.createVNode('div', children)
   * })()
   */
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
      
      // 转换 StatementList，会自动处理所有语句
      // 其中 ExpressionStatement 会被 createExpressionStatementAst 转换为 children.push()
      const bodyStatements = this.createStatementListAst(statementListCst)
      
      // 生成完整的 IIFE 函数体
      const iifeFunctionBody: SlimeStatement[] = [
        // 1. 声明 children 数组：const children = []
        // 使用 SlimeAstUtil 创建正确的 VariableDeclaration
        SlimeAstUtil.createVariableDeclaration(
          SlimeAstUtil.createVariableDeclarationKind(SlimeVariableDeclarationKindValue.const, cst.loc),  // 使用枚举值
          [
            SlimeAstUtil.createVariableDeclarator(
              SlimeAstUtil.createIdentifier('children'),
              SlimeAstUtil.createEqualOperator(cst.loc),  // 添加 = 操作符
              SlimeAstUtil.createArrayExpression([])
            )
          ],
          cst.loc
        ),
        // 2. 转换后的语句（ExpressionStatement 已经变成 children.push()）
        ...bodyStatements,
        // 3. 返回 OvsAPI.createVNode('div', children)
        this.createReturnOvsAPICreateVNode(id)
      ]
      
      // 生成 IIFE：(function() { ... })()
      return this.createIIFE(iifeFunctionBody)
    } finally {
      // 退出 OvsRenderDomViewDeclaration，计数器 -1
      // 使用 finally 确保即使出错也会恢复计数器
      this.ovsRenderDomViewDepth--
    }
  }

  /**
   * 创建 return OvsAPI.createVNode('div', children) 语句
   * 
   * 生成：
   * return OvsAPI.createVNode('div', children)
   * 
   * @param id 元素标识符（如 'div', 'span'）
   * @returns ReturnStatement
   */
  private createReturnOvsAPICreateVNode(id: SlimeIdentifier): SlimeStatement {
    // 创建 OvsAPI.createVNode 成员表达式
    const memberExpression = SlimeAstUtil.createMemberExpression(
      SlimeAstUtil.createIdentifier('OvsAPI'),
      SlimeAstUtil.createDotOperator(id.loc || undefined),
      SlimeAstUtil.createIdentifier('createVNode')
    )
    
    // 创建函数调用：OvsAPI.createVNode('div', children)
    const callExpression = SlimeAstUtil.createCallExpression(
      memberExpression,
      [
        SlimeAstUtil.createStringLiteral(id.name),  // 第一个参数：元素名称字符串
        SlimeAstUtil.createIdentifier('children')    // 第二个参数：children 数组
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
