import { com_slime_parser_cstToAst_SlimeAstCreateUtils as GeneratedSlimeAstCreateUtils } from "@qin/generated-qin-parser-ts/SlimeAstCreateUtils"
import { com_slime_ast_nodes_misc_ImportSpecifier as GeneratedSlimeImportSpecifier } from "@qin/generated-qin-parser-ts/com/slime/ast/nodes/misc/ImportSpecifier"
import { OvsCstToSlimeAstStatement } from "./OvsCstToSlimeAst.Statement"

/**
 * OVS 导入管理层
 * 
 * 负责处理导入相关逻辑：
 * - processTopLevelAndImports: 处理顶层表达式和自动导入
 * - ensureRequiredImports: 确保必要的导入
 * - wrapAsDefineOvsComponent: 包装成组件导出
 */
export abstract class OvsCstToSlimeAstImport extends OvsCstToSlimeAstStatement {

    // 需要从主类访问的状态变量
    protected usesOvsSyntax(): boolean {
        return true
    }

    // ==================== 导入管理方法 ====================

    private createNamedImportSpecifierItem(name: string): any {
        const imported = GeneratedSlimeAstCreateUtils.createIdentifier(name, null)
        const local = GeneratedSlimeAstCreateUtils.createIdentifier(name, null)
        return new GeneratedSlimeImportSpecifier(imported, local, null)
    }

    private createStringLiteralNode(value: string): any {
        return GeneratedSlimeAstCreateUtils.createStringLiteral(value, null, JSON.stringify(value))
    }

    /**
     * 处理顶层表达式和自动导入
     * 
     * 职责分离：
     * 1. ensureRequiredImports - 自动添加导入（不改变语句顺序）
     * 2. wrapAsDefineOvsComponent - 包装成组件（内部会重排序）
     * 
     * 只有在需要包装时才会重排序，避免普通 JS 代码被错误重排
     */
    protected processTopLevelAndImports(body: any[]): any[] {
        // 如果没有使用 OVS 语法，直接返回原始 body，保持语句顺序不变
        if (!this.usesOvsSyntax()) {
            return body
        }

        // 1. 自动添加导入（不改变其他语句顺序）
        body = this.ensureRequiredImports(body)

        // 2. 如果需要包装，才做包装（包装内部会重排序）
        if (this.shouldWrapAsComponent(body)) {
            body = this.wrapAsDefineOvsComponent(body)
        }

        return body
    }

    /**
     * 检查是否需要包装成 defineOvsComponent
     * 
     * 条件：
     * - 使用了 OVS 语法（hasOvsSyntax = true）
     * - 没有任何 export 语句
     * - 有顶层表达式语句
     */
    private shouldWrapAsComponent(body: any[]): boolean {
        let hasAnyExport = false
        let hasTopLevelExpression = false

        for (const stmt of body) {
            const type = this.readAstType(stmt)
            if (type === 'ExportDefaultDeclaration' ||
                type === 'ExportNamedDeclaration') {
                hasAnyExport = true
                break
            }
            if (type === 'ExpressionStatement') {
                hasTopLevelExpression = true
            }
        }

        return !hasAnyExport && hasTopLevelExpression
    }

    /**
     * 自动添加必要的导入语句
     * 
     * 检查 body 中是否使用了 $OvsHtmlTag、defineOvsComponent 等，
     * 如果使用了但没有导入，则在 body 开头添加导入语句。
     * 
     * 注意：只在 body 开头插入导入，不改变其他语句的顺序
     */
    private ensureRequiredImports(body: any[]): any[] {
        // 提取现有的 imports
        let imports: any[] = []
        const nonImports: any[] = []

        for (const stmt of body) {
            if (this.readAstType(stmt) === 'ImportDeclaration') {
                imports.push(stmt as any)
            } else {
                nonImports.push(stmt)
            }
        }

        // 检查并添加必要的导入
        imports = this.ensureOvsHtmlTagImport(imports)
        imports = this.ensureDefineOvsComponentImport(imports)

        // 返回：imports 在前，其他语句保持原顺序
        const result: any[] = []
        for (let index = 0; index < imports.length; index++) {
            result.push(imports[index] as any)
        }
        for (let index = 0; index < nonImports.length; index++) {
            result.push(nonImports[index])
        }
        return result
    }

