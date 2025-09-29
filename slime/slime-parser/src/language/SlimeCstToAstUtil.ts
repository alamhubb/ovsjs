import {
  type SlimeAssignmentExpression,
  type SlimeBlockStatement,
  type SlimeCallExpression,
  type SlimeClassBody,
  type SlimeClassDeclaration,
  type SlimeConditionalExpression,
  type SlimeDeclaration,
  type SlimeDirective,
  type SlimeExportDefaultDeclaration,
  type SlimeExportNamedDeclaration,
  type SlimeExpression,
  type SlimeExpressionStatement,
  type SlimeFunctionExpression,
  type SlimeIdentifier,
  type SlimeLiteral,
  type SlimeModuleDeclaration,
  type SlimePattern,
  type SlimeProgram,
  type SlimeStatement,
  type SlimeStringLiteral,
  type SlimeVariableDeclaration,
  type SlimeVariableDeclarator,
  type SlimeReturnStatement,
  type SlimeArrayExpression,
  type SlimeSpreadElement,
  type SlimePropertyDefinition,
  SlimeProgramSourceType,
  type SlimeMethodDefinition,
  type SlimeMaybeNamedFunctionDeclaration,
  type SlimeMaybeNamedClassDeclaration,
  type SlimeEqualOperator,
  type SlimeObjectExpression,
  type SlimeProperty,
  type SlimeNumericLiteral,
  type SlimeRestElement,
  type SlimeSuper,
  type SlimeDotOperator,
  type SlimeMemberExpression,
  type SlimeFunctionParams,
  type SlimeLParen,
  type SlimeImportDeclaration,
  type SlimeImportSpecifier,
  type SlimeImportDefaultSpecifier,
  type SlimeImportNamespaceSpecifier,
  type SlimeImportExpression,
  SlimeVariableDeclarationKindValue,
  type SlimeVariableDeclarationKind
} from "slime-ast/src/SlimeAstInterface.ts";
import SubhutiCst, {type SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";
import Es6Parser from "./es2015/Es6Parser.ts";
import Es6TokenConsumer from "./es2015/Es6Tokens.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";
import type {SubhutiHighlithSourceLocation} from "slime-ast/src/fsadfasast.ts";
import {SubhutiRule} from "subhuti/src/parser/SubhutiParser.ts";


export function checkCstName(cst: SubhutiCst, cstName: string) {
  if (cst.name !== cstName) {
    throwNewError(cst.name)
  }
  return cstName
}

export function throwNewError(errorMsg: string = 'syntax error') {
  throw new Error(errorMsg)
}

//应该根据cst名称命名，转换为ast
export class SlimeCstToAst {
  createIdentifierAst(cst: SubhutiCst): SlimeIdentifier {
    const astName = checkCstName(cst, Es6TokenConsumer.prototype.Identifier.name);
    const identifier = SlimeAstUtil.createIdentifier(cst.value, cst.loc)
    return identifier
  }

  toProgram(cst: SubhutiCst): SlimeProgram {
    const astName = checkCstName(cst, Es6Parser.prototype.Program.name);
    const first = cst.children[0]
    let program: SlimeProgram
    if (first.name === Es6Parser.prototype.ModuleItemList.name) {
      const body = this.createModuleItemListAst(first)
      program = SlimeAstUtil.createProgram(body, SlimeProgramSourceType.module)
    } else if (first.name === Es6Parser.prototype.StatementList.name) {
      const body = this.createStatementListAst(first)
      program = SlimeAstUtil.createProgram(body, SlimeProgramSourceType.script)
    }
    program.loc = cst.loc
    return program
  }

  createModuleItemListAst(cst: SubhutiCst): Array<SlimeStatement | SlimeModuleDeclaration> {
    //直接返回声明
    //                 this.Statement()
    //                 this.Declaration()
    const astName = checkCstName(cst, Es6Parser.prototype.ModuleItemList.name);
    const asts = cst.children.map(item => {
      if (item.name === Es6Parser.prototype.ExportDeclaration.name) {
        return this.createExportDeclarationAst(item)
      } else if (item.name === Es6Parser.prototype.ImportDeclaration.name) {
        return this.createImportDeclarationAst(item)
      } else if (item.name === Es6Parser.prototype.StatementListItem.name) {
        return this.createStatementListItemAst(item)
      }
    })
    const astArr = asts.flat()

    return astArr
  }

  createImportDeclarationAst(cst: SubhutiCst): SlimeImportDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[1]
    let importDeclaration: SlimeImportDeclaration
    let specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>
    let FromClause: SlimeImportDeclaration
    if (first1.name === Es6Parser.prototype.ImportClause.name) {
      specifiers = this.createImportClauseAst(first1)
      FromClause = this.createFromClauseAst(cst.children[2])
      importDeclaration = SlimeAstUtil.createImportDeclaration(specifiers, FromClause.from, FromClause.source, cst.loc)
    } else if (first1.name === Es6Parser.prototype.ModuleSpecifier.name) {
    }
    return importDeclaration
  }


  createFromClauseAst(cst: SubhutiCst): SlimeImportDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.FromClause.name);
    const first = cst.children[0]
    const from = SlimeAstUtil.createFromKeyword(first.loc)
    const ModuleSpecifier = this.createModuleSpecifierAst(cst.children[1])
    return SlimeAstUtil.createImportDeclaration(null, from, ModuleSpecifier)
  }

  createModuleSpecifierAst(cst: SubhutiCst): SlimeStringLiteral {
    let astName = checkCstName(cst, Es6Parser.prototype.ModuleSpecifier.name);
    const first = cst.children[0]
    const ast = SlimeAstUtil.createStringLiteral(first.value)
    return ast
  }

  createImportClauseAst(cst: SubhutiCst): Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier> {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportClause.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.ImportedDefaultBinding.name) {
      const specifier = this.createImportedDefaultBindingAst(first)
      return [specifier]
    } else if (first.name === Es6Parser.prototype.NameSpaceImport.name) {
      this.createNameSpaceImportAst(first)
    } else if (first.name === Es6Parser.prototype.NamedImports.name) {
      this.createNameSpaceImportAst(first)
    } else if (first.name === Es6Parser.prototype.ImportedDefaultBindingCommaNameSpaceImport.name) {
      this.createNameSpaceImportAst(first)
    } else if (first.name === Es6Parser.prototype.ImportedDefaultBindingCommaNamedImports.name) {
      this.createNameSpaceImportAst(first)
    }
  }

  createImportedDefaultBindingAst(cst: SubhutiCst): SlimeImportDefaultSpecifier {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportedDefaultBinding.name);
    const first = cst.children[0]
    const id = this.createImportedBindingAst(first)
    const importDefaultSpecifier: SlimeImportDefaultSpecifier = SlimeAstUtil.createImportDefaultSpecifier(id)
    return importDefaultSpecifier
  }

  createImportedBindingAst(cst: SubhutiCst): SlimeIdentifier {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportedBinding.name);
    const first = cst.children[0]
    return this.createBindingIdentifierAst(first)
  }

  createNameSpaceImportAst(cst: SubhutiCst): Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier> {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[0]
    if (first1.name === Es6Parser.prototype.ImportClause.name) {

    } else if (first1.name === Es6Parser.prototype.ModuleSpecifier.name) {

    }
  }

  createNamedImportsAst(cst: SubhutiCst): SlimeImportDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[0]
    if (first1.name === Es6Parser.prototype.ImportClause.name) {

    } else if (first1.name === Es6Parser.prototype.ModuleSpecifier.name) {

    }
  }

  createImportedDefaultBindingCommaNameSpaceImportAst(cst: SubhutiCst): SlimeImportDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[0]
    if (first1.name === Es6Parser.prototype.ImportClause.name) {

    } else if (first1.name === Es6Parser.prototype.ModuleSpecifier.name) {

    }
  }

  createImportedDefaultBindingCommaNamedImportsAst(cst: SubhutiCst): SlimeImportDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[0]
    if (first1.name === Es6Parser.prototype.ImportClause.name) {

    } else if (first1.name === Es6Parser.prototype.ModuleSpecifier.name) {

    }
  }


  createBindingIdentifierAst(cst: SubhutiCst): SlimeIdentifier {
    const astName = checkCstName(cst, Es6Parser.prototype.BindingIdentifier.name);
    //Identifier
    const first = cst.children[0]
    return SlimeAstUtil.createIdentifier(first.value, first.loc)
  }


  /*createImportClauseAst(cst: SubhutiCst):Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>{
    let astName = checkCstName(cst, Es6Parser.prototype.ImportClause.name);


  }*/


  createStatementListAst(cst: SubhutiCst): Array<SlimeStatement> {
    const astName = checkCstName(cst, Es6Parser.prototype.StatementList.name);
    if (cst.children) {
      const statements = cst.children.map(item => this.createStatementListItemAst(item)).flat()
      return statements
    }
    return []
  }

  createStatementListItemAst(cst: SubhutiCst): Array<SlimeStatement> {
    const astName = checkCstName(cst, Es6Parser.prototype.StatementListItem.name);
    const statements = cst.children.map(item => this.createStatementAst(item)).flat()
    return statements
  }

  createStatementAst(cst: SubhutiCst): Array<SlimeStatement> {
    const astName = checkCstName(cst, Es6Parser.prototype.Statement.name);
    const statements: SlimeStatement[] = cst.children.map(item => this.createStatementDeclarationAst(item))
    return statements
  }

  createStatementDeclarationAst(cst: SubhutiCst) {
    if (cst.name === Es6Parser.prototype.VariableDeclaration.name) {
      return this.createVariableDeclarationAst(cst)
    } else if (cst.name === Es6Parser.prototype.ExpressionStatement.name) {
      return this.createExpressionStatementAst(cst)
    } else if (cst.name === Es6Parser.prototype.ReturnStatement.name) {
      return this.createReturnStatementAst(cst)
    }
  }

  createExportDeclarationAst(cst: SubhutiCst): SlimeExportDefaultDeclaration | SlimeExportNamedDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.ExportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[1]
    let token = SlimeAstUtil.createExportToken(first.loc)
    if (first1.name === Es6Parser.prototype.AsteriskFromClauseEmptySemicolon.name) {

    } else if (first1.name === Es6Parser.prototype.ExportClauseFromClauseEmptySemicolon.name) {

    } else if (first1.name === Es6Parser.prototype.ExportClauseEmptySemicolon.name) {

    } else if (first1.name === Es6Parser.prototype.Declaration.name) {
      const declaration = this.createDeclarationAst(cst.children[1])
      console.log('asdfsadfsad')
      console.log(cst.children[1])
      console.log(declaration)

      return SlimeAstUtil.createExportNamedDeclaration(token, declaration, [], null, cst.loc)

    } else if (first1.name === Es6Parser.prototype.DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression.name) {
      const del = this.createDefaultExportDeclarationAst(cst.children[2])
      return SlimeAstUtil.createExportDefaultDeclaration(del, cst.loc)
    }
  }

  createDeclarationAst(cst: SubhutiCst): SlimeDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.Declaration.name);
    const first = cst.children[0]
    switch (first.name) {
      case Es6Parser.prototype.VariableDeclaration.name:
        return this.createVariableDeclarationAst(first);
    }
  }

  createDefaultExportDeclarationAst(cst: SubhutiCst): SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression {
    switch (cst.name) {
      case Es6Parser.prototype.ClassDeclaration.name:
        return this.createClassDeclarationAst(cst);
    }
  }


  createNodeAst(cst: SubhutiCst) {
    switch (cst.name) {
      case Es6Parser.prototype.VariableDeclaration.name:
        return this.createVariableDeclarationAst(cst);
      case Es6Parser.prototype.ExpressionStatement.name:
        return this.createExpressionStatementAst(cst);
    }
  }


  createVariableDeclarationAst(cst: SubhutiCst): SlimeVariableDeclaration {
    //直接返回声明
    //                 this.Statement()
    //                 this.Declaration()
    const astName = checkCstName(cst, Es6Parser.prototype.VariableDeclaration.name);
    let kindCst: SubhutiCst = cst.children[0].children[0]
    let kindNode: SlimeVariableDeclarationKind = SlimeAstUtil.createVariableDeclarationKind(kindCst.value as SlimeVariableDeclarationKindValue, kindCst.loc)
    let declarations: SlimeVariableDeclarator[] = []
    if (cst.children[1]) {
      declarations = this.createVariableDeclarationListAst(cst.children[1])
    }
    return SlimeAstUtil.createVariableDeclaration(kindNode, declarations, cst.loc)
  }

  createVariableDeclarationListAst(cst: SubhutiCst): SlimeVariableDeclarator[] {
    let declarations = cst.children.map(item => this.createVariableDeclaratorAst(item)) as any[]
    return declarations
  }

  createClassDeclarationAst(cst: SubhutiCst): SlimeClassDeclaration {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassDeclaration.name);

    const id = this.createBindingIdentifierAst(cst.children[1])
    const body = this.createClassTailAst(cst.children[2])

    const ast = SlimeAstUtil.createClassDeclaration(id, body, cst.loc)

    return ast
  }

  createClassTailAst(cst: SubhutiCst): SlimeClassBody {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassTail.name);
    const body = this.createClassBodyAst(cst.children[1])
    return body
  }

  createClassBodyItemAst(staticCst: SubhutiCst, cst: SubhutiCst): SlimeMethodDefinition | SlimePropertyDefinition {
    if (cst.name === Es6Parser.prototype.MethodDefinition.name) {
      return this.createMethodDefinitionAst(staticCst, cst)
    } else if (cst.name === Es6Parser.prototype.PropertyDefinition.name) {
      // return this.createExportDeclarationAst(item)
    }
  }

  createClassBodyAst(cst: SubhutiCst): SlimeClassBody {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassBody.name);
    //ClassBody.ClassElementList
    const body: Array<SlimeMethodDefinition | SlimePropertyDefinition> = cst.children[0].children.map(item => {
        const astName = checkCstName(item, Es6Parser.prototype.ClassElement.name);
        if (item.children.length > 1) {
          return this.createClassBodyItemAst(item.children[0], item.children[1])
        } else {
          return this.createClassBodyItemAst(null, item.children[0])
        }
      }
    )
    const ast: SlimeClassBody = {
      type: astName as any,
      body: body,
      loc: cst.loc
    }
    return ast
  }

  createFormalParameterListAst(cst: SubhutiCst): SlimePattern[] {
    const astName = checkCstName(cst, Es6Parser.prototype.FormalParameterList.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.FunctionRestParameter.name) {
      return [this.createFunctionRestParameterAst(first)]
    } else if (first.name === Es6Parser.prototype.FormalParameterListFormalsList.name) {
      return this.createFormalParameterListFormalsListAst(first)
    } else {
      throw new Error('不支持的类型')
    }
  }

  createFormalParameterListFormalsListAst(cst: SubhutiCst): SlimePattern[] {
    const astName = checkCstName(cst, Es6Parser.prototype.FormalParameterListFormalsList.name);
    const first = cst.children[0]
    const ary: SlimePattern[] = []
    for (const child of cst.children) {
      if (child.name === Es6Parser.prototype.FormalsList.name) {
        const childAry = this.createFormalsListAst(child)
        ary.push(...childAry)
      } else if (child.name === Es6Parser.prototype.CommaFunctionRestParameter.name) {
        const child2 = child.children[1]
        const childRes = this.createFunctionRestParameterAst(child2)
        ary.push(childRes)
      } else {
        throw new Error('不支持的类型')
      }
    }
    return ary
  }

  createFormalsListAst(cst: SubhutiCst): SlimeIdentifier[] {
    const astName = checkCstName(cst, Es6Parser.prototype.FormalsList.name);
    const ary = []
    for (const child of cst.children) {
      if (child.name === Es6Parser.prototype.FormalParameter.name) {
        const item = this.createFormalParameterAst(child)
        ary.push(item)
      } else if (child.name === Es6TokenConsumer.prototype.Comma.name) {

      } else {
        throw new Error('不支持的类型')
      }
    }
    return ary
  }

  createFormalParameterAst(cst: SubhutiCst): SlimeIdentifier {
    const astName = checkCstName(cst, Es6Parser.prototype.FormalParameter.name);
    //BindingElement
    const first = cst.children[0]
    return this.createBindingElementAst(first)
  }

  createBindingElementAst(cst: SubhutiCst): SlimeIdentifier {
    const astName = checkCstName(cst, Es6Parser.prototype.BindingElement.name);
    //SingleNameBinding
    const first = cst.children[0]
    return this.createSingleNameBindingAst(first)
  }

  createSingleNameBindingAst(cst: SubhutiCst): SlimeIdentifier {
    const astName = checkCstName(cst, Es6Parser.prototype.SingleNameBinding.name);
    //BindingIdentifier
    const first = cst.children[0]
    return this.createBindingIdentifierAst(first)
  }


  createFunctionRestParameterAst(cst: SubhutiCst): SlimeRestElement {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionRestParameter.name);
    const first = cst.children[0]
    return this.createBindingRestElementAst(first)
  }

  createBindingRestElementAst(cst: SubhutiCst): SlimeRestElement {
    const astName = checkCstName(cst, Es6Parser.prototype.BindingRestElement.name);
    const first1 = cst.children[1]
    const id = this.createIdentifierAst(first1.children[0])
    return SlimeAstUtil.createRestElement(id)
  }

  createPropertyNameMethodDefinitionAst(cst: SubhutiCst): SlimeFunctionExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.PropertyNameMethodDefinition.name);
    const PropertyName = cst.children[0]
    // const PropertyNameAst = this.createPropertyNameAst(first)
    const FunctionFormalParametersBodyDefineCst: SubhutiCst = cst.children[1]
    const functionExpression = this.createFunctionFormalParametersBodyDefineAst(FunctionFormalParametersBodyDefineCst, cst.children[0].loc)

    const LiteralPropertyName = PropertyName.children[0]
    checkCstName(LiteralPropertyName, Es6Parser.prototype.LiteralPropertyName.name);
    const LiteralPropertyNameFirst = LiteralPropertyName.children[0]
    const functionName = LiteralPropertyNameFirst.value
    functionExpression.id = SlimeAstUtil.createIdentifier(functionName, LiteralPropertyNameFirst.loc)

    return functionExpression
  }

  createFunctionFormalParametersBodyDefineAst(cst: SubhutiCst, startLoc: SubhutiSourceLocation): SlimeFunctionExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionFormalParametersBodyDefine.name);
    const first = cst.children[0]
    const first1 = cst.children[1]
    const params: SlimeFunctionParams = this.createFunctionFormalParametersAst(first)
    const body: SlimeBlockStatement = this.createFunctionBodyDefineAst(first1)

    return SlimeAstUtil.createFunctionExpression(body, null, params, startLoc)
  }

  createFunctionBodyDefineAst(cst: SubhutiCst): SlimeBlockStatement {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionBodyDefine.name);
    if (cst.children[1].name === Es6Parser.prototype.FunctionBody.name) {
      const first1 = cst.children[1]
      const body = this.createFunctionBodyAst(first1)
      return SlimeAstUtil.createBlockStatement(null, null, body, cst.loc)
    }
    return SlimeAstUtil.createBlockStatement(null, null, [])
  }

  createFunctionBodyAst(cst: SubhutiCst): Array<SlimeStatement> {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionBody.name);
    const first = cst.children[0]
    return this.createStatementListAst(first)
  }

  createFunctionFormalParametersAst(cst: SubhutiCst): SlimeFunctionParams {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionFormalParameters.name);
    const lp = SlimeAstUtil.createLParen(cst.children[0].loc)
    const rp = SlimeAstUtil.createRParen(cst.children[cst.children.length - 1].loc)
    if (cst.children[1].name === Es6Parser.prototype.FormalParameterList.name) {
      const FormalParameterListCst = cst.children[1]
      const params = this.createFormalParameterListAst(FormalParameterListCst)
      SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
    }
    return SlimeAstUtil.createFunctionParams(lp, rp, cst.loc)
  }

  createMethodDefinitionAst(cst: SubhutiCst, staticCst?: SubhutiCst): SlimeMethodDefinition {
    const astName = checkCstName(cst, Es6Parser.prototype.MethodDefinition.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.PropertyNameMethodDefinition.name) {
      const SlimeFunctionExpression = this.createPropertyNameMethodDefinitionAst(first)
      return SlimeAstUtil.createMethodDefinition(SlimeFunctionExpression.id, SlimeFunctionExpression)
    } else if (first.name === Es6Parser.prototype.PropertyNameMethodDefinition.name) {

    } else {
      throw new Error('不支持的类型')
    }
  }

  createFunctionExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionExpression.name);
    const FunctionFormalParametersBodyDefineCst: SubhutiCst = cst.children[1]
    const FunctionFormalParametersBodyDefineAst = this.createFunctionFormalParametersBodyDefineAst(FunctionFormalParametersBodyDefineCst, cst.loc)
    return FunctionFormalParametersBodyDefineAst
  }


  createBlockStatementAst(cst: SubhutiCst): SlimeBlockStatement {
    const astName = checkCstName(cst, Es6Parser.prototype.StatementList.name);
    const statements: Array<SlimeStatement> = this.createStatementListAst(cst)
    const ast: SlimeBlockStatement = {
      type: Es6Parser.prototype.BlockStatement.name as any,
      body: statements,
      loc: cst.loc
    }
    return ast
  }

  createReturnStatementAst(cst: SubhutiCst): SlimeReturnStatement {
    const astName = checkCstName(cst, Es6Parser.prototype.ReturnStatement.name);
    const ast: SlimeReturnStatement = {
      type: astName as any,
      argument: this.createExpressionAst(cst.children[1]),
      loc: cst.loc
    } as any
    return ast
  }

  createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement {
    const astName = checkCstName(cst, Es6Parser.prototype.ExpressionStatement.name);
    const ast: SlimeExpressionStatement = {
      type: astName as any,
      expression: this.createExpressionAst(cst.children[0]),
      loc: cst.loc
    } as any
    return ast
  }

  createCallExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.CallExpression.name);
    if (cst.children.length > 1) {
      const argumentsCst = cst.children[1]
      let argumentsAst: SlimeExpression[] = this.createArgumentsAst(argumentsCst)
      const callee = this.createMemberExpressionAst(cst.children[0])

      return SlimeAstUtil.createCallExpression(callee, argumentsAst)
    }
    return this.createExpressionAst(cst.children[0])
  }

  createArgumentsAst(cst: SubhutiCst): Array<SlimeExpression> {
    const astName = checkCstName(cst, Es6Parser.prototype.Arguments.name);
    const first1 = cst.children[1]
    if (first1) {
      if (first1.name === Es6Parser.prototype.ArgumentList.name) {
        const res = this.createArgumentListAst(first1)
        return res
      }
    }
    return []
  }

  createArgumentListAst(cst: SubhutiCst): Array<SlimeExpression> {
    const astName = checkCstName(cst, Es6Parser.prototype.ArgumentList.name);
    const ArgumentList: SlimeExpression[] = []
    for (const child of cst.children) {
      if (child.name === Es6Parser.prototype.AssignmentExpression.name) {
        const res = this.createAssignmentExpressionAst(child)
        ArgumentList.push(res)
      }
    }
    return ArgumentList
  }

  createMemberExpressionFirstOr(cst: SubhutiCst): SlimeExpression | SlimeSuper {
    if (cst.name === Es6Parser.prototype.PrimaryExpression.name) {
      return this.createPrimaryExpressionAst(cst)
    } else if (cst.name === Es6Parser.prototype.SuperProperty.name) {
      return this.createPrimaryExpressionAst(cst)
    } else if (cst.name === Es6Parser.prototype.MetaProperty.name) {
      return this.createPrimaryExpressionAst(cst)
    } else if (cst.name === Es6Parser.prototype.NewMemberExpressionArguments.name) {
      return this.createPrimaryExpressionAst(cst)
    } else {
      throw new Error('不支持的类型')
    }
  }

  createDotIdentifierAst(cst: SubhutiCst): SlimeDotOperator {
    const astName = checkCstName(cst, Es6Parser.prototype.DotIdentifier.name);
    const SlimeDotOperator = SlimeAstUtil.createDotOperator(cst.children[0].loc)
    return SlimeDotOperator
  }


  createMemberExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.MemberExpression.name);
    if (cst.children.length > 1) {
      const memberExpressionObject = this.createMemberExpressionFirstOr(cst.children[0])
      const first1 = cst.children[1]
      let memberExpression: SlimeMemberExpression
      if (first1.name === Es6Parser.prototype.DotIdentifier.name) {
        const SlimeDotOperator = SlimeAstUtil.createDotOperator(first1.children[0].loc)
        const memberExpressionProperty = first1.children[1] && this.createIdentifierAst(first1.children[1])
        memberExpression = SlimeAstUtil.createMemberExpression(memberExpressionObject, SlimeDotOperator, memberExpressionProperty)
      }
      return memberExpression
    }
    return this.createExpressionAst(cst.children[0])
  }

  createVariableDeclaratorAst(cst: SubhutiCst): SlimeVariableDeclarator {
    const astName = checkCstName(cst, Es6Parser.prototype.VariableDeclarator.name);
    const id = this.createBindingIdentifierAst(cst.children[0])

    console.log(6565656)
    console.log(id)
    let variableDeclarator: SlimeVariableDeclarator
    const varCst = cst.children[1]
    if (varCst) {
      const eqCst = varCst.children[0]
      const eqAst = SlimeAstUtil.createEqualOperator(eqCst.loc)
      const initCst = varCst.children[1]
      if (initCst) {
        const init = this.createAssignmentExpressionAst(initCst)
        variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst, init)
      } else {
        variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst)
      }
    } else {
      variableDeclarator = SlimeAstUtil.createVariableDeclarator(id)
    }
    variableDeclarator.loc = cst.loc
    return variableDeclarator
  }

  createExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = cst.name
    let left
    if (astName === Es6Parser.prototype.Expression.name) {
      left = this.createExpressionAst(cst.children[0])
    } else if (astName === Es6Parser.prototype.Statement.name) {
      left = this.createStatementAst(cst)
    } else if (astName === Es6Parser.prototype.AssignmentExpression.name) {
      left = this.createAssignmentExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.ConditionalExpression.name) {
      left = this.createConditionalExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.LogicalORExpression.name) {
      left = this.createLogicalORExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.LogicalANDExpression.name) {
      left = this.createLogicalANDExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.BitwiseORExpression.name) {
      left = this.createBitwiseORExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.BitwiseXORExpression.name) {
      left = this.createBitwiseXORExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.BitwiseANDExpression.name) {
      left = this.createBitwiseANDExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.EqualityExpression.name) {
      left = this.createEqualityExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.RelationalExpression.name) {
      left = this.createRelationalExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.ShiftExpression.name) {
      left = this.createShiftExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.AdditiveExpression.name) {
      left = this.createAdditiveExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.MultiplicativeExpression.name) {
      left = this.createMultiplicativeExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.UnaryExpression.name) {
      left = this.createUnaryExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.PostfixExpression.name) {
      left = this.createPostfixExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.LeftHandSideExpression.name) {
      left = this.createLeftHandSideExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.CallExpression.name) {
      left = this.createCallExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.NewExpression.name) {
      left = this.createNewExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.MemberExpression.name) {
      left = this.createMemberExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.PrimaryExpression.name) {
      left = this.createPrimaryExpressionAst(cst)
    } else {
      throw new Error('暂不支持的类型：' + cst.name)
    }
    return left
  }

  createLogicalORExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.LogicalORExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createLogicalANDExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.LogicalANDExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createBitwiseORExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.BitwiseORExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createBitwiseXORExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.BitwiseXORExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createBitwiseANDExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.BitwiseANDExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createEqualityExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.EqualityExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createRelationalExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.RelationalExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createShiftExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ShiftExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createAdditiveExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.AdditiveExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createMultiplicativeExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.MultiplicativeExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createUnaryExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.UnaryExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createPostfixExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.PostfixExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createLeftHandSideExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.LeftHandSideExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createNewExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.NewExpression.name);
    if (cst.children.length > 1) {

    }
    return this.createExpressionAst(cst.children[0])
  }

  createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.PrimaryExpression.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.IdentifierReference.name) {
      return this.createIdentifierAst(first.children[0])
    } else if (first.name === Es6Parser.prototype.Literal.name) {
      return this.createLiteralAst(first)
    } else if (first.name === Es6Parser.prototype.ArrayLiteral.name) {
      return this.createArrayExpressionAst(first)
    } else if (first.name === Es6Parser.prototype.FunctionExpression.name) {
      return this.createFunctionExpressionAst(first)
    } else if (first.name === Es6Parser.prototype.ObjectLiteral.name) {
      return this.createObjectExpressionAst(first)
    } else {
      throw new Error('未知的createPrimaryExpressionAst：' + first.name)
    }
  }

  createObjectExpressionAst(cst: SubhutiCst): SlimeObjectExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ObjectLiteral.name);
    const ary: Array<SlimeProperty> = []
    if (cst.children.length > 2) {
      const PropertyDefinitionListCst = cst.children[1]
      for (const child of PropertyDefinitionListCst.children) {
        if (child.name === Es6Parser.prototype.PropertyDefinition.name) {
          const property = this.createPropertyDefinitionAst(child)
          ary.push(property)
        }
      }
    }
    return SlimeAstUtil.createObjectExpression(ary)
  }

  createPropertyDefinitionAst(cst: SubhutiCst): SlimeProperty {
    const astName = checkCstName(cst, Es6Parser.prototype.PropertyDefinition.name);
    const first = cst.children[0]

    if (cst.children.length > 2) {
      const PropertyNameCst = cst.children[0]
      const AssignmentExpressionCst = cst.children[2]

      const key = this.createPropertyNameAst(PropertyNameCst)
      const value = this.createAssignmentExpressionAst(AssignmentExpressionCst)

      const keyAst = SlimeAstUtil.createPropertyAst(key, value)

      return keyAst
    } else if (first.name === Es6Parser.prototype.MethodDefinition.name) {
      const SlimeMethodDefinition = this.createMethodDefinitionAst(first)

      const keyAst = SlimeAstUtil.createPropertyAst(SlimeMethodDefinition.key, SlimeMethodDefinition.value)

      return keyAst
    } else {
      throw new Error('不支持的类型')
    }
  }


  createPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral {
    const astName = checkCstName(cst, Es6Parser.prototype.PropertyName.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.LiteralPropertyName.name) {
      return this.createLiteralPropertyNameAst(first)
    }
  }

  createLiteralPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral {
    const astName = checkCstName(cst, Es6Parser.prototype.LiteralPropertyName.name);
    const first = cst.children[0]
    if (first.name === Es6TokenConsumer.prototype.Identifier.name) {
      return this.createIdentifierAst(first)
    } else if (first.name === Es6TokenConsumer.prototype.NumericLiteral.name) {
      return this.createNumericLiteralAst(first)
    } else if (first.name === Es6TokenConsumer.prototype.StringLiteral.name) {
      return this.createStringLiteralAst(first)
    }
  }


  createNumericLiteralAst(cst: SubhutiCst): SlimeNumericLiteral {
    const astName = checkCstName(cst, Es6TokenConsumer.prototype.NumericLiteral.name);
    return SlimeAstUtil.createNumericLiteral(Number(cst.value))
  }

  createStringLiteralAst(cst: SubhutiCst): SlimeStringLiteral {
    const astName = checkCstName(cst, Es6TokenConsumer.prototype.StringLiteral.name);
    const value = cst.value
    const ast = SlimeAstUtil.createStringLiteral(value)
    return ast
  }

  createArrayExpressionAst(cst: SubhutiCst): SlimeArrayExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ArrayLiteral.name);
    const ast: SlimeArrayExpression = {
      type: 'ArrayExpression',
      elements: this.createElementListAst(cst.children[1])
    }
    return ast
  }

  createElementListAst(cst: SubhutiCst): Array<null | SlimeExpression> {
    const astName = checkCstName(cst, Es6Parser.prototype.ElementList.name);
    const ast: Array<null | SlimeExpression> = cst.children.filter(item => item.name === Es6Parser.prototype.AssignmentExpression.name).map(item => this.createAssignmentExpressionAst(item))
    return ast
  }


  createLiteralAst(cst: SubhutiCst): SlimeLiteral {
    const astName = checkCstName(cst, Es6Parser.prototype.Literal.name);
    const firstChild = cst.children[0]
    const firstValue = firstChild.value
    let value
    if (firstChild.name === Es6TokenConsumer.prototype.NumericLiteral.name) {
      value = SlimeAstUtil.createNumericLiteral(Number(firstValue))
    } else if (firstChild.name === Es6TokenConsumer.prototype.TrueTok.name) {
      value = SlimeAstUtil.createBooleanLiteral(true)
    } else if (firstChild.name === Es6TokenConsumer.prototype.FalseTok.name) {
      value = SlimeAstUtil.createBooleanLiteral(false)
    } else {
      value = SlimeAstUtil.createStringLiteral(firstValue)
    }
    value.loc = firstChild.loc
    return value
  }


  createAssignmentExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.AssignmentExpression.name);
    let left
    let right
    if (cst.children.length === 1) {
      return this.createExpressionAst(cst.children[0])
    }
    const ast: SlimeAssignmentExpression = {
      type: astName as any,
      // operator: AssignmentOperator;
      left: left,
      right: right,
      loc: cst.loc
    } as any
    return ast
  }

  createConditionalExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ConditionalExpression.name);
    const firstChild = cst.children[0]
    let test = this.createExpressionAst(firstChild)
    let alternate
    let consequent
    if (cst.children.length === 1) {
      return this.createExpressionAst(cst.children[0])
    } else {
      alternate = this.createAssignmentExpressionAst(cst.children[1])
      consequent = this.createAssignmentExpressionAst(cst.children[2])
    }
    const ast: SlimeConditionalExpression = {
      type: astName as any,
      test: test as any,
      alternate: alternate as any,
      consequent: consequent as any,
      loc: cst.loc
    } as any
    return ast
  }
}

const SlimeCstToAstUtil = new SlimeCstToAst()

export default SlimeCstToAstUtil
