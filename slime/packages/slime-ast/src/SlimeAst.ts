/**
 * SlimeAst.ts - AST 节点创建工厂
 *
 * 为每个 AST 节点类型提供创建方法
 * Token 创建方法请使用 SlimeTokenCreate.ts
 */

import {
  type SlimeArrayExpression,
  type SlimeBaseNode,
  type SlimeBlockStatement,
  type SlimeBooleanLiteral,
  type SlimeCallExpression,
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
  type SlimeNullLiteral,
  type SlimeImportSpecifier,
  type SlimeImportDefaultSpecifier,
  type SlimeImportNamespaceSpecifier,
  type SlimeImportDeclaration,
  type SlimeExportDefaultDeclaration,
  type SlimeMaybeNamedFunctionDeclaration,
  type SlimeMaybeNamedClassDeclaration,
  type SlimeClassDeclaration,
  type SlimeClassBody,
  type SlimeExportNamedDeclaration,
  type SlimeDeclaration,
  type SlimeExportSpecifier,
  type SlimeClassExpression,
  type SlimeVariableDeclarationKindToken,
  type SlimeLBraceToken,
  type SlimeRBraceToken,
  type SlimeLParenToken,
  type SlimeRParenToken,
  type SlimeDotToken,
  type SlimeFromToken,
  type SlimeExportToken,
  type SlimeAssignToken,
  type SlimePropertyDefinition,
} from "./SlimeESTree.ts";

import {SlimeAstType} from "./SlimeAstType.ts";
import type {SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";

class SlimeAst {
  // ============================================
  // 通用辅助方法
  // ============================================

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

  // ============================================
  // Program
  // ============================================

  createProgram(body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>, sourceType: SlimeProgramSourceType = SlimeProgramSourceType.script): SlimeProgram {
    return this.commonLocType({
      type: SlimeAstType.Program,
      sourceType: sourceType,
      body: body
    })
  }

  // ============================================
  // Expressions
  // ============================================

  createMemberExpression(object: SlimeExpression | SlimeSuper, dot: SlimeDotToken, property?: SlimeExpression | SlimePrivateIdentifier): SlimeMemberExpression {
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

  createParenthesizedExpression(expression: SlimeExpression, loc?: SubhutiSourceLocation): any {
    return this.commonLocType({
      type: SlimeAstType.ParenthesizedExpression,
      expression: expression,
      loc: loc
    })
  }

  createClassExpression(id?: SlimeIdentifier | null, superClass?: SlimeExpression | null, body?: SlimeClassBody, loc?: SubhutiSourceLocation): SlimeClassExpression {
    return this.commonLocType({
      type: SlimeAstType.ClassExpression,  // 节点类型
      id: id,                               // 类名（可选，匿名类为 null）
      body: body,                           // 类体（包含方法和属性）
      superClass: superClass,               // 父类表达式（可选，没有 extends 时为 null 或 undefined）
      loc: loc                              // 源码位置信息
    })
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

  // ============================================
  // Statements
  // ============================================

  createBlockStatement(lBrace: SlimeLBraceToken, rBrace: SlimeRBraceToken, body: Array<SlimeStatement>, loc?: SubhutiSourceLocation): SlimeBlockStatement {
    return this.commonLocType({
      lBraceToken: lBrace,
      rBraceToken: rBrace,
      type: SlimeAstType.BlockStatement,
      body: body,
      loc: loc
    })
  }

  // ============================================
  // Functions
  // ============================================

  createFunctionExpression(body: SlimeBlockStatement, id?: SlimeIdentifier | null, params?: SlimePattern[], loc?: SubhutiSourceLocation): SlimeFunctionExpression {
    return this.commonLocType({
      type: SlimeAstType.FunctionExpression,
      params: params || [],
      id: id,
      body: body,
      loc: loc
    })
  }

  // ============================================
  // Declarations
  // ============================================

  createVariableDeclaration(kind: SlimeVariableDeclarationKindToken, declarations: SlimeVariableDeclarator[], loc?: SubhutiSourceLocation): SlimeVariableDeclaration {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclaration,
      declarations: declarations,
      kind: kind,
      loc: loc
    })
  }

  createVariableDeclarator(id: SlimePattern, init?: SlimeExpression | null, loc?: SubhutiSourceLocation): SlimeVariableDeclarator {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclarator,
      id: id,
      init: init,
      loc: loc
    })
  }

  // ============================================
  // Patterns
  // ============================================

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

  // ============================================
  // Modules
  // ============================================

  createImportDeclaration(specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>, fromToken: SlimeFromToken, source: SlimeStringLiteral, loc?: SubhutiSourceLocation): SlimeImportDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ImportDeclaration,
      source: source,
      fromToken: fromToken,
      specifiers: specifiers,
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

  createExportDefaultDeclaration(declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression, loc?: SubhutiSourceLocation): SlimeExportDefaultDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportDefaultDeclaration,
      declaration: declaration,
      loc: loc
    })
  }

  createExportNamedDeclaration(exportToken: SlimeExportToken, declaration: SlimeDeclaration | null, specifiers: SlimeExportSpecifier[], source?: SlimeLiteral | null, loc?: SubhutiSourceLocation): SlimeExportNamedDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportNamedDeclaration,
      declaration: declaration,
      specifiers: specifiers,
      exportToken: exportToken,
      source: source,
      loc: loc
    })
  }

  // ============================================
  // Classes
  // ============================================

  createClassDeclaration(id: SlimeIdentifier | null, body: SlimeClassBody, loc?: SubhutiSourceLocation): SlimeClassDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ClassDeclaration,
      id: id,
      body: body,
      loc: loc
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


  createStringLiteral(value: string, loc?: SubhutiSourceLocation, raw?: string): SlimeStringLiteral {
    return this.commonLocType({
      type: SlimeAstType.StringLiteral,
      value: value.replace(/^['"]|['"]$/g, ''),
      raw: raw || value,  // 保存原始值（包含引号）
      loc: loc
    })
  }

  createNumericLiteral(value: number, raw?: string): SlimeNumericLiteral {
    return this.commonLocType({
      type: SlimeAstType.NumericLiteral,
      value: value,
      raw: raw || String(value)  // 保存原始值（保留格式如 0xFF）
    })
  }

  createBooleanLiteral(value: boolean): SlimeBooleanLiteral {
    return this.commonLocType({
      type: SlimeAstType.BooleanLiteral,
      value: value
    })
  }

  createTemplateLiteral(quasis: any[], expressions: SlimeExpression[], loc?: SubhutiSourceLocation): any {
    return this.commonLocType({
      type: SlimeAstType.TemplateLiteral,
      quasis: quasis,
      expressions: expressions,
      loc: loc
    })
  }

  createTemplateElement(tail: boolean, raw: string, cooked?: string | null, loc?: SubhutiSourceLocation): any {
    return this.commonLocType({
      type: SlimeAstType.TemplateElement,
      tail: tail,
      value: {
        raw: raw,
        cooked: cooked !== undefined ? cooked : raw
      },
      loc: loc
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

  createPropertyDefinition(key: SlimeExpression | SlimePrivateIdentifier, value?: SlimeExpression | null, isStatic: boolean = false): SlimePropertyDefinition {
    return this.commonLocType({
      type: SlimeAstType.PropertyDefinition,
      key: key,
      value: value ?? null,
      computed: false,
      static: isStatic,
    })
  }
}

const SlimeAstUtil = new SlimeAst()
export default SlimeAstUtil

