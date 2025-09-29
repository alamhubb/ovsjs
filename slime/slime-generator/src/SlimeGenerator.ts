import {
  type SlimeArrayExpression,
  type SlimeArrayPattern,
  type SlimeAssignmentPattern,
  type SlimeBaseNode,
  type SlimeBlockStatement,
  type SlimeCallExpression,
  type SlimeClassDeclaration,
  type SlimeDeclaration, type SlimeDotOperator,
  type SlimeExportNamedDeclaration,
  type SlimeExpression,
  type SlimeExpressionStatement,
  type SlimeFunctionDeclaration,
  type SlimeFunctionExpression,
  type SlimeFunctionParams,
  type SlimeIdentifier,
  type SlimeImportDeclaration,
  type SlimeImportDefaultSpecifier, type SlimeImportNamespaceSpecifier,
  type SlimeImportSpecifier,
  type SlimeLiteral,
  type SlimeMemberExpression,
  type SlimeModuleDeclaration,
  type SlimeNumericLiteral,
  type SlimeObjectExpression,
  type SlimeObjectPattern,
  type SlimePattern,
  type SlimePrivateIdentifier,
  type SlimeProgram,
  SlimeProgramSourceType,
  type SlimeProperty,
  type SlimeRestElement,
  type SlimeReturnStatement,
  type SlimeStatement,
  type SlimeStringLiteral,
  type SlimeVariableDeclaration,
  type SlimeVariableDeclarator
} from "slime-ast/src/SlimeAstInterface.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";
import SlimeCodeMapping, {SlimeCodeLocation, type SlimeGeneratorResult} from "./SlimeCodeMapping.ts";
import type {SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";
import {es6TokenMapObj, Es6TokenName, es6TokensObj} from "slime-parser/src/language/es2015/Es6Tokens.ts";
import {es5TokensObj} from "slime-parser/src/language/es5/Es5Tokens.ts";
import {SubhutiCreateToken} from "subhuti/src/struct/SubhutiCreateToken.ts";
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts";

export default class SlimeGenerator {
  static mappings: SlimeCodeMapping[] = null
  static lastSourcePosition: SlimeCodeLocation = null
  static generatePosition: SlimeCodeLocation = null
  static sourceCodeIndex: number = null
  private static generateCode = ''
  private static generateLine = 0
  private static generateColumn = 0
  private static generateIndex = 0
  private static tokens: SubhutiMatchToken[] = null

  private static findNextTokenLocByTypeAndIndex(tokenType: string, index: number): SubhutiSourceLocation {
    const popToken = this.tokens.find(item => ((item.tokenName === tokenType) && (item.index > index)))
    let loc: SubhutiSourceLocation = null
    if (popToken) {
      loc = {
        // index: popToken.index,
        value: popToken.tokenValue,
        type: popToken.tokenName,
        start: {
          index: popToken.index,
          line: popToken.rowNum,
          column: popToken.columnStartNum,
        },
        end: {
          index: popToken.index + popToken.tokenValue.length,
          line: popToken.rowNum,
          column: popToken.columnEndNum
        }
      }
    }
    return loc
  }

  static generator(node: SlimeBaseNode, tokens: SubhutiMatchToken[]): SlimeGeneratorResult {
    this.mappings = []
    this.tokens = tokens
    this.lastSourcePosition = new SlimeCodeLocation()
    this.generatePosition = new SlimeCodeLocation()
    this.sourceCodeIndex = 0
    this.generateLine = 0
    this.generateColumn = 0
    this.generateIndex = 0
    this.generateCode = ''
    this.generatorNode(node)
    return {
      mapping: this.mappings,
      code: this.generateCode
    }
  }

  private static generatorProgram(node: SlimeProgram) {
    this.generatorNodes(node.body)
  }

  private static generatorModuleDeclarations(node: Array<SlimeStatement | SlimeModuleDeclaration>) {
    for (const nodeElement of node) {
      this.generatorNode(nodeElement)
      // this.addSemicolonAndNewLine()
    }
  }

  private static generatorModuleDeclaration(node: SlimeStatement | SlimeModuleDeclaration) {

  }

  private static generatorImportDeclaration(node: SlimeImportDeclaration) {
    this.addCodeAndMappings(es6TokensObj.ImportTok, node.loc)
    this.addSpacing()
    this.generatorNodes(node.specifiers)
    this.addSpacing()
    this.addCodeAndMappings(es6TokensObj.FromTok, node.loc)
    this.addSpacing()
    this.generatorNode(node.source)
  }


  private static generatorImportSpecifiers(specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>) {
    for (const specifier of specifiers) {

    }
  }


  private static generatorImportSpecifier(node: SlimeImportSpecifier) {

  }

  private static generatorImportDefaultSpecifier(node: SlimeImportDefaultSpecifier) {
    this.generatorNode(node.local)
  }


  private static generatorImportNamespaceSpecifier(node: SlimeImportNamespaceSpecifier) {

  }


  private static generatorExportNamedDeclaration(node: SlimeExportNamedDeclaration) {
    this.addCodeAndMappings(es6TokensObj.ExportTok, node.export.loc)
    this.addSpacing()
    this.generatorNode(node.declaration)
  }


  private static generatorNodes(nodes: SlimeBaseNode[]) {
    nodes.forEach((node, index) => {
      this.generatorNode(node)
      // this.addSemicolonAndNewLine()
    })
  }


  private static generatorExpressionStatement(node: SlimeExpressionStatement) {
    this.generatorNode(node.expression)
  }

  private static generatorCallExpression(node: SlimeCallExpression) {
    //IIFE
    if (node.callee.type === SlimeAstType.FunctionExpression) {
      this.addLParen()
    }
    this.generatorNode(node.callee as SlimeExpression)
    if (node.callee.type === SlimeAstType.FunctionExpression) {
      this.addRParen()
    }

    this.addCodeAndMappingsFindLoc(es6TokensObj.LParen, Es6TokenName.LParen, node.callee.loc.end.index)

    if (node.arguments.length) {
      node.arguments.forEach((argument, index) => {
        if (index !== 0) {
          this.addComma()
        }
        this.generatorNode(argument as SlimeExpression)
      })
    }
    const rParenSearchIndex = node.arguments.length
      ? node.arguments[node.arguments.length - 1].loc.end.index
      : node.callee.loc.end.index
    this.addCodeAndMappingsFindLoc(es6TokensObj.RParen, Es6TokenName.RParen, rParenSearchIndex)
  }

  private static generatorFunctionExpression(node: SlimeFunctionExpression) {
    this.addCodeAndMappings(es6TokensObj.FunctionTok, node.loc)
    if (node.id) {
      this.addSpacing()
      this.generatorNode(node.id)
    }
    this.generatorNode(node.params)
    this.generatorNode(node.body)
  }

  private static generatorFunctionParams(node: SlimeFunctionParams) {
    this.addLParen(node.lParen.loc)
    if (node.params) {
      node.params.forEach((param, index) => {
        if (index !== 0) {
          this.addComma()
        }
        this.generatorNode(param)
      })
    }
    this.addRParen(node.rParen.loc)
  }

  private static generatorArrayExpression(node: SlimeArrayExpression) {
    this.addLBracket()
    for (const element of node.elements) {
      this.generatorNode(element as SlimeExpression)
      this.addComma()
    }
    this.addRBracket()
  }

  private static generatorObjectExpression(node: SlimeObjectExpression) {
    this.addLBrace()
    node.properties.forEach((item, index) => {

      this.generatorNode(item)
      if (index !== node.properties.length - 1) {
      }
    })
    this.addRBrace()
  }

  private static generatorPrivateIdentifier(node: SlimePrivateIdentifier) {
    this.addCode({name: Es6TokenName.Identifier, value: node.name})
  }

  private static generatorProperty(node: SlimeProperty) {
    this.generatorNode(node.key)
    this.addCode(es6TokensObj.Colon)
    this.generatorNode(node.value)
    this.addComma()
  }


  private static patternTypes = [
    SlimeAstType.Identifier,
    SlimeAstType.ObjectPattern,
    SlimeAstType.ArrayPattern,
    SlimeAstType.RestElement,
    SlimeAstType.AssignmentPattern,
    SlimeAstType.MemberExpression,
  ]

  private static generatorIdentifier(node: SlimeIdentifier) {
    const identifier = {name: Es6TokenName.Identifier, value: node.name}
    this.addCodeAndMappings(identifier, node.loc)
  }

  private static generatorFunctionDeclaration(node: SlimeFunctionDeclaration) {

  }

  private static generatorClassDeclaration(node: SlimeClassDeclaration) {

  }


  private static generatorNode(node: SlimeBaseNode) {
    if (node.type === SlimeAstType.Program) {
      return this.generatorProgram(node as SlimeProgram)
    } else if (node.type === SlimeAstType.PrivateIdentifier) {
      this.generatorPrivateIdentifier(node as SlimePrivateIdentifier)
    } else if (node.type === SlimeAstType.Identifier) {
      this.generatorIdentifier(node as SlimeIdentifier)
    } else if (node.type === SlimeAstType.NumericLiteral) {
      this.generatorNumberLiteral(node as SlimeNumericLiteral)
    } else if (node.type === SlimeAstType.MemberExpression) {
      this.generatorMemberExpression(node as SlimeMemberExpression)
    } else if (node.type === SlimeAstType.CallExpression) {
      this.generatorCallExpression(node as SlimeCallExpression)
    } else if (node.type === SlimeAstType.FunctionExpression) {
      this.generatorFunctionExpression(node as SlimeFunctionExpression)
    } else if (node.type === SlimeAstType.StringLiteral) {
      this.generatorStringLiteral(node as SlimeStringLiteral)
    } else if (node.type === SlimeAstType.ArrayExpression) {
      this.generatorArrayExpression(node as SlimeArrayExpression)
    } else if (node.type === SlimeAstType.ObjectExpression) {
      this.generatorObjectExpression(node as SlimeObjectExpression)
    } else if (node.type === SlimeAstType.Property) {
      this.generatorProperty(node as SlimeProperty)

    } else if (node.type === SlimeAstType.VariableDeclarator) {
      this.generatorVariableDeclarator(node as SlimeVariableDeclarator)

    } else if (node.type === SlimeAstType.RestElement) {
      this.generatorRestElement(node as SlimeRestElement)

    } else if (node.type === SlimeAstType.Identifier) {
      this.generatorIdentifier(node as SlimeIdentifier)

    } else if (node.type === SlimeAstType.ObjectPattern) {
      this.generatorObjectPattern(node as SlimeObjectPattern)

    } else if (node.type === SlimeAstType.ArrayPattern) {
      this.generatorArrayPattern(node as SlimeArrayPattern)

    } else if (node.type === SlimeAstType.RestElement) {
      this.generatorRestElement(node as SlimeRestElement)

    } else if (node.type === SlimeAstType.AssignmentPattern) {
      this.generatorAssignmentPattern(node as SlimeAssignmentPattern)

    } else if (node.type === SlimeAstType.MemberExpression) {
      this.generatorMemberExpression(node as SlimeMemberExpression)

    } else if (node.type === SlimeAstType.FunctionDeclaration) {
      this.generatorFunctionDeclaration(node as SlimeFunctionDeclaration)
    } else if (node.type === SlimeAstType.ClassDeclaration) {
      this.generatorClassDeclaration(node as SlimeClassDeclaration)
    } else if (node.type === SlimeAstType.VariableDeclaration) {
      this.generatorVariableDeclaration(node as SlimeVariableDeclaration)
    } else if (node.type === SlimeAstType.ExpressionStatement) {
      this.generatorExpressionStatement(node as SlimeExpressionStatement)
    } else if (node.type === SlimeAstType.ReturnStatement) {
      this.generatorReturnStatement(node as SlimeReturnStatement)
    } else if (node.type === SlimeAstType.BlockStatement) {
      this.generatorBlockStatement(node as SlimeBlockStatement)
    } else if (node.type === SlimeAstType.ImportSpecifier) {
      this.generatorImportSpecifier(node as SlimeImportSpecifier)
    } else if (node.type === SlimeAstType.ImportDefaultSpecifier) {
      this.generatorImportDefaultSpecifier(node as SlimeImportDefaultSpecifier)
    } else if (node.type === SlimeAstType.ImportNamespaceSpecifier) {
      this.generatorImportNamespaceSpecifier(node as SlimeImportNamespaceSpecifier)
    } else if (node.type === SlimeAstType.ExportNamedDeclaration) {
      this.generatorExportNamedDeclaration(node as SlimeExportNamedDeclaration)
    } else if (node.type === SlimeAstType.ExportDefaultDeclaration) {

    } else if (node.type === SlimeAstType.ImportDeclaration) {
      this.generatorImportDeclaration(node as SlimeImportDeclaration)
    } else if (node.type === SlimeAstType.FunctionParams) {
      this.generatorFunctionParams(node as SlimeFunctionParams)
    } else {
      throw new Error('不支持的类型：' + node.type)
    }
    if (node.loc.newLine) {
      this.addNewLine()
    }
  }


  private static generatorObjectPattern(node: SlimeObjectPattern) {
    this.generatorNodes(node.properties)
  }

  private static generatorArrayPattern(node: SlimeArrayPattern) {
    this.generatorNodes(node.elements)
  }

  private static generatorRestElement(node: SlimeRestElement) {
    this.generatorNode(node.argument)
  }

  private static generatorAssignmentPattern(node: SlimeAssignmentPattern) {
    this.generatorNode(node.left)
    this.generatorNode(node.right)
  }

  private static generatorBlockStatement(node: SlimeBlockStatement) {
    this.addLBrace()
    this.generatorNodes(node.body)
    this.addRBrace()
  }

  private static generatorReturnStatement(node: SlimeReturnStatement) {
    this.addCode(es6TokensObj.ReturnTok)
    this.addSpacing()
    this.generatorNode(node.argument)
  }

  private static addSpacing() {
    this.addCode(es6TokensObj.Spacing)
  }

  private static addDot(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.Dot, loc)
  }


  private static addComma(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.Comma, loc)
  }

  private static addLParen(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.LParen, loc)
  }

  private static addRParen(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.RParen, loc)
  }

  private static addLBrace(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.LBrace, loc)
  }

  private static addRBrace(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.RBrace, loc)
  }

  private static addLBracket(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.LBracket, loc)
  }

  private static addRBracket(loc?: SubhutiSourceLocation) {
    this.addCodeAndMappings(es6TokensObj.RBracket, loc)
  }

  private static generatorMemberExpression(node: SlimeMemberExpression) {
    this.generatorNode(node.object as SlimeExpression)
    if (node.dot) {
      this.addDot(node.dot.loc)
    }
    if (node.property) {
      this.generatorNode(node.property)
    }
  }

  private static generatorVariableDeclaration(node: SlimeVariableDeclaration) {
    console.log(989898)
    console.log(node.kind.loc)
    this.addCodeAndMappings(es6TokenMapObj[node.kind.value.valueOf()], node.kind.loc)
    this.addCodeSpacing()
    for (const declaration of node.declarations) {
      this.generatorNode(declaration)
    }
  }

  static get lastMapping() {
    if (this.mappings.length) {
      return this.mappings[this.mappings.length - 1]
    }
    return null
  }


  private static generatorVariableDeclarator(node: SlimeVariableDeclarator) {
    this.generatorNode(node.id)
    this.addCodeSpacing()
    if (node.equal) {
      this.addCodeAndMappings(es6TokensObj.Eq, node.equal.loc)
      this.addCodeSpacing()
    }
    if (node.init) {
      this.generatorNode(node.init)
    }
  }

  private static generatorNumberLiteral(node: SlimeNumericLiteral) {
    this.addCodeAndMappings({name: Es6TokenName.NumericLiteral, value: String(node.value)}, node.loc)
  }

  private static generatorStringLiteral(node: SlimeStringLiteral) {
    this.addCodeAndMappings({name: Es6TokenName.StringLiteral, value: `'${node.value}'`}, node.loc)
  }

  static cstLocationToSlimeLocation(cstLocation: SubhutiSourceLocation) {
    if (cstLocation) {
      const sourcePosition: SlimeCodeLocation = {
        type: cstLocation.type,
        index: cstLocation.start.index,
        value: cstLocation.value,
        // length: sourceLength,
        length: cstLocation.end.index - cstLocation.start.index,
        line: cstLocation.start.line,
        column: cstLocation.start.column,
      }
      return sourcePosition
    }
    return null
  }

  private static addCodeAndMappingsBySourcePosition(token: SubhutiCreateToken, sourcePosition: SlimeCodeLocation) {


    this.addMappings(token, sourcePosition)
    this.addCode(token)
  }

  private static addCodeAndMappingsFindLoc(token: SubhutiCreateToken, tokenType: string, findIndex: number) {
    const cstLocation = this.findNextTokenLocByTypeAndIndex(tokenType, findIndex)
    if (cstLocation) {
      this.addCodeAndMappings(token, cstLocation)
    } else {
      // 当无法在源代码中定位到对应位置时，仍然要输出生成代码，避免欠缺括号等 token
      this.addCodeAndMappings(token)
    }
  }

  private static addCodeAndMappings(token: SubhutiCreateToken, cstLocation: SubhutiSourceLocation = null) {
    if (cstLocation) {
      this.addCodeAndMappingsBySourcePosition(token, this.cstLocationToSlimeLocation(cstLocation))
    } else {
      this.addCode(token)
    }
  }

  private static addCode(code: SubhutiCreateToken) {
    this.generateCode += code.value
    this.generateColumn += code.value.length
    this.generateIndex += code.value.length
  }

  private static addSemicolonAndNewLine() {
    // this.addSemicolon()
    // this.addNewLine()
  }

  private static addSemicolon() {
    this.generateCode += ';'
    this.generateIndex += 1
  }

  private static addNewLine() {
    this.generateCode += '\n'
    this.generateLine++
    this.generateColumn = 0
    this.generateIndex += 1
  }

  private static addCodeSpacing() {
    this.generateCode += ' '
    this.generateColumn++
    this.generateIndex++
  }


  private static addMappings(generateToken: SubhutiCreateToken, sourcePosition: SlimeCodeLocation) {
    if (this.mappings.length) {
      const lastMapping = this.mappings[this.mappings.length - 1]

      if (sourcePosition.line > lastMapping.source.line) {
        this.addNewLine()
      }
    }

    let generate: SlimeCodeLocation = {
      type: generateToken.name,
      index: this.generateIndex,
      value: generateToken.value,
      length: generateToken.value.length,
      line: this.generateLine,
      column: this.generateColumn,
    }
    if (!sourcePosition) {
      console.log(989898)
      console.log(sourcePosition)
      console.log(generate)
    }
    this.mappings.push({
      source: sourcePosition,
      generate: generate
    })
  }

  /*private static generatorModuleDeclaration(node: SlimeModuleDeclaration[]) {
      node.
  }*/
}
