import {
  type SlimeArrayExpression,
  type SlimeBaseNode,
  type SlimeBlockStatement,
  type SlimeBooleanLiteral,
  type SlimeCallExpression,
  type SlimeEqualOperator,
  type SlimeFunctionExpression,
  type SlimeMemberExpression,
  type SlimeMethodDefinition,
  type SlimeObjectExpression,
  type SlimePrivateIdentifier,
  SlimeProgramSourceType,
  type SlimeProperty,
  type SlimeRestElement,
  type SlimeReturnStatement,
  type SlimeSimpleCallExpression,
  type SlimeSpreadElement,
  type SlimeSuper,
  SlimeVariableDeclarationKindValue,
  type SlimeDirective,
  type SlimeExpression,
  type SlimeIdentifier,
  type SlimeLiteral,
  type SlimeModuleDeclaration,
  type SlimeNumericLiteral,
  type SlimePattern,
  type SlimeProgram,
  type SlimeStatement,
  type SlimeStringLiteral,
  type SlimeVariableDeclaration,
  type SlimeVariableDeclarator,
  type SlimeDotOperator,
  type SlimeNullLiteral,
  type SlimeFunctionParams,
  type SlimeLParen,
  type SlimeRParen,
  type SlimeLBrace,
  type SlimeRBrace,
  type SlimeImportSpecifier,
  type SlimeImportDefaultSpecifier,
  type SlimeImportNamespaceSpecifier,
  type SlimeImportDeclaration,
  type SlimeFromKeyword,
  type SlimeExportDefaultDeclaration,
  type SlimeMaybeNamedFunctionDeclaration,
  type SlimeMaybeNamedClassDeclaration,
  type SlimeClassDeclaration,
  type SlimeClassBody,
  type SlimeExportNamedDeclaration,
  type SlimeDeclaration,
  type SlimeExportSpecifier, type SlimeVariableDeclarationKind, type SlimeExportToken, type SlimeClassExpression,
} from "./SlimeAstInterface.ts";

