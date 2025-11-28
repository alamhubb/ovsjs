import {
    type SlimeAssignmentExpression,
    type SlimeBlockStatement,
    type SlimeCallExpression,
    type SlimeClassBody,
    type SlimeClassDeclaration,
    type SlimeConditionalExpression,
    type SlimeDeclaration,
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
    type SlimeSpreadElement,
    type SlimeMethodDefinition,
    type SlimeRestElement,
    type SlimeMemberExpression,
    type SlimeImportDeclaration,
    type SlimeImportSpecifier,
    type SlimeClassExpression
} from "slime-ast/src/SlimeAstInterface.ts";
import SubhutiCst, {type SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";
import Es2025Parser from "./es2025/Es2025Parser.ts";
import Es2025TokenConsumer from "./es2025/Es2025TokenConsumer.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";

// Alias for backward compatibility
const Es6Parser = Es2025Parser;
const Es6TokenConsumer = Es2025TokenConsumer;

// ============================================
// Unicode 转义序列解码
// ES2025 规范 12.9.4 - 将 \uXXXX 和 \u{XXXXX} 转换为实际字符
// 参考实现：Babel、Acorn、TypeScript
// ============================================

/**
 * 将 Unicode 转义序列解码为实际字符
 * 支持 \uXXXX 和 \u{XXXXX} 格式
 *
 * @param str 可能包含 Unicode 转义的字符串
 * @returns 解码后的字符串
 */
function decodeUnicodeEscapes(str: string | undefined): string {
    // 如果为空或不包含转义序列，直接返回（性能优化）
    if (!str || !str.includes('\\u')) {
        return str || ''
    }

    return str.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g,
        (match, braceCode, fourDigitCode) => {
            const codePoint = parseInt(braceCode || fourDigitCode, 16)
            return String.fromCodePoint(codePoint)
        }
    )
}

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
        // Support both Es6TokenConsumer.Identifier and direct 'Identifier' name
        const expectedName = Es6TokenConsumer.prototype.Identifier?.name || 'Identifier'
        if (cst.name !== expectedName && cst.name !== 'Identifier') {
            throw new Error(`Expected Identifier, got ${cst.name}`)
        }
        // 解码 Unicode 转义序列（如 \u0061 -> a）
        const decodedName = decodeUnicodeEscapes(cst.value as string)
        const identifier = SlimeAstUtil.createIdentifier(decodedName, cst.loc)
        return identifier
    }

    toProgram(cst: SubhutiCst): SlimeProgram {
        // Support both Module and Script entry points
        const isModule = cst.name === Es6Parser.prototype.Module?.name || cst.name === 'Module'
        const isScript = cst.name === Es6Parser.prototype.Script?.name || cst.name === 'Script'
        const isProgram = cst.name === Es6Parser.prototype.Program?.name || cst.name === 'Program'

        if (!isModule && !isScript && !isProgram) {
            throw new Error(`Expected CST name 'Module', 'Script' or 'Program', but got '${cst.name}'`)
        }

        const first = cst.children?.[0]
        let program: SlimeProgram

        // If children is empty, return empty program
        if (!first) {
            return SlimeAstUtil.createProgram([], isModule ? 'module' : 'script')
        }

        if (first.name === Es6Parser.prototype.ModuleItemList?.name || first.name === 'ModuleItemList') {
            const body = this.createModuleItemListAst(first)
            program = SlimeAstUtil.createProgram(body, 'module')
        } else if (first.name === Es6Parser.prototype.StatementList?.name || first.name === 'StatementList') {
            const body = this.createStatementListAst(first)
            program = SlimeAstUtil.createProgram(body, 'script')
        } else {
            throw new Error(`Unexpected first child: ${first.name}`)
        }
        program.loc = cst.loc
        return program
    }

    createModuleItemListAst(cst: SubhutiCst): Array<SlimeStatement | SlimeModuleDeclaration> {
        const asts = cst.children.map(item => {
            // Es2025Parser uses ModuleItem wrapper
            if (item.name === Es6Parser.prototype.ModuleItem?.name || item.name === 'ModuleItem') {
                const innerItem = item.children?.[0]
                if (!innerItem) return undefined
                return this.createModuleItemAst(innerItem)
            }
            // Fallback: direct type
            return this.createModuleItemAst(item)
        }).filter(ast => ast !== undefined)

        return asts.flat()
    }

    createModuleItemAst(item: SubhutiCst): SlimeStatement | SlimeModuleDeclaration | SlimeStatement[] | undefined {
        const name = item.name
        if (name === Es6Parser.prototype.ExportDeclaration?.name || name === 'ExportDeclaration') {
            return this.createExportDeclarationAst(item)
        } else if (name === Es6Parser.prototype.ImportDeclaration?.name || name === 'ImportDeclaration') {
            return this.createImportDeclarationAst(item)
        } else if (name === Es6Parser.prototype.StatementListItem?.name || name === 'StatementListItem') {
            return this.createStatementListItemAst(item)
        }
        console.warn(`createModuleItemAst: Unknown item type: ${name}`)
        return undefined
    }

    createImportDeclarationAst(cst: SubhutiCst): SlimeImportDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration?.name);
        const first = cst.children[0]
        const first1 = cst.children[1]
        let importDeclaration: SlimeImportDeclaration
        let specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>
        let FromClause: SlimeImportDeclaration
        if (first1.name === Es6Parser.prototype.ImportClause?.name) {
            specifiers = this.createImportClauseAst(first1)
            FromClause = this.createFromClauseAst(cst.children[2])
            importDeclaration = SlimeAstUtil.createImportDeclaration(specifiers, FromClause.from, FromClause.source, cst.loc)
        } else if (first1.name === Es6Parser.prototype.ModuleSpecifier?.name) {
        }
        return importDeclaration
    }


    createFromClauseAst(cst: SubhutiCst): SlimeImportDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.FromClause?.name);
        const first = cst.children[0]
        const from = SlimeAstUtil.createFromKeyword(first.loc)
        const ModuleSpecifier = this.createModuleSpecifierAst(cst.children[1])
        return SlimeAstUtil.createImportDeclaration(null, from, ModuleSpecifier)
    }

    createModuleSpecifierAst(cst: SubhutiCst): SlimeStringLiteral {
        let astName = checkCstName(cst, Es6Parser.prototype.ModuleSpecifier?.name);
        const first = cst.children[0]
        const ast = SlimeAstUtil.createStringLiteral(first.value)
        return ast
    }

    createImportClauseAst(cst: SubhutiCst): Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier> {
        let astName = checkCstName(cst, Es6Parser.prototype.ImportClause?.name);
        const first = cst.children[0]
        if (first.name === Es6Parser.prototype.ImportedDefaultBinding?.name) {
            const specifier = this.createImportedDefaultBindingAst(first)
            return [specifier]
        } else if (first.name === Es6Parser.prototype.NameSpaceImport?.name) {
            // import * as name from 'module'
            return [this.createNameSpaceImportSpecifierAst(first)]
        } else if (first.name === Es6Parser.prototype.NamedImports?.name) {
            // import {name, greet} from 'module'
            return this.createNamedImportsListAst(first)
        }
        return []
    }

    createImportedDefaultBindingAst(cst: SubhutiCst): SlimeImportDefaultSpecifier {
        let astName = checkCstName(cst, Es6Parser.prototype.ImportedDefaultBinding?.name);
        const first = cst.children[0]
        const id = this.createImportedBindingAst(first)
        const importDefaultSpecifier: SlimeImportDefaultSpecifier = SlimeAstUtil.createImportDefaultSpecifier(id)
        return importDefaultSpecifier
    }

    createImportedBindingAst(cst: SubhutiCst): SlimeIdentifier {
        let astName = checkCstName(cst, Es6Parser.prototype.ImportedBinding?.name);
        const first = cst.children[0]
        return this.createBindingIdentifierAst(first)
    }

    createNameSpaceImportSpecifierAst(cst: SubhutiCst): SlimeImportNamespaceSpecifier {
        // NameSpaceImport: Asterisk as ImportedBinding
        // children: [Asterisk, AsTok, ImportedBinding]
        const binding = cst.children.find(ch => ch.name === Es6Parser.prototype.ImportedBinding?.name)
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
        const importsList = cst.children.find(ch => ch.name === Es6Parser.prototype.ImportsList?.name)
        if (!importsList) return []

        const specifiers: Array<SlimeImportSpecifier> = []
        for (const child of importsList.children) {
            if (child.name === Es6Parser.prototype.ImportSpecifier?.name) {
                // ImportSpecifier有两种形式：
                // 1. ImportedBinding （简写）
                // 2. IdentifierName AsTok ImportedBinding （重命名）

                const identifierName = child.children.find((ch: any) =>
                    ch.name === Es6Parser.prototype.IdentifierName?.name)
                const binding = child.children.find((ch: any) =>
                    ch.name === Es6Parser.prototype.ImportedBinding?.name)

                if (identifierName && binding) {
                    // import {name as localName} 或 import {default as MyClass} - 重命名形式
                    const imported = this.createIdentifierNameAst(identifierName)
                    const local = this.createImportedBindingAst(binding)
                    specifiers.push({
                        type: SlimeAstType.ImportSpecifier,
                        imported: imported,
                        local: local,
                        loc: child.loc
                    } as any)
                } else if (binding) {
                    // import {name} - 简写形式
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
        // 解码 Unicode 转义序列（如 \u0061 -> a）
        const decodedName = decodeUnicodeEscapes(token.value as string)
        return SlimeAstUtil.createIdentifier(decodedName, token.loc)
    }

    createExportClauseAst(cst: SubhutiCst): Array<any> {
        // ExportClause: LBrace (ExportsList | RBrace)
        const exportsList = cst.children.find((ch: any) =>
            ch.name === Es6Parser.prototype.ExportsList?.name)
        if (!exportsList) return []

        return this.createExportsListAst(exportsList)
    }

    createExportsListAst(cst: SubhutiCst): Array<any> {
        // ExportsList: ExportSpecifier (, ExportSpecifier)*
        const specifiers: Array<any> = []
        for (const child of cst.children) {
            if (child.name === Es6Parser.prototype.ExportSpecifier?.name) {
                specifiers.push(this.createExportSpecifierAst(child))
            }
        }
        return specifiers
    }

    createExportSpecifierAst(cst: SubhutiCst): any {
        // ExportSpecifier: IdentifierName (as IdentifierName)?
        // IdentifierName可以是Identifier或任何关键字（如default、class等）

        // 查找所有IdentifierName节点
        const identifierNames = cst.children.filter((ch: any) =>
            ch.name === Es6Parser.prototype.IdentifierName?.name)

        if (identifierNames.length === 2) {
            // export {name as userName} 或 export {default as Person}
            const local = this.createIdentifierNameAst(identifierNames[0])
            const exported = this.createIdentifierNameAst(identifierNames[1])
            return {
                type: 'ExportSpecifier',
                local: local,
                exported: exported,
                loc: cst.loc
            }
        } else if (identifierNames.length === 1) {
            // export {name}
            const id = this.createIdentifierNameAst(identifierNames[0])
            return {
                type: 'ExportSpecifier',
                local: id,
                exported: id,
                loc: cst.loc
            }
        }
        throw new Error('ExportSpecifier invalid structure')
    }

    /**
     * 从IdentifierName CST中提取标识符
     * IdentifierName可以是Identifier或任何关键字token
     */
    createIdentifierNameAst2(cst: SubhutiCst): SlimeIdentifier {
        checkCstName(cst, Es6Parser.prototype.IdentifierName?.name)

        // IdentifierName的children[0]是实际的token（Identifier或关键字）
        const token = cst.children[0]
        if (token && token.value) {
            // 解码 Unicode 转义序列（如 \u0061 -> a）
            const decodedName = decodeUnicodeEscapes(token.value as string)
            return SlimeAstUtil.createIdentifier(decodedName, token.loc)
        }

        throw new Error('IdentifierName has no token')
    }

    createImportedDefaultBindingCommaNameSpaceImportAst(cst: SubhutiCst): SlimeImportDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration?.name);
        const first = cst.children[0]
        const first1 = cst.children[0]
        if (first1.name === Es6Parser.prototype.ImportClause?.name) {

        } else if (first1.name === Es6Parser.prototype.ModuleSpecifier?.name) {

        }
    }

    createImportedDefaultBindingCommaNamedImportsAst(cst: SubhutiCst): SlimeImportDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.ImportDeclaration?.name);
        const first = cst.children[0]
        const first1 = cst.children[0]
        if (first1.name === Es6Parser.prototype.ImportClause?.name) {

        } else if (first1.name === Es6Parser.prototype.ModuleSpecifier?.name) {

        }
    }


    createBindingIdentifierAst(cst: SubhutiCst): SlimeIdentifier {
        const astName = checkCstName(cst, Es6Parser.prototype.BindingIdentifier?.name);
        //Identifier
        const first = cst.children[0]
        return SlimeAstUtil.createIdentifier(first.value, first.loc)
    }


    /*createImportClauseAst(cst: SubhutiCst.ts):Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>{
    let astName = checkCstName(cst, Es6Parser.prototype.ImportClause?.name);


  }*/


    createStatementListAst(cst: SubhutiCst): Array<SlimeStatement> {
        const astName = checkCstName(cst, Es6Parser.prototype.StatementList?.name);
        if (cst.children) {
            const statements = cst.children.map(item => this.createStatementListItemAst(item)).flat()
            return statements
        }
        return []
    }

    createStatementListItemAst(cst: SubhutiCst): Array<SlimeStatement> {
        const astName = checkCstName(cst, Es6Parser.prototype.StatementListItem?.name);
        const statements = cst.children.map(item => {
            // 如果是 Declaration，直接处理
            if (item.name === Es6Parser.prototype.Declaration?.name) {
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
        const astName = checkCstName(cst, Es6Parser.prototype.Statement?.name);
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
        if (cst.name === Es6Parser.prototype.BreakableStatement?.name) {
            if (cst.children && cst.children.length > 0) {
                return this.createStatementDeclarationAst(cst.children[0])
            }
            return undefined
        }
        // IterationStatement - 循环语句包装节点
        else if (cst.name === Es6Parser.prototype.IterationStatement?.name) {
            if (cst.children && cst.children.length > 0) {
                return this.createStatementDeclarationAst(cst.children[0])
            }
            return undefined
        }
        // IfStatementBody - if/else 语句体包装节点，递归处理子节点
        else if (cst.name === 'IfStatementBody') {
            if (cst.children && cst.children.length > 0) {
                return this.createStatementDeclarationAst(cst.children[0])
            }
            return undefined
        }
        // 变量声明
        else if (cst.name === Es6Parser.prototype.VariableDeclaration?.name) {
            return this.createVariableDeclarationAst(cst)
        }
        // 表达式语句
        else if (cst.name === Es6Parser.prototype.ExpressionStatement?.name) {
            return this.createExpressionStatementAst(cst)
        }
        // return 语句
        else if (cst.name === Es6Parser.prototype.ReturnStatement?.name) {
            return this.createReturnStatementAst(cst)
        }
        // if 语句
        else if (cst.name === Es6Parser.prototype.IfStatement?.name) {
            return this.createIfStatementAst(cst)
        }
        // for 语句
        else if (cst.name === Es6Parser.prototype.ForStatement?.name) {
            return this.createForStatementAst(cst)
        }
        // for...in / for...of 语句
        else if (cst.name === Es6Parser.prototype.ForInOfStatement?.name) {
            return this.createForInOfStatementAst(cst)
        }
        // while 语句
        else if (cst.name === Es6Parser.prototype.WhileStatement?.name) {
            return this.createWhileStatementAst(cst)
        }
        // do...while 语句
        else if (cst.name === Es6Parser.prototype.DoWhileStatement?.name) {
            return this.createDoWhileStatementAst(cst)
        }
        // 块语句
        else if (cst.name === Es6Parser.prototype.BlockStatement?.name) {
            return this.createBlockStatementAst(cst)
        }
        // switch 语句
        else if (cst.name === Es6Parser.prototype.SwitchStatement?.name) {
            return this.createSwitchStatementAst(cst)
        }
        // try 语句
        else if (cst.name === Es6Parser.prototype.TryStatement?.name) {
            return this.createTryStatementAst(cst)
        }
        // throw 语句
        else if (cst.name === Es6Parser.prototype.ThrowStatement?.name) {
            return this.createThrowStatementAst(cst)
        }
        // break 语句
        else if (cst.name === Es6Parser.prototype.BreakStatement?.name) {
            return this.createBreakStatementAst(cst)
        }
        // continue 语句
        else if (cst.name === Es6Parser.prototype.ContinueStatement?.name) {
            return this.createContinueStatementAst(cst)
        }
        // 标签语句
        else if (cst.name === Es6Parser.prototype.LabelledStatement?.name) {
            return this.createLabelledStatementAst(cst)
        }
        // with 语句
        else if (cst.name === Es6Parser.prototype.WithStatement?.name) {
            return this.createWithStatementAst(cst)
        }
        // debugger 语句
        else if (cst.name === Es6Parser.prototype.DebuggerStatement?.name) {
            return this.createDebuggerStatementAst(cst)
        }
        // 空语句
        else if (cst.name === Es6Parser.prototype.NotEmptySemicolon?.name) {
            return this.createEmptyStatementAst(cst)
        }
        // 函数声明
        else if (cst.name === Es6Parser.prototype.FunctionDeclaration?.name) {
            return this.createFunctionDeclarationAst(cst)
        }
        // 类声明
        else if (cst.name === Es6Parser.prototype.ClassDeclaration?.name) {
            return this.createClassDeclarationAst(cst)
        }
    }

    createExportDeclarationAst(cst: SubhutiCst): SlimeExportDefaultDeclaration | SlimeExportNamedDeclaration {
        let astName = checkCstName(cst, Es6Parser.prototype.ExportDeclaration?.name);
        const first = cst.children[0]
        const first1 = cst.children[1]
        let token = SlimeAstUtil.createExportToken(first.loc)
        if (first1.name === Es6Parser.prototype.AsteriskFromClauseEmptySemicolon?.name) {
            // export * from './module.js'
            const source = first1.children.find((ch: any) => ch.name === Es6Parser.prototype.FromClause?.name)
            if (source) {
                const fromClause = this.createFromClauseAst(source)
                return {
                    type: 'ExportAllDeclaration',
                    source: fromClause.source,
                    loc: cst.loc
                } as any
            }
        } else if (first1.name === Es6Parser.prototype.ExportClauseFromClauseEmptySemicolon?.name) {
            // export {name, age} from './module.js'
            const exportClause = first1.children.find((ch: any) =>
                ch.name === Es6Parser.prototype.ExportClause?.name)
            const source = first1.children.find((ch: any) => ch.name === Es6Parser.prototype.FromClause?.name)

            const specifiers = exportClause ? this.createExportClauseAst(exportClause) : []

            if (source) {
                const fromClause = this.createFromClauseAst(source)
                return SlimeAstUtil.createExportNamedDeclaration(token, null, specifiers, fromClause.source, cst.loc)
            }
        } else if (first1.name === Es6Parser.prototype.ExportClauseEmptySemicolon?.name) {
            // export {name, age} 或 export {name as userName}
            const exportClause = first1.children.find((ch: any) =>
                ch.name === Es6Parser.prototype.ExportClause?.name)
            const specifiers = exportClause ? this.createExportClauseAst(exportClause) : []
            return SlimeAstUtil.createExportNamedDeclaration(token, null, specifiers, null, cst.loc)
        } else if (first1.name === Es6Parser.prototype.Declaration?.name) {
            const declaration = this.createDeclarationAst(cst.children[1])
            // console.log('asdfsadfsad')
            // console.log(cst.children[1])
            // console.log(declaration)

            return SlimeAstUtil.createExportNamedDeclaration(token, declaration, [], null, cst.loc)

        } else if (first1.name === Es6Parser.prototype.DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression?.name) {
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
        // Support both Declaration wrapper and direct types
        const first = cst.name === Es6Parser.prototype.Declaration?.name || cst.name === 'Declaration'
            ? cst.children[0]
            : cst

        const name = first.name

        if (name === Es6Parser.prototype.VariableDeclaration?.name || name === 'VariableDeclaration') {
            return this.createVariableDeclarationAst(first);
        } else if (name === Es6Parser.prototype.LexicalDeclaration?.name || name === 'LexicalDeclaration') {
            // LexicalDeclaration: let/const declarations
            return this.createLexicalDeclarationAst(first);
        } else if (name === Es6Parser.prototype.ClassDeclaration?.name || name === 'ClassDeclaration') {
            return this.createClassDeclarationAst(first);
        } else if (name === Es6Parser.prototype.FunctionDeclaration?.name || name === 'FunctionDeclaration') {
            return this.createFunctionDeclarationAst(first);
        } else if (name === Es6Parser.prototype.HoistableDeclaration?.name || name === 'HoistableDeclaration') {
            return this.createHoistableDeclarationAst(first);
        } else {
            throw new Error(`Unsupported Declaration type: ${name}`)
        }
    }

    createLexicalDeclarationAst(cst: SubhutiCst): SlimeVariableDeclaration {
        // LexicalDeclaration: LetOrConst BindingList ;
        // BindingList: LexicalBinding (, LexicalBinding)*
        // LexicalBinding: BindingIdentifier Initializer? | BindingPattern Initializer

        const children = cst.children || []

        // First child is LetOrConst (let or const keyword)
        const kindToken = children[0]
        const kind = kindToken?.value || kindToken?.loc?.value || 'const'

        // Find all LexicalBinding or BindingList
        const declarations: any[] = []

        for (let i = 1; i < children.length; i++) {
            const child = children[i]
            if (!child) continue

            // Skip semicolons and commas
            if (child.loc?.type === 'Semicolon' || child.value === ';' || child.value === ',') {
                continue
            }

            // Handle BindingList wrapper
            if (child.name === 'BindingList' || child.name === Es6Parser.prototype.BindingList?.name) {
                for (const binding of child.children || []) {
                    if (binding.name === 'LexicalBinding' || binding.name === Es6Parser.prototype.LexicalBinding?.name) {
                        declarations.push(this.createLexicalBindingAst(binding))
                    }
                }
                continue
            }

            // Direct LexicalBinding
            if (child.name === 'LexicalBinding' || child.name === Es6Parser.prototype.LexicalBinding?.name) {
                declarations.push(this.createLexicalBindingAst(child))
            }
        }

        return {
            type: SlimeAstType.VariableDeclaration,
            kind: kind as any,
            declarations: declarations,
            loc: cst.loc
        } as any
    }

    createLexicalBindingAst(cst: SubhutiCst): SlimeVariableDeclarator {
        // LexicalBinding: BindingIdentifier Initializer? | BindingPattern Initializer
        const children = cst.children || []

        let id: any = null
        let init: any = null

        for (const child of children) {
            if (!child) continue

            const name = child.name
            if (name === Es6Parser.prototype.BindingIdentifier?.name || name === 'BindingIdentifier') {
                id = this.createBindingIdentifierAst(child)
            } else if (name === Es6Parser.prototype.BindingPattern?.name || name === 'BindingPattern') {
                id = this.createBindingPatternAst(child)
            } else if (name === Es6Parser.prototype.Initializer?.name || name === 'Initializer') {
                init = this.createInitializerAst(child)
            }
        }

        return {
            type: SlimeAstType.VariableDeclarator,
            id: id,
            init: init,
            loc: cst.loc
        } as any
    }

    createHoistableDeclarationAst(cst: SubhutiCst): SlimeDeclaration {
        const astName = checkCstName(cst, Es6Parser.prototype.HoistableDeclaration?.name);
        const first = cst.children[0]
        if (first.name === Es6Parser.prototype.FunctionDeclaration?.name || first.name === 'FunctionDeclaration') {
            return this.createFunctionDeclarationAst(first)
        } else if (first.name === Es6Parser.prototype.GeneratorDeclaration?.name || first.name === 'GeneratorDeclaration') {
            // GeneratorDeclaration -> 类似FunctionDeclaration但有*号
            return this.createGeneratorDeclarationAst(first)
        } else if (first.name === Es6Parser.prototype.AsyncFunctionDeclaration?.name || first.name === 'AsyncFunctionDeclaration') {
            // AsyncFunctionDeclaration -> async function
            return this.createAsyncFunctionDeclarationAst(first)
        } else if (first.name === Es6Parser.prototype.AsyncGeneratorDeclaration?.name || first.name === 'AsyncGeneratorDeclaration') {
            // AsyncGeneratorDeclaration -> async function*
            return this.createAsyncGeneratorDeclarationAst(first)
        } else {
            throw new Error(`Unsupported HoistableDeclaration type: ${first.name}`)
        }
    }

    createGeneratorDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration {
        // GeneratorDeclaration: function* name(params) { body }
        // 旧版 CST children: [FunctionTok, Asterisk, BindingIdentifier, LParen, FormalParameterList?, RParen, FunctionBodyDefine]
        // Es2025 CST children: [FunctionTok, Asterisk, BindingIdentifier, LParen, FormalParameters?, RParen, LBrace, GeneratorBody, RBrace]

        let id: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // 查找 BindingIdentifier
        const bindingId = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingIdentifier?.name || ch.name === 'BindingIdentifier')
        if (bindingId) {
            id = this.createBindingIdentifierAst(bindingId)
        }

        // 查找 FormalParameters 或 FormalParameterList
        const formalParams = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.FormalParameters?.name || ch.name === 'FormalParameters' ||
            ch.name === Es6Parser.prototype.FormalParameterList?.name || ch.name === 'FormalParameterList')
        if (formalParams) {
            if (formalParams.name === 'FormalParameters' || formalParams.name === Es6Parser.prototype.FormalParameters?.name) {
                params = this.createFormalParametersAst(formalParams)
            } else {
                params = this.createFormalParameterListAst(formalParams)
            }
        }

        // 查找 GeneratorBody 或 FunctionBody 或 FunctionBodyDefine
        const bodyNode = cst.children.find(ch =>
            ch.name === 'GeneratorBody' || ch.name === Es6Parser.prototype.GeneratorBody?.name ||
            ch.name === 'FunctionBody' || ch.name === Es6Parser.prototype.FunctionBody?.name ||
            ch.name === Es6Parser.prototype.FunctionBodyDefine?.name)
        if (bodyNode) {
            if (bodyNode.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
                body = this.createFunctionBodyDefineAst(bodyNode)
            } else {
                const bodyStatements = this.createFunctionBodyAst(bodyNode)
                body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyNode.loc)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

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

    createAsyncFunctionDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration {
        // AsyncFunctionDeclaration: async function name(params) { body }
        // CST children: [AsyncTok, FunctionTok, BindingIdentifier, LParen, FormalParameters?, RParen, LBrace, AsyncFunctionBody, RBrace]
        // 或者旧版: [AsyncTok, FunctionTok, BindingIdentifier, LParen, FormalParameterList?, RParen, FunctionBodyDefine]

        let id: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // 查找 BindingIdentifier
        const bindingId = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingIdentifier?.name || ch.name === 'BindingIdentifier')
        if (bindingId) {
            id = this.createBindingIdentifierAst(bindingId)
        }

        // 查找 FormalParameters 或 FormalParameterList
        const formalParams = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.FormalParameters?.name || ch.name === 'FormalParameters' ||
            ch.name === Es6Parser.prototype.FormalParameterList?.name || ch.name === 'FormalParameterList')
        if (formalParams) {
            if (formalParams.name === 'FormalParameters' || formalParams.name === Es6Parser.prototype.FormalParameters?.name) {
                params = this.createFormalParametersAst(formalParams)
            } else {
                params = this.createFormalParameterListAst(formalParams)
            }
        }

        // 查找 AsyncFunctionBody 或 FunctionBody 或 FunctionBodyDefine
        const bodyNode = cst.children.find(ch =>
            ch.name === 'AsyncFunctionBody' || ch.name === Es6Parser.prototype.AsyncFunctionBody?.name ||
            ch.name === 'FunctionBody' || ch.name === Es6Parser.prototype.FunctionBody?.name ||
            ch.name === Es6Parser.prototype.FunctionBodyDefine?.name)
        if (bodyNode) {
            if (bodyNode.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
                body = this.createFunctionBodyDefineAst(bodyNode)
            } else {
                const bodyStatements = this.createFunctionBodyAst(bodyNode)
                body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyNode.loc)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        return {
            type: SlimeAstType.FunctionDeclaration,
            id: id,
            params: params,
            body: body,
            generator: false,
            async: true,
            loc: cst.loc
        } as SlimeFunctionDeclaration
    }

    createAsyncGeneratorDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration {
        // AsyncGeneratorDeclaration: async function* name(params) { body }
        // CST children: [AsyncTok, FunctionTok, Asterisk, BindingIdentifier, LParen, FormalParameters?, RParen, LBrace, AsyncGeneratorBody, RBrace]

        let id: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // 查找 BindingIdentifier
        const bindingId = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingIdentifier?.name || ch.name === 'BindingIdentifier')
        if (bindingId) {
            id = this.createBindingIdentifierAst(bindingId)
        }

        // 查找 FormalParameters 或 FormalParameterList
        const formalParams = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.FormalParameters?.name || ch.name === 'FormalParameters' ||
            ch.name === Es6Parser.prototype.FormalParameterList?.name || ch.name === 'FormalParameterList')
        if (formalParams) {
            if (formalParams.name === 'FormalParameters' || formalParams.name === Es6Parser.prototype.FormalParameters?.name) {
                params = this.createFormalParametersAst(formalParams)
            } else {
                params = this.createFormalParameterListAst(formalParams)
            }
        }

        // 查找 AsyncGeneratorBody 或 FunctionBody 或 FunctionBodyDefine
        const bodyNode = cst.children.find(ch =>
            ch.name === 'AsyncGeneratorBody' || ch.name === Es6Parser.prototype.AsyncGeneratorBody?.name ||
            ch.name === 'FunctionBody' || ch.name === Es6Parser.prototype.FunctionBody?.name ||
            ch.name === Es6Parser.prototype.FunctionBodyDefine?.name)
        if (bodyNode) {
            if (bodyNode.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
                body = this.createFunctionBodyDefineAst(bodyNode)
            } else {
                const bodyStatements = this.createFunctionBodyAst(bodyNode)
                body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyNode.loc)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        return {
            type: SlimeAstType.FunctionDeclaration,
            id: id,
            params: params,
            body: body,
            generator: true,
            async: true,
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
            case Es6Parser.prototype.ClassDeclaration?.name:
                return this.createClassDeclarationAst(cst);
            case Es6Parser.prototype.FunctionDeclaration?.name:
                return this.createFunctionExpressionAst(cst) as any;
            case Es6Parser.prototype.HoistableDeclaration?.name:
                // export default function() {} or export default function*() {}
                return this.createHoistableDeclarationAst(cst);
            case Es6Parser.prototype.AssignmentExpression?.name:
                return this.createAssignmentExpressionAst(cst);
            default:
                // 尝试作为表达式处理
                return this.createExpressionAst(cst);
        }
    }


    createNodeAst(cst: SubhutiCst) {
        switch (cst.name) {
            case Es6Parser.prototype.VariableDeclaration?.name:
                return this.createVariableDeclarationAst(cst);
            case Es6Parser.prototype.ExpressionStatement?.name:
                return this.createExpressionStatementAst(cst);
        }
    }


    createVariableDeclarationAst(cst: SubhutiCst): SlimeVariableDeclaration {
        //直接返回声明
        //                 this.Statement()
        //                 this.Declaration()
        const astName = checkCstName(cst, Es6Parser.prototype.VariableDeclaration?.name);
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
            .filter(item => item.name === Es6Parser.prototype.VariableDeclarator?.name)
            .map(item => this.createVariableDeclaratorAst(item)) as any[]
        return declarations
    }

    createClassDeclarationAst(cst: SubhutiCst): SlimeClassDeclaration {
        // 检查 CST 节点名称是否为 ClassDeclaration
        const astName = checkCstName(cst, Es6Parser.prototype.ClassDeclaration?.name);

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
        const astName = checkCstName(cst, Es6Parser.prototype.ClassTail?.name);
        let bodyIndex = 1 // 默认 ClassBody 在索引 1
        let superClass: SlimeExpression | null = null // 超类默认为 null
        if (cst.children[0] && cst.children[0].name === Es6Parser.prototype.ClassHeritage?.name) {
            superClass = this.createClassHeritageAst(cst.children[0]) // 如果存在 ClassHeritage 则解析 superClass
            bodyIndex = 2 // ClassBody 顺延到索引 2
        }
        const body = this.createClassBodyAst(cst.children[bodyIndex]) // 解析类主体
        return {superClass, body} // 返回组合结果，方便上层使用
    }

    createClassHeritageAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassHeritage?.name);
        return this.createLeftHandSideExpressionAst(cst.children[1]) // ClassHeritage -> extends + LeftHandSideExpression
    }

    createClassBodyItemAst(staticCst: SubhutiCst, cst: SubhutiCst): SlimeMethodDefinition | SlimePropertyDefinition {
        if (cst.name === Es6Parser.prototype.MethodDefinition?.name) {
            return this.createMethodDefinitionAst(staticCst, cst)
        } else if (cst.name === Es6Parser.prototype.PropertyDefinition?.name) {
            return this.createPropertyDefinitionAst(cst)
        } else if (cst.name === Es6Parser.prototype.FieldDefinition?.name) {
            return this.createFieldDefinitionAst(staticCst, cst)
        }
        // 如果是其他类型，返回undefined（会被过滤）
        return undefined as any
    }

    createInitializerAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.Initializer?.name);
        // Initializer -> Eq + AssignmentExpression
        const assignmentExpressionCst = cst.children[1]
        return this.createAssignmentExpressionAst(assignmentExpressionCst)
    }

    createFieldDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimePropertyDefinition {
        const astName = checkCstName(cst, Es6Parser.prototype.FieldDefinition?.name);

        // FieldDefinition -> (ClassElementName | PropertyName) + Initializer?
        // ES2022: ClassElementName = PrivateIdentifier | PropertyName
        const elementNameCst = cst.children[0]
        const key = this.createClassElementNameOrPropertyNameAst(elementNameCst)

        // 检查是否有初始化器
        let value: SlimeExpression | null = null
        if (cst.children.length > 1) {
            const initializerCst = cst.children[1]
            if (initializerCst && initializerCst.name === Es6Parser.prototype.Initializer?.name) {
                value = this.createInitializerAst(initializerCst)
            }
        }

        // 检查是否有 static 修饰符
        const isStatic = staticCst && staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name

        return SlimeAstUtil.createPropertyDefinition(key, value, isStatic || false)
    }

    /**
     * 处理 ClassElementName（ES2022）或 PropertyName（ES6）
     *
     * ClassElementName (ES2022) ::
     *     PrivateIdentifier
     *     PropertyName
     *
     * 兼容性：自动识别并处理两种情况
     */
    createClassElementNameOrPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral | SlimeExpression {
        if (!cst || !cst.children) {
            throw new Error('createClassElementNameOrPropertyNameAst: invalid cst')
        }

        // ES2022: ClassElementName
        if (cst.name === 'ClassElementName') {
            const first = cst.children[0]
            if (!first) {
                throw new Error('createClassElementNameOrPropertyNameAst: ClassElementName has no children')
            }
            if (first.name === 'PrivateIdentifier') {
                return this.createPrivateIdentifierAst(first)
            } else if (first.name === Es6Parser.prototype.PropertyName?.name || first.name === 'PropertyName') {
                return this.createPropertyNameAst(first)
            }
            // 回退：尝试直接作为PropertyName处理
            return this.createPropertyNameAst(first)
        }
        // ES6: PropertyName
        else if (cst.name === Es6Parser.prototype.PropertyName?.name || cst.name === 'PropertyName') {
            return this.createPropertyNameAst(cst)
        }
        // 未知情况：尝试作为PropertyName处理
        return this.createPropertyNameAst(cst)
    }

    /**
     * 创建 PrivateIdentifier 的AST节点（ES2022）
     *
     * PrivateIdentifier :: # IdentifierName
     *
     * AST表示：Identifier节点，name以#开头
     * 例如：{ type: "Identifier", name: "#count" }
     */
    createPrivateIdentifierAst(cst: SubhutiCst): SlimeIdentifier {
        // Es2025Parser: PrivateIdentifier 是一个直接的 token，value 已经包含 #
        // 例如：{ name: 'PrivateIdentifier', value: '#count' }
        if (cst.value) {
            // 直接使用 token 的 value，解码 Unicode 转义序列
            const rawName = cst.value as string
            const decodedName = decodeUnicodeEscapes(rawName)
            // 如果 value 已经以 # 开头，直接使用；否则添加 #
            return SlimeAstUtil.createIdentifier(decodedName.startsWith('#') ? decodedName : '#' + decodedName)
        }

        // 旧版兼容：PrivateIdentifier -> HashTok + IdentifierName
        if (cst.children && cst.children.length >= 2) {
            const identifierNameCst = cst.children[1]
            const identifierCst = identifierNameCst.children[0]
            const rawName = identifierCst.value as string
            const decodedName = decodeUnicodeEscapes(rawName)
            return SlimeAstUtil.createIdentifier('#' + decodedName)
        }

        // 如果只有一个子节点，可能是直接的 IdentifierName
        if (cst.children && cst.children.length === 1) {
            const child = cst.children[0]
            if (child.value) {
                const decodedName = decodeUnicodeEscapes(child.value as string)
                return SlimeAstUtil.createIdentifier('#' + decodedName)
            }
        }

        throw new Error('createPrivateIdentifierAst: 无法解析 PrivateIdentifier')
    }

    createClassBodyAst(cst: SubhutiCst): SlimeClassBody {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassBody?.name);
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
        const astName = checkCstName(cst, Es6Parser.prototype.FormalParameterList?.name);

        if (!cst.children || cst.children.length === 0) {
            return []
        }

        const params: SlimePattern[] = []
        const firstChild = cst.children[0]

        // FormalParameterList有两种情况：
        // 1. FunctionRestParameter - 只有rest参数
        // 2. FormalParameterListFormalsList - 包含普通参数列表和可选rest参数

        if (firstChild.name === 'FunctionRestParameter') {
            // 情况1: 只有rest参数 (...args)
            const restElement = this.createBindingRestElementAst(firstChild.children[0])
            params.push(restElement)
        } else if (firstChild.name === 'FormalParameterListFormalsList') {
            // 情况2: 普通参数列表 + 可选rest参数
            // FormalParameterListFormalsList包含: FormalsList [, FunctionRestParameter]
            for (const child of firstChild.children) {
                if (child.name === 'FormalsList') {
                    // 处理普通参数列表
                    params.push(...this.createFormalsListAst(child))
                } else if (child.name === 'CommaFunctionRestParameter') {
                    // 处理结尾的rest参数
                    const functionRestParam = child.children.find((c: any) => c.name === 'FunctionRestParameter')
                    if (functionRestParam) {
                        const restElement = this.createBindingRestElementAst(functionRestParam.children[0])
                        params.push(restElement)
                    }
                }
            }
        }

        return params
    }

    /**
     * 创建 FormalsList AST
     * FormalsList: FormalParameter (, FormalParameter)*
     */
    createFormalsListAst(cst: SubhutiCst): SlimePattern[] {
        const params: SlimePattern[] = []

        for (const child of cst.children) {
            if (child.name === 'FormalParameter') {
                params.push(this.createFormalParameterAst(child))
            }
            // 忽略 Comma
        }

        return params
    }

    /**
     * 创建 RestParameter AST（新规则）
     */
    createRestParameterAst(cst: SubhutiCst): SlimeRestElement {
        checkCstName(cst, Es6Parser.prototype.RestParameter?.name);

        // RestParameter: Ellipsis + (BindingIdentifier | BindingPattern)
        // children[0]: Ellipsis
        // children[1]: BindingIdentifier 或 BindingPattern

        const argumentCst = cst.children[1]
        let argument: SlimePattern

        if (argumentCst.name === Es6Parser.prototype.BindingIdentifier?.name) {
            argument = this.createBindingIdentifierAst(argumentCst)
        } else if (argumentCst.name === Es6Parser.prototype.BindingPattern?.name) {
            argument = this.createBindingPatternAst(argumentCst)
        } else {
            throw new Error(`Unexpected RestParameter argument: ${argumentCst.name}`)
        }

        return {
            type: SlimeAstType.RestElement,
            argument: argument,
            loc: cst.loc
        } as any
    }

    /**
     * 创建 FormalParameter AST（新规则）
     */
    createFormalParameterAst(cst: SubhutiCst): SlimePattern {
        checkCstName(cst, Es6Parser.prototype.FormalParameter?.name);

        // FormalParameter 可能是：
        // 1. BindingElement (普通参数或带默认值)
        // 2. 其他形式

        if (!cst.children || cst.children.length === 0) {
            throw new Error('FormalParameter has no children')
        }

        const first = cst.children[0]

        if (first.name === Es6Parser.prototype.BindingElement?.name) {
            return this.createBindingElementAst(first)
        } else {
            throw new Error(`Unexpected FormalParameter child: ${first.name}`)
        }
    }

    createFormalParameterListFormalsListAst(cst: SubhutiCst): SlimePattern[] {
        const astName = checkCstName(cst, Es6Parser.prototype.FormalParameterListFormalsList?.name);
        const first = cst.children[0]
        const ary: SlimePattern[] = []
        for (const child of cst.children) {
            if (child.name === Es6Parser.prototype.FormalsList?.name) {
                const childAry = this.createFormalsListAst(child)
                ary.push(...childAry)
            } else if (child.name === Es6Parser.prototype.CommaFunctionRestParameter?.name) {
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
        const astName = checkCstName(cst, Es6Parser.prototype.FormalsList?.name);
        const ary = []
        for (const child of cst.children) {
            if (child.name === Es6Parser.prototype.FormalParameter?.name) {
                const item = this.createFormalParameterAst(child)
                ary.push(item)
            } else if (child.name === Es6TokenConsumer.prototype.Comma?.name) {

            } else {
                throw new Error('不支持的类型')
            }
        }
        return ary
    }

    createFormalParameterAst(cst: SubhutiCst): SlimeIdentifier {
        const astName = checkCstName(cst, Es6Parser.prototype.FormalParameter?.name);
        //BindingElement
        const first = cst.children[0]
        return this.createBindingElementAst(first)
    }

    createBindingElementAst(cst: SubhutiCst): any {
        const astName = checkCstName(cst, Es6Parser.prototype.BindingElement?.name);
        const first = cst.children[0]

        if (first.name === Es6Parser.prototype.SingleNameBinding?.name) {
            return this.createSingleNameBindingAst(first)
        } else if (first.name === Es6Parser.prototype.BindingPattern?.name) {
            // 解构参数：function({name, age}) 或 function([a, b])
            return this.createBindingPatternAst(first)
        }
        return this.createSingleNameBindingAst(first)
    }

    createSingleNameBindingAst(cst: SubhutiCst): any {
        const astName = checkCstName(cst, Es6Parser.prototype.SingleNameBinding?.name);
        //BindingIdentifier + Initializer?
        const first = cst.children[0]
        const id = this.createBindingIdentifierAst(first)

        // 检查是否有默认值（Initializer）
        const initializer = cst.children.find(ch => ch.name === Es6Parser.prototype.Initializer?.name)
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
        const astName = checkCstName(cst, Es6Parser.prototype.FunctionRestParameter?.name);
        const first = cst.children[0]
        return this.createBindingRestElementAst(first)
    }

    createBindingRestElementAst(cst: SubhutiCst): SlimeRestElement {
        const astName = checkCstName(cst, Es6Parser.prototype.BindingRestElement?.name);
        // BindingRestElement: ... BindingIdentifier | ... BindingPattern
        const argumentCst = cst.children[1]

        let argument: SlimeIdentifier | SlimePattern

        if (argumentCst.name === Es6Parser.prototype.BindingIdentifier?.name) {
            // 简单情况：...rest
            argument = this.createBindingIdentifierAst(argumentCst)
        } else if (argumentCst.name === Es6Parser.prototype.BindingPattern?.name) {
            // 嵌套解构：...[a, b] 或 ...{x, y}
            argument = this.createBindingPatternAst(argumentCst)
        } else {
            throw new Error(`BindingRestElement: 不支持的类型 ${argumentCst.name}`)
        }

        return SlimeAstUtil.createRestElement(argument)
    }

    createPropertyNameMethodDefinitionAst(cst: SubhutiCst): SlimeFunctionExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.PropertyNameMethodDefinition?.name);

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
        if (PropertyNameFirst.name === Es6Parser.prototype.LiteralPropertyName?.name) {
            const LiteralPropertyNameFirst = PropertyNameFirst.children[0]
            const functionName = LiteralPropertyNameFirst.value
            functionExpression.id = SlimeAstUtil.createIdentifier(functionName, LiteralPropertyNameFirst.loc)
        } else if (PropertyNameFirst.name === Es6Parser.prototype.ComputedPropertyName?.name) {
            // 计算属性名，不设置id（匿名函数）
            functionExpression.id = null
        }

        return functionExpression
    }

    createFunctionFormalParametersBodyDefineAst(cst: SubhutiCst, startLoc: SubhutiSourceLocation): SlimeFunctionExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.FunctionFormalParametersBodyDefine?.name);
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
        const astName = checkCstName(cst, Es6Parser.prototype.FunctionBodyDefine?.name);
        // 检查是否存在FunctionBody（children[1]可能不存在）
        if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.FunctionBody?.name) {
            const first1 = cst.children[1]
            const body = this.createFunctionBodyAst(first1)
            return SlimeAstUtil.createBlockStatement(null, null, body, cst.loc)
        }
        return SlimeAstUtil.createBlockStatement(null, null, [])
    }

    createFunctionBodyAst(cst: SubhutiCst): Array<SlimeStatement> {
        // FunctionBody: FunctionStatementList | StatementList
        // GeneratorBody, AsyncFunctionBody, AsyncGeneratorBody 都包含 FunctionBody
        const children = cst.children || []

        if (children.length === 0) {
            return []
        }

        const first = children[0]
        if (!first) {
            return []
        }

        const name = first.name

        // Handle nested FunctionBody (from GeneratorBody, AsyncFunctionBody, AsyncGeneratorBody)
        if (name === 'FunctionBody' || name === Es6Parser.prototype.FunctionBody?.name) {
            return this.createFunctionBodyAst(first)
        }

        // Handle FunctionStatementList (ES2025)
        if (name === 'FunctionStatementList' || name === Es6Parser.prototype.FunctionStatementList?.name) {
            return this.createFunctionStatementListAst(first)
        }

        // Handle StatementList (legacy)
        if (name === 'StatementList' || name === Es6Parser.prototype.StatementList?.name) {
            return this.createStatementListAst(first)
        }

        // If the first child is a statement directly, process it
        return this.createStatementListAst(first)
    }

    createFunctionStatementListAst(cst: SubhutiCst): Array<SlimeStatement> {
        // FunctionStatementList: StatementList?
        const children = cst.children || []

        if (children.length === 0) {
            return []
        }

        const first = children[0]
        if (!first) {
            return []
        }

        // If child is StatementList, process it
        if (first.name === 'StatementList' || first.name === Es6Parser.prototype.StatementList?.name) {
            return this.createStatementListAst(first)
        }

        // If child is a statement directly
        return this.createStatementListItemAst(first)
    }

    createFunctionFormalParametersAst(cst: SubhutiCst): SlimeFunctionParams {
        const astName = checkCstName(cst, Es6Parser.prototype.FunctionFormalParameters?.name);
        const lp = SlimeAstUtil.createLParen(cst.children[0].loc)
        const rp = SlimeAstUtil.createRParen(cst.children[cst.children.length - 1].loc)
        // 检查是否存在参数列表（children[1]可能不存在）
        if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.FormalParameterList?.name) {
            const FormalParameterListCst = cst.children[1]
            const params = this.createFormalParameterListAst(FormalParameterListCst)
            return SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
        }
        return SlimeAstUtil.createFunctionParams(lp, rp, cst.loc)
    }

    createMethodDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // 注意：参数顺序是 (staticCst, cst)，与调用保持一致
        const astName = checkCstName(cst, Es6Parser.prototype.MethodDefinition?.name);
        const first = cst.children?.[0]

        if (!first) {
            throw new Error('MethodDefinition has no children')
        }

        if (first.name === Es6Parser.prototype.PropertyNameMethodDefinition?.name) {
            // 旧版兼容：PropertyNameMethodDefinition
            // 检查是否有async
            let offset = 0;
            if (first.children[0] && first.children[0].name === 'AsyncTok') {
                offset = 1;
            }

            const elementNameCst = first.children[0 + offset]  // PropertyName or ClassElementName (ES2022)
            const SlimeFunctionExpression = this.createPropertyNameMethodDefinitionAst(first)

            // 获取key：支持 PropertyName 和 ClassElementName（含 PrivateIdentifier）
            let key: any = SlimeFunctionExpression.id
            let computed = false

            // ES2022: 支持 ClassElementName（包含PrivateIdentifier）
            if (elementNameCst.name === 'ClassElementName') {
                key = this.createClassElementNameOrPropertyNameAst(elementNameCst)
                // PrivateIdentifier不支持计算属性
            }
            // ES6: 支持 PropertyName（包含ComputedPropertyName）
            else if (elementNameCst.name === Es6Parser.prototype.PropertyName?.name) {
                if (elementNameCst.children[0].name === Es6Parser.prototype.ComputedPropertyName?.name) {
                    // 计算属性名
                    key = this.createAssignmentExpressionAst(elementNameCst.children[0].children[1])
                    computed = true
                }
            }

            const methodDef = SlimeAstUtil.createMethodDefinition(key, SlimeFunctionExpression)
            methodDef.computed = computed

            // ✅ 关键修复点：识别 constructor
            const isConstructor =
                key.type === "Identifier" &&
                key.name === "constructor" &&
                !(staticCst && staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)

            // 如果有 static 修饰符
            if (staticCst && staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name) {
                methodDef.static = true
            }

            // 正确标记 kind
            if (isConstructor) {
                methodDef.kind = "constructor"
            }

            return methodDef
        } else if (first.name === 'ClassElementName') {
            // Es2025Parser: ClassElementName ( UniqueFormalParameters ) { FunctionBody }
            // children: [ClassElementName, LParen, UniqueFormalParameters?, RParen, LBrace, FunctionBody?, RBrace]
            return this.createEs2025MethodDefinitionAst(staticCst, cst)
        } else if (first.name === Es6Parser.prototype.GetMethodDefinition?.name) {
            // getter方法
            const elementNameCst = first.children[1] // GetTok后是PropertyName or ClassElementName (ES2022)
            const key = this.createClassElementNameOrPropertyNameAst(elementNameCst)
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
        } else if (first.name === 'GetTok') {
            // Es2025Parser: get ClassElementName ( ) { FunctionBody }
            // children: [GetTok, ClassElementName, LParen, RParen, LBrace, FunctionBody?, RBrace]
            return this.createEs2025GetterMethodAst(staticCst, cst)
        } else if (first.name === Es6Parser.prototype.SetMethodDefinition?.name) {
            // setter方法
            const propertyNameMethodCst = first.children[1] // SetTok后是PropertyNameMethodDefinition
            const SlimeFunctionExpression = this.createPropertyNameMethodDefinitionAst(propertyNameMethodCst)
            const methodDef = SlimeAstUtil.createMethodDefinition(SlimeFunctionExpression.id, SlimeFunctionExpression)
            methodDef.kind = 'set'

            return methodDef
        } else if (first.name === 'SetTok') {
            // Es2025Parser: set ClassElementName ( PropertySetParameterList ) { FunctionBody }
            return this.createEs2025SetterMethodAst(staticCst, cst)
        } else if (first.name === Es6Parser.prototype.GeneratorMethod?.name || first.name === 'GeneratorMethod') {
            // generator方法：*methodName() { yield ... }
            return this.createEs2025GeneratorMethodAst(staticCst, first)
        } else if (first.name === 'AsyncMethod' || first.name === Es6Parser.prototype.AsyncMethod?.name) {
            // async方法
            return this.createEs2025AsyncMethodAst(staticCst, first)
        } else if (first.name === 'AsyncGeneratorMethod' || first.name === Es6Parser.prototype.AsyncGeneratorMethod?.name) {
            // async generator方法
            return this.createEs2025AsyncGeneratorMethodAst(staticCst, first)
        } else if (first.name === 'Asterisk') {
            // Es2025Parser: * ClassElementName ( UniqueFormalParameters ) { GeneratorBody }
            // 这种情况下整个cst就是GeneratorMethod的children
            return this.createEs2025GeneratorMethodFromChildren(staticCst, cst)
        } else if (first.name === 'AsyncTok') {
            // Es2025Parser: async [no LineTerminator here] ClassElementName ( ... ) { ... }
            // 可能是 AsyncMethod 或 AsyncGeneratorMethod
            return this.createEs2025AsyncMethodFromChildren(staticCst, cst)
        } else if (first.name === 'IdentifierNameTok' || first.name === 'IdentifierName' ||
                   first.name === 'PropertyName' || first.name === 'LiteralPropertyName') {
            // Es2025Parser: 直接的标识符作为方法名
            // 这种情况下，第一个子节点是方法名，后面是 LParen, UniqueFormalParameters, RParen, LBrace, FunctionBody, RBrace
            return this.createEs2025MethodDefinitionFromIdentifier(staticCst, cst)
        } else {
            throw new Error('不支持的类型: ' + first.name)
        }
    }

    /**
     * Es2025Parser: 从直接的标识符创建方法定义
     * IdentifierNameTok ( UniqueFormalParameters ) { FunctionBody }
     */
    createEs2025MethodDefinitionFromIdentifier(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        let i = 0
        const children = cst.children

        // 第一个子节点是方法名（可能是 IdentifierNameTok, IdentifierName, PropertyName, LiteralPropertyName）
        const firstChild = children[i++]
        let key: SlimeIdentifier | SlimeLiteral | SlimeExpression

        if (firstChild.name === 'IdentifierNameTok') {
            // 直接的 token
            key = SlimeAstUtil.createIdentifier(firstChild.value, firstChild.loc)
        } else if (firstChild.name === 'IdentifierName') {
            // IdentifierName 规则节点
            const tokenCst = firstChild.children[0]
            key = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
        } else if (firstChild.name === 'PropertyName' || firstChild.name === 'LiteralPropertyName') {
            key = this.createPropertyNameAst(firstChild)
        } else {
            key = this.createClassElementNameOrPropertyNameAst(firstChild)
        }

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // UniqueFormalParameters
        let params: SlimePattern[] = []
        if (children[i]?.name === 'UniqueFormalParameters' || children[i]?.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
            params = this.createUniqueFormalParametersAst(children[i])
            i++
        } else if (children[i]?.name === 'FormalParameters' || children[i]?.name === Es6Parser.prototype.FormalParameters?.name) {
            params = this.createFormalParametersAst(children[i])
            i++
        }

        // 跳过 RParen, LBrace
        if (children[i]?.name === 'RParen') i++
        if (children[i]?.name === 'LBrace') i++

        // FunctionBody
        let body: SlimeBlockStatement
        if (children[i]?.name === 'FunctionBody' || children[i]?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(children[i])
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, children[i].loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        // 创建函数表达式
        const functionExpression = SlimeAstUtil.createFunctionExpression(body, null, params, cst.loc)

        const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression)

        // 检查是否是 constructor
        const isConstructor = key.type === "Identifier" && (key as SlimeIdentifier).name === "constructor" &&
            !(staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name))

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        if (isConstructor) {
            methodDef.kind = "constructor"
        }

        return methodDef
    }

    /**
     * Es2025Parser: 普通方法定义
     * ClassElementName ( UniqueFormalParameters ) { FunctionBody }
     */
    createEs2025MethodDefinitionAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // children: [ClassElementName, LParen, UniqueFormalParameters?, RParen, LBrace, FunctionBody?, RBrace]
        let i = 0
        const children = cst.children

        // ClassElementName
        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // UniqueFormalParameters
        let params: SlimePattern[] = []
        if (children[i]?.name === 'UniqueFormalParameters' || children[i]?.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
            params = this.createUniqueFormalParametersAst(children[i])
            i++
        } else if (children[i]?.name === 'FormalParameters' || children[i]?.name === Es6Parser.prototype.FormalParameters?.name) {
            params = this.createFormalParametersAst(children[i])
            i++
        }

        // 跳过 RParen, LBrace
        if (children[i]?.name === 'RParen') i++
        if (children[i]?.name === 'LBrace') i++

        // FunctionBody
        let body: SlimeBlockStatement
        if (children[i]?.name === 'FunctionBody' || children[i]?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(children[i])
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, children[i].loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        // 创建函数表达式
        const functionExpression = SlimeAstUtil.createFunctionExpression(body, null, params, cst.loc)

        const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression)

        // 检查是否是 constructor
        const isConstructor = key.type === "Identifier" && key.name === "constructor" &&
            !(staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name))

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        if (isConstructor) {
            methodDef.kind = "constructor"
        }

        return methodDef
    }

    /**
     * Es2025Parser: getter方法
     */
    createEs2025GetterMethodAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // children: [GetTok, ClassElementName, LParen, RParen, LBrace, FunctionBody?, RBrace]
        const children = cst.children
        let i = 1 // 跳过 GetTok

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen, RParen, LBrace
        while (i < children.length && ['LParen', 'RParen', 'LBrace'].includes(children[i]?.name)) i++

        // FunctionBody
        let body: SlimeBlockStatement
        if (children[i]?.name === 'FunctionBody' || children[i]?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(children[i])
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, children[i].loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const methodDef = SlimeAstUtil.createMethodDefinition(key, {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: body
        } as any)
        methodDef.kind = 'get'

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        return methodDef
    }

    /**
     * Es2025Parser: setter方法
     */
    createEs2025SetterMethodAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // children: [SetTok, ClassElementName, LParen, PropertySetParameterList, RParen, LBrace, FunctionBody?, RBrace]
        const children = cst.children
        let i = 1 // 跳过 SetTok

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // PropertySetParameterList
        let params: SlimePattern[] = []
        if (children[i]?.name === 'PropertySetParameterList' || children[i]?.name === Es6Parser.prototype.PropertySetParameterList?.name) {
            params = this.createPropertySetParameterListAst(children[i])
            i++
        }

        // 跳过 RParen, LBrace
        while (i < children.length && ['RParen', 'LBrace'].includes(children[i]?.name)) i++

        // FunctionBody
        let body: SlimeBlockStatement
        if (children[i]?.name === 'FunctionBody' || children[i]?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(children[i])
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, children[i].loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const methodDef = SlimeAstUtil.createMethodDefinition(key, {
            type: 'FunctionExpression',
            id: null,
            params: params,
            body: body
        } as any)
        methodDef.kind = 'set'

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        return methodDef
    }

    /**
     * Es2025Parser: generator方法 (从GeneratorMethod节点)
     */
    createEs2025GeneratorMethodAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // GeneratorMethod children: [Asterisk, ClassElementName, LParen, UniqueFormalParameters?, RParen, LBrace, GeneratorBody, RBrace]
        const children = cst.children
        let i = 1 // 跳过 Asterisk

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // UniqueFormalParameters
        let params: SlimePattern[] = []
        if (children[i]?.name === 'UniqueFormalParameters' || children[i]?.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
            params = this.createUniqueFormalParametersAst(children[i])
            i++
        }

        // 跳过 RParen, LBrace
        while (i < children.length && ['RParen', 'LBrace'].includes(children[i]?.name)) i++

        // GeneratorBody 或 FunctionBody
        let body: SlimeBlockStatement
        const bodyChild = children[i]
        if (bodyChild?.name === 'GeneratorBody' || bodyChild?.name === Es6Parser.prototype.GeneratorBody?.name ||
            bodyChild?.name === 'FunctionBody' || bodyChild?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(bodyChild)
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyChild.loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const functionExpression: any = {
            type: 'FunctionExpression',
            id: null,
            params: params,
            body: body,
            generator: true,
            async: false
        }

        const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression)
        methodDef.kind = 'method'

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        return methodDef
    }

    createEs2025GeneratorMethodFromChildren(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // 直接从MethodDefinition的children处理 [Asterisk, ClassElementName, ...]
        return this.createEs2025GeneratorMethodAst(staticCst, cst)
    }

    /**
     * Es2025Parser: async方法
     */
    createEs2025AsyncMethodAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // AsyncMethod children: [AsyncTok, ClassElementName, LParen, UniqueFormalParameters?, RParen, LBrace, AsyncFunctionBody, RBrace]
        const children = cst.children
        let i = 1 // 跳过 AsyncTok

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // UniqueFormalParameters
        let params: SlimePattern[] = []
        if (children[i]?.name === 'UniqueFormalParameters' || children[i]?.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
            params = this.createUniqueFormalParametersAst(children[i])
            i++
        }

        // 跳过 RParen, LBrace
        while (i < children.length && ['RParen', 'LBrace'].includes(children[i]?.name)) i++

        // AsyncFunctionBody 或 FunctionBody
        let body: SlimeBlockStatement
        const bodyChild = children[i]
        if (bodyChild?.name === 'AsyncFunctionBody' || bodyChild?.name === Es6Parser.prototype.AsyncFunctionBody?.name ||
            bodyChild?.name === 'FunctionBody' || bodyChild?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(bodyChild)
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyChild.loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const functionExpression: any = {
            type: 'FunctionExpression',
            id: null,
            params: params,
            body: body,
            generator: false,
            async: true
        }

        const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression)
        methodDef.kind = 'method'

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        return methodDef
    }

    createEs2025AsyncMethodFromChildren(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // 检查是否是 AsyncGeneratorMethod (async * ...)
        const children = cst.children
        if (children[1]?.name === 'Asterisk') {
            return this.createEs2025AsyncGeneratorMethodAst(staticCst, cst)
        }
        return this.createEs2025AsyncMethodAst(staticCst, cst)
    }

    /**
     * Es2025Parser: async generator方法
     */
    createEs2025AsyncGeneratorMethodAst(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        // AsyncGeneratorMethod children: [AsyncTok, Asterisk, ClassElementName, LParen, UniqueFormalParameters?, RParen, LBrace, AsyncGeneratorBody, RBrace]
        const children = cst.children
        let i = 2 // 跳过 AsyncTok 和 Asterisk

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // UniqueFormalParameters
        let params: SlimePattern[] = []
        if (children[i]?.name === 'UniqueFormalParameters' || children[i]?.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
            params = this.createUniqueFormalParametersAst(children[i])
            i++
        }

        // 跳过 RParen, LBrace
        while (i < children.length && ['RParen', 'LBrace'].includes(children[i]?.name)) i++

        // AsyncGeneratorBody 或 FunctionBody
        let body: SlimeBlockStatement
        const bodyChild = children[i]
        if (bodyChild?.name === 'AsyncGeneratorBody' || bodyChild?.name === Es6Parser.prototype.AsyncGeneratorBody?.name ||
            bodyChild?.name === 'FunctionBody' || bodyChild?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(bodyChild)
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyChild.loc)
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const functionExpression: any = {
            type: 'FunctionExpression',
            id: null,
            params: params,
            body: body,
            generator: true,
            async: true
        }

        const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression)
        methodDef.kind = 'method'

        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.name === Es6TokenConsumer.prototype.StaticTok?.name)) {
            methodDef.static = true
        }

        return methodDef
    }

    /**
     * 处理 UniqueFormalParameters CST 节点
     */
    createUniqueFormalParametersAst(cst: SubhutiCst): SlimePattern[] {
        // UniqueFormalParameters: FormalParameters
        if (!cst.children || cst.children.length === 0) {
            return []
        }
        const first = cst.children[0]
        if (first.name === 'FormalParameters' || first.name === Es6Parser.prototype.FormalParameters?.name) {
            return this.createFormalParametersAst(first)
        }
        // 可能直接是 FormalParameterList
        return this.createFormalParametersAst(cst)
    }

    /**
     * 处理 PropertySetParameterList
     */
    createPropertySetParameterListAst(cst: SubhutiCst): SlimePattern[] {
        // PropertySetParameterList: FormalParameter
        if (!cst.children || cst.children.length === 0) {
            return []
        }
        const first = cst.children[0]
        if (first.name === 'FormalParameter' || first.name === Es6Parser.prototype.FormalParameter?.name) {
            return [this.createFormalParameterAst(first)]
        }
        if (first.name === 'BindingElement' || first.name === Es6Parser.prototype.BindingElement?.name) {
            return [this.createBindingElementAst(first)]
        }
        return []
    }

    createFormalParameterAst(cst: SubhutiCst): SlimePattern {
        // FormalParameter: BindingElement
        const first = cst.children[0]
        if (first.name === 'BindingElement' || first.name === Es6Parser.prototype.BindingElement?.name) {
            return this.createBindingElementAst(first)
        }
        return this.createBindingElementAst(cst)
    }

    createBindingPatternAst(cst: SubhutiCst): SlimePattern {
        checkCstName(cst, Es6Parser.prototype.BindingPattern?.name)

        const child = cst.children[0]

        if (child.name === Es6Parser.prototype.ArrayBindingPattern?.name) {
            return this.createArrayBindingPatternAst(child)
        } else if (child.name === Es6Parser.prototype.ObjectBindingPattern?.name) {
            return this.createObjectBindingPatternAst(child)
        } else {
            throw new Error(`Unknown BindingPattern type: ${child.name}`)
        }
    }

    createArrayBindingPatternAst(cst: SubhutiCst): SlimePattern {
        checkCstName(cst, Es6Parser.prototype.ArrayBindingPattern?.name)

        // CST结构：[LBracket, BindingElementList?, RBracket]
        const elements: (SlimePattern | null)[] = []

        // 查找BindingElementList
        const bindingList = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingElementList?.name)
        if (bindingList) {
            // BindingElementList包含BindingElisionElement和Comma
            for (const child of bindingList.children) {
                if (child.name === Es6Parser.prototype.BindingElisionElement?.name) {
                    // BindingElisionElement可能包含：Elision + BindingElement
                    // 先检查是否有Elision（跳过的元素）
                    const elision = child.children.find((ch: any) =>
                        ch.name === Es6Parser.prototype.Elision?.name)
                    if (elision) {
                        // Elision可能包含多个逗号，每个逗号代表一个null
                        const commaCount = elision.children?.filter((ch: any) => ch.value === ',').length || 1
                        for (let i = 0; i < commaCount; i++) {
                            elements.push(null)
                        }
                    }

                    // 然后检查是否有BindingElement
                    const bindingElement = child.children.find((ch: any) =>
                        ch.name === Es6Parser.prototype.BindingElement?.name)

                    if (bindingElement) {
                        const firstChild = bindingElement.children[0]

                        // BindingElement可以是SingleNameBinding或BindingPattern
                        if (firstChild && firstChild.name === Es6Parser.prototype.SingleNameBinding?.name) {
                            // 情况1：SingleNameBinding（会处理默认值，生成AssignmentPattern）
                            elements.push(this.createSingleNameBindingAst(firstChild))
                        } else if (firstChild && firstChild.name === Es6Parser.prototype.BindingPattern?.name) {
                            // 情况2：嵌套的BindingPattern（如 [a, [b, c]]）
                            elements.push(this.createBindingPatternAst(firstChild))
                        }
                    }
                }
            }
        }

        // 检查是否有BindingRestElement（...rest 或 ...[a, b]）
        const restElement = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingRestElement?.name)
        if (restElement) {
            // 使用统一的方法处理，支持 BindingIdentifier 和 BindingPattern
            const restNode = this.createBindingRestElementAst(restElement)
            elements.push(restNode as any)
        }

        return {
            type: SlimeAstType.ArrayPattern,
            elements,
            loc: cst.loc
        } as any
    }

    createObjectBindingPatternAst(cst: SubhutiCst): SlimePattern {
        checkCstName(cst, Es6Parser.prototype.ObjectBindingPattern?.name)

        // CST结构：[LBrace, BindingPropertyList?, RBrace]
        const properties: any[] = []

        // 查找BindingPropertyList
        const propList = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingPropertyList?.name)
        if (propList) {
            // BindingPropertyList包含BindingProperty和Comma节点
            for (const child of propList.children) {
                if (child.name === Es6Parser.prototype.BindingProperty?.name) {
                    // BindingProperty -> SingleNameBinding (简写) 或 PropertyName + BindingElement (完整)
                    const singleName = child.children.find((ch: any) =>
                        ch.name === Es6Parser.prototype.SingleNameBinding?.name)

                    if (singleName) {
                        // 简写形式：{name} 或 {name = "Guest"}
                        // createSingleNameBindingAst会处理默认值，返回Identifier或AssignmentPattern
                        const value = this.createSingleNameBindingAst(singleName)
                        // key始终是Identifier（没有默认值）
                        const identifier = singleName.children.find((ch: any) =>
                            ch.name === Es6Parser.prototype.BindingIdentifier?.name)
                        const key = this.createBindingIdentifierAst(identifier)

                        properties.push({
                            type: SlimeAstType.Property,
                            key: key,
                            value: value,
                            kind: 'init',
                            computed: false,
                            shorthand: true,
                            loc: child.loc
                        })
                    } else {
                        // 完整形式：{name: userName}
                        const propName = child.children.find((ch: any) =>
                            ch.name === Es6Parser.prototype.PropertyName?.name)
                        const bindingElement = child.children.find((ch: any) =>
                            ch.name === Es6Parser.prototype.BindingElement?.name)

                        if (propName && bindingElement) {
                            // PropertyName可能包含LiteralPropertyName或ComputedPropertyName
                            // 需要递归找到Identifier token
                            const key = this.createPropertyNameAst(propName)

                            // BindingElement可能是SingleNameBinding或BindingPattern
                            const value = this.createBindingElementAst(bindingElement)

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

        // ES2018: 检查是否有BindingRestElement（...rest）
        const restElement = cst.children.find(ch => ch.name === Es6Parser.prototype.BindingRestElement?.name)
        if (restElement) {
            // BindingRestElement -> Ellipsis + BindingIdentifier
            const identifier = restElement.children.find((ch: any) =>
                ch.name === Es6Parser.prototype.BindingIdentifier?.name)
            if (identifier) {
                const restId = this.createBindingIdentifierAst(identifier)
                const restNode = {
                    type: SlimeAstType.RestElement,
                    argument: restId,
                    loc: restElement.loc
                }
                properties.push(restNode as any)
            }
        }

        return {
            type: SlimeAstType.ObjectPattern,
            properties,
            loc: cst.loc
        } as any
    }

    createFunctionExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.FunctionExpression?.name);
        // Es2025Parser FunctionExpression 结构：
        // children[0]: FunctionTok
        // children[1]: BindingIdentifier (可选，函数名) 或 LParen
        // children[2]: LParen 或 FormalParameters
        // children[3]: FormalParameters 或 RParen
        // children[4]: RParen 或 LBrace
        // children[5]: LBrace 或 FunctionBody
        // children[6]: FunctionBody 或 RBrace
        // children[7]: RBrace (如果有)

        let isAsync = false;
        let functionId: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        let i = 0

        // 跳过 FunctionTok
        if (cst.children[i]?.name === 'FunctionTok') {
            i++
        }

        // 检查是否有 BindingIdentifier（命名函数表达式）
        if (cst.children[i]?.name === Es6Parser.prototype.BindingIdentifier?.name || cst.children[i]?.name === 'BindingIdentifier') {
            functionId = this.createBindingIdentifierAst(cst.children[i])
            i++
        }

        // 跳过 LParen
        if (cst.children[i]?.name === 'LParen') {
            i++
        }

        // 处理 FormalParameters
        if (cst.children[i]?.name === Es6Parser.prototype.FormalParameters?.name || cst.children[i]?.name === 'FormalParameters') {
            params = this.createFormalParametersAst(cst.children[i])
            i++
        }

        // 跳过 RParen
        if (cst.children[i]?.name === 'RParen') {
            i++
        }

        // 跳过 LBrace
        if (cst.children[i]?.name === 'LBrace') {
            i++
        }

        // 处理 FunctionBody
        if (cst.children[i]?.name === Es6Parser.prototype.FunctionBody?.name || cst.children[i]?.name === 'FunctionBody') {
            const bodyStatements = this.createFunctionBodyAst(cst.children[i])
            body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, cst.children[i].loc)
            i++
        } else {
            // 空函数体
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        // 创建函数表达式
        const functionExpression = SlimeAstUtil.createFunctionExpression(body, functionId, params, cst.loc)
        functionExpression.async = isAsync

        return functionExpression
    }

    /**
     * 处理 FormalParameters CST 节点
     */
    createFormalParametersAst(cst: SubhutiCst): SlimePattern[] {
        // FormalParameters 可能包含 FormalParameterList 或为空
        if (!cst.children || cst.children.length === 0) {
            return []
        }

        const first = cst.children[0]
        if (first.name === Es6Parser.prototype.FormalParameterList?.name || first.name === 'FormalParameterList') {
            return this.createFormalParameterListAst(first)
        }

        // 尝试直接处理为参数列表
        return this.createFormalParameterListAst(cst)
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
        if (cst.name === Es6Parser.prototype.StatementList?.name) {
            statements = this.createStatementListAst(cst)
        }
        // 如果是 BlockStatement，需要提取 Block -> StatementList
        else if (cst.name === Es6Parser.prototype.BlockStatement?.name) {
            // BlockStatement -> Block -> StatementList
            const blockCst = cst.children?.[0]
            if (blockCst && blockCst.name === Es6Parser.prototype.Block?.name) {
                // Block 的结构：LBrace StatementList RBrace
                const statementListCst = blockCst.children?.find(
                    child => child.name === Es6Parser.prototype.StatementList?.name
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
            type: Es6Parser.prototype.BlockStatement?.name as any,
            body: statements,
            loc: cst.loc
        }
        return ast
    }

    createReturnStatementAst(cst: SubhutiCst): SlimeReturnStatement {
        const astName = checkCstName(cst, Es6Parser.prototype.ReturnStatement?.name);
        const ast: SlimeReturnStatement = {
            type: astName as any,
            argument: this.createExpressionAst(cst.children[1]),
            loc: cst.loc
        } as any
        return ast
    }

    createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement {
        const astName = checkCstName(cst, Es6Parser.prototype.ExpressionStatement?.name);
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
        checkCstName(cst, Es6Parser.prototype.IfStatement?.name);
        // if (Expression) IfStatementBody [else IfStatementBody]
        const test = this.createExpressionAst(cst.children[2])  // 条件表达式

        // 处理 then 分支 - 使用 createStatementDeclarationAst 来处理 IfStatementBody
        const consequent = this.createStatementDeclarationAst(cst.children[4])

        // 检查是否有 else 分支
        let alternate = null
        if (cst.children.length > 5 && cst.children[5]) {
            alternate = this.createStatementDeclarationAst(cst.children[6])
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
        checkCstName(cst, Es6Parser.prototype.ForStatement?.name);

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
            if (node.name === Es6Parser.prototype.VariableDeclaration?.name) {
                init = this.createVariableDeclarationAst(node)
                idx++
            } else if (node.name === Es6Parser.prototype.Expression?.name) {
                init = this.createExpressionAst(node)
                idx++
            }
        }

        // test: 第二个节点（如果是Expression）
        if (idx < loopParts.length && loopParts[idx].name === Es6Parser.prototype.Expression?.name) {
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
        if (idx < loopParts.length && loopParts[idx].name === Es6Parser.prototype.Expression?.name) {
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
        checkCstName(cst, Es6Parser.prototype.ForInOfStatement?.name);

        // ForInOfStatement 结构（多种形式）：
        // 普通 for-in/of: [ForTok, LParen, ForDeclaration, InTok/OfTok, Expression, RParen, Statement]
        // for await: [ForTok, AwaitTok, LParen, ForDeclaration, OfTok, AssignmentExpression, RParen, Statement]

        // 检查是否是 for await
        const hasAwait = cst.children.some(ch => ch.name === 'AwaitTok')

        // 动态查找各个部分
        let left: any = null
        let right: any = null
        let body: any = null
        let isForOf = false

        // 查找 ForDeclaration 或 LeftHandSideExpression
        const forDeclarationCst = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.ForDeclaration?.name ||
            ch.name === 'ForDeclaration'
        )
        const leftHandSideCst = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.LeftHandSideExpression?.name ||
            ch.name === 'LeftHandSideExpression'
        )
        const varBindingCst = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.ForBinding?.name ||
            ch.name === 'ForBinding'
        )

        if (forDeclarationCst) {
            // ForDeclaration 内部是 LetOrConst + ForBinding
            const letOrConstCst = forDeclarationCst.children[0]
            const forBindingCst = forDeclarationCst.children[1]

            // ForBinding可能是BindingIdentifier或BindingPattern
            const actualBinding = forBindingCst.children[0]
            let id;

            if (actualBinding.name === Es6Parser.prototype.BindingPattern?.name || actualBinding.name === 'BindingPattern') {
                id = this.createBindingPatternAst(actualBinding);
            } else if (actualBinding.name === Es6Parser.prototype.BindingIdentifier?.name || actualBinding.name === 'BindingIdentifier') {
                id = this.createBindingIdentifierAst(actualBinding);
            } else {
                id = this.createBindingIdentifierAst(actualBinding);
            }

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
        } else if (leftHandSideCst) {
            left = this.createLeftHandSideExpressionAst(leftHandSideCst)
        } else if (varBindingCst) {
            // var ForBinding
            const actualBinding = varBindingCst.children[0]
            let id;
            if (actualBinding.name === Es6Parser.prototype.BindingPattern?.name || actualBinding.name === 'BindingPattern') {
                id = this.createBindingPatternAst(actualBinding);
            } else {
                id = this.createBindingIdentifierAst(actualBinding);
            }
            left = {
                type: SlimeAstType.VariableDeclaration,
                declarations: [{
                    type: SlimeAstType.VariableDeclarator,
                    id: id,
                    init: null,
                    loc: varBindingCst.loc
                }],
                kind: {
                    type: 'VariableDeclarationKind',
                    value: 'var',
                    loc: cst.children.find(ch => ch.name === 'VarTok')?.loc
                },
                loc: varBindingCst.loc
            }
        }

        // 查找 in/of token
        const inOrOfCst = cst.children.find(ch =>
            ch.name === 'InTok' || ch.name === 'OfTok' ||
            ch.value === 'in' || ch.value === 'of'
        )
        isForOf = inOrOfCst?.value === 'of' || inOrOfCst?.name === 'OfTok'

        // 查找 right expression (在 in/of 之后)
        const inOrOfIndex = cst.children.indexOf(inOrOfCst)
        if (inOrOfIndex !== -1 && inOrOfIndex + 1 < cst.children.length) {
            const rightCst = cst.children[inOrOfIndex + 1]
            if (rightCst.name !== 'RParen') {
                right = this.createExpressionAst(rightCst)
            }
        }

        // 查找 Statement (body)
        const statementCst = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.Statement?.name ||
            ch.name === 'Statement'
        )
        if (statementCst) {
            const bodyStatements = this.createStatementAst(statementCst)
            body = Array.isArray(bodyStatements) && bodyStatements.length > 0
                ? bodyStatements[0]
                : bodyStatements
        }

        const result: any = {
            type: isForOf ? SlimeAstType.ForOfStatement : SlimeAstType.ForInStatement,
            left: left,
            right: right,
            body: body,
            loc: cst.loc
        }

        // for await 需要设置 await 属性
        if (hasAwait) {
            result.await = true
        }

        return result
    }

    /**
     * 创建 while 语句 AST
     */
    createWhileStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.WhileStatement?.name);
        // WhileStatement: WhileTok LParen Expression RParen Statement
        // children[0]: WhileTok
        // children[1]: LParen
        // children[2]: Expression
        // children[3]: RParen
        // children[4]: Statement

        const expression = cst.children.find(ch => ch.name === Es6Parser.prototype.Expression?.name)
        const statement = cst.children.find(ch => ch.name === Es6Parser.prototype.Statement?.name)

        const test = expression ? this.createExpressionAst(expression) : null
        // createStatementAst返回数组，取第一个元素
        const bodyArray = statement ? this.createStatementAst(statement) : []
        const body = bodyArray.length > 0 ? bodyArray[0] : null

        return {
            type: SlimeAstType.WhileStatement,
            test: test,
            body: body,
            loc: cst.loc
        }
    }

    /**
     * 创建 do...while 语句 AST
     */
    createDoWhileStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.DoWhileStatement?.name);
        return {
            type: SlimeAstType.DoWhileStatement,
            body: null,  // TODO
            test: null,  // TODO
            loc: cst.loc
        }
    }

    /**
     * 创建 switch 语句 AST
     * SwitchStatement: switch ( Expression ) CaseBlock
     */
    createSwitchStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.SwitchStatement?.name);

        // CST 结构：
        // children[0]: SwitchTok
        // children[1]: LParen
        // children[2]: Expression - discriminant（判断表达式）
        // children[3]: RParen
        // children[4]: CaseBlock - cases

        // 提取 discriminant（判断表达式）
        const discriminantCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.Expression?.name)
        const discriminant = discriminantCst ? this.createExpressionAst(discriminantCst) : null

        // 提取 cases（从 CaseBlock 中）
        const caseBlockCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.CaseBlock?.name)
        const cases = caseBlockCst ? this.extractCasesFromCaseBlock(caseBlockCst) : []

        return {
            type: SlimeAstType.SwitchStatement,
            discriminant: discriminant,
            cases: cases,
            loc: cst.loc
        }
    }

    /**
     * 从 CaseBlock 提取所有 case/default 子句
     * CaseBlock: { CaseClauses? DefaultClause? CaseClauses? }
     */
    private extractCasesFromCaseBlock(caseBlockCst: SubhutiCst): any[] {
        const cases: any[] = []

        if (!caseBlockCst.children) return cases

        // CaseBlock 的 children:
        // [0]: LBrace
        // [1-n]: CaseClauses / DefaultClause（可能有多个，可能没有）
        // [last]: RBrace

        caseBlockCst.children.forEach(child => {
            if (child.name === Es6Parser.prototype.CaseClauses?.name) {
                // CaseClauses 包含多个 CaseClause
                if (child.children) {
                    child.children.forEach(caseClauseCst => {
                        cases.push(this.createSwitchCaseAst(caseClauseCst))
                    })
                }
            } else if (child.name === Es6Parser.prototype.DefaultClause?.name) {
                // DefaultClause
                cases.push(this.createSwitchCaseAst(child))
            }
        })

        return cases
    }

    /**
     * 创建 SwitchCase AST（包括 case 和 default）
     * CaseClause: case Expression : StatementList?
     * DefaultClause: default : StatementList?
     */
    private createSwitchCaseAst(cst: SubhutiCst): any {
        let test = null
        let consequent: any[] = []

        if (cst.name === Es6Parser.prototype.CaseClause?.name) {
            // CaseClause 结构：
            // children[0]: CaseTok
            // children[1]: Expression - test
            // children[2]: Colon
            // children[3]: StatementList（可选）

            const testCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.Expression?.name)
            test = testCst ? this.createExpressionAst(testCst) : null

            const stmtListCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.StatementList?.name)
            consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : []
        } else if (cst.name === Es6Parser.prototype.DefaultClause?.name) {
            // DefaultClause 结构：
            // children[0]: DefaultTok
            // children[1]: Colon
            // children[2]: StatementList（可选）

            test = null  // default 没有 test

            const stmtListCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.StatementList?.name)
            consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : []
        }

        return {
            type: SlimeAstType.SwitchCase,
            test: test,
            consequent: consequent,
            loc: cst.loc
        }
    }

    /**
     * 创建 try 语句 AST
     */
    createTryStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.TryStatement?.name);
        // TryStatement: TryTok Block (Catch Finally? | Finally)
        // children[0]: TryTok
        // children[1]: Block
        // children[2]（可选）: Catch
        // children[3]（可选）: Finally

        const blockCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Block?.name)
        const catchCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Catch?.name)
        const finallyCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Finally?.name)

        const block = blockCst ? this.createBlockAst(blockCst) : null
        const handler = catchCst ? this.createCatchClauseAst(catchCst) : null
        const finalizer = finallyCst ? this.createFinallyAst(finallyCst) : null

        return {
            type: SlimeAstType.TryStatement,
            block: block,
            handler: handler,
            finalizer: finalizer,
            loc: cst.loc
        }
    }

    /**
     * 从Block CST创建BlockStatement AST
     * Block: LBrace StatementList? RBrace
     */
    createBlockAst(cst: SubhutiCst): SlimeBlockStatement {
        checkCstName(cst, Es6Parser.prototype.Block?.name)

        // Block 的结构：LBrace StatementList? RBrace
        const statementListCst = cst.children?.find(
            child => child.name === Es6Parser.prototype.StatementList?.name
        )

        const statements = statementListCst ? this.createStatementListAst(statementListCst) : []

        return {
            type: SlimeAstType.BlockStatement,
            body: statements,
            lBrace: null,
            rBrace: null,
            loc: cst.loc
        } as SlimeBlockStatement
    }

    /**
     * 创建 Catch 子句 AST
     */
    createCatchClauseAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.Catch?.name);
        // Catch: CatchTok LParen CatchParameter RParen Block

        const paramCst = cst.children.find(ch => ch.name === Es6Parser.prototype.CatchParameter?.name)
        const blockCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Block?.name)

        const param = paramCst ? this.createCatchParameterAst(paramCst) : null
        const body = blockCst ? this.createBlockAst(blockCst) : null

        return {
            type: 'CatchClause',
            param: param,
            body: body,
            loc: cst.loc
        }
    }

    /**
     * 创建 CatchParameter AST
     */
    createCatchParameterAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.CatchParameter?.name);
        // CatchParameter: BindingIdentifier | BindingPattern
        const first = cst.children[0]

        if (first.name === Es6Parser.prototype.BindingIdentifier?.name) {
            return this.createBindingIdentifierAst(first)
        } else if (first.name === Es6Parser.prototype.BindingPattern?.name) {
            return this.createBindingPatternAst(first)
        }

        return null
    }

    /**
     * 创建 Finally 子句 AST
     */
    createFinallyAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.Finally?.name);
        // Finally: FinallyTok Block

        const blockCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Block?.name)
        return blockCst ? this.createBlockAst(blockCst) : null
    }

    /**
     * 创建 throw 语句 AST
     */
    createThrowStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.ThrowStatement?.name);
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
        checkCstName(cst, Es6Parser.prototype.BreakStatement?.name);
        // BreakStatement: break Identifier? ;
        // 可能包含一个可选的 Identifier 作为 label
        let label: any = null
        if (cst.children && cst.children.length > 0) {
            const identifierCst = cst.children.find(ch =>
                // 兼容三类：LabelIdentifier 规则、IdentifierName 包装、裸 Identifier token
                ch.name === Es6Parser.prototype.LabelIdentifier?.name ||
                ch.name === Es6Parser.prototype.IdentifierName?.name ||
                ch.name === Es6TokenConsumer.prototype.Identifier?.name
            )
            if (identifierCst) {
                if (identifierCst.name === Es6Parser.prototype.IdentifierName?.name) {
                    label = this.createIdentifierNameAst(identifierCst)
                } else if (identifierCst.name === Es6Parser.prototype.LabelIdentifier?.name) {
                    // LabelIdentifier内部直接是Identifier token
                    label = this.createIdentifierAst(identifierCst.children[0])
                } else {
                    label = this.createIdentifierAst(identifierCst)
                }
            }
        }
        return {
            type: SlimeAstType.BreakStatement,
            label: label,
            loc: cst.loc
        }
    }

    /**
     * 创建 continue 语句 AST
     */
    createContinueStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.ContinueStatement?.name);
        // ContinueStatement: continue Identifier? ;
        let label: any = null
        if (cst.children && cst.children.length > 0) {
            const identifierCst = cst.children.find(ch =>
                ch.name === Es6Parser.prototype.LabelIdentifier?.name ||
                ch.name === Es6Parser.prototype.IdentifierName?.name ||
                ch.name === Es6TokenConsumer.prototype.Identifier?.name
            )
            if (identifierCst) {
                if (identifierCst.name === Es6Parser.prototype.IdentifierName?.name) {
                    label = this.createIdentifierNameAst(identifierCst)
                } else if (identifierCst.name === Es6Parser.prototype.LabelIdentifier?.name) {
                    label = this.createIdentifierAst(identifierCst.children[0])
                } else {
                    label = this.createIdentifierAst(identifierCst)
                }
            }
        }
        return {
            type: SlimeAstType.ContinueStatement,
            label: label,
            loc: cst.loc
        }
    }

    /**
     * 创建标签语句 AST
     */
    createLabelledStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.LabelledStatement?.name);
        // LabelledStatement: Identifier : Statement
        // 取出 label（Identifier 或 IdentifierName）
        let label: any = null
        let body: any = null
        if (cst.children && cst.children.length > 0) {
            const identifierCst = cst.children.find(ch =>
                ch.name === Es6Parser.prototype.LabelIdentifier?.name ||
                ch.name === Es6Parser.prototype.IdentifierName?.name ||
                ch.name === Es6TokenConsumer.prototype.Identifier?.name
            )
            if (identifierCst) {
                if (identifierCst.name === Es6Parser.prototype.IdentifierName?.name) {
                    label = this.createIdentifierNameAst(identifierCst)
                } else if (identifierCst.name === Es6Parser.prototype.LabelIdentifier?.name) {
                    label = this.createIdentifierAst(identifierCst.children[0])
                } else {
                    label = this.createIdentifierAst(identifierCst)
                }
            }

            // 查找后续的 Statement 节点作为 body
            const statementCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Statement?.name)
            if (statementCst) {
                const stmts = this.createStatementAst(statementCst)
                body = Array.isArray(stmts) ? stmts[0] : stmts
            }
        }

        return {
            type: SlimeAstType.LabeledStatement,
            label: label,
            body: body,
            loc: cst.loc
        }
    }

    /**
     * 创建 with 语句 AST
     */
    createWithStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.WithStatement?.name);
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
        checkCstName(cst, Es6Parser.prototype.DebuggerStatement?.name);
        return {
            type: SlimeAstType.DebuggerStatement,
            loc: cst.loc
        }
    }

    /**
     * 创建空语句 AST
     */
    createEmptyStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.NotEmptySemicolon?.name);
        return {
            type: SlimeAstType.EmptyStatement,
            loc: cst.loc
        }
    }

    /**
     * 创建函数声明 AST
     * ES2025 FunctionDeclaration structure:
     * - function BindingIdentifier ( FormalParameters ) { FunctionBody }
     * Children: [FunctionTok, BindingIdentifier, LParen, FormalParameters, RParen, LBrace, FunctionBody, RBrace]
     */
    createFunctionDeclarationAst(cst: SubhutiCst): SlimeFunctionDeclaration {
        const children = cst.children || []

        let functionName: SlimeIdentifier | null = null
        let params: any[] = []
        let body: SlimeBlockStatement | null = null
        let isAsync = false
        let isGenerator = false

        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (!child) continue

            const name = child.name
            const value = child.value || child.loc?.value

            // Skip tokens: function, (, ), {, }
            if (name === 'FunctionTok' || value === 'function') continue
            if (name === 'LParen' || value === '(') continue
            if (name === 'RParen' || value === ')') continue
            if (name === 'LBrace' || value === '{') continue
            if (name === 'RBrace' || value === '}') continue
            if (name === 'AsyncTok' || value === 'async') { isAsync = true; continue }
            if (name === 'Asterisk' || value === '*') { isGenerator = true; continue }

            // BindingIdentifier - function name
            if (name === Es6Parser.prototype.BindingIdentifier?.name || name === 'BindingIdentifier') {
                functionName = this.createBindingIdentifierAst(child)
                continue
            }

            // FormalParameters - function parameters
            if (name === Es6Parser.prototype.FormalParameters?.name || name === 'FormalParameters') {
                params = this.createFormalParametersAst(child)
                continue
            }

            // FunctionBody - function body
            if (name === Es6Parser.prototype.FunctionBody?.name || name === 'FunctionBody') {
                const statements = this.createFunctionBodyAst(child)
                body = SlimeAstUtil.createBlockStatement(null, null, statements, child.loc)
                continue
            }

            // Legacy: FunctionFormalParametersBodyDefine
            if (name === Es6Parser.prototype.FunctionFormalParametersBodyDefine?.name || name === 'FunctionFormalParametersBodyDefine') {
                const funcExpr = this.createFunctionFormalParametersBodyDefineAst(child, cst.loc)
                params = funcExpr.params as any[]
                body = funcExpr.body
                continue
            }
        }

        // Create default empty body if not found
        if (!body) {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        return {
            type: SlimeAstType.FunctionDeclaration,
            id: functionName,
            params: params,
            body: body,
            generator: isGenerator,
            async: isAsync,
            loc: cst.loc
        } as SlimeFunctionDeclaration
    }

    /**
     * Create FormalParameters AST
     * FormalParameters: FormalParameterList? | FunctionRestParameter | FormalParameterList , FunctionRestParameter
     */
    createFormalParametersAst(cst: SubhutiCst): any[] {
        const children = cst.children || []
        const params: any[] = []

        for (const child of children) {
            if (!child) continue

            const name = child.name

            // Skip commas
            if (child.value === ',' || name === 'Comma') continue

            // FormalParameterList
            if (name === Es6Parser.prototype.FormalParameterList?.name || name === 'FormalParameterList') {
                params.push(...this.createFormalParameterListAst(child))
                continue
            }

            // FunctionRestParameter
            if (name === Es6Parser.prototype.FunctionRestParameter?.name || name === 'FunctionRestParameter') {
                params.push(this.createFunctionRestParameterAst(child))
                continue
            }

            // Direct BindingElement or BindingIdentifier
            if (name === Es6Parser.prototype.BindingElement?.name || name === 'BindingElement') {
                params.push(this.createBindingElementAst(child))
                continue
            }

            if (name === Es6Parser.prototype.BindingIdentifier?.name || name === 'BindingIdentifier') {
                params.push(this.createBindingIdentifierAst(child))
                continue
            }
        }

        return params
    }

    createFunctionRestParameterAst(cst: SubhutiCst): SlimeRestElement {
        // FunctionRestParameter: ... BindingIdentifier | ... BindingPattern
        const children = cst.children || []
        let argument: any = null

        for (const child of children) {
            if (!child) continue
            if (child.value === '...' || child.name === 'Ellipsis') continue

            if (child.name === Es6Parser.prototype.BindingIdentifier?.name || child.name === 'BindingIdentifier') {
                argument = this.createBindingIdentifierAst(child)
            } else if (child.name === Es6Parser.prototype.BindingRestElement?.name || child.name === 'BindingRestElement') {
                argument = this.createBindingRestElementAst(child)
            } else if (child.name === Es6Parser.prototype.BindingPattern?.name || child.name === 'BindingPattern') {
                argument = this.createBindingPatternAst(child)
            }
        }

        return {
            type: SlimeAstType.RestElement,
            argument: argument,
            loc: cst.loc
        } as any
    }

    createCallExpressionAst(cst: SubhutiCst): SlimeExpression {
        // Support both CallExpression and CoverCallExpressionAndAsyncArrowHead
        const isCallExpr = cst.name === Es6Parser.prototype.CallExpression?.name || cst.name === 'CallExpression'
        const isCoverExpr = cst.name === 'CoverCallExpressionAndAsyncArrowHead'

        if (!isCallExpr && !isCoverExpr) {
            throw new Error(`createCallExpressionAst: Expected CallExpression or CoverCallExpressionAndAsyncArrowHead, got ${cst.name}`)
        }

        if (cst.children.length === 1) {
            // 单个子节点，可能是SuperCall
            const first = cst.children[0]
            if (first.name === Es6Parser.prototype.SuperCall?.name) {
                return this.createSuperCallAst(first)
            }
            return this.createExpressionAst(first)
        }

        // 多个children：MemberExpression + Arguments + 可选的链式调用
        // children[0]: MemberExpression 或 CoverCallExpressionAndAsyncArrowHead
        // children[1]: Arguments (第一次调用)
        // children[2+]: Dot/Identifier/Arguments（链式调用）

        let current: SlimeExpression
        const firstChild = cst.children[0]

        // 处理第一个子节点
        if (firstChild.name === 'CoverCallExpressionAndAsyncArrowHead') {
            // CoverCallExpressionAndAsyncArrowHead 结构: [MemberExpression, Arguments]
            // 递归处理它
            current = this.createCallExpressionAst(firstChild)
        } else if (firstChild.name === Es6Parser.prototype.MemberExpression?.name || firstChild.name === 'MemberExpression') {
            current = this.createMemberExpressionAst(firstChild)
        } else if (firstChild.name === Es6Parser.prototype.SuperCall?.name || firstChild.name === 'SuperCall') {
            current = this.createSuperCallAst(firstChild)
        } else if (firstChild.name === Es6Parser.prototype.ImportCall?.name || firstChild.name === 'ImportCall') {
            current = this.createImportCallAst(firstChild)
        } else {
            // 尝试作为表达式处理
            current = this.createExpressionAst(firstChild)
        }

        // 循环处理所有后续children
        for (let i = 1; i < cst.children.length; i++) {
            const child = cst.children[i]

            if (child.name === Es6Parser.prototype.Arguments?.name || child.name === 'Arguments') {
                // () - 函数调用
                const args = this.createArgumentsAst(child)
                current = SlimeAstUtil.createCallExpression(current, args)

            } else if (child.name === Es6Parser.prototype.DotMemberExpression?.name) {
                // DotMemberExpression包含Dot和IdentifierName (旧版兼容)
                const dotChild = child.children[0]  // Dot token
                const identifierNameCst = child.children[1]  // IdentifierName
                const tokenCst = identifierNameCst.children[0]  // 实际的token（Identifier或关键字）
                const property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
                const dotOp = SlimeAstUtil.createDotOperator(dotChild.loc)
                current = SlimeAstUtil.createMemberExpression(current, dotOp, property)

            } else if (child.name === 'Dot') {
                // Es2025Parser产生的是直接的 Dot token + IdentifierName
                const dotOp = SlimeAstUtil.createDotOperator(child.loc)

                // 下一个child应该是IdentifierName或PrivateIdentifier
                const nextChild = cst.children[i + 1]
                let property: SlimeIdentifier | null = null
                if (nextChild) {
                    if (nextChild.name === Es6Parser.prototype.IdentifierName?.name || nextChild.name === 'IdentifierName') {
                        const tokenCst = nextChild.children[0]
                        property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
                        i++ // 跳过已处理的IdentifierName
                    } else if (nextChild.name === 'PrivateIdentifier') {
                        property = SlimeAstUtil.createIdentifier(nextChild.value, nextChild.loc)
                        i++ // 跳过已处理的PrivateIdentifier
                    }
                }
                current = SlimeAstUtil.createMemberExpression(current, dotOp, property)

            } else if (child.name === Es6Parser.prototype.BracketExpression?.name) {
                // [expr] - computed property (旧版兼容)
                const propertyExpression = this.createExpressionAst(child.children[1])
                current = {
                    type: SlimeAstType.MemberExpression,
                    object: current,
                    property: propertyExpression,
                    computed: true,
                    optional: false,
                    loc: cst.loc
                } as any

            } else if (child.name === 'LBracket') {
                // Es2025Parser产生的是直接的 LBracket + Expression + RBracket
                const expressionChild = cst.children[i + 1]
                if (expressionChild && expressionChild.name !== 'RBracket') {
                    const propertyExpression = this.createExpressionAst(expressionChild)
                    current = {
                        type: SlimeAstType.MemberExpression,
                        object: current,
                        property: propertyExpression,
                        computed: true,
                        optional: false,
                        loc: cst.loc
                    } as any
                    i += 2 // 跳过Expression和RBracket
                }

            } else if (child.name === Es6Parser.prototype.TemplateLiteral?.name || child.name === 'TemplateLiteral') {
                // `template` - Tagged Template
                const quasi = this.createTemplateLiteralAst(child)
                current = {
                    type: 'TaggedTemplateExpression',
                    tag: current,
                    quasi: quasi,
                    loc: cst.loc
                } as any

            } else if (child.name === 'RBracket') {
                // 跳过RBracket
                continue
            }
        }

        return current
    }

    createSuperCallAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.SuperCall?.name);
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
        // 形式1: SuperTok + Dot + IdentifierName
        // 形式2: SuperTok + LBracket + Expression + RBracket
        const superNode: SlimeSuper = {
            type: "Super",
            loc: cst.children[0].loc
        }

        const second = cst.children[1]
        if (second.name === Es6Parser.prototype.BracketExpression?.name) {
            // super[expression] - 旧版兼容
            const propertyExpression = this.createExpressionAst(second.children[1])
            return {
                type: SlimeAstType.MemberExpression,
                object: superNode,
                property: propertyExpression,
                computed: true,
                optional: false,
                loc: cst.loc
            } as any
        } else if (second.name === 'LBracket') {
            // Es2025Parser: super[expression]
            // children: [SuperTok, LBracket, Expression, RBracket]
            const expressionCst = cst.children[2]
            const propertyExpression = this.createExpressionAst(expressionCst)
            return {
                type: SlimeAstType.MemberExpression,
                object: superNode,
                property: propertyExpression,
                computed: true,
                optional: false,
                loc: cst.loc
            } as any
        } else if (second.name === 'Dot') {
            // Es2025Parser: super.property
            // children: [SuperTok, Dot, IdentifierName]
            const identifierNameCst = cst.children[2]
            let property: SlimeIdentifier
            if (identifierNameCst.name === 'IdentifierName' || identifierNameCst.name === Es6Parser.prototype.IdentifierName?.name) {
                const tokenCst = identifierNameCst.children[0]
                property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
            } else {
                // 直接是token
                property = SlimeAstUtil.createIdentifier(identifierNameCst.value, identifierNameCst.loc)
            }

            return {
                type: SlimeAstType.MemberExpression,
                object: superNode,
                property: property,
                computed: false,
                optional: false,
                loc: cst.loc
            } as any
        } else {
            // 旧版兼容: super.property
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
        if (first.name === Es6Parser.prototype.NewTarget?.name) {
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
        const astName = checkCstName(cst, Es6Parser.prototype.Arguments?.name);
        const first1 = cst.children[1]
        if (first1) {
            if (first1.name === Es6Parser.prototype.ArgumentList?.name) {
                const res = this.createArgumentListAst(first1)
                return res
            }
        }
        return []
    }

    createArgumentListAst(cst: SubhutiCst): Array<SlimeExpression | SlimeSpreadElement> {
        const astName = checkCstName(cst, Es6Parser.prototype.ArgumentList?.name);
        const ArgumentList: Array<SlimeExpression | SlimeSpreadElement> = []
        for (const child of cst.children) {
            if (child.name === Es6Parser.prototype.AssignmentExpression?.name) {
                const res = this.createAssignmentExpressionAst(child)
                ArgumentList.push(res)
            } else if (child.name === Es6Parser.prototype.SpreadElement?.name) {
                // 处理 spread 参数：...args
                const res = this.createSpreadElementAst(child)
                ArgumentList.push(res)
            }
        }
        return ArgumentList
    }

    createMemberExpressionFirstOr(cst: SubhutiCst): SlimeExpression | SlimeSuper {
        if (cst.name === Es6Parser.prototype.PrimaryExpression?.name || cst.name === 'PrimaryExpression') {
            return this.createPrimaryExpressionAst(cst)
        } else if (cst.name === Es6Parser.prototype.SuperProperty?.name || cst.name === 'SuperProperty') {
            return this.createSuperPropertyAst(cst)
        } else if (cst.name === Es6Parser.prototype.MetaProperty?.name || cst.name === 'MetaProperty') {
            return this.createMetaPropertyAst(cst)
        } else if (cst.name === Es6Parser.prototype.NewMemberExpressionArguments?.name) {
            return this.createNewExpressionAst(cst)
        } else if (cst.name === 'NewTok') {
            // Es2025Parser: new MemberExpression Arguments 是直接的 token 序列
            // 这种情况应该在 createMemberExpressionAst 中处理
            throw new Error('createMemberExpressionFirstOr: NewTok should be handled in createMemberExpressionAst')
        } else {
            throw new Error('createMemberExpressionFirstOr: 不支持的类型: ' + cst.name)
        }
    }

    createNewExpressionAst(cst: SubhutiCst): any {
        // 支持两种类型：NewExpression 和 NewMemberExpressionArguments
        const isNewMemberExpr = cst.name === Es6Parser.prototype.NewMemberExpressionArguments?.name
        const isNewExpr = cst.name === Es6Parser.prototype.NewExpression?.name

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
        const astName = checkCstName(cst, Es6Parser.prototype.DotIdentifier?.name);
        const SlimeDotOperator = SlimeAstUtil.createDotOperator(cst.children[0].loc)
        return SlimeDotOperator
    }


    createMemberExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.MemberExpression?.name);

        if (cst.children.length === 0) {
            throw new Error('MemberExpression has no children')
        }

        // Es2025Parser: 检查是否是 new MemberExpression Arguments 模式
        // 第一个子节点是 NewTok
        if (cst.children[0].name === 'NewTok') {
            // new MemberExpression Arguments
            // children: [NewTok, MemberExpression, Arguments]
            const memberExprCst = cst.children[1]
            const argsCst = cst.children[2]

            const callee = this.createMemberExpressionAst(memberExprCst)
            const args = argsCst ? this.createArgumentsAst(argsCst) : []

            return {
                type: 'NewExpression',
                callee: callee,
                arguments: args,
                loc: cst.loc
            } as any
        }

        // 从第一个child创建base对象
        let current: SlimeExpression = this.createMemberExpressionFirstOr(cst.children[0])

        // 循环处理剩余的children（Dot+IdentifierName、LBracket+Expression+RBracket、Arguments、TemplateLiteral）
        for (let i = 1; i < cst.children.length; i++) {
            const child = cst.children[i]

            if (child.name === Es6Parser.prototype.DotIdentifier?.name) {
                // .property - 成员访问 (旧版兼容)
                const SlimeDotOperator = SlimeAstUtil.createDotOperator(child.children[0].loc)

                // children[1]是IdentifierName，可能是Identifier或关键字token
                let property: SlimeIdentifier | null = null
                if (child.children[1]) {
                    const identifierNameCst = child.children[1]
                    if (identifierNameCst.name === Es6Parser.prototype.IdentifierName?.name) {
                        // IdentifierName -> Identifier or Keyword token
                        const tokenCst = identifierNameCst.children[0]
                        property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
                    } else {
                        // 直接是token（向后兼容）
                        property = this.createIdentifierAst(identifierNameCst)
                    }
                }

                // 创建新的MemberExpression，current作为object
                current = SlimeAstUtil.createMemberExpression(current, SlimeDotOperator, property)

            } else if (child.name === 'Dot') {
                // Es2025Parser产生的是直接的 Dot token + IdentifierName
                // .property - 成员访问
                const SlimeDotOperator = SlimeAstUtil.createDotOperator(child.loc)

                // 下一个child应该是IdentifierName或PrivateIdentifier
                const nextChild = cst.children[i + 1]
                let property: SlimeIdentifier | null = null
                if (nextChild) {
                    if (nextChild.name === Es6Parser.prototype.IdentifierName?.name || nextChild.name === 'IdentifierName') {
                        // IdentifierName -> Identifier or Keyword token
                        const tokenCst = nextChild.children[0]
                        property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
                        i++ // 跳过已处理的IdentifierName
                    } else if (nextChild.name === 'PrivateIdentifier') {
                        // 私有标识符 #prop
                        property = SlimeAstUtil.createIdentifier(nextChild.value, nextChild.loc)
                        i++ // 跳过已处理的PrivateIdentifier
                    }
                }

                // 创建新的MemberExpression，current作为object
                current = SlimeAstUtil.createMemberExpression(current, SlimeDotOperator, property)

            } else if (child.name === Es6Parser.prototype.BracketExpression?.name) {
                // [expression] - computed property access (旧版兼容)
                const propertyExpression = this.createExpressionAst(child.children[1])
                current = {
                    type: SlimeAstType.MemberExpression,
                    object: current,
                    property: propertyExpression,
                    computed: true,
                    optional: false,
                    loc: cst.loc
                } as any

            } else if (child.name === 'LBracket') {
                // Es2025Parser产生的是直接的 LBracket + Expression + RBracket
                // [expression] - computed property access
                const expressionChild = cst.children[i + 1]
                if (expressionChild) {
                    const propertyExpression = this.createExpressionAst(expressionChild)
                    current = {
                        type: SlimeAstType.MemberExpression,
                        object: current,
                        property: propertyExpression,
                        computed: true,
                        optional: false,
                        loc: cst.loc
                    } as any
                    i += 2 // 跳过Expression和RBracket
                }

            } else if (child.name === Es6Parser.prototype.Arguments?.name || child.name === 'Arguments') {
                // () - function call
                const args = this.createArgumentsAst(child)
                current = SlimeAstUtil.createCallExpression(current, args)

            } else if (child.name === Es6Parser.prototype.TemplateLiteral?.name || child.name === 'TemplateLiteral') {
                // `template` - Tagged Template
                const quasi = this.createTemplateLiteralAst(child)
                current = {
                    type: 'TaggedTemplateExpression',
                    tag: current,
                    quasi: quasi,
                    loc: cst.loc
                } as any

            } else if (child.name === 'RBracket') {
                // 跳过RBracket，它已经在LBracket处理中被处理
                continue

            } else {
                throw new Error(`未知的MemberExpression子节点类型: ${child.name}`)
            }
        }

        return current
    }

    createVariableDeclaratorAst(cst: SubhutiCst): SlimeVariableDeclarator {
        const astName = checkCstName(cst, Es6Parser.prototype.VariableDeclarator?.name);

        // children[0]可能是BindingIdentifier或BindingPattern（解构）
        const firstChild = cst.children[0]
        let id: SlimeIdentifier | SlimePattern

        if (firstChild.name === Es6Parser.prototype.BindingIdentifier?.name) {
            id = this.createBindingIdentifierAst(firstChild)
        } else if (firstChild.name === Es6Parser.prototype.BindingPattern?.name) {
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
                if (initCst.name === Es6Parser.prototype.AssignmentExpression?.name) {
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
        if (astName === Es6Parser.prototype.Expression?.name) {
            left = this.createExpressionAst(cst.children[0])
        } else if (astName === Es6Parser.prototype.Statement?.name) {
            left = this.createStatementAst(cst)
        } else if (astName === Es6Parser.prototype.AssignmentExpression?.name) {
            left = this.createAssignmentExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.ConditionalExpression?.name) {
            left = this.createConditionalExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.LogicalORExpression?.name) {
            left = this.createLogicalORExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.LogicalANDExpression?.name) {
            left = this.createLogicalANDExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.BitwiseORExpression?.name) {
            left = this.createBitwiseORExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.BitwiseXORExpression?.name) {
            left = this.createBitwiseXORExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.BitwiseANDExpression?.name) {
            left = this.createBitwiseANDExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.EqualityExpression?.name) {
            left = this.createEqualityExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.RelationalExpression?.name) {
            left = this.createRelationalExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.ShiftExpression?.name) {
            left = this.createShiftExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.AdditiveExpression?.name) {
            left = this.createAdditiveExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.MultiplicativeExpression?.name) {
            left = this.createMultiplicativeExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.UnaryExpression?.name) {
            left = this.createUnaryExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.PostfixExpression?.name || astName === 'PostfixExpression') {
            left = this.createUpdateExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.UpdateExpression?.name || astName === 'UpdateExpression') {
            left = this.createUpdateExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.LeftHandSideExpression?.name) {
            left = this.createLeftHandSideExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.CallExpression?.name) {
            left = this.createCallExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.NewExpression?.name) {
            left = this.createNewExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.NewMemberExpressionArguments?.name) {
            left = this.createNewExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.MemberExpression?.name) {
            left = this.createMemberExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.PrimaryExpression?.name) {
            left = this.createPrimaryExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.YieldExpression?.name) {
            left = this.createYieldExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.AwaitExpression?.name) {
            left = this.createAwaitExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.SuperProperty?.name) {
            left = this.createSuperPropertyAst(cst)
        } else if (astName === Es6Parser.prototype.MetaProperty?.name) {
            left = this.createMetaPropertyAst(cst)
        } else if (astName === 'ShortCircuitExpression') {
            // ES2020: ShortCircuitExpression = LogicalORExpression | CoalesceExpression
            // 递归处理第一个child
            left = this.createExpressionAst(cst.children[0])
        } else if (astName === 'CoalesceExpression') {
            // ES2020: CoalesceExpression (处理 ?? 运算符)
            left = this.createCoalesceExpressionAst(cst)
        } else if (astName === 'ExponentiationExpression') {
            // ES2016: ExponentiationExpression (处理 ** 运算符)
            left = this.createExponentiationExpressionAst(cst)
        } else if (astName === 'CoverCallExpressionAndAsyncArrowHead') {
            // ES2017+: Cover grammar for CallExpression and async arrow function
            // In non-async-arrow context, this is a CallExpression
            left = this.createCallExpressionAst(cst)
        } else if (astName === 'OptionalExpression') {
            // ES2020: Optional chaining (?.)
            left = this.createOptionalExpressionAst(cst)
        } else if (astName === Es6Parser.prototype.ArrowFunction?.name || astName === 'ArrowFunction') {
            // 箭头函数
            left = this.createArrowFunctionAst(cst)
        } else if (astName === 'AsyncArrowFunction') {
            // Async 箭头函数
            left = this.createAsyncArrowFunctionAst(cst)
        } else {
            throw new Error('Unsupported expression type: ' + cst.name)
        }
        return left
    }

    /**
     * 创建 CoalesceExpression AST（ES2020）
     * 处理 ?? 空值合并运算符
     */
    createCoalesceExpressionAst(cst: SubhutiCst): SlimeExpression {
        // CoalesceExpression -> BitwiseORExpression ( ?? BitwiseORExpression )*
        if (cst.children.length === 1) {
            return this.createExpressionAst(cst.children[0])
        }

        // 有多个子节点，构建左结合的逻辑表达式
        let left = this.createExpressionAst(cst.children[0])
        for (let i = 1; i < cst.children.length; i += 2) {
            const operator = cst.children[i]  // ?? token
            const right = this.createExpressionAst(cst.children[i + 1])
            left = {
                type: SlimeAstType.LogicalExpression,
                operator: '??',
                left: left,
                right: right
            } as any
        }
        return left
    }

    /**
     * 创建 ExponentiationExpression AST（ES2016）
     * 处理 ** 幂运算符
     */
    createExponentiationExpressionAst(cst: SubhutiCst): SlimeExpression {
        // ExponentiationExpression -> UnaryExpression | UpdateExpression ** ExponentiationExpression
        if (cst.children.length === 1) {
            return this.createExpressionAst(cst.children[0])
        }

        // 有多个子节点，右结合：a ** b ** c = a ** (b ** c)
        const left = this.createExpressionAst(cst.children[0])
        const operator = cst.children[1]  // ** token
        const right = this.createExponentiationExpressionAst(cst.children[2])  // 递归处理右侧
        return {
            type: SlimeAstType.BinaryExpression,
            operator: '**',
            left: left,
            right: right
        } as any
    }

    createLogicalORExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.LogicalORExpression?.name);
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createLogicalANDExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.LogicalANDExpression?.name);
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createBitwiseORExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.BitwiseORExpression?.name);
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createBitwiseXORExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.BitwiseXORExpression?.name);
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createBitwiseANDExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.BitwiseANDExpression?.name);
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createEqualityExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.EqualityExpression?.name);
        if (cst.children.length > 1) {
            // 有运算符，创建 BinaryExpression
            const left = this.createExpressionAst(cst.children[0])
            const operator = cst.children[1].value as any  // ===, !==, ==, != 运算符
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

    createRelationalExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.RelationalExpression?.name);
        if (cst.children.length > 1) {
            // 有运算符，创建 BinaryExpression
            const left = this.createExpressionAst(cst.children[0])
            const operator = cst.children[1].value as any  // <, >, <=, >= 运算符
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

    createShiftExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ShiftExpression?.name);
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createAdditiveExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.AdditiveExpression?.name);
        if (cst.children.length > 1) {
            // 有运算符，创建 BinaryExpression
            // 支持多个运算符：x + y + z => BinaryExpression(BinaryExpression(x, +, y), +, z)
            let left = this.createExpressionAst(cst.children[0])

            // 循环处理剩余的 (operator, operand) 对
            // CST结构: [operand, operator, operand, operator, operand, ...]
            for (let i = 1; i < cst.children.length; i += 2) {
                // 获取运算符 - 可能是token也可能是CST节点
                const operatorNode = cst.children[i]
                const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value

                const right = this.createExpressionAst(cst.children[i + 1])

                left = {
                    type: SlimeAstType.BinaryExpression,
                    operator: operator,
                    left: left,
                    right: right,
                    loc: cst.loc
                } as any
            }

            return left
        }
        return this.createExpressionAst(cst.children[0])
    }

    createMultiplicativeExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.MultiplicativeExpression?.name);
        if (cst.children.length > 1) {
            // 有运算符，创建 BinaryExpression
            // 支持多个运算符：a * b * c => BinaryExpression(BinaryExpression(a, *, b), *, c)
            let left = this.createExpressionAst(cst.children[0])

            // 循环处理剩余的 (operator, operand) 对
            for (let i = 1; i < cst.children.length; i += 2) {
                // 获取运算符 - 可能是token也可能是CST节点
                const operatorNode = cst.children[i]
                const operator = operatorNode.children ? operatorNode.children[0].value : operatorNode.value

                const right = this.createExpressionAst(cst.children[i + 1])

                left = {
                    type: SlimeAstType.BinaryExpression,
                    operator: operator,
                    left: left,
                    right: right,
                    loc: cst.loc
                } as any
            }

            return left
        }
        return this.createExpressionAst(cst.children[0])
    }

    createUnaryExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.UnaryExpression?.name);

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

    // Renamed from createPostfixExpressionAst - ES2025 uses UpdateExpression
    createUpdateExpressionAst(cst: SubhutiCst): SlimeExpression {
        // Support both PostfixExpression (old) and UpdateExpression (new)
        if (cst.children.length > 1) {
            // UpdateExpression: argument ++ | argument -- | ++argument | --argument
            // Check if prefix or postfix
            const first = cst.children[0]
            const isPrefix = first.loc?.type === 'PlusPlus' || first.loc?.type === 'MinusMinus' ||
                             first.value === '++' || first.value === '--'

            if (isPrefix) {
                // Prefix: ++argument or --argument
                const operator = first.value || first.loc?.value
                const argument = this.createExpressionAst(cst.children[1])
                return {
                    type: SlimeAstType.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: true,
                    loc: cst.loc
                } as any
            } else {
                // Postfix: argument++ or argument--
                const argument = this.createExpressionAst(cst.children[0])
                let operator: string | undefined
                for (let i = 1; i < cst.children.length; i++) {
                    const child = cst.children[i]
                    if (child.loc?.type === 'PlusPlus' || child.loc?.type === 'MinusMinus' ||
                        child.value === '++' || child.value === '--') {
                        operator = child.value || child.loc?.value
                        break
                    }
                }
                if (operator) {
                    return {
                        type: SlimeAstType.UpdateExpression,
                        operator: operator,
                        argument: argument,
                        prefix: false,
                        loc: cst.loc
                    } as any
                }
            }
        }
        return this.createExpressionAst(cst.children[0])
    }

    createLeftHandSideExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.LeftHandSideExpression?.name);
        // 容错：Parser在ASI场景下可能生成不完整的CST，返回空标识符
        if (!cst.children || cst.children.length === 0) {
            return SlimeAstUtil.createIdentifier('', cst.loc)
        }
        if (cst.children.length > 1) {

        }
        return this.createExpressionAst(cst.children[0])
    }

    createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.PrimaryExpression?.name);
        const first = cst.children[0]
        if (first.name === Es6Parser.prototype.IdentifierReference?.name) {
            return this.createIdentifierAst(first.children[0])
        } else if (first.name === Es6Parser.prototype.Literal?.name) {
            return this.createLiteralAst(first)
        } else if (first.name === Es6Parser.prototype.ArrayLiteral?.name) {
            return this.createArrayExpressionAst(first)
        } else if (first.name === Es6Parser.prototype.FunctionExpression?.name) {
            return this.createFunctionExpressionAst(first)
        } else if (first.name === Es6Parser.prototype.ObjectLiteral?.name) {
            return this.createObjectExpressionAst(first)
        } else if (first.name === Es6Parser.prototype.ClassExpression?.name) {
            return this.createClassExpressionAst(first)
        } else if (first.name === Es6TokenConsumer.prototype.ThisTok?.name) {
            // 处理 this 关键字
            return SlimeAstUtil.createIdentifier('this', first.loc)
        } else if (first.name === Es6TokenConsumer.prototype.RegularExpressionLiteral?.name) {
            // 处理正则表达式字面量
            return SlimeAstUtil.createStringLiteral(first.value)  // 暂时处理为字符串
        } else if (first.name === Es6Parser.prototype.GeneratorExpression?.name || first.name === 'GeneratorExpression') {
            // 处理 function* 表达式
            return this.createGeneratorExpressionAst(first)
        } else if (first.name === Es6Parser.prototype.AsyncFunctionExpression?.name || first.name === 'AsyncFunctionExpression') {
            // 处理 async function 表达式
            return this.createAsyncFunctionExpressionAst(first)
        } else if (first.name === Es6Parser.prototype.AsyncGeneratorExpression?.name || first.name === 'AsyncGeneratorExpression') {
            // 处理 async function* 表达式
            return this.createAsyncGeneratorExpressionAst(first)
        } else if (first.name === Es6Parser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name ||
                   first.name === 'CoverParenthesizedExpressionAndArrowParameterList') {
            // Cover Grammar - try to interpret as parenthesized expression
            // Structure varies: [LParen, content?, RParen] or [LParen, Expression, RParen]

            // Empty parentheses: ()
            if (!first.children || first.children.length === 0) {
                return SlimeAstUtil.createIdentifier('undefined', first.loc)
            }

            // Only 2 children (empty parens): LParen, RParen
            if (first.children.length === 2) {
                return SlimeAstUtil.createIdentifier('undefined', first.loc)
            }

            // Find the content (skip LParen at start, RParen at end)
            const middleCst = first.children[1]
            if (!middleCst) {
                return SlimeAstUtil.createIdentifier('undefined', first.loc)
            }

            // If it's an Expression, process it directly
            if (middleCst.name === Es6Parser.prototype.Expression?.name || middleCst.name === 'Expression') {
                const innerExpr = this.createExpressionAst(middleCst)
                return SlimeAstUtil.createParenthesizedExpression(innerExpr, first.loc)
            }

            // If it's AssignmentExpression, process it
            if (middleCst.name === Es6Parser.prototype.AssignmentExpression?.name || middleCst.name === 'AssignmentExpression') {
                const innerExpr = this.createExpressionAst(middleCst)
                return SlimeAstUtil.createParenthesizedExpression(innerExpr, first.loc)
            }

            // If it's FormalParameterList, convert to expression
            if (middleCst.name === Es6Parser.prototype.FormalParameterList?.name || middleCst.name === 'FormalParameterList') {
                const params = this.createFormalParameterListAst(middleCst)
                if (params.length === 1 && params[0].type === SlimeAstType.Identifier) {
                    return SlimeAstUtil.createParenthesizedExpression(params[0] as any, first.loc)
                }
                if (params.length > 1) {
                    const expressions = params.map(p => p as any)
                    return SlimeAstUtil.createParenthesizedExpression({
                        type: 'SequenceExpression',
                        expressions: expressions
                    } as any, first.loc)
                }
                return SlimeAstUtil.createIdentifier('undefined', first.loc)
            }

            // Try to process the middle content as an expression
            try {
                const innerExpr = this.createExpressionAst(middleCst)
                return SlimeAstUtil.createParenthesizedExpression(innerExpr, first.loc)
            } catch (e) {
                // Fallback: return the first child as identifier
                return SlimeAstUtil.createIdentifier('undefined', first.loc)
            }
        } else if (first.name === Es6Parser.prototype.TemplateLiteral?.name) {
            // 处理模板字符串
            return this.createTemplateLiteralAst(first)
        } else if (first.name === Es6Parser.prototype.ParenthesizedExpression?.name) {
            // 处理普通括号表达式：( Expression )
            // children[0]=LParen, children[1]=Expression, children[2]=RParen
            const expressionCst = first.children[1]
            const innerExpression = this.createExpressionAst(expressionCst)
            return SlimeAstUtil.createParenthesizedExpression(innerExpression, first.loc)
        } else {
            throw new Error('未知的createPrimaryExpressionAst：' + first.name)
        }
    }

    // 生成器表达式处理：function* (...) { ... }
    createGeneratorExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
        // GeneratorExpression: function* [name](params) { body }
        // 旧版 CST children: [FunctionTok, Asterisk, BindingIdentifier?, LParen, FormalParameterList?, RParen, FunctionBodyDefine]
        // Es2025 CST children: [FunctionTok, Asterisk, BindingIdentifier?, LParen, FormalParameters?, RParen, LBrace, GeneratorBody, RBrace]

        let id: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // 查找 BindingIdentifier
        const bindingId = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingIdentifier?.name || ch.name === 'BindingIdentifier')
        if (bindingId) {
            id = this.createBindingIdentifierAst(bindingId)
        }

        // 查找 FormalParameters 或 FormalParameterList
        const formalParams = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.FormalParameters?.name || ch.name === 'FormalParameters' ||
            ch.name === Es6Parser.prototype.FormalParameterList?.name || ch.name === 'FormalParameterList')
        if (formalParams) {
            if (formalParams.name === 'FormalParameters' || formalParams.name === Es6Parser.prototype.FormalParameters?.name) {
                params = this.createFormalParametersAst(formalParams)
            } else {
                params = this.createFormalParameterListAst(formalParams)
            }
        }

        // 查找 GeneratorBody 或 FunctionBody 或 FunctionBodyDefine
        const bodyNode = cst.children.find(ch =>
            ch.name === 'GeneratorBody' || ch.name === Es6Parser.prototype.GeneratorBody?.name ||
            ch.name === 'FunctionBody' || ch.name === Es6Parser.prototype.FunctionBody?.name ||
            ch.name === Es6Parser.prototype.FunctionBodyDefine?.name)
        if (bodyNode) {
            if (bodyNode.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
                body = this.createFunctionBodyDefineAst(bodyNode)
            } else {
                const bodyStatements = this.createFunctionBodyAst(bodyNode)
                body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyNode.loc)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const lp = SlimeAstUtil.createLParen(cst.loc)
        const rp = SlimeAstUtil.createRParen(cst.loc)
        const funcParams = SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
        const func = SlimeAstUtil.createFunctionExpression(body, id, funcParams, cst.loc)
        func.generator = true
        func.async = false
        return func
    }

    // Async 函数表达式处理：async function (...) { ... }
    createAsyncFunctionExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
        // AsyncFunctionExpression: async function [name](params) { body }
        // Es2025 CST children: [AsyncTok, FunctionTok, BindingIdentifier?, LParen, FormalParameters?, RParen, LBrace, AsyncFunctionBody, RBrace]

        let id: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // 查找 BindingIdentifier
        const bindingId = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingIdentifier?.name || ch.name === 'BindingIdentifier')
        if (bindingId) {
            id = this.createBindingIdentifierAst(bindingId)
        }

        // 查找 FormalParameters 或 FormalParameterList
        const formalParams = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.FormalParameters?.name || ch.name === 'FormalParameters' ||
            ch.name === Es6Parser.prototype.FormalParameterList?.name || ch.name === 'FormalParameterList')
        if (formalParams) {
            if (formalParams.name === 'FormalParameters' || formalParams.name === Es6Parser.prototype.FormalParameters?.name) {
                params = this.createFormalParametersAst(formalParams)
            } else {
                params = this.createFormalParameterListAst(formalParams)
            }
        }

        // 查找 AsyncFunctionBody 或 FunctionBody 或 FunctionBodyDefine
        const bodyNode = cst.children.find(ch =>
            ch.name === 'AsyncFunctionBody' || ch.name === Es6Parser.prototype.AsyncFunctionBody?.name ||
            ch.name === 'FunctionBody' || ch.name === Es6Parser.prototype.FunctionBody?.name ||
            ch.name === Es6Parser.prototype.FunctionBodyDefine?.name)
        if (bodyNode) {
            if (bodyNode.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
                body = this.createFunctionBodyDefineAst(bodyNode)
            } else {
                const bodyStatements = this.createFunctionBodyAst(bodyNode)
                body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyNode.loc)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const lp = SlimeAstUtil.createLParen(cst.loc)
        const rp = SlimeAstUtil.createRParen(cst.loc)
        const funcParams = SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
        const func = SlimeAstUtil.createFunctionExpression(body, id, funcParams, cst.loc)
        func.generator = false
        func.async = true
        return func
    }

    // Async Generator 表达式处理：async function* (...) { ... }
    createAsyncGeneratorExpressionAst(cst: SubhutiCst): SlimeFunctionExpression {
        // AsyncGeneratorExpression: async function* [name](params) { body }
        // Es2025 CST children: [AsyncTok, FunctionTok, Asterisk, BindingIdentifier?, LParen, FormalParameters?, RParen, LBrace, AsyncGeneratorBody, RBrace]

        let id: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // 查找 BindingIdentifier
        const bindingId = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingIdentifier?.name || ch.name === 'BindingIdentifier')
        if (bindingId) {
            id = this.createBindingIdentifierAst(bindingId)
        }

        // 查找 FormalParameters 或 FormalParameterList
        const formalParams = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.FormalParameters?.name || ch.name === 'FormalParameters' ||
            ch.name === Es6Parser.prototype.FormalParameterList?.name || ch.name === 'FormalParameterList')
        if (formalParams) {
            if (formalParams.name === 'FormalParameters' || formalParams.name === Es6Parser.prototype.FormalParameters?.name) {
                params = this.createFormalParametersAst(formalParams)
            } else {
                params = this.createFormalParameterListAst(formalParams)
            }
        }

        // 查找 AsyncGeneratorBody 或 FunctionBody 或 FunctionBodyDefine
        const bodyNode = cst.children.find(ch =>
            ch.name === 'AsyncGeneratorBody' || ch.name === Es6Parser.prototype.AsyncGeneratorBody?.name ||
            ch.name === 'FunctionBody' || ch.name === Es6Parser.prototype.FunctionBody?.name ||
            ch.name === Es6Parser.prototype.FunctionBodyDefine?.name)
        if (bodyNode) {
            if (bodyNode.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
                body = this.createFunctionBodyDefineAst(bodyNode)
            } else {
                const bodyStatements = this.createFunctionBodyAst(bodyNode)
                body = SlimeAstUtil.createBlockStatement(null, null, bodyStatements, bodyNode.loc)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        const lp = SlimeAstUtil.createLParen(cst.loc)
        const rp = SlimeAstUtil.createRParen(cst.loc)
        const funcParams = SlimeAstUtil.createFunctionParams(lp, rp, cst.loc, params)
        const func = SlimeAstUtil.createFunctionExpression(body, id, funcParams, cst.loc)
        func.generator = true
        func.async = true
        return func
    }

    // 模板字符串处理
    createTemplateLiteralAst(cst: SubhutiCst): SlimeExpression {
        checkCstName(cst, Es6Parser.prototype.TemplateLiteral?.name)

        const first = cst.children[0]

        // 简单模板：`hello` (无插值)
        if (first.name === Es6TokenConsumer.prototype.NoSubstitutionTemplate?.name) {
            // 直接转为StringLiteral，去掉前后的反引号
            const raw = first.value || ''
            const cooked = raw.slice(1, -1) // 去掉 ` 和 `
            return SlimeAstUtil.createStringLiteral(`"${cooked}"`)
        }

        // 带插值模板：`hello ${name}` 或 `a ${x} b ${y} c`
        const quasis: any[] = []
        const expressions: SlimeExpression[] = []

        // children[0] = TemplateHead
        if (first.name === Es6TokenConsumer.prototype.TemplateHead?.name) {
            const raw = first.value || ''
            const cooked = raw.slice(1, -2) // 去掉 ` 和 ${
            quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, first.loc))
        }

        // children[1] = Expression
        if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.Expression?.name) {
            expressions.push(this.createExpressionAst(cst.children[1]))
        }

        // children[2] = TemplateSpans
        if (cst.children[2] && cst.children[2].name === Es6Parser.prototype.TemplateSpans?.name) {
            this.processTemplateSpans(cst.children[2], quasis, expressions)
        }

        return SlimeAstUtil.createTemplateLiteral(quasis, expressions, cst.loc)
    }

    // 处理TemplateSpans：可能是TemplateTail或TemplateMiddleList+TemplateTail
    processTemplateSpans(cst: SubhutiCst, quasis: any[], expressions: SlimeExpression[]): void {
        const first = cst.children[0]

        // 情况1：直接是TemplateTail -> }` 结束
        if (first.name === Es6TokenConsumer.prototype.TemplateTail?.name) {
            const raw = first.value || ''
            const cooked = raw.slice(1, -1) // 去掉 } 和 `
            quasis.push(SlimeAstUtil.createTemplateElement(true, raw, cooked, first.loc))
            return
        }

        // 情况2：TemplateMiddleList -> 有更多插值
        if (first.name === Es6Parser.prototype.TemplateMiddleList?.name) {
            this.processTemplateMiddleList(first, quasis, expressions)

            // 然后处理TemplateTail
            if (cst.children[1] && cst.children[1].name === Es6TokenConsumer.prototype.TemplateTail?.name) {
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

        if (cst.children[0] && cst.children[0].name === Es6TokenConsumer.prototype.TemplateMiddle?.name) {
            const middle = cst.children[0]
            const raw = middle.value || ''
            const cooked = raw.slice(1, -2) // 去掉 } 和 ${
            quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, middle.loc))
        }

        if (cst.children[1] && cst.children[1].name === Es6Parser.prototype.Expression?.name) {
            expressions.push(this.createExpressionAst(cst.children[1]))
        }

        // 递归处理下一个TemplateMiddleList
        if (cst.children[2] && cst.children[2].name === Es6Parser.prototype.TemplateMiddleList?.name) {
            this.processTemplateMiddleList(cst.children[2], quasis, expressions)
        }
    }

    createObjectExpressionAst(cst: SubhutiCst): SlimeObjectExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ObjectLiteral?.name);
        const ary: Array<SlimeProperty> = []
        if (cst.children.length > 2) {
            const PropertyDefinitionListCst = cst.children[1]
            for (const child of PropertyDefinitionListCst.children) {
                // 跳过没有children的PropertyDefinition节点（SubhutiParser优化导致）
                if (child.name === Es6Parser.prototype.PropertyDefinition?.name && child.children && child.children.length > 0) {
                    const property = this.createPropertyDefinitionAst(child)
                    ary.push(property)
                }
            }
        }
        return SlimeAstUtil.createObjectExpression(ary)
    }

    createClassExpressionAst(cst: SubhutiCst): SlimeClassExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassExpression?.name);

        let id: SlimeIdentifier | null = null // class 表达式可选的标识符
        let tailStartIndex = 1 // 默认 ClassTail 位于索引 1
        const nextChild = cst.children[1]
        if (nextChild && nextChild.name === Es6Parser.prototype.BindingIdentifier?.name) {
            id = this.createBindingIdentifierAst(nextChild) // 若存在标识符则解析
            tailStartIndex = 2 // ClassTail 的位置后移
        }
        const classTail = this.createClassTailAst(cst.children[tailStartIndex]) // 统一解析 ClassTail

        return SlimeAstUtil.createClassExpression(id, classTail.superClass, classTail.body, cst.loc) // 生成 ClassExpression AST
    }

    createPropertyDefinitionAst(cst: SubhutiCst): SlimeProperty {
        const astName = checkCstName(cst, Es6Parser.prototype.PropertyDefinition?.name);

        // 防御性检查：如果 children 为空，说明是空对象的情况，不应该被调用
        // 这种情况通常不会发生，因为空对象{}不会有PropertyDefinition节点
        if (!cst.children || cst.children.length === 0) {
            throw new Error('PropertyDefinition CST has no children - this should not happen for valid syntax');
        }

        const first = cst.children[0]

        // ES2018: 对象spread {...obj}
        // 检查first是否是Ellipsis token（name为'EllipsisTok'）
        if (first.name === 'EllipsisTok' || first.value === '...') {
            // PropertyDefinition -> Ellipsis + AssignmentExpression
            const AssignmentExpressionCst = cst.children[1]
            const argument = this.createAssignmentExpressionAst(AssignmentExpressionCst)

            // 返回SpreadElement（作为Property的一种特殊形式）
            return {
                type: SlimeAstType.SpreadElement,
                argument: argument,
                loc: cst.loc
            } as any
        } else if (cst.children.length > 2) {
            // PropertyName : AssignmentExpression（完整形式）
            const PropertyNameCst = cst.children[0]
            const AssignmentExpressionCst = cst.children[2]

            const key = this.createPropertyNameAst(PropertyNameCst)
            const value = this.createAssignmentExpressionAst(AssignmentExpressionCst)

            const keyAst = SlimeAstUtil.createPropertyAst(key, value)

            // 检查是否是计算属性名
            if (PropertyNameCst.children[0].name === Es6Parser.prototype.ComputedPropertyName?.name) {
                keyAst.computed = true
            }

            return keyAst
        } else if (first.name === Es6Parser.prototype.MethodDefinition?.name) {
            // 方法定义（对象中的方法没有static）
            const SlimeMethodDefinition = this.createMethodDefinitionAst(null, first)

            const keyAst = SlimeAstUtil.createPropertyAst(SlimeMethodDefinition.key, SlimeMethodDefinition.value)

            // 继承MethodDefinition的computed标志
            if (SlimeMethodDefinition.computed) {
                keyAst.computed = true
            }

            return keyAst
        } else if (first.name === Es6Parser.prototype.IdentifierReference?.name) {
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
        if (!cst || !cst.children || cst.children.length === 0) {
            throw new Error('createPropertyNameAst: invalid cst or no children')
        }

        const first = cst.children[0]

        if (first.name === Es6Parser.prototype.LiteralPropertyName?.name || first.name === 'LiteralPropertyName') {
            return this.createLiteralPropertyNameAst(first)
        } else if (first.name === Es6Parser.prototype.ComputedPropertyName?.name || first.name === 'ComputedPropertyName') {
            // [expression]: value
            // ComputedPropertyName -> LBracket + AssignmentExpression + RBracket
            return this.createAssignmentExpressionAst(first.children[1])
        }
        // 回退：可能first直接就是 LiteralPropertyName 的内容
        return this.createLiteralPropertyNameAst(first)
    }

    createLiteralPropertyNameAst(cst: SubhutiCst): SlimeIdentifier | SlimeLiteral {
        if (!cst) {
            throw new Error('createLiteralPropertyNameAst: cst is null')
        }

        // 可能是 LiteralPropertyName 节点，也可能直接是内部节点
        let first = cst
        if (cst.name === Es6Parser.prototype.LiteralPropertyName?.name || cst.name === 'LiteralPropertyName') {
            if (!cst.children || cst.children.length === 0) {
                throw new Error('createLiteralPropertyNameAst: LiteralPropertyName has no children')
            }
            first = cst.children[0]
        }

        // Identifier (旧版)
        if (first.name === Es6TokenConsumer.prototype.Identifier?.name || first.name === 'Identifier') {
            return this.createIdentifierAst(first)
        }
        // IdentifierName (Es2025Parser)
        else if (first.name === 'IdentifierName' || first.name === Es6Parser.prototype.IdentifierName?.name) {
            // IdentifierName 内部包含一个 Identifier 或关键字 token
            const tokenCst = first.children[0]
            return SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
        }
        // NumericLiteral
        else if (first.name === Es6TokenConsumer.prototype.NumericLiteral?.name || first.name === 'NumericLiteral' || first.name === 'Number') {
            return this.createNumericLiteralAst(first)
        }
        // StringLiteral
        else if (first.name === Es6TokenConsumer.prototype.StringLiteral?.name || first.name === 'StringLiteral' || first.name === 'String') {
            return this.createStringLiteralAst(first)
        }
        // 如果是直接的 token（有 value 属性），创建 Identifier
        else if (first.value !== undefined) {
            return SlimeAstUtil.createIdentifier(first.value, first.loc)
        }

        throw new Error(`createLiteralPropertyNameAst: Unknown type: ${first.name}`)
    }


    createNumericLiteralAst(cst: SubhutiCst): SlimeNumericLiteral {
        const astName = checkCstName(cst, Es6TokenConsumer.prototype.NumericLiteral?.name);
        return SlimeAstUtil.createNumericLiteral(Number(cst.value))
    }

    createStringLiteralAst(cst: SubhutiCst): SlimeStringLiteral {
        const astName = checkCstName(cst, Es6TokenConsumer.prototype.StringLiteral?.name);
        const value = cst.value
        const ast = SlimeAstUtil.createStringLiteral(value)
        return ast
    }

    createLiteralFromToken(token: any): SlimeExpression {
        const tokenName = token.tokenName
        if (tokenName === Es6TokenConsumer.prototype.NullTok?.name) {
            return SlimeAstUtil.createNullLiteralToken()
        } else if (tokenName === Es6TokenConsumer.prototype.TrueTok?.name) {
            return SlimeAstUtil.createBooleanLiteral(true)
        } else if (tokenName === Es6TokenConsumer.prototype.FalseTok?.name) {
            return SlimeAstUtil.createBooleanLiteral(false)
        } else if (tokenName === Es6TokenConsumer.prototype.NumericLiteral?.name) {
            return SlimeAstUtil.createNumericLiteral(Number(token.tokenValue))
        } else if (tokenName === Es6TokenConsumer.prototype.StringLiteral?.name) {
            return SlimeAstUtil.createStringLiteral(token.tokenValue)
        } else {
            throw new Error(`Unsupported literal token: ${tokenName}`)
        }
    }

    createArrayExpressionAst(cst: SubhutiCst): SlimeArrayExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ArrayLiteral?.name);
        // ArrayLiteral: [LBracket, ElementList?, RBracket]
        const elementList = cst.children.find(ch => ch.name === Es6Parser.prototype.ElementList?.name)
        const elements = elementList ? this.createElementListAst(elementList) : []
        const ast: SlimeArrayExpression = {
            type: 'ArrayExpression',
            elements: elements,
            loc: cst.loc
        }
        return ast
    }

    createElementListAst(cst: SubhutiCst): Array<null | SlimeExpression | SlimeSpreadElement> {
        const astName = checkCstName(cst, Es6Parser.prototype.ElementList?.name);
        const ast: Array<null | SlimeExpression | SlimeSpreadElement> = []

        // 遍历所有子节点，处理 AssignmentExpression、SpreadElement 和 Elision
        for (const child of cst.children) {
            if (child.name === Es6Parser.prototype.AssignmentExpression?.name) {
                ast.push(this.createAssignmentExpressionAst(child))
            } else if (child.name === Es6Parser.prototype.SpreadElement?.name) {
                ast.push(this.createSpreadElementAst(child))
            } else if (child.name === Es6Parser.prototype.Elision?.name) {
                // Elision 代表空元素：[1, , 3]
                ast.push(null)
            }
        }

        return ast
    }

    createSpreadElementAst(cst: SubhutiCst): SlimeSpreadElement {
        const astName = checkCstName(cst, Es6Parser.prototype.SpreadElement?.name);
        // SpreadElement: [Ellipsis, AssignmentExpression]
        const expression = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.AssignmentExpression?.name
        )
        if (!expression) {
            throw new Error('SpreadElement missing AssignmentExpression')
        }

        return {
            type: 'SpreadElement',
            argument: this.createAssignmentExpressionAst(expression),
            loc: cst.loc
        }
    }


    createLiteralAst(cst: SubhutiCst): SlimeLiteral {
        const astName = checkCstName(cst, Es6Parser.prototype.Literal?.name);
        const firstChild = cst.children[0]
        const firstValue = firstChild.value
        let value
        if (firstChild.name === Es6TokenConsumer.prototype.NumericLiteral?.name) {
            value = SlimeAstUtil.createNumericLiteral(Number(firstValue))
        } else if (firstChild.name === Es6TokenConsumer.prototype.TrueTok?.name) {
            value = SlimeAstUtil.createBooleanLiteral(true)
        } else if (firstChild.name === Es6TokenConsumer.prototype.FalseTok?.name) {
            value = SlimeAstUtil.createBooleanLiteral(false)
        } else if (firstChild.name === Es6TokenConsumer.prototype.NullTok?.name) {
            value = SlimeAstUtil.createNullLiteralToken()
        } else {
            value = SlimeAstUtil.createStringLiteral(firstValue)
        }
        value.loc = firstChild.loc
        return value
    }


    createAssignmentExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.AssignmentExpression?.name);

        if (cst.children.length === 1) {
            const child = cst.children[0]
            // 检查是否是箭头函数
            if (child.name === Es6Parser.prototype.ArrowFunction?.name) {
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
        // AssignmentOperator节点下有子节点(PlusEq/MinusEq等)，需要从children[0].value获取
        const operator = (operatorCst.children && operatorCst.children[0]?.value) || operatorCst.value || '='

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
        checkCstName(cst, Es6Parser.prototype.ArrowFunction?.name);
        // ArrowFunction 结构（带async）：
        // children[0]: AsyncTok (可选)
        // children[1]: BindingIdentifier 或 CoverParenthesizedExpressionAndArrowParameterList (参数)
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

        // 解析参数 - 根据节点类型分别处理
        let params: SlimePattern[];
        if (arrowParametersCst.name === Es6Parser.prototype.BindingIdentifier?.name) {
            // 单个参数：x => x * 2
            params = [this.createBindingIdentifierAst(arrowParametersCst)]
        } else if (arrowParametersCst.name === Es6Parser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
            // 括号参数：(a, b) => a + b 或 () => 42
            params = this.createArrowParametersFromCoverGrammar(arrowParametersCst)
        } else if (arrowParametersCst.name === Es6Parser.prototype.ArrowParameters?.name) {
            // 旧版：使用ArrowParameters规则
            params = this.createArrowParametersAst(arrowParametersCst)
        } else {
            throw new Error(`createArrowFunctionAst: 不支持的参数类型 ${arrowParametersCst.name}`)
        }

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
     * 创建 Async 箭头函数 AST
     * AsyncArrowFunction: async AsyncArrowBindingIdentifier => AsyncConciseBody
     *                   | CoverCallExpressionAndAsyncArrowHead => AsyncConciseBody
     */
    createAsyncArrowFunctionAst(cst: SubhutiCst): SlimeArrowFunctionExpression {
        // AsyncArrowFunction 结构：
        // 形式1: [AsyncTok, BindingIdentifier, Arrow, AsyncConciseBody]
        // 形式2: [CoverCallExpressionAndAsyncArrowHead, Arrow, AsyncConciseBody]

        let params: SlimePattern[] = []
        let body: SlimeExpression | SlimeBlockStatement
        let arrowIndex = -1

        // 找到 Arrow token 的位置
        for (let i = 0; i < cst.children.length; i++) {
            if (cst.children[i].name === 'Arrow' || cst.children[i].value === '=>') {
                arrowIndex = i
                break
            }
        }

        if (arrowIndex === -1) {
            throw new Error('createAsyncArrowFunctionAst: 找不到 Arrow token')
        }

        // 解析参数（Arrow 之前的部分）
        for (let i = 0; i < arrowIndex; i++) {
            const child = cst.children[i]
            if (child.name === 'AsyncTok') {
                continue // 跳过 async 关键字
            }
            if (child.name === Es6Parser.prototype.BindingIdentifier?.name || child.name === 'BindingIdentifier') {
                params = [this.createBindingIdentifierAst(child)]
            } else if (child.name === 'CoverCallExpressionAndAsyncArrowHead') {
                // 从 CoverCallExpressionAndAsyncArrowHead 提取参数
                params = this.createAsyncArrowParamsFromCover(child)
            } else if (child.name === Es6Parser.prototype.ArrowFormalParameters?.name || child.name === 'ArrowFormalParameters') {
                params = this.createArrowFormalParametersAst(child)
            }
        }

        // 解析函数体（Arrow 之后的部分）
        const bodyIndex = arrowIndex + 1
        if (bodyIndex < cst.children.length) {
            const bodyCst = cst.children[bodyIndex]
            if (bodyCst.name === 'AsyncConciseBody' || bodyCst.name === 'ConciseBody') {
                body = this.createConciseBodyAst(bodyCst)
            } else {
                body = this.createExpressionAst(bodyCst)
            }
        } else {
            body = SlimeAstUtil.createBlockStatement(null, null, [])
        }

        return {
            type: SlimeAstType.ArrowFunctionExpression,
            id: null,
            params: params,
            body: body,
            generator: false,
            async: true,
            expression: body.type !== SlimeAstType.BlockStatement,
            loc: cst.loc
        } as any
    }

    /**
     * 从 CoverCallExpressionAndAsyncArrowHead 提取 async 箭头函数参数
     */
    createAsyncArrowParamsFromCover(cst: SubhutiCst): SlimePattern[] {
        // CoverCallExpressionAndAsyncArrowHead 结构：
        // [MemberExpression, Arguments] 或类似结构
        // 我们需要从 Arguments 中提取参数

        const params: SlimePattern[] = []

        for (const child of cst.children || []) {
            if (child.name === 'Arguments' || child.name === Es6Parser.prototype.Arguments?.name) {
                // 从 Arguments 中提取参数
                for (const argChild of child.children || []) {
                    if (argChild.name === 'ArgumentList' || argChild.name === Es6Parser.prototype.ArgumentList?.name) {
                        for (const arg of argChild.children || []) {
                            if (arg.name === 'AssignmentExpression' || arg.name === Es6Parser.prototype.AssignmentExpression?.name) {
                                // 尝试将表达式转换为参数
                                const expr = this.createExpressionAst(arg)
                                if (expr.type === SlimeAstType.Identifier) {
                                    params.push(expr as any)
                                }
                            } else if (arg.name === Es6Parser.prototype.BindingIdentifier?.name || arg.name === 'BindingIdentifier') {
                                params.push(this.createBindingIdentifierAst(arg))
                            }
                        }
                    }
                }
            }
        }

        return params
    }

    /**
     * 从 ArrowFormalParameters 提取参数
     */
    createArrowFormalParametersAst(cst: SubhutiCst): SlimePattern[] {
        // ArrowFormalParameters: ( UniqueFormalParameters )
        const params: SlimePattern[] = []

        for (const child of cst.children || []) {
            if (child.name === 'UniqueFormalParameters' || child.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
                return this.createUniqueFormalParametersAst(child)
            }
            if (child.name === 'FormalParameters' || child.name === Es6Parser.prototype.FormalParameters?.name) {
                return this.createFormalParametersAst(child)
            }
        }

        return params
    }

    /**
     * 从CoverParenthesizedExpressionAndArrowParameterList提取箭头函数参数
     */
    createArrowParametersFromCoverGrammar(cst: SubhutiCst): SlimePattern[] {
        checkCstName(cst, Es6Parser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name);

        // CoverParenthesizedExpressionAndArrowParameterList 的children结构：
        // LParen + (FormalParameterList | Expression | ...) + RParen

        if (cst.children.length === 0) {
            return []
        }

        // () - 空参数
        if (cst.children.length === 2) {
            return []
        }

        // 查找FormalParameterList
        const formalParameterListCst = cst.children.find(
            child => child.name === Es6Parser.prototype.FormalParameterList?.name
        )
        if (formalParameterListCst) {
            return this.createFormalParameterListAst(formalParameterListCst)
        }

        // 查找Expression（可能是逗号表达式，如 (a, b) 或单个参数 (x)）
        const expressionCst = cst.children.find(
            child => child.name === Es6Parser.prototype.Expression?.name
        )
        if (expressionCst) {
            // 从Expression中提取参数列表
            return this.extractParametersFromExpression(expressionCst)
        }

        // 查找BindingIdentifier（单个rest参数，如 (...args)）
        const bindingIdentifierCst = cst.children.find(
            child => child.name === Es6Parser.prototype.BindingIdentifier?.name
        )
        if (bindingIdentifierCst) {
            // 检查是否有Ellipsis
            const hasEllipsis = cst.children.some(
                child => child.name === 'EllipsisTok'
            )
            if (hasEllipsis) {
                // Rest参数
                return [{
                    type: SlimeAstType.RestElement,
                    argument: this.createBindingIdentifierAst(bindingIdentifierCst)
                } as any]
            }
            return [this.createBindingIdentifierAst(bindingIdentifierCst)]
        }

        return []
    }

    /**
     * 从Expression中提取箭头函数参数
     * 处理逗号表达式 (a, b) 或单个参数 (x)
     */
    extractParametersFromExpression(expressionCst: SubhutiCst): SlimePattern[] {
        // Expression可能是：
        // 1. 单个Identifier: x
        // 2. 逗号表达式: a, b 或 a, b, c
        // 3. 赋值表达式（默认参数）: a = 1

        // 检查是否是AssignmentExpression
        if (expressionCst.name === Es6Parser.prototype.AssignmentExpression?.name) {
            const assignmentAst = this.createAssignmentExpressionAst(expressionCst)
            // 如果是简单的identifier，返回它
            if (assignmentAst.type === SlimeAstType.Identifier) {
                return [assignmentAst as any]
            }
            // 如果是赋值（默认参数），返回AssignmentPattern
            if (assignmentAst.type === SlimeAstType.AssignmentExpression) {
                return [{
                    type: 'AssignmentPattern',
                    left: assignmentAst.left,
                    right: assignmentAst.right
                } as any]
            }
            return [assignmentAst as any]
        }

        // 如果是Expression，检查children
        if (expressionCst.children && expressionCst.children.length > 0) {
            const params: SlimePattern[] = []

            // 遍历children，查找所有AssignmentExpression（用逗号分隔）
            for (const child of expressionCst.children) {
                if (child.name === Es6Parser.prototype.AssignmentExpression?.name) {
                    const assignmentAst = this.createAssignmentExpressionAst(child)
                    // 转换为参数
                    if (assignmentAst.type === SlimeAstType.Identifier) {
                        params.push(assignmentAst as any)
                    } else if (assignmentAst.type === SlimeAstType.AssignmentExpression) {
                        // 默认参数
                        params.push({
                            type: 'AssignmentPattern',
                            left: assignmentAst.left,
                            right: assignmentAst.right
                        } as any)
                    } else {
                        // 其他复杂情况，尝试提取identifier
                        const identifier = this.findFirstIdentifierInExpression(child)
                        if (identifier) {
                            params.push(this.createIdentifierAst(identifier) as any)
                        }
                    }
                }
            }

            if (params.length > 0) {
                return params
            }
        }

        // 回退：尝试查找第一个identifier
        const identifierCst = this.findFirstIdentifierInExpression(expressionCst)
        if (identifierCst) {
            return [this.createIdentifierAst(identifierCst) as any]
        }

        return []
    }

    /**
     * 在Expression中查找第一个Identifier（辅助方法）
     */
    findFirstIdentifierInExpression(cst: SubhutiCst): SubhutiCst | null {
        if (cst.name === Es6TokenConsumer.prototype.Identifier?.name) {
            return cst
        }
        if (cst.children) {
            for (const child of cst.children) {
                const found = this.findFirstIdentifierInExpression(child)
                if (found) return found
            }
        }
        return null
    }

    /**
     * 创建箭头函数参数 AST
     */
    createArrowParametersAst(cst: SubhutiCst): SlimePattern[] {
        checkCstName(cst, Es6Parser.prototype.ArrowParameters?.name);

        // ArrowParameters 可以是多种形式，这里简化处理
        if (cst.children.length === 0) {
            return []
        }

        const first = cst.children[0]

        // 单个参数：BindingIdentifier
        if (first.name === Es6Parser.prototype.BindingIdentifier?.name) {
            const param = this.createBindingIdentifierAst(first)
            return [param]
        }

        // 参数列表：( FormalParameterList )
        if (first.name === Es6TokenConsumer.prototype.LParen?.name) {
            // 查找 FormalParameterList
            const formalParameterListCst = cst.children.find(
                child => child.name === Es6Parser.prototype.FormalParameterList?.name
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

        // 支持 ConciseBody 和 AsyncConciseBody
        const validNames = [
            Es6Parser.prototype.ConciseBody?.name,
            'ConciseBody',
            'AsyncConciseBody'
        ]
        if (!validNames.includes(cst.name)) {
            throw new Error(`createConciseBodyAst: 期望 ConciseBody 或 AsyncConciseBody，实际 ${cst.name}`)
        }

        const first = cst.children[0]

        // 如果是 BlockStatement，解析为 BlockStatement
        if (first.name === Es6Parser.prototype.FunctionBodyDefine?.name) {
            return this.createFunctionBodyDefineAst(first)
        }

        // Es2025Parser: { FunctionBody } 格式
        // children: [LBrace, FunctionBody, RBrace]
        if (first.name === 'LBrace') {
            // 找到 FunctionBody
            const functionBodyCst = cst.children.find(child =>
                child.name === 'FunctionBody' || child.name === Es6Parser.prototype.FunctionBody?.name
            )
            if (functionBodyCst) {
                const bodyStatements = this.createFunctionBodyAst(functionBodyCst)
                return SlimeAstUtil.createBlockStatement(null, null, bodyStatements, cst.loc)
            }
            // 空函数体
            return SlimeAstUtil.createBlockStatement(null, null, [], cst.loc)
        }

        // 否则是表达式，解析为表达式
        if (first.name === Es6Parser.prototype.AssignmentExpression?.name || first.name === 'AssignmentExpression') {
            return this.createAssignmentExpressionAst(first)
        }

        // Es2025Parser: ExpressionBody 类型
        if (first.name === 'ExpressionBody') {
            // ExpressionBody 内部包含 AssignmentExpression
            const innerExpr = first.children[0]
            if (innerExpr) {
                if (innerExpr.name === 'AssignmentExpression' || innerExpr.name === Es6Parser.prototype.AssignmentExpression?.name) {
                    return this.createAssignmentExpressionAst(innerExpr)
                }
                return this.createExpressionAst(innerExpr)
            }
        }

        return this.createExpressionAst(first)
    }

    createConditionalExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ConditionalExpression?.name);
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
        if (cst.children[1] && cst.children[1].name === Es6TokenConsumer.prototype.Asterisk?.name) {
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
        checkCstName(cst, Es6Parser.prototype.AwaitExpression?.name);
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
