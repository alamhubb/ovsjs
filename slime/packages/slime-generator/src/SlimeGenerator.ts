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
    this.addCode(es6TokensObj.ImportTok)
    this.addSpacing()
    
    if (node.specifiers && node.specifiers.length > 0) {
      const hasDefault = node.specifiers.some((s: any) => s.type === SlimeAstType.ImportDefaultSpecifier)
      const hasNamed = node.specifiers.some((s: any) => s.type === SlimeAstType.ImportSpecifier)
      const hasNamespace = node.specifiers.some((s: any) => s.type === SlimeAstType.ImportNamespaceSpecifier)
      
      if (hasDefault) {
        const defaultSpec = node.specifiers.find((s: any) => s.type === SlimeAstType.ImportDefaultSpecifier)
        this.generatorNode(defaultSpec)
        if (hasNamed || hasNamespace) {
          this.addComma()
          this.addSpacing()
        }
      }
      
      if (hasNamespace) {
        const nsSpec = node.specifiers.find((s: any) => s.type === SlimeAstType.ImportNamespaceSpecifier)
        this.generatorNode(nsSpec)
      } else if (hasNamed) {
        // import {name, greet}
        const namedSpecs = node.specifiers.filter((s: any) => s.type === SlimeAstType.ImportSpecifier)
        this.addLBrace()
        namedSpecs.forEach((specifier: any, index) => {
          if (index > 0) this.addComma()
          this.generatorNode(specifier)
        })
        this.addRBrace()
      }
    }
    
    this.addSpacing()
    this.addCodeAndMappings(es6TokensObj.FromTok, node.loc)
    this.addSpacing()
    this.generatorNode(node.source)
    // 添加分号
    this.addCode(es6TokensObj.Semicolon)
  }


  private static generatorImportSpecifiers(specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>) {
    for (const specifier of specifiers) {

    }
  }


  private static generatorImportSpecifier(node: SlimeImportSpecifier) {
    // import {name} or import {name as localName}
    if (node.imported.name !== node.local.name) {
      // import {name as localName}
      this.generatorNode(node.imported)
      this.addSpacing()
      this.addCode(es6TokensObj.AsTok)
      this.addSpacing()
      this.generatorNode(node.local)
    } else {
      // import {name}
      this.generatorNode(node.local)
    }
  }

  private static generatorImportDefaultSpecifier(node: SlimeImportDefaultSpecifier) {
    this.generatorNode(node.local)
  }


  private static generatorImportNamespaceSpecifier(node: SlimeImportNamespaceSpecifier) {
    // import * as name
    this.addCode(es6TokensObj.Asterisk)
    this.addSpacing()
    this.addCode(es6TokensObj.AsTok)
    this.addSpacing()
    this.generatorNode(node.local)
  }


  private static generatorExportNamedDeclaration(node: SlimeExportNamedDeclaration) {
    this.addCode(es6TokensObj.ExportTok)
    this.addSpacing()
    if (node.declaration) {
      // export const name = 'Alice'
      this.generatorNode(node.declaration)
    } else if (node.specifiers && node.specifiers.length > 0) {
      // export {name} 或 export {name as userName}
      this.addLBrace()
      node.specifiers.forEach((spec, index) => {
        if (index > 0) {
          this.addComma()
          this.addSpacing()
        }
        this.generatorExportSpecifier(spec)
      })
      this.addRBrace()
      
      if (node.source) {
        // export {name} from './module.js'
        this.addSpacing()
        this.addCode(es6TokensObj.FromTok)
        this.addSpacing()
        this.generatorNode(node.source)
      }
    }
  }

  private static generatorExportSpecifier(spec: any) {
    // local: 本地名称, exported: 导出名称
    this.generatorNode(spec.local)
    if (spec.local !== spec.exported) {
      // export {name as userName}
      this.addSpacing()
      this.addCode(es6TokensObj.AsTok)
      this.addSpacing()
      this.generatorNode(spec.exported)
    }
    // else: export {name} - 简写形式，只输出一次
  }
  
  private static generatorExportAllDeclaration(node: any) {
    // export * from './module.js'
    this.addCode(es6TokensObj.ExportTok)
    this.addSpacing()
    this.addCode(es6TokensObj.Asterisk)
    this.addSpacing()
    this.addCode(es6TokensObj.FromTok)
    this.addSpacing()
    this.generatorNode(node.source)
  }


  private static generatorNodes(nodes: SlimeBaseNode[]) {
    nodes.forEach((node, index) => {
      this.generatorNode(node)
      // this.addSemicolonAndNewLine()
    })
  }


  private static generatorExpressionStatement(node: SlimeExpressionStatement) {
    this.generatorNode(node.expression)
    // 添加分号
    this.addCode(es6TokensObj.Semicolon)
  }

  private static generatorYieldExpression(node: any) {
    // yield 或 yield* argument
    this.addCode(es6TokensObj.YieldTok)
    if (node.delegate) {
      this.addCode(es6TokensObj.Asterisk)
    }
    if (node.argument) {
      this.addSpacing()
      this.generatorNode(node.argument)
    }
  }

  private static generatorAwaitExpression(node: any) {
    // await argument
    this.addCode(es6TokensObj.AwaitTok)
    if (node.argument) {
      this.addSpacing()
      this.generatorNode(node.argument)
    }
  }

  private static generatorTemplateLiteral(node: any) {
    // 生成模板字符串：`part1 ${expr1} part2 ${expr2} part3`
    this.generateCode += '`'
    
    const quasis = node.quasis || []
    const expressions = node.expressions || []
    
    // quasis和expressions交替出现，quasis总是比expressions多1个
    for (let i = 0; i < quasis.length; i++) {
      const quasi = quasis[i]
      // 输出模板元素的内容
      if (quasi.value && quasi.value.cooked !== undefined) {
        this.generateCode += quasi.value.cooked
      }
      
      // 如果不是最后一个quasi，输出对应的expression
      if (i < expressions.length) {
        this.generateCode += '${'
        this.generatorNode(expressions[i])
        this.generateCode += '}'
      }
    }
    
    this.generateCode += '`'
  }

  private static generatorCallExpression(node: SlimeCallExpression) {
    //IIFE - 需要括号包裹 FunctionExpression 和 ArrowFunctionExpression
    const needsParen = node.callee.type === SlimeAstType.FunctionExpression ||
                       node.callee.type === SlimeAstType.ArrowFunctionExpression
    
    if (needsParen) {
      this.addLParen()
    }
    this.generatorNode(node.callee as SlimeExpression)
    if (needsParen) {
      this.addRParen()
    }

    // 直接输出括号与参数（不依赖token定位，兼容合成AST）
    this.addLParen()
    if (node.arguments.length) {
      node.arguments.forEach((argument, index) => {
        if (index !== 0) {
          this.addComma()
        }
        // 检查是否是SpreadElement
        if (argument.type === SlimeAstType.SpreadElement) {
          this.generatorSpreadElement(argument as SlimeSpreadElement)
        } else {
          this.generatorNode(argument as SlimeExpression)
        }
      })
    }
    this.addRParen()
  }

  private static generatorFunctionExpression(node: SlimeFunctionExpression) {
    // 如果是async函数，先输出async关键字
    if (node.async) {
      this.addCode(es6TokensObj.AsyncTok)
      this.addSpacing()
    }
    
    this.addCodeAndMappings(es6TokensObj.FunctionTok, node.loc)
    if (node.id) {
      this.addSpacing()
      this.generatorNode(node.id)
    }
    // params可能是FunctionParams对象或空数组[]
    if (node.params && node.params.type === SlimeAstType.FunctionParams) {
      this.generatorNode(node.params)
    } else {
      // 空参数列表或无效params
      this.addLParen()
      this.addRParen()
    }
    // body可能缺失
    if (node.body && node.body.type) {
      this.generatorNode(node.body)
    } else {
      // 空函数体
      this.addLBrace()
      this.addRBrace()
    }
  }

  /**
   * 生成箭头函数表达式
   */
  private static generatorArrowFunctionExpression(node: any) {
    // 如果是async箭头函数，先输出async关键字
    if (node.async) {
      this.addCode(es6TokensObj.AsyncTok)
      this.addSpacing()
    }
    
    // 输出参数
    if (node.params && node.params.length === 1 && node.params[0].type === SlimeAstType.Identifier) {
      // 单个参数，不需要括号
      this.generatorNode(node.params[0])
    } else {
      // 多个参数或无参数，需要括号
      this.addLParen()
      if (node.params) {
        node.params.forEach((param: any, index: number) => {
          if (index !== 0) {
            this.addComma()
          }
          this.generatorNode(param)
        })
      }
      this.addRParen()
    }
    
    // 输出箭头
    this.addSpacing()
    this.addCode(es6TokensObj.Arrow)
    this.addSpacing()
    
    // 输出函数体
    if (node.expression && node.body.type !== SlimeAstType.BlockStatement) {
      // 表达式形式：x => x * 2
      this.generatorNode(node.body)
    } else {
      // 块语句形式：x => { return x * 2 }
      this.generatorNode(node.body)
    }
  }

  /**
   * 生成二元运算表达式
   */
  private static generatorBinaryExpression(node: any) {
    // 输出左操作数
    this.generatorNode(node.left)
    
    // 输出运算符
    this.addSpacing()
    this.addCode({ name: 'Operator', value: node.operator })
    this.addSpacing()
    
    // 输出右操作数
    this.generatorNode(node.right)
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
    this.addLBracket(node.loc)
    for (const element of node.elements) {
      if (element === null) {
        // 空元素：[1, , 3]，只添加逗号
      } else if (element.type === SlimeAstType.SpreadElement) {
        // SpreadElement：[...arr]
        this.generatorSpreadElement(element as SlimeSpreadElement)
      } else {
        // 普通表达式
        this.generatorNode(element as SlimeExpression)
      }
      this.addComma()
    }
    this.addRBracket(node.loc)
  }

  private static generatorObjectExpression(node: SlimeObjectExpression) {
    this.addLBrace()
    node.properties.forEach((item, index) => {
      // ES2018: SpreadElement需要特殊处理
      if (item.type === SlimeAstType.SpreadElement) {
        this.generatorSpreadElement(item as SlimeSpreadElement)
        this.addComma()
      } else {
        // Property类型会自己添加逗号
        this.generatorNode(item)
      }
    })
    this.addRBrace()
  }

  private static generatorPrivateIdentifier(node: SlimePrivateIdentifier) {
    this.addCode({name: Es6TokenName.Identifier, value: node.name})
  }

  private static generatorProperty(node: SlimeProperty) {
    // 检查 value 是否是 FunctionExpression 且 key 与 function id 同名
    if (!node.computed &&  // 计算属性不使用简写
      node.value.type === SlimeAstType.FunctionExpression &&
      (node as any).value.id &&
      node.key.type === SlimeAstType.Identifier &&
      node.key.name === (node as any).value.id.name) {
      // 使用方法简写语法
      this.generatorNode(node.key)
      this.generatorNode((node as any).value.params)
      this.generatorNode((node as any).value.body)
    } else {
      // 常规/计算属性语法
      if (node.computed) {
        this.addLBracket()
        this.generatorNode(node.key as any)
        this.addRBracket()
      } else {
        this.generatorNode(node.key as any)
      }
      this.addCode(es6TokensObj.Colon)
      this.generatorNode(node.value as any)
    }
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
    // 如果是async函数，先输出async关键字
    if (node.async) {
      this.addCode(es6TokensObj.AsyncTok)
      this.addSpacing()
    }
    
    // 输出 function 关键字
    this.addCode(es6TokensObj.FunctionTok)
    
    // Generator函数：输出 * 号
    if (node.generator) {
      this.addCode(es6TokensObj.Asterisk)
    }
    
    // 输出函数名
    if (node.id) {
      this.addSpacing()  // function/function* 和函数名之间需要空格
      this.generatorIdentifier(node.id)
    }
    
    // 输出参数列表
    if (node.params) {
      // 如果params是SlimeFunctionParams对象（带lParen/rParen）
      if ((node.params as any).lParen) {
        this.generatorFunctionParams(node.params as SlimeFunctionParams)
      } else {
        // 如果params是数组（Generator函数的情况）
        this.addLParen()
        if (Array.isArray(node.params) && node.params.length > 0) {
          (node.params as SlimePattern[]).forEach((param, index) => {
            if (index !== 0) {
              this.addComma()
            }
            this.generatorNode(param)
          })
        }
        this.addRParen()
      }
    } else {
      this.addLParen()
      this.addRParen()
    }
    
    // 输出函数体
    if (node.body) {
      this.generatorBlockStatement(node.body as SlimeBlockStatement)
    }
  }

  private static generatorClassDeclaration(node: SlimeClassDeclaration) {
    this.addCode(es6TokensObj.ClassTok) // 输出 class 关键字并记录映射
    if (node.id) {
      this.addSpacing() // 类名与关键字之间添加空格
      this.generatorNode(node.id) // 递归生成类名标识符
    }
    if (node.superClass) {
      this.addSpacing() // class Name 与 extends 之间的空格
      this.addCode(es6TokensObj.ExtendsTok) // 输出 extends 关键字
      this.addSpacing() // extends 与父类表达式之间的空格
      this.generatorNode(node.superClass) // 递归生成父类表达式
    }
    this.generatorClassBody(node.body) // 生成类主体花括号及成员
  }

  private static generatorClassExpression(node: SlimeClassExpression) {
    this.addCode(es6TokensObj.ClassTok) // 输出 class 关键字并记录映射
    if (node.id) {
      this.addSpacing() // 类名与关键字之间添加空格
      this.generatorNode(node.id) // 递归生成类名标识符
    }
    if (node.superClass) {
      this.addSpacing() // class Name 与 extends 之间的空格
      this.addCode(es6TokensObj.ExtendsTok) // 输出 extends 关键字
      this.addSpacing() // extends 与父类表达式之间的空格
      this.generatorNode(node.superClass) // 递归生成父类表达式
    }
    this.generatorClassBody(node.body) // 生成类主体花括号及成员
  }

  private static generatorClassBody(body: SlimeClassBody) {
    this.addLBrace(body.loc) // 输出左花括号，并绑定定位
    if (body?.body?.length) {
      body.body.forEach((element) => {
        this.generatorNode(element) // 遍历生成每个类成员
      })
    }
    this.addRBrace(body.loc) // 输出右花括号
  }

  private static generatorMethodDefinition(node: any) {
    // 处理 static 关键字
    if (node.static) {
      this.addCode(es6TokensObj.StaticTok)
      this.addSpacing()
    }
    
    // 处理 async 关键字
    if (node.value && node.value.async) {
      this.addCode(es6TokensObj.AsyncTok)
      this.addSpacing()
    }
    
    // 处理 getter/setter关键字
    if (node.kind === 'get') {
      this.addCode(es6TokensObj.GetTok)
      this.addSpacing()
    } else if (node.kind === 'set') {
      this.addCode(es6TokensObj.SetTok)
      this.addSpacing()
    }
    
    // 处理 generator 方法（*号）
    if (node.value && node.value.generator) {
      this.addCode(es6TokensObj.Asterisk)
    }
    
    // 处理 key（方法名）
    if (node.key) {
      if (node.computed) {
        this.addLBracket()
        this.generatorNode(node.key)
        this.addRBracket()
      } else {
        this.generatorNode(node.key)
      }
    }
    
    // 处理 value（函数参数和函数体，但不输出 function 关键字和函数名）
    if (node.value) {
      // 只输出参数和函数体，不输出 function 关键字
      if (node.value.params) {
        // 检查params是否是FunctionParams对象或有效数组
        if (node.value.params.type === SlimeAstType.FunctionParams) {
          this.generatorNode(node.value.params)
        } else if (Array.isArray(node.value.params) && node.value.params.length > 0) {
          // 有参数的数组
          this.addLParen()
          node.value.params.forEach((param: any, index: number) => {
            if (index > 0) this.addComma()
            this.generatorNode(param)
          })
          this.addRParen()
        } else {
          // 空参数或无效params，输出()
          this.addLParen()
          this.addRParen()
        }
      } else {
        // 没有params，输出()
        this.addLParen()
        this.addRParen()
      }
      if (node.value.body) {
        this.generatorNode(node.value.body)
      }
    }
  }

  private static generatorPropertyDefinition(node: any) {
    // 处理 static 关键字
    if (node.static) {
      this.addCode(es6TokensObj.StaticTok)
      this.addSpacing()
    }
    
    // 处理 key（属性名）
    if (node.key) {
      this.generatorNode(node.key)
    }
    
    // 处理 value（属性值）
    if (node.value) {
      this.addSpacing()
      this.addCode(es6TokensObj.Eq)
      this.addSpacing()
      this.generatorNode(node.value)
    }
  }

  private static generatorNewExpression(node: any) {
    this.addCode(es6TokensObj.NewTok)
    this.addSpacing()
    
    // 处理 callee（类名）
    if (node.callee) {
      this.generatorNode(node.callee)
    }
    
    // 处理 arguments
    this.addLParen()
    if (node.arguments && node.arguments.length > 0) {
      node.arguments.forEach((arg: any, index: number) => {
        if (index > 0) {
          this.addComma()
          this.addSpacing()
        }
        this.generatorNode(arg)
      })
    }
    this.addRParen()
  }

  private static generatorNode(node: SlimeBaseNode) {
    // 防御性检查：如果node为null或undefined，直接返回
    if (!node) {
      return
    }
    
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
    } else if (node.type === SlimeAstType.ArrowFunctionExpression) {
      this.generatorArrowFunctionExpression(node as any)
    } else if (node.type === SlimeAstType.BinaryExpression) {
      this.generatorBinaryExpression(node as any)
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

    } else if (node.type === SlimeAstType.SpreadElement) {
      this.generatorSpreadElement(node as SlimeSpreadElement)

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
    } else if (node.type === SlimeAstType.ClassExpression) {
      this.generatorClassExpression(node as SlimeClassExpression) // 新增对 ClassExpression 的处理
    } else if (node.type === SlimeAstType.MethodDefinition) {
      this.generatorMethodDefinition(node as any) // 新增对 MethodDefinition 的处理
    } else if (node.type === 'PropertyDefinition') {
      this.generatorPropertyDefinition(node as any) // 新增对 PropertyDefinition 的处理
    } else if (node.type === 'NewExpression') {
      this.generatorNewExpression(node as any) // 新增对 NewExpression 的处理
    } else if (node.type === SlimeAstType.VariableDeclaration) {
      this.generatorVariableDeclaration(node as SlimeVariableDeclaration)
    } else if (node.type === SlimeAstType.ExpressionStatement) {
      this.generatorExpressionStatement(node as SlimeExpressionStatement)
    } else if (node.type === SlimeAstType.ReturnStatement) {
      this.generatorReturnStatement(node as SlimeReturnStatement)
    } else if (node.type === SlimeAstType.BlockStatement) {
      this.generatorBlockStatement(node as SlimeBlockStatement)
    } else if (node.type === SlimeAstType.IfStatement) {
      this.generatorIfStatement(node as any)
    } else if (node.type === SlimeAstType.ForStatement) {
      this.generatorForStatement(node as any)
    } else if (node.type === SlimeAstType.ForInStatement || node.type === SlimeAstType.ForOfStatement) {
      this.generatorForInOfStatement(node as any)
    } else if (node.type === SlimeAstType.WhileStatement) {
      this.generatorWhileStatement(node as any)
    } else if (node.type === SlimeAstType.DoWhileStatement) {
      this.generatorDoWhileStatement(node as any)
    } else if (node.type === SlimeAstType.SwitchStatement) {
      this.generatorSwitchStatement(node as any)
    } else if (node.type === SlimeAstType.SwitchCase) {
      this.generatorSwitchCase(node as any)
    } else if (node.type === SlimeAstType.TryStatement) {
      this.generatorTryStatement(node as any)
    } else if (node.type === 'CatchClause') {
      this.generatorCatchClause(node as any)
    } else if (node.type === SlimeAstType.ThrowStatement) {
      this.generatorThrowStatement(node as any)
    } else if (node.type === SlimeAstType.BreakStatement) {
      this.generatorBreakStatement(node as any)
    } else if (node.type === SlimeAstType.ContinueStatement) {
      this.generatorContinueStatement(node as any)
    } else if (node.type === SlimeAstType.LabeledStatement) {
      this.generatorLabeledStatement(node as any)
    } else if (node.type === SlimeAstType.WithStatement) {
      this.generatorWithStatement(node as any)
    } else if (node.type === SlimeAstType.DebuggerStatement) {
      this.generatorDebuggerStatement(node as any)
    } else if (node.type === SlimeAstType.EmptyStatement) {
      this.generatorEmptyStatement(node as any)
    } else if (node.type === SlimeAstType.ImportSpecifier) {
      this.generatorImportSpecifier(node as SlimeImportSpecifier)
    } else if (node.type === SlimeAstType.ImportDefaultSpecifier) {
      this.generatorImportDefaultSpecifier(node as SlimeImportDefaultSpecifier)
    } else if (node.type === SlimeAstType.ImportNamespaceSpecifier) {
      this.generatorImportNamespaceSpecifier(node as SlimeImportNamespaceSpecifier)
    } else if (node.type === SlimeAstType.ExportNamedDeclaration) {
      this.generatorExportNamedDeclaration(node as SlimeExportNamedDeclaration)
    } else if (node.type === SlimeAstType.ExportDefaultDeclaration) {
      this.generatorExportDefaultDeclaration(node as any)
    } else if (node.type === 'ExportAllDeclaration') {
      this.generatorExportAllDeclaration(node as any)
    } else if (node.type === SlimeAstType.ImportDeclaration) {
      this.generatorImportDeclaration(node as SlimeImportDeclaration)
    } else if (node.type === SlimeAstType.FunctionParams) {
      this.generatorFunctionParams(node as SlimeFunctionParams)
    } else if (node.type === 'ConditionalExpression') {
      this.generatorConditionalExpression(node as any)
    } else if (node.type === 'AssignmentExpression') {
      this.generatorAssignmentExpression(node as any)
    } else if (node.type === 'BooleanLiteral') {
      this.generateCode += node.value ? 'true' : 'false'
    } else if (node.type === 'NullLiteral') {
      this.generateCode += 'null'
    } else if (node.type === 'UnaryExpression') {
      this.generatorUnaryExpression(node as any)
    } else if (node.type === SlimeAstType.UpdateExpression) {
      this.generatorUpdateExpression(node as any)
    } else if (node.type === SlimeAstType.YieldExpression) {
      this.generatorYieldExpression(node as any)
    } else if (node.type === SlimeAstType.AwaitExpression) {
      this.generatorAwaitExpression(node as any)
    } else if (node.type === SlimeAstType.TemplateLiteral) {
      this.generatorTemplateLiteral(node as any)
    } else if (node.type === "Super") {
      // Super关键字：直接输出"super"
      this.generateCode += 'super'
    } else if (node.type === 'TaggedTemplateExpression') {
      // Tagged Template Literals: tag`template`
      this.generatorNode((node as any).tag)
      this.generatorTemplateLiteral((node as any).quasi)
    } else if (node.type === 'MetaProperty') {
      // new.target or import.meta
      this.generatorNode((node as any).meta)
      this.addCode(es6TokensObj.Dot)
      this.generatorNode((node as any).property)
    } else {
      console.error('未知节点:', JSON.stringify(node, null, 2))
      throw new Error('不支持的类型：' + node.type)
    }
    if (node.loc && node.loc.newLine) {
      this.addNewLine() // 根据定位信息决定是否插入换行
    }
  }


  private static generatorUnaryExpression(node: any) {
    // UnaryExpression: operator + argument
    this.generateCode += node.operator
    if (node.operator === 'typeof' || node.operator === 'void' || node.operator === 'delete') {
      this.generateCode += ' '  // 关键字后需要空格
    }
    this.generatorNode(node.argument)
  }

  private static generatorUpdateExpression(node: any) {
    // UpdateExpression: ++/-- expression
    if (node.prefix) {
      // 前缀：++i 或 --i
      this.generateCode += node.operator
      this.generatorNode(node.argument)
    } else {
      // 后缀：i++ 或 i--
      this.generatorNode(node.argument)
      this.generateCode += node.operator
    }
  }

  private static generatorConditionalExpression(node: any) {
    this.generatorNode(node.test)
    this.generateCode += '?'
    this.generatorNode(node.consequent)
    this.generateCode += ':'
    this.generatorNode(node.alternate)
  }

  private static generatorAssignmentExpression(node: any) {
    this.generatorNode(node.left)
    this.addSpacing()
    this.generateCode += node.operator || '='
    this.addSpacing()
    this.generatorNode(node.right)
  }

  private static generatorObjectPattern(node: SlimeObjectPattern) {
    // 输出对象解构：{name, age} 或 {name: userName} 或 {name = "default"} 或 {a, ...rest}
    this.addLBrace()
    node.properties.forEach((prop: any, index) => {
      // ES2018: 检查是否是RestElement
      if (prop.type === SlimeAstType.RestElement) {
        this.generatorRestElement(prop as SlimeRestElement)
      } else if (prop.shorthand) {
        // 简写形式：{name} 或 {name = "default"}
        // 如果value是AssignmentPattern，输出完整的 name = "default"
        // 否则只输出 name
        if (prop.value && prop.value.type === SlimeAstType.AssignmentPattern) {
          this.generatorNode(prop.value)
        } else {
          this.generatorNode(prop.key)
        }
      } else {
        // 完整形式：{name: userName}
        this.generatorNode(prop.key)
        this.addCode(es6TokensObj.Colon)
        this.addSpacing()
        this.generatorNode(prop.value)
      }
      // 添加逗号（除了最后一个）
      if (index < node.properties.length - 1) {
        this.addComma()
      }
    })
    this.addRBrace()
  }

  private static generatorArrayPattern(node: SlimeArrayPattern) {
    // 输出数组解构：[a, b, c] 或 [a, , c]（跳过元素）
    this.addLBracket()
    node.elements.forEach((element, index) => {
      if (element) {
        this.generatorNode(element)
      }
      // null元素表示跳过（Elision），如 [a, , c]
      // 只输出逗号，不输出内容
      
      // 添加逗号（除了最后一个元素）
      if (index < node.elements.length - 1) {
        this.addComma()
      }
    })
    this.addRBracket()
  }

  private static generatorRestElement(node: SlimeRestElement) {
    this.addCode(es6TokensObj.Ellipsis)
    this.generatorNode(node.argument)
  }

  private static generatorSpreadElement(node: SlimeSpreadElement) {
    this.addCode(es6TokensObj.Ellipsis)
    this.generatorNode(node.argument)
  }

  private static generatorAssignmentPattern(node: SlimeAssignmentPattern) {
    // 默认值模式：name = 'Guest'
    this.generatorNode(node.left)
    this.addSpacing()
    this.addCode(es6TokensObj.Eq)
    this.addSpacing()
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
    // object.property 或 object[property]
    this.generatorNode(node.object as SlimeExpression)
    
    if (node.computed) {
      // object[property]
      this.addLBracket()
      this.generatorNode(node.property)
      this.addRBracket()
    } else {
      // object.property
      if (node.dot) {
        this.addDot(node.dot.loc)
      } else {
        // 没有dot字段时，直接添加点号（如super.method()）
        this.addCode(es6TokensObj.Dot)
      }
      if (node.property) {
        this.generatorNode(node.property)
      }
    }
  }

  private static generatorVariableDeclaration(node: SlimeVariableDeclaration) {
    // console.log(989898)
    // console.log(node.kind.loc)
    this.addCodeAndMappings(es6TokenMapObj[node.kind.value.valueOf()], node.kind.loc)
    this.addCodeSpacing()
    for (let i = 0; i < node.declarations.length; i++) {
      this.generatorNode(node.declarations[i])
      // 添加逗号分隔符（除了最后一个）
      if (i < node.declarations.length - 1) {
        this.addCode(es6TokensObj.Comma)
        this.addCodeSpacing()
      }
    }
    // 添加分号
    this.addCode(es6TokensObj.Semicolon)
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
    // 移除自动换行逻辑，让 Prettier 来处理格式化
    // 注释掉的代码会导致在不合适的位置插入换行（如 return 和返回值之间）
    // if (this.mappings.length) {
    //   const lastMapping = this.mappings[this.mappings.length - 1]
    //   if (sourcePosition.line > lastMapping.source.line) {
    //     this.addNewLine()
    //   }
    // }

    let generate: SlimeCodeLocation = {
      type: generateToken.name,
      index: this.generateIndex,
      value: generateToken.value,
      length: generateToken.value.length,
      line: this.generateLine,
      column: this.generateColumn,
    }
    if (!sourcePosition) {
      // console.log(989898)
      // console.log(sourcePosition)
      // console.log(generate)
    }
    this.mappings.push({
      source: sourcePosition,
      generate: generate
    })
  }

  /*private static generatorModuleDeclaration(node: SlimeModuleDeclaration[]) {
      node.
  }*/

  /**
   * 生成 if 语句
   * if (test) consequent [else alternate]
   */
  private static generatorIfStatement(node: any) {
    this.addCode(es6TokensObj.IfTok)
    this.addCode(es6TokensObj.LParen)
    this.generatorNode(node.test)
    this.addCode(es6TokensObj.RParen)
    this.generatorNode(node.consequent)
    if (node.alternate) {
      this.addCode(es6TokensObj.ElseTok)
      this.generatorNode(node.alternate)
    }
  }

  /**
   * 生成 for 语句
   */
  private static generatorForStatement(node: any) {
    this.addCode(es6TokensObj.ForTok)
    this.addCode(es6TokensObj.LParen)
    if (node.init) this.generatorNode(node.init)
    this.addCode(es6TokensObj.Semicolon)
    if (node.test) this.generatorNode(node.test)
    this.addCode(es6TokensObj.Semicolon)
    if (node.update) this.generatorNode(node.update)
    this.addCode(es6TokensObj.RParen)
    if (node.body) this.generatorNode(node.body)
  }

  /**
   * 生成 for...in / for...of 语句
   */
  private static generatorForInOfStatement(node: any) {
    this.addCode(es6TokensObj.ForTok)
    this.addCodeSpacing()
    this.addCode(es6TokensObj.LParen)
    
    // 生成 left (变量声明)，但不添加分号
    if (node.left.type === SlimeAstType.VariableDeclaration) {
      this.addCode(es6TokenMapObj[node.left.kind.value.valueOf()])
      this.addCodeSpacing()
      // 只生成第一个声明的 id
      if (node.left.declarations && node.left.declarations.length > 0) {
        this.generatorNode(node.left.declarations[0].id)
      }
    } else {
      this.generatorNode(node.left)
    }
    
    // 生成 in 或 of
    this.addCodeSpacing()
    if (node.type === SlimeAstType.ForInStatement) {
      this.addCode(es6TokensObj.InTok)
    } else {
      this.addCode(es6TokensObj.OfTok)
    }
    this.addCodeSpacing()
    
    // 生成 right (被迭代的对象)
    this.generatorNode(node.right)
    
    this.addCode(es6TokensObj.RParen)
    this.generatorNode(node.body)
  }

  /**
   * 生成 while 语句
   */
  private static generatorWhileStatement(node: any) {
    this.addCode(es6TokensObj.WhileTok)
    this.addCode(es6TokensObj.LParen)
    if (node.test) this.generatorNode(node.test)
    this.addCode(es6TokensObj.RParen)
    if (node.body) this.generatorNode(node.body)
  }

  /**
   * 生成 do...while 语句
   */
  private static generatorDoWhileStatement(node: any) {
    this.addCode(es6TokensObj.DoTok)
    this.generatorNode(node.body)
    this.addCode(es6TokensObj.WhileTok)
    this.addCode(es6TokensObj.LParen)
    this.generatorNode(node.test)
    this.addCode(es6TokensObj.RParen)
  }

  /**
   * 生成 switch 语句
   */
  private static generatorSwitchStatement(node: any) {
    this.addCode(es6TokensObj.SwitchTok)
    this.addCode(es6TokensObj.LParen)
    this.generatorNode(node.discriminant)
    this.addCode(es6TokensObj.RParen)
    this.addCode(es6TokensObj.LBrace)
    if (node.cases) {
      this.generatorNodes(node.cases)
    }
    this.addCode(es6TokensObj.RBrace)
  }

  /**
   * 生成 switch case 分支
   */
  private static generatorSwitchCase(node: any) {
    if (node.test) {
      // case 分支
      this.addCode(es6TokensObj.CaseTok)
      this.addSpacing()
      this.generatorNode(node.test)
      this.addCode(es6TokensObj.Colon)
    } else {
      // default 分支
      this.addCode(es6TokensObj.DefaultTok)
      this.addCode(es6TokensObj.Colon)
    }
    
    // 生成 consequent 语句
    if (node.consequent && node.consequent.length > 0) {
      this.generatorNodes(node.consequent)
    }
  }

  /**
   * 生成 try 语句
   */
  private static generatorTryStatement(node: any) {
    this.addCode(es6TokensObj.TryTok)
    this.addSpacing()
    this.generatorNode(node.block)
    if (node.handler) {
      this.generatorNode(node.handler)
    }
    if (node.finalizer) {
      this.addCode(es6TokensObj.FinallyTok)
      this.addSpacing()
      this.generatorNode(node.finalizer)
    }
  }
  
  /**
   * 生成 catch 子句
   */
  private static generatorCatchClause(node: any) {
    this.addCode(es6TokensObj.CatchTok)
    this.addSpacing()
    this.addLParen()
    if (node.param) {
      this.generatorNode(node.param)
    }
    this.addRParen()
    if (node.body) {
      this.generatorNode(node.body)
    }
  }

  /**
   * 生成 throw 语句
   */
  private static generatorThrowStatement(node: any) {
    this.addCode(es6TokensObj.ThrowTok)
    if (node.argument) {
      this.generatorNode(node.argument)
    }
  }

  /**
   * 生成 break 语句
   */
  private static generatorBreakStatement(node: any) {
    this.addCode(es6TokensObj.BreakTok)
    if (node.label) {
      this.generatorNode(node.label)
    }
  }

  /**
   * 生成 continue 语句
   */
  private static generatorContinueStatement(node: any) {
    this.addCode(es6TokensObj.ContinueTok)
    if (node.label) {
      this.generatorNode(node.label)
    }
  }

  /**
   * 生成标签语句
   */
  private static generatorLabeledStatement(node: any) {
    this.generatorNode(node.label)
    this.addCode(es6TokensObj.Colon)
    this.generatorNode(node.body)
  }

  /**
   * 生成 with 语句
   */
  private static generatorWithStatement(node: any) {
    this.addCode(es6TokensObj.WithTok)
    this.addCode(es6TokensObj.LParen)
    this.generatorNode(node.object)
    this.addCode(es6TokensObj.RParen)
    this.generatorNode(node.body)
  }

  /**
   * 生成 debugger 语句
   */
  private static generatorDebuggerStatement(node: any) {
    this.addCode(es6TokensObj.DebuggerTok)
  }

  /**
   * 生成空语句
   */
  private static generatorEmptyStatement(node: any) {
    this.addCode(es6TokensObj.Semicolon)
  }

  /**
   * 生成 export default 声明
   * export default expression
   */
  private static generatorExportDefaultDeclaration(node: any) {
    this.addCode(es6TokensObj.ExportTok)
    this.addCodeSpacing()  // 添加空格
    this.addCode(es6TokensObj.DefaultTok)
    this.addCodeSpacing()  // 添加空格
    this.generatorNode(node.declaration)
  }
}