import {SlimeAstType} from "./SlimeAstType.ts";
import SubhutiCst, {type SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";

class SlimeAst {
  createProgram(body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>, sourceType: SlimeProgramSourceType = SlimeProgramSourceType.script): SlimeProgram {
    return this.commonLocType({
      type: SlimeAstType.Program,
      sourceType: sourceType,
      body: body
    })
  }


  createFromKeyword(loc?: SubhutiSourceLocation): SlimeFromKeyword {
    return this.commonLocType({
      type: SlimeAstType.From,
      value: 'from',
      loc: loc
    })
  }

  createDotOperator(loc?: SubhutiSourceLocation): SlimeDotOperator {
    return this.commonLocType({
      type: SlimeAstType.Dot,
      value: '.',
      loc: loc
    })
  }

  createImportDeclaration(specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>, from: SlimeFromKeyword, source: SlimeStringLiteral, loc?: SubhutiSourceLocation): SlimeImportDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ImportDeclaration,
      source: source,
      from: from,
      specifiers: specifiers,
      loc: loc
    })
  }

  createExportDefaultDeclaration(declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression, loc?: SubhutiSourceLocation): SlimeExportDefaultDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportDefaultDeclaration,
      declaration: declaration,
      loc: loc
    })
  }


  createExportToken(loc?: SubhutiSourceLocation): SlimeExportToken {
    return this.commonLocType({
      type: SlimeAstType.Export,
      loc: loc
    })
  }

  createExportNamedDeclaration(exportNode: SlimeExportToken, declaration: SlimeDeclaration, specifiers: SlimeExportSpecifier[], source?: SlimeLiteral, loc?: SubhutiSourceLocation): SlimeExportNamedDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportNamedDeclaration,
      declaration: declaration,
      specifiers: specifiers,
      export: exportNode,
      source: source,
      loc: loc
    })
  }

  createClassDeclaration(id: SlimeIdentifier | null, body: SlimeClassBody, loc?: SubhutiSourceLocation): SlimeClassDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ClassDeclaration,
      id: id,
      body: body,
      loc: loc
    })
  }

  createImportDefaultSpecifier(local: SlimeIdentifier, loc?: SubhutiSourceLocation): SlimeImportDefaultSpecifier {
    return this.commonLocType({
      type: SlimeAstType.ImportDefaultSpecifier,
      local: local,
      loc: loc
    })
  }

  createLParen(loc?: SubhutiSourceLocation): SlimeLParen {
    return this.commonLocType({
      type: SlimeAstType.LParen,
      value: '(',
      loc: loc
    })
  }

  createRParen(loc?: SubhutiSourceLocation): SlimeRParen {
    return this.commonLocType({
      type: SlimeAstType.RParen,
      value: ')',
      loc: loc
    })
  }

  creatLBrace(loc?: SubhutiSourceLocation): SlimeLBrace {
    return this.commonLocType({
      type: SlimeAstType.LBrace,
      value: '{',
      loc: loc
    })
  }


  createRBrace(loc?: SubhutiSourceLocation): SlimeRBrace {
    return this.commonLocType({
      type: SlimeAstType.RBrace,
      value: '}',
      loc: loc
    })
  }


  commonLocType<T extends SlimeBaseNode>(node: T): T {
    if (!node.loc) {
      node.loc = {
        value: null,
        type: node.type,
        start: {
          index: 0,
          line: 0,
          column: 0,
        },
        end: {
          index: 0,
          line: 0,
          column: 0,
        }
      }
    }
    return node
  }

  createMemberExpression(object: SlimeExpression | SlimeSuper, dot: SlimeDotOperator, property?: SlimeExpression | SlimePrivateIdentifier): SlimeMemberExpression {
    return this.commonLocType({
      type: SlimeAstType.MemberExpression,
      object: object,
      dot: dot,
      property: property,
      computed: false,
      optional: false,
      loc: object.loc
    })
  }

  createArrayExpression(elements?: Array<SlimeExpression | SlimeSpreadElement | null>): SlimeArrayExpression {
    return this.commonLocType({
      type: SlimeAstType.ArrayExpression,
      elements: elements,
    })
  }


  createPropertyAst(key: SlimeExpression | SlimePrivateIdentifier, value: SlimeExpression | SlimePattern): SlimeProperty {
    return this.commonLocType({
      type: SlimeAstType.Property,
      key: key,
      value: value,
      kind: "init",
      method: false,
      shorthand: false,
      computed: false,
    })
  }

  createObjectExpression(properties: Array<SlimeProperty> = []): SlimeObjectExpression {
    return this.commonLocType({
      type: SlimeAstType.ObjectExpression,
      properties: properties
    })
  }

  createClassExpression(): SlimeClassExpression {

  }

  createCallExpression(callee: SlimeExpression | SlimeSuper, args: Array<SlimeExpression | SlimeSpreadElement>): SlimeSimpleCallExpression {
    return this.commonLocType({
      type: SlimeAstType.CallExpression,
      callee: callee,
      arguments: args,
      optional: false,
      loc: callee.loc
    })
  }

  createReturnStatement(argument?: SlimeExpression | null): SlimeReturnStatement {
    return this.commonLocType({
      type: SlimeAstType.ReturnStatement,
      argument: argument
    })
  }

  createBlockStatement(lBrace: SlimeLBrace, rBrace: SlimeRBrace, body: Array<SlimeStatement>, loc?: SubhutiSourceLocation): SlimeBlockStatement {
    return this.commonLocType({
      lBrace: lBrace,
      rBrace: rBrace,
      type: SlimeAstType.BlockStatement,
      body: body,
      loc: loc
    })
  }

  createFunctionExpression(body: SlimeBlockStatement, id?: SlimeIdentifier | null, params?: SlimeFunctionParams, loc?: SubhutiSourceLocation): SlimeFunctionExpression {
    return this.commonLocType({
      type: SlimeAstType.FunctionExpression,
      params: params,
      id: id,
      body: body,
      loc: loc
    })
  }

  createFunctionParams(lParen: SlimeLParen, rParen: SlimeRParen, loc?: SubhutiSourceLocation, params?: SlimePattern[]): SlimeFunctionParams {
    return this.commonLocType({
      type: SlimeAstType.FunctionParams,
      lParen: lParen,
      rParen: rParen,
      params: params,
      loc: loc
    })
  }


  createVariableDeclaration(kind: SlimeVariableDeclarationKind, declarations: SlimeVariableDeclarator[], loc?: SubhutiSourceLocation): SlimeVariableDeclaration {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclaration,
      declarations: declarations,
      kind: kind,
      loc: loc
    })
  }

  createRestElement(argument: SlimePattern): SlimeRestElement {
    return this.commonLocType({
      type: SlimeAstType.RestElement,
      argument: argument
    })
  }

  createSpreadElement(argument: SlimeExpression): SlimeSpreadElement {
    return this.commonLocType({
      type: SlimeAstType.SpreadElement,
      argument: argument
    })
  }


  createVariableDeclarationKind(value: SlimeVariableDeclarationKindValue, loc?: SubhutiSourceLocation): SlimeVariableDeclarationKind {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclarationKind,
      value: value,
      loc: loc
    })
  }

  createEqualOperator(loc?: SubhutiSourceLocation): SlimeEqualOperator {
    return this.commonLocType({
      type: SlimeAstType.EqualOperator,
      value: '=',
      loc: loc
    })
  }

  createVariableDeclarator(id: SlimePattern, operator?: SlimeEqualOperator, init?: SlimeExpression): SlimeVariableDeclarator {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclarator,
      id: id,
      equal: operator,
      init: init,
    })
  }

  createIdentifier(name: string, loc?: SubhutiSourceLocation): SlimeIdentifier {
    return this.commonLocType({
      type: SlimeAstType.Identifier,
      name: name,
      loc: loc
    })
  }

  createLiteral(value?: number | string): SlimeLiteral {
    let ast: SlimeLiteral
    if (value === undefined) {
      // ast = this.createNullLiteralToken()
    } else if (typeof value === "string") {
      ast = this.createStringLiteral(value)
    } else if (typeof value === "number") {
      ast = this.createNumericLiteral(value)
    }
    return ast
  }


  createNullLiteralToken(): SlimeNullLiteral {
    return this.commonLocType({
      type: SlimeAstType.NullLiteral,
      value: null
    })
  }


  createStringLiteral(value: string): SlimeStringLiteral {
    return this.commonLocType({
      type: SlimeAstType.StringLiteral,
      value: value.replace(/^['"]|['"]$/g, '')
    })
  }

  createNumericLiteral(value: number): SlimeNumericLiteral {
    return this.commonLocType({
      type: SlimeAstType.NumericLiteral,
      value: value
    })
  }

  createBooleanLiteral(value: boolean): SlimeBooleanLiteral {
    return this.commonLocType({
      type: SlimeAstType.BooleanLiteral,
      value: value
    })
  }

  createMethodDefinition(key: SlimeExpression | SlimePrivateIdentifier, value: SlimeFunctionExpression): SlimeMethodDefinition {
    return this.commonLocType({
      type: SlimeAstType.MethodDefinition,
      key: key,
      value: value,
      kind: "method",
      computed: false,
      static: false,
    })
  }
}

const SlimeAstUtil = new SlimeAst()
export default SlimeAstUtil