    /**
     * 包装成 defineOvsComponent 导出
     * 
     * 将顶层表达式包装成：
     * export default defineOvsComponent((props) => {
     *   // declarations 放这里
     *   return expression
     * })
     * 
     * 注意：只有这个方法内部会重排序（imports → export default）
     */
    private wrapAsDefineOvsComponent(body: any[]): any[] {
        // 分类语句
        let imports: any[] = []
        let declarations: any[] = []
        let expressions: any[] = []
        let otherStatements: any[] = []

        for (const stmt of body) {
            const type = this.readAstType(stmt)
            if (type === 'ImportDeclaration') {
                imports.push(stmt as any)
            } else if (type === 'VariableDeclaration' ||
                type === 'FunctionDeclaration' ||
                type === 'ClassDeclaration') {
                declarations.push(stmt)
            } else if (type === 'ExpressionStatement') {
                expressions.push(stmt as any)
            } else {
                otherStatements.push(stmt)
            }
        }

        // 确保有 defineOvsComponent 导入
        imports = this.ensureDefineOvsComponentImport(imports)

        // 提取表达式值
        const exprValues: any[] = []
        for (let index = 0; index < expressions.length; index++) {
            const expressionStatement = expressions[index] as any
            if (this.readAstType(expressionStatement) === 'ExpressionStatement') {
                exprValues.push(this.readAstField(expressionStatement, 'expression'))
            } else {
                exprValues.push(expressionStatement)
            }
        }

        // 处理单个或多个表达式
        let finalExpr: any
        if (exprValues.length === 1) {
            finalExpr = exprValues[0]
        } else {
            // 多个表达式，使用数组形式
            // 注意：如果需要Fragment包装，用户应自行导入并使用
            const elements: any[] = []
            for (let index = 0; index < exprValues.length; index++) {
                const commaToken = index < exprValues.length - 1 ? this.createCommaToken() : undefined
                elements.push(this.createArrayElementNode(exprValues[index], commaToken))
            }
            finalExpr = this.createArrayExpressionNode(elements)
        }

        // 创建 defineOvsComponent 包装
        // 新的运行时：直接 return finalExpr（VNode）
        const returnStmt = this.createReturnStatementNode(finalExpr)
        const blockBody: any[] = []
        for (let index = 0; index < declarations.length; index++) {
            blockBody.push(declarations[index])
        }
        for (let index = 0; index < otherStatements.length; index++) {
            blockBody.push(otherStatements[index])
        }
        blockBody.push(returnStmt)
        const blockStatement = this.createBlockStatementNode(blockBody)
        const arrowFunction = this.createArrowFunctionExpressionAst(
            [this.createIdentifierNode('props')],
            blockStatement,
            false,
            false,
            null
        )
        const defineOvsCall = this.createCallExpressionNode(
            this.createIdentifierNode('defineOvsComponent'),
            this.createCallArguments([arrowFunction])
        )

        // 重排序：imports 在前，然后是 export default
        const result: any[] = []
        for (let index = 0; index < imports.length; index++) {
            result.push(imports[index] as any)
        }
        result.push({
                type: 'ExportDefaultDeclaration',
                declaration: defineOvsCall
            } as any)
        return result
    }

    /**
     * 确保有 $OvsHtmlTag 导入
     */
    private ensureOvsHtmlTagImport(imports: any[]): any[] {
        return [{
            type: 'ImportDeclaration',
            specifiers: [
                this.createNamedImportSpecifierItem('$OvsHtmlTag'),
                this.createNamedImportSpecifierItem('defineOvsComponent'),
                this.createNamedImportSpecifierItem('defineReactiveExpression')
            ],
            source: this.createStringLiteralNode('ovsjs')
        }, ...imports]
    }

    /**
     * 确保有 defineOvsComponent 和 defineReactiveExpression 导入
     */
    private ensureDefineOvsComponentImport(imports: any[]): any[] {
        return imports
    }
}
