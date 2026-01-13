import {
    SlimeAstTypeName,
    type SlimeModuleDeclaration,
    type SlimeStatement,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
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
    protected abstract hasOvsSyntax: boolean

    // ==================== 导入管理方法 ====================

    /**
     * 处理顶层表达式和自动导入
     * 
     * 职责分离：
     * 1. ensureRequiredImports - 自动添加导入（不改变语句顺序）
     * 2. wrapAsDefineOvsComponent - 包装成组件（内部会重排序）
     * 
     * 只有在需要包装时才会重排序，避免普通 JS 代码被错误重排
     */
    protected processTopLevelAndImports(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
        // 如果没有使用 OVS 语法，直接返回原始 body，保持语句顺序不变
        if (!this.hasOvsSyntax) {
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
    private shouldWrapAsComponent(body: Array<SlimeStatement | SlimeModuleDeclaration>): boolean {
        let hasAnyExport = false
        let hasTopLevelExpression = false

        for (const stmt of body) {
            if (stmt.type === SlimeAstTypeName.ExportDefaultDeclaration ||
                stmt.type === SlimeAstTypeName.ExportNamedDeclaration) {
                hasAnyExport = true
                break
            }
            if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
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
    private ensureRequiredImports(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
        const bodyJson = JSON.stringify(body)

        // 提取现有的 imports
        let imports: any[] = []
        const nonImports: any[] = []

        for (const stmt of body) {
            if (stmt.type === SlimeAstTypeName.ImportDeclaration) {
                imports.push(stmt)
            } else {
                nonImports.push(stmt)
            }
        }

        // 检查并添加必要的导入
        if (bodyJson.includes('$OvsHtmlTag')) {
            imports = this.ensureOvsHtmlTagImport(imports)
        }
        if (bodyJson.includes('defineOvsComponent')) {
            imports = this.ensureDefineOvsComponentImport(imports)
        }

        // 返回：imports 在前，其他语句保持原顺序
        return [...imports, ...nonImports]
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
    private wrapAsDefineOvsComponent(body: Array<SlimeStatement | SlimeModuleDeclaration>): Array<SlimeStatement | SlimeModuleDeclaration> {
        // 分类语句
        let imports: any[] = []
        let declarations: any[] = []
        let expressions: SlimeStatement[] = []
        let otherStatements: any[] = []

        for (const stmt of body) {
            if (stmt.type === SlimeAstTypeName.ImportDeclaration) {
                imports.push(stmt)
            } else if (stmt.type === SlimeAstTypeName.VariableDeclaration ||
                stmt.type === SlimeAstTypeName.FunctionDeclaration ||
                stmt.type === SlimeAstTypeName.ClassDeclaration) {
                declarations.push(stmt)
            } else if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
                expressions.push(stmt as SlimeStatement)
            } else {
                otherStatements.push(stmt)
            }
        }

        // 确保有 defineOvsComponent 导入
        imports = this.ensureDefineOvsComponentImport(imports)

        // 提取表达式值
        const exprValues = expressions.map(e =>
            e.type === SlimeAstTypeName.ExpressionStatement ? (e as any).expression : e
        )

        // 处理单个或多个表达式
        let finalExpr: any
        if (exprValues.length === 1) {
            finalExpr = exprValues[0]
        } else {
            // 多个表达式，使用数组形式
            // 注意：如果需要Fragment包装，用户应自行导入并使用
            finalExpr = SlimeAstCreateUtils.createArrayExpression(
                exprValues.map((expr, index) =>
                    SlimeAstCreateUtils.createArrayElement(
                        expr,
                        index < exprValues.length - 1 ? SlimeTokenCreateUtils.createCommaToken() : undefined
                    )
                )
            )
        }

        // 创建 defineOvsComponent 包装
        // 新的运行时：直接 return finalExpr（VNode）
        const returnStmt = SlimeAstCreateUtils.createReturnStatement(finalExpr)
        const blockStatement = SlimeAstCreateUtils.createBlockStatement([...declarations, ...otherStatements, returnStmt])
        const arrowFunction = SlimeAstCreateUtils.createArrowFunctionExpression(
            blockStatement,
            [SlimeAstCreateUtils.createIdentifier('props')],
            false,
            false
        )
        const defineOvsCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
            [arrowFunction]
        )

        // 重排序：imports 在前，然后是 export default
        return [
            ...imports,
            {
                type: SlimeAstTypeName.ExportDefaultDeclaration,
                declaration: defineOvsCall
            } as any
        ]
    }

    /**
     * 确保有 $OvsHtmlTag 导入
     */
    private ensureOvsHtmlTagImport(imports: any[]): any[] {
        for (const imp of imports) {
            if (imp.source?.value === 'ovsjs') {
                const specs = imp.specifiers || []
                if (!specs.some((s: any) => s.imported?.name === '$OvsHtmlTag' || s.local?.name === '$OvsHtmlTag')) {
                    specs.push({
                        type: SlimeAstTypeName.ImportSpecifier,
                        imported: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
                        local: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag')
                    })
                }
                return imports
            }
        }
        return [{
            type: SlimeAstTypeName.ImportDeclaration,
            specifiers: [{
                type: SlimeAstTypeName.ImportSpecifier,
                imported: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag'),
                local: SlimeAstCreateUtils.createIdentifier('$OvsHtmlTag')
            }],
            source: SlimeAstCreateUtils.createStringLiteral('ovsjs')
        }, ...imports]
    }

    /**
     * 确保有 defineOvsComponent 和 defineReactiveExpression 导入
     */
    private ensureDefineOvsComponentImport(imports: any[]): any[] {
        for (const imp of imports) {
            if (imp.source?.value === 'ovsjs') {
                const specs = imp.specifiers || []
                if (!specs.some((s: any) => s.imported?.name === 'defineOvsComponent' || s.local?.name === 'defineOvsComponent')) {
                    specs.push({
                        type: SlimeAstTypeName.ImportSpecifier,
                        imported: SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
                        local: SlimeAstCreateUtils.createIdentifier('defineOvsComponent')
                    })
                }
                if (!specs.some((s: any) => s.imported?.name === 'defineReactiveExpression' || s.local?.name === 'defineReactiveExpression')) {
                    specs.push({
                        type: SlimeAstTypeName.ImportSpecifier,
                        imported: SlimeAstCreateUtils.createIdentifier('defineReactiveExpression'),
                        local: SlimeAstCreateUtils.createIdentifier('defineReactiveExpression')
                    })
                }
                return imports
            }
        }
        return [{
            type: SlimeAstTypeName.ImportDeclaration,
            specifiers: [
                {
                    type: SlimeAstTypeName.ImportSpecifier,
                    imported: SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
                    local: SlimeAstCreateUtils.createIdentifier('defineOvsComponent')
                },
                {
                    type: SlimeAstTypeName.ImportSpecifier,
                    imported: SlimeAstCreateUtils.createIdentifier('defineReactiveExpression'),
                    local: SlimeAstCreateUtils.createIdentifier('defineReactiveExpression')
                }
            ],
            source: SlimeAstCreateUtils.createStringLiteral('ovsjs')
        }, ...imports]
    }
}
