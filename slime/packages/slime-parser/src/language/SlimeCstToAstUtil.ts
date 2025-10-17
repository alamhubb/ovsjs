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
  type SlimeVariableDeclarationKind, type SlimeClassExpression
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
    
    // 容错：如果children为空或undefined，返回空程序
    if (!first) {
      return SlimeAstUtil.createProgram([], SlimeProgramSourceType.module)
    }
    
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
      // import * as name from 'module'
      return [this.createNameSpaceImportSpecifierAst(first)]
    } else if (first.name === Es6Parser.prototype.NamedImports.name) {
      // import {name, greet} from 'module'
      return this.createNamedImportsListAst(first)
    }
    return []
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

  createNameSpaceImportSpecifierAst(cst: SubhutiCst): SlimeImportNamespaceSpecifier {
    // NameSpaceImport: Asterisk as ImportedBinding
    // children: [Asterisk, AsTok, ImportedBinding]
    const binding = cst.children.find(ch => ch.name === Es6Parser.prototype.ImportedBinding.name)
    if (!binding) throw new Error('NameSpaceImport missing ImportedBinding')
    const local = this.createImportedBindingAst(binding)
    return {
      type: SlimeAstType.ImportNamespaceSpecifier,
      local: local,
      loc: cst.loc
    } as any
  }

  createNamedImportsListAst(cst: SubhutiCst): Array<SlimeImportSpecifier> {
    // NamedImports: {LBrace, ImportsList?, RBrace}
    const importsList = cst.children.find(ch => ch.name === Es6Parser.prototype.ImportsList.name)
    if (!importsList) return []
    
    const specifiers: Array<SlimeImportSpecifier> = []
    for (const child of importsList.children) {
      if (child.name === Es6Parser.prototype.ImportSpecifier.name) {
        // ImportSpecifier: IdentifierName [as ImportedBinding]
        const identifierName = child.children.find((ch: any) => 
          ch.name === Es6Parser.prototype.IdentifierName.name)
        const binding = child.children.find((ch: any) => 
          ch.name === Es6Parser.prototype.ImportedBinding.name)
        
        if (identifierName && binding) {
          // import {name as localName}
          const imported = this.createIdentifierNameAst(identifierName)
          const local = this.createImportedBindingAst(binding)
          specifiers.push({
            type: SlimeAstType.ImportSpecifier,
            imported: imported,
            local: local,
            loc: child.loc
          } as any)
        } else if (binding) {
          // import {name} (简写)
          const id = this.createImportedBindingAst(binding)
          specifiers.push({
            type: SlimeAstType.ImportSpecifier,
            imported: id,
            local: id,
            loc: child.loc
          } as any)
        }
      }
    }
    return specifiers
  }
  
  createIdentifierNameAst(cst: SubhutiCst): SlimeIdentifier {
    // IdentifierName -> Identifier or Keyword token
    const token = cst.children[0]
    return SlimeAstUtil.createIdentifier(token.value, token.loc)
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
    const statements = cst.children.map(item => {
      // 如果是 Declaration，直接处理
      if (item.name === Es6Parser.prototype.Declaration.name) {
        return [this.createDeclarationAst(item) as any]
      }
      
      // 如果是 Statement，需要特殊处理 FunctionExpression 和 ClassExpression
      const statement = this.createStatementAst(item)
      const result = statement.flat()
      
      // 检查是否是命名的 FunctionExpression 或 ClassExpression（应该转为 Declaration）
      return result.map(stmt => {
        if (stmt.type === SlimeAstType.ExpressionStatement) {
          const expr = (stmt as SlimeExpressionStatement).expression
          
          // 命名的 FunctionExpression → FunctionDeclaration
          if (expr.type === SlimeAstType.FunctionExpression) {
            const funcExpr = expr as SlimeFunctionExpression
            if (funcExpr.id) {
              return {
                type: SlimeAstType.FunctionDeclaration,
                id: funcExpr.id,
                params: funcExpr.params,
                body: funcExpr.body,
                generator: funcExpr.generator,
                async: funcExpr.async,
                loc: funcExpr.loc
              } as SlimeFunctionDeclaration
            }
          }
          
          // ClassExpression → ClassDeclaration
          if (expr.type === SlimeAstType.ClassExpression) {
            const classExpr = expr as any
            if (classExpr.id) {
              return {
                type: SlimeAstType.ClassDeclaration,
                id: classExpr.id,
                superClass: classExpr.superClass,
                body: classExpr.body,
                loc: classExpr.loc
              } as any
            }
          }
        }
        return stmt
      })
    }).flat()
    return statements
  }

  createStatementAst(cst: SubhutiCst): Array<SlimeStatement> {
    const astName = checkCstName(cst, Es6Parser.prototype.Statement.name);
    const statements: SlimeStatement[] = cst.children
      .map(item => this.createStatementDeclarationAst(item))
      .filter(stmt => stmt !== undefined)  // 过滤掉 undefined
    return statements
  }

  /**
   * 根据 CST 节点类型创建对应的 Statement AST
   * 处理所有 ES6 语句类型
   */
  createStatementDeclarationAst(cst: SubhutiCst) {
    // BreakableStatement - 包装节点，递归处理子节点
    if (cst.name === Es6Parser.prototype.BreakableStatement.name) {
      if (cst.children && cst.children.length > 0) {
        return this.createStatementDeclarationAst(cst.children[0])
      }
      return undefined
    }
    // IterationStatement - 循环语句包装节点
    else if (cst.name === Es6Parser.prototype.IterationStatement.name) {
      if (cst.children && cst.children.length > 0) {
        return this.createStatementDeclarationAst(cst.children[0])
      }
      return undefined
    }
    // 变量声明
    else if (cst.name === Es6Parser.prototype.VariableDeclaration.name) {
      return this.createVariableDeclarationAst(cst)
    } 
    // 表达式语句
    else if (cst.name === Es6Parser.prototype.ExpressionStatement.name) {
      return this.createExpressionStatementAst(cst)
    } 
    // return 语句
    else if (cst.name === Es6Parser.prototype.ReturnStatement.name) {
      return this.createReturnStatementAst(cst)
    } 
    // if 语句
    else if (cst.name === Es6Parser.prototype.IfStatement.name) {
      return this.createIfStatementAst(cst)
    }
    // for 语句
    else if (cst.name === Es6Parser.prototype.ForStatement.name) {
      return this.createForStatementAst(cst)
    }
    // for...in / for...of 语句
    else if (cst.name === Es6Parser.prototype.ForInOfStatement.name) {
      return this.createForInOfStatementAst(cst)
    }
    // while 语句
    else if (cst.name === Es6Parser.prototype.WhileStatement.name) {
      return this.createWhileStatementAst(cst)
    }
    // do...while 语句
    else if (cst.name === Es6Parser.prototype.DoWhileStatement.name) {
      return this.createDoWhileStatementAst(cst)
    }
    // 块语句
    else if (cst.name === Es6Parser.prototype.BlockStatement.name) {
      return this.createBlockStatementAst(cst)
    }
    // switch 语句
    else if (cst.name === Es6Parser.prototype.SwitchStatement.name) {
      return this.createSwitchStatementAst(cst)
    }
    // try 语句
    else if (cst.name === Es6Parser.prototype.TryStatement.name) {
      return this.createTryStatementAst(cst)
    }
    // throw 语句
    else if (cst.name === Es6Parser.prototype.ThrowStatement.name) {
      return this.createThrowStatementAst(cst)
    }
    // break 语句
    else if (cst.name === Es6Parser.prototype.BreakStatement.name) {
      return this.createBreakStatementAst(cst)
    }
    // continue 语句
    else if (cst.name === Es6Parser.prototype.ContinueStatement.name) {
      return this.createContinueStatementAst(cst)
    }
    // 标签语句
    else if (cst.name === Es6Parser.prototype.LabelledStatement.name) {
      return this.createLabelledStatementAst(cst)
    }
    // with 语句
    else if (cst.name === Es6Parser.prototype.WithStatement.name) {
      return this.createWithStatementAst(cst)
    }
    // debugger 语句
    else if (cst.name === Es6Parser.prototype.DebuggerStatement.name) {
      return this.createDebuggerStatementAst(cst)
    }
    // 空语句
    else if (cst.name === Es6Parser.prototype.EmptyStatement.name) {
      return this.createEmptyStatementAst(cst)
    }
    // 函数声明
    else if (cst.name === Es6Parser.prototype.FunctionDeclaration.name) {
      return this.createFunctionDeclarationAst(cst)
    }
    // 类声明
    else if (cst.name === Es6Parser.prototype.ClassDeclaration.name) {
      return this.createClassDeclarationAst(cst)
    }
  }

  createExportDeclarationAst(cst: SubhutiCst): SlimeExportDefaultDeclaration | SlimeExportNamedDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.ExportDeclaration.name);
    const first = cst.children[0]
    const first1 = cst.children[1]
    let token = SlimeAstUtil.createExportToken(first.loc)
    if (first1.name === Es6Parser.prototype.AsteriskFromClauseEmptySemicolon.name) {
      // export * from './module.js'
      const source = first1.children.find((ch: any) => ch.name === Es6Parser.prototype.FromClause.name)
      if (source) {
        const fromClause = this.createFromClauseAst(source)
        return {
          type: 'ExportAllDeclaration',
          source: fromClause.source,
          loc: cst.loc
        } as any
      }
    } else if (first1.name === Es6Parser.prototype.ExportClauseFromClauseEmptySemicolon.name) {
      // export {name, age} from './module.js'
      const source = first1.children.find((ch: any) => ch.name === Es6Parser.prototype.FromClause.name)
      if (source) {
        const fromClause = this.createFromClauseAst(source)
        return SlimeAstUtil.createExportNamedDeclaration(token, null, [], fromClause.source, cst.loc)
      }
    } else if (first1.name === Es6Parser.prototype.ExportClauseEmptySemicolon.name) {
      // export {}
      return SlimeAstUtil.createExportNamedDeclaration(token, null, [], null, cst.loc)
    } else if (first1.name === Es6Parser.prototype.Declaration.name) {
      const declaration = this.createDeclarationAst(cst.children[1])
      // console.log('asdfsadfsad')
      // console.log(cst.children[1])
      // console.log(declaration)

      return SlimeAstUtil.createExportNamedDeclaration(token, declaration, [], null, cst.loc)

    } else if (first1.name === Es6Parser.prototype.DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression.name) {
      // export default 后面的内容
      // DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression 的子节点：
      // [0] = DefaultTok
      // [1] = HoistableDeclaration | ClassDeclaration | AssignmentExpression
      const defaultExportCst = first1.children?.[1]
      if (!defaultExportCst) {
        throw new Error('export default 后面缺少内容')
      }
      const del = this.createDefaultExportDeclarationAst(defaultExportCst)
      return SlimeAstUtil.createExportDefaultDeclaration(del, cst.loc)
    }
  }

  createDeclarationAst(cst: SubhutiCst): SlimeDeclaration {
    let astName = checkCstName(cst, Es6Parser.prototype.Declaration.name);
    const first = cst.children[0]
    switch (first.name) {
      case Es6Parser.prototype.VariableDeclaration.name:
        return this.createVariableDeclarationAst(first);
      case Es6Parser.prototype.ClassDeclaration.name:
        return this.createClassDeclarationAst(first);
      case Es6Parser.prototype.FunctionDeclaration.name:
        return this.createFunctionDeclarationAst(first);
      case Es6Parser.prototype.HoistableDeclaration.name:
        // HoistableDeclaration -> FunctionDeclaration | GeneratorDeclaration
        return this.createHoistableDeclarationAst(first);
      default:
        throw new Error(`Unsupported Declaration type: ${first.name}`)
    }
  }

  createHoistableDeclarationAst(cst: SubhutiCst): SlimeDeclaration {
    const astName = checkCstName(cst, Es6Parser.prototype.HoistableDeclaration.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.FunctionDeclaration.name) {
      return this.createFunctionDeclarationAst(first)
    } else if (first.name === Es6Parser.prototype.GeneratorDeclaration.name) {
      // GeneratorDeclaration -> 类似FunctionDeclaration但有*号
      return this.createGeneratorDeclarationAst(first)
    } else {
      throw new Error(`Unsupported HoistableDeclaration type: ${first.name}`)
    }
  }

  createGeneratorDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration {
    // GeneratorDeclaration: function* name(params) { body }
    // CST children: [FunctionTok, Asterisk, BindingIdentifier, LParen, FormalParameterList?, RParen, FunctionBodyDefine]
    
    // 查找BindingIdentifier（children[2]）
    const id = this.createBindingIdentifierAst(cst.children[2])
    
    // 查找FormalParameterList（可选）
    let params: SlimePattern[] = []
    const formalParams = cst.children.find(ch => ch.name === Es6Parser.prototype.FormalParameterList.name)
    if (formalParams) {
      params = this.createFormalParameterListAst(formalParams)
    }
    
    // 查找FunctionBodyDefine
    const bodyNode = cst.children.find(ch => ch.name === Es6Parser.prototype.FunctionBodyDefine.name)
    if (!bodyNode) throwNewError('FunctionBodyDefine')
    const body = this.createFunctionBodyDefineAst(bodyNode)
    
    return {
      type: SlimeAstType.FunctionDeclaration,
      id: id,
      params: params,
      body: body,
      generator: true,
      async: false,
      loc: cst.loc
    } as SlimeFunctionDeclaration
  }

  /**
   * 创建 export default 的声明部分
   * 支持：class、function、expression
   */
  createDefaultExportDeclarationAst(cst: SubhutiCst): SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression {
    if (!cst) {
      throw new Error('createDefaultExportDeclarationAst: cst is undefined')
    }
    
    // 如果是 AssignmentExpressionEmptySemicolon，提取 AssignmentExpression
    if (cst.name === 'AssignmentExpressionEmptySemicolon') {
      // 第一个子节点是 AssignmentExpression
      const assignmentExpr = cst.children?.[0]
      if (assignmentExpr) {
        return this.createAssignmentExpressionAst(assignmentExpr)
      }
    }
    
    switch (cst.name) {
      case Es6Parser.prototype.ClassDeclaration.name:
        return this.createClassDeclarationAst(cst);
      case Es6Parser.prototype.FunctionDeclaration.name:
        return this.createFunctionExpressionAst(cst) as any;
      case Es6Parser.prototype.HoistableDeclaration.name:
        // export default function() {} or export default function*() {}
        return this.createHoistableDeclarationAst(cst);
      case Es6Parser.prototype.AssignmentExpression.name:
        return this.createAssignmentExpressionAst(cst);
      default:
        // 尝试作为表达式处理
        return this.createExpressionAst(cst);
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
    // 过滤出VariableDeclarator节点（跳过Comma token）
    let declarations = cst.children
      .filter(item => item.name === Es6Parser.prototype.VariableDeclarator.name)
      .map(item => this.createVariableDeclaratorAst(item)) as any[]
    return declarations
  }

  createClassDeclarationAst(cst: SubhutiCst): SlimeClassDeclaration {
    // 检查 CST 节点名称是否为 ClassDeclaration
    const astName = checkCstName(cst, Es6Parser.prototype.ClassDeclaration.name);

    // 获取类名标识符（children[1] 是 BindingIdentifier）
    const id = this.createBindingIdentifierAst(cst.children[1])
    // 解析 ClassTail，获取类体和父类信息（children[2] 是 ClassTail）
    const classTailResult = this.createClassTailAst(cst.children[2])

    // 创建类声明 AST 节点
    const ast = SlimeAstUtil.createClassDeclaration(id, classTailResult.body, cst.loc)

    // 如果存在父类（extends），则添加 superClass 属性
    if (classTailResult.superClass) {
      ast.superClass = classTailResult.superClass
    }

    return ast
  }

  createClassTailAst(cst: SubhutiCst): { superClass: SlimeExpression | null; body: SlimeClassBody } {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassTail.name);
    let bodyIndex = 1 // 默认 ClassBody 在索引 1
    let superClass: SlimeExpression | null = null // 超类默认为 null
    if (cst.children[0] && cst.children[0].name === Es6Parser.prototype.ClassHeritage.name) {
      superClass = this.createClassHeritageAst(cst.children[0]) // 如果存在 ClassHeritage 则解析 superClass
      bodyIndex = 2 // ClassBody 顺延到索引 2
    }
    const body = this.createClassBodyAst(cst.children[bodyIndex]) // 解析类主体
    return {superClass, body} // 返回组合结果，方便上层使用
  }

  createClassHeritageAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassHeritage.name);
    return this.createLeftHandSideExpressionAst(cst.children[1]) // ClassHeritage -> extends + LeftHandSideExpression
  }

  createClassBodyItemAst(staticCst: SubhutiCst, cst: SubhutiCst): SlimeMethodDefinition | SlimePropertyDefinition {
    if (cst.name === Es6Parser.prototype.MethodDefinition.name) {
      return this.createMethodDefinitionAst(staticCst, cst)
    } else if (cst.name === Es6Parser.prototype.PropertyDefinition.name) {
      return this.createPropertyDefinitionAst(cst)
    } else if (cst.name === Es6Parser.prototype.FieldDefinition.name) {
      return this.createFieldDefinitionAst(staticCst, cst)
    }
    // 如果是其他类型，返回undefined（会被过滤）
    return undefined as any
  }

  createInitializerAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.Initializer.name);
    // Initializer -> Eq + AssignmentExpression
    const assignmentExpressionCst = cst.children[1]
    return this.createAssignmentExpressionAst(assignmentExpressionCst)
  }

  createFieldDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimePropertyDefinition {
    const astName = checkCstName(cst, Es6Parser.prototype.FieldDefinition.name);

    // FieldDefinition -> PropertyName + Initializer?
    const propertyNameCst = cst.children[0]
    const key = this.createPropertyNameAst(propertyNameCst)

    // 检查是否有初始化器
    let value: SlimeExpression | null = null
    if (cst.children.length > 1) {
      const initializerCst = cst.children[1]
      if (initializerCst && initializerCst.name === Es6Parser.prototype.Initializer.name) {
        value = this.createInitializerAst(initializerCst)
      }
    }

    // 检查是否有 static 修饰符
    const isStatic = staticCst && staticCst.name === Es6TokenConsumer.prototype.StaticTok.name

    return SlimeAstUtil.createPropertyDefinition(key, value, isStatic || false)
  }

  createClassBodyAst(cst: SubhutiCst): SlimeClassBody {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassBody.name);
    const elementsWrapper = cst.children && cst.children[0] // ClassBody -> ClassElementList?，第一项为列表容器
    const body: Array<SlimeMethodDefinition | SlimePropertyDefinition> = [] // 收集类成员
    if (elementsWrapper && Array.isArray(elementsWrapper.children)) {
      for (const element of elementsWrapper.children) { // 遍历 ClassElement
        const elementChildren = element.children ?? [] // 兼容无子节点情况
        if (!elementChildren.length) {
          continue // 没有内容的 ClassElement 直接忽略
        }
        const staticCst = elementChildren.length > 1 ? elementChildren[0] : null // 如果有多个子节点，第一个通常是 static 修饰
        const targetCst = elementChildren[elementChildren.length - 1] // 最后一个节点是真正的成员定义
        const item = this.createClassBodyItemAst(staticCst, targetCst) // 根据成员类型生成 AST
        if (item && item.type) { // 过滤掉返回 undefined 或type为undefined的情况
          body.push(item)
        }
      }
    }
    return {
      type: astName as any, // 构造 ClassBody AST
      body: body, // 挂载类成员数组
      loc: cst.loc // 透传位置信息
    }
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

  createBindingElementAst(cst: SubhutiCst): any {
    const astName = checkCstName(cst, Es6Parser.prototype.BindingElement.name);
    const first = cst.children[0]
    
    if (first.name === Es6Parser.prototype.SingleNameBinding.name) {
      return this.createSingleNameBindingAst(first)
    } else if (first.name === Es6Parser.prototype.BindingPattern.name) {
      // 解构参数：function({name, age}) 或 function([a, b])
      return this.createBindingPatternAst(first)
    }
    return this.createSingleNameBindingAst(first)
  }

  createSingleNameBindingAst(cst: SubhutiCst): any {
    const astName = checkCstName(cst, Es6Parser.prototype.SingleNameBinding.name);
    //BindingIdentifier + Initializer?
    const first = cst.children[0]
    const id = this.createBindingIdentifierAst(first)
    
    // 检查是否有默认值（Initializer）
    const initializer = cst.children.find(ch => ch.name === Es6Parser.prototype.Initializer.name)
    if (initializer) {
      // 有默认值，创建AssignmentPattern
      const init = this.createInitializerAst(initializer)
      return {
        type: SlimeAstType.AssignmentPattern,
        left: id,
        right: init,
        loc: cst.loc
      }
    }
    
    return id
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
    
    // 检查是否有async
    let offset = 0;
    let isAsync = false;
    if (cst.children[0] && cst.children[0].name === 'AsyncTok') {
      isAsync = true;
      offset = 1;
    }
    
    const PropertyName = cst.children[0 + offset]
    const FunctionFormalParametersBodyDefineCst: SubhutiCst = cst.children[1 + offset]
    const functionExpression = this.createFunctionFormalParametersBodyDefineAst(FunctionFormalParametersBodyDefineCst, cst.children[0 + offset].loc)
    
    // 设置async标志
    functionExpression.async = isAsync;

    // 处理PropertyName：可能是LiteralPropertyName或ComputedPropertyName
    const PropertyNameFirst = PropertyName.children[0]
    if (PropertyNameFirst.name === Es6Parser.prototype.LiteralPropertyName.name) {
      const LiteralPropertyNameFirst = PropertyNameFirst.children[0]
      const functionName = LiteralPropertyNameFirst.value
      functionExpression.id = SlimeAstUtil.createIdentifier(functionName, LiteralPropertyNameFirst.loc)
    } else if (PropertyNameFirst.name === Es6Parser.prototype.ComputedPropertyName.name) {
      // 计算属性名，不设置id（匿名函数）
      functionExpression.id = null
    }

    return functionExpression
  }

  createFunctionFormalParametersBodyDefineAst(cst: SubhutiCst, startLoc: SubhutiSourceLocation): SlimeFunctionExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionFormalParametersBodyDefine.name);
    const first = cst.children[0]
    const first1 = cst.children[1]
    const params: SlimeFunctionParams = this.createFunctionFormalParametersAst(first)
    // 检查first1是否存在，如果不存在创建空函数体
    const body: SlimeBlockStatement = first1 
      ? this.createFunctionBodyDefineAst(first1)
      : SlimeAstUtil.createBlockStatement(null, null, [])

    return SlimeAstUtil.createFunctionExpression(body, null, params, startLoc)
  }

  createFunctionBodyDefineAst(cst: SubhutiCst): SlimeBlockStatement {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionBodyDefine.name);
    // 检查是否存在FunctionBody（children[1]可能不存在）
    if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.FunctionBody.name) {
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
    // 检查是否存在参数列表（children[1]可能不存在）
    if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.FormalParameterList.name) {
      const FormalParameterListCst = cst.children[1]
      const params = this.createFormalParameterListAst(FormalParameterListCst)
      return SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
    }
    return SlimeAstUtil.createFunctionParams(lp, rp, cst.loc)
  }

  createMethodDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
    // 注意：参数顺序是 (staticCst, cst)，与调用保持一致
    const astName = checkCstName(cst, Es6Parser.prototype.MethodDefinition.name);
    const first = cst.children?.[0]

    if (!first) {
      throw new Error('MethodDefinition has no children')
    }

    if (first.name === Es6Parser.prototype.PropertyNameMethodDefinition.name) {
      // 检查是否有async
      let offset = 0;
      if (first.children[0] && first.children[0].name === 'AsyncTok') {
        offset = 1;
      }
      
      const PropertyName = first.children[0 + offset]
      const SlimeFunctionExpression = this.createPropertyNameMethodDefinitionAst(first)
      
      // 获取key：如果是计算属性，从PropertyName提取
      let key: any = SlimeFunctionExpression.id
      let computed = false
      if (PropertyName.children[0].name === Es6Parser.prototype.ComputedPropertyName.name) {
        // 计算属性名
        key = this.createAssignmentExpressionAst(PropertyName.children[0].children[1])
        computed = true
      }
      
      const methodDef = SlimeAstUtil.createMethodDefinition(key, SlimeFunctionExpression)
      methodDef.computed = computed

      // 如果有 static 修饰符
      if (staticCst && staticCst.name === Es6TokenConsumer.prototype.StaticTok.name) {
        methodDef.static = true
      }

      return methodDef
    } else if (first.name === Es6Parser.prototype.GetMethodDefinition.name) {
      // getter方法
      const propertyNameCst = first.children[1] // GetTok后是PropertyName
      const key = this.createPropertyNameAst(propertyNameCst)
      const functionBodyCst = first.children[4] // PropertyName后是LParen、RParen、FunctionBodyDefine
      const body = this.createFunctionBodyDefineAst(functionBodyCst)
      
      const methodDef = SlimeAstUtil.createMethodDefinition(key, {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: body
      } as any)
      methodDef.kind = 'get'
      
      return methodDef
    } else if (first.name === Es6Parser.prototype.SetMethodDefinition.name) {
      // setter方法
      const propertyNameMethodCst = first.children[1] // SetTok后是PropertyNameMethodDefinition
      const SlimeFunctionExpression = this.createPropertyNameMethodDefinitionAst(propertyNameMethodCst)
      const methodDef = SlimeAstUtil.createMethodDefinition(SlimeFunctionExpression.id, SlimeFunctionExpression)
      methodDef.kind = 'set'
      
      return methodDef
    } else {
      throw new Error('不支持的类型: ' + first.name)
    }
  }

  createBindingPatternAst(cst: SubhutiCst): SlimePattern {
    checkCstName(cst, Es6Parser.prototype.BindingPattern.name)
    
    const child = cst.children[0]
    
    if (child.name === Es6Parser.prototype.ArrayBindingPattern.name) {
      return this.createArrayBindingPatternAst(child)
    } else if (child.name === Es6Parser.prototype.ObjectBindingPattern.name) {
      return this.createObjectBindingPatternAst(child)
    } else {
      throw new Error(`Unknown BindingPattern type: ${child.name}`)
    }
  }
  
  createArrayBindingPatternAst(cst: SubhutiCst): SlimePattern {
    checkCstName(cst, Es6Parser.prototype.ArrayBindingPattern.name)
    
    // CST结构：[LBracket, BindingElementList?, RBracket]
    const elements: (SlimePattern | null)[] = []
    
    // 查找BindingElementList
    const bindingList = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingElementList.name)
    if (bindingList) {
      // BindingElementList包含BindingElisionElement和Comma
      for (const child of bindingList.children) {
        if (child.name === Es6Parser.prototype.BindingElisionElement.name) {
          // BindingElisionElement可能包含：Elision + BindingElement
          // 先检查是否有Elision（跳过的元素）
          const elision = child.children.find((ch: any) => 
            ch.name === Es6Parser.prototype.Elision.name)
          if (elision) {
            // Elision可能包含多个逗号，每个逗号代表一个null
            const commaCount = elision.children?.filter((ch: any) => ch.value === ',').length || 1
            for (let i = 0; i < commaCount; i++) {
              elements.push(null)
            }
          }
          
          // 然后检查是否有BindingElement
          const bindingElement = child.children.find((ch: any) => 
            ch.name === Es6Parser.prototype.BindingElement.name)
          
          if (bindingElement) {
            // BindingElement -> SingleNameBinding -> BindingIdentifier
            const singleName = bindingElement.children[0]
            if (singleName && singleName.name === Es6Parser.prototype.SingleNameBinding.name) {
              const identifier = singleName.children.find((ch: any) => 
                ch.name === Es6Parser.prototype.BindingIdentifier.name)
              if (identifier) {
                elements.push(this.createBindingIdentifierAst(identifier))
              }
            }
          }
        }
      }
    }
    
    // 检查是否有BindingRestElement（...rest）
    const restElement = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingRestElement.name)
    if (restElement) {
      // BindingRestElement -> Ellipsis + BindingIdentifier
      const identifier = restElement.children.find((ch: any) => 
        ch.name === Es6Parser.prototype.BindingIdentifier.name)
      if (identifier) {
        const restId = this.createBindingIdentifierAst(identifier)
        const restNode = {
          type: SlimeAstType.RestElement,
          argument: restId,
          loc: restElement.loc
        }
        elements.push(restNode as any)
      }
    }
    
    return {
      type: SlimeAstType.ArrayPattern,
      elements,
      loc: cst.loc
    } as any
  }
  
  createObjectBindingPatternAst(cst: SubhutiCst): SlimePattern {
    checkCstName(cst, Es6Parser.prototype.ObjectBindingPattern.name)
    
    // CST结构：[LBrace, BindingPropertyList?, RBrace]
    const properties: any[] = []
    
    // 查找BindingPropertyList
    const propList = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingPropertyList.name)
    if (propList) {
      // BindingPropertyList包含BindingProperty和Comma节点
      for (const child of propList.children) {
        if (child.name === Es6Parser.prototype.BindingProperty.name) {
          // BindingProperty -> SingleNameBinding (简写) 或 PropertyName + BindingElement (完整)
          const singleName = child.children.find((ch: any) => 
            ch.name === Es6Parser.prototype.SingleNameBinding.name)
          
          if (singleName) {
            // 简写形式：{name} = {name: name}
            const identifier = singleName.children.find((ch: any) => 
              ch.name === Es6Parser.prototype.BindingIdentifier.name)
            if (identifier) {
              const id = this.createBindingIdentifierAst(identifier)
              properties.push({
                type: SlimeAstType.Property,
                key: id,
                value: id,
                kind: 'init',
                computed: false,
                shorthand: true,
                loc: child.loc
              })
            }
          } else {
            // 完整形式：{name: userName}
            const propName = child.children.find((ch: any) => 
              ch.name === Es6Parser.prototype.PropertyName.name)
            const bindingElement = child.children.find((ch: any) => 
              ch.name === Es6Parser.prototype.BindingElement.name)
            
            if (propName && bindingElement) {
              const keyId = propName.children[0]
              const key = SlimeAstUtil.createIdentifier(keyId.value, keyId.loc)
              
              const singleName = bindingElement.children[0]
              const identifier = singleName.children.find((ch: any) => 
                ch.name === Es6Parser.prototype.BindingIdentifier.name)
              if (identifier) {
                const value = this.createBindingIdentifierAst(identifier)
                properties.push({
                  type: SlimeAstType.Property,
                  key: key,
                  value: value,
                  kind: 'init',
                  computed: false,
                  shorthand: false,
                  loc: child.loc
                })
              }
            }
          }
        }
      }
    }
    
    return {
      type: SlimeAstType.ObjectPattern,
      properties,
      loc: cst.loc
    } as any
  }

  createFunctionExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.FunctionExpression.name);
    // FunctionExpression 结构（带async）：
    // children[0]: AsyncTok (可选)
    // children[1]: FunctionTok
    // children[2]: BindingIdentifier (可选，函数名)
    // children[3 或 2 或 1]: FunctionFormalParametersBodyDefine (参数和函数体)
    
    let offset = 0;
    let isAsync = false;
    
    // 检查是否有async
    if (cst.children[0] && cst.children[0].name === 'AsyncTok') {
      isAsync = true;
      offset = 1;
    }
    
    let functionId: SlimeIdentifier | null = null
    let formalParametersBodyIndex = 1 + offset
    
    // 如果有 BindingIdentifier，说明是命名函数表达式
    if (cst.children.length > 2 + offset && cst.children[1 + offset].name === Es6Parser.prototype.BindingIdentifier.name) {
      functionId = this.createBindingIdentifierAst(cst.children[1 + offset])
      formalParametersBodyIndex = 2 + offset
    }
    
    const FunctionFormalParametersBodyDefineCst = cst.children[formalParametersBodyIndex]
    const FunctionFormalParametersBodyDefineAst = this.createFunctionFormalParametersBodyDefineAst(FunctionFormalParametersBodyDefineCst, cst.loc)
    
    // 设置async标志
    FunctionFormalParametersBodyDefineAst.async = isAsync;
    
    // 如果有函数名，设置 id
    if (functionId) {
      FunctionFormalParametersBodyDefineAst.id = functionId
    }
    
    return FunctionFormalParametersBodyDefineAst
  }


  /**
   * 创建 BlockStatement AST
   * 处理两种情况：
   * 1. 直接是 StatementList（旧的实现）
   * 2. 是 BlockStatement，需要提取内部的 Block -> StatementList
   */
  createBlockStatementAst(cst: SubhutiCst): SlimeBlockStatement {
    let statements: Array<SlimeStatement>
    
    // 如果是 StatementList，直接转换
    if (cst.name === Es6Parser.prototype.StatementList.name) {
      statements = this.createStatementListAst(cst)
    }
    // 如果是 BlockStatement，需要提取 Block -> StatementList
    else if (cst.name === Es6Parser.prototype.BlockStatement.name) {
      // BlockStatement -> Block -> StatementList
      const blockCst = cst.children?.[0]
      if (blockCst && blockCst.name === Es6Parser.prototype.Block.name) {
        // Block 的结构：LBrace StatementList RBrace
        const statementListCst = blockCst.children?.find(
          child => child.name === Es6Parser.prototype.StatementList.name
        )
        if (statementListCst) {
          statements = this.createStatementListAst(statementListCst)
        } else {
          statements = []
        }
      } else {
        statements = []
      }
    }
    else {
      throw new Error(`Expected StatementList or BlockStatement, got ${cst.name}`)
    }
    
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

  /**
   * 创建 if 语句 AST
   * if (test) consequent [else alternate]
   */
  createIfStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.IfStatement.name);
    // if (Expression) Statement [else Statement]
    const test = this.createExpressionAst(cst.children[2])  // 条件表达式
    
    // 处理 then 分支
    const consequentStatements = this.createStatementAst(cst.children[4])
    const consequent = consequentStatements[0] || null
    
    // 检查是否有 else 分支
    let alternate = null
    if (cst.children.length > 5 && cst.children[5]) {
      const alternateStatements = this.createStatementAst(cst.children[6])
      alternate = alternateStatements[0] || null
    }
    
    return {
      type: SlimeAstType.IfStatement,
      test,
      consequent,
      alternate,
      loc: cst.loc
    }
  }

  /**
   * 创建 for 语句 AST
   */
  createForStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.ForStatement.name);
    
    // ForStatement 结构：
    // children[0]: ForTok
    // children[1]: LParen
    // children[2...n-2]: Or节点的内容（init、分号、test、分号、update）
    // children[n-1]: RParen
    // children[n]: Statement (body)
    
    let init: any = null
    let test: any = null
    let update: any = null
    
    // body总是最后一个Statement
    const bodyCst = cst.children[cst.children.length - 1]
    let body: any = this.createStatementAst(bodyCst)
    
    // 如果body是数组，取第一个元素
    if (Array.isArray(body)) {
      body = body[0]
    }
    
    // 从children[2]开始，找到所有非RParen的节点
    let loopPartsEndIndex = cst.children.length - 1
    for (let i = 2; i < cst.children.length; i++) {
      if (cst.children[i].name === 'RParen' || cst.children[i].loc?.type === 'RParen') {
        loopPartsEndIndex = i
        break
      }
    }
    
    const loopParts: SubhutiCst[] = []
    for (let i = 2; i < loopPartsEndIndex; i++) {
      loopParts.push(cst.children[i])
    }
    
    // 解析loopParts
    // 结构：[init, test, Semicolon, update] 或 [test, Semicolon, update]
    // init可能是VariableDeclaration或Expression
    
    let idx = 0
    
    // init: 第一个节点
    if (idx < loopParts.length) {
      const node = loopParts[idx]
      if (node.name === Es6Parser.prototype.VariableDeclaration.name) {
        init = this.createVariableDeclarationAst(node)
        idx++
      } else if (node.name === Es6Parser.prototype.Expression.name) {
        init = this.createExpressionAst(node)
        idx++
      }
    }
    
    // test: 第二个节点（如果是Expression）
    if (idx < loopParts.length && loopParts[idx].name === Es6Parser.prototype.Expression.name) {
      console.log(`\ntest CST:`)
      console.log(`  Expression children: ${loopParts[idx].children?.length || 0}`)
      if (loopParts[idx].children && loopParts[idx].children[0]) {
        const assignExpr = loopParts[idx].children[0]
        console.log(`  AssignmentExpression children: ${assignExpr.children?.length || 0}`)
        if (assignExpr.children) {
          assignExpr.children.forEach((ch, i) => {
            console.log(`    [${i}]: ${ch.name || 'token'} (${ch.loc?.type || 'N/A'})`)
          })
        }
      }
      test = this.createExpressionAst(loopParts[idx])
      console.log(`  test result: ${test?.type}`)
      idx++
    }
    
    // 跳过Semicolon
    if (idx < loopParts.length && loopParts[idx].loc?.type === 'Semicolon') {
      idx++
    }
    
    // update: 最后一个Expression
    if (idx < loopParts.length && loopParts[idx].name === Es6Parser.prototype.Expression.name) {
      update = this.createExpressionAst(loopParts[idx])
      idx++
    }
    
    return {
      type: SlimeAstType.ForStatement,
      init: init,
      test: test,
      update: update,
      body: body,
      loc: cst.loc
    }
  }

  /**
   * 创建 for...in / for...of 语句 AST
   */
  createForInOfStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.ForInOfStatement.name);
    
    // ForInOfStatement 结构：
    // children[0]: ForTok
    // children[1]: LParen
    // children[2]: ForDeclaration (let/const item)
    // children[3]: InTok or OfTok
    // children[4]: Expression (items)
    // children[5]: RParen
    // children[6]: Statement (body)
    
    // 解析 left (for 变量声明)
    const forDeclarationCst = cst.children[2]
    let left: any = null
    if (forDeclarationCst.name === Es6Parser.prototype.ForDeclaration.name) {
      // ForDeclaration 内部是 LetOrConst + ForBinding
      const letOrConstCst = forDeclarationCst.children[0]
      const forBindingCst = forDeclarationCst.children[1]
      
      // ForBinding可能是BindingIdentifier或BindingPattern
      // ForBinding的children[0]才是实际的Binding
      const actualBinding = forBindingCst.children[0]
      let id;
      
      if (actualBinding.name === Es6Parser.prototype.BindingPattern.name) {
        // for (const [key, value] of map) 或 for (const {name} of arr)
        id = this.createBindingPatternAst(actualBinding);
      } else if (actualBinding.name === Es6Parser.prototype.BindingIdentifier.name) {
        // for (const item of arr)
        id = this.createBindingIdentifierAst(actualBinding);
      } else {
        // 降级处理
        id = this.createBindingIdentifierAst(actualBinding);
      }
      
      // 创建变量声明
      const kind = letOrConstCst.children[0].value  // 'let' or 'const'
      
      left = {
        type: SlimeAstType.VariableDeclaration,
        declarations: [{
          type: SlimeAstType.VariableDeclarator,
          id: id,
          init: null,
          loc: forBindingCst.loc
        }],
        kind: {
          type: 'VariableDeclarationKind',
          value: kind,
          loc: letOrConstCst.loc
        },
        loc: forDeclarationCst.loc
      }
    }
    
    // 判断是 in 还是 of
    const inOrOfCst = cst.children[3]
    const isForOf = inOrOfCst.value === 'of' || inOrOfCst.name === 'OfTok'
    
    // 解析 right (items)
    const rightExprCst = cst.children[4]
    const right = this.createExpressionAst(rightExprCst)
    
    // 解析 body
    const bodyCst = cst.children[6]
    // bodyCst 是 Statement 类型，使用 createStatementAst
    const bodyStatements = this.createStatementAst(bodyCst)
    // body 应该是单个 Statement，如果返回数组取第一个
    const body = Array.isArray(bodyStatements) && bodyStatements.length > 0 
      ? bodyStatements[0] 
      : bodyStatements
    
    return {
      type: isForOf ? SlimeAstType.ForOfStatement : SlimeAstType.ForInStatement,
      left: left,
      right: right,
      body: body,
      loc: cst.loc
    }
  }

  /**
   * 创建 while 语句 AST
   */
  createWhileStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.WhileStatement.name);
    return {
      type: SlimeAstType.WhileStatement,
      test: null,  // TODO
      body: null,  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 do...while 语句 AST
   */
  createDoWhileStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.DoWhileStatement.name);
    return {
      type: SlimeAstType.DoWhileStatement,
      body: null,  // TODO
      test: null,  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 switch 语句 AST
   */
  createSwitchStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.SwitchStatement.name);
    return {
      type: SlimeAstType.SwitchStatement,
      discriminant: null,  // TODO
      cases: [],  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 try 语句 AST
   */
  createTryStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.TryStatement.name);
    return {
      type: SlimeAstType.TryStatement,
      block: null,  // TODO
      handler: null,  // TODO
      finalizer: null,  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 throw 语句 AST
   */
  createThrowStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.ThrowStatement.name);
    return {
      type: SlimeAstType.ThrowStatement,
      argument: null,  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 break 语句 AST
   */
  createBreakStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.BreakStatement.name);
    return {
      type: SlimeAstType.BreakStatement,
      label: null,
      loc: cst.loc
    }
  }

  /**
   * 创建 continue 语句 AST
   */
  createContinueStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.ContinueStatement.name);
    return {
      type: SlimeAstType.ContinueStatement,
      label: null,
      loc: cst.loc
    }
  }

  /**
   * 创建标签语句 AST
   */
  createLabelledStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.LabelledStatement.name);
    return {
      type: SlimeAstType.LabeledStatement,
      label: null,  // TODO
      body: null,  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 with 语句 AST
   */
  createWithStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.WithStatement.name);
    return {
      type: SlimeAstType.WithStatement,
      object: null,  // TODO
      body: null,  // TODO
      loc: cst.loc
    }
  }

  /**
   * 创建 debugger 语句 AST
   */
  createDebuggerStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.DebuggerStatement.name);
    return {
      type: SlimeAstType.DebuggerStatement,
      loc: cst.loc
    }
  }

  /**
   * 创建空语句 AST
   */
  createEmptyStatementAst(cst: SubhutiCst): any {
    checkCstName(cst, Es6Parser.prototype.EmptyStatement.name);
    return {
      type: SlimeAstType.EmptyStatement,
      loc: cst.loc
    }
  }

  /**
   * 创建函数声明 AST
   */
  createFunctionDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration {
    checkCstName(cst, Es6Parser.prototype.FunctionDeclaration.name);
    // FunctionDeclaration 结构（带async）：
    // children[0]: AsyncTok (可选)
    // children[1]: FunctionTok
    // children[2]: BindingIdentifier (函数名)
    // children[3]: FunctionFormalParametersBodyDefine (参数和函数体)
    
    // 检查是否有async
    let offset = 0;
    let isAsync = false;
    if (cst.children[0] && cst.children[0].name === 'AsyncTok') {
      isAsync = true;
      offset = 1;
    }
    
    const bindingIdentifierCst = cst.children[1 + offset]
    const functionName = this.createBindingIdentifierAst(bindingIdentifierCst)
    
    const formalParametersBodyCst = cst.children[2 + offset]
    const functionExpression = this.createFunctionFormalParametersBodyDefineAst(formalParametersBodyCst, cst.loc)
    
    return {
      type: SlimeAstType.FunctionDeclaration,
      id: functionName,
      params: functionExpression.params,
      body: functionExpression.body,
      generator: false,
      async: isAsync,
      loc: cst.loc
    } as SlimeFunctionDeclaration
  }

  createCallExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.CallExpression.name);
    if (cst.children.length > 1) {
      const argumentsCst = cst.children[1]
      let argumentsAst: SlimeExpression[] = this.createArgumentsAst(argumentsCst)
      const callee = this.createMemberExpressionAst(cst.children[0])

      return SlimeAstUtil.createCallExpression(callee, argumentsAst)
    }
    // 单个子节点，可能是SuperCall
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.SuperCall.name) {
      return this.createSuperCallAst(first)
    }
    return this.createExpressionAst(first)
  }

  createSuperCallAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.SuperCall.name);
    // SuperCall -> SuperTok + Arguments
    // children[0]: SuperTok token
    // children[1]: Arguments CST
    const argumentsCst = cst.children[1]
    const argumentsAst: SlimeExpression[] = this.createArgumentsAst(argumentsCst)
    
    // 创建Super节点作为callee
    const superNode: SlimeSuper = {
      type: "Super",
      loc: cst.children[0].loc
    }
    
    return SlimeAstUtil.createCallExpression(superNode, argumentsAst)
  }
  
  createSuperPropertyAst(cst: SubhutiCst): SlimeExpression {
    // SuperProperty:
    // 形式1: SuperTok + Dot + Identifier
    // 形式2: SuperTok + BracketExpression
    const superNode: SlimeSuper = {
      type: "Super",
      loc: cst.children[0].loc
    }
    
    const second = cst.children[1]
    if (second.name === Es6Parser.prototype.BracketExpression.name) {
      // super[expression]
      const propertyExpression = this.createExpressionAst(second.children[1])
      return {
        type: SlimeAstType.MemberExpression,
        object: superNode,
        property: propertyExpression,
        computed: true,
        optional: false,
        loc: cst.loc
      } as any
    } else {
      // super.property
      // children: [SuperTok, Dot, Identifier]
      const propToken = cst.children[2]
      const property = SlimeAstUtil.createIdentifier(propToken.value, propToken.loc)
      
      return {
        type: SlimeAstType.MemberExpression,
        object: superNode,
        property: property,
        computed: false,
        optional: false,
        loc: cst.loc
      } as any
    }
  }

  createMetaPropertyAst(cst: SubhutiCst): SlimeExpression {
    // MetaProperty: children[0]是NewTarget或ImportMeta
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.NewTarget.name) {
      // new.target
      return {
        type: 'MetaProperty',
        meta: SlimeAstUtil.createIdentifier('new', first.loc),
        property: SlimeAstUtil.createIdentifier('target', first.loc),
        loc: cst.loc
      } as any
    } else {
      // import.meta
      return {
        type: 'MetaProperty',
        meta: SlimeAstUtil.createIdentifier('import', first.loc),
        property: SlimeAstUtil.createIdentifier('meta', first.loc),
        loc: cst.loc
      } as any
    }
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
      return this.createNewExpressionAst(cst)
    } else {
      throw new Error('不支持的类型')
    }
  }

  createNewExpressionAst(cst: SubhutiCst): any {
    // 支持两种类型：NewExpression 和 NewMemberExpressionArguments
    const isNewMemberExpr = cst.name === Es6Parser.prototype.NewMemberExpressionArguments.name
    const isNewExpr = cst.name === Es6Parser.prototype.NewExpression.name
    
    if (!isNewMemberExpr && !isNewExpr) {
      throw new Error('createNewExpressionAst: 不支持的类型 ' + cst.name)
    }
    
    if (isNewMemberExpr) {
      // NewMemberExpressionArguments -> NewTok + MemberExpression + Arguments
      // children[0]: NewTok (token节点)
      // children[1]: MemberExpression（类名）
      // children[2]: Arguments（参数列表）
      
      // 跳过NewTok，直接处理MemberExpression
      const calleeExpression = this.createMemberExpressionAst(cst.children[1])
      const args = this.createArgumentsAst(cst.children[2])
      
      const newExpression: any = {
        type: 'NewExpression',
        callee: calleeExpression,
        arguments: args,
        loc: cst.loc
      }
      
      return newExpression
    } else {
      // NewExpression -> 递归处理
      return this.createExpressionAst(cst.children[0])
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
      if (first1.name === Es6Parser.prototype.DotIdentifier.name) {
        // obj.property
        const SlimeDotOperator = SlimeAstUtil.createDotOperator(first1.children[0].loc)
        // children[1]是IdentifierName，可能是Identifier或关键字token
        let memberExpressionProperty: SlimeIdentifier | null = null
        if (first1.children[1]) {
          const identifierNameCst = first1.children[1]
          if (identifierNameCst.name === Es6Parser.prototype.IdentifierName.name) {
            // IdentifierName -> Identifier or Keyword token
            const tokenCst = identifierNameCst.children[0]
            memberExpressionProperty = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
          } else {
            // 直接是token（向后兼容）
            memberExpressionProperty = this.createIdentifierAst(first1.children[1])
          }
        }
        return SlimeAstUtil.createMemberExpression(memberExpressionObject, SlimeDotOperator, memberExpressionProperty)
      } else if (first1.name === Es6Parser.prototype.BracketExpression.name) {
        // obj[expression] - computed property access
        // BracketExpression -> LBracket + Expression + RBracket
        const propertyExpression = this.createExpressionAst(first1.children[1])
        const memberExpression: SlimeMemberExpression = {
          type: SlimeAstType.MemberExpression,
          object: memberExpressionObject,
          property: propertyExpression,
          computed: true,
          optional: false,
          loc: cst.loc
        } as any
        return memberExpression
      } else if (first1.name === Es6Parser.prototype.TemplateLiteral.name) {
        // Tagged Template Literals: tag`template`
        // 创建TaggedTemplateExpression
        const tag = memberExpressionObject
        const quasi = this.createTemplateLiteralAst(first1)
        return {
          type: 'TaggedTemplateExpression',
          tag: tag,
          quasi: quasi,
          loc: cst.loc
        } as any
      } else {
        throw new Error(`未知的MemberExpression子节点类型: ${first1.name}`)
      }
    }
    return this.createExpressionAst(cst.children[0])
  }

  createVariableDeclaratorAst(cst: SubhutiCst): SlimeVariableDeclarator {
    const astName = checkCstName(cst, Es6Parser.prototype.VariableDeclarator.name);
    
    // children[0]可能是BindingIdentifier或BindingPattern（解构）
    const firstChild = cst.children[0]
    let id: SlimeIdentifier | SlimePattern
    
    if (firstChild.name === Es6Parser.prototype.BindingIdentifier.name) {
      id = this.createBindingIdentifierAst(firstChild)
    } else if (firstChild.name === Es6Parser.prototype.BindingPattern.name) {
      id = this.createBindingPatternAst(firstChild)
    } else {
      throw new Error(`Unexpected variable declarator id type: ${firstChild.name}`)
    }

    // console.log(6565656)
    // console.log(id)
    let variableDeclarator: SlimeVariableDeclarator
    const varCst = cst.children[1]
    if (varCst) {
      const eqCst = varCst.children[0]
      const eqAst = SlimeAstUtil.createEqualOperator(eqCst.loc)
      const initCst = varCst.children[1]
      if (initCst) {
        // 检查initCst是否是AssignmentExpression
        if (initCst.name === Es6Parser.prototype.AssignmentExpression.name) {
          const init = this.createAssignmentExpressionAst(initCst)
          variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst, init)
        } else {
          // 如果不是AssignmentExpression，直接作为表达式处理
          const init = this.createExpressionAst(initCst)
          variableDeclarator = SlimeAstUtil.createVariableDeclarator(id, eqAst, init)
        }
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
    } else if (astName === Es6Parser.prototype.NewMemberExpressionArguments.name) {
      left = this.createNewExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.MemberExpression.name) {
      left = this.createMemberExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.PrimaryExpression.name) {
      left = this.createPrimaryExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.YieldExpression.name) {
      left = this.createYieldExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.AwaitExpression.name) {
      left = this.createAwaitExpressionAst(cst)
    } else if (astName === Es6Parser.prototype.SuperProperty.name) {
      left = this.createSuperPropertyAst(cst)
    } else if (astName === Es6Parser.prototype.MetaProperty.name) {
      left = this.createMetaPropertyAst(cst)
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
      // 有运算符，创建 BinaryExpression
      const left = this.createExpressionAst(cst.children[0])
      const operator = cst.children[1].value as any  // +/- 运算符
      const right = this.createExpressionAst(cst.children[2])
      
      return {
        type: SlimeAstType.BinaryExpression,
        operator: operator,
        left: left,
        right: right,
        loc: cst.loc
      } as any
    }
    return this.createExpressionAst(cst.children[0])
  }

  createMultiplicativeExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.MultiplicativeExpression.name);
    if (cst.children.length > 1) {
      // 有运算符，创建 BinaryExpression
      const left = this.createExpressionAst(cst.children[0])
      const operator = cst.children[1].children[0].value as any  // */% 运算符
      const right = this.createExpressionAst(cst.children[2])
      
      return {
        type: SlimeAstType.BinaryExpression,
        operator: operator,
        left: left,
        right: right,
        loc: cst.loc
      } as any
    }
    return this.createExpressionAst(cst.children[0])
  }

  createUnaryExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.UnaryExpression.name);
    
    // 防御性检查：如果没有children，抛出更详细的错误
    if (!cst.children || cst.children.length === 0) {
      console.error('UnaryExpression CST没有children:', JSON.stringify(cst, null, 2))
      throw new Error(`UnaryExpression CST没有children，可能是Parser生成的CST不完整`)
    }
    
    // 如果只有一个子节点，检查是否是表达式节点还是token
    if (cst.children.length === 1) {
      const child = cst.children[0]
      
      // 检查是否是token（token有value属性但没有children）
      if (child.value !== undefined && !child.children) {
        // 这是一个token，说明Parser层生成的CST不完整
        // UnaryExpression应该有运算符+操作数两个子节点，或者直接是PostfixExpression
        throw new Error(
          `UnaryExpression CST不完整：只有运算符token '${child.name}' (${child.value})，缺少操作数。` +
          `这是Parser层的问题，请检查Es6Parser.UnaryExpression的Or分支逻辑。`
        )
      }
      
      // 是表达式节点，递归处理
      return this.createExpressionAst(child)
    }
    
    // 如果有两个子节点，是一元运算符表达式
    // children[0]: 运算符 token (!, +, -, ~, typeof, void, delete等)
    // children[1]: UnaryExpression（操作数）
    const operatorToken = cst.children[0]
    const argumentCst = cst.children[1]
    
    // 获取运算符类型
    const operatorMap: {[key: string]: string} = {
      'Exclamation': '!',
      'Plus': '+',
      'Minus': '-',
      'Tilde': '~',
      'TypeofTok': 'typeof',
      'VoidTok': 'void',
      'DeleteTok': 'delete',
      'PlusPlus': '++',
      'MinusMinus': '--',
    }
    
    const operator = operatorMap[operatorToken.name] || operatorToken.value
    
    // 递归处理操作数
    const argument = this.createExpressionAst(argumentCst)
    
    // 创建 UnaryExpression AST
    return {
      type: SlimeAstType.UnaryExpression,
      operator: operator,
      prefix: true,  // 前缀运算符
      argument: argument,
      loc: cst.loc
    } as any
  }

  createPostfixExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.PostfixExpression.name);
    if (cst.children.length > 1) {
      // PostfixExpression: argument ++ | argument --
      const argument = this.createExpressionAst(cst.children[0])
      
      // 查找operator token（++或--）
      let operator: string | undefined
      for (let i = 1; i < cst.children.length; i++) {
        if (cst.children[i].loc && (cst.children[i].loc.type === 'PlusPlus' || cst.children[i].loc.type === 'MinusMinus')) {
          operator = cst.children[i].loc.value
          break
        }
      }
      
      if (operator) {
        return {
          type: SlimeAstType.UpdateExpression,
          operator: operator,
          argument: argument,
          prefix: false,  // 后缀表达式
          loc: cst.loc
        } as any
      }
    }
    return this.createExpressionAst(cst.children[0])
  }

  createLeftHandSideExpressionAst(cst: SubhutiCst): SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.LeftHandSideExpression.name);
    // 容错：Parser在ASI场景下可能生成不完整的CST，返回空标识符
    if (!cst.children || cst.children.length === 0) {
      return SlimeAstUtil.createIdentifier('', cst.loc)
    }
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
    } else if (first.name === Es6Parser.prototype.ClassExpression.name) {
      return this.createClassExpressionAst(first)
    } else if (first.name === Es6TokenConsumer.prototype.ThisTok.name) {
      // 处理 this 关键字
      return SlimeAstUtil.createIdentifier('this', first.loc)
    } else if (first.name === Es6TokenConsumer.prototype.RegularExpressionLiteral.name) {
      // 处理正则表达式字面量
      return SlimeAstUtil.createStringLiteral(first.value)  // 暂时处理为字符串
    } else if (first.name === Es6Parser.prototype.GeneratorExpression.name) {
      // 处理 function* 表达式，降级为普通函数表达式
      return this.createGeneratorExpressionAst(first)
    } else if (first.name === Es6Parser.prototype.CoverParenthesizedExpressionAndArrowParameterList.name) {
      // 处理括号表达式：( Expression )
      // 结构：children[0]=LParen, children[1]=Expression, children[2]=RParen
      const expressionCst = first.children[1]
      return this.createExpressionAst(expressionCst)
    } else if (first.name === Es6Parser.prototype.TemplateLiteral.name) {
      // 处理模板字符串
      return this.createTemplateLiteralAst(first)
    } else {
      throw new Error('未知的createPrimaryExpressionAst：' + first.name)
    }
  }

  // 生成器表达式处理：function* (...) { ... }
  createGeneratorExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
    // GeneratorExpression: function* [name](params) { body }
    // CST children: [FunctionTok, Asterisk, BindingIdentifier?, LParen, FormalParameterList?, RParen, FunctionBodyDefine]
    
    // 可选命名（children[2]）
    let id: SlimeIdentifier | null = null
    if (cst.children[2] && cst.children[2].name === Es6Parser.prototype.BindingIdentifier.name) {
      id = this.createBindingIdentifierAst(cst.children[2])
    }
    
    // 查找FormalParameterList（可选）
    let params: SlimePattern[] = []
    const formalParams = cst.children.find(ch => ch.name === Es6Parser.prototype.FormalParameterList.name)
    if (formalParams) {
      params = this.createFormalParameterListAst(formalParams)
    }
    
    // 查找FunctionBodyDefine
    const bodyNode = cst.children.find(ch => ch.name === Es6Parser.prototype.FunctionBodyDefine.name)
    if (!bodyNode) {
      // 回退方案：构造空函数体
      const lp = SlimeAstUtil.createLParen(cst.loc)
      const rp = SlimeAstUtil.createRParen(cst.loc)
      const funcParams = SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
      const body = SlimeAstUtil.createBlockStatement(null, null, [], cst.loc)
      const func = SlimeAstUtil.createFunctionExpression(body, id, funcParams, cst.loc)
      func.generator = true
      return func
    }
    const body = this.createFunctionBodyDefineAst(bodyNode)
    
    const lp = SlimeAstUtil.createLParen(cst.loc)
    const rp = SlimeAstUtil.createRParen(cst.loc)
    const funcParams = SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
    const func = SlimeAstUtil.createFunctionExpression(body, id, funcParams, cst.loc)
    func.generator = true
    return func
  }

  // 模板字符串处理
  createTemplateLiteralAst(cst: SubhutiCst): SlimeExpression {
    checkCstName(cst, Es6Parser.prototype.TemplateLiteral.name)
    
    const first = cst.children[0]
    
    // 简单模板：`hello` (无插值)
    if (first.name === Es6TokenConsumer.prototype.NoSubstitutionTemplate.name) {
      // 直接转为StringLiteral，去掉前后的反引号
      const raw = first.value || ''
      const cooked = raw.slice(1, -1) // 去掉 ` 和 `
      return SlimeAstUtil.createStringLiteral(`"${cooked}"`)
    }
    
    // 带插值模板：`hello ${name}` 或 `a ${x} b ${y} c`
    const quasis: any[] = []
    const expressions: SlimeExpression[] = []
    
    // children[0] = TemplateHead
    if (first.name === Es6TokenConsumer.prototype.TemplateHead.name) {
      const raw = first.value || ''
      const cooked = raw.slice(1, -2) // 去掉 ` 和 ${
      quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, first.loc))
    }
    
    // children[1] = Expression
    if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.Expression.name) {
      expressions.push(this.createExpressionAst(cst.children[1]))
    }
    
    // children[2] = TemplateSpans
    if (cst.children[2] && cst.children[2].name === Es6Parser.prototype.TemplateSpans.name) {
      this.processTemplateSpans(cst.children[2], quasis, expressions)
    }
    
    return SlimeAstUtil.createTemplateLiteral(quasis, expressions, cst.loc)
  }

  // 处理TemplateSpans：可能是TemplateTail或TemplateMiddleList+TemplateTail
  processTemplateSpans(cst: SubhutiCst, quasis: any[], expressions: SlimeExpression[]): void {
    const first = cst.children[0]
    
    // 情况1：直接是TemplateTail -> }` 结束
    if (first.name === Es6TokenConsumer.prototype.TemplateTail.name) {
      const raw = first.value || ''
      const cooked = raw.slice(1, -1) // 去掉 } 和 `
      quasis.push(SlimeAstUtil.createTemplateElement(true, raw, cooked, first.loc))
      return
    }
    
    // 情况2：TemplateMiddleList -> 有更多插值
    if (first.name === Es6Parser.prototype.TemplateMiddleList.name) {
      this.processTemplateMiddleList(first, quasis, expressions)
      
      // 然后处理TemplateTail
      if (cst.children[1] && cst.children[1].name === Es6TokenConsumer.prototype.TemplateTail.name) {
        const tail = cst.children[1]
        const raw = tail.value || ''
        const cooked = raw.slice(1, -1) // 去掉 } 和 `
        quasis.push(SlimeAstUtil.createTemplateElement(true, raw, cooked, tail.loc))
      }
    }
  }

  // 处理TemplateMiddleList：递归处理多个TemplateMiddle+Expression
  processTemplateMiddleList(cst: SubhutiCst, quasis: any[], expressions: SlimeExpression[]): void {
    // TemplateMiddleList结构：
    // - children[0] = TemplateMiddle (token)
    // - children[1] = Expression
    // - children[2] = TemplateMiddleList (递归，可选)
    
    if (cst.children[0] && cst.children[0].name === Es6TokenConsumer.prototype.TemplateMiddle.name) {
      const middle = cst.children[0]
      const raw = middle.value || ''
      const cooked = raw.slice(1, -2) // 去掉 } 和 ${
      quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, middle.loc))
    }
    
    if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.Expression.name) {
      expressions.push(this.createExpressionAst(cst.children[1]))
    }
    
    // 递归处理下一个TemplateMiddleList
    if (cst.children[2] && cst.children[2].name === Es6Parser.prototype.TemplateMiddleList.name) {
      this.processTemplateMiddleList(cst.children[2], quasis, expressions)
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

  createClassExpressionAst(cst: SubhutiCst): SlimeClassExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ClassExpression.name);

    let id: SlimeIdentifier | null = null // class 表达式可选的标识符
    let tailStartIndex = 1 // 默认 ClassTail 位于索引 1
    const nextChild = cst.children[1]
    if (nextChild && nextChild.name === Es6Parser.prototype.BindingIdentifier.name) {
      id = this.createBindingIdentifierAst(nextChild) // 若存在标识符则解析
      tailStartIndex = 2 // ClassTail 的位置后移
    }
    const classTail = this.createClassTailAst(cst.children[tailStartIndex]) // 统一解析 ClassTail

    return SlimeAstUtil.createClassExpression(id, classTail.superClass, classTail.body, cst.loc) // 生成 ClassExpression AST
  }

  createPropertyDefinitionAst(cst: SubhutiCst): SlimeProperty {
    const astName = checkCstName(cst, Es6Parser.prototype.PropertyDefinition.name);
    const first = cst.children[0]

    if (cst.children.length > 2) {
      // PropertyName : AssignmentExpression（完整形式）
      const PropertyNameCst = cst.children[0]
      const AssignmentExpressionCst = cst.children[2]

      const key = this.createPropertyNameAst(PropertyNameCst)
      const value = this.createAssignmentExpressionAst(AssignmentExpressionCst)

      const keyAst = SlimeAstUtil.createPropertyAst(key, value)
      
      // 检查是否是计算属性名
      if (PropertyNameCst.children[0].name === Es6Parser.prototype.ComputedPropertyName.name) {
        keyAst.computed = true
      }

      return keyAst
    } else if (first.name === Es6Parser.prototype.MethodDefinition.name) {
      // 方法定义（对象中的方法没有static）
      const SlimeMethodDefinition = this.createMethodDefinitionAst(null, first)

      const keyAst = SlimeAstUtil.createPropertyAst(SlimeMethodDefinition.key, SlimeMethodDefinition.value)

      return keyAst
    } else if (first.name === Es6Parser.prototype.IdentifierReference.name) {
      // 属性简写 {name} -> {name: name}
      const identifierCst = first.children[0] // IdentifierReference -> Identifier
      const identifier = this.createIdentifierAst(identifierCst)
      const keyAst = SlimeAstUtil.createPropertyAst(identifier, identifier)
      keyAst.shorthand = true
      return keyAst
    } else {
      throw new Error(`不支持的PropertyDefinition类型: ${first.name}`)
    }
  }


  createPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral | SlimeExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.PropertyName.name);
    const first = cst.children[0]
    if (first.name === Es6Parser.prototype.LiteralPropertyName.name) {
      return this.createLiteralPropertyNameAst(first)
    } else if (first.name === Es6Parser.prototype.ComputedPropertyName.name) {
      // [expression]: value
      // ComputedPropertyName -> LBracket + AssignmentExpression + RBracket
      return this.createAssignmentExpressionAst(first.children[1])
    }
    return this.createLiteralPropertyNameAst(first)
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

  createLiteralFromToken(token: any): SlimeExpression {
    const tokenName = token.tokenName
    if (tokenName === Es6TokenConsumer.prototype.NullLiteral.name) {
      return SlimeAstUtil.createNullLiteralToken()
    } else if (tokenName === Es6TokenConsumer.prototype.TrueTok.name) {
      return SlimeAstUtil.createBooleanLiteral(true)
    } else if (tokenName === Es6TokenConsumer.prototype.FalseTok.name) {
      return SlimeAstUtil.createBooleanLiteral(false)
    } else if (tokenName === Es6TokenConsumer.prototype.NumericLiteral.name) {
      return SlimeAstUtil.createNumericLiteral(Number(token.tokenValue))
    } else if (tokenName === Es6TokenConsumer.prototype.StringLiteral.name) {
      return SlimeAstUtil.createStringLiteral(token.tokenValue)
    } else {
      throw new Error(`Unsupported literal token: ${tokenName}`)
    }
  }

  createArrayExpressionAst(cst: SubhutiCst): SlimeArrayExpression {
    const astName = checkCstName(cst, Es6Parser.prototype.ArrayLiteral.name);
    // ArrayLiteral: [LBracket, ElementList?, RBracket]
    const elementList = cst.children.find(ch => ch.name === Es6Parser.prototype.ElementList.name)
    const elements = elementList ? this.createElementListAst(elementList) : []
    const ast: SlimeArrayExpression = {
      type: 'ArrayExpression',
      elements: elements,
      loc: cst.loc
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

    if (cst.children.length === 1) {
      const child = cst.children[0]
      // 检查是否是箭头函数
      if (child.name === Es6Parser.prototype.ArrowFunction.name) {
        return this.createArrowFunctionAst(child)
      }
      // 否则作为表达式处理
      return this.createExpressionAst(child)
    }

    // AssignmentExpression -> LeftHandSideExpression + Eq + AssignmentExpression
    // 或 LeftHandSideExpression + AssignmentOperator + AssignmentExpression
    const leftCst = cst.children[0]
    const operatorCst = cst.children[1]
    const rightCst = cst.children[2]

    const left = this.createExpressionAst(leftCst)
    const right = this.createAssignmentExpressionAst(rightCst)
    const operator = operatorCst.value || '='

    const ast: SlimeAssignmentExpression = {
      type: 'AssignmentExpression',
      operator: operator as any,
      left: left as any,
      right: right,
      loc: cst.loc
    }
    return ast
  }

  /**
   * 创建箭头函数 AST
   */
  createArrowFunctionAst(cst: SubhutiCst): SlimeArrowFunctionExpression {
    checkCstName(cst, Es6Parser.prototype.ArrowFunction.name);
    // ArrowFunction 结构（带async）：
    // children[0]: AsyncTok (可选)
    // children[1]: ArrowParameters (参数)
    // children[2]: Arrow (=>)
    // children[3]: ConciseBody (函数体)
    
    // 检查是否有async
    let offset = 0;
    let isAsync = false;
    if (cst.children[0] && cst.children[0].name === 'AsyncTok') {
      isAsync = true;
      offset = 1;
    }
    
    // 防御性检查：确保children存在且有足够元素
    if (!cst.children || cst.children.length < 3 + offset) {
      throw new Error(`createArrowFunctionAst: 期望${3 + offset}个children，实际${cst.children?.length || 0}个`)
    }
    
    const arrowParametersCst = cst.children[0 + offset]
    const conciseBodyCst = cst.children[2 + offset]
    
    // 解析参数
    const params = this.createArrowParametersAst(arrowParametersCst)
    
    // 解析函数体
    const body = this.createConciseBodyAst(conciseBodyCst)
    
    return {
      type: SlimeAstType.ArrowFunctionExpression,
      id: null,
      params: params,
      body: body,
      generator: false,
      async: isAsync,
      expression: body.type !== SlimeAstType.BlockStatement,
      loc: cst.loc
    } as any
  }

  /**
   * 创建箭头函数参数 AST
   */
  createArrowParametersAst(cst: SubhutiCst): SlimePattern[] {
    checkCstName(cst, Es6Parser.prototype.ArrowParameters.name);
    
    // ArrowParameters 可以是多种形式，这里简化处理
    if (cst.children.length === 0) {
      return []
    }
    
    const first = cst.children[0]
    
    // 单个参数：BindingIdentifier
    if (first.name === Es6Parser.prototype.BindingIdentifier.name) {
      const param = this.createBindingIdentifierAst(first)
      return [param]
    }
    
    // 参数列表：( FormalParameterList )
    if (first.name === Es6TokenConsumer.prototype.LParen.name) {
      // 查找 FormalParameterList
      const formalParameterListCst = cst.children.find(
        child => child.name === Es6Parser.prototype.FormalParameterList.name
      )
      if (formalParameterListCst) {
        return this.createFormalParameterListAst(formalParameterListCst)
      }
      return []
    }
    
    return []
  }

  /**
   * 创建箭头函数体 AST
   */
  createConciseBodyAst(cst: SubhutiCst): SlimeBlockStatement | SlimeExpression {
    // 防御性检查
    if (!cst) {
      throw new Error('createConciseBodyAst: cst is null or undefined')
    }
    
    checkCstName(cst, Es6Parser.prototype.ConciseBody.name);
    
    const first = cst.children[0]
    
    // 如果是 BlockStatement，解析为 BlockStatement
    if (first.name === Es6Parser.prototype.FunctionBodyDefine.name) {
      return this.createFunctionBodyDefineAst(first)
    }
    
    // 否则是表达式，解析为表达式
    if (first.name === Es6Parser.prototype.AssignmentExpression.name) {
      return this.createAssignmentExpressionAst(first)
    }
    
    return this.createExpressionAst(first)
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
      // CST children: [LogicalORExpression, Question, AssignmentExpression, Colon, AssignmentExpression]
      consequent = this.createAssignmentExpressionAst(cst.children[2])
      alternate = this.createAssignmentExpressionAst(cst.children[4])
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

  createYieldExpressionAst(cst: SubhutiCst): any {
    // yield [*] AssignmentExpression?
    let delegate = false
    let startIndex = 1
    if (cst.children[1] && cst.children[1].name === Es6TokenConsumer.prototype.Asterisk.name) {
      delegate = true
      startIndex = 2
    }
    let argument: any = null
    if (cst.children[startIndex]) {
      argument = this.createAssignmentExpressionAst(cst.children[startIndex])
    }
    return {
      type: SlimeAstType.YieldExpression,
      argument,
      delegate,
      loc: cst.loc
    } as any
  }

  createAwaitExpressionAst(cst: SubhutiCst): any {
    // await UnaryExpression
    checkCstName(cst, Es6Parser.prototype.AwaitExpression.name);
    const argumentCst = cst.children[1]
    const argument = this.createExpressionAst(argumentCst)
    return {
      type: SlimeAstType.AwaitExpression,
      argument,
      loc: cst.loc
    } as any
  }
}

const SlimeCstToAstUtil = new SlimeCstToAst()

export default SlimeCstToAstUtil
