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
} from "slime-ast/src/SlimeESTree.ts";
import SubhutiCst, {type SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";
import Es2025Parser from "./es2025/Es2025Parser.ts";
import Es2025TokenConsumer from "./es2025/Es2025TokenConsumer.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAstCreate.ts";
import SlimeTokenCreate from "slime-ast/src/SlimeTokenCreate.ts";
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

        // ES2025 Parser: Identifier 规则内部调用 IdentifierNameTok()
        // 所以 CST 结构是：Identifier -> IdentifierNameTok (token with value)
        let value: string
        if (cst.value !== undefined && cst.value !== null) {
            // 直接是 token（旧版兼容）
            value = cst.value as string
        } else if (cst.children && cst.children.length > 0) {
            // ES2025: Identifier 规则，子节点是 IdentifierNameTok
            const tokenCst = cst.children[0]
            if (tokenCst.value !== undefined) {
                value = tokenCst.value as string
            } else {
                throw new Error(`createIdentifierAst: Cannot extract value from Identifier CST`)
            }
        } else {
            throw new Error(`createIdentifierAst: Invalid Identifier CST structure`)
        }

        // 解码 Unicode 转义序列（如 \u0061 -> a）
        const decodedName = decodeUnicodeEscapes(value)
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

        // 处理 ModuleBody 中间层（ES2025 规范）
        if (first.name === 'ModuleBody') {
            const moduleItemList = first.children?.[0]
            if (moduleItemList && (moduleItemList.name === 'ModuleItemList' || moduleItemList.name === Es6Parser.prototype.ModuleItemList?.name)) {
                const body = this.createModuleItemListAst(moduleItemList)
                program = SlimeAstUtil.createProgram(body, 'module')
            } else {
                program = SlimeAstUtil.createProgram([], 'module')
            }
        } else if (first.name === Es6Parser.prototype.ModuleItemList?.name || first.name === 'ModuleItemList') {
            const body = this.createModuleItemListAst(first)
            program = SlimeAstUtil.createProgram(body, 'module')
        } else if (first.name === 'ScriptBody') {
            // 处理 ScriptBody 中间层（ES2025 规范）
            const statementList = first.children?.[0]
            if (statementList && (statementList.name === 'StatementList' || statementList.name === Es6Parser.prototype.StatementList?.name)) {
                const body = this.createStatementListAst(statementList)
                program = SlimeAstUtil.createProgram(body, 'script')
            } else {
                program = SlimeAstUtil.createProgram([], 'script')
            }
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

        // Token fields
        let importToken: any = undefined
        let semicolonToken: any = undefined

        // 提取 import token
        if (first && (first.name === 'ImportTok' || first.value === 'import')) {
            importToken = SlimeTokenCreate.createImportToken(first.loc)
        }

        // 查找 semicolon
        const semicolonCst = cst.children.find(ch => ch.name === 'Semicolon' || ch.value === ';')
        if (semicolonCst) {
            semicolonToken = SlimeTokenCreate.createSemicolonToken(semicolonCst.loc)
        }

        if (first1.name === Es6Parser.prototype.ImportClause?.name) {
            specifiers = this.createImportClauseAst(first1)
            FromClause = this.createFromClauseAst(cst.children[2])
            importDeclaration = SlimeAstUtil.createImportDeclaration(
                specifiers, FromClause.from, FromClause.source, cst.loc,
                importToken, FromClause.fromToken, semicolonToken
            )
        } else if (first1.name === Es6Parser.prototype.ModuleSpecifier?.name) {
            // import 'module' (side effect import)
            const source = this.createModuleSpecifierAst(first1)
            importDeclaration = SlimeAstUtil.createImportDeclaration(
                [], undefined, source, cst.loc,
                importToken, undefined, semicolonToken
            )
        }
        return importDeclaration
    }


    createFromClauseAst(cst: SubhutiCst): SlimeImportDeclaration & { fromToken?: any } {
        let astName = checkCstName(cst, Es6Parser.prototype.FromClause?.name);
        const first = cst.children[0]
        const from = SlimeAstUtil.createFromKeyword(first.loc)
        const ModuleSpecifier = this.createModuleSpecifierAst(cst.children[1])

        // 提取 from token
        let fromToken: any = undefined
        if (first && (first.name === 'FromTok' || first.value === 'from')) {
            fromToken = SlimeTokenCreate.createFromToken(first.loc)
        }

        const result = SlimeAstUtil.createImportDeclaration(null, from, ModuleSpecifier) as any
        result.fromToken = fromToken
        return result
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
        let asteriskToken: any = undefined
        let asToken: any = undefined

        for (const child of cst.children) {
            if (child.name === 'Asterisk' || child.value === '*') {
                asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc)
            } else if (child.name === 'AsTok' || child.value === 'as') {
                asToken = SlimeTokenCreate.createAsToken(child.loc)
            }
        }

        const binding = cst.children.find(ch => ch.name === Es6Parser.prototype.ImportedBinding?.name)
        if (!binding) throw new Error('NameSpaceImport missing ImportedBinding')
        const local = this.createImportedBindingAst(binding)

        return SlimeAstUtil.createImportNamespaceSpecifier(local, cst.loc, asteriskToken, asToken)
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
        // BindingIdentifier 结构：
        // ES2025: BindingIdentifier -> Identifier -> IdentifierNameTok
        // 或者: BindingIdentifier -> YieldTok | AwaitTok
        const first = cst.children[0]

        // 如果第一个子节点是 Identifier 规则
        if (first.name === 'Identifier' || first.name === Es6Parser.prototype.Identifier?.name) {
            // Identifier 规则内部包含 IdentifierNameTok
            const tokenCst = first.children?.[0]
            if (tokenCst && tokenCst.value !== undefined) {
                return SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
            }
        }

        // 直接是 token 的情况（YieldTok, AwaitTok, 或旧版直接的 token）
        if (first.value !== undefined) {
            return SlimeAstUtil.createIdentifier(first.value, first.loc)
        }

        throw new Error(`createBindingIdentifierAst: Cannot extract identifier value from ${first.name}`)
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
        // var 变量声明语句 (ES2025: VariableStatement)
        else if (cst.name === Es6Parser.prototype.VariableStatement?.name || cst.name === 'VariableStatement') {
            return this.createVariableStatementAst(cst)
        }
        // 变量声明 (用于 for 循环等)
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

        // Token fields
        let exportToken: any = undefined
        let defaultToken: any = undefined
        let asteriskToken: any = undefined
        let semicolonToken: any = undefined

        // 提取 export token
        if (first && (first.name === 'ExportTok' || first.value === 'export')) {
            exportToken = SlimeTokenCreate.createExportToken(first.loc)
        }

        let token = SlimeAstUtil.createExportToken(first.loc)

        if (first1.name === Es6Parser.prototype.AsteriskFromClauseEmptySemicolon?.name) {
            // export * from './module.js'
            const asteriskCst = first1.children.find((ch: any) => ch.name === 'Asterisk' || ch.value === '*')
            if (asteriskCst) {
                asteriskToken = SlimeTokenCreate.createAsteriskToken(asteriskCst.loc)
            }
            const semicolonCst = first1.children.find((ch: any) => ch.name === 'Semicolon' || ch.value === ';')
            if (semicolonCst) {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(semicolonCst.loc)
            }

            const source = first1.children.find((ch: any) => ch.name === Es6Parser.prototype.FromClause?.name)
            if (source) {
                const fromClause = this.createFromClauseAst(source)
                return SlimeAstUtil.createExportAllDeclaration(
                    fromClause.source, null, cst.loc,
                    exportToken, asteriskToken, undefined, fromClause.fromToken, semicolonToken
                )
            }
        } else if (first1.name === Es6Parser.prototype.ExportClauseFromClauseEmptySemicolon?.name) {
            // export {name, age} from './module.js'
            const exportClause = first1.children.find((ch: any) =>
                ch.name === Es6Parser.prototype.ExportClause?.name)
            const source = first1.children.find((ch: any) => ch.name === Es6Parser.prototype.FromClause?.name)

            const specifiers = exportClause ? this.createExportClauseAst(exportClause) : []

            if (source) {
                const fromClause = this.createFromClauseAst(source)
                return SlimeAstUtil.createExportNamedDeclaration(token, null, specifiers, fromClause.source, cst.loc, exportToken, fromClause.fromToken)
            }
        } else if (first1.name === Es6Parser.prototype.ExportClauseEmptySemicolon?.name) {
            // export {name, age} 或 export {name as userName}
            const exportClause = first1.children.find((ch: any) =>
                ch.name === Es6Parser.prototype.ExportClause?.name)
            const specifiers = exportClause ? this.createExportClauseAst(exportClause) : []
            return SlimeAstUtil.createExportNamedDeclaration(token, null, specifiers, null, cst.loc, exportToken)
        } else if (first1.name === Es6Parser.prototype.Declaration?.name) {
            const declaration = this.createDeclarationAst(cst.children[1])

            return SlimeAstUtil.createExportNamedDeclaration(token, declaration, [], null, cst.loc, exportToken)

        } else if (first1.name === Es6Parser.prototype.DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression?.name) {
            // export default 后面的内容
            // DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression 的子节点：
            // [0] = DefaultTok
            // [1] = HoistableDeclaration | ClassDeclaration | AssignmentExpression
            const defaultTokCst = first1.children?.[0]
            if (defaultTokCst && (defaultTokCst.name === 'DefaultTok' || defaultTokCst.value === 'default')) {
                defaultToken = SlimeTokenCreate.createDefaultToken(defaultTokCst.loc)
            }
            const defaultExportCst = first1.children?.[1]
            if (!defaultExportCst) {
                throw new Error('export default 后面缺少内容')
            }
            const del = this.createDefaultExportDeclarationAst(defaultExportCst)
            return SlimeAstUtil.createExportDefaultDeclaration(del, cst.loc, exportToken, defaultToken)
        } else if (first1.name === 'DefaultTok' || first1.value === 'default') {
            // Es2025Parser: export default 后面的内容直接作为兄弟节点
            // children: [ExportTok, DefaultTok, HoistableDeclaration | ClassDeclaration | AssignmentExpression, ...]
            defaultToken = SlimeTokenCreate.createDefaultToken(first1.loc)
            const defaultExportCst = cst.children[2]
            if (!defaultExportCst) {
                throw new Error('export default 后面缺少内容')
            }
            const del = this.createDefaultExportDeclarationAst(defaultExportCst)
            return SlimeAstUtil.createExportDefaultDeclaration(del, cst.loc, exportToken, defaultToken)
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
        // ES2025 LexicalDeclaration: LetOrConst BindingList ;
        // BindingList: LexicalBinding (, LexicalBinding)*
        // LexicalBinding: BindingIdentifier Initializer? | BindingPattern Initializer

        const children = cst.children || []
        let kind: string = 'const' // 默认值
        const declarations: any[] = []

        for (const child of children) {
            if (!child) continue
            const name = child.name

            // Skip tokens (semicolons, commas)
            if (child.loc?.type === 'Semicolon' || child.value === ';' || child.value === ',') {
                continue
            }

            // LetOrConst 规则
            if (name === Es6Parser.prototype.LetOrConst?.name || name === 'LetOrConst') {
                // 内部是 LetTok 或 ConstTok
                if (child.children && child.children.length > 0) {
                    const tokenCst = child.children[0]
                    kind = tokenCst.value as string || 'const'
                }
                continue
            }

            // 直接是 LetTok 或 ConstTok (ES2025 可能直接使用)
            if (name === 'LetTok' || child.value === 'let') {
                kind = 'let'
                continue
            }
            if (name === 'ConstTok' || child.value === 'const') {
                kind = 'const'
                continue
            }

            // Handle BindingList wrapper
            if (name === 'BindingList' || name === Es6Parser.prototype.BindingList?.name) {
                for (const binding of child.children || []) {
                    if (binding.name === 'LexicalBinding' || binding.name === Es6Parser.prototype.LexicalBinding?.name) {
                        declarations.push(this.createLexicalBindingAst(binding))
                    }
                    // Skip commas
                    if (binding.value === ',') continue
                }
                continue
            }

            // Direct LexicalBinding
            if (name === 'LexicalBinding' || name === Es6Parser.prototype.LexicalBinding?.name) {
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
        let assignToken: any = undefined

        for (const child of children) {
            if (!child) continue

            const name = child.name
            if (name === Es6Parser.prototype.BindingIdentifier?.name || name === 'BindingIdentifier') {
                id = this.createBindingIdentifierAst(child)
            } else if (name === Es6Parser.prototype.BindingPattern?.name || name === 'BindingPattern') {
                id = this.createBindingPatternAst(child)
            } else if (name === Es6Parser.prototype.Initializer?.name || name === 'Initializer') {
                // Initializer: = AssignmentExpression
                // children[0] 是 Assign token，children[1] 是 AssignmentExpression
                if (child.children && child.children[0]) {
                    const assignCst = child.children[0]
                    assignToken = SlimeTokenCreate.createAssignToken(assignCst.loc)
                }
                init = this.createInitializerAst(child)
            }
        }

        return SlimeAstUtil.createVariableDeclarator(id, assignToken, init, cst.loc)
    }

    /**
     * 创建 var 变量声明语句 AST
     * ES2025 VariableStatement: var VariableDeclarationList ;
     */
    createVariableStatementAst(cst: SubhutiCst): SlimeVariableDeclaration {
        const children = cst.children || []
        const declarations: SlimeVariableDeclarator[] = []

        // 查找 VariableDeclarationList
        for (const child of children) {
            if (!child) continue

            if (child.name === Es6Parser.prototype.VariableDeclarationList?.name ||
                child.name === 'VariableDeclarationList') {
                // VariableDeclarationList 包含多个 VariableDeclaration
                for (const varDeclCst of child.children || []) {
                    if (varDeclCst.name === Es6Parser.prototype.VariableDeclaration?.name ||
                        varDeclCst.name === 'VariableDeclaration') {
                        declarations.push(this.createVariableDeclaratorFromVarDeclaration(varDeclCst))
                    }
                }
            }
        }

        return {
            type: SlimeAstType.VariableDeclaration,
            kind: 'var' as any,
            declarations: declarations,
            loc: cst.loc
        } as any
    }

    /**
     * 从 VariableDeclaration CST 创建 VariableDeclarator AST
     * VariableDeclaration: BindingIdentifier Initializer? | BindingPattern Initializer
     */
    createVariableDeclaratorFromVarDeclaration(cst: SubhutiCst): SlimeVariableDeclarator {
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

        // Token fields
        let classToken: any = undefined

        // 提取 class token
        const classTokCst = cst.children.find(ch => ch.name === 'ClassTok' || ch.value === 'class')
        if (classTokCst) {
            classToken = SlimeTokenCreate.createClassToken(classTokCst.loc)
        }

        // 获取类名标识符（children[1] 是 BindingIdentifier）
        const id = this.createBindingIdentifierAst(cst.children[1])
        // 解析 ClassTail，获取类体和父类信息（children[2] 是 ClassTail）
        const classTailResult = this.createClassTailAst(cst.children[2])

        // 创建类声明 AST 节点
        const ast = SlimeAstUtil.createClassDeclaration(
            id, classTailResult.body, classTailResult.superClass, cst.loc,
            classToken, classTailResult.extendsToken
        )

        return ast
    }

    createClassTailAst(cst: SubhutiCst): {
        superClass: SlimeExpression | null;
        body: SlimeClassBody;
        extendsToken?: any;
        lBraceToken?: any;
        rBraceToken?: any;
    } {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassTail?.name);
        let superClass: SlimeExpression | null = null // 超类默认为 null
        let body: SlimeClassBody = {type: SlimeAstType.ClassBody as any, body: [], loc: cst.loc} // 默认空类体
        let extendsToken: any = undefined
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined

        // ClassTail = ClassHeritage? { ClassBody? }
        // 遍历 children 找到 ClassHeritage 和 ClassBody
        for (const child of cst.children) {
            if (child.name === Es6Parser.prototype.ClassHeritage?.name) {
                const heritageResult = this.createClassHeritageAstWithToken(child)
                superClass = heritageResult.superClass
                extendsToken = heritageResult.extendsToken
            } else if (child.name === Es6Parser.prototype.ClassBody?.name) {
                body = this.createClassBodyAst(child)
            } else if (child.name === 'LBrace' || child.value === '{') {
                lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc)
            } else if (child.name === 'RBrace' || child.value === '}') {
                rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc)
            }
        }

        // 设置 body 的 brace tokens
        if (body) {
            body.lBraceToken = lBraceToken
            body.rBraceToken = rBraceToken
        }

        return {superClass, body, extendsToken, lBraceToken, rBraceToken}
    }

    createClassHeritageAst(cst: SubhutiCst): SlimeExpression {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassHeritage?.name);
        return this.createLeftHandSideExpressionAst(cst.children[1]) // ClassHeritage -> extends + LeftHandSideExpression
    }

    createClassHeritageAstWithToken(cst: SubhutiCst): { superClass: SlimeExpression; extendsToken?: any } {
        const astName = checkCstName(cst, Es6Parser.prototype.ClassHeritage?.name);
        let extendsToken: any = undefined

        // ClassHeritage: extends LeftHandSideExpression
        const extendsCst = cst.children.find(ch => ch.name === 'ExtendsTok' || ch.value === 'extends')
        if (extendsCst) {
            extendsToken = SlimeTokenCreate.createExtendsToken(extendsCst.loc)
        }

        const superClass = this.createLeftHandSideExpressionAst(cst.children[1])
        return { superClass, extendsToken }
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
        const isStatic = this.isStaticModifier(staticCst)

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
     * 检测 ClassElementName/PropertyName 是否是计算属性名
     */
    isComputedPropertyName(cst: SubhutiCst): boolean {
        if (!cst || !cst.children) return false

        // 递归查找 ComputedPropertyName
        function hasComputedPropertyName(node: SubhutiCst): boolean {
            if (!node) return false
            if (node.name === 'ComputedPropertyName' || node.name === Es6Parser.prototype.ComputedPropertyName?.name) {
                return true
            }
            if (node.children) {
                for (const child of node.children) {
                    if (hasComputedPropertyName(child)) return true
                }
            }
            return false
        }

        return hasComputedPropertyName(cst)
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

    /**
     * 检查 CST 节点是否表示 static 修饰符
     * 兼容 StaticTok 和 IdentifierNameTok (value='static') 两种情况
     */
    isStaticModifier(cst: SubhutiCst | null): boolean {
        if (!cst) return false
        // 方式1：直接是 StaticTok
        if (cst.name === Es6TokenConsumer.prototype.StaticTok?.name || cst.name === 'StaticTok') {
            return true
        }
        // 方式2：是 IdentifierNameTok 且 value 为 'static'
        if ((cst.name === 'IdentifierNameTok' || cst.name === 'IdentifierName') && cst.value === 'static') {
            return true
        }
        return false
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
                !this.isStaticModifier(staticCst)

            // 如果有 static 修饰符
            if (this.isStaticModifier(staticCst)) {
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
            // 检查是否是 getter/setter
            if (first.value === 'get' && cst.children[1]?.name === 'ClassElementName') {
                // getter方法：get ClassElementName ( ) { FunctionBody }
                return this.createEs2025GetterMethodFromIdentifier(staticCst, cst)
            } else if (first.value === 'set' && cst.children[1]?.name === 'ClassElementName') {
                // setter方法：set ClassElementName ( PropertySetParameterList ) { FunctionBody }
                return this.createEs2025SetterMethodFromIdentifier(staticCst, cst)
            }
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

        // Token fields
        let staticToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined
        const commaTokens: any[] = []

        // 检查 static token
        if (staticCst && (staticCst.name === 'StaticTok' || staticCst.value === 'static')) {
            staticToken = SlimeTokenCreate.createStaticToken(staticCst.loc)
        }

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

        // LParen
        if (children[i]?.name === 'LParen' || children[i]?.value === '(') {
            lParenToken = SlimeTokenCreate.createLParenToken(children[i].loc)
            i++
        }

        // UniqueFormalParameters
        let params: SlimePattern[] = []
        if (children[i]?.name === 'UniqueFormalParameters' || children[i]?.name === Es6Parser.prototype.UniqueFormalParameters?.name) {
            params = this.createUniqueFormalParametersAst(children[i])
            i++
        } else if (children[i]?.name === 'FormalParameters' || children[i]?.name === Es6Parser.prototype.FormalParameters?.name) {
            params = this.createFormalParametersAst(children[i])
            i++
        }

        // RParen
        if (children[i]?.name === 'RParen' || children[i]?.value === ')') {
            rParenToken = SlimeTokenCreate.createRParenToken(children[i].loc)
            i++
        }
        // LBrace
        if (children[i]?.name === 'LBrace' || children[i]?.value === '{') {
            lBraceToken = SlimeTokenCreate.createLBraceToken(children[i].loc)
            i++
        }

        // FunctionBody
        let body: SlimeBlockStatement
        if (children[i]?.name === 'FunctionBody' || children[i]?.name === Es6Parser.prototype.FunctionBody?.name) {
            const bodyStatements = this.createFunctionBodyAst(children[i])
            body = SlimeAstUtil.createBlockStatement(bodyStatements, children[i].loc, lBraceToken, rBraceToken)
            i++
        } else {
            body = SlimeAstUtil.createBlockStatement([], undefined, lBraceToken, rBraceToken)
        }

        // RBrace
        if (children[i]?.name === 'RBrace' || children[i]?.value === '}') {
            rBraceToken = SlimeTokenCreate.createRBraceToken(children[i].loc)
        }

        // 创建函数表达式
        const functionExpression = SlimeAstUtil.createFunctionExpression(
            body, null, params, false, false, cst.loc,
            undefined, undefined, undefined, lParenToken, rParenToken, lBraceToken, rBraceToken
        )

        const methodDef = SlimeAstUtil.createMethodDefinition(key, functionExpression, 'method', false, cst.loc, staticToken)

        // 检查是否是 constructor
        const isConstructor = key.type === "Identifier" && (key as SlimeIdentifier).name === "constructor" &&
            !this.isStaticModifier(staticCst)

        if (this.isStaticModifier(staticCst)) {
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

        // 检查是否是计算属性
        methodDef.computed = this.isComputedPropertyName(classElementNameCst)

        // 检查是否是 constructor
        const isConstructor = key.type === "Identifier" && key.name === "constructor" &&
            !this.isStaticModifier(staticCst)

        if (this.isStaticModifier(staticCst)) {
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

        if (this.isStaticModifier(staticCst)) {
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

        if (this.isStaticModifier(staticCst)) {
            methodDef.static = true
        }

        return methodDef
    }

    /**
     * Es2025Parser: getter方法 (从 IdentifierNameTok="get" 开始的 MethodDefinition)
     * children: [IdentifierNameTok="get", ClassElementName, LParen, RParen, LBrace, FunctionBody?, RBrace]
     */
    createEs2025GetterMethodFromIdentifier(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        const children = cst.children
        let i = 1 // 跳过 IdentifierNameTok="get"

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen, RParen
        while (i < children.length && ['LParen', 'RParen'].includes(children[i]?.name)) i++

        // 跳过 LBrace
        if (children[i]?.name === 'LBrace') i++

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

        if (this.isStaticModifier(staticCst)) {
            methodDef.static = true
        }

        return methodDef
    }

    /**
     * Es2025Parser: setter方法 (从 IdentifierNameTok="set" 开始的 MethodDefinition)
     * children: [IdentifierNameTok="set", ClassElementName, LParen, PropertySetParameterList, RParen, LBrace, FunctionBody?, RBrace]
     */
    createEs2025SetterMethodFromIdentifier(staticCst: SubhutiCst | null, cst: SubhutiCst): SlimeMethodDefinition {
        const children = cst.children
        let i = 1 // 跳过 IdentifierNameTok="set"

        const classElementNameCst = children[i++]
        const key = this.createClassElementNameOrPropertyNameAst(classElementNameCst)

        // 跳过 LParen
        if (children[i]?.name === 'LParen') i++

        // PropertySetParameterList 或直接的 BindingIdentifier
        let params: SlimePattern[] = []
        if (children[i]?.name === 'PropertySetParameterList' || children[i]?.name === Es6Parser.prototype.PropertySetParameterList?.name) {
            params = this.createPropertySetParameterListAst(children[i])
            i++
        } else if (children[i]?.name === 'BindingIdentifier' || children[i]?.name === 'BindingElement') {
            // 直接的参数标识符
            params = [this.createBindingIdentifierAst(children[i])]
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

        if (this.isStaticModifier(staticCst)) {
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

        if (this.isStaticModifier(staticCst)) {
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

        if (this.isStaticModifier(staticCst)) {
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

        if (this.isStaticModifier(staticCst)) {
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

        // ES2018: 检查是否有BindingRestElement 或 BindingRestProperty（...rest）
        const restElement = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.BindingRestElement?.name ||
            ch.name === 'BindingRestElement' ||
            ch.name === Es6Parser.prototype.BindingRestProperty?.name ||
            ch.name === 'BindingRestProperty'
        )
        if (restElement) {
            // BindingRestElement/BindingRestProperty -> Ellipsis + BindingIdentifier
            const identifier = restElement.children.find((ch: any) =>
                ch.name === Es6Parser.prototype.BindingIdentifier?.name ||
                ch.name === 'BindingIdentifier'
            )
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
        // Es2025Parser FunctionExpression 结构

        let isAsync = false;
        let isGenerator = false;
        let functionId: SlimeIdentifier | null = null
        let params: SlimePattern[] = []
        let body: SlimeBlockStatement

        // Token fields
        let functionToken: any = undefined
        let asyncToken: any = undefined
        let asteriskToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined
        const commaTokens: any[] = []

        for (const child of cst.children || []) {
            if (!child) continue
            const name = child.name
            const value = child.value

            if (name === 'FunctionTok' || value === 'function') {
                functionToken = SlimeTokenCreate.createFunctionToken(child.loc)
                continue
            }
            if (name === 'AsyncTok' || value === 'async') {
                asyncToken = SlimeTokenCreate.createAsyncToken(child.loc)
                isAsync = true
                continue
            }
            if (name === 'Asterisk' || value === '*') {
                asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc)
                isGenerator = true
                continue
            }
            if (name === 'LParen' || value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
                continue
            }
            if (name === 'RParen' || value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
                continue
            }
            if (name === 'LBrace' || value === '{') {
                lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc)
                continue
            }
            if (name === 'RBrace' || value === '}') {
                rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc)
                continue
            }
            if (name === 'Comma' || value === ',') {
                commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc))
                continue
            }

            // BindingIdentifier（命名函数表达式）
            if (name === Es6Parser.prototype.BindingIdentifier?.name || name === 'BindingIdentifier') {
                functionId = this.createBindingIdentifierAst(child)
                continue
            }

            // FormalParameters
            if (name === Es6Parser.prototype.FormalParameters?.name || name === 'FormalParameters') {
                params = this.createFormalParametersAst(child)
                continue
            }

            // FunctionBody
            if (name === Es6Parser.prototype.FunctionBody?.name || name === 'FunctionBody') {
                const bodyStatements = this.createFunctionBodyAst(child)
                body = SlimeAstUtil.createBlockStatement(bodyStatements, child.loc)
                continue
            }
        }

        // 空函数体
        if (!body!) {
            body = SlimeAstUtil.createBlockStatement([])
        }

        return SlimeAstUtil.createFunctionExpression(
            body, functionId, params, isGenerator, isAsync, cst.loc,
            functionToken, asyncToken, asteriskToken, lParenToken, rParenToken,
            lBraceToken, rBraceToken, commaTokens.length > 0 ? commaTokens : undefined
        )
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

        // return 语句可能有或没有表达式
        // children[0] = ReturnTok
        // children[1] = Expression? | Semicolon | SemicolonASI
        let argument: any = null
        let returnToken: any = undefined
        let semicolonToken: any = undefined

        // 提取 return token
        const returnCst = cst.children[0]
        if (returnCst && (returnCst.name === 'ReturnTok' || returnCst.value === 'return')) {
            returnToken = SlimeTokenCreate.createReturnToken(returnCst.loc)
        }

        if (cst.children.length > 1) {
            for (let i = 1; i < cst.children.length; i++) {
                const child = cst.children[i]
                // 跳过分号相关节点
                if (child.name === 'Semicolon' || child.name === 'SemicolonASI' ||
                    child.name === 'SemicolonTok' || child.value === ';') {
                    semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
                } else if (!argument) {
                    argument = this.createExpressionAst(child)
                }
            }
        }

        return SlimeAstUtil.createReturnStatement(argument, cst.loc, returnToken, semicolonToken)
    }

    createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement {
        const astName = checkCstName(cst, Es6Parser.prototype.ExpressionStatement?.name);

        let semicolonToken: any = undefined
        let expression: any = null

        for (const child of cst.children || []) {
            if (child.name === 'Semicolon' || child.value === ';') {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
            } else if (child.name === Es6Parser.prototype.Expression?.name ||
                       child.name === 'Expression' ||
                       !expression) {
                expression = this.createExpressionAst(child)
            }
        }

        return SlimeAstUtil.createExpressionStatement(expression, cst.loc, semicolonToken)
    }

    /**
     * 创建 if 语句 AST
     * if (test) consequent [else alternate]
     * ES2025: if ( Expression ) IfStatementBody [else IfStatementBody]
     */
    createIfStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.IfStatement?.name);

        let test: any = null
        let consequent: any = null
        let alternate: any = null
        let ifToken: any = undefined
        let elseToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined

        const children = cst.children || []
        let foundElse = false

        for (const child of children) {
            if (!child) continue
            const name = child.name

            // if token
            if (name === 'IfTok' || child.value === 'if') {
                ifToken = SlimeTokenCreate.createIfToken(child.loc)
                continue
            }
            // LParen token
            if (name === 'LParen' || child.value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
                continue
            }
            // RParen token
            if (name === 'RParen' || child.value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
                continue
            }

            // else token
            if (name === 'ElseTok' || child.value === 'else') {
                elseToken = SlimeTokenCreate.createElseToken(child.loc)
                foundElse = true
                continue
            }

            // Expression (test condition)
            if (name === Es6Parser.prototype.Expression?.name || name === 'Expression') {
                test = this.createExpressionAst(child)
                continue
            }

            // IfStatementBody
            if (name === Es6Parser.prototype.IfStatementBody?.name || name === 'IfStatementBody') {
                const body = this.createIfStatementBodyAst(child)
                if (!foundElse) {
                    consequent = body
                } else {
                    alternate = body
                }
                continue
            }

            // Legacy: 直接是 Statement
            if (name === Es6Parser.prototype.Statement?.name || name === 'Statement') {
                const stmts = this.createStatementAst(child)
                const body = Array.isArray(stmts) ? stmts[0] : stmts
                if (!foundElse) {
                    consequent = body
                } else {
                    alternate = body
                }
                continue
            }
        }

        return SlimeAstUtil.createIfStatement(test, consequent, alternate, cst.loc, ifToken, elseToken, lParenToken, rParenToken)
    }

    /**
     * 创建 IfStatementBody AST
     * IfStatementBody: Statement | FunctionDeclaration
     */
    createIfStatementBodyAst(cst: SubhutiCst): any {
        const children = cst.children || []

        for (const child of children) {
            if (!child) continue
            const name = child.name

            if (name === Es6Parser.prototype.Statement?.name || name === 'Statement') {
                const stmts = this.createStatementAst(child)
                return Array.isArray(stmts) ? stmts[0] : stmts
            }

            if (name === Es6Parser.prototype.FunctionDeclaration?.name || name === 'FunctionDeclaration') {
                return this.createFunctionDeclarationAst(child)
            }
        }

        // 如果没有找到子节点，尝试直接处理
        return this.createStatementDeclarationAst(cst)
    }

    /**
     * 创建 for 语句 AST
     * ES2025 ForStatement:
     *   for ( var VariableDeclarationList ; Expression_opt ; Expression_opt ) Statement
     *   for ( LexicalDeclaration Expression_opt ; Expression_opt ) Statement
     *   for ( Expression_opt ; Expression_opt ; Expression_opt ) Statement
     *
     * 注意：LexicalDeclaration 内部已经包含分号（SemicolonASI）
     */
    createForStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.ForStatement?.name);

        let init: any = null
        let test: any = null
        let update: any = null
        let body: any = null
        let forToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        const semicolonTokens: any[] = []

        const children = cst.children || []

        // 收集所有表达式（可能是 test 或 update）
        const expressions: any[] = []
        let hasLexicalDeclaration = false

        for (const child of children) {
            if (!child) continue
            const name = child.name

            // for token
            if (name === 'ForTok' || child.value === 'for') {
                forToken = SlimeTokenCreate.createForToken(child.loc)
                continue
            }
            // LParen token
            if (name === 'LParen' || child.value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
                continue
            }
            // RParen token
            if (name === 'RParen' || child.value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
                continue
            }
            // var token - skip (kind handled separately)
            if (name === 'VarTok' || child.value === 'var') continue
            // Semicolon token
            if (name === 'Semicolon' || child.value === ';' || child.loc?.type === 'Semicolon') {
                semicolonTokens.push(SlimeTokenCreate.createSemicolonToken(child.loc))
                continue
            }

            // VariableDeclarationList (for var) - init
            if (name === Es6Parser.prototype.VariableDeclarationList?.name || name === 'VariableDeclarationList') {
                init = this.createVariableDeclarationFromList(child, 'var')
                continue
            }

            // LexicalDeclaration (for let/const) - init
            // 注意：LexicalDeclaration 内部包含了分号
            if (name === Es6Parser.prototype.LexicalDeclaration?.name || name === 'LexicalDeclaration') {
                init = this.createLexicalDeclarationAst(child)
                hasLexicalDeclaration = true
                continue
            }

            // VariableDeclaration (legacy) - init
            if (name === Es6Parser.prototype.VariableDeclaration?.name || name === 'VariableDeclaration') {
                init = this.createVariableDeclarationAst(child)
                continue
            }

            // Expression - 收集所有表达式
            if (name === Es6Parser.prototype.Expression?.name || name === 'Expression') {
                expressions.push(this.createExpressionAst(child))
                continue
            }

            // Statement (body)
            if (name === Es6Parser.prototype.Statement?.name || name === 'Statement') {
                const stmts = this.createStatementAst(child)
                body = Array.isArray(stmts) ? stmts[0] : stmts
                continue
            }
        }

        // 根据收集的表达式和是否有 LexicalDeclaration 来分配
        if (hasLexicalDeclaration) {
            // for (let i = 0; test; update) - LexicalDeclaration 已经是 init
            // 后面两个表达式分别是 test 和 update
            if (expressions.length >= 1) test = expressions[0]
            if (expressions.length >= 2) update = expressions[1]
        } else if (init) {
            // for (var i = 0; test; update) - init 已设置
            // 后面两个表达式分别是 test 和 update
            if (expressions.length >= 1) test = expressions[0]
            if (expressions.length >= 2) update = expressions[1]
        } else {
            // for (init; test; update) - 三个表达式
            if (expressions.length >= 1) init = expressions[0]
            if (expressions.length >= 2) test = expressions[1]
            if (expressions.length >= 3) update = expressions[2]
        }

        return SlimeAstUtil.createForStatement(
            body, init, test, update, cst.loc,
            forToken, lParenToken, rParenToken,
            semicolonTokens[0], semicolonTokens[1]
        )
    }

    /**
     * 从 VariableDeclarationList 创建 VariableDeclaration AST
     */
    createVariableDeclarationFromList(cst: SubhutiCst, kind: string): SlimeVariableDeclaration {
        const children = cst.children || []
        const declarations: SlimeVariableDeclarator[] = []

        for (const child of children) {
            if (!child) continue
            const name = child.name

            // Skip commas
            if (child.value === ',' || name === 'Comma') continue

            // VariableDeclaration
            if (name === Es6Parser.prototype.VariableDeclaration?.name || name === 'VariableDeclaration') {
                declarations.push(this.createVariableDeclaratorFromVarDeclaration(child))
            }
        }

        return {
            type: SlimeAstType.VariableDeclaration,
            kind: kind as any,
            declarations: declarations,
            loc: cst.loc
        } as any
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

        let whileToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined

        for (const child of cst.children) {
            if (!child) continue
            if (child.name === 'WhileTok' || child.value === 'while') {
                whileToken = SlimeTokenCreate.createWhileToken(child.loc)
            } else if (child.name === 'LParen' || child.value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
            } else if (child.name === 'RParen' || child.value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
            }
        }

        const expression = cst.children.find(ch => ch.name === Es6Parser.prototype.Expression?.name)
        const statement = cst.children.find(ch => ch.name === Es6Parser.prototype.Statement?.name)

        const test = expression ? this.createExpressionAst(expression) : null
        // createStatementAst返回数组，取第一个元素
        const bodyArray = statement ? this.createStatementAst(statement) : []
        const body = bodyArray.length > 0 ? bodyArray[0] : null

        return SlimeAstUtil.createWhileStatement(test, body, cst.loc, whileToken, lParenToken, rParenToken)
    }

    /**
     * 创建 do...while 语句 AST
     */
    createDoWhileStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.DoWhileStatement?.name);
        // DoWhileStatement: do Statement while ( Expression ) ;

        let doToken: any = undefined
        let whileToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        let semicolonToken: any = undefined
        let body: any = null
        let test: any = null

        for (const child of cst.children) {
            if (!child) continue
            const name = child.name

            if (name === 'DoTok' || child.value === 'do') {
                doToken = SlimeTokenCreate.createDoToken(child.loc)
            } else if (name === 'WhileTok' || child.value === 'while') {
                whileToken = SlimeTokenCreate.createWhileToken(child.loc)
            } else if (name === 'LParen' || child.value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
            } else if (name === 'RParen' || child.value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
            } else if (name === 'Semicolon' || child.value === ';') {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
            } else if (name === Es6Parser.prototype.Statement?.name || name === 'Statement') {
                const bodyArray = this.createStatementAst(child)
                body = bodyArray.length > 0 ? bodyArray[0] : null
            } else if (name === Es6Parser.prototype.Expression?.name || name === 'Expression') {
                test = this.createExpressionAst(child)
            }
        }

        return SlimeAstUtil.createDoWhileStatement(body, test, cst.loc, doToken, whileToken, lParenToken, rParenToken, semicolonToken)
    }

    /**
     * 创建 switch 语句 AST
     * SwitchStatement: switch ( Expression ) CaseBlock
     */
    createSwitchStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.SwitchStatement?.name);

        let switchToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined

        for (const child of cst.children) {
            if (!child) continue
            if (child.name === 'SwitchTok' || child.value === 'switch') {
                switchToken = SlimeTokenCreate.createSwitchToken(child.loc)
            } else if (child.name === 'LParen' || child.value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
            } else if (child.name === 'RParen' || child.value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
            }
        }

        // 提取 discriminant（判断表达式）
        const discriminantCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.Expression?.name)
        const discriminant = discriminantCst ? this.createExpressionAst(discriminantCst) : null

        // 提取 cases（从 CaseBlock 中）
        const caseBlockCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.CaseBlock?.name)
        const cases = caseBlockCst ? this.extractCasesFromCaseBlock(caseBlockCst) : []

        // 从 CaseBlock 提取 brace tokens
        if (caseBlockCst && caseBlockCst.children) {
            const lBraceCst = caseBlockCst.children.find(ch => ch.name === 'LBrace' || ch.value === '{')
            const rBraceCst = caseBlockCst.children.find(ch => ch.name === 'RBrace' || ch.value === '}')
            if (lBraceCst) lBraceToken = SlimeTokenCreate.createLBraceToken(lBraceCst.loc)
            if (rBraceCst) rBraceToken = SlimeTokenCreate.createRBraceToken(rBraceCst.loc)
        }

        return SlimeAstUtil.createSwitchStatement(
            discriminant, cases, cst.loc,
            switchToken, lParenToken, rParenToken, lBraceToken, rBraceToken
        )
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
        let caseToken: any = undefined
        let defaultToken: any = undefined
        let colonToken: any = undefined

        if (cst.name === Es6Parser.prototype.CaseClause?.name) {
            // CaseClause 结构：
            // children[0]: CaseTok
            // children[1]: Expression - test
            // children[2]: Colon
            // children[3]: StatementList（可选）

            for (const child of cst.children || []) {
                if (child.name === 'CaseTok' || child.value === 'case') {
                    caseToken = SlimeTokenCreate.createCaseToken(child.loc)
                } else if (child.name === 'Colon' || child.value === ':') {
                    colonToken = SlimeTokenCreate.createColonToken(child.loc)
                }
            }

            const testCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.Expression?.name)
            test = testCst ? this.createExpressionAst(testCst) : null

            const stmtListCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.StatementList?.name)
            consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : []
        } else if (cst.name === Es6Parser.prototype.DefaultClause?.name) {
            // DefaultClause 结构：
            // children[0]: DefaultTok
            // children[1]: Colon
            // children[2]: StatementList（可选）

            for (const child of cst.children || []) {
                if (child.name === 'DefaultTok' || child.value === 'default') {
                    defaultToken = SlimeTokenCreate.createDefaultToken(child.loc)
                } else if (child.name === 'Colon' || child.value === ':') {
                    colonToken = SlimeTokenCreate.createColonToken(child.loc)
                }
            }

            test = null  // default 没有 test

            const stmtListCst = cst.children?.find(ch => ch.name === Es6Parser.prototype.StatementList?.name)
            consequent = stmtListCst ? this.createStatementListAst(stmtListCst) : []
        }

        return SlimeAstUtil.createSwitchCase(test, consequent, cst.loc, caseToken, defaultToken, colonToken)
    }

    /**
     * 创建 try 语句 AST
     */
    createTryStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.TryStatement?.name);
        // TryStatement: TryTok Block (Catch Finally? | Finally)

        let tryToken: any = undefined
        let finallyToken: any = undefined

        for (const child of cst.children) {
            if (!child) continue
            if (child.name === 'TryTok' || child.value === 'try') {
                tryToken = SlimeTokenCreate.createTryToken(child.loc)
            } else if (child.name === 'FinallyTok' || child.value === 'finally') {
                finallyToken = SlimeTokenCreate.createFinallyToken(child.loc)
            }
        }

        const blockCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Block?.name)
        const catchCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Catch?.name)
        const finallyCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Finally?.name)

        const block = blockCst ? this.createBlockAst(blockCst) : null
        const handler = catchCst ? this.createCatchClauseAst(catchCst) : null
        const finalizer = finallyCst ? this.createFinallyAst(finallyCst) : null

        return SlimeAstUtil.createTryStatement(block, handler, finalizer, cst.loc, tryToken, finallyToken)
    }

    /**
     * 从Block CST创建BlockStatement AST
     * Block: LBrace StatementList? RBrace
     */
    createBlockAst(cst: SubhutiCst): SlimeBlockStatement {
        checkCstName(cst, Es6Parser.prototype.Block?.name)

        // Block 的结构：LBrace StatementList? RBrace
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined

        if (cst.children) {
            for (const child of cst.children) {
                if (child.name === 'LBrace' || child.value === '{') {
                    lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc)
                } else if (child.name === 'RBrace' || child.value === '}') {
                    rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc)
                }
            }
        }

        const statementListCst = cst.children?.find(
            child => child.name === Es6Parser.prototype.StatementList?.name
        )

        const statements = statementListCst ? this.createStatementListAst(statementListCst) : []

        return SlimeAstUtil.createBlockStatement(statements, cst.loc, lBraceToken, rBraceToken)
    }

    /**
     * 创建 Catch 子句 AST
     */
    createCatchClauseAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.Catch?.name);
        // Catch: CatchTok LParen CatchParameter RParen Block

        let catchToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined

        for (const child of cst.children) {
            if (!child) continue
            if (child.name === 'CatchTok' || child.value === 'catch') {
                catchToken = SlimeTokenCreate.createCatchToken(child.loc)
            } else if (child.name === 'LParen' || child.value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
            } else if (child.name === 'RParen' || child.value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
            }
        }

        const paramCst = cst.children.find(ch => ch.name === Es6Parser.prototype.CatchParameter?.name)
        const blockCst = cst.children.find(ch => ch.name === Es6Parser.prototype.Block?.name)

        const param = paramCst ? this.createCatchParameterAst(paramCst) : null
        const body = blockCst ? this.createBlockAst(blockCst) : null

        return SlimeAstUtil.createCatchClause(param, body, cst.loc, catchToken, lParenToken, rParenToken)
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
        // ThrowStatement: throw Expression ;

        let throwToken: any = undefined
        let semicolonToken: any = undefined
        let argument: any = null

        for (const child of cst.children || []) {
            if (child.name === 'ThrowTok' || child.value === 'throw') {
                throwToken = SlimeTokenCreate.createThrowToken(child.loc)
            } else if (child.name === 'Semicolon' || child.value === ';') {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
            } else if (child.name === Es6Parser.prototype.Expression?.name || child.name === 'Expression') {
                argument = this.createExpressionAst(child)
            }
        }

        return SlimeAstUtil.createThrowStatement(argument, cst.loc, throwToken, semicolonToken)
    }

    /**
     * 创建 break 语句 AST
     */
    createBreakStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.BreakStatement?.name);
        // BreakStatement: break Identifier? ;

        let breakToken: any = undefined
        let semicolonToken: any = undefined
        let label: any = null

        for (const child of cst.children || []) {
            if (child.name === 'BreakTok' || child.value === 'break') {
                breakToken = SlimeTokenCreate.createBreakToken(child.loc)
            } else if (child.name === 'Semicolon' || child.value === ';') {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
            } else if (child.name === Es6Parser.prototype.LabelIdentifier?.name) {
                label = this.createIdentifierAst(child.children[0])
            } else if (child.name === Es6Parser.prototype.IdentifierName?.name) {
                label = this.createIdentifierNameAst(child)
            } else if (child.name === Es6TokenConsumer.prototype.Identifier?.name) {
                label = this.createIdentifierAst(child)
            }
        }

        return SlimeAstUtil.createBreakStatement(label, cst.loc, breakToken, semicolonToken)
    }

    /**
     * 创建 continue 语句 AST
     */
    createContinueStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.ContinueStatement?.name);
        // ContinueStatement: continue Identifier? ;

        let continueToken: any = undefined
        let semicolonToken: any = undefined
        let label: any = null

        for (const child of cst.children || []) {
            if (child.name === 'ContinueTok' || child.value === 'continue') {
                continueToken = SlimeTokenCreate.createContinueToken(child.loc)
            } else if (child.name === 'Semicolon' || child.value === ';') {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
            } else if (child.name === Es6Parser.prototype.LabelIdentifier?.name) {
                label = this.createIdentifierAst(child.children[0])
            } else if (child.name === Es6Parser.prototype.IdentifierName?.name) {
                label = this.createIdentifierNameAst(child)
            } else if (child.name === Es6TokenConsumer.prototype.Identifier?.name) {
                label = this.createIdentifierAst(child)
            }
        }

        return SlimeAstUtil.createContinueStatement(label, cst.loc, continueToken, semicolonToken)
    }

    /**
     * 创建标签语句 AST
     * ES2025: LabelledStatement -> LabelIdentifier : LabelledItem
     * LabelledItem -> Statement | FunctionDeclaration
     */
    createLabelledStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.LabelledStatement?.name);

        let label: any = null
        let body: any = null

        if (cst.children && cst.children.length > 0) {
            for (const child of cst.children) {
                if (!child) continue
                const name = child.name

                // Skip tokens (Colon)
                if (child.value === ':' || name === 'Colon') continue

                // LabelIdentifier -> Identifier
                if (name === Es6Parser.prototype.LabelIdentifier?.name || name === 'LabelIdentifier') {
                    // LabelIdentifier 内部是 Identifier
                    const identifierCst = child.children?.[0]
                    if (identifierCst) {
                        label = this.createIdentifierAst(identifierCst)
                    }
                    continue
                }

                // LabelledItem -> Statement | FunctionDeclaration
                if (name === Es6Parser.prototype.LabelledItem?.name || name === 'LabelledItem') {
                    // LabelledItem 内部是 Statement 或 FunctionDeclaration
                    const itemChild = child.children?.[0]
                    if (itemChild) {
                        const stmts = this.createStatementAst(itemChild)
                        body = Array.isArray(stmts) ? stmts[0] : stmts
                    }
                    continue
                }

                // 旧版兼容：直接是 Statement
                if (name === Es6Parser.prototype.Statement?.name || name === 'Statement') {
                    const stmts = this.createStatementAst(child)
                    body = Array.isArray(stmts) ? stmts[0] : stmts
                    continue
                }

                // 旧版兼容：直接是 Identifier
                if (name === Es6Parser.prototype.IdentifierName?.name) {
                    label = this.createIdentifierNameAst(child)
                    continue
                }
                if (name === Es6TokenConsumer.prototype.Identifier?.name) {
                    label = this.createIdentifierAst(child)
                    continue
                }
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

        let debuggerToken: any = undefined
        let semicolonToken: any = undefined

        for (const child of cst.children || []) {
            if (child.name === 'DebuggerTok' || child.value === 'debugger') {
                debuggerToken = SlimeTokenCreate.createDebuggerToken(child.loc)
            } else if (child.name === 'Semicolon' || child.value === ';') {
                semicolonToken = SlimeTokenCreate.createSemicolonToken(child.loc)
            }
        }

        return SlimeAstUtil.createDebuggerStatement(cst.loc, debuggerToken, semicolonToken)
    }

    /**
     * 创建空语句 AST
     */
    createEmptyStatementAst(cst: SubhutiCst): any {
        checkCstName(cst, Es6Parser.prototype.NotEmptySemicolon?.name);

        let semicolonToken: any = undefined

        // 找 semicolon token
        const semicolonCst = cst.children?.find(ch => ch.name === 'Semicolon' || ch.value === ';')
        if (semicolonCst) {
            semicolonToken = SlimeTokenCreate.createSemicolonToken(semicolonCst.loc)
        }

        return SlimeAstUtil.createEmptyStatement(cst.loc, semicolonToken)
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

        // Token fields
        let functionToken: any = undefined
        let asyncToken: any = undefined
        let asteriskToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined
        const commaTokens: any[] = []

        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (!child) continue

            const name = child.name
            const value = child.value || child.loc?.value

            // Collect tokens
            if (name === 'FunctionTok' || value === 'function') {
                functionToken = SlimeTokenCreate.createFunctionToken(child.loc)
                continue
            }
            if (name === 'LParen' || value === '(') {
                lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
                continue
            }
            if (name === 'RParen' || value === ')') {
                rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
                continue
            }
            if (name === 'LBrace' || value === '{') {
                lBraceToken = SlimeTokenCreate.createLBraceToken(child.loc)
                continue
            }
            if (name === 'RBrace' || value === '}') {
                rBraceToken = SlimeTokenCreate.createRBraceToken(child.loc)
                continue
            }
            if (name === 'AsyncTok' || value === 'async') {
                asyncToken = SlimeTokenCreate.createAsyncToken(child.loc)
                isAsync = true
                continue
            }
            if (name === 'Asterisk' || value === '*') {
                asteriskToken = SlimeTokenCreate.createAsteriskToken(child.loc)
                isGenerator = true
                continue
            }
            if (name === 'Comma' || value === ',') {
                commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc))
                continue
            }

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
                body = SlimeAstUtil.createBlockStatement(statements, child.loc)
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
            body = SlimeAstUtil.createBlockStatement([])
        }

        return SlimeAstUtil.createFunctionDeclaration(
            functionName, params, body, isGenerator, isAsync, cst.loc,
            functionToken, asyncToken, asteriskToken, lParenToken, rParenToken,
            lBraceToken, rBraceToken, commaTokens.length > 0 ? commaTokens : undefined
        )
    }

    /**
     * Create FormalParameters AST
     * ES2025 FormalParameters:
     *   [empty]
     *   FunctionRestParameter
     *   FormalParameterList
     *   FormalParameterList ,
     *   FormalParameterList , FunctionRestParameter
     */
    createFormalParametersAst(cst: SubhutiCst): any[] {
        const children = cst.children || []
        const params: any[] = []

        for (const child of children) {
            if (!child) continue

            const name = child.name

            // Skip tokens (commas, parentheses)
            if (child.value === ',' || name === 'Comma') continue
            if (child.value === '(' || name === 'LParen') continue
            if (child.value === ')' || name === 'RParen') continue

            // FormalParameterList：包含 FormalParameter (多个以逗号分隔)
            if (name === Es6Parser.prototype.FormalParameterList?.name || name === 'FormalParameterList') {
                params.push(...this.createFormalParameterListFromEs2025(child))
                continue
            }

            // FunctionRestParameter
            if (name === Es6Parser.prototype.FunctionRestParameter?.name || name === 'FunctionRestParameter') {
                params.push(this.createFunctionRestParameterAst(child))
                continue
            }

            // Direct FormalParameter（ES2025 结构）
            if (name === Es6Parser.prototype.FormalParameter?.name || name === 'FormalParameter') {
                params.push(this.createFormalParameterAst(child))
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

    /**
     * 从 ES2025 FormalParameterList 创建参数 AST
     * FormalParameterList: FormalParameter (, FormalParameter)*
     */
    createFormalParameterListFromEs2025(cst: SubhutiCst): any[] {
        const children = cst.children || []
        const params: any[] = []

        for (const child of children) {
            if (!child) continue
            const name = child.name

            // Skip commas
            if (child.value === ',' || name === 'Comma') continue

            // FormalParameter -> BindingElement
            if (name === Es6Parser.prototype.FormalParameter?.name || name === 'FormalParameter') {
                params.push(this.createFormalParameterAst(child))
            }
        }

        return params
    }

    /**
     * 创建单个 FormalParameter AST
     * FormalParameter: BindingElement
     */
    createFormalParameterAst(cst: SubhutiCst): any {
        const children = cst.children || []

        for (const child of children) {
            if (!child) continue
            const name = child.name

            if (name === Es6Parser.prototype.BindingElement?.name || name === 'BindingElement') {
                return this.createBindingElementAst(child)
            }
        }

        // 如果没有 BindingElement 子节点，尝试直接处理
        // 这可能是因为 FormalParameter 直接就是 BindingElement 的内容
        return this.createBindingElementAst(cst)
    }

    createFunctionRestParameterAst(cst: SubhutiCst): SlimeRestElement {
        // FunctionRestParameter: ... BindingIdentifier | ... BindingPattern
        // 或者 FunctionRestParameter -> BindingRestElement
        const children = cst.children || []
        let argument: any = null

        for (const child of children) {
            if (!child) continue
            if (child.value === '...' || child.name === 'Ellipsis') continue

            if (child.name === Es6Parser.prototype.BindingIdentifier?.name || child.name === 'BindingIdentifier') {
                argument = this.createBindingIdentifierAst(child)
            } else if (child.name === Es6Parser.prototype.BindingRestElement?.name || child.name === 'BindingRestElement') {
                // BindingRestElement 已经包含了 RestElement 的完整结构，直接返回
                return this.createBindingRestElementAst(child)
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

        // 遍历children，处理 Ellipsis + AssignmentExpression 组合
        let isSpread = false
        for (const child of cst.children) {
            if (child.name === 'Ellipsis' || child.name === 'EllipsisTok') {
                // 标记下一个表达式是 spread
                isSpread = true
            } else if (child.name === Es6Parser.prototype.AssignmentExpression?.name) {
                const expr = this.createAssignmentExpressionAst(child)
                if (isSpread) {
                    // 创建 SpreadElement
                    ArgumentList.push({
                        type: SlimeAstType.SpreadElement,
                        argument: expr,
                        loc: child.loc
                    } as SlimeSpreadElement)
                    isSpread = false
                } else {
                    ArgumentList.push(expr)
                }
            } else if (child.name === Es6Parser.prototype.SpreadElement?.name) {
                // 处理 spread 参数：...args（旧结构兼容）
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
            // Token fields
            let newToken: any = undefined
            let lParenToken: any = undefined
            let rParenToken: any = undefined
            const commaTokens: any[] = []

            // 提取 new token
            const newCst = cst.children[0]
            if (newCst && (newCst.name === 'NewTok' || newCst.value === 'new')) {
                newToken = SlimeTokenCreate.createNewToken(newCst.loc)
            }

            // 提取 Arguments 中的 tokens
            const argsCst = cst.children[2]
            if (argsCst && argsCst.children) {
                for (const child of argsCst.children) {
                    if (child.name === 'LParen' || child.value === '(') {
                        lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
                    } else if (child.name === 'RParen' || child.value === ')') {
                        rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
                    } else if (child.name === 'Comma' || child.value === ',') {
                        commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc))
                    }
                }
            }

            const calleeExpression = this.createMemberExpressionAst(cst.children[1])
            const args = this.createArgumentsAst(cst.children[2])

            return SlimeAstUtil.createNewExpression(
                calleeExpression, args, cst.loc,
                newToken, lParenToken, rParenToken, commaTokens.length > 0 ? commaTokens : undefined
            )
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
     * 创建 OptionalExpression AST（ES2020）
     * 处理可选链语法 ?.
     *
     * OptionalExpression:
     *   MemberExpression OptionalChain
     *   CallExpression OptionalChain
     *   OptionalExpression OptionalChain
     */
    createOptionalExpressionAst(cst: SubhutiCst): SlimeExpression {
        // OptionalExpression 结构：
        // children[0] = MemberExpression | CallExpression
        // children[1...n] = OptionalChain

        if (!cst.children || cst.children.length === 0) {
            throw new Error('OptionalExpression: no children')
        }

        // 首先处理基础表达式（MemberExpression 或 CallExpression）
        let result = this.createExpressionAst(cst.children[0])

        // 处理 OptionalChain（可能有多个链式调用）
        for (let i = 1; i < cst.children.length; i++) {
            const chainCst = cst.children[i]
            if (chainCst.name === 'OptionalChain') {
                result = this.createOptionalChainAst(result, chainCst)
            }
        }

        return result
    }

    /**
     * 创建 OptionalChain AST
     * 处理 ?. 后的各种访问形式
     */
    createOptionalChainAst(object: SlimeExpression, chainCst: SubhutiCst): SlimeExpression {
        let result = object

        for (const child of chainCst.children) {
            const name = child.name

            if (name === 'OptionalChainingTok' || child.value === '?.') {
                // 跳过 ?. token
                continue
            } else if (name === 'Arguments') {
                // ?.() - 可选调用
                const args = this.createArgumentsAst(child)
                result = {
                    type: SlimeAstType.OptionalCallExpression,
                    callee: result,
                    arguments: args,
                    optional: true,
                    loc: chainCst.loc
                } as any
            } else if (name === 'LBracketTok' || child.value === '[') {
                // ?.[expr] - 可选计算属性访问
                // 下一个子节点是表达式，跳过 ]
                const exprIndex = chainCst.children.indexOf(child) + 1
                if (exprIndex < chainCst.children.length) {
                    const property = this.createExpressionAst(chainCst.children[exprIndex])
                    result = {
                        type: SlimeAstType.OptionalMemberExpression,
                        object: result,
                        property: property,
                        computed: true,
                        optional: true,
                        loc: chainCst.loc
                    } as any
                }
            } else if (name === 'IdentifierNameTok' || name === 'IdentifierName') {
                // ?.prop - 可选属性访问
                let property: SlimeIdentifier
                if (name === 'IdentifierName') {
                    // IdentifierName 内部包含一个 Identifier 或关键字 token
                    const tokenCst = child.children[0]
                    property = SlimeAstUtil.createIdentifier(tokenCst.value, tokenCst.loc)
                } else {
                    // 直接的 token
                    property = SlimeAstUtil.createIdentifier(child.value, child.loc)
                }
                result = {
                    type: SlimeAstType.OptionalMemberExpression,
                    object: result,
                    property: property,
                    computed: false,
                    optional: true,
                    loc: chainCst.loc
                } as any
            } else if (name === 'DotTok' || child.value === '.') {
                // 跳过 . token
                continue
            } else if (name === 'RBracketTok' || child.value === ']') {
                // 跳过 ] token
                continue
            } else if (name === 'PrivateIdentifierTok') {
                // ?.#prop - 私有属性可选访问
                const property = this.createPrivateIdentifierAst(child)
                result = {
                    type: SlimeAstType.OptionalMemberExpression,
                    object: result,
                    property: property,
                    computed: false,
                    optional: true,
                    loc: chainCst.loc
                } as any
            } else if (name === 'Expression') {
                // 计算属性的表达式部分，已在 LBracket 处理中处理
                continue
            }
        }

        return result
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
        } else if (first.name === 'RegularExpressionLiteral' || first.name === 'RegularExpressionLiteralTok') {
            // 处理正则表达式字面量
            return this.createRegExpLiteralAst(first)
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
        if (first.name === Es6TokenConsumer.prototype.NoSubstitutionTemplate?.name ||
            first.name === 'NoSubstitutionTemplate') {
            // 返回 TemplateLiteral AST，保持原始格式
            const raw = first.value as string || '``'
            const cooked = raw.slice(1, -1) // 去掉 ` 和 `
            const quasis = [SlimeAstUtil.createTemplateElement(true, raw, cooked, first.loc)]
            return SlimeAstUtil.createTemplateLiteral(quasis, [], cst.loc)
        }

        // 带插值模板：`hello ${name}` 或 `a ${x} b ${y} c`
        // ES2025 结构: TemplateLiteral -> SubstitutionTemplate -> [TemplateHead, Expression, TemplateSpans]
        // 检查是否是 SubstitutionTemplate 包装
        let targetCst = cst
        if (first.name === Es6Parser.prototype.SubstitutionTemplate?.name ||
            first.name === 'SubstitutionTemplate') {
            targetCst = first
        }

        const quasis: any[] = []
        const expressions: SlimeExpression[] = []

        // 遍历 targetCst.children 处理模板结构
        for (let i = 0; i < targetCst.children.length; i++) {
            const child = targetCst.children[i]

            // TemplateHead: `xxx${
            if (child.name === Es6TokenConsumer.prototype.TemplateHead?.name ||
                child.name === 'TemplateHead') {
                const raw = child.value as string || ''
                const cooked = raw.slice(1, -2) // 去掉 ` 和 ${
                quasis.push(SlimeAstUtil.createTemplateElement(false, raw, cooked, child.loc))
            }
            // Expression
            else if (child.name === Es6Parser.prototype.Expression?.name ||
                     child.name === 'Expression') {
                expressions.push(this.createExpressionAst(child))
            }
            // TemplateSpans
            else if (child.name === Es6Parser.prototype.TemplateSpans?.name ||
                     child.name === 'TemplateSpans') {
                this.processTemplateSpans(child, quasis, expressions)
            }
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

        // 提取 LBrace 和 RBrace tokens
        let lBraceToken: any = undefined
        let rBraceToken: any = undefined
        const commaTokens: any[] = []

        // ObjectLiteral: { PropertyDefinitionList? ,? }
        // children[0] = LBrace, children[last] = RBrace (if exists)
        if (cst.children && cst.children.length > 0) {
            const firstChild = cst.children[0]
            if (firstChild && (firstChild.name === 'LBrace' || firstChild.value === '{')) {
                lBraceToken = SlimeTokenCreate.createLBraceToken(firstChild.loc)
            }

            const lastChild = cst.children[cst.children.length - 1]
            if (lastChild && (lastChild.name === 'RBrace' || lastChild.value === '}')) {
                rBraceToken = SlimeTokenCreate.createRBraceToken(lastChild.loc)
            }
        }

        if (cst.children.length > 2) {
            const PropertyDefinitionListCst = cst.children[1]
            for (const child of PropertyDefinitionListCst.children) {
                // 跳过没有children的PropertyDefinition节点（SubhutiParser优化导致）
                if (child.name === Es6Parser.prototype.PropertyDefinition?.name && child.children && child.children.length > 0) {
                    const property = this.createPropertyDefinitionAst(child)
                    ary.push(property)
                } else if (child.name === 'Comma' || child.value === ',') {
                    commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc))
                }
            }
        }
        return SlimeAstUtil.createObjectExpression(ary, cst.loc, lBraceToken, rBraceToken, commaTokens.length > 0 ? commaTokens : undefined)
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
        } else if (first.name === 'CoverInitializedName') {
            // CoverInitializedName: 带默认值的属性简写 {name = 'default'}
            // CoverInitializedName -> IdentifierReference + Initializer
            const identifierRefCst = first.children[0]
            const initializerCst = first.children[1]

            const identifierCst = identifierRefCst.children[0] // IdentifierReference -> Identifier
            const identifier = this.createIdentifierAst(identifierCst)

            // Initializer -> Assign + AssignmentExpression
            const defaultValue = this.createAssignmentExpressionAst(initializerCst.children[1])

            // 创建 AssignmentPattern 作为 value
            const assignmentPattern = {
                type: SlimeAstType.AssignmentPattern,
                left: identifier,
                right: defaultValue,
                loc: first.loc
            }

            const keyAst = SlimeAstUtil.createPropertyAst(identifier, assignmentPattern as any)
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
        // 兼容多种 NumericLiteral 名称：NumericLiteral, NumericLiteralTok, Number
        const validNames = [
            Es6TokenConsumer.prototype.NumericLiteral?.name,
            'NumericLiteral',
            'NumericLiteralTok',
            'Number'
        ]
        if (!validNames.includes(cst.name)) {
            throw new Error(`Expected NumericLiteral, got ${cst.name}`)
        }
        // 保存原始值（raw）以保持格式（如十六进制 0xFF）
        const rawValue = cst.value as string
        return SlimeAstUtil.createNumericLiteral(Number(rawValue), rawValue)
    }

    createStringLiteralAst(cst: SubhutiCst): SlimeStringLiteral {
        // 兼容多种 StringLiteral 名称：StringLiteral, StringLiteralTok, String
        const validNames = [
            Es6TokenConsumer.prototype.StringLiteral?.name,
            'StringLiteral',
            'StringLiteralTok',
            'String'
        ]
        if (!validNames.includes(cst.name)) {
            throw new Error(`Expected StringLiteral, got ${cst.name}`)
        }
        // 保存原始值（raw）以保持引号格式
        const rawValue = cst.value as string
        const ast = SlimeAstUtil.createStringLiteral(rawValue, cst.loc, rawValue)
        return ast
    }

    /**
     * 创建 RegExpLiteral AST
     * RegularExpressionLiteral: /pattern/flags
     */
    createRegExpLiteralAst(cst: SubhutiCst): any {
        const rawValue = cst.value as string
        // 解析正则表达式字面量：/pattern/flags
        // 正则字面量格式：/.../ 后面可能跟着 flags
        const match = rawValue.match(/^\/(.*)\/([gimsuy]*)$/)
        if (match) {
            const pattern = match[1]
            const flags = match[2]
            return {
                type: SlimeAstType.Literal,
                value: new RegExp(pattern, flags),
                raw: rawValue,
                regex: {
                    pattern: pattern,
                    flags: flags
                },
                loc: cst.loc
            }
        }
        // 如果无法解析，返回原始值
        return {
            type: SlimeAstType.Literal,
            value: rawValue,
            raw: rawValue,
            loc: cst.loc
        }
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

        // 提取 LBracket 和 RBracket tokens
        let lBracketToken: any = undefined
        let rBracketToken: any = undefined
        const commaTokens: any[] = []

        if (cst.children && cst.children.length > 0) {
            const firstChild = cst.children[0]
            if (firstChild && (firstChild.name === 'LBracket' || firstChild.value === '[')) {
                lBracketToken = SlimeTokenCreate.createLBracketToken(firstChild.loc)
            }

            const lastChild = cst.children[cst.children.length - 1]
            if (lastChild && (lastChild.name === 'RBracket' || lastChild.value === ']')) {
                rBracketToken = SlimeTokenCreate.createRBracketToken(lastChild.loc)
            }
        }

        const elementList = cst.children.find(ch => ch.name === Es6Parser.prototype.ElementList?.name)
        const elements = elementList ? this.createElementListAst(elementList) : []

        // 收集逗号 tokens
        if (elementList) {
            for (const child of elementList.children) {
                if (child.name === 'Comma' || child.value === ',') {
                    commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc))
                }
            }
        }

        return SlimeAstUtil.createArrayExpression(elements, cst.loc, lBracketToken, rBracketToken, commaTokens.length > 0 ? commaTokens : undefined)
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

        // 提取 Ellipsis token
        let ellipsisToken: any = undefined
        const ellipsisCst = cst.children.find(ch =>
            ch.name === 'Ellipsis' || ch.name === 'EllipsisTok' || ch.value === '...'
        )
        if (ellipsisCst) {
            ellipsisToken = SlimeTokenCreate.createEllipsisToken(ellipsisCst.loc)
        }

        const expression = cst.children.find(ch =>
            ch.name === Es6Parser.prototype.AssignmentExpression?.name
        )
        if (!expression) {
            throw new Error('SpreadElement missing AssignmentExpression')
        }

        return SlimeAstUtil.createSpreadElement(
            this.createAssignmentExpressionAst(expression),
            cst.loc,
            ellipsisToken
        )
    }


    createLiteralAst(cst: SubhutiCst): SlimeLiteral {
        const astName = checkCstName(cst, Es6Parser.prototype.Literal?.name);
        const firstChild = cst.children[0]
        const firstValue = firstChild.value as string
        let value
        if (firstChild.name === Es6TokenConsumer.prototype.NumericLiteral?.name) {
            // 保存原始值（raw）以保持格式（如十六进制 0xFF）
            value = SlimeAstUtil.createNumericLiteral(Number(firstValue), firstValue)
        } else if (firstChild.name === Es6TokenConsumer.prototype.TrueTok?.name) {
            value = SlimeAstUtil.createBooleanLiteral(true)
        } else if (firstChild.name === Es6TokenConsumer.prototype.FalseTok?.name) {
            value = SlimeAstUtil.createBooleanLiteral(false)
        } else if (firstChild.name === Es6TokenConsumer.prototype.NullTok?.name) {
            value = SlimeAstUtil.createNullLiteralToken()
        } else {
            // 保存原始值（raw）以保持引号格式
            value = SlimeAstUtil.createStringLiteral(firstValue, firstChild.loc, firstValue)
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

        // Token fields
        let asyncToken: any = undefined
        let arrowToken: any = undefined
        let lParenToken: any = undefined
        let rParenToken: any = undefined
        const commaTokens: any[] = []

        // 检查是否有async
        let offset = 0;
        let isAsync = false;
        if (cst.children[0] && cst.children[0].name === 'AsyncTok') {
            asyncToken = SlimeTokenCreate.createAsyncToken(cst.children[0].loc)
            isAsync = true;
            offset = 1;
        }

        // 防御性检查：确保children存在且有足够元素
        if (!cst.children || cst.children.length < 3 + offset) {
            throw new Error(`createArrowFunctionAst: 期望${3 + offset}个children，实际${cst.children?.length || 0}个`)
        }

        const arrowParametersCst = cst.children[0 + offset]
        const arrowCst = cst.children[1 + offset]
        const conciseBodyCst = cst.children[2 + offset]

        // 提取箭头 token
        if (arrowCst && (arrowCst.name === 'Arrow' || arrowCst.value === '=>')) {
            arrowToken = SlimeTokenCreate.createArrowToken(arrowCst.loc)
        }

        // 解析参数 - 根据节点类型分别处理
        let params: SlimePattern[];
        if (arrowParametersCst.name === Es6Parser.prototype.BindingIdentifier?.name) {
            // 单个参数：x => x * 2
            params = [this.createBindingIdentifierAst(arrowParametersCst)]
        } else if (arrowParametersCst.name === Es6Parser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
            // 括号参数：(a, b) => a + b 或 () => 42
            // 提取括号 tokens
            for (const child of arrowParametersCst.children || []) {
                if (child.name === 'LParen' || child.value === '(') {
                    lParenToken = SlimeTokenCreate.createLParenToken(child.loc)
                } else if (child.name === 'RParen' || child.value === ')') {
                    rParenToken = SlimeTokenCreate.createRParenToken(child.loc)
                } else if (child.name === 'Comma' || child.value === ',') {
                    commaTokens.push(SlimeTokenCreate.createCommaToken(child.loc))
                }
            }
            params = this.createArrowParametersFromCoverGrammar(arrowParametersCst)
        } else if (arrowParametersCst.name === Es6Parser.prototype.ArrowParameters?.name) {
            // 旧版：使用ArrowParameters规则
            params = this.createArrowParametersAst(arrowParametersCst)
        } else {
            throw new Error(`createArrowFunctionAst: 不支持的参数类型 ${arrowParametersCst.name}`)
        }

        // 解析函数体
        const body = this.createConciseBodyAst(conciseBodyCst)

        return SlimeAstUtil.createArrowFunctionExpression(
            params, body, body.type !== SlimeAstType.BlockStatement, isAsync, cst.loc,
            asyncToken, arrowToken, lParenToken, rParenToken, commaTokens.length > 0 ? commaTokens : undefined
        )
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

        // 容错模式：如果找不到 Arrow token，尝试从不完整的 CST 中提取信息
        if (arrowIndex === -1) {
            // 尝试从 CoverCallExpressionAndAsyncArrowHead 提取参数
            for (const child of cst.children) {
                if (child.name === 'CoverCallExpressionAndAsyncArrowHead') {
                    params = this.createAsyncArrowParamsFromCover(child)
                    break
                } else if (child.name === 'AsyncTok') {
                    continue
                } else if (child.name === 'BindingIdentifier' || child.name === Es6Parser.prototype.BindingIdentifier?.name) {
                    params = [this.createBindingIdentifierAst(child)]
                    break
                }
            }
            // 返回不完整的箭头函数（没有 body）
            return {
                type: SlimeAstType.ArrowFunctionExpression,
                id: null,
                params: params,
                body: SlimeAstUtil.createBlockStatement(null, null, []),
                generator: false,
                async: true,
                expression: false,
                loc: cst.loc
            } as any
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
        // 或者 LParen + Expression + Comma + Ellipsis + BindingIdentifier + RParen

        if (cst.children.length === 0) {
            return []
        }

        // () - 空参数
        if (cst.children.length === 2) {
            return []
        }

        const params: SlimePattern[] = []

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
            params.push(...this.extractParametersFromExpression(expressionCst))
        }

        // 检查是否有 rest 参数（Ellipsis + BindingIdentifier）
        const hasEllipsis = cst.children.some(
            child => child.name === 'Ellipsis' || child.name === 'EllipsisTok'
        )
        if (hasEllipsis) {
            const bindingIdentifierCst = cst.children.find(
                child => child.name === Es6Parser.prototype.BindingIdentifier?.name
            )
            if (bindingIdentifierCst) {
                params.push({
                    type: SlimeAstType.RestElement,
                    argument: this.createBindingIdentifierAst(bindingIdentifierCst)
                } as any)
            }
        } else if (params.length === 0) {
            // 没有 Expression 也没有 rest，检查是否有单独的 BindingIdentifier
            const bindingIdentifierCst = cst.children.find(
                child => child.name === Es6Parser.prototype.BindingIdentifier?.name
            )
            if (bindingIdentifierCst) {
                params.push(this.createBindingIdentifierAst(bindingIdentifierCst))
            }
        }

        return params
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

        // CoverParenthesizedExpressionAndArrowParameterList: 括号参数
        if (first.name === Es6Parser.prototype.CoverParenthesizedExpressionAndArrowParameterList?.name) {
            return this.createArrowParametersFromCoverGrammar(first)
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

        // Token fields
        let questionToken: any = undefined
        let colonToken: any = undefined

        if (cst.children.length === 1) {
            return this.createExpressionAst(cst.children[0])
        } else {
            // CST children: [LogicalORExpression, Question, AssignmentExpression, Colon, AssignmentExpression]
            const questionCst = cst.children[1]
            const colonCst = cst.children[3]

            if (questionCst && (questionCst.name === 'Question' || questionCst.value === '?')) {
                questionToken = SlimeTokenCreate.createQuestionToken(questionCst.loc)
            }
            if (colonCst && (colonCst.name === 'Colon' || colonCst.value === ':')) {
                colonToken = SlimeTokenCreate.createColonToken(colonCst.loc)
            }

            consequent = this.createAssignmentExpressionAst(cst.children[2])
            alternate = this.createAssignmentExpressionAst(cst.children[4])
        }

        return SlimeAstUtil.createConditionalExpression(test, consequent, alternate, cst.loc, questionToken, colonToken)
    }

    createYieldExpressionAst(cst: SubhutiCst): any {
        // yield [*] AssignmentExpression?
        let yieldToken: any = undefined
        let asteriskToken: any = undefined
        let delegate = false
        let startIndex = 1

        // 提取 yield token
        if (cst.children[0] && (cst.children[0].name === 'YieldTok' || cst.children[0].value === 'yield')) {
            yieldToken = SlimeTokenCreate.createYieldToken(cst.children[0].loc)
        }

        if (cst.children[1] && cst.children[1].name === Es6TokenConsumer.prototype.Asterisk?.name) {
            asteriskToken = SlimeTokenCreate.createAsteriskToken(cst.children[1].loc)
            delegate = true
            startIndex = 2
        }
        let argument: any = null
        if (cst.children[startIndex]) {
            argument = this.createAssignmentExpressionAst(cst.children[startIndex])
        }

        return SlimeAstUtil.createYieldExpression(argument, delegate, cst.loc, yieldToken, asteriskToken)
    }

    createAwaitExpressionAst(cst: SubhutiCst): any {
        // await UnaryExpression
        checkCstName(cst, Es6Parser.prototype.AwaitExpression?.name);

        let awaitToken: any = undefined

        // 提取 await token
        if (cst.children[0] && (cst.children[0].name === 'AwaitTok' || cst.children[0].value === 'await')) {
            awaitToken = SlimeTokenCreate.createAwaitToken(cst.children[0].loc)
        }

        const argumentCst = cst.children[1]
        const argument = this.createExpressionAst(argumentCst)

        return SlimeAstUtil.createAwaitExpression(argument, cst.loc, awaitToken)
    }
}

const SlimeCstToAstUtil = new SlimeCstToAst()

export default SlimeCstToAstUtil
